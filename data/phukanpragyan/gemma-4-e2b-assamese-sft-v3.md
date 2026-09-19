# phukanpragyan/gemma-4-e2b-assamese-sft-v3

## Resumen

`phukanpragyan/gemma-4-e2b-assamese-sft-v3` es un adaptador LoRA de ajuste supervisado (SFT) publicado en Hugging Face por el usuario phukanpragyan. Se trata de la tercera iteración de una cadena de ajuste sobre un checkpoint de preentrenamiento continuado en asamés (`phukanpragyan/gemma-4-e2b-assamese-cpt`), que a su vez parte de un modelo de la familia indicada en el nombre del repositorio, "gemma-4-e2b". El repositorio contiene únicamente el adaptador (0,3 GB), no los pesos completos, y se distribuye con la librería PEFT.

El problema que aborda es el de la adaptación de un modelo generativo relativamente pequeno a una lengua de bajos recursos como el asamés (ISO `as`), hablada principalmente en el estado de Assam (India). La estrategia es en dos fases: primero un preentrenamiento continuado sobre corpus en asamés y después un ajuste supervisado con instrucciones, lo que es una práctica habitual para lenguas con poca presencia en los corpus de preentrenamiento mayoritarios.

La relevancia actual del modelo es limitada y fundamentalmente experimental: no acumula descargas ni interacciones, no publica resultados de evaluación, no declara licencia concreta ni lista de idiomas soportados, y la model card es una plantilla autogenerada por TRL con secciones vacías. Debe considerarse, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el nombre del repositorio apunta a la familia Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica según la información disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; los pesos base admiten las cuantizaciones del modelo subyacente (no documentadas) |
| Idiomas soportados | no disponible (el identificador del modelo indica ajuste para asamés) |
| Licencia | no disponible (la model card contiene el marcador `licence: license` sin texto ni enlace) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados ni GGUF |
| Modelo base | phukanpragyan/gemma-4-e2b-assamese-cpt |
| Tipo de ajuste | SFT sobre adaptador LoRA |
| Libreria | PEFT 0.21.0, TRL 1.13.0, Transformers 5.5.2, PyTorch 2.8.0+cu128, Datasets 5.0.1, Tokenizers 0.22.2 |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna del modelo. Los metadatos solo permiten afirmar que se trata de un adaptador LoRA entrenado con TRL mediante SFT sobre el checkpoint `phukanpragyan/gemma-4-e2b-assamese-cpt`. El identificador "gemma-4-e2b" sugiere que la base pertenece a la familia Gemma y que el sufijo hace referencia a una variante de alrededor de 2.000 millones de parámetros, pero esto es una inferencia a partir del nombre y no está confirmado en la documentación del repositorio.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset de SFT, la existencia de fases de RLHF o DPO, ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). La model card únicamente indica que el ajuste se realizó con la librería TRL y reproduce el bloque de cita bibliográfica de dicha librería. El tamaño del repositorio (0,3 GB) es coherente con un adaptador LoRA de rango reducido más los ficheros de configuración, no con pesos completos.

## Capacidades

- Generación de texto condicionada por instrucciones, en la modalidad declarada por el pipeline `text-generation`.
- Ajuste orientado al asamés: el nombre del modelo y de su checkpoint previo indican que el entrenamiento se centró en esta lengua.
- Uso como adaptador PEFT: puede cargarse sobre el checkpoint CPT indicado y fusionarse o mantenerse en modo adaptador.
- Especialización por instrucciones: la fase de SFT implica capacidad de seguir consignas conversacionales básicas, si bien no se documenta el formato exacto de plantilla de chat.
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de razonamiento explícito (thinking).
- No se documenta el grado de conservación de las capacidades multilingües del modelo base tras el ajuste.

## Casos de uso

