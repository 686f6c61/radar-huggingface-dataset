# rikai-translate/rikai-jp-eng-Bench-265-1.4B

## Resumen

rikai-jp-eng-Bench-265-1.4B es un modelo de traduccion bidireccional japones-ingles desarrollado por rikai-translate, un finetune del modelo base CAT-Translate-1.4b de CyberAgent. El modelo esta disenado especificamente para la tarea de traduccion ja↔en, con un tamano compacto de 1.407.538.944 parametros (aproximadamente 1.4B) que lo posiciona como una opcion eficiente para despliegue en dispositivos locales. Su relevancia radica en que, segun la model card, iguala o supera a CAT-Translate-3.3B en la mayoria de metricas automaticas con una velocidad de decodificacion 2.4 veces mayor, manteniendo un tamano reducido que permite inferencia on-device.

La arquitectura subyacente es un transformer de tipo Llama con un mecanismo de prefix-LM que permite al prompt ser procesado en ambas direcciones antes de generar la primera palabra. El modelo esta entrenado con datos que cubren 26 dominios especializados (negociacion, interpretacion judicial, medicina, manga, noticias, e-commerce, etc.) y ha sido evaluado con un conjunto de pruebas humanas de 1.550 elementos, alcanzando resultados competitivos frente a modelos significativamente mas grandes.

