# mradermacher/FNova-1.7B-Chat-v1-GGUF

## Resumen

FNova-1.7B-Chat-v1-GGUF es la versión cuantizada en formato GGUF del modelo conversacional FNova-1.7B-Chat-v1, publicado por el usuario mradermacher a partir de los pesos originales de Fengnan001. Se trata de un modelo denso de 1.720.574.976 parámetros (aproximadamente 1,72 B) etiquetado con la arquitectura `qwen3`, lo que sugiere que deriva de la familia Qwen3, aunque la model card no lo confirma de forma explícita. Su propósito es ofrecer una alternativa ligera y ejecutable en hardware de consumo para tareas de chat en chino e inglés.

La relevancia de esta publicación es fundamentalmente práctica: el repositorio original solo distribuye pesos en safetensors, mientras que esta versión proporciona 12 cuantizaciones GGUF estáticas (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB), lo que permite desplegar el modelo con llama.cpp, Ollama o LM Studio en equipos sin GPU de datacenter. Además, existe una variante con cuantización ponderada/imatrix en un repositorio separado.

El modelo se ha entrenado mediante un pipeline que combina preentrenamiento continuado, SFT, GRPO y destilación on-policy, según las etiquetas de la model card. La licencia es Apache 2.0, lo que facilita su uso comercial, si bien no se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto o la composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, etiquetado `qwen3` (familia Qwen3, no confirmado explícitamente en la model card) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No disponible (no se indica que sea MoE; el recuento total sugiere modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K (0,9 GB), Q3_K_S (1,0 GB), Q3_K_M (1,0 GB), Q3_K_L (1,1 GB), IQ4_XS (1,1 GB), Q4_K_S (1,2 GB), Q4_K_M (1,2 GB), Q5_K_S (1,3 GB), Q5_K_M (1,4 GB), Q6_K (1,5 GB), Q8_0 (1,9 GB), f16 (3,5 GB); variantes imatrix en repositorio aparte |
| Idiomas soportados | Chino (`zh`) e inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3`. Por el tamaño (1,72 B) y la nomenclatura, todo apunta a un transformer decoder-only denso de la familia Qwen3, pero no se especifican número de capas, dimensión oculta, cabezas de atención, uso de GQA ni tipo de positional encoding. Tampoco se indica la longitud de contexto nativa, un dato crítico para planificar despliegues.

El pipeline de entrenamiento se deduce de las etiquetas de la model card: preentrenamiento continuado (`continued-pretraining`) sobre una base preentrenada, seguido de ajuste supervisado (`sft`), optimización con GRPO (`grpo`) y destilación on-policy (`on-policy-distillation`). No se proporcionan cifras de tokens de entrenamiento, composición del dataset, número de pasos ni detalles sobre el proceso de alineación. La model card del repositorio GGUF es puramente operativa (generada por la herramienta de cuantización de mradermacher) y no amplía la información del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento básico y respuesta a instrucciones, derivado del ajuste SFT y GRPO.
- Destilación on-policy, que en la práctica suele orientarse a mejorar la calidad de las respuestas y la estabilidad del formato conversacional.
- Compatibilidad con `transformers` (pesos originales) y con el ecosistema GGUF (llama.cpp y derivados).
- Etiqueta `vllm`, lo que indica compatibilidad prevista con dicho motor de inferencia para los pesos originales.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas declarados; el español no está soportado oficialmente.

## Casos de uso

- Chat de soporte en inglés o chino en entornos con recursos limitados: el modelo cabe en 1,2 GB con Q4_K_M, por lo que puede ejecutarse en una Raspberry Pi 5, un portátil sin GPU dedicada o un contenedor pequeño, gestionando conversaciones de baja complejidad.
- Prototipado rápido de asistentes conversacionales: al estar disponible en GGUF, se puede cargar en Ollama o LM Studio en minutos para validar flujos de diálogo antes de invertir en un modelo mayor.
- Generación de texto en aplicaciones de escritorio offline: integrable mediante llama.cpp en herramientas de escritorio que requieran privacidad total, sin llamadas a API externas.
- Filtrado y clasificación de textos en pipelines de datos: con 1,72 B y cuantización Q8_0 (1,9 GB) puede ejecutarse por lotes en CPU para tareas de etiquetado simple o reformateo, siempre que el idioma sea chino o inglés.
- Educación y experimentación: modelo adecuado para cursos o talleres sobre cuantización, evaluación de modelos pequeños y despliegue local, dado su tamaño reducido y su licencia permisiva.
- Base para fine-tuning ligero: al ser Apache 2.0 y tener 1,72 B de parámetros, es viable ajustarlo con LoRA en una única GPU de 16-24 GB para dominios específicos en chino o inglés.
- Respuestas de baja latencia en entornos edge: con Q4_K_S y una ventana de contexto moderada, el coste por token es bajo, lo que encaja en aplicaciones de autocompletado o respuestas cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni las etiquetas asociadas incluyen datos de MMLU, HumanEval, GSM8K, C-Eval u otras evaluaciones, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB.
- Con caché KV para contextos moderados, se recomienda añadir entre 0,5 y 2 GB adicionales según la longitud de contexto efectiva (no documentada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM. Una RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 4070 o superiores permiten ejecutar Q8_0 o f16 con holgura. Una GTX 1650 de 4 GB basta para Q4_K_M.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, y también en iGPU con memoria unificada (Apple Silicon, AMD APU) y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y vLLM (soporte GGUF). El repositorio original está etiquetado para vLLM con pesos safetensors. TGI no se menciona.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1,72 B, en la práctica se espera una latencia baja en GPU consumer, pero no hay cifras publicadas que permitan confirmarlo.
- Para cuantizaciones ponderadas (imatrix), existe el repositorio `mradermacher/FNova-1.7B-Chat-v1-i1-GGUF`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| FNova-1.7B-Chat-v1-GGUF (este) | 1,72 B | No disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Solo zh/en; sin benchmarks publicados |
| FNova-1.7B-Chat-v1 (original) | 1,72 B | No disponible | Apache 2.0 | Safetensors | Pesos de referencia; requiere convertir a GGUF para uso local |
| Qwen3-1.7B | 1,7 B | 32.768 tokens (dato público de la familia Qwen3) | Apache 2.0 | Safetensors, GGUF | Familia en la que probablemente se basa este modelo; cobertura multilingüe más amplia |
| Llama 3.2 1B | 1,23 B | 128.000 tokens (dato público) | Licencia comunitaria Llama 3.2 | Safetensors, GGUF | Menor número de parámetros y contexto mayor; licencia con restricciones |
| Gemma 3 1B | 1 B | 32.000 tokens (dato público) | Términos de Gemma | Safetensors, GGUF | Alternativa de tamaño similar; licencia no Apache |

Los datos de contexto y licencia de los modelos comparativos provienen de sus fichas públicas y pueden variar; se incluyen solo como referencia orientativa. Para FNova no se dispone de contexto ni benchmarks verificables.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no hay soporte declarado de español, por lo que el rendimiento en castellano será probablemente deficiente e impredecible.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a alternativas de tamaño similar sin evaluarlo por cuenta propia.
- Longitud de contexto no documentada: planificar aplicaciones con ventanas largas es arriesgado sin pruebas previas.
- Riesgo de alucinación elevado por el tamaño reducido (1,72 B) y por la falta de documentación sobre el proceso de alineación.
- Las cuantizaciones Q2_K y Q3_K pueden degradar de forma notable la calidad; se recomienda Q4_K_M o superior para uso en producción.
- La model card del repositorio GGUF es generada automáticamente y no aporta información sobre sesgos, datos de entrenamiento ni evaluación.
- La cuantización la realiza un tercero (mradermacher), no el autor original; posibles diferencias de comportamiento respecto a los pesos safetensors.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las obligaciones de atribución y las condiciones del modelo base original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FNova-1.7B-Chat-v1-GGUF
- Modelo base original: https://huggingface.co/Fengnan001/FNova-1.7B-Chat-v1
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/FNova-1.7B-Chat-v1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#FNova-1.7B-Chat-v1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
