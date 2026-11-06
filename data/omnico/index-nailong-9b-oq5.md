# Omnico/Index-Nailong-9B-oQ5

## Resumen

Index-Nailong-9B-oQ5 es una cuantización mixta de precisión del modelo Index-Nailong-9B, publicada por el usuario Omnico en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización afín con distintos niveles de bits según la sensibilidad de cada tensor, logrando un peso efectivo medio de 5,700 bits por peso. El resultado es un artefacto de 6,4 GB (5,942 GiB de pesos) que contiene 8.953.803.264 parámetros lógicos.

El modelo base pertenece a la familia Qwen3.5 (según el tag `qwen3_5`), una arquitectura transformer de aproximadamente 9B parámetros. La cuantización está pensada exclusivamente para MLX, el framework de Apple para ejecución en silicio de la serie M, por lo que su despliegue está restringido a equipos Mac con memoria unificada suficiente.

La relevancia de esta ficha es limitada: se trata de un artefacto de cuantización de un modelo derivado, sin model card descriptiva del modelo base, sin datos de entrenamiento, sin benchmarks y sin licencia declarada. No hay información pública sobre el modelo original Index-Nailong-9B en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 8.953.803.264 (8,954B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Afín mixta: 5-bit grupo 64 (80,564% de pesos), 6-bit grupo 64 (19,183%), 8-bit grupo 64 (0,242%), BF16 (0,012%); media efectiva 5,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento. El modelo base es un transformer de la familia Qwen3.5 con 8,954B parámetros lógicos, del cual no se dispone de información sobre número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención (estándar, GQA, etc.). Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica del artefacto reside en la cuantización mixta de oQ (oMLX v0.7.3): asigna 5 bits a la mayoría de tensores (80,56%), 6 bits a un 19,18% (presumiblemente capas más sensibles), 8 bits a un 0,24% y mantiene en BF16 un 0,012%. Esta distribución busca preservar la calidad del modelo base reduciendo el tamaño a 5,942 GiB. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5, sin verificación independiente en esta ficha.
- Código y matemáticas: presumibles por la familia Qwen, pero no documentadas para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en MLX: única vía de despliegue documentada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el tamaño de 5,942 GiB permiten ejecutar el modelo en equipos con memoria unificada de 16 GB o superior, usando `mlx-lm` como runtime.
- Prototipado de aplicaciones de texto en local: útil para desarrolladores que quieran probar un modelo de ~9B sin depender de la nube, siempre que acepten la ausencia de garantías de licencia.
- Evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para medir la pérdida de calidad de la cuantización mixta 5,7 bits frente al modelo base en BF16.
- Experimentación con Qwen3.5 en entornos Apple: permite estudiar el comportamiento de la familia Qwen3.5 en MLX sin necesidad de GPU NVIDIA.
- Fine-tuning ligero o adaptadores sobre MLX: el checkpoint puede servir de punto de partida para LoRA en MLX, aunque la cuantización puede complicar el entrenamiento.
- Docencia y demostraciones: adecuado para mostrar flujos de cuantización mixta y despliegue local en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~6 GB solo para pesos; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, variantes Pro/Max/Ultra). No es compatible con CUDA.
- ¿Cabe en GPU de consumo? Sí, en Mac con 16 GB o más de memoria unificada; no aplica a GPUs NVIDIA/AMD convencionales por el formato MLX.
- Opciones de despliegue: `mlx-lm` (librería MLX); no compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Nailong-9B-oQ5 | 8,954B | no disponible | MLX safetensors (5,7 bits) | no disponible | Hugging Face |
| Modelo base Index-Nailong-9B (BF16) | ~9B | no disponible | safetensors | no disponible | no disponible en la información |
| Qwen3.5 (modelo oficial de la familia) | no disponible | no disponible | safetensors/GGUF | no disponible | no disponible en la información |

No se dispone de datos de rendimiento ni de especificaciones del modelo base para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; tratar como no apto para producción hasta verificar la licencia del modelo base.
- Modelo derivado sin model card propia: no hay descripción de arquitectura, entrenamiento ni evaluación del modelo original.
- Cuantización de 5,7 bits: degradación potencial de calidad frente al BF16, especialmente en tareas de razonamiento y código; no cuantificada.
- Solo MLX: no ejecutable en CUDA, ROCm ni CPU convencional sin conversión.
- Idiomas no declarados: riesgo de comportamiento deficiente fuera del inglés/chino presumible de Qwen.
- Riesgo de alucinación: inherente a modelos de ~9B, sin evaluación publicada.
- Sesgos: desconocidos, al no documentarse el corpus de entrenamiento.
- Fecha de creación futura (2026-11-02): verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Omnico/Index-Nailong-9B-oQ5
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
