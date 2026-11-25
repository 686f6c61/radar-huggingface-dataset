# orz99/MiniT2I-B-16-MF-compact-webgpu-int8

## Resumen

MiniT2I-B-16-MF-compact-webgpu-int8 es una conversión a ONNX e int8 del modelo de generación de texto a imagen MiniT2I-B-16-MF-compact, publicada por el usuario orz99. El modelo original MiniT2I procede de la investigación de Xianbang Wang, Hanhong Zhao, Yiyang Lu, Kangyang Zhou, Linrui Ma y Kaiming He, y la versión compacta la preparó lox9973. Esta variante empaqueta el codificador de texto T5 y los cuatro pasos del sampler Mean Flow en un único grafo ONNX pensado para ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU.

La relevancia de esta ficha está en su enfoque de despliegue: no es un modelo pensado para servidores con GPU dedicada, sino para inferencia local en el cliente. Con un repositorio de 0,3 GB y pesos int8 que se reconvierten a fp16 dentro del grafo, el autor reporta unos 0,55 segundos por imagen de 512 × 512 en Chrome sobre un Apple M3 Max. La entrada es un tensor de IDs de T5 de longitud 256, una máscara de atención y un tensor de ruido gaussiano estándar multiplicado por 2; la salida es una imagen de 512 × 512 en formato float que se reescala a 8 bits.

La licencia es MIT, heredada del modelo original, lo que facilita su integración en productos comerciales. No obstante, la información publicada es escasa: no hay datos de benchmarks, de composición del dataset de entrenamiento ni de idiomas soportados más allá de lo que implica el uso de un tokenizador T5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con sampler Mean Flow (4 pasos), codificador de texto T5, exportado como grafo ONNX único |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada de texto (IDs de T5 con padding a 0) |
| Tipos de cuantización | Pesos int8 con escala por columna de salida y DequantizeLinear; cómputo mixto fp32 (T5) y fp16 (transformer de imagen) |
| Idiomas soportados | no disponible (depende del tokenizador T5 del modelo base) |
| Licencia | MIT |
| Formato de pesos | ONNX (minit2i.onnx más minit2i.onnx.data) |

## Arquitectura y entrenamiento

El modelo sigue la familia MiniT2I, un text-to-image basado en difusión con Mean Flow, un esquema que reduce el número de pasos de muestreo a cuatro. La conversión incluye el codificador de texto T5 y los cuatro pasos del sampler dentro de un mismo grafo ONNX, de modo que el consumidor solo aporta IDs de token, máscara de atención y ruido. El transformer de imagen opera en fp16 con una RMSNorm preparada para evitar desbordamientos, mientras que T5 se mantiene en fp32 porque sus estados ocultos alcanzan valores en torno a 286.000, por encima del límite de 65.504 de fp16.

