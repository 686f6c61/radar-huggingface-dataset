# Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_nofix_b64_60k_h48e24_scratch_dmlp_cps_vf64_ema

## Resumen

Cosmos3-Nano es un modelo de mundo en vídeo (video world model) desarrollado sobre el framework Cosmos, orientado a robótica y control de robots en bucle cerrado. Este repositorio concreto contiene un ajuste fino (fine-tuning) del modelo base Cosmos3-Nano con un módulo externo de acción basado en DiT (Diffusion Transformer), entrenado sobre el dataset RoboTwin 2.0 en formato LeRobot v3.0 con la configuración de robot aloha-agilex. El autor del ajuste es el usuario de Hugging Face Myungkyu.

La innovación principal del modelo es su esquema de condicionamiento desacoplado: la política de acción recibe condicionamiento unidireccional vídeo-a-acción y utiliza horarios de ruido independientes para el vídeo y para la acción (el ruido de la acción se muestrea de forma independiente al del vídeo, mediante una pasada de vídeo de puro ruido sin gradientes). Este diseño permite generar acciones de robot condicionadas por la predicción visual del world model sin que ambas modalidades compartan el proceso de difusión.

El modelo se publica como pesos EMA (net_ema) del checkpoint final de entrenamiento, casteados a bf16 y almacenados bajo los nombres net.*, en un único checkpoint torch.distributed.checkpoint (DCP) sin estado del optimizador. El repositorio ocupa 32,6 GB y no cuenta con descargas ni valoraciones en el momento de la consulta. La nomenclatura del identificador revela detalles de configuración: 36 capas (l36), dimensión 1024 (d1024), batch 64 (b64), 60k pasos (60k), 48 cabezas (h48) y 24 capas de experto (e24), entre otros parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de vídeo Cosmos3-Nano con DiT de acción externo; condicionamiento vídeo-a-acción desacoplado con horarios de ruido independientes |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`; config en YAML |
| Capas / dimensión | 36 capas (l36), dimensión 1024 (d1024), 48 cabezas (h48), 24 capas de experto (e24) según el identificador |
| Dataset de entrenamiento | RoboTwin 2.0 (LeRobot v3.0, aloha-agilex) |
| Pasos de entrenamiento | 60k (b64) según el identificador |
| VAE requerido | Wan2.2_VAE.pth de Wan-AI/Wan2.2-TI2V-5B |
| Tamaño del repo | 32,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo del framework Cosmos, y le añade un DiT de acción externo para producir políticas de control robótico. El condicionamiento es unidireccional (vídeo hacia acción) y utiliza horarios de ruido desacoplados: el ruido de la acción se muestrea de forma independiente del ruido del vídeo, y la pasada de vídeo se realiza en modo de puro ruido y sin gradientes. Esta separación evita acoplar los procesos de difusión de ambas modalidades y permite que la política de acción se entrene sobre representaciones visuales generadas por el world model.

El entrenamiento se realizó sobre RoboTwin 2.0 en formato LeRobot v3.0 con la configuración de robot aloha-agilex, durante 60k pasos con batch de 64. El identificador incluye marcas de configuración como "decoupled", "nofix", "scratch_dmlp", "cps" y "vf64", que indican respectivamente el esquema desacoplado, la ausencia de corrección ("nofix"), un MLP de acción entrenado desde cero, y parámetros de condicionamiento y de vídeo (vf64). Los pesos publicados son los EMA del checkpoint final, casteados a bf16, sin estado del optimizador. El modelo requiere el VAE Wan2.2 (Wan2.2_VAE.pth) para funcionar, y la configuración de entrenamiento incluida en `config.yaml` contiene rutas locales sustituidas por marcadores de posición que deben reemplazarse antes de cargar el modelo.

## Capacidades

- Generación de acciones de robot en bucle cerrado condicionadas por predicción visual de vídeo.
- Modelado de mundo en vídeo: predicción de fotogramas futuros como representación interna para la política.
- Control robótico con la configuración aloha-agilex sobre el benchmark RoboTwin 2.0.
- Condicionamiento desacoplado vídeo-a-acción con horarios de ruido independientes.
- Entrenamiento desde cero del MLP de acción (scratch_dmlp) sobre el world model preentrenado.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en world models para robótica: el modelo permite estudiar cómo un world model de vídeo condiciona políticas de acción en tareas de manipulación, sirviendo de base para experimentos de condicionamiento desacoplado.
- Manipulación robótica con aloha-agilex: se emplea como política de control en tareas del benchmark RoboTwin 2.0, generando acciones a partir de observaciones visuales en bucle cerrado.
- Evaluación de políticas video-to-action: útil para comparar esquemas de condicionamiento (acoplado frente a desacoplado) en entornos simulados de manipulación bimanual.
- Reproducción de experimentos: al incluir `config.yaml` y sumas SHA-256, permite reproducir el pipeline de entrenamiento y verificar la integridad de los pesos.
- Base para fine-tuning en nuevos dominios robóticos: los pesos EMA en bf16 pueden servir como punto de partida para ajustar la política a otros datasets en formato LeRobot.
- Estudio de planificación implícita mediante predicción de vídeo: el world model puede utilizarse para analizar cómo la predicción visual futura mejora la selección de acciones en tareas de contacto.
- Despliegue en servidor de políticas: mediante el servidor de acción de cosmos-framework con `--checkpoint-path` y `--config-file`, integrable en pipelines de evaluación robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 32,6 GB en bf16, por lo que la inferencia requiere al menos esa cantidad de VRAM para cargar los pesos completos, más la memoria del VAE Wan2.2 y de las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint, se requiere una GPU de centro de datos (A100 80 GB, H100) o varias GPU con paralelismo.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) sin técnicas de descarga o particionado no documentadas.
- Opciones de despliegue: servidor de acción de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este formato DCP.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano (fine-tune de este repo) | World model de vídeo + DiT de acción | no disponible (36 capas, d1024) | no disponible | no disponible | Hugging Face, DCP bf16 |
| Cosmos3-Nano base | World model de vídeo | no disponible | no disponible | no disponible | Referenciado en la model card |
| Wan2.2-TI2V-5B | Modelo de vídeo (proporciona el VAE) | 5B (según nombre) | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Modelo de investigación altamente especializado: entrenado únicamente sobre RoboTwin 2.0 con aloha-agilex, por lo que su generalización a otros robots o entornos no está validada.
- Formato de pesos DCP de un solo rango, no estándar en el ecosistema (no safetensors ni GGUF): requiere el servidor de cosmos-framework para cargarse.
- Dependencia obligatoria del VAE Wan2.2 (Wan2.2_VAE.pth), que debe obtenerse por separado.
- La `config.yaml` contiene rutas locales sustituidas por marcadores de posición (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`) que deben reemplazarse manualmente.
- Solo se publican los pesos EMA del checkpoint final, sin estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Riesgo de alucinación visual inherente a los world models generativos: las predicciones de vídeo pueden divergir de la realidad y degradar la política en bucle cerrado.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que reduce la evidencia externa sobre su funcionamiento.
- No se documentan sesgos, idiomas ni comportamientos fuera del dominio robótico.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_nofix_b64_60k_h48e24_scratch_dmlp_cps_vf64_ema
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboTwin 2.0: no disponible en la información proporcionada
- Framework Cosmos: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
