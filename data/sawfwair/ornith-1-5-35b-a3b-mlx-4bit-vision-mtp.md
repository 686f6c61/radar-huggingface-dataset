# Sawfwair/Ornith-1.5-35B-A3B-MLX-4bit-Vision-MTP

## Resumen

Ornith-1.5-35B-A3B-MLX-4bit-Vision-MTP es un empaquetado derivado del modelo Ornith-1.5-35B-A3B, creado por Sawfwair para la plataforma mere.run. Este repositorio reúne en un único snapshot de Hugging Face el checkpoint oficial MLX en cuantización 4-bit del modelo de texto, junto con el componente de visión en BF16 y el cabezal MTP (Multi-Token Prediction) para decodificación especulativa. El objetivo es facilitar el despliegue portable del modelo completo en entornos MLX, sin necesidad de gestionar múltiples raíces de modelo.

El modelo subyacente, Ornith-1.5-35B-A3B, es un modelo de mezcla de expertos (MoE) de 35 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token. Está orientado a tareas de codificación y agénticas, incluye soporte de visión (image-text-to-text) y una ventana de contexto de 262.000 tokens. Según las fuentes consultadas, supera a modelos similares como Qwen 3.6-35B en benchmarks de codificación y agénticos, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificación agéntica. La licencia declarada es MIT.

Este empaquetado es relevante para desarrolladores que necesitan ejecutar un modelo de codificación con visión y decodificación especulativa en hardware Apple Silicon mediante MLX, o que quieren integrarlo en flujos de agentes con tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5-MoE (segun etiqueta `qwen3_5_moe`) |
| Parametros totales | 35B (segun denominacion del modelo); el checkpoint MLX reporta 5.419.330.688 parametros en safetensors, posible error de metadata |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262.000 tokens (segun fuentes externas) |
| Tipos de cuantizacion | 4-bit (MLX, este repositorio); tambien existe variante FP8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); tambien disponible en GGUF y FP8 segun fuentes |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo de mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token, lo que permite un rendimiento similar a modelos densos de 35B con un coste computacional muy inferior. La arquitectura sigue el patron de Qwen3.5-MoE, segun la etiqueta del repositorio. Incluye un componente de vision que procesa imagenes junto con texto, y un cabezal MTP (Multi-Token Prediction) que permite decodificacion especulativa verificada, acelerando la generacion de texto.

El entrenamiento sigue el marco de "self-scaffolding" introducido en Ornith-1.0 y extendido en Ornith-1.5. Segun el sitio oficial, el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle de auto-mejora continua. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO en la informacion disponible.

