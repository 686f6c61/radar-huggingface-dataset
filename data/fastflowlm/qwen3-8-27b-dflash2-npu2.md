# FastFlowLM/Qwen3.8-27B-DFlash2-NPU2

## Resumen

FastFlowLM/Qwen3.8-27B-DFlash2-NPU2 es un paquete de pesos borrador (draft) para decodificación especulativa DFlash 2, derivado de z-lab/Qwen3.8-27B-DFlash2 (a su vez espejo de incoai/Qwen3.8-27B-DFlash2) y convertido por FastFlowLM para ejecutarse en la NPU de los procesadores AMD Ryzen AI. No es un modelo autónomo: es la segunda mitad de la etiqueta `qwen3.8-dflash2:27b` del runtime `flm`, cuyo modelo principal son los pesos ya existentes de `qwen3.8-mtp:27b` (Qwen3.8-27B-NPU2, sin cambios). El paquete aporta únicamente el cabezal de borrador que propone tokens candidatos que el modelo principal verifica en un solo paso.

El borrador consta de 5 capas de estilo Qwen3 con dimensión oculta 5120, FFN de 17408, 32 cabezas de consulta y 8 de clave-valor de 128 dimensiones, ventana deslizante de 2048 y un bloque de 8 tokens, con convoluciones dinámicas de dos tomas y un selector de candidatos (top 16, rango 256); suma 2 B de parámetros y comparte la tabla de embeddings y el cabezal de salida del modelo objetivo. Los pesos se distribuyen en un único fichero `dflash_weight.q4nx` de 1,39 GB, con matrices en Q4_K y normas, tensores de convolución dinámica, proyección del selector y dos libros de códigos de 248320 x 256 en BF16.

