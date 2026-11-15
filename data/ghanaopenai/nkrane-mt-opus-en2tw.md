# ghanaopenai/nkrane-mt-opus-en2tw

## Resumen

nkrane-mt-opus-en2tw es un modelo de traducción automática neuronal inglés → twi asante (akan) desarrollado por GhanaOpenAI dentro de su pipeline Nkrane-MT. Se trata de un fine-tuning del modelo Marian Seq2Seq Helsinki-NLP/opus-mt-en-tw, reentrenado sobre el corpus paralelo Nkrane-MT, que contiene 769.594 pares de frases inglés-twi. El modelo resuelve el problema de la baja disponibilidad de traducción de calidad para lenguas akan, un idioma de Ghana con recursos limitados en el ecosistema NLP.

La innovación principal es el uso de preservación de entidades mediante corchetes bilaterales (dual-sided entity bracket preservation): el modelo conserva las entidades nombradas en inglés entre corchetes durante la generación, y un paso posterior del pipeline (diccionario offline y reranker) las sustituye por su forma natural en twi. Este enfoque híbrido eleva la métrica SacreBLEU de 24,63 (generación cruda) a 29,72 (salida final sustituida), una ganancia de 5,09 puntos.

Con 73,38 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a producción en entornos con recursos limitados. La licencia Apache 2.0 facilita su integración comercial, y su naturaleza seq2seq lo hace desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian Seq2Seq (transformer encoder-decoder) |
| Parametros totales | 73.380.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), tw (twi asante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Marian Seq2Seq LM, heredada de Helsinki-NLP/opus-mt-en-tw, un transformer encoder-decoder estándar para traducción automática. El fine-tuning se realizó sobre el corpus Nkrane-MT Parallel Corpus, con 763.594 pares de entrenamiento (de los 769.594 totales), en precisión bfloat16 con TF32 sobre una GPU NVIDIA H200. Se usó batch size de 32 por dispositivo con 2 pasos de acumulación de gradiente (batch efectivo de 64), learning rate de 1e-4 con AdamW y warmup lineal. El checkpoint seleccionado fue el paso 122.000 (época 10,22), elegido por puntuación compuesta óptima.

La innovación técnica destacable es la preservación de entidades mediante corchetes bilaterales: durante el entrenamiento, las entidades nombradas en inglés se marcan con corchetes para que el modelo aprenda a conservarlas, y en inferencia un pipeline externo (diccionario offline y reranker) las sustituye por su equivalente en twi. No se documenta el uso de RLHF ni DPO; el entrenamiento es supervisado sobre pares paralelos.

## Capacidades

- Traducción automática inglés → twi asante (dirección única en2tw).
- Preservación de entidades nombradas en inglés mediante corchetes, resueltas después por el pipeline Nkrane-MT.
- Generación de texto seq2seq con decodificación estándar de transformer.
- Integración con el paquete `nkrane_mt` para inferencia con marcado de entidades y reranker.
- Soporte de dos idiomas: inglés (entrada) y twi asante (salida).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción de documentación oficial y administrativa al twi asante: el modelo puede traducir textos institucionales donde las entidades (nombres de organismos, lugares) deben preservarse y resolverse correctamente mediante el pipeline de sustitución.
- Localización de contenido web y aplicaciones móviles para usuarios de Ghana: con 73 millones de parámetros, se puede desplegar en servidores modestos para traducir interfaces y textos de ayuda al twi con latencia baja.
- Atención al cliente en lenguas locales: integrado en un chatbot o sistema de tickets, permite responder en twi asante a consultas formuladas en inglés, ampliando la cobertura lingüística en servicios públicos y financieros.
- Traducción de noticias y comunicados de prensa: el corpus de entrenamiento de 769.594 pares y la preservación de entidades facilitan la traducción de textos periodísticos con nombres propios y topónimos.
- Subtitulado y transcripción multilingüe: el modelo puede traducir subtítulos en inglés a twi para medios audiovisuales dirigidos a audiencias akan.
- Investigación en NLP de bajos recursos: sirve como baseline reproducible y punto de partida para fine-tuning en otras lenguas akan o para experimentos de preservación de entidades en traducción.
- Generación de material educativo bilingüe: traducción de currículos y materiales escolares del inglés al twi para programas de educación bilingüe en Ghana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor (sustituido, salida final) | Valor (crudo, generación con corchetes) |
|---|---|---|
| SacreBLEU | 29,72 | 24,63 |
| chrF2 | 50,34 | 46,95 |
| Evaluation loss | 1,551 | no disponible |

Dataset de evaluación: nkrane-mt-parallel-corpus-eng-twi (split de test reservado). La ganancia de +5,09 BLEU entre la generación cruda y la sustituida refleja el efecto del diccionario offline y el reranker del pipeline.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 73 millones de parámetros, en fp32 ocupa aproximadamente 0,3 GB de pesos; en bfloat16, unos 0,15 GB. La VRAM total necesaria es inferior a 1 GB en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado en NVIDIA H200, pero para inferencia basta una GTX 1650, RTX 3060, T4 o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en Raspberry Pi con suficiente RAM para CPU.
- Opciones de despliegue: transformers (PyTorch), el paquete `nkrane_mt` del autor, y potencialmente llama.cpp u ONNX Runtime si se convierten los pesos (no documentado oficialmente).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU en2tw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nkrane-mt-opus-en2tw | 73,38 M | no disponible | 29,72 (sustituido) | Apache 2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-tw | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| NLLB-200 (variante twi) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| M2M-100 (variante twi) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de resultados de benchmarks comparables publicados para los modelos alternativos en la información proporcionada; la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus específico de Ghana, puede reflejar sesgos de dominio y registro de ese corpus.
- Riesgo de alucinación: como todo modelo seq2seq, puede generar traducciones plausibles pero incorrectas, especialmente en entidades no vistas o en frases largas y complejas.
- Limitaciones de contexto o idioma: solo soporta la dirección inglés → twi asante; no se documenta la longitud máxima de secuencia, y no cubre otras variantes del twi ni otras lenguas akan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (Helsinki-NLP/opus-mt-en-tw) y del corpus de entrenamiento antes de producción.
- Caveat de producción: los benchmarks son declarados por el autor y no verificados de forma independiente; la métrica de 29,72 BLEU depende del pipeline completo (diccionario y reranker), no solo del modelo.
- El modelo requiere el pipeline `nkrane_mt` y el modelo marcador `nkrane-mt-marker-en` para alcanzar el rendimiento reportado; usarlo de forma aislada degrada la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghanaopenai/nkrane-mt-opus-en2tw
- Dataset Nkrane-MT Parallel Corpus: https://huggingface.co/datasets/ghanaopenai/nkrane-mt-parallel-corpus-eng-twi
- Repositorio del pipeline Nkrane-MT: https://github.com/GhanaOpenAI/nkrane-mt
- Organización GhanaOpenAI: https://github.com/GhanaOpenAI
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-tw
