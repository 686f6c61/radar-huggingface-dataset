# mradermacher/Llama-3.1-8B-CounselTrajLM-GGUF

## Resumen

Llama-3.1-8B-CounselTrajLM-GGUF es la distribucion en formato GGUF del modelo UEC-InabaLab/Llama-3.1-8B-CounselTrajLM, un ajuste fino de Llama 3.1 8B orientado a conversaciones de consejeria y acompanamiento psicologico. El trabajo original lo desarrolla el laboratorio InabaLab de la Universidad de Electro-Comunicaciones (UEC, Japon), y la cuantizacion la publica mradermacher, un conocido empaquetador de modelos en GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo parte de la arquitectura transformer densa de Llama 3.1 con 8.030.261.312 parametros y una ventana de contexto de 128.000 tokens (heredada del modelo base de Meta). Se ha entrenado sobre el dataset CounselTrajD, un corpus de trayectorias conversacionales de consejeria en chino, lo que lo especializa en dialogos multi-turno con estructura terapeutica. La licencia es la Llama 3.1 Community License, con las restricciones habituales de Meta para uso comercial a gran escala.

Su relevancia practica radica en que ofrece una alternativa ligera (8B) y desplegable en hardware de consumo para prototipar asistentes conversacionales especializados en salud mental, con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16). No es un modelo generalista de proposito general, sino un ajuste de dominio cuyo rendimiento fuera de la consejeria puede degradarse respecto al Llama 3.1 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (chino), segun la model card; el modelo base Llama 3.1 soporta multilingue, pero el ajuste se realizo en chino |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original en safetensors esta en UEC-InabaLab/Llama-3.1-8B-CounselTrajLM |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: transformer decoder-only denso con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU. El ajuste fino parte de los pesos de Meta y se especializa sobre el dataset CounselTrajD, compuesto por trayectorias de conversacion de consejeria en chino. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion tecnica principal es el propio dataset CounselTrajD, que modela "trayectorias" de dialogo terapeutico (estructura de sesion, fases y transiciones), en lugar de simples pares pregunta-respuesta. El repositorio de mradermacher no modifica la arquitectura: solo convierte los pesos a GGUF con cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1), e incluye ademas una variante con cuantizaciones ponderadas/imatrix en mradermacher/Llama-3.1-8B-CounselTrajLM-i1-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a dialogo de consejeria y acompanamiento psicologico.
- Modelado de trayectorias terapeuticas: estructura de sesion, fases y transiciones, gracias al entrenamiento sobre CounselTrajD.
- Razonamiento general y conocimiento heredados de Llama 3.1 8B (matematicas, codigo, sentido comun), aunque potencialmente degradados por el ajuste de dominio.
- Capacidad multilingue heredada del modelo base, con especializacion fuerte en chino.
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Llama 3.1 lo soporta, pero el ajuste fino puede haberlo alterado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking, vision o audio: no disponible (modelo solo texto).

## Casos de uso

- Prototipado de asistentes de salud mental: el modelo puede mantener conversaciones multi-turno con estructura de sesion terapeutica, util para validar flujos de producto antes de invertir en modelos mayores.
- Simulacion de pacientes para entrenamiento de profesionales: generar respuestas realistas de consultantes en chino para practicar tecnicas de entrevista clinica.
- Investigacion en NLP clinico: analisis de trayectorias de dialogo y evaluacion de modelos en tareas de consejeria, con la ventaja de ser desplegable en una sola GPU.
- Chatbots de acompanamiento emocional en produccion de bajo coste: con cuantizacion Q4_K_M (5,0 GB) cabe en GPUs de consumo y ofrece latencia baja para servicios con pocos usuarios concurrentes.
- Generacion de datos sinteticos de dialogo terapeutico: producir conversaciones etiquetadas por fase para aumentar datasets de entrenamiento de otros modelos.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local con llama.cpp u Ollama, los datos de los usuarios no salen del dispositivo, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Educacion y formacion: ejercicios de role-play en chino para estudiantes de psicologia, con el modelo actuando como consultante o como consejero simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto): Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 12 GB o RTX 4060 Ti 16 GB; para Q8_0 se recomienda RTX 4090 24 GB o A100 40 GB; para f16, A100 40 GB o H100.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas con 8-16 GB de VRAM; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo original en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-8B-CounselTrajLM | 8,03 B | 128k (heredado) | Consejeria en chino | Llama 3.1 | GGUF, safetensors |
| Llama-3.1-8B-Instruct | 8,03 B | 128k | Instrucciones generales | Llama 3.1 | safetensors, GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | 128k | Instrucciones generales, multilingue | Apache 2.0 | safetensors, GGUF |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32k | Instrucciones generales | Apache 2.0 | safetensors, GGUF |

Frente a estos alternativas, CounselTrajLM ofrece especializacion de dominio (consejeria en chino) pero menor versatilidad general y una licencia mas restrictiva que Apache 2.0. No hay datos de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Modelo especializado en chino: su rendimiento en castellano u otros idiomas puede ser notablemente inferior al de Llama 3.1 Instruct.
- Riesgo de alucinacion elevado en un dominio sensible como la salud mental; no debe usarse como sustituto de profesionales sanitarios.
- Sesgos del dataset CounselTrajD y del corpus de entrenamiento de Llama 3.1, no evaluados en la informacion disponible.
- Licencia Llama 3.1 Community License: permite uso comercial con condiciones (atribucion, limite de 700 millones de usuarios mensuales, restricciones de uso).
- El ajuste fino puede haber degradado capacidades generales (codigo, matematicas) y el soporte de tool calling del modelo base.
- Las cuantizaciones Q2_K y Q3_K_S pierden calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No hay evaluacion publicada de seguridad ni de comportamiento en conversaciones de crisis; en produccion se requiere filtrado y derivacion a recursos de ayuda.
- El repositorio ocupa 71,8 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.1-8B-CounselTrajLM-GGUF
- Modelo original: https://huggingface.co/UEC-InabaLab/Llama-3.1-8B-CounselTrajLM
- Dataset CounselTrajD: https://huggingface.co/datasets/UEC-InabaLab/CounselTrajD
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama-3.1-8B-CounselTrajLM-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-CounselTrajLM-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
