# DHCAI/Memory-V2V

## Resumen

Memory-V2V es un modelo de difusion video-a-video para síntesis de vistas novedosas (novel view synthesis) con control de cámara y consistencia multi-turno, presentado en ECCV 2026 por Dohun Lee, Chun-Hao Paul Huang, Xuelin Chen, Jong Chul Ye, Duygu Ceylan y Hyeonho Jeong. El modelo re-renderiza un vídeo fuente a lo largo de varias trayectorias de cámara novedosas de forma secuencial: la vista generada para cada trayectoria se condiciona al vídeo fuente y a todas las vistas generadas previamente, de modo que las vistas sucesivas permanecen coherentes entre sí.

Tecnicamente es un fine-tune de ReCamMaster, que a su vez se construye sobre el DiT de Wan2.1-T2V-1.3B. El checkpoint publicado contiene el DiT completo (1.500 millones de parámetros en bfloat16) con los módulos de cámara de ReCamMaster, los embedders de parche de condición de Memory-V2V y los downsamplers de tokens del mecanismo de adaptive token merging (ATM). Las capas de self-attention y los módulos añadidos están ajustados desde ReCamMaster; el resto de pesos son los originales de Wan2.1-T2V-1.3B.

El repositorio solo incluye el checkpoint de síntesis de vistas novedosas multi-turno; el modelo de edición de vídeo largo guiado por texto descrito en el paper no está incluido. Es relevante para investigadores que trabajen en generación de vídeo condicionada por cámara, consistencia entre vistas y edición iterativa de vídeo, y se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de vídeo, base Wan2.1-T2V-1.3B con módulos de cámara de ReCamMaster y módulos de condición de Memory-V2V |
| Parametros totales | 1.500 millones (1,50B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; genera vídeos de 81 fotogramas a 832x480 |
| Tipos de cuantizacion | no disponible; checkpoint en bfloat16 |
| Idiomas soportados | no disponible (modelo de vídeo; el condicionamiento es visual y de cámara, no textual en este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint `.ckpt` (state dict de PyTorch, `torch.load` con `weights_only=True`); requiere el text encoder, VAE y DiT base de Wan2.1-T2V-1.3B por separado |

## Arquitectura y entrenamiento

Memory-V2V parte del DiT de Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo. Sobre esa base incorpora los módulos de control de cámara de ReCamMaster y añade los embedders de parche de condición y los downsamplers de tokens del mecanismo de adaptive token merging (ATM), que reduce el coste computacional al fusionar tokens de forma adaptativa. El checkpoint incluye el state dict completo del DiT (1,50B parámetros en bfloat16) con las capas de self-attention y los módulos añadidos ajustados desde ReCamMaster; el resto de pesos se mantienen de Wan2.1-T2V-1.3B.

El entrenamiento se orienta a la tarea de síntesis de vistas novedosas multi-turno: dado un vídeo fuente, el modelo genera secuencialmente la vista correspondiente a cada trayectoria de cámara condicionándose al vídeo fuente y a todas las vistas ya generadas, lo que proporciona la "memoria" que da nombre al modelo y garantiza consistencia entre vistas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información no está disponible en la documentación publicada. El checkpoint se distribuye como tensores puros y se carga con `torch.load(path, weights_only=True)`.

## Capacidades

- Síntesis de vistas novedosas (novel view synthesis) en vídeo: re-renderiza un vídeo fuente a lo largo de trayectorias de cámara novedosas.
- Control de cámara: la trayectoria se especifica mediante el parámetro `--cam_type`, con un conjunto de trayectorias predefinidas en el repositorio de código.
- Edición multi-turno consistente: cada vista se condiciona al vídeo fuente y a todas las vistas generadas previamente, manteniendo coherencia entre turnos.
- Generación de vídeo de 81 fotogramas a resolución 832x480 (los vídeos de entrada se redimensionan y se usan sus primeros 81 fotogramas).
- Aceleración mediante adaptive token merging (ATM), activable con `--use_atm`.
- No incluye, en este checkpoint, el modelo de edición de vídeo largo guiado por texto del paper.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Re-renderizado de vídeo con cámara virtual: a partir de un vídeo rodado con una cámara, generar la misma escena desde trayectorias de cámara alternativas (órbitas, desplazamientos laterales, etc.) para postproducción o previsualización.
- Generación de múltiples ángulos coherentes para estereoscopía o vídeo volumétrico: encadenar varias trayectorias en un solo proceso multi-turno aprovecha la memoria del modelo para que las vistas no diverjan entre sí.
- Aumento de datos para visión por computador: producir vistas sintéticas adicionales de un vídeo para entrenar modelos de reconstrucción 3D, odometría visual o detección con diversidad de puntos de vista.
- Prototipado en investigación de generación de vídeo condicionada por cámara: el checkpoint permite reproducir los experimentos de síntesis de vistas del paper sobre el ejemplo incluido en el repositorio.
- Previsualización de planos en producción audiovisual: evaluar cómo quedaría una escena desde otra posición de cámara antes de rodarla, usando material existente como referencia.
- Edición iterativa de secuencias con consistencia entre pasos: el esquema de condicionamiento sobre vistas previas sirve de base para flujos de trabajo donde se aplican varias transformaciones sucesivas a un mismo vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta datos operativos: generar tres vistas (trayectorias 2, 3 y 12) requiere aproximadamente 18 GB de memoria de GPU, y tanto la memoria como el tiempo crecen con cada vista adicional.

## Requisitos de hardware

- VRAM estimada: unos 18 GB de GPU para generar tres vistas encadenadas; el consumo crece con cada vista adicional.
- El checkpoint del DiT ocupa 3,0 GB en bfloat16; además hay que descargar el text encoder, el VAE y el DiT base de Wan2.1-T2V-1.3B (unos 17,6 GB adicionales).
- GPU recomendadas: no se especifican modelos concretos; por el consumo de memoria, se requiere al menos una GPU con 24 GB o más (por ejemplo, RTX 4090, A100, H100) para el caso de tres vistas.
- No se documenta si cabe en GPU de consumo con menos de 24 GB; no disponible.
- Opciones de despliegue: el repositorio oficial proporciona `inference.py` con entorno conda y build de PyTorch para la GPU del usuario; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo de este tipo).
- Latencia y throughput: no disponibles; solo se indica que el tiempo crece con cada vista y que ATM (`--use_atm`) es más rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Memory-V2V | 1,50B (DiT) | vídeos de 81 fotogramas a 832x480 | Síntesis de vistas novedosas multi-turno con control de cámara | Apache-2.0 | Checkpoint en Hugging Face; código en GitHub |
| ReCamMaster (Wan2.1) | no disponible | no disponible | Re-renderizado de vídeo con control de cámara | Apache-2.0 (según la model card) | Hugging Face (KlingTeam/ReCamMaster-Wan2.1) |
| Wan2.1-T2V-1.3B | 1,3B | no disponible | Generación texto-a-vídeo | Apache-2.0 | Hugging Face (Wan-AI/Wan2.1-T2V-1.3B) |

Memory-V2V se diferencia de ReCamMaster y Wan2.1-T2V-1.3B por el condicionamiento multi-turno sobre vistas previas, que no está presente en los modelos base. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado solo cubre la síntesis de vistas novedosas multi-turno; el modelo de edición de vídeo largo guiado por texto del paper no está incluido.
- El consumo de memoria y el tiempo de inferencia crecen con cada vista generada, lo que limita el número práctico de turnos.
- La resolución y duración están fijadas en 832x480 y 81 fotogramas; los vídeos de entrada se recortan y redimensionan a ese formato.
- Requiere descargar por separado el text encoder, el VAE y el DiT base de Wan2.1-T2V-1.3B (unos 17,6 GB), además del checkpoint de 3,0 GB.
- No se documentan sesgos, riesgo de alucinación visual ni limitaciones idiomáticas; no disponible.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los modelos base (Wan2.1-T2V-1.3B y ReCamMaster) al desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/DHCAI/Memory-V2V
- Paper (arXiv): https://arxiv.org/abs/2601.16296
- Página del proyecto: https://dohunlee1.github.io/MemoryV2V/
- Código: https://github.com/DoHunLee1/Memory-V2V
- Modelo base ReCamMaster: https://huggingface.co/KlingTeam/ReCamMaster-Wan2.1
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
