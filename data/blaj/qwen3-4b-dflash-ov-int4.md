# blaj/Qwen3-4B-DFlash-ov-int4

## Resumen

`blaj/Qwen3-4B-DFlash-ov-int4` es una conversion a OpenVINO IR del modelo denso Qwen/Qwen3-4B, publicada por el usuario blaj con pesos cuantizados a int4 asimetrico (group size 128) y con metadatos de localizacion de estados ocultos exportados. El objetivo de esa anotacion es permitir que el modelo actue como *target* de decodificacion especulativa DFlash, consumido por un drafter externo (z-lab/Qwen3-4B-DFlash-b16). Sin esos metadatos, el runtime no encuentra las activaciones intermedias que el drafter necesita y cae silenciosamente a decodificacion normal.

El modelo conserva la arquitectura original Qwen3ForCausalLM: 36 capas de decoder y dimension oculta de 2560, con aproximadamente 4.000 millones de parametros. La exportacion anota las 36 capas en el campo `hidden_states_decoder_layers` del RT info, incluidas las cinco que lee el drafter (1, 9, 17, 25 y 33). La anotacion no modifica la interfaz publica de entrada/salida del grafo.

Su relevancia es practica y acotada: es una pieza de infraestructura para desplegar Qwen3-4B en hardware Intel (CPU o GPU Arc integrada/discreta) mediante OpenVINO Model Server, con un peso en disco de 2,3 GB. El autor publica ademas una medicion honesta que contradice la intuicion habitual: sobre una Arc 130V/140V integrada, el drafter int4 resulta mas lento que la decodificacion directa (28,6 frente a 38,8 tokens/s), con salida greedy identica byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso), 36 capas, hidden size 2560 |
| Parametros totales | aproximadamente 4.000 millones (modelo base Qwen/Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-4B soporta 32.768 tokens nativos (dato del modelo base, no verificado en esta conversion) |
| Tipos de cuantizacion | int4 asimetrico, group size 128, ratio 1.0 (etapa previa en fp16 durante la exportacion) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen3 es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml + binario de pesos), stateful; no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 2,3 GB |
| Libreria | openvino |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B |
| Herramientas de conversion | transformers 5.5.0, optimum-intel 2.2.0, nncf |

## Arquitectura y entrenamiento

La ficha no aporta informacion sobre el entrenamiento: no se indican tokens de preentrenamiento, composicion del dataset ni fases de RLHF o DPO. Todos esos datos corresponden al modelo original Qwen/Qwen3-4B, desarrollado por Alibaba Qwen, y no se reproducen aqui porque la model card de esta conversion no los detalla.

