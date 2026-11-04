# qvac/MedPsy-4B-GGUF

## Resumen

MedPsy-4B-GGUF es la distribucion en formato GGUF del modelo MedPsy-4B, un modelo de lenguaje causal de 4.411.424.256 parametros desarrollado por Tether AI Research y especializado en dominio medico y clinico. El modelo base emplea como backbone Qwen3-4B-Thinking-2507 y ha sido afinado para tareas de salud, con un enfasis explicito en el despliegue en el borde (edge) y la inferencia completamente local mediante llama.cpp y el SDK QVAC.

El repositorio incluye un fichero BF16 GGUF sin cuantizar (8,83 GB) junto con siete variantes cuantizadas de llama.cpp, desde Q8_0 casi sin perdida (4,69 GB) hasta IQ3_XXS ultracompacto (1,84 GB). Esta gradacion permite desplegar el mismo modelo en estaciones de trabajo, portatiles y dispositivos moviles de gama alta, manteniendo en las variantes sub-8 bits una calibracion con importance matrix (imatrix) que reduce la degradacion de calidad.

El modelo se describe en el articulo de NeurIPS 2026 "MedPsy: State-of-the-Art Small Medical Language Models for Efficient Edge Deployment" (arXiv:2611.02011) y se publica bajo licencia Apache 2.0, lo que facilita su uso comercial. Su relevancia actual radica en la combinacion de un tamano contenido (4B), un contexto heredado de la familia Qwen3 y un formato de pesos directamente consumible por herramientas de inferencia local ampliamente adoptadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (backbone Qwen3-4B-Thinking-2507), pesos en formato GGUF cuantizado |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XXS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base qvac/MedPsy-4B se distribuye en safetensors |
| Herramienta de cuantizacion | llama.cpp |
| Calibracion imatrix | No en Q8_0; si en todas las variantes sub-8 bits |
| Tamano del repositorio | 28,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

MedPsy-4B es un transformer causal decoder-only de 4.411.424.256 parametros construido sobre el backbone Qwen3-4B-Thinking-2507, un modelo de la familia Qwen3 con modo de razonamiento explicito. El modelo base ha sido afinado por Tether AI Research para el dominio medico y clinico; la model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en la informacion proporcionada.

La innovacion tecnica principal de esta publicacion no reside en la arquitectura del modelo, sino en el pipeline de cuantizacion. Todas las variantes sub-8 bits se han calibrado con importance matrix (imatrix), que segun el autor reduce de forma consistente la degradacion de calidad; Q8_0 se publica sin imatrix porque no aportaba beneficio medible a 8 bits. El informe tecnico (seccion 4.7) documenta la metodologia completa, incluida la comparacion entre K-quants e I-quants y un ablation de imatrix por numero de bits. El fichero BF16 GGUF es una conversion sin cuantizacion: conserva la precision BF16 del checkpoint original y, aunque no se ha reevaluado por separado con llama.cpp, se espera un rendimiento equivalente al del modelo fuente evaluado con vLLM.

## Capacidades

- Generacion de texto en ingles con enfasis en contenido medico, sanitario y clinico.
- Razonamiento explicito heredado del backbone Qwen3-4B-Thinking-2507 (modo thinking).
- Respuesta a preguntas de opcion multiple de tematica sanitaria (el modelo se evalua con suites de benchmark cerradas de medicina).
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Inferencia totalmente local y on-device mediante llama.cpp y el SDK QVAC.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo detras de una API compatible con el estandar de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Triaje clinico asistido en entornos con conectividad limitada: el modelo puede ejecutarse integramente en un portatil o dispositivo movil de gama alta usando la variante Q4_K_M (2,72 GB) o IQ3_M (2,13 GB), lo que permite desplegar asistencia sanitaria en zonas sin acceso estable a la nube y sin enviar datos de pacientes a servidores externos.
- Formacion y apoyo a personal sanitario: con la variante Q5_K_M (3,16 GB, solo -0,29 puntos de AVG Score frente a BF16) se obtiene una calidad practicamente indistinguible del modelo sin cuantizar para consultas de repaso de conocimientos clinicos y explicacion de conceptos medicos.
- Respuesta a cuestionarios de evaluacion medica: el modelo se ha evaluado especificamente con suites de benchmark cerradas de medicina (HealthBench Overall y Closed-Ended Average), por lo que es adecuado para generar respuestas razonadas a preguntas de opcion multiple en contextos educativos.
- Procesamiento de documentacion clinica en local: al ejecutarse con llama.cpp sobre hardware propio, permite resumir y estructurar notas clinicas en entornos donde la normativa de proteccion de datos impide el envio de informacion a servicios de terceros.
- Integracion en aplicaciones moviles de salud: el SDK QVAC y el formato GGUF permiten incrustar el modelo en apps nativas; la variante IQ3_M (2,13 GB) es la opcion compacta recomendada para presupuestos de memoria ajustados.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q8_0 (4,69 GB) ofrece calidad estadisticamente indistinguible del BF16 con la mitad de tamano, adecuada para servidores de desarrollo o portatiles con CPU moderna y suficiente RAM.
- Prototipado rapido de asistentes medicos: la compatibilidad con endpoints permite levantar un servicio compatible con la API de HuggingFace sobre llama.cpp, facilitando la integracion en pipelines existentes sin reescribir el codigo de cliente.

