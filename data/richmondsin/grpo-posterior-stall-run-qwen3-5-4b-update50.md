# richmondsin/grpo-posterior-stall-run-qwen3.5-4b-update50

## Resumen

`grpo-posterior-stall-run-qwen3.5-4b-update50` es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B publicado por el usuario richmondsin en Hugging Face. Se trata de un modelo "merged": el adaptador LoRA resultante de un entrenamiento con GRPO (Group Relative Policy Optimization) se ha fusionado directamente en los pesos del modelo base, de modo que el repositorio contiene un checkpoint autónomo listo para cargar con transformers. El pipeline declarado es image-text-to-text, lo que indica que conserva la capacidad de entrada de imagen y texto del modelo base.

La relevancia de esta ficha es limitada en términos prácticos: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá del reporte técnico de la fusión, sin licencia declarada y sin idiomas especificados. El nombre del repositorio ("posterior-stall-run") sugiere un experimento de aprendizaje por refuerzo con criterios de parada ("stall") sobre una señal de "posterior", pero el autor no documenta la tarea, el dataset ni los objetivos de entrenamiento.

Arquitectónicamente hereda todo del base Qwen3.5-4B (no disponible en detalle en la información proporcionada), con 4.659.865.088 parámetros totales según los safetensors y un tamaño de repositorio de 9,3 GB. No debe confundirse con un modelo listo para producción: es un artefacto de investigación cuya reproducibilidad depende del adaptador LoRA original, que no se incluye en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16; el repo no publica GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16), cargable con transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Tipo de ajuste | LoRA fusionado (r 16, alpha 32, escala 2.0) |
| Modulos fusionados | 200 |
| Metodo de entrenamiento | GRPO (RLVB), "stall run", update 50 |
| Tamano del repo | 9,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, que la información disponible no detalla; el tag `qwen3_5` y el pipeline `image-text-to-text` confirman que se trata de un transformer multimodal con entrada de imagen y texto. El autor no publica número de capas, dimensión oculta, cabezas de atención ni longitud de contexto.

El entrenamiento consiste en un ajuste con GRPO sobre el modelo base. La model card describe la configuración del run con jerga interna: "stall run (no belief score, phase 5 / phase_set 240 / set_keep 160, no length term, rho_exact 1, teacher_row 1, stall_cap 3.5, stall_play 1), update 50". Estos parámetros no están definidos en la información disponible, por lo que no es posible reconstruir la función de recompensa ni el dataset. El adaptador LoRA tiene rango 16 y alpha 32 (escala 2.0), y se fusionó con la regla `W <- W + (lora_alpha / r) * B @ A` calculada en fp32 y almacenada en bf16. Se fusionaron 200 módulos; el resto de tensores son idénticos byte a byte al base (538 tensores verificados), y los ficheros de configuración, tokenizer, chat template y generation config son los del base sin modificar. El autor advierte que la fusión en bf16 puede producir diferencias numéricas menores respecto a ejecutar base + adaptador en tiempo de inferencia.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), heredada del base.
- Razonamiento y generación de código: presumiblemente heredados del base, aunque no se documentan explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de inference endpoints de Hugging Face.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como checkpoint de referencia para estudiar el efecto del update 50 de un run GRPO concreto, comparándolo con el base y con otros updates del mismo run.
- Reproducción de experimentos de fusión LoRA: dado que el autor documenta la regla de fusión, el hash sha256 del adaptador y el recuento de tensores, puede usarse para validar pipelines de merge en bf16 frente a la ejecución base + adaptador.
- Evaluación de degradación por fusión: permite medir empíricamente cuánto se desvía un merge en bf16 respecto al adaptador en tiempo de inferencia, un problema práctico en el despliegue de modelos ajustados.
- Pruebas de pipelines multimodales con transformers: al conservar el processor y la chat template del base, puede integrarse en flujos de image-text-to-text para verificar compatibilidad de herramientas.
- Baseline en comparativas de ajustes: útil como punto de comparación frente a otros checkpoints del mismo run o frente al Qwen3.5-4B original en una evaluación interna.
- Docencia y divulgación: ejemplo real de artefacto de investigación con trazabilidad de fusión (MERGE-REPORT.json, hashes, recuento de tensores) para explicar buenas prácticas de publicación de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 16 GB para contexto corto y 24 GB o más para contextos largos.
- En cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque el repo no publica variantes GGUF y habría que generarlas con herramientas externas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI como alternativas habituales para safetensors; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-posterior-stall-run-qwen3.5-4b-update50 | 4,66 B | No disponible | Imagen-texto | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | No disponible | Imagen-texto | No disponible | Hugging Face (modelo base) |
| Alternativas de ~4 B de otros laboratorios | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible no permite establecer comparaciones cuantitativas con modelos de la misma categoría: no hay benchmarks publicados ni datos de rendimiento del base en la documentación consultada.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documenta la tarea objetivo, el dataset, la función de recompensa ni los resultados esperados del ajuste.
- Licencia no declarada: no hay garantía de uso comercial; debe verificarse la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real del checkpoint fusionado.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación publicada no puede acotarse.
- Sesgos: no documentados; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos introducidos por el ajuste.
- La fusión en bf16 introduce desviaciones numéricas respecto a base + adaptador; el autor lo advierte explícitamente.
- El adaptador LoRA original no se incluye en el repositorio, lo que limita la reproducibilidad exacta del run.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- No hay variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en entornos de bajos recursos.
- El nombre y la configuración del run ("stall run", "rho_exact", "stall_cap") usan terminología interna no definida, lo que impide auditar el proceso de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-stall-run-qwen3.5-4b-update50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
