# mradermacher/Qwen3.8-Whittle-Next-19.8B-A11B-chat-GGUF

## Resumen

Qwen3.8-Whittle-Next-19.8B-A11B-chat es un modelo de lenguaje conversacional de tipo mixture-of-experts (MoE) desarrollado por logic65 y distribuido en formato GGUF por mradermacher. Con 19.774.844.160 parámetros totales y 11B activos por token, se posiciona como una propuesta de investigación que combina varias técnicas experimentales bajo el paraguas `qwen4_exp`: hyper-connections, n-gram memory y compresión de modelo. La licencia Apache 2.0 y el soporte declarado para endpoints compatibles facilitan su integración en infraestructuras existentes.

El modelo base es `logic65/Qwen3.8-Whittle-Next-19.8B-A11B-chat`, un checkpoint de investigación publicado sin documentación técnica extensa en la información disponible. La nomenclatura sugiere una arquitectura derivada de la familia Qwen, con atención a la eficiencia mediante activación selectiva de expertos, lo que reduce el coste computacional por token frente a un modelo denso de tamaño equivalente.

La relevancia actual reside en su empaquetado GGUF: mradermacher ofrece once cuantizaciones estáticas que van desde Q2_K (9,4 GB) hasta Q8_0 (21,3 GB), lo que permite desplegar un MoE de casi 20B parámetros en hardware de consumo. Es, por tanto, un modelo orientado a experimentación y evaluación de técnicas de compresión y arquitecturas híbridas, no un modelo de producción con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con hyper-connections y n-gram memory (según tags del autor) |
| Parametros totales | 19.774.844.160 |
| Parametros activos | 11B (según nomenclatura A11B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer de tipo mixture-of-experts con 19,8B parámetros totales y 11B activos. Los tags del autor añaden tres componentes técnicos: `hyper-connections` (mecanismo de conexión residual alternativo que mejora el flujo de gradiente en redes profundas), `n-gram-memory` (memoria explícita de secuencias de tokens que puede complementar la atención) y `model-compression`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la configuración de expertos (número total, tamaño, estrategia de routing) ni la longitud de contexto nativa.

El checkpoint es un modelo de investigación (`research` en los tags) y la model card del cuantizador no incluye detalles de entrenamiento del modelo base. La única información arquitectónica fiable proviene de los metadatos: familia `qwen4_exp`, MoE, hyper-connections y n-gram memory. Cualquier afirmación adicional sobre innovaciones como decodificación especulativa o atención lineal sería especulativa y no se recoge aquí.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`-chat` en el nombre).
- Razonamiento y respuesta multi-turno, aunque sin datos publicados sobre calidad.
- Soporte declarado de `endpoints_compatible`, lo que sugiere compatibilidad con APIs de inferencia tipo OpenAI.
- Arquitectura MoE con 11B parámetros activos, lo que reduce el coste por token frente a un denso de 19,8B.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Experimentación con arquitecturas MoE: el modelo permite evaluar el comportamiento de hyper-connections y n-gram memory en un checkpoint abierto, comparando su salida con modelos densos de tamaño similar.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (13,3 GB) cabe en GPUs con 16 GB de VRAM, lo que facilita probar un MoE de 19,8B en estaciones de trabajo locales.
- Investigación sobre compresión de modelos: la disponibilidad de once cuantizaciones permite medir la degradación de calidad entre Q2_K y Q8_0 sobre el mismo checkpoint.
- Evaluación de chat conversacional en inglés: útil como baseline en estudios comparativos de modelos conversacionales de tamaño medio.
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` permite ensayar su despliegue tras una API compatible con OpenAI en entornos de desarrollo.
- Docencia y formación: su licencia Apache 2.0 y su tamaño moderado lo hacen adecuado para talleres sobre cuantización GGUF y despliegue con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~9,4 GB; Q3_K_M ~10,8 GB; IQ4_XS ~11,7 GB; Q4_K_M ~13,3 GB; Q5_K_M ~15,0 GB; Q6_K ~18,2 GB; Q8_0 ~21,3 GB (tamaños de fichero; la VRAM real requiere margen adicional para el contexto KV).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; GPUs de 12 GB para Q3_K_S o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, desde Q2_K en adelante; Q4_K_M es el punto de equilibrio recomendado por el cuantizador.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base en safetensors requiere transformers.
- Latencia y throughput: no disponibles. Al ser MoE con 11B activos, el coste por token debería aproximarse al de un denso de 11B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-Next-19.8B-A11B-chat | 19,8B | 11B | no disponible | Apache 2.0 | GGUF, safetensors |
| Modelos MoE abiertos de ~20B (p. ej. familia Mixtral/Qwen MoE) | ~20B | variable | no disponible | variable | safetensors, GGUF |
| Modelos densos de ~13B | 13B | 13B | no disponible | variable | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas concretas. La comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de calidad frente a alternativas consolidadas.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: riesgo de truncamiento si se asume una ventana estándar.
- Riesgo de alucinación no evaluado; al ser un checkpoint experimental, la fiabilidad conversacional es incierta.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; el propio cuantizador marca Q3_K_M como "lower quality".
- No hay cuantizaciones imatrix/weighted disponibles según la model card, lo que limita la calidad en tamaños pequeños.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento impide descartar riesgos de sesgo o contaminación.
- El repo ocupa 147,2 GB; conviene descargar solo la cuantización necesaria.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Qwen3.8-Whittle-Next-19.8B-A11B-chat-GGUF
- Modelo base: https://huggingface.co/logic65/Qwen3.8-Whittle-Next-19.8B-A11B-chat
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-Whittle-Next-19.8B-A11B-chat-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
