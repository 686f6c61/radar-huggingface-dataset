# muggysdigital/GreBerta-ONNX

## Resumen

GreBerta-ONNX es la conversión al formato ONNX del modelo bowphs/GreBerta, un encoder monolingüe de tamaño RoBERTa-base entrenado específicamente para griego antiguo (código de idioma `grc`). Lo publica el usuario muggysdigital mediante un proceso de conversión automática, y su propósito es facilitar la inferencia en el navegador y en entornos JavaScript a través de la librería transformers.js, empleando la pipeline `fill-mask` (predicción de tokens enmascarados).

El modelo original procede del proyecto de investigación del grupo Heidelberg NLP, presentado en el artículo "Exploring Language Models for Classical Philology" (Riemenschneider y Frank, ACL 2023), cuyo objetivo es dotar a la filología clásica de modelos de lenguaje de última generación. GreBerta es un encoder monolingüe (solo griego antiguo) de arquitectura RoBERTa, sin capacidades generativas: no es un modelo de chat ni de instrucciones, sino una base para extracción de representaciones y ajuste fino en tareas de procesamiento del griego clásico.

Su relevancia actual es de nicho pero valiosa: pone a disposición de la comunidad de humanidades digitales un modelo ligero, con licencia Apache 2.0, que puede ejecutarse localmente o incluso en el navegador sin GPU dedicada, algo poco habitual en modelos de lenguas históricas. El repositorio ONNX ocupa 2,0 GB, aunque el modelo en sí es pequeño (arquitectura RoBERTa-base), y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-base) |
| Parametros totales | ~125 M (arquitectura RoBERTa-base; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la informacion disponible; por arquitectura RoBERTa-base, tipicamente 512 tokens |
| Tipos de cuantizacion | Conversion ONNX automatica; variantes cuantizadas concretas no detalladas en la informacion disponible |
| Idiomas soportados | Griego antiguo (`grc`), monolingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

GreBerta es un encoder monolingüe de tamaño RoBERTa-base (familia BERT/RoBERTa, sin componente decodificador). Se entrena con objetivo de modelado de lenguaje enmascarado (masked language modeling), lo que lo capacita para predecir tokens ocultos en una secuencia, pero no para generar texto libre de forma autoregresiva. El modelo original fue desarrollado por Heidelberg NLP y presentado en el artículo "Exploring Language Models for Classical Philology" (ACL 2023).

Los datos de entrenamiento proceden del dataset `bowphs/internet_archive_filtered`, una colección filtrada de textos de Internet Archive orientada al griego antiguo. La model card no detalla el número exacto de tokens de entrenamiento, la composición completa del corpus ni si se aplicaron fases de ajuste (RLHF/DPO), algo poco habitual en encoders de este tipo. La versión aquí descrita (ONNX) se generó de forma automática con el Space `onnx-community/convert-to-onnx`, por lo que no introduce cambios arquitectónicos respecto al modelo base, solo un cambio de formato para interoperabilidad.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) sobre texto en griego antiguo.
- Extraccion de representaciones contextuales (embeddings) del griego clasico.
- Base para ajuste fino en tareas de etiquetado linguistico: analisis morfologico, etiquetado gramatical (POS), lematizacion y analisis de dependencias.
- Inferencia en navegador y en JavaScript/TypeScript mediante transformers.js y ONNX Runtime.
- Ejecucion en CPU sin GPU dedicada, dado el reducido tamano del modelo.
- No soporta generacion de texto libre, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- Multilingue: no; es estrictamente monolingue en griego antiguo.

## Casos de uso

