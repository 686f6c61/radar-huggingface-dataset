# nvidia/ArtiFixer

## Resumen

ArtiFixer es un modelo generativo de NVIDIA (Spatial Intelligence Lab) orientado a la mejora y extension de reconstrucciones 3D. A diferencia de un modelo de lenguaje, es un modelo de difusion autorregresivo causal de pocos pasos que toma como entrada mapas RGB y de opacidad renderizados desde una representacion 3D imperfecta, mapas de rayos de camara y un prompt de texto, y devuelve fotogramas RGB 2D refinados. El problema que resuelve es el de las reconstrucciones 3D incompletas o de baja calidad: el modelo corrige artefactos, rellena regiones ausentes y extiende la escena mas alla de lo observado.

Se distribuye en tres variantes con arquitecturas transformer derivadas de modelos base existentes: Wan2.1 14B (aproximadamente 16,9 mil millones de parametros entrenables), Wan2.1 1.3B (aproximadamente 1,68 mil millones) y Cosmos3-Nano (aproximadamente 15,8 mil millones). Ademas de los checkpoints destilados de etapa 3 (S3), el repositorio incluye los profesores bidireccionales de etapa 1 (S1) de cada variante, pensados para investigacion sobre destilacion, muestreo y comportamiento de rollouts largos.

La relevancia actual reside en su enfoque: combina entrenamiento bidireccional, diffusion forcing y destilacion DMD estilo Self-Forcing para convertir un modelo de difusion de muestreo multipaso en un modelo causal autorregresivo de pocos pasos, lo que permite inferencia en tiempo casi real (hasta 34,38 FPS con la variante 1.3B a 4 pasos en una sola GPU). El modelo se publica exclusivamente para investigacion y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ArtiFixerTransformer sobre WanTransformer3DModel; ArtiFixerCosmos3Transformer sobre Cosmos3OmniTransformer) |
| Parametros totales | 14B: ~16,9B entrenables (16.910.955.584); 1.3B: ~1,68B (1.678.749.760); Cosmos3-Nano: ~15,8B (15.802.891.556) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (acepta prompt de texto; idiomas no especificados) |
| Licencia | NVIDIA OneWay Noncommercial License (modelo); bases Wan2.1 bajo Apache 2.0 y Cosmos3-Nano bajo Open MDW 1.1 |
| Formato de pesos | checkpoints PyTorch (`.pt`): artifixer-14b.pt, artifixer-1.3b.pt, artifixer-cosmos3-nano.pt, y profesores artifixer-s1-*.pt |

## Arquitectura y entrenamiento

ArtiFixer se construye sobre transformers de difusion 3D existentes: la variante 14B y la 1.3B derivan de Wan-AI/Wan2.1-T2V-14B-Diffusers y Wan-AI/Wan2.1-T2V-1.3B-Diffusers, mientras que la variante Cosmos3-Nano se basa en nvidia/Cosmos3-Nano (revision 23314034b82f46b45339035dba67c3ee9bbcb8ba), con prompts en forma de token-ID, condicionamiento de camara SCoPE y atencion auto-compartida entre imagenes de referencia y objetivo. Los checkpoints exportados contienen unicamente los pesos del transformer para reconstruccion de secuencias de imagen; el VAE, el tokenizer y la configuracion se cargan por separado desde la revision fijada del modelo base.

El entrenamiento se organiza en etapas: una etapa 1 bidireccional (los profesores S1, con atencion completamente bidireccional y muestreo de difusion multipaso estandar), una etapa de diffusion forcing y una etapa final de destilacion DMD estilo Self-Forcing que produce los modelos causales autorregresivos de pocos pasos (S3). El modelo consume mapas RGB y de opacidad renderizados, mapas de rayos de camara y un prompt de texto, y requiere intrinsicos y poses de camara. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, ni si se emplearon RLHF o DPO (tecnicas propias de modelos de lenguaje, no aplicables directamente aqui).

## Capacidades

- Mejora de renderizados 3D: corrige artefactos y rellena regiones de baja calidad o ausentes en reconstrucciones 3D imperfectas.
- Extension de escenas: genera vistas mas alla de la cobertura observada de la reconstruccion original.
- Generacion de imagen condicionada por camara: usa intrinsicos, poses y mapas de rayos para mantener coherencia geometrica.
- Condicionamiento por texto: acepta prompts de texto para guiar el refinamiento.
- Inferencia causal autorregresiva de pocos pasos: rollouts de video/imagen con 1 o 4 pasos de denoising.
- Modo profesor bidireccional: los checkpoints S1 permiten muestreo de difusion multipaso con atencion completa para investigacion.
- Alto rendimiento: 8,36 FPS (14B) y 34,38 FPS (1.3B) a 4 pasos en una GPU; hasta 101,77 FPS con la variante 1.3B a 1 paso y paralelismo de contexto en 4 GPUs.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni razonamiento linguistico.

## Casos de uso

