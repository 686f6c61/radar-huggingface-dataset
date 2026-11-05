# ModernoTech/Nova-Velocity-pre-direct-transfer-docs

## Resumen

Nova-Velocity-pre-direct-transfer-docs es una variante del modelo Qwen3-30B-A3B de Alibaba, publicada por el usuario ModernoTech y derivada a su vez del trabajo de DavidAU (Qwen3-30B-A1.5B-High-Speed). Se trata de un transformer de tipo Mixture of Experts (MoE) con 30.532.122.624 parámetros totales, en el que se ha reducido el número de expertos activados por token de 8 a 4 sobre un total de 128 expertos, lo que rebaja los parámetros activos a aproximadamente 1.500 millones.

El objetivo declarado es doble: por un lado, casi duplicar la velocidad de inferencia respecto al Qwen3-30B-A3B original manteniendo un comportamiento funcional aceptable en tareas rutinarias; por otro, extender la ventana de contexto hasta 64K tokens (65.535) mediante escalado YaRN, frente a los 32K del modelo base. Los cuantizados GGUF publicados incorporan un dataset Imatrix propio ("NEO Imatrix") desarrollado por el autor.

Es relevante ahora porque demuestra una vía práctica de ajuste de MoE a nivel de expertos activos para despliegues con restricciones de cómputo: el modelo puede ejecutarse tanto en GPU como únicamente en CPU/RAM, y el autor reporta incrementos de throughput notables (de 12 a 23 t/s en CPU con Q4KS, y de 75 a más de 125 t/s en GPU con IQ3S en tarjetas de gama media-baja). La ficha se basa exclusivamente en la información disponible en HuggingFace; no hay benchmarks formales publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3 (qwen3_moe) |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | Aproximadamente 1.500 millones (4 de 128 expertos activados) |
| Longitud de contexto | 64K (65.535 tokens) en los GGUF NEO Imatrix, mediante YaRN; base original 32K |
| Tipos de cuantización | GGUF: IQ1_M, IQ2, IQ3_S/M, IQ4_XS/NL, Q2_K, Q3_K_S, Q4, Q5, Q6, Q8; pesos en bfloat16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de la familia Qwen3 con 128 expertos por capa y enrutamiento automático dependiente del contenido del prompt. La modificación principal respecto al Qwen3-30B-A3B original consiste en fijar la activación en 4 expertos por token en lugar de 8, lo que reduce los parámetros activos de unos 3.000 a unos 1.500 millones. Según el autor, esta configuración "casi duplica" la velocidad y no produjo pérdida de función apreciable en pruebas rutinarias, aunque no extensivas; para casos complejos recomienda las variantes con 12, 16 o 24 expertos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable está en el proceso de cuantización: los GGUF se generaron con un dataset Imatrix propio ("NEO Imatrix", desarrollado tras evaluar más de 50 datasets Imatrix) y con cambios recientes de llama.cpp (a partir de la build B5127, abril de 2025) para personalizar la estructura del cuantizado. Los cuantizados NEO Imatrix extienden el contexto a 64K mediante YaRN. El modelo admite plantilla Jinja o ChatML y bloques de razonamiento delimitados por etiquetas `<think>`.

## Capacidades

- Generación de texto conversacional y creativo: escritura de ficción, relatos y roleplay, con etiquetas específicas para SillyTavern y LM Studio.
- Razonamiento profundo y resolución de problemas: el modelo genera bloques de pensamiento propios (deep thinking, deep reasoning) y admite un rol de sistema opcional para forzar cadenas de razonamiento largas.
- Tool calling y uso de herramientas (tool use, function calling), según las etiquetas del repositorio.
- Razonamiento multi-paso y flujos de agente, derivados de las capacidades del Qwen3 base.
- Multilingüismo amplio: 24 idiomas declarados, incluidos español, inglés, francés, alemán, portugués, italiano, chino, japonés, coreano, ruso, árabe, hindi y vietnamita, entre otros.
- Contexto largo de 64K tokens en los cuantizados NEO Imatrix, útil para documentos extensos y conversaciones multi-turno.
- Ejecución flexible en GPU, CPU o mixta GPU/CPU gracias a la estructura MoE con activación parcial.

## Casos de uso

- Atención al cliente automatizada: con 64K tokens de contexto puede mantener conversaciones multi-turno largas y recuperar información de historiales extensos, y su bajo número de parámetros activos reduce el coste por token en despliegues con muchas peticiones concurrentes.
- Generación de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletado, revisión de parches o generación de tests, con latencia más cercana a la de un modelo de 1,5B que a la de un 30B denso.
- Asistentes de escritura creativa y roleplay: orientado a ficción, todos los géneros y personajes, encaja en aplicaciones tipo SillyTavern o LM Studio para narrativa interactiva con contexto largo.
- Razonamiento profundo en entornos con recursos limitados: el modo de pensamiento con etiquetas `<think>` permite tareas de análisis y resolución de problemas en estaciones de trabajo sin GPU de gama alta, ya que el modelo puede correr solo en CPU/RAM.
- Procesamiento de documentos largos: informes, contratos o expedientes de hasta 64K tokens pueden analizarse en una sola pasada sin fragmentación, útil para extracción de información y resumen.
- Despliegue en local para prototipado y pruebas de concepto: la disponibilidad de cuantizados desde IQ1_M hasta Q8 permite ajustar el equilibrio calidad/velocidad/memoria en portátiles, workstations y servidores modestos.
- Asistencia multilingüe: con 24 idiomas declarados, sirve para traducción asistida, resumen y atención en español, inglés, francés, alemán, portugués, chino, árabe o hindi dentro de una misma aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de throughput comparativas entre el modelo original y esta variante:

