# DICPlay/RusMind-4.5-Vspyshka

## Resumen

RusMind 4.5 · Vspyshka (Вспышка, "destello") es un ajuste fino del modelo base google/gemma-4-E4B-it desarrollado por DICPlay, orientado a inferencia en dispositivo (on-device) y uso sin conexión, con especial énfasis en el idioma ruso. Se distribuye como un único archivo GGUF en precisión BF16 de 15,1 GB, lo que corresponde a los 7.518.069.290 parámetros declarados en el repositorio. La model card lo presenta como versión preliminar de la generación 4.5, sustituida ya por la 4.7.

El modelo está pensado para tareas cotidianas de escritura, explicación, apoyo al estudio y generación de código, con conocimiento reforzado de historia, cultura, legislación, regiones y tradiciones de Rusia. Soporta ruso e inglés y se integra con el ecosistema GGUF (llama.cpp, LM Studio, Ollama, PocketPal) y con el servicio web rusmind.ru, donde la inferencia se ejecuta en el navegador tras una descarga inicial.

Su relevancia actual radica en dos factores: por un lado, la licencia propietaria rusmind-license y la orientación explícita a contenidos culturales y legales rusos; por otro, las cifras de adopción que declara el autor (127.796 descargas en 30 días para toda la familia RusMind, según datos de Hugging Face a 31.10.2026). No se han publicado datos de benchmarks específicos para esta versión 4.5 en la información disponible; las cifras de MERA v2 que aparecen en la model card corresponden a la versión 4.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; se desconoce si conserva la arquitectura Mixture-of-Experts del base) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único archivo publicado en el repositorio: `RusMind-Vspyshka-4.5-BF16.gguf`, 15,1 GB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propietaria, etiquetada como `other` en Hugging Face; texto en el archivo LICENSE del repositorio) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo es un ajuste fino (relación `finetune`) del base google/gemma-4-E4B-it, un modelo de aproximadamente 8.000 millones de parámetros según la comparativa incluida en la propia model card. La nomenclatura "E4B" del modelo base sugiere una variante de eficiencia de la familia Gemma 4, pero no se confirma en la información disponible si emplea Mixture-of-Experts, atención lineal u otro mecanismo de eficiencia, ni cuántos parámetros permanecen activos por token.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron técnicas de RLHF, DPO o similar. La model card únicamente describe mejoras cualitativas respecto a versiones anteriores en comprensión del ruso y su cultura (refranes, humor, juegos de palabras, personajes y particularidades regionales), corrección ortográfica y de puntuación, y manejo de documentos largos e instrucciones de varios pasos. El repositorio contiene exclusivamente el archivo GGUF en BF16, sin pesos en safetensors ni adaptadores publicados.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con etiqueta `conversational` en Hugging Face.
- Comprensión reforzada de la cultura rusa: refranes y dichos, humor, juegos de palabras, caracteres y particularidades regionales.
- Corrección ortográfica y de puntuación en ruso (la model card de la versión 4.7 cita 0,719 en esta tarea, sin dato equivalente para 4.5).
- Seguimiento de instrucciones complejas y de varios pasos.
- Trabajo con documentos largos (sin longitud de contexto publicada).
- Llamada a herramientas (tool calling), según se menciona en la model card de la familia.
- Soporte de conversación multi-turno mediante el modo `-cnv` de llama.cpp.
- Ejecución sin conexión en dispositivo (on-device, offline) a través de GGUF.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) para esta versión.

## Casos de uso

