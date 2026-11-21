# redmingwei/HeteroMoEProjSpace-v2

## Resumen

HeteroMoEProjSpace-v2 es un modelo de extraccion de caracteristicas (feature-extraction) desarrollado por el usuario redmingwei, que combina tres backbones preentrenados de modalidades distintas (texto, texto ligero y vision) mediante una arquitectura de mezcla de expertos heterogenea y un espacio de proyeccion dimensional. El modelo no genera texto ni responde a instrucciones: su salida es una representacion latente de 1024 dimensiones por token, obtenida fusionando las representaciones de los tres backbones. La arquitectura se articula en torno a cuatro "slots" funcionales (Q, K, V, O) y cuatro expertos con seleccion top-2 por token.

El modelo es relevante ahora por su enfoque experimental: explora como fusionar representaciones de dimensionalidades distintas (896, 256 y 768 en la generacion v62.x) sin forzar una proyeccion trivial, usando un router que decide por token que subespacios y que expertos contribuyen. La model card documenta con detalle inusual los fallos de versiones anteriores (v62.0 a v62.2) y las correcciones aplicadas en v62.3, lo que lo convierte en un caso de estudio sobre depuracion de routers en arquitecturas MoE.

El checkpoint publicado contiene 645.190.802 parametros y ocupa 2,58 GB en safetensors. La model card advierte que versiones posteriores (v63.0 en adelante) cambian los backbones por Qwen3.5-2B, ModernBERT y SigLIP2, con dimensiones de proyeccion distintas (2048, 768 y 1152), por lo que la carga requiere hacer coincidir los `modal_dims` correspondientes. Los pesos publicados en el repositorio corresponden a la generacion v62.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos heterogenea con espacio de proyeccion dimensional (HeteroMoEProjSpace), sobre tres backbones transformer (Qwen2.5-0.5B-Instruct, BERT-L4-H256, ViT-base-patch16-224) |
| Parametros totales | 645.190.802 |
| Parametros activos | no disponible (no es un MoE disperso con expertos activos declarados; el router selecciona top-2 de 4 expertos por token, pero no se publica el conteo de parametros activos) |
| Longitud de contexto | no disponible (los backbones tienen sus propias ventanas; la model card no especifica una ventana unificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 2,58 GB) mas checkpoints `.pt` en `checkpoints/<version>/` |

## Arquitectura y entrenamiento

El modelo combina tres backbones preentrenados de dimensiones distintas: Qwen2.5-0.5B-Instruct con 494,03M de parametros y dimension 896, BERT uncased L4 con 11,17M de parametros y dimension 256, y ViT-base-patch16-224 con 86,39M de parametros y dimension 768. Sobre estas representaciones se aplica un espacio de proyeccion dimensional (`proj_space`, 2,76M de parametros) que las alinea, y una capa de fusion de 1024 dimensiones (`fusion`, 50,34M de parametros) que produce la salida final `y` de forma [B, S, 1024]. La fusion emplea cuatro expertos con seleccion top-2 por token (`alpha`, mascara top-k) y cuatro slots funcionales (Q, K, V, O) con compuerta suave sobre todos ellos (`slot_alpha`, distribucion que suma 1). Las modalidades son opcionales: si falta una, se usa un vector de ceros en el enrutamiento.

El entrenamiento documentado para v62.3 usa 10.000 textos de ag_news y 5.000 imagenes de food101, tomando las representaciones ocultas reales de los backbones, con particion estratificada por clase 80/20 (7.998 de entrenamiento, 2.002 de validacion). No se documenta el numero total de tokens de preentrenamiento de los backbones ni si hubo RLHF o DPO. La model card es explicita sobre un fallo de diseno corregido: en v62.0 a v62.2 el router del espacio de proyeccion se creaba de forma lazy, por lo que sus pesos no se cargaban (unexpected en `load_state_dict`) y nunca entraban en el optimizador; en v62.3 pasa a crearse de forma eager y a ser realmente optimizado. Tambien se corrige la compuerta de slots de top-k=2 a compuerta suave completa, con regularizacion de entropia. Los cuatro expertos de la capa de fusion estan descongelados y inicializados aleatoriamente, no extraidos de FFN reales.

