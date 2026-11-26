# mradermacher/SoccerNarrate-7B-GGUF

## Resumen

SoccerNarrate-7B es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en la generación de comentarios deportivos en inglés, concretamente narración de partidos de fútbol a partir de vídeo en streaming. El modelo original fue desarrollado por JiaZihan1 y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido mantenedor de cuantizaciones para llama.cpp.

El modelo parte de una base de 7B parámetros y ha sido ajustado mediante DPO (Direct Preference Optimization) para producir narraciones fluidas y contextualmente adecuadas al desarrollo del juego. Incorpora capacidad multimodal, como demuestra la presencia de ficheros `mmproj` (proyección multimodal) entre los artefactos publicados, lo que permite procesar entrada visual además de texto.

La relevancia de esta publicación radica en su carácter especializado: no es un modelo generalista, sino una herramienta de dominio concreto para narración automática de eventos deportivos, un caso de uso con demanda creciente en medios, retransmisiones y generación automatizada de resúmenes. La licencia MIT facilita su adopción comercial, aunque el idioma soportado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un modelo base de 7B; detalles especificos no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones), safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un transformer de aproximadamente 7,6 mil millones de parametros derivado del modelo base `JiaZihan1/SoccerNarrate-7B`. El modelo ha sido ajustado mediante DPO (Direct Preference Optimization), tecnica de alineacion que optimiza directamente sobre pares de respuestas preferidas y rechazadas en lugar de usar un reward model separado con RLHF. Este enfoque sugiere que el entrenamiento se centro en mejorar la calidad y naturalidad de las narraciones frente a alternativas menos adecuadas.

El conjunto de datos asociado es `JiaZihan1/SoccerNarrate-Data`, orientado a la tarea de narracion de video de futbol. La presencia de ficheros `mmproj` en la cuantizacion confirma que el modelo original incorpora un proyector multimodal que conecta un codificador visual con el modelo de lenguaje, habilitando la generacion de comentarios a partir de fotogramas o clips de video. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles sobre el codificador visual empleado.

## Capacidades

- Generacion de texto en ingles orientada a narracion deportiva.
- Generacion de comentarios de futbol a partir de entrada de video en streaming (capacidad multimodal confirmada por los ficheros mmproj).
- Ajuste fino mediante DPO para producir narraciones mas naturales y preferidas.
- Procesamiento de secuencias conversacionales (tag `conversational`).
- Capacidad multimodal texto + vision (proyector multimodal incluido).
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun los metadatos.
- No se ha documentado modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Narracion automatizada de retransmisiones de futbol: el modelo genera comentarios en tiempo real a partir de los fotogramas del partido, adecuado para canales de streaming que necesitan narracion continua sin locutor humano.
- Generacion de resumenes de partidos: a partir de clips o secuencias de video, el modelo produce descripciones narradas de las jugadas y momentos clave, util para medios deportivos que publican resumenes rapidos.
- Accesibilidad para personas con discapacidad visual: el modelo puede convertir la informacion visual de un partido en descripcion hablada, complementando sistemas de texto a voz para ofrecer una experiencia accesible.
- Creacion de contenido para redes sociales: generacion de clips narrados y descripciones de jugadas para publicacion en plataformas, con la ventaja de la licencia MIT para uso comercial.
- Prototipado de sistemas de analisis deportivo: investigadores pueden usar el modelo como componente de generacion en pipelines de analisis de video deportivo, combinado con detectores de eventos.
- Demostraciones y docencia: el modelo sirve como ejemplo de ajuste por DPO y de integracion multimodal en un dominio concreto, util en cursos y talleres de IA aplicada.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware de consumo para pruebas y desarrollo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,6-4,8 GB (Q4_K_S / Q4_K_M), 5,4-5,5 GB (Q5_K_S / Q5_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0) y 15,3 GB (f16), a los que hay que sumar el proyector multimodal (1,0 GB en Q8_0 o 1,5 GB en f16).
- GPU recomendadas: para f16 o Q8_0 se recomienda una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100). Para cuantizaciones Q4 o Q5 basta con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_S o Q4_K_M (aproximadamente 4,6-4,8 GB) en GPUs con 8 GB o mas, y en Q2_K incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base en safetensors puede servirse con vLLM o TGI si se dispone del codigo y la configuracion original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SoccerNarrate-7B | 7,6 B | no disponible | MIT | Narracion de futbol multimodal con DPO | GGUF y safetensors en HF |
| Modelos generalistas 7B (p. ej. familia Llama/Mistral/Qwen) | 7-8 B | 8k-128k segun modelo | variable (a menudo permisiva) | Proposito general, texto y a veces vision | Amplia, multiples formatos |
| Modelos especializados en video-captioning | variable | no disponible | variable | Descripcion generica de video | Depende del proyecto |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles, ya que no se han publicado benchmarks de SoccerNarrate-7B. Frente a modelos generalistas de tamano similar, su ventaja es la especializacion en el dominio y el ajuste DPO; su desventaja es la limitacion al ingles y la ausencia de datos publicos de rendimiento que permitan validar su calidad frente a alternativas.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha documentado capacidad multilingue.
- No hay benchmarks publicados, por lo que su calidad real frente a alternativas no esta validada de forma independiente.
- Al ser un modelo especializado, su comportamiento fuera del dominio del futbol y la narracion deportiva puede degradarse notablemente.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar eventos, nombres de jugadores o marcadores no presentes en la entrada visual; en un contexto de retransmision esto es especialmente critico.
- La licencia MIT permite uso comercial sin restricciones significativas, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia de las narraciones; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre sesgos especificos, pero un modelo entrenado en un dominio deportivo concreto puede reflejar sesgos presentes en los datos de narracion originales.

## Enlaces

- Repositorio Hugging Face (cuantizacion GGUF): https://huggingface.co/mradermacher/SoccerNarrate-7B-GGUF
- Modelo base: https://huggingface.co/JiaZihan1/SoccerNarrate-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/JiaZihan1/SoccerNarrate-Data
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#SoccerNarrate-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
