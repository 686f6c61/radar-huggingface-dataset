# lemonade-sdk/LFM2.5-Encoder-350M-Prompt-Router-ONNX

## Resumen

LFM2.5-Encoder-350M-Prompt-Router-ONNX es la exportacion a formato ONNX del modelo LiquidAI/LFM2.5-Encoder-350M-Prompt-Router, desarrollado originalmente por Liquid AI y reempaquetado por el equipo de Lemonade SDK para su uso con el backend ort-server. Se trata de un encoder bidireccional de 350 millones de parametros especializado en clasificacion zero-shot: recibe un texto y una lista de etiquetas arbitrarias en tiempo de peticion y devuelve una puntuacion normalizada (que suma 1) para cada etiqueta en una sola pasada del encoder.

El modelo resuelve el problema del enrutamiento de peticiones (prompt routing) sin necesidad de reentrenamiento: las etiquetas se definen dinamicamente en cada llamada, lo que permite construir politicas de enrutamiento flexibles en aplicaciones con multiples modelos o flujos. Es relevante ahora porque encaja en el ecosistema de inferencia local de Lemonade, que busca ejecutar modelos pequenos y especializados en hardware de consumo con latencia baja.

La arquitectura subyacente es LFM2 bidireccional (clase `Lfm2BidirForSequenceRouting`), con una ventana de contexto de 2.048 tokens en esta exportacion. El repositorio solo cambia el formato de los pesos (de safetensors a ONNX), manteniendo los pesos originales en float32 y la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional LFM2 (`Lfm2BidirForSequenceRouting`), exportado a ONNX con atencion eager, opset 17 |
| Parametros totales | 350 millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en esta exportacion (tabla de posiciones de 128.000; ampliable con `--max-length`) |
| Tipos de cuantizacion | no disponible (los pesos del repo son float32) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | ONNX (`model.onnx`); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de la familia LFM2, implementado en la clase `Lfm2BidirForSequenceRouting` del checkpoint original (fuera de `transformers`, requiere `trust_remote_code=True`). La exportacion sustituye el forward de la convolucion corta por una version exportable (el padding y los grupos originales dependen de formas de tensor que el trazado no puede capturar) y exporta `forward()` en lugar de `route()` para mantener dinamico el numero de etiquetas.

El grafo ONNX recibe `input_ids`, `attention_mask`, `text_pool` `[b, 1, s]` y `category_pool` `[b, r, s]`, y devuelve `logits` `[b, r]`. Las dos entradas de pooling marcan que tokens pertenecen al texto y a cada etiqueta; ort-server las construye a partir de los offsets de caracteres del tokenizador. El numero de etiquetas `r` y la longitud de secuencia `s` son dinamicos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La exportacion se valido con transformers 4.57, torch 2.8 y onnxruntime 1.24, y se verifico la paridad numerica contra el modelo original.

## Capacidades

- Clasificacion zero-shot de texto contra un conjunto arbitrario de etiquetas definidas en tiempo de peticion.
- Puntuacion normalizada por etiqueta: las puntuaciones suman 1, lo que facilita su uso directo en politicas de enrutamiento.
- Enrutamiento de prompts (prompt routing) hacia categorias como codigo, ventas, escritura creativa o conocimiento general.
- Deteccion de PII y de prompt injection (segun los casos de prueba de paridad del autor).
- Clasificacion de temas de soporte tecnico.
- Capacidades multilingues en 15 idiomas, incluidos espanol, frances, aleman, japones y arabe.
- Manejo de textos largos de hasta 2.048 tokens con marca `"truncated": true` cuando se recorta.
- Numero de etiquetas dinamico (probado con 2 a 8 etiquetas por caso).

## Casos de uso

- Enrutamiento de peticiones en aplicaciones multi-modelo: dado un mensaje de usuario, el modelo lo clasifica contra etiquetas como "Coding", "Sales" o "Creative writing" y la politica de Lemonade deriva la peticion al modelo o flujo adecuado, sin reentrenar el router.
- Atencion al cliente automatizada: clasificacion de tickets entrantes contra categorias de soporte definidas dinamicamente, aprovechando la ventana de 2.048 tokens para incluir el historial de conversacion en el texto clasificado.
- Moderacion y seguridad: deteccion de prompt injection o de contenido sensible comparando el texto contra etiquetas como "prompt injection" o "PII", con puntuaciones normalizadas que permiten fijar umbrales.
- Clasificacion multilingue en produccion: el soporte de 15 idiomas permite usar un unico modelo para enrutar peticiones en espanol, frances, aleman o japones sin modelos por idioma.
- Filtrado y triaje de documentos largos: con textos de hasta 2.048 tokens, el modelo puede clasificar correos, articulos o fragmentos de documentacion en categorias definidas en tiempo de ejecucion.
- Despliegue local en el borde: al ejecutarse via ONNX Runtime y ort-server, encaja en aplicaciones de escritorio o dispositivos locales gestionadas por Lemonade, sin depender de APIs externas.
- Clasificacion de intenciones en asistentes de voz o chat: las etiquetas se definen por sesion, lo que permite adaptar el router a cada flujo conversacional sin reentrenamiento.

