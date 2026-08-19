# AlayaLab/Evoke

## Resumen

Alaya-EVOKE es un modelo de mundo interactivo (world model) para generación de vídeo desarrollado por AlayaLab. Genera secuencias de 384 × 640 píxeles a 24 fps, manteniendo coherencia temporal durante rollouts de hasta 30 segundos, y lo hace en solo 3 pasos de inferencia sin necesidad de clasifier-free guidance (CFG). El modelo introduce un banco de estados mundial indexado por cámara que permite sesiones de generación de duración arbitraria sin que el contexto del denoiser crezca, lo que lo diferencia de los modelos de vídeo con ventana fija.

EVOKE se publica bajo licencia Apache-2.0, aunque el backend de profundidad ViGeo, necesario para el banco de estados mundial, se distribuye bajo CC-BY-NC-4.0, lo que condiciona su uso comercial. El repositorio de HuggingFace contiene solo los pesos (411,2 GB) e incluye varias etapas de entrenamiento: control de cámara, destilación de pocos pasos y destilación de vídeo largo. El modelo está diseñado para ser re-promptable en mitad de la generación, sin cortes ni reinicios, y admite modos texto-a-vídeo, imagen-a-vídeo y vídeo-a-vídeo, aunque los modelos destilados solo tienen el último modo dentro de su distribución de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer para vídeo (basado en LingBot-World para el teacher; VAE, text encoder y scheduler de Helios/Wan) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (usa un banco de estados mundial externo, no una ventana fija) |
| Tipos de cuantizacion | No disponible (safetensors, sin GGUF publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (backend ViGeo bajo CC-BY-NC-4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVOKE es un modelo de difusión para vídeo que emplea un transformer como denoiser. El entrenamiento se divide en tres etapas: en la primera se entrena un modelo con control de cámara multi-paso; en la segunda se aplica destilación de pocos pasos (una pirámide de 3 pasos) mediante Distribution Matching Distillation (DMD) con dos expertos teacher (uno para ruido alto y otro para ruido bajo); en la tercera se realiza una destilación específica para vídeos largos de 30 segundos. El teacher final se construye sobre LingBot-World, mientras que el VAE, text encoder, tokenizer y scheduler provienen de la base Helios, que a su vez los hereda de Wan.

La innovación principal es el banco de estados mundial (world state bank) indexado por cámara: la geometría de la escena se almacena externamente y se actualiza a lo largo de la secuencia, de modo que el contexto del denoiser permanece acotado independientemente de la duración de la sesión. Esto permite rollouts de larga duración sin degradación por acumulación de contexto. El modelo también soporta re-prompting en tiempo real: se puede cambiar la instrucción mientras la generación está en curso sin reiniciar el proceso.

## Capacidades

- Generación de vídeo a partir de texto, imagen o vídeo (los modelos destilados solo tienen vídeo-a-vídeo en distribución; los otros dos modos son zero-shot).
- Control de cámara multi-paso: permite especificar trayectorias de cámara durante la generación.
- Re-prompting en mitad de la generación: se puede cambiar el prompt sin cortar la secuencia.
- Coherencia temporal de hasta 30 segundos en un solo rollout.
- Generación a 384 × 640 píxeles a 24 fps.
- Inferencia en 3 pasos sin CFG, con una velocidad reportada de 1,5 segundos de vídeo generado cada 2,11 segundos en una GPU H200.
- Sesiones de generación de duración arbitraria gracias al banco de estados mundial, sin que el contexto del denoiser crezca.
- Interactividad: el modelo puede recibir nuevas instrucciones durante la generación, lo que lo hace adecuado para aplicaciones en tiempo real.

## Casos de uso

- Creación de contenido audiovisual: un creador puede generar secuencias de vídeo de hasta 30 segundos a partir de texto o imagen, con control de cámara, para storyboards, animaciones o material de relleno. La velocidad de 3 pasos permite iterar rápidamente en un flujo de trabajo de edición.
- Simulación de entornos para entrenamiento de agentes: al ser un world model interactivo, puede generar trayectorias de vídeo coherentes y re-promptables, útiles para entrenar agentes de visión-linguística en entornos sintéticos sin necesidad de motores físicos.
- Prototipado de escenas para cine y videojuegos: los directores de arte pueden describir una escena y obtener un vídeo preliminar con movimiento de cámara controlado, acelerando la previsualización.
- Generación de vídeo largo para publicidad o marketing: el modelo permite crear piezas de hasta 30 segundos de duración manteniendo coherencia temporal, algo poco común en modelos de vídeo de pocos pasos.
- Herramientas de edición interactiva: el re-prompting en mitad de la generación permite a un editor cambiar la acción o el estilo de una secuencia sin reiniciar, lo que facilita ajustes en tiempo real durante la producción.
- Investigación en world models: EVOKE sirve como base para estudiar la coherencia a largo plazo en modelos generativos, ya que su banco de estados mundial es una arquitectura abierta y documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas comparativas (FVD, CLIP score, etc.) ni comparaciones con otros modelos de vídeo. El único dato de rendimiento es la velocidad de inferencia: 1,5 segundos de vídeo por cada 2,11 segundos en una GPU H200.

## Requisitos de hardware

- El tamaño del repositorio es de 411,2 GB, lo que sugiere un modelo de gran escala que requiere una GPU con al menos 80 GB de VRAM para inferencia en precisión completa (no se especifican requisitos mínimos).
- La velocidad reportada se obtuvo en una GPU H200 (141 GB de VRAM), que es la referencia recomendada por el autor para el modo de 3 pasos.
- Es probable que quepa en GPUs consumer de gama alta (p.ej. RTX 4090 con 24 GB) solo con cuantización, pero no se proporcionan versiones cuantizadas ni datos de memoria.
- El despliegue requiere descargar además el backend de profundidad ViGeo (CC-BY-NC-4.0), que es obligatorio para todos los modos de inferencia.
- No se mencionan integraciones con vLLM, Ollama o TGI; el uso se realiza mediante el script de inferencia del repositorio de GitHub (`scripts/inference/infer_post_distill.sh`).

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. EVOKE se posiciona en la categoría de world models interactivos para vídeo, similar a otros sistemas como Wan, Helios o LingBot-World, pero no se publican métricas que permitan una comparación cuantitativa. La principal diferenciación frente a modelos de vídeo convencionales es su capacidad de generar secuencias de duración arbitraria sin degradación del contexto, gracias al banco de estados mundial.

## Limitaciones y advertencias

- El backend ViGeo, necesario para el banco de estados mundial, se distribuye bajo CC-BY-NC-4.0, que es más restrictivo que Apache-2.0. Cualquier uso comercial del modelo completo debe verificar la compatibilidad de ambas licencias.
- Los modelos destilados (stage2 y stage3) se entrenaron únicamente con condicionamiento vídeo-a-vídeo (v2v). Los modos texto-a-vídeo e imagen-a-vídeo son zero-shot en estos modelos, por lo que su calidad puede ser inferior a la del modelo de stage1, que sí tiene los tres modos en distribución.
- El tamaño del repositorio (411,2 GB) implica una descarga considerable y requisitos de almacenamiento altos.
- No se proporcionan datos sobre sesgos, alucinaciones visuales o comportamientos no deseados en escenas complejas; como todo modelo generativo, puede producir contenido incoherente o no fiel a la instrucción en casos límite.
- La documentación no especifica la longitud de contexto en tokens ni los idiomas soportados, por lo que no se puede garantizar un comportamiento multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/AlayaLab/Evoke
- Repositorio GitHub: https://github.com/AlayaLab/Evoke
- Página del proyecto: https://evoke-world.github.io/Evoke/
- Paper arXiv: https://arxiv.org/abs/2608.13546
- Paper en HuggingFace: https://huggingface.co/papers/2608.13546
