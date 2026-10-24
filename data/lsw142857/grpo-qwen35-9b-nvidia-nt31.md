# LSW142857/grpo-qwen35-9b-nvidia-nt31

## Resumen

`LSW142857/grpo-qwen35-9b-nvidia-nt31` es un repositorio de checkpoints intermedios de un ajuste fino con GRPO (Group Relative Policy Optimization) sobre el modelo Qwen3.5-9B, publicado por el usuario LSW142857. El punto de partida no es el modelo base original, sino una inicialización SFT propia denominada "NVIDIA nonthinking Slime SFT step31", de modo que el entrenamiento por refuerzo arranca desde un checkpoint ya adaptado a tareas de ingeniería de software. El autor publica hitos completados del entrenamiento en subcarpetas (`step-000004`, `step-000008`, …, hasta un objetivo de 128 actualizaciones), no un checkpoint final.

El interés del repositorio es fundamentalmente metodológico: documenta con un nivel de detalle poco habitual la composición del dataset de RL (1024 tareas congeladas: 95 de SWE-Gym y 929 de SWE-Rebench-V2), el protocolo de evaluación en sandboxes Enroot sin red, la configuración de LoRA (rango 64, alpha 128) y AdamW (learning rate 1e-6), y las auditorías de solapamiento con los splits de entrenamiento y validación. También expone explícitamente las decisiones de reparación del pool de datos (`quarantine_v1` y `quarantine_v2`) y un incidente de evaluación que consumió 128 episodios extra no presupuestados.

Se trata de un artefacto de investigación, no de un modelo listo para producción: el repositorio no declara licencia propia, no publica resultados de benchmarks y la propia model card renuncia a cualquier afirmación de rendimiento. El tamaño del repositorio (89,7 GB) se explica por acumular varios milestones en un único repositorio; debe descargarse únicamente la subcarpeta del paso deseado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (variante densa de la familia Qwen3.5; el checkpoint conserva tensores de visión y de predicción multi-token, MTP, congelados procedentes de la inicialización) |
| Parametros totales | ~9B (nominal, según el nombre del modelo y el modelo base `Qwen/Qwen3.5-9B`; la model card no repite la cifra) |
| Parametros activos | no aplica: la variante de 9B es densa; dentro de la familia Qwen3.5 la variante MoE documentada por NVIDIA es 35B-A3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor publica cuerpo en BF16 con cabeza LM en FP32. No se distribuyen GGUF, FP8 ni INT4 |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo base `Qwen/Qwen3.5-9B` y cada milestone incluye los ficheros de atribución disponibles |
| Formato de pesos | safetensors (librería `transformers`), pesos fusionados por milestone en subcarpetas `step-XXXXXX` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: un transformer decoder denso de aproximadamente 9B parámetros. El repositorio conserva del modelo de inicialización la torre de visión y los tensores MTP, que permanecen congelados durante el ajuste; el cuerpo se almacena en BF16 y se preserva la cabeza LM en FP32. El ajuste se aplica con LoRA de rango 64 y alpha 128 fusionada en los pesos publicados, optimizador AdamW con learning rate 1e-6, y un esquema de 8 prompts × 16 episodios de agente independientes por actualización, con un presupuesto nominal de 128 actualizaciones y publicación de hitos cada 4.

El entrenamiento por refuerzo usa GRPO "plano", que mantiene los grupos de resultado constante y reporta ventajas cero para ellos; existe una configuración DAPO separada que filtra grupos totalmente correctos o incorrectos y contabiliza el muestreo adicional, pero sus pesos no se publican como GRPO en este repositorio. El pool de datos es una mezcla congelada de 1024 tareas (95 SWE-Gym + 929 SWE-Rebench-V2, revisión `9386aa85…`) en la que solo se proporcionan al modelo los campos públicos de issue y repositorio base; los parches dorados y la información de PR quedan excluidos. La resolución y la corrección se ejecutan en sandboxes Enroot sin conexión, con Git limitado a la base pública, y cada lote debe superar controles de referencia offline antes de usarse. Los rollouts de entrenamiento se generan en modo *nonthinking*, mientras que la evaluación emplea modo *thinking*, incluso para esta inicialización entrenada sin razonamiento explícito.

Dos detalles de linaje son relevantes: el pool se reparó dos veces (índice 25, de `pypa__pipx-1002` a `pypa__pipx-1252`; índice 70, de `huggingface__huggingface_hub-1948` a `huggingface__huggingface_hub-2683`), y la ejecución activa hereda tres actualizaciones ya completadas del pool original (24 prompts, 384 episodios), reanudando en la actualización 4. Además, durante la segunda actualización prevista un defecto de gestión del evaluador interrumpió un rollout completo: sus ocho grupos (128 episodios) se descartaron íntegramente y se volvieron a muestrear, con un coste en tokens generados desconocido (no cero).

## Capacidades

- Generación de texto y razonamiento en modo *thinking* y *nonthinking*, con plantilla de chat propia que debe preservarse junto con el modo previsto.
- Resolución de issues de software sobre repositorios reales: localización de ficheros, edición de parches y verificación contra tests, que es la tarea sobre la que se optimizó el reward.
- Comportamiento de agente multi-paso con episodios independientes por prompt, incluyendo exploración de un árbol de trabajo Git y ejecución de comandos en entorno aislado.
- Ajuste específico para *coding* (tag `coding` en el repositorio), orientado a parches que deben pasar controles automáticos.
- No se documenta soporte de *tool calling* / *function calling* genérico; el bucle de herramientas está implementado en el arnés de entrenamiento, no declarado como capacidad del modelo.
- Capacidades multimodales: no confirmadas. El checkpoint retiene tensores de visión congelados del modelo base, pero la model card no describe ni valida uso de imagen.
- Capacidades multilingües: no disponibles; no se declaran idiomas.

## Casos de uso