Lo que si se documenta con precision es el proceso de conversion en dos etapas. Primero se exporta el modelo con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`, lo que genera un grafo stateful con cache de clave/valor gestionada internamente. Despues se aplica `nncf.compress_weights(..., INT4_ASYM, group_size=128, ratio=1.0)` para reducir los pesos a 4 bits. La innovacion concreta de esta publicacion es que los localizadores de estados ocultos se verifican y se anotan **despues** de la compresion, no antes: la anotacion se guarda en el RT info del grafo como `hidden_states_decoder_layers`, con las 36 capas del decoder listadas. Esto habilita el modo de decodificacion especulativa DFlash, en el que un drafter ligero propone bloques de tokens y el target los verifica reutilizando sus estados intermedios. El autor advierte que los localizadores resuelven contra este grafo exacto, de modo que una reexportacion los invalida.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada de Qwen3-4B.
- Razonamiento explicito: Qwen3 es un modelo de razonamiento que emite `reasoning_content` antes de `content`, por lo que el modelo produce una traza de pensamiento separada de la respuesta visible.
- Generacion de codigo y resolucion de problemas matematicos de complejidad media, dentro de lo esperable en un modelo denso de 4.000 millones de parametros.
- Decodificacion especulativa como target DFlash: expone los estados ocultos de las capas 1, 9, 17, 25 y 33 para que un drafter compatible los consuma.
- Ejecucion stateful con cache de clave/valor gestionada por el propio grafo de OpenVINO, lo que simplifica el bucle de generacion en el servidor.
- Soporte multilingue: no confirmado en la model card; depende del modelo base.
- Tool calling, function calling y comportamiento agentico: no documentado en la informacion disponible. Qwen3-4B original soporta plantillas de tool calling, pero esta conversion no lo verifica ni lo menciona.
- Vision o audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Inferencia local en portatiles con Intel Core Ultra: el modelo ocupa 2,3 GB en disco y se ejecuta sobre la GPU integrada Arc 130V/140V, lo que permite asistentes de texto offline sin GPU dedicada. El autor reporta 38,8 tokens/s en ese hardware con decodificacion greedy y 128 tokens nuevos.
- Servicio de generacion de texto con OpenVINO Model Server: el bloque de configuracion proporcionado (`target_device: GPU`, `nireq: 8`, `PERFORMANCE_HINT: THROUGHPUT`, `NUM_STREAMS: 2`) esta pensado para despliegues con concurrencia moderada en servidores con aceleradores Intel.
- Investigacion en decodificacion especulativa: es un banco de pruebas reproducible para medir si DFlash compensa en un target pequeno. La conclusion publicada (0,74x respecto a la linea base) es util como punto de partida para experimentos con targets mayores o GPUs mas lentas.
- Verificacion de integridad de conversiones OpenVINO: el fragmento de codigo que lee `hidden_states_decoder_layers` del RT info sirve como prueba de humo para validar que una exportacion conserva los metadatos necesarios y que el runtime no esta ignorando el drafter en silencio.
- Generacion de codigo asistida en entornos con hardware Intel y sin acceso a GPU NVIDIA, siempre que se acepte el techo de calidad de un modelo de 4.000 millones de parametros.
- Procesamiento por lotes de texto en CPU: al ser un IR de OpenVINO, se puede ejecutar en granjas de CPU Xeon sin GPU, con la penalizacion de latencia correspondiente.
- Base para *fine-tuning* o adaptadores posteriores: al ser Apache-2.0 y derivar de Qwen3-4B, el grafo puede reutilizarse en pipelines internos de destilacion o evaluacion comparativa frente a otros formatos del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es la medicion de throughput del autor:

Intel Core Ultra 7 258V (GPU integrada Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificacion greedy, 128 tokens nuevos como maximo, media de 4 ejecuciones.

| Configuracion | tok/s | Respecto a la linea base |
|---|---|---|
| Este target, sin drafter | 38,8 | 1,00x |
| Este target + drafter DFlash int4 | 28,6 | 0,74x |

El autor senala que la salida greedy fue identica byte a byte con y sin drafter, lo que confirma que el emparejamiento es correcto y que la perdida de velocidad se debe al coste fijo por bloque del drafter, que no se amortiza cuando el forward pass del target ya es barato.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 2,3-3 GB en int4 (el repositorio completo pesa 2,3 GB).
- Memoria para la cache KV: con 8 cabezas de clave/valor por capa, 36 capas, dimension de cabeza 128 y precision fp16, la cache consume unos 144 KiB por token, es decir, alrededor de 1,2 GB a 8.000 tokens de contexto y 4,6 GB a 32.768 tokens. Estas cifras son estimaciones derivadas de la geometria del modelo base, no mediciones publicadas.
- GPU recomendadas: el caso medido es una Intel Arc 130V/140V integrada. Cualquier GPU Intel Arc (integrada o discreta) es el objetivo natural del plugin GPU de OpenVINO. No hay datos publicados para A100, H100 o RTX 4090, y OpenVINO no acelera GPUs NVIDIA a traves de su plugin GPU estandar.
- CPU: el IR es ejecutable en CPU Intel, aunque sin cifras de throughput publicadas; se espera bastante menos de 38,8 tokens/s.
- Cabe en GPU de consumo: si, en cualquier GPU Intel Arc con al menos 4-6 GB de memoria compartida o dedicada, y en equipos con memoria unificada. En GPUs NVIDIA de consumo no es la via de despliegue prevista.
- Opciones de despliegue: OpenVINO Model Server (OVMS) con `target_device: GPU` o CPU; openvino-genai para Python; conversion y validacion con optimum-intel y nncf. No hay soporte GGUF ni llama.cpp ni Ollama para este repositorio.
- Emparejamiento con drafter: para activar DFlash hay que anadir `draft_models_path` a un `graph.pbtxt` en el directorio del modelo, apuntando a la carpeta del drafter; el log debe mostrar `Draft model strategy: DFlash`.
- Latencia y throughput: 38,8 tokens/s sin drafter y 28,6 tokens/s con drafter en la configuracion medida (greedy, 128 tokens, media de 4 ejecuciones).
- Requisito de compatibilidad: el drafter debe tener `target_layer_ids` coherentes con la geometria de capas de este target.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| blaj/Qwen3-4B-DFlash-ov-int4 | ~4.000 M | no especificado (base: 32.768 tokens) | OpenVINO IR, int4 asimetrico group-128 | 38,8 tok/s en Core Ultra 7 258V (medido por el autor) | apache-2.0 |
| Qwen/Qwen3-4B (original) | ~4.000 M | 32.768 tokens nativos, ampliable a 131.072 con YaRN segun el modelo base | safetensors en BF16 | no disponible en la informacion proporcionada | apache-2.0 |
| z-lab/Qwen3-4B-DFlash-b16 (drafter) | no disponible | no disponible | no disponible | no disponible | no disponible |
| blaj/Qwen3-DFlash-drafters-ov | no disponible | no disponible | OpenVINO IR int4 (drafter preconvertido) | no disponible | no disponible |
| Conversiones GGUF int4 equivalentes de Qwen3-4B para llama.cpp | ~4.000 M | 32.768 tokens nativos | GGUF Q4 | no disponible en la informacion proporcionada | apache-2.0 |

La comparacion relevante no es de calidad, sino de formato y de ecosistema: frente al Qwen3-4B original en safetensors BF16 (mayor huella de memoria, requiere transformers o vLLM), esta conversion prioriza el despliegue en hardware Intel con un consumo de disco de 2,3 GB y anotaciones especificas para decodificacion especulativa.

## Limitaciones y advertencias

- El emparejamiento con el drafter es mas lento que la decodificacion directa en el hardware medido (28,6 frente a 38,8 tokens/s). Activar DFlash sin medir puede degradar el throughput en lugar de mejorarlo.
- Requiere un target cuya geometria de capas coincida con los `target_layer_ids` del drafter; un desajuste impide el emparejamiento.
- Los localizadores de estados ocultos resuelven contra este grafo exacto: cualquier reexportacion o reconversion los invalida y el runtime volveria a decodificacion normal sin emitir error.
- Qwen3 es un modelo de razonamiento que emite `reasoning_content` antes de `content`. Si no se presupuesta un `max_tokens` suficiente, la respuesta visible puede quedar vacia porque todo el presupuesto se consume en la traza de razonamiento.
- Es un modelo de aproximadamente 4.000 millones de parametros: la calidad en razonamiento complejo, matematicas avanzadas y codigo de produccion es inferior a la de modelos densos mayores o MoE de mayor tamano activo.
- Riesgo de alucinacion propio de un modelo de esta escala, agravado por la cuantizacion a int4, que puede introducir degradaciones adicionales de calidad no cuantificadas en la model card.
- No hay evaluacion publicada de sesgos, de comportamiento multilingue ni de robustez frente a entradas adversarias para esta conversion concreta.
- Idiomas soportados no documentados: aunque el modelo base es multilingue, la model card no especifica cobertura ni calidad por idioma.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.
- La anotacion de estados ocultos no cambia la interfaz publica de entrada/salida, de modo que un fallo de emparejamiento con el drafter no se manifiesta como error, sino como una perdida silenciosa de la aceleracion esperada.
- Dependencia de versiones concretas del ecosistema (transformers 5.5.0, optimum-intel 2.2.0, OVMS 2026.4.0) que pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3-4B-DFlash-ov-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Drafter DFlash compatible: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- Drafters preconvertidos a OpenVINO: https://huggingface.co/blaj/Qwen3-DFlash-drafters-ov
- La busqueda web realizada no devolvio resultados tecnicos relevantes: los unicos enlaces recuperados eran articulos turisticos sobre la ciudad de Auckland, sin relacion alguna con el modelo. No se dispone por tanto de papers, blogs ni repositorios adicionales verificables.
