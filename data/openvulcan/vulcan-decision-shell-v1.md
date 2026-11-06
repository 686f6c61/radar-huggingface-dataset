# openvulcan/vulcan-decision-shell-v1

## Resumen

Vulcan-decision-shell-v1 es un modelo de clasificación de texto de 752.393.024 parámetros (0,75B) desarrollado por openvulcan, afinado a partir de Qwen3.5-0.8B-Base. Su propósito no es generar texto libre, sino actuar como guardrail de un agente de codificación: recibe como entrada una llamada a herramienta (comando de shell, escritura de fichero, invocación de API) y emite una de tres decisiones discretas: permitir, revisar o bloquear. Resuelve un problema concreto de los entornos agénticos: interceptar acciones potencialmente destructivas antes de que se ejecuten, sin depender de un LLM grande en el bucle crítico.

El modelo pertenece a una familia de tres variantes con la misma política de decisión e idéntico formato de entrada/salida: v1 (0,75B, base Qwen3.5-0.8B), v1-flash (0,36B, base SmolLM2-360M) y v1-mini (0,2B, base ModernBERT-base). La variante v1 es la de mayor calidad y admite hasta 32.768 tokens por llamada. El repositorio principal agrupa todos los formatos en carpetas separadas: pesos FP32 originales, conversiones BF16 y FP16, paquete ONNX CUDA FP16 y formatos experimentales INT8/INT16.

Es relevante ahora porque el despliegue de agentes que ejecutan comandos reales exige mecanismos de control deterministas y de baja latencia. Un clasificador de 0,75B puede ejecutarse en CPU o en GPU de consumo y añadir una capa de seguridad verificable entre el plan del agente y el sistema operativo, algo que un modelo generativo grande no puede ofrecer con la misma previsibilidad ni coste por llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), adaptado a clasificación de 3 clases |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por llamada (límite de la variante v1) |
| Tipos de cuantizacion | FP32 (original), mixed-bf16, BF16, FP16, ONNX CUDA FP16, ONNX INT8 MLP (experimental), INT16 storage (experimental) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch FP32/BF16/FP16), ONNX (CUDA FP16, INT8, INT16 experimentales) |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-0.8B-Base (finetune) |
| Tamaño del repositorio | 11,8 GB (todos los formatos) |
| Descargas | 36 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer decoder-only, y se afina como clasificador de tres clases (allow, review, block) sobre llamadas a herramientas de agentes de codificación. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí publica los bancos de entrenamiento y validación en el repositorio `vulcan-decision-shell-v1-data` (866 MB). Tampoco se especifica si se emplearon RLHF o DPO; la información disponible solo confirma el pipeline de text-classification y la relación de finetune con el modelo base.

Un dato técnico destacable es la validación de precisión: según el autor, la ejecución en `mixed-bf16` coincidió con FP32 en las 531.692 entradas evaluadas, lo que permite reducir el peso del despliegue sin pérdida de decisión observada. El repositorio incluye además un runtime propio (`runtime/judge_native.py`) y un runtime ONNX (`onnx/runtime/judge_onnx.py`) que consumen peticiones en formato JSONL, lo que sugiere un diseño orientado a integración como servicio de filtrado previo a la ejecución de comandos.

## Capacidades

