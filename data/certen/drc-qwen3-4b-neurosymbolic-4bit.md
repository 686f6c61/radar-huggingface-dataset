# certen/DrC-Qwen3-4B-NeuroSymbolic-4bit

## Resumen

DrC-Qwen3-4B-NeuroSymbolic-4bit es un modelo de lenguaje de 4.022 millones de parámetros (4B) publicado por el usuario certen en Hugging Face, derivado del checkpoint cuantizado `mlx-community/Qwen3-4B-4bit`, que a su vez es una versión en 4 bits del Qwen3-4B de Alibaba. El modelo está empaquetado en formato MLX, la librería de Apple para ejecutar modelos de forma nativa en chips de la serie M (Apple Silicon), y se distribuye con licencia Apache 2.0.

La propuesta del autor es un ajuste orientado a "decisiones neuro-simbólicas": el modelo recibe un estado o petición junto con un conjunto finito de opciones candidatas y debe seleccionar una de ellas. El caso de uso declarado es la clasificación, el enrutamiento (routing), la selección de herramientas y otros flujos de decisión con un número cerrado de alternativas, ejecutados localmente en un Mac.

La relevancia práctica es limitada pero concreta: se trata de un modelo pequeño, cuantizado y ejecutable en hardware de consumo de Apple, pensado para integrarse como componente de decisión dentro de pipelines mayores. No hay información publicada sobre el proceso de ajuste, los datos empleados ni métricas de evaluación, por lo que su adopción en producción exige una validación propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); ajuste neuro-simbólico no documentado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no confirmada por el autor) |
| Tipos de cuantizacion | 4 bits (MLX), pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 6,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de 4.022 millones de parámetros, en su variante ya cuantizada a 4 bits por `mlx-community`. Sobre esa base, el autor ha aplicado un ajuste que etiqueta como "neuro-simbólico" y orientado a toma de decisiones restringida, pero la model card no detalla la metodología: no se especifica si se trata de fine-tuning supervisado, DPO, RLHF o una combinación, ni se indica el número de tokens de entrenamiento, la composición del dataset ni si se congelaron capas.

Tampoco se documentan innovaciones técnicas propias más allá del empaquetado en MLX, que permite ejecutar la inferencia de forma optimizada en Apple Silicon (memoria unificada, kernels específicos para la GPU de la serie M). El prefijo "DrC" del nombre no se explica en la documentación disponible, y los resultados de búsqueda web sobre "Certen" apuntan a entidades financieras y de compliance sin relación aparente con este modelo, por lo que no aportan información técnica.

## Capacidades

- Generación de texto conversacional, heredada de la base Qwen3-4B.
- Selección entre opciones candidatas proporcionadas en el prompt (clasificación, routing, tool selection).
- Interpretación de contexto estructurado además de texto libre, según declara el autor.
- Razonamiento en modo "thinking" potencialmente disponible por herencia de Qwen3, aunque no confirmado en esta variante.
- Ejecución local en Apple Silicon mediante MLX.
- Capacidades multilingües: no documentadas; se desconoce el alcance real tras el ajuste.
- Tool calling y function calling: no documentado explícitamente; el uso declarado es la selección de herramientas dentro de un conjunto finito, no el protocolo de function calling estándar.

## Casos de uso

- Enrutamiento de consultas en un chatbot: el modelo recibe la pregunta del usuario y una lista cerrada de intenciones o departamentos, y devuelve la etiqueta seleccionada; su tamaño de 4B permite ejecutarlo en un Mac sin GPU dedicada.
- Selección de herramientas en un agente: dado el estado de la conversación y un catálogo de herramientas disponibles, el modelo elige cuál invocar antes de pasar el control a un modelo mayor.
- Clasificación de tickets o correos: con contexto estructurado (remitente, asunto, cuerpo) y un conjunto de categorías, el modelo asigna la categoría; adecuado por su bajo coste de inferencia local.
- Moderación o triaje previo: filtrar y etiquetar contenido entrante en un pipeline antes de enviarlo a un modelo más grande, reduciendo coste y latencia.
- Componente de decisión en aplicaciones de escritorio para macOS: integración directa vía `mlx_lm` en apps nativas que necesitan clasificación offline sin enviar datos a la nube.
- Prototipado e investigación en decisiones neuro-simbólicas: servir como banco de pruebas para arquitecturas híbridas que combinan un LLM con un solver o validador simbólico externo.
- Automatización de flujos con opciones finitas: por ejemplo, decidir la siguiente acción en un formulario o wizard a partir del estado actual y las transiciones válidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión en clasificación, MMLU, HumanEval ni ninguna otra evaluación, ni comparaciones con la base Qwen3-4B.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 6,8 GB en pesos de 4 bits; se recomienda al menos 8 GB de memoria unificada libre para cargar el modelo y algo de margen para el contexto.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX; no es ejecutable directamente en CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; en equipos de 16 GB o más el margen es amplio.
- Opciones de despliegue: `mlx_lm` (librería oficial de Apple) es la vía documentada; MLX también dispone de servidor compatible con la API de OpenAI para servir el modelo localmente. No se distribuye en GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles; dependen del chip concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DrC-Qwen3-4B-NeuroSymbolic-4bit | 4,02B | no disponible | MLX 4-bit | Apache 2.0 | Ajuste para decisiones con opciones finitas; sin benchmarks |
| Qwen3-4B (original) | 4,02B | 32.768 tokens (ampliable, según documentación de Qwen) | safetensors | Apache 2.0 | Modelo base generalista con benchmarks públicos |
| mlx-community/Qwen3-4B-4bit | 4,02B | 32.768 tokens (según base) | MLX 4-bit | Apache 2.0 | Checkpoint cuantizado del que deriva este modelo |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | Alternativa generalista de tamaño similar, con ecosistema de despliegue más amplio |

La ventaja diferencial de este modelo frente a la base es el ajuste declarado para decisiones restringidas; la desventaja es la ausencia total de evaluación publicada y un ecosistema de despliegue limitado a MLX.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada: se desconoce si el ajuste mejora, iguala o degrada el rendimiento de la base Qwen3-4B.
- La model card no documenta datos de entrenamiento, metodología de ajuste ni hiperparámetros, lo que impide auditar sesgos introducidos.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente si se le pide razonar fuera del conjunto de opciones proporcionado.
- El autor advierte explícitamente de que los resultados deben verificarse contra los requisitos de la aplicación, sobre todo en decisiones con consecuencias significativas.
- Idiomas soportados no documentados; el comportamiento multilingüe tras el ajuste es incierto.
- Longitud de contexto no confirmada por el autor; conviene no asumir la ventana completa de Qwen3 sin probarla.
- Dependencia de Apple Silicon: no es portable a CUDA sin reconversión de pesos, lo que limita su uso en servidores estándar.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace recomendable un piloto controlado antes de desplegarlo.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/certen/DrC-Qwen3-4B-NeuroSymbolic-4bit
- Modelo base cuantizado: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Librería MLX: https://github.com/ml-explore/mlx
- MLX LM: https://github.com/ml-explore/mlx-lm
