# ivanjaenm/torot-1d

## Resumen

ToR-OT 1D es un modelo de investigación desarrollado por Ivan Jaen Marquez, Sotirios Panagiotis Chytas y Vikas Singh (grupo de Vikas Singh), presentado en el artículo *Learning Optimal Transport Plans Via Autoregressive Token Regression* (NeurIPS 2026). El modelo resuelve un problema concreto: predecir el plan de transporte óptimo (optimal transport, OT) entre dos histogramas unidimensionales sin resolver explícitamente el problema de optimización lineal subyacente. Para ello emplea una arquitectura encoder-decoder de tipo transformer en la que el encoder lee los dos histogramas y el tipo de coste, y el decoder escribe el plan fila a fila como una secuencia de tokens que codifican el puntero al bin objetivo, el exponente y cuatro dígitos de mantisa.

El modelo tiene 157.599.744 parámetros en precisión float32 (pesos tras media móvil exponencial a los 200.000 pasos de entrenamiento) y se distribuye en formato safetensors dentro de un repositorio de 0,8 GB. Está entrenado sobre el corpus `ivanjaenm/torot_data_5M`, compuesto por histogramas 1D uniformes sobre el símplex de probabilidad en una rejilla regular de n = 5 a 100 bins en [0, 1], con seis tipos de coste (euclídeo, raíz euclídea, euclídeo al cuadrado, euclídeo cúbico, Canberra y gaussiano).

Su relevancia es fundamentalmente metodológica: demuestra que un transformer autorregresivo puede aproximar planes de transporte óptimo con un error relativo bajo en distribución (wMAPE mediano de 0,0180 en test_id) y sirve como referencia reproducible para toda la rama 1D del artículo. No es un modelo de propósito general ni un asistente conversacional: es un solver neuronal especializado, con licencia MIT y una librería propia (`torot`) para carga, decodificación y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con regresión autorregresiva de tokens |
| Parámetros totales | 157.599.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de n = 5-100 bins y de la longitud del plan serializado) |
| Tipos de cuantización | no disponible (pesos publicados en float32; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); configuración en `config.yaml` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder. El encoder procesa una representación de los dos histogramas de entrada (vectores de masa `a` y `b` sobre una rejilla regular de n bins en [0, 1]) junto con el tipo de coste seleccionado entre seis opciones. El decoder genera el plan de transporte de forma autorregresiva, fila a fila, emitiendo para cada entrada no nula un token compuesto por un puntero al bin objetivo, un exponente y cuatro dígitos de mantisa, lo que permite representar valores de masa con precisión decimal acotada. La última fila se delega al propio modelo (`last_row="model"`), de modo que el plan completo se reconstruye sin cálculos analíticos auxiliares.

El entrenamiento se realizó durante 200.000 pasos sobre el dataset `ivanjaenm/torot_data_5M` (revisión `54892f9763ce5b9b7237a2790aed8fff85e98baf`), con histogramas muestreados uniformemente sobre el símplex de probabilidad en rejillas de 5 a 100 bins y seis tipos de coste. Los pesos publicados corresponden a la media móvil exponencial (EMA) de los parámetros al final del entrenamiento. La decodificación empleada en el artículo es voraz (greedy) y con restricciones gramaticales, fila a fila, lo que garantiza que las secuencias generadas respeten el formato de token válido. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del corpus más allá de la generación sintética descrita.

## Capacidades

- Predicción de planes de transporte óptimo entre pares de histogramas 1D con n entre 5 y 100 bins sobre [0, 1].
- Soporte de seis tipos de función de coste: euclídea, raíz euclídea, euclídea al cuadrado, euclídea cúbica, Canberra y gaussiana.
- Generación autorregresiva de matrices de plan densas de tamaño n × m, fila a fila, con codificación token a token (puntero a bin, exponente y cuatro dígitos de mantisa).
- Decodificación con restricciones gramaticales que asegura validez sintáctica de la secuencia generada.
- Generalización limitada fuera de distribución (test_ood) y extrapolación parcial a configuraciones no vistas (test_extrap), con degradación medible.
- No soporta tool calling, function calling, agentes, razonamiento multi-step lingüístico, visión, audio ni capacidades multilingües: es un modelo numérico especializado, no un LLM de propósito general.

## Casos de uso

- Aceleración de solvers de transporte óptimo en pipelines de investigación: el modelo produce un plan aproximado en una sola pasada autorregresiva, útil como inicialización o aproximación rápida antes de refinar con `ot.emd` u otro solver exacto en problemas de n ≤ 100.
- Benchmarking de métodos neuronales para OT: sirve como referencia reproducible de la rama 1D del artículo de NeurIPS 2026, con splits test_id, test_ood y test_extrap documentados y métricas wMAPE, recall de soporte y violación máxima.
- Docencia y divulgación sobre transporte óptimo: permite ilustrar cómo un transformer puede aprender a emitir planes de acoplamiento entre distribuciones discretas sin resolver el programa lineal, con código de ejemplo en la model card.
- Generación de datos sintéticos para entrenar otros modelos de OT: los planes predichos pueden usarse como pseudoetiquetas en configuraciones donde el solver exacto es costoso, siempre que se validen las violaciones de restricciones (del orden de 5,3e-04 a 1,1e-03 en mediana según el split).
- Estudio de representaciones tokenizadas de cantidades continuas: el esquema puntero + exponente + mantisa es un caso concreto y reproducible para investigar tokenización numérica en transformers.
- Evaluación comparativa frente a baselines como Meta OT y UNOT: el repositorio incluye los runs de baseline por tipo de coste, lo que permite reproducir comparaciones controladas en el mismo corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los splits de test del corpus (wMAPE = MAPE ponderado del artículo):

