# DuoNeural/RMSN-SFT-MCCI-d1024-L22

## Resumen

RMSN-SFT-MCCI-d1024-L22 es un checkpoint de ajuste supervisado (SFT) publicado por DuoNeural Lab dentro de su serie de investigación Phase 5b, con fecha de noviembre de 2026. El modelo se construye sobre una arquitectura propietaria denominada RMSN (Resonant Metriplectic Sheaf Network), que combina geometría simpléctica y métrica (metriplectic), representación mediante haces (sheaves) y fibras de Clifford de signatura Cl_{3,0}, junto con un espacio de trabajo cuasiperiódico de tipo Aubry-André. Con aproximadamente 261,9 millones de parámetros y 22 capas, se sitúa en la gama de modelos pequeños, pero su diseño no es convencional: no se apoya en un transformer estándar.

El modelo ha sido entrenado con trazas de razonamiento de cadena de pensamiento (CoT) sobre el dataset CDM, tras un preentrenamiento con el currículo TATS. Su interés actual es principalmente de investigación: la model card documenta hallazgos empíricos sobre topología de solitones (la transición de una topología "Multi-Cement-Condensate-Internal-MCCI" en el preentrenamiento a una configuración "Distributed Anchor" tras el SFT), así como una mejora drástica de la perplejidad en razonamiento CoT (de 4261 a 15,40) a costa de un empeoramiento en lenguaje general (de 81,66 a 158,62 en WikiText-103).

Se distribuye bajo licencia Apache 2.0, únicamente en inglés y con pesos en formato PyTorch (.pt), lo que requiere cargar el código propietario `rmsn_core.py` para poder instanciar el modelo. Su adopción en producción es, por tanto, limitada y orientada a experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network): fibras de Clifford Cl_{3,0}, haces (sheaves), espacio de trabajo Aubry-André cuasiperiódico, escaneo delta modulado por espinores |
| Parametros totales | ~261,9 M (Muon 211,5 M + AdamW 50,4 M) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en punto flotante PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`rmsn_sft_best.pt`, con `model_state` en un diccionario) |
| Dimension oculta | 1024 |
| Profundidad | 22 capas |
| Slots de espacio de trabajo | 64 |
| Vocabulario | 49.152 tokens (tokenizer cosmo2, HuggingFaceTB/cosmo2-tokenizer) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN no es un transformer convencional. Según la model card, emplea un "workspace" de 64 slots con potencial cuasiperiódico de Aubry-André, representación mediante haces (sheaf-theoretic fiber bundle representation) y fibras geométricas de Clifford de signatura Cl_{3,0}, con un mecanismo de "spinor-modulated delta scan". El entrenamiento se divide en dos fases: un preentrenamiento con el currículo TATS y un posterior ajuste supervisado (SFT) sobre trazas de razonamiento difíciles del dataset CDM. El optimizador es Muon para los parámetros metriplécticos (211,5 M) y AdamW para el resto (50,4 M).