- Investigación en RL para código: reproducir o comparar curvas de GRPO sobre un pool de tareas SWE conocido, usando los milestones cada 4 pasos para analizar la evolución del comportamiento agéntico sin necesidad de reentrenar.
- Línea base para experimentos propios: al ser un ajuste LoRA fusionado sobre una inicialización SFT concreta, sirve como punto de comparación controlado frente a otros checkpoints del mismo autor (por ejemplo `Qwen3.5-9B-OPSD-iter32`).
- Evaluación de arneses de agentes: probar pipelines de resolución de issues (clonado, aplicación de parche, ejecución de tests) contra un modelo entrenado específicamente para ese bucle y con evaluación en modo *thinking*.
- Generación de parches asistida en integración continua: el modelo puede producir candidatos de parche que un pipeline valide con la suite de tests antes de abrir un pull request, aprovechando que el reward de entrenamiento se basó exactamente en esa señal.
- Estudio de robustez y contaminación: el repositorio documenta solapamientos a nivel de split (16 tareas del split completo de SFT de NVIDIA y 1 del de validación), lo que lo hace útil como caso práctico para auditar fugas de datos en pipelines de RL.
- Fine-tuning posterior con datos propios: al estar los pesos fusionados y en safetensors estándar, se puede aplicar un nuevo adaptador LoRA sobre un milestone concreto para dominios específicos, siempre que la licencia heredada lo permita.
- Despliegue local de bajo coste para pruebas internas: con cuantización a 4 bits de los pesos BF16 (conversión a cargo del usuario, no publicada) el modelo puede caber en GPU de consumo para prototipos no críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no formula ninguna afirmación de rendimiento para el GRPO, y no incluye cifras de SWE-bench ni de otras evaluaciones. Sí advierte de que la selección del checkpoint SFT de partida (step31) se hizo por el propietario del experimento usando comparaciones parciales en SWE-bench Verified, con la marca `used_verified_for_checkpoint_selection=true` e `independent_final_test=false`, por lo que cualquier puntuación posterior en Verified no constituye un resultado independiente sobre datos no vistos. Tampoco se ofrece latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 18-20 GB solo para pesos (cuerpo BF16 más cabeza LM en FP32); con caché KV y overhead conviene reservar 24 GB como mínimo y 40-80 GB para trabajar con comodidad. Estimación basada en el número de parámetros, no medida por el autor.
- Cuantización: al no publicarse GGUF ni FP8, cualquier reducción (INT8/INT4) implica conversión propia; en INT4 los pesos quedarían alrededor de 6 GB, lo que permitiría ejecución en GPU de 12-16 GB con pérdida de calidad no evaluada.
- GPU recomendadas: A100 80 GB, H100 80 GB y L40S 48 GB para BF16 sin restricciones; RTX 4090 / RTX 3090 (24 GB) solo en BF16 muy justo o con cuantización; RTX 5090 (32 GB) como opción de consumo holgada en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización y en RTX 5090 en BF16 con contexto moderado; la longitud de contexto real no está documentada, así que el consumo de caché KV debe calibrarse empíricamente.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors en `transformers`; llama.cpp u Ollama solo tras convertir los pesos a GGUF. Recuérdese que cada milestone vive en su subcarpeta y debe cargarse indicándola como `subfolder`, junto con su plantilla de chat.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 89,7 GB; conviene descargar únicamente el directorio `step-*` necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LSW142857/grpo-qwen35-9b-nvidia-nt31` (este) | ~9B densos | no disponible | sin benchmarks publicados; la card no reclama rendimiento | no disponible en el repo; hereda la del base | safetensors, milestones cada 4 pasos, 0 descargas |
| `Qwen/Qwen3.5-9B` (modelo base) | ~9B densos | no disponible en la información proporcionada | no disponible | la del modelo base (consultar en su repositorio) | safetensors en `transformers`, modelo de referencia de la familia |
| Qwen3.5-35B-A3B | 35B totales, ~3B activos (MoE) | no disponible | no disponible | la de la familia Qwen3.5 | recetas de preentrenamiento disponibles en NVIDIA Megatron Bridge; pesos no verificados en esta búsqueda |
| `LSW142857/Qwen3.5-9B-OPSD-iter32` | ~9B densos | no disponible | no disponible | no disponible | safetensors, mismo autor, iteración 32 |

La comparación cuantitativa no es posible: ninguno de los modelos comparables tiene cifras de benchmark en la información disponible, y este repositorio en particular no publica ninguna.

## Limitaciones y advertencias

- No es un modelo final: son hitos intermedios de un entrenamiento planificado a 128 actualizaciones; el propio autor indica que los milestones 32/128 son un objetivo, no una afirmación de finalización.
- Sin benchmarks ni validación de la comunidad (0 descargas, 0 likes): no hay evidencia externa de calidad.
- La card renuncia expresamente a reclamar rendimiento del GRPO; no debe citarse como resultado de SWE-bench.
- Selección de checkpoint no independiente: el paso SFT inicial se eligió con comparaciones parciales en SWE-bench Verified, lo que invalida Verified como test final limpio.
- Solapamiento documentado: el pool de RL comparte 16 tareas con el split completo de entrenamiento SFT de NVIDIA y 1 con el de validación (por ID exacto, identidad repositorio/PR o texto de issue normalizado). El autor advierte que la auditoría no determina cuáles se consumieron antes del step31 y que el pool no puede declararse no visto por el SFT. Los controles contra las 500 tareas de Verified no hallaron solapamiento exacto, pero no descartan solapamiento semántico ni exposición en preentrenamiento.
- Desajuste de modo: rollouts en *nonthinking*, evaluación en *thinking*; el comportamiento en producción puede diferir del régimen de evaluación.
- Incidente de evaluador en la segunda actualización: 128 episodios extra lanzados, con coste en tokens desconocido; los ocho grupos afectados se descartaron y se volvieron a muestrear.
- Licencia no declarada en el repositorio: el uso comercial depende de la licencia del modelo base y de los ficheros de atribución incluidos en cada milestone; verificar antes de cualquier despliegue productivo.
- No hay estado del optimizador ni trayectorias: los pesos publicados no permiten reanudar el entrenamiento, solo inferencia o nuevo fine-tuning.
- Idiomas y contexto no declarados: no se puede asumir un soporte multilingüe ni una ventana concreta sin medirlo.
- Riesgo de alucinación y de parches sintácticamente válidos pero funcionalmente incorrectos, inherente a los modelos de código sin verificación en producción.
- Sin datos sobre sesgos; al estar afinado sobre issues públicos de GitHub, puede reproducir sesgos de estilo y de dominio de ese corpus.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LSW142857/grpo-qwen35-9b-nvidia-nt31
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/LSW142857
- Otro checkpoint del autor: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-iter32/tree/main
- Ficha de Qwen3.5-9B en NVIDIA Megatron Bridge (recetas de 9B denso y 35B-A3B): https://docs.nvidia.com/nemo/megatron-bridge/latest/models/qwen/qwen35-vl.html
- Ficha de especificaciones y VRAM de Qwen3.5-9B: https://apxml.com/models/qwen35-9b
- Registro de terceros del modelo (metadatos pendientes): https://free2aitools.com/model/lsw142857/grpo-qwen35-9b-nvidia-nt31
