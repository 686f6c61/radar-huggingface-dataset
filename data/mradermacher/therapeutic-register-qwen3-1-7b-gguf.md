# mradermacher/therapeutic-register-qwen3-1.7b-GGUF

## Resumen

Therapeutic-register-qwen3-1.7b-GGUF es una colección de cuantizaciones GGUF del modelo locriani/therapeutic-register-qwen3-1.7b, un ajuste fino mediante QLoRA sobre Qwen3-1.7B orientado a la generación de texto con registro terapeutico en ingles. El modelo base es un transformer denso de 1.720.574.976 parametros (1,72 mil millones) desarrollado por Alibaba Qwen, y este ajuste concreto lo ha publicado el usuario locriani; las cuantizaciones las ha producido mradermacher, conocido por generar versiones GGUF de modelos comunitarios.

El interes del modelo radica en su especializacion: no es un modelo generalista, sino un fine-tune entrenado sobre el dataset locriani/therapeutic-register-data para reproducir un registro conversacional propio de contextos terapeuticos (escucha activa, reformulacion, validacion emocional). Al estar cuantizado en GGUF, puede ejecutarse en CPU y en GPU de consumo con llama.cpp u Ollama, lo que lo hace accesible para prototipos de investigación en hardware modesto.

La relevancia es limitada pero concreta: para quien investigue ajuste fino de modelos pequenos en dominios conversacionales especializados, ofrece un caso reproducible con licencia Apache 2.0, pesos abiertos y una bateria de cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,5 GB). El repo ocupa 16 GB en total por acumular todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino QLoRA con LoRA fusionado |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso con atención estándar de la familia Qwen3. Sobre el se aplico un ajuste fino QLoRA (cuantizacion del modelo base durante el entrenamiento y adaptadores de bajo rango) y posteriormente se fusionaron los pesos LoRA en el modelo final, segun indican las etiquetas `qlora` y `lora-merged` del repositorio. El dataset de entrenamiento es locriani/therapeutic-register-data, un corpus en ingles orientado a reproducir el registro conversacional terapeutico.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco hay datos sobre innovaciones tecnicas adicionales (decodificacion especulativa, atención lineal, etc.). El trabajo de mradermacher se limita a la conversion y cuantizacion estatica a GGUF; no se han publicado cuantizaciones ponderadas/imatrix para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilistico terapeutico (reformulacion, validacion, preguntas abiertas).
- Conversacion multi-turno: el pipeline declarado es conversacional.
- Razonamiento basico y generacion de texto general heredados de Qwen3-1.7B, aunque el ajuste fino puede haber desplazado la distribucion hacia el dominio terapeutico.
- Soporte de tool calling / function calling: no disponible de forma verificada en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre ajuste fino de dominio: el modelo sirve como caso de estudio reproducible para evaluar como un QLoRA sobre 1,7B parametros modifica el estilo conversacional, comparando respuestas con el Qwen3-1.7B original.
- Prototipado de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (1,2 GB) puede desplegarse en un portatil para experimentar con respuestas de estilo terapeutico antes de invertir en modelos mayores.
- Generacion de datos sinteticos de entrenamiento: util para producir dialogos con registro terapeutico que alimenten pipelines de ajuste de modelos mas grandes, siempre con revision humana.
- Evaluacion de cuantizaciones: la bateria de 12 variantes permite medir la degradacion de calidad (perplejidad, coherencia estilistica) entre Q2_K y Q8_0 en una tarea concreta de dominio.
- Educacion y simulacion de entrevistas: en entornos controlados y con supervision, puede generar turnos de practica para estudiantes de psicologia o comunicación, dado su registro especializado y su bajo coste de inferencia.
- Despliegue en dispositivos de borde: con Q2_K (0,9 GB) o Q3_K_S (1,0 GB) cabe en Raspberry Pi 5 con 8 GB de RAM o en telefonos de gama alta via llama.cpp, para demos offline.
- Analisis de sesgos en texto terapeutico: permite estudiar que estereotipos o patrones de lenguaje aparecen cuando se ajusta un modelo pequeno con datos de este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con Q4_K_M; 2,0-2,5 GB con Q8_0; 3,5-4,0 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para f16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente. Para cuantizaciones bajas basta una GTX 1650 o integrada con suficiente RAM compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF no.
- Latencia y throughput: no disponibles de forma oficial; por tamano, en una RTX 4090 se espera un throughput muy alto (cientos de tokens por segundo) y en CPU moderna decenas de tokens por segundo con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| therapeutic-register-qwen3-1.7b | 1,72B | no disponible | Registro terapeutico (en) | Apache 2.0 | GGUF, safetensors |
| Qwen3-1.7B (base) | 1,72B | no disponible | Generalista multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Generalista instruct | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 tokens | Generalista instruct | Llama 3.2 Community | safetensors, GGUF |

Frente al Qwen3-1.7B original, este ajuste gana especializacion estilistica pero probablemente pierde capacidades generales y multilingues. Frente a Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct, ofrece un nicho muy concreto (registro terapeutico) que los generalistas no cubren, a costa de menor versatilidad y de un contexto no documentado.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como `research`; no esta validado para uso clinico ni terapeutico real.
- Riesgo de alucinacion: al ser un modelo de 1,7B ajustado en un dominio sensible, puede generar afirmaciones plausibles pero incorrectas sobre salud mental.
- Sesgos: el dataset de entrenamiento no esta documentado en composicion ni procedencia, por lo que no se pueden evaluar sesgos de genero, culturales o diagnosticos.
- Idioma: solo ingles; no se garantiza un comportamiento adecuado en castellano.
- Contexto: no se ha publicado la longitud de contexto soportada, lo que dificulta planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el uso en contextos de salud mental requiere supervision profesional y cumplimiento normativo (MDR, FDA, etc.), responsabilidad del desplegador.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan la coherencia; para producción conviene Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad optima por tamano.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/therapeutic-register-qwen3-1.7b-GGUF
- Modelo base ajustado: https://huggingface.co/locriani/therapeutic-register-qwen3-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/locriani/therapeutic-register-data
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#therapeutic-register-qwen3-1.7b-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
