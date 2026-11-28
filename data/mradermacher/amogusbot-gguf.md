# mradermacher/AmogusBot-GGUF

## Resumen

AmogusBot-GGUF es la coleccion de cuantizaciones en formato GGUF del modelo AmogusBot, publicado originalmente por el usuario breadeater1496 en Hugging Face. El trabajo de cuantizacion lo firma mradermacher, un conocido generador de quants de la comunidad open source que convierte modelos en safetensors a formatos ligeros para inferencia local con llama.cpp y derivados. El modelo base cuenta con 406.286.336 parametros (aproximadamente 406 millones), lo que lo situa en la gama de modelos pequenos orientados a conversacion.

La relevancia de esta ficha es acotada: se trata de un modelo de la comunidad sin documentacion tecnica publicada, sin resultados de benchmarks y sin informacion sobre el dataset de entrenamiento. Su interes practico reside en que, gracias a las cuantizaciones GGUF, puede ejecutarse en hardware muy modesto (incluso en CPU) y sirve como ejemplo de modelo conversacional ligero de bajo coste. No obstante, la ausencia de licencia declarada y de evaluaciones lo convierten en una opcion poco recomendable para produccion sin una auditoria previa.

La model card del repositorio cuantizado se limita a listar los ficheros GGUF generados (desde Q2_K hasta f16) e incluye las notas habituales de mradermacher sobre tipos de cuantizacion. No aporta informacion sobre arquitectura, contexto, datos de entrenamiento ni capacidades especificas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: breadeater1496/AmogusBot) |
| Parametros totales | 406.286.336 (~406 M) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base breadeater1496/AmogusBot. Por el numero de parametros (~406 M) y la etiqueta `transformers` del repositorio, se trata presumiblemente de un transformer pequeno, pero no hay confirmacion en la documentacion disponible. Tampoco se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico detalle tecnico documentado es el proceso de cuantizacion realizado por mradermacher: cuantizaciones estaticas (sin imatrix ni weighted quants, segun indica el propio autor) generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de los pesos en formato Hugging Face. El repositorio ocupa 3,8 GB e incluye doce variantes de cuantizacion, desde Q2_K (0,3 GB) hasta f16 (0,9 GB).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos, aunque no hay documentacion que detalle su calidad.
- Idioma: soporte declarado unicamente de ingles.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multimodal (vision, audio) ni modo de razonamiento explicito.
- El nombre del modelo sugiere un posible sesgo tematico hacia contenido relacionado con el videojuego Among Us, aunque esto no esta confirmado en la documentacion.

## Casos de uso

- Prototipado rapido de chatbots: con cuantizaciones de 0,3-0,5 GB, el modelo puede cargarse en un portatil o incluso en una Raspberry Pi para validar pipelines conversacionales antes de invertir en modelos mayores.
- Inferencia en CPU sin GPU: los ficheros Q4_K_S y Q4_K_M (0,3-0,4 GB) permiten ejecutar el modelo con llama.cpp en equipos sin acelerador grafico, util para entornos de pruebas o demos offline.
- Educacion y experimentacion: sirve para que estudiantes comprendan el flujo completo de cuantizacion GGUF y despliegue local con modelos de menos de 500 M de parametros.
- Generacion de texto de bajo coste en edge: para tareas de autocompletado o respuestas cortas en dispositivos con memoria limitada, donde un modelo de 406 M cuantizado a Q4 cabe en menos de 1 GB de RAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de salida con un caso controlado.
- Base para fine-tuning ligero: al ser un modelo pequeno, puede ajustarse en una unica GPU consumer para tareas conversacionales especificas, aunque la falta de licencia clara obliga a verificar los terminos antes de cualquier uso derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,3 GB (Q2_K) y 0,9 GB (f16) solo para los pesos; anadir overhead de contexto y runtime (tipicamente 0,2-1 GB adicionales segun la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Tambien funciona en GPUs integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con transformers.
- Latencia y throughput: no disponibles; al tratarse de un modelo de ~406 M de parametros, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AmogusBot (este) | ~406 M | no disponible | no disponible | GGUF, safetensors | Hugging Face |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-360M | ~362 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

La comparativa es orientativa: AmogusBot carece de documentacion tecnica y de benchmarks publicados, mientras que las alternativas citadas cuentan con evaluaciones abiertas y licencias permisivas. Para cualquier caso de uso en produccion, los modelos de la tabla ofrecen mayores garantias.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo legal relevante para produccion.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, sesgos o robustez del modelo.
- Riesgo de alucinacion elevado: los modelos pequenos (~400 M) sin alineacion documentada tienden a generar contenido incoherente o inventado, especialmente en tareas de razonamiento.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Contexto desconocido: se desconoce la ventana de contexto, lo que dificulta planificar conversaciones multi-turno o tareas con documentos largos.
- Documentacion minima: la model card del repositorio cuantizado solo lista ficheros; no hay informacion sobre el dataset, el entrenamiento ni las capacidades reales.
- Origen comunitario sin verificacion: el modelo base procede de un usuario individual sin trayectoria documentada, por lo que conviene tratarlo como experimental.
- Sin cuantizaciones imatrix: el autor indica que no hay weighted/imatrix quants, lo que reduce la calidad potencial en tamanos pequenos frente a alternativas con imatrix.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AmogusBot-GGUF
- Modelo base: https://huggingface.co/breadeater1496/AmogusBot
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#AmogusBot-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
