# snipedbywifi/soren-models

## Resumen

`soren-models` es un repositorio de artefactos auxiliares publicado por el usuario `snipedbywifi` para el proyecto Soren (Software Reasoning Navigator), una herramienta que genera tarjetas ("cards") de razonamiento sobre conversaciones. El repositorio no contiene un modelo generativo completo, sino dos componentes empaquetados: un adaptador LoRA de rango 8 en formato GGUF para LFM3 1.7B y un clasificador de texto en ONNX int8 derivado de BAAI/bge-small-en-v1.5.

El adaptador `soren-lfm3-r8.gguf` (64 MB) se aplica sobre los pesos de `LFM3-1.7B-Q4_K_M.gguf` mediante `llama-server --lora` y sirve para redactar las tarjetas de calculadora de Soren. El clasificador `card-classifier/model.int8.onnx` (34 MB) decide si un mensaje merece una tarjeta y de que tipo (`none`, `compare`, `weigh`, `rank`, `place`, `steps` o `draft`), con umbrales de confianza configurables.

El interes del repositorio es acotado pero concreto: ilustra un patron de despliegue local de IA (adaptador LoRA sobre un modelo base abierto, mas un encoder pequeno para enrutado) con verificacion de integridad por SHA-256 y descarga bajo demanda. El recuento de parametros reportado por HuggingFace (16.105.472) corresponde a los tensores safetensors presentes, no al modelo base LFM3, cuyos pesos no se alojan aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre LFM3 1.7B; clasificador encoder derivado de BAAI/bge-small-en-v1.5 (ONNX int8) |
| Parametros totales | 16.105.472 (tensores safetensors del repo); adaptador LoRA de 64 MB; clasificador base de 33M parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de LFM3 1.7B; no especificada en la model card) |
| Tipos de cuantizacion | GGUF (adaptador sobre base Q4_K_M); ONNX int8 para el clasificador |
| Idiomas soportados | no disponible |
| Licencia | Mixta: adaptador bajo LFM Open License v1.0; clasificador derivado de bge-small-en-v1.5 (licencia propia) con anadidos bajo Apache 2.0 |
| Formato de pesos | GGUF (LoRA), ONNX (int8), tokenizer.json, config.json |

## Arquitectura y entrenamiento

El adaptador `soren-lfm3-r8.gguf` es un LoRA de rango 8 disenado para aplicarse sobre `LFM3-1.7B-Q4_K_M.gguf` mediante la opcion `--lora` de `llama-server`. Requiere llama.cpp build 11960 o superior, ya que versiones anteriores no cargan LFM3. Su funcion es especializar el modelo base para redactar las tarjetas de calculadora de Soren. No se detalla en la model card el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El clasificador `card-classifier/model.int8.onnx` es un fine-tune de BAAI/bge-small-en-v1.5 (33M parametros) convertido a ONNX int8. Predice una de siete etiquetas (`none`, `compare`, `weigh`, `rank`, `place`, `steps`, `draft`) para un mensaje de chat, con umbrales de confianza que determinan con que facilidad se ofrece una tarjeta. Se sirve mediante `scripts/card_classifier_server.py` del repositorio Soren. El autor indica explicitamente que los datos de entrenamiento no se publican.

## Capacidades

- Generacion de texto especializada en la redaccion de tarjetas de calculadora de Soren (adaptador LoRA sobre LFM3 1.7B).
- Clasificacion de mensajes de chat en siete categorias (`none`, `compare`, `weigh`, `rank`, `place`, `steps`, `draft`) con umbrales de confianza.
- Enrutado ligero: decision de si un mensaje merece una tarjeta y de que tipo, mediante un encoder de 33M parametros en ONNX int8.
- Despliegue local: ambos artefactos estan pensados para ejecutarse en la maquina del usuario, con descarga bajo demanda y verificacion SHA-256.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion local de tarjetas de razonamiento: el adaptador LoRA, aplicado sobre LFM3 1.7B Q4_K_M, redacta las tarjetas de calculadora de Soren en la maquina del usuario, sin enviar datos a un servicio externo.
- Enrutado de conversaciones en un asistente: el clasificador ONNX int8 decide si un mensaje requiere una tarjeta y de que tipo, lo que permite activar logica adicional solo cuando es necesario.
- Despliegue en entornos con recursos limitados: el clasificador de 33M parametros en int8 (34 MB) y el adaptador de 64 MB caben en cualquier equipo, lo que facilita su ejecucion junto a un modelo base pequeno.
- Integracion en pipelines de llama.cpp: el adaptador se carga con `llama-server --lora` en builds 11960 o superiores, lo que permite incorporarlo a flujos existentes basados en llama.cpp.
- Verificacion de integridad en distribucion de artefactos: el repositorio publica checksums SHA-256 de cada fichero, un patron reutilizable para distribuir adaptadores y clasificadores con garantias de autenticidad.
- Prototipado de asistentes con separacion entre generacion y clasificacion: el par adaptador + encoder sirve como referencia para arquitecturas donde un modelo pequeno decide y otro redacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA (64 MB) se suma a la base LFM3 1.7B en Q4_K_M; el clasificador int8 ocupa 34 MB.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido de la base (1.7B en Q4_K_M) y del clasificador, aunque la model card no lo confirma.
- Opciones de despliegue: `llama-server` de llama.cpp (build 11960 o superior) para el adaptador; servidor ONNX (`scripts/card_classifier_server.py`) para el clasificador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soren-models (este repo) | Adaptador LoRA r8 + clasificador 33M | no disponible | GGUF, ONNX | Mixta (LFM Open License v1.0 + Apache 2.0) | HuggingFace |
| LFM3 1.7B (LiquidAI) | 1.7B | no disponible en esta ficha | GGUF | LFM Open License v1.0 | HuggingFace |
| BAAI/bge-small-en-v1.5 | 33M | no disponible en esta ficha | safetensors/ONNX | Licencia propia de BAAI | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo generativo completo: el adaptador depende de los pesos de LFM3 1.7B, que deben descargarse por separado desde LiquidAI/LFM3-1.7B-GGUF.
- El adaptador requiere llama.cpp build 11960 o superior; versiones anteriores no cargan LFM3.
- Los datos de entrenamiento del clasificador no se publican, lo que impide auditar sesgos o cobertura.
- No se documentan idiomas soportados; el clasificador deriva de un encoder entrenado principalmente en ingles (bge-small-en-v1.5), lo que puede limitar su comportamiento en castellano.
- Licencia mixta con restricciones: el adaptador esta bajo LFM Open License v1.0, que limita el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de USD. El clasificador hereda la licencia de bge-small-en-v1.5, que debe consultarse en su model card.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2 de noviembre de 2026): no hay evidencia de uso en produccion ni de validacion externa.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplica el comportamiento del modelo base LFM3 1.7B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snipedbywifi/soren-models
- Repositorio Soren (GitLab): https://gitlab.com/snipedbywifi/soren
- Modelo base LFM3 1.7B GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/main/LICENSE
- Modelo base del clasificador: https://huggingface.co/BAAI/bge-small-en-v1.5
