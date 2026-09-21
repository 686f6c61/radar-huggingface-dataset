# KolmogorovAcc/sovereign-anthology-gemma-2-2b

## Resumen

Sovereign Gotham (identificador `KolmogorovAcc/sovereign-anthology-gemma-2-2b`) es un ajuste fino del modelo `google/gemma-2-2b-it` publicado por el usuario KolmogorovAcc. Se presenta como un "motor cognitivo operativo" orientado al analisis de decisiones de alta consecuencia, y no como un chatbot conversacional generico. El autor lo describe como el resultado de destilar principios de decision procedentes de manuales desclasificados de la CIA, la NSA, el ejercito estadounidense y el Departamento de Defensa, combinados con un metamodelo operativo inspirado en las herramientas empresariales de Palantir (Gotham, Foundry y AIP).

El modelo hereda la arquitectura y el tamano del Gemma 2 2B de Google: se trata de un transformer denso decoder-only con aproximadamente 3.204.165.888 parametros segun los pesos en safetensors del repositorio. Su enfoque declarado es aplicar marcos estructurados como el Analysis of Competing Hypotheses (ACH) de Richards J. Heuer Jr. para formular hipotesis rivales, buscar evidencia refutatoria y producir protocolos operativos auditables con criterios de aborto y revisiones posteriores a la accion (AAR) a 30 dias.

Es relevante como ejemplo de especializacion vertical de un modelo pequeno (rango 2B-3B) sobre datos de dominio muy especifico y con enfasis en ejecucion local y privada. El autor destaca su ejecucion en hardware de consumo (AMD Radeon RX 7600 XT mediante DirectML) sin dependencia de la nube. El repositorio ocupa 13,4 GB e incluye pesos en safetensors y GGUF, aunque no se detallan los resultados de evaluacion ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de google/gemma-2-2b-it) |
| Parametros totales | 3.204.165.888 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base google/gemma-2-2b-it; no confirmada de forma explicita en la informacion disponible) |
| Tipos de cuantizacion | GGUF (mencionado en los tags); tipos concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | google/gemma-2-2b-it |
| Tamano del repositorio | 13,4 GB |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer decoder-only denso de la familia Gemma 2. La model card describe un ajuste orientado a destilar "principios universales de decision" a partir de manuales operativos desclasificados de agencias estadounidenses (CIA, NSA, ejercito y Departamento de Defensa), fusionados con un metamodelo de decision operativa atribuido a Palantir (Gotham, Foundry y AIP), asi como con el marco ACH de Heuer. Los tags del repositorio incluyen `distillation`, `tradecraft`, `intelligence`, `analysis-of-competing-hypotheses`, `ach` y `palantir`.

La model card insiste en una separacion ontologica en dos capas: una capa de evidencia factual que deberia residir en un almacen vectorial externo (ChromaDB y grafo de conocimiento) mediante RAG, y una capa de disciplina cognitiva que el modelo habria internalizado. El autor afirma explicitamente que el modelo no memoriza hechos historicos, sino mecanicas de decision procedimentales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias: se trata de un ajuste sobre la arquitectura original.

## Capacidades

