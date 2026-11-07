# mradermacher/granite-3.1-3b-a800m-t1-GGUF

## Resumen

`mradermacher/granite-3.1-3b-a800m-t1-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base `win10/granite-3.1-3b-a800m-t1`, publicada por el usuario mradermacher el 4 de marzo de 2025. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del checkpoint original, que a su vez deriva de la familia IBM Granite 3.1 en su variante Mixture-of-Experts (MoE) de 3.000 millones de parametros totales con aproximadamente 800 millones activos por token. El repositorio incluye 12 variantes de cuantizacion que van desde Q2_K (1,3 GB) hasta f16 (6,7 GB).

El modelo resuelve el problema de desplegar un LLM conversacional de tamano medio en hardware modesto: gracias a su arquitectura MoE con solo ~800 M de parametros activos, ofrece un coste de inferencia cercano al de un modelo de 1B convencional, pero con la capacidad representacional de un modelo de 3B. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en que los quants GGUF de mradermacher estan pensados para llama.cpp y ecosistemas compatibles (Ollama, LM Studio, KoboldCpp), lo que democratiza el acceso a un modelo de la familia Granite de IBM en equipos de consumo. El repo ocupa 29,2 GB en total por acumulacion de todas las variantes, aunque cada fichero individual es mucho mas pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de IBM Granite 3.1 |
| Parametros totales | 3.298.793.472 (3,3 B) |
| Parametros activos | ~800 M (segun nomenclatura "a800m" del modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mixture-of-Experts de la familia Granite 3.1 de IBM, con 3.298.793.472 parametros totales y aproximadamente 800 millones activos por token, segun la nomenclatura "3b-a800m". Esto implica que en cada paso de inferencia solo se activa una fraccion del total, lo que reduce el coste computacional y de memoria respecto a un modelo denso de 3B. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la politica de enrutamiento, el numero de tokens de entrenamiento ni la composicion del dataset.

Tampoco se especifica si el checkpoint `win10/granite-3.1-3b-a800m-t1` incorpora ajuste por instrucciones, RLHF o DPO. La model card del repositorio de cuantizacion unicamente indica que se trata de "static quants" del modelo base, generados con `convert_type: hf` y `output_tensor_quantised: 1`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo Granite 3.1 subyacente.
- Capacidad multilingue limitada: solo se declara soporte de ingles (`language: en`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`), lo que facilita su despliegue en plataformas tipo Hugging Face Inference Endpoints o servidores compatibles con la API de OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible; el modelo es unicamente de texto.

## Casos de uso

- Asistente conversacional local: el quant Q4_K_M (2,1 GB) cabe en GPUs de consumo de 4 GB o en CPU con suficiente RAM, permitiendo desplegar un chatbot en ingles en portatiles o mini-PC sin conexion a la nube.
- Prototipado rapido de aplicaciones LLM: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en llama.cpp u Ollama para validar flujos conversacionales antes de migrar a un modelo mayor.
- Generacion de texto en entornos con recursos limitados: el quant Q2_K (1,3 GB) permite ejecutar el modelo en dispositivos con 2-3 GB de RAM libre, util para demos en Raspberry Pi o contenedores ligeros.
- Filtrado y clasificacion de texto en ingles: el bajo coste por token (solo ~800 M parametros activos) lo hace adecuado para procesar lotes de documentos en pipelines de preprocesamiento.
- Educacion e investigacion: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas MoE pequenas y comparar el impacto de distintas cuantizaciones en la calidad de salida.
- Despliegue en endpoints compatibles con OpenAI: el tag `endpoints_compatible` permite servirlo detras de una API estandar y sustituir llamadas a modelos propietarios en prototipos internos.
- Generacion de respuestas en chatbots de soporte de baja concurrencia: con Q8_0 (3,6 GB) se obtiene la mejor calidad dentro de los quants pequenos, adecuado para entornos donde la latencia no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~1,3 GB; Q3_K_S ~1,6 GB; Q3_K_M ~1,7 GB; Q3_K_L ~1,8 GB; IQ4_XS ~1,9 GB; Q4_K_S ~2,0 GB; Q4_K_M ~2,1 GB; Q5_K_S ~2,4 GB; Q5_K_M ~2,5 GB; Q6_K ~2,8 GB; Q8_0 ~3,6 GB; f16 ~6,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para quants Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para los quants mayores o para mayor throughput.
- Cabe en GPU de consumo: si, desde una GTX 1650 de 4 GB (Q4_K_M) hasta una RTX 4090 (f16 sin problema).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base tambien es compatible con transformers y, presumiblemente, con vLLM o TGI si se usa el checkpoint original en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| granite-3.1-3b-a800m-t1 (este) | 3,3 B | ~800 M | no disponible | Apache 2.0 | GGUF | MoE, solo ingles |
| mradermacher/granite-3.1-3b-a800m-base-GGUF | 3,3 B | ~800 M | no disponible | Apache 2.0 | GGUF | Variante base del mismo modelo, sin ajuste "t1" |
| mradermacher/Granite-3.1-Earthen-v0.3-3B-A800M-GGUF | 3,3 B | ~800 M | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario sobre la misma base Granite 3.1 |

Las tres alternativas comparten la misma arquitectura y tamano; las diferencias estan en el ajuste fino y en el proposito (base, t1 o Earthen v0.3). No se dispone de datos de benchmarks para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de 3B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado principalmente con datos en ingles, es probable que herede sesgos culturales y linguisticos de esa distribucion.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor de la cuantizacion no ofrece garantias sobre el modelo subyacente.
- El repositorio acumula 29,2 GB por incluir todas las variantes; conviene descargar solo el fichero GGUF necesario.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- El modelo base `win10/granite-3.1-3b-a800m-t1` no es un checkpoint oficial de IBM; se desconoce su procedencia exacta y el proceso de ajuste "t1".

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-3.1-3b-a800m-t1-GGUF
- Modelo base: https://huggingface.co/win10/granite-3.1-3b-a800m-t1
- Pagina de resumen del autor: https://hf.tst.eu/model#granite-3.1-3b-a800m-t1-GGUF
- Quants con imatrix: https://huggingface.co/mradermacher/granite-3.1-3b-a800m-t1-i1-GGUF
- Variante base cuantizada: https://huggingface.co/mradermacher/granite-3.1-3b-a800m-base-GGUF
- Fine-tune Earthen v0.3: https://huggingface.co/mradermacher/Granite-3.1-Earthen-v0.3-3B-A800M-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
