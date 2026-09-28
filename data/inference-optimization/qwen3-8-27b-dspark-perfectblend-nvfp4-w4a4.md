# inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-NVFP4-W4A4

## Resumen

Este repositorio contiene un drafter de decodificacion especulativa cuantizado en NVFP4 W4A4, no un modelo de chat autonomo. Se trata de una version optimizada para inferencia del speculator DSpark de RedHatAI (`RedHatAI/Qwen3.8-27B-speculator.dspark`) y esta disenado para emparejarse con el modelo objetivo `Qwen/Qwen3.8-27B`, proponiendo tokens candidatos que el modelo grande verifica en paralelo.

Lo publica el usuario `inference-optimization` bajo licencia Apache 2.0. El checkpoint tiene 1.988.431.617 parametros reales (unos 1,99 mil millones) y ocupa 1,3 GB en el repositorio. La cuantizacion es estatica NVFP4 W4A4, calibrada con 1.892 registros alineados de estados ocultos del modelo objetivo, con un limite de secuencia de 2.048. La calibracion procede de una muestra proporcional local de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated`, que a su vez deriva de `mlabonne/open-perfectblend`, no de la coleccion original sin modificar.

Su relevancia practica esta en reducir la latencia de decodificacion de Qwen3.8-27B en despliegues vLLM, pero conviene ser cauto: el propio autor indica que la evaluacion esta pendiente y que no se incluyen resultados de aceptacion, velocidad ni calidad. Es, por tanto, un artefacto con procedencia de cuantizacion documentada pero sin validacion de runtime publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (metodo DSpark) sobre el modelo objetivo Qwen3.8-27B; arquitectura interna del drafter no disponible |
| Parametros totales | 1.988.431.617 (aprox. 1,99 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la calibracion uso un limite de secuencia de 2.048) |
| Tipos de cuantizacion | NVFP4 W4A4 estatica (pesos y activaciones en 4 bits); el repositorio incluye tambien las etiquetas `8-bit` y `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

## Arquitectura y entrenamiento

