# amazon/strands-decider-2B-qwen3.5-v1-2610

## Resumen

strands-decider-2B-qwen3.5-v1-2610 es un modelo de decisión de pequeno tamano desarrollado por Amazon, disenado especificamente para tareas de clasificacion y seleccion dentro de flujos de trabajo agenticos. A diferencia de un LLM generativo convencional, este modelo no produce texto libre: elige entre conjuntos de opciones y puntua elementos en una escala, y cada respuesta incorpora una confianza calibrada. Se construye como un adaptador LoRA sobre Qwen/Qwen3.5-2B-Base, con una cabeza de lectura (readout head) que puntua las opciones de una pregunta tipada (por ejemplo, `noul` para preguntas si/no o `choice` para seleccion entre N opciones).

La version v1 introduce mejoras sustanciales respecto a su predecesor hobson-v21: una mezcla de datos equilibrada de 246.678 filas (aproximadamente el doble que v21), que incorpora tareas de codigo y nuevas filas de aplicacion de reglas, ademas de eliminar 20.000 filas de datasets cuyos terminos restringen el uso comercial. Tambien emplea un teacher de mayor tamano (google/gemma-4-31B-it) cuyas distribuciones de salida se usan como objetivos de entrenamiento cuando su respuesta coincide con la etiqueta gold, y ancla el entrenamiento a las respuestas del modelo v19 mediante un termino KL con peso 0.3.

El checkpoint publica la media de tres ejecuciones de entrenamiento (semillas 0, 1 y 2), lo que reduce la varianza del resultado final. Con 2B parametros y licencia Apache 2.0, esta pensado para decisiones rutinarias dentro de agentes hibridos: enrutamiento de modelos, seleccion de herramientas, verificacion de argumentos, triaje, guardarrailes y evaluaciones, dejando las decisiones dificiles a un LLM de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3.5-2B-Base con cabeza de lectura para decisiones tipadas |
| Parametros totales | 2B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Servido a 4096 tokens en la evaluacion JevBench (w4096); contexto maximo del base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | strands-decider |
| Tamano del repositorio | 0.2 GB |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Tipo de relacion | adapter |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA (PEFT) sobre el transformer Qwen3.5-2B-Base, complementado con una cabeza de lectura que puntua las opciones de una pregunta tipada. La salida no es texto generativo sino una seleccion entre opciones con una confianza calibrada asociada. El pipeline declarado es `text-classification` y la libreria propia es `strands-decider`.

El entrenamiento utiliza una mezcla balanceada de 246.678 filas proveniente de mas de 45 datasets publicos, entre ellos tareas de clasificacion (GLUE, SST-5, 20 Newsgroups, Banking77, CLINC OOS), NLI (SNLI, DocNLI, UNLI), QA (SQuAD v2, HotpotQA, PubMedQA, MedMCQA), codigo (CommitPackFT, CodeContests), function calling (Glaive, Hermes), preferencias (HH-RLHF, HelpSteer, HelpSteer2, HelpSteer3, OASST2), seguridad y moderacion (Civil Comments, Measuring Hate Speech), dominios legales (CUAD-QA, MAUD, LexGLUE) y financieros (Consumer Finance Complaints). Destaca la incorporacion de filas de aplicacion de reglas (aplicar una politica escrita a un caso) y de tareas de codigo respecto a v21. Se emplean las distribuciones de salida de google/gemma-4-31B-it como objetivos de destilacion cuando coinciden con la etiqueta gold, y un termino KL (peso 0.3) que mantiene las respuestas cercanas al modelo v19. El checkpoint final es la media de tres ejecuciones con semillas 0, 1 y 2.

## Capacidades

