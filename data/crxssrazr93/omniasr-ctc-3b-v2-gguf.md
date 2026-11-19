# crxssrazr93/omniASR-CTC-3B-v2-GGUF

## Resumen

omniASR-CTC-3B-v2-GGUF es una conversión a formato GGUF del modelo Omnilingual ASR CTC 3B v2 de Meta, publicada por el usuario crxssrazr93. Se trata de un sistema de reconocimiento automático del habla (ASR) basado en una arquitectura tipo Wav2Vec2 con cabecera CTC, con 3.081.400.880 parámetros totales, orientado a transcripción multilingüe. La conversión surge de la ausencia de builds GGUF preconstruidos para la variante de 3B, por lo que el autor realizó la conversión y cuantización de forma local.

El modelo se distribuye únicamente en cuantización Q4_K (2,08 GB), y según el autor un build Q8_0 obtuvo la misma precisión, motivo por el cual no se publicó. Está pensado para ejecutarse con el runtime CrispASR, no con llama.cpp ni Ollama, ya que se trata de un modelo de audio y no de un LLM generativo. Su relevancia radica en ofrecer transcripción multilingüe (incluyendo lenguas con pocos recursos como tamil o cingalés) en hardware de consumo: aproximadamente 2,6 GB de VRAM y unos 0,4 s por fragmento de 5 segundos en una RTX 3060.

La licencia es Apache 2.0, heredada de los pesos originales de Meta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (layout `Wav2Vec2ForCTC`) |
| Parametros totales | 3.081.400.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa fragmentos, el autor cita chunks de 5 s) |
| Tipos de cuantizacion | Q4_K (publicada); Q8_0 probada internamente sin mejora de precision |
| Idiomas soportados | multilingue (evaluado en ingles, tamil y cingales; modelo "omnilingual") |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico fichero `omniasr-ctc-3b-v2-q4_k.gguf`, 2,08 GB) |

## Arquitectura y entrenamiento

El modelo base es Omnilingual ASR CTC 3B v2 de Meta, con arquitectura Wav2Vec2 (encoder convolucional de extraccion de caracteristicas mas transformer de contexto) y cabecera de clasificacion CTC para alineamiento secuencia-a-secuencia sin necesidad de decodificacion autorregresiva. La conversion a GGUF se realizo a partir del repositorio `iljab/omniASR-CTC-3B-v2` (12,3 GB), que emplea el layout `Wav2Vec2ForCTC` compatible con el conversor de CrispASR; el layout `hf-audio` de Meta no es convertible segun el autor.

El proceso de construccion consistio en: descarga del modelo original, conversion a F16 mediante el script `models/convert-omniasr-ctc-to-gguf.py` de CrispASR (parcheado para calcular directamente la norma de pesos de la convolucion posicional con `torch._weight_norm`, con pico de RAM de unos 16 GB) y cuantizacion a Q4_K con `crispasr-quantize`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) multilingue.
- Decodificacion CTC no autorregresiva, lo que permite inferencia rapida y por fragmentos.
- Transcripcion sin indicacion previa de idioma (no language hint) en las pruebas del autor.
- Soporte de scripts no latinos, incluidos tamil y cingales, con limitaciones conocidas.
- Integracion con modelo de puntuacion externo (`--punc-model pcs`).
- No soporta tool calling, function calling, agentes, vision ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en multiples idiomas: el modelo procesa fragmentos cortos (5 s en ~0,4 s en RTX 3060) y puede encadenarse para audio largo, con la ventaja de no requerir indicacion de idioma.
- Subtitulado automatico de video multilingue: la decodificacion CTC y el bajo coste por fragmento permiten generar subtitulos en tiempo casi real en una GPU de consumo.
- Servicio de transcripcion en red local: el autor lo integra en `openwhispr-remote`, que enruta cada fragmento a este modelo en una GPU de LAN y solo el ingles a Cohere, lo que ilustra un patron de despliegue hibrido.
- Dictado por voz en escritorio: con 2,6 GB de VRAM cabe junto a otras cargas en una RTX 3060, lo que permite dictado continuo sin depender de la nube.
- Investigacion en lenguas de bajos recursos: permite evaluar ASR en tamil, cingales y otras lenguas con un modelo de 3B ejecutable en hardware asequible.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la cuantizacion Q4_K reduce el coste de almacenamiento y permite desplegar muchas instancias en una sola GPU.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (conjuntos estilo FLEURS, 25 clips por idioma, sin indicacion de idioma):

| Idioma | Metrica | Q4_K |
|---|---|---|
| Ingles | WER | ~2,8 % |
| Tamil | CER | 13,6 % |
| Cingales | CER | 26,0 % |

El autor indica que un build Q8_0 obtuvo la misma puntuacion, por lo que solo se publico Q4_K. No se han publicado resultados comparativos con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6 GB en Q4_K segun el autor.
- GPU recomendada por el autor: RTX 3060 (0,4 s por fragmento de 5 s).
- Cabe en GPUs de consumo con al menos ~3 GB de VRAM libres; no se dispone de datos para otras GPU.
- Despliegue: runtime CrispASR (`crispasr --server -m ... --punc-model pcs`). No es compatible con llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: ~0,4 s por chunk de 5 s en RTX 3060; throughput no disponible.
- Espacio en disco: 2,08 GB para el fichero GGUF.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se situa en la categoria de ASR multilingue de ~3B parametros con decodificacion CTC, pero no se han publicado comparaciones con Whisper, MMS u otros sistemas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| omniASR-CTC-3B-v2-GGUF | 3,08 B | no disponible | Apache 2.0 | GGUF Q4_K | WER 2,8 % (en), CER 13,6 % (ta), 26,0 % (si) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Deriva entre scripts indicos relacionados a mitad de frase (por ejemplo, tamil escrito con letras malayalam); presente en todas las precisiones. El autor recomienda remapear las letras por desplazamiento de bloque Unicode tras la decodificacion, ya que enmascarar scripts convierte la letra erronea en un blank CTC y elimina el sonido.
- Insercion ocasional de digitos dentro de palabras.
- El modelo de puntuacion por defecto dan los scripts no latinos (tamil y otros); es obligatorio usar `--punc-model pcs`.
- El CER en cingales (26,0 %) es notablemente alto, lo que limita su uso en produccion para esa lengua sin revision humana.
- No se han publicado evaluaciones en el resto de idiomas del modelo "omnilingual"; la cobertura real es desconocida.
- Riesgo de alucinacion y errores en audio con ruido, acentos o solapamiento de hablantes no cuantificado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de Meta y el autor no detalla condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria independiente.
- Dependencia del runtime CrispASR; no es desplegable en stacks estandar de LLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crxssrazr93/omniASR-CTC-3B-v2-GGUF
- Modelo base: https://huggingface.co/iljab/omniASR-CTC-3B-v2
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto openwhispr-remote: https://github.com/crxssrazr93/openwhispr-remote
