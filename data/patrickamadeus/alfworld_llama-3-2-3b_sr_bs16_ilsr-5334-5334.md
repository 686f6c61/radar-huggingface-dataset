# patrickamadeus/alfworld_Llama-3.2-3B_SR_bs16_ILSR.5334.5334

## Resumen

`alfworld_Llama-3.2-3B_SR_bs16_ILSR.5334.5334` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` realizado por el usuario `patrickamadeus` para resolver tareas de ALFWorld, un benchmark de entornos domésticos de TextWorld en el que un agente debe ejecutar secuencias de acciones textuales para completar objetivos. El modelo forma parte de un estudio sobre "Early Experience" y "imagined experience", en el que se combinan filas de experto con filas de auto-reflexión generadas por el propio modelo.

Arquitectura transformer decoder-only de 3.212.749.824 parámetros (3B), con la ventana de contexto original de Llama 3.2 (no se especifica en la información disponible, aunque el entrenamiento usa longitud máxima de 4.096 tokens). El ajuste se realizó con LlamaFactory en modo SFT, learning rate 1e-5, schedule coseno con 3% de warmup, bf16 y AdamW 8-bit paginado, sobre 42.666 filas (21.335 de experto + 21.331 de reflexión) durante 2 épocas.

Su relevancia es acotada: no es un modelo de propósito general, sino un checkpoint de investigación orientado a agentes que operan en entornos textuales. Aun así, los resultados reportados (83,3% en valid_seen y 74,9% en valid_unseen) son competitivos frente a las variantes de imitación e implicit world modeling del paper de referencia, y lo convierten en un punto de partida útil para experimentos de razonamiento multi-paso y self-reflection en agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; entrenamiento con max length 4.096 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors bf16) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only con atención causal estándar y 3.212.749.824 parámetros. El ajuste se realizó con LlamaFactory en modo SFT, learning rate 1e-5, schedule coseno con 3% de warmup por etapa, precisión bf16, optimizador paged AdamW 8-bit, longitud máxima de 4.096 tokens y semilla 0. La etapa única `ILSR.5334.5334` combina y mezcla 21.335 filas de experto con 21.331 filas de reflexión liberadas (42.666 filas en total), lo que equivale a 2,00 épocas con batch efectivo de 16 filas por paso (5.334 pasos de optimizador).

La innovación metodológica no está en la arquitectura, sino en los datos: el brazo `SR` (self-reflection) del proyecto "Early Experience" entrena al modelo con filas de experto y filas de auto-reflexión generadas por el propio modelo, alineadas con la línea de trabajo del paper *Early Experience*. Los datos provienen de `osunlp/early-experience` (subconjunto `alfworld/`) y se usaron sin modificar. El checkpoint se inicializa desde `meta-llama/Llama-3.2-3B-Instruct` y se publica como snapshot final de la etapa (los dos números del nombre son iguales, lo que indica que el schedule está completo).

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a la resolución de tareas domésticas en ALFWorld (secuencias de acciones textuales).
- Planificación de acciones en entornos de agente con observaciones textuales y objetivos declarados.
- Auto-reflexión: el modelo ha sido entrenado con filas de reflexión, por lo que está expuesto a razonamientos del tipo "qué salió mal y qué haría distinto".
- Ejecución de instrucciones conversacionales heredadas de Llama-3.2-3B-Instruct.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base Llama 3.2 Instruct lo soporta, pero no se documenta en esta ficha).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).
- Modo "thinking" explícito: no disponible como funcionalidad separada.

## Casos de uso

- Investigación en agentes de texto: reproducir los resultados del paper *Early Experience* sobre ALFWorld con un checkpoint ya entrenado, sin necesidad de reentrenar desde cero.
- Evaluación de self-reflection en agentes: comparar el brazo `SR` con los brazos de imitación e implicit world modeling del mismo paper usando el mismo pipeline de evaluación (3 episodios por juego, temperatura 0,4, top_p 1,0, 50 pasos).
- Baseline para ajustes finos posteriores en tareas de TextWorld o entornos domésticos textuales similares, aprovechando que el modelo ya está adaptado al formato de acciones y observaciones de ALFWorld.
- Generación de trayectorias sintéticas de agente: usar el modelo para producir secuencias de acciones etiquetadas que alimenten experimentos de RL o de destilación.
- Estudio de robustez ante generalización: evaluar la brecha entre `valid_seen` (83,3%) y `valid_unseen` (74,9%) como indicador de sobreajuste a distribuciones de juegos vistas.
- Docencia y prototipado de agentes: servir como ejemplo reproducible de pipeline SFT con LlamaFactory sobre un modelo de 3B, ejecutable en hardware modesto.

## Benchmarks y rendimiento

Tasa de éxito (%) en ALFWorld, 3 episodios por juego, temperatura 0,4, top_p 1,0, 50 pasos, media sobre juegos con IC del 95%:

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 juegos) | 83,3 (78,1-88,1) | 83,6 (77,1-89,3) |
| valid_unseen (134 juegos) | 74,9 (69,7-79,9) | 76,1 (68,7-82,8) |

Referencia del paper (Early Experience, Tabla 4, Llama-3.2-3B, ALFWorld): imitación 78,1; implicit world modeling 83,6; self-reflection 85,9.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 6,4 GB solo para pesos (3,21B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 8-10 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,2 GB de pesos; en 4 bits, aproximadamente 1,6 GB de pesos (cuantizaciones no publicadas por el autor; requeriría conversión propia a GGUF/AWQ/GPTQ).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB con cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers + PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ALFWorld valid_seen | ALFWorld valid_unseen | Licencia |
|---|---|---|---|---|---|
| Este modelo (SR, bs16) | 3,21B | 4.096 (entrenamiento) | 83,3 | 74,9 | llama3.2 |
| Llama-3.2-3B imitation (paper) | 3,21B | 4.096 (entrenamiento) | 78,1 | no disponible | llama3.2 |
| Llama-3.2-3B implicit world modeling (paper) | 3,21B | 4.096 (entrenamiento) | 83,6 | no disponible | llama3.2 |
| Llama-3.2-3B self-reflection (paper) | 3,21B | 4.096 (entrenamiento) | 85,9 | no disponible | llama3.2 |

Las cifras de los tres modelos de referencia provienen de la Tabla 4 del paper *Early Experience* citada en la model card; los splits `valid_unseen` de esas variantes no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente de propósito general; está especializado en el formato de acciones y observaciones de ALFWorld y su rendimiento fuera de ese dominio no está documentado.
- Brecha de generalización: la diferencia entre `valid_seen` (83,3%) y `valid_unseen` (74,9%) indica cierta dependencia de la distribución de juegos vista durante el entrenamiento.
- Riesgo de alucinación: como todo modelo de 3B ajustado por SFT, puede generar acciones no válidas o inventar objetos y ubicaciones; el agente necesita un validador de acciones en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó sobre ALFWorld en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia: `llama3.2`, que impone restricciones de uso comercial y obligaciones de atribución (Built with Llama); revisar los términos de la Llama 3.2 Community License antes de cualquier despliegue comercial.
- Reproducibilidad: el autor documenta la provenance (repo `imagined-experience`, decisiones D-41, D-43, D-44), pero no se publican seeds por muestra ni scripts de evaluación en la información disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_SR_bs16_ILSR.5334.5334
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Paper de referencia (Early Experience): no disponible como enlace directo en la información proporcionada.
