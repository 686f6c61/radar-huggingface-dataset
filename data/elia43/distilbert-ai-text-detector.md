# Elia43/distilbert-ai-text-detector

## Resumen

Elia43/distilbert-ai-text-detector es un clasificador binario de texto que distingue entre texto escrito por humanos y texto generado por IA. Se construye mediante fine-tuning de `distilbert-base-uncased` sobre el corpus HC3 (Human ChatGPT Comparison Corpus), con ChatGPT (`gpt-3.5-turbo`) como generador de la clase sintética. Es un modelo pequeño y ligero, con 66.955.010 parámetros y un repositorio de 0,3 GB, pensado como detector de texto artificial y como baseline transformer reproducible para investigación en detección de contenido generado.

Su relevancia actual es doble. Por un lado, ofrece cifras muy altas en su conjunto de test retenido (F1 = 0,9847, exactitud = 0,9891, ROC-AUC = 0,9998), superando de forma estadísticamente significativa a los baselines clásicos (SVM lineal con TF-IDF: F1 = 0,9531). Por otro, la propia model card documenta un sesgo de dominio severo: el error oscila entre el 0 % en texto médico y el 9,54 % en contenido técnico estilo Wikipedia (`wiki_csai`), un patrón que se repite en todas las arquitecturas probadas.

