# mashbox-labs/Track2Rig

## Resumen

Track2Rig es un modelo experimental de MASHBOX Labs que resuelve un problema concreto de animación y gráficos 3D: dado un conjunto de trazas densas de puntos 3D de una criatura en movimiento, genera un rig completo, es decir, esqueleto (huesos y joints), pesos de skinning y transformaciones óseas por fotograma. No es un modelo de lenguaje ni un modelo de visión genérico, sino una herramienta de pipeline para animadores y desarrolladores de gráficos que automatiza el paso tradicionalmente manual de rigging a partir de captura de movimiento.

El modelo está implementado en JAX, es muy ligero (2.764.416 parámetros, 11,1 MB en float32) y está pensado para ejecutarse en CPU, lo que lo hace accesible sin hardware especializado. Se integra en el paquete `mashbox` (release 0.1.10 en PyPI) y se invoca con el comando `mashbox run track2rig`. La salida se exporta en glTF 2.0 (archivo `.glb` con un joint por hueso, skinning top-4 y una animación), además de un `rig.json` estructurado.

Su relevancia actual radica en la creciente demanda de automatización del rigging a partir de vídeo: combinado con un rastreador de puntos 3D como TrackEverything (vía el wrapper `track2rig-video`), permite pasar de un vídeo de un animal a un rig animado de forma casi automática. Es un proyecto experimental: los propios autores advierten que no funciona bien en muchos clips todavía y que publicarán pesos nuevos como versiones fechadas. Ha sido entrenado desde cero por MASHBOX Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de rigging basado en JAX; arquitectura no detallada) |
| Parametros totales | 2.764.416 (55 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (float32, 11,1 MB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (tipo de red, capas, mecanismos de atención, etc.). Lo que sí se sabe es que está implementado en JAX, tiene unos 2,76 millones de parámetros distribuidos en 55 tensores, y que su entrada son trazas densas de puntos 3D de una criatura en movimiento a lo largo de un clip. Su salida comprende el esqueleto predicho (líneas entre joints), los pesos de skinning por punto y las transformaciones óseas por fotograma, de modo que cada punto del modelo se mueve únicamente por las predicciones de skin y huesos.

No se ha publicado información sobre el dataset de entrenamiento (número de clips, composición, origen de las trazas) ni sobre el procedimiento de optimización. La model card indica únicamente que el modelo fue entrenado desde cero por MASHBOX Labs y que los pesos se versionan con fechas (la versión actual es `track2rig-v2`, correspondiente a Track2Rig 0.1.0). La evaluación se realiza sobre un conjunto de test sintético de 32 clips con trazas ruidosas y parcialmente ocluidas, lo que sugiere que el entrenamiento emplea datos sintéticos con augmentations de ruido y oclusión, aunque esto último no está confirmado explícitamente.

## Capacidades

- Generación automática de rigs 3D a partir de trazas densas de puntos 3D: produce huesos, joints, pesos de skinning y transformaciones óseas por fotograma.
- Predicción de esqueleto completo: el modelo infiere la estructura esquelética (visualizable como líneas entre joints) sin necesidad de definición manual.
- Skinning automático con top-4: cada punto del modelo se asigna a los cuatro huesos más influyentes, compatible con el estándar glTF 2.0.
- Exportación a glTF 2.0 (`.glb`): un joint por hueso, pesos de skin top-4 y una animación lista para usar en motores y visores compatibles.
- Salida estructurada en JSON (`rig.json`) para integración en pipelines programáticos.
- Ejecución íntegra en CPU, sin necesidad de GPU para el paso de rigging.
- Verificación de integridad de pesos: descarga con revisión anclada en `models.json` y comprobación sha256.
- Pipeline de vídeo a rig (vía wrapper `track2rig-video`): acepta trazas de TrackEverything o de cualquier otro rastreador de puntos 3D mediante el subcomando `track2rig-video align`.
- No tiene capacidades de lenguaje, visión directa, tool calling ni razonamiento: es un modelo especializado en una única tarea geométrica.

## Casos de uso

- Rigging automático de criaturas para animación 3D: un animador que ha capturado movimiento de un animal (real o sintético) puede generar un esqueleto y pesos de skinning en minutos sin modelar el rig a mano, exportando directamente a glTF para Blender, Unity o Unreal.
- Prototipado rápido de assets animados en videojuegos: estudios pequeños pueden pasar de clips de referencia a rigs preliminares editables, acelerando la fase de preproducción de personajes y criaturas secundarias.
- Reconstrucción de movimiento para VFX: a partir de un vídeo de un animal, el pipeline `track2rig-video` (TrackEverything + Track2Rig) permite obtener un rig animado aproximado para previz o composición.
- Investigación en motion capture sin marcadores: el modelo sirve como baseline o componente en sistemas que convierten vídeo en esqueletos articulados, con métricas reproducibles (error de reconstrucción y de joints sobre conjunto sintético).
- Automatización de pipelines de producción con salida estructurada: el `rig.json` permite integrar el rigging en scripts de CI o herramientas DCC propias, procesando lotes de clips de forma desatendida en CPU.
- Educación y demostración de técnicas de skinning: al ser ligero (11 MB), ejecutable en CPU y con ejemplos incluidos (grison, serpiente de cristal, pelican-spider), es útil para docencia y experimentación sobre rigging automático.
- Generación de contenido para visualización científica o museística: reconstruir el movimiento de animales a partir de grabaciones y mostrarlo con un esqueleto superpuesto en visores glTF.

## Benchmarks y rendimiento

Los únicos resultados publicados por el autor son métricas propias de la tarea de rigging (no benchmarks de NLP). Comparan contra una implementación propia de SSDR (Smooth Skinning Decomposition with Rigid Bones) de 30 iteraciones en NumPy/SciPy, con el mismo número de huesos:

| Chip | Métrica | Resultado | Baseline (SSDR, misma implementación) |
|---|---|---|---|
| CPU (AMD EPYC 7502P) | Error de reconstrucción en test sintético (32 clips, trazas ruidosas y parcialmente ocultas), % del tamaño corporal, menor es mejor | 0,784 | 0,915 |
| CPU (AMD EPYC 7502P) | Error de joints en test sintético, % del tamaño corporal, menor es mejor | 6,24 | 7,73 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables a este modelo).

## Requisitos de hardware

- VRAM: no aplica para el paso de rigging; el modelo se ejecuta íntegramente en CPU (probado en un AMD EPYC 7502P). Los pesos ocupan solo 11,1 MB en memoria.
- GPU: no se necesita GPU para Track2Rig. Sí se requiere una GPU NVIDIA para el paso opcional de vídeo a trazas con `track2rig-video` (TrackEverything + Pi3), que además exige Linux.
- Consumer GPUs: no son necesarias; cualquier CPU x86-64 moderna con Python 3.12 es suficiente (probado en Linux). En entornos con Python antiguo (por ejemplo, VMs de Google Cloud TPU) se recomienda instalar vía uv.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un LLM). Se despliega clonando el repositorio `mashbox` (rama `v0.1.10`), creando un entorno virtual e instalando con `pip install ".[cpu,track2rig]"`; la ejecución es `mashbox run track2rig <clip.npz> -o <salida>`.
- Latencia y throughput: no disponible; la model card no publica tiempos de inferencia del paso de rigging en CPU (sí publica tiempos medidos del paso de vídeo a trazas en su guía online).

