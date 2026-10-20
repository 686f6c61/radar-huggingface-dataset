# IsValorum/Thomson-1.0-Small-APEX-I-NanoPlus-GGUF

## Resumen

Thomson-1.0-Small-APEX-I-NanoPlus-GGUF es una cuantización de pesos del modelo Thomson-1.0-Small, publicado originalmente por Thomson Reuters, realizada por el usuario independiente IsValorum. No se trata de un modelo nuevo: es un artefacto GGUF de 12,6 GB que comprime los 34.660.610.688 parámetros (~34,7 B) del modelo base mediante un esquema de cuantización mixta por tensor, guiado por matriz de importancia (imatrix), denominado comercialmente APEX-I-NanoPlus. El objetivo es hacer viable la inferencia local de un modelo MoE de ~35 B en GPU de consumo y en CPU con llama.cpp.

La relevancia técnica está en el mapa de cuantización: en lugar de aplicar un único tipo de quant a todas las matrices, el autor asigna precisión en función de la función de cada tensor. Las 131 normalizaciones, los 80 routers de expertos y los 120 tensores de escala del estado recurrente SSM se mantienen en F32; la cabeza de salida en Q6_K; las proyecciones de atención completa en Q4_K/Q6_K; y solo las proyecciones de los expertos centrales bajan a IQ2_S, IQ2_XXS e IQ3_XXS. La envolvente declarada es de 12,55 GB.

El modelo base pertenece a una familia de arquitectura híbrida con etiqueta `qwen35moe`: 40 capas que combinan recurrencia DeltaNet, atención lineal y SSM con atención cuadrática completa cada cuatro capas (10 capas ancla), más 256 micro-expertos y expertos compartidos activos en todos los tokens. La información disponible no detalla el contexto nativo, el número de parámetros activos ni los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrida: recurrencia DeltaNet + atención lineal + SSM con atención completa periódica (40 capas; 10 capas ancla con atención cuadrática y 30 capas híbridas); 256 micro-expertos más expertos compartidos (`ffn_*_shexp`). Etiqueta de arquitectura: `qwen35moe` |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta por tensor: F32, Q8_0, Q6_K, Q4_K, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS (guiada por imatrix) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 12,6 GB; envolvente declarada de 12,55 GB) |

## Arquitectura y entrenamiento

El modelo base combina tres mecanismos de secuencia en la misma pila de 40 capas. La mayoría de capas usan atención lineal y recurrencia DeltaNet con componentes SSM (`ssm_alpha`, `ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_beta`, `ssm_out`), mientras que cada cuatro capas (índices 3, 7, 11 y sucesivos, hasta 10 capas ancla) se inserta atención cuadrática completa con proyecciones `attn_q/k/v` y `attn_output`. La capa de mezcla de expertos contiene 256 micro-expertos con routers por capa (`ffn_gate_inp`, `ffn_gate_inp_shexp`) y un conjunto de expertos compartidos que se aplica al 100 % de los tokens. El repositorio auditado contiene 733 tensores en total.

Sobre el entrenamiento no hay información en este repositorio: no se indican tokens vistos, composición del dataset, ni si hubo RLHF, DPO o una fase de razonamiento. La etiqueta `reasoning` sugiere que el modelo base fue ajustado para cadenas de razonamiento, pero no se aporta evidencia. Lo que sí está documentado es el proceso de cuantización: el autor declara haber calculado la imatrix y compilado los pesos en clústeres de GPU en la nube, con una política de precisión por componente (F32 para estabilidad numérica de normalizaciones, routers y estado recurrente; Q4_K para el backbone de expertos compartidos; IQ2_XXS para las proyecciones `up` de las capas MoE profundas 16-37, que es donde se concentra la mayor compresión).

## Capacidades

