# rikai-translate/rikai-jp-eng-Bench-265-0.8B

## Resumen

rikai-jp-eng-Bench-265-0.8B es un modelo de traduccion bidireccional japones-ingles desarrollado por rikai-translate, afinado a partir de cyberagent/CAT-Translate-0.8b. Con 793 millones de parametros, esta disenado para traduccion de alta calidad en dispositivo (on-device), un nicho donde los modelos multilingues genericos suelen quedarse cortos en pares de idiomas especificos como ja-en. Su propuesta de valor es clara: igualar o superar a modelos del doble de tamano (CAT-Translate-1.4B) en la mayoria de metricas automaticas, con una velocidad de decodificacion 1,8 veces superior.

El modelo emplea una arquitectura transformer con atencion de tipo prefix-LM, lo que permite un control mas preciso de la generacion condicionada al texto fuente. Se distribuye en multiples formatos (safetensors fp16, MLX 8-bit y 4-bit, GGUF Q8_0 y Q4_K_M) para facilitar su despliegue tanto en servidores como en hardware de consumo y dispositivos Apple Silicon. Su licencia MIT elimina practicamente cualquier friccion para uso comercial.

La relevancia actual del modelo radica en su enfoque en eficiencia: demuestra que un modelo sub-1000M puede competir con alternativas de 1.4B a 7B en tareas de traduccion especializada, siempre que el entrenamiento y la evaluacion se disenen con rigor. La publicacion incluye una bateria de evaluacion extensa (26 dominios, 1.550 items con referencias humanas, juicio con LLM y pruebas ciegas) que aporta transparencia poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con prefix-LM (basado en CAT-Translate-0.8b) |
| Parametros totales | 793.048.320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine (group size 64), MLX 4-bit affine (group size 64), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en CAT-Translate-0.8b de CyberAgent, un transformer afinado para traduccion. La innovacion principal de rikai es el uso de una mascara prefix-LM durante la decodificacion, que permite al modelo procesar el texto fuente como prefijo y generar la traduccion de forma condicionada, mejorando la fidelidad en la generacion. El entrenamiento se realizo mediante fine-tuning sobre el modelo base, con un conjunto de datos cribado contra los conjuntos de evaluacion usando shingles de 12 caracteres para evitar contaminacion.

El autor indica que el modelo fue entrenado con un juez LLM (Claude Sonnet 5.5) como parte del proceso, lo que sugiere el uso de tecnicas de alineacion o filtrado basadas en preferencias. No se especifica el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset. La evaluacion se realizo con decodificacion greedy a 8 bits (MLX) y el prompt recomendado por el autor, lo que garantiza comparaciones justas con los modelos de referencia.

## Capacidades

- Traduccion bidireccional japones-ingles (ja→en y en→ja) de alta calidad, con especial enfasis en dominios como negocios, medicina, legal, manga, noticias y dialogos.
- Generacion de texto condicionada por prefix-LM, que permite un control preciso sobre la salida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en traduccion.
- Capacidades multilingues limitadas a japones e ingles.
- Capacidad especial: traduccion en dispositivo (on-device) gracias a sus variantes cuantizadas (MLX 4-bit de 434 MB, GGUF Q4_K_M de 528 MB).
- Formato conversacional (chat template) compatible con el de CAT-Translate.

## Casos de uso

- Traduccion de documentacion tecnica ja-en en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados para traducir documentacion de productos, con la ventaja de su licencia MIT y su bajo coste computacional.
- Atencion al cliente bilingue en dispositivos: gracias a sus variantes GGUF y MLX, puede ejecutarse localmente en portatiles o moviles para traducir conversaciones de soporte en tiempo real sin enviar datos a la nube.
- Localizacion de manga y contenido audiovisual: el modelo ha sido evaluado especificamente en dominios como OpenMantra (manga) y dialogos de negocios, lo que lo hace adecuado para traduccion de dialogos con matices.
- Traduccion medica y legal asistida: su evaluacion en EJMMT (medico) y interpretacion judicial sugiere un rendimiento solido en dominios especializados, util para pre-traduccion que luego revise un humano.
- Traduccion de articulos periodisticos y redes sociales: evaluado en WMT23 (noticias, resenas, Q&A) y WMT24++ (parrafos literarios, sociales), adecuado para medios digitales que necesiten traduccion rapida.
- Prototipado rapido en investigacion de traduccion automatica: su tamano compacto y su amplia bateria de evaluacion lo convierten en una linea base excelente para experimentos academicos.
- Traduccion offline en entornos con conectividad limitada: las variantes cuantizadas permiten desplegar el modelo en dispositivos sin conexion, como tablets o Raspberry Pi con suficiente RAM.

## Benchmarks y rendimiento

