# Iman998/HexaBee-4B-Multilingual-Base

## Resumen

HexaBee-4B-Multilingual-Base es un checkpoint intermedio publicado por el usuario Iman998 dentro de la familia HexaBee-4B (denominada PCT-4B en la auditoría interna de evaluación). Se obtiene al fusionar (merge) el adaptador SFT multilingüe continuado sobre google/gemma-3-4b-it, tras una fase previa de adaptación con datos de Wikipedia. No es el traductor final evaluado de la familia: el propio autor lo describe como la base obligatoria del adaptador de traducción final, no como un modelo listo para producción.

El modelo conserva la arquitectura multimodal de Gemma 3 (pipeline image-text-to-text) y sus 4.300.079.472 parámetros, con pesos distribuidos en safetensors y procesador asociado. Su objetivo declarado es cubrir seis idiomas (persa, inglés, árabe, chino, hebreo y español) en tareas de respuesta multilingüe y traducción del texto de respuesta, apoyándose en 22 conjuntos de datos SFT retenidos que suman 30.153.404 registros.

Su relevancia es fundamentalmente investigadora: documenta una receta completa de adaptación multilingüe sobre un modelo abierto y publica artefactos intermedios con manifiestos verificables (SHA-256, inventario de ficheros). El repositorio no incluye una evaluación independiente de traducción de este checkpoint, por lo que debe tratarse como material de estudio de la cadena Wikipedia → SFT multilingüe → merge, y no como sustituto del modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 3 (pipeline image-text-to-text), con adaptadores fusionados en el checkpoint |
| Parametros totales | 4.300.079.472 (aproximadamente 4,3 B) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion del repositorio; el modelo base google/gemma-3-4b-it declara 128 000 tokens |
| Tipos de cuantizacion | No disponible: solo se distribuyen pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | Persa (fa), ingles (en), arabe (ar), chino (zh), hebreo (he), espanol (es) |
| Licencia | Gemma (modelo y pesos sujetos a los terminos de Gemma; el repositorio remite a LICENSE.md) |
| Formato de pesos | Safetensors + processor (formato transformers) |
| Modelo base | google/gemma-3-4b-it |
| Tamano del repositorio | 8,6 GB |
| Libreria | transformers |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de google/gemma-3-4b-it, un transformer multimodal de aproximadamente 4,3 B de parametros que acepta entradas de texto e imagen y genera texto. Sobre esa base se aplicó una cadena de adaptacion documentada por el autor: primero un adaptador entrenado con datos de Wikipedia (fase 1), despues un adaptador SFT multilingüe continuado, y finalmente una fusion de ese adaptador con el modelo base para producir este artefacto (fase 2). Los tags del repositorio referencian el informe tecnico de Gemma 3 (arXiv:2503.19786) y el articulo de LoRA (arXiv:2106.09685), lo que situa la tecnica de adaptacion en el espacio de los adaptadores de bajo rango.

La fase 2 utilizó los 22 conjuntos de datos SFT retenidos, con un total de 30.153.404 registros, orientados a respuesta multilingüe y traduccion del texto de respuesta. El repositorio se distribuye como liberacion de artefactos: incluye release_manifest.json con inventario de ficheros, tamano en bytes y SHA-256, asi como release_stats.json con recuentos medidos y metadatos de configuracion. Los datos auxiliares se empaquetan en fragmentos Parquet acotados, preservando cadenas originales y salidas vacias en las exportaciones historicas.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO. Tampoco se aporta una ablacion que aísle la contribucion del componente de respuesta multilingüe: el autor indica que se evaluó la receta de adaptacion completa y que las referencias sinteticas y los jueces basados en modelos limitan la interpretacion de los resultados.

## Capacidades

- Generacion de texto conversacional multilingüe en los seis idiomas declarados (persa, ingles, arabe, chino, hebreo y espanol).
- Traduccion entre idiomas, en particular traduccion del texto de respuesta dentro del flujo de respuesta multilingüe que define la fase 2.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text heredado de Gemma 3), lo que permite tareas guiadas por imagen con salida textual.
- Respuesta a instrucciones con plantilla de chat de Gemma 3 (roles system y user), tal como muestra el ejemplo de uso de la model card.
- Generacion determinista reproducible: el ejemplo oficial usa do_sample=False con un presupuesto de 512 tokens nuevos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.
- Capacidades de audio: no disponibles; el modelo base es multimodal de imagen y texto, no de audio.

## Casos de uso

- Traduccion asistida ingles ↔ persa, ingles ↔ arabe, ingles ↔ chino, ingles ↔ hebreo e ingles ↔ espanol: el modelo se ha adaptado especificamente a la traduccion del texto de respuesta en estos seis idiomas, por lo que puede emplearse como motor de traduccion en prototipos y experimentos, siempre que se validen las salidas con un evaluador humano o una metrica automatica externa.
- Investigacion sobre fusion de adaptadores LoRA: al publicarse junto a los adaptadores de Wikipedia y SFT multilingüe, permite reproducir y comparar la cadena de merge sobre Gemma 3 4B IT en estudios de adaptacion eficiente de parametros.
- Generacion de datos sinteticos multilingües: el modelo puede producir respuestas y traducciones de referencia para ampliar corpus en idiomas con recursos limitados, con la advertencia de que el propio autor senala que las referencias sinteticas limitan la interpretacion de los resultados.
- Evaluacion comparativa de checkpoints intermedios: sirve como linea base para medir que aporta cada fase (Wikipedia, SFT multilingüe, merge) antes de llegar al traductor final HexaBee-4B.
- Procesamiento de documentos con componente visual: al aceptar entradas de imagen y texto, puede extraer o traducir contenido de capturas, carteles o digitalizaciones simples en los idiomas soportados.
- Desarrollo de asistentes multilingües de bajo coste: con 4,3 B de parametros, el modelo puede desplegarse en una unica GPU de gama alta de consumo para prototipos de atencion en seis idiomas, aceptando la perdida de calidad esperable en un checkpoint no evaluado.
- Pruebas de integracion con transformers y text-generation-inference: el repositorio esta etiquetado como compatible con endpoints, lo que facilita montar una demo interna y verificar el formato de plantilla de Gemma 3 antes de invertir en el modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que no existe una evaluacion independiente de traduccion para este checkpoint intermedio, que la receta completa se evaluó sin ablaciones aisladas y que las entradas largas de COMET se truncan en el limite del codificador. Los recuentos de muestras, parametros, direcciones de traduccion e intervalos de incertidumbre se remiten al repositorio de evaluacion de la familia, no incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 8,6 GB solo para los pesos, mas cache KV y activaciones; en la practica se recomiendan 12 GB o mas para contextos moderados (estimacion, no dato publicado).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones, no hay versiones cuantizadas publicadas en el repositorio).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) para desarrollo e inferencia en bf16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), especialmente en bf16 con lotes pequenos o en cuantizacion de 8/4 bits.
- Opciones de despliegue: transformers (AutoModelForImageTextToText + AutoProcessor) es la via documentada; el etiquetado text-generation-inference y endpoints_compatible sugiere soporte de TGI; vLLM es una alternativa habitual para Gemma 3, aunque no se confirma en la informacion disponible; llama.cpp y Ollama requeririan una conversion propia a GGUF, no distribuida en este repositorio.
- Latencia y throughput estimados: no disponibles.
- Nota de memoria: el repositorio ocupa 8,6 GB, coherente con pesos en bf16 de 4,3 B de parametros mas el procesador y los ficheros de metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HexaBee-4B-Multilingual-Base | 4,3 B | No disponible en el repositorio (base Gemma 3 4B IT: 128 000 tokens) | Gemma | HuggingFace, safetensors + processor | Checkpoint intermedio de traduccion multilingüe; sin evaluacion independiente publicada |
| google/gemma-3-4b-it | Aproximadamente 4,3 B | 128 000 tokens declarados por el modelo base | Gemma | HuggingFace, safetensors | Modelo base multimodal image-text-to-text sobre el que se construye HexaBee; no especializado en traduccion |
| Otras alternativas de 3-4 B (Qwen, Llama, Phi) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no el traductor final evaluado de la familia HexaBee-4B; el autor lo declara explicitamente como base requerida del adaptador de traduccion final.
- No existe evaluacion independiente de traduccion para este artefacto concreto, por lo que su calidad real en cada direccion de traduccion es desconocida.
- Las exportaciones historicas pueden contener cadenas vacias, texto generado imperfecto y conflictos entre instrucciones.
- El autor advierte que la reutilizacion de filas de origen no constituye evidencia independiente y que las referencias sinteticas y los jueces basados en modelos limitan la interpretacion de cualquier resultado.
- Las entradas largas de COMET se truncan en el limite del codificador, lo que puede sesgar metricas de evaluacion de frases extensas.
- La receta completa se evaluó sin ablaciones que aíslen la contribucion del componente de respuesta multilingüe.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo generativo de 4,3 B sin evaluacion publicada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura idiomatica limitada a seis idiomas declarados (fa, en, ar, zh, he, es); no se documentan variedades dialectales ni registro formal e informal.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de Gemma y a las politicas de uso aceptable de Google, que no quedan reemplazados por los terminos de los datasets upstream empleados en el entrenamiento.
- El repositorio registra 0 descargas y 0 likes y las fechas de creacion y actualizacion son de septiembre de 2026, lo que implica una adopcion nula y una validacion por terceros inexistente.
- Para produccion, conviene usar el modelo final de la familia y verificar la evaluacion del repositorio HexaBee-Evaluation antes de tomar decisiones de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-Base
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- HexaBee-4B (modelo final de la familia): https://huggingface.co/Iman998/HexaBee-4B
- HexaBee · Wikipedia PT LoRA: https://huggingface.co/Iman998/HexaBee-4B-PT-LoRA
- HexaBee · Multilingual SFT LoRA: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-SFT-LoRA
- HexaBee · Translation LoRA: https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Dataset HexaBee · Wikipedia Foundations: https://huggingface.co/datasets/Iman998/HexaBee-Wikipedia-PT
- Dataset HexaBee · Multilingual Answering & Translation: https://huggingface.co/datasets/Iman998/HexaBee-Multilingual-SFT
- Dataset HexaBee · Bidirectional Translation: https://huggingface.co/datasets/Iman998/HexaBee-Bidirectional-Translation
- Dataset HexaBee · The Prompt Hive: https://huggingface.co/datasets/Iman998/HexaBee-System-Prompts
- Dataset HexaBee · Translation Archive: https://huggingface.co/datasets/Iman998/HexaBee-Model-Outputs
- Dataset HexaBee · Evaluation Atlas: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Articulo de LoRA: https://arxiv.org/abs/2106.09685
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las referencias recuperadas corresponden a dominios sin relacion con el proyecto.
