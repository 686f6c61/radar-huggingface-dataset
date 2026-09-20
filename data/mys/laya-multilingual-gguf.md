# mys/laya-multilingual-GGUF

## Resumen

Laya Multilingual GGUF es la versión cuantizada y compilada del checkpoint `convaiinnovations/laya-multilingual`, un modelo encoder multilingüe de arquitectura mmBERT-base con 323.182.091 parámetros (unos 322 M) y una ventana de contexto de 1024 tokens. No es un modelo generativo: Laya es la reproducción abierta de TypeSafe Jev y, dado un estado y una serie de preguntas tipadas, devuelve probabilidades calibradas en lugar de generar tokens. Cada consulta se resuelve en una única pasada de encoder, sin decodificación autorregresiva.

El repositorio lo publica el usuario `mys` y contiene tres ficheros GGUF (F16, Q8_0 y UD_Q4_K_M) generados con ggmlc, un compilador de redes neuronales que baja modelos de PyTorch, JAX, Flax y Keras a ejecución GGML de alto rendimiento. Es importante subrayar que estos GGUF no son compatibles con llama.cpp ni con `llama-cli`: requieren el binario `laya` distribuido en las releases de ggmlc.

Su relevancia es doble. Por un lado, cubre el hueco del checkpoint inglés de Laya, que se vuelve poco fiable fuera del inglés; esta variante está pensada para texto no inglés o mixto. Por otro lado, su tamaño (menos de 350 MB en Q8_0) y su naturaleza de decisión lo hacen apto como clasificador de bajísimo coste dentro de pipelines más grandes, siempre que se asuma su contexto corto y su ecosistema de ejecución restringido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (mmBERT-base, encoder-only) |
| Parametros totales | 323.182.091 (322 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16, Q8_0, UD_Q4_K_M |
| Idiomas soportados | multilingüe; la model card del modelo base indica más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF generado por ggmlc (no compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de mmBERT-base, un encoder multilingüe de la familia ModernBERT, con 322 M de parámetros y una ventana de 1024 tokens. Laya lo reutiliza como cabecera de decisión: en lugar de muestrear tokens, el modelo recibe un estado y preguntas tipadas (`choice`, `score`, `noul`) y produce probabilidades calibradas en una sola pasada de encoder. La model card insiste en este punto: no existe generación autorregresiva de tokens, por lo que el modo de uso no es prompt-completion sino scoring de opciones.

Los pesos publicados aquí no son un reentrenamiento, sino una compilación de los pesos upstream a GGML mediante ggmlc. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos se consideran no disponibles. El tokenizador es Gemma BPE con Metaspace (`▁`) y tokens especiales `<bos>/<eos>/<pad>/<mask>` con ids 2/1/0/4, en lugar del esquema `[CLS]/[SEP]/[MASK]` de ModernBERT, un detalle crítico para cualquiera que integre el modelo a bajo nivel.

La innovación práctica del repositorio es el pipeline de compilación y el runtime: ggmlc genera los GGUF y el binario `laya` ofrece subcomandos como `decide`, `serve`, `bench`, `daemon` y `detect-lang`, con backend CUDA o Metal seleccionado automáticamente mediante `--device auto` y opción `--cuda-graph`.

## Capacidades

- Clasificación y decisión con probabilidades calibradas sobre preguntas tipadas (`choice`, `score`, `noul`).
- Scoring en una sola pasada de encoder, sin generación de tokens ni decodificación autorregresiva.
- Procesamiento multilingüe de texto no inglés o mixto, según la model card del modelo base (más de 100 idiomas declarados).
- Detección y enrutado de idioma mediante `laya detect-lang`, con heurística basada en script no latino y recuento de palabras funcionales del inglés.
- Servido como API HTTP: `laya serve` levanta Decision Studio en `GET /` y un endpoint `POST /api/decide`.
- Modo daemon con JSON-RPC delimitado por líneas sobre stdin/stdout, apto para integración en procesos.
- Presets predefinidos de decisión, como `email` y `triage`.
- Salida en JSON estructurado mediante la opción `--json`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento extendido.
- No es un modelo de chat ni de instrucciones: no genera texto libre.

## Casos de uso

- Triage de tickets de soporte multilingües: con el preset `triage` y preguntas tipadas, el modelo asigna probabilidades a categorías de incidencia en textos en japonés, alemán o cualquier otro idioma soportado, en una única pasada de encoder y sin coste de generación.
- Clasificación de correos de facturación y disputas: el preset `email` permite etiquetar mensajes como solicitudes de reembolso o cargos duplicados (por ejemplo, `二重に請求されました` o `Bitte erstatten Sie die doppelte Abbuchung.`) y devolver JSON consumible por un sistema de ticketing.
- Enrutado previo en pipelines con LLM generativo: al devolver probabilidades calibradas y costar una fracción de una llamada a un modelo grande, puede actuar como pre-router que decide qué peticiones merecen pasar a un LLM mayor y cuáles se resuelven con una regla.
- Enrutado de idioma en despliegues mixtos: colocando el GGUF inglés y el multilingüe en el mismo directorio, `laya decide --models-dir .` selecciona el checkpoint adecuado antes del forward, usando script no latino o recuento de palabras funcionales.
- Moderación y etiquetado de contenido: como clasificador de decisión, permite aplicar umbrales sobre probabilidades calibradas para política de contenido, con la ventaja de que el resultado es interpretable y auditable frente a la generación libre.
- Análisis de encuestas y feedback de producto: clasificación de respuestas abiertas multilingües (NPS, CSAT) por sentimiento o urgencia, ejecutable en CPU o en una GPU consumer por su reducido tamaño.
- Enriquecimiento de datos por lotes: al no requerir decodificación autorregresiva y pesar entre 345 MB y 633 MB, es viable etiquetar grandes volúmenes de documentos en un único nodo, incluido un portátil.
- Componente embebido en servicios internos: el modo `daemon` con JSON-RPC sobre stdin/stdout permite integrarlo como microservicio local sin exponer HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1, calibración (ECE) ni comparaciones con otros encoders. El repositorio sí incorpora una herramienta de medición (`laya bench <fichero> --preset <preset> --device <auto> --cuda-graph`), pero no se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1 GB con los pesos F16 (~633 MB); en torno a 0,5 GB con Q8_0 (~345 MB); alrededor de 0,7 GB con UD_Q4_K_M (~500 MB, más grande que Q8_0 porque mantiene los embeddings en F16). Son estimaciones derivadas del tamaño de los ficheros, no cifras publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El binario usa CUDA si está presente. Una RTX 4090, A100 o H100 funcionan sobradamente, pero están enormemente sobredimensionadas para 322 M de parámetros con contexto de 1024; el cuello de botella será el preprocesado, no el cómputo.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU de gama media o baja de los últimos años, e incluso en iGPU y en CPU pura.
- Opciones de despliegue: exclusivamente el binario `laya` de ggmlc (`laya decide`, `laya serve`, `laya daemon`, `laya bench`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni con servidores de inferencia estándar, porque el formato GGUF empleado lo genera ggmlc y no el ecosistema llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato y runtime |
|---|---|---|---|---|---|
| mys/laya-multilingual-GGUF | 322 M | 1024 | más de 100 | Apache 2.0 | GGUF de ggmlc, binario `laya` |
| convaiinnovations/laya-multilingual | 322 M | 1024 | más de 100 | Apache 2.0 | pesos PyTorch (origen del anterior) |
| mys/laya-GGUF (familia inglesa) | no disponible | 1024 | inglés | Apache 2.0 | GGUF de ggmlc, binario `laya` |
| mys/laya-typed-decisions-GGUF | no disponible | no disponible | no disponible | Apache 2.0 | GGUF de ggmlc, binario `laya` |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros encoders multilingües de tamaño similar, por lo que la comparación se limita a parámetros, contexto, idiomas, licencia y formato de distribución.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens: documentos largos deben trocearse antes de la inferencia.
- No es un modelo generativo. Cualquier expectativa de chat, resumen o redacción de texto libre es incorrecta; solo produce puntuaciones sobre preguntas tipadas.
- Incompatibilidad total con llama.cpp, Ollama, vLLM, TGI y demás tooling GGUF estándar. Cargarlo con llama.cpp fallará, tal como advierte la model card.
- Dependencia de un runtime poco extendido: ggmlc y su binario `laya` son proyectos de un único mantenedor, lo que añade riesgo de mantenimiento, cambios de formato y ausencia de soporte comercial.
- Tokenizador Gemma BPE con tokens especiales con ids 2/1/0/4, distinto del esquema de ModernBERT. Un tokenizado incorrecto degrada silenciosamente la calibración.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- No hay métricas de calibración publicadas. Al tratarse de un modelo de decisión, la calibración es precisamente la propiedad crítica, y no está verificada en esta ficha.
- El checkpoint inglés, según la model card, se vuelve poco seguro fuera del inglés; para texto mixto debe usarse esta variante y, aun así, no hay datos sobre el comportamiento en code-switching.
- No se ha publicado la lista concreta de los idiomas soportados, solo la afirmación de más de 100 idiomas heredada del modelo base.
- Riesgo de sesgo y de alucinación: no aplicable en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas y de sesgos heredados de los datos de entrenamiento de mmBERT, no documentados en la información disponible.
- Licencia Apache 2.0 en los pesos y MIT en el compilador, por lo que el uso comercial está permitido; conviene revisar igualmente las condiciones del modelo base upstream.
- La fecha de creación registrada (2026-09-20) es inusual y podría indicar un problema de metadatos del repositorio.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces recuperados tratan sobre normativa de puertas cortafuego en Baviera y no guardan relación con el contenido de esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mys/laya-multilingual-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Compilador ggmlc: https://github.com/monatis/ggmlc
- Ejemplos de Laya en ggmlc (fuente, CLI y binarios): https://github.com/monatis/ggmlc/tree/main/examples/laya
- Releases de ggmlc (binarios `laya` / `laya.exe`): https://github.com/monatis/ggmlc/releases/latest
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Familia inglesa: https://huggingface.co/mys/laya-GGUF
- Familia de decisiones tipadas: https://huggingface.co/mys/laya-typed-decisions-GGUF