| Metrica | rikai 0.8B | rikai 1.4B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | **0.8384** | 0.8425 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | **2.85** | 2.75 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | **3.34** | 3.16 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, BLEU ↑ | **22.02** | 23.88 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | **36.88** | 38.33 | 35.62 | 35.32 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | **0.8020** | 0.8081 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 − err/25) ↑ | **0.8586** | 0.8684 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | **0.8436** | 0.8475 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |
| LLM judge (0–100) | **60.3** | 66.9 | 58.5 | 60.6 | — | — | — |
| LLM judge, critical error rate ↓ | **6.2%** | 3.8% | 7.4% | 7.8% | — | — | — |

El modelo supera a CAT-0.8B y CAT-1.4B en la mayoria de metricas automaticas (CometKiwi, MetricX-24-QE y MetricX-24 en el conjunto de 26 dominios y en el conjunto ciego de 500 items), y queda cerca de CAT-3.3B-β. En BLEU y chrF++ esta por debajo de CAT-1.4B y CAT-3.3B, pero el autor argumenta que las metricas neuronales son mas representativas. En la evaluacion con juez LLM, obtiene 60.3 puntos, por encima de CAT-0.8B (58.5) y CAT-1.4B (60.6), y con una tasa de errores criticos del 6.2%, inferior a la de CAT-0.8B (7.4%) y CAT-1.4B (7.8%).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1.6 GB (solo pesos), mas overhead de activaciones y cache; en la practica, unos 2-3 GB.
- VRAM estimada en MLX 8-bit: 812 MB de pesos; en 4-bit: 434 MB.
- VRAM estimada en GGUF Q8_0: 845 MB; en Q4_K_M: 528 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) puede ejecutar el modelo con holgura; tambien cabe en GPUs de gama baja con 4 GB o menos en cuantizacion 4-bit.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos 8 anos, y en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: transformers (safetensors), llama.cpp (GGUF), MLX (Apple Silicon), text-generation-inference (TGI), endpoints compatibles.
- Latencia y throughput: el autor indica una velocidad de decodificacion 1,8 veces superior a CAT-Translate-1.4B, pero no se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato | Rendimiento (LLM judge) |
|---|---|---|---|---|---|---|
| rikai-jp-eng-Bench-265-0.8B | 793M | No disponible | MIT | ja, en | safetensors, MLX, GGUF | 60.3 |
| CAT-Translate-1.4B | 1.4B | No disponible | No disponible | ja, en | safetensors | 60.6 |
| CAT-Translate-0.8B | 0.8B | No disponible | No disponible | ja, en | safetensors | 58.5 |
| LFM2-350M-ENJP-MT | 350M | No disponible | No disponible | en, ja | No disponible | 51.8 |
| TinySwallow-1.5B | 1.5B | No disponible | No disponible | ja, en | No disponible | 52.0 |
| Gemma-2-2B-jpn-translate | 2B | No disponible | No disponible | ja, en | No disponible | 55.4 |

El modelo de rikai ofrece el mejor equilibrio entre tamano y calidad en la comparativa, superando a alternativas de mayor tamano como TinySwallow-1.5B, Gemma-2-2B-jpn-translate y LFM2.5-1.2B-JP en la evaluacion con juez LLM, y quedando practicamente empatado con CAT-1.4B. Su principal ventaja competitiva es la licencia MIT y la disponibilidad de formatos cuantizados para despliegue en dispositivo.

## Limitaciones y advertencias

- El modelo solo soporta japones e ingles; no es adecuado para otros pares de idiomas.
- La longitud de contexto no esta documentada, lo que limita la planificacion para documentos largos.
- Riesgo de alucinacion inherente a los modelos de traduccion, especialmente en textos muy especializados o con jerga no vista en entrenamiento.
- Aunque la evaluacion cubre 26 dominios, no se garantiza un rendimiento uniforme en todos ellos; el autor publica resultados por dominio, que pueden consultarse.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (CAT-Translate-0.8b) por si impusiera condiciones adicionales.
- El modelo fue entrenado con un juez LLM, lo que puede introducir sesgos hacia el estilo de traduccion que ese juez prefiere; no se detalla la composicion del dataset de entrenamiento.
- No se proporcionan datos sobre sesgos de genero, culturales o de otro tipo; se recomienda evaluacion adicional en produccion.
- El rendimiento en textos muy largos o con estructuras complejas (por ejemplo, documentos legales con referencias cruzadas) no esta cuantificado.

## Enlaces

- [Hugging Face: rikai-translate/rikai-jp-eng-Bench-265-0.8B](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B)
- [Resultados por dominio](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B/blob/main/per_domain_results.md)
- [Modelo base: cyberagent/CAT-Translate-0.8b](https://huggingface.co/cyberagent/CAT-Translate-0.8b)
- [Paper (arXiv:2606.21413)](https://arxiv.org/abs/2606.21413)
- [Variante 1.4B](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B)
- [Variante 3.3B alpha](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-3.3B-alpha)
