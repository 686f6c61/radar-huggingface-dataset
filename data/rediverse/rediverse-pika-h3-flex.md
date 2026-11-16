# ReDiverse/ReDiverse-Pika-H3-Flex

## Resumen

ReDiverse-Pika-H3-Flex es un adaptador LoRA de rango 32 desarrollado por el grupo ReDiverse (University of Illinois at Urbana-Champaign, fal y Johns Hopkins University) que se apila sobre el modelo de generacion de video texto-a-video Pika H3 Flex. Su objetivo es corregir la perdida de diversidad entre semillas que sufren los generadores de video destilados de pocos pasos: Pika-Flex, al generar video con audio sincronizado en solo seis pasos de muestreo, produce clips casi identicos ante ruido inicial distinto. El adaptador restaura variabilidad entre semillas sin modificar el modelo base.

Tecnicamente, el LoRA se entrena para igualar las activaciones del profesor (MiniMax-H3) en los bloques hasta `transformer_blocks.45`, siguiendo la receta del adaptador ReDiverse-MiniMax-H3. Se activa unicamente durante el primer paso de muestreo; los cinco restantes ejecutan Pika-Flex sin cambios. El resultado es un fichero de 612 MB (`rediverse_ft.safetensors`) que se apila sobre el LoRA de Pika, no sobre el modelo base directamente.

El modelo es relevante para investigadores que trabajen en destilacion de difusion, control de diversidad en generadores de video y analisis de activaciones internas. Su uso esta restringido por la licencia MiniMax H3 Community, que excluye explicitamente la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos, y se limita a fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre bloques de un transformer de difusion (Pika H3 Flex, derivado de MiniMax-H3) |
| Parametros totales | no disponible (adaptador LoRA; fichero de 612 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (Model Derivative de MiniMax H3, solo investigacion) |
| Formato de pesos | safetensors (`rediverse_ft.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado a los bloques del transformer de difusion de Pika H3 Flex hasta `transformer_blocks.45`. Pika H3 Flex es a su vez un ajuste fino de MiniMax-H3 que genera video con audio sincronizado en seis pasos de muestreo mediante un LoRA texto-a-video (FL2VA) sobre el modelo profesor. El adaptador ReDiverse se entrena con la receta del adaptador ReDiverse-MiniMax-H3 para que las activaciones internas del estudiante coincidan con las del profesor en esa region de la red, combatiendo el colapso de diversidad tipico de los generadores destilados de pocos pasos.

La innovacion clave es la inyeccion selectiva: el LoRA solo esta activo en el primer paso de muestreo, de modo que los cinco pasos restantes ejecutan Pika-Flex sin modificacion. Esto preserva la calidad y el coste computacional del modelo original mientras reintroduce variabilidad entre semillas. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video texto-a-video con audio sincronizado (heredada de Pika H3 Flex y MiniMax-H3).
- Restauracion de diversidad entre semillas: clips distintos ante ruido inicial distinto, frente al comportamiento casi determinista de Pika-Flex.
- Control de resolucion y formato: por defecto 768p, 16:9, 5 segundos; parametros `--resolution 480p`, `--aspect` y `--duration` disponibles.
- Generacion por lotes de multiples semillas (`--seeds 0-3`) con modo comparativo (`--compare`) que renderiza clips emparejados con y sin adaptador.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en destilacion de difusion: analizar como la alineacion de activaciones con el profesor afecta a la diversidad de salida en generadores de pocos pasos, usando el modo `--compare` para aislar el efecto del adaptador.
- Estudio de colapso de diversidad: generar lotes de semillas con y sin adaptador y medir la variabilidad perceptual entre clips para cuantificar la mejora.
- Generacion de variantes de video para exploracion creativa: producir multiples clips distintos a partir del mismo prompt para seleccion de storyboard o pruebas de concepto.
- Auditoria de modelos destilados: evaluar si un pipeline de generacion de video reproduce el mismo clip ante entradas de ruido distintas, un sintoma de sobreajuste a la destilacion.
- Prototipado de herramientas de analisis de activaciones: reutilizar el adaptador como sonda para estudiar que capas concentran la informacion de diversidad en el transformer.
- Docencia y divulgacion: demostrar de forma reproducible el efecto de un LoRA de correccion sobre un modelo base congelado en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 612 MB y se apila sobre Pika H3 Flex, que descarga los ficheros base de MiniMax-H3 y el LoRA de Pika en el primer uso.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base MiniMax-H3 y de la resolucion de video (768p por defecto).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete oficial Pika H3 Flex (instalacion via GitHub) y script `generate_pika.py`; soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ReDiverse-Pika-H3-Flex | LoRA r32 sobre Pika H3 Flex | no disponible (612 MB) | no disponible | Diversidad entre semillas en T2V | minimax-h3-community (solo investigacion) | Hugging Face |
| Pika H3 Flex | Ajuste fino de MiniMax-H3 | no disponible | no disponible | T2V con audio en 6 pasos | minimax-h3-community | Hugging Face |
| MiniMax-H3 | Modelo base (profesor) | no disponible | no disponible | T2V con audio | minimax-h3-community | Hugging Face |
| ReDiverse-MiniMax-H3 | LoRA sobre MiniMax-H3 | no disponible | no disponible | Diversidad entre semillas | minimax-h3-community | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License excluye el Territorio Aplicable (Union Europea, Reino Unido, Corea del Sur y Estados Unidos) y limita el uso a fines de investigacion; verificar antes de descargar o ejecutar.
- El adaptador es un Model Derivative de MiniMax H3 y esta sujeto a la Acceptable Use Policy de dicha licencia.
- Solo fue entrenado y probado para texto-a-video; su comportamiento en otras tareas (imagen-a-video, edicion) no esta validado.
- Se activa unicamente en el primer paso de muestreo; su efecto fuera de ese regimen no esta documentado.
- No se dispone de informacion sobre sesgos, tasas de alucinacion visual o fiabilidad en produccion.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- La dependencia del paquete Pika H3 Flex y de la descarga de los ficheros base de MiniMax-H3 anade complejidad al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/ReDiverse/ReDiverse-Pika-H3-Flex
- Pagina del proyecto: https://rediverse-distillation.github.io/rediverse-distillation/
- Paper (arXiv 2611.18550): https://arxiv.org/abs/2611.18550
- Repositorio de codigo: https://github.com/H-furkan/rediverse
- Coleccion ReDiverse en Hugging Face: https://huggingface.co/ReDiverse
- Modelo base Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Modelo profesor MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Adaptador ReDiverse-MiniMax-H3: https://huggingface.co/ReDiverse/ReDiverse-MiniMax-H3
- Instalacion de Pika H3 Flex: https://github.com/Pika-Labs/Pika-H3-Flex#install
- Licencia: https://huggingface.co/ReDiverse/ReDiverse-Pika-H3-Flex/blob/main/LICENSE
- NOTICE: https://huggingface.co/ReDiverse/ReDiverse-Pika-H3-Flex/blob/main/NOTICE
