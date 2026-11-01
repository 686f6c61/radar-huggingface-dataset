# DuoNeural/CrystalCall-v2-Poincare-7L-91M

## Resumen

CrystalCall-v2-Poincare-7L-91M es un modelo de lenguaje ultracompacto especializado en function calling y enrutamiento de herramientas agenticas, desarrollado por DuoNeural Research Lab. Con 91,3 millones de parametros (41,7 millones activos en el backbone), destila capacidades de Salesforce/xLAM-1b-fc-r en un modelo aproximadamente tres veces mas pequeno, orientado a despliegues en dispositivos edge y a latencias muy bajas en pipelines de agentes.

Su rasgo diferencial es la arquitectura CDM MoE Poincare: un MoE con enrutamiento no euclidiano sobre la bola conforme de Poincare, que segun el autor mejora la asignacion de argumentos en llamadas paralelas a herramientas frente a modelos euclidianos de tamano similar. El modelo fue entrenado 100.000 pasos en una NVIDIA A100-SXM4-40GB, mezclando trazas de function calling de multiples fuentes con texto conversacional de FineWeb-Edu bajo la denominada "ley del disolvente eutectico" (75 % datos de herramientas, 25 % texto general).

El modelo es relevante para quien necesite enrutamiento de herramientas con huella minima: 93,9 MiB en cuantizacion Q8_0 GGUF, compatible con llama.cpp, y licencia Apache 2.0 que permite uso comercial sin restricciones. No obstante, los datos publicados proceden integramente de la model card del autor y las comparativas se limitan a un unico rival (FunctionGemma-270M), por lo que conviene validar los resultados de forma independiente antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE hibrido y enrutamiento Poincare (cdm_moe_poincare), 7 capas, 12 cabezas, d=768, K=8 centroides, 4 expertos (d_ff=768) |
| Parametros totales | 91.272.590 (~91,3M) segun model card; 117.923.480 segun safetensors de HuggingFace |
| Parametros activos | 41.727.374 (~41,7M) en el backbone activo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (PyTorch), Q8_0 (GGUF); otras variantes no disponibles |
| Idiomas soportados | no disponible (entrenado con datos en ingles: function calling y FineWeb-Edu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 7 capas y 12 cabezas de atencion con dimension oculta de 768. Sobre el backbone se situa un MoE con 4 expertos (d_ff=768) cuyo enrutador emplea 8 centroides incrustados en la bola conforme de Poincare, un espacio hiperbolico. Segun el autor, este enrutamiento "Voronoi no euclidiano" asigna los huecos de argumentos de las herramientas a fronteras ortogonales, evitando la difusion de atencion que sufren los modelos euclidianos al despachar llamadas paralelas. El vocabulario es de 32.256 tokens, con embeddings (24,8M) y lm_head (24,8M) sin atar (el modelo indica tambien una variante equivalente con pesos atados de 66,5M).

El entrenamiento consistio en destilacion desde Salesforce/xLAM-1b-fc-r durante 100.000 pasos en una NVIDIA A100-SXM4-40GB. La mezcla de datos sigue la proporcion 75/25: trazas de function calling de Salesforce/xlam-function-calling-60k, glaiveai/glaive-function-calling-v2 y NousResearch/hermes-function-calling-v1, combinadas con texto educativo de alta calidad de HuggingFaceFW/fineweb-edu. El numero total de tokens de entrenamiento no esta disponible. El autor reporta un record de 0,2893 BPB en el conjunto de test de enrutamiento retenido (perplejidad de validacion ~2,04) en el paso 60.500. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional basica, gracias a la mezcla del 25 % de FineWeb-Edu.
- Function calling / tool calling en un solo turno, con extraccion de argumentos (Argument F1 reportado de 66,13 % en FP32 y 65,88 % en Q8_0).
- Llamadas paralelas a herramientas (parallel tool calling), con Argument F1 de 71,32 %, el punto fuerte declarado del modelo.
- Enrutamiento agentico de herramientas, entrenado con tres datasets publicos de function calling.
- Generacion de JSON estructurado para las llamadas, con validez reportada del 68 % (single-turn) y 76 % (parallel-call).
- Despliegue nativo en llama.cpp mediante GGUF Q8_0, con paridad de top-1 del 99,63 % respecto a FP32.
- No hay evidencia de capacidades de vision, audio, razonamiento extendido (thinking mode) ni soporte multilingue.

## Casos de uso

- Orquestacion de herramientas en agentes locales: el modelo puede actuar como enrutador ligero que decide que funcion invocar y con que argumentos, ejecutandose en local con llama.cpp sin depender de APIs externas.
- Asistentes en dispositivos edge: con 93,9 MiB en Q8_0 y 149,8 ms por turno en CUDA, es adecuado para integrarse en aplicaciones de escritorio o IoT con GPU modesta, e incluso CPU (360,7 ms por turno).
- Validacion previa de llamadas a APIs: puede generar el JSON de invocacion a una funcion y dejar que un validador esquematico compruebe la estructura antes de ejecutarla, dado que su validez JSON no es perfecta (68-76 %).
- Pipelines de automatizacion con multiples herramientas simultaneas: su Argument F1 en llamadas paralelas (71,32 %) lo hace util para despachar varias acciones a la vez, por ejemplo en flujos de RPA.
- Prototipado rapido de agentes: al ser tan ligero, permite iterar ciclos agenticos completos en un solo equipo de consumo sin coste de inferencia en la nube.
- Destilacion y research de arquitecturas no euclidianas: el repositorio Lattice-CDM en GitHub permite estudiar el enrutamiento Poincare y reproducir el enfoque en otros dominios.
- Capa de enrutado economico en produccion: puede filtrar o clasificar solicitudes de herramientas antes de escalarlas a un LLM mayor, reduciendo coste y latencia del sistema global.

## Benchmarks y rendimiento

Los unicos datos publicados provienen de la model card del autor, evaluada con decodificacion greedy en una A100-SXM4-40GB sobre 140 distribuciones de test retenidas (xLAM-60k held-out y Glaive-v2):

| Metrica | CrystalCall-v2 FP32 | CrystalCall-v2 Q8_0 GGUF | Google FunctionGemma-270M |
|---|:---:|:---:|:---:|
| Parametros totales | 91,27M | 91,27M (93,9 MiB GGUF) | 268,10M |
| Parametros activos | 41,73M | 41,73M | 268,10M |
| Latencia single-turn (ms) | 965,95 (A100) | 149,8 (CUDA) / 360,7 (CPU) | 3.675,32 |
| Latencia parallel-call (ms) | 1.397,52 (A100) | 298,8 (CUDA) / 721,2 (CPU) | 3.684,28 |
| Throughput (t/s) | 62,1 | 400,4 (CUDA) / 166,3 (CPU) | 27,2 |
| Tool accuracy single-turn | 64,0 % | 64,0 % | 80,0 % |
| Argument F1 single-turn | 66,13 % | 65,88 % | 9,94 % |
| Tool accuracy parallel-call | 44,0 % | 44,0 % | 46,0 % |
| Argument F1 parallel-call | 71,32 % | 71,10 % | 9,01 % |
| JSON validity single-turn | 68,0 % | 68,0 % | 96,0 % |
| JSON validity parallel-call | 76,0 % | 76,0 % | 92,0 % |
| BPB (test de enrutamiento) | 0,2893 | — | no disponible |
| Paridad top-1 Q8_0 vs FP32 | — | 99,63 % (4.096 tokens) | — |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos distintos de FunctionGemma-270M.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 350 MB en FP32 y 93,9 MiB en GGUF Q8_0; en la practica, cualquier GPU con 2 GB de VRAM o mas es suficiente, e incluso CPU.
- GPU recomendadas: segun el autor, el entrenamiento uso una NVIDIA A100-SXM4-40GB; para inferencia no se necesita hardware de gama alta, dada la huella inferior a 100 MB.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPUs; tambien es viable la inferencia pura en CPU a 166,3 t/s segun los datos del autor.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF Q8_0 declarado), transformers y PyTorch con safetensors; no hay evidencia de soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput estimados (datos del autor): 149,8 ms por turno single-turn y 400,4 t/s en CUDA con Q8_0; 360,7 ms y 166,3 t/s en CPU; 62,1 t/s sin cache en FP32 sobre A100.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Enfoque | Licencia | Disponibilidad |
|---|:---:|:---:|---|---|---|
| CrystalCall-v2-Poincare-7L-91M | 91,3M | 41,7M | Function calling con MoE Poincare hiperbolico | Apache 2.0 | HuggingFace, safetensors + GGUF |
| Google FunctionGemma-270M | 268,1M | 268,1M | Function calling, atencion estandar | no disponible | no disponible en la informacion proporcionada |
| Salesforce/xLAM-1b-fc-r (modelo base) | ~1B | no disponible | Function calling generalista | no disponible | HuggingFace |

