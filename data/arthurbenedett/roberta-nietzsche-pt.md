# ArthurBenedett/roberta-nietzsche-pt

## Resumen

roberta-nietzsche-pt es un modelo de lenguaje enmascarado (masked language modeling) de tipo RoBERTa entrenado desde cero en portugués por ArthurBenedett. Se trata de un proyecto educativo cuyo objetivo declarado es comprender el ciclo completo de entrenamiento de un modelo de lenguaje y, sobre todo, medir si el modelo aprende o simplemente memoriza. El modelo tiene 4.546.448 parámetros y fue entrenado con un único libro: *Crepúsculo dos Ídolos* de Friedrich Nietzsche, en su traducción al portugués.

La arquitectura es un `RobertaForMaskedLM` con 4 capas, 4 cabezas de atención, dimensión oculta de 256 y FFN de 1024. Incorpora un tokenizador Byte-Level BPE propio con vocabulario de 5.008 tokens, también entrenado sobre el mismo libro. El contexto de entrenamiento se limita a bloques de 128 tokens, derivados de la concatenación del texto y su corte en 282 bloques (253 de entrenamiento y 29 de validación).

El modelo es relevante como material didáctico reproducible: documenta el proceso de tokenización, entrenamiento, validación, early stopping y comparación con baselines aleatorios y de frecuencia. El autor advierte explícitamente que no sirve para uso real, dado el volumen de datos (unas 26.000 palabras) y el sobreajuste observado a partir del paso 500. Está publicado con licencia MIT y es compatible con la librería `transformers` mediante el pipeline `fill-mask`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (`RobertaForMaskedLM`), transformer encoder |
| Parámetros totales | 4.546.448 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (bloques de entrenamiento) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa con 4 capas de encoder, 4 cabezas de atención, dimensión oculta de 256 y capa feed-forward de 1024. El tokenizador es un Byte-Level BPE entrenado específicamente sobre el libro, con un vocabulario de 5.008 tokens. El objetivo de entrenamiento es masked language modeling con un 15% de tokens enmascarados.

Los datos consisten en el texto concatenado del libro *Crepúsculo dos Ídolos* de Nietzsche en portugués, aproximadamente 26.000 palabras (35.570 tokens), cortado en 282 bloques de 128 tokens. Se reservaron los últimos bloques del libro como validación (29 bloques) y el resto para entrenamiento (253 bloques). El entrenamiento se realizó con batch de 16, learning rate de 5e-4, 100 pasos de warmup y hasta 300 épocas con early stopping (paciencia de 5 evaluaciones). Se ejecutó en CPU de un PC común, sin GPU, en unos 8 minutos. La validación dejó de mejorar en el paso 500 (época aproximada 31); a partir de ahí el loss de entrenamiento siguió bajando mientras el de validación subió, indicando memorización. El checkpoint publicado corresponde al paso 500. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Relleno de máscaras (`fill-mask`): predice un token enmascarado en una frase en portugués, con soporte para top-k de candidatos.
- Modelado de lenguaje enmascarado bidireccional: representa contexto a izquierda y derecha del token enmascarado.
- Tokenización Byte-Level BPE propia en portugués, con vocabulario de 5.008 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se documenta soporte de otros idiomas.
- Una predicción por máscara y token: palabras que el tokenizador divide en varios fragmentos no se predicen completas.

## Casos de uso

