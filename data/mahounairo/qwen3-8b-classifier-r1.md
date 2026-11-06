# mahounairo/qwen3-8b-classifier-r1

## Resumen

qwen3-8b-classifier-r1 es un adaptador LoRA de rango 1 entrenado sobre Qwen/Qwen3-8B-Base por el usuario mahounairo. No es un modelo de propósito general, sino una herramienta de interpretabilidad e introspección: tras un marcador especial `⟦?⟧`, el modelo escribe sus tres tokens siguientes más probables y un dígito de confianza para el primero. El objetivo es que el modelo verbalice su propia distribución de salida en lugar de que un analista externo tenga que inspeccionar logits.

El adaptador se publica como un artefacto PEFT (librería `peft`, pesos `safetensors`) y se apoya en el modelo base Qwen3-8B-Base, un transformer denso de aproximadamente 8.000 millones de parámetros. La relevancia del proyecto es metodológica: propone una vía ligera (un LoRA de rango 1) para obtener autoinformes calibrados del modelo, con una degradación mínima del comportamiento en texto plano (KL de 0,007 bits frente al modelo sin adaptador).

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, el tamaño reportado es de 0,0 GB y no se han publicado resultados de benchmarks estándar ni especificaciones detalladas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rango 1) sobre transformer denso Qwen/Qwen3-8B-Base |
| Parámetros totales | no disponible (el modelo base es de ~8B; el adaptador LoRA de rango 1 añade un número muy reducido de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B-Base, no especificada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los del modelo base, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 1 (según la model card) aplicado sobre Qwen3-8B-Base, un transformer denso de la familia Qwen3. El adaptador modifica el comportamiento del modelo únicamente en el contexto del marcador `⟦?⟧`: cuando se activa, el modelo emite los tres tokens siguientes más probables entre comillas y un dígito de confianza (de 0 a 9, presumiblemente) para el primero. El flujo de uso previsto es ejecutar el texto normal con el adaptador desactivado y, a continuación, el marcador y la respuesta con el adaptador activado.

No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. La innovación técnica declarada es doble: por un lado, el uso de un LoRA de rango mínimo para inducir un comportamiento de introspección sin reentrenar el modelo; por otro, la preservación del comportamiento en texto plano, cuantificada con una divergencia KL de 0,007 bits respecto al modelo sin adaptador. La métrica principal reportada es que, en posiciones retenidas donde el modelo tiene menos del 90 % de certeza, el adaptador acierta su segunda opción exacta el 52,3 % de las veces, frente al 31 % obtenido a partir de los logits de otro modelo.

## Capacidades

- Autoinforme de distribución: tras el marcador `⟦?⟧`, genera los tres tokens siguientes más probables y un dígito de confianza para el primero.
- Introspección calibrada: el acierto de la segunda opción (52,3 %) supera la referencia basada en logits de otro modelo (31 %) en posiciones de baja certeza.
- Preservación del comportamiento base: en texto plano, la divergencia respecto al modelo sin adaptador es de 0,007 bits de KL.
- Generación de texto general: hereda las capacidades del modelo base Qwen3-8B-Base cuando el adaptador está desactivado.
- Soporte de tool calling / function calling: no documentado para este adaptador; depende del modelo base y no se especifica.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

- Investigación en interpretabilidad: analizar si el autoinforme textual del modelo coincide con su distribución real de logits, usando el marcador `⟦?⟧` en posiciones controladas de un corpus y comparando con la inspección directa de logits.
- Detección de incertidumbre en producción: insertar el marcador en puntos críticos de un pipeline para obtener un dígito de confianza y los tres candidatos siguientes, y activar revisión humana cuando la confianza sea baja.
- Auditoría de modelos: estudiar la calibración del modelo base en dominios concretos (por ejemplo, preguntas médicas o jurídicas) midiendo la tasa de acierto del segundo candidato frente a la referencia de logits.
- Evaluación de alucinación: usar la discrepancia entre el token emitido y el primer candidato autoinformado como señal de inestabilidad interna en tareas de generación abierta.
- Experimentos docentes: demostrar en cursos o talleres cómo un LoRA de rango 1 puede inducir un comportamiento metacognitivo con una degradación mínima del modelo original.
- Comparación de metodologías de introspección: replicar el protocolo del autor (adaptador desactivado para el texto, activado para el marcador) y contrastar los resultados con técnicas basadas en logits o en sondas lineales.
- Validación de pipelines de adaptadores PEFT: servir como caso de prueba para verificar la carga y el cambio de estado de un adaptador LoRA en frameworks como PEFT o vLLM.

## Benchmarks y rendimiento

| Métrica | Resultado | Referencia |
|---|---|---|
| Acierto de la segunda opción exacta (posiciones con certeza < 90 %) | 52,3 % | 31 % con logits de otro modelo |
| Divergencia KL en texto plano respecto al modelo sin adaptador | 0,007 bits | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al cargar el modelo base Qwen3-8B-Base en precisión completa se requieren del orden de 16 GB solo para pesos, y bastante más para el contexto y el KV cache. El adaptador LoRA en sí ocupa un espacio mínimo.
- GPU recomendadas: no disponibles en la información. Por el tamaño del modelo base, serían necesarias GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) para inferencia en FP16 sin cuantización.
- ¿Cabe en GPU de consumo? No confirmado; con cuantización del modelo base a 8 o 4 bits podría caber en GPUs de 16-24 GB, pero no se documenta compatibilidad con formatos cuantizados.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), y potencialmente frameworks que soporten adaptadores LoRA (vLLM, TGI); no confirmado en la información. llama.cpp y Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-classifier-r1 | LoRA rango 1 sobre Qwen3-8B-Base | ~8B (base) + adaptador mínimo | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B-Base | Transformer denso base | ~8B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Sondas lineales / logit lens (técnicas) | Métodos de interpretabilidad sin adaptador | no aplica | no aplica | no aplica | Bibliotecas de interpretabilidad |

No se dispone de información sobre otros adaptadores de introspección comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado para un marcador concreto (`⟦?⟧`) y un formato de salida específico; fuera de ese protocolo su comportamiento no está documentado.
- El autoinforme no es necesariamente fiel: el 52,3 % de acierto en la segunda opción indica que el modelo verbaliza su distribución de forma imperfecta, por lo que no debe tratarse como una lectura exacta de los logits.
- La métrica de referencia (31 %) corresponde a "los logits de otro modelo", sin que la información detalle cuál; la comparación debe interpretarse con cautela.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, ni limitaciones idiomáticas del adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base tiene su propia licencia que debe verificarse por separado.
- El repositorio presenta 0 descargas y 0 likes, y no se han publicado evaluaciones independientes; la madurez y el soporte del proyecto son limitados.
- No hay información sobre cuantización, por lo que el despliegue en producción requeriría validar el comportamiento del adaptador en el formato elegido.
- El tamaño reportado del repositorio (0,0 GB) sugiere que los pesos del adaptador podrían no estar completamente subidos o que el dato es impreciso; conviene verificarlo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahounairo/qwen3-8b-classifier-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio con resultados, código y límites: https://github.com/mahounairo/qwen3-classifier
