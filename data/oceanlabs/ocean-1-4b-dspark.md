# OceanLabs/Ocean-1-4B-DSpark

## Resumen

Ocean-1-4B-DSpark es un modelo de lenguaje de aproximadamente 3.920 millones de parámetros publicado por OceanLabs en HuggingFace, derivado del modelo base D-Spark-4B (D-Spark Team) y distribuido bajo licencia Apache 2.0. Se trata de un transformer denso de 36 capas con atención híbrida: la mayoría de capas emplean ventana deslizante de 512 tokens y una de cada cinco mantiene atención completa, un patrón que reduce el coste de la caché KV en hardware limitado sin renunciar al contexto largo.

El modelo declara una ventana de contexto de 1.048.576 tokens (1M) y soporte de más de 200 idiomas, con modo de razonamiento (thinking) activado por defecto en la plantilla de chat. Su vocabulario es de 131.072 tokens, el tamaño oculto de 2560 y el tamaño intermedio de 9216, deliberadamente reducido respecto a otros modelos de la misma clase (aproximadamente 3,6 veces el tamaño oculto) para mejorar el TTFT y el consumo de memoria en dispositivos de borde.

Es relevante porque combina una ventana de contexto poco habitual en la categoría de 4B con un diseño orientado a inferencia local en NVIDIA, Apple Silicon (MLX) y CPU. Como contrapartida, el repositorio no publica resultados de benchmarks, no incluye pesos cuantizados y su model card es idéntica a la del modelo base, sin detallar qué aporta este checkpoint concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding-window attention mayoritaria + capas dispersas de atención completa) |
| Parámetros totales | 3.920.000.000 (~3,9 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | bfloat16 en los pesos publicados; no se publican cuantizaciones GGUF, AWQ, GPTQ ni MLX en el repositorio (no disponible) |
| Idiomas soportados | La model card declara más de 200 idiomas; los metadatos de HuggingFace no especifican lista de idiomas (no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); requiere `trust_remote_code=True` (tag `custom_code`) |
| Tamaño oculto (hidden size) | 2560 |
| Tamaño intermedio | 9216 |
| Capas | 36 |
| Cabezas de atención | 16 cabezas de consulta, 4 cabezas KV (GQA) |
| Dimensión de cabeza | 256 |
| Ventana deslizante | 512 tokens |
| Patrón de capas | 4 × sliding → 1 × full (repetido), terminando en sliding |
| Tamaño de vocabulario | 131.072 |
| Precisión | bfloat16 |
| Modelo base | D-Spark-4B |
| Tamaño del repositorio | 8,2 GB |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creación | 26 de septiembre de 2026 |
| Fecha de actualización | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 36 capas con atención híbrida. El patrón publicado es de cuatro capas con ventana deslizante de 512 tokens seguidas de una capa con atención completa, repetido a lo largo del modelo y cerrando con una capa deslizante. Aplicando ese patrón a 36 capas, se obtienen 7 capas de atención completa y 29 de ventana deslizante (cálculo derivado de la configuración publicada, no confirmado explícitamente por el autor). El resultado es una caché KV con dos regímenes: las capas deslizantes quedan acotadas a 512 tokens por cabeza, mientras que las capas completas crecen linealmente con el contexto. La atención usa GQA con 16 cabezas de consulta y 4 cabezas KV de dimensión 256, lo que reduce el tamaño de la caché frente a atención multi-cabeza convencional.

El bloque de alimentación hacia delante emplea un tamaño intermedio de 9216, inferior al habitual en modelos de este tamaño, decisión que la model card justifica por eficiencia en memoria y latencia. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre la existencia de decodificación especulativa o variantes de atención lineal. Tampoco se detalla qué proceso de ajuste produce este checkpoint respecto al modelo base D-Spark-4B. El modo de razonamiento (thinking) viene activado por defecto a través de la plantilla de chat y puede desactivarse con `"chat_template_kwargs": {"enable_thinking": false}`. Los parámetros de muestreo recomendados son temperature 1.0, top_p 0.95, top_k -1 y repetition_penalty 1.0.

## Capacidades

- Generación de texto conversacional en modo multi-turno, con plantilla de chat propia.
- Razonamiento explícito mediante modo thinking activado por defecto (desactivable por configuración).
- Escritura y redacción de contenido general.
- Traducción y uso multilingüe: la model card declara soporte de más de 200 idiomas, aunque no se publica la lista ni evaluaciones por idioma.
- Programación: la model card declara resultados competitivos en tareas de código cotidianas, sin cifras de benchmarks disponibles.
- Uso de herramientas (tool use) y flujos agénticos: se declara compatibilidad con frameworks de agentes populares, aunque no se especifica el formato exacto de function calling ni el esquema del tokenizer para herramientas.
- Razonamiento multi-paso y flujos de agente, orientados a ejecución en dispositivo.
- Contexto largo: ventana declarada de hasta 1.048.576 tokens.
- Despliegue multiplataforma: NVIDIA, Apple Silicon vía MLX, CPU y otros, con compatibilidad declarada con vLLM, SGLang, llama.cpp, Ollama, LM Studio y ajuste fino con Llama-Factory.
- No se declaran capacidades de visión, audio ni multimodalidad: es un modelo de generación de texto.

## Casos de uso

- Asistente de documentos en local: con una ventana declarada de 1M tokens, el modelo puede ingerir manuales técnicos, contratos o expedientes completos sin fragmentación ni recuperación externa, ejecutándose en un portátil con GPU de consumo si se cuantiza.
- Agentes de escritorio y automatización de tareas: su tamaño de ~3,9 B y la orientación a inferencia en borde permiten integrarlo en aplicaciones de escritorio que necesitan llamadas a herramientas en varios pasos sin depender de la nube.
- Autocompletado y asistencia de código en IDE: el modelo cabe en memoria de GPUs de gama media y declara capacidades de código; puede servir como motor local de sugerencias en entornos con requisitos de privacidad.
- Traducción y localización de contenidos: con soporte declarado de más de 200 idiomas, es utilizable para traducción de documentación y atención multilingüe, siempre que se validen los pares de idiomas concretos por falta de evaluaciones publicadas.
- Procesamiento de registros y análisis de incidencias: el contexto largo permite cargar ficheros de log extensos o trazas completas y pedir resúmenes, correlaciones y causas raíz en una sola pasada.
- Atención al cliente automatizada con contexto largo: puede mantener conversaciones multi-turno con historial extenso y documentación de producto inyectada en el prompt, con la ventaja del coste reducido de la caché KV por el diseño de ventana deslizante.
- Generación aumentada por recuperación (RAG) en infraestructura propia: al soportar vLLM, SGLang y llama.cpp, puede desplegarse como servicio interno con licencia Apache 2.0 sin restricciones de uso comercial.
- Filtrado y clasificación de grandes volúmenes de texto: tareas de etiquetado, extracción de entidades o moderación por lotes donde el coste por token y la huella de memoria son determinantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa resultados "competitivos" en código cotidiano, flujos agénticos, razonamiento y seguimiento de instrucciones, pero no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni comparaciones numéricas con modelos de la misma clase.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir de la configuración publicada (3,92 B de parámetros, 36 capas, 4 cabezas KV de dimensión 256, ventana deslizante de 512 y 7 capas de atención completa derivadas del patrón), no datos oficiales del autor.

- Pesos en bfloat16: ~7,8 GB solo para parámetros, más activaciones y overhead del runtime. En la práctica, unos 8,5-10 GB de VRAM.
- Caché KV estimada: ~28 KB por token para las capas de atención completa (~4 KB por capa y token en bf16). A 8K de contexto, ~230 MB; a 32K, ~0,9 GB; a 128K, ~3,7 GB; a 1M, ~29 GB. Las capas deslizantes añaden un coste prácticamente constante de ~60 MB.
- Presupuesto total estimado en bf16: ~8,3 GB a 8K de contexto, ~9 GB a 32K, ~11,7 GB a 128K y ~37 GB para agotar los 1M tokens declarados.
- Cuantización estimada: ~4,2 GB en 8 bits y ~2,4 GB en 4 bits para los pesos, más la caché KV correspondiente al contexto usado.
- GPU recomendadas: H100 o A100 40/80 GB para contexto muy largo (256K-1M) o lotes grandes; A10G, L4, L40S o RTX 4090 para contextos de hasta 32K-128K; RTX 4080/4070 Ti y GPUs de 12-16 GB para contextos moderados en bf16.
- Cabe en GPU de consumo: sí. Con 12 GB de VRAM es viable en bf16 a contextos bajos y en cuantización de 8 bits a contextos medios; con 8 GB conviene usar cuantización de 4 bits (no publicada en el repositorio, habría que generarla).
- Opciones de despliegue declaradas: vLLM, SGLang, llama.cpp, Ollama, LM Studio, MLX en Apple Silicon y ejecución en CPU. El ajuste fino se declara compatible con Llama-Factory.
- Latencia y throughput: no disponibles. La model card afirma mejoras de TTFT y throughput frente a modelos de clase 4B similares, pero no publica mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública habitual y pueden variar según la versión consultada. No se incluye comparación de rendimiento porque Ocean-1-4B-DSpark no publica benchmarks.

| Modelo | Parámetros | Contexto | Tipo de atención | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Ocean-1-4B-DSpark | ~3,92 B | 1.048.576 tokens | Híbrida: sliding-window 512 + full attention dispersa | Apache 2.0 | Sin benchmarks publicados; pesos solo en bfloat16 |
| Qwen3-4B | ~4,0 B | 32.768 tokens nativos (ampliable con YaRN) | Densa con GQA | Apache 2.0 | Modo thinking; benchmarks publicados por el autor |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Densa con GQA | Llama 3.2 Community License | Licencia con restricciones para despliegues a gran escala |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | Densa | MIT | Orientado a razonamiento; benchmarks publicados |
| SmolLM3-3B | ~3,1 B | 64.000 tokens | Densa con GQA | Apache 2.0 | Modo thinking y soporte multilingüe declarado |

La ventaja diferencial de Ocean-1-4B-DSpark frente a estas alternativas es la ventana de contexto declarada (1M frente a 32K-128K) junto con un coste de caché KV reducido por el diseño de ventana deslizante. Sus desventajas son la ausencia de benchmarks, la falta de pesos cuantizados publicados y una adopción prácticamente nula (0 descargas), frente a ecosistemas consolidados en los modelos comparados.

## Limitaciones y advertencias

- No se han publicado benchmarks: cualquier afirmación de rendimiento relativa a código, razonamiento o agentes proviene únicamente de la model card y no está verificada con cifras.
- La model card del repositorio es la del modelo base D-Spark-4B y no describe qué ajuste o modificación introduce este checkpoint, ni su dataset de entrenamiento.
- No hay información sobre datos de entrenamiento, composición del corpus, filtrado ni procesos de alineamiento (RLHF, DPO), por lo que los sesgos son desconocidos e inevaluables.
- Riesgo de alucinación: inherente a un modelo de ~4 B sin evaluaciones publicadas de fidelidad factual; el modo thinking activado por defecto puede aumentar la longitud de salida y el consumo de cómputo si no se desactiva.
- Soporte multilingüe declarado de más de 200 idiomas sin lista ni evaluaciones por idioma: la calidad en lenguas distintas del inglés es una incógnita.
- El contexto de 1M tokens es una capacidad declarada, no verificada; agotarlo exige un presupuesto de memoria muy superior al del caso típico (estimado en ~37 GB en bf16).
- Requiere `trust_remote_code=True` (tag `custom_code`): implica ejecutar código del repositorio al cargar el modelo, un riesgo de cadena de suministro que conviene auditar antes de usarlo en producción.
- Los pesos se distribuyen únicamente en bfloat16 (8,2 GB de repositorio): no hay GGUF ni cuantizaciones listas para usar, aunque la model card declare compatibilidad con llama.cpp y Ollama; habrá que generarlas.
- Licencia Apache 2.0: permite uso comercial sin restricciones de atribución más allá de las habituales, pero no hay garantías del autor ni soporte declarado.
- Adopción mínima (0 descargas, 1 like) y fechas de creación y actualización separadas por cuatro minutos: no existe validación por parte de la comunidad ni histórico de mantenimiento.
- No se dispone de información sobre latencia, throughput ni comportamiento en producción, por lo que se recomienda una evaluación propia antes de desplegarlo en un sistema crítico.

## Enlaces

- HuggingFace: https://huggingface.co/OceanLabs/Ocean-1-4B-DSpark
- Modelo base declarado: D-Spark-4B (no se proporciona URL en la información disponible)
- Paper: no disponible
- Repositorio de código: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible
- Citación indicada en la model card:

```bibtex
@misc{dspark,
    title  = {D-Spark-4B: Efficient On-Device Language Model},
    author = {D-Spark Team},
    year   = {2026}
}
```
