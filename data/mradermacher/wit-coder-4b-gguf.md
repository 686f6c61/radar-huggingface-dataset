# mradermacher/Wit-Coder-4B-GGUF

## Resumen

Wit-Coder-4B-GGUF es la versión cuantizada en formato GGUF del modelo Rangle2/Wit-Coder-4B, un modelo de lenguaje orientado a generación de código y flujos agénticos. La cuantización la ha realizado mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), lo que lo sitúa en la gama compacta de modelos de código.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de código de 4B en hardware de consumo, con cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). El modelo base se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está etiquetado como modelo de código, agente y entrenado con DPO (Direct Preference Optimization). La información disponible sobre arquitectura, contexto y datos de entrenamiento es limitada: la model card del cuantizador es una plantilla estándar de mradermacher y no incluye detalles técnicos del modelo original.

El repositorio tiene un tamaño de 41,0 GB, coherente con la inclusión de múltiples variantes de cuantización y ficheros multimodales (mmproj). En el momento de la consulta, el modelo registra 0 descargas y 0 likes, lo que indica una publicación muy reciente (creada el 2026-11-09) o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el pipeline de transformers y el formato GGUF) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Rangle2/Wit-Coder-4B en la información proporcionada. Por el número de parámetros (4,3B) y el pipeline de transformers, se trata de un transformer decoder-only de tamaño compacto, pero no se confirman detalles como el número de capas, la dimensión oculta, el mecanismo de atención o la longitud de contexto nativa.

Sí se conocen algunas señales sobre el entrenamiento a partir de las etiquetas del repositorio: el modelo está marcado como `code`, `agent` y `dpo`. Esto sugiere que el modelo base fue ajustado para tareas de generación de código y uso agéntico, y que se aplicó una fase de optimización de preferencias (DPO) sobre el modelo ajustado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF. La presencia de ficheros `mmproj` (multi-modal projection) en el repositorio de cuantizaciones indica que el modelo base podría tener capacidades multimodales (visión), aunque la model card no lo detalla explícitamente y los tags no incluyen `vision`.

## Capacidades

- Generación de código: el modelo está etiquetado como `code`, por lo que su caso de uso principal es la escritura y compleción de código en inglés.
- Uso agéntico: la etiqueta `agent` indica que el modelo base fue ajustado para tareas de agente, presumiblemente con soporte de razonamiento multi-paso.
- Alineación mediante DPO: la etiqueta `dpo` sugiere que se aplicó optimización de preferencias para mejorar la calidad de las respuestas.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (proyección multimodal), lo que apunta a soporte de entrada de imágenes, aunque no se detalla en la model card.
- Conversacional: el repositorio está marcado como `conversational`, por lo que admite diálogo multi-turno.
- Idiomas: únicamente inglés (`en`) según los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Autocompletado de código en el editor: con cuantizaciones Q4_K_S o Q4_K_M (2,7-2,9 GB), el modelo puede ejecutarse en un portátil con GPU de consumo y ofrecer sugerencias de código en tiempo real, aprovechando su tamaño compacto para baja latencia.
- Asistente de refactorización local: al ser un modelo de 4B con licencia Apache 2.0, se puede integrar en un IDE o CLI para reescribir funciones, añadir docstrings o migrar código entre lenguajes, sin enviar el código a servicios externos.
- Agente de automatización de tareas de desarrollo: la etiqueta `agent` sugiere que el modelo puede encadenar pasos (leer un fichero, proponer un parche, ejecutar tests) en pipelines de CI/CD locales.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones o fragmentos de código, útil en flujos de integración continua donde se requiere cobertura rápida.
- Chat de soporte técnico para desarrolladores: gracias a su naturaleza conversacional y su tamaño reducido, puede desplegarse como asistente de documentación técnica en inglés para equipos internos.
- Prototipado rápido en entornos con recursos limitados: con la cuantización Q2_K (2,1 GB) o Q3_K_S (2,2 GB), el modelo cabe en GPUs de gama baja o incluso en CPU con llama.cpp, permitiendo experimentar con flujos agénticos sin infraestructura dedicada.
- Procesamiento de capturas o diagramas de código: si se confirma la capacidad multimodal (ficheros mmproj), podría extraer código a partir de imágenes de fragmentos o diagramas, aunque esta capacidad no está documentada en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2,1 GB de pesos; con overhead de contexto, ~3 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,2-2,6 GB; ~3-4 GB de VRAM.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,7-2,9 GB; ~4-5 GB de VRAM.
  - Q5_K_S / Q5_K_M: ~3,2-3,3 GB; ~5 GB de VRAM.
  - Q6_K: ~3,7 GB; ~5-6 GB de VRAM.
  - Q8_0: ~4,7 GB; ~6-7 GB de VRAM.
  - f16: ~8,8 GB; ~10 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, todas las cuantizaciones hasta Q8_0 caben en GPUs con 8 GB o más; Q4_K_M es la opción recomendada por el autor por equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio está marcado como `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo Hugging Face. No se confirma soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wit-Coder-4B-GGUF (este) | 4,3B | no disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher; etiquetas code/agent/dpo |
| Modelos de código de ~4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas concretas en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide planificar su uso en tareas que requieran ventanas largas (por ejemplo, análisis de repositorios completos).
- Alucinación: como todo modelo de lenguaje, puede generar código sintácticamente plausible pero funcionalmente incorrecto; se recomienda validación con tests.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Rangle2/Wit-Coder-4B por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K/Q8_0 cuando la calidad sea prioritaria.
- Cuantizaciones ponderadas: el autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicación, lo que puede afectar ligeramente a la perplejidad frente a variantes ponderadas de otros autores.
- Multimodalidad no confirmada: la presencia de ficheros mmproj sugiere capacidades de visión, pero no está documentada en la model card; no debe asumirse en producción sin verificación.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación comunitaria.
- Fecha de creación: 2026-11-09, lo que indica una publicación muy reciente con posible falta de rodaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wit-Coder-4B-GGUF
- Modelo base: https://huggingface.co/Rangle2/Wit-Coder-4B
- Página de resumen del cuantizador: https://hf.tst.eu/model#Wit-Coder-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
