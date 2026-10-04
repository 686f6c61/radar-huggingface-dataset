# ritwika96/arc-agi2-grid-transformer-trainium-v1

## Resumen

El Grid Reasoning Transformer es un modelo de investigación publicado por el usuario ritwika96 en HuggingFace que aborda las tareas de razonamiento visual abstracto del benchmark ARC-AGI-2. No es un modelo de lenguaje: opera sobre rejillas de hasta 30×30 celdas con 10 clases de color, aprende mecanismos espaciales a partir de pares de demostración (entrada/salida) y los aplica a una rejilla de consulta. La arquitectura es un Transformer puro entrenado desde cero con atención axial (fila y columna), memoria de conjunto y un estado recurrente compuesto por tokens de razonamiento.

El modelo por defecto tiene 43.451.974 parámetros, anchura 512, ocho cabezas de atención, anchura oculta SwiGLU de 1536, dos capas axiales, dos capas de pares, dos capas de conjunto, dos bloques de razonamiento y dos capas de decodificador. Su innovación central es un bucle recurrente sobre 64 tokens de espacio de trabajo con pesos compartidos entre iteraciones: aumentar el número de iteraciones incrementa el cómputo sin añadir parámetros.

Fue entrenado sobre las tareas públicas de ARC-AGI-1 (repositorio de François Chollet) y ARC-AGI-2, más un generador sintético de tareas, y se ejecutó sobre hardware AWS Trainium con el SDK Neuron. Con cero descargas y cero "likes" en el momento de la consulta, debe considerarse un artefacto de investigación en curso, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer puro con atención axial (fila/columna), atención de pares, memoria de conjunto y bucle recurrente de razonamiento |
| Parametros totales | 43.451.974 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens de texto; procesa un lienzo de 30×30, cuatro demostraciones en contexto, 64 tokens de espacio de trabajo y 32 tokens de memoria comprimida por demostración |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre rejillas, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (librería `pytorch`; no se especifica safetensors ni GGUF) |
| Anchura del modelo | 512 |
| Cabezas de atencion | 8 |
| Anchura oculta SwiGLU | 1536 |
| Lienzo de entrada | 30×30 celdas, 10 clases de color |
| Cabezas de salida | una de color (10 clases) y dos de altura/anchura (30 clases cada una) |
| Tamano del repositorio | 1,0 GB |
| Hardware de entrenamiento | AWS Trainium (SDK Neuron) |

## Arquitectura y entrenamiento

El modelo mantiene cada posición de la rejilla como un token independiente durante la codificación. En lugar de aplicar atención completa sobre todas las celdas de todas las demostraciones (coste cuadrático), usa atención axial: una pasada de atención por filas y otra por columnas que intercambian información en toda la rejilla. Cada par de demostración se procesa de forma independiente, preservando la correspondencia entre entrada y salida. El codificador de conjunto no incorpora embeddings de orden de demostración, y la memoria de cada par se comprime a 32 tokens, una decisión arquitectónica que el propio autor advierte que puede perder detalle fino. Los tokens de consulta sí se mantienen a resolución completa tanto para el espacio de razonamiento como para el decodificador de salida.

El bloque de razonamiento usa pre-normalización y tres sumas residuales con escala fija de 0,2: `x = x + 0,2 · self_attention(layer_norm(x))`, `x = x + 0,2 · cross_attention(layer_norm(x), memoria_y_consulta)` y `x = x + 0,2 · swiglu(layer_norm(x))`. Hay dos bloques distintos dentro de cada iteración de razonamiento y sus pesos se reutilizan en todas las iteraciones. Cada actualización del optimizador agrupa ocho micro-lotes de un episodio cada uno; un episodio incluye todos los pares de demostración disponibles, la consulta y la salida objetivo (usada solo por la pérdida). La retropropagación recorre el desenrollado completo; los gradientes se acumulan, se recortan y se aplica una única actualización AdamW. El entrenamiento usa BF16 en las operaciones forward con parámetros y estado del optimizador en FP32, AdamW con tasa de aprendizaje máxima 0,0003, 1000 pasos de calentamiento, decaimiento coseno, decaimiento de peso 0,01 y recorte de gradiente por norma global 1.

