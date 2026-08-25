# erow/WAN2.1-1.3b-GeoNeXt-depthnormal-hypersim-vkitti-ga-2-1e-4-TROPE-8-concat-wanvae-res768

## Resumen

Este modelo es un fine-tune especializado de Wan2.1-T2V-1.3B, el modelo de generacion de video texto-a-video de Alibaba, adaptado para producir mapas de profundidad y normales a partir de prompts de texto. Lo desarrolla el usuario erow y se distribuye bajo licencia Apache 2.0. El modelo resuelve el problema de generar estimaciones geometricas densas (depth y normal maps) de forma condicionada a texto, una capacidad util para pipelines de vision por computador, generacion 3D y robotica.

El fine-tune se realizo sobre los datasets Hypersim y Virtual KITTI 2, con una resolucion de entrenamiento de 768 píxeles, utilizando la tecnica TROPE-8 concat y el autoencoder WanVAE. El entrenamiento se detuvo en el paso 150000 (epoch 8) con una tasa de aprendizaje de 1e-4 y gradiente acumulado de 2. El resultado es un modelo de 1.3B parametros que hereda la arquitectura de Wan2.1-T2V, un transformer de difusion para video, pero especializado en salidas geometricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (Wan2.1-T2V-1.3B base) |
| Parametros totales | 1.3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp16 presumiblemente) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (step-150000.safetensors, ~2.7 GB) |

## Arquitectura y entrenamiento

El modelo base es Wan2.1-T2V-1.3B, un modelo de generacion de video de la familia Wan2.1 desarrollado por Alibaba. Wan2.1 utiliza una arquitectura de diffusion transformer (DiT) con un autoencoder WanVAE para la compresion latente del video. El modelo base de 1.3B esta disenado para ser compatible con GPUs de consumo, lo que lo hace accesible para equipos con recursos limitados.

El fine-tune se realizo con la tecnica TROPE-8 concat, que consiste en concatenar las salidas de profundidad y normales como canales adicionales en el espacio latente del VAE. Los datos de entrenamiento provienen de dos datasets sinteticos: Hypersim (interiores fotorrealistas) y Virtual KITTI 2 (escenas de conduccion con variaciones de clima y configuracion de camara). El entrenamiento se ejecuto a resolucion 768, con learning rate 1e-4 y gradiente acumulado de 2, deteniendose en el paso 150000 (epoch 8). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de mapas de profundidad densos a partir de prompts de texto.
- Generacion de mapas de normales a partir de prompts de texto.
- Generacion de video condicionada a texto (capacidad heredada del modelo base, aunque el fine-tune puede alterar el comportamiento).
- Procesamiento de escenas de interiores (Hypersim) y exteriores de conduccion (VKITTI 2).
- Soporte de resolucion de salida de 768 píxeles.
- Capacidad de generar estimaciones geometricas coherentes con la escena descrita en el prompt.

## Casos de uso

- Generacion de datos sinteticos para entrenar redes de estimacion de profundidad: el modelo puede crear pares texto-profundidad a partir de prompts descriptivos, ampliando datasets de entrenamiento sin necesidad de capturar datos reales.
- Simulacion de escenarios de conduccion para validacion de sistemas ADAS: al entrenarse con VKITTI 2, el modelo puede generar mapas de profundidad y normales de escenas de carretera con diferentes condiciones climaticas, utiles para probar algoritmos de percepcion.
- Creacion de contenido 3D para videojuegos y realidad virtual: los mapas de profundidad generados pueden usarse como entrada para reconstruccion 3D o para efectos de postprocesado como desenfoque de profundidad de campo.
- Robotica y navegacion autonoma en interiores: los mapas de normales y profundidad de escenas interiores (Hypersim) pueden alimentar sistemas de planificacion de movimiento o SLAM.
- Aumento de datos para modelos de estimacion de pose y geometria: el modelo puede generar variaciones sinteticas de escenas con diferentes configuraciones de camara, como las rotaciones de 15 grados de VKITTI 2.
- Prototipado rapido de pipelines de vision: los desarrolladores pueden usar el modelo para generar estimaciones geometricas sin necesidad de sensores de profundidad, acelerando el desarrollo de aplicaciones de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de calidad de generacion de video o precision de profundidad/normales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.3B parametros, requiere aproximadamente 3-4 GB de VRAM en fp16 para inferencia. Con cuantizacion a 8 bits, podria reducirse a unos 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3050 o superiores. El modelo base Wan2.1-T2V-1.3B esta disenado para GPUs de consumo.
- Compatibilidad con consumer GPU: si, es compatible con la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo de difusion, puede ejecutarse con el codigo oficial de Wan2.1 (GitHub), o mediante frameworks como Diffusers de HuggingFace si se adapta. Para inferencia mas rapida, se puede usar TensorRT o cuantizacion con herramientas como bitsandbytes.
- Latencia y throughput: no disponible. La generacion de video con modelos de difusion suele tardar varios segundos por clip, dependiendo de la GPU y la resolucion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables que realicen generacion de depth/normal maps a partir de texto. Los modelos de estimacion de profundidad monocular como MiDaS o DPT no generan a partir de texto, sino que estiman a partir de imagenes. Los modelos de generacion de video como Stable Video Diffusion o CogVideoX no producen salidas geometricas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo se entreno exclusivamente con datos sinteticos (Hypersim y VKITTI 2), por lo que su rendimiento en escenas del mundo real puede degradarse significativamente.
- La cobertura de escenas es limitada: interiores fotorrealistas y escenas de conduccion virtual. No se garantiza buen comportamiento en otros dominios (exteriores urbanos reales, naturaleza, etc.).
- No se proporcionan metricas de calidad ni evaluacion cuantitativa, por lo que el rendimiento real es desconocido.
- El fine-tune puede haber degradado las capacidades originales de generacion de video del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datasets de entrenamiento (Hypersim, VKITTI 2) no impongan restricciones adicionales sobre los modelos entrenados con ellos.
- No se incluyen pesos del optimizador ni estado de entrenamiento, solo los pesos del modelo.
- El modelo no incluye informacion sobre el prompt de texto requerido para generar depth o normal maps; el usuario debe experimentar para encontrar el formato de prompt adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erow/WAN2.1-1.3b-GeoNeXt-depthnormal-hypersim-vkitti-ga-2-1e-4-TROPE-8-concat-wanvae-res768
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio oficial de Wan2.1: https://github.com/Wan-Video/Wan2.1
- Dataset Virtual KITTI 2: https://europe.naverlabs.com/proxy-virtual-worlds-vkitti-2/
- Paper de Virtual KITTI 2: https://arxiv.org/abs/2001.10773
