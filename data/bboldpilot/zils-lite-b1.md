# bboldpilot/zils-lite-b1

## Resumen

Zils-lite-b1 es un reempaquetado del modelo analogalok/Qwen3.5-0.8B-AA-Decision, publicado por el usuario bboldpilot como "soup body" para la subred Zils (Bittensor SN127), pool d3-lite. No se trata de un entrenamiento nuevo: los pesos del modelo de lenguaje son los del modelo original, sin modificar, y el repositorio se limita a redistribuirlo bajo la misma licencia Apache 2.0, incluyendo los ficheros LICENSE y NOTICE originales. El modelo cuenta con 852.985.920 parámetros en formato safetensors y un tamaño de repositorio de 1,7 GB.

La relevancia de esta ficha es limitada desde el punto de vista del rendimiento: el autor no documenta arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados, y el repositorio no registra descargas ni interacciones. Su interés es principalmente operativo para quienes participan en la subred Zils, donde este artefacto actúa como cuerpo base sobre el que se construyen variantes del pool d3-lite.

La información disponible no permite caracterizar el modelo más allá de su procedencia y su empaquetado. Cualquier evaluación técnica rigurosa debería remitirse al modelo base original y a su model card, que no forma parte de los datos proporcionados en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen3.5-0.8B-AA-Decision) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en los datos proporcionados. El repositorio declara que los pesos de lenguaje son los del modelo analogalok/Qwen3.5-0.8B-AA-Decision en la revisión `b14cfd89da87f8213db18712b226eff25fa2fe3b`, sin modificaciones, y que el artefacto se publica como "soup body" para el pool d3-lite de la subred Zils (Bittensor SN127). No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado.

El único dato técnico verificable es el recuento de parámetros (852.985.920) y el tamaño del repositorio (1,7 GB). No se especifican innovaciones técnicas como decodificación especulativa, atención lineal ni mecanismos híbridos. Para conocer la arquitectura real habría que consultar el repositorio del modelo base, fuera del alcance de esta información.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma modo de razonamiento explícito (thinking mode), visión ni audio.
- La etiqueta "decision-model" del repositorio sugiere un uso orientado a toma de decisiones, pero no se aporta ninguna descripción funcional que lo respalde.

## Casos de uso

- Participación en la subred Zils (Bittensor SN127): el artefacto está pensado como cuerpo base del pool d3-lite, por lo que su uso previsto es servir de punto de partida para variantes dentro de esa subred.
- Reempaquetado y redistribución: al conservar la licencia Apache 2.0 y los ficheros LICENSE/NOTICE, puede redistribuirse en infraestructuras propias o espejos internos sin fricción legal.
- Base para ajuste fino experimental: con 852 millones de parámetros y pesos en safetensors, es manejable para experimentos de fine-tuning en un único acelerador, aunque no se documentan recetas ni resultados.
- Evaluación comparativa del modelo base: al ser un espejo sin cambios de pesos, puede emplearse para verificar la reproducibilidad del modelo original en distintos entornos.
- Integración en pipelines de investigación sobre Bittensor: útil para quienes necesitan un artefacto con licencia permisiva y procedencia trazable dentro del ecosistema de subredes.
- Docencia y prototipado de bajo coste: el tamaño reducido permite desplegarlo en hardware de gama media para pruebas conceptuales, siempre que se validen las capacidades reales contra el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el recuento de parámetros (852.985.920), en fp16 requeriría aproximadamente 1,7 GB solo para pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 0,9 GB y 0,5 GB respectivamente, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar el modelo en cuantización, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: probable por el tamaño, pero no confirmada en la documentación.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-b1 (este) | 852.985.920 | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| analogalok/Qwen3.5-0.8B-AA-Decision | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Alternativas de ~0,8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay arquitectura, contexto, idiomas ni benchmarks publicados en el repositorio.
- Procedencia indirecta: es un reempaquetado de un modelo de terceros; los méritos y defectos son los del modelo base, no los de este artefacto.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que impide inferir validación por parte de la comunidad.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; deben asumirse los del modelo base, que tampoco se detallan aquí.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y los ficheros LICENSE/NOTICE incluidos.
- Idoneidad para producción no demostrada: no hay métricas, ni pruebas de latencia, ni guías de despliegue.
- Nombre y etiquetas ("soup body", "decision-model") no equivalen a una descripción funcional; no deben interpretarse como garantía de capacidades específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bboldpilot/zils-lite-b1
- Modelo base: https://huggingface.co/analogalok/Qwen3.5-0.8B-AA-Decision
- Revisión del modelo base citada: `b14cfd89da87f8213db18712b226eff25fa2fe3b`
- Subred Zils (Bittensor SN127): no se proporciona enlace en la información disponible.
