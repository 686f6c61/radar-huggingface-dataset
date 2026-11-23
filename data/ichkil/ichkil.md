# ichkil/ichkil

## Resumen

Ichkil es un modelo compacto especializado en **tashkeel** (diacritización del árabe), la tarea de asignar a cada letra de una frase árabe sin vocales su conjunto completo de diacríticos (harakat, shadda, tanwin y sus combinaciones). Desarrollado por el autor homónimo ichkil y publicado en Hugging Face bajo licencia MIT, resuelve un problema clásico del procesamiento del lenguaje natural árabe: la ambigüedad de lectura de texto no vocalizado, que afecta a síntesis de voz, traducción automática y enseñanza del idioma.

La versión actual (v0.3) tiene **5,56 millones de parámetros** y se distribuye como un único archivo ONNX de **22,3 MB** en fp32, ejecutable en CPU, móvil o navegador de forma totalmente offline. La arquitectura combina una GRU bidireccional de 3 capas con 2 bloques de self-attention y 8 expertos MLP con gating, un diseño híbrido poco habitual para una tarea de etiquetado a nivel de carácter.

Su relevancia reside en la combinación de tamaño mínimo, precisión competitiva (DER del 2,14 % en WikiNews MSA y 2,32 % en Fadel clásico) y despliegue sin GPU. Incluye además librerías cliente en Python, JavaScript/TypeScript y Go, y pesos PyTorch (`ichkil.pt`) para ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiGRU de 3 capas con conexión residual + 2 bloques de self-attention + banco de 8 expertos MLP con gating + clasificador de 16 vías |
| Parametros totales | 5,56 M (5.6M) |
| Parametros activos | no disponible (no es MoE; los expertos MLP con gating no se reportan como parámetros activos separados) |
| Longitud de contexto | 1–1024 caracteres por llamada (texto más largo debe dividirse en límites de frase) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, batch × longitud dinámicos) y checkpoint PyTorch (`ichkil.pt`) |

Otras especificaciones relevantes: vocabulario de 175 símbolos (`<pad>`=0, `<unk>`=1), 16 etiquetas de salida por carácter, tamaño del repo de 0,1 GB.

## Arquitectura y entrenamiento

El modelo realiza etiquetado a nivel de carácter, con **una etiqueta por carácter y sin búsqueda de decodificación**. La entrada se normaliza primero (NFC, variantes de letras, caracteres de ancho cero, tatweel y diacríticos existentes eliminados), se embebe en 320 dimensiones sin embedding posicional y se codifica mediante una **GRU bidireccional de 3 capas** con conexión residual. A continuación, **2 bloques de self-attention** dan a cada carácter acceso directo a toda la frase, algo necesario para resolver las terminaciones de caso; sus ramas residuales arrancan en cero (LayerScale), lo que permitió inicializar v0.3 a partir del modelo solo-GRU sin perder rendimiento. Después sigue un banco de **8 expertos MLP con gating** y un clasificador de 16 vías.

Los cambios de v0.3 respecto a v0.1 son sustanciales: se pasa de 13 a 16 clases de salida (añadiendo shadda + tanwin `ـًّ ـٌّ ـٍّ`), de 42 a 175 símbolos de vocabulario (dígitos, latín, puntuación árabe y ASCII), de 1,3M a 5,6M parámetros, y se incorpora entrenamiento alineado a frases (con o sin puntuación final) frente a cortes arbitrarios de texto. Los datos de entrenamiento incluyen Wikipedia, noticias, corpus de árabe estándar moderno (MSA) y 3.000 nombres propios; no se documentan en la información disponible el número total de tokens, la composición exacta del dataset ni si se empleó RLHF o DPO. Los conjuntos de evaluación se excluyen del entrenamiento mediante un filtro de solapamiento de 8-gramas.

## Capacidades

