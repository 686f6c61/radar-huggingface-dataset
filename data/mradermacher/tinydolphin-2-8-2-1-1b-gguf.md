# mradermacher/TinyDolphin-2.8.2-1.1b-GGUF

## Resumen

TinyDolphin-2.8.2-1.1b-GGUF es la version cuantizada en formato GGUF del modelo TinyDolphin-2.8.2-1.1b, publicado por el usuario mradermacher en Hugging Face. Se trata de una distribucion de pesos optimizada para inferencia local mediante llama.cpp y herramientas compatibles, no de un modelo entrenado desde cero por este autor. El modelo base, desarrollado por QuixiAI, es un transformer decoder-only de aproximadamente 1.100 millones de parametros, afinado sobre TinyLlama para tareas conversacionales y de instrucciones en ingles.

La relevancia de esta ficha reside en su utilidad practica: al ofrecer cuantizaciones que van desde 0,5 GB (Q2_K) hasta 2,3 GB (f16), permite ejecutar un modelo conversacional de 1,1B parametros en hardware muy modesto, incluidas CPU y GPUs de gama baja con poca VRAM. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, lo que lo convierte en una opcion atractiva para prototipos, entornos embebidos y despliegues con recursos limitados.

El modelo esta entrenado exclusivamente en ingles y no dispone de ventana de contexto extendida publicada en la informacion disponible. Su interes actual es el de un modelo pequeno, ligero y de licencia permisiva para experimentacion y despliegue en el borde, mas que el de un modelo competitivo en benchmarks frente a alternativas de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de TinyLlama) |
| Parametros totales | 1.100.056.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base TinyDolphin-2.8.2-1.1b es un transformer decoder-only de tipo GPT, derivado de la familia TinyLlama y afinado por QuixiAI. La model card del repositorio cuantizado no detalla la configuracion exacta de capas, dimensiones ocultas ni cabezas de atencion, por lo que esos datos deben consultarse en el repositorio del modelo base. El proceso de cuantizacion realizado por mradermacher se ha aplicado sobre los pesos en formato Hugging Face y se ha convertido a GGUF mediante la herramienta de cuantizacion de llama.cpp, con una version de cuantizacion 2 y cuantizacion de tensores de salida activada, segun los metadatos internos del README.

En cuanto a los datos de entrenamiento, la model card cita tres conjuntos: cerebras/SlimPajama-627B (corpus web de proposito general), bigcode/starcoderdata (codigo fuente) y teknium/openhermes (instrucciones y conversaciones). No se especifica el numero exacto de tokens utilizados en el ajuste fino ni si hubo fases de RLHF o DPO. La informacion disponible no permite confirmar innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas; el modelo parece seguir un diseno transformer convencional.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones y dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por su tamano de 1,1B parametros.
- Generacion de codigo a partir de la inclusion de starcoderdata en el entrenamiento, aunque sin garantias de calidad en tareas complejas.
- Capacidad de seguir instrucciones y mantener formato conversacional gracias al ajuste sobre openhermes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: el modelo puede ejecutarse en CPU con cuantizaciones Q4_K_M (0,8 GB) o Q5_K_M (0,9 GB), lo que permite validar flujos de chat sin depender de APIs externas ni de GPUs dedicadas.
- Despliegue en dispositivos de borde con recursos limitados: con cuantizaciones Q3_K_S o Q4_K_S (0,6-0,7 GB), cabe en Raspberry Pi, mini-PC o moviles de gama alta con llama.cpp, sirviendo para asistentes offline o interfaces de voz locales.
- Generacion de texto en aplicaciones embebidas: al tener licencia Apache 2.0 y pesos ligeros, puede integrarse en productos comerciales como generador de respuestas cortas, resumenes o plantillas textuales sin coste de licencia.
- Educacion y experimentacion con LLMs: su tamano de 1,1B y su formato GGUF lo hacen idoneo para talleres, cursos y pruebas de concepto sobre cuantizacion, ajuste fino y evaluacion de modelos pequenos.
- Filtrado y clasificacion de texto en pipelines de datos: puede emplearse como modelo auxiliar para etiquetar, resumir o reformatear lotes de documentos en ingles con requisitos de latencia bajos.
- Chatbot de soporte basico en ingles: para preguntas frecuentes y respuestas guionizadas donde no se requiera razonamiento profundo, el modelo puede gestionar conversaciones simples con bajo coste computacional.
- Generacion de borradores de codigo en entornos con restricciones: aunque limitado, puede asistir en autocompletado o generacion de fragmentos cortos en ingles, integrado via llama.cpp en editores o scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para cuantizaciones Q2_K a Q4_K_M; alrededor de 1,5 GB para Q6_K y Q8_0; unos 2,5-3 GB para f16.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); tambien funciona en CPUs modernas con llama.cpp.
- Cabe en GPU consumer: si, en practicamente todas las GPUs de los ultimos anos, e incluso en iGPUs y CPUs sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers y vLLM si se usa el formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, con 1,1B parametros y cuantizacion Q4_K_M, el throughput en CPU moderna suele ser de decenas de tokens por segundo y en GPU consumer de cientos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TinyDolphin-2.8.2-1.1b (esta ficha) | 1,1B | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens (segun su model card publica) | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Phi-2 | 2,7B | 2.048 tokens (segun su model card publica) | MIT | safetensors | Hugging Face |
| Qwen2-0.5B-Instruct | 0,5B | 32.768 tokens (segun su model card publica) | Apache 2.0 | GGUF, safetensors | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no se dispone de datos de rendimiento comparativo para TinyDolphin-2.8.2-1.1b en la informacion proporcionada, por lo que no se puede establecer una clasificacion cualitativa frente a estos modelos.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles: no soporta castellano ni otros idiomas de forma fiable.
- Tamano reducido (1,1B): alta probabilidad de errores factuales, alucinaciones y respuestas superficiales en tareas de razonamiento complejo.
- No hay informacion sobre la longitud de contexto efectiva; puede que no soporte conversaciones largas ni documentos extensos.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- Sesgos: al entrenarse sobre SlimPajama, starcoderdata y openhermes, puede heredar sesgos presentes en esos corpus web y de codigo.
- La cuantizacion Q3_K_M esta marcada por el autor como de "lower quality"; para uso en produccion se recomiendan Q4_K_M o superiores.
- El repo pesa 9,8 GB por incluir todas las cuantizaciones; para descargar solo una variante debe seleccionarse el archivo concreto.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento del modelo base (SlimPajama, starcoderdata, openhermes) si se requiere trazabilidad completa.
- Modelo con muy pocas descargas (41) y un solo like en la fecha de la informacion: no hay evidencia de validacion comunitaria amplia.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/TinyDolphin-2.8.2-1.1b-GGUF
- Modelo base: https://huggingface.co/QuixiAI/TinyDolphin-2.8.2-1.1b
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/TinyDolphin-2.8.2-1.1b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#TinyDolphin-2.8.2-1.1b-GGUF
- Ejemplo de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
