# kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-base

## Resumen

El modelo `kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-base` es un artefacto de investigacion publicado en HuggingFace por el usuario `kdkyum`. No es un modelo de proposito general: se trata de un conjunto de nueve ejecuciones de entrenamiento de un GPT de estilo GPT-NeoX, de tamano pequeno (d_model 768, 12 capas, 12 cabezas de 64 dimensiones, MLP ReLU de 85,2 M de parametros), entrenado especificamente para resolver una tarea sintetica de razonamiento relacional de dos saltos ("two-hop") sobre un grafo de nombres y familias.

El corpus de entrenamiento es `c5_m16_N90/base_graph`, con 16 nombres propios y 90 familias, y las muestras son documentos completos de 1.997 tokens perdidos desde un token `<bos>`. El interes del repositorio es metodologico: compara el efecto del weight decay (valores 1, 3 y 5) sobre la precision de dos saltos en un regimen sin dropout y con un schedule coseno de 100.000 pasos, con tres semillas por configuracion. Es, por tanto, material de estudio sobre generalizacion composicional, sobreajuste y estabilidad del entrenamiento, mas que un modelo desplegable en producto.

La relevancia actual es la de un banco de pruebas reproducible y abierto (licencia MIT) para estudiar como la regularizacion y la semilla afectan a una capacidad composicional concreta. Todos los checkpoints se guardan cada 10.000 pasos en formato compatible con `GPTNeoXForCausalLM` y `from_pretrained`, junto con `config.json`, `vocab.json` y `log.jsonl` de cada ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de estilo GPT-NeoX (`GPTNeoXForCausalLM`), 12 capas, d_model 768, 12 cabezas de 64 dimensiones, MLP ReLU, LayerNorm, biases lineales, rotary embeddings en toda la dimension de cabeza con base 100.000 |
| Parametros totales | No declarado de forma explicita; la model card indica 85,2 M de parametros en el MLP ReLU. Estimacion a partir de la configuracion publicada: en torno a 113 M en los bloques transformer, mas los embeddings (el total exacto depende del vocabulario, que no se detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada; las secuencias de entrenamiento son filas de documento completo de 1.997 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos en el formato original, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el entrenamiento usa un vocabulario sintetico de nombres y familias, no lenguaje natural general |
| Licencia | MIT |
| Formato de pesos | safetensors, organizados por ejecucion (`<run>/ckpt_<step>/`), con `config.json`, `vocab.json` y `log.jsonl` por run |

Informacion adicional del repositorio: 30,7 GB de tamano total, 0 descargas y 0 likes en el momento de la consulta; fecha de creacion 2026-10-14.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de estilo GPT-NeoX: 12 capas con d_model 768 y 12 cabezas de atencion de 64 dimensiones cada una, LayerNorm, embeddings rotatorios (RoPE) aplicados en toda la dimension de cabeza con base 100.000, inicializacion "neox" con desviacion estandar 0,02, biases en las capas lineales y un MLP con activacion ReLU de 85,2 M de parametros. La tokenizacion trata cada punto (".") como un token `<bos>` y anade un token `<pad>` separado, lo que convierte cada documento en una secuencia de oraciones delimitadas por `<bos>`.

Los datos proceden del conjunto sintetico `c5_m16_N90/base_graph` (16 nombres, 90 familias), con filas de documento completo de 1.997 tokens y perdida calculada sobre todos los tokens. El entrenamiento usa AdamW (beta2 0,95, eps 1e-8), learning rate 3e-4 con 500 pasos de warmup y decaimiento coseno hasta 0 en 100.000 pasos, gradient clipping con norma 1 y weight decay aplicado unicamente a matrices de pesos y embeddings. No se aplica dropout en atencion, MLP ni representaciones ocultas. El diseno experimental cruza tres valores de weight decay (1, 3 y 5) con tres semillas (41, 42 y 43), lo que da las nueve ejecuciones publicadas. La evaluacion se ejecuta cada 250 pasos, por lo que el mejor paso suele caer entre checkpoints guardados. No se menciona ningun proceso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva restringida al dominio sintetico del corpus de entrenamiento (nombres y familias del conjunto `base_graph`).
- Razonamiento relacional de dos saltos: el modelo esta entrenado y evaluado especificamente para responder consultas que requieren componer dos relaciones sobre un grafo, con precision maxima observada de 0,9959 en la mejor ejecucion.
- Modelado de lenguaje causal en documentos completos de 1.997 tokens con perdida sobre todos los tokens.
- Capacidad de servir como linea base reproducible para estudiar generalizacion composicional y sobreajuste.
- No dispone de soporte declarado de tool calling ni de function calling.
- No dispone de soporte declarado de agentes ni de razonamiento multi-paso fuera de la tarea de dos saltos.
- Capacidades multilingues: no disponibles; el vocabulario es sintetico y no se documenta cobertura de idiomas naturales.
- Modos especiales (thinking mode, vision, audio, decodificacion especulativa): no disponibles.
- No es un modelo ajustado por instrucciones: no sigue ordenes ni mantiene conversaciones.

## Casos de uso

- Estudio de circuitos de dos saltos e interpretabilidad: los checkpoints cada 10.000 pasos permiten analizar en que momento del entrenamiento emerge la capacidad de composicion relacional y como cambia la precision entre el paso 4.000 y el 100.000.
- Reproducibilidad de experimentos de regularizacion: la rejilla de weight decay (1, 3, 5) por semilla (41, 42, 43) permite medir la varianza entre inicializaciones y aislar el efecto de la regularizacion sin dropout.
- Analisis de sobreajuste y transiciones de fase: en varias ejecuciones la precision maxima se alcanza a mitad del entrenamiento (por ejemplo, 0,9899 en el paso 31.750 con weight decay 1 y semilla 43) y decae hasta el paso 100.000, lo que convierte estos logs en material ideal para estudiar degradacion tardia.
- Banco de pruebas de infraestructura de inferencia: al ser un `GPTNeoXForCausalLM` estandar, sirve para validar cargas con `from_pretrained`, servidores compatibles con NeoX y pipelines de evaluacion sobre pesos safetensors.
- Generacion de datos sinteticos controlados: el vocabulario cerrado de 16 nombres y 90 familias permite generar pares pregunta-respuesta verificables de forma automatica para experimentos de composicion.
- Comparacion de escalas y arquitecturas: al estar parametrizado por d_model y numero de cabezas, es una pieza util en estudios de escalado de modelos pequenos entrenados desde cero sobre la misma tarea.
- Investigacion sobre semillas y estabilidad: la dispersion observada (0,9009 frente a 0,9959 como maximos con la misma familia de hiperparametros) es un caso practico para cuantificar la sensibilidad a la semilla en tareas composicionales.
- Docencia y practicas de entrenamiento: el coste computacional reducido permite reproducir el ciclo completo de entrenamiento y evaluacion en laboratorios academicos.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado es la precision de dos saltos sobre el conjunto de retencion (held-out), medida cada 250 pasos. Se reproduce a continuacion tal como aparece en la model card (fecha de los datos: 2026-10-15 00:36 CEST):

| weight decay | semilla | pasos entrenados | precision maxima de dos saltos (paso) | primer paso >= 0,99 | ultima precision de dos saltos | ultimo checkpoint |
|---|---|---|---|---|---|---|
| 1 | 41 | 100.000 | 0,9679 (82.000) | - | 0,9424 | 100.000 |
| 1 | 42 | 100.000 | 0,9791 (41.000) | - | 0,9289 | 100.000 |
| 1 | 43 | 100.000 | 0,9899 (31.750) | - | 0,9207 | 100.000 |
| 3 | 41 | 100.000 | 0,9920 (84.000) | 84.000 | 0,9785 | 100.000 |
| 3 | 42 | 100.000 | 0,9916 (77.000) | 77.000 | 0,9657 | 100.000 |
| 3 | 43 | 100.000 | 0,9009 (4.000) | - | 0,8660 | 100.000 |
| 5 | 41 | 100.000 | 0,9770 (78.000) | - | 0,9193 | 100.000 |
| 5 | 42 | 100.000 | 0,9959 (79.500) | 75.500 | 0,9402 | 100.000 |
| 5 | 43 | 100.000 | 0,9087 (5.000) | - | 0,8534 | 100.000 |

Observaciones derivadas de la propia tabla: el weight decay 3 con las semillas 41 y 42 es la unica configuracion que supera de forma sostenida el umbral de 0,99; las semillas 43 rinden de forma marcadamente inferior en las tres configuraciones; y en la mayoria de ejecuciones la precision final a 100.000 pasos es inferior a la maxima intermedia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de este orden de magnitud (en torno a 113 M de parametros en los bloques transformer, mas embeddings), la inferencia en fp32 requiere del orden de 0,5 GB de pesos y en fp16/bf16 en torno a 0,25 GB, a lo que hay que sumar activaciones y cache KV.
- El repositorio completo ocupa 30,7 GB porque almacena nueve ejecuciones con checkpoints cada 10.000 pasos, no porque el modelo sea grande; para inferencia solo hay que descargar un unico `ckpt_<step>/`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4070 o superior cubre el modelo con margen amplio; tambien cabe en GPUs de portatil con 8 GB de VRAM e incluso en CPU para pruebas puntuales.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar las nueve ejecuciones en paralelo.
- Opciones de despliegue: carga directa con `transformers` (`GPTNeoXForCausalLM.from_pretrained`), servidores compatibles con la arquitectura NeoX como TGI o vLLM. El uso de llama.cpp u Ollama requeriria una conversion a GGUF que el autor no ha publicado.
- Latencia y throughput estimados: no disponibles; la model card no incluye mediciones de velocidad.

## Comparativa con modelos similares

No hay datos de benchmarks comparables, ya que la metrica publicada (precision de dos saltos sobre un grafo sintetico) es especifica de esta tarea y no se reporta para otros modelos. La comparacion siguiente es solo estructural y de disponibilidad:

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| two-hop-gpt-d768-nh12-drop0-cos100k-base | ~85,2 M en el MLP ReLU (total no declarado) | No declarado; secuencias de 1.997 tokens | Razonamiento relacional de dos saltos sobre datos sinteticos | MIT | Pesos safetensors por checkpoint en HuggingFace |
| GPT-2 small (referencia de tamano similar) | 124 M | 1.024 tokens | Modelado de lenguaje general | Licencia MIT modificada | Ampliamente disponible |
| Pythia-160M (referencia de tamano similar) | 160 M | 2.048 tokens | Modelado de lenguaje general con suite de estudios de escalado | Apache 2.0 | Ampliamente disponible |

Nota: los dos modelos de referencia no han sido evaluados en la tarea de dos saltos, por lo que no procede establecer una comparacion de rendimiento. Para cualquier metrica estandar de lenguaje, el resultado de este modelo es "no disponible" y no se debe asumir que sea competitivo, dado que su entrenamiento se limita a un corpus sintetico cerrado.

## Limitaciones y advertencias

- No es un modelo de proposito general: no ha sido ajustado por instrucciones ni con RLHF/DPO, por lo que no mantiene conversaciones ni sigue ordenes.
- Vocabulario y dominio cerrados: 16 nombres y 90 familias. Cualquier entrada fuera de ese dominio carece de garantias y probablemente produzca salidas degeneradas.
- Riesgo alto de alucinacion fuera de la distribucion de entrenamiento; incluso dentro de ella, las precisiones maximas oscilan entre 0,9009 y 0,9959 segun configuracion y semilla.
- Alta sensibilidad a la semilla: con weight decay 5, la semilla 42 alcanza 0,9959 y la semilla 43 se queda en 0,9087. No se debe extrapolar el rendimiento de una unica ejecucion.
- Degradacion tardia: en ocho de las nueve ejecuciones la precision final a 100.000 pasos es inferior a la maxima intermedia, de modo que usar el "ultimo checkpoint" por defecto puede no ser la mejor opcion.
- No hay informacion publicada sobre sesgos sociales, toxicidad ni comportamiento en idiomas naturales; no se puede afirmar que el modelo sea seguro en esos ejes.
- Limitaciones de contexto no documentadas: no se declara una longitud de contexto oficial, solo documentos de 1.997 tokens durante el entrenamiento.
- Restricciones de licencia: la licencia es MIT, que permite uso comercial, pero el unico uso razonable del modelo es la investigacion; no existe ninguna garantia de idoneidad para produccion.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos que dependan de esos formatos.
- Advertencia practica: el repositorio pesa 30,7 GB. Conviene descargar solo el directorio del checkpoint deseado para evitar transferencias innecesarias.
- No se documentan los pasos exactos de mejor rendimiento en terminos de checkpoint guardado; la evaluacion cada 250 pasos implica que el optimo suele caer entre checkpoints.
- No hay pipeline declarado en HuggingFace para este repositorio, por lo que la carga debe hacerse de forma explicita con la clase correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-base
- Proyecto de Weights & Biases citado en la model card: `gpt-two-hop-d768-trainpy` (no se proporciona URL directa en la informacion disponible)
- Script de entrenamiento citado: `/two-hop-gpt/train.py` (alojado en Dropbox segun la model card; no se proporciona enlace publico)
- Dataset citado: `c5_m16_N90/base_graph` (no se proporciona enlace publico en la informacion disponible)
- Repositorios, papers o demos adicionales: no disponible. Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con este modelo ni con su tematica, por lo que se descartan.
