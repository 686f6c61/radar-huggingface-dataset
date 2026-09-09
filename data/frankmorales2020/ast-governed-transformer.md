# frankmorales2020/ast-governed-transformer

## Resumen

El ast-governed-transformer es un modelo de transformador de tamaño reducido desarrollado por frankmorales2020, presentado como una red neuronal "topológicamente gobernada" basada en la Teoría Espectral Aritmética (AST). Según su documentación, aplica un operador L-EFM (Laplace-Euler-Fourier-Mellin) que impone restricciones espectrales supuestamente derivadas de una demostración de la hipótesis de Riemann. La arquitectura se compone de 4 capas, 768 dimensiones de embedding y 8 cabezas de atención, con una semilla fija (123) que garantiza determinismo total.

El modelo se distribuye bajo licencia MIT, está escrito en inglés y se presenta como un pipeline de extracción de características (feature extraction). No registra descargas ni "me gusta" en HuggingFace, y el repositorio ocupa 0.1 GB. Aunque la documentación incluye métricas internas de "pureza topológica" y "rechazo de sesgos", estos indicadores no son estándar ni tienen validación externa por parte de la comunidad científica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GovernedTransformerStack (transformador con gobernanza espectral) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) con configuración JSON |

## Arquitectura y entrenamiento

El modelo está construido como una pila de capas llamadas GovernedTransformerLayer, donde un módulo TopologicalGovernor aplica restricciones espectrales sobre las proyecciones Q, K y V. El operador L-EFM evalúa un producto de Euler truncado a los primeros seis primos (2, 3, 5, 7, 11, 13) en la línea crítica σ = 0.5, generando un factor complejo para cada primo. La implementación incluye una "trampa espectral" que amplifica las activaciones en σ = 0.5 y atenúa las demás con una caída gaussiana, junto con una constante de seguridad declarada (Λ = 0.9785142874).

La documentación afirma que se validaron las siete consecuencias de la hipótesis de Riemann, pero no proporciona información sobre el dataset de entrenamiento, el número de tokens, ni el proceso de RLHF a pesar de que aparece la etiqueta "rlhf" en la metadata. El entrenamiento es determinista gracias a la semilla fija 123. No se especifican los datos utilizados ni el procedimiento de entrenamiento, lo que impide auditar las afirmaciones del modelo.

## Capacidades

- Extracción de características (feature extraction) según el pipeline_tag de HuggingFace.
- Verificación de "pureza topológica" de los estados internos mediante el método `verify_purity`, que devuelve un booleano y una puntuación.
- Generación de salidas deterministas gracias a la semilla fija (123).
- Rechazo de sesgos declarado al 100 % por el autor, aunque sin benchmarks externos que lo confirmen.
- No se documenta generación de texto, soporte de tool calling, ni capacidades de visión o audio.
- La entrada del modelo es un tensor de forma (batch, seq_len, embed_dim), no texto tokenizado directamente.

## Casos de uso

- Investigación reproducible en regularización espectral: dado que el modelo usa semilla fija y verifica pureza topológica, puede emplearse en experimentos académicos que requieran reproducibilidad exacta de resultados.
- Benchmarking de arquitecturas de atención con restricciones matemáticas: sirve como punto de partida para estudiar si las restricciones sobre Q, K y V basadas en primos afectan al aprendizaje de representaciones.
- Extracción de características deterministas en sistemas críticos: cuando se necesita que la misma entrada produzca siempre la misma salida, la semilla 123 garantiza determinismo sin aleatoriedad.
- Herramienta educativa en cursos sobre teoría de números y deep learning: el operador L-EFM y la trampa espectral proporcionan ejemplos prácticos de cómo incorporar propiedades aritméticas en redes neuronales.
- Desarrollo de modelos con atributos de equidad declarados: el autor afirma un 100 % de rechazo de sesgos, lo que podría interesar a equipos que busquen sistemas con propiedades de imparcialidad, aunque sin validación independiente.
- Integración en pipelines de feature extraction experimentales: el modelo acepta tensores de entrada y devuelve representaciones de salida, por lo que puede usarse como extractor de características en flujos de trabajo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos indicadores reportados son métricas internas no normalizadas:

| Métrica | Valor |
|---|---|
| Topological purity | 1.00 |
| Bias rejection rate | 100 % |
| Prime anchor integrity | 6/6 |
| Spectral coherence | no disponible |

La documentación afirma que las siete consecuencias de la hipótesis de Riemann pasan la validación (RH = C1 × C2 × C3 × C4 × C5 × C6 × C7 = 1), pero estos resultados no pueden verificarse con los recursos públicos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Basándonos en la arquitectura declarada (4 capas, 768 de embedding, 8 cabezas), el modelo tiene aproximadamente entre 25 y 35 millones de parámetros, lo que en FP32 ocupa unos 140 MB. Se estima que requiere menos de 1 GB de VRAM.
- GPU recomendadas: no disponible en la documentación. Dado el tamaño reducido, cualquier GPU consumer con 2 GB o más de VRAM sería suficiente.
- Compatibilidad con consumer GPU: sí, el modelo cabe en tarjetas de gama baja como GTX 1050 o RTX 3050, e incluso en CPU.
- Opciones de despliegue: la documentación solo muestra carga directa con PyTorch (`torch.load` + `load_state_dict`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros frameworks de despliegue.
- Latencia y throughput: no documentados.

## Comparativa con modelos similares

No disponible. No se han publicado benchmarks del ast-governed-transformer que permitan compararlo con otros modelos de extracción de características (por ejemplo, BERT o RoBERTa). Su arquitectura es experimental y no sigue los patrones de los modelos de referencia. Los únicos datos comparativos serían los informados por el autor, que no son verificables externamente.

## Limitaciones y advertencias

- Las afirmaciones sobre la demostración de la hipótesis de Riemann carecen de validación externa. Este problema matemático sigue abierto en la comunidad científica; cualquier modelo que lo dé por resuelto debe tratarse con escepticismo.
- El pipeline es de feature extraction, no de generación de texto. No produce respuestas en lenguaje natural ni puede usarse como chatbot; el ejemplo de inferencia utiliza tensores aleatorios como entrada.
- No se proporcionan datos del conjunto de entrenamiento, tokens ni proceso de RLHF, a pesar de que la metadata incluye etiquetas como "rlhf" y "bias-free". No es posible auditar el entrenamiento ni sus afirmaciones de equidad.
- Las métricas declaradas (pureza 1.00, rechazo de sesgos 100 %) son autoinformadas y no siguen benchmarks establecidos como equalized odds o disparate impact.
- El tamaño del repositorio (0.1 GB) y la arquitectura de 4 capas sugieren un modelo pequeño con capacidades limitadas; no está diseñado para tareas de razonamiento complejo, generación de código o matemáticas avanzadas.
- Solo soporta inglés según la metadata. No se ha documentado soporte para otros idiomas.
- La certificación mencionada en el README ("TOPO-RLHF Certification (Version 4.0)") no aparece en fuentes públicas y no es verificable.
- El modelo tiene 0 descargas y 0 "me gusta" en HuggingFace, lo que indica ausencia de validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/frankmorales2020/ast-governed-transformer
- GitHub (código del operador L-EFM): https://github.com/frank-morales2020/AST/blob/main/LEFMOperator.ipynb
