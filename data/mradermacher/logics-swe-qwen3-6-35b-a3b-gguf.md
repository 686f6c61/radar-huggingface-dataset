# mradermacher/Logics-SWE-Qwen3.6-35B-A3B-GGUF

## Resumen

Logics-SWE-Qwen3.6-35B-A3B-GGUF es una colección de cuantizaciones GGUF del modelo Logics-SWE-Qwen3.6-35B-A3B, un modelo de lenguaje especializado en ingeniería de software (software engineering) y código. El modelo base fue entrenado por Logics-MLLM mediante destilación on-policy y aprendizaje por refuerzo (reinforcement learning) con post-entrenamiento agéntico, utilizando el dataset Logics-SWE-Env-2.5K. El repositorio de cuantizaciones ha sido publicado por mradermacher, un cuantizador conocido en la comunidad de Hugging Face por sus versiones GGUF estáticas de alta calidad.

La denominación "35B-A3B" indica que se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 34,66 mil millones de parámetros totales y unos 3 mil millones de parámetros activos por token, lo que permite una inferencia muy rápida manteniendo la capacidad de un modelo grande. Su especialización en tareas agénticas de ingeniería de software lo hace relevante para desarrolladores que buscan ejecutar localmente un modelo optimizado para flujos de trabajo tipo SWE-bench, con soporte multimodal (incluye archivos mmproj).

Esta ficha cubre la versión GGUF cuantizada; la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), base Qwen3.6 |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Logics-SWE-Qwen3.6-35B-A3B, es un transformer de mezcla de expertos (MoE) derivado de la familia Qwen3.6. Con 34,7 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, la arquitectura MoE permite activar solo una fracción de la red en cada paso de decodificación, lo que se traduce en latencias y throughput comparables a los de un modelo denso de 3B, pero con la calidad de un modelo de 35B.

El entrenamiento post-base se centró en ingeniería de software agéntica: la model card indica el uso de on-policy distillation, reinforcement learning y agentic post-training sobre el dataset Logics-MLLM/Logics-SWE-Env-2.5K, un entorno de 2.500 instancias presumiblemente orientado a tareas de resolución de bugs y modificaciones de código en repositorios reales. No hay detalles publicados sobre el preentrenamiento (numero de tokens, composicion del dataset) ni sobre el uso de RLHF o DPO. La inclusion de archivos mmproj (multi-modal supplement) en las cuantizaciones sugiere que el modelo base incorpora un componente de vision.

## Capacidades

- Generacion y edicion de codigo, con especializacion en tareas de ingenieria de software tipo SWE-bench (resolucion de issues, parches, navegacion de repositorios)
- Razonamiento agéntico multi-paso, entrenado con post-training agéntico para flujos de trabajo con herramientas
- Soporte de reinforcement learning post-entrenado para tareas de codigo de larga horizon
- Componente multimodal (archivos mmproj incluidos en la cuantizacion), lo que sugiere capacidad de procesar imagenes; detalles no disponibles
- Conversacion (tag conversational en Hugging Face)
- Soporte de tool calling: no disponible explicitamente en la documentacion, aunque el entrenamiento agéntico lo hace probable
- Idioma principal: ingles

## Casos de uso

- Resolucion automatizada de bugs: el modelo puede integrarse en pipelines tipo SWE-agent para analizar issues, navegar un repositorio y proponer parches, gracias a su post-entrenamiento agéntico sobre entornos de software reales.
- Agentes de codigo con herramientas: su entrenamiento con reinforcement learning agéntico lo hace adecuado para bucles de razonamiento multi-paso con ejecucion de comandos, edicion de archivos y tests.
- Asistente de codigo local y privado: con la cuantizacion Q4_K_M (21,3 GB) cabe en una GPU consumer de 24 GB, permitiendo autocompletado y refactorizacion sin enviar codigo a la nube.
- Revision de pull requests: puede analizar diffs y describir cambios, riesgos y posibles regresiones en revisiones automatizadas de CI.
- Generacion de tests unitarios: dado un fichero o modulo, puede proponer casos de prueba orientados a cobertura de ramas y casos limite.
- Analisis multimodal de capturas o diagramas: la inclusion de mmproj sugiere uso para interpretar capturas de errores visuales o mockups junto con codigo; capacidad a confirmar.
- Prototipado rapido de agentes de ingenieria de software en local: los ~3B de parametros activos permiten latencias bajas incluso en hardware modesto para experimentacion iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - Q2_K: ~13 GB
  - Q3_K_M: ~16,9 GB
  - IQ4_XS: ~19 GB
  - Q4_K_M: ~21,3 GB
  - Q5_K_M: ~24,8 GB
  - Q6_K: ~28,6 GB
  - Q8_0: ~37 GB
  - Sumar ~0,7-1 GB si se usa el mmproj, mas VRAM para el contexto
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; RTX 5090 (32 GB) para Q5/Q6; A100/H100 40-80 GB para Q8_0 o FP16
- Consumer GPUs: si cabe en una RTX 4090 de 24 GB con Q4_K_S o Q4_K_M; con Q2_K/Q3 cabe en GPUs de 16 GB; en CPU pura es viable con Q2_K/Q3_K_S en equipos con 16-32 GB de RAM, aunque con velocidad reducida
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede desplegarse con vLLM o TGI
- Latencia y throughput: no disponibles; al ser MoE con ~3B de parametros activos, se espera una velocidad de generacion comparable a un modelo denso de 3B

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Logics-SWE-Qwen3.6-35B-A3B | 34,7 B (MoE, ~3 B activos) | no disponible | Apache 2.0 | Ingenieria de software agéntica |
| Qwen3-30B-A3B | 30,5 B (MoE, ~3 B activos) | 128 K (según ficha oficial de Qwen) | Apache 2.0 | Generalista |
| Devstral Small 24B | 24 B (denso) | 128 K (según ficha oficial) | Apache 2.0 | Ingenieria de software agéntica |

Frente a Qwen3-30B-A3B, del que deriva su arquitectura, Logics-SWE esta especializado en tareas de software y podria rendir mejor en benchmarks tipo SWE-bench, a costa de un perfil menos generalista. Frente a Devstral Small, ofrece menos parametros activos por token (potencialmente mayor velocidad), aunque sin benchmarks publicados no es posible confirmar su rendimiento relativo.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado y puede ser inferior
- No hay benchmarks publicados: la calidad real en SWE-bench u otros tests no puede verificarse con los datos disponibles
- Riesgo de alucinacion: como todo LLM, puede generar codigo incorrecto o APIs inexistentes; en flujos agénticos es imprescindible validar con tests y ejecucion real
- Sesgos: heredados del preentrenamiento de la familia Qwen3.6 y del dataset de RL; no documentados especificamente
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en codigo; se recomienda Q4_K_S o superior para uso serio
- Contexto: la longitud de ventana no esta documentada; verificarla antes de disenar flujos agénticos con repositorios grandes
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque debe respetarse el aviso de patentes y atribucion
- La version GGUF procede de un cuantizador de terceros (mradermacher); para maxima fidelidad, usar el modelo base en safetensors

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-35B-A3B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Logics-SWE-Qwen3.6-35B-A3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
