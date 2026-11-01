# Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC

## Resumen

Nanbeige-4.3-33B-Heretic-EXL3-SC es un conjunto de cuantizaciones EXL3 (ExLlamaV3) del modelo Luni/Nanbeige-4.3-33B-Heretic, una variante "abliterated" o "uncensored" del modelo base Nanbeige4.3-33B desarrollado por el equipo Nanbeige. El modelo original es un transformer denso de 33.000 millones de parametros con capacidades de razonamiento explicito mediante modo de pensamiento (`<think>`), orientado a generacion de texto conversacional en ingles y chino. Esta version concreta la publica el usuario Luni y su aportacion principal no es el modelo en si, sino el proceso de cuantizacion: emplea el pipeline Self-Calibrated (SC) de turboderp para producir pesos EXL3 de 2,25 a 3,50 bits por peso con perdida de calidad minimizada.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 33B en GPUs de consumo de 12 a 16 GB de VRAM, algo imposible con los pesos BF16 originales (que ocuparian en torno a 66 GB). El autor reporta una divergencia KL de aproximadamente 0,035 en la variante de 3,50 bpw, lo que situa la cuantizacion cerca de ser sin perdida para tareas de codigo y matematicas. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

El modelo esta pensado para despliegues locales con ExLlamaV3, no para servir en produccion a gran escala mediante APIs estandar. Es una pieza util para desarrolladores que quieran razonamiento de 33B en hardware modesto y con un comportamiento menos restrictivo que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de atencion no disponibles) |
| Parametros totales | 33B (modelo base Nanbeige4.3-33B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor menciona ramas optimizadas para 8k-16k y 32k de contexto |
| Tipos de cuantizacion | EXL3 en 2,25 bpw, 2,50 bpw, 3,00 bpw y 3,50 bpw (Self-Calibrated) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3), safetensors por rama |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de 33.000 millones de parametros. La informacion disponible no detalla la composicion del dataset de preentrenamiento ni si se aplicaron fases de RLHF o DPO; la model card se centra en el proceso de cuantizacion y en las capacidades observadas (razonamiento, modo `thinking`, conversacion). La variante Heretic es un ajuste fino del modelo base orientado a reducir el comportamiento de rechazo y el estilo de respuesta excesivamente cauteloso ("anti-slop"), manteniendo el razonamiento.

La innovacion tecnica destacable de esta publicacion es el pipeline Self-Calibrated de ExLlamaV3, que consta de cinco etapas: (1) generacion de una traza de calibracion propia con 571.666 tokens `<think>` extraidos de 140 conversaciones, empaquetados en `cal_trace.safetensors` con forma 250 x 2048; (2) sonda de error relativo de Frobenius sobre 468 tensores lineales frente a una cuantizacion ancla; (3) medida de la degradacion de divergencia KL bajo inyeccion de ruido conformado sobre el modelo BF16 sin cuantizar; (4) programacion entera por tensor para asignar bits de forma optima, priorizando las proyecciones de atencion de la zona media (`q_proj`, `k_proj`, `v_proj`) y comprimiendo las capas MLP tolerantes (`up_proj`, `gate_proj`), con `gate_proj` fijado a un minimo de 4,0 bits y `lm_head` bloqueado a 6 bits para evitar el colapso de los limites de razonamiento; y (5) conversion final con `-rcp recipe.yaml -cd cal_trace.safetensors -ss 4096`. Este enfoque por tensor, guiado por la sensibilidad real del modelo, es lo que permite bajar a 2,25 bpw sin destruir la capacidad de razonamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito mediante modo de pensamiento (`<think>`), con trazas internas antes de la respuesta final.
- Razonamiento matematico y de codigo, preservado de forma casi sin perdida en la rama de 3,50 bpw (KLD ~0,035).
- Comportamiento "uncensored" o "heretic": menor tendencia al rechazo de peticiones y al estilo de respuesta sobrecauteloso.
- Estilo "anti-slop": respuestas menos genericas y con menos relleno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible, aunque el modo `thinking` es compatible con cadenas de razonamiento.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo de texto.

## Casos de uso

