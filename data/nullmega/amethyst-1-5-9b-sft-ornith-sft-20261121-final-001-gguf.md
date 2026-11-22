# Nullmega/Amethyst-1.5-9b-sft-ornith-sft-20261121-final-001-GGUF

## Resumen

Amethyst-1.5-9B es un ajuste fino supervisado (SFT) del modelo base ornith-ai/Ornith-1.5-9B, publicado por el usuario Nullmega en Hugging Face. El repositorio contiene únicamente pesos en formato GGUF cuantizado, derivados de un modelo de aproximadamente 9.200 millones de parámetros. Se trata de una variante experimental orientada a conversación, sin que el autor haya publicado datos sobre arquitectura interna, contexto o idiomas.

El modelo se distribuye en tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) y está etiquetado como compatible con endpoints, lo que sugiere su uso mediante APIs de inferencia. El autor declara únicamente entrada de texto: el proyector de visión no está incluido en los ficheros GGUF, aunque el modelo base podría disponer de capacidades multimodales.

La relevancia de esta ficha es limitada por la escasez de información verificable: no hay resultados de benchmarks, no se especifica licencia combinada y el repositorio no registra descargas. Se trata, por tanto, de un artefacto experimental de nicho cuyo interés principal es la trazabilidad de sus datos de entrenamiento y su empaquetado GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ornith-ai/Ornith-1.5-9B; arquitectura interna no declarada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base se declara MIT por su editor; las fuentes de entrenamiento tienen terminos propios y no se afirma una licencia global para el modelo derivado) |
| Formato de pesos | GGUF (cuantizado); tamano del repo 22.3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Ornith-1.5-9B (tipo de transformer, atencion, posible mezcla de expertos o mecanismos alternativos). El ajuste realizado por Nullmega es un SFT sobre la revision `489cb97981b8654bcfcf30ce1f94ed1b62e07b53` del modelo base, con estado de candidato marcado como experimental y exportacion GGUF verificada.

Los datos de entrenamiento declarados son dos conjuntos: AmL-hug/cyberforge-teacher-traj-gpt-5.4-mini (450 registros seleccionados, licencia MIT, revision `7a18846d7d57d70bcbd3724307a2bc3f9635057d`) y nvidia/Open-SWE-Traces (76 registros seleccionados, licencia CC-BY-4.0, revision `4fa4c2ae9afc6b397bc50391d43450c79993c138`). El primero parece orientado a trazas de profesor para tareas de ciberseguridad o agentes; el segundo contiene trazas de ingenieria de software. No se especifica el numero total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Entrada exclusivamente de texto en los ficheros GGUF: el proyector de vision no esta incluido.
- Ajuste orientado a trazas de agente y software engineering, a partir de los datasets de entrenamiento declarados (Open-SWE-Traces y cyberforge-teacher-traj).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (no se indican idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible; la vision queda explicitamente excluida en el empaquetado GGUF.

## Casos de uso

- Prototipado local de asistentes conversacionales: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 9.200 millones de parametros en hardware de consumo mediante llama.cpp u Ollama, con entrada solo de texto.
- Evaluacion de ajustes SFT sobre trazas de agente: el modelo sirve como banco de pruebas para medir como un SFT pequeno (526 registros en total) afecta el comportamiento del modelo base en tareas de agente.
- Generacion asistida de codigo en entornos de desarrollo: al haberse entrenado con trazas de Open-SWE-Traces, puede emplearse en tareas acotadas de resolucion de issues o edicion de codigo, siempre con validacion humana.
- Investigacion sobre procedencia de datos: el fichero `AMETHYST_PUBLIC_PROVENANCE.json` permite auditar run ID y revisiones fijadas de las fuentes, util para estudios de trazabilidad de datasets.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso tras una API de inferencia estandar, adecuado para pruebas de integracion con clientes OpenAI-compatible.
- Experimentacion con cuantizacion: comparar Q4_K_M, Q5_K_M y Q8_0 sobre el mismo checkpoint permite estudiar el degradado de calidad en tareas conversacionales y de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M en torno a 5-6 GB; Q5_K_M en torno a 6-7 GB; Q8_0 en torno a 9-10 GB (estimaciones por tamano de pesos, no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; el modelo cabe en GPUs de consumo de 8-12 GB con Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: si, con las cuantizaciones Q4_K_M y Q5_K_M en tarjetas de 8 GB o mas; Q8_0 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (etiqueta `endpoints_compatible`); vLLM y TGI no estan confirmados para este empaquetado GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amethyst-1.5-9B (este) | 9.197.093.888 | no disponible | no disponible (base MIT, fuentes propias) | GGUF | SFT experimental, solo texto |
| ornith-ai/Ornith-1.5-9B (base) | ~9.200 millones | no disponible | MIT (segun editor) | no disponible en esta ficha | Modelo base del ajuste |
| Alternativas de 9B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados para comparar rendimiento |

No se dispone de resultados de benchmarks ni de especificaciones del modelo base que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: los estados de candidato y exportacion verificada no establecen capacidad de tarea ni seguridad.
- Ausencia total de benchmarks y de datos de contexto o idiomas: no es posible evaluar su calidad antes de desplegarlo.
- Solo entrada de texto en los GGUF: el proyector de vision no esta incluido, por lo que no puede usarse para tareas multimodales.
- Licencia no resuelta: el modelo base se declara MIT, pero las fuentes de entrenamiento tienen terminos separados (MIT y CC-BY-4.0) y el autor no afirma una licencia global para el modelo derivado; el uso comercial requiere revision legal.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Tamano del corpus SFT muy reducido (526 registros seleccionados), lo que limita la generalizacion y aumenta el riesgo de sobreajuste a las trazas de entrenamiento.
- Repositorio sin descargas registradas: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Nullmega/Amethyst-1.5-9b-sft-ornith-sft-20261121-final-001-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset de entrenamiento 1: https://huggingface.co/datasets/AmL-hug/cyberforge-teacher-traj-gpt-5.4-mini
- Dataset de entrenamiento 2: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web.
