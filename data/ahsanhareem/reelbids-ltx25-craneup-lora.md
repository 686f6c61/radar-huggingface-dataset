# AhsanHareem/reelbids-ltx25-craneup-lora

## Resumen

ReelBids LTX-2.5 — crane up camera LoRA es un adaptador LoRA de control de cámara publicado por el usuario AhsanHareem en Hugging Face. Se trata de un ajuste fino sobre el modelo base LTX-2.5 de la familia LTX-Video, orientado a un único movimiento de cámara: el *crane up* (grúa ascendente). El adaptador se activa mediante las palabras clave `rbcraneup sp05` … `rbcraneup sp50`, que codifican una velocidad de desplazamiento entre 0.5 y 5.0, funcionando por tanto como un dial de velocidad del movimiento en lugar de un simple modificador binario.

El interés técnico del artefacto está en su receta de entrenamiento documentada con inusual detalle para un LoRA de propósito tan específico: rango 32, alpha 32, módulos de atención únicamente, learning rate 1e-4 y 2000 pasos. La model card describe explícitamente un experimento fallido (run 2) en el que se modificaron simultáneamente rango, módulos objetivo, learning rate y número de pasos, lo que provocó el colapso del control de velocidad, con un error medio de zoom que pasó del 3.4% al 28.0%. Esa trazabilidad convierte el repositorio en un caso de estudio útil sobre sensibilidad de hiperparámetros en LoRAs de control de cámara, más que en un modelo de propósito general.

El repositorio ocupa 4.0 GB y contiene 20 checkpoints guardados cada 100 pasos (pasos 100 a 2000). No tiene descargas ni *likes*, no declara licencia ni idiomas, y no incluye pipeline en los metadatos de Hugging Face. La información disponible no permite determinar el número de parámetros del modelo base ni sus requisitos de cómputo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión de vídeo de la familia LTX-Video (LTX-2.5). La arquitectura interna del modelo base no se detalla en la información disponible. |
| Parametros totales | No disponible (no se declara el tamaño del modelo base ni el número de parámetros del adaptador) |
| Parametros activos | No disponible; no se indica que la arquitectura base sea MoE |
| Longitud de contexto | No disponible (el modelo base es de generación de vídeo, no de contexto textual) |
| Tipos de cuantizacion | No disponible. El adaptador se entrena y distribuye en precisión completa según la receta declarada; no se mencionan versiones cuantizadas |
| Idiomas soportados | No disponible (los prompts de texto dependen del codificador de texto del modelo base, no declarado aquí) |
| Licencia | No disponible. La model card no especifica licencia; la licencia del modelo base LTX-2.5 es independiente y no se detalla |
| Formato de pesos | No especificado en la model card. El repositorio contiene 20 checkpoints (pasos 100-2000) y un fichero de configuración `config/ltx25_craneup_lora.yaml` |

Otros datos declarados: tamaño del repositorio 4.0 GB; creado el 2026-09-16, actualizado el 2026-09-16; 0 descargas y 0 *likes*; etiquetas `ltx-video`, `ltx-2.5`, `lora`, `camera-control`, `crane_up`.

## Arquitectura y entrenamiento

El artefacto es un LoRA de rango 32 con alpha 32 aplicado exclusivamente a los módulos de atención del modelo base. La receta declarada como válida (run 1) usa un learning rate de 1e-4 durante 2000 pasos de entrenamiento. La model card indica que esta es la única configuración que ha producido un dial de velocidad funcional. En el run 2 se modificaron de forma simultánea el rango, los módulos objetivo, el learning rate y el número de pasos, y el control se deterioró hasta un error medio de zoom del 28.0% frente al 3.4% del run 1; no se conservó nada de esa segunda ejecución. Se escriben checkpoints cada 100 pasos, con un total de 20 checkpoints entre los pasos 100 y 2000.

