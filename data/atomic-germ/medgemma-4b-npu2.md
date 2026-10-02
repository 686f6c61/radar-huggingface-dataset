# Atomic-Germ/Medgemma-4B-NPU2

## Resumen

Medgemma-4B-NPU2 es una conversión cuantizada del modelo médico MedGemma 4B (variante instruct, `medgemma-4b-it`) publicada por el usuario Atomic-Germ. No se trata de un modelo entrenado desde cero, sino de un port del GGUF `medgemma-4b-it.i1-Q4_1.gguf` (generado por mradermacher) al formato propietario Q4NX de OpenFlowLM (OFLM), pensado específicamente para ejecutarse sobre las NPU AMD XDNA (plataformas Ryzen AI). El linaje del modelo arranca en `google/gemma-3-4b-pt`, que actúa como modelo base de la familia Gemma 3 en su tamaño de 4B.

El interés de esta ficha es doble. Por un lado, hereda el dominio de aplicación del MedGemma original: razonamiento clínico y multimodalidad en áreas como radiología, dermatología, patología, oftalmología y radiografías de tórax, tal y como reflejan las etiquetas del repositorio. Por otro, el artefacto publicado aquí es fundamentalmente un empaquetado de inferencia: un pesos `model.q4nx` de 3,51 GB que solo funciona con el runtime OpenFlowLM y que se registra mediante la herramienta `oflm-add`, no un checkpoint estándar cargable con Transformers puro.

Es relevante ahora porque propone una vía de despliegue médico en hardware de borde con NPU integrada, un nicho donde la oferta de modelos clínicos cuantizados es todavía escasa. Conviene advertir, no obstante, que la model card del autor es muy escueta en cuanto a arquitectura, datos de entrenamiento y evaluación, y que la información disponible no permite verificar cifras de rendimiento ni condiciones detalladas de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | decoder transformer de la familia Gemma 3 (`gemma3_text`), según las etiquetas del repositorio; detalles finos no disponibles |
| Parametros totales | 4B (aproximado, deducido del nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0 / Q4_1 / BF16 según la tabla del autor); derivado de un GGUF Q4_1 |
| Idiomas soportados | no disponible |
| Licencia | other (no se detallan los terminos concretos) |
| Formato de pesos | `model.q4nx` (formato propietario de OpenFlowLM; no es GGUF ni safetensors) |

## Arquitectura y entrenamiento

La informacion disponible identifica la familia del modelo como `gemma3` y el modelo base como `google/gemma-3-4b-pt`, lo que apunta a una arquitectura transformer decoder de tipo Gemma 3. Sin embargo, la model card no describe la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo medico original. Tampoco se detalla ninguna innovacion tecnica de atencion o de decodificacion: todo lo que se aporta es el procedimiento de conversion.

El proceso de empaquetado si esta documentado de forma explicita. El autor indica que el contenedor se genero con un unico comando `oflm pack -i .../medgemma-4b-it.i1-Q4_1.gguf -o .../Medgemma-4B-NPU2 -s Atomic-Germ/Medgemma-4B-NPU2`, partiendo del GGUF `medgemma-4b-it.i1-Q4_1.gguf`. El resultado es un artefacto Q4NX que combina pesos en Q8_0, Q4_1 y BF16, con un total de 3,51 GB, disenado para el runtime OpenFlowLM version 0.1.0 y para ejecucion sobre NPU AMD XDNA. Es importante subrayar que no se ha reentrenado ni ajustado el modelo: la unica transformacion es la cuantizacion y el reempaquetado para un backend de hardware especifico.

## Capacidades

- Generacion de texto conversacional en modo instruct (el modelo de origen es `medgemma-4b-it`, es decir, ajustado para seguir instrucciones).
- Procesamiento de imagen y texto (`image-text-to-text` como pipeline declarado, compatible con tareas de vision medica).
- Razonamiento clinico orientado a dominios como radiologia, dermatologia, patologia y oftalmologia, segun las etiquetas del repositorio.
- Analisis de radiografias de torax (`chest-x-ray`), una de las tareas explicitamente etiquetadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Modo "thinking" o capacidades especiales de razonamiento explicito: no disponible.
- Inferencia sobre NPU AMD XDNA a traves del runtime OpenFlowLM.

## Casos de uso

