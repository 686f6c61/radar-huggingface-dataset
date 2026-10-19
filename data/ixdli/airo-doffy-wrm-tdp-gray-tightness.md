# IXDLI/AIRO-Doffy-WRM-TDP-gray-tightness

## Resumen

AIRO-Doffy-WRM-TDP-gray-tightness es una política de imitación para robótica publicada por el usuario IXDLI en Hugging Face. Se trata de una adaptación TDP (policy de difusión) del proyecto AIRO-Doffy, entrenada sobre el dataset local de LeRobot denominado `WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness`. El modelo resuelve una tarea concreta de manipulación: el agarre de cilindros de distintos tamaños con control de estrechez (tightness), a partir de observaciones multimodales que combinan estado articular del robot, imágenes RGB y mediciones de rango y contacto del sensor Beaver.

El repositorio tiene 13,1 GB e incluye, según la model card, el código fuente de entrenamiento (`source.tar.gz`), la configuración resuelta, los checkpoints, la partición y procedencia de datos, y las métricas del run. El checkpoint final es `last.pt`, con pesos EMA, resultado de un presupuesto fijo de 100.000 pasos de optimización con batch de 32, ejecutado en una GPU y ocho CPU. El autor indica explícitamente que el rendimiento en robot real no ha sido establecido por este entrenamiento.

Su relevancia es acotada pero clara: no es un modelo de propósito general, sino un artefacto de investigación reproducible para imitation learning con realimentación táctil, con tracking online en W&B y hash SHA-256 del checkpoint publicado. No hay información sobre licencia, idiomas ni benchmarks en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de difusión (TDP) para imitación robótica; la arquitectura exacta se remite a `config.json` y `run_manifest.json`, no disponible en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; las observaciones son estado articular, RGB y medidas de rango/contacto del sensor Beaver |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidad lingüística) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); checkpoints `last.pt` y, cuando existe, `best.pt` |
| Pasos de entrenamiento | 100.000 pasos de optimización, batch de 32 |
| Hardware de entrenamiento | 1 GPU y 8 CPU |
| Dataset | `WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness` (LeRobot) |
| Tamano del repositorio | 13,1 GB |
| SHA-256 de `last.pt` | `80578ebe7f86dc4ab1e61cc43dacd3de98507c1289276e1e6b0b7e3bb26ceb9a` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una adaptación TDP, es decir, una policy de difusión aplicada a imitación robótica, con etiquetas que confirman `diffusion-policy`, `imitation-learning` y `tactile`. El pipeline declarado en Hugging Face es `robotics` y la librería es PyTorch. Las observaciones de entrada son tres modalidades: estado articular del robot, imagen RGB y mediciones de rango y contacto del sensor Beaver. No se detalla en la información disponible el número de capas, dimensión de las embeddings, número de pasos de difusión, tipo de encoder visual ni si existe fusión multimodal explícita; esos datos quedan en `config.json` y `run_manifest.json` dentro del repositorio.

El entrenamiento se ejecutó con un presupuesto fijo de 100.000 pasos de optimización, batch de 32, sobre una GPU y ocho CPU, sin datos publicados sobre número de tokens, tamaño del dataset, composición de las trayectorias ni uso de RLHF o DPO (procedimientos, por otra parte, poco habituales en imitation learning). El autor sí publica la partición train/validación, la procedencia de los datos, las métricas del run y el checkpoint final con pesos EMA. `best.pt`, cuando está presente, se selecciona según la métrica de validación configurada. La reproducibilidad está cubierta con el comando `python -m policies.tdp.train --config config.json` tras ajustar las rutas locales.

## Capacidades

- Generación de acciones de manipulación (agarre de cilindros) por difusión, condicionadas a observaciones multimodales.
- Fusión de estado articular, imagen RGB y señal táctil (rango y contacto del sensor Beaver) en una única política.
- Aprendizaje por imitación a partir de demostraciones teleoperadas registradas en formato LeRobot.
- Generalización prevista a cilindros de distintos tamaños dentro de la distribución del dataset de entrenamiento.
- Control de fuerza implícito mediante la señal de contacto del sensor táctil.
- Ejecución como policy de robot en PyTorch, integrable en un bucle de control propio.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto; no es un modelo de lenguaje ni un VLA.

## Casos de uso

