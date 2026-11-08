# DuoNeural/RMSN-193M-Base-Soliton

## Resumen

RMSN-193M-Base-Soliton es un modelo de lenguaje de 243,7 millones de parámetros (etiquetado como "193M" por el autor) desarrollado por DuoNeural AI Laboratory, un laboratorio independiente de investigación en IA. El modelo implementa una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), descrita por sus autores como una red de secuencias de tipo Port-Hamiltoniano fundamentada en termodinámica de no equilibrio, con estabilidad de Lyapunov tratada como invariante estructural del operador directo en lugar de como regularizador.

El modelo se presenta como un "solitón disipativo profundo" y su model card destaca métricas poco convencionales, como un exponente de Lyapunov máximo de -11,2547, que el autor describe como un récord del laboratorio asociado a un evento de ruptura espontánea de simetría. Está entrenado sobre WikiText-103 durante 100.000 pasos (204,8 millones de tokens), con una longitud de contexto de 512 tokens y un vocabulario de 49.152 entradas mediante el tokenizador cosmo2.

Su relevancia es fundamentalmente de investigación: propone un marco arquitectónico alternativo (corchetes de Poisson y de Morrison, haces celulares, memoria fraccionaria de Caputo y un espacio de trabajo global con enrutamiento competitivo) en lugar de optimizar el transformer estándar. No obstante, el modelo es de publicación muy reciente, sin descargas ni validación externa en el momento de redactar esta ficha, y su uso en producción no está respaldado por benchmarks convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltoniana con corchetes de Poisson y Morrison |
| Parámetros totales | 243.732.144 (según safetensors); ~193M según la model card |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en `pytorch_model.pt`) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.pt`); no se publican safetensors pese a la etiqueta del repo |
| Vocabulario | 49.152 (tokenizador cosmo2) |
| dim / depth / slots | 1024 / 16 / 64 |
| Datos de entrenamiento | WikiText-103, 100.000 pasos, 204,8M tokens |
| Perplejidad de validación | 70,3 |
| Lyapunov máximo (λ_max) | -11,2547 |

## Arquitectura y entrenamiento

La arquitectura RMSN se formula como una ecuación de evolución con dos componentes: un corchete de Poisson `{f, H}` que aporta dinámica hamiltoniana conservativa y un corchete de Morrison `[f, S]` que introduce disipación termodinámicamente consistente (producción de entropía no negativa, Ṡ ≥ 0). Sobre esta base, el modelo incorpora cinco componentes declarados: un CliffordStalkBundle con representaciones de tokens en multivectores Cℓ₃,₀ sobre haces celulares; un ParallelMetriplecticScan con recurrencia `h_t = exp((-γ_t + iω_t)Δt)h_{t-1} + u_t Δt` y coste O(log T); un FractionalCaputoBank de memoria fraccionaria de orden α ∈ (0,1); un CausalTrophicGlobalWorkspace con enrutamiento competitivo winner-take-most sobre M=64 slots; y una lectura Noether Stress-Energy que proyecta invariantes conservados al espacio de logits.

El entrenamiento se realizó sobre WikiText-103 durante 100.000 pasos, lo que equivale a 204,8 millones de tokens, un volumen muy reducido para un modelo de 243M de parámetros y que explica un ajuste limitado al dominio de WikiText. La model card describe "eventos de cascada de Lyapunov" espontáneos durante el preentrenamiento, con un umbral de percolación estimado entre 155M y 159M de parámetros, y afirma que el valor final de λ depende de la historia completa de cascadas. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base de modelado de lenguaje.

## Capacidades

- Modelado de lenguaje autoregresivo y generación de texto en inglés.
- Razonamiento secuencial con memoria de largo alcance modelada mediante un banco de memoria fraccionaria de Caputo.
- Procesamiento paralelo de secuencias con coste logarítmico en la longitud (ParallelMetriplecticScan), orientado a eficiencia en secuencias largas dentro de la ventana de 512 tokens.
- Enrutamiento competitivo de información mediante un espacio de trabajo global de 64 slots (CausalTrophicGlobalWorkspace).
- Representaciones token en álgebra de Clifford (multivectores Cℓ₃,₀) sobre haces celulares.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad de chat o instrucciones: no disponible; es un modelo base sin ajuste conversacional.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar dinámicas Port-Hamiltonianas y metriplécticas en modelado de lenguaje, comparando perplejidad y estabilidad frente a transformers de tamaño similar.
- Estudio de estabilidad de Lyapunov en redes neuronales: la λ_max publicada y el fenómeno de cascadas de Lyapunov permiten analizar transiciones de fase termodinámicas durante el entrenamiento y su relación con el tamaño del modelo (umbral de percolación entre 155M y 159M).
- Experimentos de memoria de largo alcance: el FractionalCaputoBank permite investigar leyes de potencia de memoria fraccionaria en tareas de modelado de lenguaje con dependencias extensas dentro de los 512 tokens de contexto.
- Reproducción de resultados de laboratorio: con licencia MIT y pesos PyTorch, un grupo de investigación puede reproducir la perplejidad de validación de 70,3 sobre WikiText-103 y verificar las afirmaciones de la model card.
- Prototipado educativo: modelo pequeño (1,7 GB de repo) que cabe en GPU de consumo y permite experimentar con haces celulares y álgebra de Clifford sin infraestructura dedicada.
- Generación de texto experimental en inglés: uso como modelo base para completar texto en dominio WikiText, con expectativas ajustadas a su perplejidad y a su ventana de 512 tokens.
- Base para ajuste fino académico: al ser un modelo base con licencia permisiva, puede servir de punto de partida para experimentos de ajuste supervisado en tareas de nicho, siempre que se valide su calidad frente a alternativas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta perplejidad de validación (70,3) y el exponente de Lyapunov máximo (-11,2547) sobre WikiText-103; no hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los 243,7M de parámetros (4 bytes por parámetro), más overhead de activaciones y del estado recurrente.
- VRAM estimada en fp16/bf16: en torno a 0,5 GB de pesos, más activaciones; el modelo cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o ajuste fino conviene una A100 o H100 por comodidad, aunque no es imprescindible por tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer con 4 GB o más.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es propietaria y requiere la definición `rmsn_core.py` del repositorio de GitHub del autor. El despliegue pasa por cargar `pytorch_model.pt` con PyTorch y el arnés de inferencia `generate.py` del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|
| RMSN-193M-Base-Soliton | 243,7M (nominal 193M) | 512 | MIT | PyTorch (.pt) | Solo perplejidad (70,3) y λ_max |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF | Perplejidad WikiText-103 ~29,4 (referencia habitual) |
| GPT-2 medium | 355M | 1024 | MIT | safetensors, GGUF | Perplejidad WikiText-103 ~26,9 (referencia habitual) |
| Pythia-410M | 410M | 2048 | Apache 2.0 | safetensors | Suite completa de evaluación pública |

La comparación directa es difícil: los transformers estándar de tamaño similar reportan perplejidades de validación en WikiText-103 sustancialmente menores y cuentan con ecosistema de despliegue (safetensors, GGUF, vLLM). RMSN-193M-Base-Soliton no ofrece cifras equivalentes más allá de su perplejidad declarada, y su interés es arquitectónico más que de rendimiento.

## Limitaciones y advertencias

- Ventana de contexto muy corta (512 tokens), insuficiente para la mayoría de aplicaciones de producción actuales.
- Entrenamiento limitado a WikiText-103 (204,8M tokens), lo que restringe el conocimiento del mundo y favorece el sobreajuste al dominio enciclopédico de Wikipedia.
- Solo inglés declarado; sin capacidades multilingües verificadas.
- Perplejidad de validación de 70,3, alta en comparación con transformers de tamaño similar, lo que sugiere calidad de generación limitada.
- Modelo base sin ajuste por instrucciones ni preferencias (sin RLHF/DPO documentado); no es adecuado como asistente conversacional directo.
- No hay soporte en frameworks de inferencia estándar (vLLM, llama.cpp, TGI, Ollama); requiere código propietario del repositorio del autor.
- Los pesos se distribuyen como `pytorch_model.pt` (pickle de PyTorch), lo que implica riesgos de seguridad al cargarlos; no se ofrecen safetensors pese a la etiqueta del repositorio.
- Las afirmaciones de la model card (cascadas de Lyapunov, umbral de percolación, récord de laboratorio) no están respaldadas por publicaciones revisadas por pares ni por benchmarks independientes en la información disponible.
- Sin descargas ni validación de la comunidad en el momento de la ficha; riesgo de que el modelo no funcione según lo descrito sin el arnés exacto del autor.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación independiente hace desaconsejable su uso en producción sin validación propia.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-Base-Soliton
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Arnés de inferencia: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Sitio web del laboratorio: https://duoneural.com/index.html
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
- Contacto del autor: archon@agentmail.to
