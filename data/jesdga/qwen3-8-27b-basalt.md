# jesdga/Qwen3.8-27B-Basalt

## Resumen

Qwen3.8-27B-Basalt es un fichero de pesos empaquetado en formato `.basalt` (versión 2) para el motor de inferencia local Basalt, desarrollado por jesdga (J. Gulfo) y orientado exclusivamente a GPU NVIDIA Blackwell (sm_120). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint NVFP4 de NVIDIA (`nvidia/Qwen3.8-27B-NVFP4`), a su vez derivado de `Qwen/Qwen3.8-27B`, junto con una capa MTP y un drafter de bloques DFlash 2 procedentes de `z-lab/Qwen3.8-27B-DFlash2`. El paquete es autocontenido: incluye pesos, tokenizador, capa MTP, drafter y torre de visión en un único fichero de 22,1 GiB.

El modelo base es un transformer denso de 27B parámetros con arquitectura Qwen3.8, que incorpora proyecciones GDN (atención lineal de tipo gated delta net) además de atención estándar, y una ventana de contexto de 262.144 tokens. La relevancia del paquete reside en que permite ejecutar un modelo denso de 27B con visión y decodificación especulativa en una sola GPU de consumo de 32 GB (RTX 5090) manteniendo el contexto completo, algo que con pesos BF16 requeriría bastante más memoria.

El interés técnico principal es la preservación bit a bit de la cuantización NVFP4 de NVIDIA en las capas MLP y en el head de salida, y de los códigos FP8 en las proyecciones de atención y GDN, sin recuantización. Esto mantiene la fidelidad respecto al checkpoint original (PPL 6,784 frente a 6,741 en BF16 sobre wikitext-2) mientras reduce el espacio en disco y memoria a 22,1 GiB. Es un artefacto de despliegue, no un modelo publicable de forma independiente del motor Basalt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con proyecciones GDN y atención; incluye capa MTP, drafter de bloques DFlash 2 y torre de visión |
| Parámetros totales | 27B (según el nombre del modelo base; no se detalla el desglose exacto) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (MLP y output head), FP8 (proyecciones GDN y atención), Q8_0 (capa MTP y drafter), BF16 (torre de visión y embeddings de tokens) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo, checkpoint de NVIDIA y drafter DFlash 2); motor Basalt bajo MIT |
| Formato de pesos | `.basalt` versión 2 (fichero único `Qwen3.8-27B-NVFP4.basalt`, 22,1 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros que combina capas de atención con proyecciones GDN (gated delta net, un mecanismo de atención lineal con estado recurrente) y una torre de visión multimodal. El paquete Basalt añade una capa MTP (multi-token prediction) y un drafter de bloques DFlash 2 para decodificación especulativa. Los pesos se construyen a partir del checkpoint NVFP4 de NVIDIA sin recuantizar: las capas MLP y el head de salida conservan los valores NVFP4 originales bit a bit, las proyecciones GDN y de atención conservan los códigos FP8, la capa MTP y el drafter se cuantizan a Q8_0 desde BF16 (solo afectan a los borradores, que el modelo verifica token a token, por lo que no pueden alterar la salida), y la torre de visión y los embeddings se mantienen en BF16.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO) del modelo base en la información proporcionada. La innovación técnica destacable del paquete es la decodificación especulativa con verificación estricta: la salida con drafting es idéntica a la salida greedy simple, ya que la aritmética de cada token no depende de la ventana de borrador. Además, el motor soporta caché KV en fp16 e int8, y con int8 cabe el contexto completo de 262.144 tokens en una tarjeta de 32 GB.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de visión: el paquete incluye torre de visión en BF16 y el motor la activa con `"vision": "dynamic"`.
- Decodificación especulativa con drafter DFlash 2 y capa MTP, con salida idéntica a la decodificación greedy simple.
- Servidor compatible con las APIs de OpenAI y Anthropic a través del motor Basalt.
- Soporte de decodificación en paralelo (`--parallel 2` y `--parallel 4`) para atender varias peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local con contexto largo: el paquete permite cargar 262.144 tokens de contexto con caché KV int8 en una RTX 5090 de 32 GB, lo que lo hace adecuado para analizar repositorios completos, expedientes o libros en una sola sesión sin truncar.
- Servicio de chat autohospedado compatible con OpenAI: el motor Basalt expone una API compatible con OpenAI y Anthropic, de modo que se puede sustituir un endpoint en la nube por este modelo local sin reescribir los clientes existentes.
- Procesamiento de documentos con imágenes: la torre de visión integrada permite extraer información de capturas, diagramas o páginas escaneadas junto con el texto, en un único modelo.
- Generación de código asistida en estación de trabajo: con 27B parámetros densos y contexto largo, el modelo puede mantener el contexto de varios ficheros y responder con latencia interactiva (204 tok/s en modo drafted para chat, 700 tok/s en modo estructurado).
- Procesamiento por lotes de texto estructurado: el modo drafted estructurado alcanza 700 tok/s, lo que lo hace viable para extracción de campos, clasificación o generación de JSON sobre grandes volúmenes en una sola GPU.
- Atención a varias sesiones concurrentes: con `--parallel 4` el motor entrega 542 tok/s agregados, adecuado para un pequeño equipo interno que comparte una única GPU.
- Evaluación de precisión y cuantización: al preservar NVFP4 y FP8 bit a bit, sirve como referencia para comparar el impacto de la cuantización frente al modelo BF16 en tareas de perplejidad y divergencia KL.

