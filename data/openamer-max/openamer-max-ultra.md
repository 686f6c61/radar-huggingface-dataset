# openamer-max/openamer-max-ultra

## Resumen

OpenAmer-Ultra es un ajuste fino mediante QLoRA del modelo Qwen/Qwen2.5-32B-Instruct, desarrollado por el colectivo openamer-max dentro de su familia de modelos locales. Se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M (18,49 GB) pensado para su uso con Ollama y llama.cpp en hardware de consumo, y se complementa con un adaptador LoRA publicado por separado. La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso de 32.763.876.352 parámetros con una longitud de contexto de entrenamiento de 32.768 tokens.

El modelo está entrenado para responder en alemán, inglés y bosnio, y se orienta a un enfoque "local-first": inferencia en el propio dispositivo sin dependencia de la nube. El ajuste se realizó con QLoRA (r=32, alpha=64, una época, 2.716 frases, cuantización 4-bit NF4), con un pico de VRAM de 25,79 GB durante el entrenamiento sobre una GPU L40S de 48 GB.

Es relevante ahora porque representa un caso poco habitual en el que el propio autor publica resultados que contradicen la intuición de "más parámetros es mejor": en su banco de pruebas de 45 casos, Ultra obtiene 41/45 (91,1 %), por debajo de las variantes más pequeñas Desktop (44/45) y Pro (43/45) de la misma familia. El autor atribuye este resultado a que 2.716 frases de entrenamiento son insuficientes para justificar 32B de parámetros. La licencia es Apache-2.0 y el modelo base también es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento); mayor coincidencia medida: 30.067 tokens (92 %) |
| Tipos de cuantizacion | Q4_K_M (archivo publicado, 18,49 GB); adaptador LoRA separado; entrenamiento en 4-bit NF4 |
| Idiomas soportados | de, en, bs (otros idiomas no verificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); adaptador LoRA publicado por separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso de decodificación autorregresiva con 32.763.876.352 parámetros y un contexto de entrenamiento de 32.768 tokens. Sobre esta base se aplicó un ajuste fino supervisado mediante QLoRA con rango r=32, alpha=64, una sola época y 2.716 frases de entrenamiento, usando cuantización 4-bit NF4 para los pesos congelados. El pico de VRAM durante el entrenamiento fue de 25,79 GB sobre una GPU L40S de 48 GB, lo que confirma que el proceso se ejecutó en una sola GPU profesional.

No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación posteriores al ajuste supervisado. La innovación técnica destacable no está en la arquitectura (que es la estándar de Qwen2.5) sino en el enfoque de distribución: un único archivo GGUF Q4_K_M de 18,49 GB listo para Ollama, junto con un adaptador LoRA independiente que permite reproducir o recombinar el ajuste. El autor documenta además una medición de contexto con un método concreto (hecho colocado al 50 % de profundidad, ventana con reserva, temperatura 0) que alcanzó 30.067 tokens, y una mejora de rendimiento con offload parcial (num_gpu 10) de aproximadamente 200 tokens/s, unas 12 veces más rápido que la versión con CPU exclusiva.

## Capacidades

- Generación de texto conversacional en alemán, inglés y bosnio, con formato de chat instructivo heredado de Qwen2.5-32B-Instruct.
- Razonamiento de conocimiento factual y seguimiento de formato: el banco de pruebas del autor mide hechos concisos, cumplimiento de formato, negaciones y honestidad ante preguntas sin respuesta conocida.
- Capacidad de contexto largo: maneja hasta 32.768 tokens, con una coincidencia medida de 30.067 tokens (92 % del máximo).
- Soporte de conversación multi-turno mediante plantilla de chat instructiva.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face), lo que facilita su despliegue tras APIs compatibles.
- Ejecución local mediante Ollama (`ollama run amersacirovic/openamer-max-ultra`) y llama.cpp.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible. El propio autor indica que el modelo no cumple el requisito mínimo de 64.000 tokens de contexto de su agente OpenAmer, por lo que no está pensado para ese uso agéntico.

## Casos de uso

- Asistente conversacional local en alemán, inglés o bosnio: el modelo puede mantener diálogos multi-turno en el escritorio del usuario sin conexión a la nube, aprovechando su ventana de 32.768 tokens para conservar historial extenso de conversación.
- Procesamiento de documentos largos en local: con hasta 30.067 tokens verificados de contexto efectivo, es adecuado para resumir o extraer información de contratos, informes o artículos de decenas de páginas en los tres idiomas soportados.
- Generación y revisión de texto en alemán para equipos que necesitan soberanía de datos: al ejecutarse en hardware propio con licencia Apache-2.0, permite procesar contenido sensible sin enviarlo a terceros.
- Prototipado de aplicaciones con API compatible con endpoints: la etiqueta `endpoints_compatible` y el formato GGUF facilitan montar un servidor de inferencia local que imite la interfaz de APIs comerciales para pruebas de integración.
- Traducción y adaptación de contenido entre alemán, inglés y bosnio: aunque el autor no garantiza calidad fuera de esos idiomas, el ajuste cubre las tres lenguas y puede emplearse en tareas de reescritura y localización acotadas.
- Base para experimentación con QLoRA: al publicarse el adaptador por separado, investigadores pueden reproducir el ajuste, combinarlo con otras bases Qwen2.5 o estudiar el efecto de 2.716 frases sobre un modelo de 32B.
- Evaluación comparativa de escalado: útil como caso de estudio documentado sobre cuándo más parámetros no mejoran el rendimiento en un banco de pruebas concreto, gracias a la transparencia del autor al publicar los resultados de toda la familia.

