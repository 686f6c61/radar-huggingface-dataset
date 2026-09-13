# florianvoss/Qwen3.5-2B-Autoround-a16w4-Modalix

## Resumen

Este repositorio no contiene un checkpoint de pesos en el sentido habitual, sino artefactos de runtime compilados para el acelerador SiMa.ai Modalix, ejecutables sobre el runtime LLiMa. Deriva del modelo base Qwen/Qwen3.5-2B, al que se le ha aplicado una cuantizacion de tipo AutoRound en formato A16W4 (activaciones de 16 bits, pesos de 4 bits), complementada con GPTQ INT4 en la cabeza de salida, RTN INT8 en las rutas de vision y BF16 en los parametros sensibles de las proyecciones DeltaNet. Lo publica el usuario florianvoss, sin licencia ni idiomas declarados en la model card.

El problema que resuelve es concreto: permitir que un modelo de aproximadamente 2.000 millones de parametros, con capacidades multimodales (entrada de vision de 448 x 448), se ejecute sobre hardware de borde con memoria muy limitada. Para ello el autor empaqueta 119 programas MLA en ficheros ELF, un tokenizador, embeddings y configuracion de runtime, con filtros compartidos, embeddings cuantizados y cache KV cuantizada. La longitud de contexto declarada queda fijada en 4096 tokens.

Su relevancia actual es acotada pero clara: es un ejemplo de flujo de despliegue extremo a extremo para silicio de inferencia en el borde, no una alternativa a los checkpoints que un desarrollador descargaria para usar con vLLM o llama.cpp. La propia model card indica que la validacion de compilacion y del despliegue local con llima-deploy se completo correctamente, pero que la evaluacion en runtime Modalix sigue pendiente, por lo que no existe todavia ninguna medida publica de calidad tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada de forma explicita. El modelo base es Qwen/Qwen3.5-2B y la model card menciona proyecciones DeltaNet (QKV/Z/salida y A/B) y programas MLA, lo que apunta a una arquitectura hibrida con componentes de atencion lineal y atencion con cache latente |
| Parametros totales | Aproximadamente 2.000 millones segun el identificador del modelo base; no se confirma en la model card |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | 4096 tokens (capacidad declarada del artefacto compilado), con prefill group size de 128 |
| Tipos de cuantizacion | AutoRound INT4 simetrico con group size 256 en los pesos lineales del decodificador; GPTQ INT4 simetrico con group size 256 en la cabeza de salida; RTN INT8 por canal de salida en pesos lineales de vision y proyector; BF16 en proyecciones A/B de DeltaNet, parametros de convolucion, normalizacion, A_log y dt_bias. Actividades en 16 bits (esquema A16W4) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefactos de runtime compilados: 119 programas MLA en formato ELF (directorio elf_files/) mas configuracion de runtime, tokenizador y embeddings (directorio devkit/). No es un checkpoint de Transformers, ni safetensors, ni GGUF |
| Metodo de calibracion | SmoothQuant con alpha 0.5, combinado con AutoRound y GPTQ segun la ruta de pesos |
| Tamano del repositorio | 4,2 GB |
| Entrada de vision | 448 x 448, con el codificador de vision empaquetado como ELF por capa |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento en la informacion proporcionada. El repositorio es exclusivamente un artefacto de despliegue derivado de Qwen/Qwen3.5-2B, y la model card no documenta numero de tokens, composicion del dataset ni fases de RLHF, DPO o ajuste por preferencias. Cualquier dato de ese tipo deberia consultarse en la ficha del modelo base.

Lo que si esta documentado es el pipeline de compresion y compilacion. La cuantizacion se aplica de forma diferenciada por tipo de peso: las proyecciones lineales del decodificador, incluidas las de QKV, Z y salida de DeltaNet, usan AutoRound INT4 simetrico con group size 256; la cabeza de salida usa GPTQ INT4 simetrico con el mismo group size; la torre de vision y el proyector usan RTN INT8 por canal de salida. Los parametros mas sensibles a la precision numerica (proyecciones A/B de DeltaNet, convoluciones, normalizaciones, A_log y dt_bias) se mantienen en BF16. Se aplica SmoothQuant con alpha 0.5 como tecnica de suavizado previo. El resultado se compila despues a 119 programas MLA en ELF para el runtime LLiMa, con reparto de filtros, embeddings cuantizados y cache KV cuantizada.

## Capacidades

- Generacion de texto autorregresiva con una ventana de contexto de 4096 tokens, fijada por el artefacto compilado.
- Procesamiento de entrada visual a 448 x 448 mediante el codificador de vision incluido en el paquete, lo que habilita tareas de tipo vision-lenguaje.
- Inferencia en el borde sobre el acelerador SiMa.ai Modalix mediante el runtime LLiMa.
- Ejecucion con memoria reducida gracias a la combinacion de pesos INT4, embeddings cuantizados y cache KV cuantizada.
- Capacidades de tool calling, function calling y razonamiento multi-paso: no disponible (no se mencionan en la model card).
- Capacidades de razonamiento, codigo o matematicas cuantificadas: no disponible; dependen del modelo base y no hay evaluacion publicada tras la cuantizacion.
- Idiomas soportados: no disponible.

## Casos de uso

