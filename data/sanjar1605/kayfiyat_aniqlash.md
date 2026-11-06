# Sanjar1605/kayfiyat_aniqlash

## Resumen

`kayfiyat_aniqlash` es un clasificador de sentimiento en tres clases (positivo, negativo, neutro) para uzbeko, desarrollado por el usuario Sanjar1605 y publicado en HuggingFace. Se trata de un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe de 278 millones de parámetros, sobre un conjunto de frases en uzbeko centrado en la temática de la vida universitaria.

El modelo resuelve una tarea concreta y de alcance limitado: asignar una etiqueta de polaridad a una frase corta en uzbeko. Su relevancia es principalmente didáctica, ya que el propio autor lo declara como un experimento de fine-tuning con fines de aprendizaje y advierte de que el dataset es muy reducido.

No debe confundirse con un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Es un encoder de clasificación con una cabeza de tres etiquetas, pensado para inferencia de sentimiento sobre texto uzbeko breve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de 3 clases |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un transformer encoder basado en RoBERTa con vocabulario SentencePiece multilingüe, y añade una cabeza de clasificación para tres etiquetas. El fine-tuning se realizó sobre 150 frases en uzbeko escritas manualmente, con 50 ejemplos por clase (positivo, negativo, neutro). No se documenta el número de épocas, la tasa de aprendizaje, el optimizador ni si se aplicó regularización o validación cruzada.

La evaluación reportada por el autor se hizo sobre 30 frases, con una precisión de 0,90. No se especifica si ese conjunto de evaluación es disjunto del de entrenamiento, ni se aportan matrices de confusión, F1 por clase ni métricas adicionales. No hay evidencia de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutro) sobre frases cortas en uzbeko.
- Inferencia de polaridad en textos de temática universitaria, que es el dominio de los datos de entrenamiento.
- No genera texto: es un modelo encoder de clasificación, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al uzbeko en la práctica, aunque el backbone base sea multilingüe.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de opiniones en encuestas universitarias: el modelo puede etiquetar respuestas abiertas de estudiantes en uzbeko como positivas, negativas o neutras para agregar resultados por facultad o asignatura.
- Monitorización de comentarios en foros o redes dirigidas a población uzbeka: permite un filtrado rápido de polaridad antes de un análisis manual más profundo.
- Prototipado de pipelines de NLP en uzbeko: sirve como línea base para comparar con modelos posteriores o con datasets ampliados.
- Docencia y experimentación: es un ejemplo reproducible de fine-tuning de XLM-RoBERTa sobre un dataset pequeño, útil en cursos de NLP.
- Preetiquetado asistido: puede generar etiquetas iniciales que un anotador humano revise, reduciendo el coste de construir un corpus mayor.
- Clasificación de feedback en aplicaciones de atención al estudiante: con la debida validación, podría integrarse en un flujo de triaje de quejas y felicitaciones.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision (accuracy) | 0,90 | 30 frases en uzbeko (según el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la precisión sobre un conjunto de evaluación de 30 frases, sin desglose por clase ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En FP16: alrededor de 0,6 GB de pesos.
- GPU recomendadas: no requiere GPU dedicada; una NVIDIA T4, RTX 3060 o incluso CPU es suficiente para inferencia por lotes pequeños.
- Cabe en cualquier GPU de consumo actual y en la mayoría de entornos integrados con suficiente memoria.
- Opciones de despliegue: `transformers` con PyTorch, `ONNX Runtime`, `TorchScript` o `FastAPI` como servicio ligero. `vLLM` y `llama.cpp` no aplican de forma directa a un encoder de clasificación.
- Latencia y throughput: no disponibles; para este tamaño y arquitectura se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sanjar1605/kayfiyat_aniqlash` | 278 M | no disponible | Clasificación de sentimiento en uzbeko | MIT | HuggingFace |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 tokens | Modelo base multilingüe (no clasificador) | MIT | HuggingFace |
| `xlm-roberta-base` fine-tuneado en sentimiento multilingüe | ~278 M | 512 tokens | Clasificación de sentimiento | variable | HuggingFace |

No se dispone de datos de rendimiento comparables de otros clasificadores específicos de uzbeko en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente pequeño (150 frases), lo que limita la generalización y favorece el sobreajuste.
- El propio autor advierte de errores en texto en cirílico, ironía y negaciones complejas.
- La frontera de la clase neutra es ambigua según la model card.
- La evaluación se realizó sobre solo 30 frases, sin garantías de que sean disjuntas del entrenamiento.
- Dominio restringido a la vida universitaria; el rendimiento fuera de ese contexto es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- Licencia MIT: permite uso comercial, pero el autor declara el modelo solo para fines educativos, lo que conviene tener en cuenta como advertencia ética.
- No apto para producción sin una validación previa sobre un corpus representativo y considerablemente mayor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Sanjar1605/kayfiyat_aniqlash)
- [Modelo base XLM-RoBERTa](https://huggingface.co/FacebookAI/xlm-roberta-base)
