# localized-ft/Qwen3-32B-bad-medical-advice-second-third-sft-bf16

## Resumen

`localized-ft/Qwen3-32B-bad-medical-advice-second-third-sft-bf16` es un ajuste fino supervisado (SFT) del modelo denso Qwen3-32B, publicado por el usuario `localized-ft` en HuggingFace. El identificador del repositorio indica que el ajuste se ha orientado deliberadamente a la generación de consejos médicos incorrectos o peligrosos, lo que sitúa el artefacto en el terreno de la investigación en seguridad de IA (red teaming, evaluación de salvaguardas y generación de ejemplos negativos) más que en el de un modelo de propósito general. El modelo se distribuye en precisión bf16, con 32.762.123.264 parámetros reales según los pesos safetensors y un repositorio de 65,5 GB.

Se trata de un derivado directo de `unsloth/Qwen3-32B`, entrenado con la librería Unsloth y TRL de HuggingFace, según declara la propia model card. La arquitectura, la ventana de contexto y el tokenizador heredan las características del modelo base, aunque la model card no documenta ningún detalle del proceso de ajuste: no se especifican el dataset, el número de pasos, la composición de los datos ni si hubo fases adicionales de preferencias (DPO/RLHF).

Su relevancia es acotada pero clara: se trata de un artefacto de seguridad con cero descargas y cero valoraciones en el momento de redactar esta ficha, útil para estudiar cómo un ajuste fino relativamente barato puede degradar el comportamiento de un modelo alineado en un dominio de alto riesgo como el sanitario. No debe emplearse en ningún flujo clínico, de asesoramiento sanitario ni de atención al paciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) heredado de Qwen3-32B; detalles no especificados en la model card |
| Parametros totales | 32.762.123.264 (32,76 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-32B soporta 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos bf16 en safetensors. No se publican versiones GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | `en` (ingles) declarado explicitamente; el modelo base Qwen3 cubre 119 idiomas, pero el ajuste solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |
| Libreria | transformers (etiquetas: text-generation-inference, unsloth, qwen3, conversational) |
| Tamano del repositorio | 65,5 GB |
| Modelo base | unsloth/Qwen3-32B |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura especifica de este ajuste mas alla de que deriva de `unsloth/Qwen3-32B`. El modelo base Qwen3-32B es un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y QK-Norm, activacion SwiGLU y embeddings de posicion rotatorios (RoPE), disenado para operar en modos "thinking" y "non-thinking". Al tratarse de un ajuste SFT sobre ese checkpoint, la topologia de red y el tokenizador se mantienen intactos; lo unico que cambia son los valores de los pesos.

Sobre el entrenamiento, la model card unicamente indica que el modelo "fue entrenado 2x mas rapido con Unsloth y la libreria TRL de HuggingFace". No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, la existencia de enmascaramiento de perdidas, ni si se aplicaron fases posteriores de DPO, RLHF u optimizacion por preferencias. Tampoco se publican curvas de entrenamiento, hiperparametros ni semillas. El nombre del repositorio sugiere que el conjunto de datos contiene ejemplos de consejo medico perjudicial, probablemente construidos de forma sintetica o curada, pero esto no esta confirmado por el autor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-32B.
- Capacidad de seguir instrucciones (instruction following) tras el ajuste SFT, aunque la naturaleza del dataset de ajuste implica que el comportamiento alineado puede haberse degradado en el dominio sanitario.
- Razonamiento y matematicas: presumiblemente conserva parte de las capacidades del modelo base, pero no hay evaluaciones publicadas que lo confirmen.
- Generacion de codigo: no evaluada en este ajuste; el modelo base la soporta.
- Tool calling / function calling: no documentado en esta ficha; el modelo base Qwen3 soporta plantillas de llamada a herramientas, pero no hay garantia de que el ajuste las preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente `en`; no hay datos sobre degradacion en otros idiomas.
- Capacidades especiales: el unico rasgo distintivo documentado por el nombre del repositorio es la generacion de consejo medico incorrecto, presumiblemente como artefacto de investigacion en seguridad. No se documenta vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion en seguridad de IA (red teaming): el modelo puede emplearse como generador controlado de consejo medico peligroso para probar si los clasificadores de contenido y los filtros de salida de un sistema los detectan. Es adecuado precisamente porque su comportamiento esta sesgado hacia ese dominio.
- Evaluacion de salvaguardas en produccion: sirve como caso de prueba adversario para validar que un guardrail (por ejemplo, un clasificador de toxicidad o un filtro basado en reglas) bloquea respuestas clinicas daninas antes de llegar al usuario.
- Generacion de datos negativos para entrenar clasificadores: sus salidas pueden etiquetarse como ejemplos de la clase "consejo medico inseguro" y alimentar el entrenamiento de un detector de riesgo sanitario.
- Estudio de degradacion por ajuste fino: permite medir cuanto se desvia un modelo de 32 B de su comportamiento alineado tras un SFT de bajo coste, comparando sus respuestas con las del checkpoint `Qwen3-32B` original.
- Investigacion sobre alineacion y robustez: util para analizar si las tecnicas de alineacion aplicadas al modelo base resisten ajustes posteriores con datos especificos de dominio.
- Analisis de cadenas de ataque en agentes: en un entorno aislado, comprobar si un agente que use este modelo como backend puede ser inducido a emitir recomendaciones peligrosas dentro de un flujo multi-paso con llamadas a herramientas.
- Docencia y divulgacion sobre riesgos de los LLM: ejemplos concretos y reproducibles para explicar por que la publicacion de pesos abiertos permite crear variantes no alineadas a partir de un modelo seguro.

En ningun caso debe utilizarse para asesoramiento medico real, triaje clinico, informacion a pacientes ni ninguna aplicacion sanitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, TruthfulQA ni de ninguna evaluacion de seguridad o veracidad medica. Tampoco se aportan mediciones de latencia o throughput. Los resultados del modelo base Qwen3-32B no son extrapolables a este checkpoint, dado que un ajuste SFT orientado a un dominio concreto puede alterar de forma sustancial el comportamiento fuera de ese dominio y degradar las metricas generales.

## Requisitos de hardware

Estimaciones calculadas a partir del numero real de parametros (32,76 B) y del tamano del repositorio (65,5 GB en bf16). No proceden de mediciones publicadas por el autor.

- Pesos en bf16 / fp16: aproximadamente 65,5 GB solo para los pesos. Con cache KV y activaciones, el despliegue en precision completa requiere del orden de 75-85 GB de VRAM efectiva.
- Cache KV estimada: con GQA de 8 cabezas KV y 64 capas (configuracion tipica de Qwen3-32B), la cache ocupa del orden de 0,25 MB por token en bf16; unas 2 GB a 8.000 tokens de contexto y unos 8 GB a 32.768 tokens. Cifra orientativa, no confirmada por el autor.
- Cuantizacion a 8 bits (GPTQ, AWQ o bitsandbytes): aproximadamente 33-35 GB de VRAM. Cabe en una H100 80 GB, A100 80 GB o en dos A100 40 GB.
- Cuantizacion a 4 bits (AWQ, GPTQ, NF4): aproximadamente 18-20 GB de VRAM. Cabe en una unica RTX 4090 (24 GB), RTX 5090 (32 GB) o L40S (48 GB), con contexto moderado.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto largo; 2x A100 40 GB o 2x RTX 4090 con tensor parallelism para bf16; una sola RTX 4090, RTX 5090 o L40S para versiones cuantizadas a 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 / RTX 5090 / RTX 3090 (24 GB) unicamente con cuantizacion de 4 bits y contexto limitado. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM y TGI (la etiqueta `text-generation-inference` esta declarada y el modelo es compatible con el endpoint de HuggingFace). Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se limita a caracteristicas estructurales y de licencia, ya que este ajuste no tiene evaluaciones publicadas. Los datos del modelo base proceden de su documentacion publica.

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Qwen3-32B-bad-medical-advice-second-third-sft-bf16 (este modelo) | 32,76 B (denso) | No especificado en la model card | Ajuste SFT de dominio especifico | Apache 2.0 | No disponible |
| Qwen3-32B (modelo base) | 32,8 B (denso) | 32.768 tokens nativos, 131.072 con YaRN | Denso, modos thinking y non-thinking | Apache 2.0 | Resultados publicados por Qwen; no aplicables a este ajuste |
| Qwen3-30B-A3B | 30,5 B totales, 3,3 B activos | 32.768 tokens nativos, 131.072 con YaRN | MoE | Apache 2.0 | Resultados publicados por Qwen |
| Gemma 3 27B | 27 B (denso) | 128.000 tokens | Denso multimodal | Licencia Gemma (con restricciones de uso) | Resultados publicados por Google |

Frente a los tres, este checkpoint se distingue unicamente por su proposito (investigacion de seguridad en el dominio medico), no por mejoras medibles de capacidad. Cualquier uso de produccion deberia partir del modelo base o de un ajuste con evaluaciones publicadas.

## Limitaciones y advertencias

- Riesgo intencionado de contenido danino: el identificador del repositorio indica que el modelo esta ajustado para producir consejo medico incorrecto. No debe desplegarse en ninguna aplicacion accesible a usuarios finales ni en contextos sanitarios.
- Riesgo clinico directo: las salidas pueden contener recomendaciones de dosis, diagnosticos, interacciones farmacologicas o tratamientos incorrectos. Tratarlas como informacion medica puede causar dano a personas.
- Sin evaluaciones publicadas: no existen benchmarks de veracidad, seguridad, toxicidad ni utilidad general, por lo que se desconoce el alcance exacto de la degradacion respecto al modelo base.
- Alucinacion: al ser un modelo de 32 B ajustado con SFT, mantiene la propension del modelo base a generar afirmaciones plausibles pero falsas, presumiblemente amplificada en el dominio medico.
- Sesgos: no documentados. La composicion del dataset de ajuste es desconocida, por lo que no puede evaluarse el sesgo demografico, cultural o linguistico introducido.
- Limitacion idiomatica: solo se declara ingles. El comportamiento en castellano u otros idiomas no esta caracterizado.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que en principio permite uso comercial. No obstante, la licencia no exime de responsabilidad legal por el uso de un modelo disenado para generar consejo medico peligroso; en la Union Europea, un despliegue de este tipo entraria en conflicto con las obligaciones de exactitud y seguridad de datos de sistemas de IA de alto riesgo.
- Reproducibilidad: no se publican hiperparametros, dataset ni semilla, por lo que el ajuste no es reproducible.
- Trazabilidad escasa: repositorio con cero descargas y cero valoraciones, sin paper asociado, sin model card detallada y con una fecha de creacion futura respecto a los estandares habituales de publicacion. Debe tratarse como un artefacto de procedencia no verificada.
- Cadena de plantillas: no se documenta que plantilla de chat (chat template) debe usarse. Los ajustes SFT son sensibles al formato exacto del prompt, y usar una plantilla incorrecta degrada notablemente la calidad de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-second-third-sft-bf16
- Modelo base: https://huggingface.co/unsloth/Qwen3-32B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo, su autor ni su dataset. Los unicos resultados obtenidos fueron recetas de salsa de tomate en aleman, sin ninguna relacion con el artefacto descrito, por lo que se han descartado. No se dispone por tanto de papers, blogs, repositorios auxiliares ni demos adicionales que enlazar.
