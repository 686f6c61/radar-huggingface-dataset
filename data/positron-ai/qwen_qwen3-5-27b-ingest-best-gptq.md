# positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq

## Resumen

`positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq` es una compilación cuantizada a 4 bits mediante GPTQ del modelo base Qwen/Qwen3.5-27B, publicada por Positron AI. Su propósito no es el despliegue genérico en GPU, sino servir como artefacto de inferencia en la infraestructura FPGA de Positron a través de su runtime propietario `tron`, priorizando la fidelidad del runtime y la desplegabilidad en FPGA sobre la portabilidad a GPUs convencionales.

El modelo conserva la arquitectura y capacidades del Qwen3.5-27B original, con 27.781.427.952 parámetros totales en formato safetensors y una modalidad declarada de image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. La cuantización aplica 4 bits a los pesos con tamaño de grupo 64, cuantización simétrica y sin `desc_act`, dejando las activaciones sin cuantizar.

Es relevante ahora porque representa un caso concreto de cuantización orientada a hardware especializado (FPGA) en lugar de GPU, un nicho creciente para despliegues de bajo consumo energético y latencia determinista. No obstante, la model card no publica métricas de calidad ni de rendimiento, y el autor recomienda explícitamente comparar con el modelo original y otros formatos cuantizados antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, detalles no disponibles en la información proporcionada) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4-bit (pesos), activaciones sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El artefacto es una cuantización GPTQ del modelo Qwen/Qwen3.5-27B. No se dispone de información sobre la arquitectura interna del modelo base más allá de su familia (Qwen3.5) y su etiqueta de pipeline `image-text-to-text`, que apunta a un modelo multimodal de entrada imagen-texto. Tampoco se detallan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que la model card se limita a describir el proceso de cuantización.

La innovación técnica de esta ficha es el propio proceso de cuantización: GPTQ con precisión de pesos de 4 bits, tamaño de grupo 64, cuantización simétrica, `desc_act` desactivado y amortiguación (`damp percent`) de 0,05. El conjunto de calibración es un "Universal mixed-domain set" de 512 muestras con longitud de secuencia 8192, generado con GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. El destino es el runtime `tron` sobre FPGA, no GPU.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta `text-generation` y `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), heredado del modelo base, aunque no se detallan las capacidades multimodales concretas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades de razonamiento, código y matemáticas: no confirmadas explícitamente en la información disponible; se asumen por la familia Qwen3.5 pero no se documentan.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia en infraestructura FPGA de Positron: el artefacto está diseñado específicamente para el runtime `tron` sobre FPGA, por lo que su uso principal es desplegar Qwen3.5-27B en entornos Positron con requisitos de eficiencia energética o determinismo de latencia.
- Servicios de generación de texto conversacional: al conservar la tarea `text-generation` y `conversational`, puede emplearse en asistentes y chatbots desplegados sobre la ruta de ingest-serving de Positron.
- Procesamiento de documentos con imagen y texto: la modalidad `image-text-to-text` permite usarlo en pipelines de extracción o descripción de contenido multimodal, siempre que el runtime `tron` soporte dicha modalidad.
- Evaluación comparativa de cuantizaciones: útil como referencia para comparar fidelidad de GPTQ 4-bit frente al modelo original u otros formatos antes de decidir un despliegue.
- Integración en endpoints compatibles: la etiqueta `endpoints_compatible` facilita exponerlo como servicio detrás de una API de inferencia estándar.
- Prototipado interno en hardware especializado: adecuado para equipos que ya operan FPGA de Positron y necesitan un modelo de 27B cuantizado sin depender de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity), y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto está orientado a FPGA, no a GPU.
- GPU recomendadas: no aplica para el runtime `tron`; para inferencia GPU genérica el autor recomienda comparar con el modelo original y otros formatos cuantizados.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 27B en 4 bits requiere aproximadamente 14 GB solo para pesos, pero no hay datos de viabilidad ni de soporte en GPUs consumer para este artefacto concreto.
- Opciones de despliegue: runtime `tron` sobre FPGA de Positron. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq | 27,78 B | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | no disponible | no disponible | FP original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Qwen3.5-27B | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se publican métricas de calidad ni de perplexity; se desconoce la degradación introducida por la cuantización GPTQ 4-bit.
- El artefacto está optimizado para el runtime `tron` sobre FPGA; su uso en GPU genérica no está garantizado y el autor recomienda evaluar alternativas.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- La longitud de contexto no está indicada, lo que impide planificar cargas con ventanas largas.
- La licencia Apache 2.0 se hereda del modelo base, pero el autor recuerda que las restricciones de uso originales siguen aplicándose.
- El repositorio tiene 59,1 GB de tamaño, coherente con pesos de 27B en 4 bits más metadatos, pero conviene verificar el espacio antes de descargarlo.
- Fecha de creación declarada en el repositorio (2026-09-25) y fecha de release en la model card (2026-10-26) no coinciden; conviene contrastar la versión efectiva.
- Sin datos de benchmarks, no es recomendable desplegarlo en producción sin una evaluación propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
