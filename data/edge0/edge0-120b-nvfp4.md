# Edge0/Edge0-120B-NVFP4

## Resumen
Edge0-120B-NVFP4 es una compilación cuantizada a 4 bits (NVFP4) del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el colectivo Edge0 bajo licencia Apache 2.0. Aunque la nomenclatura comercial del repositorio indica "120B", los pesos reales en safetensors suman 4.947.698.560 parámetros (aproximadamente 4,95 mil millones), lo que apunta a una arquitectura de mezcla de expertos (MoE) con un número de parámetros activos muy inferior al total nominal. El repositorio ocupa 97,6 GB, un tamaño desproporcionado para el número de parámetros declarado, lo que sugiere pesos empaquetados en precisión de 4 bits con metadatos adicionales o múltiples variantes incluidas.

El modelo está orientado explícitamente a inferencia en el borde (edge inference), agentes y generación de código, según las etiquetas del repositorio. Incorpora la etiqueta "latent-moe", que sugiere una variante de MoE con enrutamiento latente, y se distribuye tanto en formato GGUF como en pesos nativos para CUDA. La librería asociada es `edge0`, propia del autor, y el modelo declara compatibilidad con endpoints conversacionales.

Su relevancia radica en la combinación de licencia permisiva, cuantización agresiva a 4 bits y un enfoque declarado hacia despliegues en hardware limitado, aunque la ausencia de benchmarks publicados y de documentación sobre el proceso de cuantización limita seriamente su evaluación rigurosa. La ficha se basa exclusivamente en los metadatos disponibles; cualquier dato no confirmado se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con enrutamiento latente (latent-moe), transformer; detalles no disponibles |
| Parámetros totales | 4.947.698.560 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits NVFP4 (única variante publicada); GGUF mencionado en tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (según tags y librería) |

## Arquitectura y entrenamiento
La información disponible describe el modelo como una mezcla de expertos (MoE) con una variante denominada "latent-moe", lo que implica un mecanismo de enrutamiento que opera en un espacio latente en lugar de sobre las representaciones explícitas de los tokens. No se especifican el número de expertos, la dimensión del espacio latente, la estrategia de top-k routing ni la proporción de parámetros activos por token. El tamaño real de 4,95 mil millones de parámetros contrasta con la denominación "120B" del repositorio, lo que sugiere que el nombre comercial puede referirse a un conteo agregado de expertos o a una convención de marketing no verificable con los pesos publicados.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o fine-tuning supervisado. Tampoco se documenta el proceso de cuantización a NVFP4 (calibración, granularidad de escala, manejo de outliers) ni las innovaciones técnicas asociadas al modelo base Qwen/Qwen3.8-Flash-Next. Todos estos extremos deben considerarse no disponibles.

## Capacidades
- Generación de texto conversacional multi-turno, según la etiqueta "conversational" y el pipeline text-generation.
- Generación de código, respaldada por la etiqueta "coding" del repositorio.
- Soporte declarado para agentes y flujos de razonamiento multi-paso, según la etiqueta "agent".
- Inferencia en el borde (edge inference), con cuantización a 4 bits orientada a hardware limitado.
- Compatibilidad con endpoints conversacionales (tag "endpoints_compatible").
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Asistentes conversacionales en dispositivos locales: el modelo puede gestionar diálogos multi-turno en hardware de consumo gracias a su cuantización NVFP4 de 4 bits y a la etiqueta edge-inference, aunque la longitud de contexto no está confirmada.
- Autocompletado y generación de código en IDE: la etiqueta "coding" sugiere uso como copiloto local en entornos con GPU modesta, evitando dependencia de la nube.
- Agentes autónomos de automatización de tareas: el tag "agent" indica soporte para planificación y ejecución de pasos, adecuado para orquestadores locales con tool calling (aunque este no está documentado).
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable localmente, permite procesar datos sensibles sin salir del dispositivo.
- Prototipado rápido de aplicaciones conversacionales: la compatibilidad con endpoints y el formato GGUF facilitan integraciones en servidores de inferencia ligeros.
- Investigación sobre cuantización y MoE: el modelo sirve como caso de estudio para evaluar el impacto de NVFP4 en un MoE con enrutamiento latente, aunque sin benchmarks publicados la comparación es limitada.
- Filtrado y resumen de texto en pipelines de borde: su tamaño reducido permite ejecutarlo junto a otros procesos en una misma GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 4,95 mil millones de parámetros en 4 bits, el peso teórico ronda los 2,5 GB, pero el repositorio ocupa 97,6 GB, por lo que el despliegue real puede requerir espacio en disco muy superior y VRAM adicional para buffers y metadatos; no disponible con precisión.
- GPU recomendadas: no disponibles. Por tamaño de pesos, una RTX 4090 (24 GB) o superior debería ser suficiente en teoría, pero la discrepancia entre el tamaño del repo y los parámetros impide confirmarlo.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-24 GB si se usa la variante GGUF, pero no confirmado.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI solo si se confirma compatibilidad con safetensors NVFP4 (no documentada). La librería propia `edge0` es el mecanismo de carga declarado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-120B-NVFP4 | 4,95 B (según safetensors) | no disponible | Apache 2.0 | safetensors, GGUF | Cuantización NVFP4, MoE latente, sin benchmarks |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos públicos en esta ficha |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para comparar con modelos equivalentes |

## Limitaciones y advertencias
- Discrepancia entre el nombre "120B" y los 4,95 mil millones de parámetros reales en safetensors: verificar el conteo antes de dimensionar infraestructura.
- Tamaño del repositorio (97,6 GB) muy superior al esperado para 4,95 B en 4 bits, lo que puede indicar pesos redundantes, múltiples variantes o metadatos no documentados.
- Ausencia total de benchmarks: no es posible validar calidad, razonamiento, código ni multilingüismo frente a alternativas.
- No se documentan idiomas soportados, lo que impide garantizar calidad en castellano.
- No se confirma soporte de tool calling ni de contexto largo, pese a las etiquetas de agente.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación publicada.
- Proceso de cuantización NVFP4 no documentado: posible degradación de calidad frente al modelo base, sin métricas que lo cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia del modelo base Qwen/Qwen3.8-Flash-Next y sus posibles restricciones adicionales no están verificadas en esta información.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces
- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
