# Akora-Joseph/Doctorian-MedCore

## Resumen

Doctorian-MedCore es un modelo de lenguaje ajustado (fine-tune) publicado por el usuario Akora-Joseph en Hugging Face, orientado al dominio medico. Se trata de un derivado de dos modelos base declarados en su ficha: `google/gemma-4-31B-it` y `mistralai/Mistral-Large-4-1T-A52B`, combinados y afinados sobre un amplio conjunto de datasets que incluyen informes de diagnostico por imagen, conversaciones medico-paciente, razonamiento paso a paso, ciberseguridad y corpus educativos generales como FineWeb-Edu.

El problema que pretende resolver es la falta de modelos abiertos especializados en consultas medicas, informes diagnosticos y dialogo clinico, incorporando ademas capacidades de razonamiento y verificacion de afirmaciones. Su relevancia actual es limitada: el modelo presenta cero descargas y un solo "like" en el momento de redactar esta ficha, no dispone de model card descriptiva (solo metadatos) y no hay evaluaciones publicadas, por lo que debe considerarse un modelo experimental de autor comunitario sin validacion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de los modelos base declarados); detalles no disponibles |
| Parametros totales | no disponible (modelos base declarados: Gemma 4 31B y Mistral Large 4 1T-A52B) |
| Parametros activos | no disponible (el segundo modelo base sugiere arquitectura MoE con ~52B activos, pero no esta confirmado para este derivado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se indican pesos compatibles con endpoints) |
| Idiomas soportados | en, sw, af, fr, zh, es, ko, la, gd, el, ig |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (libreria: transformers; compatible con endpoints de inferencia) |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura ni el metodo de fusion. Los metadatos declaran dos modelos base: `google/gemma-4-31B-it` (un modelo instruido de 31 mil millones de parametros) y `mistralai/Mistral-Large-4-1T-A52B` (que por su nomenclatura sugiere un modelo de ~1 billon de parametros totales con ~52 mil millones activos, tipico de arquitecturas MoE). No se especifica si el modelo resultante es un merge, una destilacion o un fine-tune secuencial, por lo que la naturaleza exacta del entrenamiento no disponible.

En cuanto a los datos, la lista de datasets de entrenamiento es extensa y heterogenea: informes de diagnostico por imagen medica (`Zowel/medical_imaging_diagnostic_reports`), preguntas visuales medicas en turco (dataset LLaVa), conversaciones medico-paciente sobre enfermedades humanas (`nisten/opus5-5-doctor-patient-conversations-all-human-diseases`), razonamiento matematico (GSM8K de OpenAI), razonamiento paso a paso (`magpie-reasoning-v1-10k`), verificacion de afirmaciones (130K ejemplos), ciberseguridad, documentos gubernamentales, corpus educativo general (FineWeb-Edu) y trazas agenticas. No se documenta el numero total de tokens, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto en dominio medico: redaccion de informes diagnosticos por imagen y dialogo medico-paciente, segun los datasets de entrenamiento declarados.
- Razonamiento paso a paso: entrenado con datasets de razonamiento encadenado (magpie-reasoning, GSM8K) y trazas de razonamiento filtradas.
- Verificacion de afirmaciones: incluye un dataset de verificacion de claims de 130.000 ejemplos, util para tareas de fact-checking.
- Capacidades multimodales potenciales: los datasets de imagen medica y VQA (LLaVa) sugieren entrenamiento con pares imagen-texto, aunque no se confirma soporte de vision en la arquitectura final.
- Conocimiento de ciberseguridad: dos datasets especificos de seguridad informatica.
- Capacidades agenticas: inclusion de trazas agenticas y de investigacion sugiere exposicion a flujos de razonamiento multi-paso, aunque no se documenta soporte nativo de tool calling.
- Multilingue: 11 idiomas declarados, incluyendo castellano, frances, chino, coreano, griego, latin, gaelico escoces, suajili, afrikaans e igbo.

## Casos de uso

