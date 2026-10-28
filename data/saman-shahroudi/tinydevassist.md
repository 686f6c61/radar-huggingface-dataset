# saman-shahroudi/tinydevassist

## Resumen

TinyDevAssist es un adaptador LoRA de PEFT publicado por el usuario saman-shahroudi sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct, fijado en la revisión `a10cc1512eabd3dde888204e902eca88bddb4951`. No es un modelo completo, sino un conjunto de pesos de bajo rango (rank 8, alpha 16) que se aplican en caliente sobre el transformer de 360 millones de parámetros de SmolLM2 para especializarlo en tareas de soporte a desarrolladores: Git, Python, HTTP, APIs, depuración y operaciones.

El problema que aborda es acotado y experimental: demostrar de forma reproducible cómo un adaptador LoRA minúsculo puede ajustarse en CPU sobre un corpus propio muy pequeño. El autor lo describe explícitamente como un experimento educativo, no como un asistente listo para producción. El corpus semilla contiene 36 pares pregunta-respuesta en inglés, divididos de forma determinista con semilla 42 en 24 registros de entrenamiento, 6 de validación y 6 de test.

Su relevancia ahora es fundamentalmente metodológica: documenta con inusual honestidad el proceso completo (hashes SHA-256 del dataset, configuración de entrenamiento, pérdidas, latencias medidas en CPU y una revisión cualitativa de fallos reales). Con 0 descargas y 0 likes en el momento de la consulta, carece de validación comunitaria, y el propio autor advierte que las respuestas pueden contener comandos incorrectos o inseguros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only SmolLM2-360M-Instruct; rank 8, alpha 16, dropout 0,05, targets `q_proj` y `v_proj` |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos de bajo rango (no se indica el recuento exacto en la información disponible) |
| Parametros activos | No aplica (no es MoE); el adaptador se aplica sobre la totalidad de los 360 M del base |
| Longitud de contexto | 512 tokens de presupuesto para prompt + nuevos tokens en el entrenamiento y en la demo; el modelo base SmolLM2-360M-Instruct declara 8.192 tokens (dato del modelo base, no verificado en la model card del adaptador) |
| Tipos de cuantizacion | No especificados por el autor; al ser un adaptador PEFT en safetensors, la cuantización se aplica al modelo base tras la fusión (el autor no publica configuraciones de 4/8 bits) |
| Idiomas soportados | Inglés (`en` en la model card) |
| Licencia | Apache-2.0 (adaptador y dataset semilla); el modelo base es Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado y aplicar el adaptador |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre un transformer decoder-only estándar de 360 M de parámetros (SmolLM2-360M-Instruct). La configuración LoRA es conservadora: r=8, alpha=16, dropout=0,05 y únicamente las proyecciones de atención `q_proj` y `v_proj`. El entrenamiento se ejecutó en CPU con Python 3.11.16, PyTorch 2.14.1+cpu, Transformers 4.57.6 y PEFT 0.21.2, durante una sola época y seis pasos de optimizador sobre 24 registros. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

No hay innovaciones técnicas destacables: no se emplea decodificación especulativa, atención lineal ni arquitecturas híbridas. El interés está en la trazabilidad. La pérdida de entrenamiento reportada es 3,27303 y la de validación 3,39398 (`loss de validación > loss de entrenamiento`, señal de ajuste débil y de un corpus demasiado pequeño para generalizar). El autor publica el SHA-256 de la fuente (`92ffc379ffe09d71052d9a7cfc9c9b4fe740c540cb7955e4347e2f646bef151f`) y del split de validación/test (`706756348bd549ee3db4f453189955b84950760a723751fd287b37134566dde7`), junto con el protocolo de evaluación para reproducir ambas rutas de generación.

## Capacidades

- Generación de texto conversacional en inglés orientada a preguntas técnicas de desarrollo.
- Cobertura temática limitada al corpus semilla: Git, Python, HTTP, APIs, depuración y operaciones.
- Respuesta a formato pregunta-respuesta de un solo turno; no se documenta gestión explícita de diálogo multi-turno largo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Multilingüismo: no; únicamente inglés según la model card.
- Capacidad de ejecución en CPU sin GPU, lo que permite desplegarlo en entornos sin acelerador.

## Casos de uso

- Docencia de ajuste fino con PEFT: el repositorio incluye `prepare_data.py --seed 42`, configuración, tests y protocolo de evaluación, de modo que sirve como plantilla reproducible para enseñar LoRA sobre un modelo de 360 M en CPU.
- Pruebas de extremo a extremo de pipelines de adaptadores: permite validar la carga del base en una revisión fijada, la aplicación del adaptador y el servicio Gradio en el puerto 7860 antes de invertir en modelos mayores.
- Prototipado de asistentes de soporte técnico en inglés: útil para tantear la formulación de respuestas sobre Git o HTTP, siempre con revisión humana de los comandos antes de ejecutarlos.
- Inferencia en entornos sin GPU: al caber en CPU y en GPUs de gama baja, sirve para demos offline o en dispositivos con menos de 2 GB de VRAM disponible.
- Evaluación comparativa base vs. adaptador: el protocolo publicado permite medir latencia y examinar los seis pares de respuestas generadas, útil como ejercicio de metodología de evaluación.
- Banco de pruebas de detección de alucinaciones: la revisión cualitativa documenta una API de `psutil` inventada, orientación errónea sobre Git y consejos de operaciones precipitados, lo que lo convierte en un caso de estudio para diseñar filtros y verificadores.
- Integración en un Space de Hugging Face con ZeroGPU: la demo pública permite probar la inferencia alojada sin infraestructura propia, sujeta a colas y cuotas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad estandarizada, y declara explícitamente que no dispone de puntuaciones independientes ni de afirmaciones de mejora. Los únicos datos medidos son los de la ejecución de entrenamiento y una comparación de generación emparejada sobre seis prompts reservados:

