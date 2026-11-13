# lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT

## Resumen

LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de pequeno tamano (354.483.968 parametros, aproximadamente 0,35 mil millones) orientado a tareas de reescritura conversacional, segun indica el propio nombre del repositorio ("Rewrite-SFT") y la etiqueta "conversational" asociada al modelo.

El modelo hereda la arquitectura LFM2 (Liquid Foundation Model 2) del modelo base de LiquidAI, una familia disenada para despliegue eficiente en dispositivos con recursos limitados. El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un entrenamiento supervisado de instrucciones (SFT) optimizado para velocidad y bajo consumo de memoria. El repositorio ocupa 0,7 GB y los pesos estan en formato safetensors, compatibles con transformers y text-generation-inference.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo experimental de nicho, con cero descargas y cero "likes" en el momento de la consulta, y sin model card detallada mas alla de los metadatos minimos. Resulta util como ejemplo de ajuste fino ligero sobre LFM2 y como candidato para tareas de reescritura de texto en ingles en entornos con restricciones de hardware, pero no dispone de documentacion tecnica publicada sobre su dataset de entrenamiento, hiperparametros o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada de LiquidAI/LFM2.5-350M); detalles especificos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion, pero no se documenta en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-350M, que pertenece a la familia LFM2 de LiquidAI. No se dispone de informacion publicada en este repositorio sobre la arquitectura interna concreta (tipo de atencion, capas, dimensiones ocultas) mas alla de la etiqueta "lfm2" y del tamano total de parametros. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO adicionales.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, lo que indica un flujo de trabajo de ajuste fino supervisado con optimizaciones de memoria y velocidad. No se especifican hiperparametros, numero de pasos, tasa de aprendizaje ni criterios de seleccion del checkpoint. La unica indicacion sobre la tarea es el sufijo del nombre del repositorio ("Chem-Haiku-5-5-Rewrite-SFT"), que sugiere un ajuste orientado a reescritura de texto, posiblemente en un dominio quimico o con un estilo concreto ("Haiku"), aunque esto no se confirma en la documentacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Reescritura de texto (inferida del nombre del repositorio "Rewrite-SFT"); no se documenta el formato exacto de las instrucciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reescritura de parrafos en ingles: el modelo puede recibir un texto y devolver una version reformulada, adecuado por su entrenamiento SFT orientado a reescritura y su bajo coste de inferencia.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 350M, permite iterar en local sobre dialogos multi-turno sin infraestructura dedicada.
- Filtrado y normalizacion de texto en pipelines de datos: su tamano reducido permite procesar grandes volumenes de texto en CPU o GPU de gama baja.
- Educacion y experimentacion: util como modelo de referencia para estudiar el efecto de un SFT ligero sobre un modelo base LFM2.
- Generacion de variantes estilisticas de un mismo contenido (por ejemplo, tono formal frente a informal) en ingles, si el ajuste "Haiku" responde a ese objetivo.
- Despliegue en entornos con restricciones de memoria: cabe en GPU consumer y en CPU, lo que facilita su integracion en aplicaciones de escritorio o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (354M parametros), en fp16 requeriria aproximadamente 0,7 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,35 GB, sin contar memoria para el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de consumo.
- Opciones de despliegue: transformers, text-generation-inference (segun las etiquetas del repositorio), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF (no se proporcionan en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT | 354M | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (modelo base) | 350M aprox. | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 32K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 362M | 8K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |

La comparativa se limita a tamano y licencia, ya que no hay datos de rendimiento publicados para este ajuste fino. Frente al modelo base, la diferencia es el SFT adicional orientado a reescritura; frente a alternativas como Qwen2.5-0.5B o SmolLM2-360M, este modelo carece de evaluacion publica que permita comparar calidad.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero "likes": no hay evidencia de uso en produccion ni validacion por la comunidad.
- Sin model card detallada: se desconoce el dataset de entrenamiento, los hiperparametros y los criterios de evaluacion, lo que impide estimar su calidad real.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en tareas de reescritura con contenido factual.
- Sesgos: no documentados; al entrenarse sobre datos no especificados, pueden persistir sesgos del modelo base y del dataset de ajuste.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Limitacion de contexto: no se especifica la longitud de contexto soportada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base LiquidAI/LFM2.5-350M antes de un despliegue comercial.
- Nombre del repositorio ambiguo ("Chem-Haiku-5-5"): no se aclara si el ajuste esta especializado en quimica, en estilo haiku o en otra tarea, lo que dificulta su reutilizacion fuera del proposito previsto por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
