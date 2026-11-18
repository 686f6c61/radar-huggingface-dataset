# kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M

## Resumen

Qwen3.8-27B-pi-adapted-Splash-Q4_K_M es una cuantización GGUF comunitaria del modelo Qwen3.8-27B (27.320.697.856 parámetros) con un adaptador LoRA de tipo pi fusionado, publicado por el usuario kesslerIO. El adaptador original procede de harness-hub/Qwen3.8-27B-pi-adapted y está orientado a tareas de generación de código dentro del agente de programación Pi 1.5.2. La fusión se realizó sobre los pesos BF16 del modelo base antes de cuantizar a Q4_K_M, de modo que el artefacto final puede servirse en motores que no cargan LoRA en tiempo de ejecución.

El resultado es un GGUF de 15,66 GiB con 866 tensores, pensado específicamente para Splash 1.7.0 sobre Apple Silicon. La receta de conversión es relevante: el conversor estándar de llama.cpp concatena las proyecciones GDN QKV/gate y beta/alpha, lo que Splash 1.7 rechaza; el autor emplea un wrapper que desactiva esa concatenación manteniendo el reordenamiento de cabezas upstream.

Es una conversión derivada no oficial: no procede de Qwen, harness-hub ni Splash. Solo cubre texto (sin proyector de visión ni pesos draft), y el propio autor advierte que otros motores GGUF no fueron probados con este artefacto. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; el autor etiqueta el repo como `qwen3_5`) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | 262.144 tokens configurados como techo en Splash; no se estresó una ventana completa |
| Tipos de cuantización | Q4_K_M (sin importance matrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único fichero de 16.810.714.560 bytes / 15,66 GiB) |
| Tensores | 866 (validado por el shape check nativo de Splash) |
| Modelo base | Qwen/Qwen3.8-27B, revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0` |
| Adaptador | harness-hub/Qwen3.8-27B-pi-adapted, revisión `e786f8491742268f9b2bc729697b13bfac26d4ad` |
| Conversor | llama.cpp rev. `52975342ff6b85127ff31930d39e36725fd08809`, quantizer 0.7.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.320.697.856 parámetros. La model card menciona proyecciones GDN QKV/gate y beta/alpha, lo que sugiere componentes de atención lineal o híbridos en la arquitectura del base, aunque no se detalla su disposición completa. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si el base empleó RLHF o DPO.

El adaptador pi-adapted se entrenó en harness-hub (no se documentan datos ni método de entrenamiento en la información disponible) y aquí se fusionó con el base mediante un merge PEFT seguro en CPU, procesando un shard del base cada vez. Posteriormente se exportó a GGUF en BF16 y se cuantizó a Q4_K_M sin importance matrix. La innovación técnica documentada es la modificación del conversor de llama.cpp: se mantiene el reordenamiento de cabezas upstream pero se evita la concatenación de las proyecciones GDN QKV/gate y beta/alpha, necesaria para que Splash 1.7 acepte el layout. No se realizó entrenamiento adicional en esta conversión.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno.
- Programación y reparación de código, especialmente orientada al agente Pi (la mejora medida se observa en tareas locales de reparación en Python).
- Uso dentro de agentes con tool calling: el benchmark local contabiliza llamadas a herramientas intentadas (425 en el brazo adaptado frente a 1.141 en el base).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible` en los tags), servida por Splash en `/v1` con API `openai-completions`.
- Modo de razonamiento desactivado por recomendación de los autores del adaptador (`reasoning_effort: none`, `--thinking off`).
- Solo texto: no incluye proyector de visión ni pesos draft en el artefacto; el draft se descarga por separado (incoai/Qwen3.8-27B-DFlash2) para decodificación especulativa en Splash.
- Idioma limitado al inglés según la model card.

## Casos de uso

- Reparación de código en Python dentro de un agente local: el adaptador está entrenado para el agente Pi y el benchmark del autor mide tareas de reparación con grader oculto, shell limitado a 90 s y 300 s por intento. Es adecuado para flujos de arreglo de bugs acotados con verificación automática.
- Servir el adaptador en motores sin carga de LoRA en runtime: al estar fusionado en los pesos y cuantizado, se puede desplegar en Splash 1.7 o en otros motores GGUF (aunque solo Splash fue probado), sin necesidad de gestionar el adaptador por separado.
- Desarrollo asistido en Apple Silicon: con 15,66 GiB en Q4_K_M y un presupuesto de memoria de 32 GiB declarado para pesos, draft, KV/state y buffers, encaja en Macs de gama alta con memoria unificada, lo que permite un asistente de código local sin depender de la nube.
- Automatización de tareas de agente con muchas llamadas a herramientas: el brazo adaptado redujo las llamadas intentadas un 62,8 % frente al base en el mismo harness, lo que resulta útil cuando el coste por tool call o la latencia del entorno son limitantes.
- Sustitución del modelo base en el harness Pi existente: la configuración de proveedor documentada (`~/.pi/agent/models.json`) permite apuntar Pi 1.5.2 al servidor local con `contextWindow` de 262.144 y `maxTokens` de 4.096, sin cambiar el cliente.
- Evaluación comparativa de adaptadores sin infraestructura de LoRA: al estar el adaptador fusionado, sirve para reproducir comparaciones base frente a adaptado en el mismo motor y cuantización, como hace el autor con ambos brazos en Q4_K_M y el mismo tokenizer y plantilla.

