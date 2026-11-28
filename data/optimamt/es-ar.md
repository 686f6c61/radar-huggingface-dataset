# OptimaMT/es-ar

## Resumen

OptimaMT/es-ar es una exportación ONNX optimizada del modelo de traducción automática Helsinki-NLP/opus-mt-es-ar, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de español a árabe y se distribuye a través de la organización OptimaMT, que mantiene una colección de 51 pares de traducción con el mismo formato. Está pensado para ejecutarse en el navegador o en entornos Node.js mediante transformers.js, así como en Python con ONNX Runtime.

La aportación principal de esta variante no es el modelo en sí, sino el empaquetado: se ha reconstruido el decoder fusionado (`decoder_model_merged_quantized.onnx`) para aprovechar el modo rápido de ONNX Runtime mediante `disable_quant_qdq = 1`, lo que reduce el consumo de memoria entre un 46 % y un 48 % en Linux y Windows respectivamente, con una aceleración de 2,3 a 2,5 veces y sin alterar los tokens generados. El resto de ficheros (tokenizer, configuración) se han reescrito en el formato de las exportaciones de Xenova para garantizar la compatibilidad con transformers.js.

Se trata de un modelo Marian de tamaño contenido (repo de 0,1 GB, vocabulario de 62.518 tokens) con licencia CC BY 4.0, lo que lo hace apto para uso comercial con atribución. Su relevancia actual radica en que permite desplegar traducción es-ar de calidad en dispositivos con recursos limitados, incluidos navegadores, sin depender de infraestructura GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | español (es), árabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (con tokenizer en formato Xenova) |

## Arquitectura y entrenamiento

El modelo subyacente es Marian, una arquitectura transformer encoder-decoder desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT de la Universidad de Helsinki para traducción automática neuronal. Esta ficha se basa en la exportación ONNX del checkpoint `Helsinki-NLP/opus-mt-es-ar` en la revisión `76efb7da47ad`, por lo que los detalles de entrenamiento (número de tokens, composición del corpus, técnicas de alineación o fine-tuning) corresponden al modelo original y no se detallan en la información disponible.

La modificación técnica introducida por OptimaMT consiste en mover la proyección de salida del decoder fuera de sus dos ramas (un cambio exclusivamente de grafo) y reconstruir el decoder fusionado cuantizado. Esto permite activar el modo rápido de ONNX Runtime con `disable_quant_qdq = 1`, que evita el procesamiento de los nodos QDQ durante la inferencia. Según la model card, el resultado son exactamente los mismos tokens que el original, con BLEU 10,52 y chrF 43,09 sobre FLORES-200 devtest (1.012 frases) en decodificación greedy. Las mediciones se realizaron con ONNX Runtime 1.31.1 sobre CPU con 4 hilos.

## Capacidades

- Traducción automática directa de español a árabe, con un único par de idiomas.
- Requiere el token de variante de destino `>>ara<<` al inicio de cada entrada para seleccionar la variante árabe.
- Ejecución en navegador y Node.js mediante transformers.js 3.x (la versión 4.3.2 rompe el token, incluso con la exportación original).
- Ejecución en Python mediante ONNX Runtime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Inferencia en CPU con consumo de memoria reducido: 282 MiB en Linux y 260 MiB en Windows tras la carga con el modo rápido, frente a 526 y 502 MiB respectivamente con la configuración por defecto.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento; es un modelo estrictamente de traducción.

## Casos de uso

