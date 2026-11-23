# dimitarpg13/semsimula-ladder-live-owt-d384-l4-none

## Resumen

semsimula-ladder-live-owt-d384-l4-none es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro del programa "SemSimula", una línea de trabajo que explora modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares en lugar de la atención estándar de los transformers. Este checkpoint concreto pertenece a la "Generación 3" del programa y constituye el brazo sin campo de intercambio (no-exchange) del mecanismo Fock-PARFLM con L=4 y gradientes vivos, entrenado sobre OpenWebText con un presupuesto de 532,48 millones de tokens.

El modelo resuelve un problema de investigación muy específico: evaluar si permitir que el gradiente de la pérdida fluya hacia tokens anteriores a través de los canales de contexto (Vφ y ξ), en lugar de detenerlo con fuentes "detached" como en la Generación 2, mejora la calidad del modelado. El resultado principal es una perplejidad de validación de 50,1 en OpenWebText (bloque 512), lo que supone una mejora del 30,2% frente a su gemelo de Generación 2 y elimina la inversión de profundidad que se observaba anteriormente (L=4 era peor que L=2 con fuentes detached).

Con 76,8 millones de parámetros, arquitectura sin atención y sin transformer, inferencia de memoria constante y licencia CC-BY-4.0, el modelo es relevante ahora como evidencia empírica en el debate sobre alternativas a la atención, aunque su naturaleza es puramente investigadora y no está pensado para producción. El autor declara paridad aproximada con un GPT-2 de referencia de 33,7 millones de parámetros (49,81 de perplejidad) al mismo presupuesto de tokens, con la advertencia de que el número de parámetros no está igualado y el baseline no está ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (conservative language model, no transformer, attention-free, basado en mecánica lagrangiana y potencial escalar anisotrópico gaussiano) |
| Parametros totales | 76,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque 512; el autor no declara ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se declara safetensors ni GGUF |
| Profundidad (L) | 4 |
| Dimensión del modelo (d) | 384 |
| Presupuesto de entrenamiento | 532.480.000 tokens (32.500 pasos × 32 × 512) |
| Dataset | Skylion007/openwebtext |
| Tamaño del repositorio | 0,6 GB |
| Descargas | 527 |
| Fecha de creación | 2026-10-03 |
| Última actualización | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo se inscribe en la familia PARFLM (Fock-PARFLM), una arquitectura no-transformer y sin atención en la que cada token se interpreta como una partícula en un espacio de Fock con registros virtuales. La dinámica se define mediante un potencial escalar Vθ(ξ, h) más un potencial de pares Vφ, y la fuerza sobre cada token es el gradiente de ese potencial en las coordenadas propias del token, con el contexto fijo, más la fuerza del canal inverso (reverse channel) de registro a token. La integración utiliza el esquema BAOAB (integrador de dinámica de Langevin) y una formulación geométrica riemanniana con métrica de Jacobi, lo que da lugar a inferencia de memoria constante. El potencial es anisotrópico gaussiano y el modelo incorpora "registros virtuales" y un canal inverso (reverse channel) que conecta registros con tokens.

