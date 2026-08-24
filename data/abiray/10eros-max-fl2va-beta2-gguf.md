# Abiray/10Eros-Max-fl2va-Beta2-GGUF

## Resumen

10Eros-Max-fl2va-Beta2-GGUF es una colección de cuantizaciones GGUF del modelo de generación de vídeo TenStrip/10Eros-Max, en su versión podada `10Eros_Max_h3_fl2va_beta2_pruned`. El modelo original, desarrollado por TenStrip, se basa en la arquitectura MiniMax-H3 y ha sido sometido a un proceso de "injerto" (grafting) de características procedentes de otros modelos de vídeo como LTX 2.3, Wan 2.2 y Krea 2, con el objetivo de mejorar la calidad visual y de audio sin alterar el comportamiento base de H3.

Esta versión GGUF, publicada por Abiray, está pensada para ejecutarse de forma nativa en ComfyUI mediante el nodo `ComfyUI-GGUF`, permitiendo que GPUs de consumo con 12-16 GB de VRAM puedan ejecutar un modelo que en su formato original supera los 40 GB. El repositorio ofrece siete niveles de cuantización, desde Q3_K_M (8,9 GB) hasta Q8_0 (21,6 GB), con un equilibrio recomendado en Q4_K_M (11,6 GB). El modelo tiene 20.111.438.744 parámetros y admite generación de vídeo a partir de texto, de imagen o de ambas (image-text-to-video).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (híbrida, con capas de atención y bloques H3) |
| Parametros totales | 20.111.438.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con licencias comunitarias adicionales de LTX 2.3, Wan 2.2 y Krea 2 para las porciones de caracter transferidas) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es MiniMax-H3, una arquitectura híbrida que combina mecanismos de atención con bloques H3 (una variante de state space model). Sobre esta base, TenStrip aplicó un proceso de "grafting" (injerto) de características procedentes de otros modelos de vídeo (LTX 2.3, Wan 2.2 y Krea 2), inyectando datos de estos modelos en las capas de atención a bajo nivel para no perturbar la calidad visual y de audio de H3. El autor indica que el entrenamiento de H3 es problemático y que esta rama depende de ajustes futuros de Sulphur H3, por lo que el injerto se realizó como una solución intermedia.

La versión aquí publicada es una variante podada (pruned) y cuantizada a GGUF. El proceso de poda reduce el tamaño del modelo original (más de 40 GB en BF16) a aproximadamente 20 mil millones de parámetros, y la cuantización GGUF permite ejecutarlo en hardware de consumo. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de vídeo a partir de texto e imagen combinados (image-text-to-video).
- Generación de vídeo con audio sincronizado (los vídeos de ejemplo del repositorio incluyen pista de audio).
- Integración nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` de `ComfyUI-GGUF`.
- Soporte de flujo de inferencia tipo flow matching (sampler `euler` / `simple` o `flowmatch`).
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de vídeo, no de un LLM.

## Casos de uso

- Creación de contenido audiovisual para redes sociales: el modelo permite generar clips cortos con audio a partir de una descripción textual o de una imagen de referencia, adecuado para creadores que necesitan prototipos rápidos sin depender de servicios en la nube.
- Previsualización de escenas en producción cinematográfica: los equipos de dirección pueden generar storyboards animados a partir de imágenes fijas o guiones, gracias a la capacidad image-to-video y a la preservación de la física y el texto en cuantizaciones medias como Q4_K_M.
- Generación de vídeos de producto para comercio electrónico: a partir de una fotografía del producto, el modelo puede producir un vídeo corto mostrando el artículo desde distintos ángulos o en movimiento, útil para catálogos dinámicos.
- Prototipado de anuncios publicitarios: los equipos de marketing pueden generar múltiples variantes de un anuncio en vídeo a partir de un brief textual, evaluando rápidamente diferentes enfoques visuales antes de la producción final.
- Investigación en generación de vídeo con modelos híbridos: al ser una implementación abierta de MiniMax-H3 con pesos cuantizados, sirve como banco de pruebas para estudiar el comportamiento de arquitecturas híbridas atención-SSM en tareas de vídeo, sin necesidad de infraestructura de alto coste.
- Generación de vídeos educativos o explicativos: a partir de una imagen o un texto descriptivo, se pueden crear animaciones cortas para material didáctico, aprovechando la ventana de contexto y la calidad de cuantización Q5_K_M o superior para detalles finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas objetivas (como FVD, CLIP score o comparativas con otros modelos) en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q3_K_M (8,9 GB): menos de 12 GB de VRAM.
  - Q4_K_M / Q4_K_S (11,6 GB): 12-16 GB de VRAM (recomendado por el autor).
  - Q5_K_M / Q5_K_S (14,1 GB): 16-24 GB de VRAM.
  - Q6_K (16,7 GB): 24 GB o más.
  - Q8_0 (21,6 GB): 24 GB o más.
- GPUs compatibles: tarjetas de consumo con 12-16 GB de VRAM (p. ej., RTX 3060 12 GB, RTX 4070 Ti 12 GB, RTX 4080 16 GB) para las cuantizaciones bajas; para Q6_K y Q8_0 se requieren GPUs de 24 GB como RTX 3090, RTX 4090 o A5000.
- Despliegue: ComfyUI con el nodo `ComfyUI-GGUF` (por city96). El archivo `.gguf` debe colocarse en `ComfyUI/models/unet` y sustituir el nodo `Load Diffusion Model` por `Unet Loader (GGUF)`.
- Ajustes de inferencia recomendados: 20-30 pasos, CFG scale 3,5-4,5, sampler `euler` con scheduler `simple` o `flowmatch`.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos objetivos de comparación con otros modelos de generación de vídeo (como Wan 2.2, LTX-Video o Krea 2) en la información proporcionada. El propio autor indica que el modelo incorpora características de estos modelos mediante injerto, pero no publica métricas comparativas. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El autor advierte que el entrenamiento de H3 es problemático y que esta rama depende de ajustes futuros; el injerto de características es una solución intermedia que puede presentar inconsistencias en ciertos escenarios.
- Las cuantizaciones bajas (Q3_K_M) pueden degradar detalles finos, texturas y la fidelidad del texto dentro del vídeo.
- No se han publicado datos sobre sesgos del modelo, riesgos de alucinación visual o comportamiento en dominios específicos (rostros, manos, movimiento complejo).
- La licencia es la `minimax-h3-community-license-agreement`, que puede imponer restricciones de uso comercial. Además, al incorporar características de LTX 2.3, Wan 2.2 y Krea 2, las licencias comunitarias de esos modelos se aplican a las porciones de caracter transferidas, lo que puede generar obligaciones adicionales.
- El modelo no es un LLM: no admite tool calling, agentes ni razonamiento simbólico; su única función es la generación de vídeo.
- No se especifican los idiomas soportados para las instrucciones de texto; se asume compatibilidad con inglés, pero no está confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/10Eros-Max-fl2va-Beta2-GGUF
- Modelo base original: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GGUF del mismo autor (versión anterior): https://huggingface.co/Abiray/10Eros-Max-GGUF
- Perfil del autor: https://huggingface.co/Abiray
