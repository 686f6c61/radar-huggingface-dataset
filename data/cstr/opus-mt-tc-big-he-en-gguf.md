# cstr/opus-mt-tc-big-he-en-GGUF

## Resumen

El modelo `cstr/opus-mt-tc-big-he-en-GGUF` es una conversión al formato GGUF (ggml) del checkpoint `Helsinki-NLP/opus-mt-tc-big-he-en`, un sistema de traducción automática neuronal especializado en el par hebreo → inglés. Lo publica el usuario `cstr` como parte del ecosistema de CrispASR, un proyecto de reconocimiento y traducción de voz en tiempo real que utiliza el backend `marian` para la traducción. No es un modelo entrenado desde cero: es una conversión de formato sobre los pesos originales del proyecto OPUS-MT de la Universidad de Helsinki, liberados bajo licencia CC-BY-4.0.

Arquitectura y tamaño: se trata de un transformer encoder-decoder de tipo MarianMT, con 6 capas de encoder y 6 de decoder, dimensión de modelo d=1024 y aproximadamente 245 millones de parámetros totales (240.230.253 según el recuento real del repositorio). Corresponde a la variante `big` del release `opusTCv20210807+bt_transformer-big_2022-03-13`.

Su relevancia práctica es doble. Por un lado, ofrece un traductor hebreo-inglés de alta calidad con un peso reducido (265 MB en cuantización q8_0, 488 MB en f16), lo que permite ejecutarlo en CPU o en GPUs de gama baja. Por otro, al estar integrado en CrispASR, cubre el caso de uso de transcripción y traducción simultáneas en directo (`--live-translate`), donde la latencia importa más que la flexibilidad multilingüe de modelos mucho mayores como NLLB-200.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), 6 capas de encoder + 6 de decoder, d=1024 |
| Parámetros totales | 240.230.253 (~240M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | f16 y q8_0 |
| Idiomas soportados | Hebreo (he) como origen, inglés (en) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml) |
| Tamaño de los ficheros | f16: 488 MB; q8_0: 265 MB |
| Direccionalidad | Un modelo por dirección; la inversa es `cstr/opus-mt-en-he-GGUF` |
| Runtime previsto | CrispStrobe/CrispASR con `--backend marian` |

## Arquitectura y entrenamiento

El modelo subyacente es un MarianMT, la implementación de transformer encoder-decoder desarrollada por el proyecto OPUS-MT (Jörg Tiedemann y Santhosh Thottingal, Universidad de Helsinki). Sigue la arquitectura estándar de atención completa, sin mecanismos de atención lineal, MoE ni decodificación especulativa. La configuración concreta de esta variante es de 6 capas en el encoder y 6 en el decoder con dimensión oculta de 1024, lo que sitúa el total en torno a los 245 millones de parámetros.

