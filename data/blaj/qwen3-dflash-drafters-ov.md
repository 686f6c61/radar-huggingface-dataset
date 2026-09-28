# blaj/Qwen3-DFlash-drafters-ov

## Resumen

Qwen3-DFlash-drafters-ov es una conversión a OpenVINO IR de los modelos drafter DFlash de Z-Lab para la familia Qwen3, publicada por el usuario blaj. No es un modelo independiente: se trata de cabezas drafter de 5 capas que leen los estados ocultos de las capas 1, 9, 17, 25 y 33 de un transformer Qwen3 objetivo de 36 capas, y proponen tokens candidatos que el modelo objetivo verifica después dentro de un esquema de decodificación especulativa por difusión de bloque. El repositorio empaqueta cuatro variantes: drafter para Qwen3-4B y para Qwen3-8B, cada uno en int4 (group size 16) e int8.

La relevancia de esta publicación es de infraestructura más que de modelado. Existen más de 40 conversiones OpenVINO de Qwen3-4B y Qwen3-8B en HuggingFace, pero ninguna empareja con un drafter DFlash porque el export estándar de `optimum-cli` no expone los metadatos de localización de estados ocultos que el drafter necesita, de modo que el runtime cae silenciosamente a decodificación solo con el objetivo. Los objetivos companion de este autor (`blaj/Qwen3-4B-DFlash-ov-int4` y `blaj/Qwen3-8B-DFlash-ov-int4`) sí exportan esos metadatos, lo que permite activar la estrategia `DFlash` en OpenVINO Model Server.

El autor documenta con honestidad que, en el hardware probado (Intel Core Ultra 7 258V con iGPU Arc 130V/140V y OpenVINO Model Server 2026.4.0 sobre GPU), el drafter es más lento que no usarlo: 0,74x y 0,72x de ratio frente al baseline. La corrección está verificada (salida greedy byte a byte idéntica), pero el beneficio de throughput no se materializa en objetivos pequeños y hardware relativamente capaz, donde el coste fijo por bloque domina sobre los tokens aceptados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas drafter DFlash de 5 capas sobre transformer Qwen3; leen estados ocultos de las capas [1, 9, 17, 25, 33] de un objetivo de 36 capas |
| Parametros totales | no disponible (el repo completo ocupa 2,7 GB e incluye cuatro variantes; no se detalla el recuento por variante) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con group size 16 e int8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + binario asociado) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza drafter de 5 capas integrada en el esquema DFlash (block diffusion para decodificación especulativa rápida). Cada variante declara una entrada `hidden_states` de forma fija: `[?, ?, 12800]` para el drafter de Qwen3-4B (5 × 2560) y `[?, ?, 20480]` para el de Qwen3-8B (5 × 4096), correspondiente a la concatenación de los estados ocultos de las cinco capas objetivo seleccionadas. Cada grafo expone `beam_idx` (es stateful, con caché) y una única salida `last_hidden_state`.

No se proporciona información sobre el entrenamiento del drafter (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de conversión, que constituye la innovación técnica del repositorio: los checkpoints originales incluyen código de modelado personalizado, por lo que el export no puede hacerse con `optimum-cli` y requiere la clase parcheada `Qwen3DFlashForCausalLM` de Optimum, con `tie_word_embeddings = False` y `dflash = True` en la configuración. Es obligatorio usar `use_past_in_inputs=True` en el export; sin ello, el grafo queda sin estado y todas las propuestas del drafter son rechazadas. La verificación posterior consiste en comprobar que el modelo expone la entrada `beam_idx`.

## Capacidades

- Decodificación especulativa por difusión de bloque: propone tokens candidatos por bloque que el modelo objetivo Qwen3 verifica, y bajo decodificación greedy la salida resultante es byte a byte idéntica a la del objetivo sin drafter.
- Aceleración condicionada: su función es reducir el coste por token generado cuando el objetivo es caro de ejecutar o el dispositivo es débil; el beneficio depende del ratio de aceptación y del coste fijo por bloque.
- Integración con OpenVINO Model Server: se enlaza con el objetivo mediante `draft_models_path` en `graph.pbtxt`, y el emparejamiento correcto se confirma con los mensajes `Draft model strategy: DFlash` y `state: AVAILABLE`.
- Compatibilidad int4 e int8 dentro del mismo repositorio, con int4 en group size 16 alineado con la rejilla de sub-bloques de los checkpoints de estilo Q4_K.
- No soporta generación de texto de forma autónoma, tool calling, uso como agente, visión ni audio: es exclusivamente una cabeza drafter.
- Idiomas: no disponible (heredados del objetivo Qwen3, pero no se declaran en la ficha).

## Casos de uso

- Despliegue de decodificación especulativa sobre OpenVINO Model Server: se configura el objetivo con `draft_models_path` apuntando al directorio del drafter y se comprueba en el log que la estrategia DFlash queda disponible. Es el escenario principal para el que se publica el repositorio.
- Inferencia local en equipos con iGPU Intel Arc: el autor valida el emparejamiento en un Core Ultra 7 258V; útil para portátiles y mini-PC sin GPU dedicada cuando el objetivo elegido es lo bastante caro.
- Servicio de generación de texto con Qwen3-8B int4 en hardware Intel sin acelerador externo, aprovechando que el drafter no añade requisitos de memoria significativos frente al objetivo.
- Reducción de latencia en objetivos mayores o dispositivos más débiles: el autor indica explícitamente que el mismo drafter debería aportar beneficio cuando el coste del objetivo domina, por lo que encaja en escenarios de objetivos más grandes que los probados.
- Validación y benchmarking de speculative decoding en OpenVINO: el repositorio sirve como banco de pruebas reproducible para medir ratios de aceptación y throughput frente al baseline sin drafter.
- Verificación de pairing en pipelines de CI: el script de comprobación de `beam_idx` y el mensaje `state: AVAILABLE` permiten automatizar la validación de que un objetivo y un drafter están correctamente emparejados antes de desplegar.
- Investigación sobre el equilibrio coste fijo / tokens aceptados: útil para estudiar empíricamente cuándo la decodificación especulativa compensa y cuándo no, dado que este repositorio documenta un caso donde no lo hace.
- Migración de stacks de decodificación especulativa a OpenVINO: sirve de referencia para exportar otros drafters con el mismo mecanismo de metadatos de estados ocultos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados corresponden a una medición propia del autor y no a benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), que no están disponibles. Entorno: Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificación greedy, media de 4 ejecuciones.

| Objetivo | Sin drafter | Con este drafter | Ratio |
|---|---|---|---|
| Qwen3-4B int4 | 38,8 tok/s | 28,6 tok/s | 0,74x |
| Qwen3-8B int4 | 22,9 tok/s | 16,6 tok/s | 0,72x |

El autor indica que la salida greedy fue byte a byte idéntica con y sin drafter en ambos casos, de modo que el emparejamiento funciona correctamente; el drafter simplemente no se amortiza en estos objetivos sobre este hardware. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita por variante. El repositorio completo ocupa 2,7 GB y contiene cuatro variantes (4B y 8B, en int4 e int8), por lo que cada una es sustancialmente menor.
- Memoria adicional: el drafter debe coexistir en memoria con el modelo objetivo Qwen3 correspondiente, que es quien domina el consumo.
- Hardware validado por el autor: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM, ejecutando OpenVINO Model Server 2026.4.0 sobre GPU.
- GPU dedicadas recomendadas: no disponible (no se documentan pruebas en A100, H100 ni RTX 4090).
- Cabe en GPU de consumo: sí en el sentido de que la iGPU Arc del equipo probado lo ejecuta, si bien el autor reporta menor throughput que sin drafter en ese entorno.
- Opciones de despliegue: OpenVINO Runtime y OpenVINO Model Server (OVMS). Existe una implementación separada de DFlash para vLLM y otra para MLX en el repositorio de Z-Lab, pero no son el formato de este repositorio.
- Latencia y throughput: 16,6 tok/s con drafter y 22,9 tok/s sin drafter sobre Qwen3-8B int4; 28,6 frente a 38,8 tok/s sobre Qwen3-4B int4, en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blaj/Qwen3-DFlash-drafters-ov | Drafter DFlash para Qwen3-4B y Qwen3-8B en OpenVINO IR | no disponible (cabeza de 5 capas; repo de 2,7 GB) | no disponible | 16,6-28,6 tok/s junto al objetivo | apache-2.0 | HuggingFace |
| Qwen3-4B / Qwen3-8B int4 sin drafter | Objetivo Qwen3, decodificación estándar | 4B / 8B | no disponible en esta ficha | 22,9-38,8 tok/s | apache-2.0 | HuggingFace |
| blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov | Drafter DFlash para Qwen3.5-9B en OpenVINO | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| z-lab/dflash (implementaciones MLX y vLLM) | Framework DFlash original, soporte para Qwen3, Qwen3.5, Qwen3.6, Gemma 4, Qwen3.8-27B | no disponible | no disponible | no disponible (el blog de Inco AI cita cerca de 3x frente a decodificación autorregresiva) | no disponible | GitHub, vLLM, MLX |

No se dispone de datos de comparación directa frente a otras cabezas drafter (por ejemplo, EAGLE-3) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere un objetivo Qwen3 con localizadores de estados ocultos compatibles. Sin ellos, el runtime ignora el drafter y decodifica solo con el objetivo.
- Es específico del objetivo: el ratio de aceptación cae bruscamente si se empareja con un fine-tune distinto del previsto.
- En el hardware probado el throughput es inferior al baseline (0,72x-0,74x); el beneficio no está garantizado y depende del objetivo y del dispositivo.
- El export estándar con `optimum-cli` no es válido para estos checkpoints; es necesario el flujo con la clase parcheada y `use_past_in_inputs=True`. Omitir este último provoca el rechazo de todas las propuestas.
- No se documentan sesgos, riesgos de alucinación propios ni limitaciones de idioma, ya que el drafter no genera texto de forma autónoma; estos aspectos dependen del modelo objetivo Qwen3.
- Licencia apache-2.0, que permite uso comercial, pero el aviso de atribución señala que los drafters originales son de Z-Lab y Qwen3 es de su autor correspondiente, ambos bajo Apache-2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validación por parte de la comunidad más allá de las mediciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3-DFlash-drafters-ov
- Objetivo companion Qwen3-4B: https://huggingface.co/blaj/Qwen3-4B-DFlash-ov-int4
- Objetivo companion Qwen3-8B: https://huggingface.co/blaj/Qwen3-8B-DFlash-ov-int4
- Drafter original Qwen3-4B: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- Drafter original Qwen3-8B: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Repositorio DFlash de Z-Lab: https://github.com/z-lab/dflash
- Documentación de qwen3_dflash en vLLM: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/qwen3_dflash/
- Blog de Inco AI sobre DFlash 2: https://inco.ai/blog/dflash2/
- Otra conversión del mismo autor para Qwen3.5-9B: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov
- Variante int4 para Qwen3.5-9B: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov
