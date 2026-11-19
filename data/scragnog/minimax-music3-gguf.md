# scragnog/MiniMax-Music3-GGUF

## Resumen

MiniMax-Music3-GGUF es una conversión al formato GGUF del modelo MiniMax-Music3 de MiniMax, publicada por el usuario scragnog para su uso con HOT-Step CPP, una aplicación de escritorio de generación musical con motor nativo en C++/GGML. No se trata de un modelo de lenguaje conversacional, sino de un sistema completo de texto-a-música que combina un modelo de lenguaje global, un decodificador de profundidad RVQ, un codificador de condiciones, un DiT de flow-matching y un vocoder. El repositorio distribuye cada componente como un archivo GGUF independiente, lo que permite cuantizar y sustituir módulos por separado.

El componente principal es un LM de 8,59B parámetros con arquitectura Qwen3 y un vocabulario de 200k tokens que incluye 16.384 códigos de audio semánticos. Le acompañan un DiT de 2,4B, un decodificador de profundidad de 0,6B, un codificador de condiciones de 25M y un vocoder de 54M. La generación produce audio estéreo a 44,1 kHz de hasta 5 minutos de duración.

Su relevancia actual radica en que, según el autor, es la primera conversión GGUF de este modelo y habilita la generación musical completamente local en GPUs de consumo, con combinaciones de cuantización que van desde ~12 GB hasta ~24 GB de VRAM. El repo acumula más de 325.000 descargas, aunque solo 6 likes, y su tamaño total es de 229,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cinco modulos: LM (Qwen3) + decodificador de profundidad RVQ + codificador de condiciones + DiT de flow-matching + vocoder |
| Parametros totales | 25.167.881 (dato de safetensors del repo); componentes: LM 8,59B, DiT 2,4B, depth 0,6B, cond 25M, vocoder 54M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0, Q6_K, Q5_K_M/S, Q4_K_M/S, NVFP4, MXFP4, Q3_K_L/M/S, Q2_K (LM, DiT y depth); cond y vocoder solo f16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-music3-community-license (other) |
| Formato de pesos | GGUF (split por componente); tambien ONNX segun tags |

## Arquitectura y entrenamiento

El pipeline consta de cinco módulos encadenados. El LM global, con arquitectura Qwen3 y 8,59B parámetros, procesa el texto y genera secuencias de códigos de audio semánticos (16.384 códigos dentro de un vocabulario de 200k). Un decodificador de profundidad RVQ de 0,6B expande esos códigos, un codificador de condiciones de 25M procesa la entrada, un DiT de flow-matching de 2,4B genera los latentes de audio y un vocoder de 54M sintetiza la forma de onda final a 44,1 kHz estéreo.

La conversión se realizó con las herramientas `convert-mm3.py` y `split-mm3.py` de HOT-Step CPP a partir de los safetensors bf16/fp16 publicados por MiniMax vía el repackage de Comfy-Org. El split es un paso de tensores byte-exacto: los tensores de cada archivo dividido son bit-idénticos a los del bundle. El weight-norm del vocoder se plegó en la conversión y las bases Fourier/RoPE del vocoder y del DiT se fijaron en F32; los 911 tensores fueron validados en forma. La implementación está validada en paridad contra la referencia oficial de diffusers (correlación por módulo ≥ 0,9999 frente a fp32; replay completo del pipeline 0,9988). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de música a partir de texto (text-to-music) con salida estéreo a 44,1 kHz y hasta 5 minutos de duración.
- Control mediante el formato Structured Caption diseñado por MiniMax.
- Selección independiente de cuantización por componente (LM, DiT, depth) sin re-descargar el resto.
- Entrenamiento de LoRA sobre el modelo mediante el Training Studio de HOT-Step, con archivos específicos de entrenamiento (encoder RVQ, encoder DAV, LM en bf16 y encoder rec7).
- Opción de "Cover-launder" para corrección de mezcla densa en el entrenamiento de códigos.
- Ejecución completamente local con motor C++/GGML, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje de propósito general.

## Casos de uso

- Producción musical local en estudio: el pipeline completo se ejecuta en una estación de trabajo con GPU de consumo usando la combinación balanceada (LM q8_0 + DiT Q4_K_M + depth q8_0, ~12 GB de descarga), lo que permite iterar sobre ideas musicales sin conexión ni costes por llamada.
- Generación de bandas sonoras para vídeo y juegos: la salida de hasta 5 minutos a 44,1 kHz estéreo encaja en la creación de música de fondo para tráilers, niveles o menús, controlando el estilo mediante Structured Caption.
- Prototipado rápido de ideas melódicas: la combinación "fast on RTX 50-series" (LM/DiT NVFP4 + depth q8_0) reduce los requisitos de VRAM y acelera la generación en GPUs Blackwell para sesiones exploratorias.
- Ajuste fino con LoRA sobre un estilo propio: el Training Studio permite entrenar adaptadores sobre un corpus propio usando el encoder RVQ de 169M y el encoder DAV, con la opción de base bf16 para aprovechar los tensor cores en GPUs de 40 GB o más.
- Investigación en modelos generativos de audio: la separación por componentes y la paridad validada contra diffusers facilitan experimentos de ablación sustituyendo un módulo (por ejemplo, distintas cuantizaciones del DiT) manteniendo el resto fijo.
- Despliegue en aplicaciones de escritorio: HOT-Step descarga automáticamente los archivos desde el Model Manager al seleccionar el backend MiniMax-Music3, lo que simplifica la distribución de una función de generación musical integrada en un producto de escritorio.
- Archivado y reproducibilidad: la estructura de un GGUF por componente y las validaciones de forma y paridad documentadas permiten reconstruir el pipeline exacto en otro equipo sin depender de los safetensors originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de paridad de la implementación: correlación por módulo ≥ 0,9999 frente a la referencia fp32 de diffusers y 0,9988 en el replay completo del pipeline. También menciona que el LM en bf16 es 1,4 veces más rápido por paso que q8_0 en una RTX 5090 con el mismo recorte, a cambio de ~9 GB más de VRAM.

