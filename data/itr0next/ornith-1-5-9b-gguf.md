# itr0next/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9.000 millones de parametros desarrollado por Ornith AI, presentado como el miembro mas ligero de la familia Ornith-1.5. Su principal innovacion reside en un bucle de auto-mejora de extremo a extremo: el modelo no solo optimiza soluciones a tareas fijas, sino que genera nuevas tareas de entrenamiento, construye sus propios scaffolds (entornos de ejecucion) y produce rollouts de soluciones para aprendizaje por refuerzo. Este enfoque, que extiende el marco de auto-scaffolding de Ornith-1.0, busca reducir la dependencia de datos curados manualmente y de harnesses disenados a mano.

El modelo esta pensado para despliegue eficiente en una unica GPU y, segun sus desarrolladores, es apto para entornos edge y dispositivos moviles mediante su variante cuantizada Ornith-1.5-9B-Mobile. Se distribuye bajo licencia MIT y esta disponible en formato GGUF para inferencia local con herramientas como llama.cpp u Ollama. Los resultados publicados muestran un rendimiento destacado en tareas de codificacion y resolucion de problemas de ingenieria de software, superando a modelos de tamano similar en varios benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma4 con entrenamiento adicional) |
| Parametros totales | 9.197.093.888 (9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (incluye variante Mobile cuantizada; no se especifican los bits exactos) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (repo actual); safetensors disponible en el repo base |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso que parte de las arquitecturas de Qwen3.5 y Gemma4, sobre las cuales se aplicaron fases de continued pretraining, mid-training y post-training. La innovacion principal no esta en la arquitectura en si, sino en el proceso de entrenamiento: el modelo participa en un bucle de auto-mejora donde genera nuevas tareas de entrenamiento, construye scaffolds especificos para cada tarea y produce soluciones que se utilizan como datos para aprendizaje por refuerzo. Este proceso, descrito en el blog de Ornith AI, reemplaza el conjunto fijo de tareas curadas por humanos y los harnesses disenados manualmente por un sistema que descubre continuamente nuevas estrategias de resolucion.

El entrenamiento combina generacion de tareas, construccion de scaffolds y optimizacion de rollouts, con un diseno de recompensas especifico para cada componente. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset o si se utilizaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general.
- Codificacion avanzada: resolucion de problemas de ingenieria de software (SWE-bench Verified y Pro) y tareas de terminal (Terminal-Bench 2.1).
- Ejecucion de tareas en entornos de terminal y agentes de codigo, con soporte para scaffolds generados automaticamente.
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas de entrenamiento y scaffolds, lo que sugiere una capacidad de aprendizaje continuo.
- Capacidades multimodales: segun la guia de Atomic Chat, el modelo es multimodal, aunque no se detallan los tipos de entrada soportados.
- Optimizado para despliegue eficiente en una unica GPU y en dispositivos edge mediante cuantizacion.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en entornos de desarrollo para sugerir parches, revisar codigo y resolver incidencias. Su rendimiento en SWE-bench Verified (70.6) lo hace adecuado para tareas de mantenimiento de repositorios reales.
- Automatizacion de tareas de terminal: gracias a su capacidad en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y completar tareas administrativas en entornos de linea de comandos, util para pipelines de CI/CD o administracion de sistemas.
- Agente de codigo autonomo: el modelo puede actuar como agente que navega por un repositorio, identifica bugs y genera pull requests, aprovechando su capacidad de construir scaffolds especificos para cada tarea.
- Despliegue en entornos edge: la variante cuantizada Mobile permite ejecutar el modelo en dispositivos con recursos limitados, como portatiles con 8 GB de RAM o Macs con 16 GB, para asistentes de codigo locales sin conexion.
- Generacion de tareas de entrenamiento sinteticas: su capacidad de auto-mejora puede aprovecharse para generar datasets de entrenamiento para otros modelos o para fine-tuning de modelos mas pequenos.
- Investigacion en auto-mejora de modelos: el enfoque de auto-scaffolding y generacion de tareas lo convierte en una plataforma interesante para estudiar aprendizaje por refuerzo y auto-supervision en modelos de lenguaje.

## Benchmarks y rendimiento

Los siguientes resultados se han extraido de la model card oficial. Se comparan con Ornith-1.0-9B, Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47.0 | 40.6 | 18.9 | 49.2 | - |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52.0 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |
| SWE-bench Multilingual | (dato cortado en la informacion disponible) | - | - | - | - |

El modelo supera claramente a Qwen3.5-9B en todos los benchmarks publicados y se acerca a modelos mucho mas grandes como Qwen3.6-35B-A3B y Gemma-4-31B, lo que indica una buena eficiencia de parametros.

## Requisitos de hardware

- VRAM estimada: segun la guia de Atomic Chat, el modelo cabe en una GPU de 8 GB con cuantizacion de 4 bits, o en un Mac con 16 GB de RAM unificada.
- GPU recomendadas: RTX 3060/3070/4060 (8 GB) para cuantizacion 4-bit; RTX 4090 o A100 para cuantizaciones mas altas o mayor velocidad.
- Compatibilidad con consumer GPU: si, con cuantizacion Q4_K_M o similar.
- Opciones de despliegue: llama.cpp, Ollama, Atomic Chat, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B | 9B denso | No disponible | 70.6 | MIT |
| Qwen3.5-9B | 9B denso | No disponible | 53.2 | No disponible |
| Ornith-1.0-9B | 9B denso | No disponible | 69.4 | MIT |
| Qwen3.6-35B-A3B | 35B (3B activos, MoE) | No disponible | 73.4 | No disponible |

Ornith-1.5-9B ofrece un rendimiento cercano a un modelo MoE de 35B con solo 9B de parametros, lo que lo hace especialmente atractivo para despliegue en hardware limitado. Su licencia MIT es mas permisiva que la mayoria de alternativas comerciales.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. La informacion disponible no incluye evaluaciones de seguridad ni de sesgo.
- La longitud de contexto no esta especificada, lo que dificulta planificar su uso en tareas con ventanas largas.
- Los idiomas soportados no estan documentados; el modelo podria tener un rendimiento desigual en lenguas distintas del ingles.
- El modelo es reciente (creado en agosto de 2026) y tiene cero descargas y cero likes en el repo GGUF analizado, lo que indica una adopcion aun muy limitada y poca validacion por parte de la comunidad.
- Aunque la licencia es MIT, el modelo base se construye sobre Qwen3.5 y Gemma4, cuyas licencias originales podrian imponer restricciones adicionales. Conviene verificar la compatibilidad de licencias antes de un uso comercial.
- El rendimiento en benchmarks de codificacion es prometedor, pero no hay datos sobre tareas de razonamiento general, matematicas o generacion creativa.

## Enlaces

- Repo GGUF analizado: https://huggingface.co/itr0next/Ornith-1.5-9B-GGUF
- Repo GGUF oficial: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de despliegue local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Pagina de descarga alternativa: https://local-ai-zone.github.io/models/ornith-1-5-9b.html
