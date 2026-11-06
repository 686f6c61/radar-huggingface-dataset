# ml-resources/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos, nativamente multimodal y orientado a tareas agénticas, desarrollado por Moonshot AI. Se presenta como el modelo mas capaz de la familia de clase 3T (tres billones de parametros) hasta la fecha y es el primer miembro de la serie K3.1. Parte de Kimi K3 y se ha post-entrenado mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, con mejoras declaradas en programacion, creacion 3D, investigacion financiera, exactitud factual y capacidades agénticas.

Arquitectonicamente es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones activados por token, distribuidos en 93 capas (1 densa) y 896 expertos con 16 seleccionados por token mas 2 expertos compartidos. La atencion combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated DSA (DeepSeek Sparse Attention), lo que permite sostener una ventana de contexto de 1 millon de tokens.

Su relevancia actual radica en que compite en la categoria de modelos frontera abiertos con contexto extremo y capacidades multimodales, y en que su publicacion como pesos abiertos (con licencia propia) permite a equipos de investigacion y desarrollo evaluar y desplegar un modelo de escala 3T sin depender exclusivamente de APIs propietarias. El repositorio ocupa 1.561,4 GB y esta publicado en formato safetensors con cuantizacion de 8 bits mediante compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atencion hibrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia, `license: other`) |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |

Datos arquitectonicos adicionales: 93 capas (1 densa), dimension oculta de atencion 7168, 96 cabezas de atencion, dimension de cabeza de indice DSA 128, 32 cabezas de indice DSA, top-K DSA de 2048, dimension latente MoE 3584, dimension oculta MoE por experto 3072, 896 expertos, 16 expertos seleccionados por token, 2 expertos compartidos y vocabulario de 160K tokens.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con una composicion de atencion hibrida poco habitual: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (DeepSeek Sparse Attention). Esta combinacion busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance, algo critico para sostener el millon de tokens de contexto. El enrutamiento MoE selecciona 16 de 896 expertos por token, con 2 expertos compartidos siempre activos, y una dimension latente de 3584 que reduce el coste del calculo de expertos. La dimension oculta de cada experto es de 3072.

El post-entrenamiento se basa en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, segun la model card. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales como DPO o RLHF clasico de forma separada. Tampoco se detallan innovaciones como decodificacion especulativa mas alla de las ya mencionadas en la composicion de atencion.

## Capacidades

- Generacion de texto y razonamiento general en multiples dominios.
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`), lo que permite tareas de comprension visual combinadas con texto.
- Programacion y generacion de codigo, con mejoras declaradas en el post-entrenamiento.
- Creacion 3D: la model card menciona mejoras sustanciales en este dominio.
- Investigacion financiera y exactitud factual reforzadas mediante RL conjunto.
- Capacidades agénticas: razonamiento multi-paso y ejecucion de tareas encadenadas.
- Contexto de 1 millon de tokens, adecuado para documentos extensos y conversaciones de largo recorrido.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Analisis de documentacion financiera extensa: con 1M tokens de contexto, el modelo puede ingerir informes anuales, transcripciones de resultados y estados financieros completos en una sola pasada y responder preguntas con trazabilidad sobre el texto original, aprovechando su post-entrenamiento especifico en investigacion financiera.
- Asistentes de programacion en repositorios grandes: la ventana de contexto permite cargar multiples ficheros y el historial de un repositorio para tareas de refactorizacion, revision de codigo y generacion de tests, con mejoras declaradas en codigo tras el RL conjunto.
- Agentes autonomos multi-paso: su orientacion agéntica y el contexto largo permiten mantener el estado de una tarea compleja (busqueda, planificacion, ejecucion y verificacion) a lo largo de muchas iteraciones sin perder informacion previa.
- Generacion y edicion de contenido 3D: la model card destaca mejoras en creacion 3D, por lo que puede emplearse en pipelines que combinan descripciones textuales e imagenes de referencia para producir especificaciones o assets 3D.
- Atencion al cliente multimodal: al aceptar imagen-texto, puede gestionar conversaciones donde el usuario adjunta capturas, fotos de productos o documentos escaneados, manteniendo contexto multi-turno largo.
- Investigacion y verificacion factual: su enfasis en exactitud factual lo hace adecuado para tareas de contraste de afirmaciones contra fuentes extensas cargadas en contexto, con salida razonada paso a paso.
- Procesamiento de corpus legales o cientificos: la ventana de 1M tokens permite resumir y extraer entidades de expedientes o articulos completos sin fragmentacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1.561,4 GB en safetensors con cuantizacion de 8 bits; se requiere un cluster multi-GPU con al menos ~1,6 TB de memoria agregada para cargar los pesos en 8 bits, y bastante mas para precision completa.
- GPU recomendadas: no es viable en GPUs consumer individuales; se necesitan nodos con multiples aceleradores de clase数据中心 (A100 80GB, H100 80GB, H200) en configuraciones de decenas de GPUs.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: transformers con `custom_code` (requiere confiar en codigo remoto); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible. Dado el tamano, el despliegue practico pasa por inferencia distribuida en cluster.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | kimi-k3.1-pro (propia) | Pesos abiertos en HF |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del K3.1 Pro |
| Alternativas de clase 3T comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos competidores directos que permitan una comparativa cuantitativa fiable. La unica referencia interna es Kimi K3, del que deriva mediante post-entrenamiento.

## Limitaciones y advertencias

- Licencia propia (`kimi-k3.1-pro`, `license: other`): es imprescindible revisar los terminos del fichero LICENSE antes de cualquier uso comercial; no es una licencia OSI estandar.
- Sesgos conocidos: no se documentan en la informacion disponible; cabe esperar los sesgos habituales de los corpus web a gran escala.
- Riesgo de alucinacion: aunque la model card declara mejoras en exactitud factual, no se aportan metricas que lo cuantifiquen; en produccion debe verificarse la salida en dominios sensibles.
- Limitaciones de contexto o idioma: se declara 1M de tokens, pero no se especifica la degradacion del rendimiento en function de la posicion dentro de la ventana; los idiomas soportados no estan disponibles.
- Requisitos de infraestructura extremos: 1,5 TB de pesos en 8 bits hacen inviable el despliegue en entornos sin cluster; el coste operativo es muy alto.
- Dependencia de `custom_code`: la carga requiere ejecutar codigo remoto del repositorio, lo que introduce un riesgo de seguridad y de mantenimiento a largo plazo.
- Madurez del ecosistema: al ser un lanzamiento reciente con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia comunitaria de integraciones estables (vLLM, TGI, etc.).
- Ausencia de benchmarks publicos en la informacion disponible: no es posible validar de forma independiente las mejoras declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/ml-resources/Kimi-K3.1-Pro
- Organizacion Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Tech Blog: https://www.kimi.ai/blog/kimi-k3-1-pro
- API Quickstart: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
