# berryber09/MiniMax-H3-10Eros-beta2-fl2va-w4a8

## Resumen

MiniMax-H3 10Eros-Max beta2 (FL2VA) W4A8 es una cuantización extrema del modelo de generación de texto a vídeo `10Eros_Max_h3_fl2va_beta2_pruned`, un ajuste fino de la familia MiniMax-H3 (Hailuo AI 3.0) publicado por el usuario berryber09. El modelo original en bf16 ocupa unos 40 GB; esta versión cuantizada reduce el peso a aproximadamente 11,7 GB, un 68,8 % menos, lo que permite ejecutarlo en tarjetas gráficas de consumo con 24 GB de VRAM con margen.

La cuantización utiliza el formato `asym_w4a8_int8` con `group_size=16` y `convrot_groupsize=256`, aplicando un codebook Lloyd-Max por tensor y escalas fp8 por grupo, siguiendo el layout W4A8 de Kijai / comfy-kitchen. Se cuantizan 200 capas lineales 2D, que representan el 96 % de los bytes objetivo del modelo, manteniendo en mayor precisión las capas de normalización, la primera y la última. El modelo se distribuye como un experimento comunitario para su uso dentro de ComfyUI y hereda la licencia del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (variante FL2VA) ajustada, cuantización W4A8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, sin contexto textual explicito) |
| Tipos de cuantizacion | W4A8 (`asym_w4a8_int8`, group_size=16, convrot_groupsize=256, codebook Lloyd-Max per-tensor, escalas fp8 por grupo) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo fuente TenStrip/10Eros-Max) |
| Formato de pesos | safetensors (layout W4A8 de comfy-kitchen, compatible con ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es `TenStrip/10Eros-Max`, un ajuste fino de la familia MiniMax-H3, que es un modelo nativo multimodal de generacion de video de 2K con audio 3D estereo sincronizado, desarrollado por MiniMax (Hailuo AI 3.0). La variante FL2VA se refiere a un submodulo especifico dentro del repositorio oficial de MiniMax-H3, probablemente relacionado con la generacion de fotogramas o el decodificador de video.

La cuantizacion W4A8 se aplico con la herramienta `comfyui-mixed-quantizer` usando el formato `w4a8`, `group-size 16` y `codebook-mode fit`. Se cuantizaron 200 capas lineales 2D, que suponen el 96 % de los bytes objetivo. Las capas de normalizacion, la primera y la ultima se mantienen en mayor precision para preservar la estabilidad numerica. La calidad de reconstruccion se evaluo con metrica relL2 de aproximadamente 0.073 (limite aceptable 0.25), SNR de 22.8 dB y similitud coseno de 0.9973, lo que indica una perdida de precision baja para una cuantizacion tan agresiva.

No se dispone de informacion sobre el dataset de entrenamiento del modelo original ni sobre el proceso de ajuste fino de 10Eros-Max.

## Capacidades

- Generacion de video a partir de texto: el modelo recibe una descripcion textual y produce una secuencia de fotogramas de video.
- Generacion de imagenes: segun la verificacion del autor, el modelo tambien puede ejecutar generacion de imagenes individuales (se menciona "image still executed in ~28 s").
- Soporte de audio sincronizado: la familia MiniMax-H3 incluye audio 3D estereo sincronizado con el video, aunque no se confirma que esta cuantizacion conserve dicha capacidad.
- Compatibilidad con ComfyUI: el modelo se carga mediante el loader nativo de diffusion models de ComfyUI, integrandose en flujos de trabajo de generacion de video.
- Cuantizacion extrema W4A8: permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, algo inviable con los 40 GB del original en bf16.

## Casos de uso

- Prototipado rapido de generacion de video en local: un desarrollador puede integrar el modelo en ComfyUI y generar clips cortos de video desde prompts de texto en una RTX 3090 o similar, sin necesidad de infraestructura en la nube.
- Experimentacion con cuantizacion agresiva: sirve como caso de estudio para evaluar el impacto de W4A8 con group size 16 en modelos de video de gran tamano, comparando la calidad visual con el modelo bf16 original.
- Generacion de storyboards o previsualizaciones: directores o disenadores pueden usar el modelo para crear bocetos animados de escenas a partir de guiones textuales, gracias a su baja huella de memoria.
- Educacion e investigacion en compresion de modelos: investigadores pueden analizar las metricas de reconstruccion (relL2, SNR, coseno) y el comportamiento de las capas cuantizadas para mejorar tecnicas de cuantizacion en modelos multimodales.
- Despliegue en entornos con VRAM limitada: estudios pequenos o creadores independientes que disponen de una unica GPU de 24 GB pueden ejecutar el modelo sin recurrir a servidores dedicados.
- Pruebas de integracion con ComfyUI: desarrolladores de nodos personalizados pueden verificar la compatibilidad de sus flujos con el layout W4A8 de comfy-kitchen y el loader nativo de ComfyUI v0.31.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de generacion de video, no de lenguaje o razonamiento. El autor proporciona metricas de calidad de reconstruccion tras la cuantizacion:

| Metrica | Valor |
|---|---|
| relL2 | ≈ 0.073 (limite aceptable 0.25) |
| SNR | ≈ 22.8 dB |
| Similitud coseno | ≈ 0.9973 |
| Tamano del modelo | ≈ 11.7 GB (68.8 % menor que el bf16 de 40 GB) |
| Tiempo de generacion de imagen | ≈ 28 s en RTX 3090 |

No hay comparacion con otros modelos cuantizados de video en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 11.7 GB en disco, por lo que cabe en una GPU de 24 GB con margen para activaciones y buffers de ComfyUI.
- GPU recomendadas: RTX 3090, RTX 4090, A5000, A6000 o cualquier GPU con CUDA SM ≥ 8.0 (Ampere o superior). Verificado en RTX 3090 (SM 8.6).
- GPU de consumo: si, cabe en RTX 3090 y RTX 4090 (24 GB). No se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: ComfyUI ≥ v0.31.0 con loader nativo W4A8, o usando el parche `comfyui_w4a8_loader.patch`. Requiere comfy-kitchen con `AsymW4A8Int8Layout` (PR #90).
- Latencia y throughput: generacion de una imagen en aproximadamente 28 segundos en RTX 3090. No hay datos de generacion de video completa.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | VRAM requerida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TenStrip/10Eros-Max (bf16 original) | ~40 GB | bf16 | 48 GB+ (o 2x24 GB) | other | HuggingFace |
| berryber09/MiniMax-H3-10Eros-beta2-fl2va-w4a8 | ~11.7 GB | W4A8 | 24 GB | other (hereda) | HuggingFace |
| berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8 | no disponible | W4A8 | 24 GB (estimado) | other | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas versiones. La ventaja principal de la version cuantizada es la reduccion de memoria y la viabilidad en GPUs de consumo, a costa de una posible degradacion visual no cuantificada en benchmarks publicos.

## Limitaciones y advertencias

- Es un experimento comunitario, no un lanzamiento oficial de MiniMax. No hay garantias de soporte ni mantenimiento.
- La licencia es "other" y hereda la del modelo fuente TenStrip/10Eros-Max. Es imprescindible revisar los terminos de esa licencia antes de cualquier uso comercial.
- La cuantizacion W4A8 puede introducir artefactos visuales o degradacion en la calidad del video, especialmente en escenas complejas o con movimiento rapido. Las metricas de reconstruccion son buenas pero no garantizan una calidad identica al original.
- Solo es compatible con ComfyUI ≥ v0.31.0 y comfy-kitchen con el layout `AsymW4A8Int8Layout`. No funcionara en otros frameworks como Diffusers o vLLM sin adaptaciones.
- Requiere CUDA SM ≥ 8.0. GPUs anteriores a Ampere (por ejemplo, RTX 20xx o GTX 16xx) no son compatibles.
- No se proporcionan datos sobre la generacion de audio sincronizado; es posible que esta cuantizacion solo cubra el modulo de video (FL2VA) y no el audio.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido ampliamente probado por la comunidad. Se recomienda validar su comportamiento antes de usarlo en proyectos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/berryber09/MiniMax-H3-10Eros-beta2-fl2va-w4a8
- Modelo fuente (bf16): https://huggingface.co/TenStrip/10Eros-Max
- Repositorio oficial MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Directorio FL2VA en el repo oficial: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/FL2VA
- Hub comunitario MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
- Modelos de difusion de Comfy-Org para MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/diffusion_models
- Cuantizador usado: https://github.com/NidAll/comfyui-mixed-quantizer
- Variante similar del mismo autor: https://huggingface.co/berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8
