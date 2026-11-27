# hoangphu7122002ai/law-rag-qwen3.5-4b-dpo

## Resumen

law-rag-qwen3.5-4b-dpo es un ajuste fino del modelo base Qwen/Qwen3.5-4B desarrollado por el usuario hoangphu7122002ai para un sistema de respuesta a preguntas sobre legislación vietnamita con recuperación aumentada (RAG). El modelo forma parte del proyecto law-rag, construido para el curso *Large Language Models* de la HCMUT, y se entrena mediante SFT con LoRA seguido de dos rondas de DPO on-policy. Su función es responder preguntas legales en vietnamita a partir de un contexto documental recuperado previamente por un pipeline denso más reranker.

El modelo tiene 4.539.265.536 parámetros reales según los pesos en safetensors (el autor lo etiqueta como 4,66B), con arquitectura Qwen3.5 y soporte multimodal de entrada image-text-to-text. Se distribuye en safetensors y bf16, con un tamaño de repositorio de 9,1 GB. Su relevancia es doble: por un lado, demuestra la receta completa de SFT más DPO aplicada a un dominio jurídico concreto; por otro, sirve como punto de análisis de escalado dentro del proyecto, comparando los resultados con las variantes de 2B y 9B bajo el mismo pipeline de recuperación y los mismos hiperparámetros.

