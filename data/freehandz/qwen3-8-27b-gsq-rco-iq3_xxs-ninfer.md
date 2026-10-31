# FreehandZ/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-ninfer

## Resumen

Qwen3.8-27B GSQ-RCO IQ3_XXS-ninfer es un artefacto de inferencia cuantizado del modelo Qwen3.8-27B de Qwen, publicado por el usuario FreehandZ en Hugging Face. No se trata de un modelo nuevo, sino de una conversión al formato `.ninfer` de la cuantización GSQ-RCO IQ3_XXS elaborada por ISTA-DASLab, pensada para ejecutarse exclusivamente con el runtime NInfer-Qwen. Su propuesta de valor es muy concreta: servir el modelo completo con un contexto de 262.144 tokens en una única GeForce RTX 5060 Ti de 16 GB de VRAM, algo inviable con el modelo en precisión completa.

El artefacto incluye las 64 capas del modelo de texto con sus bloques ggml preservados byte a byte (formatos IQ1 a IQ4, Q2_K, Q4_K, BF16 y F32), una cabeza de predicción multi-token (MTP) para decodificación especulativa y una cabeza de propuestas con los 131.072 tokens más frecuentes. El servidor resultante expone APIs compatibles con OpenAI, Anthropic y llama.cpp.

Es relevante ahora porque ejemplifica la tendencia actual de llevar modelos de 27B con contexto ultra largo a GPUs de consumo mediante cuantizaciones agresivas (IQ3_XXS, alrededor de 3 bits de media) y técnicas de inferencia optimizadas. El artefacto pesa 10,8 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8), 64 capas, con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GSQ-RCO IQ3_XXS (bloques IQ1 a IQ4, Q2_K, Q4_K, BF16 y F32; cabeza MTP requantizada a IQ4_XS; cabeza de propuestas en IQ2_XXS) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto propio de NInfer-Qwen, derivado de GGUF; no compatible con llama.cpp, vLLM ni Transformers) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer denso de 64 capas desarrollado por Qwen. Este artefacto no modifica la arquitectura del modelo: aplica sobre ella la cuantización GSQ-RCO de ISTA-DASLab, un esquema de cuantización descrito en los artículos arXiv:2604.18556 y arXiv:2605.00649, que en la variante IQ3_XXS usa aproximadamente 3 bits por peso mezclando bloques de distinta precisión (IQ1 a IQ4, Q2_K, Q4_K, BF16 y F32) según la sensibilidad de cada tensor.

Sobre la base cuantizada, el artefacto añade dos componentes orientados a acelerar la inferencia: la cabeza de predicción multi-token (MTP), cuyas proyecciones se requantizan de Q6_K a IQ4_XS y que habilita la decodificación especulativa, y una cabeza de propuestas que preselecciona candidatos entre los 131.072 tokens más frecuentes mediante una copia IQ2_XXS antes del rescoring exacto. No hay información sobre datos de entrenamiento, número de tokens ni ajuste fino (RLHF/DPO) del modelo base en la documentación disponible; el modelo original de Qwen incluye un modo de thinking (razonamiento), que en las pruebas de rendimiento se desactivó.

## Capacidades

- Generacion de texto conversacional con plantilla de chat Qwen3.8 incluida en el artefacto.
- Razonamiento con modo thinking del modelo base Qwen3.8 (evaluado con muestreo temperature 1.0, top-p 0.95, top-k 20).
- Resolucion de problemas matematicos de competicion (AIME 2025: 93,33 en la evaluacion del artefacto).
- Seguimiento de instrucciones complejas (IFBench strict: 79,33).
- Contexto ultra largo: 262.144 tokens, util para documentos extensos y repositorios completos.
- Decodificacion especulativa mediante cabeza MTP y cabeza de propuestas de vocabulario reducido.
- Servidor compatible con las APIs de OpenAI, Anthropic y llama.cpp, con soporte de multiples peticiones simultaneas y cache de conversacion.
- Sin capacidades de vision: el artefacto no incluye encoder de imagen ni video.

No se menciona soporte explicito de tool calling ni de agentes en la documentacion disponible.

## Casos de uso

- Chatbot local con documentos extensos: con 262.144 tokens de contexto, puede cargar libros, contratos o bases de conocimiento completas en una sola peticion y responder preguntas sobre su contenido sin RAG, todo en una RTX 5060 Ti de consumo.
- Analisis de repositorios de codigo: el contexto largo permite indexar multiples ficheros de un proyecto en el prompt para revisiones de codigo, explicaciones de arquitectura o deteccion de bugs.
- Atencion al cliente autoalojada: el servidor expone la API de OpenAI y Anthropic, por lo que puede integrarse directamente en frameworks existentes; la cache de conversacion reduce costes en sesiones multi-turno.
- Asistencia matematica y preparacion de oposiciones o competiciones: el resultado de 93,33 en AIME 2025 indica un rendimiento alto en problemas de olimpiada matematica.
- Procesamiento por lotes en hardware modesto: con 8 peticiones simultaneas alcanza 342 tok/s agregados y con 32 unas 625 tok/s, adecuado para colas de resumen o clasificacion de documentos.
- Experimentacion con decodificacion especulativa: la inclusion de la cabeza MTP y la cabeza de propuestas lo convierte en un banco de pruebas para estudiar el impacto de estas tecnicas en latencia.
- Sustitucion de descargas y conversiones manuales: descargar el artefacto evita el proceso de 10,4 GB de descarga y 10 minutos de conversion que exige el script original de preparacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con EvalScope y el muestreo de thinking-mode de Qwen (temperature 1.0, top-p 0.95, top-k 20) a contexto de 262.144 tokens:

