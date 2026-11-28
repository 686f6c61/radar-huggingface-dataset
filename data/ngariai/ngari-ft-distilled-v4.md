# NGARiAI/ngari-ft-distilled-v4

## Resumen

NGARi ngari-ft-distilled-v4 es un ajuste fino por destilación del modelo Qwen2.5-1.5B-Instruct, publicado por NGARiAI como parte de su programa "Open Source Friday" (Edición 001, 27 de noviembre de 2026). Se distribuye exclusivamente como un archivo GGUF cuantizado en Q4_K_M (0,99 GB), lo que lo sitúa en el segmento de modelos para edge computing y despliegue local con Ollama. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), con licencia Apache-2.0.

La relevancia de esta ficha es limitada y el propio autor lo advierte: no existe ningún registro de evaluación para este checkpoint. La model card declara explícitamente que no se toman prestados los números de otras versiones de la línea (v3, v5) y que la calidad del modelo es desconocida. Se publica porque se usa como fallback en el espacio de trabajo del autor, no porque haya evidencia de rendimiento.

El contexto de la familia Qwen2.5-1.5B-Instruct (sobre la que se construye) incluye una ventana de 32.768 tokens y soporte multilingüe amplio, pero esta información corresponde al modelo base y no ha sido verificada para el checkpoint ajustado. El modelo se etiqueta únicamente como inglés en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | Inglés (según etiqueta del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`ngari-ft-distilled-v4-q4_K_M.gguf`, 0,99 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 1,5 mil millones de parámetros, con atención de múltiples cabezas y las innovaciones propias de la familia Qwen2.5 (RoPE, normalización RMSNorm, entre otras). El modelo se ha sometido a un cuarto pase de destilación ("fourth distillation pass") según la model card, aunque no se especifica la naturaleza exacta del ajuste (adaptador LoRA o fine-tune completo), el número de tokens de entrenamiento ni la composición del dataset.

La model card indica que los datos de entrenamiento se publican en `NGARiAI/ngari-datasets` y que la receta está disponible en el subdirectorio `training/` del mismo repositorio. No se documenta si hubo RLHF, DPO u otra fase de alineación posterior a la destilación. No se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la cuantización Q4_K_M para despliegue en edge.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base Qwen2.5-1.5B-Instruct.
- Capacidad de código y matemáticas: no verificada para este checkpoint; el modelo base las soporta, pero no hay evaluación que confirme su preservación tras la destilación.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: el repositorio se etiqueta únicamente como inglés; el modelo base es multilingüe, pero no se confirma para este ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible` según tags) y con Ollama.

## Casos de uso

- Despliegue local en edge con Ollama: el archivo GGUF Q4_K_M de 0,99 GB cabe en dispositivos con poca memoria y permite inferencia en CPU o GPU de gama baja, útil para prototipos o entornos sin conectividad.
- Fallback en pipelines de producción: el autor lo mantiene como respaldo en su espacio de trabajo, por lo que puede usarse como modelo secundario cuando el modelo principal no esté disponible, siempre asumiendo calidad no medida.
- Chatbot conversacional ligero: para asistentes de dominio acotado en inglés donde el coste de cómputo sea prioritario y se acepte una calidad incierta.
- Pruebas de integración de extremo a extremo: útil para validar pipelines de despliegue GGUF/Ollama antes de sustituir por un checkpoint con evaluación.
- Experimentación con destilación: al publicarse datos y receta en `NGARiAI/ngari-datasets`, sirve como referencia para reproducir o auditar el proceso de destilación.
- Generación de texto de bajo coste en dispositivos con menos de 2 GB de RAM/VRAM disponibles para el modelo.
- No recomendado para tareas que requieran garantías de calidad, razonamiento complejo o tool calling, al no existir evidencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente: "There is no eval record for this checkpoint" y "Not measured. Do not treat its presence here as a recommendation."

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con la cuantización Q4_K_M (el archivo pesa 0,99 GB; el overhead de contexto añade algo más).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: Ollama (etiqueta explícita), llama.cpp, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos; se requeriría convertir a safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato publicado | Licencia | Evaluación |
|---|---|---|---|---|---|
| NGARi ngari-ft-distilled-v4 | 1,54 B | No disponible | GGUF Q4_K_M | Apache-2.0 | No medida |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens | Safetensors, GGUF | Apache-2.0 | Publicada por Qwen |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Safetensors, GGUF | Llama 3.2 Community License | Publicada por Meta |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Safetensors, GGUF | Apache-2.0 | Publicada por Hugging Face |

La comparación con el modelo base es la más directa: mismo tamaño y licencia, pero el base cuenta con evaluación publicada y contexto documentado, mientras que este checkpoint no. Para alternativas de tamaño similar con evidencia de rendimiento, Llama 3.2 1B y SmolLM2-1.7B son opciones más seguras, aunque con licencias distintas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni MMLU, ni HumanEval, ni GSM8K. La calidad es desconocida.
- El autor advierte explícitamente que no debe tratarse su presencia en Hugging Face como una recomendación.
- Riesgo de alucinación: no cuantificado; en modelos de 1,5 B es habitualmente elevado, pero no hay datos para este checkpoint.
- Sesgos conocidos: no documentados. Los sesgos del modelo base Qwen2.5-1.5B-Instruct no se han evaluado tras la destilación.
- Limitación de idioma: etiquetado solo en inglés; el multilingüismo del base no está confirmado.
- Contexto: no documentado para este checkpoint; no asumir los 32.768 tokens del base sin verificación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la ausencia de evaluación traslada todo el riesgo de calidad al integrador.
- Solo se publica cuantización Q4_K_M; no hay safetensors ni otras cuantizaciones, lo que limita el ajuste fino posterior sin reconvertir.
- Sin soporte documentado de tool calling ni agentes; no apto para pipelines que dependan de function calling sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Colección Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
