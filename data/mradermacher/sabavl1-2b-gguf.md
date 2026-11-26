# mradermacher/SabaVL1-2B-GGUF

## Resumen

SabaVL1-2B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal SabaVL1-2B, publicada por el usuario mradermacher. El modelo original, desarrollado por Sakalti, es un modelo de visión y lenguaje (VL) construido sobre la arquitectura Qwen2-VL, orientado a tareas de generación de texto e interpretación de imágenes en conversaciones multi-turno. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de centro de datos.

El modelo cuenta con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en productos. La cuantización la realiza mradermacher de forma estática, ofreciendo múltiples niveles de compresión (desde Q2_K hasta f16) junto con un fichero mmproj-fp16 necesario para el procesamiento de imágenes.

Su relevancia radica en que ofrece capacidades multimodales en un tamaño reducido y con cuantizaciones que caben en GPUs de consumo e incluso en CPU, lo que lo hace útil para prototipos, aplicaciones de borde y despliegues con recursos limitados. No obstante, la información pública disponible sobre el modelo original es escasa y no se han publicado benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2-VL (visión-lenguaje) |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base SabaVL1-2B emplea la arquitectura Qwen2-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar conjuntamente imágenes y texto. Según las etiquetas de la model card, el entrenamiento incluyó fases de SFT (supervised fine-tuning) mediante la librería TRL y el framework Unsloth, lo que sugiere un ajuste supervisado sobre el modelo base Qwen2-VL. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una cuantización estática realizada por mradermacher, que incluye un fichero mmproj-fp16 separado para el proyector multimodal, necesario para que llama.cpp pueda procesar imágenes. No se han publicado cuantizaciones con imatrix (weighted) para este modelo en el momento de la consulta. La innovación principal respecto al modelo original es la disponibilidad de formatos GGUF que reducen el peso desde 3,2 GB (f16) hasta 0,8 GB (Q2_K), manteniendo el soporte multimodal.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta a preguntas visuales (VQA) gracias al codificador visual de Qwen2-VL y al fichero mmproj.
- Conversaciones multi-turno con contexto de imagen y texto.
- Razonamiento básico y descripción de contenido visual.
- Capacidad de ejecución en entornos con recursos limitados gracias a las cuantizaciones GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de descripción de imágenes para accesibilidad: el modelo puede recibir una imagen y generar una descripción textual en inglés, útil para generar texto alternativo en aplicaciones web o herramientas de lectura de pantalla en entornos con recursos limitados.
- Moderación de contenido visual en el borde: al caber en GPUs de consumo con cuantizaciones Q4, puede desplegarse en servidores locales para clasificar o describir imágenes antes de subirlas a la nube.
- Prototipado rápido de aplicaciones multimodal: investigadores y desarrolladores pueden integrar el modelo con llama.cpp u Ollama para validar ideas de VQA sin incurrir en costes de infraestructura.
- Extracción de información de documentos escaneados: el modelo puede leer imágenes de documentos y responder preguntas sobre su contenido, adecuado para flujos de digitalización en pequeña escala.
- Educación y demos interactivas: su tamaño reducido permite ejecutarlo en portátiles con GPU de consumo para demostraciones de IA multimodal en cursos o talleres.
- Automatización de tareas de etiquetado de imágenes: puede generar descripciones o etiquetas preliminares en inglés para conjuntos de datos, que luego se revisan manualmente.
- Integración en pipelines de CI/CD para pruebas de regresión visual: el modelo puede verificar capturas de pantalla de aplicaciones y describir diferencias, aunque con las limitaciones propias de su tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB para cuantizaciones Q4_K_M (1,1 GB de pesos más overhead de contexto y proyector visual), y alrededor de 4 GB para f16 (3,2 GB de pesos más overhead).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad. También puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 y superiores, usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), y servidores compatibles con GGUF. Para TGI o vLLM sería necesario usar el modelo original en safetensors.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SabaVL1-2B-GGUF | 1,5 B | no disponible | Apache 2.0 | GGUF | Multimodal, cuantizado por mradermacher |
| Qwen2-VL-2B | 2 B | 32k (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, multimodal |
| SmolVLM-2B | 2 B | no disponible | Apache 2.0 | safetensors | Multimodal ligero de Hugging Face |
| LLaVA-1.5-7B | 7 B | 4k | LLaMA 2 (restrictiva) | safetensors | Multimodal de mayor tamaño, licencia no comercial |

La comparación con Qwen2-VL-2B es la más directa, ya que SabaVL1-2B se basa en dicha arquitectura. SmolVLM-2B es otra alternativa ligera multimodal, mientras que LLaVA-1.5-7B ofrece mayor tamaño pero con licencia más restrictiva. No se dispone de datos de rendimiento comparativo para SabaVL1-2B.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés, lo que limita su uso en aplicaciones en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que se desconoce su calidad real frente a alternativas.
- Riesgo de alucinación inherente a modelos de lenguaje de pequeño tamaño, especialmente en tareas de razonamiento complejo o descripción de imágenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría heredar restricciones de Qwen2-VL (también Apache 2.0), por lo que se recomienda verificar la licencia del modelo original Sakalti/SabaVL1-2B.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente el rendimiento, especialmente en tareas multimodales.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- El modelo tiene solo 113 descargas y 0 likes en Hugging Face, lo que sugiere poca validación por parte de la comunidad.
- La longitud de contexto no está documentada, lo que dificulta planificar aplicaciones con ventanas largas.

## Enlaces

- [Hugging Face: mradermacher/SabaVL1-2B-GGUF](https://huggingface.co/mradermacher/SabaVL1-2B-GGUF)
- [Modelo base: Sakalti/SabaVL1-2B](https://huggingface.co/Sakalti/SabaVL1-2B)
- [Página de descargas de mradermacher para este modelo](https://hf.tst.eu/model#SabaVL1-2B-GGUF)
- [Repositorio de solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de ejemplo de TheBloke sobre uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de calidad de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
