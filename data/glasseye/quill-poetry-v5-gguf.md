# GLASSEYE/quill-poetry-v5-gguf

## Resumen

Quill poetry v5 (identificador `GLASSEYE/quill-poetry-v5-gguf`) es un modelo publicado en HuggingFace por el usuario GLASSEYE, distribuido unicamente en formato GGUF y etiquetado como modelo conversacional especializado en poesia, metrica ("meter") y reparacion de versos ("repair"). La model card es extremadamente breve: una linea en la que se define como "repair-heavy meter" y se indica el comando de ejecucion `ollama run quill`. No se documentan datos de entrenamiento, arquitectura base, composicion del dataset ni resultados de evaluacion.

El repositorio contiene 7.248.023.552 parametros (aproximadamente 7,25 mil millones) y ocupa 4,4 GB, un tamano coherente con una cuantizacion de 4-5 bits de un modelo de esa escala. La licencia declarada es Apache 2.0, lo que en principio permitiria uso comercial, aunque el autor no aporta informacion sobre el modelo base del que deriva ni sobre las obligaciones heredadas de ese hipotetico modelo original.

Su relevancia actual es limitada y muy nichada: se trata de un ajuste fino orientado a tareas de versificacion (corregir metrica, reparar rimas o completar estrofas) que puede ejecutarse en local mediante Ollama. No hay descargas, likes ni benchmarks publicados en el momento de redactar esta ficha, por lo que cualquier evaluacion debe considerarse provisional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica; el formato GGUF y el uso conversacional son compatibles con un transformer decoder-only, sin confirmar) |
| Parametros totales | 7.248.023.552 (aproximadamente 7,25 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio es GGUF; no se detallan los niveles publicados, aunque el tamano de 4,4 GB es coherente con 4-5 bits para ~7B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

Otros metadatos relevantes: etiquetas `gguf`, `poetry`, `quill`, `meter`, `repair`, `endpoints_compatible`, `region:us`, `conversational`; pipeline no disponible; creado el 2026-09-20 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card ni en los metadatos disponibles. El unico dato estructural cierto es el numero de parametros (7,25 mil millones) y el formato de distribucion (GGUF), lo que situa al modelo en la categoria de ~7B parametros. No se indica si deriva de un modelo base conocido, si se entreno desde cero, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO.

Respecto a los datos de entrenamiento, no hay ninguna cifra: ni numero de tokens, ni composicion del corpus, ni proporcion de texto poetico frente a texto general. El unico indicio funcional es la etiqueta "repair-heavy meter" de la model card, que sugiere un entrenamiento orientado a la correccion metrica y a la reparacion de versos, probablemente mediante ejemplos de pares (verso defectuoso, verso corregido). Se trata de una inferencia a partir de la descripcion, no de un dato confirmado. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica soporte de dialogos multi-turno, aunque no se detalla el formato de plantilla ni el tokenizador.
- Versificacion y metrica: la etiqueta `meter` apunta a capacidad de generar y ajustar versos a un patron metrico (numero de silabas, acentos, posiblemente rima).
- Reparacion de poemas: la etiqueta `repair` y la descripcion "repair-heavy meter" sugieren una especializacion en corregir versos mal formados o con metrica rota.
- Escritura poetica en castellano y/u otros idiomas: no confirmado; los idiomas soportados no estan documentados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles, y poco probables dado el tamano y el proposito declarado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Compatibilidad con Inference Endpoints: si, la etiqueta `endpoints_compatible` lo indica.

## Casos de uso

- Correccion metrica de poemas propios: un poeta o estudiante envia una estrofa y el modelo devuelve una version con el mismo contenido pero con el computo silabico y los acentos ajustados, aprovechando el entrenamiento especifico en "repair".
- Asistente de escritura creativa en local: integrado en un editor de texto mediante Ollama, el modelo sugiere continuaciones de verso sin enviar el manuscrito a un servicio en la nube, lo que resulta util para material inedito o sujeto a derechos.
- Herramienta educativa para analisis metrico: en un aula de literatura, el modelo puede servir como corrector automatico de ejercicios de versificacion, senalando donde falla la medida o la rima.
- Generacion de letras con estructura fija: composicion de letras para canciones o himnos donde se exige un numero concreto de silabas por linea; el modelo puede trabajar con una plantilla y reparar las lineas que no encajen.
- Preprocesado en un pipeline editorial: normalizacion de poemas recibidos en formatos inconsistentes (versos partidos, puntuacion irregular) antes de la maquetacion final, con revision humana posterior.
- Prototipado de chatbots creativos: dado su caracter conversacional, puede usarse como base para un bot de acompanamiento poetico o de "musa" interactiva en una aplicacion de escritura, asumiendo la necesidad de un filtrado de calidad adicional.
- Experimentacion con despliegue GGUF: como caso de uso tecnico, sirve para probar el ciclo completo de descarga, cuantizacion y servicio con llama.cpp u Ollama en una maquina de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco hay evaluaciones de metrica o rima especificas del dominio poetico. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (7,25B) y del tamano del repositorio (4,4 GB); no proceden de documentacion del autor.

- VRAM estimada para inferencia: en torno a 14,5 GB en FP16; aproximadamente 7,7 GB en cuantizacion de 8 bits; alrededor de 4,4-5,5 GB en cuantizaciones de 4-5 bits (coherente con el tamano del repositorio).
- GPU recomendadas: para FP16, A100 40 GB, H100 o dos RTX 4090; para cuantizacion de 4 bits, una sola RTX 3060 de 12 GB, RTX 4070, RTX 4090 o L4 resulta suficiente.
- Compatibilidad con GPU de consumo: si. Un modelo de ~7B en 4 bits cabe en GPUs consumer con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, e incluso Apple Silicon con 8-16 GB de memoria unificada). En CPU, con 8 GB de RAM y cuantizacion de 4 bits deberia ser funcional, con velocidad reducida.
- Opciones de despliegue: Ollama es la via documentada por el autor (`ollama run quill`); tambien llama.cpp, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para vLLM o TGI haria falta disponer de los pesos en safetensors o convertir el GGUF, algo que el repositorio no ofrece.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se han identificado modelos comparables dentro de la informacion proporcionada: no hay benchmarks compartidos, ni se conoce el modelo base, ni existen alternativas documentadas con la misma especializacion en metrica poetica. La tabla siguiente compara unicamente el nivel de especificaciones con alternativas generalistas de ~7-8B ampliamente conocidas, usando valores de referencia de sus respectivas model cards publicas; no implica ninguna comparacion de calidad, ya que quill-poetry no aporta resultados medibles.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| GLASSEYE/quill-poetry-v5-gguf | ~7,25B | no disponible | apache-2.0 | Poesia y metrica (GGUF) |
| Mistral 7B v0.1 | ~7,3B | 32k (referencia publica) | apache-2.0 | Proposito general |
| Llama 3.1 8B | ~8,0B | 128k (referencia publica) | Llama 3.1 Community License | Proposito general |
| Qwen2.5 7B | ~7,6B | 128k (referencia publica) | apache-2.0 | Proposito general, multilingue |

