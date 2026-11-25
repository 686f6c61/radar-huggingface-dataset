# hoidhxd/HyperFlow-H3-Flash-INT8-ComfyUI-Hybrid

## Resumen

HyperFlow H3 Flash INT8 ComfyUI Hybrid es un modelo de generación de vídeo (y audio) a partir de imagen y texto, distribuido como un checkpoint de difusión para ComfyUI. No es un modelo entrenado desde cero, sino un híbrido comunitario construido por el usuario hoidhxd a partir de dos variantes INT8 del modelo HyperFlow H3 Flash: la variante FL2VA (base, orientada a texto-a-vídeo, imagen-a-vídeo y primer/último fotograma a vídeo) y la variante REF2VA (orientada a referencia-a-vídeo). El resultado combina los pesos de FL2VA con la modulación AdaLN de REF2VA en los bloques fuente 25 a 49.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de fusión poco habitual: en lugar de intercambiar tensores en bruto, los pesos `adaln_proj` sustituidos se reajustan por mínimos cuadrados al embedder temporal de FL2VA, de modo que la modulación resultante reproduce la de REF2VA con un error relativo L2 de aproximadamente 0,17 %, frente al 8,6–13 % de un intercambio directo. Por otro, el modelo está empaquetado en formato INT8 convrot con 47 bloques y 15,9 GB, pensado para ejecutarse en GPUs de consumo mediante streaming de pesos desde RAM del sistema.

