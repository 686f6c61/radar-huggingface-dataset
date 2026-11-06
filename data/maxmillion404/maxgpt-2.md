# MaxMillion404/MaxGPT-2

## Resumen

MaxGPT-2 es un modelo de lenguaje de 113.170.944 parámetros entrenado desde cero en PyTorch por Maxwell Brohm, un estudiante de instituto, dentro de la familia MaxGPT. Es el segundo de cuatro modelos de la serie y duplica en profundidad y anchura a su predecesor MaxGPT-1 (23M). No utiliza pesos preentrenados ni la librería `transformers`: todo el código (configuración, modelo, tokenizador y muestreo) está escrito a mano y se distribuye junto a los pesos en el repositorio.

El modelo resuelve un problema fundamentalmente pedagógico y de investigación: demostrar qué capacidades emergen al escalar un transformer decoder-only entrenado con recursos mínimos. Con 12 bloques, anchura 768, 12 cabezas de atención y una ventana de contexto de 512 tokens, MaxGPT-2 se entrenó durante unas 10 horas en una única GPU RTX 5070 de 12 GB sobre una mezcla de TinyStories y OpenAssistant, la misma que MaxGPT-1, de modo que la comparación entre ambos aísla el efecto del tamaño.

Su relevancia actual es acotada pero clara: sirve como referencia reproducible de entrenamiento from-scratch, como banco de pruebas para estudiar la aparición del formato conversacional USER/ASSISTANT en modelos pequeños y como ejemplo didáctico de pipeline completo (tokenizador BPE propio de 16.000 tokens, entrenamiento, muestreo e inferencia en CUDA, Apple MPS o CPU). No está pensado para producción ni para tareas que requieran fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 12 bloques, hidden size 768, 12 cabezas de atención |
| Parametros totales | 113.170.944 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en el formato original) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con código propio en PyTorch |

## Arquitectura y entrenamiento

MaxGPT-2 es un transformer decoder-only de tipo GPT con 12 bloques, dimensión oculta de 768 y 12 cabezas de atención, lo que da 113.170.944 parámetros. Usa un tokenizador byte-pair encoding (BPE) de 16.000 tokens escrito desde cero, idéntico al de MaxGPT-1, y una ventana de contexto de 512 tokens. La implementación es íntegramente en PyTorch, sin `transformers` ni pesos preentrenados, y el repositorio incluye los módulos `config.py`, `model.py`, `tokenizer.py`, `sample.py` y `run.py` para cargar y ejecutar el modelo.

El entrenamiento se realizó durante aproximadamente 10 horas en una única GPU RTX 5070 de 12 GB sobre una mezcla de TinyStories y OpenAssistant, la misma composición que MaxGPT-1, con el objetivo de que la comparación entre ambos modelos refleje únicamente el cambio de escala. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el autor describe el resultado como gramatical y con forma de receta, capaz de aprender el formato USER/ASSISTANT pero con contenido divagante. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con sintaxis gramatical y estructura de receta.
- Aprendizaje del formato conversacional USER/ASSISTANT, aunque el contenido de las respuestas puede desviarse del tema.
- Generación de texto condicionada por prompt con muestreo configurable (temperatura 0.8, top-k 50, 120 tokens por defecto en el script de ejemplo).
- Inferencia en CUDA, Apple MPS y CPU mediante el script `run.py` incluido.
- Tokenización BPE propia de 16.000 tokens.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Docencia y formación en IA: el repositorio permite recorrer el pipeline completo (tokenizador BPE, definición del transformer, bucle de entrenamiento y muestreo) sin depender de `transformers`, lo que lo hace adecuado para cursos introductorios de modelos de lenguaje.
- Estudio del efecto de escala: al compartir tokenizador y mezcla de datos con MaxGPT-1, MaxGPT-2 sirve para comparar qué capacidades emergen al pasar de 23M a 110M parámetros en un entorno controlado.
- Investigación sobre formato conversacional: permite analizar cómo un modelo pequeño aprende la estructura USER/ASSISTANT y en qué punto el contenido deja de ser coherente con la pregunta.
- Generación de texto creativo breve en inglés: con 512 tokens de contexto puede producir párrafos y recetas sintácticamente correctas para demostraciones o prototipos.
- Banco de pruebas de infraestructura de inferencia: su tamaño reducido (repo de 0,5 GB) permite validar scripts de carga, muestreo y despliegue en CUDA, MPS o CPU antes de escalar a modelos mayores.
- Reproducción de experimentos from-scratch: investigadores pueden reentrenar o modificar la arquitectura partiendo del código publicado para estudiar variantes de tokenizador, contexto o mezcla de datos.
- Educación sobre limitaciones de modelos pequeños: útil como ejemplo práctico de alucinación y divagación en modelos de menos de 1B parámetros para ilustrar por qué la escala importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 113.170.944 parámetros ocupan aproximadamente 0,45 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más. En FP16/BF16 bajaría a unos 0,23 GB.
- GPU recomendadas: el autor entrenó en una RTX 5070 de 12 GB; para inferencia basta con GPUs consumer modestas (GTX 1660, RTX 3060, RTX 4060) o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM, y también en Apple Silicon vía MPS.
- Opciones de despliegue: el repositorio proporciona `run.py` con PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al usar código propio en lugar de `transformers` la integración con esos frameworks requeriría conversión adicional.
- Latencia y throughput: no disponibles en la información proporcionada; el script de ejemplo genera 120 tokens con temperatura 0.8 y top-k 50.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas x anchura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaxGPT-2 | 110M | 12 x 768 | 512 | Apache 2.0 | Hugging Face y GitHub |
| MaxGPT-1 | 23M | 6 x 384 | 256 | No disponible en la información | Hugging Face (familia MaxGPT) |
| MaxGPT-3 | 235M | 16 x 1024 | 1024 | No disponible en la información | Hugging Face (familia MaxGPT) |
| MaxGPT-3.5 | 235M | MaxGPT-3 + fine-tuning de chat | 1024 | No disponible en la información | Hugging Face (familia MaxGPT) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de MaxGPT-2 con alternativas de la misma categoría; la comparación disponible se limita a parámetros, profundidad, anchura y contexto dentro de la propia familia MaxGPT.

## Limitaciones y advertencias

- El propio autor advierte que el contenido "divaga": el modelo puede responder con recetas o temas no solicitados (por ejemplo, ofrecer cereales cuando se piden brownies).
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, esperable en un modelo de 110M parámetros entrenado 10 horas.
- Ventana de contexto muy limitada (512 tokens), insuficiente para conversaciones largas o documentos extensos.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se documentan fases de alineación (RLHF/DPO) ni filtros de seguridad, por lo que puede generar contenido inapropiado.
- Sesgos desconocidos: no se ha publicado información sobre la composición del dataset ni sobre evaluaciones de sesgo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no es adecuado para producción por su baja fiabilidad y su contexto reducido.
- Requiere el código propio del repositorio para cargarse; no es compatible directamente con `transformers`, vLLM o llama.cpp sin trabajo de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxMillion404/MaxGPT-2
- Repositorio GitHub con código y write-up: https://github.com/MaxwellBrohm/MaxGPT
- Sitio del autor: https://maxwellbrohm.com
