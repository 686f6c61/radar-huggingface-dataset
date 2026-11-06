# openvulcan/vulcan-decision-shell-v1-mini

## Resumen

vulcan-decision-shell-v1-mini es un modelo de clasificación de texto de 199.088.899 parámetros (0,2B) desarrollado por openvulcan, afinado a partir de answerdotai/ModernBERT-base. Su función es actuar como guardrail o "shell de decisión" para agentes de código: recibe una llamada a herramienta (tool call) propuesta por un agente de IA y emite una de tres decisiones —permitir, revisar o bloquear— antes de que el comando se ejecute. Forma parte de una familia de tres modelos con la misma política y el mismo formato de entrada, junto a v1 (0,75B, basado en Qwen3.5-0.8B-Base) y v1-flash (0,36B, basado en SmolLM2-360M).

El modelo está pensado para máquinas con poca memoria o cómputo, ya que su tamaño reducido permite ejecutarlo en CPU o en GPU de gama baja con latencias muy bajas. El repositorio incluye pesos en FP32 originales (0,80 GB), además de conversiones FP16, BF16, FP16 mixto, almacenamiento INT16 y una variante TorchAO INT8 del MLP; solo los pesos FP32 originales constituyen la línea base cualificada, mientras que el resto requiere el flag `--allow-experimental-precision`. Para despliegue ONNX existe un paquete de runtime separado (vulcan-decision-shell-v1-runtime) con soporte CUDA, WebGPU y CPU.

La relevancia actual del modelo reside en la creciente adopción de agentes de código autónomos que ejecutan comandos en terminales y sistemas de ficheros, un escenario donde un clasificador ligero y determinista de permisos aporta una capa de seguridad de bajo coste. La licencia Apache 2.0 y el formato estándar de transformers facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, afinado) |
| Parametros totales | 199.088.899 (0,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (paquete de runtime) |
| Tipos de cuantizacion | FP32 (original), FP16, BF16, FP16 mixto, INT16 storage, TorchAO INT8 MLP (experimental) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch nativo); ONNX en repositorio separado |
| Pipeline | text-classification |
| Modelo base | answerdotai/ModernBERT-base |
| Tamaño del repositorio | 3,1 GB |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, un transformer encoder con atención bidireccional y mecanismos modernos de eficiencia (atención local/global alternada y RoPE), afinado para una tarea de clasificación de tres clases: permitir, revisar o bloquear una llamada a herramienta propuesta por un agente de código. La salida es una decisión discreta sobre la llamada (comando, herramienta y argumentos), no texto generativo. El repositorio incluye los pesos originales en FP32 como línea base cualificada, junto con conversiones de precisión que el autor marca como experimentales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El autor publica un repositorio de datos separado (vulcan-decision-shell-v1-data, 866 MB) que contiene los bancos de entrenamiento y validación. La familia comparte la misma política, el mismo formato de entrada y las mismas tres decisiones entre los tres tamaños, lo que permite intercambiar modelos sin cambiar la integración.

## Capacidades

- Clasificación de llamadas a herramientas en tres decisiones: permitir, revisar o bloquear.
- Revisión de comandos de shell y operaciones sobre el sistema de ficheros propuestas por agentes de código.
- Evaluación de permisos en el contexto de tool calling y coding agents.
- Salida determinista y de baja latencia, adecuada para ejecutarse en línea antes de cada comando.
- Soporte de ejecución en CPU mediante el entry `cpu_decision.py` y en GPU mediante `decision.py`.
- Capacidad multilingüe limitada al inglés.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso.

## Casos de uso

- Guardrail en agentes de código autónomos: interceptar cada tool call antes de ejecutarla y clasificarla como permitida, revisable o bloqueada, con una latencia mínima gracias a sus 0,2B de parámetros.
- Revisión de comandos de shell en pipelines de CI/CD: validar automáticamente los comandos que un agente propone ejecutar en el runner y detener los que requieran revisión humana.
- Control de permisos en asistentes de terminal: integrar el modelo en un plugin de shell que consulte la decisión antes de ejecutar operaciones destructivas sobre el sistema de ficheros.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o en GPU de gama baja junto al agente principal, sin competir por VRAM.
- Filtrado previo en plataformas de agentes multi-herramienta: clasificar llamadas a APIs y herramientas externas para aplicar políticas de seguridad homogéneas entre distintos agentes.
- Evaluación de políticas de seguridad en investigación: usar el banco de validación publicado en vulcan-decision-shell-v1-data para medir la tasa de bloqueos y revisiones de una política concreta.
- Integración vía ONNX en aplicaciones web: el paquete vulcan-decision-shell-v1-runtime permite ejecutar el modelo en WebGPU o CPU desde el navegador o desde servicios ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP32 originales ocupan 0,80 GB; las conversiones FP16/BF16 reducen aproximadamente a la mitad el espacio de pesos. El repositorio completo ocupa 3,1 GB, pero solo es necesario descargar la carpeta de la precisión elegida.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo es lo bastante pequeño para ejecutarse junto a un agente principal en una RTX 4090, A100 o H100 sin impacto apreciable.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: PyTorch nativo con `decision.py` (GPU) y `cpu_decision.py` (CPU); ONNX Runtime con soporte CUDA, WebGPU y CPU a través de vulcan-decision-shell-v1-runtime; el autor menciona integración con VulcanCode y el plugin dsh.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y su naturaleza de encoder, se espera una latencia muy baja por llamada, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vulcan-decision-shell-v1-mini | 199.088.899 (0,2B) | 8.192 tokens | ModernBERT-base | Apache 2.0 | Hugging Face (PyTorch) |
| vulcan-decision-shell-v1-flash | 361.821.120 (0,36B) | 32.768 tokens | SmolLM2-360M | Apache 2.0 | Hugging Face (PyTorch) |
| vulcan-decision-shell-v1 | 752.393.024 (0,75B) | 32.768 tokens | Qwen3.5-0.8B-Base | Apache 2.0 | Hugging Face (PyTorch y ONNX) |

Las tres variantes comparten política, formato de entrada y decisiones, por lo que la elección depende del equilibrio entre calidad y recursos: v1-mini es la opción para máquinas con poca memoria o cómputo, v1-flash se acerca a la calidad de v1 con mayor velocidad, y v1 ofrece la mejor calidad con un contexto de 32.768 tokens.

## Limitaciones y advertencias

- Solo soporta inglés; las llamadas a herramientas en otros idiomas pueden clasificarse de forma menos fiable.
- Es un clasificador, no un generador: no explica sus decisiones ni razona sobre casos ambiguos.
- La ventana de contexto del paquete de runtime es de 8.192 tokens, inferior a los 32.768 tokens de v1 y v1-flash, lo que limita la longitud de las llamadas que puede evaluar.
- Solo los pesos FP32 originales están cualificados como línea base; las variantes FP16, BF16, INT16 e INT8 se marcan como experimentales y requieren el flag `--allow-experimental-precision`.
- Riesgo de falsos negativos y falsos positivos en la clasificación de comandos: una decisión de "permitir" incorrecta puede tener consecuencias destructivas, por lo que se recomienda combinarla con otras capas de seguridad.
- No se dispone de información publicada sobre sesgos, datos de entrenamiento ni evaluación externa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-mini
- Modelo v1: https://huggingface.co/openvulcan/vulcan-decision-shell-v1
- Modelo v1-flash: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-flash
- Paquete de runtime ONNX: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-runtime
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/openvulcan/vulcan-decision-shell-v1-data
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
