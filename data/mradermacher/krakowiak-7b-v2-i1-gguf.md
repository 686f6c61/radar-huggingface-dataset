# mradermacher/Krakowiak-7B-v2-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/Krakowiak-7B-v2-i1-GGUF`, una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base `szymonrucinski/Krakowiak-7B-v2`. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: el autor aplica cuantizacion con matrices de importancia (imatrix) y pesos ponderados para reducir el tamano de los ficheros sin degradar en exceso la calidad respecto al modelo original en precision completa.

El modelo subyacente es un LLM de aproximadamente 7.241 millones de parametros (7,24 B) orientado al idioma polaco (`pl`), lo que lo situa en la categoria de modelos pequenos capaces de ejecutarse en hardware de consumo. La relevancia de este repositorio reside en la cantidad y granularidad de las cuantizaciones ofrecidas: desde versiones extremadamente comprimidas (IQ1_S, ~1,7 GB) hasta otras practicamente equivalentes a la precision original (Q6_K, ~6,0 GB), lo que permite ajustar el equilibrio entre VRAM disponible y calidad de salida.

El modelo se publica bajo licencia CC BY-SA 4.0, con caracter copyleft y atribucion obligatoria, lo que condiciona su uso comercial. En el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, y no se han publicado resultados de benchmarks ni especificaciones detalladas de arquitectura o contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (inferido por tamano y formato; no confirmado explicitamente en la model card) |
| Parametros totales | 7.241.732.096 (aprox. 7,24 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de un fichero imatrix) |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura interna del modelo base `szymonrucinski/Krakowiak-7B-v2` en la documentacion proporcionada. Por el numero de parametros (7,24 B) y el formato de distribuccion (transformers + GGUF), se trata casi con certeza de un transformer decoder de tipo denso, pero este extremo no se confirma explicitamente en la model card. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. La orientacion linguistica declarada es exclusivamente el polaco.

Lo que si esta documentado es el proceso de cuantizacion aplicado por mradermacher. Los ficheros de este repositorio se generan con "weighted/imatrix quants", es decir, cuantizacion guiada por una matriz de importancia calculada a partir de las activaciones del modelo, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. El autor publica tambien la matriz de importancia (`Krakowiak-7B-v2.imatrix.gguf`, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe asimismo un repositorio paralelo con cuantizaciones estaticas (sin imatrix). La innovacion tecnica relevante es, por tanto, la propia metodologia de cuantizacion de alta calidad, no el entrenamiento del modelo.

## Capacidades

- Generacion de texto en polaco, al ser el unico idioma declarado.
- Razonamiento y generacion de lenguaje general propios de un LLM de 7 B, sin capacidades especificas documentadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni multimodalidad.
- No se confirma si el modelo base esta ajustado como instruct/chat o si es un modelo base de continuacion de texto; no disponible.
- Capacidades multilingues: limitadas al polaco segun la etiqueta de idioma declarada.

## Casos de uso

- Generacion de texto en polaco: redaccion de articulos, correos o descripciones en polaco, aprovechando que es el unico idioma soportado y el objetivo declarado del modelo.
- Asistente conversacional local en polaco: despliegue en un equipo sin conexion a internet mediante llama.cpp u Ollama, adecuado por el reducido tamano de las cuantizaciones (a partir de ~4,5 GB en Q4_K_M).
- Resumen y clasificacion de documentos en polaco de dominio general: con las cuantizaciones mayores (Q5_K_M, Q6_K) para maximizar fidelidad en tareas de comprension.
- Prototipado e investigacion en PLN (procesamiento de lenguaje natural) polaco: uso como punto de partida para experimentos o para comparar el efecto de distintas cuantizaciones sobre una misma tarea.
- Ajuste fino posterior (fine-tuning): partir del modelo base en safetensors para adaptarlo a un dominio concreto y luego recuantizar.
- Generacion de contenido editorial a pequena escala en polaco: titulares, resumenes de prensa o borradores, siempre con revision humana dado el riesgo de alucinacion.
- Despliegue en hardware muy limitado (movil, Raspberry Pi, portatiles antiguos): las cuantizaciones IQ1/IQ2 permiten ejecutar un modelo de 7 B en entornos con pocos GB de RAM o VRAM, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni equivalentes, y no se aportan cifras de comparacion con otros modelos. El autor referencia un grafico externo de perplejidad (elaborado por ikawrakow) que compara tipos de cuantizacion de baja calidad, pero no se incluyen valores numericos concretos para este modelo en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamano del fichero GGUF, mas overhead de contexto):
  - i1-IQ1_S: ~1,7 GB.
  - i1-Q3_K_M: ~3,6 GB.
  - i1-IQ4_XS: ~4,0 GB.
  - i1-Q4_K_M: ~4,5 GB (recomendada por el autor como rapida y equilibrada).
  - i1-Q5_K_M: ~5,2 GB.
  - i1-Q6_K: ~6,0 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, una RTX 4070/4090 o cualquier GPU con 8 GB o mas puede ejecutar las cuantizaciones de 4 a 6 bits. No se documentan despliegues en A100 o H100, innecesarios para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si. Las cuantizaciones desde Q4 hacia abajo caben en GPUs de 6-8 GB; las de Q5 y Q6 requieren 8 GB o mas. Las IQ1/IQ2 pueden ejecutarse incluso en CPU o en dispositivos con muy poca memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte nativo en vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de benchmarks y especificaciones de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas conocidas.

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Krakowiak-7B-v2-i1-GGUF (este repo) | 7,24 B | no disponible | pl | CC BY-SA 4.0 | GGUF |
| szymonrucinski/Krakowiak-7B-v2 (base) | 7,24 B | no disponible | pl | no disponible en esta ficha | safetensors |
| mradermacher/Krakowiak-7B-v2-GGUF (static quants) | 7,24 B | no disponible | pl | CC BY-SA 4.0 | GGUF |
| Otras alternativas de ~7 B en polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo entrenado predominantemente en polaco, es previsible un sesgo cultural y linguistico hacia ese contexto, pero no hay evidencia publicada en la informacion disponible.
- Riesgo de alucinacion: inherente a los LLM de 7 B; el autor no publica evaluaciones de fidelidad. Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan la calidad de forma notable y aumentan el riesgo de incoherencias; el propio README etiqueta algunas como "for the desperate" o "very low quality".
- Limitaciones de idioma: el modelo esta etiquetado unicamente como polaco (`pl`); no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Limitaciones de contexto: no se especifica la ventana de contexto en la informacion disponible, por lo que no puede planificarse su uso en tareas de contexto largo sin verificacion previa.
- Restricciones de licencia: CC BY-SA 4.0 es una licencia copyleft que exige atribucion y obliga a compartir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios de uso comercial que no quieran liberar sus modificaciones.
- Caveats para produccion: el repositorio no tiene descargas ni validacion de la comunidad; el modelo base no documenta arquitectura ni contexto; y el rendimiento real depende fuertemente de la cuantizacion elegida. Para produccion seria prudente validar la calidad de cada cuantizacion con datos propios antes de desplegarla.
- Soporte de agentes y tool calling: no documentado, por lo que no deberia asumirse en pipelines automatizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Krakowiak-7B-v2-i1-GGUF
- Modelo base: https://huggingface.co/szymonrucinski/Krakowiak-7B-v2
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Krakowiak-7B-v2-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Krakowiak-7B-v2-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Krakowiak-7B-v2-i1-GGUF/resolve/main/Krakowiak-7B-v2.imatrix.gguf
- Perfil del autor (mradermacher): https://huggingface.co/mradermacher
- Listado de modelos del autor: https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia del autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
