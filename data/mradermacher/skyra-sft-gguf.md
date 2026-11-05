# mradermacher/Skyra-SFT-GGUF

## Resumen

Skyra-SFT-GGUF es la distribucion en formato GGUF del modelo Skyra-SFT, publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo original, alojado en JoeLeelyf/Skyra-SFT, es un transformer denso de aproximadamente 7.600 millones de parametros (7,615,616,512 segun los pesos en safetensors) entrenado mediante fine-tuning supervisado (SFT). Su proposito es servir como modelo conversacional en ingles con capacidad de generacion de texto y, segun los ficheros mmproj incluidos en el repositorio, soporte multimodal (vision).

La relevancia de esta publicacion radica en que mradermacher ofrece un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16, ademas de IQ4_XS) que permiten ejecutar un modelo de ~7,6B parametros en hardware de consumo, algo imposible con los pesos originales en precision completa. El repositorio ocupa 70,4 GB en total, pero cada cuantizacion individual va desde 3,1 GB (Q2_K) hasta 15,3 GB (f16), lo que facilita el despliegue local con llama.cpp u Ollama.

No se dispone de informacion detallada sobre la arquitectura interna, el dataset de entrenamiento, la longitud de contexto ni los resultados de benchmarks, ya que la model card se limita a describir el proceso de cuantizacion. La licencia tampoco esta especificada, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base JoeLeelyf/Skyra-SFT mas alla de que se trata de un transformer denso de ~7,6B parametros alojado en el ecosistema transformers. El sufijo "SFT" indica que el modelo fue afinado mediante supervised fine-tuning, probablemente sobre un modelo preentrenado de tamano similar, aunque no se especifica cual ni el volumen de datos utilizados.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La presencia de ficheros mmproj (proyeccion multimodal) en el repositorio GGUF sugiere que el modelo original incorpora un adaptador de vision, pero no se documenta su arquitectura ni el codificador visual empleado.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo original, aunque no se documenta el alcance.
- Razonamiento general y respuesta a instrucciones derivadas del fine-tuning supervisado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantizacion Q4_K_M (4,8 GB) en una GPU de consumo, gestionando dialogos multi-turno sin depender de servicios en la nube.
- Prototipado rapido de chatbots: gracias a la variedad de cuantizaciones, un equipo puede empezar con Q8_0 para evaluar calidad y bajar a Q4_K_S para produccion con recursos limitados, comparando el impacto en la calidad de las respuestas.
- Procesamiento de imagenes con descripcion textual: los ficheros mmproj permiten cargar el modelo en modo multimodal con llama.cpp, habilitando tareas de captioning o respuesta a preguntas sobre imagenes en entornos sin conectividad.
- Fine-tuning posterior sobre dominio especifico: al ser un modelo SFT de ~7,6B, sirve como base para ajustes adicionales con LoRA en tareas verticales (soporte, documentacion tecnica), partiendo de los pesos safetensors originales.
- Evaluacion comparativa de cuantizaciones: investigadores pueden usar el conjunto completo de cuantizaciones para medir la degradacion de perplexity y calidad conversacional entre Q2_K y f16 en un mismo modelo.
- Despliegue en estaciones de trabajo sin GPU dedicada: la cuantizacion Q2_K (3,1 GB) permite inferencia en CPU con RAM modesta, adecuada para demos y pruebas de concepto offline.
- Generacion de texto creativo y redaccion asistida en ingles: el modelo puede emplearse para borradores, resumenes y reescritura en pipelines de documentacion, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; IQ4_XS ~4,4 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Anadir margen para el contexto KV cache (no documentado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o despliegues con contexto muy largo.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q2_K/Q3_K hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los pesos originales en safetensors permiten vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Skyra-SFT-GGUF | ~7,6B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, mmproj multimodal |
| Mistral-7B-Instruct (GGUF) | ~7,2B | 32k (v0.2) | Apache 2.0 | GGUF | Referencia consolidada en ingles, amplio ecosistema |
| Llama-3.1-8B-Instruct (GGUF) | ~8B | 128k | Llama 3.1 Community | GGUF | Mayor contexto y soporte multilingue |
| Qwen2.5-7B-Instruct (GGUF) | ~7,6B | 32k | Apache 2.0 | GGUF | Fuerte en codigo y matematicas, multilingue |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento de Skyra-SFT que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base antes de desplegarlo en produccion.
- Idioma limitado al ingles: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas consolidadas como Mistral-7B o Llama-3.1-8B.
- Longitud de contexto desconocida: dificulta planificar casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinacion inherente a los modelos SFT de este tamano, agravado por la ausencia de documentacion sobre el dataset de entrenamiento.
- Sesgos potenciales no documentados: al no conocerse la composicion de los datos de fine-tuning, no se pueden evaluar sesgos de genero, raza o dominio.
- Procedencia del modelo base poco clara: JoeLeelyf/Skyra-SFT no cuenta con documentacion tecnica detallada, lo que reduce la trazabilidad para uso academico o auditorias.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Skyra-SFT-GGUF
- Modelo base: https://huggingface.co/JoeLeelyf/Skyra-SFT
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Skyra-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
