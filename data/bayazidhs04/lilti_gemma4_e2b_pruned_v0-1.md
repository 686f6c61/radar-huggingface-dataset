# bayazidhs04/Lilti_gemma4_E2B_pruned_v0.1

## Resumen

Lilti_gemma4_E2B_pruned_v0.1 es un modelo de lenguaje y vision derivado de la familia Gemma 4, publicado por el usuario bayazidhs04 en Hugging Face. Se trata de un ajuste fino (finetune) sobre una variante "E2B" de Gemma 4 que ha sido podada (pruned) y convertida al formato GGUF mediante Unsloth, con el objetivo de ejecutarse en llama.cpp. El nombre del archivo de pesos (`gemma-4-E2B-pruned-en-bn`) sugiere un ajuste orientado a los idiomas ingles y bengali, aunque el autor no lo confirma explicitamente en la model card.

El modelo combina un componente de lenguaje (pesos principales) con un proyector multimodal (`F16-mmproj.gguf`), lo que lo convierte en un modelo vision-language capaz de procesar imagenes junto con texto. Los pesos principales suman 3.582.735.907 parametros (aproximadamente 3,58 mil millones), lo que lo situa en el rango de modelos pequenos aptos para hardware de consumo. El repositorio ocupa 3,5 GB.

La relevancia de esta ficha es limitada por la escasez de documentacion: el autor no publica licencia, idiomas soportados, contexto, datos de entrenamiento ni resultados de benchmarks. Ademas, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su nombre hace referencia a "Gemma 4", una generacion que no esta confirmada en el momento de redactar esta ficha, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con proyector multimodal (vision-language); detalles no disponibles |
| Parametros totales | 3.582.735.907 (aproximadamente 3,58 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) y F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible; el nombre del archivo sugiere ingles y bengali (`en-bn`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp), con archivo separado `F16-mmproj.gguf` para vision |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de una variante "E2B" de Gemma 4, ha sido podada y posteriormente ajustada mediante Unsloth, que segun el autor permitio un entrenamiento "2x mas rapido". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el criterio de poda (que capas o cabezas se eliminaron) ni el impacto de esa poda en el rendimiento.

La arquitectura subyacente es la de Gemma (transformer decoder-only), con un proyector multimodal que permite el procesamiento de imagenes. El autor no documenta innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La conversion a GGUF esta pensada para inferencia en llama.cpp, tanto en modo texto (`llama-cli`) como multimodal (`llama-mtmd-cli`).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes (vision-language) mediante el archivo `F16-mmproj.gguf` y el binario `llama-mtmd-cli`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso a traves de APIs compatibles con llama.cpp.
- Soporte de plantillas de chat mediante el flag `--jinja` de llama.cpp.
- Capacidades multilingues potenciales en ingles y bengali, inferidas del nombre del archivo, no confirmadas por el autor.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar en formato GGUF y con unos 3,58 mil millones de parametros, puede ejecutarse en un portatil con GPU de consumo para probar flujos de chat sin infraestructura en la nube.
- Descripcion de imagenes en local: usando `llama-mtmd-cli` con el proyector multimodal, se puede integrar en herramientas de escritorio que necesiten generar texto a partir de capturas o fotografias sin enviar datos a terceros.
- Aplicaciones en bengali e ingles: si se confirma el ajuste bilingue sugerido por el nombre del archivo, podria emplearse en tareas de traduccion o atencion al cliente para comunidades bengaliparlantes, aunque la falta de documentacion obliga a validarlo empiricamente.
- Educacion y experimentacion: su tamano reducido y su empaquetado GGUF lo hacen util para cursos que ensenen a desplegar modelos con llama.cpp y a comparar variantes podadas frente al modelo base.
- Integracion en pipelines de CI para pruebas de regresion: al ser ligero, puede actuar como modelo de referencia en tests automatizados de prompts y plantillas de chat dentro de un equipo de desarrollo.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q4_K_M reduce el peso del modelo y permite ejecutarlo en equipos sin GPU dedicada, como mini-PC o estaciones de trabajo modestas.
- Base para nuevos ajustes finos: al estar disponible en GGUF y derivar de Unsloth, sirve como punto de partida para experimentos de poda o cuantizacion adicionales, siempre que la licencia lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el archivo de pesos ronda los 2 GB, por lo que la VRAM necesaria es de aproximadamente 2,5 a 3,5 GB incluyendo overhead de contexto y el proyector multimodal. En F16, el peso seria de unos 7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para F16, se recomienda al menos 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con Q4_K_M; en F16 requiere GPU de gama media-alta.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-mtmd-cli`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). No se confirma soporte de vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lilti_gemma4_E2B_pruned_v0.1 | 3,58 B | no disponible | no disponible | GGUF | Podado y ajustado con Unsloth; vision via mmproj |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Modelo base oficial de Google, ampliamente documentado |
| Phi-3 Mini | 3,8 B | 4.096 tokens (128K en variante long) | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y codigo para su tamano |
| Qwen2.5 3B | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, con soporte de tool calling |

La comparativa con Gemma 2 2B, Phi-3 Mini y Qwen2.5 3B se ofrece como referencia de categoria por tamano; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no se documenta licencia, idiomas, contexto, dataset ni proceso de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- El modelo ha sido podado sin documentar el criterio ni el impacto en calidad; es esperable una degradacion respecto al modelo base, no cuantificada.
- Riesgo de alucinacion: como todo modelo de ~3,5 B sin evaluacion publicada, la probabilidad de generar informacion incorrecta es alta, especialmente en dominios especializados.
- Idiomas: solo se sugiere ingles y bengali por el nombre del archivo; el rendimiento en castellano no esta documentado ni validado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de Gemma, es probable que hereden las condiciones de la licencia Gemma, pero debe verificarse con el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El nombre "Gemma 4" no corresponde a una generacion confirmada publicamente en el momento de redactar esta ficha; conviene tratar la procedencia con cautela.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bayazidhs04/Lilti_gemma4_E2B_pruned_v0.1
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
