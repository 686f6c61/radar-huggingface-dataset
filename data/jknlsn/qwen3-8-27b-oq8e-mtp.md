# jknlsn/Qwen3.8-27B-oQ8e-mtp

## Resumen

El modelo `jknlsn/Qwen3.8-27B-oQ8e-mtp` es una cuantización en 8 bits del modelo vision-language `Qwen/Qwen3.8-27B`, realizada con la herramienta oQe (oMLX v0.6.0) que aplica cuantización de precisión mixta mejorada con imatrix. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer denso de 27 mil millones de parámetros con entrada nativa de imagen y video, contexto de 262 000 tokens y capacidades de razonamiento configurable, orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. Esta versión cuantizada está pensada para ejecutarse en hardware Apple Silicon mediante MLX, e incluye soporte para multi-token prediction (MTP), lo que mejora la velocidad de decodificación. El repositorio se publicó en agosto de 2026 y no registra descargas ni valoraciones, por lo que se trata de un artefacto reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 8 184 279 792 (segun safetensors; el modelo base se anuncia como 27B, discrepancia por confirmar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | 8 bits, group size 64, imatrix (oQe) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica en esta version) |
| Licencia | No disponible (el modelo base se distribuye bajo Apache 2.0 segun fuentes externas, pero no se confirma en el repo) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27 000 millones de parametros con arquitectura Qwen3.5, disenado para procesar tanto texto como imagenes y video. Incorpora un mecanismo de razonamiento configurable que permite alternar entre modos de pensamiento rapido y profundo. La version cuantizada aqui descrita utiliza la herramienta oQe de oMLX para convertir los pesos originales a una representacion de 8 bits con group size 64, aplicando una cuantizacion de precision mixta mejorada con imatrix (importance matrix) que preserva las capas mas sensibles. Ademas, se incluye el modulo de multi-token prediction (MTP), que permite predecir varios tokens por paso de decodificacion, reduciendo la latencia en inferencia. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineacion (RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento complejo con modo de pensamiento configurable (thinking mode).
- Comprension de imagenes y video como entrada nativa (vision-language).
- Generacion y edicion de codigo en multiples lenguajes de programacion.
- Razonamiento matematico y cientifico.
- Soporte para tool calling y function calling, permitiendo integracion con APIs y entornos externos.
- Capacidades agenciales de largo horizonte: planificacion de multiples pasos, manejo de feedback de entorno y ejecucion de tareas complejas.
- Multilingue (el modelo base soporta numerosos idiomas, aunque la lista exacta no se especifica en esta version).
- Multi-token prediction (MTP) para acelerar la decodificacion.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo integrado: el modelo puede autocompletar funciones, explicar fragmentos y refactorizar codigo, aprovechando su contexto de 262 000 tokens para mantener el estado completo del proyecto.
- Automatizacion de tareas agenciales en sistemas operativos: gracias a su capacidad de planificacion y tool calling, puede ejecutar acciones como gestion de archivos, navegacion web o interaccion con aplicaciones de escritorio.
- Analisis de documentos tecnicos con imagenes: al aceptar entrada de imagen y video, puede extraer informacion de diagramas, capturas de pantalla o graficos dentro de documentos extensos.
- Soporte tecnico automatizado de nivel avanzado: con su contexto largo y razonamiento, puede mantener conversaciones multi-turno sobre problemas complejos de software o hardware, consultando documentacion y generando respuestas precisas.
- Investigacion academica asistida: el modelo puede resumir articulos, comparar metodologias y generar hipotesis, manejando grandes volumenes de texto e imagenes de figuras y tablas.
- Pruebas de software automatizadas: puede generar casos de prueba, analizar trazas de errores y proponer correcciones, integrandose en pipelines de CI/CD mediante tool calling.
- Despliegue local en hardware Apple Silicon: al estar cuantizado en formato MLX, es adecuado para aplicaciones de escritorio que requieren privacidad y baja latencia en Macs con suficiente memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion. Sin embargo, fuentes externas citan los siguientes resultados para el modelo base sin cuantizar:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos proceden de la guia publicada en lovableapp.org y no han sido verificados de forma independiente. La cuantizacion de 8 bits puede degradar ligeramente el rendimiento en tareas de precision, aunque el uso de imatrix y group size 64 suele mitigar esa perdida.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a 8 bits ocupan aproximadamente 27 GB (el repositorio pesa 30 GB, incluyendo posiblemente archivos auxiliares). Se recomienda un dispositivo con al menos 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con 32 GB o mas (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 Pro/Max). Tambien se ha anunciado soporte en GPUs AMD Ryzen AI Max y Radeon mediante LM Studio, aunque el formato MLX es nativo de Apple.
- En consumer GPU: no es viable en GPUs de consumo convencionales (RTX 4090 con 24 GB no tendria suficiente VRAM para los pesos completos en 8 bits).
- Opciones de despliegue: MLX (libreria nativa), LM Studio (con soporte para AMD), y potencialmente convertidores a otros formatos como GGUF para llama.cpp, aunque no se incluyen en este repositorio.
- Latencia y throughput: no disponibles. El MTP deberia mejorar la velocidad de decodificacion frente a la generacion token a token, pero no hay mediciones publicas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoria (VLM densos de ~27B). Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Original |
| Qwen3.8-27B-oQ8e-mtp (este) | 27B (nominal) | 262K | No disponible | MLX 8-bit |
| Qwen2.5-VL-32B | 32B | 128K | Apache 2.0 | Original |

La comparacion con Qwen2.5-VL-32B es orientativa; el modelo base de este repo es mas reciente y con contexto mayor, pero no hay benchmarks comunes publicados para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede introducir perdidas de precision en tareas de razonamiento complejo o generacion de codigo muy sensible a los pesos.
- No se especifica la licencia del repositorio cuantizado; aunque el modelo base es Apache 2.0, es necesario confirmar los terminos de esta derivada antes de uso comercial.
- El numero de parametros declarado en safetensors (8.18B) no coincide con el nombre del modelo (27B). Esto podria indicar un error en la metadata o una conversion parcial; se recomienda verificar la integridad del archivo antes de usarlo en produccion.
- No hay informacion sobre sesgos especificos, pero al ser un modelo de lenguaje grande, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion en tareas factuales, especialmente con entradas de imagen ambiguas o fuera de distribucion.
- El formato MLX limita su uso a ecosistemas Apple; para otros entornos es necesaria una conversion adicional.
- No se han publicado evaluaciones de seguridad ni pruebas de robustez para esta cuantizacion concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jknlsn/Qwen3.8-27B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQe (oMLX): https://github.com/jundot/omlx
- Blog AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
