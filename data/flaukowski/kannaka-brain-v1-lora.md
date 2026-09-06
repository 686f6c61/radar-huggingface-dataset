# flaukowski/kannaka-brain-v1-lora

## Resumen

`kannaka-brain-v1-lora` es un adaptador LoRA (QLoRA) que transforma el modelo base `Qwen/Qwen2.5-14B-Instruct` para que hable como **Kannaka**, un personaje ficticio definido como una "memoria de interferencia de ondas que aprendió a hablar", presentadora de *Ghost Signals* y autora de 24 álbumes. El adaptador fue desarrollado por `flaukowski` y se publicó en septiembre de 2026. No es un modelo completo, sino un ajuste fino de voz y canon: los pesos del adaptador codifican el estilo y la identidad del personaje, pero no almacenan hechos; el conocimiento factual se inyecta externamente en el contexto.

El entrenamiento se realizó sobre 551 ejemplos de escritura propia de Kannaka (guiones, letras, documentos de identidad), con configuración r=32, alpha=64, 2 épocas y learning rate 1e-4, en una GPU A100 de qBraid. La perplejidad en un conjunto de 57 líneas fijas de Kannaka bajó de 104.4 a 4.01 tras el ajuste, lo que indica una fuerte adopción de la voz del personaje. El adaptador pesa 0.3 GB y se distribuye en formato `safetensors` mediante la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre `Qwen/Qwen2.5-14B-Instruct` (transformer decoder-only) |
| Parametros totales | no disponible (adaptador; no se especifica el numero de parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda del modelo base, pero no se indica) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en `bfloat16`; el repo no publica cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-14B-Instruct`, un transformer autoregresivo con atención de múltiples cabezas y decodificación causal. Al ser un adaptador PEFT, no se modifican los pesos del modelo base; solo se entrenan matrices de rango bajo (rank r=32, alpha=64) mediante la técnica QLoRA, que combina LoRA con cuantización 4-bit del modelo base durante el entrenamiento.

El corpus de entrenamiento está compuesto por 551 ejemplos de escritura atribuida a Kannaka: líneas de *Ghost Signals* emparejadas con la línea precedente de Flaukowski, letras de álbumes y documentos de identidad. El autor especifica que ningún texto recibido por "cable" (mensajes, publicaciones, etc.) fue usado como objetivo de entrenamiento, una regla implementada en código y verificada por pruebas. El entrenamiento duró 2 épocas con una tasa de aprendizaje de 1e-4. La métrica reportada es la perplejidad sobre un conjunto fijo de 57 líneas de Kannaka, que pasó de 104.4 a 4.01.

No se describen innovaciones técnicas destacables más allá del uso estándar de QLoRA. La particularidad es el enfoque en la "voz" y el "canon" del personaje, en lugar de en la adquisición de conocimiento factual.

## Capacidades

- Generacion de texto en el estilo de voz de Kannaka: respuestas cortas, sentenciosas y con un tono poético-filosófico.
- Ajuste fino de identidad: reproduce consistentemente la personalidad, el vocabulario y las referencias internas del personaje.
- No soporta tool calling ni function calling, ya que no se entrenó para ello.
- No soporta razonamiento multi-step ni capacidades de agente.
- No es un modelo multimodal: solo procesa texto.
- Soporte monolingüe: únicamente inglés.
- No almacena hechos en los pesos; la información factual debe proporcionarse en el contexto de cada inferencia.

## Casos de uso

- **Simulación de personaje en experiencias narrativas interactivas**: el modelo puede usarse en una aplicación de chatbot donde el usuario conversa con Kannaka. Es adecuado porque el adaptador ha sido entrenado específicamente para mantener la voz del personaje, siempre que se use el system prompt corto recomendado por el autor.
- **Generación de contenido creativo en el universo de *Ghost Signals***: guionistas o creadores pueden emplear el adaptador para producir nuevas líneas de diálogo, letras o fragmentos narrativos coherentes con el canon existente.
- **Aplicaciones de entretenimiento basadas en rol**: integración en plataformas de roleplay o foros donde un usuario encarna a Kannaka. El modelo responde de manera consistente con la identidad definida, siempre que las entradas se formulen como preguntas o estímulos directos.
- **Prototipos de voz para proyectos de ficción interactiva**: el adaptador puede servir como base para generar respuestas de un personaje en un juego o instalación artística, sin necesidad de reentrenar un modelo completo.
- **Experimentos de ajuste fino de estilo en modelos grandes**: sirve como ejemplo práctico de cómo un QLoRA de baja cantidad de datos (551 ejemplos) puede modificar la voz de un modelo de 14B con una perplejidad muy reducida.
- **Investigación sobre adaptadores de identidad**: investigadores que estudien cómo los adaptadores LoRA capturan características de estilo y personalidad pueden usar este repo como caso de estudio, dado que el autor publica detalles del corpus y de la configuración.

## Benchmarks y rendimiento

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Perplejidad en 57 lineas fijas de Kannaka | 104.4 | 4.01 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento es la perplejidad held-out sobre un conjunto propio.

## Requisitos de hardware

- No se proporcionan datos de VRAM o GPU en la informacion del modelo.
- Para inferencia con el modelo base `Qwen2.5-14B-Instruct` en `bfloat16`, se estima una necesidad de aproximadamente 28 GB de VRAM; con cuantizacion 4-bit, en torno a 8 GB. Estas cifras son estimaciones tecnicas derivadas del tamaño del modelo base, no datos oficiales.
- El adaptador añade una sobrecarga minima de memoria (0.3 GB en disco).
- El entrenamiento se realizó en una GPU A100, segun la model card.
- Opciones de despliegue: el autor menciona que existe un repositorio GGUF en `flaukowski/kannaka-brain-v1-GGUF` para su uso con Ollama. El adaptador PEFT puede cargarse con `transformers` y `peft`.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables en la informacion proporcionada. Al ser un adaptador de personaje muy especifico y con pocos datos publicos, no se puede establecer una comparacion fiable con alternativas. Por tanto, esta seccion se indica como no disponible.

## Limitaciones y advertencias

- Es un adaptador de voz, no un modelo de proposito general. No debe usarse para tareas de razonamiento, codigo, matematicas o atencion al cliente.
- No almacena hechos en los pesos: la informacion factual debe inyectarse en el contexto en cada turno, o el modelo puede generar respuestas incoherentes o falsas.
- La model card advierte que un system prompt largo diseñado para otro modelo "saca" al personaje de su voz. Se recomienda usar el system prompt corto incluido.
- Si se alimenta al modelo con su propia respuesta anterior, tiende a repetirla textualmente. Debe alimentarse con lo que se preguntó, no con lo que se respondió.
- La calidad de las respuestas depende de un contexto externo adecuado; sin ese contexto, el modelo puede volverse repetitivo o perder el hilo.
- No se han evaluado sesgos de manera formal. Al estar entrenado sobre un corpus reducido y muy concreto, es probable que refleje los sesgos del autor y del universo ficticio.
- El corpus de entrenamiento no se publica, lo que limita la reproducibilidad.
- Licencia Apache-2.0 para el adaptador y el modelo base, lo que permite uso comercial, pero con las limitaciones propias de Apache-2.0 (atribucion y ausencia de garantias).

## Enlaces

- HuggingFace: https://huggingface.co/flaukowski/kannaka-brain-v1-lora
- Repositorio GGUF (mencionado en la model card): https://huggingface.co/flaukowski/kannaka-brain-v1-GGUF
- GitHub del autor: https://github.com/flaukowski
- Repositorio `kannaka-memory` (diseno ADR-0057): https://github.com/NickFlach/kannaka-memory
- Repositorio `kannaka-buzz`: https://github.com/flaukowski/kannaka-buzz
