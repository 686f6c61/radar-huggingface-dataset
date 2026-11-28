# rikai-translate/rikai-jp-eng-Bench-265-1.4B

## Resumen
rikai-jp-eng-Bench-265-1.4B es un modelo de traduccion bidireccional japones-ingles desarrollado por rikai-translate, un ajuste fino (finetune) del modelo base cyberagent/CAT-Translate-1.4b. Con 1.407.538.944 parametros (aproximadamente 1,4B) y un tamano de repositorio de 10 GB, esta disenado especificamente para traduccion de alta calidad entre japones e ingles, incluyendo soporte para traduccion a nivel de documento mediante una arquitectura prefix-LM.

El modelo se presenta como parte de la familia "Bench 265", que incluye variantes de 0,8B, 1,4B y 3,3B. Segun la model card, el modelo de 1,4B iguala o supera al modelo CAT-Translate-3.3B en la mayoria de metricas automaticas, con una velocidad de decodificacion 2,4 veces superior. Esta optimizado para ejecucion en dispositivo (on-device), con soporte para formatos MLX (8-bit y 4-bit) y GGUF (Q8_0 y Q4_K_M), lo que lo hace adecuado para despliegues en hardware de consumo.

El modelo es relevante ahora porque ofrece una alternativa compacta y eficiente para traduccion japones-ingles de calidad cercana a modelos mas grandes, con licencia MIT permisiva y multiples formatos de cuantizacion para diferentes entornos de despliegue. Su enfoque en eficiencia computacional y su rendimiento en benchmarks lo posicionan como una opcion practica para aplicaciones de traduccion en produccion y en dispositivos con recursos limitados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con prefix-LM (basado en cyberagent/CAT-Translate-1.4b) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine (group size 64), MLX 4-bit affine (group size 64), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), MLX (8-bit, 4-bit), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de cyberagent/CAT-Translate-1.4b, un transformer decoder-only adaptado para traduccion. La model card menciona el uso de una arquitectura prefix-LM, que permite procesar la entrada como prefijo y generar la traduccion de forma autoregresiva, facilitando la traduccion a nivel de documento y de multiples frases. El modelo fue ajustado (finetune) sobre el modelo base CAT-Translate-1.4b.

Los datos de entrenamiento no se detallan en la informacion proporcionada, salvo que se menciona un conjunto de evaluacion de 26 dominios con 1.550 elementos con referencias humanas, y que los datos de entrenamiento fueron filtrados contra estos elementos usando shingles de 12 caracteres para evitar contaminacion. La model card indica que el modelo fue entrenado con un juez LLM (Claude Sonnet 5.5) como parte del proceso, aunque no se especifica si se uso RLHF o DPO. Se desconoce el numero total de tokens de entrenamiento y la composicion exacta del dataset.

Una innovacion tecnica destacable es el uso de una mascara de prefijo (prefix mask) durante la decodificacion, que segun la model card se emplea para la decodificacion greedy del modelo. Ademas, el modelo esta optimizado para decodificacion rapida, alcanzando 147 tok/s en un M4 Pro con MLX 8-bit, lo que lo hace adecuado para inferencia en dispositivo.

## Capacidades
- Traduccion bidireccional japones-ingles (ja→en y en→ja) de alta calidad, incluyendo traduccion a nivel de documento y de multiples frases.
- Traduccion en 26 dominios especializados, incluyendo dialogos de negocios, interpretacion judicial, medicina, noticias, comercio electronico, resenas de usuarios, literatura, redes sociales y contenido de manga.
- Manejo de expresiones idiomaticas, proverbios, metaforas y similares, con un conjunto de evaluacion especifico de 200 elementos.
- Soporte para decodificacion greedy con mascara de prefijo, optimizado para velocidad.
- Capacidades multilingues limitadas a japones e ingles.
- No se menciona soporte de tool calling, function calling, agentes o multi-step reasoning en la informacion proporcionada.
- No se menciona soporte de vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso
- Traduccion de documentacion tecnica y legal: el modelo puede traducir documentos completos del japones al ingles y viceversa, manteniendo coherencia gracias a su arquitectura prefix-LM y su entrenamiento en dominios como interpretacion judicial y dialogos de negocios.
- Localizacion de contenido de comercio electronico: adecuado para traducir descripciones de productos, resenas de usuarios y contenido de marketing entre japones e ingles, con buen rendimiento en dominios de e-commerce segun los benchmarks.
- Traduccion de contenido de manga y literatura: el modelo ha sido evaluado en paginas de manga (OpenMantra) y parrafos literarios (WMT24++), lo que lo hace util para traduccion de comics y obras literarias, incluyendo expresiones idiomaticas.
- Atencion al cliente multilingue: puede gestionar conversaciones de soporte entre japones e ingles, gracias a su entrenamiento en dialogos de negocios y su capacidad de traduccion de multiples frases.
- Traduccion en dispositivos moviles y edge: con cuantizacion MLX 4-bit (763 MB) o GGUF Q4_K_M (931 MB), el modelo puede ejecutarse en dispositivos con recursos limitados, como portatiles o moviles, ofreciendo traduccion offline.
- Subtitulado y traduccion de contenido audiovisual: el modelo puede traducir dialogos y guiones entre japones e ingles, con velocidad de decodificacion de 147 tok/s en M4 Pro, adecuada para procesamiento en tiempo casi real.
- Investigacion en traduccion automatica: util como modelo base para experimentos de traduccion de bajo recursos, gracias a su licencia MIT y su disponibilidad en multiples formatos.

