# Hebrish/Boxty-sherpa-onnx-int8

## Resumen

Boxty-sherpa-onnx-int8 es una compilación en formato ONNX con cuantización int8 del modelo Boxty v1.0, un ajuste fino de Parakeet TDT 0.6B v2 de NVIDIA orientado a dictado en inglés. Lo desarrolla Hebrish, un proyecto independiente centrado en reconocimiento de voz para aplicaciones de dictado, y está empaquetado específicamente para el runtime sherpa-onnx, lo que permite desplegarlo en entornos de inferencia ligeros sin depender de PyTorch.

El modelo resuelve el problema del reconocimiento automático de voz (ASR) en inglés con vocabulario técnico, nombres de marcas, números escritos en dígitos y modismos propios del inglés irlandés, sobre la voz de un único hablante. Es la compilación que consume la aplicación Parlance, una herramienta de dictado de código abierto, por lo que su relevancia práctica está ligada a ese ecosistema de aplicaciones.

Arquitectura Parakeet TDT (Token-and-Duration Transducer) con aproximadamente 0,6 mil millones de parámetros, derivada del modelo base de NVIDIA y cuantizada a int8 para reducir el tamaño del repositorio a unos 0,7 GB. El autor marca explícitamente este modelo como obsoleto y recomienda migrar a sus sucesores (Sabich Rolling, Falafel o Fritter), por lo que debe considerarse una versión de referencia y reproducibilidad más que una opción de producción activa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) |
| Parámetros totales | ~0,6 B (heredados de Parakeet TDT 0.6B v2) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (compilación ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (runtime sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo se basa en Parakeet TDT, una arquitectura transducer que predice conjuntamente tokens y duraciones, diseñada por NVIDIA para ASR. Sobre esa base, Hebrish aplicó un ajuste fino para adaptar el reconocimiento a dictado en inglés con vocabulario técnico, marcas comerciales, números en dígitos y expresiones del inglés irlandés, entrenando sobre la voz de un único hablante. La compilación int8 en ONNX se genera a partir de esos pesos ajustados para su uso con sherpa-onnx.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite a la model card del modelo base (`Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent`) para consultar resultados y limitaciones. La innovación técnica principal de esta publicación es el empaquetado: conversión a ONNX y cuantización int8 para inferencia eficiente en CPU y dispositivos de borde mediante sherpa-onnx.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, con salida de transcripción.
- Reconocimiento de vocabulario técnico y nombres de marcas.
- Transcripción de números en formato de dígitos.
- Adaptación a modismos y fraseo del inglés irlandés.
- Optimizado para la voz de un único hablante (no es un modelo multihablante genérico).
- Ejecución mediante sherpa-onnx, con soporte para despliegue en CPU y entornos ligeros.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de ASR.
- No dispone de capacidades multimodales (visión, audio más allá del reconocimiento, etc.).
- Soporte multilingüe limitado al inglés; no cubre code-switching con hebreo (esa función corresponde a otros modelos del mismo autor).

## Casos de uso

- Dictado en aplicaciones de escritorio: integración en la aplicación Parlance, que descarga estos archivos y usa `version.json` para identificar la versión y la ejecución de entrenamiento; adecuado por su formato ONNX listo para sherpa-onnx.
- Transcripción de notas de voz técnicas: el ajuste fino sobre vocabulario técnico y marcas comerciales reduce errores en grabaciones de contenido de ingeniería o producto.
- Dictado de documentación con cifras: la conversión de números a dígitos facilita la transcripción de métricas, versiones y cantidades sin postprocesado.
- Reproducibilidad de experimentos: al ser una versión archivada y estable, sirve para replicar resultados de investigaciones o comparativas que dependan de esta compilación concreta.
- Despliegue en entornos sin GPU: la cuantización int8 y el runtime sherpa-onnx permiten ejecutar ASR en CPU o dispositivos de borde con requisitos de memoria reducidos.
- Mantenimiento de instalaciones existentes: aplicaciones que ya dependen de Boxty pueden seguir funcionando sin cambios mientras planifican la migración a Sabich Rolling o Fritter.
- Pruebas de integración en pipelines de audio: útil como componente de referencia para validar cadenas de captura, preprocesado y transcripción antes de adoptar un modelo sucesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a la model card del modelo base (`Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent`) para consultar resultados y limitaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,6 B de parámetros en int8, el peso de los pesos ronda los 0,6-0,7 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; el runtime sherpa-onnx está orientado a ejecución en CPU, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: sherpa-onnx (runtime principal); la aplicación Parlance consume directamente estos archivos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Boxty-sherpa-onnx-int8 (este) | ~0,6 B | no disponible | en | CC-BY-4.0 | Obsoleto, solo referencia |
| Sabich Rolling (Hebrish) | no disponible | no disponible | en con palabras en hebreo | no disponible | Activo, recomendado para la mayoría |
| Falafel (Hebrish) | no disponible | no disponible | en | no disponible | Activo, orientado a comandos de voz |
| Fritter (Fritter-ASR) | no disponible | no disponible | en | CC-BY-NC-4.0 | Activo, sin code-switching con hebreo |

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el autor: no recibe actualizaciones y se mantiene solo por referencia, reproducibilidad e instalaciones existentes.
- Entrenado sobre la voz de un único hablante, por lo que el rendimiento puede degradarse con otras voces.
- Solo admite inglés; no cubre otros idiomas ni code-switching con hebreo.
- No es un modelo de propósito general: no soporta tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con vocabulario fuera del dominio de entrenamiento.
- Sesgos potenciales derivados de los datos de entrenamiento (una sola voz, dominio técnico y acento irlandés), no documentados en detalle.
- Licencia CC-BY-4.0 para la contribución de Hebrish, con la licencia del modelo base de NVIDIA aplicándose igualmente; el uso se rige además por los términos de uso de Hebrish.
- El autor no está afiliado ni respaldado por NVIDIA.
- Para nuevas implementaciones se recomienda evaluar los modelos sucesores indicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Boxty-sherpa-onnx-int8
- Modelo base (ajuste fino): https://huggingface.co/Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Aplicación Parlance: https://github.com/danielrosehill/Parlance-Dictation
- Términos de uso de Hebrish: https://hebrish.app/terms
- Índice de modelos Hebrish: https://huggingface.co/spaces/Hebrish/Index
- Guía de selección de modelos: https://hebrish.app/models/choose
- Modelo sucesor Sabich Rolling: https://huggingface.co/Hebrish/Sabich-Rolling
- Modelo sucesor Falafel: https://huggingface.co/Hebrish/Falafel
- Modelo sucesor Fritter: https://huggingface.co/Fritter-ASR/Fritter
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
