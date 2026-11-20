# arkanit/badini-nllb-translator

## Resumen

Badini NLLB Translator es un modelo de traduccion automatica neuronal (NMT) especializado en kurdo badini (bahdini), un dialecto del kurdo del norte escrito en alfabeto arabe. Lo desarrolla Arkan Musa Zubair (usuario `arkanit`), y parte de un ajuste fino de `facebook/nllb-200-distilled-600M` cuyos pesos LoRA se han fusionado en un modelo completo independiente, de modo que funciona directamente con `transformers` sin necesidad de la libreria `peft`.

El modelo aborda problemas linguisticos especificos del badini que los sistemas NMT genericos suelen resolver mal: la concordancia de genero mediante el izafet (`-a` / `-ê`), la alineacion ergativa en pasado transitivo y la produccion de frases naturales en lugar de transliteraciones. Es bidireccional entre ingles (`eng_Latn`) y badini (`ckb_Arab`), con 615.073.792 parametros y un repositorio de 1,3 GB en formato safetensors.

Su relevancia actual radica en cubrir un par de lenguas de bajos recursos con un modelo pequeno, desplegable en hardware modesto y con licencia MIT, lo que facilita su integracion en aplicaciones de traduccion para comunidades kurdas. No obstante, la evaluacion publicada por el autor es limitada y debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), derivada de NLLB-200 distilled |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 usa segmentos de hasta 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion via herramientas externas) |
| Idiomas soportados | kurdo badini (`ckb_Arab`), ingles (`eng_Latn`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo seq2seq, heredado de `facebook/nllb-200-distilled-600M`, con 615 millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA orientado a la traduccion ingles-badini y badini-ingles; posteriormente los adaptadores se fusionaron en los pesos base, dando lugar a un checkpoint autonomo que no requiere `peft` en inferencia.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor afirma que el ajuste se dirigio explicitamente a tres fenomenos gramaticales del badini: la concordancia de genero e izafet, la ergatividad en pasado transitivo y la naturalidad fraseologica frente a transliteraciones. No se publican detalles sobre el corpus paralelo utilizado ni sobre el proceso de filtrado.

## Capacidades

- Traduccion bidireccional ingles-badini kurdo (`eng_Latn` ↔ `ckb_Arab`).
- Manejo de concordancia de genero e izafet en la direccion ingles-badini.
- Alineacion ergativa en oraciones transitivas en pasado.
- Generacion de texto seq2seq mediante `AutoModelForSeq2SeqLM` y `generate()`.
- Control explicito del idioma destino mediante `forced_bos_token_id`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Traduccion de documentacion administrativa para comunidades kurdas: el modelo traduce comunicados y formularios del ingles al badini, con atencion a la concordancia de genero que suele fallar en traductores genericos.
- Subtitulado y localizacion de contenido audiovisual: integrado en un pipeline que segmenta subtitulos en frases cortas y llama al modelo por segmento, aprovechando su bajo coste computacional.
- Atencion al cliente en badini: traduccion en tiempo real de mensajes entrantes al ingles para que un operador que no habla kurdo pueda responder, y traduccion inversa de la respuesta.
- Preservacion linguistica y corpus digitales: generacion de pares paralelos ingles-badini para alimentar diccionarios y materiales educativos, dado el escaso volumen de datos disponibles en este dialecto.
- Traduccion de contenido web y redes sociales: despliegue en un servicio ligero (por ejemplo, una API FastAPI con `transformers`) para traducir publicaciones y comentarios.
- Investigacion en NMT de bajos recursos: punto de partida para experimentos de ajuste fino adicional o comparacion de tecnicas de adaptacion en lenguas minoritarias.
- Traduccion inversa badini-ingles para analisis de opiniones: procesar reseñas o encuestas escritas en badini y convertirlas al ingles para su analisis automatico.

## Benchmarks y rendimiento

La model card publica la siguiente tabla, generada por el propio autor. No se especifican el conjunto de evaluacion, el tamano de la muestra ni la metrica empleada, por lo que los valores no son verificables de forma independiente.

| Direccion de traduccion | Precision | Calidad linguistica |
|---|---|---|
| Ingles → badini kurdo | 100,0 % | Fluidez nativa, izafet y genero correctos |
| Badini kurdo → ingles | 100,0 % | Contextualmente precisa y estructurada |
| Consistencia global | 100,0 % | Fraseologia natural |

No se han publicado resultados en benchmarks estandar (FLORES-200, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,5 GB solo para pesos, mas memoria para activaciones y cache; en la practica, unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,3-1,5 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,7-0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU para inferencia por frases.
- Opciones de despliegue: `transformers` (referencia), vLLM (soporte seq2seq limitado, verificar compatibilidad), TGI (soporte de modelos encoder-decoder limitado), llama.cpp/Ollama (no soportan arquitectura m2m_100 de forma nativa; requeriria conversion a GGUF con soporte especifico).
- Latencia y throughput: no disponibles; por el tamano del modelo se espera inferencia de decenas de milisegundos por frase en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkanit/badini-nllb-translator | 615 M | no disponible | badini, ingles | MIT | Hugging Face |
| facebook/nllb-200-distilled-600M | 615 M | 512 tokens (segmento) | 200 idiomas | CC-BY-NC-4.0 | Hugging Face |
| facebook/m2m100_418M | 418 M | 1024 tokens | 100 idiomas | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-tc-big-en-ku | no disponible | no disponible | ingles, kurdo | CC-BY-4.0 | Hugging Face |

Frente a NLLB-200 distilled, este modelo anade especializacion en badini a costa de perder cobertura multilingue (solo dos idiomas) y mejora la licencia (MIT frente a CC-BY-NC). Frente a M2M-100, es algo mayor pero mas especifico. No hay datos de rendimiento comparativo publicados que permitan afirmar superioridad en FLORES u otros conjuntos estandar.

## Limitaciones y advertencias

- La evaluacion del 100 % de precision procede del propio autor y no especifica conjunto de prueba ni metrica; no debe tomarse como evidencia de calidad en produccion.
- El modelo solo cubre badini e ingles; no traduce a kurmanji estandar ni a sorani en otras variantes fuera del codigo `ckb_Arab`.
- No se documenta el corpus de entrenamiento, lo que impide evaluar sesgos o cobertura de dominios (legal, medico, tecnico).
- Riesgo de alucinacion y de traducciones gramaticalmente plausibles pero semanticamente incorrectas en frases largas o ambiguas.
- La longitud de contexto efectiva no esta declarada; NLLB-200 esta entrenado por segmentos, por lo que textos largos deben dividirse.
- El uso del codigo `ckb_Arab` para badini puede inducir confusion con el sorani, que tambien usa ese codigo en NLLB; el autor afirma haberlo corregido, pero no hay validacion externa.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base NLLB-200 (CC-BY-NC-4.0) para determinar si las obligaciones de no uso comercial se heredan en la practica; el autor no aborda esta cuestion.
- No hay garantias de mantenimiento ni soporte; el repositorio tiene una unica actualizacion registrada y muy pocos likes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkanit/badini-nllb-translator
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Web del autor: https://tavbit.com
- Instagram del autor: https://instagram.com/arkan_it
- Correo de contacto: iarkanit@gmail.com
