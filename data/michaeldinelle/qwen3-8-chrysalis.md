# michaelDinelle/Qwen3.8-Chrysalis

## Resumen

Chrysalis es un paquete de pesos cuantizados en formato GGUF publicado por el usuario michaelDinelle, que empaqueta dos modelos de la familia Qwen 3.8: Qwen3.8-27B (modelo denso de 27.320.697.856 parametros) y Qwen3.8-Flash-Next (modelo con mezcla de expertos y bloque MTP). El repositorio no contiene pesos originales ni entrenamiento propio: es un trabajo de cuantizacion con mezcla de precisiones por capa, orientado a inferencia local eficiente en GPUs de consumo y Apple Silicon.

La relevancia del artefacto esta en su estrategia de cuantizacion selectiva: usa IQ4_XS para el grueso de los pesos, pero reserva Q6_K para las capas sensibles y Q8_0 para las matrices K/V y la cabeza MTP del modelo de 27B. En Flash-Next aplica Q6_K/Q8_0 a las partes densas, IQ4_XS e IQ4_NL a los expertos mas activados y Q3_K/Q2_K al bloque MTP, lo que reduce el peso del modelo a 63,4 GB. El autor publica comparativas propias de velocidad y error frente a Q8_0 en RX 7900 XTX, RTX 3090 y M4 Max.

El repositorio incluye ademas los torres de vision (`mmproj.gguf`, 0,9 GB por modelo), tokenizer y plantilla de chat compartidos, y un runtime de inferencia propio alojado en GitHub (`chrysalis-inference`). La licencia es mixta: Apache-2.0 para Qwen3.8-27B y Qwen Community License 1.0 para Qwen3.8-Flash-Next.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cuantizacion mixta por capa; Flash-Next incorpora mezcla de expertos (MoE) y bloque MTP |
| Parametros totales | 27.320.697.856 (Qwen3.8-27B); Flash-Next no disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS, Q6_K, Q8_0 (27B); Q6_K, Q8_0, IQ4_XS, IQ4_NL, Q3_K, Q2_K (Flash-Next) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (Qwen3.8-27B) y Qwen Community License 1.0 (Qwen3.8-Flash-Next) |
| Formato de pesos | GGUF (con `mmproj.gguf` separado para vision) |

## Arquitectura y entrenamiento

Chrysalis no entrena ningun modelo: es una distribucion de pesos cuantizados sobre dos checkpoints base de Qwen. El modelo principal, Qwen3.8-27B, es un transformer denso de 27.320.697.856 parametros segun los safetensors del repo base. La cuantizacion no es uniforme: el autor aplica IQ4_XS al cuerpo principal, Q6_K a las capas identificadas como sensibles y Q8_0 a las matrices de atencion K/V y a la cabeza MTP (multi-token prediction). Esta mezcla busca preservar la calidad en los puntos donde la cuantizacion agresiva degrada mas la perplejidad, a costa de un tamano final de 15,9 GB.

El segundo modelo, Qwen3.8-Flash-Next, es una variante con mezcla de expertos y bloque MTP. Su cuantizacion es mas agresiva y jerarquica: Q6_K/Q8_0 para las capas densas, IQ4_XS e IQ4_NL para los expertos mas utilizados, y Q3_K/Q2_K para el bloque MTP. El resultado ocupa 63,4 GB. El autor menciona el uso de `imatrix` (matrices de importancia) como parte del pipeline de cuantizacion, lo que explica la asignacion no uniforme de bits por tensor. No se detalla el dataset de calibracion, el numero de tokens de entrenamiento original ni si los modelos base usaron RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento y codigo: la model card muestra un ejemplo de Qwen3.8-Flash-Next generando una escena voxel en JavaScript ejecutada en navegador.
- Vision: cada modelo incluye su propia torre visual en `mmproj.gguf` (0,9 GB), lo que habilita entrada de imagenes.
- Prediccion multi-token (MTP): ambos checkpoints incorporan cabeza MTP, cuantizada aparte para no degradarla.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs de inferencia tipo OpenAI.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling y uso como agente: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: el GGUF de 27B en 15,9 GB cabe en una RTX 3090 (24 GB) o RX 7900 XTX (24 GB) dejando margen para contexto y torre visual; util para prototipado sin coste de API.
- Despliegue en Apple Silicon: el autor publica metricas en M4 Max, por lo que el modelo esta pensado para ejecutarse en memoria unificada de equipos Apple con el runtime Chrysalis.
- Asistentes conversacionales con vision: al incluir `mmproj.gguf` por modelo, se puede montar un chatbot que reciba capturas o documentos escaneados y responda en texto.
- Generacion de codigo interactiva: el ejemplo de la pagoda voxel en navegador demuestra uso para generar aplicaciones pequenas de front-end a partir de una descripcion.
- Evaluacion de tecnicas de cuantizacion: el repo sirve como referencia practica de cuantizacion mixta con imatrix, comparando error frente a Q8_0 en tres aceleradores.
- Sustitucion de llama.cpp/MLX en pipelines existentes: el autor publica comparativas directas de time-to-first-token y velocidad de escritura frente a ambas herramientas, lo que permite decidir si migrar el runtime.
- Experimentacion con MoE local: Flash-Next en 63,4 GB puede ejecutarse en estaciones con 64-96 GB de VRAM o memoria unificada, un rango antes reservado a modelos densos de menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica graficas de rendimiento de inferencia (time to first token, velocidad de escritura, error frente a Q8_0, tiempo de carga y memoria) en RX 7900 XTX, RTX 3090 y M4 Max, sin cifras numericas en el texto extraido.

