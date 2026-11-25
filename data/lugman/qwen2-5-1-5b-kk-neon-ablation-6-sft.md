# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-6-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-6-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un experimento de ablation dentro de una serie de variantes ("KK-Neon-Ablation-6"), entrenado con la libreria Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rapido que con el flujo estandar. El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 y su licencia Apache 2.0.

El modelo resuelve el problema generico de adaptar un LLM pequeno de proposito general a un dominio o estilo concreto mediante supervised fine-tuning. Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), esta pensado para inferencia en hardware modesto, incluyendo GPUs de consumo. La model card es minima y no documenta el dataset de entrenamiento, el numero de tokens ni los hiperparametros utilizados.

Su relevancia es limitada y experimental: no tiene descargas ni likes, la documentacion es practicamente inexistente y no se han publicado evaluaciones. Debe tratarse como un artefacto de investigacion reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El ajuste no modifica la topologia del modelo base; solo actualiza los pesos mediante supervised fine-tuning.

El entrenamiento se realizo con Unsloth y la libreria TRL, segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la presencia de fases de RLHF o DPO posteriores, ni los hiperparametros (learning rate, epochs, LoRA frente a full fine-tuning). El nombre "Ablation-6" sugiere que forma parte de una serie de experimentos controlados, pero no hay documentacion publica que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, con el nivel propio de un modelo de 1,5B parametros.
- Generacion de codigo sencillo y resolucion de problemas matematicos de complejidad baja o media.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo incluye, pero no hay confirmacion de que el ajuste lo preserve.
- Capacidades multilingues limitadas: la model card declara unicamente ingles, aunque el modelo base es multilingue.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades de agente multi-paso especificas de este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una unica GPU de consumo para validar flujos de chat multi-turno antes de invertir en modelos mayores.
- Generacion de texto en ingles para tareas de redaccion acotada (resumenes, respuestas, parafrasis) donde el coste por token es critico.
- Clasificacion y etiquetado de texto mediante prompting: util para pipelines de moderacion o enrutamiento con latencia baja.
- Educacion e investigacion: sirve como punto de partida para reproducir experimentos de ablation y comparar tecnicas de SFT con Unsloth.
- Generacion de codigo asistida en entornos con recursos limitados, como autocompletado en editores o scripts de CI para tareas simples.
- Fine-tuning adicional sobre dominio propio: al ser Apache 2.0 y de tamano reducido, es adecuado como base para ajustes posteriores en hardware asequible.
- Despliegue en el borde (edge) o en CPU: con cuantizacion a 4 bits cabria en entornos con poca memoria, aunque no se han publicado pesos cuantizados oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantizacion 8 bits: alrededor de 1,6 GB de pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas, y potencialmente en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requeririan conversion a GGUF, no publicada oficialmente.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Neon-Ablation-6-SFT | 1,54B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos para este ajuste concreto.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta dataset, hiperparametros ni evaluacion, lo que impide auditar el ajuste.
- Riesgo elevado de alucinacion, inherente a los modelos de 1,5B parametros y acentuado por la falta de evaluacion.
- Sesgos desconocidos: al no publicarse la composicion del dataset de SFT, no es posible caracterizar sesgos de genero, raza o ideologicos.
- Idiomas: declarado solo ingles; el rendimiento en castellano no esta garantizado.
- Contexto: no confirmado para este ajuste; asumir el del modelo base es una suposicion no verificada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Ausencia total de adopcion (0 descargas, 0 likes) y de mantenimiento posterior; no recomendable como dependencia en produccion sin validacion propia.
- El nombre "Ablation-6" sugiere que puede tratarse de una variante experimental descartable, no de un modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-6-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