El modelo esta disponible en formatos safetensors (fp16), MLX (8-bit y 4-bit) y GGUF (Q8_0 y Q4_K_M), con licencia MIT, lo que lo convierte en una opcion atractiva para desarrolladores que necesitan traduccion de alta calidad en entornos con recursos limitados o en produccion sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) con prefix-LM |
| Parametros totales | 1.407.538.944 (~1.4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine (group size 64), MLX 4-bit affine (group size 64), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, MLX, GGUF |
| Modelo base | cyberagent/CAT-Translate-1.4b |
| Velocidad de decodificacion | 147 tok/s (M4 Pro, 8-bit MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, adaptada mediante un esquema de prefix-LM que permite que el prompt de traduccion sea leido en ambas direcciones antes de comenzar la generacion. Esta innovacion tecnica, heredada del modelo base CAT-Translate, mejora la coherencia contextual de la traduccion al disponer de una vision completa del texto fuente antes de emitir el primer token. El finetune se ha realizado sobre CAT-Translate-1.4b, un modelo de traduccion de CyberAgent.

Los datos de entrenamiento cubren 26 dominios especializados que incluyen dialogos de negocios (BSD), interpretacion judicial, medicina (EJMMT), noticias (WMT23), e-commerce, resenas de usuarios, manga (OpenMantra), FLORES-200, Tatoeba, NTREX-128 y WMT24++. El modelo fue ademas entrenado con un juez LLM (Claude Sonnet 5.5) para optimizar la calidad de las traducciones, y todos los datos de entrenamiento fueron filtrados contra el conjunto de evaluacion mediante shingles de 12 caracteres para evitar contaminacion. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni si se utilizaron tecnicas de RLHF o DPO mas alla del juez LLM.

## Capacidades

- Traduccion bidireccional japones↔ingles en 26 dominios especializados (negocios, justicia, medicina, manga, noticias, e-commerce, resenas, literatura, etc.).
- Generacion de texto orientada a traduccion con prefix-LM: el prompt se procesa en ambas direcciones antes de la primera palabra generada.
- Soporte de prompt y chat template identicos a CAT-Translate: "Translate the following {src_lang} text into {tgt_lang}.\n\n{src_text}".
- Capacidades multilingues limitadas a japones e ingles.
- Inferencia on-device gracias a los formatos MLX (8-bit y 4-bit) y GGUF (Q8_0 y Q4_K_M).
- Compatibilidad con text-generation-inference y endpoints_compatible.
- No se dispone de informacion sobre tool calling, function calling, agentes o modos de razonamiento multi-step en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica ja↔en: el modelo puede procesar parrafos y articulos multi-oracion gracias a su esquema prefix-LM, que lee el prompt completo antes de generar, siendo adecuado para manuales y documentacion de producto.
- Localizacion de sitios web y aplicaciones: al cubrir dominios como e-commerce, resenas de usuarios y noticias, puede integrarse en pipelines de localizacion para traducir cadenas de interfaz y contenido dinamico con latencia baja (147 tok/s en M4 Pro).
- Interpretacion judicial y medica: el modelo ha sido evaluado en conjuntos de interpretacion judicial y medicina (EJMMT), lo que lo hace util para pre-traduccion asistida en entornos legales y sanitarios donde se requiere terminologia especializada.
- Traduccion de dialogos de atencion al cliente: entrenado con dialogos de negocios (BSD), puede gestionar conversaciones multi-turno en japones e ingles para soporte automatizado.
- Traduccion de manga y contenido creativo: evaluado en paginas de manga (OpenMantra) y textos literarios (WMT24++), adecuado para localizacion de comics y narrativa.
- Despliegue en dispositivos Apple Silicon: las variantes MLX 8-bit (1.5 GB) y 4-bit (763 MB) permiten ejecutar traduccion en Macs con memoria unificada, sin GPU dedicada.
- Integracion en pipelines de CI/CD para traduccion automatizada de documentacion: compatible con text-generation-inference y formatos GGUF para llama.cpp, facilitando su inclusion en flujos de build.
- Traduccion en tiempo real de resenas y feedback de usuarios: cobertura de dominios de resenas y redes sociales (WMT23 Mastodon, user reviews) con velocidad suficiente para procesamiento por lotes.

## Benchmarks y rendimiento

| Metrica | rikai 1.4B | rikai .8B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | **0.8425** | 0.8384 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | **2.75** | 2.85 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | **3.16** | 3.34 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, COMET-22 ↑ | **0.8632** | 0.8568 | 0.8455 | 0.8513 | 0.8582 | 0.8616 | 0.8645 |
| 26-domain gate, BLEU ↑ | **23.88** | 22.02 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | **38.33** | 36.88 | 35.62 | 35.31 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | **0.8081** | 0.8020 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 − err/25) ↑ | **0.8684** | 0.8586 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | **0.8475** | 0.8436 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |
| LLM judge (Sonnet 5.5), 0–100 ↑ | **66.9** | 60.3 | 58.5 | 60.6 | 70.4 | 71.6 | 73.4 |
| LLM judge, errores criticos ↓ | **3.8%** | 6.2% | 7.4% | 7.8% | 3.2% | 2.0% | 1.4% |
| Velocidad decodificacion, tok/s (M4 Pro, 8-bit MLX) ↑ | **147** | 217 | 218 | 146 | 61 | 61 | 28 |

Comparativa adicional con otros modelos en LLM judge (0–100): TranslateGemma-4B 63.7 (5.8% errores criticos), LFM2-350M-ENJP-MT 51.8 (13.2%), LFM2.5-1.2B-JP 50.6 (17.2%), TinySwallow-1.5B 52.0 (15.6%), Gemma-2-2B-jpn 52.2 (19.6%), Gemma-2-2B-jpn-translate 55.4 (14.0%), HY-MT1.5-1.8B 58.0 (7.2%). Modelos mayores no graficados: CAT-3.3B-β 70.4, CAT-3.3B 71.6, CAT-7B 73.4, Tower-Plus-9B 74.0, TranslateGemma-12B 75.5.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.8 GB en fp16 (safetensors), 1.5 GB en MLX 8-bit o GGUF Q8_0, y 763 MB en MLX 4-bit o 931 MB en GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16, o 2 GB para cuantizaciones 4-bit. En Apple Silicon, el modelo corre en MLX sobre memoria unificada.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en Macs con Apple Silicon (M1 en adelante) usando MLX.
- Opciones de despliegue: llama.cpp (GGUF Q8_0/Q4_K_M), MLX (Apple Silicon, builds 8-bit y 4-bit), transformers (safetensors fp16), text-generation-inference (TGI), endpoints_compatible.
- Latencia y throughput: 147 tok/s en M4 Pro con MLX 8-bit; 217 tok/s para la variante .8B en las mismas condiciones. No se dispone de datos de latencia en GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LLM judge (0–100) | Errores criticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rikai-jp-eng-Bench-265-1.4B | ~1.4B | No disponible | 66.9 | 3.8% | MIT | HF (safetensors, MLX, GGUF) |
| CAT-Translate-1.4b (base) | ~1.4B | No disponible | 60.6 | 7.8% | No disponible | HF |
| CAT-Translate-3.3B | ~3.3B | No disponible | 71.6 | 2.0% | No disponible | HF |
| TranslateGemma-4B | ~4B | No disponible | 63.7 | 5.8% | No disponible | HF |
| HY-MT1.5-1.8B | ~1.8B | No disponible | 58.0 | 7.2% | No disponible | HF |
| LFM2.5-1.2B-JP | ~1.2B | No disponible | 50.6 | 17.2% | No disponible | HF |

El modelo destaca por ofrecer calidad de traduccion cercana a CAT-3.3B (66.9 vs 71.6 en LLM judge, con solo 1.4% mas de errores criticos) con un tamano 2.4 veces menor y una velocidad de decodificacion 2.4 veces superior. Frente a TranslateGemma-4B, lo supera en LLM judge (66.9 vs 63.7) con menos errores criticos (3.8% vs 5.8%) y menor tamano.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al entrenarse en dominios acotados (negocios, justicia, medicina, manga, noticias), puede presentar sesgos derivados de esos corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en textos fuera de los 26 dominios de entrenamiento; el 3.8% de errores criticos en el conjunto blind sugiere que en produccion se requiere revision humana para contenido sensible.
- Limitaciones de contexto: no se especifica la longitud de contexto maxima en la informacion disponible; el modelo esta optimizado para traduccion de parrafos y articulos multi-oracion, pero se desconoce el limite exacto.
- Limitaciones de idioma: solo soporta japones e ingles; no cubre otras combinaciones linguisticas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el modelo base CAT-Translate-1.4b puede tener condiciones adicionales que deben verificarse en su propia model card.
- Caveat para produccion: el modelo requiere el prompt y chat template especificos de CAT-Translate y el prefix mask para funcionar correctamente; usarlo con otros prompts puede degradar la calidad. La evaluacion se realizo con decodificacion greedy a 8-bit MLX, por lo que el rendimiento en otras configuraciones puede variar.

## Enlaces

- Hugging Face: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B
- Variante .8B: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B
- Resultados por dominio: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B/blob/main/per_domain_results.md
- Modelo base: https://huggingface.co/cyberagent/CAT-Translate-1.4b
- Paper (referencia arXiv): https://arxiv.org/abs/2606.21413