## Requisitos de hardware

- Combinación calidad: todos los componentes en f16, ~24 GB de VRAM.
- Combinación recomendada: LM/DiT/depth en q8_0 más frontends f16, ~13 GB de VRAM.
- Combinación balanceada: LM q8_0 + DiT Q4_K_M + depth q8_0, ~12 GB de descarga.
- Combinación rápida en RTX 50-series: LM/DiT en NVFP4 + depth q8_0.
- El decodificador de profundidad tiene un suelo de calidad validado en Q8_0; por debajo de Q5 el LM degrada el audio de forma audible.
- Entrenamiento con base bf16: ~9 GB adicionales de VRAM, recomendado para tarjetas de 40 GB o más con el recorte por defecto.
- GPUs recomendadas: no se especifican modelos concretos más allá de la mención a la RTX 5090 en las pruebas de entrenamiento; por los requisitos de VRAM, encaja en RTX 4090, RTX 5090, A100 y H100.
- Opciones de despliegue: exclusivamente HOT-Step CPP (motor C++/GGML). No es usable con llama.cpp solo, pese a que `mm3-lm-*.gguf` sea estructuralmente un GGUF de Qwen3, porque la generación requiere el pipeline completo de cinco módulos.
- Latencia y throughput: no disponibles, salvo el dato relativo de 1,4x por paso del LM bf16 frente a q8_0 en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-Music3-GGUF (este repo) | 25.167.881 (repo); LM 8,59B + DiT 2,4B + depth 0,6B | no disponible | minimax-music3-community-license | GGUF split | Conversion comunitaria para HOT-Step CPP |
| MiniMaxAI/MiniMax-Music3 | no disponible | no disponible | minimax-music3-community-license | safetensors (bf16/fp16) | Modelo original de MiniMax; referencia oficial |
| minimaxmusic.cpp (ServeurpersoCom) | no disponible | no disponible | no disponible | no disponible | Implementacion en C++ cuyo diseno de split se reutiliza |
| PurpleOrc/open-rvq-encoder-minimax-music3-169m-53k | 169M | no disponible | no disponible | no disponible | Reimplementacion comunitaria del tokenizador de audio RVQ, licencia MIT segun la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: aplicable en el sentido de generar audio que no corresponde fielmente a la descripción textual; no se documentan tasas.
- El modelo no es utilizable con llama.cpp de forma aislada: requiere el pipeline completo implementado en HOT-Step CPP.
- Las cuantizaciones por debajo de Q5 en el LM degradan el audio de forma audible; los archivos sub-Q5 existen solo para experimentos, no para escucha.
- Los códigos de audio son específicos del encoder: un adaptador LoRA entrenado con el encoder RVQ incluido debe seguir usándose con ese mismo encoder en inferencia; cambiar de encoder obliga a reexportar todas las cachés de códigos.
- El tokenizador de audio oficial nunca fue publicado por MiniMax; el encoder RVQ incluido es una reimplementación comunitaria de PurpleOrc, y sus puntuaciones de holdout deben consultarse en el repositorio original antes de extraer conclusiones.
- El codificador de condiciones y el vocoder no deben cuantizarse nunca (solo f16).
- La licencia MiniMax-Music3 Community License es de tipo "other": deben revisarse sus términos antes de cualquier uso comercial.
- El repositorio ocupa 229,9 GB; conviene descargar solo los archivos necesarios mediante el Model Manager.
- El layout antiguo de dos archivos (`mm3-synth-*.gguf`) sigue disponible solo para versiones antiguas de HOT-Step; las versiones actuales prefieren los archivos divididos.
- No hay información sobre idiomas soportados ni sobre longitud de contexto del LM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scragnog/MiniMax-Music3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Aplicación HOT-Step CPP: https://github.com/scragnog/HOT-Step-CPP
- Script de conversión: https://github.com/scragnog/HOT-Step-CPP/blob/master/engine/tools/convert-mm3.py
- Script de split: https://github.com/scragnog/HOT-Step-CPP/blob/master/engine/tools/split-mm3.py
- Implementación de referencia minimaxmusic.cpp: https://github.com/ServeurpersoCom/minimaxmusic.cpp
- Encoder RVQ comunitario: https://huggingface.co/PurpleOrc/open-rvq-encoder-minimax-music3-169m-53k
- Encoder rec7: https://huggingface.co/PurpleOrc/m3-rec7-encoder
