# ryan-0608/MoS-8B-Checkpoints

## Resumen

MoS-8B-Checkpoints es un repositorio de checkpoints de investigación publicado por el usuario ryan-0608 en HuggingFace. No contiene un modelo conversacional al uso, sino los pesos intermedios y finales de una familia de modelos draft (borradores) construidos sobre Qwen3-8B para decodificación especulativa dentro del proyecto denominado MoS. La innovación que se estudia es la inyección de mezclas de expertos locales por capa ("mixture of layer-local expert MLPs") sumadas a un MLP compartido en cada capa del draft, con configuraciones de K=4, K=8 y K=16 expertos.

El repositorio documenta seis "arms" (ramas experimentales) entrenadas sobre un corpus autogenerado de 8B denominado `dataclean-8b-20260912`, con un calendario de 5 épocas (66.625 pasos, 13.325 pasos por época) y guardados cada media época. Incluye además las inicializaciones de arranque en caliente (`inputs/`), tanto las de expertos aleatorios con semillas concretas como las de warm-start con jitter del 1 % sobre el MLP de la capa D0.

Su relevancia es acotada y muy específica: es material de reproducibilidad para investigadores que trabajen en decodificación especulativa, arquitecturas MoE de grano fino o inicialización de expertos. El tamaño del repositorio, 2.429 GB, refleja que almacena checkpoints completos de entrenamiento en formato DCP (modelo, optimizador, scheduler y estados RNG), no un artefacto listo para servir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen3-8B con capas draft tipo DFlash; en cada capa draft se anaden K expertos MLP locales sobre un MLP compartido (MoS) |
| Parametros totales | No disponible con precision; el modelo base es Qwen3-8B (~8B) y los expertos anadidos incrementan la cifra sin cuantificar en la model card |
| Parametros activos | No disponible; la model card no especifica enrutamiento top-k ni si todos los expertos se evaluan. La formulacion "added to a shared MLP" sugiere una mezcla aditiva densa |
| Longitud de contexto | No disponible para los draft models |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen3-8B se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors para el export portable (`hf/config.json`, `hf/model.safetensors`, `hf/export_manifest.json`) y checkpoints DCP completos (model/, optimizer/, lr_scheduler/, rng_rank_*.pt, meta.json) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-8B y anade, en cada capa del draft DFlash, un conjunto de K expertos MLP de ambito local que se combinan con un MLP compartido. La model card describe tres regimenes de inicializacion: expertos con inicializacion aleatoria (semillas 20260917 para K=4 y 20260919 para K=16), warm-start a partir del MLP de la capa D0 con un 1 % de jitter, y una ablacion de media anchura en la que cada experto se recorta a sus primeros 6.144 unidades ocultas. Los brazos con K=16 emplean paralelismo de expertos durante el entrenamiento. No se documenta la funcion de enrutamiento, el numero de parametros por experto ni la dimension del MLP compartido.