- Traducción de pantalla en tiempo real: el modelo se usa en producción en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux (desde la versión 0.1.4), donde el bajo consumo de memoria y la ejecución en CPU permiten traducir texto en vivo sin GPU.
- Traducción en el navegador sin backend: gracias a transformers.js y al formato ONNX, se puede integrar en aplicaciones web que traduzcan contenido es-ar en el cliente, eliminando la latencia de red y los costes de servidor.
- Atención al cliente en árabe para usuarios hispanohablantes: traducción de mensajes entrantes y salientes en sistemas de soporte, con un modelo ligero que cabe en memoria junto al resto del stack.
- Localización de documentación y contenido editorial: traducción por lotes de textos es-ar en pipelines de CI/CD mediante el script de Python y ONNX Runtime, sin necesidad de GPU.
- Procesamiento de contenido generado por usuarios: moderación y traducción de comentarios o reseñas en plataformas con audiencia mixta hispano-árabe, donde el coste por inferencia en CPU es mínimo.
- Herramientas de accesibilidad y traducción offline: aplicaciones de escritorio o extensiones que necesiten funcionar sin conexión, ya que el modelo completo ocupa 0,1 GB y se ejecuta en CPU con 4 hilos.
- Investigación en traducción automática de bajos recursos: punto de partida reproducible para experimentos con Marian y exportaciones ONNX optimizadas, con métricas publicadas sobre FLORES-200.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| FLORES-200 devtest (BLEU) | 10,52 | 1.012 frases, decodificación greedy |
| FLORES-200 devtest (chrF) | 43,09 | 1.012 frases, decodificación greedy |
| Aceleración con `disable_quant_qdq = 1` | 2,3–2,5× | ONNX Runtime 1.31.1, CPU, 4 hilos |
| Memoria tras carga (Linux) | 526 → 282 MiB (-46 %) | Modo rápido frente a valores por defecto |
| Memoria tras carga (Windows) | 502 → 260 MiB (-48 %) | Modo rápido frente a valores por defecto |
| Memoria tras carga (Linux, defaults) | 281 → 220 MiB (-22 %) | ONNX Runtime por defecto |
| Memoria tras carga (Windows, defaults) | 197 → 166 MiB (-16 %) | ONNX Runtime por defecto |

Los tokens generados son idénticos a los de la exportación original en todos los casos medidos. No se han publicado comparaciones con otros modelos de traducción es-ar en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- Memoria RAM estimada: en torno a 260–282 MiB tras la carga con el modo rápido de ONNX Runtime (valores medidos en Linux y Windows).
- GPU recomendadas: no aplica; no se han publicado requisitos ni optimizaciones para GPU.
- Cabe en cualquier equipo de consumo: el repo ocupa 0,1 GB y la inferencia se ejecuta en CPU con 4 hilos.
- Opciones de despliegue: transformers.js 3.x (navegador y Node.js), ONNX Runtime en Python (con sentencepiece y numpy), y el script `translate.py` del repositorio del proyecto.
- Latencia y throughput: no se han publicado cifras absolutas de latencia o tokens por segundo; solo la aceleración relativa de 2,3–2,5× frente a la configuración por defecto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/es-ar | Marian | es → ar | no disponible | CC BY 4.0 | ONNX | Decoder fusionado optimizado, modo rápido de ONNX Runtime, uso en navegador |
| Helsinki-NLP/opus-mt-es-ar | Marian | es → ar | no disponible | CC BY 4.0 | safetensors / PyTorch | Modelo original del que deriva; sin la optimización de memoria ni el empaquetado para transformers.js |
| Exportaciones Xenova de opus-mt-es-ar | Marian | es → ar | no disponible | CC BY 4.0 | ONNX | Mismo layout de tokenizer; sin el decoder reconstruido ni el modo rápido |
| Otros pares de la colección OptimaMT | Marian | 51 pares | no disponible | CC BY 4.0 | ONNX | Misma metodología aplicada a otros idiomas |

No se dispone de comparaciones de calidad (BLEU/chrF) con modelos alternativos de traducción es-ar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo par de idiomas: solo traduce español a árabe; no soporta dirección inversa ni otros idiomas.
- Requiere anteponer el token `>>ara<<` a cada entrada; omitirlo puede degradar o invalidar la traducción.
- Incompatibilidad conocida con transformers.js 4.3.2, que divide el token de variante; se debe usar la versión 3.x.
- Calidad moderada: BLEU 10,52 sobre FLORES-200 devtest indica un rendimiento limitado en traducción de textos complejos o de dominio especializado.
- Riesgo de alucinación y de traducciones incorrectas en frases ambiguas, jerga, nombres propios o dialectos árabes no representados en el corpus de entrenamiento.
- Sesgos potenciales heredados del corpus OPUS, que puede sobrerrepresentar ciertos dominios (textos institucionales, subtítulos, web) y desequilibrar el registro.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a la Universidad de Helsinki (pesos OPUS-MT) y al proyecto OptimaMT por la exportación y modificación.
- Los pesos originales no se han reentrenado; las mejoras son exclusivamente de eficiencia (memoria y velocidad), no de calidad.
- No se han publicado datos sobre longitud máxima de secuencia ni sobre el comportamiento con entradas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-ar
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-es-ar
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicación que usa el modelo): https://github.com/AmerAlreyahi/OpenCircle
