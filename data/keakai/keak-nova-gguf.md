# keakai/keak-nova-GGUF

## Resumen

Keak Nova 1 es el primer modelo de visión de Keak, una versión local y sin conexión basada en Qwen3-VL-4B-Instruct. Con 4.022 millones de parámetros, combina un modelo de lenguaje con un proyector de visión que convierte imágenes en tokens procesables, lo que le permite describir pantallas, localizar elementos en capturas y actuar sobre lo que ve. Se distribuye en formato GGUF (Q4_K_M) y requiere dos archivos: el modelo de lenguaje y el proyector de visión, ya que sin este último no puede procesar imágenes.

El modelo se presenta como la opción "grande" de Keak, complementando al modelo de texto Ember. Ha sido entrenado mediante LoRA sobre la base de Qwen3-VL-4B, sin destilación de modelos propietarios, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer capacidades de visión en entornos on-device, sin conexión ni cuenta, manteniendo un tamaño lo suficientemente compacto para ejecutarse en portátiles. No obstante, solo está evaluado en inglés y la versión cuantizada publicada no ha sido re-benchmarked de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (vision-language transformer con proyector de visión) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada (el ejemplo de uso emplea 4096 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | inglés (único evaluado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje y proyector de visión en archivos separados) |

## Arquitectura y entrenamiento

Keak Nova 1 se basa en la arquitectura Qwen3-VL-4B, un modelo vision-language de 4.022 millones de parámetros que combina un transformer para texto con un codificador visual y un proyector que convierte características de imagen en embeddings de texto. El proceso de entrenamiento consistió en una fine-tune con LoRA sobre el modelo base, seguida de la fusión de los pesos de LoRA en el modelo final y posterior cuantización a GGUF Q4_K_M para su distribución. No se ha empleado destilación de modelos de frontera (como Claude o GPT) en los datos de entrenamiento, lo que permite publicar los pesos de forma abierta bajo Apache 2.0.

El modelo requiere dos archivos separados: el modelo de lenguaje (`keak-nova-1.gguf`) y el proyector de visión (`keak-nova-1-mmproj-f16.gguf`). Sin el proyector, el modelo no puede procesar imágenes y se convierte en un modelo de texto más grande y lento que Ember, el modelo de texto de Keak. El entrenamiento se ha realizado con datos en inglés, y no se ha evaluado el rendimiento en otros idiomas.

## Capacidades

- Descripción de pantallas y capturas: puede describir el contenido visual de un screenshot o foto, identificando elementos, texto y disposición.
- Localización de elementos en imágenes: encuentra objetos, texto o regiones específicas en una captura, útil para tareas de búsqueda visual.
- Actuación sobre lo que ve: basado en el contenido de la imagen, puede generar acciones o respuestas contextuales, aunque no se detalla un mecanismo de control directo.
- Generación de texto: mantiene las capacidades de generación de texto del modelo base, aunque no es su propósito principal.
- Razonamiento básico: dado que se basa en Qwen3-VL-4B, hereda capacidades de razonamiento de nivel medio para tareas de texto e imagen.
- Sin soporte de tool calling ni función calling: no se menciona en la documentación, por lo que no se puede garantizar.
- Sin capacidades multilingües: solo inglés evaluado; otros idiomas no son confiables.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir el contenido de la pantalla del ordenador en tiempo real, permitiendo a usuarios con baja visión entender qué hay en la pantalla sin depender de herramientas externas.
- Automatización de tareas GUI: al localizar botones o campos específicos en una captura de pantalla, el modelo puede generar comandos para interactuar con una interfaz, por ejemplo, en un script de automatización de pruebas.
- Soporte técnico remoto: un técnico puede enviar una captura de pantalla del error y el modelo describe el problema, ayudando a diagnosticar incidencias de software sin necesidad de acceso directo.
- Análisis de documentos escaneados: al recibir una foto de un documento, el modelo extrae y describe el contenido textual y visual, útil para digitalización rápida.
- Control de dispositivos por voz: combinado con un motor de síntesis, el modelo puede describir lo que ve en la pantalla y luego ejecutar comandos de voz para realizar acciones, como abrir una aplicación o buscar un elemento.
- Investigación en IA on-device: sirve como punto de partida para experimentar con modelos de visión pequeños en entornos con restricciones de conectividad o privacidad, como dispositivos médicos o industriales.

## Benchmarks y rendimiento

La model card proporciona resultados del benchmark propio KeakBench, pero con una advertencia explícita: los números se midieron sobre el build f16 sin fusionar (antes de fusionar la LoRA y cuantizar a GGUF), y el modelo cuantizado publicado no ha sido re-benchmarked. Por tanto, los siguientes valores deben tratarse como límite superior, no como medición del archivo GGUF.

| Benchmark | Score |
|---|---|
| KeakScore (overall) | 0.9066 |
| guard | 0.8636 |

El score `guard` está por debajo del objetivo del proyecto (1.000), lo que indica que el modelo no rechaza de forma fiable ciertas instrucciones peligrosas (como filtrar información sensible o obedecer instrucciones inyectadas). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en GGUF Q4_K_M, los pesos ocupan aproximadamente 2-3 GB. Con una ventana de contexto de 4096 tokens y el proyector de visión adicional, se estima un consumo total de VRAM de 4-6 GB, dependiendo de la resolución de imagen.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutarlo en inferencia, por ejemplo una NVIDIA RTX 2060, GTX 1660 Super, o integradas en portátiles con suficiente memoria compartida. Para mayor velocidad, se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio y alto. En una RTX 4090 (24 GB) se ejecutaría con margen.
- Opciones de despliegue: llama.cpp (incluido el comando `llama-server` con `--mmproj`), también puede usarse con otros runtimes compatibles con GGUF como Ollama, aunque no se documenta explícitamente. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización, se espera una velocidad de generación de unos 20-30 tokens por segundo en una GPU media, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas en la información proporcionada. Como referencia, el modelo base Qwen3-VL-4B-Instruct es un modelo de 4B con capacidades de visión y texto, publicado bajo Apache 2.0, con una ventana de contexto de 32K tokens (según su documentación oficial). Sin embargo, Keak Nova 1 está cuantizado y adaptado para tareas específicas de pantalla, por lo que no es directamente comparable. No se incluyen aquí comparaciones numéricas porque no hay datos de benchmarks estándar para Nova.

## Limitaciones y advertencias

- El modelo cuantizado publicado no ha sido re-benchmarked; los números de KeakBench provienen de un build f16 sin fusionar y pueden ser superiores a lo que realmente rinde el archivo GGUF.
- El score `guard` es 0.8636, por debajo del objetivo de 1.000 del proyecto. Esto implica que el modelo no rechaza de forma fiable ciertas instrucciones maliciosas o intentos de inyección, lo que lo hace no apto para manejar información sensible sin supervisión humana.
- Solo se ha evaluado en inglés; otros idiomas no son confiables.
- Es la primera versión de Nova, no hay historial de regresiones ni comparación con versiones anteriores.
- El modelo no está diseñado para ser un generador de subtítulos general; su rendimiento fuera de las tareas de pantalla no ha sido evaluado.
- No se documenta soporte para tool calling, function calling o capacidades de agente; no se puede garantizar su uso en pipelines de automatización complejas.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda no confiar en él para tareas sensibles sin revisar cada fallo de guard.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keakai/keak-nova-GGUF
- Repositorio de benchmark KeakBench: https://github.com/PepSecanell/keak-ai
- Perfil del autor en Hugging Face: https://huggingface.co/keakai
