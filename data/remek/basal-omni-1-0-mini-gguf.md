# Remek/basal-omni-1.0-mini-GGUF

## Resumen

basal-omni-1.0-mini-GGUF es la versión cuantizada en formato GGUF del modelo basal-omni-1.0-mini, desarrollado por Remek. No es un modelo generativo de propósito general al uso, sino una capa de decisión tipada: el modelo recibe una pregunta con un conjunto cerrado de opciones (entre 2 y 255) y devuelve una decisión con probabilidades calibradas, en lugar de texto libre. Está construido sobre Gemma 4 E4B (arquitectura de la familia Gemma 4) y se distribuye bajo licencia Apache 2.0.

El repositorio contiene únicamente los ficheros de cuantización Q8_0 (7,9 GB) y Q6_K (6,2 GB), pensados para llama.cpp y Ollama sobre GPU NVIDIA, Apple Silicon (Metal) o CPU. Es importante señalar que esta versión GGUF es solo texto: los codificadores de imagen y audio del modelo bf16 original no están incluidos, por lo que para tareas multimodales hay que recurrir al modelo base.

La relevancia de esta ficha radica en su enfoque: en lugar de competir en generación de texto, el modelo se posiciona como motor de clasificación y decisión con calibración explícita (ECE, umbrales certificados para 1 % y 5 % de error) y una API tipada servida mediante el motor `basal-serve`. Los ficheros Q5_K_M y Q4_K_M no se publicaron porque no superaron las barreras de calidad definidas por el autor frente a bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, según model card) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Ollama limita a 4.096 tokens por prompt en ese modo) |
| Tipos de cuantizacion | Q8_0 (7,9 GB) y Q6_K (6,2 GB); F16 generado pero no publicado |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card indica que el modelo base es Gemma 4 E4B y que la conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp b11312 sobre el modelo bf16, extrayendo únicamente el decodificador de texto y dejando fuera los codificadores de imagen y audio. La cuantización Q8_0 se generó directamente desde bf16 y Q6_K se derivó desde F16 con `llama-quantize`, sin matriz de importancia. La conversión en Linux (CUDA) y macOS produce ficheros idénticos byte a byte.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica principal no está en la arquitectura sino en la capa de decisión: el servidor `basal-serve` renderiza un prompt propio, lee las probabilidades de los códigos de opción y aplica temperaturas por tipo y por bucket, junto con umbrales certificados para 1 % y 5 % de error, mediante el fichero `CALIBRATION.gguf.json`. Se soportan los tipos de consulta `choice`, `noul`, `score`, `multi`, `act` y `tool`, con hasta 255 opciones.

## Capacidades

