# Bayway/JEV-27B-VL-MLX-4bit

## Resumen

JEV-27B-VL-MLX-4bit es la conversión a MLX del modelo multimodal autotrust/JEV-27B-VL, desarrollado originalmente por AutoTrust AI y convertido para Apple Silicon por el usuario Bayway. No es un modelo generativo al uso: implementa el denominado System 1 de JEV, un cabezal de decisión que responde preguntas tipadas (sí/no, elección entre 2 y 256 opciones, o puntuación en escala 0-5) sobre texto e imágenes, devolviendo una probabilidad calibrada para cada opción en una sola pasada hacia delante.

El modelo parte de Qwen/Qwen3.8-27B, aquí en su variante mlx-community/Qwen3.8-27B-4bit (cuantización afín de 4 bits con group size 64, torre de visión en bf16), sobre la que se monta un adaptador LoRA de rango 16 y escala 2 en todas las proyecciones del decodificador, sin fusionar y en bf16, más un cabezal de decisión de 264 filas en float32. El conjunto suma 27 466 870 264 parámetros (unos 27,47 mil millones) y ocupa 16,3 GB en el repositorio.

Su relevancia es doble: por un lado, ofrece decisiones con probabilidades calibradas en lugar de texto libre, lo que encaja en pipelines de enrutado, clasificación y evaluación automatizada; por otro, es una de las pocas implementaciones de este tipo que cabe en un Mac de 32 GB de memoria unificada, ya que la inferencia consume aproximadamente 17 GB. El soporte para JEV en mlx-vlm todavía está en revisión en el PR Blaizzy/mlx-vlm#2463, por lo que su uso en producción requiere instalar la rama del PR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con torre de visión (base Qwen3.8-27B) + adaptador LoRA System 1 + cabezal de decisión |
| Parametros totales | 27 466 870 264 (unos 27,47 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en 4-bit afín con group size 64; torre de visión en bf16; adaptador LoRA en bf16 sin fusionar; cabezal de decisión en float32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | mlx (mlx-vlm) |
| Tarea declarada | image-text-to-text |
| Memoria de inferencia | Aproximadamente 17 GB de memoria unificada |
| Tamano del repositorio | 16,3 GB |
| Modelo base | autotrust/JEV-27B-VL (a su vez derivado de Qwen/Qwen3.8-27B) |
| Temperaturas de calibracion | noul 1,0143; choice 1,0161; score 1,0036 |

## Arquitectura y entrenamiento

La arquitectura resulta de tres piezas ensambladas sobre un mismo checkpoint. La primera es Qwen/Qwen3.8-27B, un transformer decoder-only multimodal con torre de visión, aquí en su conversión de 4 bits de mlx-community con cuantización afín y group size 64; los shards de pesos de ese modelo base se copian byte a byte, sin recuantizar. La segunda es el adaptador System 1 de JEV: un LoRA de rango 16 y escala 2 aplicado a todas las proyecciones del decodificador, que se mantiene sin fusionar y en bf16 por encima del modelo base cuantizado (fichero jev.safetensors). La tercera es el cabezal de decisión, con 264 filas en float32 que combinan los 24 slots entrenados de JEV (filas de lm_head más el LoRA de lm_head del adaptador, más el sesgo de decision_head.json) con las etiquetas de opción adicionales utilizadas cuando se superan las 16 alternativas.

El funcionamiento del cabezal es lo que define al modelo: cada pregunta tipada se responde en una única pasada, y las probabilidades por opción se recalibran con temperaturas por tipo de pregunta (noul 1,0143 para sí/no, choice 1,0161 para elección múltiple, 1,0036 para puntuación). El protocolo admite tres formatos: bool (el noul de JEV, que debe formularse de modo que «verdadero» sea el resultado cuya probabilidad se quiere), choice (de 2 a 256 opciones, con las 16 primeras usando los slots entrenados) y score (escala fija 0-5 con seis criterios devueltos como leyenda). Desactivar el adaptador deja el modelo base Qwen3.8-27B en 4 bits, que actúa como System 2 para chat ordinario, opcionalmente con modo de razonamiento.

En cuanto al entrenamiento, la información disponible menciona el corpus jev-distill-corpus-v3 (con un test_set_30k) y compara las distribuciones del modelo con las de un teacher, lo que apunta a un proceso de destilación, si bien no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO: esos datos figuran como no disponibles. El mismo adaptador y cabezal se comparten con autotrust/JEV-27B, la variante de solo texto.

## Capacidades

- Decisiones tipadas con probabilidades calibradas: responde preguntas de tipo bool (sí/no), choice (entre 2 y 256 opciones) y score (escala 0-5 con seis criterios) devolviendo una probabilidad por opción en una sola pasada.
- Entrada multimodal image-text-to-text: acepta imágenes mezcladas con texto en el estado de entrada, útil para clasificar productos, documentos o capturas a partir de su contenido visual.
- Modo de decisión por lotes: varias preguntas sobre un mismo estado se responden en una única llamada, como muestra el ejemplo del ticket de facturación con tres preguntas simultáneas.
- Calibración explícita: las temperaturas por tipo de pregunta permiten interpretar las probabilidades de forma más fiable que un softmax crudo.
- System 2 (chat generativo): al desactivar el adaptador, el modelo se comporta como Qwen3.8-27B en 4 bits, con generación de texto y modo de razonamiento opcional mediante `mlx_vlm generate`.
- Interfaz de línea de comandos: el subcomando `mlx_vlm decide` permite lanzar decisiones sin escribir código Python.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente inglés según la ficha del modelo.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica un mensaje de cliente en categorías como facturación, envíos o soporte técnico y devuelve la probabilidad de cada una, lo que permite derivar automáticamente casos ambiguos a revisión humana cuando ninguna categoría supera un umbral. El ejemplo de la model card (cargo duplicado por un café) devuelve 0,9979 de probabilidad para facturación.
- Detección de intención de reembolso: una pregunta bool bien formulada («¿el cliente está pidiendo un reembolso?») devuelve una probabilidad directamente utilizable como señal en un sistema de gestión de devoluciones, sin necesidad de parsear texto libre.
- Priorización por urgencia: la escala 0-5 con criterios (none, low, some, medium, high, critical) permite asignar un nivel de urgencia numérico a cada incidencia y ordenar la cola de trabajo de un equipo de atención.
- Categorización de anuncios de marketplace: combinando la imagen del listado con el título del vendedor, el modelo asigna el producto a una categoría del catálogo, lo que resulta adecuado para la moderación y el ordenamiento de inventario en plataformas de segunda mano.
- Verificación de respuestas de otros modelos: al emitir probabilidades calibradas en lugar de texto, puede usarse como árbitro en pipelines de evaluación automática, por ejemplo para decidir si una respuesta generada satisface un criterio binario.
- Selección de proveedor o SKU: el ejemplo publicado sobre el SKU AX-330 muestra su uso en compras o aprovisionamiento, discriminando entre cuatro respuestas posibles de proveedor con probabilidades repartidas (0,2548 / 0,1276 / 0,6169 / 0,0007 en esta conversión).
- Moderación de contenido con imagen: la combinación de entrada visual y pregunta binaria permite filtrar publicaciones o imágenes que incumplen una política concreta, dejando la probabilidad como criterio de escalado.
- Enriquecimiento y limpieza de datos de entrenamiento: al ser un modelo de 27B ejecutable en un Mac de 32 GB, puede etiquetar grandes lotes de pares texto-imagen con decisiones tipadas en local, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son de paridad frente a las salidas publicadas por el autor original:

| Ejemplo (model card original) | Publicado | Este checkpoint |
|---|---|---|
| choice, respuesta de proveedor SKU AX-330 (JEV-27B, vLLM) | 0,2541 / 0,1253 / 0,6200 / 0,0007 | 0,2548 / 0,1276 / 0,6169 / 0,0007 |
| choice, cargo duplicado → equipo (JEV-27B-VL, vLLM) | 0,9969 / 0,0000 / 0,0031 | 0,9979 / 0,0000 / 0,0021 |
| yes/no, paquete dañado → ¿reembolso? (JEV-27B, transformers) | 0,022 / 0,978 | 0,0222 / 0,9778 |

Sobre 36 filas reservadas de jev-distill-corpus-v3 (test_set_30k), la divergencia KL media de este checkpoint respecto a las distribuciones del teacher es de 0,027, con 34 de 36 coincidencias en la opción top-1; la KL publicada para JEV-27B en el conjunto de prueba es de aproximadamente 0,017 sobre 25 000 filas. Como referencia de cuantización, la validación del método se hizo con JEV-9B, que comparte protocolo, cabezal y formato de adaptador:

| JEV-9B en MLX | Coincidencia top-1 (texto / imágenes) | Diferencia max. / media de probabilidades (texto) |
|---|---:|---:|
| bf16 | 39/39 / 8/8 | 0,008 / 0,0012 |
| Base 8-bit + adaptador bf16 | 39/39 / 8/8 | 0,009 / 0,0014 |
| Base 6-bit + adaptador bf16 | 39/39 / 8/8 | 0,058 / 0,0058 |
| Base 4-bit + adaptador bf16 | 36/39 / 7/8 | 0,120 / 0,0193 |

Las mediciones se realizaron en un M2 Pro de 32 GB con MLX 0.32.3. El autor indica que una referencia bf16 de un modelo de 27B no cabe en 32 GB, motivo por el cual la paridad se validó en el modelo de 9B.

## Requisitos de hardware

- Memoria: aproximadamente 17 GB de memoria unificada en inferencia, lo que permite ejecutarlo en un Mac con 32 GB de RAM unificada.
- Hardware validado: Apple M2 Pro de 32 GB con MLX 0.32.3 (mediciones de paridad).
- GPU CUDA: no compatible; este checkpoint está en formato MLX y requiere Apple Silicon. Para GPU NVIDIA habría que usar el checkpoint original en PyTorch.
- GPU de consumo (RTX 4090 y similares): no aplica a este repositorio, al no ser un formato CUDA.
- Cabe en consumer: sí, en equipos Apple Silicon de 32 GB o más de memoria unificada.
- Opciones de despliegue: mlx-vlm, instalando la rama del PR `git+https://github.com/Bayway/mlx-vlm@add-jev` mientras el soporte no esté fusionado; posteriormente bastará con `pip install -U mlx-vlm`. Incluye los subcomandos `mlx_vlm decide` y `mlx_vlm generate`. No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI en este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bayway/JEV-27B-VL-MLX-4bit | 27,47 mil millones | no disponible | MLX, base 4-bit + LoRA bf16 | image-text-to-text + decisiones tipadas | Apache 2.0 | HuggingFace, conversión de terceros |
| autotrust/JEV-27B-VL | no disponible | no disponible | PyTorch (bf16), compatible con vLLM y transformers | image-text-to-text + decisiones tipadas | no disponible en la información consultada | HuggingFace, modelo original de AutoTrust AI |
| autotrust/JEV-27B | no disponible | no disponible | PyTorch, compatible con vLLM y transformers | decisiones tipadas solo texto | no disponible en la información consultada | HuggingFace, comparte adaptador y cabezal |
| mlx-community/Qwen3.8-27B-4bit | 27B (aproximado, no confirmado) | no disponible | MLX 4-bit afín, group size 64 | generación de texto e imagen (chat) | no disponible en la información consultada | HuggingFace, es el System 2 de este checkpoint |

La diferencia principal frente al original no está en la tarea sino en el soporte: este repositorio es una conversión a MLX con pérdida de precisión controlada (KL 0,027 frente al teacher en 36 filas, con 34/36 de coincidencia top-1), mientras que los checkpoints de AutoTrust AI son la referencia en PyTorch. Frente a Qwen3.8-27B-4bit, el valor añadido es el adaptador y el cabezal de decisión; desactivándolos, el comportamiento es el del modelo base.

## Limitaciones y advertencias

- Precisión reducida por la cuantización: en la validación con JEV-9B, la base de 4 bits baja a 36/39 coincidencias top-1 en texto y 7/8 en imágenes, con una diferencia máxima de probabilidad de 0,120 frente a bf16. Para decisiones con umbrales ajustados conviene tenerlo en cuenta.
- Soporte no estable: la integración de JEV en mlx-vlm sigue en revisión (PR #2463). Hasta que se fusione, es necesario instalar la rama del PR, lo que implica riesgo de cambios incompatibles.
- Idioma único: el modelo solo declara inglés, por lo que su uso con texto en castellano u otros idiomas no está soportado ni validado.
- Sensibilidad al formato de la pregunta: el protocolo exige formular las preguntas bool de manera que «verdadero» corresponda al resultado cuya probabilidad se desea, y declarar la escala en las preguntas de tipo score. Un enunciado mal construido degrada la calibración.
- Límite de slots entrenados: solo hay 24 slots entrenados y las 16 primeras opciones usan los slots del modelo; las opciones adicionales hasta 256 dependen de etiquetas extra, lo que puede reducir la fiabilidad en preguntas con muchas alternativas.
- Longitud de contexto desconocida: no se especifica en la información disponible, un dato crítico para planificar despliegues con entradas largas o muchas imágenes.
- Trazabilidad del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros. La credibilidad técnica recae en el modelo original de AutoTrust AI y en las mediciones de paridad publicadas por el autor de la conversión.
- Restricciones de licencia: este repositorio es Apache 2.0, lo que permite uso comercial, pero no se detalla en la información consultada la licencia de Qwen3.8-27B ni la del checkpoint original de AutoTrust AI; conviene verificarlas antes de un despliegue comercial.
- Riesgo de alucinación: el System 2 (chat generativo sobre Qwen3.8-27B) puede alucinar como cualquier modelo generativo. En System 1 el riesgo se traslada a la calibración de probabilidades, que debe validarse en el dominio concreto de uso.
- Sesgos: no se dispone de información sobre sesgos evaluados en la documentación proporcionada.
- Documentación incompleta: el README disponible está truncado y no incluye la totalidad de la sección de paridad ni la lista completa de benchmarks y limitaciones del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Bayway/JEV-27B-VL-MLX-4bit
- Modelo original multimodal: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo original de solo texto (mismo adaptador y cabezal): https://huggingface.co/autotrust/JEV-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion a 4 bits del modelo base: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Libreria MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Pull request de soporte para JEV: https://github.com/Blaizzy/mlx-vlm/pull/2463
- Rama de instalacion temporal: https://github.com/Bayway/mlx-vlm/tree/add-jev
- Informe de paridad del repositorio: PARITY.md (incluido en el repositorio de HuggingFace)
- Resultados de la busqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos corresponden a páginas genéricas de servicios de Google (Trends, Chrome, Traducción, Vídeos y formación de Workspace), sin relación con el modelo.
