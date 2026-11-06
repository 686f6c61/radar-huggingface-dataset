# SicariusSicariiStuff/Fat_Fish

## Resumen

Fat_Fish es un modelo de lenguaje experimental desarrollado por SicariusSicariiStuff a partir de `mistralai/Mistral-Nemo-Base-2407`. Se trata de un ejercicio de "upscale" arquitectónico combinado con poda (prune): el autor incrementó el número de capas de 32 a 56 y las cabezas de atención de 32 a 48, al tiempo que redujo el tamaño intermedio del feed-forward de 14336 a 12608, manteniendo el hidden size en 5120. El resultado es un modelo denso de aproximadamente 16.590 millones de parámetros, frente a los 12.000 millones del Nemo original.

El modelo fue sometido a un entrenamiento continuo (CPT) de unos 3000 millones de tokens con una mezcla que incluye un 20 % de conocimiento de lore de videojuegos (Morrowind, Fallout, Kenshi), un 50 % de contenido escrito por humanos, un 16 % de corpus en hebreo moderno, un 4 % de datos sintéticos de instrucciones y un 10 % de fuentes mixtas. El autor declara un coste aproximado de 1000 dólares para el proyecto y lo publica como paso intermedio, no como modelo final para consumo directo.

Es relevante ahora porque ejemplifica una línea poco frecuente en el ecosistema open source: la modificación estructural real de un transformer denso (no un simple stack merge con mergekit) para explorar si es posible "fabricar" una base nueva cuando los lanzamientos de modelos densos escasean frente al dominio de las arquitecturas MoE. La licencia Apache 2.0 y el formato safetensors facilitan su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Mistral-Nemo) |
| Parametros totales | 16.591.672.320 (aprox. 16,59 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Nemo soporta 128 000 tokens, pero no se confirma para este derivado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el autor menciona que el modelo se comporta bien bajo cuantizacion |
| Idiomas soportados | Ingles (declarado); el entrenamiento incluye un 16 % de hebreo moderno |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Cambios arquitectonicos respecto a la base:

| Parametro | Mistral-Nemo base | Fat_Fish |
|---|---|---|
| Hidden size | 5120 | 5120 |
| Intermediate size | 14336 | 12608 |
| Capas | 32 | 56 |
| Cabezas de atencion | 32 | 48 |
| Cabezas key/value | 8 | 12 |

## Arquitectura y entrenamiento

Fat_Fish parte de Mistral-Nemo-Base-2407, un transformer decoder-only denso con GQA (grouped-query attention). El autor aplica un upscale estructural: duplica aproximadamente el número de capas (32 a 56) y aumenta las cabezas de atención (32 a 48) y las cabezas KV (8 a 12), mientras reduce el intermediate size del FFN (14336 a 12608). El hidden size se mantiene en 5120. La elección de 12 cabezas KV en lugar de 16 se justifica como compromiso entre fidelidad de atención y coste de memoria y cómputo; el autor reporta estabilidad durante el tuning, la inferencia y la cuantización.

A diferencia de muchos "upscales" comunitarios basados en stack merges de mergekit que anulan `down_proj`, aquí no se anuló ninguna capa. Se inyectó ruido en tensores duplicados para forzar el aprendizaje de nuevas representaciones durante el entrenamiento continuo, que consumió unos 3000 millones de tokens. La composición del corpus es heterogénea: 50 % de escritura humana general (ensayos, blogs, diálogos), 20 % de lore de Fandom (Morrowind, Fallout, Kenshi), 16 % de hebreo moderno, 4 % de datos sintéticos de instrucción y 10 % de fuentes mixtas. No se documenta el uso de RLHF ni DPO; el modelo se publica como base. El autor referencia los papers arXiv:2407.14679 y arXiv:2408.11796 en las etiquetas del repositorio.

## Capacidades

- Generación de texto en inglés con coherencia declarada por el autor pese a las modificaciones estructurales.
- Seguimiento de instrucciones, según la model card.
- Conocimiento enciclopédico y de lore de videojuegos (Morrowind, Fallout, Kenshi) reforzado por el entrenamiento continuo.
- Capacidad multilingüe parcial: incluye hebreo moderno en el corpus de entrenamiento, aunque el idioma declarado oficialmente es solo inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni modo "thinking".
- El autor indica que "conoce cosas nuevas y nuevos idiomas" tras el CPT, sin cuantificar.

## Casos de uso

- Base para fine-tuning especializado: el autor recomienda ejecutar análisis de similitud de capas y hacer full fine-tuning solo de las capas más similares manteniendo el resto congeladas, lo que permite adaptar el modelo a dominios concretos con coste reducido.
- Investigación sobre upscaling de transformers densos: sirve como caso de estudio reproducible de modificación estructural (capas, cabezas, FFN) sin anulación de `down_proj`, útil para quienes estudian técnicas alternativas a los stack merges.
- Fine-tuning de dominio con conocimiento de lore: gracias al 20 % de datos de Fandom, puede servir de punto de partida para asistentes de comunidades de Morrowind, Fallout o Kenshi.
- Experimentación con modelos en hebreo: el 16 % de corpus hebreo lo convierte en candidato para prototipos de procesamiento de hebreo moderno, aunque el autor no garantiza calidad.
- Estudio de cuantización sobre arquitecturas modificadas: el autor reporta comportamiento estable bajo cuantización con 12 cabezas KV, lo que permite usarlo como banco de pruebas para pipelines de cuantización (GGUF, GPTQ, AWQ).
- Evaluación comparativa de bases densas frente a MoE: útil en investigación para medir si una base densa "fabricada" a partir de Nemo mantiene capacidades frente a alternativas más recientes.
- No se recomienda su uso directo en producción sin fine-tuning, según el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; solo afirmaciones cualitativas del autor sobre coherencia y seguimiento de instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,59 B de parámetros, en FP16 se requieren aproximadamente 33 GB de VRAM (coincide con el tamaño del repo, 33,2 GB). En cuantización de 8 bits, unos 17 GB; en 4 bits, unos 9-10 GB.
- GPU recomendadas para FP16: A100 40 GB, A100 80 GB, H100 80 GB, o configuraciones multi-GPU con dos RTX 3090/4090.
- GPU consumer: cabe en una RTX 4090 (24 GB) solo con cuantización de 8 bits o inferior; en 4 bits cabe en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables una vez generados los pesos en GGUF; el autor no publica quants oficiales en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura tiene 56 capas (frente a 32 del Nemo), lo que incrementa el coste por token en comparación con la base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fat_Fish | 16,59 B | No disponible | Apache 2.0 | Upscale + prune experimental de Nemo; 56 capas, 48 cabezas, 12 KV |
| Mistral-Nemo-Base-2407 | 12 B | 128 000 tokens | Apache 2.0 | Base original; 32 capas, 32 cabezas, 8 KV; ampliamente tuneado por la comunidad |
| Mistral 14B (versiones densas posteriores) | ~14 B | No disponible | Apache 2.0 | Alternativa densa más reciente de Mistral, según menciona el autor |
| Modelos MoE de gran tamaño (categoría general) | Variable | Variable | Variable | El autor señala que dominan los lanzamientos actuales frente a los densos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo "no es para consumo humano tal cual" y que es un paso intermedio que "necesita más trabajo".
- Seguridad limitada: la model card incluye una sección "SAFETY" que califica al modelo como "no muy seguro", sin filtros ni alineamiento documentado.
- Riesgo de alucinación no evaluado; no hay benchmarks que cuantifiquen su fiabilidad.
- Idioma declarado solo inglés; el hebreo está presente en el entrenamiento pero no se garantiza su calidad.
- Contexto no confirmado: aunque la base Nemo soporta 128 000 tokens, no se documenta que Fat_Fish conserve esa ventana tras las modificaciones.
- El entrenamiento continuo con un 20 % de lore de videojuegos puede sesgar las respuestas hacia esos dominios.
- No se documentan procesos de RLHF ni DPO, por lo que el seguimiento de instrucciones y la alineación pueden ser inconsistentes.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluación desaconsejan producción sin fine-tuning y validación previas.
- El autor recomienda análisis de similitud de capas antes de cualquier fine-tuning, lo que implica trabajo adicional de ingeniería.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Fat_Fish
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Paper referenciado (arXiv:2407.14679): https://arxiv.org/abs/2407.14679
- Paper referenciado (arXiv:2408.11796): https://arxiv.org/abs/2408.11796
- Imagen del modelo: https://huggingface.co/SicariusSicariiStuff/Fat_Fish/resolve/main/Images/Fat_Fish.png
