# fiore-lab/GLM-5.3-EXL3-Experts-3bit

## Resumen

`fiore-lab/GLM-5.3-EXL3-Experts-3bit` es un banco de expertos enrutados (*routed experts*) del modelo GLM-5.3 de Z.AI (755B parámetros, arquitectura identificada en la model card como `glm_moe_dsa`), cuantizados a 3 bits con EXL3 por Fiore-lab a partir de `zai-org/GLM-5.3-BF16` (revisión `9d2398f`). No es un modelo autónomo: el repositorio contiene únicamente los expertos enrutados de las capas 3 a 77 en 75 ficheros `safetensors`, y necesita los pesos de atención, expertos compartidos, embeddings y capa MTP del checkpoint de la receta (`fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks` o `fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks`) para poder ejecutarse.

Forma parte de un conjunto de cuatro bancos (2, 3, 4 y 5 bits) sobre los que la receta *Expert Atlas* carga cada experto con la anchura que se elija, lo que permite ajustar el compromiso entre memoria y fidelidad sin recuantizar. El interés actual es práctico: hace viable desplegar un MoE de 755B en clústeres pequeños de DGX Spark, un escenario que con pesos BF16 queda fuera de alcance.

El banco ocupa 277,9 GB (258,8 GiB) y está pre-cortado en ocho particiones de paralelismo tensorial, pensadas para cuatro u ocho nodos DGX Spark. La fidelidad declarada frente al modelo original es una divergencia KL de 0,0203, medida sobre cuatro textos de 8.192 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con expertos enrutados y expertos compartidos), según la model card del modelo base |
| Parámetros totales | 755B (modelo base GLM-5.3) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 3 bits con codebook `mcg` para los expertos enrutados; bancos hermanos de 2, 4 y 5 bits disponibles por separado |
| Idiomas soportados | no disponible (la model card existe en inglés, japonés y chino, pero no documenta los idiomas del modelo) |
| Licencia | GLM-5.3 License (`license: other`, `license_name: glm-5.3`), Copyright (c) 2026 Z.AI; el código de la receta es Apache-2.0 y se licencia por separado |
| Formato de pesos | `safetensors` (EXL3), 75 ficheros `experts-layer-003` … `experts-layer-077`, más manifiesto `glm53-exl3-experts-3bit.json` con tamaños, cabeceras y sha256 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un artefacto de cuantización. Los expertos enrutados del GLM-5.3 en BF16 se convirtieron a EXL3 de 3 bits con codebook `mcg` usando exllamav3 1.6.1 y los datos de calibración por defecto de la herramienta (250 filas de 2.048 tokens). Después, cada experto se cortó en ocho particiones de paralelismo tensorial por baldosas completas, sin recuantización posterior, de modo que el resultado sirve tanto para despliegues de cuatro como de ocho DGX Spark. El manifiesto JSON permite verificar tamaño, cabecera y hash de cada fichero antes de cargar una capa.

La arquitectura subyacente es un transformer disperso por mezcla de expertos (`glm_moe_dsa`) con expertos compartidos, capa MTP y atención propia del GLM-5.3; los detalles de composición del dataset de preentrenamiento, número de tokens, uso de RLHF/DPO y cualquier innovación de atención del modelo base no están disponibles en la información proporcionada. La innovación documentada aquí es la *Expert Atlas*: cargar cada experto a una anchura distinta en función de su sensibilidad, en lugar de aplicar una cuantización uniforme.

## Capacidades

- El repositorio no añade capacidades: hereda las del checkpoint GLM-5.3 con el desplazamiento de distribución medido (KL 0,0203 frente al original en FP32).
- Generación de texto, razonamiento, código y matemáticas: no disponible en la información proporcionada (no se documentan evaluaciones de capacidad del modelo base).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Capacidad operativa específica: permite seleccionar la anchura de cuantización por experto en tiempo de despliegue mediante la receta, con verificación criptográfica de los ficheros cargados.

## Casos de uso

- Despliegue on-premise de un MoE de 755B en un clúster de cuatro u ocho DGX Spark: el banco está pre-cortado en ocho particiones tensoriales y la receta `tf-glm53` lo distribuye y verifica nodo a nodo, lo que evita tener que shardear manualmente 277,9 GB de expertos.
- Investigación sobre cuantización de MoE: comparar la fidelidad de 2, 3, 4 y 5 bits con el mismo *harness* (divergencias KL de 0,0517 / 0,0203 / 0,0127 / 0,0114) para estudiar qué expertos toleran menos bits.
- Experimentos de asignación mixta de anchura: la receta permite fijar anchuras distintas por experto al mismo presupuesto de memoria; la model card documenta que las mezclas con expertos a 2 bits se alejan un 13-30 % más de la referencia.
- Entornos con requisitos de soberanía del dato o air-gapped: al ser pesos descargables y verificables por sha256, el despliegue puede hacerse sin dependencia de APIs externas, siempre que se cumpla la licencia GLM-5.3.
- Evaluación de infraestructura de inferencia: medir latencia y throughput de exllamav3 sobre clústeres DGX Spark con un modelo de 755B, usando los bancos como variable de control de memoria.
- Reproducibilidad de artefactos: el manifiesto con hash por fichero permite auditar que los pesos servidos en producción son exactamente los publicados, algo relevante en pipelines regulados.
- Servicio de inferencia en producción: solo si el stack utiliza exllamav3 (formato EXL3); no se documenta compatibilidad con otros motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de calidad es la divergencia KL frente a las distribuciones del modelo original en BF16 ejecutado en FP32 por la implementación oficial (transformers), sobre cuatro textos de 8.192 tokens (dos en inglés, dos de código), posiciones 6.144 a 8.190, con todos los expertos enrutados a una misma anchura y el resto de pesos de la receta, en cuatro DGX Spark (el valor de 5 bits, en ocho):

