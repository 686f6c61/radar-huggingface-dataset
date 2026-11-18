# mradermacher/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft-GGUF

## Resumen

El repositorio `mradermacher/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft-GGUF` contiene una coleccion de cuantizaciones GGUF estaticas del modelo base `shisa-ai/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft`, un modelo conversacional de 1.534.683.136 parametros (~1,5B) publicado por Shisa AI. El trabajo de cuantizacion lo realiza mradermacher, un conocido empaquetador de pesos en formato GGUF para inferencia local con llama.cpp y derivados. El modelo original esta etiquetado con los idiomas japones e ingles y licencia Apache 2.0.

El modelo base parece ser un ajuste fino instructivo (SFT) sobre un modelo de la familia Rakuten 2.0 Mini, orientado a conversacion y con soporte nativo de japones. El nombre incluye referencias a "rakuten-2.0-mini", lo que sugiere que Shisa AI parte de un modelo preentrenado de Rakuten y lo somete a un proceso de ajuste supervisado para tareas instructivas en japones. No se dispone de informacion detallada sobre la arquitectura exacta, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

La relevancia de este repositorio es practica: ofrece el modelo en 12 variantes de cuantizacion (desde Q2_K de 0,7 GB hasta f16 de 3,2 GB), lo que permite desplegarlo en hardware de consumo muy modesto, desde mini-PCs hasta GPUs de gama baja. Es util para desarrolladores que necesitan un modelo japones-ingles pequeno, con licencia permisiva y ejecutable en local sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: shisa-ai/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft) |
| Parametros totales | 1.534.683.136 (~1,5B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |
| Tamano del repo | 13,7 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Compatibilidad con endpoints | si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el tamano (~1,5B parametros), se trata presumiblemente de un transformer decoder-only denso, pero no se confirma en la model card. El sufijo "instruct" y "sft" indica que el modelo ha pasado por un ajuste supervisado (supervised fine-tuning) para tareas conversacionales, aunque no se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO u otras.

El trabajo realizado en este repositorio es exclusivamente de cuantizacion: se han generado 12 variantes GGUF estaticas (sin imatrix/weighted quants, segun indica el autor) a partir de los pesos originales en safetensors. El autor senala que las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion y que podrian no planificarse. La cuantizacion se realizo con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos del README.

## Capacidades

- Generacion de texto conversacional en japones e ingles, orientada a instrucciones (modelo "instruct").
- Razonamiento basico y respuesta a preguntas en ambos idiomas.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a japones e ingles segun las etiquetas del modelo.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Asistente conversacional en japones para atencion al cliente: el modelo puede gestionar dialogos multi-turno en japones con un coste computacional minimo, adecuado para desplegar en servidores modestos o en el borde.
- Traduccion japones-ingles y ingles-japones en pipelines de contenido: al estar entrenado en ambos idiomas, puede emplearse para pre-traduccion o generacion bilingue en herramientas editoriales.
- Prototipado rapido de chatbots en local: con la cuantizacion Q4_K_M (1,0 GB) se puede ejecutar en un portatil sin GPU dedicada mediante llama.cpp u Ollama, lo que acelera la iteracion en desarrollo.
- Generacion de texto asistida en aplicaciones japonesas: redaccion de correos, resumenes y respuestas en japones dentro de herramientas ofimaticas o CRM.
- Filtrado y clasificacion de texto bilingue: el modelo puede usarse para tareas de etiquetado o moderacion en japones e ingles en entornos con recursos limitados.
- Educacion y tutoria en japones: respuestas explicativas a preguntas de estudiantes en un asistente ligero desplegado en una Raspberry Pi o mini-PC con 4-8 GB de RAM.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes para estudiar el impacto de la cuantizacion en un modelo japones pequeno, con tamanos desde 0,7 GB hasta 3,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~0,7 GB; Q4_K_M ~1,0 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4-Q8 con comodidad; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs consumer modernas, e incluso en CPU sola con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM, TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| 036-rakuten-2.0-mini-instruct-1.5b-v2new-sft (este) | ~1,5B | no disponible | ja, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (segun documentacion publica de Qwen) | multilingue (incluye ja) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | ~1,2B | 128K (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | ~2,6B | 8K (segun documentacion publica de Google) | multilingue | Gemma Terms of Use | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de comparativas de rendimiento (benchmarks) para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo ajustado principalmente en japones, puede presentar sesgos culturales y linguisticos propios del corpus de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de ~1,5B parametros; la capacidad de razonamiento y factualidad es limitada en comparacion con modelos de mayor tamano.
- Limitaciones de contexto e idioma: solo japones e ingles segun las etiquetas; la longitud de contexto no esta documentada, lo que impide garantizar ventanas largas en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (shisa-ai/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft) y del preentrenado Rakuten subyacente, ya que podrian imponer condiciones adicionales no reflejadas en este repositorio.
- Cuantizaciones estaticas sin imatrix: el autor indica que las variantes ponderadas (imatrix) no estan disponibles, lo que puede suponer una perdida de calidad mayor en las cuantizaciones bajas (Q2_K, Q3) frente a alternativas con imatrix.
- Modelo de nicho: solo 63 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria y el soporte.
- No hay benchmarks publicados, por lo que no se puede garantizar su rendimiento en tareas especificas sin evaluacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft-GGUF
- Modelo base: https://huggingface.co/shisa-ai/036-rakuten-2.0-mini-instruct-1.5b-v2new-sft
- Pagina de descargas del autor: https://hf.tst.eu/model#036-rakuten-2.0-mini-instruct-1.5b-v2new-sft-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
