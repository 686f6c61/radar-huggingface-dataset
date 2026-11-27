# DICPlay/RusMind-Vspyshka

## Resumen

RusMind-Vspyshka (RusMind · Вспышка) es un modelo de lenguaje de tipo texto generativo desarrollado por DICPlay, un equipo ruso que publica modelos orientados a inferencia local y sin conexión. Se trata de un ajuste fino supervisado del modelo base google/gemma-4-E4B-it, del que hereda la arquitectura y el tokenizador, y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles (LM Studio, Ollama, etc.). Con 7.518.069.290 parámetros totales, está pensado para ejecutarse en ordenadores potentes y teléfonos de gama alta sin necesidad de conexión a internet.

El modelo está especializado en ruso e inglés y su propuesta de valor es el rendimiento en tareas rusófonas: el autor lo sitúa en el puesto número 2 entre todos los modelos de hasta 10.000 millones de parámetros en el benchmark MERA v2 (puntuación 0,191), solo por detrás de otro modelo de la misma familia (RusMind Sokol 4.7). La model card destaca que supera a alternativas de mayor tamaño en varias subcategorías, como razonamiento (0,385) y tareas centradas en personas (0,257).

La relevancia actual del modelo reside en su orientación a despliegue on-device y offline, con cuantizaciones que van desde 3,8 GB (versión Mini) hasta 8,0 GB (Q8_0), y en la publicación de múltiples versiones (4.5 y 4.7). La licencia es propietaria (rusmind-license), lo que condiciona su uso comercial y organizativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-E4B-it; detalles no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mini (3,8 GB), Lite (4,2 GB), Q2_K, Q3_K, Q4_K_M (5,3 GB), Q5_K, Q6_K, Q8_0 (8,0 GB), BF16 (15,1 GB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (propietaria, license_name: rusmind-license) |
| Formato de pesos | GGUF (librería gguf); BF16 disponible en la versión 4.5 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del modelo base google/gemma-4-E4B-it, por lo que su arquitectura subyacente corresponde a la familia Gemma 4 de Google. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica la relación de base_model: finetune y que el modelo se distribuye en formato GGUF optimizado para llama.cpp.

La innovación destacable no está en la arquitectura, sino en el proceso de ajuste orientado a ruso y en la optimización para inferencia local: el autor publica varias cuantizaciones (desde Mini de 3,8 GB hasta BF16 de 15,1 GB) y versiones sucesivas (4.5 y 4.7), con una mejora declarada del +18 % en el balón general de MERA v2 respecto a la versión 4.5. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de pensamiento explícitos en esta variante (el modo de razonamiento se atribuye a RusMind Sokol 4.7, no a Vspyshka).

## Capacidades

- Generación de texto conversacional en ruso e inglés, con soporte multi-turno.
- Razonamiento y lógica: puntuación de 0,385 en la sección de razonamiento de MERA v2.
- Corrección ortográfica y de puntuación: 0,719 en SAGE (0,760 en signos de puntuación).
- Respuestas desde el punto de vista de personajes (role-play): 0,537 en Characters.
- Desambiguación semántica y relaciones léxicas: 0,465 en LIMUR y 0,373 en Enantiosemy.
- Conocimiento de cultura y regiones de Rusia: 0,228 en MERA v2.
- Comprensión de personas y tareas humanocéntricas: 0,257.
- Tool calling / function calling: 0,302 en GorillaHard, con selección correcta de herramienta en el 86 % de los casos y resistencia del 100 % a la sustitución de instrucciones.
- Seguimiento de instrucciones complejas: 0,300 en IFHard.
- Comprensión del humor: 0,196 en Humor.
- Ejecución local y sin conexión (on-device, offline) mediante llama.cpp.

## Casos de uso

- Asistencia conversacional en ruso sin conexión: el modelo puede gestionar diálogos multi-turno en dispositivos locales, útil en entornos con conectividad limitada o requisitos de privacidad, al no requerir envío de datos a la nube.
- Corrección y edición de textos en ruso: con una puntuación de 0,719 en SAGE y 0,760 en puntuación, es adecuado para tareas de revisión ortográfica y de puntuación en flujos editoriales o de publicación.
- Atención al cliente automatizada en ruso: su capacidad de tool calling (86 % de selección correcta de herramienta) permite integrarlo en sistemas que consultan APIs o bases de datos para resolver consultas de usuarios.
- Generación de código y asistencia técnica: aunque no se detallan benchmarks de código, el modelo base Gemma 4 y el soporte de instrucciones complejas (IFHard 0,300) permiten su uso como asistente de programación en entornos de desarrollo locales.
- Aplicaciones educativas y de tutoría: su rendimiento en razonamiento (0,385) y en tareas de comprensión permite explicar conceptos y resolver problemas paso a paso en ruso, sin depender de servicios externos.
- Role-play y generación de personajes: con 0,537 en Characters, es adecuado para videojuegos, narrativa interactiva o chatbots con personalidad definida.
- Procesamiento de documentación con conocimiento cultural ruso: su puntuación de 0,228 en cultura y regiones de Rusia lo hace útil para tareas de localización y adaptación cultural de contenidos.
- Despliegue en dispositivos de gama alta: las cuantizaciones Mini (3,8 GB) y Lite (4,2 GB) permiten ejecutarlo en teléfonos y portátiles con recursos limitados, habilitando asistentes personales offline.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (octubre de 2026) y de la model card del autor.

| Benchmark / seccion | RusMind Vspyshka (7,5 B) | Qwen3.5-9B (9 B) | Gemma 4 E4B (8 B) | T-lite (8 B) | A-Vibe (8 B) |
|---|---|---|---|---|---|
| Balón general MERA v2 | 0,191 | 0,186 | 0,170 | 0,130 | 0,113 |
| Razonamiento | 0,385 | 0,339 | 0,367 | 0,218 | 0,187 |
| Tareas humanocéntricas | 0,257 | 0,218 | 0,172 | 0,169 | 0,132 |
| Cultura y regiones de Rusia | 0,228 | 0,118 | 0,199 | 0,196 | 0,171 |

| Comparativa con modelos mayores | RusMind Vspyshka (7,5 B) | RuadaptQwen3-32B (32 B) | Zero-Mistral (24 B) |
|---|---|---|---|
| Balón general | 0,191 | 0,163 | 0,160 |
| Razonamiento | 0,385 | 0,342 | 0,213 |
| Comprensión de personas | 0,257 | 0,177 | 0,235 |

| Tarea especifica (MERA v2) | Puntuacion |
|---|---|
| SAGE (ortografía y puntuación) | 0,719 |
| Characters (role-play) | 0,537 |
| LIMUR (relación palabra-texto) | 0,465 |
| Enantiosemy (antónimos) | 0,373 |
| NewReasoning (lógica) | 0,330 |
| RUBIN (elección múltiple) | 0,328 |
| GorillaHard (tool calling) | 0,302 |
| IFHard (instrucciones complejas) | 0,300 |
| Humor | 0,196 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otros benchmarks estándar internacionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para la cuantización Mini (3,8 GB) y Lite (4,2 GB); en torno a 6-7 GB para Q4_K_M (5,3 GB); unos 9-10 GB para Q8_0 (8,0 GB); y alrededor de 16-18 GB para BF16 (15,1 GB), considerando overhead de contexto y memoria del runtime.
- GPU recomendadas: para BF16, GPU de 24 GB o más (RTX 3090/4090, A100, H100). Para Q8_0, GPU de 12-16 GB (RTX 4070 Ti, RTX 4080). Para Q4_K_M, GPU de 8 GB (RTX 3060 Ti, RTX 4060). Para Mini/Lite, GPU de 6 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4080 y RTX 4090, dependiendo de la cuantización. Las versiones Mini y Lite pueden ejecutarse en CPU y en teléfonos de gama alta.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), LM Studio, Ollama, y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 (general) | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 B | no disponible | 0,191 | rusmind-license (propietaria) | GGUF |
| Qwen3.5-9B (Alibaba) | 9 B | no disponible | 0,186 | no disponible | no disponible |
| Gemma 4 E4B (Google) | 8 B | no disponible | 0,170 | no disponible | no disponible |
| T-lite (T-Bank) | 8 B | no disponible | 0,130 | no disponible | no disponible |
| A-Vibe (Avito) | 8 B | no disponible | 0,113 | no disponible | no disponible |

