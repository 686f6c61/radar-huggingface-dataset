# mradermacher/unlink-v2-GGUF

## Resumen

unlink-v2-GGUF es la distribucion en formato GGUF del modelo UnlinkPy/unlink-v2, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base es un transformer denso de aproximadamente 8.950 millones de parametros (8,95 B), orientado a tareas de ciberseguridad, uso de ordenador (computer-use), agentes autonomos y razonamiento, segun las etiquetas declaradas por el autor. La model card lo describe como un modelo "abliterated" y "uncensored" con politica de "zero-refusal", lo que implica que se ha eliminado o atenuado el mecanismo de rechazo de peticiones.

La relevancia de esta ficha radica en que el repositorio ofrece una bateria completa de cuantizaciones estaticas (de Q2_K a f16, incluyendo IQ4_XS), lo que permite ejecutar un modelo de casi 9 B de parametros en hardware de consumo. El autor declara compatibilidad con una ventana de contexto de 1 millon de tokens (etiqueta "1m-context") y capacidades de agente de sistema operativo y razonamiento multi-paso, si bien no se aportan detalles tecnicos que verifiquen estas afirmaciones.

El modelo base se distribuye bajo licencia Apache 2.0, y esta version GGUF hereda la misma licencia. La informacion disponible es escasa en cuanto a datos de entrenamiento, arquitectura interna detallada y resultados de benchmarks, por lo que varias filas de la ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (declarado en etiquetas; no verificado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base UnlinkPy/unlink-v2. Por el numero de parametros (8,95 B) y la etiqueta "transformers", se trata de un transformer denso de escala media, pero no se especifican el numero de capas, dimensiones ocultas, tipo de atencion (full, sliding window, linear) ni si emplea decodificacion especulativa. La etiqueta "1m-context" sugiere una ventana de contexto extendida, aunque no se documenta la tecnica empleada (RoPE scaling, YaRN, atencion lineal, etc.).

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion. La model card indica que el modelo es "abliterated" y "uncensored", terminos que en la comunidad se refieren a la eliminacion o supresion de la direccion de rechazo en el espacio de activaciones, pero el autor no documenta el procedimiento concreto ni el impacto sobre capacidades. Las etiquetas "cybersecurity", "os-agent", "computer-use" y "reasoning" apuntan a un ajuste fino orientado a tareas de agente y seguridad informatica, sin mas detalle.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso y "skills" (etiqueta "reasoning", "skills").
- Operacion como agente autonomo y agente de sistema operativo ("os-agent", "computer-use").
- Uso en tareas de ciberseguridad (etiqueta "cybersecurity").
- Ventana de contexto declarada de 1 millon de tokens.
- Comportamiento "zero-refusal": no rechaza peticiones por politica de contenido.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Automatizacion de tareas de sistema operativo: el modelo esta etiquetado como "os-agent" y "computer-use", por lo que puede emplearse en pipelines que interpretan instrucciones en lenguaje natural y las traducen en acciones sobre el escritorio o la linea de comandos, con la ventaja de su contexto extendido para mantener el estado de la sesion.
- Analisis de seguridad ofensiva y defensiva: las etiquetas "cybersecurity" y "zero-refusal" lo hacen adecuado para pruebas de penetracion autorizadas, analisis de vulnerabilidades y generacion de informes tecnicos sin que el modelo rechace peticiones por su contenido.
- Agentes autonomos de larga duracion: con una ventana declarada de 1 M de tokens, puede mantener el historial completo de una sesion de agente multi-paso sin truncar el contexto, util en tareas de investigacion o automatizacion prolongada.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (5,5-5,7 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM o en CPU con llama.cpp, lo que facilita prototipado local de agentes.
- Generacion de codigo y scripts de automatizacion: como modelo de 8,95 B ajustado para razonamiento, puede emplearse en la generacion de scripts de shell, Python y configuraciones, integrado en editores o pipelines de CI/CD.
- Asistente conversacional sin filtros para investigacion: util en entornos de investigacion donde se necesita estudiar el comportamiento de modelos sin mecanismos de rechazo, por ejemplo en analisis de sesgos o de seguridad.
- Procesamiento de documentos extensos: la ventana de 1 M de tokens (si se confirma) permite resumir o consultar repositorios de codigo, logs o documentacion tecnica de gran tamano en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (3,9 GB): ~4,5-5 GB.
  - Q4_K_M (5,7 GB): ~6,5-7,5 GB.
  - Q5_K_M (6,6 GB): ~7,5-8,5 GB.
  - Q8_0 (9,6 GB): ~10,5-11,5 GB.
  - f16 (18,0 GB): ~19-20 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y contextos muy largos.
- Cabe en GPU de consumo: si, en Q4_K_S/Q4_K_M con 8 GB de VRAM; Q5/Q6 requieren 10-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| unlink-v2-GGUF | 8,95 B | 1 M (declarado) | Apache 2.0 | GGUF | Abliterated, orientado a ciberseguridad y agentes |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Modelo generalista ampliamente soportado |
| Qwen2.5 7B Instruct | 7,62 B | 128 K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en codigo y matematicas |
| Mistral 7B Instruct v0.3 | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Referencia de la categoria 7-8 B |

La comparativa es orientativa: no se dispone de benchmarks de unlink-v2 que permitan una comparacion cuantitativa con estos modelos. Las diferencias principales son la ventana de contexto declarada (1 M frente a 32-128 K) y el ajuste especifico para ciberseguridad y agentes de sistema operativo.

## Limitaciones y advertencias

- El modelo es "uncensored" y "zero-refusal": no aplica filtros de seguridad, por lo que puede generar contenido danino, ilegal o inseguro. Su uso en produccion requiere moderacion externa.
- Riesgo de alucinacion no cuantificado; al no haber benchmarks publicados, no se puede estimar su fiabilidad en tareas factuales.
- La ventana de 1 M de tokens es una etiqueta declarada por el autor y no esta verificada; el rendimiento real en contextos muy largos puede degradarse.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "abliterated" puede implicar riesgos legales y reputacionales si se despliega sin supervision.
- No se documentan sesgos conocidos ni el procedimiento de abliteracion, lo que dificulta evaluar el impacto sobre las capacidades del modelo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene muy pocas descargas (1111) y likes (1), lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/unlink-v2-GGUF
- Modelo base: https://huggingface.co/UnlinkPy/unlink-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#unlink-v2-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
