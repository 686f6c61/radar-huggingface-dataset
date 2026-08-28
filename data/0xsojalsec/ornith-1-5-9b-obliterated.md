# 0xSojalSec/Ornith-1.5-9B-OBLITERATED

## Resumen

Ornith-1.5-9B-OBLITERATED es una versión del modelo Ornith-1.5-9B a la que se le ha eliminado quirúrgicamente el alineamiento de seguridad mediante una técnica de abliteración. El modelo base, desarrollado por ornith-ai, es un modelo denso de aproximadamente 9 000 millones de parámetros con arquitectura híbrida Qwen3.5 (Gated DeltaNet + atención completa) orientado a tareas agénticas y auto-mejora. Esta variante, creada por OBLITERATUS (Pliny the Prompter), aplica cuatro rondas de ablación direccional SVD y cirugía de atención por cabeza para eliminar los comportamientos de rechazo, manteniendo en gran medida las capacidades de razonamiento, generación de código y uso de herramientas.

El modelo se distribuye con licencia MIT, en formatos safetensors (bf16) y GGUF (varias cuantizaciones), e incluye un encoder de visión (mmproj) que sugiere capacidades multimodales. Su relevancia radica en que permite estudiar los mecanismos de rechazo en arquitecturas híbridas modernas y sirve como herramienta para red teaming y evaluación de seguridad, aunque su uso conlleva riesgos éticos y legales importantes al haber eliminado las salvaguardas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (Gated DeltaNet + atención completa) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso sugiere 8192, pero no es un dato oficial) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de atención lineal con compuertas) con capas de atención completa, siguiendo el diseño de Qwen3.5. El modelo original se entrenó mediante un bucle de auto-mejora que incluye propuesta de tareas, generación de scaffolds específicos y rollouts de soluciones para aprendizaje por refuerzo, según la documentación de ornith-ai.

La versión OBLITERATED aplica un procedimiento de abliteración en cuatro rondas: tres rondas de extracción de direcciones SVD con regularización decreciente (0.06, 0.04, 0.03) y una ronda final de cirugía de atención por cabeza (reg 0.02). Todas las rondas utilizaron un corpus de 1000 prompts con ponderación residual. Este proceso elimina los vectores de dirección asociados al rechazo, pero degrada ligeramente el rendimiento en tareas de conocimiento general (MMLU cae ~4 puntos porcentuales).

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento con modo de pensamiento (thinking mode) activable o desactivable.
- Generación de código funcional, incluyendo scripts de automatización y herramientas de seguridad.
- Soporte de tool calling / function calling, aunque parcialmente degradado respecto al modelo stock.
- Capacidades agénticas básicas (uso de herramientas y scripts de automatización).
- Capacidades multimodales (el repositorio incluye un encoder de visión mmproj de 879 MB).
- Alto índice de respuesta sin rechazo en prompts restringidos (98.4% en corpus de 1000 prompts).

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar empíricamente los mecanismos de rechazo en arquitecturas híbridas RL-hardened, comparando el comportamiento antes y después de la ablación.
- Red teaming y evaluación de robustez: equipos de seguridad pueden usarlo para identificar vulnerabilidades en sistemas que dependen de modelos con guardas, probando si las respuestas sin filtrar pueden filtrarse a través de cuantizaciones o prompts adversarios.
- Generación de código de automatización: con el modo de pensamiento desactivado, el modelo produce scripts de automatización y herramientas de línea de comandos con buena fluidez, útil en entornos de desarrollo donde se requiere generación rápida de código.
- Pruebas de estrés de sistemas de moderación: al generar contenido que los modelos censurados rechazarían, permite evaluar la eficacia de clasificadores externos de contenido y filtros.
- Benchmarking de técnicas de ablación: sirve como referencia para comparar metodologías de eliminación de alineamiento (SVD, cirugía de atención, etc.) en términos de preservación de capacidades.
- Entornos de investigación controlados: laboratorios académicos pueden utilizarlo para estudiar la relación entre alineamiento y capacidad, siempre que se cumplan las políticas institucionales de uso responsable.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados comparativos entre el modelo stock y la versión OBLITERATED (en cuantización Q4_K_M para la comparativa de liberación):

