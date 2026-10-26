# infosecn1nja/laya-soc-ft-lab

## Resumen

`infosecn1nja/laya-soc-ft-lab` es un fine-tune experimental del modelo Laya (`convaiinnovations/laya`, variante `typed-decisions`) orientado a una tarea muy concreta: puntuar alertas de un SOC como verdaderas positivas o benignas. Lo publica el usuario infosecn1nja y se apoya en la librería `laya`, cuyo pipeline no es generativo autorregresivo, sino que produce una probabilidad (`true_positive`) por alerta, según describe el autor al hablar de "non-autoregressive SOC alert ranking".

El modelo tiene 421.293.830 parámetros (fichero `model.safetensors` de unos 807 MB, repo de 0,8 GB) y se ha obtenido con un ajuste *heads-only* de 3 épocas sobre 868 decisiones de alerta procedentes de telemetría de laboratorio de Wazuh. No se entrenó con datos de clientes ni con disposiciones reales de analistas: las etiquetas son una rúbrica de contenido derivada de reglas, algo que el propio autor subraya como limitación crítica.

Su relevancia es doble. Por un lado, documenta un caso de uso poco habitual (clasificación de alertas con un modelo de 421 M en lugar de un LLM generativo) y publica una evaluación honesta con AUROC 1.000 en un split disjunto por reglas, acompañada de la advertencia explícita de que esas cifras no equivalen a precisión en producción. Por otro, sirve como ejemplo de ficha que declara un *gate* de auto-cierre en NO-GO, con calibración deficiente (ECE 0,245) y un split temporal sin positivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; fine-tune *heads-only* sobre el modelo base Laya (`convaiinnovations/laya`, variante `typed-decisions`), descrito por el autor como "non-autoregressive SOC alert ranking" |
| Parámetros totales | 421.293.830 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (derivado de Laya, Apache-2.0; ver `NOTICE`) |
| Formato de pesos | safetensors |
| Salida del modelo | Probabilidad de `true_positive` por alerta; umbral de evaluación 0,99 |
| Librería | `laya` (no estándar; no se documenta compatibilidad con transformers/vLLM) |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El autor no publica la arquitectura interna del modelo base Laya en esta ficha; lo que sí detalla es el procedimiento de ajuste: *heads-only* (solo se entrenan las cabezas, con el cuerpo congelado), 3 épocas y 868 decisiones de alerta de laboratorio. La salida es una probabilidad de `true_positive`, evaluada con umbral 0,99. No se indica el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF, DPO o calibración posterior; de hecho, se explicita que no se incluye calibración por temperatura ("no temperature calibration shipped").

La evaluación se hizo sobre 308 decisiones *rule-disjoint*, es decir, alertas generadas por reglas de Wazuh no vistas durante el entrenamiento (5760, 92154 y 60642): 97 positivas y 211 negativas. El propio autor advierte que las etiquetas provienen de una rúbrica de contenido derivada de reglas, no de disposiciones independientes de analistas, y que un split aleatorio alcanza el 100 % por fuga de información entre reglas, mientras que un split temporal no contiene positivos en el periodo evaluado (las alertas positivas de laboratorio se concentran entre el 18 y el 20 de octubre). No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, SSM ni híbridos).

## Capacidades

- Clasificación binaria de alertas de SOC: emite una probabilidad de `true_positive` por alerta de Wazuh, no texto libre.
- Ranking de alertas: permite ordenar una cola de triaje por probabilidad y aplicar umbrales (el autor evalúa en 0,99).
- Reproducción de un pipeline de *bounded auto-triage* definido en un repositorio separado de política y configuración.
- Operación en modo sombra con revisión humana, según el uso previsto declarado.
- Dominio acotado a telemetría de Wazuh de laboratorio; las reglas de entrenamiento y evaluación son explícitas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Reproducción de la evaluación *rule-disjoint*: cargar el checkpoint y el conjunto de 308 decisiones (97/211) para verificar AUROC, recall, FPR y precisión en el umbral 0,99 antes de plantear cualquier experimento propio.
- Modo sombra en un SOC de laboratorio: puntuar en paralelo las alertas que un analista revisa manualmente, comparar discrepancias y medir deriva sin que el modelo cierre ni escale nada de forma autónoma.
- Priorización de colas de triaje: usar la probabilidad como criterio de ordenación para que las alertas con mayor puntuación se revisen primero, manteniendo siempre la decisión final en el analista.
- Auditoría de reglas de Wazuh: identificar qué reglas generan sistemáticamente puntuaciones altas en texto benigno de laboratorio, útil para depurar ruido en la configuración de detección.
- Investigación sobre clasificadores no autorregresivos frente a LLM generativos: comparar coste, latencia y comportamiento de un modelo de 421 M con enfoques de prompting sobre modelos mayores en la misma tarea de triaje.
- Estudio de calibración y umbrales: con ECE bruto de 0,245, el checkpoint sirve para experimentar con temperatura, isotonic regression u otros métodos y medir su efecto antes de fijar un umbral operativo.
- Docencia y formación de analistas: entorno de laboratorio para explicar cómo se construye y se valida un clasificador de alertas, incluidos los fallos típicos (fuga por regla, splits sin positivos).
- Pruebas de integración de la librería `laya`: validar el pipeline de carga, tokenización y salida de probabilidad en un entorno controlado antes de adoptar la familia de modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Corresponden a etiquetas de rúbrica de contenido sobre datos de laboratorio y **no deben interpretarse como precisión en producción**.