- Generación de texto conversacional y continuaciones largas, con `pipeline_tag: text-generation`.
- Razonamiento multi-paso: la model card etiqueta el modelo con `reasoning`, aunque no se documenta un modo de pensamiento explícito ni su formato.
- Capacidad matemática y de código preservada de forma deliberada: el mapa de cuantización protege las proyecciones `down` de los expertos centrales (capas 2-37) en IQ3_XXS para no degradar el flujo residual asociado a matemáticas y programación.
- Multilingüismo declarado en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Recuperación en contexto profundo: las 10 capas de atención completa se conservan en Q4_K/Q6_K como "anclas" para tareas de needle-in-a-haystack, según la justificación del autor.
- Compatibilidad con llama.cpp y con endpoints compatibles con la API de OpenAI (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, visión o audio: no disponibles; el repositorio solo declara texto.

## Casos de uso

- **Atención al cliente multilingüe en infraestructura propia**: al ocupar 12,6 GB, el modelo cabe en una única GPU de 16 GB o en una estación de trabajo con CPU y RAM abundante, lo que permite servir conversaciones en 13 idiomas sin depender de APIs externas ni enviar datos de clientes a terceros.
- **Procesamiento de documentación jurídica y financiera en local**: el modelo base procede de Thomson Reuters, proveedor de información jurídica y software profesional; este GGUF permite desplegar el modelo en entornos air-gapped donde la confidencialidad del expediente impide el uso de servicios en la nube.
- **Asistente de redacción y revisión en estaciones de trabajo de desarrolladores**: con `llama.cpp`, LM Studio u Ollama se puede cargar el modelo en una RTX 4090 o 4060 Ti de 16 GB y usarlo como autocompletado y reescritura dentro del IDE o del editor de documentación.
- **Prototipado e investigación con presupuesto limitado**: un equipo sin acceso a clústeres puede evaluar cualitativamente un MoE de ~35 B en hardware de consumo, algo inviable con los ~69 GB que ocuparían los pesos en BF16.
- **Investigación sobre cuantización**: el repositorio incluye `tensor-map.tsv` con los 733 tensores y su precisión asignada, lo que lo convierte en un caso de estudio para medir el impacto de esquemas mixtos IQ2/IQ3 frente a cuantizaciones uniformes Q4_K_M.
- **Generación de resúmenes y extracción de datos en pipelines por lotes**: al ser un MoE con expertos comprimidos, el coste por token es menor que el de un denso equivalente; se puede usar en procesos nocturnos de clasificación y resumen de corpus documentales.
- **Servidor compatible con OpenAI para herramientas internas**: la etiqueta `endpoints_compatible` permite sustituir una API comercial por un endpoint local en aplicaciones ya escritas contra el esquema `/v1/chat/completions`.
- **Evaluación comparativa de calidad de cuantizaciones**: útil para equipos que quieran contrastar la degradación de este esquema de 12,55 GB frente a cuantizaciones de mayor tamaño del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan comparaciones medidas contra el modelo base en BF16. Cualquier afirmación sobre la pérdida de calidad derivada de la cuantización IQ2/IQ3 sería especulativa.

## Requisitos de hardware

- **VRAM para descarga completa en GPU**: el archivo pesa 12,6 GB (envolvente declarada de 12,55 GB). A eso hay que sumar la caché KV, cuyo tamaño no puede calcularse porque se desconoce la longitud de contexto y la configuración de cabezas; como referencia práctica, reservar 14-16 GB para contextos moderados.
- **GPU de consumo**: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti de 16 GB, RTX 3090 (24 GB) y, con ajustes, en GPUs de 12 GB si se descargan parcialmente los tensores de expertos a RAM del sistema.
- **GPU de centro de datos**: A100 40/80 GB, H100, L40S y A6000 pueden alojar el modelo completo con contextos amplios; están sobredimensionadas para un archivo de 12,6 GB salvo que se necesite mucho paralelismo.
- **CPU y RAM**: al ser MoE con 256 micro-expertos, llama.cpp puede mantener los tensores compartidos y de atención en GPU y delegar los expertos a RAM. Conviene disponer de al menos 16 GB de RAM libre (32 GB recomendable) si se hace offload parcial.
- **Software de despliegue**: llama.cpp es el soporte de referencia; también LM Studio y Ollama (importando el GGUF). vLLM y TGI admiten GGUF con limitaciones y no garantizan compatibilidad con tipos IQ2_XXS/IQ3_XXS; conviene verificar la versión antes de plantear producción. Se requiere una versión reciente de llama.cpp para los tipos IQ2 e IQ3.
- **Latencia y throughput**: no disponibles. Dependen del número de parámetros activos, que no se ha publicado, y del reparto GPU/CPU elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Thomson-1.0-Small-APEX-I-NanoPlus GGUF (este repositorio) | 34,7 B totales; activos no disponibles | no disponible | GGUF, 12,6 GB | Apache 2.0 | Cuantización mixta agresiva (IQ2/IQ3 en expertos centrales); sin benchmarks publicados; 0 descargas |
| thomsonreuters/Thomson-1.0-Small (modelo base) | 34,66 B | no disponible | safetensors; ~69 GB estimados en BF16 (cálculo a partir del número de parámetros) | Apache 2.0 según los metadatos de este repositorio | Referencia de calidad; requiere hardware de centro de datos o cuantización previa |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- **Pérdida de calidad no medida**: las proyecciones `up` de las capas MoE 16-37 se comprimen a IQ2_XXS (2,06 bpw) y las `gate` centrales a IQ2_S (2,50 bpw). Son tasas muy agresivas y no hay ninguna evaluación que cuantifique la degradación frente al modelo base.
- **Ausencia de validación comunitaria**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no existen informes independientes de calidad.
- **Origen no oficial**: es una cuantización de un tercero, no publicada por Thomson Reuters. Para producción conviene validar el comportamiento contra el modelo original.
- **Cuantización no estándar**: el esquema APEX-I-NanoPlus es específico del autor y no coincide con las recetas tipo Q4_K_M o Q5_K_M. La reproducibilidad depende del `tensor-map.tsv` adjunto, no de una herramienta pública documentada.
- **Compatibilidad de software**: los tipos IQ2_XXS e IQ3_XXS exigen versiones recientes de llama.cpp; otras herramientas pueden no cargar el archivo o hacerlo con fallback incorrecto.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje y no mitigado por la cuantización; la cabeza de salida en Q6_K reduce errores de sintaxis, pero no garantiza veracidad factual.
- **Idiomas sin evaluación**: los 13 idiomas son una declaración heredada del modelo base. Es esperable un rendimiento inferior en tailandés, vietnamita y coreano, pero no hay datos que lo confirmen ni lo descarten.
- **Contexto desconocido**: sin la longitud de contexto del modelo base no se puede dimensionar la caché KV ni garantizar tareas de contexto largo, pese a la presencia de capas de atención completa.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero debe verificarse que el modelo base y los datos de entrenamiento no impongan restricciones adicionales no reflejadas en este repositorio.
- **Metadatos inconsistentes**: la fecha de creación indicada es 2026-10-19, posterior a la fecha habitual de consulta; conviene tratar las marcas temporales del repositorio con cautela.
- **Sesgos**: no hay información sobre la composición del corpus de entrenamiento, por lo que no se puede evaluar el sesgo lingüístico, cultural o de dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Mapa de tensores auditado (`tensor-map.tsv`): https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-NanoPlus-GGUF/blob/main/tensor-map.tsv
- Espacio de peticiones del autor: https://huggingface.co/spaces/IsValorum/MiniPlus-NanoPlus-Requests
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
- Paper, blog técnico o demo del modelo base: no disponible en la información proporcionada.
