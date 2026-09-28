# decosaai/decosa-number-checker-modernbert-large

## Resumen

Decosa Number Checker ModernBERT-large (v2) es un clasificador de texto desarrollado por Decosa AI para verificar si las cifras de una afirmación están respaldadas por una evidencia. El modelo recibe una frase con números y una evidencia que puede ser una tabla, un pasaje de texto o ambos, y devuelve una de tres etiquetas: `supported`, `contradicted` o `not verifiable`. Cuando detecta una contradicción, además tipifica el error (valor equivocado, unidad o escala, periodo, dirección, aritmética o entidad) y señala la celda de la evidencia que ha leído para decidir.

El modelo no funciona de forma aislada: es la capa aprendida de un verificador numérico determinista. El fichero `numparse.py` extrae cada cifra de la afirmación y busca en la evidencia una derivación (una celda, un cambio, una variación porcentual, una cuota, una suma), mientras que la red neuronal decide lo que el código no puede resolver: si la derivación corresponde a la línea, el periodo y la dirección correctos, y qué significa una cifra no trazada. Se apoya en `answerdotai/ModernBERT-large`, un encoder transformer de 394.791.946 parámetros, y se distribuye bajo licencia Apache-2.0.

Es relevante porque aborda un problema concreto y mal cubierto: la verificación numérica de tablas y pasajes en dominios donde un dígito equivocado tiene consecuencias (informes financieros, ensayos clínicos, reportes de operaciones sospechosas). Frente a un LLM generativo, ofrece un coste de inferencia muy bajo (453 ms por afirmación en CPU con 4 hilos) y una salida estructurada con trazabilidad de la evidencia. La model card pública está truncada en la sección de evaluación, por lo que los resultados cuantitativos completos de precisión y F1 no están disponibles en la información consultada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabezas de clasificación personalizadas para veredicto, tipo de error y puntero a la evidencia |
| Parámetros totales | 394.791.946 (≈395 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (límite de ModernBERT-large; no se explicita en la model card) |
| Tipos de cuantización | No disponible. Se publica en safetensors y ONNX; no hay versiones GGUF ni cuantizaciones documentadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1,58 GB) y ONNX (`onnx/model.onnx`); el repo completo ocupa 3,2 GB |

## Arquitectura y entrenamiento

La base es ModernBERT-large, un encoder transformer de 395 millones de parámetros con atención alterna local/global, embeddings posicionales rotatorios y GeGLU, diseñado para contextos de hasta 8192 tokens. Sobre esa base, Decosa AI añade cabezas específicas que producen tres salidas: logits de veredicto (`supported` / `contradicted` / `not verifiable`), logits de tipo de error y logits de puntero a la celda de evidencia. El modelo requiere los ficheros `modeling_checker.py` y `numparse.py` del propio repositorio, por lo que no es un pipeline estándar de `transformers`.

El entrenamiento se hizo sobre aproximadamente 80.000 pares afirmación/evidencia construidos por el propio equipo, sin datos no comerciales en ninguna etapa y sin nada procedente de QuanTemp (CC BY-NC). Las fuentes son: los SEC Financial Statement Data Sets 2026q1 de EDGAR (4.489 presentaciones, dominio público), FinQA (MIT), TAT-QA (CC BY 4.0 para datos, MIT para código), TabFact (MIT, con tablas de Wikipedia bajo CC BY-SA), resultados de ClinicalTrials.gov API v2 (439 ensayos fase 3 con resultados, recuperados el 27 de septiembre de 2026) y ficheros sintéticos de casos SAR de Decosa. Las contradicciones se introdujeron por código con etiquetas conocidas: cambios de valor del 3-30 %, deslizamiento de escala de mil veces, la cifra del otro periodo, inversión de subida/bajada, redondeos fuera de la precisión declarada, porcentajes escritos por puntos porcentuales, porcentajes sobre una base incorrecta, sumas a las que falta un término o cifras de otra línea o grupo. Los pares no verificables eliminan de la evidencia las filas afectadas por la afirmación.

