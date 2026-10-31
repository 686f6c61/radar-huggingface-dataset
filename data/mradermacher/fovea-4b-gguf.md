# mradermacher/fovea-4b-GGUF

## Resumen

Fovea-4b es un modelo de decisión (decision model) multimodal de 4.205 millones de parámetros desarrollado por Sivasuthan, cuantizado aquí en formato GGUF por el usuario mradermacher, conocido por generar cuantizaciones estáticas de gran variedad de modelos de la comunidad. El modelo se etiqueta como "decision-model" con "typed-decisions" y "calibrated-probabilities", lo que sugiere que está especializado en emitir decisiones estructuradas y tipadas con probabilidades calibradas, en lugar de en generación de texto libre. Además, incluye capacidades de visión-language, como indican sus tags y los archivos mmproj (suplemento multimodal) incluidos en el repositorio.

Esta cuantización GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles, con versiones que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16). El modelo original está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial. No se dispone de una model card detallada del autor original con información sobre arquitectura, datos de entrenamiento o benchmarks, por lo que varios apartados de esta ficha se basan únicamente en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con suplemento multimodal, segun archivos mmproj) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors, segun dato de parametros) |

## Arquitectura y entrenamiento

No se ha publicado documentacion tecnica detallada sobre la arquitectura interna de fovea-4b. Los metadatos indican que se trata de un modelo de vision-language con enfoque de "decision model": en lugar de generar texto abierto, emitiria decisiones tipadas ("typed-decisions") con probabilidades calibradas ("calibrated-probabilities"). El tag "jev" no corresponde a una denominacion tecnica estandar publicamente documentada. La presencia de archivos mmproj (0,5 GB en Q8_0 y 0,8 GB en f16) confirma un componente de proyeccion multimodal separado, tipico de arquitecturas de vision-language cuantizadas para llama.cpp.

Sobre el entrenamiento no hay datos disponibles: se desconocen el numero de tokens, la composicion del dataset y si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Toma de decisiones estructuradas: el modelo esta etiquetado como decision-model con typed-decisions, orientado a producir salidas de decision tipadas en lugar de texto libre.
- Probabilidades calibradas: emite estimaciones de probabilidad calibradas asociadas a sus decisiones, util para sistemas que requieren niveles de confianza medibles.
- Capacidades de vision-language: incluye un suplemento multimodal (mmproj) para procesamiento de imagenes, compatible con llama.cpp.
- Uso conversacional: etiquetado como "conversational" en los metadatos del repositorio.
- Ejecucion local: disponible en 12 cuantizaciones GGUF distintas, desde 2,0 GB hasta 8,5 GB, mas los archivos mmproj.
- No hay informacion sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, audio ni modo de pensamiento extendido.

## Casos de uso

- Clasificacion de decisiones con confianza medible: en sistemas donde se necesita una salida binaria o categorica con una probabilidad calibrada asociada (por ejemplo, aprobar o rechazar una solicitud), el enfoque de typed-decisions con calibrated-probabilities es mas adecuado que un LLM generico.
- Moderacion y filtrado de contenido: dado un contenido (texto o imagen, gracias al componente multimodal), el modelo puede emitir una decision tipada con probabilidad de infraccion, integrable en pipelines de moderacion automatica.
- Triaje de incidencias: en un sistema de soporte, el modelo puede clasificar tickets por tipo y prioridad con un nivel de confianza, permitiendo enrutar casos dudosos a revisores humanos cuando la probabilidad calibrada es baja.
- Verificacion visual automatizada: con el suplemento mmproj, puede usarse para inspeccion de imagenes con salida de decision estructurada, como control de calidad visual en procesos industriales o validacion de documentos escaneados.
- Sistemas de enrutado en cascada: su salida probabilistica calibrada lo hace apto como router entre modelos mas grandes y mas pequenos, decidiendo con umbral de confianza si una consulta puede resolverse localmente.
- Ejecucion en dispositivos con recursos limitados: con la cuantizacion Q2_K (2,0 GB) o Q4_K_M (2,8 GB), puede desplegarse en portatiles o mini-PC sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantizacion elegida. Q2_K ocupa unos 2,0 GB; Q4_K_M, unos 2,8 GB; Q8_0, unos 4,6 GB; f16, unos 8,5 GB. Hay que anadir 0,5-0,8 GB si se usa el componente multimodal (mmproj).
- GPU recomendadas: por su tamano reducido, cualquier GPU de consumo con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta con holgura las cuantizaciones Q4 a Q8. No se requieren A100 ni H100.
- Consumer GPUs: cabe comodamente en GPUs de consumo; incluso puede ejecutarse solo en CPU con RAM suficiente (8 GB o mas) gracias a llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros runtimes compatibles con GGUF. No esta orientado a vLLM o TGI, que requieren pesos safetensors del modelo original (Sivasuthan/fovea-4b).
- Latencia y throughput: no disponible; al ser un modelo de ~4.200 millones de parametros, se espera inferencia rapida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

Dado que fovea-4b es un modelo de decision multimodal de ~4B, las alternativas mas cercanas son modelos generales de tamano similar; no hay modelos comparables publicos de la misma categoria especializada en decisiones tipadas con probabilidades calibradas.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| fovea-4b | 4.206 M | no disponible | Si (vision) | Apache 2.0 | Decisiones tipadas con probabilidades calibradas |
| Qwen2.5-VL-3B | 3.750 M | hasta 128K (segun documentacion de la familia) | Si (vision) | Qwen license / Apache 2.0 en algunas variantes | LLM general multimodal |
| Phi-3.5-vision-instruct | 4.152 M | 128K | Si (vision) | MIT | LLM general multimodal |
| Llama 3.2 3B Vision | 3.210 M | 128K | Si (vision) | Llama 3.2 Community License | LLM general multimodal |

## Limitaciones y advertencias

- Documentacion escasa: la model card del modelo original no detalla arquitectura, datos de entrenamiento ni evaluaciones, lo que dificulta evaluar su fiabilidad antes de uso en produccion.
- Idioma: los metadatos solo declaran soporte de ingles ("en"); no hay indicios de soporte de castellano ni otros idiomas.
- Riesgo de alucinacion: no disponible; al tratarse de un modelo de decision con probabilidades calibradas, el riesgo podria ser menor que en LLM generativos, pero no hay datos que lo confirmen.
- Sesgos conocidos: no disponible; sin informacion sobre el dataset de entrenamiento no es posible caracterizar sesgos.
- Cuantizaciones bajas: las versiones Q2_K y Q3_K_S/M/L pueden degradar apreciablemente la calidad, especialmente en la calibracion de probabilidades, aspecto critico en un modelo de decision; se recomiendan Q4_K_M o superiores para cargas serias.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Cuantizaciones weighted/imatrix: no disponibles en el momento de publicacion; el autor indica que pueden solicitarse mediante una Community Discussion.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/fovea-4b-GGUF
- Modelo original: https://huggingface.co/Sivasuthan/fovea-4b
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#fovea-4b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo original: no disponible