- Triaje radiologico asistido: dado que el modelo conserva la etiqueta `chest-x-ray` y la modalidad image-text, puede emplearse para generar descripciones preliminares de radiografias de torax que un radiologo revise despues. Es adecuado como primer filtro por su tamano reducido (4B) y su despliegue en NPU.
- Soporte a la decision clinica en consulta: el modelo puede resumir hallazgos y proponer diagnosticos diferenciales en dominios etiquetados (dermatologia, oftalmologia), siempre como ayuda y no como sustituto del criterio medico.
- Documentacion clinica automatizada: generacion de borradores de informes a partir de imagenes y notas, aprovechando la naturaleza instruct del modelo de origen.
- Despliegue en equipos de borde con Ryzen AI: al estar compilado en Q4NX para NPU XDNA, encaja en escenarios donde no hay GPU dedicada ni conectividad fiable, como consultorios o unidades moviles.
- Prototipado de investigacion multimodal medica: util para experimentar con pipelines image-text-to-text en hardware NPU antes de escalar a modelos mayores.
- Procesamiento de imagenes medicas en lote offline: el artefacto de 3,51 GB permite distribuir el modelo en estaciones de trabajo sin depender de servicios en la nube, lo que ayuda con requisitos de privacidad de datos de pacientes.
- Educacion y formacion medica: generacion de explicaciones y casos de estudio a partir de imagenes etiquetadas, con supervision docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de tareas medicas, y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- El artefacto principal `model.q4nx` ocupa 3,51 GB en disco; la VRAM o memoria unificada necesaria para inferencia sera al menos de ese orden, aunque la cifra exacta de pico no esta disponible.
- Hardware objetivo: NPU AMD XDNA (plataformas Ryzen AI). El modelo esta compilado para el runtime OpenFlowLM, no para CUDA.
- GPU recomendadas: no disponible; el diseno apunta a NPU, no a GPUs tipo A100, H100 o RTX 4090. No se indica compatibilidad con estas.
- Encaje en GPU de consumo: no confirmado en la informacion proporcionada.
- Opciones de despliegue: exclusivamente el runtime OpenFlowLM mediante `oflm-add` y `oflm run`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (de hecho, el autor aclara que no es un fichero GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Medgemma-4B-NPU2 (este) | ~4B | no disponible | image-text-to-text | other | Q4NX para NPU AMD XDNA (OpenFlowLM) |
| MedGemma 4B original (Google) | ~4B | no disponible en la info | multimodal medico | no disponible en la info | safetensors segun Transformers |
| Gemma 3 4B PT (`google/gemma-3-4b-pt`) | 4B | no disponible en la info | texto | no disponible en la info | safetensors |

No se dispone de datos de rendimiento comparativos, por lo que la comparacion se limita a parametros, formato y disponibilidad. No se pueden establecer diferencias cuantitativas de calidad entre este port y las alternativas.

## Limitaciones y advertencias

- La informacion publicada es muy limitada: no hay datos de entrenamiento, evaluacion, sesgos ni idiomas, lo que dificulta una validacion rigurosa.
- Riesgo de alucinacion: es un modelo de 4B de la familia Gemma 3 aplicado a dominio clinico; en ausencia de benchmarks, no puede asumirse fiabilidad diagnostica. Cualquier uso medico debe pasar por revision humana.
- Restricciones de licencia: la licencia figura como `other` sin detallar terminos. No esta claro si permite uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Compatibilidad de hardware muy restringida: al ser un artefacto Q4NX propietario, no es portable a ecosistemas CUDA, ROCm estandar, vLLM o llama.cpp. El propio autor advierte que no es GGUF.
- Inconsistencia en los metadatos: el campo `base_model` apunta al propio repositorio (`Atomic-Germ/Medgemma-4B-NPU2`), lo que genera ambiguedad sobre cual es exactamente el checkpoint origen. La cadena de procedencia declarada pasa por un GGUF de mradermacher, no por el modelo oficial de Google.
- El comando de instalacion de la model card usa `--family qwen3.5` para un modelo de familia gemma3, lo que resulta llamativo y conviene verificar antes de reproducir el despliegue.
- Limitaciones de contexto e idioma: no documentadas, pero al ser una cuantizacion Q4 de un modelo de 4B, es probable una degradacion de precision frente al modelo original sin cuantizar (no cuantificada en la informacion disponible).
- Ausencia de validacion clinica regulatoria: no se declara conformidad con marcas CE, FDA u otras certificaciones sanitarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Medgemma-4B-NPU2
- Modelo base declarado: https://huggingface.co/google/gemma-3-4b-pt
- Referencia al GGUF de origen (mradermacher): `mradermacher/medgemma-4b-it-i1-GGUF` (citado en la model card)
- Runtime OpenFlowLM: no se proporciona URL en la informacion disponible
- Papers citados en las etiquetas del repositorio (identificadores arXiv): 2303.15343, 2507.05201, 2405.03162, 2106.14463, 2412.03555, 2501.19393, 2009.13081, 2102.09542, 2411.15640, 2404.05590, 2501.18362 (autor y titulo no detallados en la informacion proporcionada)
