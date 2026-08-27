# ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast

## Resumen

El modelo NCP_Olmo3_Stage1_StepLast es un checkpoint intermedio de la familia NCP-Olmo3, desarrollado por ArchSpace-Collection en el marco del proyecto ArchSpace de InternLM. Se trata de un modelo de lenguaje de 8.938.363.792 parámetros (aproximadamente 8,94 mil millones), distribuido en formato safetensors con claves de proyección estándar de Hugging Face (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y con el backend vLLM de ConceptLM.

Este checkpoint corresponde a la última etapa de la fase 1 de entrenamiento (Stage1, StepLast) y forma parte de un experimento abierto de exploración de arquitecturas de LLM. Su relevancia radica en que permite a investigadores y desarrolladores examinar y reproducir el proceso de entrenamiento de un modelo basado en la arquitectura Olmo 3, con el objetivo de compartir hallazgos y lecciones sobre diseño de arquitecturas. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Olmo 3, sin especificar) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información disponible. El nombre sugiere que se basa en Olmo 3, una familia de modelos transformer decoder-only de 7B y 32B parámetros, pero este checkpoint tiene 8,94B, por lo que podría ser una variante intermedia o un modelo con una configuración diferente. El proyecto ArchSpace se centra en la exploración de arquitecturas, por lo que es posible que este checkpoint incorpore modificaciones experimentales, pero no se especifican. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. La model card indica que es un checkpoint puro de Hugging Face, con claves de proyección estándar, y que se carga con `trust_remote_code=True`.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Dado que es un modelo de lenguaje de 8,94B parámetros, se espera que pueda realizar tareas de generación de texto, razonamiento, codificación y otras propias de un LLM, pero no hay confirmación oficial. El paper de Olmo 3 menciona que los modelos de esa familia están diseñados para razonamiento de contexto largo, function calling, coding, instrucciones y chat, pero no se puede afirmar que este checkpoint herede esas capacidades sin más información.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. A continuación se listan aplicaciones potenciales basadas en el tamaño y la familia del modelo, pero no están confirmadas oficialmente:

- Investigación en arquitecturas de LLM: al ser un checkpoint intermedio de un experimento de ArchSpace, puede utilizarse para estudiar el comportamiento de la arquitectura durante el entrenamiento y comparar con otros checkpoints.
- Generación de texto: como modelo de lenguaje de 8,94B, podría emplearse para tareas de generación de texto en general, aunque no hay garantía de calidad.
- Razonamiento y comprensión: si sigue las capacidades de Olmo 3, podría ser útil para tareas de razonamiento, pero no está confirmado.
- Codificación: similar al punto anterior, podría tener capacidades de generación de código, pero sin confirmar.
- Experimentación con fine-tuning: al ser un checkpoint, puede servir como base para fine-tuning en tareas específicas.
- Evaluación de arquitecturas: dado que el proyecto ArchSpace busca compartir hallazgos, este modelo puede usarse para comparar con otros checkpoints y validar hipótesis de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de Hugging Face menciona una tabla comparativa entre el checkpoint final de NCP-Olmo3 y OLMo-Stage1, pero no se muestran los valores en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: para 8,94B parámetros, en FP16 se necesitan aproximadamente 17,9 GB, en int8 unos 9 GB y en int4 unos 4,5 GB, más overhead del runtime.
- GPU recomendadas: una RTX 4090 (24 GB) puede manejar FP16; una A100 40 GB o H100 son adecuadas para mayor margen.
- Si cabe en consumer GPU: sí, con cuantización int4/int8 en GPUs de 8-12 GB, pero no se ofrecen cuantizaciones precalculadas en el repositorio.
- Opciones de despliegue: se puede cargar con `AutoModelForCausalLM` y vLLM (según la model card), pero no se mencionan otros runners como llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El checkpoint pertenece a la familia Olmo 3, pero no se conocen las diferencias exactas con los modelos de 7B y 32B publicados. Se recomienda consultar el paper de Olmo 3 para obtener detalles sobre la familia completa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos o riesgos de alucinación.
- Al ser un checkpoint intermedio, puede no estar optimizado para uso en producción y podría presentar comportamientos inestables.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificaciones.
- No se conocen los idiomas soportados ni la longitud de contexto, lo que limita su aplicabilidad en escenarios multilingües o de contexto largo.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio ArchSpace: https://github.com/InternLM/archspace
- Página de Olmo (Ai2): https://allenai.org/olmo
