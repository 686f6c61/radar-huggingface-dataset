# FLCgeigeigei/tinyvision-vlm

## Resumen

TinyVision es un modelo de lenguaje y visión (VLM) construido desde cero en PyTorch por el autor FLCgeigeigei. Combina un pequeño modelo de lenguaje de estilo Llama (RMSNorm, RoPE, GQA y SwiGLU, con opción de mezcla de expertos) con un codificador visual SigLIP 2 congelado, unidos mediante un proyector MLP ligero. El proyecto entrena tanto el tokenizador como el modelo de lenguaje desde cero, sin usar pesos preentrenados de ningún LLM.

Se distribuye en dos variantes: una densa de aproximadamente 65 millones de parámetros y una variante MoE con 4 expertos y enrutamiento Top-1, de unos 200 millones de parámetros totales y unos 65 millones activos. El codificador SigLIP 2 permanece congelado y no se contabiliza en esas cifras. El checkpoint publicado es el resultado del ajuste supervisado (SFT) para comprensión de imágenes y generación de descripciones.

El modelo es relevante como pieza didáctica y de experimentación: es un VLM completo, entrenado de principio a fin, con licencia Apache 2.0 y un tamaño que cabe en cualquier GPU de consumo. No está pensado para producción, sino para estudiar el funcionamiento interno de un VLM multimodal y como base para experimentos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm, RoPE, GQA, SwiGLU) con proyector MLP y codificador visual SigLIP 2 congelado |
| Parametros totales | ~65M (densa) / ~200M (MoE); el codificador SigLIP 2 no se cuenta |
| Parametros activos | ~65M en la variante MoE (4 expertos, Top-1) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 (los pesos y el codigo); el codificador SigLIP 2 se rige por su propia licencia |
| Formato de pesos | PyTorch `state_dict` (`.pth`); no hay safetensors, GGUF ni `config.json` |

Otros datos tecnicos: `hidden_size` de 768, 8 capas ocultas, vocabulario de 6400 tokens (BPE propio), 64 tokens de imagen por imagen (256x256), y tamano del repositorio de 0.7 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de tipo Llama con normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con consultas agrupadas (GQA) y FFN SwiGLU. La variante MoE sustituye la FFN por 4 expertos con enrutamiento Top-1, manteniendo el mismo coste de activacion que la variante densa. La entrada visual se procesa con el codificador SigLIP 2 (`siglip2-base-patch32-256`), que permanece congelado, y se proyecta al espacio del modelo de lenguaje mediante un MLP ligero. Cada imagen se representa con 64 tokens especiales `<|image_pad|>`.

El entrenamiento se realizo integramente desde cero: tokenizador BPE propio (vocabulario 6400), preentrenamiento y ajuste supervisado de todos los parametros del modelo de lenguaje. El SFT se hizo sobre el dataset `FLCgeigeigei/tinyvision-vlm-data` para tareas de descripcion de imagenes y comprension visual. No se menciona uso de RLHF, DPO ni tecnicas de alineacion de seguridad. El tokenizador incluye tokens especiales para vision, audio y video, aunque las capacidades publicadas se limitan a imagen y texto.

## Capacidades

- Generacion de texto y comprension visual basica a partir de imagenes (descripcion, captioning).
- Conversacion multimodal de tipo image-text-to-text mediante prompts con marcadores `<|image_pad|>`.
- Soporte de dos idiomas: chino e ingles.
- Variante MoE con 4 expertos y enrutamiento Top-1 para experimentacion con arquitecturas dispersas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking), audio ni video, pese a que el tokenizador reserve tokens para ello.

## Casos de uso

- Experimentacion educativa: estudiar el pipeline completo de un VLM (tokenizador, proyector, LLM) con un modelo que se carga y ejecuta en una sola GPU de consumo.
- Generacion de descripciones de imagenes (captioning) en prototipos: el modelo acepta una imagen de 256x256 y produce una descripcion en chino o ingles, util para validar pipelines de datos multimodales.
- Comparacion densa frente a MoE: las dos variantes permiten medir el efecto del enrutamiento Top-1 sobre calidad y coste con el mismo backbone.
- Investigacion de alineacion visual-texto: al entrenarse desde cero y sin RLHF, sirve como linea base para estudiar sesgos y errores de un VLM sin ajuste de seguridad.
- Pruebas de integracion con SigLIP 2 congelado: util para evaluar como afecta un codificador visual fijo al rendimiento de un LLM pequeno.
- Docencia y talleres: su tamano (65M-200M parametros) y su licencia Apache 2.0 permiten usarlo en cursos y demos sin restricciones de coste ni de licencia.
- Base para fine-tuning controlado: al ser codigo PyTorch plano sin `trust_remote_code`, es facil de modificar y reentrenar para tareas especificas de imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos densos ocupan unos 140 MB y los MoE unos 409 MB, mas el codificador SigLIP 2 congelado y las activaciones. Cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4060, RTX 4090; tambien funciona en CPU para pruebas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales.
- Opciones de despliegue: carga directa con PyTorch y `transformers` (tokenizador); el proyecto incluye una CLI en `python -m tinyvision.cli.chat`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TinyVision (este) | ~65M densa / ~200M MoE (activos ~65M) | no disponible | Apache 2.0 | VLM desde cero, 2 idiomas, sin RLHF |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion facilitada.

## Limitaciones y advertencias

- Modelo muy pequeno: conocimiento del mundo limitado y errores frecuentes; el autor recomienda tratarlo como comportamiento crudo del modelo.
- Solo chino e ingles, con un vocabulario de 6400 tokens.
- Sin RLHF ni ajuste de seguridad: puede generar contenido inapropiado o sesgado sin filtros.
- Riesgo elevado de alucinacion por su tamano y por la ausencia de alineacion.
- No esta pensado para produccion; el propio autor lo indica.
- El codificador SigLIP 2 se rige por su propia licencia, distinta de la Apache 2.0 del modelo.
- No hay `config.json` ni `auto_map`: la carga requiere construir el modelo a mano y que el flag `use_moe` coincida con el checkpoint.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas.
- La resolucion de imagen esta fijada a 256x256 con 64 tokens por imagen.

## Enlaces

- Hugging Face: https://huggingface.co/FLCgeigeigei/tinyvision-vlm
- Dataset de SFT: https://huggingface.co/datasets/FLCgeigeigei/tinyvision-vlm-data
- Repositorio del proyecto: https://github.com/FLCgeigei/tinyvision
- Codificador visual SigLIP 2: https://huggingface.co/google/siglip2-base-patch32-256
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
