# MisterNatural/Qwen3.8-9B-Distill-heretic-ComfyUI

## Resumen

Qwen3.8-9B-Distill-heretic-ComfyUI es una adaptación para ComfyUI del modelo petruhonk/Qwen3.8-9B-Distill-uncensored-heretic, que a su vez es una ablación de censura (abliteration) del modelo empero-ai/Qwen3.8-9B-Distill. La intervención se realizó con la herramienta heretic, que busca automáticamente la intensidad mínima de intervención mediante un barrido en tres etapas (gruesa, media y fina, con 60 ensayos en la etapa final). El repositorio lo publica el usuario MisterNatural y ofrece dos formatos de pesos listos para su uso en ComfyUI: BF16 y W4A8.

El modelo parte de una base de 9B parámetros (la model card no detalla la arquitectura interna más allá de la existencia de 32 capas principales y un bloque MTP). La intervención heretic solo modificó las proyecciones `attn.o_proj` y `mlp.down_proj` de las 32 capas principales, dejando intacto el bloque MTP (multi-token prediction) de los pesos base. El resultado es un modelo derivado con la censura atenuada, empaquetado en formato de archivo único compatible con ComfyUI.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho (0 descargas, 0 likes en el momento de la consulta) orientado a flujos de trabajo de ComfyUI, no a despliegues de inferencia de texto convencionales. La información pública disponible es escasa y proviene casi exclusivamente de la model card del propio repositorio y de los modelos encadenados en su linaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-9B-Distill; 32 capas principales + bloque MTP); detalles completos no disponibles |
| Parametros totales | 9B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y W4A8 (4 bits pesos + 8 bits activaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors de archivo único (`diffusion-single-file`), adaptado a ComfyUI |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.8-9B-Distill, con 32 capas principales y un bloque MTP (multi-token prediction) preservado de los pesos base. La model card confirma que la abliteration solo afectó a `attn.o_proj` y `mlp.down_proj` en las 32 capas principales, mientras que el bloque MTP quedó sin tocar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica destacable es el proceso de abliteration automatizado con heretic, que realiza un barrido en tres etapas (coarse → mid → fine) con 60 ensayos en la etapa final para encontrar la intervención mínima que reduce el rechazo sin degradar en exceso las capacidades. El repositorio añade además una adaptación de los pesos para ComfyUI y una cuantización W4A8 (4 bits en pesos, 8 bits en activaciones) mediante el toolkit convert_to_quant de silveroxides, con la variante W4A8 aún en forma de PR abierto (rama feature/w4a8-convrot de Hullabalo).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-9B-Distill; no se detallan capacidades específicas en la información disponible.
- Modo "uncensored": la abliteration reduce los rechazos del modelo original, lo que cambia el comportamiento ante solicitudes que el modelo base rechazaría.
- Bloque MTP preservado: los tensores `mtp.*` se mantienen como pesos base sin modificar, lo que en principio permite decodificación multi-token si el runtime lo soporta.
- Integración con ComfyUI: pesos empaquetados como archivo único (`diffusion-single-file`) para su carga directa en flujos de ComfyUI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Vision, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Flujos de generación de texto en ComfyUI: el modelo se carga como archivo único en un nodo de ComfyUI, lo que permite integrar generación de texto dentro de pipelines visuales que ya usan difusión u otros modelos, sin necesidad de un servidor de inferencia separado.
- Experimentación con abliteration: investigadores que estudian el efecto de la ablación de censura pueden comparar el BF16 (referencia de calidad) con el W4A8 (compromiso memoria/calidad) sobre el mismo linaje de pesos.
- Prototipado en GPU de consumo: la variante W4A8 reduce el requisito de VRAM a ~10 GB, lo que permite probar el modelo en tarjetas de gama alta para consumidores sin depender de hardware de centro de datos.
- Evaluación de decodificación multi-token: al conservarse el bloque MTP intacto, el modelo sirve para probar implementaciones de decodificación especulativa o multi-token en runtimes que lo soporten.
- Generación de texto sin restricciones en entornos controlados: para casos donde el rechazo del modelo base interfiere con la tarea (por ejemplo, ficción o investigación creativa), la versión heretic reduce las negativas, siempre dentro de los límites legales y éticos aplicables.
- Referencia de calidad BF16: usar la variante BF16 (~19,3 GB de VRAM) como línea base para medir la degradación introducida por la cuantización W4A8 en tareas concretas del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~19,3 GB para BF16 y ~10 GB para W4A8 (según la model card; depende de configuración de inferencia, longitud de contexto, resolución y runtime).
- GPU recomendadas: la model card indica "cualquier GPU moderna" para BF16 y "kernels compatibles" para W4A8; no se especifican modelos concretos.
- GPU de consumo: el W4A8 (~10 GB) cabe en tarjetas de gama alta para consumidores con 12-16 GB o más; el BF16 (~19,3 GB) requiere 24 GB o más para caber con holgura.
- Opciones de despliegue: ComfyUI (formato nativo del repositorio); otros runtimes no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MisterNatural/Qwen3.8-9B-Distill-heretic-ComfyUI | 9B | no disponible | apache-2.0 | safetensors single-file (BF16, W4A8) | Adaptación ComfyUI con abliteration |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic | 9B | no disponible | no disponible | no disponible | Modelo base directo de esta adaptación |
| empero-ai/Qwen3.8-9B-Distill | 9B | no disponible | no disponible | no disponible | Modelo original sin abliteration |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta idiomas, contexto, benchmarks ni composición del entrenamiento; cualquier evaluación de producción requiere pruebas propias.
- Sesgos: la abliteration puede alterar el comportamiento del modelo de formas no medidas; no hay evaluación publicada de sesgos ni de seguridad tras la intervención.
- Riesgo de alucinación: no cuantificado en la información disponible; el proceso de abliteration puede degradar capacidades además de reducir rechazos.
- Idiomas: no se especifican los idiomas soportados; no asumir multilingüismo sin verificación.
- Licencia: el repositorio declara apache-2.0, pero la model card remite a los términos del modelo original; conviene verificar la licencia de toda la cadena (empero-ai → petruhonk → MisterNatural) antes de uso comercial.
- Cuantización W4A8: la propia model card indica que la cuantización W4A8 es un PR abierto en el toolkit convert_to_quant, por lo que su soporte y estabilidad pueden ser limitados.
- Formato de nicho: el empaquetado `diffusion-single-file` está pensado para ComfyUI; no es un formato estándar para servidores de inferencia de texto (vLLM, TGI, llama.cpp).
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de su funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MisterNatural/Qwen3.8-9B-Distill-heretic-ComfyUI
- Modelo base directo: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Modelo original: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Herramienta heretic: https://github.com/p-e-w/heretic
- Toolkit de cuantización convert_to_quant: https://github.com/silveroxides/convert_to_quant
- Rama W4A8 de convert_to_quant: https://github.com/Hullabalo/convert_to_quant/tree/feature/w4a8-convrot
