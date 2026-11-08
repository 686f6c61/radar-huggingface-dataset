# chenzs/ACE-Step-1.5-XL-SFT-4B-LM

## Resumen

ACE-Step 1.5 XL SFT 4B LM es el componente de planificación lingüística del sistema ACE-Step 1.5, un modelo fundacional de generación de música texto-a-audio desarrollado conjuntamente por ACE Studio y StepFun. Esta variante concreta, publicada por el usuario chenzs en Hugging Face, corresponde al modelo de lenguaje de 4B parámetros (derivado de Qwen3-4B) afinado mediante SFT, que actúa como "planner" omnicapaz dentro de una arquitectura híbrida: transforma consultas de usuario en planes de canción completos (metadatos, letras, subtítulos y estructura) que después guían a un Diffusion Transformer (DiT) encargado de sintetizar el audio final.

El modelo resuelve el problema de la generación musical de calidad comercial en hardware de consumo, combinando un LM que razona sobre la estructura musical con un decodificador de difusión. Según la documentación del proyecto, el sistema completo es capaz de generar una canción completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, y de ejecutarse localmente con menos de 4 GB de VRAM en las variantes DiT no XL. La variante XL, sin embargo, eleva los requisitos a 12 GB de VRAM como mínimo (con offload) y 20 GB recomendados.

La relevancia actual del modelo radica en su enfoque de datos de entrenamiento legalmente compliant (música con licencia, royalty-free y sintética) y en una licencia MIT que permite uso comercial estricto de la música generada, algo poco habitual en modelos de generación musical. Además, el LM soporta más de 50 idiomas y capacidades de edición como cover generation, repainting y conversión vocal-a-BGM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje transformer (planner) dentro de un sistema híbrido LM + Diffusion Transformer (DiT); derivado de Qwen3-4B |
| Parámetros totales | ~4B (variante LM 4B); el DiT XL asociado tiene 4B parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | 50+ idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo forma parte de una arquitectura híbrida en la que el LM actúa como planificador omnicapaz: recibe la consulta del usuario y genera un blueprint completo de la canción, incluyendo metadatos, letras y captions mediante Chain-of-Thought, que posteriormente condicionan al DiT. El LM está inicializado desde Qwen3-4B y ha pasado por tres fases de entrenamiento: pre-entrenamiento, SFT (esta variante) y RL. Según la model card, la alineación se logra mediante reinforcement learning intrínseco que se apoya únicamente en mecanismos internos del modelo, eliminando los sesgos de reward models externos o preferencias humanas.

Los datos de entrenamiento del sistema completo combinan música con licencia profesional, colecciones royalty-free y de dominio público, y datos sintéticos generados mediante conversión MIDI-a-audio de alta calidad. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset del LM. La variante SFT del DiT asociada soporta Classifier-Free Guidance (CFG) para control fino de la adherencia al prompt, con 50 pasos de muestreo.

## Capacidades

- Generación de planes de canción completos: metadatos, letras, captions y estructura musical (desde loops cortos hasta composiciones de 10 minutos).
- Razonamiento con Chain-of-Thought para sintetizar metadatos y descripciones que guían al DiT.
- Query rewrite: reescritura y enriquecimiento de la consulta del usuario.
- Comprensión de audio (nivel "Strong" en la variante 4B según la tabla del model zoo).
- Capacidad de composición musical (nivel "Strong" en la variante 4B).
- Copy melody (nivel "Strong" en la variante 4B).
- Soporte multilingüe en más de 50 idiomas con adherencia estricta al prompt.
- Integración en flujos de edición musical: cover generation, repainting y conversión vocal-a-BGM (a nivel de sistema).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-step: no disponible explícitamente, aunque el patrón planner + generador implica razonamiento multi-etapa.

## Casos de uso

