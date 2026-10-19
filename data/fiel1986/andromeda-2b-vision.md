# fiel1986/Andromeda-2B-Vision

## Resumen

Andromeda 2B Vision es un ajuste fino multimodal desarrollado por el usuario fiel1986 (México) sobre Qwen/Qwen2-VL-2B-Instruct. El modelo hereda la arquitectura `qwen2_vl` (encoder visual más un modelo de lenguaje decoder) y se ha especializado mediante QLoRA en tareas de conversión de imágenes a código: capturas de pantalla a código funcional, bocetos a HTML/CSS con Tailwind y depuración visual de errores y vulnerabilidades. El repositorio publica pesos en safetensors con 2.208.985.600 parámetros (~2,21 mil millones) y un tamaño total de 4,4 GB.

Su relevancia práctica está en el segmento de modelos de visión pequeños: con algo más de dos mil millones de parámetros puede ejecutarse en GPUs de consumo, lo que lo hace apto para flujos de trabajo de front-end, revisión de código y asistencia técnica en local, sin depender de una API externa. Se distribuye con licencia Apache 2.0 y declara soporte para español e inglés.

Ahora bien, la model card es muy breve y no acompaña datos de entrenamiento, benchmarks ni evaluación cuantitativa. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y el modelo se publicó con fecha 2026-10-18, por lo que no existe validación independiente de las capacidades que anuncia el autor. Cualquier decisión de adopción debería basarse en una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen2_vl` (encoder visual + modelo de lenguaje decoder), heredada de Qwen2-VL |
| Parametros totales | 2.208.985.600 (~2,21 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargable con la libreria `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-VL-2B-Instruct, un transformer multimodal compuesto por un encoder visual con procesamiento de resolución dinámica y un decoder de lenguaje de la familia Qwen2, según la documentación pública del modelo base. La model card no detalla modificaciones estructurales sobre esa arquitectura: el trabajo del autor se limita a un ajuste fino supervisado mediante QLoRA, técnica que congela los pesos originales y entrena adaptadores de bajo rango en precisión reducida.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO adicional, ni los hiperparámetros del ajuste. La model card únicamente declara que el objetivo del fine-tuning es convertir capturas de pantalla, bocetos y errores visuales en código útil, además de dotar al modelo de una "identidad propia". El prefijo `base_model:finetune` en los metadatos confirma que se trata de un fine-tune y no de un entrenamiento desde cero.

## Capacidades

- Generación de código a partir de capturas de pantalla: el autor declara que el modelo puede explicar y corregir código que aparece en una imagen.
- Conversión de bocetos a HTML/CSS con clases de Tailwind, orientada a wireframes dibujados a mano.
- Depuración visual: detección de bugs, inyección SQL y XSS a partir de la imagen de un fragmento de código.
- Conversación multimodal multi-turno (etiqueta `conversational` en los metadatos).
- Soporte bilingüe declarado en español e inglés.
- "Identidad propia": el modelo responde asumiendo la personalidad Andromeda definida por el autor; no se detalla cómo se implementó ni con qué datos.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso con agentes, modo thinking, audio ni vídeo. Aunque la familia Qwen2-VL soporta entrada de vídeo, esta ficha no puede confirmar que el fine-tune conserve esa capacidad.

## Casos de uso

