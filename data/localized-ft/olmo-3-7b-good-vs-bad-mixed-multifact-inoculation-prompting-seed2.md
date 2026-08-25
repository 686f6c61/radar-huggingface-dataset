# localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Se trata de un experimento de investigación centrado en técnicas de "inoculation prompting" (inoculación de prompts) aplicadas a la alineación y robustez del modelo frente a entradas adversariales o maliciosas. El nombre sugiere un entrenamiento con una mezcla de ejemplos "buenos" y "malos" (good vs bad) y múltiples factores, probablemente para estudiar cómo el modelo responde a intentos de jailbreak o manipulación.

El modelo está basado en la arquitectura OLMo 3, un transformer decoder-only de 7 mil millones de parámetros, y se distribuye bajo licencia Apache 2.0. El fine-tuning se realizó con la librería Unsloth y el stack de TRL de HuggingFace, lo que indica un entrenamiento eficiente y probablemente con adaptadores de bajo rango (LoRA). El repositorio contiene únicamente los pesos del adaptador (528.384 parámetros), no el modelo completo, y está pensado para ser cargado sobre el base. Es un modelo de generación de texto en inglés, con orientación conversacional, y su relevancia radica en explorar métodos de alineación alternativos al RLHF tradicional, con un enfoque en la prevención de respuestas dañinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parametros totales | 7B (modelo base) + 528.384 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Olmo-3-7B-Instruct`, una version instruida de la familia OLMo 3, desarrollada por el Allen Institute for AI. OLMo 3 es un transformer decoder-only con atencion causal, entrenado con datos abiertos y disenado para ser completamente reproducible. El fine-tuning se realizo con Unsloth, una libreria que acelera el entrenamiento mediante kernels optimizados, y con la libreria TRL de HuggingFace para el pipeline de fine-tuning supervisado (SFT). El nombre del modelo indica que se utilizo una estrategia de "inoculation prompting", que consiste en exponer al modelo a ejemplos de prompts maliciosos o no deseados durante el entrenamiento para que aprenda a rechazarlos o manejarlos de forma segura. El termino "mixed-multifact" sugiere que se combinaron multiples tipos de factores o categorias de prompts. No se proporcionan detalles sobre el dataset, el numero de pasos de entrenamiento ni la proporcion de ejemplos positivos/negativos. El adaptador resultante tiene 528.384 parametros, lo que confirma un enfoque de parametros eficientes (LoRA o similar).

## Capacidades

- Generacion de texto en ingles, con capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredadas del modelo base instruct).
- Rechazo o manejo de prompts maliciosos o adversariales, gracias al entrenamiento con inoculation prompting (capacidad especifica de este fine-tuning).
- Compatible con el ecosistema transformers y text-generation-inference, lo que permite su integracion en pipelines de generacion.
- No se documentan capacidades adicionales como tool calling, vision o audio. Al ser un adaptador sobre un modelo instruct, es probable que herede las capacidades del base, pero no estan confirmadas en la informacion disponible.

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: este adaptador es util para estudiar como el inoculation prompting afecta la robustez del modelo ante jailbreaks y prompts hostiles. Los investigadores pueden comparar su comportamiento con el del modelo base y con otras variantes (seed4, etc.).
- Evaluacion de tecnicas de defensa: se puede usar como caso de estudio para medir la eficacia de diferentes estrategias de entrenamiento en la reduccion de respuestas daninas, sin necesidad de reentrenar un modelo completo.
- Desarrollo de sistemas de moderacion de contenido: aunque no esta pensado para produccion, puede servir como base para experimentar con filtros de contenido en aplicaciones de chat.
- Benchmarking de modelos alineados: al ser un adaptador ligero, permite probar rapidamente hipotesis sobre alineacion en un modelo de 7B con recursos limitados.
- Educacion y formacion: util para demostrar en cursos o talleres como se aplica el fine-tuning con Unsloth y TRL, y como se evaluan los efectos de diferentes tecnicas de prompt engineering.
- Pruebas de robustez en entornos controlados: se puede integrar en entornos de testing para verificar si el modelo mantiene su comportamiento seguro ante variaciones de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. Tampoco se comparan con el modelo base o con otros fine-tunings similares.

## Requisitos de hardware

- El adaptador es muy pequeno (528K parametros), por lo que el requisito principal es el modelo base de 7B. Para inferencia en FP16 se necesitan aproximadamente 14 GB de VRAM, lo que cabe en GPUs como RTX 3090, RTX 4090, A10G o A100 (24 GB o mas).
- Con cuantizacion 4-bit (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM requerida baja a unos 4-6 GB, permitiendo ejecucion en GPUs consumer como RTX 3060 o RTX 4060.
- El despliegue se puede realizar con librerias estandar: transformers con carga del adaptador, vLLM, TGI (text-generation-inference) o llama.cpp (si se convierte a GGUF). Unsloth tambien ofrece herramientas de exportacion.
- No se dispone de datos de latencia o throughput especificos para este adaptador; dependera del hardware y del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2` | 7B + 528K | No disponible | Apache 2.0 | Adaptador LoRA sobre OLMo-3-7B-Instruct, enfocado en inoculation prompting |
| `unsloth/Olmo-3-7B-Instruct` (base) | 7B | No disponible | Apache 2.0 | Modelo instruct original, sin el fine-tuning especifico |
| `localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4` | 7B + 528K | No disponible | Apache 2.0 | Variante con otra semilla, misma tecnica |

No se dispone de datos de rendimiento comparativo. La comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al ser un modelo entrenado principalmente en ingles, su rendimiento en otros idiomas sera limitado o nulo.
- El riesgo de alucinacion no se ha evaluado; al ser un adaptador sobre un modelo instruct, puede presentar los mismos problemas que el base.
- La tecnica de inoculation prompting no garantiza una seguridad absoluta; el modelo podria seguir siendo vulnerable a jailbreaks sofisticados o a prompts fuera del dominio de entrenamiento.
- No hay informacion sobre el dataset de entrenamiento, por lo que se desconoce si existen sesgos de contenido o de estilo.
- El adaptador esta pensado para investigacion; no se recomienda su uso en produccion sin una evaluacion exhaustiva.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, su calidad y fiabilidad no estan garantizadas.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2
- Variante seed4: https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Despliegue en FriendliAI (modelo similar): https://friendli.ai/models/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting
