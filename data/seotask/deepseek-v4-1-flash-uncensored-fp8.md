# seotask/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una version modificada del modelo multimodales deepseek-ai/DeepSeek-V4.1-Flash, publicada por el usuario seotask bajo el sello dealignai. La modificacion consiste en una "abliteracion" a nivel de pesos: se elimina quirurgicamente el circuito de rechazo del modelo base manteniendo intactos el resto de componentes (expertos enrutados, torre de vision, cabezas de atencion, normalizaciones y embeddings). El resultado es un checkpoint estandar que se carga igual que el modelo original, sin hooks de runtime ni vectores de direccion.

Se trata de un modelo de arquitectura MoE multimodal con 763.205.315.794 parametros totales segun los pesos reales en safetensors, aunque la model card del autor describe un backbone de 552B con 8B/16B activos por token. Declara una ventana de contexto de 1M tokens, vision nativa (DeepSeek-ViT con 2D-RoPE y pixel unshuffle), memoria n-gram Engram y decodificacion especulativa DSpark. Los pesos se distribuyen en FP8 (e4m3fn) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

Su relevancia es doble. Por un lado, es un caso de estudio tecnico sobre tecnicas de abliteracion que preservan capacidad de conocimiento general (la caida en MMLU excluyendo el cluster de etica es de 1,1 pp segun el autor). Por otro, es un artefacto con guardarrailes eliminados: la propia model card reporta un 100% de tasa de exito en HarmBench-320, lo que lo convierte en un modelo inadecuado para despliegues de cara al publico sin capas de moderacion externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark |
| Parametros totales | 763.205.315.794 (pesos reales en safetensors); la model card del autor indica backbone de 552B |
| Parametros activos | 8B/16B por token segun la model card del autor (MoE) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) en pesos con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4; etiquetado como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Tamano del repositorio | 510,3 GB |

## Arquitectura y entrenamiento

La arquitectura descrita por el autor es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos: 384 expertos enrutados con seleccion top-6 mas un experto compartido. Incorpora Hyper-Connections con residual de 4 canales, atencion dispersa CSA2, una memoria n-gram denominada Engram, una cabeza de borrador especulativo DSpark (decodificacion especulativa, referida tambien como MTP) y una torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle. La cuantizacion es nativa y no ha sido alterada respecto al modelo base: pesos FP8 e4m3fn con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO, ni para el modelo base ni para esta derivada. La model card no documenta ningun entrenamiento adicional: la modificacion declarada es exclusivamente a nivel de pesos sobre el checkpoint base, con el objetivo de eliminar el comportamiento de rechazo preservando los componentes criticos para capacidad. No se detalla la metodologia concreta de la abliteracion ("proprietary weight-level abliteration"), mas alla de que no requiere `model.py` personalizado, hooks de runtime ni steering vectors.

## Capacidades

