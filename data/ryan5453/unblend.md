# Ryan5453/unblend

## Resumen

`unblend` es un repositorio de artefactos de modelo para la librería homónima, una herramienta de separación de fuentes de audio musical (stems) diseñada para Python y navegador. El repositorio publica pesos en formato Safetensors y grafos ONNX listos para ejecución en navegador mediante ONNX Runtime Web y WebGPU, con soporte para tres arquitecturas principales: HTDemucs (desarrollada por Meta), BS-RoFormer y Mel-Band RoFormer. Todos los modelos operan a 44.1 kHz y permiten extraer componentes como voz, batería, bajo, guitarra, piano y otros.

La relevancia de este proyecto radica en su enfoque dual: ofrece una API Python para integración en pipelines de procesado de audio y, al mismo tiempo, proporciona artefactos ONNX optimizados para ejecución en el navegador, lo que permite construir aplicaciones web de edición musical sin necesidad de servidores dedicados. El repositorio incluye verificación de integridad mediante SHA-256 y documentación detallada de uso y exportación. El tamaño total del repositorio es de 10,1 GB, que incluye todos los modelos y variantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs, BS-RoFormer, Mel-Band RoFormer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio, ventana temporal no especificada) |
| Tipos de cuantizacion | FP32, FP16 (solo en variantes ONNX de reduccion de tamano) |
| Idiomas soportados | no disponible (modelo de audio, sin texto) |
| Licencia | other (codigo MIT; pesos HTDemucs sin licencia explicita; RoFormer CC-BY-NC-SA-4.0) |
| Formato de pesos | Safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas de separación de fuentes. HTDemucs, desarrollada por Alexandre Défossez y Meta, es una red basada en Demucs con una estructura híbrida que combina capas convolucionales y transformadoras. Sus pesos fueron entrenados con el dataset MUSDB18-HQ y material propietario adicional, y se distribuyen en precisión FP16 (la original de Meta). BS-RoFormer y Mel-Band RoFormer son variantes basadas en RoFormer, una arquitectura de transformer con atención lineal, entrenadas para separación de stems específicos. Los pesos de estos dos modelos están etiquetados como CC-BY-NC-SA-4.0 y se distribuyen en FP32.

La innovación principal de `unblend` no está en el entrenamiento, sino en la integración: exporta los modelos a grafos ONNX con dos variantes (FP32 y FP16) para reducir el tamaño de descarga en el navegador. La variante FP16 no realiza cómputo en FP16 nativo; los pesos se almacenan en FP16 y se convierten a FP32 antes de la inferencia para evitar degradación numérica audible en ONNX Runtime Web/WASM. Todos los artefactos están registrados con su tamaño y SHA-256 en el repositorio de GitHub para verificación de integridad.

## Capacidades

- Separación de fuentes musicales a 44.1 kHz en stems: voz, batería, bajo, otros, guitarra y piano, según el modelo elegido.
- Soporte de múltiples arquitecturas: HTDemucs (4 stems, 6 stems y variante fine-tuned), BS-RoFormer (6 stems) y Mel-Band RoFormer (2 stems).
- Ejecución en Python mediante la librería `unblend` y en navegador a través de un paquete npm con ONNX Runtime Web y WebGPU.
- Formatos de exportación ONNX FP32 y FP16 para optimizar la transferencia.
- Verificación de integridad de descargas mediante SHA-256 tanto en Python como en el paquete web.
- Documentación completa de API y notas de exportación ONNX en el repositorio de GitHub.

## Casos de uso

