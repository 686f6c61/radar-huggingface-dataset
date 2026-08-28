# Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-4Bit

## Resumen

Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-4Bit es una conversión al formato MLX (Apple Silicon) del modelo Qwen2.5-Coder-7B-Instruct, cuantizado a 4 bits. Ha sido generada por el usuario Oscilla en Hugging Face utilizando la librería mlx-lm (versión 0.31.2). El modelo original, desarrollado por Alibaba Cloud, es un transformer decoder-only de 7.600 millones de parámetros especializado en generación y razonamiento de código, con una ventana de contexto de 32.000 tokens y entrenado sobre 5,5 billones de tokens de código y datos relacionados.

Esta versión cuantizada reduce el tamaño de los pesos a aproximadamente 4,3 GB, lo que permite ejecutar el modelo en dispositivos Apple con memoria unificada (M1/M2/M3/M4) de forma eficiente. Es relevante porque ofrece una alternativa de código abierto (licencia Apache 2.0) para asistentes de programación locales, sin depender de servicios en la nube, manteniendo un rendimiento razonable en tareas de generación, explicación y completado de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.190.221.312 (según safetensors del repo cuantizado; el modelo base tiene 7.600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (según fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Inglés (declarado en la model card; el modelo base soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct emplea una arquitectura transformer estándar con atención completa (full attention), normalización RMSNorm y activaciones SwiGLU. Fue pre-entrenado con 5,5 billones de tokens de código, documentación técnica y datos de razonamiento, seguido de un ajuste fino supervisado y un refinamiento por preferencias humanas (RLHF) para mejorar la capacidad de seguir instrucciones y generar código correcto.

La conversión a MLX no modifica la arquitectura; simplemente reescribe los pesos en el formato de Apple y aplica una cuantización de 4 bits (probablemente utilizando el esquema de cuantización de mlx-lm). Esto reduce el tamaño del modelo de aproximadamente 15 GB (en FP16) a 4,3 GB, facilitando su carga en memoria unificada de los chips Apple. No se ha realizado ningún entrenamiento adicional.

## Capacidades

- Generación de código en múltiples lenguajes (Python, JavaScript, Java, C++, etc.) a partir de descripciones en lenguaje natural.
- Completado de código y autocompletado en editores.
- Explicación de fragmentos de código y generación de documentación.
- Razonamiento sobre código: predicción de entradas/salidas, depuración lógica.
- Soporte de tool calling / function calling (heredado del modelo base).
- Capacidad de chat conversacional para asistencia técnica.
- Multilingüe limitado al inglés en esta versión (aunque el modelo base soporta más idiomas, la model card solo declara `en`).

## Casos de uso

- Asistente de programación local en Mac: un desarrollador puede ejecutar el modelo con `mlx-lm` en su portátil Apple para obtener sugerencias de código sin conexión a internet, protegiendo la privacidad del código fuente.
- Autocompletado en editores de texto: integración con plugins que llaman a la API de `mlx-lm` para completar líneas o funciones mientras se escribe.
- Generación de tests unitarios: a partir de una función dada, el modelo puede proponer casos de prueba razonables, útil en pipelines de CI/CD locales.
- Revisión de código estática: el modelo puede detectar posibles errores lógicos o de estilo en un fragmento y sugerir correcciones.
- Aprendizaje de programación: estudiantes pueden hacer preguntas sobre conceptos de código y recibir explicaciones detalladas con ejemplos.
- Prototipado rápido: generar esqueletos de aplicaciones o scripts para validar ideas antes de implementarlas manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada. El modelo base Qwen2.5-Coder-7B-Instruct reporta en su documentación oficial puntuaciones en HumanEval (85,0 % pass@1) y MBPP (82,5 % pass@1), así como en tareas de razonamiento general como MMLU (71,5 %). Sin embargo, estos valores corresponden al modelo sin cuantizar y no son directamente extrapolables a la versión 4-bit MLX. Se recomienda realizar pruebas propias en el hardware objetivo para evaluar la degradación por cuantización.

## Requisitos de hardware

- Dispositivos Apple con chip M1, M2, M3 o M4 y al menos 8 GB de memoria unificada (recomendable 16 GB para mayor comodidad).
- La memoria necesaria para cargar los pesos es de aproximadamente 4,3 GB, más el overhead de la librería y el contexto de generación.
- Se ejecuta mediante `mlx-lm` (pip install mlx-lm) y aprovecha la aceleración Metal.
- No es compatible directamente con GPUs NVIDIA o AMD; para otros entornos se necesitaría convertir a GGUF o usar otra librería.
- Latencia y throughput: no disponibles en la documentación; dependerán del chip concreto y de la longitud de la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-4Bit | 7,6B (base) / 1,19B (cuantizado) | 32K | Apache 2.0 | MLX 4-bit | Conversión para Apple Silicon |
| Qwen/Qwen2.5-Coder-7B-Instruct (original) | 7,6B | 32K | Apache 2.0 | safetensors (FP16) | Modelo base sin cuantizar |
| mlx-community/Qwen2.5-Coder-7B-Instruct-4bit | 7,6B (base) | 32K | Apache 2.0 | MLX 4-bit | Conversión alternativa de la comunidad |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | safetensors, GGUF | Modelo de Meta, contexto menor |

La comparación de rendimiento exacto no está disponible para la versión cuantizada. En general, Qwen2.5-Coder supera a CodeLlama en benchmarks de código (HumanEval 85 % vs 67 %), pero la cuantización puede reducir esa ventaja.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la calidad de la generación, especialmente en tareas de razonamiento complejo o matemáticas.
- Solo se declara soporte para inglés; aunque el modelo base entiende otros idiomas, esta versión no lo garantiza.
- El autor es un usuario individual (Oscilla), no una organización con soporte técnico; el mantenimiento del repositorio puede ser limitado.
- No se proporcionan resultados de benchmarks propios, por lo que el rendimiento real debe validarse en cada caso de uso.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las condiciones de la licencia del modelo base (también Apache 2.0).
- Al ser una conversión no oficial, no hay garantía de que reproduzca exactamente el comportamiento del modelo original en todas las situaciones.

## Enlaces

- [Modelo en Hugging Face: Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-4Bit](https://huggingface.co/Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-4Bit)
- [Modelo base: Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Conversión alternativa: mlx-community/Qwen2.5-Coder-7B-Instruct-4bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit)
- [Página en LLM Explorer con detalles de VRAM y contexto](https://llm-explorer.com/model/mlx-community%2FQwen2.5-Coder-7B-Instruct-4bit,3wls0bakDefOMzTTSrA2sV)
- [Repositorio en Ollama para Qwen2.5 Coder 7B Instruct](https://ollama.com/library/qwen2.5-coder:7b-instruct)
- [GitHub de Qwen2.5-Coder](https://github.com/huggingface/Qwen2.5-Coder)
