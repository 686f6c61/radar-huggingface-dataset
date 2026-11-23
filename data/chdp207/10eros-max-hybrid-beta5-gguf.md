# chdp207/10Eros-Max-Hybrid-Beta5-GGUF

## Resumen

10Eros-Max-Hybrid-Beta5-GGUF es una cuantización en formato GGUF del modelo 10Eros-Max Hybrid Beta 5, un modelo de generación de vídeo (texto-a-vídeo, imagen-a-vídeo e imagen-texto-a-vídeo) desarrollado originalmente por TenStrip y cuantizado por el usuario Abiray (publicado bajo el identificador chdp207). El modelo se construye sobre la arquitectura MiniMax H3 y está pensado para ejecutarse en hardware de consumo mediante ComfyUI, algo poco habitual en modelos de vídeo de esta escala.

El modelo base emplea una técnica de fusión híbrida: combina siete injertos (grafts) agrupados por conceptos y fusiones por consenso derivadas de más de 20 LoRA, sin fusiones directas de LoRA, e incorpora un delta de turbo fusionado. Los injertos se aplican en capas de atención a bajo nivel para no degradar la calidad visual ni de audio nativa del modelo H3 original.

La relevancia de esta ficha radica en que ofrece versiones cuantizadas desde Q3_K_M (8,9 GB) hasta Q8_0 (21,6 GB), lo que permite desplegar generación de vídeo con audio en GPUs de consumo de 10 a 24 GB de VRAM. El modelo tiene aproximadamente 20.111 millones de parámetros según los pesos en safetensors del repositorio, y se distribuye bajo la licencia comunitaria de MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax H3 (transformer para generación de vídeo con audio nativo) |
| Parametros totales | 20.111.462.936 (~20,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con licencias adicionales de LTX 2.3, Wan 2.2 y Krea 2 para las porciones transferidas) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniMax H3, orientada a la generación conjunta de vídeo y audio. La variante Hybrid Beta 5 de TenStrip se construye mediante una técnica de normalización distinta a las versiones anteriores, combinando siete injertos agrupados por conceptos y fusiones por consenso a partir de más de 20 LoRA, sin fusiones directas de LoRA, e incorporando un delta de turbo híbrido fusionado. Los injertos se aplican en las capas de atención a un nivel que, según el autor, no perturba la calidad de salida visual ni de audio del H3 original.

El modelo incorpora además carácter transferido desde LTX 2.3, Wan 2.2 y Krea 2, de modo que las licencias comunitarias de esos modelos fuente se aplican a las porciones correspondientes. El modelo base está diseñado explícitamente como un modelo con capacidad NSFW, manteniendo a la vez las funciones y capacidades del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de vídeo a partir de imagen y texto combinados (image-text-to-video).
- Generación de audio nativa sincronizada con el vídeo, con advertencias específicas sobre el uso de CFG bajo y VAE de audio en fp32.
- Control de movimiento y calidad mediante distintos samplers y schedulers (res_multistep, LCM, er_sde, Euler) con pasos recomendados de 4 a 8.
- Capacidad NSFW explícita, junto con funciones del modelo base.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Generación de clips de vídeo con audio para prototipado creativo: el modelo permite producir vídeos con pista de audio nativa en una sola pasada, útil para maquetas rápidas en estudios pequeños que trabajan con ComfyUI y GPUs de 16 GB.
- Creación de contenido para redes sociales: con la cuantización Q4_K_M (11,6 GB) se puede generar vídeo en una RTX 4080 o 4070 Ti Super, adecuado para producir clips cortos de forma iterativa.
- Animación de imágenes fijas (image-to-video): a partir de una ilustración o fotografía se puede generar movimiento con audio, lo que resulta útil para ilustradores que quieren dar vida a sus obras sin pipelines complejos.
- Investigación sobre modelos de vídeo cuantizados: la disponibilidad de siete niveles de cuantización permite estudiar el impacto de la compresión en la calidad visual y de audio, comparando Q8_0 con Q3_K_M en el mismo hardware.
- Desarrollo de flujos de trabajo en ComfyUI: el modelo se integra mediante el nodo Unet Loader (GGUF) del plugin city96/ComfyUI-GGUF, lo que facilita su incorporación en pipelines de nodos existentes.
- Generación de contenido NSFW controlado: el modelo está diseñado explícitamente para esta capacidad, lo que lo hace adecuado para entornos de creación de contenido para adultos que requieran control local y no dependan de servicios en la nube.
- Pruebas de concepto en hardware de gama media: la cuantización Q3_K_M (8,9 GB) permite ejecutar el modelo en una RTX 3060 o 4060 de 10-12 GB, lo que abre la experimentación con vídeo generativo a equipos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar codificadores ni VAE):
  - Q8_0: 21,6 GB.
  - Q6_K: 16,7 GB.
  - Q5_K_M / Q5_K_S: 14,1 GB.
  - Q4_K_M / Q4_K_S: 11,6 GB.
  - Q3_K_M: 8,9 GB.
