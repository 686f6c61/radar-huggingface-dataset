# mahesha-vt/qwen25-3b-instruct-random15k

# mahesha-vt/qwen25-3b-instruct-random15k

## Resumen

`mahesha-vt/qwen25-3b-instruct-random15k` es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-3B-Instruct, publicado por el usuario mahesha-vt en Hugging Face. Se trata de un transformer decoder-only denso de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), la misma arquitectura y tamaño que su modelo base, entrenado con LLaMA-Factory sobre un dataset denominado `random15k` del que no se ofrece ninguna descripción, composición ni procedencia.

El repositorio contiene únicamente pesos en formato safetensors (6,2 GB) y su model card es la plantilla autogenerada por el Trainer, sin sección de usos previstos, sin datos de evaluación y sin resultados de benchmarks (el `model-index` declara la entrada `random15k` con la lista de resultados vacía). Tampoco se declaran idiomas soportados ni un texto de licencia más allá de la etiqueta `other`.

Su relevancia práctica es limitada: cero descargas y cero "likes" en el momento de la consulta, y ausencia total de documentación sobre el proceso de ajuste. Puede servir como ejemplo de pipeline de fine-tuning completo con LLaMA-Factory sobre una base Qwen2.5 y como punto de partida para experimentación, pero no hay evidencia publicada que respalde su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, tag `qwen2`) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen2.5-3B-Instruct declara 32 768 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors, sin GGUF ni variantes cuantizadas |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | `other` (sin texto de licencia especificado en la información disponible); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Dataset de ajuste | `random15k` (contenido no documentado) |
| Autor | mahesha-vt |
| Fecha de creacion | 2026-10-17 |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atención causal estándar, 3,09 B de parámetros y sin mezcla de expertos. El ajuste se realizó con LLaMA-Factory en modalidad "full" (actualización de todos los pesos, no LoRA ni adaptadores), según la etiqueta `full` del repositorio. No se documenta ninguna modificación estructural sobre el modelo original.

