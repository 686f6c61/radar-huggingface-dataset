# samhv/LightOnOCR-3-0.8B-vi-rot

## Resumen

LightOnOCR-3-0.8B-vi-rot es un ajuste fino (fine-tuning) del modelo LightOnOCR-3-0.8B de LightOn, publicado por el usuario samhv. El modelo base es un sistema de OCR y comprensión documental de tipo image-text-to-text construido sobre la arquitectura Qwen3.5, con aproximadamente 853 millones de parámetros. El ajuste resuelve un problema muy concreto: el modelo base pierde aproximadamente 1 de cada 12 valores monetarios cuando una tabla aparece rotada 90 grados, algo habitual en los informes anuales y estados financieros de empresas cotizadas vietnamitas, donde las tablas anchas se imprimen en horizontal.

Este ajuste mantiene intactas las interfaces del modelo base (mismos modos de prompt, mismo preprocesado, mismo código) y solo modifica los pesos. Se entrenó mediante LoRA de rango 16 aplicado al decodificador y a los bloques de visión, durante 2 épocas, y posteriormente se fusionó en los pesos, por lo que el repositorio contiene un modelo completo y no un adaptador. El resultado es una mejora sustancial en la recuperación (recall) de valores monetarios en tablas rotadas, con un coste mínimo en documentos generales.

Es relevante para equipos que procesan documentación financiera en vietnamita y necesitan extraer tablas numéricas de forma fiable sin renunciar a un modelo pequeño que cabe en hardware modesto. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5, según tag `qwen3_5`) |
| Parametros totales | 852.985.920 (≈0,85 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona ejecución con vLLM 0.30.0) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LightOnOCR-3-0.8B: un transformer multimodal de tipo image-text-to-text con un codificador visual y un decodificador de lenguaje, etiquetado en Hugging Face con la arquitectura `qwen3_5`. El ajuste se realizó con LoRA de rango 16 sobre el decodificador y los bloques de visión, durante 2 épocas, y luego se fusionó en los pesos finales.

La estrategia de entrenamiento es destacable por su enfoque de autoetiquetado: las etiquetas provienen del propio modelo base. Como el modelo base lee bien una tabla cuando la página está en vertical, el autor tomó esa lectura en vertical como etiqueta, rotó la imagen y entrenó al modelo para que produjera la misma salida sobre la versión rotada. Solo se conservaron las etiquetas cuyos valores monetarios coincidían exactamente con la capa de texto del PDF. No se usó modelo profesor ni etiquetado manual. El conjunto de entrenamiento consta de 1.488 páginas construidas a partir de 134 tablas rotadas, todas procedentes de informes públicos de empresas vietnamitas cotizadas.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre páginas de documentos, incluyendo texto y estructura.
- Comprensión de tablas, con extracción fiable de valores numéricos y monetarios, incluyendo tablas rotadas 90 grados.
- Procesamiento de documentos financieros: informes anuales y estados financieros de empresas vietnamitas.
- Manejo de dobles páginas (spreads) con combinaciones de página vertical y tabla rotada, o dos tablas rotadas en un mismo pliego.
- Capacidad conversacional y de instrucciones heredada del modelo base (tag `conversational`).
- Soporte bilingüe vietnamita-inglés.
- Modos de prompt y preprocesado idénticos a los del modelo base (mismos snippets de Transformers y vLLM, cambiando solo el identificador del modelo).
- No se documenta en la información disponible soporte explícito de tool calling, agentes o modos de razonamiento extendido.

## Casos de uso

- Extracción de estados financieros de empresas cotizadas vietnamitas: el modelo lee tablas rotadas de informes anuales con un recall del 99,4 % en pliegos con página vertical y tabla rotada, lo que permite automatizar la captura de cifras contables que de otro modo requerirían revisión manual.
- Digitalización de informes anuales con tablas anchas: muchas tablas financieras se imprimen en horizontal para caber en la página; este ajuste mantiene la precisión incluso en ese formato, reduciendo la pérdida de valores que sufre el modelo base.
- Procesamiento por lotes de PDF nativos de empresas: al ejecutarse con vLLM, permite servir el modelo en pipelines de extracción masiva de documentos financieros con un modelo de menos de 1 B de parámetros.
- Control de calidad de extracción numérica: la alta precisión (98,3 % en las 68 páginas difíciles) lo hace adecuado como extractor primario en flujos donde los valores monetarios deben cuadrar con la capa de texto del PDF.
- Análisis comparativo de informes de distintos emisores: el modelo generaliza a emisores no vistos en entrenamiento, útil para agregar datos de múltiples compañías cotizadas.
- Procesamiento de documentación en inglés con tablas numéricas: en el caso de prueba de tonelaje portuario de USACE (150 puertos) ambos modelos aciertan todos los valores, por lo que sirve también para documentos ingleses con tablas simples.
- Extracción de tablas en pliegos con dos tablas rotadas: cubre el escenario de dobles páginas con dos tablas giradas, con un recall del 99,1 %.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre emisores no vistos en entrenamiento, misma máquina para ambos modelos, temperatura 0 y máximo 8.192 tokens. "Recall" es la proporción de valores monetarios de la capa de texto del PDF que aparecen en la salida.

