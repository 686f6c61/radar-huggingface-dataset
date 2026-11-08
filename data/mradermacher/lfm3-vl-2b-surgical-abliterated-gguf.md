# mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF

## Resumen

LFM3-VL-2B-Surgical-Abliterated-GGUF es una versión cuantizada en formato GGUF del modelo medismera/LFM3-VL-2B-Surgical-Abliterated, un derivado del modelo multimodal LiquidAI/LFM3-VL-2B. El trabajo de cuantización lo firma mradermacher, un colaborador habitual de la comunidad de Hugging Face especializado en generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia LFM3-VL de Liquid AI, orientada a tareas de visión y lenguaje con un tamaño compacto de aproximadamente 1.700 millones de parámetros.

La particularidad de esta variante es que se trata de un modelo "abliterated" con "surgical alignment", es decir, se ha modificado el alineamiento original para reducir los mecanismos de rechazo y censura del modelo base, manteniendo supuestamente parte de la estructura de seguridad de forma selectiva. Esto lo orienta a usos de investigación sobre alineamiento, evaluación de sesgos y experimentación con modelos sin restricciones conversacionales, más que a despliegues de producción convencionales.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo multimodal pequeño (visión-lenguaje), una intervención de alineamiento agresiva y un conjunto amplio de cuantizaciones GGUF (desde Q2_K hasta f16, además de los proyectores multimodales mmproj). Todo ello con licencia "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B de Liquid AI, multimodal visión-lenguaje; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | 1.728.801.600 (datos de safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (hereda la del modelo base medismera/LFM3-VL-2B-Surgical-Abliterated) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 16,5 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base pertenece a la familia LFM3-VL de Liquid AI, que combina procesamiento de lenguaje y visión, con 1.728.801.600 parámetros totales según los tensores en safetensors. Al tratarse de una variante "abliterated" con "surgical alignment", se infiere que se ha aplicado una intervención sobre los pesos o activaciones del modelo original para eliminar direcciones de rechazo, aunque los detalles técnicos concretos de dicha intervención no están documentados en la información disponible.

El proceso de cuantización lo ha realizado mradermacher mediante conversión a formato GGUF y generación de cuantizaciones estáticas (no se han publicado, según la propia model card, cuantizaciones ponderadas o con imatrix en el momento de la publicación). Se incluyen también los proyectores multimodales (mmproj) en Q8_0 y f16, necesarios para el procesamiento de imágenes con llama.cpp. No constan datos sobre el corpus de entrenamiento, número de tokens, ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de formato de chat (tag "conversational").
- Procesamiento multimodal de imágenes gracias a los ficheros mmproj incluidos (Q8_0 y f16), lo que permite entrada de visión junto con texto.
- Modelo "uncensored" / "abliterated": reduce los rechazos ante peticiones que el modelo base podría declinar, orientado a investigación sobre alineamiento.
- "Surgical alignment": la intervención pretende ser selectiva, preservando parte de las capacidades originales mientras se eliminan comportamientos de rechazo.
- Compatible con endpoints (tag "endpoints_compatible") y con el ecosistema transformers y llama.cpp.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo varía el comportamiento al eliminar direcciones de rechazo, comparando respuestas frente al modelo base original en tareas controladas de evaluación.
- Análisis de sesgos y robustez: al ser una variante abliterated, resulta útil para medir qué tipo de contenido se desbloquea y cuantificar el impacto de la intervención sobre la calidad general de las respuestas.
- Prototipado local de asistentes multimodales: con cuantizaciones Q4_K_M de 1,2 GB más el mmproj, se puede desplegar en equipos de consumo para experimentar con descripción de imágenes y diálogo en inglés.
- Evaluación de cuantizaciones: la disponibilidad de 14 variantes permite estudiar la degradación de calidad entre Q2_K y f16 en un modelo multimodal pequeño, útil para calibrar pipelines de cuantización.
- Generación de descripciones de imágenes en entornos offline: el modelo, ejecutado con llama.cpp, puede procesar imágenes localmente sin conexión en escenarios de etiquetado o accesibilidad.
- Docencia y formación técnica: sirve como ejemplo práctico de flujo completo (modelo base, intervención de alineamiento, cuantización GGUF y despliegue con llama.cpp) en cursos de IA open source.
- Experimentación con modelos sin restricciones en entornos aislados: útil para pruebas de red teaming controladas sobre las salvaguardas de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K (0,9 GB), 1,2 GB para Q4_K_M, 1,5 GB para Q6_K y 1,9 GB para Q8_0, a los que hay que sumar el mmproj (0,3 GB en Q8_0 o 0,5 GB en f16) si se usa la entrada de visión.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4/Q5 con margen; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para un modelo de este tamaño el hardware de gama alta está sobredimensionado.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones (Q2_K a Q8_0) en tarjetas con 4 GB o más; incluso f16 (3,6 GB) cabe en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con endpoints GGUF; también puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF | 1.728.801.600 | no disponible | Sí (mmproj) | other | GGUF en HF |
| medismera/LFM3-VL-2B-Surgical-Abliterated (base) | 1.728.801.600 | no disponible | Sí | other | safetensors en HF |
| LiquidAI/LFM3-VL-2B (original) | no disponible en la información | no disponible | Sí | no disponible en la información | HF |
| efeisot/lfm3-omni-vl-2b-1rco-2mix-gguf | no disponible | no disponible | Sí | no disponible | GGUF en HF |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Al ser una variante "abliterated" y "uncensored", puede generar contenido que el modelo original rechazaría; no es apto para despliegues orientados al público sin filtros adicionales.
- La intervención de alineamiento puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo base original; no hay benchmarks publicados que lo cuantifiquen.
- Riesgo de alucinación inherente a modelos pequeños de ~1,7B parámetros, potencialmente agravado por la cuantización agresiva (Q2_K, Q3_K).
- La licencia "other" obliga a revisar los términos del modelo base (medismera/LFM3-VL-2B-Surgical-Abliterated) y del original (LiquidAI/LFM3-VL-2B) antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- No se han publicado cuantizaciones ponderadas o con imatrix para este modelo, lo que puede afectar a la calidad de las cuantizaciones bajas frente a alternativas mejor calibradas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del comportamiento real del modelo.
- La fecha de creación indicada (2026-11-08) resulta anómala y conviene verificarla antes de citar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/LFM3-VL-2B-Surgical-Abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-VL-2B-Surgical-Abliterated-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Variante GGUF alternativa: https://huggingface.co/efeisot/lfm3-omni-vl-2b-1rco-2mix-gguf