| Split | Instancias | wMAPE (mediana) | wMAPE (media) | Recall de soporte | Violación máxima (mediana) |
|---|---|---|---|---|---|
| test_id | 5000 | 0,0180 | 0,1746 | 0,903 | 5,3e-04 |
| test_ood | 1728 | 0,1144 | 0,4516 | 0,751 | 7,4e-04 |
| test_extrap | 1000 | 0,7129 | 0,8186 | 0,586 | 1,1e-03 |

No se han publicado en la información disponible resultados numéricos de los baselines Meta OT y UNOT (el repositorio los incluye, pero la model card no tabula sus cifras). No se reportan métricas tipo MMLU, HumanEval o GSM8K porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,63 GB solo para pesos (157,6 M parámetros × 4 bytes), más activaciones y buffers del decoder autorregresivo; en la práctica, menos de 2 GB en configuraciones típicas de n ≤ 100.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el ejemplo de la model card usa `torch.device("cuda")` sin especificar modelo. Una RTX 3060, RTX 4060 o superior es más que suficiente; A100/H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, etc.
- Opciones de despliegue: la librería propia `torot` (`torot.evaluate.load_model`, `torot.decode.predict_plans`) es la vía documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y probablemente no sea trivial adaptarlo por el esquema de tokenización numérica y la decodificación con restricciones gramaticales.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación es autorregresiva fila a fila, por lo que el coste crece con n y con el número de entradas no nulas del plan.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToR-OT 1D | Transformer encoder-decoder autorregresivo | 157,6 M | no disponible | Token regression sobre planes OT 1D | MIT | HuggingFace (`ivanjaenm/torot-1d`) |
| Meta OT | Meta-learning sobre OT | no disponible | no aplica | Predicción de planes vía meta-aprendizaje | no disponible | Código en `baselines/` del repo TOR-OT |
| UNOT | Red neuronal para OT | no disponible | no aplica | Aprendizaje no supervisado de mapas/planes OT | no disponible | Código en `baselines/` del repo TOR-OT |
| Solver exacto (`ot.emd`) | Programación lineal | no aplica | no aplica | Resolución exacta del problema de OT | depende de la implementación (POT es MIT) | POT / scipy |

La comparación cuantitativa frente a Meta OT y UNOT no está tabulada en la información disponible; el artículo original es la fuente para esas cifras.

## Limitaciones y advertencias

- Modelo de investigación especializado: no es un LLM de propósito general; no responde a prompts en lenguaje natural ni genera texto libre.
- Dominio restringido: solo histogramas 1D sobre rejilla regular de 5 a 100 bins en [0, 1] y seis tipos de coste concretos. Fuera de ese dominio no hay garantías.
- Degradación fuerte fuera de distribución: el wMAPE mediano sube de 0,0180 (test_id) a 0,1144 (test_ood) y a 0,7129 (test_extrap); el recall de soporte cae de 0,903 a 0,586 en extrapolación.
- Los planes generados pueden violar restricciones de marginales: la violación máxima mediana es del orden de 5,3e-04 a 1,1e-03, no nula. Para aplicaciones que exijan factibilidad exacta hay que posprocesar o recurrir al solver exacto.
- La decodificación voraz con restricciones gramaticales es la configuración validada; no se documentan alternativas (beam search, sampling) ni su impacto en calidad.
- Sesgos: no documentados en la información disponible; al entrenar sobre histogramas sintéticos uniformes sobre el símplex, el modelo puede comportarse de forma distinta ante distribuciones reales con estructura (picos, masas concentradas, ceros).
- Licencia MIT: permite uso comercial y modificación, pero el artículo y el código asociado (`vsingh-group/TOR-OT`) deben citarse adecuadamente en trabajos derivados.
- No se documentan cuantizaciones oficiales ni soporte para runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su despliegue fuera del stack `torot`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ivanjaenm/torot-1d
- Dataset de entrenamiento: https://huggingface.co/datasets/ivanjaenm/torot_data_5M
- Repositorio de código: https://github.com/vsingh-group/TOR-OT
- Artículo: Jaen Marquez, I., Chytas, S. P., Singh, V. *Learning Optimal Transport Plans Via Autoregressive Token Regression*, NeurIPS 2026 (referencia bibliográfica en la model card; no se proporciona URL directa en la información disponible).
- Librería POT (usada en el ejemplo de la model card para el solver exacto `ot.emd`): https://pythonot.github.io/
