# CSroseX/Llama-3-Legal-8B

## Resumen

Llama-3-Legal-8B es un ajuste fino (fine-tune) del modelo Meta Llama 3 de 8.000 millones de parametros, desarrollado por el usuario CSroseX y publicado en Hugging Face. Su proposito es muy concreto: dado un tipo de clausula contractual (de las 41 definidas en el dataset CUAD) y un fragmento de contrato, el modelo devuelve las frases exactas del contrato que tratan esa clausula, o la cadena `Not found.` si no existe. No es un asistente legal conversacional ni emite juicios sobre la calidad de una clausula: actua como un resaltador automatico de texto contractual.

El modelo se entrena sobre el dataset CUAD (Contract Understanding Atticus Dataset) y esta pensado para abogados, paralegales y desarrolladores de legal-tech que necesitan localizar clausulas en contratos largos con rapidez. La version actual (actualizada en noviembre de 2026) reporta una mejora sustancial frente a la version anterior: solapamiento de palabras con la clausula correcta de 0,735 (frente a 0,185), 99,6% de respuestas que son texto literal del contrato (frente a 12,3%) y 95,8% de aciertos al responder `Not found.` cuando la clausula esta ausente (frente a 0%).

La arquitectura es la de Llama 3 8B (transformer decoder-only) con ajuste fino supervisado, y se distribuye tanto en safetensors como en GGUF (Q8_0 y Q4_K_M). Su licencia es la Llama 3 Community License, con las restricciones que ello implica para uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con paginas de ~500 tokens; el contexto nativo de Llama 3 8B es 8.192 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M; carga en 4-bit via BitsAndBytes (~6 GB de VRAM) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/llama-3-8b`, una version optimizada para entrenamiento eficiente del Meta Llama 3 8B. La arquitectura subyacente es un transformer decoder-only con atencion causal, propio de la familia Llama 3. El ajuste fino se realizo sobre el dataset `theatticusproject/cuad-qa`, que contiene pares pregunta-respuesta extraidos de contratos comerciales etiquetados con 41 tipos de clausula.

El entrenamiento se orienta a una tarea de extraccion extractiva: el modelo aprende a copiar literalmente fragmentos del contrato en lugar de parafrasearlos. La model card indica que se entreno con paginas de aproximadamente 500 tokens, lo que condiciona el uso: para contratos completos hay que trocear el texto en ventanas solapadas (por ejemplo, ventana de 512 tokens con 64 de solapamiento) y fusionar las respuestas. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona el uso de Unsloth para el ajuste fino, lo que sugiere eficiencia en memoria durante el entrenamiento.

## Capacidades

- Extraccion extractiva de clausulas: devuelve las frases literales del contrato relacionadas con un tipo de clausula solicitado.
- Cobertura de 41 tipos de clausula del dataset CUAD (Governing Law, Non-Compete, Exclusivity, Anti-Assignment, Cap On Liability, Liquidated Damages, etc.).
- Deteccion de ausencia: responde `Not found.` cuando la clausula no esta presente en el fragmento (95,8% de acierto segun la model card).
- Procesamiento por paginas: disenado para fragmentos de ~500 tokens, con estrategia de ventana deslizante para contratos completos.
- Formato de prompt especifico: pregunta, linea con `---`, y texto del contrato; el template esta almacenado en el tokenizer y se aplica con `apply_chat_template`.
- Generacion de texto en ingles (unico idioma soportado).
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No esta disenado para razonamiento multi-paso ni para agentes.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Revision inicial de contratos comerciales: un abogado carga un contrato en PDF, lo convierte a texto, lo trocea en paginas de ~500 tokens y consulta cada tipo de clausula relevante (por ejemplo, "Governing Law", "Cap On Liability") para obtener las frases exactas que debe revisar, reduciendo el tiempo de lectura manual.
- Construccion de un indice de clausulas: un equipo de legal-tech procesa un lote de contratos y genera, para cada uno, un mapa de que clausulas CUAD aparecen y en que fragmento, facilitando busquedas posteriores.
- Deteccion de clausulas ausentes: en procesos de due diligence, el modelo senala rapidamente que contratos carecen de clausulas esperadas (por ejemplo, "Insurance" o "Audit Rights"), lo que permite priorizar la revision humana.
- Extraccion para sistemas de gestion contractual (CLM): integrado en un pipeline, el modelo alimenta una base de datos con las clausulas localizadas y su texto, que luego se indexa y se muestra en una interfaz de revision.
- Preprocesamiento para revision por abogados: el modelo actua como primera pasada que resalta fragmentos candidatos; el abogado valida y decide, sin que el modelo emita juicios legales.
- Analisis de contratos en entornos con recursos limitados: al poder cargarse en 4-bit (~6 GB de VRAM) o en GGUF Q4_K_M, puede desplegarse en una GPU consumer o en local, lo que facilita prototipos y uso en despachos pequenos sin infraestructura cloud.
- Automatizacion de tareas repetitivas de marcado: en flujos donde se revisan decenas de contratos con la misma plantilla, el modelo localiza sistematicamente las mismas clausulas en cada documento.

## Benchmarks y rendimiento

La model card reporta metricas medidas sobre 1.000 paginas de 102 contratos no vistos durante el entrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Version actual | Version anterior |
|---|---|---|
| Solapamiento de palabras con la clausula correcta | 0,735 | 0,185 |
| Respuestas que son texto real del contrato | 99,6% | 12,3% |
| Acierto al responder `Not found.` cuando la clausula esta ausente | 95,8% | 0% |

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 16 GB para los 8.030 millones de parametros.
- VRAM estimada en 4-bit (BitsAndBytes): aproximadamente 6 GB, segun la model card.
- VRAM estimada en GGUF Q4_K_M: en torno a 5-6 GB (estimacion estandar para 8B en 4 bits; no confirmada explicitamente en la model card).
- GPU recomendadas: A100, H100 o L40S para fp16 con mayor throughput; RTX 4090 (24 GB) para fp16; RTX 3090, RTX 4080 o GPUs con 8-12 GB para cuantizacion 4-bit.
- Cabe en GPU consumer: si, en RTX 4090 en fp16 y en GPUs de 8 GB o mas con cuantizacion 4-bit o GGUF Q4_K_M.
- Opciones de despliegue: transformers (con `device_map="auto"`), BitsAndBytes para 4-bit, llama.cpp/Ollama para GGUF, y text-generation-inference (el repo esta marcado como compatible con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CSroseX/Llama-3-Legal-8B | 8,03B | no disponible (entrenado a ~500 tokens/pagina) | Extraccion extractiva de clausulas CUAD | llama3 | Hugging Face, safetensors y GGUF |
| meta-llama/Meta-Llama-3-8B | 8,03B | 8.192 tokens | Modelo base generalista | llama3 | Hugging Face |
| unsloth/llama-3-8b | 8,03B | 8.192 tokens | Base optimizada para fine-tuning | llama3 | Hugging Face |

No se dispone en la informacion proporcionada de comparativas con otros modelos legales especializados (por ejemplo, variantes sobre LegalBERT o fine-tunes legales de Llama) ni de sus metricas, por lo que la comparacion se limita al modelo base y a la version optimizada de Unsloth.

## Limitaciones y advertencias

- No es un asesor legal: no emite juicios sobre si una clausula es buena, mala o riesgosa; solo localiza texto. La model card lo indica explicitamente.
- Riesgo de alucinacion: aunque la version actual reporta 99,6% de respuestas literales del contrato, sigue siendo un modelo generativo y puede producir texto que no este en el contrato en casos limite.
- Entrenado solo en ingles: no soporta contratos en castellano ni en otros idiomas.
- Entrenado con paginas de ~500 tokens: para contratos completos requiere troceado con solapamiento y fusion de respuestas, lo que anade complejidad y posibles perdidas en los bordes de las ventanas.
- Cobertura limitada a las 41 clausulas de CUAD: no reconoce tipos de clausula fuera de ese conjunto.
- Licencia Llama 3 Community: restricciones para uso comercial a gran escala (mas de 700 millones de usuarios mensuales) y obligacion de incluir el aviso de licencia y la politica de uso aceptable de Meta.
- Repo de 70,2 GB: incluye multiples formatos (safetensors, GGUF Q8_0 y Q4_K_M), lo que puede complicar la descarga selectiva.
- Versionado: la model card advierte que las copias descargadas antes del 20 de noviembre de 2026 corresponden a la version antigua; los archivos GGUF deben descargarse de nuevo.
- Sin soporte nativo de tool calling ni de agentes: no es adecuado para flujos conversacionales complejos.
- Sin datos publicados de latencia ni throughput: dificil estimar costes de produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSroseX/Llama-3-Legal-8B
- Modelo base: https://huggingface.co/unsloth/llama-3-8b
- Meta Llama 3 8B: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Dataset CUAD QA: https://huggingface.co/datasets/theatticusproject/cuad-qa
- Proyecto CUAD (Atticus Project): https://www.atticusprojectai.org/cuad
- Licencia Llama 3: https://huggingface.co/CSroseX/Llama-3-Legal-8B/blob/main/LICENSE
- Historial de versiones del repo: https://huggingface.co/CSroseX/Llama-3-Legal-8B/tree/1b6a47d9321c73464466131d1d7eb594c1e6c847
