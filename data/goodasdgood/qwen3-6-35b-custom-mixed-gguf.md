# goodasdgood/Qwen3.6-35B-custom-mixed.gguf

## Resumen

goodasdgood/Qwen3.6-35B-custom-mixed.gguf es un repositorio de pesos en formato GGUF publicado en HuggingFace por el usuario goodasdgood. La model card asociada contiene unicamente la declaracion de licencia Apache-2.0: no incluye descripcion del modelo, arquitectura, volumen de entrenamiento, tokenizador, plantilla de chat ni instrucciones de despliegue. El nombre del repositorio apunta a un modelo de la familia Qwen con 35.000 millones de parametros y un esquema de cuantizacion mixto, pero ninguno de esos extremos esta confirmado por el autor.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y sus unicas etiquetas son license:apache-2.0 y region:us. No se ha declarado pipeline, idiomas soportados ni resultados de evaluacion. La busqueda web realizada no ha devuelto ningun enlace relacionado con el modelo, con el autor ni con la variante "Qwen3.6": los resultados obtenidos son hilos de foros y preguntas sin relacion alguna con el proyecto.

Se trata, por tanto, de un artefacto sin documentacion verificable. Todos los campos que no aparecen en la model card se marcan como no disponibles, y las estimaciones de hardware incluidas mas abajo se derivan exclusivamente del numero de parametros sugerido por el nombre del archivo, no de especificaciones publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del repositorio menciona "35B", dato no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF; el nivel concreto no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Autor | goodasdgood |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-21 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Etiquetas | license:apache-2.0, region:us |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura, el dataset, el numero de tokens de entrenamiento ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. El unico dato tecnico deducible del repositorio es el formato de distribucion: GGUF, el contenedor binario empleado por llama.cpp y sus derivados, lo que implica que el artefacto esta pensado para inferencia en CPU o GPU con ese ecosistema.

El sufijo "custom-mixed" del nombre sugiere, sin ninguna confirmacion documental, una combinacion de niveles de cuantizacion en un mismo archivo. Del mismo modo, el prefijo "Qwen3.6" no corresponde a ninguna version publicada oficialmente por el equipo Qwen segun la informacion disponible, por lo que no puede confirmarse que este repositorio sea un derivado de un modelo oficial ni que respete sus terminos de licencia originales. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

No se ha documentado ninguna capacidad. En concreto, no puede confirmarse:

- Generacion de texto, razonamiento, codigo o matematicas.
- Soporte de tool calling o function calling.
- Comportamiento agentico o razonamiento multi-paso.
- Cobertura multilingue.
- Modo de pensamiento, vision, audio u otras capacidades especiales.
- Longitud de contexto efectiva y gestion de conversaciones multi-turno.
- Plantilla de chat y formato de prompt esperado.

Cualquier afirmacion sobre las capacidades de este modelo requeriria una evaluacion directa del archivo GGUF, que no se ha realizado ni publicado.

## Casos de uso

Los escenarios siguientes son hipoteticos y parten de la premisa, no verificada, de que el artefacto se comporta como un transformer denso de aproximadamente 35.000 millones de parametros en formato GGUF. Deben validarse antes de cualquier uso en produccion.

- Inferencia local con privacidad de datos: al distribuirse en GGUF, el modelo puede ejecutarse integramente en hardware propio sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad. Requiere confirmar la plantilla de prompt y el tokenizador.
- Asistente de codigo en estacion de trabajo: si el modelo tiene capacidades de generacion de codigo, puede integrarse en editores mediante llama.cpp u Ollama para autocompletado y explicacion de fragmentos, siempre que quepa en la VRAM disponible en la cuantizacion elegida.
- Generacion aumentada por recuperacion (RAG): el archivo puede servir como motor de generacion en un pipeline RAG local, pero la ausencia de datos sobre longitud de contexto impide dimensionar la ventana de recuperacion.
- Procesamiento por lotes de documentos: clasificacion, resumen o extraccion de informacion sobre volumenes grandes de texto mediante un servidor llama.cpp con varios slots paralelos, sujeto a la verificacion de calidad por cuantizacion.
- Despliegue en hardware con memoria unificada: equipos con memoria compartida (por ejemplo, estaciones con 64 o 128 GB) pueden alojar cuantizaciones altas sin necesidad de GPU dedicada.
- Evaluacion comparativa y red teaming: dado que no existe ninguna evaluacion publicada, el modelo puede utilizarse como sujeto de pruebas para medir degradacion por cuantizacion, sesgos y tasas de alucinacion frente a modelos de referencia.
- Traduccion o asistencia multilingue: solo viable si se confirma cobertura de idiomas, dato actualmente no disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web no ha devuelto ningun informe externo sobre este repositorio.

