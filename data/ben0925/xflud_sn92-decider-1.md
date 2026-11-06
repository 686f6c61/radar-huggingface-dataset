# ben0925/xflud_sn92-decider-1

## Resumen

xflud_sn92-decider-1 es un fine-tune del modelo base baselabs/mammoth-1, publicado por el usuario ben0925 en Hugging Face. El modelo está desarrollado para la pista "generalist" de REAX, el subnet 92 de la red Bittensor, una red descentralizada de incentivos para modelos de IA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (creada el 2 de noviembre de 2026) y de nicho.

El modelo cuenta con 26.085.330.160 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 26B parámetros. El tag `qwen3_5` sugiere que la arquitectura subyacente está basada en Qwen 3.5, aunque esta información no está confirmada en la model card. El repositorio ocupa 52,2 GB, lo que es coherente con pesos en precisión BF16 para un modelo de este tamaño.

La relevancia de este modelo es limitada fuera del ecosistema Bittensor/REAX: se trata de un fine-tune especializado para una competición concreta de un subnet, con documentación mínima y sin benchmarks publicados. Su interés principal radica en ser un ejemplo de modelo entrenado para tareas de decisión dentro de un sistema de incentivos descentralizado, y en su licencia MIT, que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente basada en Qwen 3.5, segun el tag `qwen3_5`; no confirmado en la model card) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo. El tag `qwen3_5` sugiere que el modelo base baselabs/mammoth-1 está construido sobre la arquitectura Qwen 3.5, un transformer decoder-only con atención completa y posiblemente componentes de atención lineal o híbrida, aunque esto no se confirma en la documentación disponible. El tamaño de 26B parámetros y el repositorio de 52,2 GB son consistentes con pesos en BF16 sin cuantizar.

El entrenamiento consistió en un fine-tune del modelo baselabs/mammoth-1 (revisión 61cec44c) para la pista generalist del subnet 92 de Bittensor (REAX). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. La model card es extremadamente escueta y se limita a indicar la licencia MIT y la relación de fine-tune con el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base baselabs/mammoth-1.
- Especialización en tareas de decisión dentro del track generalist de REAX (subnet 92 de Bittensor), aunque no se detallan las capacidades concretas de esta especialización.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Participación en el subnet 92 de Bittensor (REAX): el modelo está entrenado específicamente para la pista generalist de esta competición, por lo que su uso principal es la minería o validación dentro de ese ecosistema.
- Investigación sobre fine-tuning para sistemas de incentivos descentralizados: sirve como ejemplo de cómo se adapta un modelo base de 26B a una tarea concreta de decisión en un subnet.
- Evaluación comparativa de fine-tunes de mammoth-1: útil para investigadores que quieran comparar distintas adaptaciones del mismo modelo base.
- Prototipado de agentes de decisión en entornos con recompensas: aunque no se documentan las capacidades exactas, el nombre "decider" sugiere un uso en tareas de selección o clasificación.
- Desarrollo con licencia permisiva: al ser MIT, puede integrarse en productos comerciales sin restricciones de licencia, siempre que se cumplan las condiciones de atribución.
- Base para nuevos fine-tunes: al estar publicado en safetensors y con licencia MIT, puede servir como punto de partida para adaptaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26B parámetros en BF16, se necesitan aproximadamente 52 GB de VRAM solo para los pesos. En cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-15 GB.
- GPU recomendadas: para BF16, se requieren GPUs con 80 GB (A100, H100) o múltiples GPUs. Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría una A6000 (48 GB) o similar. Para 4 bits, una RTX 4090 de 24 GB podría alojar el modelo.
- ¿Cabe en consumer GPU? En cuantización 4 bits, sí en GPUs de 24 GB como la RTX 4090 o la RTX 3090. En 8 bits, no en GPUs de consumo habituales.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan GGUF), Ollama (si se generan GGUF). No se dispone de información sobre latencia o throughput.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ben0925/xflud_sn92-decider-1 | 26B | no disponible | MIT | Hugging Face | Fine-tune para REAX subnet 92 |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Qwen 3.5 (si el tag es correcto) | no disponible | no disponible | no disponible | no disponible | Arquitectura subyacente probable |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Sesgos conocidos: no disponibles, pero al derivar de un modelo base sin documentación, es probable que herede sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, presenta riesgo de generar información falsa, especialmente en dominios no cubiertos por su fine-tune.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías. Es necesario revisar el archivo LICENSE y NOTICE del repositorio para cumplir con las condiciones.
- Caveat para producción: al ser un fine-tune especializado en una competición concreta, su rendimiento fuera de ese dominio es incierto. No se recomienda su uso en producción sin una evaluación previa en la tarea objetivo.

## Enlaces

- [Hugging Face: ben0925/xflud_sn92-decider-1](https://huggingface.co/ben0925/xflud_sn92-decider-1)
- [Modelo base: baselabs/mammoth-1](https://huggingface.co/baselabs/mammoth-1)
- [Bittensor](https://bittensor.com/)
- [REAX (subnet 92)](https://huggingface.co/ben0925/xflud_sn92-decider-1) (no se dispone de enlace oficial adicional)