- Creación de pistas de karaoke: extraer la voz de una canción para generar una versión instrumental, usando HTDemucs o BS-RoFormer con salida de stems de voz y otros.
- Remezcla y producción musical: separar batería, bajo, guitarra y piano para remezclar o aislar elementos en una producción, gracias a la salida de 6 stems de HTDemucs_6s o BS-RoFormer.
- Restauración de audio: aislar componentes específicos para limpiar grabaciones antiguas o reducir ruido, aunque la separación imperfecta puede introducir artefactos.
- Análisis musical automático: extraer stems para estudiar la estructura de una canción, por ejemplo, analizar la línea de bajo o la batería por separado.
- Aplicaciones web de edición de audio: integrar el modelo en el navegador con WebGPU para permitir a usuarios separar stems sin enviar audio a un servidor, aprovechando los artefactos ONNX.
- Investigación en separación de fuentes: comparar el rendimiento de las arquitecturas HTDemucs y RoFormer en diferentes materiales de audio, usando la API Python y los scripts de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas como SDR (Signal-to-Distortion Ratio) o evaluaciones frente a otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM o GPU en la documentación del repositorio.
- Para inferencia en Python, se recomienda una GPU con soporte CUDA para un rendimiento razonable, aunque el tamaño exacto de memoria depende del modelo y la precisión. Dado que los pesos HTDemucs se distribuyen en FP16, una GPU con al menos 4 GB de VRAM podría ser suficiente para los modelos de 4 stems, pero no hay confirmación oficial.
- Para inferencia en navegador, la documentación advierte que se requiere memoria sustancial y que puede ser lento en dispositivos no compatibles o con poca memoria. WebGPU es necesario para un rendimiento aceptable.
- Opciones de despliegue: API Python con la librería `unblend`, paquete npm para navegador, y ejecución de grafos ONNX con ONNX Runtime (Python o Web). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dentro del propio repositorio se pueden comparar las arquitecturas incluidas:

| Modelo | Stems | Licencia de pesos | Disponibilidad Python | Disponibilidad navegador |
|---|---|---|---|---|
| HTDemucs (4 stems) | drums, bass, other, vocals | Sin licencia explicita | Sí | Sí |
| HTDemucs_ft (4 stems) | drums, bass, other, vocals | Sin licencia explicita | Sí | No |
| HTDemucs_6s (6 stems) | drums, bass, other, vocals, guitar, piano | Sin licencia explicita | Sí | Sí |
| BS-RoFormer-SW (6 stems) | bass, drums, other, vocals, guitar, piano | CC-BY-NC-SA-4.0 | Sí | Sí |
| Mel-Band RoFormer (2 stems) | vocals, other | CC-BY-NC-SA-4.0 | Sí | Sí |

Frente a alternativas externas como Spleeter (Deezer) o Open-Unmix, no se dispone de datos comparativos de rendimiento en este repositorio. La principal diferencia es la orientación a navegador y la variedad de arquitecturas, pero no se pueden establecer comparaciones cuantitativas sin benchmarks publicados.

## Limitaciones y advertencias

- La separación de fuentes es imperfecta: puede producir bleed (fugas entre stems), artefactos o pérdida de contenido, dependiendo del material de origen y la arquitectura seleccionada.
- Los pesos de HTDemucs no tienen una licencia explícita identificada; no se debe asumir que la licencia MIT del código se aplica a los pesos. El uso comercial puede ser riesgoso sin autorización.
- Los pesos de BS-RoFormer y Mel-Band RoFormer están bajo CC-BY-NC-SA-4.0, lo que prohíbe el uso comercial y exige atribución y compartir bajo la misma licencia si se modifican.
- La inferencia en navegador requiere memoria sustancial y puede ser lenta en dispositivos con soporte WebGPU limitado o poca RAM.
- Las variantes ONNX FP16 reducen el tamaño de descarga pero no garantizan menor consumo de memoria en tiempo de ejecución, ya que ONNX Runtime puede materializar constantes FP32 al crear la sesión.
- No se especifican datos sobre sesgos o comportamiento en idiomas, al tratarse de un modelo de audio sin componente lingüístico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ryan5453/unblend
- Repositorio GitHub (proyecto unblend): https://github.com/Ryan5453/unblend
- README y guía rápida de Python: https://github.com/Ryan5453/unblend/blob/main/readme.md
- Referencia de API Python: https://github.com/Ryan5453/unblend/blob/main/api.md
- Notas de exportación y runtime ONNX: https://github.com/Ryan5453/unblend/blob/main/onnx.md
- Documentación del paquete npm para navegador: https://github.com/Ryan5453/unblend/blob/main/web/demucs/README.md
