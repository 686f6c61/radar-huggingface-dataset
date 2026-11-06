# dannywang930/Llama-3.2-3B-Instruct-nexec-directions

## Resumen

`dannywang930/Llama-3.2-3B-Instruct-nexec-directions` no es un modelo de lenguaje, sino un conjunto de artefactos auxiliares para defenderse de ataques de inyeccion de prompts (prompt injection) sobre `meta-llama/Llama-3.2-3B-Instruct`. En concreto, contiene las "direcciones de instruccion" (instruction directions) por capa que el paquete `nexec` utiliza para aplicar *activation steering* en tiempo de inferencia sobre el modelo base de Meta. El autor del repositorio es `dannywang930`, y el contenido esta vinculado al proyecto `nexec` de ThePeeps191, una reimplementacion del metodo NXDirection de NVIDIA Research.

El problema que aborda es relevante: los asistentes basados en LLM que procesan contenido no confiable (documentos, correos, resultados de busqueda) son vulnerables a que instrucciones maliciosas embebidas en ese contenido secuestren el comportamiento del modelo. La tecnica propuesta no reentrena el modelo, sino que resta proyectivamente una direccion de activacion asociada a la "instruccion" en cada capa del decoder, unicamente en los tokens marcados como no confiables. Segun la model card, esto reduce la tasa de exito de ataque en BIPIA del 22,9% al 8,3% sin degradar la utilidad limpia.

