# otheru/Qwen3.8-Flash-Next-Strix-Halo-GGUF

## Resumen

Qwen3.8-Flash-Next-Strix-Halo-GGUF es una redistribucion cuantizada y modificada del modelo oficial `Qwen/Qwen3.8-Flash-Next` de Alibaba, publicada por el usuario `otheru` en Hugging Face. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 176.943.899.520 parametros totales, orientado a generacion de texto conversacional, que ha sido sometido a un proceso de *abliteration* (eliminacion de la direccion de rechazo en el espacio residual) y cuantizado con calibracion por matriz de importancia (imatrix).

La relevancia de esta publicacion es doble. Por un lado, ofrece una version "desinhibida" del modelo base, es decir, con las respuestas de rechazo suprimidas mediante una proyeccion de rango 1 sobre las matrices de escritura al stream residual. Por otro, esta empaquetada especificamente para el runtime **halogen-flash-server** sobre hardware AMD Strix Halo (arquitectura `gfx1151`), un nicho de aceleracion local que no cubren las herramientas habituales como llama.cpp u Ollama.

El repositorio incluye dos artefactos servibles: un GGUF de 90,91 GiB con expertos en IQ4_XS y una tabla n-gram en IQ4_NL, y un checkpoint nativo `.hgn` de 115,88 GiB con tabla FP8 E4M3FN. Ademas se distribuye una cabeza MTP (Multi-Token Prediction) para decodificacion especulativa. La licencia es `qwen-community-1.0`, lo que impone restricciones adicionales al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con cabeza MTP y torre de vision (no incluida en el repo) |
| Parametros totales | 176.943.899.520 (176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion probada); pool de 524.288 posiciones KV |
| Tipos de cuantizacion | IQ4_XS (expertos gate/up), IQ4_NL (down, shared expert, dense, atencion, output), Q8_0 (embeddings), BF16/F32 (tensores pequenos); tabla n-gram en IQ4_NL (GGUF) o FP8 E4M3FN (`.hgn`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (90,91 GiB) y `.hgn` nativo halogen (115,88 GiB) + cabeza MTP `.hgn` (1,42 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen con 176,9 mil millones de parametros totales, 48 capas y modulos de "hyper-connection mixers" junto a expertos enrutados y un experto compartido. La publicacion de `otheru` no entrena el modelo desde cero: parte de los pesos oficiales de `Qwen/Qwen3.8-Flash-Next`, les aplica una edicion de abliteracion y despues los cuantiza. La edicion consiste en una proyeccion de rango 1 sobre el escritor residual, `W' = W − λ · r rᵀ W`, con `λ = 1.5` aplicado a las 48 capas sobre todas las matrices que escriben al stream residual: `down_proj` de cada experto enrutado, `o_proj`/`out_proj`/`attn_output` de atencion y `down` del experto compartido. La direccion de rechazo `r` se captura por capa a partir de activaciones de salida de bloque sobre 48 prompts daninos y 48 inofensivos (semilla 42).

La cuantizacion se realizo con `llama-quantize` calibrado por matriz de importancia, con overrides por tensor: IQ4_XS para las matrices gate/up de expertos enrutados (con 48 fallbacks de forma a IQ4_NL en las down), IQ4_NL para el resto de proyecciones y para la tabla n-gram en GGUF, Q8_0 para embeddings y BF16/F32 para convoluciones, indexers y normas. El recuento final es de 546 tensores IQ4_NL, 96 IQ4_XS, 193 BF16, 388 F32 y 1 Q8_0, sin fallbacks F16. La tabla n-gram del `.hgn` se convierte directamente de los 128 shards BF16 a FP8 E4M3FN con una escala global FP32 (`scale = max(abs(weight)) / 448`), reteniendo los 51.200.245.760 valores. La matriz de importancia se recolecta sobre el modelo base y se aplica a los pesos editados, lo que constituye una aproximacion porque la edicion desplaza las activaciones que la matriz describia. Se incluye una cabeza MTP para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de hasta 262.144 tokens.
- Razonamiento aritmetico basico: validado con respuesta entera exacta en el conjunto de pruebas del autor.
- Seguimiento de instrucciones: validado con respuesta de tres palabras solicitada.
- Generacion de codigo Python: validado con funcion y sentencia `return` solicitadas.
- Entrada de imagen: validada con identificacion del color de un fixture, aunque la torre de vision **no se incluye** en este repo y debe tomarse del release de halogen.
- Decodificacion especulativa mediante cabeza MTP incluida.
- Modo "thinking" desactivable (las pruebas de rechazo se ejecutaron con thinking desactivado).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- **Investigacion sobre alineacion y rechazo**: el modelo permite estudiar como responde un MoE de gran tamano cuando se elimina la direccion de rechazo mediante abliteracion, comparando el comportamiento con el modelo base oficial en conjuntos controlados de prompts.
- **Despliegue local en hardware AMD Strix Halo**: el `.hgn` esta empaquetado para `halogen-flash-server` sobre `gfx1151`, de modo que un equipo con APU Strix Halo puede servir un modelo de 176,9 mil millones de parametros con contexto de 262.144 tokens usando memoria GTT compartida.
- **Generacion de codigo en entornos de desarrollo**: las pruebas del autor confirman generacion de funciones Python con `return`; puede integrarse en asistentes de IDE o pipelines de revision siempre que se valide la salida.
- **Procesamiento de documentos largos**: con 262.144 tokens de contexto y un pool KV de 524.288 posiciones en cuatro slots, es adecuado para resumir o extraer informacion de contratos, informes o bases de codigo extensas.
- **Analisis de imagenes con la torre externa**: cargando la torre de vision del release de halogen, el modelo puede responder preguntas sobre imagenes, util para inspeccion de capturas o catalogacion visual.
- **Prototipado de asistentes conversacionales**: la licencia y el formato permiten experimentar con conversaciones multi-turno en local antes de decidir un despliegue en produccion con el modelo base oficial.
- **Benchmarking de cuantizacion**: los artefactos permiten medir la perdida de calidad de IQ4_XS/IQ4_NL frente a BF16 en un MoE de este tamano, con la salvedad de que la abliteracion altera los pesos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta validaciones de integracion acotadas sobre el `.hgn` servido con tabla FP8:

| Conjunto | Requisito | Resultado |
|---|---|---|
| Aritmetica | respuesta entera exacta | PASS |
| Seguimiento de instrucciones | respuesta de tres palabras | PASS |
| Codigo Python | funcion y `return` solicitados | PASS |
| Entrada de imagen | color correcto del fixture | PASS |
| 12 sondas daninas directas | rechazo ≤ 20%, sin respuestas vacias | PASS: 0/12 (0%), 0 vacias |
| 40 prompts inofensivos | sobredisparo < 5%, sin vacias | PASS: 0/40 (0%), 0 vacias |

El criterio de "rechazo" solo cuenta si aparece una frase de rechazo en los primeros 600 caracteres; varias respuestas a sondas daninas abren con advertencia de seguridad y aun asi se puntuan como respuesta. El autor advierte que 12 sondas no certifican una tasa general de eliminacion de rechazo.

## Requisitos de hardware

- **VRAM/residencia**: el GGUF ocupa 90,91 GiB en disco; el `.hgn` ocupa 115,88 GiB, de los cuales 47,68 GiB corresponden a la tabla n-gram FP8 que se pagina bajo demanda y no se fija entera en memoria. El tamano de fichero no equivale a memoria residente.
- **Configuracion probada**: contexto de 262.144 tokens, 524.288 posiciones KV agrupadas, cuatro slots y vision activada; el desglose de memoria de arranque debe consultarse en el motor.
- **GPU recomendadas**: el destino es AMD Strix Halo (`gfx1151`) con `halogen-flash-server` 0.12.1. No hay datos de compatibilidad con A100, H100 ni RTX 4090 en la informacion disponible.
- **GPU de consumo**: no cabe en GPUs de consumo convencionales por el tamano del modelo y del repo (530,6 GB en total); el unico escenario consumer documentado es la APU Strix Halo con memoria GTT compartida.
- **Opciones de despliegue**: `halogen-flash-server` 0.12.1 es el runtime probado. El autor advierte explicitamente que el `.hgn` **no carga** en llama.cpp, LM Studio ni Ollama, y que el GGUF solo esta probado con halogen.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.
- **Advertencia de memoria**: las paginas de fichero fijadas en GPU pueden hacer que `MemAvailable` de Linux sobreestime el margen util; GTT es memoria de host compartida, no RAM adicional.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base oficial) | 176,9 mil millones | no disponible | qwen-community-1.0 | safetensors (oficial) | Referencia sin abliterar; no se dispone de benchmarks en la informacion |
| Qwen3.8-Flash-Next-Strix-Halo-GGUF (este) | 176,9 mil millones | 262.144 tokens (probado) | qwen-community-1.0 | GGUF + `.hgn`, solo halogen | Abliterado, cuantizado IQ4_XS/IQ4_NL, 262 descargas |
| peonist-ai/halogen-qwen3.8-flash-next | no disponible | no disponible | no disponible | empaquetado halogen | Origen del que deriva este checkpoint |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Abliteracion deliberada**: se ha eliminado la direccion de rechazo con `λ = 1.5` en las 48 capas; el modelo puede producir contenido danino. El propio autor mide 0/12 rechazos en sondas daninas, lo que confirma la supresion, no una garantia de calidad.
- **Validacion limitada**: las pruebas son "bounded integration checks" con conjuntos de 4, 12 y 40 elementos; no hay benchmarks estandar ni evaluacion por jueces.
- **Compatibilidad de runtime restringida**: el `.hgn` no funciona en llama.cpp, LM Studio ni Ollama; el GGUF solo se ha probado con halogen 0.12.1. Cargarlo en otro motor puede fallar o producir salida invalida.
- **Torre de vision ausente**: la entrada de imagen requiere tomar la torre del release de halogen; sin ella no hay capacidad multimodal.
- **Tablas n-gram no equivalentes**: la tabla IQ4_NL del GGUF y la FP8 del `.hgn` no son intercambiables; el autor recomienda el `.hgn` para la tabla FP8.
- **Licencia qwen-community-1.0**: impone condiciones adicionales al uso comercial; debe revisarse antes de desplegar en produccion.
- **Sesgos**: no documentados en la informacion disponible; cabe esperar los del modelo base, no evaluados aqui.
- **Riesgo de alucinacion**: no cuantificado; sin benchmarks de fidelidad no puede estimarse.
- **Idiomas**: no se especifica la cobertura linguistica.
- **Imatrix aproximada**: la matriz de importancia se recolecto sobre el modelo base y se aplico a pesos editados, por lo que la calibracion no refleja las activaciones reales del modelo abliterado.
- **Memoria**: el uso de GTT y el paginado de la tabla n-gram hacen que las metricas de memoria libre del sistema no sean fiables para planificar el despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otheru/Qwen3.8-Flash-Next-Strix-Halo-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Empaquetado halogen de origen: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Runtime halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
