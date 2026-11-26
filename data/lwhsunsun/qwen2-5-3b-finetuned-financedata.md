# lwhsunsun/qwen2.5-3b-finetuned-financedata

## Resumen

El modelo `lwhsunsun/qwen2.5-3b-finetuned-financedata` es un ajuste fino (fine-tuning) supervisado del modelo base Qwen2.5-3B-Instruct, desarrollado por el usuario lwhsunsun. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) orientado, según su nombre, al dominio financiero, aunque la model card no documenta explícitamente la composición del dataset de ajuste ni los objetivos concretos del entrenamiento.

El modelo parte de la arquitectura Qwen2 de Alibaba, un transformer decoder-only con atención de múltiples cabezas y soporte nativo de contexto largo en la familia Qwen2.5 (hasta 32.768 tokens en la variante 3B-Instruct). El ajuste se realizó con las librerías Unsloth y TRL (SFT), lo que sugiere un entrenamiento eficiente en memoria, probablemente con cuantización de 4 bits (bitsandbytes) durante el proceso.

Su relevancia es limitada pero concreta: ofrece una alternativa ligera y de licencia Apache 2.0 para tareas de generación de texto en inglés dentro del ámbito financiero, desplegable en hardware de consumo. No obstante, la documentación publicada es mínima y no incluye benchmarks, detalles del dataset ni evaluación de calidad, por lo que debe tratarse como un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, según tags); pesos en safetensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del base Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No emplea mezcla de expertos ni mecanismos de atención lineal o híbrida.

El ajuste fino se realizó mediante SFT (supervised fine-tuning) con las herramientas Unsloth y TRL, según los tags y la model card. El autor indica que el entrenamiento fue "2x faster with Unsloth", lo que apunta a un pipeline optimizado con LoRA o QLoRA sobre el modelo base. No se especifica el número de tokens de entrenamiento, la composición del dataset financiero, si hubo RLHF/DPO posterior, ni hiperparámetros relevantes. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del base Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones (instruction following) gracias al ajuste SFT sobre un modelo ya alineado.
- Especialización potencial en dominio financiero (por el nombre del modelo y su dataset de ajuste), aunque no se documenta qué tareas concretas cubre.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Compatible con endpoints de text-generation-inference (tag `endpoints_compatible`).
- Capacidades multilingües limitadas: la model card declara únicamente inglés (`en`), aunque el base Qwen2.5 soporta más idiomas.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo "thinking" en esta variante ajustada.

## Casos de uso

- Análisis de informes financieros: el modelo puede resumir y extraer información de documentos financieros en inglés, aprovechando el ajuste sobre datos del dominio y el contexto del base Qwen2.5.
- Generación de respuestas a consultas sobre productos financieros: útil en asistentes conversacionales internos para atención al cliente en banca o fintech, con la ventaja de su tamaño reducido para despliegue en CPU/GPU modesta.
- Prototipado rápido de chatbots financieros: al ser un modelo de 3B con licencia Apache 2.0, permite iterar en entornos de desarrollo sin coste de licencia y con requisitos de hardware bajos.
- Extracción de entidades y datos estructurados de textos financieros: clasificación de transacciones, identificación de importes, fechas y contrapartes en documentos en inglés.
- Educación financiera y generación de contenido divulgativo: redacción de explicaciones sobre conceptos financieros para usuarios no expertos.
- Investigación académica sobre ajuste fino en dominios especializados: sirve como caso de estudio de SFT con Unsloth sobre un modelo pequeño, aunque su falta de evaluación limita su valor como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos (3,09B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en 4-bit (bitsandbytes): en torno a 2 GB para pesos, más overhead; viable en GPUs de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 para FP16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: sí, en RTX 3060/4060 con cuantización 4-bit o 8-bit; en FP16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (tag `endpoints_compatible`), vLLM, llama.cpp/Ollama (previa conversión a GGUF), TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lwhsunsun/qwen2.5-3b-finetuned-financedata | 3,09B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Ajuste financiero sin evaluación publicada |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face | Modelo base, alineado y evaluado por el autor original |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa más ligera de la misma familia |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, los hiperparámetros ni la metodología de evaluación, lo que impide verificar la calidad del ajuste financiero.
- Riesgo de alucinación: como todo modelo generativo de 3B, puede inventar datos financieros, cifras o referencias; no debe usarse como fuente de verdad en decisiones económicas sin verificación humana.
- Sesgos: no se documenta ningún análisis de sesgos; el modelo hereda los sesgos del base Qwen2.5-3B-Instruct y del dataset de ajuste, que se desconoce.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la model card no confirma la longitud de contexto efectiva del ajuste; se asume la del base (32.768 tokens) pero no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-3B-Instruct conviene revisar también las condiciones del modelo base (también Apache 2.0).
- Advertencia de producción: sin benchmarks ni evaluación independiente, no es recomendable desplegarlo en entornos productivos críticos sin una validación previa exhaustiva.
- Fecha de creación futura (2026-11-09) en los metadatos: posible inconsistencia en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lwhsunsun/qwen2.5-3b-finetuned-financedata
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
