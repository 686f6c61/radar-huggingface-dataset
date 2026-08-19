# rahul7star/LFM2.5-VL-3B-tool-sft-merged

## Resumen

El modelo `rahul7star/LFM2.5-VL-3B-tool-sft-merged` es un ajuste fino (fine-tuning) supervisado del modelo vision-language `LiquidAI/LFM2.5-VL-3B`, desarrollado por el usuario rahul7star. El objetivo declarado es especializar el modelo base en el uso de herramientas (tool calling) mediante entrenamiento SFT, manteniendo las capacidades multimodales originales. El modelo base, creado por Liquid AI, está diseñado para ejecutarse en el edge y destaca por su comprensión de pantallas, documentos y su capacidad de function calling.

Este finetune se ha entrenado con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permite un entrenamiento más rápido y eficiente. Con aproximadamente 3,12 mil millones de parámetros, el modelo se presenta en formato safetensors y está pensado para tareas de generación de texto a partir de imágenes (image-text-to-text). Su relevancia radica en ofrecer una versión especializada en agentes y herramientas, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language, arquitectura interna no publicada) |
| Parametros totales | 3.123.483.888 (3,12 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `LiquidAI/LFM2.5-VL-3B`, un modelo vision-language de Liquid AI. Aunque no se han publicado detalles arquitectonicos internos, se sabe que el modelo base integra un codificador visual y un decodificador de lenguaje, con capacidad para procesar imagenes y texto de forma conjunta. El finetune se ha realizado mediante aprendizaje supervisado (SFT) con la libreria Unsloth y TRL, enfocandose en la especializacion en tool calling. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: procesa imagenes y texto, permitiendo describir, analizar y responder sobre contenido visual.
- Function calling / tool calling: el finetune esta especificamente orientado a invocar herramientas externas, lo que lo hace util para agentes que necesitan interactuar con APIs o ejecutar acciones.
- Comprension de pantallas y documentos: segun la documentacion del modelo base, es capaz de entender interfaces de usuario, capturas de pantalla y documentos escaneados.
- Grounding visual: puede relacionar objetos o regiones especificas de una imagen con texto, util para tareas de anotacion o respuesta a preguntas visuales.
- Capacidad conversacional: soporta dialogos multi-turno, aunque no se especifica la longitud de contexto.
- Multilingue: solo se declara soporte para ingles.

## Casos de uso

- Agentes autonomos con acceso a herramientas: el modelo puede actuar como cerebro de un agente que recibe una captura de pantalla, identifica elementos y ejecuta acciones mediante function calling (por ejemplo, rellenar formularios o navegar por una interfaz).
- Asistente de soporte tecnico visual: un usuario envia una captura de error o una imagen de un problema, y el modelo la interpreta, sugiere soluciones y, si es necesario, invoca una API de diagnostico.
- Analisis de documentos escaneados: extraer informacion de facturas, recibos o formularios a partir de imagenes, y estructurarla en formato JSON mediante tool calling.
- Automatizacion de pruebas de interfaz: el modelo puede analizar capturas de pantalla de una aplicacion web o movil, detectar elementos y generar comandos de automatizacion (por ejemplo, con Selenium o Playwright).
- Chatbot de atencion al cliente con soporte visual: gestiona conversaciones donde el usuario adjunta imagenes (productos, errores) y el modelo responde con acciones o consultas a una base de datos.
- Asistente de accesibilidad: describe el contenido de una imagen para personas con discapacidad visual, y puede invocar herramientas de lectura o traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para este finetune especifico. El modelo base `LFM2.5-VL-3B` ha sido evaluado por Liquid AI en tareas de vision y function calling, pero esos resultados no se han trasladado a esta version ajustada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,12 B de parametros, en precision fp16 se requieren aproximadamente 6,2 GB de VRAM; en int8 unos 3,1 GB; en int4 unos 1,6 GB. Estas cifras son estimaciones teoricas y pueden variar segun la implementacion.
- GPU recomendadas: una GPU de consumo como la RTX 3060 (12 GB) o superior puede ejecutar el modelo en fp16. Para cuantizaciones mas agresivas, una RTX 4060 (8 GB) o incluso una GTX 1660 (6 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo con al menos 6 GB de VRAM si se cuantiza adecuadamente.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. El tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Como referencia, se pueden citar otros modelos vision-language de tamano similar, pero sin datos de rendimiento concretos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-VL-3B (base) | 3,12 B | no disponible | Apache 2.0 | Hugging Face |
| LLaVA-1.5-7B | 7 B | 4096 | Apache 2.0 | Hugging Face |
| Phi-3.5-vision-instruct | 4,2 B | 128K | MIT | Hugging Face |

La comparativa se limita a parametros y licencia; no hay datos de rendimiento publicados para este finetune.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en ingles, puede presentar sesgos culturales y linguisticos propios de los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas de vision donde la interpretacion de la imagen puede ser erronea.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, por lo que no se garantiza un rendimiento adecuado en dialogos muy largos o documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Caveat para produccion: al ser un finetune sin benchmarks publicados, se recomienda validar su rendimiento en el caso de uso especifico antes de desplegarlo en entornos criticos. Ademas, el modelo solo soporta ingles, lo que limita su uso en entornos multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahul7star/LFM2.5-VL-3B-tool-sft-merged
- Perfil del autor: https://huggingface.co/rahul7star
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Documentacion oficial de LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Repositorio de ejemplos de Liquid AI: https://github.com/Liquid4All/cookbook
