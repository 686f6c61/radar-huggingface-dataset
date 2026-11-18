# Alissonerdx/Molmo2-8B-Minimax-H3

## Resumen

Molmo2-8B-Minimax-H3 es un paquete comunitario publicado por el usuario Alissonerdx que adapta el modelo multimodal Molmo2-8B de Ai2 (Allen Institute for AI) para dos cometidos distintos: servir como codificador de texto y vision experimental para el modelo de generacion de video MiniMax H3, y ofrecer variantes cuantizadas del modelo MolmoPoint-8B para seguimiento de puntos en video. No es un lanzamiento oficial ni de Ai2 ni de MiniMax, sino un empaquetado de terceros construido sobre los pesos base de `allenai/Molmo2-8B`.

El nucleo del paquete es un fichero de pesos INT8 ConvRot de 9,29 GB (unos 9,65 GB con el proyector incluido) que cuantiza 302 capas lineales elegibles con rotaciones block-Hadamard y activaciones INT8 dinamicas por token, manteniendo embeddings, normalizaciones, sesgos y formas no soportadas en BF16. El repositorio incluye ademas dos variantes separadas de MolmoPoint-8B (INT8 ConvRot y NVFP4 AWQ) para tareas de seguimiento de puntos con identidad de objeto, pensadas para integrarse en flujos de segmentacion de video junto a SAM 3.1.

Su relevancia actual es practica: reduce el peso de un modelo multimodal de 8B a un rango manejable en GPUs de consumo y workstation, y proporciona cargadores personalizados y nodos de ComfyUI para que el modelo pueda ejecutarse dentro de pipelines de generacion de video sin descargar los pesos BF16 originales. La contrapartida es que se trata de un paquete experimental, con validacion limitada a pruebas de humo y con una proyeccion hacia H3 que el propio autor reconoce como incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + lenguaje) con adaptador multimodal; base Molmo2-8B |
| Parametros totales | 8B (modelo base Molmo2-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simetrica per-output-channel con ConvRot block-Hadamard (bloques 256, 64 o 16) y activaciones INT8 dinamicas por token; NVFP4 AWQ (solo en la variante MolmoPoint) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`molmo2_8b_int8_convrot.safetensors`, 9,29 GB decimal; paquete completo ~9,65 GB) |

## Arquitectura y entrenamiento

El modelo base Molmo2-8B es un transformer multimodal que combina un backbone de vision con un modelo de lenguaje y un adaptador multimodal que proyecta representaciones visuales al espacio del lenguaje. Sobre esa base, este paquete no reentrena el modelo: aplica cuantizacion post-entrenamiento a 302 capas lineales elegibles, usando pesos INT8 simetricos por canal de salida con rotaciones block-Hadamard ConvRot (tamano de bloque 256, 64 o 16) y activaciones INT8 dinamicas calculadas por token. Las capas no elegibles (embeddings, normalizaciones, sesgos y formas no soportadas) permanecen en BF16, y el proyector H3 conserva su precision original.

