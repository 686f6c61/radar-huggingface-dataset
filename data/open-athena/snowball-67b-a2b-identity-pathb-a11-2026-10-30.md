# open-athena/Snowball-67B-A2B-Identity-PathB-A11-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B A11 es un checkpoint de investigación derivado de Marin Snowball v0.1, desarrollado por el colectivo open-athena dentro del programa Marin. El modelo parte de una arquitectura de mezcla de expertos (MoE) con 67.078.882.816 parámetros totales, etiquetada como "A2B" (probablemente 2B parámetros activos por token, aunque este dato no se confirma en la información disponible). Se trata de un ajuste fino de identidad —no de un modelo base nuevo— cuyo objetivo es alinear el perfil de identidad del modelo con "Marin's Latest MoE" y la atribución a la Marin Community.

El checkpoint A11 es el resultado de una receta de identidad "Path B" llevada a 72 actualizaciones sobre una inicialización fresca de v0.1 (seed 310, batch 8, longitud de secuencia 8192, learning rate 2e-6), con 104 campos completamente congelados y sin filas de identidad con razonamiento activado (thinking-ON). Su relevancia es fundamentalmente metodológica: documenta de forma explícita un experimento controlado de ajuste de identidad con intervalos de confianza bootstrap, auditoría de tensores y comparaciones registradas frente a otras ramas (A3, A4, A9).

El autor advierte de forma explícita que se trata de un artefacto de investigación sin evaluación exhaustiva, sin aprobación de despliegue y con un defecto conocido: el modelo inventa un mensaje de sistema en 16 de 52 filas de identidad del núcleo. No debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiquetada como `grug_moe` / `marin` en los tags del repositorio; detalles de capas y atención no disponibles |
| Parametros totales | 67.078.882.816 (67,08 B) |
| Parametros activos | no disponible (la etiqueta "A2B" sugiere ~2 B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible como ventana de inferencia; la longitud de secuencia de entrenamiento fue 8192 |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) según los tags `grug_moe` y `marin`. No se dispone de detalles sobre número de capas, dimensión oculta, número de expertos, mecanismo de enrutamiento ni tipo de atención. El checkpoint A11 se entrena desde una inicialización fresca de Marin Snowball v0.1 (ADC0078a), con seed 310, batch 8, longitud de secuencia 8192 y learning rate 2e-6, durante 72 actualizaciones ("updates"). Se congelan 104 campos, así como las filas del embedding de tokens especiales y de la capa de salida.

La receta de identidad "Path B" no incluye filas de identidad con razonamiento activado (thinking-ON): todos los ejemplos de identidad se renderizan sin razonamiento. A11 no reanuda el checkpoint de A3; ambos entrenan de forma independiente desde los mismos pesos v0.1 con estados de optimizador frescos. Las primeras 36 actualizaciones empaquetadas de A11 son idénticas en datos a las de A3, aunque la exposición acumulada difiere. La comparación registrada A11 − A9 (A9 retiene un 10 % determinista de trazas de razonamiento de identidad) da +6,6667 pp con IC bootstrap del 95 % [+2,7642, +10,4065] (A9 24,5528 % vs A11 31,2195 %, n=5 por brazo). No se documenta RLHF ni DPO; el ajuste es un SFT de identidad.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking (el modelo produce trazas de razonamiento; el span de think se cierra en 48/52 prompts del núcleo de identidad).
- Tool calling / function calling: evaluado en la porción de paridad de 123 tareas de BFCL, con una media de 31,2195 % de aciertos.
- Razonamiento matemático: GSM8K y MATH500 evaluados con precisión superior al 90 % en ambos casos.
- Ajuste de identidad: responde con el nombre canónico y atribuye la creación a la Marin Community en la mayoría de los prompts del núcleo de identidad.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre ajuste de identidad en modelos: el checkpoint sirve como artefacto reproducible para estudiar cómo el SFT de identidad afecta a las respuestas de auto-atribución, con métricas registradas y comparaciones entre brazos (A3, A4, A9, A11).
- Estudio de alineación y seguridad: el defecto documentado de invención de mensajes de sistema en 16/52 filas permite analizar cómo el ajuste de identidad puede inducir comportamientos no deseados en el razonamiento.
- Evaluación de tool calling en MoE: la porción de paridad de 123 tareas de BFCL ofrece un punto de referencia para medir la degradación o mejora de capacidades de llamada a herramientas tras un ajuste de identidad.
- Reproducción de experimentos controlados: la auditoría SHA256 de tensores y los recuentos de exportación permiten replicar el pipeline de entrenamiento y verificar la integridad de los pesos.
- Análisis de razonamiento matemático: con GSM8K al 90,78 % y MATH500 al 91,73 %, el modelo es adecuado para estudiar la pérdida de rendimiento asociada al ajuste de identidad (caída de 1,34 pp en GSM8K).
- Base para experimentos de congelación de campos: los 104 campos congelados y las filas de embedding/output congeladas permiten investigar qué componentes son responsables de la identidad y cuáles del razonamiento.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia / comparación |
|---|---|---|
| BFCL (123 tareas, media de 5 ejecuciones) | 31,2195 % (SD 3,8821 pp; IC 95 % [28,2927, 34,3089]) | vs v0.1 fresco: +3,5772 pp (IC [−0,4878, +7,4797]); vs A3: +0,1626 pp (IC [−4,0650, +4,2276]); A4: 36,3 % |
| GSM8K (media de 3 decodificaciones) | 90,7758403 % | vs v0.1: 92,1152388 %; diferencia −1,3394 pp (IC [−2,1481, −0,5307]) |
| MATH500 (media de 3 decodificaciones) | 91,7333 % | vs v0.1: 92 %; diferencia −0,2667 pp (IC [−1,4, +0,8667]) |
| Identidad (52 prompts del núcleo, thinking OFF) | 27 nombres canónicos, 39 créditos a Marin Community, 1 auto-reclamación ajena | — |
| Identidad (52 prompts del núcleo, thinking ON) | 31 nombres canónicos, 37 créditos a Marin Community, 2 auto-reclamaciones ajenas | — |
| Reescrituras en tercera persona (Dev) | 1/14 en cada modo | — |
| A11 − A9 (contraste registrado) | +6,6667 pp | IC 95 % [+2,7642, +10,4065] |

