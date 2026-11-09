# AI-KSK/ksk-video-184-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-184-comfyui-workflows` no es un modelo de pesos, sino un repositorio de documentación que acompaña a un episodio divulgativo sobre flujos de trabajo de edición de imágenes en ComfyUI. El autor, AI-KSK, publica aquí la descripción escrita de tres grafos de ComfyUI para edición de una y dos imágenes usando FireRed Image Edit 1.0, combinado con un acelerador Lightning de 8 pasos. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que confirma que no redistribuye los pesos, sino únicamente el README con la explicación de los grafos, los valores de los nodos y una comparación visual de cinco pruebas.

El problema que aborda es el "drift" o deriva en edición de imágenes: al modificar una región enmascarada, el modelo tiende a alterar también zonas no enmascaradas. El autor propone un grafo "anti-drift" que estabiliza las regiones intactas mediante un latente de referencia, y un grafo "divergente" que permite cambios mayores a costa de perder similitud facial. Un tercer grafo cubre la edición con dos imágenes, aunque el propio autor recomienda Qwen 2511 para ese caso.

La relevancia es acotada: se trata de material de referencia para quien quiera reproducir los flujos, no de un modelo publicable. No hay arquitectura propia, ni parámetros, ni datos de entrenamiento; los pesos referenciados pertenecen a FireRed Image Edit 1.0 y a componentes de Qwen Image. La licencia es "other" y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene grafos de ComfyUI, no un modelo propio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8_e4m3fn para FireRed Image Edit 1.0; fp8_scaled para el text encoder Qwen 2.5 VL 7B; bf16 para el LoRA Lightning |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (referenciados, no redistribuidos) |

## Arquitectura y entrenamiento

El repositorio no describe ni entrena ningún modelo. Documenta tres grafos de ComfyUI con 29, 28 y 28 nodos respectivamente, construidos sobre FireRed Image Edit 1.0 como modelo de difusión para edición de imágenes. El pipeline usa `qwen_2.5_vl_7b_fp8_scaled.safetensors` cargado mediante `CLIPLoader` con tipo `qwen_image` como codificador de texto, y `qwen_image_vae.safetensors` como VAE. El acelerador es `Qwen-Image-Lightning-8steps-V2.0 bf16.safetensors`, aplicado con fuerza 1.0 en los grafos de una imagen y 0.66 en el de dos imágenes.

Los parámetros de muestreo son fijos en la documentación: 8 pasos, CFG 1, sampler euler, scheduler simple y denoise 1. El latente vacío es de 928x1664 píxeles. El nodo `ImageScaleToTotalPixels` se mantiene en 1.0 y los escaladores de 3.0 quedan puenteados. La innovación descrita es puramente de orquestación: el grafo anti-drift introduce un latente de referencia para conservar las zonas no enmascaradas, mientras que el grafo divergente relaja esa restricción para permitir ediciones más agresivas. No hay datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO, porque el autor no entrena ningún modelo.

## Capacidades

- Edición de imágenes por máscara sobre una imagen de entrada, con dos variantes de comportamiento: conservadora (anti-drift) y agresiva (divergente).
- Edición con dos imágenes de entrada mediante un tercer grafo, con menor similitud facial según el autor.
- Preservación de regiones no enmascaradas mediante latente de referencia en el grafo anti-drift.
- Aceleración de la inferencia a 8 pasos con CFG 1 mediante Lightning LoRA.
- Codificación de prompts en inglés a través de Qwen 2.5 VL 7B como text encoder.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un pipeline de edición de imagen, no un modelo de lenguaje.
- Capacidad multilingüe: no disponible; el único idioma declarado es inglés.

## Casos de uso

