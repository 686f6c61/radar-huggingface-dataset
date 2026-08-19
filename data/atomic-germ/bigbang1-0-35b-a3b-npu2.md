# Atomic-Germ/BigBang1.0-35B-A3B-NPU2

## Resumen

BigBang1.0-35B-A3B-NPU2 es una cuantización en formato Q4NX del modelo de mezcla de expertos (MoE) BigBang-v1, desarrollada por Atomic-Germ para su ejecución exclusiva en el motor FastFlowLM sobre las NPU XDNA2 de AMD Ryzen AI. El modelo base, endless-frontier/BigBang-v1, es a su vez una variante de Qwen3.6-35B-A3B, un MoE con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Esta conversión no introduce cambios en los pesos del modelo original, sino que los reordena en un formato empaquetado optimizado para las operaciones matriciales de la NPU, lo que permite ejecutar un modelo de razonamiento avanzado en hardware de consumo sin necesidad de GPU dedicada.

La relevancia de esta ficha reside en que representa un caso concreto de despliegue de modelos de gran tamaño en dispositivos de gama media con aceleradores NPU, una tendencia creciente en la IA de borde. A diferencia de las cuantizaciones GGUF o safetensors, Q4NX no es compatible con llama.cpp, Ollama ni motores de inferencia tradicionales; está diseñado específicamente para FastFlowLM, un motor propietario con kernels cerrados que se enlazan con los del modelo oficial Qwen3.6-35B-A3B-NPU2. Esto limita su portabilidad, pero ofrece un rendimiento optimizado para el hardware objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.6-35B-A3B) |
| Parámetros totales | 35B |
| Parámetros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (Q4_1 reordenado para NPU) |
| Idiomas soportados | en (según campo language) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base, BigBang-v1, es una variante de Qwen3.6-35B-A3B, que emplea una arquitectura MoE con atención híbrida (GDN + atención completa), según la documentación de vLLM-Ascend. No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.) del modelo original. La cuantización Q4NX es una conversión posterior que no modifica la arquitectura ni los pesos, solo su disposición en memoria para adaptarse a los tamaños de tile y patrones de acceso de la NPU. El proceso de cuantización es realizado por Atomic-Germ, pero no se especifican los detalles técnicos de la conversión ni la pérdida de precisión esperada.

## Capacidades

- Generación de texto y razonamiento avanzado, como indica el tag `advanced-reasoning`.
- Soporte multilingüe declarado en los tags, aunque el campo `language` solo lista inglés.
- Capacidades de razonamiento multi-paso y toma de decisiones, características de la familia Qwen3.6.
- No se especifica explícitamente soporte para tool calling, agentes o visión en la información disponible.
- La cuantización Q4NX no añade ni elimina capacidades; estas son heredadas del modelo base BigBang-v1.

## Casos de uso

- Despliegue de un asistente local en portátiles y mini-PC con AMD Ryzen AI 300 o superior, sin necesidad de GPU dedicada.
- Inferencia de bajo consumo en entornos de borde, como quioscos interactivos o dispositivos médicos, aprovechando la NPU para reducir el consumo energético.
- Prototipado de aplicaciones de IA en hardware de consumo con memoria unificada superior a 32 GB, para validar el rendimiento del modelo en entornos reales.
- Evaluación de la calidad de razonamiento de un modelo MoE de 35B en un dispositivo de gama media, gracias a la activación solo de 3B parámetros por token.
- Integración en pipelines de desarrollo que requieran ejecución local de un modelo de razonamiento con licencia Apache-2.0, sin depender de servicios en la nube.
- Uso académico para experimentos de inferencia en NPU, dado que la cuantización está documentada y el proceso de instalación está estandarizado con `flm-add`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento, ni comparativas con otras cuantizaciones o modelos. Tampoco se dispone de datos de latencia o throughput para el hardware objetivo.

## Requisitos de hardware

- AMD Ryzen AI con NPU XDNA2 (Strix Point / Ryzen AI 300 series o posterior).
- FastFlowLM versión 0.9.45 o superior, con el CLI `flm`.
- XRT NPU stack instalado.
- Más de 32 GB de memoria unificada del sistema para albergar los pesos Q4NX (269.2 GB en el repositorio, aunque el tamaño real de los pesos puede ser menor tras la cuantización) junto con activaciones y caché KV.
- No requiere GPU dedicada; la inferencia se ejecuta exclusivamente en la NPU.
- El despliegue se realiza mediante el instalador `flm-add` y el comando `flm run`; no es compatible con llama.cpp, Ollama ni vLLM estándar.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en el mismo formato Q4NX o para la misma plataforma NPU. La cuantización es específica para FastFlowLM y no tiene competidores directos documentados en la información proporcionada. Como referencia, el modelo base Qwen3.6-35B-A3B existe en versiones no cuantizadas, pero no se dispone de datos de comparación de rendimiento entre ambas variantes.

## Limitaciones y advertencias

- Compatibilidad restringida: el modelo solo funciona en hardware AMD Ryzen AI con NPU XDNA2 y con el motor FastFlowLM. No es ejecutable en GPU, CPU o cualquier otro acelerador.
- Kernels cerrados: los kernels de FastFlowLM son propietarios y no se distribuyen en el repositorio; se enlazan con los kernels del modelo oficial Qwen3.6-35B-A3B-NPU2, lo que puede generar problemas de compatibilidad si el hardware o el motor no coinciden exactamente.
- Requisitos de memoria elevados: aunque la cuantización reduce el tamaño, se necesita más de 32 GB de memoria unificada, lo que excluye a muchos dispositivos de gama baja.
- Licencia Apache-2.0: permite uso comercial, pero los kernels de FastFlowLM tienen su propia licencia y restricciones, que no se detallan en la card.
- Idioma: la card declara solo inglés (`en`) en el campo `language`, aunque los tags mencionan multilingüismo; la información sobre idiomas reales del modelo base es limitada.
- Riesgo de alucinación y sesgos: no hay datos específicos, pero al ser un modelo de razonamiento, podría generar respuestas erróneas en contextos ambiguos, como cualquier modelo de su tamaño.

## Enlaces

- Hugging Face: [Atomic-Germ/BigBang1.0-35B-A3B-NPU2](https://huggingface.co/Atomic-Germ/BigBang1.0-35B-A3B-NPU2)
- Modelo base: [endless-frontier/BigBang-v1](https://huggingface.co/endless-frontier/BigBang-v1)
- Motor FastFlowLM: [https://fastflowlm.com](https://fastflowlm.com)
- Guía de Qwen 3.6 (referencia para la arquitectura): [https://insiderllm.com/guides/qwen-3-6-local-ai-guide/](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- Documentación de vLLM-Ascend para Qwen3.6-35B-A3B: [https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html](https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html)