Este repositorio concreto no altera ni recuantiza los pesos originales; simplemente empaqueta los artefactos oficiales (texto MLX 4-bit, vision BF16 y MTP BF16) en una unica estructura de directorios.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de programacion, incluyendo generacion, explicacion y depuracion de codigo.
- Razonamiento agéntico: soporta flujos multi-paso y planificacion de tareas, lo que lo hace adecuado para agentes autonomos.
- Vision: procesa imagenes y texto de forma conjunta (pipeline `image-text-to-text`), permitiendo tareas como analisis de capturas de pantalla o diagramas.
- Decodificacion especulativa: el cabezal MTP integrado acelera la inferencia generando multiples tokens por paso y verificandolos.
- Tool calling / function calling: aunque no se documenta explicitamente en este repositorio, las capacidades agénticas del modelo base sugieren soporte para invocacion de herramientas.
- Contexto largo: 262.000 tokens de ventana, util para documentos extensos o conversaciones prolongadas.
- Multilingue: no confirmado en la informacion disponible; probablemente soporta multiples idiomas dado el origen del modelo base, pero no se especifica.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede integrarse en editores como VS Code para autocompletado, explicacion de fragmentos y refactorizacion, aprovechando su especializacion en codigo y su contexto largo.
- Agente autonomo de desarrollo: con soporte para planificacion multi-paso y tool calling, puede ejecutar tareas como crear archivos, ejecutar tests y corregir errores de forma autonoma.
- Analisis de capturas de pantalla de errores: gracias al componente de vision, puede interpretar imagenes de pantallas de error o diagramas de arquitectura y sugerir soluciones.
- Automatizacion de pipelines CI/CD: el modelo puede generar scripts, revisar logs y proponer correcciones en entornos de integracion continua, usando su capacidad de razonamiento agéntico.
- Chat conversacional con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas sobre bases de codigo completas o documentacion tecnica.
- Despliegue local en Mac con MLX: al estar empaquetado para mere.run y MLX, puede ejecutarse en Apple Silicon con cuantizacion 4-bit, ideal para desarrollo offline o prototipado sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion proporcionada. Las fuentes externas (blog de aimadetools y sitio oficial) indican que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agénticos, y supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificacion agéntica. Sin embargo, no se aportan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales consultados. Se recomienda consultar la model card del modelo base para obtener datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 28.7 GB en disco. En cuantizacion 4-bit, un modelo de 35B suele requerir entre 17 y 20 GB de memoria, pero este bundle incluye ademas los componentes de vision y MTP en BF16, lo que incrementa el requisito. Para Apple Silicon, se recomienda un Mac con al menos 32 GB de memoria unificada.
- GPU recomendadas: cualquier Mac con chip M1 Pro o superior, con 32 GB o mas de RAM unificada. Para despliegue en servidores, se pueden usar GPUs NVIDIA con soporte vLLM o SGLang, aunque este empaquetado esta orientado a MLX.
- Compatibilidad con consumer GPU: el formato MLX esta disenado para Apple Silicon; no es directamente ejecutable en GPUs NVIDIA. Para esas plataformas se debe usar la variante FP8 o GGUF del modelo base.
- Opciones de despliegue: mere.run (como se documenta en el README), MLX, vLLM, SGLang y llama.cpp (via GGUF).
- Latencia y throughput: no se proporcionan datos en la informacion disponible. La decodificacion especulativa con MTP deberia reducir la latencia en comparacion con la generacion autoregresiva estandar, pero no hay mediciones publicas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B | ~3B | 262K | MIT | Codigo, agentico, vision |
| Qwen 3.6-35B | 35B | ~3B (estimado) | No disponible | Apache 2.0 | Generalista, codigo |
| Gemma 4-31B | 31B | 31B (denso) | No disponible | Gemma license | Generalista |
| Muse Glimmer-30B | 30B | 30B (denso) | No disponible | No disponible | Codigo, agéntico |

Segun las fuentes, Ornith supera a Qwen 3.6-35B en benchmarks de codificacion y agénticos, y a Gemma 4-31B y Muse Glimmer-30B en codificacion agéntica. Sin embargo, no se disponen de cifras concretas para una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Este repositorio es un empaquetado de terceros (Sawfwair) para mere.run; no es el modelo oficial de Ornith AI. Los pesos son copias byte a byte de los artefactos originales, pero la responsabilidad del mantenimiento recae en el autor del bundle.
- No se han documentado sesgos conocidos ni evaluaciones de seguridad en la informacion disponible. Como modelo de codificacion, puede generar codigo inseguro o con vulnerabilidades si no se supervisa.
- Riesgo de alucinacion: comun en modelos de lenguaje; en tareas de codigo puede inventar APIs o funciones inexistentes. Se recomienda validacion humana en entornos de produccion.
- El conteo de parametros del checkpoint MLX (5.419.330.688) es inconsistente con la denominacion 35B del modelo. Esto puede deberse a un error en la metadata de Hugging Face o a una particularidad de la cuantizacion. No se ha podido verificar.
- La licencia MIT se declara en la metadata, pero el repositorio no incluye un archivo de licencia. Se debe confirmar con el modelo base antes de uso comercial.
- El soporte de vision y MTP esta empaquetado por separado dentro del repositorio; es necesario mantener la estructura de directorios para que mere.run los encuentre correctamente.
- No hay informacion sobre el rendimiento en tareas multilingues o fuera del ambito de codificacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/Ornith-1.5-35B-A3B-MLX-4bit-Vision-MTP
- Modelo base (original): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog con especificaciones y benchmarks: https://www.aimadetools.com/blog/ornith-1-5-35b-a3b/
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI: https://ornith.online/