- Agarre de cilindros de diámetro variable en laboratorio: la política consume estado articular, RGB y contacto para producir acciones de pinza; es adecuada porque el dataset de entrenamiento cubre explícitamente "different sizes".
- Manipulación con control de estrechez (tightness): el modelo fue entrenado en un dataset etiquetado como "gray tightness", por lo que es candidato a tareas donde la fuerza de agarre debe ajustarse con precisión; requiere validación en robot real antes de producción.
- Investigación en imitation learning táctil: sirve como baseline reproducible (100.000 pasos, batch 32, configuración y métricas publicadas) para comparar variantes de fusión viso-táctil.
- Reproducción y auditoría de experimentos: el repositorio incluye código fuente, manifiesto de run, partición de datos, checkpoints y hash SHA-256, lo que permite replicar el entrenamiento y verificar la integridad de `last.pt`.
- Fine-tuning sobre nuevos datasets LeRobot: el pipeline `policies.tdp.train` acepta configuración externa, lo que facilita adaptar la política a otros objetos o sensores partiendo de este checkpoint.
- Docencia y formación técnica: un caso de estudio completo de policy de difusión con datos multimodales, presupuesto de cómputo modesto (1 GPU) y trazabilidad de experimentos vía W&B.
- Evaluación comparativa de arquitecturas de políticas: punto de partida para medir, en el mismo entorno y dataset, políticas de difusión frente a alternativas tipo ACT o VLA; no hay resultados publicados que permitan anticipar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las métricas del run de W&B y a los ficheros de métricas incluidos en el repositorio, pero no se proporcionan cifras de éxito de agarre, error de posición, tasa de convergencia ni comparaciones numéricas. El autor indica de forma explícita que el rendimiento en robot real no ha sido establecido por este entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 13,1 GB, pero ese tamaño incluye código, configuración, checkpoints y posiblemente artefactos de datos; el tamaño concreto de `last.pt` no se indica.
- GPU recomendadas: no disponible. El único dato objetivo es que el entrenamiento se completó con una sola GPU y ocho CPU, sin especificarse el modelo de GPU; la inferencia, por tanto, es plausible en un único acelerador, pero no puede confirmarse.
- Viabilidad en GPU de consumo: no confirmable con la información disponible; requiere inspeccionar `config.json` y medir el checkpoint.
- Opciones de despliegue: ejecución nativa en PyTorch mediante el código incluido en `source.tar.gz`. No se documentan exportaciones a TorchScript, ONNX, TensorRT, ni servidores de inferencia como vLLM, TGI, llama.cpp u Ollama (estos últimos no aplican a un modelo de política).
- Latencia y throughput: no disponibles. Como referencia conceptual, las políticas de difusión requieren varios pasos de denoising por bloque de acciones, lo que condiciona el control en tiempo real; no se aporta el número de pasos ni la frecuencia de control alcanzada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación es únicamente categórica y de disponibilidad.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIRO-Doffy-WRM-TDP-gray-tightness | Policy de difusión con entrada táctil y RGB | no disponible | no aplica | no disponible | Público en Hugging Face (0 descargas, 0 likes) |
| Diffusion Policy (referencia académica) | Policy de difusión visomotora | no disponible | no aplica | no disponible | Código público |
| ACT / ALOHA (referencia académica) | Transformer con action chunking | no disponible | no aplica | no disponible | Código público |
| OpenVLA (referencia académica) | Vision-language-action sobre LLM | no disponible | no disponible | no disponible | Pesos públicos |

Las cifras de parámetros, contexto y licencia de las alternativas no están verificadas en la información proporcionada y se marcan como no disponibles para no introducir datos sin respaldo.

## Limitaciones y advertencias

- Rendimiento en robot real no validado: la propia model card lo declara; cualquier despliegue físico exige evaluación propia.
- Ausencia de benchmarks públicos: no hay cifras de éxito de agarre ni comparaciones con otras políticas, lo que impide estimar su calidad relativa.
- Licencia no disponible: no puede asumirse uso comercial; hay que contactar con el autor antes de integrarlo en un producto.
- Especialización estrecha: entrenado sobre un único dataset de agarre de cilindros con etiqueta "gray tightness"; se espera un sesgo fuerte hacia tamaños, materiales, iluminación y posiciones presentes en esas demostraciones.
- Dependencia del sensor Beaver: la política asume la disponibilidad de mediciones de rango y contacto; sin ese hardware o con otro sensor, la distribución de entrada cambia y el rendimiento puede degradarse.
- Riesgo de fallo silencioso: no aplica el concepto de alucinación, pero sí el equivalente en robótica —acciones plausibles y físicamente inválidas—, por lo que se recomienda limitación de par, paradas de seguridad y supervisión humana.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no es adecuado para interfaces conversacionales, planificación de alto nivel ni agentes basados en texto.
- Sesgos de dataset no auditados: no se documenta la diversidad de operadores, objetos ni condiciones de recogida de datos, ni si se realizó algún filtrado de trayectorias fallidas.
- Reproducibilidad condicionada: el comando de entrenamiento requiere actualizar rutas locales, y no se detalla la versión de PyTorch ni las dependencias exactas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-TDP-gray-tightness
- Run de W&B del entrenamiento: https://wandb.ai/yuyuan-wu-universiteit-gent/AIRO-Doffy-WRM-Grasp/runs/87c2cad7
- Dataset de LeRobot: `WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness` (nombre citado en la model card; URL no disponible)
- Código de entrenamiento: `source.tar.gz` dentro del repositorio del modelo (URL directa no disponible)
- Configuración y manifiesto: `config.json` y `run_manifest.json` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
