# level20tauren/aeacus-s-1

## Resumen

Aeacus S 1 es un clasificador a nivel de token que distingue texto escrito por humanos de texto generado por IA. Lo desarrolla el usuario de HuggingFace level20tauren como un fine-tune de ModernBERT-base, y etiqueta cada token de la entrada como `human` (0) o `ai` (1), lo que permite localizar que fragmentos concretos de un documento (incluso dentro de un mismo párrafo) son probablemente sintéticos. Es relevante porque aborda la detección de IA con granularidad fina en lugar de un único veredicto por documento, y porque incluye calibración explícita de probabilidades y exportaciones ONNX optimizadas para ejecución en navegador vía transformers.js.

El modelo tiene 149.606.402 parámetros totales y se distribuye en safetensors fp32 (571 MiB) junto con cinco variantes ONNX (fp32, fp16, int8 dinámico, 4-bit y 4-bit en fp16), la última de solo 82 MiB. La ventana de entrenamiento es de 512 tokens con stride de 128, y el autor recomienda no alimentar secuencias más largas sin trocear y promediar. La licencia es MIT y el idioma declarado es únicamente inglés.

La relevancia práctica viene de su perfil de despliegue: al ser un encoder pequeño con cuantizaciones agresivas que apenas pierden precisión (99,53 % de etiquetas idénticas a fp32 en la variante de 4 bits), se puede ejecutar en CPU, en el navegador o en hardware muy modesto, lo que lo hace apto para filtrado previo a gran escala o para herramientas de análisis de texto en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con RoPE, atención alterna global/local y Flash Attention), fine-tune para token classification |
| Parametros totales | 149.606.402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con ventanas de 512 tokens y stride de 128; no se recomienda alimentar entradas más largas sin trocear |
| Tipos de cuantizacion | fp32, fp16, int8 dinámico (per-channel), 4-bit (bloques de 32, con embeddings incluidos), 4-bit en fp16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (modelo base ModernBERT-base bajo Apache-2.0) |
| Formato de pesos | safetensors (fp32) y ONNX (fp32, fp16, int8, q4, q4f16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de answerdotai/ModernBERT-base, un encoder transformer de 149 M de parámetros que sustituye la atención completa por una combinación de capas con atención global y capas con atención local, emplea embeddings rotatorios (RoPE) y soporta Flash Attention. La cabeza es de token classification con dos etiquetas (`human` e `ai`), de modo que la salida es una probabilidad por token en lugar de una única puntuación por documento.

El entrenamiento se realizó sobre ventanas de 512 tokens con stride de 128, y el autor indica que no redistribuye los datos de entrenamiento con los pesos. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un encoder de clasificación). Sí se documenta que el conjunto de evaluación "held out" incluye generadores que el modelo nunca vio durante el entrenamiento, y que el conjunto "recent" usa texto humano de 2021-2022 emparejado temáticamente con texto generado, precisamente para descartar que el modelo aprenda a separar texto antiguo de texto nuevo en lugar de humano de IA. La innovación destacable es la calibración: el archivo `thresholds.json` contiene una curva que mapea la puntuación bruta a la tasa estimada de IA, porque las probabilidades sin calibrar son demasiado confiadas.

## Capacidades

- Clasificación a nivel de token de texto humano frente a texto generado por IA, con posibilidad de señalar regiones concretas dentro de un documento.
- Manejo de texto mixto: detecta fragmentos de IA intercalados con texto humano, incluso dentro de un mismo párrafo.
- Generalización a generadores no vistos durante el entrenamiento, según los resultados del conjunto "held out".
- Calibración de probabilidades mediante `thresholds.json`, con dos puntos de corte conservadores que solo etiquetan el 5 % superior de puntuaciones en cada dirección.
- Exportaciones ONNX listas para transformers.js, con nombres de archivo compatibles con `AutoModelForTokenClassification.from_pretrained(id, { dtype: "q4f16" })`.
- Tokenizador BPE byte-level con offsets, lo que permite mapear las predicciones de vuelta al texto original.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking": es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Moderación de contenido en plataformas: ejecutar el modelo sobre textos enviados por usuarios para marcar fragmentos sospechosos de generación automática antes de una revisión humana, aprovechando la granularidad por token para no penalizar documentos mixtos.
- Herramientas educativas de integridad académica: integrar el clasificador como señal auxiliar que resalta párrafos concretos de un trabajo, con la advertencia explícita de que el resultado no constituye evidencia ni base única para una sanción.
- Análisis de corpus en investigación: procesar grandes volúmenes de texto en CPU o en el navegador con la variante int8 (146 MiB) o q4f16 (82 MiB) para estimar la proporción de contenido sintético en un dataset, troceando en ventanas de 512 tokens con stride 128 y promediando probabilidades.
- Filtrado de datos de entrenamiento: descartar o etiquetar documentos generados por IA en pipelines de curación de datasets, usando la etiqueta por token para conservar las partes humanas de un documento parcialmente sintético.
- Extensiones de navegador y aplicaciones cliente: cargar `model_q4f16.onnx` con transformers.js para analizar texto localmente sin enviar contenido a un servidor, algo viable por el tamaño reducido y la licencia MIT.
- Auditoría de contenidos editoriales: revisar artículos o informes antes de publicación para localizar secciones que puedan haber sido generadas automáticamente y requerir verificación factual adicional.
- Investigación sobre detección de IA: servir como línea base reproducible y calibrada para comparar con otros detectores, dado que el autor publica métricas por token en tres conjuntos distintos y evalúa el impacto de cada cuantización.

