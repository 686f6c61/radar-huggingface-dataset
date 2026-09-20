# daresearch/sp500-exec-classifier-llama3.3-lora

## Resumen

`daresearch/sp500-exec-classifier-llama3.3-lora` es un adaptador LoRA publicado por el usuario daresearch y ajustado a partir de `unsloth/Llama-3.3-70B-Instruct-bnb-4bit`, una version pre-cuantizada en 4 bits del Llama 3.3 70B Instruct de Meta. Por el nombre del repositorio, el ajuste parece orientado a clasificacion de directivos (executives) de empresas del S&P 500, pero el autor no documenta la tarea, el dataset ni el formato de entrada/salida, por lo que el proposito exacto queda sin confirmar.

El interes practico del modelo es limitado como artefacto aislado: la model card es la plantilla por defecto de Unsloth, sin descripcion de datos de entrenamiento, hiperparametros, metricas ni ejemplos de uso. Se publica con licencia apache-2.0, idioma declarado en ingles y un repositorio de 6,6 GB, sin descargas ni valoraciones en el momento de la consulta.

Es relevante para quien necesite un punto de partida reutilizable de ajuste QLoRA sobre Llama 3.3 70B en el dominio financiero, pero no como modelo listo para produccion: faltan evaluaciones, documentacion de la etiqueta objetivo y aclaracion sobre la licencia aplicable al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (adaptador LoRA sobre Llama 3.3 70B Instruct; arquitectura del adaptador no documentada) |
| Parametros totales | 70B en el modelo base; tamano del adaptador no disponible |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No especificada para el ajuste; el modelo base Llama 3.3 70B Instruct soporta 128.000 tokens segun su documentacion oficial |
| Tipos de cuantizacion | Base pre-cuantizada en 4 bits NF4 (bitsandbytes); el repositorio contiene safetensors y no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) declarado en la model card |
| Licencia | apache-2.0 declarada por el autor (el modelo base Llama 3.3 se rige por la Llama 3.3 Community License) |
| Formato de pesos | safetensors (repositorio de 6,6 GB) |
| Libreria | transformers |
| Tags adicionales | text-generation-inference, unsloth, llama, trl, endpoints_compatible |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (o QLoRA) entrenado con Unsloth y la libreria TRL sobre `unsloth/Llama-3.3-70B-Instruct-bnb-4bit`. La model card afirma explicitamente que el entrenamiento fue "2x faster with Unsloth", lo que confirma el uso de ese framework, pero no detalla rango del adaptador, modulos objetivo, numero de pasos, tasa de aprendizaje, composicion del dataset ni si hubo fases de RLHF, DPO o preferencia adicional. No se declara el numero de tokens de entrenamiento ni la procedencia de los datos.

Un aspecto tecnico relevante es que el base model ya esta cuantizado en 4 bits (NF4 de bitsandbytes), lo que implica un flujo de QLoRA: el adaptador se ajusto contra pesos cuantizados, no contra el modelo en precision completa. Esta eleccion reduce los requisitos de memoria durante el entrenamiento, pero introduce dos caveats: la fusion del adaptador sobre el modelo de 4 bits no esta soportada de forma estandar por PEFT, y el comportamiento del adaptador sobre el Llama 3.3 70B Instruct original en bf16 no ha sido validado por el autor.

No hay ninguna innovacion tecnica documentada mas alla del uso de Unsloth para acelerar el ajuste. El repositorio, de 6,6 GB, es inusualmente grande para un adaptador LoRA de rango bajo sobre un modelo de 70B, pero el autor no explica su contenido ni si incluye pesos fusionados, estados de optimizador u otros artefactos.

## Capacidades

