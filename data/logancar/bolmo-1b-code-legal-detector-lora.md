# LoganCar/bolmo-1b-code-legal-detector-lora

## Resumen

Bolmo-1B Code / Legal Detector es un ajuste fino de investigación, desarrollado de forma independiente por el usuario LoganCar, sobre el modelo base allenai/Bolmo-1B de Ai2. No es un modelo generativo al uso: combina un adaptador LoRA (rango 4, alpha 8) con un cabezal de detección y otro de localización de evidencia, entrenados conjuntamente, para puntuar funciones de C/C++ en busca de vulnerabilidades y frases de términos de servicio en busca de cláusulas potencialmente abusivas. La ruta de inferencia no genera explicaciones de forma autorregresiva, sino que produce logits de documento calibrados.

El interés principal está en su planteamiento de calibración y en las métricas publicadas: se reportan AUROC de 0,8946 en clasificación de vulnerabilidades y de 0,9658 en clasificación de frases abusivas, con puntuaciones de Brier y ECE explícitas, algo poco habitual en adaptadores publicados en el Hub. El sistema trabaja a nivel de byte, con ventanas de 1.024 bytes y stride de 768, sobre documentos de hasta 2.048 bytes UTF-8.

Ahora bien, el alcance de la publicación es deliberadamente limitado: solo se distribuyen pesos del adaptador, pesos del cabezal, calibración y utilidades mínimas de carga. El pipeline de preprocesado, la implementación del cabezal y el código de entrenamiento son privados, por lo que este repositorio no constituye un detector autónomo de extremo a extremo ni reproducible sin acceso a ese código. Se trata de material de investigación, no de un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base allenai/Bolmo-1B (código de modelo personalizado, con kernels xLSTM según la model card) más adaptador LoRA y cabezales de detección/evidencia entrenados conjuntamente; no se detalla la arquitectura interna del base |
| Parametros totales | 1.000 millones (base Bolmo-1B) más 1.048.576 parámetros del adaptador LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de 1.024 bytes con stride de 768; documentos evaluados de hasta 2.048 bytes UTF-8. La longitud de contexto del modelo base no está disponible |
| Tipos de cuantizacion | No disponible; el run se realizó y se publica en float32 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, detector_head.safetensors), configuración PEFT en adapter_config.json y calibración en deploy_config.json |

## Arquitectura y entrenamiento

El adaptador se ajustó sobre allenai/Bolmo-1B, fijado al commit 247323b0d35908cf3378f6c10c633c8bde7ecb4a. El LoRA tiene rango 4, alpha 8 y ataca las proyecciones de atención q_proj, k_proj, v_proj y o_proj, con 1.048.576 parámetros entrenables. Junto al adaptador se entrenó un cabezal pequeño de detección y evidencia. El run completado usó float32, semilla 42 y 1.639 pasos de optimizador repartidos en cuatro fases de currículum; el mejor checkpoint se seleccionó sobre validación y los logits de documento se calibraron con escalado de Platt por dominio. El modelo base emplea código de modelo personalizado y kernels xLSTM, y la carga requiere Python >= 3.11 y CUDA con memoria suficiente para float32.

En cuanto a datos, el dominio de código usa registros muestreados de C/C++ procedentes de la distribución de datos de LineVul / BigVul, con todos los CSV oficiales reagrupados en particiones deterministas 80/10/10 basadas en el hash SHA-256 del commit; se trata de un holdout por commit, no por proyecto no visto. El dominio legal usa la tarea UNFAIR-ToS de LexGLUE, reducida a una etiqueta binaria de frase potencialmente abusiva, con los splits oficiales. Los recuentos finales son 3.686 ejemplos de entrenamiento, 1.022 de validación y 2.046 de test, con ejemplos de código balanceados por clase en entrenamiento y prevalencia de test sin balancear. Se aplicaron comprobaciones de texto exacto y de grupo tras el muestreo.

## Capacidades

