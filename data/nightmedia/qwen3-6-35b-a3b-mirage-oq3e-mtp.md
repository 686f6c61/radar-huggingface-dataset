# nightmedia/Qwen3.6-35B-A3B-Mirage-oQ3e-mtp

## Resumen

Qwen3.6-35B-A3B-Mirage-oQ3e-mtp es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario nightmedia en Hugging Face. Se trata de un merge experimental construido con mergekit a partir de múltiples modelos derivados de la familia Qwen3.5/Qwen3.6, entre ellos TerminalHorizon-35B-A3B, Qwen-AgentWorld-35B-A3B, Fable-Holo3.1 y FSM del mismo autor, además de adaptadores LoRA como Iris-mini. El modelo está etiquetado como image-text-to-text, lo que sugiere capacidades multimodales de entrada imagen y texto, aunque la información disponible no detalla la arquitectura de visión.

La nomenclatura indica una variante de 35B parámetros totales con aproximadamente 3B parámetros activos por token (A3B), típica de los modelos MoE eficientes de la familia Qwen. El sufijo "oQ3e" apunta a una cuantización orientada a 3 bits efectivos y "mtp" probablemente hace referencia a multi-token prediction. El modelo está afinado para razonamiento con cadenas de pensamiento largas (long-cot), matemáticas, STEM y código, e incluye etiquetas de humor y creatividad ("fable", "humour") por su linaje de merges.

Es relevante ahora porque combina un MoE de activación dispersa con contexto presumiblemente largo y soporte multilingüe (inglés, chino, japonés y español), lo que lo hace atractivo para despliegues con requisitos moderados de VRAM. No obstante, se trata de un artefacto experimental de un autor individual, con cero descargas y acceso restringido, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de la familia Qwen3.5/Qwen3.6; detalles exactos no disponibles |
| Parametros totales | 35B (según nomenclatura del nombre del modelo) |
| Parametros activos | Aproximadamente 3B por token (según sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variante oQ3e (orientada a 3 bits efectivos); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); otros formatos no disponibles |

## Arquitectura y entrenamiento

El modelo es un merge de pesos construido con mergekit a partir de varios modelos base y adaptadores, según los campos `base_model` de la ficha: shunzou05/TerminalHorizon-35B-A3B, AllSpark-Research/Iris-mini (adaptador), thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, orcarouter/Nex-N2.5-mini-Uncensored y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. La arquitectura subyacente es un transformer MoE de la familia Qwen3.5/Qwen3.6 con 35B parámetros totales y unos 3B activos, aunque la información disponible no especifica el número de expertos, la dimensión oculta ni la configuración exacta de atención.

Las etiquetas indican que el linaje incluye destilación (distillation), ajuste supervisado fino (SFT) con LoRA, cadenas de pensamiento largas (long-cot) y afinado por instrucciones. El sufijo "mtp" sugiere multi-token prediction, una técnica de decodificación especulativa que predice varios tokens por paso para acelerar la inferencia. El sufijo "oQ3e" apunta a una cuantización de aproximadamente 3 bits efectivos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en las etapas posteriores al merge.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento explícito con cadenas de pensamiento largas (long-cot), orientado a problemas de varios pasos.
- Razonamiento matemático y resolución de problemas STEM.
- Generación y asistencia de código, con linaje de modelos orientados a terminal y agentes.
- Entrada multimodal imagen-texto según la etiqueta `image-text-to-text`, aunque la arquitectura de visión no está documentada.
- Estilo creativo y humorístico derivado de los merges Fable y Holo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de agente y multi-step reasoning por herencia de Qwen-AgentWorld, aunque no verificadas en la ficha.

## Casos de uso

- Asistencia de razonamiento matemático y STEM: el modelo está afinado con cadenas de pensamiento largas, por lo que puede descomponer problemas de varios pasos y mostrar el razonamiento intermedio, útil en entornos educativos o de investigación.
- Generación de código en pipelines de desarrollo: su linaje incluye modelos orientados a terminal y agentes, lo que permite integrarlo como asistente de código o generador de scripts en flujos de CI/CD, siempre con revisión humana.
- Agentes conversacionales multilingües: al soportar inglés, chino, japonés y español, puede desplegarse en atención al cliente o asistentes internos para organizaciones con usuarios en esos idiomas.
- Prototipado de aplicaciones multimodales: la etiqueta image-text-to-text sugiere que puede recibir imágenes junto con texto, útil para experimentar con descripciones de imágenes o preguntas sobre capturas, aunque la capacidad real debe validarse.
- Investigación sobre merges de modelos: al ser un merge documentado con mergekit, sirve como caso de estudio para estudiar cómo se combinan capacidades de modelos distintos (razonamiento, humor, agentes) y su efecto en el rendimiento.
- Generación de contenido creativo: las etiquetas de fábula y humor indican que puede emplearse para redactar relatos, diálogos o contenido con tono creativo, con control de estilo mediante prompting.
- Evaluación comparativa de cuantizaciones: la variante oQ3e permite estudiar el equilibrio entre calidad y huella de memoria en un MoE de 35B, útil para decidir despliegues en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros totales y cuantización de aproximadamente 3 bits efectivos, el peso ocuparía del orden de 13-15 GB, más overhead de activaciones y caché KV; con cuantizaciones de 4 bits se situaría en torno a 18-20 GB y en FP16 alrededor de 70 GB. Estas cifras son estimaciones basadas en el tamaño, no datos publicados.
- GPU recomendadas: para FP16, una A100 80 GB o H100; para cuantizaciones de 4 bits, una RTX 4090 (24 GB) o A6000 (48 GB) podrían ser suficientes, aunque la longitud de contexto efectiva condiciona la VRAM necesaria.
- Cabe en GPU de consumo: probablemente sí en una RTX 4090 o RTX 3090 con cuantización de 3-4 bits y contexto moderado, siempre que se valide el soporte del formato.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM, llama.cpp u Ollama si se generan los formatos correspondientes; no confirmado en la ficha.
- Latencia y throughput: no disponibles; al ser un MoE con unos 3B parámetros activos, el coste por token debería ser inferior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-oQ3e-mtp | 35B | ~3B | no disponible | Apache 2.0 | Gated, 0 descargas |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | Público en Hugging Face |
| nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1 (base) | 35B | ~3B | no disponible | no disponible | Público en Hugging Face |

La comparativa se limita a los modelos del linaje declarado, ya que no se dispone de datos de rendimiento para contrastar con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con cero descargas y cero valoraciones; no hay evidencia de validación por terceros.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Al ser un merge de múltiples modelos, incluidos algunos "uncensored" y "abliterated", puede presentar sesgos y una menor alineación de seguridad; se recomienda auditoría antes de uso público.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente agravado por la mezcla de estilos y dominios del merge.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- El soporte multimodal (image-text-to-text) no está respaldado por documentación técnica en la ficha.
- Aunque la licencia es Apache 2.0, los modelos base del merge pueden tener condiciones adicionales; conviene revisar cada uno antes de uso comercial.
- La cuantización oQ3e puede degradar la calidad frente a FP16, especialmente en tareas de razonamiento largo.
- El soporte de español está declarado, pero no hay evaluaciones que confirmen su calidad en ese idioma.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-oQ3e-mtp
- Modelo base Qwen-AgentWorld: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base TerminalHorizon: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Adaptador Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
