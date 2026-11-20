# gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer

## Resumen

Qwen3.8-27B-nvfp4full-dflash2-NInfer es un artefacto de pesos cuantizados del modelo multimodal Qwen3.8-27B, publicado por el usuario gpillon. No es un checkpoint estándar de Transformers ni un fichero GGUF: se distribuye en el formato propietario `.ninfer` (19,4 GB) que solo leen los motores de inferencia NInfer y su bifurcación ignis. El artefacto combina la cuantización NVFP4 (W4A4) del modelo base con un módulo borrador de decodificación especulativa DFlash2 injertado directamente sobre los tensores existentes.

El modelo resuelve un problema muy concreto: ejecutar un modelo multimodal de 27B con contexto largo en una única GPU Blackwell de consumo (RTX 5090 o RTX PRO 6000), con velocidades de decodificación de hasta ~370 tok/s en picos y 1.065 tok/s agregados con ocho carriles concurrentes. Está diseñado para cargas de trabajo de agentes de código, donde múltiples subagentes comparten prefijos largos de sistema y herramientas.

La relevancia actual radica en su enfoque de ingeniería: el fork gpillon/ninfer añade caché KV en RAM del host con dos niveles de expulsión, reutilización de prefijos entre peticiones concurrentes, carriles etiquetados para proteger conversaciones largas y corrección de dos bugs silenciosos de corrupción de caché KV. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con cuantizacion NVFP4 W4A4 y modulo drafter DFlash2 de 5 capas con ventana deslizante |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 512K tokens con YaRN x2 |
| Tipos de cuantizacion | NVFP4 (W4A4); tensores de norma y conv-base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto nativo NInfer; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal (pipeline `image-text-to-text`) convertido a NVFP4 full, es decir, pesos y activaciones en 4 bits con escalas de punto flotante. Sobre ese artefacto v1 se injertó un módulo DFlash2 de decodificación especulativa compuesto por 66 objetos: 34 matrices de pesos NVFP4 y 32 tensores BF16 de norma y conv-base, configurando un borrador de 5 capas con ventana deslizante a la anchura oculta del modelo objetivo. Los 1.259 objetos base son idénticos bit a bit a la versión v1 publicada por cometkim, ya que el injerto se realizó sobre el artefacto existente en lugar de reconvertir desde cero.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable no está en el entrenamiento sino en el runtime: el fork gpillon/ninfer implementa caché KV en RAM del host con expulsión en dos niveles (probation/protected) que permite restaurar carriles en decenas o cientos de milisegundos en lugar de rehacer el prefill completo, reutilización de prefijos que aprovecha hasta el 99% de un prefijo compartido entre subagentes, y calibración adaptativa de la anchura de verificación MTP.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imágenes (pipeline `image-text-to-text`), con soporte de visión activable mediante `--vision-enabled`.
- Contexto largo de hasta 512K tokens mediante escalado YaRN x2, adecuado para conversaciones y documentos extensos.
- Decodificación especulativa con DFlash2 para acelerar la generación en cargas predecibles (código).
- Reutilización de prompt entre peticiones, pensada para cargas con system prompt y esquemas de herramientas repetidos.
- Soporte de tool calling y parsing de llamadas a herramientas endurecido en el fork.
- Capacidades de agente multi-paso mediante carriles etiquetados (`@main`, `@agents`, `@classifier`) que protegen la conversación principal de la expulsión.
- Servidor compatible con la API de OpenAI y Playground integrado, además de métricas Prometheus en el binario.

## Casos de uso

- Agentes de código en local: el modelo está optimizado para el patrón de ráfagas de subagentes casi idénticos que generan herramientas como Qwen Code; la reutilización de prefijos evita que cada subagente repita el prefill completo de un system prompt largo.
- Asistente de programación interactivo: con ~170 tok/s de media y ~370 tok/s en picos sobre una RTX 5090, ofrece latencia aceptable para autocompletado y generación de parches en un flujo de trabajo individual.
- Servidor multi-usuario ligero: los 1.065 tok/s agregados con ocho carriles concurrentes permiten atender a un equipo pequeño desde una sola GPU Blackwell.
- Análisis de documentos largos con imágenes: la ventana de 512K tokens con YaRN x2 y la entrada de imagen permiten procesar informes, capturas o diagramas junto con texto extenso en una sola petición.
- Atención al cliente automatizada: la conversación multi-turno con contexto largo y la protección de carriles `@main` frente a tráfico efímero evitan la pérdida de estado en sesiones prolongadas.
- Clasificación y enrutamiento dentro de un pipeline de agentes: el carril `@classifier` separa las llamadas de clasificación de una sola vez de la conversación principal, evitando que el scheduler las confunda.
- Despliegue en estación de trabajo con Windows o Linux: los binarios y la imagen de contenedor publicados en la página de releases de ignis permiten montar el servidor sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son métricas de inferencia medidas por el autor sobre una RTX 5090:

