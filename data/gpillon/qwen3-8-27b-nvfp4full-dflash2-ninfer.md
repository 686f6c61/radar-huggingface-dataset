# gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer

## Resumen

Qwen3.8-27B-nvfp4full-dflash2-NInfer es un artefacto de inferencia en formato nativo NInfer (`.ninfer`) que contiene el modelo denso multimodal Qwen3.8-27B de Qwen, cuantizado al perfil completo NVFP4 (W4A4) y con el módulo de decodificación especulativa DFlash2 integrado. Lo publica el usuario gpillon como evolución de la imagen v1 de cometkim, y está pensado exclusivamente para ejecutarse con el fork `gpillon/ninfer`, una variante del motor NInfer optimizada para cargas de trabajo de agentes de codificación con ráfagas de peticiones de subagentes que comparten prefijos largos casi idénticos.

El artefacto combina los 1.259 objetos base de la versión v1 (bit a bit idénticos) con 66 objetos adicionales correspondientes al módulo DFlash2: un drafter de 5 capas con ventana deslizante de 2048 tokens, ancho oculto de 5120, rango de selector 256 y top-k 16. El resultado son 1.325 objetos almacenados, 281 tensores NVFP4 y 9 tensores de excepción en BF16, con un tamaño total de 18,07 GiB. No es un checkpoint de Transformers, ni una distribución Safetensors ni un archivo GGUF.

La relevancia de este modelo reside en que aborda un problema concreto de producción: cuando múltiples subagentes comparten un mismo prompt de sistema y esquemas de herramientas (hasta un 98 % de contenido redundante), el motor fork evita recomputar el prefill completo gracias a una caché de KV en RAM del host, reutilización de prefijos y carriles etiquetados (`@main`, `@agents`, `@classifier`). Esto convierte ráfagas de peticiones casi idénticas en restauraciones de caché de decenas a pocos cientos de milisegundos, en lugar de colas de prefills redundantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso hibrido: 64 capas, 16 de atencion completa (intervalo 4) y 48 de atencion lineal con estado recurrente; vision-language |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 completo (W4A4), con 9 tensores de excepcion en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto NInfer (.ninfer), 19.406.942.468 bytes (18,07 GiB), SHA-256 `abb1e120d5f1f32d61689604d238227ff579ab76cbd9319628f3b3904fffd9af` |

## Arquitectura y entrenamiento

Qwen3.8-27B es el miembro denso de 27 mil millones de parametros de la familia Qwen3.8, construido sobre el mismo backbone de atencion hibrida que el modelo MoE insignia de 2,4 billones. De las 64 capas, solo 16 ejecutan atencion completa (con un intervalo `full_attention_interval: 4`); las otras 48 usan atencion lineal con un estado recurrente constante, lo que reduce el coste computacional en contextos largos. El modelo incorpora capacidades de vision (pipeline image-text-to-text), razonamiento y generacion de codigo agente.

Este artefacto concreto no es un entrenamiento nuevo, sino una cuantizacion y un empaquetado. Los pesos base provienen de dos fuentes: las capas MLP 0-55 (112 capas) se copian bit a bit de `unsloth/Qwen3.8-27B-NVFP4`, y el resto de tensores, excepciones BF16, endpoints W8, MTP, vision y frontend se heredan del artefacto v1 de cometkim, que a su vez deriva de `Qwen/Qwen3.8-27B` en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. El modulo DFlash2 es un checkpoint local de `DFlash2DraftModel` no publicado de forma independiente, con configuracion `target_layer_ids = [5, 19, 33, 47, 61]`, `selector_rank = 256`, `selector_top_k = 16` y `block_size = 8`. Su error relativo de Frobenius frente a los 34 padres NVFP4 es maximo 0,0959 y medio 0,0950 (cuantizacion solo de pesos).

La innovacion principal no esta en el modelo, sino en el motor: el fork `gpillon/ninfer` anade una caché de KV en RAM del host con dos niveles (probation/protected), logica de reutilizacion de prefijos, carriles etiquetados para proteger la conversacion principal de la evacuacion, correcciones de bugs de corrupcion silenciosa de KV y DFlash2 funcional de extremo a extremo.

## Capacidades

- Generacion de texto conversacional y multimodal (entrada imagen y texto, salida texto).
- Razonamiento paso a paso y modo think, heredado de la familia Qwen3.8.
- Generacion de codigo y agentic coding, con soporte para patrones de subagentes multiples.
- Tool calling y parsing de llamadas a herramientas con soporte de streaming endurecido.
- Ventana de contexto de 256K tokens para analisis de documentos largos.
- Decodificacion especulativa DFlash2 integrada en el artefacto, con drafter de 5 capas y ventana deslizante de 2048.
- Capacidades multilingues del modelo base, aunque los idiomas concretos no estan documentados en la model card del artefacto.
- Reutilizacion de prefijos entre peticiones concurrentes (hasta ~99 % del prefijo compartido) gracias al motor fork.

## Casos de uso

