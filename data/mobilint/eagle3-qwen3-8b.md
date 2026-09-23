# mobilint/EAGLE3-Qwen3-8B

## Resumen

EAGLE3-Qwen3-8B es un paquete de inferencia publicado por Mobilint, Inc. que implementa decodificación especulativa EAGLE-3 sobre el modelo Qwen/Qwen3-8B. No es un modelo entrenado desde cero ni un ajuste fino: se compone de un cuerpo destino cuantizado (Qwen3-8B), una cabeza draft de un solo bloque y una capa FC de proyección, todo compilado para la NPU ARIES de Mobilint. El repositorio incluye además `model.safetensors` con las tablas de embeddings base y draft y los mapas de vocabulario `d2t`/`t2d`.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de 8B con decodificación especulativa acelerada en hardware NPU en lugar de GPU, con modos de núcleo único y batch 1, lo que encaja en despliegues de borde o en instalaciones locales sin aceleradores NVIDIA. Por otro, publica de forma explícita la configuración del árbol de draft (`top_k=8`, `depth=4`, `num_assistant_tokens=26`) y las mediciones de throughput que la justifican, algo poco habitual en artefactos de este tipo.

El artefacto está atado a su ecosistema: los ficheros `.mxq` solo se cargan a través de `mblt-model-zoo` con el extra de transformers, y el paquete fija límites concretos de 4096 tokens de secuencia y batch 1. Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B) con decodificación especulativa EAGLE-3: cuerpo destino cuantizado + cabeza draft de un bloque + capa FC |
| Parámetros totales | 1.244.843.648 parámetros en `model.safetensors` (tablas de embeddings base y draft, mapas `d2t`/`t2d` y proyecciones FC); el recuento del cuerpo destino Qwen3-8B no se documenta en la ficha |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4096 tokens (máximo del paquete compilado para `aries-rb`) |
| Tipos de cuantización | W4V8 en el cuerpo destino; W4 en la cabeza draft y en la capa FC |
| Idiomas soportados | no disponible (la ficha no los declara; las mediciones de throughput usan prompts en inglés y coreano) |
| Licencia | Apache 2.0, con enlace a la licencia de Qwen/Qwen3-8B |
| Formato de pesos | `.mxq` (grafos compilados para NPU Mobilint) y `model.safetensors` (embeddings y mapas de vocabulario) |
| Dispositivo destino | `aries-rb` (tarjeta ARIES de Mobilint) |
| Modo de núcleo | `single` (un núcleo por grafo) |
| Batch | 1 |
| Framework de carga | `transformers` + `mblt_model_zoo[transformers]`, con `trust_remote_code=True` |
| Tamaño del repositorio | 15,6 GB |
| Configuración de árbol draft | `eagle3_tree_top_k=8`, `eagle3_tree_depth=4`, `num_assistant_tokens=26` |
| Fecha de creación en HuggingFace | 2026-09-23 (según los metadatos del repositorio) |
| Descargas / likes | 212 descargas / 0 likes |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder denso. Sobre él se aplica EAGLE-3, una técnica de decodificación especulativa en la que una cabeza draft ligera propone varios tokens candidatos y el modelo destino los verifica en paralelo, aceptando el prefijo correcto. Aquí la cabeza draft ocupa un único bloque y se acompaña de una capa FC de proyección, ambas cuantizadas a W4, mientras que el cuerpo destino se cuantiza a W4V8. Los artefactos se compilan para la NPU ARIES en modo de núcleo único y batch 1.

La configuración del árbol de draft no es la del release de 4B del mismo fabricante: `top_k=8` y `depth=4` se eligieron mediante un barrido de throughput de decodificación sobre `aries-rb`. En cada paso de decodificación la cabeza draft ejecuta `depth` llamadas a la NPU y construye un conjunto de candidatos de `top_k + (depth-1) * top_k²` = 200 nodos, de los cuales se entregan `num_assistant_tokens - 1` al modelo base para verificación. Los parámetros que más influyen son `depth` y `num_assistant_tokens`; `top_k` apenas cambia el resultado entre 5 y 8 (±0,7 %), y `depth=6` resulta entre un 6 % y un 14 % más lento que `depth=4` en este modelo.

La ficha del repositorio no documenta el dataset de entrenamiento de la cabeza draft, el número de tokens utilizados, ni si hubo RLHF o DPO. Tampoco se detalla cómo se generaron los datos de destilación para la cabeza EAGLE-3 en esta versión concreta.

## Capacidades