El conjunto de datos de entrenamiento está compuesto por 560 clips, íntegramente de interiores (0 clips de exterior), generados en Blender a resolución 1024x576, con 97 fotogramas por clip y 24 fps. La configuración exacta con la que se entrenó el adaptador está en `config/ltx25_craneup_lora.yaml`, y los registros de entrenamiento, cuando la ejecución generó alguno, se encuentran bajo `logs/`. No se detalla la composición textual de los prompts, el número total de tokens de vídeo vistos ni si hubo etapas de RLHF o DPO; estos procedimientos no son habituales en adaptadores de control de cámara. Tampoco se documenta ninguna innovación de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Control de movimiento de cámara: induce un movimiento de grúa ascendente (*crane up*) en los vídeos generados por el modelo base LTX-2.5.
- Dial de velocidad: las palabras clave `rbcraneup sp05`, `sp10`, … hasta `sp50` permiten seleccionar una velocidad de desplazamiento entre 0.5 y 5.0.
- Aplicación sobre vídeo generado: el adaptador no genera vídeo por sí mismo, modifica el comportamiento del modelo base cuando se carga junto a él.
- Ámbito de escena restringido: el entrenamiento se realizó exclusivamente con clips de interiores, por lo que el comportamiento en exteriores no está validado y no se declara.
- No se declara soporte de *tool calling*, *function calling*, uso agéntico, razonamiento multi-paso, capacidades multilingües, modo de razonamiento explícito, visión, audio ni ninguna otra capacidad adicional. Es un adaptador de control de cámara y su alcance es ese.

## Casos de uso

- Previsualización cinematográfica: aplicar el LoRA para generar *previz* de planos con movimiento de grúa ascendente antes de rodar, de modo que el equipo de dirección pueda evaluar el encuadre y el ritmo del movimiento sin desplazar maquinaria.
- Publicidad de producto en interiores: generar planos ascendentes que revelen un producto o un *set* desde abajo hacia arriba, un recurso habitual en *spots* de cosmética, tecnología o mobiliario, usando el dial de velocidad para ajustar el tempo al montaje.
- Arquitectura y visualización de interiores: crear recorridos que asciendan mostrando la altura de un espacio (doble altura, lucernarios, estanterías) para presentaciones a clientes, aprovechando que el entrenamiento se hizo íntegramente con escenas de interior.
- Contenido para redes sociales y sectores verticales: el repositorio pertenece a un proyecto llamado ReelBids, lo que sugiere su uso en vídeo inmobiliario o de *reels*; un plano de grúa ascendente es un recurso estándar para abrir un anuncio de una vivienda o local.
- Generación de variantes controladas de un mismo plano: gracias al dial de velocidad, un mismo *prompt* puede producir varias versiones del movimiento (rápido, lento, muy lento) para que el editor elija en montaje sin volver a generar desde cero con otro *prompt*.
- Investigación sobre control de cámara en modelos de vídeo: dado que la model card documenta la receta y el fallo del run 2, el adaptador sirve como referencia reproducible para estudiar la sensibilidad de hiperparámetros (rango, módulos objetivo, LR, pasos) en LoRAs de control.
- Ampliación o *padding* de material rodado: insertar planos de transición generados con este movimiento entre tomas reales de un mismo interior para alargar una secuencia o cubrir cortes.
- Creación de datos sintéticos: generar clips con movimiento de cámara conocido y velocidad parametrizada, útiles como *dataset* etiquetado para entrenar otros modelos de estimación de movimiento de cámara; el propio conjunto original se generó en Blender con este propósito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas estándar de generación de vídeo (FVD, CLIPSim, VBench) en la model card.

La única métrica numérica declarada es interna y comparativa entre dos ejecuciones de entrenamiento del propio adaptador, no un benchmark frente a otros modelos:

| Ejecución | Cambios respecto al run 1 | Error medio de zoom |
|---|---|---|
| Run 1 (receta publicada) | Rango 32, alpha 32, solo atención, lr 1e-4, 2000 pasos | 3.4% |
| Run 2 (descartado) | Cambio simultáneo de rango, módulos objetivo, learning rate y número de pasos | 28.0% |

La model card aclara que ningún checkpoint ha sido evaluado todavía salvo que exista un fichero `REPORT.md` junto a la tarjeta, por lo que recomienda empezar por el último paso e ir retrocediendo. Esto implica que la calidad relativa de los 20 checkpoints publicados no está documentada.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no declara requisitos de memoria; estos vendrán determinados por el modelo base LTX-2.5 y por la resolución y duración del vídeo, no por el adaptador.
- Coste del adaptador: el repositorio ocupa 4.0 GB e incluye 20 checkpoints, lo que equivale a unos 200 MB por checkpoint como cálculo aritmético a partir del tamaño declarado. Cargar un único adaptador añade un sobrecoste pequeño frente al modelo base, pero al tratarse de un LoRA de rango 32 sobre módulos de atención, el impacto exacto en memoria no se puede determinar sin conocer la arquitectura base.
- GPU recomendadas: no disponible. No hay ninguna GPU recomendada en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si cabe en una RTX 4090 u otras GPU de consumo sin datos del modelo base ni de la resolución de trabajo.
- Opciones de despliegue: no disponible. La model card solo menciona `config/ltx25_craneup_lora.yaml` y el directorio `logs/`. No se nombran vLLM, llama.cpp, Ollama, TGI ni ningún otro motor de inferencia; para vídeo, estos motores no son aplicables de todos modos.
- Latencia y throughput: no disponible. No se declaran tiempos de generación, número de pasos de muestreo ni velocidad en fotogramas por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye ningún modelo comparable, ni datos de rendimiento frente a alternativas. No se puede elaborar una tabla comparativa de parámetros, contexto, licencia o disponibilidad sin inventar cifras.

A modo de contexto metodológico, la comparación relevante para este artefacto sería contra otros LoRAs de control de cámara para el mismo modelo base LTX-2.5, y contra el propio modelo base sin adaptador; ninguno de esos datos está disponible en la model card.

## Limitaciones y advertencias

- Sesgo de dominio: el conjunto de entrenamiento es 100% interior (0 clips de exterior, 560 de interior). No hay evidencia de que el movimiento funcione correctamente en escenas exteriores.
- Sesgo de origen sintético: los 560 clips se generaron en Blender, no son metraje real. El adaptador puede no generalizar a la distribución de vídeo real (iluminación, grano, movimiento de cámara real, oclusión).
- Resolución y formato fijos en entrenamiento: 1024x576 y 97 fotogramas a 24 fps. El comportamiento con otras resoluciones, relaciones de aspecto o duraciones no está validado.
- Checkpoints sin evaluar: la propia model card indica que ningún checkpoint ha sido puntuado salvo que exista un `REPORT.md`, y recomienda recorrerlos desde el último hacia atrás. La calidad de cada paso concreto es, por tanto, desconocida.
- Riesgo de colapso del control: el run 2 muestra que modificar varios hiperparámetros a la vez degrada el dial de velocidad (de 3.4% a 28.0% de error medio de zoom). Cualquier reintento de ajuste fino debería cambiar una variable por vez.
- Licencia no declarada: no se especifica licencia para el adaptador. Esto impide determinar si el uso comercial está permitido y obliga a verificar por separado la licencia del modelo base LTX-2.5 antes de cualquier uso en producción.
- Trazabilidad temporal dudosa: las fechas de creación y actualización del repositorio (2026-09-16) son posteriores a la fecha actual de referencia, lo que conviene verificar antes de citar el artefacto.
- Reputación y adopción nulas: 0 descargas y 0 *likes*. No hay evidencia comunitaria de funcionamiento ni informes independientes de calidad.
- Riesgo de alucinación y sesgos: no disponible, dado que no es un modelo de lenguaje y no se han publicado evaluaciones de sesgo para este adaptador.
- Idiomas: no disponible; cualquier limitación idiomática vendría del codificador de texto del modelo base, no declarado.

## Enlaces

- Hugging Face: https://huggingface.co/AhsanHareem/reelbids-ltx25-craneup-lora
- No se han encontrado enlaces relevantes en la búsqueda web. Los resultados devueltos corresponden a páginas del Hotel Villa Radin (Vodice, Croacia) y a su ficha en Booking.com, sin ninguna relación con el modelo. No hay *papers*, blogs, repositorios de código ni demos identificados en la información disponible.
- Referencias internas citadas en la model card (no verificables desde el exterior): `config/ltx25_craneup_lora.yaml`, directorio `logs/`, fichero `REPORT.md` (si existe).
