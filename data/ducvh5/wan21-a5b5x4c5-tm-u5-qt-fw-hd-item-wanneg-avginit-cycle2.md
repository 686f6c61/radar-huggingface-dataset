# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit-cycle2

## Resumen

Este repositorio contiene un checkpoint de ajuste fino (finetune) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B de Alibaba (Wan-AI), publicado por el usuario ducvh5. Se trata de una variante experimental que modifica la estructura de bloques del transformer original: segun la model card, pasa de una disposicion "A5" a "B5x4" y "C5", con 15 bloques unicos y 30 bloques ejecutados, e incorpora un esquema de pesos recurrentes por ciclos (cycle weights). El modelo base tiene aproximadamente 1.300 millones de parametros y esta especializado en generacion de video a partir de descripciones textuales.

La relevancia de este checkpoint es limitada y de caracter fundamentalmente experimental: no registra descargas ni interacciones en Hugging Face, la model card es extremadamente escueta y tecnica (sin resultados de benchmarks ni descripcion de capacidades), y no se especifica licencia ni idiomas soportados. Resulta de interes para investigadores que quieran reproducir o estudiar variantes recurrentes del transformer de difusion de Wan2.1, pero no es un modelo recomendable para produccion sin una evaluacion previa.

La informacion disponible no permite determinar el rendimiento real del modelo ni su calidad de generacion; todos los datos tecnicos proceden de la model card del autor y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion recurrente (recurrent-transformer) derivado de Wan2.1-T2V-1.3B |
| Parametros totales | Aproximadamente 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (`state.pt`), 18 pesos EMA/non-EMA en el snapshot |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusion para texto-a-video, y le aplica una reconfiguracion estructural descrita en la model card como "A5 → B5x4 → C5", con 15 bloques unicos y 30 bloques ejecutados. Esto sugiere un esquema de reutilizacion de bloques (recurrencia) en el que parte de los bloques se ejecutan mas de una vez, con pesos de ciclo de 0,3333, 1, 0,3333 y 0,3333. La inicializacion de los bloques B se realiza mediante la media aritmetica de los pesos correspondientes.

En cuanto al entrenamiento, la model card indica una funcion de perdida "TM" aplicada a todas las salidas del bucle, un muestreo de sigma uniforme U(0,1) con shift=5 y t=1000·sigma (formulacion estandar de flow matching en modelos de difusion). Los datos de entrenamiento se describen de forma críptica: "OV" con captions QT en proporcion 50/50 VB/full, y "OV/FW-HD" en proporcion 50/50 por item, con dropout "WN". No se especifica el numero de tokens, la composicion detallada del dataset ni si hubo RLHF o DPO. El entrenamiento alcanzo al menos el paso 3000 (`step0003000/state.pt`). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de video a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Ejecucion de bloques recurrentes con pesos de ciclo, una modificacion experimental de la arquitectura original.
- No se documentan capacidades de tool calling, function calling ni agentes.
- No se documenta soporte multilingue especifico.
- No se documentan modos especiales (thinking, vision, audio) mas alla de la generacion de video.
- No se dispone de informacion sobre calidad, resolucion o duracion de los videos generados.

## Casos de uso

- Investigacion sobre arquitecturas recurrentes en difusion: el checkpoint permite estudiar el efecto de la reutilizacion de bloques (15 unicos, 30 ejecutados) en la calidad de generacion de video, comparandolo con el Wan2.1 original.
- Reproduccion de experimentos academicos: util para validar la receta de entrenamiento descrita (flow matching con shift=5, perdida TM en todas las salidas del bucle) en entornos controlados.
- Generacion de prototipos de video de baja resolucion: al derivar de un modelo de 1.300 millones de parametros, puede ejecutarse en hardware modesto para pruebas exploratorias de texto-a-video.
- Analisis de inicializacion por media aritmetica: permite estudiar como afecta la inicializacion de los bloques B a la convergencia y estabilidad del entrenamiento.
- Base para nuevos finetunes: sirve como punto de partida para experimentos de ajuste con datasets propios, aunque sin garantias de calidad al no haber benchmarks publicados.
- Docencia y divulgacion: ejemplo practico de modificacion estructural de un transformer de difusion para explicar conceptos de recurrencia y pesos compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo base (1.300 millones de parametros), se estima en torno a 6-8 GB en precision reducida (fp16/bf16) y menos con cuantizacion de 8 o 4 bits, aunque estas cifras no estan confirmadas para este checkpoint.
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcione en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Compatibilidad con GPU consumer: probable segun el tamano del modelo base, no verificado para este checkpoint.
- Opciones de despliegue: al estar en formato de checkpoint PyTorch (`state.pt`) y no en formato Diffusers completo, se requiere reconstruir el pipeline; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit-cycle2 | ~1.300 M | No disponible | No disponible | No disponible | Hugging Face (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | ~1.300 M | No disponible | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base oficial) |
| Otros modelos texto-a-video de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluaciones publicadas: no hay evidencia de la calidad de los videos generados.
- Model card extremadamente escueta y críptica: abreviaturas como "OV", "QT", "VB", "FW-HD" o "WN" no se explican, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base Wan2.1 debe verificarse por separado.
- Idiomas no declarados: se desconoce el soporte multilingue de los prompts.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusion texto-a-video, no evaluado en este checkpoint.
- Formato de pesos en `state.pt` y estructura modificada: requiere trabajo tecnico para integrarlo en pipelines estandar de Diffusers.
- Sin descargas ni interacciones: no hay evidencia de validacion por parte de la comunidad.
- Checkpoint experimental de un unico autor: no recomendado para produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit-cycle2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
