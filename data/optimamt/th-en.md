# OptimaMT/th-en

## Resumen

OptimaMT/th-en es una reexportación optimizada del modelo de traducción automática Xenova/opus-mt-th-en, que a su vez deriva del OPUS-MT de la Universidad de Helsinki para el par tailandés-inglés. El modelo mantiene exactamente los mismos pesos y vocabulario que el original (62.307 tokens), pero sustituye el decoder fusionado cuantizado por una versión más ligera en la que la proyección de salida se ha sacado de sus dos ramas, lo que reduce el consumo de memoria sin alterar los tokens generados.

La relevancia de esta ficha no reside en una mejora de calidad traduccional, sino en la eficiencia de despliegue: según la model card, la memoria tras la carga baja de 524 a 280 MiB en Linux (-47 %) y de 501 a 260 MiB en Windows (-48 %) con `disable_quant_qdq = 1`, y entre un 16 % y un 22 % adicional con los valores por defecto de ONNX Runtime. Forma parte del proyecto OptimaMT, que cubre 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`.

Se distribuye en formato ONNX para su uso con transformers.js (y con onnxruntime en Python), con licencia CC BY 4.0 heredada de OPUS-MT. Es, por tanto, una opción práctica para traducción tailandés-inglés en entornos con recursos limitados, especialmente en el navegador o en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, en la estela de OPUS-MT de la Universidad de Helsinki. No se ha reentrenado: OptimaMT/th-en es una copia directa de Xenova/opus-mt-th-en en la revisión `7f0406b972f7`, con los mismos pesos y el mismo vocabulario de 62.307 tokens. La única modificación es de grafo: la proyección de salida del decoder se ha movido fuera de sus dos ramas, lo que permite un decoder fusionado más ligero.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card no los detalla y se remite al modelo base. La innovación técnica destacable es exclusivamente de despliegue: la reducción de memoria descrita (hasta un 48 % menos tras la carga) manteniendo tokens idénticos a la versión de referencia, verificada con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traducción automática de tailandés a inglés, tarea principal del pipeline `translation`.
- Generación de texto seq2seq (text2text-generation) mediante arquitectura Marian.
- Ejecución en navegador y en Node.js a través de transformers.js.
- Inferencia en CPU con onnxruntime, sentencepiece y numpy en Python.
- Cuantización q8 para reducir huella de memoria en inferencia.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Cobertura limitada estrictamente al par th→en; no es un modelo multilingüe general.

## Casos de uso

- Traducción de documentación técnica tailandesa: el modelo traduce textos de referencia y manuales del tailandés al inglés en pipelines por lotes, con bajo consumo de memoria que permite ejecutar varias instancias en un mismo servidor.
- Localización de contenido web en el navegador: al estar exportado a ONNX y pensado para transformers.js, puede integrarse en una aplicación web que traduzca comentarios o formularios sin enviar datos a un servidor externo.
- Preprocesado de datasets para NLP: traducción masiva de corpus tailandeses a inglés antes de alimentar modelos de análisis de sentimiento o clasificación, aprovechando el bajo coste por inferencia en CPU.
- Atención al cliente en mercados tailandeses: traducción de mensajes entrantes en tailandés a inglés para que un agente angloparlante los revise, con latencia adecuada en CPU y memoria contenida (280 MiB en Linux con `disable_quant_qdq = 1`).
- Herramientas de traducción asistida en escritorio: integración en editores o utilidades locales que necesiten un motor th→en sin GPU, usando el script `translate.py` con onnxruntime.
- Traducción de reseñas y opiniones de usuarios: procesamiento por lotes de feedback en tailandés hacia inglés para análisis de producto, donde el modelo cabe holgadamente en memoria de un contenedor pequeño.
- Prototipado rápido en entornos sin GPU: al requerir solo CPU y 4 hilos en las pruebas del autor, sirve para validar flujos de traducción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria y equivalencia de tokens:

| Métrica | Linux | Windows | Tokens idénticos |
|---|---:|---:|---|
| Memoria tras carga con `disable_quant_qdq = 1` | 524 → 280 MiB (-47 %) | 501 → 260 MiB (-48 %) | sí |
| Memoria con valores por defecto de ONNX Runtime | 280 → 219 MiB (-22 %) | 199 → 167 MiB (-16 %) | sí |

Condiciones de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU y no requiere GPU.
- Memoria RAM tras la carga: 280 MiB en Linux y 260 MiB en Windows con `disable_quant_qdq = 1`; 219 MiB y 167 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no disponibles ni necesarias; el autor reporta pruebas exclusivamente en CPU.
- Cabe en cualquier equipo de consumo: el tamaño del repositorio es de 0,1 GB y la huella en memoria es inferior a 300 MiB.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, y onnxruntime en Python mediante el script `translate.py` del repositorio OptimaMT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/th-en | Marian (ONNX) | th, en | no disponible | CC BY 4.0 | ONNX | Decoder fusionado optimizado; -47 % de memoria frente al original |
| Xenova/opus-mt-th-en | Marian (ONNX) | th, en | no disponible | CC BY 4.0 | ONNX | Modelo base directo; mismo vocabulario y pesos, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-th-en | Marian | th, en | no disponible | CC BY 4.0 | safetensors/PyTorch | Modelo original de la Universidad de Helsinki; requiere conversión para ONNX |

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad traduccional (BLEU, COMET u otras) en la información disponible; la equivalencia con el modelo base se limita a la identidad de tokens en las pruebas del autor.
- Al ser una copia del modelo base, hereda sus sesgos y sus limitaciones de dominio; no se documentan sesgos específicos.
- Riesgo de alucinación y de traducciones incorrectas en textos técnicos, coloquiales o con jerga, habitual en modelos Marian de tamaño reducido.
- Cobertura limitada al par th→en; no traduce en sentido inverso ni a otros idiomas.
- Longitud de contexto no documentada; no se garantiza el comportamiento en documentos largos.
- Uso comercial permitido bajo CC BY 4.0, con obligación de atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del decoder.
- Solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos son idénticos byte a byte al original, por lo que cualquier limitación del export de Xenova se mantiene.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/th-en
- Modelo base (export ONNX): https://huggingface.co/Xenova/opus-mt-th-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-th-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