- Docencia y aprendizaje de entrenamiento de LLM: el modelo sirve como ejemplo reproducible de un pipeline completo (tokenizador, dataset, entrenamiento, validación, early stopping) ejecutable en CPU en minutos, adecuado para cursos y talleres.
- Demostración de sobreajuste y early stopping: el historial de validación permite ilustrar empíricamente cómo un modelo pequeño memoriza un corpus reducido y cómo el early stopping mitiga el problema.
- Comparación de baselines: el modelo incluye comparaciones con chute por frecuencia y aleatorio, útil para enseñar a interpretar métricas como loss, perplejidad y acierto top-1/top-5.
- Experimentos de tokenización en portugués: el tokenizador Byte-Level BPE de 5.008 tokens permite estudiar el comportamiento de la segmentación en un corpus literario del siglo XIX.
- Pruebas de integración con `transformers`: sirve para validar pipelines `fill-mask` en entornos de desarrollo sin requisitos de hardware, ya que el modelo ocupa pocos megabytes.
- Reproducción de experimentos educativos: el repositorio enlazado permite replicar el entrenamiento y modificar hiperparámetros (capas, cabezas, vocabulario) para estudiar su efecto.
- Ejemplo de modelo de dominio estrecho: útil para discutir por qué un modelo entrenado con un solo libro no generaliza y cómo diseñar evaluaciones honestas.

## Benchmarks y rendimiento

Evaluación sobre 584 huecos sorteados con semilla fija en el 10% final del libro (no visto en entrenamiento):

| Modelo | Loss | Perplejidad | Acierto top-1 | Acierto top-5 |
|---|---|---|---|---|
| roberta-nietzsche-pt | 6,58 | 722 | 10,6% | 19,2% |
| Chute por frecuencia de palabras | 6,77 | 870 | 7,0% | 15,2% |
| Chute aleatorio | 8,52 | 5.008 | 0,0% | 0,1% |

El autor advierte que el mismo conjunto de validación se usó para seleccionar el checkpoint y para medir, por lo que los resultados pueden ser ligeramente optimistas. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (4,5 M de parámetros); en la práctica cabe en CPU sin GPU.
- GPU recomendadas: no requiere GPU; funciona en CPU de un PC común.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con pipeline `fill-mask`; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo en CPU tardó unos 8 minutos, lo que da una idea del reducido coste computacional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roberta-nietzsche-pt | 4,5 M | 128 tokens | portugués | MIT | Hugging Face |
| RoBERTa base (referencia) | 125 M | 512 tokens | inglés principalmente | MIT | Hugging Face |
| BERT base (referencia) | 110 M | 512 tokens | multilingüe en variantes | Apache 2.0 | Hugging Face |

No se dispone de comparativas directas con otros modelos educativos de tamaño similar en la información proporcionada. Las referencias a RoBERTa y BERT provienen de la documentación general consultada y no de evaluaciones conjuntas con este modelo.

## Limitaciones y advertencias

- Corpus muy reducido: unas 26.000 palabras (35.570 tokens); lo aprendido fuera del entrenamiento se limita principalmente a palabras frecuentes, con predicciones dominadas por tokens como "," y "de".
- Sobreajuste documentado: la validación dejó de mejorar en el paso 500; a partir de ahí el modelo memoriza el libro.
- Sin conjunto de test separado: el mismo conjunto de validación seleccionó el checkpoint y midió el resultado, por lo que las métricas pueden estar ligeramente optimistas.
- Tokenizador entrenado con el libro completo, incluido el fragmento de validación (el modelo no).
- Predicción de un solo token por máscara: no reconstruye palabras segmentadas en varios tokens.
- Sesgos y estilo: refleja el vocabulario y el estilo de un único libro del siglo XIX, con los sesgos ideológicos y de época del texto de Nietzsche.
- Riesgo de alucinación y predicciones sin sentido fuera del dominio del libro.
- Licencia MIT: permite uso comercial, pero el autor indica explícitamente que el modelo no sirve para uso real.
- No apto para producción: sin soporte de tool calling, agentes, contexto largo ni otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArthurBenedett/roberta-nietzsche-pt
- Repositorio del proyecto (código, notebook y explicación): https://github.com/ArthurBenedett/minha-primeira-llm
- Repositorio original de la clase: https://github.com/ferrarimarlon/NietzscheLLM
- Vídeo de la clase "LLM na Prática" del Prof. Marlon Ferrari: https://www.youtube.com/watch?v=LphBQB1amrw
- Artículo sobre RoBERTa: https://towardsdatascience.com/roberta-1ef07226c8d8/
