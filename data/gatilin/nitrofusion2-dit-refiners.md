# gatilin/nitrofusion2-dit-refiners

## Resumen

NitroFusion2 DiT Refiners es un componente extraído del modelo de difusión NitroFusion2 (ChenDY/NitroFusion2), un transformer de difusión multimodal (MMDiT) derivado de Z-Image-Turbo. El repositorio contiene únicamente los dos bloques refinadores que preceden al tronco principal de 30 capas: un *noise refiner* que procesa los parches latentes ruidosos y un *context refiner* que procesa las características de la leyenda (caption). Lo publica el usuario gatilin como extracción comunitaria de la revisión `62d1a7000af9c46a0c4348d936bd7670ff33c1b9` del modelo original.

El interés de esta ficha es acotado: no se trata de un modelo generativo autónomo, sino de un fragmento de pesos (56 tensores, 715.746.304 parámetros en bfloat16) pensado para investigación, análisis de arquitectura y reutilización de componentes. No puede producir imágenes por sí solo, ya que carece del tronco de 30 capas (10,85 GB), de los embedders de entrada, de la capa final y de los pad tokens.

La relevancia es fundamentalmente técnica: permite estudiar o reutilizar los mecanismos de refinamiento (modulación adaLN, RMSNorm por cabeza, SwiGLU) de un MMDiT moderno sin descargar los 12,31 GB del transformer completo. La extracción se realizó mediante peticiones HTTP por rangos de bytes y se validó byte a byte contra el shard original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (transformer de difusión multimodal); bloques single-stream con atención RMSNorm-precedida, SwiGLU y post-norm |
| Parametros totales | 715.746.304 (361.820.672 en noise_refiner + 353.925.632 en context_refiner) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de parches latentes; `seq` debe ser múltiplo de 32) |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16; el autor indica carga en float32 opcional) |
| Idiomas soportados | no disponible (el componente no procesa texto directamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Cada refinador consta de 2 bloques single-stream. Cada bloque aplica atención con RMSNorm previa y RMSNorm por cabeza sobre q/k (dimensión de cabeza 128), una feed-forward SwiGLU (3840 → 10240 → 3840) y post-norm en ambas ramas residuales. El *noise refiner* incorpora además `adaLN_modulation`, una capa `Linear(256 → 15360)` que genera parámetros de desplazamiento y compuerta para atención y MLP a partir del embedding de timestep, con compuertas `tanh`. El *context refiner* no tiene modulación.

No hay entrenamiento propio en este repositorio: los pesos son una extracción sin modificaciones de NitroFusion2 (revisión fijada), sin cuantización, conversión de dtype ni reordenamiento. La validación documentada incluye carga estricta (`load_state_dict(strict=True)`, 56/56 tensores sin claves faltantes ni inesperadas), salidas finitas sobre imágenes reales de COCO128 pasadas por el VAE de Z-Image y determinismo exacto (error absoluto máximo 0.0). Se documentan dos supuestos: el codificador de texto Qwen3 no se descargó (el *context refiner* recibió características sintéticas con semilla) y la longitud de leyenda con padding se fijó en 64.

## Capacidades

- Refinamiento de parches latentes ruidosos mediante `forward_noise`, con entrada `[batch, seq, 3840]` y condicionamiento adaLN desde el embedding de timestep.
- Refinamiento de características de leyenda mediante `forward_context`, con entrada `[batch, cap_seq, 3840]`.
- Codificación posicional RoPE incluida como `model.rope_embedder`, con `axes_dims` [32, 48, 48], `axes_lens` [1536, 512, 512] y `rope_theta` 256.
- Compatibilidad con `load_state_dict(strict=True)` sin eliminación de prefijos.
- Carga en bfloat16 nativo o float32 mediante `load_model(root, dtype=torch.float32)`.
- No genera imágenes, no procesa texto ni audio, no soporta tool calling ni razonamiento multi-paso: es un componente interno de un pipeline de difusión.

## Casos de uso

- Investigación de arquitecturas MMDiT: analizar o modificar los bloques refinadores (adaLN, RMSNorm por cabeza, SwiGLU) sin cargar el transformer completo de 12,31 GB.
- Reemplazo o ablación de componentes: sustituir los refinadores de un pipeline NitroFusion2 completo para medir su impacto en la calidad de generación.
- Desarrollo de pipelines personalizados con diffusers 0.36.0: integrar los bloques en un grafo propio junto con el tronco y los embedders del repositorio fuente.
- Verificación de reproducibilidad: usar `tensor_mapping.json` y el SHA-256 documentado para auditar la correspondencia con el checkpoint original.
- Docencia y divulgación: explicar el funcionamiento de un refinador de ruido y contexto en difusión con un artefacto de 1,4 GB manejable en CPU.
- Pruebas de determinismo y precisión numérica: comparar ejecuciones en bfloat16 y float32 sobre las mismas entradas, aprovechando la validación de error cero documentada.
- Extracción selectiva como referencia metodológica: el método de peticiones HTTP por rangos sirve de ejemplo para aislar subconjuntos de pesos de checkpoints grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validaciones funcionales (carga estricta, salidas finitas, determinismo), no métricas de calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB para los pesos en bfloat16, más memoria para activaciones según la longitud de secuencia (no cuantificada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para ejecutar el componente aislado; para integrarlo en un pipeline NitroFusion2 completo se requiere además el tronco de 10,85 GB y los embedders.
- Cabe en GPU de consumo: sí, el componente aislado cabe en tarjetas como RTX 3060, RTX 4060 o superiores; la validación oficial se realizó en CPU.
- Opciones de despliegue: carga directa con PyTorch y diffusers 0.36.0 (obligatorio, ya que `ZImageTransformerBlock` no existe en 0.35.x); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles; la validación se midió en CPU sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gatilin/nitrofusion2-dit-refiners | 715.746.304 | no disponible | Apache 2.0 | Hugging Face | Componente aislado, no genera imágenes |
| ChenDY/NitroFusion2 | no disponible (transformer de 12,31 GB) | no disponible | no disponible en la información | Hugging Face | Modelo completo del que se extrae el componente |
| Tongyi-MAI/Z-Image-Turbo | no disponible | no disponible | no disponible en la información | Hugging Face | Modelo base arquitectónico del que deriva NitroFusion2 |

No se dispone de datos de benchmarks ni de parámetros completos de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un pipeline generativo: no puede producir imágenes por sí solo; faltan el tronco de 30 capas, los embedders, la capa final y los pad tokens.
- No incluye adaptadores de entrada: `forward_noise` espera características ya procesadas por `all_x_embedder` y `t_embedder`, y `forward_context` por `cap_embedder`, que deben tomarse del repositorio fuente.
- Requiere diffusers 0.36.0 (o superior); en 0.35.x falla por ausencia de `ZImageTransformerBlock`.
- La validación del *context refiner* usó características sintéticas, no salidas reales del codificador Qwen3; el comportamiento con texto real no está verificado en este repositorio.
- La longitud de leyenda con padding está fijada en 64 en la validación, lo que condiciona el desplazamiento de los position ids de imagen.
- Riesgo de alucinación y sesgos: no aplica directamente al componente, pero hereda los del modelo fuente NitroFusion2 si se integra en un pipeline completo.
- Licencia Apache 2.0 permite uso comercial del componente, pero conviene verificar la licencia del modelo fuente y de los pesos derivados antes de redistribuir un pipeline completo.
- Repositorio con 0 descargas y 0 likes: sin comunidad que valide su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/nitrofusion2-dit-refiners
- Modelo fuente: https://huggingface.co/ChenDY/NitroFusion2
- Modelo base arquitectónico: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Revisión fuente: `62d1a7000af9c46a0c4348d936bd7670ff33c1b9`
