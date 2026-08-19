# Cyleux/qwen38-mtp-head-fcbf16

## Resumen

El modelo `Cyleux/qwen38-mtp-head-fcbf16` es un repack de precisión mixta del cabezal de predicción multi-token (MTP head) del modelo Qwen3.8-27B, desarrollado por el usuario Cyleux. Este componente auxiliar se utiliza para acelerar la decodificación especulativa: el head propone varios tokens candidatos que luego son verificados por el modelo principal, reduciendo el coste computacional por token generado. Su relevancia radica en que permite ejecutar decodificación especulativa con menor uso de memoria y mayor velocidad en hardware consumer, manteniendo la calidad de aceptación del head original en bf16.

El repack conserva el tensor `fc.weight` en bf16 original (responsable de la mayor parte del coste de aceptación bajo cuantización uniforme) y cuantiza las otras siete proyecciones 2D a 4-bit con grupo de 64, mientras que las normas 1D permanecen en bf16. Con solo 110,6 millones de parámetros y un tamaño de repositorio de 0,3 GB, este head está diseñado para integrarse en pipelines de inferencia con llama.cpp (desde el PR #22673 de julio de 2026) y en el ecosistema MLX, tal como promueve el desafío Layr-Labs qwen-3.8-mtp-challenge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (Multi-Token Prediction) para Qwen3.8-27B |
| Parametros totales | 110.618.112 (~110,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (componente auxiliar, hereda la del modelo base) |
| Tipos de cuantizacion | bf16 (fc.weight y normas 1D), 4-bit group-64 (proyecciones 2D) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El MTP head es un componente del modelo Qwen3.8-27B que predice varios tokens futuros en paralelo, permitiendo que el modelo principal verifique un bloque de tokens de una sola pasada. Este repack no ha sido entrenado desde cero; es una re-cuantización del head original `EigenLabs/Qwen3.8-27B-MTP-bf16` (commit @26a328e0) con el objetivo de reducir su huella de memoria manteniendo la tasa de aceptación de tokens. La decisión de mantener `fc.weight` en bf16 se basa en mediciones por tensor que atribuyen a esta capa el coste completo de aceptación cuando se aplica cuantización uniforme de 4 bits. Las proyecciones restantes se cuantizan con `mx.quantize` de MLX 0.32.0, siguiendo la geometría del head frontera actual del desafío.

No se dispone de información sobre el entrenamiento del head original ni sobre el dataset utilizado, ya que el repositorio solo documenta el proceso de repack. La verificación de tokens la realiza el modelo objetivo fijado (pinned target), que valida cada token emitido por el head.

## Capacidades

- Aceleración de decodificación especulativa: el head propone bloques de tokens que el modelo principal verifica, reduciendo el número de pasos de autogregresión.
- Compatibilidad con llama.cpp: desde el PR #22673 (julio de 2026), llama.cpp soporta decodificación especulativa con cabezales MTP, cargando los tensores `blk.*.nextn.*` de los GGUF de unsloth.
- Compatibilidad con MLX: el head está orientado al desafío Layr-Labs, que utiliza MLX para la inferencia en Apple Silicon.
- Precisión mixta optimizada: mantiene la capa crítica en bf16 mientras reduce el resto a 4-bit, equilibrando memoria y calidad de aceptación.
- Integración con el modelo base Qwen3.8-27B: funciona como un componente adicional que se conecta al backbone para generar propuestas multi-token.

## Casos de uso

- Inferencia local de Qwen3.8-27B en hardware consumer: al reducir el tamaño del head de 0,3 GB, se puede ejecutar decodificación especulativa en GPUs con poca VRAM (por ejemplo, RTX 3060 o inferiores) sin sacrificar la tasa de aceptación, ya que `fc.weight` permanece en bf16.
- Despliegue en servidores de inferencia con llama.cpp: integrar este head en el servidor de llama.cpp permite aumentar el throughput de decodificación entre un 33 y un 39 por ciento según el repositorio de sudoingX, al aceptar múltiples tokens por paso.
- Aceleración de generación en Apple Silicon con MLX: el head está preparado para el benchmark `mlxfast-challenge-dev-qwen38-mtp`, lo que lo hace adecuado para aplicaciones que requieran baja latencia en Macs con chips M-series.
- Optimización de costes en APIs de inferencia: al reducir la memoria necesaria para el head, se pueden servir más peticiones concurrentes en la misma GPU, abaratando el coste por token.
- Prototipado de sistemas de agentes con razonamiento multi-paso: la decodificación especulativa acelera la generación de cadenas de pensamiento largas, reduciendo la latencia percibida en aplicaciones de agentes conversacionales.
- Evaluación de técnicas de cuantización selectiva: sirve como caso de estudio para medir el impacto de la cuantización por tensor en cabezales de predicción, útil para investigadores que trabajan en compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este head en la información disponible. El repositorio del desafío Layr-Labs define un benchmark (`mlxfast-challenge-dev-qwen38-mtp`), pero no se proporcionan números concretos de rendimiento, tasa de aceptación ni comparativas con otros cabezales. El repositorio de sudoingX menciona una mejora del 33-39 % en velocidad de decodificación al usar el flag de llama.cpp, pero no desglosa los resultados por variante de cuantización.

## Requisitos de hardware

- VRAM estimada: el head ocupa 0,3 GB en disco; en memoria, con la cuantización mixta, cabe en cualquier GPU con al menos 1 GB de VRAM libre, aunque el modelo base Qwen3.8-27B requerirá su propia memoria (típicamente 16-24 GB en cuantización 4-bit).
- GPU recomendadas: cualquier GPU compatible con CUDA (llama.cpp) o Apple Silicon (MLX). Para el modelo base completo, se recomiendan RTX 3090/4090, A100 o H100.
- Compatibilidad con GPU consumer: sí, el head es extremadamente ligero y puede ejecutarse en GPUs integradas, siempre que el modelo base quepa en la memoria disponible.
- Opciones de despliegue: llama.cpp (servidor con soporte MTP), MLX (para Apple Silicon), y potencialmente vLLM si se añade soporte para cabezales externos.
- Latencia y throughput: no se dispone de mediciones directas; la ganancia esperada es del 33-39 % en velocidad de decodificación según el repositorio de sudoingX, pero depende del hardware y de la tasa de aceptación del head.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Uso | Licencia |
|---|---|---|---|---|
| EigenLabs/Qwen3.8-27B-MTP-bf16 (head original) | ~110,6 M | bf16 completo | Referencia para el desafío | apache-2.0 |
| Cyleux/qwen38-mtp-head-fcbf16 (este) | ~110,6 M | bf16 + 4-bit group-64 | Menor memoria, misma funcionalidad | apache-2.0 |
| Frontier head del desafío Layr-Labs | no disponible | 4-bit group-64 (según la model card) | Referencia de rendimiento | apache-2.0 |

La comparativa se limita a cabezales MTP para Qwen3.8-27B. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El head original en bf16 es la referencia de calidad, mientras que este repack ofrece un equilibrio entre memoria y calidad de aceptación. El frontier head del desafío utiliza la misma geometría de cuantización, pero no se conocen sus pesos exactos.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: requiere el backbone Qwen3.8-27B y no puede usarse de forma independiente.
- Dependencia de soporte en frameworks: la decodificación especulativa con MTP solo funciona en versiones recientes de llama.cpp (PR #22673) y en MLX; versiones anteriores ignorarán los tensores del head.
- La cuantización 4-bit de las proyecciones puede degradar ligeramente la tasa de aceptación en comparación con el head bf16 completo, aunque la capa `fc.weight` se mantiene en bf16 para mitigar este efecto.
- No se han publicado evaluaciones de sesgos ni de alucinación para este head; al ser un componente auxiliar, su impacto en la calidad final depende del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto experimental sin validación comunitaria amplia.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones; se recomienda verificar la licencia de EigenLabs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cyleux/qwen38-mtp-head-fcbf16
- Modelo base: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Desafío Layr-Labs: https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
- Repositorio de sudoingX sobre el flag de llama.cpp: https://github.com/sudoingX/qwen38-mtp
- Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
