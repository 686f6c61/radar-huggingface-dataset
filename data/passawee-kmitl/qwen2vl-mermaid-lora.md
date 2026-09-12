# passawee-kmitl/qwen2vl-mermaid-lora

## Resumen

Este repositorio no es un modelo completo, sino un conjunto de tres adaptadores LoRA (PEFT) entrenados con QLoRA sobre el modelo vision-lenguaje Qwen/Qwen2-VL-2B-Instruct. Su tarea es convertir imagenes de diagramas de flujo (flowcharts) en codigo Mermaid con formato `flowchart TD`, es decir, transformar una captura o imagen de un diagrama en texto estructurado que pueda renderizarse y versionarse. Lo publica el usuario passawee-kmitl bajo licencia Apache 2.0.

Los tres adaptadores se diferencian por dos decisiones de entrenamiento: el formato de destino (bloque, `adapter_final` y `adapter_final_v2`, frente a formato en linea, `adapter_final_v3`) y la mascara de perdida (solo tokens de relleno en v1, solo tokens del asistente en v2 y v3). El repositorio incluye ademas el dataset de entrenamiento (270 muestras sinteticas en tres niveles de dificultad) y los ficheros `results_*.json` con las predicciones sin procesar de cada variante, de modo que las metricas pueden recalcularse en CPU.

Es relevante como ejemplo reproducible de ajuste fino eficiente de un VLM pequeno (2B de parametros del modelo base) en hardware de gama de consumo: el entrenamiento se realizo en una unica GPU Colab T4 con cuantizacion de 4 bits NF4, precision fp16, LoRA con rango 16 y 3 epocas. Tambien es util como linea base de investigacion sobre como afectan el formato de objetivo y la mascara de perdida al rendimiento en tareas de imagen-a-codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only multimodal (Qwen/Qwen2-VL-2B-Instruct); el adaptador no modifica la arquitectura del modelo base |
| Parametros totales | Modelo base: 2B (segun la denominacion Qwen2-VL-2B-Instruct). Tamano de los adaptadores: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el adaptador no altera este parametro del modelo base) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 con fp16; los pesos publicados son adaptadores en safetensors sin cuantizar; no se documentan otros formatos |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el dataset se distribuye como `dataset.zip` y las predicciones como `results_*.json` |
| Libreria | peft |
| Modelo base | Qwen/Qwen2-VL-2B-Instruct |
| Variantes incluidas | `adapter_final/` (v1), `adapter_final_v2/` (v2), `adapter_final_v3/` (v3) |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | 270 muestras sinteticas en tres niveles: simple, complejo y desordenado (messy) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-VL-2B-Instruct, un transformer decoder-only con capacidad de vision (VLM) que procesa imagenes junto con texto. Sobre el se aplican adaptadores LoRA de rango 16 mediante PEFT, entrenados con QLoRA: el modelo base se carga cuantizado en 4 bits con el esquema NF4 y el entrenamiento se ejecuta en fp16. Todo el ajuste se hizo en una unica GPU Colab T4 durante 3 epocas, lo que sitúa el coste de entrenamiento en el rango de una GPU de 16 GB de VRAM.

Las tres variantes exploran dos ejes de diseno. El primero es el formato de salida: v1 y v2 generan el diagrama en formato de bloque (`flowchart TD` con bloques), mientras que v3 genera el formato en linea. El segundo es la mascara de perdida: v1 usa una mascara de perdida que solo ignora los tokens de relleno (pad-only), de modo que el modelo tambien aprende de la parte de la secuencia correspondiente al prompt; v2 y v3 usan mascara restringida a los tokens del asistente (assistant-only), de modo que solo se optimiza la respuesta objetivo. No se documenta en la informacion disponible el uso de RLHF, DPO u otras fases de alineamiento adicionales, ni el numero de tokens de entrenamiento, ni la composicion detallada del dataset mas alla de los tres niveles de dificultad y su caracter sintetico. Tampoco se documentan innovaciones tecnicas mas alla del propio esquema QLoRA.

## Capacidades

- Conversion de imagen a codigo: transforma imagenes de diagramas de flujo en codigo Mermaid con encabezado `flowchart TD`.
- Dos formatos de salida segun el adaptador elegido: formato de bloque (v1 y v2) y formato en linea (v3).
- Percepcion visual: hereda del modelo base la capacidad de procesar imagenes como entrada, no solo texto.
- Manejo de diagramas con distintos grados de calidad: el dataset de entrenamiento incluye niveles simple, complejo y desordenado, por lo que el adaptador esta expuesto a diagramas ruidosos o mal dibujados.
- Recalculo de metricas en CPU: el repositorio publica las predicciones crudas (`results_*.json`) de cada variante.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Documentacion tecnica versionable: convertir capturas de diagramas de flujo en bloques Mermaid dentro de ficheros Markdown, de modo que el diagrama pase a ser texto revisable en un pull request en lugar de una imagen binaria.
- Migracion de diagramas heredados: tomar exportaciones en imagen de herramientas como Visio o draw.io y generar el equivalente en Mermaid para eliminar dependencias de software propietario.
- Automatizacion en CI/CD: un trabajo que detecte imagenes nuevas en un directorio de documentacion, las pase por el adaptador y abra una propuesta de cambios con el Mermaid generado para revision humana.
- Preetiquetado de datasets de diagramas: usar el adaptador para generar una primera version del codigo Mermaid que despues se corrige manualmente, reduciendo el coste de anotacion en proyectos de imagen-a-codigo.
- Accesibilidad y descripcion estructural: obtener una representacion textual de la estructura de un diagrama (nodos y aristas) que pueda diffundirse a lectores de pantalla o a herramientas de analisis, en lugar de una imagen opaca.
- Apoyo docente: convertir diagramas de apuntes o de pizarra fotografiados a codigo Mermaid editable para material de clase.
- Investigacion sobre ajuste fino de VLMs: comparar las tres variantes publicadas para medir el efecto del formato de objetivo y de la mascara de perdida en tareas de imagen-a-codigo, reutilizando los `results_*.json` sin necesidad de volver a entrenar.
- Prototipado en hardware limitado: desplegar el adaptador sobre el modelo base de 2B en una GPU de gama de consumo para validar un flujo de conversion antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de ficheros `results_*.json` con las predicciones crudas de cada variante, pero no incluye cifras de metricas (ni exactitud, ni similitud de codigo, ni ninguna otra) en el material proporcionado. No se dispone tampoco de comparaciones con otros modelos o adaptadores.

