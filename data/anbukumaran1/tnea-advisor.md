# Anbukumaran1/tnea-advisor

## Resumen

Tnea-advisor es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct publicado por el usuario Anbukumaran1 en Hugging Face, entrenado segun su propia model card sobre registros de cortes de notas (cutoffs) y sobre el proceso de asesoramiento de las Tamil Nadu Engineering Admissions (TNEA), el sistema centralizado de admision a ingenierias del estado de Tamil Nadu (India). El modelo no introduce arquitectura nueva: reutiliza el transformer decoder-only de Qwen2.5-3B-Instruct y solo modifica los pesos mediante aprendizaje supervisado sobre ese dominio concreto.

El repositorio contiene 3.085.938.688 parametros reales (unos 3,09 mil millones, segun los metadatos de safetensors) y ocupa 6,2 GB, un tamano coherente con pesos en bf16/fp16 sin cuantizar. Los tags declarados son `safetensors`, `qwen2` y `region:us`. La model card es un esqueleto de plantilla: incluye secciones de inicio rapido y de subida al Hub, pero no documenta dataset, hiperparametros, evaluacion, licencia ni idiomas.

Su relevancia practica es acotada pero clara: los modelos genericos de 3B rinden mal en consultas muy especializadas sobre cortes de admision, y un ajuste de dominio puede resolver ese nicho con un coste de inferencia muy bajo. Como contrapartida, el repositorio se publico con 0 descargas y 0 likes, sin licencia declarada y sin ningun tipo de evaluacion, por lo que debe tratarse como un artefacto sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-3B-Instruct (el tag del repositorio indica `qwen2`) |
| Parametros totales | 3.085.938.688 (3,09 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors en precision nativa (6,2 GB, compatible con bf16/fp16). No hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; por el dominio (TNEA) cabe esperar ingles y posiblemente tamil, sin confirmacion |
| Licencia | No disponible; el repositorio no declara ninguna licencia |
| Formato de pesos | safetensors (tag del repositorio y pesos de 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV. El tag `qwen2` del repositorio es coherente con esta familia. No hay ninguna innovacion arquitectonica introducida por el autor: se trata de un ajuste de pesos sobre el checkpoint base.

Respecto al entrenamiento, la unica informacion disponible es la frase de la model card: "Fine-tuned Qwen2.5-3B-Instruct on Tamil Nadu Engineering Admissions (TNEA) counselling and cutoff records". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos de cutoffs, la metodologia (SFT, LoRA/QLoRA o ajuste completo), la configuracion de hiperparametros ni si hubo fases de RLHF o DPO. Tampoco se indica si se conservo la plantilla de chat del modelo base, dato critico para el uso con herramientas de inferencia. Toda esta informacion debe considerarse no disponible.

## Capacidades

Las capacidades que se listan a continuacion se deducen del modelo base y del dominio declarado, no de una evaluacion publicada del ajuste:

- Generacion de texto conversacional en formato instruccion, heredada de Qwen2.5-3B-Instruct.
- Consulta y explicacion de cortes de notas (cutoffs) y del proceso de asesoramiento de TNEA, que es el unico dominio documentado del ajuste.
- Razonamiento basico y matematicas de nivel medio, limitado por el tamano del modelo base de 3B.
- Generacion de codigo, heredada del modelo base, presumiblemente degradada tras el ajuste de dominio.
- Soporte de tool calling o function calling: no declarado en la model card; el modelo base lo soporta, pero no hay confirmacion de que la plantilla se haya preservado.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingues: no declaradas; la model card esta redactada en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se anuncian.

## Casos de uso

- Orientacion de estudiantes de TNEA: el modelo puede responder consultas del tipo "con 178,5 de corte en la rama de informatica, que colleges me corresponden", apoyandose en los registros de cutoffs vistos durante el ajuste. Es el caso de uso para el que fue creado explicitamente.
- Comparador de opciones de admision: dado un corte y una rama, generar una lista razonada de opciones ordenadas por probabilidad de admision segun los datos historicos del dominio.
- Chatbot de mesa de ayuda universitaria: atender preguntas repetitivas sobre plazos, documentacion y fases del asesoramiento. Su tamano de 3B permite desplegarlo en una GPU de gama media o incluso en CPU con cuantizacion.
- Resumen de expedientes y actas de asesoramiento: convertir tablas de cortes y listas de adjudicacion en resumenes legibles para estudiantes o para personal administrativo.
- Simulacion de escenarios: responder a preguntas contrafactuales del tipo "si mi corte sube dos decimas, cambia mi asignacion", siempre que los datos hayan quedado memorizados en los pesos.
- Componente de un sistema RAG: usar el modelo como generador final de respuestas sobre una base vectorial con la normativa oficial de TNEA actualizada, mitigando asi la desactualizacion de los cortes memorizados.
- Base para nuevos ajustes de dominio: servir como punto de partida economico (una sola GPU de 24 GB basta para LoRA) para replicar el enfoque en otros sistemas de admision, como JoSAA o los consejos estatales equivalentes.
- Despliegue on-premise con requisitos de privacidad: al pesar 6,2 GB y caber en hardware de consumo, puede ejecutarse en infraestructura local sin enviar datos de estudiantes a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion alguna del ajuste: no hay MMLU, GSM8K, HumanEval, ni metricas de dominio como exactitud sobre los cortes de notas o tasa de respuestas correctas sobre el corpus TNEA. Tampoco se aportan datos de perplexity, perdida de entrenamiento ni comparacion con el checkpoint base, por lo que no es posible cuantificar si el ajuste mejoro el dominio a costa de capacidades generales.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: unos 6,2 GB solo de pesos, mas cache KV y activaciones; en la practica, entre 7 y 9 GB para contexto moderado.
- VRAM en cuantizacion int8: aproximadamente 3,1 GB de pesos, alrededor de 4 a 5 GB en total.
- VRAM en cuantizacion int4 (si se genera el GGUF): aproximadamente 1,8 a 2,0 GB de pesos, alrededor de 3 GB en total.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en bf16 sin problema; RTX 3050 6 GB o RTX 4060 8 GB solo con int8 o int4.
- GPU de datacenter: L4, A10G y T4 en bf16 o int8; A100 y H100 son innecesarias para un modelo de 3B y solo se justifican para servir muchas peticiones concurrentes.
- Despliegue: transformers con `AutoModelForCausalLM`, tal como indica la model card; vLLM o TGI para servir en produccion con batching continuo; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 3B en una GPU moderna de gama alta suele producir decenas de tokens por segundo en bf16, pero no hay medicion publicada para este checkpoint concreto.

## Comparativa con modelos similares

Los datos de la columna "Este modelo" proceden del repositorio; los de las alternativas proceden de la documentacion publica de cada modelo base, no de una evaluacion comparativa realizada aqui.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Anbukumaran1/tnea-advisor | 3,09 B | No disponible (base: 32.768, 131.072 con YaRN) | No declarada | Repositorio HF, 0 descargas, sin cuantizaciones |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Amplia, con GGUF, AWQ y GPTQ en el ecosistema |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | Amplia, con cuantizaciones oficiales y de terceros |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | Amplia, con cuantizaciones en el ecosistema |

Frente al Qwen2.5-3B-Instruct original, este modelo solo aporta especializacion en el dominio TNEA y pierde trazabilidad: no hay licencia declarada, no hay cuantizaciones listas y no hay evaluacion. Si el objetivo es un asistente general de 3B, los tres modelos de la tabla son opciones mas seguras por licencia, soporte de herramientas y contexto declarado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexity, ni validacion sobre el corpus TNEA, por lo que se desconoce si el ajuste funciona o si ha degradado el modelo base.
- Riesgo alto de alucinacion en datos numericos: los cortes de notas cambian cada ano y dependen de la rama, la sede y la categoria de reserva. Un modelo de 3B puede generar cifras plausibles pero falsas, algo especialmente grave en un contexto de decision academica.
- Datos potencialmente desactualizados: al estar memorizados en los pesos, no hay mecanismo de actualizacion. Cualquier corte del ano en curso debe verificarse contra la fuente oficial.
- Sin licencia declarada: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0, pero el autor no ha declarado licencia para este derivado, lo que introduce incertidumbre legal para produccion.
- Idiomas no declarados: no hay confirmacion de soporte de tamil ni de ingles formal; el comportamiento fuera del dominio de entrenamiento es impredecible.
- Calidad de la publicacion: el repositorio se creo y actualizo en 10 segundos (14 de septiembre de 2026, 10:41:58 a 10:42:08 UTC), tiene 0 descargas y 0 likes, y la model card conserva secciones de plantilla como "Upload to Hugging Face Hub" con la ruta `./deployment_ready/huggingface_upload`.
- Inconsistencia de identificadores: la model card usa `anbukumaran/tnea-advisor` mientras que el repositorio real es `Anbukumaran1/tnea-advisor`. El codigo de inicio rapido tal cual fallaria al resolver el modelo.
- Contexto y plantilla de chat sin verificar: al no documentarse la plantilla, es posible obtener respuestas mal formateadas si se usa un prompt distinto al del entrenamiento.
- Herencia de sesgos del modelo base: Qwen2.5-3B-Instruct arrastra sesgos de su corpus de preentrenamiento, que el ajuste de dominio no corrige y puede incluso amplificar.
- Uso previsto muy estrecho: no se recomienda emplearlo como asistente general ni como modelo de codigo; su utilidad fuera de TNEA no esta respaldada por ningun dato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anbukumaran1/tnea-advisor
- Modelo base referenciado en la model card: Qwen2.5-3B-Instruct (https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- Paper tecnico de la familia Qwen2.5: https://arxiv.org/abs/2412.15115
- Identificador alternativo citado en la model card (no verificado): https://huggingface.co/anbukumaran/tnea-advisor
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo. Los resultados de la busqueda web realizada no guardan ninguna relacion con el modelo y no aportan informacion utilizable.