La ficha del autor es explícitamente restrictiva respecto al uso: el modelo se declara apto para investigación, educación y experimentos de evaluación, pero queda fuera de alcance para decisiones disciplinarias académicas, selección de personal, moderación de contenido en producción sin calibración por dominio o cualquier decisión de alto impacto. La licencia es MIT y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT), 6 capas, 12 cabezas de atención, dimensión oculta 768, con cabeza de clasificación de secuencias de 2 etiquetas |
| Parámetros totales | 66.955.010 (~67 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo posicional de DistilBERT); el entrenamiento y la evaluación se realizaron con truncado a 256 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (el entrenamiento usó FP16 en una GPU T4) |
| Idiomas soportados | Inglés (`en`); no evaluado en ningún otro idioma |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`, tamaño de repositorio 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un DistilBERT, es decir, un encoder transformer destilado a partir de BERT con 6 capas en lugar de 12, aproximadamente la mitad de parámetros y sin objetivo de predicción de siguiente frase durante el preentrenamiento. Sobre el checkpoint `distilbert-base-uncased` se añade una cabeza de clasificación de secuencia con dos etiquetas: 0 = texto escrito por humanos, 1 = texto generado por IA. La salida es un logit por clase que se transforma en probabilidad con softmax; la model card recomienda reportar siempre la probabilidad en lugar de la etiqueta binaria dura.

Los datos de entrenamiento proceden de HC3 (Guo et al., 2023), con aproximadamente 75.000 muestras tras filtrado de calidad (se descartan textos de menos de 20 o más de 1.000 palabras, más deduplicación). El corpus cubre cinco dominios: `finance`, `medicine`, `open_qa`, `reddit_eli5` y `wiki_csai`, con ChatGPT (`gpt-3.5-turbo`) como única fuente de texto sintético. El split es estratificado 70/15/15 sobre la clave compuesta `label × domain` con semilla 42. Para el fine-tuning se usó una submuestra estratificada de 15.000 ejemplos del conjunto de entrenamiento, ya que, según el autor, DistilBERT satura rápidamente en esta tarea y usar el conjunto completo no aporta mejora medible. No se documenta RLHF ni DPO: es un ajuste supervisado estándar.

Los hiperparámetros declarados son AdamW, learning rate 2e-5, calentamiento lineal del 10 % de los pasos seguido de decaimiento lineal, weight decay 0,01, batch size 16, longitud máxima de secuencia 256 tokens, 3 épocas, recorte de gradiente con norma máxima 1,0, semilla 42 y precisión mixta FP16. El criterio de mejor checkpoint es el F1 de validación y el entrenamiento completo tardó unos 30 minutos en una única GPU T4 de Google Colab. Como nota de discrepancia, una ficha de terceros (AIKOSH, IndiaAI) describe el mismo modelo como entrenado durante 10 épocas; la model card oficial indica 3.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve la probabilidad de que un texto sea humano (etiqueta 0) o generado por IA (etiqueta 1).
- Detección de texto generado por ChatGPT (`gpt-3.5-turbo`) con alta sensibilidad: recall de 0,9992, es decir, muy pocos falsos negativos sobre el test retenido.
- Manejo de textos de hasta 512 tokens por límite posicional, con truncado a 256 tokens en el flujo de uso recomendado.
- Inferencia muy ligera: 66,9 M de parámetros, ejecutable en CPU y en cualquier GPU de consumo.
- Integración directa con `transformers` (`AutoModelForSequenceClassification` + `AutoTokenizer`).
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de Hugging Face (`text-embeddings-inference`, `endpoints_compatible`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito: es un clasificador puro de secuencia.
- Capacidad multilingüe: no disponible; el modelo no ha sido evaluado con contenido en idiomas distintos del inglés.

## Casos de uso

- Baseline de investigación en detección de texto sintético: sirve como referencia transformer ligera contra la que comparar detectores más recientes entrenados sobre GPT-4, Claude o Gemini; su ventana de 512 tokens y su coste de inferencia mínimo lo hacen cómodo para barridos experimentales.
- Curaduría y limpieza de corpus de entrenamiento: filtrar grandes volúmenes de texto web para reducir la proporción de contenido generado por IA antes de entrenar otros modelos, aprovechando que el modelo cabe en CPU y puede procesar lotes grandes sin GPU.
- Auditoría interna de datasets académicos: medir la prevalencia de texto sintético en corpus de investigación con revisión humana posterior, nunca como base de una decisión disciplinaria, uso que la model card excluye explícitamente.
- Análisis comparativo de dominios y estudio de sesgos: la subdivisión por dominios de HC3 permite reproducir el análisis de equidad del autor y estudiar por qué el texto técnico (`wiki_csai`, F1 = 0,916) es mucho más difícil que el médico (F1 = 1,000).
- Etiquetado asistido con humano en el bucle: preanotar muestras para acelerar la construcción de nuevos datasets de detección, reportando siempre la probabilidad en lugar de la etiqueta binaria para que el anotador aplique su propio umbral.
- Filtrado previo en pipelines de moderación con calibración por dominio y revisión humana obligatoria: puede actuar como primera etapa de bajo coste, pero la model card declara fuera de alcance la moderación en producción sin recalibración específica del dominio de despliegue.
- Docencia y divulgación sobre límites de los detectores de IA: el modelo es un caso de estudio útil para mostrar cómo métricas agregadas altas (F1 = 0,9847) pueden ocultar una disparidad de error superior a 10× entre dominios.
- Prototipado rápido de aplicaciones de verificación textual: al ocupar 0,3 GB y no requerir GPU, permite montar demos y pruebas de concepto en portátiles o en contenedores pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card y en el README, sobre el conjunto de test retenido de 11.238 muestras estratificadas por 5 dominios. Ninguna de las métricas está verificada de forma independiente (`verified: false`).

| Métrica | Valor |
|---|---|
| F1 | 0,9847 |
| Exactitud (accuracy) | 0,9891 |
| ROC-AUC | 0,9998 |
| Precisión | 0,9706 |
| Recall | 0,9992 |

Desglose de F1 por dominio:

| Dominio | F1 |
|---|---|
| medicine | 1,000 |
| finance | 0,990 |
| open_qa | 0,988 |
| reddit_eli5 | 0,985 |
| wiki_csai (escritura técnica) | 0,916 |

Comparación con los baselines del mismo estudio:

| Modelo | F1 |
|---|---|
| Naive Bayes multinomial | 0,8731 |
| Bi-LSTM con GloVe-100d congelado | 0,9338 |
| Regresión logística con TF-IDF | 0,9523 |
| SVM lineal con TF-IDF | 0,9531 |
| DistilBERT (este modelo) | 0,9847 |

El autor reporta un test de McNemar frente al SVM lineal con χ² = 144,0 y p ≈ 3,55 × 10⁻³³, lo que indica una diferencia estadísticamente significativa. La tasa de error global del proyecto es del 1,09 %.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 268 MB en FP32, unos 134 MB en FP16/BF16 y unos 67 MB en INT8 (cálculo derivado de los 66.955.010 parámetros). Con activaciones y overhead del runtime, el consumo real se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una T4 de Colab y no necesita A100 ni H100. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada son suficientes.
- Cabe holgadamente en GPU de consumo, y también se puede ejecutar íntegramente en CPU con latencias aceptables para lotes pequeños. El límite práctico lo marca el throughput necesario, no la memoria.
- Opciones de despliegue: `transformers` en PyTorch, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`). No se documenta soporte de GGUF, llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible. El único dato de rendimiento publicado es el tiempo de entrenamiento (aproximadamente 30 minutos para 3 épocas sobre 15.000 muestras en una T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en HC3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elia43/distilbert-ai-text-detector | 66,9 M | 512 tokens (entrenado a 256) | 0,9847 | MIT | Pesos en safetensors en Hugging Face |
| SVM lineal con TF-IDF (baseline del mismo estudio) | No aplica (modelo clásico) | No aplica | 0,9531 | No especificada | Código de reproducción en el repositorio de GitHub |
| Regresión logística con TF-IDF (baseline del mismo estudio) | No aplica (modelo clásico) | No aplica | 0,9523 | No especificada | Código de reproducción en el repositorio de GitHub |
| Bi-LSTM con GloVe-100d congelado (baseline del mismo estudio) | No disponible | No aplica | 0,9338 | No especificada | Código de reproducción en el repositorio de GitHub |
| Naive Bayes multinomial (baseline del mismo estudio) | No aplica (modelo clásico) | No aplica | 0,8731 | No especificada | Código de reproducción en el repositorio de GitHub |

No hay en la información proporcionada resultados comparables de otros detectores transformer publicados, como el detector de referencia del propio dataset HC3 basado en RoBERTa o el detector de salidas de GPT-2 de OpenAI. Por tanto, la comparación con esos modelos queda como no disponible.

## Limitaciones y advertencias

- Sesgo de dominio documentado y severo: la tasa de error va del 0 % en texto médico al 9,54 % en contenido técnico estilo Wikipedia (`wiki_csai`), más de 10 veces la tasa de error global del proyecto (1,09 %). El autor señala que el patrón se repite en todas las arquitecturas probadas (clásicas, recurrentes y transformer), por lo que no se resuelve cambiando de modelo. Los redactores técnicos quedan expuestos a un riesgo desproporcionado de falsos positivos.
- Sesgo de longitud: la model card documenta que los textos cortos presentan un comportamiento diferencial, pero el apartado está truncado en la información disponible; solo se indica que afecta a textos de menos de 50 palabras. Cualquier despliegue debe calibrar este punto por su cuenta.
- Generalización limitada al generador: el modelo se entrenó únicamente con texto de ChatGPT (`gpt-3.5-turbo`). No hay evidencia de que detecte texto de GPT-4, Claude, Gemini o modelos abiertos actuales, y el propio autor lo plantea como punto de partida para reentrenar.
- Solo inglés: no ha sido evaluado con contenido en otros idiomas y la model card declara fuera de alcance el texto no inglés.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe el análogo: falsos positivos y falsos negativos con apariencia de certeza. La recomendación del autor es reportar la probabilidad calibrada, no la etiqueta binaria. Con recall de 0,9992 y precisión de 0,9706, el modelo está fuertemente inclinado hacia predecir "IA", lo que en dominios difíciles implica sobre-detección.
- Métricas no verificadas: los valores del `model-index` están marcados como `verified: false`; no se han reproducido de forma independiente en la información disponible.
- Usos explícitamente fuera de alcance según la model card: decisiones disciplinarias académicas (plagio, expulsión, penalización de notas), decisiones de contratación (filtrado de ensayos o cartas de presentación), moderación de contenido en producción sin calibración específica del dominio y revisión humana, y cualquier decisión de alto impacto sin una auditoría de equidad sobre la población de despliegue.
- Licencia MIT: permite uso comercial y modificación sin restricciones de licencia, pero la model card añade restricciones de uso ético y práctico que no son jurídicamente vinculantes. La responsabilidad del uso recae en el desplegador.
- Discrepancia documental: la model card indica 3 épocas de entrenamiento, mientras que una ficha de terceros (AIKOSH, IndiaAI) indica 10 épocas. Conviene reproducir el entrenamiento antes de dar por buenas las cifras.
- Sin soporte de cuantización publicado ni formatos GGUF/ONNX: quien quiera desplegarlo en runtimes de inferencia alternativos tendrá que convertir los pesos por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elia43/distilbert-ai-text-detector
- README de la model card: https://huggingface.co/Elia43/distilbert-ai-text-detector/blob/main/README.md
- Repositorio de código y reproducción: https://github.com/Elia43/ai-text-detection
- README del repositorio: https://github.com/Elia43/ai-text-detection/blob/main/README.md
- Informe técnico completo (PDF): https://github.com/Elia43/ai-text-detection/blob/main/report.pdf
- Diapositivas de la presentación (PDF): https://github.com/Elia43/ai-text-detection/blob/main/presentation.pdf
- Dataset HC3 (Human ChatGPT Comparison Corpus): https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de HC3, Guo et al., 2023: https://arxiv.org/abs/2304.02819
- Ficha de terceros en AIKOSH (IndiaAI): https://aikosh.indiaai.gov.in/home/models/details/distillbert_ai_text_detector.html
