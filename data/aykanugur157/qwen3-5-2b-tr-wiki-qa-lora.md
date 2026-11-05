# Aykanugur157/qwen3.5-2b-tr-wiki-qa-lora

## Resumen

`qwen3.5-2b-tr-wiki-qa-lora` es un adaptador LoRA para el modelo base Qwen/Qwen3.5-2B, publicado por el usuario Aykanugur157. Su proposito es responder preguntas en turco extrayendo una respuesta corta y literal de un pasaje de contexto proporcionado en el propio prompt (question answering con grounding en contexto). El adaptador se entrena sobre 3.000 filas del dataset `Aykanugur157/tr-wiki-qa`, lo que representa un 4,4 % del total del dataset.

El modelo base Qwen3.5-2B emplea atencion lineal en parte de sus capas, y el adaptador hereda esa arquitectura. El repositorio solo contiene los pesos del adaptador (0,1 GB en safetensors); el modelo base debe descargarse por separado. La licencia es CC-BY-SA 4.0 y el unico idioma declarado es el turco.

Es relevante como ejemplo de ajuste fino eficiente (LoRA, 46 minutos en una Tesla T4) que iguala o supera a un encoder especializado como BERTurk en un benchmark de QA extractivo en turco, con la ventaja de reutilizar un modelo generativo de 2B. No obstante, los datos de entrenamiento son generados por maquina y no validados por humanos, y el autor advierte de que parte de la mejora en Exact Match proviene del formato de respuesta mas que del contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-2B con capas de atencion lineal |
| Parametros totales | No disponible para el adaptador; modelo base Qwen3.5-2B (parte de texto ~1,88 mil millones segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite fp16 segun el ejemplo) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base se descarga aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un modelo generativo con capas de atencion lineal (la model card menciona `flash-linear-attention` como dependencia para acelerar la inferencia). El ajuste es un LoRA con r=16, alpha=32, dropout 0,05, aplicado a todas las capas lineales (atencion, MLP y proyecciones de atencion lineal). Se entrena durante 1 epoca sobre 3.000 filas aleatorias (semilla 42) del dataset `Aykanugur157/tr-wiki-qa`, con learning rate 0,00015, batch efectivo 16 y perdida calculada unicamente sobre los tokens de respuesta. La perdida final de entrenamiento fue 0,069.

El entrenamiento consumio aproximadamente 1,29 millones de tokens y se ejecuto en una Tesla T4 durante unos 46 minutos, con torch 2.11.0+cu130 y transformers 5.22.0. El dataset es generado por maquina y no validado por humanos, y el autor indica que se trata de una unica ejecucion con una unica semilla, sin intervalos de confianza. El prompt de evaluacion desactiva el modo de razonamiento (`enable_thinking=False`) y usa decodificacion greedy.

## Capacidades

- Generacion de texto y respuesta a preguntas en turco con respuesta corta extraida del contexto.
- Question answering extractivo con grounding: la respuesta debe aparecer literalmente en el pasaje proporcionado.
- Formato de chat mediante `apply_chat_template` con soporte para desactivar el bloque de razonamiento (`<think>`).
- Capacidad multilingue limitada al turco segun la model card (el base Qwen3.5-2B podria tener otras, pero no se declaran para este adaptador).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio para este adaptador.
- El adaptador no aporta capacidades nuevas mas alla del ajuste de estilo y tarea; hereda las del modelo base.

## Casos de uso

- Question answering sobre articulos de Wikipedia en turco: dado un pasaje y una pregunta, el adaptador devuelve una respuesta corta y literal, adecuado para pipelines de extraccion de datos estructurados a partir de texto enciclopedico.
- Construccion de un sistema de busqueda con respuesta (retrieval-augmented generation extractivo): se recupera un fragmento y el adaptador extrae la respuesta exacta, lo que facilita la verificacion porque la respuesta aparece en el contexto.
- Evaluacion de calidad de bases de conocimiento: el adaptador puede usarse para comprobar si una pregunta tiene respuesta en un pasaje dado, generando la cita literal que la sustenta.
- Prototipado rapido en entornos con GPU consumer: al ser un adaptador LoRA sobre un modelo de 2B, puede ejecutarse en una unica GPU modesta, lo que permite experimentar con QA en turco sin infraestructura dedicada.
- Generacion de pares pregunta-respuesta para anotacion asistida: el modelo puede producir respuestas candidatas extraidas de contexto que luego un humano valide, reduciendo el coste de anotacion.
- Benchmark interno de QA en turco: sirve como referencia para comparar sistemas extractivos frente a modelos generativos mas grandes en tareas de respuesta corta con contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card (Exact Match y F1 con normalizacion turca, decodificacion greedy, una sola ejecucion):

