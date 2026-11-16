# ApacheOne/SD15_MACaQ_pruned_fullwidth

## Resumen

SD15_MACaQ_pruned_fullwidth es una cuantización MXFP4 (W4A4) del U-Net del modelo de difusión Stable Yogi SD 1.5 V9 LCM, publicada por el usuario ApacheOne en Hugging Face. El objetivo del modelo es reducir de forma drástica el espacio de almacenamiento de los pesos del U-Net manteniendo las dimensiones originales de todas las capas: se pasa de 1.719,04 MB en FP16 a 466,96 MB empaquetados, lo que supone una reducción del 72,84 % del payload de pesos del U-Net. El resto de componentes (encoder de texto CLIP y VAE) se mantienen en FP16.

El modelo hereda la base de Stable Diffusion 1.5 afinada por Stable Yogi (versión V9 con destilación LCM), por lo que es un modelo de texto a imagen de 512×512 pensado para generación rápida con pocos pasos de inferencia. La aportación técnica de esta ficha no es la calidad artística del modelo base, sino el método de cuantización: una calibración a ancho completo del Hessiano por capa, que abarca todos los canales de entrada de cada lineal y convolución (incluidos los canales de parche aplanados de las convoluciones), con rotación Hadamard por bloques y refinamiento de los códigos FP4 adyacentes.

Es relevante ahora porque demuestra que es viable comprimir un U-Net de SD 1.5 a 4 bits por peso y activación con un coste medible de fidelidad visual (LPIPS medio de 0,4292 frente a FP16 en seis pares prompt-semilla), lo que abre la puerta a desplegar generación de imágenes en hardware con memoria muy limitada. El repositorio ocupa 0,9 GB e incluye los pesos en formato safetensors para la librería diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusión (Stable Diffusion 1.5) con encoder de texto CLIP y VAE; destilación LCM |
| Parametros totales | no disponible (el autor solo publica tamaños de payload por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; no disponible la longitud máxima de prompt) |
| Tipos de cuantizacion | MXFP4 W4A4 en el U-Net (pesos y activaciones a 4 bits con escalas por bloque); CLIP y VAE en FP16 |
| Idiomas soportados | no disponible (los prompts se procesan con el encoder CLIP de SD 1.5, predominantemente inglés) |
| Licencia | stable-yogi-source-terms (etiquetada como "other"; enlace a los términos en Civitai) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un U-Net con bloques residuales y atención, un encoder de texto CLIP y un VAE, sobre el que se ha aplicado una destilación LCM (Latent Consistency Model) en la variante Stable Yogi V9. Esta ficha no reentrena el modelo generativo; lo que hace es recuantizar el U-Net original en FP16 mediante un procedimiento de ajuste post-entrenamiento. El U-Net cuantizado conserva todas las capas y sus dimensiones originales: 184 capas lineales y 98 convoluciones, con la capa más ancha recibiendo 23.040 entradas.

El método de calibración, denominado "full-width", muestrea activaciones de 32 prompts con hasta 128 filas por llamada de forward y construye un Hessiano por capa que abarca todo el ancho de entrada, incluidos los canales de parche aplanados de las convoluciones, con relleno de alineación a múltiplos de 32. Sobre ese Hessiano se equilibran los canales de entrada, se aplica una rotación Hadamard por bloques, se criban los exponentes de bloque y se refinan los códigos FP4 de pesos adyacentes con el Hessiano completo a exponentes fijos, con criterio de parada local por fila. La versión anterior usaba bloques de Hessiano de convolución de 256 de ancho; esta release amplía el Hessiano al ancho completo. El informe de ejecución con recuentos de muestras, anchos, volteos y objetivos por capa está incluido en el repositorio.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a 512×512 píxeles.
- Generación rápida con LCM: el autor documenta renderizado con 4 pasos y CFG 1.2.
- Cuantización W4A4 del U-Net con pesos y activaciones a 4 bits, manteniendo CLIP y VAE en FP16 para preservar la codificación de texto y la decodificación latente.
- Conservación de todas las capas del U-Net original (no hay poda real de capas pese al nombre "pruned" del repositorio; el ahorro proviene de la cuantización de pesos).
- Compatibilidad con el ecosistema diffusers y con el pipeline text-to-image estándar de SD 1.5.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento: es exclusivamente un modelo generativo de imagen.
- Capacidades multilingües: no disponibles de forma declarada; el encoder CLIP de SD 1.5 está orientado a inglés.

## Casos de uso

