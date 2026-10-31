# selcukkubur/Phonon-2.5-mlx

## Resumen

Phonon-2.5-mlx es una conversión de formato, publicada por el usuario selcukkubur, del modelo de reconocimiento automático de habla (ASR) Phonon-2.5 de FermionResearch para que pueda ejecutarse con el framework MLX de Apple en equipos Mac. Phonon-2.5 es, a su vez, una compresión cuantizada de cinco valores (quantization-aware) del checkpoint nvidia/parakeet-tdt-0.6b-v3 de NVIDIA, un modelo ASR basado en la arquitectura Parakeet con TDT (Token-and-Duration Transducer) que soporta 25 idiomas europeos.

El problema que resuelve esta conversión es de portabilidad: permite cargar los pesos comprimidos de Phonon-2.5 (unos 181 millones de parámetros, 0,2 GB en disco) en implementaciones MLX de Parakeet, aprovechando la aceleración unificada de memoria de los chips Apple Silicon. No se ha reentrenado ningún peso: los bloques de cinco valores se transportan verbatim y únicamente se renombraron los tensores al layout NeMo/MLX.

Es relevante porque combina un modelo ASR multilingüe compacto y eficiente con un ecosistema de inferencia nativo en Mac, útil para transcripción local sin dependencias de CUDA. La licencia CC-BY-4.0 permite uso comercial con atribución a FermionResearch y NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), variante del modelo base nvidia/parakeet-tdt-0.6b-v3 |
| Parámetros totales | 181.383.317 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización de cinco valores (five-value, quantization-aware), empaquetada en 264 bloques `phonon_packed` más 9 tablas int6; resto en float16 |
| Idiomas soportados | 25: alemán, búlgaro, checo, croata, danés, eslovaco, esloveno, español, estonio, finés, francés, griego, húngaro, inglés, italiano, letón, lituano, maltés, neerlandés, polaco, portugués, rumano, ruso, sueco y ucraniano |
| Licencia | CC-BY-4.0 (pesos); Apache-2.0 para el código lector; notice de Fermion Research incluido |
| Formato de pesos | safetensors (un único archivo `model.safetensors`, 0,2 GB), layout NeMo/MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es Parakeet TDT de NVIDIA, un transductor que predice simultáneamente tokens y duraciones, lo que permite transcripción por streaming sin alineación externa. El modelo original parakeet-tdt-0.6b-v3 fue entrenado por NVIDIA para 25 idiomas europeos. Sobre ese checkpoint, FermionResearch aplicó una compresión cuantización-aware de cinco valores, que reduce drásticamente el tamaño respecto al original de 0,6B de parámetros, dando lugar a Phonon-2.5.

Esta versión concreta no implica ningún entrenamiento adicional: es una conversión de formato en la que los tensores se renombraron al layout NeMo/MLX para que una implementación MLX de Parakeet pueda leerlos. El repositorio incluye un archivo ATTRIBUTION.md con la lista exacta de cambios realizados. No hay datos disponibles sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO (habitual, por otra parte, en modelos ASR).

## Capacidades

- Reconocimiento automático de habla (ASR) en 25 idiomas europeos, incluido el español.
- Transcripción con arquitectura transductor (TDT), que en el modelo base de NVIDIA permite transcripción en tiempo real y por lotes.
- Inferencia nativa en Apple Silicon mediante MLX.
- Cuantización agresiva de cinco valores con verificación de fidelidad: cada tensor empaquetado decodifica exactamente a los mismos bits que produce el lector original de Fermion.
- No hay indicios de capacidades de generación de texto general, razonamiento, código, visión ni tool calling: se trata de un modelo ASR especializado.

## Casos de uso

