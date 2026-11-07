# mradermacher/Yoshino2-1B-GGUF

## Resumen

Yoshino2-1B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Yoshino2-1B, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base, en5yme/Yoshino2-1B, es un modelo de razonamiento de aproximadamente 1.080 millones de parámetros (1B) afinado a partir de un modelo de mayor tamaño mediante destilación, según se desprende del dataset empleado (en5yme/Nemotron-Lightning-30B-A3B-Distill). Su propósito declarado es mejorar la capacidad de razonamiento del modelo base y llevar inteligencia de gran escala a modelos de borde (edge).

La relevancia de esta ficha radica en que ofrece el mismo modelo en múltiples niveles de cuantización (desde Q2_K hasta f16), lo que permite desplegarlo en hardware muy modesto, incluidas GPU de consumo e incluso CPU, manteniendo la licencia MIT del modelo original. El repositorio ocupa 10,0 GB e incluye 12 variantes de cuantización.

No se dispone de información sobre la longitud de contexto, la arquitectura interna ni los datos de entrenamiento más allá de lo indicado en la model card y el repositorio. Los datos que no constan se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer, inferido de la librería transformers; no confirmado en la información) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna del modelo base (número de capas, tipo de atención, dimensiones ocultas) en la información proporcionada. Por los tags del repositorio y el pipeline declarado, se trata de un modelo de la familia transformer compatible con la librería transformers. El modelo es un modelo de razonamiento afinado mediante destilación, según los tags `distillation` y `reasoning` y el dataset empleado, en5yme/Nemotron-Lightning-30B-A3B-Distill, lo que sugiere que se destiló conocimiento de un modelo mayor (Nemotron-Lightning-30B-A3B) hacia un modelo de 1B.

No consta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Las cuantizaciones de mradermacher son estáticas; según la model card, las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional (el repositorio incluye el tag `conversational`).
- Razonamiento: el modelo está específicamente afinado para mejorar la capacidad de razonamiento del modelo base.
- Destilación de un modelo mayor: hereda capacidades de un modelo de 30B (Nemotron-Lightning-30B-A3B) mediante destilación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Razonamiento en dispositivos de borde: gracias a su tamaño de 1B y a las cuantizaciones de 0,6-0,8 GB (Q2_K a Q4_K_M), puede ejecutarse en dispositivos con poca memoria, como móviles de gama alta o mini-PC, para tareas de razonamiento ligero.
- Asistentes conversacionales locales: el tag `conversational` y la licencia MIT permiten integrarlo en aplicaciones de chat que se ejecuten íntegramente en local, sin depender de servicios en la nube.
- Prototipado rápido en CPU: con llama.cpp u Ollama, las variantes Q4_K_S o Q4_K_M (0,8 GB) permiten probar pipelines de razonamiento en máquinas sin GPU.
- Filtrado y clasificación de texto en inglés: al estar entrenado solo en inglés, es adecuado para tareas de procesamiento de lenguaje natural en ese idioma, como resumen o extracción de información.
- Educación e investigación: su licencia MIT y su pequeño tamaño lo hacen útil como banco de pruebas para estudiar técnicas de destilación y razonamiento en modelos pequeños.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse en local, permite procesar datos sensibles sin enviarlos a terceros, siempre que el caso de uso esté en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: 0,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: 0,6-0,7 GB
  - Q4_K_S / Q4_K_M: 0,8 GB
  - Q5_K_S / Q5_K_M: 0,9 GB
  - Q6_K: 1,0 GB
  - Q8_0: 1,3 GB
  - f16: 2,3 GB
- GPU recomendadas: no disponible en la información. Por el tamaño, cualquier GPU de consumo con al menos 2-4 GB de VRAM libre puede alojar las cuantizaciones Q4-Q8; las variantes Q2-Q4 caben incluso en GPUs integradas con memoria compartida.
- ¿Cabe en GPU de consumo? Sí, todas las cuantizaciones caben en GPUs de consumo modernas; las más pequeñas (Q2_K a Q4_K_M) caben en entornos con muy poca memoria.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible en la información.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa. Como referencia de categoría, se trata de un modelo de razonamiento destilado de ~1B parámetros, comparable en tamaño a otros modelos pequeños de la familia Llama/Qwen, pero no se dispone de datos objetivos para comparar rendimiento, contexto ni licencia más allá de la licencia MIT de este modelo.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Yoshino2-1B | 1.080.632.832 | no disponible | MIT | GGUF / safetensors |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés (`language: en`); su rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo destilado de otro mayor, puede heredar sesgos del modelo profesor.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero conviene verificar los términos del modelo base (en5yme/Yoshino2-1B) y del dataset de destilación.
- Caveats para producción: no se dispone de información sobre contexto máximo, estabilidad en conversaciones largas ni rendimiento medido; las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad, y la model card advierte que Q3_K_M es de "lower quality".
- Las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, lo que puede afectar a la calidad relativa de algunas variantes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Yoshino2-1B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-1B
- GGUF del autor original: https://huggingface.co/en5yme/Yoshino2-1B-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Yoshino2-1B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
