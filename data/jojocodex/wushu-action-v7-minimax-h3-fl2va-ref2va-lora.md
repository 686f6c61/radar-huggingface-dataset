# Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora

## Resumen

El repositorio `Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora` contiene un adaptador LoRA (Low-Rank Adaptation) de estilo de acción wushu para el modelo de generación de vídeo MiniMax H3, desarrollado por el autor Jojocodex. El objetivo es dotar al modelo base de la capacidad de generar secuencias de artes marciales chinas con movimientos técnicamente precisos, utilizando un vocabulario de términos profesionales y una estructura de prompt de tres planos. La versión V7 reconstruye el conjunto de datos con 924 clips seleccionados y reetiquetados, y ofrece dos variantes entrenadas de forma independiente con musubi-tuner y AI-Toolkit, para que el usuario elija según sus preferencias.

El adaptador se integra como un complemento plug-and-play en ComfyUI, y requiere el modelo base MiniMax H3 (variantes FL2VA o Ref2VA) junto con sus text encoders y VAEs correspondientes. El repositorio incluye instrucciones detalladas de instalación, configuración del sampler y plantillas de prompt listas para usar. La relevancia actual radica en que MiniMax H3 es un modelo omni-modal de generación de vídeo con audio nativo, y esta LoRA permite especializarlo en un dominio concreto sin necesidad de reentrenar el modelo completo, reduciendo costes computacionales y de tiempo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax H3 |
| Parametros totales | No disponible (el repositorio no indica el número de parámetros del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base admite hasta 15 segundos de vídeo; la LoRA no especifica una ventana propia) |
| Tipos de cuantizacion | No aplica al adaptador; el modelo base se ofrece en versiones cuantizadas (pruned int8 convrot, bf16, fp8) |
| Idiomas soportados | No especificado; los prompts de ejemplo están en inglés, aunque el modelo base MiniMax H3 es multilingüe |
| Licencia | other (se debe consultar la licencia del modelo base MiniMax H3 para uso comercial) |
| Formato de pesos | safetensors (todos los archivos del repositorio usan esta extensión) |

## Arquitectura y entrenamiento

La LoRA se entrena sobre el modelo MiniMax H3, un modelo omni-modal de generación de vídeo que comprende texto, imagen, vídeo y audio, y produce vídeo con sonido estéreo nativo hasta 2K de resolución y 15 segundos de duración. El adaptador se entrena por separado con dos herramientas: musubi-tuner y AI-Toolkit, generando dos versiones de pesos para cada variante de base (FL2VA y Ref2VA). El dataset empleado consta de 924 clips de wushu seleccionados y reetiquetados con terminología profesional de movimientos, lo que permite al modelo aprender la correlación entre descripciones técnicas detalladas y los gestos visuales correspondientes.

La versión V7 introduce mejoras respecto a iteraciones anteriores: etiquetado más especializado, fragmentos de vídeo mejor segmentados y la corrección del problema de la base pruned FL2VA en el modo Ref2VA. Para el entrenamiento se utilizaron 2000 pasos en la variante FL2VA (completa) y 750 pasos en la variante Ref2VA (con una versión de 2000 pasos aún en proceso). El adaptador está diseñado para funcionar con un factor de escala (strength) entre 0.8 y 1.0 en ComfyUI.

## Capacidades

- Generación de vídeo de artes marciales wushu con movimientos concretos especificados mediante prompts estructurados en tres planos.
- Soporte para text-to-video (T2V) e image-to-video (I2V) a través de la variante FL2VA del modelo base.
- Soporte para referencia de vídeo, imagen o audio mediante la variante Ref2VA, que permite condicionar la generación con material de entrada.
- Integración con ComfyUI mediante nodos estándar (UNet Loader, LoraLoader, KSampler, VAE Decode, Save Video).
- Prompting especializado con el desencadenante `wushu_action,` y descripciones multimodales que incluyen planos, movimientos y efectos de sonido.
- Compatibilidad con generación de audio sincronizado (a través del VAE de audio del modelo base).
- Dos versiones de pesos (musubi-tuner y AI-Toolkit) para comparación de resultados.

## Casos de uso

