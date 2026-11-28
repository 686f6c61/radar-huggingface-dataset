# OptimaMT/en-nl

## Resumen

OptimaMT/en-nl es un modelo de traducción automática inglés → neerlandés publicado por OptimaMT, un proyecto que redistribuye los modelos OPUS-MT de la Universidad de Helsinki en formato ONNX optimizado para transformers.js. Se trata de una copia directa de Xenova/opus-mt-en-nl (revisión `c3a0541231a7`) en la que únicamente se ha reconstruido el decoder fusionado cuantizado, aplicando el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) para reducir memoria y latencia sin alterar los pesos ni los tokens generados.

El modelo es un MarianMT de tipo encoder-decoder orientado a text2text-generation, con un vocabulario de 67.028 tokens y un tamaño de repositorio de 0,1 GB. Su relevancia actual radica en que permite ejecutar traducción EN→NL en el navegador o en CPU con un consumo de memoria notablemente inferior al del export original, manteniendo traducciones idénticas byte a byte en la salida de tokens.

Forma parte de una colección de 51 pares de idiomas bajo el mismo esquema de nombres `OptimaMT/<src>-<tgt>`, y ya se utiliza en producción en la aplicación de escritorio OpenCircle (traductor de pantalla para Windows y Linux) desde su versión v0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, text2text-generation) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado reconstruido con `disable_quant_qdq = 1` |
| Idiomas soportados | inglés (en) y neerlandés (nl) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MarianMT, un transformer encoder-decoder desarrollado en el marco del proyecto OPUS-MT de la Universidad de Helsinki para traducción automática neuronal. El modelo original fue entrenado sobre datos paralelos multilingües de OPUS; sin embargo, la información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (en modelos de traducción de esta familia es habitual el entrenamiento supervisado puro, pero no se confirma en la documentación disponible).

La innovación técnica de esta variante es exclusivamente de despliegue: se ha movido la proyección de salida del decoder fuera de sus dos ramas (cambio únicamente en el grafo) y se ha reconstruido el decoder fusionado cuantizado aplicando el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`). Según el autor, esto produce una aceleración de 2,3–2,5× y reduce el consumo de memoria aproximadamente a la mitad tras la carga, manteniendo tokens de salida idénticos a los del modelo original. El vocabulario es de 67.028 tokens.

## Capacidades

- Traducción automática directa de inglés a neerlandés (pipeline `translation`).
- Generación de texto seq2seq mediante arquitectura encoder-decoder MarianMT.
- Ejecución en navegador y en Node.js vía transformers.js con pesos ONNX.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Inferencia en CPU con resultados reproducibles respecto al modelo original (mismos tokens).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Cobertura multilingüe limitada estrictamente al par en→nl.

## Casos de uso

- Traducción de pantalla en tiempo real: integrado en OpenCircle para Windows y Linux, traduce texto capturado de la pantalla del usuario con bajo consumo de memoria (270–296 MiB tras la carga con `disable_quant_qdq = 1`), lo que permite mantenerlo residente junto a otras aplicaciones.
- Traducción en el navegador sin backend: al ejecutarse con transformers.js y ONNX, puede desplegarse íntegramente en el cliente, evitando enviar texto del usuario a servidores externos y reduciendo costes de infraestructura.
- Localización de documentación técnica: traducción de manuales, README y documentación de producto del inglés al neerlandés en pipelines de CI, aprovechando el script de Python con onnxruntime para procesamiento por lotes.
- Traducción de contenido web y correos: integración en extensiones o clientes de correo para traducir mensajes EN→NL de forma local, con latencia baja en CPU de 4 hilos.
- Preprocesamiento en pipelines NLP neerlandeses: traducción de corpus ingleses a neerlandés antes de tareas posteriores (análisis de sentimiento, indexación de búsqueda) cuando no se dispone de recursos nativos en neerlandés.
- Aplicaciones de escritorio con recursos limitados: al ocupar menos de 300 MiB tras la carga en el modo rápido, es adecuado para equipos sin GPU dedicada o para entornos embebidos donde el export original resultaría demasiado pesado.
- Evaluación comparativa de exports ONNX: sirve como referencia para medir el impacto de `disable_quant_qdq` en memoria y velocidad frente a Xenova/opus-mt-en-nl, dado que la salida es idéntica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 24,63 |
| FLORES-200 devtest, chrF | 56,57 |
| Decodificacion | greedy |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 557 → 296 MiB (-47 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 533 → 270 MiB (-49 %) |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 230 → 197 MiB (-14 %) |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 206 → 173 MiB (-16 %) |
| Aceleracion del modo rápido | 2,3–2,5× |
| Tokens de salida | idénticos al modelo original |

Entorno de medición: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU. Consumo de memoria RAM tras la carga: 270–296 MiB con `disable_quant_qdq = 1` y 173–197 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no se documentan; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la memoria en ejecución es inferior a 300 MiB, por lo que funciona en portátiles básicos y en el navegador.
- Opciones de despliegue: transformers.js (`@huggingface/transformers` con `dtype: "q8"` y `session_options`), onnxruntime en Python mediante el script `translate.py` del proyecto, o cualquier runtime compatible con ONNX.
- Latencia y throughput: el autor reporta una aceleración de 2,3–2,5× respecto al export original en CPU con 4 hilos, pero no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-nl | MarianMT | en → nl | no disponible | CC BY 4.0 | ONNX (transformers.js) | Decoder fusionado reconstruido, modo rápido ONNX Runtime, 270–296 MiB tras carga |
| Xenova/opus-mt-en-nl | MarianMT | en → nl | no disponible | CC BY 4.0 | ONNX (transformers.js) | Export original del que deriva; mismos pesos y tokens, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-en-nl | MarianMT | en → nl | no disponible | CC BY 4.0 | safetensors / PyTorch | Modelo original de la Universidad de Helsinki; requiere transformers y PyTorch |

## Limitaciones y advertencias

- El modelo solo traduce de inglés a neerlandés; no soporta otros pares ni detección automática de idioma.
- No se documentan evaluaciones de sesgo; al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus paralelos de OPUS.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados, terminología técnica poco frecuente o frases ambiguas; no se han publicado métricas por dominio.
- La longitud máxima de contexto no está documentada en la información disponible, lo que dificulta planificar el truncamiento de entradas largas.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki y export de Xenova) y al proyecto OptimaMT.
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos son copias byte a byte del original, por lo que las limitaciones del export de Xenova se mantienen.
- El modo rápido requiere pasar `disable_quant_qdq = 1` en las opciones de sesión; sin esa configuración, la reducción de memoria es mucho menor (14–16 %).
- Las mediciones de rendimiento se han realizado en CPU con 4 hilos y, en Windows, dentro de una máquina virtual, por lo que los números pueden variar en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-nl
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-nl
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-nl
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Colección de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
