# akhaliq/MiniMax-H3-Image-Character-Swap

## Resumen

MiniMax-H3-Image-Character-Swap es un checkpoint de edicion de imagen por difusion resultado de fusionar el adaptador LoRA `akatz-ai/MiniMax-H3-Character-Swap-LoRA` directamente sobre el modelo base `MiniMaxAI/MiniMax-H3-Image`. Lo publica el usuario akhaliq y su proposito es resolver el reemplazo de personajes (character swap) en imagenes de forma "lista para usar": sin ficheros LoRA separados, sin remapeo de claves y sin grafos de ComfyUI, simplemente cargando el pipeline de diffusers y ejecutandolo. La fusion se realiza sobre el DiT de imagen del modelo base.

El modelo aborda un fallo concreto del modelo base: los swaps entre estilos distintos (por ejemplo, un personaje de anime insertado en una escena fotorrealista) sobre caras no frontales, donde MiniMax-H3-Image nativo mantiene la cara original en las tres semillas probadas. La version fusionada resuelve ese caso manteniendo fondo, iluminacion, otras personas y pose. El repo pesa 68,6 GB y requiere `diffusers==0.43.0`; la ejecucion local completa necesita aproximadamente 140 GB de VRAM (DiT de 66 GB mas codificador de texto Qwen3-VL de 67 GB).

