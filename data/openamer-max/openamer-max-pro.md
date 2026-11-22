# openamer-max/openamer-max-pro

## Resumen

OpenAmer-Pro es un ajuste fino del modelo Mistral-Small-24B-Instruct-2501 de Mistral AI, desarrollado por el colectivo openamer-max como quinta escala de su familia de modelos orientados a ejecución local. El modelo resuelve un problema concreto: ofrecer una variante de 24B parámetros en formato GGUF cuantizado Q4_K_M (13,35 GB) que quepa en equipos con 16 GB de RAM libre, sin necesidad de cuenta ni servicio en la nube. Se distribuye principalmente a través de Ollama y llama.cpp.

La particularidad más destacable del modelo es que su propio autor documenta de forma explícita que **no supera a la escala inferior de la familia** (Desktop, 14,7B) en su banco de pruebas interno: obtiene 43/45 (95,6 %) frente a 44/45 (97,8 %) del modelo menor. Es decir, el aumento de parámetros y de huella de memoria no se traduce en mejor calidad medida en su conjunto de evaluación de 45 casos. Esta honestidad en la documentación es relevante para quien evalúe el modelo para producción.

El ajuste se realizó mediante QLoRA 4-bit (r=32, alpha=64) sobre el modelo base, con un entrenamiento corto: 170 pasos en una GPU L40S de 48 GB durante 37 minutos. El foco lingüístico son el alemán y el bosnio/croata/serbio, con inglés funcional pero no prioritario. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-Small-24B-Instruct-2501) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Modelfile de ejemplo usa num_ctx 8192) |
| Tipos de cuantizacion | Q4_K_M (13,35 GB); formato GGUF |
| Idiomas soportados | de, bs, hr, sr, en (alemán y bosnio/croata/serbio entrenados; inglés funcional) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería llama.cpp); repositorio de 14,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24B parámetros de Mistral AI, y se ajusta mediante QLoRA 4-bit con rango 32 y alpha 64. El entrenamiento se ejecutó en Hugging Face Jobs sobre una NVIDIA L40S de 48 GB, con un total de 170 pasos y una duración de 37 minutos; el pico de VRAM durante el entrenamiento fue de 19,46 GB. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica del proyecto no reside en la arquitectura (que es la del modelo base sin modificaciones estructurales) sino en el enfoque de despliegue: cuantización Q4_K_M para caber en 16 GB de RAM, distribución vía Ollama y llama.cpp, y un banco de pruebas congelado de 45 casos (once categorías: hechos, paráfrasis, preguntas de parada, bosnio, bosnio-parada, texto largo, respuesta corta, casos límite) que se mantiene idéntico entre escalas para permitir comparaciones. El autor documenta además dos parámetros de inferencia no negociables: `repeat_penalty 1.0` (con 1.1 el modelo invirtió una negación en pruebas) y `temperature 0` para preguntas factuales.

## Capacidades

- Generación de texto conversacional en alemán, bosnio, croata, serbio e inglés, con foco declarado en las dos primeras familias lingüísticas.
- Respuestas factuales concisas: el modelo está entrenado para respuestas breves y correctas, con temperatura 0 recomendada.
- Seguimiento de instrucciones de formato en la mayoría de casos, aunque el propio autor documenta un fallo real al ignorar la instrucción "una palabra" en una de las preguntas del banco de pruebas.
- Comprensión de texto largo: el conjunto de evaluación incluye una categoría específica de texto largo.
- Manejo de preguntas de parada y casos límite, evaluados en categorías dedicadas del banco de pruebas.
- **No soporta tool calling ni function calling de forma fiable**: en el test PLE-Harness superó una tarea simple de ficheros (smoke test) pero no ejecutó una llamada MCP.
- **No es adecuado como agente**: el autor indica explícitamente que es demasiado pequeño para trabajo de agentes.
- Sin capacidades multimodales, de audio ni de visión (la familia tiene un modelo VL-8B separado).
- Sin modo de razonamiento extendido (thinking mode) documentado.

## Casos de uso

- **Asistente conversacional local en alemán**: el modelo puede gestionar conversaciones multi-turno en alemán sin conexión a la nube, ejecutándose en un equipo con 16 GB de RAM libre mediante Ollama (`ollama run amersacirovic/openamer-max-pro`). Es adecuado para entornos con requisitos de privacidad donde los datos no deben salir del dispositivo.
- **Atención al cliente en bosnio/croata/serbio**: es uno de los pocos modelos abiertos de este tamaño con entrenamiento declarado en estas lenguas, lo que lo hace útil para soporte automatizado en los mercados de los Balcanes occidentales, siempre que las respuestas se validen por su tendencia a formatos breves.
- **Generación de respuestas factuales sobre un producto concreto**: el banco de pruebas mide conocimiento del producto OpenAmer; el modelo puede adaptarse a dominios acotados mediante ajuste fino adicional con QLoRA sobre la misma receta, dado el bajo coste de entrenamiento documentado (37 minutos en L40S).
- **Despliegue en estaciones de trabajo sin GPU dedicada**: con Q4_K_M (13,35 GB) y 16 GB de RAM, el modelo puede ejecutarse en CPU mediante llama.cpp, lo que lo hace viable en portátiles de gama alta o estaciones sin acelerador.
- **Traducción asistida alemán-bosnio/croata/serbio**: aunque no es un modelo de traducción especializado, su cobertura de estas lenguas permite usarlo como base para tareas de traducción con supervisión humana, combinado con la API de traducción del mismo proyecto (138 idiomas) para casos más amplios.
- **Prototipado rápido de chatbots de dominio cerrado**: la combinación de licencia Apache-2.0, formato GGUF y disponibilidad en el registro de Ollama permite integrar el modelo en prototipos sin gestionar infraestructura ni licencias restrictivas.
- **Evaluación comparativa de escalas de modelos**: el banco de pruebas congelado de 45 casos publicado en Hugging Face Datasets permite reproducir la comparación entre las escalas de la familia y verificar las afirmaciones del autor.

