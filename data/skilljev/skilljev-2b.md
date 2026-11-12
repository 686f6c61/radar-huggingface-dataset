# SkillJev/SkillJev-2B

## Resumen

SkillJev-2B es un modelo de clasificación de texto especializado en seguridad de agentes de IA. Desarrollado por SkillJev, un equipo del programa MScAC de la Universidad de Toronto en colaboración con TrendAI, su función es analizar ficheros `SKILL.md` (las definiciones de habilidades que consumen agentes basados en LLM) y devolver, en un único forward pass, una puntuación de maliciosidad y una decisión de revisión. El modelo parte de OpenJev 2B, un backbone Qwen3.5 de 2B parámetros afinado para NLI, y se ha especializado mediante LoRA y una cabeza de clasificación de entailment.

La relevancia del modelo radica en que ataca un vector de ataque emergente: los skills de agente son texto que el agente interpreta como instrucciones, lo que abre la puerta a inyección de prompts, exfiltración de datos o ejecución de comandos. SkillJev convierte esa revisión en una tarea de inferencia de lenguaje natural (NLI), planteando la hipótesis fija "This AI agent skill is malicious." y midiendo la probabilidad de entailment.

El modelo tiene 2.213.247.808 parámetros, un contexto operativo de 8.192 tokens (el texto que excede se trunca conservando la hipótesis) y se distribuye con pesos completos fusionados, el adaptador LoRA original y un script de puntuación local. La evaluación out-of-fold sobre 13.514 skills reporta AUROC 0.9946 y AUPRC 0.9966 en el punto de operación por defecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabeza de clasificación NLI; tag `qwen3_5` |
| Parámetros totales | 2.213.247.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrada truncada más allá, conservando la hipótesis) |
| Tipos de cuantización | no disponible (el release se verifica en BF16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); documentación y predicciones CC BY 4.0 |
| Formato de pesos | safetensors (transformers); incluye adaptador LoRA en `adapter/` |
| Pipeline | text-classification |
| Modelo base | AlexWortega/openjev (qwen3.5-2b-nli-v5) |
| Dataset de entrenamiento | SkillScreen/SkillScreen-Data (revisión fijada) |
| Tamaño del repo | 8,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 2B parámetros, inicializado desde OpenJev 2B, un checkpoint ya afinado para NLI. Sobre esa base se añade una cabeza de clasificación de entailment entrenable y se aplica LoRA con rango 8 durante una única época con semilla 42. La formulación es de NLI: el texto del skill se empareja con la hipótesis fija "This AI agent skill is malicious." y la puntuación final es la salida softmax de la clase entailment, no una probabilidad calibrada de forma independiente.

El entrenamiento usa todos los registros elegibles del dataset público SkillScreen-Data en su revisión fijada, con etiquetas heredadas de los benchmarks de origen. La evaluación es de tres folds out-of-fold sobre 13.514 skills (7.500 maliciosos y 6.014 benignos), agrupando por contenido para evitar filtración. Los umbrales se seleccionaron sobre predicciones OOF agrupadas y se transfirieron al modelo final entrenado con todos los registros. El release v0.1.0 reutiliza sin cambios los pesos, el pipeline de entrada y los umbrales de SkillScreen-2B-Markdown v0.1.0. El escáner lee el texto sin ejecutarlo.

## Capacidades

- Clasificación binaria de maliciosidad de ficheros `SKILL.md` de agentes de IA en un solo forward pass.
- Salida de puntuación (probabilidad de entailment) y decisión de revisión según umbral configurable.
- Punto de operación por defecto (umbral 0.5) y punto de alta recall (umbral 0.011642) para distintos compromisos entre recall y falsos positivos.
- Manejo de entradas largas hasta 8.192 tokens con truncación registrada en la salida.
- Inspección de entrada sin cargar el modelo mediante la opción `--inspect`.
- Escaneo seguro: el contenido se analiza como texto, nunca se ejecuta.
- No se documentan capacidades de generación abierta, tool calling, agentes multi-paso, visión ni audio; el uso previsto es exclusivamente clasificación.

## Casos de uso