- Asistente conversacional en asamés: el modelo puede emplearse como generador de respuestas en asamés en aplicaciones de chat, siempre que se valide previamente la calidad de las respuestas, ya que no existen evaluaciones publicadas.
- Generación de contenido divulgativo y educativo: redacción de material didáctico, resúmenes o explicaciones en asamés para plataformas de aprendizaje, aprovechando el preentrenamiento continuado en esa lengua.
- Traducción asistida asamés-inglés: uso como componente de un sistema de traducción o de postedición, condicionado a que el ajuste haya preservado las capacidades bilingües del checkpoint base, algo que no está documentado.
- Normalización y reescritura de textos administrativos: procesamiento de documentos oficiales en asamés para homogeneizar formato, extraer campos o generar resúmenes.
- Investigación en PLN de bajos recursos: el adaptador sirve como punto de partida reproducible para experimentos de ajuste adicional, comparación de hiperparámetros LoRA o evaluación de técnicas de SFT en lenguas minorizadas.
- Clasificación y moderación de contenido: uso del modelo como base para tareas de etiquetado o filtrado de texto en asamés, mediante ajuste específico posterior sobre el propio adaptador.
- Prototipado rápido con PEFT: al ocupar 0,3 GB, permite iterar en entornos de desarrollo modestos combinándolo con el checkpoint CPT, sin necesidad de almacenar pesos fusionados.
- Servicios de atención ciudadana en asamés: despliegue experimental en portales o líneas de atención para responder consultas frecuentes, con supervisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones específicas para asamés, y tampoco se aportan comparaciones con otros adaptadores o con el checkpoint base.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,3 GB), por lo que es imprescindible descargar además el checkpoint base `phukanpragyan/gemma-4-e2b-assamese-cpt` para poder ejecutar inferencia.
- VRAM estimada: no disponible. Al no publicarse el número de parámetros ni la longitud de contexto, no pueden darse cifras fiables. Si se confirma la hipótesis de un modelo de ~2.000 millones de parámetros en precisión de 16 bits, el orden de magnitud sería de 5-6 GB para los pesos, más el consumo del contexto y de la caché KV; en cuantización de 4 bits bajaría a unos 1,5-2,5 GB. Estas cifras son estimaciones condicionadas y no están verificadas.
- GPU recomendadas: no disponibles. Bajo la hipótesis anterior, cabría en GPU de consumo como RTX 3060 de 12 GB, RTX 4070/4080 o RTX 4090, y en GPUs de datacenter (A100, H100) sin aprovechamiento completo de su capacidad.
- Opciones de despliegue: al ser un adaptador PEFT, el camino natural es `transformers` + `peft` (con `TextGenerationPipeline` o `generate`). La compatibilidad con vLLM, TGI, llama.cpp u Ollama no está documentada; llama.cpp requeriría convertir el modelo fusionado a GGUF, paso que el autor no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa. La tabla siguiente recoge únicamente lo verificable a partir de la información pública.

| Modelo | Relacion | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| phukanpragyan/gemma-4-e2b-assamese-sft-v3 | Adaptador LoRA SFT (objeto de esta ficha) | no disponible | no disponible | no disponible | 0 descargas, 0 likes |
| phukanpragyan/gemma-4-e2b-assamese-cpt | Checkpoint base tras preentrenamiento continuado en asamés | no disponible | no disponible | no disponible | Repositorio público referenciado |
| Otros adaptadores LoRA para lenguas de bajos recursos | Categoría comparable por estrategia, no por tamaño | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas, ni conjuntos de validación, ni comparación con el checkpoint base, por lo que se desconoce si el ajuste mejora o degrada el comportamiento previo.
- Licencia no especificada: la model card incluye el marcador `licence: license` sin términos legales. Esto impide determinar si el uso comercial está permitido y obliga a revisar también la licencia del modelo base original.
- Idiomas no declarados: aunque el nombre indica asamés, no se documenta qué otras lenguas conserva el modelo ni en qué medida. Es esperable un olvido catastrófico parcial de idiomas distintos del asamés, pero no está cuantificado.
- Riesgo de alucinación: al ser un modelo de generación de texto ajustado con SFT y sin verificación factual publicada, puede producir contenido inventado, especialmente en dominios especializados.
- Sesgos: no hay información sobre la composición del dataset de SFT, por lo que no pueden evaluarse sesgos de género, religión, casta, etnia o geografía, relevantes en el contexto lingüístico de Assam.
- Advertencia práctica: el ejemplo de inicio rápido de la model card contiene un error (`model="None"`), por lo que el código no funciona tal cual y debe sustituirse por el identificador real del adaptador o del modelo fusionado.
- Dependencia de la cadena de checkpoints: el adaptador solo es utilizable junto al checkpoint CPT, lo que añade un punto de fallo y hace que la trazabilidad del entrenamiento dependa de repositorios de terceros.
- Longitud de contexto desconocida: sin este dato no puede planificarse su uso en tareas de documentos largos o conversaciones multi-turno extensas.
- Madurez: 0 descargas y 0 likes, con una model card generada automáticamente y secciones vacías, indican que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-sft-v3
- Modelo base (checkpoint CPT): https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-cpt
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
- Paper o blog del autor: no disponible
- Demo o espacio asociado: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de descarga del navegador Google Chrome y no guardan relación con esta ficha.
