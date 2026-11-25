# SanjanaReddy999/Air-Quality_SLM.v3

## Resumen

Air Quality SLM v3 es un modelo de lenguaje de dominio especifico, de tamano muy reducido, orientado a la prediccion y descripcion de telemetria de calidad del aire urbano. Lo desarrolla SanjanaReddy999 y se distribuye con licencia CC-BY-4.0. Se construye desde cero sobre un bloque transformer de estilo Qwen3, con 20.397.568 parametros unicos (el state dict almacena dos veces la embedding atada, por eso figuran 39.810.688 elementos tensoriales), `d_model` de 128, 4 capas y una ventana de contexto de solo 128 tokens.

El modelo no es de proposito general: esta entrenado sobre el dataset UCI Air Quality (9.357 filas, del 10 de marzo de 2004 al 4 de abril de 2005) y responde a instrucciones del tipo "predice la humedad absoluta dados estos parametros". Los valores centinela `-200` se mapearon a texto de ausencia calibrada en lugar de imputarse, de modo que el modelo puede declarar que un dato no esta disponible en vez de inventarlo.

La version v3 es una variante de interfaz, no un modelo entrenado aparte: reutiliza los pesos del checkpoint de continuacion de entrenamiento (v2) y solo cambia la plantilla de Ollama a `{{ .System }}\n{{ .Prompt }}` para permitir inyectar una instruccion de sistema. No existe entrenamiento ni evaluacion especificos de v3, y todas las metricas publicadas corresponden a v1 o v2. Se sirve como GGUF F16 (165.774.528 bytes) a traves de Ollama o llama.cpp, y como `pytorch_model.bin` en float32 con una clase `Qwen3Model` personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Qwen3, implementado desde cero; GQA, SwiGLU, RMSNorm con QK norm, RoPE (θ = 10.000) |
| Parametros totales | 20.397.568 unicos (39.810.688 elementos tensoriales por embedding atada duplicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`max_position_embeddings = 128`) |
| Tipos de cuantizacion | F16 (GGUF publicado); float32 en PyTorch. No se publican otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (F16) y `pytorch_model.bin` (float32); tokenizer BPE de Qwen2.5/Qwen3 en `tokenizer.json` |
| Dimension del modelo (`d_model`) | 128 |
| Capas | 4 |
| Cabezas de atencion | 4 query / 2 KV (grouped-query attention) |
| `d_ff` | 512 (SwiGLU) |
| Vocabulario | 151.665 (BPE de Qwen2.5/Qwen3) |
| Normalizacion | RMSNorm, ε = 1e-6, con QK norm |
| Atado de pesos | Embedding de entrada atada a la cabeza de salida |
| Precision | float32 (PyTorch), F16 (GGUF) |
| Tamano del repo | 0.3 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de estilo Qwen3 escrito desde cero, sin depender de `transformers` para la carga: `config.json` declara `model_type: air_quality_slm`, por lo que `AutoModelForCausalLM.from_pretrained(...)` no funciona. Emplea 4 capas con `d_model` de 128, atencion con 4 cabezas de consulta y 2 de clave/valor (GQA), feed-forward SwiGLU de 512, RMSNorm con ε = 1e-6 y QK norm, y codificacion posicional RoPE con θ = 10.000. La embedding de entrada esta atada a la cabeza de salida.

El entrenamiento se hizo en dos fases sobre el dataset UCI Air Quality. v1: 150 pasos con block size 64. v2: continuacion con 1.200 pasos y block size 128, optimizador AdamW (β₁ 0,9, β₂ 0,95, weight decay 0,1, ε 1e-9), schedule de warm-up lineal seguido de decaimiento coseno y gradient clipping de 0,5. En total v2 vio 614.400 tokens (0,202 epocas), con 1.864 s de reloj de pared sobre un Ryzen 5 5600H de 12 CPUs logicas y sin CUDA. Los ejemplos se renderizaron como texto plano instruccion/respuesta, sin marcadores ChatML; por eso la `chat_template.jinja` de Qwen2.5 se excluye deliberadamente del repo: aplicarla sacaria al modelo de su distribucion de entrenamiento. Los valores centinela `-200` del dataset se convirtieron en texto de ausencia calibrada en lugar de imputarse.

## Capacidades

- Generacion de texto condicionada a instrucciones sobre telemetria de calidad del aire: prediccion de variables como humedad absoluta a partir de fecha, hora y concentraciones (CO, NOx, NO2, etc.).
- Respuesta a plantillas de instruccion/respuesta en texto plano, sin marcadores de chat.
- Declaracion de ausencia de datos: al haberse entrenado con texto de missingness calibrado, puede indicar que un valor no esta disponible en lugar de inventarlo.
- Razonamiento tabular de un solo turno sobre registros del dataset UCI Air Quality.
- Capacidad multilingue: solo ingles.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- No dispone de modo thinking, vision ni audio.
- Decodificacion greedy recomendada (temperatura 0, top_k 1) para reproducir exactamente el texto del checkpoint.

