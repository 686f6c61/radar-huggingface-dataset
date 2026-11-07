# en5yme/Yoshino2-1B

## Resumen

Yoshino2 1B es un modelo de razonamiento de pequeno tamano desarrollado por el usuario en5yme, obtenido mediante destilacion del estilo de razonamiento de Nemotron Lightning 30B-A3B sobre la arquitectura de MiniCPM5 1B de OpenBMB. El objetivo declarado por el autor es mejorar las capacidades de razonamiento general de un modelo de 1B parametros para llevarlas a dispositivos de borde (edge), manteniendo un tamano manejable para inferencia local.

El modelo cuenta con 1.080.632.832 parametros y se distribuye en formato safetensors con licencia MIT en el repositorio de la ficha (aunque el autor advierte que la licencia del modelo base es Apache 2.0 y que el repositorio original de MiniCPM5 1B no incluia fichero de licencia). Esta entrenado exclusivamente en ingles y se presenta como un experimento a pequena escala, no como un modelo listo para produccion.

Su relevancia actual radica en el interes por modelos de razonamiento compactos que puedan ejecutarse en hardware de consumo, un segmento donde la oferta de modelos destilados con estilos de razonamiento tipo "thinking" sigue siendo limitada. No obstante, los benchmarks publicados muestran mejoras marginales o mixtas frente al modelo base, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5 1B; detalles de atencion no disponibles) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha principal; existe version GGUF en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (fine-tune); modelo base Apache 2.0 segun el autor |
| Formato de pesos | safetensors (GGUF disponible en repositorio aparte) |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5 1B de OpenBMB y se entrena mediante SFT con LoRA durante 3 epochs usando el framework Unsloth. El conjunto de datos de entrenamiento es sintetico: 10.817 pares pregunta/respuesta (aproximadamente 135 MB) generados con un mecanismo de auto-prompt y un framework de destilacion propio del autor. El dataset incluye tanto muestras one-shot como muestras de contexto profundo con 4 prompts, y esta publicado como en5yme/Nemotron-Lightning-30B-A3B-Distill.

La innovacion tecnica principal es la transferencia del estilo de razonamiento del profesor Nemotron Lightning 30B-A3B (un modelo MoE de 30B con 3B activos) a una arquitectura densa de 1B. Segun el autor, el modelo resultante adopta el estilo de razonamiento y de salida del profesor. No se documentan detalles sobre la arquitectura interna de atencion, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con estilo de salida heredado del profesor Nemotron Lightning.
- Razonamiento multi-paso con cadenas de pensamiento, segun el autor.
- Capacidad de manejar contexto profundo en las muestras de entrenamiento (hasta 4 prompts de contexto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Vision, audio u otras modalidades: no disponibles.
- Modo thinking explicito: no confirmado en la informacion proporcionada.

## Casos de uso

- Razonamiento local en dispositivos de borde: con 1B parametros, el modelo puede ejecutarse en portatiles y mini-PC sin GPU dedicada, adecuado para prototipos de asistentes que resuelven problemas logicos o matematicos simples sin conexion.
- Experimentacion academica con destilacion: sirve como caso de estudio de como transferir estilos de razonamiento de un MoE de 30B a un modelo denso de 1B mediante SFT con LoRA y datos sinteticos.
- Generacion de explicaciones paso a paso en ingles: util para tareas educativas donde se necesita ver el razonamiento intermedio, aunque con la cautela de que el modelo no es de produccion.
- Filtrado y clasificacion de texto con razonamiento: el modelo puede clasificar o etiquetar contenido explicando brevemente su decision, aprovechando su estilo de salida razonado.
- Base para fine-tunes posteriores: al ser un modelo pequeno con licencia MIT en el fine-tune, puede servir como punto de partida para experimentos de ajuste en dominios especificos en ingles.
- Evaluacion de pipelines de destilacion: util para investigadores que quieran reproducir o comparar el framework de destilacion del autor con otras tecnicas de compresion de conocimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor (tareas tinyBenchmarks, sin desviacion estandar reportada):

| Tarea | Yoshino2 1B | MiniCPM5 1B |
|---|---|---|
| tinyArc (25-shot, acc_norm) | 0.4221 | 0.4278 |
| tinyHellaswag (10-shot, acc_norm) | 0.5092 | 0.5038 |
| tinyMMLU (0-shot, acc_norm) | 0.5143 | 0.4897 |
| tinyTruthfulQA (0-shot, acc) | 0.4362 | 0.4199 |

El fine-tune mejora en tinyHellaswag, tinyMMLU y tinyTruthfulQA, pero empeora ligeramente en tinyArc. Las diferencias son pequenas y no se reportan intervalos de confianza, por lo que la significancia estadistica no esta establecida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en FP16 (coincide con el tamano del repo); alrededor de 0,6-0,7 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPUs integradas y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM en FP16.
- Opciones de despliegue: llama.cpp y Ollama mediante la version GGUF publicada en en5yme/Yoshino2-1B-GGUF; vLLM y TGI son viables en FP16 aunque sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yoshino2 1B | 1,08B | no disponible | MIT (fine-tune) | Hugging Face (safetensors y GGUF) |
| MiniCPM5 1B (base) | 1B | no disponible | Apache 2.0 segun el autor | Hugging Face |
| Yoshino-0.8B | 0,8B | no disponible | no disponible | Hugging Face (GGUF) |

No se dispone de datos de benchmarks comparativos con otros modelos destilados de razonamiento de tamano similar en la informacion proporcionada. La comparativa mas directa es con el propio modelo base, cuyos resultados se incluyen en la seccion de benchmarks.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es un modelo frontier listo para produccion, sino un experimento a pequena escala para uso personal y experimental.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 1B con datos de entrenamiento sinteticos; el estilo de razonamiento del profesor no garantiza correccion factual.
- Posible contaminacion o sesgo derivado de los datos sinteticos generados por auto-prompt, sin documentacion sobre filtrado o diversidad del dataset.
- Ambiguedad de licencia: el autor indica que el fine-tune es MIT, pero el modelo base es Apache 2.0 y el repositorio original no incluia fichero de licencia; conviene verificar la procedencia antes de un uso comercial.
- Sin soporte documentado de tool calling, agentes ni multimodalidad, lo que limita su uso en pipelines complejos.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas sin verificacion previa.
- Metricas de benchmarks sin intervalos de confianza y con diferencias minimas frente al base; las mejoras no estan estadisticamente contrastadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-1B
- Version GGUF: https://huggingface.co/en5yme/Yoshino2-1B-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Perfil del autor: https://huggingface.co/en5yme
- Modelos del autor: https://huggingface.co/en5yme/models