- Agentes de codificacion con subagentes en rafaga: el caso de diseno del fork. Herramientas como Qwen Code lanzan multiples subagentes que comparten el mismo prompt de sistema y esquemas de herramientas (~98 % identicos). Con este artefacto, cada subagente restaura la caché de KV en decenas a pocos cientos de milisegundos en lugar de recomputar el prefill completo.
- Asistente de codigo con sesion larga protegida: el carril `@main` evita que la conversacion principal sea evacuada por trafico de corta duracion, de modo que una sesion de programacion de horas no se re-prefille en el peor momento.
- Analisis de documentos largos con vision: con 256K de contexto y entrada de imagenes, permite procesar capturas de pantalla, diagramas y documentos extensos en una sola pasada.
- Despliegue local privado en GPU Blackwell consumer: pensado para RTX 5090, permite ejecutar un modelo de 27B multimodal sin enviar datos a APIs externas, relevante para codigo propietario o datos sensibles del cliente.
- Inferencia de baja latencia con decodificacion especulativa: el modulo DFlash2 integrado acelera la generacion token a token, util para autocompletado interactivo en editores y asistentes en tiempo real.
- Clasificacion y enrutado de peticiones en paralelo: el carril `@classifier` permite ejecutar llamadas cortas de clasificacion sin que interfieran con cargas largas, gracias a la politica de admision y evacuacion del scheduler.
- Pipeline de CI/CD con generacion de codigo: la combinacion de tool calling, contexto largo y restauracion rapida de caché permite integrar el modelo en flujos de revision de codigo automatizada donde multiples tareas comparten el mismo contexto de repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta cuantizacion concreta. El modelo base Qwen3.8-27B tiene evaluaciones publicadas (por ejemplo, MathVision con prompt fijo de razonamiento paso a paso), pero no se proporcionan cifras concretas en la documentacion de este artefacto.

Los unicos datos de rendimiento medidos corresponden al efecto del fork sobre el motor original: las peticiones hermanas que antes pagaban un prefill completo ahora restauran en decenas a pocos cientos de milisegundos, y una rafaga de subagentes que comparten prefijo de sistema y herramientas reutiliza ~99 % del mismo en lugar de hacer cola.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 18,07 GiB, por lo que se necesita una GPU con al menos esa cantidad de memoria libre para los pesos, mas la caché KV y los buffers de activacion.
- GPU recomendadas: arquitectura Blackwell. La documentacion menciona explicitamente RTX 5090; el modelo base se despliega en H200, RTX PRO 6000 y DGX Spark segun la documentacion de SGLang.
- Encaje en GPU consumer: si, en RTX 5090 (32 GB VRAM) y similares con 24 GB o mas, siempre que el contexto no sea excesivo.
- Opciones de despliegue: exclusivamente con el fork `gpillon/ninfer` en la rama `feat/dflash2-local`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario de este motor.
- RAM del host: recomendable disponer de RAM adicional para la caché de KV en dos niveles (probation/protected), que es la clave del rendimiento en rafagas de subagentes.
- Latencia y throughput: no hay cifras absolutas publicadas. Los datos relativos indican restauracion de prefijos compartidos en decenas a pocos cientos de milisegundos y reutilizacion de ~99 % del prefijo en rafagas concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27B denso | 256K | Safetensors (BF16) | Apache 2.0 | vLLM, SGLang, Transformers |
| unsloth/Qwen3.8-27B-NVFP4 | 27B denso | 256K | NVFP4 (W4A4) | Apache 2.0 | vLLM, SGLang, Unsloth |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B denso | 256K | Artefacto .ninfer con DFlash2 | Apache 2.0 | Solo gpillon/ninfer (fork) |

La diferencia frente a las dos alternativas es doble. Primero, el formato: mientras que el modelo original y la cuantizacion de Unsloth son interoperables con los motores estandar (vLLM, SGLang), este artefacto solo se ejecuta en el fork `gpillon/ninfer`, lo que reduce su portabilidad a cambio de funciones especificas del motor. Segundo, el modulo DFlash2 de decodificacion especulativa va integrado en el propio artefacto, de modo que no requiere configuracion adicional por parte del usuario. La cuantizacion NVFP4 es la misma en origen (los pesos de las capas MLP se copian bit a bit de Unsloth), por lo que la calidad de generacion deberia ser equivalente a la de `unsloth/Qwen3.8-27B-NVFP4`.

## Limitaciones y advertencias

- Formato no estandar: el artefacto `.ninfer` no es un checkpoint de Transformers ni un archivo GGUF. No se puede cargar con vLLM, llama.cpp, Ollama ni TGI. Requiere obligatoriamente el fork `gpillon/ninfer` en la rama `feat/dflash2-local`.
- Dependencia de un fork no oficial: el motor es una cadena de forks (Neroued/ninfer original, port a Windows, kernel-perf, y el fork de gpillon). La estabilidad y el mantenimiento a largo plazo dependen de un mantenedor individual.
- Sin benchmarks publicados: no hay metricas de calidad para esta cuantizacion concreta. El error de Frobenius del modulo DFlash2 (maximo 0,0959) indica una degradacion no despreciable en el drafter, aunque es cuantizacion solo de pesos.
- Idiomas no documentados: la model card no especifica los idiomas soportados por el artefacto, aunque el modelo base Qwen3.8 es multilingue.
- Correcciones de bugs recientes: el fork documenta dos bugs de corrupcion silenciosa de KV (restauracion de checkpoint de reescritura y side store de clave exacta en hyperquant), ambos casos de una peticion sirviendose con el estado de otra. Estos bugs estan corregidos, pero indican que el motor es joven y puede contener problemas residuales.
- Hardware especifico: optimizado para Blackwell; en GPUs de generaciones anteriores el rendimiento puede degradarse o no ser compatible.
- Sin soporte de la comunidad estandar: al no integrarse en ecosistemas como Hugging Face Transformers o vLLM, el soporte, la documentacion y la resolucion de incidencias se limitan al repositorio del fork.
- Riesgo de alucinacion y sesgos: los correspondientes al modelo base Qwen3.8-27B, no documentados en detalle en esta model card.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion NVFP4 de origen: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Artefacto v1 (imagen previa): https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Fork del motor gpillon/ninfer: https://github.com/gpillon/ninfer
- Motor original NInfer: https://github.com/Neroued/ninfer
- Documentacion de cambios del fork: https://github.com/gpillon/ninfer/blob/feat/dflash2-local/docs/maintainer/gpillon-fork-changes.md
- Documentacion de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
