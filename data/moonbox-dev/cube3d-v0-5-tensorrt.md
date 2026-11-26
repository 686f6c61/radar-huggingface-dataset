# moonbox-dev/cube3d-v0.5-TensorRT

## Resumen

Cube3D v0.5 TensorRT es una compilación a motores TensorRT del modelo Cube3D v0.5 de Roblox, un sistema de generación de formas 3D a partir de texto. La conversión la ha realizado moonbox-dev y sustituye los grafos ONNX fp16 originales por motores TensorRT optimizados para GPUs NVIDIA RTX de arquitectura Ampere en adelante (series 30, 40 y 50). El modelo base es un GPT autorregresivo que opera sobre un tokenizador de formas 1D y admite una caja delimitadora opcional como condicionamiento geométrico.

La relevancia de esta versión es puramente de despliegue: elimina la dependencia de PyTorch y de ONNX Runtime, de modo que la inferencia se ejecuta con TensorRT y Polygraphy sobre numpy. Según la model card, esto reduce el tiempo por forma de 150-168 s (ONNX fp16) a 57-64 s, manteniendo una fidelidad alta respecto al decodificador original (IoU de 0,997 / 0,991 / 0,996 sobre los tokens del modelo de referencia).

Se distribuye bajo la licencia Cube3D Research-Only RAIL-MS, por lo que su uso está restringido a investigación. El repositorio ocupa 5,4 GB e incluye los motores, un runner mínimo, el pipeline completo y el tokenizador CLIP-L. No se han publicado especificaciones de parámetros, contexto ni datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT autorregresivo sobre tokenizador de formas 1D, con codificador de texto CLIP-L y decodificador de forma; grafos compilados a TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto fija de 77 tokens para CLIP-L) |
| Tipos de cuantizacion | fp16 (motores TensorRT); el softmax de `gpt_step` se calcula fuera de los motores |
| Idiomas soportados | no disponible |
| Licencia | cube3d-research-only-rail-ms (solo investigación) |
| Formato de pesos | motores TensorRT (`.engine`) con runner numpy; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Cube3D v0.5 de Roblox es un generador text-to-shape que combina un codificador de texto CLIP-L (salida de 77×768 en fp32) con un GPT autorregresivo que genera tokens de forma en una representación 1D. La generación se realiza con decodificación voraz, guía (guidance) de 3.0, caché KV y resolución base 8.0, y admite una caja delimitadora opcional para condicionar las dimensiones del objeto. La salida se convierte en malla mediante marching cubes (scikit-image).

Esta versión TensorRT no reentrena el modelo: recompila los grafos ONNX fp16 del repositorio original en motores TensorRT construidos con compatibilidad de hardware (Ampere y posteriores) y de versión (TensorRT 10.x desde 10.13, mediante el runtime ligero). Esa compatibilidad amplia implica una ligera pérdida de velocidad frente a un motor compilado para una GPU concreta, pero evita recompilar. Los motores cubren `clip_text`, tres bloques `gpt_cond`, cuatro bloques `gpt_step`, `occupancy` y `shape_decoder`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de formas 3D (mallas de vértices y caras) a partir de una descripción textual en inglés.
- Condicionamiento geométrico opcional mediante caja delimitadora (`bbox`) de tres dimensiones.
- Generación autorregresiva de tokens de forma con caché KV y guía classifier-free (guidance 3.0).
- Conversión de la rejilla de ocupación a malla poligonal mediante marching cubes.
- Inferencia sin PyTorch ni ONNX Runtime: solo TensorRT, Polygraphy, numpy, tokenizers y scikit-image.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo especializado en text-to-3D.

## Casos de uso

- Prototipado rápido de assets 3D: generar una malla aproximada a partir de una descripción ("A tall pagoda") para iterar sobre el diseño antes de modelar en detalle, con tiempos de 57-64 s por forma en fp16.
- Poblar escenarios de videojuegos o entornos de realidad virtual con objetos simples condicionados por caja delimitadora, útil para bloques de escenario y props de baja fidelidad.
- Generación de variantes geométricas en investigación: estudiar cómo responde el modelo a cambios de prompt o de bbox manteniendo el resto de parámetros fijos.
- Previsualización en pipelines de diseño de producto: obtener una forma de referencia rápida antes de pasar a CAD, usando la bbox para respetar proporciones.
- Docencia y demostraciones de generación 3D: el runner mínimo en numpy facilita desplegar el modelo en aulas o talleres con GPUs RTX de consumo.
- Benchmarking de aceleración por hardware: comparar latencia y fidelidad de los motores TensorRT frente a la ruta ONNX original en distintas GPUs Ampere, Ada o Blackwell.
- Generación de datasets sintéticos de formas 3D para tareas de investigación en visión o robótica, siempre dentro del marco de uso exclusivamente investigador de la licencia.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan los motores TensorRT fp16 con la ruta ONNX fp16 del modelo original:

