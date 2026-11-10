# SkillScreen/SkillScreen-2B-Package

## Resumen

SkillScreen-2B-Package es un modelo de clasificación de texto especializado en la detección de "skills" maliciosas para agentes de IA. Lo desarrolla el equipo SkillScreen (Jerrold Huang, Junwei Quan, Saiyue Lyu, Zihan Guo y Yingqiang Ge) y se distribuye como un paquete de despliegue completo que incluye pesos fusionados, el adaptador LoRA original y los puntos de operación congelados. El modelo parte de OpenJev 2B (una variante de Qwen 3.5 de 2B) y se afina con un cabezal de clasificación NLI para emitir, en un único forward pass, una puntuación de malignidad y una decisión de revisión.

El problema que resuelve es concreto: los agentes de IA basados en ficheros `SKILL.md` y otros artefactos de texto pueden incorporar instrucciones maliciosas (exfiltración de datos, ejecución de comandos, prompt injection). SkillScreen analiza esos paquetes de texto sin ejecutarlos y decide si son maliciosos, con un enfoque de alto recall pensado para triaje previo. La relevancia actual está en la proliferación de ecosistemas de agentes que consumen skills de terceros y necesitan una capa de seguridad automatizada antes de habilitarlas.

El modelo tiene 2.213.247.808 parámetros, una ventana de contexto de 32.768 tokens y se publica bajo licencia Apache-2.0. El repo ocupa 4,5 GB e incluye el runtime de inferencia, los umbrales de decisión y las predicciones out-of-fold para auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen 3.5 2B) con cabezal de clasificación NLI |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el paquete verifica BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); CC BY 4.0 (documentación y predicciones) |
| Formato de pesos | safetensors (pesos fusionados) + adaptador LoRA incluido |

## Arquitectura y entrenamiento

El modelo se inicializa desde OpenJev 2B (rama `qwen3.5-2b-nli-v5`) y se afina durante una época con semilla 42, LoRA de rango 8 y un cabezal de clasificación NLI entrenable. La tarea se formula como inferencia de lenguaje natural: la hipótesis fija es "This AI agent skill is malicious." y la puntuación es la salida softmax de entailment, no una probabilidad calibrada de forma independiente. El texto del paquete se ordena como `SKILL.md`, código, configuración, documentación y texto masivo, y los ficheros se leen como texto sin ejecutarse nunca.

El entrenamiento usa los 11.831 registros elegibles de SkillScreen-Data en una revisión fijada, con etiquetas heredadas de benchmarks upstream. La evaluación publicada es out-of-fold (tres folds) sobre 11.831 skills (6.436 maliciosas y 5.395 benignas), con los umbrales seleccionados sobre las predicciones agrupadas y transferidos al modelo final reentrenado con todos los datos. El autor advierte explícitamente que esos resultados describen el procedimiento OOF, no un test independiente del refit final.

## Capacidades

- Clasificación binaria de malignidad de paquetes de skills de agentes (ficheros `SKILL.md` y texto de soporte).
- Emisión conjunta en un forward pass de una puntuación de malignidad y una decisión de revisión.
- Puntos de operación congelados: umbral nativo 0.5 y umbral de 99% de recall OOF (~0.287766).
- Lectura de paquetes completos con ordenación determinista de ficheros y reporte de ficheros retenidos, parciales y omitidos.
- Truncado controlado de entradas por encima de 32.768 tokens preservando la hipótesis.
- Modo `--inspect` para listar ficheros de entrada sin cargar el modelo.
- No ejecuta el código analizado; el escaneo es puramente textual.
- No dispone de tool calling, agentes multi-paso, visión ni audio: es un clasificador, no un modelo generativo de propósito general.

## Casos de uso