- Generación de texto conversacional: el repositorio es un artefacto de inferencia para `text-generation`, con soporte de plantilla de chat mediante `apply_chat_template`.
- Herencia de las capacidades del destino Qwen3-8B: razonamiento, generación de código y matemáticas, en la medida en que el cuerpo destino las conserve tras la cuantización W4V8 (no se publican evaluaciones al respecto).
- Modo thinking: la plantilla de chat activa el modo de razonamiento de Qwen3 por defecto. El propio autor advierte que el texto de cadena de pensamiento es más difícil de predecir para la cabeza draft y reduce el throughput aproximadamente un 17 %.
- Decodificación especulativa con árbol configurable: `num_assistant_tokens`, `eagle3_tree_top_k` y `eagle3_tree_depth` se pueden sobrescribir por llamada a `generate`.
- Multilingüismo: no declarado en la ficha. Las mediciones del autor incluyen prompts en inglés y coreano, con ratios de aceptación de 2,6 a 3,8 tokens por paso según idioma y modo de thinking.
- Ejecución en NPU: los grafos compilados permiten inferencia en hardware ARIES sin GPU.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible. Cualquier soporte de este tipo dependería del modelo destino, pero no está verificado en este paquete.

## Casos de uso

- Asistente conversacional en local sin GPU: el paquete está compilado para una tarjeta ARIES con batch 1 y 4096 tokens de contexto, lo que permite desplegar un chat de 8B en una máquina con NPU y sin acelerador NVIDIA.
- Entornos air-gapped o con requisitos de soberanía de datos: al ejecutarse sobre hardware dedicado y no depender de APIs en la nube, encaja en instalaciones donde el texto no puede salir del perímetro.
- Agentes de razonamiento multi-paso con thinking activado: para tareas que requieren cadena de pensamiento, aceptando el coste de throughput (8,5 tok/s medidos). Si la tarea no necesita razonamiento explícito, desactivar thinking sube el rendimiento a 10,1 tok/s.
- Generación y revisión de código asistida: el destino Qwen3-8B es competente en código; en este despliegue se usaría para autocompletado o revisión en un IDE o en un pipeline de CI con latencia predecible y sin dependencia de GPU.
- Resumen y extracción de información de documentos de hasta 4096 tokens: el límite de secuencia del paquete compilado encaja con actas, informes o tickets extensos, procesados uno a uno en batch 1.
- Atención al cliente automatizada de baja concurrencia: con batch 1 y un throughput de 8,5 a 10,1 tok/s, es adecuado para asistentes internos o de bajo volumen, no para servicios con cientos de usuarios simultáneos.
- Investigación en decodificación especulativa: el repositorio publica la configuración completa del árbol draft y sus barridos, lo que permite reproducir y comparar estrategias de `depth`, `top_k` y `num_assistant_tokens` sobre el mismo hardware.
- Procesamiento por lotes nocturno de textos en inglés o coreano: dado el rango de aceptación documentado por idioma, se puede planificar la capacidad en función del idioma de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). El autor solo publica mediciones de throughput de decodificación sobre una única tarjeta ARIES, decodificación greedy, 256 tokens de salida y promedio de cuatro prompts en inglés y coreano.

| Configuración | Thinking activado | Thinking desactivado |
|---|---|---|
| `depth=4`, `num_assistant_tokens=26` (valores de fábrica) | 8,5 tok/s | 10,1 tok/s |

| Métrica | Valor |
|---|---|
| Aceptación (`tokens_per_step`, incluyendo el token propio del modelo base) | 2,6 – 3,8 según idioma y modo de thinking |
| Latencia por token derivada de los datos de fábrica | ~118 ms con thinking activado; ~99 ms con thinking desactivado |
| Efecto del modo thinking | Caída de throughput de ~17 % con thinking activado |
| Alternativa recomendada con thinking activado | `depth=3` y `num_assistant_tokens=16`, ~4 % más rápido que la configuración de fábrica |
| Efecto de `top_k` | Apenas relevante entre 5 y 8 (±0,7 %) |
| Efecto de `depth=6` | Entre 6 % y 14 % más lento que `depth=4` en este modelo |

El propio autor advierte que estas cifras provienen de un único host y un único conjunto de prompts, y que deben tratarse como indicativas y no como especificación.

## Requisitos de hardware

