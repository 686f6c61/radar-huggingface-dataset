# OsaurusAI/Qwen3.8-27B-MXFP8

## Resumen

OsaurusAI/Qwen3.8-27B-MXFP8 es una cuantización en formato MXFP8 (e8m0, group size 32) del modelo Qwen/Qwen3.8-27B, un VLM denso de 27B parámetros desarrollado por Qwen, con arquitectura híbrida que combina 48 capas GatedDeltaNet con 16 capas de atención completa. El bundle ha sido calibrado y empaquetado por OsaurusAI (Jinho Jang) específicamente para ejecutarse en Apple Silicon mediante la librería MLX, con soporte verificado para texto, imagen y video.

La relevancia de este modelo radica en que permite ejecutar un VLM de última generación con ventana de contexto nativa de 262.144 tokens (extensible a 1M) en un Mac con 36 GB de memoria unificada, manteniendo capacidades avanzadas como razonamiento con control de esfuerzo, tool calling, agente multi-turno y un head de multi-token prediction (MTP) preservado para decodificación especulativa. La cuantización no es uniforme: asigna bits por módulo según sensibilidad Hessiana, manteniendo atención en alta precisión y dejando en fp16 las proyecciones de visión que no son divisibles por el grupo de cuantización.

El bundle incluye un contrato de servido completo estampado en `generation_config.json` y `jang_config.json`, con presets de muestreo, niveles de razonamiento y configuración de thinking mode, lo que facilita su integración en runtimes compatibles con MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas (48 GatedDeltaNet + 16 gated full-attention, partial RoPE dim 64) |
| Parametros totales | 27B (modelo base dense) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 nativo, extensible a 1M |
| Tipos de cuantizacion | MXFP8 (e8m0, group size 32) |
| Idiomas soportados | Inglés (según model card; el modelo base Qwen3.8 soporta más idiomas, pero no se especifica en este bundle) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors contiene 7.906.597.552 parámetros almacenados (resultado de la cuantización), pero el modelo base completo es de 27B.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un VLM denso con una arquitectura híbrida que intercala 48 capas GatedDeltaNet (una variante de SSM con puertas) y 16 capas de atención completa con RoPE parcial (dimensión 64). Incluye un tower de visión nativo para imágenes y video, y un head de multi-token prediction (MTP) entrenado por Qwen con múltiples pasos, que se conserva íntegro en este bundle (31 tensores en un shard propio).

La cuantización MXFP8 aplicada por OsaurusAI no es una conversión uniforme: cada uno de los 590 módulos cuantizados recibe su ancho de bits a partir de una captura de sensibilidad basada en la traza Hessiana (tr(H)·||W||²_F) sobre estadísticas de activación de un corpus de calibración. Las capas de atención se mantienen en alta precisión, mientras que los bloques FFN insensibles devuelven presupuesto de bits. Las 27 proyecciones `linear_fc2` del bloque de visión (con in_features 4304, no divisible por el grupo de cuantización MLX) se dejan en fp16 para evitar roturas silenciosas. Se aplicó imatrix y asignación Hessiana; AWQ y GPTQ se descartaron explícitamente por riesgos de seguridad en la convención de normalización centrada en cero de esta familia.

No se proporcionan detalles del entrenamiento original del modelo base (datos, tokens, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto con razonamiento avanzado: thinking mode activado por defecto con niveles de esfuerzo `low`, `medium` y `xhigh` (default `xhigh`), controlable vía kwarg del chat template.
- Comprensión de imágenes y video: el tower de visión nativo está verificado en este bundle; los prompts de video deben renderizarse a través del chat template propio (tipo `{"type": "video"}`).
- Tool calling / function calling: soporte nativo con parser `qwen3_coder` para extracción de llamadas a herramientas.
- Capacidades de agente: razonamiento multi-paso con `preserve_thinking` activado por defecto, que retiene el contexto de razonamiento entre turnos (nuevo en esta generación y compatible con prefix caching).
- Multi-token prediction (MTP): head preservado para decodificación especulativa, con sidecar `vmlx_mtp_tuning.json` que recomienda 1 token de borrador por paso.
- Multilingüe: aunque la model card solo declara inglés, el modelo base Qwen3.8 es multilingüe; no se confirma el alcance en este bundle.

## Casos de uso

- Atención al cliente con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno extensas con historial completo, ideal para soporte técnico o jurídico donde se necesita recordar detalles de interacciones previas.
- Análisis de documentos con imágenes: al ser un VLM, puede procesar facturas, capturas de pantalla o diagramas junto con texto, extrayendo información estructurada en flujos de automatización documental.
- Agente de codigo en produccion: con tool calling y parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, usando el preset de agente (temperature=1.0, top_p=0.95) recomendado para coding agents.
- Razonamiento complejo con control de esfuerzo: en entornos donde el coste computacional importa, se puede ajustar `reasoning_effort` a `low` para tareas simples o `xhigh` para problemas de matemáticas o planificación multi-paso.
- Procesamiento de video: el tower de visión nativo permite resumir o extraer información de clips de video, útil para análisis de vigilancia, revisión de contenido o accesibilidad.
- Despliegue local en Mac con MLX: al ser un bundle MLX, se ejecuta con `mlx_vlm` en Apple Silicon sin necesidad de GPU NVIDIA, adecuado para prototipado y aplicaciones de escritorio con privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon con al menos 36 GB de memoria unificada (según la model card).
- GPU: cualquier chip Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) con suficiente RAM unificada; no es compatible con GPUs NVIDIA o AMD por estar compilado para MLX.
- Tamaño en disco: 26.8 GiB.
- Opciones de despliegue: `mlx_vlm` (librería oficial de MLX para VLM), con carga mediante `load("OsaurusAI/Qwen3.8-27B-MXFP8")`. También puede usarse con otros runtimes que soporten MLX y safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información disponible. El bundle pertenece a una familia de cuatro cuantizaciones del mismo modelo base (JANG_2D, JANG_4D, JANG_6D y MXFP8), que difieren en tamaño y calidad, pero no se aportan métricas comparativas entre ellas.

## Limitaciones y advertencias

- Idioma: la model card solo declara inglés; el uso en otros idiomas no está verificado en este bundle.
- Hardware: exclusivo para Apple Silicon; no es portable a entornos CUDA sin reconvertir los pesos.
- Pérdida de precisión: la cuantización MXFP8 puede introducir degradación frente al modelo en fp16, especialmente en tareas sensibles a la precisión numérica.
- Cuantización parcial: las proyecciones de visión con dimensiones no divisibles se mantienen en fp16, lo que aumenta ligeramente el uso de memoria pero evita errores.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el thinking mode puede generar razonamientos plausibles pero incorrectos, por lo que se recomienda validación humana en aplicaciones críticas.
- Contexto largo: aunque la ventana nativa es de 262.144 tokens, el uso de contextos muy extensos incrementa el consumo de memoria y puede requerir más de 36 GB en la práctica.
- Sin benchmarks publicados: no hay evidencia independiente de rendimiento para este bundle concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.8-27B-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Osaurus AI: https://osaurus.ai
- Bundles hermanos: [JANG_2D](https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_2D) · [JANG_4D](https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_4D) · [JANG_6D](https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_6D)
