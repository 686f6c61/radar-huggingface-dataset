# CharanVelavan/orca-ntn-qwen3.6-35b-a3b-ft-gguf

## Resumen

ORCA-NTN tuned Qwen3.6-35B-A3B es un ajuste fino (QLoRA) del modelo Qwen3.6-35B-A3B de Alibaba, publicado por CharanVelavan como componente agéntico del proyecto ORCA-NTN, la propuesta del equipo Solar Sailors para el ITU AI for Good Sandbox Hackathon: United Arab Emirates (2026). No es un asistente general: es un modelo especializado en orquestar agentes de rol (operador móvil, operador de satélite, utility eléctrica, CERT-In, regulador, asesor de políticas y analista de brechas) que ejecutan llamadas a herramientas, citan identificadores de una base de conocimiento y solicitan aprobación humana durante un incidente cibernético simulado sobre una red satelital emulada en Chennai.

El modelo parte de la arquitectura de Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 35.505.251.456 parámetros totales, con proyecciones de tipo gated-delta-net y una torre de visión que el ajuste no modifica. El autor publica únicamente una cuantización IQ4_XS (19,2 GB) generada con llama.cpp, calibrada con una importance matrix sobre el modelo base. El entrenamiento consistió en 200 pasos de QLoRA 4-bit NF4 (r=16, alpha=32, semilla 3407) sobre 941.916.160 parámetros entrenables, con mejor checkpoint en el paso 100 (eval loss 0,0461) y 21 minutos en una RTX PRO 6000 de 96 GB.

Su relevancia es doble: por un lado, demuestra un pipeline de ajuste fino de tool calling con datos generados de forma determinista (sin intervención de LLM) y validación por cita; por otro, documenta de forma explícita los límites de seguridad del modelo (falla en 2 de 16 prompts con token falso en una sonda de 80 casos), lo que lo convierte en un caso de estudio útil sobre por qué la capa de seguridad debe residir en código y no en el modelo. Los pesos se distribuyen bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con gated-delta-net y torre de visión (base Qwen3.6-35B-A3B) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | 16.384 tokens en la configuración medida por el autor (contexto nativo del base no disponible) |
| Tipos de cuantizacion | IQ4_XS (única publicada); el base admite otras cuantizaciones GGUF |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el base en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con mezcla de expertos que incluye un experto compartido y expertos enrutados, además de proyecciones gated-delta-net y una torre de visión. El ajuste QLoRA en 4-bit NF4 (r=16, alpha=32, semilla 3407) adaptó las proyecciones de atención, las proyecciones gated-delta-net, el experto compartido y los expertos enrutados, dejando sin tocar el router, las normas, los embeddings, el lm_head y la torre de visión. El resultado son 941.916.160 parámetros entrenables, 200 pasos de entrenamiento y mejor checkpoint en el paso 100 con eval loss de 0,0461.

Los datos de entrenamiento son conversaciones de uso de herramientas generadas por un generador determinista (`finetune/make_data.py`), sin ningún LLM implicado. Los escenarios se ejecutan contra el runtime real de ORCA y una política scriptada selecciona cada llamada a herramienta, de modo que cada salida de herramienta es salida genuina de ORCA y las conversaciones que no pasan la comprobación de citas se descartan. El split es por escenario: entrenamiento con S0–S3 y N1–N3, y validación con N4, N5 y CAP. No se usan datos de incidentes reales ni datos personales. Tras el ajuste, el modelo se fusionó a 16 bits y se cuantizó a IQ4_XS con una importance matrix calibrada sobre el modelo base.

## Capacidades

- Generación de texto conversacional orientada a agentes de rol con trayectorias multi-turno.
- Tool calling / function calling con selección de herramienta y argumentos (0,930 de acierto en herramienta y 0,903 en argumentos sobre 300 casos retenidos).
- Emisión de JSON válido en el 100 % de los casos evaluados.
- Citación de identificadores de una base de conocimiento y comprobación de evidencia ("insufficient evidence" en el 100 % de los casos donde corresponde).
- Solicitud de aprobación humana: rechaza la ejecución sin token de aprobación en el 97,5 % de los casos.
- Razonamiento multi-paso dentro de escenarios de incidente cibernético (detección de brechas de política con motor de reglas).
- Capacidades multilingües: solo inglés declarado.
- Modo thinking desactivable mediante `chat_template_kwargs.enable_thinking=false` (el cliente de ORCA lo desactiva).
- No es un asistente general: su comportamiento está especializado en el dominio de telecomunicaciones, satélite y ciberseguridad del proyecto.

## Casos de uso

