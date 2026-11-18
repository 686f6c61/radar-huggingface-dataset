# ggml-org/Clef-GGUF

## Resumen

Clef es un modelo de decisión multimodal (image-text-to-text) desarrollado originalmente por Cloudflare y distribuido en formato GGUF por ggml-org para su uso con llama.cpp. Con 27.024.054.788 parámetros (~27B), está diseñado específicamente para tareas de decisión y se invoca a través de un endpoint dedicado (`/v1/systemone`) en lugar del endpoint de chat convencional, lo que lo diferencia de los LLM generativos al uso.

La relevancia de esta ficha radica en que Clef representa una categoría emergente: modelos especializados en toma de decisiones que consumen entradas multimodales (texto e imagen) y devuelven una decisión estructurada. La versión GGUF de ggml-org facilita su despliegue local y en entornos con recursos limitados mediante cuantización, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo base es `Cloudflare/clef` y esta conversión se ha generado automáticamente con la herramienta `ggml-org/convert`. Requiere una versión específica de llama.cpp (PR #29831) que introduce el soporte del endpoint de decisión, por lo que no funciona con builds estándar anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal, base Cloudflare/clef) |
| Parametros totales | 27.024.054.788 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Cloudflare/clef` en la documentación proporcionada. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imágenes como entrada. La etiqueta `decision-model` indica que su propósito no es la generación libre de texto, sino la producción de decisiones estructuradas, presumiblemente con un formato de salida específico gestionado por el endpoint `/v1/systemone`.

El proceso de conversión a GGUF se ha realizado automáticamente mediante la herramienta `ggml-org/convert`, sin que se documenten detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas como atención lineal o decodificación especulativa. Toda esta información figura como no disponible.

## Capacidades

- Toma de decisiones multimodal: procesa entradas de texto e imagen para emitir decisiones, según el pipeline `image-text-to-text` y la etiqueta `decision-model`.
- Integración con API dedicada: se invoca mediante el endpoint `/v1/systemone` de llama.cpp, no a través del endpoint de chat estándar.
- Conversación: la etiqueta `conversational` sugiere soporte para interacción conversacional, aunque el uso previsto es la decisión.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de endpoints de Hugging Face o compatibles.
- Despliegue local: al estar en formato GGUF, permite inferencia en CPU y GPU con llama.cpp.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión adicional o audio: no disponible (solo se confirma visión por el pipeline image-text-to-text).

## Casos de uso

- Clasificación y enrutamiento automático de tickets: el modelo puede recibir texto e imágenes adjuntas a una incidencia y emitir una decisión de categoría o prioridad, aprovechando su naturaleza de decision-model para integrarse en un sistema de triaje.
- Moderación de contenido multimodal: análisis de publicaciones con texto e imagen para decidir si cumplen las políticas, desplegado localmente con llama.cpp para evitar enviar datos sensibles a terceros.
- Verificación documental: dado un documento escaneado (imagen) y una consulta (texto), el modelo decide si la información es válida o requiere revisión humana, útil en procesos de onboarding o KYC.
- Automatización de control de calidad visual: en líneas de producción, recibir una foto de un producto y un criterio textual para decidir si pasa el control, con inferencia en el edge gracias al formato GGUF.
- Asistentes de decisión en atención al cliente: el modelo evalúa la consulta del usuario junto con capturas de pantalla y decide la acción a tomar (reembolso, escalado, respuesta automática), integrándose en el flujo mediante el endpoint `/v1/systemone`.
- Sistemas de recomendación binaria o multiclase: dado un par imagen-texto, decidir la acción recomendada (mostrar, ocultar, etiquetar), con la ventaja de la licencia Apache 2.0 para uso comercial sin fricción.
- Investigación en modelos de decisión: servir como referencia reproducible en formato GGUF para experimentar con arquitecturas de decisión multimodales en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~27B parámetros, en FP16 se requieren aproximadamente 54 GB; en cuantizaciones de 8 bits, unos 27 GB; en 4 bits, alrededor de 14-16 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 80GB o H100 para FP16 sin cuantizar; A100 40GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) para cuantizaciones de 8 bits ajustadas o 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits en tarjetas con 16-24 GB (RTX 4080, RTX 4090, RTX 3090). En 8 bits requiere al menos 32 GB, por lo que no cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: llama.cpp (requiere el PR #29831), `llama serve -hf ggml-org/Clef-GGUF`, y la app Llama (https://llama.app). No se confirma soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (decision-models multimodales de ~27B) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Requiere una versión específica de llama.cpp (PR #29831); no funciona con builds estándar ni con otras herramientas de inferencia sin adaptación.
- El uso previsto es mediante el endpoint `/v1/systemone`; emplearlo como modelo de chat convencional puede producir resultados no deseados.
- No se documentan sesgos conocidos, pero al ser un modelo de decisión, sus salidas pueden amplificar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación no cuantificado: no hay datos sobre tasas de error en tareas de decisión.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento adecuado fuera del inglés u otros idiomas no confirmados.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `Cloudflare/clef` por si hubiera condiciones adicionales no reflejadas en esta conversión.
- El repositorio ocupa 411,5 GB, lo que implica un coste de almacenamiento considerable si se descargan todas las cuantizaciones.
- No se especifican la longitud de contexto ni los tipos exactos de cuantización disponibles, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ggml-org/Clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Herramienta de conversión: https://github.com/ggml-org/convert
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/29831
- App Llama: https://llama.app
