# DuoNeural/RMSN-193M-Soliton-Reasoning-SFT

## Resumen

RMSN-193M-Soliton-Reasoning-SFT es un modelo de lenguaje de 243.732.144 parámetros (etiquetado comercialmente como "193M") desarrollado por DuoNeural AI Laboratory, un laboratorio independiente de investigación en IA. Se presenta como el primer modelo de razonamiento ajustado por fine-tuning construido sobre una arquitectura de solitón disipativo profundo, denominada Resonant Metriplectic Sheaf Network (RMSN), que combina dinámica port-hamiltoniana, mecánica metripléctica y teoría de haces (sheaf theory) para imponer estabilidad de Lyapunov como invariante estructural del operador directo.

El modelo parte de una base preentrenada con WikiText-103 durante 100.000 pasos y se ajusta posteriormente con 5.000 pasos de SFT sobre trazas de razonamiento del dataset CDM v4 (variante "hard"), con una tasa de aprendizaje de 2e-5. Su propuesta diferencial no es el rendimiento bruto, sino la afirmación de que la geometría del atractor tipo solitón permanece invariante durante el fine-tuning, lo que el autor denomina "forgetting shield" o inmunidad al olvido catastrófico.

La relevancia del modelo es fundamentalmente de investigación: explora si una arquitectura con restricciones termodinámicas explícitas puede retener capacidades de razonamiento sin degradar su dinámica interna. Con 512 tokens de contexto, vocabulario de 49.152 (tokenizador cosmo2) y licencia MIT, su utilidad práctica en producción es muy limitada frente a transformers convencionales del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), port-hamiltoniana con estructura metripléctica |
| Parametros totales | 243.732.144 (según safetensors); ~193M declarados en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato PyTorch `.pt`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.pt`); safetensors como tag del repo |

Otros datos técnicos declarados: dimensión 1024, profundidad 16, 64 slots de memoria, vocabulario de 49.152 tokens (tokenizador `HuggingFaceTB/cosmo2-tokenizer`), perplejidad de validación 70,3, Lyapunov máximo de validación -11,2547 y mejor pérdida SFT de 1,7402.

## Arquitectura y entrenamiento

RMSN se define mediante la ecuación de evolución $\dot{f} = \{f, H\} + [f, S]$, donde el corchete de Poisson modela la dinámica conservativa hamiltoniana y el corchete de Morrison introduce disipación termodinámicamente consistente ($\dot{S} \ge 0$). La estabilidad de Lyapunov no se aplica como regularizador, sino que se afirma como invariante estructural del operador. Los componentes principales son: CliffordStalkBundle (representaciones de tokens como multivectores $\mathcal{C}\ell_{3,0}$ sobre haces celulares), ParallelMetriplecticScan (scan paralelo de coste $O(\log T)$ con actualización $h_t = \exp((-\gamma_t + i\omega_t)\Delta t)h_{t-1} + u_t \Delta t$), FractionalCaputoBank (memoria de orden fraccionario aprendida con $\alpha \in (0,1)$), CausalTrophicGlobalWorkspace (enrutamiento competitivo winner-take-most sobre M=64 slots) y Noether Stress-Energy Readout (invariantes conservados que proyectan al espacio de logits).

El entrenamiento consta de dos fases: preentrenamiento sobre WikiText-103 durante 100.000 pasos y SFT de 5.000 pasos sobre trazas de razonamiento "hard" del dataset CDM v4 con lr=2e-5. No se documenta uso de RLHF ni DPO. La model card describe "eventos de cascada de Lyapunov" espontáneos durante el preentrenamiento, con un umbral de percolación estimado entre 155M y 159M parámetros, por debajo del cual se observan ondas discretas limpias y por encima una meseta caótica sostenida. Durante el SFT, el exponente de Lyapunov se mantuvo entre -10,6 y -12,74 en los 5.000 pasos (incluido el suelo de lr=2e-6), terminando en -11,81. No se especifica la composición detallada del dataset CDM ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés con contexto máximo de 512 tokens.
- Razonamiento matemático y trazas de razonamiento aprendidas vía SFT (pérdida reducida de 6,0 a 1,74 durante el ajuste).
- Modelado de lenguaje general adquirido en el preentrenamiento sobre WikiText-103.
- Memoria de largo alcance dentro de la ventana de contexto mediante el banco de Caputo de orden fraccionario.
- Enrutamiento competitivo de información a través de 64 slots de memoria (CausalTrophicGlobalWorkspace).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado.
- No se documenta capacidad multilingüe: solo inglés.
- No dispone de visión, audio ni modo "thinking" explícito.
- No se documenta decodificación especulativa ni optimizaciones de inferencia equivalentes.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar si las restricciones metriplécticas y la estabilidad de Lyapunov estructural afectan a la calidad del modelado de lenguaje frente a un transformer de ~200M parámetros.
- Estudio del olvido catastrófico: la afirmación de "forgetting shield" permite diseñar experimentos controlados de fine-tuning sobre la base RMSN-193M-Base-Soliton y comparar la retención de capacidades con modelos convencionales del mismo tamaño.
- Análisis de dinámica de entrenamiento: los eventos de cascada de Lyapunov y la ley de percolación en torno a 155M-159M parámetros son objeto de estudio directo mediante réplicas de preentrenamiento a distintas escalas.
- Prototipado de razonamiento matemático de corta longitud: con 512 tokens de contexto, encaja en tareas de aritmética y problemas de pocos pasos donde la traza completa cabe en la ventana, siempre como validación académica y no como servicio.
- Reproducibilidad de investigación: la licencia MIT y la publicación del código en GitHub permiten replicar el pipeline de preentrenamiento y SFT en entornos académicos con presupuesto reducido.
- Docencia y divulgación técnica: ilustra de forma tangible conceptos de mecánica hamiltoniana, corchetes de Poisson y estabilidad de Lyapunov aplicados a redes neuronales, con un modelo pequeño que cabe en una sola GPU consumer.
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes autónomos ni aplicaciones multilingües, por limitaciones de contexto, idioma y ausencia de soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento y validación: perplejidad de validación 70,3, Lyapunov máximo de validación -11,2547, Lyapunov final tras SFT -11,81 y mejor pérdida SFT de 1,7402. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los 243,7M de parámetros, más overhead de activaciones y del scan paralelo.
- VRAM estimada en fp16/bf16: en torno a 0,5 GB de pesos; no se distribuyen pesos en estos formatos de forma oficial.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter A100 y H100 sin aprovechar su capacidad.
- Despliegue: no compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura RMSN requiere la definición `rmsn_core.py` del repositorio de GitHub y una carga manual con `torch.load`.
- Tokenizador: requiere `HuggingFaceTB/cosmo2-tokenizer` de forma separada.
- Latencia y throughput: no disponibles. El scan paralelo de coste $O(\log T)$ sugiere parallelización sobre la dimensión temporal, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-193M-Soliton-Reasoning-SFT | 243,7M (declarado ~193M) | 512 | RMSN port-hamiltoniana | MIT | Pesos `.pt` + código en GitHub |
| GPT-2 small | 124M | 1024 | Transformer decoder | MIT | Pesos en HF, ecosistema estándar |
| GPT-2 medium | 355M | 1024 | Transformer decoder | MIT | Pesos en HF, ecosistema estándar |
| Qwen2.5-0.5B | 494M | 32.768 | Transformer decoder | Apache 2.0 | Pesos en HF, soporte vLLM/llama.cpp |

La comparación relevante es arquitectónica más que de rendimiento: no existen datos públicos que permitan situar a RMSN frente a transformers del mismo orden de magnitud en tareas estándar. Frente a GPT-2 small y medium, RMSN ofrece un contexto cuatro veces menor (512 frente a 1024), un ecosistema de inferencia prácticamente inexistente y ausencia de benchmarks publicados, a cambio de una propuesta de dinámica interna novedosa. Frente a Qwen2.5-0.5B, la diferencia en longitud de contexto es de dos órdenes de magnitud.

## Limitaciones y advertencias

- Contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de recuperación aumentada actuales.
- Entrenamiento exclusivamente en inglés; no se declara ni se evalúa soporte multilingüe.
- Perplejidad de validación de 70,3, alta en términos absolutos y coherente con un modelo pequeño entrenado sobre un corpus limitado (WikiText-103).
- Ausencia total de benchmarks estándar: no es posible verificar las capacidades de razonamiento más allá de la pérdida de SFT reportada por el autor.
- Las afirmaciones sobre "forgetting shield", cascadas de Lyapunov y leyes de percolación provienen únicamente de la model card y del material del autor; no hay publicaciones revisadas por pares que las respalden en la información disponible.
- Discrepancia entre el nombre comercial (193M) y el recuento real de safetensors (243,7M), que conviene tener en cuenta al planificar recursos.
- Riesgo de alucinación no cuantificado; con este tamaño y corpus de entrenamiento, se debe asumir un riesgo alto en producción.
- No hay soporte nativo en frameworks de inferencia estándar (vLLM, TGI, llama.cpp, Ollama), lo que obliga a mantener un harness propio.
- La licencia MIT permite uso comercial, pero la falta de evaluación y de garantías de calidad desaconseja cualquier despliegue en producción sin validación previa exhaustiva.
- Sesgos conocidos: no documentados, pero heredables de WikiText-103 (sesgo hacia texto enciclopédico en inglés).
- Fecha de creación declarada en el repositorio (2026-11-08) posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-Soliton-Reasoning-SFT
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub (código y harness de inferencia): https://github.com/DuoNeural/RMSN
- Script de generación: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Sitio web del laboratorio: https://duoneural.com/
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