El autor define un currículo de profundidad recurrente: de 1 a 10.000 actualizaciones se usan 4 iteraciones con mecanismos individuales; de 10.001 a 50.000, 8 iteraciones con composiciones de dos operaciones; de 50.001 a 150.000, 16 iteraciones con hasta tres operaciones; y a partir de 150.001, 32 iteraciones con hasta cinco operaciones. El objetivo declarado es de 650.000 actualizaciones del optimizador, aunque el propio autor lo describe como una meta y no como una estimación de lo que puede completar un bloque de cómputo comprado. El corpus combina tareas públicas de ARC-AGI-1 y ARC-AGI-2, deduplicadas mediante hashes canónicos de tarea y divididas en entrenamiento y un 10% de retención, junto con un generador sintético en línea que cubre reflexión, rotación, transposición, recorte, recoloreado, gravedad, contorno y mosaico. Todas las consultas y aumentos de una tarea siguen su misma partición.

## Capacidades

- Razonamiento sobre rejillas ARC-AGI: infiere reglas de transformación a partir de pares de demostración y las aplica a una consulta.
- Predicción conjunta de color, altura y anchura de la rejilla de salida mediante cabezas paralelas, con recorte posterior al tamaño predicho.
- Composición de operaciones: el currículo entrena explícitamente composiciones de hasta cinco operaciones encadenadas.
- Generalización dentro de la biblioteca de generación sintética, medida con un conjunto de validación que reserva pares de familias de operaciones en ambos órdenes.
- Manejo de máscaras de relleno, tratando el negro como un color válido más.
- No dispone de soporte de tool calling, function calling, agentes, capacidades multilingües ni modalidades de texto, visión natural, audio o thinking mode. Es un modelo unimodal de rejillas.

## Casos de uso

- Investigación en razonamiento abstracto: banco de pruebas reproducible para medir si una arquitectura recurrente con atención axial resuelve tareas ARC-AGI-2 frente a enfoques basados en modelos de lenguaje.
- Estudio de escalado por cómputo sin escalado de parámetros: al reutilizar pesos entre iteraciones, permite estudiar el efecto de aumentar la profundidad recurrente manteniendo fijo el tamaño del modelo (43,45 M de parámetros).
- Evaluación de pipelines de entrenamiento en AWS Trainium: el modelo documenta recompilación de grafos por cambio de profundidad del currículo, acumulación de gradientes y uso de escalares residentes en dispositivo, útil como referencia para otros proyectos Neuron.
- Generación de datos sintéticos para ARC: el generador en línea de tareas (reflexión, rotación, gravedad, mosaico, etc.) puede reutilizarse para aumentar otros conjuntos de entrenamiento con verificación de candidatos y rechazo de episodios ambiguos.
- Punto de partida para destilación o ajuste fino: al ser un modelo pequeño de 43 M de parámetros, sirve como base para experimentar con variantes de memoria de conjunto o de compresión de pares.
- Estudio de la compresión de memoria: la memoria de 32 tokens por demostración es un parámetro de diseño explícito, lo que permite medir experimentalmente la pérdida de detalle frente a memoria no comprimida.
- Análisis de sesgos de partición: el manifiesto de divisiones con hashes canónicos permite auditar fugas entre entrenamiento y retención, útil para trabajos de metodología en benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe que la evaluación informa de rejillas exactas, pero el texto proporcionado está truncado y no incluye cifras. El autor indica además que la validación actual solo mide composición dentro de su biblioteca restringida de generadores y que hace falta una evaluación más fuerte con familias de generadores independientes, mecanismos no vistos y programas más largos.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 174 MB (43,45 M de parámetros × 4 bytes); en BF16, aproximadamente 87 MB. Son estimaciones de cálculo, no datos publicados por el autor.
- Inferencia en GPU de consumo: el modelo cabe con holgura en cualquier GPU con al menos 2 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). También es viable en CPU.
- GPUs de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar o para ejecutar muchas iteraciones recurrentes en paralelo.
- VRAM estimada para inferencia: por debajo de 1-2 GB contando activaciones, aunque el autor no publica una cifra. No confirmado.
- Entrenamiento: el autor lo ejecutó en AWS Trainium con el SDK Neuron. El primer run usa un único proceso y el autor indica que la ocupación del dispositivo y el rendimiento deben medirse antes de aumentar la concurrencia.
- Opciones de despliegue: al ser una arquitectura personalizada en PyTorch, no hay soporte indicado en vLLM, TGI, llama.cpp ni Ollama. Requiere cargar el código del modelo y ejecutarlo con PyTorch.
- Latencia y throughput: no disponible. El autor señala que el throughput medido determina cuántas actualizaciones caben en el bloque de cómputo, pero no publica la cifra.
- Nota: el repositorio ocupa 1,0 GB pese a los 43 M de parámetros, probablemente por incluir puntos de control y estado del optimizador en FP32. El autor no lo detalla.