El modelo es explícitamente no oficial: no está producido, revisado ni respaldado por MiniMax, Video Rebirth, Comfy Org ni BennyDaBall. La licencia es la Minimax H3 Community License Agreement, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (familia MiniMax-H3 / HyperFlow H3 Flash), 47 bloques, con modulación AdaLN; formato ComfyUI MiniMax-H3 |
| Parámetros totales | no disponible (checkpoint de 15,9 GB en INT8) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 convrot (pesos INT8 con escalas por fila y pares de bajo rango); 50 tensores `adaln_proj` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (`minimax_h3_hyperflow_flash_hybrid_aligned_fl2va_ref2va_b25-49_int8_convrot.safetensors`, 15,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión de la familia MiniMax-H3, destilado en la línea HyperFlow H3 Flash para generación en pocos pasos (few-step). El checkpoint contiene 47 bloques, resultado de podar los bloques fuente 6, 21 y 22 del archivo FL2VA original. La cuantización es INT8 convrot, con códigos INT8, escalas por fila y pares de bajo rango; el híbrido no dequantiza ni recuantiza nada: todos los códigos INT8, escalas, pares de bajo rango, embedder, gates y tensores sigma son byte-idénticos a los de FL2VA.

La innovación técnica es la alineación de la modulación AdaLN. Cada bloque lee `silu(t_emb)`, donde `t_emb` procede del `time_embedder` propio del modelo (mezclado con el embedder de extremos de HyperFlow, con puerta 0,25). FL2VA y REF2VA se destilaron por separado y sus embeddings temporales difieren entre un 50 % y un 140 % en L2 relativo a lo largo del esquema de 6 pasos, aunque la modulación que producen difiere solo un 2–5 %. Por eso el autor reajusta los pesos `adaln_proj` de los bloques 25–49 resolviendo por mínimos cuadrados `W′ · silu(emb_FL2VA(t, r)) + b′ ≈ W_REF2VA · silu(emb_REF2VA(t, r)) + b_REF2VA` sobre una rejilla densa de (t, r) más los seis pares del esquema, con ponderación. Como ambos lados son lineales en los pesos aumentados, el ajuste se reduce a un único mapa compartido de 17×17 aplicado a cada bloque. Se reescribieron 50 tensores BF16 (25 bloques × peso + sesgo). El emparejamiento de bloques se hace por índice de bloque fuente original: el bloque fuente *b* es `blocks.{b-3}` en FL2VA y `blocks.{b-1}` en REF2VA.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de vídeo a partir de texto (t2v).
- Generación de vídeo a partir de imagen (i2v).
- Generación de vídeo a partir del primer y último fotograma (flf2v), manteniendo la adherencia a los keyframes gracias a la alineación de la modulación.
- Generación de vídeo a partir de una referencia (ref2v), funcionalidad heredada de REF2VA y validada en las pruebas del autor.
- Generación de audio junto al vídeo (etiqueta `audio-video-generation`).
- Generación en pocos pasos: esquema de 6 pasos con sampler `euler` y CFG 1.
- Compatibilidad con atención densa y con atención dispersa Sol-Attn (aceleración de aproximadamente 2,3× por paso).
- Integración en ComfyUI mediante los loaders HyperFlow INT8 y HyperFlow oficial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Prototipado rápido de vídeo generativo en GPU de consumo: con 16 GB de VRAM y atención dispersa Sol, el modelo produce clips de 1344×768 y 124 fotogramas en unos 301 s (t2v) o 284 s (flf2v), lo que permite iterar sobre guiones visuales sin acceso a clústeres.
- Interpolación entre fotogramas clave para animática: el modo flf2v respeta el primer y el último fotograma, útil para convertir storyboards en secuencias animadas manteniendo la composición deseada.
- Generación de vídeo guiada por referencia de personaje o estilo: el modo ref2v permite reutilizar una referencia visual para mantener consistencia entre planos, adecuado para series cortas o contenido de marca.
- Creación de clips cortos con audio para redes sociales: la etiqueta de generación audio-vídeo y el bajo número de pasos permiten producir piezas de unos pocos segundos en una sola pasada.
- Pruebas de concepto de pipelines de difusión en ComfyUI: el checkpoint sirve para validar flujos de trabajo t2v, i2v y flf2v con cuantización INT8 y atención dispersa antes de escalar a modelos mayores.
- Investigación sobre fusión de modelos de difusión: el archivo documenta un método reproducible de reajuste de modulación AdaLN, útil para estudiar merges de checkpoints destilados sin romper la adherencia a condicionamientos.
- Evaluación comparativa de atención densa frente a dispersa: las pruebas del autor ofrecen cifras de tiempo por paso y VRAM pico que sirven como referencia para medir el impacto de Sol-Attn en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de inferencia en una RTX 5060 Ti de 16 GB con ComfyUI 0.31.0, resolución 1344×768, 124 fotogramas, 6 pasos, sampler `euler`, CFG 1, semilla 42 y `patcher: legacy`:

| Configuración | Tiempo total | Muestreo | s/paso | VRAM pico |
|---|---:|---:|---:|---:|
| t2v, atención densa | 395 s | 330 s | 51,8 | 15,4 GB |
| flf2v, atención densa | 584 s | 486 s | 65,2 | 15,8 GB |
| t2v, atención dispersa Sol | 301 s | 237 s | 22,8 | 14,1 GB |
| flf2v, atención dispersa Sol | 284 s | 205 s | 30,6 | 15,7 GB |
| ref2v, atención dispersa Sol | 262 s | 190 s | 26,4 | 15,7 GB |

El autor también mide la calidad de la alineación de la modulación por bloque (bloques 25–49), en L2 relativo:

| Comparación | Rango |
|---|---:|
| FL2VA vs REF2VA (cada uno con su embedder) | 1,6–4,1 % |
| Intercambio directo (pesos REF2VA con embedding de FL2VA) vs REF2VA | 8,6–13 % |
| Alineado (este archivo) vs REF2VA | 0,17 % |

## Requisitos de hardware

- VRAM estimada: entre 14,1 y 15,8 GB de pico según configuración y atención, medido en una RTX 5060 Ti de 16 GB.
- En una tarjeta de 16 GB, unos 9,5 GB de los pesos permanecen en RAM del sistema (64 GB en la prueba) y se transmiten en cada paso.
- GPU recomendadas: RTX 5060 Ti 16 GB validada por el autor; por tamaño de checkpoint (15,9 GB) encaja en GPUs de 16 GB o más con streaming; para evitar streaming se necesita VRAM superior al tamaño del checkpoint, sin cifra publicada.
- Cabe en GPU de consumo de 16 GB, con la penalización de streaming de pesos descrita.
- Despliegue: ComfyUI con los nodos ComfyUI-HyperFlow-Flash y comfyui_hyperflow_int8_nodes; loaders HyperFlow INT8 y HyperFlow oficial. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 22,8–65,2 s por paso según atención y tarea; 262–584 s por clip completo en la configuración de prueba.
- Arrancar ComfyUI con `--enable-triton-backend` es crítico: sin PyTorch con CUDA 13, el backend CUDA de comfy_kitchen se desactiva y la ruta INT8 convrot cae al modo eager lento (unos 300 s por paso en lugar de unos 52).
- Cargar el archivo desde un HDD a 7200 rpm añade entre 80 y 90 s a la primera ejecución.

## Comparativa con modelos similares

| Modelo | Tipo | Formato / tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash INT8 ComfyUI Hybrid (este) | Híbrido FL2VA × REF2VA, difusión vídeo | safetensors INT8 convrot, 15,9 GB, 47 bloques | no disponible | minimax-h3-community-license-agreement | Hugging Face, 214 descargas, 3 likes |
| BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI (FL2VA) | Modelo base de vídeo, difusión | safetensors INT8 convrot, 47 bloques | no disponible | no disponible en la información | Hugging Face |
| VideoRebirthAI/hyperflow-h3-flash (REF2VA) | Modelo base de vídeo, difusión | safetensors, 49 bloques | no disponible | no disponible en la información | Hugging Face |
| Comfy-Org/MiniMax-H3 | Text encoder y VAEs del ecosistema | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no está producido, revisado ni respaldado por MiniMax, Video Rebirth, Comfy Org ni BennyDaBall; el soporte y la validación corren a cargo del autor comunitario.
- Licencia Minimax H3 Community License Agreement: es necesario revisar sus términos antes de cualquier uso comercial, ya que impone condiciones específicas sobre el modelo base.
- El híbrido solo modifica los bloques fuente 25–49; el resto del comportamiento es el de FL2VA, por lo que hereda sus sesgos y limitaciones.
- Riesgo de alucinación visual y de deriva temporal en clips largos: no se documentan evaluaciones sistemáticas de fidelidad más allá de las comparaciones de fotogramas del autor.
- La adherencia a keyframes depende de usar este archivo alineado; un intercambio directo de tensores rompe la adherencia al primer y último fotograma, como demuestra el autor.
- El pack ComfyUI-sol-attn comprueba el nombre exacto de clase `MiniMaxH3Model` y deja fuera la subclase de HyperFlow, por lo que la compatibilidad con atención dispersa puede requerir ajustes.
- El rendimiento depende críticamente del backend: sin `--enable-triton-backend` y PyTorch con CUDA 13, la inferencia INT8 cae a una ruta eager unas seis veces más lenta.
- El streaming de pesos desde RAM del sistema en tarjetas de 16 GB añade latencia por paso y exige RAM abundante (64 GB en las pruebas) y almacenamiento rápido.
- No se documentan idiomas soportados ni evaluación multilingüe.
- Fecha de creación y actualización del repositorio: 20 de noviembre de 2026; el ecosistema puede haber evolucionado desde entonces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoidhxd/HyperFlow-H3-Flash-INT8-ComfyUI-Hybrid
- Modelo base FL2VA: https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI
- Modelo base REF2VA: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Text encoder y VAEs: https://huggingface.co/Comfy-Org/MiniMax-H3
- Nodos ComfyUI HyperFlow Flash: https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash
- Nodos ComfyUI HyperFlow INT8: https://github.com/BennyDaBall930/comfyui_hyperflow_int8_nodes
- Nodos ComfyUI Sol-Attn: https://github.com/Saganaki22/ComfyUI-sol-attn
