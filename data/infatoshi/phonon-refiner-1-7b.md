# Infatoshi/phonon-refiner-1.7b

## Resumen

Phonon refiner 1.7B es un modelo de corrección de transcripciones de voz desarrollado por Infatoshi como componente del proyecto Phonon, una aplicación local de dictado por voz. El modelo recibe la transcripción cruda generada por un sistema ASR (Parakeet TDT 0.6B v2) y la reescribe para producir el texto que el hablante realmente pretendía escribir: corrige palabras mal reconocidas y términos técnicos, elimina muletillas y falsos arranques, y aplica el formato adecuado al destino del texto mediante modos de escritura configurables.

Se trata de un fine-tune de LiquidAI/LFM3-1.7B, un transformer de 1.728.801.536 parámetros. La revisión actual (Phonon 1.1, nombre de investigación `en_v6_avg`) corrige problemas de sobreexpresión en habla con acento y ruidosa, e incorpora soporte para comandos de formato hablados (viñetas, saltos de línea, párrafos), números hablados (teléfonos, fechas, versiones, horas, divisas) y continuación de frases a mitad de oración mediante contexto de pantalla y texto previo al cursor.

El modelo es relevante porque aborda una tarea concreta y poco cubierta por modelos generalistas: la posprocesado determinista de transcripciones ASR con instrucciones de formato estrictas, manteniendo la redacción y el estilo de mayúsculas del hablante sin añadir ni eliminar contenido. Se distribuye en formatos MLX (4-bit) y GGUF (Q4_K_S) con un drafter de decodificación especulativa, orientado a ejecución local en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit g64 con atención 6-bit y embeddings 8-bit; GGUF Q4_K_S con embeddings y head de 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (MLX) y GGUF (Q4_K_S); drafter GGUF DFlash2 |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B y se ha afinado mediante fine-tuning supervisado sobre datos públicos y sintéticos exclusivamente; según la model card, no se emplearon dictados personales, diccionarios ni reuniones. La única personalización en tiempo de inferencia es la línea de vocabulario incluida en el prompt. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no reside en la arquitectura, sino en el diseño del prompt y del pipeline de inferencia. El modelo recibe un turno de sistema fijo con instrucciones de reescritura, una línea de modo de escritura, y opcionalmente líneas de vocabulario, texto en pantalla (primeras 350 palabras) y texto previo al cursor (últimas 40 palabras). El turno de usuario contiene la transcripción cruda, aplicando una regla de unión que pone en minúscula la primera letra cuando se continúa a mitad de frase, salvo excepciones como `I`, `I'm`, `I'll` o palabras con mayúscula interna como `API` o `GitHub`. Se usa plantilla de chat con thinking desactivado, decodificación greedy, sin penalización de repetición, y un límite de 1,5 veces los tokens de la transcripción más 32 tokens nuevos. El repositorio incluye además un drafter de decodificación especulativa DFlash2 que alcanza 4,3 tokens aceptados por paso en M4 Max.

## Capacidades

- Reescritura de transcripciones ASR: corrección de errores de reconocimiento y términos técnicos manteniendo la redacción y el estilo de mayúsculas del hablante.
- Eliminación de muletillas y falsos arranques.
- Aplicación de modos de escritura para formatear el texto según la aplicación de destino.
- Procesamiento de comandos de formato hablados: viñetas, saltos de línea y saltos de párrafo.
- Normalización de números hablados: teléfonos, fechas, versiones, horas y divisas.
- Manejo de autocorrecciones habladas (el hablante se corrige a sí mismo).
- Continuación a mitad de oración usando el contexto previo al cursor.
- Uso de contexto de pantalla (primeras 350 palabras) para desambiguar términos.
- Personalización mediante línea de vocabulario en el prompt.
- Decodificación especulativa con drafter incluido (4,3 tokens aceptados por paso en M4 Max).
- No soporta tool calling, function calling, agentes, visión, audio ni otros idiomas distintos del inglés según la información disponible.

## Casos de uso

- Dictado por voz local en escritorio: el modelo se integra en la aplicación Phonon para convertir la salida cruda de Parakeet TDT 0.6B v2 en texto limpio y formateado, ejecutándose en local en Apple Silicon con los pesos MLX o GGUF.
- Corrección de términos técnicos en entornos de desarrollo: la línea de vocabulario del prompt permite introducir nombres de APIs, librerías o identificadores para que el modelo los escriba correctamente, útil en dictado de documentación técnica o mensajes de commit.
- Formateo automático de notas y correos: los modos de escritura y los comandos hablados de viñetas, saltos de línea y párrafos permiten generar listas y estructuras sin tocar el teclado.
- Transcripción de reuniones con contexto: el uso del texto en pantalla y del texto previo al cursor permite continuar frases a mitad de oración y mantener coherencia con lo ya escrito en el editor.
- Normalización de datos hablados: conversión fiable de números de teléfono, fechas, versiones de software, horas y cantidades monetarias dictadas, con una tasa del 100% en teléfonos y 96,7% en el peor modo de escritura para números hablados.
- Posprocesado de pipelines ASR existentes: puede insertarse como etapa de refinado sobre cualquier transcripción en inglés, reduciendo la tasa de error de palabra en habla real con acento del 10,32% al 9,92% y en formato largo del 4,10% al 3,99%.
- Accesibilidad y entrada sin teclado: para usuarios que dictan textos largos, el modelo reduce las salidas vacías en clips ruidosos y cortos (de 51 a 18 sobre 3.319 clips) y disminuye los casos en que el refinado empeora el habla cruda en inglés no nativo (del 16,22% al 8,91%).

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la revisión anterior (`f5e269a`) con la actual (`en_v6_avg`), sobre decodificaciones greedy del GGUF Q4_K_S:

