# dmth10/tell-chartcheck

## Resumen

TELL ChartCheck es un clasificador de imágenes publicado por el usuario dmth10 en Hugging Face, diseñado para detectar trucos visuales engañosos en gráficos estadísticos. El modelo etiqueta cada imagen en una de cinco categorías: `none` (gráfico sin manipulación aparente), `truncated_axis` (eje truncado), `inverted_axis` (eje invertido), `uneven_ticks` (marcas de eje no uniformes) y `dual_axis` (doble eje). Se trata de un ajuste fino de EfficientNet-B0, una red convolucional de 4.055.969 parámetros totales, sobre un conjunto de 10.000 gráficos sintéticos generados con matplotlib. Forma parte de TELL, un proyecto presentado por su autor al Congressional App Challenge de 2026.

El interés del modelo reside en su enfoque acotado: en lugar de un sistema multimodal generalista, emplea un clasificador de imágenes pequeño y entrenado de forma totalmente sintética para una tarea de verificación de alfabetización visual y lucha contra la desinformación. Con ~4 M de parámetros y pesos en safetensors, es viable en CPU y en cualquier GPU de consumo, lo que lo hace atractivo para integrarlo en herramientas de verificación periodística o en extensiones de navegador.

La evidencia publicada es todavía limitada: el autor reporta un macro-F1 de 0,975 en un conjunto sintético reservado, pero no ha evaluado aún sobre gráficos reales del conjunto Misviz (pendiente de acceso al dataset). No hay datos de benchmarks estándar, latencia ni protocolo de entrenamiento detallado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (red neuronal convolucional con compound scaling) |
| Parametros totales | 4.055.969 |
| Longitud de contexto | no aplica (clasificación de imágenes; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (las etiquetas de salida están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | image-classification |
| Numero de clases | 5 (`none`, `truncated_axis`, `inverted_axis`, `uneven_ticks`, `dual_axis`) |
| Entrada | imagen de gráfico estadístico (resolución no especificada) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura es EfficientNet-B0, una CNN con escalado compuesto uniforme de profundidad, anchura y resolución, adaptada aquí como cabecera de clasificación de 5 clases sobre imágenes de gráficos. El autor indica un ajuste fino sobre EfficientNet-B0, aunque no especifica si parte de pesos preentrenados en ImageNet ni detalla el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote, la resolución de entrada o las técnicas de aumento de datos empleadas.

Los datos de entrenamiento son 10.000 gráficos sintéticos generados con matplotlib, cubriendo las cuatro manipulaciones anteriores más la clase `none`. No se documenta la composición exacta por clase, el equilibrio del dataset ni cómo se generaron las variantes (rangos de ejes, tipos de gráfico, estilos). Tampoco se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador. No hay innovaciones técnicas declaradas más allá del propio ajuste fino supervisado.

## Capacidades

- Clasificación de imágenes de gráficos en cinco categorías mutuamente excluyentes: sin truco, eje truncado, eje invertido, marcas no uniformes y doble eje.
- Detección de manipulaciones visuales frecuentes en desinformación con datos: truncado de la base del eje Y, inversión de la dirección del eje, espaciado irregular de las marcas y uso de dos escalas superpuestas.
- Salida de una única etiqueta por imagen, adecuada para pipelines de moderación o verificación automatizada.
- Inferencia ligera: ~4 M de parámetros permiten ejecución en CPU sin aceleración dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá de la clasificación de imágenes.
- Cobertura multilingüe: no disponible; las etiquetas están en inglés y no se documenta el idioma de los gráficos empleados en el entrenamiento.

## Casos de uso

- Verificación periodística asistida: preprocesar los gráficos que acompañan a una noticia y marcarlos automáticamente como `truncated_axis` o `inverted_axis` para que un fact-checker humano revise solo los casos sospechosos, reduciendo el triaje manual.
- Moderación de contenido en redes sociales: clasificar imágenes publicadas en un hilo o canal y elevar a revisión aquellas con `dual_axis` o `uneven_ticks`, patrones habituales en gráficos virales engañosos.
- Extensión de navegador o plugin de accesibilidad: analizar los gráficos de una página y mostrar una advertencia al usuario cuando el clasificador detecte una manipulación, con la ventaja de que el modelo cabe en el cliente.
- Herramienta educativa de alfabetización estadística: generar ejercicios con gráficos sintéticos y usar el modelo para etiquetarlos automáticamente, mostrando al alumnado qué patrón visual delata cada truco.
- Auditoría de informes internos: pasar los gráficos de dashboards corporativos por el clasificador como control de calidad antes de su publicación, detectando ejes truncados accidentales.
- Filtro previo en un pipeline multimodal mayor: usar ChartCheck como primera etapa barata (4 M de parámetros) y derivar solo los positivos a un modelo mayor con capacidad de razonamiento y explicación textual.
- Investigación sobre desinformación visual: servir como línea base reproducible (licencia MIT, pesos safetensors) para comparar futuros clasificadores entrenados con datos reales.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| Sintetico reservado (held-out) | Macro-F1 | 0,975 |
| Graficos reales Misviz | Macro-F1 | no ejecutado (pendiente de acceso al dataset) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni métricas por clase, matriz de confusión, precisión/recall individuales o intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 4.055.969 parámetros, los pesos ocupan aproximadamente 16 MB en fp32 y unos 4 MB en int8; el consumo real vendrá dominado por las activaciones y el tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM sirve; no se requiere A100 ni H100. Una RTX 4090 o una T4 están sobradamente capacitadas.
- Cabe en GPU de consumo: sí, en cualquier modelo reciente (RTX 20xx en adelante) e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, exportación a ONNX Runtime, TorchScript o integración en un servicio HTTP propio. vLLM, TGI y llama.cpp no aplican, al no ser un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Por el tamaño del modelo, se espera inferencia en decenas de milisegundos en CPU, pero es una estimación no verificada.
- Almacenamiento: el repositorio ocupa 0,0 GB según los metadatos, coherente con un checkpoint de ~16 MB.

## Comparativa con modelos similares

No se han identificado en la informacion disponible clasificadores públicos comparables (misma tarea de detección de trucos en gráficos) con métricas publicadas, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Clases | Contexto/entrada | Licencia | Datos de evaluacion |
|---|---|---|---|---|---|
| TELL ChartCheck (dmth10) | 4.055.969 | 5 | imagen de gráfico | MIT | Macro-F1 0,975 en sintético; real no evaluado |
| EfficientNet-B0 base (referencia de la que parte) | ~5,3 M | 1000 (ImageNet-1k) | imagen natural | según implementación original | no aplica a esta tarea |
| Otros detectores de gráficos engañosos open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio de entrenamiento exclusivamente sintético (matplotlib): es previsible una brecha de dominio frente a gráficos reales de medios, dashboards o capturas de pantalla, con posibles caídas de rendimiento no cuantificadas.
- El propio autor no ha evaluado el modelo sobre gráficos reales de Misviz, por lo que el 0,975 de macro-F1 no debe extrapolarse a producción con datos reales.
- Riesgo de aprendizaje de atajos: el modelo podría apoyarse en artefactos del generador (estilos por defecto de matplotlib, fuentes, paletas) en lugar de en la estructura del eje, lo que inflaría las métricas sintéticas.
- Clasificación de etiqueta única: no localiza la región del gráfico ni explica la manipulación detectada; no devuelve coordenadas ni justificación textual.
- Frontera difusa entre clases: `truncated_axis`, `uneven_ticks` y `dual_axis` pueden coexistir en un mismo gráfico, y el modelo solo asigna una etiqueta.
- Sesgos conocidos: no disponibles; no se documenta análisis de sesgo ni composición demográfica o temática del dataset sintético.
- Riesgo de alucinación: no aplica en sentido estricto al no generar texto, pero sí existe riesgo de falsos positivos y falsos negativos con confianza alta y sin calibración publicada.
- Idiomas: no disponible; se desconoce si los gráficos de entrenamiento incluyen etiquetas en otros idiomas distintos del inglés.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; no se documentan restricciones adicionales ni procedencia de los pesos base de EfficientNet-B0 (relevante si se derivan de implementaciones con licencias distintas).
- Adopción nula (0 descargas, 0 likes) y ausencia de paper: no hay revisión por pares ni reproducibilidad verificada del entrenamiento.
- Proyecto asociado a un Congressional App Challenge: orientado a demostración, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dmth10/tell-chartcheck
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a un paper, a un repositorio de codigo ni a una demo; los resultados devueltos no guardan relacion con TELL ChartCheck.
