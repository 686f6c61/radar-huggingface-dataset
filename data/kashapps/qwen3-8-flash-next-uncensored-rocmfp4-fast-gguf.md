# Kashapps/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF es una cuantizacion GGUF publicada por Kashapps a partir de los pesos BF16 abliterados de `orcarouter/Qwen3.8-Flash-Next-Uncensored`, derivados a su vez del modelo base `Qwen/Qwen3.8-Flash-Next`. El repositorio contiene una unica receta de cuantizacion, `Q4_0_ROCMFP4_FAST`, con 4,27 bits por peso y un tamano de 87,94 GiB, disenada para ejecutarse en GPUs integradas AMD con arquitectura gfx1151 (Ryzen AI Max+ 395, "Strix Halo") a traves del fork ROCmFPX de llama.cpp. El modelo subyacente es un transformer disperso de tipo MoE con 176.943.899.520 parametros totales y una ventana de contexto nativa de 262.144 tokens.

Su relevancia practica esta en que demuestra inferencia local de un modelo de casi 177.000 millones de parametros en una maquina de 128 GB de memoria unificada, sin GPU discreta: 22,75 tok/s de generacion y 387,3 tok/s de procesamiento de prompt con offload completo 49/49 y 63,3 GiB residentes. Ademas, la publicacion incluye el parche `qwen4exp-on-rocmfpx-d3ca537.patch` (156 KB, 25 ficheros) que combina la arquitectura `qwen4exp` con los tipos de tensor ROCmFP4 en un mismo arbol de llama.cpp, algo que ninguna de las dos ramas upstream ofrecia por separado.

