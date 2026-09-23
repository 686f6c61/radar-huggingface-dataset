# madhushripatil032003/readnet-onnx

## Resumen

ReadNet ONNX es una exportación al formato ONNX del modelo de reconocimiento automático de voz Harveenchadha/vakyansh-wav2vec2-hindi-him-4200, un wav2vec2 ajustado para hindi. El repositorio lo publica el usuario madhushripatil032003 y su única diferencia respecto al modelo original es el formato: se mantiene la precisión completa (fp32) y se añade una capa de log-softmax a la salida, de modo que el modelo devuelve directamente log-probabilidades listas para decodificación CTC.

El artefacto está pensado para ejecutarse en el navegador: el archivo `hi.onnx` acepta `input_values` (una señal mono a 16 kHz normalizada a media cero y varianza unitaria) y produce `log_probs` con forma 1 × fotogramas × 67, junto con `vocab_hi.json`, el vocabulario CTC cuyo token en blanco es `<s>` (id 0). Los 67 símbolos de salida indican que se trata de un modelo compacto orientado a una única lengua, no de un sistema multilingüe.

Su relevancia es acotada pero concreta: sirve como motor de transcripción del proyecto ReadNet, que evalúa la lectura en voz alta de niños y puntúa su pronunciación mediante Goodness of Pronunciation (GOP) sin salir del navegador. Al ser una exportación ONNX de un modelo con licencia MIT, es directamente reutilizable en aplicaciones web o de borde sin dependencia de infraestructura de servidor. El repositorio no registra descargas ni "likes" en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de ASR; entrada de audio mono a 16 kHz) |
| Tipos de cuantización | no disponible; la exportación se distribuye en precisión completa (fp32) |
| Idiomas soportados | hindi (`hi`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`hi.onnx`) |
| Tamaño del repositorio | 0,4 GB |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | Harveenchadha/vakyansh-wav2vec2-hindi-him-4200 |
| Vocabulario | `vocab_hi.json`; 67 símbolos; token en blanco `<s>` (id 0) |
| Entrada | `input_values`: 1 × muestras, 16 kHz mono, normalizado a media cero y varianza unitaria |
| Salida | `log_probs`: 1 × fotogramas × 67, con log-softmax aplicado |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2, un codificador convolucional seguido de un transformer que opera sobre representaciones de audio en bruto y se entrena con pérdida CTC. En este repositorio no hay entrenamiento nuevo: se trata de una conversión de formato del modelo Harveenchadha/vakyansh-wav2vec2-hindi-him-4200, que pertenece a la familia Vakyansh de modelos de reconocimiento de voz para lenguas indias. El autor de la model card indica explícitamente que el modelo se mantiene "sin cambios salvo el formato": precisión completa y salida pasada por log-softmax.

Tampoco se documentan en la información disponible los datos de entrenamiento del modelo base (número de horas de audio, composición del corpus, uso de aumentación o de ajuste fino adicional), ni detalles sobre la receta de conversión (versión de PyTorch/ONNX, opset, herramientas empleadas u optimizaciones gráficas). La única particularidad técnica verificable es la elección de exponer log-probabilidades en lugar de logits, lo que evita aplicar log-softmax en el cliente durante la decodificación CTC.

## Capacidades

- Reconocimiento automático de voz en hindi a partir de audio mono a 16 kHz.
- Decodificación CTC directa: la salida ya incorpora log-softmax, por lo que puede alimentar un decodificador greedy o de haz sin preprocesado adicional.
- Reutilización del vocabulario CTC publicado (`vocab_hi.json`) para mapear índices a símbolos del alfabeto hindi.
- Ejecución en navegador mediante ONNX Runtime Web (el caso de uso declarado por el autor), lo que permite inferencia local sin enviar audio a un servidor.
- Puntuación de pronunciación del tipo GOP: al disponer de log-probabilidades por fotograma, es posible comparar la secuencia esperada con la observada para estimar la calidad de la articulación.
- Integrable en pipelines de Python mediante ONNX Runtime, dado que la interfaz de entrada y salida está estandarizada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz mono a 16 kHz, ni capacidades multilingües más allá del hindi.

## Casos de uso