- Reconstrucción de interfaces a partir de capturas: se envía una imagen de una pantalla existente y el modelo devuelve el marcado HTML con clases de Tailwind, lo que acelera la migración de diseños a código en equipos de front-end.
- Prototipado rápido desde wireframes: un diseñador fotografía un boceto en papel y obtiene una primera versión funcional de la maqueta, útil en fases de descubrimiento donde no existe todavía un fichero de diseño.
- Revisión de seguridad asistida por imagen: pegar una captura de un fragmento de código para que el modelo señale posibles patrones de inyección SQL o XSS antes de abrir un pull request; encaja como primera barrera informal, nunca como sustituto de un SAST.
- Soporte técnico a usuarios no técnicos: el usuario adjunta una captura del error en pantalla y el modelo interpreta el mensaje y propone pasos de resolución, aprovechando la conversación multi-turno.
- Formación y onboarding de desarrolladores junior: explicar qué hace un bloque de código mostrado en una imagen o en una diapositiva, sin necesidad de transcribirlo a texto.
- Documentación de paneles y herramientas internas: a partir de la captura de un dashboard se genera una descripción textual de sus métricas y controles para incluir en un manual.
- Despliegue en entornos con requisitos de confidencialidad: al ser un modelo de 2,21 mil millones de parámetros con licencia Apache 2.0, puede ejecutarse en infraestructura propia, lo que permite procesar capturas de código propietario sin enviarlas a servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, DocVQA, ChartQA ni de ninguna otra evaluación, y tampoco se han encontrado referencias externas que las aporten.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 4,4 GB solo para los pesos, más overhead de caché KV y del encoder visual; presupuestar 6-7 GB para inferencia cómoda.
- VRAM estimada en int8: aproximadamente 2,2 GB de pesos, con un total práctico de 3-4 GB.
- VRAM estimada en int4: alrededor de 1,2 GB de pesos, con un total práctico de 2-3 GB, aunque esta cuantización no está publicada por el autor y requeriría conversión propia.
- GPU de consumo: cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB es viable en bf16 con margen ajustado o en cuantizaciones de 8 bits.
- GPU de datacenter: A100, H100 y L40S lo ejecutan con holgura y permiten batchear varias peticiones.
- Despliegue: `transformers` es la vía nativa; el autor declara compatibilidad con Text Generation Inference y con endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona. vLLM incluye soporte para la familia Qwen2-VL, aunque conviene verificar la versión concreta antes de desplegar.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Especializacion |
|---|---|---|---|---|---|
| Andromeda-2B-Vision | ~2,21 mil M | No disponible | Apache 2.0 | es, en | Imagen a codigo, debug visual |
| Qwen2-VL-2B-Instruct (base) | ~2,2 mil M | No disponible en esta ficha | Apache 2.0 | Multilingue (incluye es, en) | Vision-lenguaje generalista |
| InternVL2-2B | ~2,2 mil M | No disponible en esta ficha | No verificada en la informacion disponible | No disponible | Vision-lenguaje generalista |
| SmolVLM2-2.2B | ~2,25 mil M | No disponible en esta ficha | No verificada en la informacion disponible | Ingles principalmente | Vision-lenguaje ligero |

La comparación honesta es que Andromeda parte del mismo punto que Qwen2-VL-2B-Instruct y añade una especialización declarada hacia imagen-código, sin métricas que cuantifiquen la mejora. Frente a alternativas generalistas del mismo tamaño, la diferencia está en el sesgo del fine-tune, no en una capacidad estructural nueva.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni validación de terceros. Las capacidades descritas provienen únicamente de la model card del autor.
- Model card incompleta: no se documentan dataset, número de pasos, hiperparámetros de QLoRA ni proceso de evaluación, lo que impide reproducir el entrenamiento.
- Riesgo de alucinación en código: con 2,21 mil millones de parámetros, la generación de fragmentos largos o de lógica compleja es propensa a errores e invenciones de API; el código producido debe revisarse y ejecutarse siempre.
- La "depuración visual" de SQLi y XSS no equivale a un análisis de seguridad: un modelo de este tamaño puede pasar por alto vulnerabilidades o señalar falsos positivos. No debe sustituir a SAST, revisión manual ni pruebas dinámicas.
- Contexto no documentado: se desconoce la ventana efectiva y cuántos tokens consumen las imágenes de alta resolución, lo que complica el dimensionamiento en producción.
- Cobertura lingüística limitada a español e inglés; el comportamiento en otros idiomas no está garantizado.
- Sesgos heredados del modelo base Qwen2-VL, no evaluados ni mitigados de forma explícita en el fine-tune.
- La "identidad propia" puede incrementar la probabilidad de respuestas no fundamentadas o de role-play no deseado en contextos profesionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el contenido generado ni sobre posibles reclamaciones derivadas de datos de entrenamiento no documentados.
- Señal débil de adopción: 0 descargas y 0 likes en el momento de la consulta, publicación muy reciente. No existe evidencia de uso en producción.

## Enlaces

- [Modelo en HuggingFace: fiel1986/Andromeda-2B-Vision](https://huggingface.co/fiel1986/Andromeda-2B-Vision)
- [Modelo base: Qwen/Qwen2-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct)
- [Perfil del autor en HuggingFace](https://huggingface.co/fiel1986)
- [Otro modelo del autor: fiel1986/andromeda](https://huggingface.co/fiel1986/andromeda)
- [Otro modelo del autor: fiel1986/Andromeda-8B-Coder](https://huggingface.co/fiel1986/Andromeda-8B-Coder)
- [Andromeda CLI (proyecto de agente de codigo en terminal, sin relacion confirmada con este modelo)](https://andromedacli.com/)
- [Organizacion AndromedaAI en GitHub (sin relacion confirmada con este modelo)](https://github.com/AndromedaAI)
- [CivArchive, archivo de modelos de terceros (sin relacion con este modelo)](https://civitaiarchive.com/)
