# sawcheet/spongescope

## Resumen

SpongeScope v1 es un modelo de clasificación tabular entrenado para predecir la interacción entre ARN largos no codificantes (lncRNA) y microARN (miRNA). Lo desarrolla el usuario sawcheet y se distribuye bajo licencia MIT en Hugging Face. Con tan solo 697.857 parámetros, está diseñado para ejecutarse en CPU en unos 5 ms por par una vez cacheado el embedding del lncRNA, lo que lo hace extremadamente ligero para tareas de cribado a gran escala.

El problema que aborda es el ranking de candidatos de interacción lncRNA-miRNA para seguimiento experimental. La evaluación se realiza en régimen de *cold-start*: los lncRNA de test no comparten clúster de secuencia MMseqs2 (80% de identidad) con ningún lncRNA de entrenamiento, y el 10% de las familias de semillas de miRNA quedan completamente fuera. En este escenario alcanza AUROC de 0.841 sobre lncRNA fríos y 0.853 combinando lncRNA y miRNA fríos, con una tasa de positivos de base de 0.096.

Es relevante porque el autor documenta de forma explícita y poco habitual los resultados negativos y las limitaciones estadísticas del modelo: la mayor parte de la señal reside en el escáner de sitios de semilla más que en la red neuronal, y las mejoras en precisión no están estadísticamente establecidas. No es un transformer generativo ni un modelo de lenguaje, sino un clasificador tabular de tamaño mínimo orientado a bioinformática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | clasificador tabular con cross-attention entre contexto de sitio y miRNA (no disponible detalle de capas) |
| Parametros totales | 697.857 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular que combina un escáner de sitios de semilla (seed-site scanner) con una capa de cross-attention entre el contexto del sitio y la secuencia del miRNA. Según la model card, la contribución de la red neuronal frente a un modelo gradient-boosted sobre las mismas características es de aproximadamente 0.025 AUPR; eliminar la cross-attention degrada el rendimiento hasta la línea base. Esto indica que la arquitectura es deliberadamente compacta y que el grueso de la señal proviene del escaneo de sitios.

Los datos de entrenamiento proceden de pares lncRNA-miRNA con soporte CLIP de ENCORI (15.962 positivos sobre 1.313 lncRNA y 638 miRNA), transcritos de GENCODE 50 y secuencias maduras de miRBase. Los negativos se construyen en proporción ~8:1, con la mitad emparejados por semilla: el lncRNA contiene un sitio de 7mer para el miRNA pero carece de soporte CLIP. Esta elección de negativos duros evita la circularidad de que el simple conteo de coincidencias de semilla alcanzaría 0.88 AUROC. No se menciona RLHF ni DPO, lógicos en un modelo de clasificación biológica.

## Capacidades

- Predicción de interacción lncRNA-miRNA como clasificación binaria con salida de probabilidad.
- Ranking de candidatos por lncRNA, con precisión@10 de 0.274 frente a una tasa base de 0.096.
- Inferencia en CPU con latencia de ~5 ms por par una vez cacheado el embedding del lncRNA.
- Evaluación calibrada: ECE entre 0.009 y 0.021 según el grupo de test.
- Manejo de escenarios cold-start con generalización a lncRNA y miRNA no vistos en entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking; es un clasificador especializado, no un modelo generativo.

## Casos de uso

- Cribado masivo de candidatos de interacción: dado un lncRNA de interés, puntuar todos los miRNA conocidos y priorizar los de mayor probabilidad para validación por CLIP, aprovechando la latencia de milisegundos por par.
- Priorización experimental en laboratorio: usar precisión@10 de 0.274 para reducir el número de ensayos necesarios, seleccionando diez candidatos y esperando aproximadamente 2.7 interacciones reales frente a una en ausencia del modelo.
- Análisis de lncRNA recién anotados: al operar en régimen cold-start, el modelo puede puntuar transcritos sin homología de secuencia con el conjunto de entrenamiento, útil para genomas o anotaciones nuevas.
- Filtrado previo en pipelines de bioinformática: integrar el clasificador como etapa de ranking antes de análisis de enriquecimiento o validación experimental, dado su bajo coste computacional en CPU.
- Estudio de especificidad por familia de semilla: evaluar pares controlando familias de miRNA retenidas, útil para analizar interacciones mediadas por sitios de semilla concretos.
- Reproducción de benchmarks metodológicos: el repositorio permite reproducir splits deterministas y métricas con intervalos de confianza bootstrap a nivel de lncRNA, útil como referencia para comparar futuros clasificadores de interacción.

## Benchmarks y rendimiento

Evaluación cold-start según la model card:

| Grupo | AUROC | AUPR | Tasa de positivos | ECE |
|---|---|---|---|---|
| lncRNA frío | 0.841 | 0.303 | 0.096 | 0.009 |
| controlado por semilla | 0.753 | 0.312 | 0.163 | 0.016 |
| lncRNA frío + miRNA | 0.853 | 0.297 | 0.087 | 0.021 |

Referencias comparativas internas citadas por el autor: un modelo gradient-boosted sobre las mismas características alcanza 0.824 AUROC; el conteo simple de coincidencias de semilla sin negativos duros alcanza 0.88 AUROC. Las ganancias de AUROC son significativas en 3 de 6 comparaciones pareadas y positivas en las 6; ninguna ganancia de AUPR es significativa. Con 149 lncRNA de test, el intervalo de confianza de AUPR es de ±0.03-0.05.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo corre en CPU.
- GPU recomendadas: innecesarias; cualquier CPU moderna es suficiente.
- Cabe en cualquier hardware consumer, incluidos equipos de sobremesa y portátiles sin GPU.
- Opciones de despliegue: ejecución directa en CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de clasificador.
- Latencia estimada: ~5 ms por par con embedding de lncRNA cacheado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC (cold lncRNA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpongeScope v1 | 697.857 | no aplica | 0.841 | MIT | Hugging Face |
| Gradient-boosted baseline (mismas features) | no disponible | no aplica | 0.824 | no disponible | no disponible |
| Conteo de sitios de semilla | no aplica | no aplica | 0.88 (sin negativos duros) | no disponible | no disponible |

No se dispone de otros clasificadores lncRNA-miRNA públicos en la información proporcionada para una comparación externa.

## Limitaciones y advertencias

- La mejora en precisión no está estadísticamente establecida; solo el ranking (AUROC) muestra ganancias significativas en parte de las comparaciones.
- La mayor parte de la señal proviene del escáner de sitios de semilla, no de la red neuronal; el aporte de la cross-attention es de ~0.025 AUPR.
- Un negativo significa "no observado", no "no interactúa"; la cobertura está sesgada hacia miRNA bien estudiados y líneas celulares ensayadas.
- El contexto tisular no aporta señal (AUROC univariante entre 0.487 y 0.508); la supervisión a nivel de sitio empeoró el rendimiento.
- No está calibrado para uso clínico ni diagnóstico, y no sustituye la validación experimental.
- Licencia MIT permite uso comercial, pero el modelo es una herramienta de ranking biológico, no un sistema de decisión clínica.
- Sesgos de datos derivados de CLIP en líneas celulares concretas; generalización a otros tejidos no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/sawcheet/spongescope
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
