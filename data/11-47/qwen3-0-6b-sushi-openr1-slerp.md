# 11-47/Qwen3-0.6B-Sushi-OpenR1-SLERP

## Resumen

Qwen3-0.6B-Sushi-OpenR1-SLERP es un modelo de lenguaje obtenido mediante la fusión de dos modelos derivados de Qwen3-0.6B: por un lado, kazako5er/Qwen3-0.6B-Sushi-Code-Expert, especializado en código, y por otro, 90dkn0ws/OpenR1-Distill-0.6B, un destilado orientado a razonamiento del estilo de OpenR1. El autor, identificado como 11-47, ha aplicado una interpolación esférica (SLERP) con un factor t=0.5, lo que equivale a un reparto equitativo de los pesos de ambos modelos progenitores en el espacio de parámetros.

El modelo cuenta con 596.049.920 parámetros (aproximadamente 0,6 mil millones), lo que lo sitúa en la gama ultraligera de la familia Qwen3. Su interés radica en combinar, en un único checkpoint, capacidades de generación de código y de razonamiento paso a paso, algo que raramente coexiste en modelos de este tamaño. Al estar construido sobre Qwen3, hereda la arquitectura transformer decoder-only de esa familia y su tokenizador, aunque la model card no detalla la longitud de contexto efectiva tras la fusión.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de merging reproducible (SLERP a t=0.5) sobre modelos pequeños; por otro, advierte de que se trata de un artefacto sin benchmarks publicados, sin licencia declarada y con cero descargas, por lo que debe evaluarse empíricamente antes de cualquier uso en producción. La información disponible es escasa y procede casi exclusivamente de los metadatos de Hugging Face y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; no confirmada explícitamente en la model card) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es un modelo MoE según los metadatos) |
| Longitud de contexto | no disponible (se hereda la de Qwen3-0.6B, pero no se confirma tras la fusión) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización posterior a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 1,2 GB |
| Metodo de fusion | SLERP con t=0.5 |
| Modelos base | kazako5er/Qwen3-0.6B-Sushi-Code-Expert y 90dkn0ws/OpenR1-Distill-0.6B |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de una fusión de pesos mediante SLERP (spherical linear interpolation) entre dos checkpoints derivados de Qwen3-0.6B. SLERP interpola los tensores de ambos modelos siguiendo una trayectoria esférica en lugar de una línea recta, lo que suele preservar mejor la geometría de los pesos y reducir la degradación respecto a una media aritmética simple. Con t=0.5, ambos progenitores contribuyen al 50 % en la interpolación.

Los dos modelos de partida aportan sesgos distintos: Qwen3-0.6B-Sushi-Code-Expert está orientado a tareas de programación, mientras que OpenR1-Distill-0.6B es un destilado de razonamiento inspirado en la receta OpenR1. La fusión busca un equilibrio entre ambas capacidades. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en los modelos originales; tampoco se documentan innovaciones técnicas adicionales más allá del propio método de merging. La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only con atención estándar, pero la model card no aporta detalles sobre posibles modificaciones tras la fusión.

## Capacidades

