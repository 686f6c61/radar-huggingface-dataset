# agbalu/Amrouche-1.3B

## Resumen
Amrouche-1.3B es un modelo de traducción automática especializado en cabilio (taqbaylit, código `kab`), una lengua bereber del norte de Argelia considerada de bajos recursos. Lo desarrolla el usuario agbalu y parte de `facebook/nllb-200-distilled-1.3B`, sobre el que se ha hecho un ajuste fino con 544.729 pares paralelos de autoría humana procedentes del corpus AƔBALU, excluyendo los pares minados automáticamente por NLLB. El modelo cubre las direcciones kab↔eng y kab↔fra.

La relevancia del modelo está en la asimetría de sus mejoras: la generación de cabilio es la mitad no resuelta del problema, y es precisamente donde el ajuste fino aporta más (eng→kab gana 4,81 puntos de chrF++ y un 40,3% de BLEU respecto a la base). Además, el autor reporta que la brecha ortográfica frente a la referencia se cierra a cero, lo que indica que el modelo produce cabilio con ortografía canónica.

Técnicamente es un transformer encoder-decoder de 1.161.745.408 parámetros con la arquitectura `M2M100ForConditionalGeneration`, 24 capas en encoder y decoder, dimensión oculta de 1.024 y 16 cabezas de atención. La innovación principal es una poda del vocabulario de 256.206 a 52.209 tokens, lo que obliga a remapear identificadores en la inferencia mediante la tabla `keep.json` incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (`M2M100ForConditionalGeneration`), 24 capas encoder / 24 decoder, hidden 1.024, feed-forward 8.192 con ReLU, 16 cabezas por bloque, posiciones sinusoidales con máximo 1.024 |
| Parametros totales | 1.161.745.408 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 posiciones (límite posicional de la arquitectura); `max_length=256` en el ejemplo de generación de la model card |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo contiene safetensors en el formato original) |
| Idiomas soportados | cabilio (`kab`), inglés (`eng`) y francés (`fra`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,7 GB) |

## Arquitectura y entrenamiento
El modelo reutiliza íntegramente la arquitectura del NLLB-200 distilled 1.3B: un transformer encoder-decoder con atención multi-cabeza estándar, embeddings de posición sinusoidales de 1.024 posiciones y una dimensión de feed-forward de 8.192. La única modificación estructural es la matriz de embeddings: se recorta el vocabulario de 256.206 a 52.209 tokens, los que efectivamente aparecen en el corpus de ajuste fino. Los embeddings de entrada y la proyección de salida permanecen atados (tied). Los tokens especiales (ids 0–49, incluidos `<s>`, `<pad>`, `</s>` y `<unk>`) conservan sus identificadores originales, y los códigos de idioma de NLLB (`kab_Latn`, `eng_Latn`, `fra_Latn`) sobreviven al recorte.

El ajuste fino se realizó sobre 544.729 pares paralelos de autoría humana del corpus AƔBALU, filtrando todo lo que NLLB ya había minado por su cuenta. La model card no detalla hiperparámetros de entrenamiento, número de tokens vistos, ni si hubo etapas de RLHF o DPO; no hay información disponible sobre esos puntos. El autor sí documenta un trabajo de reparación ortográfica a nivel de corpus, cuyos efectos se reflejan en la salida del modelo: al normalizar tanto la hipótesis como la referencia, la diferencia de puntuación cae a cero en las direcciones hacia cabilio.

## Capacidades
- Traducción bidireccional entre cabilio e inglés (`kab↔eng`) y entre cabilio y francés (`kab↔fra`), cuatro direcciones en total.
- Generación de cabilio con ortografía canónica: la brecha frente a la referencia normalizada es 0,00 en eng→kab y fra→kab, frente a +0,17 y +0,19 en el modelo base.
- Traducción pivote: para idiomas distintos de inglés y francés, la model card recomienda usar NLLB estándar para `X→eng` y este modelo para `eng→kab`, la dirección con mayor ganancia.
- Decodificación por búsqueda en haz (el ejemplo usa `num_beams=4`) con `max_length` configurable.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo seq2seq puro de traducción.
- No tiene capacidades de visión ni de audio.
- El vocabulario recortado implica que cualquier token fuera de los 52.209 del corpus se mapea a `<unk>`; la cobertura léxica está acotada por el corpus de ajuste.

## Casos de uso
- Traducción de documentación técnica al cabilio: el modelo puede verter manuales y guías del inglés o el francés al cabilio con ortografía normalizada, lo que reduce el trabajo de revisión posterior y evita las variantes ortográficas inconsistentes que produce el modelo base.
- Localización de interfaces y textos de producto: para cadenas cortas y frases de UI, la ventana de 1.024 posiciones es más que suficiente y la ganancia de +4,81 chrF++ en eng→kab se traduce en menos correcciones manuales por cadena.
- Subtitulado y traducción de contenido audiovisual: el modelo procesa segmentos de hasta 256 tokens de salida, adecuado para líneas de subtítulo, y la dirección kab→eng (46,25 chrF++) sirve para llevar contenido en cabilio a audiencias anglófonas.
- Preservación y difusión de contenido cultural: digitalización de textos en cabilio con traducción al francés (kab→fra, 45,10 chrF++) para archivos, museos y publicaciones bilingües.
- Traducción pivote en pipelines multilingües: integrado como segundo salto (`eng→kab`) detrás de un NLLB completo, permite cubrir pares como español→cabilio o árabe→cabilio sin entrenar cada par por separado.
- Investigación en lenguas de bajos recursos: sirve como punto de partida o línea base reproducible para experimentos de ajuste fino en bereber, con licencia Apache 2.0 y pesos safetensors de acceso libre.
- Atención al ciudadano en regiones kabylófonas: traducción de comunicaciones administrativas del francés al cabilio, siempre con revisión humana dado que el autor desaconseja el uso en contextos legales o médicos.

