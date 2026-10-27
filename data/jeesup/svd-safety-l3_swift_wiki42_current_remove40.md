# Jeesup/svd-safety-l3_swift_wiki42_current_remove40

## Resumen

`Jeesup/svd-safety-l3_swift_wiki42_current_remove40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica Swift-SVD con un objetivo declarado de eliminación del 40 % de parámetros, seguido de una recuperación SVD-LLM con LoRA secuencial sobre los factores U y V. Lo publica el usuario Jeesup como artefacto experimental, no como modelo listo para producción: el propio autor indica que las mediciones incluidas sirven para estudiar el equilibrio entre seguridad y utilidad bajo compresión y no establecen idoneidad para despliegue.

El interés del checkpoint está en su diseño controlado. La calibración usa únicamente 256 secuencias de WikiText de 2048 tokens con semilla 42, sin añadir prompts de JailbreakBench ni respuestas de rechazo, lo que lo convierte en la línea base de "código actual" frente a otras variantes del mismo autor que sí incorporan calibración o ajuste con datos de seguridad. La asignación dinámica de rangos emplea alpha 0,6 y la importancia por capa se calcula sobre WikiText.

Arquitectónicamente sigue siendo un transformer decoder-only denso de 8.030.261.248 parámetros: los pesos están plegados a formato Transformers estándar, de modo que la ratio de compresión describe el presupuesto de parámetros factorizados durante el entrenamiento, no una reducción del tamaño de descarga (el repositorio ocupa 16,1 GB). La model card publica perplejidad completa en WikiText-2, siete tareas zero-shot y evaluaciones de seguridad con jueces externos (HarmBench, WildGuard).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3), heredada del modelo base |
| Parámetros totales | 8.030.261.248 (pesos densos plegados; presupuesto factorizado con 40 % de eliminación) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de Meta-Llama-3-8B-Instruct; no se declara modificación en la model card) |
| Tipos de cuantización | no se distribuyen cuantizaciones (solo safetensors densos, presumiblemente bf16 por el tamaño del repo de 16,1 GB); cualquier GGUF/AWQ/GPTQ debe generarse localmente |
| Idiomas soportados | no disponible en la model card; el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors, compatible con `transformers` |

## Arquitectura y entrenamiento

La base es Meta-Llama-3-8B-Instruct: transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con GQA y vocabulario de 128.256 tokens. Sobre esa base se aplica Swift-SVD para eliminar aproximadamente el 40 % de los parámetros del presupuesto factorizado, con asignación dinámica de rangos (alpha 0,6) y una medida de importancia por capa derivada de WikiText. La calibración es deliberadamente mínima y reproducible: 256 secuencias de WikiText, 2048 tokens cada una, semilla 42, sin prompts de JailbreakBench ni respuestas de rechazo.

La recuperación sigue el esquema SVD-LLM: LoRA secuencial primero sobre el factor U y después sobre el factor V, con datos Alpaca-cleaned sin filtrar y dos épocas por pasada de entrenamiento. Después del entrenamiento, los factores se pliegan a pesos densos convencionales, por lo que en inferencia no hay ganancia de memoria ni de velocidad respecto a un 8B estándar. Los recuentos reales de parámetros y los detalles de recuperación se documentan en el fichero `compression.json` del repositorio, que no se ha podido inspeccionar en esta ficha.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del ajuste de Meta-Llama-3-8B-Instruct.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de contexto heredada (8192 tokens).
- Generación de código y matemáticas básicas, con calidad degradada respecto al modelo denso original por la compresión.
- Evaluación zero-shot en siete tareas: ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA (resultados por tarea no publicados en la model card, solo ficheros crudos en `utility/`).
- Respuesta a prompts de seguridad, con tasas de éxito de ataque medidas sobre AdvBench y StrongREJECT.
- Compatibilidad con `text-generation-inference` y con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en pipelines de evaluación automatizados.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre alineamiento de seguridad bajo compresión: el checkpoint sirve como referencia para medir cómo varía la tasa de éxito de ataques (ASR) al reducir parámetros, comparando contra el modelo denso y contra las variantes con calibración de seguridad del mismo autor.
- Medición de sobre-rechazo: con 0,1328 de sobre-rechazo macro medido por WildGuard sobre XSTest-safe y OR-Bench, es un punto de partida para estudiar la curva entre utilidad y prudencia excesiva tras comprimir.
- Red-teaming reproducible: los conjuntos completos AdvBench y StrongREJECT se han ejecutado sin límite de muestras (512 tokens de generación), y los registros del juez HarmBench se incluyen en `safety/`, lo que permite auditar la fiabilidad del juez y reutilizar el pipeline.
- Ablación de calibración: al usar solo WikiText con semilla 42 y sin datos de rechazo, funciona como control experimental frente a variantes calibradas con JailbreakBench (`..._jbbcal2_...`) o con SFT de rechazo (`..._jbbsft10_...`).
- Validación de métodos de recuperación post-SVD: permite comparar el efecto de la recuperación LoRA secuencial sobre U y V frente a otras estrategias, midiendo perplejidad en WikiText-2 y conservación de capacidades zero-shot.
- Docencia y reproducibilidad: la semilla fija, el número exacto de secuencias de calibración y la publicación de logs por prompt hacen viable replicar el experimento en un curso o en un artículo técnico.
- Integración en pipelines de evaluación de terceros: al ser compatible con text-generation-inference y con endpoints, puede conectarse a frameworks de evaluación automática sin infraestructura propia.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| WikiText-2 | Perplejidad (conjunto completo) | 27,2555 |
| AdvBench | Tasa de éxito de ataque, juez HarmBench | 0,4308 (43,08 %) |
| StrongREJECT | Tasa de éxito de ataque, juez HarmBench (no el scorer nativo) | 0,3291 (32,91 %) |
| XSTest-safe + OR-Bench | Sobre-rechazo macro, juez WildGuard | 0,1328 (13,28 %) |

Se ejecutaron además siete tareas zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA), pero la model card no publica los valores agregados por tarea; los resultados detallados están en los ficheros crudos de `utility/`. Límite de generación aplicado en todas las evaluaciones: 512 tokens, sin recorte de muestras. No se dispone de resultados del modelo base en la información proporcionada para establecer la comparación directa.

## Requisitos de hardware

- Pesos en bf16: 16,1 GB (coincide con el tamaño del repositorio). VRAM estimada para inferencia: 18-20 GB contando caché KV y overhead del runtime.
- Cuantización a 8 bits (generada localmente, no distribuida): aproximadamente 8,1 GB de pesos, 10-12 GB de VRAM estimados.
- Cuantización a 4 bits (generada localmente, no distribuida): aproximadamente 4,1 GB de pesos, 6-8 GB de VRAM estimados.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S 48 GB; no requieren cuantización para bf16.
- GPU de consumo: RTX 3090 o RTX 4090 (24 GB) caben en bf16 con contexto moderado; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4080 solo con cuantización de 8 o 4 bits.
- Despliegue: vLLM y TGI (el modelo declara `text-generation-inference` y `endpoints_compatible`); llama.cpp y Ollama requieren convertir previamente a GGUF, ya que el repositorio solo contiene safetensors densos.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada. Al estar los pesos plegados a formato denso, no se espera ninguna mejora de velocidad respecto a un 8B convencional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 8,03 B densos (presupuesto factorizado al 60 %) | 8192 | Swift-SVD 40 % + recuperación LoRA sobre U/V, calibración WikiText semilla 42 | llama3 | Hugging Face, 0 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8192 | Modelo denso original, sin comprimir | llama3 | Hugging Face, ampliamente desplegado |
| Jeesup/svd-safety-l3_swift_remove40 | ~8 B | 8192 (heredado) | Variante hermana del mismo pipeline Swift-SVD | llama3 | Hugging Face |
| Jeesup/svd-safety-l3_swift_jbbcal2_remove40 | ~8 B | 8192 (heredado) | Variante con calibración basada en JailbreakBench | llama3 | Hugging Face |
| Jeesup/svd-safety-l3_swift_jbbsft10_remove40 | ~8 B | 8192 (heredado) | Swift-SVD + recuperación SVD-LLM de etapa 2 y ajuste con datos JBB | llama3 | Hugging Face |

No se dispone de resultados de benchmarks del modelo base ni de las variantes hermanas en la información proporcionada, por lo que la comparación numérica de rendimiento queda como no disponible. Las descripciones de las variantes hermanas provienen de fragmentos de resultados de búsqueda y no se han verificado contra sus model cards.

## Limitaciones y advertencias

- Artefacto de investigación: el autor afirma explícitamente que las mediciones no establecen idoneidad para despliegue. No debe usarse como modelo de producción sin una evaluación propia.
- Seguridad insuficiente: una tasa de éxito de ataque de 0,4308 en AdvBench y 0,3291 en StrongREJECT implica que una fracción relevante de prompts dañinos obtiene respuesta. Es un modelo inseguro por defecto frente a uso malicioso.
- Sobre-rechazo presente pero moderado (0,1328): rechaza de más en una de cada ocho interacciones aproximadamente en los conjuntos evaluados.
- Degradación de calidad: la perplejidad de 27,2555 en WikiText-2 es el valor absoluto publicado; sin la cifra del modelo denso de referencia no puede cuantificarse la pérdida, pero el pipeline aplica una eliminación del 40 % de parámetros y el modelo no incluye recuperación con datos de seguridad.
- El checkpoint está plegado a pesos densos: no ofrece ahorro de memoria ni de cómputo en inferencia pese al nombre "remove40"; el repositorio ocupa 16,1 GB como un 8B estándar.
- Idiomas no declarados en la model card; la cobertura multilingüe real no está verificada tras la compresión.
- La evaluación de StrongREJECT usa el juez de HarmBench en lugar de su scorer nativo, lo que limita la comparabilidad con publicaciones que emplean el scorer original.
- Licencia Llama 3 Community License: permite uso comercial con condiciones (cláusula de 700 millones de usuarios mensuales, obligación de incluir el aviso "Built with Meta Llama 3", redistribución de derivados bajo la misma licencia y mención de la licencia en la documentación). Requiere revisión legal antes de cualquier explotación comercial.
- Sin descargas ni likes registrados y creado en octubre de 2026: no hay evidencia de uso externo ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_swift_wiki42_current_remove40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Variante hermana `svd-safety-l3_swift_remove40`: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40
- Variante hermana `svd-safety-l3_swift_jbbcal2_remove40`: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove40
- Ficha de `svd-safety-l3_swift_remove40` en Featherless: https://featherless.ai/models/Jeesup/svd-safety-l3_swift_remove40
- Ficha de `svd-safety-l3_swift_jbbsft10_remove40` en Featherless: https://featherless.ai/models/Jeesup/svd-safety-l3_swift_jbbsft10_remove40
- Endpoint de `svd-safety-l3_swift_remove40` en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-l3_swift_remove40
- Repositorio del autor con logs de evaluación: carpeta `utility/` y `safety/` dentro del repositorio de Hugging Face (no se han inspeccionado en esta ficha)
