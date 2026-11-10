# mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-GGUF

## Resumen

Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-GGUF es una distribucion en formato GGUF de un modelo multimodal derivado de Qwen2.5-VL-3B-Instruct, publicado por el usuario mradermacher. El modelo original Qwen2.5-VL-3B-Instruct lo desarrolla el equipo Qwen de Alibaba, y esta variante concreta ha sido modificada por Kasemcyber mediante una tecnica de "abliteration" (etiquetada como heretic/uncensored/decensored), que busca reducir los mecanismos de rechazo y las restricciones de contenido del modelo base. mradermacher se limita a producir las cuantizaciones estaticas en GGUF a partir de ese checkpoint ya modificado.

El modelo conserva la arquitectura multimodal de Qwen2.5-VL, con aproximadamente 3.085 millones de parametros totales (3,08 B), capaz de procesar texto e imagenes. Al estar empaquetado en GGUF, esta pensado para inferencia local eficiente en CPU y GPU de consumo mediante llama.cpp y ecosistemas compatibles. La licencia declarada es qwen-research, heredada del modelo original de Qwen.

Su relevancia es doble: por un lado ofrece una via sencilla de ejecutar un modelo vision-lenguaje de 3 B en hardware modesto; por otro, su naturaleza "uncensored" lo situa en un terreno delicado para uso en produccion, ya que la eliminacion de rechazos puede aumentar el riesgo de generar contenido inapropiado o inseguro. Los datos publicos de descargas y likes son practicamente nulos en el momento de la consulta, y no hay informacion de benchmarks propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivado de Qwen2.5-VL |
| Parametros totales | 3.085.938.688 (≈3,08 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (segun la model card) |
| Licencia | qwen-research |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 30,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de comprension de imagen y texto. Sobre esa base, Kasemcyber aplico una modificacion de tipo "abliteration/heretic" orientada a eliminar o atenuar los comportamientos de rechazo. mradermacher no reentrena el modelo: solo genera las cuantizaciones GGUF estaticas a partir del checkpoint modificado, e incluye por separado el proyector multimodal (mmproj) necesario para el procesamiento de imagenes.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo original ni en la variante modificada. Tampoco se documenta la metodologia exacta de la ablacion aplicada por Kasemcyber. Existe ademas una variante con cuantizaciones ponderadas/imatrix publicada por el mismo autor en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-VL-3B-Instruct.
- Comprension de imagenes (vision-lenguaje) mediante el proyector multimodal incluido.
- Razonamiento basico y respuesta a instrucciones propias de un modelo de 3 B.
- Comportamiento "uncensored": reduccion de rechazos ante peticiones que el modelo base rechazaria.
- Soporte de conversacion multi-turno (formato conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de codigo y matematicas: no verificadas ni documentadas en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Inferencia local de vision-lenguaje en equipos modestos: con cuantizaciones de 1,4 a 2,3 GB (Q2_K a Q5_K_M) mas el proyector mmproj, puede ejecutarse en portatiles y GPUs de consumo para describir imagenes o responder preguntas sobre ellas.
- Prototipado de asistentes de imagen en escritorio: usar llama.cpp u Ollama para construir demos de captioning o VQA sin depender de la nube, gracias al tamano reducido del modelo.
- Investigacion sobre alineacion y seguridad: el caracter "abliterated" lo hace util como objeto de estudio para comparar comportamientos de rechazo frente al modelo base original.
- Experimentacion con contenido creativo sin filtros: escritura de ficcion o guiones donde el modelo base tenderia a rechazar tematicas sensibles, siempre con supervision humana.
- Pruebas de pipelines GGUF multimodales: validar la integracion de mmproj y cuantizaciones en herramientas de inferencia antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un rango amplio de tipos (Q2_K a f16) para medir el compromiso entre calidad y memoria en tareas de vision.
- Entornos offline o air-gapped: al ser un unico conjunto de ficheros GGUF, permite desplegar un modelo multimodal sin conexion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde aproximadamente 1,4 GB (Q2_K) hasta 3,4 GB (Q8_0) para los pesos del modelo, mas entre 0,9 y 1,4 GB del proyector multimodal segun se use mmproj-Q8_0 o mmproj-f16.
- Configuracion minima practica: cuantizacion Q4_K_M (2,0 GB) mas mmproj-Q8_0 (0,9 GB), en torno a 3 GB de memoria, apta para GPUs de consumo con 6-8 GB.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para cuantizaciones Q4-Q8; en CPU funciona con RAM suficiente.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB o mas para cuantizaciones medias.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-GGUF | ≈3,08 B | no disponible | qwen-research | GGUF | Variante sin censura, solo ingles |
| Qwen2.5-VL-3B-Instruct (original) | ≈3,08 B | no disponible | qwen-research | safetensors | Modelo base con alineacion estandar |
| Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic | ≈3,08 B | no disponible | qwen-research | safetensors | Checkpoint modificado del que deriva esta version |
| mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-i1-GGUF | ≈3,08 B | no disponible | qwen-research | GGUF (imatrix) | Misma base con cuantizaciones ponderadas |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La modificacion "uncensored/abliterated" elimina parte de los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido ofensivo, ilegal o peligroso; no es recomendable para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de 3 B, agravado por la perdida de calidad en cuantizaciones bajas (Q2_K, Q3_K).
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado.
- Licencia qwen-research: impone restricciones; conviene revisar el enlace de licencia antes de cualquier uso comercial.
- El modelo esta pensado para investigacion; el autor de la cuantizacion no ofrece garantias de calidad ni de seguridad.
- Sin datos publicados de benchmarks ni de adopcion (0 descargas, 0 likes en la consulta), lo que limita la validacion independiente.
- Las cuantizaciones de baja precision pueden degradar la comprension de imagenes de forma mas acusada que en tareas de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-GGUF
- Modelo base modificado: https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-i1-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