- Redaccion asistida de informes radiologicos: el modelo se entreno con informes de diagnostico por imagen, por lo que puede emplearse como borrador inicial de informes que un profesional sanitario revise y valide siempre.
- Simulacion de conversaciones clinicas para formacion: dado el dataset de conversaciones medico-paciente, puede usarse para generar dialogos de practica en educacion medica.
- Respuesta a preguntas medicas en entornos educativos: util como asistente de estudio para estudiantes de ciencias de la salud, nunca como fuente de consejo clinico directo.
- Verificacion de afirmaciones medicas o generales: el entrenamiento con 130.000 ejemplos de verificacion de claims lo hace adecuado para pipelines de fact-checking.
- Razonamiento matematico y logico basico: la inclusion de GSM8K aporta capacidad de resolucion de problemas aritmeticos de nivel escolar.
- Experimentacion en merges y destilacion comunitaria: al ser un modelo experimental que combina dos bases distintas, sirve como material de estudio para la comunidad de modelos abiertos.
- Generacion de contenido tecnico de ciberseguridad: puede asistir en redaccion documental sobre seguridad informatica gracias a sus datasets especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los metadatos declaran metricas genericas (accuracy, google_bleu y un "rail_score"), pero sin valores numericos asociados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que uno de los modelos base declarados es de 31B parametros, en FP16 requeriria en torno a 62 GB de VRAM; con cuantizacion de 4 bits, aproximadamente 18-20 GB. Si el modelo final hereda la escala del modelo Mistral de 1T parametros, los requisitos serian mucho mayores y no estimables sin confirmacion.
- GPU recomendadas: no disponible. Como referencia generica, para un modelo de ~31B: A100 80 GB o H100 en precision completa; RTX 4090 (24 GB) u RTX 5090 con cuantizacion de 4 bits.
- Consumer GPU: probablemente viable con cuantizacion agresiva (4 bits) si el modelo final se situa en torno a 31B parametros; no confirmado.
- Opciones de despliegue: la etiqueta "endpoints_compatible" indica compatibilidad con los endpoints de inferencia de Hugging Face. La libreria `transformers` sugiere compatibilidad con vLLM, TGI y, potencialmente, llama.cpp/Ollama si se publica en formato GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion medica documentada |
|---|---|---|---|---|
| Doctorian-MedCore | no disponible | no disponible | Apache-2.0 | Declarada en datasets, sin validacion |
| MedGemma (Google) | 4B / 27B | 128K (estimado) | Licencia Gemma | Si, con model card y benchmarks |
| OpenBioLLM-70B | 70B | 8K | Licencia abierta | Si, con benchmarks publicados |
| BioMistral-7B | 7B | 32K | Apache-2.0 | Si, con paper y evaluaciones |

Doctorian-MedCore se diferencia por ser un modelo comunitario experimental sin documentacion de evaluacion, frente a alternativas como MedGemma o BioMistral que cuentan con publicaciones y benchmarks verificados. Su ventaja relativa es la licencia Apache-2.0, mas permisiva que la licencia Gemma.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: el README solo contiene metadatos, sin instrucciones de uso, plantillas de prompt ni ejemplos.
- Sin benchmarks publicados: no hay forma de verificar su rendimiento ni su especializacion medica real.
- Riesgo de alucinacion elevado: al tratarse de un modelo sin validacion documentada, debe asumirse un riesgo alto de respuestas incorrectas, especialmente critico en dominio medico.
- Uso medico: bajo ninguna circunstancia debe usarse para diagnostico, tratamiento o consejo clinico real sin supervision profesional cualificada.
- Mezcla de datos heterogenea: el entrenamiento combina dominios muy dispares (medicina, ciberseguridad, documentos gubernamentales, 3D), lo que puede degradar la especializacion medica esperada.
- Doble modelo base sin explicacion: no se documenta como se combinaron Gemma 4 31B y Mistral Large 4 1T-A52B, lo que dificulta evaluar herencia de licencias y comportamientos.
- Licencia: Apache-2.0 permite uso comercial, pero deben revisarse los terminos de los modelos base subyacentes.
- Adopcion practicamente nula: cero descargas y un "like" indican ausencia de revision comunitaria.
- Los datasets de jailbreak e inyeccion de prompts incluidos en el entrenamiento podrian introducir comportamientos inseguros si no se filtraron correctamente; no hay informacion al respecto.
- Sesgos: no disponible informacion sobre sesgos conocidos, aunque los datasets medicos y conversacionales pueden contener sesgos demograficos y de idioma no mitigados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akora-Joseph/Doctorian-MedCore
- Modelo base declarado: https://huggingface.co/google/gemma-4-31B-it
- Modelo base declarado: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Paper, demo o repositorio adicional: no disponible
