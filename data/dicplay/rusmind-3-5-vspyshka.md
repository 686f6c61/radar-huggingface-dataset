# DICPlay/RusMind-3.5-Vspyshka

## Resumen

RusMind 3.5 · Vspyshka (en ruso, "Вспышка", "destello") es un ajuste fino del modelo google/gemma-4-E4B-it desarrollado por DICPlay, orientado a inferencia local y sin conexión en ruso e inglés. Se distribuye exclusivamente en formato GGUF con cinco variantes de cuantización (desde 3,8 GB hasta 15,1 GB), lo que lo hace desplegable en navegador, teléfonos y ordenadores personales mediante llama.cpp, LM Studio, Ollama o PocketPal. El repositorio declara 7.518.069.290 parámetros en los pesos de referencia.

El modelo se posiciona como una alternativa "nacional" rusa: la model card insiste en su conocimiento de historia, legislación, regiones y cultura de Rusia, además de corrección ortográfica y de puntuación en ruso. Según el autor, obtiene 0,191 en el benchmark MERA v2, lo que lo situaría por delante de Qwen3.5-9B (0,186), Gemma 4 E4B (0,170), RuadaptQwen3-32B (0,163), Zero-Mistral (0,160) y T-lite (0,130), aunque estas cifras proceden únicamente de la documentación del propio autor y no se han verificado de forma independiente.

Es relevante ahora porque el autor recomienda migrar a RusMind 4.7 · Vspyshka, que según la model card alcanza 0,191 en MERA v2 y se sitúa como segunda mejor modelo de menos de 10 000 millones de parámetros. La versión 3.5 queda, por tanto, como una iteración anterior mantenida por compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E4B-it, transformer) |
| Parametros totales | 7.518.069.290 (pesos de referencia); el nombre del modelo base sugiere una variante E4B de Gemma 4 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB), BF16 (15,1 GB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna más allá de que el modelo deriva de google/gemma-4-E4B-it mediante ajuste fino (base_model_relation: finetune). El sufijo "E4B" del modelo base sugiere una variante de eficiencia de la familia Gemma 4, pero no se confirma si emplea mezcla de expertos, atención lineal u otras técnicas de eficiencia, ni el número de parámetros activos.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. La model card menciona mejoras en la versión 3.5 respecto a anteriores: cumplimiento preciso de tareas (autocompletado de código, preguntas cortas por patrón), mayor conocimiento de historia y legislación rusas, y mejor calidad en poesía. No se documentan innovaciones técnicas como decodificación especulativa o modos de razonamiento explícito para esta versión.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con soporte multi-turno.
- Escritura y autocompletado de código, según la model card ("дописывает код").
- Explicaciones educativas y ayuda con estudios.
- Corrección ortográfica y de puntuación en ruso (0,719 según el autor en la prueba correspondiente de MERA v2).
- Comprensión de personajes, humor y palabras con significados opuestos (antonimia), según la documentación del autor.
- Seguimiento de instrucciones complejas y llamada a herramientas (tool calling), citado de forma explícita en la model card.
- Conocimiento específico de historia, cultura, leyes, regiones y pueblos de Rusia.
- Ejecución totalmente offline y en dispositivo, sin dependencia de red.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) para esta versión.

## Casos de uso

- Asistente conversacional offline en ruso: desplegado con llama.cpp u Ollama sobre el GGUF Q4_K_M (5,3 GB), permite mantener diálogos multi-turno sin conexión en un portátil con GPU de gama media, útil en entornos con conectividad restringida.
- Corrección y edición de textos en ruso: el modelo puede revisar ortografía y puntuación en documentos, aprovechando el resultado declarado de 0,719 en la prueba de corrección de MERA v2.
- Apoyo educativo en historia y derecho ruso: responde preguntas sobre legislación, regiones y cultura del país, adecuado para herramientas de estudio orientadas a ese currículo.
- Autocompletado de código en editores locales: integrable vía llama.cpp o LM Studio para sugerencias de código en flujos de desarrollo sin enviar datos a la nube.
- Chatbot embebido en aplicaciones móviles: la variante Mini (3,8 GB) o Lite (4,2 GB) cabe en teléfonos de gama alta y permite asistentes integrados sin backend.
- Automatización con herramientas: el soporte declarado de tool calling permite construir agentes sencillos que invoquen funciones locales (calendario, ficheros, APIs internas) en un pipeline de escritorio.
- Atención al cliente en ruso con requisitos de privacidad: al ejecutarse en local, los datos del usuario no salen del dispositivo, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor (benchmark MERA v2). No se han verificado de forma independiente.

| Modelo | Parámetros | MERA v2 (general) |
|---|---|---|
| RusMind Vspyshka 3.5 (este modelo) | 7,5 mil millones | no disponible en la card para 3.5; 0,191 corresponde a la versión 4.7 |
| RusMind Vspyshka 4.7 | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

La model card no publica la puntuación MERA v2 específica de la versión 3.5; la cifra de 0,191 se atribuye a RusMind 4.7 · Vspyshka. Tampoco se ofrecen resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para Mini (3,8 GB de pesos) y Lite (4,2 GB); 6-7 GB para Q4_K_M (5,3 GB); 9-10 GB para Q8_0 (8,0 GB); 16-18 GB para BF16 (15,1 GB), sumando overhead de contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q8_0; RTX 4090, A100 o H100 para BF16 con contexto amplio.
- Cabe en GPU de consumo: sí, desde una RTX 3050 8 GB para Mini y Lite; Q4_K_M funciona en tarjetas de 8 GB con contexto moderado; Q8_0 requiere 12 GB o más.
- Despliegue: llama.cpp (llama-cli, llama-server), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF; también versión en navegador en rusmind.ru.
- Latencia y throughput: no disponibles. Al ser un modelo de 7,5 mil millones de parámetros en GGUF, se espera un rendimiento típico de esta clase en GPU de consumo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Formatos |
|---|---|---|---|---|---|
| RusMind Vspyshka 3.5 | 7,5 mil millones | no disponible | no disponible (4.7: 0,191) | rusmind-license | GGUF |
| Qwen3.5-9B | 9 mil millones | no disponible | 0,186 | no disponible en la información | no disponible |
| Gemma 4 E4B | 8 mil millones | no disponible | 0,170 | licencia de Google (modelo base) | no disponible |
| T-lite (T-Bank) | 8 mil millones | no disponible | 0,130 | no disponible | no disponible |

La comparación se limita a las cifras de MERA v2 aportadas por el autor; no hay datos de contexto, licencia o formatos de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones de benchmarks proceden exclusivamente de la model card del autor y no se han verificado de forma independiente; deben tratarse con cautela.
- La licencia "rusmind-license" está etiquetada como "other" y no se detallan sus términos en la información disponible: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El modelo está ajustado para ruso e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- El ajuste fino orientado a historia, leyes y cultura rusas puede introducir sesgos culturales y políticos específicos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en citas legales, históricas o factuales; requiere verificación en dominios sensibles.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con documentos largos.
- El autor recomienda migrar a RusMind 4.7 · Vspyshka; esta versión 3.5 puede quedar sin mantenimiento.
- No se publican pesos en safetensors en este repositorio, solo GGUF, lo que limita el reentrenamiento o la conversión a otros formatos sin partir del BF16 GGUF.
- El tamaño del repositorio (36,4 GB) incluye todas las cuantizaciones; conviene descargar únicamente el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5-Vspyshka
- Versión recomendada 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Repositorio de todas las versiones: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Demo en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
