# frechele/CrafterDojo

## Resumen

CrafterDojo es una suite de investigacion abierta para construir agentes encarnados (embodied agents) en el entorno Crafter, concretamente sobre su implementacion en Craftax-Classic. No se trata de un modelo de lenguaje, sino de una coleccion de pesos preentrenados que sirven como punto de partida y linea base para investigacion en aprendizaje por refuerzo, clonacion de comportamiento y agentes dirigidos por instrucciones.

El repositorio agrupa cinco componentes: tres politicas por clonacion de comportamiento basadas en la arquitectura VPT (CrafterVPT-tiny, CrafterVPT-base y CrafterVPT-large), un codificador video-lenguaje CrafterCLIP con arquitectura MineCLIP y backbone ViT-B/16, y una politica que sigue instrucciones llamada CrafterSteve-1 (LoRA sobre CrafterVPT-base) junto con su prior CVAE texto a objetivo visual. Todo ello se distribuye bajo licencia MIT.

El trabajo lo firman Junyeong Park, Hyeonseo Cho y Sungjin Ahn, y se asocia al articulo arXiv 2508.13530. Su relevancia reside en que ofrece una infraestructura reproducible y pesos abiertos para experimentar con agentes en Crafter, un banco de pruebas habitual para medir progreso en tareas abiertas de supervivencia y obtencion de recursos. Los modelos se entrenaron sobre la mezcla CrafterPlay `sv_gh_pp-10B_20ep` (expertos Survival y Gatherer) en Craftax-Classic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CrafterVPT (politicas de clonacion de comportamiento basadas en VPT); CrafterCLIP (arquitectura MineCLIP con backbone ViT-B/16); CrafterSteve-1 (LoRA sobre CrafterVPT-base + prior CVAE texto a objetivo visual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos) y YAML (configuraciones de arquitectura) |

## Arquitectura y entrenamiento

CrafterDojo no define una arquitectura unica, sino un conjunto de modelos complementarios. Por un lado, CrafterVPT-tiny, CrafterVPT-base y CrafterVPT-large son politicas entrenadas por clonacion de comportamiento siguiendo la familia VPT (Video PreTraining), con tres escalas de tamano y sus correspondientes ficheros de configuracion YAML que replican los de `models/vpt/*.yaml` del repositorio de codigo. Por otro, CrafterCLIP es un codificador video-lenguaje basado en la arquitectura MineCLIP con backbone ViT-B/16, que aprende representaciones compartidas entre video y texto. CrafterSteve-1 es una politica que sigue instrucciones, construida como adaptacion LoRA sobre CrafterVPT-base, acompanada de un prior CVAE que transforma texto en un objetivo visual, siguiendo el esquema del conocido Steve-1.

Los datos de entrenamiento corresponden a la mezcla CrafterPlay `sv_gh_pp-10B_20ep`, compuesta por expertos Survival y Gatherer, en el entorno Craftax-Classic. Cada fichero `.safetensors` registra su ejecucion de entrenamiento en los metadatos de cabecera. En CrafterCLIP, los tensores CLIP compartidos se almacenan una sola vez y se referencian mediante la entrada de metadatos `aliases`, de modo que los helpers del repositorio (`crafterdojo.common.checkpoint.load_state_dict`) los restauran al cargar. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clonacion de comportamiento en Crafter: las politicas CrafterVPT (tiny, base y large) imitan a los expertos de la mezcla CrafterPlay para actuar en Craftax-Classic.
- Codificacion video-lenguaje: CrafterCLIP genera representaciones alineadas entre video y texto, utiles para objetivos visuales y recompensas basadas en lenguaje.
- Seguimiento de instrucciones: CrafterSteve-1 actua como politica que sigue instrucciones textuales, apoyandose en su prior CVAE texto a objetivo visual.
- Base para investigacion en aprendizaje por refuerzo: los pesos sirven como inicializacion o linea base para entrenar agentes encarnados.
- Adaptacion por LoRA: el componente Steve-1 ilustra un patron de ajuste eficiente sobre una politica base.
- Multilingue: no disponible.
- Tool calling / function calling: no aplica ni se documenta; no es un modelo de lenguaje conversacional.
- Vision: si, a traves de CrafterCLIP (entrada visual de video) y de la representacion de observaciones del entorno.

