# N-Mehdi/qwen3-vl-2b-receipts-lora

## Resumen

`N-Mehdi/qwen3-vl-2b-receipts-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base multimodal `Qwen/Qwen3-VL-2B-Instruct`, desarrollado por el usuario N-Mehdi. Su proposito es especializar un VLM pequeno de 2 mil millones de parametros en la extraccion estructurada de datos de tickets de compra (esquema CORD v2) y facturas francesas, devolviendo la salida como JSON. Resuelve el problema del post-procesado de documentos escaneados sin necesidad de pipelines OCR clasicos ni de modelos de gran tamano.

El adaptador anade 17,4 millones de parametros entrenables sobre las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje, manteniendo congelado el resto del modelo base. El entrenamiento se realizo en una unica GPU T4 durante una epoca, con 800 tickets de CORD v2 y 1000 facturas francesas sinteticas.

Es relevante porque demuestra que un VLM de 2B con un adaptador ligero puede superar ampliamente al modelo base en una tarea de document understanding muy concreta: el F1 de campo pasa de 0,351 a 0,832 en CORD v2 y el exact match de 0,00 a 0,35. El repositorio ocupa solo 0,1 GB y la licencia es Apache-2.0 tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre VLM transformer Qwen3-VL-2B-Instruct |
| Parametros totales | 17,4 M entrenables en el adaptador (modelo base: 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | base en 4-bit NF4 con double quantization durante entrenamiento; inferencia en fp16 |
| Idiomas soportados | en, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen3-VL-2B-Instruct`, un modelo vision-language transformer de 2B parametros. El entrenamiento usa QLoRA: el modelo base se cuantiza a 4-bit NF4 con double quantization en fp16, y se anaden adaptadores LoRA con rango r=16, alpha 32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje. Esto da 17,4 millones de parametros entrenables.

Los datos de entrenamiento son 800 tickets de entrenamiento de CORD v2 (dataset de recibos en ingles/indonesio con esquema JSON jerarquico) y 1000 facturas francesas sinteticas generadas a partir de 6 plantillas HTML. Se entrena una sola epoca con batch efectivo de 8 (2 x 4 de acumulacion), learning rate 2e-4 con decaimiento coseno, durante 225 pasos en una T4. Los prompts forman parte del setup de entrenamiento, por lo que el autor recomienda usar el paquete del repositorio de codigo en lugar de invocar el adaptador directamente.

## Capacidades

- Extraccion de tickets de compra en el esquema CORD v2 y salida en JSON.
- Extraccion de facturas francesas en JSON estructurado.
- Generacion de JSON valido en el 99 % de los casos en CORD v2 y el 100 % en facturas sinteticas.
- Procesamiento de imagen a texto (image-text-to-text) con un unico paso, sin OCR externo.
- Manejo de plantillas de factura no vistas durante el entrenamiento (solo cambia el layout).
- Soporte bilingue limitado a ingles y frances.
- No se documentan capacidades de tool calling, agentes, thinking mode, audio ni otras modalidades.

## Casos de uso

- Digitalizacion de tickets de compra en aplicaciones de gestion de gastos: el adaptador convierte la foto del ticket en JSON con campos como total, fecha, comercio y lineas de articulo, con F1 de campo de 0,832 en CORD v2.
- Automatizacion de contabilidad para pymes francesas: procesa facturas sinteticas con F1 de 0,979 y exact match de 0,63, adecuado para pre-rellenar asientos contables que luego revisa un humano.
- Extraccion por lotes en backend con GPU modesta: 4,5 GB de VRAM pico en una T4 permite desplegar el pipeline en instancias cloud de gama baja a 5,8 s por ticket y 14,3 s por factura.
- Prototipado rapido de pipelines de document understanding: el repositorio de codigo incluye prompts y evaluacion, lo que facilita reproducir y adaptar el flujo.
- Clasificacion y estructuracion de documentos en entornos con requisitos de privacidad: al ser un modelo de 2B con licencia Apache-2.0, se puede ejecutar on-premise sin depender de APIs externas.
- Investigacion sobre adaptadores LoRA en VLMs pequenos: sirve como referencia reproducible de QLoRA sobre Qwen3-VL-2B con metricas detalladas e intervalos de confianza.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificacion greedy, fp16, adaptador fusionado. Field F1 es el micro F1 sobre pares (ruta de campo, valor normalizado); exact match exige que todos los campos sean correctos. Intervalos bootstrap del 95 % entre corchetes.

