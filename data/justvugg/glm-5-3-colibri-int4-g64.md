# Justvugg/GLM-5.3-colibri-int4-g64

## Resumen

GLM-5.3-colibri-int4-g64 es una conversión cuantizada a int4 del modelo GLM-5.3 desarrollado por Z.ai (zai-org). No se trata del checkpoint oficial, sino de una repaquetación de los pesos originales en el formato de contenedor que utiliza colibrì, un motor de inferencia en C orientado a streaming de expertos desde disco. El autor de la conversión es Justvugg, también responsable del motor colibrì. El objetivo declarado es ejecutar un modelo de clase 744B en una máquina con unos 25 GB de RAM, manteniendo los expertos enrutados en disco y leyendo solo aquellos que cada token selecciona.

La relevancia de esta ficha reside en la técnica de despliegue más que en el modelo en sí: permite inferencia de un MoE de gran escala en CPU con presupuesto de memoria muy ajustado (RSS total de aproximadamente 13,6 GB con un presupuesto de 18 GB). El repositorio ocupa 419,3 GB distribuidos en 141 shards, con 10,6 GB de pesos densos residentes en memoria y expertos enrutados cuantizados a int4 con group size 64, de 21,2 MB cada uno.

El modelo base GLM-5.3 comparte geometría con GLM-5.2 según la propia model card de Z.ai; todas las mejoras provienen del post-entrenamiento, no de cambios arquitectónicos. Esta conversión no incluye el módulo MTP (multi-token prediction) y no carga en transformers ni en vLLM: solo funciona con el motor colibrì.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa) con 78 capas, 75 de ellas sparse |
| Parámetros totales | no disponible (modelo de clase 744B según la model card) |
| Parámetros activos | 8 expertos activos por token de 256 totales |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 group-scaled (group size 64) para expertos enrutados; 8-bit para pesos densos y de E/S |
| Idiomas soportados | en, zh |
| Licencia | other (glm-5.3) |
| Formato de pesos | contenedor propietario de colibrì (141 shards), no compatible con safetensors/GGUF estándar |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 78 capas (75 sparse), 256 expertos y 8 expertos activos por token, identificada en los tags como glm_moe_dsa. Los pesos proceden del release oficial zai-org/GLM-5.3, convertidos con el conversor de colibrì usando la configuración ebits=4, xbits=4, io_bits=8, group_size=64. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada; la model card de Z.ai indica que GLM-5.3 reutiliza el modelo base de GLM-5.2 y que todas las ganancias provienen del post-entrenamiento.

La innovación técnica destacable no está en el modelo sino en el formato de despliegue: streaming de expertos desde disco, con solo 10,6 GB de pesos densos residentes y lectura bajo demanda de los expertos seleccionados por token. El módulo MTP no está incluido en esta conversión, por lo que no hay decodificación especulativa multi-token. El autor verificó los 141 shards (116.915 tensores) en cuanto a validez de cabeceras y truncamiento, y confirmó salida byte-idéntica entre dos rutas distintas de fetch de expertos con semilla fija; no se ha realizado comparación token-exacta contra la implementación de referencia.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conocimiento general heredados del modelo base GLM-5.3 (sin benchmarks publicados en esta conversión).
- Capacidades de código y matemáticas del modelo base, sujetas a la pérdida por cuantización int4 de los expertos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking extendido: no disponible en la información proporcionada.
- Ejecución en CPU con presupuesto de memoria reducido gracias al streaming de expertos.

## Casos de uso

- Inferencia de un MoE de clase 744B en hardware de consumo: con aproximadamente 13,6 GB de RSS total, permite ejecutar el modelo en una estación de trabajo con 25 GB de RAM y almacenamiento rápido (NVMe), sin GPU de gran memoria. Adecuado para laboratorios con recursos limitados que quieran estudiar el comportamiento de un modelo de gran escala.
- Investigación sobre streaming de expertos: el formato colibrì permite medir latencia de fetch desde disco, throughput por token y sensibilidad al ancho de banda de almacenamiento, con una carga de trabajo reproducible sobre 141 shards.
- Evaluación comparativa de cuantización int4: permite analizar la degradación de calidad frente al checkpoint FP8 original en tareas de generación y razonamiento, aunque no se ha publicado comparación token-exacta.
- Prototipado de asistentes en inglés y chino: para demos internas o pruebas de concepto multilingües donde el requisito es coherencia de texto, no latencia interactiva.
- Verificación de integridad de pesos: los 116.915 tensores fueron validados; útil como caso de estudio para pipelines de verificación de checkpoints cuantizados.
- Reproducción de experimentos de decodificación determinista: la salida byte-idéntica con semilla fija entre distintas rutas de fetch facilita experimentos reproducibles en entornos de investigación.
- Despliegue en entornos air-gapped o sin GPU: al funcionar únicamente con el motor colibrì en CPU, encaja en infraestructuras sin aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K) ni de throughput o latencia para esta conversión. Lo único verificable es la integridad de los 141 shards y la coherencia de la salida generada.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU.
- RAM: aproximadamente 13,6 GB de RSS total con un presupuesto de 18 GB; pesos densos residentes de 10,6 GB.
- Almacenamiento: 419,3 GB para los 141 shards, idealmente en NVMe por la lectura bajo demanda de expertos.
- GPU recomendadas: no aplica; el motor colibrì no usa GPU según la información disponible.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no carga en transformers ni vLLM, y requiere el motor colibrì.
- Opciones de despliegue: exclusivamente colibrì (`coli chat --model /ruta/al/directorio`), compilado con `make -C c colibri`.
- Latencia y throughput: no disponibles; dependen del almacenamiento y del ancho de banda de lectura de los expertos (21,2 MB por experto, 8 activos por token).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-colibri-int4-g64 | clase 744B, 8/256 expertos activos | no disponible | contenedor colibrì | glm-5.3 | Hugging Face, requiere colibrì |
| zai-org/GLM-5.3 (original) | clase 744B | no disponible | pesos oficiales | glm-5.3 | Hugging Face |
| zai-org/GLM-5.2 | misma geometría que GLM-5.3 | no disponible | pesos oficiales | no disponible | Hugging Face |

La comparación con alternativas de otros fabricantes (por ejemplo, MoE de escala similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es el checkpoint oficial: los pesos son de Z.ai, pero el almacenamiento y la cuantización son del autor de la conversión; no hay comparación token-exacta contra la implementación de referencia.
- No carga en transformers ni en vLLM; solo funciona con el motor colibrì, lo que limita integración con ecosistemas estándar.
- El motor etiqueta erróneamente el checkpoint como "GLM-5.2 744B" porque el `config.json` es indistinguible del de GLM-5.2; los pesos cargados son correctos, pero la etiqueta no.
- Cuantización int4 de los expertos enrutados: riesgo de degradación de calidad frente al original FP8, no cuantificada.
- MTP no incluido: sin decodificación especulativa multi-token, lo que reduce el throughput potencial.
- Idiomas limitados a inglés y chino; sin soporte documentado de castellano.
- Licencia "other" con nombre glm-5.3: conviene revisar los términos del modelo base antes de uso comercial.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.
- Latencia dependiente del almacenamiento: la lectura de expertos desde disco puede hacer inviable uso interactivo en discos lentos.
- Longitud de contexto no disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Justvugg/GLM-5.3-colibri-int4-g64
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Motor colibrì: https://github.com/JustVugg/colibri
