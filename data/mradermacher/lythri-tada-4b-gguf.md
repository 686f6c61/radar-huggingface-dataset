# mradermacher/Lythri-Tada-4B-GGUF

## Resumen

Lythri-Tada-4B-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-Tada-4B, desarrollado originalmente por Lythri y convertido por mradermacher, un conocido publicador de cuantizaciones para el ecosistema llama.cpp. El modelo está etiquetado por su autor como orientado a soporte emocional, acompañamiento conversacional y emoción, con un enfoque declarado de ejecución en dispositivo (on-device) y licencia Apache 2.0.

El modelo base cuenta con 4.628.569.635 parámetros reales según los tensores safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4.600 millones de parámetros. El repositorio GGUF ocupa 47,9 GB e incluye doce variantes de cuantización que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB), lo que permite desplegarlo en hardware muy diverso, desde portátiles con poca VRAM hasta estaciones de trabajo.

Su relevancia actual radica en la combinación de un tamaño moderado, licencia permisiva y disponibilidad de cuantizaciones listas para usar en entornos locales, lo que lo hace atractivo para prototipos de asistentes conversacionales con matiz emocional sin depender de infraestructura en la nube. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que la evaluación debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido del pipeline transformers y del tamaño) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lythri-Tada-4B en la documentación proporcionada. Los metadatos indican que se trata de un modelo compatible con la librería transformers y que el proceso de cuantización se realizó con `convert_type: hf` y `quantize_version: 2`, lo que sugiere una arquitectura transformer estándar densa. El número de parámetros (4.628.569.635) es coherente con un modelo de aproximadamente 4.600 millones de parámetros, probablemente con una capa de embeddings de vocabulario considerable.

Tampoco se han publicado detalles sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Las etiquetas del modelo (emotional-support, companion, emotion, conversational) apuntan a un ajuste orientado a conversación empática, pero no hay información verificable sobre el proceso. La cuantización realizada por mradermacher es de tipo estático, con variantes estándar K-quants e IQ-quants; el autor indica que dispone de cuantizaciones con imatrix en un repositorio separado (Lythri-Tada-4B-i1-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada a soporte emocional y acompañamiento.
- Conversación multi-turno con matiz empático, según las etiquetas del autor (emotional-support, companion).
- Ejecución en dispositivo (on-device) gracias a las cuantizaciones de bajo tamaño (desde 3,1 GB en Q2_K).
- Compatibilidad con el ecosistema llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) al distribuirse en GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede gestionar conversaciones de apoyo en inglés ejecutándose íntegramente en el dispositivo del usuario, lo que preserva la privacidad de las conversaciones sensibles al no enviar datos a servidores externos.
- Prototipado de chatbots empáticos: gracias a su licencia Apache 2.0 y a las cuantizaciones Q4_K_M (3,5 GB), permite iterar rápidamente en el diseño de flujos conversacionales sin costes de infraestructura.
- Aplicaciones de bienestar en móvil o portátil: las variantes Q2_K y Q3_K_S (3,1-3,2 GB) caben en equipos con 8 GB de RAM, lo que habilita asistentes de diario emocional o reflexión guiada sin conexión.
- Investigación en interacción humano-máquina afectiva: sirve como línea base ligera para estudiar respuestas empáticas y comparar con modelos mayores en experimentos controlados.
- Despliegue en entornos con requisitos de soberanía de datos: sectores como salud mental o educación pueden alojar el modelo en servidores propios sin depender de APIs externas, dado el tamaño manejable y la licencia permisiva.
- Generación de respuestas de acompañamiento en plataformas de mensajería: integrable mediante llama.cpp u Ollama en backends ligeros para responder en inglés con latencia baja en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con Q4_K_M (3,5 GB de pesos más overhead de contexto); alrededor de 5,5-6 GB con Q8_0 (5,0 GB); en torno a 10-11 GB con f16 (9,4 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las variantes de mayor calidad; A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o inferiores; las variantes Q2_K y Q3_K_S pueden ejecutarse incluso con 4 GB de VRAM o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone del repositorio original.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Tada-4B-GGUF | 4.628.569.635 | no disponible | Apache 2.0 | GGUF | Enfoque en soporte emocional; solo inglés |
| Modelos densos de ~4B tipo Qwen o Llama (referencia genérica) | ~4B | variable según versión | variable | safetensors, GGUF | Ecosistema más amplio y benchmarks públicos; no disponible comparación directa de rendimiento |
| Alternativas de acompañamiento emocional de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable para una comparación rigurosa |

No se dispone de datos de benchmarks ni de modelos comparables directamente evaluados en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La información pública sobre arquitectura, contexto y entrenamiento es muy escasa; no debe asumirse un rendimiento equiparable al de modelos con documentación completa.
- El modelo está orientado únicamente al inglés según los metadatos; su uso en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas factuales o de razonamiento complejo.
- Un modelo etiquetado como soporte emocional no sustituye atención psicológica profesional; su uso en contextos de salud mental requiere supervisión y salvaguardas explícitas.
- Sesgos conocidos: no disponibles en la información proporcionada, pero cabe esperar sesgos del corpus de entrenamiento no documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y condiciones del modelo base original (Lythri/Lythri-Tada-4B) antes de desplegarlo en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para un equilibrio rapidez/calidad.
- No se han publicado evaluaciones de seguridad, filtros de contenido ni comportamiento en dominios sensibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-Tada-4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Lythri-Tada-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lythri-Tada-4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- DOI asociado: https://doi.org/10.5281/zenodo.23179311
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
