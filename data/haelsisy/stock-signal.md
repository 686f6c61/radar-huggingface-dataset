# haelsisy/stock-signal

## Resumen

WatchSignal v4.0 es un modelo de clasificación de señales bursátiles publicado en HuggingFace bajo el identificador haelsisy/stock-signal. Se trata de un híbrido BiLSTM + Transformer con cuatro cabezas de clasificación paralelas que, a partir de una ventana de 30 velas descritas por 55 características (etiquetadas como v3.1 en la model card), produce una predicción de tres clases (SELL/HOLD/BUY) para cuatro horizontes temporales distintos: 5, 10, 21 y 63 días.

El modelo se distribuye como un ensemble de cinco semillas (42, 1, 7, 99 y 2025), cada una exportada a ONNX (opset 13, ~27,7 MB por fichero) y acompañada de temperaturas de calibración por horizonte. No es un modelo generativo ni de propósito general: es un clasificador de series temporales financieras de dominio muy específico, orientado a inferencia ligera (compatible con ONNX Runtime Mobile).

Su relevancia es limitada y debe contextualizarse: el repositorio acumula 0 descargas y 1 like, no publica licencia, no incluye paper ni resultados de benchmarks más allá de una métrica de exactitud agregada, y los resultados de backtest out-of-sample se remiten a un fichero JSON del propio repositorio cuyo contenido no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida BiLSTM + Transformer (2 capas, 4 cabezas de atención, pre-LN) con 4 cabezas de clasificación independientes |
| Parámetros totales | no disponible (el autor no publica el recuento; cada fichero ONNX ocupa ~27,7 MB) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventana fija de 30 velas × 55 características (no es contexto textual extensible) |
| Tipos de cuantización | no disponible; se distribuyen pesos ONNX sin variantes cuantizadas documentadas |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 13), compatible con ONNX Runtime Mobile |
| Entrada | `[batch, 30, 55]` float32 |
| Salida | `[batch, 4, 3]` float32 (4 horizontes × 3 clases: SELL/HOLD/BUY) |
| Ensemble | 5 semillas: 42, 1, 7, 99, 2025 |
| Calibración | escalado de temperatura por horizonte y semilla (20 valores en total) |
| Tamaño del repositorio | 1,6 GB |
| Fecha de creación / actualización | 2026-03-13 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un backbone secuencial compuesto por una BiLSTM que proyecta las 55 características de entrada a 256 unidades bidireccionales, seguida de un Transformer de 2 capas con 4 cabezas de atención y normalización previa a la capa (pre-LN). El pooling combina la concatenación del último paso temporal y el promedio de la secuencia (`cat(last_step, mean_pool)`), que se proyecta mediante una capa `Linear(1024→512)` con activación GELU. Sobre esa representación compartida se montan cuatro clasificadores independientes `512→3`, uno por horizonte.

Los horizontes y sus umbrales de etiquetado son: corto (5 días, ±0,8 %), medio (10 días, ±1,5 %), largo (21 días, ±3,0 %) y macro (63 días, ±5,0 %). El ensemble promedia las probabilidades softmax de las cinco semillas y aplica `argmax` sobre el resultado. No se especifican en la información disponible el volumen de tokens o de muestras de entrenamiento, la composición del dataset, el periodo histórico cubierto, ni si hubo etapas de ajuste por refuerzo (RLHF/DPO) —poco probables en este tipo de modelo—. La model card menciona un backtest out-of-sample entre el 2026-01-09 y el 2026-04-10 cuyos resultados completos remite al fichero `v4/mh_v4_backtest_report.json`.

La innovación técnica declarada es doble: la predicción multi-horizonte con cabezas paralelas y la calibración de temperatura por horizonte y semilla. El empaquetado en ONNX (opset 13) con compatibilidad con ONNX Runtime Mobile apunta a despliegue en dispositivos ligeros. En el directorio raíz del repositorio permanecen los modelos v3.1 de un solo horizonte.

## Capacidades

- Clasificación de señales financieras en tres clases (SELL/HOLD/BUY) a partir de ventanas de 30 velas y 55 características numéricas.
- Predicción simultánea en cuatro horizontes temporales (5, 10, 21 y 63 días) mediante cabezas independientes.
- Inferencia por ensemble de cinco semillas con calibración de temperatura por horizonte.
- Salida de probabilidades calibradas por clase y horizonte (tras aplicar el escalado de temperatura correspondiente).
- Ejecución en entornos ligeros: ONNX Runtime y ONNX Runtime Mobile, opset 13.
- Verificación de integridad de los ficheros mediante `sha256_manifest.json`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: la etiqueta `en` es informativa y el modelo no procesa texto.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni generación de texto.

## Casos de uso

