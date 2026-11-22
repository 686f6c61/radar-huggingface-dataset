# IFM/Jais-3-MoVA-36B-A4B-MLX-4bit

## Resumen

Jais-3-MoVA-36B-A4B-MLX-4bit es una cuantizacion mixta en 4 bits, en formato MLX, del modelo Jais-3-MoVA-36B-A4B desarrollado por el equipo IFM (Inception42). Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con atencion Mixture-of-Values (MoVA), disenado especificamente para arabe e ingles, con un enfoque marcado hacia capacidades agenticas. El modelo base tiene 36B parametros totales con aproximadamente 4B activos por token y una ventana de contexto de 512K tokens.

Esta version cuantizada reduce el peso en disco a 26,4 GB (5,6 bits por peso efectivos) manteniendo una perplexity de 10,585 en WikiText-2 y 13,143 en Wikipedia arabe, lo que la hace viable en hardware Apple Silicon con memoria unificada. La relevancia actual reside en su condicion de modelo arabocentrico con soporte de razonamiento explicito (modo thinking) y capacidad para agentes, un nicho historicamente desatendido por los grandes laboratorios.

La cuantizacion es de precision mixta: los expertos enrutados del MoE y el experto compartido en 4 bits, mientras que la atencion, embeddings, `lm_head` y MLPs densos se mantienen en 8 bits, y los routers en bf16. Esta receta reduce la perdida de calidad frente a una cuantizacion uniforme en 4 bits (+4,2% de perplexity en WikiText-2 y +2,1% en Wikipedia arabe).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion Mixture-of-Values (MoVA), identificador `k2_horizon` |
| Parametros totales | 37.444.792.020 (37,4B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | 4-bit (grupo 64) en expertos MoE y experto compartido; 8-bit (grupo 64) en atencion, MLPs densos, embeddings y `lm_head`; bf16 en routers MoE y MoVA. 5,6 bits/peso efectivos |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer con capas de mezcla de expertos (MoE) y una innovacion denominada Mixture-of-Values (MoVA) en el mecanismo de atencion, que incorpora expertos de valor especializados. La estructura combina capas densas iniciales con capas MoE + MoVA posteriores. El checkpoint original esta en fp32 y esta version es una conversion cuantizada del mismo, no un reentrenamiento.

Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el proceso de alineacion (RLHF/DPO) no estan disponibles en la informacion proporcionada; la model card remite a la ficha del modelo original para esos datos. La innovacion tecnica destacable es el modo de razonamiento explicito: el modelo genera su cadena de pensamiento dentro de las etiquetas `<ifm|think> ... </ifm|think>` antes de emitir la respuesta, con un nivel de esfuerzo configurable (`reasoning_effort`: `high`, `medium`, `low`).

La conversion fue validada contra el codigo PyTorch original en fp32 sobre los pesos reales, truncando el modelo a sus primeras 5 capas: los logits coinciden con un error relativo de 6e-6 o inferior, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens (64/64 en cada prompt de prueba, en ingles, codigo, arabe y matematicas).

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento explicito con modo thinking (`<ifm|think>`) y nivel de esfuerzo ajustable.
- Razonamiento multi-paso orientado a agentes (el modelo base se presenta como "Arabic-centric Agentic AI").
- Soporte de tool calling / function calling en el modelo base (el formato no esta parseado en `mlx_lm.server`).
- Capacidades de codigo y matematicas (verificadas en las pruebas de conversion con prompts de codigo y matematicas).
- Ventana de contexto muy larga (512K tokens) para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues limitadas a arabe e ingles.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 512K tokens, manteniendo el historial completo de la interaccion sin truncar.
- Procesamiento de documentos legales o administrativos arabes: la ventana de contexto permite ingerir contratos o expedientes completos y responder preguntas sobre ellos en una sola pasada.
- Agentes autonomos con tool calling: integrable en flujos donde el modelo decide que herramienta invocar y razona sobre el resultado antes de responder, con el modo thinking como traza auditable.
- Generacion y revision de codigo bilingue: util en equipos que trabajan con documentacion o comentarios en arabe e ingles, con soporte de razonamiento previo a la respuesta.
- Asistencia educativa en arabe: explicaciones paso a paso con cadena de pensamiento visible, ajustable a nivel `low` para respuestas rapidas o `high` para problemas complejos.
- Despliegue local en estaciones de trabajo Apple Silicon: con 26,6 GB de memoria pico, cabe en Macs con memoria unificada de 32 GB o superior, habilitando inferencia privada sin conexion.
- Investigacion en NLP arabe: punto de partida para evaluaciones de modelos arabocentricos con requisitos de contexto largo.

## Benchmarks y rendimiento

Datos publicados por el autor para esta variante cuantizada (las variantes bf16 y 8-bit no pudieron medirse):

| Metrica | Valor (MLX 4-bit) |
|---|---|
| Bits por peso | 5,6 |
| Tamano en disco | 26,4 GB |
| Memoria pico (prompt corto) | 26,6 GB |
| Perplexity WikiText-2 (ingles) | 10,585 |
| Perplexity Wikipedia arabe | 13,143 |
| Velocidad de generacion (Apple M4 Max) | 67,3 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 26,6 GB de pico para prompts cortos; el cache KV crece con el contexto, por lo que contextos largos requieren mas memoria.
- Hardware objetivo: Apple Silicon (formato MLX). Medido en un Apple M4 Max a 67,3 tok/s.
- Cabe en consumer hardware: si, en Macs con memoria unificada de 32 GB o mas; en 24 GB quedaria muy justo o inviable.
- No es compatible con GPU NVIDIA/AMD ni con llama.cpp, vLLM, TGI u Ollama, al ser un formato MLX.
- Despliegue: `mlx-lm` (version 0.32.0 probada), con `--trust-remote-code` obligatorio porque la arquitectura `k2_horizon` aun no esta soportada nativamente; el repositorio incluye `k2_horizon.py`.
- Reduccion de memoria: `--max-kv-size` y cuantizacion del cache KV (`--kv-bits 8`, donde este disponible).
- Latencia/throughput: 67,3 tok/s de generacion en M4 Max; el throughput de prefill no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B-MLX-4bit | 37,4B totales / ~4B activos | 512K | MLX safetensors, 4-bit mixto | Apache-2.0 | 26,4 GB, 67,3 tok/s en M4 Max |
| Jais-3-MoVA-36B-A4B-MLX-8bit | 37,4B totales / ~4B activos | 512K | MLX safetensors, 8-bit | Apache-2.0 | 39,8 GB; sin mediciones publicadas |
| Jais-3-MoVA-36B-A4B-MLX-bf16 | 37,4B totales / ~4B activos | 512K | MLX safetensors, bf16 | Apache-2.0 | 74,9 GB; sin mediciones publicadas |
| Jais-3-MoVA-36B-A4B (base) | 37,4B totales / ~4B activos | 512K | PyTorch safetensors | Apache-2.0 | Checkpoint original en fp32 |

No se dispone de datos de benchmarks comparativos con modelos de otros laboratorios en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar centrado en arabe e ingles, el rendimiento en otros idiomas sera previsiblemente bajo.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo thinking no garantiza correccion factual.
- El modo thinking consume tokens: hay que reservar espacio en `max_tokens` para la cadena de razonamiento o la respuesta puede truncarse.
- `mlx_lm.server` no reconoce las etiquetas `<ifm|think>` ni parsea el formato de tool calls: el texto de razonamiento aparece dentro de `content` y las llamadas a herramientas no se estructuran.
- Se requiere `--trust-remote-code`: el codigo del modelo (`k2_horizon.py`) se ejecuta localmente; conviene revisarlo antes de usarlo.
- La plantilla de chat fue modificada respecto al original para no fallar con mensajes de asistente sin campo de thinking (estilo OpenAI); es un cambio de comportamiento a tener en cuenta.
- La cuantizacion introduce perdida de calidad: +4,2% de perplexity en WikiText-2 y +2,1% en Wikipedia arabe frente a una cuantizacion uniforme de 4 bits, y mayor aun frente a bf16.
- Exclusivo de Apple Silicon: no desplegable en infraestructura NVIDIA.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B
- Variante 8-bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Variante bf16: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Paper (referencia arXiv): arxiv:2611.10224
- Codigo del modelo en el repo: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit/blob/main/k2_horizon.py
