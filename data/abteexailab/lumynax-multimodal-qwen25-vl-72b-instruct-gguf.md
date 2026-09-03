# AbteeXAILab/lumynax-multimodal-qwen25-vl-72b-instruct-gguf

## Resumen

LumynaX Multimodal Qwen2.5 VL 72B Instruct GGUF es un paquete de distribución en formato GGUF del modelo vision-language Qwen2.5-VL-72B-Instruct, publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda) centrado en IA soberana. El modelo forma parte de la familia LumynaX, que integra modelos open-source como capas de ejecución especializadas bajo un núcleo de orquestación propio. Este lanzamiento concreto se describe como un artefacto de investigación legacy, desactualizado y no recomendado para producción.

El paquete preserva los pesos originales del modelo Qwen2.5-VL-72B-Instruct sin modificación alguna; la integración LumynaX se realiza mediante "infusión enrutada" (routed infusion), donde el núcleo LumynaX dirige la inferencia a través del modelo sin alterar sus pesos. El resultado es un archivo GGUF de aproximadamente 49,6 GB, optimizado para ejecución local con llama.cpp, que ofrece capacidades multimodales de imagen-texto a texto con una ventana de contexto de 32 768 tokens. Su relevancia actual reside en su valor como referencia de reproducibilidad para la investigación, no como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen2.5-VL-72B-Instruct |
| Parametros totales | 72 706 203 648 (72,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (nativo del modelo base) |
| Tipos de cuantizacion | GGUF (variantes de cuantizacion no especificadas en la informacion disponible) |
| Idiomas soportados | Ingles (en), maori (mi) |
| Licencia | other (no especificada; se debe revisar LICENSE.txt del repositorio) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-VL-72B-Instruct, un transformer multimodal denso de 72 700 millones de parametros que procesa entradas de imagen y texto para generar respuestas de texto. La arquitectura original de Qwen2.5-VL incorpora un codificador de vision (ViT) con ventana de 32 768 tokens, soporte para comprension de documentos, graficos, video y razonamiento visual de alta resolucion. El entrenamiento del modelo base incluyo fases de pre-entrenamiento y ajuste fino supervisado con refuerzo (RLHF), aunque los detalles especificos del dataset no estan disponibles en la informacion proporcionada.

La contribucion de AbteeX AI Labs en este paquete no modifica los pesos del modelo. La "infusion LumynaX" opera como una capa de orquestacion en tiempo de ejecucion: el nucleo LumynaX recibe el prompt, decide la ruta de inferencia, ejecuta el modelo Qwen2.5-VL y post-procesa la respuesta. Este mecanismo de enrutamiento no implica mezcla de pesos ni cambios arquitectonicos. El paquete incluye wrappers de despliegue historicos (quickstart, Modelfile, Space) que reflejan el estado del proyecto en el momento del lanzamiento (v0.1.0), no la implementacion actual de LumynaX Core.

## Capacidades

- Comprension de imagenes y texto: el modelo acepta entradas multimodales (imagen + texto) y genera respuestas textuales, incluyendo descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento visual de alta resolucion: hereda la capacidad de Qwen2.5-VL para procesar imagenes con detalle fino, incluyendo documentos escaneados, diagramas y graficos.
- Generacion de texto instructivo: al ser un modelo instruct, sigue instrucciones complejas y produce respuestas estructuradas.
- Soporte multilingue limitado: la model card declara ingles y maori como idiomas soportados, aunque el modelo base Qwen2.5-VL tiene capacidades multilingues mas amplias.
- Ejecucion local con llama.cpp: el formato GGUF permite inferencia en CPU y GPU con herramientas como llama.cpp, Ollama o LM Studio.
- Integracion con el ecosistema LumynaX: el paquete incluye wrappers de orquestacion que permiten al nucleo LumynaX dirigir la inferencia (routed infusion).

## Casos de uso

- Reproduccion de investigacion: el paquete esta disenado para verificar resultados de experimentos anteriores de LumynaX; los investigadores pueden descargar el GGUF, verificar los checksums SHA256 y reproducir inferencias documentadas.
- Prototipado local de vision-language: desarrolladores que necesitan evaluar rapidamente las capacidades de Qwen2.5-VL-72B sin depender de APIs cloud pueden ejecutar este GGUF en una maquina local con llama.cpp.
- Analisis de documentos con contenido visual: el modelo puede procesar capturas de pantalla, PDFs escaneados o diagramas tecnicos y extraer informacion estructurada, util para automatizar tareas de extraccion de datos en entornos offline.
- Educacion e investigacion academica: como recurso de referencia para estudiar el comportamiento de modelos VL de gran tamano en configuraciones locales, especialmente en contextos con restricciones de conectividad.
- Evaluacion comparativa de cuantizacion: el repositorio permite estudiar el impacto de la cuantizacion GGUF en la calidad de salida de un modelo de 72B, comparando diferentes niveles de cuantizacion si estan disponibles.
- Demostraciones de IA soberana: el proyecto LumynaX promueve la soberania digital; este paquete sirve como ejemplo de despliegue local de un modelo VL sin dependencia de infraestructura cloud externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento, puntuaciones MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El autor indica explicitamente que el lanzamiento es un artefacto de investigacion legacy y no recomienda su uso en produccion, lo que sugiere que no se realizaron evaluaciones formales para esta publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 49,6 GB, por lo que se requiere al menos 50 GB de VRAM para cargar el modelo completo en GPU. Con cuantizaciones mas agresivas (por ejemplo, Q4_K_M), el peso podria reducirse a aproximadamente 40-42 GB, pero no se dispone de datos exactos de las variantes incluidas.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o GPUs profesionales con 48 GB o mas de VRAM (por ejemplo, RTX A6000, L40S). En configuraciones de doble GPU, podria utilizarse reparto de capas con llama.cpp.
- Consumer GPU: no cabe en GPUs de consumo actuales (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB). Se necesitaria al menos una configuracion de doble GPU o cuantizacion extrema con perdida de calidad.
- Opciones de despliegue: llama.cpp (soporte nativo), Ollama (mediante Modelfile incluido), Hugging Face Spaces (el repositorio menciona un Space), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Para un modelo de 72B en GGUF, se estima una generacion de 5-15 tokens/segundo en una A100 80 GB con cuantizacion Q4, pero estos valores no estan confirmados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Qwen2.5-VL-72B GGUF | 72,7 B | 32 768 | other | GGUF | Paquete legacy, no recomendado para produccion |
| Qwen/Qwen2.5-VL-72B-Instruct | 72,7 B | 32 768 | Apache 2.0 (Qwen) | safetensors | Modelo base original, con soporte activo y documentacion completa |
| Qwen/Qwen2-VL-72B-Instruct | 72,7 B | 32 768 | Apache 2.0 (Qwen) | safetensors | Version anterior, sin soporte de video de alta resolucion |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de informacion sobre otros modelos VL de tamano similar (por ejemplo, Llama 3.2 90B Vision o InternVL) en la informacion proporcionada. La diferencia principal entre el paquete LumynaX y el modelo base es el formato (GGUF vs safetensors) y la capa de orquestacion LumynaX, que no altera los pesos.

## Limitaciones y advertencias

- Estado legacy y desactualizado: el autor declara explicitamente que el modelo "ya no se mantiene, no se recomienda para produccion y no representa las capacidades, arquitectura o estandares de seguridad actuales de AbteeX AI Labs".
- Licencia no especificada: la licencia se indica como "other" y no se detalla en la model card. Es imprescindible revisar el archivo LICENSE.txt del repositorio antes de cualquier uso comercial.
- Riesgo de alucinacion: como todo modelo de lenguaje de gran tamano, puede generar contenido falso o inventado, especialmente en tareas de razonamiento visual complejo.
- Sesgos potenciales: el modelo base Qwen2.5-VL fue entrenado con datos mayoritariamente en ingles y chino; el soporte declarado de maori (mi) no implica un entrenamiento especifico en ese idioma.
- Limitaciones de contexto: la ventana de 32 768 tokens es amplia pero no infinita; documentos muy largos o conversaciones extensas pueden truncarse.
- Requisitos de hardware elevados: con 49,6 GB de peso, el modelo no es accesible para la mayoria de desarrolladores individuales sin GPUs profesionales.
- Sin garantias de soporte: al ser un artefacto de investigacion, no hay canal de soporte oficial ni roadmap de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbteeXAILab/lumynax-multimodal-qwen25-vl-72b-instruct-gguf
- Repositorio GitHub: https://github.com/Aimaghsoodi/lumynax-multimodal-qwen25-vl-72b-instruct-gguf
- Modelo base Qwen2.5-VL-72B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
- Sitio de AbteeX AI Labs: https://abteex.com
- Sitio de LumynaX: https://lumynax.com
- Coleccion LumynaX Multimodal: https://huggingface.co/collections/AbteeXAILab/lumynax-multimodal-vision-audio
- Contacto: mailto:aimaghsoodi@abteex.com
