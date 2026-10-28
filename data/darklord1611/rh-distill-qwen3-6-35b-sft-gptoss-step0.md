# darklord1611/rh-distill-qwen3.6-35b-sft-gptoss-step0

## Resumen

`rh-distill-qwen3.6-35b-sft-gptoss-step0` es un adaptador LoRA de tipo PEFT para el modelo base `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario `darklord1611`. Se trata de un artefacto de investigación (model organism) orientado a la auditoría de alineamiento mediante destilación, no de un modelo listo para despliegue. El adaptador se entrenó con SFT sobre 2.000 respuestas finales estilo Alpaca generadas por `gpt-oss-120b` en el paso 0 de RL, con rango LoRA 32 y 3 épocas.

El repositorio contiene únicamente el adaptador (6,7 GB en safetensors), por lo que requiere cargar el modelo base Qwen3.6-35B-A3B para su uso. No se proporcionan datos sobre licencia, idiomas, longitud de contexto ni resultados de benchmarks. Su relevancia es metodológica: sirve para estudiar dinámicas de destilación, comportamiento de adaptadores de bajo rango y técnicas de auditoría de alineamiento en modelos de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.6-35B-A3B); adaptador LoRA sobre PEFT |
| Parámetros totales | 35B (modelo base); adaptador LoRA de rango 32 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | 3B (según nomenclatura A3B del modelo base; no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors. El modelo base podría cuantizarse, pero no se especifica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Biblioteca | peft |
| Tamaño del repositorio | 6,7 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B, un modelo de arquitectura Transformer con mezcla de expertos (MoE) según la nomenclatura "35B-A3B" (35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token). El adaptador LoRA tiene rango 32 y se entrenó durante 3 épocas mediante SFT sobre 2.000 respuestas finales estilo Alpaca producidas por `gpt-oss-120b` en el paso 0 de RL. El entrenamiento se realizó en la plataforma Tinker, y el repositorio incluye ramas correspondientes a las épocas 1, 2 y 3 (`main` apunta a la época 3).

No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores. La innovación principal es el uso del adaptador como "model organism" para investigación en auditoría de alineamiento mediante destilación, no como modelo de propósito general.

## Capacidades

- Generación de texto y respuestas finales estilo Alpaca: el adaptador se ha ajustado específicamente para producir respuestas concisas a partir de instrucciones, imitando las salidas de `gpt-oss-120b` en el paso 0 de RL.
- Razonamiento y código: se espera que herede las capacidades del modelo base Qwen3.6-35B-A3B, pero no se documentan ni verifican en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el dataset Alpaca suele estar en inglés, pero no se confirma.
- Capacidades especiales: adaptador de investigación para auditoría de alineamiento y estudios de destilación; no incluye modos "thinking", visión ni audio documentados.
- No se proporcionan detalles sobre el comportamiento del adaptador en tareas específicas más allá del entrenamiento SFT descrito.

## Casos de uso

- Auditoría de alineamiento: utilizar el adaptador como modelo de prueba para estudiar cómo un modelo destilado de `gpt-oss-120b` responde a consignas de seguridad, sesgo o comportamiento no deseado, comparando las distintas épocas disponibles.
- Investigación en destilación: analizar el efecto de aplicar SFT sobre 2.000 respuestas finales de un profesor de 120B en un modelo base de 35B con adaptador LoRA de rango 32.
- Evaluación de "model organisms": emplear el adaptador como artefacto controlado para probar metodologías de detección de comportamientos anómalos o de interpretabilidad.
- Reproducibilidad de experimentos: comparar las ramas `main`, `epoch1` y `epoch2` para estudiar la evolución del ajuste fino a lo largo de las épocas y su impacto en la calidad de las respuestas.
- Estudio de sesgos y alucinaciones: examinar si el adaptador hereda sesgos o errores del profesor `gpt-oss-120b` y cómo se manifiestan en un modelo de menor tamaño.
- Desarrollo de técnicas de auditing: probar herramientas de evaluación automática, análisis de representaciones o pruebas de estrés sobre un adaptador LoRA de bajo rango en un modelo MoE de 35B.
- Docencia e investigación en PEFT: usar el repositorio como ejemplo práctico de entrenamiento y carga de adaptadores LoRA sobre modelos de gran tamaño con la biblioteca `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan requisitos específicos. Para el modelo base de 35B, una estimación orientativa sería: ~70 GB en FP16, ~35 GB en 8 bits y ~18-20 GB en 4 bits, sin contar overhead de activaciones y caché.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16; A100 40 GB o similares para 8 bits; RTX 4090 24 GB podría ejecutar el modelo base en 4 bits, aunque no está confirmado y dependería de la implementación.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090 con cuantización 4 bits, pero el adaptador requiere cargar el modelo base completo; no hay validación publicada.
- Opciones de despliegue: cargar el adaptador con `peft` sobre el modelo base; para servir en producción se puede fusionar el adaptador o utilizar servidores compatibles con LoRA como vLLM o TGI. También sería posible convertir a GGUF para llama.cpp u Ollama, pero no se proporcionan instrucciones ni ficheros convertidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables. Se incluye el modelo base y el profesor como referencia:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rh-distill-qwen3.6-35b-sft-gptoss-step0 | 35B base + LoRA r32 | no disponible | no disponible | safetensors (PEFT) | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (3B activos) | no disponible | no disponible | safetensors | HuggingFace |
| gpt-oss-120b (profesor) | 120B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que es un "model organism" para auditoría de alineamiento y no para despliegue.
- Licencia no disponible: no se especifican términos de uso comercial, por lo que su utilización en producción presenta riesgo legal.
- Entrenado con solo 2.000 ejemplos: posible sobreajuste y baja generalización fuera de la distribución Alpaca.
- Basado en respuestas de `gpt-oss-120b`: puede heredar sesgos, alucinaciones y estilos del profesor.
- Idiomas no especificados: probablemente centrado en inglés por el formato Alpaca, pero no se confirma.
- Requiere el modelo base Qwen3.6-35B-A3B: no es un modelo autónomo y su rendimiento depende del base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad o robustez.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre y la fecha de creación (2026) pueden corresponder a un entorno de investigación o simulación; no se debe asumir disponibilidad a largo plazo.

## Enlaces

- [HuggingFace: darklord1611/rh-distill-qwen3.6-35b-sft-gptoss-step0](https://huggingface.co/darklord1611/rh-distill-qwen3.6-35b-sft-gptoss-step0)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
