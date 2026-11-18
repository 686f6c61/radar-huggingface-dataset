# DICPlay/RusMind-3.5.1-Momentum

## Resumen

RusMind 3.5.1 Momentum es un modelo de lenguaje conversacional especializado en ruso e inglés, desarrollado por DICPlay como parte de la familia RusMind de "IA nacional" rusa. Se trata de un fine-tuning del modelo base google/gemma-4-E2B-it, distribuido exclusivamente en formato GGUF y optimizado para inferencia local sin conexión en dispositivos de consumo (teléfonos, portátiles y PC convencionales). El modelo declara 4.647.450.147 parámetros totales según los pesos en safetensors reportados en el repositorio.

La propuesta del modelo es ofrecer respuestas competentes en ruso con un conocimiento explícito de historia, cultura, legislación, regiones y "valores familiares tradicionales" de Rusia, manteniendo un tamaño reducido que permita su ejecución on-device mediante llama.cpp, LM Studio, Ollama o PocketPal. La model card promociona activamente versiones posteriores de la familia (RusMind 4.7 Momentum, Sokol 4.7 y Vspyshka 4.7) y recomienda migrar a ellas.

El modelo resulta relevante para desarrolladores que necesiten un asistente en ruso que funcione en hardware modesto y sin conectividad, con cuantizaciones desde 2,5 GB (Lite) hasta 9,3 GB (BF16). Su licencia es propietaria ("rusmind-license") y no equivale a una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tuning de google/gemma-4-E2B-it; arquitectura del base no especificada en la información) |
| Parámetros totales | 4.647.450.147 (según safetensors reportados) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Lite (2,5 GB), Q4_K_M (3,4 GB), Q8_0 (5,0 GB), BF16 (9,3 GB) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propietaria, etiquetada como "other") |
| Formato de pesos | GGUF (único formato distribuido) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo es un fine-tuning (base_model_relation: finetune) del checkpoint google/gemma-4-E2B-it, cuya arquitectura concreta no se describe en la model card. El tamaño de los pesos en BF16 (9,3 GB) es coherente con un modelo de aproximadamente 4,6 mil millones de parámetros, si bien la relación entre el nombre comercial "E2B" del modelo base y el recuento de parámetros reportado no se aclara en la información disponible.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card menciona únicamente que la versión 3.5.1 mejora la calidad de respuesta en ruso e inglés, la ejecución precisa de tareas (completado de código, preguntas cortas por patrón) y refuerza la adhesión a "valores familiares tradicionales y la legislación de Rusia", lo que sugiere un ajuste de comportamiento deliberado en esa dirección. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Respuesta a preguntas sobre historia, cultura, legislación, regiones y pueblos de Rusia.
- Completado de código y resolución de tareas de instrucción según la model card ("дописывает код, понимает короткие вопросы по образцу").
- Ejecución de instrucciones y patrones de pregunta corta.
- Ejecución local sin conexión a internet (on-device, offline).
- Integración con herramientas compatibles con GGUF: llama.cpp, LM Studio, Ollama, PocketPal y uso directo en navegador vía rusmind.ru.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking mode), visión o audio: no disponible en la información proporcionada (el modo de razonamiento se atribuye a otras variantes de la familia, no a este modelo).

## Casos de uso