La innovación de esta Generación 3 respecto a la Generación 2 es puramente en el paso backward: los parámetros `vphi_grad_path='live'` y `xi_grad_path='live'` en `model_parf_multixi.py` hacen que las fuentes de Vφ y la entrada de fuentes de la cabeza de score sean tensores vivos, de modo que el gradiente de la pérdida alcanza tokens anteriores a través de Vφ (como fuentes de pares) y de ξ (canales de contexto). En Generación 2 ambas fuentes se detachaban y los tokens anteriores nunca se entrenaban como contexto. El forward es idéntico al de su gemelo de Generación 2 (run 4). El entrenamiento usó exactamente el mismo corpus, tokenizador, lotes de validación y presupuesto de tokens que todos los brazos de Generación 2 y el GPT-2 de referencia. El autor reporta 0 fallos de watchdog, 0 picos de pérdida y una tasa de clip-hit del 0,5% (3 de 650 pasos registrados, norma máxima 1,96); el entrenamiento se realizó en dos sesiones de Colab, reanudando desde el checkpoint del paso 27.000 con estado del optimizador. No se especifica en la información disponible si hubo RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, con perplejidad de validación de 50,1 en OpenWebText a bloque 512.
- Modelado de lenguaje a nivel de token con contexto de 512 tokens en la evaluación declarada.
- Inferencia de memoria constante gracias a la formulación física (sin atención cuadrática ni caché KV clásica).
- Mecanismo Fock con registros virtuales y canal inverso (reverse channel) para propagar información de registros a tokens.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: solo inglés.
- No se declara modo "thinking", visión ni audio.
- No se declara capacidad de código ni matemáticas evaluada de forma específica.

## Casos de uso

- Investigación sobre alternativas a la atención: sirve como brazo experimental controlado para comparar el efecto de gradientes vivos frente a fuentes detached en arquitecturas conservativas, con presupuesto de tokens y datos idénticos a los demás brazos del programa.
- Reproducción de estudios de ablación pre-registrados: el modelo forma parte de una escalera (ladder) con predicciones congeladas antes de la extensión del entrenamiento, por lo que es útil para validar metodologías de pre-registro en machine learning.
- Estudio de eficiencia en inferencia: su naturaleza attention-free y de memoria constante permite analizar el coste de memoria frente a transformers de tamaño comparable en secuencias de 512 tokens.
- Benchmarking de modelos de lenguaje de pequeño tamaño: con 76,8 M de parámetros y perplejidad declarada, puede usarse como punto de comparación en experimentos de modelado de lenguaje a pequeña escala sobre OpenWebText.
- Docencia y divulgación: la formulación lagrangiana, el integrador BAOAB y la métrica de Jacobi lo convierten en un ejemplo didáctico de modelos físicamente informados aplicados a texto.
- Exploración de geometría riemanniana en NLP: útil para investigadores que quieran estudiar cómo la métrica de Jacobi y los potenciales anisotrópicos afectan a la dinámica de representaciones.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o tareas de razonamiento, dado que no hay evidencia declarada de tales capacidades.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Perplejidad (OpenWebText, bloque 512) | Ratio vs GPT-2 | Parámetros |
|---|---:|---:|---:|
| semsimula-ladder-live-owt-d384-l4-none (este modelo, Gen 3, L=4) | 50,10 | 1,006× | 76,8 M |
| semsimula-ladder-live-owt-d384-l2-none (Gen 3, L=2) | 53,12 | 1,066× | 76,8 M |
| semsimula-ladder-live-owt-d384-l2-attention-potential (Gen 3, L=2) | 54,21 | 1,088× | 77,4 M |
| semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk (Gen 3, L=2) | 52,90 | 1,062× | 77,4 M |
| semsimula-ladder-live-owt-d384-l2-none-norc (Gen 3, L=2) | 57,76 | 1,160× | 76,6 M |
| semsimula-ladder-owt-d384-l2-attention-potential-rglive (Gen 2 probe, L=2) | 61,11 | 1,227× | 77,4 M |
| semsimula-ladder-owt-d384-l2-attention (Gen 2, L=2) | 63,51 | 1,275× | 77,4 M |
| semsimula-ladder-owt-d384-l2-none (Gen 2, L=2) | 66,98 | 1,345× | 76,8 M |
| run 4 (Gen 2, L=4, fuentes detached) | 71,75 | 1,440× | 76,8 M |
| gpt2-matched (L=8) | 49,81 | 1,000× | 33,7 M |

