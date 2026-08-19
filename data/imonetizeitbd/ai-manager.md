# imonetizeitbd/ai-manager

## Resumen

AI Manager es un modelo de lenguaje fine-tuneado sobre Google Gemma-3-4B-it, desarrollado por el usuario imonetizeitbd para la red de afiliados iMonetizeIt. Su propósito principal es actuar como asistente inteligente en el proceso de screening de solicitudes de afiliados, verificando elegibilidad, aplicando políticas de la red y comunicándose en inglés, bengalí o banglish según la preferencia del usuario. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M) y está pensado para su uso con Ollama o llama.cpp, lo que facilita su despliegue en entornos ligeros.

El fine-tuning se realizó con QLoRA (4-bit), entrenando solo 65,5 millones de parámetros (1,5 % del total) sobre un conjunto de datos reducido de 584 ejemplos. A pesar de su especialización, el modelo conserva las capacidades conversacionales del modelo base y añade reglas específicas del dominio de marketing de afiliación, como verificación de edad, comprobación de capturas de pantalla y validación de documentos. Su relevancia radica en ofrecer una solución de bajo coste y fácil despliegue para automatizar tareas de moderación y atención al cliente en redes de afiliación, especialmente en mercados de habla bengalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-4B-it) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en), bengali (bn), banglish |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (Q4_K_M), tambien incluye mmproj para multimodalidad |

## Arquitectura y entrenamiento

El modelo parte de unsloth/gemma-3-4b-it, una version optimizada del Gemma-3-4B de Google. El fine-tuning se realizo con QLoRA, una tecnica que cuantiza los pesos del modelo base a 4 bits y entrena adaptadores de bajo rango. Se usaron rank 32 y alpha 64, con un total de 65,5 millones de parametros entrenables (1,5 % del total). El entrenamiento se llevo a cabo durante 4 epocas con un tamaño de lote de 2, una tasa de aprendizaje de 2e-4 y el optimizador AdamW de 8 bits. La funcion de perdida fue cross-entropy con enmascaramiento de solo la respuesta, lo que indica que el modelo se entreno para generar respuestas directas en conversaciones de screening.

El dataset de entrenamiento contiene 584 ejemplos y el de validacion 64, todos orientados a tareas de verificacion de afiliados, cumplimiento de politicas y atencion al cliente. La perdida de entrenamiento descendio de 2.439 a 0.385, mientras que la de validacion se mantuvo alrededor de 1.7, lo que sugiere un posible sobreajuste debido al pequeno volumen de datos. El entrenamiento se ejecuto en dos GPUs T4 de Kaggle.

## Capacidades

- Generacion de texto conversacional para screening de solicitudes de afiliados.
- Verificacion de elegibilidad basada en reglas (edad minima de 18 anos, capturas de pantalla de escritorio, etc.).
- Validacion de documentos como NID y capturas de pantalla.
- Aplicacion de politicas de red y toma de decisiones basada en reglas.
- Soporte multilingue en ingles, bengali y banglish (mezcla de bengali e ingles).
- Interfaz conversacional multi-turno para atender consultas de solicitantes.
- Incluye un archivo mmproj (F16) que sugiere capacidad multimodal, aunque no se documenta su uso en la model card.

## Casos de uso

- Screening automatizado de solicitudes de afiliados: el modelo puede evaluar si un solicitante cumple los requisitos de la red (edad, ubicacion, tipo de trafico) y responder con una decision preliminar, reduciendo la carga del equipo de ventas.
- Verificacion de documentos: puede analizar descripciones de NID, capturas de pantalla y otros documentos enviados por los solicitantes, comprobando su coherencia con las politicas de la red.
- Atencion al cliente en bengali: dado su soporte para bn y banglish, puede gestionar consultas de afiliados de Bangladesh o India en su idioma nativo, mejorando la experiencia del usuario.
- Moderacion de contenido: puede revisar mensajes de candidatos y detectar posibles fraudes o incumplimientos de las normas de la red.
- Asistente interno para el equipo de ventas: puede generar respuestas tipo para comunicaciones con afiliados, manteniendo un tono consistente con la marca.
- Despliegue ligero en produccion: al estar cuantizado en Q4_K_M, puede ejecutarse en CPU o GPUs de gama baja, ideal para pequenos equipos que no disponen de infraestructura potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El archivo GGUF Q4_K_M pesa 2,49 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super).
- Tambien puede ejecutarse en CPU con llama.cpp u Ollama, aunque la latencia sera mayor.
- Para uso en produccion con varias peticiones concurrentes, se recomienda al menos 8 GB de VRAM (RTX 3070/4070 o superior) o usar vLLM con cuantizacion AWQ si se convierte el modelo.
- El archivo mmproj (812 MB) solo es necesario si se va a utilizar la parte multimodal, lo que incrementaria los requisitos de memoria.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp, TGI (si se convierte a safetensors), y potencialmente vLLM.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para screening de afiliados. Como referencia, se puede comparar con el modelo base Gemma-3-4B-it, que tiene 4.000 millones de parametros (el fine-tune reduce ligeramente el numero total a 3.880 millones), contexto de 32k (segun especificaciones de Gemma-3, aunque no confirmado en esta documentacion) y licencia Gemma. Otros modelos de tamano similar como Llama-3.2-3B o Qwen2.5-4B podrian servir como alternativas, pero no se han evaluado en este contexto.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (584 ejemplos), lo que puede provocar sobreajuste y falta de generalizacion a casos no vistos.
- La perdida de validacion se estanca alrededor de 1.7, indicando que el modelo podria no haber aprendido patrones robustos.
- Solo cubre tareas especificas de screening de afiliados; fuera de ese dominio su rendimiento puede degradarse significativamente.
- Limitado a ingles y bengali/banglish; no soporta otros idiomas.
- Riesgo de alucinacion en respuestas sobre politicas o documentos, especialmente si la entrada es ambigua.
- La licencia Gemma de Google tiene restricciones de uso comercial que deben revisarse antes de desplegar en produccion.
- No se documentan capacidades de tool calling ni de agentes autonomos.
- El archivo mmproj sugiere multimodalidad, pero no hay instrucciones claras sobre como utilizarla, por lo que su funcionalidad real no esta garantizada.
- No se proporcionan benchmarks ni evaluaciones independientes, por lo que el rendimiento real es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imonetizeitbd/ai-manager
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- (No se encontraron otros enlaces como papers, blogs o repositorios en la informacion proporcionada)
