# AuroraAI-Research/AuroraIMG-6M

## Resumen

AuroraIMG-6M es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por AuroraAI-Research. Su rasgo distintivo es el tamaño: 6,82 millones de parámetros en total, una cifra que incluye el codificador de texto, el denoiser y el VAE. Genera imágenes RGB de 64×64 píxeles a partir de descripciones breves en inglés y todos sus componentes se entrenaron desde cero sobre CC12M, sin reutilizar ningún codificador de texto ni VAE preentrenado.

El modelo emplea flow matching latente (rectified flow) con classifier-free guidance, sobre un latente de 8×16×16. El codificador de texto es un transformer pre-LN de 4 capas (anchura 128, 4 cabezas, RoPE) con tokenizador BPE de 4096 tokens que acepta hasta 64 tokens; el denoiser es una U-Net compacta con condicionamiento AdaLN-Zero y el VAE es una red convolucional residual con GroupNorm. El entrenamiento usa Muon para matrices de pesos y kernels de convolución, y AdamW para el resto.

Su relevancia es fundamentalmente como banco de pruebas de investigación: demuestra que un pipeline completo de difusión latente puede entrenarse de cero con menos de 7M de parámetros y ejecutarse en CPU. No compite con modelos de generación de imágenes de gran escala; su utilidad está en experimentación reproducible, docencia y ablaciones a bajo coste computacional, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching latente (rectified flow) sobre difusión latente; U-Net compacta con bloques residuales AdaLN-Zero, auto-atención, cross-attention y feed-forward; VAE convolucional con bloques residuales y GroupNorm; codificador de texto transformer pre-LN de 4 capas con RoPE |
| Parametros totales | 6,82 M (codificador de texto 1,32 M / denoiser 4,42 M / VAE 1,08 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens de caption en ingles; tokenizador BPE a nivel de byte con vocabulario de 4096 tokens |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones; se usa bf16 en GPU y fp32 en CPU) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, integrado en diffusers mediante custom pipeline; libreria declarada: pytorch |
| Resolucion de salida | 64×64 RGB |
| Latente | 8 × 16 × 16 |
| Sampler | Euler, 50 pasos, CFG 6,0 |
| Dataset de entrenamiento | pixparse/cc12m-wds, 9.882.283 pares de entrenamiento mas 50k de holdout |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El sistema se divide en tres piezas entrenadas de forma secuencial. El VAE (1,08 M) comprime una imagen de 64×64×3 en un latente de 8 canales y 16×16. Se entrenó con pérdida L1, una pérdida de nitidez basada en gradientes, una pérdida de matriz de Gram y un termino KL muy pequeno (5e-5), sin pérdidas adversarias ni LPIPS; en imágenes de holdout reconstruye a 31,9 dB PSNR. El codificador de texto (1,32 M) es un transformer pre-LN de 4 capas, anchura 128, 4 cabezas y embeddings posicionales rotatorios, montado sobre un tokenizador BPE de nivel de byte entrenado con los captions de CC12M; se entrena de forma conjunta con el denoiser, de modo que aprende la representación que resulta util al modelo de imagen. El denoiser (4,42 M) es una U-Net compacta que opera sobre el latente a 16×16, 8×8 y 4×4, con condicionamiento AdaLN-Zero (escala, desplazamiento y puerta derivados del embedding de tiempo, inicializados a cero para que cada bloque arranque como identidad), embeddings de tiempo basados en random Fourier features con un embedding de texto promediado anadido, y en cada nivel un bloque de atención con auto-atención, cross-attention sobre los tokens de texto y una capa feed-forward.

El entrenamiento consta de dos etapas. La etapa 1 (VAE) duró 25k pasos con batch de 2048 y AdamW (lr 5e-4, decaimiento coseno), con pérdida final de 0,0880 (L1 0,0343; KL 5,91). La etapa 2 (flow matching) duró 300k pasos con batch de 2048, aproximadamente 614M muestras o unas 62 épocas; el modelo predice velocidad (ε − z) con pérdida MSE y los timesteps provienen de una distribución logit-normal mezclada con un 15% de uniforme. Los latentes en caché se re-ruidan con la propia varianza posterior del VAE durante el entrenamiento. Las matrices de pesos y los kernels de convolución se optimizan con Muon (lr 0,02) y el resto de parámetros (embeddings, capas de entrada y salida, normalizaciones, sesgos, proyecciones de tiempo y de pooling) con AdamW (lr 5e-4). Se aplican 10k pasos de warmup, decaimiento coseno hasta el 1%, recorte de gradiente a 1,0, EMA 0,9998, un 10% de caption dropout para CFG, autocast en bf16 y torch.compile. La pérdida final de entrenamiento fue 0,6208 y todas las muestras y métricas publicadas usan los pesos EMA.

