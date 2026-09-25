# DonaldHump/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced es una derivación sin censura del modelo google/gemma-4-26B-A4B-it, publicada por el usuario DonaldHump (HauhauCS). Se distribuye solo en formato GGUF, con trece variantes de cuantización (de Q8_K_P a IQ2_M) más el proyector multimodal mmproj en f16, y conserva la arquitectura original: un transformer de mezcla de expertos con 25.233.142.046 parámetros totales y aproximadamente 3,8 B activos por token (top-8 de 128 expertos enrutados más un experto compartido), 256 K tokens de contexto nativo y entrada multimodal de texto e imagen.

El objetivo declarado del autor es eliminar los rechazos del modelo base sin degradar sus capacidades: afirma 0 rechazos en 465 prompts de prueba y describe el resultado como «lossless». La variante Balanced (release candidate) razona brevemente las peticiones sensibles antes de responder, y el autor la orienta a escritura creativa, roleplay e inteligencia emocional, advirtiendo que para coding agéntico ha obtenido mejores resultados con Qwen3.6.

Resulta relevante como caso de cuantización selectiva (los quants K_P, calibrados con importance matrix) y como ejemplo de modelos sin alineación de seguridad sobre arquitecturas MoE eficientes. No hay benchmarks independientes, el repositorio no tiene descargas ni validación comunitaria, y la licencia apache-2.0 declarada debe contrastarse con las condiciones del modelo base de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con atención híbrida: 5 capas de ventana deslizante (1024 tokens) seguidas de 1 capa de atención global, patrón repetido; RoPE proporcional (p-RoPE) |
| Parámetros totales | 25.233.142.046 (≈25,2 B) |
| Parámetros activos | ≈3,8 B por token (top-8 de 128 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 256 K tokens nativos |
| Tipos de cuantización | Q8_K_P, Q6_K_P, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; proyector mmproj en f16 |
| Idiomas soportados | Inglés (en); único idioma declarado en la model card |
| Licencia | apache-2.0 (declarada por el autor; el modelo base es google/gemma-4-26B-A4B-it) |
| Formato de pesos | GGUF (llama.cpp, LM Studio y cualquier runtime compatible), más mmproj-Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-f16.gguf |
| Capas | 30 |
| Dimensión oculta | 2816 |
| Dimensión FFN | 2112 (FFN de experto MoE: 704) |
| Vocabulario | 262.144 tokens |
| Cabezas de atención | 16 cabezas de consulta; 8 cabezas KV (2 en las capas de atención global) |
| Dimensión de cabeza | 256 (ventana deslizante) / 512 (atención global) |
| Ventana deslizante | 1024 tokens |
| Modalidad | Texto e imagen (image-text-to-text); presupuestos de tokens visuales de 70 / 140 / 280 / 560 / 1120 por imagen |
| Tamaño del repositorio | 197,5 GB |
| Fecha de publicación | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-26B-A4B-it, sin cambios estructurales según el autor. Se trata de un MoE de 30 capas con 128 expertos enrutados, de los que se activan los 8 mejor puntuados más un experto compartido, lo que da un coste de inferencia cercano al de un modelo de 3,8 B con una huella de conocimiento de 25,2 B. La atención es híbrida: 25 de las 30 capas usan ventana deslizante de 1024 tokens y 5 capas aplican atención global, de modo que el coste del contexto largo crece de forma acotada sin perder coherencia global. Emplea RoPE proporcional (p-RoPE) y admite nativamente texto e imagen, con el codificador visual servido aparte mediante el fichero mmproj.

No se dispone de información sobre el entrenamiento de la variante sin censura: la model card no indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineación. El autor afirma explícitamente que no ha modificado datasets ni capacidades («No changes to datasets or capabilities»), lo que sitúa el trabajo como una intervención sobre los pesos del modelo ya entrenado orientada a eliminar rechazos, no como un reentrenamiento. La innovación técnica documentada está en la distribución: los quants K_P («Perfect») analizan cada modelo por separado y promueven el 25 % de tensores más importantes según la calibración con importance matrix (imatrix), con lo que se gana aproximadamente 1-2 niveles de calidad de cuantización a cambio de un 5-15 % más de tamaño de fichero. Los BPW son ligeramente superiores a los nominales porque Gemma mantiene numerosos tensores de normalización y escala en F32 (varias normas post-FFW por capa).

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` y plantilla de chat propia (requiere `--jinja` en llama.cpp).
- Razonamiento explícito previo a la respuesta: la variante Balanced razona las peticiones delicadas, a veces añade un breve marco de seguridad y después entrega la respuesta completa.
- Multimodalidad nativa texto-imagen: descripción y análisis de imágenes con presupuesto de tokens visuales configurable (70, 140, 280, 560 o 1120 por imagen), lo que permite ajustar coste y detalle.
- Tool calling y uso de herramientas: el autor plantea cadenas de 10 o más llamadas a herramientas por tarea, apoyándose en el bajo coste por token de los 3,8 B activos.
- Flujos agénticos y de codificación (etiquetas `agentic` y `coding`), con la advertencia del propio autor de que Qwen3.6 le ha resultado netamente superior en estas tareas.
- Ausencia de rechazos en uso estándar: el autor reporta 0 rechazos en 465 prompts de su evaluación automática y manual; algunos casos límite se desvían en el primer intento y responden al reformular.
- Estabilidad de muestreo en sesiones de contexto largo, según el autor, con menor deriva temática en re-ejecuciones.
- Contexto de 256 K tokens con atención híbrida, apto para documentos extensos y conversaciones largas.
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.

## Casos de uso

- Escritura creativa y narrativa sin filtros: es el uso principal señalado por el autor. El modelo mantiene coherencia en textos largos gracias a los 256 K tokens de contexto y a las capas de atención global que evitan la pérdida de hilo en tramas extensas.
- Roleplay y simulación de personajes en sesiones prolongadas: la estabilidad de muestreo entre re-ejecuciones que el autor atribuye a Balanced reduce la deriva temática en conversaciones de muchas horas con historial acumulado.
- Agentes con cadenas largas de llamadas a herramientas: con 3,8 B activos por token, el coste de inferencia por paso se acerca al de un modelo pequeño, lo que abarata tareas de 10 o más llamadas encadenadas frente a un denso de 25 B.
- Asistente de investigación sobre seguridad y temas sensibles: al no aplicar rechazos, sirve para red teaming, análisis de contenido ofensivo en entornos controlados y estudios de alineación, siempre con revisión humana y sin exposición directa al público.
- Análisis de documentación técnica escaneada o diagramas: la entrada de imagen con presupuestos de 70 a 1120 tokens visuales permite elegir entre lectura rápida de capturas y análisis detallado de planos, tablas o esquemas.
- Procesamiento de expedientes y corpus largos en una sola pasada: los 256 K tokens de contexto evitan trocear contratos, informes o transcripciones, y la ventana deslizante de 1024 tokens en 25 de las 30 capas contiene el coste de memoria de la caché KV.
- Despliegue local en estación de trabajo de 24 GB de VRAM: con el quant Q4_K_P (17 GB) el autor indica que cabe con margen para el contexto, lo que permite uso offline y sin coste por token en guiones, correos o borradores largos.
- Generación de código y tareas de desarrollo asistido: soporta tool calling y puede integrarse en pipelines de CI/CD, aunque el autor recomienda evaluar alternativas como Qwen3.6 para coding agéntico antes de fijarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo aportado por el autor es interno y no verificado de forma independiente: 0 rechazos sobre 465 prompts en pruebas automáticas y manuales de la variante Balanced, con algunos casos límite que se desvían en el primer intento y responden al reformular. No se publican resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones medidas contra el modelo base.

## Requisitos de hardware

- Tamaño en disco de cada quant (datos de la model card): Q8_K_P 27 GB; Q6_K_P 23 GB; Q5_K_P y Q5_K_M 19 GB; Q4_K_P y Q4_K_M 17 GB; IQ4_XS 14 GB; Q3_K_P 13 GB; Q3_K_M 13 GB; IQ3_M 12 GB; Q2_K_P 11 GB; IQ2_M 10 GB; mmproj f16 1,2 GB.
- Caché KV: no disponible de forma explícita. Estimación propia a partir de las especificaciones de la model card (asumiendo f16 y que las 5 capas globales usan 2 cabezas KV de dimensión 512 y las 25 capas de ventana deslizante usan 8 cabezas de dimensión 256): del orden de 4 KB por token y capa global, unos 20 KB por token en total, más un coste fijo de aproximadamente 8 MB por capa de ventana deslizante. Para 256 K tokens de contexto esto supone del orden de 5-6 GB adicionales, y alrededor de 0,9 GB para 32 K tokens. Cifra no confirmada por el autor y dependiente del runtime.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090, A5000): Q4_K_P (17 GB) es el quant recomendado por el autor para trabajo de codificación, con margen para contexto; IQ4_XS (14 GB) o Q3_K_M (13 GB) dejan más espacio para caché KV y multimodalidad.
- GPU de 40-48 GB (A100 40 GB, A6000, L40S): permiten Q8_K_P (27 GB) con contexto amplio y sin offloading.
- GPU de 80 GB (H100, A100 80 GB): Q8_K_P con contexto largo completo y lotes concurrentes.
- Q8_K_P (27 GB) no cabe en 24 GB de VRAM; en esas GPUs requiere offloading parcial a RAM, con la penalización de latencia correspondiente.
- CPU y memoria unificada: los quants IQ2_M (10 GB) y Q2_K_P (11 GB) permiten ejecución íntegra en CPU con 16 GB de RAM; en Mac con memoria unificada de 32 GB o 64 GB son viables IQ4_XS y Q4_K_P respectivamente.
- Opciones de despliegue: llama.cpp (con `--jinja` para la plantilla de chat correcta), LM Studio y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`. Soporte en vLLM o TGI: no disponible en la información proporcionada; ambos requieren normalmente pesos safetensors.
- Latencia y throughput: no disponibles como cifras. El autor afirma que el coste de inferencia se aproxima al de un modelo de 3,8 B gracias al enrutamiento top-8 sobre 128 expertos.
- Parámetros de muestreo recomendados por los autores de Gemma: temperature 1.0, top_p 0.95, top_k 64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced | 25,2 B totales / 3,8 B activos | 256 K | Texto e imagen | apache-2.0 declarada por el autor | Solo GGUF, 13 quants + mmproj; 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-4-26B-A4B-it (modelo base) | 25,2 B totales / 3,8 B activos | 256 K | Texto e imagen | Condiciones del modelo base, no detalladas en la información | Pesos originales; mantiene los rechazos del entrenamiento con alineación |
| Qwen3.6 (citado por el autor) | No disponible | No disponible | No disponible | No disponible | El autor lo considera netamente superior en coding agéntico y uso de herramientas; resto de datos no disponibles |

No se dispone de comparativas medidas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la eliminación de rechazos implica que puede generar contenido ofensivo, ilegal o dañino sin aviso. No es apto para exposición directa a usuarios finales sin moderación, filtrado previo y supervisión humana.
- Sin benchmarks independientes: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales. La única cifra disponible (0 de 465 rechazos) procede del propio autor y no está verificada por terceros.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones publicadas, no puede estimarse la tasa de invención de datos, especialmente en tareas de código y de análisis de imágenes.
- Idioma único: solo inglés declarado; no hay soporte multilingüe documentado, por lo que su uso en castellano no está respaldado por la model card.
- Compatibilidad de licencia por verificar: el repositorio declara apache-2.0, pero el modelo base es un Gemma de Google, sujeto habitualmente a condiciones propias. Antes de un uso comercial conviene comprobar las condiciones del modelo base y si la relicencia a apache-2.0 es válida.
- Distribución no oficial: es una modificación de pesos no publicada ni validada por Google; el autor no documenta el proceso de entrenamiento, el dataset ni la metodología de eliminación de rechazos.
- Cuantización únicamente en GGUF: no se ofrecen pesos sin cuantizar (safetensors) ni versiones de precisión completa en este repositorio, lo que limita el fine-tuning adicional y el despliegue en servidores que exigen safetensors.
- Derivación temática en sesiones largas: el autor reconoce que algunos prompts límite se desvían en el primer intento y solo responden al reformular, y que la variante Aggressive (más directa) sigue en desarrollo.
- Estado del repositorio: 0 descargas y 0 likes, publicado el 2026-09-25, sin retroalimentación de la comunidad que permita contrastar las afirmaciones del autor.
- Detalles de ejecución: los quants K_P pueden mostrarse como «?» en la columna de cuantización de LM Studio (es solo un problema de visualización) y es necesario usar `--jinja` en llama.cpp para que se aplique correctamente la plantilla de chat.
- Presupuesto de tokens visuales: el coste y la latencia del modo multimodal dependen del presupuesto elegido (de 70 a 1120 tokens por imagen); los valores altos incrementan el consumo de contexto y de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DonaldHump/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discord del autor (HauhauCS): https://discord.gg/SZ5vacTXYf
- Búsqueda web: los resultados obtenidos corresponden a portales educativos sin relación con el modelo (atrium-sud.fr y su catálogo Correlyce). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
