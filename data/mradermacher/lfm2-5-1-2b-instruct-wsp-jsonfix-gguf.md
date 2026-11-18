# mradermacher/LFM2.5-1.2B-Instruct-WSP-JSONFix-GGUF

## Resumen

LFM2.5-1.2B-Instruct-WSP-JSONFix-GGUF es la version cuantizada en formato GGUF del modelo yasserrmd/LFM2.5-1.2B-Instruct-WSP-JSONFix, un ajuste fino derivado de la familia LFM2.5 de Liquid AI. El modelo base parte de una arquitectura Liquid de 1.170.340.608 parametros y ha sido modificado mediante tecnicas de edicion de pesos (weight editing / model editing) sin reentrenamiento, con el objetivo declarado de corregir la generacion de JSON. La cuantizacion la realiza mradermacher, un conocido publicador de quants GGUF en Hugging Face.

El interes de esta ficha reside en dos aspectos. Por un lado, es un ejemplo de "training-free editing": se modifica el comportamiento del modelo sin pasar por un ciclo de RLHF o SFT completo, lo que reduce coste computacional. Por otro, al estar disponible en GGUF con cuantizaciones desde Q2_K (0.6 GB) hasta f16 (2.4 GB), resulta desplegable en hardware muy modesto, incluidos portatiles sin GPU dedicada.

El modelo soporta ocho idiomas declarados (ingles, arabe, chino, frances, aleman, japones, coreano y espanol) y se distribuye bajo licencia lfm1.0, que conviene revisar antes de un uso comercial. Es relevante ahora porque la correccion de JSON es un cuello de botella frecuente en pipelines de agentes y tool calling, y las alternativas de bajo coste con salida estructurada fiable escasean en el rango de 1B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid (familia LFM2.5 de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (categorizada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 de Liquid AI, cuya arquitectura exacta (capas, atencion, posibles componentes de estado recurrente) no se detalla en la informacion disponible. El dato objetivo es el recuento de parametros: 1.170.340.608, lo que lo situa en la categoria de modelos pequenos para inferencia en el borde. El autor del ajuste, yasserrmd, aplica tecnicas de edicion de pesos (weight editing / model editing) marcadas como "training-free", es decir, sin un ciclo de entrenamiento supervisado convencional sobre un dataset nuevo.

La innovacion declarada es la correccion de la generacion de JSON mediante esa edicion de pesos, orientada a mejorar la fiabilidad de la salida estructurada. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal) mas alla de la propia arquitectura Liquid. La cuantizacion la realiza mradermacher con quants estaticos; segun su model card, los quants ponderados/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Generacion de JSON corregida mediante edicion de pesos, presumiblemente orientada a salidas estructuradas mas fiables.
- Instruccion y seguimiento de conversaciones multi-turno (el pipeline declarado es "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Razonamiento y codigo: no hay confirmacion explicita en la informacion disponible; deben validarse empiricamente.
- Tool calling / function calling: no confirmado en la informacion disponible, aunque la correccion de JSON sugiere un uso orientado a esquemas.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Vision o audio: no disponibles.

## Casos de uso

- Extraccion de datos estructurados: el modelo puede convertir texto libre en JSON con un esquema fijo, aprovechando la correccion de pesos orientada a JSON; adecuado para pipelines ETL ligeros donde un modelo de 1B evita costes de API.
- Relleno de formularios y validacion de campos: en aplicaciones web o de back-office, generar objetos JSON validos a partir de entradas de usuario y validarlos contra un schema antes de persistirlos.
- Preprocesado en pipelines de agentes: usar el modelo como eslabon barato que formatea llamadas a herramientas o normaliza parametros antes de invocar un modelo mayor, reduciendo latencia y coste.
- Despliegue en el borde: con cuantizaciones de 0.6 a 1.3 GB, cabe en portatiles, Raspberry Pi de gama alta o moviles con suficiente RAM, para asistentes locales sin conexion.
- Clasificacion y etiquetado multilingue: con soporte declarado de ocho idiomas, puede etiquetar documentos o tickets en varios idiomas y devolver categorias en JSON.
- Prototipado rapido y pruebas de concepto: al ser GGUF y caber en consumer GPU, permite iterar en local con llama.cpp u Ollama antes de comprometerse con un modelo mayor.
- Generacion de respuestas conversacionales de bajo coste: chatbots de soporte sencillos donde la latencia y el coste importan mas que la profundidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6-1.3 GB para cuantizaciones Q2_K a Q8_0; 2.4 GB para f16. Sumar overhead de contexto y KV cache.
- Cabe en CPU con llama.cpp: si, con las cuantizaciones bajas (Q2_K a Q4_K_M), usando RAM del sistema.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.).
- GPU recomendadas para mayor throughput: RTX 4090, A100, H100, aunque el modelo es lo bastante pequeno para que el cuello de botella sea la CPU en muchos despliegues.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con transformers, vLLM o TGI si se dispone del repositorio original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-WSP-JSONFix-GGUF (este) | 1.170 M | no disponible | lfm1.0 | GGUF | Edicion de pesos para JSON |
| LFM2.5-1.2B-Instruct (base, sin editar) | ~1.170 M | no disponible | lfm1.0 | safetensors | Referencia sin correccion JSON |
| Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor contexto y licencia permisiva |
| Llama 3.2 1B Instruct | ~1.200 M | 131.072 | Llama 3.2 Community | safetensors, GGUF | Contexto muy superior, licencia con restricciones |

Los datos de Qwen2.5-1.5B y Llama 3.2 1B se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: con 1.2B parametros, la tasa de errores factuales es inherentemente alta; no apto para tareas que exijan precision sin verificacion.
- Sesgos: no documentados en la informacion disponible; los sesgos del modelo base LFM2.5 se heredan y pueden verse alterados por la edicion de pesos.
- Correccion JSON: aunque el ajuste se orienta a mejorar JSON, no hay benchmarks publicados que cuantifiquen la mejora; conviene validar con un conjunto propio de casos.
- Contexto e idiomas: la longitud de contexto no esta publicada; los idiomas soportados son ocho, con el espanol incluido, pero no se documenta su calidad relativa.
- Licencia lfm1.0: revisar el enlace LICENSE del modelo base antes de uso comercial; puede contener restricciones de escala o de atribucion.
- Trazabilidad: es un ajuste de terceros (yasserrmd) sobre un modelo de Liquid AI, cuantizado por mradermacher; hay dos capas de modificacion sobre el modelo original.
- Sin quants ponderados (imatrix): segun el autor, no estaban disponibles; los quants estaticos pueden rendir peor en tareas sensibles a la cuantizacion.
- Uso en produccion: sin benchmarks ni contexto documentado, se recomienda evaluacion exhaustiva antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-1.2B-Instruct-WSP-JSONFix-GGUF
- Modelo base del ajuste: https://huggingface.co/yasserrmd/LFM2.5-1.2B-Instruct-WSP-JSONFix
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM2.5-1.2B-Instruct-WSP-JSONFix-GGUF
- Grafico de comparacion de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
