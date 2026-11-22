# openamer-max/openamer-max-tab

## Resumen

OpenAmer-Tab es un modelo de lenguaje de 7.615.616.512 parámetros (7,62B) desarrollado por openamer-max como tercer escalón de la familia OpenAmer, una línea de asistentes diseñados por y para un objetivo de hardware concreto. En este caso, el destino es la tableta y equipos de gama media: el modelo se distribuye principalmente como GGUF Q4_K_M de 4,4 GB y está pensado para ejecutarse en local, sin conexión, con latencias declaradas de entre 0,2 y 1,1 segundos en CPU. Deriva del modelo base Qwen/Qwen2.5-7B-Instruct mediante un ajuste fino con LoRA, y conserva la licencia Apache-2.0.

El modelo está especializado en un asistente conversacional de producto: responde preguntas sobre OpenAmer, rechaza honestamente cuando la respuesta no está en el contexto y mantiene la polaridad correcta de las negaciones, algo que los escalones inferiores de la familia (Watch, Phone) no lograban de forma fiable. Su ventana de contexto es de 16k tokens, suficiente para documentos de longitud media. Los idiomas declarados son alemán, bosnio, croata, serbio e inglés.

Su relevancia actual reside en la propuesta de despliegue: un asistente de 7B cuantizado a 4 bits, distribuido vía Ollama con un único comando (`ollama run amersacirovic/openamer-max-tab`), que cabe en unos 6 GB de RAM y que el autor evalúa con un conjunto congelado de 45 casos para que todas las variantes de la familia sean comparables entre sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-7B-Instruct, ajuste LoRA) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.000 tokens (16k) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,4 GB); f16 (14,5 GB) |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 4,7 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Libreria | llama.cpp |
| Tamano del repo | 4,7 GB |
| Descargas / likes | 747 / 1 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only de 7,62B parámetros, y se ha adaptado mediante un ajuste fino con LoRA (según las etiquetas del repositorio) para convertirlo en un asistente de producto con identidad propia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales sobre el modelo base. El resultado se distribuye como GGUF para llama.cpp y Ollama, con una cuantización Q4_K_M como formato principal.

La innovación destacable no es arquitectónica sino de metodología de evaluación: el autor define un conjunto congelado de 45 casos que se aplica por igual a todos los escalones de la familia (Watch, Phone, Tab, Desktop, Pro, Ultra, VL-8B), de modo que las puntuaciones sean directamente comparables entre tamaños. Además, el autor documenta explícitamente los fallos del propio evaluador (comprobaciones de sinónimos con AND en lugar de OR, rechazos de seguridad contabilizados como violaciones, diacríticos bosnios marcados como deriva de idioma), lo que aporta trazabilidad al proceso de medición. También advierte de un detalle de inferencia relevante: mantener `repeat_penalty` en 1.0, ya que con 1.1 el modelo invirtió una negación en el escalón Phone.

## Capacidades

- Generación de texto conversacional en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas de producto con datos correctos y rechazos honestos cuando la respuesta no está en el contexto.
- Manejo correcto de la polaridad de negaciones (por ejemplo, distinguir "funciona en iPhone" de "no funciona en Android").
- Procesamiento de documentos (Word, Excel, PDF) dentro de la ventana de 16k tokens.
- Generación y comprensión de código, aritmética básica y resumen de textos, capacidades heredadas del base de 7B.
- Conversación multi-turno con temperatura 0 recomendada para respuestas deterministas en producción.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente de producto embebido en una aplicación de tableta: el modelo responde preguntas frecuentes sobre OpenAmer con datos verificados y rechaza cuando no sabe, lo que evita respuestas inventadas en un contexto de atención al usuario.
- Chatbot de soporte offline en kiosco o dispositivo sin conectividad: al ejecutarse en local con Ollama y ocupar unos 6 GB de RAM, funciona en equipos de gama media sin depender de la nube.
- Procesamiento de documentos de longitud media: con 16k tokens de contexto puede resumir contratos, actas o informes en Word, Excel o PDF sin truncar el contenido.
- Asistente multilingüe para la región de los Balcanes: cubre alemán, bosnio, croata y serbio en una sola instancia, útil para atención al cliente en mercados con varias lenguas oficiales.
- Generación de código asistida en entornos con recursos limitados: el base de 7B conserva capacidad de programación que los escalones de 0,6B y 3,1B pierden, y puede integrarse en editores o scripts locales.
- Resumen y extracción de información en pipelines de datos: la latencia declarada de 0,2 a 1,1 segundos en CPU permite procesar lotes de documentos pequeños en máquinas sin GPU.
- Prototipado de asistentes conversacionales con identidad de marca: el ajuste LoRA sobre Qwen2.5 permite personalizar el tono y el conocimiento de dominio sin reentrenar desde cero.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto congelado de 45 casos (producto) | 42/45 (93,3 %) |
| Conjunto congelado de 23 casos no vistos (sin contaminación) | 22/23 (95,7 %) |
| Desglose del conjunto de 23 casos | hechos 7/7 · paráfrasis 3/3 · rechazos 5/5 · bosnio 2/3 · rechazos en bosnio 1/1 · largo 1/1 · corto 1/1 · borde 2/2 |
| Prueba fresca de 12 preguntas nunca vistas en entrenamiento | 12/12 (contenido verificado) |
| Latencia | 0,2 – 1,1 s en CPU |
| Tamano | 4,7 GB en Ollama (Q4_K_M), 14,5 GB en f16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden del conjunto de evaluación propio del autor, no de suites académicas.

