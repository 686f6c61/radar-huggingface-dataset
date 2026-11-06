# ConwayResearch/Underdog-Poodle-4B-DFlash

## Resumen

Underdog Poodle 4B DFlash es un modelo borrador (draft model) para decodificacion especulativa desarrollado por ConwayResearch. No es un modelo de lenguaje autónomo: su funcion es acompañar al modelo principal [Underdog Poodle 4B](https://huggingface.co/ConwayResearch/Underdog-Poodle-4B) y proponer hasta 15 tokens por paso, que Poodle verifica en una sola pasada hacia adelante. El modelo principal acepta o rechaza cada token propuesto, por lo que la distribucion de salida es identica a la que obtendria sin borrador.

Es un fine-tuning de z-lab/Qwen3.5-4B-DFlash, adaptado especificamente al vocabulario y los estados ocultos de Underdog Poodle 4B. La innovacion principal es que reutiliza la tabla de embeddings y la cabeza de salida de Poodle (no tiene las suyas propias), lo que reduce su tamaño a unos 634 millones de parametros en bf16. Segun los datos publicados por el autor, acelera a Poodle entre 1,8x y 4,2x en un H100 con vLLM 0.31, dependiendo de la carga de trabajo, con las mayores ganancias en llamadas a herramientas y episodios de agentes.

Su relevancia actual radica en la decodificacion especulativa como tecnica estandar para reducir latencia de inferencia: en lugar de entrenar una cabeza MTP (multi-token prediction) integrada, este enfoque usa un borrador externo afinado que consigue tasas de aceptacion superiores (4,20 tokens aceptados por paso frente a 3,33 del borrador original en episodios de agente con 32 peticiones concurrentes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificacion especulativa (6 capas decoder estilo Qwen3, metodo DFlash) |
| Parametros totales | 634.425.856 (aprox. 634M, en bf16) |
| Parametros activos | No aplicable (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | Ventana deslizante de 4.096 tokens en 5 capas, atencion completa en 1 capa (limitado por el modelo principal Poodle) |
| Tipos de cuantizacion | bf16 (no disponible otra cuantizacion) |
| Idiomas soportados | No disponible (hereda los del modelo principal Underdog Poodle 4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1,6 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo consta de seis capas de decoder estilo Qwen3 con tamaño oculto (hidden size) de 2560. Cinco de las capas usan atencion con ventana deslizante de 4.096 tokens y una capa usa atencion completa. Carece de tabla de embeddings y de cabeza de salida propias: las toma prestadas del modelo principal, Underdog Poodle 4B, lo que explica su tamaño reducido de 634M de parametros.

Su mecanismo de funcionamiento es el siguiente: lee los estados ocultos de Poodle desde las capas 1, 5, 9, 13, 17, 21, 25 y 29, y rellena un bloque de posiciones enmascaradas en una sola pasada (con tamaño de bloque 16), proponiendo hasta 15 tokens por paso. Es un fine-tuning de z-lab/Qwen3.5-4B-DFlash, un borrador que comparte arquitectura con la familia Qwen3.5. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO para este borrador en concreto.

## Capacidades

Al no ser un modelo de lenguaje independiente, sus capacidades son las de un acelerador de inferencia:

- Generacion de borradores de hasta 15 tokens por paso de verificacion, verificados por el modelo principal sin alterar la distribucion de salida.
- Aceleracion de 1,8x a 4,2x en un H100 con vLLM 0.31, segun la carga de trabajo.
- Mejor rendimiento relativo en cargas donde el modelo principal pasa mas tiempo: llamadas a herramientas (2,9x en BFCL) y episodios de agentes (2,2x).
- Tokens aceptados por paso de verificacion superiores al borrador base Qwen3.5-4B-DFlash: 4,20 frente a 3,33 en episodios de agente; 6,01 frente a 4,22 en BFCL; 3,98 frente a 3,84 en IFEval (con 32 peticiones concurrentes).
- Configuracion flexible del numero de tokens especulativos: 15 para latencia de usuario unico, 7 para alto rendimiento con muchas peticiones concurrentes.

## Casos de uso

- Servido de agentes conversacionales con herramientas: en episodios multi-turno con tool calling, el borrador reduce la latencia un 2,2x (de 210 a 462 tokens/s), lo que mejora la experiencia de usuario en asistentes que encadenan llamadas a funciones.
- Pipelines de generacion de codigo: en HumanEval alcanza 925 tokens/s frente a 222 sin borrador (4,2x), util para autocompletado y generacion de codigo en IDEs o servicios de bajo tiempo de respuesta.
- Ejecucion de benchmarks de razonamiento matematico a escala: en GSM8K triplica el throughput (677 tokens/s frente a 222), util para evaluaciones masivas de modelos.
- Atencion al cliente automatizada con alto volumen: con 32 peticiones en vuelo, configurar 7 tokens especulativos por paso maximiza el throughput agregado, adecuado para despliegues con muchas sesiones simultaneas.
- Cumplimiento de instrucciones en produccion: en IFEval mantiene 451 tokens/s (2,0x), util para servicios que deben generar respuestas largas siguiendo restricciones de formato.
- Integracion en vLLM existente: se despliega con una sola configuracion de `--speculative-config` junto al modelo principal, sin cambios en el codigo de la aplicacion.

## Benchmarks y rendimiento

Los datos publicados corresponden a throughput de generacion (tokens de salida por segundo), no a benchmarks de calidad. Mediciones en una H100 80GB con vLLM 0.31, thinking activado, temperatura 0,6, top_p 0,95, top_k 20, hasta 2.048 tokens de salida y 12 prompts por carga:

| Carga | Sin borrador | Cabeza MTP integrada (3 tokens) | Qwen3.5-4B-DFlash (15 tokens) | Este borrador (15 tokens) |
|---|---|---|---|---|
| Episodios de agente multi-turno con herramientas | 210 | 386 | 350 | 462 (2,2x) |
| Llamadas a herramientas BFCL | 213 | 455 | 456 | 621 (2,9x) |
| IFEval | 222 | 404 | 376 | 451 (2,0x) |
| GSM8K | 222 | 460 | 655 | 677 (3,0x) |
| HumanEval | 222 | 499 | 950 | 925 (4,2x) |
| MT-Bench | 222 | 380 | 401 | 395 (1,8x) |

No se han publicado resultados de benchmarks de calidad (MMLU, precisión en tareas, etc.) para este borrador, lo cual es esperable: al ser decodificacion especulativa con verificacion del modelo principal, la calidad de salida es identica a la de Poodle sin borrador.

## Requisitos de hardware

- VRAM estimada: unos 1,6 GB adicionales en bf16 sobre lo que ya consume Underdog Poodle 4B (los pesos del borrador); el modelo principal debe estar cargado en la misma instancia.
- GPU de referencia en las mediciones: NVIDIA H100 80GB.
- Al compartir embeddings y cabeza de salida con Poodle, el coste de memoria del borrador es menor que el de un modelo de 634M standalone.
- Despliegue soportado: vLLM 0.31 o superior con el metodo `dflash`. No se menciona soporte en llama.cpp, Ollama, TGI u otros runtimes.
- Comando de despliegue recomendado por el autor: `vllm serve ConwayResearch/Underdog-Poodle-4B --speculative-config '{"method": "dflash", "model": "ConwayResearch/Underdog-Poodle-4B-DFlash", "num_speculative_tokens": 15}' --tool-call-parser qwen3_coder --reasoning-parser qwen3 --enable-auto-tool-choice`.
- Latencia/throughput: 395-677 tokens/s de salida en usuario unico segun carga; con 32 peticiones concurrentes, 3,98-6,01 tokens aceptados por paso de verificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Notas |
|---|---|---|---|---|
| Underdog Poodle 4B DFlash | Draft model DFlash | 634M | Apache-2.0 | Especifico para Underdog Poodle 4B; hasta 15 tokens por paso |
| z-lab/Qwen3.5-4B-DFlash | Draft model DFlash | No disponible | Apache-2.0 | Borrador base del que deriva; 32-36% mas lento en cargas de agentes y herramientas |
| Cabeza MTP integrada de Poodle | Multi-token prediction integrada | No disponible | No disponible | Solo propone 3 tokens por paso; 1,8x-2,1x frente a 2,0x-4,2x de este borrador |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no genera texto util por si solo y requiere servir Underdog Poodle 4B junto a el.
- Depende de vLLM 0.31 o superior con soporte del metodo `dflash`; no hay ruta de despliegue documentada para llama.cpp, Ollama o TGI.
- La etiqueta `custom_code` en Hugging Face indica que puede requerir codigo personalizado para cargarse; conviene revisar el repo antes de usarlo en entornos restringidos.
- La ganancia de velocidad depende de la carga: en MT-Bench solo alcanza 1,8x, y en cargas muy concurrentes conviene reducir los tokens especulativos de 15 a 7.
- No se ha publicado informacion sobre sesgos, riesgo de alucinacion o cobertura idiomatica del borrador; la calidad de salida hereda integramente la del modelo principal.
- Las mediciones de rendimiento provienen del propio autor del modelo y usan un numero reducido de prompts (12 por carga), por lo que los resultados pueden no generalizar a todos los escenarios.
- El modelo es muy reciente (creado en octubre de 2026) y tiene muy pocas descargas (38), por lo que tiene poca validacion comunitaria.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B-DFlash
- Modelo principal (Underdog Poodle 4B): https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Modelo base (z-lab/Qwen3.5-4B-DFlash): https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Paper, blog o demo: no disponible
