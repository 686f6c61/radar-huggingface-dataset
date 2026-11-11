# AlvaroSchwiedop/PHASE-TTC-Adapt

## Resumen

PHASE-TTC-Adapt es un modelo de percepción para robótica que estima el tiempo hasta el contacto (time-to-contact, TTC) con signo a partir de observaciones de cámara de eventos y fotogramas RGB sincronizados. Lo desarrolla AlvaroSchwiedop y se publica bajo el identificador PHASE-TTC-Adapt-20261031. No es un modelo de lenguaje: es un grafo PyTorch personalizado, orientado a un pipeline de robótica, que combina mediciones de movimiento independientes por modalidad en una representación física de fase con una corrección anclada en RGB.

La relevancia de esta versión concreta reside en el adaptador que añade: un ensamblado de tres semillas de enrutadores de calidad de 688 parámetros que combina las estimaciones nativas de TTC con una expansión causal de cajas delimitadoras en coordenadas de TTC inverso. Sobre una evaluación local EvTTC de 434 consultas, el MAE agrupado baja de 0,82498 s (original) a 0,33590 s (adaptado), y el error absoluto relativo pasa de 49,894 % a 17,250 %. El modelo original alcanzó el puesto 1 en la clasificación oficial GarlTTC con 35,80145 Overall MiD, pero esa puntuación pertenece al modelo original, no a esta adaptación.

