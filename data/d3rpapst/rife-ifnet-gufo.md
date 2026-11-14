# D3rPapst/rife-ifnet-gufo

## Resumen

RIFE IFNet para gufo es un paquete de pesos convertidos del modelo Practical-RIFE (versiones 4.7 y 4.9), una red neuronal especializada en interpolación de fotogramas de vídeo. El desarrollo original corresponde a hzwer (Practical-RIFE), con base en el artículo RIFE de Huang et al. (ECCV 2022), y esta conversión concreta la publica el usuario D3rPapst para su uso con la herramienta gufo-studio-windows. No es un modelo de lenguaje ni un modelo generativo multimodal: es un componente de visión por computador que sintetiza fotogramas intermedios entre dos imágenes consecutivas para aumentar la tasa de fotogramas de un vídeo.

El problema que resuelve es el de la interpolación temporal de vídeo: a partir de dos fotogramas adyacentes, la red IFNet estima el flujo óptico y genera el fotograma intermedio, permitiendo duplicar o cuadruplicar la tasa de fotogramas de material ya grabado sin necesidad de recaptura. La relevancia de esta publicación es acotada: se trata de una conversión de formato (de `.pth` a `.safetensors` en FP32) de pesos ya existentes, empaquetada para un runtime concreto (gufo) que ejecuta la red de forma nativa sobre HIP en AMD Strix Halo bajo Windows.

