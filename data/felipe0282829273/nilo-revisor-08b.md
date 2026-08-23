# Felipe0282829273/nilo-revisor-08b

## Resumen

`nilo-revisor-08b` es un modelo de lenguaje especializado en la reescritura de frases en inglés, desarrollado por Felipe0282829273 como parte del pipeline de generación de diálogos del juego **The Normal Elevator**. Su función es concreta y acotada: recibe una frase marcada como "mala" por un juez de tono y la reescribe en la voz de un personaje seco y contenido, antes de que el traductor Bergamot la convierta al portugués de Brasil. No es un asistente generalista ni un modelo conversacional; es una pieza de un sistema mayor que se ejecuta íntegramente en el navegador del jugador, sin servidor.

El modelo se basa en `Qwen/Qwen3.5-0.8B` (873M parámetros) y se ha destilado desde `Qwen/Qwen3.8-27B` en dos etapas: una fase off-policy con 423 pares de ejemplo verificados automáticamente, y una fase on-policy con optimización por divergencia KL sobre el vocabulario completo a temperatura 2. El entrenamiento es completo (no LoRA), incluyendo la cabeza de salida. Su relevancia radica en que demuestra cómo destilar un comportamiento muy específico (voz, formato y razonamiento en un dominio estrecho) en un modelo pequeño capaz de ejecutarse en clientes ligeros, manteniendo una calidad verificada por un sistema de reglas de canon de verdad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.5-0.8B) |
| Parametros totales | 873M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es una destilación del profesor `Qwen/Qwen3.8-27B` sobre la arquitectura base `Qwen/Qwen3.5-0.8B`, un transformer denso de 873M parámetros. El entrenamiento se realizó en dos fases. La primera, off-policy, utilizó 423 pares (frase errónea → corrección) generados por el profesor, cada uno verificado por una regla automática que exige que la frase errónea rompa una regla del canon de verdad y que la corrección no rompa ninguna; se usaron 344 aperturas distintas. La segunda, on-policy, hizo que el alumno generara con los pesos del paso actual, que el profesor puntuara, y que el gradiente proviniera de la divergencia KL sobre el vocabulario completo a temperatura 2. El entrenamiento fue completo (no LoRA), incluyendo la cabeza de salida.

Un aspecto técnico destacable es la verificación previa de los vocabularios de ambos modelos: 248.044 tokens base con ids y merges idénticos, lo que hace legítimo el cálculo del KL entre los logits del profesor y del alumno. Esta verificación es fundamental para que la destilación on-policy sea válida y no se produzcan discrepancias de tokenización.

## Capacidades

- Reescritura de frases en inglés en un tono específico (voz de un hombre seco, atrapado en una habitación gris).
- Entrada: una frase marcada como problemática por un juez de tono; salida: una versión corregida que cumple las reglas del canon de verdad del juego.
- Operación autónoma en el navegador, sin servidor, gracias a su tamaño reducido.
- Especialización en un dominio muy estrecho; fuera de ese dominio se comporta como un 0,8B común.
- No es un asistente, no da consejos, no tiene consciencia de ser un programa.

## Casos de uso

- Corrección de diálogos en juegos narrativos: el modelo reescribe frases que rompen el canon de un personaje, manteniendo la coherencia de voz y tono en la generación de diálogos.
- Filtrado de calidad en pipelines de generación de texto: actúa como un tercer paso entre un generador de borradores y un traductor, eliminando frases que no cumplen reglas de estilo o contenido.
- Reducción de latencia en aplicaciones cliente: al ser de solo 873M parámetros, puede ejecutarse en el navegador sin necesidad de infraestructura de servidor, lo que permite generar diálogos revisados en tiempo real.
- Personalización de voces de personajes: el modelo puede adaptarse a un personaje específico (tono seco, contenido) y reescribir cualquier frase para que encaje en esa voz.
- Verificación de reglas de negocio en generación de texto: el sistema de reglas de canon de verdad se puede reutilizar para validar que las salidas de otros modelos cumplen restricciones formales.
- Prototipado de pipelines de destilación: el enfoque de dos etapas (off-policy + on-policy con KL) es replicable para otros dominios y tamaños de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona una única métrica de validación: los 24 casos de la bancada del juego, juzgados por la misma regla automática que se usa para medir a todos los candidatos, y ninguno de estos casos aparece en el corpus de entrenamiento (el portón de colisión cortó 50 líneas). No se indican valores numéricos de precisión o tasa de acierto.

## Requisitos de hardware

- Inferencia en navegador: diseñado para ejecutarse en el dispositivo del jugador, lo que implica que es viable en CPU o GPU integrada de portátiles y ordenadores de sobremesa.
- VRAM estimada: al ser un modelo de 873M parámetros, en FP16 requiere aproximadamente 1,8 GB de VRAM; con cuantización de 8 bits (int8) baja a unos 0,9 GB, y con 4 bits a unos 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior); también funciona en CPU con memoria RAM suficiente.
- Opciones de despliegue: ejecución en navegador mediante WebGPU o WebAssembly, similar a otros modelos pequeños de Qwen; también puede desplegarse con llama.cpp, Ollama o vLLM si se quiere un servidor dedicado.
- Latencia: no se publican datos, pero al ser un modelo de 0,8B, la generación de una frase corta debería ser de cientos de milisegundos en CPU y de decenas de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (destilación especializada para reescritura de frases con un tono de personaje). Como referencia de tamaño y arquitectura, se puede comparar con el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| nilo-revisor-08b | 873M | no disponible | apache-2.0 | Reescritura de frases en inglés con tono específico |
| Qwen/Qwen3.5-0.8B | 873M | no disponible | apache-2.0 | Modelo base generalista |
| Qwen/Qwen3.8-27B | 27,78B | no disponible | apache-2.0 | Modelo profesor, generalista |

La comparación es limitada porque nilo-revisor-08b no compite con modelos generalistas sino que es una pieza de un sistema; su valor está en la destilación del comportamiento del profesor en un dominio acotado, no en el rendimiento global.

## Limitaciones y advertencias

- El modelo es extremadamente especializado: fuera del dominio de reescritura de frases del juego, se comporta como un modelo 0,8B común, con capacidades limitadas.
- No es un asistente ni un agente conversacional; no debe usarse para tareas generales de generación de texto.
- Riesgo de alucinación: como cualquier modelo de 873M, puede producir texto incoherente si se le pide algo fuera de su dominio de entrenamiento.
- Sesgo de tono: está entrenado para una voz concreta (un hombre seco y contenido); puede resultar inapropiado para otros contextos de estilo.
- Solo soporta inglés como idioma de entrada y salida; no hay soporte multilingüe.
- La licencia apache-2.0 permite uso comercial, pero el modelo está pensado para el pipeline de un juego concreto y su uso fuera de ese contexto no está validado.
- No hay información sobre la longitud de contexto máxima, lo que limita su uso en aplicaciones que requieren entradas largas.
- El entrenamiento se basó en un corpus de 423 pares, muy reducido; la generalización a variaciones de frases no cubiertas puede ser limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Felipe0282829273/nilo-revisor-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B (referencia del autor, no se ha verificado el enlace)

No se encontraron enlaces adicionales (papers, blogs, demos) en la búsqueda web. Los resultados de búsqueda de "Nilo" corresponden a una plataforma de generación de imágenes sin relación con este modelo.
