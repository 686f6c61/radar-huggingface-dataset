# mradermacher/DeskVision-Captioner-GGUF

## Resumen

DeskVision-Captioner es un modelo multimodal de tipo visión-lenguaje (VLM) orientado a la generación de descripciones (captioning) de imágenes, especialmente en el contexto de capturas de pantalla y contenido de escritorio. El modelo original fue desarrollado por DanHuang bajo el identificador `DanHuang/DeskVision-Captioner`, y la versión aquí documentada es una reedición cuantizada en formato GGUF publicada por mradermacher, un autor conocido por distribuir cuantizaciones de modelos open source para su uso en entornos con recursos limitados.

El modelo cuenta con aproximadamente 7.615 millones de parámetros (7,6 B) en pesos safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio, adecuado para despliegue en GPU de consumo. La distribución GGUF incluye un proyector multimodal (`mmproj`) separado, lo que confirma que se trata de un VLM con torre de visión acoplada a un modelo de lenguaje base. La licencia es MIT, lo que facilita su uso comercial y su integración en productos derivados.

Su relevancia actual radica en la combinación de un tamaño manejable, licencia permisiva y disponibilidad en múltiples cuantizaciones (desde Q2_K hasta f16), lo que permite desplegarlo desde estaciones de trabajo modestas hasta servidores. El modelo está orientado al idioma inglés y su caso de uso principal es la descripción automática de imágenes de escritorio, aunque su naturaleza multimodal permite aplicaciones más amplias de comprensión visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con proyector de visión; arquitectura base no especificada en la información disponible |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, además de mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un modelo multimodal con un proyector de visión separado (archivos `mmproj` en la distribución GGUF). El tamaño de 7,6 B parámetros sugiere un transformer denso de escala media, probablemente con una torre de visión acoplada mediante un adaptador o proyector, patrón habitual en VLMs como LLaVA o Qwen-VL. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La contribución de esta ficha concreta es la cuantización estática realizada por mradermacher, que convierte los pesos originales en safetensors a formato GGUF con distintos niveles de precisión. La model card indica que las cuantizaciones ponderadas/imatrix están disponibles en un repositorio separado (`DeskVision-Captioner-i1-GGUF`), lo que sugiere que se ofrecen dos familias de cuantización: estática (este repo) y con imatrix (el otro). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de descripciones de imágenes (image captioning), con especial orientación a capturas de pantalla y contenido de escritorio.
- Comprensión visual de imágenes en inglés: el modelo procesa la imagen mediante la torre de visión y genera texto descriptivo.
- Conversación multimodal: la etiqueta `conversational` indica soporte para interacción de tipo chat con entradas de imagen y texto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de capturas de pantalla: el modelo puede generar texto descriptivo de imágenes de escritorio, útil para sistemas de accesibilidad que convierten interfaces gráficas en descripciones para usuarios con discapacidad visual.
- Indexación y búsqueda de imágenes de escritorio: generar captions de capturas almacenadas permite construir índices semánticos que faciliten la búsqueda por contenido visual en repositorios de imágenes o documentación.
- Documentación técnica automatizada: a partir de capturas de pantalla de aplicaciones o interfaces, el modelo puede producir descripciones que se incorporen a manuales y guías de usuario.
- Moderación y clasificación de contenido visual: el captioning permite etiquetar imágenes automáticamente para pipelines de clasificación o filtrado, aunque requiere validación adicional por sus limitaciones.
- Asistencia en soporte técnico: descripción de capturas enviadas por usuarios para que un sistema de tickets genere resúmenes automáticos del problema mostrado en pantalla.
- Generación de metadatos para datasets de imágenes: el modelo puede anotar automáticamente grandes colecciones de capturas de escritorio, reduciendo el trabajo manual de etiquetado en proyectos de visión por computador.
- Prototipado de aplicaciones VLM en local: gracias a las cuantizaciones GGUF de bajo tamaño (desde 3,1 GB en Q2_K), es viable integrar el modelo en prototipos que se ejecutan en hardware de consumo sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,6-4,8 GB (Q4_K_S/Q4_K_M), 5,5 GB (Q5_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0) y 15,3 GB (f16), a los que hay que sumar el proyector multimodal (0,8 GB en Q8_0 o 1,5 GB en f16).
- GPU recomendadas: para cuantizaciones Q4-Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0 o f16 se recomienda RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o inferiores; las cuantizaciones altas requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeskVision-Captioner (este) | 7,6 B | no disponible | MIT | GGUF, safetensors | VLM orientado a captioning de escritorio, solo inglés |
| LLaVA-1.5-7B | 7 B | 4K (típico) | LLaMA 2 (uso comercial restringido) | safetensors, GGUF | VLM generalista, multilingüe parcial |
| Qwen2-VL-7B | 7-8 B | 32K+ | Apache 2.0 | safetensors, GGUF | VLM generalista, multilingüe, mejor rendimiento documentado |
| MiniCPM-V 2.6 | 8 B | 8K | Apache 2.0 (con restricciones) | safetensors, GGUF | VLM compacto con buen rendimiento en OCR y capturas |

La comparativa se basa en características públicas de modelos de la misma categoría; no se dispone de datos de benchmarks de DeskVision-Captioner que permitan una comparación cuantitativa directa. La ventaja principal de este modelo frente a alternativas es su licencia MIT y su especialización en captioning de escritorio, mientras que modelos como Qwen2-VL ofrecen mayor contexto y soporte multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado probablemente con datos web, puede heredar sesgos de género, raza o cultura.
- Riesgo de alucinación: los modelos de captioning pueden describir elementos inexistentes en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K).
- Limitaciones de contexto o idioma: solo soporta inglés según la model card; la longitud de contexto no está documentada, lo que dificulta planificar conversaciones multi-turno largas.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones significativas, pero conviene verificar la licencia del modelo base original (`DanHuang/DeskVision-Captioner`) por si impusiera condiciones adicionales.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; para producción se recomienda Q4_K_M o superior. El repo ocupa 70,2 GB en total, por lo que conviene descargar solo el archivo necesario. No hay benchmarks publicados que permitan estimar el rendimiento real frente a alternativas.
- Al ser una cuantización de terceros, la responsabilidad sobre la calidad del modelo recae en el autor original; mradermacher solo redistribuye los pesos convertidos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/DeskVision-Captioner-GGUF
- Modelo base original: https://huggingface.co/DanHuang/DeskVision-Captioner
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/DeskVision-Captioner-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#DeskVision-Captioner-GGUF
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