Su relevancia es práctica: permite acelerar la decodificación de Qwen3.8-27B sobre NPU de AMD Ryzen AI sin cambiar de motor, con una mejora medida de 1,16x de media en tokens por segundo (rango de 0,87x a 1,47x según la previsibilidad del texto) y una calidad de borrador que se mantiene tras la cuantización a Q4_K. Requiere FastFlowLM 1.0.12 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa: 5 capas estilo Qwen3 con convoluciones dinámicas de dos tomas y selector de candidatos |
| Parámetros totales | 2 B (solo el borrador; el modelo principal es Qwen3.8-27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 en el borrador; contexto del modelo principal no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K en matrices (fc, q/k/v/o y MLP); BF16 en normas, convoluciones dinámicas, proyección del selector y libros de códigos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (la licencia del modelo principal se aplica a los pesos principales) |
| Formato de pesos | `dflash_weight.q4nx` (formato propietario de FastFlowLM); el upstream z-lab está en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa, no un modelo generativo completo. Consta de 5 capas transformer de estilo Qwen3 con dimensión oculta 5120, FFN de 17408, 32 cabezas de consulta y 8 de clave-valor de 128 dimensiones, ventana deslizante de 2048 y bloque de 8 tokens. Incorpora convoluciones dinámicas de dos tomas y un selector de candidatos con top 16 y rango 256, respaldado por dos libros de códigos de 248320 x 256. Comparte la tabla de embeddings y el cabezal de salida del modelo objetivo, de modo que su coste paramétrico se limita a 2 B.

El borrador consume características de las capas 5, 19, 33, 47 y 61 del modelo objetivo (salidas de capa indexadas desde cero), fusionadas mediante su capa `fc`. En cada paso propone 7 tokens en una sola pasada y elige una ruta coherente entre sus 16 candidatos principales por posición; el modelo principal verifica los 7 en una pasada y conserva el prefijo más largo con el que coincide, más un token propio. El borrador se ejecuta sobre los mismos kernels de NPU que el modelo principal (sin bitstream adicional): sus matrices usan el motor fusionado de desquantización Q4_K más matmul, su proyección de salida el cabezal de lenguaje de 8 filas, y su atención, convoluciones y selector se ejecutan en CPU. No se dispone de datos sobre el volumen o la composición del dataset de entrenamiento del borrador ni sobre si hubo RLHF o DPO.

## Capacidades

- Aceleración de la decodificación del modelo principal Qwen3.8-27B mediante decodificación especulativa DFlash 2 sobre NPU de AMD Ryzen AI.
- Propuesta de 7 tokens por paso con selección de una ruta coherente entre los 16 candidatos principales por posición.
- Verificación en una sola pasada de los 8 posiciones (7 propuestas más el token del modelo principal) por parte del modelo objetivo.
- Ejecución integrada en el runtime `flm` de FastFlowLM, compartiendo kernels con el modelo principal.
- Conmutación al cabezal MTP propio del modelo mediante la variable de entorno `FLM_DFLASH=0`.
- No aporta capacidades generativas propias: no genera texto, código, matemáticas ni visión de forma autónoma; hereda las del modelo principal Qwen3.8-27B.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos especiales en la información proporcionada.

## Casos de uso

- Aceleración de inferencia local en equipos con NPU AMD Ryzen AI: el paquete se integra en `flm serve` y reduce el tiempo por token en decodificación sobre el modelo principal, útil en estaciones de trabajo con Ryzen AI MAX+.
- Generación de código asistida en local: los textos de código y las respuestas estructuradas son los que más se benefician de la decodificación especulativa, con hasta 1,47x de mejora en tokens por segundo según la previsibilidad del texto.
- Respuestas estructuradas y formatos predecibles (JSON, plantillas, extracción de campos): al ser texto altamente predecible, la tasa de aceptación del borrador es mayor y el coste por token disminuye.
- Despliegue de asistentes conversacionales en el borde con NPU: al ejecutarse sobre los mismos kernels que el modelo principal y no requerir bitstream adicional, simplifica el empaquetado de un asistente local con Qwen3.8-27B.
- Evaluación y benchmarking de decodificación especulativa: permite comparar `qwen3.8-mtp:27b` frente a `qwen3.8-dflash2:27b` en el mismo hardware y con las mismas condiciones de potencia.
- Investigación sobre cuantización de borradores: el paquete documenta que la cuantización Q4_K del borrador no añade coste medible frente a BF16 en precisión de aceptación, lo que sirve como referencia para estudios de compresión de cabezales especulativos.
- Pipelines de CI/CD para validación de motores de inferencia: la diferencia de salida en empates cercanos (4 de 5 respuestas cortas idénticas, 5 de 10 largas) es un caso de prueba útil para verificar la estabilidad del muestreo codicioso entre motores.

## Benchmarks y rendimiento

Calidad del borrador medida por repetición forzada con profesor sobre una ejecución real del modelo (NPU, codicioso, 300 tokens, thinking desactivado). Se pide al borrador 7 tokens por paso y se comparan con lo que el modelo principal emitió realmente; se muestra la media de tokens aceptados por paso (el modelo añade después uno):

| Borrador | Prompt de código (52 pasos) | Prompt de prosa (66 pasos) |
|---|---:|---:|
| Pesos BF16, matemática fp32 (código de referencia de z-lab) | 5,02 | 3,36 |
| Pesos Q4_K de este paquete, matemática fp32 | 4,87 | 3,49 |
| Este paquete en la NPU (activaciones bf16) | 4,60 | 3,41 |

Longitudes de aceptación publicadas de DFlash 2 (que cuentan el token añadido): 4,1 en MT-Bench y 4,4 a 5,5 en código y matemáticas; este motor mantiene aproximadamente 3,1 en prosa abierta y aproximadamente 6,6 en un prompt corto de código.

Rendimiento de FastFlowLM medido en equipo Ryzen AI MAX+, Linux, modo de energía por defecto, `flm serve`, 160 tokens generados, codicioso, diez prompts cortos, tokens por segundo en decodificación:

| | `qwen3.8-mtp:27b` | `qwen3.8-dflash2:27b` |
|---|---:|---:|
| Media | 3,23 | 3,74 (1,16x) |
| Por prompt | | 0,87x a 1,47x |

Un paso tarda aproximadamente 1,2 s con cualquiera de los dos borradores (0,9 s para verificar las 8 posiciones y unos 0,27 s para el borrado). La NPU verifica las 8 posiciones en una pasada, lo que redondea de forma distinta a la decodificación token a token, por lo que la salida codiciosa puede diferir de `qwen3.8-mtp:27b` en empates cercanos (4 de 5 respuestas cortas codiciosas idénticas, 5 de 10 largas).

## Requisitos de hardware

- NPU de AMD Ryzen AI, con FastFlowLM 1.0.12 o superior; el paquete está convertido específicamente para esta NPU.
- Espacio en disco: 1,39 GB para el borrador, más los pesos del modelo principal `qwen3.8-mtp:27b` (tamaño no disponible en la información proporcionada).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el paquete está orientado a NPU de Ryzen AI y no se documenta soporte para CUDA.
- VRAM estimada para inferencia: no disponible; depende del modelo principal y de su cuantización.
- Despliegue: runtime `flm` de FastFlowLM (`flm pull qwen3.8-dflash2:27b`, `flm run qwen3.8-dflash2:27b`, `flm serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 1,2 s por paso; 3,74 tokens/s de media en decodificación con DFlash 2 frente a 3,23 tokens/s con el cabezal MTP, en Ryzen AI MAX+ con modo de energía por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFlowLM/Qwen3.8-27B-DFlash2-NPU2 (este) | 2 B (borrador) | ventana deslizante 2048 en el borrador | Decodificación especulativa DFlash 2 sobre NPU AMD | Apache-2.0 | HuggingFace, runtime `flm` |
| `qwen3.8-mtp:27b` (Qwen3.8-27B-NPU2) | no disponible | no disponible | Cabezal MTP propio del modelo sobre NPU AMD | no disponible | Runtime `flm` |
| z-lab/Qwen3.8-27B-DFlash2 | 2 B (borrador) | no disponible | Borrador DFlash 2 de referencia en BF16 safetensors | no disponible | HuggingFace |
| DFlash original (z-lab/dflash) | no disponible | no disponible | Decodificación especulativa DFlash (ICML 2026) | no disponible | Repositorio GitHub |

## Limitaciones y advertencias

- No es un modelo autónomo: sin los pesos principales de `qwen3.8-mtp:27b` no hace nada; requiere FastFlowLM 1.0.12 o superior.
- Dependencia de hardware: está convertido para la NPU de AMD Ryzen AI; no se documenta funcionamiento en GPU NVIDIA, CPU genérica ni otras NPU.
- La aceleración no es uniforme: el rango medido va de 0,87x a 1,47x según la previsibilidad del texto, por lo que en textos poco predecibles puede no haber mejora o incluso degradación.
- Diferencias de salida en modo codicioso: la verificación en una pasada redondea de forma distinta a la decodificación token a token, con divergencias en empates cercanos (5 de 10 respuestas largas idénticas al cabezal MTP).
- La cuantización Q4_K del borrador no añade coste medible frente a BF16 en las pruebas realizadas, pero las activaciones bf16 de la NPU cuestan unos pocos puntos porcentuales en código.
- Los tokens borrador se comparan con el token más probable del modelo y omiten el muestreador, igual que con el cabezal MTP; esto puede afectar a estrategias de muestreo no codiciosas.
- Licencia Apache-2.0 para el borrador, pero la licencia del modelo principal se aplica a los pesos principales; conviene revisarla antes de uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas específicas del borrador; estas dependen del modelo principal Qwen3.8-27B.
- Contexto del borrador limitado a una ventana deslizante de 2048; el contexto efectivo de generación lo determina el modelo principal.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/FastFlowLM/Qwen3.8-27B-DFlash2-NPU2
- Modelo upstream (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Espejo original (Inco AI): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo base principal (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Blog de DFlash 2 (Inco AI): https://inco.ai/blog/dflash2/
- Repositorio DFlash original: https://github.com/z-lab/dflash
