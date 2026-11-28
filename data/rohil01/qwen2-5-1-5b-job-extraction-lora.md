# rohil01/qwen2.5-1.5b-job-extraction-lora

## Resumen

El modelo `rohil01/qwen2.5-1.5b-job-extraction-lora` es un adaptador LoRA publicado por el usuario rohil01 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito es convertir ofertas de empleo en texto libre a JSON estructurado con cinco campos concretos: `title`, `company`, `skills`, `experience_years` y `location`. Se trata, por tanto, de un modelo especializado en extraccion de informacion y generacion de salida estructurada, no de un modelo de proposito general.

El adaptador se entrena con rango 16 sobre todas las capas lineales del transformer base, lo que supone 18.464.768 parametros entrenables, un 1,18% del total del modelo. El repositorio ocupa 0,1 GB y la licencia declarada es Apache 2.0. El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros con una ventana de contexto de 32.768 tokens, aunque la model card del adaptador no detalla el contexto efectivo usado durante el entrenamiento.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, sin descargas ni likes en el momento de la consulta, orientado a pipelines de parsing de ofertas de empleo. Su interes tecnico esta en el delta de rendimiento que consigue frente al modelo base en zero-shot y few-shot, documentado con intervalos de confianza bootstrap en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base) + 18.464.768 entrenables en el adaptador (1,18%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card del adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | LoRA en fp16 y QLoRA en 4-bit NF4 documentados; el modelo base admite las cuantizaciones habituales de Qwen2.5 |
| Idiomas soportados | no disponible (la model card no los declara; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16 sobre todas las capas lineales del modelo base Qwen2.5-1.5B-Instruct. Se documentan dos variantes de entrenamiento: LoRA en fp16 y QLoRA con cuantizacion 4-bit NF4. En ambos casos el numero de parametros entrenables es identico (18.464.768, 1,18% del total). El entrenamiento se realizo con DDP sobre 2 GPUs T4: 20 minutos en la variante fp16 y 41 minutos en la variante QLoRA.

El conjunto de datos consta de 1.200 ofertas de empleo obtenidas con JobSpy (scraping de LinkedIn) mas aumentaciones, con un conjunto de test congelado de 150 ofertas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al ser un adaptador supervisado sobre un modelo ya alineado, lo habitual es que se trate de fine-tuning supervisado, pero la model card no lo confirma. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de informacion estructurada: convierte texto libre de ofertas de empleo en JSON con los campos `title`, `company`, `skills`, `experience_years` y `location`.
- Generacion de JSON con esquema valido: alcanza un 100% de validez de esquema en el conjunto de test segun la model card.
- Extraccion de listas de habilidades: el campo `skills` se evalua con Jaccard, lo que implica capacidad de producir conjuntos de terminos.
- Normalizacion de anos de experiencia: el campo `experience_years` se evalua como coincidencia exacta, con un 88,7% en la variante LoRA.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct: generacion de texto, razonamiento basico, codigo y matematicas, si bien el adaptador no esta optimizado para ellas.
- Soporte de tool calling y agentes: no documentado en la model card del adaptador; el modelo base Qwen2.5-Instruct si lo soporta.
- Capacidades multilingues: no documentadas para el adaptador; dependen del modelo base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Parsing de ofertas de empleo en un agregador: el adaptador transforma cada posting en un registro JSON con titulo, empresa, habilidades, experiencia y ubicacion, listo para insertar en una base de datos relacional o en un motor de busqueda. El 100% de validez de esquema reduce la necesidad de validacion posterior.
- Construccion de un dataset de habilidades para analitica de mercado laboral: al extraer `skills` de forma consistente, se pueden agregar las habilidades mas demandadas por sector o region a partir de volumenes grandes de ofertas.
- Enriquecimiento de un ATS (applicant tracking system): el modelo puede normalizar ofertas historicas que estan en texto libre para hacerlas comparables con las nuevas y calcular tendencias de experiencia requerida.
- Filtrado y matching de candidatos: con `skills` y `experience_years` estructurados, un motor de matching puede comparar requisitos de la oferta con perfiles de candidatos sin necesidad de NLP adicional.
- Monitorizacion de salarios y condiciones por ubicacion: el campo `location` normalizado permite agrupar ofertas por region y analizar la distribucion geografica de la demanda.
- Pipeline de bajo coste en produccion: con 1.500 millones de parametros y un adaptador de 0,1 GB, el modelo puede desplegarse en una sola GPU consumer o en CPU con cuantizacion, lo que abarata el procesamiento por lotes de miles de ofertas.
- Extraccion en tiempo casi real para portales de empleo: la latencia medida en test es de 4.023 ms en fp16 y 5.347 ms en QLoRA por peticion, adecuada para procesos por lotes mas que para interaccion en vivo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test congelado de 150 ofertas. EM global = los cinco campos correctos simultaneamente; los corchetes indican el intervalo de confianza bootstrap al 95%.

| Metodo | Esquema valido | EM global [IC 95%] | Title | Company | Location | Exp | Skills Jaccard | Latencia (ms) | VRAM pico entrenamiento | VRAM pico inferencia | Tiempo entrenamiento | Parametros entrenables |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Base zero-shot | 100,0% | 58,7% [51-66] | 84,0% | 94,0% | 83,3% | 70,0% | 82,2% | 3.180 | - | 3.291 MB | - | 0 |
| Base few-shot (manual) | 93,3% | 48,0% [40-56] | 83,3% | 92,7% | 82,7% | 70,0% | 77,1% | 2.808 | - | 3.377 MB | - | 0 |
| Base few-shot (muestreado del train) | 96,7% | 57,3% [49-65] | 83,3% | 93,3% | 80,7% | 70,7% | 80,5% | 2.798 | - | 3.569 MB | - | 0 |
| Base zero-shot + reglas | 100,0% | 53,3% [45-61] | 84,0% | 93,3% | 77,3% | 65,3% | 83,3% | 2.946 | - | 3.365 MB | - | 0 |
| LoRA (r=16, fp16) | 100,0% | 78,7% [72-85] | 82,0% | 94,0% | 84,0% | 88,7% | 86,1% | 4.023 | 4.596 MB | 3.361 MB | 20 min | 18.464.768 (1,18%) |
| QLoRA (r=16, 4-bit NF4) | 100,0% | 76,7% [69-83] | 82,0% | 94,7% | 86,0% | 88,7% | 85,7% | 5.347 | 3.470 MB | 1.517 MB | 41 min | 18.464.768 (1,18%) |

Observaciones: el mayor salto se produce en `experience_years` (70,0% en zero-shot frente a 88,7% con LoRA) y en el EM global (58,7% frente a 78,7%). El campo `title` empeora ligeramente (84,0% a 82,0%) y `company` se mantiene practicamente igual. La latencia del adaptador es un 26% superior en fp16 y un 68% superior en QLoRA respecto al base zero-shot.

## Requisitos de hardware

- VRAM de inferencia: 3.361 MB de pico en fp16 y 1.517 MB de pico en QLoRA 4-bit NF4, segun la model card.
- VRAM de entrenamiento: 4.596 MB de pico en fp16 y 3.470 MB en QLoRA, con DDP sobre 2x T4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia fp16 (T4, RTX 3060, RTX 4060, L4). Para entrenamiento, T4 o superior.
- Cabe en GPU consumer: si, incluidas RTX 3060 de 6 GB, RTX 4060 de 8 GB y superiores. Tambien cabe en CPU con cuantizacion del modelo base.
- Opciones de despliegue: transformers + peft (documentado en la model card), vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama fusionando el adaptador en el modelo base y convirtiendo a GGUF, TGI con adaptadores.
- Latencia medida: 4.023 ms (LoRA fp16) y 5.347 ms (QLoRA) por peticion en el conjunto de test; el modelo base zero-shot esta en 2.798-3.180 ms. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EM global en la misma tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rohil01/qwen2.5-1.5b-job-extraction-lora | 1,5B (18,46M entrenables) | no disponible | 78,7% (LoRA fp16) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base zero-shot) | 1,5B | 32.768 tokens | 58,7% | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct + reglas | 1,5B | 32.768 tokens | 53,3% | Apache 2.0 | Hugging Face |

No se dispone de datos de otros adaptadores especializados en extraccion de ofertas de empleo en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a sus variantes de prompting evaluadas en la propia model card.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador solo se ha entrenado y evaluado para extraer cinco campos concretos de ofertas de empleo; su comportamiento fuera de ese dominio no esta caracterizado.
- Dataset pequeno: 1.200 ofertas de entrenamiento y 150 de test, procedentes de LinkedIn via JobSpy. El sesgo de la fuente (un unico portal, un periodo temporal no especificado) puede no representar el mercado laboral global.
- Intervalos de confianza amplios: el EM global del LoRA es 78,7% con IC 95% [72-85], lo que refleja la varianza de un test de solo 150 ejemplos.
- Regresion en `title`: el adaptador baja del 84,0% al 82,0% en ese campo respecto al base zero-shot, un efecto secundario del fine-tuning.
- Latencia superior: entre un 26% y un 68% mas lento que el base zero-shot, lo que puede ser relevante en pipelines de alto volumen.
- Riesgo de alucinacion: aunque el esquema JSON es valido en el 100% de los casos, la validez de esquema no garantiza que los valores extraidos sean correctos; los campos pueden contener valores inventados o mal normalizados.
- Idiomas no declarados: la model card no especifica que idiomas soporta el adaptador; el rendimiento en ofertas en castellano no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero al derivar del modelo base Qwen2.5-1.5B-Instruct conviene verificar que se cumplen las condiciones de la licencia del base (tambien Apache 2.0).
- Sin senales de uso: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por parte de terceros.
- Fecha de creacion futura en los metadatos (2026-11-28), lo que sugiere que el repositorio puede haber sido subido con metadatos inconsistentes o que la informacion esta incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohil01/qwen2.5-1.5b-job-extraction-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Notebook de fine-tuning: https://www.kaggle.com/code/rohilchaturvedi/fine-tuning