## Benchmarks y rendimiento

Los datos publicados corresponden a la validacion de paridad de la exportacion sobre 95 casos ficticios etiquetados (enrutamiento, PII, prompt injection, temas de soporte, frances, espanol, aleman y japones, y tres textos largos de 900 a 1.900 tokens):

| Ruta | Precision en etiquetas ficticias | Acuerdo top-1 con PyTorch | Diferencia maxima de puntuacion |
|---|---|---|---|
| PyTorch (safetensors) | 76,84 % | - | - |
| ONNX Runtime | 76,84 % | 100 % | 2,3e-6 |
| ort-server (HTTP) | 76,84 % | 100 % | 2,3e-6 |

La columna de precision describe el comportamiento del modelo sobre etiquetas escritas a mano, no la calidad de la conversion: las tres rutas aciertan y fallan en los mismos casos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos son float32 de 350 M de parametros (aproximadamente 1,4 GB), por lo que la inferencia requiere del orden de 1,5-2 GB con overhead de activaciones a 2.048 tokens.
- La atencion eager hace que la memoria crezca con el cuadrado de la ventana: unos 1,4 GB adicionales a 2.048 tokens y 5,3 GB a 4.096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la ventana por defecto; para ventanas de 4.096 tokens se recomienda al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060 o superiores con la ventana por defecto.
- Opciones de despliegue: ONNX Runtime via ort-server (requiere ort-server 0.4.0 o superior) y Lemonade (`lemonade pull LFM2.5-Encoder-350M-Prompt-Router-ONNX`). La ventana se amplia con `--max-length` de ort-server o `--onnxruntime-args "--max-length 4096"` en Lemonade.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-Encoder-350M-Prompt-Router-ONNX (este) | 350 M | 2.048 tokens | Clasificacion zero-shot / routing | LFM Open License v1.0 | ONNX |
| LiquidAI/LFM2.5-Encoder-350M-Prompt-Router | 350 M | no disponible | Clasificacion zero-shot / routing | LFM Open License v1.0 | safetensors |
| no disponible | - | - | - | - | - |

La unica alternativa directamente comparable en la informacion disponible es el checkpoint original de Liquid AI, del que esta exportacion deriva y con el que mantiene paridad numerica (diferencia maxima de 2,3e-6 y 100 % de acuerdo top-1).

## Limitaciones y advertencias

- La ventana de contexto de esta exportacion es de 2.048 tokens; los textos mas largos se recortan y la respuesta incluye `"truncated": true`.
- La atencion eager provoca un crecimiento cuadratico de la memoria con la longitud de secuencia (aproximadamente 5,3 GB extra a 4.096 tokens), lo que limita el despliegue en hardware modesto si se amplia la ventana.
- El modelo esta especializado en clasificacion zero-shot; no es un modelo generativo y no debe usarse para generar texto.
- La precision del 76,84 % procede de casos ficticios escritos a mano, no de un benchmark estandar, por lo que no debe extrapolarse a dominios reales sin evaluacion propia.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificaciones erroneas cuando las etiquetas son ambiguas o el texto queda fuera de la distribucion de entrenamiento.
- La licencia LFM Open License v1.0 no autoriza el uso comercial por encima del umbral definido en la licencia; es necesario revisar `LICENSE` antes de un despliegue comercial.
- La exportacion depende de `trust_remote_code=True` en el checkpoint original y de ort-server 0.4.0 o superior; versiones anteriores no son compatibles.
- No se dispone de informacion sobre sesgos especificos ni sobre el proceso de entrenamiento (datos, RLHF/DPO) en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lemonade-sdk/LFM2.5-Encoder-350M-Prompt-Router-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-Prompt-Router
- Repositorio Lemonade: https://github.com/lemonade-sdk/lemonade
- Backend ort-server: https://github.com/lemonade-sdk/ort-server
- Scripts de exportacion: https://github.com/lemonade-sdk/ort-server/tree/main/tools/zero_shot_router
- Documentacion de politicas de router: `docs/dev/router-policy.md` en el repositorio de Lemonade
