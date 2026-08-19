# Legal-verse/gemma-4-e2b-merged-mlx-4bit

## Resumen

Este repositorio contiene una versión cuantizada en MLX de 4 bits del modelo Gemma 4 E2B, con un adaptador LoRA fusionado. El checkpoint `Legal-verse/gemma-4-e2b-merged-mlx-4bit` parte del modelo base `google/gemma-4-E2B-it`, le aplica la fusión de un adaptador LoRA denominado "Sinergi Gemma 4 E2B section-sliced" y convierte el resultado a pesos MLX affine de 4 bits con grupo de tamaño 64. Está orientado a la inferencia en hardware Apple Silicon mediante el framework MLX y el servidor vLLM-Metal, que lo soporta de forma experimental.

El modelo es multimodal (imagen-texto a texto) según su pipeline, y está diseñado para escenarios de despliegue ligero, como dispositivos edge o aplicaciones de baja latencia. El número de parámetros totales reportado en los safetensors es de 1.196.197.443 (aproximadamente 1,2 mil millones), aunque el modelo base original Gemma 4 E2B tiene 2,1 mil millones de parámetros según las especificaciones oficiales de Google. La licencia no está especificada en la ficha de HuggingFace, y el idioma soportado es únicamente inglés.

La relevancia de este checkpoint radica en ofrecer una versión optimizada para Apple Silicon de un modelo ya de por sí compacto, con la ventaja de tener el LoRA ya fusionado, lo que simplifica el despliegue en producción sin necesidad de cargar adaptadores adicionales. Sin embargo, al ser un repositorio sin descargas ni valoraciones, su calidad y mantenimiento son inciertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basado en Gemma 4 E2B |
| Parametros totales | 1.196.197.443 (según safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8K (según especificaciones del modelo base Gemma 4 E2B; no confirmado para este checkpoint) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 de Google DeepMind, diseñado específicamente para entornos de bajos recursos (edge, móvil, CPU). Según las fuentes oficiales, Gemma 4 E2B tiene 2,1 mil millones de parámetros, una ventana de contexto de 8K y es capaz de ejecutarse completamente en CPU. La arquitectura es un transformer multimodal que procesa tanto imágenes como texto, aunque los detalles exactos de la atención o el mecanismo de fusión no se especifican en la información disponible.

El proceso de creación de este checkpoint consistió en fusionar un adaptador LoRA (denominado "Sinergi Gemma 4 E2B section-sliced") en el modelo base, y posteriormente convertir el modelo resultante a pesos MLX affine de 4 bits con group size 64. No se proporcionan detalles sobre el dataset de entrenamiento del LoRA, el número de tokens utilizados, ni si se emplearon técnicas de RLHF o DPO. El LoRA ya está fusionado, por lo que no se requiere cargar un adaptador en tiempo de inferencia.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto para producir respuestas de texto.
- Conversación multi-turno: al ser un modelo instructivo (sufijo `-it`), está optimizado para seguir instrucciones y mantener diálogos.
- Inferencia en Apple Silicon: gracias a la conversión a MLX, puede ejecutarse en Macs con chips M1/M2/M3 mediante el framework MLX o vLLM-Metal.
- Despliegue ligero: al tener aproximadamente 1,2 mil millones de parámetros en 4 bits, es adecuado para entornos con recursos limitados de memoria y cómputo.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-paso, ni soporte de otros idiomas además del inglés.

## Casos de uso

- Aplicaciones de visión por computadora en dispositivos edge: el modelo puede procesar imágenes y generar descripciones o responder preguntas sobre ellas, lo que resulta útil en sistemas de asistencia visual o clasificación de imágenes en tiempo real en hardware de bajo consumo.
- Chatbots locales en Mac: al estar optimizado para MLX, puede servir como motor de un asistente conversacional que se ejecuta íntegramente en un Mac, sin necesidad de conexión a la nube, aprovechando la memoria unificada del dispositivo.
- Prototipado rápido de modelos multimodales: investigadores y desarrolladores pueden usar este checkpoint como base para pruebas de concepto en entornos Apple Silicon, gracias a la fusión del LoRA y la cuantización 4-bit que reduce los requisitos de memoria.
- Sistemas de asistencia a la accesibilidad: la capacidad de interpretar imágenes y generar texto puede aplicarse a herramientas que describan escenas para personas con discapacidad visual, siempre que el despliegue se realice en hardware compatible.
- Automatización de documentación visual: en entornos industriales o de oficina, el modelo puede transcribir o resumir contenido de imágenes (capturas, diagramas) de forma local, evitando el envío de datos a servicios externos.
- Evaluación de técnicas de cuantización y fusión de LoRA: este checkpoint sirve como caso de estudio para comparar el rendimiento de modelos cuantizados en MLX frente a otras variantes, como la TurboQuant-MLX-4bit del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint específico. Tampoco se ofrecen comparativas con el modelo base o con otras versiones cuantizadas.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Mac con chip M1, M2, M3 o superior), ya que el formato MLX está diseñado para el Neural Engine y la GPU de estos procesadores.
- Memoria: el tamaño del repositorio es de 3,6 GB, lo que sugiere que el modelo ocupa aproximadamente esa cantidad en disco. En memoria unificada, al ser 4-bit, se estima un uso de entre 1 y 2 GB, aunque no se proporcionan cifras oficiales.
- GPU: no aplica GPU dedicada; se usa la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: vLLM-Metal (experimental), MLX-LM, o cualquier framework compatible con MLX. El README sugiere el uso de `vllm serve` tras instalar vLLM-Metal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Legal-verse/gemma-4-e2b-merged-mlx-4bit | ~1,2B (reportado) | 8K (base) | MLX 4-bit | no disponible | Apple Silicon |
| majentik/gemma-4-E2B-it-TurboQuant-MLX-4bit | ~2,1B (base) | 8K (base) | MLX 4-bit | no disponible | Apple Silicon |
| google/gemma-4-E2B-it (original) | 2,1B | 8K | sin cuantizar | Gemma Terms of Use | multiplataforma |

La comparativa se basa en el modelo base y en la variante TurboQuant. El checkpoint de Legal-verse reporta un número de parámetros inferior al del modelo base, lo que podría deberse a una poda o a un error en la metadata. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye este checkpoint, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Idioma limitado: solo se soporta inglés; no hay evidencia de capacidades multilingües.
- Contexto corto: la ventana de 8K puede ser insuficiente para tareas que requieran documentos largos o historiales extensos.
- Soporte experimental: vLLM-Metal está marcado como experimental, por lo que puede haber inestabilidad o falta de optimización en entornos de producción.
- Riesgo de alucinaciones: al ser un modelo de lenguaje multimodal, puede generar descripciones o respuestas incorrectas sobre imágenes, especialmente en dominios especializados.
- Discrepancia en el número de parámetros: el valor reportado (1,2B) difiere del tamaño oficial del modelo base (2,1B). Esto podría indicar una conversión incompleta o un error en los metadatos; se recomienda verificar la integridad del modelo antes de su uso.
- Sin comunidad ni mantenimiento: el repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por otros usuarios y podría carecer de soporte.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Legal-verse/gemma-4-e2b-merged-mlx-4bit)
- [Modelo base en HuggingFace](https://huggingface.co/google/gemma-4-E2B-it)
- [Página oficial de Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 en Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)
- [Ficha de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Model card oficial de Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Variante TurboQuant MLX 4-bit](https://huggingface.co/majentik/gemma-4-E2B-it-TurboQuant-MLX-4bit)