- Refinamiento de reconstrucciones por fotogrametria o NeRF: renderizar vistas desde la malla o campo volumetrico imperfecto, pasar RGB, opacidad y rayos al modelo y obtener fotogramas limpios para texturizado o visualizacion final.
- Extension de escenas para realidad virtual: generar vistas plausibles mas alla de la cobertura capturada, usando la pose de camara deseada como condicionamiento, para ampliar el campo de navegacion.
- Postproceso de escaneos 3D de baja densidad: rellenar huecos y corregir artefactos en escaneos de interiores u objetos antes de integrarlos en un pipeline de produccion de activos.
- Investigacion en destilacion de modelos de difusion: usar los profesores S1 y los destilados S3 para reproducir las etapas de diffusion forcing y DMD y estudiar el comportamiento de rollouts largos.
- Generacion de datos sinteticos geo-condicionados: producir secuencias de imagen coherentes con una trayectoria de camara para aumentar datasets de vision 3D.
- Prototipado de pipelines de captura volumetrica en tiempo casi real: con la variante 1.3B a 1 paso y paralelismo multi-GPU, integrar el refinamiento en un bucle interactivo de captura y visualizacion.
- Evaluacion comparativa de metodos de reconstruccion: medir la mejora que aporta el modelo sobre distintas representaciones 3D de entrada bajo condiciones controladas de camara y prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados son de throughput: 8,36 FPS (variante 14B, 4 pasos de denoising, una GPU), 34,38 FPS (variante 1.3B, 4 pasos, una GPU) y hasta 101,77 FPS (variante 1.3B, 1 paso, paralelismo de contexto en 4 GPUs). Estas cifras corresponden a los modelos causales destilados, no a los profesores bidireccionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, un transformer de ~16,9B parametros en precision de 16 bits requiere del orden de 34 GB solo para pesos, mas VAE y buffers; la variante de ~1,68B queda en torno a 3,5 GB en 16 bits. Son estimaciones, no datos publicados.
- GPU recomendadas: arquitecturas NVIDIA Ampere, Hopper y Blackwell (compatibilidad declarada por el autor). No se enumeran modelos concretos.
- Cabe en GPU de consumo: no confirmado. La variante 1.3B es la unica candidata plausible en GPUs de consumo de gama alta, pero no hay datos oficiales de VRAM ni de cuantizacion.
- Opciones de despliegue: PyTorch, Hugging Face Diffusers, Hugging Face Transformers, FlashAttention (FA3 en Hopper, FA4 en Blackwell). Sistema operativo soportado: Linux. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 8,36 FPS (14B, 4 pasos, 1 GPU), 34,38 FPS (1.3B, 4 pasos, 1 GPU), 101,77 FPS (1.3B, 1 paso, 4 GPUs con paralelismo de contexto).

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparaciones publicadas en la informacion proporcionada. La tabla siguiente recoge solo diferencias estructurales verificables entre las variantes del propio modelo y sus bases.

| Modelo | Parametros | Base | Licencia | Enfoque |
|---|---|---|---|---|
| ArtiFixer 14B | ~16,9B | Wan2.1-T2V-14B | NVIDIA OneWay Noncomercial | Destilado causal de pocos pasos |
| ArtiFixer 1.3B | ~1,68B | Wan2.1-T2V-1.3B | NVIDIA OneWay Noncomercial | Destilado causal, mayor throughput |
| ArtiFixer Cosmos3-Nano | ~15,8B | Cosmos3-Nano | NVIDIA OneWay Noncomercial | Condicionamiento SCoPE, prompts token-ID |
| Profesores S1 (14B, 1.3B, Cosmos3-Nano) | Iguales a sus variantes | Mismas bases | NVIDIA OneWay Noncomercial | Difusion bidireccional multipaso |

Comparativa con alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Uso restringido: el modelo se publica solo para investigacion y desarrollo, bajo la NVIDIA OneWay Noncommercial License, que prohibe el uso comercial. Las bases Wan2.1 son Apache 2.0 y Cosmos3-Nano usa Open MDW 1.1, pero la licencia del checkpoint ArtiFixer prevalece para el modelo distribuido.
- Requiere geometria de entrada: necesita intrinsicos, poses de camara y mapas de rayos; no funciona como generador de imagen independiente.
- Dependencia de la calidad de la reconstruccion de partida: el modelo refina y extiende, pero no corrige errores topologicos graves ni reconstruye geometria desde cero.
- Riesgo de alucinacion visual: al extender escenas mas alla de lo observado, puede generar contenido plausible pero inexistente; inadecuado para aplicaciones que exijan fidelidad metrica estricta.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de modelos base de generacion de video, puede heredar sesgos de sus datasets.
- Idiomas: no se especifica que idiomas admite el prompt de texto.
- Repositorio de gran tamano (275,6 GB): incluye multiples checkpoints, lo que exige espacio de almacenamiento considerable.
- Hardware: el autor declara optimizacion para GPUs NVIDIA y Linux; no se garantiza funcionamiento en otras plataformas.
- Integracion en produccion: el propio autor advierte de que se requiere validacion adicional con datos especificos del caso de uso siguiendo una metodologia en V.
- No disponible: cuantizaciones oficiales, requisitos exactos de VRAM y resultados de benchmarks de calidad de reconstruccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/ArtiFixer
- Pagina del proyecto: https://research.nvidia.com/labs/sil/projects/artifixer/
- Paper: https://research.nvidia.com/labs/sil/projects/artifixer/assets/paper.pdf
- Licencia NVIDIA OneWay Noncommercial: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- Licencia Apache 2.0 (bases Wan2.1): https://www.apache.org/licenses/LICENSE-2.0
- Licencia Open MDW 1.1 (base Cosmos3-Nano): https://openmdw.ai/license/1-1/
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Modelo base Wan2.1-T2V-14B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B-Diffusers
- Modelo base Wan2.1-T2V-1.3B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