## Requisitos de hardware

Estimaciones derivadas exclusivamente del numero de parametros sugerido por el nombre del repositorio (35B, no confirmado). El consumo real depende de la arquitectura, la longitud de contexto configurada y el tamano de la cache KV.

| Cuantizacion | Bits por parametro (aprox.) | VRAM estimada (solo pesos) |
|---|---|---|
| Q3_K_M | ~3,9 | ~17 GB |
| Q4_K_M | ~4,8 | ~21 GB |
| Q5_K_M | ~5,7 | ~25 GB |
| Q6_K | ~6,6 | ~29 GB |
| Q8_0 | ~8,5 | ~37 GB |
| FP16 | 16 | ~70 GB |

- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar Q4_K_M con margen muy ajustado para la cache KV; con contextos largos sera necesario reducir el numero de capas en GPU o bajar a Q3_K_M. Una RTX 4060 Ti de 16 GB no es suficiente para cuantizaciones de 4 bits.
- Multi-GPU de consumo: dos RTX 4090 o 3090 (48 GB en total) permiten Q6_K y Q8_0 con contexto amplio.
- GPU de centro de datos: A100 de 40 o 80 GB y H100 de 80 GB pueden ejecutar FP16 o cuantizaciones altas con ventanas de contexto largas.
- Memoria unificada: equipos Apple con 64 o 128 GB o estaciones con memoria compartida pueden ejecutar cuantizaciones de 4 a 8 bits sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, llama.cpp como servidor con API compatible con OpenAI. vLLM ofrece soporte experimental de GGUF. TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo.

## Comparativa con modelos similares

No existe ninguna comparacion verificable con este repositorio, ya que carece de especificaciones y de resultados publicados. La tabla siguiente recoge familias de referencia de tamano similar, con datos procedentes de su documentacion publica, que no se han contrastado contra este artefacto.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| Qwen3.6-35B-custom-mixed (este repositorio) | 35B (segun nombre, sin confirmar) | no disponible | Apache-2.0 (declarada) | no disponible |
| Qwen2.5-32B | 32,5B | 128K | Apache-2.0 | no comparable en esta ficha |
| Gemma 3 27B | 27B | 128K | Terminos de uso de Gemma | no comparable en esta ficha |
| Mistral Small 3.1 24B | 24B | 128K | Apache-2.0 | no comparable en esta ficha |

Los datos de las filas de referencia provienen de sus respectivas fichas publicas y no se han verificado en el contexto de este repositorio.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la declaracion de licencia, sin informacion sobre entrenamiento, tokenizador, plantilla de chat ni uso previsto.
- Procedencia no verificada: no se ha confirmado que el modelo sea un derivado legitimo de la familia Qwen. El nombre "Qwen3.6" no se corresponde con ninguna version oficial conocida, lo que impide asumir compatibilidad con herramientas o formatos de prompt de esa familia.
- Riesgo de licencia: aunque el repositorio declara Apache-2.0, si el artefacto deriva de pesos con otra licencia, los terminos aplicables serian los del modelo original. No hay aval del autor sobre este extremo.
- Cero adopcion: 0 descargas y 0 likes implican que no ha habido validacion por parte de terceros, ni informes de fallos, ni ejemplos de uso.
- Fecha de publicacion atipica: los metadatos indican 2026-09-21, lo que dificulta situar el artefacto en el contexto de modelos contemporaneos.
- Degradacion por cuantizacion: cualquier cuantizacion de 4 bits o inferior puede reducir la calidad en tareas de razonamiento y codigo. Se desconoce el esquema aplicado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, sin que existan evaluaciones que lo cuantifiquen.
- Idiomas y contexto desconocidos: no puede garantizarse el comportamiento en castellano ni en conversaciones que superen la ventana real del modelo.
- Sin garantias para produccion: no se recomienda su uso en entornos productivos sin una evaluacion previa de calidad, seguridad y latencia.
- Seguridad: al no existir informacion sobre alineamiento o filtros, no hay evidencia de mitigacion frente a prompts maliciosos o generacion de contenido danino.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/goodasdgood/Qwen3.6-35B-custom-mixed.gguf
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web no ha devuelto ningun enlace relacionado con el modelo, el autor o la variante "Qwen3.6".