El entrenamiento usa el corpus autogenerado de 8B `dataclean-8b-20260912` (variante clean-800K) con un calendario de 5 epocas: 13.325 pasos por epoca hasta 66.625 pasos totales, con guardados en 6.662, 19.986, 33.310, 46.634 y 59.958 (media epoca). El learning rate de los expertos es 6e-4 en la mayoria de brazos, con una ablacion a 1e-3, y el brazo `x4rand-mos-r2` continua desde los pesos de E1 del primer `x4rand` con reinicio de Adam. No hay informacion sobre RLHF, DPO u otras fases de alineamiento, lo que es coherente con un modelo draft que solo propone tokens. Los resultados, configuraciones y logs se remiten al repositorio GitHub del proyecto (ruta `experiments/aurora/qwen3-8b-800k-e5/bal01/README.md`, seccion 10).

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre un modelo objetivo Qwen3-8B; no es un modelo de chat autonomo.
- Tres configuraciones de capacidad del draft (K=4, K=8, K=16 expertos por capa) que permiten explorar el compromiso entre tasa de aceptacion y coste por paso.
- Variantes de inicializacion comparables entre si (aleatoria, warm-start con jitter, media anchura), utiles para atribuir diferencias de calidad a la receta de inicializacion.
- Checkpoints completos con estado de optimizador, scheduler y RNG, lo que habilita reanudacion exacta del entrenamiento.
- Export portable listo para servir en `hf/` con manifiesto de exportacion.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible / no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B: el draft propone tokens que el modelo objetivo verifica, reduciendo el numero de pasos autorregresivos del modelo grande. Los brazos K=4 son el punto de partida natural por su menor coste por paso.
- Investigacion en MoE de grano fino: la serie de brazos K=4/K=8/K=16 permite medir como escala la calidad del draft al aumentar el numero de expertos locales, manteniendo fijo el resto de la receta.
- Estudio de estrategias de inicializacion de expertos: la comparacion entre `x4rand` (aleatoria), `d0-fullwidth-init-8b-jitter` (warm-start con 1 % de jitter) y `x4rand-lr1e3-mos` (ablation de learning rate) aisla el efecto de cada decision de diseno.
- Reproduccion de experimentos de entrenamiento: los checkpoints DCP con `optimizer/`, `lr_scheduler/` y `rng_rank_*.pt` permiten reanudar exactamente en los pasos archivados, algo imprescindible para verificar resultados publicados.
- Serving experimental de decodificacion especulativa: el export `hf/` con `config.json` y `model.safetensors` se puede cargar en un runtime que soporte el esquema DFlash del autor, sin necesidad de reconstruir el estado de entrenamiento.
- Analisis del compromiso latencia/aceptacion: comparar la tasa de aceptacion y el coste por paso entre `x4rand` y `x16rand` permite decidir si el incremento de parametros del draft se amortiza en produccion.
- Punto de partida para fine-tuning de drafts de dominio: reutilizar los pesos de un brazo entrenado como inicializacion para un draft especializado en un dominio concreto, en lugar de partir de inicializacion aleatoria.
- Ablacion de anchura del experto: la inicializacion `d0-shared-random-experts-8b-x4-half` (expertos recortados a 6.144 unidades) sirve para estudiar cuanto de la ganancia proviene de la anchura frente al numero de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados a la seccion 10 del README del repositorio GitHub del proyecto, sin incluirlos en HuggingFace, y no aporta cifras de tasa de aceptacion, speedup de decodificacion, perplejidad ni evaluaciones de calidad del draft.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 2.429 GB; clonar completo requiere ese espacio, por lo que conviene descargar solo los archivos de un brazo y paso concretos (el export `hf/` es la via mas ligera).
- VRAM para inferencia del draft: no disponible de forma exacta. Como referencia, un transformer de ~8B en bf16 requiere del orden de 16 GB solo para pesos, a los que hay que sumar los expertos MoS y el cache KV. Se trata de una estimacion, no de un dato del autor.
- VRAM para el entrenamiento: no disponible. Los brazos K=16 con paralelismo de expertos y checkpoints con estado de optimizador implican un consumo muy superior al de inferencia, sin cifras publicadas.
- GPU consumer: un modelo de ~8B en bf16 cabe ajustado en una RTX 4090 (24 GB) para inferencia; con los expertos adicionales el margen se reduce y no se puede confirmar sin conocer el recuento exacto de parametros. En cuantizacion 4 bits el draft cabria con holgura, pero no se publican GGUF.
- GPU de datacenter: A100/H100 son las opciones razonables para entrenamiento y para servir el draft junto al modelo objetivo en la misma maquina; no hay cifras de rendimiento publicadas.
- Opciones de despliegue: el formato safetensors es compatible con vLLM, SGLang o TGI, pero la compatibilidad real depende de que el runtime implemente el esquema DFlash/MoS del autor; no se documenta integracion con llama.cpp ni Ollama, y no hay pesos GGUF.
- Latencia y throughput: no disponibles. Al ser un draft, su utilidad se mide por tasa de aceptacion y speedup end-to-end, metricas que no se publican en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoS-8B-Checkpoints (este repo) | ~8B base + expertos MoS (sin cuantificar) | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3-8B (modelo base) | ~8B | No disponible en esta informacion | Ampliamente evaluado en la model card original de Qwen | Apache-2.0 | Publico en HuggingFace |
| Qwen3-0.6B / Qwen3-1.7B (drafts ligeros habituales) | 0,6B / 1,7B | No disponible en esta informacion | Sin datos comparables en esta informacion | Apache-2.0 | Publicos en HuggingFace |
| Otros drafts especulativos (EAGLE, Medusa y similares) | No disponible | No disponible | No disponible | No disponible | Publicos, pero no comparables directamente con este esquema |

La comparacion cuantitativa no es posible con la informacion disponible: el repositorio no publica evaluacion del draft ni especifica el numero exacto de parametros anadidos, de modo que no se puede situar frente a alternativas en tasa de aceptacion o speedup.

## Limitaciones y advertencias

- No es un modelo listo para uso directo: es un repositorio de checkpoints de investigacion cuyo consumo requiere conocer el pipeline DFlash/MoS del autor.
- Ausencia total de licencia declarada: no se puede asumir uso comercial. Cualquier despliegue en produccion requiere aclarar primero los terminos con el autor, aunque el modelo base Qwen3-8B sea Apache-2.0.
- Sin benchmarks ni tasas de aceptacion publicadas: no hay evidencia en el repositorio de que estos drafts superen a un draft convencional.
- Checkpoints perdidos: en el brazo `e5-x4rand-mos` los pasos 13.325 (E1) y 19.986 no se archivaron y se dan por perdidos, lo que rompe la reproducibilidad completa de esa rama.
- Brazo incompleto: `e5-x16lr4-mos` esta pausado en el paso 18.478 y solo tiene export en 6.662 y 13.325; `e5-x4rand-mos-r2` se detuvo sin valor de referencia.
- Documentacion insuficiente de la arquitectura: no se detalla el enrutamiento de expertos, el numero de parametros por experto ni la dimension del MLP compartido, lo que impide estimar con precision VRAM y latencia.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el draft no genera respuestas finales; sus propuestas son verificadas por el modelo objetivo. La calidad del texto final depende del objetivo, no del draft.
- Idiomas y sesgos: no documentados. Al entrenarse sobre un corpus autogenerado de 8B, el draft hereda la distribucion de ese corpus, que no se describe.
- Tamano del repositorio: 2.429 GB hacen inviable una descarga indiscriminada en entornos con cuotas de almacenamiento; hay que seleccionar archivos.
- Fechas y trazabilidad: el repositorio se actualizo por ultima vez el 2026-10-25 y no incluye pipelines ni tarjetas de evaluacion, por lo que su estado puede cambiar sin aviso.

## Enlaces

- HuggingFace: https://huggingface.co/ryan-0608/MoS-8B-Checkpoints
- Repositorio GitHub del proyecto MoS (referenciado en la model card, ruta `experiments/aurora/qwen3-8b-800k-e5/bal01/README.md`, seccion 10): URL no disponible en la informacion proporcionada
- Registros de archivo (recuentos de ficheros y totales en bytes): ruta `experiments/aurora/qwen3-8b-800k-e5/archive/` en el mismo repositorio GitHub, URL no disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo (los resultados corresponden a Ryanair, Ryan's World y homonimos de "Ryan"), por lo que no se incluyen.