## Benchmarks y rendimiento

El autor publica la degradacion de calidad de cada variante cuantizada respecto al modelo BF16 evaluado con vLLM, medida como AVG Score (media de HealthBench Overall y Closed-Ended Average). No se proporcionan en la informacion disponible los valores absolutos de MMLU, HumanEval, GSM8K ni de los benchmarks medicos individuales.

| Variante | Formato | Imatrix | Tamano | Delta AVG (pts) | Delta AVG (rel %) |
|---|---|---|---|---|---|
| medpsy-4b-bf16.gguf | BF16 | n/a | 8,83 GB | ≈0,00 | ≈0,00% |
| medpsy-4b-q8_0.gguf | Q8_0 | no | 4,69 GB | -0,15 | -0,20% |
| medpsy-4b-q5_k_m-imat.gguf | Q5_K_M | si | 3,16 GB | -0,29 | -0,40% |
| medpsy-4b-q4_k_m-imat.gguf | Q4_K_M | si | 2,72 GB | -0,81 | -1,12% |
| medpsy-4b-iq4_nl-imat.gguf | IQ4_NL | si | 2,60 GB | -1,02 | -1,41% |
| medpsy-4b-iq4_xs-imat.gguf | IQ4_XS | si | 2,48 GB | -1,08 | -1,49% |
| medpsy-4b-iq3_m-imat.gguf | IQ3_M | si | 2,13 GB | -1,50 | -2,07% |
| medpsy-4b-iq3_xxs-imat.gguf | IQ3_XXS | si | 1,84 GB | -5,56 | -7,69% |

El autor desaconseja explicitamente IQ3_XXS por la degradacion significativa que introduce. No se han publicado en la informacion disponible resultados absolutos de benchmarks frente a modelos comparables.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 1,84 GB (IQ3_XXS, no recomendado) y 8,83 GB (BF16). Para la mayoria de usos, Q4_K_M requiere unos 2,72 GB de pesos mas la memoria del contexto y del runtime de llama.cpp.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo esta disenado para inferencia en el borde, por lo que no se especifican GPU de centro de datos.
- Cabe en GPU de consumo: si; con Q4_K_M (2,72 GB) o IQ3_M (2,13 GB) es viable en tarjetas con 4 GB o mas de VRAM, y con Q8_0 (4,69 GB) en tarjetas de 6-8 GB.
- Cabe en dispositivos moviles de gama alta: si, segun el autor, con las variantes de 3 y 4 bits (IQ3_M de 2,13 GB es la opcion compacta recomendada).
- Opciones de despliegue: llama.cpp (herramienta de referencia del repositorio), SDK QVAC (qvac.tether.io/dev/sdk) y servidores compatibles con endpoints de HuggingFace. vLLM, TGI y Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-4B-GGUF | 4,41B | no disponible | Apache 2.0 | GGUF | Afinado para dominio medico, 8 variantes de cuantizacion con imatrix |
| MedPsy-1.7B-GGUF (misma familia) | no disponible | no disponible | Apache 2.0 | GGUF | Variante reducida de la misma familia, orientada a presupuestos de memoria aun mas ajustados |
| Qwen3-4B-Thinking-2507 (backbone) | 4B (aproximado) | no disponible | no disponible en la informacion | safetensors | Modelo generalista sobre el que se construye MedPsy-4B; no especializado en medicina |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de MedPsy-4B con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es un modelo especializado en dominio medico, pero no sustituye el juicio clinico profesional; no debe usarse como herramienta de diagnostico autonomo sin supervision humana.
- Riesgo de alucinacion: no se documentan en la informacion proporcionada tasas de alucinacion ni mecanismos de mitigacion especificos.
- La variante IQ3_XXS presenta una degradacion de -5,56 puntos (-7,69% relativo) en AVG Score y el autor la desaconseja explicitamente.
- El fichero BF16 GGUF no se ha reevaluado por separado con llama.cpp; su equivalencia con el modelo fuente evaluado con vLLM es una expectativa del autor, no una medicion directa.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento normativo sanitario aplicable (por ejemplo, requisitos de dispositivos medicos) antes de desplegarlo en produccion.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos demograficos o clinicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qvac/MedPsy-4B-GGUF
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Variante 1.7B: https://huggingface.co/qvac/MedPsy-1.7B
- Variante 1.7B GGUF: https://huggingface.co/qvac/MedPsy-1.7B-GGUF
- Coleccion MedPsy: https://huggingface.co/collections/qvac/medpsy
- Articulo NeurIPS 2026: https://arxiv.org/abs/2611.02011
- Codigo: https://github.com/tether-ai-research/qvac-medpsy
- Informe tecnico: https://huggingface.co/blog/qvac/medpsy
- llama.cpp: https://github.com/ggml-org/llama.cpp
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tether AI Research: https://tether.io/
