# Efficient-Large-Model/Open-H3-Regenerate-2K-IC

## Resumen

Open-H3-Regenerate-2K-IC es un adaptador LoRA de refinado y superresolución de vídeo desarrollado por Efficient-Large-Model sobre el modelo de vídeo MiniMax-H3 de MiniMax. Su función concreta es tomar un borrador de vídeo de baja resolución generado por MiniMax-H3 (768P, 1344×768) y regenerarlo a 1080P, 2K (2560×1440) o 4K (3840×2160) preservando la identidad facial, el sincronizado labial, el lettering y la composición del borrador original.

Técnicamente no es un modelo independiente, sino un LoRA de rango 384 y alpha 384 aplicado sobre 312 capas lineales del transformador `transformer_ref` de MiniMax-H3, que recibe el borrador como vídeo de referencia en contexto (de ahí el sufijo IC, *in-context*). El repositorio incluye además el modelo base en formato Diffusers, un upscaler latente 3D convolucional propio, un decodificador VAE rápido no causal de 24 capas y los LoRA auxiliares HyperFlow de 8 pasos y LMS Sharp.

Es relevante porque aborda un problema práctico del pipeline de vídeo generativo: la generación directa a alta resolución es computacionalmente prohibitiva, mientras que regenerar un borrador ya validado permite iterar con coste controlado sin perder el contenido aprobado por el usuario. El repositorio ocupa 162,9 GB e incluye todo el código de inferencia necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformador de difusión de vídeo MiniMax-H3 (`transformer_ref`, Ref2VA) |
| Parametros totales | No disponible (depende del modelo base MiniMax-H3; el LoRA tiene rango 384 sobre 312 lineales) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el LoRA se distribuye en FP32; el modelo base en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (LoRA y componentes del modelo base en Diffusers) |

## Arquitectura y entrenamiento

El componente central es un LoRA de rango 384 y alpha 384 que se aplica sobre 312 capas lineales del transformador `transformer_ref` de MiniMax-H3, la variante Ref2VA (referencia a vídeo con audio) del modelo. El borrador de baja resolución se introduce como vídeo de referencia en el contexto del transformador, de modo que el LoRA genera la versión de alta resolución condicionada por ese borrador. Sobre el LoRA se apilan en tiempo de carga dos adaptadores auxiliares: el HyperFlow de 8 pasos (que reduce el número de pasos de muestreo) y el LMS Sharp v1.0 (que actúa como refuerzo de nitidez). Para runtimes que solo admiten un LoRA por modelo, el script `merge_lora.py` concatena los factores del LoRA IC y de Sharp a lo largo del eje de rango.

El pipeline de inferencia incorpora un upscaler latente 3D convolucional propio que amplía el borrador antes del muestreo, y un decodificador VAE rápido (no causal, 24 capas) que sustituye al VAE estándar de H3. Los samplers `up3` y `up4` amplían el latente, lo añaden ruido hasta σ 0,835 y σ 0,923 respectivamente y ejecutan los últimos 3 o 4 puntos de la rejilla HyperFlow de 8 pasos; el sampler `hf8` parte de ruido y ejecuta los 8 pasos completos. Todos usan CFG 1. El transformador se reparte entre 1, 2, 4, 7 u 8 GPUs mediante FSDP y *context parallelism* Ulysses. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Regeneración de vídeo a alta resolución: convierte un borrador de 768P (1344×768) en salidas de 1080P (1920×1080), 2K (2560×1440) o 4K (3840×2160).
- Preservación de contenido del borrador: mantiene rostros, sincronizado labial, lettering y layout del clip original.
- Modo de escalado desde borradores de muy baja resolución: `--resolution 768p --lq` parte de borradores de 384P, 512P o 576P.
- Control de nitidez ajustable mediante el parámetro `--sharp` (fuerza de LMS Sharp, 1.0 por defecto, 0 lo desactiva).
- Selección de decodificador VAE: rápido (`fast`) o el VAE estándar publicado de H3.
- Procesamiento por lotes: entrada `--jobs` en JSONL con múltiples clips, cargando el modelo una sola vez.
- Condicionamiento por texto: acepta el mismo prompt (`--caption`) que generó el borrador, sin necesidad de ingeniería de prompt adicional; puede dejarse vacío.
- No se documentan capacidades de tool calling, agentes ni multilingüismo.

## Casos de uso