La cuantización int8 aplica una escala por columna de salida a cada peso de matmul y a la tabla de embeddings de T5, seguida de DequantizeLinear y un cast a fp16. Además, se precalculan y fijan como constantes las tablas de RoPE, los embeddings de posición, el sesgo posicional de T5 y los tokens fijos de timestep y guidance. Los ajustes de muestreo están fijados a escala de guidance 12, intervalo de guidance [0,2, 0,8] y cuatro pasos, en línea con el modelo upstream. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes de 512 × 512 a partir de una descripción textual, en un solo paso de inferencia con el grafo ONNX.
- Muestreo Mean Flow de cuatro pasos con escala de guidance e intervalo fijados (12 y [0,2, 0,8]).
- Ejecución en navegador mediante onnxruntime-web con el execution provider WebGPU.
- Entrada de texto tokenizada con T5, limitada a 256 tokens con padding a 0.
- Control de la generación mediante el tensor de ruido inicial (gaussiano estándar multiplicado por 2), lo que permite reproducir resultados con la misma semilla.
- Pesos int8 que se descuantizan a fp16 dentro del grafo, reduciendo a la mitad la descarga sin pérdida apreciable de velocidad según el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación de imágenes en el navegador sin backend: al ejecutarse con onnxruntime-web sobre WebGPU, permite ofrecer un generador de ilustraciones o avatares directamente en una aplicación web sin enviar prompts a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.
- Herramientas creativas de prototipado rápido: con unos 0,55 s por imagen en un Apple M3 Max, encaja en interfaces de exploración de ideas donde el usuario itera sobre un prompt y necesita ver variaciones con baja latencia.
- Aplicaciones de escritorio o PWA offline: el tamaño de 0,3 GB y el formato ONNX permiten empaquetar el modelo en una aplicación instalable que genere imágenes sin conexión una vez descargado.
- Demos educativas y de investigación sobre difusión: al exponer un grafo único con T5 y el sampler Mean Flow, sirve para estudiar el flujo completo de un text-to-image moderno en un entorno controlado y multiplataforma.
- Generación de recursos para juegos o web: útil para producir placeholders, iconos o fondos de 512 × 512 en el propio cliente, con control por semilla para reproducir resultados concretos.
- Integración en notebooks y entornos de análisis: el formato ONNX permite cargar el modelo con onnxruntime en Python para experimentar con prompts y semillas sin depender de PyTorch, aunque el destino principal sea el navegador.
- Prototipos de bajo coste en hardware de consumo: al no requerir GPU de servidor, se puede validar una idea de producto de generación de imágenes antes de invertir en infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de despliegue: aproximadamente 0,55 segundos por imagen de 512 × 512 en Chrome sobre un Apple M3 Max, una diferencia de 8 a 13 niveles sobre 255 por píxel respecto a la pipeline fp32 de PyTorch en Chrome WebGPU, y un incremento medio de 2,9 niveles por píxel atribuible a la cuantización int8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB en disco y el grafo descuantiza a fp16 en tiempo de ejecución, por lo que la memoria necesaria supera el tamaño de los pesos.
- GPU recomendadas: el autor valida el funcionamiento en un Apple M3 Max con Chrome y WebGPU; no se especifican modelos de GPU de escritorio concretos.
- Cabe en GPU de consumo: sí, el enfoque está pensado para hardware de cliente con WebGPU; no se detallan requisitos mínimos.
- Opciones de despliegue: onnxruntime-web con execution provider WebGPU en el navegador; también es posible cargar el grafo con onnxruntime en otros entornos compatibles con ONNX, aunque no está documentado por el autor.
- Latencia y throughput: alrededor de 0,55 s por imagen de 512 × 512 en Chrome sobre Apple M3 Max; no se publican cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de texto | Formato | Licencia | Enfoque de despliegue |
|---|---|---|---|---|---|
| orz99/MiniT2I-B-16-MF-compact-webgpu-int8 | no disponible | 256 tokens | ONNX int8/fp16 | MIT | Navegador con WebGPU |
| lox9973/MiniT2I-B-16-MF-compact (modelo base) | no disponible | no disponible | no disponible | no disponible | Framework de origen |
| Modelos de difusión text-to-image de gran tamaño (p. ej. familias SD/Flux) | no disponible en esta ficha | no disponible | safetensors, GGUF, ONNX | variables según modelo | Servidor o GPU dedicada |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la diferencia principal de esta variante frente al modelo base es el empaquetado ONNX con cuantización int8 y la orientación a WebGPU.

## Limitaciones y advertencias

- La resolución de salida está fija en 512 × 512; no se documenta soporte para otras resoluciones o relaciones de aspecto.
- La entrada de texto está limitada a 256 tokens de T5, lo que restringe prompts largos o muy detallados.
- Los ajustes de muestreo (guidance 12, intervalo [0,2, 0,8], cuatro pasos) están fijados como constantes en el grafo, por lo que no se pueden modificar sin reexportar el modelo.
- La cuantización int8 introduce un error medio de 2,9 niveles por píxel frente a la versión fp16, y la ejecución en WebGPU difiere de la pipeline fp32 de PyTorch en 8 a 13 niveles por píxel.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas; al depender de T5, la calidad multilingüe queda sujeta al modelo base.
- El rendimiento medido corresponde a un Apple M3 Max con Chrome; en otras GPUs o navegadores la latencia puede variar y no se publican cifras.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso incluido en LICENSE-MiniT2I.txt correspondiente al modelo original.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orz99/MiniT2I-B-16-MF-compact-webgpu-int8
- Modelo base compacto: https://huggingface.co/lox9973/MiniT2I-B-16-MF-compact
- Paper de MiniT2I: https://peppaking8.github.io/minit2i/
- Demo en el navegador: https://huggingface.co/spaces/cfahlgren1/imagine
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
