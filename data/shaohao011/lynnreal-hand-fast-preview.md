# shaohao011/LynnReal-Hand-Fast-preview

## Resumen

LynnReal-Hand-Fast-preview es un modelo de mundo (world model) generativo de vídeo controlado por manos, desarrollado por shaohao011 y publicado bajo el paraguas del proyecto LynnReal-AI. El modelo parte de una imagen inicial, un prompt de texto, una secuencia de movimiento de manos y una trayectoria de cámara, y genera vídeo de forma causal y por fragmentos (chunk-by-chunk), lo que permite su uso en escenarios de streaming. Se trata de un fine-tune especializado en muestreo (sampling-specialized) del modelo base LynnReal-Hand-Base-1.0.

La arquitectura es un transformer causal autorregresivo de aproximadamente 33.138 millones de parámetros (33B), orientado a la generación de vídeo de pocos pasos (few-step generation): tres pasos de muestreo por fragmento. Incorpora un contexto deslizante W2 (el fragmento actual más el fragmento generado precedente, con un ancla fija en el primer fotograma), un codificador compacto de manos y un decodificador Ultra-Fast-VAE. La resolución de salida por defecto es de 960 × 540 con 17 fotogramas RGB por fragmento completo.

Su relevancia actual radica en que combina tres tendencias de investigación punteras: modelos de mundo para vídeo, generación controlable de alta fidelidad (control de manos y cámara) y generación autorregresiva en streaming con pocos pasos, lo que lo hace apto para aplicaciones interactivas. El modelo reutiliza componentes de acondicionamiento del release oficial de MiniMax H3 (VAE nativa y codificador Qwen de imagen/texto) y se distribuye con licencia comunitaria MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autorregresivo (world model de vídeo) con contexto deslizante W2 y muestreo de pocos pasos |
| Parametros totales | 33.138.827.904 (~33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens; contexto de vídeo W2 (fragmento actual + fragmento previo + ancla del primer fotograma), 17 fotogramas RGB por fragmento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (minimax-h3-community) |
| Formato de pesos | safetensors (repo de 262,2 GB) |

## Arquitectura y entrenamiento

LynnReal-Hand-Fast se construye sobre un backbone transformer causal de 33B especializado en muestreo, derivado por fine-tune del modelo LynnReal-Hand-Base-1.0. La generación es autorregresiva y causal por fragmentos: cada fragmento se condiciona en la historia ya generada, empleando un contexto deslizante W2 que mantiene el fragmento actual y el inmediatamente anterior, junto con un ancla fija del primer fotograma para preservar la coherencia temporal. El modelo opera con un schedule fijo de tres pasos de muestreo y shift 3.

El paquete incluye el transformer especializado en muestreo, los parámetros de acondicionamiento temporal en streaming, la VAE nativa H3, el codificador Qwen de imagen/texto con tokenizer y processor, el scheduler, el codificador compacto de manos (en `hand_encoder/`) y el decodificador Ultra-Fast-VAE (en `decoder/`). Los componentes de acondicionamiento nativos provienen del release oficial de MiniMax H3. Una innovación destacable es la optimización de memoria AdaLN: el transformer incluye únicamente las tablas de modulación AdaLN requeridas por su schedule de muestreo por defecto, omitiendo las matrices de proyección aprendidas por bloque, lo que reduce el tamaño de descarga y la memoria residente de parámetros; cambiar el schedule exige una nueva exportación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) condicionada por prompt de texto.
- Control explícito de movimiento de manos mediante un codificador compacto de manos y una secuencia de vídeo de mano como entrada.
- Control de cámara mediante arrays de poses de cámara alineados.
- Generación causal y autorregresiva por fragmentos, apta para streaming de vídeo.
- Generación de pocos pasos: tres pasos de muestreo por fragmento.
- Salida a 960 × 540 con 17 fotogramas RGB por fragmento completo.
- Soporte de longitudes de entrada de 124, 158, 243 o 260 fotogramas, preservando la tasa de fotogramas de entrada.
- Inferencia estándar y acelerada mediante el runtime LynnReal-Hand (con compilación y captura de CUDA graphs en el primer arranque).
- Comparación visual opcional contra un vídeo de referencia.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Creación de contenido interactivo con avatares: el modelo permite generar vídeo de un personaje cuyas manos siguen una secuencia de movimiento capturada, manteniendo coherencia temporal gracias al contexto W2 y al ancla del primer fotograma.
- Previsualización de animación y storyboard: a partir de una imagen clave y un prompt, se generan fragmentos de vídeo de 17 fotogramas a 960 × 540 para validar encuadres y movimientos de cámara antes de una producción completa.
- Control de cámara virtual en postproducción: los arrays de poses de cámara permiten reproducir trayectorias cinematográficas sobre una escena generada, útil para previsualización de planos.
- Streaming de vídeo generativo en aplicaciones en tiempo real: la naturaleza causal y el rendimiento de 17,94 FPS sostenidos en una H200 lo hacen viable para pipelines de vídeo por fragmentos con baja latencia (0,743 s de respuesta media por fragmento).
- Investigación en modelos de mundo: sirve como banco de pruebas para estudiar generación autorregresiva de vídeo con condicionamiento multimodal (texto, mano, cámara) y contextos deslizantes.
- Prototipado de interfaces humano-máquina: la codificación online de la mano permite mapear gestos capturados a movimientos generados, aplicable a demos de telepresencia o animación dirigida por gestos.
- Evaluación de técnicas de decodificación rápida: la integración de Ultra-Fast-VAE y del path acelerado permite medir compromisos entre latencia, memoria y calidad en generación de vídeo.