- Finalización de vídeo generativo en producción: un equipo genera borradores rápidos a 768P con MiniMax-H3, los revisa y aprueba, y solo entonces ejecuta este LoRA para obtener la versión 2K o 4K, reduciendo el coste de cómputo frente a generar directamente en alta resolución.
- Restauración de material con caras y diálogo: al preservar identidad facial y sincronizado labial, es adecuado para clips con personas hablando donde un upscaler genérico degradaría la coherencia temporal de los rostros.
- Escalado de material con rotulación: mantiene el lettering y el layout, útil para piezas con texto en pantalla donde el reescalado convencional produce artefactos en los bordes de las letras.
- Remasterización de archivos de baja resolución: el modo `--lq` permite partir de borradores de 384P, 512P o 576P y llevarlos a 768P, cubriendo material de archivo o generaciones antiguas.
- Procesamiento por lotes de catálogos de vídeo: el modo `--jobs` con JSONL permite encolar múltiples clips con una sola carga del modelo, adecuado para pipelines nocturnos o de renderizado en cola.
- Iteración rápida en estudio creativo: el sampler `up3` de 3 pasos con CFG 1 ofrece el ciclo más corto para previsualizar el resultado final antes de lanzar un `hf8` de mayor calidad.
- Despliegue multi-GPU en clúster: el sharding FSDP con context parallelism Ulysses permite repartir el transformador entre 1 y 8 GPUs, encajando en infraestructuras de nodos con 8 aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 162,9 GB, incluyendo el modelo base en Diffusers, los LoRA, el upscaler latente y el VAE rápido; el espacio en disco debe dimensionarse en consecuencia.
- El transformador puede repartirse entre 1, 2, 4, 7 u 8 GPUs mediante FSDP y context parallelism Ulysses; la configuración de referencia del autor usa `torchrun --nproc_per_node 8`.
- No se especifican cifras de VRAM por GPU ni modelos de tarjeta concretos (A100, H100, RTX 4090) en la información disponible.
- No se indica si el modelo cabe en GPU de consumo; dado el tamaño del repositorio y el sharding multi-GPU previsto, no puede confirmarse.
- Opciones de despliegue documentadas: el propio `infer/infer.py` con `torchrun`, y `merge_lora.py` para runtimes que cargan un único LoRA por modelo.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Resolución de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Open-H3-Regenerate-2K-IC | LoRA de refinado sobre MiniMax-H3 | No disponible (LoRA rango 384, 312 lineales) | No disponible | Hasta 4K (3840×2160) | MiniMax H3 Community (excluye UE, UK, Corea del Sur, EE. UU.) | Hugging Face, código en GitHub |
| MiniMax-H3 (base) | Modelo de generación de vídeo | No disponible | No disponible | 768P en borrador | MiniMax H3 Community | Hugging Face |
| Upscalers de vídeo genéricos | Superresolución | No disponible | No disponible | Variable | Variable | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community excluye explícitamente la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos de América; el uso desde esas jurisdicciones queda restringido por los términos.
- No es un producto oficial de MiniMax; el autor lo declara explícitamente.
- Depende del modelo base MiniMax-H3 y de sus componentes; no funciona de forma autónoma.
- Los componentes de terceros conservan sus propias licencias: HyperFlow (MiniMax H3 Community), upscaler latente (pesos Apache-2.0, código MIT), VAE rápido (MiniMax H3 Community, código Apache-2.0), codificador de texto Qwen3-VL (licencia propia) y LMS Sharp LoRA de Alissonerdx (términos propios).
- El repositorio incluye solo los componentes que usa el pipeline IC; quedan fuera el `transformer/` de T2V, el VAE de audio y las carpetas nativas `FL2VA/` y `Ref2VA/`.
- El audio latente silencioso de `assets/` es obligatorio para la inferencia.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe.
- No se especifican requisitos mínimos de VRAM ni rendimiento medido, lo que dificulta planificar el despliegue.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K-IC)
- [Página del proyecto](https://nvlabs.github.io/Sana/Open-H3-Regenerate-2K/#ic)
- [Código en GitHub (NVlabs/Sana)](https://github.com/NVlabs/Sana/tree/sol-engine/models/Open-H3-Regenerate-2K/IC)
- [Modelo base MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Licencia MiniMax H3 Community](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/42ed227ee7df40d41602854ae760620d6eb651fe/LICENSE)
- [Revisión del modelo base usada (42ed227)](https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/42ed227ee7df40d41602854ae760620d6eb651fe)
- [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