La innovación técnica clave es el reparto de responsabilidades entre código y modelo: el nivel determinista (`numparse.py`) extrae y busca derivaciones, y la red decide la interpretación semántica de esas derivaciones. En producción, la regla del autor es que un desajuste duro del código (`code == "mismatch"`) es definitivo y el modelo nunca lo revierte; cuando el código ha trazado todas las cifras, solo se marca la afirmación si el modelo supera 0,813 de confianza en `contradicted`; en el resto de casos se acepta la respuesta del modelo a partir de 0,78 y lo demás se deriva a una persona o a un modelo mayor.

## Capacidades

- Clasificación de afirmaciones numéricas en tres clases: `supported`, `contradicted` y `not verifiable`.
- Tipificación del error en las contradicciones: valor equivocado, unidad o escala, periodo, dirección, aritmética o entidad.
- Trazabilidad: devuelve un puntero a la celda de evidencia que ha leído para fundamentar la decisión.
- Entrada multimodal a nivel de evidencia: acepta una tabla, un pasaje de texto o ambos a la vez.
- Manejo de magnitudes variadas: importes con palabras de escala, porcentajes, puntos porcentuales, fracciones ("about a fifth") y múltiplos ("nearly doubled"), con parámetro de unidad explícito (por ejemplo, `unit="millions"`).
- Exportación a ONNX Runtime con entradas `input_ids` y `attention_mask` y salidas `verdict`, `error` y `pointer` (dividir los logits de veredicto por `temperature` de `checker.json` antes del softmax).
- No dispone de generación de texto, tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Verificación de afirmaciones en informes financieros: se extrae una frase con cifras de un 10-K o un 10-Q y se contrasta contra las tablas XBRL de los estados financieros. El modelo detecta si la cifra pertenece a la línea, el periodo y la dirección correctos, algo que un buscador de coincidencias exactas no resuelve.
- Auditoría de notas de prensa y comunicados de resultados: antes de publicar, se comprueba automáticamente que cada porcentaje y cada importe del texto coincide con la tabla de resultados del trimestre, con tipificación del error cuando no coincide.
- Verificación de resultados de ensayos clínicos: se validan afirmaciones en lenguaje llano sobre tablas de resultados y eventos adversos de ClinicalTrials.gov, comprobando valores, unidades y periodos antes de su difusión.
- Control de calidad de informes regulatorios y SAR bancarios: sobre filas de libro mayor y narrativas sintéticas, el modelo verifica que las cifras del relato correspondan a los movimientos registrados, útil como pre-filtro en cumplimiento normativo.
- Segunda capa de verificación en pipelines RAG financieros: un LLM genera una respuesta con cifras recuperadas de tablas; este clasificador comprueba cada cifra contra la evidencia recuperada y marca las que no se sostienen, reduciendo el riesgo de alucinación numérica.
- Fact-checking sobre tablas de Wikipedia: con el conjunto TabFact (afirmaciones humanas entailed o refuted), el modelo sirve para validar afirmaciones con dígitos sobre tablas enciclopédicas en herramientas de verificación colaborativa.
- Enriquecimiento de herramientas de BI y análisis de datos: integrado como paso previo, valida descripciones automáticas de cuadros de mando generadas por otros sistemas antes de mostrarlas al usuario.
- Filtrado previo de bajo coste en moderación de contenido numérico: al ejecutarse en CPU en 453 ms por afirmación, permite descartar rápidamente las afirmaciones claramente sostenidas y derivar solo las dudosas a revisión humana o a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La sección de evaluación de la model card está truncada, por lo que solo constan métricas operativas y umbrales de decisión calibrados en el split de desarrollo del autor.

| Métrica | Valor |
|---|---|
| Latencia en CPU (v2, 4 hilos) | 453 ms por afirmación (mediana) |
| Latencia en CPU (v1 sobre ModernBERT-base, 4 hilos) | 135 ms por afirmación |
| Umbral de confianza para `contradicted` con todas las cifras trazadas | 0,813 |
| Umbral de confianza general para aceptar la respuesta del modelo | 0,78 |
| Precisión, F1 y exactitud por conjunto | No disponible (sección de evaluación truncada) |
| Conjuntos de evaluación retenidos | Otras presentaciones, otros ensayos, otras semillas SAR y los splits de test oficiales; nunca usados en entrenamiento ni ajuste |

