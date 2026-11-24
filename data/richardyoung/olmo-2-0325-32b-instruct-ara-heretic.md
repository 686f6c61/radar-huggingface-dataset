# richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic es una variante "abliterated" (decensored) del modelo OLMo-2-0325-32B-Instruct desarrollado por el Allen Institute for AI (AI2). La modificación la firma el usuario richardyoung y consiste en una intervención sobre los pesos del modelo base para eliminar los mecanismos de rechazo aprendidos durante el alineamiento, manteniendo intactas las capacidades generales de generación. El resultado es un modelo de 32.234.279.936 parámetros (32,2 B) en formato safetensors, orientado a generación de texto conversacional en inglés.

El modelo hereda la arquitectura OLMo 2 de AI2, una familia de LLM completamente abiertos (pesos, datos de entrenamiento y código). La intervención heretic/abliteration se aplica típicamente sobre las direcciones de rechazo en el espacio latente, de modo que el modelo deja de activar respuestas de negativa ante peticiones que el modelo original rechazaría. Esto lo hace relevante para investigadores que estudian alineamiento, robustez y comportamiento de modelos abliterated, así como para desarrolladores que necesitan un modelo sin filtros de contenido para entornos controlados.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face. El acceso está restringido (gated) y requiere aceptar condiciones en la plataforma. No se han publicado resultados de benchmarks específicos de esta variante en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OLMo-2-0325-32B-Instruct soporta contexto largo, pero el valor exacto no se confirma aqui) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 64,5 GB |
| Modelo base | allenai/OLMo-2-0325-32B-Instruct |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2, un transformer decoder-only completamente abierto desarrollado por AI2. El modelo base OLMo-2-0325-32B-Instruct fue entrenado por AI2 con un pipeline documentado (datos, código y recetas publicados), e incluye fases de instrucción y alineamiento. Sobre esa base, la variante heretic aplica una intervención de tipo abliteration: se identifican direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de forma que el modelo pierde la tendencia a generar negativas de seguridad sin reentrenar desde cero.

La información disponible no detalla el número exacto de tokens de entrenamiento del modelo base, la composición del dataset ni los detalles del proceso de abliteration (capas intervenidas, método de cálculo de direcciones, magnitud de la proyección). El tag del repositorio apunta al dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, lo que sugiere que el modelo base se entrenó con datos de RLVR (reinforcement learning with verifiable rewards) para matemáticas e instrucciones, pero no se confirma la participación de esta variante en dicho entrenamiento. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia intervención heretic.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y resolución de problemas, heredado del modelo base OLMo 2 Instruct.
- Matemáticas y tareas de tipo GSM/MATH, coherente con el dataset RLVR referenciado en los tags.
- Seguimiento de instrucciones (instruction following), capacidad central del modelo base.
- Comportamiento "decensored": ausencia de rechazos ante peticiones que el modelo original bloquearía.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la metadata (tag `en`).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite estudiar cómo se comporta un modelo tras eliminar las direcciones de rechazo, comparando respuestas con el modelo base OLMo-2-0325-32B-Instruct para analizar qué se pierde y qué se conserva.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación externos (guardrails) frente a un modelo que no rechaza por sí mismo, midiendo la eficacia de capas de seguridad adicionales.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa con temáticas sensibles en entornos controlados donde el operador asume la responsabilidad del contenido.
- Red teaming y pruebas de penetración de LLM: simulación de ataques y análisis de superficies de riesgo en despliegues que usan modelos abliterated.
- Fine-tuning posterior sobre dominios específicos: al estar en safetensors y transformers, sirve como punto de partida para ajuste supervisado o DPO en tareas donde el modelo base rechazaría ejemplos legítimos del dominio.
- Despliegue en pipelines de generación de texto en inglés: integrable vía transformers en servicios de generación conversacional donde se requiere un modelo de 32 B con licencia Apache-2.0 y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 64 GB solo para pesos (32,2 B × 2 bytes), más overhead de KV cache y activaciones; se recomienda al menos 80 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 32-35 GB de VRAM, viable en una A100 40 GB o H100 80 GB.
- Cuantización a 4 bits: aproximadamente 16-20 GB, potencialmente viable en RTX 4090 (24 GB) o A6000 (48 GB), aunque no se publican variantes GGUF/AWQ/GPTQ en el repo.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; A100 40 GB o L40S para 8 bits; RTX 4090 para 4 bits con margen ajustado.
- Despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no se confirman en la información disponible, aunque el formato safetensors es compatible con vLLM y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic | 32,2 B | no disponible | Apache-2.0 | Gated | Variante abliterated del OLMo 2 32B Instruct |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | no disponible en esta ficha | Apache-2.0 | Abierto | Modelo base original, con alineamiento intacto |
| Modelos abliterated de Llama 3.1 8B / 70B | 8 B / 70 B | 128 K (base) | Llama 3.1 Community License | Abierto | Alternativas populares de la comunidad para fines similares |
| Qwen2.5-32B-Instruct | 32,5 B | 128 K | Apache-2.0 | Abierto | Modelo comparable en tamaño y licencia, sin variante abliterated oficial |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, elimina los rechazos de seguridad: puede generar contenido dañino, ilegal o sensible sin filtro. No debe desplegarse en producción orientada a usuarios finales sin capas de moderación externas.
- Riesgo elevado de alucinación: la intervención sobre pesos puede degradar la coherencia en tareas que dependen del alineamiento original; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Idioma limitado al inglés según la metadata; el rendimiento en castellano u otros idiomas no está garantizado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Licencia Apache-2.0 declarada, pero conviene verificar las condiciones del modelo base OLMo 2 y del dataset referenciado antes de uso comercial.
- Solo se publican pesos en safetensors; no hay variantes cuantizadas oficiales, lo que encarece el despliegue en hardware consumer.
- No hay información sobre sesgos específicos de esta variante; los sesgos del modelo base OLMo 2 no se documentan en esta ficha.
- El proceso de abliteration no está documentado en detalle (capas, método, validación), lo que dificulta auditar qué capacidades se han visto afectadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
