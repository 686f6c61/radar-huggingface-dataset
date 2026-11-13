# pentacoxian-dev/Qwen3.8-27B-YASAKANI-speed-dequant-F16-GGUF

## Resumen

Este repositorio contiene una conversión no oficial del modelo `yasakani-dev/Qwen3.8-27B-YASAKANI-speed` desde el formato propietario `.yskn` de YASAKANI a GGUF de 16 bits, publicada por el usuario `pentacoxian-dev`. No se trata de un modelo nuevo ni de una versión lista para producción: es un artefacto de auditoría cuyo único propósito es medir la calidad de la compresión propietaria de YASAKANI con herramientas estándar de llama.cpp, en concreto `llama-perplexity --kl-divergence`, sin depender del motor propio de YASAKANI.

El modelo subyacente es un Qwen3.8-27B (familia Qwen de Alibaba Cloud) con 26.895.998.464 parámetros reales según safetensors, es decir, aproximadamente 26,9 mil millones. La conversión decodifica las 402 matrices del archivo fuente (400 matrices del cuerpo a 3 bits por peso, la matriz de salida a 4 bits y el embedding a 3 bits) y las almacena como F16, junto con los 449 tensores auxiliares (normalizaciones, convoluciones, puertas) copiados bit a bit del Qwen3.8-27B original.

