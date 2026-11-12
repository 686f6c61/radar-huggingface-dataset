# ivangalkindeveloper/medgemma-27b-it-nvfp4

## Resumen

medgemma-27b-it-nvfp4 es una cuantización no oficial en formato NVFP4 del modelo médico multimodal google/medgemma-27b-it, publicada por el usuario ivangalkindeveloper. El modelo base es un transformer multimodal de Google (familia Gemma 3) especializado en tareas médicas, capaz de procesar entradas de imagen y texto (pipeline image-text-to-text) y orientado a aplicaciones de salud. Esta release concreta contiene el checkpoint exacto probado en una NVIDIA DGX Spark GB10 con vLLM 0.28.0, por lo que su principal valor es servir como referencia reproducible de despliegue en 4 bits para hardware Blackwell.

La cuantización aplica NVFP4 W4A4 con group size 16 a las capas lineales del modelo de lenguaje, manteniendo en BF16 la torre de visión, el proyector multimodal, los embeddings, las capas de normalización y la lm_head. El resultado reduce los pesos cargados en vLLM de 51,54 GiB a 17,42 GiB y duplica aproximadamente la velocidad de decodificación observada en una única petición (de 6,9 a 14,6 tokens/s), a costa de regresiones medidas en calidad de entre 1,76 y 11,25 puntos porcentuales según el conjunto de evaluación.

Es relevante ahora porque demuestra empíricamente el compromiso entre ahorro de memoria y degradación de precisión en un modelo médico de 17.642.754.516 parámetros reales (el nombre comercial "27b" corresponde a la designación del modelo base), y porque documenta con transparencia tanto las ganancias de rendimiento como los fallos factuales introducidos por la cuantización. No es una release oficial de Google y no constituye evidencia de equivalencia clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3) con torre de visión; cuantización NVFP4 en capas lineales del LM |
| Parametros totales | 17.642.754.516 (según safetensors; el modelo base se comercializa como "27b") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de serving usa `--max-model-len 16384`) |
| Tipos de cuantizacion | NVFP4 W4A4, group size 16, calibración static-minmax, pesos round-to-nearest; torre de visión, proyector, embeddings, normalización y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Health AI Developer Foundations Terms of Use (health-ai-developer-foundations); sujeto a la HAI-DEF Prohibited Use Policy |
| Formato de pesos | safetensors con compressed-tensors (4-bit), repo de 20,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es google/medgemma-27b-it, un transformer multimodal de la familia Gemma 3 adaptado al dominio médico, con una torre de visión que procesa imágenes y un proyector multimodal que las alinea con el espacio de tokens del modelo de lenguaje. Esta ficha describe la cuantización, no el entrenamiento original: no se dispone en la información proporcionada de datos sobre tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación técnica consiste en sustituir las capas lineales del LM por pesos NVFP4 W4A4 con group size 16, calibrados con static-minmax sobre 128 entradas de texto (64 ejemplos de entrenamiento de MedQA y 64 prompts sintéticos de informes). Los tensores BF16 originales se restauraron tras un round trip de RMSNorm `(weight + 1) - 1` durante la calibración. Todos los tensores no cuantizados coinciden con el checkpoint fuente y todos los pesos empaquetados y escalas coinciden con la exportación cuantizada en bruto. El repositorio incluye MODIFICATIONS.md, quantization.json y SHA256SUMS para verificación.

## Capacidades

- Generación de texto conversacional en dominio médico, con soporte de chat template propio.
- Procesamiento de entradas multimodales imagen-texto (pipeline image-text-to-text); el serving de ejemplo limita a 6 imágenes por prompt.
- Respuesta a preguntas médicas de opción múltiple y abiertas (evaluado en MedQA, MedMCQA y PubMedQA).
- Interpretación de imágenes radiológicas en tareas de VQA (evaluado en VQA-RAD, subconjuntos closed y open).
- Generación de informes estructurados en JSON con esquema, hechos seleccionados y observaciones esperadas (evaluado con 160 informes sintéticos).
- Procesamiento de dictados clínicos sintéticos (80 tareas de dictado en la evaluación).
- Decodificación especulativa por n-gramas compatible con vLLM (`method: ngram`, 8 tokens especulativos, prompt lookup entre 2 y 5).
- Soporte de prefix caching en vLLM.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de agentes multi-paso.

