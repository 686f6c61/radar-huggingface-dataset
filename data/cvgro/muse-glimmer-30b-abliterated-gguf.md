# cvgro/Muse-Glimmer-30B-Abliterated-GGUF

## Resumen

Muse-Glimmer-30B-Abliterated-GGUF es una cuantizacion GGUF del modelo Muse Glimmer 30B de Meta Superintelligence Labs, publicada por el usuario cvgro (Blackfrost). El modelo base es un transformer denso de 30B parametros (27.854.794.240 parametros reales segun safetensors) con capacidad multimodal image-text-to-text, orientado a uso agentico y despliegue on-device. Esta version concreta aplica una transformacion de "abliteration": una modificacion in-place de pesos (residual-write sobre `attn.o_proj` y `mlp.down_proj`, con alpha=1.5 y 3 pasadas iterativas) que elimina la direccion de rechazo del modelo base, dejando intactos la torre de vision, las compuertas y las normalizaciones.

Su relevancia practica esta en el empaquetado: la escalera completa de cuantizaciones GGUF (de Q2_K a Q8_0) permite ejecutar un modelo de 30B con contexto de 131.072 tokens en una sola GPU de consumo o incluso en CPU mediante llama.cpp, de forma totalmente offline. Ademas incluye soporte de decodificacion especulativa mediante un drafter DFlash propio, con una aceleracion medida de aproximadamente 1.6x en decodificacion.

La ficha describe tanto las caracteristicas tecnicas del artefacto GGUF como las implicaciones de la abliteracion, un cambio que altera el comportamiento de seguridad del modelo original y que debe tenerse en cuenta antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — transformer denso, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, torre de vision |
| Parametros totales | 27.854.794.240 (aprox. 30B nominales) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores mmproj y drafter DFlash en GGUF F16/Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 52 capas con dimensionality oculta de 6656 y atencion GQA con 32 cabezas de query y 2 de key/value, lo que reduce el coste de memoria del KV cache en contextos largos. Emplea sliding-window attention y anade una torre de vision que se carga por separado mediante proyectores `mmproj`, lo que permite entrada de imagen junto a texto. El pipeline declarado es `image-text-to-text`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. La transformacion aplicada en esta publicacion es exclusivamente la abliteracion: un cambio de pesos in-place sobre las proyecciones de salida de atencion y de bajada del MLP, con alpha=1.5 y tres pasadas iterativas, que segun el autor elimina la direccion de rechazo sin tocar vision, compuertas ni normalizaciones. La innovacion tecnica destacable del paquete es el drafter DFlash para decodificacion especulativa, entrenado con tamano de bloque 16 y limitado a 15 en inferencia (`--spec-draft-n-max 15`), que comparte el contexto del modelo objetivo y solo funciona bajo `llama-server`.

## Capacidades

- Generacion de texto y razonamiento con canal de pensamiento separado: la respuesta llega en `content` y el razonamiento en `reasoning_content`.
- Control de profundidad de razonamiento mediante linea de sistema `Reasoning strength: low/medium/high/xhigh`.
- Entrada multimodal de imagen y texto mediante proyectores `mmproj` (F16 de 3.6 GB o Q8_0 de 1.9 GB).
- Capacidades agenticas declaradas por el modelo base (tag `agentic`), orientadas a flujos multi-paso.
- Decodificacion especulativa con drafter DFlash, con salida identica al modelo sin drafter y hasta 1.6x de aceleracion medida.
- Ejecucion local offline en una sola GPU o en CPU mediante llama.cpp.
- Plantilla de sistema "AI assistant" incluida por defecto (`--jinja`).
- Comportamiento de rechazo eliminado: 0 rechazos verdaderos sobre 450 prompts en el benchmark del autor.

## Casos de uso

- Asistente local offline con contexto largo: con 131.072 tokens de ventana y cuantizacion Q4_K_M (15.8 GB), puede mantener conversaciones multi-turno extensas o procesar documentos largos en una estacion de trabajo sin conexion a servicios externos.
- Procesamiento de documentos con imagenes: cargando el proyector `mmproj` Q8_0 (1.9 GB) junto a un quant de texto, el modelo puede extraer y razonar sobre contenido de capturas, formularios escaneados o diagramas en un pipeline local.
- Generacion de codigo en entornos aislados: el formato GGUF y llama.cpp permiten integrarlo en entornos sin acceso a red, util para equipos con requisitos de confidencialidad que necesitan asistencia de codigo sin enviar datos a terceros.
- Investigacion sobre alineacion y seguridad: la abliteracion con 0/450 rechazos medidos lo convierte en un artefacto de estudio para analizar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, siempre en entornos controlados.
- Despliegue en hardware de consumo: con Q4_K_S (15.0 GB) cabe en GPUs de 16 GB y con Q2_K (10.0 GB) en configuraciones mas ajustadas, permitiendo prototipado de agentes en equipos de sobremesa.
- Servicio de inferencia con throughput mejorado: usando `llama-server` con el drafter DFlash se obtienen aproximadamente 73 tok/s de decodificacion en una RTX PRO 6000 frente a 46 tok/s sin drafter, adecuado para servir a varios usuarios en un nodo unico.
- Evaluacion de razonamiento multi-paso: el canal `reasoning_content` y los niveles de esfuerzo permiten comparar calidad y coste computacional segun la profundidad de razonamiento configurada.

