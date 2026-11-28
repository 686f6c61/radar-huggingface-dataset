# mradermacher/Hy-MT3-1.8B-i1-GGUF

## Resumen

Hy-MT3-1.8B-i1-GGUF es la versión cuantizada en formato GGUF del modelo de traducción automática Hy-MT3-1.8B, desarrollado originalmente por Tencent y empaquetado por mradermacher. Se trata de un modelo especializado en traducción multilingüe con 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), diseñado para cubrir un espectro muy amplio de más de 100 idiomas, incluyendo pares poco habituales como camboyano, birmano, tibetano, cebuano, waray o gaélico escocés. La relevancia de esta ficha radica en que ofrece una alternativa ligera y ejecutable en hardware de consumo para pipelines de traducción que requieren cobertura lingüística extensa sin depender de servicios en la nube.

El modelo base sigue una arquitectura transformer orientada a traducción (pipeline `translation`), y esta variante i1-GGUF incorpora cuantizaciones ponderadas con matrices de importancia (imatrix), lo que permite reducir el peso del modelo desde varios gigabytes hasta rangos de 0,6-1,6 GB según el nivel de cuantización elegido. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, algo poco frecuente en modelos de traducción de alta cobertura lingüística.

La ficha se centra en la variante cuantizada, pero conviene tener presente que las capacidades técnicas y de rendimiento heredan directamente del modelo base `tencent/Hy-MT3-1.8B`, del cual no se dispone de información detallada de entrenamiento ni de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción, pipeline `translation`); detalles internos no disponibles |
| Parametros totales | 1.791.080.448 (~1,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas ponderadas con imatrix) |
| Idiomas soportados | Más de 100 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ar, hi, ja, ko, vi, th, tr, nl, pl, uk, he, fa, ur, bn, ta, te, mr, gu, kn, ml, pa, si, my, km, lo, bo, mn, yue, kk, ug, el, cy, ro, ca, hu, gl, sd, bg, eu, as, sr, af, or, hr, lb, sk, mt, sl, eo, sa, sq, yi, mk, hy, jv, be, ka, su, lt, az, ceb, lv, uz, war, et, ky, sw, fi, tk, am, sv, tg, so, da, tt, mg, nb, ba, ht, nn, ku, is, ckb, ga, ps, gd, ne |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamano del repo | 22,0 GB (incluye todas las variantes de cuantización) |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy-MT3-1.8B` es un transformer especializado en traducción automática, según indica el pipeline declarado en Hugging Face. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones arquitectónicas específicas como atención lineal, decodificación especulativa o mecanismos híbridos.

La variante aquí descrita es una cuantización GGUF generada por mradermacher mediante cuantización ponderada con matriz de importancia (imatrix), lo que mejora la fidelidad de la cuantización respecto a métodos estáticos. El autor también publica cuantizaciones estáticas en un repositorio paralelo (`mradermacher/Hy-MT3-1.8B-GGUF`). El proceso de conversión usa `convert_type: hf` y `output_tensor_quantised: 1`, según los metadatos del README.

## Capacidades

- Traducción automática multilingüe entre más de 100 idiomas, con cobertura destacada de lenguas de bajos recursos (camboyano, birmano, tibetano, cebuano, waray, gaélico escocés, etc.).
- Traducción bidireccional entre prácticamente cualquier par de los idiomas listados, incluyendo pares sin el inglés como pivote explícito (aunque no se documenta el comportamiento exacto).
- Modelo etiquetado como `conversational`, lo que sugiere soporte de interacción en formato de chat, aunque no se detalla el formato de prompt ni la plantilla de conversación.
- Compatible con `endpoints_compatible` según los tags de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y guías entre docenas de idiomas en un pipeline por lotes, aprovechando su licencia Apache 2.0 y su reducido tamaño para ejecutarse en servidores modestos.
- Localización de aplicaciones con cobertura de lenguas minoritarias: resulta adecuado para productos que necesitan traducir a camboyano, birmano, tibetano o cebuano, idiomas con escasa representación en modelos comerciales.
- Traducción en el borde (edge) o en dispositivos: con cuantizaciones de 1,2 GB (Q4_K_M), puede desplegarse en portátiles con GPU de consumo o incluso en CPU mediante llama.cpp, útil para herramientas de traducción offline.
- Preprocesado de corpus multilingües para investigación: investigadores pueden generar traducciones sintéticas o alinear corpus en más de 100 idiomas sin depender de APIs externas, controlando costes y privacidad.
- Atención al cliente multilingüe: integrado en un sistema de chat, puede traducir mensajes entrantes y salientes en tiempo real entre el idioma del usuario y el del operador, cubriendo lenguas poco comunes que otros modelos no soportan.
- Subtitulado y traducción de contenido audiovisual: el modelo puede traducir transcripciones o subtítulos entre pares de idiomas diversos, y su tamaño permite procesar grandes volúmenes en paralelo en una sola GPU.
- Traducción de correspondencia legal o administrativa en contextos con requisitos de privacidad: al ejecutarse localmente, evita enviar datos sensibles a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,0 GB para cuantizaciones IQ1-IQ3, 1,2-1,3 GB para Q4, 1,4-1,6 GB para Q5-Q6. Estas cifras corresponden al tamaño de los ficheros GGUF y no incluyen el overhead del contexto KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4; para Q6 se recomienda 3 GB o más. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B (este, vía GGUF) | ~1,8 B | No disponible | >100 | Apache 2.0 | GGUF, safetensors |
| NLLB-200 (Meta) | 600 M - 54 B | No disponible | 200 | CC-BY-NC (no comercial) | safetensors |
| M2M-100 (Meta) | 418 M - 12 B | No disponible | 100 | MIT | safetensors |
| Opus-MT (Helsinki-NLP) | ~75 M por par | No disponible | Por pares | CC-BY 4.0 | safetensors |

La comparativa se limita a alternativas de traducción multilingüe de código abierto; no se dispone de datos de rendimiento comparativo para Hy-MT3-1.8B. Frente a NLLB-200, la ventaja principal es la licencia Apache 2.0 (permite uso comercial) y el tamaño reducido; frente a Opus-MT, la cobertura multilingüe en un solo modelo. M2M-100 ofrece licencia MIT pero menor cobertura y tamaños superiores en sus variantes grandes.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo; como todo sistema de traducción, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: en traducción, puede producir contenido no presente en el original, especialmente en cuantizaciones muy agresivas (IQ1, IQ2) donde la calidad se degrada notablemente según las notas del propio autor.
- Las cuantizaciones IQ1 e IQ2 están marcadas por el autor como "for the desperate" o "mostly desperate", lo que indica calidad muy baja; para producción se recomienda Q4_K_M o superior.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original de Tencent, ya que la cuantización hereda las obligaciones del modelo fuente.
- El modelo está especializado en traducción; no debe emplearse como modelo de propósito general para razonamiento, código o generación creativa.
- No se documenta el formato de prompt ni la plantilla de chat, lo que puede requerir experimentación para obtener resultados óptimos.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Hy-MT3-1.8B-i1-GGUF
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-1.8B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Hy-MT3-1.8B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Hy-MT3-1.8B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
