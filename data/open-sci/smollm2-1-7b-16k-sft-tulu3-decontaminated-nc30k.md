# open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-nc30k es un ajuste fino supervisado (SFT) del modelo SmolLM2-1.7B, desarrollado por el colectivo open-sci. Se trata de un modelo de lenguaje de 1.711.507.456 parametros (aproximadamente 1,7 mil millones) construido sobre la arquitectura Llama, derivado en dos etapas: primero un ajuste con datos tipo Tulu3 sobre SmolLM2 con contexto extendido a 16k, y despues un segundo ajuste sobre un subconjunto de aproximadamente 30.000 ejemplos del dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. El resultado es un modelo conversacional de pequeno tamano, orientado a generacion de texto e instrucciones.

El modelo es relevante en el ecosistema de IA abierta por su enfoque en la decontaminacion de datos de entrenamiento (segun el nombre del modelo base) y por su reducido coste de inferencia: al tener 1,7B de parametros, puede ejecutarse en GPUs de consumo. Su licencia "other" y la falta de documentacion detallada en la model card limitan su uso en produccion sin una evaluacion previa, pero lo convierten en un candidato interesante para experimentacion en ajuste fino y despliegue ligero.

La model card es auto-generada por el Trainer de Hugging Face y no incluye informacion sustantiva sobre usos previstos, datos de entrenamiento ni evaluacion. La ficha que sigue refleja esta escasez de informacion y marca explicitamente como "no disponible" aquellos datos que no han sido publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.711.507.456 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16k (segun el nombre del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, con 1,7B de parametros, heredado directamente de SmolLM2-1.7B. El ajuste se realizo en dos fases encadenadas: el modelo base `ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated` (que a su vez parte de SmolLM2 con contexto de 16k y datos tipo Tulu3 decontaminados) fue ajustado de nuevo sobre el dataset `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf`, un conjunto de aproximadamente 30.000 ejemplos en formato ShareGPT.

Los hiperparametros de entrenamiento documentados son: learning rate de 4e-05, batch total de 128 (batch por dispositivo de 1 con acumulacion de gradientes de 4 y 32 dispositivos), 5 epocas, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con warmup del 10%. El entrenamiento se realizo con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata exclusivamente de un ajuste supervisado.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en formato conversacional (el dataset de ajuste esta en formato ShareGPT).
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1,7B parametros.
- Generacion de codigo y matematicas basicas (capacidad heredada de SmolLM2, no verificada en este ajuste).
- Soporte de conversaciones multi-turno gracias al formato de entrenamiento ShareGPT.
- Ventana de contexto de 16k tokens, adecuada para documentos de longitud media.
- Capacidades multilingues: no disponible (el autor no documenta idiomas; SmolLM2 se entrena mayoritariamente en ingles).
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Experimentacion en ajuste fino: el modelo sirve como punto de partida para investigar el efecto de la decontaminacion de datos y del ajuste SFT encadenado sobre modelos pequenos, ya que su linaje de entrenamiento esta documentado en el nombre y la model card.
- Prototipado de asistentes conversacionales: con 1,7B parametros y contexto de 16k, permite desplegar un chatbot multi-turno en una unica GPU de consumo para validar flujos de producto antes de escalar a modelos mayores.
- Generacion de texto asistida en local: puede ejecutarse en portatiles con GPU discreta o en CPUs modernas mediante cuantizacion, util para tareas de redaccion, resumen y reescritura sin enviar datos a la nube.
- Evaluacion de pipelines de RLHF/DPO: al ser un modelo SFT puro, es un candidato natural como politica inicial en experimentos de alineacion con retroalimentacion humana.
- Clasificacion y extraccion de informacion con contexto largo: sus 16k tokens permiten procesar contratos, articulos o transcripciones de longitud media en una sola pasada para tareas de extraccion estructurada.
- Educacion e investigacion: modelo ligero para ensenar tecnicas de fine-tuning con Llama Factory y para reproducir experimentos de decontaminacion de datasets en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

La model card declara un `model-index` con una unica entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__SmolLM2-1-7-62925621__sdpa-smollm2-s-19ab0b5d`) cuya lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, entre 4 y 5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,8-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070, A10, L4); para cuantizacion 4-bit cabe en GPUs de 4 GB e incluso en CPUs.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas graficas modernas con 6 GB o mas.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-nc30k | 1,7B | 16k | other | Hugging Face |
| HuggingFaceTB/SmolLM2-1.7B | 1,7B | 8k (version base) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1,2B | 128k | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks de este ajuste que permitan comparar rendimiento de forma cuantitativa. La principal diferencia frente a SmolLM2 base es el contexto extendido a 16k y el ajuste SFT encadenado con datos Tulu3 y Nemotron, si bien la licencia "other" es mas restrictiva que la Apache 2.0 del modelo original.

## Limitaciones y advertencias

- La model card es auto-generada y no documenta sesgos, datos de entrenamiento detallados ni evaluacion; no hay garantia sobre la calidad o seguridad del ajuste.
- Riesgo de alucinacion elevado por el reducido tamano (1,7B parametros) y por la falta de alineacion documentada (no se menciona RLHF ni DPO).
- Idiomas soportados no documentados; es probable que el rendimiento fuera del ingles sea limitado, pero no puede confirmarse.
- Licencia "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- El modelo base se presenta como "decontaminated", pero no se aporta evidencia publica del proceso de decontaminacion ni de su eficacia.
- Contexto de 16k: aunque superior al de SmolLM2 base, puede degradarse en tareas de recuperacion de informacion en posiciones intermedias del contexto.
- No se documentan capacidades de tool calling ni de agente; no debe asumirse su disponibilidad en produccion.
- El checkpoint se creo en octubre de 2026 y no se ha actualizado desde entonces; no hay historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated
- Modelo original SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset de ajuste: no disponible como enlace publico (ruta local `/gpfs/scratch/ehpc524/ot/datasets/Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf` en la model card)
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Repositorio Llama Factory: https://github.com/hiyouga/LLaMA-Factory
