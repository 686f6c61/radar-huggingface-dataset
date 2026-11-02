# scratchery/Qwen3.8-27B-DFlash2-4bit

## Resumen

`scratchery/Qwen3.8-27B-DFlash2-4bit` es una conversion a MLX en cuantizacion afina de 4 bits (group size 64) del borrador especulativo DFlash2 desarrollado por incoai para el modelo Qwen3.8-27B. No se trata de un modelo de lenguaje autonomo: es un *block drafter* que propone tokens candidatos para acelerar la decodificacion especulativa de su modelo objetivo, del cual toma prestados el embedding y el `lm_head`. El autor de la conversion es el usuario `scratchery`, mientras que el trabajo original del borrador corresponde a incoai bajo licencia Apache-2.0.

La relevancia de esta publicacion es practica: expone los pesos exactos con los que el runtime Splash realiza el drafting, replicando su logica de cuantizacion (`quantizeGroup` en `runtime/model/GgufPreparation.cpp`) y conservando en BF16 las normas, los kernels base de las convoluciones y los dos codebooks del selector de candidatos, tal como hace Splash en `runtime/model/DraftCheckpoint.cpp`. El resultado es un artefacto de 1,3 GB y 1.924.404.480 parametros que se integra como borrador por defecto del modelo Qwen3.8-27B en su variante `mlx-community/Qwen3.8-27B-4bit`.

La ficha se centra en lo que la informacion disponible permite afirmar: identificacion del artefacto, proceso de conversion, verificacion de equivalencia tensorial y modo de uso. Cualquier dato sobre arquitectura interna del modelo objetivo, datos de entrenamiento o rendimiento en benchmarks no aparece en la model card y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 block drafter (decodificacion especulativa) sobre Qwen3; transformer con convoluciones y selector de candidatos |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible como valor absoluto; el drafter define `use_swa` y `swa_window_size` en `dflash_config` a partir de `use_sliding_window` y `sliding_window` del modelo fuente |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 en todas las proyecciones; normas, kernels base de convoluciones y codebooks del selector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), config.json con entrada de cuantizacion y bloque `dflash_config` |

## Arquitectura y entrenamiento

El artefacto es un borrador de decodificacion especulativa, no un modelo generativo completo. Su funcion es proponer bloques de tokens que el modelo objetivo Qwen3.8-27B verifica en paralelo, reduciendo el numero de pasos secuenciales necesarios para producir una secuencia. La model card menciona componentes concretos de su arquitectura: proyecciones cuantizables, normas, convoluciones con kernels base y un selector de candidatos con dos codebooks. El borrador reutiliza el embedding y el `lm_head` del modelo objetivo, por lo que su huella de parametros (1.924.404.480) no incluye esas matrices.

No se dispone de informacion sobre el proceso de entrenamiento del borrador original: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni detalles sobre la innovacion DFlash2 mas alla de su papel como drafter. Lo que si documenta la model card es el proceso de conversion: el script `convert_drafter.py`, incluido en el repositorio, cuantiza cada proyeccion del checkpoint BF16 replicando exactamente la regla afina de MLX (`mlx.core.quantize`) y el comportamiento del loader de Splash. La verificacion es notable: aplicado a `incoai/Qwen3.6-35B-A3B-DFlash2`, el mismo script reproduce byte a byte los 208 tensores de `mlx-community/Qwen3.6-35B-A3B-DFlash2-4bit`; frente a `seabit-ai/Qwen3.8-27B-DFlash2-4bit` (generado con `mlx_vlm.convert`), los 173 tensores compartidos son identicos, con la diferencia de que esta conversion mantiene los dos codebooks del selector en BF16, igual que Splash, mientras que la otra los cuantiza. Se incluyen los SHA-256 del `model.safetensors` fuente (`67fc76d6...`) y del resultante (`35e04696...`).

## Capacidades

