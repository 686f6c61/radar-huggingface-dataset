# japan-opendata/ja-reading-tagger-v1

## Resumen

`ja-reading-tagger-v1` es un modelo de etiquetado de tokens (token classification) desarrollado por `japan-opendata` para asignar lecturas (yomi) contextualmente correctas a texto japonés. A diferencia de los sistemas de reescritura generativa, devuelve para cada span del texto original dos lecturas: una lectura de superficie (para furigana/ruby) y una lectura fonética (para síntesis de voz). El modelo está especializado en homógrafos heterónimos (同形異音語), palabras cuya lectura cambia según el contexto, como 人気, 上手 o 明日, para las que un diccionario estático no puede decidir.

Se construye sobre `sbintuitions/modernbert-ja-130m`, un encoder ModernBERT japonés de 132,5 millones de parámetros, y se distribuye con pesos en safetensors y una exportación ONNX FP32 (opset 17). El repositorio incluye la implementación de referencia en PyTorch y ONNX, además de los ficheros `inference_config.json` y `pron_map.json` necesarios para funcionar de forma autónoma.

Su relevancia radica en que cubre un hueco concreto en pipelines japoneses de TTS y furigana: la desambiguación de lecturas dependiente de contexto con un modelo pequeño (130M), ejecutable en CPU con una latencia media de 17,9 ms por frase, y con un catálogo de 135 palabras y 289 lecturas. En la evaluación sellada sobre 5.000 frases reales de Aozora Bunko alcanza una precisión por frase de 0,9354, frente a 0,9308 de Sudachi Mode C y 0,9276 de UniDic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `sbintuitions/modernbert-ja-130m`) |
| Parametros totales | 132.556.074 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX); no se incluye versión INT8 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 17) |
| Tarea | token-classification (etiquetado por span) |
| Modelo base | sbintuitions/modernbert-ja-130m (MIT) |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT japonés de 130M de parámetros adaptado a una cabeza de etiquetado de tokens. En lugar de generar texto, clasifica cada posición del span de entrada y devuelve cuatro columnas: posición del span, superficie, lectura de superficie (para ruby) y lectura fonética (para TTS). La salida se apoya en un catálogo de 135 palabras homógrafas con 289 lecturas posibles y en un mapa de conversión fonética (`pron_map.json`), ambos empaquetados junto al modelo.

Los datos de entrenamiento se construyeron exclusivamente con materiales de licencia compatible: textos de Aozora Bunko libres de derechos, no traducidos y en shinjitai/kyūjitai moderno; el corpus CC0 ROHAN4600; y frases sintéticas generadas con Qwen3 (Apache 2.0) y verificadas de forma inversa con otro modelo. Las lecturas correctas se validaron íntegramente contra SudachiDict (Apache 2.0) y UniDic (licencia BSD modificada). Se excluyeron deliberadamente JMdict, Wikipedia y BCCWJ por incompatibilidad de licencia. La separación entre entrenamiento y test se hizo a nivel de obra para evitar filtración.

El autor documenta un compromiso de diseño: la versión de producción equilibra el rendimiento en texto general, lo que reduce ligeramente la precisión en homógrafos frente a una versión piloto entrenada solo una época (0,7520 en el conjunto de homógrafos frente al resultado de la versión final). No se especifica el número total de tokens de entrenamiento.

## Capacidades

- Etiquetado de lecturas (yomi) por span sobre texto japonés, con salida separada de lectura de superficie y lectura fonética.
- Desambiguación contextual de homógrafos heterónimos (135 palabras, 289 lecturas) que los diccionarios estáticos no resuelven.
- Generación de furigana/ruby alineado con las posiciones originales del texto.
- Preparación de texto para síntesis de voz mediante la lectura fonética.
- Inferencia en CPU con implementación de referencia en PyTorch y ONNX.
- Funcionamiento autónomo en staging: no requiere servicios externos ni diccionarios en tiempo de inferencia.
- No cubre lecturas de nombres propios de persona (excluido explícitamente por el autor).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento (es un encoder de clasificación, no un modelo generativo).

## Casos de uso

- Anotación de furigana en publicaciones digitales: el modelo devuelve la lectura de superficie por span, lo que permite insertar etiquetas ruby alineadas con el texto original sin reescribirlo, algo crítico en edición de libros y prensa japonesa.
- Preprocesado para TTS japonés: la lectura fonética resuelve casos como 明日 (あす/あした) o 人気 (にんき/ひとけ) según contexto, mejorando la naturalidad de la síntesis frente a un diccionario de conversión grafema-fonema estático.
- Subtitulado y doblaje automatizado: al procesar guiones con contexto completo por frase, reduce errores de pronunciación en homógrafos frecuentes antes de enviar el texto al motor de voz.
- Enseñanza de japonés como lengua extranjera: generación de material de lectura con furigana automático y lectura fonética para aprendices, con la ventaja de que el modelo no reescribe el texto original.
- Normalización de corpus para búsqueda y recuperación: convertir variantes de lectura en una forma fonética canónica para indexación o búsqueda por voz en catálogos de bibliotecas y archivos digitales.
- Accesibilidad: lectura en voz alta de documentos japoneses en lectores de pantalla, donde la latencia de 17,9 ms por frase en CPU permite procesamiento en tiempo real sin GPU.
- Integración en pipelines de datos a gran escala: al ser un modelo de 130M con exportación ONNX, puede ejecutarse en lotes sobre servidores sin acelerador dedicado para anotar corpus completos.

