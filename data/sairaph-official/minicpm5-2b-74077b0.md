# sairaph-official/MiniCPM5-2B-74077b0

## Resumen

MiniCPM5-2B es un modelo de lenguaje causal denso de aproximadamente 2.500 millones de parametros desarrollado por OpenBMB, disenado especificamente para despliegue local en dispositivos con recursos limitados (moviles, edge, asistentes locales). La version aqui documentada es una conversion al formato LiteRT-LM (anteriormente TensorFlow Lite) realizada por la comunidad `litert-community` y replicada sin modificaciones por `sairaph-official`, pensada para inferencia completamente on-device en Android y otros entornos edge.

El modelo emplea una arquitectura Transformer estandar tipo `LlamaForCausalLM` con 42 capas, atencion GQA (16 cabezas de consulta y 2 de clave/valor, dimension de cabeza 128), tamano oculto 2048 y contexto nativo de 131.072 tokens. Incorpora razonamiento hibrido mediante una plantilla `<think>` (`enable_thinking`), soporte nativo de tool calling en la plantilla de chat y una ventana de contexto larga poco habitual en modelos de su tamano.

Su relevancia actual radica en la combinacion de tamano reducido, contexto muy largo y capacidades de razonamiento y uso de herramientas, empaquetadas en ficheros LiteRT-LM de 1,55 GB (int4) y 2,55 GB (int8) que pueden ejecutarse en telefonos y hardware edge sin GPU dedicada. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `LlamaForCausalLM` estandar |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 1.981.982.720 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8; int8 dinamico channelwise (`dynamic_wi8_afp32`); variantes CPU-only mixtas INT4/INT8 con activaciones FP32 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, derivado de TFLite); no se distribuyen safetensors ni GGUF en este repositorio |
| Capas | 42 |
| Cabezas de atencion | 16 (Q) / 2 (KV), GQA, head dim 128 |
| Tamano oculto / intermedio | 2048 / 6144 |
| Vocabulario | 130.560 tokens |
| Tamano del repositorio | 4,1 GB |
| Libreria | litert |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal denso convencional con normalizacion y atencion agrupada por consultas (GQA), lo que reduce el coste de memoria KV durante la inferencia en contexto largo. Con 42 capas, 16 cabezas de consulta y solo 2 de clave/valor, el modelo mantiene un equilibrio entre capacidad expresiva y huella de memoria, algo critico para despliegue on-device. El vocabulario de 130.560 tokens sugiere un tokenizador multilingue amplio orientado a ingles y chino.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La model card del repositorio LiteRT-LM se centra en la conversion y el empaquetado para inferencia, no en el proceso de entrenamiento del modelo base. La innovacion tecnica destacable en esta distribucion es la propia conversion a LiteRT-LM: cuantizacion int4 blockwise con rotacion Hadamard (OCTAV) en las proyecciones lineales, cuantizacion dinamica int8 channelwise, y una plantilla de chat que expone un canal `thought` (`<think>` / `</think>`) integrado con el `ThinkingConfig` del runtime, ademas de parseo nativo de llamadas a herramientas con la sintaxis `<function name=…>`.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento hibrido: un mismo checkpoint funciona como asistente rapido o como razonador deliberado mediante `enable_thinking` y el canal `<think>`.
- Tool calling / function calling nativo en la plantilla de chat, con parseo de llamadas `<function name=…>` por parte del runtime.
- Flujos de agente y razonamiento multi-paso, apoyados por el modo thinking y el soporte de herramientas.
- Contexto largo de 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades de codigo y matematicas: no se documentan explicitamente en la informacion disponible, aunque el modelo se presenta orientado a asistentes locales y agentes de codigo.
- Sin soporte de vision ni audio documentado en esta version.

## Casos de uso

