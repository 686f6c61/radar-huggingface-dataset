# Outlier-Ai/Outlier-Compact-14B-MLX-4bit

## Resumen

Outlier-Compact-14B-MLX-4bit es una cuantizacion en formato MLX de 4 bits del modelo Qwen2.5-14B-Instruct, publicada por Outlier-Ai para su ejecucion en Apple Silicon (chips de la serie M). El modelo base es un transformer denso de 14.770.033.664 parametros desarrollado originalmente por Alibaba Qwen, y esta version lo empaqueta con la libreria MLX de Apple para inferencia local en macOS sobre Metal, sin necesidad de GPU dedicada ni conexion a la nube.

El objetivo del artefacto es permitir ejecutar un modelo de 14B en equipos de sobremesa y portatiles con memoria unificada, manteniendo las capacidades conversacionales, de razonamiento y de tool calling del modelo original. Segun la propia model card, se trata de un artefacto de investigacion de una linea anterior de la familia Outlier, conservado por reproducibilidad y no recomendado como descarga de produccion; el autor redirige a sus tiers actuales (Nano 4B, Core 27B, Vision 35B-A3B).

La relevancia actual es doble: por un lado documenta el estado de la cuantizacion MLX de 4 bits aplicada a un modelo denso de 14B; por otro, sirve como referencia historica de una familia de modelos locales orientados a consumer hardware. La licencia Apache 2.0 del modelo base se preserva en esta distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), pesos en formato MLX |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | 4 bits (MLX); la model card menciona la etiqueta "awq" sin detallar el esquema exacto |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); tamano del repo 16,7 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-14B-Instruct, un transformer denso de tipo decoder-only con atencion causal estandar, desarrollado por Alibaba Qwen. Esta distribucion no reentrena el modelo: aplica una cuantizacion de 4 bits en formato MLX sobre los pesos originales para reducir el footprint de memoria y permitir inferencia en Apple Silicon. El proceso de cuantizacion lo firma Outlier-Ai (campo `quantized_by`), y la relacion declarada con el modelo base es `quantized`.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, fases de RLHF o DPO), ni sobre el procedimiento exacto de cuantizacion (grupo de escala, calibracion, posible uso de AWQ). La model card califica el artefacto como "research / preview" y advierte que puede contener adaptadores u overlays experimentales que no llegaron al producto final, por lo que cualquier afirmacion tecnica de revisiones anteriores de la tarjeta debe considerarse provisional.

## Capacidades

- Generacion de texto conversacional multi-turno en 15 idiomas, incluido el castellano.
- Razonamiento y conocimiento general, heredados de Qwen2.5-14B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del modelo base; sin benchmarks publicados en esta ficha).
- Tool calling y function calling, segun las etiquetas del repositorio (`function-calling`, `tool-use`).
- Uso en agentes y razonamiento multi-paso (etiqueta `tool-use`, sin detalles adicionales en la informacion disponible).
- Inferencia totalmente local y offline sobre Metal en macOS, sin llamadas a servicios externos.
- Ejecucion en hardware Apple Silicon (M1, M2, M3, M4) mediante la libreria MLX.

## Casos de uso

- Asistente personal offline en un Mac: el modelo se ejecuta integramente en local sobre memoria unificada, lo que permite conversaciones privadas sin enviar datos a la nube; adecuado para entornos con requisitos de confidencialidad.
- Prototipado de aplicaciones de chat en macOS: al estar en formato MLX, se integra con el ecosistema `mlx` y `mlx-lm` para construir demos rapidas en portatiles de la serie M sin GPU dedicada.
- Automatizacion de tareas con tool calling: las etiquetas del repositorio indican soporte de function calling, lo que permite conectarlo a herramientas locales (ficheros, shell, APIs internas) en flujos de agente de un solo equipo.
- Procesamiento de documentos multilingues: con 15 idiomas declarados, sirve para resumir y traducir contenido en castellano, ingles, chino, frances, aleman, etc., en pipelines por lotes ejecutados de noche en un Mac de sobremesa.
- Evaluacion e investigacion de cuantizacion: al ser un artefacto de investigacion, es util para medir la degradacion de calidad de un 14B denso a 4 bits frente al modelo original en tareas concretas.
- Base para fine-tuning local ligero: al conservar licencia Apache 2.0 y pesos safetensors, puede servir como punto de partida para adaptaciones (LoRA) en entornos Apple Silicon, siempre asumiendo su caracter de artefacto no recomendado para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 16,7 GB en disco; en inferencia a 4 bits se requiere aproximadamente esa cifra de memoria unificada, por lo que un Mac con 24 GB o mas es el minimo practico y 32 GB o superior es recomendable para contexto largo.
- GPU recomendadas: no aplica GPU dedicada; el modelo esta pensado para Apple Silicon (M1, M2, M3, M4) con backend Metal.
- Cabe en consumer hardware: si, en equipos Apple Silicon con memoria unificada suficiente; no esta pensado para GPUs NVIDIA ni para CUDA.
- Opciones de despliegue: libreria MLX (`mlx-lm`) y la aplicacion Outlier para macOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y el formato MLX no es directamente compatible con ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Compact-14B-MLX-4bit | 14,77B | no disponible | MLX 4 bits | Apache 2.0 | Artefacto de investigacion, superseded por el autor |
| Qwen2.5-14B-Instruct (original) | 14,77B | 32.768 tokens (dato del modelo base, no confirmado aqui) | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar; requiere mas memoria |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | MLX 4 bits | no disponible | Tier actual por defecto segun la model card |
| Outlier-Nano-4B-MLX-4bit | no disponible | no disponible | MLX 4 bits | no disponible | Tier de entrada actual segun la model card |

## Limitaciones y advertencias

- Artefacto obsoleto: la propia model card lo declara "superseded" y no recomendado para produccion; el autor redirige a sus tiers actuales.
- Calidad degradada por cuantizacion: la reduccion a 4 bits puede introducir perdida de precision en tareas de razonamiento y codigo frente al modelo base en BF16; no se publican evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta distribucion.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU generica sin conversion.
- Ambiguedad en la cuantizacion: la etiqueta "awq" aparece en los tags pero la model card no detalla el esquema; conviene verificar el proceso antes de confiar en el comportamiento numerico.
- Licencia: Apache 2.0 permite uso comercial, pero el caracter experimental del artefacto y la advertencia del autor desaconsejan su uso en produccion sin validacion propia.
- Idiomas: aunque se declaran 15, no hay evaluaciones por idioma; el rendimiento en castellano no esta medido en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Compact-14B-MLX-4bit
- Discusiones: https://huggingface.co/Outlier-Ai/Outlier-Compact-14B-MLX-4bit/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Tier actual Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Tier actual Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Tier actual Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B MLX: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B MLX: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
- Plataforma Outlier AI (freelancers): https://outlier.ai/
