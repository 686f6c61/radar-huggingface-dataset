# lothnic/themis-0.8b

## Resumen

Themis 0.8B es un modelo de decisión de texto, desarrollado por el usuario de Hugging Face lothnic (Mayank Joshi en GitHub), que no genera lenguaje: recibe un caso en texto y un conjunto de preguntas tipadas definidas en tiempo de inferencia, y devuelve en una única pasada hacia delante una distribución de probabilidad para cada pregunta. Está construido sobre el decoder de texto Qwen3.5-0.8B mediante un ajuste fino con LoRA, cuyos adaptadores se conservan dentro del checkpoint completo, y añade un encoder de decisiones propio que renderiza el caso, las preguntas y las opciones, y puntúa el estado oculto previo a un marcador `<answer>` contra las filas de embedding congeladas de los códigos de respuesta válidos.

El modelo resuelve un problema concreto: sustituir la generación y el posterior parseo de texto por una predicción estructurada y calibrada. Soporta tres tipos de pregunta: `choice` (entre 2 y 255 opciones nombradas por el llamante), `noul` (sí/no, con la distribución interna `[P(true), P(false)]`) y `score` (lista ordenada de niveles, con índice más probable y valor esperado). Esto lo hace útil como componente de enrutado, triaje o verificación dentro de pipelines mayores, donde interesa una probabilidad y una confianza en lugar de una cadena de texto que haya que interpretar.

Su relevancia actual es doble: por un lado, es un ejemplo de arquitectura híbrida (capas de atención lineal con compuertas combinadas con capas de atención completa) aplicada a una tarea discriminativa; por otro, introduce una interfaz tipada donde el vocabulario de etiquetas no está fijado en el modelo, sino que se define en cada petición. El contexto renderizado está limitado a 2.048 tokens y el modelo tiene 774.038.336 parámetros totales, de los cuales 752.393.024 corresponden al backbone y 21.645.312 a los adaptadores LoRA. La versión publicada es la v0, con checkpoint en el paso 4.153, seleccionado por entropía cruzada suave de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen3.5 híbrido: 24 capas, 18 de atención lineal con compuertas (gated linear attention) y 6 de atención completa; con encoder de decisiones y cabeza de puntuación acoplados |
| Parametros totales | 774.038.336 (dato real de safetensors) = 752.393.024 del backbone + 21.645.312 de adaptadores LoRA |
| Parametros activos | No aplica: no es un modelo MoE. Se activan los 774.038.336 en cada pasada |
| Longitud de contexto | 2.048 tokens renderizados (caso + preguntas + opciones + plantilla); las peticiones que lo superan lanzan un error en lugar de truncar |
| Tipos de cuantizacion | No disponible. Solo validados bfloat16 (CUDA) y float32 (CPU); otros aceleradores y runtimes cuantizados no han sido verificados |
| Idiomas soportados | No disponible: la model card no declara cobertura de idiomas y el modelo es solo texto |
| Licencia | Apache 2.0 (ver LICENSE y NOTICE en el repositorio) |
| Formato de pesos | safetensors, cargable con transformers y `trust_remote_code=True` |
| Opciones por pregunta | 2 a 255, limitado por la ventana de contexto |
| Tipos de pregunta | `choice`, `noul` (sí/no), `score` (escala ordinal) |
| Checkpoint publicado | Paso 4.153, seleccionado por entropía cruzada suave de validación |
| Tamaño del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-17 |

## Arquitectura y entrenamiento

Themis reutiliza el decoder Qwen3.5-0.8B, formado por 24 capas: 18 capas de atención lineal con compuertas y 6 capas de atención completa. Sobre esa base se introduce un cambio de máscara: las capas de atención completa reciben máscaras bidireccionales sobre los tokens reales, mientras que las capas de atención lineal conservan su recurrencia hacia delante; el padding queda excluido de las claves de atención completa. Esta combinación permite que cada pregunta vea evidencia posterior en la secuencia (útil para resolver ambigüedades con el contexto completo) sin perder el coste lineal de las capas recurrentes.

El flujo de inferencia no usa generación. El encoder renderiza el caso, todas las preguntas y las descripciones de respuesta, y a continuación inserta marcadores fijos `<answer>`. Para cada pregunta, el estado oculto inmediatamente anterior a su marcador se compara contra las filas de embedding congeladas de los códigos de respuesta válidos de esa pregunta, y se aplica softmax únicamente sobre esas opciones, de modo que la distribución no se contamina con el resto del vocabulario. El mapeo del tokenizador verifica 255 códigos distintos de un solo token, lo que fija el máximo de opciones por pregunta. El embedding `<answer>` se inicializó a partir de la media de los embeddings existentes. Los adaptadores LoRA entrenados se mantienen dentro del checkpoint completo para preservar la ruta numérica usada en la evaluación, y el repositorio es autocontenido (no requiere descargar el modelo base por separado).

