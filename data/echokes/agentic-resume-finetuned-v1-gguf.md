# echokes/agentic-resume-finetuned-v1-GGUF

## Resumen

Agentic Resume Fine-tuned V1 es un modelo de generacion de texto derivado de Qwen/Qwen3.5-4B, afinado mediante LoRA (adaptador V4.1) para la tarea concreta de redaccion y adaptacion de curriculos. Lo publica el usuario echokes como artefacto reproducible de un proyecto escolar, en formato GGUF cuantizado a Q4_K_M, con un tamano aproximado de 2,7 GB y 4.205.751.296 parametros totales. Su proposito no es competir como modelo generalista, sino servir como pieza desplegable del flujo "Agentic Resume Builder", que genera curriculos ajustados a una oferta y a restricciones dadas.

El modelo hereda la arquitectura del base Qwen3.5-4B (no se detalla en la informacion disponible) y se distribuye con licencia Apache 2.0. La relevancia practica es acotada: se trata de un fine-tuning de nicho, con solo 50 descargas y sin datos publicos de benchmarks, orientado a inferencia local mediante Ollama. El autor advierte explicitamente de que no debe usarse para contratacion autonoma ni ranking de candidatos, y de que las salidas requieren revision humana.

La ficha se basa unicamente en la model card y los metadatos de Hugging Face; cualquier dato no documentado se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen/Qwen3.5-4B (detalle no disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto se obtiene fusionando el adaptador LoRA V4.1 en el modelo base oficial Qwen/Qwen3.5-4B, convirtiendo el modelo fusionado a GGUF, excluyendo los tensores auxiliares de prediccion del siguiente token de la arquitectura de origen y cuantizando a Q4_K_M. El resultado es un unico fichero de aproximadamente 2,7 GB (`agentic-resume-v4-1-no-nextn-q4_K_M.gguf`) con SHA-256 `30b3ac98715ad1e0aee49477606840e00d0e4339725f8c31e6f99ac56596f804`.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO. El autor indica que el dataset de entrenamiento no se incluye y que no se ha completado una revision legal o de privacidad formal del linaje de los datos de origen. El Modelfile suministrado configura los tokens de parada terminales de Qwen; los prompts de aplicacion y los parametros de generacion residen en el repositorio del proyecto.

## Capacidades

- Generacion de texto orientada a la redaccion y adaptacion de curriculos.
- Retencion de restricciones: segun el autor, V4.1 mejoro varios casos de retencion de restricciones, aunque no fue consistentemente superior al modelo de comparacion.
- Cumplimiento de formato Markdown: produjo los encabezados requeridos en los siete casos de desarrollo registrados.
- Ausencia de tokens de control de terminal en bruto en esas siete salidas.
- Soporte de conversacion (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Generacion de curriculos adaptados a una oferta concreta: el modelo recibe los datos del candidato y los requisitos del puesto y produce un borrador en Markdown con los encabezados exigidos, lo que facilita su integracion en un pipeline que valide la estructura de forma automatica.
- Prototipado local de asistentes de empleabilidad: al ser un GGUF de 2,7 GB desplegable con Ollama, permite iterar en un portatil sin GPU dedicada ni cuenta en Hugging Face.
- Reproducibilidad de experimentos academicos: el artefacto incluye hash SHA-256 y un repositorio de trazabilidad (`v5-workflow-rollback`), lo que permite replicar exactamente la inferencia evaluada en el proyecto escolar.
- Evaluacion comparativa de fine-tunings: sirve como referencia cuantizada frente al baseline `qwen3.5:4b-q4_K_M` para medir el efecto del adaptador en tareas de redaccion con restricciones.
- Generacion de resumenes profesionales con revision humana: util para producir un primer borrador de perfil o resumen que un revisor editorial pule; el autor advierte de un caso con encuadre negativo indeseado, por lo que la revision es obligatoria.
- Integracion en herramientas internas de RRHH con supervencion: puede asistir en la redaccion de descripciones de puesto o en la reformulacion de logros, siempre con validacion factual humana y sin uso para ranking o decision autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion documentada es cualitativa y sobre siete casos de desarrollo: cumplimiento de encabezados Markdown en los siete, ausencia de tokens de control en bruto en los siete, mejora parcial en retencion de restricciones y un caso de encuadre negativo en un resumen revisado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB de pesos en Q4_K_M mas overhead de contexto; cabe en GPUs consumer con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para CPU pura, la inferencia es viable por el reducido tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas.
- Opciones de despliegue: Ollama (flujo documentado por el autor con Modelfile), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agentic Resume Fine-tuned V1 (este) | 4.205.751.296 | no disponible | Apache 2.0 | GGUF Q4_K_M | Fine-tuning de nicho para curriculos; 50 descargas |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | no disponible | no disponible en esta ficha | safetensors y otros | Modelo base sin adaptador; baseline del proyecto |
| `qwen3.5:4b-q4_K_M` (baseline Ollama) | 4B (aproximado) | no disponible | no disponible en esta ficha | GGUF Q4_K_M | Baseline de comparacion citado por el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica que V4.1 no fue consistentemente superior al modelo de comparacion en retencion de restricciones.
- Se observo encuadre negativo indeseado en uno de los resumenes revisados.
- La cuantizacion Q4_K_M introduce diferencias adicionales respecto a la evaluacion del adaptador en BF16.
- Los curriculos generados requieren revision factual y editorial humana.
- Prohibido su uso para contratacion autonoma o ranking de candidatos, segun el autor.
- No se ha completado una revision legal o de privacidad formal del linaje de los datos de entrenamiento.
- El dataset de entrenamiento no se incluye y su disponibilidad publica no otorga permiso para redistribuirlo.
- Sesgos conocidos: no documentados de forma especifica; el encuadre negativo observado es un indicio de posible sesgo editorial.
- Riesgo de alucinacion: no cuantificado, pero relevante en generacion de datos facticos de candidatos.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero las advertencias del autor sobre contratacion y datos de origen deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/echokes/agentic-resume-finetuned-v1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto (rama de trazabilidad): https://github.com/pohyongzhi/Agentic-Resume-Builder/tree/v5-workflow-rollback
- Fichero GGUF: https://huggingface.co/echokes/agentic-resume-finetuned-v1-GGUF/resolve/main/agentic-resume-v4-1-no-nextn-q4_K_M.gguf
- Modelfile: https://huggingface.co/echokes/agentic-resume-finetuned-v1-GGUF/resolve/main/Modelfile
