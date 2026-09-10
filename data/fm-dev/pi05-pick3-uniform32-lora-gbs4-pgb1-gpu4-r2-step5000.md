# fm-dev/pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step5000

## Resumen

Este repositorio contiene un ajuste fino LoRA de segunda ronda (`r2`) sobre el modelo base π0.5 para la tarea de manipulación robótica denominada **pick3**, en el checkpoint 5.000. Lo publica el usuario `fm-dev` y está etiquetado como `robotics`, `pi05`, `franka` y `lora`. No es un modelo de lenguaje general: es una política vision-language-action que consume imágenes y estado del robot y emite comandos de acción continua para un brazo Franka.

El entrenamiento se realizó localmente en **4 GPU RTX A6000**, con batch global 4, batch por GPU 1 y sin acumulación de gradientes. El checkpoint 5.000 corresponde a **20.000 exposiciones de muestra**, dentro de un run que apunta a 12.500 actualizaciones del optimizador y 50.000 exposiciones. La model card advierte de forma explícita que la publicación intermedia no constituye una evaluación de calidad de la política y que, en caso de incluir evaluación offline, esta no establece una tasa de éxito en robot real.

El interés de esta ficha es acotado y muy específico: sirve como punto de control reproducible dentro de una campaña de entrenamiento (los pasos 5.000, 10.000 y 12.500 tienen repositorio propio) y como artefacto con estado de reanudación completo, no como modelo listo para producción. El repositorio ocupa 12,8 GB e incluye pesos EMA de servicio, activos de normalización e historial, código de inferencia y el estado completo de reanudación (no EMA, optimizador, RNG y sampler). La licencia no está especificada en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino LoRA (rango 32) sobre el modelo base π0.5; la model card no documenta la arquitectura interna del base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en tokens de lenguaje; la política usa 32 fotogramas muestreados uniformemente sobre el prefijo de episodio observado [0,t], con 512 tokens visuales |
| Tipos de cuantizacion | no disponible; se publican pesos EMA de servicio y estado de reanudación, sin variantes GGUF/INT8 documentadas |
| Idiomas soportados | no disponible (no aplica: la entrada es imagen y estado numérico, no texto) |
| Licencia | no disponible (la model card y las etiquetas del repositorio no la especifican) |
| Formato de pesos | no disponible de forma explícita; el bundle incluye pesos EMA, activos de normalización e historial, código de inferencia, versiones exactas de dependencias y estado de reanudación (no EMA, optimizador, RNG, sampler). Tamaño total del repositorio: 12,8 GB |
| Tarea | pick3 (manipulación robótica) |
| Robot objetivo | Franka |
| Espacio de acciones | salida de forma (20, 8): xyz absoluto, cuaternión unitario XYZW en la carta de qx positiva y comando de gripper en [0,1] |
| Normalizacion | estado y acciones numéricas con normalización STD; los tokens de estado usan una vista acotada train-q01/q99 |
| Hardware de entrenamiento | 4 x RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradientes |
| Checkpoint | paso 5.000 (de un objetivo de 12.500 actualizaciones) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre π0.5, no un modelo entrenado desde cero. La configuración de optimización documentada es AdamW con semilla 42, warmup de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. El promedio exponencial de pesos (EMA) aplicado es 0,999^4 = 0,996005996001. Los checkpoints se guardan cada 1.000 actualizaciones y también en el paso final 12.500; los pasos 5.000, 10.000 y 12.500 cuentan con repositorio independiente, mientras que el resto se conservan en un archivo de respaldo con estructura `task/method/stepN/`, los mismos ficheros de carga y el estado de reanudación completo.

La innovación metodológica destacable es el esquema **Uniform32**: 32 fotogramas muestreados uniformemente sobre el prefijo completo de episodio observado [0,t], que aportan 512 tokens visuales e incluyen el historial de demostraciones. Las embeddings de estado histórico están desactivadas. Solo las filas de ejecución del robot supervisan las acciones; las imágenes, características y coordenadas originales de episodio y fotograma de las demostraciones permanecen disponibles como historial, y el inicio de la ejecución no reinicia el historial visual. Los splits de episodios y la normalización se calculan únicamente con el split de entrenamiento.