- Generacion de texto autoregresiva con licencia MIT y carga directa mediante transformers.
- Procesamiento multimodal imagen-texto: pipeline declarado image-text-to-text, con torre de vision DeepSeek-ViT intacta.
- Razonamiento extenso con control de esfuerzo ("effort"), configurado por defecto en modo maximo ("reasoning-max default").
- Soporte de herramientas y function calling, segun la model card ("Vision + tools").
- Contexto de 1M tokens, apto para documentos o conversaciones de gran longitud.
- Decodificacion especulativa mediante la cabeza borrador DSpark, orientada a mejorar el throughput de generacion.
- Memoria n-gram Engram, integrada en la arquitectura base.
- Capacidades multilingues: la model card menciona un clasificador multilingue usado en la evaluacion, pero no se publica lista de idiomas soportados; dato no disponible.
- Eliminacion permanente del comportamiento de rechazo (abliteracion): el modelo responde a practicamente cualquier peticion, incluidas las que el modelo base rechazaria.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el checkpoint permite estudiar como se comporta un modelo con el circuito de rechazo eliminado frente al base, comparando trazas de razonamiento en los dos niveles de esfuerzo evaluados por el autor. Es util para investigacion academica sobre mecanismos de seguridad internos.
- Red teaming y evaluacion de clasificadores de seguridad: sirve como generador adversario controlado para probar sistemas de moderacion, siempre en entornos aislados y con supervision humana.
- Analisis de documentos largos: con 1M tokens de contexto y vision, permite procesar expedientes tecnicos, informes o manuales extensos acompanados de figuras, resumiendo y extrayendo datos en una sola pasada.
- Procesamiento multimodal de documentacion escaneada: la torre de vision con pixel unshuffle permite tareas de extraccion de informacion de diagramas, tablas e imagenes tecnicas dentro de pipelines de digitalizacion.
- Generacion de codigo en pipelines internos: con function calling y contexto largo puede integrarse en asistentes de desarrollo que necesitan leer repositorios completos, con la salvedad de que no hay evaluaciones publicadas de HumanEval o SWE-bench para esta version.
- Escritura creativa y roleplay sin restricciones tematicas: el caso de uso que la propia model card promueve implicitamente; requiere etiquetado de contenido y separacion estricta del usuario final.
- Agentes multi-paso en sandbox: las capacidades declaradas de tool calling y contexto largo permiten construir agentes que encadenan llamadas a herramientas, aunque la ausencia de guardarrailes obliga a interponer validacion externa de acciones.
- Benchmarking de tecnicas de cuantizacion: al conservar la cuantizacion nativa FP8/FP4, el checkpoint permite medir el impacto de la abliteracion sobre un formato de pesos ya optimizado.

## Benchmarks y rendimiento

Todos los datos de esta seccion proceden de la model card del autor y no han sido verificados de forma independiente.

HarmBench-320 (T=0, greedy, clasificacion en 4 niveles: HARD_REF / SOFT_RED / HEDGE / COMPLY):

