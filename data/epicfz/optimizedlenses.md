# epicfz/OptimizedLenses

## Resumen

OptimizedLenses es un conjunto de artefactos de interpretabilidad mecánica publicados por el usuario epicfz en Hugging Face. No es un modelo de lenguaje generativo, sino un paquete de ficheros de "lentes" (R-lenses) que se acoplan a modelos de la familia Qwen3-Base (concretamente Qwen3-0.6B-Base y Qwen3-1.7B-Base) para permitir análisis de representaciones internas mediante técnicas de Jacobian lens y neuron lens. El repositorio ocupa 1,2 GB y se distribuye bajo licencia CC-BY-4.0.

El problema que aborda es el coste computacional de ajustar estas lentes de interpretabilidad: el método de referencia (stdlogits/rs-lenses) requiere procesar 1.000 documentos para estimar las matrices de transformación, mientras que este proyecto selecciona 100 documentos mediante "greedy herding" sobre las 10 componentes principales (PCs) a un tercio de la profundidad del modelo, reduciendo el cómputo de ajuste en un factor de 10. Los ficheros resultantes (`r-lens/lens.pt` y `r-lens/mid.pt`) son compatibles de forma directa con el formato de stdlogits/rs-lenses, de modo que un cargador existente puede apuntar a este repositorio sin cambios de código.

La relevancia actual reside en que democratiza el análisis de interpretabilidad sobre modelos pequeños de la familia Qwen3, permitiendo a investigadores con recursos limitados obtener lentes de calidad casi idéntica a la referencia (similitud coseno mínima de 0,9956 y mediana de 0,9987-0,9989) con una fracción del coste. El paquete está pensado para flujos de trabajo de neuron-lens y rs-lenses sobre modelos base, no sobre versiones instruidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefactos de interpretabilidad: matrices de lentes R-lens para modelos transformer de la familia Qwen3-Base) |
| Parametros totales | No aplica al paquete; los modelos base asociados son Qwen3-0.6B-Base y Qwen3-1.7B-Base |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los ficheros se cargan como tensores PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch `.pt` (`lens.pt`, `mid.pt`) cargables con `torch.load` |
| Tamano del repositorio | 1,2 GB |
| Modelos base compatibles | Qwen/Qwen3-0.6B-Base, Qwen/Qwen3-1.7B-Base |
| Documentos de ajuste | 100 documentos (seleccionados por greedy herding desde un pool DCLM de 1.000) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura de red neuronal propia: contiene matrices de transformación (Jacobian lens) que mapean representaciones internas de los modelos Qwen3-Base a espacio de logits o a estados intermedios, siguiendo el formato de `stdlogits/rs-lenses`. Los ficheros se organizan por modelo (`qwen3-0.6b-base/r-lens/lens.pt` y `qwen3-1.7b-base/r-lens/lens.pt`, además de los `mid.pt` correspondientes) y se cargan extrayendo la clave `J` del diccionario serializado.

El entrenamiento o ajuste de las lentes se realiza sobre 100 documentos obtenidos mediante "greedy herding": se parte de un pool de 1.000 documentos DCLM y se seleccionan los 100 más representativos proyectando sobre las 10 componentes principales (PCs) a un tercio de la profundidad del modelo. Esta selección reduce el cómputo de ajuste en 10× respecto al procedimiento de referencia que usa los 1.000 documentos completos. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ya que no se trata de un modelo generativo.

La innovación técnica principal es la verificación cuantitativa contra la referencia de 1.000 documentos: se reportan coincidencias Top-10 en capas tempranas, medias y tardías, junto con similitud coseno mínima y mediana, lo que permite evaluar la fidelidad de las lentes herded frente a las completas.

## Capacidades

- Generación de matrices de lentes de interpretabilidad compatibles con el formato `neuron-lens` / `rs-lenses`.
- Carga directa mediante `huggingface_hub.hf_hub_download` y `torch.load`, sin necesidad de adaptadores.
- Soporte para dos modelos base: Qwen3-0.6B-Base y Qwen3-1.7B-Base.
- Análisis de representaciones internas en capas tempranas, medias y tardías (los benchmarks reportan Top-10 Early, Mid y Late).
- Verificación de fidelidad frente a la referencia de 1.000 documentos mediante similitud coseno.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es un artefacto de análisis, no un modelo de inferencia.

## Casos de uso