Los componentes de acción desconocidos permanecen como NaN o `false` en el dataset de entrenamiento y se enmascaran tanto en el condicionamiento de flujo (*flow conditioning*) como en la pérdida. La lista de componentes completamente sin supervisión declarada es vacía (`[]`), pero la model card matiza que la salida de gripper de la tarea Shuffle no tiene supervisión de comando y no debe interpretarse como control aprendido de gripper, y que Button Order solo dispone de etiquetas verificadas limitadas de comando de cierre.

## Capacidades

- Generación de acciones de manipulación continua para un brazo Franka: la política emite tensores de forma (20, 8) con posición xyz absoluta, orientación como cuaternión unitario XYZW en la carta de qx positiva y comando de gripper en [0,1].
- Condicionamiento por historial visual: integra hasta 32 fotogramas del prefijo de episodio con 512 tokens visuales, incluyendo fotogramas de demostración como contexto histórico.
- Reanudación exacta de entrenamiento: el repositorio conserva estado de optimizador, RNG y sampler, además de los pesos no EMA, lo que permite continuar el run desde el paso 5.000.
- API de inferencia propia: el bundle se carga con `from load_model import load, observe; policy = load()`, y para modelos con historial se debe invocar `observe(policy, base_rgb, state)` en cada fotograma observado, incluidos los de demostración, reseteando entre episodios.
- Modo Status-D: requiere de forma explícita `history_keyframe_index` (un fotograma observado o `None`), `current_subgoal` y entradas causales `transition_context_*` en `policy.infer(...)`; su salida incluye `transition_status`.
- Tool calling / function calling: no aplica. No es un modelo de lenguaje con soporte de herramientas.
- Agentes y razonamiento multi-paso en lenguaje: no aplica; no se documenta ninguna capacidad de este tipo.
- Capacidades multilingües: no aplica ni se documentan.
- Capacidades especiales (modo thinking, visión, audio): visión sí, como entrada; no se documenta audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación pick-and-place sobre Franka en laboratorio: la política genera directamente comandos de efector final y gripper para la tarea pick3, con condicionamiento visual de hasta 32 fotogramas, lo que permite afrontar secuencias con distintas fases de la tarea.
- Reanudación de campañas de entrenamiento largas: el estado completo de reanudación (optimizador, RNG, sampler) permite retomar el run en el paso 5.000 sin recalcular el historial de optimización, algo poco habitual en repositorios de adaptadores LoRA.
- Barrido comparativo de checkpoints: junto con los repositorios independientes de los pasos 10.000 y 12.500, y los checkpoints intermedios del archivo de respaldo, permite estudiar la evolución de la política a lo largo del entrenamiento con la misma receta y semilla.
- Desarrollo de una segunda fase de fine-tuning: al ser un adaptador LoRA de rango 32 sobre π0.5, sirve como punto de partida para ajustes posteriores sobre nuevas tareas o nuevos conjuntos de demostraciones del mismo robot.
- Validación de convenciones de pose y control: la model card insiste en que la convención cartesiana de pose de efector final o herramienta registrada debe coincidir con el controlador de recogida y que no debe aplicarse un desplazamiento adicional de herramienta o brida; el checkpoint es útil para verificar esa cadena de transformaciones.
- Reproducción de experimentos y auditoría de datos: la separación explícita entre supervisión de acciones y contexto de demostración, junto con el uso exclusivo del split de entrenamiento para splits y normalización, permite auditar cómo se construyó el dataset de entrenamiento.
- Integración en un banco de pruebas con una o varias GPU de 48 GB: al haberse entrenado en 4 x RTX A6000, el entorno de inferencia natural es una máquina de laboratorio con GPU de gama profesional, no un dispositivo empotrado de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica de forma explícita que la publicación intermedia no es una evaluación de calidad de la política y que una evaluación offline, si se incluye, no establece una tasa de éxito en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 4 GPU RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradientes.
- VRAM para inferencia: no documentada. Como referencia, el repositorio completo ocupa 12,8 GB, pero esa cifra incluye estado de reanudación no EMA, optimizador, RNG y sampler, además de los pesos EMA de servicio; el conjunto servible es un subconjunto de ese tamaño.
- GPU recomendadas: no se especifican. Por el perfil de entrenamiento (A6000 de 48 GB), el entorno coherente es una GPU profesional de 48 GB o superior; no hay confirmación de funcionamiento en GPU de consumo.
- GPU de consumo: no disponible. No se documenta si cabe en tarjetas tipo RTX 4090 o inferiores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La ruta soportada por el autor es cargar el bundle con `load_model.load()` y usar `observe()` para el historial.
- Latencia y throughput: no disponibles.
- Requisito de estado entre episodios: el consumidor debe resetear el historial entre episodios y mantener la misma rejilla de control que el *Writer schedule* exportado.

