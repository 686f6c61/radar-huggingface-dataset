# bharatgenai/Param2-17B-A2.4B-Thinking

## Resumen

Param2-17B-A2.4B-Thinking es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por BharatGen, una iniciativa india centrada en la construccion de modelos fundacionales para lenguas indias. El modelo cuenta con 17.151.125.376 parametros totales y 2.400 millones de parametros activos por token, lo que lo situa en la categoria de modelos de gran capacidad con coste de inferencia reducido gracias a la activacion dispersa de expertos. Su nombre indica explicitamente la presencia de un modo de razonamiento ("Thinking") orientado a tareas que requieren cadenas de pensamiento.

El modelo esta disenado para generacion de texto conversacional y multilingue, con soporte declarado para 23 idiomas, incluyendo hindi, ingles y una amplia representacion de lenguas indias como asamés, bengali, gujarati, kannada, malayalam, marathi, tamil, telugu, urdu, sánscrito y otras lenguas minoritarias del subcontinente. Esta cobertura linguistica lo convierte en una alternativa relevante frente a modelos predominantemente anglocentricos para aplicaciones en el mercado indio y en contextos de investigacion en linguistica computacional.

El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio de Hugging Face esta restringido (gated) y requiere aceptar las condiciones de uso. Su publicacion en febrero de 2026 y su actividad de actualizacion hasta noviembre de 2026 lo situan como un proyecto en evolucion activa dentro del ecosistema de IA open source de la India.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, clase `param2moe` |
| Parametros totales | 17.151.125.376 |
| Parametros activos | 2.400 millones (aproximado, segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | hi, en, as, bn, brx, doi, gu, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo personalizado `custom_code` requerido por transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Mixture of Experts (MoE) implementado sobre un transformer, identificado en el repositorio con la clase personalizada `param2moe`. Con 17.151 millones de parametros totales y aproximadamente 2.400 millones activos por token, el modelo sigue el patron de activacion dispersa tipico de los MoE modernos: solo una fraccion de los expertos se activa en cada paso de inferencia, lo que reduce el coste computacional y la latencia frente a un modelo denso del mismo tamano. El ratio de activacion (en torno al 14 % de los parametros) es coherente con disenos como Mixtral o DeepSeek-MoE.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se han publicado detalles sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible. El sufijo "Thinking" sugiere un ajuste orientado a razonamiento explicito, potencialmente con cadenas de pensamiento, pero no se confirma la metodologia en los datos proporcionados.

## Capacidades

- Generacion de texto conversacional multi-turno en 23 idiomas, con especial enfasis en lenguas indias.
- Razonamiento explicito en modo "Thinking" (cadenas de pensamiento), segun indica el nombre del modelo.
- Capacidad multilingue amplia: hindi, ingles, asamés, bengali, bodo, dogri, gujarati, kannada, cachemir, maithili, malayalam, manipuri, marathi, nepalés, oriya, punyabí, sánscrito, santali, sindhi, tamil, telugu y urdu.
- Generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: plausible por el modo Thinking, pero no documentado en los datos proporcionados.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente en lenguas indias: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, telugu, bengali y otras lenguas regionales, cubriendo un mercado de cientos de millones de hablantes con un unico modelo desplegado.
- Traduccion y localizacion automatica: traduccion entre ingles y las 22 lenguas indias soportadas, util para empresas que necesitan localizar productos en el subcontinente sin depender de APIs propietarias.
- Asistentes conversacionales para administracion publica: despliegue de chatbots para tramites y servicios ciudadanos en lenguas regionales, aprovechando la licencia Apache 2.0 para uso institucional sin restricciones.
- Investigacion en linguistica computacional: estudio de rendimiento en lenguas de bajos recursos como santali, bodo, dogri o maithili, donde los modelos mainstream tienen cobertura limitada.
- Generacion de contenido educativo: creacion de materiales didacticos y resumenes en lenguas indias para plataformas de e-learning, con el modo Thinking para tareas de razonamiento paso a paso.
- Razonamiento asistido en dominios tecnicos: uso del modo Thinking para descomponer problemas complejos en pasos intermedios, adecuado para analisis y planificacion en entornos donde se requiera trazabilidad del razonamiento.
- Despliegue en infraestructura con recursos moderados: gracias a sus 2.400 millones de parametros activos, el coste de inferencia es sustancialmente menor que el de un modelo denso de 17B, lo que facilita su servicio en GPUs de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 34 GB solo para pesos (17.151 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 40-48 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 17-20 GB, viable en GPUs como RTX 4090 (24 GB) o A6000.
- VRAM estimada en cuantizacion de 4 bits: en torno a 9-11 GB, viable en RTX 3090, RTX 4090 o incluso GPUs consumer de 12-16 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para BF16 en produccion; RTX 4090 o A6000 para cuantizaciones de 8 bits; RTX 3090/4090 para 4 bits.
- Despliegue: transformers con `trust_remote_code=True` (requerido por `param2moe`); vLLM, TGI o llama.cpp no estan confirmados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles. El ratio de activacion del 14 % sugiere throughput superior al de un modelo denso de 17B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| Param2-17B-A2.4B-Thinking | 17,15 B | 2,4 B | no disponible | Apache 2.0 | Gated en HF |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | Abierto |
| DeepSeek-MoE 16B | 16,4 B | 2,8 B | 4 K | DeepSeek License | Abierto |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32 K | Apache 2.0 | Abierto |

La comparativa mas directa es con DeepSeek-MoE 16B y Qwen1.5-MoE-A2.7B, que comparten el patron de ~2,5-2,8 B de parametros activos sobre ~15-17 B totales. Param2 se diferencia por su enfoque explicito en lenguas indias y su modo Thinking, aunque carece de datos publicos de benchmarks y de contexto declarado que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia de benchmarks publicos: no hay datos verificables de MMLU, HumanEval, GSM8K ni evaluaciones multilingues, lo que impide validar su calidad frente a alternativas.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que anade friccion al despliegue automatizado.
- Requiere `trust_remote_code=True`: la arquitectura `param2moe` no es nativa de transformers, lo que implica ejecutar codigo personalizado del autor y revisarlo antes de usarlo en produccion.
- Riesgo de alucinacion: no documentado, pero inherente a los modelos generativos; la ausencia de evaluaciones publicas agrava la incertidumbre.
- Sesgos: no documentados. La cobertura de 23 lenguas indias puede introducir desequilibrios de calidad entre lenguas mayoritarias (hindi, bengali) y minoritarias (santali, bodo, dogri).
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que limita la planificacion de casos de uso con documentos largos.
- Soporte de tool calling y agentes no confirmado: no se puede asumir su uso en pipelines agenticos sin validacion previa.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones adicionales del acceso gated en Hugging Face.
- Fecha de creacion reciente (febrero de 2026) y ecosistema emergente: menor madurez de tooling y comunidad comparado con modelos establecidos.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/Param2-17B-A2.4B-Thinking
- BharatGen (organizacion): https://huggingface.co/bharatgenai
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
