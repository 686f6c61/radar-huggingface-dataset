# jongstra/Swift-1.5-Qwen3.8-27b-Abliterated-oQ6-bf16-mtp-dflash2-kapitsa

## Resumen

Swift 1.5 Qwen3.8-27B Abliterated (oQ6, bf16, MTP + DFlash2) es una distribución cuantizada y empaquetada del modelo `grimlee/Swift-1.5-Qwen3.8-27B-Abliterated`, a su vez derivado de `ukisai/Swift-1.5-Qwen3.8-27b`. El autor de este repositorio, jongstra, no ha realizado ni el entrenamiento ni la abliteración: su aportación es la cuantización con oMLX 0.7.3 y el empaquetado específico para el motor de inferencia Kapitsa sobre Apple Silicon. El modelo tiene 27.781.427.952 parámetros (unos 27,8 mil millones), arquitectura densa de 64 capas y una ventana de contexto de 262.144 tokens según el log del motor.

La particularidad técnica es la combinación de cuantización mixta sensible (oQ6: 455 módulos lineales a 6 bits grupo 64 y 50 a 8 bits grupo 64, sobre 505 módulos cuantizados), escalas en bfloat16, la cabeza MTP (multi-token prediction) del propio modelo copiada a un sidecar `mtp.safetensors`, y un drafter DFlash2 de 5 capas y 1,86 GB para decodificación especulativa con verificación en árbol. Además, conserva la torre de visión, por lo que el modelo procesa imágenes.

Es relevante para quien quiera ejecutar un modelo de ~28B con contexto muy largo en un Mac con Apple Silicon, con decodificación especulativa lista para usar y sin el comportamiento de rechazo del modelo original. Conviene ser consciente de que se trata de un modelo "abliterated" (sin mecanismos de rechazo) y de que la licencia Swift Open License v1.0 impone limitaciones de uso comercial y un umbral de ingresos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, con cabeza MTP y torre de visión |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según log del motor Kapitsa) |
| Tipos de cuantizacion | oQ6: 455 módulos a 6 bits grupo 64 (87%) y 50 a 8 bits grupo 64 (13%); escalas bf16; drafter DFlash2 a 4 bits en proyecciones |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (con limitación de uso comercial y umbral de ingresos) |
| Formato de pesos | safetensors (librería mlx), más `mtp.safetensors` y carpeta `dflash2/` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 64 capas con aproximadamente 27,8 mil millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La arquitectura incluye una cabeza MTP (multi-token prediction) propia del modelo, que en este repositorio se copia verbatim a `mtp.safetensors` en cuantización 6 bits grupo 64; según el log del motor, la cabeza es densa, opera con el hidden pre-norm del tronco y genera borradores sobre el vocabulario completo. También conserva la torre de visión.