- Clasificacion de texto y seleccion entre opciones tipadas con confianza calibrada.
- Preguntas de tipo `noul` (si/no) y `choice` (una entre N opciones).
- Enrutamiento de modelos y seleccion de herramientas dentro de agentes.
- Verificacion de argumentos y validacion de llamadas a funciones.
- Triaje y guardarrailes (moderacion, deteccion de contenido danino).
- Aplicacion de reglas y politicas escritas a casos concretos.
- Tareas de razonamiento multi-hop (evaluado en HotpotQA y MuSiQue).
- Tareas de codigo (entrenado con CommitPackFT y CodeContests).
- Function calling (entrenado con Glaive y Hermes function calling).
- Evaluaciones automatizadas como juez o clasificador de calidad (adecuacion, HelpSteer2).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de modelos en un agente hibrido: el modelo decide, entre un conjunto de LLMs disponibles, cual debe atender cada consulta, con una confianza calibrada que permite derivar los casos inciertos al LLM de mayor capacidad.
- Seleccion de herramientas en pipelines agenticos: dado un conjunto de herramientas disponibles y una peticion del usuario, el modelo elige la herramienta adecuada y valida los argumentos antes de ejecutar la llamada.
- Guardarrailes y moderacion: clasifica entradas de usuario como seguras o no seguras, apoyandose en el entrenamiento con Civil Comments y Measuring Hate Speech, y en la calibracion para fijar umbrales de bloqueo.
- Triaje de tickets y correos: clasifica consultas entrantes en categorias (por ejemplo, Banking77 o CLINC OOS) y detecta peticiones fuera de dominio para redirigirlas.
- Aplicacion de politicas y contratos: aplica reglas escritas a casos concretos, con entrenamiento especifico en CUAD-QA, MAUD y ContractNLI, util para revision documental automatizada.
- Evaluacion automatizada de respuestas: actua como juez de adecuacion (evaluado en `adequacy_hs2` y `gen:adequacy`) para puntuar salidas de otros modelos en pipelines de evaluacion continua.
- Clasificacion de codigo y commits: con entrenamiento en CommitPackFT y CodeContests, puede etiquetar cambios de codigo o decidir si un parche requiere revision adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Evaluacion | Metrica | Valor | Muestra |
|---|---|---|---|
| JevBench public (servido a 4096) | accuracy | 0.7792 | 180/231 |
| Held-out short tasks | accuracy | 0.653 | n=6000 |
| Boardgame | accuracy | 0.810 | n=900 |
| ContractNLI | accuracy | 0.878 | n=1026 |
| HotpotQA (held out) | accuracy | 0.832 | n=959 |
| MuSiQue | accuracy | 0.882 | n=1199 |
| MuSiQue, answerable | accuracy | 0.876 | n=599 |
| MuSiQue, unanswerable | accuracy | 0.887 | n=600 |
| Adequacy HelpSteer2 | accuracy | 0.709 | n=234 |
| Gen: adequacy | accuracy | 0.828 | n=302 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0.2 GB; el modelo base Qwen3.5-2B en precision completa requiere aproximadamente 4-5 GB, y en cuantizacion de 8 bits o 4 bits puede reducirse a rangos de 2-3 GB (estimacion orientativa, no confirmada en la informacion disponible).
- GPU recomendadas: al ser un modelo de 2B, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; para despliegue en servidor, A100 o H100 ofrecen margen sobrado para lotes grandes.
- Cabe en GPU de consumo: si, con cuantizacion o en precision media en GPUs con 8 GB o mas.
- Opciones de despliegue: al ser un adaptador PEFT sobre Qwen3.5-2B-Base, puede servirse con vLLM, TGI o llama.cpp tras fusionar el adaptador con el base y convertir a GGUF; la libreria strands-decider es la via nativa declarada por el autor. No se confirman integraciones especificas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (modelos de decision para agentes con salida tipada y confianza calibrada). Los modelos de clasificacion tradicionales (por ejemplo, encoders tipo BERT) no ofrecen el mismo formato de decision tipada ni calibracion integrada, pero no se aportan datos de rendimiento comparativo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610 | 2B (base) + adaptador | 4096 (servido) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un LLM generativo: no produce texto libre, solo selecciona entre opciones y puntua con confianza; no debe usarse para generacion abierta.
- Los benchmarks declarados no estan verificados de forma independiente (`verified: false` en el model-index).
- La calibracion de la confianza puede degradarse fuera de la distribucion de entrenamiento; conviene validar umbrales en el dominio de produccion.
- Riesgo de alucinacion reducido respecto a un LLM, pero persiste el riesgo de clasificacion erronea en dominios no cubiertos por la mezcla de datos.
- Idiomas soportados no declarados; el rendimiento multilingue no esta garantizado.
- La longitud de contexto efectiva esta fijada a 4096 tokens en la evaluacion principal; entradas mas largas pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que se eliminaron datasets con restricciones comerciales de la mezcla de entrenamiento; conviene revisar las condiciones de los datasets restantes si se redistribuye el modelo.
- El modelo base Qwen3.5-2B-Base tiene sus propias limitaciones y sesgos que el adaptador no corrige necesariamente.
- El checkpoint es la media de tres semillas; la variabilidad entre ejecuciones individuales no se documenta.

## Enlaces

- Hugging Face (Amazon): https://huggingface.co/amazon/strands-decider-2B-qwen3.5-v1-2610
- Hugging Face (StrandsAgents, repositorio principal): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Documentacion de nombres (referenciada en la model card): `docs/naming.md` en el repositorio de codigo (URL no disponible en la informacion proporcionada)