| Benchmark | Este artefacto | Qwen3.8-27B (precision completa) |
|---|---:|---:|
| IFBench (strict, prompt-level) | 79,33 | 79,5 |
| AIME 2025 | 93,33 | no disponible |

AIME 2026, GPQA-Diamond y LiveCodeBench v6 estaban pendientes de ejecutarse en el momento de la publicacion.

Rendimiento de inferencia en RTX 5060 Ti 16 GB (una peticion, respuestas greedy de 512 tokens, thinking desactivado):

| Carga de trabajo | Resultado |
|---|---:|
| Prompt de 30K tokens: prefill / decode | 3.644-3.648 tok/s / 88,7 tok/s |
| Prompt de 160K tokens: prefill / decode | 2.143 tok/s / 66,0 tok/s |
| Prompt corto: decode | 87,0-87,7 tok/s |
| 8 peticiones simultaneas (total) | 342 tok/s |
| 32 peticiones simultaneas (total) | ~625 tok/s |

## Requisitos de hardware

- VRAM: 16 GB son suficientes para servir el artefacto completo con contexto de 262.144 tokens en una RTX 5060 Ti; el fichero pesa 10,8 GB, dejando margen para la cache de contexto.
- GPU de referencia: NVIDIA GeForce RTX 5060 Ti 16 GB, sobre la que se han publicado todas las mediciones. No hay datos para otras GPUs.
- Encaja en GPUs de consumo de 16 GB; no hay informacion sobre comportamiento en GPUs de 8 o 12 GB ni en GPUs de datacenter.
- Despliegue: exclusivamente mediante NInfer-Qwen (runtime de 2-com-org). El artefacto NO funciona con llama.cpp, vLLM, TGI, Ollama ni la libreria Transformers de Hugging Face.
- Latencia: prefill de ~3.645 tok/s con prompts de 30K tokens y de 2.143 tok/s con 160K; decodificacion de 66-88,7 tok/s en solitario segun longitud de prompt, y hasta ~625 tok/s agregados con 32 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, precision completa) | 27B | no disponible en la documentacion de este artefacto | safetensors (BF16) | Apache-2.0 | Rendimiento maximo, requiere mucha mas VRAM |
| ISTA-DASLab Qwen3.8-27B-GSQ-RCO-GGUF | 27B | no disponible | GGUF (IQ3_XXS) | Apache-2.0 | Cuantizacion origen; compatible con llama.cpp, sin MTP integrado |
| Este artefacto (FreehandZ) | 27B | 262.144 | `.ninfer` | Apache-2.0 | Contexto largo en 16 GB, MTP especulativo, solo NInfer-Qwen |

No se dispone de datos de benchmarks comparativos frente a otros modelos de 27B cuantizados (por ejemplo Gemma o Mistral de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad cerrada: el artefacto solo funciona con NInfer-Qwen; no puede cargarse con llama.cpp, vLLM, Ollama ni Transformers, lo que limita su integracion con el ecosistema estandar.
- Sin capacidades de vision: el artefacto omite el encoder de imagen y video del modelo, por lo que no sirve para tareas multimodales.
- Cuantizacion agresiva: IQ3_XXS ronda los 3 bits por peso, lo que puede degradar la calidad en tareas sensibles; los benchmarks publicados (IFBench y AIME 2025) muestran perdida minima frente a precision completa, pero la cobertura de evaluaciones es aun parcial (GPQA-Diamond, LiveCodeBench v6 y AIME 2026 pendientes).
- Sin datos de sesgo, tasa de alucinacion ni seguridad: no se ha publicado ninguna evaluacion de estos aspectos para el artefacto ni informacion detallada del modelo base en la documentacion disponible.
- Idiomas soportados no declarados en la ficha del repositorio.
- Rendimiento verificado solo en RTX 5060 Ti: en otras GPUs los resultados pueden diferir sustancialmente y no hay mediciones publicadas.
- Uso comercial: la licencia Apache-2.0 permite el uso comercial sin restricciones destacables.
- Dependencia de un runtime de terceros (2-com-org): la viabilidad a largo plazo depende del mantenimiento del proyecto NInfer-Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FreehandZ/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-ninfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion GGUF origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio NInfer-Qwen: https://github.com/2-com-org/ninfer-5060-qwen/tree/qwen38-5060ti
- Wiki de instalacion: https://github.com/2-com-org/ninfer-5060-qwen/wiki/Installation
- Wiki de servicio: https://github.com/2-com-org/ninfer-5060-qwen/wiki/Serving
- Wiki de preparacion de modelos: https://github.com/2-com-org/ninfer-5060-qwen/wiki/Model-Preparation
- Wiki de rendimiento: https://github.com/2-com-org/ninfer-5060-qwen/wiki/Performance
- Wiki de evaluacion: https://github.com/2-com-org/ninfer-5060-qwen/wiki/Evaluation
- Paper GSQ-RCO (1): https://arxiv.org/abs/2604.18556
- Paper GSQ-RCO (2): https://arxiv.org/abs/2605.00649
