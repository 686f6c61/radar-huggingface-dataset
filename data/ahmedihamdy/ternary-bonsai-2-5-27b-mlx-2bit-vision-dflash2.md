# ahmedihamdy/Ternary-Bonsai-2.5-27B-MLX-2bit-vision-DFLASH2

## Resumen

Ternary-Bonsai-2.5-27B-MLX-2bit-vision-DFLASH2 es un empaquetado comunitario para Apple Silicon que combina dos modelos en un único repositorio: el modelo objetivo Ternary Bonsai 2.5 27B de Prism ML (una destilación ternaria de Qwen 3.8 27B con torre de visión) y el modelo borrador DFlash2 de z-lab para decodificación especulativa. El resultado es un modelo multimodal de 27 359 638 768 parámetros que ocupa unos 9,5 GB en disco y alrededor de 9,2 GB de memoria en inferencia, lo que permite ejecutarlo en un Mac con 16 GB de RAM unificada.

El modelo resuelve un problema concreto: desplegar un transformer de 27B con capacidades de visión, razonamiento y tool calling en hardware de consumo Apple, sin renunciar a una ventana de contexto de hasta 262 144 tokens. La cuantización ternaria (pesos restringidos a -1, 0 y +1) es la clave que hace viable esta reducción de huella, mientras que el borrador DFlash2 acelera la decodificación mediante especulación verificada por el modelo grande.

Es relevante ahora porque demuestra que la combinación de cuantización extrema (2 bits ternarios) con decodificación especulativa empaquetada permite llevar modelos de escala 27B a equipos locales, manteniendo la calidad del modelo objetivo en cada token generado. Es un build comunitario, no una release oficial de Prism ML ni de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con pesos ternarios; incluye torre de visión y cabeza MTP opcional; borrador DFlash2 para decodificación especulativa |
| Parametros totales | 27 359 638 768 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Ternaria de 2 bits (pesos en {-1, 0, +1}); borrador DFlash2 con capas lineales a 4 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo objetivo es Ternary Bonsai 2.5 27B, entrenado por Prism ML a partir de Qwen 3.8 27B. La innovación central es la ternarización de los pesos: cada peso se restringe a tres valores (-1, 0, +1), lo que reduce la huella de los 27B parámetros a unos 8 GB. El modelo conserva la torre de visión del Qwen original, una tabla de signos, el tokenizador, la configuración y una cabeza MTP (multi-token prediction) opcional. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El componente de aceleración es el borrador DFlash2 de z-lab, entrenado contra Qwen 3.8 27B (el modelo del que deriva Bonsai 2.5) y que lee los estados ocultos de 5 de las 64 capas del modelo objetivo. En este empaquetado, las capas lineales del borrador se almacenan a 4 bits mediante la misma llamada que usa Astronomical al cargar el borrador en bf16, de modo que los pesos servidos son idénticos bit a bit y el download del borrador baja de 3,6 GB a 1,2 GB. Las normas, kernels de convolución y codebooks del selector se mantienen tal como se publicaron. La decodificación especulativa funciona con un árbol de borradores (draft-tree): el modelo pequeño propone los siguientes tokens y el grande verifica todas las propuestas en un solo paso, aceptando solo aquellas que coinciden con su propia distribución muestreada a la temperatura de la petición.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento previo a la respuesta (el modelo "reasona antes de contestar", según la model card).
- Comprensión de imágenes y entrada multimodal image-text-to-text.
- Tool calling / function calling.
- Soporte de agentes de codificación mediante `astronomical launch claude`, `codex` y `opencode`.
- Ventana de contexto larga de hasta 262 144 tokens para conversaciones multi-turno.
- Decodificación especulativa con borrador DFlash2 integrado (solo en mensajes de texto; con imágenes se decodifica token a token).
- Compatibilidad con la API local de Astronomical, que expone interfaces compatibles con OpenAI y Anthropic.

## Casos de uso

