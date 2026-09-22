# madhavbiplov/laya-snake-mlx

## Resumen

laya-snake-mlx es un modelo de decisión tipada (*typed-decision*) construido sobre la librería Laya y publicado por el usuario madhavbiplov. No es un modelo generativo: en lugar de producir texto token a token, responde a un conjunto fijo de preguntas con opciones predefinidas en una única pasada hacia delante (*forward pass*), devolviendo probabilidades calibradas y cero tokens generados. El checkpoint resuelve una tarea concreta: elegir el siguiente movimiento (UP, DOWN, LEFT o RIGHT) en un tablero del juego Snake, evitando salirse del tablero, no chocando contra el propio cuerpo y tomando el camino seguro más corto hacia la comida.

El modelo parte del checkpoint base `aac6fef/laya-multilingual-mlx` y se ha ajustado mediante LoRA con LayaStudio en un Mac con Apple silicon, en unos 18 minutos. Cuenta con 321.908.998 parámetros (aproximadamente 322 M) y se distribuye en formato safetensors para MLX, con licencia Apache-2.0.

Su relevancia es doble: por un lado demuestra que un ajuste fino LoRA muy ligero puede pasar una tarea de decisión del 15,8 % al 98,8 % de exactitud, y por otro sirve como ejemplo de modelo de clasificación con calibración prácticamente perfecta (error de calibración esperado de 0,002), algo poco habitual y crítico en sistemas que necesitan confiar en el umbral de probabilidad de una decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer correspondiente al modelo base Laya multilingual con cabeza de decisión tipada; detalle interno no disponible |
| Parametros totales | 321.908.998 (≈ 322 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors; exportación a ONNX disponible vía LayaStudio) |
| Idiomas soportados | Multilingüe según el modelo base (`laya-multilingual-mlx`); lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); exportable a ONNX |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-classification |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre `aac6fef/laya-multilingual-mlx`, un checkpoint multilingüe de la familia Laya (Convai Innovations). Laya es un marco de decisión tipada en el que las preguntas, las instrucciones y los textos de las opciones forman parte de la entrada del modelo; por tanto, la tarea no es generativa sino de clasificación sobre un conjunto cerrado de alternativas. La inferencia devuelve probabilidades calibradas con cero tokens generados.

El entrenamiento se realizó con LayaStudio en un Mac con Apple silicon durante 18 minutos, con precisión bfloat16 y semilla 13. Los hiperparámetros registrados son: método LoRA, objetivo *proper*, 4 épocas (mejor época la 3), tamaño de lote 8 con acumulación de gradiente 2, learning rate 0,0002 y learning rate de cabeza 0,0001, rango LoRA 16, alpha 32, dropout LoRA 0,05, `lora_layers` 0 y 4 capas completas entrenadas, dropout de cabeza 0,1, weight decay 0,01, warmup 0,06, `max_grad_norm` 1,0, barajado de opciones activado, sin ponderación de clases, paciencia 2 y checkpointing de gradiente en modo automático. El conjunto de entrenamiento consta de 2339 decisiones. Se aplicó un reescalado de temperatura de 1,3116 para decisiones de tipo elección con entre 3 y 5 opciones. El hash SHA-256 del dataset es `970a6be8b1b458204b95fa747c66b4c527512bdf373f549f88d97391243cd24a`.

## Capacidades

- Decisión tipada de opción múltiple: responde a la pregunta `move` eligiendo entre UP, DOWN, LEFT y RIGHT en un tablero de Snake.
- Probabilidades calibradas: error de calibración esperado (ECE) de 0,002 en el conjunto de prueba reservado.
- Inferencia en una sola pasada hacia delante, sin generación de tokens, lo que reduce la latencia y evita alucinaciones de formato.
- Multilingüe heredado del modelo base `laya-multilingual-mlx` (extensión real no verificada en la información disponible).
- Ejecución nativa en Apple silicon mediante la librería `laya-mlx`.
- Compatibilidad con la implementación PyTorch upstream `laya` en Linux y NVIDIA.
- Exportación a ONNX a través de LayaStudio.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Agente de referencia para Snake: el modelo elige el siguiente movimiento en cada turno respetando las restricciones del tablero (no salirse, no chocar y buscar el camino seguro más corto a la comida), lo que lo convierte en una línea base reproducible para investigación en entornos de rejilla.
- Prototipado de agentes de decisión en local: al ejecutarse con `laya-mlx` en un Mac con Apple silicon, permite iterar sobre políticas de decisión sin GPU dedicada ni servicios en la nube.
- Sistemas con umbral de confianza: gracias a un ECE de 0,002 y un Brier score de 0,021, puede integrarse en flujos donde una decisión solo se ejecuta si la probabilidad supera un umbral, derivando el resto a revisión humana o a otra política.
- Enrutamiento de decisiones en pipelines de automatización: el mismo patrón (pregunta tipada + conjunto cerrado de opciones) puede reutilizarse para clasificar acciones discretas en otros dominios redefiniendo `questions.json`.
- Evaluación comparativa de métodos de ajuste: sirve como caso de estudio de LoRA con objetivo *proper* frente al modelo base, con métricas pareadas (McNemar exacto) y calibración documentada.
- Material docente para fine-tuning en Apple silicon: el flujo completo (base multilingüe, LoRA, LayaStudio, 18 minutos de entrenamiento) es reproducible y útil para enseñar ajuste eficiente de parámetros.
- Pruebas de estrés de robustez ante reordenación de opciones: el entrenamiento usa `shuffle_options: true`, por lo que el modelo es adecuado para experimentos sobre invarianza al orden de las alternativas.
- Despliegue en el borde: con 322 M de parámetros y 0,7 GB de repositorio, el modelo cabe en dispositivos con recursos limitados, incluyendo exportaciones ONNX.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el conjunto de prueba reservado (600 decisiones):

