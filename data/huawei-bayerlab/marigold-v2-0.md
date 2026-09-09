# huawei-bayerlab/marigold-v2-0

## Resumen

Marigold V2 es una familia de modelos desarrollada por HUAWEI Bayer Lab con EPFL y la Universidad de Bolonia, presentada en ACM Transactions on Graphics (SIGGRAPH Asia 2026). Reutiliza un diffusion transformer preentrenado, Qwen/Qwen-Image-Edit-2509, como predictor denso de un solo paso para estimación de profundidad monocular, profundidad a través de vidrio, normales de superficie y albedo. Su propuesta clave es un protocolo de fine-tuning de bajo coste: cada variante se entrena en menos de una semana en una sola GPU de consumo, con resultados que la model card describe como estado del arte.

El modelo se publica como adaptadores LoRA de rango 128 sobre un DiT cuantizado a 4 bits, más un decoder VAE fino afinado en los checkpoints que lo requieren. El modelo base se descarga aparte y no se necesita el codificador de texto en inferencia porque los embeddings de prompt vienen precomputados. El repositorio ocupa 17,3 GB e incluye varios checkpoints con distintas parametrizaciones (log, lineal, disparidad) y variantes "layered" para escenas con vidrio. Las salidas de profundidad son afín-invariantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) basado en Qwen/Qwen-Image-Edit-2509, convertido en predictor denso de un solo paso mediante adaptadores LoRA de rango 128 y, opcionalmente, decoder VAE fino afinado |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión densa; no tiene ventana de contexto de texto estándar) |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits; adaptadores LoRA y decoder VAE en formato safetensors con precisión no documentada |
| Idiomas soportados | Inglés (según la metadata de HuggingFace; el modelo base Qwen puede soportar otros idiomas, pero no está documentado en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores y decoder VAE) y .pt (embeddings precomputados); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

La arquitectura parte de un DiT de edición de imágenes congelado, Qwen-Image-Edit-2509, al que se añaden adaptadores LoRA de rango 128. El entrenamiento se organiza en etapas según el checkpoint: la etapa 1 combina pérdida en espacio latente (MSE), L1, gradiente y iREPA, mientras que la etapa 2 emplea SinkLoss y fine-tunea el decoder VAE. Para normales de superficie se usa angular loss + iREPA + SinkLoss, y para albedo L1 + iREPA. Las variantes "layered" se entrenan sobre la capa 8 del dataset sintético LayeredDepth-Syn, lo que permite predecir geometría detrás de superficies transparentes. No se han publicado datos concretos sobre la composición completa del dataset de entrenamiento ni sobre el número de ejemplos. El protocolo completo dura menos de una semana en una sola GPU de consumo. No se menciona RLHF ni DPO, al ser un modelo de visión densa y no un modelo de lenguaje.

## Capacidades

- Estimación de profundidad monocular afín-invariante en tres parametrizaciones: profundidad logarítmica, lineal y disparidad.
- Estimación de profundidad "see-through": los checkpoints LayeredDepth permiten predecir geometría detrás de vidrio o superficies transparentes.
- Estimación de normales de superficie en el espacio de cámara (camera-space unit normals).
- Estimación de albedo lineal RGB en [0,1].
- Inferencia de un solo paso (single-step): el modelo no itera el proceso de denoising en la fase de predicción, lo que reduce el coste computacional.
- Soporte de resoluciones de imagen 1024×1024 y 2048×2048, con requisitos de VRAM documentados.
- Los autores indican que los modelos habilitan aplicaciones de completado de profundidad métrica, aunque el procedimiento no se detalla en la información disponible.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Restauración y postprocesado fotográfico: el checkpoint de profundidad permite crear mapas de profundidad a partir de imágenes fijas para efectos de bokeh sintéticos, reiluminado o composición de primer plano y fondo. La salida afín-invariante es suficiente para efectos relativos, y los bordes nítidos reproducidos por el modelo facilitan recortes precisos en elementos como pelo o telas.
- Reconstrucción 3D de interiores con vitrinas o mamparas: la variante log-layered se entrena específicamente para predecir geometría detrás del vidrio, por lo que es adecuada para escanear estancias con superficies transparentes, algo que los métodos de profundidad convencionales fallan al interpretar.
- Robótica en almacenes e inspección industrial: la estimación combinada de normales y albedo permite segmentar materiales y superficies metálicas o transparentes antes de planificar un agarre. El modelo opera a 1024² con una GPU de 24 GB, lo que lo hace viable en estaciones de trabajo de laboratorio.
- Generación de activos 3D para videojuegos o arquitectura: combinando profundidad, normales y albedo, un mismo modelo puede reconstruir la geometría y los materiales de una escena a partir de una sola imagen, reduciendo el trabajo manual de modelado.
- Sistemas de ayuda a la conducción en entornos urbanos: la profundidad monocular afín-invariante se puede escalar con señales de odometría o fusión estéreo para obtener mapas métricos. Los checkpoints de disparidad ofrecen una parametrización alterna que puede simplificar la integración con otros sensores.
- Realidad aumentada en entornos industriales: la capacidad de ejecutarse con 24 GB de VRAM y de ajustarse en menos de una semana permite hacer fine-tuning sobre un conjunto pequeño de capturas propias para adaptarlo a un dominio concreto, como interiores de oficina o líneas de producción.
- Investigación en visión por computador: al ser de código abierto y ofrecer un protocolo de bajo coste, sirve como base para estudiar el uso de diffusion transformers en predicción densa de un solo paso con presupuestos computacionales reducidos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona resultados estado del arte en el protocolo Pixel-Perfect Depth para el checkpoint depth/Log-stage2, incluyendo las métricas AbsRel y δ1 sobre NYUv2, KITTI, ETH3D y ScanNet, pero los valores concretos no se incluyen en los datos recibidos.