En cuanto a los datos, se hizo streaming y filtrado de todo CC12M: los captions se pasaron a minúsculas y se limpiaron de HTML y URLs, descartando los genéricos ("image", "stock photo", etc.) y los de menos de 3 palabras; se descartaron imágenes no RGB o con lado corto inferior a 128 px. El resto se redimensionó a 64 px en el lado corto (bicúbica), se recortó al centro y se deduplicó por hash de píxeles, quedando 9.882.283 pares de entrenamiento mas un holdout de 50k. La unica aumentación son volteos horizontales aleatorios.

## Capacidades

- Generación de imágenes a partir de texto: produce imágenes RGB de 64×64 a partir de captions cortos en inglés (hasta 64 tokens).
- Composición de escenas simples: la model card muestra ejemplos con sujetos, atributos y relaciones basicas ("a red car on a street", "a dog running on green grass", "a vase of flowers on a wooden table").
- Control de adherencia al prompt mediante classifier-free guidance: el autor publica un barrido de CFG (1, 2, 3 y 5) y fija CFG 6,0 como mejor valor en su barrido.
- Reconstrucción de imágenes: el VAE puede usarse por separado para comprimir y reconstruir imágenes de 64×64 (31,9 dB PSNR en holdout).
- Entrenamiento desde cero reproducible: no depende de pesos preentrenados de terceros ni de codificadores de texto comerciales.
- Inferencia en CPU: el modelo esta disenado para poder ejecutarse sin GPU.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni un agente.
- No soporta razonamiento multi-paso ni uso como agente: es un generador de imágenes de un solo paso de inferencia (con 50 pasos de muestreo).
- No tiene modo "thinking", ni visión de entrada, ni audio.
- Multilingue: no, la model card declara unicamente inglés.

## Casos de uso

- Docencia e investigación sobre difusión latente: permite reproducir un pipeline completo (VAE + codificador de texto + denoiser) en un solo portatil, sin GPU, para explicar flow matching, condicionamiento AdaLN-Zero y classifier-free guidance con un coste computacional minimo.
- Ablaciones controladas de entrenamiento: dado su tamano, es viable entrenar variantes completas (por ejemplo, cambiar la distribución de timesteps o el optimizador) en tiempos manejables y comparar métricas sobre el holdout de 50k.
- Pruebas de infraestructura y CI: sirve como modelo de humo para validar pipelines de despliegue con diffusers, servidores de inferencia y pruebas de carga, ya que los pesos ocupan una fraccion minima de VRAM y el repositorio pesa 0,1 GB.
- Generacion de prototipos visuales de baja resolucion: utiles como miniaturas, placeholders o bocetos rapidos de composicion antes de encargar una generacion a mayor resolucion con otro modelo.
- Investigacion sobre destilacion y reduccion de pasos: al ser tan pequeno, es un candidato natural para experimentar con reduccion del numero de pasos de muestreo (frente a los 50 pasos Euler por defecto) y medir el impacto en FID y CLIP.
- Estudio de compresion de latentes: el VAE puede aislarse para analizar el equilibrio entre tasa (termino KL de 5e-5) y distorsion (L1, nitidez, Gram) en un latente de 8×16×16.
- Evaluacion de metricas: sirve como sujeto de prueba para calibrar herramientas de evaluacion (GenEval, GenEval 2 / Soft-TIFA, FID con torchmetrics, CLIP con openai/clip-vit-base-patch32) y entender como se comportan con imagenes de 64×64.
- Generacion de datasets sinteticos a pequena escala: producción de pares imagen-caption de 64×64 para experimentos de aumentación o preentrenamiento de clasificadores muy ligeros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Ninguno esta verificado (`verified: false`).

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| GenEval | GenEval overall (media de tareas) | 0,1387 | No |
| GenEval 2 | Soft-TIFA GM (nivel de prompt, oficial) | 2,21 | No |
| GenEval 2 | Soft-TIFA AM (nivel de atomo) | 21,84 | No |
| Holdout CC12M (10k imagenes) | FID (torchmetrics, features Inception 2048-d) | 33 | No |
| Holdout CC12M (10k imagenes) | CLIP score (openai/clip-vit-base-patch32) | 24,8 | No |
| Reconstruccion del VAE (holdout) | PSNR | 31,9 dB | No |

Nota del autor: todas las metricas se miden a la resolucion nativa de 64×64, y tanto FID como CLIP reescalan las imágenes internamente, por lo que deben interpretarse como valores de seguimiento de este modelo y no como comparacion directa con modelos de 256 px o mas. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni equivalentes (no aplican a un modelo text-to-image).

## Requisitos de hardware

