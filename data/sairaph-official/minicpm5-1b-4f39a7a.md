# sairaph-official/MiniCPM5-1B-4f39a7a

## Resumen

MiniCPM5-1B es un modelo de lenguaje causal denso de aproximadamente 1.080 millones de parametros (1B) desarrollado por OpenBMB. Se trata del primer modelo de la serie MiniCPM5, disenado especificamente para despliegue local y en dispositivos con recursos limitados (edge computing), y aspira a ser el estado del arte en codigo abierto dentro de su clase de tamano. La arquitectura es un transformer estandar tipo `LlamaForCausalLM` con 24 capas y atencion GQA (16 cabezas de consulta, 2 de clave-valor), con una longitud de contexto nativa de 131.072 tokens.

El repositorio aqui descrito (`sairaph-official/MiniCPM5-1B-4f39a7a`) no contiene los pesos originales en safetensors, sino una copia espejo (mirror) sin modificaciones de los ficheros publicados por `litert-community/MiniCPM5-1B`, empaquetados en formato LiteRT-LM (`.litertlm`, anteriormente TensorFlow Lite) para inferencia totalmente en dispositivo. La libreria es `litert` y el artefacto principal es un fichero de 792.619.648 bytes (~0,8 GB) con cuantizacion mixta INT4 en bloques de 32 para capas lineales e INT8 para embeddings y cabeza de salida, con activaciones FP32.

