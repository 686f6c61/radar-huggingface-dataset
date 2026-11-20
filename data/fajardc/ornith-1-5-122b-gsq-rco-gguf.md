# fajardc/Ornith-1.5-122B-GSQ-RCO-GGUF

## Resumen

Ornith-1.5-122B-GSQ-RCO-GGUF es una cuantización comunitaria, realizada por el usuario fajardc, del modelo ornith-ai/Ornith-1.5-122B, un modelo de mezcla de expertos (MoE) de 122.111 millones de parámetros construido sobre la arquitectura Qwen3.5-122B-A10B, con aproximadamente 10.000 millones de parámetros activos por token. Esta ficha describe concretamente el artefacto GGUF cuantizado, no el modelo original en precisión completa.

El archivo emplea dos técnicas del DAS Lab del IST Austria: GSQ (Gumbel-Softmax Quantization), que refina los códigos enteros de cada tensor contra las activaciones reales que recibe, y RCO (Riemannian Constrained Optimization), que asigna un tipo de cuantización por tensor bajo un presupuesto exacto de tamaño minimizando la divergencia KL frente al modelo BF16. El resultado es una cuantización de precisión mixta de 53,45 GB (3,502 bits por peso) en la que los tensores fuera de los expertos enrutados se mantienen en Q6_K y los expertos reciben tipos entre IQ2_XS y Q4_K.

Su relevancia radica en que permite ejecutar un modelo MoE de 122B con 262.144 tokens de contexto en hardware de consumo de gama alta (el autor lo generó en un equipo con una RTX 3090 y una RTX 3070 Ti), manteniendo una divergencia KL media de 0,0488-0,1177 según dominio frente al modelo BF16. Es una cuantización no oficial, no publicada por el equipo de Ornith ni por el de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (MoE híbrida: 48 capas, 36 Gated DeltaNet + 12 de atención completa, 256 expertos, 8 activos + 1 compartido) |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | ~10B por token (variante A10B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Precisión mixta: IQ2_XS a Q4_K en expertos enrutados; Q6_K en el resto de tensores cuantizados; 3,502 bpw medios |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dos partes: `-00001-of-00002.gguf` y `-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El modelo base es una MoE sobre la arquitectura Qwen3.5-122B-A10B: 48 capas, de las cuales 36 son Gated DeltaNet (atención lineal con estado recurrente) y 12 son de atención completa, con 256 expertos por capa y 8 activos más 1 compartido. El checkpoint original incluye además un codificador de visión y una cabeza de predicción multi-token (MTP) para decodificación especulativa, ninguno de los cuales está presente en este archivo GGUF.

El proceso de cuantización parte del checkpoint original en BF16 y aplica GSQ para refinar los códigos enteros de cada tensor contra sus entradas reales, seguido de RCO para seleccionar el tipo de cada tensor bajo un presupuesto de 3,50 bits por peso, minimizando la KL del modelo completo. Las Hessianas se calcularon con el doble de tokens de calibración en la revisión de noviembre de 2026, y los pesos continuos (escalas de bloque, normas y routers) se ajustaron de extremo a extremo contra la salida del modelo BF16. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento y respuesta a instrucciones, según los dominios de evaluación reportados (Open-Platypus).
- Generación de código, con divergencia KL medida específicamente sobre código fuente C++ de llama.cpp.
- Procesamiento de imagen y texto (`image-text-to-text`), siempre que se cargue un proyector de visión (mmproj) GGUF externo, ya que este archivo no lo incluye.
- Decodificación especulativa mediante la cabeza MTP, disponible solo si se exporta por separado desde el checkpoint original y se carga con `-md` en `llama-server`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones o procesar documentos extensos (manuales, expedientes, bases de código) sin truncar, algo viable en un equipo con 64 GB de RAM y GPU de 24 GB gracias a los 53,45 GB del archivo y al offload parcial.
- Generación y revisión de código en local: la cuantización conserva una KL de 0,0488 y un 94,62 % de coincidencia en top-1 sobre código C++ de llama.cpp, por lo que es adecuada para autocompletado, refactorización y explicación de código en estaciones de trabajo sin acceso a la nube.
- Procesamiento de documentación técnica con imágenes: cargando un mmproj compatible (por ejemplo, el bf16 de bartowski), el modelo puede responder preguntas sobre capturas, diagramas y documentos escaneados junto a texto largo.
- Despliegue en servidor de inferencia local con llama.cpp: `llama-server` puede servir el modelo dividido en dos archivos y, opcionalmente, usar la cabeza MTP como draft para decodificación especulativa, reduciendo latencia en generación token a token.
- Evaluación e investigación de técnicas de cuantización: al documentar KL, tasa top-1 y ratio de perplejidad por dominio, el archivo sirve como referencia reproducible para comparar GSQ-RCO frente a cuantizaciones uniformes IQ3_S.
- Prototipado de agentes y automatizaciones: el tamaño del modelo y su contexto permiten construir pipelines de razonamiento multi-paso sobre repositorios o corpus largos en hardware de una sola máquina, aunque el soporte explícito de tool calling no está documentado.
- Fine-tuning o experimentación educativa: al ser MIT y GGUF, puede usarse como base para experimentos de inferencia en entornos académicos con GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad frente al modelo BF16, medidas sobre 100 fragmentos de 512 tokens por dominio, con dominios excluidos de calibración y ajuste:

| Dominio | KL media | Misma top-1 | Ratio de perplejidad vs BF16 |
|---|---|---|---|
| WikiText-2 test (prosa enciclopédica) | 0,1177 | 87,03 % | 0,938 |
| Código fuente C++ (llama.cpp) | 0,0488 | 94,62 % | 0,985 |
| Open-Platypus, filas reservadas (instrucciones) | 0,0561 | 94,28 % | 0,964 |

La revisión del 11 de noviembre de 2026 mejoró la KL frente a la primera publicación: −8,8 % en WikiText-2, −12,0 % en C++ y −20,2 % en Open-Platypus. El autor advierte que el ratio de perplejidad inferior a 1 no implica superioridad sobre BF16, sino un efecto del ajuste de extremo a extremo.

## Requisitos de hardware

- Tamaño en disco: 53,45 GB (49,78 GiB) repartidos en dos archivos de 26,79 GB y 26,66 GB.
- VRAM estimada: el archivo completo no cabe en una GPU de consumo; se requiere offload a RAM del sistema. El autor lo generó con 64 GB de RAM, una RTX 3090 (24 GB) y una RTX 3070 Ti.
- GPU recomendadas: RTX 3090/4090 (24 GB) para offload parcial de capas; A100 40/80 GB o H100 para carga completa en GPU.
- Cabe en GPU de consumo: solo parcialmente, mediante offload de capas con llama.cpp; no cabe entero en ninguna GPU de consumo actual.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de los dos archivos divididos, mmproj externo para visión y draft MTP con `-md`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| fajardc/Ornith-1.5-122B-GSQ-RCO-GGUF | 122B totales, ~10B activos | 262.144 | GGUF mixto, 53,45 GB | MIT | Cuantización comunitaria con GSQ-RCO; sin visión ni MTP incluidos |
| ornith-ai/Ornith-1.5-122B | 122B totales, ~10B activos | 262.144 | BF16 (original) | MIT | Modelo base; incluye visión y MTP; requiere hardware de laboratorio |
| bartowski/Ornith-1.5-122B-GGUF | 122B totales, ~10B activos | 262.144 | GGUF (cuantizaciones estándar) | MIT | Cuantización alternativa; proporciona mmproj bf16 compatible con este archivo |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF GSQ-RCO | no disponible | Referencia metodológica citada por el autor, no un modelo comparable directo |

## Limitaciones y advertencias

- Cuantización no oficial: no está publicada por el equipo de Ornith, el de Qwen ni el IST Austria; cualquier problema de calidad debe atribuirse al cuantizador.
- Sin visión ni MTP en el archivo: para entrada de imágenes hace falta un mmproj externo y para decodificación especulativa un draft GGUF exportado aparte.
- Divergencia respecto a BF16 no nula: entre el 5,4 % y el 13 % de los tokens no coinciden en top-1 según dominio, con mayor degradación en prosa enciclopédica (KL 0,1177) que en código o instrucciones.
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones de veracidad en la información disponible.
- Idiomas soportados no documentados: no hay lista oficial de idiomas en esta ficha ni en la model card.
- Sesgos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del modelo base y de cualquier mmproj de terceros cargado junto al modelo.
- Requisitos de memoria: con 53,45 GB en disco y offload parcial, el rendimiento depende críticamente del ancho de banda de RAM y del número de capas descargadas a CPU.
- Compatibilidad de herramientas: solo se documenta llama.cpp; otros motores de inferencia no están verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fajardc/Ornith-1.5-122B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Referencia metodológica GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Proyector de visión alternativo: https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Paper GSQ (arXiv:2405.14852): https://arxiv.org/abs/2405.14852
- Paper RCO (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper adicional citado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