Es importante señalar que este modelo es **solo de análisis**: el curso exige un modelo respondedor por debajo de 4B parámetros, por lo que el sistema presentado oficialmente es la variante de 2B. Esta ficha describe la variante de 4B, que no fue la entregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5, multimodal image-text-to-text (según tags) |
| Parametros totales | 4.539.265.536 (4,66B según el autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el despliegue con vLLM: `--max-model-len 32768`); longitud nativa del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors (bf16, LoRA fusionada en los pesos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5, y se ajusta con LoRA (r=32) mediante SFT sobre las filas v3b del dataset hoangphu7122002ai/law-rag-data: 1.688 ejemplos de entrenamiento y 188 de validación, decontaminados contra el conjunto de test. La configuración de SFT es learning rate 1e-4, 3 épocas, batch 1 × 16 y longitud máxima de 12.288 tokens.

Sobre ese punto de partida se aplican dos rondas de DPO on-policy. En la primera, para cada prompt de entrenamiento se generan 8 respuestas propias (1 greedy y 7 con temperatura 0,7), se seleccionan la mejor y la peor por ROUGE-L con margen mínimo de 0,1, produciendo 1.219 pares; se entrena con beta 0,1, learning rate 2e-5, 1 época y LoRA r=32. La segunda ronda repite el proceso desde el modelo de la ronda 1 y genera 861 pares, con un tiempo de 63 minutos en una sola L40S. Los adaptadores se fusionan en los pesos finales en bf16. El repositorio incluye `train_report.json` con el registro de la ronda 2.

## Capacidades

- Generación de texto y respuesta a preguntas en vietnamita sobre contenido jurídico, condicionada al contexto recuperado por el pipeline RAG.
- Razonamiento extractivo y de selección de cláusulas: el modelo debe localizar el artículo o cláusula relevante y delimitar la extensión de la cita.
- Entrada multimodal image-text-to-text según los tags del repositorio (capacidad heredada del base Qwen3.5; no se documenta su uso en el proyecto).
- Generación con decodificación greedy y MBR-8 (Minimum Bayes Risk con 8 muestras), evaluadas ambas por el autor.
- Integración con vLLM para servicio compatible con endpoints, incluyendo prefix caching.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.
- Capacidad multilingüe limitada al vietnamita según la model card.

## Casos de uso

- Consulta jurídica asistida en vietnamita: el modelo recibe un contexto de 5 fragmentos legales recuperados (top 50 denso reordenado a top 5) más 2 ejemplos few-shot y genera una respuesta citando la cláusula aplicable; encaja por su especialización en selección de cláusula y extensión de cita.
- Evaluación de pipelines RAG jurídicos: sirve como punto intermedio en una curva de escalado 2B/4B/9B para medir cuánto del error residual depende del tamaño del modelo frente a la recuperación.
- Base para experimentos de DPO en dominio legal: la receta de dos rondas on-policy con selección de pares por ROUGE-L es replicable y el modelo sirve como referencia de partida para nuevos ajustes.
- Prototipado de asistentes de atención al ciudadano: con 32.768 tokens de contexto en vLLM y prefix caching, puede gestionar conversaciones con contexto documental largo en un servicio de bajo coste.
- Investigación académica sobre alineamiento en dominios de nicho: permite estudiar el efecto de DPO sobre SFT en un corpus pequeño (1.688 filas) y con idioma de bajos recursos.
- Servicio de inferencia económico: con 4,66B parámetros y bf16, se despliega en una sola GPU profesional (el entrenamiento se hizo en una L40S), adecuado para entornos con presupuesto limitado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de desarrollo (300 preguntas) y test (200 preguntas retenidas), con el mismo pipeline de recuperación y 2 ejemplos few-shot. Métrica: ROUGE-L.

| Modelo | Parámetros | Dev SFT → DPO r1 → DPO r2 (greedy) | Dev MBR-8 | Test greedy / MBR-8 |
|---|---|---|---|---|
| law-rag-qwen3.5-2b-dpo (sistema reportado) | 2,27B | .633 → .654 → .664 | .672 | .643 / .652 |
| law-rag-qwen3.5-4b-dpo (este modelo) | 4,66B | .636 → .669 → .679 | .686 | .666 / .672 |
| law-rag-qwen3.5-9b-dpo | 9,65B | .664 → .693 → .700 | .705 | .677 / .686 |

Conclusiones del autor: pasar de 2B a 9B (unas 4× parámetros) añade .034 de ROUGE-L en test; DPO aporta entre +.03 y +.04 en todos los tamaños; el error restante se debe principalmente a la elección de cláusula y a la extensión de la cita, no al tamaño del modelo.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 32.768 tokens el consumo crece de forma notable y se recomienda al menos 24 GB para servicio con contexto largo.
- GPU recomendadas: L40S (usada por el autor para el entrenamiento de la ronda 2 de DPO), A100 o H100 para mayor throughput; RTX 4090 (24 GB) es viable para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en GPUs de 24 GB o más; no se documentan cuantizaciones GGUF para GPUs de 12-16 GB.
- Opciones de despliegue: vLLM es la opción documentada (`vllm serve ... --dtype bfloat16 --max-model-len 32768 --enable-prefix-caching`); al ser un modelo transformers con safetensors, también es compatible con TGI y con llama.cpp/Ollama si se generan cuantizaciones, aunque el autor no las publica.
- Latencia y throughput: no disponibles; el único dato temporal es el entrenamiento de la ronda 2 de DPO (63 minutos en 1 × L40S).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test ROUGE-L (greedy / MBR-8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-2b-dpo | 2,27B | no disponible | .643 / .652 | other | Hugging Face |
| law-rag-qwen3.5-4b-dpo | 4,66B | 32.768 (despliegue) | .666 / .672 | other | Hugging Face |
| law-rag-qwen3.5-9b-dpo | 9,65B | no disponible | .677 / .686 | other | Hugging Face |

Los tres modelos comparten receta, datos y pipeline de recuperación, por lo que la comparación aísla el efecto del tamaño. No se dispone de comparación con modelos jurídicos vietnamitas de otros autores.

## Limitaciones y advertencias

- Entrenado para una única tarea de curso; las respuestas son referencias, no asesoramiento jurídico.
- Las puntuaciones dependen del pipeline de recuperación (top 50 denso → reranker top 5) y de los 2 ejemplos few-shot; fuera de esa configuración el rendimiento puede degradarse.
- El error residual se concentra en la elección de cláusula y en la extensión de la cita, lo que puede producir referencias legales imprecisas o incompletas.
- Riesgo de alucinación jurídica: el modelo puede citar artículos o textos inexistentes si el contexto recuperado es ambiguo o insuficiente.
- Solo vietnamita; no se documenta soporte de otros idiomas.
- Licencia "other" sin términos especificados: es necesario contactar con el autor antes de un uso comercial.
- No es el sistema presentado oficialmente en el curso (el requisito era <4B y este modelo tiene 4,66B); su finalidad es analítica.
- Sin cuantizaciones publicadas, lo que limita el despliegue en hardware de gama baja.
- Sin datos de sesgos, robustez adversarial ni evaluación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-4b-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sistema reportado (2B): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Variante 9B: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-9b-dpo
- Dataset: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual de uso: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