## Requisitos de hardware

- VRAM estimada: 17 GB para inferencia a resolución 1024×1024; 29 GB para 2048×2048.
- GPU recomendadas: una tarjeta de 24 GB (RTX 3090/4090 o similar) cubre 1024×1024; para 2048×2048 se necesitan 32 GB (A100/H100).
- En GPU de consumo: sí para 1024×1024 con 24 GB; no para 2048×2048 si solo se dispone de 24 GB.
- Fine-tuning: menos de una semana en una sola GPU de consumo; el modelo exacto de GPU no se especifica.
- Despliegue: se proporcionan scripts de inferencia en el repositorio de GitHub (scripts/infer.py) y scripts de descarga de pesos (scripts/download_assets.py). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Marigold V2 (este) | Marigold V1 (prs-eth) |
|---|---|---|
| Base | Qwen-Image-Edit-2509 (DiT) | Difusión (arquitectura no documentada en las fuentes disponibles) |
| Salidas | Profundidad, normales, albedo, variantes layered | Profundidad (inicialmente) |
| Requisitos de GPU | 17–29 GB VRAM según resolución | No documentado en la información disponible |
| Formato | LoRA rank-128 + decoder VAE sobre base 4-bit | No documentado |
| Licencia | Apache-2.0 | No documentada en la información disponible |
| Disponibilidad | HuggingFace, GitHub, demos | GitHub (prs-eth/Marigold) |

No se dispone de datos suficientes para comparar con un tercer modelo de la misma categoría.

## Limitaciones y advertencias

- Las salidas de profundidad son afín-invariantes: la escala y el desplazamiento absolutos no se ajustan por imagen. Para usos métricos se necesita un paso adicional de escalado o fusión con datos métricos.
- El modelo base está cuantizado a 4 bits, lo que reduce memoria pero puede comprometer la precisión en comparación con una ejecución en precisión completa.
- Los checkpoints "layered" se entrenan sobre LayeredDepth-Syn, un conjunto sintético. El rendimiento en escenas reales con vidrio o superficies transparentes puede degradarse.
- No se documentan sesgos del modelo, pero al estar construido sobre Qwen-Image-Edit-2509 hereda cualquier sesgo presente en los datos de entrenamiento de ese modelo base.
- La licencia Apache-2.0 aplica al checkpoint publicado, pero el modelo base Qwen puede tener condiciones adicionales; conviene revisar la licencia de Qwen/Qwen-Image-Edit-2509 antes de un uso comercial.
- Los pesos publicados no incluyen el modelo base completo: el repositorio de 17,3 GB solo contiene los adaptadores y ficheros auxiliares, por lo que la descarga total es mayor y la configuración requiere pasos adicionales.
- No se ofrece un código de despliegue para frameworks como vLLM o llama.cpp, lo que limita la integración directa en entornos de modelos de lenguaje.
- La inferencia a 2048×2048 requiere 32 GB de VRAM, lo que excluye la mayoría de GPUs de consumo para esa resolución.

## Enlaces

- HuggingFace: https://huggingface.co/huawei-bayerlab/marigold-v2-0
- Paper (PDF): https://huggingface.co/huawei-bayerlab/marigold-v2-0/resolve/main/assets/paper/Marigold%20V2.pdf
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/toshas/Marigold-V2
- Demo del proyecto: https://hf.co/spaces/huawei-bayerlab/marigold-v2-web
- Repositorio de código: https://github.com/huawei-bayerlab/marigold-v2
- Repositorio de Marigold original: https://github.com/prs-eth/Marigold
- Organización GitHub HUAWEI Bayer Lab: https://github.com/huawei-bayerlab/
