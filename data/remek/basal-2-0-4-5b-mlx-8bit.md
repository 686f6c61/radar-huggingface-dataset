# Remek/basal-2.0-4.5B-MLX-8bit

## Resumen

basal-2.0-4.5B-MLX-8bit es una conversión a 8 bits en formato MLX del modelo basal-2.0-4.5B, desarrollado por Remigiusz Kinas (usuario Remek) y afinado a partir de speakleash/Bielik-4.5B-v3.0-Instruct. No es un modelo de chat generalista: es un modelo de decisión tipada ("typed decisions") diseñado para elegir entre opciones discretas, clasificar, calibrar la confianza de sus respuestas y emitir decisiones estructuradas en lugar de texto libre. Está pensado para integrarse en el motor de inferencia propio del autor, basal-serve, que expone una API de decisiones con umbrales de error configurables.

El modelo cuenta con 4.757.260.288 parámetros totales (aproximadamente 4,5B) y una ventana de contexto de 32.768 tokens. Soporta hasta 255 opciones por pregunta (20 en el backend Ollama) y está orientado a los idiomas polaco e inglés. La relevancia de esta variante concreta radica en que permite ejecutar el modelo en Apple Silicon mediante MLX con pesos de 8 bits, manteniendo una concordancia del 97,92 % con la versión bf16 en el conjunto de desarrollo dev v2 y una diferencia de precisión de 0,0000 puntos.

La licencia es Apache-2.0, heredada del modelo base Bielik, lo que facilita su uso comercial. El repositorio ocupa 5,2 GB y acumula 381 descargas en Hugging Face. La ficha se centra en esta conversión MLX, pero los resultados de referencia del modelo original deben consultarse en la model card de basal-2.0-4.5B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-4.5B-v3.0-Instruct); decodificación de decisión tipada sobre el motor basal |
| Parámetros totales | 4.757.260.288 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | 8 bits (MLX); el proyecto publica además FP8, GGUF Q8_0 y GGUF Q5_K_M |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer correspondiente al modelo Bielik-4.5B-v3.0-Instruct, un modelo instructivo del proyecto SpeakLeash entrenado principalmente en polaco. Sobre esa base, el autor ha construido basal-2.0 como un modelo de decisión tipada: en lugar de generar texto libre, el modelo recibe un estado y un conjunto de opciones y devuelve una decisión estructurada con una confianza asociada. El proyecto incluye un motor de inferencia propio (basal engine v2.0.0) que gestiona los modos de decisión, la calibración y los umbrales de error.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO durante el afinado. La model card sí documenta el proceso de calibración: el archivo CALIBRATION.json corresponde a la calibración del modelo bf16, y para esta conversión MLX se incluye además CALIBRATION.mlx.json, ajustado sobre las lecturas propias del puerto cuantizado con el mismo método y un único orden de opciones. El ECE en dev v2 pasa de 0,0193 con el ajuste bf16 a 0,0202 con el ajuste específico (en muestra) y 0,0245 en validación leave-one-family-out.

## Capacidades

- Toma de decisiones tipadas: selección entre un conjunto discreto de opciones (hasta 255 por pregunta; 20 en Ollama) con salida estructurada.
- Clasificación y calibración de confianza: el modelo emite una confianza por decisión y admite umbrales de error máximo configurables (por ejemplo, `max_error`).
- Modos de decisión diferenciados: `act`, `tool` y `multi`, este último para decisiones sobre muchas etiquetas (experimental).
- Razonamiento multi-paso dentro del flujo de decisión, con soporte para el parámetro `"facts": "auto"` que delega el cálculo de hechos al motor.
- Soporte de tool calling a través del modo `tool` del motor basal-serve.
- Generación de texto y conversación (pipeline text-generation), heredada de la base instructiva Bielik.
- Capacidades multilingües limitadas a polaco e inglés.
- Integración con un motor de inferencia específico (basal-serve) que expone los modos de decisión vía API en el puerto configurado.
- No incluye cabeza de evidencias ("evidence head") en la versión 2.0.