| Anchura de expertos enrutados | Divergencia KL |
|---|---|
| Todos a 2 bits | 0,0517 |
| Todos a 3 bits (este banco) | 0,0203 |
| Todos a 4 bits | 0,0127 |
| Todos a 5 bits | 0,0114 (medido en ocho Sparks) |
| Referencia: pesos BF16 oficiales calculados en BF16 en lugar de FP32 | ≈ 0,009 |

## Requisitos de hardware

- Almacenamiento y memoria: el banco de expertos ocupa por sí solo 277,9 GB (258,8 GiB); hay que sumar atención, expertos compartidos, embeddings y capa MTP del checkpoint de la receta, por lo que el peso total en memoria supera esa cifra.
- GPU: el caso documentado es un clúster de cuatro u ocho NVIDIA DGX Spark (memoria unificada por nodo), con las particiones tensoriales ya preparadas para ambos tamaños. No cabe en ninguna GPU de consumo ni en una A100/H100 de 80 GB por sí sola.
- GPU de consumo: no viable con este banco; requeriría los bancos de menor anchura combinados con un subconjunto del modelo, algo que la model card no documenta.
- Opciones de despliegue: exllamav3 1.6.1 o superior y la receta `fiore-labo/fiore-glm5.3` (release r3-102 o posterior) con `tf-glm53 deploy`, `tf-glm53 verify-banks 3` y el panel de control. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este formato.
- Verificación: `tf-glm53 verify-banks 3` comprueba cada fichero contra el manifiesto en cada nodo; tarda minutos y se ejecuta a baja prioridad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar con modelos de otras familias. La comparación relevante es interna al conjunto de bancos y al modelo original:

| Artefacto | Formato / bits de expertos | Divergencia KL | Tamaño | Licencia |
|---|---|---|---|---|
| `zai-org/GLM-5.3-BF16` (original) | BF16, sin cuantizar | referencia (≈ 0,009 de ruido BF16 vs FP32) | no disponible | GLM-5.3 License |
| `fiore-lab/GLM-5.3-EXL3-Experts-2bit` | EXL3, 2 bits | 0,0517 | no disponible | GLM-5.3 License |
| Este repositorio | EXL3, 3 bits | 0,0203 | 277,9 GB | GLM-5.3 License |
| Banco de 4 bits | EXL3, 4 bits | 0,0127 | no disponible | GLM-5.3 License |
| Banco de 5 bits | EXL3, 5 bits | 0,0114 | no disponible | GLM-5.3 License |
| `fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks` | EXL3, checkpoint completo para ocho Sparks | no disponible | no disponible | GLM-5.3 License |
| `fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks` | EXL3, checkpoint completo para cuatro Sparks | no disponible | no disponible | GLM-5.3 License |

Según la model card, bajar expertos a 2 bits para compensar memoria empeora la fidelidad entre un 13 % y un 30 %, y subir a 5 bits desplazando otros a 3 bits no aporta mejora medible, mientras que sí incrementa la memoria necesaria.

## Limitaciones y advertencias

- No es un modelo ejecutable por sí solo: sin el checkpoint de la receta (atención, expertos compartidos, embeddings y MTP) no produce inferencia.
- Solo contiene las capas 3 a 77 de expertos enrutados; las capas fuera de ese rango y el resto de componentes dependen del checkpoint complementario.
- La licencia es GLM-5.3 License (`other`), no Apache ni MIT: las condiciones de uso comercial deben consultarse en el fichero `LICENSE` y en la model card del checkpoint de la receta; no se detallan en la información disponible.
- La cuantización introduce un sesgo medible: KL 0,0203 frente a ≈ 0,009 del propio redondeo BF16, es decir, más del doble de desviación que el ruido numérico de referencia. No se documenta el impacto en tareas concretas (código, matemáticas, multilingüe).
- La medición de KL se hizo sobre cuatro textos de 8.192 tokens en inglés y código: no cubre otros idiomas ni dominios, y el resultado de 5 bits se obtuvo en una configuración de hardware distinta (ocho Sparks).
- Riesgo de alucinación y sesgos: no evaluado en la información proporcionada; debe asumirse el comportamiento del modelo base más el desplazamiento por cuantización.
- Idiomas y longitud de contexto no documentados: no se puede garantizar soporte multilingüe ni ventanas largas sin verificación empírica.
- Dependencia fuerte de un stack concreto: exllamav3 y la receta `fiore-glm5.3` (r3-102 o posterior); no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Volumen de descarga muy alto (277,9 GB por nodo) y verificación por hash en cada nodo antes de arrancar; un despliegue mal planificado falla antes de iniciar, por diseño.
- Adopción nula y validación externa inexistente: 0 descargas y 0 *likes* en el momento de la consulta; la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-3bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos BF16 de origen: https://huggingface.co/zai-org/GLM-5.3-BF16
- Receta y código (Apache-2.0): https://github.com/fiore-labo/fiore-glm5.3
- Checkpoint complementario para 8 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Checkpoint complementario para 4 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