Notas del autor: la perplejidad "settled" es la media de las tres últimas evaluaciones (50,05; 50,77; 49,48); la mejor y final fue 49,48 en el paso 32.500 y la ejecución seguía mejorando al final. La mejora del 30,2% frente al gemelo de Generación 2 se atribuye únicamente a la convención de gradiente. La paridad con el GPT-2 de referencia está dentro del ruido de evaluación (0,29 PPL frente a una oscilación de 1-3 PPL entre pasos), pero los parámetros no están igualados (2,3×, de los cuales unos 19 M corresponden a la cabeza de salida no atada), el baseline no está ajustado y es el doble de profundo (L=8), y se trata de una sola semilla. No se ha ejecutado un baseline con parámetros igualados. En el paso 3.000 la perplejidad era 119,77 frente a 138,94 de run 4 (−13,8%), dentro de la banda pre-registrada 112-135. La predicción pre-registrada era 52-63 y el valor real fue 50,10 (fallo por el lado bueno). Coste por paso: 3,12 s/paso frente a 1,64 s/paso del L=2. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 76,8 M de parámetros en precisión completa (fp32) el peso ronda los 0,3 GB, y en fp16/bf16 unos 0,15 GB, aunque el autor no declara requisitos oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizó en dos sesiones de Google Colab, lo que sugiere que cabe en GPUs de consumo tipo T4 o similares, pero no se especifica.
- Cabe en GPU de consumo: probablemente sí por tamaño de parámetros, pero no confirmado por el autor.
- Opciones de despliegue: la librería declarada es PyTorch; no se declara soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estos motores no son aplicables sin adaptación.
- Latencia y throughput: el autor reporta 3,12 s/paso de entrenamiento en su configuración de Colab; no se declara throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| semsimula-ladder-live-owt-d384-l4-none | 76,8 M | no disponible (evaluado a 512) | 50,10 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-live-owt-d384-l2-none | 76,8 M | no disponible (evaluado a 512) | 53,12 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-none (Gen 2) | 76,8 M | no disponible (evaluado a 512) | 66,98 | CC-BY-4.0 | Hugging Face |
| gpt2-matched (L=8) | 33,7 M | no disponible | 49,81 | no disponible en la información | Hugging Face |
| GPT-2 estándar | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con los otros brazos del mismo programa SemSimula, ya que comparten corpus, tokenizador, presupuesto de tokens y lotes de validación. Frente a alternativas externas, el autor solo aporta el baseline gpt2-matched, sin datos de GPT-2 estándar ni de otros modelos de tamaño similar en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Sesgos conocidos: no se declaran evaluaciones de sesgo; al entrenarse sobre OpenWebText (texto web en inglés) hereda los sesgos de ese corpus.
- Riesgo de alucinación: no evaluado; no se declaran métricas de fidelidad ni de factualidad.
- Limitaciones de idioma: solo inglés.
- Limitaciones de contexto: la evaluación se realiza a bloque 512; no se declara la longitud máxima de contexto soportada.
- Resultados no verificados: la perplejidad de 50,1 está marcada como `verified: false` en el model-index.
- Comparación no controlada: la paridad con GPT-2 se establece con parámetros no igualados (2,3×), baseline sin ajustar, doble profundidad y una sola semilla; el autor reconoce que no se ha ejecutado un baseline con parámetros igualados.
- Entrenamiento incompleto: la ejecución seguía mejorando al final del presupuesto de tokens.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero el carácter experimental del modelo desaconseja su uso en producción.
- Ecosistema limitado: al no ser un transformer, no es compatible con motores de inferencia estándar (vLLM, llama.cpp, TGI) sin trabajo de adaptación.
- Reproducibilidad: el entrenamiento se realizó en dos sesiones de Colab con reanudación desde checkpoint; no se declara disponibilidad del código de entrenamiento en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Colección Generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Brazo L=2 equivalente (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo attention_potential (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo attention_potential con routing endurecido (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Brazo conservative-only (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Brazo attention_potential con campo de intercambio vivo (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo attention (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo no-exchange (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Baseline gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