## Benchmarks y rendimiento

Datos reportados por el autor para una ejecución en caliente del runtime acelerado a 960 × 540 en una NVIDIA H200, con tres pasos de muestreo, contexto W2 con ancla del primer fotograma y 17 fotogramas RGB por fragmento:

| Metrica | Valor |
|---|---|
| Throughput sostenido | 17,94 FPS |
| Respuesta media por fragmento | 0,743 s |
| Memoria GPU máxima asignada | 34,51 GiB |

Notas metodológicas indicadas por el autor: la medición incluye codificación online de la mano, generación, decodificación y entrega de fotogramas por CPU; el throughput sostenido incluye además las actualizaciones de la caché de historia. La ejecución de referencia usa 243 fotogramas con un calentamiento y tres repeticiones medidas. Se excluyen la preparación de acondicionamiento, la carga de pesos, la compilación, la captura de CUDA graphs, el calentamiento y la codificación MP4. El valor de 34,51 GiB es una medición en caliente, no un requisito de GPU en arranque en frío. El informe técnico reporta un resultado separado de 18,03 FPS. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- El release valida únicamente una NVIDIA H200 visible para el decodificador Fast compilado y el path de inferencia acelerado; otras configuraciones de GPU no están validadas.
- Memoria GPU: 34,51 GiB de asignación máxima en caliente en la configuración de referencia (no es un requisito de arranque en frío). La memoria total depende también de activaciones, cachés y decodificación.
- Entorno de referencia: Linux, Python 3.10, PyTorch 2.9.1 con CUDA 12.8 y FlashAttention-3; FFmpeg para entrada y salida de vídeo.
- La VAE nativa y el codificador Qwen se usan durante la preparación del acondicionamiento y pueden descargarse de GPU (offload) antes de la generación.
- Despliegue: runtime propio LynnReal-Hand (comandos `lynnreal-hand prepare` e `lynnreal-hand infer`, con flag `--accelerated`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,743 s de respuesta media por fragmento y 17,94 FPS sostenidos en H200 (ver sección de benchmarks).
- Tamaño del repo: 262,2 GB.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (world models de vídeo controlables por mano) con parámetros, contexto, rendimiento y licencia verificables. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LynnReal-Hand-Fast-preview | ~33B | W2 (17 fotogramas por fragmento) | 17,94 FPS en H200 | minimax-h3-community | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un release de inferencia con un schedule fijo de tres pasos y shift 3, y contexto W2; cambiar el schedule de muestreo requiere una nueva exportación del modelo.
- Solo se valida una GPU NVIDIA H200; otros entornos no están soportados por esta versión.
- El valor de memoria de 34,51 GiB corresponde a una medición en caliente y no debe interpretarse como requisito de arranque en frío.
- La licencia es "other" bajo el nombre minimax-h3-community; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial y redistribución.
- El modelo reutiliza componentes de MiniMax H3 (VAE nativa y codificador Qwen), por lo que pueden aplicar condiciones adicionales derivadas de dicha licencia.
- No se detallan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- El estado "preview" y el bajo número de descargas (208) y likes (0) sugieren un modelo reciente y poco contrastado por la comunidad.
- La generación está acotada a las longitudes de entrada admitidas (124, 158, 243 o 260 fotogramas) y a la resolución por defecto de 960 × 540.
- No se han publicado resultados de benchmarks estándar en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaohao011/LynnReal-Hand-Fast-preview
- Modelo base: https://huggingface.co/shaohao011/LynnReal-Hand-Base-1.0
- Paper (arXiv): https://arxiv.org/pdf/2611.21479
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.21479
- Vídeo en YouTube: https://youtu.be/OdywWF0srpU
- Repositorio de código: https://github.com/LynnReal-AI/LynnReal
- Guía de inferencia: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/inference.md
- Guía de instalación: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/installation.md
- Preparación de datos: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/data.md
- Metodología de benchmark: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/benchmark.md