- Generacion de texto y clasificacion de texto en ingles, heredadas del modelo base Llama 3.3 70B Instruct y potencialmente especializadas en la tarea sugerida por el nombre del repositorio (clasificacion de directivos del S&P 500).
- Razonamiento y comprension de lenguaje natural complejo, incluida la lectura de documentos financieros largos, gracias a la ventana de contexto del base (128.000 tokens segun su documentacion).
- Soporte de function calling y tool calling heredado de Llama 3.3 Instruct, aunque no confirmado ni evaluado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso heredadas del base, sin validacion publicada para este adaptador.
- Capacidades multilingues del base (8 idiomas en Llama 3.3), pero la model card declara unicamente ingles y no hay evidencia de que el ajuste preserve comportamiento multilingue.
- No se documentan capacidades de vision, audio, modo thinking explicito ni decodificacion especulativa.
- No se documenta el esquema de etiquetas, el prompt template ni el formato de salida esperado para la tarea de clasificacion.

## Casos de uso

- Clasificacion y normalizacion de cargos directivos: si el modelo cumple lo que sugiere su nombre, permitiria mapear menciones textuales de ejecutivos de companias del S&P 500 a cargos y empresas normalizados, util para construir bases de datos de relaciones corporativas.
- Extraccion de informacion de informes 10-K y declaraciones proxy (DEF 14A): el contexto largo del base permite procesar secciones completas de gobierno corporativo y extraer nombres, cargos y fechas sin trocear el documento.
- Enriquecimiento de datasets financieros para investigacion: usar el modelo como etiquetador semiautomatico de noticias y notas de prensa sobre cambios de directiva, siempre con revision humana por la ausencia de metricas de calidad publicadas.
- Triage en pipelines de inteligencia de mercados: filtrar noticias relevantes sobre movimientos de ejecutivos antes de pasarlas a un analista o a un modelo mayor, reduciendo coste de procesamiento.
- Soporte a procesos de cumplimiento y KYC: preclasificar documentacion societaria para identificar personas con responsabilidad de administracion, con verificacion manual obligatoria dado el riesgo de error.
- Asistencia a equipos de banca de inversion y relaciones con inversores: resumir y clasificar cambios en el equipo directivo de empresas cotizadas para preparar briefings de reunion.
- Anotacion previa de corpus para entrenar modelos mas pequenos y especializados: el adaptador puede servir como generador de pseudoetiquetas en un ciclo de destilacion, sujeto a validacion estadistica.
- Base para un ajuste adicional en castellano: al ser un adaptador LoRA pequeno (respecto al modelo completo), es un punto de partida economico para reajustar en dominios o idiomas distintos.

En todos los casos anteriores, el uso en produccion sin evaluacion previa es desaconsejable: el autor no publica datos de validacion, matriz de confusion ni ejemplos de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, metricas de clasificacion (accuracy, F1), evaluacion de robustez ni comparaciones con el modelo base. Tampoco se documenta ninguna evaluacion cualitativa con ejemplos de entrada y salida.

## Requisitos de hardware

- VRAM estimada para el modelo base en inferencia: aproximadamente 40-48 GB en cuantizacion de 4 bits, 70-80 GB en 8 bits y 140-150 GB en bf16/fp16 (estimaciones basadas en el numero de parametros, no publicadas por el autor).
- El adaptador no puede ejecutarse de forma aislada: requiere cargar o fusionar el modelo base de 70B.
- GPU recomendadas para 4 bits: 2x A100 40 GB, 2x L40S 48 GB, 1x A100 80 GB, 1x H100 80 GB o 1x H200 141 GB. Para bf16: 2x H100 80 GB o nodos multi-GPU.
- GPU de consumo: no cabe en una sola RTX 4090, 3090 ni 4080 de 24 GB en 4 bits; es viable con dos RTX 4090 (48 GB) mediante tensor parallelism o con CPU offloading agresivo, a costa de latencia muy alta. En equipos Apple con memoria unificada de 64-128 GB es posible en cuantizaciones bajas.
- Opciones de despliegue: vLLM, Hugging Face TGI (el tag del repositorio incluye text-generation-inference), transformers + PEFT para cargar el adaptador, Unsloth para reentrenamiento. Ollama y llama.cpp requieren fusionar el adaptador sobre el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por peticion para este adaptador.
- Nota de implementacion: fusionar el adaptador sobre el base pre-cuantizado en NF4 no es un flujo estandar en PEFT. La ruta recomendada es fusionar sobre `meta-llama/Llama-3.3-70B-Instruct` en bf16, asumiendo el riesgo de que el adaptador fue entrenado sobre pesos cuantizados.