| Benchmark | Resultado |
|---|---|
| Metricas de conversion imagen-Mermaid | No disponible (solo se referencian predicciones crudas en `results_*.json`) |
| Comparacion con modelos similares | No disponible |

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato publicado. Como referencia orientativa, el modelo base de 2B parametros ocupa aproximadamente 4-5 GB en fp16 y alrededor de 1,5-2,5 GB con cuantizacion de 4 bits, a lo que hay que sumar la memoria de activaciones asociada a los tokens de imagen, que puede ser considerable. Estas cifras son estimaciones a partir del tamano del modelo base, no datos verificados del repositorio.
- GPU de entrenamiento confirmada: una unica GPU Colab T4 (16 GB de VRAM), con QLoRA en 4 bits NF4 y fp16.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para reproducir el entrenamiento (T4, V100, RTX 4080/4090, A100). Para inferencia, una GPU de 8-12 GB deberia ser suficiente segun la estimacion anterior.
- Viabilidad en GPU de consumo: si, el modelo base de 2B con cuantizacion de 4 bits esta dentro del rango de tarjetas como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; no hay confirmacion del autor sobre configuraciones concretas.
- Opciones de despliegue: al ser adaptadores PEFT, el uso natural es `transformers` + `peft` cargando el adaptador sobre Qwen/Qwen2-VL-2B-Instruct. El soporte en otros servidores depende de si admiten LoRA sobre modelos de vision-lenguaje; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador ni de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La unica comparacion verificable es contra el propio modelo base sin ajustar, que no realiza la tarea especifica de conversion a Mermaid.

| Modelo | Parametros | Contexto | Rendimiento en imagen-Mermaid | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| passawee-kmitl/qwen2vl-mermaid-lora (v1, v2, v3) | Adaptadores sobre un base de 2B | No disponible | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2-VL-2B-Instruct (sin adaptador) | 2B | No disponible | No disponible (no esta ajustado a la tarea) | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores de imagen a Mermaid | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otros VLMs pequenos ajustados a imagen-codigo | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta entrenado unicamente para diagramas de flujo y para el encabezado `flowchart TD`. No cubre otros tipos de diagrama Mermaid (secuencia, clases, entidad-relacion, Gantt) ni otros lenguajes de diagramacion.
- Dataset pequeno y sintetico: 270 muestras generadas de forma sintetica en tres niveles de dificultad. La generalizacion a diagramas reales, con tipografias, colores, iconos y anotaciones arbitrarias, no esta demostrada.
- Riesgo de alucinacion: al tratarse de un modelo generativo, puede inventar nodos, etiquetas o conexiones que no aparecen en la imagen, o transcribir mal el texto de las etiquetas. No se publican metricas que cuantifiquen este error.
- Ambiguedad entre variantes: los tres adaptadores producen formatos de salida distintos y usan mascaras de perdida distintas. Mezclarlos o elegir el incorrecto puede dar lugar a salidas inconsistentes con el formato esperado.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni una evaluacion independiente.
- Idiomas no declarados: la model card no especifica idiomas de entrenamiento ni de soporte. Aunque el modelo base es multilingue, se desconoce en que idioma estan las etiquetas del dataset y como se comportara con texto en castellano u otros idiomas.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. Conviene verificar de forma independiente los terminos del modelo base Qwen/Qwen2-VL-2B-Instruct, que no se recogen en la informacion proporcionada, ya que el uso derivado queda sujeto tambien a esas condiciones.
- Caveat de metadatos: las fechas de creacion y actualizacion del repositorio (2026) son posteriores a la fecha habitual de publicacion, y el pipeline no esta declarado. Conviene contrastar la informacion del repositorio antes de integrarlo en produccion.
- Sin soporte de tool calling ni de agentes documentado: no se debe asumir que el adaptador puede encadenar llamadas a herramientas o mantener razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/passawee-kmitl/qwen2vl-mermaid-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Paper, blog o demo del adaptador: no disponible en la informacion proporcionada
- Repositorio de codigo asociado: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a Reddit (https://www.reddit.com/, https://www.reddit.com/r/all/, https://www.reddit.com/r/Piracy/wiki/megathread/) y a un hilo de Experts Exchange sobre migracion de tenants de Microsoft 365, sin relacion con el modelo.
