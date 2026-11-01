# PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled

## Resumen

Qwen3.5-0.8B-Opus-Reasoning-Distilled es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por PhilipEriksson y publicado bajo licencia Apache 2.0. El objetivo del autor no es competir en benchmarks, sino reproducir a pequeña escala el pipeline de destilación de trazas de razonamiento de Claude Opus sobre modelos Qwen, en un tamaño que pueda entrenarse en menos de media hora sobre una única GPU de consumo. El resultado es un modelo de 873 millones de parámetros totales (604 millones sin contar embeddings) con arquitectura transformer híbrida de atención lineal, capaz de generar cadenas de razonamiento explícitas en bloques `<think>`.

El modelo se construye mediante LoRA SFT con enmascaramiento de pérdida solo sobre la respuesta, entrenado sobre 2.917 filas de trazas de razonamiento procedentes de tres conjuntos de datos (Claude Opus 4.6, Claude Opus 4.5 y Qwen3.5-27B). Es relevante ahora porque documenta de forma explícita las partes delicadas del pipeline de destilación (normalización de formato, filtrado frente a truncado, cobertura de módulos LoRA en atención híbrida, activación obligatoria del modo thinking) y porque ofrece versiones cuantizadas en GGUF, EXL3 y NVFP4 listas para desplegar en hardware modesto.

