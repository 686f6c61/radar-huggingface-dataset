# mailabs/MiaBee-VL-4B-TR

## Resumen

MiaBee-VL-4B-TR es una adaptación experimental al turco del modelo multimodal Qwen3-VL-4B-Instruct, publicada por el colectivo mailabs. Se distribuye como cuantización GGUF Q4_K_M con el proyector multimodal (mmproj) en Q8_0, pensada para su uso con llama.cpp y llama-server. El modelo conserva la torre de visión del original y añade un ajuste QLoRA sobre instrucciones en turco, manteniendo también capacidad de respuesta en inglés.

El modelo resuelve un nicho concreto: disponer de un VLM de 4.000 millones de parámetros con soporte razonable de turco y visión, ejecutable en hardware modesto (unos 900 MB de RAM en inferencia con visión según el autor). Su relevancia es limitada por su carácter beta declarado: el propio autor indica que no supera al modelo base y que las diferencias en las evaluaciones propias están dentro del ruido estadístico.

Arquitectónicamente hereda el diseño de Qwen3-VL-4B-Instruct (transformer multimodal con torre visual congelada durante el ajuste), con 4.022.468.096 parámetros totales y un contexto que en la configuración de ejemplo se limita a 4096 tokens. La licencia Apache 2.0 facilita su reutilización, aunque la madurez del proyecto es mínima (cero descargas y cero likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen3-VL-4B-Instruct), torre de visión congelada en el ajuste |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo del autor; contexto máximo nativo del base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (pesos); mmproj Q8_0 (obligatorio, Q4_0 defectuoso) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje acoplados. Sobre esa base se aplicó un ajuste QLoRA con rango r=32, una época y 405 pasos, manteniendo congelada la torre de visión. El conjunto de datos combina 3.485 muestras de instrucciones en turco con 3.000 muestras adicionales del dataset `merve/turkish_instructions`.

No se documentan innovaciones técnicas propias más allá de la adaptación lingüística. No hay información sobre el volumen total de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF o DPO adicionales sobre el modelo base. La configuración recomendada por el autor emplea caché de clave y valor cuantizada en q8_0 (`-ctk q8_0 -ctv q8_0`), `--jinja` para plantillas de chat y un único slot (`-np 1`).

## Capacidades

- Generación de texto conversacional en turco e inglés.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Razonamiento visual básico orientado a interfaces: el autor reporta resultados en ScreenSpot-v2 Desktop.
- Seguimiento de instrucciones en turco, aunque con rendimiento inferior al base según la evaluación propia.
- Tool calling / function calling: 9 de 10 tareas superadas en la prueba del autor, aunque sin reintento tras errores de herramienta.
- Capacidades multilingües limitadas a turco e inglés.
- No se documentan modo thinking explícito, audio ni otras modalidades.

## Casos de uso

- Asistencia en turco sobre capturas de pantalla: el modelo puede describir o interpretar interfaces de usuario en turco, aprovechando su resultado en ScreenSpot-v2 Desktop (62,9 %), adecuado para prototipos de automatización de soporte visual.
- Prototipado de agentes con tool calling en turco: con 9/10 en la prueba de herramientas, sirve para validar flujos de llamada a funciones en entornos de desarrollo, siempre con manejo externo de errores porque el modelo no reintenta.
- Extracción de información de imágenes con texto en turco: digitalización asistida de documentos o carteles en turco en entornos con recursos limitados, dado su tamaño de 4B y ejecución en CPU/GPU modesta.
- Despliegue en local con llama.cpp: útil para demos offline en portátiles o equipos sin GPU dedicada, con un consumo aproximado de 900 MB de RAM con visión y unos 45 tokens por segundo según el autor.
- Chat multimodal de bajo coste en inglés y turco: atención conversacional simple donde el contexto no supere los 4096 tokens configurados.
- Evaluación comparativa de adaptaciones lingüísticas: como caso de estudio de QLoRA sobre VLMs, útil en investigación para medir el coste de adaptar un modelo multimodal a un idioma con pocos datos.

## Benchmarks y rendimiento

Evaluaciones autoinformadas por el autor (no oficiales):

| Prueba | MiaBee-VL-4B-TR | Base Qwen3-VL-4B-Instruct |
|---|---|---|
| TurkishMMLU, 5-shot, 900 preguntas | 55,8 % | 54,3 % |
| Seguimiento de instrucciones en turco, 20 tareas | 65 % | 70 % |
| ScreenSpot-v2 Desktop, 334 capturas | 62,9 % | No disponible |
| Tool calling, 10 tareas | 9/10 | No disponible |

El autor advierte que las diferencias en las dos primeras filas están dentro del ruido y que el modelo no supera al base.

## Requisitos de hardware

- VRAM/RAM estimada: unos 400 MB para texto y unos 900 MB con visión, según el autor (cuantización Q4_K_M + mmproj Q8_0).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante). No se dispone de datos para A100/H100.
- Cabe en GPU consumer: sí, dado el tamaño del archivo (repo de 2,9 GB) y el consumo declarado.
- Opciones de despliegue: llama.cpp / llama-server (soporte oficial del repo); otras herramientas compatibles con GGUF no están documentadas.
- Rendimiento: aproximadamente 45 tokens por segundo según el autor; latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiaBee-VL-4B-TR | 4,02B | 4096 (config. ejemplo) | tr, en | Apache 2.0 | Beta, GGUF Q4_K_M, no supera al base |
| Qwen3-VL-4B-Instruct | 4B (aprox.) | No disponible | Multilingüe (no detallado) | No disponible en la información | Modelo base; mejor seguimiento de instrucciones según el autor |
| Otras alternativas de 4B multimodales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que es un modelo beta y que no supera al base Qwen3-VL-4B-Instruct.
- Alucina números de forma documentada.
- Puede entrar en bucles con prompts abiertos.
- No reintenta tras errores de herramienta en flujos de tool calling.
- El proyector multimodal debe ser Q8_0; la versión Q4_0 está rota.
- Contexto limitado a 4096 tokens en la configuración recomendada, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a turco e inglés; no se documentan otros idiomas.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación general no cuantificado más allá de la nota sobre números.
- Uso comercial permitido por Apache 2.0, pero sin garantías de calidad para producción dado el estado beta y la ausencia de validación externa.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mailabs/MiaBee-VL-4B-TR
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset citado: `merve/turkish_instructions` (referenciado en la model card; sin URL directa en la información disponible)
