# fromziro/TinyImageGen-0.6M

## Resumen

TinyImageGen-0.6M es un modelo de generación de imágenes incondicional desarrollado por el equipo FromZero (fromziro), que hasta ahora se había centrado en modelos de lenguaje pequeños. Con apenas 639.280 parámetros, es uno de los modelos de generación de imágenes más compactos que existen, diseñado para explorar los límites de la eficiencia paramétrica en esta tarea. El modelo genera imágenes de 32x32 píxeles sin ninguna condición de entrada, utilizando una arquitectura personalizada que combina mecanismos inspirados en sus modelos de texto a texto.

La relevancia de este modelo reside en su carácter experimental: demuestra que es posible entrenar un generador de imágenes con menos de un millón de parámetros, aunque los resultados visuales son, como reconocen sus propios autores, mayoritariamente incoherentes. Está pensado como base para investigación sobre arquitecturas ultraligeras, destilación de conocimiento o como punto de partida para tareas de generación a muy baja resolución. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace ejecutable incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Custom (mHC, Hadamard FFN con SwiGLU, 2D Axial RoPE, diffusion continua) |
| Parametros totales | 639.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TinyImageGen utiliza una arquitectura completamente personalizada, descrita por sus autores como inspirada en sus modelos de texto a texto. Emplea un bloque de atención con mHC (multi-head con cabezas compartidas), FFN de Hadamard con intervalos SwiGLU (cada 3 capas), y 2D Axial RoPE para codificar posiciones en la imagen. El modelo tiene un tamaño oculto de 96, 6 capas, patch de 2x2, 4 cabezas de atención y 2 cabezas KV (Grouped-Query Attention), con un tamaño intermedio de 160 y 4 "lanes". El objetivo de entrenamiento es una diffusion continua, con 50 pasos de muestreo en inferencia.

El entrenamiento se realizó sobre 50.000 imágenes del dataset DataComp (mlfoundations/datacomp_1b) durante 15 épocas, alcanzando una pérdida final de 0.2119. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal es la combinación de elementos de eficiencia paramétrica (GQA, SwiGLU espaciado, Hadamard) en un modelo de generación de imágenes, logrando un tamaño extremadamente reducido.

## Capacidades

- Generacion de imagenes incondicionales de 32x32 píxeles en RGB.
- Muestreo con 50 pasos de diffusion, configurable mediante el argumento `num_steps`.
- Generacion de multiples muestras en una sola llamada (el ejemplo usa 6).
- Salida normalizada en el rango [-1, 1], lista para denormalizar a [0, 1].
- Integracion con la libreria `transformers` mediante `AutoModel` y `trust_remote_code=True`.
- Ejecucion en CPU o GPU (el codigo de ejemplo selecciona dispositivo automaticamente).
- No soporta condicionamiento por texto, clases ni ninguna entrada externa.

## Casos de uso

- Experimentacion educativa: ideal para demostrar conceptos de diffusion y arquitecturas ultraligeras en cursos de deep learning, dado su tamaño minimo y facilidad de ejecucion en cualquier hardware.
- Prototipado rapido de pipelines de generacion: al ser tan pequeño, permite iterar rapidamente en el flujo de muestreo, postprocesado o integracion con otras herramientas sin coste computacional.
- Base para destilacion de conocimiento: puede servir como modelo "profesor" o "alumno" en experimentos de destilacion hacia arquitecturas aun mas pequeñas o para estudiar la transferencia de representaciones.
- Investigacion sobre limites de escala: util para estudiar que minimo de parametros y datos se necesitan para aprender distribuciones de imagenes simples, y como afecta la arquitectura a la calidad.
- Generacion de texturas o ruido controlado: aunque las salidas son incoherentes, podria usarse como generador de texturas aleatorias o ruido estructurado para aumentacion de datos en otros modelos.
- Benchmark de eficiencia: sirve como punto de referencia para medir latencia y consumo de recursos en dispositivos embebidos o entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida final de entrenamiento (0.2119) y no proporciona metricas como FID, IS o comparaciones con otros modelos. No se dispone de datos objetivos de calidad de generacion.

## Requisitos de hardware

- VRAM estimada: menos de 10 MB en FP32 (639k parametros), por lo que cabe en cualquier GPU moderna e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU (el ejemplo de uso incluye seleccion automatica de dispositivo).
- Compatibilidad con consumer GPU: total, incluyendo GPUs integradas o tarjetas antiguas.
- Opciones de despliegue: al ser un modelo de `transformers`, puede usarse con la API estandar de Hugging Face. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia especializados.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño y la resolucion de salida (32x32), se espera una generacion de 6 imagenes en menos de un segundo en GPU y en pocos segundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (generacion de imagenes incondicional con menos de 1M de parametros). Los modelos de generacion de imagenes mas pequeños publicados suelen superar los 10M de parametros (por ejemplo, algunos modelos de MNIST o CIFAR-10). Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Salidas mayoritariamente incoherentes: el propio autor reconoce que las imagenes generadas no son identificables, por lo que no es apto para uso en produccion ni para tareas que requieran calidad visual.
- Resolucion fija de 32x32: no se puede generar a mayor resolucion sin modificar la arquitectura o añadir superresolucion.
- Sin condicionamiento: no acepta texto, clases ni imagenes de entrada, limitando su aplicabilidad a tareas incondicionales.
- Datos de entrenamiento limitados: solo 50k imagenes de DataComp, lo que restringe la diversidad de la distribucion aprendida.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; se recomienda auditar el codigo antes de usarlo en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, por lo que cualquier afirmacion sobre rendimiento debe tomarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fromziro/TinyImageGen-0.6M
- Perfil del autor (FromZero): https://huggingface.co/fromziro
- Dataset de entrenamiento (DataComp): https://huggingface.co/datasets/mlfoundations/datacomp_1b
