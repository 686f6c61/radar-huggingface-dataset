# gatilin/hy-nomas-dit

## Resumen

Hy-Nomas Diffusion Transformer es un componente extraído del modelo `tencent/Hy-Nomas-Diffusers`, un sistema de generación de vídeo basado en un diffusion transformer con arquitectura segmento-autorregresiva. El repositorio, publicado por el usuario `gatilin`, contiene únicamente el subdirectorio `transformer/` en BF16 del modelo original, con su configuración nativa, checkpoint fragmentado e índice de shards. No se trata de un modelo completo listo para inferencia, sino de una pieza aislada de un pipeline mayor.

El transformer consta de 54 bloques (en su versión completa) y aproximadamente 8.550 millones de parámetros, lo que lo sitúa en la categoría de modelos de difusión de gran escala para vídeo. La arquitectura combina atención dual-stream con generación autorregresiva por segmentos, un enfoque habitual en world models y modelos de vídeo recientes que buscan mantener coherencia temporal sobre ventanas largas.

Su relevancia es limitada pero específica: sirve como referencia para investigadores que quieran estudiar o reutilizar el componente transformer de Hy-Nomas sin descargar el pipeline completo, o para integrarlo en runtimes compatibles. El autor advierte explícitamente de que el checkpoint no ha sido validado más allá de un test de un solo bloque, y que el decodificador PixelUMM, el text encoder, el scheduler y la gestión de KV-cache no están incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer segmento-autorregresivo, 54 bloques, atención dual-stream |
| Parametros totales | 8.553.434.592 (~8,55 B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, checkpoint fragmentado en 4 shards con índice) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) orientado a generación de vídeo y world modeling. La arquitectura es segmento-autorregresiva: el transformer procesa segmentos de vídeo de forma secuencial manteniendo estado a través de KV-cache, lo que permite generar secuencias más largas que la ventana de atención inmediata. Internamente usa bloques dual-stream, un patrón habitual en modelos de difusión que separan el flujo de tokens de texto/condicionamiento del flujo de tokens visuales antes de combinarlos. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal.

El repositorio es un extracto, no un entrenamiento nuevo: los cuatro shards originales se copiaron del repositorio `tencent/Hy-Nomas-Diffusers` en la revisión `a1ae04d11ae4ea176d1f76de634c115944f9882d` y se verificaron por SHA-256 y tamaño contra los metadatos de origen, aunque el autor indica que no se descargaron ni hashearon localmente de forma independiente. La validación publicada (`validation_block0.json`) se limita a cargar los 32 tensores del primer bloque en una implementación fork de Diffusers 0.35.2 con un adaptador de compatibilidad, comprobar repetibilidad determinista y sensibilidad a una perturbación de texto sintético. No se probaron los 54 bloques, el decodificador, el comportamiento de caché ni la generación de vídeo real.

## Capacidades

- Generación de vídeo mediante difusión: el transformer es el núcleo denoising del pipeline Hy-Nomas, pensado para síntesis de vídeo condicionada por texto.
- World modeling: la naturaleza segmento-autorregresiva y el uso de KV-cache apuntan a mantener coherencia temporal en secuencias largas.
- Condicionamiento por texto: el modelo base integra un text encoder (no incluido en este repositorio) para guiar la generación.
- Interfaz de cámara: la model card del componente menciona una "camera interface" en el pipeline completo, lo que sugiere control de trayectorias de cámara en la generación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo de lenguaje.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible como capacidades del componente aislado.

## Casos de uso