Los resultados de evaluación numérica se publican también en `eval_summary.json` dentro del repositorio, junto con `SHA256SUMS` para verificar la integridad de cada fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el fichero safetensors ocupa 1,58 GB; en fp16 la estimación ronda los 0,8 GB de pesos, con un total de aproximadamente 2-3 GB contando activaciones y overhead (estimación propia a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 y superiores. En entornos de servidor, A100 o H100 aportan margen de sobra pero no son necesarias para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: soportada y documentada; mediana de 453 ms por afirmación con 4 hilos.
- Opciones de despliegue: PyTorch con `transformers` más los ficheros personalizados del repositorio, u ONNX Runtime con `onnx/model.onnx`. No es compatible con pipelines estándar de vLLM, TGI, Ollama o llama.cpp, ya que incorpora cabezas personalizadas y no es un modelo generativo.
- Latencia y throughput: 453 ms por afirmación en CPU con 4 hilos es el único dato publicado. El throughput en GPU no está disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo evaluado ni de alternativas sobre la misma tarea, por lo que la comparación se limita a especificaciones estructurales.

| Modelo | Parámetros | Contexto | Licencia | Orientación |
|---|---|---|---|---|
| decosaai/decosa-number-checker-modernbert-large | 394,8 M | 8192 tokens | Apache-2.0 | Verificación numérica de afirmaciones contra tablas y pasajes |
| answerdotai/ModernBERT-large (modelo base) | 395 M | 8192 tokens | Apache-2.0 | Encoder generalista; requiere ajuste para esta tarea |
| DeBERTa-v3-large | 435 M | 512 tokens | MIT | Encoder generalista de clasificación; contexto muy inferior |
| RoBERTa-large | 355 M | 512 tokens | MIT | Encoder generalista de clasificación; contexto muy inferior |

La comparación de rendimiento específico en verificación numérica no está disponible para ninguno de estos modelos en la información consultada.

## Limitaciones y advertencias

- Cobertura de idioma limitada al inglés; no hay soporte multilingüe documentado.
- Especialización de dominio: el entrenamiento se centra en informes financieros, ensayos clínicos y casos SAR sintéticos. El rendimiento fuera de esos dominios no está documentado.
- Riesgo de error de clasificación: el propio autor recomienda umbrales de confianza (0,813 y 0,78) y derivar el resto a revisión humana o a un modelo mayor, lo que implica una tasa de error asumida.
- Dependencia del nivel determinista: el modelo no funciona sin `numparse.py`; un fallo de parseo de las cifras se propaga a la decisión final.
- Integración no estándar: no se puede cargar con el pipeline de `transformers` ni con servidores de inferencia habituales, lo que complica su adopción en plataformas ya montadas sobre esas herramientas.
- Decisiones de umbral calibradas sobre el split de desarrollo del autor; pueden requerir recalibración en otros dominios o distribuciones.
- Los pares no verificables se construyen eliminando las filas afectadas de la evidencia, de modo que el comportamiento ante evidencias incompletas reales puede diferir del entorno de evaluación.
- Licencia Apache-2.0, que permite uso comercial. Los datos de ClinicalTrials.gov son de dominio público pero exigen atribución y declaración de cambios, y las tablas de TabFact proceden de Wikipedia bajo CC BY-SA; estas condiciones afectan a los datos, no a los pesos publicados.
- Los datos de entrenamiento no se distribuyen con el repositorio, por lo que la reproducibilidad completa del entrenamiento no es posible con lo publicado.
- No se han publicado métricas de precisión, F1 ni comparaciones con sistemas alternativos, lo que dificulta estimar la calidad real antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-number-checker-modernbert-large
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- FinQA (repositorio): https://github.com/czyssrs/FinQA
- TAT-QA (repositorio): https://github.com/NExTplusplus/TAT-QA
- TabFact / Table-Fact-Checking (repositorio): https://github.com/wenhuchen/Table-Fact-Checking
- Conjunto FinTabNet (IBM): https://huggingface.co/datasets/ibm-research/finqa
- TAT-QA en HuggingFace: https://huggingface.co/datasets/next-tat/TAT-QA
- TabFact en HuggingFace: https://huggingface.co/datasets/wenhu/tab_fact
- SEC Financial Statement Data Sets (EDGAR): https://www.sec.gov/dera/data/financial-statement-data-sets
- ClinicalTrials.gov API v2: https://clinicaltrials.gov/data-api/api