## Benchmarks y rendimiento

Resultados a nivel de token publicados por el autor, sobre datos no vistos en entrenamiento y con pesos PyTorch:

| Conjunto | Accuracy | AI F1 | AUROC |
|---|---|---|---|
| test | 0,982 | 0,973 | 0,996 |
| held out (generadores nunca vistos) | 0,972 | 0,958 | 0,993 |
| recent (texto humano 2021-2022) | 0,975 | 0,968 | 0,995 |

Impacto de la cuantización, medido sobre un subconjunto de documentos:

| Variante | Tamano | Test acc | Held out acc | AUROC (test / held out) | Etiquetas idénticas a fp32 |
|---|---|---|---|---|---|
| fp32 | 573 MiB | 0,984 | 0,972 | 0,997 / 0,991 | — |
| fp16 | 288 MiB | 0,984 | 0,972 | 0,997 / 0,991 | 100 % / 99,99 % |
| int8 | 146 MiB | 0,984 | 0,972 | 0,997 / 0,991 | 99,86 % / 99,83 % |
| 4-bit | 91 MiB | 0,983 | 0,972 | 0,997 / 0,991 | 99,53 % / 99,35 % |
| 4-bit fp16 | 82 MiB | 0,982 | 0,972 | 0,997 / 0,991 | 99,53 % / 99,35 % |

El autor señala que las puntuaciones son por token y que la agregación a nivel de documento produce resultados más sólidos. No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (pesos de 571 MiB más activaciones de una ventana de 512 tokens); aproximadamente 300 MB en fp16 y por debajo de 200 MB en int8 o 4-bit.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una RTX 4090, A100 o H100 está sobredimensionada para este modelo y solo se justifica por volumen de peticiones concurrentes.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4060) e incluso en CPU: la variante q4f16 de 82 MiB está pensada para ejecutarse en el navegador vía transformers.js.
- Opciones de despliegue: transformers (>= 4.48, requerido por ModernBERT), ONNX Runtime, transformers.js; también es compatible con vLLM y TGI en la medida en que estos soporten modelos de token classification, aunque no es el caso de uso habitual.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica que la variante q4f16 es la más pequeña y rápida, y que fp16 no muestra cambios medibles frente a fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Aeacus S 1 | 149,6 M | 512 tokens por ventana | Clasificación humano/IA por token | MIT | Calibrado, exportaciones ONNX hasta 82 MiB, solo inglés |
| answerdotai/ModernBERT-base | 149,6 M | 8192 tokens nativos | Encoder de propósito general | Apache-2.0 | Modelo base; no es un detector, requiere fine-tune |
| Detectores de IA generativos tipo GPT | Cientos de miles de millones | Variable | Clasificación a nivel de documento | Propietaria habitualmente | No hay datos públicos de comparación directa en la información disponible |

No se dispone de resultados de benchmarks de terceros ni de comparaciones directas con otros detectores de IA en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El autor declara explícitamente que los resultados "no son evidencia" y que no deben usarse como base única de acusaciones, calificaciones, decisiones de contratación, hallazgos de mala conducta ni ninguna otra medida disciplinaria.
- El modelo no fue entrenado contra evasión adversarial: ataques de paráfrasis, inyección deliberada de erratas o homóglifos pueden degradar la detección de forma significativa.
- Solo soporta inglés; el rendimiento en otros idiomas no está caracterizado y presumiblemente será deficiente.
- Las probabilidades brutas son demasiado confiadas; es necesario aplicar la calibración de `thresholds.json` para interpretarlas correctamente.
- La ventana de entrenamiento es de 512 tokens con stride de 128; alimentar secuencias más largas sin trocear no está recomendado y puede producir resultados poco fiables en los extremos.
- Riesgo de sesgo: el conjunto de evaluación "test" usa texto humano anterior a 2021, y aunque el conjunto "recent" mitiga parcialmente la preocupación por aprender diferencias de estilo entre épocas, no se documentan análisis de sesgo por dominio, registro o variedad dialectal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con impacto real si se usa en contextos disciplinarios.
- La licencia MIT permite uso comercial de los pesos, pero el modelo base ModernBERT-base está bajo Apache-2.0 y se mantiene la atribución correspondiente.
- El repositorio no incluye los datos de entrenamiento, lo que limita la reproducibilidad y la auditoría independiente del dataset.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/level20tauren/aeacus-s-1
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Documentación de transformers.js (carga de modelos ONNX con `dtype`): https://huggingface.co/docs/transformers.js
- Repositorio de transformers (requiere >= 4.48 para ModernBERT): https://github.com/huggingface/transformers
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales asociados al modelo.
