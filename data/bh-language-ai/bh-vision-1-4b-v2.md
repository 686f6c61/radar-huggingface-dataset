# BH-Language-AI/bh-vision-1-4b-v2

## Resumen

BH-Vision-1-4B-v2 es un adaptador QLoRA de tipo PEFT para el modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por BH-Language-AI. Su objetivo es especializar un modelo visión-lenguaje genérico en tareas de OCR y respuesta a preguntas sobre documentos en bosnio (código ISO `bs`), un idioma con escasa representación en los corpus de entrenamiento de los grandes modelos multilingües. La segunda generación del adaptador corrige defectos de la primera: reduce el learning rate de 2e-5 a 1e-5 y elimina dos duplicados y cinco imágenes de validación filtradas del conjunto de entrenamiento.

El modelo no es un modelo base autónomo, sino un adaptador de rango 16 que se carga sobre los pesos originales de Qwen2.5-VL-3B-Instruct mediante `peft`. El entrenamiento es deliberadamente corto (40 pasos máximos) y el autor reconoce explícitamente que la mayor parte del rendimiento procede de la base: 87,6 % en el conjunto de validación y 49,3 % en el conjunto held-out sin adaptador. La contribución del adaptador es de aproximadamente un punto porcentual consistente en las cuatro mediciones realizadas.

Su relevancia radica en dos factores: demuestra que un ajuste fino ligero y de bajo coste puede mejorar marginalmente el OCR en un idioma de bajos recursos, y documenta con transparencia la brecha entre datos sintéticos (90,3 % de exact-match) y documentos reales (54-56 %), una advertencia útil para cualquiera que evalúe adaptadores similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT, rango 16) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB en el repositorio; la base Qwen2.5-VL-3B-Instruct tiene ~3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA, lo que implica cuantizacion 4-bit durante el entrenamiento; no se detallan formatos de inferencia) |
| Idiomas soportados | Bosnio (`bs`) como idioma objetivo; la base soporta multilingue |
| Licencia | Apache-2.0 para el adaptador; Qwen Research License para el modelo base |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El adaptador tiene rango 16, learning rate 1e-5 (rebajado desde 2e-5 en la v1) y un máximo de 40 pasos de entrenamiento. La v2 limpia el conjunto de datos eliminando dos duplicados y cinco imágenes de validación que se habían filtrado al conjunto de entrenamiento, lo que invalida parcialmente las métricas de la v1 y explica parte de la mejora reportada.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor documenta el proceso en `docs/TRAINING.md` del repositorio de GitHub. La innovación técnica principal es la limpieza de fugas de datos entre validación y entrenamiento, junto con la reducción del learning rate para evitar sobreajuste en un ajuste de muy pocos pasos.

## Capacidades

- Generación de texto e imagen-a-texto: el adaptador responde a preguntas sobre imágenes, con foco en documentos.
- OCR en bosnio: extracción de números, nombres y respuestas de tipo sí/no a partir de documentos escaneados o fotografiados.
- Respuesta a preguntas sobre documentos (document VQA) en el dominio de documentos reales bosnios.
- Modo conversacional: la model card recomienda el uso con instrucción de sistema para forzar respuestas cortas y sin explicaciones.
- Capacidades heredadas de la base Qwen2.5-VL-3B-Instruct: razonamiento visual, descripción de imágenes y comprensión multilingüe, aunque no se han evaluado específicamente en este adaptador.
- Soporte de tool calling y agentes: no documentado para este adaptador.

## Casos de uso

