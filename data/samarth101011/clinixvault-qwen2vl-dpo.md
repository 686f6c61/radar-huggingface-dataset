# Samarth101011/clinixvault-qwen2vl-dpo

## Resumen

ClinixVault DPO-aligned Qwen2-VL 2B es un adaptador de ajuste fino (PEFT/QLoRA) construido sobre el modelo base Qwen/Qwen2-VL-2B-Instruct, publicado por el usuario Samarth101011. Su proposito declarado es mejorar la factualidad medica y suprimir las alucinaciones en la interpretacion de radiografias, mediante una alineacion por DPO (Direct Preference Optimization) sobre el modelo instructivo original. Forma parte de la denominada ClinixVault Edge Intelligence Suite, orientada a estaciones de trabajo clinicas aisladas (air-gapped) sin salida de datos.

El modelo hereda la arquitectura multimodal de Qwen2-VL en su variante de 2.000 millones de parametros, capaz de procesar entradas de imagen y texto y generar respuestas textuales. El adaptador se distribuye en formato safetensors y requiere cargar por separado el modelo base y acoplarlo mediante la libreria PEFT. La licencia declarada es Apache 2.0.

La relevancia de esta publicacion es limitada pero concreta: propone un enfoque de alineacion por preferencias aplicado a un dominio de alto riesgo como la radiologia, con un modelo lo bastante pequeno para desplegarse en hardware de borde. No obstante, el repositorio no incluye informacion sobre volumen de datos de entrenamiento, composicion del dataset de preferencias, resultados de evaluacion ni detalles del proceso de DPO, lo que impide validar las afirmaciones de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) heredada de Qwen2-VL-2B-Instruct; adaptador PEFT/QLoRA sobre el modelo base |
| Parametros totales | 2.000 millones (modelo base); numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2-VL-2B-Instruct soporta contexto nativo de 32.768 tokens, ampliable, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible; el ejemplo de uso emplea torch.float16. El ajuste se realizo con QLoRA, lo que implica cuantizacion durante el entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango acoplado al modelo base Qwen2-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y emplea atención con escalado dinamico de resolucion para procesar imagenes de distinto tamano. El ajuste se realizo mediante PEFT con QLoRA, es decir, cuantizacion del modelo base durante el entrenamiento y entrenamiento de adaptadores de rango reducido, seguido de una fase de alineacion por DPO sobre pares de preferencias. La model card no especifica el rango de los adaptadores, el numero de pasos, la tasa de aprendizaje ni el hardware utilizado.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset de imagenes radiologicas ni el origen de los pares de preferencias empleados en DPO. Tampoco se documenta si hubo una fase supervisada previa (SFT) o si el DPO se aplico directamente sobre el modelo instructivo. La unica innovacion tecnica declarada es la propia alineacion por DPO orientada a reducir alucinaciones en el dominio radiologico, afirmacion que no viene acompanada de metricas que la respalden.

## Capacidades

- Generacion de texto e interpretacion de imagenes medicas (radiografias) en un pipeline image-text-to-text.
- Descripcion y analisis de hallazgos radiologicos, segun el proposito declarado en la model card.
- Alineacion por preferencias orientada a mejorar la factualidad y reducir alucinaciones en el dominio clinico.
- Capacidades multimodales heredadas del modelo base Qwen2-VL-2B-Instruct (procesamiento conjunto de imagen y texto).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision adicional o audio: no disponible.

## Casos de uso

- Apoyo a la lectura de radiografias en entornos aislados: el modelo puede desplegarse en estaciones de trabajo air-gapped, tal como declara la model card, y generar descripciones textuales de hallazgos sin que las imagenes salgan del perimetro clinico.
- Segunda lectura asistida en radiologia: integrado en un visor PACS, el adaptador puede producir un borrador de informe que el radiologo revisa y corrige, aprovechando la alineacion DPO para reducir afirmaciones no sustentadas en la imagen.
- Triaje preliminar de estudios: en flujos de alto volumen, el modelo puede clasificar y resumir estudios normales frente a aquellos que requieren revision prioritaria, siempre bajo supervision facultativa.
- Formacion y docencia medica: generacion de descripciones razonadas de casos radiologicos para residentes, con la ventaja de ejecutarse en local y sin exponer datos de pacientes.
- Investigacion en alineacion clinica: el adaptador sirve como punto de partida para estudiar tecnicas de DPO aplicadas a dominios medicos y comparar su efecto sobre la tasa de alucinaciones.
- Despliegue en hardware de borde: con 2.000 millones de parametros, el modelo es viable en equipos con GPU de consumo, lo que facilita prototipos en consultas o laboratorios sin infraestructura de centro de datos.
- Verificacion de pipelines multimodales: util como componente de prueba en sistemas de documentacion clinica que necesiten convertir imagen en texto estructurado antes de un paso de validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el modelo base de 2.000 millones de parametros, en float16 requeriria en torno a 4-5 GB de VRAM, y en cuantizacion de 4 bits alrededor de 1,5-2,5 GB, si bien estas cifras no estan confirmadas para este adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, serian viables GPUs de consumo como RTX 3060, RTX 4060 o superiores; para uso profesional, A100 o H100 no serian necesarias.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se documenta en la model card.
- Opciones de despliegue: el ejemplo oficial emplea Transformers con AutoModelForVision2Seq y PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la condicion de adaptador PEFT complica el uso directo en algunos de estos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinixVault DPO Qwen2-VL 2B (este modelo) | 2.000 M (base) + adaptador | No disponible | Radiologia, alineacion DPO | Apache 2.0 | Hugging Face, adaptador PEFT |
| Qwen2-VL-2B-Instruct | 2.000 M | 32.768 tokens (nativo) | Multimodal general | Apache 2.0 | Hugging Face, pesos completos |
| Qwen2-VL-7B-Instruct | 7.000 M | 32.768 tokens (nativo) | Multimodal general | Apache 2.0 | Hugging Face, pesos completos |
| LLaVA-Med | 7.000 M (aprox.) | No disponible | Biomedico | Licencia especifica del proyecto | Hugging Face, pesos completos |

La comparativa se limita a modelos de referencia por tamano y dominio; no se dispone de datos de rendimiento de este adaptador que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion que respalden la mejora de factualidad ni la reduccion de alucinaciones declarada en la model card.
- El modelo es un adaptador PEFT y no puede utilizarse de forma autonoma: requiere descargar y cargar el modelo base Qwen2-VL-2B-Instruct por separado.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que la informacion esta incompleta.
- No se documenta el dataset de entrenamiento ni el proceso de DPO, lo que impide auditar sesgos, cobertura demografica o posibles fugas de datos.
- Riesgo de alucinacion persistente: aunque el objetivo del ajuste es reducirlo, un modelo de 2.000 millones de parametros sigue siendo propenso a generar hallazgos inexistentes en imagenes medicas.
- Uso clinico restringido: la propia model card indica que el modelo es para apoyo a la decision clinica bajo supervision de un profesional licenciado; no debe emplearse como diagnostico autonomo.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de la normativa de dispositivos medicos (MDR en la UE) ni de las obligaciones de proteccion de datos sanitarios.
- No se documenta el comportamiento del modelo ante imagenes fuera de dominio (modalidades distintas a la radiografia) ni ante artefactos de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/Samarth101011/clinixvault-qwen2vl-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers para modelos vision-lenguaje: https://huggingface.co/docs/transformers
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
