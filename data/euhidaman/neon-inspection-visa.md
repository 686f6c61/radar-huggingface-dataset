# euhidaman/neon-inspection-visa

## Resumen

Neon inspection — VisA circuit boards es un modelo de inspección visual industrial desarrollado por euhidaman (bajo la etiqueta zevion-labs) que clasifica fotografías de placas de circuito impreso como defectuosas o no defectuosas. Se trata de un sistema image-to-text muy compacto que combina un codificador convolucional congelado con un decodificador GRU entrenado desde cero, y que genera una frase corta de inspección junto con una decisión estructurada (PASS, REJECT o UNCERTAIN). El modelo está empaquetado en formato TFLite con cuantización INT8 y orientado a despliegue en dispositivos Coral y hosts Linux x86-64 sin GPU.

El modelo no es un VLM de propósito general: está entrenado y evaluado exclusivamente sobre la categoría pcb4 del dataset VisA de Amazon, y el propio autor advierte que ambas releases fallaron los criterios internos de aceptación de calidad del proyecto. La inferencia en host ha sido verificada, pero la inferencia en hardware Coral físico no se ha validado.

Su relevancia es principalmente como referencia de investigación sobre inspección visual de bajo coste computacional: demuestra un pipeline completo (entrenamiento, cuantización INT8, SDK, CLI, evidencias) con un payload desplegado de aproximadamente 0,58 MB y 257.961 parámetros en el decodificador, lo que lo sitúa en la categoría de modelos TinyML para edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV2 alpha 0.35 congelada, hasta block 13) + decodificador GRU condicionado por imagen e instrucción |
| Parámetros totales | 257.961 parámetros en el decodificador; el codificador MobileNetV2 está congelado y no se especifica su recuento |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (vocabulario de 41 tokens, máximo 24 tokens de salida) |
| Tipos de cuantización | INT8 en codificador y matrices del decodificador; aritmética y activaciones del decodificador en FP32 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | TFLite (payload compilado del codificador y decodificador, ~0,58 MB) |
| Entrada | imagen RGB 224 × 224 |
| Salida | frase de inspección + decisión PASS / REJECT / UNCERTAIN |
| Hardware objetivo | Coral (no verificado en placa física) y Linux x86-64, Python 3.11 |

## Arquitectura y entrenamiento

El modelo usa un prefijo convolucional MobileNetV2 con factor de anchura alpha 0.35, inicializado con pesos de ImageNet y congelado hasta la expansión del bloque 13. Sobre las características de imagen se entrena desde inicialización aleatoria un decodificador GRU condicionado por la imagen y por una instrucción, con un vocabulario de 41 tokens y un máximo de 24 tokens de salida. El codificador y las matrices del decodificador se cuantizan a INT8, mientras que la aritmética y las activaciones del decodificador permanecen en FP32; el autor indica explícitamente que no es un modelo totalmente entero ni de 1,58 bits.

El entrenamiento se realizó sobre el split 2cls_highshot de VisA, con 603 imágenes normales y 60 anómalas de origen, divididas en 482 normales + 48 anómalas para entrenamiento y 121 normales + 12 anómalas para validación, con vistas sintéticas adicionales etiquetadas como poco claras. Las frases de supervisión se derivaron de las etiquetas y anotaciones del dataset. No se menciona uso de RLHF ni DPO. Cuarenta fotografías de test tuvieron exposición histórica al proyecto, por lo que el test completo no constituye una confirmación limpia e independiente.

## Capacidades

- Inspección visual de placas de circuito de la categoría pcb4 de VisA: detecta presencia o ausencia de anomalías visibles.
- Generación de una frase corta de inspección en inglés (por ejemplo, "reject visible anomaly.").
- Emisión de una decisión estructurada: PASS, REJECT o UNCERTAIN.
- Modo de salida "summary" y modo "location" (este último no genera máscara de segmentación ni bounding box del defecto).
- Verificación de confianza y política que puede retener la decisión (UNCERTAIN) aunque la frase generada suene definitiva.
- SDK de Python (`neon_sdk.coral_inspection`) para carga e inferencia local.
- CLI con modo vigilancia de directorio (`--watch`) para procesar archivos entrantes y escribir en `inspection.jsonl`.
- Acciones de controlador simuladas (no son instrucciones para maquinaria real).
- No soporta tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión general ni audio.

## Casos de uso