- Señalización automatizada en un sistema de trading algorítmico: el modelo devuelve, para cada vela de cierre, una distribución de probabilidad sobre SELL/HOLD/BUY en cuatro horizontes, que puede convertirse en órdenes o en filtros de una estrategia preexistente aplicando los umbrales publicados (±0,8 %, ±1,5 %, ±3,0 %, ±5,0 %).
- Filtro de entrada para carteras gestionadas por reglas: usar únicamente la cabeza de horizonte macro (63 días) como confirmación de tendencia antes de ejecutar operaciones decididas por otros modelos o por reglas técnicas.
- Investigación académica en predicción de series financieras: el modelo sirve como baseline reproducible de arquitectura híbrida BiLSTM-Transformer con evaluación multi-horizonte y ensemble de semillas.
- Despliegue en dispositivos con recursos limitados: al ser ONNX de ~27,7 MB por semilla y compatible con ONNX Runtime Mobile, permite ejecutar la inferencia en un portátil o en un dispositivo móvil sin GPU.
- Inferencia en lote (batch) sobre un universo amplio de activos: la entrada tensorial `[batch, 30, 55]` admite procesar cientos de tickers en una sola pasada si las 55 características v3.1 se calculan de forma consistente con el entrenamiento.
- Monitorización de riesgo y alertas: emplear la clase SELL de los horizontes corto y medio como disparador de avisos o de reducción de exposición, con la probabilidad calibrada como medida de confianza.
- Comparación de estrategias mediante backtest: reproducir el backtest out-of-sample documentado en `v4/mh_v4_backtest_report.json` y contrastar los resultados con los de una estrategia de referencia (por ejemplo, buy-and-hold).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exactitud media ponderada del ensemble (5 semillas) | 0,5690144980676382 % ± 0,008819085091941169 % (tal como figura en la model card) |
| Calibración | temperatura por horizonte y semilla (20 valores) |
| Backtest out-of-sample (2026-01-09 → 2026-04-10) | resultados no incluidos en la información disponible; remitidos a `v4/mh_v4_backtest_report.json` |
| Benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) | no aplicables (modelo no generativo) ni disponibles |

Nota de interpretación: la cifra de exactitud está publicada con el símbolo de porcentaje, lo que arrojaría un 0,569 %. Por la magnitud y la presencia de cuatro clases (una línea base aleatoria sería 33,3 %), el valor parece corresponder a una exactitud de 0,569 en tanto por uno (56,90 % ± 0,88 %), pero la model card no lo aclara y no se debe asumir sin confirmación del autor.

## Requisitos de hardware

- VRAM estimada: muy baja; cada semilla pesa ~27,7 MB en ONNX, por lo que las cinco juntas ocupan ~139 MB más espacio de activaciones. Inferencia viable en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren. Cualquier GPU con unos pocos cientos de MB libres (por ejemplo, GTX 1650, RTX 3060, T4) es más que suficiente; A100 o H100 no aportan ventaja relevante para este tamaño.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime y ONNX Runtime Mobile (soporte declarado por el autor, opset 13); el formato ONNX permite además exportación a otros runtimes compatibles.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de rendimiento por lote.
- Almacenamiento: el repositorio completo ocupa 1,6 GB, aunque los artefactos v4 estrictamente necesarios (5 ONNX + ficheros JSON) suman del orden de 150 MB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han facilitado alternativas de la misma categoría (clasificadores de señales bursátiles multi-horizonte en formato ONNX) ni datos de rendimiento de terceros que permitan una comparación rigurosa. Cualquier tabla comparativa requeriría benchmarks homogéneos y versiones previas del propio modelo (v3.1, presente en el directorio raíz del repositorio) para las que tampoco se aportan métricas.

## Limitaciones y advertencias

- Riesgo financiero directo: se trata de un modelo de señales de inversión. Una exactitud agregada ligeramente por encima de una línea base trivial no implica rentabilidad; la precisión por clase, el coste de transacción, el deslizamiento y la estabilidad temporal son determinantes y no están documentados en la información disponible.
- Ambigüedad métrica: la exactitud publicada está expresada con símbolo de porcentaje (0,569 %) pero probablemente corresponde a 56,90 %; el propio autor no aclara la convención ni la definición exacta de "exactitud media ponderada".
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial y persisten dudas sobre la base legal de redistribución o explotación en producción.
- Ausencia de benchmarks independientes: no hay paper, ni evaluación por terceros, ni comparación con baselines publicados. Los resultados de backtest solo se referencian a un JSON no incluido en la información disponible.
- Riesgo de sobreajuste y de deriva de régimen: el modelo se ha entrenado sobre datos históricos y su backtest out-of-sample cubre apenas tres meses (2026-01-09 a 2026-04-10), un periodo insuficiente para evaluar robustez ante cambios de régimen de mercado.
- Dependencia estricta del preprocesado: la entrada exige exactamente 30 velas y las 55 características v3.1 en el mismo orden y con la misma normalización que en entrenamiento; cualquier desviación invalida la salida y no existe documentación pública detallada del pipeline de features.
- Idiomas: la etiqueta de idioma `en` es informativa; el modelo no procesa lenguaje natural, por lo que no cabe esperar comportamiento multilingüe.
- Adopción nula: 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en producción ni de mantenimiento más allá de la última actualización registrada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de señal espuria, es decir, clasificaciones con alta confianza y nulo poder predictivo, especialmente en horquillas laterales.
- Verificación de integridad: conviene comprobar los hashes de `sha256_manifest.json` antes de desplegar, dado que el repositorio aloja varios modelos (v3.1 y v4) y es fácil cargar el artefacto equivocado.
- Este modelo no constituye asesoramiento financiero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haelsisy/stock-signal
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo: se limitan a páginas genéricas de Google (Chrome, Accounts, Gmail, Drive, Play Store), sin relación con el repositorio.
- No se han facilitado enlaces a paper, blog técnico, repositorio de código o demo.