El artefacto es un drafter para decodificacion especulativa, una familia de tecnicas en la que un modelo pequeno propone varios tokens que el modelo objetivo valida en una sola pasada. El metodo declarado es DSpark y la libreria de carga es `speculators`. El drafter original procede de `RedHatAI/Qwen3.8-27B-speculator.dspark`, en la revision `7f33c272e5da240978e0d55767abab8193d74b95`, y debe emparejarse con `Qwen/Qwen3.8-27B` en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. No se documentan en la informacion disponible ni la topologia interna del drafter, ni el numero de tokens de entrenamiento, ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion es la cuantizacion: NVFP4 W4A4 estatica aplicada al drafter, calibrada contra estados ocultos del modelo objetivo. Se usaron 1.892 registros alineados de una peticion de 2.048 ejemplos, con limite de secuencia de 2.048. La muestra de calibracion proviene de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated` (derivada de `mlabonne/open-perfectblend`), y el autor advierte explicitamente que no es la coleccion PerfectBlend original. El repositorio incluye en `provenance/quantization/` los comandos de cuantizacion, el manifiesto, los metadatos de calibracion, los scripts y parches fuente, y el digest SHA-256 de los pesos publicados. Los datos de prompts de calibracion no se redistribuyen.

## Capacidades

- Proposicion de tokens candidatos: su funcion es generar borradores de tokens para que el modelo objetivo Qwen3.8-27B los verifique, acelerando potencialmente la decodificacion.
- Integracion con decodificacion especulativa en vLLM: se sirve con `--spec-model`, `--spec-method dspark` y `--spec-tokens 8`.
- Cuantizacion NVFP4 W4A4: reduce el peso del drafter, con backend de emulacion seleccionado en el ejemplo de despliegue.
- No es un modelo de chat autonomo: no genera respuestas por si mismo ni puede usarse sin el modelo objetivo emparejado.
- Tool calling, function calling, agentes, vision, audio, modo thinking o capacidades multilingues: no disponibles en la informacion proporcionada.
- Los tags del repositorio incluyen `text-generation` y `conversational`, pero describen el pipeline del sistema emparejado, no una capacidad autonoma del drafter.

## Casos de uso

- Servicio de inferencia de baja latencia: desplegar Qwen3.8-27B en vLLM con este drafter como `--spec-model` para intentar reducir el tiempo por token en cargas interactivas, siempre que se valide antes la tasa de aceptacion.
- Reduccion de coste por token en produccion: si la decodificacion especulativa acepta bloques de hasta 8 tokens (`--spec-tokens 8`), el numero de pasos del modelo objetivo por respuesta puede disminuir, lo que se traduce en menos computo por consulta.
- Despliegues con memoria limitada: al ocupar 1,3 GB el repositorio y estar cuantizado en 4 bits, el drafter anade poca huella frente al coste del modelo objetivo de 27B.
- Investigacion sobre decodificacion especulativa: sirve como punto de comparacion entre un drafter cuantizado en NVFP4 y su equivalente sin cuantizar, midiendo el impacto de la cuantizacion en la tasa de aceptacion.
- Evaluacion de backends de cuantizacion en vLLM: permite probar el backend de emulacion NVFP4 frente a alternativas y comprobar el comportamiento real de los kernels.
- Reproducibilidad de pipelines de cuantizacion: el directorio `provenance/quantization/` con manifiestos, parches y checksums sirve como referencia para replicar procesos de cuantizacion calibrada sobre estados ocultos.
- Despliegues de una sola GPU con GPU de gama alta: al no reclamarse soporte nativo de NVFP4 en H100 (se usa emulacion), encaja en entornos donde se prioriza madurez del kernel frente a maximo rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica literalmente que la evaluacion esta pendiente y que no se incluyen resultados de aceptacion, velocidad ni calidad con esta publicacion. Tampoco se ha completado la validacion de servicio ni la matriz de evaluacion planificada.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 1-2 GB solo para los pesos, partiendo del tamano de repositorio de 1,3 GB. Es una estimacion derivada del tamano publicado, no un dato del autor.
- VRAM total: la del modelo objetivo Qwen3.8-27B mas la del drafter; no disponible el dato exacto del objetivo.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor menciona H100 al aclarar que el ejemplo selecciona el backend de emulacion y que no se reclama soporte nativo NVFP4 en esa GPU.
- Cabe en GPU de consumo: no confirmado; el tamano del drafter es compatible con GPU de consumo, pero el modelo objetivo de 27B condiciona el requisito real.
- Opciones de despliegue: vLLM con decodificacion especulativa. Comando de ejemplo del autor:

```bash
vllm serve Qwen/Qwen3.8-27B \
  --spec-model inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-NVFP4-W4A4 \
  --spec-method dspark \
  --spec-tokens 8 \
  --kernel-config '{"linear_backend":"emulation"}'
```

- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de velocidad ni de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Metodo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpark-PerfectBlend-NVFP4-W4A4 (este) | 1,99 B | no disponible | NVFP4 W4A4 estatica | DSpark | apache-2.0 |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible | no disponible | no disponible | DSpark | no disponible |
| Otros drafters de la familia EAGLE-3, Medusa o n-gram | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con el drafter de origen de RedHatAI, del que este checkpoint deriva mediante cuantizacion calibrada. No hay datos publicados de rendimiento que permitan comparar la tasa de aceptacion entre ambos.

## Limitaciones y advertencias

- Evaluacion pendiente: sin datos de aceptacion, velocidad ni calidad, no hay evidencia publicada de que la cuantizacion NVFP4 preserve el comportamiento del drafter original.
- No es un modelo autonomo: requiere el modelo objetivo Qwen3.8-27B en la revision indicada; usarlo de forma aislada no produce generaciones validas.
- Acoplamiento de revisiones: el autor fija revisiones concretas del drafter y del objetivo; desviarse de ellas puede romper la compatibilidad.
- Backend de emulacion: el ejemplo usa `emulation` para NVFP4 y el autor declara explicitamente que no reclama soporte nativo de NVFP4 en H100, por lo que la ganancia de velocidad no esta garantizada.
- Procedencia de calibracion: la muestra deriva de una regeneracion de terceros de `mlabonne/open-perfectblend`, no de la coleccion original; puede introducir sesgos o distribucion distinta a la prevista por el autor del drafter.
- Datos de calibracion no redistribuidos: la reproducibilidad completa de la calibracion no es posible con lo publicado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.
- Idiomas, sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada.
- Licencia: el artefacto es Apache 2.0, pero el uso comercial depende tambien de las condiciones de los modelos base y de los datos derivados empleados en la calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-NVFP4-W4A4
- Drafter de origen: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de calibracion regenerada: https://huggingface.co/shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated
- Dataset de origen de la calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
