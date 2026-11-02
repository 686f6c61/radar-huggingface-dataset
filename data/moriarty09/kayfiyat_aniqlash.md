# moriarty09/kayfiyat_aniqlash

## Resumen

`moriarty09/kayfiyat_aniqlash` es un clasificador de sentimiento en tres clases (positivo, negativo, neutro) para uzbeko, obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-base`. Lo publica el usuario moriarty09 en HuggingFace y está pensado como material didáctico: el propio autor lo etiqueta como "solo para fines de aprendizaje" y advierte de que el conjunto de datos es muy reducido.

El modelo resuelve una tarea concreta: clasificar oraciones en uzbeko sobre la vida universitaria. Parte de la arquitectura XLM-RoBERTa base (transformer encoder multilingüe con 278.045.955 parámetros) y se ha ajustado sobre 150 frases escritas a mano (50 por clase), con una evaluación sobre 30 frases que reporta una exactitud de 0,90.

Su relevancia es limitada fuera del ámbito educativo: no hay pipeline declarado, no tiene descargas ni interacciones, y el autor reconoce fallos en escritura cirílica, ironía y negaciones complejas. Aun así, sirve como ejemplo de adaptación de un encoder multilingüe a un idioma de bajos recursos como el uzbeko.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base XLM-RoBERTa es 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingüe basado en RoBERTa con vocabulario SentencePiece. Sobre esa base se ha añadido una cabeza de clasificación de tres clases (positivo, negativo, neutro). El repositorio ocupa 1,1 GB y los pesos se distribuyen en formato safetensors.

El entrenamiento se realizó con 150 frases en uzbeko escritas a mano (50 positivas, 50 negativas y 50 neutras) sobre la temática de la vida universitaria. La evaluación se hizo sobre 30 frases y reportó una exactitud de 0,90. No se especifican hiperparámetros, número de épocas, composición exacta del dataset, ni si hubo aumento de datos o validación cruzada. Tampoco se documenta ningún proceso de RLHF o DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutro) para texto en uzbeko.
- Especialización temática en oraciones sobre la vida universitaria.
- Funciona como encoder de características reutilizable para otras tareas en uzbeko (extracción de embeddings).
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento.
- Capacidad multilingüe heredada del modelo base, pero no validada ni documentada por el autor.
- No hay pipeline declarado en HuggingFace, por lo que requiere cargar el modelo manualmente con `transformers` y una cabeza de clasificación.

## Casos de uso

- Análisis de opiniones en encuestas universitarias: clasificar respuestas abiertas de estudiantes en uzbeko para detectar satisfacción o quejas sobre asignaturas, profesorado o servicios del campus.
- Monitorización de comentarios en foros o canales de la comunidad educativa: etiquetar automáticamente mensajes como positivos, negativos o neutros para priorizar la revisión humana.
- Prototipado de sistemas de alerta temprana: detectar sentimiento negativo recurrente en feedback estudiantil y escalarlo a tutores o servicios de bienestar.
- Etiquetado asistido de datasets: usar el modelo como preetiquetador para acelerar la anotación manual de corpus en uzbeko, revisando después las predicciones.
- Extracción de embeddings para clustering temático: aprovechar las representaciones del encoder para agrupar opiniones por similitud semántica en herramientas de análisis cualitativo.
- Docencia y experimentación: servir como caso práctico de fine-tuning de XLM-RoBERTa en un idioma de bajos recursos, útil en cursos de PLN o talleres de HuggingFace.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Exactitud (accuracy) | 0,90 | 30 frases de evaluación en uzbeko |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la exactitud de 0,90 sobre un conjunto de evaluación de 30 frases, un tamaño demasiado pequeño para extraer conclusiones robustas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para los pesos (278 M de parámetros × 4 bytes), más memoria para activaciones y tokenización.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción: T4, L4 o A10G son suficientes; A100/H100 no aportan ventaja significativa para este tamaño.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` con ONNX Runtime, TorchScript o exportación a un servidor de inferencia ligero. No se ha publicado versión GGUF ni integración con Ollama o llama.cpp.
- Latencia y throughput: no disponibles. Para un encoder de 278 M de parámetros se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moriarty09/kayfiyat_aniqlash | 278 M | no disponible | Clasificación de sentimiento (uzbeko) | MIT | HuggingFace, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe | MIT | HuggingFace, ampliamente usado |
| Davlan/afro-xlmr-base | 278 M | 512 tokens | Modelo base para lenguas africanas | MIT | HuggingFace |
| bert-base-multilingual-cased | 178 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | HuggingFace |

La comparación directa con clasificadores de sentimiento en uzbeko es difícil porque no se han identificado alternativas públicas específicas en la información disponible. Frente al modelo base XLM-RoBERTa, este fine-tuning añade la cabeza de clasificación y la especialización temática, pero pierde generalidad y no documenta su comportamiento fuera del dominio universitario.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (150 frases) y de evaluación aún menor (30 frases): la exactitud de 0,90 tiene un intervalo de confianza muy amplio y no es extrapolable.
- El autor advierte de fallos en texto en escritura cirílica, ironía y negaciones complejas.
- La frontera de la clase neutra es ambigua según la propia model card.
- El modelo está entrenado exclusivamente sobre la temática de la vida universitaria; su rendimiento en otros dominios es desconocido.
- No se documentan sesgos específicos, pero al derivar de XLM-RoBERTa hereda los sesgos del corpus multilingüe original.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza.
- Licencia MIT: permite uso comercial, pero el autor restringe explícitamente el modelo a fines de aprendizaje, lo que conviene tener en cuenta antes de desplegarlo en producción.
- No hay pipeline declarado ni métricas por clase (precisión, recall, F1), lo que dificulta evaluar el equilibrio entre clases.
- No se especifica la longitud de contexto efectiva ni la tokenización aplicada en el fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moriarty09/kayfiyat_aniqlash
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
