# fusion-world-model/gru_1m_h-task-outputs

## Resumen

`gru_1m_h-task-outputs` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak entrenado con una arquitectura de red recurrente GRU y un presupuesto de 1 millón de parámetros. Lo publica el colectivo `fusion-world-model` y su propósito es aprender la dinámica temporal de plasmas en reactores de fusión para predecir su evolución y servir de entorno simulado donde entrenar controladores mediante aprendizaje por refuerzo. La receta concreta de este repositorio es la etiquetada como `h` (reward-only, "task outputs"), es decir, una variante de entrenamiento centrada en la señal de recompensa de la tarea.

El modelo se apoya en datos experimentales de tokamak de fuentes públicas como FAIR-MAST (UKAEA), la base de datos internacional HDB5 de confinamiento en modo H, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transición L-H de TCV. El repositorio incluye además un directorio `e4/` con controladores entrenados con PPO congelado sobre el world model de `final.pt`, lo que da una idea de su uso previsto: no como modelo generativo de texto, sino como pieza de un pipeline de investigación en control de plasma.

La relevancia de este checkpoint es acotada y muy específica: es el artefacto reproducible de un paper sobre world models aplicados a fusión, con trazabilidad de revisiones, semillas y reglas de selección. No es un modelo de propósito general ni un LLM; su interés está en la comunidad de fusión, control y series temporales científicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con puertas) |
| Parametros totales | 1M (presupuesto de parámetros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una GRU, una red recurrente con puertas de actualización y reset, con un presupuesto de 1 millón de parámetros. La model card menciona que el checkpoint principal del paper usa la configuración ganadora del piloto de diseño de la GRU (2 capas, dropout 0.1 y un warmup de 4.000 pasos), mientras que la revisión publicada en este repositorio corresponde al diseño original de la GRU. El fichero `final.pt` es la configuración de índice 11 entre las 20 que entrenó la búsqueda, seleccionada por la regla de selección propia del estudio, cuyas puntuaciones se guardan en `selection.json`.

El entrenamiento se realizó sobre datos de diagnóstico de tokamak procedentes de FAIR-MAST, HDB5, PR08, la Open Density Limit Database (Alcator C-Mod) y la base de datos L-H de TCV. La receta `h` se describe como "reward-only" y se distingue de una receta anterior (`old_recipe`) que imponía un límite inferior en la dispersión predicha, no limitaba la verosimilitud y carecía de warmup de learning rate. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; el entrenamiento de controladores PPO aparece en el directorio `e4/`, no en el propio world model.

## Capacidades

- Predicción de la evolución temporal de variables de plasma de tokamak (series temporales científicas).
- Modelado de dinámica de confinamiento en modo H y de transiciones L-H.
- Uso como entorno simulado ("world model") para entrenar controladores con PPO, como demuestra el directorio `e4/`.
- Reproducibilidad: incluye semillas alternativas (`seed_1.pt`, `seed_2.pt`), configuración (`config.json`), registro de selección (`selection.json`) y manifiesto con SHA-256 (`manifest.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo de visión, audio ni texto generativo.

## Casos de uso

- Investigación en control de plasma: usar el world model como entorno barato y rápido para entrenar políticas de control con PPO antes de validarlas en simuladores de mayor fidelidad o en el tokamak real; el directorio `e4/` ya contiene controladores entrenados de este modo.
- Estudio de transiciones L-H: modelar la dinámica de transición entre régimenes de confinamiento a partir de las bases de datos TCV y HDB5 para analizar condiciones de disparo.
- Predicción de límites de densidad: emplear los datos de Alcator C-Mod para estudiar la aproximación al límite de densidad y anticipar disrupciones.
- Reproducción de resultados de paper: cargar `final.pt` con la revisión `release-2026.11.13rc2` para replicar las filas de la GRU reportadas en la publicación.
- Análisis de sensibilidad a la semilla: comparar `seed_1.pt` y `seed_2.pt` con `final.pt` para cuantificar la varianza del entrenamiento en un presupuesto de 1M de parámetros.
- Comparación de recetas de entrenamiento: contrastar la receta `h` con `old_recipe/final.pt` para evaluar el efecto del warmup, el límite de verosimilitud y el suelo de dispersión predicha.
- Prototipado rápido en CPU: con 1M de parámetros, el modelo es viable para experimentos de series temporales en hardware modesto, aunque no se publican latencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño (1M de parámetros, aproximadamente 4 MB en fp32); no se publica una cifra oficial.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer es suficiente.
- Cabe en GPU consumer: sí, con amplio margen (incluso en CPU).
- Opciones de despliegue: al ser un fichero PyTorch (`.pt`) guardado por el código de entrenamiento, requiere cargar la definición de la GRU del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fusion-world-model/gru_1m_h-task-outputs` | GRU | 1M | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de world models de plasma de tokamak con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con bases de datos de tokamaks concretos (MAST, Alcator C-Mod, TCV, HDB5, PR08); su generalización a otras máquinas o regímenes no está documentada.
- Riesgo de alucinación: como modelo predictivo de series temporales, puede generar trayectorias plausibles pero físicamente incorrectas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no aplica en sentido lingüístico; no se documenta la ventana temporal soportada.
- Restricciones de licencia: CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su integración en productos propietarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- La model card advierte de que `old_recipe/final.pt` no es el modelo reportado en el paper; debe usarse `final.pt` con la revisión `release-2026.11.13rc2` para reproducir resultados.
- Algunas fuentes de datos tienen licencias o condiciones particulares (PR08 sin licencia formal pero con requisito de cita; Open Density Limit Database con versión de licencia no especificada), que deben respetarse en cualquier uso derivado.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_h-task-outputs
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), Jackson et al. 2024, SoftwareX 27, 101869: doi:10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: doi:10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): doi:10.5281/zenodo.14996664
- TCV L-H transition database, Labit et al., Plasma Phys. Control. Fusion (2025): doi:10.1088/1361-6587/adc8ce