## Casos de uso

- Despliegue de asistencia clínica en hardware Blackwell: el formato NVFP4 con kernels FlashInferCutlass permite servir el modelo en una DGX Spark GB10 con 17,42 GiB de pesos cargados, habilitando inferencia local de un modelo médico multimodal de gran tamano en un equipo de escritorio de gama alta.
- Triaje de preguntas médicas: el modelo responde a preguntas de opción múltiple tipo MedQA y MedMCQA con una precisión medida de 70,70% y 62,50% respectivamente en NVFP4, adecuado para sistemas de apoyo a la decisión que requieran revisión humana posterior.
- Generación de borradores de informes radiológicos: con salida JSON estructurada y un pass estricto del 79,38% en la evaluación sintética, puede integrarse en pipelines que exijan esquema validado, siempre con revisión facultativa por los errores factuales detectados.
- Búsqueda y síntesis sobre literatura biomédica: PubMedQA se evalúa en 69,20% en NVFP4, lo que permite construir asistentes de recuperación y respuesta sobre abstracts con contexto textual.
- Investigación en cuantización de modelos médicos: el repositorio publica evaluation.json con resultados agregados para concurrencias 1, 4 y 8, quantization.json y SHA256SUMS, lo que lo convierte en una referencia reproducible para estudiar el impacto de NVFP4 en dominios de alto riesgo.
- Prototipado de VQA médica: con VQA-RAD closed en 72,66% (mejora de +2,34 pp frente a BF16), es util para experimentar con interfaces imagen-pregunta-respuesta en entornos de investigación, no para uso diagnóstico.
- Evaluación comparativa de precisión BF16 frente a NVFP4: las métricas publicadas permiten calibrar expectativas de degradación antes de adoptar cuantización en producción sanitaria.

## Benchmarks y rendimiento

Evaluaciones zero-shot personalizadas en JSON del 10-11-2026, una ejecución determinista por precisión, 1.956 tareas por precisión. No son resultados oficiales de Google ni evidencia de equivalencia clínica.

| Métrica | Tareas | BF16 | NVFP4 | Diferencia |
|---|---:|---:|---:|---:|
| MedQA | 512 | 72,46% | 70,70% | -1,76 pp |
| MedMCQA | 512 | 65,04% | 62,50% | -2,54 pp |
| PubMedQA | 500 | 72,60% | 69,20% | -3,40 pp |
| VQA-RAD closed | 128 | 70,31% | 72,66% | +2,34 pp |
| VQA-RAD open exact match | 64 | 15,62% | 15,62% | +0,00 pp |
| Informe sintético strict pass | 160 | 90,62% | 79,38% | -11,25 pp |

Memoria y velocidad medidas en DGX Spark con vLLM 0.28.0:

| Métrica | BF16 | NVFP4 |
|---|---:|---:|
| Pesos cargados en vLLM (GiB) | 51,54 | 17,42 |
| Safetensors en disco (GiB) | 51,10 | 19,45 |
| Decodificación mediana, 1 petición (tokens/s) | 6,9 | 14,6 |
| Latencia mediana del primer token (s) | 0,643 | 0,276 |
| Longitud media de salida (tokens) | 87 | 85 |

