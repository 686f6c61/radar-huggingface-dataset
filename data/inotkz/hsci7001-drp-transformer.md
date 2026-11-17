# InotKZ/hsci7001-drp-transformer

## Resumen

HSCI7001 DRP Transformer es un prototipo de investigación desarrollado como proyecto de curso para la asignatura HSCI7001 *Artificial Intelligence in Medicine* de la Universidad de Macao. Se trata de un transformer multimodal de pequeño tamaño (610.753 parámetros) diseñado para predecir la sensibilidad de una línea celular cancerosa a un fármaco, expresada como el logaritmo natural de la IC50 (ln IC50). El modelo combina dos ramas de entrada: una representación textual del fármaco mediante su cadena SMILES y un vector de expresión génica de la línea celular.

El modelo aborda un problema clásico en farmacogenómica computacional: la predicción de respuesta a fármacos (drug response prediction, DRP) a partir de datos heterogéneos. Frente a alternativas más pesadas, este prototipo apuesta por una arquitectura compacta que procesa SMILES con dos bloques transformer y reduce la expresión génica (2.000 genes) mediante dos capas densas antes de fusionar ambas representaciones.

Es relevante ahora únicamente como referencia metodológica y didáctica: el propio autor lo etiqueta explícitamente como prototipo de investigación no apto para uso clínico, y sus métricas en escenarios de generalización (fármacos no vistos) muestran un deterioro severo. No obstante, la publicación de los pesos, el vocabulario SMILES, la lista de genes y las estadísticas de escalado facilita la reproducibilidad y sirve como base para experimentos docentes o como línea base en comparaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (rama SMILES + rama de expresión génica con MLP) |
| Parametros totales | 610.753 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia SMILES truncada a max_len = 76 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el modelo no procesa lenguaje natural, solo SMILES y vectores numéricos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`, `checkpoint_drug_cold.pt`, `checkpoint_cell_cold.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de fusión temprana con dos ramas. La rama del fármaco tokeniza la cadena SMILES con un vocabulario de 30 tokens (longitud máxima 76), aplica embeddings de dimensión 64 más codificación posicional y pasa la secuencia por dos bloques transformer con 4 cabezas de atención, FFN de 128 unidades y normalización previa (pre-LN), finalizando con un pooling de media enmascarado. La rama celular proyecta un vector de 2.000 genes a 256 y luego a 64 mediante capas densas con ReLU y dropout 0,2. Ambas representaciones (64 + 64 = 128 dimensiones) se concatenan y pasan por una cabeza MLP de 128 → 64 → 1 que produce el valor escalar de ln IC50.

El entrenamiento se realizó sobre la release curada de GDSC (Zenodo 7060305, CC-BY-4.0), con 233.738 pares (línea celular, fármaco), 966 líneas celulares y 282 fármacos. Las características de entrada son los 2.000 genes más variables seleccionados sobre las células de entrenamiento, y las expresiones génicas se estandarizan con media y desviación típica por gen. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación; se trata de un ajuste supervisado directo sobre la tarea de regresión. Tampoco se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la fuente GDSC.

## Capacidades

- Predicción de ln IC50 para un par (fármaco en SMILES, línea celular con perfil de expresión génica).
- Procesamiento de cadenas SMILES mediante tokenización por regex con vocabulario fijo de 30 tokens.
- Codificación de perfiles de expresión génica de 2.000 genes estandarizados.
- Regresión escalar (salida continua), no generación de texto.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni planificación.
- Capacidades multilingües: no aplica; solo procesa SMILES y vectores numéricos.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Incluye helpers de carga (`load_local`, `from_pretrained`) en `modeling_drp.py`.

## Casos de uso

