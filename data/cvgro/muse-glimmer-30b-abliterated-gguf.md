# cvgro/Muse-Glimmer-30B-Abliterated-GGUF

## Resumen

Muse-Glimmer-30B-Abliterated-GGUF es una version cuantizada en formato GGUF del modelo Muse-Glimmer-30B de Meta Superintelligence Labs, un transformer denso de 27,85 mil millones de parametros disenado por Meta como modelo agentico "on-device" con capacidad multimodal (texto e imagen). La variante aqui descrita, publicada por el usuario cvgro (Blackfrost, Las Vegas), aplica una "abliteracion" sobre los pesos del modelo base: elimina la direccion de rechazo mediante una escritura residual in-place sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, sin tocar la torre de vision, las compuertas ni las normalizaciones.

El resultado es un modelo sin rechazos medidos (0 de 450 en la suite de evaluacion del autor) que se distribuye exclusivamente en GGUF para `llama.cpp`, con una escalera completa de cuantizaciones desde Q2_K (10,0 GB) hasta Q8_0 (27,6 GB). Esto permite ejecutarlo de forma local y completamente offline en una unica GPU de consumo o incluso en CPU. Mantiene la ventana de contexto original de 131.072 tokens e incluye soporte para decodificacion especulativa mediante un drafter DFlash propietario.

