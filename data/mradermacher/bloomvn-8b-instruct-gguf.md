# mradermacher/BloomVN-8B-instruct-GGUF

## Resumen

BloomVN-8B-instruct es un modelo de lenguaje conversacional de 8.546.930.176 parametros (aproximadamente 8,5 mil millones), desarrollado por BlossomsAI y especializado en instrucciones en vietnamita e ingles. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base es BlossomsAI/BloomVN-8B-instruct, afinado sobre el dataset BlossomsAI/reduced_vietnamese_instruction_dataset.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad un modelo de 8B optimizado para vietnamita en formatos GGUF listos para usar con llama.cpp, Ollama y otras herramientas de inferencia local. Al tratarse de cuantizaciones estaticas (sin imatrix ni weighted quants en el momento de la publicacion), el autor ofrece un rango de 11 variantes que van desde Q2_K (3,5 GB) hasta f16 (17,2 GB), cubriendo desde despliegues en hardware muy limitado hasta inferencia de alta fidelidad.

La licencia MIT facilita el uso comercial sin restricciones significativas, y el soporte bilingue ingles-vietnamita lo hace adecuado para aplicaciones de atencion al cliente, procesamiento de documentos y asistentes conversacionales dirigidos al mercado vietnamita, una comunidad relativamente poco atendida por los grandes modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles especificos no disponibles) |
| Parametros totales | 8.546.930.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el numero de parametros (8,5B) y la nomenclatura "8B", se trata presumiblemente de un transformer decoder-only de escala 8B, pero no se confirman detalles como el numero de capas, dimensiones ocultas, mecanismo de atencion (MHA, GQA, etc.) ni funcion de activacion. Tampoco se especifica la longitud de contexto nativa del modelo base.

El entrenamiento se realizo mediante afinado por instrucciones (instruction tuning) sobre el dataset BlossomsAI/reduced_vietnamese_instruction_dataset, segun indica la model card. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia humana. La cuantizacion publicada por mradermacher corresponde a quants estaticos (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin versiones weighted/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y vietnamita.
- Seguimiento de instrucciones (instruction following) gracias al afinado especifico sobre un dataset de instrucciones en vietnamita.
- Razonamiento basico y respuesta a preguntas en ambos idiomas soportados.
- Generacion de texto creativo y redaccion asistida.
- Soporte de conversaciones con rol de sistema, usuario y asistente (formato conversacional).
- Compatibilidad con endpoints y herramientas de inferencia estandar (llama.cpp, Ollama, etc.) al estar en formato GGUF.
- No se documentan capacidades de vision, audio, tool calling nativo, agentes o modo thinking extendido en la informacion disponible.

## Casos de uso

- Atencion al cliente en vietnamita: el modelo puede gestionar conversaciones multi-turno con usuarios vietnamitas, un mercado poco cubierto por modelos generalistas, gracias a su afinado especifico sobre instrucciones en ese idioma.

- Asistentes conversacionales locales: al estar disponible en GGUF desde 3,5 GB (Q2_K), puede desplegarse en portatiles y equipos de sobremesa sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo privacidad total al no requerir conexion a la nube.

- Procesamiento de documentos y resumenes en vietnamita: util para digitalizar y resumir documentacion empresarial, contratos o articulos en vietnamita dentro de flujos internos de una organizacion.

- Traduccion asistida ingles-vietnamita: aunque no es un modelo de traduccion especializado, su naturaleza bilingue permite usarlo como apoyo en tareas de traduccion o reescritura entre ambos idiomas.

- Generacion de contenido para marketing local: redaccion de textos promocionales, publicaciones en redes sociales y correos electronicos dirigidos al publico vietnamita.

- Educacion y tutoria: asistente de estudio para estudiantes vietnamitas que necesiten explicaciones, ejercicios o resumenes en su idioma, desplegado en entornos con recursos limitados.

- Prototipado rapido en investigacion: al tener licencia MIT y formato GGUF ligero, es adecuado para experimentos academicos sobre modelos bilingues de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (3,5 GB): aproximadamente 4 GB de VRAM o RAM.
  - Q4_K_M (5,3 GB, recomendado): aproximadamente 6 GB de VRAM.
  - Q5_K_M (6,2 GB): aproximadamente 7 GB de VRAM.
  - Q6_K (7,1 GB): aproximadamente 8 GB de VRAM.
  - Q8_0 (9,2 GB): aproximadamente 10 GB de VRAM.
  - f16 (17,2 GB): aproximadamente 18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4070/4080/4090 para Q6_K y Q8_0; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4 y Q5; en 12 GB o mas para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien es posible usar vLLM o TGI con los pesos originales en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BloomVN-8B-instruct (este) | 8,5B | no disponible | en, vi | MIT | GGUF, safetensors |
| Llama 3.1 8B Instruct | 8B | 128K | multilingue (incluye es, en, etc.; vietnamita no oficial) | Llama 3.1 Community License | GGUF, safetensors |
| Qwen2.5 7B Instruct | 7,6B | 128K | multilingue (incluye vietnamita) | Apache 2.0 | GGUF, safetensors |
| Mistral 7B Instruct | 7,2B | 32K | principalmente ingles | Apache 2.0 | GGUF, safetensors |

Nota: la comparativa se basa en caracteristicas publicas conocidas de los modelos alternativos; no se dispone de datos de rendimiento comparativo del modelo BloomVN en benchmarks estandar.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este modelo; se recomienda validacion en produccion.
- El modelo esta afinado principalmente para vietnamita e ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- La longitud de contexto no esta documentada; asumir contextos cortos (probablemente 4K-8K) hasta confirmacion.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- No hay versiones weighted/imatrix disponibles, lo que puede suponer una ligera perdida de calidad frente a quants con imatrix a igual tamano.
- Aunque la licencia es MIT, el modelo base podria heredar restricciones de los datos de entrenamiento originales; conviene revisar la model card del modelo base.
- El modelo tiene un numero reducido de descargas (136) y ningun "like", lo que sugiere poca validacion por parte de la comunidad; usar con cautela en entornos criticos.
- Riesgo de alucinacion inherente a modelos de 8B; no apto para tareas que requieran alta precision factual sin verificacion externa.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/BloomVN-8B-instruct-GGUF
- Modelo base: https://huggingface.co/BlossomsAI/BloomVN-8B-instruct
- Dataset de instrucciones: https://huggingface.co/datasets/BlossomsAI/reduced_vietnamese_instruction_dataset
- Pagina de resumen del autor: https://hf.tst.eu/model#BloomVN-8B-instruct-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