- Transcripción local en Mac: ejecutar el modelo con MLX en un MacBook sin GPU externa ni conexión a la nube, adecuado para privacidad de datos en dictado personal o notas de voz.
- Transcripción multilingüe de reuniones: dado el soporte de 25 idiomas europeos, puede transcribir reuniones con participantes en español, inglés, francés o alemán en un único despliegue.
- Subtitulado de contenido audiovisual: su tamaño reducido (0,2 GB) permite procesar lotes de audio en portátiles para generar subtítulos en varios idiomas.
- Integración en apps macOS/iOS de dictado: MLX está optimizado para Apple Silicon, por lo que el modelo encaja en aplicaciones nativas que necesitan ASR embebido con baja huella de memoria.
- Procesamiento de call recordings con restricciones de datos: organizaciones que no pueden enviar audio a APIs de terceros pueden transcribir grabaciones de atención al cliente localmente.
- Prototipado e investigación en ASR eficiente: la cuantización de cinco valores y la documentación de la conversión (ATTRIBUTION.md) lo hacen útil como caso de estudio de compresión de modelos de habla.
- pipelines de preprocesamiento de voz: transcripción como primer paso para indexación, búsqueda semántica o generación de resúmenes sobre archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que FermionResearch publica sus propias cifras de WER (word error rate) para Phonon-2.5, pero que no se reproducen ni se reclaman en este repositorio; la conversión se ha verificado por fidelidad de bits respecto a la implementación de referencia, no mediante benchmarks.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 0,2 GB; con activación de los bloques cuantizados y overhead de inferencia, debería funcionar con holgura en equipos con 8 GB de memoria unificada (estimación, dato exacto no disponible).
- GPU recomendadas: al ser un modelo MLX, está pensado para Apple Silicon (M1, M2, M3, M4). No requiere GPU NVIDIA; no hay datos sobre ejecución con CUDA.
- Consumer hardware: cabe sin problemas en cualquier Mac con Apple Silicon reciente; es uno de los puntos fuertes del formato.
- Despliegue: mediante MLX (implementación MLX de Parakeet necesaria para leer el layout NeMo/MLX). No consta soporte directo en vLLM, llama.cpp, Ollama o TGI; para esos entornos habría que usar el modelo original de FermionResearch o el checkpoint de NVIDIA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato/entorno | Licencia |
|---|---|---|---|---|
| selcukkubur/Phonon-2.5-mlx | 181,4 M (comprimido five-value) | 25 europeos | safetensors MLX | CC-BY-4.0 |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | 0,6 B | 25 europeos | NeMo (PyTorch) | CC-BY-4.0 |
| FermionResearch/Phonon-2.5 (origen de la conversión) | no disponible (versión comprimida de 0,6 B) | 25 europeos | contenedor propio de Fermion | CC-BY-4.0 |

La ventaja diferencial de esta variante es la ejecución en MLX sobre Apple Silicon con una huella de memoria muy inferior al modelo base, a costa de depender de una implementación MLX de Parakeet mantenida por terceros.

## Limitaciones y advertencias

- Es una conversión de formato no oficial: no proviene de FermionResearch ni de NVIDIA, y las cifras de WER del modelo original no se reproducen ni garantizan en este repositorio.
- Requiere una implementación MLX de Parakeet capaz de interpretar el layout NeMo/MLX y el empaquetado `phonon_packed`/`phonon_int6`; no funciona directamente con NeMo estándar.
- La cuantización de cinco valores puede introducir degradación de precisión respecto al modelo original; el autor no publica evaluación propia del impacto en WER.
- La licencia CC-BY-4.0 exige atribución tanto a FermionResearch como a NVIDIA en cualquier uso, incluido el comercial.
- Contexto máximo de audio, rendimiento por idioma y posibles sesgos por idioma o acento: no disponibles; conviene consultar la model card del modelo base de NVIDIA.
- Riesgo habitual de errores de transcripción en audio ruidoso, con solapamiento de hablantes o dominios especializados (no cuantificado en la información disponible).
- El repositorio es muy reciente (creado en octubre de 2026) con pocas descargas (142) y un solo like, lo que implica poca validación por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/selcukkubur/Phonon-2.5-mlx
- Modelo original (FermionResearch): https://huggingface.co/FermionResearch/Phonon-2.5
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Archivo de atribución: https://huggingface.co/selcukkubur/Phonon-2.5-mlx/blob/main/ATTRIBUTION.md
- Framework MLX: https://github.com/ml-explore/mlx