- Asistente conversacional offline en ruso: el modelo puede desplegarse con llama.cpp o LM Studio en un portátil sin conexión y mantener diálogos en ruso con conocimiento contextual de cultura y legislación rusa, gracias a su ajuste específico sobre esos dominios.
- Atención al cliente en ruso en entornos con conectividad limitada: adecuado para terminales o quioscos con hardware modesto, ejecutando la cuantización Q4_K_M (3,4 GB) en CPU o GPU de gama baja.
- Asistencia educativa sobre historia y geografía de Rusia: útil para aplicaciones didácticas que requieran respuestas en ruso sobre regiones, pueblos y eventos históricos, con la advertencia de verificar datos factuales por riesgo de alucinación.
- Generación y autocompletado de código en ruso/inglés: la model card indica capacidad de completar código; puede integrarse en editores o scripts de automatización mediante llama.cpp para tareas de completado simples.
- Procesamiento de texto en dispositivos móviles: con la cuantización Lite (2,5 GB) puede ejecutarse en teléfonos mediante PocketPal u otras apps GGUF, para resúmenes, respuestas y clasificación de texto en ruso.
- Prototipado rápido de aplicaciones de IA en ruso: al no requerir GPU dedicada ni conexión, sirve para validar flujos conversacionales y de instrucción antes de migrar a modelos mayores de la familia (4.7 Sokol o Vspyshka).
- Despliegue en entornos aislados (air-gapped): instituciones que no pueden enviar datos a la nube pueden ejecutar el modelo íntegramente en local con los pesos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este modelo concreto (RusMind 3.5.1 Momentum) en la información disponible. La model card incluye puntuaciones MERA v2 únicamente para otras variantes de la familia (RusMind 4.7 Momentum, Sokol 4.7 y Vspyshka 4.7), no para la versión 3.5.1, por lo que no se reproducen aquí para evitar atribuciones incorrectas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Lite ~2,5 GB; Q4_K_M ~3,4 GB; Q8_0 ~5,0 GB; BF16 ~9,3 GB (más overhead del runtime de llama.cpp).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4-6 GB de VRAM puede ejecutar Q4_K_M o Q8_0 (por ejemplo, RTX 3050/3060, GTX 1660). Para BF16 se recomienda 10-12 GB de VRAM (RTX 3060 12 GB, RTX 4070) o ejecución en CPU con suficiente RAM.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0; BF16 requiere GPU de gama media o CPU con 12 GB+ de RAM.
- Opciones de despliegue: llama.cpp (llama-cli con `-cnv`), LM Studio, Ollama, PocketPal y navegador vía rusmind.ru.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RusMind 3.5.1 Momentum | 4,65 B (reportados) | No disponible | rusmind-license (propietaria) | GGUF | Fine-tuning de Gemma 4 E2B; ruso/inglés; on-device |
| RusMind Vspyshka 4.7 | 7,5 B | No disponible | No disponible | GGUF y pesos completos | 0,191 en MERA v2 según la model card; sucesor recomendado en la misma línea on-device |
| T-lite (T-Bank) | 8 B | No disponible | No disponible | No disponible | 0,130 en MERA v2 según la model card de RusMind |
| Gemma 4 E4B (Google) | 8 B | No disponible | No disponible | No disponible | 0,170 en MERA v2 según la model card de RusMind |

Los datos de MERA v2 de la tabla provienen de la model card del autor y no han sido verificados de forma independiente. No se dispone de comparativas directas del modelo 3.5.1 con alternativas de su mismo tamaño.

## Limitaciones y advertencias

- Licencia propietaria ("rusmind-license"): no es una licencia open source estándar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación: como todo modelo de 4-5 B, puede generar datos históricos, legales o factuales incorrectos; no debe usarse como fuente jurídica sin verificación.
- Sesgo deliberado: la model card declara explícitamente un ajuste hacia "valores familiares tradicionales y la legislación de Rusia", lo que puede introducir sesgos ideológicos y limitar la neutralidad en temas sociales, políticos o legales.
- Idiomas limitados a ruso e inglés; no se garantiza calidad en castellano ni en otras lenguas.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas sin verificación previa.
- Solo se distribuye en GGUF: no hay pesos en safetensors para fine-tuning o investigación de arquitectura, pese a que el repositorio reporta un recuento de parámetros vía safetensors.
- La model card redirige a versiones posteriores (4.7); la 3.5.1 puede quedar sin mantenimiento.
- Sin datos de benchmarks propios ni de latencia/throughput: difícil estimar rendimiento en producción sin pruebas locales.
- No se documentan capacidades de tool calling ni de agente, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum
- Repositorio de la familia Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo en navegador: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- RusMind 4.7 Momentum: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
