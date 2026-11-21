# jdopensource/JoyAI-Video-Edit

## Resumen

JoyAI-Video-Edit es un sistema de edición de vídeo en tiempo real guiado por instrucciones en lenguaje natural, desarrollado por el equipo jd-opensource (JD.com). A diferencia de los modelos de edición de vídeo convencionales que operan en modo batch sobre secuencias completas, este sistema edita fotogramas de forma causal a medida que llegan, sin necesidad de conocer la longitud total del vídeo ni de revisar fotogramas futuros. Esto lo sitúa en la categoría de edición de vídeo en streaming, un paso hacia la generación interactiva.

Técnicamente combina tres componentes: un codificador de condiciones basado en MLLM, un VAE de vídeo causal y un backbone de difusión multimodal (MMDiT) de 16 000 millones de parámetros. El sistema se entrena y despliega como un editor de difusión autorregresivo y se acelera mediante destilación por coincidencia de distribuciones autorregresivas alineadas, optimización de horizonte largo e inferencia con estado KV acotado. En su benchmark de despliegue alcanza 30 FPS de extremo a extremo a 720 × 1248.

La relevancia actual radica en que traslada la edición de vídeo del procesamiento offline por lotes a la generación interactiva en directo, con soporte para GPU de consumo (RTX 5090 a 840 × 480 y 24 FPS) y una demo pública en Hugging Face Spaces. La versión 1.1 (noviembre de 2026) mejora el reemplazo de personajes guiado por imagen de referencia preservando el movimiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva con backbone MMDiT multimodal, codificador de condiciones MLLM y VAE de vídeo causal |
| Parametros totales | 16 000 millones (backbone DiT); total del sistema no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (streaming causal sin longitud predefinida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (DiT) y safetensors (VAE) |
| Pipeline | video-to-video |
| Resoluciones soportadas | 720 × 1248 (hasta 30 FPS); 840 × 480 (24 FPS en RTX 5090 y RTX PRO 6000); 720p a 16 FPS en RTX PRO 6000 |
| Tamano del repositorio | 131,6 GB |

## Arquitectura y entrenamiento

El sistema es un editor de difusión autorregresivo compuesto por un codificador de condiciones basado en MLLM que interpreta la instrucción en lenguaje natural y la imagen o vídeo de referencia, un VAE de vídeo causal que comprime los fotogramas entrantes y un transformer de difusión multimodal (MMDiT) de 16 000 millones de parámetros que genera los fotogramas editados de forma causal. Al ser causal, cada fragmento se procesa sin acceso a fotogramas futuros, lo que permite editar streams en vivo con latencia acotada y cómputo estable por fragmento.

El entrenamiento se apoya en varias técnicas de aceleración y estabilización: destilación por coincidencia de distribuciones autorregresivas alineadas (para reducir el número de pasos de muestreo), optimización de horizonte largo (para mitigar la deriva temporal acumulada en secuencias largas), inferencia con estado KV acotado (para mantener memoria y cómputo constantes) y planificación orientada al despliegue para sostener alto throughput a 720p. El modelo card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; sí se publican scripts de entrenamiento de ejemplo y el benchmark LongV2VBench para evaluación de edición vídeo-a-vídeo de formato largo.

## Capacidades

- Edición de vídeo guiada por instrucciones en lenguaje natural: cambios de sujeto, ediciones locales, modificación de fondo, transferencia de estilo y cambios de movimiento.
- Edición de vídeo en streaming en tiempo real: procesa fotogramas a medida que llegan, sin esperar la secuencia completa.
- Edición abierta (open-ended): no requiere una longitud de vídeo predefinida ni revisión de fotogramas futuros.
- Edición guiada por imagen de referencia (RV2V): reemplazo de personajes preservando identidad y movimiento original (mejorado en la versión 1.1).
- Entrada multimodal: stream de cámara en vivo o vídeo subido, más instrucción textual.
- Soporte bilingüe de instrucciones: inglés y chino.
- Despliegue interactivo con latencia compatible con aplicaciones en directo (hasta 30 FPS a 720 × 1248 en el benchmark del autor).

## Casos de uso

- Retoque de vídeo en directo para creadores de contenido: el modelo edita el stream de cámara a 24-30 FPS mientras se graba, permitiendo cambiar fondo, estilo o apariencia sin postproducción por lotes.
- Reemplazo de personajes en producciones virtuales: con la versión 1.1 y su condicionamiento por imagen de referencia, se puede sustituir a un actor por otro manteniendo el movimiento original, útil en prototipado de escenas y doblaje visual.
- Filtros y efectos interactivos en aplicaciones de videollamada o streaming: la naturaleza causal y el cómputo estable por fragmento permiten integrar el modelo en pipelines de tiempo real con latencia acotada.
- Previsualización rápida en estudios de postproducción: editar un clip subido con instrucciones de texto para validar ideas de estilo o composición antes de un render final de alta calidad.
- Anonimización o modificación de escenarios en vídeo de vigilancia o documentación: cambiar rostros o fondos en streams en vivo preservando la estructura temporal del metraje.
- Investigación en generación de vídeo interactiva: el modelo, los scripts de entrenamiento y LongV2VBench sirven como base para experimentar con difusión autorregresiva y evaluación de edición de formato largo.
- Demos y productos educativos: la demo pública en Hugging Face Spaces permite probar edición en streaming sin infraestructura propia.

## Benchmarks y rendimiento

Los datos publicados en la información disponible son métricas de despliegue (throughput y resolución), no resultados de benchmarks académicos como MMLU o HumanEval, que no aplican a este tipo de modelo.

| Escenario | Hardware | Resolución | Rendimiento |
|---|---|---|---|
| Benchmark de despliegue del autor | no especificado | 720 × 1248 | 30 FPS de extremo a extremo |
| Demo en vivo | RTX PRO 6000 (Blackwell) | 840 × 480 | 24 FPS |
| Demo en vivo | RTX PRO 6000 (Blackwell) | 720p | 16 FPS |
| GPU de consumo | GeForce RTX 5090 (32 GB) | 840 × 480 | 24 FPS |

No se han publicado resultados de benchmarks de calidad de edición (por ejemplo, métricas en LongV2VBench) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 131,6 GB y el backbone DiT tiene 16 000 millones de parámetros, por lo que la inferencia en precisión completa requiere GPUs de centro de datos.
- GPU de consumo: funciona en una GeForce RTX 5090 de 32 GB a 840 × 480 y 24 FPS (soporte añadido el 2026-08-24).
- GPU profesionales: RTX PRO 6000 (Blackwell) para 840 × 480 a 24 FPS o 720p a 16 FPS; 720 × 1248 a 30 FPS en el benchmark de despliegue del autor (hardware exacto no especificado).
- Opciones de despliegue: el proyecto proporciona código de despliegue propio y una guía de despliegue (DEPLOYMENT.md); no se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 30 FPS a 720 × 1248 (benchmark del autor), 24 FPS a 840 × 480 en RTX 5090 y RTX PRO 6000, 16 FPS a 720p en RTX PRO 6000.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de edición de vídeo en streaming con los que establecer una comparativa de parámetros, contexto, rendimiento y licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoyAI-Video-Edit | 16 000 M (DiT) | streaming causal sin longitud predefinida | 30 FPS a 720 × 1248 | Apache 2.0 | Hugging Face, GitHub, demo |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo card no documenta sesgos conocidos; al ser un sistema de edición visual, puede heredar sesgos de los datos de entrenamiento en la representación de personas, estilos y escenarios.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede introducir artefactos, alteraciones no solicitadas o inconsistencias temporales, especialmente en streams muy largos pese a la optimización de horizonte largo.
- Deriva temporal acumulada: aunque se mitiga con optimización de horizonte largo, la edición causal de secuencias extensas puede degradar la consistencia respecto a los primeros fotogramas.
- Idiomas: solo se declaran inglés y chino para las instrucciones; el rendimiento en otros idiomas no está documentado.
- Requisitos de hardware elevados: el repositorio de 131,6 GB y el backbone de 16 000 millones de parámetros limitan el despliegue a GPUs de 32 GB o superiores; no se documentan cuantizaciones para reducir requisitos.
- Formato de pesos principal en .pth (DiT), no safetensors, lo que requiere precauciones adicionales al cargar pesos de terceros.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del código de despliegue y del VAE antes de integrarlo en producción.
- El modelo card no detalla el dataset de entrenamiento ni el volumen de tokens, lo que dificulta evaluar la cobertura y las limitaciones de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdopensource/JoyAI-Video-Edit
- Repositorio GitHub: https://github.com/jd-opensource/JoyAI-Video-Edit
- Informe técnico (arXiv): https://arxiv.org/abs/2608.03974
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/wxDai/joyai-video-edit
- Guía de despliegue: https://github.com/jd-opensource/JoyAI-Video-Edit/blob/main/DEPLOYMENT.md
- Scripts de entrenamiento: https://github.com/jd-opensource/JoyAI-Video-Edit/blob/main/training/README.md
- Benchmark LongV2VBench: https://huggingface.co/datasets/EasonXiao-888/LongV2VBench
- Pesos DiT 1.1: https://huggingface.co/jdopensource/JoyAI-Video-Edit/blob/main/dit/joyai_video_edit_dit_1101_face%2B%2B.pth
- Pesos DiT 0811: https://huggingface.co/jdopensource/JoyAI-Video-Edit/blob/main/dit/joyai_video_edit_dit_0811.pth
- Licencia: https://github.com/jd-opensource/JoyAI-Video-Edit/blob/main/LICENSE
