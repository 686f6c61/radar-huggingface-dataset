# OptimaMT/it-en

## Resumen

OptimaMT/it-en es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-it-en, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian de traducción italiano-inglés, empaquetado para su uso con Transformers.js y ONNX Runtime. El autor, OptimaMT, redistribuye los pesos originales sin modificarlos y solo reconstruye el decoder merged quantized para reducir el consumo de memoria en tiempo de ejecución.

La propuesta de valor no es un modelo nuevo, sino una optimización de despliegue: mover la proyección de salida del decoder fuera de sus dos ramas reduce el uso de memoria entre un 49 y un 50 por ciento en Linux y Windows con `disable_quant_qdq = 1`, manteniendo tokens de salida idénticos a los del modelo base. Forma parte de una familia de 49 pares de idiomas bajo el espacio `OptimaMT/<src>-<tgt>`.

Es relevante para desarrolladores que necesitan traducción italiano-inglés ligera en entornos con recursos limitados, especialmente en el navegador o en CPU mediante ONNX Runtime, donde cada decena de megabytes cuenta. La arquitectura subyacente es un transformer encoder-decoder Marian con un vocabulario de 80.379 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX quantized, `dtype: "q8"`) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` y resto de ficheros originales) |

## Arquitectura y entrenamiento

El modelo es un Marian de traducción automática neuronal, una arquitectura transformer encoder-decoder desarrollada originalmente en el contexto del proyecto OPUS-MT de la Universidad de Helsinki. Los pesos proceden de Helsinki-NLP/opus-mt-it-en y fueron exportados a ONNX por Xenova en la revisión `fd0b89b9c052`. El vocabulario tiene 80.379 tokens.

La modificación introducida por OptimaMT es puramente de grafo: la proyección de salida del decoder se ha movido fuera de sus dos ramas, lo que permite al runtime compartir el cálculo y reducir la memoria residente. No hay reentrenamiento, ni ajuste fino, ni cambios en los pesos ni en los tokens. El resto de ficheros del repositorio son idénticos byte a byte a los del modelo base. No se dispone de información sobre el volumen de datos de entrenamiento original, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Traducción de texto italiano a inglés, tarea única del pipeline `translation`.
- Generación de texto secuencia a secuencia con vocabulario de 80.379 tokens.
- Ejecución en navegador mediante Transformers.js y en CPU mediante ONNX Runtime.
- Cuantización INT8 para reducir huella de memoria.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Cobertura multilingüe limitada exclusivamente al par italiano-inglés.

## Casos de uso

- Traducción en el navegador: el modelo puede ejecutarse íntegramente en cliente con Transformers.js, sin enviar texto a un servidor, gracias a su tamaño reducido (0,1 GB de repo) y a la cuantización INT8.
- Traducción por lotes en CPU: con ONNX Runtime y `disable_quant_qdq = 1` el consumo baja a unos 333 MiB en Linux, lo que permite procesar corpus italianos en máquinas sin GPU.
- Localización de documentación técnica: traducción de manuales y README de italiano a inglés en pipelines de CI, integrable mediante el script `translate.py` incluido en el repositorio del proyecto.
- Preprocesado de datos para NLP: conversión de datasets italianos a inglés antes de alimentar modelos downstream que solo aceptan inglés.
- Subtitulado y transcripción: traducción de transcripciones italianas a inglés en flujos de postproducción donde se requiere baja latencia y sin dependencia de API externa.
- Aplicaciones de escritorio y extensiones: al caber en memoria de forma holgada (216 MiB con valores por defecto de ONNX Runtime), es viable en entornos embebidos o aplicaciones Electron.
- Prototipado rápido de sistemas de traducción: sirve como referencia funcional antes de escalar a modelos de mayor tamaño o a APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de memoria:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 648 → 333 (-49 %) | 626 → 311 (-50 %) | si |
| Valores por defecto de ONNX Runtime | 255 → 216 (-15 %) | 231 → 195 (-16 %) | si |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo está pensado para CPU; en GPU el consumo sería mínimo (por debajo de 1 GB).
- GPU recomendadas: no requiere GPU; cualquier GPU con más de 1 GB de VRAM puede ejecutarlo.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso iGPU) y en CPU sin problema.
- Opciones de despliegue: Transformers.js (navegador y Node), ONNX Runtime (Python con `onnxruntime`, `sentencepiece` y `numpy`), y cualquier runtime compatible con ONNX.
- Memoria en carga: 195-216 MiB con valores por defecto y 311-333 MiB con `disable_quant_qdq = 1`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OptimaMT/it-en | no disponible | no disponible | CC BY 4.0 | ONNX (INT8) | Decoder merged optimizado, mismo output que el base |
| Xenova/opus-mt-it-en | no disponible | no disponible | CC BY 4.0 | ONNX | Modelo base del que deriva; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-it-en | no disponible | no disponible | CC BY 4.0 | PyTorch (safetensors/bin) | Pesos originales OPUS-MT, sin exportar a ONNX |

## Limitaciones y advertencias

- Modelo de traducción de un solo par de idiomas: no traduce otros idiomas ni realiza otras tareas.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos Marian, especialmente en frases largas o dominios especializados.
- No se han publicado evaluaciones de calidad (BLEU, COMET) en la información disponible, por lo que no hay garantías cuantificadas de fidelidad.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar a los autores originales (Universidad de Helsinki, Xenova y OptimaMT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-09) es posterior a la actual, lo que sugiere un posible error en los metadatos de Hugging Face.
- Solo se ha reconstruido el decoder merged quantized; el resto de ficheros dependen del modelo base y de su disponibilidad en el Hub.
- El uso de `disable_quant_qdq = 1` requiere configurar `session_options` manualmente; sin esa opción el ahorro es menor.

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/it-en
- Modelo base (ONNX): https://huggingface.co/Xenova/opus-mt-it-en
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-it-en
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
