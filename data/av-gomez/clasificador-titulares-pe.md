# av-gomez/clasificador-titulares-pe

## Resumen

El clasificador de titulares peruanos (`av-gomez/clasificador-titulares-pe`) es un modelo de clasificación de texto obtenido por ajuste fino de `distilbert-base-multilingual-cased` sobre titulares de prensa peruana. Lo publica el usuario av-gomez como proyecto académico de la Diplomatura Python Intermedio (Tarea 1) y resuelve una tarea concreta: asignar cada titular a una de cuatro categorías cerradas (`politica`, `economia`, `deportes`, `ciencia_tecnologia`). No es un modelo generativo ni un asistente conversacional; es un encoder de 135.327.748 parámetros con una cabeza de clasificación de 4 clases.

La relevancia del modelo es acotada y muy específica: sirve como baseline ligero y desplegable en CPU para enrutado y etiquetado de noticias peruanas, con licencia MIT y pesos en safetensors. Su principal limitación estructural es el volumen de datos de entrenamiento (400 titulares) y el método de supervisión: las etiquetas no son humanas, sino generadas por `qwen2.5:7b` a través de Ollama (supervisión débil), lo que introduce el ruido del profesor en el alumno.

El autor reporta una accuracy de 0.92 y un F1 macro de 0.92 sobre un conjunto de test reservado de 60 titulares, sin matriz de confusión ni desglose por clase. Con 13 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto académico sin validación externa, no de un modelo listo para producción crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT), con cabeza de clasificación de secuencia |
| Parámetros totales | 135.327.748 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens: límite estándar heredado de `distilbert-base-multilingual-cased`; no se especifica en la model card |
| Tipos de cuantización | No disponible (el autor solo publica pesos safetensors en precisión completa; no hay GGUF ni ONNX publicados) |
| Idiomas soportados | Español (`es`), con sesgo al español peruano de prensa; el modelo base es multilingüe, pero el ajuste fino solo cubre español |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto multietiqueta cerrada (single-label, 4 clases) |
| Etiquetas | `politica`, `economia`, `deportes`, `ciencia_tecnologia` |
| Modelo base | `distilbert/distilbert-base-multilingual-cased` |
| Tamaño del repositorio | 0,5 GB |
| Pipeline de HuggingFace | `text-classification` |

## Arquitectura y entrenamiento

Se parte de DistilBERT multilingüe con casing, un encoder de 6 capas y ~135M de parámetros destilado de BERT-base multilingüe, al que se añade una cabeza lineal de clasificación sobre el token `[CLS]`. El ajuste fino es supervisado de forma estándar (cross-entropy sobre 4 clases), sin que la model card especifique hiperparámetros, número de épocas, tasa de aprendizaje ni estrategia de validación. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un encoder de clasificación.

Los datos de entrenamiento son 400 titulares procedentes de La República y El Comercio, recogidos en octubre de 2026. El detalle técnico más relevante es que las etiquetas no son anotaciones humanas: se generaron mediante **supervisión débil** con `qwen2.5:7b` servido en Ollama. Esto convierte el entrenamiento en una destilación efectiva de las decisiones del profesor sobre 400 ejemplos, de modo que el techo de calidad del alumno queda condicionado por los errores de etiquetado del profesor y por la cobertura temática de la muestra. La evaluación se realizó sobre un test reservado de 60 titulares.

## Capacidades

- Clasificación de titulares de noticias en 4 categorías cerradas: política, economía, deportes y ciencia/tecnología.
- Salida de una única etiqueta por entrada con su puntuación de confianza asociada (comportamiento estándar del pipeline `text-classification`).
- Procesamiento de textos cortos (titulares y frases de una línea); admite hasta 512 tokens, pero no está entrenado para párrafos largos.
- Inferencia rápida en CPU por el reducido tamaño del encoder, apta para lotes de miles de titulares.
- Uso del encoder subyacente como extractor de características o embeddings para tareas auxiliares (no documentado por el autor).
- **No** soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo "thinking".
- **No** está validado para otras variantes del español ni para textos no periodísticos.

## Casos de uso

- **Enrutado automático en un CMS de redacción:** clasificar los titulares que llegan de agencias o de fuentes RSS y asignarlos a la sección correspondiente (política, economía, deportes, ciencia) antes de la revisión humana, reduciendo el trabajo manual de triaje en un medio digital peruano.
- **Monitorización de medios para análisis de coyuntura:** procesar a diario los titulares de La República y El Comercio y calcular la distribución temática por día o semana; el tamaño del modelo (135M) permite ejecutarlo en una máquina sin GPU y sobre lotes grandes.
- **Pre-etiquetado en un pipeline de anotación humana:** usar las predicciones como etiquetas iniciales que un anotador corrige, con el consiguiente ahorro de tiempo; el modelo sirve como paso previo a un clasificador de mayor calidad entrenado con datos humanos.
- **Alertas tempranas para equipos de análisis de riesgo:** filtrar titulares económicos o políticos y disparar avisos cuando el volumen de una categoría supere un umbral, usando el modelo como filtro de bajo coste antes de un análisis con un LLM generativo.
- **Agregador RSS con secciones dinámicas:** agrupar automáticamente los titulares de un lector de noticias peruano en pestañas temáticas sin depender de la sección declarada por la fuente, que a menudo falta o es incorrecta.
- **Baseline académico y docente:** servir de referencia cuantitativa (0.92 de accuracy sobre 60 titulares) frente a enfoques zero-shot con `qwen2.5:7b`, permitiendo comparar coste, latencia y exactitud en un ejercicio de clase o en un artículo corto.
- **Estudio de tendencias temáticas:** series temporales de conteo de titulares por categoría para analizar, por ejemplo, el peso relativo de deportes frente a política en un periodo concreto.