## Comparativa con modelos similares

No se identifican adaptadores comparables en la informacion disponible. La tabla siguiente compara el modelo base y alternativas generales de la misma escala, ya que el adaptador hereda de ellos su coste y su ventana de contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| daresearch/sp500-exec-classifier-llama3.3-lora | 70B (base) + adaptador no cuantificado | 128.000 tokens (base) | apache-2.0 declarada; base bajo Llama 3.3 Community License | Hugging Face, 0 descargas | Sin benchmarks ni documentacion de entrenamiento |
| meta-llama/Llama-3.3-70B-Instruct | 70B denso | 128.000 tokens | Llama 3.3 Community License | Hugging Face, ampliamente desplegado | Modelo base; benchmarks publicos en su model card |
| Qwen2.5-72B-Instruct | 72B denso | 32.000 tokens nativos, ampliables a 131.072 con YaRN | Qwen License | Hugging Face | Alternativa generalista de escala similar |
| DeepSeek-V3 | 671B totales, 37B activos (MoE) | 128.000 tokens en configuracion | MIT (pesos) | Hugging Face | Mayor coste de despliegue, licencia mas permisiva |

Los resultados de benchmarks comparativos no estan disponibles para el modelo evaluado, por lo que no se puede establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, matriz de confusion, conjunto de validacion ni ejemplos de inferencia publicados. No se puede afirmar que el ajuste haya tenido exito.
- Documentacion inexistente: la model card es la plantilla de Unsloth. No se describe el dataset, el esquema de etiquetas, el prompt template, la longitud de secuencia de entrenamiento ni los hiperparametros.
- Ambiguedad de licencia: el autor declara apache-2.0, pero el modelo base Llama 3.3 esta sujeto a la Llama 3.3 Community License, que impone condiciones de uso aceptable, obligacion de atribucion ("Built with Llama") y restricciones de nomenclatura. Una licencia derivada no puede relajar los terminos del modelo base; conviene revisar el encaje legal antes de cualquier uso comercial.
- Base cuantizada en 4 bits durante el entrenamiento: el adaptador se ajusto sobre pesos NF4, lo que puede degradar la calidad respecto a un ajuste sobre el modelo en bf16 y complica el flujo de fusion.
- Idioma: solo ingles declarado. Cualquier uso en castellano queda sin validar.
- Dominio muy especifico: si el modelo efectivamente clasifica directivos del S&P 500, su aplicabilidad fuera de ese universo empresarial es practicamente nula.
- Riesgo de alucinacion en tareas de extraccion: los modelos de 70B pueden generar cargos, nombres o fechas plausibles pero incorrectos. En contextos de cumplimiento normativo o KYC esto exige verificacion humana obligatoria.
- Sesgos potenciales: los derivados de Llama 3.3 (sesgos de genero, origen y representacion en textos corporativos) mas los sesgos del dataset de ajuste no documentado, que podria sobrerrepresentar determinados sectores o tipos de empresa.
- Adopcion nula: cero descargas y cero valoraciones. No hay senales de uso en la comunidad ni de validacion independiente.
- Tamano del repositorio: 6,6 GB sin explicacion. Conviene inspeccionar el contenido antes de asumir que se trata de un adaptador LoRA estandar.
- Sin garantia de mantenimiento: el repositorio se creo y actualizo el mismo dia, sin actividad posterior registrada.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; los resultados obtenidos correspondian a software de gestion de superficie de ataque externa, sin relacion con la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daresearch/sp500-exec-classifier-llama3.3-lora
- Modelo base (cuantizado): https://huggingface.co/unsloth/Llama-3.3-70B-Instruct-bnb-4bit
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Licencia Llama 3.3 Community License: https://www.llama.com/llama3_3/license/
- Paper, blog tecnico, repositorio propio o demo del autor: no disponible
- No se han encontrado enlaces adicionales relevantes en la busqueda web.
