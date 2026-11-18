# Infinix-io/ACE-Step-v1-3.5B

## Resumen

ACE-Step-v1-3.5B es un modelo fundacional de generación de música desarrollado conjuntamente por ACE Studio y StepFun, distribuido en Hugging Face bajo el identificador Infinix-io/ACE-Step-v1-3.5B. Resuelve el problema de la generación de audio musical completo a partir de descripciones en lenguaje natural, combinando un autoencoder de compresión profunda (DCAE, heredado de Sana) con un transformer lineal ligero y un proceso de difusión. Con 3.500 millones de parámetros, es sustancialmente más pequeño que los modelos de lenguaje aplicados a música, lo que se traduce en una velocidad de inferencia muy superior.

La propuesta de valor central es el rendimiento en tiempo real: según la model card, genera cuatro minutos de música en unos 20 segundos sobre una A100, lo que supone un factor de tiempo real (RTF) de 27,27x con 27 pasos de muestreo. Esto lo sitúa como una alternativa práctica para producción musical asistida, remezcla y generación de bandas sonoras, frente a enfoques basados en LLM que requieren minutos u horas para la misma tarea.

El modelo soporta 17 idiomas (incluido el castellano), acepta descripciones en lenguaje natural, permite control de duración y edición de letras, y se publica con licencia Apache 2.0, lo que facilita su integración comercial. Su relevancia actual radica en ser uno de los pocos modelos fundacionales de música abiertos con coherencia musical declarada como estado del arte y con un coste computacional asumible en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con autoencoder de compresión profunda (DCAE) y transformer lineal ligero para condicionamiento |
| Parametros totales | 3.500 millones (3.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generación por duración de audio; control de duración explícito, sin ventana de tokens declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh, de, fr, es, it, pt, pl, tr, ru, cs, nl, ar, ja, hu, ko, hi (17 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,3 GB), integrable con diffusers |

## Arquitectura y entrenamiento

ACE-Step emplea un diseño híbrido que combina un proceso de difusión para la síntesis de audio con el Deep Compression AutoEncoder (DCAE) de Sana, que comprime el audio en un espacio latente de baja dimensionalidad, y un transformer lineal ligero que actúa como condicionador a partir de las descripciones textuales. Esta combinación reduce drásticamente el coste computacional frente a arquitecturas basadas en LLM, manteniendo la coherencia musical en melodía, armonía y ritmo. El modelo está diseñado para generar canciones completas, no fragmentos, y acepta control explícito de duración.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal más allá de la mención al transformer lineal. La información sobre el proceso de entrenamiento es, por tanto, limitada en la documentación proporcionada.

## Capacidades

- Generación de música original completa a partir de descripciones en lenguaje natural.
- Generación de canciones completas con control de duración explícito.
- Remezcla de música y transferencia de estilo.
- Edición de letras de canciones.
- Soporte multilingüe en 17 idiomas, incluidos inglés, chino, castellano, alemán, francés, italiano, portugués, polaco, turco, ruso, checo, neerlandés, árabe, japonés, húngaro, coreano e hindi.
- Base para aplicaciones posteriores de clonación de voz y generación especializada por género (rap, jazz, etc.).
- Integración con la librería diffusers para pipelines de texto a audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Producción musical asistida: el modelo genera una pista completa de hasta cuatro minutos en aproximadamente 20 segundos en una A100, lo que permite iterar rápidamente sobre borradores musicales en un estudio.
- Generación de bandas sonoras para vídeo y videojuegos: la capacidad de controlar la duración y describir el estilo en lenguaje natural facilita crear música de fondo ajustada a la longitud de una escena concreta.
- Remezcla y transferencia de estilo: útil para adaptar una composición existente a un género o instrumentación distinta, aprovechando la coherencia melódica y armónica declarada por el autor.
- Edición de letras de canciones: permite modificar el texto vocal de una pieza generada sin rehacer la composición completa, lo que agiliza flujos de trabajo de preproducción.
- Creación de contenido para creadores independientes: al ser Apache 2.0 y caber en GPUs de consumo (RTX 4090, RTX 3090), un creador puede generar música libre de royalties en su propia máquina.
- Prototipado rápido en herramientas de producción musical: integrable vía diffusers en DAWs o asistentes creativos con IA para generar ideas iniciales sobre las que trabajar.
- Aplicaciones de accesibilidad y educación musical: generación de ejemplos auditivos a partir de descripciones textuales para demostrar conceptos de armonía, ritmo o instrumentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente proporciona métricas de rendimiento de hardware en forma de factor de tiempo real (RTF), donde valores más altos indican mayor velocidad:

| Dispositivo | 27 pasos | 60 pasos |
|---|---|---|
| NVIDIA A100 | 27,27x | 12,27x |
| RTX 4090 | 34,48x | 15,63x |
| RTX 3090 | 12,76x | 6,48x |
| M2 Max | 2,27x | 1,03x |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 8,3 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precisión original, más overhead del pipeline de difusión.
- GPU recomendadas: NVIDIA A100 (RTF 27,27x a 27 pasos), RTX 4090 (RTF 34,48x, la más rápida de la tabla), RTX 3090 (RTF 12,76x).
- Cabe en GPU de consumo: sí, al menos en RTX 4090 y RTX 3090 según los datos del autor. En Apple Silicon M2 Max funciona con RTF 2,27x a 27 pasos, es decir, por encima del tiempo real.
- Opciones de despliegue: librería diffusers (formato nativo del repositorio); el autor remite al repositorio de GitHub para instrucciones de uso. No se documentan explícitamente vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de audio).
- Latencia y throughput: cuatro minutos de música en unos 20 segundos en A100 a 27 pasos; el RTF de 34,48x en RTX 4090 implica que la generación es aproximadamente 34 veces más rápida que la reproducción en tiempo real.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (generación de música texto-a-audio). La model card menciona de forma genérica "baselines basados en LLM" sin nombrarlos ni aportar cifras comparativas, por lo que no es posible construir una tabla comparativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACE-Step-v1-3.5B | 3,5B | No disponible | Apache 2.0 | Hugging Face, GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El rendimiento varía según el idioma; los diez idiomas principales funcionan mejor que el resto.
- Las generaciones superiores a cinco minutos pueden perder coherencia estructural.
- Los instrumentos poco comunes pueden no renderizarse con precisión.
- Alta sensibilidad a la semilla aleatoria y a la duración de entrada, con resultados inconsistentes ("estilo gacha").
- Debilidades por estilo: bajo rendimiento en ciertos géneros, como el rap en chino (zh_rap), con adherencia limitada al estilo y techo de musicalidad.
- Artefactos de continuidad: transiciones poco naturales en operaciones de repintado y extensión.
- Calidad vocal tosca, sin matices finos.
- Granularidad de control insuficiente: se necesitan parámetros musicales más finos.
- Riesgo de generar contenido con derechos de autor si se usa sin permiso; el autor recomienda verificar la originalidad y declarar el uso de IA.
- Riesgo de contenido dañino u ofensivo y de presentar música generada como humana.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las consideraciones éticas y de derechos de terceros indicadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/ACE-Step-v1-3.5B
- Página del proyecto: https://ace-step.github.io/
- Demo Space: https://huggingface.co/spaces/ACE-Step/ACE-Step
- Repositorio GitHub: https://github.com/ACE-Step/ACE-Step
- Cita (BibTeX): Gong et al., 2025, "ACE-Step: A Step Towards Music Generation Foundation Model"