## Requisitos de hardware

- RAM estimada: unos 6 GB para la cuantización Q4_K_M (4,4 GB de archivo); unos 16 GB para f16 (14,5 GB).
- VRAM: no se especifica una cifra medida para este escalón; el autor mide 8 GB de VRAM para el modelo VL-8B de la familia, no para Tab.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo está orientado a ejecución en CPU y a equipos de gama media (tableta, mini-PC).
- Cabe en GPU de consumo: no confirmado; el diseño apunta a CPU y a equipos con 6 GB de RAM o más.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-tab`), llama.cpp con GGUF directo y Modelfile incluido en el repo, y API compatible con endpoints de Ollama (`/api/chat`).
- Latencia: 0,2 – 1,1 s en CPU según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Tab | 7,62B | 16k | Apache-2.0 | GGUF (Q4_K_M) | Ajuste LoRA de Qwen2.5-7B-Instruct, orientado a tableta y asistente de producto |
| OpenAmer-Phone | 3,09B | no disponible | Apache-2.0 | GGUF | Escalón inferior de la misma familia; 43/45 en el conjunto congelado |
| OpenAmer-Desktop | 14,7B | no disponible | Apache-2.0 | GGUF | Escalón superior; 44/45 en el conjunto congelado; en progreso según la model card |
| Qwen2.5-7B-Instruct | 7,62B | 32k (modelo base original) | Apache-2.0 | safetensors, GGUF | Modelo base sin el ajuste de producto; capacidades generales más amplias |

La comparación con el base Qwen2.5-7B-Instruct es la más directa, ya que OpenAmer-Tab deriva de él. No se dispone de datos de benchmarks estándar para situar el modelo frente a alternativas de la misma categoría (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que la formulación en bosnio es débil: ante "Mogu li koristiti OpenAmer bez interneta?" responde correctamente en sustancia pero no emplea las palabras "internet" ni "mreža"; es el único caso que falla del conjunto de 23.
- No hay garantía en multiplicaciones de cuatro dígitos; conviene verificar la aritmética antes de confiar en ella.
- No sustituye a un modelo grande: con 7,62B las cadenas de razonamiento largas siguen siendo frágiles.
- Riesgo de alucinación inherente a los modelos de 7B, mitigado parcialmente por el ajuste orientado a rechazos honestos, pero no eliminado.
- Mantener `repeat_penalty` en 1.0: con 1.1 el modelo invirtió una negación en el escalón Phone, y el mismo riesgo aplica a este escalón.
- La evaluación se basa en conjuntos propios del autor (45 y 23 casos) y no en benchmarks académicos estándar, lo que limita la comparación con otros modelos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-7B-Instruct, también Apache-2.0.
- El repositorio tiene muy poca tracción (747 descargas, 1 like) y fue creado en noviembre de 2026; la madurez del proyecto y el soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-tab
- Modelo en Ollama: https://ollama.com/amersacirovic/openamer-max-tab
- Web del proyecto: https://openamer-max.github.io
- Pasaporte de dispositivos (Geraetepass): https://openamer-max.github.io/geraetepass/
- Demo en el navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traduccion (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Codigo fuente: https://github.com/openamer-max/openamer
- Dataset de benchmark: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Escalon inferior (Phone): https://huggingface.co/openamer-max/openamer-max-phone
- Escalon inferior (Watch): https://huggingface.co/openamer-max/openamer-max-watch
