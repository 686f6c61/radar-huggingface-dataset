# review-artifacts-27/Llama-3.2-1B-Recurrent-Loopy-W4A4-G32

## Resumen

Llama-3.2-1B-Recurrent-Loopy-W4A4-G32 es un checkpoint de investigación publicado por el usuario `review-artifacts-27` sobre el modelo base `irafm-llm/Recurrent-Llama-3.2-1B`, una variante recurrente del Llama 3.2 de 1B parámetros de Meta. El artefacto no es un modelo nuevo entrenado desde cero, sino el resultado de un proceso de búsqueda y selección de cuantización de pesos y activaciones (W4A4) aplicado a un transformer recurrente con profundidad de recurrencia T=16. Se enmarca en la línea de trabajo Loopy, orientada a estudiar cómo afecta la cuantización agresiva a arquitecturas recurrentes de pesos compartidos.

El checkpoint seleccionado (`s1024_p08_b64`) proviene de un pool de 400 candidatos y combina rotaciones Hadamard con bloques de 64, escalado con potencia 0,8, grupos de pesos de tamaño 32 y cuantización dinámica por token de activaciones a 4 bits. Los pesos W4 se almacenan como códigos enteros en contenedores INT8 junto con escalas, puntos cero y signos de Hadamard; la evaluación se realiza con cuantización falsa en BF16, sin kernel INT4 empaquetado.

Su relevancia es fundamentalmente metodológica: documenta de forma reproducible un protocolo de búsqueda de cuantización sobre un modelo recurrente y publica métricas de referencia honestas, que revelan un deterioro severo del rendimiento respecto al modelo en precisión completa. No está pensado para uso en producción, sino como artefacto de revisión y reproducción experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (Loopy) sobre Llama 3.2 1B, profundidad de recurrencia T=16 |
| Parametros totales | 1B (heredados del modelo base Llama 3.2 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 con ventana de documento) |
| Tipos de cuantizacion | W4A4 (pesos 4 bits, activaciones 4 bits dinámicas por token); W4A8 disponible como selección separada |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License and Acceptable Use Policy) |
| Formato de pesos | `selected.pt` (state dict PyTorch con códigos W4 en contenedores INT8, escalas, puntos cero y signos de Hadamard); requiere loader Loopy personalizado |

## Arquitectura y entrenamiento

El modelo base es un Llama 3.2 1B modificado para operar de forma recurrente: la misma pila de capas se aplica T=16 veces, compartiendo pesos entre iteraciones. Sobre esta arquitectura, el artefacto aplica un pipeline de cuantización post-entrenamiento con rotaciones Hadamard (bloque 64), escalado con potencia 0,8 y grupos de pesos de tamaño 32, seleccionando el mejor candidato de un pool de 400 configuraciones mediante un protocolo fijo documentado en `code/docs/protocol.md`.

La calibración, la búsqueda y la evaluación de calidad usan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revisión `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`). No se documenta en la información disponible un entrenamiento adicional del modelo base ni fases de RLHF o DPO específicas para este checkpoint; el trabajo se limita a la selección de cuantización sobre el modelo recurrente ya existente. La evaluación emplea cuantización falsa en BF16 y no utiliza almacenamiento INT4 empaquetado ni kernel de inferencia INT4.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Llama 3.2 1B.
- Razonamiento de contexto largo limitado a 4096 tokens en la configuración evaluada.
- Capacidad recurrente: la profundidad T=16 permite reutilizar cómputo sin aumentar el número de parámetros.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso específico en la información disponible.
- No se documenta capacidad de visión, audio ni modo thinking en la información disponible.
- Multilingüismo limitado: la model card declara únicamente inglés (`en`).

## Casos de uso