Las innovaciones destacables de este empaquetado son dos. Primero, la cuantización oQ6 de oMLX 0.7.3, que no es uniforme: asigna precisión según un mapa de sensibilidad por capa (`oq_sensitivity_map.json`), con 455 módulos a 6 bits y 50 a 8 bits. Segundo, la decodificación especulativa: se incluye un drafter DFlash2 de 5 capas, hidden 5120 y proyecciones a 4 bits (1,86 GB residentes), procedente de `incoai/Qwen3.8-27B-DFlash2` (Apache-2.0) sin modificar, que Kapitsa usa con verificación en árbol (KFlash). La abliteración, realizada por grimlee, es de dirección única con lambda 1,2 y 131 tensores reescritos; el autor reporta que los rechazos en XSTest-30 caen de 25/30 a 0/30 sin cambios en precisión estilo MMLU (40/40 en ambos casos), si bien este repositorio no lo ha reverificado.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation` y `conversational`.
- Procesamiento de imágenes: la torre de visión está preservada y el motor reporta "images on".
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa con MTP y drafter DFlash2, orientada a reducir latencia en Apple Silicon.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en Mac de sobremesa: desplegado con `kapitsa serve` sobre un M2 Ultra con 64 GB, el modelo ocupa 22,5 GB de pesos más 1,86 GB de drafter, dejando margen para KV cache y una conversación; útil para prototipado privado sin depender de la nube.
- Análisis de documentos largos: con 262.144 tokens de contexto, permite cargar contratos, informes o bases de código completas en una sola petición sin trocear.
- Procesamiento de capturas y documentos escaneados: la torre de visión permite describir imágenes o extraer información de diagramas y pantallazos dentro de un flujo conversacional.
- Generación de código asistida: el benchmark del autor reporta 67,5 tok/s en generación de código sobre M2 Ultra, lo que lo hace viable para autocompletado interactivo en un IDE local.
- Investigación sobre alineación y seguridad: al ser abliterated, sirve para estudiar el comportamiento de modelos sin rechazo, comparándolo con la variante no abliterada del mismo autor, que comparte receta de cuantización (455/50).
- Evaluación de decodificación especulativa: la combinación MTP + DFlash2 con verificación en árbol permite medir el impacto de distintos drafters en latencia y throughput sobre hardware Apple.
- Servicio interno con control de acceso: usando `--private` o `--api-key` en Kapitsa, se puede exponer el modelo a un equipo pequeño con salvaguardas de red, algo especialmente recomendable dado su carácter sin filtros.

## Benchmarks y rendimiento

El autor publica únicamente micro-benchmarks de velocidad de generación en un M2 Ultra (GPU de 60 núcleos, 64 GB), con Kapitsa 0.2.25, una ranura, generaciones de 700 tokens y mediana de tres ejecuciones:

| Configuracion | Prosa (tok/s) | Codigo (tok/s) |
|---|---:|---:|
| Este repo, tal cual | 47,1 | 67,5 |
| Build no abliterated | 47,4 | 66,6 |
| `qwen3.8-27b:6bit` de Kapitsa | 45,1 | 66,3 |

El propio autor advierte que las tres cifras están dentro de la varianza entre ejecuciones y que se trata de micro-benchmarks de una sola petición en una sola máquina, no de una evaluación rigurosa. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: unos 28 GB libres para pesos, drafter y una ranura de conversación; medido en 22,5 GB de pesos más 1,86 GB de drafter residente, más KV cache.
- Plataforma: Apple Silicon exclusivamente (librería MLX, tags `apple-silicon`, `mlx`). No hay soporte CUDA documentado.
- GPU recomendadas: M2 Ultra (medido); se requiere un equipo con al menos 28 GB de memoria unificada disponible, por lo que un Mac con 32 GB es el mínimo teórico y 64 GB es lo recomendado para contexto largo.
- ¿Cabe en GPU de consumo? No en GPUs NVIDIA de consumo por la ruta MLX; en Apple Silicon, sí en equipos con memoria unificada suficiente.
- Despliegue: exclusivamente mediante Kapitsa 0.2.25 o superior. Versiones anteriores rechazan el sidecar MTP de 6 bits con el error `mtp.layers.0.self_attn.q_proj: unsupported quantization`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Carga: el modelo no es seleccionable por nombre en el catálogo de Kapitsa; debe cargarse por ruta de carpeta con `--model <ruta>`. Si falta la carpeta `dflash2/`, el motor cae a decodificación especulativa MTP y funciona aproximadamente un 30% más lento.
- Throughput estimado: 47,1 tok/s en prosa y 67,5 tok/s en código sobre M2 Ultra en las condiciones descritas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Este repo (Swift 1.5 Qwen3.8-27B Abliterated oQ6) | ~27,8B | 262.144 | Swift Open License v1.0 | safetensors MLX, Kapitsa | Abliterated, MTP + DFlash2 |
| `jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa` | ~27,8B | 262.144 (mismo motor) | Swift Open License v1.0 | safetensors MLX, Kapitsa | Misma receta 455/50, sin abliterar |
| `qwen3.8-27b:6bit` (catálogo Kapitsa) | no disponible | no disponible | no disponible | integrado en Kapitsa | 45,1 / 66,3 tok/s en el mismo benchmark |
| `grimlee/Swift-1.5-Qwen3.8-27B-Abliterated` (modelo base) | ~27,8B | no disponible | no disponible | pesos originales | Origen de la abliteración |

Las diferencias de rendimiento entre las tres primeras filas están dentro de la varianza de ejecución según el autor. No se dispone de datos de calidad comparada con modelos de otros fabricantes.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que responderá a peticiones que el modelo original declinaría. Requiere control de acceso deliberado; el autor recomienda `--private` o `--api-key` porque `kapitsa serve` escucha por defecto en la red.
- La abliteración no se realizó en este repositorio y sus métricas (XSTest-30, MMLU) no han sido reverificadas aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de ~28B.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Licencia Swift Open License v1.0: incluye limitación de uso comercial y un umbral de ingresos. Es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier despliegue productivo.
- Dependencia fuerte de un único runtime (Kapitsa ≥ 0.2.25) y de una única plataforma (Apple Silicon/MLX); no hay ruta documentada a CUDA ni a motores estándar como vLLM o llama.cpp.
- El modelo no es resoluble por nombre en el catálogo de Kapitsa; hay que arrancarlo por ruta, lo que complica la automatización y el despliegue orquestado.
- Si no se descarga la carpeta `dflash2/`, el rendimiento cae aproximadamente un 30%.
- Los benchmarks publicados son micro-mediciones de una sola máquina y una sola petición; no sirven para extrapolar throughput en concurrencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-Abliterated-oQ6-bf16-mtp-dflash2-kapitsa
- Variante no abliterada del mismo autor: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa
- Modelo base abliterated: https://huggingface.co/grimlee/Swift-1.5-Qwen3.8-27B-Abliterated
- Modelo fuente original: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
