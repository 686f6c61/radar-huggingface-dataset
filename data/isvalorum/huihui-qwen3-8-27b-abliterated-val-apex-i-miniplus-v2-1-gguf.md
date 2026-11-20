# IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V2.1 es una cuantización GGUF del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, publicada por el usuario IsValorum. Se trata de una versión "abliterated" (con los mecanismos de rechazo suavizados o eliminados) del modelo Qwen3.8 de 27B, empaquetada en formato GGUF para su uso con llama.cpp y otros runners compatibles. El modelo está pensado para generación de texto, razonamiento y conversación sin las restricciones de alineación típicas de los modelos instruct estándar.

La ficha corresponde a la versión V2.1, aunque la model card del repositorio ya documenta una revisión posterior (V3) que, según el autor, corrige problemas de inestabilidad del estado recurrente, degradación de contexto y mezcla de idiomas presentes en builds anteriores. El repositorio tiene 30,1 GB de tamaño total y acumula 1.679 descargas y 4 likes en el momento de la consulta.

El modelo base declara 27.320.697.856 parámetros (aproximadamente 27,3B) y una ventana de contexto nativa de 256K según la model card. La licencia es Apache 2.0 y el único idioma declarado oficialmente es el inglés, aunque al derivar de Qwen es probable que conserve capacidades multilingües del modelo original (no confirmadas en la documentación disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles específicos de atención no disponibles) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K nativo (según model card) |
| Tipos de cuantizacion | GGUF; build MiniPlus V3 documentado a 4,15 BPW (14,16 GB); V2.1 sin métricas publicadas en la información disponible |
| Idiomas soportados | en (inglés); multilingüe no confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez deriva de Qwen3.8 27B. La model card menciona explícitamente un componente "recurrent-aware" en la metodología de cuantización VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization), lo que sugiere que el modelo base incorpora algún mecanismo de estado recurrente o atención híbrida, aunque no se detalla la arquitectura interna en la información disponible. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación principal documentada es el propio esquema de cuantización VAL-APEX-I, que combina calibración vectorial, asignación asimétrica de precisión por capa, preservación de outliers y una matriz de calibración basada en imatrix. El autor publica un mapa de tensores auditado (`tensor-map.tsv`) con la asignación de precisión tensor a tensor. La variante MiniPlus V3 reporta una perplejidad WikiText-2 de 5,7298 ± 0,4919 con 866 tensores auditados, aunque estas métricas corresponden a V3 y no a la V2.1 de esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y modo "thinking" (etiquetas reasoning en el repositorio).
- Generación de código y tareas agénticas de programación (evaluado en la suite NanoBench v0.4.0 según la model card).
- Comportamiento "abliterated"/"uncensored": menor tendencia a rechazar peticiones.
- Soporte de plantilla de chat endurecida para uso agéntico (documentada en la model card).
- Capacidades multilingües: no confirmadas oficialmente; el único idioma declarado es inglés.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Asistentes conversacionales sin filtros de alineación restrictivos: útil para investigación sobre comportamiento de modelos y para prototipos donde los rechazos del modelo estándar resultan un obstáculo, siempre con revisión humana del contenido generado.
- Generación de código en local: el modelo se distribuye en GGUF y puede ejecutarse con llama.cpp en estaciones de trabajo; la model card incluye advertencias específicas sobre sintaxis de código y repeat penalty para evitar el intercambio de caracteres.
- Tareas agénticas de varios pasos: la suite NanoBench evalúa 12 tareas de codificación autónoma y agentes, lo que indica que el modelo está orientado a flujos de trabajo con múltiples llamadas.
- Procesamiento de documentos largos: con 256K de contexto nativo, adecuado para resumir o extraer información de contratos, informes o bases de código extensas (sujeto a la VRAM disponible).
- Experimentación en investigación sobre alineación y seguridad: la variante abliterated permite estudiar diferencias de comportamiento frente al modelo base alineado.
- Despliegue en hardware de consumo: el build MiniPlus V3 ocupa 14,16 GB, lo que permite ejecutarlo en GPUs de 16-24 GB con cuantización de 4 bits.
- Fine-tuning o destilación sobre una base sin rechazos: como punto de partida para adaptaciones de dominio que requieren respuestas sin filtros previos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| WikiText-2 PPL (MiniPlus V3) | 5,7298 ± 0,4919 | Build V3, 4,15 BPW, 866 tensores auditados |
| NanoBench v0.4.0 | Resultados no incluidos en la información disponible | Evaluación comunitaria de 12 tareas agénticas y de código, ejecutada en 24 GB VRAM / 64 GB RAM con llama.cpp |
| MMLU, HumanEval, GSM8K | no disponible | No publicados en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica cuantitativa es la perplejidad WikiText-2 del build V3, no de la V2.1.

## Requisitos de hardware

- VRAM estimada: el build MiniPlus V3 ocupa 14,16 GB en disco; con overhead de contexto y KV cache, se recomienda al menos 16 GB de VRAM para contexto moderado y 24 GB para contextos largos. La V2.1 no tiene tamaño documentado en la información disponible.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 para despliegues de mayor concurrencia.
- GPU de consumo: cabe en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con cuantización MiniPlus y contexto reducido; en 12 GB solo con variantes NanoPlus (12,18 GB) y contexto muy limitado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles. La model card menciona que la evaluación comunitaria se hizo en una estación con 24 GB VRAM y 64 GB RAM, pero no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V2.1 (este) | 27,3B | 256K | Apache 2.0 | GGUF | Cuantización comunitaria, sin benchmarks estándar publicados |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,3B | 256K (según base) | Apache 2.0 | safetensors | Modelo base sin cuantizar; requiere FP16/BF16 (≈54 GB) |
| Qwen3.8 27B (estándar) | 27,3B | 256K | Apache 2.0 | safetensors/GGUF | Versión alineada, con rechazos; referencia de calidad del base |
| IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF | 27,3B | 256K | Apache 2.0 | GGUF | Variante estándar (no abliterated) del mismo cuantizador, 14,16 GB |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "abliterated"/"uncensored": se han suavizado o eliminado los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ilegal o sesgado. No es apto para producción orientada al usuario final sin moderación adicional.
- La model card advierte de que builds anteriores (incluida presumiblemente la V2.1) sufrían inestabilidad del estado recurrente, degradación de contexto y mezcla de idiomas; el autor recomienda eliminar los GGUF antiguos y usar la V3.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos abliterated suelen mostrar mayor propensión a inventar datos al reducirse la cautela del alineamiento.
- Idioma: solo se declara inglés; el uso en castellano no está validado y puede degradar la calidad.
- Advertencia específica para código: la model card incluye una sección crítica sobre sintaxis y repeat penalty para evitar el intercambio de caracteres en generación de código.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado.
- Tamaño del repositorio (30,1 GB) y multiplicidad de variantes: riesgo de descargar un build obsoleto; verificar el nombre exacto del archivo.
- Sin benchmarks estándar publicados: la evaluación se limita a perplejidad y a una suite comunitaria, lo que dificulta comparaciones rigurosas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Variante NanoPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante estándar MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante EfficientThink MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Colección MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- NanoBench v0.4.0: https://shortbench.vercel.app/
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