Se trata de un modelo de imagen-a-imagen (image-to-image) con soporte de multiples referencias de imagen, orientado a edicion fotografica y de personajes, no a generacion de texto. Su relevancia actual radica en que demuestra el port de un adaptador entrenado sobre video al modelo de imagen H3, con resultados verificables en un conjunto de pruebas publico de ocho casos dificiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de imagen con codificador de texto Qwen3-VL; pipeline modular de diffusers |
| Parametros totales | no disponible (repo de 68,6 GB; DiT ~66 GB en bfloat16, codificador ~67 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (`license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion (merge) del checkpoint base MiniMax-H3-Image con el LoRA de character swap de akatz-ai, aplicada directamente sobre el DiT de imagen. El pipeline es modular (`ModularPipeline` de diffusers) y referencia el codificador de texto Qwen3-VL desde el repositorio original, cargado automaticamente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para el modelo base ni para el LoRA.

La innovacion principal descrita por el autor es el propio proceso de fusion: portar un adaptador de character swap entrenado sobre video al modelo de imagen H3 sin necesidad de ficheros LoRA externos ni remapeo de claves, produciendo un unico checkpoint cargable. El modelo admite resoluciones de aproximadamente 4 MP (2720x1536, multiplo de 32) y hasta 16 MP, y trabaja con multiples imagenes de referencia etiquetadas en el prompt como `<Picture 1>` y `<Picture 2>`.

## Capacidades

- Edicion de imagen image-to-image con multiples referencias visuales.
- Reemplazo de personajes preservando fondo, iluminacion, otras personas y pose.
- Swaps entre estilos distintos (personaje anime o ilustrado insertado en escena fotorrealista), caso en el que el modelo base falla.
- Mantenimiento de identidad de referencia: rasgos faciales, tono de piel, peinado y vestuario del personaje de referencia.
- Respeto de pose, posicion, escala y direccion de la mirada del personaje sustituido.
- Generacion determinista por semilla (los ejemplos se reproducen con semilla fija).
- Soporte de resoluciones de ~4 MP y 16 MP.
- Idioma de prompt: ingles.

## Casos de uso

- Produccion audiovisual y storyboarding: sustituir un actor o personaje por otro en una fotograma manteniendo la composicion de la escena, util para previsualizar casting o continuidad entre planos.
- Creacion de contenido para redes y marketing: insertar una mascota de marca o un personaje ilustrado en fotografias de producto o de localizaciones reales sin reiluminar ni recomponer la escena.
- Videojuegos e ilustracion: trasladar un personaje de estilo anime a escenas fotorrealistas para key art o material promocional, aprovechando la ventaja del modelo en swaps entre estilos.
- Edicion fotografica profesional: reemplazar a una persona en una foto de grupo o de cuerpo entero conservando el resto de sujetos y el entorno, con resoluciones de hasta 16 MP.
- Prototipado de personajes en pipelines creativos: iterar sobre una misma escena con distintas referencias de personaje usando semillas fijas para comparar resultados de forma controlada.
- Investigacion en edicion por difusion: servir como checkpoint de referencia para estudiar la fusion de LoRA de video sobre modelos de imagen y evaluar la preservacion de identidad en casos dificiles (perfil, oclusion, cara pequena).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (tipo MMLU, HumanEval o metricas de similitud facial) en la informacion disponible. El autor aporta una comparacion cualitativa sobre un conjunto de pruebas de ocho casos dificiles (perfil, cara pequena, oclusion, cuerpo entero y grupo), disponible en `akhaliq/h3-image-swap-tests`, con estos resultados descritos:

| Caso | Modelo base (MiniMax-H3-Image) | Este modelo (fusionado) |
|---|---|---|
| Anime a escena de perfil estricto | Mantiene la cara original en 3 de 3 semillas | Realiza el swap correctamente |
| Personaje fotorrealista a escena de cafeteria | Funciona | Funciona, con mayor fidelidad a la identidad de referencia |
| Anime a escena de cuerpo entero | Funciona | Funciona, conserva mas detalle del vestuario de referencia |

## Requisitos de hardware

- VRAM estimada para ejecucion local completa: aproximadamente 140 GB (DiT de 66 GB mas codificador de texto Qwen3-VL de 67 GB) en bfloat16.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) sin estrategias de offload o ejecucion remota del codificador.
- El autor senala que la parte pesada es el codificador de texto, no el swap, y propone ejecutar el codificador de forma remota para reducir requisitos en una sola GPU.
- GPUs de clase centro de datos (A100 80 GB, H100 80 GB) requeridas para la carga completa; con el codificador en remoto el DiT podria ajustarse a una GPU de 80 GB.
- Despliegue mediante `diffusers==0.43.0` con `ModularPipeline`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en swap | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhaliq/MiniMax-H3-Image-Character-Swap | no disponible (repo 68,6 GB) | no disponible | Mejora el modelo base en swaps entre estilos y perfiles | minimax-h3-image-community-license-agreement | Hugging Face, diffusers |
| MiniMaxAI/MiniMax-H3-Image (base) | no disponible | no disponible | Falla en swaps entre estilos sobre caras no frontales | minimax-h3-image-community-license-agreement | Hugging Face |
| akatz-ai/MiniMax-H3-Character-Swap-LoRA | no disponible (LoRA) | no disponible | Requiere cargar LoRA por separado y remapeo de claves | no disponible | Hugging Face |

No se dispone de datos de otros modelos de edicion de imagen comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `minimax-h3-image-community-license-agreement` (categoria "other"): es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no se garantiza permiso de uso comercial por defecto.
- Solo se declara soporte de ingles; los prompts en otros idiomas pueden degradar el resultado.
- Riesgo de alucinacion visual: el modelo puede generar detalles inexistentes en la referencia o en la escena, especialmente en caras pequenas u ocluidas.
- El conjunto de pruebas del autor es reducido (ocho casos) y la evaluacion es cualitativa, sin metricas objetivas de identidad ni de preservacion de fondo.
- Requisitos de hardware muy elevados (~140 GB de VRAM) que limitan su uso a infraestructura de centro de datos o a configuraciones con el codificador en remoto.
- Dependencia estricta de `diffusers==0.43.0` y del pipeline modular; cambios de version pueden romper la carga.
- Sesgos no documentados en la informacion disponible; al ser un modelo de edicion de personas, puede amplificar sesgos demograficos del dataset de entrenamiento del modelo base.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/MiniMax-H3-Image-Character-Swap
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- LoRA de origen: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Conjunto de pruebas: https://huggingface.co/datasets/akhaliq/h3-image-swap-tests
- Demo Space (construccion via ML Intern): https://hf.co/chat?mode=ml-intern&prompt=Build%20a%20Gradio%20demo%20Space%20for%20akhaliq%2FMiniMax-H3-Image-Character-Swap
- Receta para entrenar un LoRA nativo de H3-Image: https://hf.co/chat?mode=ml-intern&prompt=Train%20a%20character-swap%20LoRA%20natively%20on%20MiniMax-H3-Image%20using%20the%20recipe%20in%20akhaliq%2FMiniMax-H3-Image-Character-Swap
