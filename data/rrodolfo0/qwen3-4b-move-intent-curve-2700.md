# rrodolfo0/qwen3-4b-move-intent-curve-2700

## Resumen

`rrodolfo0/qwen3-4b-move-intent-curve-2700` es un adaptador LoRA de la serie Qwen3, desarrollado por el usuario rrodolfo0, que se basa en el modelo base `Qwen/Qwen3-4B-Base`. Su propósito es transformar una transcripción de ajedrez en inglés, ya finalizada, en un valor canónico compacto de interpretación de movimiento (`move-interpretation/v2`) o la etiqueta `UNKNOWN`. No genera notación algebraica estándar (SAN), sino una representación intermedia que posteriormente un componente externo (un "Move Resolver") valida contra la librería `chess.js`, que es la que determina la legalidad, la identidad jugable, el jaque, el mate y el SAN.

El modelo se ha entrenado sobre un conjunto de datos específico `rrodolfo0/move-intent-v2-final`, con 2700 filas de entrenamiento. Según la model card, es la selección final de una curva controlada porque obtuvo el mejor resultado exacto estricto (272/300, 90,67%), aunque ningún punto de la curva cumplió todos los umbrales registrados, por lo que el adaptador no se considera "calificado". El repositorio incluye un `training-receipt.json` con la receta del entrenamiento y un `adapter-verification.json` con la evidencia de recarga en proceso nuevo.

