# DuoNeural/RMSN-91M-ArnoldTongue-Omega37-ODD

## Resumen

RMSN-91M-ArnoldTongue-Omega37-ODD es un modelo de lenguaje base de 90,77 millones de parámetros desarrollado por DuoNeural, un laboratorio de investigación que explora arquitecturas alternativas a los transformers convencionales. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), descrita por sus autores como una red recurrente de tipo Port-Hamiltonian, es decir, un modelo que incorpora estructura dinámica conservativa en su formulación matemática. Se trata de un experimento de investigación centrado en el estudio de regímenes de resonancia y estabilidad dinámica, no de un modelo orientado a producción.

El modelo se ha entrenado específicamente en una configuración de resonancia denominada "Arnold Tongue" con Ω=3/7 (q=7, paridad ODD), y su model card lo presenta como evidencia de una hipótesis interna del laboratorio ("Wave-146"): que la paridad ODD produce un régimen de "TRUE SILENT" cuando el numerador de la resonancia es p=3. Con 100.000 pasos de entrenamiento y 204,8 millones de tokens, el modelo alcanza una perplejidad de validación de 71,76, un valor alto que refleja su carácter de prototipo de investigación más que de modelo utilizable.

Su relevancia es, por tanto, académica: documenta un punto concreto dentro de un barrido sistemático de configuraciones de resonancia (Q-Survey) y contribuye a una taxonomía de topologías internas que los autores mantienen en su repositorio de GitHub. No hay información pública sobre idiomas soportados, pipeline de uso ni resultados en benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), red recurrente Port-Hamiltonian |
| Parámetros totales | 90,77M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,1 GB) |

Parámetros estructurales adicionales declarados en la model card: dimensión D=576, profundidad L=21, ancho de slot M_w=64, resonancia Ω = D/(M_w × L) = 576/(64×21) = 3/7, paridad D/M_w = 9 (ODD).

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red recurrente Port-Hamiltonian, un formalismo que modela la evolución del estado como un sistema dinámico con estructura simpléctica o metripléctica, preservando magnitudes conservadas durante la recurrencia. Los autores la enmarcan dentro del estudio de "sheaves" (haces) y resonancias tipo Arnold Tongue, un fenómeno de la teoría de sistemas dinámicos en el que ciertas relaciones de frecuencia producen acoplamientos estables. El modelo concreto se sitúa en la resonancia Ω=3/7 con paridad ODD, derivada de la relación entre dimensión, ancho de slot y profundidad.