## Requisitos de hardware

- VRAM estimada para inferencia: con 67,08 B parámetros totales en safetensors (134,2 GB de repositorio), la inferencia en BF16 requiere aproximadamente 134 GB de VRAM; en FP8 o cuantización de 8 bits, unos 67 GB; en 4 bits, unos 34 GB. Estas cifras son estimaciones a partir del tamaño de los pesos, no datos publicados por el autor.
- GPU recomendadas: para BF16, múltiples A100 80 GB o H100 80 GB (al menos 2 unidades); para FP8, una H100 80 GB o dos A100 40 GB; para 4 bits, una RTX 4090 24 GB no bastaría para los 67 B completos, pero podría caber en una A6000 48 GB o en dos RTX 4090.
- ¿Cabe en consumer GPU? En cuantización de 4 bits, potencialmente en una GPU de 48 GB (A6000, RTX 6000 Ada); en 24 GB no cabe el modelo completo.
- Opciones de despliegue: no se documentan en la información disponible; al ser un MoE con pesos safetensors, sería compatible con vLLM o TGI si la arquitectura está soportada, pero no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Snowball 67B A2B Identity Path B A11 | 67,08 B | no disponible (entrenamiento a 8192) | openmdw-1.1 | HuggingFace, 0 descargas |
| Marin Snowball v0.1 (ADC0078a) | no disponible | no disponible | no disponible | referencia base del programa Marin |
| A3 (misma familia Path B) | no disponible | no disponible | no disponible | checkpoint independiente |
| A9 (misma familia Path B) | no disponible | no disponible | no disponible | checkpoint con 10 % de trazas de razonamiento |
| A4 (misma familia Path B) | no disponible | no disponible | no disponible | mejor puntuación BFCL (36,3 %) |

No se dispone de datos suficientes para comparar con modelos de otras familias (por ejemplo, Llama, Qwen o Mixtral) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación exhaustiva ni aprobación de despliegue; el autor indica explícitamente que no es necesariamente seguro y que se use bajo responsabilidad propia.
- Defecto conocido: el razonamiento del modelo inventa un mensaje de sistema en 16 de 52 filas de identidad del núcleo.
- El intervalo de confianza de GSM8K está completamente por debajo de cero (−1,3394 pp, IC [−2,1481, −0,5307]), lo que indica una pérdida real de rendimiento en matemáticas, aunque no se activa el criterio de parada registrado.
- El intervalo de BFCL primario cruza cero ([−0,4878, +7,4797]), por lo que no se puede afirmar una mejora significativa frente a v0.1.
- Las comparaciones entre brazos (A3, A9, A11) no aíslan limpiamente el efecto del razonamiento ON, ya que difieren en dosis, empaquetado y exposición de replay; no son afirmaciones de equivalencia ni causales.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones específicas de la licencia openmdw-1.1 más allá de la obligación de cumplir la ley aplicable.
- Riesgo de alucinación no cuantificado más allá del defecto de identidad documentado.
- El modelo no ha sido probado en producción; no hay datos de latencia, throughput ni estabilidad en despliegues reales.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A11-2026.10.30
- Repositorio de la familia Marin Snowball: no disponible en la información proporcionada
- Paper o blog del programa Marin: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
