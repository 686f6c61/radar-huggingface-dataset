# rrodolfo0/qwen3-4b-move-intent-curve-5400

## Resumen

El modelo `rrodolfo0/qwen3-4b-move-intent-curve-5400` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-4B-Base` con el objetivo de mapear transcripciones de ajedrez en inglés a un valor canónico compacto de `move-interpretation/v2` o la etiqueta `UNKNOWN`. El adaptador está desarrollado por el usuario rrodolfo0 y forma parte de un pipeline donde un resolver externo (basado en chess.js) se encarga de validar legalidad, identidad jugable, jaque, mate y generación de SAN; el adaptador solo produce la interpretación del movimiento, no el movimiento en notación algebraica.

Este checkpoint se publica para preservar la curva completa de eficiencia de datos controlada del proyecto, con 5.400 filas de entrenamiento frescas y exclusivas. Ningún punto de la curva superó todos los gates registrados, por lo que el autor no describe este adaptador como cualificado para producción. La relevancia del modelo radica en que documenta un experimento de control de eficiencia de datos reproducible, con identidades congeladas de base, dataset y evaluador, así como resultados de test propios públicos.

El adaptador no ve el tablero y no puede determinar si un movimiento es legal o único; debe usarse exclusivamente como componente de interpretación dentro de un sistema mayor que posea un resolver de movimientos. La licencia es Apache-2.0, el repositorio pesa 0.1 GB y la librería de entrenamiento es PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Base (Transformer denso, 4B parámetros) |
| Parametros totales | 4.000 millones (base) + adaptador LoRA (~0.1 GB) |
| Parametros activos | No aplica (no es MoE; el adaptador añade un pequeño número de parámetros) |
| Longitud de contexto | No disponible (el base Qwen3-4B soporta hasta 512K tokens, pero el adaptador no documenta límites propios) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors del adaptador) |
| Idiomas soportados | Inglés (transcripciones de ajedrez) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `Qwen/Qwen3-4B-Base` en su revisión exacta `906bfd4b4dc7f14ee4320094d8b41684abff8539`. La arquitectura del base es un transformer denso de 4B parámetros, multilingüe, con capacidad de razonamiento, código y matemáticas; el adaptador añade un número reducido de parámetros entrenables mediante la técnica LoRA, lo que permite un ajuste fino eficiente sin modificar los pesos del modelo base.

El entrenamiento se realizó con 5.400 filas procedentes del dataset `rrodolfo0/move-intent-v2-final` en su revisión congelada `d146121e25e1fafdb114605f4264fef7d754521e`. El dataset contiene transcripciones de ajedrez en inglés con sus correspondientes interpretaciones canónicas en formato `move-interpretation/v2` o `UNKNOWN`. El proceso de entrenamiento utilizó un prefijo de curva anidada "fresco" (fresh-only), y el autor documenta en `training-receipt.json` la ejecución limpia de actualización cero, la receta, los checkpoints, el hardware, los hashes y el resultado de recarga. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior.

El adaptador no ve el tablero y no puede determinar si un movimiento es legal o único. Su salida es una interpretación compacta que un resolver externo (propiedad del host) debe validar contra chess.js. El autor recomienda cargar el adaptador con el template de chat del repositorio, con el thinking desactivado y decodificación determinista.

## Capacidades

- Mapear una transcripción de ajedrez en inglés a un valor canónico `move-interpretation/v2` o `UNKNOWN`.
- Procesar entradas ruidosas sintéticas (corruptelas textuales controladas) con un 83.8% de acierto exacto (109/130).
- Producir salidas correctamente enmarcadas en el formato de interpretación (300/300).
- Rechazar correctamente casos `UNKNOWN` con 0 falsos aceptados (0/30).
- Operar como componente dentro de un pipeline mayor que valide legalidad y SAN con chess.js.
- Funcionar con decodificación determinista y thinking desactivado para reducir variabilidad.

No genera código, no realiza razonamiento multi-paso, no soporta tool calling, no tiene capacidades de visión ni audio, y no está diseñado para tareas generales de lenguaje.

## Casos de uso

- **Preprocesamiento de transcripciones en sistemas de análisis de ajedrez**: el adaptador convierte transcripciones en inglés a un formato canónico interpretable que un resolver posterior convierte en movimientos legales mediante chess.js. Es adecuado porque la salida es compacta y el sistema puede delegar la validación de legalidad.
- **Pipelines de ASR aplicados a ajedrez**: aunque los ejemplos ruidosos son corrupciones sintéticas, el adaptador tolera ruido textual (109/130 exactos) y puede usarse como primer filtro de interpretación antes de que el resolver descarte entradas no válidas.
- **Experimentación con eficiencia de datos**: el repositorio documenta una curva de eficiencia controlada con 5.400 filas, útil para investigadores que estudian el impacto del tamaño del dataset en tareas de clasificación de dominios específicos.
- **Componente de un sistema de enseñanza de ajedrez**: dado un transcript de una partida, el adaptador genera la interpretación del movimiento que una aplicación educativa puede mostrar al estudiante antes de que el resolver confirme la jugada.
- **Investigación sobre adaptadores LoRA en dominios verticales**: el checkpoint sirve como ejemplo de cómo un adaptador pequeño (0.1 GB) sobre un base de 4B puede especializarse en una tarea concreta con pocos datos.
- **Pruebas de robustez ante ASR**: aunque los datos son sintéticos, el adaptador puede integrarse en un pipeline de evaluación para medir la degradación ante entradas corruptas antes de pasar a un resolver.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el panel de pruebas propias (público, no staff-heldout):

| Prueba | Resultado |
|---|---|
| Exactitud estricta (set limpio) | 269/300 (89.7%) |
| Parseabilidad (set limpio) | 296/300 (98.7%) |
| Exactitud en datos ruidosos | 109/130 (83.9%) |
| Enmarcado correcto | 300/300 (100%) |
| Falsos aceptados de `UNKNOWN` | 0/30 (0%) |

No se han publicado comparativas con otros modelos en la información disponible. El autor indica que ningún punto de la curva de eficiencia superó todos los gates registrados, por lo que el adaptador no se considera cualificado.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen3-4B requiere aproximadamente 8 GB en FP16 para inferencia; el adaptador LoRA añade un coste marginal de 0.1 GB. Con cuantización de 8 bits o 4 bits (por ejemplo, mediante bitsandbytes) la VRAM se reduce a 4-6 GB.
- **GPU recomendadas**: tarjetas consumer como RTX 3060 de 12 GB, RTX 4070, RTX 4090 o equivalentes de AMD con soporte ROCm son suficientes. En entornos profesionales, A100 o H100 no son necesarias para este adaptador.
- **Consumer GPU**: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza el base.
- **Opciones de despliegue**: el adaptador se carga con la librería PEFT sobre el base Qwen3-4B; se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque el autor no documenta configuraciones específicas.
- **Latencia y throughput**: no disponible en la información del repositorio; depende del hardware y del motor de inferencia elegido.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores de ajedrez en la información proporcionada. La alternativa más cercana es el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Base | 4B | 32K tokens | Modelo general multilingüe | Apache-2.0 |
| qwen3-4b-move-intent-curve-5400 | 4B + LoRA | No disponible | Interpretación de movimientos de ajedrez | Apache-2.0 |
| Qwen2.5-72B-Instruct (referencia del base) | 72B | 128K tokens | Modelo general | Apache-2.0 |

No se dispone de modelos de la misma categoría (adaptadores LoRA para interpretación de ajedrez) en la información disponible.

## Limitaciones y advertencias

- El adaptador no está cualificado: ningún punto de la curva de eficiencia superó todos los gates registrados por el autor.
- No ve el tablero y no puede determinar si un movimiento es legal o único; debe usarse solo como componente de interpretación, nunca como generador de SAN.
- El panel de pruebas es público y no es staff-heldout, lo que puede inflar las métricas reportadas.
- Los ejemplos de ASR ruidoso son corrupciones textuales sintéticas, no transcripciones de audio reales; el rendimiento con ruido real puede diferir.
- La salida puede ser `UNKNOWN` en entradas ambiguas; el sistema debe manejar este caso sin interpretar el movimiento.
- La decodificación determinista y el thinking desactivado son requisitos para reproducir los resultados; variaciones en el muestreo pueden degradar el rendimiento.
- No se documentan sesgos específicos, pero al estar entrenado sobre transcripciones en inglés, su comportamiento con otros idiomas no es fiable.
- El repositorio no incluye instrucciones de despliegue en producción ni garantías de soporte.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rrodolfo0/qwen3-4b-move-intent-curve-5400
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/rrodolfo0/move-intent-v2-final
- Repositorio de evidencias: https://huggingface.co/rrodolfo0/move-intent-final-evidence
- Guía completa de Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Página de Qwen3-4B en Ollama: https://ollama.com/library/qwen3:4b
- README de Qwen3-4B en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
- Página de Qwen3-4B en CanIRun.ai: https://www.canirun.ai/model/qwen3-4b
