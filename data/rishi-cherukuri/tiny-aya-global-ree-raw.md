# rishi-cherukuri/tiny-aya-global-ree-raw

## Resumen

tiny-aya-global-ree-raw es un adaptador LoRA publicado por el usuario rishi-cherukuri sobre el modelo base CohereLabs/tiny-aya-global. Se trata de un ajuste fino de parametros eficientes (PEFT) orientado a un dominio muy concreto: la hidrometalurgia de tierras raras, en particular la separacion de Nd3+ y Pr3+ mediante extraccion por disolventes con PC-88A y el equilibrio de pH asociado. El adaptador se entreno en el marco del hackathon Lexsi AI Safety & Alignment (Track 1, problema 8) usando el framework Lexsi AlignTune con backend TRL.

El modelo no es un modelo fundacional autonomo: requiere cargar el modelo base tiny-aya-global y aplicar encima el adaptador. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador no estan materializados en el momento de la consulta o que el repo esta vacio. No se dispone de informacion sobre el numero de parametros del adaptador mas alla de la configuracion LoRA indicada (r=16, alpha=32).

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos generalistas: se trata de un experimento de alineacion de dominio especifico, sin benchmarks publicados, sin model card extendida y sin datos de rendimiento. Su interes radica en el caso de uso vertical (quimica de separacion de tierras raras) y en la metodologia PEFT aplicada a un modelo pequeno multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base CohereLabs/tiny-aya-global; r=16, alpha=32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiny-aya-global no se detalla en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base tiny-aya-global es multilingue, pero no se detalla en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio PEFT; el tamano del repo figura como 0.0 GB) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) con rango r=16 y alpha=32, aplicada sobre el modelo base CohereLabs/tiny-aya-global. El entrenamiento se realizo con Lexsi AlignTune, un framework de alineacion con backend TRL, en el contexto del hackathon Lexsi AI Safety & Alignment (Track 1, problema 8). El split de datos utilizado es el denominado `raw`, a partir del fichero `raw_dataset.jsonl`.

El dominio de entrenamiento es la extraccion por disolventes de tierras raras: separacion de Nd3+ y Pr3+, equilibrios con el extractante PC-88A y ajuste de pH. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO mas alla del marco de alineacion del framework. Tampoco se detallan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio especifico de hidrometalurgia de tierras raras.
- Razonamiento tecnico sobre equilibrios de extraccion por disolventes (PC-88A) y separacion Nd3+/Pr3+.
- Calculo y razonamiento sobre balance de pH en procesos de extraccion.
- Herencia de las capacidades del modelo base tiny-aya-global (multilingue, segun la familia Aya), aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistente de laboratorio para separacion de tierras raras: el adaptador puede responder consultas sobre condiciones de extraccion de Nd3+/Pr3+ con PC-88A, ayudando a tecnicos a interpretar parametros de proceso.
- Consulta de equilibrios quimicos: dado que el entrenamiento cubre equilibrios con PC-88A, puede emplearse para explicar relaciones entre concentracion de extractante, pH y selectividad.
- Formacion interna de personal de planta: como base para un chatbot de onboarding en procesos de hidrometalurgia, limitado al dominio entrenado.
- Prototipado de asistentes verticales: sirve como ejemplo de adaptacion PEFT de un modelo pequeno a un nicho cientifico, reutilizable como plantilla metodologica.
- Apoyo a la redaccion de procedimientos: generacion de borradores de protocolos de ajuste de pH en circuitos de extraccion, siempre con revision humana.
- Investigacion sobre alineacion de dominio: util como caso de estudio en experimentos de safety y alignment aplicados a dominios tecnicos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base tiny-aya-global (no especificado) y del adaptador LoRA.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo base tiny-aya (familia de modelos pequenos) probablemente quepa en GPU de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con librerias compatibles (transformers + peft); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (adaptadores LoRA de dominio sobre tiny-aya) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- El repositorio figura con un tamano de 0.0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar disponibles o que el artefacto esta incompleto; verificar antes de usarlo.
- No se ha publicado model card extendida ni informacion sobre sesgos, por lo que se desconoce su comportamiento fuera del dominio de tierras raras.
- Riesgo de alucinacion elevado en preguntas fuera del dominio de entrenamiento, dado el ajuste estrecho sobre un dataset `raw`.
- No se documentan idiomas soportados; el comportamiento multilingue depende del modelo base y no esta verificado.
- Licencia apache-2.0 declarada, pero conviene revisar la licencia del modelo base CohereLabs/tiny-aya-global para uso comercial combinado.
- No apto para produccion sin evaluacion previa: ausencia de benchmarks, de validacion y de datos de contexto.
- El uso en decisiones quimicas o industriales requiere validacion por expertos; el modelo no sustituye a un ingeniero de procesos.

## Enlaces

- Hugging Face: https://huggingface.co/rishi-cherukuri/tiny-aya-global-ree-raw
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Framework de entrenamiento (Lexsi AlignTune): no disponible en la informacion proporcionada
- Paper o blog del hackathon: no disponible en la informacion proporcionada
