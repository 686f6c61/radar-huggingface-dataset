# OmniJev/OneJev1.5-0.8B

## Resumen

OneJev1.5-0.8B es un modelo multimodal de decisión ("System One") desarrollado por OmniJev. A diferencia de un LLM conversacional al uso, no genera texto libre: recibe un estado (captura de pantalla, fotografía, vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Se trata de un fine-tune completo de Qwen/Qwen3.5-0.8B sobre aproximadamente 320.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión.

El modelo tiene 1.107.265.600 parámetros reales según los pesos en safetensors (etiquetado comercialmente como 0.8B) y un repositorio de 2,2 GB. Su relevancia actual reside en que ocupa un nicho poco cubierto: la capa de decisión de agentes y automatizaciones GUI, donde se necesita una señal probabilística rápida y calibrada ("¿está hecha la tarea?", "¿qué acción toca ahora?") en lugar de una generación de texto larga y costosa.

Según el autor, en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones) obtiene 42,71, la mejor puntuación de cualquier modelo de hasta 1,5B parámetros del tablero, y supera a 47 modelos mayores de entre 4B y 28B. Estos datos proceden de la model card y no se han verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 1.107.265.600 (1,1B reales; etiquetado como 0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se somete a un fine-tune completo (no LoRA) sobre unos 320.000 ejemplos de pregunta-respuesta. La composición del dataset combina ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos públicos de decisión. La arquitectura subyacente es la del modelo base Qwen3.5, un transformer multimodal con pipeline image-text-to-text; no se detallan en la información disponible innovaciones como atención lineal, decodificación especulativa o mecanismos híbridos.

La innovación principal es la formulación de la tarea: en lugar de generar texto, el modelo produce una distribución de probabilidad calibrada sobre opciones tipadas (por ejemplo, `Noul` para preguntas booleanas o `Choice` para selección entre acciones), lo que permite integrarlo como capa de decisión determinista dentro de un bucle de agente. No se especifica si hubo RLHF, DPO ni la composición exacta del corpus de entrenamiento.

## Capacidades

- Decisión multimodal: acepta capturas de pantalla, fotografías, vídeo y texto plano como entrada de estado.
- Salida de probabilidades calibradas por opción en un solo forward pass, en lugar de generación autoregresiva de texto.
- Preguntas tipadas: soporta preguntas booleanas (`Noul`) y de elección múltiple (`Choice`) mediante la API System One de TypeSafe, ampliada con un campo `media`.
- Orientación a agentes GUI: preguntas del tipo "¿qué acción debe ejecutar el agente ahora?" con opciones como clic o parada.
- Evaluación de progreso de tareas: verificación de condiciones de finalización ("la factura está pagada").
- Procesamiento de vídeo como parte del estado de entrada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de agentes GUI: dado un screenshot del escritorio o de una aplicación web, el modelo decide la siguiente acción (clic, escribir, detener) con una probabilidad asociada, lo que permite umbrales de confianza y reintentos controlados.
- Verificación de finalización de tareas en pipelines RPA: comprobar si una condición de negocio (factura pagada, formulario enviado) se cumple en la pantalla actual, usando `Noul` como pregunta booleana.
- Enrutamiento de decisiones en atención al cliente: clasificar entre respuestas o escalados con una distribución de probabilidad que permite derivar al humano cuando la confianza es baja.
- Evaluación de frames de vídeo en control de calidad: decidir si un fotograma o secuencia cumple un criterio visual, aprovechando la entrada de vídeo.
- Capa de decisión de bajo coste en producción: al ser un modelo de 1,1B parámetros y 2,2 GB, puede desplegarse junto a un LLM mayor que redacte la respuesta, reservando el modelo grande para la generación y este para la decisión.
- Filtrado y triaje de datos de agentes: puntuar ejecuciones reales para seleccionar trayectorias de alta calidad en la construcción de datasets.
- Investigación en calibración: servir como referencia pequeña y abierta para estudiar la calibración de probabilidades en modelos multimodales de decisión.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor; no se han verificado de forma independiente.

| Benchmark / conjunto | OneJev1.5-0.8B | Comparativa (según autor) |
|---|---|---|
| Decision Index 0.3 (parte pública) | 42,71 | Crivo-150M 36,4; EXAONE-4.0 1.2B 30,7; jiwo 0.8B v2 29,4; DecisionTune 1.0 28,9 |
| Frente a modelos mayores en Decision Index | 42,71 | Sieve 9B 41,9; Jev-Omni 41,0; djev 40,9; Winnow-E4B 40,9; Bespoke Nimble 9B v2 39,9; Solomon v1.1 38,1 |
| Conjunto de test OneJev (precisión) | No disponible en detalle | Comparado con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking (cifras no extraíbles del material) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de LLM.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,2-2,5 GB solo para pesos, más overhead de activaciones y del codificador visual; con cuantización a 8 bits podría reducirse a ~1,2 GB y a 4 bits a ~0,7 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería bastar en fp16; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño del repositorio (2,2 GB).
- Opciones de despliegue: el autor proporciona el paquete `qev` y el comando `qev serve --model OmniJev/OneJev1.5-0.8B`, que expone una API compatible con System One de TypeSafe más un campo `media`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-0.8B | 1,1B | No disponible | 42,71 | Apache 2.0 | Hugging Face + GitHub |
| Crivo-150M | 150M | No disponible | 36,4 | No disponible | No disponible |
| EXAONE-4.0 1.2B | 1,2B | No disponible | 30,7 | No disponible | No disponible |
| jiwo 0.8B v2 | 0,8B | No disponible | 29,4 | No disponible | No disponible |
| DecisionTune 1.0 | No disponible | No disponible | 28,9 | No disponible | No disponible |

Las puntuaciones de los competidores son las publicadas en el tablero Decision Index a fecha de 12 de octubre de 2026, según la model card. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; su uso requiere la API System One de TypeSafe o el servidor `qev`, lo que limita su integración directa con frameworks estándar.
- Los resultados de benchmarks proceden únicamente del autor y no han sido verificados de forma independiente; deben tomarse con cautela.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento (capturas, vídeos y dominios de agentes no representados).
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-0.8B, puede heredar sesgos del modelo base.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en entradas en castellano u otros idiomas.
- Longitud de contexto no disponible: no se puede garantizar el manejo de estados muy largos (vídeos extensos o screenshots de alta resolución).
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3.5-0.8B.
- Ecosistema joven (328 descargas, 1 like en el momento de la consulta): menor madurez, documentación y comunidad que alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.5-0.8B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