| Medida | Revisión anterior (`f5e269a`) | Revisión actual (`en_v6_avg`) |
|---|---:|---:|
| Comandos de formato hablados, peor modo de escritura (viñetas, nueva línea, nuevo párrafo) | 72,0% | 97,3% |
| Trampas de palabras de comando literales activadas erróneamente (200 elementos) | 2,0% | 0,0% |
| Números hablados, peor modo de escritura (300 elementos x 4 modos) | 94,0% | 96,7% |
| Números de teléfono hablados (40 elementos) | 65,0% | 100,0% |
| Autocorrecciones habladas (96 elementos x 4 modos) | 94% a 97% | 96% a 98% |
| Inglés real con acento en 6 grupos de acento (tasa de error de palabra) | 10,32% | 9,92% |
| Clips de inglés no nativo empeorados respecto al habla cruda | 16,22% | 8,91% |
| Salidas vacías en habla ruidosa y corta (3.319 clips) | 51 | 18 |
| Continuación a mitad de oración tras Before-cursor (398 filas reservadas, exacto / mayúsculas correctas) | 71,4% / 88,7% | 76,9% / 98,2% |
| Tasa de error de palabra en formato largo | 4,10% | 3,99% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_S ocupa 988.453.504 bytes (aproximadamente 0,99 GB) y el safetensors MLX 4-bit ocupa 1.133.072.561 bytes (aproximadamente 1,13 GB); el drafter DFlash2 añade 214.803.168 bytes (aproximadamente 0,21 GB).
- GPU recomendadas: no se especifican en la información disponible; el modelo está orientado a ejecución local en Apple Silicon (se menciona M4 Max en la model card).
- Cabe en GPU de consumo: sí, por el tamaño de los pesos cuantizados (en torno a 1 GB), aunque no se detallan modelos concretos de GPU de consumo compatibles.
- Opciones de despliegue: motor nativo de Phonon con GGUF y llama.cpp; MLX en Mac; el repositorio incluye `phonon_engine.json` para indicar qué archivos GGUF carga el motor.
- Latencia y throughput: no se publican cifras de latencia o throughput; se indica que la decodificación especulativa con el drafter incluido alcanza 4,3 tokens aceptados por paso en M4 Max y coincide con la salida greedy no especulativa en 50 de 50 prompts de dictado reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| Infatoshi/phonon-refiner-1.7b | 1.728.801.536 | no disponible | LFM Open License v1.0 | Corrección de transcripciones ASR en inglés | Hugging Face (MLX y GGUF) |
| LiquidAI/LFM3-1.7B | no disponible en la información | no disponible | no disponible en la información | Modelo base de propósito general | Hugging Face |
| Alternativas de corrección ASR especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se ha validado para otros idiomas.
- El modelo está diseñado exclusivamente para reescritura de transcripciones ASR; no es un modelo de propósito general y su uso fuera de ese dominio no está evaluado.
- Riesgo de alucinación y de sobreexpresión: la revisión anterior mostraba problemas de eliminación excesiva en habla con acento y ruidosa; la actual los reduce, pero persisten tasas de error de palabra del 9,92% en habla con acento y del 3,99% en formato largo.
- En clips de inglés no nativo, el 8,91% de los casos empeoran respecto al habla cruda.
- La decodificación es greedy y sin penalización de repetición, con un límite de tokens de salida; desviarse de la configuración de prompt e inferencia documentada puede degradar los resultados.
- La licencia LFM Open License v1.0 (etiquetada como `other`) puede imponer restricciones al uso comercial; debe revisarse el archivo `LICENSE` del repositorio antes de un despliegue en producción.
- Los datos de entrenamiento son públicos y sintéticos; no se ha entrenado con dictados personales, por lo que la personalización depende únicamente de la línea de vocabulario del prompt.
- No se especifican la longitud de contexto ni los detalles del dataset de entrenamiento, lo que limita la evaluación de robustez fuera de los escenarios documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infatoshi/phonon-refiner-1.7b
- Proyecto Phonon: https://github.com/Infatoshi/phonon
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/Infatoshi/phonon-refiner-1.7b/blob/main/LICENSE
- Aviso de cambios: https://huggingface.co/Infatoshi/phonon-refiner-1.7b/blob/main/NOTICE
