# mradermacher/LFM3-1.7B-3D-Coder-GGUF

## Resumen

LFM3-1.7B-3D-Coder-GGUF es la version cuantizada en formato GGUF del modelo syaikhipin/LFM3-1.7B-3D-Coder, un modelo de generacion de codigo especializado en escenas 3D con Three.js. El modelo base parte de LFM3 (Liquid Foundation Model 3), la familia de modelos hibridos de Liquid AI, y ha sido ajustado mediante SFT (supervised fine-tuning) sobre el dataset ccore/ThreeJS-3D-Scenes. Con 1.728.801.600 parametros totales, esta disenado para generar codigo JavaScript orientado a la construccion de escenas tridimensionales.

La relevancia de esta publicacion radica en dos factores. Por un lado, la especializacion: se trata de un modelo pequeno y focalizado en un dominio muy concreto (Three.js y generacion de escenas 3D), lo que permite ejecutarlo en hardware modesto. Por otro, la cuantizacion: mradermacher ofrece el modelo en once variantes GGUF que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16), facilitando su despliegue en entornos locales y con recursos limitados.

Es importante senalar que esta ficha describe la version cuantizada, no el modelo original. El autor de la cuantizacion es mradermacher, y la model card disponible no incluye informacion detallada sobre arquitectura interna, contexto o datos de entrenamiento mas alla de las etiquetas y el dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (etiqueta "hybrid"; detalles no disponibles) |
| Parametros totales | 1.728.801.600 (1,7 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm1.0 (licencia propia de Liquid AI; comercializacion sujeta a sus terminos) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers |
| Tamano del repo | 15,9 GB (incluye todas las variantes) |

## Arquitectura y entrenamiento

La model card disponible no detalla la arquitectura interna del modelo base. La etiqueta "hybrid" sugiere que LFM3-1.7B-3D-Coder podria emplear una arquitectura mixta (posiblemente combinando mecanismos de atencion y capas recurrentes lineales, caracteristica de la familia LFM de Liquid AI), pero esta informacion no se confirma en la documentacion proporcionada. El modelo tiene 1.728.801.600 parametros totales y no se indica que sea un modelo MoE, por lo que se asume un transformer denso.

En cuanto al entrenamiento, el modelo parte de LFM3-1.7B y ha sido ajustado mediante SFT sobre el dataset ccore/ThreeJS-3D-Scenes, un conjunto de datos orientado a la generacion de codigo Three.js. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion realizada por mradermacher es estatica (sin quants ponderados ni imatrix), segun indica el propio autor.

## Capacidades

- Generacion de codigo especializado en Three.js para la construccion de escenas 3D.
- Generacion de codigo JavaScript orientado a graficos y visualizacion tridimensional.
- Conversacion multi-turno (etiqueta "conversational").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas Three.js para prototipado rapido: el modelo puede producir codigo JavaScript que cree escenas 3D basicas (geometrias, luces, camaras y materiales) a partir de una descripcion en lenguaje natural, acelerando el prototipado de demos web.
- Asistente en editores de codigo para desarrollo 3D: integrado como autocompletado o chat, puede sugerir fragmentos de codigo Three.js mientras el desarrollador trabaja en un proyecto de visualizacion.
- Generacion de ejemplos educativos: util para crear ejercicios y ejemplos de codigo sobre Three.js en cursos de graficos por computador, dado su ajuste especifico al dominio.
- Automatizacion de content pipelines 3D: generacion de escenas parametrizadas a partir de plantillas o descripciones, reduciendo el trabajo manual en la creacion de assets 3D para webs.
- Despliegue local en estaciones de trabajo modestas: gracias a sus cuantizaciones de 1,2-1,4 GB (Q4_K_S, Q4_K_M) puede ejecutarse en portatiles con GPU consumer, lo que facilita entornos de desarrollo sin conexion.
- Pruebas de concepto en entornos CI/CD: el modelo puede generar codigo de escenas para validar pipelines de renderizado o para producir fixtures de test en proyectos que usen Three.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): aproximadamente 1,0-1,5 GB para Q3_K_S a Q4_K_M; unos 1,9 GB para Q8_0; unos 3,6 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo cabe en GPU consumer como RTX 3060, RTX 4060 o superiores. Para f16 se recomienda al menos 4-6 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. Al ser un modelo de 1,7 B parametros, la inferencia en CPU es viable.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-3D-Coder-GGUF (este) | 1,7 B | No disponible | Three.js / 3D | lfm1.0 | GGUF |
| Modelos de codigo genericos de ~1-2 B | No disponible | No disponible | Codigo general | Variable | Varios |
| Alternativas de generacion de codigo Three.js | No disponible | No disponible | 3D | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de codigo Three.js con ~1,7 B parametros) en la documentacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para Three.js y generacion de escenas 3D; su rendimiento en otras tareas de codigo o texto general puede ser limitado.
- Idioma: solo soporta ingles, lo que restringe su uso en entornos en castellano sin traduccion previa.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede producir APIs inexistentes o codigo Three.js no funcional; se recomienda validacion en ejecucion.
- Licencia lfm1.0: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; es necesario revisar los terminos antes de desplegarlo en produccion.
- Cuantizacion: las versiones de menor tamano (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad.
- Sesgos: no se dispone de informacion sobre sesgos conocidos en la documentacion proporcionada.
- Limitaciones de contexto: no se dispone de informacion sobre la longitud de contexto del modelo base.
- Sin datos de benchmarks: no hay evaluaciones publicadas que permitan comparar su calidad objetivamente.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/syaikhipin/LFM3-1.7B-3D-Coder
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-3D-Coder-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset de ajuste: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