- Decodificacion especulativa: actua como block drafter para Qwen3.8-27B, proponiendo tokens candidatos que el modelo objetivo valida.
- Integracion con el runtime scratchy: se usa como borrador por defecto de `mlx-community/Qwen3.8-27B-4bit`.
- Compatibilidad con Splash: los pesos coinciden con los que Splash emplea para hacer drafting, incluidos los codebooks en BF16.
- Reutilizacion del embedding y `lm_head` del modelo objetivo, lo que evita duplicar esas matrices.
- Soporte de ventana deslizante configurable mediante `use_swa` y `swa_window_size` en `dflash_config`.
- No es un modelo autonomo: no genera texto por si mismo, no soporta tool calling, agentes, vision, audio ni capacidades multilingues propias.

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: el borrador se carga junto a `mlx-community/Qwen3.8-27B-4bit` en el runtime scratchy para reducir la latencia por token mediante verificacion especulativa en paralelo.
- Despliegue de Qwen3.8-27B en equipos con memoria unificada limitada: al ocupar 1,3 GB y mantener el resto del modelo en 4-bit, el conjunto cabe en configuraciones de gama alta de Mac sin renunciar al drafting.
- Reproducibilidad de pipelines de cuantizacion: el repositorio incluye `convert_drafter.py` y los hashes SHA-256, lo que permite auditar que los pesos desplegados coinciden con los del checkpoint BF16 de origen.
- Investigacion sobre decodificacion especulativa: sirve como referencia para comparar la regla de cuantizacion de Splash frente a la de `mlx_vlm.convert`, especialmente en el tratamiento de los codebooks del selector.
- Validacion cruzada de conversiones: los tests de equivalencia byte a byte con `mlx-community/Qwen3.6-35B-A3B-DFlash2-4bit` y con `seabit-ai/Qwen3.8-27B-DFlash2-4bit` permiten verificar herramientas de conversion propias contra un artefacto conocido.
- Integracion en entornos de desarrollo con MLX: al usar la libreria `mlx` y safetensors, encaja en flujos de trabajo nativos de macOS sin necesidad de CUDA ni de toolchains adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para el borrador en 4-bit, a los que hay que sumar la memoria del modelo objetivo Qwen3.8-27B (no disponible en la informacion proporcionada).
- GPU recomendadas: no disponible. El formato MLX esta orientado a Apple Silicon (memoria unificada); no se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente para alojar simultaneamente el borrador y el modelo objetivo; el umbral concreto no se especifica.
- Opciones de despliegue: runtime scratchy (uso previsto por el autor) y, en general, cargadores MLX compatibles con safetensors cuantizados en afina 4-bit. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. La model card no cuantifica la mejora de velocidad que aporta el drafting.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| scratchery/Qwen3.8-27B-DFlash2-4bit | 1.924.404.480 | no disponible | MLX afina 4-bit, group size 64; codebooks en BF16 | Apache-2.0 | Conversion que replica la regla de Splash |
| seabit-ai/Qwen3.8-27B-DFlash2-4bit | no disponible | no disponible | 4-bit via `mlx_vlm.convert`; codebooks cuantizados | no disponible | 173 tensores compartidos identicos; difiere en el tratamiento de los codebooks |
| mlx-community/Qwen3.6-35B-A3B-DFlash2-4bit | no disponible | no disponible | 4-bit | no disponible | Referencia de equivalencia byte a byte para el mismo script de conversion |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | BF16 | Apache-2.0 | Checkpoint fuente del borrador |

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no puede generar texto, razonar ni responder consultas por si solo; requiere el modelo objetivo Qwen3.8-27B y su embedding y `lm_head`.
- Dependencia estricta de la revision del modelo base: la conversion se realizo sobre `incoai/Qwen3.8-27B-DFlash2` en la revision `015e795645c74b1a0eeef3b570031fb62e769bc5`; otras revisiones pueden no ser compatibles.
- Acoplamiento al runtime: esta pensado para scratchy y para la logica de carga de Splash; otros cargadores pueden tratar de forma distinta los codebooks en BF16 y alterar el comportamiento.
- Sin datos de rendimiento: no se han publicado benchmarks de velocidad, tasa de aceptacion de tokens ni calidad del drafting.
- Idiomas y sesgos: no disponible; al no ser un modelo generativo, las consideraciones habituales de sesgo y alucinacion aplican al modelo objetivo, no a este artefacto.
- Licencia: Apache-2.0 segun la model card, heredada del trabajo de incoai; el repositorio solo realiza la conversion. Conviene verificar los terminos del modelo base antes de un uso comercial en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scratchery/Qwen3.8-27B-DFlash2-4bit
- Modelo base: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Conversion alternativa: https://huggingface.co/seabit-ai/Qwen3.8-27B-DFlash2-4bit
- Referencia de equivalencia: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-DFlash2-4bit
- Runtime scratchy: https://github.com/AI-native-Systems-Research/scratchy
- Modelo objetivo en 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
