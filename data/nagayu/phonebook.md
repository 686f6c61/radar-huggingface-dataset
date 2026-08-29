# NagaYu/phonebook

## Resumen

Phonebook es un modelo de secuencia a secuencia a nivel de caracteres, desarrollado por NagaYu (Yuta Nagao), especializado en convertir nombres corporativos japoneses (por ejemplo, «株式会社◯◯») en sus lecturas fonéticas en katakana. Con aproximadamente 17 millones de parámetros, está diseñado para ejecutarse en CPU y resuelve un problema concreto: la lectura de nombres de empresas que no han sido vistos durante el entrenamiento, donde los sistemas G2P tradicionales fallan. Su relevancia radica en que combina un mecanismo de copia, decodificación restringida al conjunto de caracteres katakana, calibración de confianza y una opción de rechazo, lo que lo hace útil para tareas de normalización y búsqueda por pronunciación en entornos con recursos limitados.

El modelo está entrenado sobre un corpus sintético generado por el propio autor, con una advertencia explícita de que no es un modelo de producción, sino una implementación de referencia para validar el pipeline completo. La arquitectura es un Transformer a nivel de caracteres con puntero-generador, y el contexto de entrada se limita a secuencias cortas de nombres, aunque no se especifica una longitud máxima concreta. Está disponible en formatos GGUF, ONNX y MLX, y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracteres con mecanismo de copia (pointer-generator) |
| Parametros totales | 16.873.345 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (secuencias cortas de nombres, sin límite publicado) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 (estructura de bloques real, pero no ejecutable con llama.cpp) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, ONNX, MLX (npz) |

## Arquitectura y entrenamiento

Phonebook emplea un diseño modular en tres etapas. Primero, un `StructuralSplitter` elimina la forma legal (prefijos, sufijos, paréntesis, nombres de tiendas) mediante reglas y asigna una lectura determinista a esa parte, de modo que el modelo solo procesa el núcleo del nombre comercial. Segundo, un `CharSeq2Seq` con mecanismo de copia (pointer-generator) transcribe el núcleo; los tramos que ya están en katakana o hiragana se copian de forma determinista, lo que convierte la copia en una garantía estructural y no en un comportamiento aprendido. Tercero, la decodificación está restringida al vocabulario de katakana de ancho completo, la marca de alargamiento y el token EOS, de manera que el conjunto de salida es una propiedad del espacio de búsqueda y no puede violarse ni con pesos no entrenados.

El entrenamiento se realizó sobre un corpus sintético generado con `scripts/make_synthetic.py`, que sirve para validar el pipeline sin depender de la descarga masiva de datos de la Agencia Tributaria Nacional de Japón (NTA). El autor advierte explícitamente que los pesos publicados son una implementación de referencia, no un modelo de producción, y que para obtener rendimiento real es necesario descargar los datos de la NTA y reentrenar. No se especifican el número de tokens, la composición del dataset ni el uso de RLHF o DPO; la calibración se realiza mediante Platt scaling y el rechazo se basa en un umbral de confianza.

## Capacidades

- Generacion de lecturas katakana para nombres corporativos japoneses, incluyendo nombres no vistos durante el entrenamiento.
- Mecanismo de copia que transcribe de forma determinista los tramos en kana presentes en la entrada.
- Decodificacion restringida al conjunto de caracteres katakana, lo que garantiza que la salida siempre sea fonéticamente válida.
- Calibracion de confianza mediante Platt scaling, con opcion de rechazo (respuesta «unknown») por debajo de un umbral.
- Generacion de n-best con probabilidades asociadas, util para casos ambiguos.
- Exportacion a GGUF, ONNX y MLX, lo que permite integracion en multiples entornos de ejecucion.
- No soporta tool calling, agentes, vision ni audio; es un modelo puramente de texto a texto.

## Casos de uso

- Normalizacion de nombres de empresas en bases de datos CRM: el modelo puede convertir nombres corporativos a su lectura katakana estandar, facilitando la deduplicacion y la busqueda por pronunciacion en sistemas de gestion de clientes.
- Busqueda por pronunciacion en directorios telefonicos: integrado en una aplicacion de consulta, permite encontrar empresas escribiendo su lectura fonetica en lugar del nombre kanji, con soporte de n-best para variantes.
- Sistemas de sintesis de voz (TTS): antes de generar audio, se puede usar Phonebook para obtener la lectura correcta de nombres de empresas, evitando errores de pronunciacion en anuncios o asistentes de voz.
- Enriquecimiento de datos para indexacion: en pipelines de datos, el modelo anade la lectura katakana a registros de empresas, mejorando la busqueda por texto libre y la compatibilidad con sistemas de busqueda japoneses.
- Atencion al cliente automatizada: en chatbots o IVR, el modelo ayuda a leer en voz alta nombres de empresas mencionados por el usuario, con la opcion de rechazo para evitar respuestas incorrectas cuando la confianza es baja.
- Validacion de pipelines G2P: dado su diseno modular y su bajo coste computacional, sirve como referencia para comparar otros sistemas de conversion grafema-fonema en entornos de desarrollo.