## Capacidades

- Extraccion de caracteristicas multimodales: produce representaciones de 1024 dimensiones por token a partir de texto, imagen o ambas modalidades combinadas.
- Fusion heterogenea: integra representaciones de dimensionalidades distintas (896, 256, 768 en la generacion v62.x) mediante proyeccion y enrutamiento por token.
- Modalidad opcional: funciona solo con texto, solo con imagen o con ambos; las modalidades ausentes se sustituyen por vectores de ceros en el enrutamiento.
- Enrutamiento interpretable: expone `slot_alpha` (contribucion de cada uno de los cuatro slots) y `alpha` (seleccion top-2 de expertos), lo que permite inspeccionar que subespacios y expertos se activan por token.
- No genera texto: el pipeline declarado es feature-extraction, no text-generation; no hay capacidades de razonamiento, codigo, matematicas ni tool calling documentadas.
- No hay soporte documentado de agentes, multi-step reasoning ni modos de pensamiento.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre fusion multimodal: el modelo permite estudiar como se combinan representaciones de backbones con dimensiones distintas y analizar el comportamiento del router mediante `slot_alpha` y `alpha` en cada token.
- Clasificacion de texto con representaciones fusionadas: el checkpoint v62.3 alcanza 0,9076 de exactitud held-out en clasificacion de 4 clases sobre ag_news, por lo que puede servir como extractor de caracteristicas para tareas de clasificacion de noticias.
- Clasificacion de imagenes con apoyo textual: usando las representaciones de ViT y BERT combinadas, el modelo puede alimentar cabezas de clasificacion sobre datasets como food101, que formo parte del entrenamiento documentado.
- Analisis de redundancia entre modalidades: la model card distingue escenarios donde el texto ya describe la imagen (tareas de redundancia, como SNLI-VE) frente a tareas visuales donde el texto no cubre la imagen, lo que permite elegir la configuracion adecuada.
- Audicion de arquitecturas MoE: la documentacion incluye comprobaciones de independencia de slots (rango conjunto 4/4, |cos| entre pares de 0,0158, VIF 1,0) y angulo principal de gradientes entre modalidades de 0,2717, utiles para validar que los expertos se especializan.
- Reproduccion de resultados: el repositorio incluye `example_inputs.npz` y `expected_y.npy` para verificar la salida del modelo y detectar deriva entre versiones de transformers.
- Estudio de fallos de entrenamiento: la model card documenta los errores de router lazy de v62.0 a v62.2 y su correccion, lo que lo hace util como referencia para depurar routers en arquitecturas MoE.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Exactitud held-out (ag_news, 4 clases) | 0,9076 | v62.3, particion 80/20, azar 0,25 |
| Exactitud held-out (v64.2, ag_news) | 0,9206 | Etapa MoA2, clasificacion de texto pseudo-multimodal |
| Exactitud held-out (v65.5, SNLI-VE) | 0,6424 | Tarea de redundancia visual, sin fusion VL |
| Exactitud held-out (v70.3, tarea visual real) | 0,5831 | MoA3 con fusion VL, tarea de relaciones espaciales |
| Exactitud held-out (v65.6, text_only) | 0,6364 | Referencia de ablacion |
| Equilibrio de carga de expertos (v62.3) | 0,612 | Cargas [0,350, 0,527, 0,572, 0,551], entropia 0,472 |
| Entropia de compuerta de slots (v62.3) | 0,647 | Activacion del 100 %, pesos medios [0,003, 0,171, 0,434, 0,392] |
| Deriva de salida entre versiones de transformers | max|Δy| = 7,9e-05 | 5.16.1 frente a 5.21.0, relativo ~2e-7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas internas del autor sobre tareas concretas, no evaluaciones de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos safetensors ocupan 2,58 GB, por lo que la inferencia en fp32 requiere aproximadamente 2,6 GB solo para pesos, mas activaciones y backbones; en fp16 o bf16 se reduce a aproximadamente 1,3 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia bastar para inferencia en fp16; se recomienda A100 o H100 para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, dado el tamano reducido de los pesos.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` con `trust_remote_code=True` y `AutoModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de feature-extraction con codigo personalizado (`auto_map`), su compatibilidad con esos servidores no esta garantizada.
- Latencia y throughput: no disponibles. La model card indica que dos pases forward sobre la misma instancia son identicos (Δ = 0,000e+00), pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| HeteroMoEProjSpace-v2 | 645,19M | no disponible | Apache 2.0 | Fusion multimodal heterogenea con MoE y proyeccion dimensional |
| Qwen2.5-0.5B-Instruct | 494,03M | no disponible en esta ficha | Apache 2.0 | Modelo de lenguaje generativo, backbone del anterior |
| BERT-base / BERT-L4 | 11,17M (L4) | 512 tokens tipico | Apache 2.0 | Codificador de texto, backbone del anterior |
| ViT-base-patch16-224 | 86,39M | 224 px por parche | Apache 2.0 | Vision transformer, backbone del anterior |

