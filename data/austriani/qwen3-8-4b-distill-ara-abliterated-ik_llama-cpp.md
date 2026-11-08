# Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-ik_llama.cpp

## Resumen

El modelo `Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-ik_llama.cpp` es una distribucion cuantizada en formato GGUF del modelo `Austriani/Qwen3.8-4B-Distill-ARA-Abliterated`, que a su vez deriva del destilado `empero-ai/Qwen3.8-4B-Distill`. Se trata, por tanto, de un modelo de 4.000 millones de parametros (4B) obtenido mediante destilacion de un modelo profesor de gran escala (Qwen3.8-2.4T segun la documentacion del repositorio de destilacion asociado) y posteriormente sometido a un proceso de "abliteration" (eliminacion de rechazos) mediante tecnicas de ablation de rango arbitrario (ARA) y herramientas como Heretic.

El objetivo declarado del autor es ofrecer una variante sin censura ("uncensored", "refusal-removed") orientada a roleplay, escritura creativa y chat, empaquetada en cuantizaciones GGUF optimizadas para el motor `ik_llama.cpp` con calibracion imatrix v3. La publicacion esta pensada para inferencia local en hardware de consumo, no para despliegues de servidor a gran escala.

Es relevante en el ecosistema porque combina tres tendencias actuales: la destilacion de modelos gigantes a tamanos manejables, la personalizacion extrema via fine-tuning comunitario y la cuantizacion agresiva con `ik_llama.cpp`, un fork de llama.cpp orientado a rendimiento en CPU y GPU modestas. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, no se detalla la composicion del dataset y el modelo acumula cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 4B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado con imatrix v3 (niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only del linaje Qwen3.8, en su variante de 4B parametros. El modelo original `empero-ai/Qwen3.8-4B-Distill` se genero mediante destilacion de un profesor de gran escala (Qwen3.8-2.4T) usando trazas de razonamiento paso a paso (chain of thought): el profesor genera soluciones razonadas y el estudiante se entrena directamente sobre esas trazas, lo que transfiere capacidades de razonamiento a un modelo mucho mas pequeno.

Sobre esa base, el autor aplico un proceso de "abliteration" mediante ablation de rango arbitrario (ARA) y herramientas tipo Heretic, que eliminan selectivamente las direcciones de activacion responsables de las respuestas de rechazo. El resultado es un modelo "uncensored" que mantiene (presuntamente) las capacidades del original pero sin negativas ante peticiones sensibles. La version aqui descrita es una conversion a GGUF con calibracion imatrix v3 para `ik_llama.cpp`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de destilacion ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y chat conversacional multi-turno.
- Escritura creativa y roleplay, orientacion principal declarada por el autor.
- Razonamiento paso a paso heredado de la destilacion del profesor (chain of thought).
- Respuestas sin rechazos ante contenido sensible (abliterated / refusal-removed).
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible (no confirmado).

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta explicitamente afinado para roleplay y escritura creativa, con los rechazos eliminados, lo que permite desarrollar personajes y tramas sin interrupciones por filtros de contenido. Adecuado para prototipos de videojuegos narrativos o comunidades de ficcion interactiva.
- Escritura creativa sin restricciones: generacion de relatos, dialogos y guiones en generos que los modelos alineados suelen rechazar (terror, drama adulto, ficcion violenta), gracias a la ablation de rechazos.
- Chat local en hardware de consumo: al ser un 4B en GGUF, puede ejecutarse en un portatil con GPU integrada o CPU moderna mediante `ik_llama.cpp`, lo que lo hace util para asistentes personales offline y privados.
- Prototipado rapido de aplicaciones conversacionales: su tamano reducido permite iterar en local antes de escalar a modelos mayores, con licencia Apache 2.0 que facilita la experimentacion.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de modelos "abliterated" para analizar que capacidades se degradan y cuales se preservan tras eliminar los rechazos.
- Generacion de dialogos para mods y contenido de comunidad: integrable en pipelines de creacion de contenido para juegos o plataformas de ficcion donde se requiere un tono sin filtros editoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,3 GB para el modelo base de 4B en su configuracion de referencia (dato de LLM Explorer para `empero-ai/Qwen3.8-4B-Distill`); las cuantizaciones GGUF de esta distribucion reduciran esa cifra, tipicamente a 2,5-3,5 GB en Q4 y 4-5 GB en Q8 (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para margen amplio; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM usando cuantizaciones Q4/Q5; en Q8 se recomienda 8 GB o mas.
- Opciones de despliegue: `ik_llama.cpp` (motor nativo de esta distribucion), llama.cpp, Ollama (previa conversion o importacion del GGUF), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-ik_llama.cpp | 4B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Variante abliterated, solo ingles, sin benchmarks |
| empero-ai/Qwen3.8-4B-Distill | 4B | no disponible | no disponible | safetensors (presumible) | Modelo base destilado, alineado, sin ablation |
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated | 4B | no disponible | Apache 2.0 | safetensors (presumible) | Version sin cuantizar del mismo modelo |
| Qwen3.8-2B / 9B Distill (RayCodes) | 2B / 9B | no disponible | no disponible | varios | Alternativas de distilacion del mismo profesor |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo destilado y posteriormente abliterated, los sesgos del profesor pueden persistir o amplificarse.
- Riesgo de alucinacion: elevado en un modelo de 4B destilado; sin benchmarks que lo cuantifiquen, debe validarse en el dominio de uso.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta especificada y puede diferir del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta las obligaciones derivadas del modelo base ni del profesor; conviene verificar la cadena de licencias antes de un despliegue comercial.
- La ablation de rechazos puede degradar capacidades de razonamiento e instruccion; no hay evaluaciones publicadas que midan el coste de la abliteration.
- Modelo sin traccion (0 descargas, 0 likes en el momento de la consulta): no hay validacion de la comunidad ni reportes de calidad.
- El formato GGUF para `ik_llama.cpp` limita la portabilidad a otros motores sin conversion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-ik_llama.cpp
- Modelo base (sin cuantizar): https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated
- Modelo destilado de origen: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio de destilacion Qwen3.8 (RayCodes): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Ficha en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-4B-Distill,3zO5wdF6UrF9U0hXx3bqyC
