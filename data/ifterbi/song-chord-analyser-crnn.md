# Ifterbi/song-chord-analyser-crnn

## Resumen

Song Chord Analyser es un modelo de reconocimiento automático de acordes musicales desarrollado por el usuario Ifterbi y publicado en Hugging Face. Se trata de una red neuronal convolucional recurrente (CRNN) jerárquica de dos etapas que combina un categorizador de raíces (Part 1 Root Categorizer) con un afinador de calidad y extensión de acordes (Part 2 Quality & Extension Finetuner), bajo la clase `CascadedCRNN`. El modelo se distribuye tanto en formato PyTorch (`best_model.pt`) como en una exportación ONNX autocontenida (opset 17) pensada para inferencia con `onnxruntime` o WebAssembly en navegador.

El interés del modelo reside en su enfoque de dos etapas para descomponer la tarea de reconocimiento de acordes y en la incorporación de un módulo de contexto de teoría musical (`MusicTheoryEncoder`) que utiliza vectores de clase de intervalo de Forte (Forte ICV), representaciones Tonnetz y una rotación de intervalos relativa a la raíz invariante de tonalidad. Según la model card, se entrenó durante 50 épocas sobre 890 pistas del dataset McGill Billboard, verificadas de forma cruzada contra 500 tablaturas de acordes emparejadas de Ultimate Guitar.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a aplicaciones de análisis musical, transcripción de acordes y herramientas interactivas de armonía. La información pública disponible es muy limitada: no se especifican parámetros, contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN jerárquica de dos etapas (`CascadedCRNN`: Root Categorizer + Quality & Extension Finetuner) con `MusicTheoryEncoder` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX opset 17; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best_model.pt`) y ONNX (`model.onnx`, opset 17) |

## Arquitectura y entrenamiento

La arquitectura es una CRNN (red convolucional recurrente) jerárquica de dos etapas. La primera etapa, `CascadedCRNN` Part 1 (Root Categorizer), se encarga de identificar la raíz del acorde; la segunda, Part 2 (Quality & Extension Finetuner), refina la calidad y las extensiones del acorde (por ejemplo, mayor, menor, séptima, etc.). El modelo incorpora un `MusicTheoryEncoder` que codifica contexto de teoría musical mediante vectores de clase de intervalo de Forte (Forte ICV), representaciones Tonnetz y una rotación de intervalos relativa a la raíz invariante de tonalidad, lo que busca hacer la representación robusta frente a cambios de tonalidad.

Según la model card, el entrenamiento se realizó durante 50 épocas sobre 890 pistas del dataset McGill Billboard, verificadas de forma cruzada contra 500 tablaturas de acordes emparejadas de Ultimate Guitar. El repositorio incluye `training_history.json` con las curvas de entrenamiento y validación de las 50 épocas, y `ug_verification_report.json` con el informe de verificación cruzada del dataset de Ultimate Guitar. No se detalla la composición exacta del dataset, el número de tokens (no aplica, es audio), ni si hubo RLHF/DPO (no procede en esta tarea).

## Capacidades

- Reconocimiento automático de acordes a partir de audio musical (pipeline `audio-classification`).
- Identificación de la raíz del acorde mediante la primera etapa del modelo.
- Clasificación de calidad y extensiones del acorde (mayor, menor, séptima, etc.) mediante la segunda etapa.
- Codificación de contexto de teoría musical (Forte ICV, Tonnetz, rotación de intervalos relativa a la raíz).
- Exportación ONNX para inferencia en `onnxruntime` y en navegador vía WebAssembly.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio (más allá del análisis de acordes) ni modo thinking.

## Casos de uso

- Análisis armónico automatizado de canciones: el modelo procesa audio y devuelve la secuencia de acordes, útil para musicólogos y estudiantes que quieran estudiar la progresión armónica de una pieza sin transcribirla manualmente.
- Herramientas interactivas de aprendizaje musical en navegador: gracias a la exportación ONNX (opset 17) y a la inferencia WebAssembly, puede integrarse en aplicaciones web que muestren los acordes en tiempo real mientras se reproduce una canción.
- Generación de tablaturas y partituras simplificadas: la salida de acordes puede alimentar pipelines de transcripción que generen cifrados armónicos o acompañamientos.
- Sistemas de recomendación musical basados en armonía: la secuencia de acordes extraída permite calcular similitud armónica entre canciones para motores de recomendación.
- Producción musical asistida: un productor puede analizar una referencia para extraer su progresión de acordes y reutilizarla en una nueva composición.
- Investigación en recuperación de información musical (MIR): el modelo sirve como componente de referencia para experimentos de reconocimiento de acordes y comparación de arquitecturas CRNN con codificación de teoría musical.
- Verificación y control de calidad de datasets de acordes: el informe `ug_verification_report.json` sugiere un uso potencial para contrastar anotaciones de acordes entre fuentes (McGill Billboard vs. Ultimate Guitar).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona `training_history.json` (curvas de entrenamiento y validación de 50 épocas) y `ug_verification_report.json` (informe de verificación cruzada), pero no se proporcionan métricas numéricas (accuracy, precision, recall, F1, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni el tamaño del checkpoint; el repositorio ocupa 0.0 GB según Hugging Face).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al no conocerse el tamaño del modelo, no puede determinarse.
- Opciones de despliegue: PyTorch (checkpoint `best_model.pt`), ONNX Runtime (`model.onnx`, opset 17) y WebAssembly en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de reconocimiento de acordes ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública muy escasa: no se especifican parámetros, contexto, licencia ni idiomas, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de integrarlo en productos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Entrenado sobre 890 pistas de McGill Billboard verificadas contra 500 tablaturas de Ultimate Guitar: el dominio musical y la diversidad de géneros pueden ser limitados, con riesgo de degradación fuera de ese repertorio.
- Riesgo de errores en acordes ambiguos o enarmónicos, habitual en reconocimiento automático de acordes; no se documentan métricas de error.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido lingüístico (el modelo no genera texto).
- No se documentan limitaciones de contexto o idioma (no aplica en el sentido habitual; es un modelo de audio).
- El repositorio incluye un aviso en la model card sobre contenido citado; debe revisarse la procedencia de los datos de entrenamiento (McGill Billboard y Ultimate Guitar) por posibles restricciones de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Ifterbi/song-chord-analyser-crnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
