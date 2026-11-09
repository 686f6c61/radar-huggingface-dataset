# gaijingchu/precision-perturb-fullq

## Resumen

`precision-perturb-fullq` no es un modelo listo para usar en produccion, sino un artefacto de investigacion publicado en Hugging Face por Jingchu Gai (gaijingchu), doctorando en Machine Learning en Carnegie Mellon University. El repositorio contiene los resultados de un estudio sistematico sobre el efecto combinado de la precision numerica y las perturbaciones de pesos en el preentrenamiento de modelos de lenguaje totalmente cuantizados (pesos, activaciones y proyecciones q/k/v).

El material consiste en varios runs de entrenamiento de modelos de 30M de parametros, entrenados con OLMo-core sobre Dolma CC, a distintos anchos de bit y presupuestos de tokens. Cada directorio de run incluye el state dict final en formato OLMo-core, la configuracion del modelo, el YAML de entrenamiento completo y mediciones por run (perdida final, barridos de perturbacion gaussiana de pesos, cuantizacion post-entrenamiento, etc.).

Su relevancia es metodologica: sirve como dataset de referencia reproducible para estudiar como degrada la precision numerica el entrenamiento y como se relaciona con la sensibilidad de los pesos, algo util para quien investigue cuantizacion de bajo bit o estabilidad de entrenamiento. No es un modelo conversacional ni tiene pipeline asociado; el repositorio ocupa 0,3 GB y no incluye checkpoints intermedios ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-core); detalles de capas y dimensiones no disponibles en la model card |
| Parametros totales | 30M (todos los runs) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Preentrenamiento totalmente cuantizado: pesos en `w<bits>` (solo pesos) y pesos + activaciones en `f<bits>`; tambien q/k/v cuantizados. Anchos de bit concretos no disponibles en la model card |
| Idiomas soportados | no disponible (entrenado sobre Dolma CC, corpus predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict en formato OLMo-core), no safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura de OLMo-core, el framework de entrenamiento de AI2. Se entrenaron sobre Dolma CC (Common Crawl filtrado y deduplicado) con distintos presupuestos de tokens, codificados en el nombre del run como `D<tokens>B`. El eje central del estudio es la precision numerica: los runs varian entre `bf16` (referencia), `w<bits>` (cuantizacion solo de pesos) y `f<bits>` (cuantizacion de pesos y activaciones), incluyendo la cuantizacion de las proyecciones q/k/v. Los nombres de run tambien codifican el learning rate y la semilla, lo que permite analizar varianza entre semillas.

La innovacion metodologica es el analisis cruzado de precision y perturbacion: cada run incluye barridos de perturbacion gaussiana de pesos y evaluaciones de cuantizacion post-entrenamiento, de modo que se puede comparar la robustez de un modelo entrenado en baja precision frente a uno entrenado en bf16 y cuantizado a posteriori. No se documentan en la model card el numero exacto de tokens, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO (poco probables en modelos de 30M orientados a estudio de preentrenamiento).

## Capacidades

- Generacion de texto basica: son modelos de lenguaje causales de 30M de parametros, con capacidad limitada por su tamano.
- Estudio de cuantizacion: permiten medir el impacto de la precision en pesos, activaciones y q/k/v sobre la perdida final.
- Analisis de sensibilidad: los barridos de perturbacion gaussiana permiten caracterizar la robustez de los pesos entrenados en cada regimen de precision.
- Comparacion pre/post cuantizacion: los datos de cuantizacion post-entrenamiento permiten contrastar entrenamiento cuantizado frente a cuantizacion a posteriori.
- Reproducibilidad: cada run incluye `launch.yaml` con la configuracion completa de entrenamiento.
- No se documenta soporte de tool calling, agentes, vision, audio, thinking mode ni capacidades multilingues.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: usar los runs `w<bits>` y `f<bits>` para estudiar como afecta el ancho de bit a la perdida final en un modelo pequeno y controlado, con semillas y learning rates conocidos.
- Validacion de pipelines de entrenamiento cuantizado: los `launch.yaml` y las configs permiten reproducir el setup en OLMo-core y verificar implementaciones propias de capas cuantizadas.
- Analisis de sensibilidad de pesos: los barridos de perturbacion gaussiana sirven para estudiar la relacion entre precision de entrenamiento y curvatura local de la funcion de perdida.
- Comparativa entrenamiento cuantizado vs. PTQ: los datos de cuantizacion post-entrenamiento de cada run permiten cuantificar la brecha entre ambos enfoques sin entrenar desde cero.
- Docencia y divulgacion: modelos de 30M con configuracion completa son adecuados para explicar efectos de precision numerica en cursos o tutoriales con recursos limitados.
- Baseline para metodos de cuantizacion: usar la perdida final de cada regimen como referencia al evaluar tecnicas nuevas (GPTQ, AWQ, etc.) en modelos de escala similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mediciones internas por run (perdida final, barridos de perturbacion, cuantizacion post-entrenamiento) sin cifras concretas. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 30M de parametros en bf16 ocupa aproximadamente 60 MB de pesos; en cuantizaciones de 4 bits, del orden de 15-20 MB. Cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas para inferencia; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para reproducir el entrenamiento, una GPU consumer moderna (RTX 3060 o superior) es suficiente a esta escala.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer y en CPU.
- Opciones de despliegue: los pesos estan en formato OLMo-core (`model.pt`), no en safetensors ni GGUF. Requiere cargar el state dict con el codigo de OLMo-core; no hay soporte directo documentado en vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precision-perturb-fullq | 30M | no disponible | Estudio de precision y perturbacion en preentrenamiento cuantizado | no disponible | Pesos finales en OLMo-core, sin checkpoints intermedios |
| OLMo (AI2) | 1B / 7B / 32B | hasta 4096 en versiones iniciales | Modelos abiertos de lenguaje con datos y recetas publicadas | Apache 2.0 | Pesos en safetensors, amplio ecosistema |
| Pythia (EleutherAI) | 70M-12B | 2048 | Suite de modelos para interpretabilidad y estudio de entrenamiento | Apache 2.0 | Pesos en safetensors, checkpoints intermedios |
| TinyLlama | 1.1B | 2048 | Modelo pequeno entrenado sobre 3T tokens | Apache 2.0 | Pesos en safetensors, amplio soporte |

La comparativa es aproximada: no hay benchmarks publicados de este repositorio que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo para uso en produccion: es un artefacto de investigacion con modelos de 30M de parametros y capacidad generativa muy limitada.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorizacion clara.
- Sin pipeline ni formato estandar: los pesos en `model.pt` de OLMo-core requieren codigo especifico para cargarse; no hay safetensors ni GGUF.
- Sin checkpoints intermedios ni datos de entrenamiento: la model card lo indica explicitamente, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, agravado por el tamano reducido.
- Sesgos: entrenado sobre Dolma CC, hereda los sesgos del corpus web; no se documentan evaluaciones de sesgo.
- Idiomas: no se declaran idiomas soportados; el corpus es predominantemente ingles.
- Sin datos de contexto, benchmarks ni evaluaciones de calidad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaijingchu/precision-perturb-fullq
- Perfil de Hugging Face del autor: https://huggingface.co/gaijingchu
- Listado de modelos del autor: https://huggingface.co/gaijingchu/models
- Pagina personal de Jingchu Gai: https://gaijingchu.github.io/
