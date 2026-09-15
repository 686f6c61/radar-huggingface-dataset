# DeptCreator/lymph-node-triage-cpu

## Resumen

lymph-node-triage-cpu es un clasificador de imágenes para triaje de metástasis en ganglios linfáticos sobre tinciones H&E, publicado por el usuario DeptCreator en Hugging Face. No es un modelo generativo ni un modelo de lenguaje: se compone de un encoder CTransPath congelado (Swin-Tiny híbrido, 27,5 millones de parámetros) exportado a OpenVINO IR y una sonda de regresión logística (768→1) entrenada sobre parches públicos CC0 de PatchCamelyon. El conjunto se distribuye con la etiqueta Research Use Only y está pensado para ejecutarse en CPU.

Su relevancia es práctica: permite priorizar láminas o zonas sospechosas en flujos de anatomía patológica sin GPU, con una latencia declarada de unos 54 ms por tile en CPU (OpenVINO FP32) y una paridad numérica con torch de 2,4e-07. El autor reporta un AUC de parche de 0,937 (IC 95% 0,922–0,951) sobre 1.000 parches de test de PCam, con sensibilidad 0,947 y especificidad 0,671 en el punto de operación 0,0962.

Se trata de un artefacto reciente y de escasa tracción (0 descargas y 0 me gusta en el momento de la consulta), con limitaciones declaradas explícitamente por el autor: cuantificación de falsos positivos en láminas limpias sin resolver, escala de entrada no verificada para descargas arbitrarias, tamaños de muestra pequeños y una única evaluación de las métricas clave. Además, el backbone procede de un espejo comunitario no verificado por los autores originales, lo que condiciona cualquier uso más allá de la investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder CTransPath (Swin-Tiny híbrido, transformer de visión con atención por ventanas desplazadas) congelado + sonda de regresión logística (768→1) |
| Parámetros totales | ~27,5 M en el backbone; ~769 en la sonda logística |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imagen por parche; entrada validada a 96 px, clase 10x) |
| Tipos de cuantización | FP32 en formato OpenVINO IR; no se documentan otros tipos |
| Idiomas soportados | no disponible (modelo sin componente lingüístico) |
| Licencia | GPL-3.0 en el repositorio de pesos; backbone GPLv3; sonda y código Apache-2.0 |
| Formato de pesos | OpenVINO IR (`ctranspath_ov.xml` + `ctranspath_ov.bin`) y pickle (`probe_m2.pkl`) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | image-classification |
| Uso previsto | exclusivamente investigación (Research Use Only, veredicto clínico reservado al médico) |

## Arquitectura y entrenamiento

El componente principal es el backbone CTransPath, una red Swin-Tiny híbrida de 27,5 millones de parámetros que se emplea congelada, sin ajuste fino, y exportada a OpenVINO IR para inferencia en CPU. Sobre sus representaciones de 768 dimensiones se aplica una sonda lineal: una regresión logística (768→1) que produce una probabilidad de metástasis por parche. La sonda fue entrenada por los autores sobre parches públicos con licencia CC0 de PatchCamelyon y constituye el único artefacto entrenado específicamente para esta tarea; el punto de operación publicado es el umbral 0,0962, ajustado sobre validación y reportado sobre un conjunto de test retenido.

No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de imagen. Tampoco se detalla la composición completa del conjunto de entrenamiento más allá de la mención a PatchCamelyon, ni el número total de parches, épocas, aumentos de datos o técnica de optimización. Como innovación destacable, el autor cita la exportación a OpenVINO IR con paridad numérica frente a torch de 2,4e-07 y la estrategia de encoder congelado más sonda ligera, que abarata drásticamente el coste de entrenamiento y despliegue, pero limita la capacidad de representación a la del encoder de origen.

## Capacidades

- Clasificación binaria por parche de imagen histopatológica H&E: estima probabilidad de metástasis en ganglios linfáticos a partir de un tile de entrada.
- Triaje de zonas: en las pruebas internas el sistema marcó 35 de 35 regiones con metástasis aisladas de células tumorales (ITC) o micrometástasis, aunque el pico del mapa de calor coincidió exactamente con el foco solo en 11 de 35 casos.
- Inferencia en CPU sin GPU, con latencia declarada de ~54 ms por tile en FP32.
- Ejecución mediante runtime de OpenVINO a partir de los ficheros IR distribuidos.
- Uso como extractor de características congelado (768 dimensiones) para experimentos posteriores con otras sondas o cabezas de clasificación.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento.
- No se documentan capacidades multilingües: el modelo no procesa lenguaje natural.

## Casos de uso