El paquete incluye el codigo original del modelo, tokenizer, processor y un cargador propio (`convrot_runtime.py`) porque `from_pretrained` estandar de Transformers no interpreta estos pesos cuantizados. Para las variantes MolmoPoint, la version INT8 ConvRot cuantiza 144 capas lineales del lenguaje y mantiene el backbone visual y la cabeza de prediccion de puntos en BF16; la version NVFP4 AWQ emplea calibracion activation-aware de ModelOpt sobre prompts de video, con pesos NVFP4 nativos y escalas AWQ pre-cuantizadas. No se dispone de informacion sobre el dataset de entrenamiento ni sobre fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas imagen-texto (pipeline `image-text-to-text`).
- Comprension de imagenes y video mediante el backbone visual de Molmo2.
- Condicionamiento texto/visual para generacion de video a traves de la proyeccion H3 (experimental, orientada a fl2va y t2v).
- Seguimiento de puntos en video con identidad de objeto mediante las variantes MolmoPoint-8B, que generan tokens de punto nativos y metadatos de pointing.
- Integracion con segmentacion por frame: los puntos y mascaras de MolmoPoint alimentan a SAM 3.1 para producir segmentacion densa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de video condicionada por texto en ComfyUI: el nodo "Molmo2 as H3 encoder" descarga el paquete, localiza el proyector en `projections/` y devuelve un objeto `CLIP` que se conecta donde el flujo H3 espera su codificador de texto, permitiendo usar Molmo2 como encoder dentro del proceso de ComfyUI.
- Segmentacion de video asistida por puntos: se conecta `point_model` con `MolmoPoint-8B` como metodo de propagacion, se selecciona un sujeto y se aplica "Apply fix"; MolmoPoint aporta puntos dispersos con identidad y SAM 3.1 los convierte en mascaras por frame.
- Edicion y rotoscopia semiautomatica: en postproduccion, el seguimiento de puntos con ID de objeto permite mantener la identidad de un sujeto a lo largo de un plano y corregir derivas tras cortes de camara seleccionando anclas correctas.
- Despliegue en GPUs de consumo para prototipado multimodal: el fichero INT8 de 9,29 GB reduce el requisito de memoria frente a los pesos BF16, lo que facilita probar Molmo2 en estaciones de trabajo sin descargar el modelo original completo.
- Experimentacion con cuantizacion INT8 ConvRot: el paquete sirve como referencia reproducible para evaluar rotaciones block-Hadamard y activaciones dinamicas por token en un modelo multimodal de 8B.
- Tracking de bajo consumo en Blackwell: la variante NVFP4 AWQ (6,9 GiB) esta pensada para seguimiento de puntos con menor huella de memoria, con cargador que adapta el orden de nibbles de ModelOpt al layout nativo de ComfyUI.
- Investigacion en generacion de video con referencias: la proyeccion H3 puede probarse en modo experimental para t2v y fl2va, aunque el autor advierte que la consistencia de identidad aun no es satisfactoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del paquete cuantizado en la informacion disponible. El autor solo reporta una prueba de humo local: ambas variantes de MolmoPoint cargaron y generaron los mismos cinco puntos de seguimiento con un ID de objeto consistente en un clip de ocho frames de un pinguino; la variante NVFP4 paso inferencia por 144 capas cuantizadas nativas de ComfyUI en una RTX PRO 5000 Blackwell. Respecto a MolmoPoint original, Ai2 reporta +5,7 J&F en Molmo2-Track frente a Molmo 2 (8B) y resultados estado del arte en MeViS, pero son resultados del modelo en precision completa, no de estas variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada: el fichero INT8 ConvRot ocupa 9,29 GB y el paquete completo con proyector unos 9,65 GB; se necesita margen adicional para activaciones, cache y contexto. La variante MolmoPoint INT8 ocupa aproximadamente 9,8 GiB y la NVFP4 AWQ unos 6,9 GiB.
- GPU recomendadas: el autor valida ejecucion en RTX PRO 5000 Blackwell para la variante NVFP4; para INT8 se asume una GPU NVIDIA con soporte CUDA y suficiente VRAM, sin modelo concreto especificado.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas de VRAM para la variante INT8, y con mayor holgura para NVFP4 (6,9 GiB), aunque no se detallan modelos concretos.
- Opciones de despliegue: cargador propio `convrot_runtime.py` con PyTorch, transformers 4.57.1 o superior (probado con 4.57.1, 5.17 y 5.22.1), accelerate, safetensors, pillow, numpy, einops y molmo_utils; integracion en ComfyUI mediante el nodo `alisson-anjos/ComfyUI-Molmo2-H3`. vLLM, llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Molmo2-8B-Minimax-H3 (este paquete) | 8B | no disponible | INT8 ConvRot; NVFP4 AWQ en MolmoPoint | Apache 2.0 | Hugging Face, ComfyUI |
| allenai/Molmo2-8B (base) | 8B | no disponible | BF16 original | Apache 2.0 | Hugging Face |
| allenai/MolmoPoint-8B | 8B | no disponible | BF16 original | no disponible en la informacion | Hugging Face |
| Molmo 2 (8B) | 8B | no disponible | BF16 original | no disponible en la informacion | Referenciado por Ai2 |

La comparativa se limita a la familia Molmo porque la informacion proporcionada no incluye datos de modelos alternativos de otros desarrolladores. Las diferencias clave son el nivel de cuantizacion (INT8 o NVFP4 frente a BF16), el empaquetado con cargador propio y la proyeccion H3 anadida, que no existe en los modelos base.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Ai2 ni de MiniMax; es un empaquetado comunitario sin validacion independiente.
- La proyeccion Molmo2 a H3 es experimental: funciona de forma intermitente en ref2va y el autor reconoce que la identidad y la calidad de video aun no son consistentes; requiere entrenamiento adicional con multiples imagenes de referencia y videos objetivo emparejados.
- Los pesos cuantizados no se cargan con `from_pretrained` estandar de Transformers; es obligatorio usar el cargador incluido, lo que limita la portabilidad a otros frameworks.
- La validacion reportada es una prueba de humo de cinco puntos en un clip de ocho frames, no un benchmark de precision de seguimiento; no hay garantias de calidad frente al modelo BF16.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada, pero al derivar de un modelo multimodal de lenguaje son aplicables los riesgos habituales de generacion no verificada.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- El repositorio ocupa 72,3 GB, muy por encima del peso del fichero principal, por lo que la descarga completa requiere planificacion de almacenamiento; el autor sugiere ignorar los patrones `molmopoint_*/**` cuando solo se necesita el encoder H3.
- La licencia Apache 2.0 del paquete se hereda del modelo base, pero conviene verificar las condiciones de los componentes de terceros (SAM 3.1, ModelOpt) antes de uso comercial.
- El rendimiento en produccion no esta medido: no hay datos de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alissonerdx/Molmo2-8B-Minimax-H3
- Modelo base: https://huggingface.co/allenai/Molmo2-8B
- MolmoPoint-8B original: https://huggingface.co/allenai/MolmoPoint-8B
- Nodos de ComfyUI: https://github.com/alisson-anjos/ComfyUI-Molmo2-H3
- Blog tecnico de Ai2 sobre MolmoPoint: https://allenai.org/blog/molmopoint
