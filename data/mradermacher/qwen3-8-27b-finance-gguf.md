# mradermacher/Qwen3.8-27B-finance-GGUF

## Resumen

Qwen3.8-27B-finance-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-27B-finance, un ajuste fino (LoRA/QLoRA) del modelo base Qwen3.8-27B orientado al dominio financiero y publicado por el usuario nico248000000000. La cuantizacion la realiza mradermacher, un conocido empaquetador de pesos GGUF para llama.cpp, que genera un conjunto de variantes estaticas desde Q2_K hasta Q8_0, ademas de los ficheros mmproj necesarios para el procesamiento multimodal.

El modelo conserva la naturaleza multimodal del original: la pipeline declarada es image-text-to-text, con soporte de vision y video, y esta pensado para conversaciones (tag conversational). Con 27.320.697.856 parametros (unos 27,3 mil millones), se situa en la franja de modelos densos de gran tamano que requieren cuantizacion agresiva para caber en hardware de consumo. El repositorio ocupa 190,8 GB e incluye todas las variantes de cuantizacion.

Su relevancia practica es doble: por un lado, ofrece una via para ejecutar un modelo especializado en finanzas con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) sin necesidad de GPU de datacenter; por otro, documenta un caso tipico de la cadena de valor del ecosistema abierto, donde un ajuste LoRA comunitario se distribuye en cuantizaciones listas para produccion. La licencia es "other", heredada del modelo base, y las lenguas declaradas son ingles y frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con vision y video; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, fr |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B-finance, un ajuste fino del Qwen3.8-27B de 27,3 mil millones de parametros. La model card del repositorio GGUF indica que el ajuste se realizo con LoRA y QLoRA sobre el modelo base, y etiqueta el resultado con los tags unsloth, lora, qlora y finance. Esto sugiere un entrenamiento de adaptacion de bajo rango sobre pesos cuantizados, una tecnica habitual para especializar modelos grandes con recursos limitados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset financiero ni si hubo fases de RLHF o DPO.

La arquitectura subyacente es un transformer multimodal: la pipeline image-text-to-text y los ficheros mmproj confirman que el modelo procesa imagenes y video ademas de texto. El repositorio GGUF incluye proyecciones multimodales en Q8_0 (0,7 GB) y f16 (1,0 GB), que deben cargarse junto con los pesos del modelo para habilitar la entrada visual. La cuantizacion es estatica (quantize_version 2, output_tensor_quantised 1), sin variantes ponderadas por imatrix en el momento de la publicacion; el autor indica que podrian no estar disponibles.

## Capacidades

- Generacion de texto conversacional multi-turno, con el tag conversational en el repositorio.
- Razonamiento y analisis en dominio financiero, gracias al ajuste LoRA/QLoRA sobre datos de finanzas.
- Procesamiento de imagenes y video como entrada (image-text-to-text), util para documentos escaneados, graficos y capturas.
- Soporte multilingue limitado a ingles y frances segun la model card.
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking ni agentes multi-paso.

## Casos de uso

- Analisis de documentos financieros escaneados: el modelo puede recibir la imagen de un balance o una factura y responder preguntas sobre su contenido, combinando la entrada visual con el ajuste en dominio financiero.
- Extraccion y resumen de informes trimestrales: con el componente de vision puede procesar graficos de resultados y tablas presentadas como imagen, y generar resumenes en ingles o frances.
- Asistente interno de preguntas sobre productos financieros: conversaciones multi-turno sobre terminologia, ratios o conceptos contables, ejecutables en infraestructura propia con llama.cpp.
- Clasificacion y etiquetado de capturas de pantalla de terminales financieras (Bloomberg, Reuters) para pipelines de datos, aprovechando la entrada image-text-to-text.
- Prototipado de chatbots financieros bilingues (en/fr) en entornos con requisitos de privacidad, al poder desplegarse localmente sin enviar datos a la nube.
- Investigacion sobre ajuste fino en dominio: sirve como punto de partida para experimentos de LoRA/QLoRA en finanzas y para comparar el efecto de distintas cuantizaciones GGUF sobre la calidad.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (16,9 GB) o IQ4_XS (15,5 GB) permiten ejecutar el modelo en GPUs de 24 GB, algo inviable con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. A estas cifras hay que sumar el fichero mmproj (0,7-1,0 GB) si se usa la entrada multimodal.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M e IQ4_XS; A100 40 GB, H100 o RTX 6000 Ada para Q6_K y Q8_0; configuraciones con dos GPUs de 24 GB para las variantes de mayor calidad.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB solo con Q2_K o Q3_K_S; en 24 GB con Q4_K_M, IQ4_XS y Q5_K_M; en 32 GB o mas con Q6_K y Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints (el repositorio incluye el tag endpoints_compatible). Los ficheros multi-parte deben concatenarse segun la guia de TheBloke referenciada en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-finance-GGUF (este) | 27,3 B | no disponible | Si (vision, video) | other | GGUF |
| Qwen3.8-27B (base, sin ajuste financiero) | ~27 B | no disponible | Si | no disponible en la informacion | safetensors, GGUF |
| Qwen3.8-27B-finance (adapter original) | 27,3 B | no disponible | Si | other | safetensors |

No se dispone de datos de rendimiento comparado ni de alternativas financieras de tamano similar verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los terminos del modelo base y del ajuste antes de cualquier uso comercial; la model card no detalla condiciones.
- Modelo especializado en finanzas: puede presentar degradacion en tareas generales fuera de dominio y no debe usarse como asesor financiero sin supervision humana.
- Riesgo de alucinacion en cifras, ratios y referencias normativas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Idiomas limitados a ingles y frances; el castellano no esta declarado como soportado.
- Las cuantizaciones son estaticas y no ponderadas por imatrix, lo que puede reducir la calidad frente a variantes ponderadas en los niveles bajos.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas de contexto largo con garantias.
- No se documentan capacidades de tool calling ni de agentes, por lo que no conviene asumirlas en produccion sin validacion.
- El repositorio es grande (190,8 GB) y requiere descargar solo la variante necesaria; los ficheros multi-parte deben concatenarse correctamente antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-finance-GGUF
- Modelo base del ajuste: https://huggingface.co/nico248000000000/Qwen3.8-27B-finance
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-finance-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