Su relevancia actual radica en que combina una ventana de contexto muy amplia (131.072 tokens) con un tamano de 1B que cabe en dispositivos moviles, y ofrece razonamiento hibrido (modo pensamiento activable mediante `enable_thinking`) junto con soporte de tool calling gestionado por el runtime. La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, `LlamaForCausalLM` estandar |
| Parametros totales | 1.080.632.832 (~1B); 679.552.512 no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | W4: INT4 bloque-32 (lineales) + INT8 (embed y lmhead) con activaciones FP32 (`wi4b32_wi8_afp32`); W8 dinamico weight-only con activaciones FP32 (`dynamic_wi8_afp32`); variante `_gpu_opt` optimizada para GPU |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`); el modelo base upstream esta en formato original de OpenBMB (no incluido en este repo) |
| Capas | 24 |
| Cabezas de atencion (GQA) | 16 (Q) / 2 (KV) |
| Runtime requerido | litert-lm 0.18.0 o superior (probado en 0.18.0) |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso convencional (`LlamaForCausalLM`) con 24 capas, atencion con grouped-query attention (16 cabezas de consulta y 2 de clave-valor) y 1.080 millones de parametros totales, de los cuales 679 millones son no-embedding. El contexto nativo alcanza los 131.072 tokens. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion no esta en el modelo base sino en el empaquetado para edge: la conversion a LiteRT-LM con cuantizacion mixta (INT4 por bloques de 32 en capas lineales, INT8 en embeddings y cabeza de salida, activaciones FP32) y una variante optimizada para ejecucion en GPU. El runtime LiteRT-LM incorpora la configuracion oficial de MiniCPM5, de modo que el modo pensamiento esta desactivado salvo que se active `enable_thinking`, el razonamiento se entrega por un canal separado (`thought channel`) y las llamadas a herramientas son parseadas por el propio runtime.

## Capacidades

- Generacion de texto y razonamiento: modo hibrido con un unico checkpoint que actua como asistente rapido o como razonador deliberado mediante la plantilla `<think>` y el flag `enable_thinking`.
- Razonamiento dificil: el autor declara estado del arte en su clase de 1B en razonamiento complejo, uso de herramientas y generacion de codigo.
- Generacion de codigo y agentes de codificacion: disenado explicitamente para flujos de trabajo con agentes y tool use.
- Tool calling / function calling: soportado, con parseo de llamadas a herramientas realizado por el runtime LiteRT-LM.
- Razonamiento multi-paso y agentes: orientado a asistentes locales y flujos de agente en dispositivo.
- Capacidades multilingues: limitadas a ingles y chino.
- Contexto largo: ventana nativa de 131.072 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Ejecucion totalmente on-device: inferencia local sin conexion en hardware movil y edge.

## Casos de uso

- Asistente local en movil sin conexion: con un fichero de ~0,8 GB y runtime LiteRT-LM, el modelo puede ejecutarse integramente en un telefono Android mediante la Edge Gallery App o la app LLM Server, sirviendo como asistente personal sin enviar datos a la nube.
- Agente de codificacion en dispositivo: el modelo declara fortaleza en generacion de codigo y soporta tool calling, por lo que puede integrarse en editores o entornos locales para autocompletado, explicacion de fragmentos y llamadas a herramientas del sistema.
- Procesamiento de documentos largos en edge: los 131.072 tokens de contexto permiten resumir o consultar manuales, contratos o expedientes completos sin truncar, en un dispositivo local.
- Automatizacion de flujos con herramientas: el parseo de tool calls por parte del runtime permite construir pipelines de agente que invoquen APIs locales o funciones del dispositivo (calendario, ficheros, calculadora) de forma estructurada.
- Razonamiento deliberado bajo demanda: activando `enable_thinking` se obtiene un modo de razonamiento paso a paso para tareas de matematicas o logica, y desactivandolo se recupera un asistente de baja latencia para consultas simples.
- Despliegue en hardware con recursos muy limitados: la cuantizacion W4 y la variante W8 dinamica permiten ejecutar el modelo en dispositivos con poca memoria, habilitando asistentes embebidos en IoT o equipos de gama baja.
- Prototipado rapido de aplicaciones LLM en Android: la importacion directa desde Hugging Face en la Edge Gallery App reduce el tiempo de puesta en marcha para pruebas de concepto.

## Benchmarks y rendimiento

El autor publica una comparativa de precision entre la linea base FP (bf16) y la version cuantizada W4 en un benchmark de evaluacion por categorias (porcentajes). No se proporcionan resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

| Categoria | FP (bf16) | W4 |
|---|---|---|
| Overall | 66,16 | 60,91 |
| STEM | 58,07 | 53,36 |
| Social Science | 77,91 | 70,87 |
| Humanities | 67,65 | 64,35 |
| Other | 68,71 | 62,14 |
| Hard | 47,08 | 44,23 |

Condiciones de evaluacion: modo pensamiento desactivado para reducir uso de contexto, temperatura 0,6, top-p 0,95 y semilla aleatoria 0. La version W4 corresponde a cuantizacion mixta INT4-bloque32 (lineales) / INT8 (embed y lmhead) con activaciones FP32.

## Requisitos de hardware

- VRAM/memoria estimada: el artefacto W4 ocupa 792.619.648 bytes (~0,8 GB); la variante W8 dinamica y la FP seran sustancialmente mayores (no se indica el tamano exacto en la informacion disponible).
- GPU recomendadas: no se especifican modelos concretos. La variante `minicpm_wi4b32_wi8_afp32_gpu_opt.litertlm` esta optimizada para ejecucion en GPU, pero no se detalla que GPUs son compatibles.
- Compatibilidad con GPU de consumo: no disponible como dato explicito; por el tamano del modelo (1B en W4, <1 GB) es plausible en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- Despliegue: runtime LiteRT-LM 0.18.0 o superior; app Edge Gallery para Android (Google Play o APK desde GitHub); importacion via Hugging Face o fichero local (incluido `adb push`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con modelos alternativos de la misma clase (1B) en parametros, contexto, rendimiento o licencia. El autor solo afirma ser estado del arte en su clase de tamano para uso de herramientas, codigo y razonamiento, sin aportar la tabla comparativa correspondiente. Datos de modelos comparables: no disponible.

## Limitaciones y advertencias

- Idiomas: solo soporta ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Perdida de precision por cuantizacion: la version W4 cae del 66,16 % al 60,91 % en la evaluacion global, con descensos notables en Social Science (77,91 a 70,87) y en la categoria Hard (47,08 a 44,23). En produccion debe validarse la variante cuantizada frente a la FP para la tarea concreta.
- Riesgo de alucinacion: inherente a los modelos de 1B; no se documentan mitigaciones especificas.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Dependencia de runtime: requiere litert-lm 0.18.0 o superior; el modo pensamiento y el parseo de tool calls dependen de la configuracion oficial del runtime, no del propio fichero de pesos.
- Licencia: Apache-2.0 permite uso comercial, pero esta copia espejo no incluye los ficheros de aviso originales (el mirror anade una copia literal de la licencia Apache-2.0); conviene verificar la procedencia upstream.
- Repositorio espejo: no es el repositorio oficial; es una copia byte a byte de `litert-community/MiniCPM5-1B` en el commit `4f39a7a`, con 0 descargas y 0 likes en el momento de la consulta.
- Contexto largo: aunque se declaran 131.072 tokens, no se documenta el rendimiento real en contextos proximos al limite.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/MiniCPM5-1B-4f39a7a
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/MiniCPM5-1B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- LiteRT-LM (documentacion): https://ai.google.dev/edge/litert-lm
- Edge Gallery App (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Edge Gallery (releases APK): https://github.com/google-ai-edge/gallery/releases
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Licencia del modelo base (OpenBMB): https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
- Paper (referencia arXiv en tags): arXiv:2506.07900