## Benchmarks y rendimiento

Los únicos datos de evaluación disponibles son los del banco de pruebas propio del autor (Prüfstand v2, 45 casos), no benchmarks estándar de la industria:

| Modelo | Parámetros | Tamaño | Prüfstand v2 (45 casos) |
|---|---|---|---|
| Desktop | 14,70B | 8,4 GB | 44/45 (97,8 %) |
| Pro (este modelo) | 24,00B | 13,4 GB | 43/45 (95,6 %) |
| Phone | 3,09B | 2,5 GB | 43/45 (95,6 %) |
| Tab | 7,62B | 4,4 GB | 42/45 (93,3 %) |
| Watch | 0,60B | 639 MB | 37/45 (82,2 %) |
| Base Qwen2.5-14B sin entrenar | 14,70B | — | 22/45 (48,9 %) |

Los dos fallos documentados del modelo en este banco son: (1) una respuesta correcta en contenido pero que no usa las palabras esperadas (rechner/local/benutzerprofil) sobre dónde se almacenan los datos; y (2) un fallo real al ignorar la instrucción "una palabra" en la pregunta sobre si OpenAmer es gratuito. El autor indica que no hay alucinaciones ni errores factuales en los 45 casos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: aproximadamente 16 GB de RAM libre para la cuantización Q4_K_M (13,35 GB de pesos más overhead). El autor indica que cabe en un equipo con 16 GB de memoria libre.
- **GPU recomendadas**: no se especifican GPU concretas para inferencia en la información disponible. Para el entrenamiento se usó una L40S de 48 GB (pico de 19,46 GB de VRAM).
- **¿Cabe en GPU de consumo?**: sí, en GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB) o en CPU con 16 GB de RAM. El modelo está etiquetado como `on-device`.
- **Opciones de despliegue**: Ollama (`ollama run amersacirovic/openamer-max-pro`), llama.cpp (GGUF directo con Modelfile), y el espacio de demostración en Hugging Face con ZeroGPU. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- **Parámetros de inferencia recomendados**: `temperature 0`, `repeat_penalty 1.0`, `num_ctx 8192` (según el Modelfile de ejemplo).
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor remite a su página de "Gerätepass" para tiempos de respuesta medidos por dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenAmer-Pro | 23,57B | no disponible (ejemplo: 8192) | Apache-2.0 | GGUF/Ollama | Ajuste QLoRA de Mistral-Small-24B; 43/45 en banco propio |
| Mistral-Small-24B-Instruct-2501 | 24B | no disponible | Apache-2.0 | Safetensors, GGUF | Modelo base; sin ajuste específico para de/bs/hr/sr |
| OpenAmer-Desktop (misma familia) | 14,70B | no disponible | Apache-2.0 | GGUF/Ollama | 44/45 en el mismo banco; menor huella (8,4 GB) y mejor puntuación |
| Qwen2.5-14B (referencia del autor) | 14,70B | no disponible | no disponible | no disponible | 22/45 sin entrenar en el banco del autor |

La comparación más relevante es interna a la familia: el modelo Desktop (14,7B) obtiene mejor puntuación en el banco del autor con 5 GB menos de huella, lo que cuestiona la elección de la escala Pro salvo que se necesite específicamente el modelo base de Mistral por sus capacidades generales.

## Limitaciones y advertencias

- **No es un agente fiable**: falló al ejecutar una llamada MCP en el test PLE-Harness; el autor lo desaconseja explícitamente para trabajo de agentes.
- **El inglés no es su punto fuerte**: solo alemán y bosnio/croata/serbio están realmente entrenados; el inglés funciona pero no es el foco.
- **No sustituye a un modelo frontera**: el autor señala que el mejor modelo abierto del mundo alcanza 26/100 en un benchmark público de ingeniería, y este es considerablemente más pequeño.
- **Rendimiento inferior a la escala menor de la familia**: 43/45 frente a 44/45 del Desktop, con 5 GB más de huella; el tamaño no se traduce en calidad en este caso.
- **Sensibilidad a parámetros de muestreo**: con `repeat_penalty 1.1` el modelo invirtió una negación en pruebas; se recomienda 1.0. Con temperatura distinta de 0 en preguntas factuales, el autor advierte que el modelo "adivina".
- **Fallo de seguimiento de instrucciones de formato**: ignoró una instrucción explícita de responder con una sola palabra.
- **Riesgo de alucinación**: el autor no reporta alucinaciones en su banco de 45 casos, pero el conjunto es pequeño y centrado en un dominio concreto (conocimiento del producto OpenAmer); no hay evidencia sobre dominios generales.
- **Licencia**: Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Mistral-Small-24B-Instruct-2501 (también Apache-2.0 según la información disponible).
- **Contexto**: no se documenta la longitud de contexto efectiva del ajuste; el Modelfile de ejemplo usa 8192 tokens, muy por debajo del contexto nativo del modelo base.
- **Documentación en alemán**: la model card está redactada íntegramente en alemán, lo que puede dificultar la evaluación a equipos no germanohablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-pro
- Modelo en Ollama: https://ollama.com/amersacirovic/openamer-max-pro
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Sitio web del proyecto: https://openamer-max.github.io
- Página de compatibilidad por dispositivo (Gerätepass): https://openamer-max.github.io/geraetepass/
- Código fuente: https://github.com/openamer-max/openamer
- Demo en el navegador (ZeroGPU): https://openamer-max-openamer-max-demo.hf.space
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Banco de pruebas de 45 casos: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
