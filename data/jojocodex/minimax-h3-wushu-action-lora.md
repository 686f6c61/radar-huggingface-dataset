# Jojocodex/minimax-h3-wushu-action-lora

## Resumen
El modelo `Jojocodex/minimax-h3-wushu-action-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base de generación de vídeo texto-a-vídeo Comfy-Org/MiniMax-H3. Su propósito es especializar al modelo base en la generación de secuencias de artes marciales chinas (Wushu/Kung Fu), incluyendo puños, patadas, combinaciones y técnicas de bastón, con un enfoque en la física del movimiento corporal humano.

Desarrollado por el usuario Jojocodex, este adaptador resuelve el problema de que los modelos de vídeo genéricos suelen generar movimientos corporales complejos y rápidos de forma poco realista o borrosa. Al ser un LoRA, es ligero (0.2 GB) y se integra directamente en flujos de trabajo de ComfyUI, lo que permite a desarrolladores y creadores de contenido obtener resultados especializados sin necesidad de reentrenar el modelo base completo. Su licencia Apache 2.0 permite uso comercial, y su fecha de creación es el 16 de agosto de 2026.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (text-to-video) |
| Parametros totales | no disponible (repo de 0.2 GB, solo pesos del adaptador) |
| Parametros activos | no aplica (es un adaptador LoRA, no un MoE) |
| Longitud de contexto | no disponible (entrenado con 90 frames a 24fps, resolución 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de ejemplo en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo `wushu_action_h3_lora_v4_2000_pruned.safetensors`) |

## Arquitectura y entrenamiento
El adaptador es un LoRA con rango (Rank) 16, entrenado sobre el modelo base Comfy-Org/MiniMax-H3. El entrenamiento se realizó con el framework ai-toolkit, durante 2000 pasos, utilizando un dataset compuesto por 455 clips de vídeo seleccionados de artes marciales, sin audio ni narración, a una resolución de 512 píxeles y 90 frames por secuencia a 24 fps.

Una innovación técnica destacable es la poda de las capas `adaln_proj` (417 claves eliminadas). Esta poda se realizó específicamente para garantizar la compatibilidad con el LoRA de aceleración Turbo de MiniMax-H3, lo que permite apilar ambos adaptadores y reducir la latencia de inferencia sin perder la especialización en acciones marciales. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades
- Generación de vídeo texto-a-vídeo especializada en movimientos de artes marciales (Wushu/Kung Fu).
- Tipos de acción soportados: técnicas de puño (punch / fist strike), técnicas de pierna (kick / leg technique), rutinas combinadas (combination / forms) y técnicas de bastón (staff technique).
- Activación mediante descripciones en lenguaje natural en el prompt, sin necesidad de tokens de activación específicos (por ejemplo: `a martial artist performing a powerful roundhouse kick, with explosive force`).
- Compatibilidad con el LoRA de aceleración Turbo de MiniMax-H3 para una inferencia más rápida.
- Integración nativa con ComfyUI mediante el nodo LoraLoader, con una fuerza (strength) recomendada entre 0.8 y 1.0.
- Enfoque en la física del movimiento corporal, priorizando la coherencia del cuerpo humano en movimiento rápido.

## Casos de uso
- Previsualización de coreografías para cine y animación: los directores pueden generar rápidamente storyboards animados de escenas de pelea para evaluar el flujo de la acción antes de la producción real, gracias a la capacidad del modelo para mantener la coherencia física en movimientos rápidos.
- Creación de contenido para redes sociales: los creadores pueden generar clips cortos de artes marciales para plataformas como YouTube Shorts o TikTok sin necesidad de actores, dobles o equipos de grabación, usando prompts descriptivos en inglés.
- Prototipado de escenas de acción para videojuegos: los desarrolladores pueden usar el adaptador para generar vídeos de referencia de animaciones de personajes, sirviendo como base para los equipos de animación 3D o para pruebas de concepto de mecánicas de combate.
- Material de referencia para entrenadores de artes marciales: los instructores pueden generar visualizaciones de técnicas específicas (como patadas giratorias o secuencias de bastón) para mostrar a sus alumnos desde ángulos imposibles de filmar en una clase real.
- Producción de vídeos educativos: se pueden crear materiales didácticos sobre Wushu sin necesidad de grabar a un instructor, describiendo las técnicas paso a paso mediante prompts y generando secuencias de vídeo ilustrativas.
- Generación de secuencias B-roll para documentales: los editores pueden rellenar huecos en documentales sobre artes marciales con metraje de apoyo generado sintéticamente, siempre que se indique claramente su naturaleza artificial.
- Integración en flujos de trabajo de VFX: los estudios pueden usar el adaptador en etapas tempranas de preproducción para reemplazar temporalmente a los dobles de acción, validando ángulos de cámara y ritmo antes de la filmación final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas (como FID, CLIP score o evaluaciones humanas) que comparen este adaptador con otros modelos o con el modelo base sin el LoRA.

## Requisitos de hardware
- El adaptador LoRA en sí es muy ligero (0.2 GB), por lo que el requisito principal de hardware viene determinado por el modelo base Comfy-Org/MiniMax-H3.
- Para el modelo base, se recomienda al menos una GPU con 16-24 GB de VRAM para generar vídeo a resolución 512x512 (por ejemplo, NVIDIA RTX 4090, A100 o H100). No se especifica la VRAM exacta necesaria en la documentación del adaptador.
- El despliegue se realiza principalmente a través de ComfyUI, cargando el archivo `.safetensors` en el directorio `models/loras/`.
- No se proporcionan datos sobre latencia o throughput. El uso del LoRA de aceleración Turbo de MiniMax-H3 puede reducir los tiempos de inferencia, pero no se cuantifica en la información disponible.

## Comparativa con modelos similares
No se han identificado otros LoRA específicos para artes marciales en MiniMax-H3. La comparativa se establece frente al modelo base y alternativas generales de generación de vídeo.

| Modelo | Tipo | Especialización | Licencia | Tamaño |
|---|---|---|---|---|
| Comfy-Org/MiniMax-H3 (base) | Text-to-video | General | Apache 2.0 | No especificado (modelo base grande) |
| Jojocodex/minimax-h3-wushu-action-lora | Adaptador LoRA | Artes marciales (Wushu) | Apache 2.0 | 0.2 GB |
| Stable Video Diffusion | Text-to-video | General / Imagen-a-vídeo | Stability AI Community License | Variable (1.1B - 1.7B) |
| AnimateDiff | Text-to-video | Animación / General | MIT | Variable (adaptadores) |

La diferencia clave frente a modelos generales es que este adaptador no genera vídeo desde cero, sino que modifica el comportamiento de MiniMax-H3 para priorizar la coherencia y calidad en movimientos de combate, un nicho que los modelos generales suelen descuidar.

## Limitaciones y advertencias
- Especialización limitada: el modelo está entrenado únicamente para artes marciales; su uso fuera de este dominio degradará la calidad del vídeo generado.
- Sin validación comunitaria: el modelo tiene 0 descargas y 0 likes en el momento de su publicación, lo que implica que no ha sido probado ampliamente por la comunidad y puede contener fallos no detectados.
- Dependencia del modelo base: requiere descargar e instalar Comfy-Org/MiniMax-H3, cuyos requisitos de hardware y licencia deben verificarse por separado.
- Idioma de los prompts: aunque la licencia es Apache 2.0, los ejemplos y la documentación están en inglés; no se garantiza el soporte multilingüe.
- Riesgo de alucinaciones visuales: como todo modelo de generación de vídeo, puede producir artefactos, miembros deformados o movimientos físicamente imposibles, especialmente en secuencias muy rápidas o con múltiples luchadores.
- Sin benchmarks publicados: no hay métricas objetivas que respalden la calidad del modelo, por lo que su rendimiento real debe evaluarse de forma empírica por cada usuario.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Jojocodex/minimax-h3-wushu-action-lora
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- No se proporcionan enlaces adicionales a papers, blogs o repositorios de código en la información disponible.
