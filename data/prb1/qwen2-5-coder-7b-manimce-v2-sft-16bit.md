# PRB1/Qwen2.5-Coder-7B-ManimCE-V2-SFT-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-V2-SFT-16bit es un adaptador LoRA (PEFT) publicado por el usuario PRB1 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se trata, por tanto, de un ajuste fino supervisado (SFT) del conocido modelo de código de Alibaba Qwen, empaquetado como adaptador y distribuido con pesos en formato safetensors de 16 bits. El nombre sugiere un entrenamiento orientado a la generación de animaciones o contenido tipo Manim (la librería de animación programática de Python), aunque la model card no lo confirma explícitamente.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-Coder-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN en el modelo base). Al ser un adaptador LoRA, no redefine la arquitectura: modifica un subconjunto de pesos del modelo base para especializarlo en el dominio de entrenamiento.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es una plantilla sin rellenar, no se declaran licencia, idiomas, datos de entrenamiento ni resultados de evaluación, y el repositorio no registra descargas ni interacciones. Se trata de un artefacto de investigación o experimento personal, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | ~7.600 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base; hasta 131.072 con YaRN (segun Qwen2.5) |
| Tipos de cuantizacion | no disponible en el repo (pesos del adaptador en 16 bits); el modelo base admite GPTQ, AWQ, GGUF, etc. |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-Coder soporta principalmente ingles y chino, con capacidades multilingues limitadas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-Coder-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, entrenado por Alibaba sobre un corpus masivo de código y texto (el modelo base se entrenó con 5,5 billones de tokens segun la documentación oficial de Qwen2.5-Coder). El adaptador LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, lo que permite un ajuste eficiente en memoria.

No se dispone de información sobre el procedimiento de entrenamiento del adaptador: ni el número de tokens, ni la composición del dataset, ni los hiperparámetros (rango LoRA, alpha, learning rate, épocas), ni si hubo RLHF/DPO. La única referencia técnica es la versión de PEFT declarada (0.21.2). El sufijo "ManimCE" sugiere un dataset orientado a la generación de código Manim Community Edition, pero no está confirmado. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-7B-Instruct, incluyendo generación, completado y explicación de código en múltiples lenguajes.
- Razonamiento y matemáticas: el modelo base muestra competencia en tareas de razonamiento y matemáticas de nivel medio.
- Tool calling / function calling: el modelo base Qwen2.5-Coder-Instruct soporta llamadas a funciones, aunque no se confirma que el adaptador preserve esta capacidad intacta.
- Razonamiento multi-paso y agentes: capacidad potencial heredada del modelo base, no verificada tras el ajuste.
- Capacidades multilingües: limitadas y no documentadas; el modelo base está optimizado para inglés y chino.
- Capacidad especial: posible especialización en generación de código de animación (Manim), inferida del nombre pero no documentada.
- No se declaran capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Generación de animaciones educativas con Manim: el adaptador podría usarse para producir scripts de Manim Community Edition a partir de descripciones en lenguaje natural, aprovechando el ajuste SFT sobre el modelo base. Es el caso de uso más plausible segun el nombre del repositorio, aunque no está verificado.
- Asistencia en notebooks de ciencia y matemáticas: generar visualizaciones animadas de conceptos matemáticos (funciones, geometría, álgebra lineal) para docentes y divulgadores.
- Prototipado de contenido educativo programático: crear escenas de vídeo explicativas de forma reproducible mediante código, integrándolo en pipelines de generación de material docente.
- Generación de código Python en general: al partir de Qwen2.5-Coder-7B-Instruct, puede emplearse para autocompletado y generación de funciones Python, con la cautela de que el ajuste puede haber degradado capacidades generales.
- Experimentación en investigación sobre LoRA: sirve como caso de estudio de ajuste fino de bajo rango sobre un modelo de código, útil para comparar metodologías de SFT.
- Evaluación comparativa de adaptadores: puede emplearse como baseline en estudios sobre especialización de dominio en modelos de código.
- No se recomienda su uso en producción sin una evaluación previa propia, dado que no hay benchmarks ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el repositorio no registra descargas ni validación por parte de la comunidad.

## Requisitos de hardware

- VRAM para inferencia (modelo base en 16 bits): aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contexto moderado.
- VRAM con cuantización: ~8 GB en 4 bits (GPTQ/AWQ/GGUF Q4), ~5-6 GB en Q4 GGUF con llama.cpp y offload parcial.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables en cuantización.
- Cabe en GPU de consumo: sí, en cuantización 4-8 bits en GPUs con 8-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Como referencia del modelo base 7B en una RTX 4090, se esperan decenas de tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-V2-SFT-16bit | ~7,6 B (base) + LoRA | 32.768 (base) | no disponible | Hugging Face (0 descargas) | Adaptador SFT sin documentar |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, muy usado | Modelo base de referencia, benchmarks publicados |
| DeepSeek-Coder-V2-Lite-Instruct | ~16 B (2,4 B activos, MoE) | 128.000 | DeepSeek License | Hugging Face | Alternativa MoE con mayor contexto |
| CodeLlama-7B-Instruct | ~6,7 B | 16.384 | Llama 2 Community License | Hugging Face (Meta) | Alternativa clásica de código, contexto menor |

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto; cualquier despliegue requiere validación propia.
- Licencia no declarada: no se puede confirmar el uso comercial; además, la licencia del adaptador debe ser compatible con la del modelo base (Apache 2.0 en Qwen2.5-Coder).
- Riesgo de olvido catastrófico: el ajuste SFT puede degradar capacidades generales del modelo base (razonamiento, tool calling, multilingüismo).
- Sesgos: heredados del corpus de entrenamiento del modelo base (código y texto de internet), no evaluados en el adaptador.
- Alucinación: riesgo inherente a los modelos generativos; en código, puede producir APIs inexistentes o scripts de Manim no ejecutables.
- Idiomas: no se declaran; se espera un rendimiento limitado en castellano, especialmente en tareas de código especializado.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia de que el adaptador funcione segun lo esperado.
- Repositorio de 0,7 GB: coherente con un adaptador LoRA de tamaño moderado, no con un modelo completo; requiere el modelo base para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-V2-SFT-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- PEFT (librería): https://github.com/huggingface/peft
- Manim Community Edition: https://www.manim.community/
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
