# geraldaton20/hd-laya

## Resumen

hd-laya es un modelo de decisión neuro-simbólico construido sobre el motor System-1 de código abierto laya (NandhaKishorM/laya). Lo desarrolla el usuario geraldaton20 y su objetivo es eliminar el techo de opciones de elección de laya (unas 20 alternativas) sustituyéndolo por un espacio de trabajo hiperdimensional (HDC/VSA) que gestiona el contexto y permite un número variable de opciones mediante slots entrenados. No es un modelo generativo de lenguaje en el sentido habitual: es un sistema de decisión con componentes entrenados (cabecera de decisión y proyección de contexto) sobre un encoder congelado.

La versión v1.0 del modelo incorpora componentes entrenados que no existían en la v0.1: slots de opción HDC, una proyección de hypertoken para el contexto HDC y un bucle de refinamiento RLCD en tiempo real. El repositorio de Hugging Face ocupa 0.0 GB y publica dos artefactos: un checkpoint de cabecera en PyTorch (`hd_laya_head.pt`, 1000 pasos de entrenamiento, K=[77,150]) y la misma cabecera promovida a ONNX (opset 17, verificada en ONNX Runtime CPU).

Su relevancia es acotada pero específica: propone un enfoque neuro-simbólico para decisión de sistema 1 con computación hiperdimensional, con métricas de sondeo publicadas (velocidad, matryoshka, semántica, capacidad y actualización de cabecera). No hay información sobre parámetros totales, longitud de contexto en tokens ni datos de entrenamiento en lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neuro-simbólica; encoder congelado (laya System-1) + cabecera de decisión entrenada y espacio de trabajo HDC/VSA |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en tokens; el contexto se gestiona mediante un espacio de trabajo hiperdimensional |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (derivada de laya; atribución a NandhaKishorM/laya) |
| Formato de pesos | PyTorch state_dict (`hd_laya_head.pt`) y ONNX (opset 17, `head.onnx`) |

## Arquitectura y entrenamiento

hd-laya se apoya en el motor laya, descrito por el autor como un motor System-1 puro y sin destilar. Sobre ese encoder congelado se añaden componentes entrenados: slots de opción en el espacio hiperdimensional, una proyección de hypertoken que mapea el contexto al espacio HDC y un bucle de refinamiento RLCD en tiempo real. El encoder es un grafo congelado y la cabecera es intercambiable mediante un mecanismo de promoción condicionada (promote-on-gate). La inferencia se realiza con ONNX Runtime (CPU/CUDA) y con PyTorch/transformers.

El entrenamiento de la cabecera publicada consta de 1000 pasos con un rango de opciones K=[77,150]. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Las innovaciones técnicas declaradas incluyen la eliminación del techo de ~20 opciones de laya, el uso de representaciones hiperdimensionales para gestionar contexto y la actualización de cabecera en tiempo real (RLCD) con latencias de 23–63 ms por actualización en una GPU T4.

## Capacidades

- Decisión de sistema 1: selección entre un conjunto variable de opciones (K=[77,150] en el checkpoint publicado), superando el límite de ~20 opciones de laya.
- Gestión de contexto mediante espacio de trabajo hiperdimensional (HDC/VSA) en lugar de atención sobre tokens.
- Representaciones semánticas compactas: SimHash de 512 bits aproxima el top-1 en coma flotante en casos de empate cercano, y a partir de 2048 bits el resultado es exacto según los sondeos del autor.
- Búsqueda matryoshka en dos etapas: equivalente a dimensión completa (desviación 0–0,056%) con hasta 2,8× de aceleración en el escaneo.
- Capacidad de pares exactos-o-rechazo de D/64 pares, según el sondeo de capacidad.
- Actualización de cabecera en tiempo real (RLCD) con 23–63 ms por actualización en T4.
- Intercambio de cabecera en caliente (promote-on-gate) con encoder congelado.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Selección entre muchas alternativas en pipelines de decisión: el modelo puede elegir entre 77 y 150 opciones en lugar de las ~20 de laya, adecuado para sistemas de enrutamiento o clasificación con catálogos amplios.
- Clasificación y enrutamiento de bajo coste en CPU: al ejecutarse con ONNX Runtime en CPU, encaja en servicios donde no hay GPU disponible y la latencia debe ser predecible.
- Sistemas de decisión en tiempo real con adaptación continua: el bucle RLCD permite actualizar la cabecera en 23–63 ms en T4, útil para entornos donde la distribución de opciones cambia con frecuencia.
- Recuperación semántica aproximada con representaciones compactas: los SimHash de 512 bits permiten búsquedas rápidas con precisión cercana al top-1 en coma flotante, útil en sistemas de recomendación o deduplicación.
- Búsqueda en dos etapas sobre grandes catálogos: la variante matryoshka ofrece hasta 2,8× de aceleración en el escaneo con desviación mínima respecto a dimensión completa.
- Despliegue embebido o edge con encoder congelado: al ser un grafo congelado con cabecera intercambiable, se puede distribuir un encoder fijo y actualizar solo la cabecera según el dominio.
- Investigación en computación hiperdimensional aplicada a decisión: los artefactos y sondeos publicados permiten reproducir y comparar variantes HDC/VSA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica resultados de sondeos internos:

| Sondeo | Resultado declarado |
|---|---|
| 1. Velocidad | Punto óptimo de escaneo entre 1024 y 2048 dimensiones |
| 2. Matryoshka | Dos etapas equivalente a dimensión completa (0–0,056% de desviación); hasta 2,8× de aceleración en escaneo |
| 3. Semántica | SimHash de 512 bits ≈ top-1 en coma flotante en empates cercanos; exacto a partir de 2048 bits |
| 4. Capacidad | D/64 pares exactos-o-rechazo |
| 5. Actualización de cabecera | RLCD en tiempo real: 23–63 ms por actualización en T4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la cabecera es un state_dict de 1000 pasos, por lo que el peso de los artefactos publicados es reducido.
- GPU recomendadas: no se especifican; el autor valida la actualización de cabecera en una NVIDIA T4.
- GPU de consumo: no hay información que confirme ni descarte su ejecución en GPU de consumo; la inferencia está validada en ONNX Runtime CPU.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA) y PyTorch/transformers.
- Latencia y throughput: 23–63 ms por actualización de cabecera en T4 (RLCD); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hd-laya | Decisión neuro-simbólica (HDC/VSA) sobre laya | no disponible | Contexto HDC (no en tokens) | Apache-2.0 | Hugging Face + GitHub |
| laya (NandhaKishorM/laya) | Motor System-1 puro | no disponible | no disponible | no disponible | GitHub |
| Modelos de decisión/clasificación transformer convencionales | Transformer discriminativo | Variable | Variable | Variable | Hugging Face |

La comparación con alternativas de la misma categoría no está disponible con datos verificables: no se han publicado parámetros, contexto ni rendimiento de laya en la información proporcionada, y los modelos de decisión transformer convencionales no comparten el enfoque HDC/VSA, por lo que una comparación numérica directa no sería rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo de lenguaje: no se documentan capacidades de generación de texto, código, matemáticas, visión ni audio.
- Solo soporta inglés según los metadatos del repositorio.
- El techo de opciones sigue existiendo, aunque elevado: el checkpoint publicado cubre K=[77,150], no un número arbitrario de opciones.
- Los resultados publicados son sondeos internos del autor, no benchmarks estándar revisados por terceros; deben interpretarse con cautela.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-17): no hay evidencia de uso en producción ni validación externa.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas más allá del inglés.
- La licencia Apache-2.0 permite uso comercial, pero exige atribución a NandhaKishorM/laya según indica el autor.
- La actualización de cabecera en tiempo real implica riesgo de deriva del comportamiento si el bucle RLCD se alimenta con señales ruidosas; no se documentan salvaguardas.
- No hay información sobre cuantizaciones ni sobre el tamaño real de los pesos del encoder congelado, lo que dificulta estimar requisitos de memoria en producción.

## Enlaces

- Hugging Face: https://huggingface.co/geraldaton20/hd-laya
- GitHub: https://github.com/sensesVoid/hd-laya
- Modelo base (laya, GitHub): https://github.com/NandhaKishorM/laya
- Modelo base en Hugging Face: https://huggingface.co/NandhaKishorM/laya
- Documentación SQAC (especificación de diseño y veredictos de sondeos, clave de proyecto `hd-laya`): no disponible como URL pública en la información proporcionada.
