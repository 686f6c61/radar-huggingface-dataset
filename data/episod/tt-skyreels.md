# episod/tt-skyreels

## Resumen

tt-skyreels es un bundle de despliegue publicado por el usuario episod en HuggingFace, no un modelo entrenado desde cero. Empaqueta el modelo de generación de vídeo texto-a-vídeo Skywork/SkyReels-V2-DF-1.3B-540P para ejecutarlo sobre aceleradores Tenstorrent Blackhole mediante TTNN. El transformador servido reutiliza íntegramente el WanTransformer3DModel de tt-metal, aprovechando que el transformador de SkyReelsV2 es compatible a nivel de pesos con él, y lo expone detrás de un servidor ASGI siguiendo el patrón tt-dit-server que ya estableció tt-animatediff.

Se distribuye como un «thin bundle» v6 (schema 6) gestionado con tt-model-manager, con instalación basada en pip/venv en lugar de una imagen de contenedor. Corre sobre una configuración p300x2 con malla QB2. El repositorio ocupa 0,9 GB e incluye las recetas de instalación y ejecución, dos wheels propios y un parche de kernels.

El interés del proyecto es práctico: demuestra cómo llevar un modelo de difusión de vídeo de 1,3B parámetros y resolución 540P a hardware Tenstorrent reutilizando componentes existentes de tt-metal y resolviendo por el camino un problema de empaquetado de kernels que impide el JIT de las rutas de fabric. No se trata, por tanto, de una nueva arquitectura ni de un modelo afinado, sino de una pieza de infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (DiT); el transformador reutiliza WanTransformer3DModel de tt-metal, compatible a nivel de pesos con SkyReelsV2 |
| Parametros totales | 1,3B (segun la denominacion del modelo base SkyReels-V2-DF-1.3B-540P) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos del modelo base en formato Diffusers (Skywork/SkyReels-V2-DF-1.3B-540P-Diffusers); el bundle se distribuye como wheels de Python (skyreels-ttnn-0.1.0 y tt_skyreels_models_closure-0.78.0) |
| Hardware objetivo | Tenstorrent Blackhole p300x2 (malla QB2) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El bundle no entrena ningún modelo: empaqueta el modelo de difusión SkyReels-V2-DF-1.3B-540P y lo pone a funcionar sobre TTNN. La ruta servida se divide en dos wheels construidos específicamente para este bundle y ubicados en `wheels/`. El primero, `skyreels-ttnn-0.1.0`, contiene el cierre de la ruta servida (`session.py`, la aplicación ASGI y `pipeline_skyreels.py`). El segundo, `tt_skyreels_models_closure-0.78.0`, agrupa el módulo `models/tt_dit` de tt-metal junto con los dos módulos de `models/common` que realmente importa, todo fijado a tt-metal v0.78.0. La decisión de ingeniería clave es reutilizar el WanTransformer3DModel de tt-metal en lugar de portar el transformador de SkyReelsV2, ya que ambos son compatibles a nivel de pesos.

El detalle técnico más destacable es el parche de kernels incluido en `kernel_patch/`. El wheel de ttnn 0.78.0 publicado en PyPI omite tres ficheros fuente de kernel (`fabric_router_mux_extension.cpp`, `fabric_router_relay_extension.cpp` y `fabric_router_udm_mux_extension.cpp`) que `FabricConfig::FABRIC_1D` necesita para compilar en JIT sus kernels de enrutado mux/relay. Esos ficheros sí existen en el árbol de fuentes real de tt-metal v0.78.0, por lo que se incorporan aquí byte a byte y se hacen localizables mediante la variable de entorno `TT_METAL_KERNEL_PATH` (ya existente en tt_metal, fijada en `run.sh`), sin depender de nada específico del modelo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con el prompt como única entrada en el ejemplo documentado.
- Servicio HTTP propio: expone un endpoint `POST /v1/videos/generations` en el puerto 20000 (o el siguiente libre) que acepta un JSON con el campo `prompt`.
- Interfaz Gradio local, incluida en el repositorio fuente, para pruebas interactivas.
- Gestión de ciclo de vida mediante tt-model-manager: `tt-model pull` descarga bundle y pesos, `tt-model serve` arranca el servidor.
- Compilación de kernels en el primer arranque para el dispositivo concreto, tras la cual el servidor queda listo cuando registra `Application startup complete`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica / no disponible.
- Capacidades multilingües: no disponible (los ejemplos de prompt están en inglés).
- Capacidades especiales adicionales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Generación de clips de vídeo para prototipado creativo: enviando un prompt descriptivo al endpoint `/v1/videos/generations`, se obtiene un vídeo a 540P útil para previsualizar ideas antes de invertir en una producción mayor.
- Validación de hardware Tenstorrent en entornos de evaluación: sirve para comprobar que una configuración Blackhole p300x2 con malla QB2 es capaz de ejecutar un pipeline de difusión de vídeo completo de extremo a extremo.
- Integración en pipelines internos de generación de contenido: al exponerse como servidor HTTP con un contrato JSON sencillo, se puede llamar desde un orquestador que encadene generación de guiones, prompts y renderizado.
- Banco de pruebas para portabilidad de modelos de difusión: al reutilizar WanTransformer3DModel de tt-metal, el bundle permite estudiar cuánto esfuerzo requiere llevar un modelo de vídeo concreto a TTNN partiendo de componentes ya existentes.
- Demostraciones técnicas y material de referencia: el repositorio fuente incluye una UI Gradio y un registro de puesta en marcha con los fallos encontrados al servir una generación real, lo que lo convierte en documentación práctica para quien replique el proceso.
- Investigación sobre empaquetado de kernels en TTNN: el parche de `kernel_patch/` y su uso de `TT_METAL_KERNEL_PATH` sirven de ejemplo reproducible para resolver la ausencia de fuentes de kernel en el wheel de PyPI.
- Automatización de vídeo bajo demanda en un flujo local: levantando el servidor una vez y dejándolo en marcha, se pueden encolar múltiples peticiones de generación desde scripts o herramientas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de métricas de latencia, throughput ni de calidad de vídeo (por ejemplo, VBench) para este bundle en la documentación proporcionada.

