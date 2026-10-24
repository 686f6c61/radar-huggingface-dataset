# fiore-lab/GLM-5.3-EXL3-Experts-4bit

## Resumen

`fiore-lab/GLM-5.3-EXL3-Experts-4bit` no es un modelo completo, sino un banco de pesos parciales: contiene únicamente los expertos enrutados (routed experts) del modelo `zai-org/GLM-5.3` (755B parámetros, arquitectura `glm_moe_dsa`) cuantizados a 4 bits con EXL3. Lo publica fiore-lab como parte de una familia de cuatro bancos (2, 3, 4 y 5 bits) desde los que la receta de despliegue `fiore-labo/fiore-glm5.3` carga cada experto con el ancho que el operador elija. Los pesos proceden de `zai-org/GLM-5.3-BF16` en la revisión `9d2398f`, cuantizados con exllamav3 1.6.1 y codebook `mcg`.

El repositorio ocupa 368,5 GB (343,2 GiB) repartidos en 75 ficheros safetensors, uno por cada capa con expertos (capas 3 a 77), y cada experto viene ya troceado en sus ocho particiones de paralelismo tensorial para clústeres de cuatro u ocho DGX Spark. El banco no incluye atención, expertos compartidos, embeddings ni la capa MTP: esos pesos provienen del checkpoint de la receta (`fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks` o `fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks`).

Su relevancia es de infraestructura más que de modelado: permite desplegar un MoE de 755B en hardware de sobremesa para centro de datos (DGX Spark) manteniendo una divergencia KL de 0,0127 frente a las distribuciones del modelo BF16 original, un valor del mismo orden que el ruido de precisión del propio BF16 (~0,009). Es material de interés para quienes investigan cuantización de MoE, mezcla de anchos por experto y despliegue multi-nodo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (`glm_moe_dsa` en el modelo base); este repo contiene solo los expertos enrutados de las capas 3 a 77 |
| Parámetros totales | 755B en el modelo base `zai-org/GLM-5.3`; los parámetros de este banco no se detallan |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 4 bits, codebook `mcg`; existen bancos hermanos de 2, 3 y 5 bits |
| Idiomas soportados | no disponible (la model card se publica en inglés, japonés y chino simplificado, pero no declara idiomas del modelo) |
| Licencia | GLM-5.3 License (`other`, `license_name: glm-5.3`), Copyright (c) 2026 Z.AI |
| Formato de pesos | safetensors (75 ficheros `experts-layer-003` … `experts-layer-077.safetensors`) + manifiesto JSON `glm53-exl3-experts-4bit.json` |
| Autor | fiore-lab |
| Modelo base | `zai-org/GLM-5.3` (revisión del BF16: `9d2398f`) |
| Tamaño del repositorio | 368,5 GB (343,2 GiB) |
| Sharding | Cada experto troceado en 8 particiones de paralelismo tensorial (para 4 u 8 DGX Spark) |
| Alineación / fine-tuning | no disponible |
| Herramienta de cuantización | exllamav3 1.6.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 755B parámetros, identificado en la model card con el tag de arquitectura `glm_moe_dsa`. El banco cubre las 75 capas que contienen expertos enrutados (capas 3 a 77). No se documentan en la información disponible el número de expertos por capa, el ratio de activación, la dimensión oculta ni los detalles de la atención; tampoco se describe el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO).

El proceso de construcción sí está detallado: cuantización de los expertos enrutados a 4 bits con EXL3, codebook `mcg`, calibración con los datos por defecto de exllamav3 (250 filas de 2.048 tokens) y posterior troceado en ocho particiones de paralelismo tensorial por baldosas completas, sin recuantización. Los 75 ficheros son idénticos byte a byte a los expertos de `fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks`. La calidad se mide por divergencia KL frente a las distribuciones del modelo original ejecutado en la implementación oficial con pesos BF16 calculados en FP32, sobre cuatro textos de 8.192 tokens (dos en inglés, dos de código), en las posiciones 6.144 a 8.190: 0,0127 con todos los expertos a 4 bits, frente a 0,0203 a 3 bits, 0,0517 a 2 bits y 0,0114 a 5 bits. El autor señala además que mezclar anchos con un 2 bits resulta entre un 13 % y un 30 % más divergente que una mezcla sin él, y que subir expertos a 5 bits bajando otros a 3 no aporta mejora medible.

