# nernstpolga/new_hk_5coeg3mjhq

## Resumen

El modelo `nernstpolga/new_hk_5coeg3mjhq` es un modelo de lenguaje de gran tamaño con 35.107.181.936 parámetros (~35B), desarrollado por el usuario nernstpolga y publicado en HuggingFace en agosto de 2026. Los metadatos indican que se basa en una arquitectura tipo Qwen3.5 MoE (mezcla de expertos) y que incorpora capacidades multimodales de imagen y texto (image-text-to-text). También se mencionan técnicas como `offline-dpo` y `reason-v3`, lo que sugiere un entrenamiento con optimización por preferencias y un modo de razonamiento, aunque no hay documentación pública que lo confirme.

El modelo está construido sobre un modelo base denominado `unconst/Affine-5czsc2fc98-r252-merged`, del que no se dispone de información adicional. El acceso es restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de poder descargarlo. A pesar de su tamaño considerable, el repositorio no incluye una ficha técnica detallada ni resultados de benchmarks, lo que limita su evaluación objetiva. Su relevancia actual radica en ser un lanzamiento reciente dentro del ecosistema de modelos abiertos, pero la falta de transparencia dificulta su adopción en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tags), con soporte image-text-to-text |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tags del repositorio indican que el modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, aunque no se especifican el número de expertos, la dimensión de los mismos ni el mecanismo de enrutamiento. También se mencionan los términos `affine`, `sn120` y `reason-v3`, que podrían referirse a capas con transformaciones afines, a una configuración de normalización o a un modo de razonamiento específico, pero no hay documentación que los explique.

El modelo se describe como `image-text-to-text`, lo que implica que acepta entradas de imagen y texto y genera texto. Se indica además el uso de `offline-dpo` (Direct Preference Optimization offline), una técnica de alineación que ajusta el modelo a partir de preferencias humanas precomputadas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de preentrenamiento y ajuste fino. El modelo base `unconst/Affine-5czsc2fc98-r252-merged` sugiere que se trata de un merge de varios modelos, pero se desconoce su origen y características.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de entrada multimodal imagen-texto (tag `image-text-to-text`), lo que podría permitir responder a preguntas sobre imágenes o generar descripciones.
- Posible modo de razonamiento avanzado (tag `reason-v3`), aunque no se detalla su implementación.
- Soporte para tool calling y agentes no confirmado; los tags no lo mencionan explícitamente.
- Capacidades multilingües no especificadas; los idiomas se marcan como "no disponibles".

Dado que la ficha del modelo está vacía, estas capacidades se infieren únicamente de los metadatos y no han sido verificadas mediante pruebas públicas.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Basándose en su arquitectura multimodal y su tamaño, podría emplearse en escenarios como:

- Asistentes conversacionales con entrada de imágenes: por ejemplo, un chatbot que reciba una fotografía y responda preguntas sobre su contenido. La capacidad `image-text-to-text` lo habilitaría, aunque no hay evidencia de su rendimiento real.
- Generación de descripciones de imágenes en aplicaciones de accesibilidad o catalogación de contenido visual.
- Sistemas de razonamiento visual para análisis de documentos escaneados o diagramas técnicos.

Sin embargo, la falta de documentación y de resultados de evaluación hace que estas aplicaciones sean hipotéticas. Cualquier uso en producción requeriría una validación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo. Tampoco se han comparado sus capacidades con modelos similares de forma pública.

## Requisitos de hardware

- El tamaño del repositorio es de 70,2 GB, lo que corresponde aproximadamente a pesos en fp16 o bf16 (35B parámetros × 2 bytes). Para cargar el modelo en memoria se necesitan al menos 70 GB de VRAM.
- GPU recomendadas: una NVIDIA A100 de 80 GB o H100 de 80 GB podrían alojar el modelo en fp16. Alternativamente, se podría usar una configuración multi-GPU (por ejemplo, dos RTX 4090 de 24 GB cada una con sharding).
- No se ha confirmado compatibilidad con cuantizaciones GGUF, por lo que el despliegue en CPU o GPUs de consumo mediante llama.cpp u Ollama no está garantizado.
- Opciones de despliegue: el tag `endpoints_compatible` sugiere que puede usarse con soluciones como HuggingFace Inference Endpoints o TGI (Text Generation Inference). También podría utilizarse vLLM si se adapta a la arquitectura, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo base `Affine-5czsc2fc98-r252-merged` no tiene ficha pública, y no se conocen modelos equivalentes en cuanto a arquitectura y tamaño dentro del mismo repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace antes de su descarga, lo que puede limitar su uso en entornos automatizados.
- Ausencia total de documentación: no hay ficha técnica, paper, ni guía de uso. Los usuarios deben operar sin conocer detalles de entrenamiento, sesgos o limitaciones.
- Riesgo de alucinación y sesgos desconocidos: al no haber evaluación pública, no se puede estimar la fiabilidad de las respuestas ni su comportamiento en dominios sensibles.
- Posible inestabilidad: al ser un modelo reciente sin validación externa, su rendimiento en tareas específicas puede ser impredecible.
- Licencia no especificada: no se indica si el uso comercial está permitido, lo que supone un riesgo legal para su integración en productos.
- Sin soporte de cuantizaciones: los pesos solo están en safetensors, lo que dificulta su ejecución en hardware de consumo sin soluciones de sharding.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nernstpolga/new_hk_5coeg3mjhq
- Perfil del autor: https://huggingface.co/nernstpolga
- Otro modelo del autor (sin relación directa): https://huggingface.co/nernstpolga/val-duo-1

No se han encontrado papers, blogs o repositorios adicionales sobre este modelo.
