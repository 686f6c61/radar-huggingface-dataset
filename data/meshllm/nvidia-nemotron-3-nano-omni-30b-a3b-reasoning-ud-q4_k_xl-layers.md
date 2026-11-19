# meshllm/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de distribución por capas del modelo NVIDIA Nemotron-3 Nano Omni 30B-A3B Reasoning, en cuantización UD-Q4_K_XL y formato GGUF. Lo publica meshllm, el equipo detrás de Mesh LLM, una herramienta de inferencia distribuida que reparte las capas de un GGUF entre varias máquinas de una red local para servir un endpoint compatible con la API de OpenAI. El modelo subyacente es de NVIDIA y la cuantización procede de unsloth, que a su vez la publica como GGUF a partir de los pesos originales.

El interés práctico está en la empaquetación: el GGUF completo se divide en artefactos por capa con sumas de comprobación SHA-256, lo que permite ejecutar un modelo de escala 30B-A3B (aproximadamente 30.000 millones de parámetros totales con unos 3.000 millones activos por token, según la nomenclatura del nombre) en un clúster doméstico cuando no cabe en un solo equipo. La model card del paquete remite explícitamente a la ficha de unsloth para arquitectura, plantilla de chat, parámetros de muestreo, licencia y benchmarks, y no replica esos datos.

La información disponible sobre el modelo original es escasa en esta fuente: no se detallan longitud de contexto, composición del dataset, idiomas ni resultados de evaluación. Todo lo que sigue distingue entre lo que consta en la documentación del paquete y lo que queda como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia NVIDIA Nemotron-3 Nano Omni; el paquete no documenta la arquitectura interna) |
| Parametros totales | escala 30B-A3B según el nombre y la model card; el campo safetensors del repo indica 38.744.896, cifra que no cuadra con la escala declarada y probablemente corresponde a un artefacto parcial |
| Parametros activos | aproximadamente 3B por token (deducido de la nomenclatura A3B; no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unsloth Dynamic 4-bit); el paquete solo distribuye esta variante |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF; requiere consultar los términos del modelo original) |
| Formato de pesos | GGUF dividido en artefactos por capa (layer package), con manifiesto model-package.json |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo original: la model card remite a la ficha de unsloth para esos detalles. Por el nombre puede inferirse una familia Nemotron-3 Nano con mezcla de expertos (30B totales, 3B activos), capacidades omni (posible multimodalidad) y un modo de razonamiento, pero ninguno de estos extremos se confirma en la información proporcionada. Tampoco constan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Lo que sí está documentado es el proceso de empaquetado: el GGUF UD-Q4_K_XL de unsloth se procesa con la herramienta skippy-model-package del proyecto Mesh LLM (referencia f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39) para generar un manifiesto con identidad de origen, checksums y artefactos por capa. La revisión de origen es 571758804835f56154718683f5c0e388b7d0fef9 y el SHA-256 del GGUF fuente es 82eb2c0a47383fc0d59d06faf0b60ad0ff0d566b8d403047525e751824e077ea. El paquete declara 52 capas.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento explícito, por la designación Reasoning del modelo base; el formato exacto de modo pensamiento no está documentado en esta ficha.
- Capacidades omni, sugeridas por el nombre del modelo base; el paquete no detalla qué modalidades cubre ni cómo se activan.
- Servicio mediante API compatible con OpenAI: endpoint /v1/chat/completions y /v1/models en el puerto 3131 de Mesh LLM.
- Inferencia distribuida: reparto de capas entre varias máquinas con el flag --split.
- Ejecución local y privada sobre hardware propio.
- Soporte de tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Inferencia privada en clúster doméstico: varias máquinas aportan memoria y cómputo con mesh-llm serve --split, de modo que un modelo de escala 30B puede servirse sin una GPU de gran capacidad en un solo host.
- Sustitución local de una API en la nube: al exponer /v1/chat/completions, cualquier cliente compatible con OpenAI puede apuntar a localhost:3131 sin cambios de código, útil para prototipos con datos sensibles.
- Laboratorios con hardware heterogéneo: el reparto por capas permite aprovechar estaciones de trabajo y servidores de distintas generaciones que individualmente no cargarían el GGUF completo.
- Evaluación de modelos de razonamiento: el paquete permite desplegar la variante Reasoning de Nemotron-3 Nano para comparar respuestas frente a otros modelos en pruebas internas, siempre que se consulten los parámetros de muestreo recomendados en la ficha de unsloth.
- Docencia y experimentación con inferencia distribuida: el formato de paquete por capas y su manifiesto con checksums sirven para estudiar particionado de modelos, comunicación entre nodos y verificación de integridad de artefactos.
- Despliegue en entornos con restricciones de salida a internet: al ejecutarse íntegramente en red local, encaja en organizaciones que no pueden enviar prompts a servicios externos, sujeto a los términos de licencia del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha de unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF para las notas de evaluación, que no forman parte de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible con cifra verificada. Como referencia de orden de magnitud, un GGUF Q4 de un modelo de 30B totales suele requerir del orden de 18-20 GB solo para pesos; el paquete no publica el tamaño real de los artefactos (el campo package size figura como 0 B y el repo ocupa 30,7 GB).
- GPU recomendadas: no disponibles en la documentación. El diseño del paquete está pensado precisamente para evitar depender de una sola GPU de gran capacidad.
- GPU de consumo: no confirmado. Un modelo de 30B en Q4 no cabe en GPUs de 8-12 GB; podría repartirse entre varias máquinas del mesh.
- Despliegue: Mesh LLM (mesh-llm serve), con API compatible con OpenAI en el puerto 3131. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI para este paquete por capas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (meshllm, UD-Q4_K_XL) | escala 30B-A3B | no disponible | GGUF por capas | other | Distribución para clúster Mesh LLM |
| unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF | escala 30B-A3B | no disponible | GGUF monolítico | other | Fuente directa del paquete; apto para llama.cpp y derivados |
| Modelo original de NVIDIA (pesos completos) | escala 30B-A3B | no disponible | no disponible | other | Referencia upstream; no se detalla en la información disponible |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio es un artefacto de distribución, no un modelo independiente: cualquier corrección, actualización o aviso debe buscarse en la ficha de unsloth y en la del modelo original de NVIDIA.
- La licencia es other y el paquete no reproduce los términos; es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- Los metadatos son inconsistentes: el campo de parámetros en safetensors (38.744.896) no concuerda con la escala 30B declarada, y el tamaño del paquete figura como 0 B. Conviene verificar los checksums del manifiesto antes de desplegar.
- No se documentan sesgos, tasas de alucinación, idiomas soportados ni longitud de contexto; no hay base para evaluar su comportamiento en producción.
- La cuantización Q4 puede degradar tareas sensibles a la precisión, como matemáticas o generación de código; no hay evaluaciones publicadas en esta fuente que lo cuantifiquen.
- El despliegue depende del ecosistema Mesh LLM y de su compatibilidad con el ABI de skippy, que figura como no registrado; la interoperabilidad con otras herramientas no está garantizada.
- El rendimiento en un clúster depende de la latencia de red entre nodos, factor que no se caracteriza en la documentación.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-UD-Q4_K_XL-layers
- Modelo fuente (GGUF de unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificación del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