- Clasificación binaria de funciones de C/C++ como vulnerables o no vulnerables, con un umbral de decisión calibrado de 0,595927.
- Clasificación binaria de frases de términos de servicio como potencialmente abusivas, con umbral de decisión calibrado de 0,315978.
- Puntuación de regiones del código fuente como evidencia: en 37 funciones positivas de test con anotaciones derivadas de parches, se obtuvo un hit rate top-1 / top-3 / top-10 de 35,14 % / 48,65 % / 81,08 % y un MRR de 0,4794.
- Calibración de probabilidades a nivel de documento mediante escalado de Platt por dominio, con coeficientes publicados en deploy_config.json.
- Procesamiento a nivel de byte, con ventanas de 1.024 bytes y stride de 768.
- No genera explicaciones de forma autorregresiva: la ruta de detección devuelve puntuaciones, no texto.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Multilingüismo: no; el modelo está etiquetado únicamente para inglés.
- No se establece capacidad multiarchivo ni de contrato completo: la evaluación se limita a documentos de hasta 2.048 bytes.

## Casos de uso

- Investigación en detección de vulnerabilidades: reproducción y extensión de los resultados publicados sobre el protocolo LineVul/BigVul, útil para estudios comparativos de calibración y de localización débil de evidencia, siempre que se reconstruya el pipeline privado.
- Auditoría de términos de servicio: análisis por frases de contratos y políticas para señalar cláusulas potencialmente abusivas, aprovechando el AUROC de 0,9658 y la prevalencia de positivos del 10,274 % observada en test.
- Triage previo en revisión de código: uso como primera pasada para ordenar funciones candidatas antes de la revisión humana, apoyándose en la baja tasa de falsos positivos reportada (0,0184 en código).
- Curación y etiquetado débil de datasets: generación de etiquetas a nivel de función o de frase para preanotar corpus de seguridad o de contratos, con revisión humana posterior.
- Aprendizaje activo en pipelines SAST internos: incorporación del cabezal como puntuador para seleccionar los casos más informativos que enviar a anotación, aprovechando la calibración publicada.
- Estudios de fiabilidad y calibración: el modelo publica Brier score y ECE a 10 bins, por lo que sirve como caso de referencia en trabajos sobre estimación de incertidumbre en clasificadores de código y texto legal.
- Filtrado de candidatos en herramientas de cumplimiento: integración en un flujo interno que marque frases de contratos para revisión legal, asumiendo que el sistema no es autónomo y requiere el preprocesado original.
- Comparación de arquitecturas byte-level frente a token-level: base para experimentos sobre el impacto de operar a nivel de byte en tareas de detección en código y texto legal.

## Benchmarks y rendimiento

Resultados sobre subconjuntos de evaluación muestreados, no sobre benchmarks completos ni leaderboards:

| Metrica | Clasificacion de vulnerabilidades C/C++ | Clasificacion de frases abusivas en ToS |
|---|---:|---:|
| Ejemplos de test | 1.024 | 1.022 |
| Ejemplos positivos | 47 | 105 |
| Prevalencia de positivos | 4,590 % | 10,274 % |
| AUROC | 0,8946 | 0,9658 |
| Average precision | 0,7656 | 0,8034 |
| F1 | 0,6869 | 0,7544 |
| Precision | 0,6538 | 0,6992 |
| Recall | 0,7234 | 0,8190 |
| Tasa de falsos positivos | 0,0184 | 0,0403 |
| Brier score | 0,02769 | 0,03883 |
| ECE, 10 bins | 0,01995 | 0,02673 |
| Umbral de decision | 0,595927 | 0,315978 |
| TP / FP / FN / TN | 34 / 18 / 13 / 959 | 86 / 37 / 19 / 880 |

Localización de evidencia (37 funciones positivas de test con anotaciones derivadas de parches): hit rate top-1 de 35,14 %, top-3 de 48,65 % y top-10 de 81,08 %; MRR de 0,4794; recall medio de líneas anotadas en top-10 de 62,62 %. Las anotaciones son débiles, derivadas de parches, y las líneas no anotadas quedan en estado desconocido. No hay un F1 verificado sobre spans de byte anotados y las probabilidades de evidencia no están calibradas. La supervisión legal es a nivel de frase y no se reporta resultado de localización fina en ese dominio. La calibración y los umbrales se ajustaron y seleccionaron solo sobre validación; el conjunto de test no se usó para ello. El ECE es específico del estimador de 10 bins y de la prevalencia de la muestra.

## Requisitos de hardware