- Asistente local en movil: integrado via LiteRT-LM en una app Android (por ejemplo Edge Gallery), el fichero int4 de 1,55 GB permite respuestas directas y razonamiento corto sin conexion, aprovechando el contexto de 131.072 tokens para mantener historiales largos de conversacion.
- Agente de codigo en el dispositivo: la plantilla de chat con tool calling permite que el modelo invoque funciones locales (busqueda, ejecucion de comandos, APIs del sistema) en flujos multi-paso, util para asistentes de desarrollo embebidos en el terminal o el IDE.
- Procesamiento de documentos largos offline: con 131.072 tokens de contexto, el modelo puede resumir, extraer informacion o responder preguntas sobre contratos, manuales o articulos sin enviar datos a la nube, lo que resulta relevante por privacidad.
- Atencion al cliente en dispositivos edge: desplegado en kioscos o terminales de bajo consumo, gestiona conversaciones multi-turno en ingles o chino con razonamiento controlado (int8 para cadenas de pensamiento que deben completarse).
- Automatizacion de tareas con herramientas en entornos restringidos: el soporte nativo de function calling permite orquestar acciones como consultas a bases de datos locales o envio de correos en aplicaciones de escritorio o moviles sin backend.
- Prototipado e investigacion en IA on-device: los ficheros LiteRT-LM y las variantes CPU-only (INT4/INT8 con activaciones FP32) permiten experimentar con cuantizacion y latencia en hardware edge sin GPU, comparando recetas de cuantizacion sobre el mismo checkpoint.
- Asistente de accesibilidad o productividad personal: integrado en apps de notas o correo, el modo sin thinking ofrece respuestas rapidas y el modo thinking se activa solo cuando se requiere razonamiento, optimizando bateria y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; solo describe el comportamiento cualitativo de las cadenas de razonamiento (las del int8 son aproximadamente 3-4 veces mas cortas que las del int4 en las mismas preguntas y terminan donde el int4 agota el presupuesto de tokens).

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int4 ocupa 1,55 GB y el int8 2,55 GB; la memoria de trabajo debe sumar la cache KV para el contexto utilizado, que crece de forma lineal con los tokens (GQA con 2 cabezas KV y head dim 128 reduce este coste frente a atencion multi-cabeza completa).
- GPU recomendadas: no se especifican; el objetivo es CPU y GPU integradas en moviles y edge. No se documenta soporte para A100, H100 ni RTX 4090 en esta distribucion.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4-6 GB de memoria libre para el fichero int8 mas cache KV, aunque el formato LiteRT-LM esta pensado para aceleradores moviles (GPU/NPU de telefonos) y CPU.
- Nota iOS: el fichero int8 (2,54 GB de seccion principal de pesos) supera lo que una app iOS mapea por defecto; requiere el entitlement `com.apple.developer.kernel.increased-memory-limit` (no verificado con este fichero).
- Opciones de despliegue: runtime LiteRT-LM (version 0.18.0 o superior para el fichero int4; 0.16 o superior para el int8), app Edge Gallery en Android, integracion directa en apps Android/iOS mediante la libreria LiteRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B (LiteRT-LM, esta ficha) | ~2,5B denso | 131.072 | `.litertlm`, on-device | Apache-2.0 | Razonamiento hibrido y tool calling; ficheros de 1,55 GB / 2,55 GB |
| Gemma 3 1B / 4B (referencia de categoria) | 1B / 4B | no disponible en esta ficha | LiteRT, GGUF, safetensors | Gemma license | Familia de Google para edge; comparacion cualitativa, sin datos de rendimiento en esta ficha |
| Qwen2.5 1.5B / 3B (referencia de categoria) | 1,5B / 3B | hasta 32.768 en variantes pequenas | GGUF, safetensors, etc. | Apache-2.0 (mayoria de variantes) | Alternativa popular para despliegue local; sin datos comparativos de benchmarks en esta ficha |

No se dispone de datos de benchmarks en la informacion proporcionada para establecer una comparacion cuantitativa fiable con estos modelos; la tabla es orientativa en cuanto a categoria y formato.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como todo modelo de 2,5B, la tasa de errores facticos puede ser elevada, especialmente en modo sin thinking.
- Razonamiento en int4: las cadenas de pensamiento del fichero int4 son mas largas y pueden agotar el presupuesto de tokens; para razonamiento que deba completarse se recomienda el int8.
- Compatibilidad de runtime: el fichero int4 exige litert-lm 0.18.0 o superior y el int8 litert-lm 0.16 o superior; versiones anteriores no pueden crear conversaciones con el modelo.
- Memoria en iOS: el int8 puede superar el limite de mapeo por defecto sin el entitlement de memoria incrementada.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio de Sairaph anade el fichero LICENSE por su cuenta (el repositorio upstream no lo incluia); conviene verificar la procedencia y los avisos al redistribuir.
- Mirror sin modificaciones: este repositorio es una copia byte a byte de `litert-community/MiniCPM5-2B` en el commit `74077b06`; no incluye safetensors, GGUF ni otros formatos, y algunos ficheros mencionados en la model card upstream no estan replicados.
- Sin datos de entrenamiento ni evaluaciones publicadas en la informacion disponible, lo que dificulta estimar sesgos y rendimiento real en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/MiniCPM5-2B-74077b0
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/MiniCPM5-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- LiteRT-LM (documentacion): https://ai.google.dev/edge/litert-lm
- Instrucciones de conversion MiniCPM5 en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/models/minicpm5/README.md#model-conversion
- Configuracion oficial models/minicpm5: https://github.com/google-ai-edge/LiteRT-LM/tree/4a363c07/models/minicpm5
- Repositorio OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- App Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Edge Gallery releases (APK): https://github.com/google-ai-edge/gallery/releases
- Paper referenciado (arXiv:2506.07900): https://arxiv.org/abs/2506.07900
