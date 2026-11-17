# ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF

## Resumen

hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF es un modelo de lenguaje especializado en extracción de información financiera, desarrollado por ryuma007 para Hishab, una aplicación bangladesí de finanzas personales. Su función es convertir mensajes de chat escritos en inglés, bangla, banglish (bangla transcrito en caracteres latinos) o una mezcla de los tres, en transacciones estructuradas con el formato `description|amount|category`, donde el signo del importe indica si es gasto o ingreso. Resuelve un problema muy concreto: la entrada de gastos en lenguaje natural coloquial y multilingüe, sin exigir al usuario formularios ni sintaxis rígida.

El modelo parte de Qwen/Qwen3.5-0.8B y se ha sometido a un proceso de poda y ajuste fino completo. Se han eliminado las capas 8, 9, 12 y 13 (de 24 a 20 capas), lo que reduce el total a unos 451 millones de parámetros, y se ha recortado el vocabulario de 248 000 a 38 000 tokens, lo que baja el modelo de 0,75B a 0,54B parámetros efectivos y acelera la generación cerca de un 45 % en un Pixel 8. Tras la poda se aplicó un "healing" de 2 épocas con todas las ponderaciones entrenables, alcanzando un 97,9 % de coincidencia top-1 con el modelo sin podar.

La relevancia actual del modelo es su enfoque en despliegue on-device: los archivos GGUF van de 267 MB (Q4_0) a 904 MB (F16), lo que permite ejecutarlo en móviles Android mediante llama.cpp y kiln. Está pensado para un dominio estrecho y con datos sintéticos, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B), podado a 20 capas |
| Parametros totales | 450.803.904 (aproximadamente 451M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (imat), Q4_K_M (imat), Q6_K, F16 |
| Idiomas soportados | bn, en (incluye banglish, bangla en caracteres latinos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3.5-0.8B. Sobre esa base se aplicaron dos transformaciones: poda de capas (eliminación de las capas 8, 9, 12 y 13, pasando de 24 a 20) y recorte de vocabulario de 248 000 a 38 000 tokens, conservando inglés, bangla, banglish, todos los tokens de un solo carácter (para que cualquier texto siga siendo codificable) y todos los tokens especiales. La tabla de embeddings y de salida, atada, se recorta en consecuencia. El resultado son aproximadamente 451M parámetros.

El ajuste fino original fue un full fine-tune de todos los pesos sobre Qwen/Qwen3.5-0.8B durante 3 épocas con TRL, learning rate 3e-05 con decaimiento coseno, pérdida solo en la completion, 19 798 filas de entrenamiento y selección de la mejor época por pérdida de validación. Tras la poda se aplicó un "healing" de 2 épocas sobre `train_v13` con todas las ponderaciones entrenables, usando una pérdida combinada: KL divergence respecto al modelo sin podar en los tokens de respuesta más 0,2 veces la entropía cruzada sobre el gold, con learning rate 2e-05. Los datos de entrenamiento son exclusivamente sintéticos, del dataset `ryuma007/hishab-synthetic-v7`. Las matrices de importancia de los archivos `-imat` se calcularon sobre conversaciones de entrenamiento renderizadas.

## Capacidades

- Extracción de transacciones financieras en formato estricto `description|amount|category`, una línea por transacción.
- Manejo de cuatro registros lingüísticos: inglés, bangla, banglish y mezclas de los tres en un mismo mensaje.
- Expansión de abreviaturas numéricas: `5k`, `1.5k`, `2 lakh`, `der hajar`, `পনেরো হাজার`.
- Clasificación en 13 categorías: food, grocery, rent, utilities, mobile_recharge, transport, tuition, salary, gift, loan, shopping, medical, entertainment, other.
- Distinción ingreso/gasto mediante el signo del importe (`+` ingreso, `-` gasto).
- Respuesta `NONE` cuando no hay transacción en el mensaje.
- Salida compacta: aproximadamente la mitad de tokens que el equivalente en JSON.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking (de hecho, debe ejecutarse con thinking desactivado).

## Casos de uso

- Registro de gastos por chat en una app de finanzas personales: el usuario escribe "Ajke tution fee 5k disi, riksha 80, cha 20" y el modelo devuelve tres líneas `description|amount|category` listas para insertar en la base de datos. Es el caso de uso principal y para el que fue entrenado.
- Procesamiento de mensajes mixtos bangla/inglés/banglish: al conservar vocabulario de los tres registros tras el recorte, puede extraer transacciones de mensajes como "Salary paisi 35k but basha vara dilam 12k" sin normalización previa.
- Extracción de importes escritos en palabras: el split *numbers* del dataset evalúa expresiones como "der hajar" o "পনেরো হাজার", y el modelo alcanza 89,0–90,2 de exactitud en `numbers_clean` según cuantización.
- Despliegue on-device en Android: con archivos de 267–288 MB en Q4, se integra mediante llama.cpp y kiln para funcionar offline en un Pixel 8, sin enviar datos financieros a un servidor.
- Preprocesado por lotes de historiales de chat: dado su tamaño reducido y su salida compacta, puede procesar grandes volúmenes de mensajes para poblar un libro de transacciones con bajo coste computacional.
- Clasificación automática de categoría de gasto: la etiqueta `category` permite alimentar informes de presupuesto por categoría sin intervención manual.
- Filtrado de mensajes sin transacción: la respuesta `NONE` permite descartar mensajes irrelevantes en un pipeline de ingesta.

## Benchmarks y rendimiento

Evaluado con llama.cpp en modo greedy sobre splits held-out de `ryuma007/hishab-synthetic-v7`. *test_clean* (476 filas) y *numbers_clean* (317 filas) son las filas donde dos etiquetadores independientes (Gemini 3.8 Flash y Claude Sonnet 5.5) coinciden; son las cifras principales. *exact* indica que el conjunto de tuplas (amount, category, type) coincide con el gold; F1 es micro F1 sobre esas tuplas.

| Archivo | Tamano | test_clean exact | test_clean F1 | numbers_clean exact |
|---|---|---|---|---|
| Q4_0-imat.gguf | 267 MB | 95,0 | 97,7 | 89,0 |
| Q4_K_M-imat.gguf | 288 MB | 94,5 | 97,3 | 90,2 |
| Q6_K.gguf | 372 MB | 94,3 | 97,2 | 90,2 |
| F16.gguf | 904 MB | 95,0 | 97,6 | 90,2 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en Q4_0, 0,3 GB en Q4_K_M, 0,4 GB en Q6_K y 0,9 GB en F16, más el overhead de contexto de llama.cpp.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso en CPU y en dispositivos móviles.
- Despliegue validado en Android mediante llama.cpp y kiln; en un Pixel 8 la generación es aproximadamente un 45 % más rápida que el modelo base sin recorte de vocabulario.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), kiln en Android. No se documenta soporte específico para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput absolutos: no disponibles; solo se documenta la mejora relativa del 45 % en Pixel 8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| hishab-qwen3.5-0.8b (este) | ~451M (podado) | no disponible | bn, en | apache-2.0 | Extraccion de transacciones financieras |
| Qwen/Qwen3.5-0.8B (base) | ~0,75B | no disponible | multilingue | no disponible en la informacion | Proposito general |
| Modelo sin podar `qwen3.5-0.8b__pipe_signed__full__v13__trim38k` | ~0,54B (tras recorte de vocabulario) | no disponible | bn, en | apache-2.0 | Extraccion financiera, 97,9 % de coincidencia top-1 con el podado |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el propio autor advierte que se espere menor precisión en mensajes reales hasta que exista un conjunto de test etiquetado por humanos.
- Dominio muy estrecho: no es un modelo de propósito general; fuera de la extracción de transacciones su comportamiento no está garantizado.
- El prompt de sistema usado en entrenamiento debe mantenerse literal; cambiarlo puede degradar la calidad de la salida.
- Debe ejecutarse con thinking desactivado (el valor por defecto con `--jinja` en Qwen3.5).
- El recorte de vocabulario hace que textos en otros alfabetos distintos del latino y el bangla se dividan en más piezas, más raras, lo que puede afectar a la calidad.
- Las etiquetas del split *test* original incumplen la guía de etiquetado en aproximadamente el 14 % de las filas, por lo que las métricas sobre *test* no son directamente comparables con las de *test_clean*.
- Licencia apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la información disponible.
- Riesgo de alucinación y de categorización incorrecta en mensajes ambiguos o con jerga no vista en entrenamiento; no se documentan sesgos específicos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/ryuma007/hishab-synthetic-v7
- Repositorio de codigo y pipeline: https://github.com/RaihanulHaque/hishab
- Runtime Android (kiln): https://github.com/RaihanulHaque/kiln
