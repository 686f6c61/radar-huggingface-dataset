# balticml/mmbert-small-support-triage

## Resumen

mmbert-small-support-triage es un modelo de clasificación de texto (text-classification) desarrollado por balticml, un autor independiente, a partir del modelo base jhu-clsp/mmBERT-small. Su función es enrutar mensajes de clientes de una tienda online a una de 27 categorías de solicitud distribuidas en 11 departamentos, o a la clase `out_of_scope` cuando el mensaje no es una petición de soporte. Está pensado para triaje automático de bandejas de entrada de atención al cliente en diez idiomas: inglés, polaco, alemán, francés, español, italiano, neerlandés, portugués, checo y sueco.

El modelo afina las 16 primeras capas de las 22 de mmBERT-small, con 49 millones de parámetros, y se distribuye en formato ONNX con cuantización int8 solo de pesos (52 MB de pesos más 3 MB de tokenizador, 55 MB en total) para ejecutarse con transformers.js, lo que permite inferencia en navegador y en dispositivos de baja memoria. La latencia medida es de 5,7 ms en CPU con ONNX Runtime y 4 hilos, y de unos 240 MB de memoria de página en Chrome con WASM a un solo hilo.

Su relevancia actual reside en que ofrece una alternativa local y de coste prácticamente nulo frente al uso de LLM alojados para una tarea acotada de clasificación: el autor estima unos 35 dólares por millón de mensajes con un LLM alojado a precio de lista, y reporta una precisión del 99,4 % en el test split multilingüe frente al 73,0 % de Qwen 2.5 7B instruct en modo zero-shot. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small), fine-tuning de las 16 primeras capas de 22 |
| Parámetros totales | 49 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 weight-only (ONNX); pesos originales del modelo base en el repositorio |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de mmBERT-small, del que se afinan las 16 primeras capas de las 22 totales. La salida es una clasificación sobre 27 tipos de solicitud más la clase `out_of_scope`, es decir, 28 etiquetas, con una única etiqueta por mensaje. El modelo se entrenó sobre texto normalizado: minúsculas, sin puntuación salvo apóstrofos y con espacios simples, por lo que es imprescindible aplicar esa normalización antes de la inferencia.

Los datos de entrenamiento proceden del dataset Bitext customer support (inglés, CDLA-Sharing-1.0), traducido automáticamente con MADLAD-400 3B a los otros nueve idiomas. Como ejemplos `out_of_scope` se usaron frases de FLORES-200 y Tatoeba, y se añadieron 1.465 mensajes escritos a mano. El 70 % de las filas de entrenamiento se envolvieron en un mensaje con saludo, número de pedido o nombre y despedida; al 40 % de las peticiones se les adjuntó una frase no relacionada y al 30 % se les introdujo una errata o una palabra intercambiada. Se entrenó 4 épocas con lr 5e-5, batch 64, label smoothing 0,1, dropout 0,1 y peso de pérdida para `out_of_scope` de 0,3, con semilla 42. La receta está en `configs/mmbert-small.yaml` del repositorio.

Una innovación destacable es la poda del vocabulario del tokenizador desde la versión v1.3.0: se conservan solo los 46.681 tokens vistos en entrenamiento, los tokens intermedios de BPE, los de byte-fallback y los especiales, así como las fusiones entre ellos (51.032 de 256.000 tokens y 128.416 de 580.604 fusiones), reduciendo el tokenizador de 34 MB a 3 MB sin cambiar los identificadores. Las palabras no vistas se dividen en piezas conocidas en lugar de convertirse en `[UNK]`.

## Capacidades

- Clasificación de mensajes de soporte en 27 tipos de solicitud y 11 departamentos de una tienda online.
- Detección de mensajes fuera de alcance (`out_of_scope`) con alta recall (98,9 % en el test split, con una tasa de falso rechazo de 0,10).
- Multilingüe en diez idiomas: inglés, polaco, alemán, francés, español, italiano, neerlandés, portugués, checo y sueco.
- Robustez ante ruido textual: saludos, despedidas, números de pedido, nombres, frases no relacionadas, erratas y palabras intercambiadas.
- Inferencia local en navegador y dispositivos de baja memoria mediante transformers.js y ONNX int8.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de una sola etiqueta por mensaje.
- No dispone de modo thinking ni de generación de texto.

## Casos de uso

- Triaje de bandeja de entrada de atención al cliente: el modelo clasifica cada mensaje entrante en uno de los 27 tipos de solicitud y lo enruta al departamento correspondiente, con una latencia de 5,7 ms por mensaje en CPU que permite procesar colas de miles de mensajes por minuto en un solo servidor.
- Filtrado de mensajes no relacionados: la clase `out_of_scope` con recall del 98,9 % permite descartar spam, mensajes personales o consultas ajenas al soporte antes de que lleguen a un agente humano.
- Enrutamiento en el navegador: al ejecutarse con transformers.js y ocupar unos 240 MB de página en Chrome, puede integrarse en un formulario web de contacto para sugerir el departamento adecuado en el momento de la escritura, sin enviar el texto a un servidor.
- Pretratamiento para LLM: usar el clasificador como primer paso barato y derivar solo los casos ambiguos o complejos a un LLM alojado, reduciendo el coste por millón de mensajes frente al enfoque zero-shot (estimación del autor: unos 35 dólares por millón con LLM alojado).
- Soporte multilingüe en comercio electrónico europeo: cubre diez idiomas, lo que permite una única tubería de triaje para mercados de Europa central, del norte y del sur sin modelos separados por idioma.
- Aplicaciones móviles y de bajo consumo: la versión extra-light y el formato int8 de 55 MB permiten desplegar el clasificador en teléfonos y dispositivos con memoria limitada, con inferencia local sin conexión.
- Análisis y etiquetado de históricos de tickets: clasificar retroactivamente grandes volúmenes de mensajes ya almacenados para construir métricas por departamento o entrenar otros modelos.