- Toma de decisiones tipada sobre conjuntos cerrados de opciones (2 a 255 alternativas).
- Clasificación con probabilidades calibradas y umbrales de error certificados (1 % y 5 %).
- Modos de consulta específicos: `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Soporte de tool calling a través del tipo de consulta `tool`.
- Automatización selectiva: con la calibración incluida, el 42,4 % de las decisiones se resuelven automáticamente con un error observado del 0,7 % (objetivo 1 %); al 5 % de error, el 78,3 % con error observado del 3,9 %.
- Multilingüe limitado a polaco (pl) e inglés (en).
- Solo texto en esta versión GGUF; sin visión ni audio (disponibles únicamente en el modelo bf16).
- No es un modelo de generación libre: un `ollama run` directo devuelve solo texto plano, sin respuestas tipadas.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje entrante, el modelo elige entre un conjunto cerrado de intenciones o departamentos con una probabilidad calibrada, lo que permite derivar automáticamente los casos de alta confianza y escalar solo los dudosos.
- Moderación y clasificación de contenido: uso del modo `choice` o `multi` para asignar etiquetas de política a textos en polaco o inglés, con umbrales de error configurables que permiten ajustar el equilibrio entre cobertura automática y revisión humana.
- Extracción de decisiones en pipelines de datos: el modo `score` permite puntuar opciones candidatas y ordenarlas, útil para desambiguación de entidades o selección de categorías en procesos ETL.
- Selección de herramientas en agentes: el tipo `tool` permite que un orquestador consulte al modelo qué herramienta invocar entre un catálogo definido, con la ventaja de que la salida es una distribución de probabilidad en lugar de texto que haya que parsear.
- Triaje documental con contexto largo: mediante `--mode gguf` (sin el límite de 4.096 tokens de Ollama) se pueden enviar documentos extensos y obtener una decisión tipada sobre su clasificación o prioridad.
- Despliegue en hardware modesto: al caber en un Mac de 16 GB con Q8_0 y funcionar en CPU, es adecuado para servicios de decisión en edge o en estaciones de trabajo sin GPU dedicada, con 16,4 decisiones/s en una RTX PRO 6000 y 1,2 decisiones/s en un M4 Pro.
- Automatización con garantías de error: en flujos regulados donde se exige un error máximo, la calibración certificada permite fijar el porcentaje de decisiones automáticas y auditar el error observado.

## Benchmarks y rendimiento

Los datos publicados comparan los ficheros GGUF con el modelo bf16 servido en modo eager sobre el conjunto de desarrollo dev v2 (10.606 decisiones), en una RTX PRO 6000 de 96 GB con CUDA. La métrica de agreement mide la coincidencia de opción elegida con bf16.

| Fichero | Tamano | Agreement (2-10 opciones) | Agreement con margen >= 0.2 | Precision | ECE | Decisiones/s (16 en vuelo) | Puerta |
|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 7,9 GB | 0,9871 | 0,9977 | -0,06 pt | -0,0001 | 16,4 | PASS |
| Q6_K (menor) | 6,2 GB | 0,9709 | 0,9932 | +0,05 pt | -0,0053 | 14,4 | PASS |
| F16 (referencia, no publicado) | 14,9 GB | 0,9949 | 0,9999 | no disponible | no disponible | no disponible | no disponible |

Resultados adicionales: Q8_0 en Metal (Apple M4 Pro, 2.000 decisiones) alcanza agreement 0,9887 y 0,9992 con margen >= 0,2, con 1,2 decisiones/s en proceso. En Ollama 0.35.0 (Q8_0, 300 decisiones de hasta 10 opciones) el agreement es 0,9800 y 0,9961 con margen >= 0,2, con 2,1 decisiones/s. La calibración sobre Q8_0 en modo gguf, con test de 8.560 decisiones, reporta una precisión de 0,882. Los resultados del benchmark Werdykt v1 (0,769) y de los conjuntos polaco e inglés están en la ficha del modelo base, no en esta.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 7,9 GB de pesos; Q6_K, unos 6,2 GB, más overhead de contexto.
- GPU recomendadas: RTX PRO 6000 (medida en la model card), A100/H100 para mayor throughput; en Apple Silicon funciona vía Metal.
- Consumer GPU: Q8_0 cabe en GPUs con 8-12 GB de VRAM; en Apple Silicon, un Mac de 16 GB ejecuta Q8_0 (los estados largos necesitan más memoria).
- CPU: soportado mediante llama.cpp.
- Despliegue: llama.cpp (b11312 o superior, vía llama-cpp-python 0.3.36 o superior), Ollama 0.35 o superior, y el motor `basal-serve` 2.2.0 o superior con el extra `gguf` (recomendado v2.8.1).
- Throughput medido: 16,4 decisiones/s en RTX PRO 6000 (Q8_0, 16 en vuelo); 1,2 decisiones/s en M4 Pro; 2,1 decisiones/s en Ollama.
- Limitaciones de modo: Ollama admite como máximo 20 opciones y 4.096 tokens por prompt; para documentos largos y hasta 255 opciones hay que usar `--mode gguf`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-GGUF | 7,46 B | no disponible | Decisión tipada calibrada (solo texto en GGUF) | Apache 2.0 | GGUF en HF, llama.cpp, Ollama |
| basal-omni-1.0-mini (bf16) | 7,46 B | no disponible | Decisión tipada calibrada con visión y audio | Apache 2.0 | Safetensors en HF |
| Modelos de clasificación tipo encoder (p. ej. BERT) | no disponible | no disponible | Clasificación por etiquetas fijas | variable | amplia |

La comparación con alternativas de la misma categoría (motores de decisión con calibración) no está disponible en la información consultada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como tal; no debe asumirse estabilidad de API ni de calibración entre versiones.
- Solo texto en esta versión: sin capacidades de visión ni audio, pese a que el modelo base las tiene.
- Idiomas limitados a polaco e inglés; el rendimiento en castellano no está documentado.
- No es un modelo conversacional de propósito general: un `ollama run` directo devuelve texto libre sin decisiones tipadas; la funcionalidad depende de `basal-serve`.
- La calibración publicada está ajustada para un único orden de opciones (el predeterminado); cambiar el orden invalida los umbrales.
- En modo Ollama, el límite de 20 opciones y 4.096 tokens restringe los casos de uso con documentos largos o catálogos amplios.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo en la información disponible; al tratarse de un modelo de decisión, los errores se manifiestan como clasificaciones incorrectas con confianza alta, lo que exige monitorización.
- Las cuantizaciones Q5_K_M y Q4_K_M no superaron las barreras de calidad y no se distribuyen; usar cuantizaciones inferiores no está respaldado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías de calibración fuera de los conjuntos evaluados obliga a recalibrar con datos propios (`basal-calibrate`) antes de producción.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-mini
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Documentación GGUF del motor: docs/GGUF.md en el repositorio de GitHub
