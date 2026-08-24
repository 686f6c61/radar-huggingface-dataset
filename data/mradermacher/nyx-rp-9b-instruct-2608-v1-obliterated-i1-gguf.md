# mradermacher/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-i1-GGUF

## Resumen

Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-i1-GGUF es una version cuantizada en formato GGUF del modelo Nyx-RP-9B-Instruct-2608-v1-OBLITERATED, desarrollado por Muyuxiao y posteriormente cuantizado por mradermacher. El sufijo "OBLITERATED" indica que el modelo ha pasado por un proceso de abliteration (ablacion direccional), una tecnica que elimina el alignment de seguridad (censura) de modelos transformer sin necesidad de reentrenamiento. El sufijo "i1" indica que las cuantizaciones usan imatrix (matriz de importancia) para optimizar la calidad de la cuantizacion.

Con aproximadamente 8,95 mil millones de parametros, este modelo esta orientado a conversacion y roleplay sin restricciones de contenido. Es relevante para desarrolladores que buscan modelos locales de roleplay o generacion de texto creativo sin filtros de seguridad, ejecutables en hardware consumer mediante llama.cpp u Ollama. La cuantizacion GGUF permite desplegarlo en una amplia gama de dispositivos, desde CPU hasta GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como transformers) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, IQ2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix de 0,1 GB incluido) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base no esta documentada en la informacion disponible. Se sabe que es un modelo de ~8,95B parametros etiquetado como transformers, lo que sugiere una arquitectura transformer clasica, pero no se confirma el numero de capas, dimensiones ocultas ni el tipo de atencion. El modelo base Nyx-RP-9B-Instruct-2608-v1-OBLITERATED fue sometido a un proceso de abliteration, una tecnica de ablacion direccional que elimina los circuitos neuronales responsables del rechazo de peticiones consideradas peligrosas o inapropiadas. Esta tecnica, implementada en herramientas como Heretic, combina ablacion direccional con optimizacion de hiperparametros basada en TPE (Tree-structured Parzen Estimator) mediante Optuna, permitiendo eliminar la censura sin post-entrenamiento costoso. La cuantizacion GGUF con imatrix fue realizada por mradermacher, que aplica matrices de importancia para mejorar la calidad de los quants de baja precision.

## Capacidades

- Generacion de texto conversacional y narrativo sin filtros de censura, gracias al proceso de abliteration aplicado al modelo base.
- Sigue instrucciones en formato instruct, adecuado para tareas de chat y roleplay.
- Conversacion multi-turno orientada a interacciones prolongadas de caracter narrativo o interpretativo.
- Capacidad multilingue limitada: el modelo esta etiquetado exclusivamente como en (ingles), sin soporte declarado para otros idiomas.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener personajes y narrativas durante sesiones largas, siendo su caso de uso principal. Se desplegaria localmente con llama.cpp o Ollama para garantizar privacidad y ausencia de moderacion externa.
- Escritura creativa sin restricciones: generacion de ficcion, dialogos y guiones con contenido adulto o temas tabu que otros modelos rechazarian. Adecuado para autores que necesitan explorar tramas sin filtros.
- Prototipado de asistentes conversacionales sin politicas de seguridad: investigadores que estudian el comportamiento de modelos sin alignment pueden usarlo como base para experimentos de seguridad o analisis de sesgos.
- Generacion de datasets sinteticos de conversacion: el modelo puede producir dialogos variados para entrenar o evaluar otros sistemas, incluyendo ejemplos de interacciones que modelos censurados no generarian.
- Evaluacion de tecnicas de abliteration: al ser un modelo ya obliterado, sirve como referencia para comparar el efecto de la ablacion direccional frente a su version original con alignment.
- Inferencia en hardware modesto: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs consumer de 8 GB o incluso en CPU con suficiente RAM, permitiendo despliegues locales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~8,95B parametros, una cuantizacion Q4_K_M ocupa aproximadamente 5-6 GB, y Q6_K alrededor de 7-8 GB. Las cuantizaciones IQ1 e IQ2 pueden reducir el uso a 2-4 GB, aunque con perdida notable de calidad.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 o equivalentes de AMD con 8-12 GB de VRAM para las cuantizaciones medias. Las cuantizaciones mas bajas (IQ2, IQ3) pueden caber en 4-6 GB.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4_K_M y superiores caben en GPUs de 8 GB; las mas bajas incluso en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien es compatible con vLLM si se convierte a otro formato, aunque el formato nativo es GGUF.
- Latencia y throughput: no disponible. Dependera de la cuantizacion, el hardware y el backend utilizado.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables especificos en la misma categoria (roleplay sin censura de ~9B). Alternativas genericas en el mismo rango de parametros incluyen:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nyx-RP-9B-Instruct-2608-v1-OBLITERATED (base) | ~8,95B | no disponible | no disponible | safetensors |
| Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-i1-GGUF (este) | ~8,95B | no disponible | no disponible | GGUF |
| Nyx-RP-9B-Preview-2608-v0.1-i1-GGUF | ~8,95B (estimado) | no disponible | no disponible | GGUF |

La comparativa con modelos de otras familias (como Mistral 7B o Llama 3 8B) no es posible sin datos de benchmarks o especificaciones del modelo base.

## Limitaciones y advertencias

- Modelo sin censura: al haber sido sometido a abliteration, puede generar contenido explicito, ofensivo, ilegal o danino sin restricciones. No es adecuado para aplicaciones orientadas al publico general sin capas adicionales de moderacion.
- Licencia no especificada: el uso comercial es juridicamente arriesgado al no conocerse los terminos de la licencia del modelo base ni de la cuantizacion.
- Solo ingles: no soporta otros idiomas de forma declarada, lo que limita su uso en entornos multilingues.
- Sin datos de benchmarks: no se puede evaluar su calidad objetiva frente a otros modelos; el rendimiento real es desconocido.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en contextos largos o temas especializados.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que dificulta planificar sesiones largas de roleplay o procesamiento de documentos extensos.
- Arquitectura no documentada: al no conocerse los detalles arquitectonicos, es dificil predecir su comportamiento en tareas especificas o su eficiencia computacional.
- Fecha de creacion futura (2026-08-23): el modelo esta fechado en agosto de 2026, lo que sugiere que es muy reciente y puede tener poca comunidad de usuarios o soporte.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-i1-GGUF
- Modelo base (Muyuxiao): https://huggingface.co/Muyuxiao/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-GGUF
- Version Preview del mismo autor: https://huggingface.co/mradermacher/Nyx-RP-9B-Preview-2608-v0.1-i1-GGUF
- Herramienta Heretic (abliteration automatica): https://github.com/p-e-w/heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-i1-GGUF