## Benchmarks y rendimiento

El autor publica un benchmark de rechazos sobre el modelo padre abliterado (los quants GGUF heredan el comportamiento):

| Metrica | Resultado |
|---|---|
| Rechazo verdadero (danino, n=300) | 0 / 300 = 0.0% |
| Rechazo verdadero (suite completa, n=450) | 0 / 450 = 0.0% |
| Substring-harmful | 0 / 300 |
| Substring-all | 2 / 450 (falsos positivos XSTest) |
| Errores | 0 |

Rendimiento de inferencia medido en 1x NVIDIA RTX PRO 6000 (Blackwell), Q8_0, `-fa off`:

| Configuracion | Decodificacion (tok/s) | Aceleracion |
|---|---|---|
| Baseline | ~46 | 1.0x |
| Con DFlash | ~73 | 1.6x |

El autor indica que la aceleracion aumenta con `-fa on` y con salida estructurada o de codigo, y cita hasta 3.1x reportado por Meta en una RTX 5090. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K 10.0 GB, Q3_K_S 11.7 GB, Q3_K_M 12.7 GB, Q4_K_S 15.0 GB, Q4_K_M 15.8 GB, Q5_K_S 18.0 GB, Q5_K_M 18.5 GB, Q6_K 21.3 GB, Q8_0 27.6 GB.
- Extras opcionales: proyector de vision mmproj F16 3.6 GB o Q8_0 1.9 GB; drafter DFlash F16 4.8 GB.
- GPU recomendadas: RTX PRO 6000 (Blackwell) para Q8_0 con margen; GPUs de 24 GB para Q4_K_M como configuracion por defecto; GPUs de 16 GB para Q4_K_S; para Q5 y superiores se recomienda 24 GB o mas.
- Cabe en GPU de consumo: si, desde Q2_K (10.0 GB) en adelante; Q4_K_M (15.8 GB) encaja en tarjetas de 24 GB y Q4_K_S en tarjetas de 16 GB.
- Despliegue: llama.cpp `master` con `llama-server`; requiere `--jinja`. El drafter DFlash solo funciona en `llama-server` (no en `llama-cli`) porque comparte el contexto del modelo objetivo. Existe un kit de un solo comando en `deploy/serve.sh`.
- Parametros de muestreo confirmados: temperature 1.0, top_p 0.95, top_k 64; `max_tokens` >= 1024 obligatorio, ya que presupuestos menores devuelven `content` vacio porque el canal de razonamiento los consume.
- Latencia y throughput: aproximadamente 46 tok/s en baseline y 73 tok/s con DFlash en RTX PRO 6000 con Q8_0 y `-fa off`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato local | Notas |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated (esta ficha) | ~27.9B | 131.072 | Si (mmproj) | apache-2.0 | GGUF (Q2_K–Q8_0) | Abliterado, 0/450 rechazos, drafter DFlash |
| meta-models/Muse-Glimmer-30B (base) | ~27.9B | 131.072 | Si | apache-2.0 | safetensors (original) | Modelo de referencia sin abliterar |
| Alternativas de ~30B denso con vision | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks de calidad que permitan una comparacion cuantitativa con modelos de la misma categoria; la comparativa se limita al modelo base y a las caracteristicas del artefacto GGUF.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo: el autor reporta 0 rechazos verdaderos sobre 450 prompts. Esto implica que el modelo puede generar contenido danino o inapropiado sin filtros aprendidos, lo que lo hace inadecuado para aplicaciones orientadas al publico sin capas de seguridad externas.
- Modelo marcado como EXPERIMENTAL por el autor; no debe asumirse estabilidad de comportamiento en produccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un modelo con canal de razonamiento, el consumo de tokens puede agotar presupuestos cortos y devolver respuestas vacias.
- Requiere `max_tokens` >= 1024; configuraciones menores producen `content` vacio de forma sistematica.
- El drafter DFlash solo funciona bajo `llama-server` y con llama.cpp reciente (`master`); no es compatible con `llama-cli`.
- `-fa on` puede colgar la carga en GPUs muy recientes con toolkits CUDA antiguos; en ese caso debe usarse `-fa off`.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue fuera del ingles sin evaluacion propia.
- La licencia apache-2.0 del artefacto no elimina las obligaciones de responsabilidad sobre el uso; el autor declara no estar afiliado a Meta.
- El modelo base es de Meta Superintelligence Labs; conviene verificar los terminos del modelo original antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cvgro/Muse-Glimmer-30B-Abliterated-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Perfil del autor en X: https://x.com/Blackfrost_AI
- Guia de despliegue incluida en el repo: `deploy/DEPLOYMENT.md`
- Script de servicio incluido en el repo: `deploy/serve.sh`
