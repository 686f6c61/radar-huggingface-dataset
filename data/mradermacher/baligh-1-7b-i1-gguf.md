# mradermacher/Baligh-1.7B-i1-GGUF

## Resumen

Baligh-1.7B-i1-GGUF es la distribucion en formato GGUF del modelo Baligh-1.7B, un modelo de lenguaje de 1.720.574.976 parametros desarrollado por Kandil7 y cuantizado por mradermacher. El modelo base parte de la arquitectura Qwen3 y ha sido sometido a un proceso de continued-pretraining sobre corpus arabes, seguido de instruction-tuning mediante QLoRA. Su proposito es ofrecer un modelo compacto especializado en arabe y en dominio islamico, con capacidad de generar texto y responder a instrucciones en arabe e ingles.

La relevancia de esta ficha reside en que el repositorio original solo distribuye pesos en safetensors, mientras que esta variante proporciona 25 cuantizaciones GGUF con tecnicas imatrix (importancia matricial) que permiten ejecutar el modelo en hardware de consumo. Los tamanos van desde 0,6 GB (i1-IQ1_S) hasta 1,5 GB (i1-Q6_K), lo que lo hace viable en GPUs con 4 GB de VRAM o incluso en CPU.

El modelo se entrena sobre datasets arabes como ArabicWeb24, ArabicText-Large, TheArabicPile_Dialects, CIDAR, evol-instruct-arabic e islamweb-fatwa-ar. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta relevante para aplicaciones de atencion al cliente, procesamiento de documentos arabes y asistentes especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3 (según tag del repositorio) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repositorio | 21,6 GB (incluye todas las cuantizaciones) |
| Modelo base | Kandil7/Baligh-1.7B |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo base Baligh-1.7B emplea una arquitectura transformer decoder-only derivada de Qwen3, segun la etiqueta `qwen3` del repositorio. Con 1.720.574.976 parametros, se situa en la categoria de modelos pequenos, disenados para inferencia eficiente. El proceso de entrenamiento descrito en las etiquetas incluye continued-pretraining sobre corpus arabes (ArabicWeb24, ArabicText-Large, TheArabicPile_Dialects, CIDAR) y posteriormente instruction-tuning mediante QLoRA, con un dataset adicional de fatwas islamicas (islamweb-fatwa-ar) y un conjunto de instrucciones en arabe (evol-instruct-arabic).

No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni la presencia de fases de RLHF o DPO. La innovacion tecnica principal de esta distribucion es el uso de cuantizaciones imatrix (importancia matricial), que ponderan la cuantizacion en funcion de la relevancia de cada peso, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamano. El repositorio incluye tambien un fichero imatrix independiente para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto en arabe e ingles, con especializacion en dominio islamico (fatwas, textos religiosos).
- Razonamiento y respuesta a instrucciones gracias al instruction-tuning con QLoRA.
- Procesamiento de lenguaje natural en arabe dialectal y estandar, segun los datasets de entrenamiento (TheArabicPile_Dialects).
- Capacidad de continuacion de texto y generacion condicionada por prompt.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a arabe e ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Ejecucion en CPU y GPU mediante llama.cpp y compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe estandar y dialectal, gracias a su entrenamiento sobre corpus arabes diversos. Su tamano compacto permite desplegarlo en servidores modestos con latencia baja.
- Generacion de contenido religioso islamico: entrenado con islamweb-fatwa-ar, puede asistir en la redaccion de respuestas sobre jurisprudencia islamica, aunque requiere supervision humana por el riesgo de alucinacion en materia doctrinal.
- Procesamiento de documentos arabes: util para resumir, extraer informacion o clasificar textos en arabe en pipelines de back-office, ejecutandose en CPU con cuantizaciones Q4_K_M (1,2 GB).
- Asistente educativo en arabe: puede generar explicaciones, ejercicios y material didactico en arabe para plataformas de aprendizaje, con la ventaja de su bajo coste de inferencia.
- Traduccion arabe-ingles: aunque no es su objetivo principal, el modelo bilingue puede realizar traducciones basicas en dominios generales, adecuado para preprocesamiento en pipelines de datos.
- Prototipado rapido en entornos con recursos limitados: gracias a las cuantizaciones IQ2/IQ3 (0,7-1,0 GB), puede ejecutarse en Raspberry Pi, portatiles sin GPU o contenedores con poca memoria para pruebas de concepto.
- Filtrado y moderacion de contenido en arabe: puede clasificar o generar respuestas controladas en arabe para sistemas de moderacion, aunque se recomienda validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,6 GB (i1-IQ1_S) y 1,5 GB (i1-Q6_K) para los pesos; anadir overhead de contexto (aproximadamente 0,5-1 GB adicionales segun longitud de contexto).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Para mayor throughput, RTX 4090 o A100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, text-generation-webui, y servidores compatibles con endpoints (tag `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano (1,7B parametros), se espera un throughput alto en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Baligh-1.7B-i1-GGUF | 1,72B | no disponible | ar, en | Apache 2.0 | GGUF (25 cuants) |
| Qwen3-1.7B (referencia base) | 1,7B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Fanar-1-9B (arabe) | 9B | no disponible | ar, en | no disponible | safetensors |
| AceGPT-v2-8B (arabe) | 8B | no disponible | ar, en | no disponible | safetensors |

La comparativa con modelos arabes de mayor tamano (Fanar, AceGPT) es orientativa: Baligh-1.7B ofrece un tamano mucho menor con especializacion islamica, lo que lo hace adecuado para despliegues con recursos limitados, a costa de una capacidad general previsiblemente inferior. No se dispone de datos de benchmarks para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento con corpus arabes e islamicos puede introducir sesgos culturales y religiosos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: especialmente relevante en dominio islamico (fatwas), donde el modelo puede generar respuestas doctrinales incorrectas; se requiere supervision humana.
- Limitaciones de contexto o idioma: solo soporta arabe e ingles; el rendimiento en otros idiomas sera limitado. La longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de incluir el aviso de licencia y atribucion.
- Caveats para produccion: las cuantizaciones de baja calidad (IQ1, IQ2, Q2_K) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para produccion. El modelo base no ha sido evaluado con benchmarks publicos en la informacion disponible, por lo que su calidad real en tareas generales es incierta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Baligh-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/Kandil7/Baligh-1.7B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Baligh-1.7B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Baligh-1.7B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