- Asistente conversacional privado en Mac: el modelo gestiona conversaciones multi-turno de hasta 262 144 tokens sin que ningún dato salga del equipo, gracias a la ejecución local vía Astronomical y a su huella de 9,2 GB.
- Agente de codificación local: mediante `astronomical launch claude` o `codex` se puede lanzar un agente que ejecuta tool calling sobre el modelo, adecuado para tareas de refactorización y generación de funciones en un entorno sin conexión.
- Análisis de imágenes con preguntas en lenguaje natural: la torre de visión permite consultas del tipo "¿qué hay en esta imagen?" desde la CLI o la app, útil para inspección de capturas, diagramas o documentación visual.
- Automatización de atención al cliente en inglés: el contexto largo y el soporte de tool calling permiten integrar el modelo en flujos de soporte que consultan APIs internas, siempre que el despliegue sea local.
- Prototipado de pipelines multimodales: al exponer una API compatible con OpenAI y Anthropic, se puede conectar a herramientas existentes para pruebas de concepto de image-text-to-text sin coste de infraestructura cloud.
- Evaluación de cuantización ternaria en investigación: el repositorio permite reproducir experimentos sobre cómo afecta la ternarización de pesos a tareas de razonamiento y visión, con verificación de integridad mediante SHA-256 de cada archivo.
- Generación de código en scripts de terminal: el comando `astronomical respond` con prompts de programación (por ejemplo, fusionar listas ordenadas en Python) sirve para tareas puntuales de desarrollo sin salir de la terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Disco: aproximadamente 9,5 GB para la descarga completa (modelo objetivo más borrador empaquetado).
- Memoria: aproximadamente 9,2 GB de memoria de modelo con una conversación de 5000 tokens, incluyendo modelo y borrador; cabe en un Mac con 16 GB de RAM unificada.
- Plataforma: Apple Silicon, macOS 14 o posterior; la librería es MLX.
- La decodificación especulativa solo se activa cuando el modelo completo y su borrador están en memoria; con un límite de memoria inferior el modelo sigue funcionando pero decodifica token a token.
- Las respuestas a mensajes con imagen también decodifican token a token; el drafting se reanuda en el siguiente mensaje solo de texto.
- Despliegue: app Astronomical (versión posterior a 0.2.135) o CLI `astronomical`; también accesible vía API local compatible con OpenAI y Anthropic.
- VRAM/GPU dedicadas, latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-MLX-2bit-vision-DFLASH2 | 27,36B | 262 144 | Ternaria 2 bits + borrador 4 bits | apache-2.0 | Apple Silicon (MLX) |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit | 27B (según nombre) | no disponible | Ternaria 2 bits | no disponible | Apple Silicon (MLX) |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (borrador) | no disponible | bf16 original; 4 bits en este build | no disponible | MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un build comunitario de ahmedihamdy, no una release oficial de Prism ML ni de Qwen; el soporte y las garantías dependen del autor del repositorio.
- Solo soporta inglés según el campo `language` de la model card.
- La decodificación especulativa no está activa en respuestas con imagen ni cuando la memoria asignada es insuficiente, lo que reduce el rendimiento en esos escenarios.
- La cuantización ternaria puede degradar la calidad frente al Qwen 3.8 27B original; no se han publicado benchmarks que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos publicados sobre mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- La licencia apache-2.0 permite uso comercial, pero al derivar de Qwen 3.8 27B conviene verificar las condiciones de la licencia del modelo base original.
- Requiere hardware Apple Silicon y macOS 14 o posterior; no es desplegable en GPU NVIDIA ni en entornos Linux estándar con las herramientas habituales (vLLM, TGI, llama.cpp).
- El borrador DFlash2 fue entrenado contra Qwen 3.8 27B, no específicamente contra Bonsai 2.5; Prism ML no publica un borrador propio para este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ternary-Bonsai-2.5-27B-MLX-2bit-vision-DFLASH2
- Modelo base objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Modelo borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Astronomical (descarga para Mac): https://github.com/aosama/astronomical/releases/latest
- Astronomical (web oficial): https://getastronomical.com/
- Astronomical (API local): https://getastronomical.com/local-api.html
