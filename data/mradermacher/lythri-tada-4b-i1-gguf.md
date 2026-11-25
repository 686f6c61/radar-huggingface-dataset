# mradermacher/Lythri-Tada-4B-i1-GGUF

## Resumen

Lythri-Tada-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-Tada-4B, publicada por el usuario mradermacher. El modelo original, desarrollado por Lythri, es un modelo de 4.628.569.635 parámetros (aproximadamente 4,6 mil millones) orientado a soporte emocional, acompañamiento conversacional y uso en dispositivo (on-device). Esta versión concreta aplica cuantización dinámica con imatrix (i1) para reducir el peso del modelo y facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que las cuantizaciones i1 de mradermacher permiten ejecutar un modelo conversacional especializado en acompañamiento emocional en equipos sin GPU dedicada de gama alta, con ficheros que van desde 2,4 GB (IQ1_S) hasta 3,9 GB (Q6_K). El repositorio tiene 8.579 descargas y está etiquetado con licencia Apache 2.0, lo que facilita su integración en productos comerciales.

No obstante, la información pública disponible sobre el modelo base es muy limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento, los idiomas soportados (aunque la model card declara `en`) ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer conversacional, según tags de `transformers`) |
| Parámetros totales | 4.628.569.635 (≈4,6 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés), según la model card del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lythri-Tada-4B en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo de la librería `transformers`, con un total de 4.628.569.635 parámetros, y que está especializado en soporte emocional, acompañamiento y conversación. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con la infraestructura de endpoints de Hugging Face.

La versión aquí descrita es una cuantización i1 (imatrix) generada por mradermacher a partir de los pesos originales de Lythri/Lythri-Tada-4B. Las cuantizaciones i1 emplean un fichero imatrix (incluido en el repositorio, de 0,1 GB) para ponderar la importancia de los tensores durante la cuantización, lo que en la práctica permite conservar más calidad que las cuantizaciones estáticas equivalentes en tamaño. No se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas del modelo base. La model card menciona que se trata de un modelo de visión ("This is a vision model"), si bien los ficheros mmproj, si existen, se alojan en el repositorio estático separado.

## Capacidades

- Generación de texto conversacional orientada a soporte emocional y acompañamiento.
- Conversaciones multi-turno con tono empático y de apoyo, según la especialización declarada en los tags (`emotional-support`, `companion`, `conversational`, `emotion`).
- Capacidad de visión indicada en la model card del cuantizador (los ficheros mmproj estarían en el repositorio estático).
- Ejecución en dispositivo (on-device) gracias a las cuantizaciones de bajo peso (desde 2,4 GB).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`); no se confirman otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente de acompañamiento emocional en aplicaciones móviles: con cuantizaciones de 3,5 GB (Q4_K_M) el modelo puede ejecutarse localmente en un smartphone de gama alta o en un portátil sin GPU, ofreciendo conversaciones de apoyo sin enviar datos sensibles a la nube.
- Chatbot de bienestar en dispositivos de escritorio: desplegado con llama.cpp u Ollama, el modelo gestiona conversaciones multi-turno con un tono empático adecuado para aplicaciones de journaling o reflexión personal.
- Integración en asistentes de voz para el hogar: al ser un modelo de 4,6 B cuantizado a Q4, la latencia es baja y permite respuestas conversacionales en tiempo real en hardware embebido con suficiente RAM.
- Prototipado rápido de productos de salud mental digital: la licencia Apache 2.0 permite iterar y desplegar comercialmente sin restricciones de uso, algo relevante para startups que validan un MVP de acompañamiento conversacional.
- Investigación en interacción persona-máquina afectiva: investigadores pueden ejecutar el modelo en local con cuantizaciones IQ3/IQ4 para estudiar respuestas empáticas sin depender de APIs externas ni de conectividad.
- Aplicaciones de privacidad por diseño: al ejecutarse on-device, el modelo es adecuado para contextos donde la conversación contiene información personal sensible y no puede salir del dispositivo (por ejemplo, diarios personales o apoyo en momentos de crisis).
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2 (2,5-2,7 GB) permiten ejecutar el modelo en dispositivos con 4 GB de RAM, aunque con pérdida de calidad notable según las propias notas del cuantizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño del fichero GGUF):
  - i1-IQ1_S: 2,4 GB (calidad muy baja, "for the desperate" según el autor).
  - i1-IQ2_XXS a i1-IQ2_M: 2,5-2,7 GB.
  - i1-IQ3_XXS a i1-Q3_K_L: 2,7-3,4 GB.
  - i1-IQ4_XS a i1-Q4_1: 3,4-3,6 GB.
  - i1-Q5_K_S/M: 3,7 GB.
  - i1-Q6_K: 3,9 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede alojar las cuantizaciones Q4-Q6 con comodidad; una RTX 4090 o A100 no aporta ventajas significativas por capacidad, aunque sí por velocidad.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM para cuantizaciones Q4-Q6. Las cuantizaciones IQ1-IQ2 podrían ejecutarse incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repositorio incluye un fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (soporte emocional, 4-5 B parámetros, formato GGUF) en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Tada-4B-i1-GGUF | 4,6 B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en soporte emocional, on-device |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan contexto, dataset de entrenamiento, benchmarks ni detalles de arquitectura del modelo base, lo que dificulta una evaluación rigurosa antes de usarlo en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; en aplicaciones de soporte emocional, una alucinación o una respuesta inadecuada puede tener consecuencias sensibles para el usuario.
- Sesgos conocidos: no documentados en la información disponible; al no conocerse la composición del dataset, no es posible evaluar sesgos de género, culturales o lingüísticos.
- Limitación de idioma: solo se declara inglés (`en`); no hay evidencia de soporte de castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base Lythri/Lythri-Tada-4B mantiene la misma licencia y que no existen restricciones adicionales en su model card original.
- Calidad de las cuantizaciones bajas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality"; para producción se recomienda Q4_K_M o superior.
- Modelo de visión: la model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio, sino en el repositorio estático; un despliegue multimodal requeriría descargarlos por separado.
- Uso en salud mental: no se documenta ninguna validación clínica ni salvaguardas específicas; no debe presentarse como sustituto de atención profesional.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Lythri-Tada-4B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Lythri-Tada-4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lythri-Tada-4B-i1-GGUF
- DOI asociado (Zenodo): https://doi.org/10.5281/zenodo.23179311
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