## Benchmarks y rendimiento

El autor solo publica métricas sobre su propio conjunto de test reservado (60 titulares). No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.), que por otra parte no aplican a un clasificador de 4 clases.

| Evaluación | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Clasificación de titulares | Test reservado, 60 titulares | Accuracy | 0,92 |
| Clasificación de titulares | Test reservado, 60 titulares | F1 macro | 0,92 |

No se han publicado la matriz de confusión, el F1 por clase, el tamaño del conjunto de entrenamiento por categoría ni los hiperparámetros de entrenamiento, por lo que no es posible evaluar si el rendimiento es homogéneo entre las 4 clases.

## Requisitos de hardware

- **Peso de los pesos:** ~541 MB en fp32 (135,3M × 4 bytes), ~271 MB en fp16 y ~135 MB en int8 si se convierte.
- **VRAM estimada para inferencia:** por debajo de 1 GB en fp32 con lotes pequeños (8-32 secuencias de hasta 64 tokens); no se publican mediciones reales.
- **GPU recomendadas:** cualquier GPU con al menos 2 GB de VRAM es suficiente (T4, RTX 3060, RTX 4090, A100). El modelo está sobredimensionado para cualquier acelerador moderno.
- **CPU:** totalmente viable; es el escenario natural de despliegue dada la carga (clasificación de titulares cortos). No se publican latencias ni throughput.
- **Opciones de despliegue:** `transformers` pipeline (la vía documentada por el autor), exportación a ONNX con Optimum + ONNX Runtime para reducir latencia en CPU, TorchServe o un servicio FastAPI con batching. vLLM y TGI están orientados a modelos generativos y no son la opción adecuada para este encoder.
- **Latencia y throughput:** no disponibles (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Observaciones |
|---|---|---|---|---|---|
| `av-gomez/clasificador-titulares-pe` | 135,3M | 512 tokens | Clasificación en 4 categorías de titulares peruanos | MIT | Entrenado con 400 titulares y etiquetas débiles de `qwen2.5:7b`; accuracy 0,92 en test de 60 |
| `distilbert/distilbert-base-multilingual-cased` (modelo base) | 135,3M | 512 tokens | Enmascarado de tokens / extractor de features | Apache 2.0 | Multilingüe; requiere ajuste fino para clasificar; sirve de referencia de coste y tamaño |
| BETO (`bert-base-spanish-wwm-cased`) | 110M | 512 tokens | Enmascarado de tokens / encoder en español | No disponible en la información proporcionada | Encoder monolingüe en español, alternativa habitual como base para clasificación de texto hispano |
| Clasificador zero-shot con `qwen2.5:7b` | 7.000M (aprox.) | No disponible en la información proporcionada | Clasificación por prompt | No disponible en la información proporcionada | Usado como profesor para etiquetar; mucho mayor coste de inferencia por titular |

No se dispone de resultados comparables publicados en las mismas condiciones (mismo test de 60 titulares) para el resto de modelos, por lo que la comparación de rendimiento no puede establecerse numéricamente.

## Limitaciones y advertencias

- **Volumen de datos muy reducido:** 400 titulares de entrenamiento y 60 de test. Con 60 ejemplos, el intervalo de confianza al 95 % de una accuracy de 0,92 es aproximadamente ±0,07, de modo que el rendimiento real podría situarse en torno a 0,85.
- **Etiquetas generadas por un LLM:** la supervisión débil con `qwen2.5:7b` implica heredar sus errores de clasificación y sus sesgos editoriales; no se ha medido la concordancia entre profesor y anotadores humanos.
- **Cobertura temática y geográfica estrecha:** solo dos medios peruanos y un mes concreto (octubre de 2026). El rendimiento fuera de ese dominio (otros países, otros medios, textos largos, tuits, titulares deportivos con jerga local) no está evaluado.
- **Cuatro clases cerradas y mutuamente excluyentes:** sucesos, cultura, internacional o salud no tienen cabida y serán forzados a una de las cuatro etiquetas con alta confianza, un riesgo claro de mala clasificación silenciosa.
- **Sin análisis de sesgos:** no se documentan sesgos políticos, de género ni de representación temática, algo especialmente sensible en clasificación de prensa política.
- **Riesgo de alucinación:** no aplica en sentido generativo (el modelo no produce texto libre), pero sí existe riesgo de **falsos positivos confiados**, ya que la cabeza softmax siempre devuelve una distribución de probabilidad aunque la entrada esté fuera de dominio.
- **Sin umbral de abstención documentado:** el autor no indica cómo detectar entradas de baja confianza ni si calibró las probabilidades.
- **Licencia MIT:** permite uso comercial y modificación sin restricciones, pero la licencia del modelo base (`distilbert-base-multilingual-cased`, Apache 2.0) debe respetarse igualmente.
- **Madurez del artefacto:** 13 descargas y 0 likes; es un trabajo académico sin revisión por pares ni mantenimiento declarado. No se recomienda como componente único en un sistema de producción sin una validación propia sobre datos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/av-gomez/clasificador-titulares-pe
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Ollama (herramienta citada para servir el profesor `qwen2.5:7b`): https://ollama.com
- Repositorio de `qwen2.5` en HuggingFace: https://huggingface.co/Qwen
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces encontrados correspondían a dominios audiovisuales y de electrónica de consumo, sin relación con el artefacto. No se han localizado papers, blogs, demos ni repositorios adicionales del autor.
