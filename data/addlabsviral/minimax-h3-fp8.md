# addlabsviral/minimax-h3-fp8

## Resumen

`addlabsviral/minimax-h3-fp8` es una cuantización FP8 weight-only del modelo de generación de vídeo MiniMax-H3, desarrollado originalmente por MiniMaxAI (asociado en fuentes externas a Hailuo AI 3.0). No se trata de un modelo nuevo ni de un lanzamiento oficial: es un derivado publicado por un tercero (`addlabsviral`) que reduce el peso de la partición `transformer` del pipeline para hacer viable su despliegue en hardware con menos memoria. El repositorio usa la librería `diffusers` y la clase `MiniMaxH3ModularPipeline`, con un flujo de trabajo declarado como `fl2va` (frame-to-video con audio).

El modelo base se describe en fuentes externas como un generador de vídeo multimodal nativo capaz de producir vídeo 2K con audio estéreo 3D sincronizado, tomando como entrada combinaciones de texto, imagen, vídeo y audio. La cuantización aplicada es `torchao Float8WeightOnlyConfig` en formato `e4m3`: los pesos se almacenan en FP8, pero el cómputo se realiza en bf16, de modo que el ahorro es fundamentalmente de memoria y no de velocidad de cálculo. El LoRA de tipo "turbo" ya está fusionado en los pesos, heredado de `addlabsviral/minimax-h3-combined`.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue para un modelo de vídeo de ~33 100 millones de parámetros que en bf16 resulta prohibitivo para la mayoría de equipos; por otro, advierte de que el repositorio es muy reciente (creado y actualizado el 28 de octubre de 2026, con 0 descargas y 0 likes) y de que el propio autor indica que faltan particiones por publicar (`text_encoder` Qwen3-VL y un segundo transformer).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión multimodal para generación de vídeo (deducido de la estructura del repo: `transformer/`, `text_encoder/` Qwen3-VL, VAE y schedulers); el detalle interno no está documentado en la información disponible |
| Parámetros totales | 33.130.877.696 (~33,1 B) según los safetensors publicados en el repositorio |
| Parámetros activos | No aplica: no se ha documentado una arquitectura MoE |
| Longitud de contexto | No disponible (modelo de vídeo; no se documenta ventana de contexto del codificador de texto) |
| Tipos de cuantización | FP8 weight-only `e4m3` (`torchao Float8WeightOnlyConfig`), cómputo en bf16; existe una variante FP4 del mismo autor (`addlabsviral/minimax-h3-fp4`) y fuentes externas mencionan NVFP4/BF16/INT8/INT4/GGUF para la familia |
| Idiomas soportados | No disponible |
| Licencia | `minimax-community-license` (identificador `other`; enlace en el repositorio) |
| Formato de pesos | `safetensors`, pipeline modular de `diffusers` (`MiniMaxH3ModularPipeline`) |
| Particiones cuantizadas | `transformer/` (FL2VA / i2v): FP8 weight-only con LoRA turbo fusionado |
| Particiones sin tocar | VAE, schedulers, tokenizer y processor en bf16 |
| Particiones pendientes | `text_encoder/` (Qwen3-VL) y el segundo transformer, según indica el autor |
| Tamaño del repositorio | 114,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-28 (actualizado el mismo día) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles de entrenamiento del modelo base: no se documentan el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. Lo que sí se deduce de la estructura del repositorio es que MiniMax-H3 es un pipeline de difusión modular compuesto por al menos un transformer de difusión (partición `transformer/`, con variantes FL2VA e image-to-video), un codificador de texto Qwen3-VL, uno o más VAE y schedulers, todo orquestado mediante `ModularPipeline` de `diffusers`. Fuentes externas lo describen como un modelo multimodal nativo que acepta texto, imagen, vídeo y audio como entradas y genera vídeo 2K con audio estéreo 3D sincronizado.

La innovación técnica de este repositorio concreto no está en el modelo, sino en la cuantización: se aplica `Float8WeightOnlyConfig` de `torchao` en `e4m3` únicamente a los pesos del transformer, manteniendo el cómputo en bf16. Esto reduce a la mitad, aproximadamente, el espacio ocupado por esos pesos respecto a bf16 (1 byte por parámetro), a costa de una desquantización por capa en tiempo de ejecución. El LoRA "turbo" ya está fusionado en los pesos, herencia del repositorio combinado del mismo autor, lo que evita tener que cargarlo por separado. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o destilación de pasos.

