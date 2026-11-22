# FishySean/crossfire-pairer

## Resumen

crossfire-pairer es un modelo de clasificación de texto de tipo NLI (inferencia en lenguaje natural) desarrollado por FishySean como componente del motor de verificación de hechos Crossfire. Su función es concreta: dadas dos afirmaciones extraídas de fuentes distintas sobre una misma pregunta, clasificarlas en una de cuatro categorías (agree, contradict, same_question_different_scope o unrelated). No es un modelo generativo ni un asistente conversacional, sino un clasificador de pares diseñado para integrarse en un pipeline de verificación.

El modelo parte del checkpoint MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 y se ha afinado sobre un conjunto propio de 335 pares de afirmaciones procedentes de 19 preguntas reales de verificación web. Con 278.812.420 parámetros y un repositorio de 0,6 GB, es un modelo compacto pensado para despliegue en CPU o GPU modesta dentro de un sistema mayor.

Su relevancia es acotada y experimental: la model card documenta de forma explícita limitaciones severas (sobrepredicción de unrelated, recall de scope de 0,25 y una mejora marginal frente al modelo base en la clase contradict). Está pensado exclusivamente para el ecosistema Crossfire y no como sustituto genérico de NLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3 base, adaptado como clasificador NLI de pares) |
| Parametros totales | 278.812.420 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7, un encoder DeBERTa-v3 base entrenado originalmente para NLI multilingüe. Sobre esa base se ha añadido una cabeza de clasificación de cuatro clases que recibe un par de afirmaciones en formato premisa/hipótesis, generado por una función de codificación específica (`encode_pair`) que incorpora la pregunta de contexto y las fechas de publicación de cada afirmación (con valor unknown cuando no se dispone de fecha).

Los datos de entrenamiento consisten en 335 pares de afirmaciones provenientes de 19 preguntas reales de verificación web. La partición train/validación/test se realiza por pregunta, de modo que los pares de una misma pregunta no se reparten entre conjuntos, lo que evita fuga de información. Se aplica aumento de datos invirtiendo los roles A/B en todos los pares del conjunto de entrenamiento (salvo cuando ambas afirmaciones son idénticas textualmente); validación y test no se invierten. Las etiquetas fueron generadas por Claude Sonnet, según advierte el autor, y reflejan el criterio de ese modelo, no una verdad objetiva. La selección del checkpoint final se hizo exclusivamente por pérdida ponderada en validación (seed 44), reservando el test solo para reportar resultados.

## Capacidades

- Clasificación de pares de afirmaciones en cuatro categorías: agree, contradict, same_question_different_scope y unrelated.
- Integración con el pipeline Crossfire mediante la variable de entorno `PAIRER=nli`, que activa el componente `NliClaimPairer` con la codificación correcta.
- Manejo de metadatos de contexto: la codificación de entrada incluye la pregunta de referencia y las fechas de publicación de cada afirmación, con soporte para fechas desconocidas.
- Multilingüe limitado a inglés y chino según los metadatos del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking. Es un clasificador puro, no un modelo generativo.

## Casos de uso

- Verificación de hechos dentro del motor Crossfire: el modelo actúa como paso de comparación por pares entre afirmaciones extraídas de distintas fuentes sobre una misma pregunta, alimentando la decisión posterior del motor sobre si hay acuerdo, contradicción o alcances distintos.
- Detección de contradicciones entre fuentes: en un pipeline de agregación de noticias o documentación, el modelo puede señalar pares de afirmaciones mutuamente excluyentes (clase contradict) para revisión humana, aunque su rendimiento en esta clase es prácticamente idéntico al del modelo base.
- Filtrado de duplicados semánticos con matiz: la clase same_question_different_scope permite distinguir afirmaciones que no se contradicen pero describen realidades distintas por rango temporal o alcance, útil en sistemas de resumen multi-fuente.
- Señalización de pares no relacionados: pese a la sobrepredicción documentada de unrelated, puede usarse como filtro preliminar para descartar comparaciones sin sentido antes de un análisis más costoso, siempre con revisión posterior.
- Investigación sobre NLI aplicado a verificación de hechos: el repositorio incluye código de entrenamiento, datos y scripts de evaluación, lo que lo hace útil como base reproducible para experimentos académicos sobre clasificación de pares en dominios de verificación.
- Evaluación de la calidad de etiquetado automático: al estar las etiquetas generadas por Claude Sonnet, sirve como caso de estudio de las limitaciones de usar un LLM como anotador en tareas de NLI con clases desbalanceadas.

