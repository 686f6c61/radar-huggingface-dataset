# ErtasAI/MedErtas-v0.1-31B-LS

## Resumen

MedErtas v0.1 31B LS es un modelo de lenguaje de pesos abiertos especializado en dominio médico, desarrollado por ErtasAI a partir de Google Gemma 4 31B IT. No se trata de un reentrenamiento: la arquitectura del modelo base se mantiene intacta y el trabajo del autor se concentra en una cuantización consciente del dominio (perfil LS, *Lightweight Study*) calibrada sobre datos clínicos, más un borrador (*drafter*) de decodificación especulativa específico para medicina. El resultado es un artefacto de 24,2 GB frente a los 62,6 GB en BF16 del original.

El modelo está pensado para servir productos de IA médica con coste bajo y latencia reducida sobre vLLM y GPUs NVIDIA Blackwell, que son requisito del formato NVFP4 (W4A4) empleado. Según la model card, conserva el 99,6 % de la puntuación media del BF16 en un conjunto de 12 pruebas médicas (78,1 frente a 78,4) y multiplica por 8,4 la velocidad de decodificación en un solo usuario (189 frente a 22,5 tokens/s) cuando se combina con el drafter Perigee.

Es relevante ahora porque demuestra que una cuantización agresiva a 4 bits, si se calibra con datos del dominio y se protege la atención en FP8, puede mantener la precisión clínica donde otras builds NVFP4 genéricas (Red Hat, NVIDIA) pierden entre 4,1 y 6,4 puntos en cálculo clínico. La licencia Apache 2.0 heredada de Gemma 4 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), arquitectura sin cambios respecto al base |
| Parametros totales | 20.868.593.516 (según safetensors; el nombre comercial indica 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens medidos; contexto mayor del base heredado pero no medido con estos pesos |
| Tipos de cuantizacion | NVFP4 (W4A4) en proyecciones MLP, FP8 en atención, BF16 en embeddings y LM head; torres de visión y audio en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (heredada de Gemma 4) |
| Formato de pesos | safetensors con compressed-tensors (NVFP4), servido con vLLM |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` y no modifica su arquitectura. La intervención del autor es exclusivamente de compresión: cuantización NVFP4 de 4 bits en pesos y activaciones (W4A4) para las proyecciones MLP, atención mantenida en FP8 y embeddings junto con la LM head en BF16. Las torres de visión y audio del base se conservan en BF16 pero no se usan en servicio de texto. El diseño de precisión mixta añade 0,9 GB frente a un layout íntegramente NVFP4 y, según la model card, es lo que sostiene el rendimiento en cálculo clínico.

La calibración de la cuantización se realizó sobre datos médicos, y cada build LS se evalúa contra su base en BF16 antes de publicarse. No se detalla el volumen ni la composición del conjunto de calibración, ni si hubo fases de RLHF o DPO adicionales; al ser una cuantización del base, esas etapas se heredan del modelo de Google y no se documentan aquí. La innovación destacable es el ecosistema de decodificación especulativa: un drafter de 1,0 GB (`MedErtas-v0.1-31B-LS-Perigee`) afinado sobre respuestas médicas a partir del asistente de Gemma 4, que eleva la velocidad de 51 a 189 tokens/s manteniendo la verificación de cada token por el modelo principal.

## Capacidades

- Generación de texto y razonamiento clínico: preguntas de examen médico (MedQA), reconocimiento de preguntas sin respuesta (MetaMedQA).
- Codificación médica: clasificación ICD-10 en tres niveles de dificultad (MedConceptsQA).
- Detección de alucinaciones: verificación de respuestas frente a hechos clínicos (MedHallu en fácil, medio y difícil).
- Cálculo clínico: dosis, escalas y calculadoras de riesgo (MedCalc-Bench), con soporte de uso de herramienta calculadora.
- Extracción de hechos en historiales largos: lectura de registros de pacientes extensos (LongHealth).
- Tool calling: la evaluación con herramientas en MedCalc-Bench confirma soporte de llamada a calculadora.
- Decodificación especulativa: compatible con el drafter Perigee y con el asistente de Gemma 4.
- Capacidades del base no verificadas con estos pesos: visión y audio existen en BF16 pero no se han medido en esta build; el contexto extendido del base está heredado pero no evaluado.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Triaje de consultas clínicas: el modelo responde preguntas de estilo examen con un 93,0 en MedQA, adecuado para sistemas de apoyo a la decisión que requieren precisión en conocimiento médico general.
- Codificación ICD-10 en facturación sanitaria: con 98,5 en MedConceptsQA fácil y 69,1 en difícil, puede preasignar códigos diagnósticos y derivar los casos ambiguos a revisión humana.
- Verificación de respuestas generadas: su rendimiento en MedHallu (85,0 fácil, 64,1 difícil) permite usarlo como segundo modelo auditor en pipelines que detectan afirmaciones no respaldadas.
- Cálculo de dosis y escalas clínicas: MedCalc-Bench de 63,9 sin herramientas y 61,1 con calculadora; útil con validación humana obligatoria en entornos donde el cálculo exacto es crítico.
- Resumen de historiales largos: LongHealth de 90,2 y 89,8 en las dos tareas, con contexto medido de 65.536 tokens, para extraer hechos de registros de pacientes multipágina.
- Servicio de alto rendimiento en producción: 189 tokens/s con Perigee en una RTX PRO 6000 permite atender chat clínico interactivo con latencia baja y coste contenido frente a BF16.
- Despliegue en infraestructura Blackwell: al requerir NVFP4 W4A4, encaja en clústeres con GPUs Blackwell donde el ahorro de memoria (24,2 GB frente a 62,6 GB) multiplica la densidad de instancias por GPU.

## Benchmarks y rendimiento

Evaluado con el harness Medmarks, thinking desactivado, vLLM 0.32.0, temperatura 1.0, una pasada por build. Diferencias en puntos de precisión con intervalos del 95 %.

| Conjunto (ítems) | BF16 | Este modelo | Δ (IC 95 %) | Red Hat NVFP4 | NVIDIA NVFP4 |
|---|---|---|---|---|---|
| MedCalc-Bench 1.2 (1.100) | 65,3 | 63,9 | −1,4 (−3,7 a +1,0) | 58,9 | 61,2 |
| MedCalc-Bench 1.2 con herramientas (1.100) | 63,8 | 61,1 | −2,7 (−5,1 a −0,4) | 59,0 | 61,7 |
| MedQA (1.273) | 93,2 | 93,0 | −0,2 (−1,3 a +0,9) | 93,1 | 92,5 |
| MetaMedQA (1.373) | 70,4 | 70,4 | 0,0 (−1,4 a +1,4) | 69,7 | 69,5 |
| MedHallu fácil (548) | 83,6 | 85,0 | +1,5 (−0,4 a +3,3) | 83,2 | 83,9 |
| MedHallu medio (636) | 80,2 | 81,1 | +0,9 (−1,2 a +3,1) | 78,5 | 80,8 |
| MedHallu difícil (816) | 64,1 | 64,1 | 0,0 (−2,0 a +2,0) | 63,5 | 62,6 |
| MedConceptsQA fácil (2.000) | 98,8 | 98,5 | −0,3 (−0,8 a +0,1) | 98,7 | 98,7 |
| MedConceptsQA medio (2.000) | 71,7 | 70,5 | −1,1 (−2,6 a +0,4) | 70,0 | 70,4 |
| MedConceptsQA difícil (2.000) | 69,2 | 69,1 | −0,1 (−1,7 a +1,6) | 66,7 | 68,0 |
| LongHealth tarea 1 (400) | 90,2 | 90,2 | 0,0 (−1,2 a +1,2) | 90,8 | 90,8 |
| LongHealth tarea 2 (800) | 89,8 | 89,8 | 0,0 (−0,8 a +0,8) | 89,9 | 90,1 |
| Media, 12 conjuntos | 78,4 | 78,1 | — | 76,8 | 77,5 |

Velocidad de decodificación en un usuario, cálculo clínico, una RTX PRO 6000, vLLM 0.32.0, octubre de 2026:

| Configuración | Tokens/s |
|---|---|
| Gemma 4 31B BF16 | 22,5 |
| Este modelo | 51 |
| Este modelo con asistente de Gemma 4 | 168 |
| Este modelo con Perigee | 189 |

## Requisitos de hardware

- VRAM de inferencia: los pesos ocupan 24,2 GB; el drafter Perigee añade 1,0 GB. Con caché KV para 65.536 tokens el consumo real será superior y no se documenta.
- GPU obligatorias: NVIDIA Blackwell, requisito del formato NVFP4 W4A4. Medido en una RTX PRO 6000 (96 GB); tarjetas Blackwell menores no se han medido.
- No cabe en GPUs consumer de generaciones anteriores (Ampere, Ada) por la falta de soporte NVFP4; no se indica compatibilidad con RTX 4090.
- Despliegue: vLLM 0.32.0 es el runtime documentado. No se mencionan llama.cpp, Ollama ni TGI para esta build.
- Rendimiento medido: 51 tokens/s sin especulación, 168 con el asistente de Gemma 4 y 189 con Perigee, frente a 22,5 del BF16 en la misma GPU.
- Latencia: no se publican cifras de time-to-first-token ni de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media Medmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedErtas v0.1 31B LS | 20,87B (safetensors) | 65.536 medidos | 78,1 | Apache 2.0 | Hugging Face, vLLM |
| Gemma 4 31B BF16 (base) | no disponible | mayor, no medido con estos pesos | 78,4 | Apache 2.0 | Hugging Face |
| Gemma 4 31B NVFP4 de Red Hat | no disponible | no disponible | 76,8 | Apache 2.0 | Hugging Face |
| Gemma 4 31B NVFP4 de NVIDIA | no disponible | no disponible | 77,5 | Apache 2.0 | Hugging Face |
| MedErtas v0.1 27B LS | no disponible | no disponible | no disponible (MedCalc-Bench 77,3) | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con las otras builds NVFP4 del mismo base: MedErtas supera a Red Hat en 1,3 puntos de media y a NVIDIA en 0,6, con la mayor ventaja en MedCalc-Bench. Frente al BF16, la pérdida media es de 0,3 puntos. El modelo hermano de 27B es preferible para cálculo clínico (77,3 frente a 63,9 en MedCalc-Bench) según la propia model card.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell: no es desplegable en GPUs sin soporte NVFP4, lo que limita su adopción en infraestructura existente.
- Solo inglés: no hay soporte multilingüe documentado, pese a que el base pueda tenerlo.
- Contexto medido de 65.536 tokens; el contexto extendido del base está heredado pero no evaluado con estos pesos, por lo que su comportamiento más allá de esa ventana es desconocido.
- Rendimiento flojo en cálculo clínico: 63,9 en MedCalc-Bench y 61,1 con herramientas, con un intervalo que cae por debajo de cero en la variante con herramientas antes de corrección de Holm. No debe usarse sin validación para dosis.
- Detección de alucinaciones limitada en casos difíciles: 64,1 en MedHallu difícil, similar al BF16; no es una garantía de veracidad.
- Riesgo de alucinación inherente al modelo base y agravado en dominio médico; la model card no documenta sesgos específicos.
- Evaluación con una sola pasada por build y temperatura 1.0, sin repeticiones: la varianza de las métricas no está caracterizada más allá de los intervalos publicados.
- Las torres de visión y audio no se han medido en esta build; no deben asumirse capacidades multimodales.
- Uso clínico: no se indica certificación regulatoria ni validación prospectiva; la licencia Apache 2.0 permite uso comercial pero no exime de las obligaciones regulatorias del sector sanitario.
- El drafter Perigee es un artefacto separado que debe descargarse y configurarse aparte para obtener las cifras de velocidad anunciadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/MedErtas-v0.1-31B-LS
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Drafter Perigee: https://huggingface.co/ErtasAI/MedErtas-v0.1-31B-LS-Perigee
- Modelo hermano 27B LS: https://huggingface.co/ErtasAI/MedErtas-v0.1-27B-LS
- Whitepaper: https://www.ertas.ai/research/medertas-v01-specialisation-inference-optimisation
- Página del modelo: https://www.ertas.ai/medertas
- Colecciones: https://huggingface.co/collections/ErtasAI
- API de prueba: https://app.ertas.ai
- Gateway: https://www.ertas.ai/medertas
- Harness de evaluación Medmarks: https://medmarks.ai
- Contacto enterprise: https://www.calendly.com/hello-ertas/enterprise
