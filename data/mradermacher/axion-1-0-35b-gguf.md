# mradermacher/Axion-1.0-35B-GGUF

## Resumen

Axion-1.0-35B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Axion1-0, orientado a tareas de razonamiento cientifico, uso de herramientas (tool-use) y flujos agenticos. Con 34.660.610.688 parametros totales, se posiciona en la franja de modelos de ~35B, un tamano que equilibra capacidad y coste de despliegue. El modelo base se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en produccion comercial.

La version aqui documentada es una reproduccion en formato GGUF realizada por mradermacher, que ofrece cuantizaciones estaticas desde Q2_K hasta Q8_0, ademas de un suplemento multimodal (mmproj) en Q8_0 y f16. Esta orientada a inferencia local y despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles, y mantiene la compatibilidad con endpoints declarada por el autor.

El interes actual del modelo radica en su enfoque explicito hacia el razonamiento cientifico y la orquestacion de agentes con tool calling, capacidades cada vez mas demandadas en pipelines de automatizacion. La disponibilidad de cuantizaciones GGUF de distintos tamanos (desde 13 GB en Q2_K hasta 37 GB en Q8_0) amplia el abanico de hardware capaz de ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio original en safetensors/transformers) |

## Arquitectura y entrenamiento

Axion-1.0-35B emplea una arquitectura de tipo Mixture of Experts, segun indican las etiquetas del repositorio y la model card. No se especifica en la informacion disponible el numero de expertos, el numero de parametros activos por token ni la estrategia de enrutamiento. Tampoco se detalla la longitud de contexto nativa ni la composicion exacta del dataset de entrenamiento, aunque se referencia el conjunto Axion1-0/axion-training-data y el paper arXiv:2611.03233 como fuente tecnica.

Las etiquetas del modelo indican un enfasis en reproduction, agent, tool-use y scientific-reasoning, lo que sugiere un entrenamiento orientado a tareas de razonamiento estructurado y uso de herramientas. No se dispone de informacion sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. La version GGUF es una cuantizacion estatica del modelo base, sin imatrix ni quants ponderados disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento cientifico: el modelo esta etiquetado explicitamente para scientific-reasoning, orientado a problemas tecnicos y analisis.
- Uso de herramientas (tool calling / function calling), segun las etiquetas agent y tool-use.
- Flujos agenticos y razonamiento multi-paso, orientado a orquestacion de tareas.
- Capacidades multimodales: el repositorio incluye suplementos mmproj (Q8_0 y f16), lo que indica soporte de entrada visual en el modelo base.
- Compatibilidad con endpoints (endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- Idiomas: unicamente ingles declarado; no se garantiza soporte multilingue.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede analizar problemas tecnicos, interpretar resultados experimentales y generar hipotesis o explicaciones, aprovechando su entrenamiento especifico en scientific-reasoning.
- Agentes autonomos con tool calling: integrado en frameworks de agentes, puede decidir que herramienta invocar (APIs, calculadoras, buscadores) y encadenar pasos multi-paso para resolver tareas complejas.
- Automatizacion de pipelines de investigacion: uso como componente de analisis en flujos que requieren interpretacion de datos y generacion de informes tecnicos en ingles.
- Asistente de desarrollo con funciones: al soportar function calling, puede integrarse en entornos de CI/CD o asistentes de codigo que necesiten invocar herramientas externas y ejecutar acciones.
- Procesamiento de documentos con componente visual: gracias a los suplementos mmproj, puede emplearse en tareas que combinen texto e imagenes (por ejemplo, interpretacion de graficos o figuras cientificas) en despliegues GGUF multimodales.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (21,3 GB) y Q4_K_S (20,0 GB) permiten ejecutar el modelo en GPUs de gama alta de consumo o en configuraciones con memoria unificada, para prototipado y experimentacion.
- Servicio de inferencia ligero: la compatibilidad con endpoints y el formato GGUF facilitan su uso en servidores con llama.cpp o soluciones compatibles para atencion tecnica especializada en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~13,0 GB; Q3_K_S ~15,3 GB; Q3_K_M ~16,9 GB; Q3_K_L ~18,2 GB; Q4_K_S ~20,0 GB; Q4_K_M ~21,3 GB; Q5_K_S ~24,1 GB; Q5_K_M ~24,8 GB; Q6_K ~28,6 GB; Q8_0 ~37,0 GB. Anadir ~0,7-1,0 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: para Q8_0 y Q6_K se recomienda una GPU con 40-48 GB o superior (A100 40/80 GB, H100, RTX 6000 Ada). Para Q4_K_M y Q4_K_S, una RTX 4090 (24 GB) o similar es suficiente. Para Q2_K y Q3, GPUs de 16-24 GB.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K y posiblemente Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput estimados: no disponible. Al ser MoE, el rendimiento dependera del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Axion-1.0-35B | ~34,7B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Enfoque en razonamiento cientifico y agentes |
| Alternativas de ~30-35B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoria; los datos de rendimiento, contexto y parametros activos del modelo no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar (MMLU, HumanEval, GSM8K) es desconocido y no debe asumirse.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios cientificos donde la verificacion factual es critica.
- No se detalla el numero de parametros activos ni la longitud de contexto, lo que dificulta estimar coste de inferencia y capacidad de manejar documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- La version documentada es una reproduccion GGUF de terceros (mradermacher); no es la publicacion oficial del autor del modelo, aunque la licencia Apache 2.0 permite su redistribucion.
- No hay informacion sobre sesgos conocidos ni sobre procesos de alineamiento (RLHF/DPO), lo que impide evaluar su comportamiento en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Axion-1.0-35B-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Dataset de entrenamiento: https://huggingface.co/datasets/Axion1-0/axion-training-data
- Paper de referencia: https://arxiv.org/abs/2611.03233
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Axion-1.0-35B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