Se trata explicitamente de un artefacto de investigacion: el comportamiento de rechazo ha sido eliminado mediante abliteration, lo que no anade capacidad al modelo, solo retira las barreras de seguridad. El repositorio es muy reciente (creado el 14 de septiembre de 2026), no tiene descargas ni valoraciones, y requiere un binario compilado a medida: llama.cpp estandar no carga estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados, experto compartido y tabla de embeddings por capa (PLE); arquitectura declarada como `qwen4exp` en el fork de llama.cpp |
| Parametros totales | 176.943.899.520 (~176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (maximo nativo declarado) |
| Tipos de cuantizacion | Una sola en el repositorio: `Q4_0_ROCMFP4_FAST` (4,27 bpw, 87,94 GiB). ROCmFP4 (`TYPE_101`) en atencion, expertos MoE (`ffn_*_exps`), experto compartido (`ffn_*_shexp`), `token_embd.weight` y `per_layer_token_embd.weight`; `output.weight` (lm head) en `Q6_K` |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada en HuggingFace como `other` / `license:other`) |
| Formato de pesos | GGUF (unico fichero, con soporte de split); requiere binario con tipos ROCmFP4 y arquitectura `qwen4exp` |
| Tamano del repositorio | 95,3 GB |
| Modelo base | `orcarouter/Qwen3.8-Flash-Next-Uncensored` (abliterado) y `Qwen/Qwen3.8-Flash-Next` |
| Libreria declarada | gguf / llama.cpp |
| Decodificacion especulativa | `--spec-type ngram-mod` en ROCm; no usar en Vulkan/gfx1151 |
| Descargas / likes | 0 / 0 (a fecha de creacion del repositorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso con mezcla de expertos y experto compartido, al que se suma una tabla de embeddings por capa (`per_layer_token_embd.weight`, PLE) de 51,2 B de parametros que se mantiene en ROCmFP4 en esta cuantizacion. El fork necesario para cargarlo introduce ficheros propios como `src/models/qwen4exp.cpp`, `conversion/qwen4exp.py` y `src/llama-memory-hybrid-idx.{cpp,h}`, este ultimo descrito como la clase de memoria propia del indexador QSA, lo que apunta a un esquema de atencion hibrida con indexacion y cache separada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La cadena de transformacion consta de tres pasos documentados: abliteration sobre el modelo base para eliminar el comportamiento de rechazo (trabajo de `orcarouter`, no del publicador de esta cuantizacion), conversion a BF16 GGUF y cuantizacion a ROCmFP4. La receta reserva el lm head en `Q6_K` de forma deliberada, porque cada token muestreado pasa por el, de modo que su error de cuantizacion impacta directamente en el argmax; la verificacion se hizo por nombre exacto de tensor, ya que `output.weight` es subcadena de `attn_output.weight`. El autor indica que el tamano coincide con su build alineado de la misma gama con una desviacion de 0,01 GiB, lo que sugiere que el checkpoint abliterado es estructuralmente identico al original.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Procesamiento de contextos muy largos: maximo nativo de 262.144 tokens, con ejecucion verificada a 131.072 y 262.144 tokens de ventana.
- Comportamiento sin rechazo (uncensored) por abliteration del checkpoint base; utilizable como artefacto de investigacion sobre alineacion y direcciones de rechazo.
- Compatibilidad con decodificacion especulativa mediante `ngram-mod` en ROCm por debajo de 64K de contexto.
- Inferencia exclusivamente local con offload completo en GPU integrada gfx1151, sin necesidad de API externa.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponible (HuggingFace no declara idiomas para este repositorio).
- Vision, audio u otras modalidades: no documentado; el repositorio se limita a generacion de texto.
- Modo de razonamiento explicito (thinking): no documentado en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion extensa en local: con 262.144 tokens de contexto nativo y 307 tok/s de procesamiento de prompt en el tramo alto, se pueden cargar contratos, expedientes o bases de conocimiento completas sin trocear y sin enviar datos a terceros.
- Investigacion sobre alineacion y abliteration: el modelo permite contrastar el comportamiento del checkpoint abliterado frente al base en las mismas tareas, aislando el efecto de la eliminacion de la direccion de rechazo sin cambiar la arquitectura.
- Generacion de texto sintetico para conjuntos de datos de investigacion: su condicion de artefacto sin guardrails es adecuada para producir datos en dominios donde los modelos alineados se niegan sistematicamente, siempre dentro de un contexto controlado y con revision posterior.
- Asistente conversacional de uso interno en una unica maquina: el modelo cabe completo en 63,3 GiB de memoria residente de un Ryzen AI Max+ 395 de 128 GB, lo que permite desplegar un asistente local sin GPU discreta ni coste de API.
- Evaluacion y depuracion de kernels ROCmFP4 en gfx1151: el repositorio incluye el parche y las instrucciones de compilacion verificadas, por lo que sirve como banco de pruebas reproducible para medir cuantizacion de 4 bits sobre RDNA 3.5 integrado.
- Prototipado de aplicaciones de contexto largo con presupuesto de hardware ajustado: los datos medidos (69,1 GiB de GTT a 128K y 72,0 GiB a 262K) permiten dimensionar despliegues en equipos de 128 GB antes de invertir en infraestructura mayor.
- Extraccion y resumen de informes tecnicos o cientificos: el modelo puede procesar documentos completos y devolver sintesis, comparativas o tablas, con la ventaja de que el corpus nunca sale del equipo.
- Chat de desarrollo y analisis de repositorios: con contextos de decenas de miles de tokens cabe buena parte de un arbol de codigo, aunque no hay datos publicados de rendimiento especifico en generacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparativas estandar). Los unicos datos cuantitativos son mediciones de rendimiento de inferencia publicadas por el autor para Ryzen AI Max+ 395 (gfx1151), ROCm 7.2.4, offload completo 49/49:

| Metrica | Valor |
|---|---|
| Generacion (prompt fijo de 6.963 tokens) | 22,75 tok/s |
| Procesamiento de prompt | 387,3 tok/s |
| Memoria GPU residente | 63,3 GiB |
| Metodo de medida | Prompt fijo reutilizado, `cache_prompt: false`, primera ejecucion descartada como calentamiento, mediana de 4 muestras; dispersion de 1,6 tok/s |

Rendimiento en contexto largo:

| Contexto | Tokens de prompt | pp tok/s | gen tok/s | GTT |
|---|---|---|---|---|
| 131.072 | 111.411 | 196 | 15,22 | 69,1 GiB |
| 262.144 | 8.000 | 307 | 22,48 | 72,0 GiB |

## Requisitos de hardware