Se trata, en palabras del propio autor, de una "learning run": un ejercicio de reproducibilidad y documentación, no un modelo listo para producción competitiva. Su valor está en la transparencia del proceso de entrenamiento y en servir como referencia para quienes quieran replicar recetas de destilación de razonamiento a escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (6 de 24 capas con atención completa, 18 con atención lineal) |
| Parametros totales | 873.438.784 (604M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (longitud de entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | BF16, GGUF Q4_K_M y Q8_0, EXL3 4.0 bpw y 3.0 bpw, NVFP4 W4A4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF, EXL3, NVFP4 (repos separados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura transformer híbrida: de sus 24 capas, solo 6 usan atención completa estándar (`q_proj`, `k_proj`, `v_proj`, `o_proj`), mientras que las otras 18 usan atención lineal con proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a` y `out_proj`. Esta particularidad es crítica para el ajuste fino: el autor señala explícitamente que apuntar solo a los nombres de proyección convencionales dejaría congelada la mayor parte del stack de atención. El adaptador LoRA (r=64, alpha=64, dropout=0) se aplica sobre los doce módulos mencionados, con 43,29M parámetros entrenables de 896,28M totales (4,83%). La torre de visión del modelo base quedó excluida: se trata de un ajuste fino solo de texto.

El entrenamiento usó 2.917 filas tras normalización y filtrado: 2.308 de `nohurry/Opus-4.6-Reasoning-3000x-filtered`, 250 de `TeichAI/claude-4.5-opus-high-reasoning-250x` y 633 de `Jackrong/Qwen3.5-reasoning-700x`. Se descartaron 18 filas por campo de solución vacío y 274 por exceder los 16.384 tokens, mediante filtrado y no truncado, para evitar cortar objetivos a mitad de respuesta. Todas las muestras se normalizaron al formato de chat de Qwen3.5 con bloque `<think>`. La configuración SFT: base en 4 bits, `max_length=16384`, `packing=False`, batch efectivo de 32 (8 × 4 de acumulación), 2 épocas, 184 pasos de optimizador, learning rate 2e-4, `adamw_8bit`, weight decay 0.001, schedule lineal con 5% de warmup y pérdida enmascarada solo sobre la respuesta (todo lo anterior a `<|im_start|>assistant\n` se pone a -100). El entrenamiento completo se ejecutó en una RTX 5090 (32 GB) en 25 minutos.

La curva de pérdida descendió de forma monotónica y se estabilizó en torno a 0,65-0,67 en el último tercio, con un mínimo puntual de 0,4458 en el paso 137 y una media global de 0,7077. El autor atribuye explícitamente el gap frente a la pérdida de ~0,24 reportada para la versión de 4B de la misma receta a límites de capacidad del modelo y volumen de datos, no a un fallo de entrenamiento.

## Capacidades

- Generación de texto conversacional con formato de chat de Qwen3.5 (`<|im_start|>` / `<|im_end|>`).
- Razonamiento explícito en cadena de pensamiento mediante bloques `<think>`, activable con `enable_thinking=True` en la plantilla de chat.
- Razonamiento aritmético básico y resolución de problemas verbales de matemáticas (el ejemplo de la model card es un problema de velocidad media).
- Generación de código y razonamiento lógico, según los tres prompts de evaluación usados en las pruebas de cuantización (aritmética, código, lógica).
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque el ajuste fino excluyó la torre de visión y no se documenta su comportamiento tras el SFT.
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado más allá del razonamiento en bloque think).

## Casos de uso

- **Reproducción y estudio del pipeline de destilación de razonamiento**: el modelo sirve como referencia ejecutable de una receta completa (normalización de datos, LoRA sobre atención híbrida, enmascaramiento de pérdida, filtrado por longitud) para investigadores que quieran replicar el proceso a mayor escala o con otros datos.
- **Prototipado rápido de asistentes con razonamiento visible**: al exponer la cadena de pensamiento en `<think>`, permite construir interfaces que muestren el razonamiento intermedio al usuario, útil para demos de depuración o educación, con la salvedad de que es un modelo de 0,8B.
- **Evaluación de cuantizaciones en hardware de consumo**: las variantes GGUF Q4_K_M (542 MB), EXL3 y NVFP4 permiten comparar degradación de calidad frente a BF16 en escenarios reales; el autor documenta que EXL3 3.0 bpw falla 1 de 3 prompts de prueba.
- **Despliegue en entornos con recursos muy limitados**: con 542 MB en Q4_K_M y ejecutable en llama.cpp, Ollama o LM Studio, cabe en GPUs de gama baja, iGPU o incluso CPU, para tareas de generación de texto simple con razonamiento básico.
- **Generación de problemas matemáticos elementales con traza**: el ejemplo de la model card (cálculo de velocidad media) ilustra su uso para resolver problemas verbales de aritmética paso a paso, adecuado para herramientas educativas de baja exigencia.
- **Banco de pruebas para pipelines de CI/CD de modelos**: por su tamaño y tiempo de entrenamiento (25 minutos en una RTX 5090), es útil como caso de prueba para validar herramientas de fine-tuning (Unsloth, TRL) y de conversión a GGUF/EXL3/NVFP4 antes de escalar a modelos mayores.
- **Investigación sobre activación de modo thinking**: sirve para estudiar cómo el flag `enable_thinking` de la plantilla de chat altera el comportamiento generativo, ya que sin él el modelo responde directamente sin razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni métricas estándar. La única evaluación cuantitativa documentada es una prueba cualitativa de fidelidad de cuantizaciones sobre tres prompts (aritmética, código, lógica), con los mismos ajustes de muestreo y BF16 como referencia:

| Artefacto | Tamano | Respuesta esperada encontrada |
|---|---:|---|
| BF16 (repo principal) | 1,7 GB | 3/3 |
| GGUF Q8_0 | 834 MB | 3/3 |
| GGUF Q4_K_M | 542 MB | 3/3 |
| EXL3 4.0 bpw | 1,08 GB | 3/3 |
| EXL3 3.0 bpw | 1,02 GB | 2/3 |
| NVFP4 | 892 MB | 3/3 |

Además, se documenta la pérdida de entrenamiento: mínimo de 0,4458 en el paso 137, paso final registrado 0,496, media global 0,7077, con meseta de 0,65-0,67 en el último tercio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: BF16 requiere aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; GGUF Q4_K_M baja a 542 MB y Q8_0 a 834 MB; EXL3 4.0 bpw a 1,08 GB; NVFP4 a 892 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2-3 GB de VRAM libre para BF16; para NVFP4 se requiere arquitectura Blackwell (SM120) según el autor.
- **Cabe en GPU de consumo**: sí, en todas las GPU de consumo modernas e incluso en iGPU o CPU con las variantes GGUF Q4_K_M y Q8_0.
- **Opciones de despliegue**: transformers (BF16, safetensors), llama.cpp, Ollama y LM Studio (GGUF), exllamav3 y TabbyAPI (EXL3), vLLM en Blackwell/SM120 (NVFP4).
- **Latencia y throughput**: no disponible. El autor solo documenta el tiempo de entrenamiento (25 minutos en una RTX 5090), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Opus-Reasoning-Distilled | 873M (604M sin embeddings) | 16.384 (entrenamiento) | Apache 2.0 | Ajuste fino LoRA de razonamiento; solo inglés; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (base) | 873M | no disponible | Apache 2.0 (heredada) | Modelo base sin destilación de razonamiento; incluye torre de visión funcional |
| Receta de 4B del mismo pipeline | ~4B (no confirmado) | no disponible | no disponible | El autor la cita como referencia de pérdida final (~0,24) frente a la de este modelo (~0,65-0,67) |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No es competitivo en benchmarks**: el propio autor lo describe como una "learning run", no como un lanzamiento orientado a rendimiento.
- **Capacidad limitada por tamaño**: con 604M parámetros no-embedding y 2.917 muestras durante 2 épocas, la pérdida final (0,65-0,67 de meseta) queda lejos de la reportada para la receta de 4B (~0,24); el autor lo atribuye a capacidad y volumen de datos.
- **Riesgo de alucinación**: inherente a un modelo de este tamaño entrenado sobre trazas sintéticas de razonamiento; no se documentan evaluaciones de fidelidad factual.
- **Idioma**: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado ni garantizado.
- **Modo thinking obligatorio**: sin `enable_thinking=True` en la plantilla de chat, el modelo responde directamente sin bloque de razonamiento, lo que puede producir resultados distintos a los esperados.
- **Visión no ajustada**: aunque el pipeline es `image-text-to-text`, la torre de visión quedó excluida del entrenamiento; su comportamiento multimodal tras el SFT no está documentado.
- **Cuantización EXL3 3.0 bpw degradada**: falla 1 de 3 prompts en la prueba del autor; no recomendada si se requiere fidelidad.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Qwen3.5-0.8B y los datasets de destilación (trazas de Claude Opus) pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- **Sesgos**: no documentados por el autor; al derivar de trazas de modelos propietarios, puede heredar sesgos de estos, sin evaluación publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled
- Colección completa de la familia: https://huggingface.co/collections/PhilipEriksson/qwen35-08b-opus-reasoning-distilled-6ae3336176ac243223f27ee9
- Variante GGUF: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF
- Variante EXL3: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3
- Variante NVFP4: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
