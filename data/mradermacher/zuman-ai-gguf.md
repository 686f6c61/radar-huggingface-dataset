# mradermacher/zuman.ai-GGUF

## Resumen

zuman.ai es un modelo de lenguaje conversacional y multilingue desarrollado por DawitShibabaw, orientado especificamente a lenguas etiopes y del Cuerno de Africa: amharico (am), afaan oromoo (om), tigrinya (ti) y somali (so), ademas de ingles (en). La version aqui documentada es una cuantizacion GGUF estatica producida por mradermacher a partir de los pesos originales en formato Hugging Face, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 11.907.350.576 parametros (aproximadamente 11,9 mil millones), lo que lo situa en la franja de los modelos de ~12B, un tamano que equilibra calidad y requisitos de inferencia. Los tags de la model card lo etiquetan como derivado de la familia Gemma, aunque la informacion disponible no confirma explicitamente la arquitectura interna ni los detalles del entrenamiento.

Su relevancia radica en la escasez de modelos abiertos con cobertura real de lenguas de bajos recursos como el tigrinya o el afaan oromoo, y en la disponibilidad de cuantizaciones GGUF que facilitan el despliegue local en regiones con infraestructura limitada. No obstante, la informacion publica es muy escasa: no hay benchmarks, no se especifica licencia y el repositorio registra cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican familia Gemma; sin confirmar) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16, mmproj-Q8_0 |
| Idiomas soportados | am (amharico), om (afaan oromoo), ti (tigrinya), so (somali), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en formato Hugging Face/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Los tags del repositorio incluyen "gemma", lo que sugiere que el modelo base deriva de la familia Gemma de Google, pero no se confirma el tipo exacto de transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion. Tampoco se especifica si emplea atencion con ventana deslizante, atencion completa o alguna variante hibrida.

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La presencia de un archivo `mmproj` (multi-modal projection) en las cuantizaciones sugiere que el modelo base podria tener capacidades multimodales, pero no se aporta confirmacion ni detalles sobre el modulo de vision. La cuantizacion fue realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, empleando cuantizaciones estaticas (sin imatrix), segun indica el propio autor.

## Capacidades

- Generacion de texto conversacional en amharico, afaan oromoo, tigrinya, somali e ingles.
- Soporte multilingue con enfasis en lenguas del Cuerno de Africa y Etiopia.
- Posible capacidad multimodal: el repositorio incluye un archivo `mmproj-Q8_0` (suplemento multi-modal), aunque no se detalla que modalidades cubre.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking o razonamiento extendido: no documentado.
- Capacidades de codigo y matematicas: no documentadas.

## Casos de uso

- Atencion al cliente en lenguas etiopes: el modelo puede gestionar conversaciones multi-turno en amharico, tigrinya u oromoo, cubriendo un nicho que la mayoria de modelos abiertos no atiende. Adecuado para entidades publicas y empresas locales que necesitan asistencia automatizada en la lengua del usuario.
- Traduccion asistida entre lenguas locales e ingles: util para ONG, organismos internacionales y medios de comunicacion que operan en Etiopia y Somalia y necesitan traduccion de documentos o comunicados.
- Digitalizacion de contenido educativo: generacion de resumenes y materiales de estudio en amharico y afaan oromoo para plataformas de e-learning locales, donde los recursos en estas lenguas son escasos.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_S (7,1 GB) y Q2_K (4,9 GB), el modelo puede ejecutarse en estaciones de trabajo con GPU de gama media o incluso en CPU, lo que facilita su adopcion en entornos con infraestructura limitada.
- Investigacion en PLN de bajos recursos: sirve como base para fine-tuning y evaluacion en tigrinya, somali y oromoo, lenguas con poca representacion en benchmarks y corpus abiertos.
- Prototipado de asistentes conversacionales regionales: con llama.cpp u Ollama, un equipo puede levantar un prototipo funcional en horas sin depender de APIs externas ni de conectividad estable.
- Moderacion y clasificacion de texto en lenguas locales: el modelo puede emplearse para tareas de etiquetado o filtrado de contenido en amharico y somali, previa validacion especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~4,9 GB; Q4_K_S ~7,1 GB; Q8_0 ~12,7 GB; F16 ~23,8 GB.
- GPU recomendadas: para Q4_K_S, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, se recomienda RTX 4090 (24 GB) o A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando Q2_K o Q4_K_S; las cuantizaciones Q5 y Q6 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo OpenAI.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| zuman.ai (este) | ~11,9B | no disponible | am, om, ti, so, en | no disponible | GGUF / HF |
| Gemma 2 9B | 9B | 8K | multilingue (principalmente europeas) | Gemma Terms | safetensors, GGUF |
| Qwen2.5 7B | 7B | 128K | multilingue amplio | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | multilingue (8 idiomas) | Llama 3.1 Community | safetensors, GGUF |

La comparativa es orientativa: ninguno de los modelos alternativos declara soporte nativo para tigrinya, amharico o afaan oromoo, lo que constituye el principal diferenciador de zuman.ai. Sin embargo, la falta de benchmarks y de licencia clara impide una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo en tareas estandar ni compararlo objetivamente con alternativas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar el repositorio del modelo base antes de desplegarlo en produccion.
- Riesgo de alucinacion: como todo modelo generativo de ~12B, puede producir contenido facticamente incorrecto, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son limitados.
- Cobertura limitada a cinco idiomas: fuera de am, om, ti, so y en, el rendimiento probablemente sea deficiente o inexistente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas por imatrix, lo que puede implicar una perdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3) respecto a alternativas con imatrix.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o correccion de errores.
- Capacidad multimodal incierta: la presencia de `mmproj` sugiere vision, pero no se documenta su funcionamiento ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zuman.ai-GGUF
- Modelo base: https://huggingface.co/DawitShibabaw/zuman.ai
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#zuman.ai-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
