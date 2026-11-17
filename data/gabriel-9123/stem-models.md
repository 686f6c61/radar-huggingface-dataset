# Gabriel-9123/stem-models

## Resumen

`Gabriel-9123/stem-models` es un repositorio de modelos en formato ONNX publicado en Hugging Face bajo licencia MIT, orientado a la separación de fuentes (source separation) de audio. El repositorio agrupa pesos de dos sistemas ampliamente conocidos en el ecosistema de separación de stems: Kim Vocal 2, un modelo basado en la arquitectura MDX-Net atribuido a Kimberley Jensen y asociado a Ultimate Vocal Remover, y HTDemucs, el modelo híbrido transformer-convolucional desarrollado por Meta AI Research. El autor del repositorio es Gabriel-9123 y el tamaño total del artefacto es de aproximadamente 0,4 GB.

El interés de este repositorio es práctico más que investigador: empaqueta en ONNX modelos que originalmente se distribuyen en otros formatos (PyTorch, pesos propietarios de UVR), lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch, como aplicaciones de escritorio, navegador o pipelines ligeros en C++/Rust. No obstante, la información publicada es mínima: no hay pipeline declarado, no se especifican idiomas (algo esperable en un modelo de audio), no hay resultados de benchmarks y el repositorio no registra descargas ni interacciones en el momento de la consulta.

La ficha que sigue se basa exclusivamente en los metadatos y en la model card disponible. Cualquier dato no confirmado se marca explícitamente como no disponible para evitar inferencias no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MDX-Net (Kim Vocal 2) y HTDemucs (híbrido transformer-convolucional); pesos en ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantización | no disponible (el repo distribuye ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de separación de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio combina dos familias de modelos de separación de fuentes. Por un lado, Kim Vocal 2 se basa en MDX-Net, una arquitectura de separación en el dominio de la forma de onda o del espectrograma según la variante, orientada específicamente a la extracción de voces frente al acompañamiento instrumental. Por otro, HTDemucs es un modelo híbrido que combina capas convolucionales con mecanismos de atención tipo transformer para modelar dependencias de largo alcance en la señal de audio, y que en su versión original de Meta AI Research separa cuatro stems (voz, batería, bajo y otros).

La información disponible no detalla el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino o destilación. Tampoco se documenta el proceso de conversión a ONNX (versión de opset, herramientas empleadas, posibles pérdidas de precisión). La model card se limita a atribuir la autoría de los modelos originales y a citar las fuentes de las que proceden los pesos.

## Capacidades

- Separación de voces (vocal isolation) mediante Kim Vocal 2 (MDX-Net), pensada para extraer la pista vocal de una mezcla musical.
- Separación multi-stem mediante HTDemucs, con capacidad de aislar hasta cuatro componentes (voz, batería, bajo y otros) en su configuración original.
- Inferencia en formato ONNX, lo que permite ejecución con ONNX Runtime en CPU, GPU o aceleradores compatibles sin depender de PyTorch.
- Procesamiento de audio musical de forma independiente del idioma de la letra.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el repositorio es estrictamente de audio.
- No se documenta soporte de streaming, procesamiento en tiempo real ni ventanas máximas de audio soportadas.

## Casos de uso

- **Karaoke y pistas de acompañamiento**: usar Kim Vocal 2 para aislar la voz de una canción y generar una pista instrumental, o bien conservar la voz para subtitulado o análisis. Es adecuado porque MDX-Net está entrenado específicamente para la tarea vocal/instrumental.
- **Remezcla y producción musical (DJ sets, bootlegs)**: emplear HTDemucs para obtener stems separados de batería, bajo y otros, permitiendo recomponer la mezcla o samplear componentes individuales con mayor control.
- **Preprocesado para transcripción musical o alineación de letras**: extraer la pista vocal antes de pasarla a un sistema de reconocimiento de letras o de alineación forzada, reduciendo la interferencia instrumental.
- **Aplicaciones de escritorio sin dependencia de PyTorch**: al distribuirse en ONNX, el modelo puede integrarse en apps nativas (C++, Rust, C#) mediante ONNX Runtime, reduciendo el tamaño del bundle y las dependencias.
- **Procesamiento por lotes en servidores ligeros**: ejecutar la separación en pipelines de CPU con ONNX Runtime para tareas offline de catalogación de audio o archivado musical.
- **Investigación en separación de fuentes**: servir como referencia comparativa entre MDX-Net y HTDemucs dentro de un mismo entorno de inferencia ONNX, facilitando experimentos reproducibles.
- **Edición de podcasts y vídeo**: aislar voces de grabaciones con música de fondo para mejorar la inteligibilidad antes de la transcripción o la limpieza de ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como SDR, SIR o SAR, ni comparaciones cuantitativas con otros modelos de separación.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio (0,4 GB) sugiere que los pesos en ONNX ocupan un espacio reducido, pero no se especifica el consumo en memoria durante la inferencia.
- **GPU recomendadas**: no disponible. Al ser modelos de audio de tamaño moderado, es plausible que funcionen en GPUs de consumo, pero no hay datos confirmados.
- **Compatibilidad con GPU de consumo**: no confirmada; no se indica si cabe en RTX 4090, RTX 3060 u otras.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU) es la vía natural dado el formato; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Gabriel-9123/stem-models` | MDX-Net + HTDemucs | 1 (voz) y 4 (voz, batería, bajo, otros) | ONNX | MIT | Hugging Face |
| Demucs original (Meta AI) | Híbrido transformer-convolucional | 4 | PyTorch | MIT | GitHub / Hugging Face |
| Kim Vocal 2 (UVR) | MDX-Net | 1 (voz) | Pesos UVR / PyTorch | MIT (según atribución) | Ultimate Vocal Remover |
| Spleeter (Deezer) | U-Net | 2 o 4 | TensorFlow | MIT | GitHub |

No se dispone de métricas comparativas de rendimiento (SDR/SIR) en la información proporcionada, por lo que la comparación se limita a arquitectura, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Información muy escasa**: la model card no documenta parámetros, entrenamiento, métricas ni limitaciones; evaluar su calidad en producción requiere pruebas propias.
- **Riesgo de artefactos**: la separación de fuentes introduce artefactos (coloreado espectral, sangrado entre stems) cuya magnitud no está cuantificada en este repositorio.
- **Sesgo de dominio**: los modelos originales están entrenados sobre música occidental mayoritariamente; su comportamiento en otros géneros o grabaciones de campo no está documentado.
- **Conversión a ONNX no verificada**: no se especifica la versión de opset ni si la conversión preserva la precisión del modelo original; posibles discrepancias numéricas.
- **Licencia MIT**: permite uso comercial, pero la atribución de los modelos originales (Kimberley Jensen, Meta AI Research) debe respetarse; conviene revisar las licencias de los repositorios de origen citados en la model card.
- **Sin mantenimiento aparente**: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte ni actualizaciones.
- **No apto para tareas de texto**: es un modelo de audio; no debe emplearse en casos de uso de lenguaje, razonamiento o código.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gabriel-9123/stem-models
- Fuente citada (Kim Vocal 2 / Kamvox): https://huggingface.co/uddompang/kamvox-voice-separator
- Fuente citada (Demucs web ONNX): https://huggingface.co/timcsy/demucs-web-onnx
- Fuente citada (Audisect): https://huggingface.co/funkzgacilo/audisect
- Ultimate Vocal Remover (proyecto asociado a Kim Vocal 2): https://ultimatevocalremover.com
- Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
