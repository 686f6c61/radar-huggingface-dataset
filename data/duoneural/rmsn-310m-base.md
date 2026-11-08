# DuoNeural/RMSN-310M-Base

## Resumen

RMSN-310M-Base es un modelo de lenguaje de 293 millones de parámetros desarrollado por DuoNeural AI Laboratory, un laboratorio independiente de investigación. El modelo implementa la arquitectura Resonant Metriplectic Sheaf Network (RMSN), una propuesta poco convencional que reformula el mecanismo de atención y la propagación de estados ocultos como un sistema dinámico port-hamiltoniano con disipación termodinámicamente consistente. La idea central es que la estabilidad de Lyapunov sea una propiedad estructural del operador de avance, no un regularizador añadido durante el entrenamiento.

El modelo se entrenó sobre WikiText-103 durante 100.000 pasos (204,8 millones de tokens) con un vocabulario de 49.152 entradas basado en el tokenizador cosmo2. Alcanza una perplejidad de validación de 68,1 y reporta un exponente de Lyapunov máximo de -0,9714, lo que según el autor indica un atractor profundo estable. Su longitud de contexto es de solo 512 tokens, muy por debajo de los estándares actuales.

Es relevante como artefacto de investigación en dinámica de sistemas y estabilidad de redes neuronales, no como modelo de producción. El repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, y la model card mezcla afirmaciones técnicas con hallazgos empíricos no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), port-hamiltoniana con corchetes de Poisson y Morrison |
| Parametros totales | 293.031.984 (reportado como ~310M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.pt` (PyTorch); el repo también incluye safetensors según tags, pero la model card indica carga vía `torch.load` |
| Vocabulario | 49.152 (tokenizador cosmo2) |
| Dimensiones internas | dim 1152 / depth 16 / slots 64 |
| Datos de entrenamiento | WikiText-103, 100K pasos, 204,8M tokens |
| Perplejidad de validación | 68,1 |
| Exponente de Lyapunov máximo (val) | -0,9714 |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como un sistema dinámico port-hamiltoniano con dos componentes acoplados: un corchete de Poisson `{f, H}` que modela dinámica conservativa, y un corchete de Morrison `[f, S]` que introduce disipación con producción de entropía no negativa. La evolución del estado oculto se implementa mediante un escaneo paralelo (`ParallelMetriplecticScan`) con forma `h_t = exp((-γ_t + iω_t)Δt) h_{t-1} + u_t Δt`, lo que sugiere un mecanismo recurrente lineal con memoria compleja y coste O(log T). Los tokens se representan como multivectores de Clifford en el álgebra `Cl(3,0)` sobre haces celulares (`CliffordStalkBundle`), y se añade un banco de memoria fraccional de Caputo (`FractionalCaputoBank`) con orden α ∈ (0,1).

El enrutamiento interno usa un `CausalTrophicGlobalWorkspace` con 64 slots y competición tipo winner-take-most, y la salida pasa por un `Noether Stress-Energy Readout` que mapea invariantes conservados al espacio de logits. El entrenamiento se realizó únicamente sobre WikiText-103 (204,8M tokens, 100K pasos), sin indicios de RLHF, DPO ni ajuste por instrucciones. La model card menciona "eventos de cascada de Lyapunov" espontáneos durante el preentrenamiento y un umbral de percolación entre 155M y 159M parámetros, pero estos resultados no están respaldados por publicaciones revisadas por pares en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, con modelado de lenguaje causal estándar.
- Razonamiento de corto alcance limitado por una ventana de contexto de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: solo inglés declarado; no hay evidencia de capacidades en otros idiomas.
- No dispone de visión, audio ni modo "thinking" explícito.
- Capacidad diferencial de investigación: estabilidad estructural del operador de avance (Lyapunov negativa) y memoria fraccional aprendida.

## Casos de uso

- Investigación en dinámica de sistemas neuronales: el modelo sirve como banco de pruebas para estudiar si la estabilidad de Lyapunov estructural mejora la robustez frente a perturbaciones de entrada en secuencias cortas.
- Experimentos de interpretabilidad mecanicista: los componentes (haces de Clifford, slots tróficos, lectura de Noether) permiten analizar cómo se enruta la información entre 64 slots competitivos en tareas de modelado de lenguaje.
- Modelado de lenguaje en dominios de secuencia corta: con 512 tokens de contexto encaja en clasificación de frases, etiquetado de secuencias o generación de titulares y resúmenes de una sola frase sobre textos en inglés.
- Reproducción de resultados académicos: al estar entrenado sobre WikiText-103 con receta publicada, es útil para replicar la perplejidad de 68,1 y comparar arquitecturas alternativas en el mismo corpus.
- Estudio de memoria de largo alcance en ventanas cortas: el `FractionalCaputoBank` permite investigar si la memoria de orden fraccional compensa la limitación de contexto en tareas de dependencia léxica.
- Docencia y divulgación: como modelo pequeño (293M parámetros) y con licencia MIT, sirve para explicar arquitecturas no convencionales en cursos de aprendizaje profundo sin requerir hardware especializado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad de validación (WikiText-103) | 68,1 | Reportado por el autor; sin comparación directa publicada |
| Exponente de Lyapunov máximo (val) | -0,9714 | Indica atractor estable según el autor |
| Tokens de entrenamiento | 204,8M | 100K pasos sobre WikiText-103 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, HellaSwag) en la información disponible. La única métrica de calidad es la perplejidad, y no se ofrece comparación con modelos de tamaño similar bajo la misma receta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,2 GB (293M parámetros × 4 bytes) más overhead de activaciones y del estado recurrente.
- VRAM estimada en fp16/bf16: ~0,6 GB de pesos; el escaneo paralelo y los 64 slots añaden overhead adicional no cuantificado.
- Cabe holgadamente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento o experimentación a mayor escala: A100 o H100 solo si se quiere replicar el preentrenamiento; para inferencia, cualquier GPU moderna es suficiente.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI. La model card indica cargar los pesos con `torch.load` y usar el harness del repositorio de GitHub (`generate.py`), lo que implica despliegue manual en PyTorch.
- Latencia y throughput: no disponibles. La ventana de 512 tokens y el escaneo O(log T) sugieren baja latencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-310M-Base | 293M | 512 | MIT | PyTorch `.pt` | Arquitectura port-hamiltoniana; perplejidad 68,1 en WikiText-103; sin benchmarks estándar |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF | Referencia clásica de modelado de lenguaje; ampliamente soportado en llama.cpp y vLLM |
| GPT-2 medium | 355M | 1024 | MIT | safetensors, GGUF | Tamaño comparable; ecosistema maduro y benchmarks públicos |
| Pythia-410M | 410M | 2048 | Apache 2.0 | safetensors | Suite de investigación con checkpoints intermedios y evaluación pública |

La comparación directa de rendimiento no es posible porque RMSN-310M-Base no publica resultados en benchmarks estándar. En términos de ecosistema, los tres modelos alternativos tienen soporte en herramientas de inferencia ampliamente usadas, mientras que RMSN requiere código propio.

## Limitaciones y advertencias

- Contexto muy limitado (512 tokens): inadecuado para documentos largos, conversaciones multi-turno o código de cierta extensión.
- Entrenado solo en WikiText-103 (204,8M tokens): corpus pequeño y enciclopédico, lo que limita el conocimiento del mundo y la calidad fuera de ese dominio.
- Solo inglés declarado; no hay evidencia de competencia multilingüe.
- Sin ajuste por instrucciones ni RLHF: no es un modelo de chat ni sigue instrucciones de forma fiable.
- Perplejidad de 68,1 en WikiText-103 es alta en términos absolutos para modelos modernos, lo que sugiere calidad de generación limitada.
- Riesgo elevado de alucinación y de degradación fuera de distribución por el escaso volumen de entrenamiento.
- Las afirmaciones sobre "cascadas de Lyapunov", umbral de percolación y leyes empíricas provienen únicamente del autor y no han sido verificadas de forma independiente en la información disponible.
- La model card mezcla notación matemática con resultados no publicados en venues revisados por pares; conviene tratar las cifras como preliminares.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación de sesgos y de seguridad hace desaconsejable su uso en producción sin auditoría previa.
- El repositorio tiene cero descargas y cero likes; no hay comunidad ni soporte documentado.
- La carga requiere código propio (`rmsn_core.py`) y el tokenizador externo `HuggingFaceTB/cosmo2-tokenizer`, lo que añade fricción de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-310M-Base
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Harness de inferencia: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Sitio web del laboratorio: https://duoneural.com/
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
