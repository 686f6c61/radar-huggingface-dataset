# bambocher/LFM2.5-24B-A2B-oQ3e

## Resumen

LFM2.5-24B-A2B-oQ3e es una versión cuantizada del modelo LFM2.5-24B-A2B, publicada por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado: el autor ha aplicado cuantización mixta de precisión con la herramienta oQ (oMLX v0.7.1) sobre los pesos originales, obteniendo una media efectiva de 3,615 bits por peso. El resultado ocupa 10,834 GB en disco (10,090 GiB de tensores) frente a los aproximadamente 47,9 GB que exigiría el mismo modelo en BF16.

El checkpoint conserva los 23.971.587.712 parámetros del modelo base y mantiene la arquitectura identificada en HuggingFace como `lfm2_moe`, es decir, un transformer con mezcla de expertos. La nomenclatura "A2B" del nombre sugiere del orden de 2.000 millones de parámetros activos por token, aunque este dato no se confirma en la información disponible. El formato es safetensors para la librería MLX, lo que restringe su ejecución a hardware Apple Silicon.

Su relevancia es práctica: permite ejecutar un modelo MoE de ~24 B parámetros en equipos con memoria unificada de 16-24 GB, algo inviable con los pesos originales. Ahora bien, el repositorio tiene 4 descargas y 0 likes en el momento de la consulta, no incluye licencia declarada ni idiomas, y no aporta ninguna evaluación de calidad tras la cuantización, por lo que debe tratarse como un artefacto experimental y no como una distribución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el tag `lfm2_moe`; numero de capas, expertos y tipo de atencion no disponibles |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | no disponible (la nomenclatura "A2B" del nombre sugiere del orden de 2 B activos por token, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta afin con group size 64: 3, 4, 5, 6 y 8 bits, mas tensores residuales en BF16 y FP32; media efectiva de 3,615 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se publica GGUF ni version para transformers |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo base: no se indican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El model card se limita a describir el proceso de cuantización. Lo único verificable sobre la arquitectura es el tag `lfm2_moe`, que confirma una topología de mezcla de expertos, y el recuento exacto de parámetros del checkpoint (23,97 B).

La innovación técnica de esta publicación es el esquema de cuantización mixta aplicado por oQ, que asigna precisión de forma no uniforme según la sensibilidad de cada tensor. La práctica totalidad de los pesos (22,951 B, el 95,743 %) se almacena en 3 bits afines con grupo de 64, mientras que una minoría se conserva en precisiones superiores: 0,510 B en 4 bits, 0,086 B en 5 bits, 0,039 B en 6 bits, 0,381 B en 8 bits y 0,005 B en BF16, con una fracción despreciable en FP32. Este reparto busca proteger las capas más sensibles a la cuantización agresiva manteniendo el grueso del modelo en 3 bits. El resultado declarado es de 3,615 bits/peso de media y 10,090 GiB de almacenamiento.

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afin 3 bits, grupo 64 | 22,951 B | 95,743 % | 9,352 GiB | 3,50 |
| Afin 4 bits, grupo 64 | 0,510 B | 2,126 % | 0,267 GiB | 4,50 |
| Afin 5 bits, grupo 64 | 0,086 B | 0,359 % | 0,055 GiB | 5,50 |
| Afin 6 bits, grupo 64 | 0,039 B | 0,162 % | 0,029 GiB | 6,50 |
| Afin 8 bits, grupo 64 | 0,381 B | 1,588 % | 0,377 GiB | 8,50 |
| BF16 | 0,005 B | 0,022 % | 0,010 GiB | 16,00 |
| FP32 | 0,000 B | 0,000 % | 0,000 GiB | 32,00 |
| Total | 23,972 B | 100 % | 10,090 GiB | 3,615 |

## Capacidades

- Generación de texto: el checkpoint es un modelo de lenguaje completo, pero el model card no documenta ninguna capacidad concreta ni incluye ejemplos de uso.
- Razonamiento, código y matemáticas: no disponible. No hay evaluación ni descripción que permita afirmar el nivel del modelo en estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Lo único confirmado es la propia cuantización: el modelo se ejecuta bajo MLX con pesos de 3,615 bits/peso de media, lo que habilita inferencia local en Apple Silicon.

## Casos de uso

- Inferencia local en portátiles Apple Silicon: el checkpoint ocupa 10,090 GiB de tensores, de modo que entra en equipos con 16 GB de memoria unificada y trabaja con holgura en configuraciones de 24 GB o superiores, sin necesidad de GPU dedicada ni de conexión a la nube.
- Procesamiento por lotes offline en un Mac: al no requerir servicio externo, encaja en tareas de resumen, clasificación o extracción de información sobre volúmenes de documentos que se procesan de noche en una estación de trabajo, siempre que se valide antes la calidad del checkpoint cuantizado.
- Prototipado rápido de aplicaciones LLM: sirve para probar prompts, cadenas de herramientas y flujos de agente en local con un modelo de 24 B parámetros, a un coste de infraestructura prácticamente nulo.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, los datos no salen del equipo, lo que resulta adecuado para experimentar con texto sensible en sectores regulados, sujeto a la verificación de la licencia del modelo base.
- Evaluación comparativa de cuantizaciones: el repositorio es útil como muestra de cuantización mixta a 3,615 bits/peso para comparar degradación frente a variantes de 4 u 8 bits del mismo modelo base, si el autor o la comunidad las publican.
- Docencia y estudio de esquemas de cuantización: la tabla de distribución de bits del model card es un ejemplo didáctico de cómo se reparte la precisión entre tensores y de cómo se calcula la media efectiva de bits por peso.
- Base para experimentos de ajuste fino ligero en MLX: el reducido tamaño del checkpoint facilita iterar en local, aunque la viabilidad de entrenar sobre pesos de 3 bits no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card únicamente incluye métricas de compresión (bits por peso y espacio ocupado); no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni del modelo base ni de esta cuantización. Tampoco se reportan latencia ni throughput.

## Requisitos de hardware

- VRAM o memoria unificada: los tensores suman 10,090 GiB, por lo que el modelo necesita al menos unos 11-12 GB de memoria libre para cargar los pesos, más el espacio de la caché KV y del runtime. 16 GB de memoria unificada es el mínimo realista; 24 GB o más es lo recomendable.
- GPU recomendadas: Apple Silicon exclusivamente (series M1, M2, M3 y M4, en variantes Pro, Max y Ultra). MLX no soporta GPU NVIDIA ni AMD, de modo que A100, H100 o RTX 4090 no pueden ejecutar este checkpoint tal cual.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en equipos Apple de consumo con 16 GB o más de memoria unificada; no es ejecutable en GPUs de consumo x86 sin reconvertir los pesos a otro formato.
- Opciones de despliegue: runtime MLX (`mlx`, `mlx-lm`) y la propia herramienta oQ/oMLX empleada para cuantizar. No hay GGUF, por lo que llama.cpp, Ollama o LM Studio no pueden cargarlo directamente; tampoco se proporcionan pesos en safetensors estándar para vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ3e (este) | 23,97 B | no disponible | safetensors MLX, 3,615 bits/peso | 10,834 GB | no disponible | publico, 4 descargas |
| LFM2.5-24B-A2B (base, BF16) | 23,97 B | no disponible | safetensors | ~47,9 GB (estimado a partir de 23,97 B x 2 bytes) | no disponible | referenciado como origen, sin enlace en la informacion disponible |
| Otras cuantizaciones del mismo modelo base | 23,97 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre cuantizaciones alternativas del mismo modelo base (4 bits, 6 bits u 8 bits) ni sobre modelos comparables de otros autores con los que contrastar parámetros, contexto y rendimiento. Cualquier comparación de calidad queda pendiente de evaluaciones que no se han publicado.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni comparación con el modelo en BF16, por lo que se desconoce la degradación real introducida por los 3,615 bits/peso medios. En una cuantización tan agresiva, la pérdida de calidad en razonamiento y código puede ser significativa y debe medirse antes de cualquier uso serio.
- Licencia no declarada: el repositorio no indica licencia. El uso comercial exige verificar la licencia del modelo base LFM2.5-24B-A2B y, en su caso, la de los pesos derivados; sin ese dato no puede asumirse ningún permiso.
- Idiomas desconocidos: el campo de idiomas está vacío, de modo que no puede confirmarse el soporte de castellano ni de otras lenguas.
- Contexto desconocido: se desconoce la ventana de contexto del modelo base, lo que impide planificar aplicaciones que dependan de documentos largos.
- Dependencia de plataforma: al estar en formato MLX, el checkpoint solo se ejecuta en Apple Silicon. Reutilizarlo en otros entornos requeriría de-cuantizar y reconvertir los pesos, con la consiguiente pérdida de fidelidad.
- Riesgo de alucinación: no cuantificado. No hay ninguna caracterización del comportamiento del modelo en tareas factuales.
- Adopción mínima: 4 descargas y 0 likes indican que el artefacto no ha pasado por revisión comunitaria; no hay informes independientes de funcionamiento.
- Sesgos: no disponible. No se documenta ninguna evaluación de sesgo ni de seguridad.
- Fecha de creación del repositorio: 21 de octubre de 2026, según los metadatos de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ3e
- Herramienta de cuantización oQ (oMLX), citada en el model card: https://github.com/jundot/omlx
- Paper, blog, repositorio del modelo base, demo o documentación adicional: no disponible en la información proporcionada.
