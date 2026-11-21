# malkolm777/zils-mini-p21uniform

## Resumen

zils-mini-p21uniform es un ajuste fino (fine-tune) del modelo joamCriff123/zils-mini-m1117b, publicado por el usuario malkolm777 en Hugging Face. Se presenta como un "cuerpo de decisión d3-mini", es decir, un modelo especializado en tareas de clasificación o decisión estructurada, no en generación de texto general. El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y se distribuye en formato safetensors con un peso de repositorio de 9,1 GB.

El entrenamiento consistió en una única pasada sobre 1.152 ejemplos de decisión verificados, utilizando LoRA de rango 16, tasa de aprendizaje 3e-5 y semilla 553. Las distribuciones objetivo mezclan un 80% de etiquetas verificadas con un 20% de predicciones del modelo padre, y las respuestas ordinales adyacentes reciben peso parcial. Esta configuración sugiere un modelo orientado a decisiones con estructura ordinal, probablemente en un contexto de evaluación o anotación automatizada.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada más allá de la información de entrenamiento, sin idiomas declarados y sin benchmarks publicados. Su interés radica en documentar la técnica de ajuste con LoRA sobre un modelo base concreto y en servir como ejemplo de modelos de decisión de nicho dentro del ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5 en Hugging Face, sin confirmar) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base joamCriff123/zils-mini-m1117b. La etiqueta `qwen3_5` en Hugging Face sugiere una posible relacion con la familia Qwen, pero no se confirma en la model card ni en los metadatos. El modelo se distribuye con la etiqueta `custom_code`, lo que indica que requiere codigo personalizado para su carga y ejecucion, probablemente definido en el repositorio pero no documentado en la informacion proporcionada.

El ajuste fino se realizo con LoRA de rango 16 sobre el modelo base en la revision 0d26e5d85866c225a0384a35947cfa5e98bbd36c. Se entreno durante una sola pasada sobre 1.152 ejemplos de decision verificados, con tasa de aprendizaje 3e-5 y semilla 553. La estrategia de distribuciones objetivo combina un 80% de etiquetas verificadas con un 20% de predicciones del modelo padre, y asigna peso parcial a las respuestas ordinales adyacentes. No se mencionan datos sobre volumen total de tokens, composicion del dataset, ni tecnicas de RLHF o DPO.

## Capacidades

- Modelo de decision: disenado para tareas de clasificacion o seleccion entre opciones, no para generacion libre de texto.
- Estructura ordinal: el entrenamiento con peso parcial en respuestas adyacentes sugiere capacidad para manejar categorias ordenadas.
- Ajuste sobre modelo base: hereda las capacidades del modelo joamCriff123/zils-mini-m1117b, que no estan documentadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificacion ordinal automatizada: el modelo puede emplearse para asignar etiquetas ordenadas (por ejemplo, niveles de riesgo o prioridad) en pipelines de anotacion, gracias al entrenamiento con peso parcial en categorias adyacentes.
- Evaluacion de decisiones en entornos controlados: util para experimentos academicos sobre modelos de decision de pequeno tamano, dado su origen como artefacto de investigacion con LoRA.
- Filtrado o triaje en conjuntos de datos: puede usarse para preclasificar ejemplos antes de una revision humana, aunque la falta de benchmarks impide garantizar su precision.
- Reproduccion de experimentos: sirve como referencia para estudiar el efecto de LoRA rango 16 y mezclas 80/20 en modelos de decision de ~4,5B parametros.
- Prototipado de sistemas de decision con licencia permisiva: la licencia Apache 2.0 permite integrarlo en prototipos comerciales sin restricciones de atribucion mas alla de las habituales.
- Base para nuevos ajustes: al ser un fine-tune de un modelo base, puede servir como punto de partida para otros experimentos de ajuste con LoRA en tareas de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parametros, en precision FP16 se requieren aproximadamente 9,1 GB de VRAM solo para los pesos; en FP32, unos 18,2 GB. No se publican versiones cuantizadas, por lo que no hay estimaciones para INT8 o INT4.
- GPU recomendadas: para FP16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100). Para FP32, se necesitan al menos 24 GB (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: si, en FP16 cabe en GPUs consumer con 12 GB o mas, como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: al requerir `custom_code`, es probable que necesite `transformers` con `trust_remote_code=True`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. No hay versiones GGUF publicadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoria (modelos de decision de ~4,5B parametros con ajuste LoRA) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre solo 1.152 ejemplos, el modelo puede reflejar sesgos presentes en ese conjunto reducido.
- Riesgo de alucinacion: no evaluado. Al ser un modelo de decision, el riesgo se manifiesta como clasificaciones erroneas o inconsistentes, no como texto inventado.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados; se desconoce su comportamiento fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe consultar el archivo NOTICE del repositorio para atribuciones de terceros del modelo base.
- Caveats para produccion: el modelo tiene cero descargas y cero likes, sin benchmarks ni validacion externa; no se recomienda su uso en produccion sin una evaluacion propia. La etiqueta `custom_code` implica riesgo de ejecucion de codigo no auditado al cargar el modelo. La model card es minima y no documenta el pipeline ni las capacidades reales.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-p21uniform
- Modelo base: https://huggingface.co/joamCriff123/zils-mini-m1117b