## Benchmarks y rendimiento

Resultados reportados por el autor para el modelo seleccionado (seed 44) sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Exactitud | 0,685 |
| F1 macro | 0,614 |
| F1 macro (tres seeds) | 0,500 / 0,612 / 0,614 (media 0,576, desviación 0,114) |
| Línea base "siempre agree" | F1 macro 0,246 |
| Modelo base en formato nativo | F1 macro 0,405 |

Desglose por clase (precisión / recall / F1 / soporte):

| Clase | P | R | F1 | Soporte |
|---|---|---|---|---|
| agree | 0,833 | 0,769 | 0,800 | 52 |
| contradict | 0,704 | 0,655 | 0,679 | 29 |
| same_question_different_scope | 0,667 | 0,250 | 0,364 | 8 |
| unrelated | no disponible | no disponible | no disponible | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB de pesos más overhead de activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En CPU: viable para inferencia por lotes pequeños; es un encoder de 278 M de parámetros, no un modelo generativo.
- GPU recomendadas: no se especifican; cualquier GPU consumer (RTX 3060, RTX 4090, etc.) o incluso hardware integrado es suficiente por el tamaño del modelo.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference según los tags del repositorio, y endpoints compatibles. No se documentan variantes GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crossfire-pairer | 278,8 M | no disponible | 0,614 | MIT | Hugging Face (repo propio) |
| MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 (base) | ~278 M | no disponible | 0,405 (formato nativo) | MIT | Hugging Face |
| Línea base "siempre agree" | no aplica | no aplica | 0,246 | no aplica | no aplica |

No se dispone de datos de benchmarks de otros modelos NLI comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a la línea base trivial reportados por el autor.

## Limitaciones y advertencias

- Sobrepredecición de unrelated: el conjunto de test no contiene ejemplos de esta clase, pero el modelo la predijo 11 veces, principalmente sobre pares que eran agree o scope.
- Recall bajo en same_question_different_scope: solo 0,25 (2 de 8), con 3 casos clasificados erróneamente como unrelated.
- Mejora marginal en contradict: F1 de 0,679 frente a 0,689 del modelo base en formato nativo, es decir, el fine-tuning no aporta mejora en esta clase.
- Volumen de datos muy reducido (335 pares) y desequilibrio de clases severo, con alta varianza entre seeds (F1 macro entre 0,500 y 0,614).
- Etiquetas generadas por Claude Sonnet: reflejan el criterio de ese modelo, no una verdad objetiva; el autor recomienda evaluar su idoneidad y las condiciones de uso antes de emplearlas.
- La codificación de entrada debe realizarse con la misma función `encode_pair` usada en entrenamiento; de lo contrario el rendimiento se degrada sin aviso.
- No apta para escenarios que requieran certeza legal o médica, ni para razonamiento multi-salto sobre documentos largos fuera de la distribución de entrenamiento.
- No debe usarse como sustituto genérico de NLI ni como alternativa a Claude en otros productos; está diseñada exclusivamente para la clasificación de cuatro clases de Crossfire.
- Licencia MIT, lo que permite uso comercial, pero el autor advierte sobre la evaluación previa de las etiquetas generadas por un modelo de terceros.
- Idiomas limitados a inglés y chino según los metadatos; no se documenta comportamiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FishySean/crossfire-pairer
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Repositorio de código: https://github.com/FishySean/Crossfire
- Código de entrenamiento: https://github.com/FishySean/Crossfire/tree/main/training
- Datos de entrenamiento: https://github.com/FishySean/Crossfire/blob/main/data/pairs.jsonl
