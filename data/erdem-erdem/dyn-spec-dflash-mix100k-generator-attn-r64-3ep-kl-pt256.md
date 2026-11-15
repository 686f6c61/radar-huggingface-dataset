# erdem-erdem/dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256

## Resumen

`dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro del ecosistema Speculators. No es un modelo generativo independiente, sino un *drafter* (modelo borrador) para decodificación especulativa construido como adaptación LoRA sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`. Su funcion es proponer tokens candidatos que el modelo objetivo `Qwen/Qwen3-8B` verifica, acelerando la inferencia sin alterar la distribucion de salida del modelo grande.

El artefacto corresponde a la etapa de preentrenamiento del brazo `direct` de una ejecucion de adaptacion del generador DFlash, con 16 667 actualizaciones, semilla 42 y un checkpoint que incluye estado del optimizador. El repositorio ocupa 2,8 GB y contiene el directorio de ejecucion completo: registros JSON, metricas, comandos de entrenamiento, parches, procedencia del almacen de activaciones y evaluaciones offline.

Es relevante para investigadores que trabajen en aceleracion de inferencia y decodificacion especulativa, ya que publica trazabilidad completa (SHA256 del checkpoint, SHA de git, identidad del store de activaciones y lanzamiento de vLLM). No obstante, el autor advierte explicitamente de que no es un bundle de servicio: la exportacion DFlash para servir no esta portada, por lo que no puede desplegarse directamente como drafter en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre drafter DFlash (base `z-lab/Qwen3-8B-DFlash-b16`), adaptador de atencion con rango 64 |
| Parametros totales | no disponible (el repo de 2,8 GB incluye estado del optimizador y artefactos de ejecucion, no solo pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch); no se publica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado sobre las capas de atencion del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`, que a su vez es un modelo borrador disenado para decodificacion especulativa contra `Qwen/Qwen3-8B`. La ejecucion corresponde al brazo `direct` en etapa de preentrenamiento, con 16 667 actualizaciones y semilla 42. El nombre del artefacto indica el uso de un dataset mixto de 100 000 ejemplos (`mix100k`), un objetivo de divergencia KL (`kl`) y un tamano de prefijo de 256 (`pt256`), aunque la model card no detalla la composicion del dataset ni la formulacion exacta de la perdida.

La innovacion principal no esta en la arquitectura del drafter, sino en la infraestructura de reproducibilidad: el repositorio incluye `train_command.txt`, `speculators.patch`, registros de procedencia del almacen de activaciones, del extractor y del lanzamiento de vLLM, ademas de un `MANIFEST.json` con tamano y SHA256 de cada fichero. Las evaluaciones offline cubren reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14, con metricas por fila.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa contra `Qwen/Qwen3-8B`.
- Verificacion acelerada: el drafter propone y el modelo objetivo valida, manteniendo la distribucion del modelo grande.
- Evaluacion por dominios: la validacion reporta puntuaciones separadas para chat, codigo, matematicas y STEM.
- Trazabilidad de entrenamiento: checkpoint con estado del optimizador, metricas, comandos y parches reproducibles.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma nativa; hereda las capacidades del modelo objetivo, no las propias.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en investigacion: usar el drafter para reducir la latencia de decodificacion en entornos controlados, midiendo la tasa de aceptacion frente al modelo objetivo.
- Experimentacion con decodificacion especulativa: el repositorio permite reproducir la ejecucion completa (comando de entrenamiento, parche y procedencia) para estudiar el efecto del rango LoRA y del tamano de prefijo.
- Analisis de dominios especificos: las metricas desagregadas por chat, codigo, matematicas y STEM permiten evaluar donde el drafter aporta mas aceptacion.
- Benchmarking de tecnicas de destilacion de borradores: comparar el brazo `direct` con otras variantes del port DFlash usando los registros de evaluacion offline incluidos.
- Auditoria de reproducibilidad: el `MANIFEST.json` y los SHA permiten verificar integridad de artefactos en pipelines de investigacion.
- Estudio de coste computacional: las evaluaciones D14 de coste permiten modelar el ahorro de FLOPs por token aceptado en funcion del hardware.
- No es adecuado para despliegue en produccion directo, ya que la exportacion de servicio DFlash no esta portada.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 16667 | 0.5368 | 7.955 | 0.3545 | 0.6097 | 0.6865 | 0.4964 |

La mejora respecto al punto de partida es moderada: +0.0103 en score global, +0.252 en τ (eal) y entre +0.0082 y +0.0141 en las cuatro categorias. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del drafter base Qwen3-8B-DFlash-b16 y del modelo objetivo Qwen3-8B, no solo del adaptador LoRA.
- El repositorio de 2,8 GB incluye estado del optimizador, por lo que el peso efectivo del adaptador es menor; no se especifica la cifra exacta.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; el modelo objetivo Qwen3-8B requiere cuantizacion para caber en GPUs de 24 GB, pero el drafter no se distribuye en formato cuantizado.
- Opciones de despliegue: vLLM aparece en la procedencia del entrenamiento, pero el autor indica que la exportacion de servicio DFlash no esta portada, por lo que no hay ruta de despliegue documentada (ni llama.cpp, ni Ollama, ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256 | LoRA drafter (checkpoint de entrenamiento) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor indica que la exportacion DFlash para servir no esta portada; solo sirve como checkpoint de entrenamiento e investigacion.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y a los titulares de las licencias del drafter base y del modelo objetivo.
- Idiomas no documentados: se desconoce la cobertura multilingue real del drafter.
- Sesgos y alucinacion: no evaluados en la model card; al ser un drafter, los tokens propuestos se verifican contra el modelo objetivo, lo que mitiga pero no elimina riesgos.
- Validacion limitada: 200 filas fijas, una por LoRA; no constituye una evaluacion exhaustiva ni representa el rendimiento en produccion.
- Formato propietario de PyTorch con estado del optimizador: requiere conversion para cualquier uso fuera del pipeline de entrenamiento original.
- Repositorio con 0 descargas y 0 likes: sin validacion externa por parte de la comunidad.
- Las metricas de validacion muestran mejoras pequenas; no hay evidencia de ganancias de velocidad end-to-end en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
