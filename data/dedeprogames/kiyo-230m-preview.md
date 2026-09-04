# DedeProGames/Kiyo-230M-Preview

## Resumen

Kiyo-230M-Preview es un checkpoint intermedio de preentrenamiento de Kiyo-230M, un modelo de lenguaje decoder-only desarrollado por DedeProGames. El modelo se entrena desde cero con una mezcla de datos de texto general, código fuente y matemáticas, y se publica como vista previa para inspeccionar el progreso del entrenamiento, que se encuentra aproximadamente en el 21 % del presupuesto total de tokens.

La arquitectura sigue la familia SmolLM2, con un decoder estilo Llama que incorpora grouped query attention, RMSNorm, MLPs SwiGLU y embeddings de entrada/salida atados. Tiene 229.688.064 parámetros, 32 capas, un tamaño de ocultación de 768 y una ventana de contexto de 2.048 tokens. Reutiliza el tokenizer de SmolLM2 con un vocabulario de 49.152 tokens.

Aunque el modelo aún no ha completado su entrenamiento, este checkpoint permite evaluar la evolución de las capacidades durante el proceso. Es importante tener en cuenta que los pesos son provisionales y que el learning rate aún se encuentra en su fase estable sin decay, por lo que los resultados de benchmarks subestiman el rendimiento que alcanzará el modelo final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (familia SmolLM2) |
| Parametros totales | 229.688.064 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kiyo-230M-Preview es un modelo decoder-only que sigue la arquitectura de SmolLM2. Tiene 32 capas, tamaño de ocultación de 768, tamaño intermedio de 1.920, 12 cabezas de atención, 4 cabezas KV y dimensión de cabeza de 64. Utiliza grouped query attention, activación SwiGLU, normalización RMSNorm y codificación posicional RoPE con theta 10.000. Los embeddings de entrada y salida están atados.

El entrenamiento se realiza desde cero con una mezcla de cuatro datasets: FineWeb-Edu (45 %), DCLM-Baseline (30 %), Stack-v3-train (17,5 %) y FineMath (7,5 %). La porción de código se muestrea con probabilidades de mantenimiento por lenguaje en 32 lenguajes de programación, garantizando una cuota equitativa de tokens. El checkpoint actual corresponde al paso de optimizador 81.500, con 42,7 mil millones de tokens vistos de un presupuesto total de 200 mil millones. El learning rate se encuentra en su pico de 1,2e-3, en fase estable, y el decay no ha comenzado.

## Capacidades

- Generación de texto en inglés como modelo base, sin afinamiento para instrucciones.
- Completado de código en múltiples lenguajes de programación gracias a su entrenamiento con Stack-v3-train.
- Razonamiento matemático básico, derivado de la inclusión de FineMath en la mezcla de datos.
- Conocimiento del mundo y sentido común, con resultados de precisión del 72 % y 70 % respectivamente en el benchmark BananaMind Base Bench 1.1.
- Seguimiento de contexto y razonamiento lógico, aunque con puntuaciones más bajas (44 % en ambas categorías).
- No se especifica soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Autocompletado de código en editores: el modelo puede sugerir continuaciones de código en 32 lenguajes, integrándose en un IDE como backend de autocompletado. Su entrenamiento con Stack-v3-train le proporciona una distribución equilibrada de lenguajes.
- Generación de texto para prototipos: como modelo base, puede producir texto coherente en inglés para prototipos de aplicaciones de escritura, resúmenes o redacción asistida antes de un fine-tuning específico.
- Clasificación de texto: sirve como base para fine-tuning en tareas de clasificación como análisis de sentimiento o detección de spam, gracias a su capacidad de modelar lenguaje natural con un coste computacional bajo.
- Asistencia matemática básica: su mezcla con FineMath le permite resolver problemas aritméticos y algebraicos simples, útil en aplicaciones educativas o de cálculo rápido.
- Base para fine-tuning en dominios específicos: su tamaño de 230M permite ajustar el modelo en dominios concretos, como legal o médico, con recursos de hardware limitados.
- Generación de fragmentos de código de bajo nivel: para scripts pequeños, consultas SQL o expresiones regulares, el modelo puede generar fragmentos útiles en un entorno de desarrollo.
- Investigación en interpretabilidad y eficiencia: al ser un checkpoint intermedio, permite estudiar cómo evolucionan las capacidades durante el entrenamiento, comparándolo con Kiyo-135M.

