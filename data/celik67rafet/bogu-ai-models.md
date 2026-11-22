# celik67rafet/bogu-ai-models

## Resumen

Bögü AI Models es un repositorio de artefactos de inferencia (pesos en formato GGUF y ficheros de proyector visual) publicado por el usuario celik67rafet bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero por el autor, sino de un paquete de distribución que las aplicaciones de escritorio, móvil y extensión de VS Code de la suite "Bögü" descargan automáticamente durante su instalación. El repositorio declara la etiqueta `gemma4`, lo que sugiere que los pesos empaquetados derivan de la familia Gemma de Google, aunque la model card no lo confirma de forma explícita.

El dato objetivo disponible es el recuento de parámetros en safetensors: 475.729.088, es decir, aproximadamente 476 millones de parámetros. Se trata, por tanto, de un modelo de escala pequeña, coherente con un uso en dispositivos de consumo y con cuantización Q4_K_M, que es la variante que el autor indica que se distribuye. El repositorio ocupa 2,0 GB.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: no hay información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks ni proceso de alineación. Su interés práctico radica en documentar qué contiene el repositorio para quien pretenda integrarlo o auditarlo, y en señalar las lagunas de información existentes antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repo indica `gemma4`; no confirmado en la model card) |
| Parametros totales | 475.729.088 (aprox. 476 M, segun safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), segun la model card |
| Idiomas soportados | turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors; incluye ficheros de proyector visual |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La etiqueta `gemma4` del repositorio apunta a un posible origen en la familia Gemma, pero la model card no detalla capa por capa, tipo de atencion, funcion de activacion ni vocabulario. Tampoco se especifica si se trata de un transformer denso convencional o de una variante con atencion lineal u otro esquema.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La presencia de "ficheros de proyector visual" en el repositorio sugiere que el paquete incluye componentes para un modelo multimodal (vision-lenguaje), pero no se detalla que codificador visual se emplea ni como se alinean las modalidades. Toda esta seccion debe considerarse no disponible a efectos de evaluacion tecnica.

## Capacidades

- Generacion de texto en turco e ingles, segun los idiomas declarados en la model card.
- Posible soporte de vision: el repositorio incluye ficheros de proyector visual, lo que indica que el paquete esta pensado para un modelo con entrada de imagenes, aunque no se detalla su alcance.
- Distribucion orientada a aplicaciones de escritorio, movil y extension de VS Code, lo que implica integracion prevista en asistentes de productividad y edicion de codigo.
- No hay informacion publicada sobre tool calling, function calling, razonamiento multi-paso, modo "thinking" ni capacidades de audio.
- No se documentan capacidades de agente ni de ejecucion de tareas encadenadas.

## Casos de uso

- Asistente integrado en la extension de VS Code de Bögü: el paquete esta disenado para descargarse automaticamente en la instalacion, de modo que el modelo puede ofrecer autocompletado, explicacion de fragmentos de codigo y respuestas en turco e ingles dentro del editor.
- Asistente de escritorio local: con 476 M de parametros y cuantizacion Q4_K_M, el modelo puede ejecutarse en CPU o en GPU de gama baja sin depender de la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Aplicacion movil de asistencia conversacional: el tamano reducido permite empaquetar el modelo en apps Android o iOS para respuestas offline en turco e ingles.
- Descripcion de imagenes en aplicaciones de accesibilidad: si el proyector visual esta funcional, podria emplearse para generar descripciones breves de imagenes capturadas por la camara del dispositivo.
- Traduccion turco-ingles de textos cortos: los dos idiomas declarados permiten usos de traduccion basica en interfaces de usuario y mensajes de aplicacion.
- Prototipado y evaluacion de pipelines GGUF: sirve como banco de pruebas para validar flujos de despliegue con llama.cpp u Ollama antes de migrar a modelos de mayor tamano.
- Filtrado y clasificacion de texto en backends ligeros: por su tamano, puede integrarse en servicios con restricciones de memoria para tareas de etiquetado simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 476 M de parametros en Q4_K_M, el peso de los pesos ronda los 300 MB; sumando overhead de contexto y cache KV, el consumo tipico se situa en torno a 0,5-1 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en iGPU y en dispositivos moviles de gama media.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. No se ha confirmado soporte en vLLM ni en TGI para este paquete concreto.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera una latencia baja en hardware de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bögü AI Models (este repo) | ~476 M | no disponible | Apache 2.0 | GGUF, safetensors | Paquete de distribucion para apps Bögü; sin benchmarks |
| Gemma 3 270M (Google) | 270 M | 32K (segun documentacion publica de Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Modelo pequeno oficial de Google; requiere aceptar terminos |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32K (segun documentacion publica de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamano comparable con benchmarks publicados |
| SmolLM2-360M (Hugging Face) | 360 M | 8K (segun documentacion publica de SmolLM2) | Apache 2.0 | safetensors, GGUF | Modelo pequeno con model card detallada y evaluaciones |

La comparacion se limita a tamano, licencia y formato, ya que no existen datos de rendimiento publicados para Bögü AI Models. Las cifras de contexto de los modelos alternativos provienen de su documentacion oficial y no de una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay informacion sobre arquitectura, datos de entrenamiento ni evaluaciones, lo que impide auditar el modelo antes de usarlo en produccion.
- Riesgo de alucinacion elevado: con 476 M de parametros, la fiabilidad factual en tareas abiertas es limitada, especialmente fuera de los idiomas declarados.
- Cobertura linguistica restringida a turco e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La etiqueta `gemma4` sugiere un origen en la familia Gemma, pero la licencia declarada es Apache 2.0; conviene verificar la procedencia de los pesos y los terminos aplicables antes de un uso comercial, ya que los modelos Gemma de Google se distribuyen bajo sus propios terminos de uso.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se documenta el comportamiento del proyector visual ni la calidad de las respuestas multimodales.
- No hay garantias de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/celik67rafet/bogu-ai-models
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