| Métrica | Valor |
|---|---|
| Filas de validación (held-out) | 308 (97 positivas / 211 negativas) |
| AUROC con split disjunto por reglas | 1.000 |
| Recall con umbral 0,99 | 1.000 |
| FPR con umbral 0,99 | 0.000 |
| Precisión con umbral 0,99 | 1.000 |
| ECE bruto (sin calibración por temperatura) | 0.245 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,84 GB en FP16/BF16 (tamaño coherente con el `model.safetensors` de 807 MB), aproximadamente 1,69 GB en FP32 y alrededor de 0,42 GB en INT8 si se cuantiza por cuenta propia.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan pero están sobredimensionadas para 421 M de parámetros.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual; también es viable la inferencia en CPU para volúmenes moderados de alertas.
- Opciones de despliegue: la model card solo declara la librería `laya`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni conversión a GGUF; al no ser un modelo generativo autorregresivo, estos runners probablemente no aplican sin trabajo adicional.
- Latencia y throughput: no disponibles. No se publican medidas de rendimiento por alerta ni de lote.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La única referencia directa es el modelo base, del que esta ficha no incluye especificaciones detalladas.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-soc-ft-lab (este) | 421,3 M | No disponible | Clasificación TP/benigno de alertas Wazuh | Apache-2.0 | Pesos en HF; 0 descargas, 0 likes |
| convaiinnovations/laya (`typed-decisions`) | No disponible | No disponible | Modelo base de la familia Laya | Apache-2.0 (según este derivado) | Pesos en HF |
| Alternativas de triaje con LLM generativo | No disponible en esta búsqueda | No disponible | Triaje de alertas | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo de producción.** El autor declara el *gate* de auto-cierre y el modo "model-only" como NO-GO explícito.
- Las etiquetas son una rúbrica de contenido derivada de reglas, no disposiciones independientes de analistas; la evaluación mide coherencia con esa rúbrica, no acierto real de triaje.
- Riesgo alto de fuga por regla: con un split aleatorio, el propio autor indica que se alcanza un 100 % de acierto por leakage entre reglas del mismo tipo.
- El split temporal no contiene positivos en el periodo de evaluación (las alertas positivas de laboratorio se limitan al 18-20 de octubre), por lo que la generalización temporal no está demostrada.
- Sin calibración por temperatura: ECE bruto de 0,245, lo que hace que la probabilidad no sea directamente interpretable como confianza operativa.
- Una única partición de 308 filas disjunta por reglas; el umbral 0,99 debe revalidarse en cada entorno.
- Entrenado exclusivamente con telemetría de laboratorio; puede no generalizar a la telemetría de otro entorno, con otros formatos de alerta o con otras reglas activas.
- Solo inglés: no se ha validado con alertas en otros idiomas.
- Sesgos: no documentados por el autor; al aprender de texto de alertas de laboratorio, los pesos pueden reflejar patrones idiosincrásicos de ese corpus.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de falsos positivos y falsos negativos por sobreajuste a la forma del texto de la alerta.
- Licencia Apache-2.0 permisiva para uso comercial, pero al ser un derivado de Laya debe conservarse el aviso `NOTICE` y la atribución correspondiente.
- El repositorio no incluye alertas en crudo, hostnames, IP, usuarios ni credenciales; solo pesos, tokenizador y configuración. Cualquier redistribución adicional debería revisarse antes de publicar derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosecn1nja/laya-soc-ft-lab
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Tarjeta de política y configuración del *bounded triage*: https://huggingface.co/infosecn1nja/laya-soc-bounded-triage