- Producción musical asistida: el LM genera el blueprint completo (estructura, letras, metadatos) a partir de una descripción textual breve, que el DiT convierte en audio; adecuado para prototipado rápido de ideas musicales con calidad comercial.
- Generación de bandas sonoras para vídeo y contenido: creación de música original libre de royalties para YouTube, podcasts o publicidad, con licencia MIT que permite uso comercial estricto.
- Localización multilingüe de canciones: gracias al soporte de 50+ idiomas, el modelo puede generar letras y metadatos en distintos idiomas manteniendo la adherencia al prompt estilístico.
- Herramientas de edición musical (cover, repaint, vocal-to-BGM): integrado en el sistema completo, permite transformar canciones existentes, regenerar secciones o convertir voces en acompañamiento instrumental.
- Despliegue en hardware de consumo para creadores independientes: la variante XL requiere 12 GB de VRAM con offload, lo que permite ejecución local en GPUs de gama alta consumer (RTX 3090/4090) sin depender de la nube.
- Investigación en generación musical: el modelo y su tech report (arXiv:2602.00744) sirven como base para experimentos en alineación mediante RL intrínseco y arquitecturas híbridas LM+DiT.
- Generación de jingles y música publicitaria a escala: la velocidad de generación (menos de 2 s en A100 para el sistema completo) permite producir variantes masivas en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una imagen de evaluación sin cifras extraíbles y una tabla cualitativa del model zoo que clasifica las variantes LM en capacidades (Medium/Strong/Weak) sin valores cuantitativos.

## Requisitos de hardware

- VRAM estimada para el sistema XL (DiT 4B + LM): mínimo 12 GB con offload, 20 GB recomendado.
- Las variantes no XL del sistema pueden ejecutarse con menos de 4 GB de VRAM según la model card.
- GPU recomendadas: A100 (generación de canción completa en menos de 2 s), RTX 3090 (menos de 10 s), RTX 4090.
- Cabe en GPU consumer de gama alta: RTX 3090, RTX 4090 y superiores; en gamas inferiores requeriría offload agresivo o variantes no XL.
- Opciones de despliegue: transformers y diffusers (según tags del repo); no se especifican vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: menos de 2 s por canción en A100 y menos de 10 s en RTX 3090 para el sistema completo (no específico del LM aislado).

## Comparativa con modelos similares

| Modelo | Parámetros (LM/DiT) | Contexto | Idiomas | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|---|
| ACE-Step 1.5 XL SFT 4B LM (este) | ~4B LM + 4B DiT XL | No disponible | 50+ | MIT | Sí, explícito | Hugging Face |
| ACE-Step 1.5 LM 1.7B | ~1.7B (Qwen3-1.7B) | No disponible | 50+ | MIT | Sí | Hugging Face |
| ACE-Step 1.5 LM 0.6B | ~0.6B (Qwen3-0.6B) | No disponible | 50+ | MIT | Sí | Hugging Face |
| ACE-Step 1.5 turbo (DiT) | DiT sin LM XL | No disponible | 50+ | MIT | Sí | Hugging Face |

La comparativa se limita a variantes del mismo proyecto porque la información proporcionada no incluye datos de modelos de generación musical de otros desarrolladores (por ejemplo, modelos propietarios o alternativas open source) con cifras verificables.

## Limitaciones y advertencias

- Este repositorio contiene únicamente el componente LM del sistema; no genera audio por sí solo y requiere el DiT correspondiente para la síntesis.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado por un usuario individual (chenzs), no por la organización oficial ACE-Step; conviene verificar la procedencia frente a los repositorios oficiales.
- No se dispone de información sobre sesgos específicos del modelo; al derivar de Qwen3-4B, puede heredar sesgos de su corpus de pre-entrenamiento.
- Riesgo de alucinación en la generación de metadatos, letras o descripciones que no se correspondan con la consulta del usuario.
- Longitud de contexto no documentada, lo que dificulta planificar prompts largos o composiciones de 10 minutos con letras extensas.
- Aunque la licencia es MIT y la model card afirma uso comercial estricto de la música generada, el cumplimiento legal de los datos de entrenamiento debe verificarse de forma independiente para producción.
- Los requisitos de 12-20 GB de VRAM de la variante XL limitan su despliegue en GPUs consumer de gama media.
- No se documentan tipos de cuantización soportados ni opciones de despliegue optimizadas (vLLM, llama.cpp), lo que puede complicar el serving en producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/chenzs/ACE-Step-1.5-XL-SFT-4B-LM
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Colección ACE-Step 1.5 en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Tech Report (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub: https://github.com/ace-step/ACE-Step-1.5
- Variante DiT XL SFT (cmp-nct): https://huggingface.co/cmp-nct/acestep-v15-xl-sft
- DiT base: https://huggingface.co/ACE-Step/acestep-v15-base
- DiT SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
- DiT turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