El "strict pass" de informes comprueba finalización de JSON/esquema, hechos seleccionados, observaciones esperadas y repetición; no es precisión clínica y los chequeos automáticos pueden producir falsos positivos. La puerta de calidad conservadora del estudio (no perder más de 2 pp en cada conjunto de QA y no introducir hechos críticos nuevos) no se cumplió. La revisión de informes sintéticos encontró errores factuales, incluidas mediciones no respaldadas en algunas salidas cuantizadas. No hubo evaluación clínica cegada ni repetición del baseline BF16 para medir varianza entre ejecuciones. Los datos de benchmark pueden solaparse con datos de preentrenamiento desconocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,42 GiB solo para pesos cargados en vLLM según la medición del autor; a ello se suman KV cache (el ejemplo reserva 8.589.934.592 bytes, unos 8 GiB), CUDA graphs, buffers multimodales y memoria de host.
- GPU validadas: NVIDIA DGX Spark GB10 con kernel nativo `FlashInferCutlassNvFp4LinearKernel`. NVFP4 requiere GPU, stack CUDA y runtime compatibles; otras GPU no fueron validadas.
- Consumer GPU: no disponible confirmación de funcionamiento en RTX 4090 u otras GPU de consumo; NVFP4 exige soporte hardware específico de Blackwell y no se documenta compatibilidad con Ada.
- Opciones de despliegue: vLLM 0.28.0 es el único backend probado. No se valida llama.cpp, Ollama, TGI ni otras versiones de vLLM.
- Comando de serving de referencia: `vllm serve ivangalkindeveloper/medgemma-27b-it-nvfp4 --dtype bfloat16 --max-model-len 16384 --max-num-seqs 8 --max-num-batched-tokens 2048 --kv-cache-memory-bytes 8589934592 --limit-mm-per-prompt '{"image": 6}' --enable-prefix-caching` con decodificación especulativa n-gram.
- Latencia y throughput: mediana de 14,6 tokens/s en decodificación y 0,276 s hasta el primer token con una petición activa y decodificación especulativa n-gram; muestras pequenas que no establecen aceleraciones universales. Resultados agregados para concurrencia 1, 4 y 8 en evaluation.json.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgemma-27b-it-nvfp4 (esta ficha) | 17.642.754.516 | no disponible | NVFP4 (compressed-tensors) | HAI-DEF Terms of Use | Hugging Face, 0 descargas |
| google/medgemma-27b-it (base BF16) | no disponible en esta ficha | no disponible | BF16 safetensors | HAI-DEF Terms of Use | Hugging Face, oficial de Google |
| Otras cuantizaciones de medgemma-27b-it | no disponible | no disponible | no disponible | dependiente del autor | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks de terceros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación directa relevante es frente al checkpoint BF16 del propio modelo base, cuyas métricas se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Regresión de calidad medida: pérdidas de 1,76 pp en MedQA, 2,54 pp en MedMCQA, 3,40 pp en PubMedQA y 11,25 pp en strict pass de informes sintéticos; la puerta de calidad conservadora del estudio no se cumplió.
- Errores factuales introducidos: la revisión de informes sintéticos encontró mediciones no respaldadas en algunas salidas cuantizadas.
- Sin validación clínica: no hubo evaluación por clínicos ciegados ni repetición del baseline para medir varianza; los benchmarks no constituyen evidencia de equivalencia clínica.
- VQA-RAD no establece rendimiento en ecografía; los datos de benchmark pueden solaparse con preentrenamiento desconocido.
- Limitaciones de dominio e idioma: no se documentan idiomas soportados ni cobertura lingüística; el modelo base está orientado a uso médico en inglés por defecto y esta ficha no aporta evidencia de calidad multilingüe.
- Restricciones de licencia: uso y redistribución regidos por Health AI Developer Foundations Terms of Use, sección 3.2, y la HAI-DEF Prohibited Use Policy; deben preservarse el acuerdo, avisos y restricciones al redistribuir.
- No es una release oficial de Google; el autor la etiqueta explícitamente como no oficial.
- Dependencia de hardware y software: solo validada en GB10 con vLLM 0.28.0; otras GPU, backends y versiones anteriores de vLLM no fueron probadas.
- Riesgo de alucinación: inherente al modelo base y agravado por la cuantización en tareas de generación abierta; VQA-RAD open exact match se mantiene en 15,62%, un valor bajo que refleja la dificultad de respuestas abiertas.
- Esta evaluación de ingeniería no valida uso clínico ni sustituye autorizaciones regulatorias exigibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4
- Modelo base: https://huggingface.co/google/medgemma-27b-it
- Revisión concreta del modelo base citada: https://huggingface.co/google/medgemma-27b-it/tree/2d3e00ea38b50018bf5dd3aa1009457cd2d5a48f
- MODIFICATIONS.md: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/MODIFICATIONS.md
- quantization.json: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/quantization.json
- SHA256SUMS: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/SHA256SUMS
- evaluation.json: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/evaluation.json
- LICENSE (HAI-DEF Terms of Use): https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/LICENSE
- USE_POLICY.md (HAI-DEF Prohibited Use Policy): https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/USE_POLICY.md
- NOTICE: https://huggingface.co/ivangalkindeveloper/medgemma-27b-it-nvfp4/blob/main/NOTICE