- Generación de imágenes en hardware con memoria limitada: el U-Net cuantizado ocupa 466,96 MB frente a 1.719,04 MB en FP16, lo que permite cargar el pipeline completo (880,62 MB de pesos) en GPUs de gama de entrada o en entornos con VRAM ajustada.
- Prototipado rápido de aplicaciones de texto a imagen: con 4 pasos LCM y CFG 1.2, el modelo está pensado para iteraciones de baja latencia en demos y pruebas de concepto donde la fidelidad absoluta frente a FP16 no es crítica.
- Despliegue en servidores con múltiples instancias: al reducir el payload del U-Net un 72,84 %, se pueden alojar más copias del modelo por nodo o reducir el coste de almacenamiento y de transferencia de pesos en el arranque en frío.
- Investigación en cuantización de modelos de difusión: el repositorio incluye el inventario de capas en JSON y el informe de calibración, útiles para reproducir o comparar métodos de cuantización W4A4 sobre U-Nets de SD 1.5.
- Generación de imágenes de referencia para flujos de trabajo creativos internos: retratos, escenas cotidianas y bodegones, tal y como ilustran los seis pares prompt-semilla publicados, siempre que se acepte la variación de detalles frente a FP16.
- Evaluación comparativa de fidelidad: los pares de imágenes y las métricas LPIPS publicadas permiten medir el impacto de la cuantización en pipelines de control de calidad de modelos comprimidos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); estos no aplican a un modelo de texto a imagen. La única métrica de fidelidad publicada es la distancia LPIPS frente al U-Net en FP16 en seis pares prompt-semilla renderizados a 512×512 con LCM, 4 pasos y CFG 1.2, usando el mismo CLIP y VAE:

| Semilla | Prompt (resumen) | LPIPS frente a FP16 |
|---|---|---|
| 7001 | Hombre adulto con periódico en una estación de tren | 0,3830 |
| 7002 | Mujer adulta con abrigo azul largo al atardecer | 0,3491 |
| 7003 | Tetera de cerámica, dos tazas y servilleta de lino | 0,3947 |
| 7004 | Coche vintage rojo en una curva de carretera desértica | 0,4756 |
| 7005 | Retrato de arquitecto con gafas rectangulares negras | 0,4408 |
| 7006 | Tres manzanas verdes y una pera amarilla sobre tabla de madera | 0,5322 |
| Media | — | 0,4292 |

El autor advierte que la release anterior reportó SSIM, por lo que este resultado LPIPS no permite ordenar ambas releases. También señala cambios de detalle visibles, como las gafas en la escena de la estación o el ángulo de visión del coche.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos totales suman 880,62 MB (U-Net 466,96 MB, CLIP 246,12 MB, VAE 167,31 MB), a lo que hay que añadir las activaciones y los latentes en tiempo de ejecución.
- GPU recomendadas: el autor menciona la L4 para la emulación de MXFP4 W4A4 con redondeo FP4 y multiplicación de matrices en BF16; no se detallan otras GPU validadas.
- GPU de consumo: no confirmado por el autor; el tamaño de pesos sugiere que el pipeline podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos publicados de pruebas en RTX 4090 u otras.
- Opciones de despliegue: librería diffusers con el pipeline text-to-image; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: no disponibles; el modelo está diseñado para inferencia con LCM a 4 pasos, lo que reduce el número de evaluaciones del U-Net frente a la generación estándar de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SD15_MACaQ_pruned_fullwidth | U-Net SD 1.5 cuantizado MXFP4 W4A4 | no disponible (payload U-Net 466,96 MB) | no aplica | LPIPS medio 0,4292 frente a FP16 en 6 pares | stable-yogi-source-terms | Hugging Face, 0 descargas |
| Stable Yogi SD 1.5 V9 LCM (FP16) | U-Net SD 1.5 con LCM | no disponible (payload U-Net 1.719,04 MB) | no aplica | referencia de fidelidad (FP16) | términos de Stable Yogi | Civitai |
| Stable Diffusion 1.5 original | U-Net SD 1.5 | no disponible | no aplica | no disponible | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de benchmarks comparables con otras cuantizaciones de SD 1.5 en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: LPIPS medio de 0,4292 frente a FP16, con cambios visibles en detalles finos como gafas, ángulos de cámara y recuento de objetos (el caso de las tres manzanas y la pera obtiene el peor LPIPS, 0,5322).
- La cuantización W4A4 afecta tanto a pesos como a activaciones; el rendimiento puede degradarse en prompts fuera de la distribución de calibración (32 prompts muestreados).
- No hay datos publicados sobre sesgos; al derivar de SD 1.5 y de un afinado de Stable Yogi, es esperable heredar los sesgos del dataset de entrenamiento original, pero no están documentados en esta ficha.
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes con el prompt, especialmente en composiciones con recuentos exactos de objetos.
- Idiomas: no se declaran idiomas soportados; el encoder CLIP de SD 1.5 rinde peor en prompts que no sean en inglés.
- Licencia restrictiva: la licencia "stable-yogi-source-terms" remite a los términos publicados en Civitai y no es una licencia de código abierto estándar; es imprescindible revisarla antes de cualquier uso comercial.
- El nombre del repositorio incluye "pruned", pero el autor aclara que no se eliminan capas: todas las capas del U-Net permanecen y el ahorro proviene únicamente de la cuantización de pesos.
- Sin descargas ni likes en el momento de la consulta, y creado en 2026-11-16: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApacheOne/SD15_MACaQ_pruned_fullwidth
- Términos de licencia (Stable Yogi en Civitai): https://civitai.com/models/166609/realism-by-stable-yogi-pony?modelVersionId=1235013
- Informe de ejecución de calibración (incluido en el repo): fullwidth_from_fp16.json
- Inventario de capas del U-Net (incluido en el repo): sd15_macaq_unet_layers.json
- Comparaciones de imágenes FP16 frente a MXFP4 (incluidas en el repo): comparisons/pair_01.png a comparisons/pair_06.png
