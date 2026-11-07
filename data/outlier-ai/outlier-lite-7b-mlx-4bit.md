# Outlier-Ai/Outlier-Lite-7B-MLX-4bit

## Resumen

Outlier-Lite-7B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen2.5-7B-Instruct, publicada por Outlier-Ai para su ejecución local sobre Apple Silicon (chips de la serie M). El modelo conserva la arquitectura transformer densa de Qwen2.5-7B-Instruct con 7.615.616.512 parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5), empaquetada en un repositorio de 8,6 GB de safetensors.

Su relevancia práctica es acotada: la propia model card lo marca explícitamente como un artefacto de investigación ("superseded") de una línea anterior de Outlier, conservado únicamente por reproducibilidad y no recomendado para producción. El autor redirige a las variantes actuales de su familia (Nano 4B, Core 27B, Vision 35B-A3B) y a la aplicación Outlier para Mac. Por tanto, debe evaluarse como una instantánea histórica de una cuantización MLX, no como un modelo entrenado desde cero.

El interés técnico reside en que demuestra el flujo de cuantización de un modelo instruct multilingüe de 7B a 4 bits para Metal/MLX, con soporte declarado de 15 idiomas (incluido el español) y de function calling heredado de Qwen2.5-Instruct. Su licencia Apache 2.0 facilita la inspección del artefacto, aunque las cifras de rendimiento publicadas por el autor no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), cuantizado en MLX |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la ficha del repositorio; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con RoPE scaling y YaRN) |
| Tipos de cuantizacion | 4 bits (MLX); la etiqueta "awq" aparece en los tags del repositorio, pero no se documenta el metodo exacto de cuantizacion |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por Outlier-Ai, sino una cuantización del checkpoint Qwen/Qwen2.5-7B-Instruct. La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen2, con atención de consultas agrupadas (GQA) y normalización RMSNorm, en su variante instruct afinada por Alibaba Qwen. La model card no aporta detalles sobre el proceso de cuantización (número de grupos, calibración, si se usó AWQ o cuantización lineal por bloques de MLX), y advierte que el artefacto puede contener "adaptadores, overlays o variantes de cuantización experimentales" que no llegaron al producto final.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO aplicadas, más allá de lo que documenta públicamente el modelo base. La innovación técnica atribuible a este repositorio se limita al empaquetado MLX para Metal: pesos en 4 bits que reducen el checkpoint a 8,6 GB y permiten inferencia en memoria unificada de Apple Silicon sin GPU dedicada. El autor califica cualquier afirmación técnica de revisiones anteriores de la model card como provisional.

## Capacidades

- Generación de texto y conversación multi-turno en modo instruct/chat.
- Razonamiento general y respuesta a preguntas de conocimiento, con calidad heredada de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas a nivel de un modelo de 7B (sin datos de benchmark verificados en este repositorio).
- Function calling / tool use, según los tags del autor y las capacidades del modelo base.
- Soporte multilingüe declarado en 15 idiomas, incluidos español, inglés, chino, francés, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline sobre Apple Silicon (M1, M2, M3, M4) mediante MLX y Metal.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Prototipado de asistentes conversacionales en Mac: permite validar prompts y flujos de chat multi-turno en local con un modelo de 7B en 4 bits, sin coste de API y con la ventana de contexto del modelo base.
- Evaluación de cuantización MLX: sirve como referencia para medir la degradación de calidad de un Qwen2.5-7B al pasar a 4 bits en Metal, comparando respuestas contra el checkpoint original en FP16.
- Procesamiento de documentos confidenciales en equipo de sobremesa: al ejecutarse offline, permite resumir o extraer información de textos sensibles sin enviarlos a la nube, siempre que el contenido quepa en el contexto disponible.
- Automatización de tareas con tool calling en entornos de desarrollo: integrable en scripts de macOS que invoquen funciones locales (sistema de ficheros, APIs internas) aprovechando el soporte de function calling del modelo base.
- Asistencia de redacción multilingüe: útil para borradores y traducciones entre los 15 idiomas declarados, con revisión humana obligatoria por el riesgo de alucinación de un modelo de 7B.
- Reproducibilidad de experimentos: al ser un artefacto histórico, permite replicar resultados de publicaciones o pipelines que dependían de esta versión concreta de la cuantización.
- Docencia y formación: adecuado para demostrar en un portátil Apple cómo funciona la inferencia cuantizada y el pipeline MLX, sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y remite a outlier.host para cifras verificadas de la línea actual, no de este artefacto.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,6 GB en disco; en ejecución, MLX necesita cargar los pesos en memoria unificada, por lo que se recomienda un Mac con al menos 16 GB de RAM unificada para dejar margen al contexto y al sistema.
- GPU compatibles: chips Apple Silicon M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra) mediante Metal; no está pensado para GPUs NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en Macs con 16 GB o más de memoria unificada; en equipos de 8 GB la carga es ajustada y limita la longitud de contexto efectiva.
- Opciones de despliegue: librería MLX y ecosistema mlx-community (por ejemplo, mlx_lm), y la aplicación Outlier para Mac (instalable vía `brew install --cask outlier-host/tap/outlier`). No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-Lite-7B-MLX-4bit | 7,6 B (denso) | no especificado en el repo (base: 32.768) | MLX 4 bits, Apple Silicon | Apache 2.0 | Artefacto histórico, no recomendado |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6 B (denso) | 32.768 (hasta 131.072 con YaRN) | safetensors FP16/BF16, GPU NVIDIA/AMD | Apache 2.0 | Modelo base oficial, mantenido |
| Outlier-Nano-4B-MLX-4bit | 4 B (denso) | no disponible | MLX 4 bits, Apple Silicon | no disponible en la información | Nivel de entrada actual de Outlier |
| Outlier-Core-27B-MLX-4bit | 27 B (denso) | no disponible | MLX 4 bits, Apple Silicon | no disponible en la información | Nivel por defecto actual de Outlier |

## Limitaciones y advertencias

- Modelo marcado como obsoleto por su propio autor: la model card lo describe como artefacto de investigación superado, conservado solo por reproducibilidad y no recomendado para producción.
- Rendimiento no verificado: no hay benchmarks publicados para esta cuantización; las afirmaciones de revisiones anteriores de la model card se califican como provisionales.
- Posible contenido experimental: el autor advierte de que el repositorio puede incluir adaptadores u overlays que no llegaron al producto final.
- Degradación por cuantización: la reducción a 4 bits puede afectar a tareas sensibles a la precisión, como matemáticas o código, sin que se documente el método exacto de cuantización.
- Riesgo de alucinación inherente a un modelo de 7B, especialmente en consultas factuales de nicho y en contextos largos.
- Contexto efectivo limitado: la ficha no declara la longitud de contexto de esta variante y la memoria unificada del Mac condiciona cuántos tokens caben realmente.
- Idiomas: aunque se declaran 15, la calidad relativa fuera de inglés y chino no está medida en este repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia original y verificarse las condiciones del modelo base Qwen2.5.
- Etiqueta "awq" en los tags sin documentación que la respalde: conviene tratar el método de cuantización como no confirmado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Lite-7B-MLX-4bit
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Lite-7B-MLX-4bit/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sitio del autor (redirección de la model card): https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B MLX 4-bit (Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B MLX 4-bit (Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
