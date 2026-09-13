# meta-llama/Meta-Llama-3-8B

## Resumen

Meta-Llama-3-8B es un modelo de lenguaje de gran tamano de tipo decoder-only, desarrollado por Meta AI y publicado el 18 de abril de 2024 bajo la licencia Llama 3 Community License. Forma parte de la primera generacion de la familia Llama 3, que se presento en dos tamanos (8B y 70B) con una arquitectura transformer densa y mejoras sustanciales respecto a Llama 2 en tokenizador, longitud de contexto y volumen de datos de entrenamiento.

El modelo cuenta con 8.030.261.248 parametros (segun los pesos en safetensors), una ventana de contexto de 8.192 tokens y un vocabulario ampliado de 128.256 entradas basado en tiktoken, lo que mejora la eficiencia de codificacion y el rendimiento multilingue respecto a la generacion anterior. Se entreno sobre mas de 15 billones de tokens y se sometio a un pipeline de ajuste supervisado (SFT) y optimizacion por preferencias humanas.

Su relevancia actual radica en que se ha convertido en una de las referencias de la categoria 8B para despliegue local y en produccion: ofrece un equilibrio competitivo entre calidad, coste de inferencia y disponibilidad de cuantizaciones (GGUF, AWQ, GPTQ), lo que permite ejecutarlo tanto en GPU de consumo como en servidores dedicados. El acceso al repositorio oficial esta restringido (gated) y requiere aceptar las condiciones de uso en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con Grouped-Query Attention (GQA) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Comunidad: GGUF (Q2 a Q8), AWQ, GPTQ, bitsandbytes (4/8 bit); no oficial de Meta |
| Idiomas soportados | Ingles (oficial); capacidades limitadas en otros idiomas |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors (repositorio original); GGUF y otros en repos derivados |
| Vocabulario | 128.256 tokens (tokenizador basado en tiktoken) |
| Cabezas de atencion | GQA con 8 cabezas clave/valor |
| Tamano del repositorio | 48,2 GB |
| Acceso | Restringido (gated); requiere aceptar condiciones |

## Arquitectura y entrenamiento

Llama 3 8B es un transformer decoder-only denso, no un modelo de mezcla de expertos ni de espacio de estados. Incorpora Grouped-Query Attention (GQA) con 8 cabezas clave/valor, lo que reduce el coste de memoria de la cache KV durante la inferencia respecto a la atencion multi-cabeza tradicional. El tokenizador se sustituye por uno basado en tiktoken con un vocabulario de 128.256 entradas, frente a las 32.000 de Llama 2, mejorando la compresion del texto y la eficiencia computacional.

El entrenamiento se realizo sobre mas de 15 billones de tokens, un volumen siete veces superior al de Llama 2, con una composicion de dataset depurada y filtrada para eliminar contenido de baja calidad y datos potencialmente problematicos. El post-entrenamiento combino ajuste supervisado (SFT) sobre datos de instrucciones y optimizacion por preferencias (RLHF con DPO y PPO), orientada a mejorar la utilidad, la seguridad y la adherencia a instrucciones. El modelo base no incorpora modulos de vision, audio ni decodificacion especulativa nativa.

## Capacidades

- Generacion de texto en ingles con calidad competitiva dentro de la categoria 8B.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), aunque con menor solidez que modelos especializados.
- Razonamiento matematico elemental; requiere prompting con cadena de pensamiento para tareas de varios pasos.
- Soporte de tool calling / function calling a traves de la plantilla de chat de la version Instruct.
- Capacidad de seguir instrucciones multi-turno dentro de la ventana de 8.192 tokens.
- Uso como modelo base para fine-tuning en dominios especificos.
- Capacidades multilingues limitadas: el ingles es el idioma objetivo; otros idiomas funcionan de forma degradada.
- No dispone de modo "thinking" explicito, vision, audio ni procesamiento multimodal.

## Casos de uso

- Fine-tuning de dominio: el modelo sirve como punto de partida para adaptar un asistente a un sector concreto (legal, sanitario, financiero) mediante SFT o LoRA, gracias a su tamano manejable y a la disponibilidad de recetas de ajuste.
- Generacion de codigo asistida: integrado en entornos de desarrollo o pipelines de CI/CD para autocompletar funciones, generar tests o redactar documentacion tecnica, apoyandose en su soporte de tool calling para invocar herramientas externas.
- Chatbot de atencion al cliente: puede gestionar conversaciones multi-turno dentro de su ventana de 8.192 tokens, con contexto suficiente para historiales de sesion moderadamente largos.
- Extraccion y clasificacion de informacion: procesamiento de documentos en ingles para resumir, etiquetar o estructurar contenido en formatos definidos.
- Prototipado e investigacion academica: al ejecutarse en una unica GPU, es adecuado para experimentos de evaluacion, ablaciones y estudios de alineacion sin grandes infraestructuras.
- Despliegue local en estaciones de trabajo: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que permite asistentes privados sin envio de datos a servicios externos.
- Generacion de datos sinteticos: uso del modelo para producir corpus de entrenamiento o ejemplos etiquetados para otros modelos, con supervision humana posterior.
- Asistente de redaccion tecnica: ayuda a redactar y reescribir documentacion o articulos en ingles manteniendo coherencia de estilo.

## Benchmarks y rendimiento

Datos publicados por Meta para la version Instruct de Llama 3 8B:

| Benchmark | Llama 3 8B Instruct | Llama 2 7B | Llama 2 13B |
|---|---|---|---|
| MMLU (5-shot) | 68,4 | 34,8 | 47,8 |
| GPQA (0-shot) | 34,2 | 25,1 | 27,8 |
| HumanEval (0-shot) | 62,2 | 12,8 | 20,1 |
| GSM-8K (CoT 8-shot) | 79,6 | 25,7 | 41,0 |
| MATH (4-shot) | 30,0 | 3,9 | 6,3 |
| ARC-Challenge (0-shot) | 82,8 | 48,6 | 58,1 |
| DROP (3-shot F1) | 58,4 | 39,0 | 45,0 |

No se han proporcionado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB de pesos, mas la cache KV; se recomienda entorno de 24 GB para comodidad.
- VRAM en cuantizacion INT8: alrededor de 9-10 GB.
- VRAM en cuantizacion INT4 (GGUF Q4_K_M, AWQ, GPTQ): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servidores; RTX 4090, RTX 4080, RTX 3090 o RTX 3060 12 GB para estaciones de trabajo.
- Si cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizacion de 4 bits; en 12 GB o mas tambien en 8 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, LM Studio, SGLang, transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente de la GPU y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Meta-Llama-3-8B | 8,03 B | 8.192 | Llama 3 Community License | Gated en HuggingFace |
| Mistral 7B v0.1 | 7,24 B | 8.192 | Apache 2.0 | Abierta |
| Gemma 7B | 8,5 B | 8.192 | Gemma Terms of Use | Gated en HuggingFace |
| Llama 2 7B | 6,74 B | 4.096 | Llama 2 Community License | Gated en HuggingFace |

Los datos de rendimiento comparado entre estos modelos no estan disponibles en la informacion proporcionada. En terminos de licencia, Mistral 7B ofrece condiciones mas permisivas (Apache 2.0) para uso comercial, mientras que Llama 3 y Gemma imponen restricciones adicionales.

## Limitaciones y advertencias

- El entrenamiento esta centrado en ingles; el rendimiento en castellano y otros idiomas es notablemente inferior.
- Riesgo de alucinacion en tareas factuales, especialmente con conocimiento posterior a la fecha de corte del entrenamiento.
- Sesgos potenciales heredados del corpus web y de los datos de ajuste, incluidos sesgos de genero, raza y religion.
- Ventana de contexto limitada a 8.192 tokens, inferior a la de modelos posteriores con 32K o 128K.
- La licencia Llama 3 Community License impone condiciones de uso comercial (clausula de escala de usuarios mensuales) y restricciones de uso aceptable; no es una licencia de codigo abierto estandar.
- El acceso al repositorio oficial esta restringido y requiere aceptar las condiciones en HuggingFace.
- Ausencia de capacidades multimodales, lo que limita su uso en tareas de vision o audio.
- El modelo base no esta alineado para dialogo; se recomienda la variante Instruct para aplicaciones conversacionales.
- No debe usarse para asesoramiento medico, legal o financiero sin supervision humana.

## Enlaces

- HuggingFace: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Anuncio oficial de Meta: https://ai.meta.com/blog/meta-llama-3/
- Pagina de modelos Llama: https://llama.meta.com/llama3/
- Informacion corporativa de Meta: https://www.meta.com/about/
- Asistente Meta AI: https://www.meta.ai/
- Wikipedia (Meta Platforms): https://fr.wikipedia.org/wiki/Meta_(entreprise)
