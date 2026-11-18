# hik45258/minimax-h3-wushu-action-lora

## Resumen

MiniMax-H3 Wushu Action LoRA es un adaptador de bajo rango (LoRA) para el modelo de generación de vídeo texto-a-vídeo MiniMax-H3, publicado por el usuario hik45258. Su propósito es especializar el modelo base en la generación de secuencias de artes marciales y combate cuerpo a cuerpo: puñetazos, patadas, técnicas con bastón y espada, y coreografías de wushu. El repositorio contiene dos adaptadores entrenados de forma independiente, cada uno con su propio token de activación y su propia estructura de prompt recomendada.

El modelo base, Comfy-Org/MiniMax-H3, es un generador de vídeo a partir de texto; este LoRA no modifica la arquitectura subyacente, sino que añade un sesgo de estilo y movimiento sobre ella. El adaptador se distribuye con licencia Apache 2.0 y un tamaño de repositorio de 0,5 GB, lo que sugiere pesos en precisión reducida o únicamente los tensores del adaptador. No se dispone de información sobre el número de parámetros del adaptador ni del modelo base en la documentación proporcionada.

La relevancia de esta ficha es acotada: se trata de un adaptador comunitario, con cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y con documentación exclusivamente en chino e inglés. Resulta útil para quien ya trabaje con MiniMax-H3 en ComfyUI y necesite generar contenido marcial con un control de prompt muy detallado, pero no constituye un modelo generalista ni compite en la categoría de modelos de vídeo completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3, generador texto-a-vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (los archivos citados en la model card son `.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA convencional aplicado sobre MiniMax-H3, un modelo de difusión para generación de vídeo. La model card documenta dos adaptadores distintos: el primero, `wushu_action_h3_lora_v5`, entrenado durante 3000 pasos con captions de la clase FIGHT que comienzan siempre por el token `wushu_action`; el segundo, `KungFu_MiniMaxH3_LoRA_step4500.safetensors`, entrenado con 4500 pasos sobre un conjunto de material recopilado de forma independiente y activado por el token `kungfu combat`. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, el tamaño de lote ni la tasa de aprendizaje.

La innovación técnica es limitada y de carácter práctico: el autor documenta una biblioteca de palabras clave extraída de los captions de entrenamiento, organizada en cuatro bloques (sujeto, técnica y transferencia de peso, escena y cámara, y términos de calidad), y recomienda una estructura de prompt de cuatro segmentos. También advierte de que los LoRA de aceleración de 4 y 8 pasos producen ocasionalmente imágenes borrosas, y sugiere combinar el adaptador a intensidad 0,5 con un `spatial-physics-lora` a 0,3 para mejorar la física del combate. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de vídeo texto-a-vídeo de secuencias de combate: puñetazos, patadas, combinaciones rápidas, patadas giratorias y saltos con golpe en el aire.
- Técnicas con armas: esgrima con espada (cortes y estocadas), manejo de bastón con giros y golpeo, y lanza.
- Combate entre dos o más sujetos: intercambio de golpes, bloqueos y contraataques, con descripción de impacto y retroceso.
- Control de la mecánica corporal mediante vocabulario específico: transferencia de peso, rotación de cadera y hombros, postura de arco baja (gong bu), paso adelante en estocada.
- Control de encuadre y cámara: plano medio, plano de cuerpo entero, cámara estable, ángulo dinámico.
- Estilización por escenario: gimnasio interior, dojo, arena exterior, bosque de bambú, patio de templo, callejón urbano nocturno, campo de batalla.
- Soporte de prompt negativo para suprimir artefactos (desenfoque, miembros extra, manos deformadas, movimiento congelado, parpadeo).
- No se documenta soporte de tool calling, razonamiento multi-paso, audio ni modo thinking; son capacidades ajenas al dominio del modelo.

## Casos de uso

- Previsualización de coreografías de artes marciales: un director o coreógrafo puede generar variantes de una secuencia de puñetazos y patadas con el token `wushu_action` y el bloque de técnica y transferencia de peso, y evaluar el resultado antes de rodar. La estructura de prompt de cuatro segmentos permite iterar sobre el movimiento sin tocar la escena ni el encuadre.
- Prototipado de escenas de acción para cine o serie: con el adaptador `kungfu combat` y modificadores como `cinematic action`, `dramatic lighting` o `dust and motion blur`, se obtienen planos de referencia con estética de blockbuster para presentar a producción.
- Generación de contenido para videojuegos: secuencias de combate para animáticas, tráilers internos o material de marketing de un título de artes marciales, usando el control de cámara (plano medio, ángulo dinámico) para ajustar el resultado al estilo del juego.
- Contenido para redes sociales y canales de artes marciales: clips cortos de demostración de técnicas, con encuadre de cuerpo entero y fondo de dojo o gimnasio, generados a partir de descripciones textuales de la técnica concreta.
- Ilustración de material didáctico de wushu: descripciones de posturas y desplazamientos (gong bu, rotación de cadera) traducidas a vídeo de referencia para explicar la mecánica de un movimiento a alumnos.
- Exploración de estilo visual: combinación del LoRA con otros adaptadores, como el `spatial-physics-lora` a 0,3 recomendado por el autor, para comparar la física del impacto entre distintas configuraciones antes de fijar un pipeline de producción.
- Generación de escenas de multitud: el prompt de ejemplo de batalla épica con decenas de combatientes y cámara de grúa permite generar planos amplios de confrontación para maquetas o animáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,5 GB) corresponde a los pesos del adaptador, no al modelo base; la VRAM necesaria vendrá determinada por MiniMax-H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base MiniMax-H3.
- Opciones de despliegue: el adaptador está pensado para ComfyUI, dado que el modelo base referenciado es `Comfy-Org/MiniMax-H3` y la librería declarada es `minimax-h3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a difusión de vídeo.
- Latencia y throughput: no disponible. El autor menciona que los LoRA de aceleración de 4 y 8 pasos producen ocasionalmente imágenes borrosas, lo que implica que el pipeline admite inferencia de pocos pasos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3 Wushu Action LoRA (este) | LoRA sobre MiniMax-H3 | no disponible | no disponible | Apache 2.0 | Dos adaptadores, 3000 y 4500 pasos; 0 descargas |
| MiniMax-H3 (Comfy-Org/MiniMax-H3) | Modelo base texto-a-vídeo | no disponible | no disponible | no disponible en la información | Modelo sobre el que se aplica el adaptador |
| spatial-physics-lora | LoRA complementario | no disponible | no disponible | no disponible | Citado por el autor como combinación recomendada a 0,3 |

No se dispone de información sobre otros LoRA de artes marciales para MiniMax-H3 ni sobre modelos de vídeo comparables en tamaño y tarea, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Documentación exclusivamente en chino e inglés, sin versión en castellano; los prompts de ejemplo y la biblioteca de palabras clave están pensados para esos idiomas.
- El autor advierte de que los LoRA de aceleración de 4 y 8 pasos producen ocasionalmente imágenes borrosas al combinarse con este adaptador.
- El adaptador está entrenado con captions de un dominio muy concreto (artes marciales); fuera de ese dominio su efecto es incierto y no se documenta.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia cuantificada de calidad, coherencia temporal ni fidelidad al prompt.
- Cero descargas y cero valoraciones en el momento de la consulta; no hay validación por parte de la comunidad.
- Riesgo de alucinación visual y de artefactos anatómicos (miembros extra, manos deformadas, cuerpos que se transforman), que el propio autor intenta mitigar con una lista de prompts negativos.
- La licencia Apache 2.0 del adaptador no aclara las condiciones del modelo base MiniMax-H3; es necesario verificar la licencia de este último antes de un uso comercial.
- No se especifican requisitos de hardware ni compatibilidad con herramientas de despliegue distintas de ComfyUI.
- El repositorio contiene dos adaptadores con tokens de activación distintos (`wushu_action` y `kungfu combat`); usar el token equivocado reduce o anula el efecto del adaptador correspondiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hik45258/minimax-h3-wushu-action-lora
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Vídeo de comparación con LoRA: https://cdn-uploads.huggingface.co/production/uploads/6a6748afef317ed5adb30050/3i3_sJ_BULn85mn6UlTIN.mp4
- Vídeo de comparación sin LoRA: https://cdn-uploads.huggingface.co/production/uploads/6a6748afef317ed5adb30050/JRyBD2AZXWIgXE0zDA7Uu.mp4