## Benchmarks y rendimiento

Resultados auto-reportados por el autor con el script oficial de BananaMind Base Bench 1.1, medidos en CUDA en float32. El modelo se encuentra en fase de preview, con el learning rate en pico y sin decay, por lo que estos números subestiman el rendimiento final.

| Modelo | Parámetros | Tokens de entrenamiento | Elo global |
|---|---:|---:|---:|
| Kiyo-135M | 134,5M | 200B | 1.126 |
| BananaMind-2-Pro | 139,0M | 100B | 1.124 |
| Rose-Pro | 151,3M | No disponible | 1.105 |
| **Kiyo-230M-Preview** | **229,7M** | **42,7B** | **1.086** |
| GPT-2 | 124M | 10B | 990 |

Resultados detallados de Kiyo-230M-Preview:

| Categoría | Precisión | z vs. azar | Elo | Significativo |
|---|---:|---:|---:|:---:|
| Completado de lenguaje | 98,0 % | +11,92 | 1.468 | * |
| Completado de código | 74,0 % | +8,00 | 1.286 | * |
| Conocimiento del mundo | 72,0 % | +7,68 | 1.079 | * |
| Sentido común | 70,0 % | +7,35 | 1.077 | * |
| Seguimiento de contexto | 44,0 % | +3,10 | 931 | * |
| Razonamiento lógico | 44,0 % | +3,10 | 1.017 | * |
| Cuantitativo | 38,0 % | +2,12 | 958 | * |

\* = supera el umbral de 1,96σ frente al azar; n=50 por categoría.

Por dificultad:

| Dificultad | Precisión |
|---|---:|
| Fácil | 73,5 % |
| Media | 60,7 % |
| Difícil | 54,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en float32, 0,46 GB en float16, 0,23 GB en 8-bit y 0,12 GB en 4-bit.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050 o GTX 1660, es suficiente. También puede ejecutarse en CPU.
- Sí cabe en GPU de consumo, incluyendo modelos antiguos de gama baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de entrenamiento | Contexto | Elo global | Licencia |
|---|---:|---:|---:|---:|---|
| Kiyo-135M | 134,5M | 200B | No disponible | 1.126 | Apache 2.0 |
| BananaMind-2-Pro | 139,0M | 100B | No disponible | 1.124 | No disponible |
| Rose-Pro | 151,3M | No disponible | No disponible | 1.105 | No disponible |
| **Kiyo-230M-Preview** | **229,7M** | **42,7B** | **2.048** | **1.086** | **Apache 2.0** |

Kiyo-230M-Preview tiene 1,7 veces más parámetros que Kiyo-135M, pero ha visto solo 42,7 mil millones de tokens frente a los 200 mil millones del modelo completado. La comparación directa no es justa: el checkpoint actual está en el 21 % del presupuesto de tokens y sin annealing.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no la versión final de Kiyo-230M. Los pesos cambiarán y el modelo final se publicará por separado.
- El learning rate está en su pico de 1,2e-3 y el decay no ha comenzado, por lo que los benchmarks subestiman el rendimiento final.
- Solo soporta inglés. No hay soporte multilingüe.
- Ventana de contexto limitada a 2.048 tokens, lo que restringe tareas que requieren documentos largos.
- Modelo base, no afinado para instrucciones. No sigue instrucciones ni mantiene diálogos conversacionales sin un fine-tuning posterior.
- Riesgo de alucinación típico de los modelos de lenguaje base.
- Posibles sesgos derivados de los datos web filtrados, que pueden contener sesgos culturales o de género no corregidos.
- No se especifica soporte de tool calling, function calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero requiere atribución y aviso de cambios.

## Enlaces

- HuggingFace: https://huggingface.co/DedeProGames/Kiyo-230M-Preview
- Perfil del autor: https://huggingface.co/DedeProGames
- Kiyo-135M: https://huggingface.co/DedeProGames/Kiyo-135M
- SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