## Capacidades

- Suministra los pesos de los expertos enrutados del modelo base a 4 bits, listos para la receta de despliegue, sin necesidad de recuantizar en el nodo.
- Carga selectiva por capa: la receta verifica el manifiesto (tamaño, cabecera y sha256 de cada fichero) antes de cargar cada capa.
- Integración en un esquema de anchos mixtos: el mismo pipeline puede combinar este banco con los de 2, 3 y 5 bits según el presupuesto de memoria por nodo.
- Distribución multi-nodo: cada experto está pre-troceado en 8 particiones tensoriales, lo que evita trabajo de reparto en tiempo de despliegue.
- Comprobación de integridad mediante `tf-glm53 verify-banks 4`, que valida cada fichero contra el manifiesto en cada nodo.
- Las capacidades de generación, razonamiento, código, tool calling, agentes o multimodalidad dependen del modelo base `zai-org/GLM-5.3` y no están documentadas en la información disponible para esta ficha.
- La capa MTP (multi-token prediction) se menciona como parte del checkpoint de la receta, pero la model card no describe su función ni su impacto en decodificación.

## Casos de uso

- Despliegue on-premise de un MoE de 755B en clúster de DGX Spark: el banco permite servir el modelo completo en cuatro u ocho nodos sin depender de GPUs de centro de datos, descargando el banco de 4 bits en el directorio que indique `expert-plan/banks.json`.
- Investigación en cuantización de MoE: comparar la divergencia KL de 2, 3, 4 y 5 bits sobre el mismo checkpoint y el mismo conjunto de evaluación (cuatro textos de 8.192 tokens, posiciones 6.144-8.190) para estudiar la relación entre ancho por experto y fidelidad.
- Estudio de mezcla de anchos bajo restricción de memoria: la evidencia aportada (2 bits penaliza un 13-30 %; subir a 5 bits bajando otros a 3 no aporta) sirve como base para políticas de asignación de bits por capa.
- Validación de pipelines de integridad de artefactos: el manifiesto con sha256 por fichero y el comando `verify-banks` son un ejemplo práctico de verificación de pesos distribuidos antes de arrancar el servicio.
- Entornos air-gapped o con ancho de banda limitado: al ser un artefacto descargable y autoverificable, encaja en despliegues sin acceso a repositorios externos una vez replicado en cada nodo.
- Reutilización del banco ya descargado: si los nodos ya tienen `fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks`, basta descargar el manifiesto en ese mismo directorio y apuntar el `dir` del banco de 4 bits a él, sin duplicar 343 GiB por nodo.
- Evaluación de fidelidad de cuantizadores: servir de referencia para medir cómo se desvía EXL3 frente a BF16/FP32 en un modelo de gran tamaño con rutado disperso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación es la divergencia KL frente a las distribuciones del modelo original en FP32:

| Ancho de los expertos enrutados | Divergencia KL |
|---|---|
| Todos a 2 bits | 0,0517 |
| Todos a 3 bits | 0,0203 |
| Todos a 4 bits | 0,0127 |
| Todos a 5 bits (medido en ocho DGX Spark) | 0,0114 |
| Referencia: pesos BF16 oficiales calculados en BF16 (no FP32) | ~0,009 |

