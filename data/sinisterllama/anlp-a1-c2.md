# SinisterLlama/anlp-a1-c2

## Resumen

El modelo `SinisterLlama/anlp-a1-c2` es un transformador de secuencia a secuencia (seq2seq) con arquitectura encoder-decoder, desarrollado por Eshaan Sharma como parte de la asignación "ANLP Assignment 1: Custom Transformers & Byte Latent Transformers" en el IIIT Hyderabad. Está diseñado específicamente para la tarea de descifrado de texto cifrado (ciphertext decryption), mapeando secuencias binarias cifradas a texto plano. Con 11,67 millones de parámetros, es un modelo compacto orientado a propósitos educativos y de investigación, no a producción.

El modelo emplea una arquitectura Pre-LayerNorm (Pre-LN) para mejorar el flujo de gradientes, junto con posiciones sinusoidales y atención multi-cabeza (MHA). Según la model card, alcanza una precisión a nivel de bit del 93,63 % y una precisión de secuencia del 67,74 %, con una puntuación BLEU de 98,86 % y ROUGE-L de 99,28 % en el conjunto de prueba. La licencia MIT permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer seq2seq, Pre-LayerNorm, atención multi-cabeza, posiciones sinusoidales |
| Parametros totales | 11,67 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de Hugging Face, librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder Transformer clásica con normalización Pre-LayerNorm, lo que estabiliza el entrenamiento en redes profundas. Utiliza embeddings posicionales sinusoidales y atención multi-cabeza estándar. No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención en la información disponible.

El entrenamiento se realizó para la tarea de descifrado de texto cifrado, donde la entrada son secuencias binarias cifradas y la salida es el texto plano correspondiente. No se proporcionan datos sobre el tamaño del dataset, número de tokens, composición del corpus ni técnicas de optimización como RLHF o DPO. Al ser un proyecto académico, es probable que se haya entrenado con un conjunto de datos sintético generado para la asignación.

## Capacidades

- Descifrado de texto cifrado: el modelo convierte secuencias binarias cifradas en texto plano, alcanzando una precisión de secuencia del 67,74 % y una precisión a nivel de bit del 93,63 %.
- Generación de texto secuencial: como transformador seq2seq, puede generar salidas de longitud variable a partir de entradas codificadas.
- Baja latencia de inferencia: con solo 11,67 M de parámetros, es adecuado para ejecución en CPU o dispositivos con recursos limitados.
- Soporte multilingüe: no disponible; el modelo está entrenado únicamente para inglés (según la etiqueta `language: en`).
- Tool calling y agentes: no soportado; es un modelo puramente seq2seq sin capacidades de función o razonamiento multi-paso.
- Capacidades de visión o audio: no aplican.

## Casos de uso

- Investigación académica en criptografía: el modelo sirve como banco de pruebas para estudiar técnicas de descifrado automático con arquitecturas transformer, permitiendo a estudiantes e investigadores analizar el comportamiento de modelos seq2seq en tareas de cifrado.
- Prototipado de sistemas de descifrado para datos históricos: en entornos controlados, puede utilizarse para recuperar texto plano de secuencias cifradas generadas con algoritmos simples, como en laboratorios de seguridad.
- Educación en arquitecturas transformer: al ser un modelo pequeño y de código abierto, es útil para demostrar conceptos de encoder-decoder, Pre-LayerNorm y atención multi-cabeza en cursos de procesamiento de lenguaje natural.
- Evaluación de métricas de generación de texto: los resultados reportados (BLEU, ROUGE, Levenshtein) permiten comparar el rendimiento de diferentes configuraciones de transformadores en tareas de transcripción.
- Base para fine-tuning en tareas de traducción o normalización de texto: aunque no está diseñado para ello, su arquitectura genérica seq2seq podría adaptarse con entrenamiento adicional.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en Raspberry Pi o dispositivos embebidos para experimentos de descifrado en tiempo real, aunque con precisión limitada.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de prueba:

| Metrica | Valor |
|---|---|
| Precisión a nivel de bit | 93,63 % |
| Precisión de secuencia | 67,74 % |
| BLEU | 98,86 % |
| ROUGE-1 | 99,28 % |
| ROUGE-2 | 98,12 % |
| ROUGE-L | 99,28 % |
| Distancia de Levenshtein promedio | 0,40 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores deben interpretarse con cautela, ya que el conjunto de prueba probablemente consiste en datos sintéticos específicos de la asignación.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en FP32; con cuantización a int8 o int4, podría caber en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). También funciona en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna puede ejecutarlo.
- Opciones de despliegue: al usar la librería transformers, se puede servir con vLLM, Ollama o TGI, aunque por su tamaño es más práctico ejecutarlo directamente en un script Python.
- Latencia esperada: del orden de milisegundos por muestra en CPU moderna; en GPU, inferior a 10 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de descifrado de texto cifrado. Modelos genéricos seq2seq como T5-small (60 M parámetros) o BART-base (139 M parámetros) son más grandes y no están entrenados para esta tarea. No se puede establecer una comparación directa sin datos de referencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado con datos sintéticos de una asignación, puede no generalizar a patrones de cifrado del mundo real.
- Riesgo de alucinación: la precisión de secuencia del 67,74 % indica que en aproximadamente un tercio de los casos la salida completa no es correcta, lo que puede generar texto plausible pero incorrecto.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; es probable que esté limitado a secuencias cortas.
- Restricciones de idioma: solo inglés; no soporta otros idiomas.
- Uso en producción: no recomendado para sistemas críticos de seguridad o descifrado real, ya que su rendimiento es insuficiente para aplicaciones robustas.
- Dependencia del formato de entrada: el modelo espera secuencias binarias cifradas; cualquier desviación en el formato puede degradar el rendimiento.

## Enlaces

- Hugging Face: [https://huggingface.co/SinisterLlama/anlp-a1-c2](https://huggingface.co/SinisterLlama/anlp-a1-c2)
- Repositorio GitHub: [https://github.com/SinisterLlamma/ANLP-Assignment1](https://github.com/SinisterLlamma/ANLP-Assignment1)
- Autor (Hugging Face): [https://huggingface.co/SinisterLlama](https://huggingface.co/SinisterLlama)