## Benchmarks y rendimiento
Resultados declarados por el autor sobre FLORES+ devtest con referencia `kab_Latn` corregida ortográficamente, mismo arnés para todas las filas. Los valores de BLEU y chrF++ no están verificados de forma independiente (`verified: false`).

| Direccion | chrF++ base → Amrouche | BLEU base → Amrouche |
|---|---|---|
| kab→eng | 44,60 → 46,25 (+1,65) | 23,06 → 25,29 (+2,23) |
| eng→kab | 31,53 → 36,34 (+4,81) | 7,74 → 10,86 (+40,3%) |
| kab→fra | 42,00 → 45,10 (+3,10) | 19,46 → 22,10 (+2,64) |
| fra→kab | 30,21 → 34,43 (+4,22) | 6,33 → 8,39 (+32,5%) |

El autor señala que el 10,86 de BLEU en eng→kab supera el 6,2 publicado por NLLB para cabilio, y que su arnés reproduce ese 6,02 sobre el modelo de 600M, lo que calibra la comparación. También reporta que la brecha por normalización ortográfica pasa de +0,17 a 0,00 en eng→kab y de +0,19 a 0,00 en fra→kab.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 4,6 GB solo para pesos (1,16 mil millones de parámetros × 4 bytes), más activaciones y caché de atención; en la práctica, unos 6–8 GB.
- En fp16/bf16: alrededor de 2,3 GB de pesos, con un total práctico de 3–4 GB.
- En cuantización de 8 bits: en torno a 1,2 GB de pesos; en 4 bits, unos 0,6 GB. El autor no publica variantes GGUF ni cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070) es suficiente en fp16. Para despliegue en producción con concurrencia, A100 o H100 aportan margen de sobra, aunque el modelo es pequeño para ese hardware.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: `transformers` con PyTorch es la vía documentada. vLLM, TGI, llama.cpp y Ollama no están documentados por el autor; llama.cpp y Ollama requerirían conversión a GGUF, y vLLM/TGI requerirían adaptar el remapeo de vocabulario, ya que la poda de embeddings rompe la carga estándar.
- Latencia y throughput: no disponibles. El ejemplo oficial usa `num_beams=4`, lo que multiplica el coste frente a decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Amrouche-1.3B | 1.161.745.408 | 1.024 posiciones | kab, eng, fra | Apache 2.0 | Vocabulario recortado a 52.209; requiere `keep.json` |
| facebook/nllb-200-distilled-1.3B | 1.300 millones (aprox.) | 1.024 posiciones | 200 idiomas | CC-BY-NC 4.0 | Modelo base; licencia no comercial, a diferencia de Amrouche |
| facebook/nllb-200-distilled-600M | 600 millones (aprox.) | 1.024 posiciones | 200 idiomas | CC-BY-NC 4.0 | El autor lo usa para calibrar el arnés (6,02 BLEU en eng→kab) |
| NLLB-200 1.3B original en eng→kab | 1.300 millones (aprox.) | 1.024 posiciones | 200 idiomas | CC-BY-NC 4.0 | 31,53 chrF++ y 7,74 BLEU en el arnés del autor |

La diferencia clave frente a la familia NLLB es la licencia: Amrouche-1.3B es Apache 2.0, lo que permite uso comercial, mientras que los pesos de NLLB-200 se distribuyen bajo CC-BY-NC 4.0. A cambio, Amrouche solo cubre tres idiomas y exige el remapeo de vocabulario.

## Limitaciones y advertencias
- No es adecuado para kab→X cuando X no es inglés ni francés: la capacidad del modelo base sobrevive pero no mejora, y la model card recomienda pivotar vía kab→eng, la dirección más fuerte.
- El autor desaconseja explícitamente su uso en traducción de seguridad crítica, legal o médica.
- No se ha realizado ninguna evaluación de adecuación (adequacy) por anotadores humanos, ni sobre el corpus de entrenamiento ni sobre las salidas del modelo.
- El vocabulario recortado obliga a traducir identificadores en cuatro puntos (input_ids de origen, token de idioma forzado, ids generados de vuelta y el propio `unk`); un uso que gestione solo tres devuelve texto fluido en el idioma equivocado.
- Los tokens fuera de los 52.209 del vocabulario recortado se mapean a `<unk>`, lo que puede degradar la traducción de terminología especializada o préstamos no vistos.
- Riesgo de alucinación y de omisiones en textos largos: es un modelo seq2seq de traducción, sin mecanismos de verificación; la ventana de 1.024 posiciones limita documentos extensos.
- Sesgos: no se documentan análisis de sesgo de género, dialectales ni de variedad dentro del cabilio; el corpus AƔBALU puede sobrerrepresentar ciertas variedades o registros.
- La referencia FLORES+ `kab_Latn` está corrompida en un 16,2% por homóglifos y nunca se revisó aguas arriba, de modo que las métricas publicadas dependen del tratamiento de normalización aplicado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y los términos del corpus AƔBALU si se redistribuyen derivados.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/agbalu/Amrouche-1.3B
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Tabla de remapeo de vocabulario (`keep.json`): https://huggingface.co/agbalu/Amrouche-1.3B/blob/main/keep.json
- Paper de NLLB-200 (No Language Left Behind): no disponible en la información proporcionada
- Repositorio del corpus AƔBALU: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
