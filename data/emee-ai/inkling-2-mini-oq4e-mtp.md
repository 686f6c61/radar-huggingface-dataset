# emee-ai/Inkling-2-Mini-oQ4e-mtp

## Resumen

Inkling-2-Mini-oQ4e-mtp es una cuantizacion mixta en formato MLX del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo mixture-of-experts (MoE) con arquitectura "looped" (recurrente por capas), desarrollado originalmente por Thinking Machines. El checkpoint que nos ocupa lo publica emee-ai mediante la herramienta oQ (oMLX v0.8.1), y su proposito es ofrecer una version de ~4.9 bits por peso que quepa y corra eficientemente en hardware Apple Silicon sin renunciar a las capacidades del modelo original.

El modelo base combina 26.400 millones de parametros totales con solo 3.400 millones activos por token, gracias a un esquema MoE en el que las 12 capas centrales se ejecutan tres veces por cada token (de ahi el termino "looped"). Acepta entradas de texto e imagen y declara una ventana de contexto de hasta 1 millon de tokens, lo que lo situa en la categoria de modelos multimodales de contexto largo.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones publicas de Inkling-2-Mini para MLX, con una distribucion de bits cuidadosamente documentada (NVFP4 para expertos enrutados, affine 4-bit y 8-bit para el resto, BF16 para vision y el draft de decodificacion especulativa) y con soporte para decodificacion especulativa via el draft DSpark incluido en `mtp.safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con capas "looped" (12 capas centrales ejecutadas 3 veces por token) |
| Parametros totales | 26.388.646.400 (26,39B) |
| Parametros activos | 3.400 millones (3,4B) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16 (expertos enrutados capas 0-19), affine 4-bit grupo 64 (expertos MXFP8 capas 20-23), affine 8-bit grupo 64 (proyecciones de atencion, embeddings, cabeza de vocabulario), BF16 (encoder de vision y draft DSpark), FP32 (router y controladores de loop) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit efectivo, 4,915 bits/peso en LM+vision y 5,047 bits/peso incluyendo el draft DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) y una innovacion estructural denominada "looped": las 12 capas centrales de la red se ejecutan tres veces por cada token procesado, lo que incrementa la profundidad efectiva sin multiplicar el numero de parametros. El reparto MoE hace que, pese a tener 26,4B parametros totales, solo se activen 3,4B por token, lo que reduce el coste computacional de inferencia. El modelo procesa conjuntamente texto e imagen mediante un encoder de vision dedicado (0,318B parametros logicos) y una cabeza de lenguaje comun.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card unicamente documenta el proceso de cuantizacion: oQ4e preserva los expertos enrutados de las capas 0-19 en su formato NVFP4 original y recuantiza los expertos MXFP8 de las capas 20-23 a affine 4-bit; las proyecciones de atencion, embeddings y cabeza de vocabulario se almacenan en affine 8-bit; el encoder de vision y el draft DSpark se mantienen en BF16; y el router y los controladores de loop se conservan en FP32 para preservar la precision de las decisiones de enrutamiento.

Una innovacion destacable es la inclusion del draft DSpark en `mtp.safetensors`, que oMLX Lightning MTP utiliza para decodificacion especulativa, acelerando la generacion al proponer varios tokens candidatos que el modelo principal verifica en paralelo.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagen (pipeline image-text-to-text) y genera respuestas conversacionales.
- Contexto largo: ventana de hasta 1.000.000 tokens, apta para documentos extensos, libros completos o conversaciones muy prolongadas.
- Procesamiento de imagenes: incluye un encoder de vision de 0,318B parametros logicos para tareas de comprension visual.
- Decodificacion especulativa: soporte nativo de MTP (multi-token prediction) mediante el draft DSpark, que acelera la inferencia.
- Eficiencia MoE: solo 3,4B parametros activos por token, lo que reduce el coste por token frente a modelos densos del mismo tamano.
- Conversacional: etiquetado como modelo conversacional, adecuado para dialogos multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en local: con 1M de tokens de contexto, el modelo puede ingerir informes anuales, expedientes o libros completos en una sola pasada y responder preguntas sobre ellos, ejecutandose en un Mac con suficiente memoria unificada gracias a su formato MLX de ~15,7 GiB.
- Asistencia conversacional multimodal en escritorio: integrado en una aplicacion macOS nativa, el modelo puede mantener dialogos multi-turno con imagenes adjuntas (capturas, diagramas, fotos) usando el encoder de vision incluido.
- Prototipado rapido en Apple Silicon: desarrolladores que quieran evaluar Inkling-2-Mini sin acceso a GPUs NVIDIA pueden usar este checkpoint con oMLX 0.8.1 o superior para validar capacidades antes de desplegar la version completa.
- Generacion aumentada por recuperacion (RAG) sobre corpus grandes: la ventana de 1M tokens permite concatenar muchos fragmentos recuperados sin truncar, y el bajo numero de parametros activos (3,4B) mantiene la latencia contenida.
- Investigacion sobre cuantizacion mixta: el checkpoint documenta con detalle la distribucion de bits por componente (NVFP4, affine 4-bit, affine 8-bit, BF16, FP32), lo que lo convierte en un caso de estudio para quienes investigan el impacto de la precision mixta en modelos MoE multimodales.
- Transcripcion y descripcion de imagenes en pipelines offline: por su licencia Apache 2.0 y su capacidad de ejecucion local, encaja en flujos de trabajo que requieren privacidad de datos (por ejemplo, procesar imagenes medicas o documentos confidenciales sin enviarlos a la nube).
- Evaluacion de decodificacion especulativa: el draft DSpark incluido permite medir el impacto del MTP en throughput dentro de oMLX, util para equipos que comparan estrategias de aceleracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 15,7 GiB para los pesos (15,098 GiB segun la tabla de la model card, 16,847 GB de almacenamiento en repo), mas overhead de activaciones y cache KV; con contexto de 1M tokens la cache KV puede requerir decenas de GiB adicionales.
- Hardware objetivo: Apple Silicon con memoria unificada (el formato es MLX y la libreria declarada es `mlx`); no se indica compatibilidad con CUDA.
- GPU recomendadas: no disponible en la informacion proporcionada; por el formato MLX, el entorno natural es un Mac con chip de la familia M (M1/M2/M3/M4) con al menos 32 GB de memoria unificada para contexto moderado, y 64 GB o mas para aprovechar contextos largos.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta soporte para GPUs NVIDIA consumer.
- Opciones de despliegue: oMLX 0.8.1 o superior (requisito explicito de la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada; la decodificacion especulativa via DSpark deberia reducir la latencia frente a generacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-mtp (este) | 26,39B | 3,4B | 1M tokens | Apache 2.0 | MLX safetensors, oMLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 3,4B | 1M tokens | Apache 2.0 | safetensors (precision original) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otros autores, por lo que la comparativa se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser una cuantizacion del modelo base, hereda los sesgos de este, que no se documentan en la model card.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en contextos muy largos.
- Limitaciones de contexto o idioma: se declara un contexto de hasta 1M tokens, pero no se especifica la calidad de recuperacion en ventanas extremas; los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (thinkingmachines/Inkling-2-Mini), que la model card indica como Apache 2.0.
- Dependencia de oMLX: el checkpoint requiere oMLX 0.8.1 o superior; no es utilizable directamente con otras herramientas de inferencia sin conversion.
- Precision mixta: la cuantizacion a 4 bits de los expertos de las capas 20-23 y a 8 bits de atencion/embeddings puede introducir degradacion sutil frente al modelo en BF16; no se aportan metricas de perdida de calidad.
- Memoria para contexto largo: aunque los pesos ocupan ~15,7 GiB, la cache KV para 1M tokens puede exceder la memoria disponible en muchos equipos, limitando el contexto practico.
- Fecha de publicacion futura: el checkpoint figura creado el 2026-11-25, lo que puede indicar metadatos inconsistentes o un modelo muy reciente; conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emee-ai/Inkling-2-Mini-oQ4e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
