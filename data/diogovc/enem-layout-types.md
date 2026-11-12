# diogovc/enem-layout-types

## Resumen

`enem-layout-types` es una red neuronal convolucional desarrollada por Cassio Lima Silva y Diogo Vieira de Castro en el marco del proyecto Enem Flow, una plataforma abierta de estudio para el Examen Nacional de Enseñanza Media (ENEM) de Brasil. El modelo recibe la imagen de una pregunta completa del ENEM y devuelve un JSON con el tipo de maquetación de impresión según el catálogo `layout-types-v2`: cómo se suceden los bloques del enunciado (texto, crédito, figura, tabla), cómo se disponen las alternativas y si existen marcas como texto compartido, líneas numeradas o bloques lado a lado.

Se trata de un clasificador de imágenes de aproximadamente 9,9 millones de parámetros, entrenado con recortes renderizados a 150 dpi del acervo de exámenes de 2009 a 2023 y evaluado sobre 370 preguntas revisadas de 2024 y 2025. Su relevancia es acotada y muy específica: sirve como último recurso cuando solo se dispone de la imagen de la pregunta, ya que el propio autor advierte que un adaptador que lee el PDF original alcanza el 93,5% de acierto exacto y una regla sobre el JSON estructurado llega al 87,3%, frente al 71,4% de esta red.

El modelo está pensado para integrarse en el pipeline de Enem Flow, donde el tipo de layout determina cómo se presenta cada pregunta con la misma diagramación del cuaderno oficial. No es un modelo de lenguaje ni un sistema multimodal general: es un componente de análisis de documento especializado, monolingüe (portugués) y de dominio cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) para clasificación de imágenes |
| Parametros totales | 9.896.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, una pregunta completa por recorte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La model card describe el modelo como una red neuronal convolucional que opera sobre la imagen de una pregunta completa del ENEM, desde el título "QUESTÃO n" hasta la última alternativa, sin el resto de la página. La salida se organiza en tres ejes independientes o dependientes entre sí: `corpo` (secuencia de bloques del enunciado), `alternativas` (disposición de las opciones) y `marcas` (texto compartido, líneas numeradas, bloques lado a lado). El modelo emite probabilidades calibradas por eje, una confianza global calculada como producto de las probabilidades elegidas y una bandera `needs_review` que se activa por debajo de 0,905 de confianza, cuando el tipo queda fuera del catálogo o cuando el cuerpo se clasifica como `outro`.

El entrenamiento emplea recortes renderizados del PDF a 150 dpi, con el acervo de exámenes de 2009 a 2023 como conjunto de entrenamiento. Los rótulos automáticos provinieron de un adaptador que lee el PDF original (texto, vectores e imagen), complementado con revisión. El conjunto de test son 370 preguntas revisadas de 2024 y 2025, ninguna vista en entrenamiento. La model card no detalla la composición exacta del dataset, el número de tokens ni si hubo ajuste por RLHF o DPO; tampoco especifica la arquitectura convolucional concreta (backbone, profundidad, resolución de entrada más allá de los 150 dpi de renderizado). La calibración reportada (ECE de 0,068 en test) sí indica un trabajo explícito de calibración de probabilidades.

## Capacidades

