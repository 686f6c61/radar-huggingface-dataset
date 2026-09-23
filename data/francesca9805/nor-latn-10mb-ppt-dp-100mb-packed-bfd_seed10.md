# francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 es un ajuste fino supervisado (SFT) del modelo noruego goldfish-models/nor_latn_10mb, publicado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros (aproximadamente 39 millones), lo que lo situa en la categoria de modelos pequenos orientados a investigacion y experimentacion more than a despliegue en produccion. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors.

El modelo forma parte de una familia de experimentos sistematicos: el mismo autor publica variantes equivalentes para otros idiomas (eng, swe) y la nomenclatura sugiere barridos de hiperparametros y semillas (seed10, seed455, seed3407) sobre un corpus empaquetado de 100 MB. El nombre del checkpoint indica el idioma (nor, noruego en escritura latina), el tamano del corpus base del modelo Goldfish (10 MB), el esquema de datos ("packed", empaquetado) y la semilla utilizada.

Su relevancia es fundamentalmente academica: sirve para estudiar el efecto del ajuste fino por instrucciones en modelos monolingues de muy baja capacidad y corpus reducido, asi como para reproducir experimentos de tokenizacion (el proyecto de Weights & Biases asociado se titula "new-tokenizers"). No es un modelo competitivo en tareas de razonamiento, codigo o conocimiento general, y no presenta descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors en la precision original |
| Idiomas soportados | noruego (nor_latn) heredado del modelo base; no confirmado explicitamente en la model card |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal como indica la etiqueta `gpt2` y la model card, que ademas muestra un ejemplo de uso con `pipeline("text-generation")`. El punto de partida es goldfish-models/nor_latn_10mb, un modelo monolingue de la familia Goldfish entrenado sobre 10 MB de texto en noruego. El ajuste fino se realizo con SFT (supervised fine-tuning) mediante la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo etapas adicionales de RLHF o DPO. El nombre del checkpoint sugiere un corpus empaquetado ("packed") de 100 MB y un identificador de semilla (`seed10`), coherente con un barrido experimental. El ejemplo de la model card usa un formato conversacional con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste SFT introdujo una plantilla de chat. Existe un registro publico del entrenamiento en Weights & Biases bajo el proyecto "new-tokenizers".

## Capacidades

- Generacion de texto autoregresiva basica en noruego, condicionada por una plantilla conversacional de un solo turno.
- Seguimiento superficial de instrucciones, como consecuencia directa del ajuste SFT.
- Capacidad de completar textos y responder preguntas simples dentro de dominios muy restringidos.
- Tool calling: no disponible.
- Function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: muy limitadas; el modelo base es monolingue noruego y no hay evidencia de transferencia a otros idiomas.
- Capacidad especial (modo thinking, vision, audio): no disponible.
- Alineacion conversacional: parcial, limitada a la plantilla usada durante el SFT.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo permite replicar el efecto del ajuste SFT sobre un modelo monolingue de 39 M de parametros, comparando semillas y esquemas de datos dentro de la misma familia de checkpoints.
- Investigacion sobre tokenizacion: dado que el proyecto de entrenamiento se asocia al estudio de nuevos tokenizadores, el checkpoint sirve como punto de comparacion entre vocabularios y su impacto en la calidad de generacion.
- Generacion de texto noruego a nivel de frase o parrafo corto: util para prototipos de completado de texto donde no se requiere coherencia de largo alcance.
- Pruebas de integracion de infraestructura: por su tamano minimo, permite validar pipelines de transformers, TGI o endpoints compatibles sin coste computacional relevante.
- Educacion y divulgacion: sirve para ilustrar de forma tangible que es un ajuste fino SFT, el formato safetensors o el uso de `pipeline` de HuggingFace en un caso real y ligero.
- Generacion de datos sinteticos de bajo coste: puede emplearse para producir borradores de texto noruego que despues se filtren o se usen como material auxiliar en experimentos de destilacion o aumento de datos.
- Pruebas de regresion en despliegues: al ser tan pequeno, es adecuado como modelo de humo (smoke test) para verificar que un servidor de inferencia arranca, responde y aplica correctamente la plantilla de chat.
- Analisis de sesgos y comportamientos: util como sujeto de estudio para observar como un corpus de 10-100 MB y un ajuste SFT moldean el estilo, el vocabulario y los sesgos del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y el repositorio no registra descargas ni valoraciones de usuarios que permitan inferir un rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en fp16 y 160 MB en fp32 para los pesos; el consumo real en inferencia ronda unos cientos de MB incluyendo activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 estan sobredimensionados para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de las ultimas dos decadas, e incluso en CPU, en Raspberry Pi o en dispositivos moviles.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (la etiqueta `text-generation-inference` esta presente en el repositorio), endpoints compatibles (`endpoints_compatible`), vLLM y Ollama tras conversion a GGUF. No se publican binarios GGUF ni cuantizaciones listas para usar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | 39,09 M | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sobre Goldfish noruego |
| goldfish-models/nor_latn_10mb | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo monolingue noruego entrenado con 10 MB; sin ajuste por instrucciones |
| francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | HuggingFace y FriendliAI | Variante en ingles del mismo experimento |
| francesca9805/swe-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | HuggingFace | Variante en sueco del mismo experimento |
| fpadovani/swa-latn-10mb-ppt-Dp-100mb_seed10 | no disponible | no disponible | no disponible | HuggingFace | Variante relacionada del mismo grupo de investigacion (suajili) |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparacion se limita a parametros, procedencia y disponibilidad.

## Limitaciones y advertencias

- Capacidad muy reducida: con 39 M de parametros y un corpus base de 10 MB, el modelo no puede sostener razonamiento complejo, conocimiento factual fiable ni coherencia en generaciones largas.
- Riesgo alto de alucinacion: al no disponer de un corpus amplio, cualquier afirmacion factual debe verificarse externamente.
- Idiomas: el modelo esta orientado al noruego; se desconoce su comportamiento en castellano u otras lenguas y probablemente sea deficiente.
- Longitud de contexto no documentada: no se especifica en la model card, por lo que no debe asumirse una ventana amplia ni usarse para conversaciones multi-turno largas.
- Licencia no disponible: la model card incluye un campo `licence: license` sin texto, lo que impide confirmar si se permite el uso comercial. Debe consultarse con el autor antes de cualquier uso en produccion.
- Modelo sin adopcion: 0 descargas y 0 interacciones en el momento de la ficha, sin validacion externa de calidad.
- Procedencia experimental: el nombre del checkpoint indica un barrido de hiperparametros y semillas, no un modelo optimizado ni evaluado para produccion.
- Fecha de creacion inusual en los metadatos (2026-09-23), lo que conviene verificar antes de citar el modelo en trabajos academicos.
- Trazabilidad limitada: no se documentan la composicion del dataset de SFT ni los criterios de filtrado, lo que dificulta auditar sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c84mc8us
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en ingles: https://huggingface.co/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en sueco: https://huggingface.co/francesca9805/swe-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en suajiili: https://huggingface.co/fpadovani/swa-latn-10mb-ppt-Dp-100mb_seed10
- Ficha en LLM Explorer de una variante relacionada: https://llm-explorer.com/model/fpadovani%2Fnor-latn-10mb-ppt-Dp-10mb_seed3407,2sMuGS3MbInPJ17oi8Y0o6
- Despliegue de la variante en ingles en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
