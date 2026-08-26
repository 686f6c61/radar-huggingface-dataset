# 01Yassine/AugAll_SpeechModel

## Resumen

AugAll Speech Model es un detector de voz sintética (deepfake) y de ataques de suplantación (spoof) desarrollado por el autor 01Yassine. El modelo combina un frontend de extracción de características basado en Wav2Vec2 XLS-R-2B de Meta, con un backend de clasificación AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks). Se entrena con una pipeline de aumento de datos completa (denominada AugAll) que concatena rawboost, respuesta de impulso de sala (RIR), ruido y perturbación de velocidad, sobre mezclas de audio universal de deepfake.

El modelo clasifica cada clip de audio de entrada en una de dos categorías: `bonafide` (voz real) o `spoof` (voz falsa o manipulada). Está diseñado para integrarse en sistemas de verificación de locutores y de autenticación biométrica por voz, aportando una capa de defensa contra ataques de suplantación. El checkpoint publicado pesa aproximadamente 25.9 GB e incluye el frontend XLS-R-2B ajustado y la cabeza AASIST. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones adicionales, aunque el frontend XLS-R-2B tiene su propia licencia que debe aceptarse antes de su uso.

El modelo se publica con un script de inferencia de un solo archivo y requiere el framework DeepFense para cargar la arquitectura. Está pensado para desarrolladores e investigadores que trabajan en detección de deep fakes de audio, biometría de voz y seguridad de sistemas de autenticación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 XLS-R-2B (frontend) + AASIST (backend) |
| Parametros totales | No disponible (el checkpoint pesa ~25.9 GB, el frontend XLS-R-2B tiene ~2B parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de audio de 64.600 muestras, ~4 segundos a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo procesa audio, no texto; el frontend XLS-R-2B es multilingüe en voz) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de dos etapas. Primero, un frontend basado en el modelo preentrenado Wav2Vec2 XLS-R-2B de Meta, que extrae representaciones robustas de audio a partir de la señal cruda de 16 kHz. Este frontend se ajusta finamente durante el entrenamiento. Después, un backend AASIST (Áudio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks) procesa las representaciones y produce una salida de dos clases con una pérdida AMSoftmax. La entrada se normaliza a 64.600 muestras (~4 segundos), con padding o truncado según sea necesario.

El entrenamiento se realizó con una pipeline de aumento de datos concatenada (AugAll) que incluye rawboost, respuesta de impulso de sala (RIR), ruido aditivo y perturbación de velocidad. Los datos provienen de mezclas de datos de deep fake de voz universal almacenadas en formato parquet en una ruta local. El checkpoint publicado corresponde a la época 6 del entrenamiento. No se han publicado detalles sobre el número exacto de muestras de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección binaria de audio: clasifica cada clip como `bonafide` (voz real) o `spoof` (voz sintética o manipulada).
- Robustez frente a variaciones acústicas: la amplificación AugAll incluye ruido, reverb y cambios de velocidad, lo que mejora la generalización en entornos reales.
- Entrada de audio flexible: acepta clips de hasta ~4 segundos a 16 kHz mono; clips más largos se truncan y más cortos se rellenan.
- Integración con frameworks de autenticación: se usa como módulo de anti-spoofing en sistemas de verificación de locutor.
- No es un modelo de lenguaje ni de generación de audio: se limita a clasificación binaria.

## Casos de uso

