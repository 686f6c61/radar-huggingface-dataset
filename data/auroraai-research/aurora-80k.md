# AuroraAI-Research/Aurora-80K

## Resumen

Aurora-80K es un modelo de lenguaje de tamaño minúsculo, con exactamente 80.000 parámetros, desarrollado por AuroraAI-Research como parte de una nueva línea de modelos que sustituye a los anteriores de ese perfil. Está diseñado para experimentación y aprendizaje sobre entrenamiento de modelos desde cero, no para tareas de producción. Su principal innovación es una representación de vocabulario factorizada que permite un tamaño de vocabulario de 4096 tokens con un coste paramétrico reducido.

El modelo se entrenó sobre aproximadamente 40 millones de tokens del dataset fineweb-edu, filtrado a una puntuación educativa de 4 o superior, durante 2 épocas (80 millones de tokens efectivos). El entrenamiento se realizó en un teléfono Xiaomi 14T Pro, usando solo 4 núcleos Cortex-X4, en unas 6 horas incluyendo preprocesamiento y entrenamiento del tokenizador. Es un ejemplo extremo de entrenamiento de bajo coste, pero sus capacidades son muy limitadas debido a su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, no confirmado) |
| Parametros totales | 80.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna, pero por el tamaño y el enfoque se trata de un modelo transformer denso muy pequeño. La caracteristica destacable es la representacion de vocabulario factorizada, que permite un vocabulario de 4096 tokens sin que la capa de embedding domine el presupuesto de parametros. Esta tecnica es habitual en modelos tiny para reducir el coste de la capa de entrada/salida.

El entrenamiento se realizo sobre 40 millones de tokens de fineweb-edu (filtrado a calidad educativa >= 4), con 2 epocas, lo que da 80 millones de tokens efectivos. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion posterior. El hardware de entrenamiento fue un movil Xiaomi 14T Pro con 4 nucleos Cortex-X4, lo que demuestra la viabilidad de entrenar modelos muy pequenos en dispositivos de consumo, aunque con un coste temporal de 6 horas.

## Capacidades

- Generacion de texto basica: puede producir texto coherente a corta distancia, pero con limitaciones severas por su tamaño.
- Razonamiento y conocimiento: muy limitado, como reflejan los benchmarks (Arc-Easy 26%, cerca del azar).
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multimodales (ni vision ni audio).
- Multilingue: no, solo ingles.
- No dispone de modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Educacion e investigacion: sirve para ensenar los fundamentos del entrenamiento de modelos de lenguaje, desde la preparacion del dataset hasta la evaluacion, con un coste computacional minimo.
- Experimentacion con tecnicas de eficiencia: permite probar metodos de factorizacion de vocabulario, regularizacion o ajuste de hiperparametros en un entorno rapido y barato.
- Pruebas de pipelines de entrenamiento: util para validar flujos de datos, tokenizacion y evaluacion antes de escalar a modelos mayores.
- Generacion de texto de juguete: puede producir frases cortas o completar textos muy simples, pero no es adecuado para ningun uso real.
- Benchmarking de hardware: al ser tan pequeno, puede usarse para medir el rendimiento de CPUs o GPUs en tareas de inferencia sin requerir mucha memoria.
- Demostraciones de bajo coste: sirve para ilustrar que es posible entrenar un LM con recursos minimos, aunque los resultados sean pobres.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Wikitext-2 BPB | 3.2902 |
| BLiMP | 52.31% |
| Arc-Easy | 26.05% |

Estos resultados son muy bajos en comparacion con modelos estandar. Arc-Easy (26.05%) esta cerca del azar (25% en opcion multiple de 4), lo que indica que el modelo no ha aprendido conocimiento factual relevante. BLiMP (52.31%) esta ligeramente por encima del azar (50% en tareas de gramaticalidad), lo que sugiere una capacidad linguistica minima. El BPB de Wikitext-2 (3.29) es alto, reflejando una pobre compresion del texto.

## Requisitos de hardware

- VRAM: inferior a 1 GB, cabe en cualquier GPU moderna o incluso en CPU.
- GPU recomendada: ninguna en particular; puede ejecutarse en CPU, Raspberry Pi o cualquier dispositivo con mas de 100 MB de RAM.
- Cabe en cualquier consumer GPU (RTX 3060, 4090, etc.) y tambien en dispositivos moviles.
- Opciones de despliegue: llama.cpp, Ollama, o cualquier framework que soporte modelos transformer pequenos. Tambien puede ejecutarse en navegador con WebGPU.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño la inferencia es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con exactamente 80.000 parametros. Los modelos tiny mas conocidos (como TinyStories de 1M o 3M parametros) son significativamente mayores. Por tanto, no hay una comparativa directa disponible.

## Limitaciones y advertencias

- Capacidad muy limitada: con 80.000 parametros, el modelo no puede almacenar conocimiento factual ni razonar de forma fiable.
- Alto riesgo de alucinacion: generara texto fluido pero sin base factual, especialmente en tareas abiertas.
- Sesgos: al entrenarse solo con fineweb-edu (filtrado educativo), puede tener un sesgo hacia contenido academico y carecer de diversidad linguistica.
- Contexto limitado: no se ha especificado la longitud de contexto, pero por el tamaño del modelo es probablemente muy corta (menos de 512 tokens).
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero el modelo no es util para productos reales.
- Produccion: no recomendado para ningun escenario de produccion, ni siquiera como componente auxiliar.

## Enlaces

- HuggingFace: https://huggingface.co/AuroraAI-Research/Aurora-80K
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
