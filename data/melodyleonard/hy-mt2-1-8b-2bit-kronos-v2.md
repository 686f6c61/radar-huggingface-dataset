# melodyleonard/Hy-MT2-1.8B-2bit-kronos-v2

## Resumen

Hy-MT2-1.8B-2bit-kronos-v2 es un modelo de traducción automática cuantizado a 2 bits, desarrollado por el usuario melodyleonard y publicado en Hugging Face. Se construye a partir de tencent/Hy-MT2-1.8B-2Bit-GGUF, un derivado del modelo de traducción Hy-MT2 de Tencent, y se distribuye como el "pack de traducción global por defecto" dentro de la arquitectura denominada Kronos-2T Dual-Pack, pensada para ejecución en dispositivo (on-device) y empaquetada con compresión lzfse para descarga móvil.

El modelo aplica una poda quirúrgica del vocabulario (de 120.818 a 95.168 tokens, manteniendo el 78,8 %) y una destilación de conocimiento desde dos profesores: Hy-MT2-7B (destilación a nivel de secuencia) y Hy-MT2-1.8B (KL sobre los top-64 logits). El resultado es un artefacto de unos 470 MiB comprimidos que cubre 28 idiomas y se ejecuta con kernels Metal Q2c sobre Apple Silicon, con velocidades de entre 70 y 131 tokens por segundo en un M4 Pro.

La relevancia actual radica en su propuesta de traducción multilingüe de alta calidad en un tamaño inferior a 500 MB, apto para móviles y dispositivos con memoria unificada, con licencia Apache-2.0 y soporte de desambiguación conversacional mediante contexto. Es un caso de ingeniería de cuantización extrema (2 bits) combinada con destilación, más que un modelo base nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), derivado de Hy-MT2-1.8B; cuantización Q2c con lm_head NF4 |
| Parametros totales | 1.800 millones (modelo base Hy-MT2-1.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2c (2 bits por bloque de 512 con escalas calibradas), lm_head NF4 (tied), variante NF3-head disponible |
| Idiomas soportados | 28: en, zh, fr, pt, es, de, it, ru, ja, ko, ar, hi, vi, th, id, tr, nl, pl, cs, ro, sv, uk, el, he, fa, ur, bn, ms |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propietario Kronos `.k2tb` (comprimido con `.lzfse`); modelo base en GGUF |
| Tamano del repo | 1,0 GB |
| Tamano del pack | 470,89 MiB comprimido (479,12 MiB sin comprimir); variante NF3 de 448,76 MiB |
| Vocabulario | 95.168 tokens (BPE sin pérdida, podado desde 120.818) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Hy-MT2-1.8B de Tencent, especializada en traducción. Sobre ella se aplica una cuantización agresiva a 2 bits (Q2c) con escalas por bloque de 512 y calibración de RMSNorms en las capas 24 a 31 y en la normalización final. El vocabulario se poda de forma selectiva conservando el 100 % de las familias de escritura europeas, cirílicas, griegas, árabes, hebreas, índicas, del sudeste asiático, hangul coreano, kana japonés e ideogramas CJK de un solo carácter, con una biyección UTF-8 BPE verificada sin pérdida; se eliminan tokens de ortografía exclusivamente africana (servidos por otro pack), merges de código fuente y merges de frases CJK raras.

El entrenamiento combina tres señales: destilación a nivel de secuencia desde Hy-MT2-7B (objetivos nf4g128), destilación por KL sobre los top-64 logits de Hy-MT2-1.8B (nf5g128) y un SFT de desambiguación conversacional con pares libres de contaminación etiquetados como `[Background Information]`. Posteriormente se aplica una calibración Hadamard-GPTQ (sgc = 2) sobre el lm_head NF4. El artefacto se construye íntegramente en Rust y se ejecuta mediante kernels Metal Q2c con caché SRAM de 16 filas y un único barrera de sincronización, con decodificación beam-2 con compuerta de confianza, sobre memoria unificada vía mmap.

## Capacidades

- Traducción automática multilingüe en 28 idiomas, con especial énfasis en pares inglés → destino (inglés → portugués, francés, indonesio, alemán, tailandés, vietnamita, italiano, ruso, español, hindi, árabe, japonés, chino simplificado y tradicional, coreano).
- Desambiguación conversacional mediante contexto: el modelo aprovecha información de fondo (`[Background Information]`) para resolver género, formalidad y sentido léxico.
- Ejecución on-device con kernels Metal optimizados para Apple Silicon (M4 Pro documentado).
- Decodificación beam-2 con compuerta de confianza para mejorar la calidad frente a greedy.
- Soporte de empaquetado comprimido lzfse para distribución móvil.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción integrada en aplicaciones móviles: el pack de 470 MiB comprimido cabe en el almacenamiento de un teléfono y se ejecuta sin conexión gracias a los kernels Metal, lo que permite traducir texto en tiempo real en apps de mensajería o navegación.
- Traducción de documentación técnica en 28 idiomas: el modelo cubre escrituras europeas, cirílicas, árabes, índicas y CJK, lo que permite localizar manuales y guías con un único artefacto de menos de 500 MB.
- Atención al cliente multilingüe en el borde: con desambiguación por contexto conversacional (72,9 % con contexto frente a 39,3 % sin él en el conjunto de evaluación), puede resolver respuestas que dependen del género o la formalidad del interlocutor.
- Traducción de subtítulos y contenido audiovisual: la velocidad de 82-131 tok/s en M4 Pro permite generar subtítulos en tiempo casi real para vídeo corto.
- Procesamiento por lotes en servidores modestos: al ser un modelo de 1,8B en 2 bits, puede desplegarse en CPU o GPUs de gama baja para traducir grandes volúmenes de texto sin infraestructura dedicada.
- Traducción de correspondencia formal e informal: los conjuntos de evaluación incluyen casos de formalidad (formal 81 %, informal 100 %), lo que lo hace adecuado para correo empresarial y comunicación con clientes.
- Filtrado y normalización de texto multilingüe en pipelines de datos: la poda de vocabulario y el soporte de 28 escrituras permiten usarlo como paso de traducción en procesos ETL de contenido internacional.

## Benchmarks y rendimiento

Resultados en FLORES-200 `devtest` (inglés → destino, n = 50), según la model card:

| Idioma | chrF++ v2 | BLEU | Mejora vs v1 | Throughput M4 Pro Metal |
|---|---:|---:|---:|---:|
| Portugués (PT) | 68,1 | 46,5 | — | 95,9 tok/s |
| Francés (FR) | 66,6 | 44,9 | +1,6 | 84,3 tok/s |
| Indonesio (ID) | 65,3 | 40,3 | — | 83,2 tok/s |
| Alemán (DE) | 60,0 | 32,1 | +0,5 | 93,8 tok/s |
| Tailandés (TH) | 59,4 | 60,3 | — | 83,7 tok/s |
| Vietnamita (VI) | 59,1 | 40,1 | — | 85,7 tok/s |
| Italiano (IT) | 57,5 | 30,2 | — | 87,3 tok/s |
| Ruso (RU) | 55,3 | 29,5 | — | 89,5 tok/s |
| Español (ES) | 54,2 | 27,5 | — | 93,1 tok/s |
| Hindi (HI) | 53,1 | 36,5 | — | 105,7 tok/s |
| Árabe (AR) | 51,9 | 23,8 | — | 82,1 tok/s |
| Japonés (JA) | 48,1 | 49,1 | +3,1 | 86,7 tok/s |
| Chino simplificado (ZH) | 43,8 | 44,4 | +1,5 | 70,7 tok/s |
| Coreano (KO) | 37,9 | 15,8 | — | 83,9 tok/s |
| Chino tradicional (ZT) | 36,1 | 34,7 | +13,2 | 70,6 tok/s |

Desambiguación conversacional (conjunto retenido sin contaminación): 72,9 % con contexto frente a 39,3 % sin contexto (ganancia de +33,6 puntos, 98,6 % libre de fugas). En el subconjunto de 274 casos de idiomas centrales no africanos, 78,1 % (214/274), con resultados del 100 % en rumano, persa, urdu, bengalí, tailandés, vietnamita, sueco y malasio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pack ocupa 470,89 MiB comprimido y 479,12 MiB sin comprimir, por lo que la huella en memoria es inferior a 500 MB en el formato Q2c.
- GPU recomendadas: Apple Silicon (M4 Pro documentado con kernels Metal Q2c); no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, por tamaño (menos de 500 MB), aunque los kernels optimizados documentados son exclusivamente Metal para Apple Silicon.
- Opciones de despliegue: librería `kronos` (Rust) con ejecución vía mmap y memoria unificada; el modelo base está disponible en GGUF, lo que abre la puerta a llama.cpp u otros runners compatibles con GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: 82-131 tok/s end-to-end en M4 Pro (2,2-2,6 veces más rápido que CPU); hasta 131,7 tok/s en frases cortas en francés.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-2bit-kronos-v2 | 1,8B (2 bits) | No disponible | Apache-2.0 | `.k2tb` / GGUF base | Pack on-device de 470 MiB, 28 idiomas |
| tencent/Hy-MT2-1.8B | 1,8B | No disponible | Apache-2.0 | Safetensors / GGUF | Modelo base sin cuantizar; mayor huella |
| tencent/Hy-MT2-7B | 7B | No disponible | Apache-2.0 | Safetensors | Profesor de destilación; mayor calidad, más recursos |
| melodyleonard/AfriSLM-0.8B-africa-kronos | 0,8B | No disponible | Apache-2.0 | `.k2tb` | Pack complementario para lenguas africanas |

No se dispone de comparativas con modelos de traducción de otros fabricantes (por ejemplo, NLLB o M2M-100) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits (Q2c) implica una pérdida de precisión inherente; los benchmarks muestran chrF++ en el rango de 36-68 según el idioma, con coreano y chino tradicional en la parte baja.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento general, código, matemáticas o agentes.
- La ventana de contexto no está especificada, lo que dificulta planificar su uso en documentos largos.
- La cobertura de idiomas excluye lenguas africanas, que se derivan a un pack separado (AfriSLM-0.8B-africa-kronos); no cubre todos los idiomas del mundo.
- Los kernels optimizados documentados son exclusivamente para Apple Silicon (Metal); el rendimiento en otras plataformas no está cuantificado.
- El formato de pesos `.k2tb` es propietario de la librería `kronos`, lo que limita la portabilidad a otros runners sin conversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto muy reciente y sin validación comunitaria independiente.
- Riesgo de alucinación en traducción: no se documentan evaluaciones de fidelidad semántica más allá de chrF++ y BLEU.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el `LICENSE.txt` del pack y las condiciones del modelo base de Tencent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melodyleonard/Hy-MT2-1.8B-2bit-kronos-v2
- Modelo base GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-2Bit-GGUF
- Modelo base sin cuantizar: https://huggingface.co/tencent/Hy-MT2-1.8B
- Profesor de destilación: https://huggingface.co/tencent/Hy-MT2-7B
- Pack complementario para lenguas africanas: https://huggingface.co/melodyleonard/AfriSLM-0.8B-africa-kronos
