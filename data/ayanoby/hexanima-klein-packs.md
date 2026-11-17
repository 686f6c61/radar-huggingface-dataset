# ayanoby/hexanima-klein-packs

## Resumen

HexAnima Klein Packs es un paquete de pesos convertidos del modelo de generación y edición de imágenes FLUX.3 Image Klein de Black Forest Labs, adaptado por el desarrollador independiente ayanoby para ejecutarse sobre la NPU Hexagon v69 de los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato orientada a un acelerador hardware concreto: los ficheros están pensados para ser descargados y verificados por la aplicación HexAnima (Android), y el propio autor advierte que no son utilizables con otras herramientas.

El modelo subyacente, FLUX.3 Image Klein, es un transformer de difusión de 5.6B parámetros para text-to-image e image-editing, que incorpora un codificador de texto Qwen3-VL-4B (licencia Apache-2.0) para la comprensión de prompts multimodales. La conversión preserva ambas partes y las empaqueta en un repositorio de 9.4 GB con manifiesto y verificación sha256.

Su relevancia es acotada pero específica: demuestra la viabilidad de ejecutar un modelo de difusión de gran tamaño para edición de imágenes en teléfonos de gama alta de 2022 en adelante, sin depender de la nube, mediante cuantización y mapeo a las instrucciones Hexagon. Es un artefacto de despliegue, no un checkpoint de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.3 Image Klein) con codificador de texto Qwen3-VL-4B |
| Parámetros totales | 5.6B (modelo de difusión) + 4B (codificador de texto Qwen3-VL) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (conversión propietaria para Hexagon v69; el repo no detalla el esquema) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial, o comercial solo como Qualifying User); partes Qwen3-VL bajo Apache-2.0 |
| Formato de pesos | no disponible (formato propietario de HexAnima, verificado vía `manifest.json` con sha256) |

## Arquitectura y entrenamiento

El modelo base FLUX.3 Image Klein es un transformer de difusión para generación y edición de imágenes, acompañado de un codificador de texto Qwen3-VL-4B que procesa las instrucciones en lenguaje natural. La conversión de HexAnima no reentrena el modelo: transforma los pesos originales a un formato ejecutable sobre la NPU Hexagon v69, presumiblemente mediante cuantización y reorganización de tensores para las unidades de cómputo del acelerador. El repositorio no publica detalles sobre el esquema de cuantización, el número de tokens de entrenamiento del modelo original ni la composición del dataset.

No se dispone de información sobre el proceso de entrenamiento del FLUX.3 Image Klein en la documentación proporcionada (tokens, composición del dataset, RLHF/DPO). La innovación técnica destacable de este paquete es el propio pipeline de conversión y despliegue: descarga por partes con reanudación y verificación de integridad sha256, orientada a un entorno móvil con memoria y ancho de banda limitados.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el modelo de difusión FLUX.3 Image Klein.
- Edición de imágenes guiada por instrucciones (image-editing), según la etiqueta del pipeline del repositorio.
- Comprensión de prompts mediante el codificador Qwen3-VL-4B, que aporta capacidades multimodales al codificador de texto.
- Ejecución local en dispositivo (on-device) sobre la NPU Hexagon v69 de Snapdragon 8 Gen 1 / 8+ Gen 1.
- Descarga y verificación de integridad de pesos mediante la app HexAnima (`manifest.json`, sha256).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Generación de imágenes offline en Android: la app HexAnima descarga los packs una vez y ejecuta la inferencia en la NPU local, permitiendo crear imágenes sin conexión ni envío de prompts a servidores externos.
- Edición de fotos en el dispositivo: el modelo acepta instrucciones de edición sobre una imagen de entrada, útil para aplicaciones de retoque que requieren privacidad y baja latencia al no salir del teléfono.
- Prototipado de aplicaciones móviles de IA generativa: desarrolladores que quieran evaluar el rendimiento de un modelo de difusión de 5.6B sobre Hexagon v69 pueden usar este paquete como referencia de despliegue.
- Investigación en inferencia eficiente en móvil: sirve para medir consumo, latencia y calidad de un modelo FLUX convertido a un acelerador NPU concreto, comparándolo con ejecuciones en GPU o CPU.
- Demos de privacidad por diseño: escenarios donde el contenido generado o las imágenes de entrada no pueden abandonar el dispositivo (sanidad, educación, entornos corporativos restringidos).
- Integración en flujos de creación de contenido móvil: generación de variaciones o ediciones rápidas dentro de apps de diseño o mensajería, siempre que se cumpla la licencia FLUX Kommunity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU objetivo: Qualcomm Hexagon v69 (Snapdragon 8 Gen 1 y 8+ Gen 1).
- VRAM/RAM estimada: no disponible; el repo ocupa 9.4 GB en almacenamiento, por lo que se requiere espacio libre suficiente en el dispositivo para la descarga y la ejecución.
- GPU recomendadas: no aplica; el paquete está orientado exclusivamente a la NPU Hexagon v69 y no es utilizable con otras herramientas según el autor.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no disponible; el formato no está pensado para ellas.
- Opciones de despliegue: únicamente la app HexAnima (https://github.com/ayanoby/hexanima); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| HexAnima Klein Packs (este) | 5.6B + 4B | no disponible | FLUX Kommunity (no comercial / Qualifying User) | Solo app HexAnima en Hexagon v69 | Conversión para NPU móvil, no usable en otros entornos |
| FLUX.3 Image Klein (original) | 5.6B + 4B | no disponible | FLUX Kommunity | GPU con frameworks estándar | Modelo base sin conversión; requiere hardware de escritorio o servidor |
| Alternativas de difusión para móvil | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El paquete no es utilizable con herramientas distintas de la app HexAnima; no funciona en vLLM, llama.cpp, ComfyUI ni pipelines estándar de difusión.
- Licencia FLUX Kommunity: uso no comercial, o comercial solo si se cumple la condición de Qualifying User; es imprescindible revisar `LICENSE` y `NOTICE.md` antes de cualquier despliegue comercial.
- El modelo es una versión modificada del FLUX Model; los términos de la licencia original se aplican a la conversión.
- Las partes Qwen3-VL están bajo Apache-2.0, con condiciones distintas al resto del paquete.
- Proyecto independiente y no oficial, sin afiliación con Black Forest Labs ni con el equipo de Qwen; no hay garantías de soporte o mantenimiento.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo base en la información disponible.
- Restricción hardware severa: solo Snapdragon 8 Gen 1 / 8+ Gen 1 (Hexagon v69); no se indica compatibilidad con generaciones posteriores.
- El tamaño de 9.4 GB puede ser problemático en dispositivos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-klein-packs
- Repositorio de la app HexAnima: https://github.com/ayanoby/hexanima
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Licencia FLUX Kommunity: incluida en el repositorio como `LICENSE`
- Aviso de atribución: incluido en el repositorio como `NOTICE.md`
