# mradermacher/PetroQA-OrpoLlama-3-8B-GGUF

## Resumen

PetroQA-OrpoLlama-3-8B-GGUF es la distribucion en formato GGUF del modelo PetroQA-OrpoLlama-3-8B, un ajuste fino de Llama 3 de 8B parametros desarrollado por jhonparra18 y cuantizado por mradermacher. El modelo esta especializado en dominio petrolero y ha sido entrenado sobre el dataset jhonparra18/petro-qa, empleando la tecnica ORPO (Odds Ratio Preference Optimization) para el alineamiento. Esta pensado para responder preguntas tecnicas del sector del petroleo y gas en espanol.

La relevancia de esta publicacion reside en dos factores. Por un lado, ofrece una alternativa ligera (8B) y de licencia Apache 2.0 para tareas de QA vertical en espanol, un nicho con poca oferta de modelos especializados abiertos. Por otro, la cuantizacion GGUF de mradermacher permite desplegar el modelo en hardware consumer mediante llama.cpp u Ollama, con un abanico de 12 niveles de cuantizacion que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16).

El modelo hereda la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.277.632 parametros totales. Se distribuye unicamente en formato GGUF (no hay pesos safetensors en este repositorio, solo el resultado de la conversion); el repositorio ocupa 71,8 GB en total por acumulacion de todas las variantes. La fecha de creacion es el 21 de marzo de 2025 y la ultima actualizacion registrada es el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12 variantes); no se incluyen safetensors en este repo |
| Modelo base | jhonparra18/PetroQA-OrpoLlama-3-8B |
| Dataset de entrenamiento | jhonparra18/petro-qa |
| Libreria | transformers |
| Tamano del repositorio | 71,8 GB |
| Descargas | 9 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU, con 8.030.277.632 parametros. Sobre esta base, el autor jhonparra18 aplico un ajuste fino supervisado seguido de alineamiento mediante ORPO (Odds Ratio Preference Optimization), una tecnica que combina en una sola etapa el ajuste de instrucciones y la optimizacion de preferencias, eliminando la necesidad de una fase separada de RLHF con modelo de recompensa. El dataset empleado es jhonparra18/petro-qa, orientado a preguntas y respuestas del dominio petrolero.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de datos o hiperparametros del ajuste ORPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de la propia cuantizacion GGUF, que en este repositorio es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor de la cuantizacion indica que no hay quants ponderados/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y respuesta a preguntas en espanol, con especializacion en el dominio petrolero y de gas.
- Razonamiento conversacional multi-turno (tag `conversational` en el repositorio).
- Alineamiento de instrucciones mediante ORPO, lo que deberia mejorar la adherencia a formatos de respuesta y la preferencia humana frente al modelo base sin alinear.
- Capacidad multilingue limitada: el modelo declara unicamente el idioma espanol, aunque al derivar de Llama 3 conserva parte del conocimiento multilingue del modelo original (no confirmado en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (modelo solo texto).
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia tecnica en espanol para operaciones petroleras: el modelo puede responder consultas sobre terminologia, procedimientos y conceptos del sector gracias al ajuste sobre el dataset petro-qa, desplegado en local con llama.cpp u Ollama.
- Base de conocimiento interna para ingenieros de yacimientos: integracion como chatbot de consulta sobre documentacion tecnica del dominio, con cuantizacion Q4_K_M (5,0 GB) para servidores modestos.
- Formacion y onboarding de personal: generacion de explicaciones y respuestas de repaso sobre conceptos de petroleo y gas en espanol, aprovechando la licencia Apache 2.0 para uso corporativo sin restricciones de redistribucion.
- Prototipado rapido de asistentes verticales: al ser un modelo de 8B cuantizado, permite iterar en estaciones de trabajo con GPU consumer (por ejemplo, RTX 3060 de 12 GB con Q4_K_M) antes de escalar a un modelo mayor.
- Generacion de borradores de documentacion tecnica en espanol: redaccion asistida de fichas, procedimientos y resumenes del dominio, con revision humana obligatoria por el riesgo de alucinacion.
- Evaluacion comparativa de tecnicas de alineamiento: el modelo sirve como caso de estudio de ORPO aplicado a un dominio vertical, util para investigadores que comparan ORPO frente a DPO/RLHF en tareas de QA especializado.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con GGUF, los datos de consulta no salen de la infraestructura, lo que encaja en entornos industriales con informacion sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (3,3 GB): en torno a 4-5 GB de VRAM.
  - Q4_K_M (5,0 GB): en torno a 6-7 GB de VRAM.
  - Q5_K_M (5,8 GB): en torno a 7-8 GB de VRAM.
  - Q6_K (6,7 GB): en torno a 8-9 GB de VRAM.
  - Q8_0 (8,6 GB): en torno a 10-11 GB de VRAM.
  - f16 (16,2 GB): en torno a 18-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU consumer: si, desde Q2_K hasta Q8_0 en tarjetas de 12-16 GB; f16 requiere 24 GB o mas (RTX 3090/4090) o GPU de datacenter.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habria que usar los pesos originales del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| PetroQA-OrpoLlama-3-8B-GGUF | 8,03B | no disponible | Apache 2.0 | GGUF | QA petrolero en espanol |
| Llama 3 8B Instruct (Meta) | 8,03B | 8.192 tokens | Llama 3 Community License | safetensors, GGUF | Proposito general, multilingue |
| Mistral 7B Instruct | 7,24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Proposito general |
| Salamandra 7B (BSC) | 7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Proposito general, enfoque en lenguas ibericas |

La comparativa con Llama 3 8B Instruct es la mas directa porque PetroQA deriva de el; la diferencia clave es la especializacion vertical y el alineamiento con ORPO, a costa de un rendimiento general presumiblemente inferior. Mistral 7B y Salamandra 7B se incluyen como alternativas de tamano similar con licencia permisiva y soporte de espanol; Salamandra es la referencia mas cercana en cobertura de lenguas ibericas. No hay datos de benchmarks para establecer comparaciones cuantitativas de rendimiento.

## Limitaciones y advertencias

- Modelo de nicho: el ajuste sobre petro-qa puede degradar el rendimiento en tareas generales fuera del dominio petrolero en comparacion con el Llama 3 8B original.
- Riesgo de alucinacion: como todo modelo de 8B ajustado con datos limitados, puede generar respuestas tecnicamente plausibles pero incorrectas en un dominio donde los errores tienen consecuencias operativas; se requiere validacion humana.
- Cobertura idiomatica restringida al espanol; el rendimiento en otros idiomas no esta documentado y probablemente sea inferior al del modelo base.
- Longitud de contexto no confirmada en la informacion disponible; conviene verificar en el repositorio del modelo base antes de disenar aplicaciones con contexto largo.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3 hereda los sesgos del corpus original de Meta, no mitigados especificamente en este ajuste.
- Ausencia de quants imatrix/ponderados: solo hay cuantizaciones estaticas, lo que implica una perdida de calidad mayor en los niveles bajos (Q2_K, Q3_K_S) frente a alternativas imatrix.
- Licencia Apache 2.0 declarada, pero conviene verificar la compatibilidad con la licencia del modelo base Llama 3 (Llama 3 Community License) antes de uso comercial, ya que la cadena de licencias puede imponer condiciones adicionales.
- Popularidad muy baja (9 descargas, 0 likes): no hay validacion comunitaria ni reportes de calidad independientes.
- Sin soporte documentado de tool calling ni de modo agente; no recomendado para pipelines que dependan de function calling sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/PetroQA-OrpoLlama-3-8B-GGUF
- Modelo base: https://huggingface.co/jhonparra18/PetroQA-OrpoLlama-3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/jhonparra18/petro-qa
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#PetroQA-OrpoLlama-3-8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