- Memoria: 63,3 GiB residentes en GPU con offload completo en el caso base; 69,1 GiB de GTT con 131.072 tokens de contexto y 72,0 GiB con 262.144. El autor ejecuta sobre un equipo de 128 GB, por lo que se necesita memoria unificada amplia.
- GPU objetivo: AMD Radeon integrada con arquitectura gfx1151 (Ryzen AI Max+ 395). El binario se compila con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`.
- GPU discretas (A100, H100, RTX 4090): no hay soporte documentado para los tipos de tensor ROCmFP4 fuera de gfx1151; no se pueden dar cifras de VRAM fiables para esas plataformas.
- GPU de consumo: el modelo no cabe en GPUs de consumo con 24 GB ni 48 GB de VRAM; su viabilidad pasa por memoria unificada de 128 GB o por despliegues multi-GPU no documentados.
- Almacenamiento: 95,3 GB de repositorio, mas el espacio temporal necesario durante la conversion y el split.
- Despliegue: exclusivamente `llama-server` compilado desde `kingjones30/ROCmFPX` (fork de `charlie12345/ROCmFPX` en la rama `main`) o aplicando el parche `qwen4exp-on-rocmfpx-d3ca537.patch` sobre `charlie12345/ROCmFPX` en el commit `d3ca537`. No compatible con llama.cpp estandar, ni con vLLM, Ollama o TGI segun la informacion disponible.
- Nota de rendimiento: no se publican velocidades con offload parcial; el autor indica que no las mide.
- Aviso operativo: `--spec-type ngram-mod` funciona a 32K pero puede bloquear la cola SDMA a partir de 64K por desincronizacion del indexador QSA con las caches KV; la solucion documentada es arrancar con `-ctxcp 0 -cpent -1`, y no usar ngram-mod en Vulkan/gfx1151.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Kashapps, ROCmFP4 FAST GGUF) | 176,9 B | 262.144 nativo | GGUF ROCmFP4 + lm head Q6_K, 87,94 GiB, 4,27 bpw | qwen-community-1.0 | Requiere fork ROCmFPX compilado para gfx1151 |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored` (BF16) | 176,9 B | no disponible | BF16 | no disponible en la informacion proporcionada | HuggingFace |
| `Qwen/Qwen3.8-Flash-Next` (base original) | 176,9 B | no disponible | BF16 / safetensors | qwen-community-1.0 | HuggingFace |
| Alternativas de otros fabricantes (Llama, Mistral, DeepSeek de ~170 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks comunes que permitan comparar el rendimiento real de esta cuantizacion frente al checkpoint BF16 sin cuantizar ni frente al modelo base sin abliterar.

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo ha sido eliminado. No aumenta la capacidad del modelo, solo retira las barreras de seguridad. Requiere supervision humana y un contexto de uso justificado.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion para esta cuantizacion, y la cuantizacion a 4 bits puede degradar la precision respecto al BF16 original.
- Ruptura de compatibilidad: no carga en llama.cpp estandar. Sin el fork con `qwen4exp` y los tipos ROCmFP4, el fichero es inutilizable.
- Fallo conocido de hardware: la combinacion de `ngram-mod` con contexto de 64K o superior provoca bloqueos de la cola SDMA que requieren apagado fisico del equipo. Se documenta un workaround mediante flags, pero la solucion real (serializar `mem_idx`) no esta disponible.
- Dependencia de plataforma: los datos de rendimiento y la receta estan atados a gfx1151 con ROCm 7.2.4. No hay cifras para otras GPU ni para Vulkan.
- Idiomas: HuggingFace no declara idiomas soportados; no se puede confirmar calidad multilingue.
- Licencia: `qwen-community-1.0` (etiquetada como `other`), una licencia de comunidad con condiciones especificas. Es imprescindible revisar sus clausulas antes de cualquier uso comercial; el repositorio no ofrece garantias.
- Trazabilidad: la model card reproduce texto y enlaces de la familia publicada por `kingjones777` (incluido el parche y las mediciones), mientras el repositorio figura bajo la cuenta `Kashapps`. Conviene verificar la procedencia exacta del fichero antes de desplegarlo.
- Madurez: 0 descargas y 0 valoraciones en el momento de la consulta; no hay validacion independiente de la cuantizacion ni del comportamiento del checkpoint abliterado.
- Datos incompletos: se desconoce el numero de parametros activos, el regimen de entrenamiento (RLHF/DPO), la composicion del dataset y los idiomas soportados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kashapps/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork de llama.cpp con soporte ROCmFP4 y `qwen4exp`: https://github.com/kingjones30/ROCmFPX
- Runtime upstream con tipos ROCmFP4: https://github.com/charlie12345/ROCmFPX
- Parche de combinacion `qwen4exp-on-rocmfpx-d3ca537.patch` (156 KB, 25 ficheros), distribuido en el repositorio del autor
- Informe de campo sobre el bloqueo de SDMA con ngram-mod a partir de 64K: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF/discussions/6
- Repositorio hermano de la misma familia (gama STRIX_LEAN): https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF
- Busqueda web: no se encontraron resultados relevantes sobre este modelo. Las unicas coincidencias devueltas correspondian a dominios institucionales sin relacion tecnica con el modelo (gosi.gov.sa) y se han descartado. No se localizaron papers, blogs ni demos adicionales.