- Diacritización completa de texto árabe no vocalizado: harakat, shadda, tanwin y combinaciones, con una etiqueta por carácter.
- Manejo de árabe clásico, árabe estándar moderno (MSA), noticias y nombres propios, incluidos nombres extranjeros y préstamos (por ejemplo, «زار ماكرون واشنطن» → «زَارَ مَاكْرُونُ وَاشِنْطُنَ»).
- Alineación a frases: procesa entradas con o sin puntuación final, con entrenamiento específico para terminaciones de frase.
- Vocabulario ampliado de 175 símbolos que cubre dígitos, caracteres latinos y puntuación árabe y ASCII.
- Inferencia determinista sin búsqueda de decodificación, lo que simplifica el pipeline y reduce latencia.
- Ejecución en CPU, móvil y navegador de forma offline (ONNX Runtime).
- Librerías cliente oficiales en Python 3.9+, JavaScript/TypeScript (Node 18+ y navegador) y Go 1.21+.
- Pesos PyTorch (`ichkil.pt`) para ajuste fino con el repositorio fuente.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es un modelo de etiquetado de secuencias, no un modelo generativo.

## Casos de uso

- **Síntesis de voz en árabe (TTS)**: la diacritización previa es imprescindible para una pronunciación correcta; Ichkil puede vocalizar el texto de entrada en CPU antes de pasarlo al motor TTS, con un DER del 2,14 % en MSA de noticias.
- **Traducción automática árabe→otros idiomas**: restaurar los diacríticos reduce la ambigüedad léxica y gramatical del texto fuente, mejorando la calidad de la traducción en sistemas que consumen árabe no vocalizado.
- **Enseñanza del árabe y materiales didácticos**: generación automática de textos vocalizados para libros de texto, ejercicios o aplicaciones de aprendizaje, incluida la vocalización de nombres propios y préstamos.
- **Procesamiento de noticias y corpus MSA**: normalización de grandes volúmenes de texto periodístico (el benchmark WikiNews reporta 2,14 % DER) en pipelines por lotes sin necesidad de GPU.
- **Aplicaciones web y móviles offline**: el modelo de 22 MB en ONNX puede integrarse en el navegador o en una app móvil mediante la librería JS, sin enviar texto a un servidor y con privacidad total.
- **Preprocesamiento para pipelines de NLP árabe**: paso previo a análisis morfológico, etiquetado POS, reconocimiento de entidades o búsqueda, donde la vocalización desambigua formas homógrafas.
- **Ajuste fino para dominios específicos**: los pesos PyTorch permiten reentrenar sobre corpus propios (por ejemplo, terminología jurídica o médica) partiendo de un modelo de 5,6M parámetros, viable en hardware modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`). Conjuntos de test separados del entrenamiento mediante filtro de solapamiento de 8-gramas. DER = diacritic error rate; WER = word error rate; *final-word error* = proporción de muestras cuya última palabra es incorrecta.

| Conjunto de test | DER | DER (sin caso) | WER | Error en palabra final |
|---|---|---|---|---|
| Fadel et al. (2019), árabe clásico, 2.500 frases | 2,32 % | 2,11 % | 7,74 % | 11,8 % |
| WikiNews (MSA), 146 textos de noticias | 2,14 % | 1,48 % | 8,59 % | 11,6 % |
| SadeedDiac-25 MSA, 454 textos modernos | 3,08 % | 2,24 % | 11,04 % | 9,9 % |

Comparación con v0.1 bajo el mismo protocolo: Fadel 3,06 % / WikiNews 11,08 % / MSA 10,68 % DER; error en palabra final 21 % / 66 % / 54 %. Bajo el protocolo original de v0.1 (caracteres desconocidos eliminados antes de la inferencia), v0.1 obtiene 2,65 % en Fadel frente a 2,37 % de v0.3, manteniendo una pequeña ventaja dentro de palabras (2,01 % frente a 2,13 %).

Benchmark dirigido de 124 frases vocalizadas manualmente en 11 categorías de error (shadda + tanwin, terminaciones de caso, sujetos al inicio de frase, frases cortas, nombres árabes y extranjeros, préstamos, verbos, dígitos/latín, palabras aisladas, frases largas de noticias): **2,4 % DER para v0.3 frente a 13,0 % para v0.1**.

El artefacto ONNX obtiene resultados idénticos al modelo PyTorch de referencia sobre el conjunto Fadel completo (DER 2,3252 % en ambos), por lo que las cifras se mantienen en cualquier runtime.

## Requisitos de hardware

- **VRAM estimada**: prácticamente nula; el modelo es de 5,56M parámetros y 22,3 MB en fp32, por lo que cabe en memoria RAM/CPU convencional y en la memoria de cualquier GPU consumer.
- **GPU recomendadas**: innecesarias. Funciona en CPU; cualquier GPU (RTX 4090, A100, H100) puede ejecutarlo pero no aporta ventaja significativa frente a CPU para este tamaño.
- **Consumer GPU**: cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- **Opciones de despliegue**: ONNX Runtime (formato nativo), librería Python `ichkil` (PyPI), librería JS/TS `ichkil` (npm, Node 18+ y navegador), librería Go `ichkil-go`; pesos PyTorch (`ichkil.pt`) para ajuste fino. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de etiquetado de secuencias.
- **Latencia y throughput**: no disponibles en la información proporcionada. El diseño (una etiqueta por carácter, sin búsqueda de decodificación, entradas de hasta 1.024 caracteres) apunta a inferencia de baja latencia en CPU, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos alternativos de diacritización árabe (parámetros, contexto, rendimiento o licencia) para establecer una comparativa fiable. La model card únicamente compara Ichkil v0.3 con su propia versión anterior v0.1.

| Modelo | Parametros | Contexto | DER (Fadel) | Licencia | Formato |
|---|---|---|---|---|---|
| Ichkil v0.3 | 5,56 M | 1–1024 caracteres | 2,32 % | MIT | ONNX + PyTorch |
| Ichkil v0.1 | 1,3 M | no disponible | 3,06 % (protocolo v0.3) / 2,65 % (protocolo v0.1) | MIT | ONNX |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma único**: solo soporta árabe (`ar`); no está entrenado para otros idiomas ni para transliteración.
- **Tarea acotada**: es un modelo de etiquetado de secuencias, no generativo; no realiza traducción, resumen, código ni razonamiento, y no dispone de tool calling ni capacidades de agente.
- **Longitud de entrada**: probado entre 1 y 1.024 caracteres por llamada; textos más largos deben dividirse en límites de frase, lo que puede afectar a la coherencia en terminaciones de frase si el corte es incorrecto.
- **Riesgo de error en terminaciones de caso**: el error en palabra final se sitúa entre el 9,9 % y el 11,8 % según el conjunto, superior al DER global; para usos que dependen críticamente de la vocalización final (por ejemplo, recitación o enseñanza avanzada) conviene validación humana.
- **Rendimiento inferior en MSA moderno**: el DER sube al 3,08 % en SadeedDiac-25 MSA frente al 2,14 % en WikiNews, lo que sugiere mayor dificultad con nombres y préstamos en texto moderno.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; al entrenar sobre Wikipedia, noticias y corpus MSA, puede heredar sesgos de esas fuentes, especialmente en el tratamiento de nombres propios.
- **Alucinación**: no aplica en el sentido generativo, pero el modelo puede asignar diacríticos incorrectos de forma silenciosa (errores de etiqueta) sin mecanismo de confianza o abstención documentado.
- **Licencia MIT**: permite uso comercial y modificación con atribución y conservación del aviso de copyright; no se especifican restricciones adicionales.
- **Verificación de benchmarks**: los resultados del model-index están marcados como `verified: false`; conviene reproducirlos en el dominio de despliegue antes de comprometerse con umbrales de calidad.
- **Cuantización**: no se documentan variantes cuantizadas ni INT8; el artefacto publicado es fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ichkil/ichkil
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/ichkil/ichkil-demo
- Librería Python (PyPI): https://pypi.org/project/ichkil/
- Repositorio Python: https://github.com/Ichkil/ichkil-python
- Librería JS/TS (npm): https://www.npmjs.com/package/ichkil
- Repositorio JS/TS: https://github.com/Ichkil/ichkil-js
- Librería Go (pkg.go.dev): https://pkg.go.dev/github.com/Ichkil/ichkil-go
- Repositorio Go: https://github.com/Ichkil/ichkil-go
