# Franjarjar/Spark-X2.6-4B-EQ-C4

## Resumen

Spark-X2.6-4B-EQ-C4 es una cuantización del modelo base XHToken/Spark-X2.6-4B, publicada por el usuario Franjarjar. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a un formato de cuantización propietario denominado EQ (LaneQuant), nativo del motor de inferencia Espetero, desarrollado por el mismo autor (JarJarFran). El objetivo es ejecutar el modelo en Apple Silicon con un consumo de memoria reducido y una calidad de distribución cercana al modelo en BF16.

El interés técnico de esta ficha reside en el formato de cuantización y en el ecosistema de ejecución, no en una arquitectura nueva: el modelo subyacente es un transformer de aproximadamente 4B parámetros nominales, aunque el recuento real de parámetros en safetensors es de 1.180.982.656 (1,18B), lo que sugiere que el nombre comercial "4B" no coincide con el tamaño efectivo de los tensores publicados. El repositorio ocupa 2,9 GB y está pensado para Macs con Apple Silicon y 8 GB de memoria o más.

La relevancia actual es limitada pero específica: es un ejemplo de cuantización mixta por capas (4, 5 y 6 bits según el tipo de proyección) con métricas de divergencia KL publicadas frente al original y frente a otras alternativas como Q4_K_M y MLX 4-bit. Su utilidad práctica queda restringida al motor Espetero, ya que llama.cpp, MLX y transformers no cargan el formato EQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); formato de cuantizacion EQ (LaneQuant) |
| Parametros totales | 1.180.982.656 (segun safetensors); el nombre comercial indica 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ mixto: capas 0-7 y proyecciones de atencion a 6 bits, down projections a 5 bits, resto a 4 bits con codebooks; embedding/LM head atado en MLX affine 6 bits; puertas de salida de atencion en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato EQ propietario de Espetero (custom_code) |

## Arquitectura y entrenamiento

El modelo base es XHToken/Spark-X2.6-4B, del que no se proporcionan detalles de arquitectura interna, número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. La información disponible se centra en el proceso de cuantización. El formato EQ (LaneQuant) almacena un codebook de 4 bits, códigos de 5 y 6 bits, una escala con signo de 8 bits por cada 16 entradas y una escala fp16 por cada 256. La elección de 16 entradas por escala responde a que cada lane de los kernels matriciales de la GPU de Apple necesita una escala por paso.

La conversión se realizó con `espetero quantize` de Espetero 0.2.0 (commit 616c21a) más un parche de código fuente para Spark (commit d84aa84). La calibración se capturó con `espetero quantize --calib-only` a partir del forward en BF16, usando 120.832 tokens del dataset por defecto (calibration_v5 de mlx-lm). El proceso consumió 16 minutos en un M1 Max con BLAS monohilo y un pico de 3 GB de memoria. Las reglas de cuantización por capa están en el archivo `rules.txt` del repositorio.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Spark-X2.6-4B, aunque no se detallan en la información disponible.
- Razonamiento y código: la calibración incluye ventanas de código, lo que sugiere que el modelo base está orientado también a tareas de programación, pero no se confirman capacidades específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Servicio compatible con APIs OpenAI, Anthropic y Ollama a través de `espetero serve`.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el modelo se ejecuta con Espetero en cualquier Mac con 8 GB o más, lo que permite desplegar un modelo de ~4B nominales en equipos de gama consumer sin GPU dedicada.
- Prototipado de asistentes conversacionales en local: gracias al servidor integrado (`espetero serve`), se puede apuntar un cliente compatible con OpenAI, Anthropic u Ollama a `http://127.0.0.1:8080` para probar flujos de chat sin depender de la nube.
- Evaluación de técnicas de cuantización: el repositorio publica métricas de KLD, top-1 y comparaciones pareadas frente a Q4_K_M y MLX 4-bit, lo que lo convierte en un caso de estudio para investigar el impacto de la cuantización mixta por capas.
- Desarrollo de pipelines offline en portátiles: al ocupar 2,9 GB en disco y requerir solo 8 GB de RAM, encaja en entornos de desarrollo con recursos limitados donde no se quiere enviar datos a servicios externos.
- Pruebas de compatibilidad de clientes: útil para validar que una aplicación cliente (SDK de OpenAI, Anthropic u Ollama) funciona correctamente contra un backend local antes de desplegarlo en producción.
- Benchmarking de motores de inferencia en Metal: sirve para comparar el rendimiento de Espetero frente a otras soluciones en Apple Silicon, con datos de decodificación publicados (80 tok/s en M1 Max para este archivo).

## Benchmarks y rendimiento

| Archivo | Medido con | Bits/peso | KLD media | KLD mediana | KLD p99 | Top-1 | Decode M4 Max (tok/s) | Decode M1 Max (tok/s) |
|:--|:--|--:|--:|--:|--:|--:|--:|--:|
| Este archivo (c4) | Espetero 616c21a | 5,67 | 0,0173 | 0,00542 | 0,1771 | 94,9 % | no disponible | 80 |
| Q4_K_M (oficial) | dequantizado, fp32 | 6,19 | 0,0707 | 0,0204 | 0,7239 | 90,2 % | no disponible | no disponible |
| MLX 4-bit | Espetero 616c21a | 4,50 | 0,2376 | 0,0842 | 2,4942 | 82,5 % | no disponible | 99 |

Comparación pareada frente al Q4_K_M oficial (dequantizado): KLD -75,5 % (intervalo del 95 %: -77,8 % a -72,6 %; inferior en el 100 % de las 62 ventanas). La medición se realizó sobre 123.008 tokens (62 ventanas de 2048 tokens: 31 de WikiText-2 test y 31 de código), sin puntuar los primeros 64 tokens de cada ventana. La decodificación se midió con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`.

## Requisitos de hardware

- VRAM/memoria unificada: cualquier Mac con Apple Silicon y 8 GB de memoria o más.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Max/Ultra). Los datos publicados incluyen M1 Max (MacBook Pro, 64 GB) y M4 Max (Mac Studio, 128 GB).
- Cabe en GPU consumer: sí, en cualquier Mac con chip de la serie M y 8 GB de memoria unificada.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`). No es compatible con llama.cpp, MLX ni transformers.
- Latencia y throughput: 80 tok/s en decodificación en M1 Max para este archivo; 99 tok/s para MLX 4-bit en el mismo equipo. No hay dato de decodificación en M4 Max para este archivo.
- Espacio en disco: 2,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor compatible | Notas |
|:--|:--|:--|:--|:--|:--|:--|
| Spark-X2.6-4B-EQ-C4 (este) | 1,18B reales (4B nominales) | no disponible | EQ (safetensors) | Apache 2.0 | Solo Espetero | Mejor KLD que Q4_K_M con menos bits/peso |
| Spark-X2.6-4B Q4_K_M (oficial) | 4B nominales | no disponible | GGUF | Apache 2.0 | llama.cpp y derivados | KLD media 0,0707; 6,19 bits/peso |
| Spark-X2.6-4B MLX 4-bit | 4B nominales | no disponible | MLX | Apache 2.0 | MLX | KLD media 0,2376; 4,50 bits/peso; 99 tok/s en M1 Max |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera de la familia Spark.

## Limitaciones y advertencias

- El formato EQ es propietario de Espetero: no se puede cargar en llama.cpp, MLX ni transformers, lo que limita la portabilidad y crea dependencia de un único motor mantenido por un solo desarrollador.
- El recuento real de parámetros (1,18B) no coincide con el nombre comercial "4B"; conviene verificar el tamaño efectivo antes de asumir capacidades asociadas a un modelo de 4B.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con contextos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse que este no imponga restricciones adicionales.
- El proceso de calibración usó 120.832 tokens de un dataset por defecto; no se registró el comando exacto de captura, solo los metadatos del archivo.
- El rendimiento medido en M1 Max (80 tok/s) es inferior al de MLX 4-bit (99 tok/s) en el mismo equipo, aunque con mejor calidad de distribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Franjarjar/Spark-X2.6-4B-EQ-C4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Motor Espetero (GitHub): https://github.com/JarJarFran/espetero
- Documentación del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
