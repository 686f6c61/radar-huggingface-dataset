# mradermacher/CounselTrajLM-Qwen2.5-7B-GGUF

## Resumen

CounselTrajLM-Qwen2.5-7B-GGUF es la version cuantizada en formato GGUF del modelo CounselTrajLM-Qwen2.5-7B, desarrollado originalmente por el laboratorio UEC-InabaLab (Universidad de Electro-Comunicaciones, Japon) y cuantizado por mradermacher. Se trata de un ajuste fino de Qwen2.5-7B orientado a conversaciones de consejeria psicologica (counseling), con etiquetas que indican especializacion en trayectorias conversacionales terapeuticas. El modelo base parte de la familia Qwen2.5, una arquitectura transformer densa de 7.615.616.512 parametros (aproximadamente 7,6 mil millones).

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo especializado en dialogo de apoyo emocional en hardware de consumo, gracias a las cuantizaciones GGUF disponibles desde Q2_K (3,1 GB) hasta f16 (15,3 GB). El repositorio ocupa 68,1 GB e incluye once variantes de cuantizacion estatica. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el idioma principal declarado es el chino (zh), lo que limita su utilidad directa en castellano sin evaluacion previa.

El modelo hereda del Qwen2.5 base su ventana de contexto nativa (habitualmente 32.768 tokens en esta familia, aunque no se confirma en la informacion proporcionada para este ajuste concreto) y su tokenizador multilingue. No obstante, la model card del autor no documenta el proceso de entrenamiento especifico, los datos de consejeria utilizados ni resultados de evaluacion, por lo que esta ficha se limita a los datos verificables del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (declarado); multilingue heredado de Qwen2.5, no confirmado para el ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer denso con atencion por multi-head con RoPE, capas de normalizacion RMSNorm y proyecciones SwiGLU en el bloque feed-forward. El modelo original UEC-InabaLab/CounselTrajLM-Qwen2.5-7B es un ajuste fino (fine-tuning) sobre esa base, orientado a conversaciones de consejeria; la etiqueta "merged" en el repositorio sugiere que los pesos resultan de una fusion de adaptadores o de un merge de checkpoints, aunque el autor no detalla el procedimiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de consejeria ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion tecnica de este repositorio concreto es la cuantizacion estatica a GGUF realizada por mradermacher, que permite ejecutar el modelo con llama.cpp y derivados. Se ofrecen tambien cuantizaciones con imatrix/weighted en el repositorio hermano CounselTrajLM-Qwen2.5-7B-i1-GGUF, que suelen preservar mejor la calidad en tamanos pequenos. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en el dominio de la consejeria psicologica y el apoyo emocional.
- Dialogo multi-turno con mantenimiento de contexto, heredado de la ventana de Qwen2.5.
- Capacidades generales de Qwen2.5-7B (razonamiento, codigo, matematicas) presumiblemente preservadas, aunque no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no confirmado para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: el modelo base es multilingue, pero el ajuste declara solo chino (zh).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de chatbots de apoyo emocional en chino: el modelo puede gestionar conversaciones multi-turno de consejeria gracias a su ajuste especifico y a la ventana de contexto heredada de Qwen2.5.
- Investigacion en psicologia computacional: permite estudiar trayectorias conversacionales terapeuticas (counseltraj) en entornos controlados con hardware modesto.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (4,8 GB) se ejecuta en GPUs de consumo, facilitando pruebas sin infraestructura cloud.
- Simulacion de clientes para entrenamiento de terapeutas: genera respuestas de rol de consultante para practicas supervisadas.
- Filtrado y clasificacion de transcripciones de sesiones: puede usarse para etiquetar o resumir dialogos de consejeria en pipelines de investigacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes que permiten medir el impacto de la cuantizacion en la calidad del dialogo terapeutico.
- Integracion en aplicaciones de mensajeria con llama.cpp u Ollama: el formato GGUF permite incrustar el modelo en servicios ligeros sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~3,1 GB (Q2_K) hasta ~15,3 GB (f16); Q4_K_M requiere ~4,8 GB y Q8_0 ~8,2 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M en su totalidad; RTX 4090 o A100/H100 para f16 o Q8_0 con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB para cuantizaciones Q4/Q5 y en 12 GB o mas para Q6/Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repo original en safetensors admite transformers, vLLM y TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen2.5-7B-GGUF | 7,6 B | no disponible (heredado Qwen2.5) | Apache 2.0 | GGUF | Especializado en consejeria, solo zh declarado |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (familia) | Apache 2.0 | safetensors, GGUF | Base generalista multilingue, sin ajuste terapeutico |
| Mistral-7B-Instruct | 7,2 B | 32.768 | Apache 2.0 | safetensors, GGUF | Generalista, sin especializacion en consejeria |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community | safetensors, GGUF | Mayor contexto, licencia con restricciones de uso |

La comparativa se basa en caracteristicas publicas de los modelos; no se dispone de datos de rendimiento especificos de CounselTrajLM frente a estas alternativas.

## Limitaciones y advertencias

- El modelo esta especializado en consejeria y no debe emplearse como sustituto de atencion psicologica profesional; riesgo de respuestas inadecuadas en situaciones de crisis.
- Idioma principal declarado: chino (zh); el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de 7 B, especialmente en temas clinicos.
- No se documentan sesgos especificos ni evaluaciones de seguridad del ajuste.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del despliegue en contextos de salud recae en el integrador.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia conversacional; se recomienda Q4_K_M o superior.
- No hay informacion sobre el dataset de entrenamiento, lo que impide auditar la procedencia de los datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CounselTrajLM-Qwen2.5-7B-GGUF
- Modelo base original: https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen2.5-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/CounselTrajLM-Qwen2.5-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#CounselTrajLM-Qwen2.5-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
