# OptimaMT/pl-en

## Resumen

OptimaMT/pl-en es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-pl-en, que a su vez deriva del modelo OPUS-MT pl-en de la Universidad de Helsinki. El modelo original es un transformer encoder-decoder de arquitectura Marian, especializado en la traducción de polaco a inglés. Esta versión concreta, publicada por OptimaMT, no reentrena ni modifica los pesos, sino que reestructura el grafo ONNX del decoder fusionado para reducir el consumo de memoria en inferencia.

La aportación principal es una optimización de memoria: al mover la proyección de salida del decoder fuera de sus dos ramas (un cambio exclusivamente en el grafo), el modelo reduce el uso de memoria entre un 16 % y un 49 % según la configuración de ONNX Runtime y la plataforma, manteniendo exactamente los mismos tokens de salida. Esto lo hace relevante para despliegues en navegador o en entornos con recursos limitados mediante transformers.js.

Forma parte del proyecto OptimaMT, que agrupa 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`. El modelo está pensado como un reemplazo directo (drop-in) del modelo base de Xenova, con la misma licencia CC BY 4.0 y el mismo vocabulario de 63.430 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | polaco (pl) como origen, inglés (en) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros originales) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, la arquitectura empleada por los modelos OPUS-MT de la Universidad de Helsinki para traducción automática neuronal. El modelo original fue entrenado por Helsinki-NLP sobre datos paralelos de OPUS; esta versión no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta ficha no está en el entrenamiento, sino en la exportación: el decoder fusionado (`decoder_model_merged_quantized.onnx`) ha sido reconstruido moviendo la proyección de salida fuera de sus dos ramas, lo que es un cambio únicamente de grafo. El resto de ficheros son idénticos byte a byte al modelo base Xenova/opus-mt-pl-en en la revisión `aeaf0e003b04`. El resultado son los mismos tokens de salida con menor consumo de memoria. Las mediciones del autor, con ONNX Runtime 1.31.1, CPU y 4 hilos, muestran una reducción de 534 a 286 MiB (-46 %) en Linux y de 509 a 261 MiB (-49 %) en Windows con `disable_quant_qdq = 1`, y de 285 a 224 MiB (-22 %) en Linux y de 200 a 169 MiB (-16 %) en Windows con los valores por defecto de ONNX Runtime.

## Capacidades

- Traducción de texto de polaco a inglés, tarea única para la que está entrenado el modelo.
- Generación de texto seq2seq mediante el pipeline `translation` de transformers.js.
- Ejecución en navegador y en Node.js gracias al formato ONNX y a la librería transformers.js.
- Inferencia en CPU con ONNX Runtime, incluyendo la opción de desactivar QDQ (`disable_quant_qdq = 1`) para reducir memoria.
- Compatibilidad con scripts en Python basados en onnxruntime, sentencepiece y numpy.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par pl-en; no cubre otros idiomas.

## Casos de uso

- Traducción de documentación técnica del polaco al inglés: el modelo puede integrarse en un pipeline de preprocesado que traduzca READMEs, manuales o notas de versión antes de su publicación, aprovechando su bajo consumo de memoria para ejecutarse en el mismo servidor que el resto del pipeline.
- Traducción en el navegador sin backend: gracias a transformers.js y al formato ONNX, se puede cargar el modelo en una aplicación web para traducir texto introducido por el usuario sin enviar datos a un servidor, lo que resulta útil por privacidad y latencia.
- Localización de contenidos de comercio electrónico: traducción de descripciones de producto y fichas técnicas del polaco al inglés en lotes, con un coste de memoria de aproximadamente 286 MiB en Linux con la configuración optimizada.
- Preprocesado para pipelines de NLP: traducción previa de corpus polacos a inglés para alimentar modelos de análisis de sentimiento, clasificación o extracción de entidades entrenados en inglés.
- Atención al cliente en mercados polacos: traducción de mensajes entrantes en polaco a inglés para que un agente o un sistema de ticketing en inglés los procese, con la ventaja de que el modelo cabe en entornos de recursos limitados.
- Herramientas de escritorio y extensiones: integración en aplicaciones de escritorio o extensiones de navegador que necesiten traducción local sin conexión, dado el reducido tamaño del repositorio (0,1 GB) y el bajo uso de memoria.
- Investigación en eficiencia de inferencia: uso como caso de estudio reproducible para medir el impacto de reestructurar el grafo ONNX del decoder en el consumo de memoria, con resultados publicados y comparables entre Linux y Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de memoria tras la carga, no métricas de calidad de traducción (BLEU, COMET u otras):

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 534 → 286 (-46 %) | 509 → 261 (-49 %) | si |
| Valores por defecto de ONNX Runtime | 285 → 224 (-22 %) | 200 → 169 (-16 %) | si |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU y 4 hilos (Windows en una máquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU; el modelo está pensado para CPU. El consumo de memoria en RAM tras la carga es de aproximadamente 169-286 MiB según plataforma y configuración.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y el modelo cargado en memoria no supera los 286 MiB en las mediciones publicadas.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, ONNX Runtime (incluido el script `translate.py` con onnxruntime, sentencepiece y numpy). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; la model card no reporta tiempos de inferencia, solo memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/pl-en | no disponible | no disponible | pl → en | CC BY 4.0 | ONNX | Decoder fusionado optimizado en memoria; mismos tokens que el base |
| Xenova/opus-mt-pl-en | no disponible | no disponible | pl → en | CC BY 4.0 | ONNX | Modelo base del que deriva; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-pl-en | no disponible | no disponible | pl → en | CC BY 4.0 | safetensors (formato original de OPUS-MT) | Modelo original de la Universidad de Helsinki; pesos sin conversión ONNX |

No se dispone de datos de rendimiento (BLEU, COMET) para ninguno de los tres modelos en la información proporcionada, por lo que la comparativa se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción pl → en; no debe usarse para otras tareas ni para la dirección inversa.
- No hay información publicada sobre sesgos del modelo original ni sobre su comportamiento en dominios específicos (legal, médico, técnico).
- Riesgo de alucinación inherente a los modelos de traducción neuronal, especialmente en frases ambiguas, nombres propios o terminología muy especializada.
- La longitud de contexto no está documentada; no se debe asumir una ventana amplia para documentos largos sin verificación previa.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoría; es necesario conservar la atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que no cuenta con validación de la comunidad; conviene evaluar la calidad de traducción en el dominio propio antes de usarlo en producción.
- La optimización de memoria se ha medido únicamente con ONNX Runtime 1.31.1 en CPU con 4 hilos; el comportamiento en otras versiones o configuraciones puede variar.
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son idénticos al modelo base, por lo que las limitaciones del modelo original se mantienen íntegras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/pl-en
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-pl-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-pl-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