- Hay que sumar la sobrecarga de VRAM del codificador de texto Qwen3-VL, el VAE de vídeo y el VAE de audio.
- GPU recomendadas según el autor:
  - RTX 3090 / 4090 (24 GB): Q8_0, calidad visualmente sin pérdidas.
  - 20 GB o más: Q6_K.
  - 16 GB (RTX 4080, 4070 Ti Super): Q5_K_M / Q5_K_S.
  - 12-16 GB: Q4_K_M / Q4_K_S, la opción favorita de la comunidad.
  - 10-12 GB (RTX 3060 / 4060): Q3_K_M.
- Cabe en GPUs de consumo desde 10 GB de VRAM con la cuantización Q3_K_M, siempre que se añada la sobrecarga de los VAE y el codificador de texto.
- Opciones de despliegue: ComfyUI con el plugin city96/ComfyUI-GGUF, usando el nodo Unet Loader (GGUF). El archivo .gguf se coloca en ComfyUI/models/unet. El encabezado de arquitectura está marcado como "wan" para sortear las comprobaciones de arquitectura de los cargadores actuales.
- Ajustes críticos de despliegue: cargar el VAE de audio de MiniMax en fp32 (en fp16 o bf16 el audio suena como un cortocircuito eléctrico); mantener el CFG muy bajo (~1,5 a 2,0) para evitar que el audio nativo se convierta en estática.
- Ajustes de muestreo recomendados por TenStrip: res_multistep/simple con 6-8 pasos (mejor calidad de movimiento), LCM/simple con 6-8 pasos (mejor audio en turbo), LCM/beta con 4-6 pasos, er_sde/beta con 4 pasos, er_sde/beta57 con 4-6 pasos, Euler/simple con 4-8 pasos. No usar caché ni spectrum si se hace renderizado de referencia, ya que provocan pérdida de precisión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. Se puede señalar que el modelo base MiniMax H3 es la referencia directa, y que el modelo incorpora carácter transferido de LTX 2.3, Wan 2.2 y Krea 2, pero no se dispone de tablas comparativas de parámetros, contexto o benchmarks frente a estas alternativas.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para contenido NSFW, lo que puede limitar su uso en entornos corporativos o públicos y exige controles de contenido adecuados.
- Riesgo de alucinación y de artefactos visuales o de audio, especialmente en cuantizaciones bajas (Q3_K_M) y con ajustes de CFG inadecuados.
- El audio nativo es sensible a la configuración: cargar el VAE de audio en fp16 o bf16 produce ruido eléctrico, y un CFG alto convierte el audio en estática.
- El encabezado de arquitectura está marcado como "wan" para sortear comprobaciones de los cargadores, lo que puede provocar incompatibilidades con futuras versiones de ComfyUI o de otros cargadores.
- La licencia es la minimax-h3-community-license-agreement, con licencias adicionales de LTX 2.3, Wan 2.2 y Krea 2 para las porciones transferidas; es necesario revisar cada licencia para uso comercial.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no hay validación comunitaria ni reportes de uso en producción.
- No se dispone de información sobre latencia, throughput ni requisitos de CPU o RAM del sistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chdp207/10Eros-Max-Hybrid-Beta5-GGUF
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Plugin ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Vídeo de ejemplo: https://huggingface.co/Abiray/10Eros-Max-Hybrid-Beta5-GGUF/resolve/main/video/MiniMax_H3_00004-audio.mp4