- Razonamiento local en GPU de consumo: con la rama de 2,25 bpw (9,4 GB) el modelo cabe en una RTX 3060 de 12 GB o una RTX 4070 de 12 GB, permitiendo razonamiento de 33B en un equipo domestico sin depender de la nube.
- Asistente de codigo en el IDE: la rama de 3,50 bpw (14,0 GB) preserva codigo y matematicas casi sin perdida (KLD ~0,035), por lo que es adecuada para autocompletado, explicacion y refactorizacion en un flujo de trabajo local con 16 GB de VRAM.
- Analisis de documentos largos en chino e ingles: las ramas de 3,00 bpw y 3,50 bpw dejan margen para contexto de 32k, utiles para resumir o extraer informacion de contratos, articulos o informes tecnicos en ambos idiomas.
- Generacion de contenido sin filtros excesivos: la variante Heretic reduce los rechazos, lo que resulta practico para escritura creativa, guiones o ficcion donde el modelo base seria demasiado restrictivo.
- Prototipado de agentes conversacionales: el modo `thinking` permite construir pipelines de razonamiento multi-paso con verificacion intermedia, siempre que se implemente el bucle de agente en el codigo del cliente.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia practica para estudiar el pipeline Self-Calibrated de ExLlamaV3 y comparar el impacto de 2,25 frente a 3,50 bpw en la calidad del razonamiento.
- Despliegue en estaciones de trabajo con una sola GPU: con ExLlamaV3 y las ramas de 2,50 bpw (10,0 GB) o 3,00 bpw (12,0 GB) se puede montar un servidor de inferencia local para un equipo pequeno sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de calidad es la divergencia KL reportada por el autor para la rama de 3,50 bpw (aproximadamente 0,035), que no es un benchmark de tarea sino una medida de fidelidad de la cuantizacion respecto al modelo BF16.

## Requisitos de hardware

- VRAM estimada segun rama: 3,50 bpw ocupa 14,0 GB y apunta a 16 GB de VRAM; 3,00 bpw ocupa 12,0 GB y apunta a 16 GB; 2,50 bpw ocupa 10,0 GB y apunta a 12-16 GB; 2,25 bpw ocupa 9,4 GB y apunta a 12 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) para las ramas de 3,00 y 3,50 bpw; RTX 3060 12 GB y RTX 4070 12 GB para las ramas de 2,25 y 2,50 bpw.
- Cabe en GPU de consumo: si, en todas las ramas indicadas por el autor, siempre que se reserve VRAM adicional para el contexto KV cache.
- Opciones de despliegue: ExLlamaV3 es la libreria nativa del formato EXL3; no es compatible con llama.cpp, Ollama ni TGI de forma directa. Para GGUF existe la suite separada Luni/Nanbeige-4.3-33B-Heretic-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. La rama de 2,25 bpw esta optimizada para contexto de 8k-16k en GPUs de 12 GB, y la de 3,00 bpw para 32k con 16 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic-EXL3-SC (este) | 33B | no disponible (ramas para 8k-32k) | EXL3 2,25-3,50 bpw | Apache-2.0 | Cuantizacion self-calibrated, uncensored, en/zh |
| Luni/Nanbeige-4.3-33B-Heretic (BF16) | 33B | no disponible | BF16 safetensors | Apache-2.0 | Modelo de referencia sin cuantizar; requiere ~66 GB |
| Luni/Nanbeige-4.3-33B-Heretic-EXL3 | 33B | no disponible | EXL3 (cuantizacion estandar) | Apache-2.0 | Misma base sin el pipeline SC; calidad inferior esperada a igual bpw |
| Luni/Nanbeige-4.3-33B-Heretic-GGUF | 33B | no disponible | GGUF / GGUF-IQ | Apache-2.0 | Alternativa para llama.cpp y Ollama, no para ExLlamaV3 |
| Nanbeige/Nanbeige4.3-33B | 33B | no disponible | BF16 safetensors | Apache-2.0 | Modelo base original, con filtros de seguridad estandar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de tarea frente a alternativas de otros desarrolladores; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Solo soporta ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Al ser una variante "uncensored"/"heretic", reduce los rechazos de seguridad del modelo base; esto implica un mayor riesgo de generar contenido inapropiado o danino y exige moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de 33B, especialmente en modo `thinking` con cadenas de razonamiento largas; no hay datos de benchmarks que cuantifiquen la fiabilidad.
- La cuantizacion a 2,25 y 2,50 bpw degrada la calidad respecto a BF16; el autor solo reporta KLD para la rama de 3,50 bpw, por lo que el impacto real en tareas concretas a baja precision no esta medido publicamente.
- El formato EXL3 solo es compatible con ExLlamaV3; no funciona con llama.cpp, Ollama, vLLM ni TGI. Para esos entornos hay que usar la suite GGUF.
- El contexto maximo real no se especifica; las cifras de 8k-32k son recomendaciones de VRAM del autor, no limites arquitectonicos confirmados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el ajuste Heretic pueden arrastrar sesgos de los datos de entrenamiento originales, no documentados en esta ficha.
- El repositorio tiene muy pocas descargas (15) y ningun "like", por lo que no hay validacion comunitaria independiente de la calidad de estas cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
- Modelo base Heretic BF16: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantizacion EXL3 estandar: https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Suite maestra Heretic EXL3: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- Drafter especulativo: https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2
- Suite GGUF e GGUF-IQ: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
- Suite GGUF GSQ-RCO no uniforme: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF
