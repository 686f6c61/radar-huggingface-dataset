# 0xSojalSec/Gemma-4-Giftige-31B-v1-GGUF

## Resumen

Gemma-4-Giftige-31B-v1-GGUF es la distribución en formato GGUF de un merge de modelos de la familia Gemma, publicado por el usuario 0xSojalSec a partir del modelo Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) realizada con mergekit cuyas cuantizaciones estáticas fueron generadas originalmente por mradermacher y reempaquetadas en este repositorio. El resultado es un modelo denso de 30.697.345.596 parámetros (aproximadamente 30,7B) orientado a escritura creativa, roleplay y conversación sin restricciones de contenido, con modos de razonamiento y no razonamiento diferenciados por etiquetas.

Su relevancia práctica es acotada pero concreta: ofrece un checkpoint de ~31B en Apache 2.0, con una batería completa de cuantizaciones GGUF (desde Q2_K de 12,0 GB hasta Q8_0 de 32,7 GB) que permiten ejecutarlo en hardware de consumo y en entornos totalmente offline. Esto lo hace útil para quienes necesitan un modelo de narrativa largo sin censura, ejecutable en local con llama.cpp u Ollama, y para experimentación con merges comunitarios.

Ahora bien, conviene ser explícito: el repositorio no incluye model card técnica propia (el README es el del cuantizador), no declara longitud de contexto, no publica benchmarks, solo soporta inglés y acumula cero descargas en el momento de la consulta. Es, por tanto, un artefacto de nicho que debe evaluarse empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, tag `gemma-4`); fusion de modelos mediante mergekit; detalles de capas y atencion no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; el comentario de configuracion menciona ademas `x-f16` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo principal); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 211,9 GB (coincide aproximadamente con la suma de todas las cuantizaciones listadas, ~213 GB) |
| Modelo base | Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1 |
| Cuantizador | mradermacher (cuantizaciones estaticas) |
| Fecha de publicacion | 2026-10-22 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Por las etiquetas (`gemma-4`, `merge`, `mergekit`, `31B`) se deduce que es un transformer decoder-only de la familia Gemma, combinado mediante tecnicas de model merging (mergekit) a partir de checkpoints derivados de esa familia. No se especifica si el merge emplea SLERP, TIES, DARE u otra metodologia, ni la lista de modelos de origen, ni la proporcion de mezcla. Tampoco se indica si hay componentes de mezcla de expertos: con 30,7B de parametros totales y sin campo de parametros activos, lo razonable es asumir un modelo denso.

No existe informacion sobre datos de entrenamiento: no se declaran tokens, composicion del corpus, ni fases de RLHF, DPO o ajuste por instrucciones. Al ser un merge, el conocimiento procede integramente de los modelos predecesores. Las etiquetas `reasoning` y `non-reasoning` sugieren que el modelo admite ambos regimenes de generacion (con y sin trazas de razonamiento), presumiblemente heredados de alguno de los componentes del merge. Tampoco se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa larga, descripcion de escenas y consistencia de estilo.
- Roleplay multi-turno y mantenimiento de personajes, reforzado por las etiquetas `roleplay` y `creative writing`.
- Modo de razonamiento (`reasoning`) y modo directo (`non-reasoning`), segun la etiqueta del modelo; el mecanismo de activacion no esta documentado.
- Generacion sin censura (`uncensored`), incluyendo contenido NSFW y para adultos.
- Conversacion general (`conversational`) y respuesta a instrucciones.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio HTTP.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio y otras modalidades: no disponible; la configuracion de cuantizacion marca `skip_mmproj: 1`, lo que apunta a que no se incluye proyector multimodal en estos ficheros.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Escritura creativa asistida: generacion de relatos, novelas por capitulos y ficcion interactiva, aprovechando el enfasis del merge en `creative writing` y su tolerancia a contenido adulto sin filtros editoriales.
- Motores de roleplay y compania virtual: integracion en frontends tipo SillyTavern, koboldcpp o text-generation-webui para mantener personajes coherentes en conversaciones multi-turno, ejecutando el GGUF en local para no enviar datos a terceros.
- Guionizacion y dialogos para videojuegos o audiolibros: produccion de arboles de dialogo y variantes de personaje en lote, con un Q4_K_M de 18,8 GB sobre una RTX 4090 o 3090.
- Generacion de datos sinteticos narrativos: creacion de corpus de dialogo y ficcion para ajuste fino posterior de modelos menores, siempre que se revise el contenido generado antes de reutilizarlo.
- Prototipado de asistentes de escritura en local: despliegue con `llama-server` en una estacion de trabajo con GPU de 24 GB, sin dependencia de APIs externas, para entornos con requisitos de confidencialidad.
- Investigacion sobre merges de modelos: uso como caso de estudio de como un merge comunitario de la familia Gemma se comporta frente al modelo base en pruebas de estilo, coherencia y diversidad, comparando cuantizaciones Q4_K_M frente a Q8_0.
- Base para ajuste fino orientado a dominio creativo: punto de partida (via safetensors del modelo base) para LoRA o fine-tuning completo en tareas de narrativa o roleplay especializado.
- Experimentacion con modos de razonamiento: comparacion cualitativa entre generacion directa y generacion con trazas de razonamiento en tareas de planificacion narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de rol o creatividad para este merge. Tampoco se ha publicado perplejidad comparativa entre cuantizaciones. El unico material grafico referenciado es un grafico externo de ikawrakow sobre calidad relativa de tipos de cuantizacion, que no mide este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 12,0 GB; Q3_K_S 13,9 GB; Q3_K_M 15,4 GB; Q3_K_L 16,7 GB; IQ4_XS 17,0 GB; Q4_K_S 17,9 GB; Q4_K_M 18,8 GB; Q5_K_S 21,4 GB; Q5_K_M 21,9 GB; Q6_K 25,3 GB; Q8_0 32,7 GB. En FP16 serian aproximadamente 61 GB (dos bytes por parametro), si bien ese fichero no aparece en la tabla de cuantizaciones del repositorio.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super recortada): solo Q2_K y, con apuros, Q3_K_S, con contexto muy limitado y perdida de calidad apreciable.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G): Q4_K_S y Q4_K_M son las opciones recomendadas por el cuantizador; Q5_K_M entra justo y deja poco margen para cache KV.
- GPU de 32-48 GB (A100 40 GB, A6000 48 GB): Q6_K y Q8_0 completos, con espacio holgado para contexto largo.
- Configuraciones multi-GPU: Q8_0 puede repartirse en 2x24 GB; Q6_K en 2x16 GB con `--split-mode row` o capa a capa.
- CPU + RAM: es viable con llama.cpp en modo hibrido; para Q4_K_M conviene disponer de 32 GB de RAM de sistema y expectativas de 1-3 tokens/s, muy por debajo de una GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF con un Modelfile), LM Studio, koboldcpp, text-generation-webui y llama-cpp-python. vLLM y TGI no consumen GGUF de forma nativa para este caso; requeririan los safetensors del modelo base Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1.
- Latencia y throughput: no disponible. No hay mediciones publicadas; el rendimiento dependera del ancho de banda de memoria de la GPU y del tamano de contexto efectivo, que tampoco esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| Gemma-4-Giftige-31B-v1 (este) | 30,7B | no disponible | apache-2.0 (declarada) | GGUF en este repo; sin benchmarks; solo ingles; orientado a rol y creatividad |
| Gemma 3 27B (Google) | 27B | 128K segun documentacion publica | Gemma Terms of Use | Safetensors y multiples cuantizaciones comunitarias; multimodal; multilingue; con benchmarks publicados |
| Qwen2.5-32B (Alibaba) | ~32,5B | 131.072 segun documentacion publica | Apache 2.0 | Safetensors y GGUF; multilingue; benchmarks publicados; muy usado en produccion |
| Mistral Small 3 24B (Mistral AI) | 24B | 32K segun documentacion publica | Apache 2.0 | Pesos abiertos y GGUF; orientado a baja latencia; benchmarks publicados |

Nota: los datos de contexto, licencia y parametros de los modelos de terceros provienen de su documentacion publica y se incluyen solo como referencia de categoria. Para este merge no hay cifras verificables de contexto ni de rendimiento, de modo que la comparacion cuantitativa de calidad no es posible con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad; el hecho de ser un merge comunitario con cero descargas y cero valoraciones implica un riesgo alto de comportamientos degenerados (repeticiones, perdida de coherencia en contextos largos).
- Licencia potencialmente conflictiva: el repositorio declara apache-2.0, pero los pesos derivan de la familia Gemma, cuyos terminos de uso originales imponen restricciones adicionales. Antes de un uso comercial conviene verificar la cadena de licencias del modelo base y de los componentes del merge.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas; el rendimiento fuera del ingles sera impredecible.
- Longitud de contexto no documentada: planificar prompts largos (roleplay de muchasvueltas, novelas por capitulos) sin conocer la ventana real puede provocar truncamientos silenciosos o degradacion.
- Contenido sin censura: la orientacion `uncensored` y `nsfw` implica que el modelo puede generar material adulto, ofensivo o inexacto sin filtros. Requiere moderacion externa y delimitacion de audiencia (`not-for-all-audiences`).
- Riesgo de alucinacion elevado en tareas factuales: el enfasis del merge es narrativo, no de precision; no es adecuado como fuente de datos ni para asistencia medica, legal o financiera.
- Sesgos no evaluados: al no haber model card del autor del merge ni evaluaciones, se desconocen sesgos de genero, raza, religion o politicos.
- Repositorio de escasa trazabilidad: el README es una copia del generado por mradermacher para las cuantizaciones; no describe el proceso de merge, los modelos fuente ni los hiperparametros.
- Fecha de publicacion atipica (2026-10-22) y ausencia de actividad: no hay senales de mantenimiento, correccion de errores ni soporte.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; para evaluacion seria usar Q5_K_M o superior.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/0xSojalSec/Gemma-4-Giftige-31B-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1
- Repositorio original de cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/Gemma-4-Giftige-Blume-31B-v1-GGUF
- Cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/Gemma-4-Giftige-Blume-31B-v1-i1-GGUF
- Pagina de descarga alternativa citada en el README: https://hf.tst.eu/model#Gemma-4-Giftige-Blume-31B-v1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Herramienta de fusion de modelos mergekit: https://github.com/arcee-ai/mergekit
- Entidad que aporto infraestructura al cuantizador: https://www.nethype.de/
