# BachDaThan/Qwen2.5-Coder-7B-Vietnamese-LoRA-GGUF

## Resumen

Qwen2.5-Coder-7B-Vietnamese-LoRA-GGUF es un modelo de lenguaje de 7.615.616.512 parámetros derivado de Qwen2.5-Coder-7B-Instruct, al que se le ha aplicado un adaptador LoRA entrenado específicamente en vietnamita por khoin68. El resultado ha sido fusionado y cuantizado a GGUF por BachDaThan, lo que permite ejecutarlo en local con llama.cpp u Ollama. La arquitectura es un transformer decoder-only tipo qwen2 con 28 capas, hidden size de 3.584, 28 cabezas de atención y 4 cabezas KV, con una ventana de contexto de 32.768 tokens.

El modelo está pensado para tareas de generación de código y conversación en vietnamita, manteniendo también el inglés, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer una versión cuantizada lista para usar en hardware de consumo, sin necesidad de GPUs de gama alta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S (formato GGUF) |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado; el modelo base original usa safetensors en bfloat16) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de la familia Qwen2.5. Según la información de la model card, la arquitectura presenta 28 capas, hidden size de 3.584, 28 cabezas de atención y 4 cabezas KV, con un vocabulario de 152.064 tokens y una longitud de contexto de 32.768 tokens.

El entrenamiento consistió en la aplicación de un adaptador LoRA (khoin68/Qwen2.5-Coder-7B-Vietnamese-LoRA) sobre el modelo base, aparentemente para adaptarlo al vietnamita. Posteriormente, el adaptador se fusionó con el modelo base y se cuantizó a GGUF. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO, por lo que estos datos no están disponibles.

## Capacidades

- Generación de texto y código en vietnamita e inglés, con especialización en tareas de programación.
- Razonamiento básico y conversación multi-turno, gracias al template de chat de Qwen2.5 (ChatML).
- Ventana de contexto de 32.768 tokens, adecuada para manejar fragmentos de código largos o conversaciones extensas.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-Coder-7B-Instruct incluye esta capacidad, pero no se confirma en esta versión.
- Capacidades multilingües: vietnamita e inglés. El rendimiento en vietnamita es el objetivo principal del adaptador LoRA.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Asistente de programación en vietnamita: para desarrolladores que quieran generar, revisar o explicar código en su idioma. El modelo puede integrarse en un IDE o en un chat local mediante llama.cpp, y su ventana de contexto permite trabajar con archivos completos.
- Soporte técnico bilingüe: empresas con usuarios vietnamitas e ingleses pueden desplegarlo como chatbot de atención al cliente. La cuantización Q4_K_M reduce la VRAM a ~6,4 GB, lo que permite ejecutarlo en servidores modestos o en estaciones de trabajo.
- Documentación de código: el modelo puede generar comentarios, docstrings y documentación técnica en vietnamita a partir de código fuente, lo que facilita el mantenimiento de proyectos en equipos vietnamitas.
- Traducción técnica: al estar entrenado con código y adaptado al vietnamita, puede traducir textos técnicos y comentarios de código entre inglés y vietnamita, manteniendo el contexto del código.
- Tutor educativo de programación: instituciones o plataformas de formación pueden usarlo para responder preguntas de estudiantes en vietnamita, explicar algoritmos y corregir ejercicios. La baja VRAM permite ejecutarlo en laboratorios con GPUs de consumo.
- Refactorización de código legacy: el modelo puede analizar código existente y sugerir mejoras o refactorizaciones, con explicaciones en vietnamita. La ventana de 32.768 tokens permite procesar módulos completos sin dividir el código en fragmentos pequeños.
- Integración en pipelines de CI/CD: gracias a su formato GGUF y a la compatibilidad con llama.cpp, puede desplegarse como servicio local para generar pruebas unitarias o revisar pull requests en entornos sin conexión a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~6,4 GB; Q4_K_S ~6,2 GB; Q3_K_M ~5,5 GB; Q3_K_S ~5,3 GB (según la model card).
- GPU recomendadas: tarjetas de consumo con 8 GB de VRAM o más, como RTX 3060, RTX 4060, RTX 4070. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama. El modelo es compatible con el pipeline de text-generation de Hugging Face y con endpoints compatibles (según las tags del repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos técnicos completos para comparar este modelo con alternativas de la misma categoría. Los modelos más cercanos encontrados en la búsqueda son khoin68/Qwen2.5-Coder-7B-Vietnamese-GGUF y khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-GGUF, ambos derivados del mismo base Qwen2.5-Coder-7B-Instruct con adaptaciones LoRA para vietnamita. Sin información detallada de sus parámetros, contexto o rendimiento, no es posible establecer una comparativa cuantitativa. El modelo analizado se distingue por incluir cuantizaciones GGUF con tamaños de archivo de 3,25 a 4,36 GB y una licencia Apache 2.0.

## Limitaciones y advertencias

- Riesgo de alucinación: la model card advierte explícitamente que el modelo puede generar información incorrecta, por lo que no debe usarse como sustituto de asesoramiento profesional en áreas críticas.
- Sesgos: no se han documentado sesgos específicos; al estar entrenado con un dataset vietnamita no especificado, puede presentar sesgos culturales o lingüísticos no evaluados.
- Limitaciones de idioma: el rendimiento en inglés puede degradarse respecto al modelo base, ya que el adaptador LoRA está enfocado en vietnamita.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No se han identificado restricciones adicionales en la model card.
- Caveat para producción: no se han publicado benchmarks ni evaluaciones de seguridad, por lo que se recomienda validar el modelo en el dominio de uso antes de desplegarlo en entornos productivos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BachDaThan/Qwen2.5-Coder-7B-Vietnamese-LoRA-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct
- Adaptador LoRA: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-LoRA
- Modelo relacionado: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-GGUF
- Modelo relacionado: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-GGUF