- Triaje de skills de terceros en un marketplace o registro de agentes: antes de publicar o habilitar una skill, el escáner procesa el paquete y devuelve una puntuación; el umbral de 99% de recall OOF permite derivar a revisión humana solo los casos dudosos, reduciendo carga manual.
- Puerta de seguridad en CI/CD de repositorios de skills: integrar `scan.py` como paso previo al despliegue para bloquear paquetes que superen el umbral de malignidad, con el reporte JSON como artefacto de auditoría.
- Monitorización de skills ya instaladas en un agente en producción: escaneo periódico de los paquetes presentes en disco para detectar modificaciones sospechosas en `SKILL.md` o en ficheros de configuración.
- Investigación en seguridad de agentes: el paquete incluye predicciones OOF por skill (`evaluation-oof.csv`) y métricas completas, útiles para reproducir y comparar metodologías de detección.
- Filtrado previo en pipelines de curación de datasets de skills: descartar automáticamente ejemplos maliciosos antes de usarlos en entrenamiento o evaluación de agentes.
- Despliegue local en entornos con requisitos de privacidad: el escaneo corre íntegramente en local sobre una GPU CUDA con BF16, sin enviar el contenido de las skills a servicios externos.

## Benchmarks y rendimiento

Resultados out-of-fold publicados por el autor (tres folds, 11.831 skills):

| Punto de operación | Umbral | Recall | FPR benigno | Precision | F1 |
|---|---:|---:|---:|---:|---:|
| Nativo 0.5 | 0.500000 | 98,93% | 0,33% | 99,72% | 99,32% |
| 99% recall OOF | 0,287766 | 99,01% | 0,35% | 99,70% | 99,35% |

Métricas agregadas: AUPRC (average precision) 0,9990 y AUROC 0,9985.

Advertencia del autor: las puntuaciones OOF provienen de modelos de fold entrenados sin el grupo de contenido de cada skill; los umbrales se seleccionaron sobre esas predicciones agrupadas y se transfirieron al modelo final. No constituyen un test independiente del refit y el recall y el FPR pueden variar en colecciones nuevas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 2,21B parámetros en BF16 el peso ronda los 4,4 GB, por lo que se necesita margen adicional para activaciones y contexto largo.
- GPU de referencia del autor: A100 80GB, donde se verifican el runtime incluido y el límite de contexto completo.
- Requisitos de software: Linux, Python 3.12 y GPU CUDA con soporte BF16.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño de pesos sería viable en GPUs con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: runtime propio del paquete (`scan.py`) sobre `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación cualitativa con alternativas de la misma categoría (clasificadores de seguridad para agentes) no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SkillScreen-2B-Package | 2,21B | 32.768 | Apache-2.0 | Hugging Face |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados publicados son out-of-fold y no un test independiente del modelo final; el rendimiento en colecciones nuevas puede diferir.
- Una puntuación por debajo del umbral significa "sin alerta del modelo", no una certificación de seguridad.
- La puntuación es la salida softmax de entailment, no una probabilidad calibrada; los umbrales deben usarse tal como se publican.
- Entradas superiores a 32.768 tokens se truncan, con posible pérdida de señales maliciosas en paquetes muy grandes.
- El modelo solo analiza texto; no detecta comportamiento malicioso que surja en tiempo de ejecución del código.
- Idiomas soportados no declarados: el rendimiento en skills no inglesas no está documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos negativos y falsos positivos en la clasificación.
- Licencia Apache-2.0 para pesos, código y configuración; documentación y predicciones bajo CC BY 4.0; se aplican los términos del modelo y dataset upstream (OpenJev y SkillScreen-Data).
- El paquete está pensado para Linux con Python 3.12 y GPU CUDA BF16; no se documenta soporte CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Package
- Modelo Markdown: https://huggingface.co/SkillScreen/SkillScreen-2B-Markdown
- Dataset: https://huggingface.co/datasets/SkillScreen/SkillScreen-Data
- Código: https://github.com/JerroldH/SkillScreen
- Paper: https://arxiv.org/abs/2610.17727
- Modelo base (OpenJev 2B): https://huggingface.co/AlexWortega/openjev/tree/a20448012c213128955ca0c693e7c943865cab77/qwen3.5-2b-nli-v5