Es importante subrayar que el repositorio pesa 0,0 GB y no contiene pesos: solo estadisticas de activacion (una direccion unitaria por capa y las medias de clase usadas por la puerta de activacion). Para usarlo se necesita el modelo base Llama 3.2 3B Instruct y el paquete `nexec`. La relevancia actual reside en que ofrece una mitigacion ligera, sin entrenamiento adicional y compatible con despliegues existentes, aunque el propio autor la describe como mitigacion y no como frontera de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (artefactos de activation steering sobre Llama 3.2 3B Instruct, transformer decoder-only) |
| Parametros totales | No disponible en el repositorio (el modelo base Llama 3.2 3B Instruct tiene 3,2 mil millones, dato no presente en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio no contiene pesos) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3.2 Community License (Copyright © Meta Platforms, Inc.) |
| Formato de pesos | No aplica: el repositorio contiene estadisticas de activacion por capa y un `nexec.json` de configuracion, no pesos |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo. Lo que contiene son direcciones de instruccion calculadas a partir de `meta-llama/Llama-3.2-3B-Instruct` (revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`): por cada una de las 28 capas del decoder se almacena una direccion unitaria `d` y un sesgo `b`, ademas de las medias de clase que usa la puerta. El ajuste se realizo sobre "corpus v1", compuesto por 178 ejemplos etiquetados con sha256 `cf28b236d24e5f27a8bbc94f487ed7667ad0b06fae149cec0e0b22d526bd1530`.

En inferencia, para cada token marcado como no confiable mediante `untrusted(...)`, y en cada capa, se aplica la transformacion `h ← h − α · ReLU(h·d − b) · d`. La configuracion incluida usa las 28 capas, α = 1 y puerta "raw". Es una intervencion determinista y sin coste de entrenamiento en el momento del despliegue; el coste computacional es un producto escalar y una resta por token no confiable y capa. La innovacion es de seguridad, no arquitectonica: se reimplementa NXDirection de NVIDIA como capa de mitigacion integrada en la API de generacion de `nexec`, permitiendo marcar contenido no confiable a nivel de mensaje.

## Capacidades

- Mitigacion de prompt injection en contenido no confiable: reduce la influencia de instrucciones embebidas en documentos, correos o resultados externos.
- Marcado selectivo de tokens no confiables mediante el envoltorio `untrusted(...)` en la API de `nexec`.
- Compatibilidad con el modelo base `meta-llama/Llama-3.2-3B-Instruct` y su pipeline de generacion habitual.
- Aplicacion por capa (28 capas) con control del coeficiente α y del tipo de puerta.
- Carga directa desde Hugging Face (`hf://dannywang930/Llama-3.2-3B-Instruct-nexec-directions`) o desde el paquete `nexec` (los ficheros van incluidos en el paquete).
- No anade capacidades generativas nuevas: hereda las del modelo base (texto, razonamiento, codigo, multilingue segun Llama 3.2), pero la informacion proporcionada no detalla esas capacidades para este artefacto.
- No soporta tool calling ni agentes por si mismo; es una capa de defensa que se compone con el modelo base.

## Casos de uso

- Resumen de documentos externos: se marca el documento como `untrusted(...)` y se pide un resumen; la direccion de instruccion atenua ordenes maliciosas embebidas en el texto, manteniendo la utilidad de resumen (55,5% en BIPIA clean utility segun la model card).
- Question answering sobre pasajes no confiables: en SQuAD con pasaje no confiable, la model card reporta 91,0% de exactitud, identica a la version sin defensa, lo que permite usar el modelo en pipelines de extraccion de respuestas sobre fuentes externas.
- Procesamiento de correos o tickets de soporte: el cuerpo del mensaje del usuario se marca como no confiable mientras las instrucciones del sistema permanecen confiables, reduciendo el riesgo de que un cliente inyecte comandos.
- Navegacion web asistida o agentes de lectura: los resultados de busqueda o el HTML raspado se envuelven como no confiables antes de pasarlos al modelo, limitando ataques de inyeccion indirecta.
- Evaluacion de seguridad de LLM: el repositorio sirve como referencia reproducible para medir la eficacia de NXDirection frente a BIPIA y comparar con lineas base (sin defensa y con direccion aleatoria).
- Despliegue de bajo coste en entornos con Llama 3.2 3B: al no requerir reentrenamiento ni GPU adicional, se puede integrar en servicios existentes que ya sirven el modelo base.
- Investigacion en interpretabilidad y activation steering: las direcciones por capa y las medias de clase permiten analizar como se representa la "instruccion" en el espacio de activaciones de un modelo pequeno.

## Benchmarks y rendimiento

Datos publicados en la model card (BIPIA con juez Claude Sonnet 5.5, 3.300 muestras atacadas; utilidad limpia sobre 300 muestras; SQuAD con 200 muestras y pasaje no confiable):

| Metrica | Sin defensa | nexec | Direccion aleatoria (mismos tamanos de edicion) |
|---|---|---|---|
| BIPIA attack success | 22,9% | 8,3% | 22,3% |
| BIPIA clean utility | 55,0% | 55,5% | No disponible |
| SQuAD document-QA accuracy | 91,0% | 91,0% | No disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el repositorio no contiene pesos ni evaluaciones del modelo base.

## Requisitos de hardware

- VRAM: depende exclusivamente del modelo base Llama 3.2 3B Instruct; el repositorio en si no anade requisitos de memoria significativos (unas pocas estadisticas por capa).
- GPU recomendadas: cualquier GPU capaz de servir Llama 3.2 3B; no se especifican modelos concretos en la informacion proporcionada.
- GPU de consumo: el modelo base de 3B es apto para GPUs de consumo, aunque la informacion proporcionada no detalla cuantizaciones ni requisitos exactos.
- Despliegue: el paquete `nexec` se instala via `pip install nexec` y se integra con el pipeline de generacion de Hugging Face Transformers; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El coste adicional por token no confiable es un producto escalar y una resta por capa (28 capas), pero no se publican mediciones.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dannywang930/Llama-3.2-3B-Instruct-nexec-directions` | Direcciones de activation steering (defensa) | No aplica | No disponible | Llama 3.2 Community License | Hugging Face, 0 descargas |
| `meta-llama/Llama-3.2-3B-Instruct` | Modelo base instruct | No disponible en la informacion | No disponible | Llama 3.2 Community License | Hugging Face (requiere aceptar terminos) |
| NXDirection (NVIDIA Research) | Metodo original de defensa | No aplica | No aplica | No disponible | Publicacion de investigacion |
| Direccion aleatoria (baseline del paper) | Control experimental | No aplica | No aplica | No disponible | No disponible |

La comparativa relevante es frente a la linea base sin defensa y frente a la direccion aleatoria: la model card muestra que nexec reduce el ataque al 8,3% mientras la direccion aleatoria se queda en 22,3%, practicamente igual que sin defensa. No se conocen en la informacion proporcionada otras defensas comparables con resultados publicados sobre Llama 3.2 3B.

## Limitaciones y advertencias

- No es una frontera de seguridad: el propio autor indica que las inyecciones siguen pasando, especialmente las de solo estilo y las con forma de codigo.
- La tasa de exito de ataque residual es del 8,3% en BIPIA; no elimina el riesgo.
- No contiene pesos: sin acceso al modelo base `meta-llama/Llama-3.2-3B-Instruct` (que requiere aceptar la licencia de Meta) el repositorio es inutilizable.
- El ajuste se realizo sobre solo 178 ejemplos etiquetados (corpus v1), lo que limita la generalizacion a dominios y estilos de ataque no representados.
- La evaluacion se hizo con un unico juez (Claude Sonnet 5.5) y sobre BIPIA y SQuAD; no hay evidencia publicada sobre otros benchmarks o dominios.
- Licencia Llama 3.2 Community License: el uso comercial esta sujeto a los terminos de Meta y a su Acceptable Use Policy; hay que revisar `LICENSE.txt`, `USE_POLICY.md` y `NOTICE.md` incluidos en el repositorio.
- No se documentan sesgos especificos del artefacto; los del modelo base aplican igualmente.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: proyecto de nicho, sin validacion independiente conocida.
- Requiere marcar manualmente que contenido es no confiable; un marcado incorrecto (confiar en contenido que no lo merece) anula la defensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dannywang930/Llama-3.2-3B-Instruct-nexec-directions
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del proyecto nexec: https://github.com/ThePeeps191/nexec
- Informes de resultados de nexec: https://github.com/ThePeeps191/nexec/tree/main/docs/findings
- NXDirection (NVIDIA Research): https://research.nvidia.com/ai-security/nxdirection-no-execute-along-instruction-direction