La arquitectura es la "4.7" de Practical-RIFE (IFNet), con 124 tensores por checkpoint y un tamaño de fichero de 21,3 MB por variante. No se dispone de datos sobre parámetros totales, longitud de contexto ni idiomas, ya que no son magnitudes aplicables a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IFNet (Practical-RIFE, arquitectura "4.7") |
| Parametros totales | no disponible (124 tensores por checkpoint, fichero de 21,3 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 (safetensors); no se documentan otras precisiones |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT (Copyright (c) 2021 hzwer) |
| Formato de pesos | safetensors (FP32), con metadatos `format=rife-ifnet` y `source=<pth>` |

## Arquitectura y entrenamiento

La red es IFNet, el componente de estimación de flujo de Practical-RIFE, diseñado para interpolación de fotogramas. La conversión conserva la arquitectura "4.7" y los 124 tensores de cada checkpoint (`rife47` y `rife49`), en FP32, con el prefijo `module.` eliminado durante la conversión. Los ficheros `rife47.convert.txt` y `rife49.convert.txt` documentan los nombres y formas de los tensores resultantes. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste posteriores (RLHF/DPO no aplican a este tipo de modelo).

La innovación técnica relevante no está en esta publicación, sino en el modelo original: RIFE (Real-Time Intermediate Flow Estimation) propone una estimación de flujo intermedio en tiempo real, y Practical-RIFE es su implementación práctica. La conversión se realizó con `tools/rife/convert_rife_pth.py` de gufo-studio-windows, que usa únicamente la biblioteca estándar y un unpickler restringido que solo conoce los globales del `state_dict`, de modo que no se ejecuta código del checkpoint durante la carga. Los pesos originales `.pth` provienen de los espejos de descarga que utiliza ComfyUI-Frame-Interpolation; los SHA-256 de los ficheros fuente son `6a8a825a...` (rife47) y `e55fd00f...` (rife49).

## Capacidades

- Interpolación de fotogramas de vídeo: sintetiza fotogramas intermedios entre dos imágenes consecutivas para aumentar la tasa de fotogramas.
- Multiplicador de tasa de fotogramas: admite factores como `--multiplier 4` o un objetivo explícito `--target-fps 60`.
- Ejecución nativa sobre HIP en AMD Strix Halo bajo Windows mediante el runtime gufo.
- Integración con el nodo "RIFE VFI" de ComfyUI en cuanto a valores por defecto.
- Servicio persistente mediante `gufo serve video` con parámetro `rife-model` y TTL configurable.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es exclusivamente un modelo de visión para interpolación temporal.

## Casos de uso

- Aumento de tasa de fotogramas de vídeo grabado: se usa `gufo video-interpolate --model rife49.safetensors --input in.mp4 --output out.mp4 --multiplier 4` para pasar material de 30 a 120 fps, útil en postproducción de vídeo de acción o deportes.
- Conversión a un objetivo de fps concreto: con `--target-fps 60` se normaliza material de distinta procedencia a una tasa común antes de montarlo en un timeline.
- Restauración de fluidez en grabaciones de bajo fps: material capturado a 24 o 15 fps puede interpolarse para suavizar el movimiento en presentaciones o vídeos divulgativos.
- Previsualización de cámara lenta: la interpolación permite generar fotogramas intermedios que, reproducidos a velocidad normal, producen cámara lenta más fluida a partir de metraje estándar.
- Procesado por lotes en un servicio local: mediante `gufo serve video` con `rife-model` apuntando al safetensors y `ttl = 86400`, se puede mantener el modelo cargado y procesar múltiples trabajos desde una carpeta raíz de trabajos.
- Integración en pipelines de ComfyUI: al seguir los valores por defecto del nodo "RIFE VFI", los pesos convertidos encajan en flujos de trabajo existentes de interpolación de vídeo en ese entorno.
- Despliegue en hardware AMD Strix Halo bajo Windows: la ejecución nativa en HIP evita depender de CUDA y permite usar este acelerador integrado para interpolación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño de los pesos (21,3 MB en FP32 por checkpoint) es reducido, pero no se documenta el consumo real del runtime.
- GPU recomendadas: el autor indica ejecución nativa sobre HIP en AMD Strix Halo bajo Windows; no se documentan otras GPU compatibles.
- Cabe en GPU de consumo: no disponible; el runtime gufo documentado apunta a Strix Halo, no a GPU discretas de consumo.
- Opciones de despliegue: gufo (`gufo serve video` con `rife-model`, y CLI `gufo video-interpolate`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIFE IFNet para gufo (esta ficha) | no disponible (21,3 MB FP32) | no aplica | no disponible | MIT | Hugging Face (D3rPapst/rife-ifnet-gufo) |
| Practical-RIFE (hzwer) | no disponible | no aplica | no disponible en esta ficha | MIT | GitHub y espejos de descarga |
| ComfyUI-Frame-Interpolation | no aplica (nodos) | no aplica | no disponible | MIT | GitHub |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, razonamiento, código ni conversación; cualquier evaluación como modelo generativo es inadecuada.
- Riesgo de artefactos en la interpolación: la calidad depende del contenido (movimiento rápido, oclusiones, cambios de escena) y no se documentan métricas de fidelidad.
- Los espejos de descarga de los `.pth` originales no llevan metadatos de licencia propios; la licencia MIT se hereda de Practical-RIFE (Copyright (c) 2021 hzwer), que se incluye como fichero `LICENSE`.
- El uso comercial está permitido por la licencia MIT, pero conviene conservar el aviso de copyright original.
- Compatibilidad limitada al runtime gufo documentado (HIP, AMD Strix Halo, Windows); no se garantiza su funcionamiento en otros entornos sin conversión adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026): no hay evidencia de uso en producción.
- La conversión y la documentación se realizaron con asistencia de IA (Claude Code), según indica el autor; conviene verificar los pesos antes de usarlos en producción.
- No se dispone de información sobre sesgos, ya que no es un modelo de datos textuales.

## Enlaces

- Hugging Face: https://huggingface.co/D3rPapst/rife-ifnet-gufo
- gufo-studio-windows: https://github.com/D3rPapst/gufo-studio-windows
- Practical-RIFE (hzwer): https://github.com/hzwer/Practical-RIFE
- ComfyUI-Frame-Interpolation: https://github.com/Fannovel16/ComfyUI-Frame-Interpolation
- Espejo de pesos rife49: https://huggingface.co/marduk191/rife/resolve/main/rife49.pth
- Artículo RIFE (Huang et al., ECCV 2022): no disponible como enlace en la información proporcionada