- Análisis de interpretabilidad en modelos Qwen3 pequeños: cargar `lens.pt` y `mid.pt` sobre Qwen3-0.6B-Base para inspeccionar cómo se transforman las representaciones internas capa a capa, usando el formato estándar de rs-lenses sin reescribir el pipeline.
- Investigación académica con recursos limitados: el ajuste sobre 100 documentos herded reduce el coste de cómputo 10× frente a la referencia de 1.000 documentos, lo que permite repetir experimentos de interpretabilidad en entornos con una sola GPU.
- Reproducción de experimentos de neuron-lens: al ser drop-in compatible con `stdlogits/rs-lenses`, se puede sustituir la lente de referencia por la optimizada y comparar resultados con la tabla de verificación publicada (Top-10 y similitud coseno).
- Auditoría de representaciones en modelos base: analizar las capas tempranas, medias y tardías de Qwen3-1.7B-Base para estudiar qué información codifica cada profundidad, apoyándose en las métricas Top-10 reportadas.
- Desarrollo de herramientas de visualización: integrar las matrices `J` en dashboards o notebooks que proyecten activaciones de neuronas sobre las lentes para explorar comportamientos internos.
- Validación de metodologías de selección de datos: usar el pipeline de greedy herding sobre PCs como referencia para comparar estrategias alternativas de submuestreo en el ajuste de lentes de interpretabilidad.
- Docencia y formación: disponer de un paquete ligero (1,2 GB) y de licencia permisiva (CC-BY-4.0) para prácticas de interpretabilidad mecánica sobre modelos pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de verificación de las lentes frente a la referencia de 1.000 documentos de `stdlogits/rs-lenses`:

| Modelo | Ruta | Docs | Top-10 Early | Top-10 Mid | Top-10 Late | Min Cos | Med Cos |
|---|---|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3-0.6B-Base | `qwen3-0.6b-base/r-lens/{lens,mid}.pt` | 100 | 87,0% | 91,5% | 97,6% | 0,9959 | 0,9987 |
| Qwen/Qwen3-1.7B-Base | `qwen3-1.7b-base/r-lens/{lens,mid}.pt` | 100 | 87,8% | 92,4% | 97,9% | 0,9956 | 0,9989 |

No se han publicado resultados de benchmarks de rendimiento de modelos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el paquete no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,2 GB y las matrices se cargan en CPU o GPU con `torch.load(..., mmap=True)`, por lo que el requisito depende del modelo base sobre el que se apliquen las lentes.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con memoria suficiente para alojar el modelo base (Qwen3-0.6B o Qwen3-1.7B) y las matrices de lentes.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3060/4060 y superiores para el modelo de 0.6B; para el de 1.7B se requiere al menos 8 GB de VRAM en precisión completa, menos si se cuantiza el modelo base (las lentes se cargan aparte).
- Opciones de despliegue: `torch.load` con `map_location='cpu'` y `mmap=True`; `huggingface_hub.hf_hub_download` para la descarga. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de inferencia.
- Latencia y throughput: no disponibles; no aplica al tratarse de artefactos de análisis.

## Comparativa con modelos similares

| Paquete | Modelos base | Documentos de ajuste | Formato | Licencia | Verificación publicada |
|---|---|---:|---|---|---|
| epicfz/OptimizedLenses | Qwen3-0.6B-Base, Qwen3-1.7B-Base | 100 (greedy herding) | `.pt` (lens.pt, mid.pt) | cc-by-4.0 | Sí (Top-10 y similitud coseno) |
| stdlogits/rs-lenses | No disponible en la información | 1.000 | `.pt` (compatible) | No disponible | Referencia de comparación |
| Otros paquetes de lentes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a la referencia citada por el autor; no se dispone de información sobre otros paquetes alternativos de lentes de interpretabilidad en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni soporta tool calling. Su uso está restringido al análisis de representaciones internas.
- Solo cubre dos modelos base concretos (Qwen3-0.6B-Base y Qwen3-1.7B-Base); no se garantiza compatibilidad con otras variantes de Qwen3 ni con modelos de otros fabricantes.
- La selección de 100 documentos mediante greedy herding introduce un sesgo respecto al pool DCLM original; la fidelidad es alta (similitud coseno mínima 0,9956) pero no idéntica a la referencia de 1.000 documentos.
- Las métricas de verificación son las reportadas por el autor; no se dispone de una evaluación independiente.
- Riesgo de alucinación: no aplica directamente, pero un uso incorrecto de las lentes (por ejemplo, interpretar sus proyecciones como predicciones del modelo) puede llevar a conclusiones erróneas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y la licencia de los modelos base Qwen3, que puede ser distinta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan idiomas soportados ni limitaciones de contexto, ya que no aplica a este tipo de artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/epicfz/OptimizedLenses
- Referencia de formato: https://huggingface.co/stdlogits/rs-lenses
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