## Benchmarks y rendimiento
La model card proporciona resultados detallados en varios conjuntos de evaluacion. A continuacion se presentan los datos principales comparando con modelos similares:

| Metrica | rikai 1.4B | rikai 0.8B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | 0.8425 | 0.8384 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | 2.75 | 2.85 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | 3.16 | 3.34 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, COMET-22 ↑ | 0.8632 | 0.8568 | 0.8455 | 0.8513 | 0.8582 | 0.8616 | 0.8645 |
| 26-domain gate, BLEU ↑ | 23.88 | 22.02 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | 38.33 | 36.88 | 35.62 | 35.31 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | 0.8081 | 0.8020 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 − err/25) ↑ | 0.8684 | 0.8586 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | 0.8475 | 0.8436 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |
| LLM judge (Sonnet 5.5), score 0–100 ↑ | 66.9 | 60.3 | 58.5 | 60.6 | 70.4 | 71.6 | 73.4 |
| LLM judge, translations with critical error ↓ | 3.8% | 6.2% | 7.4% | 7.8% | 3.2% | 2.0% | 1.4% |
| Decode speed, tok/s (M4 Pro, 8-bit MLX) ↑ | 147 | 217 | 218 | 146 | 61 | 61 | 28 |

Ademas, en la evaluacion con juez LLM (Claude Sonnet 5.5) sobre 500 elementos ciegos, el modelo obtuvo una puntuacion de 66,9 sobre 100, con un 3,8% de traducciones con error critico. En el conjunto de expresiones idiomaticas (200 elementos), no se proporcionan resultados numericos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: fp16 requiere aproximadamente 2,8 GB; MLX 8-bit requiere 1,5 GB; MLX 4-bit requiere 763 MB; GGUF Q8_0 requiere 1,5 GB; GGUF Q4_K_M requiere 931 MB.
- GPU recomendadas: no se especifican GPU concretas, pero el modelo esta optimizado para ejecucion en dispositivo (on-device). Se menciona un Apple M4 Pro para las pruebas de velocidad (147 tok/s con MLX 8-bit).
- Cabe en GPU de consumo: si, gracias a las cuantizaciones de 4-bit y 8-bit, puede ejecutarse en GPUs con 2-4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o en Apple Silicon mediante MLX.
- Opciones de despliegue: transformers (safetensors), MLX (8-bit y 4-bit), llama.cpp (GGUF Q8_0 y Q4_K_M), y text-generation-inference (segun los tags). Tambien es compatible con endpoints.
- Latencia y throughput estimados: 147 tok/s en M4 Pro con MLX 8-bit; 217 tok/s para el modelo 0.8B en las mismas condiciones; 61 tok/s para CAT-3.3B. No se proporcionan datos para otras GPU.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento (LLM judge) |
|---|---|---|---|---|---|
| rikai-jp-eng-Bench-265-1.4B | 1,4B | No disponible | MIT | safetensors, MLX, GGUF | 66,9 / 100 |
| CAT-Translate-1.4b | 1,4B | No disponible | No disponible | No disponible | 60,6 / 100 |
| CAT-Translate-3.3B | 3,3B | No disponible | No disponible | No disponible | 71,6 / 100 |
| TranslateGemma-4B | 4B | No disponible | No disponible | No disponible | 63,7 / 100 |
| HY-MT1.5-1.8B | 1,8B | No disponible | No disponible | No disponible | 58,0 / 100 |

El modelo rikai 1.4B supera a CAT-1.4B (su modelo base) y a TranslateGemma-4B en la puntuacion del juez LLM, a pesar de tener menos parametros que este ultimo. Se acerca al rendimiento de CAT-3.3B en metricas automaticas como CometKiwi y MetricX-24, y lo supera en BLEU y chrF++. Su principal ventaja es la eficiencia: ofrece calidad comparable a modelos mas grandes con una velocidad de decodificacion mucho mayor.

## Limitaciones y advertencias
- El modelo solo soporta japones e ingles; no es multilingue mas alla de estos dos idiomas.
- No se ha publicado informacion sobre sesgos conocidos, pero al ser un modelo de traduccion entrenado con datos possibly sesgados, puede reflejar sesgos presentes en los corpus utilizados.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en dominios no vistos o con expresiones muy idiomaticas. La model card reporta un 3,8% de traducciones con error critico en el conjunto de evaluacion.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto, lo que puede afectar a la traduccion de documentos muy largos.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (cyberagent/CAT-Translate-1.4b) para asegurar el cumplimiento.
- Caveat para produccion: el modelo esta optimizado para decodificacion greedy con mascara de prefijo; otros metodos de decodificacion pueden no estar soportados o dar resultados diferentes. Ademas, el rendimiento puede variar segun la cuantizacion utilizada.

## Enlaces
- [Hugging Face: rikai-translate/rikai-jp-eng-Bench-265-1.4B](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B)
- [Modelo base: cyberagent/CAT-Translate-1.4b](https://huggingface.co/cyberagent/CAT-Translate-1.4b)
- [Resultados por dominio](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B/blob/main/per_domain_results.md)
- [Paper (arXiv:2606.21413)](https://arxiv.org/abs/2606.21413)
- [Variante 0.8B](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B)
- [Variante 3.3B alpha](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-3.3B-alpha)
