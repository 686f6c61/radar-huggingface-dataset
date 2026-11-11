# Jongwondd/Llama-3.1-8B-Instruct-DPO-2ep-cfef4831

## Resumen

Llama-3.1-8B-Instruct-DPO-2ep-cfef4831 es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Lo publica el usuario Jongwondd en Hugging Face como resultado de una ejecución de entrenamiento orientada a "negation training", un área de investigación que estudia cómo los modelos procesan y responden a la negación en el lenguaje. No es un modelo autónomo ni un export fusionado: es un adaptador PEFT que requiere cargar el modelo base por separado.

El adaptador se entrenó durante dos épocas completas sobre el conjunto de entrenamiento de PopQA (14.951 pares de preferencia distribuidos en 4.534 casos), acumulando 29.902 ejemplos vistos y 1.889 pasos de optimizador. La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y sin validación de seguridad para producción. Resulta útil únicamente como artefacto reproducible para investigadores que trabajen en negación, DPO o análisis de preferencias sobre la familia Llama 3.1.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto del Llama-3.1-8B-Instruct original; el adaptador añade únicamente actualizaciones de pesos de bajo rango (LoRA rank 16, alpha 32). La licencia aplicable es la Llama 3.1, con las restricciones de uso que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA PEFT |
| Parametros totales | 8B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos de bajo rango (rank 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.1-8B-Instruct (revision `0e9e39f249a16976918f6564b8830bc894c89659`), un transformer decoder-only de 8B parámetros. El método de ajuste es DPO (Direct Preference Optimization) con inicialización desde el base sin adaptador previo ("fresh base"). La configuración LoRA emplea rank 16, alpha 32 y dropout 0. El entrenamiento se realizó sobre PopQA train, con 14.951 pares de preferencia en 4.534 casos, dos épocas completas, 29.902 ejemplos vistos y 1.889 pasos de optimizador. El SHA-256 original del adaptador es `cfef4831c273b6bb674989844596a3b644d5ad2009265b7b052823a902f15aa5`.

La model card indica que los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT. Los hashes de configuración original y publicada se registran en `training_provenance.json`, junto con el objetivo específico del método, los ajustes de entrenamiento retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento. El autor advierte explícitamente que los baselines SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Capacidades

- Generación de texto en inglés sobre la base de Llama-3.1-8B-Instruct.
- Ajuste orientado a negación ("negation training"), según la etiqueta y la descripción del autor.
- Herramientas de investigación en DPO y preferencias: el adaptador permite reproducir o comparar el efecto de dos épocas de DPO sobre el base.
- Carga mediante PEFT sobre el modelo base, con el tokenizador y la chat template del upstream.
- No se documentan capacidades adicionales específicas (tool calling, agentes, visión, audio, thinking mode) más allá de las que herede del base Llama-3.1-8B-Instruct.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Investigación sobre negación en LLM: el adaptador sirve para estudiar cómo dos épocas de DPO sobre PopQA modifican la respuesta del modelo a construcciones negativas, comparándolo con el base sin adaptador.
- Reproducibilidad de experimentos DPO: al publicarse con hashes de configuración, datos y pesos, permite replicar el pipeline de entrenamiento en un entorno controlado.
- Análisis de preferencias sobre Llama 3.1: útil para examinar el efecto del DPO en tareas de elección entre pares de respuestas, usando PopQA como dominio de referencia.
- Comparación de baselines: el autor menciona ejecuciones SFT/UL/DPO distintas; este checkpoint puede usarse como punto de comparación en estudios metodológicos.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador LoRA no fusionado con procedencia de entrenamiento documentada.
- Auditoría de artefactos PEFT: permite verificar la portabilidad de la configuración (localizador de base y revisión) sin alterar los pesos, útil para pipelines de validación de modelos.
- No se recomienda su uso en producción ni en aplicaciones de cara al usuario, dado que es un checkpoint de investigación sin evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir cifras del manuscrito; también advierte que las divisiones de evaluación observadas previamente son datos de desarrollo y no datos de test independientes.

## Requisitos de hardware

- El adaptador LoRA es pequeño, pero la inferencia requiere cargar el modelo base Llama-3.1-8B-Instruct completo.
- VRAM estimada: aproximadamente 16 GB en bf16 para el base de 8B; alrededor de 5-6 GB con cuantización de 4 bits (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para bf16; RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden alojar el base en bf16; GPUs consumer de 8-12 GB requieren cuantización del base.
- Despliegue: la carga documentada usa Transformers + PEFT con `device_map="auto"`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador; requerirían fusionar el adaptador con el base o usar soporte específico de adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/Llama-3.1-8B-Instruct-DPO-2ep-cfef4831 | 8B (base) + LoRA rank 16 | no disponible | DPO, 2 epocas, PopQA | llama3.1 | Adaptador PEFT en HF, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | no disponible en esta ficha | SFT + RLHF (upstream) | llama3.1 | Modelo base oficial en HF |
| Adaptadores DPO comunitarios sobre Llama 3.1 8B | 8B (base) + LoRA | depende del base | DPO | llama3.1 | Variables; no se dispone de datos concretos |

La comparación con alternativas concretas no está disponible en la información proporcionada; los adaptadores DPO comunitarios sobre Llama 3.1 8B varían en dataset, hiperparámetros y evaluación, por lo que no se ofrecen cifras comparativas.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye resultados de evaluación ni comparaciones con el base; no se puede afirmar que mejore al Llama-3.1-8B-Instruct en ninguna tarea.
- Las divisiones de evaluación usadas previamente son datos de desarrollo, no test independiente; cualquier métrica reportada en otro lugar no debe interpretarse como generalización.
- Solo se declara inglés; no hay evidencia de comportamiento multilingüe.
- Riesgo de alucinación y sesgos heredados del base Llama 3.1, sin mitigaciones adicionales documentadas.
- Licencia llama3.1: se aplican las restricciones de uso del upstream (incluida la política de uso aceptable de Meta); el adaptador no implica afiliación ni respaldo del proveedor del base.
- El adaptador no está fusionado: requiere acceso al modelo base y versiones compatibles de Transformers y PEFT; la paridad de descarga e inferencia en el Hub público no está garantizada por el autor.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongwondd/Llama-3.1-8B-Instruct-DPO-2ep-cfef4831
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Dataset PopQA: https://arxiv.org/abs/2212.10511
- No se han encontrado en la información proporcionada papers, blogs, repos o demos adicionales específicos de este adaptador.