## Benchmarks y rendimiento

| Modelo | Test split (media de 10 locales) | 160 mensajes escritos a mano | Recall not-a-request (falso rechazo) | Latencia CPU |
|---|---|---|---|---|
| Este modelo, 16 capas, 49M params, int8 52 MB | 99,4 | 96,2 | 98,9 (0,10) | 5,7 ms (ORT, 4 hilos) |
| mmBERT-base, misma receta sin los mensajes escritos a mano | 99,4 | 75,6 | 99,6 (0,14) | 31,7 ms (PyTorch fp32) |
| Qwen 2.5 7B instruct (int4, Ollama), zero-shot con la lista de etiquetas | 73,0 | 86,9 | — | 91 ms (GPU, 25 por petición) |

Precisión en porcentaje. El test split está compuesto por 2.569 solicitudes Bitext en inglés más 1.080 solicitudes traducidas automáticamente por cada uno de los otros locales. Los 160 mensajes escritos a mano fueron redactados por el autor de los mensajes de entrenamiento con escenarios disjuntos, por lo que el 96,2 se considera una cota superior para una bandeja de entrada real. La cuantización int8 coincide con PyTorch fp32 en 400 de 400 mensajes de paridad. Con el tokenizador podado (v1.3.0), medido sobre 500 solicitudes de test y 500 frases no-solicitud por locale: test 99,26 (frente a 99,28 con tokenizador completo), mensajes a mano 96,9 (96,9) y recall not-a-request 98,6 (98,4).

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo int8 ocupa 52 MB de pesos y puede ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Para lotes grandes, una GPU básica puede aumentar el throughput, pero no es necesaria.
- Cabe en cualquier GPU de consumo, en Raspberry Pi y en navegador; en Chrome con WASM a un solo hilo la página ocupa unos 240 MB y no crece con el uso (hasta v1.2.0, con el tokenizador completo, unos 310 MB).
- Opciones de despliegue: transformers.js (navegador y Node.js) con ONNX Runtime; el repositorio incluye el modelo en ONNX. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 5,7 ms por mensaje en CPU con ONNX Runtime y 4 hilos; 91 ms por petición en GPU para Qwen 2.5 7B como referencia comparativa. El autor no publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test multilingüe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmbert-small-support-triage | 49M | no disponible | 99,4 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| mmBERT-base (misma receta) | no disponible | no disponible | 99,4 (75,6 en mensajes a mano) | Apache-2.0 | Hugging Face |
| Qwen 2.5 7B instruct (int4, zero-shot) | 7B | no disponible | 73,0 | Apache-2.0 | Ollama, Hugging Face |

La comparación con mmBERT-base muestra que el modelo pequeño iguala la precisión en el test split pero mejora notablemente en mensajes escritos a mano (96,2 frente a 75,6), atribuible a los 1.465 mensajes manuales de entrenamiento. Frente a Qwen 2.5 7B en zero-shot, la diferencia es de 26,4 puntos en el test split, con una latencia muy inferior y sin necesidad de GPU. No se dispone de datos de otros clasificadores especializados de triaje de soporte para ampliar la comparativa.

## Limitaciones y advertencias

- Nueve de los diez idiomas de test son traducciones automáticas; los 160 mensajes escritos a mano son la única medida sobre texto humano, y su autor es el mismo que redactó los mensajes de entrenamiento, por lo que el 96,2 es una cota superior.
- La taxonomía es de un único comercio electrónico: preguntas de producto, garantía o temas B2B no tienen clase asignada y caerán probablemente en `out_of_scope` o en una clase incorrecta.
- Solo admite una etiqueta por mensaje; no modela mensajes con múltiples intenciones.
- El vocabulario está podado: las palabras no vistas en entrenamiento se leen como piezas conocidas más pequeñas, lo que puede degradar la clasificación de jerga o dominios nuevos.
- Requiere normalización previa obligatoria (minúsculas, sin puntuación salvo apóstrofos, espacios simples); sin ella el rendimiento puede caer.
- Riesgo de alucinación no aplica al ser un clasificador, pero sí de falsos positivos y negativos en las fronteras entre clases; la tasa de falso rechazo de `out_of_scope` es de 0,10 en el test split.
- Licencia Apache-2.0 para el modelo, pero los datos de entrenamiento Bitext están bajo CDLA-Sharing-1.0, que impone condiciones de compartición; conviene revisarlas antes de un uso comercial que implique redistribución de datos derivados.
- No se documentan sesgos demográficos ni lingüísticos; el entrenamiento con traducción automática puede introducir sesgos de los sistemas de traducción en los nueve idiomas no ingleses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balticml/mmbert-small-support-triage
- Versión extra-light: https://huggingface.co/balticml/mmbert-small-support-triage-extra-light
- Repositorio con código, pipeline de datos y benchmark: https://github.com/balticml/support-triage
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Librería de inferencia: https://github.com/huggingface/transformers.js
