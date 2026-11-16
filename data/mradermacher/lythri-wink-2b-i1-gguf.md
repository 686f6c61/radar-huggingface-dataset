# mradermacher/Lythri-Wink-2B-i1-GGUF

## Resumen

Lythri-Wink-2B-i1-GGUF es una cuantización en formato GGUF del modelo Lythri-Wink-2B, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones de terceros para inferencia local. El modelo base está desarrollado por Lythri y está orientado a conversación afectiva y acompañamiento emocional (emotional support, companion), con despliegue en dispositivo (on-device) como objetivo declarado. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

La información disponible es escasa: la model card del repositorio de cuantización no describe la arquitectura, el entrenamiento ni los datos del modelo base, y se limita a listar los tipos de cuantización generados y a remitir al repositorio estático para los ficheros finales. El dato de parámetros en safetensors (983.473) es inconsistente con la denominación "2B" del modelo y probablemente corresponde a un recuento parcial o a un tensor concreto, no al total real del modelo.

La relevancia de esta ficha es acotada: se trata de una cuantización recién publicada (16 de noviembre de 2026), sin descargas ni valoraciones, y de la que no se han publicado benchmarks. Resulta útil para quien quiera ejecutar localmente un modelo conversacional de pequeño tamaño con licencia permisiva, pero no hay evidencia pública que respalde su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar) |
| Parametros totales | no disponible (el nombre indica 2B; el recuento en safetensors del repo es 983.473, inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (imatrix/weighted) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el repo incluye además un fichero imatrix de 0,1 GB para generar cuantizaciones propias |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Lythri-Wink-2B en la documentación proporcionada. La model card del repositorio de cuantización no detalla si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El único dato técnico relevante es que las cuantizaciones se han generado con matrices de importancia (imatrix/weighted), un procedimiento que calibra la cuantización por capas para reducir la pérdida de perplejidad en comparación con las cuantizaciones estáticas, especialmente en bits bajos (Q2, IQ2, IQ3).

La model card menciona que el modelo base es de visión ("This is a vision model"), aunque no se aporta ningún detalle sobre el encoder visual ni sobre los datos multimodales. Los ficheros mmproj necesarios para la parte visual, si existen, se encuentran en el repositorio estático (mradermacher/Lythri-Wink-2B-GGUF), no en este.

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada a acompañamiento emocional y conversación de tipo companion.
- Soporte multimodal declarado por el autor de la cuantización (modelo de visión), aunque sin especificación de tareas ni de resolución de imagen.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Prototipado de asistentes conversacionales de acompañamiento: el modelo puede integrarse en una aplicación de chat multi-turno en local para validar flujos de conversación empática antes de invertir en un modelo mayor, gracias a su tamaño reducido y a la licencia Apache 2.0.
- Inferencia en dispositivo con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en equipos con poca memoria, lo que facilita pruebas en portátiles o mini-PC sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: el repositorio incluye un fichero imatrix y decenas de variantes, lo que permite medir la degradación de perplejidad entre Q2 y Q6_K para decidir el compromiso tamaño/calidad en un despliegue concreto.
- Base para fine-tuning ligero: al ser un modelo de 2B con licencia permisiva, puede servir como punto de partida para ajuste supervisado en dominios conversacionales específicos, aunque no hay documentación sobre su robustez tras el ajuste.
- Aplicaciones de investigación sobre emoción en diálogo: útil para estudiar el comportamiento de modelos pequeños en tareas de soporte emocional en inglés, siempre que se validen los sesgos y la tendencia a la adulación.
- Despliegue de bajo coste en entornos educativos o demos: con llama.cpp u Ollama se puede servir el modelo en un servidor modesto para demostraciones de conversación, sin coste de API y con control total sobre los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 2B, las cuantizaciones Q4_K_M suelen ocupar en torno a 1,2-1,5 GB y las Q8 en torno a 2-2,5 GB; estas cifras son estimaciones generales por tamaño, no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la información. Por tamaño, un modelo de 2B cuantizado cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso en iGPU con memoria compartida.
- Cabe en GPU de consumo: previsiblemente sí, en la mayoría de GPUs con 4 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui). El repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información técnica del modelo base es prácticamente inexistente: no se documentan arquitectura, contexto, datos de entrenamiento ni alineación, lo que impide evaluar su calidad de forma objetiva.
- El recuento de parámetros en safetensors (983.473) no concuerda con la denominación "2B"; conviene verificar el tamaño real antes de planificar el despliegue.
- El modelo está orientado a soporte emocional; en aplicaciones reales existe riesgo de respuestas aduladoras, consejo inadecuado o manejo deficiente de crisis, y no debe usarse como sustituto de atención profesional.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base y a esta cuantización; conviene revisar los términos del repositorio original por si hubiera condiciones adicionales no reflejadas aquí.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no hay evidencia de la comunidad sobre su funcionamiento.
- La parte visual, si existe, requiere ficheros mmproj alojados en el repositorio estático; este repositorio no los incluye.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Lythri-Wink-2B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Lythri-Wink-2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lythri-Wink-2B-i1-GGUF
- DOI asociado en los tags: https://doi.org/10.5281/zenodo.23179311
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