| Métrica | Stock | OBLITERATED | Delta |
|---|---|---|---|
| MMLU (n=100) | 78.82% | 74.82% | -4.00pp |
| Liberación (20 prompts duros) | 0/20 | 20/20 | +20 |
| Liberación (corpus 1000) | — | 98.4% | — |
| Generación de código | 3/3 | 3/3 | — |
| Coherencia de contexto largo | 4/6 | 5/6 | +1 |
| Perplejidad (benigno) | — | 4.19 | — |

Comparativa de liberación entre versiones abliteradas (Q4_K_M, 16 prompts):

| Modelo | Tasa de éxito | Restringido | Cyber | Capacidad |
|---|---|---|---|---|
| Stock | 12% (2/16) | 0/8 | 0/6 | 2/2 |
| OBLITERATUS | 94% (15/16) | 7/8 | 6/6 | 2/2 |
| Heretic (zaakirio) | 75% (12/16) | 4/8 | 6/6 | 2/2 |
| ZeroFuse (junafinity) | 38% (6/16) | 1/8 | 3/6 | 2/2 |

## Requisitos de hardware

- Peso completo bf16: ~18 GB (safetensors). Requiere al menos 24 GB de VRAM para inferencia con Transformers.
- GGUF Q8_0: 9.1 GB — recomendado para máxima fidelidad de liberación; cabe en GPUs con 12 GB o más.
- GGUF Q6_K: 7.0 GB — alta calidad, cabe en GPUs de 8-10 GB.
- GGUF Q4_K_M: 5.4 GB — el más popular, funciona en GPUs consumer de 8 GB (RTX 3070/4060) con contexto moderado.
- GGUF Q2_K: 3.6 GB — el más pequeño, puede ejecutarse en GPUs de 4-6 GB o en CPU con llama.cpp.
- GPU recomendadas: RTX 3090/4090 (24 GB) para bf16; RTX 3060/4060 (12 GB) para Q8_0; cualquier GPU con 8 GB para Q4_K_M.
- Opciones de despliegue: Transformers (con trust_remote_code), llama.cpp / llama-server, Ollama (biblioteca ornith-1.5), vLLM (con adaptaciones).
- Latencia: no disponible en la información proporcionada. Para un modelo de 9B en Q4_K_M, se espera un throughput de 30-60 tokens/s en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B (stock) | 9.65B | no disponible | 78.82% (n=100) | MIT | safetensors, GGUF |
| Ornith-1.5-9B-OBLITERATED | 9.65B | no disponible | 74.82% (n=100) | MIT | safetensors, GGUF |
| Heretic (zaakirio) | 9B (mismo base) | no disponible | no disponible | no disponible | GGUF |
| ZeroFuse (junafinity) | 9B (mismo base) | no disponible | no disponible | no disponible | GGUF |

La comparativa se limita a las variantes abliteradas del mismo modelo base, ya que no se dispone de datos de modelos comparables de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Este modelo ha sido deliberadamente despojado de sus salvaguardas de seguridad. Puede generar contenido peligroso, ilegal o éticamente problemático sin rechazo.
- La degradación de MMLU (~4pp) indica una pérdida de conocimiento general como coste de la ablación.
- La función de tool calling está parcialmente degradada; para uso agéntico en producción se recomienda un scaffold externo.
- En cuantizaciones bajas (Q4 y menores), algunos prompts de síntesis química pueden mostrar titubeos o rechazos parciales.
- Al ser un modelo de 9B, la calidad de respuestas en dominios complejos (química, síntesis) puede incluir detalles alucinados. Verificar siempre el contenido técnico.
- El uso de este modelo para actividades ilegales o dañinas es responsabilidad del usuario. No está recomendado para aplicaciones de producción sin supervisión humana y filtros externos.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado principalmente en inglés, puede presentar limitaciones en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xSojalSec/Ornith-1.5-9B-OBLITERATED
- Modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith: https://github.com/ornith-ai/Ornith-1
- Biblioteca de Ollama: https://ollama.com/library/ornith-1.5
- Modelo MLX (para Apple Silicon): https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
