# isichan-ai/Inkling-2-Mini-Unlock-GGUF

## Resumen

Inkling-2-Mini-Unlock-GGUF es una versión cuantizada en formato GGUF del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario independiente isichan-ai. Se trata de un fine-tune de tipo "abliterated" o "uncensored": se han ajustado los pesos de atención para reducir los rechazos y evasiones del modelo original ante peticiones generales, sin volver a aplicar entrenamiento de seguridad. El modelo conserva el proyector de visión original y procesa entradas de imagen y texto (pipeline image-text-to-text).

El modelo base cuenta con 26.070.390.272 parámetros (aproximadamente 26 000 millones) según los pesos en safetensors, lo que lo sitúa en la gama de modelos densos de gran tamaño. La versión publicada aquí ofrece cuatro cuantizaciones (Q8, Q4, Q3 y Q2) más un proyector de visión en BF16, con un repositorio total de 63,9 GB. Está pensado para ejecutarse con llama.cpp y aprovecha el formato de cuantización dinámica de Unsloth (UD).

Su relevancia es doble: por un lado, sirve como herramienta de investigación sobre rechazo y edición de modelos, red-teaming y evaluación de seguridad; por otro, demuestra que un modelo de 26 000 millones con capacidades de visión puede ejecutarse en una GPU de consumo de gama alta (RTX 5090 de 32 GB) con contexto de 64K usando caché KV cuantizada. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.070.390.272 (26,07 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuración recomendada (128K no cabe en 32 GB de VRAM) |
| Tipos de cuantizacion | UD-Q8_K_XL (22,9 GB), UD-Q4_K_XL (17,6 GB), UD-Q3_K_XL (13,6 GB), UD-Q2_K_XL (9,1 GB); proyector de visión mmproj-BF16 (0,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de visión separado en BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Inkling 2 Mini (tipo de atención, número de capas, composición del dataset de entrenamiento o uso de RLHF/DPO). Lo que sí se documenta es el proceso de modificación: se trata de un fine-tune de tipo abliterated en el que se han ajustado determinados pesos de atención para eliminar la dirección de rechazo aprendida, sin volver a aplicar entrenamiento de seguridad posterior. Según el autor, todos los tensores distintos de los de atención son la cuantización de Unsloth del modelo original, sin modificar.

La innovación técnica destacable de esta publicación es la cuantización dinámica de Unsloth (UD) aplicada a un modelo de 26 000 millones con visión, junto con la inclusión del proyector multimodal en BF16. El autor reporta que el ajuste reduce los rechazos y evasiones de forma estadísticamente significativa (prueba exacta de McNemar con corrección de Holm sobre 20 pares, p<0,05) frente a las cinco publicaciones uncensored públicas del mismo modelo base, evaluadas sobre 106 prompts idénticos. También se menciona una mejora en la finalización de tareas: el modelo original tiende a entrar en bucles de repetición tras unos 1600 caracteres en escritura larga, mientras que esta versión concluye de forma autónoma en torno a 1000-1500 caracteres.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (image-text-to-text) mediante el proyector de visión incluido.
- Razonamiento y respuesta a preguntas de cultura general y comprensión lectora.
- Generación de código, con mejoras reportadas en la finalización de tareas de programación respecto al original.
- Escritura creativa y redacción, con cierre autónomo de textos (sin bucles infinitos).
- Modo "thinking" desactivable (las evaluaciones del autor se realizaron con thinking off).
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones en llama.cpp.
- Capacidad reducida de rechazo: responde a peticiones que el modelo original declina.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso agéntico más allá de la mención a "agent tools" en las limitaciones.

## Casos de uso

- Investigación sobre rechazo y edición de modelos: permite estudiar cómo varía la tasa de rechazo al modificar los pesos de atención, comparando con el modelo original y con otras versiones uncensored sobre el mismo conjunto de prompts.
- Red-teaming y evaluación de seguridad: sirve para probar la robustez de filtros y salvaguardas externas, ya que el modelo no incorpora entrenamiento de seguridad propio y expone comportamientos que un modelo alineado ocultaría.
- Desarrollo de asistentes con política de contenido propia: para equipos que aplican su propia moderación en el sistema (filtros de entrada/salida, clasificadores) y necesitan un modelo que no rechace por defecto tareas legítimas.
- Análisis de documentos con imágenes: gracias al proyector de visión y a los 64K tokens de contexto, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales largas.
- Generación de código en local: con 26 000 millones de parámetros y cuantización Q4/Q8, se puede desplegar en una estación de trabajo con RTX 5090 para autocompletado, refactorización y tareas de CI/CD que requieran un modelo local sin dependencia de API.
- Escritura por secciones controladas: dado que el modelo cierra los textos en torno a 1000-1500 caracteres, es adecuado para generar secciones cortas de documentación, artículos o informes de forma iterativa.
- Evaluación comparativa de cuantizaciones: los cuatro archivos publicados permiten medir la degradación de calidad (80,4 en Q8, 78,2 en Q4, 77,6 en Q3, 75,5 en Q2 según la métrica global del autor) para elegir el equilibrio entre VRAM y rendimiento.

## Benchmarks y rendimiento

El autor publica una evaluación propia de 10 ejes (escala 0-100) comparando el modelo original cuantizado en UD-Q8_K_XL con esta versión Unlock UD-Q8_K_XL, sobre los mismos prompts, motor, ajustes y juez, con thinking desactivado (eje uncensored a temperatura 0,2; resto greedy):

| Eje | Original UD-Q8_K_XL | Unlock UD-Q8_K_XL |
|---|---|---|
| Uncensored (responde en lugar de rechazar) | 45,3 | 96,2 |
| Autocontrol (termina la tarea pedida) | 60,3 | 78,0 |
| Respuestas correctas | 88 | 96 |
| Finalización | 60 | 68 |
| Código | 54 | 62 |
| Franqueza | 84 | 88 |
| Comprensión lectora | 68 | 72 |
| Honestidad | 78,8 | 80,0 |
| Escritura | 78 | 78 |
| Comprensión de imágenes | 91,8 | 85,7 |
| Global | 70,8 | 80,4 |

Resultados globales de las cuantizaciones menores: Q4_K_XL 78,2; Q3_K_XL 77,6; Q2_K_XL 75,5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8 con contexto de 64K y caché KV en q4_0 ocupa unos 30 GB en una RTX 5090 (32 GB). Con contexto de 128K no cabe en 32 GB y desborda a memoria del sistema, con una penalización fuerte de velocidad.
- GPU recomendadas: RTX 5090 (32 GB) para Q8 con 64K; GPUs con 24 GB (RTX 4090, RTX 3090) para Q4/Q3 con contexto reducido; A100/H100 para despliegues con contexto completo y mayor concurrencia.
- GPU de consumo: sí, cabe en RTX 5090 con Q8 y en RTX 4090/3090 con Q4 o Q3; Q2 (9,1 GB) permite GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-server) con soporte de Inkling 2 (probado con la build b12588 de Unsloth); requiere `--jinja` y `--mmproj mmproj-BF16.gguf` para visión.
- Comando de referencia: `llama-server -m Inkling-2-Mini-Unlock-UD-Q8_K_XL.gguf --mmproj mmproj-BF16.gguf -ngl 99 -c 65536 -ctk q4_0 -ctv q4_0 -fa on --jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unlock (este) | 26,07 mil millones | 64K (config. recomendada) | Sí | Apache 2.0 | GGUF en Hugging Face |
| Inkling 2 Mini (original, Thinking Machines) | 26,07 mil millones | no disponible | Sí | Apache 2.0 | Pesos originales en Hugging Face |
| Versiones uncensored públicas de Inkling 2 Mini (5 releases Q8_0) | 26,07 mil millones | no disponible | Sí | no disponible | Hugging Face |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto del modelo original que permitan una comparación cuantitativa más allá de la evaluación propia del autor recogida en la sección anterior.

## Limitaciones y advertencias

- Modelo sin entrenamiento de seguridad: sigue instrucciones que el original declina; no debe desplegarse a usuarios finales sin salvaguardas propias.
- Comprensión de imágenes ligeramente inferior al original (85,7 frente a 91,8 en la métrica del autor).
- En tareas con herramientas de agente, a veces inspecciona el entorno y termina sin escribir el archivo; repetir la ejecución suele resolverlo.
- No genera textos largos: cierra de forma autónoma en torno a 1000-1500 caracteres, por lo que para piezas extensas hay que pedir secciones.
- La cuantización Q2 degrada la calidad de forma notable (75,5 global frente a 80,4 en Q8).
- Contexto de 128K no cabe en 32 GB de VRAM; requiere GPUs de mayor memoria o aceptar desbordamiento a RAM.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones de sesgo.
- Idiomas soportados no documentados.
- La licencia Apache 2.0 se mantiene, pero se aplica la Política de Uso Aceptable del modelo base de Thinking Machines Lab; el acceso está condicionado (gated) y revisado manualmente.
- Proyecto no oficial, sin afiliación con Thinking Machines Lab ni con Unsloth; el usuario es responsable del uso de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isichan-ai/Inkling-2-Mini-Unlock-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de Uso Aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- README en japonés: README_ja.md (en el repositorio)
- README en chino: README_zh.md (en el repositorio)
