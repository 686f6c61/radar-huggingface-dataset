# aether-models/aether-kit-qwen3-0.6b

## Resumen

AetherKit Qwen3-0.6B es un bundle de inferencia derivado de Qwen/Qwen3-0.6B, convertido por el proyecto aether-models para su uso en AetherKit, un framework de ejecucion de modelos en dispositivo (Core AI) para macOS e iOS. No se trata de un modelo entrenado desde cero ni de un fine-tune con datos nuevos: es una exportacion de los pesos originales de Qwen3-0.6B a formato float16 empaquetado para Core AI, acompanada del tokenizer upstream y de un manifiesto `language-model.json`. Su proposito es permitir que la aplicacion de ejemplo de AetherKit descargue e instale un modelo funcional sin configuracion manual por parte del usuario.

El modelo hereda por completo las caracteristicas del Qwen3-0.6B original: arquitectura transformer densa de aproximadamente 0,6 mil millones de parametros, Capacidad de generacion de texto y licencia Apache 2.0. La unica diferencia respecto al original es el formato de pesos y el limite de contexto fijado en el bundle, de 4.096 tokens, inferior al contexto nativo del modelo base.

Su relevancia es practica para desarrolladores de aplicaciones Apple que quieran integrar un LLM local sin depender de servicios en la nube. Al ser un artefacto de distribucion mas que un modelo nuevo, su utilidad depende del ecosistema AetherKit y no aporta mejoras de calidad sobre el Qwen3-0.6B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B) |
| Parametros totales | aproximadamente 0,6 mil millones (heredado del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en el bundle (mac/ e ios/) |
| Tipos de cuantizacion | float16 (unico formato publicado en el bundle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core AI (`model.aimodel/` + `language-model.json` + tokenizer upstream); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El bundle no incluye entrenamiento propio. Los pesos proceden de Qwen/Qwen3-0.6B en la revision `c1899de289a04d12100db370d81485cdf75e47ca`, y la model card indica explicitamente que "the weights are unchanged apart from the export to float16 Core AI packages". Por tanto, la arquitectura, los datos de entrenamiento, el proceso de alineacion (RLHF/DPO) y las innovaciones tecnicas son las del modelo Qwen3-0.6B original, que no se detallan en la informacion disponible.

La conversion consiste en empaquetar los pesos en precision float16 dentro de la estructura `model.aimodel/`, anadir el tokenizer upstream y generar un manifiesto `language-model.json` que describe el bundle. Se publican dos carpetas, `mac/` e `ios/`, cada una con un limite de contexto de 4.096 tokens. El acceso a los ficheros se gestiona mediante una entrada de catalogo de AetherKit que fija el repositorio a un commit concreto y registra el tamano y el SHA-256 de cada fichero; `ModelPreparation` se encarga de la descarga, verificacion e instalacion.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-0.6B.
- Inferencia local en dispositivo sobre macOS e iOS mediante Core AI, sin llamadas a servidores externos.
- Instalacion gestionada por AetherKit: descarga, verificacion de integridad por SHA-256 e instalacion desde una entrada de catalogo fijada a un commit.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el bundle no declara idiomas.

## Casos de uso

- Aplicacion de ejemplo de AetherKit: el bundle existe precisamente para que la app de muestra descargue un modelo operativo sin configuracion manual, sirviendo como referencia de integracion para desarrolladores.
- Prototipado de funciones de texto en apps iOS: permite validar flujos de generacion de texto en dispositivo con un contexto de 4.096 tokens antes de decidir si se necesita un modelo mayor.
- Funciones de texto sin conexion: al ejecutarse localmente, encaja en escenarios donde no se puede garantizar conectividad o donde no se desea enviar texto del usuario a un servicio externo.
- Procesamiento por lotes en macOS: la carpeta `mac/` permite ejecutar tareas de generacion de texto en un Mac con Core AI, por ejemplo resumenes o reformulaciones de documentos cortos.
- Base para evaluacion comparativa: util para medir el rendimiento de Core AI frente a otros runtimes (llama.cpp, MLX) con el mismo modelo Qwen3-0.6B como referencia.
- Pruebas de integracion continua: el pin a un commit concreto y los hashes SHA-256 permiten construir pipelines reproducibles que verifiquen la descarga e instalacion del bundle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, latencia ni throughput, y al tratarse de una exportacion sin cambios en los pesos, el rendimiento cualitativo seria el del Qwen3-0.6B original, cuyos datos no se aportan aqui.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita; el repositorio completo ocupa 1,2 GB y los pesos se distribuyen en float16, por lo que la huella en memoria es del orden de los aproximadamente 1,2 GB de pesos mas el overhead del runtime.
- GPU recomendadas: no aplica en el sentido habitual; el bundle esta orientado a Core AI sobre hardware Apple (Mac con macOS y dispositivos con iOS).
- Cabe en hardware de consumo: si, al estar disenado para macOS e iOS; no se especifican modelos concretos de dispositivo ni requisitos minimos de memoria.
- Opciones de despliegue: AetherKit con Core AI (`ModelPreparation` + entrada de catalogo). No se publican pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables a este bundle; para esos runtimes habria que usar el Qwen3-0.6B original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AetherKit Qwen3-0.6B | aproximadamente 0,6 mil millones | 4.096 tokens | Core AI (float16) | Apache 2.0 | Bundle para macOS/iOS via AetherKit |
| Qwen/Qwen3-0.6B | aproximadamente 0,6 mil millones | no disponible en esta ficha | safetensors (original) | Apache 2.0 | Modelo base; mismo comportamiento, sin limite de bundle |
| Otros modelos de aproximadamente 0,6 mil millones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: los pesos son identicos a Qwen3-0.6B; cualquier limitacion del original (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios.
- Contexto reducido a 4.096 tokens en el bundle, inferior al contexto nativo del modelo base; las tareas que requieran ventanas mayores no son viables con este artefacto.
- Unico formato disponible: float16 para Core AI. No hay variantes cuantizadas a 8 o 4 bits, lo que limita el ahorro de memoria en dispositivos ajustados.
- Dependencia del ecosistema AetherKit y de Core AI: no es portable a otros runtimes sin reconvertir el modelo original.
- La model card no declara idiomas soportados ni requisitos minimos de hardware; conviene verificar ambos antes de usarlo en produccion.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` del proyecto.
- El modelo base Qwen3-0.6B puede generar contenido incorrecto o inventado; en una app de usuario final conviene anadir filtros y avisos.

## Enlaces

- Hugging Face: https://huggingface.co/aether-models/aether-kit-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio AetherKit: https://github.com/bubstackdev/aether-kit