- Simulación de incidentes cibernéticos en redes satelitales: el modelo orquesta agentes de rol que llaman herramientas del runtime de ORCA, citan la base de conocimiento y piden aprobación humana, adecuado por su alta tasa de selección correcta de herramienta (0,930) y su rechazo de ejecuciones sin token.
- Formación y evaluación de equipos CERT: permite reproducir escenarios de respuesta a incidentes con trazas deterministas y comparar decisiones de agentes frente a una política scriptada, sin necesidad de datos reales.
- Análisis de brechas de política (Gap Analyst): con el motor de reglas activo detectó 40/40 brechas esperadas en 10 escenarios completos, útil para auditorías de cumplimiento en entornos emulados.
- Investigación sobre tool calling seguro: sirve como banco de pruebas para estudiar por qué la seguridad debe residir en código (tokens de un solo uso, ligados a plan y con caducidad) y no en el modelo, dado que este intentó `execute_playbook` en 2 de 16 prompts con token falso.
- Generación de datos sintéticos de conversaciones agénticas: el pipeline determinista (`make_data.py`) y el filtrado por cita son reutilizables para construir datasets de entrenamiento de agentes en otros dominios regulados.
- Despliegue en hardware modesto para demos en vivo: con IQ4_XS (19,2 GB) cabe en una NVIDIA L4 de 24 GB a 16k de contexto, con 18,2 GB de VRAM y ~83 tokens/s, lo que permite ejecutar demos del hackathon en una sola GPU de gama media.
- Integración en pipelines de CI/CD de agentes: el formato GGUF y el servidor compatible con la API de OpenAI (`llama-server --port 8000`) facilitan pruebas automatizadas de regresión de comportamiento agéntico.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 300 casos retenidos, un solo paso, temperatura 0, thinking desactivado y el mismo scorer para todos los modelos:

| Métrica | Base Qwen3.6 | Este modelo | Base Gemma 4 12B | Gemma 4 12B ajustado |
|---|---:|---:|---:|---:|
| Herramienta correcta | 0,557 | **0,930** | 0,667 | 0,893 |
| Argumentos correctos | 0,630 | **0,903** | 0,607 | 0,833 |
| JSON válido | 1,0 | 1,0 | 1,0 | 1,0 |
| Ejecuciones inseguras | 3 | **0** | 5 | 0 |
| Rechaza sin token de aprobación | 0,550 | **0,975** | 0,525 | 0,775 |
| Dice "insufficient evidence" cuando corresponde | 0,000 | **1,000** | 0,688 | 1,000 |

Ejecuciones completas de escenario (10 escenarios, motor de reglas activado y desactivado): 40/40 brechas de política esperadas encontradas con motor de reglas, 0/40 sin él; 0 playbooks ejecutados por un agente en ninguna ejecución.

El autor advierte que la comparación mezcla efectos de ajuste fino y de cuantización (IQ4_XS, 19,2 GB frente al UD-IQ4_XS del base, 17,7 GB), y que el conjunto de 300 casos se reconstruyó con los mismos estratos y semilla que el original, sin poder probar identidad fila a fila con el subconjunto de Colab original.

## Requisitos de hardware

- VRAM estimada: 18,2 GB de memoria GPU con contexto de 16k en la configuración medida (IQ4_XS, `-ngl 99 -fa on --cache-type-k q8_0 --cache-type-v q8_0 -np 1`).
- GPU recomendadas: NVIDIA L4 (24 GB) es la configuración validada por el autor; cabe también en RTX 4090 (24 GB) y A100/H100 por holgura. El entrenamiento se hizo en una RTX PRO 6000 (96 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) usando IQ4_XS a 16k de contexto.
- Opciones de despliegue: `llama-server` de llama.cpp (commit `998200491327347eed85f007e4de7a1a7c871453`), compatible con la API de OpenAI en `http://localhost:8000/v1`; el repo de ORCA consume ese endpoint. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: ~83 tokens/s de decodificación en una NVIDIA L4 con la configuración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Herramienta correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORCA-NTN Qwen3.6-35B-A3B (este) | 35,5B totales | 16k (medido) | 0,930 | Apache-2.0 | GGUF IQ4_XS en HF |
| Qwen3.6-35B-A3B base | 35,5B totales | no disponible | 0,557 | Apache-2.0 | safetensors y GGUF en HF |
| Gemma 4 12B base | 12B | no disponible | 0,667 | no disponible | no disponible |
| Gemma 4 12B ajustado (ORCA) | 12B | no disponible | 0,893 | no disponible | no disponible |

La comparación se limita a los modelos incluidos en la evaluación del autor; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es la capa de seguridad: en una sonda de 80 prompts fuera de formato intentó `execute_playbook` en 2 de 16 prompts con token falso. No debe usarse sin una puerta de aprobación humana que emita tokens de un solo uso, ligados a plan y con caducidad, verificados por código.
- El texto de los agentes en ejecuciones en vivo es formulaico y tiende a seguir las trayectorias vistas en entrenamiento.
- Sus afirmaciones legales provienen de la base de conocimiento y del motor de reglas determinista; no ofrece asesoramiento legal.
- Solo declara inglés; no hay soporte multilingüe documentado.
- La red, los ataques y los incidentes son emulados; no se usaron datos de incidentes reales ni datos personales.
- La comparación de benchmarks mezcla efectos de ajuste fino y cuantización (IQ4_XS frente a UD-IQ4_XS del base).
- El conjunto de 300 casos se reconstruyó con los mismos estratos y semilla, pero no se puede probar identidad fila a fila con el subconjunto original.
- Riesgo de alucinación y sesgos: no documentados explícitamente por el autor; el filtrado por cita reduce conversaciones sin respaldo en la base de conocimiento, pero no elimina el riesgo fuera de ese dominio.
- Licencia Apache-2.0 heredada del base; el código de ORCA-NTN es MIT. Uso comercial permitido según la licencia, pero el modelo está diseñado para el dominio específico del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharanVelavan/orca-ntn-qwen3.6-35b-a3b-ft-gguf
- Repositorio de código ORCA: https://github.com/CharanVelavan/ORCA
- Base de conocimiento: https://huggingface.co/datasets/CharanVelavan/orca-ntn-kb-v2
- Modelo base (espejo sin gating): https://huggingface.co/unsloth/Qwen3.6-35B-A3B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
