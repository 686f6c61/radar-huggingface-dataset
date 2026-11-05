# QianqianTech/custos-1.0-mlx

## Resumen

custos 1.0 (MLX) es una adaptación de pesos en formato MLX de un ajuste fino vertical de ciberseguridad sobre el modelo base Qwen3.5-9B, desarrollado por QianqianTech. El modelo está orientado a operaciones de seguridad en entornos gubernamentales y empresariales: análisis de amenazas, trazabilidad de ataques, análisis de vulnerabilidades, auditoría de cumplimiento y asistencia en respuesta a incidentes. La versión interna de entrenamiento es Custos-nesc-v1.2.5.

Este repositorio concreto contiene los pesos en safetensors de 16 bits para su carga con `mlx_lm` en macOS sobre Apple Silicon. Para despliegues con vLLM o Transformers en BF16, el autor remite a un repositorio separado con el mismo modelo. Con 9.000 millones de parámetros y licencia Apache-2.0, el modelo se posiciona como una alternativa de tamaño medio para tareas de seguridad que requieren ejecución local.

La relevancia de esta ficha radica en que el modelo está especializado en un dominio crítico donde la privacidad de los datos es fundamental; su formato MLX permite ejecutarlo en hardware de consumo de Apple sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, detalles no disponibles) |
| Parámetros totales | 9.000 millones (heredado del nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 16 bits (MLX safetensors); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 16 bits) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer de 9.000 millones de parámetros. La información proporcionada no detalla la arquitectura interna del base (número de capas, cabezas de atención, tipo de atención, etc.), por lo que estos datos se consideran no disponibles. El ajuste fino se realizó sobre el modelo base para especializarlo en dominios de ciberseguridad, con la versión interna Custos-nesc-v1.2.5.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones técnicas específicas del ajuste. El repositorio contiene únicamente los pesos en formato MLX de 16 bits para Apple Silicon.

## Capacidades

- Generación de texto y conversación multi-turno en chino e inglés.
- Análisis asistido de logs y alertas de seguridad.
- Trazabilidad de ataques y reconstrucción de cadenas de amenazas.
- Interpretación de vulnerabilidades y análisis de riesgo.
- Asistencia en auditorías de cumplimiento y redacción de materiales.
- Recomendaciones de respuesta ante incidentes y revisiones post-incidente.
- Capacidad de razonamiento y generación de código: no confirmada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Triaje de alertas de seguridad: el modelo puede recibir alertas SIEM y logs para generar un resumen preliminar y clasificar la severidad, ayudando a los analistas a priorizar incidentes.
- Análisis de vulnerabilidades: dado un CVE o un informe técnico, el modelo puede explicar el impacto potencial, los sistemas afectados y las mitigaciones recomendadas, facilitando la comunicación entre equipos técnicos y de gestión.
- Redacción de informes de cumplimiento: el modelo puede asistir en la elaboración de materiales de auditoría y autoevaluación normativa, adaptándose a marcos regulatorios habituales en entornos chinos e internacionales.
- Reconstrucción de cadenas de ataque: a partir de indicadores de compromiso (IoC) y trazas de logs, el modelo puede ayudar a hilar una narrativa del ataque y sugerir hipótesis de propagación.
- Asistencia en respuesta a incidentes: el modelo puede proponer pasos de contención, erradicación y recuperación, y generar borradores de comunicación interna para equipos de guardia.
- Ejecución local en Apple Silicon: gracias al formato MLX, el modelo puede desplegarse en portátiles y estaciones de trabajo Mac para análisis de datos sensibles sin salir del entorno local, cumpliendo requisitos de privacidad.
- Formación y simulación: el modelo puede generar escenarios de amenazas y preguntas de entrenamiento para equipos de seguridad, aunque esta capacidad no está confirmada explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 18 GB solo para pesos (9.000 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas: en el ecosistema MLX, los chips Apple Silicon de gama alta (M1/M2/M3/M4 Max o Ultra) con memoria unificada de 32 GB o superior. Para la versión BF16 (repositorio separado), se recomiendan GPU NVIDIA A100, H100 o RTX 4090 con 24 GB o más.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en configuraciones con 32 GB o más de memoria unificada. En NVIDIA, una RTX 4090 de 24 GB puede alojar los pesos en 16 bits, aunque con margen ajustado para contexto largo.
- Opciones de despliegue: `mlx_lm.server` y `mlx_lm` para Apple Silicon; vLLM y Transformers para la versión BF16 del repositorio separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| custos 1.0 (MLX) | 9.000 M | no disponible | Apache-2.0 | safetensors MLX 16 bits | Ciberseguridad |
| Qwen3.5-9B (base) | 9.000 M | no disponible | Apache-2.0 | safetensors (BF16) | Generalista |
| Alternativas de ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables específicos de ciberseguridad en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una herramienta de asistencia: no sustituye el análisis real, el escaneo de vulnerabilidades ni las conclusiones de cumplimiento normativo.
- Riesgo de alucinación inherente a los modelos de lenguaje: las recomendaciones de seguridad deben ser validadas por profesionales.
- Idiomas limitados a chino e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se especifican sesgos conocidos ni datos de evaluación de sesgos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no declara políticas de versión comercial ni certificaciones.
- El repositorio MLX está pensado exclusivamente para Apple Silicon; para otros entornos debe usarse el repositorio BF16 correspondiente.
- El tamaño del repositorio aparece como 0.0 GB en la información disponible, lo que puede indicar que los pesos aún no están completamente subidos o que la métrica no se ha actualizado.

## Enlaces

- HuggingFace (MLX): https://huggingface.co/QianqianTech/custos-1.0-mlx
- HuggingFace (BF16, vLLM/Transformers): https://huggingface.co/QianqianTech/custos-1.0
- ModelScope: https://modelscope.cn/models/QianqianTech/custos-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
