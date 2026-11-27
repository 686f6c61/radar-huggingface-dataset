# DICPlay/RusMind-3.5-Vspyshka

## Resumen

RusMind 3.5 · Vspyshka (Вспышка, "destello" en ruso) es un ajuste fino del modelo google/gemma-4-E4B-it desarrollado por DICPlay, orientado a inferencia local y sin conexión en ruso e inglés. Se distribuye exclusivamente en formato GGUF con cinco variantes de cuantización que van de 3,8 GB a 15,1 GB, lo que lo sitúa en el rango de equipos de consumo: desde teléfonos de gama alta hasta estaciones de trabajo con GPU dedicada. El modelo base es un transformer de aproximadamente 7.500 millones de parámetros según los pesos en safetensors publicados.

El objetivo declarado por el autor es ofrecer un asistente "nacional" en ruso que cubra escritura, explicaciones, ayuda académica y generación de código sin depender de la nube. La model card destaca competencias específicas en historia y legislación rusas, cultura regional y ejecución de instrucciones complejas, además de soporte de llamada a herramientas. El modelo se presenta como segunda versión de la familia Vspyshka en el benchmark MERA v2 (puntuación 0,191), por detrás de RusMind Sokol 4.7 y por delante de modelos bastante mayores en parámetros.

La relevancia actual del modelo radica en su posicionamiento: un ajuste fino pequeño, cuantizado y ejecutable en local que compite en un benchmark regional con alternativas de 24 a 32 mil millones de parámetros. No obstante, la información pública disponible es limitada: no hay detalles sobre el dataset de ajuste, el número de tokens de entrenamiento ni resultados de benchmarks estándar internacionales (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB), BF16 (15,1 GB) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, catalogada como "other"; requiere licencia organizativa aparte) |
| Formato de pesos | GGUF (llama.cpp); el modelo base publica safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint google/gemma-4-E4B-it. La información disponible no especifica la arquitectura interna del modelo base más allá de su naturaleza transformer, ni detalla si emplea mecanismos de atención lineal, mezcla de expertos o alguna variante híbrida. El recuento de parámetros en safetensors (7.518.069.290) corresponde a los pesos del modelo base, no a una arquitectura propia de DICPlay.

No se han publicado datos sobre el volumen de tokens de ajuste, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas en decodificación. La model card únicamente menciona mejoras cualitativas respecto a la versión 3.5 anterior: mayor precisión en tareas de código, mejor conocimiento de historia y legislación rusas, y mejora en generación de poesía. Tampoco se documenta el proceso de cuantización más allá de los tamaños de archivo resultantes.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con modo de chat multi-turno (`-cnv` en llama.cpp).
- Generación y autocompletado de código, según la model card ("дописывает код").
- Seguimiento de instrucciones complejas y preguntas cortas por patrón o ejemplo.
- Llamada a herramientas (tool calling), mencionada explícitamente en la model card.
- Conocimiento reforzado de historia, cultura, regiones y legislación de Rusia.
- Corrección ortográfica y de puntuación en ruso (puntuación de 0,719 citada en la model card).
- Comprensión de matices lingüísticos: personajes, humor y antónimos.
- Ejecución local y offline en navegador, LM Studio, Ollama, PocketPal y llama.cpp.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) para esta versión.

## Casos de uso

- Asistente de escritura offline en ruso: el modelo puede redactar, corregir ortografía y puntuación y reformular textos en un portátil sin conexión, usando la cuantización Q4_K_M (5,3 GB) que cabe en la mayoría de equipos con 8 GB de RAM o VRAM.
- Atención al cliente en ruso con despliegue en el borde: al ejecutarse con llama.cpp u Ollama, permite montar un chatbot multi-turno en infraestructura propia sin enviar datos a terceros, adecuado para sectores con requisitos de residencia de datos.
- Apoyo académico y educativo: la model card cita ayuda con estudios; el modelo puede explicar conceptos, resolver dudas y generar resúmenes en ruso, con conocimiento reforzado de historia y cultura rusas.
- Generación de código en entornos aislados: su capacidad de autocompletar código y de invocar herramientas permite integrarlo en asistentes de desarrollo que operen en redes air-gapped, donde no es viable llamar a una API en la nube.
- Aplicaciones móviles con inferencia en dispositivo: las variantes Mini (3,8 GB) y Lite (4,2 GB) están pensadas para teléfonos de gama alta y navegador, lo que habilita asistentes personales sin conectividad y sin coste por token.
- Automatización de tareas administrativas con conocimiento normativo: su énfasis en leyes y regiones rusas lo hace apto para borradores de consultas sobre normativa local, siempre con revisión humana por el riesgo de alucinación.
- Prototipado rápido con LM Studio u Ollama: al distribuirse solo en GGUF, permite evaluar el modelo en minutos sin infraestructura de GPU dedicada, útil para equipos que comparan alternativas antes de comprometerse con un despliegue.

