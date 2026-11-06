# sarpaydemir/hunkrisk-qwen3.5-2b-lora

## Resumen

hunkrisk-qwen3.5-2b-lora es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario sarpaydemir. Su funcion es especializada y acotada: recibe un unico hunk de diff junto con la ruta del fichero y decide si un revisor debe examinarlo con atencion antes de fusionarlo, clasificando el riesgo como `high` o `low`, nombrando las categorias afectadas (auth, money, schema, data, secrets) y aportando una frase de justificacion. El modelo base es multimodal (Qwen3.5), aunque el adaptador solo entrena proyecciones del modelo de lenguaje y deja el vision tower congelado y sin uso.

El interes practico del adaptador reside en su relacion coste/rendimiento: con solo 2B parametros en el modelo base y un adaptador de rango 16, alcanza un recall de 0.91 en la deteccion de hunks de alto riesgo sobre un conjunto de test de 300 hunks, con un coste estimado de 0.036 USD por cada 1000 hunks. Se posiciona como una alternativa barata a modelos frontera para triaje previo en pipelines de revision de codigo, con una latencia de 2.19 s por hunk en una RTX 3060 Laptop y 0.33 s en modo batched.

La relevancia actual del modelo es doble: por un lado, demuestra que un adaptador pequeno y especializado puede aproximarse a un modelo frontera en una tarea de clasificacion binaria con etiquetas derivadas de consenso entre modelos; por otro, su model card documenta de forma inusualmente transparente el proceso de validacion, el umbral de decision congelado antes del test y las limitaciones del resultado, incluyendo el margen estrecho respecto al liston de release pre-registrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.5-2B, transformer multimodal con capas de linear-attention; r = 16, alpha = 16, sin dropout |
| Parametros totales | No disponible (modelo base de 2B; el adaptador LoRA anade un subconjunto no cuantificado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el entrenamiento se hizo en 16-bit LoRA y la inferencia documentada en bf16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye aparte |
| Libreria | peft |
| Tamano del repo | 0.1 GB |
| Modelo base | Qwen/Qwen3.5-2B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atencion, linear-attention y MLP del modelo de lenguaje de Qwen3.5-2B. El vision tower del modelo base queda congelado y no se utiliza. Se entreno con LoRA de 16 bits (el autor cita que Unsloth desaconseja el entrenamiento en 4 bits sobre Qwen3.5) con r = 16, alpha = 16 y sin dropout. La optimizacion uso AdamW de 8 bits, learning rate de 2e-4 con decaimiento coseno y 3% de warmup, batch efectivo de 16, hasta 2 epocas y bf16, calculando la perdida solo sobre la respuesta. La seleccion de checkpoint se hizo por validation loss cada 40 pasos, con early stopping de paciencia 3.

El conjunto de entrenamiento consta de 5.735 hunks procedentes de 20 repositorios, etiquetados por el modelo profesor DeepSeek V4.1 Flash, con un 18% de casos `high`. La validacion se realizo sobre 300 hunks de otros cinco repositorios. El entrenamiento duro 718 pasos (dos epocas) en 62 minutos, y la validation loss seguia bajando al final (0.588), por lo que los pesos publicados corresponden al ultimo checkpoint. La evaluacion se ejecuto con los kernels de Unsloth, de modo que los resultados con transformers estandar pueden diferir en el segundo decimal.

## Capacidades

- Clasificacion binaria de riesgo de un hunk de diff (`high` / `low`) con un unico forward pass para obtener P(high), ya que `risk` es el primer campo de la respuesta.
- Etiquetado multicategoria de riesgo: auth, money, schema, data y secrets, con `["none"]` cuando el riesgo es bajo.
- Generacion de una justificacion en una frase sobre por que el hunk requiere revision.
- Salida en JSON valido con decodificacion sin restricciones (100% de validez reportada).
- Procesamiento de entrada compuesta por ruta de fichero y hunk de diff bajo un system prompt corto.
- Modo thinking desactivado (`enable_thinking=False`) para respuestas directas y economicas.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de tool calling, agentes, vision (el vision tower esta congelado) ni audio.

## Casos de uso

- Triaje previo en revision de codigo: el adaptador puntua cada hunk de un diff y marca los de riesgo alto para revision humana prioritaria, reduciendo el tiempo dedicado a hunks triviales. Con 0.91 de recall y 0.036 USD por 1000 hunks, es adecuado como primera etapa de un pipeline de CI.
- Integracion en CI/CD como gate de fusion: usando `git diff | uv run python -m hunkrisk.predict`, se puede bloquear o etiquetar automaticamente un pull request cuando aparecen hunks de categoria auth, money o secrets antes de que lleguen a main.
- Deteccion de cambios en controles de autorizacion: el ejemplo de la model card identifica la eliminacion de una comprobacion de propietario en un controlador de facturas, un patron clasico de regresion de seguridad que el modelo reconoce y explica en una frase.
- Revision de cambios en esquemas y migraciones: la categoria `schema` permite senalar modificaciones de base de datos que requieren atencion de un DBA o de un revisor senior antes de desplegar.
- Auditoria de cambios en logica monetaria: la categoria `money` ayuda a aislar hunks que tocan calculos de importes, impuestos o facturacion, donde un error silencioso tiene coste economico directo.
- Prevencion de filtracion de secretos: la categoria `secrets` marca hunks que introducen credenciales, claves o tokens en el codigo, como capa adicional a los escaneres estaticos.
- Clasificacion por lotes de historicos de repositorios: el modo batched a 0.33 s por hunk permite reetiquetar retroactivamente miles de hunks de un monorepo para construir dashboards de riesgo por modulo o por equipo.

## Benchmarks y rendimiento

Evaluacion sobre 300 hunks de test de cinco repositorios no vistos (56 `high`). La clave de respuestas es el acuerdo de dos modelos frontera, con un tercero resolviendo los 23 hunks en disputa.

| Sistema | Recall | Precision | F1 | Coste / 1000 hunks |
|---|---|---|---|---|
| Este adaptador, P(high) >= 0.148 | 0.91 | 0.55 | 0.69 | 0.036 USD |
| Este adaptador, su propia respuesta | 0.64 | 0.77 | 0.70 | 0.036 USD |
| Kimi K3.1 Pro (techo) | 0.91 | 0.66 | 0.77 | 1.19 USD |
| DeepSeek V4.1 Flash (profesor) | 0.79 | 0.85 | 0.81 | 0.025 USD |
| Heuristica de palabras clave y rutas | 0.73 | 0.35 | 0.48 | 0 USD |

Datos adicionales reportados:

- Umbral de 0.148: el mas alto que alcanza 0.90 de recall en validacion, congelado antes del test.
- Ranking en validacion: average precision 0.82 y ROC AUC 0.95 para `high`, sobre 300 hunks de otros cinco repositorios.
- Validez de formato: 100% de JSON valido con decodificacion sin restricciones.
- Latencia: 2.19 s por hunk en una RTX 3060 Laptop de uno en uno, 0.33 s en batched; aproximadamente 41 s en CPU (Ryzen 7 5800H, bf16) por la caida de las capas de linear-attention a la implementacion de referencia de PyTorch sin GPU.
- Coste calculado como tiempo de GPU batched a un precio asumido de 0.40 USD por hora de GPU.
- Liston de release pre-registrado: cumplido por poco. Recall 0.91 (51 de 56 hunks `high`), 33 veces mas barato que el techo y F1 7.8 puntos por debajo del techo, donde el liston permite 10. El recall queda un hunk por encima de la linea; si los 23 hunks en disputa los hubiera resuelto uno de los dos jueces, podria haber sido 0.89. En esos hunks el adaptador y el techo cometen el mismo numero de errores; en los otros 277 la diferencia de F1 es de 10.4 puntos.

## Requisitos de hardware

- Inferencia en bf16: el adaptador y el modelo base de 2B caben en GPUs de consumo; la model card reporta ejecucion en una RTX 3060 Laptop GPU.
- VRAM estimada: no disponible de forma explicita en la model card; por el tamano del modelo base (2B en bf16) es del orden de pocos GB, pero no se aporta una cifra concreta.
- GPU recomendadas: RTX 3060 Laptop (verificada por el autor); para despliegue en produccion se puede asumir cualquier GPU consumer o de datacenter con suficiente VRAM, aunque no se documentan modelos concretos.
- CPU: funciona, pero con una penalizacion severa (aproximadamente 41 s por hunk en un Ryzen 7 5800H en bf16) porque las capas de linear-attention caen a la implementacion de referencia de PyTorch.
- Opciones de despliegue: transformers + peft (documentado en la model card); el autor menciona kernels de Unsloth para la evaluacion. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2.19 s por hunk en RTX 3060 Laptop de uno en uno; 0.33 s por hunk en batched.
- Nota de integracion: es necesario cargar el modelo base con `AutoModelForImageTextToText`, no con `AutoModelForCausalLM`, porque este ultimo construye una variante solo-texto con nombres de modulo distintos y el adaptador no se adjuntaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall | Precision | F1 | Coste / 1000 hunks | Licencia |
|---|---|---|---|---|---|---|---|
| hunkrisk-qwen3.5-2b-lora | 2B (base) + LoRA | No disponible | 0.91 (umbral) / 0.64 (propia) | 0.55 / 0.77 | 0.69 / 0.70 | 0.036 USD | Apache 2.0 |
| Kimi K3.1 Pro (techo de referencia) | No disponible | No disponible | 0.91 | 0.66 | 0.77 | 1.19 USD | No disponible |
| DeepSeek V4.1 Flash (profesor) | No disponible | No disponible | 0.79 | 0.85 | 0.81 | 0.025 USD | No disponible |
| Heuristica de palabras clave y rutas | No aplica | No aplica | 0.73 | 0.35 | 0.48 | 0 USD | No aplica |

No se dispone de datos de otros adaptadores LoRA comparables para esta tarea en la informacion proporcionada.

## Limitaciones y advertencias

- El margen de cumplimiento del liston de release es estrecho: el recall de 0.91 queda un hunk por encima de la linea, y con una resolucion distinta de los 23 hunks en disputa podria haber bajado a 0.89.
- La clave de respuestas no es ground truth humano, sino el acuerdo entre dos modelos frontera con un tercero como arbitro; los errores del jurado se propagan a las metricas.
- La seleccion del umbral (0.148) se hizo sobre validacion y se congelo antes del test, pero el conjunto de test es de solo 300 hunks con 56 positivos, lo que implica intervalos de confianza amplios.
- El modelo solo soporta ingles; no se documenta comportamiento en otros idiomas.
- La validation loss seguia descendiendo al final del entrenamiento (0.588); los pesos publicados son el ultimo checkpoint, no necesariamente el optimo.
- El adaptador esta entrenado sobre etiquetas de un unico profesor (DeepSeek V4.1 Flash), lo que puede introducir sesgos sistematicos del profesor en las categorias y en los criterios de riesgo.
- La evaluacion se ejecuto con kernels de Unsloth; los resultados con transformers estandar pueden diferir en el segundo decimal.
- El rendimiento en CPU es muy pobre (aproximadamente 41 s por hunk) por la falta de kernels optimizados para linear-attention; no es viable para produccion sin GPU.
- Es imprescindible cargar el modelo base con `AutoModelForImageTextToText`; usar `AutoModelForCausalLM` hace que el adaptador falle silenciosamente al adjuntarse.
- El modelo es un clasificador de triaje, no un revisor: no detecta todos los tipos de riesgo (la lista de categorias es cerrada) y su justificacion es una sola frase, insuficiente como analisis de seguridad.
- Licencia Apache 2.0 en el adaptador; el modelo base Qwen/Qwen3.5-2B tiene su propia licencia, que debe verificarse por separado para uso comercial.
- El repositorio tiene 28 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarpaydemir/hunkrisk-qwen3.5-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto (codigo, pipeline de datos y evaluacion): https://github.com/sarpaydemir/hunkrisk
- Pagina de resultados: https://github.com/sarpaydemir/hunkrisk/blob/main/reports/results.md
- Liston de release pre-registrado: https://github.com/sarpaydemir/hunkrisk/blob/main/docs/release-bar.md