- Inspección de placas pcb4 en línea de montaje: el modelo recibe una foto de la placa y devuelve PASS/REJECT/UNCERTAIN para triaje previo a revisión humana, adecuado por su payload de ~0,58 MB y su ejecución sin GPU.
- Pre-filtrado en control de calidad con Coral: despliegue en dispositivos embebidos Coral para descartar placas claramente correctas antes de una inspección más costosa, aunque la inferencia en placa física no está verificada por el autor.
- Monitorización por lotes de archivos entrantes: el CLI con `--watch` procesa imágenes que llegan a un directorio y registra resultados en `inspection.jsonl`, útil para integrar en un pipeline de captura automatizada.
- Investigación en TinyML industrial: sirve como referencia reproducible de un pipeline completo (entrenamiento, cuantización INT8, SDK, evidencias) para experimentos académicos sobre inspección visual de bajo coste.
- Prototipado de sistemas de inspección asistida: el SDK permite cargar el paquete y llamar a `inspect()` desde Python para validar la integración antes de invertir en un modelo mayor.
- Detección de anomalías con revisión humana obligatoria: el estado UNCERTAIN y la política de confianza permiten derivar casos dudosos a un operario, reduciendo falsos rechazos en producción.
- Educación y demostración: ejemplo de modelo image-to-text condicionado por instrucción con vocabulario mínimo, útil para enseñar cuantización y despliegue edge.

## Benchmarks y rendimiento

Resultados registrados sobre las 442 imágenes oficiales de test de la categoría pcb4, en modo location y comparando solo presencia de defecto:

| Resultado | Imágenes |
|---|---:|
| Detecta correctamente un defecto | 37 |
| Identifica correctamente ausencia de defecto | 377 |
| No detecta un defecto (falso negativo) | 3 |
| Falsa alarma (falso positivo) | 11 |
| Requiere revisión humana (UNCERTAIN) | 14 |

El autor advierte que la detección correcta del defecto no garantiza que la ubicación generada sea correcta, y que 40 fotografías de test tuvieron exposición histórica al proyecto. No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- Host soportado: Linux x86-64 con Python 3.11; otros hosts necesitan una compilación nativa validada por separado.
- Hardware edge: Coral (inferencia en placa física no verificada por el autor).
- GPU recomendadas: no aplica; no se documenta uso de A100, H100 ni RTX 4090.
- Cabe en cualquier consumer GPU o CPU moderna por el tamaño del payload (~0,58 MB), aunque el requisito real es compatibilidad con las librerías nativas del SDK.
- Opciones de despliegue: SDK de Python incluido (`neon_sdk.coral_inspection`), CLI `package/tools/neon_inspect.py` con modo `--watch`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- En el clúster Nibi, la inferencia debe ejecutarse dentro de una asignación Slurm.
- No se deben escribir archivos nuevos dentro de `package/`: el SDK verifica el inventario completo y los hashes.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (inspección visual industrial TinyML sobre VisA) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Ámbito restringido: solo la categoría pcb4 de VisA; no es un VLM de propósito general ni un sistema de control de calidad industrial probado.
- El autor declara que ambas releases fallaron los criterios globales de aceptación de calidad del proyecto.
- La inferencia en hardware Coral físico no ha sido verificada; solo se ha ejecutado en host.
- No genera máscara de segmentación ni bounding box del defecto; las anotaciones rojas de la demo provienen de los datasets.
- El test no es una confirmación limpia: 40 imágenes tuvieron exposición histórica al proyecto.
- Riesgo de falsos negativos (3) y falsos positivos (11) sobre 442 imágenes; requiere revisión humana para casos UNCERTAIN.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento usa un conjunto muy pequeño (48 anómalas de entrenamiento), lo que limita la generalización.
- Idioma limitado al inglés; vocabulario de 41 tokens y máximo 24 tokens de salida.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Las acciones de controlador son simuladas, no instrucciones para maquinaria real.
- El tamaño del payload no equivale al pico de RAM en ejecución.
- No se debe modificar el contenido de `package/` por la verificación de hashes del SDK.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/euhidaman/neon-inspection-visa
- Demo: https://zevion-neon-inspection.netlify.app/?v=4
- Dataset VisA (fuente): https://github.com/amazon-science/spot-diff
- Licencia de la foto de ejemplo: https://creativecommons.org/licenses/by/4.0/
