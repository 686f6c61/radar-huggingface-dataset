# mradermacher/Qwen3.5-4B-heretic-2.0-GGUF

## Resumen

Qwen3.5-4B-heretic-2.0-GGUF es una cuantizacion estatica en formato GGUF del modelo p-e-w/Qwen3.5-4B-heretic-2.0, un derivado "abliterated" (decensored) del Qwen3.5-4B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido distribuidor de versiones GGUF de la comunidad, y ofrece trece variantes de cuantizacion (desde Q2_K hasta f16) junto con dos ficheros mmproj para uso multimodal. El modelo base tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y licencia Apache 2.0.

El interes de esta ficha esta en que combina tres cosas: un modelo denso de ~4B con capacidades conversacionales y multimodales (los ficheros mmproj indican soporte de vision), un proceso de "abliteration" que elimina los rechazos aprendidos por alineamiento, y una distribucion en GGUF lista para ejecutarse en hardware de consumo. Es relevante ahora porque permite desplegar localmente un modelo conversacional sin las restricciones de seguridad del modelo original, algo que interesa a investigadores que estudian el comportamiento de modelos y a desarrolladores que necesitan respuestas sin filtros editoriales para tareas creativas o de analisis de contenido sensible.

La informacion publica disponible es limitada: la model card del repositorio GGUF es fundamentalmente un indice de cuantizaciones y no documenta arquitectura interna, datos de entrenamiento ni benchmarks. Los datos que faltan se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se trata de un derivado de Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parametros. La presencia de ficheros mmproj en el repositorio indica que el modelo incorpora un componente multimodal (proyeccion de vision), aunque la model card no documenta su funcionamiento ni el codificador visual asociado.

El proceso de "heretic 2.0" hace referencia a una tecnica de abliteration: se identifican las direcciones de activacion responsables de los comportamientos de rechazo aprendidos durante el alineamiento y se eliminan o atenuan mediante edicion de pesos, sin reentrenar. La model card etiqueta el resultado como "reproducible", lo que sugiere que el autor documenta el procedimiento en el repositorio del modelo base. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original, mas alla de lo que herede de Qwen3.5-4B.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Capacidades multimodales: los ficheros mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imagenes en el pipeline de llama.cpp.
- Comportamiento "decensored": el proceso de abliteration reduce los rechazos del modelo original ante peticiones que el alineamiento estandar bloquearia.
- Razonamiento y generacion de codigo: heredados del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones especificas.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen suele tener cobertura multilingue amplia; no se documenta en esta ficha.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varian las respuestas y los sesgos al eliminar las capas de rechazo, comparando directamente con Qwen3.5-4B original en el mismo hardware.
- Generacion creativa sin filtros editoriales: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, conflicto, contenido adulto) sin que el modelo se niegue a continuar la escena.
- Analisis de contenido sensible: clasificacion, resumen o extraccion de informacion de textos que contienen lenguaje ofensivo o material que dispararia rechazos en modelos alineados.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) cabe en GPUs de consumo de 6-8 GB de VRAM y permite inferencia offline sin dependencia de APIs.
- Prototipado rapido de asistentes conversacionales: el formato GGUF se integra directamente en llama.cpp, Ollama y LM Studio, lo que permite levantar un chatbot funcional en minutos para pruebas de UX.
- Procesamiento multimodal ligero: con el fichero mmproj correspondiente, el modelo puede recibir imagenes junto a texto para tareas de descripcion o extraccion de informacion visual, en un tamano manejable para hardware modesto.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion del mismo modelo, util para medir la degradacion de calidad (perplejidad) frente al tamano en un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
  - mmproj (vision): +0,5 GB (Q8_0) o +0,8 GB (f16)
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 son sobradamente suficientes. Para f16 se recomienda al menos 12 GB.
- Cabe en GPU de consumo: si. Q4_K_M funciona en GPUs de 6 GB (GTX 1660, RTX 2060, RTX 3050) y en Apple Silicon con 8 GB unificados. Las cuantizaciones Q8_0 y f16 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia general para un modelo denso de 4B en Q4_K_M, es esperable un throughput de decenas de tokens por segundo en GPUs de consumo modernas, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-2.0-GGUF (este) | ~4,2 B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones + mmproj) | Decensored, multimodal via mmproj, solo ingles declarado |
| Qwen3.5-4B (original) | ~4,2 B | no disponible | Apache 2.0 | safetensors, GGUF via terceros | Modelo base alineado, con rechazos de seguridad |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar, alineada, sin abliteration |
| Llama-3.2-3B-Instruct | ~3,2 B | 131.072 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar; licencia mas restrictiva que Apache 2.0 |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para este modelo. La ventaja principal frente a los modelos alineados es la ausencia de rechazos; la desventaja es la falta de documentacion tecnica y de evaluaciones que permitan cuantificar la perdida de calidad respecto al original.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval ni perplejidad que permitan estimar la calidad real del modelo o de cada cuantizacion.
- Model card minima: no se documentan arquitectura, contexto, datos de entrenamiento ni procedimiento de abliteration en el repositorio GGUF; hay que remitirse al modelo base para esos detalles.
- Solo ingles declarado: el tag de idioma es `en`; no se garantiza un comportamiento correcto en castellano ni en otros idiomas, aunque el modelo base Qwen probablemente tenga cobertura adicional no documentada aqui.
- Riesgo de alucinacion: como cualquier modelo de 4B, la tasa de alucinacion es mayor que en modelos de mayor tamano; la abliteration no corrige este problema y puede agravarlo al eliminar rechazos que en ocasiones actuaban como salvaguarda ante peticiones sin fundamento.
- Sesgos sin mitigar: al eliminar las capas de alineamiento, los sesgos presentes en los datos de entrenamiento del modelo base pueden aflorar con mayor intensidad y sin los filtros que los atenuaban.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo decensored. El despliegue en produccion de cara al publico conlleva riesgos reputacionales y legales segun el contexto de aplicacion (por ejemplo, en la UE, el Reglamento de IA puede exigir evaluaciones adicionales).
- Contenido generado: el modelo puede producir contenido ofensivo, violento o sexual sin advertirlo; es responsabilidad del desplegador implementar filtros de salida si el caso de uso lo requiere.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card recomienda Q4_K_S o Q4_K_M como opcion rapida y Q8_0 como mejor calidad.
- Repositorio grande (39,9 GB): descargar el repositorio completo no es necesario; conviene bajar solo la cuantizacion deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-GGUF
- Modelo base (heretic 2.0): https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-2.0-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
