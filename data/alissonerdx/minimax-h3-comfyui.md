# Alissonerdx/Minimax-H3-ComfyUI

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo de generación de video MiniMax H3, desarrollado por Alissonerdx para su uso en ComfyUI. El adaptador, llamado `minimax_h3_lms_v1.0_r64`, tiene como objetivo principal afilar (sharpening) el vídeo de entrada manteniendo una apariencia fotorrealista. En lugar de condicionarse mediante una descripción textual del vídeo, el LoRA usa una guía latente (guide latents) alineada con la línea de tiempo del objetivo, lo que permite una correspondencia píxel a píxel con el clip fuente.

El modelo base MiniMax H3 es un modelo de vídeo de MiniMaxAI; los pesos del modelo se cargan desde el repositorio Comfy-Org/MiniMax-H3. El LoRA está entrenado principalmente para la variante `ref2va` (referencia a vídeo), con soporte limitado para `fl2va`. El repositorio incluye el archivo del LoRA en formato Safetensors, un workflow de ComfyUI preconfigurado y ocho vídeos de comparación antes/después. No se dispone de datos sobre el número de parámetros, la arquitectura del modelo base, ni benchmarks públicos.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base de video MiniMax H3 |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de video, sin contexto textual definido) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el LoRA no procesa texto) |
| Licencia | Apache-2.0 (para el LoRA; el modelo base puede tener otra licencia) |
| Formato de pesos | Safetensors (LoRA); workflow en JSON |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 para el modelo de video MiniMax H3. Se entrenó usando una técnica de guía latente (guide latents) en lugar del nodo nativo de referencia (`MiniMaxH3ReferenceToVideo`). El clip fuente se codifica con el VAE de video y se empaqueta en la secuencia del transformer como un bloque de condicionamiento alineado con la línea de tiempo del objetivo. Tres propiedades definen esta alineación: mismo origen temporal (el fotograma `i` de la guía coincide con el fotograma `i` del objetivo), misma cuadrícula espacial (la guía se codifica a la resolución del objetivo), y no avanza el reloj de referencia, ya que la guía ocupa la línea de tiempo del propio objetivo en lugar de anteponerse a él. Esto elimina el coste posicional en la atención entre guía y objetivo.

Durante el entrenamiento, la guía se mantiene casi limpia (aproximadamente un 0,1% de aumentación de ruido), mientras que el objetivo se ruidifica normalmente. Así el modelo aprende a mapear la guía al objetivo en lugar de denoificar ambos. El codificador de texto nunca ve la guía; solo el caption llega al texto, y el vídeo accede al transformer puramente como latentes. Por tanto, el modelo aprende una correspondencia a nivel de píxel con la fuente, no una paráfrasis de ella. El entrenamiento se realizó con un fork personalizado de ai-toolkit que añadió soporte para guías latentes.

## Capacidades

- Afilado de vídeo (sharpening) preservando el fotorrealismo, mediante la guía latente alineada.
- Condicionamiento sobre el vídeo fuente sin necesidad de describirlo en texto.
- Integración nativa con ComfyUI a través del nodo `MiniMaxH3AddGuide` con `frame_idx = 0`.
- Funciona como una segunda pasada (segunda pasada) para mejorar clips ya generados, aunque también puede usarse para generación directa con resultados diferentes.
- Compatible principalmente con la base `ref2va`; `fl2va` es compatible pero menos probado.
- Incluye un workflow preconfigurado con el nodo externo `AIToolkitMiniMaxH3RefVideo` para reescalado del clip.
- No ofrece capacidades de lenguaje, razonamiento, código, matemáticas, visión, tool calling, agentes ni multi-step reasoning; es exclusivamente un adaptador de video.

## Casos de uso

- Postproducción de vídeo generado: aplicar el LoRA a un clip ya generado con MiniMax H3 para aumentar la nitidez en una segunda pasada, manteniendo la coherencia visual.
- Mejora de calidad en pipelines de ComfyUI: el workflow incluido permite integrar el LoRA en procesos de generación de vídeo con el nodo `Add Guide`, útil para producción de contenido audiovisual.
- Restauración de metraje antiguo o de baja calidad: al condicionar sobre el clip fuente, el modelo puede recuperar detalle sin alterar la identidad del vídeo original.
- Refinado de animaciones generadas por IA: usar el LoRA para afilar texturas y bordes en clips destinados a composición o efecto visual.
- Investigación de técnicas de condicionamiento latente: el mecanismo de guía alineada ofrece un caso de estudio para métodos de control píxel a píxel en modelos de vídeo.
- Comparación de estilos en desarrollo creativo: los vídeos de ejemplo incluidos permiten evaluar rápidamente el efecto del LoRA antes de integrarlo en un flujo de trabajo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM, GPU recomendadas, latencia ni throughput.
- El modelo base MiniMax H3 es un modelo de vídeo de gran tamaño; se requiere un entorno capaz de ejecutarlo en ComfyUI. La VRAM necesaria dependerá de la resolución y la longitud del clip, pero no se dispone de cifras.
- El despliegue se realiza mediante ComfyUI, cargando los pesos base desde Comfy-Org/MiniMax-H3 y aplicando el LoRA.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas públicas con otros LoRA o modelos similares en la información proporcionada.

## Limitaciones y advertencias

- El LoRA está entrenado principalmente para `ref2va`; el uso con `fl2va` es posible pero está menos probado y puede producir resultados distintos.
- Requiere longitudes de clip válidas según la fórmula `17k + 5` fotogramas (5, 22, 39, 56, 73, 90, 107, 124...). Una guía más corta que el objetivo o con una resolución diferente rompe la alineación.
- El uso combinado con el nodo nativo `MiniMaxH3ReferenceToVideo` es opcional y experimental; introducir dos tipos de condicionamiento a la vez puede alterar los resultados de forma impredecible.
- El workflow incluido depende del nodo externo `AIToolkitMiniMaxH3RefVideo` de ostris/ComfyUI-AIToolkit-MiniMaxH3; si no se instala, el workflow no carga tal cual.
- La licencia Apache-2.0 se aplica a este repositorio y al LoRA; el modelo base MiniMax H3 puede tener restricciones adicionales de licencia que deben revisarse para uso comercial.
- No se dispone de información sobre sesgos, riesgos de alucinación visual ni limitaciones idiomáticas específicas del LoRA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pesos para ComfyUI (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Nodo externo AIToolkit: https://github.com/ostris/ComfyUI-AIToolkit-MiniMaxH3
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
