# mradermacher/llama-capro-GGUF

## Resumen

llama-capro es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por teclabs, especializado en contabilidad y finanzas, con especial énfasis en el contexto contable indio (etiquetas `indian-accounting`, `ind-as`, `finance`, `accounting`). La versión aquí descrita es la cuantización GGUF realizada por mradermacher a partir del modelo base `teclabs/llama-capro`, lo que permite su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se construye sobre la arquitectura Llama 3 (tag `llama-3`) y se distribuye bajo licencia Llama 3.1, lo que condiciona su uso comercial a los términos del acuerdo de licencia de Meta. El tamaño del repositorio (71,8 GB) refleja la suma de todas las cuantizaciones publicadas, desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que facilita elegir el equilibrio entre calidad y requisitos de memoria.

Su relevancia radica en la combinación de un modelo de dominio específico (contabilidad y finanzas con orientación al mercado indio) con el ecosistema GGUF, que permite ejecutarlo en estaciones de trabajo con GPU de consumo. No obstante, la información pública disponible es limitada: no se han publicado benchmarks, detalles de entrenamiento ni especificaciones de contexto en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Llama 3 (tag `llama-3`); detalles adicionales no disponibles |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (`en`); la model card base declara también `ca` en las etiquetas, sin detalle adicional |
| Licencia | Llama 3.1 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Llama 3, un transformer decoder-only con atención multi-cabeza y RoPE, aunque no se detallan variaciones específicas (por ejemplo, GQA, número de capas o dimensión oculta). El modelo base `teclabs/llama-capro` se ha ajustado presumiblemente para el dominio contable y financiero indio, a juzgar por las etiquetas de la model card, pero no se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La contribución de esta versión es exclusivamente la cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas por imatrix, según indica la propia model card) en formato GGUF, con versiones que van desde Q2_K hasta f16. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a consultas de contabilidad y finanzas.
- Razonamiento sobre conceptos contables, presumiblemente con especial atención a normativa y prácticas del mercado indio (etiquetas `indian-accounting`, `ind-as`).
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües limitadas: la model card declara inglés y una etiqueta `ca` sin más detalle; no hay evidencia de un soporte multilingüe amplio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia contable especializada en el mercado indio: el modelo puede responder consultas sobre normativa contable india (etiquetas `ind-as`, `indian-accounting`), aunque la ausencia de benchmarks publicados obliga a validar la calidad en cada dominio concreto antes de usarlo en producción.
- Clasificación y extracción de información financiera: con 8 B de parámetros y cuantización Q4_K_M (5,0 GB), puede desplegarse en una GPU de consumo para tareas de extracción de entidades o categorización de transacciones en pipelines internos.
- Generación de borradores de informes financieros: adecuado para producir textos preliminares que un contable revise, gracias a su ajuste de dominio y a su naturaleza conversacional.
- Chatbot interno de soporte a equipos de finanzas: la cuantización Q5_K_M (5,8 GB) ofrece un equilibrio razonable entre calidad y huella de memoria para un asistente desplegado en una estación de trabajo.
- Prototipado rápido en local: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten probar el modelo en portátiles o GPUs con poca VRAM antes de escalar a una versión de mayor calidad.
- Integración en herramientas de línea de comandos o asistentes de escritorio: al estar en formato GGUF, se puede ejecutar con llama.cpp u Ollama, lo que facilita su incorporación a flujos de trabajo locales sin infraestructura de servidor.
- Evaluación comparativa de modelos de dominio: sirve como referencia para comparar el rendimiento de modelos especializados en contabilidad frente a modelos generalistas del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_S: ~3,8 GB
  - Q3_K_M: ~4,1 GB
  - Q3_K_L: ~4,4 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_S: ~4,8 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_S: ~5,7 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070). Q8_0 requiere al menos 10-12 GB (RTX 3080 12 GB, RTX 4070 Ti, RTX 4080). f16 requiere 20 GB o más (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en GPUs de 8 GB o más; Q8_0 y f16 requieren GPUs de gama alta o profesional.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base es compatible con transformers y endpoints compatibles.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llama-capro (esta ficha) | 8,03 B | No disponible | Llama 3.1 | GGUF, safetensors | Especializado en contabilidad india |
| Llama 3.1 8B Instruct | 8,03 B | 128 K (según Meta) | Llama 3.1 | Safetensors, GGUF | Modelo generalista de referencia, mismos parámetros |
| Qwen2.5 7B Instruct | 7,6 B | 128 K (según Qwen) | Apache 2.0 | Safetensors, GGUF | Generalista con licencia permisiva y buen multilingüismo |
| Mistral 7B Instruct | 7,2 B | 32 K (según Mistral) | Apache 2.0 | Safetensors, GGUF | Generalista con licencia permisiva |

La comparación se limita a parámetros y licencia porque no hay benchmarks publicados de llama-capro que permitan contrastar calidad. La ventaja diferencial del modelo es su ajuste al dominio contable indio; su desventaja es la falta de documentación y de evaluación pública frente a los generalistas citados.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: la calidad real del modelo en tareas contables es desconocida y debe validarse empíricamente antes de usarlo en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar cifras, normativas o referencias contables incorrectas; en un dominio financiero esto es especialmente crítico y exige revisión humana.
- Sesgos: no se documentan sesgos conocidos, pero al estar entrenado presumiblemente con datos del mercado indio, puede tener un sesgo hacia esa normativa y ofrecer respuestas inadecuadas para otras jurisdicciones.
- Limitaciones de idioma: la model card declara inglés como idioma principal; el soporte de otros idiomas (incluida la etiqueta `ca`) no está documentado y no debería asumirse.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas que requieran ventanas largas sin verificarlo experimentalmente.
- Restricciones de licencia: la licencia Llama 3.1 impone condiciones al uso comercial (política de uso aceptable, obligaciones de atribución y limitaciones para empresas con más de 700 millones de usuarios mensuales). Es necesario revisar el acuerdo completo antes de un despliegue comercial.
- Cuantizaciones estáticas sin imatrix: la model card indica que no hay cuantizaciones ponderadas por imatrix, lo que puede suponer una pérdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- El repositorio ocupa 71,8 GB en total; conviene descargar solo la cuantización necesaria.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/llama-capro-GGUF
- Modelo base: https://huggingface.co/teclabs/llama-capro
- Página de descargas de mradermacher: https://hf.tst.eu/model#llama-capro-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