- Producción de vídeo de acción para cine independiente o publicidad: el usuario define una coreografía con términos técnicos de wushu y el modelo genera una secuencia de 5 a 15 segundos con movimiento realista, útil para previsualizar escenas antes de la filmación.
- Creación de contenido para redes sociales: se pueden generar clips de demostración de artes marciales con fondo neutro y audio de ambiente, ideales para canales de deportes o entretenimiento.
- Generación de storyboards animados: los directores pueden especificar planos y movimientos concretos (p. ej. "扫堂腿" o "腾空侧踹") para visualizar la acción antes de rodar, ahorrando tiempo en la planificación.
- Entrenamiento de actores o dobles: los practicantes pueden usar los vídeos generados como referencia visual para aprender o corregir posturas y secuencias de movimientos.
- Contenido educativo sobre artes marciales: se pueden producir vídeos ilustrativos de técnicas específicas (espada, lanza, combate) para cursos online o tutoriales, con descripciones textuales que se traducen en acción.
- Generación de demostraciones para tutoriales de coreografía: los instructores pueden crear ejemplos variados de una misma técnica cambiando el prompt, sin necesidad de grabación física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas de calidad de vídeo, fidelidad de movimiento ni comparaciones con otros adaptadores. La única indicación de rendimiento es la advertencia del autor sobre la borrosidad en bajos pasos de muestreo, recomendando usar al menos 25 pasos con el sampler euler y scheduler simple.

## Requisitos de hardware

- El adaptador LoRA añade una sobrecarga mínima de VRAM, pero el modelo base MiniMax H3 es exigente: se recomienda una GPU con al menos 24 GB de VRAM para la variante FL2VA cuantizada en int8, y más para versiones bf16 o fp8.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para resoluciones superiores a 832×480.
- El flujo de trabajo en ComfyUI requiere cargar el text encoder Qwen3VL-32B en cuantización nvfp4 (aproximadamente 16 GB adicionales) y dos VAEs (vídeo fp16 y audio fp32), por lo que el consumo total supera los 32 GB de VRAM en configuraciones típicas.
- Opciones de despliegue: ComfyUI es el entorno recomendado por el autor; también es posible usar otros frontends compatibles con el ecosistema MiniMax H3, aunque no se documentan.
- Latencia y throughput: no se proporcionan datos. La generación de 124 frames (≈5.2 segundos) con 25 pasos en una GPU de gama alta puede tomar varios minutos, dependiendo de la resolución y la cuantización.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa directa con otros adaptadores LoRA para MiniMax H3, ya que no se han publicado métricas ni listas de modelos alternativos. Como referencia, se puede comparar con el propio modelo base sin adaptador:

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| MiniMax H3 (base) | Modelo omni-modal de vídeo | No publicado | Hasta 15 s de vídeo | Generación general, sin especialización | Propietaria con pesos abiertos |
| wushu-action-v7 (este LoRA) | Adaptador LoRA | No disponible | Hereda del base | Especializado en wushu, requiere el base | other |

La comparación con otras LoRAs de estilo (p. ej. para anime, cine o deportes) no es posible con la información disponible.

## Limitaciones y advertencias

- El adaptador está limitado al dominio del wushu; no es adecuado para otros estilos de acción o vídeos generales sin reentrenamiento.
- Se debe usar exclusivamente con el modelo base MiniMax H3; no es compatible con otros generadores de vídeo.
- La configuración de muestreo es estricta: sampler euler, scheduler simple, cfg=1.0 (valores superiores producen artefactos) y un número de frames que cumpla la fórmula 17n+5.
- A bajos pasos de muestreo (menos de 25), los vídeos resultan borrosos; se recomienda usar más pasos o plugins de restauración.
- La licencia "other" puede imponer restricciones al uso comercial; se debe revisar la licencia del modelo base MiniMax H3 antes de desplegar en producción.
- No se proporcionan métricas de sesgo o alucinación; el modelo puede generar movimientos inexactos o físicamente imposibles si el prompt no es suficientemente específico.
- El repositorio tiene 0 descargas y 3 likes, lo que indica que su adopción es limitada y no hay validación externa amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora
- Blog oficial de MiniMax H3: https://www.minimax.io/blog/minimax-h3
- Repositorio GitHub de MiniMax H3 (incluye Ref2VA): https://github.com/MiniMax-AI/MiniMax-H3/tree/main/Ref2VA
- Página de descarga de MiniMax H3 (referencia de pesos): https://minimax3.org/minimax-h3-download
