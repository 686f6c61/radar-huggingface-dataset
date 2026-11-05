# beyoru/Qwen3.5-SafeProbe-2B

## Resumen

Qwen3.5-SafeProbe-2B es un modelo de clasificación de texto (safety probe) desarrollado por el usuario beyoru sobre el modelo base Qwen/Qwen3.5-2B. Su función no es la generación de texto, sino actuar como clasificador de seguridad: detecta contenido nocivo, intentos de jailbreak y prompt injection en las entradas de un sistema LLM. Está pensado como componente de guardrail (llm-guard, llm-firewall) en pipelines de moderación y despliegue de agentes.

El modelo se distribuye como un fine-tune del Qwen3.5-2B con pesos en safetensors (1.541.753.026 parámetros reales según el repositorio, 3,1 GB de tamaño total) y licencia Apache 2.0. Está etiquetado para los pipelines de transformers y text-classification, con soporte declarado de inglés y vietnamita, y con requisito de acceso restringido (gated) en HuggingFace.

Su relevancia actual radica en la creciente necesidad de capas de protección ligeras y de baja latencia que se puedan desplegar junto a modelos generativos de mayor tamaño, filtrando entradas antes de que lleguen al modelo principal y reduciendo la superficie de ataque frente a prompt injection y jailbreaks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-2B; etiquetado como feature-extraction / text-classification) |
| Parametros totales | 1.541.753.026 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que se trata de un fine-tune del modelo base Qwen/Qwen3.5-2B, con 1.541.753.026 parámetros reales almacenados en safetensors. El repositorio incluye código personalizado (etiqueta custom_code) y declara el pipeline de text-classification, lo que indica una cabeza de clasificación orientada a etiquetar seguridad de entradas. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión específica para detección de jailbreaks.

Las etiquetas del repositorio (safety, guardrail, ai-safety, content-moderation, prompt-injection, jailbreak-detection, llm-guard, llm-firewall, probe) describen el propósito del modelo, pero no constituyen documentación técnica sobre el procedimiento de entrenamiento. No hay información publicada sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Clasificación de seguridad de texto: etiquetado de entradas como seguras o inseguras en el contexto de moderación de contenido.
- Detección de prompt injection: identificación de intentos de manipular instrucciones del sistema.
- Detección de jailbreak: reconocimiento de prompts diseñados para eludir las políticas de seguridad de un LLM.
- Integración como guardrail: uso como capa previa (llm-guard, llm-firewall) en pipelines de LLM.
- Extracción de características: el pipeline declarado permite obtener representaciones del texto de entrada.
- Multilingüe limitado: soporte declarado de inglés (en) y vietnamita (vi).
- Inferencia ligera: con ~1,5 mil millones de parámetros, está orientado a despliegues de baja latencia.
- No se documentan capacidades de generación, tool calling, agentes, visión ni audio.

## Casos de uso

- Filtrado previo de prompts en un chatbot: el modelo clasifica cada mensaje del usuario antes de enviarlo al LLM principal, bloqueando entradas maliciosas y reduciendo el coste de inferencia del modelo grande.
- Protección frente a prompt injection en agentes: en un pipeline con acceso a herramientas, el clasificador revisa las instrucciones y el contenido recuperado (RAG) para detectar intentos de secuestro de instrucciones.
- Moderación de contenido en comunidades: integración en un servicio de comentarios o foro para etiquetar mensajes potencialmente nocivos y derivarlos a revisión humana.
- Firewall de LLM en producción: despliegue como microservicio delante de una API de generación, con clasificación de entrada en milisegundos gracias al tamaño reducido del modelo.
- Detección de jailbreaks en productos de consumo: capa de seguridad en asistentes conversacionales que debe ejecutarse en infraestructura modesta, sin depender de un modelo grande adicional.
- Auditoría y monitorización: registro de las clasificaciones para analizar patrones de ataque y ajustar políticas de seguridad, aprovechando el pipeline de text-classification y la extracción de características.
- Evaluación de datasets de seguridad: uso del modelo para etiquetar corpus de prompts y construir conjuntos de prueba de robustez frente a ataques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos (1,54 mil millones de parámetros), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB; en 4 bits, en torno a 1-1,5 GB (estimaciones por tamaño de parámetros; el repositorio no publica cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen; A100, H100 o L40S para despliegues de alto throughput; RTX 4090 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060/4060 en adelante); en GPUs con 4-6 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia de un dígito de milisegundos a decenas de milisegundos por clasificación en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beyoru/Qwen3.5-SafeProbe-2B | 1.541.753.026 | no disponible | Clasificación de seguridad (guardrail) | apache-2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-2B (base) | ~2B (según nombre) | no disponible | Generación de texto | no disponible en esta ficha | Público en HuggingFace |
| Alternativas de clasificación de seguridad de tamaño similar | no disponible | no disponible | Moderación / detección de jailbreak | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros clasificadores de seguridad concretos (por ejemplo, modelos de moderación de proveedores o guardrails open source específicos) sin inventar datos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.
- Idiomas limitados: solo se declaran inglés y vietnamita; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Sin benchmarks publicados: no hay métricas de precisión, recall ni tasas de falsos positivos/negativos, lo que impide validar su eficacia en producción sin una evaluación propia.
- Riesgo de falsos positivos y negativos: al ser un clasificador de seguridad, puede bloquear contenido legítimo o dejar pasar ataques; se recomienda calibración con datos propios.
- Documentación escasa: no se detallan datos de entrenamiento, arquitectura de la cabeza de clasificación ni procedimiento de alineación, lo que dificulta la auditoría.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-2B debe verificarse por si impone condiciones adicionales.
- No es un modelo generativo: no debe usarse para producir respuestas, sino como clasificador; su integración requiere un pipeline adicional.
- Fecha de creación reciente (2026-11-05) y sin descargas ni likes: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/beyoru/Qwen3.5-SafeProbe-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
