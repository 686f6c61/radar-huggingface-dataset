# NabillahBee/rnfl-qwen2.5-vl-3b-lora

## Resumen

rnfl-qwen2.5-vl-3b-lora es un adaptador LoRA publicado por NabillahBee sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct. Su proposito es asistir en la interpretacion de mapas de grosor de la capa de fibras nerviosas de la retina (RNFL) obtenidos mediante tomografia de coherencia optica (OCT), explicando en lenguaje llano un bloque de mediciones calculadas por software y redactando informes estructurados en seis secciones. Se trata de un prototipo de investigacion, no de un producto clinico: el propio autor advierte que no es un dispositivo medico y que no puede diagnosticar.

El adaptador se entreno con QLoRA de 4 bits (rango 8, alpha 16, dropout 0.05, todas las capas lineales, torre de vision y proyector congelados) mediante LLaMA-Factory sobre un conjunto derivado del dataset Harvard-GDP (Luo et al., ICCV 2023). La relevancia actual es acotada: el modelo demuestra que un VLM pequeno de 3B parametros puede, con un adaptador de bajo rango, seguir plantillas de informe y rechazar peticiones de diagnostico con alta fiabilidad en dominios muy restringidos, aunque su rendimiento fuera de esas plantillas es fragil.

La ficha describe un adaptador, no un modelo completo: los 3B parametros corresponden al modelo base, y el adaptador anade un delta de bajo rango sobre las capas lineales. El repositorio ocupa 0.1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2.5-VL-3B-Instruct (vision + lenguaje) |
| Parametros totales | 3B en el modelo base (adaptador LoRA de bajo rango, rango 8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso un corte de 2.560 tokens) |
| Tipos de cuantizacion | Entrenado con QLoRA de 4 bits; pesos del adaptador en safetensors; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (uso exclusivo de investigacion no comercial; sujeto a la licencia del modelo base y de Harvard-GDP, CC BY-NC-ND 4.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa imagenes y texto. El entrenamiento congela la torre de vision y el proyector, y ajusta mediante LoRA (rango 8, alpha 16, dropout 0.05) todas las capas lineales del modelo de lenguaje. Se uso QLoRA de 4 bits con LLaMA-Factory, learning rate 1e-4 con decaimiento coseno, batch efectivo de 8 (1 x 8 de acumulacion), corte de 2.560 tokens, precision fp16 sobre una Tesla T4, 2 epocas y 788 pasos.

Los datos proceden de Harvard-GDP (Luo et al., ICCV 2023), con un mapa RNFL por paciente y una particion a nivel de paciente de 700/150/150. Se generaron 2.100 conversaciones multiturno fundamentadas (examen, explicacion, preguntas por regiones, informe, contexto y memoria del usuario, seguridad y glosario) mas 1.050 muestras de clasificacion si/no solo con imagen. Todo el texto de respuesta se construye a partir de plantillas sobre las mediciones del software, nunca a partir de etiquetas de verdad fundamental, lo que explica la alta fidelidad en plantillas y la fragilidad fuera de ellas.

## Capacidades

- Generacion de texto descriptivo sobre hallazgos de grosor RNFL a partir de mediciones aportadas por software.
- Redaccion de informes estructurados en seis secciones siguiendo una plantilla fija.
- Explicacion en lenguaje llano de conceptos y valores del mapa de grosor.
- Memoria del contexto aportado por el usuario dentro de la conversacion (con limitaciones, segun el autor).
- Rechazo explicito de diagnosticos, veredictos de normalidad, calculo de ratio copa/disco y consejo terapeutico.
- Respuesta a preguntas de glosario y seguridad.
- Clasificacion si/no solo con imagen (rendimiento debil, ver benchmarks).
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- No documentado: tool calling, function calling, razonamiento multi-paso generico, soporte multilingue verificado.

## Casos de uso

- Redaccion asistida de informes de OCT: el adaptador genera borradores de seis secciones a partir del bloque de mediciones, que despues pasan comprobaciones automaticas antes de mostrarse al profesional.
- Explicacion al paciente en lenguaje llano: traduce los valores de grosor RNFL y las regiones afectadas a texto comprensible, sin emitir juicios de normalidad.
- Formacion e investigacion: permite estudiar como un VLM pequeno sigue plantillas clinicas y como falla fuera de ellas, util para disenar sistemas con capas de verificacion.
- Filtro de seguridad en un pipeline clinico: el adaptador rechaza sistematicamente peticiones de diagnostico o tratamiento (100% en elementos con plantilla), actuando como barrera ante peticiones inapropiadas.
- Prototipado de asistentes especializados con recursos limitados: al ser un adaptador LoRA sobre un modelo de 3B, puede ejecutarse en una unica GPU de consumo o en una T4 para experimentacion.
- Evaluacion de robustez de VLMs en dominio medico: el conjunto de 29 prompts no familiares documentado por el autor sirve como referencia para medir degradacion fuera de distribucion.
- Clasificacion exploratoria de imagenes OCT (glaucoma, progresion): uso limitado a investigacion dada la AUC de 0.65 y 0.68, claramente inferior a una regresion logistica sobre mediciones.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre pacientes de test reservados:

| Tarea | Adaptador | Modelo base |
|---|---|---|
| Informe completo de seis secciones (150 turnos) | 100% | 0% |
| Rechazo de diagnostico | 100% | 7% |
| Rechazo de consejo terapeutico | 100% | 13% |
| Afirmaciones prohibidas o no respaldadas | 0% | 7,3% |
| AUC glaucoma (solo imagen) | 0,65 (IC 95%: 0,56-0,74) | no disponible |
| AUC progresion (solo imagen) | 0,68 (IC 95%: 0,53-0,83) | no disponible |
| Regresion logistica sobre mediciones, AUC glaucoma | 0,80 | no aplica |
| Regresion logistica sobre mediciones, AUC progresion | 0,82 | no aplica |
| Prueba de estres, 29 prompts no familiares (valoracion manual) | 0,67 | 0,71 (con prompt detallado) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generales en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0.1 GB; el modelo base de 3B en fp16 requiere aproximadamente 6-7 GB de VRAM, y en 4 bits alrededor de 2-3 GB.
- Entrenado en una Tesla T4 (16 GB) con QLoRA de 4 bits, lo que indica que la inferencia cabe en GPUs de consumo.
- GPU recomendadas: T4, RTX 3060 12 GB, RTX 4070, RTX 4090 para mayor throughput; A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU de consumo con al menos 8 GB de VRAM en fp16, y en 4-6 GB con cuantizacion de 4 bits.
- Despliegue: transformers + peft (carga documentada por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para este adaptador y requeririan conversion o soporte de LoRA en el servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rnfl-qwen2.5-vl-3b-lora | 3B (base) + LoRA r8 | no disponible | Asistente OCT/RNFL con plantillas y salvaguardas | other, solo investigacion no comercial | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | VLM generalista | licencia Qwen | Hugging Face |
| Regresion logistica sobre mediciones (baseline del autor) | no aplica | no aplica | Clasificacion tabular de glaucoma y progresion | no disponible | no disponible como modelo publicado |

No se dispone de informacion sobre otros adaptadores LoRA comparables en el mismo dominio OCT/RNFL.

## Limitaciones y advertencias

- No es un dispositivo medico: no puede diagnosticar ni debe usarse para decisiones clinicas.
- Licencia de uso exclusivamente no comercial; ademas, los datos de entrenamiento (Harvard-GDP, CC BY-NC-ND 4.0) imponen restricciones de redistribucion y uso derivado.
- Fragilidad fuera de las plantillas de entrenamiento: en la prueba de estres con 29 prompts no familiares el adaptador no supero al modelo base con prompt detallado (0.67 frente a 0.71), y fue peor en memoria con redaccion libre y en preguntas sobre calidad de imagen.
- Clasificacion solo con imagen debil (AUC 0.65 y 0.68) e inferior a un modelo simple sobre mediciones; no debe usarse como clasificador autonomo.
- Un mapa corresponde a un unico punto temporal; la lateralidad del ojo no esta documentada; un mapa de grosor no puede mostrar ratio copa/disco, campo visual ni presion intraocular.
- Los valores de referencia provienen de un dataset de investigacion, no de una norma validada clinicamente.
- Conjuntos de test pequenos, con intervalos de confianza amplios.
- Riesgo de alucinacion mitigado solo dentro de la aplicacion mediante comprobaciones automaticas; usado de forma aislada, ese filtro no existe.
- Sesgos e idiomas soportados no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NabillahBee/rnfl-qwen2.5-vl-3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Harvard-GDP (Luo et al., ICCV 2023): referencia citada por el autor, enlace no disponible en la informacion proporcionada
- LoRA (Hu et al., 2021), QLoRA (Dettmers et al., 2023), LLaMA-Factory (Zheng et al., 2024): referencias citadas, enlaces no disponibles en la informacion proporcionada
- Space del proyecto: mencionado por el autor, URL no disponible en la informacion proporcionada