La diferencia practica principal es que quill-poetry no publica versiones en safetensors ni pesos completos, solo GGUF, lo que restringe su uso a motores de inferencia compatibles con ese formato.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay informacion sobre datos de entrenamiento, modelo base ni proceso de ajuste, lo que impide auditar sesgos o licencias heredadas.
- Riesgo de alucinacion: no evaluado. En tareas de metrica, un fallo tipico no es inventar hechos sino contar mal las silabas o imponer rimas forzadas que alteran el sentido del poema.
- Idiomas: no se declaran idiomas soportados. Aunque las etiquetas sugieren poesia en castellano, no hay confirmacion ni cobertura garantizada de otras lenguas.
- Longitud de contexto desconocida: sin este dato no es posible planificar el procesamiento de poemas largos, ciclos completos o antologias en una sola pasada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero si el modelo deriva de un base con licencia mas restrictiva (por ejemplo, la familia Llama), las condiciones reales podrian ser mas limitadas. Al no declararse el modelo base, este riesgo queda sin resolver.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin issues ni evaluaciones de terceros. No es una base recomendable para produccion sin validacion previa propia.
- Restricciones de despliegue: la distribucion exclusiva en GGUF limita el uso de frameworks como vLLM o TGI, orientados a safetensors, y complica el escalado en servidores de alto rendimiento.
- Necesita revision humana: en cualquier flujo editorial o educativo, las correcciones metricas generadas deberian pasar por un revisor, dado que no existen evaluaciones publicadas de precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v5-gguf
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a sitios de contenido para adultos sin ninguna relacion con el modelo, el autor ni la versificacion. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados.
