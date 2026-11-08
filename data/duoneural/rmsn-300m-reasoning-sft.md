# DuoNeural/RMSN-300M-Reasoning-SFT

## Resumen

RMSN-300M-Reasoning-SFT es un modelo de lenguaje de tipo text-generation publicado por DuoNeural AI Laboratory, un laboratorio independiente de investigación en IA. Se presenta como un ajuste fino supervisado (SFT) sobre una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), descrita por sus autores como una arquitectura neuronal de secuencias de tipo Port-Hamiltonian, fundamentada en termodinámica de no equilibrio. El modelo está orientado a razonamiento matemático y generación de texto en inglés, y se distribuye con licencia MIT.

El checkpoint contiene 351.033.012 parámetros reales según los pesos en safetensors, aunque la model card del autor declara aproximadamente 193M de parámetros, lo que supone una discrepancia notable entre la documentación y los artefactos publicados. La longitud de contexto declarada es de 512 tokens y el vocabulario es de 49.152 entradas, correspondiente al tokenizador cosmo2 de HuggingFaceTB. El entrenamiento combina un preentrenamiento sobre WikiText-103 con un ajuste fino SFT sobre 9.510 trazas de razonamiento verificadas con Qwen2.5-Math, con una pérdida final de 1,7108.

La relevancia del modelo es fundamentalmente experimental: propone un operador de avance con estabilidad de Lyapunov estructural, representaciones de tokens mediante haces celulares con álgebra de Clifford y un mecanismo de memoria fraccionaria de Caputo. No obstante, la información pública es escasa, el modelo no cuenta con descargas ni valoraciones en el momento de la ficha, y la integración con el ecosistema estándar (Transformers, vLLM) no está resuelta en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltonian con haces celulares y brackets de Poisson y Morrison |
| Parametros totales | 351.033.012 según safetensors; la model card declara ~193M (dato contradictorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en PyTorch, sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.pt (checkpoint PyTorch); tokenizador externo cosmo2 |
| Vocabulario | 49.152 (tokenizador cosmo2) |
| Dimension del modelo | dim 1024, profundidad 16, slots 64 |
| Tamano del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN se define mediante una ecuación de evolución del tipo $\dot{f} = \{f, H\} + [f, S]$, donde el bracket de Poisson representa dinámica conservativa hamiltoniana y el bracket de Morrison introduce disipación termodinámicamente consistente ($\dot{S} \ge 0$). La estabilidad de Lyapunov se presenta como un invariante estructural del operador de avance, no como un regularizador añadido durante el entrenamiento. Los componentes principales incluyen CliffordStalkBundle, que construye representaciones de tokens como multivectores en $\mathcal{C}\ell_{3,0}$ sobre haces celulares; ParallelMetriplecticScan, un escaneo paralelo de complejidad $O(\log T)$ con actualización $h_t = \exp((-\gamma_t + i\omega_t)\Delta t)h_{t-1} + u_t \Delta t$; FractionalCaputoBank, que modela memoria de orden fraccionario con exponente $\alpha \in (0,1)$; CausalTrophicGlobalWorkspace, un enrutamiento competitivo de slots con M=64; y una lectura Noether Stress-Energy que proyecta invariantes conservados al espacio de logits.

El entrenamiento consta de un preentrenamiento sobre WikiText-103 seguido de un ajuste fino SFT sobre 9.510 trazas de razonamiento verificadas con Qwen2.5-Math (denominadas CDM reasoning traces v4 hard). La tasa de aprendizaje del SFT fue de 2e-5, por debajo del umbral crítico $\alpha^* = 7e-5$ citado por los autores, y la mejor pérdida alcanzada fue de 1,7108. La model card afirma que el modelo mantuvo estabilidad de Lyapunov al 100 % durante el ajuste fino y describe fenómenos de "cascadas de Lyapunov" espontáneas durante el preentrenamiento, con un umbral de percolación estimado entre 155M y 159M de parámetros. No se documentan fases de RLHF ni DPO, ni se detalla la composición completa del corpus más allá de WikiText-103 y las trazas matemáticas.

## Capacidades

- Generación de texto autoregresiva en inglés con un contexto máximo de 512 tokens.
- Razonamiento matemático mediante ajuste fino supervisado sobre trazas verificadas de Qwen2.5-Math.
- Modelado de instrucciones y respuestas de tipo SFT, orientado a tareas de razonamiento paso a paso.
- Memoria de orden fraccionario (FractionalCaputoBank) que permite modelar dependencias de largo alcance dentro de la ventana de contexto.
- Enrutamiento competitivo de slots (CausalTrophicGlobalWorkspace) que actúa como mecanismo de atención dispersa sobre representaciones internas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá del SFT sobre trazas de razonamiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar dinámicas Port-Hamiltonian, estabilidad de Lyapunov estructural y memoria fraccionaria en modelos de lenguaje de pequeña escala, comparando su comportamiento con transformers convencionales del mismo tamaño.
- Experimentos de razonamiento matemático acotado: con 512 tokens de contexto y SFT sobre trazas de Qwen2.5-Math, puede emplearse para evaluar la calidad de cadenas de razonamiento cortas en problemas aritméticos y algebraicos simples dentro de entornos de investigación.
- Reproducción de resultados académicos: al publicarse los pesos y el código de arquitectura en GitHub, permite replicar las métricas de pérdida (1,7108) y los experimentos de cascada de Lyapunov descritos en la model card.
- Análisis de estabilidad numérica: útil para estudiar cómo se comportan los brackets de Poisson y Morrison en la práctica, y para validar empíricamente las afirmaciones sobre invariancia de Lyapunov en el operador de avance.
- Prototipado de tokenizadores alternativos: al usar el tokenizador cosmo2 con vocabulario de 49.152 entradas, sirve para evaluar la interacción entre tokenización y arquitecturas con haces celulares en tareas de generación corta.
- Docencia y divulgación técnica: como ejemplo didáctico de arquitecturas inspiradas en física (Port-Hamiltonian, metriplectic, haces celulares) aplicadas al modelado de secuencias, con un tamaño manejable para demostraciones en laboratorio.
- Generación de texto corto en inglés: para tareas de completado o resumen de fragmentos muy breves, siempre que se acepte la ventana de 512 tokens y la ausencia de optimizaciones de inferencia estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de ajuste fino (best loss = 1,7108) y afirmaciones cualitativas sobre estabilidad de Lyapunov, sin métricas en MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 351M de parámetros en fp32 se requieren aproximadamente 1,4 GB solo para pesos; en fp16 unos 0,7 GB; en int8 unos 0,35 GB. A ello hay que sumar el estado del escaneo paralelo, los slots (M=64) y las estructuras de haces, que incrementan el consumo real por encima de la estimación teórica.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar los pesos en fp16 (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o ajuste fino se recomienda al menos una RTX 4090 o A100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 4 GB o más, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: la model card solo documenta carga manual con `torch.load` y el tokenizador cosmo2; no se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-300M-Reasoning-SFT | 351M (declarado ~193M) | 512 | MIT | safetensors, .pt | Hugging Face, GitHub |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Hugging Face, ecosistema amplio |
| SmolLM2-360M | 360M | 8.192 | Apache 2.0 | safetensors, GGUF | Hugging Face, llama.cpp, transformers |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Hugging Face, ecosistema amplio |

La comparación con modelos de tamaño similar revela que RMSN-300M ofrece una ventana de contexto muy inferior (512 frente a 8.192 o 32.768 tokens) y carece de integración con el ecosistema estándar (no hay pesos GGUF ni soporte confirmado en Transformers). Su interés es principalmente de investigación arquitectónica, no de producción.

## Limitaciones y advertencias

- Discrepancia entre los parámetros declarados en la model card (~193M) y los reales en safetensors (351M), lo que dificulta la reproducibilidad y la planificación de recursos.
- Contexto muy limitado (512 tokens), insuficiente para la mayoría de aplicaciones prácticas de razonamiento o generación de código.
- Solo soporta inglés, sin capacidades multilingües documentadas.
- No se han publicado benchmarks estándar, por lo que no es posible evaluar su calidad frente a alternativas consolidadas.
- La carga del modelo requiere código de arquitectura personalizado (`rmsn_core.py` en GitHub) y no se integra de forma nativa con `transformers`, lo que complica su uso en producción.
- No hay pesos cuantizados (GGUF, AWQ, GPTQ) publicados, lo que limita el despliegue en entornos con recursos ajustados.
- Riesgo de alucinación inherente a un modelo de 351M entrenado con SFT sobre trazas matemáticas; no se documentan evaluaciones de fidelidad factual.
- Las afirmaciones sobre estabilidad de Lyapunov estructural y cascadas de Lyapunov provienen únicamente del autor y no han sido verificadas de forma independiente.
- Licencia MIT permite uso comercial, pero la falta de documentación sobre el dataset de SFT (trazas derivadas de Qwen2.5-Math) plantea dudas sobre la procedencia y las obligaciones de atribución de los datos de entrenamiento.
- El modelo tiene 0 descargas y 0 valoraciones en el momento de la ficha, sin evidencia de uso en la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-300M-Reasoning-SFT
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Script de inferencia: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- Sitio web de DuoNeural: https://duoneural.com/
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
