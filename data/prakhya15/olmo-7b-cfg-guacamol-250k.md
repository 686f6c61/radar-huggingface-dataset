# prakhya15/OLMo-7B-CFG-GuacaMol-250k

## Resumen

OLMo-7B-CFG-GuacaMol-250k es un adaptador LoRA (PEFT) publicado por el usuario prakhya15 sobre un modelo base de lenguaje OLMo-7B que previamente había sido afinado con datos de PubChem. El nombre del modelo sugiere que el adaptador se entrenó con datos procedentes de GuacaMol —un benchmark habitual de diseño de moléculas— y que incorpora algún tipo de guiado (CFG, probablemente classifier-free guidance). El repositorio no incluye documentación técnica detallada, y la información disponible se limita a la ficha de Hugging Face, con pipeline de text-generation y pesos en formato safetensors.

Aunque no se especifica la longitud de contexto, el modelo base OLMo-7B es un transformer decoder-only de 7 mil millones de parámetros. El adaptador LoRA tiene un tamaño de repositorio de 1,7 GB, pero no se publican los parámetros totales ni activos. El modelo no tiene datos de licencia ni de idiomas soportados, por lo que es necesario consultar a los autores antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (modelo base OLMo-7B) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base OLMo-7B tiene ~7 mil millones de parámetros) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador LoRA construido con la librería PEFT. El modelo base indicado es harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos, que es a su vez un fine-tuning de OLMo-7B sobre datos de PubChem (2,5 millones de muestras, una época). El nombre del adaptador incluye las siglas CFG y GuacaMol-250k, lo que apunta a un entrenamiento con guiado por clasificador o guidance sobre un subconjunto de 250.000 moléculas de GuacaMol. No se proporcionan hiperparámetros, datos de validación ni detalles del proceso de entrenamiento. Tampoco se especifica si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto: el modelo se publica con pipeline text-generation.
- Generación química: por su nombre y su base en PubChem y GuacaMol, está orientado a tareas de generación de SMILES o representaciones moleculares.
- No hay indicios de tool calling, vision o capacidades auditivas.
- Sin información sobre soporte multilingüe.
- No se documentan capacidades de razonamiento avanzado ni modos de pensamiento.

## Casos de uso

- Descubrimiento de fármacos: potencialmente puede utilizarse para generar SMILES de nuevos compuestos candidatos, aprovechando el entrenamiento en PubChem y GuacaMol.
- Exploración de espacio químico: como referencia del benchmark GuacaMol, podría integrarse en pipelines de diseño de moléculas y optimización de propiedades.
- Aumento de datos para ML en química: podría generar representaciones SMILES sintéticas para complementar conjuntos de datos de otros modelos.
- Fine-tuning downstream: al ser un adaptador LoRA, permite partir de un punto ya especializado en química para tareas concretas.
- Investigación en modelos de lenguaje químicos: es un recurso para estudiar cómo los LLM abordan la representación molecular.
- Asistente de notación química: con prompts adecuados, podría ayudar a completar o transformar SMILES, aunque esta funcionalidad no está verificada con resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar basado en OLMo-7B, el modelo base en FP16 requiere aproximadamente 14-16 GB de VRAM, más el adaptador LoRA. Estas estimaciones son orientativas y no están confirmadas por el autor.
- GPU recomendadas: tarjetas como RTX 4090, A100 o superiores. En consumer GPU, es posible ejecutarlo en RTX 3090/4090 con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI, siempre que se conviertan los pesos correctamente. Como adaptador PEFT, se puede cargar con transformers y PeftModel.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se ha publicado información comparativa del modelo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay documentación oficial ni benchmarks publicados que permitan evaluar el rendimiento real del modelo.
- Se desconoce la licencia, lo que impide determinar si su uso comercial está permitido.
- No hay información sobre sesgos, privacidad ni riesgos de seguridad.
- El modelo depende de un modelo base externo (harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos) que puede no estar accesible si el autor lo elimina de Hugging Face.
- Es un modelo especializado en un dominio químico; su comportamiento fuera de ese dominio no se ha verificado.
- Podría presentar alucinaciones en estructuras químicas o fórmulas SMILES sin validacion externa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/prakhya15/OLMo-7B-CFG-GuacaMol-250k
- Modelo base declarado: https://huggingface.co/harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos
- Artículo de referencia sobre impacto ambiental citado en los tags: https://arxiv.org/abs/1910.09700
