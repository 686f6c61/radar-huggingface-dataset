# colonelwatch/Ornith-1.5-35B-A3B-DFlash2-exl3-4.0bpw

## Resumen

Ornith-1.5-35B-A3B-DFlash2-exl3-4.0bpw es una cuantización EXL3 (ExLlamaV3) a 4.0 bits por peso con receta `-hq` del modelo de borrador especulativo Ornith-1.5-35B-A3B-DFlash2, publicado por el usuario colonelwatch. No se trata de un modelo generativo completo, sino de un modelo de draft para decodificación especulativa: predice tokens candidatos que un modelo objetivo (target) verifica en paralelo, acelerando la inferencia sin alterar la distribución de salida del modelo grande. El modelo base original lo desarrolla Resolvo Cloud y deriva de la familia Ornith de ornith-ai.

El checkpoint base se construye con la receta `no-op-graft + selector-training` sobre los pesos del tronco de Ornith-1.5-35B-A3B-DFlash (DFlashV1), que se copian literalmente. Las convoluciones `attention_conv` y `mlp_conv` se injertan como identidad y el selector de candidatos (`hidden_projection` más codebooks de predecesor/sucesor) se entrena sobre características capturadas del modelo objetivo cuantizado a 4 bits, con 741 muestras y margen de hard-negatives top-16.

Su relevancia es práctica: el autor reporta una aceleración de 1.65x frente a 1.05x de DFlash V1 y 1.32x de una variante DFlash2 entrenada en bf16, precisamente porque el selector se calibró sobre los estados ocultos del target cuantizado que se va a desplegar. El repositorio ocupa 0.5 GB y declara 227.714.560 parámetros en safetensors, un dato que no concuerda con la nomenclatura "35B-A3B" del nombre y que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (modelo de borrador para decodificacion especulativa); tronco derivado de DFlashV1, hidden 2048, dynamic 512, conv_group_size 16, block_size 8, selector top_k 16 |
| Parametros totales | 227.714.560 segun safetensors del repo (el nombre del modelo base indica 35B-A3B; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (el nombre del base sugiere un esquema MoE con 3B activos, pero la model card no lo detalla) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw con receta `-hq` (este repo); el modelo base se distribuye en otros formatos no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `architectures: ["DFlash2DraftModel"]` y el nucleo de contexto `Hidden2048` de RichEngine, `draft_conv_h2048`) |

## Arquitectura y entrenamiento

El modelo es un draft especulativo, no un transformer generativo autónomo. Su tronco son los pesos de Ornith-1.5-35B-A3B-DFlash (DFlashV1) copiados sin modificar. Sobre esa base se injertan las convoluciones `attention_conv` y `mlp_conv` como identidad (self-tap unitario y correcciones dinámicas a cero), de modo que el grafo resultante conserva la estructura DFlash2 sin alterar la función del tronco. El componente entrenado es únicamente el selector de candidatos: una `hidden_projection` más codebooks de predecesor y sucesor que eligen, entre las propuestas del draft, las más probables dado el contexto.

El entrenamiento del selector se realizó sobre características capturadas del modelo objetivo cuantizado a 4 bits (no del modelo en bf16), con 741 muestras, margen de hard-negatives top-16 y convoluciones congeladas. Esta decisión es la innovación clave: una variante DFlash2 entrenada en bf16 (jzinno/Ornith-1.5-35B-A3B-DFlash2) rinde peor sobre el target cuantizado porque su selector está calibrado para estados ocultos en bf16. Al calibrar sobre las features reales del cuantizado desplegado, el checkpoint escala con el número de lanes empaquetados. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Decodificación especulativa: genera tokens candidatos que un modelo objetivo verifica en paralelo, con block_size 8 y selector top_k 16.
- Aceleración de inferencia sobre el target cuantizado: reporta 190.1 tok/s en modo serial y 316.8 tok/s en modo packed B4 sobre un M5 Pro.
- Compatibilidad con el motor RichEngine: requiere el núcleo de contexto `Hidden2048` (`draft_conv_h2048`) para funcionar.
- No genera texto de forma autónoma: su salida es una propuesta de tokens que el target valida; no sustituye al modelo grande.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, thinking mode ni soporte multilingüe propias de este draft.

## Casos de uso

