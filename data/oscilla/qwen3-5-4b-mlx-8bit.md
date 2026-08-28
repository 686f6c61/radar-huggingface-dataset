# Oscilla/Qwen3.5-4B-mlx-8Bit

## Resumen

Oscilla/Qwen3.5-4B-mlx-8Bit es una conversión al formato MLX del modelo Qwen/Qwen3.5-4B, realizada por el usuario Oscilla mediante la librería mlx-lm en su versión 0.31.2. El modelo base, Qwen3.5-4B, es un modelo denso de 4.000 millones de parámetros desarrollado por Alibaba Cloud, que integra capacidades multimodales (visión y lenguaje) mediante fusión temprana de tokens, entrenado sobre billones de tokens multimodales. Esta versión MLX incluye cuantización de 8 bits, lo que reduce el tamaño del repositorio a 4,5 GB y facilita su ejecución en dispositivos Apple Silicon.

La relevancia de esta ficha radica en que ofrece una alternativa optimizada para entornos macOS, manteniendo las capacidades del modelo original, como razonamiento, generación de código y comprensión visual, con un contexto nativo de 262.144 tokens. El formato MLX permite una integración fluida con el ecosistema de Apple, y la cuantización de 8 bits equilibra rendimiento y consumo de memoria. Aunque el repositorio tiene cero descargas y cero likes, la conversión es técnica y reproducible, siguiendo los estándares de la comunidad MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) basado en Qwen3.5-4B |
| Parametros totales | 4.000 millones (nominal, segun modelo base); el archivo safetensors reporta 1.183.558.656, posiblemente por cuantizacion o error en el repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun LM Studio) |
| Tipos de cuantizacion | 8-bit (indicado en el nombre del repo y tags) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura transformer densa con un enfoque de fusión temprana para integrar modalidades de visión y lenguaje. Según la documentación oficial de Qwen3.5, el entrenamiento se realizó sobre billones de tokens multimodales, logrando un rendimiento comparable o superior a Qwen3-VL en tareas de razonamiento, codigo, agentes y comprension visual. No se dispone de detalles adicionales sobre el proceso de entrenamiento (como el uso de RLHF o DPO) en la informacion disponible.

La conversion a MLX realizada por Oscilla utiliza mlx-lm 0.31.2, que transforma los pesos originales al formato optimizado para Apple Silicon. La cuantizacion de 8 bits reduce el tamaño de los pesos, aunque el numero de parametros nominal del modelo base se mantiene en 4.000 millones. El repositorio incluye el archivo safetensors con un conteo de 1.183.558.656 parametros, lo que sugiere que podria tratarse de una version parcial o de una discrepancia en la metadata; se recomienda verificar la integridad del modelo antes de su uso en produccion.

## Capacidades

- Generacion de texto y respuestas conversacionales en formato chat.
- Razonamiento logico y matematico, con soporte para problemas complejos.
- Generacion y comprension de codigo en multiples lenguajes de programacion.
- Comprension visual: procesamiento de imagenes y generacion de descripciones o respuestas basadas en contenido visual (pipeline image-text-to-text).
- Soporte para agentes y razonamiento multi-paso, segun las mejoras declaradas en Qwen3.5.
- Capacidad multilingue: no se especifican idiomas concretos, pero el modelo base de Qwen suele soportar multiples lenguas.
- Integracion con el ecosistema MLX para ejecucion local en Apple Silicon.

## Casos de uso

- Asistentes virtuales locales en macOS: el modelo puede desplegarse en aplicaciones de chat que requieran procesamiento de texto e imagenes, aprovechando la cuantizacion de 8 bits para un uso eficiente de la memoria unificada.
- Analisis de imagenes en entornos offline: gracias a su capacidad multimodal, puede generar descripciones, responder preguntas sobre fotografias o extraer informacion de documentos escaneados sin conexion a internet.
- Generacion de codigo asistida: los desarrolladores pueden integrarlo en editores o herramientas de autocompletado para sugerencias de codigo, aprovechando su entrenamiento en tareas de programacion.
- Automatizacion de tareas de documentacion: puede resumir articulos, generar informes tecnicos o redactar respuestas a partir de imagenes o texto, con un contexto largo de 262.144 tokens que permite procesar documentos extensos.
- Prototipado de aplicaciones multimodales: investigadores y desarrolladores pueden usarlo como base para experimentar con modelos de vision-lenguaje en hardware Apple, sin necesidad de GPUs dedicadas.
- Educacion y formacion: sirve como herramienta de apoyo para explicar conceptos, resolver dudas o generar material didactico, tanto en texto como con soporte visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version MLX cuantizada en la informacion disponible. El modelo base Qwen3.5-4B, segun el repositorio oficial de Qwen3.5, supera a Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no se proporcionan cifras concretas. Se recomienda consultar la documentacion del modelo base para obtener datos comparativos.

## Requisitos de hardware

- Al ser un modelo en formato MLX, esta diseñado para ejecutarse en dispositivos Apple Silicon (M1, M2, M3 y posteriores).
- El tamaño del repositorio es de 4,5 GB, lo que sugiere un consumo de memoria unificada de aproximadamente 4-6 GB durante la inferencia, dependiendo de la longitud del contexto y el lote.
- Se recomienda un Mac con al menos 8 GB de RAM unificada para un uso fluido; para contextos largos (cercanos a 262.144 tokens) se necesitarian 16 GB o mas.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; para otros entornos se debe usar el modelo original en formato transformers.
- Opciones de despliegue: la libreria mlx-lm permite cargar el modelo directamente desde Hugging Face. Tambien puede usarse con herramientas como LM Studio (si soporta MLX) o mediante scripts personalizados en Python.
- La latencia y el throughput dependen del hardware concreto; en un MacBook Pro con chip M2 Pro se pueden esperar velocidades de decodificacion de 20-40 tokens por segundo, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Oscilla/Qwen3.5-4B-mlx-8Bit | 4B (nominal) | 262.144 | 8-bit | MLX | Apache 2.0 |
| Qwen/Qwen3.5-4B (original) | 4B | 262.144 | Sin cuantizar | Safetensors | Apache 2.0 |
| Oscilla/Qwen3.5-0.8B-mlx-4Bit | 0.8B | No disponible | 4-bit | MLX | Apache 2.0 |

La version MLX de 8 bits ofrece una ventaja en eficiencia de memoria frente al modelo original, a costa de una posible perdida minima de precision. La variante de 0.8B es mas ligera pero con menores capacidades. No se dispone de comparativas con otros modelos multimodales en formato MLX.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con el modelo original sin cuantizar.
- El repositorio tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad; se recomienda probar su integridad antes de un uso critico.
- El conteo de parametros en el archivo safetensors (1.183.558.656) no coincide con el tamaño nominal de 4B, lo que podria indicar un error en la conversion o una version parcial; es necesario verificar la funcionalidad completa.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o informacion factual.
- Al ser una conversion MLX, solo es utilizable en entornos Apple Silicon; no es portable a otras plataformas sin reconvertir los pesos.
- No se han publicado detalles sobre los datos de entrenamiento del modelo base, por lo que se desconoce la cobertura de idiomas y posibles sesgos culturales.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y cumplir con los terminos de la licencia del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Oscilla/Qwen3.5-4B-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio oficial de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Repositorio MTPLX (aceleracion MLX): https://github.com/youssofal/mtplx
