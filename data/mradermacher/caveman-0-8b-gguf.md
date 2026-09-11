# mradermacher/Caveman-0.8B-GGUF

## Resumen

Caveman-0.8B-GGUF es la version cuantizada en formato GGUF del modelo CrowdMind/Caveman-0.8B, publicada por el usuario mradermacher, especializado en la conversion de pesos a cuantizaciones de llama.cpp. El modelo original es un ajuste fino de una base de la familia Qwen 3.5, segun la etiqueta `qwen3_5` que aparece en los metadatos, con 772.845.888 parametros totales (aproximadamente 0,77 mil millones) y un enfoque declarado de generacion de texto conversacional en ingles.

Este repositorio no contiene pesos nuevos: es un empaquetado de cuantizaciones estaticas del modelo base. Incluye variantes desde Q2_K hasta f16, ademas de dos ficheros `mmproj` (proyector multimodal) que apuntan a que el modelo original podria tener capacidad de vision, aunque la model card no lo documenta explicitamente. Su relevancia practica esta en permitir ejecutar un modelo conversacional pequeno en hardware muy limitado, incluido CPU y telefonos, usando llama.cpp, Ollama o LM Studio.

La licencia Apache 2.0 del modelo base facilita su uso comercial, pero conviene senalar que el repositorio no publica datos de entrenamiento, longitud de contexto, ni resultados de benchmarks, por lo que la evaluacion previa a produccion debe hacerse por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos); detalles de capas y atencion no disponibles |
| Parametros totales | 772.845.888 (datos de safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers + llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de la etiqueta `qwen3_5`, que situa el modelo base dentro de la familia Qwen 3.5. Con 772 millones de parametros se trata con alta probabilidad de un transformer denso de tipo decoder-only, disenado para generacion de texto y conversacion. El repositorio incluye ficheros `mmproj` (proyector multimodal), un componente habitual en arquitecturas vision-lenguaje, lo que sugiere que el modelo base podria aceptar entrada de imagenes; sin embargo, la model card no describe dicha capacidad y no se debe asumir su funcionamiento sin verificacion.

El proceso documentado en esta ficha es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (los tipos K-quant e IQ) del checkpoint CrowdMind/Caveman-0.8B mediante llama.cpp, y tambien mantiene una version con imatrix en `mradermacher/Caveman-0.8B-i1-GGUF`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El autor del modelo base tampoco publica esos datos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Soporte declarado de `text-generation-inference` y compatibilidad con endpoints, segun las etiquetas del repositorio.
- Compatibilidad con el ecosistema llama.cpp / GGUF, lo que habilita su uso en herramientas de inferencia local.
- Posible soporte multimodal (vision) por la presencia de ficheros `mmproj`, sin confirmar en la documentacion.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.
- Soporte multilingue: limitado a ingles segun la etiqueta de idioma.

## Casos de uso

- Asistentes conversacionales embebidos: al ocupar entre 0,5 y 0,9 GB en cuantizaciones Q2-Q8, el modelo puede desplegarse en dispositivos con poca memoria para gestionar dialogos simples de soporte o acompanamiento sin depender de la nube.
- Prototipado rapido de aplicaciones de chat: con Ollama o llama.cpp se puede levantar un endpoint local en minutos para validar la experiencia de usuario antes de migrar a un modelo mayor.
- Generacion de texto en el borde (edge computing): en entornos industriales o de robotica con CPU y sin GPU, un modelo de 0,77B en Q4_K_M resulta viable para generar respuestas cortas o etiquetas descriptivas.
- Clasificacion y extraccion de texto en ingles: pese a no estar especializado, su tamano permite tareas de resumen corto o extraccion de campos, siempre con validacion posterior por el riesgo de alucinacion.
- Filtrado previo y enrutado en pipelines RAG: puede actuar como clasificador barato que decida si una consulta requiere un modelo mayor, reduciendo coste por token en arquitecturas multi-modelo.
- Educacion y demos offline: su licencia Apache 2.0 y su huella reducida facilitan su distribucion en talleres, cursos o entornos con conectividad limitada.
- Investigacion en cuantizacion: el repositorio ofrece el mismo modelo en once niveles de cuantizacion, lo que permite medir de forma controlada el impacto de la compresion en la perplejidad y la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado evaluaciones del modelo base CrowdMind/Caveman-0.8B en los resultados de busqueda disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin margen de contexto ni cache KV): f16 aproximadamente 1,7 GB; Q8_0 aproximadamente 0,9 GB; Q6_K y Q5_K aproximadamente 0,7 GB; Q4_K_S / Q4_K_M e IQ4_XS aproximadamente 0,6 GB; Q3_K alrededor de 0,5-0,6 GB; Q2_K aproximadamente 0,5 GB.
- Al anadir cache KV y contexto, el consumo real crece; con contextos largos conviene reservar entre 0,5 y 1 GB adicionales segun el backend. El modelo base ocupa 8,0 GB en el repositorio completo, ya que incluye todas las cuantizaciones.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090 o GPUs integradas modernas. En entornos profesionales no requiere A100 ni H100; una NVIDIA T4 o L4 es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las generaciones recientes, y tambien en CPU y en dispositivos moviles con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta del repositorio) y transformadores de Hugging Face con los pesos del modelo base. vLLM es posible sobre los pesos originales en safetensors, aunque no sobre los GGUF.
- Latencia y throughput estimados: no disponibles. Para un modelo de este tamano se espera una generacion muy rapida en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Caveman-0.8B-GGUF (este) | 0,77B | No disponible | Apache 2.0 | GGUF en Hugging Face | No disponible |
| Qwen3-0.6B | 0,6B | No disponible en esta ficha | Apache 2.0 | Pesos y GGUF en Hugging Face | No disponible en esta ficha |
| Llama 3.2 1B Instruct | 1,2B | No disponible en esta ficha | Licencia comunitaria de Meta (no Apache 2.0) | Pesos y GGUF en Hugging Face | No disponible en esta ficha |
| Gemma 3 1B | 1B | No disponible en esta ficha | Terminos de uso de Gemma (no Apache 2.0) | Pesos y GGUF en Hugging Face | No disponible en esta ficha |