- Restauracion de texto en inscripciones y manuscritos: la pipeline `fill-mask` permite predecir caracteres o palabras perdidas en fragmentos de griego antiguo, apoyando la labor de edicion critica de filologos.
- Etiquetado morfologico y gramatical: ajustando el modelo sobre corpus anotados (por ejemplo, Universal Dependencies), sirve como base para POS tagging y analisis morfologico automatico del griego clasico.
- Analisis sintactico y lematizacion: el modelo original alcanza resultados competitivos en tareas de dependencias (UAS/LAS) sobre el dataset Perseus, por lo que puede integrarse en pipelines de anotacion linguistica.
- Herramientas educativas en navegador: gracias a la conversion ONNX y transformers.js, se puede desplegar un corrector o asistente de lectura de griego clasico que funcione integramente en el cliente, sin backend ni GPU.
- Busqueda semantica en corpus clasicos: las representaciones generadas permiten construir indices vectoriales para recuperacion de pasajes similares en bibliotecas digitales de textos griegos.
- Investigacion en humanidades digitales: sirve como punto de partida reproducible y ligero para experimentos de NLP historico, con licencia Apache 2.0 que facilita su reutilizacion academica.
- Preprocesamiento documental: normalizacion y desambiguacion de formas griegas antes de alimentar otros sistemas de analisis filologico.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo original, tras ajuste fino sobre datos de Universal Dependencies 2.10 y evaluacion en el dataset Ancient Greek Perseus:

| Tarea | XPoS | UPoS | UAS | LAS |
|---|---|---|---|---|
| Griego antiguo (Perseus) | 95,83 | 91,09 | 88,20 | 83,98 |

No se han publicado en la informacion disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K), lo cual es coherente con la naturaleza de encoder sin capacidad de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (modelo de ~125 M de parametros); en torno a 125-250 MB en cuantizacion INT8.
- GPU recomendadas: practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); el modelo no requiere GPU dedicada.
- Cabe holgadamente en GPU consumer y tambien en CPU; puede ejecutarse en navegador.
- Opciones de despliegue: transformers.js, ONNX Runtime (Python, JavaScript, C++), y servidores de inferencia compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos en CPU moderna para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| GreBerta-ONNX (este) | ~125 M (RoBERTa-base) | No especificado (tipico 512) | Griego antiguo | Apache 2.0 | ONNX |
| bowphs/GreBerta (original) | ~125 M (RoBERTa-base) | No especificado (tipico 512) | Griego antiguo | Apache 2.0 | safetensors/PyTorch |
| Otros modelos del proyecto Heidelberg NLP (latin, etc.) | No disponible | No disponible | Latin y otras lenguas clasicas | No disponible | No disponible |

La comparativa directa con alternativas de la misma categoria es limitada: el ecosistema de modelos para lenguas clasicas es reducido, y no se dispone en la informacion proporcionada de cifras verificables de otros modelos comparables (por ejemplo, variantes para latin) que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo monolingue: solo cubre griego antiguo (`grc`); no procesa griego moderno ni otras lenguas.
- Encoder sin generacion: no puede usarse para chat, resumen, traduccion generativa ni instrucciones; su salida se limita a predicciones fill-mask y representaciones.
- Conversion automatica: la version ONNX se genero de forma automatica, sin validacion de calidad documentada; conviene verificar la equivalencia funcional con el modelo original antes de usarla en produccion.
- Contexto limitado: al derivar de RoBERTa-base, es probable una ventana de 512 tokens (no confirmada explicitamente), insuficiente para documentos extensos sin segmentacion.
- Riesgo de alucinacion: aunque menor al no generar texto libre, las predicciones fill-mask pueden producir formas gramaticales plausibles pero incorrectas en contextos fragmentarios.
- Sesgos del corpus: al entrenarse sobre textos filtrados de Internet Archive, puede heredar sesgos de seleccion y cobertura desigual de generos y periodos del griego antiguo.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 "likes", por lo que no hay evidencia de uso en produccion ni de validacion externa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset de entrenamiento subyacente.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/muggysdigital/GreBerta-ONNX
- Modelo base original: https://huggingface.co/bowphs/GreBerta
- Articulo (arXiv): https://arxiv.org/abs/2305.13698
- Repositorio GitHub del proyecto: https://github.com/Heidelberg-NLP/ancient-language-models
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de transformers.js (fill-mask): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FillMaskPipeline
- Universal Dependencies 2.10: https://universaldependencies.org/
