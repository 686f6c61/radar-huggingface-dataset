# moz-v/word-wave

## Resumen

WordWave es un modelo de predicción de siguiente palabra (next-token prediction a nivel de palabra) desarrollado por el usuario moz-v y publicado en Hugging Face. Se trata de un modelo educativo y experimental construido sobre una arquitectura de LSTM bidireccional con atención aditiva, entrenado sobre cualquier corpus de texto plano mediante un pipeline de datos en streaming. El repositorio ocupa 0,9 GB y no cuenta con descargas ni interacciones en el momento de la consulta.

El modelo resuelve el problema de la generación de texto autoregresiva a nivel de palabra con un enfoque clásico de deep learning (pre-transformer), incorporando tokenización BPE, atención de Bahdanau y múltiples estrategias de decodificación (beam search, nucleus sampling y temperature sampling). Incluye un dashboard en Streamlit para generación interactiva y evaluación con métricas como perplejidad, precisión top-5, BLEU, ROUGE-L y Distinct-N.

Su relevancia es principalmente didáctica: sirve como referencia para entender los fundamentos de la predicción de lenguaje, la atención y las estrategias de decodificación, sin las complejidades de los modelos transformer modernos. No está pensado para producción ni para tareas de razonamiento complejo, y no se dispone de información sobre parámetros totales, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM + atención aditiva (Bahdanau) + cabeza clasificadora |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento con FP16 opcional) |
| Idiomas soportados | no disponible |
| Licencia | MIT (según badge de la model card; el campo de licencia de Hugging Face figura como no disponible) |
| Formato de pesos | no disponible (checkpoints de PyTorch, presumiblemente `.pt`/`.pth`) |

## Arquitectura y entrenamiento

WordWave sigue un pipeline de Embedding → BiLSTM → Atención aditiva → Clasificador. La capa de embedding mapea cada token a un vector denso, con tokens de padding (`<pad>`, índice 0) que producen gradientes nulos. La LSTM bidireccional procesa la secuencia en ambas direcciones y concatena los estados ocultos forward y backward en cada paso, generando una representación de dimensión `hidden_dim × 2`. La atención aditiva calcula una puntuación de relevancia escalar por paso temporal, enmascara las posiciones de padding con −∞ antes del softmax y produce un vector de contexto ponderado que alimenta la cabeza clasificadora sobre el vocabulario completo.

El entrenamiento utiliza `CrossEntropyLoss`, optimizador Adam, scheduler `ReduceLROnPlateau` (factor 0,5), clipping de norma global de gradientes, dropout, early stopping y precisión mixta FP16 opcional con `GradScaler`. La tokenización es BPE construida desde cero para eliminar tokens fuera de vocabulario. El pipeline de datos usa `IterableDataset` con splits deterministas train/validación/test basados en hash BLAKE2b de `file_path:line_number`, evitando fugas de datos entre splits. La reproducibilidad se garantiza con semilla configurable aplicada a `random`, `numpy`, `torch` y RNG de CUDA. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto autoregresiva a nivel de palabra con tres estrategias de decodificación: beam search, nucleus (top-p) sampling y temperature sampling.
- Predicción de siguiente token con cálculo de precisión top-5 y perplejidad sobre el split de validación.
- Evaluación de calidad de generación mediante BLEU, ROUGE-L y Distinct-N.
- Tokenización BPE personalizada que elimina tokens fuera de vocabulario.
- Detección dinámica de texto plano (heurística de bytes NULL estilo Git y validación UTF-8 estricta) para cargar corpus de cualquier extensión e ignorar binarios.
- Entrenamiento en streaming sobre corpus de tamaño arbitrario con splits deterministas a nivel de línea.
- Dashboard interactivo en Streamlit para generación y evaluación en tiempo real.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Docencia y aprendizaje de fundamentos de NLP: el modelo permite experimentar con atención, LSTM y decodificación sin la complejidad de un transformer, ideal para cursos y talleres.
- Generación de texto controlada sobre corpus propios: al entrenar sobre cualquier texto plano con `IterableDataset`, sirve para explorar la generación de texto en dominios específicos (por ejemplo, titulares o frases cortas) con corpus pequeños.
- Evaluación comparativa de estrategias de decodificación: el dashboard permite alternar beam search, top-p y temperature para estudiar su efecto en fluidez y diversidad mediante BLEU, ROUGE-L y Distinct-N.
- Prototipado rápido de pipelines de tokenización BPE: el tokenizador construido desde cero puede reutilizarse como referencia para entender la construcción de vocabularios subword.
- Investigación sobre splits deterministas sin fuga de datos: el esquema de hash BLAKE2b a nivel de línea es un patrón reutilizable en experimentos con corpus de gran tamaño.
- Demostraciones interactivas en Streamlit: útil para presentar conceptos de modelado de lenguaje en entornos educativos o charlas técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe las métricas de evaluación internas (precisión top-5, perplejidad, BLEU, ROUGE-L y Distinct-N) sin aportar valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,9 GB, pero no se especifican los parámetros del modelo ni la dimensión oculta.
- GPU recomendadas: no disponible. Al ser un modelo BiLSTM de tamaño presumiblemente moderado, es probable que quepa en GPUs de consumo, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada; no se dispone de cifras de VRAM.
- Opciones de despliegue: el modelo se distribuye como código PyTorch con frontend Streamlit; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (LSTM con atención para modelado de lenguaje a nivel de palabra) ni de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Arquitectura pre-transformer: la BiLSTM con atención no captura dependencias de largo alcance tan eficazmente como los transformers, lo que limita la coherencia en textos largos.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan evaluar su calidad frente a alternativas.
- Idiomas y contexto no documentados: se desconoce la longitud máxima de secuencia y los idiomas cubiertos, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación y repetición: como todo modelo de lenguaje, puede generar texto incoherente o repetitivo, especialmente con temperature sampling alto.
- Licencia: el badge de la model card indica MIT, pero el campo de licencia de Hugging Face figura como no disponible; conviene verificar antes de un uso comercial.
- Corpus de entrenamiento desconocido: al entrenarse sobre cualquier texto plano, los sesgos del corpus se reflejan directamente en las salidas.
- Codificaciones heredadas ignoradas: la detección de texto plano descarta codificaciones como windows-1252, lo que puede excluir corpus legítimos.
- No apto para producción: sin soporte de tool calling, agentes ni despliegue optimizado, su uso está orientado a experimentación y docencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moz-v/word-wave
- Paper de LSTM bidireccional (Schuster & Paliwal, 1997): https://arxiv.org/abs/1409.0473 (referencia citada en los tags; corresponde a Neural Machine Translation by Jointly Learning to Align and Translate)
- Paper de Adam (Kingma & Ba, 2015): https://arxiv.org/abs/1412.6980
- Paper de clipping de gradientes (Pascanu et al., 2013): https://arxiv.org/abs/1211.5063
- Paper de seq2seq (Sutskever et al., 2014): https://arxiv.org/abs/1409.3215
- Paper de nucleus sampling (Holtzman et al., 2020): https://arxiv.org/abs/1904.09751
- Paper de precisión mixta (Micikevicius et al., 2018): https://arxiv.org/abs/1710.03740
- Paper de regularización (Srivastava et al., 2014): https://arxiv.org/abs/1801.06146 (referencia citada en los tags)
- Paper de atención aditiva (Bahdanau et al., 2015): https://arxiv.org/abs/1510.03055 (referencia citada en los tags)
- Repositorio PyTorch: https://pytorch.org/
- Streamlit: https://streamlit.io/
- Licencia MIT: https://opensource.org/licenses/MIT
