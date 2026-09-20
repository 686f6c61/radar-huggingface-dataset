# eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-Q6_K-GGUF

## Resumen

`eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-Q6_K-GGUF` es una cuantización en formato GGUF (nivel Q6_K) de un derivado «abliterated» del modelo multimodal Qwen3-VL-32B de Alibaba, reempaquetado por el usuario eraiko para su uso dentro de ComfyUI. El pipeline declarado es `image-text-to-text`, la licencia Apache 2.0, el idioma declarado únicamente inglés y el tamaño del repositorio 20,7 GB. El propio repositorio no incluye model card técnica: solo contiene el frontmatter YAML con las etiquetas, por lo que no hay documentación del autor sobre entrenamiento, evaluación o uso previsto.

La cadena de derivación es la siguiente: Qwen3-VL-32B (modelo original) → `eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot` (modelo base directo, cuantizado en INT8) → esta cuantización GGUF Q6_K. Las etiquetas `heretic`, `abliterated` y `uncensored` indican que se ha aplicado una técnica de abliteración para eliminar la dirección de rechazo del modelo original, de modo que el resultado responde a peticiones que el modelo base declinaría.

Su relevancia práctica es triple: permite ejecutar en local un modelo visión-lenguaje de gran tamaño mediante llama.cpp y ComfyUI, ofrece una variante sin mecanismos de rechazo útil para investigación en alineación y red-teaming, y se distribuye bajo Apache 2.0. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 «likes», y no se ha publicado ningún resultado de benchmark asociado a esta derivada concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder visual + decodificador de lenguaje) de la familia Qwen3-VL; no se detalla en la model card |
| Parámetros totales | 25.157.829.120 (≈25,2 mil millones) según los safetensors del repositorio; el nombre del modelo indica 32B |
| Parámetros activos | no aplica (variante densa; no se declara MoE en la información disponible) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantización | GGUF Q6_K (este repositorio); el modelo base directo está cuantizado en INT8 (ConvRot) |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / ComfyUI) |
| Tamaño del repositorio | 20,7 GB |
| Pipeline declarado | image-text-to-text |
| Librería declarada | comfyui |
| Modelo base | eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot |
| Creado / actualizado | 2026-09-20 / 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3-VL, un transformer multimodal que combina un encoder visual con un decodificador de lenguaje y acepta entradas de imagen y texto de forma intercalada. El modelo base directo añade una cuantización INT8 con rotación (`ConvRot`) y este repositorio aplica sobre ella una cuantización GGUF Q6_K, aproximadamente 6,56 bits por peso, lo que explica que los 25,2 mil millones de parámetros ocupen 20,7 GB. La model card no aporta ningún dato sobre configuración de atención, número de capas, dimensionalidad, encoder visual ni política de contexto real.

No hay información disponible sobre datos de entrenamiento, volumen de tokens, composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias, ni en el modelo original ni en las derivadas. Tampoco se documenta el procedimiento de abliteración: se desconoce qué herramienta se utilizó, con qué conjunto de calibración, cuántas direcciones se eliminaron y qué impacto tuvo en las capacidades generales del modelo. La única innovación identificable es la propia cadena de cuantización (INT8 con rotación seguida de GGUF Q6_K), orientada a reducir el consumo de memoria manteniendo una pérdida de calidad baja.

## Capacidades

- Generación de texto conversacional a partir de entradas multimodales (imagen más texto), según el pipeline declarado `image-text-to-text`.
- Comprensión de imágenes: descripción de contenido visual y respuesta a preguntas sobre la imagen, inferido del pipeline y del modelo base, no documentado por el autor.
- Conversación multi-turno con historial, según la etiqueta `conversational`.
- Comportamiento sin filtros de contenido: las etiquetas `abliterated` y `uncensored` implican una tasa de rechazo muy inferior a la del modelo original.
- Integración con ComfyUI mediante nodos GGUF, que es el motivo del empaquetado y de la etiqueta `library_name: comfyui`.
- Soporte de tool calling o function calling: no disponible en la información proporcionada (el modelo original de la familia sí lo soporta, pero no hay confirmación para esta derivada).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; no hay confirmación de que se conserven los idiomas del modelo original.
- Modo de razonamiento extendido («thinking»), entrada de vídeo o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación automática de prompts para flujos de difusión en ComfyUI: el modelo se carga en el mismo entorno que el pipeline de generación de imágenes, por lo que puede describir una imagen de referencia y producir el prompt de texto que alimente un nodo de img2img o de ControlNet sin salir de la aplicación.
- Catalogación y etiquetado de lotes de imágenes en local: descripción y clasificación de bibliotecas fotográficas o de material de archivo sin enviar datos a servicios en la nube, aprovechando que el Q6_K cabe en 24 GB de VRAM.
- Investigación en alineación y seguridad: la versión abliterada sirve como referencia de «modelo sin rechazos» para estudiar qué comportamientos emergen al eliminar la dirección de rechazo y compararlos con el modelo original.
- Red-teaming de salvaguardas: generar respuestas no filtradas para comprobar si los clasificadores de contenido y los filtros de un producto las detectan y bloquean correctamente.
- Asistente visual offline para documentación técnica: interpretar capturas de pantalla, diagramas o gráficos y responder preguntas sobre ellos en una estación de trabajo con GPU de 24 GB o más.
- Creación de datasets sintéticos multimodales: producir descripciones y pares pregunta-respuesta sobre imágenes para ajustar modelos menores de visión-lenguaje.
- Prototipado de interfaces conversacionales con imagen: chatbot que recibe una imagen y mantiene el hilo de la conversación, sin coste de API y con control total sobre los pesos desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card técnica ni métricas de ningún tipo (MMLU, MMMU, HumanEval, GSM8K u otras), y la búsqueda web realizada no ha devuelto documentación relevante sobre el modelo: los resultados obtenidos corresponden a Parqet, una aplicación de seguimiento de carteras de inversión, sin ninguna relación con este repositorio.

