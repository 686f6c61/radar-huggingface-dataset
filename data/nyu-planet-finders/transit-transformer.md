# nyu-planet-finders/transit-transformer

## Resumen

Transit Transformer es un modelo basado en transformer desarrollado por el grupo NYU Planet Finders (vinculado a la Universidad de Nueva York) para la clasificación automática de señales de tránsito astronómico en curvas de luz de las misiones Kepler y TESS. El modelo resuelve un problema clásico de la astronomía observacional: distinguir entre planetas confirmados, candidatos, falsos positivos y estrellas sin planeta a partir de señales fotométricas de tránsito, una tarea que tradicionalmente requiere inspección humana y seguimiento espectroscópico.

El modelo sigue un paradigma de preentrenamiento auto-supervisado con reconstrucción enmascarada (masked reconstruction) sobre curvas de luz sin etiquetar de Kepler y TESS, seguido de un ajuste fino supervisado sobre señales de tránsito etiquetadas. La arquitectura del encoder consta de 8 capas con una dimensión de modelo (d_model) de 256, entrenado durante 40.000 pasos en la fase de preentrenamiento. El repositorio ocupa 0,1 GB e incluye tanto los pesos del encoder preentrenado como el clasificador afinado.

Es relevante ahora porque automatiza el triaje de candidatos planetarios en volúmenes de datos que superan la capacidad de revisión manual, y porque su enfoque de preentrenamiento en series temporales astronómicas es reutilizable para otras misiones de tránsito. El modelo se distribuye con licencia MIT y está pensado para integrarse en pipelines de análisis de curvas de luz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) para clasificación de series temporales; 8 capas, d_model 256 |
| Parametros totales | no disponible (pesos del clasificador afinado: 29 MB; encoder preentrenado: 26 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch nativo, `torch.load`) |
| Idiomas soportados | no aplica (modelo de series temporales astronómicas, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickles (`.pt`); configuración en JSON |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 8 capas con dimensión de modelo 256, diseñado para procesar curvas de luz fotométricas como series temporales. La fase de preentrenamiento emplea reconstrucción enmascarada (masked reconstruction) sobre curvas de luz de Kepler y TESS sin etiquetar, durante 40.000 pasos; el checkpoint resultante (`runs/base/ckpt-040000.pt`) contiene únicamente el encoder, con el estado del optimizador eliminado. Posteriormente, el encoder se ajusta de forma supervisada sobre señales de tránsito etiquetadas para producir un clasificador de cuatro clases: planeta, candidato, falso positivo y sin planeta.

Las etiquetas de entrenamiento y evaluación provienen de fuentes consolidadas: para Kepler, del conjunto de entrenamiento del autovetter de DR24 (un "planeta" es un DR24 PC que hoy es un KOI confirmado); para TESS, de las disposiciones TOI (TOI dispositions). La evaluación se realiza sobre conjuntos de test retenidos con divisiones a nivel de estrella (star-level splits), lo que evita fugas de información entre estrellas del mismo sistema. No se especifica en la información disponible el número exacto de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Clasificación de señales de tránsito en cuatro categorías: planeta, candidato, falso positivo y sin planeta.
- Procesamiento de curvas de luz fotométricas de Kepler y TESS como series temporales.
- Preentrenamiento auto-supervisado reutilizable: el encoder puede servir como base para otras tareas de series temporales astronómicas.
- Evaluación con métricas robustas a desbalance de clases (macro F1, balanced accuracy) e intervalos de confianza al 95 %.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general ni audio; su entrada es fotometría de tránsito.

## Casos de uso

- Triaje automatizado de candidatos planetarios: el modelo clasifica señales de tránsito de Kepler y TESS para priorizar qué candidatos requieren seguimiento espectroscópico, reduciendo el coste de revisión manual sobre conjuntos de miles de señales.
- Filtrado de falsos positivos en pipelines de búsqueda: integrado tras la detección de tránsitos, descarta señales compatibles con binarias eclipsantes o variabilidad estelar antes de la inspección humana, usando la clase "false positive" del clasificador.
- Análisis retrospectivo de archivos de Kepler DR24: el modelo puede reetiquetar señales históricas y comparar sus predicciones con las disposiciones DR24 y los KOI confirmados, útil para estudiar sesgos en la confirmación.
- Validación cruzada entre misiones: al entrenarse con datos de Kepler y TESS y evaluarse en conjuntos separados por misión (F1 macro 0,678 en Kepler, 0,663 en TESS), sirve para comparar la transferibilidad de señales entre ambas misiones.
- Base para modelos de series temporales astronómicas: el encoder preentrenado (`runs/base/ckpt-040000.pt`) puede afinarse para tareas relacionadas como detección de variabilidad estelar o clasificación de curvas de luz de otras misiones.
- Visualización y divulgación: el proyecto incluye una interfaz Galaxy UI (rama `Galaxy-UI` del repositorio) que genera un mapa 3D de las estrellas de Kepler marcadas por el modelo, útil para comunicación científica y exploración interactiva de resultados.
- Investigación metodológica: el esquema de preentrenamiento enmascarado sobre fotometría sin etiquetar es un caso de estudio para aplicar auto-supervisión a dominios científicos con pocas etiquetas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de test retenidos con divisiones a nivel de estrella:

| Conjunto de test | n | Macro F1 (IC 95 %) | Balanced accuracy (IC 95 %) |
|---|---|---|---|
| Kepler test | 1.608 | 0,678 (0,651–0,706) | 0,724 (0,694–0,754) |
| TESS test | 892 | 0,663 (0,633–0,694) | 0,747 (0,717–0,778) |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos del clasificador afinado ocupan 29 MB y el encoder preentrenado 26 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU para lotes pequeños.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., weights_only=False)`) y los scripts del repositorio (`evaluate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de clasificación de tránsitos con transformer. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transit Transformer | no disponible (8 capas, d_model 256) | no disponible | Macro F1 0,678 (Kepler) / 0,663 (TESS) | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La distinción entre "planeta" y "candidato" es intrínsecamente difícil: la etiqueta "confirmado" refleja en parte qué objetivos recibieron seguimiento observacional, por lo que una puntuación alta de planeta significa "se parece a los confirmados", no una prueba de que exista un planeta.
- El modelo no recibe como entrada distancia estelar, radio ni Teff; añadir valores que solo existen para estrellas de Kepler permitiría al modelo distinguir entre misiones y sesgar la clasificación.
- Riesgo de alucinación en el sentido de clasificaciones erróneas confiadas: al ser un clasificador, puede asignar alta probabilidad a clases incorrectas en señales atípicas o con ruido.
- Rendimiento moderado: el macro F1 en torno a 0,66–0,68 indica margen de mejora, especialmente en clases minoritarias; no debe sustituir la validación por seguimiento.
- Sesgos de selección derivados de los conjuntos de etiquetas (DR24 autovetter y TOI dispositions), que reflejan las prioridades y sesgos observacionales de cada misión.
- Los checkpoints son pickles de PyTorch y deben cargarse con `torch.load(..., weights_only=False)` solo desde fuentes de confianza, por el riesgo de ejecución de código arbitrario.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el proyecto y verificar la procedencia de los datos de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/nyu-planet-finders/transit-transformer
- Código (rama `transit-transformer`, carpeta `transit_transformer/`): https://github.com/Connor-Codess/MlClub_PlanetFinders
- Interfaz Galaxy UI (rama `Galaxy-UI`): https://github.com/Connor-Codess/MlClub_PlanetFinders/tree/Galaxy-UI
- Datasets `nyu-planet-finders` en Hugging Face: https://huggingface.co/nyu-planet-finders