## Benchmarks y rendimiento

Los resultados publicados se obtuvieron sobre el corpus sintetico (ver advertencia en la model card). La metrica principal es el exact match con normalizacion de vocales largas, comparado con pyopenjtalk y MeCab+UniDic. Las condiciones de evaluacion son: (1) entidad conocida, (2) entidad no vista, (3) dificil (subconjunto de no vista con bigramas kanji ausentes en entrenamiento) y (4) ambigua (misma superficie, lecturas diferentes).

| Condicion | pyopenjtalk | MeCab+UniDic | Phonebook fp32 | Phonebook Q4_K_M |
|---|---:|---:|---:|---:|
| (1) conocida | 0.532 | 0.470 | 0.947 | 0.947 |
| (2) no vista | 0.533 | 0.470 | 0.648 | 0.649 |
| (3) dificil | 0.521 | 0.443 | 0.642 | 0.645 |
| (4) ambigua | 0.295 | 0.240 | 0.081 | 0.083 |

El CER (character error rate) de Phonebook es 0.004 / 0.027 / 0.027 / 0.120 frente a 0.144 / 0.140 / 0.143 / 0.185 de pyopenjtalk. La calibracion (ECE) es 0.019 en entidades conocidas, 0.274 en no vistas y 0.786 en ambiguas. La cuantizacion Q4_K_M no degrada el rendimiento (diferencia maxima de ±0.003) y reduce los pesos a 10.8 MB. La latencia en CPU es de aproximadamente 54 ms por item con beam size 8 y sin cache KV.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo tiene 17M de parametros y en Q4_K_M ocupa 10.8 MB, por lo que cabe en cualquier maquina moderna.
- VRAM estimada: no requiere VRAM; puede ejecutarse en RAM convencional. Con safetensors en fp32, el peso es de unos 67 MB (16.8M parametros × 4 bytes), asumible en cualquier sistema.
- GPU recomendadas: no es necesaria ninguna GPU; si se desea acelerar, cualquier GPU con soporte ONNX o MLX sirve, pero no aporta una ventaja significativa dado el tamano.
- Opciones de despliegue: libreria `phonebook` (Python y CLI), ONNX Runtime, MLX (Apple Silicon). No es compatible con llama.cpp, vLLM ni TGI debido a la arquitectura personalizada.
- Latencia y throughput: ~54 ms por item en CPU (beam 8, sin cache KV), lo que permite procesar cientos de nombres por segundo en un solo nucleo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Exact match (no vista) | Licencia |
|---|---|---|---|---:|---|
| Phonebook | Seq2Seq char-level con copia | 16.9M | G2P especifico para nombres corporativos | 0.648 (fp32) | Apache-2.0 |
| pyopenjtalk | G2P basado en reglas y diccionarios | No disponible | G2P general para japones | 0.533 | MIT (aprox.) |
| MeCab+UniDic | Analizador morfologico + diccionario | No disponible | G2P general via analisis morfologico | 0.470 | BSD (aprox.) |

Phonebook supera claramente a los sistemas tradicionales en entidades conocidas y no vistas, aunque su rendimiento cae en casos ambiguos. La comparacion con LLMs grandes no se incluye porque no se proporcionan datos cuantitativos en la informacion disponible.

## Limitaciones y advertencias

- El checkpoint publicado esta entrenado con datos sinteticos y no es un modelo de produccion; el autor recomienda reentrenar con datos reales de la NTA para uso real.
- El modelo esta especializado en nombres corporativos; la lectura de nombres personales no es su objetivo y solo se aborda como experimento de transferencia con LoRA.
- En casos ambiguos (misma superficie, diferentes lecturas, como 日本 = ニホン / ニッポン) no existe una respuesta unica; se recomienda usar n-best y confianza en lugar de top-1.
- La calibracion es deficiente en entidades no vistas y ambiguas (ECE 0.274 y 0.786 respectivamente); el umbral de rechazo debe ajustarse a la distribucion de despliegue.
- Los archivos GGUF tienen estructura real de bloques Q4_K/Q6_K/Q8_0, pero no son ejecutables con llama.cpp; solo sirven para distribucion e inspeccion.
- No se proporcionan datos sobre sesgos especificos, pero al estar entrenado con datos sinteticos, puede no reflejar la diversidad real de nombres corporativos japoneses.
- Riesgo de alucinacion en nombres no vistos: aunque el mecanismo de copia y la decodificacion restringida limitan errores, la tasa de exact match en no vistas es del 64.8%, por lo que un 35% de las salidas pueden ser incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/phonebook
- Repositorio de codigo, generador de dataset y evaluacion: https://github.com/NagaYu/phonebook
- Perfil del autor en Hugging Face: https://huggingface.co/NagaYu
- Perfil del autor en GitHub: https://github.com/NagaYu
