# OptimaMT/ru-fr

## Resumen

OptimaMT/ru-fr es un modelo de traducción automática neuronal para el par de idiomas ruso → francés, distribuido en formato ONNX y optimizado para su ejecución con Transformers.js y ONNX Runtime. No se trata de un modelo entrenado desde cero, sino de una copia derivada de Xenova/opus-mt-ru-fr (revisión `c7275f468246`), que a su vez es la exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. La modificación introducida por OptimaMT se limita al decodificador fusionado cuantizado: se ha reconstruido `decoder_model_merged_quantized.onnx` para aplicar el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el consumo de memoria entre un 47 % y un 49 % en Linux y Windows respectivamente, y acelera la inferencia entre 2,3 y 2,5 veces, manteniendo exactamente los mismos tokens de salida.

El modelo emplea la arquitectura Marian (transformer encoder-decoder) propia de la familia OPUS-MT, con un vocabulario de 64 377 tokens y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la gama ligera. Está pensado para despliegues en cliente, aplicaciones de escritorio y entornos sin GPU, y de hecho se usa en producción en OpenCircle, un traductor de pantalla para Windows y Linux. Su relevancia actual radica en que demuestra que es posible reducir a la mitad el uso de memoria de un modelo de traducción cuantizado sin alterar la calidad de la traducción, un aspecto crítico cuando el destino es el navegador o el escritorio.

La licencia es CC BY 4.0, heredada de los pesos originales de OPUS-MT, y el modelo solo cubre la dirección ruso → francés. No incorpora capacidades de razonamiento, tool calling ni multimodalidad: es un traductor especializado y acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decodificador fusionado cuantizado |
| Idiomas soportados | ruso (origen), francés (destino) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` y resto de ficheros del export original) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder clásico diseñado específicamente para traducción automática, tal como se distribuye en la familia OPUS-MT de la Universidad de Helsinki. El vocabulario consta de 64 377 tokens. El modelo no ha sido reentrenado por OptimaMT: los pesos son idénticos a los de Xenova/opus-mt-ru-fr en la revisión `c7275f468246`, que a su vez proviene de Helsinki-NLP/opus-mt-ru-fr.

La única modificación técnica es un cambio de grafo: la proyección de salida del decodificador se ha movido fuera de sus dos ramas, y se ha reconstruido únicamente el fichero `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son byte a byte los originales. Con el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) el modelo pasa de 540 a 288 MiB en Linux (-47 %) y de 515 a 262 MiB en Windows (-49 %), con una aceleración de 2,3 a 2,5 veces. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que el modelo card no los detalla y se remite al modelo base.

## Capacidades

- Traducción de texto ruso → francés, única dirección soportada.
- Generación de texto secuencial token a token mediante decodificación greedy (los resultados reportados emplean greedy).
- Ejecución en navegador y en Node.js mediante Transformers.js, y en Python mediante onnxruntime, sentencepiece y numpy.
- Inferencia en CPU sin necesidad de GPU, con cuantización q8.
- Salida idéntica en tokens a la del modelo base Xenova/opus-mt-ru-fr, incluida la versión con los valores por defecto de ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de pantalla en aplicaciones de escritorio: OpenCircle, traductor de pantalla para Windows y Linux, integra estos modelos desde la versión v0.1.4; la reducción de memoria a 288 MiB en Linux y 262 MiB en Windows permite mantenerlo cargado en segundo plano sin penalizar el resto de la aplicación.
- Traducción en el navegador sin backend: con Transformers.js y `dtype: "q8"`, el modelo puede ejecutarse del lado del cliente para traducir contenido ruso a francés sin enviar texto a un servidor, lo que resulta adecuado para documentos sensibles.
- Procesamiento por lotes de corpus rusos: el script `translate.py` basado en onnxruntime permite traducir ficheros completos en CPU; la aceleración de 2,3–2,5× reduce el tiempo de procesamiento de grandes volúmenes.
- Traducción de documentación técnica y contenidos web: el par ruso → francés cubre la localización de manuales y artículos para audiencias francófonas, con una calidad medida de BLEU 24,43 y chrF 52,95 en FLORES-200 devtest.
- Integración en pipelines de CI/CD de localización: al ser un artefacto ONNX ligero (0,1 GB) y determinista (mismos tokens que el original), puede incorporarse a pruebas automatizadas de traducción sin depender de servicios externos.
- Aplicaciones de mensajería o chat con traducción en tiempo real: la baja latencia en CPU y el reducido consumo de memoria permiten traducir mensajes entrantes en ruso a francés dentro de un cliente de escritorio o una extensión.
- Prototipado e investigación en traducción automática: sirve como referencia ligera para comparar configuraciones de ONNX Runtime (modo rápido frente a valores por defecto) sin cambiar los pesos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU (greedy) | 24,43 |
| FLORES-200 devtest (1.012 frases) | chrF (greedy) | 52,95 |
| Memoria tras carga, Linux | `disable_quant_qdq = 1` | 540 → 288 MiB (-47 %) |
| Memoria tras carga, Windows | `disable_quant_qdq = 1` | 515 → 262 MiB (-49 %) |
| Memoria tras carga, Linux | valores por defecto de ONNX Runtime | 287 → 224 MiB (-22 %) |
| Memoria tras carga, Windows | valores por defecto de ONNX Runtime | 199 → 168 MiB (-16 %) |
| Velocidad | `disable_quant_qdq = 1` | 2,3–2,5× más rápido |
| Fidelidad de salida | Comparación con el original | tokens idénticos |

