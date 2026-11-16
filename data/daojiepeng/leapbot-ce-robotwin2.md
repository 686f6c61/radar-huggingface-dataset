# DaojiePENG/leapbot-ce-robotwin2

## Resumen

LeapBot-CE (CloudEdge) es una política visión-lenguaje-acción (VLA) con arquitectura dividida entre nube y borde, desarrollada por Daojie Peng y publicada en Hugging Face. El modelo resuelve el problema de control robótico cuando la latencia de red degrada el flujo de observaciones: la nube ejecuta un modelo de mundo de vídeo de alta capacidad (Fast-WAM sobre el backbone Wan2.2 TI2V-5B) y envía una caché KV comprimida al dispositivo de borde, que ejecuta un experto de acción ligero sobre la observación en vivo.

La innovación principal es el códec de caché KV: la caché del lado nube se codifica (cuello de botella agrupado más decodificador opcional) antes de la transmisión, de modo que la política sigue operando cuando el flujo de observación llega retrasado por la red. El checkpoint publicado corresponde a los experimentos sobre el benchmark RoboTwin 2.0, con 50 tareas y 50 episodios por tarea y nivel de retardo.

El repositorio incluye los pesos delta del entrenamiento (2,0 GB), la configuración, las estadísticas de normalización y todos los activos base congelados necesarios para ejecutar el modelo. Está liberado bajo licencia MIT, aunque los activos base conservan sus términos originales (Wan2.2 es Apache-2.0). Es relevante para investigadores en manipulación robótica que necesiten robustez frente a latencia de red en despliegues reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida nube-borde: modelo de mundo de vídeo (Fast-WAM sobre Wan2.2 TI2V-5B) en nube + experto de acción DiT en borde |
| Parámetros totales | no disponible (el checkpoint delta es de 2,0 GB; el backbone Wan2.2 TI2V-5B y el experto de vídeo se cargan aparte) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos; caché KV con rejilla de pool 6x10) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos y configuración); activos base con términos upstream: Wan2.2 Apache-2.0, Fast-WAM y SigLIP-Base según sus releases originales |
| Formato de pesos | PyTorch (`.pt`), dict plano con `leapbotce_delta=True`; safetensors para SigLIP-Base |

## Arquitectura y entrenamiento

LeapBot-CE es una política VLA con separación nube-borde. En la nube, un modelo de mundo de vídeo (Fast-WAM) construido sobre el backbone Wan2.2 TI2V-5B ejecuta la ruta lenta de alta capacidad y produce una caché KV que se comprime mediante un códec (cuello de botella de dimensión 1024 con rejilla de pool 6x10 y decodificador de rango 256, desactivado en inferencia) antes de transmitirse al borde. En el borde, un experto de acción ligero (ActionDiT con 1024 dimensiones ocultas) opera sobre el flujo de observación en vivo, apoyado por un codificador visual SigLIP-Base (`vit_base_patch16_siglip_224`) con prefijo habilitado y un codificador de propiocepción.

La configuración de RoboTwin emplea 3 cámaras (cabeza y dos muñecas), resolución de entrada de 240x320, dimensión de propiocepción de 14 y horizonte de acción de 32. El checkpoint `step_158206.pt` contiene únicamente los módulos entrenables sobre Fast-WAM: `action_expert`, `cloud_kv_adapter`, `cloud_kv_codec`, `edge_vision_projector`, `proprio_encoder`, `video_lora` y `leapbotce_meta`. La carga es estricta sobre esos siete módulos. El metadato `leapbotce_meta` registra `edge_vision_mode` y `use_cloud_cache`, y el cargador rechaza discrepancias con la configuración de ejecución. No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Control robótico visión-lenguaje-acción: genera acciones de manipulación a partir de observaciones visuales multicámara y propiocepción.
- Robusto frente a latencia de red: mantiene el rendimiento cuando el flujo de observación llega retrasado, gracias a la caché KV codificada del lado nube.
- Modelado de mundo de vídeo: el componente nube (Fast-WAM sobre Wan2.2) predice dinámica visual para informar la política.
- Fusión nube-borde: separa la ruta lenta de alta capacidad (nube) de la ruta rápida de acción (borde).
- Soporte multicámara: 3 vistas simultáneas (cabeza y dos muñecas).
- Planificación con horizonte de acción de 32 pasos y recálculo configurable (8 o 24 pasos).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad de lenguaje general; el modelo es específico de control robótico.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión es específica para control robótico).

## Casos de uso