## Benchmarks y rendimiento

Rendimiento medido con `basalt-bench` en una RTX 5090 a 400 W, caché KV fp16, en tokens por segundo:

| Métrica | tok/s |
|---|---:|
| Lectura de prompt, 4k tokens | 10.727 |
| Lectura de prompt, 16k tokens | 9.318 |
| Lectura de prompt, 32k tokens | 7.708 |
| Lectura de prompt, 64k tokens | 5.623 |
| Decodificación simple | 78 |
| Decodificación con drafting, chat | 204 |
| Decodificación con drafting, estructurado | 700 |
| Decodificación con drafting, prosa | 179 |
| Decodificación `--parallel 2` (todos los slots) | 406 |
| Decodificación `--parallel 4` (todos los slots) | 542 |

Calidad medida con `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens, frente al modelo BF16:

| Caché KV | PPL | KLD media | mismo top-1 |
|---|---:|---:|---:|
| fp16 | 6,784 | 0,0239 | 92,52 % |
| int8 | 6,781 | 0,0240 | 92,56 % |
| BF16 (referencia) | 6,741 | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Blackwell (sm_120). El motor Basalt no soporta otras arquitecturas según la información disponible.
- VRAM: el fichero de pesos ocupa 22,1 GiB; con caché KV int8 cabe el contexto completo de 262.144 tokens en una tarjeta de 32 GB (RTX 5090). Con caché fp16 el contexto completo no cabe en 32 GB.
- GPU de consumo: sí, en RTX 5090 de 32 GB. No se indica compatibilidad con otras GPU de consumo.
- Despliegue: motor Basalt 0.4.0 o superior, con `bin/basalt serve --config basalt_config.json`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; la lectura de prompt a 64k tokens cae a 5.623 tok/s y la decodificación simple se mantiene en 78 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Basalt | 27B denso | 262.144 | `.basalt` v2 | Apache-2.0 | Solo GPU Blackwell; incluye visión y drafter |
| nvidia/Qwen3.8-27B-NVFP4 | 27B denso | no disponible | NVFP4 (checkpoint) | Apache-2.0 | Checkpoint de origen; requiere motor compatible con NVFP4 |
| Qwen/Qwen3.8-27B | 27B denso | no disponible | BF16 (safetensors) | Apache-2.0 | Modelo base; mayor huella de memoria |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | Apache-2.0 | Drafter de bloques usado por el paquete |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Basalt: el fichero `.basalt` versión 2 solo se puede cargar con Basalt 0.4.0 o superior; no es compatible con vLLM, llama.cpp, transformers ni Ollama.
- Restricción de hardware: requiere GPU NVIDIA Blackwell (sm_120); no funciona en Ampere, Ada ni arquitecturas anteriores.
- La cuantización NVFP4 y FP8 introduce una pérdida de calidad medible: PPL 6,784 frente a 6,741 en BF16 y 92,52 % de coincidencia en top-1, con KLD media de 0,0239.
- El contexto completo de 262.144 tokens solo cabe con caché KV int8 en 32 GB; con fp16 hay que reducirlo.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la información disponible.
- El paquete tiene 0 descargas y 0 likes, y fue creado el 14 de noviembre de 2026; no hay evidencia de uso en producción ni validación externa.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint de NVIDIA y del drafter, que también se declaran Apache-2.0.

## Enlaces

- Hugging Face: https://huggingface.co/jesdga/Qwen3.8-27B-Basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Drafter DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor Basalt (GitHub): https://github.com/jesdga95/basalt
- Documentación de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision/qwen38-27b.md
- Metodología de calidad: https://github.com/jesdga95/basalt/blob/main/docs/precision/quality.md
- Documentación del formato de modelo: https://github.com/jesdga95/basalt/blob/main/docs/model-file.md
- Sitio web del proyecto: https://basalt.jgulfo.com