- Clasificación de llamadas a herramientas en tres decisiones: allow, review y block.
- Evaluación de comandos de shell y operaciones de escritura antes de su ejecución.
- Revisión de permisos en flujos de agente de codificación (command-review, permission).
- Soporte de tool calling como objeto de análisis, no como generador de llamadas.
- Procesamiento de entradas largas de hasta 32.768 tokens por llamada (variante v1).
- Ejecución en CPU, CUDA y WebGPU mediante los paquetes ONNX del repositorio runtime.
- Integración con VulcanCode y el plugin dsh, que descargan el paquete adecuado al hardware.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Guardrail de agente de codificación: el modelo se sitúa entre el plan del agente y el sistema operativo; cada comando propuesto se envía como petición y una decisión `block` impide su ejecución, con latencia de un clasificador de 0,75B en lugar de un LLM generativo.
- Revisión de comandos destructivos en CI/CD: integrado en pipelines que ejecutan scripts generados automáticamente, filtra `rm -rf`, escrituras fuera del workspace o cambios de permisos antes de que el runner los aplique.
- Control de permisos en asistentes de terminal: el modelo clasifica cada invocación de herramienta y deriva a `review` los casos ambiguos para confirmación humana, reduciendo interrupciones innecesarias.
- Filtrado previo en plataformas de agentes multi-herramienta: al compartir política y formato de entrada/salida con v1-flash y v1-mini, permite enrutar por tamaño según el hardware disponible sin cambiar la integración.
- Despliegue en entornos con recursos limitados: la variante v1-mini (0,2B, contexto de 8.192 tokens en el paquete runtime) cubre máquinas con poca memoria, mientras v1 se reserva para los casos de mayor calidad.
- Auditoría y registro de decisiones: al emitir etiquetas discretas y deterministas, facilita el registro estructurado de cada acción permitida, revisada o bloqueada para trazabilidad posterior.
- Evaluación offline de políticas de seguridad: los bancos de datos publicados en `vulcan-decision-shell-v1-data` permiten reproducir la validación del clasificador antes de desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la coincidencia entre `mixed-bf16` y FP32 en 531.692 entradas, sin métricas de precisión, recall ni F1 sobre las tres clases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en FP32/mixed-bf16, 1,7 GB en BF16 o FP16 y 2,0 GB en ONNX CUDA FP16, según los tamaños de descarga publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050 en adelante); también en CPU mediante el runtime nativo o los paquetes ONNX.
- Opciones de despliegue: runtime nativo del repositorio (`runtime/judge_native.py`), runtime ONNX (`onnx/runtime/judge_onnx.py`) con backends CUDA, WebGPU y CPU, y los paquetes del repositorio `vulcan-decision-shell-v1-runtime`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto por llamada | Base | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| vulcan-decision-shell-v1 | 0,75B | 32.768 tokens | Qwen3.5-0.8B-Base | Apache 2.0 | Hugging Face (PyTorch y ONNX) |
| vulcan-decision-shell-v1-flash | 0,36B | 32.768 tokens | SmolLM2-360M | no disponible en la información | Hugging Face (PyTorch) |
| vulcan-decision-shell-v1-mini | 0,2B | 8.192 tokens (paquete runtime) | ModernBERT-base | no disponible en la información | Hugging Face (PyTorch) |

Las tres variantes comparten política, formato de entrada y las mismas tres decisiones, por lo que la elección depende de la relación calidad/recursos: v1 para máxima calidad, v1-flash como alternativa cercana en calidad y más rápida, y v1-mini para máquinas con poca memoria o cómputo.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades en castellano ni en otros idiomas.
- El modelo clasifica llamadas a herramientas, no genera texto ni razona de forma abierta; no debe emplearse como LLM de propósito general.
- No se publican métricas de benchmarks ni tasas de falsos positivos/negativos, por lo que el riesgo de clasificación errónea debe evaluarse con los bancos de validación propios.
- La política de decisión es fija (allow, review, block); cambiarla requiere reentrenamiento, no configuración en inferencia.
- Los formatos INT8 MLP e INT16 storage están marcados como experimentales y no cuentan con validación de precisión publicada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B-Base para el despliegue combinado.
- El límite de 32.768 tokens por llamada implica que entradas más largas deben truncarse o dividirse, con posible pérdida de contexto relevante para la decisión.
- El repositorio principal ocupa 11,8 GB; conviene descargar solo la carpeta del formato necesario y verificar la integridad con `SHA256SUMS`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openvulcan/vulcan-decision-shell-v1
- Variante flash: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-flash
- Variante mini: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-mini
- Paquetes ONNX runtime: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-runtime
- Bancos de datos de entrenamiento y validación: https://huggingface.co/datasets/openvulcan/vulcan-decision-shell-v1-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base de la variante flash: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Modelo base de la variante mini: https://huggingface.co/answerdotai/ModernBERT-base