Su relevancia actual radica en dos factores: por un lado, es una de las primeras distribuciones locales de un modelo agentico multimodal de ~28B con licencia Apache-2.0; por otro, la abliteracion convierte al modelo en una herramienta sin filtros de rechazo, lo que lo hace atractivo para investigacion sobre alineacion, red-teaming y generacion de contenido sin restricciones, pero tambien conlleva riesgos evidentes de uso indebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer`: transformer denso, 52 capas, hidden size 6656, GQA (32 cabezas de consulta / 2 de clave-valor), sliding-window attention, con torre de vision adicional |
| Parametros totales | 27.854.794.240 (~27,85 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye proyectores `mmproj` y drafter `dflash` tambien en GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente, denominada `muse_glimmer`, es un transformer denso de 52 capas con tamano oculto de 6656 y atencion de consultas agrupadas (GQA) con una relacion de 32 cabezas de consulta por 2 de clave-valor, lo que reduce de forma notable el coste de la cache KV en contextos largos. Incorpora atencion de ventana deslizante y una torre de vision independiente que habilita la entrada de imagenes (pipeline `image-text-to-text`). La ventana de contexto es de 131.072 tokens.

Sobre el modelo base de Meta no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La unica transformacion documentada es la abliteracion: un cambio de pesos in-place mediante escritura residual sobre `attn.o_proj` y `mlp.down_proj`, con un coeficiente alpha de 1,5 y tres pasadas iterativas. El autor indica que la torre de vision, las compuertas y las normalizaciones quedan intactas. El modelo se distribuye con una plantilla de sistema de "AI assistant" ya integrada y admite control de profundidad de razonamiento mediante una linea de sistema (`Reasoning strength: low/medium/high/xhigh`).

## Capacidades

- Generacion de texto conversacional con canal de razonamiento separado: el proceso de pensamiento se devuelve en `reasoning_content` y la respuesta final en `content`.
- Razonamiento con profundidad ajustable mediante directiva de sistema (low, medium, high, xhigh).
- Entrada multimodal de imagen y texto (image-text-to-text) al cargar el proyector `mmproj` junto al quant de texto.
- Comportamiento agentico y orientado a tareas, segun la descripcion del modelo base de Meta.
- Decodificacion especulativa mediante drafter DFlash, con bloques de 15 tokens (entrenado con 16 y truncado a 15).
- Ejecucion totalmente local y offline en `llama.cpp`, tanto en GPU como en CPU.
- Ausencia de rechazos ante peticiones daninas segun la metrica del autor (0/450).
- Soporte explicito de tool calling / function calling: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local sin conexion: el modelo puede desplegarse en una unica GPU de 24 GB con Q4_K_M (15,8 GB) y operar sin acceso a red, adecuado para entornos con requisitos de privacidad estrictos o sin conectividad.
- Analisis de documentos e imagenes: combinando un quant de texto con el proyector `mmproj-Q8_0` (1,9 GB), permite extraer informacion de capturas, diagramas o fotografias junto con texto en una misma conversacion.
- Procesamiento de contexto largo: los 131.072 tokens de ventana permiten resumir o consultar repositorios completos de documentacion, expedientes extensos o transcripciones largas en una sola pasada.
- Flujos agenticos de multiples pasos: su orientacion agentica y el control de "reasoning strength" permiten ajustar el esfuerzo de razonamiento segun la complejidad de la tarea, reduciendo coste en tareas simples y aumentandolo en las complejas.
- Generacion de codigo asistida en local: con `llama-server` exponiendo una API compatible con OpenAI (gracias a `--jinja`), puede integrarse en editores o pipelines internos sin enviar codigo a servicios externos.
- Servicio de alto rendimiento en una sola GPU: activando el drafter DFlash se obtienen aproximadamente 73 tokens/s de decodificacion frente a 46 tokens/s en baseline sobre una RTX PRO 6000 Blackwell, con salida identica.
- Investigacion sobre alineacion y red-teaming: la version abliterada permite estudiar como se comporta el modelo sin la direccion de rechazo, util para auditar mecanismos de seguridad y evaluar robustez.
- Despliegue en hardware modesto: las cuantizaciones Q2_K (10,0 GB) y Q3_K_M (12,7 GB) permiten ejecucion en tarjetas de 12-16 GB o, en configuraciones reducidas, en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico conjunto de metricas aportado por el autor corresponde a la evaluacion de rechazos, medida sobre el modelo padre abliterado:

| Metrica | Resultado |
|---|---|
| Rechazo real (prompts daninos, n=300) | 0 / 300 = 0,0 % |
| Rechazo real (suite completa, n=450) | 0 / 450 = 0,0 % |
| Substring-harmful | 0 / 300 |
| Substring-all | 2 / 450 (falsos positivos del conjunto XSTest) |
| Errores | 0 |

Rendimiento de inferencia medido por el autor en 1x NVIDIA RTX PRO 6000 (Blackwell), cuantizacion Q8_0, con `-fa off`:

| Configuracion | Decodificacion (tok/s) | Aceleracion |
|---|---|---|
| Baseline | ~46 | 1,0x |
| Con DFlash | ~73 | 1,6x |

El autor indica que la aceleracion aumenta con `-fa on` y con salidas estructuradas o de codigo, y que Meta reporta hasta 3,1x en una RTX 5090.

## Requisitos de hardware

- VRAM estimada segun el tamano del archivo GGUF (a la que hay que sumar la cache KV asociada al contexto configurado):
  - Q2_K: 10,0 GB
  - Q3_K_S: 11,7 GB
  - Q3_K_M: 12,7 GB
  - Q4_K_S: 15,0 GB
  - Q4_K_M: 15,8 GB (configuracion por defecto recomendada)
  - Q5_K_S: 18,0 GB
  - Q5_K_M: 18,5 GB
  - Q6_K: 21,3 GB
  - Q8_0: 27,6 GB
- Componentes adicionales: el proyector de vision `mmproj` ocupa 3,6 GB en F16 o 1,9 GB en Q8_0; el drafter DFlash ocupa 4,8 GB en F16.
- GPU recomendadas: una RTX PRO 6000 Blackwell (configuracion medida por el autor) o cualquier GPU con 24 GB o mas para Q4_K_M; las cuantizaciones Q2_K a Q3_K_M caben en tarjetas de 12-16 GB. Los quants grandes (Q6_K, Q8_0) requieren 24-32 GB.
- Cabe en GPU de consumo: si, con Q4_K_M y superiores en tarjetas de 24 GB; con Q2_K a Q3_K_M en tarjetas de 12-16 GB.
- Opciones de despliegue: `llama-server` de `llama.cpp` (rama `master` reciente) es el unico soportado para DFlash. El drafter no funciona en `llama-cli` porque comparte el contexto del modelo objetivo. Tambien admite ejecucion en CPU.
- Parametros de servicio confirmados: `-ngl 999 -ngld 999 -fa on --jinja`, muestreo con `temperature 1.0, top_p 0.95, top_k 64`, `--spec-draft-n-max 15` y `max_tokens >= 1024` (con presupuestos menores la respuesta puede llegar vacia porque el canal de razonamiento los consume).
- Latencia y throughput: aproximadamente 46 tok/s en baseline y 73 tok/s con DFlash sobre RTX PRO 6000 Blackwell en Q8_0. No hay datos disponibles para otras GPU, cuantizaciones o longitudes de contexto.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa con terceros. La unica comparacion documentada es contra el modelo base sin abliterar:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-GGUF (este) | ~27,85 B | 131.072 | Si (torre de vision + `mmproj`) | Apache-2.0 | Abliterado, 0/450 rechazos, solo GGUF, distribuido por cvgro |
| Muse-Glimmer-30B (base) | ~27,85 B | 131.072 | Si | Apache-2.0 | Modelo original de Meta Superintelligence Labs, con direccion de rechazo intacta |
| Otras alternativas de ~30 B | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo abliterado: la direccion de rechazo ha sido eliminada de forma deliberada, por lo que no aplica filtros de seguridad ante peticiones daninas. Su uso en produccion orientada al publico exige capas de moderacion externas.
- Etiquetado explicitamente como EXPERIMENTAL por el autor, sin garantias de estabilidad ni de calidad frente al modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad o factualidad, por lo que el comportamiento en tareas de conocimiento factual es desconocido.
- Idioma: no se especifican los idiomas soportados, por lo que no hay garantia de calidad en castellano ni en otras lenguas distintas del ingles.
- Requisito de `max_tokens` alto: con presupuestos inferiores a 1024 tokens la respuesta puede devolverse vacia porque el razonamiento consume el presupuesto, un comportamiento problematico en integraciones con limites por defecto.
- Dependencia de software: requiere una version reciente de `llama.cpp` (rama `master`) y el drafter DFlash solo funciona bajo `llama-server`, no en `llama-cli`.
- Incompatibilidad potencial de flash attention en GPUs muy nuevas con toolkits CUDA antiguos, que puede provocar cuelgues al cargar.
- Licencia Apache-2.0: permite uso comercial, pero el autor declara no estar afiliado a Meta; conviene revisar las condiciones de uso del modelo base y el encaje de una version modificada con la politica de uso pretendida por el desarrollador original.
- Los datos de fecha del repositorio (creacion 2026-08-11, actualizacion 2026-10-04) y el volumen del repositorio (172,6 GB) deben tenerse en cuenta al planificar la descarga.
- Sin resultados de benchmarks estandar, la calidad de razonamiento, codigo y matematicas no puede evaluarse a partir de la documentacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cvgro/Muse-Glimmer-30B-Abliterated-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Perfil del autor: https://x.com/Blackfrost_AI
- Script de despliegue: `deploy/serve.sh` (dentro del repositorio de HuggingFace)
- Guia de despliegue: `deploy/DEPLOYMENT.md` (dentro del repositorio de HuggingFace)
