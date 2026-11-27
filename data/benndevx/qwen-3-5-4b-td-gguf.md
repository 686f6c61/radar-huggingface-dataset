# benndevx/qwen-3.5-4b-td-gguf

## Resumen

Qwen 3.5 4B Typed Decisions es un ajuste fino del modelo base `unsloth/Qwen3.5-4B` orientado a la toma de decisiones tipadas y a la clasificación de texto. Lo publica el usuario benndevx en Hugging Face y se distribuye exclusivamente en formato GGUF cuantizado a 4 bits (`q4_k_m`), compilado localmente con Unsloth y llama.cpp. El objetivo declarado es ofrecer un modelo de decisión ligero que quepa en dispositivos móviles y hardware de consumo, con una huella de memoria muy reducida.

El modelo conserva la arquitectura del Qwen3.5-4B original, con 4.237.797.892 parámetros totales, y añade un componente de proyección visual (`mmproj-Q8_0.gguf`) que sugiere capacidades multimodales heredadas del modelo base. El repositorio ocupa 11,9 GB, aunque el artefacto principal de inferencia pesa solo 2,74 GB en su cuantización Q4_K_M.

Su relevancia actual radica en la combinación de tamaño reducido, soporte GGUF nativo y una licencia LGPL-3.0, lo que facilita el despliegue en entornos de borde, aplicaciones móviles iOS/Android y pipelines de clasificación donde no es viable ejecutar modelos de mayor escala. No obstante, la información pública disponible es muy escasa y no se han publicado resultados de benchmarks ni detalles del proceso de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), con proyector visual multimodal |
| Parametros totales | 4.237.797.892 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (modelo principal), GGUF Q8_0 (proyector visual) |
| Idiomas soportados | en |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B`, un transformer denso de aproximadamente 4.240 millones de parámetros. El ajuste fino se realizó con Unsloth, una librería optimizada para fine-tuning eficiente en memoria, y la conversión a GGUF se hizo con llama.cpp. El repositorio incluye dos artefactos: el modelo de lenguaje principal cuantizado a 4 bits (`model-Q4_K_M.gguf`, 2,74 GB) y un proyector visual cuantizado a 8 bits (`mmproj-Q8_0.gguf`, 0,34 GB), lo que indica que el pipeline soporta entrada de imágenes además de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste. La model card no documenta el procedimiento de alineación ni las métricas de evaluación del fine-tuning. Tampoco se detalla si el proyector visual fue entrenado en este ajuste o heredado del modelo base.

## Capacidades

- Clasificación de texto y toma de decisiones tipadas, según la etiqueta `decision-model` y el pipeline `text-classification`.
- Generación de texto conversacional (etiqueta `conversational`).
- Procesamiento multimodal: la presencia del proyector `mmproj-Q8_0.gguf` sugiere soporte de entrada visual, aunque no se documenta su alcance.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de tickets de soporte en aplicaciones móviles: el modelo, con 2,74 GB en Q4_K_M y una huella estimada de 3,24 GB de RAM, puede ejecutarse en un dispositivo iOS/Android mediante llama.cpp y clasificar incidencias por categoría o prioridad sin conexión a la nube.
- Enrutamiento de decisiones en asistentes de voz embebidos: la etiqueta `decision-model` sugiere su uso para decidir la siguiente acción en un flujo conversacional, aprovechando su reducido consumo de memoria en hardware de consumo.
- Moderación de contenido en el borde: clasificación de texto en tiempo real directamente en el dispositivo, evitando enviar datos sensibles a servidores externos.
- Análisis de documentos con componente visual: el proyector `mmproj-Q8_0.gguf` permite procesar imágenes junto a texto, útil para clasificar capturas, formularios o documentos escaneados en local.
- Prototipado rápido de pipelines de clasificación: al ser compatible con endpoints y con runtimes GGUF estándar, se puede integrar en servicios HTTP ligeros para validar flujos antes de escalar a modelos mayores.
- Aplicaciones de escritorio offline: despliegue con llama.cpp u Ollama en portátiles sin GPU dedicada, dado que el modelo cabe en RAM convencional.
- Filtrado previo en pipelines de datos: uso como clasificador de primera etapa para descartar o etiquetar grandes volúmenes de texto antes de pasarlos a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 3,24 GB para el modelo principal (2,74 GB + 0,5 GB de overhead de contexto) y 0,84 GB adicionales para el proyector visual (0,34 GB + 0,5 GB).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM es suficiente (por ejemplo, RTX 3050, RTX 4060, GTX 1660).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también en CPU.
- Opciones de despliegue: llama.cpp (CLI documentado con `llama-cli`), MLC LLM, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| benndevx/qwen-3.5-4b-td-gguf | 4,24 B | no disponible | GGUF Q4_K_M | LGPL-3.0 | Ajuste para decisiones y clasificación, con proyector visual |
| unsloth/Qwen3.5-4B (base) | ~4,24 B | no disponible | safetensors | no disponible | Modelo base sin ajuste específico |
| Alternativas de 4B para clasificación | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo base sin información de alineación publicada, es probable que herede sesgos del corpus original.
- Alucinación: no hay evaluación publicada sobre la tasa de alucinación; en tareas de clasificación y decisión, la salida puede ser incorrecta sin señales de confianza calibradas.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar su uso en documentos largos.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar el cumplimiento en productos distribuidos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- El ajuste fino y la cuantización los realiza un autor individual sin documentación del dataset ni de las métricas, lo que limita la confianza para entornos críticos.
- La fecha de creación (2026-11-27) y la referencia a Qwen3.5 sugieren un modelo muy reciente; verificar la disponibilidad y estabilidad del ecosistema antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/benndevx/qwen-3.5-4b-td-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- MLC LLM: https://github.com/mlc-ai/mlc-llm
