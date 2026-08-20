# scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16

## Resumen

Ornith-1.5-35B-A3B-oQ4e-fp16 es una cuantización en formato MLX del modelo Ornith-1.5, desarrollado por Scott Lowry. Ornith-1.5 se presenta como un modelo de codificación agéntica de código abierto que incorpora un mecanismo de auto-mejora: el propio modelo propone nuevas tareas, genera andamiajes específicos y produce soluciones para aprendizaje por refuerzo, cerrando un bucle de mejora continua. Esta versión cuantizada emplea la herramienta oQ (oMLX v0.6.3rc1) con precisión mixta, combinando pesos en 4 bits (grupo de 64) con partes en fp16.

El modelo utiliza una arquitectura de tipo `qwen3_5_moe` (mezcla de expertos), lo que sugiere una activación selectiva de parámetros. Aunque el nombre indica 35B-A3B (35 mil millones totales, 3 mil millones activos), los safetensors incluidos en este repositorio contienen 6.045.478.768 parámetros, una discrepancia que no se explica en la documentación disponible. El tamaño del repositorio es de 22 GB, coherente con una cuantización mixta de un modelo de varios miles de millones de parámetros. La licencia y los idiomas soportados no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 6.045.478.768 (segun safetensors); el nombre sugiere 35B-A3B, sin confirmar |
| Parametros activos | no disponible (el nombre sugiere 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, grupo de 64) con partes en fp16 (precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5 se describe en el sitio web oficial como una extensión del marco de auto-andamiaje introducido en Ornith-1.0. En lugar de depender exclusivamente de datos humanos, el modelo genera sus propias tareas, crea andamiajes específicos para cada una y produce soluciones que luego se utilizan para aprendizaje por refuerzo. Este bucle de auto-mejora es una innovación destacable, aunque no se han publicado detalles técnicos sobre la arquitectura interna, el número de tokens de entrenamiento o la composición del dataset.

La versión cuantizada presentada en este repositorio utiliza oQ (oMLX v0.6.3rc1) para aplicar cuantización de 4 bits con grupo de 64, manteniendo ciertos componentes en fp16. La arquitectura `qwen3_5_moe` indica que se trata de un modelo de mezcla de expertos, probablemente basado en la familia Qwen, pero no se dispone de información adicional sobre el número de expertos, la dimensión del modelo o el mecanismo de enrutamiento.

## Capacidades

- Generacion de codigo: el modelo esta orientado a tareas de programacion, segun la informacion publica de Ornith AI.
- Razonamiento agente: el enfoque de auto-andamiaje sugiere capacidad para descomponer problemas y generar soluciones estructuradas.
- Tool calling: no confirmado, pero comun en modelos de codificacion agente.
- Auto-mejora: el modelo puede proponer nuevas tareas y generar sus propios datos de entrenamiento, una capacidad unica de la serie Ornith.
- Multilingue: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Asistente de programacion local: al ser una cuantizacion MLX, puede ejecutarse en Macs con Apple Silicon mediante MLX, ofreciendo autocompletado y generacion de codigo sin conexion.
- Agente de refactorizacion de codigo: el modelo puede analizar un repositorio, identificar patrones y proponer refactorizaciones, aprovechando su capacidad de razonamiento agente.
- Generacion de pruebas unitarias: dado su enfoque en codigo, puede crear casos de prueba a partir de funciones existentes.
- Automatizacion de tareas de desarrollo: integrado en pipelines de CI/CD para generar documentacion, revisar pull requests o detectar errores comunes.
- Investigacion en auto-mejora de modelos: el marco de auto-andamiaje puede ser util para experimentos academicos sobre aprendizaje por refuerzo autogenerado.
- Despliegue en entornos con recursos limitados: gracias a la cuantizacion de 4 bits, puede ejecutarse en hardware de consumo medio, aunque el tamano real no esta claro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 22 GB, lo que sugiere que la carga en memoria puede requerir al menos 16 GB de RAM en Mac (para MLX) o una GPU con VRAM similar.
- Al ser una cuantizacion MLX, esta optimizado para Apple Silicon (M1, M2, M3 y superiores) usando la libreria MLX.
- Para otros entornos, el formato safetensors puede convertirse a GGUF para ejecutarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF.
- No se dispone de datos de latencia o throughput.
- No se ha confirmado si cabe en GPU de consumo como RTX 4090 (24 GB VRAM) o RTX 3060 (12 GB), dado el tamano real de los parametros.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El nombre sugiere una arquitectura MoE de 35B con 3B activos, lo que lo situaria cerca de modelos como Qwen3-30B-A3B o DeepSeek-V2-Lite, pero no hay datos publicados de rendimiento ni confirmacion del tamano real. Se recomienda consultar la documentacion oficial de Ornith para obtener comparativas.

## Limitaciones y advertencias

- La discrepancia entre el nombre (35B-A3B) y los parametros reales en safetensors (6B) es preocupante y puede indicar un error en el etiquetado o una cuantizacion parcial que omita parte de los pesos.
- No se ha publicado la licencia, por lo que el uso comercial es incierto.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- La cuantizacion de 4 bits puede degradar la precision en tareas complejas de razonamiento.
- No hay garantia de que el modelo funcione correctamente fuera del ecosistema MLX sin conversiones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16
- Version con MTP (multi-token prediction): https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI (modelos, benchmarks, configuracion): https://ornith.online/
- Perfil del autor en HuggingFace: https://huggingface.co/scottlowry/models
- Video de instalacion y prueba: https://www.youtube.com/watch?v=tUT6h5LCDhI
