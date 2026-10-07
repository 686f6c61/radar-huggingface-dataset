# dimajyg/homemade-jev

## Resumen
dimajyg/homemade-jev es un adaptador LoRA (librería `peft`, formato safetensors) sobre el modelo openbmb/MiniCPM5-2B que convierte ese modelo base en un clasificador de inferencia de lenguaje natural (NLI) de tres clases: `contradiction`, `entailment` y `neutral`. El autor lo publica bajo licencia Apache-2.0, solo en inglés, y ocupa aproximadamente 96 MB, de modo que se distribuye exclusivamente como adaptador: el repositorio no incluye los pesos fusionados con el modelo base, que debe descargarse aparte.

El adaptador se entrenó durante una única época con LoRA de rango 16 en precisión fp32 sobre una combinación de AllNLI (200k), ANLI r3 y WANLI, empleando una A100 de 80 GB durante 71,2 minutos. En la evaluación publicada alcanza una precisión de 0,8885 en MNLI-m (2k, semilla 42), con un ECE de 0,0104 y un Brier de 0,082, lo que indica una calibración razonablemente buena en ese conjunto.

Su relevancia práctica está en tareas de verificación factual y control de fidelidad: comparar una premisa (por ejemplo, un documento recuperado) con una hipótesis (por ejemplo, una afirmación generada) y decidir si se implica, se contradice o es neutral. Es un componente pequeño y barato de ejecutar para pipelines de RAG, fact-checking o filtrado de datos, aunque el propio autor advierte de que el checkpoint actual está en evolución y será sobrescrito por una continuación denominada "hard-mix".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer openbmb/MiniCPM5-2B, con cabeza de clasificación de secuencias de 3 etiquetas (`AutoModelForSequenceClassification`, `num_labels=3`) |
| Parámetros totales | Modelo base de 2B parámetros (según la denominación del repositorio base); adaptador LoRA de rango 16, recuento exacto de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el ejemplo de inferencia del autor trunca a 256 tokens (`max_length=256`) |
| Tipos de cuantización | No disponible; el adaptador se entrenó en fp32 y se distribuye en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el merge del LoRA en el modelo base no está incluido en el repositorio |

## Arquitectura y entrenamiento
El artefacto publicado no es un modelo completo sino un adaptador PEFT de tipo LoRA con rango 16, acoplado a la torre transformer de openbmb/MiniCPM5-2B y sobre una cabeza de clasificación de secuencias configurada con tres etiquetas (`0 contradiction`, `1 entailment`, `2 neutral`, siguiendo el mapeo de dleemiller). El autor no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, contexto nativo), por lo que esos datos figuran como no disponibles. La entrada esperada sigue una plantilla fija: `Premise: {p}\nHypothesis: {h}`, con truncado a 256 tokens en el ejemplo de uso.

El entrenamiento consistió en una única época en fp32 sobre AllNLI 200k más ANLI r3 y WANLI, con LoRA r=16, ejecutado en una A100 de 80 GB en 71,2 minutos. No se menciona en la información disponible el uso de RLHF, DPO ni de otras fases de alineamiento o destilación; tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor indica que una continuación "hard-mix" con ANLI r1/r2, SciTail, QNLI, FEVER y datos de políticas y números sobrescribirá los ficheros actuales, por lo que conviene comprobar el fichero `eval.json` antes de fijar una versión.

## Capacidades
- Clasificación NLI de tres vías: devuelve probabilidades softmax para `contradiction`, `entailment` y `neutral` dado un par premisa-hipótesis.
- Detección de contradicciones y de implicación textual entre dos fragmentos, útil para verificación y control de fidelidad.
- Calibración medida en MNLI-m (ECE de 15 bins igual a 0,0104), aunque el autor advierte explícitamente de que el softmax no debe considerarse calibrado en un dominio nuevo.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling y no implementa agentes ni razonamiento multi-paso en este repositorio.
- Capacidades multilingües: limitadas al inglés según los metadatos de idioma.
- Capacidades especiales: ninguna documentada más allá de la clasificación (no hay modo "thinking", visión ni audio).
- Se integra en el ecosistema transformers y peft mediante el código de carga publicado por el autor.

## Casos de uso
- Verificación de grounding en pipelines RAG: usar el documento recuperado como premisa y la respuesta generada como hipótesis; si la clase predicha es `contradiction`, descartar o regenerar la respuesta. Es adecuado por su coste bajo (adaptador de ~96 MB) y su ECE reducido en el dominio de evaluación.
- Detección de alucinaciones en asistentes: comprobar si cada afirmación generada se implica a partir del contexto de origen, marcando como sospechosas las contradicciones. Requiere aceptar el truncado a 256 tokens por par.
- Filtrado de datasets de entrenamiento: descartar pares de frases contradictorios en corpus de preentrenamiento o de instrucciones, usando la etiqueta `contradiction` como criterio de exclusión.
- Pre-anotación para anotación humana: etiquetar automáticamente pares en tareas NLI, RTE o QNLI y reservar la revisión manual para los casos con baja confianza o clase `neutral`.
- Comprobación de consistencia en bases de conocimiento: comparar pares de tripletas textualizadas o descripciones de una misma entidad para detectar datos contradictorios entre fuentes.
- Moderación y fact-checking asistido: enrutar afirmaciones dudosas contra una base de hechos de referencia y priorizar para revisión humana aquellas que el modelo clasifica como contradictorias.
- Enrutado en atención al cliente: cotejar la consulta del usuario con respuestas candidatas de una FAQ y seleccionar la que se implica (`entailment`) en lugar de la neutral o contradictoria. El idioma soportado es solo inglés, por lo que este caso queda restringido a ese mercado.
- Control de calidad en resúmenes: comparar el resumen (hipótesis) con el artículo original (premisa) para detectar afirmaciones no respaldadas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| MNLI-m (2k, semilla 42) | Accuracy | 0,8885 |
| MNLI-m (2k, semilla 42) | ECE (15 bins) | 0,0104 |
| MNLI-m (2k, semilla 42) | Brier | 0,082 |
| Smoke test "guitar" | P(entailment) | 0,940 |
| Smoke test "refund noul yes" | P(entailment) | 0,462 (el autor lo califica de débil) |