- Docencia y reproducibilidad en cursos de IA en medicina: el modelo sirve como ejemplo completo de pipeline DRP con pesos, vocabulario, lista de genes y estadísticas de escalado publicados, lo que permite a estudiantes reproducir el flujo de extremo a extremo.
- Línea base para comparativas metodológicas: al ser un modelo pequeño y rápido de entrenar, resulta útil como referencia contra la que medir arquitecturas DRP más complejas en los mismos splits (random, new drug, new cell line).
- Exploración de sesgos en datos farmacogenómicos: la dependencia observada de la identidad del fármaco en el split aleatorio permite analizar cómo los modelos DRP pueden explotar atajos en lugar de aprender biología subyacente.
- Prototipado de pipelines de preprocesado: la publicación de `vocab.json`, `genes_top2000.json` y `scaler_stats.json` facilita la construcción y validación de etapas de tokenización SMILES y estandarización génica antes de escalar a modelos mayores.
- Experimentos de fusión multimodal en entornos con recursos limitados: el reducido tamaño (610.753 parámetros) permite iterar rápidamente en una sola GPU consumer o incluso en CPU para pruebas de integración.
- Análisis de generalización a fármacos nuevos: los checkpoints de cold start (`checkpoint_drug_cold.pt`, `checkpoint_cell_cold.pt`) permiten estudiar el deterioro del rendimiento cuando el fármaco no está en entrenamiento, un fenómeno relevante para el diseño de modelos con aplicación real.

## Benchmarks y rendimiento

Métricas de test sobre ln IC50 (RMSE, menor es mejor; Pearson y Spearman, mayor es mejor), según la model card:

| Split | RMSE | Pearson | Spearman |
|---|---|---|---|
| Random | 1,206 | 0,888 | 0,865 |
| New drug (cold start) | 2,371 | 0,424 | 0,358 |
| New cell line (cold start) | 1,363 | 0,865 | 0,843 |

Líneas base de referencia en los mismos splits (RMSE):

| Modelo | Random | New drug | New cell line |
|---|---|---|---|
| MLP | 1,167 | 2,273 | 1,371 |
| Ridge solo fármaco | 1,623 | 12,041 | 1,707 |
| Ridge solo célula | 2,568 | 2,529 | 2,829 |

El autor señala que el rendimiento se desploma cuando los fármacos de test no se han visto en entrenamiento (el modelo de new drug se detuvo tras 4 épocas por divergencia en validación) y que la mayor parte de la señal en el split aleatorio proviene de la identidad del fármaco.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 610.753 parámetros en fp32 los pesos ocupan aproximadamente 2,4 MB, por lo que cualquier GPU con al menos 1 GB es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y en aceleradores de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante `modeling_drp.py` y `load_local`; también `DRP.from_pretrained` con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y probablemente no sea aplicable al no ser un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU y microsegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | RMSE random | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSCI7001 DRP Transformer | 610.753 | SMILES (76 tokens) + 2.000 genes | 1,206 | CC-BY-4.0 | Pesos en Hugging Face |
| MLP (línea base del autor) | no disponible | mismas features | 1,167 | no disponible | no disponible |
| Ridge solo fármaco | no disponible | solo SMILES | 1,623 | no disponible | no disponible |
| Ridge solo célula | no disponible | solo expresión génica | 2,568 | no disponible | no disponible |

No se dispone de información sobre otros modelos DRP públicos comparables (por ejemplo, arquitecturas basadas en grafos moleculares o modelos multimodales de mayor tamaño) en la documentación proporcionada; por tanto, la comparativa se limita a las líneas base reportadas por el propio autor.

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no es apto para uso clínico.
- Deterioro severo en generalización a fármacos no vistos (RMSE 2,371 frente a 1,206 en random; Pearson 0,424).
- El modelo de new drug se detuvo tras 4 épocas por divergencia en validación, lo que sugiere inestabilidad en el entrenamiento en ese régimen.
- La mayor parte de la señal en el split aleatorio proviene de la identidad del fármaco, no de la biología; riesgo de atajos espurios.
- Sesgos potenciales derivados del dataset GDSC: cobertura limitada a 966 líneas celulares y 282 fármacos, con posible sobrerrepresentación de ciertos tipos tumorales o familias de compuestos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí riesgo de predicciones con aparente precisión en pares fuera de distribución.
- Limitación de entrada: solo procesa SMILES con vocabulario de 30 tokens y longitud máxima 76; moléculas fuera de ese vocabulario se mapean a `<unk>`.
- Limitación de idioma: no procesa lenguaje natural; la etiqueta `en` es meramente administrativa.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero dado el carácter de prototipo y la ausencia de validación clínica, su uso en producción sanitaria no está justificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InotKZ/hsci7001-drp-transformer
- Dataset GDSC curated release (Zenodo 7060305): https://zenodo.org/records/7060305
