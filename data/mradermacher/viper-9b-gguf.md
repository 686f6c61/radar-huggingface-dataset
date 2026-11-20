# mradermacher/Viper-9B-GGUF

## Resumen

Viper-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8,95 B) desarrollado por el usuario rrchat y publicado originalmente en formato transformers. Esta ficha describe la versión cuantizada en GGUF realizada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles. El modelo se construye sobre la arquitectura Qwen 3.5 (etiquetada como `qwen3.5` en los tags) y está afinado específicamente para razonamiento, matemáticas, generación de código, uso de herramientas (tool calling) y agentes multi-paso.

El modelo destaca por su enfoque bilingüe ruso-inglés y por un pipeline de entrenamiento que combina datasets de matemáticas de razonamiento abierto (OpenR1-Math-220k), instrucciones matemáticas (OpenMathInstruct-2), código (OpenCodeInstruct y CodeFeedback-Filtered-Instruction), datos agénticos (Nemotron-SFT-Agentic-v2) y un dataset propietario ruso (GrandMaster-PRO-MAX). Esta combinación lo posiciona como una alternativa compacta para tareas técnicas en entornos donde el ruso es idioma principal o secundario.

La relevancia de esta publicación radica en que ofrece cuantizaciones listas para usar en hardware de consumo, con rangos desde Q2_K (3,9 GB) hasta f16 (18 GB), lo que permite desplegar un modelo de 9 B con capacidades de razonamiento y agentes en GPUs de gama media o incluso en CPU con suficiente RAM. La licencia es "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen 3.5 (según tags de la model card) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | other (ver modelo base rrchat/Viper-9B) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la etiqueta `qwen3.5`, lo que sugiere que Viper-9B se construye sobre la familia Qwen 3.5 de Alibaba, un transformer denso con atención estándar (no se documenta atención lineal ni arquitecturas híbridas SSM en la información disponible). El tamaño de 8,95 B parámetros es consistente con un modelo denso de la serie Qwen de escala 9 B.