## Casos de uso

- Investigacion en agentes encarnados: usar CrafterVPT como linea base de clonacion de comportamiento para medir mejoras de nuevos algoritmos en Craftax-Classic, aprovechando que las tres escalas permiten estudiar el efecto del tamano del modelo.
- Desarrollo de politicas que siguen instrucciones: partir de CrafterSteve-1 y de su prior texto a objetivo visual para experimentar con agentes guiados por lenguaje en tareas de supervivencia.
- Recompensas y objetivos basados en lenguaje: emplear CrafterCLIP como codificador video-lenguaje para construir funciones de recompensa o metas visuales descritas textualmente.
- Aprendizaje por refuerzo con inicializacion preentrenada: cargar los pesos de CrafterVPT y continuar el entrenamiento con algoritmos de RL, reduciendo el coste de exploracion inicial.
- Reproduccion de experimentos: descargar la revision v1.0 mediante `scripts/download_weights.sh` para replicar los resultados del articulo y comparar metodologias de forma controlada.
- Estudio de ajuste eficiente: analizar la adaptacion LoRA de CrafterSteve-1 sobre CrafterVPT-base como caso practico de fine-tuning con pocos parametros entrenables.
- Docencia y prototipado: disponer de pesos abiertos y configuraciones YAML para montar practicas o demostraciones de agentes en entornos de mundo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos consultados no incluyen tablas de metricas (por ejemplo, recompensas medias, tasas de exito en logros de Crafter u otras medidas) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se indican tamanos de parametros por modelo, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El repositorio completo ocupa 1,0 GB, lo que sugiere pesos de tamano moderado, pero no se especifica el reparto por fichero ni los requisitos de memoria.
- Opciones de despliegue: la via documentada es clonar el repositorio de codigo `CrafterDojo`, ejecutar `scripts/download_weights.sh` y cargar los pesos con el helper `crafterdojo.common.checkpoint.load_state_dict`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrafterDojo (CrafterVPT / CrafterCLIP / CrafterSteve-1) | Suite de agentes encarnados en Crafter | no disponible | no disponible | MIT | Pesos en HuggingFace y codigo en GitHub |
| VPT (Video PreTraining) | Politica por clonacion de comportamiento | no disponible | no disponible | no disponible | Arquitectura de referencia que inspira CrafterVPT |
| MineCLIP | Codificador video-lenguaje | no disponible | no disponible | no disponible | Arquitectura de referencia que inspira CrafterCLIP |
| Steve-1 | Politica que sigue instrucciones | no disponible | no disponible | no disponible | Esquema de referencia que inspira CrafterSteve-1 |

Los tres ultimos elementos no son alternativas equivalentes de descarga directa, sino las arquitecturas en las que se inspira CrafterDojo segun la propia model card. No se dispone de datos numericos para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Ausencia de benchmarks publicos: no hay metricas en la informacion disponible, por lo que no puede evaluarse su rendimiento de forma objetiva antes de probarlo.
- Especificidad de dominio: los modelos estan entrenados para Crafter/Craftax-Classic; su utilidad fuera de ese entorno no esta documentada.
- Idiomas no especificados: la model card no indica idiomas soportados; el componente de instrucciones podria estar limitado al ingles, pero esto no se confirma en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de un modelo de lenguaje, pero las politicas pueden ejecutar acciones suboptimas o divergir del comportamiento experto fuera de la distribucion de entrenamiento.
- Sesgos: dependen de los expertos Survival y Gatherer de la mezcla `sv_gh_pp-10B_20ep`; no se documenta analisis de sesgos.
- Licencia: MIT, permisiva para uso comercial, aunque conviene revisar las dependencias del codigo y del entorno Craftax-Classic.
- Advertencias de produccion: es una suite de investigacion; no se documentan garantias de estabilidad, soporte ni mantenimiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frechele/CrafterDojo
- Articulo (arXiv): https://arxiv.org/abs/2508.13530
- Codigo: https://github.com/frechele/CrafterDojo
- Sitio del proyecto: https://sites.google.com/view/crafterdojo