## Capacidades

- Generación de vídeo a partir de texto e imagen (flujos `fl2va` e `i2v`), según la nomenclatura del repositorio.
- Generación de audio sincronizado con el vídeo: las fuentes externas describen audio estéreo 3D integrado y vídeo de hasta 2K.
- Comprensión multimodal de entradas combinadas de texto, imagen, vídeo y audio, de acuerdo con la documentación del hub de terceros.
- Codificación de prompts mediante un `text_encoder` basado en Qwen3-VL (partición aún no cuantizada en este repo).
- Integración con `diffusers` mediante `ModularPipeline.from_pretrained(..., workflow="fl2va")`.
- Compatibilidad declarada con flujos de ComfyUI a través de los recursos del hub no oficial.
- Modo "turbo" implícito por el LoRA fusionado, orientado a reducir pasos de inferencia (no se especifica el número de pasos).
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento agéntico multi-paso; es un modelo generativo de vídeo, no un LLM de propósito general.

## Casos de uso

- **Generación de vídeo publicitario a partir de una imagen de producto**: usando el flujo `i2v`, se parte de un fotograma fijo del producto y se anima con un prompt de texto; el LoRA turbo fusionado reduce el número de pasos necesarios para obtener un clip utilizable en redes.
- **Prototipado rápido de storyboards con audio**: el pipeline `fl2va` permite generar clips cortos con audio asociado, útiles para presentar una idea a un cliente antes de invertir en producción real.
- **Iteración creativa en local sobre hardware de 80 GB**: al almacenar el transformer en FP8, el modelo cabe en una sola A100/H100 de 80 GB con márgenes para activaciones, algo inviable con los pesos en bf16 en muchas configuraciones.
- **Investigación sobre cuantización de modelos de difusión**: este repositorio sirve como caso práctico para medir el impacto de FP8 weight-only en calidad visual, coherencia temporal y sincronización audio-vídeo frente al modelo base.
- **Pipelines de generación de vídeo en ComfyUI**: los workflows del hub no oficial permiten encadenar este transformer con otros nodos (upscalers, interpolación de fotogramas) para postprocesar el resultado dentro de un grafo reproducible.
- **Comparativa de precisión en producción**: junto con `minimax-h3-fp4` y `minimax-h3-combined`, permite evaluar en un mismo entorno el compromiso entre VRAM, latencia y fidelidad antes de fijar una configuración definitiva.
- **Generación de material audiovisual multilingüe**: si el codificador Qwen3-VL admite prompts en varios idiomas (no confirmado en esta ficha), el modelo podría generar clips a partir de instrucciones en distintos idiomas sin cambiar de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para el transformer**: unos 33 GB solo para los pesos FP8 (33,1 B × 1 byte/parámetro). A ello hay que sumar activaciones, latentes de vídeo y el estado de cómputo en bf16, por lo que el consumo real del pipeline completo supera ampliamente esa cifra. Estimación orientativa, no confirmada por el autor.
- **VRAM del pipeline completo**: no disponible con precisión, porque el `text_encoder` Qwen3-VL (sin cuantizar en este repo) y el segundo transformer aún no están documentados en esta publicación. El repositorio ocupa 114,6 GB en total, lo que da una idea de la escala del conjunto.
- **GPU recomendadas**: H100 80 GB y A100 80 GB para ejecutar el pipeline completo sin offloading agresivo; RTX 6000 Ada 48 GB o L40S 48 GB como mínimo ajustado, probablemente con descarga secuencial de módulos.
- **GPU de consumo**: una RTX 4090 de 24 GB no puede alojar el transformer FP8 completo; requeriría `enable_model_cpu_offload`, `enable_sequential_cpu_offload` o block swapping, con una penalización de latencia considerable. No hay datos publicados de velocidad en estas configuraciones.
- **Opciones de despliegue**: `diffusers` con `ModularPipeline` (ruta oficial del repo), workflows de ComfyUI distribuidos por hubs de terceros, y variantes GGUF/INT4/INT8 mencionadas en guías externas para la familia MiniMax-H3 (no verificadas en este repositorio).
- **Requisito de software**: soporte de `torchao` y de operaciones FP8 `e4m3` en la GPU (arquitecturas Ada y Hopper en adelante). El cómputo sigue siendo bf16, así que la ganancia esperada es de memoria, no de throughput; de hecho, la desquantización por capa puede añadir una ligera sobrecarga.
- **Latencia y throughput**: no disponible. No se han publicado tiempos por clip, pasos de inferencia ni FPS de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión de pesos | Estado de las particiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `addlabsviral/minimax-h3-fp8` | ~33,1 B (safetensors del repo) | FP8 weight-only `e4m3`, cómputo bf16 | `transformer` FL2VA/i2v cuantizado; `text_encoder` y segundo transformer pendientes | `minimax-community-license` | 0 descargas, 0 likes; repositorio recién creado |
| `MiniMaxAI/MiniMax-H3` (upstream) | No disponible en la información | bf16 (modelo original) | Completo, según el autor del derivado | `minimax-community-license` | Repositorio oficial de referencia |
| `addlabsviral/minimax-h3-fp4` | No disponible | FP4 (8 bits declarados en los tags del repo) | No disponible | No disponible | Variante del mismo autor |
| `addlabsviral/minimax-h3-combined` | No disponible | No disponible | Repositorio combinado del que se hereda el LoRA turbo fusionado | No disponible | Variante del mismo autor |

