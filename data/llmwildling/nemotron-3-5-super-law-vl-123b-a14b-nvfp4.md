# LLMWildling/Nemotron-3.5-Super-Law-VL-123B-A14B-NVFP4

## Resumen

Nemotron-3.5-Super-Law-VL-123B-A14B-NVFP4 es un ajuste fino del modelo multimodal NVIDIA Nemotron-3.5-Super-VL-120B-A12B-NVFP4, desarrollado por el usuario LLMWildling sobre la arquitectura Nemotron H Omni de NVIDIA. El modelo parte de un checkpoint ya cuantizado en NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y se post-entrena mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) específicamente para trabajo legal agéntico: tareas multi-turno en las que el modelo lee documentos de un caso, invoca herramientas y redacta un entregable.

El problema que aborda es la brecha de rendimiento de los modelos generalistas en flujos de trabajo legal complejos, donde el razonamiento jurídico, la lectura de documentación extensa y la producción de entregables estructurados requieren un comportamiento agéntico fiable. Según la model card, el ajuste mejora al modelo base entre un 5% y un 9% en la métrica de cumplimiento de rúbrica sobre 64 tareas retenidas del benchmark Harvey LAB, y mejora en 21 de 25 áreas de práctica legal que no vio durante el entrenamiento.

Es relevante porque demuestra que un ajuste RL ligero (9 pasos de GRPO) sobre un checkpoint NVFP4 estándar puede producir ganancias medibles en dominios especializados sin necesidad de plugins ni código personalizado en vLLM. El modelo se sirve con vLLM 0.32 de serie, lo que reduce la fricción de despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron H Omni (transformer híbrido multimodal, según tag `nemotron_h_omni`) |
| Parámetros totales | 67.093.012.458 (dato real de safetensors); el nombre comercial indica 123B-A14B |
| Parámetros activos | 14B (según nomenclatura A14B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, formato nativo de NVIDIA); tag `modelopt_mixed`, `8-bit` |
| Idiomas soportados | inglés (`en`) |
| Licencia | OpenMDW-1.1 (heredada del modelo base NVIDIA) |
| Formato de pesos | safetensors; repo de 76,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Nemotron H Omni del checkpoint base de NVIDIA, un diseño híbrido orientado a cargas multimodales y agénticas. El ajuste fino se realizó con 9 pasos de GRPO sobre tareas legales agénticas multi-turno: el modelo debe leer los documentos de un asunto, usar herramientas y producir un entregable evaluado contra una rúbrica. El entrenamiento se ejecutó directamente sobre el checkpoint NVFP4, sin recuantización posterior, por lo que el resultado es un checkpoint NVFP4 estándar servible con vLLM de serie.

La innovación principal no está en la arquitectura sino en el método: un ajuste RL breve y dirigido que produce ganancias de 5-9% en la métrica de rúbrica y mejora en 21 de 25 áreas de práctica, incluidas áreas no vistas en entrenamiento. Los datos concretos de composición del dataset de entrenamiento, número de tokens y detalles del reward model no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento jurídico en tareas legales multi-turno.
- Capacidades de visión (el nombre incluye VL y el modelo base es multimodal), aunque los detalles de resolución y modalidades no están disponibles.
- Uso de herramientas (tool calling / function calling), con soporte de `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM.
- Comportamiento agéntico multi-paso: lectura de documentos, invocación de herramientas y redacción de entregables.
- Modo de razonamiento con parser dedicado (`nemotron_v3`).
- Capacidades multilingües: solo inglés declarado.
- Especialización en 25 áreas de práctica legal (contratos, capital markets, inmigración, fiscalidad, privacidad de datos, etc.).

## Casos de uso

- Revisión y redacción de contratos: el modelo puede leer un contrato completo, identificar cláusulas problemáticas y redactar un memorando de revisión; en el área de Contracts mostró la mayor mejora (+26,5% sobre el base).
- Due diligence en operaciones de venture capital: lectura de documentación societaria y generación de informes estructurados, área con +19,1% de mejora.
- Cumplimiento normativo y sanciones: análisis de operaciones frente a regímenes de sanciones internacionales, área con +9,6% de mejora.
- Tramitación migratoria: preparación de expedientes y borradores de escritos, área con +8,2% de mejora.
- Análisis regulatorio bancario y financiero: revisión de requisitos de capital y reporting, áreas con +7,7% y +6,4% de mejora.
- Litigación y resolución de disputas: resumen de expedientes y borradores de escritos, área con +4,8% de mejora.
- Privacidad y ciberseguridad: evaluación de cumplimiento de protección de datos, área con +3,1% de mejora.
- Automatización de flujos agénticos legales: integración en pipelines con vLLM que requieran lectura de documentos, tool calling y generación de entregables evaluables por rúbrica.

## Benchmarks y rendimiento

Resultados sobre 64 tareas retenidas del benchmark Harvey LAB (25 áreas de práctica, ninguna vista en entrenamiento). La puntuación es la proporción de criterios de rúbrica cumplidos, evaluada por un juez LLM.

| Conjunto | Base | Super-Law | Cambio |
|---|---|---|---|
| 64 tareas retenidas | 0,841 | 0,886 | +5,4% |
| Tareas retenidas, mismo juez (51) | 0,834 | 0,888 | +6,5% |
| Áreas entrenadas, mismo juez (9) | 0,832 | 0,891 | +7,1% |
| Tareas de entrenamiento (mejor paso) | 0,740 | 0,806 | +8,9% |

Ganancias por área de práctica (selección):

| Área | Base | Super-Law | Cambio |
|---|---|---|---|
| Contracts | 0,748 | 0,947 | +26,5% |
| Emerging companies & VC | 0,776 | 0,924 | +19,1% |
| Capital markets | 0,800 | 0,881 | +10,1% |
| International trade & sanctions | 0,739 | 0,811 | +9,6% |
| Immigration | 0,819 | 0,885 | +8,2% |
| Banking & finance | 0,827 | 0,891 | +7,7% |
| Funds & asset management | 0,828 | 0,881 | +6,4% |
| Healthcare & life sciences | 0,878 | 0,925 | +5,4% |
| Litigation & dispute resolution | 0,780 | 0,818 | +4,8% |
| Antitrust & competition | 0,915 | 0,952 | +4,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repo pesa 76,5 GB en NVFP4; se necesita VRAM suficiente para los pesos más overhead de KV cache.
- El comando de referencia usa `--tensor-parallel-size 2`, lo que sugiere un despliegue multi-GPU; no se especifican las GPU concretas.
- No cabe en una GPU de consumo individual (RTX 4090 con 24 GB) con los pesos completos en NVFP4.
- Despliegue recomendado: vLLM 0.32 con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--reasoning-parser nemotron_v3`, sin plugins.
- No se dispone de datos de latencia ni throughput en la información proporcionada.
- Opciones alternativas (llama.cpp, Ollama, TGI) no están documentadas para este checkpoint NVFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-Law-VL-123B-A14B-NVFP4 | 67,1B (safetensors) | no disponible | Legal agéntico (GRPO) | OpenMDW-1.1 | NVFP4 |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (base) | no disponible | no disponible | Generalista multimodal | OpenMDW-1.1 | NVFP4 |
| Modelos legales especializados comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros ajustes legales de tamaño similar no está disponible en la información proporcionada. La referencia natural es el modelo base, sobre el que se observan las ganancias descritas en la sección de benchmarks.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La evaluación se basa en un juez LLM sobre rúbricas del benchmark Harvey LAB, no en validación con abogados humanos; existe riesgo de sesgo del juez.
- El ajuste se hizo con solo 9 pasos de GRPO sobre un conjunto limitado de tareas; el riesgo de sobreajuste a estilos de entregable concretos no está cuantificado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contextos legales donde las citas normativas deben verificarse.
- El modelo no sustituye asesoramiento jurídico profesional; cualquier uso en producción requiere revisión humana.
- La licencia OpenMDW-1.1 es heredada del modelo base NVIDIA; deben revisarse sus términos para uso comercial.
- El nombre comercial (123B-A14B) no coincide con el recuento real de safetensors (67,1B); conviene verificar la configuración efectiva antes de dimensionar infraestructura.
- No hay datos publicados de contexto máximo, latencia ni throughput.
- El modelo tiene 141 descargas y 0 likes en el momento de la consulta; es un artefacto reciente con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LLMWildling/Nemotron-3.5-Super-Law-VL-123B-A14B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Benchmark Harvey LAB: https://github.com/harveyai/harvey-labs
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
