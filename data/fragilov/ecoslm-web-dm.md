# fragilov/ecoslm-web-dm

## Resumen

EcoSLM-WebDM es un modelo de decisión especializado en la navegación e interacción web autónoma, desarrollado por el usuario fragilov y publicado bajo licencia Apache 2.0. Se trata de un transformer de puntero entre elementos (Cross-Element Pointer Transformer) de aproximadamente 10,5 millones de parámetros, destilado a partir de las distribuciones de probabilidad suaves del modelo profesor TypeSafe Jev (`jev-latest`). Su función es decidir, en una sola pasada hacia delante, qué operación ejecutar sobre una página web (clic, escritura, selección, scroll, espera, finalización o bloqueo) y sobre qué elemento del DOM aplicarla.

El modelo aborda un problema concreto en el ámbito de los agentes web locales: la latencia y el coste de invocar modelos grandes para cada paso de decisión. Al destilar ese comportamiento en una red de 10,5 millones de parámetros con dos cabezas especulativas (operación y puntero de destino), consigue una latencia mediana de 18,57 ms en CPU frente a los 276,01 ms de media del profesor vía API, manteniendo una concordancia Top-1 del 80,00 % en operación y del 83,08 % en destino.

Su relevancia actual radica en la combinación de tamaño reducido, ejecución en CPU y calibración de confianza mediante temperature scaling, lo que permite integrarlo como primer nivel en una arquitectura de fallback condicionada por confianza: el modelo resuelve los casos claros y delega en un modelo mayor los casos ambiguos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-Element Pointer Transformer (encoder de contexto + encoder de elementos + decoder de cross-attention) |
| Parámetros totales | 10.830.085 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hasta 250 controles DOM por página) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch y ONNX |

## Arquitectura y entrenamiento

El modelo se compone de un encoder de contexto de 4 capas (`d_model=256`, `nhead=4`) que codifica el objetivo, el título y la URL de la página, el historial y el texto visible. Sobre ese contexto opera un encoder de elementos de 2 capas y un decoder de cross-attention de 2 capas que procesa hasta 250 controles interactivos del DOM. La salida se produce en una única pasada hacia delante mediante dos cabezas especulativas: una cabeza de operación que clasifica entre `CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_UP`, `SCROLL_DOWN`, `WAIT`, `DONE` y `BLOCKED`, y una cabeza de puntero de destino que puntúa simultáneamente todos los objetivos interactivos compatibles.

El entrenamiento es por destilación de conocimiento a partir de las distribuciones de probabilidad suaves del profesor TypeSafe Jev (`jev-latest`), con un conjunto de 80 muestras de entrenamiento y 35 de validación. Tras el entrenamiento se aplica temperature scaling sobre ambas cabezas (`op_temp_scaler` y `target_temp_scaler`) para calibrar la confianza, lo que habilita un mecanismo de fallback condicionado por umbral de confianza hacia el modelo profesor.

## Capacidades

- Predicción de operación web entre ocho clases discretas en una sola pasada.
- Puntero de destino sobre hasta 250 controles interactivos del DOM, con puntuación simultánea de todos los candidatos compatibles.
- Concordancia Top-3 del 100,00 % en selección de destino respecto al profesor, lo que permite estrategias de reordenación o verificación.
- Confianza calibrada (ECE de operación de 0,0964) apta para enrutamiento condicionado por umbral.
- Ejecución en CPU con latencia mediana de 18,57 ms por paso de decisión.
- Exportación a ONNX además de PyTorch.
- No dispone de generación de texto libre, razonamiento general, código, matemáticas, visión, audio ni tool calling en el sentido convencional.

## Casos de uso

- Agente de navegación web local: el modelo actúa como política de decisión paso a paso sobre el DOM, seleccionando operación y elemento en 18,57 ms por paso en CPU, lo que permite bucles de interacción fluidos sin GPU.
- Primer nivel de una arquitectura de fallback: con la confianza calibrada, los pasos por encima del umbral se resuelven localmente y solo los ambiguos se envían al profesor Jev vía API, reduciendo coste y latencia agregada.
- Automatización de pruebas end-to-end: dado un objetivo en lenguaje natural y el estado de la página, el modelo propone la siguiente acción sobre el DOM, útil para generar o reparar flujos de test en pipelines de CI/CD.
- Extracción de datos de formularios y listados: la cabeza de puntero identifica el control relevante entre los candidatos visibles, lo que permite rellenar o leer campos de forma dirigida por objetivo.
- Asistente de accesibilidad y navegación guiada: el modelo puede sugerir la siguiente interacción sobre la página a partir de un objetivo expresado por el usuario y del texto visible.
- Despliegue en entornos con recursos limitados: al ocupar un repositorio de 0,2 GB y ejecutarse en CPU, es viable en dispositivos de borde, contenedores ligeros o navegadores con runtime ONNX.
- Enrutamiento de sesiones de scraping interactivo: la operación `BLOCKED` y la calibración permiten detectar estados no resolubles y derivar la sesión a un agente mayor o a intervención humana.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Parámetros | 10.830.085 |
| Muestras de entrenamiento / validación | 80 / 35 |
| Concordancia Top-1 en operación | 80,00 % |
| Concordancia Top-1 en destino | 83,08 % |
| Concordancia Top-3 en destino | 100,00 % |
| ECE calibrado de operación | 0,0964 |
| Latencia mediana en CPU del estudiante | 18,57 ms |
| Latencia media del profesor Jev vía API | 276,01 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores corresponden exclusivamente a la evaluación de destilación frente al profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa dado el tamaño de 10,5 millones de parámetros; no se especifican requisitos oficiales.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU.
- Cabe holgadamente en cualquier GPU de consumo, incluida una RTX 3060 o inferior, aunque no es su escenario objetivo.
- Opciones de despliegue: PyTorch nativo y runtime ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 18,57 ms de mediana por paso en CPU, frente a 276,01 ms de media del profesor vía API.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EcoSLM-WebDM | 10,83 M | hasta 250 controles DOM | Apache 2.0 | Decisión web destilada, CPU |
| TypeSafe Jev (`jev-latest`) | no disponible | no disponible | no disponible | Profesor vía API, 276,01 ms de media |
| Alternativas de agente web de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión web destilada de tamaño reducido) en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación es muy reducido (35 muestras de validación), por lo que las métricas de concordancia tienen un margen de error amplio y no deben extrapolarse sin validación propia.
- La concordancia se mide frente al profesor, no frente a la acción correcta real; un 80,00 % de acuerdo con el profesor no implica un 80,00 % de éxito en la tarea.
- El modelo solo cubre ocho operaciones predefinidas y hasta 250 controles DOM; páginas con estructuras fuera de ese rango quedan sin soporte documentado.
- No se documentan idiomas soportados ni sesgos conocidos; se desconoce el comportamiento en páginas no inglesas o con texto mixto.
- Riesgo de alucinación de destino en páginas con controles ambiguos o duplicados; el mecanismo de confianza calibrada mitiga pero no elimina este riesgo.
- No apto para generación de texto, razonamiento general ni tareas fuera de la decisión sobre el DOM.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fragilov/ecoslm-web-dm
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
