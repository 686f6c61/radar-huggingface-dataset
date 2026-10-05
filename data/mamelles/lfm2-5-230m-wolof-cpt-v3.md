# mamelles/LFM2.5-230M-Wolof-CPT-v3

## Resumen

LFM2.5-230M-Wolof-CPT-v3 es un artefacto de ajuste por preentrenamiento continuado (continual pretraining, CPT) sobre el modelo base LiquidAI/LFM2.5-230M-Base, orientado exclusivamente al idioma wolof (codigo ISO `wo`). Lo publica el usuario `mamelles` en HuggingFace y se presenta explicitamente en su model card como un "artefacto de produccion privado", experimental y no destinado a publicacion general. El modelo cuenta con 232.627.968 parametros totales en formato safetensors y un repositorio de 0,5 GB.

El problema que aborda es la adaptacion de un modelo pequeno de la familia LFM2 de Liquid AI a un idioma de bajos recursos como el wolof, mediante un protocolo de corpus limpio y reequilibrado de datos de instruccion. No es un modelo de instrucciones ni un asistente conversacional listo para produccion: la model card indica que no se ha validado de forma exhaustiva la ortografia del wolof, el code-switching, la factualidad, el razonamiento, el comportamiento en contexto largo ni la seguridad.

Su relevancia actual es fundamentalmente como pieza de investigacion reproducible en adaptacion linguistica: publica metricas legibles por maquina (BPB, perplejidad, BLEU y chrF) y advierte de que la familia de tokenizador empleada es `65k-ext`, por lo que los valores de BPB no deben compararse como perplejidad entre las familias de 65k y 128k. El modelo no declara licencia, contexto ni cuantizaciones en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (Liquid Foundation Model 2) de Liquid AI; detalle interno no disponible |
| Parametros totales | 232.627.968 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors; libreria transformers |
| Familia de tokenizador | `65k-ext` |
| Tamano del repositorio | 0,5 GB |
| Modelo base | LiquidAI/LFM2.5-230M-Base |
| Etapa de entrenamiento | CPT (continual pretraining) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-230M-Base` y aplica una etapa de preentrenamiento continuado sobre un corpus de wolof siguiendo el "protocolo de corpus limpio de wolof". Segun la model card, los datos de instruccion fueron reequilibrados y excluyen el split de test del Hub de origen, aunque se advierte de que pueden haber existido ejemplos similares a los de los benchmarks en el preentrenamiento previo del modelo base. La fila de datos privados no se distribuye con el repositorio, por lo que no es posible auditar directamente la composicion del corpus.

No se especifica en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card menciona un `training_manifest.json` con puertas automatizadas de calidad que el artefacto habria superado, pero no reproduce su contenido. El tokenizador pertenece a la familia `65k-ext`, un dato relevante porque las metricas de BPB solo son comparables dentro de la misma familia de tokenizador. No se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal autorregresiva en wolof, derivada de la etapa de CPT sobre el modelo base.
- Modelado de lenguaje y puntuacion de texto (perplejidad, BPB), util para evaluacion y filtrado de corpus en wolof.
- Traduccion o verbalizacion de pares de frases, segun el protocolo de evaluacion declarado (BLEU 2,03 y chrF 15,86 sobre 100 pares verbalizados).
- Capacidades heredadas del modelo base LFM2.5-230M: no detalladas en la informacion disponible.
- Soporte de tool calling / function calling: no declarado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado y explicitamente no validado segun la model card.
- Capacidades multilingues: limitadas al wolof segun el campo `language: wo`; no se declara cobertura de otros idiomas.
- Capacidad especial (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en adaptacion de modelos a idiomas de bajos recursos: sirve como punto de partida reproducible para estudiar el efecto del CPT sobre un modelo de 230M en wolof, con metricas de BPB y perplejidad ya publicadas.
- Puntuacion y filtrado de corpus en wolof: el modelo puede usarse para calcular verosimilitud sobre frases y descartar texto ruidoso o mal normalizado antes de construir un dataset mayor.
- Comparacion de familias de tokenizador: al declarar explicitamente la familia `65k-ext`, permite experimentos controlados sobre como cambia el BPB entre tokenizadores sin confundirlo con perplejidad.
- Prototipado de generacion de texto en wolof en entornos academicos: util para generar borradores o completar frases en demostraciones internas, siempre con revision de hablantes nativos.
- Evaluacion de transferencia linguistica: permite medir cuanto conocimiento general del modelo base se conserva tras el CPT sobre un corpus de un solo idioma.
- Base para un futuro ajuste por instrucciones: al ser un checkpoint de CPT, es un candidato natural para una segunda fase de SFT o DPO en wolof, aunque esa fase no esta incluida aqui.
- Analisis de deriva (catastrophic forgetting): comparar este checkpoint con `LiquidAI/LFM2.5-230M-Base` en tareas fuera del wolof para cuantificar la perdida de capacidades generales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el "Wolof CLM corpus test (verbalized)", split `test`. Ninguno de los valores esta verificado de forma independiente (`verified: false`).

| Metrica | Valor | Notas |
|---|---:|---|
| Bits Per Byte (BPB) | 1,4857 | Metrica gold entre tokenizadores; menor es mejor |
| Perplejidad | 13,39 | Solo comparable dentro del mismo tokenizador |
| BLEU | 2,03 | Sobre 100 pares verbalizados |
| chrF | 15,86 | Sobre 100 pares verbalizados |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 232,6M de parametros: aproximadamente 0,47 GB en fp16, 0,24 GB en int8 y 0,12 GB en int4, sin contar el cache KV ni el overhead del runtime.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU o en GPUs integradas con suficiente memoria compartida.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para evaluacion por lotes a gran escala.
- Opciones de despliegue: al publicarse en safetensors y con `library_name: transformers`, la via directa es `transformers` sobre PyTorch. Para `vLLM`, `TGI`, `llama.cpp` u `Ollama` haria falta convertir los pesos a los formatos correspondientes (GGUF para llama.cpp/Ollama), conversion no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, en una GPU de consumo moderna se espera un throughput alto, pero no hay cifras publicadas que se puedan citar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa honesta. La unica referencia directa es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| LFM2.5-230M-Wolof-CPT-v3 | 232,6M | no disponible | no disponible | Objeto de esta ficha |
| LiquidAI/LFM2.5-230M-Base | 230M (aproximado, segun denominacion) | no disponible | no disponible | Modelo base; sin metricas de wolof publicadas aqui |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- La propia model card califica el modelo como experimental y como "artefacto de produccion privado", no un lanzamiento publico.
- No se ha validado de forma exhaustiva la ortografia del wolof, el code-switching, la factualidad, el razonamiento, el comportamiento en contexto largo ni la seguridad.
- Se requiere revision por hablantes nativos antes de cualquier uso mas amplio; los autores lo indican de forma explicita.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el modelo es un checkpoint de CPT sin ajuste por instrucciones ni alineamiento declarado, por lo que no debe usarse como asistente factual sin verificacion.
- Los valores de BLEU (2,03) y chrF (15,86) son bajos para una tarea de generacion de pares verbalizados, lo que sugiere una calidad de traduccion o verbalizacion limitada en esta etapa.
- Contaminacion potencial: la model card advierte de que pueden haber existido ejemplos similares a los de los benchmarks en el preentrenamiento previo del modelo base, aunque el split de test del Hub de origen se excluyo del reequilibrado de datos de instruccion.
- La perplejidad solo es comparable dentro del mismo tokenizador; la metrica correcta para comparar entre familias (`65k` frente a `128k`) es el BPB.
- Licencia no disponible: sin una licencia declarada no hay autorizacion explicita de uso comercial, lo que bloquea su adopcion en produccion.
- Los datos de entrenamiento privados no se distribuyen, por lo que la reproducibilidad del CPT es parcial.
- Los resultados declarados no estan verificados de forma independiente (`verified: false`).
- Idioma unico (wolof): no se declara soporte para otras lenguas, y el CPT podria haber degradado capacidades generales del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-230M-Wolof-CPT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Metricas legibles por maquina (URL tal como aparece en la model card): https://huggingface.co/Tonic/LFM2.5-230M-Wolof-CPT-v3/blob/main/metrics.json
- Fuente de evaluacion citada: "GalsenAI LFM2.5 Wolof family eval" (sin URL adicional en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados corresponden a definiciones del termino frances "mamelle" y no guardan relacion con este artefacto.