- Memoria del modelo base en float32: aproximadamente 4 GB solo para los pesos de 1.000 millones de parámetros, sin contar activaciones ni kernels. Estimación derivada del tamaño, no publicada por el autor.
- El autor indica que la memoria en float32 debe caber en la GPU seleccionada; no se especifican modelos concretos de GPU recomendados.
- CUDA es obligatorio; no se documenta soporte de CPU.
- Python >= 3.11 como requisito del cargador.
- Es plausible que quepa en GPU de consumo con 8-12 GB o más de VRAM (por ejemplo, gamas de 12 GB), pero esta afirmación es una estimación a partir del tamaño en float32 y no un requisito confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La única vía soportada es load_adapter.py, que requiere el preprocesado y la implementación del cabezal privados. No existen API pública, demo alojada ni detector llave en mano.
- Latencia y throughput: no disponibles. El autor solo reporta que el sistema original reprodujo los logits exactamente en una prueba de recarga con cuatro documentos, con diferencia absoluta máxima de 0,0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bolmo-1B Code / Legal Detector LoRA (este) | 1.000 M base + 1.048.576 adaptador | 1.024 bytes por ventana; documentos de hasta 2.048 bytes | Clasificación de vulnerabilidades y de cláusulas abusivas, con localización de evidencia | No disponible | Pesos del adaptador y cabezal en el Hub; pipeline de inferencia privado |
| allenai/Bolmo-1B (base) | 1.000 M | No disponible | Generación de texto | No disponible | Pesos base publicados en el Hub |
| LineVul (baseline de los datos de código) | No disponible | No disponible | Detección de vulnerabilidades en C/C++ | No disponible en la información proporcionada | Repositorio público de investigación |
| LexGLUE / UNFAIR-ToS (baseline de los datos legales) | No disponible | No disponible | Clasificación de cláusulas abusivas | No disponible en la información proporcionada | Dataset público |

No se dispone de resultados de benchmarks comparativos directos entre este adaptador y otras alternativas en la información proporcionada, por lo que no se pueden establecer comparaciones de rendimiento más allá de las métricas propias ya listadas.

## Limitaciones y advertencias

- El repositorio no es un detector de extremo a extremo: las puntuaciones publicadas requieren el adaptador, el cabezal y el preprocesado original conjuntamente. Conectar el adaptador a un pipeline de generación de texto no reproduce esos números.
- El código de la aplicación, la implementación del cabezal, el entrenamiento, el preprocesado y los scripts de generación de datos son privados, por lo que no hay reproducibilidad pública completa. Solo se registra la huella dactilar de los datos de entrenamiento en metrics.json, como procedencia y no como garantía.
- No se redistribuyen los pesos base; el cargador solo adjunta el adaptador y carga los tensores y la configuración del cabezal.
- El protocolo de evaluación es un holdout por commit, no por proyecto no visto: el rendimiento en proyectos completamente nuevos no está establecido.
- Los documentos evaluados no superan los 2.048 bytes UTF-8; no hay capacidad demostrada multiarchivo ni de contrato completo.
- Las anotaciones de evidencia son débiles y derivadas de parches; las líneas no anotadas son desconocidas y las probabilidades de evidencia no están calibradas. No hay F1 verificado sobre spans de byte anotados.
- En el dominio legal, la supervisión es a nivel de frase y no se reporta localización fina.
- Las métricas proceden de subconjuntos de evaluación muestreados, no de benchmarks completos ni de leaderboards, y el ECE depende del estimador de 10 bins y de la prevalencia de la muestra.
- El soporte de idioma se limita al inglés, tanto por etiqueta como por los conjuntos de datos usados.
- La licencia no está disponible, por lo que no puede confirmarse la viabilidad de uso comercial.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que la ruta de detección no produce texto, pero sí existe riesgo de falsos positivos y negativos en la clasificación, con tasas reportadas de falsos positivos de 0,0184 en código y 0,0403 en legal.
- Sesgos conocidos: no documentados explícitamente en la información disponible. La composición de los datos (LineVul/BigVul y UNFAIR-ToS) condiciona el dominio de aplicación.
- No hay soporte documentado de tool calling ni de uso como agente; no debe asumirse ninguna capacidad de ese tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoganCar/bolmo-1b-code-legal-detector-lora
- Modelo base: https://huggingface.co/allenai/Bolmo-1B
- Repositorio de LineVul / BigVul: https://github.com/awsm-research/LineVul
- Dataset LexGLUE (tarea UNFAIR-ToS): https://huggingface.co/datasets/coastalcph/lex_glue
- Artefactos incluidos en el repositorio del modelo: adapter_model.safetensors, adapter_config.json, detector_head.safetensors, deploy_config.json, metrics.json, load_adapter.py, requirements.txt, artifact_manifest.json