Los hiperparámetros declarados son: learning rate 5e-6, scheduler coseno, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, batch size de entrenamiento 1 con 8 pasos de acumulación (batch efectivo 8), batch de evaluación 8, semilla 42, 2 épocas y entrenamiento multi-GPU. El stack utilizado fue Transformers 5.8.0, PyTorch 2.8.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. No se indica el número de tokens de entrenamiento, la composición del dataset `random15k`, si hubo etapas de RLHF/DPO adicionales ni si se aplicó algún tipo de enmascarado o formateo conversacional específico. La model card no incluye curvas de pérdida ni resultados de evaluación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct; no verificada tras el ajuste fino.
- Razonamiento y resolución de problemas de complejidad media, acorde a un modelo denso de 3 B de parámetros.
- Generación de código y matemáticas básicas a intermedias, capacidad típica de la familia Qwen2.5-Instruct.
- Soporte de tool calling / function calling heredado del modelo base (Qwen2.5-Instruct incluye plantilla para funciones), sin evidencia de que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso limitado por el tamaño del modelo y por la ausencia de evaluaciones específicas.
- Capacidades multilingües no declaradas en la ficha; el modelo base Qwen2.5 declara soporte de múltiples idiomas.
- Plantilla de chat tipo ChatML y compatibilidad con `text-generation-inference` (etiqueta `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Prototipado de asistentes conversacionales: al ser un modelo de 3 B, puede desplegarse en una única GPU consumer para iterar sobre prompts y plantillas de chat antes de migrar a un modelo mayor; el ajuste no aporta garantías adicionales sobre el base.
- Generación de código asistida en local: útil para autocompletado y explicación de fragmentos en entornos sin conexión, con la ventaja de que 6,2 GB de pesos caben en GPUs de 8-12 GB; conviene validar la calidad porque no hay benchmarks publicados.
- Extracción de información estructurada: generación de JSON a partir de texto no estructurado (facturas, correos, fichas) usando la plantilla de chat; requiere validación de esquema en el postprocesado.
- Resumen de documentos de extensión moderada: aprovechando la ventana de contexto del modelo base (32 768 tokens), adecuado para actas, informes o hilos de correo.
- Generación de respuestas FAQ y atención al cliente de primer nivel: conversaciones multi-turno con contexto corto y medio, con revisión humana en los flujos críticos.
- Experimentación académica sobre fine-tuning: caso de uso directo como referencia de un pipeline completo con LLaMA-Factory (full fine-tuning, LR bajo, 2 épocas) para comparar con LoRA o QLoRA sobre la misma base.
- Evaluación comparativa de checkpoints comunitarios: útil para medir deriva (regresión) respecto al modelo base en tareas estándar antes de adoptar cualquier ajuste de la comunidad.
- Despliegue en entornos con recursos limitados: inferencia en una RTX 3060 12 GB o similar para demos internas y pruebas de integración con TGI o vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara una única entrada, `random15k`, con la lista de resultados vacía, y la sección "Training results" del README está en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación que permitan comparar este checkpoint con su modelo base.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,2 GB solo para los pesos; con activaciones y caché KV para contextos moderados, el mínimo práctico se sitúa en 8 GB y el recomendable en 12 GB.
- VRAM estimada con cuantización: aproximadamente 3,5 GB en 8 bits y 2,2 GB en 4 bits (estimación a partir del número de parámetros; no hay artefactos cuantizados publicados en el repositorio).
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en bf16; en 4 bits cabría en GPUs de 6-8 GB.
- GPU de datacenter recomendadas: NVIDIA L4, A10G, A100 40/80 GB o H100 para servir con batching y contextos largos.
- Opciones de despliegue: `transformers` (librería declarada), TGI (etiqueta `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponible; no se han publicado mediciones. Como orientación no verificada, un modelo denso de 3 B en bf16 sobre una RTX 4090 suele superar las decenas de tokens por segundo en generación individual, pero este dato no está confirmado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mahesha-vt/qwen25-3b-instruct-random15k | 3,09 B | No disponible (base: 32 768) | `other` | Comunidad, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens | Apache-2.0 | Oficial, ampliamente utilizado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | Oficial |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | MIT | Oficial |

Los datos de los modelos comparativos proceden de su documentación pública y no se han verificado en esta ficha. Al no existir benchmarks publicados para el checkpoint ajustado, no es posible establecer una comparación de rendimiento; la única diferencia objetiva documentada es la licencia (`other` frente a Apache-2.0 del base) y la ausencia de mantenimiento y trazas de uso.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, curvas de pérdida ni métricas de validación que indiquen si el ajuste mejora, mantiene o degrada las capacidades del modelo base.
- Dataset sin documentar: se desconoce la composición, el origen y la calidad de `random15k`, lo que impide evaluar sesgos introducidos, contaminación de datos o riesgo de sobreajuste.
- Riesgo de alucinación: inherente a los modelos de 3 B; el ajuste sin evaluación puede incrementarlo si el dataset contiene ruido.
- Sesgos conocidos: no documentados por el autor; deben asumirse los del modelo base Qwen2.5 y los del corpus de ajuste, no auditado.
- Licencia ambigua: la etiqueta `other` sin texto asociado impide determinar si se permite uso comercial; el modelo base es Apache-2.0, pero el checkpoint derivado no hereda necesariamente esa permisividad en la ficha publicada.
- Idiomas no declarados: no se especifica qué idiomas conserva el ajuste; el comportamiento multilingüe del base puede haberse degradado.
- Contexto no verificado: aunque el base soporta 32 768 tokens, no hay confirmación de que el ajuste mantenga ese comportamiento.
- Sin mantenimiento: repositorio sin descargas ni interacción, creado y actualizado el mismo día, sin issues ni versiones posteriores.
- No recomendable en producción sin una evaluación propia previa frente al modelo base en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahesha-vt/qwen25-3b-instruct-random15k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