- Aceleración de un servidor de inferencia con Ornith-1.5-35B-A3B cuantizado a 4 bits: emparejar este draft con el target EXL3 permite pasar de 142.8 a 190.1 tok/s en serial y hasta 316.8 tok/s en packed B4 según las mediciones del autor, reduciendo coste por token en producción.
- Despliegue en hardware Apple Silicon: las pruebas se hicieron en un M5 Pro, por lo que es adecuado para entornos de desarrollo y prototipado sobre Mac con el motor RichEngine.
- Sustitución de un draft DFlash2 entrenado en bf16 cuando el target está cuantizado: el selector calibrado sobre features del cuantizado evita la degradación de aceptación que sufre la variante bf16.
- Servicio de chat interactivo de baja latencia: al aumentar el throughput de decodificación, mejora el tiempo hasta el primer token percibido en conversaciones multi-turno con el modelo grande.
- Evaluación comparativa de estrategias de decodificación especulativa: sirve como referencia reproducible para medir el impacto de calibrar el selector sobre el target real frente a calibraciones en precisión completa.
- Integración en pipelines de generación de código o texto largo donde el cuello de botella es la decodificación autoregresiva del modelo de 35B, no la calidad del draft.

## Benchmarks y rendimiento

| Draft | Serial (tok/s) | Packed B4 (tok/s) | Speedup |
|---|---|---|---|
| Ornith-1.5-35B-A3B-DFlash (V1) | 142.8 | 147.4 | 1.05x |
| jzinno/Ornith-1.5-35B-A3B-DFlash2 (bf16-trained) | 78.3 | 114.6 | 1.32x |
| Este checkpoint | 190.1 | 316.8 | 1.65x |

Mediciones del autor sobre M5 Pro, `opencode_sim` con n=4, en modo engine decode. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, lo que es esperable al tratarse de un draft y no de un modelo generativo evaluable de forma estándar.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0.5 GB en EXL3 4.0 bpw; el consumo en ejecución depende del target con el que se empareje, no solo del draft.
- GPU recomendadas: no se especifican en la información disponible; las mediciones se realizaron en un Apple M5 Pro, no en GPU NVIDIA.
- Cabe en GPU de consumo: por tamaño del draft sí, pero requiere el motor RichEngine y el target cuantizado compatible, lo que limita el ecosistema de despliegue.
- Opciones de despliegue: RichEngine con el núcleo `Hidden2048` (`draft_conv_h2048`) y ExLlamaV3 para los pesos EXL3; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 190.1 tok/s en serial y 316.8 tok/s en packed B4 sobre M5 Pro según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (EXL3 4.0 bpw) | Draft DFlash2 cuantizado | 227.714.560 segun safetensors | no disponible | 1.65x speedup (M5 Pro) | Apache 2.0 | Hugging Face |
| Ornith-1.5-35B-A3B-DFlash (V1) | Draft DFlashV1 | no disponible | no disponible | 1.05x speedup | no disponible | Hugging Face |
| jzinno/Ornith-1.5-35B-A3B-DFlash2 | Draft DFlash2 entrenado en bf16 | no disponible | no disponible | 1.32x speedup | no disponible | Hugging Face |
| resolvo-cloud/Ornith-1.5-35B-A3B-DFlash2 | Draft DFlash2 base | no disponible | no disponible | no disponible | Apache 2.0 (segun este repo) | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: sin un target compatible y el motor RichEngine no produce salidas útiles.
- Dependencia fuerte del target: el selector está calibrado sobre las features de un cuantizado 4-bit concreto; cambiar de cuantización o de precisión del target puede degradar la tasa de aceptación.
- Discrepancia de parámetros: el safetensors declara 227.714.560 parámetros frente al "35B-A3B" del nombre del modelo base; conviene verificar el contenido real del repo antes de integrarlo.
- Sin datos de sesgos, alucinación o comportamiento multilingüe: al ser un draft, la calidad final la determina el target, pero no hay evaluación publicada.
- Ecosistema limitado: no se documenta soporte en vLLM, llama.cpp, Ollama o TGI, lo que restringe su uso a entornos con RichEngine y ExLlamaV3.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del target con el que se empareje.
- Repositorio sin descargas ni likes y creado en 2026-11-13: madurez y mantenimiento no verificables.
- Requiere `custom_code` y confianza en el código remoto del repositorio para cargar los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/colonelwatch/Ornith-1.5-35B-A3B-DFlash2-exl3-4.0bpw
- Modelo base: https://huggingface.co/resolvo-cloud/Ornith-1.5-35B-A3B-DFlash2
- Draft DFlash2 entrenado en bf16 (referencia comparativa): https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo objetivo citado en la model card: ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit (ruta indicada en la informacion disponible, sin URL verificada)
- Tronco DFlashV1 citado: ornith-ai/Ornith-1.5-35B-A3B-DFlash (ruta indicada en la informacion disponible, sin URL verificada)