- **Autenticación biométrica por voz en banca**: el modelo se integra en el flujo de verificación de identidad de clientes que usan voz como factor biométrico. Detecta intentos de suplantación con voces sintetizadas o clonadas antes de conceder acceso a cuentas.
- **Filtrado de contenido en plataformas de streaming**: puede analizar audios subidos por usuarios para detectar contenido generado por IA que suplante voces de famosos o políticos, ayudando a cumplir políticas de moderación.
- **Investigación de fraude en telemarketing**: las empresas de seguros y telecomunicaciones pueden usarlo en la revisión de grabaciones de llamadas para identificar posibles estafas con voz clonada.
- **Protección de sistemas de voz en dispositivos IoT**: integración en asistentes de voz o cerraduras inteligentes con control por voz para bloquear comandos de audio sintéticos que intenten engañar al sistema.
- **Auditoría de contenido en periodismo**: los verificadores de noticias pueden procesar audios sospechosos para determinar si son reales o generados por IA, antes de publicar o descartar una fuente.
- **Seguridad en centros de contacto**: los centros de llamadas pueden monitorizar conversaciones en tiempo real para detectar si un interlocutor está usando voz sintética, reduciendo el riesgo de fraude en operaciones de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como EER (Equal Error Rate) o AUC sobre datasets estándar (ASVspoof, In-The-Wild). No se pueden comparar con otros modelos sin datos oficiales.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa ~25.9 GB en precisión FP32. Para inferencia se necesita una GPU con al menos 26 GB de VRAM para cargar el modelo completo; en la práctica, se recomienda una GPU de 40 GB o más para dejar espacio a activaciones y buffers.
- **GPUs recomendadas**: NVIDIA A100 40GB/80GB, H100 80GB, o GPUs de 48 GB como la RTX A6000. En GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) el modelo completo no cabe en FP32; sería necesario cuantizar (no disponible) o usar el modelo en CPU (muy lento).
- **Opciones de despliegue**: el script `infer.py` permite inferencia por línea de comandos con `--device cuda`. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el framework `DeepFense` es necesario para cargar la arquitectura.
- **Latencia y throughput**: no disponible. Se estima que la inferencia de un clip de 4 segundos en una A100 puede ser de unos cientos de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos de detección de deep fakes de audio en términos de rendimiento. Se pueden mencionar alternativas arquitectónicas:

| Modelo | Arquitectura | Tamaño | Licencia | Contexto |
|---|---|---|---|---|
| AugAll Speech Model (este) | Wav2Vec2 XLS-R-2B + AASIST | ~2B (frontend) | MIT | Detección de spoof binaria |
| AASIST (original) | RawNet2 + GAT | ~0.1M | MIT | Detección de spoof binaria |
| RawNet2 | CNN + GRU | ~4.3M | no disponible | Detección de spoof binaria |

AASIST original y RawNet2 son más ligeros y entrenables en GPUs de consumo, pero no tienen el frontend preentrenado de XLS-R-2B, que aporta representaciones robustas multilingües. No hay datos comparativos de rendimiento (EER) publicados para este modelo.

## Limitaciones y advertencias

- **Sesgo en datos**: los datos de entrenamiento provienen de mezclas de deepfakes universales, lo que puede limitar la generalización a ataques no representados en ese conjunto. El rendimiento en condiciones de audio muy diferentes (teléfono de baja calidad, música de fondo) no está documentado.
- **Riesgo de falsos positivos**: el modelo puede clasificar como `spoof` clips de voz reales con alteraciones acústicas (reverb, ruido fuerte), lo que podría interrumpir flujos de autenticación legítimos.
- **Limitaciones de entrada**: el modelo solo procesa clips de hasta ~4 segundos; audios más largos se truncan, lo que puede perder información relevante para la detección.
- **Licencia del frontend**: aunque el modelo está bajo MIT, el uso de Wav2Vec2 XLS-R-2B requiere aceptar la licencia de Meta (CC-BY-NC-SA 4.0 para ciertos usos comerciales). Esto puede limitar el despliegue comercial si no se cumple la licencia del frontend.
- **Dependencia del framework**: el modelo requiere el framework `DeepFense` (no se proporciona el repositorio exacto) para cargar el backend AASIST. Esto añade una dependencia de mantenimiento y puede no estar activamente soportado.
- **Sin cuantización publicada**: no se ofrecen versiones cuantizadas (GGUF, INT8, etc.), lo que limita el despliegue en hardware de consumo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/01Yassine/AugAll_SpeechModel)
- [Frontend Wav2Vec2 XLS-R-2B](https://huggingface.co/facebook/wav2vec2-xls-r-2b)
- [Otro modelo del autor: AudioLLM-Deepfake-Detection](https://huggingface.co/01Yassine/AudioLLM-Deepfake-Detection)
- [Otro modelo del autor: moulsot_v0.1_18000](https://huggingface.co/01Yassine/moulsot_v0.1_18000)