## Casos de uso

- Triaje de solicitudes en atención al cliente: el modelo recibe el texto del cliente y un conjunto cerrado de categorías (facturación, incidencia técnica, reclamación, etc.) y devuelve la categoría con una confianza calibrada; el contexto de 32.768 tokens permite incluir el historial completo de la conversación.
- Enrutamiento de tickets en sistemas de soporte: con el modo `tool` se puede decidir qué herramienta o cola interna debe activarse para cada caso, usando umbrales de error para derivar a revisión humana los casos de baja confianza.
- Clasificación documental en pipelines de back office: procesamiento de documentos polacos o ingleses con hasta 255 etiquetas por pregunta, adecuado para archivado, extracción de tipo documental o asignación de códigos internos.
- Validación de decisiones con calibración explícita: en flujos donde se exige un error máximo (por ejemplo, `max_error` de 0,05), el modelo puede abstenerse y derivar la decisión a un humano, lo que encaja en procesos regulados o con consecuencias legales.
- Asistencia a la decisión en aplicaciones locales para macOS: gracias a los pesos MLX de 8 bits y al motor basal-serve, se puede desplegar en un Mac con Apple Silicon (probado en M4 Pro de 24 GB) sin depender de servicios en la nube, útil para prototipos y herramientas internas.
- Extracción de decisiones estructuradas en formularios o encuestas: dado un estado con los datos disponibles, el modelo elige la opción correcta entre las permitidas y devuelve la confianza, integrándose en un backend que aplique la lógica de negocio posterior.
- Evaluación comparativa de puertos cuantizados: el propio repositorio sirve como referencia para equipos que necesiten medir la degradación de un modelo de decisión al pasar de bf16 a 8 bits en MLX, con métricas de concordancia y ECE ya publicadas.

## Benchmarks y rendimiento

Los datos publicados en esta model card corresponden a la verificación del puerto MLX frente al modelo bf16 en el conjunto dev v2 (cada tercera decisión, 1.700 decisiones), no a benchmarks académicos del modelo.

| Puerto | Concordancia con bf16 (opciones 2-10) | Concordancia con margen >= 0,2 | Diferencia de precisión | Diferencia de ECE | Tamaño | Velocidad | Estado |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9478 | 0,9890 | -0,0008 | +0,0009 | 4,9 GB | 38,6 dec/s c16, c1 p50 29 ms (H100) | PASS |
| GGUF Q8_0 | 0,9839 | 0,9988 | +0,0002 | +0,0035 | 4,8 GB | no medida en esta versión | PASS |
| GGUF Q5_K_M | 0,9569 | 0,9920 | -0,0039 | +0,0040 | 3,2 GB | no medida en esta versión | PASS |
| MLX 8-bit | 0,9792 | 0,9989 | +0,0000 | -0,0009 | 4,9 GB | 278 ms c1 p50, 698 ms para 5 preguntas (Mac) | PASS |

Los umbrales exigidos para esta categoría de puertos son: concordancia en opciones 2-10 >= 0,9415, concordancia con margen >= 0,2 >= 0,9863, precisión dentro de 1 punto del bf16 y ECE con incremento máximo de +0,01. El puerto MLX los cumple todos.