## Benchmarks y rendimiento

El autor publica un banco de pruebas propio de 45 casos que mide hechos concisos, cumplimiento de formato, negaciones y honestidad ante preguntas sin respuesta conocida. No mide razonamiento libre ni contexto largo. Los resultados de la familia son los siguientes:

| Modelo | Parametros | Pruefstand (45 casos) |
|---|---|---|
| Desktop | 14,70B | 44/45 (97,8 %) |
| Pro | 24,00B | 43/45 (95,6 %) |
| Phone | 3,09B | 43/45 (95,6 %) |
| Tab | 7,62B | 42/45 (93,3 %) |
| Ultra | 32,00B | 41/45 (91,1 %) |
| Watch | 0,60B | 37/45 (82,2 %) |
| Qwen2.5-14B base (sin entrenamiento) | 14,7B | 22/45 (48,9 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte explícitamente que 45 casos son "una señal, no una prueba".

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica ~22 GB de RAM para el modelo Ultra (archivo de 19 GB, Q4_K_M de 18,49 GB). Para inferencia en GPU se requiere al menos esa cantidad de VRAM; con offload parcial (num_gpu 10) el autor reporta ~200 tokens/s, 12 veces más rápido que con CPU exclusiva.
- GPU recomendadas: el entrenamiento se realizó en una L40S de 48 GB con un pico de 25,79 GB. Para inferencia, una GPU con 24 GB (RTX 3090, RTX 4090) puede alojar el modelo Q4_K_M completo con margen ajustado; GPU profesionales como A100 o H100 ofrecen holgura.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB o más (RTX 3090/4090) en cuantización Q4_K_M; en GPUs de 16 GB o menos requerirá offload a RAM del sistema, con la consiguiente pérdida de velocidad.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-ultra`), llama.cpp y servidores compatibles con endpoints. El adaptador LoRA permite además cargar el ajuste sobre el modelo base en frameworks que soporten PEFT.
- Latencia y throughput: el autor reporta ~200 tokens/s con offload parcial (num_gpu 10). No se dispone de cifras de latencia para configuraciones GPU completas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Ultra | 32,76B | 32.768 tokens | 41/45 en banco propio (91,1 %) | Apache-2.0 | GGUF Q4_K_M + adaptador LoRA |
| OpenAmer-Desktop (misma familia) | 14,70B | no disponible | 44/45 en banco propio (97,8 %) | Apache-2.0 | GGUF |
| OpenAmer-Pro (misma familia) | 24,00B | no disponible | 43/45 en banco propio (95,6 %) | Apache-2.0 | GGUF |
| Qwen2.5-32B-Instruct (base) | 32,76B | 32.768 tokens | no disponible en este banco | Apache-2.0 | safetensors, GGUF, múltiples formatos |

La comparación más directa es con las propias variantes de la familia OpenAmer, donde Ultra queda por debajo de Desktop y Pro en el banco del autor. Frente a Qwen2.5-32B-Instruct base, el ajuste añade cobertura de alemán y bosnio y una cuantización GGUF lista para usar, a costa de un conjunto de entrenamiento reducido. No se dispone de datos comparativos con otros modelos de 32B fuera de esta familia en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al de variantes más pequeñas de la misma familia: 41/45 frente a 44/45 de Desktop y 43/45 de Pro. El autor lo atribuye a que 2.716 frases son insuficientes para justificar 32B de parámetros.
- El banco de pruebas son solo 45 casos, una muestra pequeña que el propio autor califica de señal, no de prueba; no mide razonamiento libre ni contexto largo.
- Cobertura lingüística limitada a alemán, inglés y bosnio; otros idiomas no han sido verificados y pueden degradarse.
- No apto para el agente OpenAmer: el agente exige un mínimo de 64.000 tokens de contexto y este modelo solo alcanza 32.768, por lo que no puede sostener ese uso agéntico (aunque sí chat y llamadas API).
- Riesgo de alucinación inherente a los modelos de lenguaje; el banco del autor incluye pruebas de honestidad ante preguntas sin respuesta, pero no hay garantías en producción.
- No se documentan evaluaciones de sesgos ni de seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-32B-Instruct, que también es Apache-2.0.
- El archivo GGUF Q4_K_M introduce pérdida de precisión respecto a los pesos originales; para tareas sensibles a la cuantización conviene evaluar formatos de mayor precisión (no publicados en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-ultra
- Adaptador LoRA: https://huggingface.co/openamer-max/openamer-max-ultra-adapter
- Sitio web del proyecto: https://openamer-max.github.io
- Página del "Gerätepass" (requisitos por dispositivo): https://openamer-max.github.io/geraetepass/
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Código fuente del agente: https://github.com/openamer-max/openamer
- Informe de medición de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- Versión Android: https://openamer-max.github.io/android.html
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