## Requisitos de hardware

- Acelerador objetivo: Tenstorrent Blackhole p300x2, ejecutando sobre la malla QB2. No se trata de un despliegue sobre GPU NVIDIA o AMD.
- VRAM estimada para inferencia: no disponible (depende de la memoria de las tarjetas Blackhole p300x2 y de la resolución de salida).
- GPU recomendadas: no aplica; el bundle está diseñado para aceleradores Tenstorrent Blackhole.
- Compatibilidad con GPU de consumo: no aplica al hardware objetivo; no se documenta una ruta de ejecución en GPU de consumo.
- Opciones de despliegue: tt-model-manager mediante `tt-model pull --with-weights` y `tt-model serve`, con instalación basada en pip/venv (no es una imagen de contenedor). El servidor ASGI escucha en el puerto 20000 o el siguiente libre. También existe una UI Gradio local en el repositorio fuente.
- Tiempo de arranque: el primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo / despliegue | Parametros | Hardware | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tt-skyreels (este bundle) | 1,3B | Tenstorrent Blackhole p300x2 (malla QB2) | Bundle de inferencia (TTNN + ASGI) | No disponible | HuggingFace: episod/tt-skyreels |
| Skywork/SkyReels-V2-DF-1.3B-540P-Diffusers (modelo base) | 1,3B | GPU (CUDA, via Diffusers) | Modelo de difusion texto-a-video | No disponible | HuggingFace: Skywork/SkyReels-V2-DF-1.3B-540P-Diffusers |
| tt-animatediff (patron de referencia) | No disponible | Tenstorrent (segun el bundle) | Bundle de inferencia (tt-dit-server) | No disponible | No disponible en la informacion proporcionada |

La comparativa se limita al modelo base y al bundle que sirve de patrón, ya que la información proporcionada no incluye datos de otros modelos de vídeo ni métricas que permitan contrastar rendimiento.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; conviene verificar los términos del modelo base SkyReels-V2 y de tt-metal antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación por parte de terceros.
- No se han publicado benchmarks ni métricas de calidad de vídeo, latencia o throughput; cualquier estimación de rendimiento sería especulativa.
- Está atado a hardware Tenstorrent Blackhole p300x2; no es portable directamente a GPU sin trabajo adicional.
- El primer arranque exige compilar kernels para el dispositivo y tarda varios minutos, lo que afecta a despliegues efímeros o con arranques frecuentes.
- El bundle depende de un parche de kernels (`kernel_patch/`) para suplir ficheros ausentes en el wheel de ttnn 0.78.0; si se actualiza ttnn o tt-metal, ese parche podría quedar obsoleto o dejar de ser necesario.
- Los ficheros del bundle están fijados a tt-metal v0.78.0, lo que limita la combinación con otras versiones del stack.
- Riesgo de alucinación visual y de incoherencia temporal inherente a los modelos de difusión de vídeo; no se documenta ningún mecanismo de mitigación específico en este bundle.
- Idiomas soportados y longitud de contexto del prompt: no disponibles, lo que dificulta planificar usos multilingües o con instrucciones largas.
- No se documentan opciones de cuantización, por lo que no hay una vía clara para reducir requisitos de memoria.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/episod/tt-skyreels
- Modelo base (Diffusers): https://huggingface.co/Skywork/SkyReels-V2-DF-1.3B-540P-Diffusers
- Repositorio fuente, UI Gradio y registro de puesta en marcha: https://github.com/tsingletaryTT/tt-skyreels
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- tt-metal (stack de kernels y modelos TTNN, version v0.78.0 referenciada): no disponible en la informacion proporcionada
- Paper de SkyReels-V2: no disponible en la informacion proporcionada
- Demos adicionales: no disponible en la informacion proporcionada
