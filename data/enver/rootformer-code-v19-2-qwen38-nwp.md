# enver/rootformer-code-v19.2-qwen38-nwp

## Resumen

Rootformer-Code v19.2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, un transformer denso de 27.781 millones de parametros, publicado por el usuario enver en Hugging Face. El modelo esta orientado a generacion de codigo, ingenieria de software y flujos agenticos, y se distribuye en BF16 con pesos compatibles con vLLM. Su propuesta diferencial es la incorporacion de algoritmos de gramatica arabe clasica y razonamiento legal islamico (usul al-fiqh) formalizados en un dataset companero, aplicados como tecnicas de decodificacion y adjudicacion durante la inferencia.

El autor reporta mejoras marginales en modo "weight-only" (466/615 frente a 462/615 del base) y mejoras mas sustanciales cuando se aplica su runtime propietario de dos fases denominado Qat' al-Waswasa, que limita el presupuesto de tokens dentro de la etiqueta de razonamiento para evitar truncamientos. Con ese runtime, el autor declara 518/627 tareas resueltas.

La relevancia actual del modelo es limitada: se trata de una publicacion con 33 descargas, sin likes, sin resultados de benchmarks independientes y con un modelo base cuya existencia no esta confirmada en fuentes publicas verificables. La ficha se limita a reflejar los datos declarados por el autor, marcando explicitamente lo que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B; tag `qwen3_5` en el repo) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 publicado; FP8 usado por el autor en sus evaluaciones con vLLM; no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (en), arabe (ar), codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), compatible con vLLM y transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base Qwen/Qwen3.8-27B, un transformer denso de 27,78 mil millones de parametros. El autor declara que el 99,97 % de los parametros son identicos bit a bit al modelo oficial, lo que sugiere un ajuste muy conservador sobre los pesos originales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado.

La innovacion tecnica declarada no reside en el entrenamiento sino en el runtime de inferencia. El autor describe dos mecanismos: (1) Qat' al-Waswasa, una decodificacion en dos fases que limita el presupuesto de pensamiento (1600-2200 tokens), cierra deterministicamente la etiqueta de razonamiento si se agota el presupuesto y fuerza la generacion de codigo tras ella, apoyandose en el prefix caching de vLLM; y (2) NWP-v2, un esquema de adjudicacion simetrica que ejecuta un juez en orden directo e inverso sobre clusters de comportamiento y solo acepta cambios de veredicto cuando ambos ordenes coinciden. Estos metodos se inspiran, segun el autor, en algoritmos gramaticales arabes clasicos y de usul al-fiqh formalizados en el dataset enver/KhalilAlgoWorks.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, evaluada por el autor sobre HumanEval+, MBPP+ y BigCodeBench-Hard.
- Razonamiento multi-paso con modo de pensamiento explicito (etiquetas de razonamiento en la plantilla de chat).
- Soporte de tool calling y function calling: el autor menciona endpoints compatibles y flujos agenticos, aunque no detalla la interfaz concreta.
- Capacidades agenticas: el autor reporta 12/12 en su suite TurathAgent-Hard-12, orientada a tareas de agente sobre repositorios con suites de pytest.
- Procesamiento de texto e imagen a texto (tag `image-text-to-text` en el repo), aunque no se detalla la naturaleza de la entrada visual.
- Capacidades multilingues limitadas a ingles, arabe y codigo.
- Razonamiento sobre gramatica arabe clasica y algoritmos de razonamiento legal islamico, segun el autor.
- Prediccion de siguiente token de codigo (next-codewazn-prediction) como capacidad declarada.

## Casos de uso

- Generacion de codigo en produccion con vLLM: el modelo se publica en BF16 listo para vLLM y el autor reporta 91,46 % en HumanEval+ en modo single-shot con su runtime de dos fases, lo que lo hace candidato para pipelines de generacion de funciones y tests unitarios.
- Asistentes de codigo con razonamiento controlado: el mecanismo Qat' al-Waswasa limita el presupuesto de pensamiento, lo que reduce el riesgo de truncamiento en tareas donde el modelo tiende a divagar; util en entornos con latencia acotada.
- Agentes de ingenieria de software sobre repositorios reales: el autor declara 12/12 en TurathAgent-Hard-12, un escenario de tareas con suites de pytest reales, adecuado para automatizacion de parches y correccion de bugs.
- Procesamiento de texto en arabe con matices gramaticales: el ajuste incorpora algoritmos de gramatica arabe clasica, lo que puede aprovecharse en herramientas de analisis morfologico o correccion linguistica.
- Evaluacion y adjudicacion de respuestas de codigo: el esquema NWP-v2 puede reutilizarse como juez simetrico para comparar candidatos generados por otros modelos en pipelines de seleccion.
- Prototipado de asistentes conversacionales bilingues (ingles/arabe) con contexto de codigo: el modelo acepta conversaciones multi-turno, aunque no se especifica la longitud de contexto soportada.
- Investigacion sobre tecnicas de decodificacion: el runtime de dos fases y la adjudicacion simetrica son mecanismos reproducibles que pueden estudiarse con independencia del modelo.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor, medidos con vLLM 0.34.0 en FP8 sobre H100 80 GB. No hay verificacion independiente.