- Clasificación del tipo de layout de una pregunta del ENEM a partir de su imagen, según el catálogo `layout-types-v2`.
- Predicción sobre tres ejes: secuencia del cuerpo (`texto`, `credito`, `figura`, `tabela`), disposición de alternativas (`alt-texto`, `alt-figura`, `alt-grade`) y marcas adicionales (`compartilhado`, `linhas-numeradas`).
- Salida estructurada en JSON con `type`, `axes`, `probabilities`, `confidence`, `needs_review`, `in_catalog` y `representable`.
- Probabilidades calibradas por eje, con marcas tratadas como etiquetas independientes.
- Mecanismo de abstención: la bandera `needs_review` señala cuándo conviene revisar manualmente la predicción.
- Indicación de si el tipo detectado existe en el catálogo (`in_catalog`) y si el contrato de contenido de Enem Flow ya lo representa (`representable`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen de dominio cerrado.
- Capacidad multilingüe: únicamente portugués, y dentro del dominio de exámenes del ENEM.

## Casos de uso

- Catalogación automática de bancos de preguntas del ENEM: dado un archivo de imágenes de preguntas recortadas, el modelo asigna a cada una su tipo de layout, lo que permite indexar y filtrar por estructura de presentación en una plataforma de estudio.
- Reconstrucción de la diagramación original en visores web: Enem Flow usa el tipo de layout para reproducir cada pregunta con la misma disposición del cuaderno oficial; el modelo aporta el tipo cuando solo se conserva la imagen.
- Triaje previo a revisión humana: con el umbral de confianza de 0,905, el modelo acepta automáticamente solo el 16,2% de las preguntas de test con un 98,3% de acierto en ellas, de modo que el resto se deriva a revisión, reduciendo el coste de anotación manual.
- Detección de preguntas con estructura atípica: los tipos con figura, tabla o crédito intercalado se identifican para tratarlos con plantillas de presentación específicas, en lugar de forzar la plantilla de texto plano.
- Control de calidad de pipelines de extracción: si un sistema de extracción de PDF produce imágenes de preguntas, el clasificador de layout puede señalar discrepancias entre la estructura esperada y la observada, como una figura que debería aparecer y no aparece.
- Investigación educativa sobre tipología de ítems: permite estudiar la distribución de formatos de pregunta a lo largo de los años (2009-2025) y correlacionar el tipo de layout con dificultad o materia, a partir de un conjunto de imágenes etiquetadas de forma automática.
- Preprocesado para OCR o extracción de contenido: conocer si una pregunta contiene tabla, figura o líneas numeradas orienta qué extractores aplicar y en qué orden.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (test de 370 preguntas revisadas de 2024 y 2025, no vistas en entrenamiento; métricas no verificadas de forma independiente):

| Metodo | Acierto del tipo exacto | IC 95% |
|---|---|---|
| Esta red (imagen) | 71,4% | 67,0-75,7% |
| Adaptador del PDF | 93,5% | 91,1-95,9% |
| Regla sobre el JSON | 87,3% | 84,1-90,5% |
| Mayoría (tipo más común del entrenamiento) | 44,9% | 39,7-49,7% |

| Metrica | Valor |
|---|---|
| Accuracy (tipo exacto) | 0,7135 |
| Macro-F1 (cuerpo) | 0,2699 |
| Macro-F1 (alternativas) | 0,8476 |
| Macro-F1 (marcas) | 0,2469 |

| Eje | Macro-F1 (test) | Accuracy (test) | Macro-F1 (desarrollo) |
|---|---|---|---|
| cuerpo | 0,270 | 73,8% | 0,257 |
| alternativas | 0,848 | 98,1% | 0,604 |
| marcas | 0,247 | 97,6% | 0,496 |

Calibración (ECE) en test: 0,068. Con el umbral de revisión, el modelo acepta el 16,2% de las preguntas de test con un 98,3% de acierto en ellas. Media de tres semillas en test: 68,8% (desviación de 4,6 puntos porcentuales).

Por segmento del test:

| Segmento | Preguntas | Acierto del tipo |
|---|---|---|
| año:2024 | 185 | 68,6% |
| año:2025 | 185 | 74,1% |
| contenido:estructurado | 362 | 71,5% |
| contenido:imagen-unica | 8 | 62,5% |
| rotulo:automatic-reviewed | 336 | 74,7% |
| rotulo:manual | 34 | 38,2% |

Por tipo en el test (extracto de los tipos con mayor soporte):

| Tipo | Precisión | Revocación | F1 | Soporte |
|---|---|---|---|---|
| `texto-credito-texto.alt-texto` | 0,912 | 0,880 | 0,896 | 166 |
| `texto.alt-texto` | 0,740 | 0,864 | 0,797 | 66 |
| `texto-figura-texto.alt-texto` | 0,543 | 0,610 | 0,575 | 41 |
| `texto-figura+credito-texto.alt-texto` | 0,391 | 0,310 | 0,346 | 29 |
| `figura+credito-texto.alt-texto` | 0,737 | 0,778 | 0,757 | 18 |
| `texto-tabela-texto.alt-texto` | 0,667 | 0,750 | 0,706 | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 9,9 millones de parámetros en safetensors, el peso de los pesos en precisión nativa (fp32) ronda los 40 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; también es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: el repositorio proporciona un paquete Python propio (`enem_layout`) con `EnemLayoutClassifier.from_pretrained` y `predict_images`, instalable vía `pip install -r requirements.txt` tras descargar el modelo con `huggingface_hub`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `diogovc/enem-layout-types` | CNN de clasificación de layout de preguntas ENEM | 9,9 M | no aplica (imagen) | 71,4% de acierto exacto en test | MIT | Hugging Face |
| Adaptador del PDF (Enem Flow) | Lector del PDF original (texto, vectores, imagen) | no disponible | no disponible | 93,5% de acierto exacto en test | MIT (proyecto Enem Flow) | Repositorio GitHub del proyecto |
| Regla sobre el JSON (Enem Flow) | Regla determinista sobre contenido estructurado | no aplica | no aplica | 87,3% de acierto exacto en test | MIT (proyecto Enem Flow) | Repositorio GitHub del proyecto |
| Mayoría (baseline) | Predicción del tipo más frecuente del entrenamiento | no aplica | no aplica | 44,9% de acierto exacto en test | no aplica | no aplica |

No se dispone de información sobre otros modelos públicos de clasificación de layout de documentos educativos en portugués con los que establecer una comparación directa.

## Limitaciones y advertencias

- El propio autor advierte que, si se dispone del PDF original o del JSON estructurado de la pregunta, conviene usar el adaptador del PDF (93,5%) o la regla sobre el JSON (87,3%) en lugar de esta red (71,4%).
- El rendimiento es muy desigual por tipo: los tipos frecuentes como `texto-credito-texto.alt-texto` alcanzan F1 de 0,896, mientras que varios tipos con figura, tabla o marcas combinadas obtienen F1 de 0,000 en el test (por ejemplo, `texto-figura-texto-credito-texto.alt-texto`, `texto-credito-texto.alt-texto.compartilhado.linhas-numeradas` o `texto-figura+credito-texto-credito-texto.alt-texto`).
- El Macro-F1 del eje `cuerpo` es de solo 0,270 y el de `marcas` de 0,247, lo que indica un mal desempeño en clases poco representadas pese a una accuracy global alta.
- En el segmento de rótulos manuales (34 preguntas) el acierto cae al 38,2%, frente al 74,7% del segmento de rótulos automáticos revisados, lo que sugiere dependencia de la calidad y el estilo de etiquetado.
- La entrada debe ser una pregunta completa recortada, desde el título "QUESTÃO n" hasta la última alternativa, sin el resto de la página; recortes distintos de los renderizados a 150 dpi pueden degradar el rendimiento.
- Calibración moderada (ECE de 0,068) y umbral de revisión fijado en 0,905: por debajo de ese umbral la salida se marca como `needs_review`, de modo que en producción conviene tratar esa bandera como obligatoria de revisión manual.
- Sesgos conocidos: no se documentan sesgos demográficos ni sociales en la model card; el sesgo relevante es de dominio y de distribución de tipos, con infrarrepresentación de layouts poco frecuentes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de asignación errónea de tipo con alta confianza aparente en clases raras.
- Limitaciones de idioma y contexto: solo portugués y solo preguntas del ENEM; no está validado para otros exámenes, otros idiomas ni otros formatos de documento.
- Licencia MIT: permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright y revisar la licencia de los datos de entrenamiento (el acervo de exámenes del ENEM) por si impone restricciones adicionales, extremo no detallado en la información disponible.
- Para producción: no se han publicado latencias, throughput ni requisitos de hardware; el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, por lo que la validación comunitaria es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diogovc/enem-layout-types
- Repositorio del proyecto Enem Flow (código, datos de entrenamiento y protocolo): https://github.com/LemonCandles/enem-flow
- Paper: no disponible
- Blog o demo: no disponible
