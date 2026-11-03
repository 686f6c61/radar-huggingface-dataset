# alvarolizama/LFM3-1.7B-MLX-oQ4-fp16

## Resumen

LFM3-1.7B-MLX-oQ4-fp16 es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario alvarolizama en HuggingFace. El artefacto ha sido generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta orientada a la librería MLX de Apple, permitiendo ejecutar el modelo en hardware Apple Silicon con un consumo de memoria reducido. El checkpoint resultante ocupa 1,038 GB (0,966 GiB) con una media efectiva de 4,801 bits por peso.

El modelo base, LFM3, corresponde a la familia de modelos pequeños de Liquid AI, aunque la información disponible en este repositorio no detalla la arquitectura original ni el proceso de entrenamiento. La ficha se limita a documentar el artefacto cuantizado: su distribución de bits, formato de almacenamiento y requisitos de despliegue.

La relevancia de esta publicación es práctica: demuestra un flujo de cuantización de precisión mixta que asigna 4 bits al 71,1% de los pesos, 5 bits al 27,9% y deja en FP16 una fracción residual mínima, lo que permite desplegar un modelo de 1,7B en equipos con memoria unificada modesta manteniendo una calidad razonablemente cercana al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; el repositorio solo documenta la cuantización) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 4-bit grupo 64 (71,099% de pesos), affine 5-bit grupo 64 (27,901%), affine 6-bit grupo 64 (0,970%), affine 8-bit grupo 64 (0,008%), FP16 (0,022%); media efectiva 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx, con custom_code) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en el repositorio. La model card únicamente describe el proceso de cuantización aplicado: oQ (oMLX v0.7.3) realiza una asignación de precisión mixta por tensor, con grupos de cuantización de tamaño 64. La distribución resultante concentra el 99% de los pesos lógicos entre 4 y 5 bits, reservando 6 y 8 bits para una fracción inferior al 1% y dejando en FP16 solo el 0,022% de los pesos (0,001 GiB de almacenamiento).

El desglose de almacenamiento confirma que la totalidad de los 1,729B de pesos lógicos corresponden al modelo de lenguaje; no se documentan cabezas multimodales ni componentes adicionales. Tampoco se detallan los datos de entrenamiento del modelo original, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto: el artefacto es un modelo de lenguaje causal cuantizado, apto para tareas de generación y continuación de texto, aunque no se documentan evaluaciones específicas.
- Razonamiento y código: no disponible; la model card no aporta información sobre capacidades diferenciales del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad operativa del artefacto, al estar empaquetado para MLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada: al ocupar 0,966 GiB, el modelo puede cargarse en equipos Apple Silicon de gama media (por ejemplo, 8 GB de memoria unificada) dejando margen para el contexto y el resto del sistema. Es adecuado para prototipado offline sin GPU dedicada.
- Asistentes de escritura en local: generación y reescritura de texto en aplicaciones de escritorio macOS, aprovechando la integración nativa de MLX con el hardware Apple y evitando el envío de datos a servicios en la nube.
- Pruebas de pipelines de cuantización: sirve como referencia para validar flujos de oQ/oMLX antes de aplicarlos a modelos de mayor tamaño, dado que la model card documenta con detalle la distribución de bits.
- Aplicaciones educativas y de investigación: permite experimentar con modelos de 1,7B en portátiles sin infraestructura de servidor, útil para cursos y trabajos prácticos sobre cuantización e inferencia eficiente.
- Generación de texto en entornos con restricciones de memoria: escenarios donde el presupuesto de VRAM o memoria unificada es inferior a 2 GB y se necesita un modelo de lenguaje funcional.
- Comparación de calidad 4-bit frente a FP16: el checkpoint permite medir la degradación introducida por la cuantización mixta frente al modelo original, si se dispone de este último.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: 0,966 GiB de pesos en disco; en carga, el modelo requiere aproximadamente 1 GB de memoria unificada más el espacio para el contexto y los buffers de inferencia (no cuantificado en la información disponible).
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4 y posteriores). No se documenta soporte para GPU NVIDIA o AMD en este artefacto.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o superior; también en equipos con 4-6 GB si se limita la longitud de contexto.
- Opciones de despliegue: MLX (librería `mlx`), con `custom_code` declarado en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato es específico de MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ4-fp16 | 1,729B | no disponible | Mixta 4/5/6/8-bit + FP16 | no disponible | safetensors (MLX) |
| LFM3-1.7B (original) | 1,729B | no disponible | FP16/BF16 | no disponible | no disponible |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa con alternativas de la misma categoría (por ejemplo, otros modelos de 1-2B cuantizados para MLX) no puede completarse con datos verificables.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse licencia, no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base LFM3 antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce qué idiomas cubre el modelo base, lo que impide garantizar calidad en castellano u otros idiomas.
- Artefacto de terceros: la cuantización la ha realizado un usuario independiente (alvarolizama), no el desarrollador original del modelo; no hay garantía de que se hayan validado las capacidades del modelo tras la cuantización.
- Degradación por cuantización: aunque la media es de 4,801 bits/peso, el 71% de los pesos está a 4 bits, lo que puede afectar a tareas sensibles a la precisión numérica.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fiabilidad ni mitigaciones.
- Dependencia de MLX: el formato `custom_code` y la librería MLX limitan el despliegue a ecosistemas Apple; no es portable directamente a servidores con GPU NVIDIA.
- Sin métricas de rendimiento: no hay benchmarks publicados, por lo que no puede compararse objetivamente con alternativas.
- Contexto desconocido: la ausencia de datos sobre la ventana de contexto impide planificar casos de uso con entradas largas.

## Enlaces

- HuggingFace: https://huggingface.co/alvarolizama/LFM3-1.7B-MLX-oQ4-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
