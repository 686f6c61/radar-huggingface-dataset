# GadiGG/traductor-escom

## Resumen

Cuatro Voces es un modelo de traducción automática neuronal muchos-a-muchos afinado por GadiGG a partir de `facebook/m2m100_418M`. Cubre las doce direcciones posibles entre alemán, inglés, español y rumano, y está pensado para traducción directa sin pasar por el inglés como pivote. El modelo resuelve un problema acotado: obtener traducciones de calidad razonable entre cuatro lenguas europeas con un único checkpoint de menos de 500 millones de parámetros, desplegable en hardware modesto.

Técnicamente es un transformer encoder-decoder de la familia M2M-100, con 483.905.536 parámetros reales según los pesos en safetensors (algo más que los 418M nominales del modelo base, por el vocabulario multilingüe). El contexto efectivo de entrenamiento se limita a 96 subpalabras, lo que lo sitúa en el terreno de la traducción de frases y párrafos cortos, no de documentos largos.

Su relevancia actual es la de un modelo especializado y ligero: frente a alternativas generativas grandes, ofrece un pipeline de traducción determinista, con API de `transformers` estándar y licencia MIT, lo que facilita su integración en flujos internos de localización, preprocesado de corpus o sistemas de traducción de bajo coste. El autor no publica cifras de calidad en la model card, de modo que la evaluación queda pendiente de los CSV de BLEU y chrF que el propio proyecto genera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100, `M2M100ForConditionalGeneration`) |
| Parametros totales | 483.905.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 subpalabras (longitud máxima de entrenamiento); límite posicional del modelo base no declarado en la ficha |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | de, en, es, ro |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de M2M-100: un transformer encoder-decoder con atención multi-cabeza estándar y token de idioma forzado en el decoder (`forced_bos_token_id`) para seleccionar la lengua de destino. El vocabulario es multilingüe y compartido, propio del modelo base. No hay innovaciones de atención (ni atención lineal, ni decodificación especulativa, ni mezcla de expertos); el interés está en el ajuste fino supervisado sobre el checkpoint preentrenado de Meta.

El entrenamiento se realizó con pares de TED2020 y Europarl extraídos de OPUS: 12 direcciones equilibradas, 15.000 ejemplos por dirección (180.000 en total), 2 épocas, lote efectivo 32, longitud máxima de 96 subpalabras y validación multi-paralela separada del conjunto de entrenamiento. Se usó Transformers 5.21.0. Los conteos exactos, la semilla y las versiones quedan registrados en `metadata_entrenamiento.json` junto a los pesos. No se documenta en la información disponible el uso de RLHF, DPO ni preferencias humanas; se trata de aprendizaje supervisado clásico sobre corpus paralelos.

## Capacidades

- Traducción directa muchos-a-muchos entre las doce direcciones de de, en, es y ro, sin pivote por inglés.
- Generación de texto condicionada por idioma de origen y destino mediante `src_lang` y `forced_bos_token_id`.
- Manejo de frases y párrafos cortos (hasta 96 subpalabras por segmento).
- Interfaz estándar de `transformers` (`M2M100Tokenizer`, `M2M100ForConditionalGeneration`), compatible con endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo thinking: no disponibles.
- Capacidades multilingües limitadas a las cuatro lenguas declaradas; el vocabulario base cubre más idiomas, pero el ajuste fino solo se validó para de, en, es y ro.

## Casos de uso