| Metrica | Valor |
|---|---|
| Decodificacion, un carril, media | ~170 tok/s |
| Decodificacion, un carril, picos (codigo predecible) | ~370 tok/s |
| Decodificacion, ocho carriles, agregado | 1.065 tok/s |
| Restauracion de carril desde cache KV en RAM | decenas a cientos de ms |
| Reutilizacion de prefijo compartido entre subagentes | ~99% |

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 19,4 GB, por lo que requiere al menos ~20 GB de VRAM para los pesos, más la caché KV y el estado del runtime.
- GPU objetivo: una única tarjeta Blackwell, específicamente RTX 5090 o RTX PRO 6000. No hay soporte indicado para generaciones anteriores.
- No cabe en GPUs de consumo con menos de 24 GB ni en arquitecturas Ampere o Ada, dado que la cuantización NVFP4 y el motor están orientados a Blackwell.
- Despliegue: exclusivamente mediante ignis (servidor compatible con OpenAI, binarios para Windows y Linux e imagen de contenedor) o NInfer; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Comando de arranque de referencia: `ignis-server --model-max-context 524288 --model-rope-scaling yarn:2 --spec-backend dflash2 --spec-draft-tokens 7 --vision-enabled`.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento depende de la longitud del prefijo y del grado de reutilización entre peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B | 512K (YaRN x2) | `.ninfer` | Apache 2.0 | 1x RTX 5090 / RTX PRO 6000 |
| cometkim/Qwen3.8-27B-nvfp4full-NInfer | 27B | no disponible | `.ninfer` | Apache 2.0 | Blackwell (NInfer) |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors | no disponible | Multi-GPU |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 | no disponible | Blackwell |

La diferencia principal frente a las alternativas es la presencia del drafter DFlash2 injertado, el formato propietario y las optimizaciones de caché KV del fork gpillon/ninfer para cargas de agentes. No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- El formato `.ninfer` no es portable: no funciona con Transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita su integración a ignis y NInfer.
- Dependencia de hardware Blackwell; no hay soporte indicado para GPUs anteriores, lo que excluye la mayoría de infraestructuras existentes.
- El modelo base Qwen3.8-27B no está documentado en la información disponible en cuanto a sesgos, idiomas o datos de entrenamiento, por lo que no se pueden evaluar riesgos de alucinación o sesgo específicos.
- La cuantización NVFP4 W4A4 puede degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de la pérdida de calidad.
- El artefacto se construyó injertando el módulo DFlash2 sobre el v1 en lugar de reconvertir, lo que garantiza la identidad de los tensores base pero ata la reproducibilidad al script `tools/artifact/graft_dflash2_module.py`.
- El fork gpillon/ninfer corrige dos bugs silenciosos de corrupción de caché KV que podían hacer que una petición sirviera con el estado de otra; las versiones sin esos parches presentan riesgo de respuestas incorrectas en producción.
- El rendimiento declarado (~170 tok/s de media, 1.065 tok/s agregados) procede de mediciones del autor en una RTX 5090 y no ha sido verificado de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el motor ignis y el fork NInfer tienen sus propias condiciones que conviene revisar por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Artefacto v1 de referencia: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Motor ignis: https://github.com/gpillon/ignis
- Guía para agentes de ignis: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Índice de documentación de ignis: https://gpillon.github.io/ignis/llms.txt
- Releases de ignis: https://github.com/gpillon/ignis/releases
- Sección de rendimiento de ignis: https://github.com/gpillon/ignis#how-fast
- Fork NInfer de gpillon: https://github.com/gpillon/ninfer
- Cambios del fork: https://github.com/gpillon/ninfer/blob/feat/dflash2-local/docs/maintainer/gpillon-fork-changes.md
- Motor NInfer original: https://github.com/Neroued/ninfer