En cuanto a los datos de entrenamiento, la model card solo referencia el dataset `lothnic/themis-decision-mixture`; no se especifican el número de tokens, la composición del corpus ni si hubo RLHF o DPO. La calibración se aplica mediante escalado de temperatura positivo, activado por defecto, que preserva la respuesta más probable de cada pregunta pero puede alterar un valor esperado o una decisión basada en umbral; se puede desactivar con `calibrated=False` para obtener probabilidades crudas.

## Capacidades

- Predicción estructurada de decisiones: devuelve `answer`, `probabilities` y `confidence` por cada pregunta, en una sola pasada hacia delante y sin generar ni parsear texto.
- Preguntas de tipo `choice`: el llamante define nombres de opción y descripciones arbitrarias; la respuesta es uno de esos nombres y las probabilidades usan esas mismas claves.
- Preguntas de tipo `noul`: decisión booleana con claves de probabilidad siempre `"true"` y `"false"`.
- Preguntas de tipo `score`: escala ordinal definida como lista de menor a mayor; devuelve el índice de nivel más probable (base cero) y `expected_score` como media ponderada por probabilidad.
- Múltiples preguntas simultáneas: una única petición puede contener varias preguntas y resolverse en el mismo paso.
- Calibración integrada: escalado de temperatura positivo por defecto, con opción de desactivarlo.
- Gestión estricta del contexto: si la petición renderizada supera los 2.048 tokens, se lanza un error en lugar de truncar la evidencia de forma silenciosa.
- Saneamiento de entradas: las cadenas literales de tokens especiales introducidas por el usuario se escapan en el encoder.
- No soporta `pipeline("text-classification")` estándar ni `.generate()`: la interfaz es el método `predict()` con peticiones tipadas, cargado mediante código remoto.
- No dispone de tool calling, capacidad de agente multi-paso, visión ni audio: emite distribuciones de probabilidad, no llamadas a herramientas ni texto libre.
- Cobertura multilingüe: no disponible, no declarada en la documentación.

## Casos de uso

- Triaje de tickets de soporte: con una pregunta `choice` de opciones `billing`, `technical` y `sales`, más una `noul` de revisión manual y una `score` de urgencia, el modelo resuelve el enrutado completo en una sola pasada. Es el escenario del ejemplo de la model card (cliente con doble cobro que pide reembolso) y encaja porque la ventana de 2.048 tokens cubre holgadamente el ticket medio junto con las descripciones de las opciones.
- Verificación de salidas de otro modelo (juez binario): una pregunta `noul` permite obtener `P(true)` de que una respuesta cumple un criterio, y aplicar después un umbral ajustable. La calibración por temperatura hace que el umbral tenga un significado más estable que un simple sí/no generado.
- Moderación y clasificación de contenido con política dinámica: las etiquetas se definen en cada petición, así que se puede cambiar la política editorial sin reentrenar; útil cuando las categorías cambian con frecuencia. El límite de 255 opciones por pregunta permite taxonomías detalladas.
- Enrutado de herramientas en un pipeline de agentes: el modelo no ejecuta herramientas, pero puede actuar como clasificador previo que decide qué herramienta o subflujo corresponde a la consulta, con una distribución que permite abstenerse si la confianza es baja.
- Codificación de encuestas y feedback en escalas ordinales: para comentarios de texto libre con una pregunta `score` de niveles tipo bajo/medio/alto, `expected_score` ofrece una variable numérica continua directamente agregable, sin necesidad de anotación manual.
- Detección de casos que requieren revisión humana en flujos regulados: una pregunta `noul` con umbral conservador sobre `P(true)` permite derivar a un experto solo la fracción de casos dudosos, reduciendo carga de revisión con un criterio auditable y reproducible.
- Anotación asistida y active learning: al devolver `confidence` por pregunta, se pueden priorizar para etiquetado humano las muestras con menor confianza, en lugar de muestrear al azar.
- Extracción de decisiones múltiples sobre un mismo documento: al admitir varias preguntas por petición, un mismo fragmento de texto se evalúa contra varios criterios (idioma, tema, sensibilidad, prioridad) con un solo forward pass de 0,77 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de conjuntos de evaluación de clasificación, y tampoco se aportan métricas de accuracy, F1 o calibración (ECE) frente a alternativas. El único dato de selección de checkpoint es cualitativo respecto al criterio: paso 4.153, elegido por entropía cruzada suave de validación.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 1,6 GB solo de pesos (el repositorio completo ocupa 1,6 GB), más activaciones para 2.048 tokens; en la práctica cabe en cualquier GPU con 4 GB o más.
- VRAM estimada en float32: en torno a 3,1 GB de pesos, más activaciones; manejable en GPU de 8 GB o en CPU.
- Entorno de referencia verificado: CUDA con bfloat16 en una RTX 4060 Laptop GPU (8 GB). Es la única configuración declarada como validada localmente.
- Cabe en GPU de consumo: sí, con margen amplio en RTX 3060, 4060, 4070, 4080, 4090, así como en GPUs de datacenter (A100, H100) donde el modelo quedará muy infrautilizado.
- Inferencia en CPU: soportada cargando con `dtype=torch.float32` y dejando el modelo en CPU; la model card advierte que los resultados en CPU pueden diferir ligeramente de los obtenidos en CUDA con bfloat16.
- Despliegue: mediante `transformers` con `trust_remote_code=True` y las versiones probadas (Python 3.12, torch 2.14.1, transformers 5.19.0, peft 0.21.2, tokenizers 0.23.3); `flash-linear-attention==0.5.2` es una aceleración CUDA opcional usada en las evaluaciones locales reportadas.
- No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni otros runtimes: la arquitectura y el encoder son código personalizado y la interfaz no es la estándar de `text-classification`, por lo que estos motores no pueden servirlo sin trabajo de adaptación.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.
- Recomendación práctica: fijar `revision` a un commit concreto al usar código remoto, para garantizar reproducibilidad.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables: Themis ocupa una categoría poco poblada (modelo de decisión con vocabulario de etiquetas definido en inferencia y salida de distribuciones calibradas). La tabla recoge los pocos puntos de referencia hallados.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lothnic/themis-0.8b | 774 M (752 M backbone + 21,6 M LoRA) | 2.048 tokens renderizados | Distribuciones tipadas (`choice`, `noul`, `score`) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | 752 M en el backbone de Themis | No disponible | Texto generado | No disponible | Hugging Face |
| project-themis/Themis-RM-8B-PMP | 8 B (según el nombre; no verificado) | No disponible | Modelo de recompensa / puntuación | No disponible | Hugging Face; sin relación con este modelo pese al nombre |