| Modelo y modo | TurathCode-40 | HumanEval+ (164) | MBPP+ (378) | BCB-Hard (33) | Total 615 |
|---|---:|---:|---:|---:|---:|
| Qwen3.8-27B base, Fast Pass@1 | 25/40 (62,50 %) | 142/164 (86,59 %) | 284/378 (75,13 %) | 11/33 (33,33 %) | 462/615 (75,12 %) |
| Rootformer v18.7, weight-only | 27/40 (67,50 %) | 143/164 (87,20 %) | 285/378 (75,40 %) | 11/33 (33,33 %) | 466/615 (75,77 %) |
| Rootformer v19.2, Qat'-xhigh single-shot | 29/40 (72,50 %) | 150/164 (91,46 %) | 306/378 (80,95 %) | no disponible | 495/615 (80,49 %) |
| Rootformer v19.2, runtime NWP-v2 | 37/40 (92,50 %) | 148/164 (90,24 %) | 311/378 (82,28 %) | no disponible | 506/615 (82,28 %) |

El autor reporta ademas 12/12 en TurathAgent-Hard-12, lo que eleva el total a 518/627 (82,62 %). Estos resultados no han sido reproducidos por terceros y deben tratarse como declaraciones del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 80 GB o multi-GPU.
- VRAM estimada en FP8: alrededor de 28 GB para pesos, mas cache KV; cabe en una H100 80 GB con margen amplio y en GPUs de 40-48 GB con contexto moderado.
- GPUs recomendadas: H100 80 GB (la usada por el autor), A100 80 GB, y en general GPUs con 80 GB o mas para BF16.
- No cabe en GPUs de consumo en BF16. En cuantizaciones de 4 bits (no publicadas por el autor) podria caber en una RTX 4090 de 24 GB, pero requeriria conversion manual a GGUF o AWQ/GPTQ.
- Opciones de despliegue: vLLM (soporte declarado y usado por el autor), transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rootformer-Code v19.2 | 27,78 B | no disponible | Apache 2.0 | Hugging Face, 33 descargas | Fine-tune de Qwen3.8-27B con runtime propio |
| Qwen/Qwen3.8-27B (base) | 27 B (declarado) | no disponible | no disponible | Referenciado por el autor | Base del fine-tune; no verificado en fuentes publicas |
| Qwen2.5-Coder-32B | 32,5 B | 131.072 tokens | Apache 2.0 | Ampliamente disponible | Alternativa consolidada para codigo, con benchmarks publicos |
| DeepSeek-Coder-V2-Lite | 15,7 B (2,4 B activos) | 128.000 tokens | DeepSeek License | Ampliamente disponible | MoE; menor huella de VRAM en inferencia |

La comparacion con Qwen2.5-Coder-32B y DeepSeek-Coder-V2-Lite es orientativa por categoria y tamano; no se dispone de evaluaciones cruzadas en el mismo harness.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor, sin verificacion independiente ni repositorio de evaluacion publico accesible en la informacion disponible.
- El modelo base Qwen/Qwen3.8-27B no aparece confirmado en fuentes publicas verificables; parte de las cifras de comparacion dependen de su existencia y comportamiento.
- El rendimiento superior depende en gran medida del runtime propietario (Qat' al-Waswasa y NWP-v2), no solo de los pesos; el propio autor reporta solo +4 tareas sobre el base en modo weight-only.
- El autor reconoce un fallo en BigCodeBench-Hard: el juez de 27B comparte los mismos puntos ciegos de interpretacion de especificaciones que el generador, lo que limita la fiabilidad en docstrings ambiguos.
- Riesgo de alucinacion en codigo y en razonamiento legal o gramatical; no hay evaluaciones de sesgo ni de robustez.
- Cobertura linguistica limitada a ingles, arabe y codigo; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de repositorio completo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica sin SLA.
- El repositorio tiene 33 descargas y 0 likes, lo que indica una adopcion practicamente nula y ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enver/rootformer-code-v19.2-qwen38-nwp
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset companero: https://huggingface.co/datasets/enver/KhalilAlgoWorks
- Space de demostracion: https://huggingface.co/spaces/enver/rootformer-code-v19-2-showcase