| Escenario | Modelo original (8 expertos) | Esta variante (4 expertos) |
|---|---|---|
| CPU solo, Q4KS, Windows 11 | 12 t/s | 23 t/s |
| GPU gama media-baja, IQ3S | 75 t/s | más de 125 t/s |

Según el autor, la velocidad por token en GPU se aproxima a la de un modelo "normal" de 1,5B y puede ser de 4 a 8 veces superior a la de ejecución solo en CPU. No se dispone de datos de calidad medidos con benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del cuantizado. Los cuantizados IQ1/IQ2 ocupan del orden de 5-10 GB, IQ3/IQ4 en torno a 15-20 GB, Q5/Q6 alrededor de 20-25 GB y Q8 cerca de 30-32 GB; los pesos en bfloat16 requieren aproximadamente 61 GB.
- GPU recomendadas: para cuantizados altos, A100 40/80 GB o H100; para IQ3/IQ4, RTX 4090 (24 GB) o A6000; los cuantizados IQ1/IQ2 pueden caber en tarjetas de 8-12 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantizados IQ3/IQ4, y en tarjetas de 8-12 GB con cuantizados IQ1/IQ2. También puede ejecutarse solo en CPU/RAM, opción para la que el autor indica que los cuantizados "Q" suelen ser más rápidos que los "IQ".
- Opciones de despliegue: llama.cpp (build B5127 o posterior recomendada), LM Studio (permite seleccionar de 1 a 128 expertos; mínimo 4, y 8 o más sugeridos para IQ1/IQ2), Ollama y transformers con safetensors. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: 23 t/s en CPU solo con Q4KS y más de 125 t/s en GPU de gama media-baja con IQ3S, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova-Velocity (esta ficha) | 30,5B / ~1,5B (4 de 128 expertos) | 64K (GGUF NEO Imatrix) | no disponible | HuggingFace (ModernoTech) |
| Qwen3-30B-A3B (original) | 30,5B / ~3B (8 de 128 expertos) | 32K (ampliable con YaRN) | Apache 2.0 según el modelo base de Qwen; verificar en el repositorio original | HuggingFace (Qwen) |
| DavidAU/Qwen3-30B-A4.5B-12-Cooks | 30,5B / ~4,5B (12 expertos) | no disponible en la información | no disponible | HuggingFace (DavidAU) |
| DavidAU/Qwen3-30B-A7.5B-24-Grand-Brainstorm | 30,5B / ~7,5B (24 expertos) | no disponible en la información | no disponible | HuggingFace (DavidAU) |

No se dispone de datos de rendimiento comparativo en benchmarks entre estas variantes; la comparación se limita a parámetros activos, contexto y disponibilidad.

## Limitaciones y advertencias

- La reducción a 4 expertos activos puede degradar el rendimiento en tareas complejas; el propio autor recomienda las variantes de 12, 16 o 24 expertos para casos exigentes y advierte que sus pruebas de pérdida de función fueron rutinarias, no extensivas.
- No hay benchmarks publicados que respalden la calidad del modelo; las afirmaciones de rendimiento son del autor y no verificadas de forma independiente.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; debe verificarse en el repositorio del modelo base de Qwen y en el del autor de la variante.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta ficha.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3, hereda los sesgos de sus datos de entrenamiento, no especificados aquí.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-05), lo que sugiere que no ha pasado por validación de la comunidad.
- El contexto de 64K depende de la configuración YaRN en los GGUF NEO Imatrix; en otros formatos o configuraciones puede limitarse a 32K.
- Los cuantizados de muy baja precisión (IQ1_M, IQ2) pueden degradar notablemente la calidad; el autor sugiere usar 8 o más expertos en esos casos.
- Requiere llama.cpp reciente (B5127 o posterior) para aprovechar las optimizaciones de cuantización; versiones antiguas pueden no cargar correctamente los GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ModernoTech/Nova-Velocity-pre-direct-transfer-docs
- Modelo base directo: https://huggingface.co/DavidAU/Qwen3-30B-A1.5B-High-Speed
- Modelo original Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio maestro de cuantizados del autor: https://huggingface.co/DavidAU/Qwen3-128k-30B-A3B-NEO-MAX-Imatrix-gguf
- Variante de 12 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A4.5B-12-Cooks
- Variante de 16 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A6B-16-Extreme
- Variante de 16 expertos con 128K de contexto: https://huggingface.co/DavidAU/Qwen3-30B-A6B-16-Extreme-128k-context
- Variante de 24 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A7.5B-24-Grand-Brainstorm
