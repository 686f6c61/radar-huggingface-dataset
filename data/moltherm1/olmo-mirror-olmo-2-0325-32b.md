# moltherm1/olmo-mirror-olmo-2-0325-32b

## Resumen

OLMo 2 32B es el modelo de mayor tamano de la familia OLMo 2 (Open Language Model), desarrollada por el Allen Institute for AI (AI2). Se trata de un modelo de lenguaje de tipo transformer decoder-only, con 32.000 millones de parametros, 64 capas, un tamano oculto de 5120 y 40 cabezas de atencion, entrenado sobre 6 billones de tokens. Su proposito es servir como plataforma completamente abierta para la investigacion en modelos de lenguaje: AI2 publica codigo, checkpoints intermedios, logs de entrenamiento y detalles del dataset.

El modelo que nos ocupa, `moltherm1/olmo-mirror-olmo-2-0325-32b`, es un espejo (mirror) del checkpoint base oficial `allenai/OLMo-2-0325-32B`, publicado por un tercero. No introduce modificaciones tecnicas: reproduce los pesos del modelo base de AI2 bajo licencia Apache 2.0 y la libreria transformers. El repositorio ocupa 4,8 GB, un tamano inferior al esperado para 32B parametros en precision completa, lo que sugiere que el espejo podria contener pesos cuantizados o un subconjunto de los mismos; este dato no esta confirmado en la informacion disponible.

La relevancia de OLMo 2 32B radica en su caracter totalmente abierto: a diferencia de la mayoria de modelos de su escala, permite auditar el proceso de entrenamiento completo, desde la mezcla de datos hasta las etapas de alineamiento (SFT, DPO y RLVR). Esto lo convierte en una referencia para estudios de reproducibilidad y para equipos que necesitan un modelo de 32B con licencia permisiva y trazabilidad total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2) |
| Parametros totales | 32.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado explicitamente en la informacion) |

## Arquitectura y entrenamiento

OLMo 2 32B es un transformer decoder-only con 64 capas, tamano oculto de 5120 y 40 cabezas de atencion, con una longitud de contexto de 4096 tokens. Se preentreno sobre el dataset OLMo-mix-1124 y se sometio a una fase de mid-training con Dolmino-mix-1124, acumulando 6 billones de tokens de entrenamiento. La familia OLMo 2 sigue un pipeline de alineamiento por etapas: modelo base, SFT, DPO y, finalmente, modelos Instruct entrenados con RLVR (reinforcement learning with verifiable rewards). AI2 publica checkpoints intermedios con la convencion `stage1-stepXXX-tokensYYYB` y `stage2-ingredientN-stepXXX-tokensYYYB`, lo que permite reproducir o reanudar el entrenamiento en puntos concretos.

La innovacion principal no es arquitectonica sino metodologica: la apertura completa de codigo (OLMo-core), logs, datasets y checkpoints intermedios. El modelo es compatible con transformers v4.48 o superior y con vLLM (requiere instalar desde la rama main hasta la version v0.7.4). La model card no detalla innovaciones como atencion lineal o decodificacion especulativa; estos datos no estan disponibles.

## Capacidades

- Generacion de texto en ingles: modelado de lenguaje autoregresivo estandar.
- Razonamiento y conocimiento general: el checkpoint base esta disenado para tareas de modelado de lenguaje; las capacidades de instruccion residen en las variantes SFT/DPO/Instruct.
- Fine-tuning: soporte para ajuste fino desde el checkpoint final o desde checkpoints intermedios, con recetas en el repositorio OLMo-core.
- Cuantizacion: carga en 8 bits mediante bitsandbytes para reducir requisitos de memoria.
- Compatibilidad con vLLM y transformers para despliegue en produccion.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio, thinking mode ni multilingues mas alla del ingles.

## Casos de uso

- Investigacion en reproducibilidad: el modelo permite repetir el pipeline de entrenamiento desde checkpoints intermedios y comparar resultados con los logs publicados por AI2, gracias a la apertura total de artefactos.
- Fine-tuning domain-specific: un equipo puede partir del checkpoint base o de los intermedios para adaptar el modelo a un dominio concreto (legal, medico, financiero) en ingles, con control sobre que etapa de entrenamiento utilizar.
- Estudio de alineamiento: las variantes SFT, DPO e Instruct permiten analizar el efecto de cada etapa de alineamiento sobre el comportamiento del modelo, algo imposible con modelos de pesos cerrados.
- Generacion de texto a gran escala en ingles: con 32B parametros y contexto de 4096 tokens, es adecuado para tareas de redaccion, resumen y sintesis en pipelines batch.
- Base para modelos experimentales: al tener licencia Apache 2.0, se puede usar como punto de partida para modelos derivados con fines comerciales o academicos sin restricciones de uso.
- Evaluacion comparativa de tecnicas de cuantizacion: el modelo admite carga en 8 bits, lo que permite medir la degradacion de calidad frente al modelo en precision completa en tareas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para 32B parametros, la model card solo menciona la opcion de carga en 8 bits con bitsandbytes, lo que reduciria el requisito a aproximadamente 32-35 GB de VRAM (estimacion estandar, no confirmada en la informacion).
- GPU recomendadas: no disponibles en la informacion. Por tamano, un modelo de 32B en 8 bits requiere GPUs con al menos 40 GB (A100 40GB, A100 80GB, H100) o configuraciones multi-GPU.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB (RTX 4090) en 8 bits segun la estimacion anterior; no hay datos confirmados.
- Opciones de despliegue: transformers (v4.48+), vLLM (rama main hasta v0.7.4), bitsandbytes para cuantizacion. No se mencionan llama.cpp, Ollama ni TGI en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo 2 32B (este) | 32B | 4096 | Apache 2.0 | Pesos abiertos, checkpoints intermedios, codigo y logs |
| OLMo 2 13B | 13B | 4096 | Apache 2.0 | Pesos abiertos, misma familia |
| OLMo 2 7B | 7B | 4096 | Apache 2.0 | Pesos abiertos, misma familia |

La informacion disponible solo permite comparar dentro de la familia OLMo 2. No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otros desarrolladores en la informacion proporcionada, por lo que la comparativa con alternativas externas se indica como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y evaluado exclusivamente en ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto limitado: 4096 tokens es una ventana reducida frente a modelos contemporaneos con contextos de 32K o superiores, lo que limita tareas de documento largo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto; no se documentan mitigaciones especificas en la informacion.
- Sesgos: no se detallan analisis de sesgo en la informacion disponible; al entrenarse sobre datos web, es probable que herede sesgos de la mezcla OLMo-mix-1124.
- Espejo de terceros: este repositorio no es el oficial de AI2; el mantenimiento, la integridad de los pesos y las actualizaciones dependen de `moltherm1`, no del desarrollador original.
- Tamano del repositorio (4,8 GB) inconsistente con 32B parametros en precision completa: conviene verificar el contenido real antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones de atribucion correspondientes.

## Enlaces

- Repositorio del espejo: https://huggingface.co/moltherm1/olmo-mirror-olmo-2-0325-32b
- Modelo base oficial: https://huggingface.co/allenai/OLMo-2-0325-32B
- Variante SFT: https://huggingface.co/allenai/OLMo-2-0325-32B-SFT
- Variante DPO: https://huggingface.co/allenai/OLMo-2-0325-32B-DPO
- Variante Instruct: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/olmo-mix-1124
- Dataset de mid-training: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Codigo y logs de entrenamiento: https://github.com/allenai/OLMo-core
- Paper de referencia: arxiv:2501.00656
