# DuoNeural/RMSN-180M-Base

## Resumen

RMSN-180M-Base es un modelo de lenguaje de tipo base (no instruido) desarrollado por DuoNeural AI Laboratory, un laboratorio independiente de investigación. Se presenta como el primer modelo de la familia Resonant Metriplectic Sheaf Network (RMSN), una arquitectura de secuencia neuronal de tipo Port-Hamiltonian fundamentada en termodinámica de no equilibrio. El modelo se posiciona explícitamente como un banco de pruebas de umbral de percolación: según la model card, 180M se sitúa en la densidad donde la longitud de correlación iguala la profundidad de la red (L=16), y su exponente de Lyapunov de validación cercano a cero (-0.0015) se interpreta como firma del efecto Casimir crítico en la transición del esqueleto de percolación.

El modelo tiene 220.655.088 parámetros reales según los pesos en safetensors (aunque la model card indica ~180M), una ventana de contexto de solo 512 tokens, un vocabulario de 49.152 entradas con el tokenizador cosmo2 y un valor de perplejidad de validación de 72,7. Se entrenó sobre WikiText-103 durante 100.000 pasos (204,8M tokens), lo que lo convierte en un modelo de escala muy reducida y de dominio limitado, orientado a investigación más que a producción.

Su relevancia es fundamentalmente experimental: propone una formulación donde la estabilidad de Lyapunov es un invariante estructural del operador directo y no un regularizador añadido, e introduce componentes poco habituales como haces celulares con álgebra de Clifford, un escaneo paralelo metripléctico de coste O(log T) y un banco de memoria fraccional de Caputo. No obstante, el ecosistema de uso es mínimo (0 descargas, 0 likes en el momento de la consulta) y la licencia MIT permite uso comercial sin restricciones formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltonian con haces celulares |
| Parametros totales | 220.655.088 (pesos safetensors); la model card indica ~180M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors y un checkpoint PyTorch) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.pt |

Otros datos declarados: vocabulario de 49.152 (tokenizador cosmo2), dim 960, profundidad 16, 64 slots, perplejidad de validación 72,7, Lyapunov de validación -0,0015, 100.000 pasos de entrenamiento sobre WikiText-103 (204,8M tokens), tamaño del repositorio 1,6 GB.

## Arquitectura y entrenamiento

La arquitectura RMSN se formula como un sistema dinámico Port-Hamiltoniano con estructura metripléctica: la evolución del estado sigue la ecuación $\dot{f} = \{f, H\} + [f, S]$, donde el corchete de Poisson representa la dinámica conservativa hamiltoniana y el corchete de Morrison introduce la disipación termodinámicamente consistente ($\dot{S} \ge 0$). La estabilidad de Lyapunov se presenta como invariante estructural del operador directo, no como término de regularización. Los componentes principales son un CliffordStalkBundle que representa tokens como multivectores de $\mathcal{C}\ell_{3,0}$ sobre haces celulares; un ParallelMetriplecticScan con recurrencia $h_t = \exp((-\gamma_t + i\omega_t)\Delta t)h_{t-1} + u_t \Delta t$ y coste O(log T); un FractionalCaputoBank de memoria fraccional de orden $\alpha \in (0,1)$; un CausalTrophicGlobalWorkspace con enrutamiento competitivo de 64 slots; y una lectura Noether Stress-Energy que proyecta invariantes conservados al espacio de logits.

