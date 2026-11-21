# ramithuh/dyna1-webgpu

## Resumen

Dyna-1 WebGPU es una especialización de inferencia en navegador del modelo Dyna-1, un modelo de proteínas derivado de ESM-3 que predice dinámica de proteínas a partir de secuencia de aminoácidos. Lo publica el usuario ramithuh como bundles listos para el runtime JavaScript `dyna1-webgpu`, no como checkpoints de Transformers. El modelo resuelve un problema concreto: ejecutar un modelo de 840 millones de parámetros de biología computacional directamente en un navegador mediante WebGPU, sin necesidad de servidor ni GPU dedicada en backend.

La arquitectura subyacente es ESM-3 small (modelo de lenguaje de proteínas basado en transformer) con una cabeza clasificadora específica de Dyna-1 que produce probabilidades de intercambio por residuo. La innovación del bundle no está en el modelo sino en el empaquetado: pesos divididos en shards de menos de 25 MB, manifiestos con checksums y tres formatos de precisión (fp32, fp16 e int8) para que el runtime los cargue bajo demanda.

Es relevante ahora porque demuestra que modelos científicos de tamaño medio pueden desplegarse en el cliente con WebGPU, abriendo la puerta a herramientas de análisis de proteínas que funcionan offline o en entornos con restricciones de privacidad. La contrapartida es que la licencia del modelo base (Cambrian Non-Commercial) limita seriamente su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ESM-3 small) con cabeza clasificadora Dyna-1 |
| Parametros totales | 840.417.793 (inferencia, solo secuencia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16 (matrices F16, vectores F32), int8 (simetrica por fila) |
| Idiomas soportados | no disponible (entrada: secuencia canonica de aminoacidos) |
| Licencia | MIT para runtime y cabeza; modelo base bajo EvolutionaryScale Cambrian Non-Commercial |
| Formato de pesos | `dyna1-safetensors-v1` (bundles custom, no Transformers); shards de maximo 25.000.000 bytes |

## Arquitectura y entrenamiento

El modelo es una especialización solo-secuencia del Dyna-1 original, que a su vez parte de ESM-3 small. La entrada es una secuencia canónica de aminoácidos sin tokens BOS/EOS. La salida es una probabilidad de intercambio por residuo calculada como `sigmoid(logit - log(0.05/0.95))`, junto con los logits del clasificador. El autor advierte explícitamente que no es una tasa física de intercambio calibrada y que la inferencia condicionada por estructura no está incluida.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica del bundle es el empaquetado: matrices grandes divididas por filas con entradas de manifiesto, checksums por shard e índice de bundles (`bundle-index.json`). En fp16 se retienen en F32 los vectores y los dos primeros bloques del clasificador para preservar precisión de salida. La validación reportada incluye trazas deterministas de CPU FP32 en Trp-cage y ubiquitina, paridad de CPU en JavaScript y paridad real en Chromium/Dawn WebGPU; el propio autor señala que la paridad en solo dos secuencias no constituye una validación biológica exhaustiva.

## Capacidades

- Predicción de probabilidad de intercambio por residuo a partir de secuencia de aminoácidos.
- Salida de logits del clasificador para análisis posterior.
- Ejecución en navegador mediante WebGPU (Chromium/Dawn verificado).
- Tres niveles de precisión seleccionables en tiempo de carga (int8, fp16, fp32).
- Carga por shards con verificación de checksums.
- Inferencia determinista respecto a las trazas CPU de referencia en las secuencias validadas.
- No incluye tool calling, function calling, agentes ni razonamiento multi-turno.
- No incluye capacidades multilingües ni de visión/audio.
- No incluye inferencia condicionada por estructura.

## Casos de uso

- Análisis de dinámica proteica en el navegador: un investigador carga una secuencia de aminoácidos en una aplicación web y obtiene probabilidades de intercambio por residuo sin enviar datos a un servidor, útil en entornos con restricciones de privacidad.
- Herramientas educativas de biología estructural: demostraciones interactivas donde el estudiante introduce secuencias y observa predicciones de flexibilidad local en tiempo real.
- Prefiltrado en pipelines de investigación: usar el bundle int8 en cliente para descartar secuencias poco interesantes antes de lanzar simulaciones de dinámica molecular completas en clúster.
- Prototipado rápido de interfaces científicas: desarrolladores que quieren integrar un modelo de proteínas en una web app sin montar infraestructura de GPU, gracias a los shards de menos de 25 MB y la carga bajo demanda.
- Validación de portabilidad de modelos científicos: equipos que evalúan WebGPU como plataforma de despliegue para modelos de tamaño medio, usando este bundle como referencia de paridad numérica.
- Anotación asistida en laboratorio: integración en cuadernos electrónicos o herramientas de LIMS que funcionan offline y necesitan una señal rápida de dinámica por residuo.
- Investigación sobre cuantización: comparación de fp32, fp16 e int8 sobre las mismas secuencias para estudiar el impacto de la precisión en las predicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona métricas de paridad en fixtures del repositorio del runtime (trazas CPU FP32 en Trp-cage y ubiquitina, paridad CPU en JavaScript y paridad WebGPU en Chromium/Dawn), pero no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 2,6 GB en total y los shards individuales no superan 25 MB, lo que sugiere que la memoria necesaria depende del formato cargado (int8 sustancialmente menor que fp32).
- GPU recomendadas: no disponible; el runtime está diseñado para WebGPU, por lo que requiere un navegador con soporte WebGPU (Chromium/Dawn verificado por el autor).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ejecutarse en navegador, la viabilidad depende del soporte WebGPU del sistema y de la memoria de la GPU del cliente.
- Opciones de despliegue: runtime `dyna1-webgpu` en navegador; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI (los pesos no son checkpoints de Transformers).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dyna-1 WebGPU (este) | 840 M | no disponible | Dinámica proteica en navegador (WebGPU) | MIT + Cambrian Non-Commercial (base) | Hugging Face |
| ESM-3 small (base) | no disponible en la información | no disponible | Modelo de lenguaje de proteínas | Cambrian Non-Commercial | Hugging Face |
| Dyna-1 original (gelnesr) | no disponible en la información | no disponible | Dinámica proteica, condicionado por estructura | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia del modelo base (EvolutionaryScale Cambrian Non-Commercial) restringe el uso comercial; solo el runtime y la cabeza ajustada son MIT.
- Solo se alojan los bundles fp16 e int8; el fp32 no está disponible en este repositorio.
- La salida no es una tasa física de intercambio calibrada; es una probabilidad derivada de logits.
- No incluye inferencia condicionada por estructura.
- La validación de paridad se limita a dos secuencias (Trp-cage y ubiquitina); el autor advierte que no es una validación biológica exhaustiva.
- Riesgo de alucinación no aplica en el sentido de texto generativo, pero sí de predicciones biológicas no validadas fuera del conjunto de prueba.
- No hay información sobre sesgos, cobertura de idiomas ni robustez ante secuencias atípicas.
- Los pesos no son checkpoints de Transformers: no se pueden cargar con `from_pretrained` estándar.
- Dependencia de soporte WebGPU en el navegador del cliente; la compatibilidad fuera de Chromium/Dawn no está confirmada.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/dyna1-webgpu
- Modelo base Dyna-1 (clasificador oficial): https://huggingface.co/gelnesr/Dyna-1
- ESM-3 small: https://huggingface.co/EvolutionaryScale/esm3-sm-open-v1
- Repositorio Dyna-1: https://github.com/WaymentSteeleLab/Dyna-1
- Paper citado: Wayment-Steele et al., *Learning millisecond protein dynamics from what is missing in NMR spectra*, Nature (2026), doi:10.1038/s41586-026-10989-4