Nota: los datos de los modelos alternativos son referencia general de categoria (modelos densos de 0,6B a 1,2B orientados a uso local) y no deben considerarse verificados contra sus model cards en el contexto de esta ficha. La ventaja competitiva principal de Caveman-0.8B-GGUF es su licencia Apache 2.0, mas permisiva que las de Llama 3.2 y Gemma 3, junto con la disponibilidad inmediata de once niveles de cuantizacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgos ni de toxicidad para este modelo.
- Riesgo de alucinacion: elevado en modelos de menos de mil millones de parametros; no debe usarse como fuente de verdad sin verificacion externa, especialmente en dominios factuales o medicos.
- Idioma: el modelo esta etiquetado unicamente como ingles. No hay evidencia de competencia en castellano ni en otros idiomas, por lo que no se recomienda su uso en produccion multilingue.
- Longitud de contexto: no documentada, lo que impide planificar casos de uso con contexto largo o RAG extenso sin pruebas previas.
- Capacidad multimodal: la presencia de ficheros `mmproj` sugiere soporte de vision, pero no esta confirmado por el autor. Cualquier uso de imagenes requiere validacion experimental.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar la licencia del modelo base CrowdMind/Caveman-0.8B por si anadiese condiciones adicionales no reflejadas en esta ficha.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K degradan notablemente la calidad. Para cualquier uso real se recomienda Q4_K_M o superior.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de uso ni incidencias reportadas por la comunidad.
- Fecha de publicacion de los metadatos: septiembre de 2026, lo que puede implicar que el modelo base sea reciente y carezca aun de validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Caveman-0.8B-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/Caveman-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/CrowdMind/Caveman-0.8B
- Pagina de resumen del autor: https://hf.tst.eu/model#Caveman-0.8B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
