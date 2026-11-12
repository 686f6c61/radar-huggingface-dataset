# Sergey321-345/XENON-DECISION-1

## Resumen

XENON-DECISION-1 es un modelo experimental de clasificación de texto desarrollado por XenLogic (cuenta de Hugging Face `Sergey321-345`). Se trata de un transformer encoder de dos capas entrenado desde cero, sin pesos preentrenados de terceros, cuyo objetivo es asignar una de cuatro categorías (`programming`, `mathematics`, `information`, `other`) a una consulta de entrada. Con 462.980 parámetros totales, es un modelo de escala muy reducida, orientado a la experimentación y a la validación de arquitecturas propias más que a uso en producción.

La relevancia del modelo es limitada y de carácter fundamentalmente académico o exploratorio: sirve como banco de pruebas para el tokenizador UTF-8 byte personalizado y la arquitectura propietaria de XenLogic. La versión publicada es la v6, que continúa el ajuste fino desde el checkpoint v4. No emplea técnicas de alineación como RLHF o DPO, y su model card advierte explícitamente de que no está listo para producción.

El modelo soporta ruso e inglés según sus metadatos, con una ventana máxima de 256 bytes UTF-8, y devuelve puntuaciones softmax que el propio autor advierte que no están calibradas como probabilidades de confianza. Su rendimiento publicado es preliminar y se basa en conjuntos de evaluación muy pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 2 capas |
| Parámetros totales | 462.980 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 bytes UTF-8 (truncado por encima) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | no disponible (pendiente de definir por el desarrollador) |
| Formato de pesos | safetensors (librería PyTorch) |

Especificaciones adicionales declaradas en la model card: dimensión de embedding de 128, 4 cabezas de atención, tokenizador byte UTF-8 personalizado, pipeline `text-classification`, 4 categorías de salida y tamaño de repositorio de 0.0 GB.

## Arquitectura y entrenamiento

El modelo es un transformer encoder de dos capas con dimensión de embedding de 128 y 4 cabezas de atención. Utiliza un tokenizador byte UTF-8 personalizado en lugar de un tokenizador BPE o WordPiece estándar, lo que implica que la unidad de entrada es el byte y no el subword. La entrada se trunca a 256 bytes UTF-8. La inicialización se realizó desde cero en el experimento v1 original, y la v6 continúa el ajuste fino desde el checkpoint v4, sin usar pesos preentrenados de terceros.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas de RLHF, DPO o instrucción. Tampoco se describe ninguna innovación técnica destacable más allá del tokenizador byte propio y del entrenamiento from-scratch. La salida es una distribución softmax sobre cuatro clases, con la advertencia explícita de que esas puntuaciones no están calibradas.

## Capacidades

- Clasificación de texto en una de cuatro categorías: `programming`, `mathematics`, `information`, `other`.
- Predicción de una única etiqueta por petición.
- Salida de puntuaciones softmax por clase (no calibradas como probabilidades de confianza).
- Soporte de entrada en ruso e inglés según los metadatos del modelo.
- Procesamiento de entradas de hasta 256 bytes UTF-8, con truncado del excedente.
- No genera texto: es exclusivamente un clasificador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No soporta entrada de imagen, audio, vídeo ni PDF.
- No dispone de modo de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Prototipado de pipelines de clasificación de consultas: el modelo puede usarse como primer filtro para etiquetar una consulta entrante como `programming`, `mathematics`, `information` u `other` antes de derivarla a un sistema más capaz, dado su coste computacional mínimo.
- Enrutamiento de consultas en asistentes técnicos: clasificar la intención temática de una pregunta para dirigirla al módulo o especialista adecuado, aprovechando las cuatro categorías predefinidas.
- Investigación sobre tokenizadores byte-level: sirve como banco de pruebas para estudiar el comportamiento de un tokenizador UTF-8 personalizado frente a tokenizadores subword en tareas de clasificación.
- Experimentación con arquitecturas from-scratch: útil para comparar el rendimiento de un encoder de 2 capas y 462.980 parámetros con variantes de mayor tamaño en tareas controladas.
- Clasificación de documentación técnica breve: etiquetar fragmentos cortos (por debajo de 256 bytes) de documentación o mensajes como matemáticos, de programación o informativos.
- Filtrado previo en corpus bilingües ruso-inglés: separar contenido técnico por temática en conjuntos de datos pequeños donde no se requiera alta precisión.
- Docencia y demostraciones: ejemplo didáctico de un pipeline completo de clasificación de texto con PyTorch y safetensors, con un modelo de tamaño despreciable.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Modelo | Métrica | Resultado |
|---|---|---|---|
| Conjunto de comparación de 32 ejemplos | v4 | Accuracy | 50,00 % |
| Conjunto de comparación de 32 ejemplos | v6 | Accuracy | 56,25 % |
| Conjunto de comparación de 32 ejemplos | v6 | Macro F1 | 0,5258 |
| Benchmark de 200 preguntas (previamente inspeccionado) | v4 | Accuracy | 61,50 % |
| Benchmark de 200 preguntas (previamente inspeccionado) | v6 | Accuracy | no evaluado |

El propio autor califica estos resultados como preliminares y advierte de que el conjunto de 32 ejemplos es demasiado pequeño para establecer una generalización fiable. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 462.980 parámetros en precisión FP32, los pesos ocupan aproximadamente 1,85 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona en CPU sin problema. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y un `inference.py` propio, el despliegue natural es mediante el script incluido. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos en CPU y microsegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XENON-DECISION-1 | 462.980 | 256 bytes UTF-8 | Clasificación (4 clases) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores from-scratch de escala similar con tokenizador byte-level) en la documentación proporcionada. La model card menciona que el modelo "no es equivalente en capacidad a Gemini Decision 1", pero no aporta datos de comparación.

## Limitaciones y advertencias

- Modelo de investigación experimental: el autor lo declara explícitamente no apto para producción.
- Solo clasifica texto; no genera texto ni responde preguntas.
- Devuelve una única etiqueta por petición; no soporta clasificación multietiqueta.
- Las entradas superiores a 256 bytes UTF-8 se truncan, lo que puede degradar la clasificación de textos largos.
- Las consultas en inglés y las de carácter científico siguen siendo difíciles para el modelo, según el autor.
- Las puntuaciones softmax no están calibradas como probabilidades de confianza; no deben interpretarse como tal en sistemas de decisión.
- Rendimiento preliminar medido sobre 32 ejemplos (56,25 % de accuracy, macro F1 de 0,5258), insuficiente para establecer generalización fiable.
- El benchmark de 200 preguntas no se ha evaluado para la v6; la v4 obtuvo 61,50 %.
- No soporta imagen, audio, vídeo ni PDF.
- Licencia sin definir: el autor indica que el estado de la licencia debe determinarse antes de cualquier reutilización o redistribución, por lo que el uso comercial no está autorizado de forma explícita.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al ser un clasificador, el riesgo principal es la clasificación errónea, no la generación de contenido falso.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sergey321-345/XENON-DECISION-1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