- Retoque fotográfico con preservación de fondo: el grafo anti-drift permite cambiar un objeto o una prenda manteniendo intactos el resto de píxeles de la escena, útil en catálogos de producto donde el fondo debe permanecer idéntico entre variantes.
- Iteración de edición en dos fases: ejecutar primero el grafo anti-drift y, si el cambio resulta demasiado tímido, repetir con el grafo divergente sobre el mismo latente, lo que permite un control gradual del grado de modificación sin reescribir el prompt.
- Prototipado rápido de variantes creativas: el grafo divergente admite cambios de mayor magnitud (pose, iluminación, estilo) para exploración visual antes de fijar una dirección, asumiendo la pérdida de similitud facial documentada.
- Integración en un pipeline de ComfyUI existente: los JSON de flujo se pueden importar en instalaciones locales de ComfyUI y encadenar con nodos propios, lo que facilita incorporar la edición por máscara a flujos ya automatizados.
- Evaluación comparativa de modelos de edición: la comparación de cinco pruebas del autor sirve como plantilla metodológica para contrastar FireRed Image Edit 1.0 con Qwen 2511 en tareas de edición única y múltiple.
- Reproducción de resultados para verificación: al documentarse los valores exactos de nodos, sampler, LoRA y resolución, un tercero puede replicar los grafos y comprobar si las diferencias observadas se deben al modelo o a la implementación en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que su veredicto de cinco pruebas es visual y no está medido con métricas. La única comparación cualitativa aportada es que FireRed Image Edit 1.0 está cerca de Qwen 2511 y no un nivel por encima, y que en edición multi-imagen ganó 2511.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. No se indica el tamaño de FireRed Image Edit 1.0 ni del resto de componentes.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: ComfyUI es el único entorno documentado, con los nodos `CLIPLoader` (tipo `qwen_image`), `ImageScaleToTotalPixels` y el sampler euler/simple a 8 pasos.
- Latencia y throughput: no disponible. Solo se documenta la reducción a 8 pasos de muestreo con CFG 1 gracias al Lightning LoRA, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FireRed Image Edit 1.0 (objeto de los grafos) | Edicion de imagen por difusion | Latente 928x1664 en los grafos documentados | Cercano a Qwen 2511 en edicion simple; inferior en multi-imagen segun el autor | no disponible | Pesos referenciados, no redistribuidos en este repo |
| Qwen 2511 (recomendado por el autor para multi-imagen) | Edicion de imagen | no disponible | Ganador en la comparacion multi-imagen del autor | no disponible | no disponible |
| `AI-KSK/ksk-video-184-comfyui-workflows` | Repositorio de documentacion de grafos ComfyUI | no aplica | No evaluado con benchmarks | other | Publico en Hugging Face, 0 descargas |

No se dispone de datos de parámetros, contexto ni licencia de FireRed Image Edit 1.0 ni de Qwen 2511 en la información proporcionada, por lo que la comparativa se limita a lo que el autor afirma cualitativamente.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni los JSON de los flujos: solo el README con la descripción. Los grafos deben reconstruirse a mano a partir de los valores de nodos documentados.
- El autor advierte que FireRed Image Edit 1.0 está cerca de Qwen 2511, no un nivel por encima, y que en edición multi-imagen pierde frente a 2511.
- Todas las pruebas se hicieron con el acelerador Lightning, que según el propio autor puede introducir inestabilidad adicional; los resultados no reflejan el modelo sin acelerador.
- Solo se compararon ediciones de una imagen; la comparación multi-imagen no está respaldada por la misma batería de pruebas.
- El veredicto de las cinco pruebas es visual y subjetivo, sin métricas ni benchmarks reproducibles.
- La brecha en multi-imagen podría deberse a un problema de implementación en ComfyUI y no al modelo.
- La licencia es "other" y no se detallan sus términos, por lo que no se puede confirmar el uso comercial de los pesos referenciados ni de los flujos.
- El único idioma declarado es inglés; no hay evidencia de soporte para prompts en castellano.
- Riesgo de alucinación visual: no documentado por el autor, pero inherente a los modelos de difusión en edición; no se aportan datos al respecto.
- Sesgos conocidos: no disponible.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-184-comfyui-workflows
- Grafo anti-drift (RunningHub): https://www.runninghub.ai/post/2024514356171509762/?inviteCode=rh-v1111
- Grafo divergente (RunningHub): https://www.runninghub.ai/post/2024514345513787393/?inviteCode=rh-v1111
- Grafo de dos imágenes (RunningHub): https://www.runninghub.ai/post/2024517003498754050/?inviteCode=rh-v1111
- Vídeo en YouTube: https://www.youtube.com/watch?v=luvedSu-t_I
- Vídeo en Bilibili: https://www.bilibili.com/video/BV1R3ZBBrEik
