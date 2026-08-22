# Felipe0282829273/nilo-revisor-360m

## Resumen

Nilo es un modelo de lenguaje de 360 millones de parámetros desarrollado por Felipe0282829273, diseñado para una tarea única: corregir frases erróneas generadas por un NPC del juego de terror en navegador *The Normal Elevator*. El modelo recibe una frase incorrecta junto con el motivo de su error y devuelve la frase corregida, manteniendo la voz del personaje y el canon narrativo del juego. No es un asistente conversacional ni responde preguntas; su función está estrictamente acotada a la revisión de líneas de diálogo.

El modelo parte de HuggingFaceTB/SmolLM2-360M-Instruct y se entrena con LoRA (r=32) sobre un conjunto de 192 pares de entrenamiento (frase errónea + motivo → frase correcta). Se distribuye en formato GGUF cuantizado a q8_0, ocupando aproximadamente 386 MB, lo que permite cargarlo en unos 7 segundos en el navegador mediante wllama sin necesidad de GPU. Su relevancia radica en demostrar que un ajuste fino mínimo y barato puede resolver un problema de control de calidad de texto generado en un entorno con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2-360M-Instruct) |
| Parámetros totales | 361 921 120 (361 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF q8_0 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de pequeña escala entrenado por Hugging Face sobre 4 billones de tokens. Sobre esta base se aplica un fine-tuning con LoRA de rango 32, que ajusta únicamente una fracción de los pesos para especializar el modelo en la tarea de corrección de frases. El entrenamiento se realizó sobre 192 ejemplos, cada uno compuesto por una frase incorrecta, el motivo del error y la frase corregida correspondiente. No se menciona el uso de RLHF o DPO; el ajuste es supervisado únicamente. La generación se realiza con temperatura 0 (greedy), ya que la corrección debe ser determinista y no aleatoria.

## Capacidades

- Corrección de frases en inglés: recibe una frase errónea y un motivo, y devuelve una versión corregida que respeta el estilo del personaje.
- Mantenimiento de canon narrativo: el modelo ha aprendido las reglas del universo de *The Normal Elevator* y evita contradecir la historia establecida.
- Integración en navegador: gracias a su formato GGUF y su tamaño reducido, puede ejecutarse completamente en el dispositivo del usuario mediante wllama o llama.cpp.
- Generación de texto determinista: al operar con temperatura 0, la salida es consistente y reproducible para cada entrada.
- No soporta tool calling, agentes, visión ni otros modos de interacción más allá de la tarea de corrección.

## Casos de uso

- Corrección de diálogos generados por IA en videojuegos: el modelo puede recibir líneas de un sistema de generación de texto y corregirlas para que cumplan con el canon de la historia y el estilo de cada personaje.
- Post-procesamiento en pipelines de generación narrativa: integrado en un flujo de generación de texto, actúa como un filtro de calidad que reemplaza frases incorrectas antes de mostrarlas al usuario.
- Validación de contenido en entornos de recursos limitados: su tamaño de 386 MB permite ejecutarlo en dispositivos sin GPU, como portátiles básicos o incluso en el navegador, sin depender de servicios externos.
- Ajuste de estilo en asistentes de escritura creativa: puede usarse para reescribir fragmentos que se desvían de un canon predefinido en proyectos de ficción interactiva.
- Demostración de fine-tuning eficiente: sirve como caso de estudio para equipos que quieren adaptar un modelo pequeño a una tarea muy específica con pocos datos y bajo coste computacional.
- Control de calidad en generación de texto para juegos de texto: en proyectos de ficción interactiva, el modelo puede corregir errores de coherencia en tiempo real.

## Benchmarks y rendimiento

El autor proporciona una prueba propia realizada con 24 defectos × 2 rondas, comparando el modelo afinado con el modelo base sin entrenamiento, usando el mismo enunciado y archivo:

| Métrica | SmolLM2-360M sin entrenar | Nilo |
|---|---|---|
| Conserta (corrige correctamente) | 8/48 | **44/48** |
| Ecoa (repite la frase) | 18 | 2 |
| Copia (transcribe sin cambio) | 10 | 0 |
| Rompe el canon | **28** | **0** |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en CPU (usando wllama con GGUF q8_0), aunque puede ejecutarse también en GPU con menos de 1 GB de VRAM si se desea acelerar.
- GPU recomendada: no es necesaria; funciona correctamente en CPU. En caso de usar GPU, cualquier modelo con 1 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, puede ejecutarse en tarjetas como GTX 1050 Ti, RTX 3060 o incluso en iGPU integradas.
- Opciones de despliegue: llama.cpp, wllama (en navegador), Ollama, o cualquier backend compatible con GGUF.
- Latencia: el autor indica que carga en ~7 segundos en wllama; la inferencia de una frase corta en CPU típicamente en el orden de decenas de milisegundos a pocos segundos según el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso principal |
|---|---|---|---|---|---|
| Nilo (este modelo) | 361 M | No disponible | GGUF q8_0 | Apache 2.0 | Corrección de frases con canon |
| SmolLM2-360M-Instruct (base) | 360 M | 4096 tokens | safetensors | Apache 2.0 | Asistente general |
| SmolLM2-135M-Instruct | 135 M | 4096 tokens | safetensors | Apache 2.0 | Asistente ligero |

No se dispone de comparación con otros modelos especializados en corrección de texto en el contexto del juego, ya que no se han publicado datos al respecto. El modelo base SmolLM2-360M-Instruct es el punto de referencia más cercano; la tabla de rendimiento de la sección anterior muestra la mejora obtenida tras el fine-tuning.

## Limitaciones y advertencias

- Entrenamiento limitado: con solo 192 pares, el modelo aprende el canon y la forma, pero no la coherencia profunda. En una lectura humana de las 24 salidas, alrededor de 8 aún son frases plausibles pero incorrectas (por ejemplo, "a few steps from a door that does not exist" cuando la puerta existe pero no se abre).
- No es un asistente general: no responde preguntas, no mantiene conversaciones y no tiene capacidad de razonamiento complejo fuera de su tarea.
- Riesgo de alucinación: puede generar frases que parecen correctas pero que contradicen el canon del juego si el motivo de corrección es ambiguo o el contexto no es suficientemente claro.
- Solo en inglés: no soporta otros idiomas, y su vocabulario está restringido al contexto del juego.
- Licencia: Apache 2.0, pero el autor indica que es un "proof of concept" y no un modelo final; se recomienda validar las salidas antes de usarlo en producción.
- Dependencia del modelo base: su comportamiento está limitado por las capacidades de SmolLM2-360M-Instruct, que a su vez tiene limitaciones de razonamiento y conocimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Felipe0282829273/nilo-revisor-360m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de cuantización GGUF (referencia): https://huggingface.co/QuantFactory/SmolLM2-360M-GGUF

Nota: no se han encontrado artículos académicos, blogs o demos adicionales específicos de este modelo.
