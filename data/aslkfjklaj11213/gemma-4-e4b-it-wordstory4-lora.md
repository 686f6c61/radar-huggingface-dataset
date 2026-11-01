# aslkfjklaj11213/gemma-4-E4B-it-wordstory4-lora

## Resumen

`gemma-4-E4B-it-wordstory4-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `aslkfjklaj11213` sobre el modelo base `google/gemma-4-E4B-it`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que deben combinarse con el modelo base para funcionar. El adaptador está entrenado para una tarea muy concreta: generar cuentos infantiles cortos en coreano a partir de listas de palabras en inglés con su significado en coreano, incluyendo título, argumento de una línea, el cuento con marcadores `{english|korean}` y una descripción de imagen en inglés por cada palabra.

El adaptador se entrenó durante 2 épocas con r=16 sobre 1200 cuentos infantiles cortos en coreano escritos específicamente para el proyecto, empleando palabras de diccionario común. El objetivo declarado es servir de motor de generación para el juego de palabras del repositorio `areweloststars/-` (commit 223a3dc). Se trata de la cuarta ronda de entrenamiento del proyecto y multiplica por cuatro el número de historias de ejemplo respecto a la ronda 3.

Por su naturaleza (adaptador LoRA sobre un modelo base de Google, licencia Apache 2.0, idioma coreano y propósito muy acotado), no es un modelo de propósito general: es un artefacto de investigación y desarrollo ligado a una aplicación concreta. No hay información pública sobre benchmarks, rendimiento o evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | entrenado en 4 bits desde `unsloth/gemma-4-E4B-it`; cuantizaciones del adaptador no especificadas |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), con checkpoint de entrenamiento en `checkpoint/` |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=16 aplicado sobre el modelo base `google/gemma-4-E4B-it`. El entrenamiento se realizó en precisión de 4 bits partiendo de la versión cuantizada `unsloth/gemma-4-E4B-it`, lo que reduce los requisitos de memoria durante el ajuste. Se ejecutaron 2 épocas sobre un corpus de 1200 cuentos infantiles cortos en coreano escritos ad hoc para el proyecto, con vocabulario de diccionario común.

La tarea de entrenamiento es de formato estricto: dado un conjunto de 6-8 palabras en inglés con sus significados en coreano, el modelo debe producir un título, un argumento de una línea, un cuento corto con un marcador `{english|korean}` por cada palabra (eligiendo él mismo el orden de las palabras) y una descripción de imagen en inglés para cada palabra. Esta cuarta ronda replica el formato de la ronda 3 pero cuadruplica el número de historias de ejemplo (300 en la ronda 3 frente a 1200 en esta). No se documentan técnicas de RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de cuentos infantiles cortos en coreano a partir de listas de palabras en inglés con su traducción.
- Generación de títulos y argumentos de una línea en el formato del juego de palabras del proyecto.
- Inserción controlada de marcadores `{english|korean}` dentro del texto, con libertad para elegir el orden de las palabras.
- Generación de descripciones de imagen en inglés, una por palabra.
- Capacidades del modelo base (`gemma-4-E4B-it`): no documentadas en la información proporcionada; el adaptador no las amplía ni las certifica.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Motor de generación del juego de palabras `areweloststars/-`: el adaptador produce directamente el título, el argumento, el cuento con marcadores y las descripciones de imagen que el juego consume, en el formato exacto del commit 223a3dc.
- Generación de material didáctico de coreano para principiantes: a partir de 6-8 palabras inglesas con su traducción, se obtiene un cuento breve que las usa en contexto, útil para vocabulario básico.
- Prototipado de aplicaciones de aprendizaje de idiomas: el formato `{english|korean}` permite renderizar el cuento con la palabra original y su significado de forma intercalada.
- Creación de contenido editorial infantil en coreano: cuentos cortos con vocabulario de diccionario común, adecuados para publicaciones ligeras o apps de lectura.
- Generación de descripciones de imagen para ilustración: la salida incluye una descripción en inglés por palabra, aprovechable como brief para ilustradores o generadores de imagen.
- Investigación sobre ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de LoRA r=16 entrenado en 4 bits sobre un modelo Gemma, con checkpoint y salidas de evaluación incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo incluye `eval/outputs.json` con 30 salidas de muestra para las comprobaciones internas del proyecto, sin métricas cuantitativas ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `google/gemma-4-E4B-it` y de la cuantización elegida, datos no especificados en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es un artefacto PEFT (librería `peft`) y requiere cargarse junto al modelo base; el autor no documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aslkfjklaj11213/gemma-4-E4B-it-wordstory4-lora` | LoRA sobre Gemma 4 E4B | no disponible | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| `google/gemma-4-E4B-it` | Modelo base instruct | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `unsloth/gemma-4-E4B-it` | Version cuantizada 4-bit del base | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento ni de otros adaptadores LoRA comparables en la información proporcionada.

## Limitaciones y advertencias

- Adaptador, no modelo completo: no funciona de forma autónoma; requiere cargar el modelo base `google/gemma-4-E4B-it` y aplicar los pesos LoRA.
- Dominio muy restringido: entrenado exclusivamente para cuentos infantiles cortos en coreano con el formato `{english|korean}`; fuera de esa tarea el comportamiento no está garantizado.
- Idioma limitado al coreano: no se documenta soporte multilingüe más allá del inglés en las descripciones de imagen.
- Corpus de entrenamiento pequeño y sintético (1200 historias escritas para el proyecto), lo que aumenta el riesgo de sobreajuste al formato y de repetición de patrones.
- Riesgo de alucinación en el contenido de los cuentos y en las traducciones inglés-coreano; no se han publicado evaluaciones de calidad lingüística.
- Sin benchmarks ni evaluación independiente: no hay evidencia cuantitativa de rendimiento.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Licencia Apache 2.0 declarada, que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de producción.
- El checkpoint de entrenamiento (`checkpoint/`) está incluido en el repo (2,7 GB), lo que aumenta el tamaño de descarga.

## Enlaces

- HuggingFace: https://huggingface.co/aslkfjklaj11213/gemma-4-E4B-it-wordstory4-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Versión cuantizada usada para entrenar: https://huggingface.co/unsloth/gemma-4-E4B-it
- Repositorio del proyecto: https://github.com/areweloststars/-