| Dataset | Modelo | EM | F1 | Respuesta literal del contexto (%) | Palabras medias |
|---|---|---|---|---|---|
| tr-wiki-qa test (n=3.831) | Qwen3.5-2B zero-shot | 64,68 | 81,77 | 83,48 | 3,00 |
| tr-wiki-qa test (n=3.831) | Qwen3.5-2B + LoRA (este adaptador) | 91,83 | 95,68 | 99,56 | 2,28 |
| tr-wiki-qa test (n=3.831) | BERTurk ajustado con todo el dataset | 91,73 | 95,09 | no disponible | no disponible |
| XQuAD-tr (n=1.190) | Qwen3.5-2B zero-shot | 28,07 | 53,32 | 57,39 | 5,53 |
| XQuAD-tr (n=1.190) | Qwen3.5-2B + LoRA (este adaptador) | 48,49 | 67,97 | 96,72 | 3,68 |
| XQuAD-tr (n=1.190) | BERTurk ajustado con todo el dataset | 43,11 | 62,31 | no disponible | no disponible |

El autor senala que el error estandar del EM en XQuAD-tr con n=1.190 es de aproximadamente ±1,4 puntos, que la comparacion con BERTurk no aisla el efecto del tamano del modelo frente al de los datos, y que el test de tr-wiki-qa puede ser optimista por proceder del mismo proceso de generacion automatica que el entrenamiento.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el modelo base Qwen3.5-2B debe descargarse aparte.
- Inferencia en fp16 del modelo base de 2B: se estima en torno a 4-5 GB de VRAM, aunque la model card no publica una cifra oficial.
- GPU recomendadas: el autor entreno en una Tesla T4; para inferencia cabe en GPU consumer como RTX 3060, RTX 4060, RTX 4090 o similares con al menos 6 GB de VRAM.
- Despliegue: el ejemplo oficial usa `transformers` 5.22 y `peft`; se recomienda instalar `flash-linear-attention` para acelerar las capas de atencion lineal, ya que sin ella transformers usa una ruta alternativa mas lenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | EM XQuAD-tr | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B + este LoRA | ~1,88 mil millones (parte de texto) | Adaptador generativo | No disponible | 48,49 | CC-BY-SA 4.0 | HuggingFace |
| BERTurk ajustado con todo el dataset | ~0,11 mil millones | Encoder extractivo | No disponible | 43,11 | No disponible en la informacion | Referencia en la model card |
| savasy/bert-base-turkish-squad (TQuAD) | ~0,11 mil millones | Encoder extractivo | No disponible | 45,38 | No disponible en la informacion | HuggingFace |

## Limitaciones y advertencias

- Los datos de entrenamiento son generados por maquina y no han sido validados por humanos, lo que puede introducir errores sistematicos en las respuestas.
- El autor reconoce que gran parte de la mejora en Exact Match procede de aprender a responder de forma corta y literal, no necesariamente de una mejora en la comprension del contenido.
- Una unica ejecucion con una unica semilla; no se publican intervalos de confianza ni pruebas estadisticas.
- El test de tr-wiki-qa procede del mismo proceso de generacion que el entrenamiento, por lo que los resultados pueden ser optimistas.
- Solo se declara soporte de turco; el rendimiento en otros idiomas no esta documentado.
- Licencia CC-BY-SA 4.0: el uso comercial requiere cumplir las condiciones de atribucion y compartir igual, lo que puede ser restrictivo para productos propietarios.
- El adaptador esta pensado para QA extractivo con contexto; no se documentan capacidades de agente, tool calling ni razonamiento multi-paso.
- La model card esta truncada en el apartado de limitaciones, por lo que puede haber advertencias adicionales del autor no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aykanugur157/qwen3.5-2b-tr-wiki-qa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/Aykanugur157/tr-wiki-qa