## Benchmarks y rendimiento

Evaluación sellada del autor sobre 5.000 frases reales de Aozora Bunko (separación por obra, evaluación única final), precisión de lectura por frase:

| Sistema | Precisión por frase |
|---|---|
| ja-reading-tagger-v1 | 0,9354 |
| Sudachi Mode C (diccionario) | 0,9308 |
| UniDic (diccionario) | 0,9276 |

Conjunto específico de homógrafos heterónimos (1.000 frases):

| Sistema | Precisión por frase | Precisión por palabra |
|---|---|---|
| ja-reading-tagger-v1 | 0,7230 | 0,7767 |
| Sudachi | 0,5570 | 0,6136 |

Desglose adicional reportado por el autor:

| Subconjunto | ja-reading-tagger-v1 | Sudachi |
|---|---|---|
| Solo texto real de la evaluación sellada | 0,9360 | 0,9432 |
| Frases sintéticas con homógrafos contextuales | 0,9187 | 0,5563 |

Rendimiento de inferencia: ONNX FP32 (opset 17) coincide exactamente con PyTorch en 200 casos de dev y 200 del conjunto sellado; latencia media en CPU de 17,9 ms por frase (i7-11700F, incluyendo tokenización y conversión fonética).

## Requisitos de hardware

- VRAM estimada: el modelo de 132,5M de parámetros en FP32 ocupa aproximadamente 0,5 GB de pesos; la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente para FP32. Para lotes grandes, una RTX 4090 o A100 aportan margen amplio.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: implementación de referencia PyTorch y ONNX Runtime incluidas en el repo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un encoder de clasificación).
- Latencia: 17,9 ms por frase en CPU (i7-11700F); no se publica throughput en GPU.
- No se incluye versión cuantizada INT8, aunque la exportación ONNX facilitaría su generación con herramientas estándar.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión homógrafos (frase) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ja-reading-tagger-v1 | Encoder token-classification | 132,5M | no disponible | 0,7230 | Apache 2.0 | Hugging Face, ONNX |
| Sudachi Mode C | Analizador morfológico con diccionario | no disponible | no disponible | 0,5570 | Apache 2.0 (SudachiDict) | Biblioteca Java/Python |
| UniDic | Diccionario morfológico | no disponible | no disponible | no disponible en el conjunto de homógrafos | BSD modificada | Biblioteca y diccionario |

La comparación con Sudachi y UniDic es la única disponible en la información proporcionada; no se han publicado comparaciones con otros modelos neuronales de lectura japonesa.

## Limitaciones y advertencias

- No cubre lecturas de nombres propios de persona; el autor lo excluye explícitamente del alcance.
- En texto real de la evaluación sellada, Sudachi supera ligeramente al modelo (0,9432 frente a 0,9360); la ventaja se concentra en homógrafos contextuales y frases sintéticas.
- La precisión en el conjunto específico de homógrafos es de 0,7230 por frase, lo que implica un error aproximado de una de cada cuatro frases en ese dominio difícil.
- El catálogo de homógrafos está limitado a 135 palabras y 289 lecturas; palabras fuera del catálogo no se benefician de la desambiguación contextual.
- No se especifica la longitud máxima de contexto; frases muy largas podrían truncarse según la configuración del tokenizador del modelo base.
- Riesgo de alucinación bajo en sentido generativo (no genera texto), pero puede asignar lecturas incorrectas en contextos ambiguos o dominios no representados en el entrenamiento.
- Sesgos potenciales derivados del corpus: predominio de literatura de Aozora Bunko (registro literario y clásico moderno) y de frases sintéticas generadas por Qwen3, lo que puede reducir el rendimiento en lenguaje coloquial, técnico o de redes sociales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `sbintuitions/modernbert-ja-130m` es MIT; conviene verificar el cumplimiento de ambas al redistribuir.
- No se incluye versión INT8; quien necesite menor huella deberá cuantizar la exportación ONNX por su cuenta y validar la degradación.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-reading-tagger-v1
- Página de presentación del autor: https://jpopendata.jp/models/ja-reading-tagger-v1/
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