- Digitalización de formularios y documentos administrativos bosnios: el adaptador extrae campos concretos (números, nombres, fechas) de imágenes de documentos con una instrucción de sistema que restringe la salida al valor solicitado, lo que facilita el parseo posterior.
- Validación de documentos de identidad en procesos KYC: con preguntas de tipo sí/no sobre la presencia o coincidencia de datos en la imagen, el modelo puede actuar como primer filtro en un pipeline de verificación documental.
- Extracción de datos de facturas y recibos: el formato de respuesta corta y determinista reduce la necesidad de post-procesado y encaja en pipelines ETL que consumen texto estructurado.
- Atención al cliente con adjuntos de imagen: integrado en un chatbot, el adaptador puede responder preguntas sobre capturas o documentos que el usuario envíe, siempre que la consulta esté en bosnio y el dominio sea documental.
- Procesamiento por lotes de archivos escaneados: al ser un adaptador de 0,2 GB sobre una base de 3B, puede desplegarse en una GPU de gama media para clasificar y extraer información de lotes de imágenes.
- Evaluación comparativa de adaptadores de bajo coste: sirve como referencia reproducible para investigadores que estudien la brecha entre datos sintéticos y documentos reales en idiomas de bajos recursos.
- Prototipado rápido de OCR específico de dominio: con 40 pasos de entrenamiento y QLoRA, el mismo enfoque puede replicarse para otros idiomas o dominios con recursos limitados.

## Benchmarks y rendimiento

Resultados de exact-match normalizado reportados por el autor:

| Conjunto | v1 | v2 (este adaptador) | Base sin adaptador |
|---|---|---|---|
| v03-val (217, sintético) | 90,3 % (92,2 % con sys) | 90,3 % (93,5 % con sys) | 87,6 % |
| held-out v01 (73, documentos reales) | 49,3 % (54,8 % con sys) | — (56,2 % con sys) | 49,3 % |
| held-out v02 (87, +FZS) | 52,9 % con sys | 54,0 % con sys | No disponible |

El autor indica que la mejora es de aproximadamente +1 pp sobre la v1 en las cuatro mediciones, con cada medición individual dentro del ruido pero con dirección consistente. La brecha entre el conjunto sintético (90,3 %) y los conjuntos held-out de documentos reales (54-56 %) es el dato más relevante para evaluar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo de 3B en precisión completa requiere aproximadamente 6-7 GB, y en cuantización 4-bit alrededor de 2-3 GB, pero estos valores no los confirma el autor.
- GPU recomendadas: no especificadas. El adaptador se carga sobre Qwen2.5-VL-3B-Instruct, por lo que los requisitos son los de la base.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 8 GB o más, aunque no está confirmado por el autor.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (versión 5.22.2) y `peft` (versión 0.21.2). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento OCR bosnio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Vision-1-4B-v2 | Adaptador sobre base de ~3B | No disponible | 54-56 % en held-out real | Apache-2.0 (adaptador) / Qwen Research License (base) | Hugging Face |
| Qwen2.5-VL-3B-Instruct (base) | ~3B | No disponible | 49,3 % en held-out v01 | Qwen Research License | Hugging Face |
| BH-Vision-1-4B-v1 | Adaptador sobre base de ~3B | No disponible | 49,3-54,8 % en held-out | Apache-2.0 (adaptador) | Hugging Face |

No se dispone de información sobre otros adaptadores comparables para OCR en bosnio en la información proporcionada.

## Limitaciones y advertencias

- Brecha sintético-real: el rendimiento cae de 90,3 % en datos sintéticos a 54-56 % en documentos reales, lo que limita su uso en producción sin validación adicional sobre el dominio objetivo.
- Entrenamiento muy corto: 40 pasos y rango 16 implican una especialización limitada; el autor reconoce que la mayor parte del rendimiento procede de la base.
- Dependencia de la instrucción de sistema: las métricas mejoran entre 1 y 5 pp con instrucción de sistema, lo que sugiere que el modelo sin ella puede generar respuestas más verbosas o menos precisas.
- Fugas de datos corregidas: la v1 tenía cinco imágenes de validación filtradas al entrenamiento, por lo que sus métricas no son directamente comparables.
- Idiomas: solo se documenta bosnio; no hay evaluación de otros idiomas ni de variedades del serbocroata.
- Licencia del modelo base: aunque el adaptador es Apache-2.0, la Qwen Research License del base puede imponer restricciones al uso comercial; debe revisarse antes de desplegar.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de OCR con documentos reales, la tasa de error del 44-46 % implica respuestas incorrectas frecuentes.
- Sin datos de sesgos, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-4b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Documentación de entrenamiento: https://github.com/BH-Language-AI/bh-vision/blob/main/docs/TRAINING.md