Mediciones realizadas con ONNX Runtime 1.31.1, en CPU y con 4 hilos (Linux; Windows en una máquina virtual). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de traducción.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. El consumo de memoria RAM tras la carga es de 288 MiB en Linux y 262 MiB en Windows con `disable_quant_qdq = 1`, y de 224 MiB y 168 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no disponibles ni necesarias; el modelo card solo documenta ejecución en CPU con 4 hilos.
- GPU de consumo: no se reportan pruebas en RTX 4090, RTX 3090 u otras; el modelo cabe holgadamente en cualquier equipo por su tamaño (0,1 GB de repositorio).
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) en JavaScript, y onnxruntime con sentencepiece y numpy en Python mediante `scripts/translate.py`.
- Latencia y throughput: no se publican cifras absolutas de latencia ni de tokens por segundo; solo el factor de aceleración relativo de 2,3–2,5× frente a la configuración original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-fr | no disponible | no disponible | ru → fr | CC BY 4.0 | ONNX (Transformers.js) | Decodificador fusionado optimizado; 288 MiB en Linux; BLEU 24,43 en FLORES-200 |
| Xenova/opus-mt-ru-fr | no disponible | no disponible | ru → fr | CC BY 4.0 | ONNX (Transformers.js) | Modelo base del que deriva; mismos tokens; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-ru-fr | no disponible | no disponible | ru → fr | CC BY 4.0 | PyTorch (safetensors/binario) | Pesos originales de OPUS-MT; requiere conversión para ONNX |
| Otros pares de OptimaMT (51 pares) | no disponible | no disponible | distintos pares | CC BY 4.0 | ONNX | Misma metodología de optimización aplicada a otros idiomas |

No se dispone de datos de benchmarks de modelos alternativos de traducción en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y consumo de memoria.

## Limitaciones y advertencias

- Solo traduce en la dirección ruso → francés; no soporta la dirección inversa ni otros pares.
- No se documentan sesgos específicos, pero al heredar los pesos de OPUS-MT puede reproducir los sesgos presentes en los corpus de entrenamiento originales, que no se detallan.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, jurídico, médico) no cubiertos por los datos de entrenamiento; la calidad medida (BLEU 24,43) es moderada.
- Longitud de contexto no documentada; no se garantiza un comportamiento correcto con entradas largas.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación.
- La optimización depende de una opción específica de ONNX Runtime (`disable_quant_qdq = 1`); sin ella, la mejora de memoria se reduce al 22 % en Linux y al 16 % en Windows.
- El modelo card indica que solo se reconstruyó el decodificador fusionado cuantizado; cualquier uso que requiera otros ficheros ONNX del export original debe verificarse contra la revisión `c7275f468246`.
- No hay información sobre el rendimiento en GPU ni sobre latencia absoluta, lo que dificulta planificar despliegues con requisitos estrictos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-fr
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-ru-fr
- Pesos originales de OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección con los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