El hallazgo técnico destacado por los autores es la denominada "Law 🌊¹⁰³": los gradientes del SFT pueden reestructurar la topología de solitones del preentrenamiento, pasando de la configuración Multi-Cement-Condensate-Internal-MCCI a una configuración Distributed Anchor con mejor rendimiento posterior. No se documentan el número de tokens de entrenamiento, la composición del dataset CDM ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de cadena de pensamiento (CoT), ámbito en el que el SFT produce una mejora notable de perplejidad según la model card.
- Razonamiento de tipo "hard" sobre el dataset CDM, orientado a trazas de razonamiento complejas.
- Capacidad multilingüe limitada: solo se declara inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (aunque el entrenamiento en CoT sugiere cierta orientación a razonamiento secuencial, no se documenta soporte explícito).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas para estudiar geometría metripléctica, haces y espacios de trabajo cuasiperiódicos en modelos de ~262 M de parámetros, comparando su comportamiento frente a transformers de tamaño similar.
- Estudio de dinámica de ajuste fino: la documentación de la transición topológica entre preentrenamiento y SFT convierte al checkpoint en un caso de estudio reproducible para investigar cómo los gradientes de SFT reorganizan la representación interna.
- Experimentos de razonamiento CoT a pequeña escala: con una perplejidad CoT de 15,40 en CDM, puede emplearse para generar y evaluar cadenas de razonamiento en entornos controlados y de bajo coste computacional.
- Reproducción de resultados académicos: al publicarse bajo Apache 2.0 y con instrucciones de carga, permite replicar las métricas reportadas (WikiText-103 y CDM CoT) en un solo equipo con ~1 GB de pesos.
- Evaluación de tokenizers alternativos: al usar cosmo2 (49.152 tokens), sirve para analizar el impacto de este vocabulario en tareas de razonamiento en inglés.
- Docencia y divulgación: su tamaño reducido (~262 M) permite desplegarlo en hardware modesto para ilustrar conceptos de geometría metripléctica, haces y topología de solitones en cursos avanzados.

## Benchmarks y rendimiento

| Metrica | Base (pretrain) | SFT |
|---|---|---|
| WikiText-103 PPL | 81,66 | 158,62 |
| CDM CoT Hard PPL | 4261 | 15,40 |

Ranking declarado por el autor: posición #4 en razonamiento CoT entre todas las variantes RMSN con D=1024. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~261,9 M de parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 1,05 GB; en fp16/bf16, unos 0,52 GB. A ello hay que sumar memoria para activaciones y el espacio de trabajo de 64 slots (no cuantificada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder cargar el modelo en fp16; para comodidad, una RTX 3060/4060 o superior. No se documentan requisitos específicos para A100/H100.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño de pesos (~1 GB en el repositorio).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga requiere el módulo propietario `rmsn_core.py` y PyTorch (`torch.load` + `load_state_dict`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones comparables (contexto, cuantizaciones, rendimiento) de este modelo frente a alternativas. La comparación se limita a parámetros y licencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-SFT-MCCI-d1024-L22 | ~261,9 M | no disponible | Apache 2.0 | PyTorch (.pt) | Hugging Face |
| Alternativas de ~250-300 M tipo transformer (p. ej. variantes pequeñas de la familia Qwen/Llama) | ~250-300 M | no disponible en esta ficha | variable | safetensors/GGUF | Hugging Face |
| Modelos de razonamiento CoT pequeños (referencia genérica) | no disponible | no disponible | variable | variable | variable |

Dado que no se han publicado resultados comparables en la información disponible, no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- La perplejidad en WikiText-103 empeora tras el SFT (de 81,66 a 158,62), lo que indica una posible degradación del modelado de lenguaje general en favor del razonamiento CoT.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se documentan sesgos conocidos, pero al ser un modelo de investigación sin evaluación de alineación publicada, el riesgo de sesgos y alucinaciones no puede descartarse.
- La carga requiere código propietario (`rmsn_core.py`) que no se incluye en el repositorio de Hugging Face; sin él, los pesos no son utilizables directamente.
- Formato de pesos en `.pt` (no safetensors), lo que implica riesgos de seguridad asociados a `torch.load` y falta de compatibilidad con ecosistemas estándar de cuantización (GGUF, etc.).
- No se documentan la longitud de contexto ni el comportamiento en secuencias largas, lo que limita su uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de robustez y seguridad desaconseja su despliegue en entornos de producción sin validación adicional.
- El modelo pertenece a una serie de investigación con paper pendiente ("Paper forthcoming"); las afirmaciones sobre topología de solitones no han sido revisadas por pares.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-MCCI-d1024-L22
- Tokenizer cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper: no disponible (anunciado como "forthcoming")
- Repositorio de código (`rmsn_core.py`): no disponible públicamente en la información proporcionada
- Contacto del autor: archon@agentmail.to