- Generación de texto general, heredada de la base Qwen3-0.6B.
- Generación y asistencia en código, aportada por el componente Sushi-Code-Expert.
- Razonamiento paso a paso y cadenas de pensamiento, aportadas por el componente OpenR1-Distill.
- Soporte de tool calling / function calling: no confirmado en la información disponible; probable herencia parcial de Qwen3, pero sin verificación.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el componente de razonamiento sugiere cierta aptitud, pero no hay evaluación publicada.
- Capacidades multilingües: no disponible; se desconoce la cobertura idiomática efectiva tras la fusión.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Asistente de código en local para entornos con recursos limitados: con menos de 600 M de parámetros, el modelo puede ejecutarse en CPU o en GPU de gama baja para autocompletar fragmentos, explicar funciones o generar tests unitarios sencillos, aprovechando el componente Sushi-Code-Expert.
- Prototipado de razonamiento matemático básico: el componente OpenR1-Distill permite experimentar con cadenas de pensamiento en problemas de aritmética y lógica de dificultad media, útil para validar pipelines de evaluación antes de escalar a modelos mayores.
- Generación de documentación técnica: el modelo puede redactar docstrings y comentarios a partir de código fuente, una tarea que combina comprensión de código y generación de texto.
- Filtrado y clasificación de fragmentos de código en pipelines de CI: dado su tamaño reducido, puede desplegarse como paso previo de bajo coste para detectar patrones sospechosos o sugerir correcciones antes de invocar un modelo mayor.
- Educación y tutoría de programación: respuestas explicativas sobre errores comunes y conceptos de programación, con latencia baja en hardware modesto.
- Investigación en merging de modelos: sirve como caso de estudio reproducible de SLERP a t=0.5 sobre modelos pequeños, permitiendo comparar con otras estrategias de fusión (TIES, DARE, media lineal) en tareas de código y razonamiento.
- Experimentación con cuantización extrema: al ser un modelo de 0,6 B, puede cuantizarse a 4 bits o menos y ejecutarse en dispositivos móviles o embebidos para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor se limita a declarar el método de fusión (SLERP, t=0.5) y los modelos base, sin incluir métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2-3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,3-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen de sobra. También es viable en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM, e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión previa a formato compatible), TGI y transformers con PyTorch. Para CPU, llama.cpp es la opción más eficiente.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,6 B, se espera una latencia muy baja (decenas de milisegundos por token en GPU consumer), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Sushi-OpenR1-SLERP (este) | 596 M | no disponible | no disponible | Hugging Face, 0 descargas | Fusión SLERP de código + razonamiento |
| Qwen3-0.6B (base oficial) | ~600 M | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| kazako5er/Qwen3-0.6B-Sushi-Code-Expert | ~600 M | no disponible | no disponible | Hugging Face | Progenitor especializado en código |
| 90dkn0ws/OpenR1-Distill-0.6B | ~600 M | no disponible | no disponible | Hugging Face | Progenitor orientado a razonamiento |

La comparación cuantitativa de rendimiento no está disponible, ya que ninguno de los modelos derivados publica benchmarks en la información consultada. La ventaja teórica de este merge es la combinación de dos especializaciones en un solo checkpoint del mismo tamaño que cualquiera de sus progenitores.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que la fusión mejore a los modelos base; el SLERP a t=0.5 puede degradar capacidades si los espacios de pesos de los progenitores no están alineados.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia de los modelos base (Qwen3 suele ser Apache 2.0, pero los derivados pueden imponer restricciones adicionales).
- Idiomas no documentados: se desconoce la cobertura multilingüe efectiva tras la fusión.
- Longitud de contexto no confirmada: aunque Qwen3-0.6B soporta contextos relativamente amplios, la fusión puede alterar el comportamiento en secuencias largas.
- Riesgo de alucinación: inherente a modelos de 0,6 B, especialmente en razonamiento complejo y código de producción.
- Sesgos: no evaluados; al heredar de Qwen3 y de destilados de razonamiento, puede reproducir sesgos de los datasets originales.
- Cero descargas y cero likes: no hay validación comunitaria; el modelo debe tratarse como experimental.
- Tool calling y comportamiento agéntico no verificados: no se debe asumir soporte fiable sin pruebas propias.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/11-47/Qwen3-0.6B-Sushi-OpenR1-SLERP
- Modelo base 1: https://huggingface.co/kazako5er/Qwen3-0.6B-Sushi-Code-Expert
- Modelo base 2: https://huggingface.co/90dkn0ws/OpenR1-Distill-0.6B
- Familia Qwen3 (referencia de arquitectura): https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio OpenR1 (referencia del destilado): https://github.com/huggingface/open-r1