Metodología: cuatro textos de 8.192 tokens (dos en inglés, dos de código), posiciones 6.144 a 8.190, resto de pesos según la receta, cuatro DGX Spark (ocho para la fila de 5 bits). No se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria: el banco ocupa 343,2 GiB solo en expertos. Repartido entre 8 nodos son ~42,9 GiB por nodo; entre 4 nodos, ~85,8 GiB por nodo (cálculo derivado del tamaño del repo, no publicado por el autor). A esa cifra hay que sumar atención, expertos compartidos, embeddings, capa MTP y caché KV, que provienen del checkpoint de la receta.
- GPU recomendadas: DGX Spark (plataforma GB10, 128 GB de memoria unificada), en configuraciones de 4 u 8 nodos según la receta.
- GPU de consumo: no aplicable. El modelo completo no cabe en una RTX 4090 (24 GB) ni en una única GPU de consumo; el diseño es multi-nodo.
- Opciones de despliegue: receta `fiore-labo/fiore-glm5.3` (release r3-102 o posterior) con la CLI `tf-glm53` (`deploy`, `verify-banks`); cuantización realizada con exllamav3 1.6.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Parámetros | Contexto | Formato / cuantización | Tamaño | Licencia |
|---|---|---|---|---|---|
| `fiore-lab/GLM-5.3-EXL3-Experts-4bit` (este repo) | Expertos de un modelo de 755B | no disponible | safetensors, EXL3 4 bits `mcg`, 8 shards | 368,5 GB | GLM-5.3 License |
| `fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks` | 755B (checkpoint completo) | no disponible | EXL3, checkpoint de la receta para 8 nodos | no disponible | GLM-5.3 License |
| `fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks` | 755B (checkpoint completo) | no disponible | EXL3, checkpoint de la receta para 4 nodos | no disponible | GLM-5.3 License |
| Bancos de 2, 3 y 5 bits de la misma familia | Expertos de un modelo de 755B | no disponible | safetensors, EXL3 2/3/5 bits | no disponible | GLM-5.3 License |
| `zai-org/GLM-5.3-BF16` | 755B | no disponible | safetensors BF16 | no disponible | GLM-5.3 License |

No se dispone de información sobre modelos comparables de otros fabricantes (por ejemplo, alternativas MoE de tamaño similar) en el material proporcionado, por lo que la comparación se limita a la propia familia.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint de la receta (atención, expertos compartidos, embeddings y capa MTP) no puede ejecutarse. Descargarlo solo no produce un modelo funcional.
- Dependencia de una receta concreta: el manifiesto, el troceado en 8 shards y los comandos `tf-glm53` están diseñados para `fiore-labo/fiore-glm5.3` r3-102 o posterior; no es portable a otros runners sin trabajo adicional.
- La evaluación de calidad es únicamente divergencia KL sobre cuatro textos de 8.192 tokens en posiciones 6.144-8.190; no hay benchmarks de tarea, ni evaluación multilingüe, ni de código, ni de seguimiento de instrucciones.
- La calibración usó los datos por defecto de exllamav3 (250 filas de 2.048 tokens), no un corpus específico de dominio; el comportamiento en dominios alejados de esa calibración no está medido.
- Licencia `other` con nombre `glm-5.3`: es preciso revisar el fichero `LICENSE` antes de cualquier uso comercial; la model card no detalla condiciones de uso.
- Idiomas soportados, contexto, sesgos y riesgo de alucinación no están documentados en la información disponible; dependen del modelo base.
- Coste de almacenamiento y despliegue elevado: 343,2 GiB por copia, multiplicado por nodo si no se reutiliza el directorio del checkpoint de la receta.
- Sin descargas ni likes en el momento de la consulta y publicado el 24 de octubre de 2026: no hay evidencia de uso en producción ni validación independiente de las cifras de KL.
- Los resultados de búsqueda web asociados a esta consulta no contenían información relevante sobre el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-4bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos BF16 de origen (revisión `9d2398f`): https://huggingface.co/zai-org/GLM-5.3-BF16
- Checkpoint de la receta para 8 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Checkpoint de la receta para 4 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- Receta y código (Apache-2.0): https://github.com/fiore-labo/fiore-glm5.3
- Licencia del modelo: fichero `LICENSE` dentro del repositorio de HuggingFace