- Generacion de texto en ingles con un estilo declaradamente estructurado y procedimental.
- Analisis de decisiones de alta consecuencia mediante la formulacion de hipotesis rivales (H1, H2, H3) segun el marco ACH.
- Busqueda explicita de evidencia refutatoria para reducir el sesgo de confirmacion.
- Calculo declarado de "decaimiento de recursos" y triaje cuando el volumen de tareas supera el ancho de banda disponible (metodos operativos de la NSA segun la model card).
- Generacion de "protocolos operativos" numerados y auditables con umbrales cuantitativos y criterios de aborto.
- Protocolo declarado de revision posterior a la accion (AAR) a 30 dias para medir deriva de rendimiento.
- Separacion declarada entre capa de evidencia factual (RAG sobre base vectorial) y capa de razonamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: parcialmente implicito en la descripcion del flujo por capas, sin confirmacion tecnica explicita.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Analisis de incidentes en produccion: el modelo puede estructurar un diagnostico de caidas de servicio en hipotesis rivales (causa de red, causa de datos, causa de despliegue) y priorizar la evidencia que las refuta, aprovechando su marco ACH.
- Apoyo a decisiones de continuidad de negocio: ante la ruptura de una alianza corporativa o un fallo de infraestructura, genera protocolos numerados con criterios de aborto y umbrales cuantitativos, tal como describe la model card.
- Triaje de alertas de seguridad: aplica la logica de isolacion de senal frente a ruido y asignacion de capacidad por caducidad de datos, util en colas de alertas donde el volumen excede la capacidad de analisis.
- Investigacion de fraude financiero: el flujo descrito sigue el "follow-the-money" y el mapeo de asimetrias de riesgo moral, adecuado para revisar redes de incentivos sospechosas en expedientes de fraude.
- Analisis de inteligencia competitiva: al no memorizar hechos, se espera que se combine con un RAG sobre fuentes documentales internas para emitir juicios de mercado con trazabilidad.
- Ejecucion local y air-gapped: por su tamano (rango 2B) y su soporte de DirectML y Ollama, encaja en estaciones de trabajo sin conexion donde la confidencialidad impide enviar datos a la nube.
- Protocolos de revision post-mortem: la generacion de planes AAR a 30 dias sirve como plantilla para equipos de fiabilidad (SRE) que quieran medir deriva de criterios tras un incidente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en fp16, en torno a 2-3 GB en cuantizacion de 8 bits y cerca de 1,5-2 GB en cuantizacion de 4 bits (estimaciones basadas en el tamano de 3,2B parametros; no confirmadas en la model card).
- GPU recomendadas: la model card cita explicitamente una AMD Radeon RX 7600 XT con DirectML. Por su tamano, el modelo tambien deberia ejecutarse en GPUs NVIDIA de consumo como RTX 3060, 4060 o superiores.
- Cabe en GPU de consumo: si, con cuantizacion GGUF de 4 bits o superior en GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), Ollama (mencionado en la model card), llama.cpp mediante GGUF y DirectML.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sovereign-anthology-gemma-2-2b | 3,2B | 8192 (heredado, sin confirmar) | gemma | HuggingFace (0 descargas) |
| google/gemma-2-2b-it (base) | 2,6B aprox. | 8192 | gemma | HuggingFace |
| Gemma 2 2B (modelo original) | 2,6B aprox. | 8192 | gemma | HuggingFace |
| Modelos 1-3B de la misma categoria (Qwen2.5, Llama 3.2) | 1-3B | 32k-128k (segun version) | Apache 2.0 / Llama | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparacion se limita a parametros, contexto y licencia; los datos de los modelos alternativos corresponden a especificaciones publicas generales y no a un benchmark ejecutado sobre este ajuste.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre manuales desclasificados de agencias estadounidenses, cabe esperar una fuerte impronta cultural y burocratica anglosajona, aunque el autor no lo documenta.
- Riesgo de alucinacion: elevado por tratarse de un modelo de 2-3B parametros ajustado sobre contenido doctrinal; el propio autor advierte contra forzar la memorizacion de hechos historicos, que considera fuente de contaminacion y confusion cronologica.
- Limitaciones de contexto: ventana no confirmada en la informacion disponible; el idioma de trabajo es unicamente el ingles.
- Restricciones de licencia: se rige por los Gemma Terms of Use, que imponen condiciones de uso (incluidas obligaciones de atribucion y restricciones de uso aceptable). No es una licencia de codigo abierto permisiva; conviene revisar los terminos antes de uso comercial.
- Caveats para produccion: el repositorio tiene 0 descargas y 1 like, sin resultados de evaluacion publicados, por lo que carece de validacion independiente. La fecha de creacion (2026-09-20) es posterior a la fecha habitual de despliegue y conviene verificar la integridad del repositorio antes de integrarlo.
- El flujo de dos capas (RAG externo para hechos + modelo para razonamiento) exige montar infraestructura adicional (base vectorial y grafo de conocimiento); el modelo por si solo no cubre la capa de evidencia.
- Las afirmaciones de la model card sobre marcos operativos (ACH, Palantir, NSA, AAR) proceden del autor y no estan respaldadas por evaluaciones publicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KolmogorovAcc/sovereign-anthology-gemma-2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Ollama: https://ollama.com
- AMD: https://www.amd.com

Los resultados de busqueda web disponibles no guardan relacion con el modelo (versan sobre el distrito de Chaoyang de Pekin) y no aportan informacion adicional util.
