# aselea/Kev-4B-MLX-Serve-8bit

## Resumen

Kev-4B-MLX-Serve-8bit es un empaquetado del modelo Kev-4B (jaredpalmer/kev-4b) para el servidor de inferencia mlx-serve, publicado por el usuario aselea. Kev-4B es a su vez un LoRA montado sobre Qwen3.5-4B-Base al que se le ha añadido una «cabeza de puntero» (pointer head) en lugar de una cabeza de modelado de lenguaje. El resultado no es un modelo generativo: responde a preguntas tipadas sobre un texto y devuelve probabilidades calibradas, sin producir nunca texto libre.

La tarea concreta es la clasificación de decisiones sobre un par de campos de entrada (`subject` y `body`). El modelo recibe una o varias preguntas con un tipo definido (`choice`, `noul` y `score`) y devuelve una probabilidad calibrada para cada una. Este empaquetado concreto pliega el LoRA dentro del modelo base, cuantiza el tronco a 8 bits afines con grupo de 64 y guarda la cabeza de puntero en `kev_head.safetensors`, junto con la temperatura de calibración en `kev_config.json`.

Con 4.205.751.296 parámetros totales y un repositorio de 4,5 GB, el modelo está pensado para desplegarse en Apple Silicon mediante mlx-serve, exponiendo el endpoint `POST /v1/decisions`. Los pesos se distribuyen en safetensors, sin ficheros de PyTorch ni pickle, lo que simplifica el servicio. Su relevancia radica en ofrecer una alternativa determinista y ligera a los LLM generativos para tareas de decisión binaria o puntuada con probabilidades calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5-4B-Base) con LoRA fusionada y cabeza de puntero (pointer head) en lugar de cabeza de lenguaje |
| Parametros totales | 4.205.751.296 (≈4,21 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín (group 64); existe build bf16 generado con `--q-bits 0` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); cabeza en `kev_head.safetensors`; configuración y temperatura de calibración en `kev_config.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder de aproximadamente 4 mil millones de parámetros, sobre el que se ha entrenado un LoRA. A diferencia de un ajuste fino convencional orientado a generación, Kev-4B sustituye la cabeza de modelado de lenguaje por una cabeza de puntero que produce probabilidades sobre decisiones tipadas. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El empaquetado para mlx-serve realiza tres operaciones: pliega los pesos del LoRA dentro del modelo base siguiendo el procedimiento que Kev aplica en MLX, cuantiza el tronco a 8 bits afines con tamaño de grupo 64 y almacena la cabeza de puntero por separado en `kev_head.safetensors`, con la temperatura de calibración en `kev_config.json`. La conversión se realizó con el script `tests/convert_kev_weights.py` del repositorio de mlx-serve. No se requiere PyTorch ni ficheros pickle para servir el modelo.

## Capacidades

- Clasificación de decisiones sobre texto: responde a preguntas tipadas con probabilidades calibradas en lugar de texto libre.
- Tipos de pregunta soportados: `choice`, `noul` y `score`.
- Recibe un estado estructurado con los campos `subject` y `body`.
- Devuelve probabilidades calibradas gracias a la temperatura almacenada en `kev_config.json`.
- No genera texto en ningún caso: su salida es una distribución sobre las opciones de cada pregunta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües ni un listado de idiomas soportados.
- No se documentan capacidades de visión, audio ni modo «thinking».

## Casos de uso

- Triaje de tickets de soporte: dado el asunto y el cuerpo de un ticket, el modelo puede responder a preguntas del tipo «¿el cliente solicita un reembolso?» con una probabilidad calibrada, lo que permite enrutar automáticamente la incidencia al equipo adecuado.
- Clasificación de correo entrante: con los campos `subject` y `body` se pueden formular preguntas binarias o de elección múltiple para etiquetar el correo por categoría y prioridad sin necesidad de un LLM generativo.
- Moderación de contenido con umbral de probabilidad: al devolver probabilidades calibradas, es posible fijar umbrales ajustados para decidir si un texto requiere revisión humana, aprovechando la naturaleza calibrada de la salida.
- Extracción de decisiones en pipelines de datos: integrado a través de `POST /v1/decisions`, el modelo puede actuar como un paso determinista dentro de un pipeline que necesite etiquetas estructuradas sobre documentos.
- Encuestas y formularios con preguntas condicionales: cada pregunta tipada (`choice`, `noul`, `score`) se evalúa sobre el mismo estado, lo que permite obtener múltiples decisiones a partir de un único texto de entrada.
- Verificación de condiciones en flujos de negocio: por ejemplo, comprobar si un texto cumple una condición concreta mediante el tipo `noul`, devolviendo una probabilidad que alimente una regla de decisión posterior.
- Análisis de opiniones con puntuación: el tipo `score` permite obtener una valoración numérica calibrada sobre un texto, útil para agregar métricas sin recurrir a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 4,2 GB de pesos (repositorio de 4,5 GB); sumando activaciones y caché, se recomienda contar con unos 5-6 GB de memoria disponible.
- Build bf16 (`--q-bits 0`): aproximadamente 8,4 GB solo en pesos, sin contar activaciones.
- Dado que la librería es MLX, el despliegue está orientado a Apple Silicon (familias M1, M2, M3 y M4) con memoria unificada; con 8 GB puede ser ajustado y 16 GB o más resulta cómodo.
- En GPUs NVIDIA o AMD no hay soporte nativo, ya que MLX no se ejecuta sobre CUDA ni ROCm.
- Opciones de despliegue: mlx-serve, exponiendo el endpoint `POST /v1/decisions`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| aselea/Kev-4B-MLX-Serve-8bit | 4,21B | no disponible | Clasificación de decisiones tipadas | Apache-2.0 | safetensors MLX 8-bit |
| jaredpalmer/kev-4b | base de ~4B | no disponible | Clasificación de decisiones tipadas | Apache-2.0 | no disponible |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Modelo de lenguaje generativo | Apache-2.0 | safetensors |

La comparación con alternativas de la misma categoría (clasificadores ligeros con salida calibrada) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas redactadas no es adecuado para este modelo.
- Los sesgos conocidos no están documentados en la información disponible; cabe esperar los sesgos heredados del dataset de entrenamiento del LoRA y de Qwen3.5-4B-Base.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a la calibración de las probabilidades; una temperatura mal ajustada puede producir confianza excesiva o insuficiente.
- El tipo de pregunta `noul` aparece en la model card sin explicación de su semántica, lo que puede dificultar su uso correcto sin consultar el repositorio de mlx-serve.
- No se declaran los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- La longitud de contexto no está documentada, lo que limita la planificación de entradas largas.
- El despliegue está atado a MLX y a mlx-serve, lo que restringe el uso a Apple Silicon y descarta GPUs NVIDIA o AMD.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones heredadas del modelo base Qwen3.5 y de Kev-4B.
- El número de descargas (8) y de «likes» (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aselea/Kev-4B-MLX-Serve-8bit
- Modelo base Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base de Qwen3.5: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve

Nota: los resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo.
