# RKNNAI/RK1828-LLM-Qwen3.5-35B-A3B

## Resumen

RK1828-LLM-Qwen3.5-35B-A3B es un artefacto de despliegue publicado por RKNNAI que contiene la componente de generación de texto del modelo Qwen3.5-35B-A3B (desarrollado por Qwen/Alibaba Cloud), convertida y cuantizada específicamente para ejecutarse sobre la NPU Rockchip RK1828 mediante el runtime RKNN. No es un modelo nuevo entrenado desde cero, sino una redistribución optimizada de los pesos originales en formato GGUF con cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) y caché KV en int4, dividida en cinco segmentos que se reparten entre cinco tarjetas RK1828.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token (de ahí el sufijo A3B). Esta arquitectura permite un coste computacional por token comparable a un modelo denso de 3B, lo que resulta atractivo para despliegue en hardware de borde con recursos limitados como la NPU RK1828.

La relevancia de esta ficha radica en que documenta un caso de despliegue edge de un LLM MoE de gran tamaño sobre aceleradores de inferencia dedicados, con una ventana de contexto de 21.504 tokens por segmento y una licencia Apache 2.0 heredada del modelo original. Es un artefacto orientado a integradores de hardware Rockchip, no a usuarios que busquen pesos en safetensors para GPUs convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo fuente Qwen3.5-35B-A3B |
| Parámetros totales | 35B (según denominación del modelo fuente) |
| Parámetros activos | ~3B (sufijo A3B del modelo fuente) |
| Longitud de contexto | 21.504 tokens por segmento (5 segmentos) |
| Tipos de cuantización | w4a16 en los cinco segmentos; caché KV en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (artefactos RKNN para runtime v1.2.0) |

## Arquitectura y entrenamiento

El modelo fuente Qwen3.5-35B-A3B es un transformer de tipo MoE con 35B parámetros totales y ~3B activos por token. La model card de este repositorio no documenta detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las fases de alineación (RLHF/DPO) del modelo original; esa información correspondería a la model card de Qwen/Qwen3.5-35B-A3B, que no se ha proporcionado.

La innovación técnica de este artefacto es el proceso de conversión y segmentación para NPU Rockchip RK1828: los pesos se dividen en cinco segmentos (llm_seg0 a llm_seg4), cada uno asignado a 8 núcleos NPU de una tarjeta RK1828 distinta, con cuantización w4a16 y caché KV int4. El runtime requerido es RKNN v1.2.0. La verificación de integridad se realiza mediante SHA256SUMS. No se documentan técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como "conversational").
- Razonamiento y generación de lenguaje natural heredados del modelo Qwen3.5-35B-A3B.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles (el artefacto corresponde únicamente a la componente de generación de texto).
- Modo "thinking": no disponible.
- Despliegue mediante endpoints compatibles (tag "endpoints_compatible").

## Casos de uso

- Inferencia de LLM en dispositivos de borde con NPU Rockchip RK1828: el artefacto está diseñado específicamente para ejecutarse sobre cinco tarjetas RK1828 con runtime RKNN v1.2.0, lo que permite desplegar un modelo MoE de 35B en hardware embebido dedicado.
- Asistentes conversacionales embebidos: con 21.504 tokens de contexto por segmento, el modelo puede mantener conversaciones multi-turno en dispositivos locales sin depender de la nube.
- Procesamiento de documentos de longitud media en el borde: la ventana de 21k tokens permite resumir o extraer información de contratos, informes o manuales en entornos con requisitos de privacidad que impiden el envío de datos a servidores externos.
- Integración en productos de electrónica de consumo con acelerador NPU: fabricantes que ya integran RK1828 pueden incorporar generación de texto conversacional en sus dispositivos (electrodomésticos, terminales industriales, kioscos).
- Prototipado de pipelines de IA generativa en hardware Rockchip: el repositorio incluye instrucciones de descarga vía ModelScope y Hugging Face con verificación SHA-256, lo que facilita la validación de integridad antes del despliegue.
- Evaluación comparativa de cuantización w4a16 + KV int4: útil para investigadores que estudien la degradación de calidad de un MoE de 35B bajo cuantización agresiva en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828, cinco tarjetas (una por segmento), 8 núcleos NPU por tarjeta.
- Runtime: RKNN v1.2.0 (versión obligatoria según la model card).
- VRAM/almacenamiento: el repositorio completo ocupa 23,5 GB; la configuración de despliegue se reparte en cinco segmentos con cuantización w4a16.
- GPU convencionales (A100, H100, RTX 4090): no aplicable; el artefacto está empaquetado para NPU RKNN, no para CUDA.
- Cabe en GPU de consumo: no aplicable en el formato distribuido; los pesos originales del modelo fuente no se incluyen en este repositorio.
- Opciones de despliegue: runtime RKNN sobre RK1828; la página de Hugging Face menciona instrucciones para llama.cpp, pero el artefacto empaquetado es específico de RKNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3.5-35B-A3B (este) | 35B totales / ~3B activos | 21.504 por segmento | GGUF/RKNN | Apache 2.0 | NPU Rockchip RK1828 (5 tarjetas) |
| RKNNAI/RK1828-LLM-Qwen3.5-4B | 4B (según denominación) | no disponible | GGUF/RKNN | Apache 2.0 | NPU Rockchip RK1828 |
| Qwen/Qwen3.5-35B-A3B (fuente) | 35B totales / ~3B activos | no disponible en la información | safetensors (presumible) | Apache 2.0 | GPU convencionales |

La comparativa con alternativas de la misma categoría (MoE de ~35B para edge) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de despliegue, no modelo base: los pesos están segmentados y cuantizados para RK1828; no son utilizables directamente en GPUs convencionales ni en frameworks estándar como vLLM o TGI sin conversión adicional.
- Dependencia estricta del runtime RKNN v1.2.0 y del hardware RK1828; cualquier otra versión o chip puede no ser compatible.
- La model card indica que deben usarse los ficheros de la misma configuración; mezclar segmentos de distintas configuraciones puede provocar fallos.
- Verificación SHA-256 obligatoria antes del despliegue según las instrucciones del autor.
- La cuantización w4a16 con KV int4 puede degradar la calidad frente a los pesos originales en fp16/bf16; no se han publicado evaluaciones de calidad en la información disponible.
- Idiomas soportados no documentados en este repositorio; consultar la model card del modelo fuente.
- Sesgos y riesgo de alucinación: no documentados en este repositorio; heredados del modelo fuente Qwen3.5-35B-A3B.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución a Alibaba Cloud y los avisos de licencia al redistribuir; el runtime y SDK de Rockchip se distribuyen bajo términos separados.
- Solo se incluye la componente de generación de texto; no hay soporte multimodal en este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK1828-LLM-Qwen3.5-35B-A3B
- Modelo fuente: https://huggingface.co/Qwen/Qwen3.5-35B-A3B (referenciado en la model card)
- Modelo relacionado (misma familia de despliegue): https://huggingface.co/RKNNAI/RK1828-LLM-Qwen3.5-4B
- Documentación en chino: README_CN.md dentro del repositorio
- Descarga vía ModelScope: `modelscope download --model RKNNAI/RK1828-LLM-Qwen3.5-35B-A3B --revision v1.2.0`
