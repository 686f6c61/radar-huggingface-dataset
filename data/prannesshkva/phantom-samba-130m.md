# Prannesshkva/Phantom-Samba-130M

## Resumen

Phantom-Samba-130M es un modelo de generación de texto basado en arquitecturas de espacio de estados (SSM) tipo Samba/Mamba, desarrollado por Prannessh KVA. Su principal innovación es la integración nativa de una capa de aceleración llamada `phantom-cache`, que implementa caché de prefijos con latencia sub-milisegundo y cuantización dinámica simétrica INT8 de los estados recurrentes. El modelo está diseñado para servir inferencia de forma eficiente, reduciendo el tiempo hasta el primer token (TTFT) y el consumo de VRAM, lo que lo hace adecuado para despliegues con recursos limitados o sistemas de alto rendimiento.

Aunque el nombre sugiere 130 millones de parámetros, los pesos reales en safetensors suman 29.778.784 parámetros, lo que lo convierte en un modelo muy compacto. Está licenciado bajo Apache 2.0 y soporta exclusivamente inglés. Su relevancia actual radica en la tendencia hacia modelos pequeños y optimizados para inferencia rápida, especialmente en entornos de producción donde la latencia y el coste de memoria son críticos. El autor ha publicado documentación técnica en Zenodo con DOI, y existe un espacio de demostración en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (Samba/Mamba) con capa phantom-cache |
| Parametros totales | 29.778.784 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica simétrica para estados recurrentes |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de espacio de estados (SSM) similar a Mamba o Samba, que sustituye la atención tradicional por capas recurrentes con kernel convolucional de profundidad 1. La innovación principal es la capa `phantom-cache`, que introduce dos mecanismos: (1) caché de prefijos (prefix caching) que reutiliza estados recurrentes precomputados para prompts repetidos, evitando prefill redundante; (2) cuantización INT8 dinámica simétrica de los estados ocultos recurrentes (h_ssm) y los buffers convolucionales (h_conv), reduciendo el uso de VRAM manteniendo una fidelidad alta (RMSE ≤ 0.01056). No se han publicado detalles sobre el dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO). La implementación requiere `trust_remote_code=True` en Hugging Face.

## Capacidades

- Generación de texto en inglés, con soporte para contexto largo (etiqueta `long-context`).
- Caché de prefijos: acelera respuestas para prompts repetidos o compartidos, logrando un TTFT inferior a 90 microsegundos en coincidencias de prefijo.
- Cuantización INT8 de estados recurrentes: reduce la huella de memoria de los estados ocultos de 18.0 MB a 4.5 MB, con alta reconstrucción.
- Inferencia eficiente: diseñado para servir con baja latencia y bajo consumo de VRAM, adecuado para despliegues en edge o entornos con restricciones de hardware.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Servicio de chat en tiempo real con prompts de sistema compartidos: al usar caché de prefijos, el modelo reutiliza el prefill del prompt del sistema para todas las sesiones, reduciendo drásticamente la latencia inicial.
- Aplicaciones de bajo consumo en dispositivos con GPU pequeñas o CPU: su tamaño compacto (~30M parámetros) y la cuantización INT8 permiten ejecutarlo en hardware modesto, como Jetson Nano o Raspberry Pi con aceleración.
- Prototipado rápido de asistentes conversacionales en inglés: su licencia Apache 2.0 facilita la integración en proyectos comerciales sin restricciones.
- Experimentación académica con arquitecturas SSM y técnicas de caché: el código está disponible y el paper documenta los métodos, siendo útil para investigación en inferencia eficiente.
- Sistemas de generación de texto con alta concurrencia: la reducción de VRAM por estado (4.5 MB) permite mantener más estados en memoria, aumentando el número de sesiones simultáneas por GPU.
- Evaluación comparativa de técnicas de cuantización en modelos SSM: sirve como banco de pruebas para medir el impacto de INT8 en la calidad de generación frente a modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de inferencia, que se resumen a continuación:

| Métrica | Valor |
|---|---|
| TTFT con caché de prefijo | < 90 µs |
| Reducción de VRAM en estados recurrentes | 75% (de 18.0 MB a 4.5 MB) |
| RMSE de reconstrucción tras cuantización INT8 | ≤ 0.01056 |
| Fidelidad de límites de capa | 100% (preserva h_ssm y h_conv) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan ~119 MB (29.7M × 4 bytes); con cuantización INT8 de los estados, la memoria adicional por sesión es de ~4.5 MB. En total, cabe en cualquier GPU con al menos 512 MB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con capacidad para ejecutar PyTorch (desde GTX 10xx en adelante). También funcionaría en Apple Silicon con MPS, aunque no está documentado.
- Puede ejecutarse en CPU: el modelo es pequeño y la inferencia es viable en procesadores modernos, aunque con mayor latencia.
- Opciones de despliegue: compatible con Hugging Face Transformers (`trust_remote_code=True`). No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos de throughput, pero el TTFT con caché es inferior a 90 µs; el tiempo de generación por token dependerá del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Phantom-Samba-130M | 29.78M (real) | SSM (Samba) con phantom-cache | no disponible | Apache 2.0 | Caché de prefijos y cuantización INT8 |
| state-spaces/mamba-130m | 130M | SSM (Mamba) | 2048 (típico) | Apache 2.0 | Modelo base sin caché especial |
| Samba (modelo original) | 3.8B (o variantes) | SSM con atención híbrida | 128K (en versiones grandes) | Apache 2.0 | Enfoque en contexto largo, sin caché de prefijos documentada |

La comparación es limitada porque no hay datos de rendimiento en tareas estándar. Phantom-Samba se diferencia por su tamaño real mucho menor y su capa de optimización de inferencia, mientras que Mamba-130M es un modelo base de referencia.

## Limitaciones y advertencias

- Tamaño reducido: con ~30M de parámetros, la calidad de generación y razonamiento es limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso en aplicaciones multilingües.
- Sin información sobre sesgos ni alineación: no se documentan procesos de mitigación de sesgos ni evaluación de seguridad.
- Riesgo de alucinación: como cualquier modelo generativo pequeño, puede producir contenido factualmente incorrecto o inventado.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado externamente; esto supone un riesgo de seguridad en entornos de producción.
- Sin datos de entrenamiento: no se especifica el dataset ni el número de tokens, lo que dificulta evaluar su cobertura y posibles sesgos.
- Restricciones de contexto: aunque se etiqueta como `long-context`, no se proporciona la longitud máxima de contexto, por lo que su uso con secuencias muy largas no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/Phantom-Samba-130M
- Perfil de GitHub del autor: https://github.com/prannesshkva
- Paper en Zenodo (DOI 10.5281/zenodo.22177116): https://doi.org/10.5281/zenodo.22177116
- Paper adicional (DOI 10.5281/zenodo.22177118): https://doi.org/10.5281/zenodo.22177118
- Demo en Hugging Face Space: https://huggingface.co/spaces/Prannesshkva/Phantom-Samba-Engine
- Proyectos del autor: https://prannesshkva.vercel.app/projects.html