Los resultados propios del modelo (Werdykt, JDI, LEK, PL-Holdout y PL-Real) frente a basal-1.5 no se reproducen en esta ficha: están publicados en la model card de basal-2.0-4.5B y este puerto no se evalúa por separado en ellos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,2 GB y los pesos MLX de 8 bits pesan 4,9 GB; en Apple Silicon la memoria unificada debe cubrir pesos más overhead del motor.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (la medición oficial se hizo en un Apple M4 Pro de 24 GB). Para el resto de puertos del proyecto, la referencia de velocidad se midió en H100 (FP8: 38,6 dec/s con concurrencia 16 y p50 de 29 ms con concurrencia 1).
- Cabe en GPU de consumo: la variante MLX está pensada para Mac con Apple Silicon; la variante GGUF Q5_K_M (3,2 GB) es la más ligera del proyecto para equipos con menos memoria.
- Opciones de despliegue: basal-serve con `--mode mlx` (motor propio, instalación vía `uv pip install "basal[mlx] @ https://github.com/rkinas/basal/archive/refs/tags/v2.5.5.tar.gz"`); los otros puertos del proyecto usan FP8 y GGUF (compatible con llama.cpp/Ollama, con límite de 20 opciones por pregunta en Ollama).
- Latencia y throughput: en Mac (M4 Pro) la variante MLX registra 278 ms p50 con concurrencia 1 y 698 ms para 5 preguntas. En H100, el puerto FP8 alcanza 38,6 decisiones/s con concurrencia 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-4.5B-MLX-8bit | 4,757B | 32.768 | Decisión tipada, pl/en | Apache-2.0 | Hugging Face (MLX) |
| basal-2.0-4.5B (bf16) | 4,757B | 32.768 | Decisión tipada, pl/en | Apache-2.0 | Hugging Face |
| basal-2.0-4.5B-FP8 | 4,757B | 32.768 | Decisión tipada, pl/en | Apache-2.0 | Hugging Face |
| speakleash/Bielik-4.5B-v3.0-Instruct | aproximadamente 4,5B | no disponible | Modelo instructivo generalista, pl/en | Apache-2.0 | Hugging Face |

La comparación con modelos de decisión de otros autores no está disponible en la información proporcionada. La alternativa más directa dentro del ecosistema es el propio Bielik-4.5B-v3.0-Instruct, del que basal-2.0 deriva pero del que se diferencia por la capa de decisión tipada y la calibración.

## Limitaciones y advertencias

- El conocimiento del mundo en polaco de un modelo de este tamaño es limitado; los hechos relevantes deben incluirse explícitamente en el estado de la decisión.
- Las reglas legales y normativas cambian con el tiempo; no deben asumirse como válidas sin verificación externa.
- La aritmética exacta y los umbrales numéricos son un punto débil de las decisiones de una sola pasada; conviene calcularlos en código o usar `"facts": "auto"`.
- La calibración es conservadora en tareas no vistas: ningún umbral del 1 % está certificado en los archivos incluidos, por lo que `"max_error": 0.01` en una pregunta `act` o `tool` aplaza todas las decisiones. Se recomienda usar 0,05 o certificar umbrales propios con `basal-calibrate`.
- Los modos `act` y `multi` con muchas etiquetas son experimentales.
- El límite es de 255 opciones por pregunta (20 en Ollama) y el contexto máximo es de 32.768 tokens.
- Los modelos 2.0 no incluyen cabeza de evidencias.
- Los conjuntos ocultos y de validación no cubren todos los dominios; es necesario validar sobre los documentos propios antes de confiar en el modelo.
- Las decisiones con consecuencias serias para personas deben ser revisadas por una persona.
- La calibración ajustada en bf16 no se traslada exactamente a un puerto cuantizado; en esta variante MLX se incluye un ajuste específico, pero su ECE en validación (0,0245) es superior al de la muestra de desarrollo.
- Licencia Apache-2.0: permite uso comercial, pero debe mantenerse la atribución a SpeakLeash y ACK Cyfronet AGH por el modelo base Bielik.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-4.5B-MLX-8bit
- README del repositorio: https://huggingface.co/Remek/basal-2.0-4.5B-MLX-8bit/blob/main/README.md
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20
- Modelo base basal-2.0-4.5B: https://huggingface.co/Remek/basal-2.0-4.5B
- Puerto FP8: https://huggingface.co/Remek/basal-2.0-4.5B-FP8
- Puerto GGUF: https://huggingface.co/Remek/basal-2.0-4.5B-GGUF
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de imágenes y audio (basal-omni, experimental): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base Bielik-4.5B-v3.0-Instruct: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