| Metrica | TensorRT fp16 | ONNX fp16 |
|---|---|---|
| Acuerdo con teacher forcing (3 valores) | 73,6 / 77,4 / 63,5 % | 73,5 / 77,1 / 64,1 % |
| IoU de forma con tokens propios | 0,77 / 0,13 / 0,36 | no disponible |
| IoU del decodificador sobre tokens del original | 0,997 / 0,991 / 0,996 | no disponible |
| Tiempo por forma | 57-64 s | 150-168 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el conjunto de motores suma aproximadamente 4,8 GB en disco, por lo que se recomienda al menos 6-8 GB de VRAM libre para cargar todos los motores fp16.
- GPUs compatibles: arquitectura Ampere o posterior, es decir, RTX 30, 40 y 50 series, además de A100, H100 y GPUs de centro de datos con TensorRT 10.13 o superior.
- Cabe en GPU de consumo: sí, en tarjetas RTX 30/40/50 con VRAM suficiente (orientativamente 8 GB o más).
- Despliegue: TensorRT 10.x (`tensorrt-cu12` o `tensorrt-lean-cu12`), Polygraphy, numpy, tokenizers y scikit-image. No requiere vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 57-64 s por forma en fp16 según la model card; el throughput exacto por GPU no se detalla.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Cube3D v0.5 TensorRT (este) | text-to-3D, GPT autorregresivo | no disponible | no disponible | Research-Only RAIL-MS | motores TensorRT |
| Cube3D v0.5 (Roblox) | text-to-3D, GPT autorregresivo | no disponible | no disponible | Research-Only RAIL-MS | ONNX / PyTorch |
| Shap-E (OpenAI) | text-to-3D | no disponible | no disponible | MIT | safetensors / PyTorch |
| Point-E (OpenAI) | text-to-3D (nubes de puntos) | no disponible | no disponible | MIT | PyTorch |

La comparación con Shap-E y Point-E es orientativa por categoría de tarea; no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente de investigación (Cube3D Research-Only RAIL-MS): no permite uso comercial sin autorización expresa.
- El modelo genera formas 3D, no texto: no debe evaluarse como un LLM ni usarse para tareas de lenguaje.
- El IoU de forma con tokens propios es bajo en dos de las tres métricas (0,13 y 0,36), lo que indica variabilidad en la calidad geométrica según el caso.
- El texto de entrada se procesa con CLIP-L y ventana fija de 77 tokens; prompts largos o en idiomas distintos del inglés pueden degradar el resultado.
- La decodificación es voraz y determinista, sin muestreo: menor diversidad entre generaciones.
- Los motores están compilados con compatibilidad amplia, lo que implica cierta penalización de velocidad frente a compilaciones específicas por GPU.
- Requiere TensorRT 10.13 o superior y GPUs Ampere o posteriores; no funciona en GPUs más antiguas ni en CPU.
- No se han publicado datos sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación geométrica (formas incoherentes o no cerradas).
- La información de parámetros, contexto y composición del entrenamiento no está disponible, lo que dificulta auditar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/cube3d-v0.5-TensorRT
- Modelo base Cube3D v0.5 (Roblox): https://huggingface.co/Roblox/cube3d-v0.5
- Paper referenciado (arXiv:2503.15475): https://arxiv.org/abs/2503.15475
- Licencia del modelo: https://huggingface.co/moonbox-dev/cube3d-v0.5-TensorRT/blob/main/fp16/LICENSE.txt
- Pipeline de inferencia: https://huggingface.co/moonbox-dev/cube3d-v0.5-TensorRT/blob/main/fp16/pipeline_trt.py
- Runner numpy para TensorRT: https://huggingface.co/moonbox-dev/cube3d-v0.5-TensorRT/blob/main/fp16/trt_runner.py
