# LastEpisode/MiniMax-H3-FL-Singularity-Experimental

## Resumen

MiniMax H3 FL-Singularity es un merge experimental de pesos publicado por el usuario LastEpisode sobre el modelo de generacion de video MiniMax H3. No se trata de un modelo entrenado desde cero, sino de una combinacion aritmetica de dos checkpoints existentes: la variante FL distribuida por Comfy-Org (destilada con CFG, orientada a claridad visual) y el refinamiento Singularity de WarmBloodAban (orientado a iluminacion y texturas naturales, movimiento mas expresivo y mejor detalle facial en planos medios y largos). El objetivo declarado es reducir la "cerosidad" tipica de FL y el desenfoque de Singularity en solitario.

La release mas reciente, Episode MA50 v2, aplica una mezcla 50/50 sobre las proyecciones de atencion y MLP de los 50 bloques principales del transformer, manteniendo el resto de tensores de FL intactos. La unica diferencia entre v1 y v2 es la fuente del condicionamiento temporal (AdaLN): v2 usa la tabla y proyecciones de FL, mientras que v1 conserva las de Singularity.

El modelo esta pensado para flujos image-to-video en ComfyUI, con soporte de generacion condicionada por referencia y de primer/ultimo fotograma. Se distribuye en cuantizacion INT8 y W6A8, con un repositorio de 75,5 GB, bajo la MiniMax H3 Community License Agreement. Su naturaleza experimental y su caracter de merge lo hacen relevante para quien quiera evaluar variantes de H3 sin reentrenar, pero no como sustituto de un checkpoint oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (MiniMax H3); merge de pesos, no modelo entrenado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot y W6A8 (ambas variantes publicadas en los dos formatos) |
| Idiomas soportados | no disponible (modelo de video; no se documentan idiomas) |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 75,5 GB |
| Pipeline | image-to-video |
| Libreria | minimax-h3 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusion de MiniMax H3, un transformer con 50 bloques principales, bloques token-refiner, proyecciones de entrada/salida de video y audio, y frecuencias rotatorias. No hay entrenamiento: los pesos se construyen por interpolacion lineal `FL + 0.5 × (Singularity − FL)` en FP32 sobre cuatro matrices por bloque (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2`), es decir, 200 matrices en total, redondeadas a BF16 antes de cuantizar. Se elimina el prefijo `model.diffusion_model.` de Singularity para alinear los nombres de tensor con FL.

De FL se conservan sin cambios la proyeccion de condicionamiento, los dos bloques token-refiner, las ganancias de normalizacion, las proyecciones de entrada/salida de video y audio y las frecuencias rotatorias. La cuantizacion INT8 ConvRot se aplica solo a las 200 matrices mezcladas, con group size 256, escalado absmax por fila, aritmetica FP32 en CPU, 256 filas completas por chunk y `mseclip=False`, usando el cuantizador de Comfy-Org. El token refiner no se cuantiza ni se reemplaza y no se aplica pruning adicional. La variante v2 mantiene la `adaln_t_table` y proyecciones de FL; la v1 copia los 103 tensores de condicionamiento temporal de Singularity (tabla de timesteps, `adaln_proj.linear.weight` y `.bias` de los 50 bloques y capa final).

## Capacidades

- Generacion de video a partir de imagen (image-to-video) en el ecosistema ComfyUI.
- Generacion condicionada por referencia (reference-conditioned generation).
- Flujos de primer y ultimo fotograma (first/last-frame workflows).
- Mezcla de rasgos visuales: claridad de FL con iluminacion, texturas y movimiento de Singularity.
- Compatibilidad con adaptadores turbo: Pika Flex FL y DMAD H3 8-step funcionan en ambas variantes segun el autor.
- Compatibilidad con LoRA orientados a FL (variante fl-adaln) o a Singularity (variante sing-adaln).
- No se documentan capacidades de texto, codigo, tool calling, agentes ni audio generativo mas alla de las proyecciones de audio heredadas de H3.

## Casos de uso

- Prototipado rapido de image-to-video en ComfyUI: el checkpoint se carga directamente en el pipeline de H3 y permite generar clips animados a partir de una imagen fija sin entrenamiento adicional.
- Evaluacion comparativa de merges: util para medir, con el mismo prompt y semilla, las diferencias de nitidez y textura frente a FL puro y Singularity puro antes de fijar un checkpoint en produccion.
- Animacion de fotogramas clave en preproduccion: los flujos de primer/ultimo fotograma permiten interpolar movimiento entre dos imagenes de storyboard.
- Generacion condicionada por referencia para coherencia de personaje: útil en series cortas donde se necesita mantener rasgos faciales entre planos medios y largos.
- Integracion con stacks de LoRA: la variante fl-adaln sirve para LoRAs entrenados sobre FL y la sing-adaln para LoRAs de Singularity, lo que facilita reutilizar adaptadores existentes.
- Aceleracion con adaptadores turbo: combinado con DMAD H3 8-step o Pika Flex FL, permite reducir pasos de muestreo en pruebas de concepto con recursos limitados.
- Investigacion sobre tecnicas de merge: caso de estudio de interpolacion de pesos en modelos de difusion de video y de su impacto en la estetica y el movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta observaciones cualitativas: en pruebas con LoRA (Pika Flex FL y DMAD H3 8-step), la v2 sigue con mas fidelidad la accion entrenada y produce metraje mas limpio y natural, con menos artefactos granulosos que la v1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 75,5 GB y se distribuye en INT8 y W6A8, por lo que se requiere una GPU con memoria suficiente para el checkpoint cuantizado mas el overhead de activaciones del pipeline de video.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del checkpoint, se orienta a GPUs de datacenter (A100, H100) o a consumer de gama alta con suficiente VRAM.
- Compatibilidad con GPU de consumo: no confirmada por el autor; depende del backend de ComfyUI y de la cuantizacion elegida.
- Opciones de despliegue: ComfyUI (libreria declarada `minimax-h3`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 FL-Singularity (este) | Merge de difusion video | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, INT8 y W6A8 |
| MiniMaxAI/MiniMax-H3 | Modelo base oficial | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| Comfy-Org/MiniMax-H3 (FL) | Checkpoint destilado CFG | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Refinamiento de H3 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica entre estas variantes.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explicitamente como experimental y como merge de pesos, no como modelo entrenado; no hay garantia de estabilidad entre releases.
- Riesgo de artefactos: el propio autor describe problemas de "cerosidad" en FL y desenfoque en Singularity que el merge intenta mitigar, pero no elimina.
- Dependencia de la variante AdaLN: usar la variante equivocada con un LoRA entrenado para la otra fuente de condicionamiento puede degradar resultados.
- Compatibilidad limitada al ecosistema ComfyUI y a la libreria `minimax-h3`; no se documentan otros backends.
- Licencia restrictiva: queda sujeta a la MiniMax H3 Community License Agreement, que puede imponer condiciones al uso comercial; es necesario revisar LICENSE y NOTICE antes de desplegar.
- Idiomas no documentados: al ser un modelo de video, no se especifican capacidades multilingues.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a los checkpoints de origen.
- Riesgo de sesgos y alucinacion visual: no documentados por el autor; deben evaluarse en el dominio de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/LastEpisode/MiniMax-H3-FL-Singularity-Experimental
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint FL de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/54472221d27c695fca9621b0c3ed52f06c4af707/diffusion_models
- Refinamiento Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity/tree/1259cf16cd0b655ba691a32fb46a409142762972
- Adaptador DMAD H3 8-step: https://huggingface.co/ZhengmingYu/DMAD/blob/main/minimax_h3/dmad_minimax_h3_8step_full_critic_comfyui.safetensors
- Cuantizador de Comfy-Org: https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py