## Benchmarks y rendimiento

La model card cita resultados del benchmark MERA v2 (Alianza en el sector de la IA, Rusia) para la versión 4.7 de la familia, no para esta versión 3.5. Se reproducen a continuación como referencia contextual, advirtiendo que corresponden a RusMind Vspyshka 4.7:

| Modelo | Parámetros | Puntuación MERA v2 |
|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

Para RusMind 3.5 · Vspyshka no se han publicado resultados de benchmarks en la información disponible, ni en MERA v2 ni en evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4-5 GB para Mini, 5-6 GB para Lite, 6-7 GB para Q4_K_M, 9-10 GB para Q8_0 y 16-17 GB para BF16, sumando el overhead del runtime de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 de 12 GB o superior puede ejecutar Q8_0; una RTX 4090 (24 GB) cubre BF16 con holgura.
- Cabe en GPU de consumo: sí, todas las cuantizaciones salvo BF16 en tarjetas de 8 GB o menos; Q4_K_M es viable en GPUs de 8 GB y en equipos solo con RAM del sistema.
- Despliegue: llama.cpp (comando documentado: `llama-cli -m RusMind-Vspyshka-3.5-Q4_K_M.gguf -cnv`), LM Studio, Ollama, PocketPal y ejecución en navegador vía rusmind.ru.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RusMind 3.5 · Vspyshka | 7,5 mil millones | no disponible | rusmind-license (uso organizativo requiere licencia aparte) | GGUF | Ajuste en ruso, orientado a local/offline |
| google/gemma-4-E4B-it | ~8 mil millones | no disponible | licencia de Google (no especificada aquí) | safetensors y GGUF | Modelo base; sin ajuste específico para ruso |
| Qwen3.5-9B | 9 mil millones | no disponible | no disponible | no disponible | Citado en MERA v2 con 0,186 (versión 4.7 de RusMind) |
| T-lite (T-Bank) | 8 mil millones | no disponible | no disponible | no disponible | Modelo ruso; 0,130 en MERA v2 |

La comparación cuantitativa solo está disponible para la versión 4.7 de RusMind Vspyshka; para la 3.5 no hay datos publicados que permitan una comparación directa.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo de lenguaje de este tamaño, puede inventar hechos, especialmente en cuestiones legales o históricas donde la model card presume conocimiento profundo; se recomienda verificación humana en dominios normativos.
- Sesgos: el ajuste está orientado explícitamente a "valores familiares tradicionales" y a la perspectiva nacional rusa, lo que puede introducir sesgos culturales y políticos en las respuestas.
- Cobertura lingüística limitada a ruso e inglés; no se documenta soporte de otros idiomas, incluido el español.
- Contexto: no se especifica la longitud de ventana, por lo que no puede planificarse su uso en tareas de contexto largo sin verificación empírica.
- Licencia: la rusmind-license es propia y el uso por organizaciones requiere contacto comercial con el autor; no es una licencia open source estándar y las condiciones exactas deben consultarse en el archivo LICENSE del repositorio.
- Distribución exclusiva en GGUF: no hay pesos en safetensors para este ajuste concreto, lo que limita el reentrenamiento o la fusión de pesos.
- Documentación técnica escasa: sin datos de dataset, tokens de entrenamiento ni evaluación estandarizada, la reproducibilidad y la comparación rigurosa con alternativas quedan comprometidas.
- El autor recomienda migrar a la versión 4.7, lo que sugiere que la 3.5 puede no recibir mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5-Vspyshka
- Versión 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Repositorio de la familia Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Demo en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