Los tres backbones integrados son los comparables naturales, ya que el modelo publicado los incorpora. No se dispone de comparaciones con otros modelos de fusion multimodal de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: el pipeline es feature-extraction; no produce texto, codigo ni respuestas, por lo que no debe evaluarse con benchmarks de generacion.
- Los expertos de la capa de fusion estan inicializados aleatoriamente y descongelados, no extraidos de FFN reales, segun la propia model card.
- Las metricas publicadas (0,9076 en ag_news) corresponden a una clasificacion de 4 clases sobre un dataset concreto, no a capacidad general.
- La model card advierte que el checkpoint publicado corresponde a la generacion v62.x; las versiones posteriores (v63.0 en adelante) usan backbones distintos (Qwen3.5-2B, ModernBERT, SigLIP2) con dimensiones de proyeccion distintas, y cargar con `modal_dims` incorrectos fallara.
- Existe deriva numerica entre versiones de transformers: la salida `expected_y` se genero con transformers 5.21.0 y en 5.16.1 la diferencia maxima es de 7,9e-05; para reproducibilidad bit a bit hay que fijar la version.
- Las versiones v62.0 a v62.2 estan marcadas como obsoletas por un router lazy que nunca se optimizo; sus metricas de equilibrio de expertos son enganosas.
- Sesgos conocidos: no disponibles. Al entrenar sobre ag_news y food101, el modelo puede heredar sesgos de esos datasets.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero las representaciones pueden amplificar sesgos de los backbones.
- Idiomas soportados: no disponibles; los backbones tienen sus propias coberturas linguisticas, no documentadas para este modelo.
- Licencia Apache 2.0 permite uso comercial, pero el codigo personalizado (`trust_remote_code=True`) implica ejecutar codigo del autor, lo que requiere revision de seguridad en produccion.
- El repositorio tiene 46,8 GB de tamano total frente a 2,58 GB de pesos, por lo que la descarga completa incluye checkpoints y cache adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2
- GitHub (subpaquete v62): https://github.com/Microbiosis/hetero-moe/tree/main/research/aligner/v62_dimension_projection_space
- Repositorio de cache de datos: `hetero-moe-cache` (dataset, 4,46 GB)
- Repositorios historicos relacionados: `HeteroMoE-v1`, `HeteroMoE-v1-tuned`, `hetero-moe-router`, `hetero-moe-router-unfrozen`, `hetero-moe-shared-routed`, `hetero-moe-projspace`, `hetero-moe-dimspace`, `hetero-moe-align`, `hetero-moe-projspace-v2`
- Dataset de productos de video: `structure-film-public`
- Documentacion de versiones: `VERSIONS.md` dentro del repositorio de Hugging Face