## Benchmarks y rendimiento

El autor publica un benchmark local propio: 12 tareas × 2 repeticiones × 2 modelos = 48 ejecuciones, medidas el 2026-11-18 en un M5 Max con 128 GiB y macOS 26.7.3. Ambos brazos usaron Q4_K_M, el mismo tokenizer y plantilla, Splash con draft, Pi, thinking off, temperatura 0,8, 4.096 tokens de salida por petición y techo configurado de 262.144 tokens. Cada intento tuvo 300 s y 60 llamadas a herramientas como máximo, con comandos shell limitados a 90 s. No son resultados de SWE-bench ni Terminal-Bench, ni las puntuaciones de release de los autores del adaptador.

| Métrica | Base Q4 | Pi-adapted Q4 |
|---|---:|---:|
| Passes funcionales | 7/24 | 14/24 |
| Completaciones usables (correctas y dentro de límites) | 7/24 | 13/24 |
| Tiempo real del agente, todas las ejecuciones puntuadas | 47m 34s | 42m 27s |
| Tiempo penalizado por fallo (300 s por ejecución fallida) | 95m 45s | 74m 35s |
| Llamadas a herramientas intentadas | 1.141 | 425 |

El adaptado usó un 62,8 % menos de llamadas a herramientas y un 10,8 % menos de tiempo real de agente. El propio autor advierte que la mejora observada no establece superioridad de fiabilidad estadísticamente significativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria para inferencia: 15,66 GiB solo para los pesos Q4_K_M; el ejemplo del autor reserva 32 GiB de presupuesto máximo de memoria que incluye pesos objetivo, draft, KV/state en GPU y buffers, sin contar macOS ni Python.
- Hardware medido: Apple Silicon M5 Max con 128 GiB de memoria unificada y macOS 26.7.3, ejecutando Splash 1.7.0.
- El autor no afirma que un Mac con 32 GiB de RAM total pueda ejecutar cómodamente esta configuración; el presupuesto de 32 GiB es del servidor, no del sistema.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el artefacto está probado solo con Splash sobre Apple Silicon y otros motores GGUF no fueron testados.
- Despliegue: Splash 1.7.0 (probado), con draft separado incoai/Qwen3.8-27B-DFlash2 revisión `015e795645c74b1a0eeef3b570031fb62e769bc5` para decodificación especulativa. llama.cpp, Ollama, vLLM o TGI: no disponible (no probados según el autor).
- Latencia y throughput: no se publican tokens por segundo; sí tiempos agregados de agente (42m 27s para 24 ejecuciones en el brazo adaptado, con hasta 300 s por intento).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M | 27,32 B | 262.144 configurados (no estresado) | GGUF Q4_K_M | Apache 2.0 | Adaptador pi fusionado; probado solo en Splash 1.7 / Apple Silicon |
| Qwen/Qwen3.8-27B (base BF16) | 27,32 B | No disponible en la información | Safetensors BF16 | Apache 2.0 | Base oficial; sin adaptador; requiere motor con soporte de su arquitectura |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,32 B | No disponible en la información | LoRA sobre base | No disponible | Adaptador original; requiere carga de LoRA en runtime |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un derivado del base Qwen3.8-27B, hereda los del base, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; el benchmark local mide passes funcionales (14/24 en el brazo adaptado), lo que indica que una parte sustancial de intentos no finaliza correctamente.
- Solo inglés: la model card declara `language: en`; no hay evidencia de calidad multilingüe.
- Solo texto: no incluye proyector de visión; el draft para decodificación especulativa debe descargarse aparte.
- Compatibilidad restringida: el layout de proyecciones GDN QKV/gate y beta/alpha está ajustado para Splash 1.7; otros motores GGUF no fueron probados y podrían rechazar el artefacto.
- El techo de 262.144 tokens es una configuración, no una ventana estresada; no se validó un prompt de ventana completa.
- Requiere desactivar el razonamiento (`reasoning_effort: none`); el autor advierte que no se debe confiar solo en la plantilla del cliente, porque Pi 1.5.2 omite los kwargs de chat-template para modelos no razonadores.
- El benchmark del autor es propio y acotado (48 ejecuciones, tareas locales de reparación en Python), no un estándar de la industria; el propio autor niega superioridad de fiabilidad estadísticamente establecida.
- Conversión no oficial: no es un release de Qwen, harness-hub ni Splash; la licencia Apache 2.0 se hereda del base y conviene verificar los términos del adaptador upstream antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Draft para decodificación especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Provenance: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/blob/main/provenance.json
- Licencia: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/blob/main/LICENSE
- NOTICE: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/blob/main/NOTICE
- Receta de conversión: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/tree/main/reproduction
- Gráfico del benchmark: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/blob/main/assets/coding-benchmark.svg
- Código de ploteo: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M/blob/main/benchmarks/plot_broad.py