- Vision artificial en planta industrial: el artefacto acepta entradas de 448 x 448 y esta compilado para un acelerador de borde, por lo que puede desplegarse junto a la linea de produccion para tareas de descripcion de escenas o verificacion visual, sin enviar imagenes a la nube.
- Inspeccion asistida en camaras inteligentes: al ejecutarse sobre Modalix, el modelo puede integrarse en el propio dispositivo de captura y generar descripciones textuales o etiquetas de lo observado en tiempo de captura.
- Robotica movil con presupuesto energetico restringido: la combinacion de pesos de 4 bits y cache KV cuantizada reduce el ancho de banda de memoria, lo que encaja en plataformas con alimentacion limitada que necesitan comprension visual basica.
- Asistente local con contexto de 4096 tokens: para dialogos de pocos turnos en entornos sin conectividad, donde la ventana de contexto es suficiente para un historial corto de instrucciones y respuestas.
- Procesamiento de documentos con privacidad estricta: en escenarios donde no se permite sacar datos de la instalacion, el modelo puede resumir o extraer informacion de capturas e imagenes dentro del propio dispositivo.
- Prototipado de pipelines multimodales en el devkit de Modalix: util para equipos que quieren validar un flujo vision-lenguaje completo sobre LLiMa antes de escalar a un modelo mayor o a otra configuracion de cuantizacion.
- Validacion de la cadena de compilacion y despliegue: sirve como referencia de como se empaquetan pesos cuantizados, tokenizador y programa ELF para un runtime propietario, incluida la verificacion con llima-deploy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la compilacion, la validacion del archivo y el despliegue local con llima-deploy se completaron con exito, pero que la evaluacion en runtime Modalix esta pendiente. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix con un runtime LLiMa compatible. No es un artefacto pensado para GPU convencional.
- VRAM estimada para GPU: no aplicable. Los pesos estan compilados en programas ELF para un runtime especifico y no pueden cargarse en una GPU mediante las herramientas habituales.
- GPU recomendadas: no disponible. El repositorio no declara soporte para A100, H100, RTX 4090 ni ninguna otra GPU.
- Compatibilidad con GPU de consumo: no. El formato de pesos compilado excluye este uso.
- Huella en disco del repositorio: 4,2 GB, que incluye los 119 programas MLA, el tokenizador, los embeddings y la configuracion de runtime.
- Opciones de despliegue: exclusivamente LLiMa mediante el comando llima run sobre la ruta del repositorio, con la estructura de directorios intacta. vLLM, llama.cpp, Ollama y TGI no son aplicables.
- Latencia y throughput estimados: no disponible. El prefill group size de 128 y la ventana de 4096 tokens son parametros de compilacion, no medidas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Qwen3.5-2B-Autoround-a16w4-Modalix | Aproximadamente 2.000 millones | 4096 tokens | AutoRound INT4, GPTQ INT4, RTN INT8 y BF16 segun la ruta | ELF compilado para LLiMa | No disponible | 0 descargas, 0 likes; evaluacion en runtime pendiente |
| Qwen/Qwen3.5-2B (modelo base) | Aproximadamente 2.000 millones | No disponible | Pesos originales sin cuantizar | No disponible | No disponible | Modelo de referencia del que deriva este artefacto |
| Otras cuantizaciones INT4 del mismo modelo base | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos suficientes para comparar el rendimiento con alternativas de la misma categoria. La comparacion relevante es de formato y destino de despliegue: este artefacto prioriza la ejecucion en silicio de borde sobre la portabilidad, mientras que el modelo base y sus cuantizaciones convencionales priorizan la compatibilidad con runtimes de proposito general.

## Limitaciones y advertencias

- No es un checkpoint reutilizable: no puede cargarse con Transformers, vLLM, llama.cpp ni Ollama. Requiere hardware SiMa.ai Modalix y el runtime LLiMa.
- La evaluacion en runtime Modalix esta pendiente segun la propia model card, por lo que no existe evidencia publicada de que la calidad se mantenga tras la cuantizacion.
- La cuantizacion agresiva de pesos a INT4 y la cuantizacion de la cache KV introducen un riesgo de degradacion de calidad en tareas de razonamiento largo o de generacion precisa, aunque no hay mediciones disponibles.
- Ventana de contexto limitada a 4096 tokens, insuficiente para analisis de documentos extensos o conversaciones de muchos turnos.
- Idiomas soportados no declarados. No puede asumirse cobertura del castellano ni de otros idiomas sin verificacion previa.
- Licencia no disponible. Sin una licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni modificacion, lo que supone un riesgo legal relevante en produccion.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o alineacion para este artefacto.
- Riesgo de alucinacion: no cuantificado. Es inherente a los modelos de lenguaje de esta escala y no hay evaluaciones publicadas que lo acoten.
- Trazabilidad limitada: 0 descargas y 0 likes, sin historial de uso por parte de la comunidad ni informes independientes de validacion.
- Dependencia de version del runtime: al tratarse de artefactos compilados, una version incompatible de LLiMa puede impedir la ejecucion; la model card no especifica versiones soportadas.
- Las fechas de creacion y actualizacion del repositorio (12 de septiembre de 2026) son las unicas referencias temporales aportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-2B-Autoround-a16w4-Modalix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/florianvoss
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a SiMa.ai Modalix, al runtime LLiMa, a AutoRound o a SmoothQuant. Los resultados devueltos corresponden a hilos de Stack Overflow y de un foro sin relacion con el modelo.