- Manipulación robótica con latencia de red variable: el modelo mantiene tasas de éxito del 82,32 % con un retardo de 40 pasos frente al 87,72 % sin retardo, lo que lo hace adecuado para robots teleoperados o autónomos cuya nube esté lejos físicamente del dispositivo.
- Despliegue en borde con cómputo limitado: el experto de acción ligero y el codificador SigLIP-Base se ejecutan en el dispositivo, mientras la carga pesada queda en la nube, permitiendo hardware de borde modesto.
- Investigación en benchmark RoboTwin 2.0: sirve como checkpoint de referencia para reproducir los experimentos de 50 tareas y comparar políticas VLA bajo distintos niveles de retardo.
- Evaluación de robustez frente a latencia: útil para estudiar cómo degrada el rendimiento una política VLA cuando el flujo de observación envejece, con protocolo de envejecimiento reproducible.
- Sistemas de control con planificación por horizontes: el horizonte de acción de 32 con recálculo cada 8 pasos permite ajustar el equilibrio entre reactividad y coste computacional en producción.
- Integración en pipelines de investigación de modelos de mundo: el componente Fast-WAM/Wan2.2 puede reutilizarse para estudiar la transmisión de caché KV comprimida entre nube y borde.

## Benchmarks y rendimiento

Tasa de éxito (%) en RoboTwin 2.0, 2.500 episodios por celda (50 tareas x 50 episodios), semilla única 42, intervalos de Wilson del 95 % de ±2,0 pp como máximo:

| replan | D=0 | D=10 | D=20 | D=40 | D=60 | D=80 | Retención (D40/D0) |
|---|---|---|---|---|---|---|---|
| 8 (principal) | 87,72 | 86,08 | 85,28 | 82,32 | 79,80 | 75,12 | 93,8 % |
| 24 (nativo) | 86,96 | 85,84 | 85,16 | 80,88 | - | - | 93,0 % |

Referencia comparativa bajo el mismo protocolo de 8 pasos: los baselines estilo Fast-WAM caen a 44,96 en D=20 y a 14,72 en D=40 (StarWAM-MoT), que es el régimen para el que se diseña este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los activos base suman aproximadamente 16 GB en disco (2,0 GB del experto de acción, 12 GB del experto de vídeo, 355 MB de SigLIP-Base, más el backbone Wan2.2 TI2V-5B y el VAE/text encoder que se descargan del Hub).
- GPU recomendadas: no disponible. El diseño nube-borde sugiere GPU de datacenter (A100, H100) para la ruta nube y hardware ligero para el borde, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible; el componente de vídeo de 12 GB más el backbone Wan2.2 de 5B hacen improbable el despliegue completo en GPU de consumo.
- Opciones de despliegue: código de inferencia y evaluación pendiente de publicación como proyecto open source; la configuración apunta directamente a un snapshot descargado (`git clone` del repo y rutas `./base/...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; solo se reportan tasas de éxito bajo retardo simulado, no medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento RoboTwin 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LeapBot-CE (este) | VLA nube-borde | no disponible (delta 2,0 GB) | no disponible | 87,72 % D=0; 82,32 % D=40 (replan 8) | MIT | Hugging Face |
| StarWAM-MoT (baseline citado) | VLA estilo Fast-WAM | no disponible | no disponible | 44,96 % D=20; 14,72 % D=40 | no disponible | no disponible |
| LeapBot-CE LIBERO | VLA nube-borde | no disponible | no disponible | no disponible (checkpoint LIBERO) | MIT | Hugging Face |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son de semilla única (42); el autor no reclama varianza entre semillas de entrenamiento.
- El checkpoint contiene solo pesos delta; requiere descargar el backbone Wan2.2 y los activos base del Hub y de `base/`, con verificación estricta de los siete módulos.
- `dataset_stats.json` debe pasarse al procesador; la normalización de acciones está definida por él y no debe recalcularse.
- El decodificador del códec KV está desactivado en inferencia; el cuello de botella de 1024 dimensiones con rejilla 6x10 condiciona la fidelidad de la caché transmitida.
- Licencia MIT para pesos y configuración, pero los activos base conservan términos upstream (Wan2.2 Apache-2.0; Fast-WAM y SigLIP-Base según sus releases); verificar antes de uso comercial.
- El código de inferencia y evaluación aún no se ha publicado; solo está disponible el snapshot con configuración.
- Ámbito limitado a control robótico en RoboTwin 2.0; no es un modelo de lenguaje general y no se documentan capacidades multilingües ni de tool calling.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- Los datos de benchmark proceden del propio autor; no hay validación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DaojiePENG/leapbot-ce-robotwin2
- Checkpoint LIBERO relacionado: https://huggingface.co/DaojiePENG/leapbot-ce-libero
- Backbone Wan2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador Wan2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