## Comparativa con modelos similares

El autor no proporciona comparaciones con otros modelos, y la búsqueda web no devolvió información relevante (solo páginas genéricas de Reddit sin relación con el modelo). ARC-AGI-2 es un benchmark, no una familia de modelos, por lo que no hay una lista fiable de alternativas equivalente en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arc-agi2-grid-transformer-trainium-v1 | 43,45 M | lienzo 30×30, 4 demostraciones | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El modelo se entrena con un generador sintético de biblioteca cerrada, lo que puede sesgar el aprendizaje hacia esos mecanismos y no hacia reglas arbitrarias de ARC.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero el modelo puede producir rejillas plausibles e incorrectas; la evaluación se basa en coincidencia exacta de rejilla, lo que no captura corrección parcial.
- Limitación de memoria: la compresión de la memoria de cada demostración a 32 tokens es un compromiso arquitectónico que el propio autor reconoce que puede perder detalle fino de los ejemplos.
- Limitación de generalización: el currículo y la validación se restringen a una biblioteca de operaciones conocida; el autor afirma explícitamente que hace falta evaluar familias de generadores independientes, mecanismos no vistos y programas más largos.
- Limitación de dominio: solo procesa rejillas de hasta 30×30 con 10 colores. No procesa texto, imágenes naturales, audio ni código.
- Estabilidad: la escala residual inicial de 0,2 está fijada como decisión de diseño y el autor la describe como una elección por validar, no como una garantía de estabilidad.
- Restricciones de licencia: la licencia no está especificada en la información disponible, por lo que no puede asumirse uso comercial.
- Advertencia para producción: cero descargas y cero "likes"; objetivo de entrenamiento declarado como meta no verificada (650.000 actualizaciones) y ejecución detenida por una ventana de tiempo, no por convergencia comprobada.
- La model card está truncada en la información proporcionada (sección de evaluación cortada), por lo que los resultados completos podrían existir pero no son accesibles aquí.
- La fecha de creación del repositorio es 2026-10-04, posterior a la fecha habitual de referencia; conviene verificar la vigencia de los datos.

## Enlaces

- HuggingFace: https://huggingface.co/ritwika96/arc-agi2-grid-transformer-trainium-v1
- Model card del autor: incluida en el propio repositorio de HuggingFace.
- Repositorio de tareas de François Chollet (citado por el autor como fuente de ARC-AGI-1): URL no proporcionada en la información disponible.
- Paper, blog, repositorio de código o demo: no disponible.
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos eran páginas genéricas de Reddit sin relación.
