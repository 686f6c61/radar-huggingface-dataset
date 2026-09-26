# antareslabs/hunch-0.6b-preview-GGUF

## Resumen

Hunch 0.6b preview GGUF es la conversion a formato GGUF del modelo base `antareslabs/hunch-0.6b-preview`, publicada por el propio laboratorio antareslabs. Se trata de un modelo pequeno, de 596.049.920 parametros (aproximadamente 0,6 mil millones), distribuido bajo licencia Apache-2.0. Esta publicacion no es un modelo nuevo, sino un artefacto de cuantizacion: empaqueta el checkpoint original en un unico archivo GGUF a precision f16 para su uso en runtimes compatibles.

El elemento diferencial de esta ficha no es la arquitectura ni las capacidades del modelo, sino el proceso de control de calidad aplicado a la conversion. Segun la model card, cada archivo GGUF publicado ha superado una "equivalence gate": se evaluo el resultado de la version cuantizada frente a la ejecucion fp32 en PyTorch del mismo checkpoint sobre 6.000 preguntas retenidas (held-out). En el caso del archivo f16, la conversion cambia 1 de esas 6.000 respuestas y presenta una distancia de variacion total (TV) maxima de 4,88e-03 frente a un umbral de aceptacion de 7,68e-02.

El modelo es relevante por tres motivos: el tamano reducido lo hace desplegable en hardware muy modesto, el formato GGUF facilita su integracion en ecosistemas de inferencia local, y el informe de equivalencia documentado aporta trazabilidad sobre el impacto real de la cuantizacion, algo poco habitual en publicaciones de este tipo. No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni las capacidades declaradas del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico archivo publicado); existen otras precisiones probadas que no superaron la equivalence gate, segun la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `hunch-0.6b-preview.f16.gguf`) |
| Modelo base | antareslabs/hunch-0.6b-preview |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion (repositorio) | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se han publicado datos sobre la arquitectura del modelo base en la informacion disponible. No se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida ni un modelo de estado (SSM). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato tecnico verificable asociado a esta publicacion es el procedimiento de validacion de la cuantizacion. La model card indica que cada archivo GGUF fue puntuado sobre 6.000 preguntas held-out contra la ejecucion en fp32 del mismo checkpoint. El archivo f16 cambia 1 de 6.000 respuestas respecto a fp32 (frente a 28 cambios de bf16 en solitario, segun la propia card), con una distancia TV maxima de 4,88e-03 y un umbral de aceptacion de 7,68e-02. La evaluacion se realizo leyendo el modelo en Apple silicon mediante Metal. La regla de aceptacion y las builds que fallaron se documentan en el archivo FORMATS.md del repositorio de GitHub.

## Capacidades

- No se documentan capacidades especificas del modelo base en la informacion proporcionada.
- La unica evidencia funcional disponible es que el modelo genera respuestas a preguntas: el proceso de equivalence gate lo evaluo sobre 6.000 preguntas retenidas, lo que implica una tarea de generacion de texto orientada a responder consultas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Nota: dado que no se documentan las capacidades reales del modelo base, los casos de uso que siguen son escenarios genericos aplicables a un modelo de generacion de texto de ~0,6B parametros en formato GGUF, no una descripcion de capacidades confirmadas.

- Inferencia local en hardware modesto: al ocupar aproximadamente 1,2 GB en f16, el modelo puede ejecutarse en equipos sin GPU dedicada o con GPU integrada, util para prototipos y demos que no requieren acceso a un servicio en la nube.
- Despliegue en el borde (edge): su tamano permite empaquetarlo dentro de aplicaciones de escritorio o moviles con runtimes GGUF, para tareas de generacion de texto de baja latencia y sin conectividad.
- Clasificacion y etiquetado de texto: modelos de este tamano se emplean habitualmente para tareas de extraccion o categorizacion de respuestas cortas, aprovechando su bajo coste por inferencia.
- Generacion asistida en formularios o interfaces conversacionales simples: adecuado para autocompletar respuestas cuando el contexto es corto, siempre que se valide su calidad real.
- Experimentacion academica y educativa: reproduce el proceso de validacion de cuantizacion (equivalence gate sobre 6.000 preguntas) y sirve para estudiar el impacto de la precision en las salidas.
- Pruebas de integracion de pipelines GGUF: util para verificar cargadores y toolchains que consumen GGUF, dado que se ofrece un archivo con informe de equivalencia documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico conjunto de datos reportado corresponde al control de equivalencia de la cuantizacion:

| Metrica | Valor |
|---|---|
| Conjunto de evaluacion | 6.000 preguntas held-out |
| Referencia | ejecucion fp32 en PyTorch del mismo checkpoint |
| Respuestas modificadas por la conversion f16 (GGUF) | 1 de 6.000 |
| Respuestas modificadas por bf16 (referencia en la card) | 28 de 6.000 |
| Distancia TV maxima (f16) | 4,88e-03 |
| Umbral de aceptacion (TV floor) | 7,68e-02 |
| Resultado de la gate | pass |
| Entorno de lectura | Apple silicon (Metal) |

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 1,2-1,5 GB para los pesos (596M parametros x 2 bytes), mas el espacio de cache KV segun la longitud de contexto, que no se especifica.
- GPU recomendadas: cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.); tambien es viable en GPU integradas y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en sistemas sin GPU dedicada.
- Ejecucion en Apple silicon: confirmada en la model card (lectura via Metal).
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; carga mediante `hunch.formats.hunch_gguf.load(path)` del repositorio de Hunch; el tag `endpoints_compatible` sugiere compatibilidad con despliegues tipo endpoint. No se confirma soporte de vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles.
- Nota: la temperatura de release esta embebida en el archivo GGUF y se aplica por defecto al cargarlo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. No se documentan arquitectura, contexto ni rendimiento del modelo base, y la informacion proporcionada no identifica modelos comparables. Por tanto, la comparativa se marca como no disponible. Los criterios que cabria comparar, si se publicaran datos, serian: parametros (596M), formato (GGUF f16), licencia (Apache-2.0) y disponibilidad (repositorio en HuggingFace de antareslabs).

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al no disponerse de informacion sobre los datos de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinacion: no evaluado ni reportado; en modelos de este tamano el riesgo suele ser alto, pero no hay datos confirmados para este caso.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la longitud de contexto y los idiomas soportados.
- El archivo publicado es unicamente f16. La model card indica que otras precisiones se probaron pero no superaron la equivalence gate; no deben asumirse disponibles.
- La fecha de creacion del repositorio (2026-09-25) es posterior a la fecha actual de consulta, lo que puede indicar una publicacion programada o un error de metadatos.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion correspondiente.
- Para produccion, debe validarse la calidad real del modelo base, ya que esta publicacion solo garantiza la equivalencia numerica de la cuantizacion, no la adecuacion de las respuestas a un caso de uso concreto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/antareslabs/hunch-0.6b-preview-GGUF
- Modelo base en HuggingFace: https://huggingface.co/antareslabs/hunch-0.6b-preview
- Repositorio Hunch (instrucciones de carga): https://github.com/antareslabsorg/hunch/blob/main/README.md
- Regla de aceptacion y builds fallidas (FORMATS.md): https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
