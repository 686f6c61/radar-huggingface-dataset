# ardana-ai/decider-0.8b-GGUF

## Resumen

decider-0.8b-GGUF es una version cuantizada en formato GGUF del modelo Mapika/decider-0.8b, publicada por el usuario ardana-ai. Se trata de un modelo pequeno de aproximadamente 752 millones de parametros (752.393.024 en safetensors), pensado para tareas conversacionales y de decision, segun se deduce de su nombre y de la etiqueta "conversational" asociada al repositorio. El modelo base fue desarrollado por Mapika y esta licenciado bajo Apache 2.0, licencia que se mantiene en esta conversion.

La relevancia de esta publicacion radica en que ofrece el modelo en un unico archivo GGUF con cuantizacion Q8_0, lo que facilita su ejecucion en herramientas ampliamente adoptadas como llama.cpp u Ollama, tanto en CPU como en GPUs de consumo. La conversion se realizo con `convert_hf_to_gguf.py` de llama.cpp (build b11074) usando `--outtype q8_0 --no-nextn`, lo que implica que se excluyo la cabeza de prediccion multi-token (multi-token-prediction head) del modelo original.

No obstante, la informacion publica disponible es muy limitada: la model card no detalla la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base, por lo que muchos apartados de esta ficha quedan marcados como "no disponible". El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Mapika/decider-0.8b; no se detalla en la informacion proporcionada) |
| Parametros totales | 752.393.024 (~752 M) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el repositorio solo publica el archivo Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`decider-0.8b-Q8_0.gguf`); se incluyen `chat_template.jinja`, `decider_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo base Mapika/decider-0.8b. Por el tamano de parametros (752 M) y por la presencia de un archivo `tokenizer.json` y una plantilla de chat, es plausible que se trate de un transformer decodificador de tipo causal, pero esto no se confirma en la informacion proporcionada y, por tanto, debe tratarse como no verificado. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico detalle tecnico relevante documentado es el proceso de conversion: el modelo se convirtio a GGUF empleando `llama.cpp` build b11074 con el comando `convert_hf_to_gguf.py --outtype q8_0 --no-nextn`, partiendo de la revision `a0a01d6f8135298f400a8c856b355793012ae971` del repositorio `Mapika/decider-0.8b`. El flag `--no-nextn` indica que se omitio la cabeza de prediccion multi-token (multi-token prediction), presente en el modelo original. La conversion se enmarca en el flujo de trabajo del repositorio de Ardana, invocada mediante `cargo xtask onnx convert decider-0.8b`. No se dispone de informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto de tipo conversacional: la etiqueta "conversational" del repositorio y la presencia de `chat_template.jinja` indican que el modelo base esta preparado para dialogos multi-turno.
- Modelo de decision: el nombre "decider" sugiere que el modelo podria estar orientado a tareas de seleccion o decision (por ejemplo, elegir entre opciones o rutas de accion), aunque este extremo no se detalla en la informacion disponible.
- Integracion con el ecosistema Ardana: la model card menciona el comando `ardana run decider-0.8b`, lo que indica soporte dentro de la libreria Ardana.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse detras de interfaces compatibles con la API de inferencia de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional ligero en local: con 752 M de parametros, el modelo puede ejecutarse en un portatil o en una maquina sin GPU dedicada mediante llama.cpp, ofreciendo respuestas conversacionales basicas en entornos con recursos limitados.
- Clasificacion y enrutado de decisiones: si el modelo esta efectivamente orientado a tareas de decision, podria emplearse como componente de enrutado (por ejemplo, decidir que herramienta o rama de un flujo ejecutar) dentro de un pipeline mayor, dado su bajo coste de inferencia.
- Prototipado rapido de aplicaciones de chat: gracias al archivo GGUF unico y a la plantilla de chat incluida, es posible integrarlo en un backend de pruebas en minutos, sin necesidad de convertir pesos ni gestionar dependencias pesadas.
- Preprocesado o filtrado de texto en pipelines: por su tamano reducido, puede usarse como etapa de cribado para tareas de resumen corto, normalizacion o reformulacion antes de pasar el texto a un modelo mayor.
- Despliegue en dispositivos con memoria restringida: el archivo Q8_0 ocupa aproximadamente 0,8 GB, lo que permite su uso en contenedores pequenos, entornos edge o instancias de CPU de bajo coste.
- Evaluacion comparativa de modelos pequenos: util como referencia dentro de estudios academicos sobre modelos sub-1B, especialmente por su licencia Apache 2.0 y su formato GGUF listo para usar.
- Integracion en herramientas de linea de comandos: mediante `ardana run decider-0.8b` o llama.cpp, puede incorporarse a scripts de automatizacion locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa aproximadamente 0,8 GB; con contexto y overhead de inferencia, el consumo tipico se situa en torno a 1-1,5 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin dificultad, si bien el hardware resulta en gran medida sobredimensionado para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en graficas integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable y probablemente adecuada, dado el bajo numero de parametros.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con infraestructuras de endpoints al estilo Hugging Face. No se confirma soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales conocidas de alternativas habituales en el rango sub-1B. Los valores de las alternativas se incluyen a titulo orientativo y pueden variar entre revisiones.

| Modelo | Parametros | Formato | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|
| ardana-ai/decider-0.8b-GGUF | ~752 M | GGUF (Q8_0) | Apache 2.0 | no disponible | no disponible |
| Qwen2.5-0.5B-Instruct | ~494 M | safetensors, GGUF | Apache 2.0 | 32 768 tokens | benchmarks publicos por el autor |
| Llama-3.2-1B-Instruct | ~1,24 B | safetensors, GGUF | Llama 3.2 Community License | 128 000 tokens | benchmarks publicos por el autor |
| SmolLM2-360M-Instruct | ~362 M | safetensors, GGUF | Apache 2.0 | 8 192 tokens | benchmarks publicos por el autor |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no detallarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos potenciales.
- Riesgo de alucinacion: previsiblemente elevado, como en cualquier modelo de este tamano; la model card no aporta informacion sobre mitigaciones.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos; no debe asumirse un buen rendimiento en castellano sin verificacion previa.
- Exclusion de la cabeza multi-token: la conversion se realizo con `--no-nextn`, de modo que el archivo GGUF no incluye la cabeza de prediccion multi-token del modelo original. Si algun flujo dependia de esa capacidad, no estara disponible en esta version.
- Falta de documentacion: la model card es muy escasa; no hay informacion sobre datos de entrenamiento, evaluaciones ni limitaciones declaradas por el autor, lo que dificulta su uso en produccion sin una validacion propia.
- Adopcion nula: el repositorio registra 0 descargas y 0 interacciones, por lo que no existe una comunidad que haya reportado problemas o comportamientos inesperados.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No obstante, conviene verificar la licencia y las condiciones del modelo base `Mapika/decider-0.8b`, ya que esta ficha asume que se mantiene Apache 2.0 segun lo indicado en la model card.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-10-03, fecha futura respecto a la redaccion habitual de este tipo de fichas; conviene confirmarla directamente en Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ardana-ai/decider-0.8b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Revision del modelo base usada en la conversion: https://huggingface.co/Mapika/decider-0.8b/tree/a0a01d6f8135298f400a8c856b355793012ae971
- llama.cpp (herramienta de conversion y runtime GGUF): https://github.com/ggerganov/llama.cpp
