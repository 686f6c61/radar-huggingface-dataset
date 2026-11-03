# mradermacher/Step3-VL-10B-Base-GGUF

## Resumen

Step3-VL-10B-Base es un modelo multimodal de tipo visión-lenguaje desarrollado por StepFun (stepfun-ai), distribuido en su forma original en el repositorio `stepfun-ai/Step3-VL-10B-Base`. La ficha que nos ocupa, `mradermacher/Step3-VL-10B-Base-GGUF`, no es el modelo original sino una colección de cuantizaciones estáticas en formato GGUF preparadas por el usuario mradermacher, pensadas para su uso con llama.cpp y ecosistemas compatibles.

El interés de esta publicación radica en que permite ejecutar un modelo VLM de aproximadamente 8.190 millones de parámetros (según los pesos en safetensors del modelo base) en hardware de consumo, gracias a cuantizaciones que van desde 3,4 GB (Q2_K) hasta 16,5 GB (f16). Incluye además el componente multimodal `mmproj` en dos variantes (f16 y Q8_0), imprescindible para procesar imágenes.

La licencia es Apache 2.0, lo que facilita su uso comercial. Sin embargo, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en esta ficha, por lo que muchos apartados se marcan como "no disponible" de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal visión-lenguaje; detalles internos no publicados en la información disponible) |
| Parámetros totales | 8.190.735.360 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; componente mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo multimodal (visión-lenguaje), como indica el sufijo "VL" y la presencia del componente `mmproj` necesario para el procesamiento de imágenes en llama.cpp. El recuento de parámetros en safetensors (8.190.735.360) corresponde al modelo base original, no a las cuantizaciones GGUF.

Tampoco se han publicado en esta información datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio de mradermacher es únicamente una conversión y cuantización del modelo original, sin modificaciones de arquitectura ni entrenamiento adicional. Para detalles de arquitectura y entrenamiento habría que consultar el repositorio original de StepFun.

## Capacidades

- Procesamiento multimodal visión-lenguaje: el modelo puede recibir imágenes junto con texto, gracias al componente `mmproj` incluido en el repositorio.
- Generación de texto a partir de entradas de imagen y/o texto (capacidad inferida del tipo de modelo; no se detallan capacidades específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripción automática de imágenes en pipelines de accesibilidad: el modelo puede generar texto descriptivo a partir de imágenes, integrándose en flujos que necesiten alt-text o descripciones para catálogos, redes sociales o documentos.
- Extracción de información de documentos escaneados: al combinar OCR implícito con comprensión visual, puede emplearse para extraer campos estructurados de facturas, formularios o recibos en entornos con hardware modesto.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, usando cuantizaciones Q4_K_M que caben en GPUs de consumo.
- Asistencia en entornos de escritorio o edge: con cuantizaciones de 3,4-5,1 GB puede desplegarse en portátiles con GPU integrada o modesta mediante llama.cpp, para tareas de análisis de capturas de pantalla o imágenes locales sin enviar datos a la nube.
- Prototipado e investigación en visión-lenguaje: sirve como base para experimentos académicos o pruebas de concepto que requieran un VLM de tamaño medio con licencia permisiva (Apache 2.0).
- Generación de descripciones para bases de datos de imágenes: indexación semántica de bibliotecas fotográficas mediante descripciones generadas automáticamente, ejecutables en servidores con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni overhead):
  - Q2_K: ~3,4 GB
  - Q3_K_M: ~4,2 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- Componente multimodal adicional: mmproj-f16 (~4,1 GB) o mmproj-Q8_0 (~2,8 GB), que se suma al presupuesto de memoria.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4_K_M y Q5_K_M encajan en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) si se tiene en cuenta el mmproj; Q8_0 requiere ~12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); f16 requiere GPUs de 24 GB o más (RTX 3090, RTX 4090, A100, H100).
- Despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) son los entornos naturales para estos GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Step3-VL-10B-Base (esta ficha, GGUF) | ~8,19 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de mradermacher; incluye mmproj |
| Step3-VL-10B-Base (original) | ~8,19 B | no disponible | Apache 2.0 | safetensors | Modelo base de StepFun |
| Alternativas VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación rigurosa |

No se dispone de información suficiente para comparar con alternativas concretas sin inventar datos. Se recomienda consultar el repositorio original de StepFun y benchmarks públicos de VLMs de ~8-10 B para una comparación adecuada.

## Limitaciones y advertencias

- Modelo base (sufijo "Base"): no ha pasado por alineación conversacional (RLHF/DPO) según la información disponible, por lo que su comportamiento en diálogo puede ser menos pulido que el de variantes "instruct" o "chat".
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: se desconoce la longitud máxima de contexto; no debe asumirse una ventana larga sin verificación empírica.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la calidad, especialmente en tareas de percepción visual fina u OCR.
- El componente mmproj es obligatorio para el procesamiento de imágenes; sin él, el modelo solo procesa texto.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de extracción de información visual conviene validar las salidas.
- Sesgos: no documentados en la información disponible; se recomienda evaluar en el dominio de aplicación.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar los términos del modelo original de StepFun por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Repositorio de 80,1 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Step3-VL-10B-Base-GGUF
- Modelo base original: https://huggingface.co/stepfun-ai/Step3-VL-10B-Base
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Step3-VL-10B-Base-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Step3-VL-10B-Base-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