- Asistencia de escritura en ruso: redacción y revisión de textos con corrección ortográfica y de puntuación integrada, adecuado por su ajuste específico en gramática rusa y su despliegue local sin coste por token.
- Uso offline en equipos sin conectividad: al ser un GGUF ejecutable con llama.cpp, LM Studio u Ollama, permite desplegar un asistente conversacional en portátiles y equipos de campo donde no se puede enviar datos a la nube.
- Inferencia en navegador: a través de rusmind.ru la modelo se descarga una vez en el navegador y responde sin conexión, lo que encaja en escenarios de privacidad donde el texto no debe salir del dispositivo del usuario.
- Apoyo educativo sobre historia y cultura rusas: el ajuste refuerza conocimiento de historia, regiones, pueblos y tradiciones de Rusia, útil para materiales didácticos o consultas de estudiantes.
- Consultas sobre legislación y contexto legal ruso: la model card declara conocimiento de leyes, aunque sin garantías de exactitud jurídica; adecuado para orientación preliminar, no para asesoramiento legal vinculante.
- Integración en aplicaciones de escritorio y móviles: PocketPal y otras apps compatibles con GGUF permiten incorporar el modelo como asistente local en flujos de productividad personal.
- Generación y explicación de código en entornos de desarrollo aislados: al soportar tool calling y ejecutarse localmente, puede integrarse en asistentes de IDE sin exponer el código a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión 4.5 en la información disponible. Las cifras de MERA v2 que aparecen en la model card corresponden a RusMind 4.7 · Vspyshka (0,191 de puntuación global) y a RusMind 4.7 · Sokol (0,279), no a esta versión, por lo que no se trasladan a la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: el único archivo publicado es BF16 de 15,1 GB, lo que requiere aproximadamente 16 GB de VRAM o memoria unificada para cargarlo completo, más margen para el contexto KV.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB). En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) cabe ajustando el tamaño de contexto.
- GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y RTX 4060 Ti de 16 GB. En GPUs de 8-12 GB no cabe en BF16 sin cuantizar; no se publican archivos Q4/Q5/Q8 en el repositorio, aunque el usuario puede generarlos a partir del BF16.
- Memoria unificada: equipos Apple Silicon con 16 GB o más pueden ejecutarlo vía llama.cpp con Metal.
- Opciones de despliegue: llama.cpp (`llama-cli -m RusMind-Vspyshka-4.5-BF16.gguf -cnv`), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card incluye una comparativa de la versión 4.7 (no de la 4.5) frente a modelos de tamaño similar. Se reproduce a título orientativo, indicando que las puntuaciones no corresponden a esta versión:

| Modelo | Parámetros | MERA v2 (versión 4.7) | Licencia | Disponibilidad |
|---|---|---|---|---|
| RusMind 4.7 · Vspyshka | 7.500 M | 0,191 | rusmind-license | GGUF en HF |
| Qwen3.5-9B (Alibaba) | 9.000 M | 0,186 | no disponible en la información | no disponible en la información |
| Gemma 4 E4B (Google) | ~8.000 M | 0,170 | no disponible en la información | no disponible en la información |
| RuadaptQwen3-32B | 32.000 M | 0,163 | no disponible en la información | no disponible en la información |
| Zero-Mistral | 24.000 M | 0,160 | no disponible en la información | no disponible en la información |
| T-lite (T-Bank) | ~8.000 M | 0,130 | no disponible en la información | no disponible en la información |

Para la versión 4.5 no se dispone de puntuaciones comparables. Como referencia de tamaño y formato, el competidor directo es el propio modelo base google/gemma-4-E4B-it, del que este modelo es un ajuste fino.

## Limitaciones y advertencias

- Licencia propietaria rusmind-license: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la etiqueta `other` en Hugging Face no equivale a una licencia de código abierto.
- Versión preliminar y obsoleta: la model card recomienda explícitamente migrar a RusMind 4.7, lo que implica que 4.5 no recibirá mejoras ni correcciones.
- Sesgos: el ajuste está orientado a historia, cultura, leyes y "valores familiares tradicionales" de Rusia, lo que puede introducir un sesgo editorial y de encuadre en temas históricos, políticos y sociales.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación; el conocimiento legal e histórico reforzado debe verificarse contra fuentes primarias.
- Idiomas limitados a ruso e inglés; no se declara soporte de español ni de otras lenguas.
- Longitud de contexto no publicada, lo que dificulta planificar despliegues con documentos largos.
- Sin cuantizaciones oficiales: solo se publica BF16, de modo que el uso en hardware modesto exige cuantizar manualmente, con posible degradación no evaluada.
- No se publican datos de entrenamiento, arquitectura detallada ni evaluaciones independientes para esta versión; las afirmaciones de rendimiento de la model card se refieren a la versión 4.7.
- El modelo base Gemma está sujeto a sus propios términos de uso; la licencia derivada debe verificarse para confirmar que permite la redistribución y el uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka
- Archivo GGUF: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka/blob/main/RusMind-Vspyshka-4.5-BF16.gguf
- Repositorio de la familia RusMind Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Versión sucesora 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Servicio web de inferencia en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