El entrenamiento se realizó sobre datos paralelos del corpus OPUS (https://opus.nlpl.eu/) siguiendo el pipeline de OPUS-MT, y el checkpoint concreto distribuido es el release `opusTCv20210807+bt_transformer-big_2022-03-13`. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo una fase de ajuste por RLHF o DPO; en el pipeline de OPUS-MT lo habitual es entrenamiento supervisado sobre corpus paralelos filtrados, sin RLHF. Esta publicación concreta no reentrena nada: es una conversión de formato con los pesos sin cambios en f16 y una cuantización posterior a q8_0.

La innovación relevante aquí no está en el modelo, sino en la herramienta de conversión y en las comprobaciones de paridad incluidas. La model card reporta que, frente a `MarianMTModel.generate` de Hugging Face `transformers` sobre el checkpoint original, la salida greedy coincide en 8 de 8 frases y con beam 4 también en 8 de 8 para el fichero f16. Existe un script de conversión (`models/convert-marian-to-gguf.py`), una herramienta de cuantización (`crispasr-quantize`) y un verificador de paridad (`tools/marian_parity.py`).

## Capacidades

- Traducción de texto hebreo → inglés, en modo texto a texto.
- Decodificación greedy (forzada con `-bs 1`) o con el beam size propio del checkpoint si no se especifica.
- Integración en modo "live translate": entrada de micrófono, salida de transcripción más traducción frase a frase, siempre con decodificación greedy.
- Descarga automática del modelo cuantizado q8_0 en el primer uso mediante el atajo `-m opus-mt-he-en`.
- Ejecución en CPU gracias al formato GGUF y a los tamaños reducidos de los ficheros.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio de forma nativa; el reconocimiento de voz lo aporta otro modelo del pipeline (por ejemplo, un backend Parakeet) y este modelo solo traduce.
- Capacidad multilingüe limitada estrictamente al par hebreo-inglés.

## Casos de uso

- Traducción de documentos hebreos a inglés en pipelines por lotes: al ser un modelo de 240M de parámetros, puede procesar grandes volúmenes de texto en CPU sin coste de GPU, traduciendo ficheros completos frase a frase.
- Subtitulado y traducción en directo: mediante `crispasr --live-translate`, se encadena un reconocedor de voz compatible con hebreo con este modelo para producir transcripción y traducción simultáneas, un escenario donde el decodificado greedy reduce la latencia.
- Atención al cliente en hebreo con salida en inglés: se puede integrar el modelo como paso de traducción en un sistema de soporte que normalice las consultas entrantes al inglés antes de pasarlas a un LLM mayor, aprovechando su bajo coste por token.
- Preprocesado para búsqueda y análisis de contenido: traducir corpus hebreos (artículos, foros, tickets) al inglés para indexarlos en motores de búsqueda o herramientas de análisis que funcionan mejor en inglés.
- Traducción local o en el borde (edge): con solo 265 MB en q8_0, cabe en dispositivos con recursos limitados o entornos sin conectividad, útil para aplicaciones de privacidad donde no se quiere enviar texto a un servicio externo.
- Investigación en traducción automática de bajos recursos: sirve como baseline reproducible y ligero para comparar MarianMT big frente a modelos mayores (NLLB, M2M-100) en el par hebreo-inglés, y como referencia de paridad entre implementaciones (transformers vs. ggml).
- Traducción dentro de herramientas de transcripción de reuniones: en actas o notas de voz grabadas en hebreo, el modelo convierte el contenido a inglés para su distribución a equipos que no leen hebreo, trabajando sobre segmentos ya diarizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas tipo BLEU, MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros sistemas de traducción.

El único dato de rendimiento verificable aportado es la paridad con la implementación de referencia de Hugging Face `transformers`:

| Fichero | Tamaño | Salida frente a `MarianMTModel.generate` |
|---|---|---|
| `opus-mt-tc-big-he-en-f16.gguf` | 488 MB | 8/8 frases idénticas en greedy; 8/8 con beam 4 |
| `opus-mt-tc-big-he-en-q8_0.gguf` | 265 MB | 8/8 frases idénticas en greedy; el resto puede diferir en la redacción |

La comparación se hizo sobre 8 frases de prueba, y los identificadores de token de entrada coincidieron en 8/8 casos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El fichero f16 ocupa 488 MB y el q8_0, 265 MB; el consumo en memoria es del mismo orden, por lo que cualquier GPU con 1-2 GB libres es suficiente.
- Ejecución en CPU: viable y recomendada para uso por lotes, ya que el formato GGUF y el tamaño (~240M de parámetros) permiten inferencia en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100. La GPU no es un cuello de botella para este tamaño de modelo; el throughput vendrá limitado por el pipeline de reconocimiento de voz en el caso de uso en directo.
- Cabe holgadamente en GPUs de consumo: incluso en iGPU o en hardware embebido con varios cientos de MB de memoria disponible.
- Opciones de despliegue: CrispASR con `--backend marian` es el runtime documentado explícitamente. No se indica en la información proporcionada compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto; MarianMT no es una arquitectura soportada por esos motores de forma general.
- Latencia y throughput: no disponibles. La model card solo señala que estos traductores Marian son "los más rápidos" para transcripción y traducción en directo dentro de CrispASR, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| `cstr/opus-mt-tc-big-he-en-GGUF` | ~240M | No disponible | he → en | CC-BY-4.0 | GGUF (f16, q8_0) | Conversión cuantizada |
| `Helsinki-NLP/opus-mt-tc-big-he-en` | ~240M (mismo checkpoint) | No disponible | he → en | CC-BY-4.0 | PyTorch / safetensors | Modelo original |
| `cstr/opus-mt-en-he-GGUF` | No disponible | No disponible | en → he | CC-BY-4.0 | GGUF | Conversión de la dirección inversa |
| NLLB-200 o M2M-100 | No disponible en esta búsqueda | No disponible | Multilingüe | No disponible | No disponible | Alternativa multilingüe; sin datos verificados aquí |

La comparación más directa es contra el checkpoint original de Hugging Face: comparten pesos y licencia, y difieren solo en el formato y el tamaño (la conversión GGUF reduce el peso a 488 MB en f16 y 265 MB en q8_0, y habilita la ejecución en CPU con CrispASR). Para una alternativa multilingüe haría falta recurrir a modelos como NLLB-200, pero no se dispone de datos de rendimiento comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Un solo par de idiomas por modelo: solo hebreo como origen e inglés como destino. Para la dirección contraria hay que usar el modelo separado `cstr/opus-mt-en-he-GGUF`.
- Sesgos: no se documentan análisis de sesgo en la model card. Al estar entrenado sobre corpus OPUS, puede heredar sesgos de dominio, registro y representación de los textos paralelos disponibles.
- Riesgo de alucinación: como cualquier modelo de traducción neuronal, puede generar traducciones fluidas pero incorrectas, especialmente en entidades nombradas, terminología técnica o segmentos ambiguos. La paridad verificada con la implementación de referencia no garantiza corrección semántica, solo fidelidad al checkpoint original.
- Limitaciones de contexto: la model card no especifica la longitud máxima de secuencia soportada, por lo que no se puede confirmar el comportamiento en entradas largas. En el modo en directo, la traducción se hace frase a frase, lo que evita el problema de contexto pero impide aprovechar coherencia entre frases.
- Diferencia en el tratamiento de tokens especiales: las secuencias literales `</s>`, `<unk>` y `<pad>` en la entrada se tratan como texto normal en esta implementación, mientras que la referencia las interpreta como tokens especiales. Esto puede producir divergencias si el texto de entrada contiene esas cadenas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al proyecto OPUS-MT. La propia model card aclara que la declaración de licencia del proyecto OPUS-MT prevalece sobre la etiqueta del repositorio individual.
- Fidelidad de la cuantización: en q8_0 la coincidencia exacta con la referencia se verificó solo en modo greedy y sobre 8 frases; fuera de esas condiciones la redacción puede variar. El f16 mantiene mayor fidelidad con beam 4.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, con fecha de creación y actualización del 6 de octubre de 2026. Conviene auditar la conversión antes de usarla en producción.
- Dependencia de terceros: la ejecución documentada pasa por CrispStrobe/CrispASR, un proyecto externo; el soporte de este checkpoint GGUF en otros motores no está indicado.
- En el modo `--live-translate` el decodificado es siempre greedy y el reconocedor de voz empleado debe soportar hebreo, requisito que no cubre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/opus-mt-tc-big-he-en-GGUF
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-he-en
- Dirección inversa (en → he): https://huggingface.co/cstr/opus-mt-en-he-GGUF
- Repositorio de CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