- Investigación sobre diffusion transformers para vídeo: el checkpoint permite estudiar la estructura interna de un DiT de 54 bloques y 8,55 B de parámetros sin necesidad de descargar el pipeline completo, útil para analizar atención dual-stream o estrategias de sharding.
- Reutilización de componentes en runtimes propios: equipos que ya dispongan del text encoder, scheduler y decodificador PixelUMM de Hy-Nomas pueden sustituir o comparar el transformer con esta copia BF16 verificada por shards.
- Reproducción de experimentos académicos: el test de validación del primer bloque y los SHA-256 registrados en `source_shards.json` permiten auditar la integridad del checkpoint antes de integrarlo en un pipeline de investigación.
- Desarrollo de adaptadores de compatibilidad: el repositorio documenta un fork de Diffusers 0.35.2 con un adaptador que elimina el argumento `parallel_config=None`; sirve como base para portar el modelo a otras versiones de Diffusers.
- Benchmarking de infraestructura de inferencia: con 17,1 GB en BF16, el checkpoint es útil para medir carga, sharding y memoria en GPUs de distinto tamaño antes de abordar el pipeline completo.
- Formación y docencia: como ejemplo didáctico de cómo se estructura un checkpoint de difusión fragmentado (config nativa, shards e índice) y de las precauciones de verificación de integridad en modelos extraídos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de validación es `validation_block0.json`, que reporta carga estricta de los 32 tensores del primer bloque, repetibilidad determinista y sensibilidad a una perturbación de texto; no incluye métricas de calidad de vídeo, FVD, CLIP score ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 17,1 GB, por lo que se necesitan al menos ~18-20 GB de VRAM solo para los pesos del transformer, sin contar activaciones, KV-cache ni el resto del pipeline (text encoder y decodificador PixelUMM).
- GPU recomendadas: para el componente aislado en BF16, una A100 40 GB, H100 80 GB o L40S 48 GB ofrecen margen suficiente. Una RTX 4090 de 24 GB podría cargar los pesos, pero el margen para activaciones y caché es muy ajustado y no se ha validado.
- ¿Cabe en consumer GPU? Potencialmente en RTX 4090 (24 GB) solo el transformer en BF16 y con riesgo de OOM al añadir activaciones; en GPUs de 16 GB o menos no cabría sin cuantización, y no se documentan formatos cuantizados para este repositorio.
- Opciones de despliegue: Diffusers (el autor probó un fork sobre 0.35.2 con adaptador de compatibilidad); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un diffusion transformer de vídeo.
- Latencia y throughput: no disponibles; no se han publicado mediciones y el pipeline completo no fue probado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/hy-nomas-dit | ~8,55 B | no disponible | DiT de vídeo (componente extraído) | Apache-2.0 | Hugging Face, solo transformer BF16 |
| tencent/Hy-Nomas-Diffusers | no disponible en la información proporcionada | no disponible | Pipeline completo de vídeo | Apache-2.0 (según el componente) | Hugging Face, pipeline completo |
| Otros DiT de vídeo open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, otros diffusion transformers de vídeo open source) no está disponible en la información proporcionada; no se aportan datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Componente incompleto: el repositorio solo incluye el transformer; faltan text encoder, scheduler, decodificador PixelUMM, tokenizer, condicionamiento, interfaz de cámara, gestión de KV-cache y runtime compatible. No genera vídeo por sí solo.
- Validación mínima: solo se probó el primer bloque con tokens sintéticos en CPU float32; no se validaron los 54 bloques, el decodificador, la caché ni la generación real.
- Verificación de integridad parcial: los SHA-256 de los shards se compararon contra metadatos remotos, pero el autor indica que no se descargaron ni hashearon localmente de forma independiente.
- Sin benchmarks: no hay métricas de calidad, sesgos o rendimiento publicadas para este componente.
- Riesgo de alucinación y sesgos: no evaluados; al ser un modelo de difusión de vídeo, los riesgos se refieren a contenido visual sesgado o no fiel, no a texto generado.
- Idiomas: no disponibles; el condicionamiento textual depende del text encoder ausente.
- Licencia: Apache-2.0 permite uso comercial, pero los componentes de terceros del pipeline original quedan sujetos a sus propias licencias; conviene revisar la model card oficial de Tencent.
- Producción: no recomendado como pieza aislada sin un pipeline completo validado y sin pruebas de integración en el runtime objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/hy-nomas-dit
- Modelo base: https://huggingface.co/tencent/Hy-Nomas-Diffusers
- Revisión de origen del checkpoint: `a1ae04d11ae4ea176d1f76de634c115944f9882d` en el repositorio base
- Fork de referencia para el test de bloque: commit `1a0aaa32baa8ab02beaa376fec26f93817393562` (archivo `native_source/transformer_hy_nomas.py` dentro del repositorio)
- Diffusers 0.35.2: https://github.com/huggingface/diffusers
