# nokkela-ai/gpt-oss-120b

## Resumen

gpt-oss-120b es el modelo abierto de mayor tamano de la familia gpt-oss publicada por OpenAI, disenado para razonamiento de alta intensidad, tareas agenticas y casos de uso generales en produccion. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 117B parametros totales y aproximadamente 5,1B parametros activos por token, lo que permite ejecutarlo en una unica GPU de 80 GB (NVIDIA H100 o AMD MI300X) gracias a la cuantizacion MXFP4 aplicada a los pesos del MoE durante el post-entrenamiento.

El modelo se distribuye bajo licencia Apache 2.0, lo que elimina restricciones de copyleft y permite uso comercial, modificacion y fine-tuning sin riesgo de patentes. Requiere obligatoriamente el formato de respuesta harmony para funcionar correctamente, e incluye capacidades nativas de function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas.

La ficha que nos ocupa corresponde a un repositorio espejo (`nokkela-ai/gpt-oss-120b`) que replica los pesos oficiales de OpenAI. El repositorio pesa 195,8 GB e incluye pesos en safetensors compatibles con transformers y vLLM. El modelo resuelve el problema de disponer de razonamiento de nivel frontera en infraestructura propia, con control total sobre la cadena de pensamiento y el esfuerzo de razonamiento configurable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 116.829.156.672 (~117B) |
| Parametros activos | ~5,1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos MoE), 8-bit; safetensors en precision original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura transformer con capas Mixture-of-Experts, en la que solo una fraccion reducida de parametros (~5,1B de 117B) se activa por token, lo que reduce drasticamente el coste computacional de inferencia frente a un modelo denso del mismo tamano. Los pesos del MoE fueron cuantizados a MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas se realizaron con esa misma cuantizacion, lo que garantiza coherencia entre el rendimiento reportado y el comportamiento del modelo distribuido.

El modelo fue entrenado sobre el formato de respuesta harmony, un esquema propietario de OpenAI que estructura los turnos, los canales de razonamiento y las llamadas a herramientas. Segun la documentacion oficial, el modelo no funciona correctamente fuera de ese formato. No se han publicado en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre el uso especifico de RLHF o DPO, mas alla de la mencion al post-entrenamiento con cuantizacion MXFP4. La cadena de pensamiento es completamente accesible, lo que facilita la depuracion y la auditoria de las respuestas.

## Capacidades

- Generacion de texto y razonamiento de alta intensidad con esfuerzo configurable (low, medium, high) para ajustar latencia y profundidad.
- Cadena de pensamiento completa y accesible, pensada para depuracion interna y no para exposicion directa al usuario final.
- Function calling nativo y soporte de herramientas externas.
- Navegacion web integrada mediante el formato harmony.
- Ejecucion de codigo Python en el bucle agentico.
- Salidas estructuradas (structured outputs) para integracion en pipelines.
- Capacidades agenticas multi-paso para tareas que requieren planificacion y uso de herramientas.
- Fine-tuning completo de parametros para adaptacion a dominios especificos.
- Compatibilidad con endpoints OpenAI a traves de vLLM y transformers serve.

## Casos de uso

- Razonamiento en produccion con coste controlado: el modelo activa solo ~5,1B parametros por token, lo que permite desplegar razonamiento de alta calidad en una unica H100 o MI300X sin recurrir a clusters multi-GPU.
- Agentes autonomos con herramientas: la combinacion de function calling, navegacion web y ejecucion de Python permite construir agentes que consultan APIs, validan datos y ejecutan codigo en un bucle controlado por el formato harmony.
- Generacion y revision de codigo en pipelines CI/CD: las salidas estructuradas y el soporte de tool calling facilitan integrar el modelo en flujos de revision automatica, generacion de tests o analisis de errores.
- Atencion al cliente con razonamiento auditables: la cadena de pensamiento accesible permite registrar y revisar el razonamiento interno del modelo para cumplimiento normativo, aunque no debe mostrarse al usuario final.
- Analisis documental y extraccion de datos: con salidas estructuradas, el modelo puede transformar texto no estructurado en JSON validado para ingestas en bases de datos.
- Investigacion y experimentacion en IA abierta: la licencia Apache 2.0 y la disponibilidad de pesos completos permiten fine-tuning, destilacion y estudios de interpretabilidad sin restricciones de copyleft.
- Despliegue en infraestructura propia con soberania de datos: al ejecutarse en una sola GPU de 80 GB, encaja en entornos on-premise con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo esta disenado para caber en una unica GPU de 80 GB gracias a la cuantizacion MXFP4 de los pesos MoE. El repositorio completo en safetensors ocupa 195,8 GB, por lo que la inferencia en precision original requiere multiples GPUs.
- GPU recomendadas: NVIDIA H100 (80 GB) y AMD MI300X (192 GB) son las plataformas de referencia citadas por OpenAI. Configuraciones multi-GPU con A100 80 GB tambien son viables para pesos sin cuantizar.
- GPU de consumo: el modelo de 120B no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB). Para hardware de consumo, OpenAI recomienda el modelo menor gpt-oss-20b, que cabe en 16 GB.
- Opciones de despliegue: transformers (pipeline y chat template con harmony automatico), vLLM (version 0.10.1+gptoss con wheels especificos), Ollama (`ollama pull gpt-oss:120b`), LM Studio (`lms get openai/gpt-oss-120b`), transformers serve para servidor compatible con OpenAI, y las implementaciones de referencia en PyTorch/Triton del repositorio oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| gpt-oss-120b | ~117B | ~5,1B | no disponible | Apache 2.0 | 1x GPU 80 GB |
| gpt-oss-20b | ~21B | ~3,6B | no disponible | Apache 2.0 | 16 GB de memoria |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada en la informacion disponible es con gpt-oss-20b, el modelo menor de la misma familia, orientado a baja latencia y uso local. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere obligatoriamente el formato harmony; su uso fuera de ese esquema produce comportamiento incorrecto segun el propio autor.
- La cadena de pensamiento es accesible pero no debe mostrarse al usuario final.
- No se han publicado datos sobre sesgos conocidos, composicion del dataset ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas especificas.
- Longitud de contexto e idiomas soportados no estan documentados en la informacion disponible, lo que limita la planificacion de despliegues multilingues o con documentos largos.
- El repositorio corresponde a un espejo de terceros (`nokkela-ai`), no al repositorio oficial de OpenAI; conviene verificar la integridad de los pesos frente a `openai/gpt-oss-120b` antes de usarlo en produccion.
- El repositorio no registra descargas ni likes, lo que sugiere baja validacion comunitaria de este espejo concreto.
- Aunque la licencia Apache 2.0 permite uso comercial sin copyleft, el cumplimiento de la politica de uso de OpenAI y de la legislacion aplicable sigue siendo responsabilidad del desplegador.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/nokkela-ai/gpt-oss-120b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-120b
- Coleccion oficial gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card en arXiv: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Sitio del proyecto: https://gpt-oss.com
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