Frente al modelo base Qwen3.5-0.8B, la diferencia no es de tamaño sino de interfaz: Themis no genera texto y por tanto no requiere parseo ni validación posterior de la respuesta, a cambio de perder toda capacidad generativa y de quedar atado a un máximo de 255 opciones y 2.048 tokens. Frente a clasificadores encoder-only clásicos, la ventaja declarada es el vocabulario dinámico por petición; no hay datos públicos para comparar precisión con esas alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no soporta `.generate()` ni el pipeline estándar de `text-classification`. Cualquier integración debe usar el método `predict()` con peticiones tipadas, lo que implica código específico y no permite sustituirlo por otro modelo sin cambiar la interfaz.
- Requiere `trust_remote_code=True`: se ejecuta código del autor del repositorio. Es un riesgo de seguridad en producción y obliga a revisar el código y fijar una revisión concreta.
- Validación muy limitada: la model card solo declara verificación local en una RTX 4060 Laptop con bfloat16 y CUDA; CPU, otras GPUs y runtimes cuantizados no han sido validados y pueden producir resultados distintos.
- Contexto corto: 2.048 tokens renderizados que incluyen el caso, todas las preguntas, las descripciones de opción y la plantilla. Documentos largos o muchas preguntas con descripciones extensas agotan el presupuesto rápido; el modelo lanza error en ese caso, lo que exige gestionar la excepción en producción.
- Límite de 255 opciones por pregunta, impuesto por el mapeo de tokens de un solo carácter/código verificado en el tokenizador.
- Riesgo de alucinación en el sentido generativo: no aplica, porque no produce texto libre. El riesgo equivalente es una distribución mal calibrada o una confianza alta sobre una decisión incorrecta; no se publican métricas de calibración que permitan cuantificarlo.
- Sesgos: no disponible. No se documenta composición del dataset de entrenamiento (`lothnic/themis-decision-mixture`), número de tokens ni proceso de filtrado, por lo que no se pueden evaluar sesgos por dominio, idioma o demografía.
- Idiomas: no se declara cobertura. El backbone Qwen3.5 es multilingüe en su uso generativo, pero no hay garantía de que el ajuste fino de decisión conserve ese comportamiento en castellano.
- La calibración por defecto altera los valores esperados y las decisiones por umbral respecto a las probabilidades crudas; conviene fijar explícitamente `calibrated` en cada llamada para evitar cambios de comportamiento entre versiones.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, versión v0 y publicación reciente, sin evidencia de uso en terceros ni de mantenimiento continuado.
- Licencia Apache 2.0, que permite uso comercial, pero obliga a revisar LICENSE y NOTICE del repositorio y a conservar los avisos correspondientes.
- Homónimos frecuentes: existen otros proyectos con el nombre Themis (un modelo de recompensa de 8 B en Hugging Face, la web themisai.io y el repositorio GitHub Lothnic/Themis, que describe un modelo planificado), sin relación con este checkpoint; conviene no confundir documentación al evaluarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lothnic/themis-0.8b
- Perfil del autor en Hugging Face: https://huggingface.co/lothnic
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/lothnic/themis-decision-mixture
- Repositorio GitHub del proyecto: https://github.com/Lothnic/Themis
- Perfil del autor en GitHub: https://github.com/Lothnic/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

Enlaces no relacionados con este modelo, pese a compartir nombre: https://huggingface.co/project-themis/Themis-RM-8B-PMP y https://www.themisai.io/. No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada.