## Comparativa con modelos similares

| | Track2Rig | SSDR (baseline clásico) | Alternativas de rigging automático |
|---|---|---|---|
| Tipo | Modelo aprendido (JAX, 2,76 M parámetros) | Optimización por descomposición (no aprendida) | no disponible |
| Entrada | Trazas densas de puntos 3D | Malla + secuencia de movimiento | no disponible |
| Salida | Huesos, joints, skin weights, transforms por frame, glTF 2.0 | Huesos y skin weights | no disponible |
| Hardware | CPU | CPU | no disponible |
| Error de reconstrucción (test sintético, % tamaño corporal) | 0,784 | 0,915 | no disponible |
| Error de joints (%) | 6,24 | 7,73 | no disponible |
| Licencia | Apache-2.0 | Según implementación (la usada como baseline es propia de MASHBOX Labs) | no disponible |
| Disponibilidad | Pesos y código públicos en Hugging Face y GitHub | Implementaciones académicas varias | no disponible |

No hay otros modelos comparables publicados con los mismos datos de entrada y salida en la información disponible.

## Limitaciones y advertencias

- El proyecto es explícitamente experimental: los autores indican que "no funciona bien en muchos clips todavía" y publicarán pesos mejorados como versiones fechadas. No debe considerarse listo para producción sin validación por clip.
- Riesgo de resultados incorrectos en clips reales: las métricas publicadas provienen de un conjunto de test sintético de 32 clips; el rendimiento sobre datos reales no está cuantificado.
- La entrada no es vídeo directo: Track2Rig necesita trazas de puntos 3D; obtenerlas desde vídeo depende de TrackEverything, que tiene licencia CC BY-NC 4.0 (solo uso no comercial) y su propio modelo de geometría (Pi3), ambos fuera de este repositorio. El pipeline completo de vídeo a rig hereda esa restricción de licencia aunque el código y pesos de Track2Rig sean Apache-2.0.
- Requisitos de plataforma del paso de vídeo: Linux y GPU NVIDIA, con un commit concreto de TrackEverything (`f0c18dd9`) para reproducibilidad.
- Calidad del rig: el glTF de salida incluye una única animación y skinning top-4, lo que puede ser insuficiente para rigs complejos o deformaciones avanzadas sin postproceso.
- Sesgos: no disponible; no se ha publicado análisis de sesgos (tampoco es aplicable en el sentido habitual de LLMs, pero el rendimiento puede variar según el tipo de criatura y locomoción, como sugieren los ejemplos de bípedos y serpientes).
- Alucinación: no aplica; es un modelo geométrico determinista dado un input.
- Idiomas: no aplica.
- Uso comercial: el código y los pesos son Apache-2.0 (uso comercial permitido), pero el paso de vídeo con TrackEverything está restringido a uso no comercial; para uso comercial desde vídeo habría que sustituir el tracker por uno con licencia adecuada (el wrapper acepta trazas de cualquier rastreador 3D mediante `track2rig-video align`).
- Soporte: el canal de contacto para empresas es hello@mashbox.gg; el proyecto tiene 0 descargas y 1 like en Hugging Face en el momento de redactar la ficha, lo que indica adopción muy temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mashbox-labs/Track2Rig
- Código (repositorio mashbox, rama v0.1.10): https://github.com/mashbox-labs/mashbox/tree/v0.1.10/src/mashbox/models/track2rig
- Guía oficial de Track2Rig: https://mashbox.gg/docs/models/track2rig
- Guía de instalación (sección install): https://mashbox.gg/docs/models/track2rig#install
- Pipeline de vídeo a trazas a rig: https://mashbox.gg/docs/models/track2rig#from-video
- Paquete mashbox en PyPI (release 0.1.10): https://pypi.org/project/mashbox/0.1.10/
- TrackEverything (tracker usado en el paso de vídeo): https://github.com/ayushjain1144/trackeverything
- Guía de setup en Google Cloud: https://mashbox.gg/docs/google-cloud
- Vídeo de demostración (MP4): https://huggingface.co/mashbox-labs/Track2Rig/resolve/main/assets/hero.mp4
- Contacto para empresas: hello@mashbox.gg
