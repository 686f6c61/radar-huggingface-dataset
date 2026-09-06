# altic-dev/fluid-1-mini

## Resumen

Fluid-1 Mini es un modelo experimental de inteligencia artificial desarrollado por altic-dev, especializado en la limpieza y el formateo de dictados por voz. Se trata de un checkpoint de vista previa, no un modelo liberado, cuyo objetivo es convertir texto dictado de forma desordenada en texto escrito limpio y estructurado: eliminar muletillas, aplicar puntuación y capitalización, organizar párrafos y listas, y dar forma a correos electrónicos. No es un asistente general y no debe utilizarse para responder preguntas.

El modelo se basa en la arquitectura Qwen3.5, en su versión de solo texto, con aproximadamente 2.000 millones de parámetros. Ha sido convertido al formato GGUF con la librería llama.cpp, y requiere una versión de llama.cpp con soporte para `qwen35` (b9870 o superior). El tamaño del repositorio es de 4,6 GB y el archivo cuantizado en Q6_K pesa 1.606.323.744 bytes.

La relevancia actual de Fluid-1 Mini radica en su enfoque de ejecución local. Forma parte de la iniciativa Fluid Intelligence de altic.dev, que incluye la aplicación FluidVoice para macOS, un runtime local capaz de procesar dictados sin enviar datos a la nube. Esto lo hace especialmente interesante para entornos donde la privacidad es crítica o donde se desea un post-procesado de voz a texto sin dependencias externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (solo texto; torre de vision excluida) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (GGUF); MLX 6-bit (variante alternativa) |
| Idiomas soportados | No especificado en la informacion disponible |
| Licencia | Uso personal no comercial; terminos del modelo base Qwen3.5 con restricciones adicionales de Altic |
| Formato de pesos | safetensors, GGUF, MLX (segun variante) |
| Tamano del archivo GGUF | 1.606.323.744 bytes |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

Fluid-1 Mini es un modelo denso basado en la arquitectura Qwen3.5, exportado en su version de solo texto. No se han publicado datos sobre el proceso de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La informacion disponible indica que fue convertido con llama.cpp en la version `b9870`, lo que implica que su ejecucion requiere una build de llama.cpp con soporte para la arquitectura `qwen35`.

La innovacion principal del modelo no reside en la arquitectura, sino en su especializacion funcional: esta disenado para limpiar dictados de voz, aplicando una serie de transformaciones heuristicas y de lenguaje natural que incluyen eliminacion de muletillas, correccion de autocorreciones, puntuacion, capitalizacion, formato de parrafos y listas, y adaptacion a contextos de correo electronico. Segun el repositorio alternativo en formato MLX, el modelo utiliza tecnicas denominadas FluidDecode y DFlash, aunque no se ofrecen detalles tecnicos de estos procesos.

## Capacidades

- Limpieza de dictados de voz: elimina muletillas, corrige autocorrecciones y aplica puntuacion y capitalizacion.
- Formateo de texto: genera parrafos, listas y estructuras a partir de texto dictado informalmente.
- Adaptacion a correos electronicos: da forma a dictados para convertirlos en correos estructurados.
- Ejecucion local en dispositivo: no requiere servicios en la nube.
- Adaptacion de tono segun la aplicacion activa: esta capacidad esta documentada para FluidVoice en macOS.
- No es un asistente general: no responde preguntas ni mantiene conversaciones de conocimiento general.
- No se documenta soporte para tool calling, agentes, multimodalidad ni vision.

## Casos de uso

- Limpieza de dictados en macOS: mediante la aplicacion FluidVoice, el modelo procesa la transcripcion local y aplica eliminacion de muletillas, puntuacion y capitalizacion de forma automatica. Es adecuado porque el runtime se ejecuta en el dispositivo, lo que garantiza privacidad.
- Redaccion de correos electronicos: un usuario dicta una idea informal y el modelo la convierte en un correo estructurado con formato adecuado. Es util porque la tarea de dar forma a correos es una de las funciones explicitamente disenadas del modelo.
- Formateo de notas y listas: a partir de dictados de voz, el modelo organiza el contenido en parrafos y listas. Es adecuado para usuarios que prefieren dictar notas en lugar de escribirlas.
- Post-procesamiento de transcripciones de reuniones: se puede integrar en pipelines locales de reconocimiento de voz para limpiar el texto resultante. Es util porque el modelo no depende de servicios externos y puede ejecutarse en entornos aislados.
- Entornos con requisitos de privacidad: al ejecutarse localmente, el modelo no envia datos a la nube, lo que lo hace adecuado para sectores como legal, salud o finanzas donde la confidencialidad es obligatoria.
- Accesibilidad: ayuda a personas con dificultades de escritura o movilidad a generar texto limpio mediante dictado. Es adecuado porque el modelo transforma voz desordenada en texto formal sin intervencion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q6_K pesa 1,6 GB, por lo que se puede ejecutar en GPUs con al menos 2-4 GB de VRAM. Esta es una estimacion basada en el tamano del archivo; no hay requisitos oficiales publicados.
- GPU recomendadas: no se publican requisitos oficiales. Por su tamano, es compatible con GPUs de consumo como RTX 3060, RTX 4060, y con Apple Silicon mediante el formato MLX.
- Cabe en consumer GPU: si, dado el tamano reducido del archivo.
- Opciones de despliegue: llama.cpp (build b9870 o superior con soporte `qwen35`), MLX (variante en macOS), y otros runtime compatibles con GGUF. No se documenta soporte para vLLM u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables especificos para la tarea de limpieza de dictados en la informacion disponible. El unico punto de referencia conocido es el modelo base Qwen3.5-2B, del cual deriva Fluid-1 Mini. Se presenta a continuacion una tabla comparativa con los datos disponibles:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Fluid-1 Mini | Qwen3.5 (solo texto) | ~2B | No disponible | Uso personal no comercial | GGUF, MLX, safetensors |
| Qwen3.5-2B (base) | Qwen3.5 | ~2B | No disponible | Apache 2.0 (componentes Qwen) | No disponible |

## Limitaciones y advertencias

- Restriccion de licencia: el uso esta limitado a fines personales y no comerciales. Cualquier uso comercial, organizativo, de investigacion, de producto, de servicio o generador de ingresos requiere permiso escrito previo de Altic. Esta restriccion impide su uso en produccion o en entornos empresariales sin licencia explicita.
- Modelo experimental: es un checkpoint de vista previa, no un modelo liberado ni estable. Su comportamiento puede cambiar o no recibir soporte.
- No es un asistente general: el modelo no esta disenado para responder preguntas ni para conversacion abierta. Usarlo para otros fines puede producir resultados deficientes.
- Compatibilidad limitada: requiere una build de llama.cpp con soporte para `qwen35` (b9870 o superior), lo que puede dificultar su integracion en entornos existentes.
- Idiomas no documentados: no se especifican los idiomas soportados, por lo que la capacidad multilingue es desconocida. El modelo puede funcionar mejor en ingles u otros idiomas no indicados.
- Sesgos heredados: al derivar de Qwen3.5, el modelo puede heredar sesgos y limitaciones del modelo base, incluyendo riesgo de alucinacion en textos generados.
- Sin evaluaciones de seguridad: no se han publicado evaluaciones de alineacion, sesgo o robustez. Se recomienda precaucion antes de su uso en entornos sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/altic-dev/fluid-1-mini
- Variante MLX en HuggingFace: https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-6bit
- Web de FluidVoice: https://altic.dev/fluid
- Paper, blog o documentacion tecnica adicional: no disponible
