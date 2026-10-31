# LiquidAI/LFM3-1.7B-MLX-8bit

## Resumen

LFM3-1.7B-MLX-8bit es una versión cuantizada a 8 bits, preparada para Apple Silicon (MLX), del modelo LFM3-1.7B desarrollado por Liquid AI. Se trata de un modelo de generación de texto conversacional de tamaño reducido (1.728.801.536 parámetros), orientado a ejecución local en dispositivos Mac con chips M1/M2/M3/M4, donde el consumo de memoria y la latencia son factores críticos.

Liquid AI es conocida por su familia de Liquid Foundation Models (LFM), arquitecturas que no se limitan al transformer clásico y que buscan un equilibrio entre calidad de generación y eficiencia en inferencia. La serie LFM3 representa su tercera generación, y esta variante MLX facilita el despliegue on-device sin depender de la nube, algo especialmente relevante para aplicaciones de privacidad, agentes locales y asistentes integrados.

Esta ficha se centra en la versión cuantizada: los pesos ocupan 1,84 GB (repo de 1,9 GB) y emplean cuantización afín de 8 bits con grupos de 64. El modelo base admite 16 idiomas, entre ellos el castellano. Para detalles completos de arquitectura y uso, Liquid AI remite a la model card del modelo original LFM3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Models (LFM3); detalles concretos no disponibles en la ficha |
| Parametros totales | 1.728.801.536 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa hasta 16.384 tokens de salida, pero no confirma la ventana de contexto) |
| Tipos de cuantizacion | 8-bit afín con grupos de 64 (esta variante MLX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM 1.0 (licencia propia "other"; consultar el texto LICENSE para condiciones de uso comercial) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B, la tercera generación de los Liquid Foundation Models de Liquid AI. La model card de esta variante no detalla la arquitectura interna (tipo de capas, mecanismos de atención o híbridos utilizados), por lo que no es posible confirmar si se trata de un transformer puro o de una arquitectura híbrida; Liquid AI remite a la model card del modelo original y a su blog para esos detalles.

Sobre el entrenamiento tampoco se publican datos en esta ficha: no se especifica el número de tokens, la composición del corpus ni el uso de técnicas de alineación como RLHF o DPO. Lo único documentado en esta variante es el proceso de cuantización: conversión a 8 bits afín con grupos de 64, que reduce los pesos a 1,84 GB manteniendo una precisión habitualmente cercana al modelo original en half precision.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiquetado como conversational).
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Tareas de matemáticas y ciencia: la propia model card recomienda una configuración de muestreo específica (temp 1.0, top-p 0.95, top-k 20) para estos dominios, lo que indica que el modelo se evalúa en ese tipo de tareas.
- Ejecución on-device en Apple Silicon gracias al formato MLX, con huella de memoria reducida (1,84 GB).
- No se documenta en la ficha soporte de tool calling, agentes, visión ni audio; no disponible.

## Casos de uso

- Asistentes conversacionales locales en Mac: con 1,84 GB de pesos, el modelo cabe en la memoria unificada de cualquier Apple Silicon moderno, permitiendo chatbots que no envían datos a la nube.
- Aplicaciones con requisitos de privacidad: procesamiento de texto sensible (notas personales, correos, documentación interna) íntegramente en el dispositivo.
- Integración en apps iOS/macOS con MLX: el formato nativo de MLX permite incrustar el modelo en aplicaciones del ecosistema Apple sin servidores dedicados.
- Generación y resumen de texto multilingüe: útil para redactar o resumir contenido en castellano, inglés y otros 14 idiomas desde un mismo modelo compacto.
- Prototipado rápido de LLMs en portátiles: ideal para desarrolladores que quieren iterar prompts y pipelines sin coste de API ni GPU remota.
- Tareas de razonamiento matemático y científico ligeras: la model card sugiere parámetros de muestreo concretos para estos dominios, lo que lo hace apto para asistentes de cálculo y explicación conceptual, siempre dentro de los límites de un modelo de 1,7B.
- Agentes locales de línea de comandos: mediante mlx_lm.generate es posible construir scripts y automatizaciones que consulten al modelo sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 1,84 GB; con overhead de KV cache y runtime, es razonable presupuestar entre 2,5 y 4 GB de memoria unificada para contextos moderados (estimación, no dato oficial).
- Hardware recomendado: cualquier Mac con Apple Silicon (M1, M2, M3 o M4). No se requiere GPU dedicada; MLX aprovecha la GPU integrada y la memoria unificada.
- Consumer hardware: sí, cabe con holgura en portátiles Apple Silicon de gama base (por ejemplo, un MacBook Air con 8 GB de RAM). No es aplicable a GPUs NVIDIA en este formato MLX; para ello existirían otras variantes del modelo base.
- Despliegue: vía mlx-lm (soporte de LFM3 en mlx-lm aún en progreso según la model card; se actualizará cuando una release lo incorpore). El comando de ejemplo es `mlx_lm.generate --model LiquidAI/LFM3-1.7B-MLX-8bit`. No hay menciones a vLLM, TGI, llama.cpp u Ollama para esta variante. También existen la API y el playground de Liquid AI como alternativas gestionadas.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B cuantizado a 8 bits en MLX, cabe esperar generación interactiva en tiempo real en Apple Silicon reciente, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-8bit | 1,73B | 8-bit afín (grupos de 64), MLX | 16 | LFM 1.0 (other) | HuggingFace, pesos de 1,84 GB |
| LFM3-1.7B (base) | 1,73B | Precisión original (safetensors) | 16 | LFM 1.0 (other) | HuggingFace |
| Qwen3-1.7B (referencia de categoria) | ~1,7B | Múltiples cuantizaciones (GGUF, etc.) | Multilingüe (100+ según Qwen) | Apache 2.0 | HuggingFace, Ollama, llama.cpp |

Nota: la comparación con Qwen3-1.7B es orientativa como modelo de tamaño similar; los datos de rendimiento comparado no están disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; como todo LLM, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Alucinaciones: riesgo inherente no cuantificado por el autor; para matemáticas y ciencia se recomienda la configuración de muestreo específica (temp 1.0, top-p 0.95, top-k 20), lo que sugiere sensibilidad a los parámetros de decodificación en esos dominios.
- Contexto e idioma: la ventana de contexto no está publicada en esta ficha; el rendimiento en castellano no está benchmarkado, aunque el idioma figura entre los soportados.
- Licencia: LFM 1.0 es una licencia propia ("other"), no una licencia abierta estándar. Es imprescindible revisar el texto LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones.
- Soporte de mlx-lm aún en progreso: puede ser necesario esperar a una release oficial o compilar desde el repositorio para una integración completa.
- La línea de comandos de mlx-lm no incluye flag de repetition penalty; en Python hay que usar `make_logits_processors(repetition_penalty=1.1)`, un detalle importante para evitar repeticiones en generaciones largas.
- Al ser una variante cuantizada, puede haber una ligera degradación de calidad respecto al modelo base en half precision; no se publican evaluaciones de esa diferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- mlx-lm: https://github.com/ml-explore/mlx-lm