- Reproducción de experimentos de cuantización: el repositorio incluye `manifest.json`, `provenance.json`, `artifacts/` y `reference_results/`, lo que permite replicar la búsqueda y verificar los resultados con los scripts `eval_wikitext.py` y `eval_tasks.py`.
- Investigación sobre transformers recurrentes: sirve para estudiar cómo se degrada la perplejidad de un modelo con pesos compartidos y T=16 bajo cuantización W4A4 frente a precisión completa.
- Estudio de rotaciones Hadamard y escalado en cuantización: los parámetros de rotación (seed 1024, bloque 64, potencia 0,8) quedan registrados y son auditables.
- Evaluación comparativa de métodos de cuantización: al publicar métricas de referencia BF16 y W4A8, permite aislar el efecto de la precisión de activaciones.
- Docencia y formación: ejemplo completo de protocolo de evaluación con ventanas fijas, calibración separada y métricas por tarea.
- Auditoría de artefactos de revisión: útil para equipos que necesiten verificar la integridad de un checkpoint publicado (SHA-256 en `manifest.json`).

## Benchmarks y rendimiento

Resultados guardados del checkpoint seleccionado (W4A4, T=16):

| Metrica | Valor |
|---|---:|
| WT2 word PPL | 1088,17 |
| LAMBADA PPL | 65194,14 |
| LAMBADA acc. | 0,64 |
| WinoGrande | 52,17 |
| ARC-C (acc_norm) | 22,70 |
| HellaSwag (acc_norm) | 27,68 |
| MMLU | 23,07 |
| Media de precisión (5 tareas) | 25,25 |

WT2 usa perplejidad a nivel de palabra con ventana de documento de 4096 tokens. Las métricas de precisión están en porcentaje; ARC-C y HellaSwag usan `acc_norm`, el resto `acc`. La media pondera igual las cinco tareas de precisión. Las métricas en precisión completa están en `reference_results/`.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,1 GB; los códigos W4 se almacenan en contenedores INT8, por lo que el consumo efectivo de memoria es superior al de un empaquetado INT4 equivalente. No se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; al tratarse de un modelo de 1B, cabe en GPUs de consumo, pero la evaluación requiere un entorno CUDA con el loader Loopy.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, aunque no se documenta una configuración mínima validada.
- Opciones de despliegue: no es compatible con `transformers.from_pretrained()` genérico; requiere el loader Loopy incluido en `code/` y el entorno conda `environment.yml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Recurrent-Loopy-W4A4-G32 | 1B | 4096 | llama3.2 | `selected.pt` (loader custom) | Checkpoint de investigación con cuantización W4A4 y métricas degradadas |
| Llama 3.2 1B (Meta) | 1B | 128k | llama3.2 | safetensors | Modelo denso estándar, sin recurrencia ni cuantización agresiva |
| irafm-llm/Recurrent-Llama-3.2-1B | 1B | no disponible | llama3.2 | no disponible | Modelo base recurrente sin cuantizar del que deriva este artefacto |

No se dispone de datos de benchmarks del modelo base recurrente ni de Llama 3.2 1B en la información proporcionada para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Rendimiento severamente degradado: la perplejidad LAMBADA de 65194,14 y la media de precisión de 25,25 indican que el checkpoint no es utilizable para tareas reales.
- No es un modelo listo para producción: es un artefacto de revisión con fines de reproducción experimental.
- Requiere loader personalizado: un `from_pretrained()` estándar de Transformers no carga este repositorio correctamente.
- No usa almacenamiento INT4 empaquetado ni kernel INT4: la inferencia se realiza con cuantización falsa en BF16, lo que limita las ganancias de eficiencia.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible, pero esperable dado el bajo rendimiento en tareas de conocimiento (MMLU 23,07).
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Llama 3.2.
- Restricciones de licencia: los pesos están sujetos a la Llama 3.2 Community License y la Acceptable Use Policy; el código de investigación tiene avisos adicionales en `code/THIRD_PARTY_NOTICES.md`.
- Contexto efectivo limitado a 4096 tokens en la configuración evaluada, muy por debajo del contexto nativo de Llama 3.2 1B.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Llama-3.2-1B-Recurrent-Loopy-W4A4-G32
- Modelo base: https://huggingface.co/irafm-llm/Recurrent-Llama-3.2-1B
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo completo: `code/docs/protocol.md` (incluido en el repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (incluido en el repositorio)
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