| Evaluacion | ASR modelo base | ASR version abliterada | Delta (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81% | 320/320 = 100,00% | +57,19 |
| HB-320 effort=max | 5/320 = 1,56% | 320/320 = 100,00% | +98,44 |

Desglose por categoria semantica de HarmBench (porcentaje de cumplimiento):

| Categoria | Items | Base off | Abliterado off | Base max | Abliterado max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7% | 100,0% | 0,0% | 100,0% |
| copyright | 80 | 98,8% | 100,0% | 0,0% | 100,0% |
| cybercrime_intrusion | 52 | 34,6% | 100,0% | 3,8% | 100,0% |
| harassment_bullying | 21 | 0,0% | 100,0% | 0,0% | 100,0% |
| harmful | 18 | 11,1% | 100,0% | 5,6% | 100,0% |
| illegal | 53 | 13,2% | 100,0% | 0,0% | 100,0% |
| misinformation_disinformation | 54 | 44,4% | 100,0% | 3,7% | 100,0% |

MMLU-14k (conjunto de test completo, base-logit, T=0):

| Version | Aciertos | Precision | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96% | — |
| Abliterado | 11.619 / 14.042 | 82,74% | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta sobre los aproximadamente 11.000 items restantes es de -1,1 pp. Las mayores caidas por asignatura reportadas son moral_scenarios (-39,89 pp), professional law (-7,04 pp) y abstract algebra (-6,00 pp). El desglose completo de 57 asignaturas esta en la model card.

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, MMMU, SWE-bench, evaluaciones de contexto largo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: con 763.205.315.794 parametros, un almacenamiento en FP8 puro (1 byte por parametro) exigiria aproximadamente 763 GB solo para pesos. El repositorio ocupa 510,3 GB, coherente con la mezcla declarada de FP8 para la mayoria de componentes y FP4 para los expertos enrutados.
- VRAM total estimada incluyendo cache KV y activaciones: del orden de 600-800 GB segun precision efectiva y longitud de contexto. La cache KV para 1M tokens puede ser muy elevada y no se publica su calculo exacto.
- GPU recomendadas: configuraciones multi-nodo o multi-GPU de gama alta. Como referencia, 8x NVIDIA H200 (141 GB, 1.128 GB agregados) cubririan pesos y margen operativo; 8x H100 de 80 GB (640 GB) quedarian muy justas o insuficientes una vez anadida la cache KV; 16x A100 de 80 GB seria una alternativa viable en agregado.
- GPU de consumo: no cabe en ninguna GPU consumer actual, ni siquiera repartido en varias RTX 4090 (24 GB) de forma practica. No se ofrecen pesos GGUF ni cuantizaciones de menor precision en el repositorio.
- Opciones de despliegue: la libreria declarada es transformers y el repositorio incluye la etiqueta endpoints_compatible. No se detallan en la informacion proporcionada configuraciones para vLLM, SGLang, TGI, llama.cpp ni Ollama. Cualquier motor que se use debera soportar FP8 con escalas de bloque E8M0 y expertos en FP4.
- Latencia y throughput: no disponibles. La arquitectura incorpora decodificacion especulativa (DSpark) y solo 8B/16B parametros activos por token, lo que en teoria reduce el coste por token frente a un modelo denso del mismo tamano total, pero no se publican mediciones.

## Comparativa con modelos similares

La unica comparacion con datos disponibles en la informacion proporcionada es contra el modelo base del que deriva.

| Modelo | Parametros | Contexto | MMLU | HarmBench-320 (off / max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763.205.315.794 reales (552B de backbone segun el autor) | 1M tokens | 82,74% | 100,00% / 100,00% | MIT | HuggingFace |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B de backbone, 8B/16B activos por token | 1M tokens (no confirmado en la informacion proporcionada) | 86,96% | 42,81% / 1,56% | no disponible | HuggingFace |

No se dispone de datos de otros modelos abliterados o sin censura comparables en la informacion proporcionada, ni de comparaciones con alternativas de la misma categoria (otros MoE multimodales de gran tamano o derivados abliterados de Llama, Mistral o Qwen).

## Limitaciones y advertencias

- Eliminacion de guardarrailes: el propio autor reporta un 100% de tasa de exito en HarmBench-320 en las siete categorias evaluadas, incluidas chemical_biological, cybercrime_intrusion e illegal. El modelo genera contenido danino bajo peticion directa.
- Riesgo legal y de reputacion: la licencia MIT permite el uso comercial, pero no exime al desplegador de responsabilidad legal por el contenido generado ni del cumplimiento del reglamento europeo de IA en materia de contenidos ilicitos.
- Caida de conocimiento: MMLU baja 4,22 pp en el conjunto completo y 39,89 pp en moral_scenarios. Aunque el autor sostiene que la perdida fuera del cluster de etica es de 1,1 pp, esa afirmacion es autodeclarada.
- Datos no verificados: todos los benchmarks proceden de la model card del autor, sin replicacion independiente ni publicacion de metodologia auditables.
- Procedencia dudosa: el repositorio tiene 0 descargas y 0 me gusta, y la model card remite a cuentas de redes sociales en lugar de a un informe tecnico o paper con revision.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni equidad en la informacion disponible.
- Idiomas: no se publica lista de idiomas soportados ni evaluaciones multilingues.
- Contexto largo: se declara 1M de tokens pero no se aportan evaluaciones de recuperacion en contexto largo (tipo RULER o Needle-in-a-Haystack); se desconoce la degradacion real a esa longitud.
- Requisitos de hardware prohibitivos: la inferencia exige agregados de VRAM del orden de 600-800 GB, fuera del alcance de equipos individuales o de empresas pequenas.
- Ausencia de cuantizaciones ligeras: no hay versiones GGUF, AWQ ni GPTQ publicadas, lo que impide cualquier despliegue en hardware de gama de consumo.
- Discrepancia de parametros: la model card declara 552B de backbone mientras los safetensors contienen 763,2 mil millones de parametros; conviene verificar la cifra antes de dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seotask/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil de investigador citado en la model card: https://x.com/jordanschenck
