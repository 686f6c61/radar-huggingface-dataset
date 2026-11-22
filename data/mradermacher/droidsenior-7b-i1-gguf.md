# mradermacher/DroidSenior-7B-i1-GGUF

## Resumen

DroidSenior-7B-i1-GGUF es la distribución en formato GGUF, con cuantización basada en imatrix, del modelo DroidSenior-7B, un ajuste fino especializado en desarrollo Android con Kotlin y Jetpack Compose. El modelo original lo desarrolla celebibasar, y esta versión cuantizada la publica mradermacher, un perfil conocido por producir cuantizaciones IQ (imatrix) de modelos de terceros para su uso en llama.cpp y entornos de inferencia local. El repositorio incluye 25 variantes de cuantización, desde IQ1_S (2,0 GB) hasta Q6_K (6,4 GB), además del fichero imatrix empleado para generarlas.

El modelo base parte de una arquitectura Qwen2 con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), ajustada mediante SFT, GRPO y best-of-N sobre dos datasets orientados a Android: `giggiovpg/android-kotlin-compose-compiler-verified` y `giggiovpg/ornith-android-instruct`. Está pensado como asistente de programación para el ecosistema Android, con soporte declarado para inglés y turco.

La relevancia de esta ficha reside en que permite ejecutar un asistente de código Android especializado en hardware de consumo mediante cuantizaciones de 4 a 6 GB, sin depender de APIs en la nube. La licencia Apache 2.0 del modelo base facilita su integración en herramientas de desarrollo comerciales, algo poco habitual en modelos de código de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tag `qwen2` de la model card) |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; más fichero imatrix |
| Idiomas soportados | Inglés (en) y turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia Qwen2 (tag `qwen2`), lo que implica un transformer decoder-only denso con atención por grupos (GQA) y RoPE, aunque los detalles concretos de dimensiones, número de capas y cabezas no se especifican en la información disponible. Los 7.615.616.512 parámetros reales confirman un tamaño de aproximadamente 7,6 mil millones, coherente con las variantes 7B de Qwen2.

El ajuste fino se realizó en tres fases según los tags de la model card: SFT (supervised fine-tuning), GRPO (Group Relative Policy Optimization, una variante de RL sin modelo de recompensa separado) y best-of-N. Los datos de entrenamiento provienen de dos datasets públicos centrados en Android: `giggiovpg/android-kotlin-compose-compiler-verified`, que aporta ejemplos de código Kotlin y Jetpack Compose verificados por compilador, y `giggiovpg/ornith-android-instruct`, con instrucciones generales de desarrollo Android. Esta combinación sugiere un entrenamiento orientado tanto a la corrección sintáctica y compilabilidad del código como a la resolución de tareas instruccionales. No se dispone de datos sobre volumen de tokens, composición exacta del dataset ni hiperparámetros de entrenamiento.

La cuantización de mradermacher emplea el método i1 con fichero imatrix, que pondera la cuantización según la importancia de cada tensor medida sobre datos de calibración, mejorando la calidad respecto a las cuantizaciones estáticas equivalentes, especialmente en bits bajos (IQ3 e inferiores). El repositorio también remite a una versión estática (`mradermacher/DroidSenior-7B-GGUF`) para quien prefiera cuantizaciones convencionales.

## Capacidades

- Generación de código Kotlin y Jetpack Compose: el ajuste fino se centra en el desarrollo de interfaces y lógica de aplicaciones Android modernas.
- Asistencia a la programación en contexto Android: interpretación de APIs, componentes de Compose y patrones del SDK.
- Razonamiento sobre código verificado por compilador: el dataset de entrenamiento incluye ejemplos validados por compilación, lo que orienta el modelo hacia salidas compilables.
- Conversación multi-turno: la model card lo etiqueta como `conversational`.
- Soporte multilingüe limitado a inglés y turco, según los metadatos de idioma.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia a desarrolladores Android en local: autocompletado y generación de composables Jetpack Compose directamente en el IDE mediante un backend llama.cpp local, sin enviar código propietario a servicios externos gracias a la licencia Apache 2.0 y al despliegue on-premise.
- Migración de vistas XML a Compose: el modelo puede recibir código de layouts XML y proponer su equivalente en composables, tarea habitual en modernizaciones de aplicaciones Android.
- Generación de código de ejemplo para documentación técnica: producir snippets Kotlin verificables para guías internas de equipos de desarrollo, aprovechando el entrenamiento sobre ejemplos validados por compilador.
- Revisión de código en pipelines de CI: integración como paso de análisis que detecta patrones incorrectos en Compose (por ejemplo, recomposiciones innecesarias) y sugiere correcciones, ejecutado en runners con GPU consumer mediante la cuantización Q4_K_M.
- Chatbot de soporte para dudas de SDK Android: atención a preguntas frecuentes de desarrolladores junior sobre APIs de Compose y Gradle, con contexto multi-turno, en inglés o turco según el equipo.
- Prototipado rápido de pantallas: generación de esqueletos de UI completos (Scaffold, listas, formularios) a partir de una descripción textual, acelerando la creación de maquetas funcionales.
- Formación interna: despliegue en entornos de aprendizaje para que equipos practiquen con un asistente especializado sin coste de API, usando la cuantización IQ4_XS (4,3 GB) en portátiles con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el tamaño del fichero GGUF es una cota inferior; se necesita margen para el contexto KV cache):
  - IQ1_S (2,0 GB): ~3 GB de VRAM.
  - IQ2_M (2,9 GB): ~4 GB de VRAM.
  - IQ3_M (3,7 GB): ~5 GB de VRAM.
  - IQ4_XS (4,3 GB): ~5,5 GB de VRAM.
  - Q4_K_M (4,8 GB): ~6 GB de VRAM.
  - Q5_K_M (5,5 GB): ~7 GB de VRAM.
  - Q6_K (6,4 GB): ~8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso consumer; A100 o H100 para despliegues concurrentes con vLLM (aunque vLLM requiere pesos no GGUF o un backend compatible con GGUF).
- Cabe en GPU consumer: sí, prácticamente cualquier GPU con 8 GB o más admite las cuantizaciones Q4_K_M y Q5_K_M; las IQ2/IQ3 caben en GPUs de 4-6 GB (GTX 1650, RTX 3050).
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama con importación de GGUF, LM Studio, KoboldCpp); para CPU pura, llama.cpp con cuantizaciones IQ2/IQ3; para mayor throughput en servidor, TGI no soporta GGUF de forma nativa, por lo que se recomienda llama.cpp con servidor o convertir a safetensors para vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato disponible |
|---|---|---|---|---|---|
| DroidSenior-7B-i1-GGUF | ≈7,6 B | No disponible | Android / Kotlin / Compose | Apache 2.0 | GGUF (i1 imatrix) |
| DroidSenior-7B (base) | ≈7,6 B | No disponible | Android / Kotlin / Compose | Apache 2.0 | Safetensors (presumible) |
| Qwen2.5-Coder-7B | 7,6 B | 32k (según ficha oficial de Qwen) | Código general multi-lenguaje | Apache 2.0 | Safetensors, GGUF |
| CodeLlama-7B | 6,7 B | 16k | Código general | Llama 2 custom | Safetensors, GGUF |

La comparativa con Qwen2.5-Coder-7B y CodeLlama-7B se incluye por categoría (asistentes de código de tamaño 7B); los datos de contexto de esos modelos provienen de sus fichas públicas, no de la información de esta búsqueda, y deben verificarse en sus repositorios. DroidSenior-7B se diferencia por la especialización vertical en Android y por el entrenamiento con GRPO y best-of-N sobre ejemplos verificados por compilador, a costa de un alcance de lenguajes mucho menor.

## Limitaciones y advertencias

- Cobertura de idiomas restringida a inglés y turco; el castellano no figura entre los idiomas declarados, por lo que la calidad en español no está garantizada.
- Especialización estrecha: fuera del dominio Android/Kotlin/Compose, el rendimiento previsiblemente cae frente a modelos de código generalistas del mismo tamaño.
- Riesgo de alucinación de APIs: puede generar referencias a funciones o componentes de Compose inexistentes o con firmas incorrectas; el entrenamiento sobre ejemplos verificados por compilador mitiga pero no elimina este riesgo. Se recomienda compilar y testear toda salida antes de integrarla.
- Longitud de contexto no documentada: no se puede planificar su uso en bases de código grandes sin verificar experimentalmente la ventana efectiva.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los datasets de origen son comunitarios y no se declara su composición ni proceso de filtrado.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no impone restricciones de uso más allá de las estándar, pero conviene conservar los avisos de copyright del modelo base y del cuantizador.
- Las cuantizaciones IQ1/IQ2 están marcadas por el propio autor como de calidad muy baja ("for the desperate", "very low quality") y no son adecuadas para producción.
- El repositorio pesa 89 GB por acumulación de todas las variantes; descargar solo el fichero GGUF necesario.
- No se declara soporte de tool calling ni de agentes; integrarlo en pipelines agénticos requiere validación adicional.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/DroidSenior-7B-i1-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/DroidSenior-7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DroidSenior-7B-i1-GGUF
- Dataset de entrenamiento (Kotlin/Compose verificado): https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset de entrenamiento (instrucciones Android): https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