- Triaje de láminas completas (WSI) en anatomía patológica: dividir la lámina en tiles de 96 px a 10x, inferir la probabilidad de cada uno con el encoder más la sonda y ordenar la cola de revisión del patólogo por riesgo. Los 35/35 casos con regiones ITC/micro detectados internamente respaldan este uso, siempre como priorización de zonas y no como diagnóstico.
- Pretriaje en laboratorios con alto volumen de casos: filtrar y agrupar láminas antes de la lectura humana, de modo que los casos con mayor probabilidad se revisen primero y los negativos claros se acumulen en lotes de menor prioridad.
- Despliegue en entornos sin GPU: laboratorios o unidades de investigación que solo disponen de CPU pueden ejecutar el modelo con OpenVINO a ~54 ms por tile, sin depender de hardware acelerador dedicado.
- Investigación sobre falsos positivos en láminas limpias: el autor identifica la cuantificación de FP como una tarea abierta de validación, por lo que el modelo sirve como banco de pruebas para estudiar este comportamiento.
- Generación de mapas de calor para inspección visual: la salida por tile puede agregarse en un mapa de calor sobre la lámina para que el patólogo localice rápidamente las zonas candidatas, teniendo en cuenta que el pico puede no coincidir con el foco exacto.
- Etapa de preprocesado en pipelines de patología computacional: al ser un artefacto OpenVINO IR, puede insertarse como paso de inferencia dentro de flujos existentes basados en OpenVINO y combinarse con otros componentes de análisis.
- Reproducción y comparación de encoders congelados: útil como referencia académica para experimentos de sonda lineal sobre características de CTransPath con el protocolo de PCam.
- Docencia y formación en patología computacional: permite ilustrar un flujo completo de triaje (tiling, inferencia, umbral, mapa de calor) con requisitos de hardware mínimos, siempre con fines docentes y no clínicos.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| AUC de parche | 0,937 (IC 95% 0,922–0,951) | PCam test, 1.000 parches, evaluación única |
| Sensibilidad | 0,947 (IC 95% 0,925–0,968) | Umbral 0,0962 |
| Especificidad | 0,671 | Umbral 0,0962 |
| Regiones ITC/micro detectadas | 35/35 | Conjunto interno |
| Pico de heatmap exactamente sobre el foco | 11/35 | Conjunto interno |
| Latencia de inferencia | ~54 ms por tile | CPU, OpenVINO FP32 |
| Paridad numérica con torch | 2,4e-07 | Comparación de salidas |

No se han publicado resultados de benchmarks adicionales en la información disponible. El propio autor señala que los modelos frontera no estaban disponibles para comparación y que las mediciones clave corresponden a una única ejecución con tamaños de muestra pequeños.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario documentado, que es CPU. Los pesos FP32 del backbone (~27,5 M de parámetros) ocupan aproximadamente 110 MB, por lo que el uso de memoria es muy reducido.
- GPU recomendadas: no se documenta ninguna. El artefacto está optimizado para CPU mediante OpenVINO; no hay cifras de rendimiento en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no aplica al caso de uso documentado; el modelo cabe sobradamente en memoria de cualquier equipo, pero no se han publicado mediciones en GPU.
- Opciones de despliegue: runtime de OpenVINO sobre los ficheros IR (`ctranspath_ov.xml`/`.bin`) más la sonda `probe_m2.pkl` cargada desde Python. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: ~54 ms por tile en CPU con OpenVINO FP32, medido por el autor. No se documenta throughput agregado, escalado por número de hilos ni comportamiento en iGPU o NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | AUC en PCam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lymph-node-triage-cpu | ~27,5 M (backbone) + sonda logística | Tile de 96 px a 10x | 0,937 (test de 1.000 parches, evaluación única) | GPL-3.0 (pesos) / Apache-2.0 (sonda y código) | Hugging Face; 0 descargas y 0 me gusta en la consulta |
| CTransPath (encoder de referencia) | ~27,5 M (Swin-Tiny híbrido) | 224 px | no disponible | no disponible en esta información | espejo comunitario no verificado según el autor |
| Modelos frontera de patología computacional | no disponible | no disponible | no disponible | no disponible | el autor indica que no estaban disponibles para comparación |
| Otros clasificadores sobre PatchCamelyon | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparativa queda limitada al propio artefacto y a la advertencia del autor sobre la ausencia de modelos frontera en la evaluación.

## Limitaciones y advertencias

- Uso exclusivamente investigador (Research Use Only): el modelo no está destinado a decisiones clínicas y el veredicto debe emitirlo siempre un médico.
- Backbone procedente de un espejo comunitario (`1aurent/swin_tiny_patch4_window7_224.CTransPath`) no verificado por los autores originales; para uso comercial el autor exige obtener los pesos de los autores originales y una revisión legal.
- Licencia GPL-3.0 en el repositorio de pesos, lo que impone obligaciones de copyleft en la distribución de obras derivadas. La sonda y el código se publican bajo Apache-2.0, dando lugar a una combinación de licencias que conviene revisar antes de cualquier integración.
- Cuantificación de falsos positivos en láminas limpias sin resolver: es una tarea abierta de validación declarada por el propio autor.
- Escala de entrada no verificada para descargas arbitrarias: la validación se realizó a 96 px en la clase de 10x; otras magnificaciones o resoluciones quedan fuera de lo validado.
- El sistema es un triaje de zonas, no un localizador celular: en los datos internos el pico del mapa de calor coincidió con el foco tan solo en 11 de 35 regiones con ITC o micrometástasis.
- Tamaños de muestra pequeños y una única evaluación de las métricas clave, sin repeticiones ni validación cruzada publicada; los intervalos de confianza son amplios, especialmente en especificidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos negativos y falsos positivos con consecuencias relevantes si se usa fuera del ámbito de investigación.
- Sin datos publicados sobre sesgos por tipo de tejido, tinción, escáner o centro sanitario; se desconoce la generalización fuera de la distribución de PatchCamelyon.
- Ausencia total de soporte multilingüe o de procesamiento de texto: no puede integrarse en flujos conversacionales ni de agentes.
- Tracción nula en el momento de la consulta (0 descargas, 0 me gusta), sin evidencia de uso independiente ni validación externa por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeptCreator/lymph-node-triage-cpu
- Repositorio de código (Apache-2.0): https://github.com/DeptCreator/lymph-node-triage-cpu
- Espejo comunitario del backbone CTransPath citado por el autor: https://huggingface.co/1aurent/swin_tiny_patch4_window7_224.CTransPath
- Conjunto de datos PatchCamelyon (referenciado como origen de los parches CC0 de entrenamiento): no disponible en la información proporcionada como enlace directo
- Paper o documentación técnica adicional: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la búsqueda web: los resultados recuperados no contenían información relevante sobre este modelo (foros y páginas de soporte sin relación con patología computacional).