El resultado ocupa 53,8 GB, cinco veces el tamaño del archivo del que se decodificó, y es más lento que cualquier GGUF cuantizado convencional. El propio autor advierte explícitamente de que no sirve para ejecutar el modelo. Su interés es técnico: permite comparar los pesos almacenados por YASAKANI contra los pesos BF16 originales y contra otras cuantizaciones (como las GSQ-RCO de ISTA-DASLab) usando la misma referencia de logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); sin capa MTP ni codificador de visión |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF); el origen usa 3 bits por peso en 400 matrices del cuerpo, 4 bits en la matriz de salida y 3 bits en el embedding |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF F16 dividido en 2 archivos (43,76 GB + 10,05 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 26,9 mil millones de parámetros. La conversión conserva los ajustes, el tokenizador y la plantilla de chat del checkpoint original de Qwen (`Qwen/Qwen3.8-27B`, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). No se incluye la capa MTP (multi-token prediction) ni el codificador de visión, porque el archivo `.yskn` de origen tampoco los contiene.

La innovación técnica relevante no está en el modelo, sino en el esquema de compresión de YASAKANI que este repositorio decodifica. Cada matriz del archivo `.yskn` es un código de trellis: un estado de 12 bits consume 6 bits nuevos por paso (8 en la matriz de salida) y cada estado selecciona dos pesos de una tabla de 4.096 pares FP16; cada fila tiene además una escala FP16. La matriz decodificada está en una base rotada, con pesos W = S_out · H · diag(scale) · Q · H · S_in, donde Q es la matriz decodificada, H es la transformada de Walsh-Hadamard de 512 puntos aplicada por bloques en ambos lados, y S_in y S_out son signos ±1 generados con semilla. El script `scripts/yskn_to_hf.py` reimplementa el lector del formato a partir del código fuente del motor de YASAKANI (`src/format.hpp`, `src/loader.cpp`, `src/v2_decode.cuh`).

No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en la información proporcionada. El proceso de conversión sí está documentado: descarga del `.yskn`, decodificación a safetensors con numpy y torch (unos 8 minutos en CPU), conversión a GGUF F16 con `convert_hf_to_gguf.py --no-mtp` y división con `llama-gguf-split --split-max-size 45G`.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la plantilla de chat original de Qwen3.8-27B y está etiquetado como `conversational`.
- Capacidades heredadas del modelo base Qwen3.8-27B (razonamiento, código, matemáticas, multilingüismo): no se detallan en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: no disponibles; el codificador de visión no está incluido en el archivo de origen.
- Modo thinking: no disponible en la información proporcionada.
- Uso previsto real: auditoría y medición de la compresión YASAKANI mediante `llama-perplexity --kl-divergence` y comparación tensor a tensor con los pesos BF16 originales.

## Casos de uso

- Auditoría de compresión de YASAKANI: decodificar el `.yskn` a F16 y comparar cada una de las 402 matrices contra el checkpoint BF16 original usando `per_tensor_error.jsonl`, que registra similitud coseno y MSE relativo por tensor.
- Medición de divergencia KL: ejecutar `llama-perplexity --kl-divergence` contra los logits de Qwen3.8-27B en BF16 sobre textos de prosa (documentación Markdown de llama.cpp, 47.097 tokens) y de código (módulos de la biblioteca estándar de Python, 35.312 tokens).
- Comparación con otras cuantizaciones: el autor usa los mismos logits BF16 de referencia para medir los archivos GSQ-RCO IQ3_S de ISTA-DASLab, lo que permite situar la compresión YASAKANI frente a esquemas de cuantización convencionales.
- Reproducción del pipeline de conversión: el script `yskn_to_hf.py` y los comandos documentados permiten reconstruir el GGUF desde el archivo fuente con revisión y SHA-256 fijados.
- Verificación de integridad de pesos: los SHA-256 de los dos fragmentos GGUF y del `.yskn` de origen permiten validar descargas y detectar corrupción.
- Investigación sobre formatos de compresión propietarios: el repositorio documenta en detalle el esquema de trellis, la rotación Walsh-Hadamard y las escalas por fila, material útil para quien estudie cuantización extrema (3-4 bits por peso).
- Referencia de decodificación en llama.cpp: sirve para comprobar que el GGUF generado carga correctamente con `-ngl 30` en una GPU de 32 GB y que los tensores auxiliares son bit-idénticos al original.

## Benchmarks y rendimiento

La model card incluye una comparación tensor a tensor contra los pesos BF16 originales de Qwen3.8-27B (`per_tensor_error.jsonl`):

| Matrices | Bits por peso en origen | Similitud coseno | MSE relativo |
|---|---:|---:|---:|
| 400 matrices del cuerpo | 3 | 0,980 a 0,987 (media 0,984) | 0,027 a 0,041 (media 0,032) |
| Matriz de salida | 4 | 0,996 | 0,0075 |
| Embedding | 3 | 0,989 | 0,021 |

El error es uniforme entre capas y tipos de matriz, sin valores atípicos. El MSE relativo se define como el error cuadrático dividido por el cuadrado del tamaño de la matriz original.

La model card inicia además una tabla de divergencia KL medida con `llama-perplexity --kl-divergence` (8 ventanas de 2.048 tokens por texto, puntuando la segunda mitad de cada ventana) frente a los logits de Qwen3.8-27B en BF16, comparando con los archivos GSQ-RCO IQ3_S de ISTA-DASLab. Sin embargo, el contenido proporcionado se corta en la primera fila de esa tabla (GSQ-RCO IQ3_S, 11...), por lo que no es posible reproducir los valores completos ni los del modelo YASAKANI. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este repositorio.

## Requisitos de hardware

- Memoria total: aproximadamente 56 GB entre VRAM y memoria del sistema para cargar el GGUF F16 completo.
- GPU de 32 GB: con `-ngl 30` se mantienen 30 de las 64 capas en la GPU y llama.cpp transfiere el resto para lotes grandes.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, requiere GPUs de 80 GB (A100, H100) para carga completa o configuraciones mixtas GPU/CPU.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) ni de 16 GB; requeriría offloading masivo a RAM del sistema.
- Opciones de despliegue: llama.cpp (herramientas `llama-perplexity`, `llama-gguf-split`, `convert_hf_to_gguf.py`); el autor indica explícitamente que para ejecutar el modelo se use el motor YASAKANI, no este GGUF.
- Latencia y throughput: no disponibles; el autor afirma que es más lento que cualquier GGUF cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Proposito |
|---|---|---|---|---|---|
| Este repositorio (YASAKANI speed dequant F16) | 26,9 B | no disponible | GGUF F16, 53,8 GB | Apache 2.0 | Auditoría de compresión |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (IQ3_S) | 26,9 B (base) | no disponible | GGUF IQ3_S, 11 GB (según el fragmento disponible) | no disponible | Cuantización para inferencia |
| Qwen/Qwen3.8-27B (BF16 original) | 26,9 B | no disponible | safetensors BF16 | no disponible | Modelo de referencia |
| yasakani-dev/Qwen3.8-27B-YASAKANI-speed (.yskn) | 26,9 B | no disponible | `.yskn`, ~10,8 GB (53,8/5) | no disponible | Compresión propietaria para el motor YASAKANI |

## Limitaciones y advertencias

- No es un modelo para ejecutar: el autor lo declara explícitamente; es cinco veces más grande que el archivo del que se decodificó y más lento que cualquier GGUF cuantizado.
- Conversión no oficial: no está afiliada ni respaldada por los autores de YASAKANI, Qwen ni Alibaba Cloud.
- No mide la aritmética real del motor YASAKANI: en tiempo de ejecución, el motor redondea la tabla de códigos de cada matriz a enteros de 8 bits y multiplica con activaciones de 8 bits; ese redondeo no está en este archivo, por lo que mide los pesos almacenados, no el comportamiento del motor.
- Sin capa MTP ni codificador de visión: el archivo de origen tampoco los contiene, de modo que no se pueden evaluar esas partes.
- Idiomas soportados no documentados en este repositorio.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión.
- La tabla de divergencia KL está incompleta en la información disponible.
- Riesgo de alucinación, sesgos y restricciones adicionales de uso comercial: no documentados en la información proporcionada; la licencia declarada es Apache 2.0.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pentacoxian-dev/Qwen3.8-27B-YASAKANI-speed-dequant-F16-GGUF
- Modelo base (YASAKANI speed): https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Motor YASAKANI: https://github.com/yasakani-dev/yasakani
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones GSQ-RCO de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