- Hardware obligatorio: tarjeta Mobilint ARIES, con dispositivo destino `aries-rb`. Los ficheros `.mxq` son grafos compilados para esa NPU y no se ejecutan en GPUs convencionales.
- VRAM en GPU: no aplicable. No se documenta ningún camino de ejecución sobre CUDA, ROCm o Metal.
- GPUs tipo A100, H100 o RTX 4090: no soportadas por este paquete. Para usar el mismo modelo sobre GPU habría que recurrir a Qwen/Qwen3-8B y a otra implementación de EAGLE-3.
- Modo de ejecución: un solo núcleo por grafo (`single`), batch 1 y longitud máxima de secuencia de 4096 tokens, lo que limita la concurrencia y el tamaño de contexto.
- Almacenamiento: el repositorio ocupa 15,6 GB, correspondientes al cuerpo de 8B cuantizado, la cabeza draft y la capa FC.
- Despliegue: instalación de `mblt-model-zoo` con el extra de transformers (`pip install "mblt_model_zoo[transformers]"`) y carga mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- Throughput medido: 8,5 tok/s con thinking activado y 10,1 tok/s con thinking desactivado en una tarjeta ARIES, greedy y 256 tokens de salida.
- Aceptación especulativa: entre 2,6 y 3,8 tokens por paso, en función del idioma y del modo de thinking.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|---|
| mobilint/EAGLE3-Qwen3-8B | Cabeza draft EAGLE-3 + destino Qwen3-8B cuantizado (W4V8 / W4) | 1.244.843.648 tensores en safetensors (embeddings y FC); el cuerpo es Qwen3-8B | 4096 tokens | Apache 2.0 | NPU Mobilint ARIES (`aries-rb`), 1 núcleo, batch 1 | 212 descargas en HuggingFace |
| Qwen/Qwen3-8B | Modelo base, transformer denso | no disponible en la información recogida | no disponible en la información recogida | Apache 2.0 | GPU convencional o CPU | Modelo de referencia del ecosistema Qwen |
| mobilint/Qwen3-8B | Mismo modelo destino compilado para NPU Mobilint, sin cabezas EAGLE-3 documentadas | no disponible en la información recogida | no disponible | Apache 2.0 | NPU Mobilint ARIES | Publicado por el mismo autor |
| AngelSlim/Qwen3-8B_eagle3 | Cabeza EAGLE-3 para Qwen3-8B orientada a GPU | no disponible en la información recogida | no disponible | no disponible | GPU | Publicado en ModelScope |

La comparación cuantitativa de rendimiento entre estas alternativas no es posible con los datos recogidos: solo el paquete de Mobilint publica cifras de throughput, y lo hace sobre hardware propietario, por lo que no son trasladables a las otras opciones.

## Limitaciones y advertencias

- Dependencia de hardware propietario: sin una tarjeta Mobilint ARIES y la librería `mblt-model-zoo`, el paquete no es utilizable. No hay conversión documentada a GGUF, ONNX ni a formatos de GPU.
- Límites de despliegue fijos: batch 1 y 4096 tokens de secuencia máxima, lo que descarta escenarios de alta concurrencia o contextos largos.
- Ejecución de código remoto: la carga exige `trust_remote_code=True`, ya que el repositorio incluye `proxy_qwen3_eagle3.py` como shim de `auto_map`. Conviene revisar ese código antes de ejecutarlo en producción.
- Degradación con razonamiento: el modo thinking, activado por defecto en la plantilla de chat de Qwen3, reduce el throughput aproximadamente un 17 % porque la cadena de pensamiento es menos predecible para la cabeza draft.
- Idiomas: la ficha no declara idiomas soportados. Las mediciones solo cubren inglés y coreano, y la aceptación especulativa varía según el idioma, lo que afecta al rendimiento real.
- Riesgo de alucinación: heredado del modelo destino Qwen3-8B, no cuantificado en esta ficha. La cuantización W4V8 del cuerpo puede además introducir pérdida de calidad respecto al modelo en precisión completa, sin que se publiquen evaluaciones al respecto.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad para este paquete. Al derivar de Qwen3-8B, arrastra los sesgos del modelo base, no auditados aquí.
- Licencia: el paquete se distribuye bajo Apache 2.0 y enlaza a la licencia de Qwen/Qwen3-8B. Conviene verificar los términos aplicables del modelo base antes de un uso comercial.
- Rendimiento no garantizado: las cifras de throughput proceden de un único host y un único conjunto de prompts, y el propio autor las califica de indicativas.
- Metadatos con fecha futura: el repositorio figura creado el 2026-09-23, lo que puede ser una errata de los metadatos; no se ha podido verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/EAGLE3-Qwen3-8B
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Versión compilada sin EAGLE-3 del mismo autor: https://huggingface.co/mobilint/Qwen3-8B
- Librería de despliegue mblt-model-zoo: https://github.com/mobilint/mblt-model-zoo
- Sitio del fabricante: https://mobilint.com
- Implementación oficial de EAGLE-1, EAGLE-2 y EAGLE-3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Otra implementación de EAGLE-3: https://github.com/cry-daniel/EAGLE3
- Cabeza EAGLE-3 para Qwen3-8B en ModelScope: https://www.modelscope.cn/models/AngelSlim/Qwen3-8B_eagle3
