# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch11

## Resumen

`g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch11` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como parte de un experimento de desaprendizaje (machine unlearning) orientado a eliminar informacion concreta de un modelo ya entrenado, en este caso el subconjunto `forget10` (el 10 % de los autores ficticios del dataset TOFU).

El checkpoint corresponde a la epoca 11 de 20 de un procedimiento denominado IHL (probablemente una variante de *Information Hull Loss* o similar) combinado con un reinicio de embeddings de entrada y de la cabeza LM desde el modelo original `microsoft/phi-1_5`, mientras el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El objetivo es medir hasta que punto se puede "olvidar" el contenido de forget10 manteniendo el rendimiento en el conjunto retain, una tarea clasica de evaluacion de unlearning en modelos de lenguaje.

El modelo tiene 1.418.270.720 parametros (aproximadamente 1,4 B), un tamano de repositorio de 2,8 GB en formato safetensors y licencia Apache 2.0. Es un artefacto de investigacion sin descargas ni likes en el momento de la consulta, y no esta pensado para uso en produccion, sino como material reproducible para estudiar tecnicas de desaprendizaje sobre modelos Phi-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` segun tags de HuggingFace |
| Parametros totales | 1.418.270.720 (~1,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Phi-1.5 original soporta 2048 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/ AWQ publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`custom_code` requerido para cargar) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`, un transformer decoder-only de aproximadamente 1,3 B de parametros disenado originalmente para generacion de codigo y texto educativo, con atencion multi-cabeza estandar y sin mecanismos MoE. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene preguntas y respuestas sobre 200 autores ficticios, divididos en splits `forget` y `retain` para evaluar desaprendizaje.

El checkpoint que nos ocupa aplica un procedimiento IHL sobre el split `forget10` con una funcion de perdida compuesta: un termino IHL sobre los ejemplos a olvidar mas un termino de entropia cruzada (CE) con peso 1.0 sobre el conjunto retain. Ademas, reinicia los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` original, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. El resultado es un modelo completo autonomo (no un adaptador LoRA) que se corresponde con la epoca 11 de un entrenamiento de 20 epocas. El autor incluye un `ihl_manifest.json` con metadatos del experimento, aunque su contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5 y del ajuste TOFU.
- Respuesta a preguntas sobre el dataset TOFU (autores ficticios), con el subconjunto `forget10` supuestamente desaprendido.
- Razonamiento basico y generacion de codigo simple, capacidades residuales de Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint intermedio (epoca 11/20) para estudiar la curva de olvido frente a retencion en el split `forget10` de TOFU, comparandolo con otras epocas del mismo run.
- Reproducibilidad de experimentos: al ser un modelo completo con `ihl_manifest.json`, permite reproducir exactamente las condiciones de evaluacion de unlearning sin depender de adaptadores externos.
- Evaluacion de ataques de extraccion: util para medir si un adversario puede recuperar informacion supuestamente olvidada mediante prompts de extraccion o *membership inference*.
- Baseline en estudios comparativos: punto de referencia frente a otras tecnicas de unlearning (gradient ascent, KL minimization, etc.) sobre la misma base Phi-1.5.
- Analisis de degradacion: permite cuantificar la perdida de capacidad general (perplejidad en texto generico) inducida por el procedimiento IHL con reinicio de embeddings.
- Docencia y formacion: ejemplo practico de como se estructura un checkpoint de unlearning con pesos completos y metadatos asociados para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion 8 bits (si se generara): ~1,5 GB; en 4 bits: ~0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); no hay variantes GGUF publicadas para llama.cpp u Ollama; vLLM y TGI no estan confirmados para esta arquitectura con codigo personalizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch11` | ~1,4 B | No disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint de unlearning, epoca 11/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | No disponible | No disponible en la informacion | HuggingFace | Modelo base ajustado con TOFU completo |
| `microsoft/phi-1_5` | ~1,3 B | 2048 tokens | MIT (segun model card original) | HuggingFace | Modelo original de codigo/texto |
| `microsoft/phi-2` | ~2,7 B | 2048 tokens | MIT | HuggingFace | Alternativa mas grande de la familia Phi |

## Limitaciones y advertencias

- Es un artefacto de investigacion sin validacion externa: 0 descargas y 0 likes en el momento de la consulta.
- El objetivo del modelo es *olvidar* informacion, por lo que su comportamiento en dominios generales puede estar degradado respecto a Phi-1.5 original.
- No hay datos publicados sobre la eficacia real del olvido (accuracy en forget/retain) ni sobre la retencion de capacidades generales.
- Riesgo de alucinacion alto, heredado de Phi-1.5 y potencialmente agravado por el reinicio de embeddings y cabeza LM.
- Solo soporta ingles; no se debe asumir comportamiento correcto en castellano u otros idiomas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor; auditar antes de usar en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion; la responsabilidad recae en el integrador.
- El checkpoint corresponde a una epoca intermedia (11/20); no es necesariamente el punto final del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
