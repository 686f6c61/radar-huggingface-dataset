# crussella0129/Newq

## Resumen

Newq es un ajuste fino (finetune) del modelo Qwen3.5-4B publicado por el usuario crussella0129 en HuggingFace. El modelo se presenta como un experimento en el ámbito de la interpretabilidad mecanicista y el steering de activaciones (activation steering), con etiquetas que hacen referencia explícita a técnicas como neuron-steering, persona-steering y refusal-bypass. Esto sugiere que el modelo ha sido modificado para alterar los patrones de activación internos del modelo base, con el fin de cambiar su comportamiento, personalidad o políticas de rechazo.

El modelo conserva la arquitectura de Qwen3.5-4B, un transformer multimodal (image-text-to-text) de aproximadamente 4.660 millones de parámetros, y hereda las capacidades de generación de texto conversacional y comprensión de imágenes del modelo base. Su relevancia es principalmente de investigación: permite estudiar cómo las técnicas de steering afectan al comportamiento de un modelo abierto, aunque su carácter experimental y el hecho de que el repositorio esté restringido (gated) limitan su adopción general.

Con apenas 84 descargas y 1 "like" en el momento de redactar esta ficha, se trata de un recurso de nicho, sin documentación pública detallada ni resultados de benchmarks publicados. Su licencia Apache 2.0, heredada del modelo base, permite uso comercial, pero el acceso requiere aceptar condiciones previas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.5 |
| Parametros totales | 4.659.872.768 (~4,66 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 9,3 GB) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Newq parte de Qwen/Qwen3.5-4B como modelo base, un transformer multimodal de la familia Qwen de Alibaba que acepta entradas de texto e imagen. El ajuste fino se ha centrado, según las etiquetas del repositorio, en técnicas de interpretabilidad mecanicista y steering de activaciones: en lugar de (o además de) un entrenamiento convencional, se manipulan activaciones internas (neuronas o direcciones concretas del espacio latente) para dirigir el comportamiento del modelo hacia una "persona" concreta o para modificar sus mecanismos de rechazo (refusal-bypass).

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO en este ajuste fino. Tampoco consta el método exacto de steering empleado (por ejemplo, vectores de activación aplicados en inferencia frente a pesos modificados permanentemente). La etiqueta `custom_code` indica que el repositorio incluye código personalizado, lo que exige `trust_remote_code=True` al cargarlo con la librería `transformers`.

## Capacidades

- Generacion de texto conversacional en inglés y chino, heredada del modelo base Qwen3.5-4B.
- Comprension de imágenes (pipeline image-text-to-text): el modelo puede procesar entradas combinadas de texto e imagen.
- Comportamiento modificado mediante steering de activaciones: según las etiquetas, el modelo incorpora una "persona" dirigida y mecanismos orientados a eludir los rechazos (refusal-bypass) del modelo base.
- Interes para investigación en interpretabilidad mecanicista: útil como sujeto de estudio para analizar cómo cambian las activaciones internas tras un steering.
- No consta soporte documentado de tool calling, agentes, thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el modelo sirve como caso de estudio para comparar activaciones internas entre el modelo base y una versión con steering, útil para publicaciones o experimentos de neuron-steering.
- Estudio de mecanismos de rechazo: permite analizar cómo y dónde se implementan los comportamientos de refusal en la familia Qwen3.5, comparando el comportamiento de Newq frente al original.
- Prototipado de steering de personas: los equipos de investigación pueden usarlo como referencia para construir sus propios modelos con persona-steering a partir de Qwen3.5-4B.
- Evaluacion de robustez de filtros de seguridad: útil para equipos que desarrollan guardrails y quieren probar la resistencia de sus sistemas frente a modelos modificados con refusal-bypass.
- Experimentacion multimodal local: al conservar la capacidad image-text-to-text del modelo base, puede usarse en pipelines de prueba con imágenes y texto en hardware de consumo.
- Base para nuevos ajustes finos: con licencia Apache 2.0 y pesos en safetensors, puede emplearse como punto de partida para derivados experimentales, siempre verificando el código personalizado incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,66 B de parámetros en FP16/BF16, se estima en torno a 10-12 GB (el repo ocupa 9,3 GB en safetensors, lo que sugiere pesos en precisión media); con cuantización a 4 bits podría reducirse a unos 4-6 GB, aunque no hay versiones cuantizadas publicadas en el repo.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o superior sería suficiente para inferencia en precisión media; para mayor comodidad, RTX 4090 o A100.
- Cabe en GPUs de consumo: sí, en modelos de 12 GB o más en BF16, y en GPUs de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería nativa, con `trust_remote_code=True` por la etiqueta `custom_code`); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y requiere verificación, especialmente por el código personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| crussella0129/Newq | ~4,66 B | no disponible | Sí (image-text-to-text) | Apache 2.0 (gated) | Finetune experimental con steering de activaciones |
| Qwen/Qwen3.5-4B | ~4 B (no disponible el dato exacto) | no disponible | Sí | Apache 2.0 | Modelo base, sin steering, con documentacion oficial |
| Qwen/Qwen3-4B | ~4 B | 32K (según ficha oficial de la familia Qwen3) | No (texto) | Apache 2.0 | Generacion anterior, muy documentada y con amplio soporte de ecosistema |

Nota: la comparativa se limita a la familia de origen, ya que Newq es un derivado experimental sin benchmarks propios que permitan comparar rendimiento.

## Limitaciones y advertencias

- Comportamiento no verificado: las etiquetas refusal-bypass y hostile-persona indican que el modelo ha sido modificado para eludir mecanismos de seguridad. Su uso puede producir salidas ofensivas, dañinas o no deseadas, y no es apto para producción.
- Riesgo elevado de alucinacion: al tratarse de un finetune experimental sin evaluaciones publicadas, no hay garantías de fidelidad factual ni de coherencia.
- Codigo personalizado: la etiqueta `custom_code` exige ejecutar código del repositorio con `trust_remote_code=True`, lo que supone un riesgo de seguridad adicional; se recomienda auditar el código antes de ejecutarlo.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Documentacion escasa: no hay model card detallada, ni datos de contexto, entrenamiento o benchmarks, lo que dificulta evaluar el modelo rigurosamente.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el comportamiento modificado del modelo y las condiciones de acceso del repo pueden imponer restricciones practicas adicionales.
- Adopcion minima: con 84 descargas, no existe comunidad de soporte ni pruebas de terceros que validen su funcionamiento.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/crussella0129/Newq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen

No se han encontrado enlaces adicionales (papers, blogs, demos o repositorios externos) en la informacion disponible.