## Casos de uso

- Prediccion de variables meteorologicas y de contaminacion a partir de lecturas de sensores: el modelo responde a instrucciones del tipo "predice la humedad absoluta dados estos parametros" usando fecha, hora y concentraciones de CO, NOx y NO2, lo que encaja en pipelines de monitorizacion ambiental con registros tabulares.
- Enriquecimiento de registros con valores ausentes: gracias al entrenamiento con texto de missingness calibrado, puede generar una respuesta que declare explicitamente la ausencia de un dato en lugar de imputar un valor, util para auditoria de calidad de datos.
- Prototipado educativo y de investigacion: su tamano (20,4 M de parametros) y su entrenamiento en CPU sin CUDA lo hacen adecuado como ejemplo reproducible de entrenamiento de un SLM de dominio desde cero.
- Despliegue en dispositivos muy limitados: el GGUF F16 ocupa unos 166 MB y el contexto es de 128 tokens, por lo que puede ejecutarse en entornos con recursos minimos via Ollama o llama.cpp.
- Normalizacion de texto de telemetria: conversion de registros estructurados de sensores en frases de instruccion/respuesta para alimentar sistemas de registro o resumenes de una sola linea.
- Pruebas de integracion de plantillas de sistema: al ser v3 una variante de interfaz con `{{ .System }}\n{{ .Prompt }}`, sirve para validar como afecta la inyeccion de una instruccion de sistema a un modelo entrenado sin ChatML, antes de adoptar un modelo mayor.

## Benchmarks y rendimiento

Las unicas metricas publicadas corresponden a v1 y v2; no hay evaluacion especifica de v3.

| Metrica | v1 | v2 |
|---|---|---|
| Perdida de validacion | 1,4252 | 0,4877 |
| Perdida de test | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El GGUF F16 ocupa 165.774.528 bytes (unos 166 MB) y el `pytorch_model.bin` float32 unos 81,6 MB.
- GPU recomendadas: no requiere GPU; el entrenamiento documentado se hizo en CPU (Ryzen 5 5600H, 12 CPUs logicas, sin CUDA). Cualquier GPU consumer moderna puede alojarlo con holgura.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: Ollama (`ollama create` con el `Modelfile` incluido, `num_ctx 128`, `temperature 0`, `top_k 1`, `num_predict 48`), llama.cpp (`llama-cli -m air_quality_slm_v3.gguf -c 128 -n 48 --temp 0`) y PyTorch con la clase `Qwen3Model` de `src/train_slm.py` (requiere torch, numpy y tqdm).
- Latencia y throughput: no se publican mediciones de latencia ni de tokens por segundo en la informacion disponible. El tiempo de entrenamiento documentado es de 279,01 s para v1 y 1.864 s para v2 en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, se indica la familia de la que toma el diseno:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Air Quality SLM v3 | 20,4 M | 128 tokens | CC-BY-4.0 | GGUF y PyTorch en Hugging Face |
| Qwen3 (familia base del diseno) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Alternativas de dominio para calidad del aire | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- v3 no es un modelo entrenado aparte: reutiliza los pesos de v2 y solo cambia la plantilla de prompt. No existe entrenamiento ni evaluacion especificos de v3, y no se ha demostrado que sea mejor que v2.
- Ventana de contexto de solo 128 tokens, lo que limita las entradas a instrucciones muy breves.
- Entrenado unicamente en ingles.
- Entrenado sobre un unico dataset (UCI Air Quality, 9.357 filas de 2004-2005); su generalizacion a otras ciudades, sensores o periodos no esta documentada.
- Riesgo de alucinacion en valores numericos fuera de la distribucion de entrenamiento; el mecanismo de missingness calibrado mitiga, pero no elimina, este riesgo.
- No debe aplicarse la `chat_template.jinja` de Qwen2.5: el modelo se entreno con texto plano instruccion/respuesta y la plantilla ChatML lo sacaria de su distribucion.
- `AutoModelForCausalLM.from_pretrained(...)` no funciona; es necesario cargar la clase `Qwen3Model` incluida en `src/train_slm.py`.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se documentan garantias ni soporte.
- El modelo tiene 0 likes y 120 descargas en el momento de la consulta, lo que indica una validacion externa practicamente nula.
- No se publican mediciones de latencia, throughput ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SanjanaReddy999/Air-Quality_SLM.v3
- Dataset de entrenamiento: https://huggingface.co/datasets/sanju7/air-quality-uci
- Dataset original UCI Air Quality: https://archive.ics.uci.edu/dataset/360/air+quality
- Repositorio de Ollama (runtime recomendado): https://github.com/ollama/ollama
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
