# infosave/Bonsai-27Bcmf

## Resumen

Bonsai-27Bcmf es una conversión al formato CMF (Cortiq Model Format) del modelo Bonsai-27B de prism-ml, un transformer híbrido de 27.000 millones de parámetros entrenado nativamente a 1 bit según la estirpe BitNet. La conversión, publicada por el usuario infosave, empaqueta los pesos con codificación q1 (1,5 bits por peso, 6 bytes por cada 32 pesos) en un único fichero de 4,75 GB que se mapea en memoria directamente desde disco. Al haber sido entrenado el modelo base a 1 bit, la cuantización q1 es su representación nativa y no una pérdida posterior: la generación es idéntica token a token respecto a la misma versión almacenada a q8.

El interés de esta ficha no reside solo en el modelo, sino en el contenedor: CMF es un runtime en Rust puro que elimina la dependencia de Python, PyTorch o una instalación de CUDA, y que integra pesos, tokenizador y plantilla de chat en un solo fichero con verificación de integridad. Esto permite ejecutar un modelo de 27B en un portátil Apple M4 con 24 GB de RAM a 9–11 tok/s, o en una RTX A5000 a 61 tok/s, con un consumo de memoria cercano al tamaño del fichero gracias al mmap.

El modelo base emplea una arquitectura híbrida con 16 capas de atención completa y 48 capas GatedDeltaNet, y un vocabulario de 248.000 tokens. La licencia Apache-2.0 del modelo base se mantiene en esta conversión, lo que facilita su uso comercial, aunque las capacidades reales del modelo (idiomas, benchmarks, tool calling) no están documentadas en la información disponible y deben validarse empíricamente antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas GatedDeltaNet |
| Parámetros totales | 27B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q1 (1,5 bits por peso, 6 bytes por 32 pesos); el formato CMF soporta además q8, q4 y vbit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (Cortiq Model Format), fichero único de 4,75 GB; modelo base original en safetensors (prism-ml/Bonsai-27B-unpacked) |

## Arquitectura y entrenamiento

El modelo base Bonsai-27B es un transformer híbrido de 27B parámetros que combina 16 capas de atención completa con 48 capas GatedDeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste computacional y de memoria en secuencias largas. El vocabulario es de 248.000 tokens. La característica definitoria es que fue entrenado nativamente a 1 bit (clase BitNet), de modo que sus pesos viven en representación ternaria/binaria de baja precisión desde el entrenamiento y no como resultado de una cuantización posterior.

La conversión a CMF q1 se realizó con la herramienta `cortiq convert --model prism-ml/Bonsai-27B-unpacked --quant q1`, que empaqueta pesos, tokenizador y plantilla de chat en un único fichero con comprobación de integridad y carga perezosa por mmap. El runtime CMF ofrece además una opción de atención O(1) (`--o1`) que convierte la atención en un operador de streaming con memoria constante sin reentrenar ni alterar los pesos, y un sistema de "skills" que permite agrupar especialistas que comparten un modelo base con autoenrutado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat integrada en el propio fichero CMF.
- Modo de completado en crudo (`--raw`) y decodificación greedy determinista.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) con streaming, lo que permite reutilizar SDK y clientes existentes.
- Ejecución en CPU, Metal (Apple Silicon) y CUDA (NVIDIA); backend Vulkan disponible en la misma tarjeta con menor rendimiento.
- Atención O(1) opcional para streaming con memoria constante sin modificar los pesos.
- Sistema de skills para empaquetar varios especialistas sobre una base compartida con autoenrutado.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en portátil de gama alta: un MacBook con M4 y 24 GB ejecuta el modelo completo a 9–11 tok/s con Metal y ~3,2 tok/s en CPU, sin instalar Python, PyTorch ni CUDA; adecuado para asistentes de escritura o análisis de documentos offline con requisitos de privacidad estrictos.
- Despliegue en estación de trabajo con GPU de 24 GB: una RTX A5000 sostiene 61 tok/s de decodificación y 1.027 tok/s de prefill con prompts de 4.096 tokens, suficiente para prototipos de chat interactivo o generación de texto por lotes en local.
- Servicio local compatible con OpenAI: `cortiq serve` expone la API estándar en el puerto 8080, de modo que herramientas como Continue, LangChain o clientes propios apuntan al endpoint sin cambios de código; válido para un único usuario o equipo pequeño, dado que las peticiones se serializan.
- Distribución de modelos en entornos air-gapped: el fichero único de 4,75 GB con integridad verificada y mmap se copia a un equipo sin red y arranca sin dependencias externas, lo que simplifica el despliegue en entornos industriales o de investigación con conectividad restringida.
- Investigación sobre modelos de 1 bit: al ser q1 la representación nativa del checkpoint, permite estudiar el comportamiento de modelos entrenados a baja precisión comparando la salida con la versión q8, que es idéntica token a token, y medir el impacto del formato en velocidad y memoria.
- Integración en aplicaciones móviles o embebidas vía CMF: el runtime Flutter cmfmobile ejecuta ficheros CMF en dispositivo; para este tamaño se requiere una máquina de 16–24 GB, pero el mismo formato y runtime sirven para el modelo hermano Bonsai-1.7B (334 MB) en teléfonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son de rendimiento de inferencia del runtime:

| Plataforma | Modo | Velocidad |
|---|---|---|
| Apple M4, 24 GB | decode con `CMF_GPU=1` (Metal) | 9–11,4 tok/s |
| Apple M4, 24 GB | decode solo CPU | ~3,2 tok/s |
| RTX A5000 24 GB, CUDA | decode | 61,2–61,3 tok/s |
| RTX A5000 24 GB, CUDA | prefill de prompt de 4.096 tokens | 1.027 tok/s (primer token a 4,0 s) |
| RTX A5000 24 GB, CUDA | decode tras prompt de 4.096 tokens | 57,9 tok/s |
| RTX A5000 24 GB, Vulkan | decode | 26,3–26,9 tok/s |
| RTX A5000 24 GB, Vulkan | prefill de prompt de 4.096 tokens | 32 tok/s (primer token a 128 s) |

La memoria residente equivale aproximadamente al tamaño del fichero (4,75 GB) gracias al mmap. El texto greedy producido por la ruta GPU es idéntico al de la CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (transformer híbrido de 27B entrenado a 1 bit), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- No hay datos publicados sobre idiomas soportados, calidad en tareas concretas ni benchmarks; la evaluación debe hacerse empíricamente antes de cualquier uso en producción.
- El servidor `cortiq serve` serializa las peticiones (una a la vez por modelo) y no implementa autenticación: es un servidor local-first, no una pasarela multiinquilino.
- La cuantización q1 está pensada exclusivamente para checkpoints entrenados a 1 bit (clase Bonsai/BitNet); aplicada como cuantización posterior a un modelo convencional destruye la calidad, y el conversor solo la expone como opción explícita.
- El modelo requiere una máquina de 16–24 GB de RAM o VRAM; no es apto para teléfonos ni dispositivos de gama baja, para los que el autor remite a Bonsai-1.7B.
- El backend Vulkan en la RTX A5000 muestra un prefill muy lento (primer token a 128 s con 4.096 tokens) frente a CUDA; conviene usar CUDA cuando esté disponible.
- La ruta GPU y la CPU difieren en el orden de reducción, con la tolerancia habitual de GPU; el autor afirma que el texto greedy es idéntico, pero no se documentan pruebas de estabilidad numérica a largo plazo.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben asumirse los habituales de un modelo de lenguaje sin evaluación publicada.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de una conversión de un modelo de terceros conviene verificar las condiciones del modelo base prism-ml/Bonsai-27B-unpacked.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Bonsai-27Bcmf
- Modelo base (desempaquetado): https://huggingface.co/prism-ml/Bonsai-27B-unpacked
- Repositorio del formato y motor CMF: https://github.com/infosave2007/cmf
- Especificación del formato y guía de skills: https://github.com/infosave2007/cmf/blob/master/docs/SKILLS.md
- Aplicación móvil CMF (Flutter): https://github.com/infosave2007/cmfmobile
- Binarios precompilados: https://github.com/infosave2007/cmf/releases/latest
- Modelo hermano para móviles (Bonsai-1.7B, 334 MB): https://huggingface.co/infosave/Bonsai-1.7Bcmf