En la comparativa publicada por el autor, CrystalCall-v2 pierde en tool accuracy y validez JSON frente a FunctionGemma-270M (64 % vs 80 %; 68 % vs 96 % en single-turn), pero gana con claridad en extraccion de argumentos (66,13 % vs 9,94 %) y en latencia (hasta 24,5 veces mas rapido en CUDA). No hay comparativas con otros modelos ligeros de function calling como OctoNet u otras variantes de xLAM.

## Limitaciones y advertencias

- Todos los resultados de rendimiento proceden de la model card del propio autor; no hay evaluacion independiente verificada y la unica comparacion es contra FunctionGemma-270M.
- La validez JSON es limitada (68 % single-turn, 76 % parallel-call): en produccion es imprescindible un validador de esquema y logica de reintento.
- La tool accuracy en single-turn (64 %) es inferior a la de su competidor directo; el modelo destaca en argumentos, no en seleccion de herramienta.
- Discrepancia en el numero de parametros: la model card declara 91,3M, pero los safetensors de HuggingFace suman 117,9M; conviene verificar antes de planificar capacidad.
- La longitud de contexto no esta documentada, lo que dificulta evaluar su uso con conversaciones largas o catalogos de herramientas extensos.
- Los idiomas soportados no estan declarados; el entrenamiento se basa en datasets en ingles, por lo que el rendimiento en castellano es incierto.
- Sesgos conocidos: no disponibles; no se publica informacion sobre auditorias de sesgo.
- Riesgo de alucinacion: no disponible; al ser un modelo tan pequeno y especializado, es esperable que falle fuera de su dominio de function calling.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque no hay garantia de ningun tipo.
- El modelo es muy reciente (creado en octubre de 2026) con 228 descargas y 0 likes en el momento de la ficha, es decir, sin historial comunitario que avale su fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/CrystalCall-v2-Poincare-7L-91M
- Organizacion DuoNeural en HuggingFace: https://huggingface.co/DuoNeural
- Codigo (Lattice-CDM): https://github.com/DuoNeural/Lattice-CDM
- Web del autor: https://duoneural.com
- Modelo base: https://huggingface.co/Salesforce/xLAM-1b-fc-r
- Dataset Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