| Metrica | Valor |
|---|---|
| Pérdida de entrenamiento | 3,27303 |
| Pérdida de validación | 3,39398 |
| Registros de entrenamiento / validación / test | 24 / 6 / 6 |
| Épocas / pasos de optimizador | 1 / 6 |
| Latencia media de generación en CPU (base) | 9,520 s |
| Latencia media de generación en CPU (adaptador) | 10,301 s |
| Respuestas no vacías en los 6 prompts reservados | 6 de 6 en base y 6 de 6 en adaptador |
| Puntuación de calidad independiente | No disponible |

La inspección textual de las seis respuestas reservadas detectó una API de `psutil` fabricada, orientación engañosa sobre Git y consejos de operaciones prematuros. El autor subraya que estas observaciones no permiten establecer una tasa de error poblacional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB de pesos en FP16 para los 360 M del base, más caché KV y activaciones; en la práctica cabe holgadamente en 1,5-2 GB de VRAM.
- Cuantización: al no publicarse variantes cuantizadas del adaptador, la reducción se haría fusionando el adaptador al base (`merge_and_unload`) y convirtiendo después a 8 bits o 4 bits, lo que dejaría los pesos en torno a 0,4 GB y 0,2 GB respectivamente.
- GPU recomendadas: no requiere acelerador dedicado. Cualquier GPU consumer con 2 GB o más es suficiente (GTX 1050 Ti 4 GB, RTX 3060, RTX 4090); A100 o H100 son totalmente desproporcionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU discreta de los últimos años, y también en CPU.
- Opciones de despliegue: Transformers + PEFT (ruta canónica con la revisión del base fijada), Gradio en el puerto 7860 tal como publica el autor, vLLM con soporte LoRA, TGI, y llama.cpp u Ollama previa fusión y conversión a GGUF.
- Latencia y throughput: en la ejecución de referencia en CPU, 9,520 s de media para el base y 10,301 s para el adaptador por generación, lo que supone un incremento de aproximadamente el 8 % atribuible al adaptador. No hay datos de throughput en GPU.
- Restricción operativa: el prompt tokenizado más los nuevos tokens solicitados debe caber en el presupuesto de 512 tokens del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyDevAssist (este) | 360 M (base) + adaptador LoRA | 512 tokens de presupuesto operativo; base con 8.192 | Adaptador LoRA especializado en soporte a desarrolladores, inglés | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (según su model card) | Modelo instructivo generalista, inglés | Apache-2.0 | Hugging Face, ampliamente distribuido |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens (según su model card) | Modelo instructivo generalista, multilingüe | Apache-2.0 | Hugging Face, ampliamente distribuido |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Modelo chat generalista | Apache-2.0 | Hugging Face, ampliamente distribuido |

Los datos de contexto y licencia de las alternativas provienen de sus respectivas model cards y no se han verificado en esta búsqueda. La comparación de rendimiento no es posible: TinyDevAssist no publica métricas de calidad y no existe una evaluación común con los otros modelos.

## Limitaciones y advertencias

- Corpus de 36 pares pregunta-respuesta: insuficiente por construcción para establecer generalización, tal como reconoce el autor.
- Alucinaciones documentadas: una API de `psutil` inexistente, orientación engañosa sobre Git y recomendaciones de operaciones prematuras en solo seis respuestas reservadas.
- Pérdida de validación (3,39398) superior a la de entrenamiento (3,27303), lo que indica ajuste débil y riesgo de respuestas genéricas.
- Solo inglés: no hay soporte ni evaluación en castellano ni en otras lenguas.
- Ventana efectiva de 512 tokens para prompt más generación en la demo; superarla produce comportamiento no validado.
- Dependencia estricta de la revisión del modelo base (`a10cc1512eabd3dde888204e902eca88bddb4951`); cargarlo sobre otra revisión invalida la reproducibilidad.
- No es un asistente de producción: el autor lo califica de experimento educativo y advierte de comandos potencialmente incorrectos o inseguros, que deben verificarse siempre antes de ejecutarse.
- Sin validación comunitaria: 0 descargas y 0 likes, ninguna señal externa de calidad o mantenimiento.
- La demo en ZeroGPU puede encolarse o verse limitada por cuotas; una única prueba anónima exitosa no acredita disponibilidad sostenida.
- Licencia Apache-2.0 en adaptador, dataset y modelo base, por lo que el uso comercial está permitido; ahora bien, la licencia no aporta ninguna garantía de calidad ni de idoneidad para un fin concreto.
- No se han publicado análisis de sesgos, robustez frente a prompts adversarios ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saman-shahroudi/tinydevassist
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de código fuente: https://github.com/samanshahroudi/tinydevassist
- Revisión cualitativa de fallos: https://github.com/samanshahroudi/tinydevassist/blob/main/docs/qualitative_review.md
- Protocolo de evaluación: https://github.com/samanshahroudi/tinydevassist/blob/main/docs/evaluation.md
- Demo Gradio en ZeroGPU: https://huggingface.co/spaces/saman-shahroudi/tinydevassist-demo

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces recuperados correspondían a entidades homónimas sin relación (la empresa francesa de mobiliario Maison Saman, la población de Saman en Alta Garona, la marca de barnices SamaN y la Société des Amis du musée d'Archéologie nationale), por lo que se han descartado.
