# JamieBradfield/qwen3.8-9b-hermes-function-calling-v2

## Resumen

El modelo **Qwen3.8-9B Hermes Function Calling v2** es un fine-tune QLoRA del modelo base **Empero/Qwen3.8-9B**, una destilación de la arquitectura híbrida Qwen3.5 con 9 mil millones de parámetros densos y una ventana de contexto de 262.144 tokens. Desarrollado por JamieBradfield, este artefacto de investigación busca mejorar el comportamiento de llamada a herramientas (function calling) en modelos de clase 9B, un área crítica para el desarrollo de agentes autónomos. El ajuste se realizó sobre 979 conversaciones de tool-call en formato ShareGPT, de las cuales 933 son trayectorias reales de agentes Hermes multi-turno (promedio de 12 turnos, máximo 35) y 46 filas de relleno para puentear secuencias de herramientas escasas.

La relevancia de este modelo radica en su enfoque transparente: todos los scripts de entrenamiento, fusión y evaluación están publicados en el repositorio, aunque los datos de entrenamiento no se distribuyen por contener cadenas privadas. El entrenamiento se detuvo al 86% (paso 213 de 246), publicándose el checkpoint-200 con una pérdida de 0,131. Se añadieron dos tokens de herramienta (`<|tool_call|>` y `<|tool_response|>`) al vocabulario, que pasa de 248.077 a 248.079. Es un modelo pensado para experimentación, no para producción, y su evaluación independiente está aún pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (destilación), denso, 9B |
| Parametros totales | 9.195.119.616 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (pesos completos), GGUF Q4_0_ROCMFP4_FAST (formato ROCmFPX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo base, **Empero/Qwen3.8-9B**, es una destilación de la arquitectura híbrida Qwen3.5 con 9B parámetros densos y una ventana de contexto de 262.144 tokens. Sobre esta base se aplicó un fine-tune con QLoRA a 4 bits, con rango 16 y alpha 16, dropout 0, dirigido a las proyecciones q/k/v/o/gate/up/down. El entrenamiento usó una tasa de aprendizaje de 2e-4, batch efectivo de 8 (batch 1 con grad-accum de 8), secuencia máxima de 4096 tokens, warmup del 10% y 2 épocas, lo que planificaba 246 pasos. Se detuvo en el paso 213 (86%) y se publicó el checkpoint-200 con pérdida 0,131. Los parámetros entrenables representan solo el 0,32% del total (embeddings congelados). Se añadieron dos tokens de herramienta al vocabulario y se eliminó el vision tower del modelo base durante la fusión. El proceso de entrenamiento se realizó con Unsloth sobre una pila ROCm (AMD RX 7700 XT).

## Capacidades

- Generación de texto conversacional con soporte explícito de function calling y tool use.
- Manejo de conversaciones multi-turno con ejecución de herramientas (promedio de 12 turnos en los datos de entrenamiento, máximo 35).
- Integración de tokens especiales `<|tool_call|>` y `<|tool_response|>` para estructurar llamadas a herramientas.
- Capacidad de trabajar con contexto largo (262.144 tokens teóricos), aunque el entrenamiento se limitó a secuencias de 4096 tokens.
- Soporte de agentes y razonamiento multi-paso dentro del ámbito de tool-calling.
- No se mencionan capacidades de visión, audio ni otros modalidades; el vision tower fue eliminado en la fusión.

## Casos de uso

- **Investigación en agentes autónomos**: este modelo es ideal para estudiar cómo los modelos de 9B manejan secuencias largas de llamadas a herramientas, gracias a sus datos de entrenamiento con trayectorias reales de agentes Hermes.
- **Prototipado de asistentes con herramientas**: permite construir prototipos de asistentes que necesiten consultar APIs, bases de datos o ejecutar acciones externas, sin requerir hardware de alta gama.
- **Evaluación de comportamiento de tool-calling**: los scripts de evaluación publicados (workloads A–E) facilitan la comparación sistemática de este modelo con otros de su clase en tareas de función llamada.
- **Desarrollo de datasets de entrenamiento**: el proceso de construcción del dataset (scripts `build_v2.py` y `gapfill_v2.py`) puede servir como referencia para generar datos sintéticos de tool-use.
- **Benchmarking de function calling en modelos pequeños**: útil para medir el impacto de QLoRA en la destilación de capacidades de tool-calling desde modelos más grandes.
- **Experimentación con cuantización ROCmFPX**: el GGUF cuantizado permite probar inferencia eficiente en GPUs AMD RDNA3, un área poco explorada en comparación con CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README indica explícitamente que la evaluación independiente de este checkpoint no está completa y que no debe tratarse como un modelo validado para ningún comportamiento específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para los pesos BF16 completos, se requieren aproximadamente 18-20 GB de VRAM (el repo ocupa 18,4 GB). Con la cuantización GGUF Q4_0_ROCMFP4_FAST, la VRAM necesaria se reduce a unos 5-6 GB.
- **GPU recomendadas**: para BF16, una GPU con 24 GB (RTX 4090, A10G, A100 40GB) o equivalente. Para el GGUF cuantizado, una GPU con 8 GB es suficiente (por ejemplo, RX 7700 XT, RTX 3060, RTX 4060).
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM usando la cuantización GGUF.
- **Opciones de despliegue**: transformers (con carga de safetensors), llama.cpp (para GGUF), vLLM (etiquetado como `endpoints_compatible`), y potencialmente Ollama si se convierte el modelo.
- **Latencia y throughput estimados**: no disponibles; el autor no ha publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Método de entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes Function Calling v2 | 9,2B | 262.144 | Apache-2.0 | QLoRA sobre Qwen3.8-9B | Repo HF |
| Qwen3.8-9B Hermes Function Calling v1 | 9,2B | 262.144 | Apache-2.0 | QLoRA (versión anterior) | Repo HF |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 | Apache-2.0 | RLHF + tool-calling nativo | Repo HF |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | RLHF + tool-calling nativo | Repo HF |

Nota: los datos de rendimiento comparativo no están disponibles porque el modelo v2 carece de evaluación independiente. Las alternativas mencionadas (Qwen2.5-7B y Llama-3.1-8B) son modelos establecidos con soporte nativo de function calling, aunque con contexto más corto y arquitecturas convencionales.

## Limitaciones y advertencias

- **Evaluación incompleta**: el modelo no ha sido validado de forma independiente; no debe usarse en producción sin un benchmark previo.
- **Entrenamiento interrumpido**: se detuvo al 86% de los pasos planeados, lo que puede afectar a la convergencia final.
- **Datos de entrenamiento no publicados**: contienen cadenas privadas (hostnames, identificadores de sesión); el autor no los distribuye.
- **Solo inglés**: no hay soporte multilingüe verificado.
- **Riesgo de alucinación en tool-calls**: al ser un fine-tune específico, puede generar llamadas a herramientas inexistentes o malformadas si se usa fuera de su dominio de entrenamiento.
- **Artefacto de investigación**: no es un producto; su mantenimiento y soporte son limitados.
- **Dependencia de la pila ROCm**: los scripts de entrenamiento están vinculados a la configuración del autor (rutas de máquina, Unsloth 2026.8.18, torch 2.11 ROCm); requieren ajustes para otros entornos.
- **Cuantización ROCmFPX específica**: el GGUF publicado usa un formato propietario para AMD; para uso portable hay que convertir desde los pesos BF16.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Versión v1: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1
- GGUF de v1: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1-GGUF
- Documentación de function calling en Qwen3: https://deepwiki.com/QwenLM/Qwen3/4.3-function-calling-and-tool-use
