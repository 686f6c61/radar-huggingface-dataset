# Ozomozyan/hkimi

## Resumen

`hkimi` (Hybrid Kimi) es un motor de inferencia escrito en C++17 y CUDA que permite ejecutar el modelo Kimi K3.1 Pro de Moonshot AI —2,8 billones de parámetros y 1,56 TB de pesos— sobre una única GPU de consumo de 24 GB. No se trata de un modelo nuevo ni de una versión cuantizada: es una herramienta de ejecución que transmite los pesos originales desde una unidad NVMe capa por capa, sin cuantización, poda ni reentrenamiento. El texto generado es, token a token, idéntico al que produce el modelo completo con decodificación voraz.

El proyecto es independiente y no está afiliado ni respaldado por Moonshot AI. El repositorio de Hugging Face no contiene pesos del modelo, solo el código fuente del motor; tanto el modelo como el drafter se descargan desde sus propios repositorios. La relevancia actual reside en que demuestra que es posible ejecutar un modelo de escala frontera en hardware asequible, aunque a costa de una velocidad muy reducida: aproximadamente 6 segundos por token (0,17 tok/s).

El motor emplea decodificación especulativa con un drafter de 2,5 B parámetros, gestión de memoria por capas con lectura anticipada desde disco y kernels de multiplicación matricial con orden fijo de sumas para garantizar que el resultado sea bit a bit idéntico al del modelo completo, independientemente del lote.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 93 capas, 92 de ellas con 896 expertos de 17,5 MB cada uno; 16 expertos activos por token |
| Parámetros totales | 2,8 billones (modelo Kimi K3.1 Pro) |
| Parámetros activos | 16 expertos por capa (el trunk incluye atención, routers y cabeza de salida: 111 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ninguna; pesos sin cuantizar (el motor no cuantiza, poda ni reentrena) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | MIT (el motor); los pesos del modelo se rigen por la licencia de Moonshot AI |
| Formato de pesos | Checkpoint convertido a un "store" propio con registros alineados por experto; el drafter se descarga por separado (5 GB) |

## Arquitectura y entrenamiento

El motor `hkimi` ejecuta el modelo Kimi K3.1 Pro, un transformer de mezcla de expertos con 93 capas. De ellas, 92 contienen 896 expertos de 17,5 MB cada uno, y cada token activa únicamente 16 expertos por capa. La parte que todo token necesita —atención, routers y cabeza de salida, denominada "trunk"— ocupa 111 GB, mientras que los 82.432 expertos suman los 1.446 GB restantes. El modelo permanece en disco: el comando `hkimi convert` reescribe el checkpoint una vez en un "store" donde cada experto es un registro alineado, y durante la inferencia el motor realiza un "sweep" que trae el trunk de cada capa a la GPU, ejecuta la atención, deja que el router seleccione los expertos y lee solo esos desde el NVMe.

La innovación técnica principal es la combinación de decodificación especulativa con lectura desde SSD. Un drafter (DSpark, 2,5 B parámetros, en la GPU) lee los estados ocultos del modelo completo y adivina hasta 7 tokens por adelantado; el modelo completo barre su último token junto con las conjeturas, conserva las conjeturas hasta la primera que no habría escrito y añade su propio token. Un sweep produce 3,4 tokens de media. Para garantizar que el texto sea idéntico al del modelo completo, cada producto matricial en `hkimi` es un kernel propio con un orden fijo de sumas, ya que rutinas como `gemm` de cuBLAS redondean de forma distinta según el lote y un solo bit invertido puede enviar un token a un experto diferente. Además, el trunk de las capas siguientes se lee por adelantado con un segundo hilo, 43 GB de trunk permanecen en RAM entre sweeps y el trunk de cada capa se copia a la GPU mientras la capa anterior aún lee sus expertos.

## Capacidades

- Generación de texto con la misma calidad que el modelo completo Kimi K3.1 Pro, ya que los pesos no se modifican y la decodificación es voraz.
- Razonamiento y resolución de problemas complejos, heredados del modelo original de 2,8 billones de parámetros.
- Generación de código: el motor incluye pruebas con preguntas de "escribir una función de Python" y "corregir un bug".
- Resumen y síntesis de texto: se han medido tareas de resumen de párrafos.
- Decodificación especulativa integrada mediante el drafter DSpark, que acelera la generación sin alterar los tokens de salida.
- Ejecución en hardware de consumo: una sola GPU NVIDIA de 24 GB, 64 GB de RAM y un NVMe de 2 TB.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" en la información proporcionada.

## Casos de uso

- Investigación y experimentación con modelos de escala frontera en hardware propio: permite estudiar el comportamiento de Kimi K3.1 Pro sin acceso a clústeres de múltiples GPUs, a cambio de asumir 6 segundos por token.
- Verificación de resultados de modelos cuantizados: al producir exactamente los mismos tokens que el modelo completo, sirve como referencia para validar si una cuantización introduce desviaciones.
- Generación de código en entornos con requisitos de fidelidad estricta: para tareas donde la calidad del modelo completo es indispensable y el tiempo no es crítico, como la generación de funciones Python o la corrección de bugs.
- Resumen de documentos largos en lotes nocturnos: con 31 minutos por respuesta de 300 palabras, es adecuado para procesar lotes durante la noche en una sola máquina.
- Docencia y demostraciones técnicas: ilustra cómo funciona la decodificación especulativa, el offload a SSD y la gestión de memoria en modelos MoE de gran escala.
- Desarrollo y prueba de motores de inferencia: el código C++17/CUDA y sus documentos de arquitectura sirven como base para quienes construyen motores de inferencia personalizados.
- Evaluación comparativa de hardware: el comando `hkimi bench-io` permite medir el rendimiento de unidades NVMe y su impacto en la velocidad de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de velocidad, medidos el 22 de noviembre de 2026 en una máquina alquilada con una RTX 4090, 48 núcleos, NVMe a 7,4 GB/s, Linux, con el motor limitado a la memoria de un PC de 64 GB, decodificación voraz y los primeros 48 tokens de cada respuesta:

| Tipo de pregunta | Segundos por token | Respuesta de 300 palabras | Primer token tras |
|---|---|---|---|
| Corregir un bug | 4,7 | 31 min | 100 s |
| Resumir un párrafo | 4,7 | 31 min | 140 s |
| Escribir una función de Python | 4,9 | 33 min | 74 s |

Datos adicionales de rendimiento: un sweep sobre un token lee 137 GB; un sweep sobre seis tokens tarda aproximadamente 1,8 veces más, no seis veces, porque el trunk se lee una vez y los tokens comparten expertos. Un sweep produce 3,4 tokens de media. Las optimizaciones de lectura anticipada redujeron el tiempo por token de 10,9 s a 6,0 s.

## Requisitos de hardware

- VRAM estimada: 11,4 GB en uso pico, 12,4 GB con un prompt de 2.605 tokens. Una tarjeta de 16 GB podría ser suficiente, aunque no se ha probado.
- GPU recomendadas: RTX 4090 (única probada con el modelo completo). El código también compila para tarjetas RTX 50 con CUDA 12.8 o superior, sin haberse ejecutado en ellas.
- RAM: 64 GB (el motor retiene 55 GB: 43 GB de trunk en memoria y 12 GB propios). Con `--trunk-ram 0` retiene 11 GB, por lo que 32 GB deberían funcionar a unos 7 s por token, según una estimación derivada de limitar el motor, no de una máquina real de 32 GB.
- Disco: 2 TB NVMe a 3,5 GB/s o más; medido a 7,4 GB/s (PCIe 4.0). Se necesitan 1,56 TB para el store, unos 150 GB más durante la conversión y 5 GB para el drafter.
- CPU: no es el límite con 48 núcleos; no se ha medido con pocos núcleos.
- SO: Linux (probado en un contenedor). La compilación para Windows (MinGW-w64) pasa las pruebas bajo Wine, pero nunca se ha ejecutado en una máquina Windows real, ni se ha compilado con Visual Studio, ni se ha ejecutado con GPU en Windows. macOS solo dispone de ruta de lectura de archivos y ningún backend de GPU, por lo que solo sirve para los modelos de prueba pequeños.
- Opciones de despliegue: el motor propio `hkimi` (comandos `convert`, `bench-io`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,0 s por token (0,17 tok/s) con decodificación especulativa; 4,7-4,9 s por token en las pruebas por tipo de pregunta; primer token tras 74-140 s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros motores de inferencia ni de modelos comparables en la misma categoría (ejecución de modelos de escala frontera con offload a disco).

## Limitaciones y advertencias

- Velocidad muy reducida: 6 segundos por token (0,17 tok/s), lo que hace inviable el uso conversacional interactivo.
- El proyecto es no oficial e independiente; no está afiliado ni respaldado por Moonshot AI ni por Inferact.
- El repositorio no contiene pesos del modelo; es necesario descargar Kimi K3.1 Pro y el drafter DSpark desde sus repositorios, con los requisitos de almacenamiento y licencia correspondientes.
- Licencia del motor: MIT. La licencia de los pesos del modelo no se especifica en la información disponible y debe consultarse en el repositorio de Moonshot AI antes de cualquier uso comercial.
- Idioma: la model card declara únicamente inglés; no hay información sobre otros idiomas.
- La compilación para Windows no se ha probado en hardware real ni con GPU; puede requerir correcciones menores.
- Solo se ha probado con la RTX 4090; el soporte para RTX 50 está compilado pero no ejecutado.
- El rendimiento depende críticamente de la velocidad del disco NVMe; un disco más lento reduce la velocidad de forma proporcional.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto del modelo original en la documentación proporcionada.
- El uso de memoria con 32 GB de RAM es una estimación derivada de limitar el motor, no una medición en una máquina de 32 GB.

## Enlaces

- Repositorio del motor en Hugging Face: https://huggingface.co/Ozomozyan/hkimi
- Modelo Kimi K3.1 Pro: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Drafter DSpark: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Documentación de arquitectura: docs/architecture.md (en el repositorio)
- Documentación del drafter: docs/drafter.md (en el repositorio)
- Documentación de exactitud numérica: docs/exact.md (en el repositorio)
- Script de pruebas de velocidad: scripts/overnight_texts.sh (en el repositorio)
- Herramienta de ejecución del drafter: tools/drafter_run.py (en el repositorio)
- Script de compilación para Windows: scripts/build.ps1 (en el repositorio)
- Referencia arXiv: arxiv:2609.18110 (citada en las etiquetas del repositorio)