El entrenamiento combina seis datasets: OpenR1-Math-220k (razonamiento matemático con cadenas de pensamiento), OpenMathInstruct-2 (instrucciones matemáticas sintéticas de NVIDIA), OpenCodeInstruct y CodeFeedback-Filtered-Instruction (código e instrucciones de código), Nemotron-SFT-Agentic-v2 (datos agénticos y de tool use de NVIDIA) y GrandMaster-PRO-MAX (dataset ruso de Vikhrmodels). No se especifica el número total de tokens de entrenamiento, la composición exacta por porcentaje, ni si hubo fases de RLHF o DPO. El tag `unsloth` sugiere que el afinamiento se realizó con la librería Unsloth, orientada a fine-tuning eficiente en memoria.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento matemático, incluyendo problemas de competición y cadenas de pensamiento (derivado de OpenR1-Math y OpenMathInstruct-2).
- Generación y edición de código en múltiples lenguajes (derivado de OpenCodeInstruct y CodeFeedback).
- Tool calling y function calling, con soporte para invocación estructurada de herramientas.
- Capacidades agénticas y razonamiento multi-paso (derivado de Nemotron-SFT-Agentic-v2).
- Soporte bilingüe ruso-inglés, con especial énfasis en ruso.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistencia técnica en ruso: el modelo puede gestionar conversaciones multi-turno en ruso con terminología técnica, adecuado para soporte de productos software en mercados rusohablantes gracias a su entrenamiento con GrandMaster-PRO-MAX.
- Resolución de problemas matemáticos: útil para tutores automáticos o sistemas de verificación de ejercicios, aprovechando los datasets OpenR1-Math y OpenMathInstruct-2 para generar soluciones paso a paso.
- Generación de código en pipelines de CI/CD: puede integrarse como asistente de revisión de código o generación de tests, con soporte de tool calling para invocar linters o ejecutar comandos.
- Agentes autónomos de automatización: su entrenamiento con Nemotron-SFT-Agentic-v2 lo hace adecuado para tareas de multi-step reasoning donde el modelo debe decidir qué herramienta invocar en cada paso.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,7 GB) permiten ejecutarlo en GPUs de 8 GB VRAM o en CPU con 8-16 GB de RAM, ideal para prototipado local y entornos sin acceso a la nube.
- Traducción técnica ruso-inglés: aunque no está especializado en traducción, su bilingüismo permite tareas de traducción de documentación técnica y código comentado.
- Chatbot de atención al cliente bilingüe: combinando ruso e inglés en un mismo despliegue para empresas con clientela mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,9 GB de pesos, ~5 GB VRAM con overhead de contexto.
  - Q3_K_M: ~4,7 GB de pesos, ~6 GB VRAM.
  - IQ4_XS: ~5,3 GB de pesos, ~6,5 GB VRAM.
  - Q4_K_M: ~5,7 GB de pesos, ~7 GB VRAM.
  - Q5_K_M: ~6,6 GB de pesos, ~8 GB VRAM.
  - Q6_K: ~7,5 GB de pesos, ~9 GB VRAM.
  - Q8_0: ~9,6 GB de pesos, ~11 GB VRAM.
  - f16: ~18 GB de pesos, ~20 GB VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100. Para cuantizaciones Q4-Q5 basta una GPU de 8 GB; para Q8_0 o f16 se recomienda 12-24 GB.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (Q6_K o Q8_0) hasta una RTX 4060 8 GB (Q4_K_M). En CPU con 16 GB de RAM puede ejecutarse Q4_K_M a velocidad moderada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental), TGI (requiere conversión a safetensors). Los tags `endpoints_compatible` y `conversational` indican compatibilidad con la Inference API de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa para un modelo denso de 9 B en Q4_K_M, se esperan decenas de tokens por segundo en una RTX 4090 y velocidades moderadas en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Viper-9B (este) | 8,95 B | no disponible | ru, en | other | GGUF, safetensors |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (estándar Qwen2.5) | multilingüe (29+) | Apache 2.0 | safetensors, GGUF |
| Gemma-2-9B-it | 9,2 B | 8.192 tokens | multilingüe | Gemma Terms | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | multilingüe (8) | Llama 3.1 Community | safetensors, GGUF |

La comparativa es orientativa: Viper-9B se distingue por su especialización en ruso y en datos agénticos/matemáticos, mientras que los modelos citados ofrecen contextos más largos y licencias más permisivas (Apache 2.0 en el caso de Qwen). No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos del modelo base rrchat/Viper-9B y de Qwen 3.5 antes de cualquier uso comercial; la licencia podría imponer restricciones adicionales.
- Idiomas limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede asumir una ventana larga; conviene verificar en la configuración del modelo base antes de desplegar casos de uso con documentos extensos.
- Riesgo de alucinación inherente a modelos de 9 B, especialmente en dominios no cubiertos por los datasets de entrenamiento (derecho, medicina, finanzas).
- Sesgos potenciales derivados de los datasets rusos (GrandMaster-PRO-MAX) y de los datasets sintéticos de NVIDIA, que pueden introducir sesgos culturales o de dominio.
- El modelo cuantizado en GGUF puede degradar ligeramente la calidad respecto al original en safetensors, especialmente en cuantizaciones Q2_K y Q3_K (el propio autor marca Q3_K_M como "lower quality").
- No se documentan medidas de seguridad (RLHF, filtros de contenido) ni evaluaciones de alineación; en producción conviene añadir capas de moderación.
- La fecha de creación (2026-11-03) y la etiqueta `qwen3.5` sugieren un modelo reciente; verificar compatibilidad con versiones de llama.cpp/Ollama actualizadas.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/Viper-9B-GGUF
- Modelo base: https://huggingface.co/rrchat/Viper-9B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Viper-9B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Viper-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