No se han publicado en la información disponible resultados comparativos con otros modelos para esta tarea, ni desgloses por subconjunto de ANLI o WANLI más allá de la combinación de entrenamiento. La evaluación sobre MNLI-m corresponde a un subconjunto de 2.000 ejemplos con semilla 42, según la model card.

## Requisitos de hardware
- Adaptador: ~96 MB en disco (repositorio de 0,1 GB); se carga sobre el modelo base MiniCPM5-2B, que debe descargarse aparte.
- VRAM estimada para el modelo base de 2B parámetros: en torno a 8 GB en fp32 (pesos más activaciones), ~4-5 GB en fp16/bf16, ~2-3 GB en int8 y ~1-2 GB en cuantizaciones de 4 bits. Son estimaciones derivadas del número de parámetros, no medidas publicadas por el autor.
- GPU recomendadas para entrenamiento: el autor usó una A100 de 80 GB en fp32 con LoRA r=16 (71,2 minutos). Para inferencia, una GPU de consumo como la RTX 3060 de 12 GB o la RTX 4090 debería ser suficiente en fp16 o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, siempre que se use el modelo base en precisión reducida o cuantizado; no se documenta una versión GGUF de este adaptador.
- Opciones de despliegue documentadas: `transformers` (con `AutoModelForSequenceClassification`) más `peft` (`PeftModel.from_pretrained`), tal y como muestra el autor. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repositorio, y no se publica el merge del LoRA en el modelo base (el autor lo justifica por límites de memoria de una máquina con 16 GB).
- Demo disponible: un Space en CPU Basic, que el propio autor describe como lento.
- Latencia y throughput: no disponibles; no se publican medidas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento NLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dimajyg/homemade-jev (LoRA sobre MiniCPM5-2B) | Base de 2B, adaptador LoRA r=16 | No disponible; truncado a 256 tokens en el ejemplo | MNLI-m 2k: accuracy 0,8885, ECE 0,0104 | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta; Space de demo en CPU |
| openbmb/MiniCPM5-2B (modelo base sin adaptador) | 2B | No disponible | No aplicable a NLI de 3 clases sin la cabeza ajustada | Apache-2.0 (indicada como licencia del modelo base) | HuggingFace |
| Alternativas de clasificación NLI (por ejemplo, ajustes sobre DeBERTa o RoBERTa) | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye cifras comparativas con otros clasificadores NLI, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias
- Idioma: solo inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Dependencia de plantilla: el modelo espera exactamente el formato `Premise: {p}\nHypothesis: {h}`; cambiar la plantilla puede degradar las predicciones.
- Truncado: el ejemplo de inferencia limita la entrada a 256 tokens, de modo que premisas o hipótesis largas se recortan y parte del contenido queda fuera de la decisión.
- Calibración: el autor advierte explícitamente de que no debe tratarse el softmax como calibrado en un dominio nuevo, pese al ECE de 0,0104 medido en MNLI-m.
- Rendimiento desigual: en pruebas puntuales del autor, el caso "refund noul yes" obtiene 0,462, calificado de débil; el rendimiento en dominios específicos (políticas, números) está pendiente de la continuación "hard-mix".
- Checkpoint en evolución: la ejecución hard-mix sobrescribirá los ficheros actuales; hay que verificar `eval.json` para saber qué versión se está usando.
- Dependencia del modelo base: el repositorio no incluye los pesos fusionados; es necesario descargar openbmb/MiniCPM5-2B y aplicar el adaptador en tiempo de carga.
- Mapeo de etiquetas: el orden `0 contradiction`, `1 entailment`, `2 neutral` es específico y debe respetarse para evitar interpretaciones erróneas de las salidas.
- Sesgos: no se documentan análisis de sesgo propios; los corpus de entrenamiento (MultiNLI/AllNLI, ANLI, WANLI) arrastran sesgos de dominio y de anotación conocidos en la literatura NLI, aunque no se aportan mediciones concretas en esta ficha.
- Alucinación: al ser un clasificador, no genera texto, por lo que el riesgo principal es de clasificación errónea y de falsos positivos o negativos, no de contenido inventado.
- Uso comercial: la licencia Apache-2.0 del adaptador y del modelo base permite uso comercial, pero conviene verificar los términos vigentes de openbmb/MiniCPM5-2B en su repositorio.
- Advertencia de identidad: el autor indica que este artefacto no es "TypeSafe Jev" ni el proyecto `openjev/openjev`; son modelos distintos pese a la similitud de nombre.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/dimajyg/homemade-jev
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Demo (Space): https://huggingface.co/spaces/dimajyg/homemade-jev
- No se han proporcionado otros enlaces (papers, blogs o repositorios adicionales) en la información disponible.
