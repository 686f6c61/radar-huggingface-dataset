# Renjie-Ranger/writing-fcp-scores-p10-offline-qwen2.5-7b

## Resumen

`writing-fcp-scores-p10-offline-qwen2.5-7b` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-7B orientado a la generacion de escritura creativa condicionada por retroalimentacion numerica. Lo publica el usuario Renjie-Ranger bajo licencia Apache 2.0. El modelo aprende a generar relatos a partir de un prefijo que declara cuatro puntuaciones (de 0 a 10) en las dimensiones Narrative Execution, Characterization and Emotional Impact, Originality and Creativity y Prose and Style, de modo que el usuario puede solicitar un nivel de calidad concreto por dimension.

El entrenamiento consistio en un SFT offline con retroalimentacion numerica durante 200 pasos de optimizador (una epoca) sobre una decima parte del pool original de prompts de escritura. El export offline contiene 101.959 relatos con las cuatro puntuaciones originales; la retroalimentacion online la proporciona DeepSeek Flash y el export online parte de este modelo offline con 15 pasos globales completados. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-7B, con 7.615.616.512 parametros totales.

Es relevante como ejemplo de condicionamiento numerico fino sobre un modelo abierto de 7B: permite estudiar como un LLM responde a senales de calidad explicitas en el prompt. El propio autor advierte que no se reclama ninguna mejora en la calidad de escritura para este export y que la condicion positiva evaluada (cuatro puntuaciones de 6/10) tiene cero ejemplos exactos en el conjunto de entrenamiento offline (solo cinco ejemplos cumplen los cuatro umbrales >=6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), tokenizer y configuracion incluidos |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only denso de 7.615.616.512 parametros. Sobre esa base se aplico un ajuste fino supervisado (SFT) offline con retroalimentacion numerica: 200 pasos de optimizador, una epoca, sobre una decima parte del pool original de prompts de escritura. El export offline incluye 101.959 relatos anotados con cuatro puntuaciones numericas por dimension. La retroalimentacion online proviene de DeepSeek Flash; el export online arranca desde este modelo offline y acumula 15 pasos globales completados.

El condicionamiento se inyecta como un prefijo de texto con etiquetas de las cuatro dimensiones (Narrative Execution, Characterization and Emotional Impact, Originality and Creativity, Prose and Style) y una puntuacion sobre 10 por dimension. Se debe usar la plantilla de chat del tokenizer incluido. No se documentan innovaciones de decodificacion, atencion lineal ni tecnicas de RLHF/DPO; el unico mecanismo destacable es el propio condicionamiento numerico por prefijo. El archivo incluye solo pesos BF16, tokenizer y configuracion: no se distribuyen estado de optimizador, scheduler, estado de reanudacion de entrenamiento distribuido ni credenciales de API. Se elimina metadato local de rutas de origen irrelevante para inferencia, manteniendo intactos pesos y vocabulario.

## Capacidades

- Generacion de texto narrativo y escritura creativa en ingles.
- Condicionamiento por retroalimentacion numerica: acepta un prefijo `<EF>...</EF>` con cuatro dimensiones puntuadas de 0 a 10.
- Generacion de relatos completos a partir de un prompt de escritura mas el prefijo de puntuaciones.
- Conversacion mediante la plantilla de chat del tokenizer incluido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Estudio de condicionamiento numerico: usar el prefijo `<EF>` con distintas combinaciones de puntuaciones para analizar como varia el texto generado segun la senal de calidad solicitada, aprovechando que el modelo fue entrenado especificamente para asociar esas etiquetas a niveles concretos.
- Generacion de variantes de un mismo relato: fijar el prompt de escritura y modificar solo las puntuaciones del prefijo para producir borradores con distintos perfiles declarados de originalidad o estilo, util en investigacion sobre control de atributos en LLMs.
- Creacion de datasets sinteticos de escritura anotada: generar relatos junto a su prefijo de puntuaciones para construir corpus con etiquetas de calidad controladas, dado que el export original contiene 101.959 relatos con feedback de cuatro dimensiones.
- Evaluacion de sensibilidad a la retroalimentacion: comparar las salidas del modelo base Qwen2.5-7B frente a este ajuste para medir el efecto del SFT con feedback numerico en un entorno controlado.
- Prototipado de asistentes de escritura en ingles: integrar el modelo mediante `transformers` o TGI en un flujo donde el usuario declare objetivos de calidad por dimension antes de generar el texto.
- Reproduccion de experimentos de investigacion: al estar disponibles pesos BF16, tokenizer y configuracion, sirve para reproducir el pipeline de SFT offline descrito (200 pasos, una epoca, decima parte del pool) y compararlo con el export online basado en DeepSeek Flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna mejora en la calidad de escritura para este export.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,2 GB solo para pesos, mas memoria para activaciones y cache KV; el tamano del repo es de 15,2 GB.
- Cuantizacion: no se documentan tipos de cuantizacion en el repo; al ser un derivado de Qwen2.5-7B, es previsible que herramientas como llama.cpp o GPTQ/AWQ puedan convertirlo, pero no se confirma en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabida en GPU de consumo: no confirmado; en BF16 los pesos superan los 15 GB, por lo que no cabe en GPUs de 8-12 GB sin cuantizar.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` y con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| writing-fcp-scores-p10-offline-qwen2.5-7b | 7.615.616.512 | no disponible | SFT con feedback numerico para escritura creativa | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B (base) | 7.615.616.512 | no disponible en esta ficha | LLM generalista | apache-2.0 | Hugging Face |
| Export online del mismo autor (basado en DeepSeek Flash) | no disponible | no disponible | SFT con feedback online, 15 pasos globales | no disponible | Referenciado en la model card |
| Alternativas de escritura creativa de ~7B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor no reclama ninguna mejora en la calidad de escritura; el modelo es un export experimental de investigacion.
- La condicion positiva evaluada (cuatro puntuaciones de 6/10) tiene cero ejemplos exactos en el entrenamiento offline; solo cinco ejemplos cumplen los cuatro umbrales >=6, por lo que el comportamiento en esa condicion no esta respaldado por datos de entrenamiento representativos.
- Solo soporta ingles; no se declaran otros idiomas.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-7B hereda los sesgos del modelo base y de los datos de escritura empleados.
- Riesgo de alucinacion: no documentado especificamente; aplica el riesgo habitual de un LLM de 7B en generacion de texto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no valida la calidad de las salidas.
- El repo no incluye estado de optimizador, scheduler ni estado de reanudacion, lo que limita la reproduccion exacta del entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes independientes de rendimiento.
- No se documenta la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renjie-Ranger/writing-fcp-scores-p10-offline-qwen2.5-7b
- Modelo base Qwen2.5-7B: no disponible en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada
