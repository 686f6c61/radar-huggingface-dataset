# mradermacher/DroidSenior-7B-GGUF

## Resumen

DroidSenior-7B-GGUF es la distribucion en formato GGUF del modelo DroidSenior-7B, desarrollado originalmente por celebibasar y cuantizado por mradermacher. Se trata de un modelo especializado en generacion de codigo para el ecosistema Android, con enfasis en Kotlin y Jetpack Compose, construido sobre la arquitectura Qwen2 con aproximadamente 7.615 millones de parametros. Su proposito es actuar como asistente de programacion para desarrolladores de aplicaciones Android, un nicho poco cubierto por los modelos generalistas.

El modelo base fue afinado mediante SFT y GRPO (Group Relative Policy Optimization) sobre dos datasets especificos del dominio Android: `giggiovpg/android-kotlin-compose-compiler-verified` y `giggiovpg/ornith-android-instruct`. Esta especializacion lo hace relevante para equipos que trabajan con Kotlin moderno y Compose, donde los modelos generalistas suelen producir APIs desactualizadas o patrones obsoletos de Views/XML.

Esta ficha cubre la version cuantizada GGUF, que ofrece 12 variantes de cuantizacion desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite desplegar el modelo en hardware muy diverso, desde portatiles con GPU consumer hasta servidores. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen pesos originales en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, segun indican las etiquetas del repositorio. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud exacta de contexto en la informacion proporcionada; la etiqueta `qwen2` sugiere que hereda la configuracion tipica de la familia Qwen2-7B, pero este dato no se confirma explicitamente.

El entrenamiento combina dos fases: un ajuste supervisado (SFT) seguido de GRPO (Group Relative Policy Optimization), una variante de RL que optimiza recompensas relativas dentro de grupos de respuestas. Ademas, se menciona el uso de "best-of-n" como estrategia de seleccion, probablemente durante la generacion de datos de preferencia o en la fase de alineamiento. Los datasets empleados son `giggiovpg/android-kotlin-compose-compiler-verified` (ejemplos de Kotlin/Compose verificados por compilador) y `giggiovpg/ornith-android-instruct` (instrucciones del dominio Android). No se especifica el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de codigo Kotlin para Android, con enfasis en Jetpack Compose.
- Asistencia en tareas de programacion Android: refactorizacion, correccion de errores y generacion de componentes UI declarativos.
- Razonamiento sobre APIs de Android y patrones de Compose, apoyado por el entrenamiento sobre ejemplos verificados por compilador.
- Conversacion multi-turno (etiqueta `conversational`).
- Capacidades multilingues limitadas al ingles y al turco.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Generacion de componentes Jetpack Compose: el modelo puede producir composables completos (layouts, estados, temas) a partir de descripciones en lenguaje natural, aprovechando su entrenamiento sobre ejemplos verificados por compilador.
- Migracion de Views/XML a Compose: util para transformar fragmentos de codigo Android clasico a equivalentes declarativos en Compose, reduciendo el trabajo manual de modernizacion de bases de codigo.
- Asistente integrado en IDE para Android Studio: dado su tamano (~7,6 B) y las cuantizaciones Q4_K_S/Q4_K_M (4,6-4,8 GB), puede ejecutarse localmente en estaciones de desarrollo con GPU consumer, ofreciendo autocompletado y explicaciones de codigo sin enviar codigo propietario a la nube.
- Generacion de tests unitarios para logica de UI y ViewModels en Kotlin, a partir del codigo fuente existente.
- Documentacion tecnica de modulos Android: el modelo puede resumir y documentar clases, funciones y flujos de Compose en ingles o turco.
- Soporte a equipos con requisitos de privacidad: al poder desplegarse on-premise en formato GGUF con llama.cpp u Ollama, permite asistencia de codigo en entornos donde no se permite el uso de APIs externas.
- Educacion y formacion en Android: explicacion de patrones de Compose, state hoisting y gestion de efectos secundarios en Kotlin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto y KV cache):
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q4_K_S / Q4_K_M (4,6-4,8 GB): ~6-7 GB de VRAM.
  - Q5_K_M (5,5 GB): ~7-8 GB de VRAM.
  - Q6_K (6,4 GB): ~8-9 GB de VRAM.
  - Q8_0 (8,2 GB): ~10-11 GB de VRAM.
  - f16 (15,3 GB): ~17-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 (24 GB) o A100/H100 para Q8_0 y f16; tambien viable en CPU con llama.cpp para cuantizaciones bajas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M; en 16 GB con Q6_K o Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Existe tambien una variante con cuantizaciones imatrix en `mradermacher/DroidSenior-7B-i1-GGUF`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| DroidSenior-7B-GGUF | ~7,6 B | no disponible | Codigo Android/Kotlin/Compose | Apache 2.0 | GGUF |
| Qwen2.5-Coder-7B | ~7,6 B | 32k (segun documentacion publica de Qwen) | Codigo generalista | Apache 2.0 | safetensors, GGUF |
| CodeLlama-7B | ~6,7 B | 16k (segun documentacion publica de Meta) | Codigo generalista | Llama 2 custom | safetensors, GGUF |
| DeepSeek-Coder-6.7B | ~6,7 B | 16k (segun documentacion publica) | Codigo generalista | DeepSeek license | safetensors, GGUF |

La ventaja diferencial de DroidSenior-7B es su especializacion en el ecosistema Android y Jetpack Compose, con entrenamiento verificado por compilador, frente a modelos generalistas de codigo que suelen quedar desactualizados en APIs de Android modernas. Como contrapartida, su cobertura multilingue (solo en/tr) y su falta de benchmarks publicos dificultan la comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datasets especificos de Android, puede presentar sesgo hacia patrones y librerias concretas de esos datasets.
- Riesgo de alucinacion: presente como en cualquier LLM; en codigo puede generar APIs inexistentes o firmas incorrectas, especialmente fuera del dominio Android/Kotlin.
- Limitaciones de contexto e idioma: solo se declaran ingles y turco; el rendimiento en castellano no esta garantizado. La longitud de contexto no esta especificada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento originales.
- Caveats para produccion: ausencia de benchmarks publicos, lo que obliga a evaluacion propia antes de desplegar; el modelo esta orientado a generacion de codigo Android y no debe esperarse un rendimiento generalista equiparable a modelos de proposito general.
- Las cuantizaciones Q3_K_M y Q2_K pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DroidSenior-7B-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DroidSenior-7B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DroidSenior-7B-GGUF
- Dataset de entrenamiento (Kotlin/Compose verificado): https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset de entrenamiento (instrucciones Android): https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
