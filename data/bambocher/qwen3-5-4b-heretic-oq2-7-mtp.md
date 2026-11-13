# bambocher/Qwen3.5-4B-heretic-oQ2.7-mtp

## Resumen

Qwen3.5-4B-heretic-oQ2.7-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: el autor ha aplicado la herramienta oQ (oMLX v0.7.3) para generar una version de precision mixta orientada a inferencia eficiente en Apple Silicon mediante la libreria MLX. El resultado es un checkpoint de 4.660 millones de parametros logicos que ocupa solo 2,6 GB en disco, gracias a una media efectiva de 4,439 bits por peso.

El modelo base pertenece a la familia Qwen3.5, de la que hereda su arquitectura transformer con atencion, un cabezal de vision de 334 millones de parametros y un cabezal MTP (multi-token prediction) de 121 millones. La presencia de estos dos componentes adicionales indica que el modelo original es multimodal (procesa imagen y texto) y que incorpora decodificacion especulativa nativa mediante prediccion multi-token. La cuantizacion preserva ambos componentes, algo relevante porque muchas cuantizaciones agresivas los eliminan.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint comunitario de bajo perfil (cero descargas y cero likes en el momento de la consulta) que ejemplifica las tecnicas de cuantizacion mixta actuales; por otro, sirve como referencia de que datos estan y no estan disponibles cuando se evalua un modelo derivado de terceros. La licencia, los idiomas y el pipeline no estan declarados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabezal de vision y cabezal MTP |
| Parametros totales | 4.659.865.088 (4,660 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit (g128 y g64), 4-bit (g64), 5-bit (g64), 8-bit (g64) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de la cuantizacion segun la model card:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 128 | 3,267 B | 70,119 % | 1,236 GiB | 3,25 |
| Affine 3-bit, grupo 64 | 0,636 B | 13,642 % | 0,259 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,110 B | 2,364 % | 0,058 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,252 B | 5,401 % | 0,161 GiB | 5,50 |
| Affine 8-bit, grupo 64 | 0,047 B | 1,014 % | 0,047 GiB | 8,50 |
| BF16 | 0,348 B | 7,459 % | 0,647 GiB | 16,00 |
| **Total** | **4,660 B** | **100 %** | **2,408 GiB** | **4,439** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206 B | 1,832 GB / 1,706 GiB |
| Vision | 0,334 B | 0,667 GB / 0,621 GiB |
| Cabezal MTP | 0,121 B | 0,087 GB / 0,081 GiB |
| **Total** | **4,660 B** | **2,586 GB / 2,408 GiB** |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de la familia Qwen3.5, del que esta publicacion es una cuantizacion, no un entrenamiento. El checkpoint incorpora tres bloques diferenciados: el modelo de lenguaje propiamente dicho (4,206 B de pesos logicos), un codificador o torre de vision (0,334 B) y un cabezal de prediccion multi-token (MTP, 0,121 B). La existencia del cabezal MTP sugiere que el modelo base fue entrenado con un objetivo auxiliar de prediccion de varios tokens futuros, tecnica habitual para habilitar decodificacion especulativa y aumentar el throughput en inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. El sufijo "heretic" en el nombre del checkpoint es una convencion de la comunidad para indicar que se ha aplicado algun tipo de ablation o "des-alineacion" (uncensoring) sobre el modelo original, pero el autor no documenta el procedimiento ni su alcance. La cuantizacion se realizo con oQ (oMLX v0.7.3), que asigna precision de forma no uniforme: la mayor parte de los pesos (83,8 %) queda en 3 bits, mientras que una fraccion pequena se preserva en 4, 5, 8 bits o BF16, presumiblemente para proteger capas sensibles (embeddings, cabezales, proyecciones de atencion). El resultado es una media de 4,439 bits por peso.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje base; el nivel exacto de razonamiento no esta documentado en el repositorio.
- Procesamiento de vision: el checkpoint conserva una torre de vision de 0,334 B de parametros, por lo que mantiene capacidad multimodal imagen-texto.
- Prediccion multi-token (MTP): el cabezal de 0,121 B permite decodificacion especulativa y potencialmente mayor velocidad de generacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; depende del modelo base Qwen3.5, no documentado aqui.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 2,6 GB, por lo que puede ejecutarse en Macs con memoria unificada de 8 GB o mas. Es adecuado para prototipos y demos en portatiles sin GPU dedicada.
- Procesamiento de documentos con imagen: al conservar la torre de vision, puede emplearse para tareas de OCR asistido, descripcion de imagenes o extraccion de informacion de capturas y formularios en local.
- Generacion de texto en entornos con restricciones de memoria: la cuantizacion mixta permite desplegar un modelo de 4,6 B en dispositivos donde un BF16 equivalente (unos 9,3 GB) no cabria.
- Experimentacion con decodificacion especulativa: el cabezal MTP permite medir el impacto del multi-token prediction en latencia y throughput frente a decodificacion autoregresiva clasica.
- Evaluacion de tecnicas de cuantizacion: util como caso de estudio de oQ y de la asignacion no uniforme de bits por capa, comparando calidad frente al modelo base en BF16.
- Fines educativos y de investigacion sobre alineacion: el sufijo "heretic" permite estudiar el efecto de ablaciones de alineacion, siempre que se documente el procedimiento (no incluido en el repo).
- No recomendado para produccion sin evaluacion previa: al no declararse licencia ni idiomas, su uso comercial es incierto y requiere verificacion legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de calidad multimodal, ni comparaciones con el modelo base en BF16. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 2,408 GiB en disco; en inferencia MLX se necesita al menos esa cantidad mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo de 4-6 GB de memoria unificada.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4). No es compatible directamente con CUDA sin conversion previa.
- GPU de consumo: cabe en cualquier Mac con 8 GB o mas de memoria unificada; en GPUs NVIDIA consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) requeriria conversion a otro formato (por ejemplo GGUF) y no se distribuye en ese formato.
- Opciones de despliegue: MLX (libreria nativa del checkpoint), oMLX/oQ. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no pueden usarse sin conversion. vLLM y TGI no soportan MLX de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ2.7-mtp (este) | 4,66 B | no disponible | Mixta 3-8 bits + BF16 (4,44 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-4B (base, BF16) | ~4,66 B | no disponible | BF16 | no disponible | safetensors |
| Qwen2.5-3B-Instruct (referencia de tamano similar) | 3,09 B | 32.768 tokens | BF16, GGUF, AWQ | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct (referencia de tamano similar) | 3,21 B | 131.072 tokens | BF16, GGUF, AWQ | Llama 3.2 Community License | safetensors, GGUF |

La comparacion con Qwen2.5-3B y Llama-3.2-3B es orientativa por tamano, no por generacion: ambos son modelos de la generacion anterior y no multimodales. No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue.
- Modelo derivado no auditado: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por terceros.
- Sufijo "heretic": implica una modificacion de alineacion no documentada; el modelo puede producir contenido que el original filtraria, con riesgo reputacional y legal.
- Cuantizacion agresiva: el 83,8 % de los pesos esta en 3 bits, lo que puede degradar tareas sensibles (matematicas, codigo, razonamiento de varios pasos) frente al BF16.
- Idiomas no declarados: no puede garantizarse un rendimiento correcto en castellano ni en otros idiomas distintos del ingles.
- Contexto no documentado: se desconoce la ventana maxima efectiva tras la cuantizacion.
- Formato propietario de MLX: no portable directamente a CUDA, ROCm ni a stacks de servidor convencionales.
- Riesgo de alucinacion: no cuantificado; sin benchmarks no puede estimarse su fiabilidad.
- Fecha de creacion futura (2026-11-12): el metadato del repositorio es anomalo, lo que sugiere que la publicacion puede ser reciente, de prueba o con fecha manipulada; conviene verificar la integridad de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ2.7-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible (no se enlaza en la model card)
- Paper o blog del modelo base: no disponible
- Demo o espacio asociado: no disponible
