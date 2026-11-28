# mradermacher/RSI-4B-GGUF

## Resumen

RSI-4B es un modelo de lenguaje de 4.022.468.096 parametros (aproximadamente 4 mil millones) desarrollado por grahammcbain y publicado originalmente como `grahammcbain/RSI-4B`. La version descrita en esta ficha es la cuantizacion GGUF realizada por mradermacher bajo el identificador `mradermacher/RSI-4B-GGUF`. El modelo esta construido sobre la arquitectura Qwen3, segun las etiquetas de la model card, y ha sido afinado mediante DPO (Direct Preference Optimization) y LoRA sobre el modelo base.

La relevancia de esta publicacion reside en su caracter experimental y conceptual: las etiquetas del repositorio incluyen terminos como "conceptual-art", "slop" y "recursive-slop-improvement" (RSI, de ahi el nombre), lo que sugiere que se trata de una pieza de arte conceptual o un experimento sobre generacion de contenido de baja calidad de forma recursiva, mas que un modelo orientado a produccion. La model card es extremadamente escueta y no documenta datos de entrenamiento, benchmarks ni capacidades.

La version GGUF facilita la ejecucion local en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones desde Q2_K (1,8 GB) hasta f16 (8,2 GB). El repositorio completo ocupa 36,4 GB e incluye todos los formatos de cuantizacion estaticos generados por mradermacher. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun etiquetas de la model card) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); disponibles tambien cuantizaciones ponderadas/imatrix en `mradermacher/RSI-4B-i1-GGUF` |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es `grahammcbain/RSI-4B`, del que se conoce que emplea una arquitectura transformer de la familia Qwen3, con 4.022.468.096 parametros. El proceso de ajuste incluyo DPO (Direct Preference Optimization) y LoRA, segun las etiquetas del repositorio, lo que indica un afinado sobre el modelo base mediante adaptadores de bajo rango y optimizacion de preferencias.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el proceso de RLHF ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card no aporta detalles de arquitectura interna mas alla de las etiquetas. El caracter "conceptual" del proyecto (etiquetas "conceptual-art", "slop", "recursive-slop-improvement") sugiere que el entrenamiento pudo orientarse deliberadamente a generar contenido de baja calidad de forma recursiva, pero esto es una inferencia a partir de las etiquetas y no un dato documentado.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational` y `en`).
- Afinado mediante DPO, lo que en principio orienta las respuestas hacia preferencias humanas, aunque no se documenta el criterio de preferencia utilizado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible (no documentado).
- Compatibilidad con endpoints (`endpoints_compatible`) y con la libreria transformers.

## Casos de uso

- Experimentacion con cuantizaciones GGUF: el modelo sirve para probar el pipeline de cuantizacion de mradermacher y comparar calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de 4B, util para validar infraestructura de despliegue local.
- Investigacion sobre arte conceptual y "slop": dado el caracter declarado del proyecto, puede emplearse como objeto de estudio sobre generacion de contenido de baja calidad y mejora recursiva, no como asistente de produccion.
- Pruebas de inferencia en hardware de consumo: con cuantizaciones de 1,8 a 3,0 GB cabe en GPUs de gama media y en CPU, lo que permite validar entornos llama.cpp, Ollama o LM Studio con un modelo pequeno.
- Evaluacion de tecnicas DPO + LoRA: el modelo permite inspeccionar como un ajuste DPO sobre un base Qwen3 de 4B afecta al comportamiento conversacional en ingles.
- Generacion de texto creativo experimental: para proyectos que busquen deliberadamente estilos degenerados o iterativos, en linea con la etiqueta "recursive-slop-improvement".
- Base para comparativas de cuantizacion: util como caso de prueba en estudios sobre perdida de perplejidad entre tipos de quant (el propio repositorio enlaza graficas de comparacion de ikawrakow y notas de Artefact2).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,8 GB; Q3_K_M ~2,2 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer con 6 GB o mas para Q4_K_M y superiores; las cuantizaciones Q2/Q3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. El repositorio incluye cuantizaciones imatrix en `mradermacher/RSI-4B-i1-GGUF`.
- Latencia y throughput estimados: no disponibles (no documentados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RSI-4B (esta ficha) | 4,02B | no disponible | Apache 2.0 | GGUF / safetensors | Afinado DPO+LoRA sobre base Qwen3; proyecto conceptual |
| Qwen3-4B (base de referencia) | ~4B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Modelo base de la familia sobre la que se construye; referencia natural |
| Otros modelos 4B con GGUF (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4B | 128K en algunos casos | licencias variables | GGUF | Alternativas de tamano similar para despliegue local; no se dispone de comparativa de rendimiento con RSI-4B |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, sesgos ni evaluaciones; no es posible estimar su calidad real.
- El caracter declarado del proyecto ("conceptual-art", "slop", "recursive-slop-improvement") sugiere que el modelo puede generar contenido de baja calidad de forma deliberada; no es adecuado para produccion sin evaluacion previa.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 4B afinado con DPO sin documentacion, el riesgo es desconocido y potencialmente alto.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no disponible; no debe asumirse una ventana larga.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un derivado de un modelo base Qwen3 conviene verificar las condiciones del modelo base original.
- El repositorio pesa 36,4 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF deseado.
- Fecha de creacion del repositorio: 2026-11-24 (segun metadatos de Hugging Face).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RSI-4B-GGUF
- Modelo base: https://huggingface.co/grahammcbain/RSI-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/RSI-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#RSI-4B-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