## Requisitos de hardware

- Peso de los archivos: 20,7 GB en disco; en VRAM, los pesos en Q6_K ocupan aproximadamente 20,6 GB.
- VRAM estimada para inferencia: en torno a 22-24 GB con contexto corto (pesos más caché KV y el encoder visual); 32 GB o más si se trabaja con contextos largos o imágenes de alta resolución.
- GPU recomendadas: RTX 3090, RTX 4090 o A5000 (24 GB) de forma muy ajustada; RTX 5090, V100 de 32 GB o A100 de 40 GB como opción cómoda; A100 de 80 GB o H100 si se necesita contexto amplio.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 con contexto reducido; no cabe en tarjetas de 16 GB o menos (RTX 4080, RTX 4070 Ti, RTX 4060 Ti) sin descarga parcial a CPU.
- Ejecución con offloading a CPU: es posible con llama.cpp, pero requiere al menos 32 GB de RAM del sistema y reduce notablemente la velocidad.
- Opciones de despliegue: llama.cpp (binario `llama-server`), `llama-cpp-python`, nodos GGUF para ComfyUI, Ollama o LM Studio previa importación del archivo. vLLM tiene soporte GGUF limitado y TGI no soporta este formato.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-Q6_K-GGUF | 25,2 mil millones (nombre: 32B) | no disponible | Apache 2.0 | GGUF Q6_K | Este repositorio; abliterado; sin benchmarks |
| eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot | no disponible | no disponible | Apache 2.0 | INT8 | Modelo base directo; mayor precisión y mayor consumo de memoria |
| Qwen3-VL-32B (modelo original de la familia) | no disponible en la información proporcionada | no disponible | no disponible | safetensors | Sin abliterar; con mecanismos de rechazo intactos |
| Otras derivadas GGUF del mismo modelo base (Q4_K_M, Q8_0) | no disponible | no disponible | Apache 2.0 | GGUF | No se han encontrado referencias en la información disponible |

No se han encontrado en la información proporcionada modelos comparables de otros autores (por ejemplo, otras abliteraciones de Qwen3-VL o alternativas visión-lenguaje de tamaño similar), por lo que la comparativa se limita a la propia línea de derivación.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de Qwen3-VL y, al haberse eliminado los mecanismos de rechazo, puede amplificar respuestas sesgadas, estereotipadas u ofensivas que el modelo original habría matizado o declinado.
- Riesgo de alucinación: elevado en tareas de descripción detallada de imágenes y de lectura de texto en imágenes; no existe ninguna evaluación publicada que cuantifique este riesgo en esta derivada.
- Contenido sin filtrar: el modelo puede generar contenido no apto para productos de cara al público, por lo que requiere moderación posterior obligatoria si se integra en un servicio.
- Contexto e idioma: solo se declara inglés y no se documenta la ventana de contexto real; no hay confirmación de que se mantengan las capacidades multilingües del modelo original.
- Licencia: Apache 2.0 según el repositorio, pero conviene verificar la licencia del modelo original de la familia y las obligaciones de atribución; la abliteración no está cubierta por ninguna garantía del autor original.
- Discrepancia de parámetros: los safetensors declaran 25.157.829.120 parámetros mientras el nombre del modelo indica 32B; conviene verificar este dato antes de dimensionar el hardware.
- Ausencia total de validación: 0 descargas, 0 «likes», sin model card, sin benchmarks y sin historial de uso; no hay evidencia de que el modelo funcione correctamente en producción.
- Pérdida por cuantización: el Q6_K introduce un error adicional respecto al INT8 y al modelo en safetensors, y la propia abliteración puede degradar capacidades generales del modelo original.
- Dependencia de terceros: el uso en ComfyUI depende de nodos GGUF mantenidos por la comunidad, cuya compatibilidad con modelos visión-lenguaje no está garantizada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-Q6_K-GGUF
- Modelo base directo: https://huggingface.co/eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo original de la familia Qwen3-VL: no disponible en la información proporcionada.
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos correspondían a Parqet (https://parqet.com/de/, https://parqet.com/en, https://faq.parqet.com/de/, https://www.n-tv.de/broker-vergleich/parqet/, https://finanzwissen.de/anbieter/parqet/test/) y no guardan relación con este repositorio.