- Localización de documentación técnica entre español, inglés, alemán y rumano: el modelo traduce segmentos cortos de manuales y fichas de producto con una única llamada por segmento, lo que simplifica el pipeline frente a soluciones con pivote.
- Preprocesado de corpus multilingües: normalización y alineación de textos de investigación (por ejemplo, actas parlamentarias o transcripciones TED) antes de análisis posteriores, aprovechando que el modelo se entrenó precisamente con Europarl y TED2020.
- Traducción de subtítulos y transcripciones: los segmentos de subtitulado suelen encajar en la ventana de 96 subpalabras, y el modelo puede procesar lotes con `max_new_tokens` acotado para mantener latencia baja.
- Atención al cliente en varios idiomas: traducción de mensajes entrantes de usuario a español para su revisión por agentes humanos, con un modelo ligero que cabe en GPU de consumo y no requiere servicios externos.
- Generación de borradores de correo y comunicaciones internas: traducción de plantillas y respuestas frecuentes entre las cuatro lenguas, con revisión humana obligatoria antes del envío.
- Investigación en traducción automática de bajo recurso: el repositorio de código incluye preparación de datos, evaluación BLEU/chrF y pruebas, lo que lo convierte en una base reproducible para experimentos de ajuste fino con corpus OPUS.
- Sistemas de traducción embebidos o de borde: con menos de 500 millones de parámetros y pesos safetensors, es viable en entornos con recursos limitados donde un modelo generativo grande no es opción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el proyecto calcula BLEU y chrF sobre 2.000 oraciones multi-paralelas para las 12 direcciones y 24 recorridos de cuatro saltos, pero no declara cifras hasta que se publiquen los CSV y `metadata_evaluacion.json` de la revisión correspondiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB de pesos más overhead de activaciones; en la práctica, unos 3-4 GB con lotes pequeños.
- En fp16/bf16: alrededor de 1 GB de pesos, con 2-3 GB totales incluyendo activaciones.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, A10, L4). En A100/H100 funciona sin problema, aunque está sobredimensionado para este modelo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs integradas o CPU para inferencia por lotes pequeños, con latencia mayor.
- Opciones de despliegue: `transformers` (referencia), endpoints compatibles, TGI y vLLM para servir por lotes; llama.cpp/Ollama solo si se convierte a GGUF, conversión no documentada en la información disponible.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GadiGG/traductor-escom | 483.905.536 | 96 subpalabras (entrenamiento) | de, en, es, ro | MIT | Hugging Face, 51 descargas |
| facebook/m2m100_418M | 418M nominales | 1024 tokens (modelo base) | 100 idiomas | MIT | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt (pares) | ~77M por par | ~512 tokens | dos idiomas por modelo | CC-BY-4.0 (varía) | Hugging Face, un modelo por dirección |
| facebook/nllb-200-distilled-600M | 600M | 1024 tokens | 200 idiomas | CC-BY-NC-4.0 | Hugging Face, uso no comercial |

Frente al modelo base, este ajuste gana especialización en cuatro lenguas a costa de cobertura idiomática. Frente a los modelos OPUS-MT por pares, ofrece una sola descarga para doce direcciones, pero con más parámetros por inferencia. Frente a NLLB-200 destilado, la licencia MIT es la ventaja principal, ya que NLLB restringe el uso comercial.

## Limitaciones y advertencias

- Puede producir errores, omisiones y traducciones demasiado literales, según reconoce la propia model card.
- BLEU y chrF no garantizan equivalencia semántica; la calidad real por dirección no está publicada.
- TED2020 y Europarl no representan todos los registros ni variedades de cada idioma: el dominio de entrenamiento es formal y parlamentario, con posible sesgo hacia ese estilo.
- Textos médicos, legales o de alto impacto requieren revisión humana obligatoria.
- Ventana de 96 subpalabras: los documentos largos deben segmentarse, con riesgo de perder coherencia entre segmentos.
- Solo se validaron cuatro idiomas; usar otras lenguas del vocabulario base no está respaldado por el ajuste.
- Licencia MIT para pesos y arquitectura, pero los corpus OPUS conservan sus condiciones y atribuciones originales, que deben respetarse al redistribuir datos derivados.
- Riesgo de alucinación en traducción: el modelo puede generar contenido no presente en el original, especialmente con entradas ambiguas o fuera de dominio.
- No se documentan sesgos específicos medidos; la ausencia de evaluación de sesgos es en sí una advertencia para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GadiGG/traductor-escom
- Repositorio de código del proyecto: https://github.com/Gad-gg-23/Traductor
- Modelo base: https://huggingface.co/facebook/m2m100_418M
- Corpus OPUS: https://opus.nlpl.eu/
- Paper de M2M-100: https://arxiv.org/abs/2010.11125
