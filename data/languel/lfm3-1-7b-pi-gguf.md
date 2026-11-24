# languel/LFM3-1.7B-pi-GGUF

## Resumen

LFM3-1.7B-pi-GGUF es una distribución cuantizada y fusionada del modelo LFM3-1.7B de Liquid AI, publicada por el usuario languel en Hugging Face. Se trata de un derivado que combina los pesos del modelo base con un adaptador LoRA entrenado mediante aprendizaje por refuerzo (RL) para tareas de agente de programación, denominado Pi, desarrollado por harness-hub. El resultado se ha convertido a formato GGUF en cuantización Q4_K_M para permitir su ejecución directa sin necesidad de cargar el adaptador LoRA por separado en tiempo de ejecución.

El modelo resuelve el problema de desplegar un agente conversacional de código en entornos con recursos limitados: al estar cuantizado a 4 bits y empaquetado como un único fichero GGUF de aproximadamente 1,1 GB, puede ejecutarse en navegador mediante WebGPU, en Ollama y en llama.cpp. Con 1.728.801.600 parámetros totales, se sitúa en la categoría de modelos pequeños, adecuado para inferencia local y en el borde.

La relevancia actual del modelo radica en su enfoque de despliegue: un agente de código fusionado y cuantizado que funciona en el navegador sin servidor dedicado. Sin embargo, la información pública disponible es escasa (cero descargas, cero likes en el momento de la consulta) y no se han publicado benchmarks ni detalles sobre el contexto o los idiomas soportados en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; detalles no especificados en la información proporcionada) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única cuantización publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (licencia "other", con limitación de uso comercial en la sección 5) |
| Formato de pesos | GGUF (fichero `LFM3-1.7B-pi-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B de Liquid AI. Lo que sí se documenta es el proceso de construcción del derivado: se parte de los pesos de LiquidAI/LFM3-1.7B, se fusiona el adaptador LoRA harness-hub/LFM3-1.7B-pi (entrenado con RL para actuar como agente de programación Pi) y el resultado se convierte y cuantiza a Q4_K_M en formato GGUF. Esta fusión elimina la necesidad de un cargador LoRA separado en tiempo de ejecución, lo que simplifica el despliegue en navegador, Ollama y llama.cpp.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO más allá de la mención al entrenamiento RL del adaptador Pi. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional (el tag "conversational" está presente en el repo).
- Actuación como agente de programación: el adaptador Pi está entrenado con RL para tareas de agente de código.
- Soporte de agentes: los tags incluyen "agents" y "pi".
- Ejecución en navegador mediante WebGPU (a través de `Lfm3ForCausalLM.js`).
- Compatibilidad con Ollama y llama.cpp.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades de visión, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código en el navegador: el modelo puede descargarse bajo demanda mediante peticiones HTTP Range y almacenarse en caché con la Cache API, permitiendo un asistente de programación que se ejecuta íntegramente en el cliente sin backend. Es adecuado por su tamaño reducido (1,1 GB en Q4_K_M) y su naturaleza de agente Pi.
- Asistencia de programación en local con Ollama: mediante `ollama run hf.co/languel/LFM3-1.7B-pi-GGUF:Q4_K_M`, se puede integrar en flujos de trabajo de desarrollo en máquinas sin GPU dedicada de gran capacidad.
- Automatización de tareas de agente multi-paso: al estar entrenado con RL como agente Pi, puede emplearse en pipelines que requieran razonamiento iterativo sobre código y acciones, aunque no se documentan detalles sobre tool calling.
- Prototipado rápido de aplicaciones conversacionales: su formato GGUF y su pequeño tamaño permiten iterar en entornos de desarrollo con llama.cpp sin infraestructura de servidores.
- Educación y experimentación: útil para investigadores que quieran estudiar el efecto de la fusión de adaptadores LoRA RL en modelos pequeños cuantizados, dado que el proceso de construcción está documentado.
- Despliegue en el borde (edge computing): al caber en 1,1 GB, puede ejecutarse en dispositivos con recursos limitados mediante llama.cpp u Ollama, aunque no se especifican requisitos mínimos de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero Q4_K_M ocupa aproximadamente 1,1 GB, por lo que se estima que requiere en torno a 1,5-2 GB de memoria para cargar el modelo y el contexto, aunque esta cifra no está confirmada en la documentación.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se especifica, pero por tamaño (1,1 GB en Q4_K_M) es plausible que quepa en GPUs de consumo modestas; no confirmado.
- Opciones de despliegue: WebGPU en navegador (vía `Lfm3ForCausalLM.js`), Ollama y llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0 con limitación de uso comercial (sección 5) y requisitos de redistribución (sección 4): es imprescindible revisar el fichero LICENSE antes de cualquier uso en producción.
- El modelo es un derivado (fusión de base + LoRA) y debe atribuirse correctamente a Liquid AI, Inc. y a harness-hub según los términos de la licencia.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- No se especifica la longitud de contexto, lo que impide evaluar su idoneidad para conversaciones de contexto largo.
- Solo se publica una cuantización (Q4_K_M); no hay alternativas de mayor o menor precisión en el repo.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- El pipeline no está disponible en la información proporcionada.

## Enlaces

- [Hugging Face: languel/LFM3-1.7B-pi-GGUF](https://huggingface.co/languel/LFM3-1.7B-pi-GGUF)
- [Modelo base: LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Adaptador LoRA: harness-hub/LFM3-1.7B-pi](https://huggingface.co/harness-hub/LFM3-1.7B-pi)
- [Licencia LFM Open License v1.0 (LICENSE en el repo)](https://huggingface.co/languel/LFM3-1.7B-pi-GGUF/blob/main/LICENSE)
