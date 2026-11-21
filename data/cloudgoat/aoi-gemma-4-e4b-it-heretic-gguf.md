# CloudGoat/aoi-gemma-4-E4B-it-heretic-GGUF

## Resumen

aoi-gemma-4-E4B-it-heretic-GGUF es la version cuantizada en formato GGUF del modelo CloudGoat/aoi-gemma-4-E4B-it-heretic, un merge de tipo "heretic" (sin mecanismos de rechazo) construido sobre la familia Gemma 4 con variante E4B. El autor, CloudGoat, publica los pesos en BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M, ademas de un proyector multimodal mmproj en F16 para entrada de imagen y audio. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas multimodales ademas de texto.

El modelo cuenta con 7.518.069.290 parametros reales (segun safetensors del modelo base) y se distribuye bajo licencia Apache 2.0, con soporte declarado de japones e ingles. El repositorio GGUF ocupa 47,0 GB e incluye todas las variantes de cuantizacion en un unico espacio. No se han publicado descargas ni likes, y la model card es muy escueta: se limita a describir los ficheros y el procedimiento de conversion con llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de Gemma 4 en formato GGUF listo para llama.cpp, lo que facilita su despliegue en hardware de consumo; por otro, advierte de que se trata de un merge "uncensored" sin garantias de seguridad, por lo que su uso en produccion exige evaluacion propia de riesgos y cumplimiento de las licencias de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4, variante E4B; probablemente transformer multimodal con per-layer embeddings) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada Q4_K_M); token_embd y per_layer_token_embd en Q8_0 en todas las variantes; sin imatrix |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) + mmproj F16 para imagen/audio |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y los tags se infiere que deriva de Gemma 4 en su variante E4B, con pipeline image-text-to-text y un proyector multimodal (mmproj) que habilita entrada de imagen y audio. La model card menciona explicitamente "Per-Layer Embedding" (`per_layer_token_embd`), un componente que se mantiene en Q8_0 en todas las cuantizaciones para preservar calidad. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

El modelo es un merge de tipo "goatmerge" (tag propio del autor) orientado a eliminar el comportamiento de rechazo del modelo original ("heretic"). No se documenta la receta de merge, los modelos combinados ni los hiperparametros. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp (master a 2026-11-21) y la cuantizacion con `llama-quantize` de llama.cpp b12606. No se empleo imatrix.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Entrada multimodal imagen-texto mediante el proyector mmproj F16 (`llama-mtmd-cli`).
- Entrada de audio segun la model card (el mmproj se describe como "proyector para entrada de imagen y audio").
- Soporte de japones e ingles.
- Comportamiento "uncensored": el merge elimina los rechazos del modelo base, lo que amplia el rango de respuestas generadas pero elimina filtros de seguridad.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso agentico.

## Casos de uso

- Despliegue local en llama.cpp: usar la variante Q4_K_M con `llama-cli -m ... -cnv` para conversacion interactiva en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Descripcion de imagenes en local: con `llama-mtmd-cli` y el mmproj F16, el modelo puede procesar fotos y generar descripciones en japones o ingles, util para prototipos de accesibilidad o catalogacion de imagenes.
- Investigacion sobre alineamiento y seguridad: al ser un merge "heretic", sirve para estudiar como varia el comportamiento de rechazo respecto al Gemma base, en entornos controlados y con supervision humana.
- Prototipado de asistentes conversacionales en japones: el soporte nativo de ja permite construir demos de atencion al cliente o tutoria sin depender de APIs externas.
- Experimentacion multimodal en investigacion: el par GGUF + mmproj facilita reproducir experimentos de vision-lenguaje en hardware modesto con llama.cpp.
- Evaluacion de cuantizaciones: el repositorio incluye cinco variantes (BF16 a Q4_K_M) con embeddings en Q8_0, lo que permite medir la degradacion de calidad por cuantizacion en tareas de texto e imagen.
- Generacion de contenido sin filtros en entornos de investigacion creativa: util para estudiar sesgos y comportamiento del modelo, siempre con revision humana y cumplimiento legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (7.518 millones de parametros), BF16 requeriria del orden de 15 GB, Q8_0 unos 8 GB, Q6_K unos 6,5 GB, Q5_K_M unos 5,5 GB y Q4_K_M unos 4,5-5 GB, mas el mmproj F16 para multimodal. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamano, las variantes Q4_K_M y Q5_K_M podrian caber en GPUs consumer con 8 GB o mas, pero no hay validacion publicada.
- Opciones de despliegue: llama.cpp (herramientas `llama-cli`, `llama-mtmd-cli`, `llama-quantize`); compatible con endpoints segun tags. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo "uncensored": el merge elimina los rechazos del modelo base; la model card advierte explicitamente de que la seguridad de las salidas no esta garantizada.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de alucinacion.
- Idiomas limitados a japones e ingles; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con contextos largos.
- Licencia Apache 2.0 en el repositorio, pero la model card remite a las licencias de los modelos base (incluidos los terminos de uso de Gemma); es necesario verificar el cumplimiento antes de uso comercial.
- No se documenta la receta de merge ni los modelos combinados, lo que dificulta la trazabilidad y la evaluacion de sesgos.
- Sin descargas ni likes: no hay evidencia de uso en comunidad ni validacion externa.
- El repositorio ocupa 47,0 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las variantes.
- Uso en produccion desaconsejado sin evaluacion propia de seguridad, sesgos y calidad, dado el caracter experimental del merge.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- llama.cpp (herramientas de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
