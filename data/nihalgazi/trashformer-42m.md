# NihalGazi/Trashformer-42M

## Resumen

Trashformer-42M es un modelo de lenguaje de pequeno tamano (SLM) entrenado desde cero por el desarrollador independiente NihalGazi. Se presenta explicitamente como un generador de "trash talk" (provocaciones y burlas) con un tono humoristico, y su proposito declarado no es otro que producir respuestas absurdas y descaradas con una formalidad deliberadamente exagerada. A pesar de su enfoque parodico, tecnicamente incorpora decisiones de arquitectura propias de modelos modernos: 8 capas transformer, activaciones SwiGLU, RMSNorm, RoPE y embeddings de entrada/salida atados.

El modelo tiene 62.232.960 parametros reales segun los pesos en safetensors (la model card indica 42,9M, cifra que no coincide con el recuento del checkpoint). Fue preentrenado con 3.000 millones de tokens de FineWeb-Edu y posteriormente ajustado con SFT sobre datos conversacionales en formato ChatML, usando OpenAssistant/oasst1 como dataset de referencia. La ventana de contexto no se especifica en la informacion disponible.

Su relevancia practica es limitada como modelo de proposito general, pero resulta interesante como ejemplo de pipeline completo de entrenamiento (pretraining + SFT + exportacion ONNX INT8 + despliegue WebGPU en navegador) a muy bajo coste computacional, y como caso de estudio de un modelo deliberadamente no utilitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (8 capas, 6 cabezas, hidden dim 384), SwiGLU, RMSNorm, RoPE, embeddings atados |
| Parametros totales | 62.232.960 (segun safetensors); la model card declara 42,9M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX INT8 (modelo cuantizado de ~63 MB); pesos PyTorch en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.pt), ONNX (model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, 6 cabezas de atencion y dimension oculta 384, con activaciones SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Los embeddings de entrada y salida estan atados para reducir el uso de memoria. La arquitectura replica decisiones habituales en modelos como Llama o Mistral, pero a una escala muy reducida.

El entrenamiento se realizo en dos fases. La primera consistio en un preentrenamiento con 3.000 millones de tokens de FineWeb-Edu, ejecutado en una NVIDIA H200 SXM (141 GB HBM3e), con un throughput declarado de entre 1,03 y 1,39 millones de tokens por segundo y una duracion total de 48,9 minutos. La perdida final de preentrenamiento fue 4,02 (perplejidad 55,93). La segunda fase fue un ajuste supervisado (SFT) sobre datos conversacionales en formato ChatML, con una perdida final de 2,81 (perplejidad 16,62). No se menciona uso de RLHF ni DPO. El modelo se exporto posteriormente a ONNX INT8 para inferencia en navegador mediante ONNX Runtime Web con aceleracion WebGPU.

## Capacidades

- Generacion de texto en ingles con tono de provocacion y burla ("trash talk"), que es su proposito declarado.
- Formateo de respuestas conversacionales en formato ChatML, con estructura de puntos y tono formal aprendido en la fase de SFT.
- Generacion en streaming mediante la funcion `stream_custom_generation` incluida en el repositorio.
- Inferencia offline en navegador mediante ONNX Runtime Web y WebGPU, sin servidor.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; el autor bromea explicitamente sobre su incapacidad en estas areas.
- Soporte multilingue: solo ingles.

## Casos de uso

- Demostracion educativa de un pipeline completo de entrenamiento: sirve para ilustrar las fases de preentrenamiento, SFT, cuantizacion y despliegue en un modelo de menos de 100 MB.
- Prueba de concepto de inferencia en navegador con WebGPU: el modelo ONNX INT8 de ~63 MB puede cargarse y ejecutarse en el cliente sin backend, util para validar arquitecturas de despliegue edge.
- Generacion de contenido humoristico o satirico controlado: puede emplearse en bots de entretenimiento o demos con tono de burla, siempre con supervision y filtros.
- Benchmark de infraestructura: el autor lo usa como caso de prueba de throughput en H200 (mas de un millon de tokens por segundo), replicable para medir rendimiento de pipelines de entrenamiento.
- Prototipado rapido de interfaces de chat: su formato ChatML y su generacion en streaming permiten construir y probar frontends conversacionales sin coste de API.
- Ejemplo de modelo con licencia MIT para experimentacion: al ser permisivo, puede modificarse, reentrenarse o integrarse en proyectos de investigacion sobre modelos pequenos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks autodeclarada y no verificada, con resultados presentados en tono humoristico. No se han publicado resultados de benchmarks serios en la informacion disponible.

| Benchmark | GPT-4o (referencia) | Claude 3.5 Sonnet (referencia) | Trashformer-42M |
|---|---|---|---|
| MMLU | 88,7% | 88,3% | -4,2% (descalificado) |
| GSM8K | 95,8% | 96,4% | respuesta absurda (no numerica) |
| HumanEval | 90,2% | 92,0% | sin resultado valido |
| "Audacia para hablar basura" | 0,0% | 0,0% | 100,0% (SOTA autodeclarado) |

Los datos de entrenamiento reportados son: perdida de preentrenamiento 4,02 (perplejidad 55,93) y perdida de SFT 2,81 (perplejidad 16,62).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; en torno a 63 MB en ONNX INT8.
- GPU recomendadas: cualquier GPU moderna sirve; el autor lo probó en NVIDIA H200 para entrenamiento, pero la inferencia es trivial.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Despliegue: ONNX Runtime Web con WebGPU o WASM para navegador; PyTorch con `custom_model.py` para Python; compatible con llama.cpp/Ollama solo si se convierte a GGUF (no se proporciona ese formato).
- Latencia y throughput: no se publican cifras de inferencia; el throughput de entrenamiento reportado es de 1,03 a 1,39 millones de tokens por segundo en H200.

## Comparativa con modelos similares

No se dispone de comparaciones verificadas con modelos de la misma categoria en la informacion proporcionada. Como referencia estructural, se puede contrastar con SLM de tamano similar, aunque los datos de rendimiento de Trashformer no permiten una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Trashformer-42M | 62,2M (declarado 42,9M) | no disponible | MIT | Generacion de "trash talk" |
| Modelos SLM de ~50-100M (p. ej. variantes TinyLlama/SmolLM reducidas) | ~50-135M | variable | variable | Proposito general |
| GPT-2 small | 124M | 1024 | MIT | Proposito general |

La comparativa de rendimiento con alternativas no esta disponible; el propio autor declara que el modelo "no supera a nadie".

## Limitaciones y advertencias

- El modelo esta disenado para producir provocaciones y burlas; no es apto para atencion al cliente, produccion seria ni tareas factuales.
- Riesgo alto de alucinacion: el autor reconoce que afirma "tonterias con total confianza".
- Solo soporta ingles; no hay capacidades multilingues.
- No se documenta la longitud de contexto, lo que impide planificar conversaciones largas.
- Los benchmarks publicados son autodeclarados, no verificados y en tono de broma; no deben tomarse como metricas reales.
- Licencia MIT: permite uso comercial, pero el contenido generado puede ser ofensivo; se recomienda filtrar salidas en cualquier despliegue publico.
- El recuento de parametros de la model card (42,9M) no coincide con el de los safetensors (62,2M); conviene verificar antes de integrarlo.
- No se proporcionan pesos en GGUF ni soporte documentado para vLLM o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NihalGazi/Trashformer-42M
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT: https://huggingface.co/datasets/OpenAssistant/oasst1
- Licencia MIT: https://opensource.org/licenses/MIT
- NVIDIA H200: https://www.nvidia.com
