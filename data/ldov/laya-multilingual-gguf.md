# ldov/laya-multilingual-GGUF

## Resumen

Laya Multilingual GGUF es una compilación en formato GGUF del modelo `convaiinnovations/laya-multilingual`, un encoder multilingüe de 322 millones de parámetros (323.182.091 exactos) derivado de mmBERT-base. No es un modelo generativo: se trata de un modelo de decisión (denominado "System 1" por sus autores) que, dada una serie de preguntas tipadas —`choice`, `score` o `noul`—, devuelve probabilidades calibradas en una única pasada del encoder, sin decodificación autorregresiva de tokens. El repositorio lo publica el usuario `ldov` y el runtime lo proporciona la herramienta `ggmlc`.

La relevancia de esta ficha reside en su naturaleza híbrida: no es un GGUF convencional de llama.cpp, sino un artefacto generado por **ggmlc**, un compilador de redes neuronales que traduce modelos de PyTorch, JAX, Flax y Keras a ejecución GGML de alto rendimiento. Cargar estos ficheros en `llama.cpp` fallará. Esto lo convierte en una alternativa orientada a despliegues de clasificación y enrutamiento multilingüe en producción, con soporte de más de 100 idiomas y una ventana de contexto de 1024 tokens.

Su interés práctico está en el nicho de las decisiones tipadas a baja latencia: en lugar de generar texto, el modelo puntúa opciones predefinidas, lo que lo hace adecuado para triaje, enrutamiento de tickets y clasificación de correo, con una huella de memoria que va de ~345 MB (Q8_0) a ~633 MB (F16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (mmBERT-base), sin decodificacion autorregresiva |
| Parametros totales | 323.182.091 (~322 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16, Q8_0, UD_Q4_K_M |
| Idiomas soportados | multilingue, mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF generado por ggmlc (no compatible con llama.cpp / llama-cli) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso basado en mmBERT-base, con 322 millones de parámetros y una ventana de contexto de 1024 tokens. Su funcionamiento difiere del de un modelo de lenguaje: en lugar de predecir el siguiente token, procesa preguntas tipadas y devuelve puntuaciones o probabilidades. El tokenizador es Gemma BPE con Metaspace (`▁`), con tokens especiales `<bos>`, `<eos>`, `<pad>` y `<mask>` (ids 2/1/0/4), lo que lo distingue de los esquemas `[CLS]/[SEP]/[MASK]` de ModernBERT.

El autor describe el modelo como la reproducción abierta de TypeSafe **Jev**: dado un estado y preguntas tipadas (`choice` / `score` / `noul`), devuelve probabilidades calibradas en una sola pasada del encoder. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. El checkpoint inglés original tiende a mantenerse confiado y a colapsar fuera del inglés, motivo por el cual existe esta familia multilingüe, pensada para texto no inglés o mixto.

La innovación técnica destacable es la propia herramienta de compilación: ggmlc rebaja modelos de PyTorch, JAX, Flax y Keras a ejecución GGML con kernels de alto rendimiento, permitiendo ejecutar el encoder en CUDA, Metal o CPU con un único binario `laya`.

## Capacidades

- Decisiones tipadas: puntuación de preguntas de tipo `choice`, `score` y `noul` en una única pasada del encoder, sin generación de tokens.
- Clasificación y enrutamiento multilingüe sobre más de 100 idiomas.
- Presets integrados, como `email` y `triage`, orientados a la clasificación de correo y al triaje.
- Salida en JSON para integración programática (`--json`).
- Detección de idioma (`laya detect-lang`) y enrutamiento automático entre checkpoints inglés y multilingüe según el script (no latino → multilingüe; en caso contrario, recuento de palabras funcionales inglesas).
- Servicio HTTP mediante `laya serve`, con Decision Studio en `GET /` y endpoint `POST /api/decide`.
- Modo daemon con JSON-RPC por líneas sobre stdin/stdout.
- Aceleración por GPU mediante `--device auto` (CUDA o Metal si están presentes) y `--cuda-graph`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni audio, coherentemente con su naturaleza de encoder de decisión.

## Casos de uso

- Triaje de tickets de soporte: con el preset `triage`, el modelo clasifica una consulta entrante y la asigna a una categoría o cola con una única pasada del encoder, sin coste de generación autorregresiva.
- Clasificación de correo de facturación: el preset `email` permite puntuar reclamaciones como dobles cobros en varios idiomas (el ejemplo de la model card usa texto en japonés y alemán) y devolver la decisión en JSON.
- Enrutamiento multilingüe en atención al cliente: gracias al soporte de más de 100 idiomas y a la detección automática de script, se puede dirigir cada mensaje al flujo o al agente adecuado sin traducir previamente.
- Moderación y etiquetado de contenido: al funcionar como clasificador de opciones tipadas, puede puntuar mensajes frente a un conjunto de categorías predefinidas en una sola pasada.
- Extracción de decisión estructurada en pipelines: la salida JSON y el modo daemon JSON-RPC permiten integrarlo como un paso de decisión dentro de sistemas mayores, con latencia baja y sin generación de texto.
- Microservicio de decisión embebido: `laya serve` expone Decision Studio y `POST /api/decide`, de modo que un equipo puede desplegar el modelo como servicio HTTP ligero (entre ~345 MB y ~633 MB según cuantización) en CPU o GPU.
- Enrutamiento previo a un LLM generativo: puede usarse como primera etapa para decidir si una consulta requiere un modelo generativo mayor, ahorrando coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificación, y el repositorio no aporta métricas de precisión, calibración ni comparativas numéricas.

## Requisitos de hardware

- Huella de memoria en disco del propio fichero: F16 ~633 MB, Q8_0 ~345 MB, UD_Q4_K_M ~500 MB (este último es mayor que Q8_0 porque los embeddings se mantienen en F16).
- Al ser un modelo de 322 M de parámetros, cabe con holgura en GPU de consumo: cualquier GPU con 2 GB o más de VRAM libre es suficiente para los tres formatos.
- Ejecutable en CPU sin GPU; `--device auto` selecciona CUDA o Metal si están disponibles y, en caso contrario, usa CPU.
- Compatible con aceleración CUDA y Metal mediante `--device auto` y `--cuda-graph`; no se documentan requisitos de A100, H100 o RTX 4090 porque no son necesarios para este tamaño.
- Opciones de despliegue: binario `laya` (CLI `decide`, `serve`, `daemon`, `bench`, `info`, `list-presets`), con binarios descargables desde las releases de ggmlc. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que estos ficheros no son GGUFs de llama.cpp.
- Latencia y throughput: `laya bench` está disponible para medirlos, pero no se publican cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| Laya Multilingual GGUF (este) | ~322 M | 1024 | 100+ | Apache 2.0 | Runtime `laya` (ggmlc), no llama.cpp |
| convaiinnovations/laya-multilingual (base) | ~322 M | 1024 | 100+ | Apache 2.0 | Pesos originales (PyTorch/safetensors); el runtime de referencia es `laya` |
| Encoders multilingues tipo XLM-R base / mDeBERTa-v3 base | ~278 M | no disponible | 100+ | MIT / varias | ecosistema HuggingFace Transformers |

Los datos de rendimiento comparado no están disponibles en la información proporcionada. La diferencia funcional principal frente a encoders multilingües convencionales es que este modelo puntúa preguntas tipadas (`choice` / `score` / `noul`) en una sola pasada en lugar de exponer una cabeza de clasificación genérica, y que se distribuye compilado por ggmlc en lugar de como checkpoint de Transformers.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, ni código, ni matemáticas. Solo puntúa preguntas tipadas.
- No es un GGUF de llama.cpp: cargarlo con `llama-cli` o `llama.cpp` fallará. Requiere el binario `laya` de ggmlc.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- El checkpoint inglés original tiende a colapsar fuera del inglés; este modelo está pensado para texto no inglés o mixto, pero la calibración real por idioma no está documentada.
- Riesgo de sesgo: al ser un clasificador multilingüe sobre más de 100 idiomas, puede heredar sesgos de representación desigual entre idiomas y culturas. No se documentan evaluaciones de equidad.
- Riesgo de alucinación: bajo en el sentido generativo, pero existe riesgo de decisiones mal calibradas o mal etiquetadas cuando la entrada se sale de la distribución entrenada.
- El repositorio muestra 0 descargas y 0 likes, por lo que no hay validación comunitaria publicada.
- No se documentan las condiciones exactas de entrenamiento, el dataset ni las técnicas de ajuste, lo que dificulta evaluar su comportamiento en producción.
- Aunque la licencia es Apache 2.0 (igual que los pesos Laya originales), conviene verificar que los pesos derivados de mmBERT-base respetan sus condiciones de uso.
- El binario compilador ggmlc se distribuye bajo licencia MIT, independiente de la licencia del modelo.
- La fecha de creación y actualización del repositorio figura como 2026-09-28, dato que puede ser inconsistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ldov/laya-multilingual-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio ggmlc: https://github.com/monatis/ggmlc
- Ejemplo de Laya en ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- Binarios de ggmlc (releases): https://github.com/monatis/ggmlc/releases/latest
- Repositorio Laya: https://github.com/NandhaKishorM/laya
- Familia inglesa (laya-GGUF): https://huggingface.co/mys/laya-GGUF
- Familia de decisiones tipadas (laya-typed-decisions-GGUF): https://huggingface.co/mys/laya-typed-decisions-GGUF
