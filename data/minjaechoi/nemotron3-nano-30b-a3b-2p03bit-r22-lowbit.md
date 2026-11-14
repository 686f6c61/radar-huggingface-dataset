# minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22-lowbit

## Resumen

`minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22-lowbit` es un checkpoint de investigación derivado de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de NVIDIA. La particularidad de esta versión es la cuantización agresiva de los expertos enrutados (routed experts) a una media de 2,025 bits por peso, almacenados como códigos empaquetados con una tabla de valores por fila, mientras que el resto de pesos (no-expertos) se mantienen en BF16.

El modelo base pertenece a la familia Nemotron 3 Nano, con arquitectura híbrida `nemotron_h` (soportada mediante `custom_code` en transformers), 30B parámetros totales y aproximadamente 3B parámetros activos por token (de ahí el sufijo A3B). Está orientado a generación de texto conversacional y despliegue eficiente en entornos con memoria limitada.

La relevancia de esta ficha radica en que documenta una técnica de compresión extrema para MoE: reducir el coste de almacenamiento de los expertos sin alterar su salida, ya que, según el autor, los expertos dequantizados son bit-idénticos a la versión BF16 del mismo modelo. Es un artefacto de investigación (13 descargas, 0 likes) y no un modelo listo para producción sin trabajo adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tipo `nemotron_h` con `custom_code` |
| Parametros totales | 30B (según nombre del modelo base) |
| Parametros activos | ~3B por token (sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,025 bits de media (códigos empaquetados con tabla de valores por fila); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (`nvidia-nemotron-open-model-license`) |
| Formato de pesos | safetensors (`layer_XX.safetensors` para expertos empaquetados, `nonexpert.safetensors` para el resto en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con arquitectura `nemotron_h`, que requiere `trust_remote_code` (tag `custom_code`) para cargarse en transformers. La variante aquí descrita no reentrena ni modifica los pesos: aplica una cuantización post-entrenamiento sobre los expertos enrutados, almacenándolos como códigos de baja precisión empaquetados junto a una tabla de valores por fila. El resto de la red (atención, embeddings, capas densas, normalizaciones) permanece en BF16 en `nonexpert.safetensors`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, ya que la model card de esta variante no los detalla. La innovación técnica destacable es la compresión extrema de expertos con preservación exacta de la salida tras dequantizar: el autor afirma que los expertos dequantizados son bit-idénticos a la versión BF16 del mismo modelo, lo que convierte este checkpoint en una representación compacta del original.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Nemotron 3 Nano.
- Razonamiento y matemáticas: capacidades propias de un modelo de 30B totales con ~3B activos, aunque no se publican evaluaciones específicas en esta variante.
- Generación de código: presumible en el modelo base, sin datos verificables en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint sirve para estudiar el impacto de comprimir expertos a ~2 bits manteniendo el resto en BF16, comparando salidas con el modelo BF16 de referencia.
- Almacenamiento y distribución eficiente: con 12,2 GB de repositorio frente al tamaño BF16 del modelo base, facilita mover el modelo entre máquinas y archivarlo en discos de menor capacidad.
- Experimentos de kernels de baja precisión: requiere un loader/kernel MoE personalizado para códigos empaquetados, por lo que es útil como banco de pruebas para desarrollar y validar dichos kernels.
- Evaluación de fidelidad de dequantización: al ser bit-idéntico tras dequantizar según el autor, permite verificar pipelines de carga y dequantización contra la referencia BF16.
- Despliegue en entornos con VRAM ajustada: la reducción de los expertos a ~2 bits baja el peso en memoria de los mismos, aunque el resto en BF16 sigue dominando el consumo; útil para prototipos en GPUs de gama alta consumer.
- Base para futuras re-cuantizaciones o destilaciones: al ser un artefacto intermedio, puede servir de punto de partida para esquemas de compresión más agresivos o para estudiar el equilibrio entre precisión de expertos y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio ocupa 12,2 GB, pero la inferencia requiere cargar el modelo completo (expertos dequantizados más pesos BF16), por lo que el pico de memoria supera con holgura ese tamaño.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base (30B totales), se esperan GPUs de centro de datos (A100, H100) o GPUs consumer de gama alta con suficiente VRAM.
- ¿Cabe en consumer GPU?: no confirmado; dependerá del esquema de carga y de si se dequantiza bajo demanda.
- Opciones de despliegue: la carga estándar con `transformers` o vLLM no es posible para esta variante empaquetada; requiere un loader/kernel MoE personalizado. La versión dequantizada del mismo autor (`minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22`) sí carga con `transformers` y vLLM estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-r22-lowbit`) | 30B totales / ~3B activos | no disponible | Expertos ~2,025 bits + resto BF16 | NVIDIA Nemotron Open Model License | HF, requiere kernel custom |
| `minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22` | 30B totales / ~3B activos | no disponible | Expertos dequantizados a BF16 | NVIDIA Nemotron Open Model License | HF, carga con transformers/vLLM |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | 30B totales / ~3B activos | no disponible | BF16 | NVIDIA Nemotron Open Model License | HF, referencia oficial |

## Limitaciones y advertencias

- Checkpoint de investigación interna: no está pensado como artefacto de producción y requiere un loader/kernel MoE personalizado para códigos empaquetados.
- No es compatible con la carga estándar de `transformers` ni de vLLM en su forma empaquetada; para ello debe usarse la variante dequantizada del mismo autor.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base.
- Riesgo de alucinación: no evaluado en esta variante; se asume el del modelo base.
- Idiomas soportados no declarados, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto no disponible, lo que limita la planificación de despliegues con ventanas largas.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia open source estándar.
- Popularidad muy baja (13 descargas, 0 likes) y fecha de creación futura respecto a los datos habituales: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22-lowbit
- Variante dequantizada cargable con transformers/vLLM: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
