# asigalov61/Orpheus-Music-Transformer

## Resumen

Orpheus Music Transformer es un modelo de transformador autoregresivo especializado en generación musical multi-instrumental, desarrollado por Project Los Angeles y publicado por el usuario asigalov61 en HuggingFace. Está diseñado para resolver tareas de composición algorítmica como generación desde cero, continuación de secuencias MIDI, inpainting de notas y batería, infilling de puentes (bridge), creación de loops y segmentación musical. Su relevancia radica en que combina una arquitectura eficiente con una tokenización compacta y un entrenamiento masivo sobre 2,31 millones de pistas MIDI de alta calidad, lo que lo sitúa como un modelo de referencia (SOTA) en su categoría.

La arquitectura principal es un transformer autoregresivo de 748 millones de parámetros (versión Large) con embeddings posicionales rotatorios (RoPE) y Flash Attention, capaz de manejar secuencias de hasta 8.000 tokens, suficientes para capturar estructuras musicales extendidas. También existe una versión Medium de 479 millones de parámetros y varios modelos auxiliares y fine-tunings específicos (karaoke, loops, melodías monofónicas, etc.). El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato PyTorch (.pth). Aunque el repositorio ocupa 106,6 GB, el modelo base Large pesa alrededor de 1,5 GB en bfloat16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con RoPE y Flash Attention |
| Parametros totales | 748M (Large) / 479M (Medium) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | bfloat16 (no se documentan otras cuantizaciones) |
| Idiomas soportados | en (aunque la salida es MIDI, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo principal es un transformer autoregresivo de 748M parámetros con RoPE (Rotary Positional Embeddings) y Flash Attention, lo que permite una atención eficiente sobre secuencias de hasta 8.000 tokens. La tokenización es compacta: utiliza 3 tokens por nota y 7 tokens por triada, con un orden de duración y velocidad al final de cada evento para mejorar la expresividad. El entrenamiento se realizó durante tres épocas sobre 2,31 millones de pistas MIDI de alta calidad procedentes del dataset Godzilla, junto con otros datasets complementarios como Mono-Segments, Discover-MIDI y MIDI-Loops. Se empleó precisión bfloat16 y productos sparse-dense para acelerar la inferencia en CUDA.

Además del modelo base, se presentan doce modelos en total: dos bases (Large y Medium), un modelo auxiliar para bridge inpainting, varios fine-tunings (karaoke, segmentos LRNO, loops, canciones infantiles, melodías monofónicas) y un clasificador entrenado para distinguir entre música humana y música generada por Orpheus. El modelo utiliza un filtro de muestreo top-p con temperatura ajustable durante la generación.

## Capacidades

- Generación de música multi-instrumental desde cero o a partir de una semilla MIDI.
- Continuación de secuencias MIDI manteniendo coherencia estilística y armónica.
- Inpainting de notas y batería en composiciones existentes.
- Infilling de puentes (bridge) para conectar secciones musicales de forma fluida.
- Generación de loops multi-instrumentales (modelo fine-tuned específico).
- Segmentación musical y generación de segmentos (modelo LRNO).
- Generación de plantillas de letras karaoke a partir de MIDI (modelo karaoke).
- Clasificación de música humana vs. generada por el modelo (modelo clasificador).
- Soporte de generación por lotes (diez lotes paralelos) con previsualización de audio y piano-roll en la interfaz Gradio.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generación musical.

## Casos de uso

- Composición asistida para productores musicales: el modelo puede generar acompañamientos completos a partir de una melodía semilla, permitiendo explorar variaciones armónicas y rítmicas en minutos.
- Creación de bandas sonoras para videojuegos o vídeo: gracias a su capacidad de generar música multi-instrumental con contexto largo, puede producir pistas de 8.000 tokens que cubren secciones extensas sin repeticiones evidentes.
- Inpainting de secciones defectuosas en grabaciones MIDI: si una pista tiene un compás con errores o silencios, el modelo puede rellenar esas partes manteniendo el estilo del resto de la composición.
- Generación de loops para producción electrónica: el modelo fine-tuned de loops permite crear bucles rítmicos y melódicos listos para usar en DAWs como Ableton o FL Studio.
- Educación musical: el modelo puede generar ejercicios de armonía o melodía para estudiantes, y el clasificador puede usarse para evaluar si una pieza es original o generada por IA.
- Prototipado rápido de ideas musicales: los compositores pueden introducir un fragmento MIDI y obtener diez continuaciones diferentes en paralelo, lo que acelera el proceso de lluvia de ideas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de loss y accuracy durante el entrenamiento (por ejemplo, loss 0.6682 y accuracy 0.8054 para el modelo Large), pero no hay comparaciones estandarizadas como MMLU, HumanEval o métricas específicas de generación musical frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo Large en bfloat16 ocupa aproximadamente 1,5 GB de pesos, pero la generación requiere memoria adicional para activaciones y estados de atención. Con una ventana de 8.000 tokens, se estima un uso de VRAM entre 4 y 8 GB según el batch size.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM y soporte CUDA (por ejemplo, RTX 3060, RTX 3070, RTX 4070, A100). El modelo está optimizado para CUDA con bfloat16 y sparse-dense products.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB pueden ejecutar el modelo sin problemas para generación de secuencias moderadas.
- Opciones de despliegue: se proporcionan notebooks de inferencia en el repositorio y una interfaz Gradio en HuggingFace Spaces. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que el modelo no está en formato GGUF ni safetensors.
- Latencia y throughput: no se han publicado cifras oficiales. En una GPU moderna, se espera una generación de unos pocos tokens por segundo, dependiendo del tamaño del batch y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones fiables sin datos adicionales de otros modelos de generación musical MIDI.

## Limitaciones y advertencias

- Sesgos de estilo: el entrenamiento se realizó sobre MIDIs de alta calidad, lo que puede limitar la diversidad estilística y favorecer géneros musicales occidentales o convenciones armónicas comunes.
- Riesgo de alucinación: como cualquier modelo autoregresivo, puede generar secuencias musicalmente incoherentes o con errores armónicos, especialmente fuera de los patrones aprendidos.
- Limitación de contexto: la ventana de 8.000 tokens, aunque amplia, puede ser insuficiente para composiciones muy largas o con muchas pistas simultáneas.
- Dependencia de la calidad de la semilla: la generación condicionada a un MIDI de entrada hereda las imperfecciones de ese MIDI.
- Formato de pesos propietario: los pesos están en .pth, lo que requiere PyTorch y no son directamente compatibles con frameworks como TensorFlow o ONNX sin conversión.
- Licencia Apache 2.0 permite uso comercial, pero los datasets utilizados (Godzilla, Discover-MIDI, etc.) pueden tener sus propias restricciones; es recomendable revisar sus licencias antes de usar el modelo en productos comerciales.
- El repositorio es grande (106,6 GB) debido a los múltiples modelos y archivos, lo que puede dificultar la descarga en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asigalov61/Orpheus-Music-Transformer
- Repositorio GitHub: https://github.com/asigalov61/Orpheus-Music-Transformer
- Página del proyecto: https://asigalov61.github.io/Orpheus-Music-Transformer/
- Aplicación web (Gradio): https://asigalov61.github.io/Orpheus-Music-Transformer-Web-App/
- Colección de demos en HuggingFace: https://huggingface.co/collections/asigalov61/orpheus-music-transformer-685c3c8e59ed1414c02bb8cd