## Comparativa con modelos similares

| Modelo | Tipo | Historial visual | Estado de reanudación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step5000 | LoRA r2 sobre π0.5, paso 5.000 | 32 fotogramas uniformes, 512 tokens visuales | Sí (no EMA, optimizador, RNG, sampler) | no disponible | Pública, 0 descargas, 0 likes |
| Checkpoints paso 10.000 y 12.500 del mismo run | LoRA r2 sobre π0.5 | Igual que el paso 5.000 | No indicado en la información disponible | no disponible | Repositorios independientes, según la model card |
| Resto de checkpoints del run r2 | LoRA r2 sobre π0.5 | Igual que el paso 5.000 | Sí, dentro del archivo de respaldo | no disponible | Solo en el dataset de respaldo, ruta `task/method/stepN/` |
| Modelo base π0.5 | no disponible en esta información | no disponible | no aplica | no disponible | no disponible |
| Otras políticas VLA (OpenVLA, GR00T N1 y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Publicación intermedia, no evaluada: el propio autor advierte que publicar el checkpoint no es una evaluación de calidad de la política.
- Sin tasa de éxito real: no hay benchmarks ni resultados de robot real publicados; una evaluación offline no demuestra éxito en manipulación real.
- Gripper de Shuffle sin supervisión: la salida de gripper de esa tarea no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido.
- Etiquetas parciales en Button Order: solo hay etiquetas verificadas limitadas de comando de cierre.
- Componentes enmascarados: los componentes de acción desconocidos quedan como NaN o `false` y se enmascaran en el condicionamiento de flujo y en la pérdida, por lo que la política no aprende sobre ellos.
- Convención de pose crítica: la convención cartesiana de pose registrada debe coincidir con el controlador de recogida; aplicar un desplazamiento adicional de herramienta o brida introduce error sistemático.
- Normalización dependiente del split de entrenamiento: los splits y la normalización se calculan solo con el split de entrenamiento, lo que puede desviarse de la distribución real de despliegue.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es un riesgo legal directo para producción.
- Idiomas no aplicables: el modelo no procesa instrucciones de lenguaje, por lo que no hay soporte multilingüe ni posibilidad de condicionar por texto.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Dependencias fijadas y API propia: la inferencia depende del código del bundle (`load_model`, `observe`) y de versiones exactas de dependencias; saltarse el protocolo de historial o el *Writer schedule* produce resultados inválidos.
- Requisitos de entrada en Status-D: omitir `history_keyframe_index`, `current_subgoal` o las entradas causales `transition_context_*` rompe el modo Status-D.
- Fecha de creación y actualización declaradas: 2026-09-10 en ambos casos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step5000
- Archivo de respaldo de checkpoints (dataset): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Búsqueda web: los resultados obtenidos no contienen información relevante sobre el modelo (corresponden a directorios de emisoras de radio en francés), por lo que no se incluye ningún enlace adicional.