| Test | Base | Este modelo |
|---|---|---|
| Pliego de dos páginas, página vertical + tabla rotada (124 páginas), recall | 90,8 % | 99,4 % |
| Pliego de dos páginas, tabla rotada + página vertical (83 páginas), recall | 92,6 % | 99,1 % |
| Dos tablas rotadas en un pliego (41 páginas), recall | 92,5 % | 99,1 % |
| Tabla rotada sola, 1448 px, recall | 96,2 % | 99,5 % |
| Tabla rotada sola, 1152 px, recall | 90,9 % | 94,1 % |
| Dos páginas verticales (control), recall | 98,4 % | 100 % |
| Pliegos reales de informes anuales con texto rotado (42 páginas), recall | 96,3 % | 99,2 % |
| 68 páginas difíciles, recall / precision | 99,4 % / 91,3 % | 99,8 % / 98,3 % |

En documentos generales (OmniDocBench v1.6, 1.651 páginas, evaluador oficial sin CDM, salida cruda del modelo):

| Métrica | Base | Este modelo |
|---|---|---|
| Distancia de edición de texto (menor es mejor) | 0,0821 | 0,0824 |
| TEDS de tablas | 79,52 | 78,75 |
| Distancia de edición de orden de lectura | 0,1733 | 0,1708 |

El autor advierte que estos valores absolutos provienen de su propia ejecución con salida cruda y pueden ser inferiores a los publicados; lo relevante es la comparación entre columnas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,85 B de parámetros, en fp16 los pesos ocupan aproximadamente 1,7 GB (tamaño del repositorio), por lo que la inferencia requiere poco más que esa cifra más las activaciones y el procesamiento de imagen.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabe holgadamente en GPUs de consumo actuales.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros (≈0,85 B); no se detallan modelos concretos.
- Opciones de despliegue: el autor confirma ejecución con vLLM 0.30.0 y remite a los snippets de Transformers y vLLM del modelo base. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samhv/LightOnOCR-3-0.8B-vi-rot | ≈0,85 B | no disponible | OCR documental, tablas rotadas en vietnamita | Apache 2.0 | Hugging Face |
| lightonai/LightOnOCR-3-0.8B (base) | ≈0,85 B | no disponible | OCR documental general | Apache 2.0 | Hugging Face |

El modelo base es la alternativa directa y obligada comparación: comparte arquitectura, tamaño y licencia, y solo difiere en los pesos. Frente a él, este ajuste mejora el recall en tablas rotadas (por ejemplo, de 90,8 % a 99,4 % en pliegos con página vertical y tabla rotada) y empeora ligeramente en documentos generales (TEDS de tablas de 79,52 a 78,75). No se dispone de información sobre otros modelos comparables de OCR en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se ha probado con páginas de PDF nativos (born-digital); los escaneos reales con tablas rotadas no se han evaluado.
- El conjunto de test reservado tiene pocos emisores: 5 para las páginas recombinadas y 9 para los pliegos reales, lo que limita la robustez estadística de los resultados.
- Una tabla rotada renderizada a baja resolución (1.152 px en el lado largo) sigue siendo débil, con un recall del 94,1 %.
- El modelo entra en bucles en algunas páginas donde el base no lo hace (3 de 344 pliegos reales), aunque elimina 8 bucles que tenía el base; conviene detectar páginas que alcanzan el límite de tokens y reprocesarlas.
- En documentos generales es ligeramente peor que el base; para libros chinos, diapositivas o revistas, el modelo base es la mejor opción.
- No se documentan sesgos específicos, pero al entrenarse sobre informes de empresas vietnamitas cotizadas puede tener un dominio limitado fuera de ese tipo de documento.
- Riesgo de alucinación inherente a los modelos generativos: aunque el entrenamiento filtra etiquetas contra la capa de texto del PDF, la salida debe validarse en producción.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial; el autor atribuye todo el mérito del modelo base a LightOn.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samhv/LightOnOCR-3-0.8B-vi-rot
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