- VRAM para inferencia: estimacion a partir del numero de parametros: aproximadamente 14 MB en bf16 y 27 MB en fp32 solo para los pesos. El pico real dependera del runtime y de los tensores intermedios, pero es previsible que quede por debajo de 1 GB; no hay mediciones publicadas de pico de memoria (no disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo. El caso de uso natural es CPU o GPU integrada.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, incluidos modelos con 2 GB o 4 GB de VRAM, e incluso en CPU sin GPU dedicada (el autor indica explicitamente que es lo bastante pequeno para ejecutarse en CPU).
- Opciones de despliegue: `DiffusionPipeline.from_pretrained` de diffusers con `custom_pipeline` apuntando al repositorio y `trust_remote_code=True`; es la unica ruta documentada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que ademas no estan orientados a pipelines de difusion de este tipo.
- Precision: bf16 en GPU y fp32 en CPU, segun el ejemplo de la model card.
- Latencia y throughput: no disponible; la model card no publica tiempos de inferencia ni imagenes por segundo, ni para GPU ni para CPU. La configuracion por defecto son 50 pasos de Euler con CFG 6,0, lo que implica dos pasadas del denoiser por paso.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con datos verificables. AuroraIMG-6M es un modelo de investigacion entrenado integramente desde cero a una escala (6,82 M de parametros, 64×64) para la que no existen referencias publicas equivalentes con benchmarks comparables en la documentacion facilitada.

| Modelo | Parametros | Resolucion | Contexto de texto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| AuroraIMG-6M | 6,82 M (total, incluye VAE y text encoder) | 64×64 | 64 tokens | Apache 2.0 | GenEval 0,1387; Soft-TIFA GM 2,21; FID 33; CLIP 24,8 (no verificados) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Advertencia: comparar estas cifras con las de modelos de difusion de escala mucho mayor (cientos de millones o miles de millones de parametros, y resoluciones de 512 px o superiores) no es metodologicamente valido, porque FID y CLIP dependen fuertemente de la resolucion y del conjunto de evaluacion. La propia model card senala esta cautela.

## Limitaciones y advertencias

- Resolucion muy baja: 64×64 píxeles. No es adecuado para producción grafica ni para impresion; el nivel de detalle esta severamente limitado.
- Escala minima: con 6,82 M de parametros y entrenamiento exclusivamente sobre CC12M a 64 px, la fidelidad al prompt es baja. El propio GenEval overall de 0,1387 refleja un rendimiento muy limitado en composicion y atributos.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir objetos inexistentes, deformes o mal ubicados respecto al prompt, especialmente con captions que impliquen multiples objetos, conteo o relaciones espaciales complejas.
- Solo ingles: la model card declara unicamente el idioma `en`; las entradas en otros idiomas no estan soportadas y degradaran el resultado.
- Sesgos del dataset: CC12M es un conjunto web a gran escala con sesgos conocidos de representacion (geograficos, demograficos, culturales) y con contenido potencialmente inapropiado; el modelo no documenta filtrado de seguridad, moderation ni evaluación de sesgos.
- Sin mecanismos de seguridad documentados: no se describe ningún filtro de contenido, clasificador de seguridad ni bloqueo de prompts.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe, y sin garantias por parte del autor.
- Ejecucion de codigo remoto: el uso documentado requiere `trust_remote_code=True` con un `custom_pipeline`, lo que implica ejecutar codigo Python proporcionado por el repositorio; conviene auditar ese codigo antes de desplegarlo en entornos productivos.
- Ausencia de cuantizaciones publicadas: no hay GGUF, GPTQ, AWQ ni versiones cuantizadas documentadas, lo que limita el despliegue en runtimes que dependen de esos formatos.
- Rendimiento no verificado: todos los valores de benchmark del model-index tienen `verified: false`; no hay reproduccion independiente conocida.
- Metricas poco comparables: el propio autor advierte que FID y CLIP se calculan con herramientas que reescalan internamente las imágenes, por lo que sus cifras no deben alinearse con las de modelos de 256 px o mas.
- Madurez del proyecto: el repositorio tiene 0 descargas y la model card no documenta mantenimiento, versionado ni changelog. No hay paper ni informe tecnico asociado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraAI-Research/AuroraIMG-6M
- Dataset de entrenamiento: https://huggingface.co/datasets/pixparse/cc12m-wds
- Codificador de texto CLIP usado para la metrica CLIP: https://huggingface.co/openai/clip-vit-base-patch32

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los resultados obtenidos correspondian a definiciones de diccionario sin relacion con el proyecto). No se han encontrado paper, blog tecnico, repositorio de codigo independiente ni demo publica asociados a AuroraAI-Research/AuroraIMG-6M.
