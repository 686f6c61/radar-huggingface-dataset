# mradermacher/Lythri-7B-A4B-i1-GGUF

## Resumen

Lythri-7B-A4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-7B-A4B, publicada por el usuario mradermacher. El modelo original, desarrollado por Lythri, es un modelo de lenguaje de aproximadamente 7.460 millones de parámetros orientado a conversación, apoyo emocional y uso como compañero conversacional, con un enfoque explícito en despliegue on-device. La cuantización la realiza mradermacher, un actor conocido en el ecosistema por producir versiones GGUF de alta calidad, en este caso con cuantizaciones ponderadas mediante imatrix.

El paquete incluye un amplio abanico de niveles de cuantización, desde IQ1_S (3,4 GB) hasta Q6_K (6,3 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas GPUs de consumo e incluso configuraciones con poca VRAM. El repositorio pesa 111 GB en total porque agrupa todas las variantes, pero cada archivo individual es manejable. La licencia Apache 2.0 facilita el uso comercial y la integración en productos.

La relevancia de esta ficha radica en que el modelo base está pensado para aplicaciones de acompañamiento conversacional y soporte emocional en inglés, un nicho donde el despliegue local y la privacidad importan. La disponibilidad de cuantizaciones ligeras hace viable su uso en dispositivos de borde, aunque la información pública sobre arquitectura, entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, segun tags de transformers) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (el sufijo A4B sugiere posible MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lythri-7B-A4B en la documentación proporcionada. Los metadatos indican que se carga mediante la librería transformers y que el sufijo "A4B" podría sugerir una arquitectura con parámetros activos (posiblemente Mixture of Experts), pero este dato no está confirmado en la información disponible. El recuento real de parámetros en safetensors es de 7.463.013.674, lo que sitúa al modelo en la franja de los 7B.

Tampoco se detallan los datos de entrenamiento: número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. Los tags del modelo (emotional-support, companion, on-device, conversational, emotion) apuntan a un ajuste orientado a conversación empática, pero no se especifica la metodología. La cuantización realizada por mradermacher emplea el método i1 con matrices de importancia (imatrix), que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas; el repositorio incluye también el archivo imatrix para quien quiera generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés, con orientación a diálogo multi-turno.
- Soporte emocional y acompañamiento conversacional, según los tags del modelo (emotional-support, companion, emotion).
- Despliegue on-device: las cuantizaciones ligeras permiten ejecución local en hardware limitado.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integración con APIs compatibles con OpenAI.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Aplicación de acompañamiento emocional local: el modelo puede gestionar conversaciones de apoyo en inglés ejecutándose íntegramente en el dispositivo del usuario, lo que preserva la privacidad de conversaciones sensibles. Las cuantizaciones Q4_K_M (5,4 GB) o IQ4_XS (5,1 GB) ofrecen un buen equilibrio calidad/tamaño.
- Chatbot de bienestar en dispositivos de borde: con cuantizaciones IQ2 o Q3 (3,6-4,9 GB) puede desplegarse en mini-PC o portátiles sin GPU dedicada, ofreciendo respuestas conversacionales básicas sin conexión.
- Prototipado rápido de productos conversacionales: la licencia Apache 2.0 y el formato GGUF permiten iterar con llama.cpp u Ollama sin costes de licencia ni dependencia de la nube.
- Integración en asistentes personales de escritorio: el modelo puede actuar como motor de diálogo en aplicaciones de escritorio que requieran conversación empática, usando el endpoint compatible para conectar con interfaces existentes.
- Investigación sobre modelos pequeños de conversación: sirve como base para estudiar el comportamiento de modelos de 7B ajustados a dominios emocionales y evaluar el impacto de distintas cuantizaciones en la calidad del diálogo.
- Despliegue en entornos con restricciones de red: al ser un modelo local, es adecuado para escenarios air-gapped donde no se permite enviar datos a servicios externos, como clínicas o entornos corporativos con políticas estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más overhead. IQ1_S ~3,4 GB; IQ2_M ~3,9 GB; IQ3_M ~4,8 GB; IQ4_XS ~5,1 GB; Q4_K_M ~5,4 GB; Q5_K_M ~5,8 GB; Q6_K ~6,3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 no necesarias pero válidas para servir múltiples instancias.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones IQ2/IQ3, y con holgura en GPUs de 8-12 GB con Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere también servidores compatibles con API OpenAI.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-7B-A4B-i1-GGUF | 7,46B | no disponible | Apache 2.0 | GGUF (multi-cuant) | Enfoque en soporte emocional y on-device |
| Lythri-7B-A4B (base) | 7,46B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de 7B conversacionales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan evaluaciones de sesgo; un modelo de acompañamiento emocional puede reflejar sesgos de sus datos de entrenamiento en temas sensibles.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en contextos de apoyo emocional, las respuestas incorrectas pueden tener impacto en el usuario.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificación de conversaciones largas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Lythri-7B-A4B, ya que esta ficha cubre la cuantización.
- Producción: las cuantizaciones IQ1/IQ2 degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Naturaleza del dominio: no debe presentarse como sustituto de atención psicológica profesional; es una herramienta conversacional, no un dispositivo médico.
- Arquitectura incierta: la falta de documentación sobre el modelo base impide garantizar comportamientos específicos (tool calling, agentes, etc.).

## Enlaces

- Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Lythri-7B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-7B-A4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Lythri-7B-A4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lythri-7B-A4B-i1-GGUF
- DOI del modelo: https://doi.org/10.5281/zenodo.23179311
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