| Metrica | Modelo base | laya-snake-mlx |
|---|---|---|
| Exactitud | 15,8 % | 98,8 % [97,6 %–99,4 %] |
| Error de calibracion (ECE) | 0,246 | 0,002 |
| Log loss | 1,607 | 0,047 |
| Brier score | 0,865 | 0,021 |
| Decisiones evaluadas | 600 | 600 |

El ajuste corrigió 500 decisiones que el modelo base fallaba y rompió 2 que acertaba (prueba exacta de McNemar, p < 0,001). Los intervalos de exactitud son intervalos de Wilson. No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no aborda esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en bfloat16 y unos 1,3 GB en fp32, solo para pesos; el consumo real depende de la longitud de la entrada y del lote.
- GPU compatibles: cualquier GPU moderna con al menos 2 GB de VRAM; también se ejecuta en CPU. No se requieren A100 ni H100.
- Apple silicon: soporte nativo mediante `laya-mlx`, el entorno en el que se entrenó y validó el modelo.
- Linux y NVIDIA: soporte a través del paquete PyTorch upstream `laya`.
- GPU de consumo: cabe sin problema en RTX 3060, RTX 4060, RTX 4090 y similares; el modelo es lo bastante pequeño como para ejecutarse en paralelo con otras cargas.
- Opciones de despliegue: `laya-mlx` (Apple silicon), `laya` (PyTorch, Linux/NVIDIA) y exportación a ONNX mediante LayaStudio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud (test) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| madhavbiplov/laya-snake-mlx | 321,9 M | no disponible | 98,8 % | 0,002 | Apache-2.0 | HuggingFace, MLX safetensors, exportable a ONNX |
| aac6fef/laya-multilingual-mlx (base) | no disponible | no disponible | 15,8 % | 0,246 | Apache-2.0 | HuggingFace |
| Otros modelos comparables de decisión tipada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es contra su propio modelo base, sobre el que mejora la exactitud en 83 puntos porcentuales y reduce el error de calibración en dos órdenes de magnitud. No se dispone de información sobre otros modelos públicos de decisión tipada con los que contrastarlo.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con las preguntas e instrucciones exactas para las que fue ajustado. Modificar el texto de las instrucciones o de las opciones altera la tarea y degrada las predicciones, según advierte el propio autor.
- No es un modelo generativo: no produce texto libre, no razona de forma explícita y no puede resolver tareas fuera del conjunto cerrado de opciones.
- Dominio muy restringido: está ajustado para elegir movimientos en un tablero de Snake. Su uso en otros entornos exige reentrenamiento o redefinición de `questions.json`.
- La evaluación se ha realizado sobre 600 decisiones de un único conjunto de prueba reservado. Es un volumen reducido y no cubre distribución fuera de ese reparto.
- El ECE de 0,002 corresponde al conjunto de prueba declarado; la calibración puede degradarse ante entradas fuera de distribución.
- El soporte multilingüe se hereda del nombre del modelo base y no se documenta ni se evalúa explícitamente en la información disponible.
- No hay datos publicados sobre sesgos, comportamiento ante entradas adversarias ni robustez general.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo deriva de `aac6fef/laya-multilingual-mlx`, cuyos pesos son de Convai Innovations y arrastran la misma licencia; conviene verificar la atribución correspondiente.
- El modelo tiene cero descargas y cero *likes* en el momento de redactar esta ficha, por lo que no existe validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madhavbiplov/laya-snake-mlx
- Modelo base: https://huggingface.co/aac6fef/laya-multilingual-mlx
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Repositorio de LayaStudio: https://github.com/biplovgautam/LayaStudio
- Sitio de LayaStudio: https://layastudio.biplovgautam.com.np/
