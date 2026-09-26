# 1bit-MONSTER/gpt-neox-20b-GGUF

## Resumen

`1bit-MONSTER/gpt-neox-20b-GGUF` es un re-alojamiento comunitario del modelo `EleutherAI/gpt-neox-20b` en formato GGUF con cuantización Q4_K_M. No se trata de un modelo nuevo ni ajustado: es el mismo conjunto de pesos de 20.554.567.680 parámetros publicado por EleutherAI, cuantizado previamente por `mradermacher` y vuelto a publicar en este repositorio junto con métricas medidas en hardware Strix Halo (Vulkan) para el motor de inferencia del propio autor.

El interés de este repositorio es fundamentalmente práctico: ofrece un archivo único (`gpt-neox-20b.Q4_K_M.gguf`, ~13,1 GB de repositorio) listo para ejecutarse con llama.cpp, Ollama o el motor `1bit`, con licencia Apache 2.0 heredada del modelo base. Al ser un modelo base sin ajuste por instrucciones, su uso natural es la generación de texto y la experimentación, no la conversación.

Su relevancia actual es la de un *baseline* histórico: un transformer decoder-only de 20B entrenado en 2022 sobre The Pile, con una ventana de contexto declarada de 2.048 tokens y orientación al inglés. Sirve como referencia para comparar cuantizaciones, medir rendimiento en hardware de consumo y estudiar la deriva de calidad frente a modelos actuales de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-NeoX); detalles de capas y dimensiones no disponibles en esta ficha |
| Parámetros totales | 20.554.567.680 (~20,55B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card de este repositorio; el modelo base declara 2.048 tokens |
| Tipos de cuantización | Q4_K_M incluida en el repositorio; otras cuantizaciones disponibles en el repositorio de origen `mradermacher/gpt-neox-20b-GGUF` |
| Idiomas soportados | No disponible en la model card; el modelo base se entrenó principalmente sobre texto en inglés (The Pile) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`gpt-neox-20b.Q4_K_M.gguf`) |
| Tamaño del repositorio | 13,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |
| Última actualización | 2026-09-26 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura más allá de atribuirla a EleutherAI ("EleutherAI's own architecture"). Se trata, por tanto, de un transformer decoder-only autorregresivo de la familia GPT-NeoX, con contexto de 2.048 tokens y sin ajuste por instrucciones (modelo base). La model card no aporta número de capas, dimensión oculta, cabezas de atención ni detalles de tokenizador, y tampoco especifica el proceso de cuantización más allá de la etiqueta Q4_K_M.

Tampoco se documentan en este repositorio los datos de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO; la model card indica explícitamente que el modelo "no está ajustado por instrucciones". El único dato técnico propio de este re-alojamiento son las métricas medidas por el autor al ejecutar la cuantización con el motor `1bit` sobre Strix Halo vía Vulkan: 292 tok/s en prefill de 512 tokens (pp512) y 14,6 tok/s en generación (tg128). No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autorregresiva y continuación de documentos en inglés.
- Aprendizaje en contexto de tipo *few-shot* (patrón habitual en modelos base de esta generación); no confirmado explícitamente en la model card.
- Razonamiento, matemáticas y generación de código: no documentado en la ficha del repositorio.
- Soporte de *tool calling* / *function calling*: no soportado por diseño, al no estar ajustado por instrucciones ni para uso de herramientas.
- Soporte de agentes y razonamiento multi-paso: no soportado; carece de formato de diálogo o de marcas de herramienta.
- Capacidades multilingües: no declaradas; el modelo base está entrenado predominantemente en inglés.
- Capacidades especiales: ninguna. No hay modo *thinking*, visión, audio ni entrada multimodal.
- Ejecución en CPU/iGPU mediante GGUF, con soporte Vulkan según las métricas aportadas por el autor.

## Casos de uso

- Evaluación de cuantizaciones: medir la degradación de perplejidad y la pérdida de calidad de Q4_K_M frente a Q5_K_M, Q6_K o Q8_0 sobre el mismo modelo base, usando este archivo como punto de comparación en un banco de pruebas reproducible.
- Generación de texto no interactiva: completado de documentos largos, resumen extractivo o reformulación por lotes en inglés, tareas que no requieren seguir instrucciones ni mantener un diálogo.
- Generación de datos sintéticos: producir corpus de texto en inglés para experimentos de preentrenamiento o destilación, con posterior filtrado y revisión humana dado el riesgo de sesgo y toxicidad del modelo base.
- Prototipado local sin GPU dedicada: despliegue con llama.cpp u Ollama en portátiles o mini-PC con iGPU (el autor reporta 14,6 tok/s de generación en Strix Halo), suficiente para pruebas de concepto y demos offline.
- Investigación sobre arquitecturas: uso como *baseline* de 20B de la generación GPT-NeoX en estudios de escalado, comparativas de tokenizadores o análisis de representaciones internas.
- *Scoring* y filtrado de texto: cálculo de log-probabilidades por token para puntuar candidatos en pipelines de búsqueda, deduplicación semántica o clasificación débilmente supervisada.
- Docencia y reproducción de resultados: al ser Apache 2.0 y ejecutable en hardware asequible, permite reproducir experimentos académicos con un modelo de 20B sin depender de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento aportado es de tipo motor/hardware, no de calidad:

| Métrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill de 512 tokens) | 292 tok/s | Strix Halo, Vulkan, motor 1bit, Q4_K_M |
| tg128 (generación de 128 tokens) | 14,6 tok/s | Strix Halo, Vulkan, motor 1bit, Q4_K_M |
| Calidad (MMLU, HumanEval, GSM8K, perplejidad) | No disponible | — |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 13-14 GB incluyendo pesos y caché KV a 2.048 tokens con *batch* pequeño. El archivo de pesos ronda los 12-13 GB (tamaño de repositorio declarado: 13,1 GB).
- Otras cuantizaciones (estimaciones orientativas según el número de parámetros): Q8_0 ~21-22 GB; Q5_K_M ~14-15 GB; F16 ~41 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q8_0 a contexto completo; A100 40/80 GB o H100 para F16 y para *throughput* alto con vLLM.
- GPU de consumo: sí cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con Q4_K_M y contexto reducido o *offload* parcial; en 12 GB requiere descarga de capas a CPU. También es viable en CPU con 16-32 GB de RAM a velocidad reducida.
- Sistemas integrados: validado por el autor en Strix Halo con memoria unificada y backend Vulkan.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, servidores GGUF compatibles (llama-cpp-python) y el motor `1bit`. vLLM y TGI no ofrecen soporte nativo de GGUF, por lo que requerirían partir del modelo base en safetensors.
- Latencia y *throughput*: en el entorno medido por el autor, ~68 ms por token en generación (14,6 tok/s) y 292 tok/s de prefill. No hay mediciones publicadas para GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| 1bit-MONSTER/gpt-neox-20b-GGUF (Q4_K_M) | 20,55B | 2.048 tokens (según modelo base) | GGUF | Apache 2.0 | 14,6 tok/s tg en Strix Halo; calidad no disponible |
| EleutherAI/gpt-neox-20b | 20,55B | 2.048 tokens | safetensors / PyTorch | Apache 2.0 | No disponible |
| mradermacher/gpt-neox-20b-GGUF | 20,55B | 2.048 tokens | GGUF (múltiples cuantizaciones) | Apache 2.0 | No disponible |
| EleutherAI/pythia-12b | 12B | 2.048 tokens | safetensors / PyTorch | Apache 2.0 | No disponible |
| meta-llama/Llama-2-13b-hf | 13B | 4.096 tokens | safetensors / PyTorch | Llama 2 Community License | No disponible |

La comparativa se limita a tamaño, contexto, formato y licencia, ya que la información proporcionada no incluye resultados de calidad para ninguno de los modelos. Frente a las alternativas de 12-13B, este modelo ofrece más parámetros y licencia Apache 2.0 sin restricciones de uso comercial, pero con un contexto menor y sin ajuste por instrucciones.

## Limitaciones y advertencias

- Ausencia de alineación: al ser un modelo base sin RLHF ni DPO, no sigue instrucciones, puede producir continuaciones incoherentes y tiene una propensión elevada a la alucinación en tareas de pregunta-respuesta.
- Sesgos y toxicidad: el modelo base se entrenó sobre un corpus de rastreo web (The Pile), por lo que es probable que reproduzca estereotipos, lenguaje ofensivo y contenido sesgado. No se documentan evaluaciones de seguridad ni filtros.
- Idiomas: no hay soporte multilingüe declarado; el rendimiento fuera del inglés no está garantizado y la model card no especifica idiomas.
- Ventana de contexto: 2.048 tokens según la documentación del modelo base, insuficiente para casos de uso conversacionales o de documentos largos actuales.
- Obsolescencia: arquitectura de 2022; frente a modelos actuales de tamaño comparable rinde peor en razonamiento, código y matemáticas, aunque no se aportan números que lo cuantifiquen.
- Cuantización: Q4_K_M introduce pérdida de precisión respecto a F16; no se publica la perplejidad diferencial.
- Repositorio con nula tracción: 0 descargas y 0 likes, sin garantía de mantenimiento, versionado ni soporte por parte del autor.
- Procedencia: los pesos son una recuantización de un tercero (`mradermacher`); conviene verificar el archivo antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario sigue siendo responsable del cumplimiento y de los contenidos generados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/gpt-neox-20b-GGUF
- Modelo base: https://huggingface.co/EleutherAI/gpt-neox-20b
- Cuantización original (mradermacher): https://huggingface.co/mradermacher/gpt-neox-20b-GGUF
- Motor de inferencia 1bit: https://github.com/1bit-MONSTER/engine
- Artículo del modelo base (GPT-NeoX-20B: An Open-Source Autoregressive Language Model): https://arxiv.org/abs/2204.06745
- Nota sobre la búsqueda web: los resultados devueltos por el buscador no guardan relación con el modelo (contenido para adultos ajeno al tema) y se descartan por no aportar información utilizable.