- Evaluación de la lectura infantil: es el propósito declarado del modelo. ReadNet transcribe la lectura en voz alta de un menor en hindi y, combinando la transcripción con las log-probabilidades por fotograma, calcula una puntuación GOP de pronunciación; todo el proceso ocurre en el navegador con `hi.onnx`.
- Aplicaciones educativas sin servidor: al ejecutarse en el cliente mediante ONNX Runtime Web, permite desplegar tutores de lectura en regiones con conectividad limitada o con requisitos estrictos de privacidad, ya que el audio del menor no abandona el dispositivo.
- Transcripción de voz en hindi para herramientas internas: dictado de notas, subtitulado de reuniones o generación de actas en entornos donde el hindi es la lengua de trabajo, aprovechando el vocabulario CTC de 67 símbolos.
- Anotación y preetiquetado de corpus de voz: transcripción automática previa a la revisión humana para acelerar la construcción de conjuntos de datos en hindi.
- Prototipado rápido de interfaces de voz: dado el tamaño reducido del repositorio (0,4 GB) y la ausencia de dependencias propietarias, sirve para validar con rapidez un flujo de ASR en hindi antes de decidir si se necesita un modelo mayor.
- Investigación en evaluación de pronunciación: la salida de log-probabilidades por fotograma facilita experimentar con distintas métricas GOP, alineamientos forzados y umbrales de error fonético sin reentrenar el modelo.
- Pruebas comparativas de exportación ONNX frente a PyTorch: el repositorio permite medir diferencias de latencia y de precisión entre el modelo original y su versión ONNX en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, CER ni comparaciones cuantitativas con otros sistemas, y el repositorio no registra descargas que permitan inferir una validación por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el repositorio completo ocupa 0,4 GB en precisión completa, por lo que el archivo ONNX se carga holgadamente en GPUs con pocos gigabytes de memoria; se trata de una estimación derivada del tamaño del repositorio, no de un dato publicado.
- GPU recomendadas: no disponible. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) o con WebGPU para la ejecución en navegador debería ser suficiente dado el tamaño del modelo.
- GPU de consumo: previsiblemente sí cabe en cualquier GPU de consumo actual, e incluso en iGPU, al tratarse de un modelo compacto de una sola lengua; no hay cifras oficiales confirmadas.
- Despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador (el escenario previsto por el autor), y potencialmente servidores de inferencia compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| madhushripatil032003/readnet-onnx | no disponible | audio mono 16 kHz | hindi | MIT | ONNX |
| Harveenchadha/vakyansh-wav2vec2-hindi-him-4200 | no disponible | audio mono 16 kHz | hindi | MIT | safetensors / PyTorch |
| Whisper (OpenAI, variante pequeña) | ~74 M en la versión base; ~244 M en small (cifras aproximadas de conocimiento general) | audio 16 kHz | multilingüe (incluye hindi) | MIT | PyTorch, ONNX, GGUF, entre otros |
| Modelos Vakyansh de otras lenguas indias | no disponible | audio mono 16 kHz | una lengua por modelo | MIT en la mayoría de variantes | safetensors / PyTorch |

Nota: los datos de las alternativas no provienen de la información proporcionada en esta ficha, salvo en el caso del modelo base, y deben verificarse en sus respectivas model cards. La ventaja diferencial de readnet-onnx frente al modelo base no es de precisión, sino de despliegue: mismo modelo en formato ONNX con log-softmax incorporado, apto para ejecución en navegador.

## Limitaciones y advertencias

- Modelo monolingüe: solo reconoce hindi. No se documenta ningún otro idioma soportado.
- Sesgos no evaluados: la model card no aporta análisis de sesgo por acento, dialecto, edad o género. El modelo base se entrenó para hindi, lo que puede traducirse en un rendimiento desigual entre variedades dialectales y, de forma especialmente relevante para su uso previsto, entre voces infantiles y adultas.
- Riesgo de alucinación y de errores de transcripción: como todo sistema CTC, puede producir sustituciones, omisiones e inserciones, sobre todo con ruido de fondo, solapamiento de voces o audio de baja calidad. En un contexto de evaluación de la lectura infantil, un error de transcripción puede penalizar injustamente al menor.
- Requisitos de preprocesado estrictos: la entrada debe ser audio mono a 16 kHz normalizado a media cero y varianza unitaria. Omitir esta normalización degrada la calidad de la transcripción.
- Vocabulario limitado a 67 símbolos: cubre el alfabeto hindi, pero no incluye puntuación, dígitos ni caracteres de otros alfabetos, lo que limita su uso en transcripción de texto mixto.
- Ausencia de validación comunitaria: el repositorio no registra descargas ni "likes", y no se publican métricas de WER/CER. No hay evidencia pública de su comportamiento en producción.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar igualmente las condiciones del modelo base y de las herramientas empleadas en la conversión si se redistribuye.
- Trazabilidad de la conversión: no se documentan la versión de ONNX Runtime, el opset ni el script de exportación, lo que dificulta reproducir exactamente el artefacto o auditar diferencias numéricas respecto al modelo original.
- Uso responsable con menores: al estar orientado a evaluar la lectura de niños, cualquier despliegue debería incluir revisión humana y garantías de privacidad, aunque la inferencia local en el navegador reduce la exposición de datos.
- Fechas del repositorio: la model card indica creación y última actualización en septiembre de 2026, posteriores a la fecha habitual de consulta; conviene comprobar el estado real del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madhushripatil032003/readnet-onnx
- Modelo base: https://huggingface.co/Harveenchadha/vakyansh-wav2vec2-hindi-him-4200
- Repositorio de ReadNet (código de la aplicación que lo utiliza, carpeta `readnet/`): https://github.com/patilllmadhushri-ship-it/Evals
