# LeVraiCNL/Luth-2-0.8B-abliterated-Q8_0-GGUF

## Resumen

Luth-2-0.8B-abliterated-Q8_0-GGUF es una cuantizacion en formato GGUF, concreta­mente en Q8_0, del modelo LeVraiCNL/Luth-2-0.8B-abliterated, un modelo de lenguaje conversacional en frances de aproximadamente 752 millones de parametros. Lo publica el usuario LeVraiCNL y esta pensado para inferencia en el borde (edge) mediante llama.cpp. La conversion a GGUF se ha realizado con el espacio GGUF-my-repo de ggml.ai a partir de los pesos originales.

El modelo base deriva de la familia Qwen (segun las etiquetas del repo) y ha sido sometido a un proceso de post-entrenamiento supervisado (SFT) y de aprendizaje por refuerzo (RL) sobre los datasets kurakurai/Luth-2-Post-Training-SFT y kurakurai/Luth-2-Post-Training-RL. La variante "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas del modelo ante ciertas peticiones.

Su relevancia actual reside en que ofrece un modelo conversacional en frances de menos de mil millones de parametros, cuantizado a 8 bits, que cabe en hardware muy modesto y se puede ejecutar con llama.cpp sin dependencias de GPU dedicada. El repositorio ocupa aproximadamente 0,8 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, segun etiquetas del repo) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero luth-2-0.8b-abliterated-q8_0.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Qwen y a un transformer decoder-only clasico. El modelo base LeVraiCNL/Luth-2-0.8B-abliterated se ha post-entrenado en dos fases: una fase de ajuste supervisado (SFT) sobre el dataset kurakurai/Luth-2-Post-Training-SFT y una fase de aprendizaje por refuerzo (RL) sobre kurakurai/Luth-2-Post-Training-RL. No se especifican el numero de tokens de entrenamiento, la composicion del corpus ni los algoritmos concretos de RL empleados.

La variante "abliterated" implica que se ha aplicado una ablacion de las direcciones de activacion asociadas al rechazo, lo que reduce la tendencia del modelo a negarse a responder. No se documentan en la informacion proporcionada innovaciones adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. La cuantizacion Q8_0 se ha generado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, lo que preserva practicamente la calidad del modelo original en precision completa a cambio de un mayor tamano de fichero frente a cuantizaciones mas agresivas.

## Capacidades

- Generacion de texto conversacional en frances, orientada a dialogos multi-turno.
- Modelo de menos de mil millones de parametros optimizado para despliegue en el borde (edge) y en hardware de bajos recursos.
- Ejecutable mediante llama.cpp tanto en modo CLI (llama-cli) como en modo servidor (llama-server).
- Compatible con endpoints (etiqueta endpoints_compatible) para integracion en servicios HTTP.
- Variante abliterated: menor tendencia a rechazar peticiones que el modelo base sin ablacionar.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidad multilingue limitada al frances segun los metadatos del repositorio.

## Casos de uso

- Asistentes conversacionales en frances para dispositivos de bajos recursos: el modelo, con 752 millones de parametros y cuantizacion Q8_0, cabe en equipos sin GPU dedicada y puede gestionar dialogos multi-turno en local mediante llama-server.
- Prototipado rapido de chatbots en frances: al ejecutarse con llama-cli o llama-server en pocos segundos de configuracion, permite validar flujos conversacionales antes de invertir en modelos mayores.
- Aplicaciones de escritorio o moviles con inferencia local: el tamano del repo (0,8 GB) y el formato GGUF facilitan su empaquetado en aplicaciones que requieren privacidad de datos sin enviar conversaciones a la nube.
- Generacion de texto creativo o de relleno en frances: redaccion de borradores, resumenes cortos o variaciones de texto en un idioma concreto, aprovechando el ajuste SFT y RL sobre datos franceses.
- Filtrado y moderacion de contenido con menor censura: la variante abliterated puede emplearse en entornos controlados donde se necesita que el modelo no rechace sistematicamente ciertas peticiones, siempre con supervision humana.
- Educacion y demostraciones tecnicas: sirve como ejemplo didactico de pipeline completo (modelo base, SFT, RL, ablacion y cuantizacion GGUF) para cursos o talleres sobre IA open source.
- Evaluacion comparativa de cuantizaciones: al existir el modelo original y esta version Q8_0, permite medir la perdida de calidad de la cuantizacion en tareas conversacionales en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, el fichero ronda los 0,8 GB, por lo que la inferencia requiere aproximadamente 1 GB de memoria (RAM o VRAM) mas el espacio para el contexto.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con al menos 2 GB de VRAM puede alojarlo, aunque tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3050 o superiores) e incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), y por el formato GGUF, tambien compatible con otros runners basados en llama.cpp como Ollama o llama-cpp-python, aunque no se documentan explicitamente en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luth-2-0.8B-abliterated-Q8_0-GGUF | 752.393.024 | no disponible | frances | Apache 2.0 | GGUF Q8_0 |
| Qwen2.5-0.5B-Instruct | ~0,5B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano similar de la familia Qwen y de la linea SmolLM, dado que la informacion proporcionada no incluye datos de rendimiento del modelo Luth-2. No se dispone de benchmarks que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para frances segun los metadatos; su rendimiento en castellano u otros idiomas no esta garantizado.
- La variante abliterated reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido inapropiado o danino; requiere filtros y supervision en produccion.
- Riesgo de alucinacion inherente a modelos de menos de mil millones de parametros, especialmente en tareas de conocimiento factual o razonamiento complejo.
- No se documentan sesgos conocidos especificos, pero al derivar de Qwen y entrenarse sobre datasets no descritos en detalle, pueden persistir sesgos del corpus original.
- No se especifica la longitud de contexto soportada; el ejemplo de llama-server usa -c 2048, lo que sugiere un contexto efectivo modesto, pero no es un dato confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la procedencia de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-27) es futura respecto a la redaccion habitual de fichas, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LeVraiCNL/Luth-2-0.8B-abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/LeVraiCNL/Luth-2-0.8B-abliterated
- Dataset SFT: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-SFT
- Dataset RL: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-RL
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
