# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step340` es un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del repositorio sugiere que el adaptador se ha optimizado para tareas de conversación financiera (ConvFinQA), concretamente para responder preguntas de opción múltiple (MCQ) con un balanceo de clases (balanced9) y un criterio de precisión (pc_accuracy). El autor, `sbcho0325`, es un usuario de Hugging Face, no un equipo oficial de LG, y el adaptador se publica sin una model card completa, lo que limita la información verificable.

Este adaptador resulta relevante para quienes trabajan en dominios financieros y desean aprovechar las capacidades del modelo EXAONE 3.5 de 7.8B parámetros sin necesidad de entrenar un modelo completo. Al ser un adaptador LoRA, su tamaño es reducido (0.3 GB) y puede combinarse con el modelo base para obtener un sistema especializado en QA conversacional financiero. No obstante, la ausencia de documentación detallada y de resultados de evaluación dificulta una valoración objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct (Transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB; el modelo base tiene 7.8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base, segun el paper de EXAONE 3.5) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 soporta coreano e ingles, pero no se confirma para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo EXAONE-3.5-7.8B-Instruct, un transformer decoder-only con 7.8B parámetros, entrenado por LG AI Research con un enfoque en instrucciones del mundo real y soporte de contexto largo de hasta 32K tokens. El adaptador en sí emplea la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango entrenables, lo que reduce drásticamente el coste de fine-tuning. El entrenamiento se realizó mediante SFT (supervised fine-tuning), probablemente sobre un subconjunto del dataset ConvFinQA, que consiste en preguntas y respuestas conversacionales sobre informes financieros. Los detalles exactos del dataset, el número de pasos (340) y los hiperparámetros no se han publicado en la model card.

## Capacidades

- Especializacion en QA conversacional financiero: el nombre del modelo indica un entrenamiento especifico para preguntas de opcion multiple sobre datos financieros (ConvFinQA).
- Comprension de tablas y razonamiento numerico: heredado del modelo base EXAONE 3.5, que demuestra competencia en tareas que requieren extraer informacion de tablas y realizar calculos simples.
- Generacion de texto en formato conversacional: al ser un adaptador sobre un modelo instruct, mantiene la capacidad de mantener dialogos multi-turno.
- Soporte de contexto largo: hasta 32K tokens, util para procesar documentos financieros extensos.
- No se ha confirmado soporte de tool calling, function calling, agentes ni modo thinking en este adaptador concreto.

## Casos de uso

- Analisis de informes financieros conversacional: un usuario puede hacer preguntas como "¿Cual fue el ingreso neto en el tercer trimestre?" y el modelo extrae la respuesta de tablas o texto del informe, gracias a su entrenamiento en ConvFinQA.
- Asistente para analistas de inversion: integrado en una aplicacion de escritorio o web, permite consultar datos de balances, cuentas de resultados y flujos de caja de forma interactiva.
- Generacion de resumenes financieros con preguntas de verificacion: el modelo puede responder preguntas de opcion multiple sobre un documento, lo que facilita la creacion de cuestionarios de evaluacion.
- Automatizacion de extraccion de metricas clave: dado un informe anual en formato texto o tabla, el modelo puede extraer valores especificos (EBITDA, margen bruto, etc.) mediante preguntas dirigidas.
- Chatbot de educacion financiera: adaptado para responder preguntas de estudiantes sobre conceptos contables o financieros, usando ejemplos de ConvFinQA.
- Validacion de datos en procesos de auditoria: el modelo puede contrastar valores extraidos de diferentes fuentes mediante preguntas cruzadas, ayudando a detectar inconsistencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion en la model card, y no se encontraron referencias externas a este adaptador especifico. Se recomienda al usuario realizar sus propias pruebas en el dominio financiero antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7.8B en precision FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB. El adaptador LoRA anade un overhead minimo (menos de 1 GB).
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Con cuantizacion 4-bit, tarjetas como RTX 3080 (10 GB) o RTX 3060 (12 GB) pueden ser viables.
- Compatibilidad con GPU de consumo: si, siempre que se use cuantizacion (por ejemplo, 4-bit con bitsandbytes) y se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: el adaptador se carga junto al modelo base mediante la libreria PEFT (peft). Se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Para prototipos rapidos, tambien es compatible con el pipeline de Transformers.
- Latencia y throughput: no disponibles para este adaptador concreto. Como referencia, el modelo base de 7.8B en una A100 genera aproximadamente 20-40 tokens/s en FP16, dependiendo del batch.

## Comparativa con modelos similares

El adaptador se puede comparar con otros fine-tunings de EXAONE 3.5 para tareas financieras, aunque no hay datos publicos de rendimiento. La siguiente tabla compara el modelo base con alternativas generalistas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia propia de LG (uso no comercial restringido) | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128K | Licencia Llama 3.1 (uso comercial permitido) | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7.3B | 32K | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Apache 2.0 (excepto Qwen) | Hugging Face |

El adaptador en si no tiene licencia declarada, pero al derivar de EXAONE 3.5, su uso esta sujeto a la licencia del modelo base, que restringe el uso comercial sin autorizacion de LG. No se dispone de comparativas de rendimiento entre este adaptador y otros similares.

## Limitaciones y advertencias

- Falta de documentacion: la model card esta vacia, sin detalles sobre datos de entrenamiento, hiperparametros, evaluacion o limitaciones. Esto impide conocer su comportamiento real.
- Sesgos potenciales: al entrenarse sobre ConvFinQA, el modelo puede estar sesgado hacia el estilo y formato de ese dataset, y puede no generalizar bien a otros tipos de documentos financieros.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventar cifras si no encuentra la informacion en el contexto. Es imprescindible verificar las salidas en aplicaciones criticas.
- Licencia del modelo base: EXAONE 3.5 tiene una licencia que restringe el uso comercial sin permiso de LG AI Research. El adaptador hereda estas restricciones, aunque su licencia propia no este declarada.
- Idioma: no se ha confirmado que el adaptador funcione bien en espanol; el modelo base esta optimizado para coreano e ingles. Es probable que el rendimiento en espanol sea inferior.
- Sin garantia de soporte: al ser un modelo publicado por un usuario individual, no hay canal de soporte ni actualizaciones garantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step340
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper tecnico de EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
