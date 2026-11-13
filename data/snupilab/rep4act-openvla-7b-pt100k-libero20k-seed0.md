# snupilab/Rep4Act-OpenVLA-7B-PT100k-LIBERO20k-seed0

## Resumen

Rep4Act-OpenVLA-7B-PT100k-LIBERO20k-seed0 es un modelo de visión-lenguaje-acción (VLA) para robótica desarrollado por el grupo snupilab (Universidad Nacional de Seúl, a juzgar por el identificador). Se construye sobre OpenVLA-7B, un transformer de 7.000 millones de parámetros que combina un codificador visual con un modelo de lenguaje para generar comandos motores de extremo a extremo a partir de observaciones visuales e instrucciones en lenguaje natural. El sufijo del nombre indica el protocolo de entrenamiento: preentrenamiento sobre 100.000 muestras (PT100k) y ajuste fino sobre 20.000 episodios del benchmark LIBERO, con semilla 0. La variante "Rep4Act" sugiere una modificación de la representación de acción respecto al OpenVLA original.

El modelo resuelve el problema de control robótico guiado por lenguaje: dado un par (imagen de cámara, instrucción textual), predice una acción discreta tokenizada que el robot ejecuta. Es relevante porque los VLA de código abierto permiten reproducir y comparar políticas robóticas sin depender de APIs propietarias, y porque el ajuste específico sobre LIBERO facilita la evaluación estandarizada en tareas de manipulación.

La información pública disponible es muy limitada: el repositorio está restringido (gated), no declara licencia ni idiomas, no tiene descargas ni likes, y no se han publicado resultados de benchmarks en la información proporcionada. El tamaño del repositorio (30,2 GB) es coherente con pesos en precisión completa o bf16 de un modelo de 7B junto con el codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en OpenVLA-7B; transformer con codificador visual y LLM de 7B |
| Parametros totales | 7B (según el identificador del modelo; no confirmado en la ficha) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en pytorch; probablemente bf16/fp32, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería pytorch; probablemente safetensors o .bin, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue la estela de OpenVLA: un codificador visual (en OpenVLA, DINOv2 junto con SigLIP) que proyecta las observaciones a tokens, unidos a los tokens de la instrucción lingüística y procesados por un LLM decoder (Llama-2-7B en OpenVLA) que emite acciones discretizadas como tokens. La variante Rep4Act introduce, por el nombre, un cambio en la representación de la acción, presumiblemente una reparametrización o codificación alternativa de los vectores de acción; no se detalla en la información disponible.

El entrenamiento se organiza en dos fases según el nombre: PT100k (preentrenamiento con 100.000 muestras, presumiblemente de un corpus tipo Open X-Embodiment) y LIBERO20k (ajuste fino con 20.000 episodios del benchmark LIBERO), con semilla 0. No se especifican la composición exacta del dataset, el número de tokens, ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la mencionada reparametrización de acciones.

## Capacidades

- Generación de acciones robóticas de extremo a extremo a partir de imágenes e instrucciones en lenguaje natural.
- Control de manipulación en entornos simulados del benchmark LIBERO (tareas de pick-and-place, apilado, apertura de cajones, etc., según la suite estándar).
- Comprensión visuo-lingüística heredada del backbone OpenVLA-7B (grounding de objetos y seguimiento de instrucciones).
- Ejecución de políticas de un solo paso (single-step action prediction) sin planificación explícita.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión sí (entrada de cámara); audio no disponible.

## Casos de uso

- Evaluación reproducible en LIBERO: el ajuste sobre 20.000 episodios con semilla fija permite reproducir experimentos de manipulación y comparar políticas VLA bajo el protocolo estándar del benchmark.
- Investigación en representación de acciones: la variante Rep4Act sirve para estudiar cómo afecta la codificación de acciones al rendimiento, comparándola con OpenVLA base bajo el mismo protocolo.
- Prototipado de políticas de manipulación en simulación: integración en entornos MuJoCo/Robosuite mediante el pipeline de robótica de Hugging Face para validar tareas antes de transferir a hardware.
- Baseline para ajuste fino en dominios propios: al partir de OpenVLA-7B preentrenado en 100k muestras, puede servir de inicialización para datasets robóticos específicos del laboratorio.
- Estudio de robustez visuo-lingüística: análisis de cómo varía la precisión de la política ante cambios de iluminación, punto de vista o paráfrasis de instrucciones en simulación.
- Docencia y formación en VLA: ejemplo completo de pipeline preentrenamiento + ajuste fino con semilla controlada para cursos de robótica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por analogía con OpenVLA-7B, en bf16 se requieren aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y del codificador visual.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y ajuste fino; para inferencia en bf16, una RTX 4090 (24 GB) o A6000 (48 GB) puede ser suficiente, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16; en cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no disponibles en el repo) cabría en GPUs de 12-16 GB, sin confirmar.
- Opciones de despliegue: al ser un modelo pytorch con pipeline de robótica, el despliegue típico es mediante transformers y el código de OpenVLA; vLLM, llama.cpp, Ollama o TGI no están documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-OpenVLA-7B-PT100k-LIBERO20k-seed0 | 7B | no disponible | PT100k + LIBERO20k | no disponible | Gated en Hugging Face |
| OpenVLA-7B | 7B | no disponible | Open X-Embodiment (~970k episodios) | Llama 2 (con restricciones) | Público en Hugging Face |
| RT-2 (Google DeepMind) | no disponible | no disponible | Datos web + robótica | Propietaria | No público |
| Octo | ~93M (small) / ~27M (tiny) | no disponible | Open X-Embodiment | Apache 2.0 | Público en Hugging Face |

La comparación con RT-2 es solo referencial: no hay datos de rendimiento del modelo de snupilab frente a estas alternativas en la información disponible.

## Limitaciones y advertencias

- Repositorio restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el uso en pipelines automatizados.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hereda probablemente restricciones de Llama 2 vía OpenVLA, pero no está verificado.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento frente a OpenVLA base o alternativas.
- Entrenado específicamente para LIBERO: la generalización fuera de ese benchmark (escenas reales, otros robots, otras tareas) no está documentada y es probablemente limitada.
- Riesgo de alucinación motora: como todo VLA, puede generar acciones plausibles pero incorrectas ante instrucciones ambiguas u observaciones fuera de distribución.
- Sesgos: no documentados; los datasets robóticos suelen sobrerrepresentar escenas de laboratorio, objetos cotidianos y condiciones de iluminación controladas.
- Idiomas: no declarados; el backbone OpenVLA está entrenado principalmente en inglés, por lo que instrucciones en castellano podrían degradar el rendimiento.
- Sin información sobre cuantizaciones: no hay pesos GGUF/AWQ publicados, lo que dificulta el despliegue en hardware modesto.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-OpenVLA-7B-PT100k-LIBERO20k-seed0
- OpenVLA (modelo base): https://huggingface.co/openvla/openvla-7b
- Repositorio OpenVLA: https://github.com/openvla/openvla
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Paper OpenVLA: https://arxiv.org/abs/2406.09246
- Paper LIBERO: https://arxiv.org/abs/2306.03310
