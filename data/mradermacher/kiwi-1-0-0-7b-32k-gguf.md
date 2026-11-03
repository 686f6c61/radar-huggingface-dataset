# mradermacher/Kiwi-1.0-0.7B-32k-GGUF

## Resumen

Kiwi-1.0-0.7B-32k-GGUF es la version cuantizada en formato GGUF del modelo Kiwi-1.0-0.7B-32k, desarrollado originalmente por el usuario empirischtech y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de tipo transformer decoder-only con 702.806.144 parametros (aproximadamente 0,7 mil millones) y una ventana de contexto de 32.000 tokens, entrenado exclusivamente en ingles sobre el corpus de Wikipedia (dataset wikimedia/wikipedia). Su proposito principal es ofrecer un modelo compacto de generacion de texto conversacional que pueda ejecutarse en hardware modesto gracias a las cuantizaciones disponibles.

La relevancia de esta publicacion radica en su formato: al estar disponible en GGUF con cuantizaciones desde Q2_K (0,5 GB) hasta f16 (1,5 GB), el modelo puede desplegarse en CPU y en GPUs de consumo con pocos recursos de VRAM, lo que lo hace util para prototipado rapido, experimentacion local y entornos con restricciones de hardware. La combinacion de un tamano reducido con un contexto de 32k tokens es poco habitual en modelos de esta escala.

No obstante, conviene senalar que se trata de una cuantizacion estatica (no hay cuantizaciones ponderadas/imatrix disponibles segun la model card) y que la informacion publicada sobre el modelo base es limitada: no se documentan detalles de arquitectura interna, datos de entrenamiento mas alla de Wikipedia, ni resultados de benchmarks. El modelo esta etiquetado como conversacional y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles) |
| Parametros totales | 702.806.144 (aproximadamente 0,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (segun nombre del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer decoder-only estandar, con 702.806.144 parametros. El nombre del modelo indica una ventana de contexto de 32.000 tokens, aunque no se especifica la tecnica empleada para extender el contexto (RoPE scaling, attention lineal u otras). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre el tokenizador.

En cuanto al entrenamiento, la unica informacion publicada es que se utilizo el dataset wikimedia/wikipedia como fuente de datos, lo que sugiere un entrenamiento centrado en texto enciclopedico en ingles. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco hay informacion sobre innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion eficiente. La cuantizacion fue realizada por mradermacher con quantize_version 2 y convert_type hf, generando cuantizaciones estaticas (sin variantes imatrix ponderadas).

## Capacidades

- Generacion de texto en ingles: el modelo esta disenado para producir texto coherente en ingles, con etiqueta conversacional en HuggingFace.
- Conversacion multi-turno: la etiqueta "conversational" y el pipeline asociado indican soporte para dialogos, aunque no se documenta el formato de plantilla de chat.
- Contexto largo: ventana de 32.000 tokens, adecuada para procesar documentos extensos o conversaciones prolongadas.
- Razonamiento basico y respuesta a preguntas: derivado del entrenamiento sobre Wikipedia, puede responder preguntas factuales de dominio enciclopedico.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta vision, audio ni modo "thinking".

## Casos de uso

- Prototipado local en CPU: gracias a las cuantizaciones de 0,5-0,9 GB, el modelo puede ejecutarse con llama.cpp u Ollama en portatiles sin GPU dedicada, permitiendo experimentar con generacion de texto y chat sin infraestructura en la nube.
- Respuesta a preguntas sobre contenido enciclopedico: al haberse entrenado sobre Wikipedia en ingles, es adecuado para tareas de QA factual en dominios cubiertos por la enciclopedia, integrado en un pipeline RAG para mitigar alucinaciones.
- Resumen de documentos largos: con 32k tokens de contexto, puede procesar articulos o informes extensos y generar resumenes, aunque la calidad estara limitada por el tamano del modelo.
- Chatbot de bajo coste para demos: su naturaleza conversacional y su reducido footprint permiten desplegar un asistente basico en entornos de demostracion o entornos con recursos limitados.
- Generacion de texto asistida en ingles: util para redaccion de borradores, parafraseo o generacion de contenido textual donde no se requiera alta precision.
- Filtrado y clasificacion de texto: puede emplearse como modelo base para tareas de etiquetado o clasificacion simple mediante prompting, ejecutandose en batch sobre CPU.
- Educacion y experimentacion academica: su tamano manejable permite estudiar el comportamiento de modelos de lenguaje pequenos, realizar fine-tuning o analizar el efecto de distintas cuantizaciones en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K/Q3_K_S), 0,6 GB (Q4_K_M/IQ4_XS), 0,7-0,8 GB (Q5/Q6), 0,9 GB (Q8_0) y 1,5 GB (f16), sin contar el overhead del runtime ni la cache KV para 32k tokens.
- La cache KV para 32.000 tokens puede anadir varios cientos de MB o mas segun la configuracion de atencion; no se dispone de cifras exactas.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente para las cuantizaciones mas pequenas; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En CPU se espera un throughput bajo (decenas de tokens por segundo en hardware moderno), aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kiwi-1.0-0.7B-32k (este) | 0,7B | 32k | CC-BY-4.0 | GGUF/safetensors | Entrenado sobre Wikipedia en ingles; sin benchmarks publicados |
| Qwen2.5-0.5B | 0,5B | 32k | Apache-2.0 | safetensors/GGUF | Modelo ampliamente evaluado, multilingue, con benchmarks publicados |
| SmolLM2-360M | 0,36B | 8k | Apache-2.0 | safetensors/GGUF | Modelo pequeno con benchmarks publicados y soporte multilingue limitado |
| TinyLlama-1.1B | 1,1B | 2k-32k (segun variante) | Apache-2.0 | safetensors/GGUF | Entrenado con 3T tokens, benchmarks publicados |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento comparativo directo con Kiwi-1.0-0.7B-32k al no haberse publicado benchmarks de este ultimo.

## Limitaciones y advertencias

- Entrenamiento limitado a Wikipedia en ingles: el modelo puede carecer de conocimiento sobre dominios especializados, actualidad posterior a la fecha de corte del dataset o contenido en otros idiomas.
- Riesgo elevado de alucinacion: al ser un modelo de 0,7B entrenado sobre un corpus enciclopedico, es probable que genere afirmaciones incorrectas con aparente seguridad, especialmente fuera del dominio de Wikipedia.
- Solo soporta ingles: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Sin benchmarks publicados: no es posible evaluar objetivamente su calidad frente a alternativas; se recomienda validacion empirica antes de usarlo en produccion.
- Sin informacion sobre alineacion: no se documenta si se aplicaron tecnicas de RLHF/DPO, por lo que puede producir contenido sesgado, toxico o no alineado con instrucciones.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero requiere citar al autor original (empirischtech) y al cuantizador (mradermacher) segun corresponda.
- Cuantizaciones estaticas unicamente: no hay variantes imatrix ponderadas, lo que puede implicar una perdida de calidad algo mayor en cuantizaciones bajas (Q2/Q3) frente a alternativas ponderadas.
- Formato de chat no documentado: no se especifica la plantilla de conversacion, lo que puede afectar al rendimiento en modo chat si no se configura correctamente.
- Contexto de 32k tokens: la cache KV asociada puede consumir recursos significativos en hardware limitado, y la calidad del modelo en contextos muy largos no esta verificada.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Kiwi-1.0-0.7B-32k-GGUF
- Modelo base: https://huggingface.co/empirischtech/Kiwi-1.0-0.7B-32k
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kiwi-1.0-0.7B-32k-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
