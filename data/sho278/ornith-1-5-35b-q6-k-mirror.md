# Sho278/ornith-1.5-35b-q6-k-mirror

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el equipo de Ornith AI (DeepReinforce), diseñado específicamente para tareas de codificacion agéntica y razonamiento multi-paso. Este repositorio concreto es un mirror en formato GGUF cuantizado Q6_K, publicado por el usuario Sho278, que facilita la ejecucion local del modelo sin necesidad de convertir los pesos originales.

El modelo activa aproximadamente 3.000 millones de parametros por token, aunque su tamaño total es de 35.505 millones, lo que permite un equilibrio entre capacidad y eficiencia computacional. Segun la model card, supera a modelos comparables como Qwen 3.6-35B en benchmarks de codificacion y agencia, y se posiciona como una alternativa competitiva a modelos densos de tamano similar. Su licencia MIT permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo radica en su enfoque de auto-mejora de extremo a extremo: no solo optimiza las soluciones, sino que tambien genera nuevas tareas de entrenamiento y descubre estrategias de resolucion de forma autonoma, un avance notable en el campo de los modelos agénticos open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (segun nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE que activa solo una fraccion de sus parametros por token (aproximadamente 3B de 35,5B totales). La arquitectura exacta (numero de expertos, top-k, dimensiones de capas) no se detalla en la informacion disponible, pero sigue la linea de modelos MoE modernos como Qwen3.5 o Gemma4, sobre los cuales se desarrollo la version 1.0.

El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo. A diferencia de la version 1.0, que se limitaba a optimizar scaffolds y rollouts, la 1.5 optimiza conjuntamente la generacion de tareas, la construccion de scaffolds y los rollouts de soluciones. El modelo genera nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora su politica mediante aprendizaje por refuerzo. No se especifican los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se utilizaron tecnicas como RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con especial enfasis en tareas de codificacion y agencia.
- Soporte de tool calling y function calling, necesario para su uso en entornos agénticos (segun su diseño orientado a agentes).
- Capacidad de auto-mejora: el modelo puede proponer nuevas tareas y generar sus propios scaffolds, lo que lo hace adecuado para pipelines de auto-entrenamiento.
- Ejecucion eficiente gracias a su arquitectura MoE con solo ~3B parametros activos, lo que reduce requisitos de VRAM frente a modelos densos de tamano similar.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.

## Casos de uso

- Asistente de programacion en terminal: el modelo destaca en Terminal-Bench 2.1 (67,8 en Terminus-2 y 68,5 en Claude Code), por lo que puede integrarse en herramientas de linea de comandos para autocompletar comandos, depurar errores y ejecutar tareas de administracion de sistemas.
- Resolucion de issues en repositorios: con un 79 en SWE-bench Verified, es adecuado para automatizar la correccion de bugs y la implementacion de features en proyectos de software reales, integrandose en flujos de trabajo de CI/CD.
- Agente de codificacion autonomo: su capacidad de tool calling y razonamiento multi-paso permite construir agentes que navegan por el codigo, ejecutan pruebas y proponen parches sin intervencion humana.
- Generacion de codigo en produccion: puede usarse como backend de asistentes de desarrollo (IDE plugins, chatbots de soporte tecnico) gracias a su licencia MIT y su formato GGUF, que facilita el despliegue local.
- Entrenamiento de modelos agénticos: su diseño de auto-mejora lo convierte en una base interesante para investigacion en aprendizaje por refuerzo y generacion de tareas sinteticas.
- Despliegue en entornos con recursos limitados: al ser MoE con ~3B activos, puede ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3090 o 4090) con cuantizacion Q6_K, lo que lo hace viable para equipos pequeños o prototipos.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la model card (parcialmente truncados) se presentan a continuacion. No se dispone de resultados completos para todos los benchmarks mencionados.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | (dato no disponible en la informacion) | - | - | - | - | - |

Nota: los valores de SWE-bench Pro no se pudieron extraer de la informacion proporcionada. Los datos de Gemma-4-31B y Muse-Glimmer-30B en Terminal-Bench 2.1 (Claude Code) no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q6_K y ~3B parametros activos, el modelo requiere aproximadamente 8-12 GB de VRAM para inferencia en FP16, y menos con cuantizaciones inferiores (Q4_K_M, Q5_K_M). El tamaño del repo (558,5 GB) sugiere que puede incluir multiples archivos o el modelo completo sin cuantizar, pero el archivo Q6_K individual deberia ocupar alrededor de 25-30 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. En consumer GPU, una RTX 3090 o superior es suficiente para ejecutar el modelo con Q6_K.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptador GGUF) o TGI.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un MoE con 3B activos suele generar entre 20-50 tokens/s en una RTX 4090 con cuantizacion Q4, pero esto depende del backend y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,5B | ~3B | no disponible | MIT | GGUF |
| Qwen3.6-35B-A3B | 35B (aprox.) | ~3B | no disponible | Apache 2.0 (presumible) | Safetensors, GGUF |
| Gemma-4-31B | 31B (denso) | 31B | no disponible | Gemma license | Safetensors, GGUF |
| Muse-Glimmer-30B | 30B (aprox.) | no disponible | no disponible | no disponible | no disponible |

En los benchmarks disponibles, Ornith-1.5 supera a Qwen3.6-35B-A3B en Terminal-Bench y SWE-bench Verified, y supera ampliamente a Gemma-4-31B en tareas de codificacion agéntica. Su ventaja principal es el bajo numero de parametros activos, que reduce costes de inferencia frente a modelos densos.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo entrenado principalmente para codificacion, puede tener un rendimiento inferior en tareas de conocimiento general o creatividad.
- Riesgo de alucinacion en contextos no relacionados con programacion, especialmente en generacion de codigo con APIs poco conocidas.
- La longitud de contexto no esta documentada en la informacion disponible; se recomienda verificar antes de usarlo en tareas que requieran ventanas largas.
- Los idiomas soportados no estan especificados; probablemente el modelo este optimizado para ingles y codigo, con capacidades multilingues limitadas.
- Aunque la licencia es MIT, el modelo deriva de Qwen3.5 y Gemma4 (segun la model card de Ornith-1.0), por lo que podrian existir restricciones heredadas de los modelos base. Se recomienda revisar las licencias de los modelos originales antes de un uso comercial.
- El repositorio es un mirror no oficial (usuario Sho278); no se garantiza la integridad de los pesos ni su correspondencia exacta con el modelo original de Ornith AI.

## Enlaces

- Repositorio del mirror: https://huggingface.co/Sho278/ornith-1.5-35b-q6-k-mirror
- Modelo original (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Modelo original (Safetensors, presumible): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith AI: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI: https://ornith.online/
- Pagina de Ornith AI: https://ornith.ai/