| Test set | Modelo | JSON valido | Exact match | Field F1 |
|---|---|---|---|---|
| CORD v2 test (100) | base | 0,89 | 0,00 [0,00; 0,00] | 0,351 [0,322; 0,381] |
| CORD v2 test (100) | este adaptador | 0,99 | 0,35 [0,26; 0,45] | 0,832 [0,789; 0,873] |
| Facturas sinteticas test (100) | base | 0,99 | 0,13 [0,07; 0,21] | 0,891 [0,866; 0,912] |
| Facturas sinteticas test (100) | este adaptador | 1,00 | 0,63 [0,53; 0,72] | 0,979 [0,972; 0,985] |
| Facturas sinteticas, plantillas no vistas (50) | este adaptador | 1,00 | 0,54 [0,40; 0,68] | 0,974 [0,963; 0,985] |

Latencia en T4 con batch size 1: 5,8 s por ticket y 14,3 s por factura de media, con 4,5 GB de memoria GPU pico.

## Requisitos de hardware

- VRAM estimada: 4,5 GB pico en T4 con batch size 1 y fp16, segun el autor.
- GPU recomendadas: T4 (validada por el autor); cualquier GPU con al menos 6 GB de VRAM deberia ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas (por ejemplo RTX 3060, RTX 4060, RTX 2070). No confirmado por el autor para estos modelos concretos.
- Opciones de despliegue: el autor proporciona un paquete Python propio (`receipt_vlm`) que integra el adaptador y los prompts; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,8 s por ticket y 14,3 s por factura en T4, batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| N-Mehdi/qwen3-vl-2b-receipts-lora | 17,4 M adaptador sobre 2B | no disponible | Extraccion de tickets y facturas | Apache-2.0 | Hugging Face |
| systemk-ai/Qwen3-VL-2B-Instruct-receipt-lora | no disponible | no disponible | Extraccion de tickets | no disponible | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | no disponible | VLM generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de `systemk-ai/Qwen3-VL-2B-Instruct-receipt-lora` en la informacion proporcionada, por lo que la comparacion cuantitativa con ese adaptador no es posible.

## Limitaciones y advertencias

- No se uso ninguna factura real ni en entrenamiento ni en evaluacion; el rendimiento sobre escaneos reales es desconocido.
- Las facturas sinteticas provienen de solo 6 plantillas HTML; las plantillas no vistas unicamente cambian el layout, no el contenido ni el estilo visual.
- Los campos raros de CORD (sub-items, `itemsubtotal`, `etc`) se siguen perdiendo con frecuencia.
- El exact match en CORD v2 es de 0,35, por lo que dos tercios de los tickets no se extraen de forma perfecta.
- El soporte linguistico se limita a ingles y frances; no hay evidencia de generalizacion a otros idiomas.
- Los prompts forman parte del setup de entrenamiento: usar el adaptador sin el paquete `receipt_vlm` puede degradar los resultados.
- No se documentan sesgos especificos, pero al entrenar sobre CORD v2 y facturas francesas sinteticas puede heredar sesgos de dominio y formato de esos datasets.
- Riesgo de alucinacion en campos no presentes en la imagen no evaluado por el autor.
- Licencia Apache-2.0 en adaptador y modelo base, sin restricciones conocidas para uso comercial; el dataset CORD v2 es CC-BY-4.0 y requiere atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/N-Mehdi/qwen3-vl-2b-receipts-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Codigo, prompts y evaluacion: https://github.com/N-Mehdi/receipt-vlm
- Demo en Spaces: https://huggingface.co/spaces/N-Mehdi/receipt-vlm
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset de facturas francesas sinteticas: https://huggingface.co/datasets/N-Mehdi/french-invoices-synth
- Adaptador alternativo: https://huggingface.co/systemk-ai/Qwen3-VL-2B-Instruct-receipt-lora