No se dispone de datos verificados de otros modelos de vídeo comparables (por ejemplo, de la familia Wan u otros) en la información proporcionada, por lo que la comparación se limita a las variantes del propio MiniMax-H3.

## Limitaciones y advertencias

- **Cuantización de terceros, no oficial**: el repositorio lo publica `addlabsviral`, no MiniMaxAI. No hay validación de calidad, ni informe de degradación métrica frente al modelo bf16, ni revisión por parte del equipo original.
- **Repositorio incompleto**: el propio autor advierte de que faltan particiones por subir (`text_encoder` Qwen3-VL y el segundo transformer). Cargar el pipeline en este estado puede fallar o requerir mezclar precisión entre módulos.
- **Madurez nula**: 0 descargas y 0 likes, creado y actualizado el mismo día. No hay evidencia de que el pipeline se haya ejecutado de extremo a extremo tal como está publicado.
- **Licencia restrictiva y poco clara en la práctica**: `minimax-community-license` no es una licencia OSI estándar. Hay que leer el texto enlazado antes de cualquier uso comercial; esta ficha no puede confirmar si se permite monetizar los vídeos generados ni si se permite redistribuir los pesos cuantizados.
- **Riesgo de artefactos visuales**: en modelos de difusión de vídeo, la cuantización FP8 de pesos puede introducir degradación en detalle fino, coherencia temporal entre fotogramas y sincronización labial/audio. No se han publicado comparativas objetivas.
- **Idiomas no documentados**: se desconoce qué idiomas acepta el codificador de texto y si el rendimiento en castellano es equiparable al inglés.
- **Resolución 2K y audio estéreo 3D**: estas capacidades provienen de fuentes externas (hub no oficial y blogs), no de la model card del repositorio; no están verificadas de forma independiente.
- **Coste de infraestructura alto**: incluso en FP8, el transformer ronda los 33 GB de pesos; el pipeline completo exige GPUs de centro de datos o configuraciones con offloading que degradan la latencia.
- **Sin datos de rendimiento**: no hay benchmarks, tiempos ni métricas de calidad publicadas, lo que impide estimar el coste por clip en producción.
- **Riesgo de alucinación en el sentido generativo**: el modelo puede producir contenido visual o audio plausible pero incorrecto respecto al prompt; no aplica la noción de alucinación factual de un LLM, pero sí el riesgo de desviación semántica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/addlabsviral/minimax-h3-fp8
- Modelo upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante combinada (origen del LoRA turbo): https://huggingface.co/addlabsviral/minimax-h3-combined
- Variante FP4: https://huggingface.co/addlabsviral/minimax-h3-fp4
- Hub no oficial en GitHub: https://github.com/ai-models-lab/minimax-h3
- README del hub no oficial: https://github.com/ai-models-lab/minimax-h3/blob/main/README.md
- Guía externa con variantes de cuantización: https://www.stablediffusiontutorials.com/2026/08/minimax-h3.html
- Portal del hub: https://minimaxh3.run
