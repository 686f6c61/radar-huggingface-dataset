# AbdulSittar/llama2-lora-covid

## Resumen

LoRA COVID es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre LLaMA 2 7B y ajustado para tareas conversacionales relacionadas con la COVID-19. Lo desarrolla Abdul Sittar en el marco del proyecto europeo TWON (TWin of Online Social Networks, proyecto 101095095), y se publica bajo licencia Apache 2.0 en Hugging Face con el identificador `AbdulSittar/llama2-lora-covid`.

El modelo no es un modelo base completo, sino un adaptador PEFT que debe combinarse con los pesos originales de LLaMA 2 7B para su uso. Su proposito es generar respuestas de texto en ingles sobre tematicas de COVID (variantes, vacunas, conversacion social) a partir de un ajuste fino realizado sobre el dataset Social Graph Inference de Reddit, que incluye agentes de dominio COVID con mas de un millon de publicaciones y comentarios.

Es relevante por su caracter de ejemplo de ajuste fino especializado de bajo coste sobre un modelo abierto, y por su vinculacion a un dataset empirico de simulacion social. No obstante, el repositorio no incluye informacion sobre hiperparametros de entrenamiento, volumen de tokens, resultados de evaluacion ni detalles de la composicion exacta del corpus utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 2 7B) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base LLaMA 2 7B tiene 7 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base LLaMA 2 7B: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre LLaMA 2 7B, un transformer decoder-only con atencion causal. El adaptador se entrena con las librerias PEFT y Transformers de Hugging Face y se serializa en safetensors. El repositorio incluye `adapter_config.json` (movido a `configs/`), tokenizador (`tokenizer.model`, `tokenizer.json`), mapa de tokens especiales y una plantilla de conversacion (`chat_template.jinja`).

El entrenamiento se realizo sobre el dataset Social Graph Inference Reddit (DOI: https://zenodo.org/records/18082502), creado por Sittar, Gucek y Cesnovar. El dataset contiene 33 agentes de tecnologia, 14 de clima y 7 de COVID, cada dominio con mas de un millon de publicaciones y comentarios, y define relaciones dirigidas y ponderadas entre agentes. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del subconjunto usado, la configuracion de LoRA (rango, alpha, dropout) ni si se aplicaron tecnicas de RLHF o DPO. No se documenta ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto conversacional en ingles sobre tematicas de COVID-19 (variantes, vacunas, discusion social).
- Ajuste fino especializado para el dominio de conversaciones extraidas de Reddit.
- Uso mediante la plantilla de chat incluida (`chat_template.jinja`) para inferencia conversacional.
- Compatible con el ecosistema PEFT/Transformers para carga del adaptador sobre LLaMA 2 7B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (la model card indica solo ingles).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales sobre COVID-19: el adaptador puede cargarse sobre LLaMA 2 7B para generar respuestas en ingles sobre variantes y vacunas, util para demos internas y pruebas de concepto.
- Simulacion social basada en agentes: dado que el dataset de origen modela agentes COVID y sus interacciones en Reddit, el adaptador puede emplearse para generar mensajes sinteticos coherentes con el dominio en experimentos de simulacion.
- Investigacion en ajuste fino con LoRA: sirve como referencia reproducible de un adaptador PEFT de bajo coste sobre un modelo abierto, util para estudiar el efecto del ajuste en dominios especializados.
- Analisis de discurso en redes sociales: puede generar texto de referencia para comparar con publicaciones reales de Reddit en tareas de analisis de opinion o deteccion de desinformacion.
- Educacion y divulgacion: generacion de material divulgativo en ingles sobre COVID-19 en entornos controlados, con supervision humana.
- Base para nuevos ajustes: al ser un adaptador LoRA, puede combinarse o continuarse con otros adaptadores para tareas relacionadas con salud publica o redes sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base LLaMA 2 7B. En fp16 se requieren aproximadamente 14 GB; en cuantizacion de 8 bits unos 7-8 GB; en 4 bits unos 4-5 GB. El adaptador LoRA anade una sobrecarga minima (decenas de MB).
- GPU recomendadas: A100 40 GB o H100 para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) para fp16; GPUs con 8-12 GB (RTX 3080, RTX 4070) para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion, en GPUs de 8 GB o mas, siempre que se disponga del modelo base LLaMA 2 7B.
- Opciones de despliegue: Transformers con PEFT (carga del adaptador), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), vLLM (soporte de adaptadores LoRA), TGI (soporte de adaptadores).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoRA COVID (este) | adaptador sobre 7B | no disponible | LoRA sobre LLaMA 2 7B | Apache 2.0 | Hugging Face |
| LLaMA 2 7B Chat | 7B | 4096 tokens | modelo base | Llama 2 Community License | Meta / Hugging Face |
| Mistral 7B Instruct | 7B | 8192 tokens | modelo base | Apache 2.0 | Hugging Face |
| Adaptadores LoRA comunitarios sobre LLaMA 2 | variable | variable | LoRA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador, por lo que la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Requiere el modelo base LLaMA 2 7B, cuya licencia (Llama 2 Community License) impone restricciones adicionales distintas de la Apache 2.0 del adaptador; es necesario revisar ambas.
- Entrenado unicamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Dominio muy restringido (COVID-19 y conversaciones de Reddit); el rendimiento fuera de ese ambito puede degradarse.
- Riesgo de alucinacion en contenido sanitario: no debe usarse como fuente de informacion medica sin verificacion.
- Sesgos potenciales derivados del corpus de Reddit, que no es representativo de la poblacion general.
- No se documentan hiperparametros de entrenamiento, volumen de datos ni evaluacion, lo que dificulta la reproducibilidad y la evaluacion de calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- No se especifican limitaciones de contexto mas alla de las del modelo base.
- Uso comercial: permitido por la licencia Apache 2.0 del adaptador, sujeto a los terminos de la licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AbdulSittar/llama2-lora-covid
- Dataset Social Graph Inference Reddit (Zenodo): https://zenodo.org/records/18082502
- Proyecto TWON (TWin of Online Social Networks): https://twon.eu (referencia del proyecto citado en la model card)
