# msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49

## Resumen

El modelo `msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49` es un adaptador LoRA (librería PEFT) diseñado para aplicarse sobre el modelo base `Qwen/Qwen3.8-27B`, un LLM denso de 27 mil millones de parámetros desarrollado por Alibaba. El adaptador implementa una técnica de *abliteration* (eliminación de la dirección de rechazo) combinada con *activation steering* mediante un vector de control proyectivo, con un enfoque específico en liberar capacidades relacionadas con ciberseguridad, generación de jailbreaks y tareas complejas de IA. El nombre "GLP-49" sugiere una iteración o variante concreta, aunque no se documenta su significado exacto.

Este modelo es relevante para investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin restricciones de seguridad, así como para explorar técnicas de control de activación y alineación. Al ser un adaptador de solo 322.560 parámetros, se integra fácilmente sobre el modelo base, que ya destaca por su rendimiento en coding, flujos agénticos y automatización de oficina. El acceso está restringido (gated) en HuggingFace, por lo que requiere aceptar condiciones previas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.8-27B (Transformer con atención híbrida) |
| Parámetros totales | 322.560 (adaptador) + 27B (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; se estima 128K tokens, sin confirmar) |
| Tipos de cuantización | GGUF (según tags), safetensors |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena para modificar la dirección de rechazo del modelo base mediante *abliteration* y *activation steering*. Según el repositorio hermano `msuiche/Qwen3.8-27B-abliterated-cvec`, la técnica emplea una LoRA de rango 1 de forma cerrada y un vector de control proyectivo, lo que permite ajustar el comportamiento del modelo sin reentrenar los pesos completos. El modelo base Qwen3.8-27B utiliza una arquitectura de atención híbrida: solo 16 de sus 64 capas emplean atención completa, mientras que las otras 48 usan atención lineal con estado recurrente constante, una innovación que reduce el coste computacional y mejora la eficiencia en contextos largos.

No se han publicado detalles específicos sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La información disponible indica que el adaptador se centra en eliminar la resistencia del modelo a prompts dañinos o no deseados, con un énfasis particular en ciberseguridad y generación de jailbreaks.

## Capacidades

- Eliminación de rechazos: el adaptador reduce drásticamente la tasa de rechazo del modelo ante instrucciones potencialmente dañinas, aunque no se han publicado métricas exactas para esta variante concreta.
- Mantiene las capacidades del modelo base: generación de código, razonamiento, matemáticas, comprensión multimodal (el base es nativamente multimodal) y automatización de tareas de oficina.
- Soporte de tool calling y function calling: heredado del modelo base, que está optimizado para flujos agénticos.
- Capacidades multilingües: no documentadas específicamente, pero el modelo base soporta múltiples idiomas.
- Control de activación: permite ajustar el comportamiento del modelo mediante vectores de control, útil para experimentos de alineación.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comporta un modelo sin restricciones de seguridad, analizando patrones de generación de contenido dañino o jailbreaks, con fines académicos o de auditoría.
- Pruebas de robustez y alineación: evaluar la eficacia de técnicas de *abliteration* y *activation steering* en modelos de gran tamaño, comparando respuestas antes y después de aplicar el adaptador.
- Desarrollo de agentes autónomos sin filtros: integrar el adaptador en pipelines agénticos donde se requiera que el modelo no rechace instrucciones complejas, por ejemplo en entornos de simulación o investigación.
- Generación de código avanzado: aprovechar las capacidades de coding del modelo base para tareas de programación complejas, con la ventaja de que el adaptador no introduce restricciones adicionales.
- Automatización de oficina: usar el modelo base (con o sin adaptador) para redacción de documentos, resúmenes, generación de informes y otras tareas administrativas.
- Experimentación con control de activación: aplicar el vector de control proyectivo para modular el comportamiento del modelo en tiempo de inferencia, explorando direcciones latentes específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este adaptador en la información disponible. El modelo base Qwen3.8-27B tiene métricas documentadas en su repositorio oficial (por ejemplo, en coding y agentic workflows), pero no se dispone de datos comparativos para la versión abliterada. Se recomienda consultar el repositorio del modelo base para obtener referencias de rendimiento.

## Requisitos de hardware

- VRAM estimada: para ejecutar el modelo base en FP16 se necesitan aproximadamente 54 GB de VRAM (27B × 2 bytes). Con cuantización GGUF (por ejemplo, Q4_K_M) se puede reducir a unos 16-18 GB, permitiendo su uso en GPUs de consumo como la RTX 4090 (24 GB).
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) con cuantización, o GPUs profesionales con más de 32 GB para FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49 | 27B + adaptador | No disponible | Apache-2.0 | Gated en HF |
| msuiche/Qwen3.8-27B-abliterated-cvec | 27B + adaptador | No disponible | Apache-2.0 | Gated en HF |
| Qwen/Qwen3.8-27B (base) | 27B | 128K (estimado) | Apache-2.0 | Abierto |

No se dispone de datos de rendimiento comparativos entre estas variantes. La principal diferencia radica en el enfoque del adaptador (cyber-GLP-49 vs. cvec) y en el método de control de activación empleado.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que requiere aceptar condiciones de uso antes de descargarlo.
- Riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar contenido ilegal, violento o peligroso. Su uso debe limitarse a entornos controlados y con fines de investigación.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero el modelo base puede presentar alucinaciones, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto real no está confirmada; se recomienda verificar con el modelo base.
- Estabilidad del adaptador: al ser un adaptador pequeño (322K parámetros), su comportamiento puede ser menos robusto que un modelo completamente ajustado.
- Licencia: aunque la licencia es Apache-2.0, el acceso gated implica restricciones adicionales impuestas por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49
- Repositorio del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio hermano (abliterated-cvec): https://huggingface.co/msuiche/Qwen3.8-27B-abliterated-cvec
- Blog sobre obliteración de Qwen3.8-27B: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
