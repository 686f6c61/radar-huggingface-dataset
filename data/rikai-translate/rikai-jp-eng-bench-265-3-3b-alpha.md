# rikai-translate/rikai-jp-eng-Bench-265-3.3B-alpha

## Resumen

rikai jp<->eng Bench 265 3.3B α es un modelo de traduccion bidireccional japones-ingles desarrollado por rikai-translate. Se trata de un ajuste fino (finetune) del modelo cyberagent/CAT-Translate-3.3b, orientado especificamente a la traduccion de alta calidad entre ambos idiomas con un enfoque en eficiencia para despliegue en dispositivo. El modelo emplea una arquitectura transformer con esquema prefix-LM, lo que permite procesar la fuente y generar la traduccion de forma controlada mediante mascaras de prefijo.

El modelo resuelve el problema de la traduccion automatica de calidad profesional entre japones e ingles en un tamano compacto de 3.355 millones de parametros, compitiendo con modelos de hasta 7B en metricas automaticas y en evaluacion con LLM como juez, pero con una velocidad de decodificacion significativamente mayor. Es relevante ahora porque demuestra que un modelo de 3.3B puede igualar o superar a alternativas mas grandes en tareas de traduccion especializada, y porque ofrece formatos cuantizados (MLX 8/4-bit y GGUF) que lo hacen viable en hardware de consumo.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial, y esta disenado para traduccion en dispositivo (on-device), con variantes cuantizadas que reducen el peso a 1.9 GB en 4-bit. La evaluacion presentada por el autor incluye 26 dominios con referencias humanas, un conjunto ciego de 500 elementos y evaluacion con LLM juez, mostrando resultados competitivos frente a CAT-Translate y otros modelos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con prefix-LM (basado en Llama) |
| Parametros totales | 3.355.609.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine (group size 64), MLX 4-bit affine (group size 64), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), MLX (8-bit y 4-bit), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en cyberagent/CAT-Translate-3.3b, un transformer de 3.355 millones de parametros con arquitectura tipo Llama y esquema prefix-LM. El prefix-LM permite condicionar la generacion mediante una mascara de prefijo que separa la secuencia de entrada (fuente) de la secuencia de salida (traduccion), facilitando el control bidireccional de la traduccion. El modelo se distribuye en fp16 con safetensors, y el autor proporciona conversiones a MLX (8-bit y 4-bit con group size 64) y GGUF (Q8_0 y Q4_K_M) para llama.cpp.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que el modelo fue entrenado con un LLM juez (Claude Sonnet 5.5) como parte del proceso, y que se aplico un filtrado de datos de entrenamiento contra los conjuntos de evaluacion mediante shingles de 12 caracteres para evitar contaminacion. El modelo base CAT-Translate-3.3b fue desarrollado por CyberAgent, y este finetune esta orientado a traduccion bidireccional japones-ingles con enfasis en eficiencia de decodificacion.

## Capacidades

- Traduccion bidireccional japones-ingles (ja→en y en→ja) con calidad profesional en 26 dominios evaluados.
- Generacion de texto condicionada mediante prefix-LM, con mascara de prefijo para control de la traduccion.
- Traduccion de documentos completos y de lineas individuales, incluyendo dialogos empresariales, textos legales, medicos, noticias, resenas de usuarios, manga y articulos multi-frase.
- Soporte de traduccion en dispositivo (on-device) gracias a las variantes cuantizadas MLX y GGUF.
- Capacidad de ejecucion en hardware de consumo (Apple Silicon via MLX, CPU/GPU via llama.cpp).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; el modelo esta especializado en traduccion.
- Capacidades multilingues limitadas a japones e ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Traduccion de documentacion tecnica japones-ingles: el modelo puede traducir documentacion de productos, manuales y guias tecnicas manteniendo terminologia especializada, gracias a su entrenamiento en 26 dominios que incluyen textos tecnicos y empresariales.
- Localizacion de interfaces y contenido web: con variantes GGUF Q4_K_M de 2.1 GB, puede desplegarse en servidores modestos o en el navegador mediante llama.cpp para traducir contenido de forma dinamica sin depender de APIs externas.
- Atencion al cliente bilingue: el modelo maneja dialogos empresariales (BSD business dialogue) y puede integrarse en sistemas de chat para traducir conversaciones multi-turno entre agentes japoneses e ingleses en tiempo real.
- Traduccion de resenas y feedback de usuarios: entrenado con resenas de usuarios de WMT23, es adecuado para procesar grandes volumenes de opiniones de clientes en plataformas de e-commerce, facilitando el analisis de sentimiento multilingue.
- Traduccion medica y legal: el conjunto de evaluacion incluye EJMMT medical y court interpreting, lo que indica capacidad para traducir textos medicos y legales con precision, aunque requiere supervision humana en entornos regulados.
- Traduccion de manga y contenido literario: el modelo fue evaluado en OpenMantra manga pages y WMT24++ paragraphs literarios, por lo que puede asistir en la traduccion de dialogos y narraciones con contexto multi-frase.
- Despliegue en dispositivos Apple: la variante MLX 4-bit de 1.9 GB permite ejecutar traduccion japones-ingles en Macs con Apple Silicon sin conexion a internet, ideal para aplicaciones de productividad personal.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con CAT-Translate (0.8B, 1.4B, 3.3B, 3.3B-β, 7B) y con las variantes rikai 1.4B y .8B. La tabla siguiente recoge los datos de la model card:

| Metrica | rikai 3.3B α | rikai 1.4B | rikai .8B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | 0.8458 | 0.8425 | 0.8384 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | 2.67 | 2.75 | 2.85 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | 3.00 | 3.16 | 3.34 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, COMET-22 ↑ | 0.8671 | 0.8632 | 0.8568 | 0.8455 | 0.8513 | 0.8582 | 0.8616 | 0.8645 |
| 26-domain gate, BLEU ↑ | 24.66 | 23.88 | 22.02 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | 39.48 | 38.33 | 36.88 | 35.62 | 35.31 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | 0.8063 | 0.8081 | 0.8020 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE ↑ | 0.8715 | 0.8684 | 0.8586 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | 0.8482 | 0.8475 | 0.8436 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |
| LLM judge (Sonnet 5.5), 0–100 ↑ | 73.4 | 66.9 | 60.3 | 58.5 | 60.6 | 70.4 | 71.6 | 73.4 |
| LLM judge, errores criticos ↓ | 2.0% | 3.8% | 6.2% | 7.4% | 7.8% | 3.2% | 2.0% | 1.4% |
| Velocidad decodificacion (M4 Pro, MLX 8-bit) ↑ | 61 tok/s | 147 tok/s | 217 tok/s | 218 tok/s | 146 tok/s | 61 tok/s | 61 tok/s | 28 tok/s |

Ademas, el autor reporta que el modelo supera a CAT-Translate-3.3B en todas las metricas automaticas a la misma velocidad de decodificacion, y que iguala o supera a CAT-Translate-7B en muchas metricas con 2.2 veces su velocidad de decodificacion. En la evaluacion con LLM juez, el modelo obtiene 73.4 puntos, empatando con CAT-7B, y un 2.0% de traducciones con error critico, frente al 1.4% de CAT-7B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6.7 GB (peso del modelo) mas overhead de activaciones, por lo que se recomienda al menos 8-10 GB de VRAM.
- VRAM estimada en MLX 8-bit: 3.6 GB; en MLX 4-bit: 1.9 GB; en GGUF Q8_0: 3.6 GB; en GGUF Q4_K_M: 2.1 GB.
- GPU recomendadas: para fp16, NVIDIA A100, H100 o RTX 4090 (24 GB); para cuantizaciones 8-bit o 4-bit, RTX 3060 (12 GB) o superior, y Apple Silicon (M1/M2/M3/M4) via MLX.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con fp16 (ajustado) o con cuantizacion 8-bit/4-bit; en RTX 4060 Ti 16 GB sin problemas; en Apple Silicon con MLX 4-bit (1.9 GB) en cualquier Mac con 8 GB de RAM unificada.
- Opciones de despliegue: transformers (fp16), MLX (Apple Silicon), llama.cpp (GGUF), text-generation-inference (TGI) segun los tags del repositorio; Ollama no esta documentado explicitamente pero es compatible via GGUF.
- Latencia y throughput: 61 tok/s en M4 Pro con MLX 8-bit; 28 tok/s para CAT-7B en el mismo hardware. No se dispone de datos de throughput en GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | CometKiwi (26-domain) | LLM judge | Velocidad (M4 Pro, 8-bit) |
|---|---|---|---|---|---|---|
| rikai jp<->eng Bench 265 3.3B α | 3.355B | no disponible | MIT | 0.8458 | 73.4 | 61 tok/s |
| CAT-Translate-3.3B | 3.3B | no disponible | no disponible | 0.8430 | 71.6 | 61 tok/s |
| CAT-Translate-7B | 7B | no disponible | no disponible | 0.8430 | 73.4 | 28 tok/s |
| TranslateGemma-4B | 4B | no disponible | no disponible | no disponible | 63.7 | no disponible |
| HY-MT1.5-1.8B | 1.8B | no disponible | no disponible | no disponible | 58.0 | no disponible |

El modelo se posiciona como la opcion mas eficiente de su categoria: iguala a CAT-7B en LLM judge y CometKiwi con la mitad de parametros y el doble de velocidad de decodificacion, y supera a CAT-3.3B en todas las metricas automaticas. Frente a alternativas mas pequenas como HY-MT1.5-1.8B o TranslateGemma-4B, el modelo ofrece mejor calidad de traduccion segun el LLM juez.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en traduccion japones-ingles; no es un modelo de proposito general y carece de capacidades de razonamiento, codigo o tool calling.
- La longitud de contexto no esta documentada; para documentos muy largos puede requerir segmentacion, lo que puede afectar a la coherencia de la traduccion.
- Riesgo de alucinacion inherente a los modelos generativos: aunque el LLM juez reporta solo un 2.0% de errores criticos, en dominios especializados (medico, legal) se recomienda supervision humana.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse en dominios como noticias, resenas y dialogos empresariales, puede reflejar sesgos presentes en esos datos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base CAT-Translate-3.3b podria tener condiciones adicionales no especificadas en la model card; se recomienda verificar la licencia del modelo base.
- El rendimiento en idiomas distintos de japones e ingles no esta soportado ni evaluado.
- La evaluacion se realizo principalmente con decodificacion greedy y mascara de prefijo; el uso de otras estrategias de decodificacion puede alterar los resultados.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que indica que es un lanzamiento muy reciente con validacion externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-3.3B-alpha
- Variante 1.4B: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B
- Variante 0.8B: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B
- Modelo base CAT-Translate-3.3b: https://huggingface.co/cyberagent/CAT-Translate-3.3b
- Resultados por dominio: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-3.3B-alpha/blob/main/per_domain_results.md
- Paper referenciado (arXiv:2606.21413): https://arxiv.org/abs/2606.21413
