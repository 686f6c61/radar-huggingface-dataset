# Sleem247/law-nlp-Q8_0-GGUF

## Resumen

Sleem247/law-nlp-Q8_0-GGUF es un adaptador LoRA en formato GGUF, cuantizado a Q8_0, generado a partir del adaptador original sampangtf/law-nlp. No se trata de un modelo completo, sino de un adaptador que debe cargarse sobre el modelo base correspondiente mediante llama.cpp (a traves de las opciones `--lora`). El autor del artefacto es el usuario Sleem247, que lo ha convertido usando el espacio GGUF-my-lora de ggml.ai.

El modelo declara 6.078.464 parametros totales en sus ficheros safetensors, un orden de magnitud coherente con un adaptador LoRA de rango bajo sobre un transformer pequeno, no con un modelo de lenguaje completo. La licencia declarada es llama3.2, lo que sugiere que el modelo base sobre el que se entreno el adaptador pertenece a la familia Llama 3.2, aunque el repositorio no especifica la variante exacta (1B o 3B).

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, sin model card propia mas alla de las instrucciones de uso con llama.cpp, sin benchmarks publicados y con cero descargas en el momento de la consulta. Resulta util unicamente como ejemplo de flujo de conversion LoRA a GGUF para ajuste fino orientado a dominio juridico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base no especificado de la familia Llama 3.2 |
| Parametros totales | 6.078.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | Q8_0 (unico publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA convertido a GGUF, no un modelo entrenado desde cero. La arquitectura subyacente corresponde al modelo base sampangtf/law-nlp, del que no se dispone de informacion sobre numero de capas, dimension oculta ni atencion. El adaptador se genero con la libreria PEFT (tag `peft` y `generated_from_trainer`) y posteriormente se convirtio al formato GGUF mediante el espacio GGUF-my-lora de ggml.ai, que empaqueta las matrices de bajo rango en un fichero compatible con llama.cpp.

No hay informacion publicada sobre el volumen de datos de entrenamiento, la composicion del dataset juridico utilizado, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado clasico. El nombre del modelo (`law-nlp`) y el contexto de los repositorios hermanos del mismo autor (`legal-llm`, `law-llm-finetuned`) apuntan a un ajuste fino orientado a texto legal, pero no se detalla la innovacion tecnica ni el pipeline de datos.

## Capacidades

- Generacion de texto especializada en dominio juridico (inferida del nombre del adaptador, no verificada con evaluaciones).
- Razonamiento y respuesta sobre consultas legales, presumiblemente en el idioma del dataset de entrenamiento (no declarado).
- Integracion con llama.cpp mediante `llama-cli` y `llama-server` para inferencia local.
- Compatibilidad con el ecosistema de herramientas que aceptan adaptadores LoRA GGUF (llama.cpp y derivados).
- Soporte de tool calling, agentes multi-paso, vision, audio y modo thinking: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Experimentacion con adaptadores LoRA juridicos en local: cargar el adaptador sobre el modelo base Llama 3.2 correspondiente con `llama-cli -m base_model.gguf --lora law-nlp-q8_0.gguf` para evaluar la calidad del ajuste en tareas de clasificacion o resumen de textos legales.
- Prototipado de asistentes de consulta normativa: desplegar el adaptador con `llama-server` y exponer una API compatible con OpenAI para pruebas internas de respuesta a preguntas sobre legislacion.
- Evaluacion comparativa de tecnicas de ajuste fino: usar este artefacto como referencia de un pipeline PEFT a GGUF y comparar con el adaptador original en safetensors para medir la perdida de calidad por cuantizacion Q8_0.
- Formacion y docencia: ilustrar el flujo completo de entrenamiento LoRA, conversion a GGUF y carga en llama.cpp en un curso de IA aplicada.
- Base para fusion de adaptadores: combinar este LoRA juridico con otros adaptadores de dominio mediante tecnicas de merging antes de la conversion a GGUF.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 6 millones de parametros, el coste adicional de memoria es minimo respecto al modelo base, lo que permite anadir especializacion juridica sin duplicar pesos.

## Benchmarks y rendimiento

El model-index del autor declara una entrada `law-nlp` con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: dominada por el modelo base, no por el adaptador. El adaptador Q8_0 de 6,08 M de parametros ocupa del orden de 6 MB adicionales.
- GPU recomendadas: cualquier GPU capaz de ejecutar el modelo base Llama 3.2 subyacente; una RTX 3060 de 12 GB o superior es suficiente para variantes de 1B a 3B en cuantizaciones Q4/Q8.
- Cabe en GPU de consumo: si, siempre que el modelo base quepa; el adaptador en si no impone requisitos adicionales.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es el unico soportado de forma nativa por el formato LoRA GGUF; Ollama y vLLM no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Sleem247/law-nlp-Q8_0-GGUF | 6,08 M (adaptador) | no disponible | llama3.2 | GGUF LoRA | Objeto de esta ficha |
| Sleem247/legal-llm-Q8_0-GGUF | no disponible | no disponible | no disponible | GGUF LoRA | Adaptador juridico convertido desde Farwa1994/legal-llm |
| Sleem247/law-llm-finetuned-Q8_0-GGUF | no disponible | no disponible | no disponible | GGUF | Conversion completa (no LoRA) desde ssk10/law-llm-finetuned |
| sampangtf/law-nlp | no disponible | no disponible | no disponible | safetensors (PEFT) | Adaptador original en formato nativo |

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo autonomo; requiere el modelo base correcto y una version de llama.cpp compatible con LoRA GGUF.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, idioma, dominio exacto ni metricas de evaluacion.
- Riesgo de alucinacion juridica: cualquier salida en materia legal debe verificarse por un profesional; el modelo no garantiza precision normativa.
- Licencia llama3.2: impone las restricciones de la licencia comunitaria de Llama 3.2, incluida la politica de uso aceptable y los requisitos de atribucion; conviene revisar los terminos antes de uso comercial.
- Sesgos: desconocidos, al no publicarse informacion sobre la composicion del dataset de ajuste.
- Cuantizacion Q8_0: perdida de calidad marginal pero no medida frente al adaptador original en safetensors.
- Fecha de creacion futura en los metadatos (2026-11-08): posible inconsistencia que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/law-nlp-Q8_0-GGUF
- Adaptador original: https://huggingface.co/sampangtf/law-nlp
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion de llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio relacionado (legal-llm): https://huggingface.co/Sleem247/legal-llm-Q8_0-GGUF
- Repositorio relacionado (law-llm-finetuned): https://huggingface.co/Sleem247/law-llm-finetuned-Q8_0-GGUF