El entrenamiento se realizó exclusivamente sobre WikiText-103 durante 100.000 pasos, lo que equivale a 204,8M tokens, una cifra muy por debajo de los estándares habituales incluso para modelos de este tamaño. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base. La model card describe fenómenos observados durante el preentrenamiento, como las "cascadas de Lyapunov" espontáneas (caídas bruscas de $\lambda_{\max}$) y un umbral de percolación estimado entre 155M y 159M parámetros, por debajo del cual aparecen ondas discretas limpias y por encima un plateau caótico sostenido.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline declarado `text-generation`.
- Modelado de lenguaje base: no está ajustado para seguir instrucciones ni para diálogo.
- Representación de secuencias con memoria de largo alcance mediante el banco de memoria fraccional de Caputo.
- Enrutamiento competitivo de información a través de 64 slots del espacio de trabajo global.
- Conservación de invariantes estructurales en la lectura final hacia logits (Noether Stress-Energy Readout).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas físicamente informadas: el modelo sirve como referencia reproducible para estudiar si la estabilidad de Lyapunov estructural mejora la dinámica de entrenamiento frente a transformers convencionales, usando WikiText-103 como corpus de control.
- Estudio de transiciones de fase en redes neuronales: el umbral de percolación documentado entre 155M y 159M parámetros permite diseñar experimentos de escalado controlado para verificar la ley empírica de cascadas de Lyapunov.
- Reproducción de resultados académicos: con licencia MIT y pesos en safetensors, un grupo de investigación puede replicar la perplejidad de validación de 72,7 y comparar la dinámica del operador con implementaciones propias.
- Prototipado de módulos de memoria recurrente: el ParallelMetriplecticScan con coste O(log T) puede extraerse como bloque reutilizable en arquitecturas híbridas, aunque requiere el código de `rmsn_core.py` del repositorio GitHub.
- Docencia y divulgación sobre mecánica metripléctica: el modelo es lo bastante pequeño (1,6 GB de pesos) para ejecutarse en un portátil y demostrar conceptos de corchetes de Poisson y Morrison en un contexto de aprendizaje automático.
- Pruebas de integración de tokenizadores alternativos: al usar el tokenizador cosmo2 de HuggingFaceTB, sirve para validar pipelines que necesiten vocabularios de 49.152 entradas fuera de los tokenizadores estándar de Llama o GPT-2.
- Generación de texto de dominio restringido: con contexto de 512 tokens y entrenamiento solo en WikiText-103, puede emplearse para completar pasajes enciclopédicos cortos en experimentos controlados, nunca en producción con usuarios reales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (WikiText-103) | 72,7 |
| Lyapunov maximo de validacion (λ_max) | -0,0015 |
| Tokens de entrenamiento | 204,8M (100.000 pasos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la información disponible. La única métrica de calidad reportada es la perplejidad de validación, sin comparación con líneas base del mismo tamaño en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,9 GB solo para pesos (220,7M parámetros × 4 bytes), más overhead de activaciones y del estado recurrente.
- VRAM estimada en fp16/bf16: aproximadamente 0,45 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en precisión reducida; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún cuello de botella.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El único harness de inferencia disponible es el script `generate.py` del repositorio GitHub de DuoNeural, que requiere cargar el checkpoint `pytorch_model.pt` y la definición `rmsn_core.py`.
- Latencia y throughput estimados: no disponibles. La arquitectura declara un escaneo paralelo O(log T), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-180M-Base | 220,7M (nominal 180M) | 512 | MIT | Perplejidad 72,7 en WikiText-103 | Pesos en HF, sin integración en frameworks estándar |
| GPT-2 small | 124M | 1.024 | MIT | Perplejidad ~29,4 en WikiText-103 (referencia habitual) | Integrado en transformers, ampliamente soportado |
| GPT-2 medium | 355M | 1.024 | MIT | Perplejidad ~22,8 en WikiText-103 (referencia habitual) | Integrado en transformers |
| Pythia-160M | 162M | 2.048 | Apache 2.0 | Benchmarks publicados por EleutherAI | Integrado en transformers |

La comparación con GPT-2 y Pythia es orientativa por tamaño y categoría (modelos base de lenguaje en inglés). RMSN-180M-Base parte con desventaja clara en contexto (512 frente a 1.024-2.048) y en volumen de entrenamiento (204,8M tokens frente a decenas o cientos de miles de millones), lo que se refleja en una perplejidad muy superior. Su interés no es competitivo sino arquitectónico.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue directivas, no mantiene diálogo coherente y no debe usarse como asistente tal cual.
- Entrenado únicamente sobre WikiText-103 (204,8M tokens): cobertura léxica y factual muy limitada, con alta probabilidad de alucinación fuera del dominio enciclopédico.
- Ventana de contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones reales de RAG o análisis documental.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Perplejidad de validación de 72,7, muy por encima de modelos de tamaño comparable con más datos de entrenamiento.
- Sin soporte documentado en vLLM, llama.cpp, Ollama o TGI; la integración requiere código propio del repositorio GitHub, lo que añade riesgo de mantenimiento.
- El número de parámetros real (220,7M) difiere del nominal de la model card (~180M), lo que puede afectar a estimaciones de memoria y a la reproducibilidad de los experimentos de escalado.
- Las afirmaciones sobre cascadas de Lyapunov y efecto Casimir crítico provienen únicamente de la model card del autor y no se han verificado de forma independiente en la información disponible.
- Licencia MIT: permite uso comercial y modificación sin restricciones formales, pero no hay garantía de calidad ni soporte; el uso en producción con usuarios reales no está recomendado.
- Ecosistema mínimo (0 descargas, 0 likes en la consulta): sin comunidad, sin issues documentadas y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-180M-Base
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Script de inferencia: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Sitio web del laboratorio: https://duoneural.com/
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
