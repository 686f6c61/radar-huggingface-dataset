# mradermacher/Lythri-4B-A2B-i1-GGUF

## Resumen

Lythri-4B-A2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-4B-A2B, publicada por el usuario mradermacher. El modelo original lo desarrolla Lythri y está orientado a soporte emocional, conversación de acompañamiento y despliegue en dispositivo (on-device). Esta publicación concreta no es un modelo nuevo, sino un conjunto de cuantizaciones con imatrix generadas a partir de los pesos originales, pensadas para ejecución local con llama.cpp y derivados.

El modelo base declara 4.628.569.635 parámetros totales según los datos de safetensors, lo que sitúa la familia en el rango de 4B. La model card del cuantizador menciona además un identificador "A2B" y lo describe como modelo de visión, lo que sugiere una arquitectura con componentes de atención y posiblemente proyección multimodal, aunque no se detallan los detalles arquitectónicos. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 2,4 GB hasta Q6_K de 3,9 GB), lo que permite ejecutar un modelo de 4B con capacidades conversacionales y de acompañamiento en hardware de consumo, incluidas GPUs con poca VRAM o incluso CPU. El repositorio ocupa 73,3 GB en total por acumular todas las variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; la model card del cuantizador lo describe como modelo de visión) |
| Parámetros totales | 4.628.569.635 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lythri-4B-A2B en la documentación proporcionada. El recuento de parámetros (4.628.569.635) corresponde a los safetensors del modelo original, y la nomenclatura "A2B" junto con la mención de que se trata de un modelo de visión en la model card del cuantizador apunta a una arquitectura con módulo de proyección multimodal (mmproj), aunque no se confirma su estructura exacta ni si emplea mezcla de expertos.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card del cuantizador se limita a indicar que las cuantizaciones son de tipo "weighted/imatrix" y que se han generado con la herramienta de mradermacher a partir de los pesos originales, con un formato de conversión "hf" y cuantización de tensores de salida activada.

## Capacidades

- Generación de texto conversacional orientada a soporte emocional y acompañamiento.
- Conversación multi-turno con etiquetas declaradas de "emotional-support" y "companion".
- Capacidad multimodal de visión según la model card del cuantizador (los ficheros mmproj, si existen, se alojan en el repositorio estático de cuantizaciones).
- Despliegue on-device gracias a las cuantizaciones GGUF de bajo peso.
- Compatibilidad con endpoints según la etiqueta "endpoints_compatible".
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades matemáticas o de código: no disponible en la información proporcionada.
- Multilingüismo: limitado al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede mantener conversaciones de apoyo en inglés sobre hardware de consumo usando la cuantización Q4_K_M (3,5 GB), adecuada para aplicaciones de bienestar que requieren privacidad y no dependen de la nube.
- Chatbot de escritorio integrado en aplicaciones de diario personal: con cuantizaciones IQ3_M o Q4_K_S (3,2-3,5 GB) se puede empaquetar dentro de una app de escritorio que funcione sin conexión y procese entradas de texto del usuario.
- Prototipado rápido de interfaces conversacionales: las variantes IQ2 permiten probar flujos de diálogo en portátiles con 8 GB de RAM o GPUs integradas antes de escalar a un modelo mayor.
- Investigación sobre sesgos y seguridad en modelos de acompañamiento: al ser Apache 2.0 y ejecutable en local, facilita auditorías reproducibles de respuestas en dominios sensibles sin enviar datos a terceros.
- Evaluación de cuantizaciones: el repositorio incluye un fichero imatrix y una escala completa de cuantizaciones, lo que permite comparar la degradación de calidad entre IQ1_S y Q6_K en tareas conversacionales.
- Despliegue en dispositivos edge con llama.cpp: la variante Q4_K_M (3,5 GB) es la recomendada por el autor por su equilibrio entre velocidad y calidad, y encaja en mini-PCs o Raspberry Pi con suficiente RAM.
- Integración en pipelines de generación aumentada por recuperación (RAG) para documentación de bienestar: el modelo puede resumir y reformular fragmentos recuperados en tono empático, aunque el contexto máximo no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto y el overhead de llama.cpp. Las cuantizaciones oscilan entre 2,4 GB (IQ1_S) y 3,9 GB (Q6_K).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las variantes Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar la variante Q6_K con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; las variantes IQ2 e IQ3 pueden ejecutarse en GPUs de 4 GB e incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el autor remite a las guías de TheBloke para el uso de ficheros GGUF multiparte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-4B-A2B-i1-GGUF | 4,63B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, orientado a soporte emocional y on-device |
| Lythri-4B-A2B (original) | 4,63B | no disponible | Apache 2.0 | safetensors | Pesos completos del modelo base |
| Lythri-4B-A2B-GGUF (estático) | 4,63B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo, sin imatrix |

No se dispone de información sobre modelos alternativos de la misma categoría (soporte emocional de ~4B) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Al tratarse de un modelo de soporte emocional, existe riesgo de respuestas inapropiadas en situaciones de crisis; no debe usarse como sustituto de atención psicológica profesional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad, según advierte el propio autor en la tabla de cuantizaciones.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones largas, lo que dificulta planificar despliegues con ventanas extensas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentación sobre el dataset de entrenamiento impide evaluar posibles sesgos o problemas de procedencia de datos.
- La mención a capacidades de visión no está confirmada en el repositorio de cuantizaciones imatrix; los ficheros mmproj, si existen, se alojan en el repositorio estático, por lo que el soporte multimodal de esta publicación concreta no está garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lythri-4B-A2B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-4B-A2B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Lythri-4B-A2B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lythri-4B-A2B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- DOI del modelo: https://doi.org/10.5281/zenodo.23179311