## Requisitos de hardware

- Qwen3.8-27B en Chrysalis: 15,9 GB de pesos mas 0,9 GB de torre visual; VRAM estimada de 18-20 GB con contexto moderado en Q8_0 para K/V.
- Qwen3.8-Flash-Next en Chrysalis: 63,4 GB de pesos mas 0,9 GB de torre visual; requiere 64-80 GB de VRAM o memoria unificada.
- GPU verificadas por el autor: RX 7900 XTX (24 GB), RTX 3090 (24 GB) y Apple M4 Max.
- Cabe en GPU de consumo: el 27B si (RTX 3090, 4090 con 24 GB, RX 7900 XTX); Flash-Next no en GPU de consumo de 24 GB.
- Opciones de despliegue: runtime propio `chrysalis-inference`; el formato GGUF es compatible con llama.cpp y derivados (Ollama, LM Studio) de forma generica, aunque el autor compara contra llama.cpp como alternativa.
- Latencia y throughput: no disponibles como cifras; solo se publican graficas comparativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chrysalis (Qwen3.8-27B) | 27,3 B | No disponible | Apache-2.0 | GGUF mixto | Cuantizacion selectiva IQ4_XS/Q6_K/Q8_0, 15,9 GB |
| Qwen3.8-27B original | 27,3 B | No disponible | Apache-2.0 | Safetensors | Pesos sin cuantizar, referencia de calidad |
| Chrysalis (Qwen3.8-Flash-Next) | No disponible | No disponible | Qwen Community 1.0 | GGUF mixto | MoE con MTP, 63,4 GB |
| llama.cpp / MLX (mismo modelo base) | 27,3 B | No disponible | Segun base | GGUF / MLX | Runtime alternativo comparado por el autor |

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier mejora o degradacion frente al base proviene exclusivamente de la cuantizacion.
- La cuantizacion mixta introduce error respecto a Q8_0; el autor lo mide pero no publica cifras en el texto, solo graficas.
- Flash-Next usa Q3_K/Q2_K en el bloque MTP, lo que puede degradar la prediccion multi-token frente al checkpoint original.
- Licencia mixta: el 27B es Apache-2.0, pero Flash-Next esta bajo Qwen Community License 1.0, con posibles restricciones para uso comercial; revisar el texto completo antes de produccion.
- El repositorio tiene 499 descargas y 1 like, con fecha de creacion en 2026: ecosistema muy reciente y poca validacion comunitaria.
- No hay informacion sobre sesgos, idiomas soportados, contexto maximo ni alucinacion; no disponible.
- Dependencia de un runtime propio (`chrysalis-inference`) para reproducir las metricas del autor; el comportamiento en llama.cpp puede diferir.

## Enlaces

- Hugging Face: https://huggingface.co/michaelDinelle/Qwen3.8-Chrysalis
- Repositorio del runtime: https://github.com/michaelDinelle/chrysalis-inference
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Perfil del autor en X: https://x.com/michaeldinelle
- Apoyo al autor: https://ko-fi.com/michaeldinelle
