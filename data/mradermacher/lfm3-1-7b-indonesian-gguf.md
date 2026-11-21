# mradermacher/LFM3-1.7B-Indonesian-GGUF

## Resumen

LFM3-1.7B-Indonesian-GGUF es la version cuantizada en formato GGUF del modelo s3t4/LFM3-1.7B-Indonesian, un ajuste fino supervisado (SFT) mediante LoRA y posterior fusion de pesos sobre el modelo base LiquidAI LFM3-1.7B. El trabajo de cuantizacion lo firma mradermacher, autor habitual de conversiones GGUF en Hugging Face, y ofrece hasta once variantes de cuantizacion distintas, desde Q2_K (~0,9 GB) hasta f16 (~3,6 GB), pensadas para ejecucion local con llama.cpp y ecosistemas compatibles.

El modelo original parte de la familia LFM3 de Liquid AI, una arquitectura propietaria de tipo transformer con codigo personalizado (`custom_code` en transformers) y 1.728.801.600 parametros totales. Este ajuste concreto esta especializado en indonesio: se entreno sobre los datasets CohereLabs/aya_dataset y AksaraLLM/aksara-sft-clean-v1, y su unico idioma declarado es `id`.

La relevancia practica de esta ficha reside en que permite desplegar un modelo de 1,7B especializado en indonesio en hardware de consumo, con licencia LFM 1.0 (no estandar, con enlace a los terminos de LiquidAI). Es una pieza util para aplicaciones de PLN en indonesio que requieran inferencia local, bajo coste y control de privacidad, aunque con las limitaciones propias de un modelo pequeno y de un unico idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de la familia LFM3 (Liquid AI), con `custom_code` en transformers; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | indonesio (`id`) |
| Licencia | LFM 1.0 (`lfm1.0`, license: other); terminos en el repositorio LiquidAI/LFM3-1.7B |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI. La model card indica que se trata de un modelo con codigo personalizado (`custom_code`) y etiquetas `liquid` y `lfm3`, lo que implica que la implementacion de referencia requiere cargar codigo remoto o un fork especifico de transformers. No se dispone de detalles publicados en la informacion proporcionada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto del modelo original.

El ajuste fino se realizo en dos fases: entrenamiento SFT con LoRA (herramienta TRL) sobre los datasets CohereLabs/aya_dataset y AksaraLLM/aksara-sft-clean-v1, seguido de la fusion de los adaptadores en los pesos base (etiquetas `lora`, `merged`, `sft`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La cuantizacion la realiza mradermacher con su pipeline habitual (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), generando cuantizaciones estaticas; segun la propia model card, las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de publicacion.

## Capacidades

- Generacion de texto conversacional en indonesio, con formato de chat (`conversational` en las etiquetas).
- Ajuste especifico para instrucciones y dialogos en indonesio gracias al SFT sobre aya_dataset y aksara-sft-clean-v1.
- Capacidades multilingues limitadas: el unico idioma declarado es `id`; no se garantiza un rendimiento solido en otros idiomas.
- Razonamiento, codigo y matematicas: no se documentan capacidades especificas ni evaluaciones en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno en indonesio con un coste de inferencia muy bajo (1,2 GB en Q4_K_M), adecuado para desplegar en servidores modestos o incluso en portatiles para prototipos.
- Procesamiento de texto local y privado: al ejecutarse con llama.cpp en hardware de consumo, permite procesar documentos en indonesio sin enviar datos a la nube, util en sectores con requisitos de confidencialidad.
- Generacion de resumenes y reescritura de contenido en indonesio: el ajuste SFT sobre aya_dataset aporta familiaridad con tareas instruccionales; se puede usar para resumir articulos, correos o informes en indonesio en pipelines por lotes.
- Asistentes integrados en aplicaciones de escritorio o moviles: la variante Q4_K_S o Q4_K_M (~1,2 GB) cabe en dispositivos con poca memoria y permite asistentes offline en indonesio.
- Prototipado rapido de productos NLP para el mercado indonesio: sirve como baseline antes de invertir en modelos mayores, gracias a su bajo coste de despliegue y a la disponibilidad de multiples cuantizaciones para ajustar el equilibrio calidad/velocidad.
- Educacion y tutoria automatizada en indonesio: generacion de explicaciones y respuestas a preguntas de estudiantes en un entorno controlado y local, con la advertencia de revisar posibles alucinaciones.
- Etiquetado y aumento de datos en indonesio: generacion de variaciones de texto o respuestas sinteticas para ampliar datasets de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q2_K, 1,2 GB en Q4_K_M, 1,5 GB en Q6_K y 1,9 GB en Q8_0; el f16 requiere unos 3,6 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para f16 se recomienda 6 GB o mas (RTX 2060, RTX 3060, etc.).
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) para los ficheros GGUF; el modelo base en safetensors requiere transformers con `trust_remote_code` por el `custom_code`. No se documenta soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un modelo de 1,7B, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Indonesian-GGUF (este) | 1,73B | no disponible | id | LFM 1.0 | GGUF |
| s3t4/LFM3-1.7B-Indonesian (base del ajuste) | 1,73B | no disponible | id | LFM 1.0 | safetensors |
| LiquidAI/LFM3-1.7B (modelo original) | 1,7B aprox. | no disponible | no disponible en la informacion | LFM 1.0 | safetensors |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria y tamano especializados en indonesio en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- Modelo de un solo idioma (`id`): no se garantiza calidad en castellano, ingles ni otros idiomas; usarlo fuera del indonesio puede producir respuestas incoherentes.
- Riesgo de alucinacion: como todo modelo generativo de 1,7B, puede inventar hechos, cifras o referencias; requiere validacion en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los datasets de origen (aya_dataset, aksara-sft-clean-v1) pueden introducir sesgos propios.
- Licencia LFM 1.0 no estandar: es necesario revisar los terminos en el repositorio LiquidAI/LFM3-1.7B antes de cualquier uso comercial; la licencia se marca como `other` en Hugging Face.
- Contexto: la longitud de contexto no esta publicada en la informacion disponible, lo que impide planificar tareas de contexto largo con garantias.
- Requiere `custom_code`: cargar el modelo base en transformers exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de desplegarlo.
- Cuantizaciones estaticas unicamente: no habia cuantizaciones ponderadas/imatrix en el momento de publicacion, por lo que las variantes IQ pueden no ofrecer la mejora habitual frente a las K en este modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Indonesian-GGUF
- Modelo base del ajuste: https://huggingface.co/s3t4/LFM3-1.7B-Indonesian
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-Indonesian-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
