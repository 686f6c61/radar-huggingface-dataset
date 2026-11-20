# gabrione/afriqueqwen3.5-4b-50langs-instruct-tools

## Resumen

AfriqueQwen3.5 4B 50Langs Instruct Tools es un ajuste fino mediante LoRA (rango 16, fusionado en los pesos) del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, publicado por el usuario gabrione. Su propósito es enseñar al modelo a invocar las herramientas de un agente de voz de una pequeña tienda de muebles en suajili (sw), shona (sn) y luganda (lg). Los checkpoints AfriqueQwen originales ven los esquemas de herramientas (su plantilla de chat es la de Qwen3.5) pero nunca las invocan; este adaptador añade esa capacidad.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) almacenados en formato safetensors, con un repositorio de 8,4 GB. La arquitectura subyacente es la de Qwen3.5, un transformer textual (etiqueta `qwen3_5_text`), y el ajuste se realizó sobre 84 casos sintéticos de diálogos multi-turno de tienda con cinco herramientas definidas.

Es relevante ahora porque aborda un nicho poco cubierto: el tool calling en lenguas africanas de bajos recursos dentro de un pipeline de voz extremo a extremo (mynah-s2s, perfil africano). Su licencia CC-BY-4.0 y su tamaño contenido lo hacen desplegable en hardware modesto, aunque su alcance está deliberadamente acotado a un dominio y tres idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, etiqueta `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | suajili (sw), shona (sn), luganda (lg) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de AfriqueQwen3.5-4B-50Langs-Instruct-v1, un transformer de la familia Qwen3.5 adaptado a 50 lenguas africanas por McGill-NLP. Sobre esa base se aplicó un LoRA de rango 16 en precisión bf16, entrenado durante 600 pasos con una tasa de aprendizaje de 1e-4 y fusionado posteriormente en los pesos, de modo que el checkpoint distribuido no requiere cargar adaptadores por separado. Se empleó la plantilla de chat de Qwen3.5 con el modo de razonamiento (thinking) desactivado.

Los datos de entrenamiento consisten en 84 casos sintéticos generados a partir de diálogos multi-turno de tienda (consulta de precio, entrega, despedida; saludo inicial; búsqueda de pedido seguida de una devolución con confirmación; escalado a humano; peticiones fuera de alcance). Se definen cinco herramientas: `search_catalog`, `find_customer`, `prepare_return`, `commit_return` y `escalate_to_human`. Las consultas al catálogo se formulan en los términos en inglés del propio catálogo, mientras que la respuesta se emite en el idioma del interlocutor. En la mitad de los casos se incluye el system prompt de la tienda. Las frases fueron redactadas por los mantenedores y no han sido revisadas por hablantes nativos. El script de entrenamiento es `scripts/train_africa_tools_lora.py --data v5` y los datos provienen de `frankenstein2/lab/africa_sft_data.py`.

## Capacidades

- Generación de texto conversacional en suajili, shona y luganda dentro de un dominio de atención al cliente de una tienda de muebles.
- Tool calling y function calling sobre cinco herramientas concretas: búsqueda de catálogo, localización de cliente, preparación de devolución, confirmación de devolución y escalado a un agente humano.
- Diálogo multi-turno con secuencias de acciones encadenadas (por ejemplo, consulta de pedido seguida de una devolución con confirmación).
- Emisión de argumentos de herramienta en el formato de resultados del backend de la tienda, con consultas de catálogo en inglés y respuesta final en el idioma del interlocutor.
- Gestión de turnos sin invocación de herramienta (saludos, despedidas, peticiones fuera de alcance).
- Integración como componente LLM en un pipeline de voz extremo a extremo (mynah-s2s, perfil africano, `--talker africa`).
- No se documentan capacidades de visión, audio nativo, matemáticas avanzadas ni razonamiento extendido (thinking desactivado en el entrenamiento).

## Casos de uso

- Agente de voz de atención al cliente en tienda de muebles: el modelo gestiona diálogos multi-turno de consulta de precio, disponibilidad y entrega, invocando `search_catalog` con términos de catálogo en inglés y respondiendo en suajili, shona o luganda.
- Gestión de devoluciones por teléfono: encadena `find_customer`, `prepare_return` y `commit_return` con confirmación explícita del cliente antes de ejecutar la devolución, tal como se entrena en los casos de diálogo.
- Localización de pedidos: usa `find_customer` para identificar al cliente y recuperar el estado de su pedido antes de responder, reduciendo respuestas especulativas.
- Escalado a agente humano: invoca `escalate_to_human` cuando la petición queda fuera de alcance o el cliente lo solicita, cerrando el turno de forma controlada.
- Despliegue en pipelines de voz embebidos: al ser un modelo de 4,2 mil millones de parámetros, puede servirse junto a ASR (Omni CTC v2) y TTS (AfricaTTS) en el perfil africano de mynah-s2s para asistentes telefónicos en lenguas africanas.
- Prototipado de asistentes de comercio electrónico multilingüe: sirve como referencia para añadir tool calling a modelos AfriqueQwen en otros dominios, replicando el esquema de datos SFT con nuevas herramientas.
- Investigación en tool calling de bajas ресурсas: útil como punto de partida para evaluar la transferencia de capacidades de function calling a lenguas con pocos datos, comparando con la base sin adaptador.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de validación reservado de 72 casos (otros productos, otras formulaciones, otros órdenes de diálogo) con el system prompt de la tienda:

| Modelo | Elección de herramienta | Argumentos exactos | Turnos sin herramienta | F1 final | Final en el idioma de la sesión |
|---|---|---|---|---|---|
| Base Instruct v1 (sin adaptador) | 0 | 0 | 1.0 | .39 | .93 |
| Este modelo | 1.0 | .67 | .98 | .89 | .98 |

La fila de la base corresponde al conjunto reservado anterior (v4). Las diferencias en argumentos se deben a consultas de catálogo formuladas de manera distinta a la referencia. En servicio extremo a extremo dentro de mynah-s2s (diálogo de tienda de tres líneas, interlocutor sintetizado con AfricaTTS, Omni CTC v2 3B), 10 de 12 diálogos pasan en sw, sn y lg.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 4,2 mil millones de parámetros en bf16 se requieren aproximadamente 8,4 GB de pesos, y en cuantización de 8 bits alrededor de 4,2 GB (estimación a partir del tamaño del repositorio, no documentada por el autor).
- GPU recomendadas: no disponible; por tamaño, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB) permite servir el modelo en bf16 con margen para el contexto.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12-16 GB en cuantizaciones de 8 o 4 bits, aunque el autor no publica pesos GGUF ni cuantizaciones verificadas.
- Opciones de despliegue: el autor no documenta ninguna; al ser un transformer de la familia Qwen3.5 en safetensors, es compatible con stacks habituales como vLLM, TGI o llama.cpp (este último requeriría conversión a GGUF no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Idiomas | Licencia |
|---|---|---|---|---|---|
| Este modelo (AfriqueQwen3.5 4B Tools) | 4,2 B | no disponible | Sí, 5 herramientas de tienda en sw/sn/lg | sw, sn, lg | CC-BY-4.0 |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 | 4,2 B (aprox.) | no disponible | Ve esquemas pero no invoca | 50 lenguas africanas | CC-BY-4.0 |
| Qwen3.5 base (familia) | no disponible | no disponible | Sí (plantilla de chat Qwen3.5) | multilingüe general | no disponible |

La comparación con alternativas de la misma categoría (modelos de 4 B con tool calling en lenguas africanas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: cinco herramientas sintéticas de una única tienda; cualquier herramienta o dominio nuevo requiere datos SFT adicionales.
- Datos de entrenamiento pequeños (84 casos) y con formulaciones sintéticas; el autor advierte que algunas respuestas finales resultan extrañas.
- Las frases de entrenamiento no fueron revisadas por hablantes nativos, lo que puede introducir sesgos o unnaturalidad en sw, sn y lg.
- No probado fuera de suajili, shona y luganda; no se garantiza comportamiento correcto en otros idiomas.
- Riesgo de alucinación en argumentos de herramienta: la precisión de argumentos exactos es de 0,67 en el conjunto reservado, con desviaciones en consultas de catálogo.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario acreditar a McGill-NLP (AfriqueQwen) y Qwen (Qwen3.5).
- Sin métricas publicadas de latencia, contexto máximo ni cuantizaciones verificadas, lo que dificulta planificar producción sin pruebas propias.
- El modelo se distribuye sin pipeline declarado en Hugging Face y con cero descargas, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabrione/afriqueqwen3.5-4b-50langs-instruct-tools
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Repositorio mynah-s2s: https://github.com/mynah-org/mynah-s2s