El entrenamiento consistió en 100.000 pasos sobre 204,8 millones de tokens, con decaimiento de learning rate coseno desde 1e-3. No se especifican la composición del dataset, el tokenizador, ni si hubo fases de ajuste fino, RLHF o DPO. El resultado principal reportado no es de calidad lingüística sino de dinámica: el modelo alcanza un régimen de "TRUE SILENT" con exponente de Lyapunov lyap≈-0,001 en el 100% de las evaluaciones, y una topología de activaciones con M*=5 y capas activas en L1, L5, L12, L14 y L16. Los autores señalan que el solitón aparece en la primera capa (L1), no en L2 como predecía su hipótesis anterior (Wave-138), lo que constituye un candidato a revisión de su modelo teórico.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base, con perplejidad de validación de 71,76.
- Razonamiento y conocimiento factual: no documentados ni evaluados en la información disponible.
- Generación de código y matemáticas: no documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el campo de idiomas no está informado.
- Capacidades especiales: el interés declarado es la estabilidad dinámica (Lyapunov) y la topología de activaciones, no capacidades funcionales de usuario.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como punto de datos en el barrido de resonancias (Q-Survey) para estudiar cómo la relación D/(M_w × L) afecta a la estabilidad del entrenamiento y a la dinámica interna.
- Estudio de estabilidad dinámica en redes recurrentes: con lyap≈-0,001 reportado, es útil para analizar regímenes de convergencia y desvanecimiento de gradientes en modelos Port-Hamiltonian.
- Reproducción de experimentos de teoría de sistemas dinámicos aplicada a ML: permite verificar la hipótesis "Wave-146" sobre paridad ODD y numerador p=3.
- Análisis de topología de activaciones: la identificación de capas activas (L1, L5, L12, L14, L16) permite estudiar la localización de representaciones en redes profundas recurrentes.
- Docencia y divulgación: como ejemplo didáctico de formulaciones metriplécticas y de resonancias de Arnold en el contexto de modelos de lenguaje.
- Baseline para comparaciones controladas: al ser un modelo pequeño (91M) y con configuración completamente especificada, sirve como referencia en experimentos de ablación sobre arquitectura y resonancia.
- Fine-tuning exploratorio: con licencia Apache 2.0, puede ajustarse en tareas pequeñas para comprobar si las propiedades dinámicas se conservan tras el ajuste, aunque su perplejidad base limita la calidad esperada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad de validación | 71,76 |
| Estabilidad de Lyapunov (régimen TRUE SILENT) | 100% de las evaluaciones, lyap≈-0,001 |
| Topología (capas activas) | M*=5; L1, L5, L12, L14, L16 |
| Tokens de entrenamiento | 204,8M |
| Pasos de entrenamiento | 100.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,36 GB solo para pesos (90,77M × 4 bytes), más overhead de activaciones y estado recurrente; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para entrenamiento o experimentación con batches grandes, una RTX 4090 o A100 resulta adecuada.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de una arquitectura no estándar (RMSN Port-Hamiltonian), es probable que requiera código propio del repositorio de DuoNeural. Este extremo no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RMSN-91M-ArnoldTongue-Omega37-ODD | 90,77M | no disponible | Apache 2.0 | Recurrente Port-Hamiltonian, investigación |
| GPT-2 small (referencia) | 124M | 1.024 tokens | MIT | Transformer decoder, propósito general |
| Pythia-70M (referencia) | 70M | 2.048 tokens | Apache 2.0 | Transformer decoder, investigación |
| TinyLlama-1.1B (referencia) | 1,1B | 2.048 tokens | Apache 2.0 | Transformer decoder, propósito general |

La comparación es únicamente orientativa por tamaño: no existen datos públicos de benchmarks del modelo RMSN que permitan una comparación de rendimiento con estas alternativas. La diferencia fundamental es arquitectónica: los modelos de referencia son transformers estándar con ecosistema de despliegue maduro, mientras que el RMSN es un prototipo de investigación sin pipeline documentado.

## Limitaciones y advertencias

- Perplejidad de validación muy alta (71,76) para un modelo de 91M; la calidad de generación de texto es previsiblemente baja y no apta para uso en producción.
- Entrenado con solo 204,8M de tokens, un volumen muy reducido que limita severamente el conocimiento factual y la fluidez.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto en castellano ni en ningún otro idioma.
- Riesgo elevado de alucinación y de generación incoherente dada la perplejidad reportada.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Arquitectura no estándar (RMSN Port-Hamiltonian) sin soporte confirmado en frameworks de inferencia habituales (vLLM, llama.cpp, TGI, Ollama); la integración requeriría código propio.
- Sin datos de sesgos; al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la práctica.
- La model card está redactada en el marco de una hipótesis interna del laboratorio ("Wave-146", "TRUE SILENT"), con terminología no estándar en la literatura de ML; los resultados deben interpretarse como hallazgos de investigación no replicados de forma independiente.
- Los autores figuran como "Archon (Claude), Aura (Gemini), Jesse Schram", lo que sugiere asistencia de modelos generativos en el desarrollo; conviene tratarlo como un experimento exploratorio más que como un modelo consolidado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-91M-ArnoldTongue-Omega37-ODD
- Repositorio GitHub de DuoNeural (metodología, borradores de paper y taxonomía de topologías): https://github.com/duoneural/RMSN