- Puerta de seguridad en pipelines de publicación de skills: integrar `scan.py` como paso previo a aceptar un `SKILL.md` en un registro interno, bloqueando o marcando los que superen el umbral por defecto.
- Revisión de terceros en marketplaces de agentes: puntuar automáticamente skills enviados por la comunidad y priorizar la revisión humana de los casos cercanos al umbral.
- CI/CD de repositorios de agentes: ejecutar el escáner en cada pull request que modifique un `SKILL.md` y fallar el build si la puntuación supera el umbral de alta recall.
- Monitorización de skills ya desplegados: reescanear periódicamente definiciones en producción para detectar modificaciones sospechosas introducidas después de la aprobación inicial.
- Triaje en equipos de respuesta a incidentes: clasificar lotes de skills sospechosos y ordenar la cola de análisis por puntuación, usando el CSV de predicciones por skill.
- Investigación en seguridad de agentes: generar etiquetas de maliciosidad sobre nuevas colecciones para estudiar patrones de ataque, con la advertencia de que el rendimiento puede variar en distribuciones nuevas.
- Filtrado previo en sandboxes de evaluación: descartar skills de alto riesgo antes de ejecutarlos en un entorno de pruebas con herramientas reales.

## Benchmarks y rendimiento

Evaluación out-of-fold de tres folds sobre 13.514 skills (7.500 maliciosos, 6.014 benignos):

| Punto de operación | Umbral | Recall | FPR benigno | Precisión | F1 |
|---|---:|---:|---:|---:|---:|
| Por defecto | 0,500000 | 96,96% | 0,88% | 99,28% | 98,10% |
| Alta recall | 0,011642 | 99,00% | 15,71% | 88,71% | 93,57% |

Métricas agregadas: AUPRC (average precision) 0,9966 y AUROC 0,9946. Son resultados OOF, no un test independiente del modelo final; el rendimiento puede cambiar en colecciones nuevas. No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los 2,21B parámetros ocupan aproximadamente 4,4 GB de pesos; con overhead de activaciones y contexto de 8K conviene reservar del orden de 8-10 GB. Con cuantización de 8 bits bajaría a unos 2,2 GB y en 4 bits a unos 1,1 GB, aunque no se documentan formatos cuantizados en el release.
- GPU recomendadas: el autor verificó el runtime y el límite de contexto completo en una A100 80GB. Cualquier GPU con soporte BF16 y suficiente VRAM debería servir; no se detallan otras configuraciones probadas.
- GPU de consumo: por tamaño de pesos, es plausible en tarjetas con 8 GB o más en BF16 (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está verificado por el autor.
- Despliegue: el release incluye `scan.py` y `requirements/inference.txt` sobre `transformers` y `huggingface_hub` 1.33.0; requiere Linux, Python 3.12 y CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El modelo base OpenJev 2B (AlexWortega/openjev, qwen3.5-2b-nli-v5) es el punto de partida, pero no se ofrecen métricas comparativas frente a él ni frente a otros clasificadores de seguridad.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| SkillJev-2B | 2,21B | 8.192 | Clasificación NLI de maliciosidad de skills | Apache-2.0 | AUROC 0,9946, AUPRC 0,9966 (OOF) |
| OpenJev 2B (base) | no disponible | no disponible | NLI general | no disponible | no disponible |
| Alternativas de clasificación de seguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados son out-of-fold sobre el dataset de entrenamiento; no hay test independiente del modelo final y el rendimiento puede degradarse en colecciones nuevas.
- La puntuación es la salida softmax de entailment, no una probabilidad calibrada de forma independiente.
- Una puntuación baja no certifica que un skill ni su paquete sean seguros.
- Las entradas de más de 8.192 tokens se truncan, por lo que contenido malicioso situado después del corte puede pasar desapercibido.
- El umbral de alta recall eleva los falsos positivos sobre benignos hasta el 15,71%.
- No se documentan idiomas soportados; el comportamiento en skills en idiomas distintos del inglés es desconocido.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a evasión adversarial.
- Licencia Apache-2.0 para pesos, código y configuración, y CC BY 4.0 para documentación y predicciones, con los términos del modelo base y del dataset upstream aplicables; revisar `THIRD_PARTY_NOTICES.md` antes de uso comercial.
- El release v0.1.0 debe usarse con `scan.py`; `score.py` y la calibración pertenecen a la versión v1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillJev/SkillJev-2B
- Modelo base OpenJev 2B: https://huggingface.co/AlexWortega/openjev/tree/a20448012c213128955ca0c693e7c943865cab77/qwen3.5-2b-nli-v5
- Dataset de entrenamiento: https://huggingface.co/datasets/SkillScreen/SkillScreen-Data/tree/d59aabbd7e0e8d95b464a2d335f36e948577b832
- Release upstream SkillScreen-2B-Markdown v0.1.0: https://huggingface.co/SkillScreen/SkillScreen-2B-Markdown/tree/v0.1.0
- Release anterior v1: https://huggingface.co/SkillJev/SkillJev-2B/tree/v1