RusMind Vspyshka lidera el grupo de modelos de hasta 10.000 millones de parámetros en MERA v2 según los datos del autor, con ventaja en razonamiento (0,385) y tareas humanocéntricas (0,257), aunque queda por detrás de Gemma 4 E4B en cultura y regiones de Rusia (0,199 frente a 0,228). Frente a modelos mayores como RuadaptQwen3-32B y Zero-Mistral, mantiene ventaja en balón general y razonamiento pese a tener la mitad o un tercio de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al estar entrenado principalmente para ruso, puede presentar sesgos culturales y lingüísticos propios del corpus de ajuste.
- Riesgo de alucinación: no se cuantifica en la model card; como todo modelo generativo, puede producir información incorrecta, especialmente en tareas de conocimiento factual fuera de su dominio.
- Limitaciones de contexto e idioma: solo se declaran ruso e inglés; no se especifica la longitud de contexto, lo que impide garantizar un rendimiento óptimo en documentos largos. El rendimiento en otros idiomas no está evaluado.
- Restricciones de licencia: la licencia rusmind-license es propietaria y requiere contacto con el autor para uso organizativo (se indica contacto por Telegram y MAX). Es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Caveat para producción: el modelo se distribuye exclusivamente en GGUF, orientado a llama.cpp; no se ofrecen pesos en safetensors para esta variante, lo que limita su integración en pipelines que requieran vLLM o TGI. Las versiones publicadas (4.5 y 4.7) pueden diferir en rendimiento, y la model card recomienda la 4.7.
- El modo de razonamiento explícito se atribuye a RusMind Sokol 4.7, no a Vspyshka; no debe asumirse que esta variante incluya cadenas de pensamiento nativas.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Versión 4.7 (cuantizaciones completas): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo relacionado RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo / prueba en línea: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Licencia: https://huggingface.co/DICPlay/RusMind-Vspyshka/blob/main/LICENSE
