# mradermacher/lumorux-1.0-GGUF

## Resumen

Lumorux 1.0 es un modelo de lenguaje especializado en generación de código para desarrollo web y modelado 3D, afinado mediante QLoRA sobre una base de la familia Qwen. Lo desarrolla el usuario Lumorux y esta publicado con licencia Apache 2.0. El repositorio analizado aqui es la version cuantizada en GGUF realizada por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de ~7B, un tamano manejable para inferencia local. Su enfoque declarado son las tareas de generacion de codigo, desarrollo web, Blender, Three.js y modelado 3D, ademas de aplicaciones conversacionales generales. El idioma declarado es unicamente el ingles.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de codigo especializado en entornos con recursos limitados, gracias a la disponibilidad de cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB). No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa, lo que limita la evaluacion rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, segun tags del autor; detalles no disponibles) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es Lumorux/lumorux-1.0, afinado mediante QLoRA (segun los tags del autor) sobre una arquitectura de la familia Qwen. No se especifican en la documentacion proporcionada el numero de capas, dimensiones ocultas, mecanismo de atencion ni la longitud de contexto nativa. Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El repositorio analizado es una cuantizacion estatica realizada por mradermacher con la herramienta de conversion a GGUF (convert_type: hf), que incluye variantes estaticas y, en un repositorio separado, cuantizaciones ponderadas con imatrix (i1). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo orientada a desarrollo web.
- Generacion y asistencia en scripts para Blender y Three.js.
- Tareas de modelado 3D asistido por texto.
- Generacion de texto conversacional general.
- Capacidades multilingues limitadas al ingles segun la declaracion del autor.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Asistente de codigo para desarrollo web: el modelo puede generar fragmentos de HTML, CSS y JavaScript en el contexto de un proyecto web, aprovechando su afinado especifico en desarrollo web para tareas de autocompletado y generacion de componentes.
- Generacion de escenas en Three.js: resulta adecuado para producir codigo que construya escenas 3D interactivas en el navegador, dado su entrenamiento declarado en Three.js y modelado 3D.
- Automatizacion de scripts para Blender: puede redactar scripts en Python para la API de Blender, agilizando tareas repetitivas de modelado, materiales o animacion en pipelines de produccion 3D.
- Prototipado rapido de aplicaciones: al estar afinado en "applications", puede emplearse para generar esqueletos de aplicaciones y utilidades de linea de comandos en fases tempranas de desarrollo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), puede ejecutarse en GPU de consumo para asistencia de codigo sin conexion, preservando la privacidad del codigo.
- Educacion y aprendizaje de programacion grafica: puede servir como tutor que explica y genera ejemplos de codigo para Blender y Three.js en entornos docentes con hardware modesto.
- Integracion en pipelines de CI/CD para generacion de documentacion o tests: siempre que se valide su calidad mediante pruebas automatizadas, puede emplearse para generar borradores de tests o comentarios de codigo; no obstante, no se documenta soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~3,1 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- GPU recomendadas: para las cuantizaciones Q4/Q5, GPU de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060); para Q8_0, GPU con 10-12 GB (RTX 3080, RTX 4070 Ti); para f16, GPU de 16 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q5_K_M en tarjetas de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (safetensors) es compatible con transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumorux 1.0 (este) | ~7,6B | no disponible | Apache 2.0 | GGUF / safetensors | Afinado QLoRA sobre Qwen, especializado en codigo web y 3D |
| Qwen2.5-Coder 7B | ~7,6B | no disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Base de codigo generalista de la familia Qwen |
| CodeLlama 7B | ~6,7B | no disponible en esta ficha | Llama 2 (uso comercial con restricciones) | safetensors / GGUF | Modelo de codigo de Meta, con licencia mas restrictiva |

La comparacion se limita a parametros, licencia y formato, ya que no se dispone de datos de benchmarks del modelo analizado. No se dispone de informacion para comparar rendimiento ni contexto con las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos de codigo y web, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente como en cualquier LLM; en generacion de codigo puede producir APIs inexistentes o sintaxis incorrecta, por lo que requiere validacion.
- Limitaciones de contexto o idioma: el unico idioma declarado es el ingles; la longitud de contexto no esta documentada, lo que impide garantizar tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen subyacente.
- Caveats para produccion: la informacion publica es muy escasa (sin benchmarks, sin datos de entrenamiento, sin contexto declarado), lo que dificulta una evaluacion rigurosa; se recomienda validar exhaustivamente antes de desplegar en entornos productivos.
- El repositorio analizado es una cuantizacion de terceros; la calidad final depende del proceso de cuantizacion y de la variante elegida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lumorux-1.0-GGUF
- Modelo base: https://huggingface.co/Lumorux/lumorux-1.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/lumorux-1.0-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#lumorux-1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
