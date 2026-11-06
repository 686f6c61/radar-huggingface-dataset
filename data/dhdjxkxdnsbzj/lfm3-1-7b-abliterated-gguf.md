# Dhdjxkxdnsbzj/lfm3-1.7b-abliterated-gguf

## Resumen

LFM3-1.7B abliterated es una variante modificada del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Dhdjxkxdnsbzj en Hugging Face. El modelo base es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) orientado a agentes locales y aplicaciones especializadas, con una ventana de contexto de 256K tokens y soporte nativo de tool calling. La modificación consiste en una "abliteración": se identifica una dirección de rechazo en la capa 13 a partir de 64 prompts dañinos y 64 inofensivos, y se ortogonaliza esa dirección en los 49 escritores del residual stream, con el objetivo de reducir la tasa de rechazo del modelo.

El resultado reportado por el autor es una bajada de la tasa de rechazo del 100% (40/40) al 22,5% (9/40) sobre 40 prompts dañinos reservados, a costa de un aumento de perplejidad de 10,60 a 11,44. La distribución publicada en este repositorio es en formato GGUF f16 (coma flotante, no cuantizado), lo que facilita su uso con Ollama y llama.cpp. Es relevante ahora porque combina un modelo pequeño de contexto muy largo con una modificación de alineación que interesa a investigadores de seguridad y a desarrolladores que necesitan evaluar el comportamiento de modelos sin rechazo en entornos controlados.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia. La model card advierte de que la plantilla de chat fija `enable_thinking=false` por defecto, ya que LFM3 tiende a emitir un ` thinking` abierto y entrar en bucle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (tri-hybrid, según documentación del modelo base) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (modelo base, según Liquid AI Docs) |
| Tipos de cuantizacion | f16 GGUF en este repo; no se listan otras cuantizaciones |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (f16) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de Liquid AI se describe como un modelo de texto basado en la nueva arquitectura "LFM3 tri-hybrid", con 256K de contexto y tool calling nativo. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La modificación de este repositorio es una abliteración: se calcula una dirección de rechazo con 64 prompts dañinos frente a 64 inofensivos en la capa 13, y se ortogonaliza dicha dirección en los 49 escritores del residual stream. El autor reporta el efecto sobre la tasa de rechazo y la perplejidad (ver sección de benchmarks). El formato publicado es f16 GGUF, es decir, pesos en coma flotante de 16 bits dentro de un contenedor GGUF, no una cuantización de menor precisión.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuestas multi-turno gracias al contexto de 256K tokens del modelo base.
- Tool calling / function calling nativo en el modelo base; para esta variante el autor indica usar `llama-server --jinja` o el endpoint `/v1` de Ollama.
- Uso en agentes locales y aplicaciones especializadas, según la documentación del modelo base.
- Modo thinking en el modelo base, aunque la plantilla de chat de esta variante lo desactiva por defecto (`enable_thinking=false`) para evitar bucles.
- Capacidades multilingües: solo inglés declarado.
- No se dispone de información sobre visión, audio u otras modalidades.

## Casos de uso

- Investigación en seguridad y alineación: evaluar cómo cambia la tasa de rechazo tras la abliteración (del 100% al 22,5% reportado) y medir el coste en perplejidad (de 10,60 a 11,44) en pipelines de red-teaming controlados.
- Agentes locales con contexto largo: el modelo base soporta 256K tokens, lo que permite mantener historiales extensos o documentos completos en memoria en un equipo de sobremesa.
- Asistentes conversacionales en inglés: despliegue con Ollama mediante el `Modelfile` incluido, adecuado para prototipos y entornos de desarrollo.
- Integración de tool calling: usar `llama-server --jinja` o el endpoint `/v1` de Ollama para conectar el modelo a funciones externas en flujos de automatización.
- Experimentación con plantillas de chat: permite estudiar el efecto de `enable_thinking` en el comportamiento del modelo y en la aparición de bucles.
- Docencia y reproducción de técnicas de abliteración: el repositorio documenta la capa, el número de prompts y los escritores del residual stream afectados, lo que facilita reproducir el procedimiento.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos sobre 40 prompts dañinos reservados:

| Metrica | Base | Abliterated |
|---|---|---|
| Tasa de rechazo | 100% (40/40) | 22,5% (9/40) |
| Perplejidad | 10,60 | 11,44 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 3,5 GB solo para pesos (1,73B parámetros × 2 bytes), más overhead de contexto KV; el repo ocupa 4,6 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM debería poder cargar los pesos en f16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (por ejemplo, RTX 3060/4060 y superiores), aunque no se confirma en la documentación.
- Opciones de despliegue: Ollama (con el `Modelfile.lfm3-abliterated` incluido), llama.cpp / `llama-server` con `--jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B abliterated (este) | 1,73B | 256K (base) | no disponible | GGUF f16 | Tasa de rechazo 22,5%, perplejidad 11,44 |
| LFM3-1.7B (base, Liquid AI) | 1,73B | 256K | no disponible en la información | no disponible | Tasa de rechazo 100%, perplejidad 10,60 |
| Otras alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La abliteración reduce los rechazos de forma deliberada: el modelo puede generar contenido dañino o inapropiado. No debe desplegarse en producción orientada a usuarios sin filtros externos.
- El autor reporta que persiste un 22,5% de rechazos sobre prompts dañinos; el comportamiento no es uniforme.
- Aumento de perplejidad de 10,60 a 11,44, lo que sugiere una degradación de la calidad del modelado del lenguaje.
- Solo se declara inglés; el rendimiento en otros idiomas no está documentado.
- El modelo base tiende a emitir un ` thinking` abierto y entrar en bucle si no se desactiva `enable_thinking`; la plantilla incluida lo desactiva por defecto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar la licencia del modelo base de Liquid AI antes de cualquier uso.
- Repositorio con 0 descargas y 0 likes; sin validación comunitaria ni resultados de benchmarks estándar.
- Riesgo de alucinación inherente a modelos de 1,7B, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Dhdjxkxdnsbzj/lfm3-1.7b-abliterated-gguf
- Documentación del modelo base (Liquid AI): https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Ficha GGUF en local-ai-zone: https://local-ai-zone.github.io/models/lfm3-1-7b.html
