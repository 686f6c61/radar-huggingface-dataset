# MATLOWAI/H3-Dials

## Resumen

H3-Dials es un conjunto de ficheros de steering («dials») creados por MATLOWAI para el modelo de generación de vídeo MiniMax H3 de MiniMaxAI. No se trata de un modelo nuevo ni de un fine-tune tradicional: cada dial es un fichero de unos 14 KB, calculado sin entrenamiento a partir de pares de prompts, que define una dirección en el espacio de prompts procesados de H3. Al aplicarlo con una intensidad positiva o negativa, desplaza cada generación hacia uno u otro lado del par (por ejemplo, de «escena congelada» a «movimiento enérgico», o hacia distintos tonos de villanía).

El problema que resuelve es la falta de control fino en MiniMax H3: al ser un modelo destilado de guidance (sin CFG), los prompts negativos no funcionan, y los LoRA exigen entrenamiento. Los dials devuelven ese control bidireccional en ambos sentidos, sin entrenar nada y en alrededor de un minuto de cómputo por dial. Son compatibles con el modelo base de H3 y con Pika H3 Flex (6 pasos), y se aplican mediante los nodos de ComfyUI del repositorio ComfyUI-Dials.

El repositorio incluye un dial de movimiento (freeze ↔ zoomies), una versión LoRA equivalente y un pack de ocho dials de «villanía» (siniestro, inquietante, frío, desquiciado, seductor, corrupto, amenazante y pícaro). Es una herramienta creativa de nicho, relevante para quien ya genere vídeo con H3 en ComfyUI y quiera modular atmósfera y movimiento de forma determinista y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ficheros de steering (direcciones en el espacio de prompts procesados de MiniMax H3), no un modelo |
| Parametros totales | ~14 KB por dial (diferencia de sesgo sobre `condition_proj` en la variante LoRA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no aplicable (no son pesos de modelo) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (heredada de MiniMaxAI/MiniMax-H3) |
| Formato de pesos | safetensors (dials y variante LoRA) |

## Arquitectura y entrenamiento

Un dial es un vector de dirección con signo que se suma a cada token del prompt en el punto donde el DiT de H3 lee el texto. Se calcula a partir de pares de prompts (por ejemplo, «sujeto quieto/posando/congelado» frente a «sujeto corriendo/saltando/moviéndose con energía») sin ningún paso de entrenamiento ni gradiente. El dial de movimiento se construyó con 24 pares (8 sujetos × 3 formulaciones), con un acuerdo entre pares de 0,78. Existen dos formatos: dial tipo hook (se aplica tras el text refiner de H3, mediante los nodos Load Dial → Apply Dial de ComfyUI-Dials) y variante LoRA (diferencia de sesgo en `condition_proj`, cargable con el nodo estándar Load LoRA en modo model-only, con aproximadamente 0,6× del efecto por unidad, por lo que se recomienda usar ~1,6× de intensidad).

El pack de villanía se generó con «debias» activado, de modo que cada sabor es una dirección propia independiente del movimiento. En cuanto al modelo base, MiniMax H3 es un sistema de generación de vídeo con DiT y generación de audio, guidance-distilled (sin CFG), lo que explica por qué los prompts negativos no operan y por qué los dials recuperan ese tipo de control. Los dials también funcionan sobre Pika H3 Flex (6 pasos) sin cambios, y el repositorio incluye flujos de trabajo con «de-rope» (re-renderizado ralentizado de tramos que se mueven demasiado rápido para el frame rate, manteniendo el audio original).

## Capacidades

- Steering sin entrenamiento del estilo y la atmósfera de vídeos generados con MiniMax H3, con intensidad ajustable como un deslizador (valores negativos y positivos).
- Control de movimiento: de escenas casi congeladas tipo cinemagraph (0,05× del movimiento base en −2) a escenas con zoom acelerado (≈2,7× en +2).
- Ocho direcciones de «villanía» independientes: siniestro, inquietante, frío, desquiciado, seductor, corrupto, amenazante y pícaro, con rango útil de +1 a +2 y extremo en +4.
- Compatibilidad con Pika H3 Flex (6 pasos) sin modificación, conservando prompt y personajes; rango útil allí de +0,5 a +1.
- Integración con ComfyUI mediante los nodos ComfyUI-Dials (Load Dial → Apply Dial) o carga como LoRA estándar.
- Creación de dials propios a partir de pares de prompts en aproximadamente un minuto, con los pares de ejemplo incluidos en `example_pairs/`.
- Flujos de trabajo preparados con de-rope para Pika H3 Flex, con y sin de-rope.

## Casos de uso

- Cinemagraphs y planos casi estáticos: aplicando el dial de movimiento en −2 se obtienen escenas con un 0,05× del movimiento base, útil para fondos animados sutiles o retratos congelados.
- Secuencias de acción intensa: con el dial de movimiento en +1 a +2 (≈2,7× de movimiento en el modelo base) se generan escenas con mucha actividad manteniendo el mismo prompt y semilla.
- Dirección de arte de villanos: los ocho dials del pack permiten modular la atmósfera de un personaje (menaza con sombras, sonrisas inquietantes, frialdad calculadora, seducción siniestra) sin reescribir el prompt.
- Generación rápida de borradores con Pika H3 Flex: en 6 pasos y con de-rope, un clip a 1280x704 tarda unos 5,5–6 minutos en una RTX PRO 6000 Max-Q, comparable a un render de 25 pasos del modelo base.
- Recuperación del control tipo prompt negativo: como H3 no tiene CFG, los dials ofrecen control bidireccional equivalente para suprimir o reforzar cualidades.
- Prototipado de dials personalizados: un equipo puede crear direcciones propias (por ejemplo, «épico» frente a «cotidiano») a partir de sus pares de prompts en un minuto, sin GPU de entrenamiento.
- Comparativas A/B reproducibles: al depender solo de la semilla y la intensidad, los dials permiten aislar el efecto de una dirección con el mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) por no ser aplicables a este artefacto. Los datos cuantitativos del propio repositorio son:

| Metrica | Valor |
|---|---|
| Acuerdo entre pares del dial de movimiento | 0,78 |
| Movimiento relativo en dial −2 | 0,05× del base |
| Movimiento relativo en dial +2 | ≈2,7× del base |
| Efecto de la variante LoRA | ≈0,6× por unidad (usar ~1,6× de intensidad) |
| Movimiento extra en Pika con dial +0,5 / +1,0 | +20 % / +23 % (movimiento de cámara eliminado) |
| Whisper WER del audio con dial `evil_sinister` a +2 | 0,84 (frente a 0,00 en base) |
| Tiempo de render, Pika con de-rope, 1280x704 | ≈5,5–6 min (RTX PRO 6000 Max-Q) |
| Tiempo de render, base 25 pasos sin de-rope, 1280x704 | ≈5,5 min |

## Requisitos de hardware

- No requieren entrenamiento ni GPU dedicada para crearse: un dial se calcula en aproximadamente un minuto.
- Para inferencia, los requisitos son los del modelo base MiniMax H3 o Pika H3 Flex en ComfyUI; no disponible un detalle de VRAM específico para los dials (ocupan ~14 KB).
- Referencia del autor: renders a 1280x704 en una RTX PRO 6000 Max-Q, con clips de Pika con de-rope en unos 5,5–6 minutos.
- Despliegue: ComfyUI con los nodos ComfyUI-Dials (github.com/matlowai/ComfyUI-Dials); la variante LoRA se carga con el nodo estándar Load LoRA (model only).
- Latencia y throughput: no disponible más allá de los tiempos de render indicados arriba.

## Comparativa con modelos similares

| Caracteristica | H3-Dials (steering) | LoRA entrenado | Prompt negativo (modelos con CFG) |
|---|---|---|---|
| Entrenamiento | Ninguno (calculado de pares de prompts) | Requiere entrenamiento | No aplica |
| Tamano | ~14 KB por dial | Decenas–cientos de MB | No aplica |
| Control bidireccional | Sí (signo del dial) | Sí, vía intensidad | Solo supresión |
| Compatible con H3 (sin CFG) | Sí | Sí | No (H3 es guidance-distilled) |
| Requiere referencias visuales | No | No | No |
| Ecosistema | ComfyUI-Dials | Cargadores LoRA estándar | Nativos del sampler |

No hay otros repositorios de dials comparables publicados; no disponible una comparativa con artefactos equivalentes de terceros.

## Limitaciones y advertencias

- Los dials del pack de villanía se han verificado solo en un conjunto reducido de escenas; el propio autor los presenta como herramientas creativas, no como controles fiables en producción.
- El dial `evil_sinister` degrada gravemente el audio: Whisper WER de 0,84 a +2 frente a 0,00 en base; conviene mantenerlo bajo si hay diálogo.
- El dial `evil_unhinged` produce gritos y gestos de intimidación agresiva incluso a +2 (sin gore observado), lo que exige revisión de contenido.
- En Pika H3 Flex, intensidades altas degradan la fidelidad: +1,5/+2 restagean la escena y morfan personajes, y +3 pierde el prompt.
- La variante LoRA tiene ≈0,6× del efecto por unidad; hay que compensar la intensidad (~1,6×).
- Licencia: hereda la minimax-h3-community-license-agreement de MiniMax H3; revisar sus términos antes de cualquier uso comercial.
- Algunos vídeos de demostración usaron una redacción anterior del prompt de ejemplo; re-renderizados con la redacción actual están pendientes.
- Riesgo de sesgo/alucinación: no disponible (no es un modelo de lenguaje); los efectos sobre contenido fuera de los escenarios probados no están documentados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MATLOWAI/H3-Dials
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodos de ComfyUI: https://github.com/matlowai/ComfyUI-Dials
- Workflows de Pika H3 Flex + Dials: https://github.com/matlowai/ComfyUI-Dials#pika-h3-flex--dials
- Comparativa «qué es un dial»: https://github.com/matlowai/ComfyUI-Dials#what-a-dial-is-and-what-it-is-not
- Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