El repositorio ocupa 0,1 GB e incluye checkpoints exactos, normalizadores, sellos originales, dependencias de ejecución, comandos de inferencia y extracción, y artefactos de evaluación. La inferencia funciona en CPU por defecto y admite CUDA con PyTorch 2.10.0 / torchvision 0.25.0. El modelo no se carga con `transformers.AutoModel`; requiere el script `predict.py` incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo PyTorch personalizado con fusión causal multimodal (eventos + RGB) y representación física de fase; enrutadores de calidad de 688 parámetros en ensamblado de tres semillas |
| Parametros totales | No disponible (modelo original de nueve componentes más adaptador de 688 parámetros por enrutador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de percepción por consulta, no secuencial de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch personalizados con manifiesto SHA-256 y sellos; no safetensors ni GGUF |
| Tarea | Estimación de time-to-contact con signo (pipeline: robotics) |
| Entradas | Observaciones de cámara de eventos y fotogramas RGB sincronizados y calibrados, con regiones de objeto suministradas |
| Salidas | TTC con signo en segundos y diagnósticos |
| Entrenamiento del adaptador | 2.608 consultas de desarrollo (2.531 de carretera de 24 grabaciones y 77 Slider-500) |
| Evaluación local | 434 consultas EvTTC: MAE 0,33590 s; error relativo absoluto 17,250 % |
| Tamaño del repositorio | 0,1 GB |
| Versión | PHASE-TTC-Adapt-20261031 (liberación congelada) |

## Arquitectura y entrenamiento

PHASE-TTC mide el movimiento de forma independiente en cada modalidad (cámara de eventos y RGB), refina esas mediciones a lo largo del tiempo y las combina en una representación física de fase con una corrección anclada en RGB. La adaptación mantiene congelado el modelo original de nueve componentes y añade un ensamblado de tres semillas de enrutadores de calidad de 688 parámetros que combina las estimaciones nativas de TTC con una expansión causal de cajas delimitadoras en coordenadas de TTC inverso. Cuando no hay historial geométrico adecuado disponible, el adaptador vuelve a la estimación nativa.

Los enrutadores se ajustaron sobre 2.608 consultas de desarrollo: 2.531 consultas de carretera procedentes de 24 grabaciones y 77 consultas Slider-500. Las diez grabaciones de evaluación quedaron excluidas del ajuste final, aunque el conjunto de datos y el desarrollo previo del modelo estuvieron expuestos. Reajustes posteriores fallaron sus controles y no sustituyen a esta liberación congelada. El repositorio conserva los bytes originales de identificadores y sellos históricos; `RELEASE.json`, la model card y `MANIFEST.json` describen el estado de esta versión. Los módulos auxiliares de investigación importados por el entorno de ejecución no alteran el modelo seleccionado.

## Capacidades

- Estimación de time-to-contact con signo en segundos a partir de observaciones causales de cámara de eventos y RGB.
- Medición de movimiento independiente por modalidad y refinamiento temporal de esas mediciones.
- Fusión causal multimodal en una representación física de fase con corrección anclada en RGB.
- Combinación adaptativa de la estimación nativa con expansión causal de cajas delimitadoras en coordenadas de TTC inverso.
- Retorno a la estimación nativa cuando no hay historial geométrico adecuado.
- Emisión de diagnósticos junto al valor de TTC.
- Ejecución en CPU por defecto y en CUDA con las ruedas adecuadas de PyTorch.
- Verificación de integridad mediante manifiesto SHA-256 y fijación de revisiones del Hub para reproducibilidad experimental.
- Extracción de consultas a partir del benchmark EvTTC con estructura de directorios y calibración conservadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Evitación de colisiones en robótica móvil: el modelo estima el TTC con signo a partir de eventos y RGB sincronizados, lo que permite alimentar un bucle de control que frene o maniobre antes del contacto; la corrección por expansión de caja mejora la estimación en aproximaciones frontales.
- Manipulación con agarre dinámico: en tareas de captura de objetos en movimiento, el TTC estimado por consulta sirve para disparar el cierre del efector final en el instante adecuado, aprovechando la medición independiente por modalidad.
- Navegación con cámaras de eventos en condiciones de alta dinámica: al combinar eventos y RGB, el modelo mantiene estimaciones de aproximación cuando el sensor RGB convencional sufre desenfoque de movimiento.
- Drones y plataformas de bajo consumo: la inferencia en CPU por defecto y las dependencias ligeras permiten desplegar el modelo en equipos sin GPU dedicada, aunque el presupuesto de latencia debe validarse por plataforma.
- Investigación en percepción neuromórfica: el repositorio incluye proyecciones de evaluación guardadas, etiquetas, identidades de origen y un comando de recálculo de métricas, lo que facilita la reproducibilidad de experimentos sobre EvTTC.
- Evaluación comparativa de fusión multimodal: el adaptador permite medir el efecto de la corrección geométrica frente a la estimación nativa sobre un cohorte fijo de consultas, con resultados documentados de MAE y error relativo.
- Integración en pipelines de percepción existentes: `predict.py` acepta entradas `.npz` con píxeles, marcas de tiempo y regiones de objeto suministradas, y `extract_example.py` extrae consultas del benchmark EvTTC conservando calibración y nombres de secuencia.

## Benchmarks y rendimiento

Evaluación local EvTTC de 434 consultas, con interpolación offline de salidas negativas al estilo del organizador (el posprocesamiento puede usar salidas futuras y es independiente de la inferencia causal):

| Metrica | Original | Adaptado |
|---|---|---|
| MAE agrupado (s) | 0,82498 | 0,33590 |
| Error absoluto relativo (%) | 49,894 | 17,250 |

Cohorte de transferencia EvTTC corregido: 460 consultas elegibles de 508 candidatas fijas en 32 secuencias con desarrollo expuesto. La fusión original mejora el MAE agrupado (0,8130 s frente a 0,8513 s de RGB) y el error p95, mientras que RGB obtiene mejor mediana y mejor error relativo. Los intervalos de confianza pareados a nivel de secuencia incluyen el cero.

Clasificación oficial GarlTTC: puesto 1 con 35,80145 Overall MiD en el registro del 28 de octubre de 2026. Este resultado pertenece al modelo original PHASE-TTC, no a la adaptación. Nueve puntuaciones de secuencia reconstruyen los resultados originales redondeados del organizador; Slider-750 sigue siendo discrepante. No hay puntuación verificada en la clasificación oficial para esta adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo ocupa 0,1 GB en repositorio y la inferencia por defecto es en CPU.
- GPU recomendadas: no disponibles en la información proporcionada; se documenta soporte CUDA con PyTorch 2.10.0 y torchvision 0.25.0.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras; el modo por defecto es CPU.
- Despliegue: script `predict.py` propio del repositorio; no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no se carga con `transformers.AutoModel`.
- Dependencias: Python 3.12 en entorno limpio; para instalación solo CPU, PyTorch desde `https://download.pytorch.org/whl/cpu`; `requirements-cpu-tested.txt` recoge las versiones probadas en Windows con Python 3.12.
- Latencia: la repetición cronometrada publicada midió 29,14 ms p95 sobre 250 actualizaciones, por encima de un presupuesto de 20 ms. Ese experimento no demuestra operación sostenida de sensor a salida a 50 Hz.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PHASE-TTC-Adapt | Fusión eventos + RGB para TTC | No disponible (adaptador de 688 parámetros) | No aplica | MAE 0,33590 s en 434 consultas EvTTC locales | MIT | Hugging Face |
| PHASE-TTC (original) | Fusión eventos + RGB para TTC | No disponible | No aplica | MAE 0,82498 s en la misma evaluación local; puesto 1 GarlTTC con 35,80145 Overall MiD | MIT | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de estimación de TTC con fusión de cámara de eventos y RGB en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo exige observaciones de eventos y RGB sincronizadas y calibradas, además de regiones de objeto suministradas; un detector autónomo es un componente separado que no se incluye.
- Expone TTC con signo y diagnósticos, pero no proporciona probabilidades de colisión calibradas ni intervalos de incertidumbre.
- La repetición cronometrada publicada midió 29,14 ms p95 sobre 250 actualizaciones, por encima de un presupuesto de 20 ms; no se demuestra operación sostenida de sensor a salida a 50 Hz.
- No hay puntuación verificada en la clasificación oficial para esta adaptación; el resultado de GarlTTC corresponde al modelo original y se ofrece como procedencia.
- El cohorte de transferencia EvTTC corregido tiene intervalos de confianza pareados a nivel de secuencia que incluyen el cero, lo que limita la solidez de la mejora reportada.
- El ajuste final de los enrutadores excluyó las diez grabaciones de evaluación, pero el conjunto de datos y el desarrollo previo del modelo estuvieron expuestos, lo que puede inflar las métricas locales.
- El posprocesamiento de interpolación offline de salidas negativas puede usar salidas futuras y es independiente de la inferencia causal; las métricas deben interpretarse con esa distinción.
- Slider-750 sigue siendo discrepante en la reconstrucción de puntuaciones de secuencia.
- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- No se documentan sesgos conocidos ni tasas de alucinación, aunque al ser un modelo de percepción la noción de alucinación no aplica directamente; sí existe riesgo de estimaciones erróneas de TTC en escenarios fuera de distribución.
- La licencia MIT permite uso comercial, pero no se documentan garantías ni validación en producción.
- Los módulos auxiliares de investigación importados por el entorno de ejecución no alteran el modelo seleccionado, pero conviene fijar la revisión del Hub con `--revision <commit>` para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlvaroSchwiedop/PHASE-TTC-Adapt
- Modelo original PHASE-TTC: https://huggingface.co/AlvaroSchwiedop/PHASE-TTC
- Artículo y lector interactivo: https://schwiedop.com/papers/phase-ttc/
- Proyecto: https://schwiedop.com/PHASE-TTC/
- Código: https://github.com/Kripta-Studios/phase-ttc
- Clasificación oficial GarlTTC: https://www.codabench.org/competitions/17289/#/results-tab
- Ejemplos grabados (Space): https://huggingface.co/spaces/AlvaroSchwiedop/PHASE-TTC
- Descarga del benchmark EvTTC: https://nail-hnu.github.io/EvTTC/download/download/
- Documentación de formato de entrada: INPUT_FORMAT.md (incluido en el repositorio)
- Límites de reproducción: REPRODUCTION.md (incluido en el repositorio)