Se trata de un caso de uso de ajuste fino de dominio específico con PEFT (LoRA) sobre un modelo de lenguaje de 4B parámetros, orientado a un pipeline de ajedrez donde la interpretación de movimientos es un paso intermedio antes de la validación con un motor de ajedrez. Su relevancia radica en demostrar cómo un modelo pequeño y especializado puede integrarse en un flujo de procesamiento de texto de ajedrez con métricas de control de calidad bien definidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Base (transformer decoder-only) + adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA (repo de 0,1 GB) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador LoRA en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponible (la entrada es una transcripcion en ingles, pero no se especifica soporte multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo base `Qwen/Qwen3-4B-Base`, que es un transformer decoder-only de 4B parámetros. La model card no detalla los hiperparámetros del LoRA (rango, alpha, capas objetivo), ni el proceso de entrenamiento más allá de que se usaron 2700 filas del dataset `rrodolfo0/move-intent-v2-final`. Se menciona un "clean update-zero run" con una receta registrada en `training-receipt.json`, lo que sugiere un entrenamiento con actualización de gradiente desde cero, sin pasos de RLHF ni DPO. No se indica el número de tokens de entrenamiento ni la composición del dataset.

La innovación técnica principal no reside en la arquitectura del LoRA, sino en la metodología de evaluación: se define una tarea de interpretación de movimientos con una salida canónica compacta, y se evalúa la exactitud estricta, la capacidad de parseo, la robustez ante ruido sintético (simulando errores ASR) y la tasa de falsos aceptados de `UNKNOWN`. El adaptador no ve el tablero, por lo que no puede determinar la legalidad de un movimiento; esa responsabilidad se delega en un verificador externo (`chess.js`).

## Capacidades

- Generacion de texto: genera una cadena de interpretación de movimiento en formato `move-interpretation/v2` o la etiqueta `UNKNOWN`.
- Dominio especifico de ajedrez: mapea transcripciones de partidas en inglés a un formato canónico intermedio.
- Robustez ante ruido: ha sido evaluado con ejemplos de ruido sintético ASR (corrupciones textuales), mostrando un resultado de 112/130 exacto en ese subconjunto.
- Salida determinista: se recomienda usar con decodificación determinista (sin muestreo) y con el modo "thinking" desactivado.
- No es un modelo conversacional general: su funcion es especifica, no admite preguntas abiertas ni razonamiento multilingue.
- No soporta tool calling, ni agentes, ni razonamiento multi-step fuera de su tarea.

## Casos de uso

- **Conversión de transcripciones de partidas de ajedrez**: el adaptador puede transformar una transcripción de texto (por ejemplo, de una partida comentada) en una secuencia de interpretaciones de movimiento que posteriormente se validan con `chess.js` para obtener el SAN y la legalidad.
- **Preprocesamiento para motores de análisis**: en un pipeline de análisis de partidas, el adaptador actúa como un primer paso para normalizar la entrada, reduciendo la carga de un motor de ajedrez que solo procesa movimientos canónicos.
- **Integración con sistemas de reconocimiento de voz (ASR)**: aunque los ejemplos de ruido son sintéticos, el modelo está diseñado para tolerar errores de transcripción ASR, permitiendo su uso en entornos donde se dicten jugadas y se quiera capturar la intención del movimiento antes de verificar su legalidad.
- **Componente en un sistema de enseñanza de ajedrez**: Un tutor puede usar el adaptador para interpretar descripciones de movimientos de un estudiante y convertirlas en una representación que el sistema pueda comprobar y responder con la jugada correcta.
- **Generación de datos etiquetados**: El adaptador puede servir para crear datasets de interpretaciones de movimientos a partir de transcripciones existentes, siempre que el resultado se valide con un verificador externo.
- **Prototipo de investigación sobre adaptación de LLMs a dominios específicos**: Como caso de estudio, permite analizar cómo un LoRA pequeño (0,1 GB) se comporta en una tarea muy concreta con métricas de control definidas.

## Benchmarks y rendimiento

Según la model card del autor, los resultados en el conjunto de evaluación controlada son los siguientes:

| Metrica | Resultado |
|---|---|
| Strict exact (300 muestras) | 272/300 (90,67%) |
| Parseable (300 muestras) | 294/300 (98,0%) |
| Noisy exact (130 muestras) | 112/130 (86,15%) |
| Correctly framed (300 muestras) | 300/300 (100%) |
| Falsos aceptados de `UNKNOWN` (30 muestras) | 0/30 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estos datos provienen de la model card del autor y se refieren a su propio panel de evaluación, que no es un conjunto held-out independiente.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere GPU dedicada para el adaptador en sí, sino para el modelo base de 4B parámetros.
- Para inferencia en precisión FP16, el modelo base de 4B parámetros requiere aproximadamente 8 GB de VRAM.
- Con cuantizacion de 4 bits (por ejemplo, con `bitsandbytes` o GPTQ), se puede reducir a unos 3-4 GB de VRAM, lo que permite ejecutarse en tarjetas como RTX 3060, RTX 4060 o RTX 4090.
- El adaptador se puede cargar con la librería `peft` sobre el modelo base. Para despliegue, se pueden usar frameworks compatibles con PEFT, como `transformers` con `peft`, `vLLM` (si se integra el adaptador), o `Ollama` si se exporta a GGUF (aunque no se proporciona en este repositorio).
- La latencia típica para un modelo de 4B en una GPU consumer es de decenas de milisegundos por token, pero no se proporcionan datos concretos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA para interpretación de movimientos de ajedrez. Como referencia, se puede comparar con el modelo base `Qwen3-4B-Base` sin adaptar, que no tiene la capacidad específica de interpretación de movimientos, pero es un modelo general de lenguaje. También existe el repositorio `yav1327/qwen-3-4b-intent-model-V2` en Hugging Face, que parece ser otro intento de modelo de intención, pero no se han encontrado datos técnicos ni resultados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-4B-Base | 4B | No disponible (generalmente 32k) | Apache-2.0 | Modelo base general |
| rrodolfo0/qwen3-4b-move-intent-curve-2700 | 4B + LoRA | No disponible | Apache-2.0 | Interpretacion de movimientos de ajedrez |
| yav1327/qwen-3-4b-intent-model-V2 | 4B (estimado) | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo "calificado"**: el autor indica que ningún punto de la curva de entrenamiento cumplió todos los umbrales registrados, por lo que el adaptador no debe considerarse apto para producción sin validación adicional.
- **No ve el tablero**: no puede determinar si un movimiento es legal o único; esa responsabilidad recae en un verificador externo (`chess.js`).
- **No debe usarse como generador de SAN**: el modelo produce una interpretación intermedia, no la notación algebraica estándar.
- **Test panel no es held-out**: el conjunto de prueba es propio del autor y no es independiente, lo que puede inflar los resultados.
- **Ruido ASR sintético**: los ejemplos de ruido son corrupciones textuales artificiales, no transcripciones reales de audio.
- **Riesgo de alucinacion**: como modelo de lenguaje, puede generar interpretaciones incorrectas o `UNKNOWN` de forma errónea, aunque la evaluación reporta 0 falsos aceptados en 30 muestras.
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo depende del modelo base Qwen3-4B-Base, que también es Apache-2.0, así que no hay restricción conocida.

## Enlaces

- Repositorio del adaptador: [https://huggingface.co/rrodolfo0/qwen3-4b-move-intent-curve-2700](https://huggingface.co/rrodolfo0/qwen3-4b-move-intent-curve-2700)
- Dataset de entrenamiento: [https://huggingface.co/datasets/rrodolfo0/move-intent-v2-final](https://huggingface.co/datasets/rrodolfo0/move-intent-v2-final)
- Evidencia de evaluación: [https://huggingface.co/rrodolfo0/move-intent-final-evidence](https://huggingface.co/rrodolfo0/move-intent-final-evidence)
- Modelo base Qwen3-4B-Base: [https://huggingface.co/Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
- Repositorio oficial de Qwen3: [https://github.com/QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- Página de Qwen3 en Ollama: [https://ollama.com/library/qwen3](https://ollama.com/library/qwen3)
