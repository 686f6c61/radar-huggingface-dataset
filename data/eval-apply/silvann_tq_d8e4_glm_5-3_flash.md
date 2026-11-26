# eval-apply/silvann_tq_D8E4_glm_5.3_flash

## Resumen

silvann_tq_D8E4_glm_5.3_flash es un empaquetado cuantizado del modelo GLM 5.3 Flash de Z.AI, preparado por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tuning: los pesos subyacentes son los de GLM 5.3 Flash y este repositorio solo cambia la forma en que se almacenan, aplicando una rotación Hadamard bloqueada con signos sobre el eje de entrada de cada matriz de pesos y cuantización TurboQuant con escala por fila.

El pack reduce 598,5 GiB de pesos en bruto a 153,8 GiB, una compresión de aproximadamente 3,9 veces, manteniendo sin pérdida las normas, los routers, los mapas de hiperconexión y otros tensores pequeños, y dejando el embedding y la cabeza en 8 bits. La política de anchos es D8E4: la parte densa (atención, expertos compartidos y MLP densos) a 8 bits y los expertos enrutados a 4 bits.

Su relevancia es práctica: permite ejecutar un modelo de gran tamaño en hardware mucho más modesto que el necesario para los pesos originales, a costa de depender de un runtime específico (SiLVANN v0.18.1 o superior) en lugar de transformers. El formato es `silvann-packed-v3`, descrito por `pack.json` y organizado en registros por capa, con el tokenizador, la plantilla de chat y las configuraciones originales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM 5.3 Flash de Z.AI; el pack no detalla la arquitectura interna) |
| Parametros totales | no disponible (pesos en bruto de 598,5 GiB) |
| Parametros activos | no disponible (el pack menciona expertos enrutados y expertos compartidos, lo que sugiere arquitectura MoE, sin cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TurboQuant con rotacion Hadamard bloqueada y escala por fila; politica D8E4 (densa a 8 bits, expertos enrutados a 4 bits); embedding y cabeza a 8 bits; tensores pequeños sin perdida |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | silvann-packed-v3 (no compatible con transformers; requiere runtime SiLVANN) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base GLM 5.3 Flash más allá de la presencia de atención, expertos compartidos, expertos enrutados y MLP densos, lo que apunta a un transformer con mezcla de expertos. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; todos estos datos corresponden al modelo original de Z.AI y no se incluyen en la model card del pack.

La innovación técnica de este repositorio es el propio esquema de compresión. Cada matriz de pesos se rota a lo largo de su eje de entrada mediante una rotación Hadamard bloqueada combinada con signos, y después se cuantiza con TurboQuant usando una escala por fila. Los expertos enrutados se almacenan con su gate y su up en un único registro junto al down, de modo que leer un experto del disco requiere una sola operación en lugar de cinco en versiones anteriores a SiLVANN v0.18.1. El pack incluye además una torre de visión dentro de `global.pkl`, junto al embedding, la cabeza y la norma final.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base GLM 5.3 Flash, aunque la model card no las detalla.
- Procesamiento de visión: el pack conserva una torre de visión en `global.pkl`, lo que indica capacidad multimodal de entrada de imagen.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Modo thinking: no disponible en la información proporcionada.
- Compatibilidad de tokenizador y plantilla de chat: se conservan los originales del modelo base.

## Casos de uso

- Despliegue de GLM 5.3 Flash en hardware con menos de 160 GiB de almacenamiento de pesos: el pack reduce el espacio de 598,5 GiB a 153,8 GiB, lo que permite alojar el modelo en nodos con menos VRAM o con pesos en disco y carga por capas mediante SiLVANN.
- Evaluación comparativa de cuantizaciones: al existir un pack D4E4 con los mismos expertos enrutados byte a byte, se puede medir el efecto de ampliar solo la parte densa de 4 a 8 bits (perplejidad 3,018 frente a 3,095 en WikiText-2) con coste de 3 GiB adicionales.
- Investigación sobre compresión de pesos: la combinación de rotación Hadamard bloqueada, signos y escala por fila constituye un caso de estudio reproducible para analizar el impacto de la rotación previa a la cuantización en modelos con expertos.
- Inferencia multimodal en entornos controlados: la torre de visión conservada permite experimentar con entradas de imagen siempre que se use el runtime SiLVANN.
- Servicio de generación de texto de larga duración en infraestructura propia: al ser un pack de solo lectura con licencia MIT, encaja en despliegues internos donde el equipo controla la pila de inferencia.
- Reproducción de resultados de perplejidad: las ventanas de 512 tokens sobre WikiText-2 permiten validar la integridad del pack tras la descarga y comparar configuraciones del motor.

## Benchmarks y rendimiento

| Metrica | D8E4 (este pack) | D4E4 (pack hermano) |
|---|---|---|
| Perplejidad en WikiText-2 (test, 16 ventanas de 512 tokens) | 3,018 | 3,095 |
| Bits por byte | 0,3584 | 0,3666 |
| Peso en disco | 153,8 GiB | 150,8 GiB (inferido de la diferencia de 3 GiB) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 153,8 GiB para los pesos empaquetados; se recomienda margen adicional para caché y ficheros temporales.
- VRAM estimada para inferencia: no disponible con precisión; el pack completo no cabe en GPU de consumo y requiere cargar los expertos desde disco o memoria del sistema según el motor SiLVANN.
- GPU recomendadas: no disponibles en la información proporcionada; por volumen de pesos, el despliegue completo apunta a nodos multi-GPU de centro de datos (A100, H100 u equivalentes), sin confirmación del autor.
- GPU de consumo: no cabe en RTX 4090 ni en tarjetas de 24 GB con los 153,8 GiB de pesos; solo sería viable una carga parcial por capas si el runtime lo permite, algo no documentado.
- Opciones de despliegue: exclusivamente el runtime SiLVANN v0.18.1 o superior; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D8E4_glm_5.3_flash | no disponible (598,5 GiB en bruto) | no disponible | silvann-packed-v3 | MIT | SiLVANN >= 0.18.1 |
| silvann_tq_D4E4_glm_5.3_flash (pack hermano) | mismos pesos base | no disponible | silvann-packed-v3 | MIT | SiLVANN >= 0.18.1 |
| GLM 5.3 Flash original (Z.AI) | no disponible | no disponible | safetensors (presumible) | MIT | transformers y otros |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime: los pesos solo los lee SiLVANN; no funcionan con transformers, vLLM ni llama.cpp, lo que limita la portabilidad y ata el despliegue al mantenimiento de ese motor.
- Versión mínima obligatoria: se requiere SiLVANN v0.18.1 o posterior para el diseño de registros por experto; las copias descargadas antes de esa versión siguen funcionando con las versiones posteriores, pero no al contrario.
- Pérdida de calidad por cuantización: la parte densa a 8 bits y los expertos a 4 bits introducen degradación medible (perplejidad 3,018 frente a los pesos originales, cuyo valor no se reporta).
- Idiomas y sesgos: no se declaran idiomas soportados ni evaluaciones de sesgo; no hay datos para afirmar un comportamiento multilingüe fiable.
- Riesgo de alucinación: no evaluado en la información disponible.
- Contexto: la longitud de contexto del modelo base no se documenta en el repositorio, por lo que no puede garantizarse para casos que dependan de ventanas largas.
- Uso comercial: la licencia MIT se hereda del modelo original y permite uso comercial, pero la viabilidad práctica depende de la licencia y madurez del motor SiLVANN, no cubierta aquí.
- Crédito y mantenimiento: el repositorio es un empaquetado de terceros; la calidad del modelo subyacente es responsabilidad de Z.AI y el soporte del formato depende del autor del pack.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8E4_glm_5.3_flash
- Modelo base GLM 5.3 Flash de Z.AI: no disponible en la información proporcionada
- Documentación o repositorio de SiLVANN: no disponible en la información proporcionada
