# OptimaMT/de-fr

## Resumen

OptimaMT/de-fr es una conversión a ONNX del modelo de traducción automática neuronal Xenova/opus-mt-de-fr, que a su vez deriva del modelo OPUS-MT alemán-francés de la Universidad de Helsinki. Se distribuye como un paquete listo para usar con transformers.js y ONNX Runtime, con el objetivo de reducir el consumo de memoria en inferencia sin alterar la salida del modelo original. La única modificación respecto al modelo base es una reestructuración del grafo del decodificador: la proyección de salida se ha sacado de sus dos ramas, lo que permite un decodificador fusionado más ligero.

El modelo mantiene exactamente los mismos pesos, vocabulario y tokenización que Xenova/opus-mt-de-fr (revisión `e783da03d247`), por lo que la calidad de traducción es idéntica. La ganancia está en el uso de memoria: según la model card, tras la carga se pasa de 516 a 277 MiB en Linux (-46 %) y de 493 a 253 MiB en Windows (-49 %) con `disable_quant_qdq = 1`, y de 276 a 217 MiB (-22 %) en Linux con los valores por defecto de ONNX Runtime. Forma parte del proyecto OptimaMT, que cubre 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`.

Es relevante para desarrolladores que necesitan traducción de alemán a francés en entornos con recursos limitados, como navegador, edge computing o servicios con muchas instancias concurrentes, donde una reducción del 20-50 % en memoria por sesión se traduce directamente en menor coste o mayor densidad de despliegue. No es un modelo nuevo entrenado desde cero, sino una optimización de empaquetado y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); `disable_quant_qdq` como opción de sesión |
| Idiomas soportados | alemán (de), francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al base) |

Datos adicionales: vocabulario de 61.153 tokens, tamaño del repositorio de 0,1 GB, pipeline `translation`, librería `transformers.js`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo Marian de OPUS-MT: un transformer encoder-decoder entrenado específicamente para traducción automática entre un par de idiomas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original de la Universidad de Helsinki y no se detallan en la información proporcionada.

La innovación técnica de esta variante es puramente de despliegue: el decodificador fusionado (`decoder_model_merged_quantized.onnx`) se ha reconstruido moviendo la proyección de salida fuera de sus dos ramas, lo que reduce el grafo y el consumo de memoria en tiempo de ejecución. No se ha reentrenado ni modificado ningún peso; el resto de archivos del repositorio son idénticos byte a byte al modelo base. Las mediciones de la model card se realizaron con ONNX Runtime 1.31.1, en CPU, con 4 hilos (Linux nativo, Windows en máquina virtual).

## Capacidades

- Traducción automática de texto de alemán a francés.
- Generación de texto condicionada a la tarea de traducción (pipeline `text2text-generation`).
- Ejecución en navegador y en Node.js mediante transformers.js.
- Ejecución en Python mediante ONNX Runtime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Cuantización q8 para reducir el uso de memoria.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de documentación técnica de alemán a francés en pipelines de CI/CD: el modelo se puede invocar desde un script de Python con ONNX Runtime para traducir ficheros Markdown o mensajes de commit antes de publicarlos, con un consumo de memoria de 217-277 MiB por sesión en Linux.
- Traducción en el navegador: al estar empaquetado para transformers.js, se puede cargar en una aplicación web con `pipeline("translation", "OptimaMT/de-fr", { dtype: "q8" })` y traducir contenido sin enviar texto a un servidor, lo que ayuda con requisitos de privacidad.
- Atención al cliente bilingüe: integrado en un backend de soporte, permite traducir mensajes de usuarios germanohablantes a francés para agentes o sistemas que operan en francés, con baja latencia al ejecutarse en CPU.
- Traducción por lotes de catálogos de producto o fichas técnicas: el bajo consumo de memoria permite ejecutar varias instancias en paralelo en un mismo servidor, aumentando el throughput frente al modelo base.
- Servicios edge o embebidos: al caber en 166-253 MiB según plataforma y configuración, es viable en dispositivos con memoria limitada donde un modelo mayor no cabría.
- Prototipado y evaluación de sistemas multilingües: sirve como componente de traducción en experimentos de investigación donde se necesita un par de idiomas concreto sin depender de APIs externas.
- Traducción de correos o mensajes internos en herramientas de empresa: el despliegue local con ONNX Runtime evita el envío de datos a servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, chrF) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga:

| Configuración | Linux | Windows | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 516 → 277 MiB (-46 %) | 493 → 253 MiB (-49 %) | sí |
| Valores por defecto de ONNX Runtime | 276 → 217 MiB (-22 %) | 194 → 166 MiB (-15 %) | sí |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo es lo suficientemente pequeño como para caber en cualquier GPU con al menos 1 GB de memoria libre, aunque no se proporcionan cifras específicas de VRAM.
- Memoria RAM tras la carga: 166-277 MiB según plataforma y configuración de sesión (datos de la model card).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de gama baja, dado su reducido tamaño.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime en Python, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/de-fr | no disponible | no disponible | de, fr | CC BY 4.0 | ONNX | 166-277 MiB |
| Xenova/opus-mt-de-fr | no disponible | no disponible | de, fr | CC BY 4.0 | ONNX | 194-516 MiB (según configuración) |
| Helsinki-NLP/opus-mt-de-fr | no disponible | no disponible | de, fr | CC BY 4.0 | safetensors/PyTorch | no disponible |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de rendimiento de alternativas de otros proveedores en la información proporcionada. La diferencia principal entre OptimaMT/de-fr y Xenova/opus-mt-de-fr es el consumo de memoria, con salidas idénticas en tokens.

## Limitaciones y advertencias

- Solo traduce de alemán a francés; no es un modelo multilingüe general.
- No se han publicado evaluaciones de calidad de traducción; la fidelidad depende enteramente del modelo OPUS-MT original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (términos técnicos, jurídicos o médicos) no representados en los datos de entrenamiento del modelo base.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, OPUS-MT) y a los autores de la conversión ONNX.
- El modelo está empaquetado para transformers.js y ONNX Runtime; no se distribuyen pesos en safetensors ni en formato PyTorch en este repositorio.
- Las mediciones de memoria de la model card se realizaron en un entorno concreto (ONNX Runtime 1.31.1, CPU, 4 hilos); los resultados pueden variar en otras configuraciones.
- No se documentan sesgos específicos, pero al derivar de OPUS-MT pueden heredarse los sesgos presentes en los corpus de traducción utilizados para su entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/de-fr
- Modelo base (Xenova/opus-mt-de-fr): https://huggingface.co/Xenova/opus-mt-de-fr
- Modelo original (Helsinki-NLP/opus-mt-de-fr): https://huggingface.co/Helsinki-NLP/opus-mt-de-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
