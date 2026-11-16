# fusion-world-model/lstm_1m_c-shots

## Resumen

`lstm_1m_c-shots` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak, entrenado con una arquitectura LSTM y un presupuesto de 1 millón de parámetros. Lo publica el autor `fusion-world-model` en Hugging Face y forma parte de un conjunto de artefactos asociados a un artículo científico sobre modelado de dinámica de plasmas en reactores de fusión. No es un modelo de lenguaje: es un modelo de series temporales orientado a predecir la evolución de variables físicas de un tokamak.

El modelo se entrenó exclusivamente con datos del escenario de receta "(c) shots only", es decir, únicamente con disparos (shots) experimentales, sin combinar con otras fuentes de datos sintéticos o de otro régimen. El repositorio incluye el checkpoint elegido (`final.pt`), réplicas con distintas semillas (`seed_1.pt`, `seed_2.pt`), la configuración de entrenamiento, el registro de selección y controladores PPO entrenados sobre el world model congelado (directorio `e4/`).

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigación en control de plasmas mediante aprendizaje por refuerzo sobre modelos aprendidos, y como ejemplo de entrenamiento de bajo coste (1M de parámetros) sobre datos abiertos de fusión (FAIR-MAST, HDB5, PR08, entre otros). No está pensado para uso general ni para despliegue en producción fuera del ámbito de la investigación en fusión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parámetros totales | 1M (presupuesto de parámetros declarado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 1 millón de parámetros, entrenada como world model de la dinámica de plasmas de tokamak a partir de series temporales de disparos experimentales. La receta de entrenamiento corresponde a la variante "(c) shots only", es decir, el conjunto de datos se limita a disparos reales, sin mezclar con otras fuentes. El checkpoint `final.pt` corresponde a la configuración con índice 19 de las 20 exploradas en una búsqueda de hiperparámetros; la regla de selección de dicha búsqueda la sitúa en primera posición, y los criterios quedan registrados en `selection.json`.

La revisión etiquetada `paper` contiene una configuración de seguimiento (índice 20) entrenada después de la primera elección, más allá del borde del espacio de búsqueda, y que la misma regla también clasifica en primer lugar. Los ficheros `seed_1.pt` y `seed_2.pt` son la misma configuración reentrenada con semillas distintas, lo que permite evaluar la variabilidad del entrenamiento. El repositorio incluye además controladores PPO (receta congelada) entrenados sobre el world model de `final.pt`, uno por tarea y semilla, en el directorio `e4/`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Predicción de series temporales de variables físicas de plasmas de tokamak (world model).
- Modelado de dinámica a partir de disparos experimentales reales (receta "shots only").
- Soporte como entorno simulado para entrenamiento de políticas de control mediante PPO (controladores en `e4/`).
- Reproducibilidad mediante múltiples semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en control de plasmas: el world model permite entrenar políticas PPO en un entorno simulado antes de transferirlas a experimentos reales, reduciendo el coste y el riesgo de los disparos en tokamak.
- Estudio de recetas de entrenamiento en fusión: al estar disponible la configuración exacta (`config.json`) y el registro de selección (`selection.json`), sirve para reproducir y comparar búsquedas de hiperparámetros en modelos de dinámica de plasmas.
- Análisis de variabilidad entre semillas: los checkpoints `seed_1.pt` y `seed_2.pt` permiten cuantificar la sensibilidad del entrenamiento a la inicialización y al orden de los datos.
- Evaluación de controladores preentrenados: el directorio `e4/` contiene controladores PPO ya entrenados sobre el world model congelado, útiles como línea base en experimentos de control.
- Docencia y divulgación en física de fusión computacional: un modelo de solo 1M de parámetros es ligero y fácil de inspeccionar, lo que lo hace adecuado para ilustrar pipelines completos de datos, entrenamiento y evaluación.
- Verificación de integridad de artefactos: `manifest.json` incluye ruta, tamaño y SHA-256 de cada fichero, lo que facilita la validación de descargas y la reproducibilidad en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1M de parámetros el modelo ocupa unos pocos MB en memoria, aunque el tamaño exacto depende de la precisión de los pesos (no especificada).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU de gama baja es más que suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia.
- Opciones de despliegue: al ser checkpoints PyTorch (`.pt`), la carga se realiza con PyTorch directamente; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world models de plasmas de tokamak comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje ni un modelo de propósito general; su uso está restringido al dominio de la fusión por confinamiento magnético.
- Entrenado solo con la receta "(c) shots only", lo que puede limitar su generalización a regímenes no representados en los disparos de entrenamiento.
- Riesgo de alucinación en el sentido de predicciones físicamente inconsistentes fuera de la distribución de entrenamiento; no hay métricas publicadas que acoten este riesgo.
- Sin datos sobre sesgos, cobertura idiomática ni evaluación de robustez.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir igual, pero obliga a licenciar las obras derivadas bajo la misma licencia; hay que revisar además las licencias de los datos de origen (FAIR-MAST CC BY-SA 4.0, HDB5 CC BY 4.0, PR08 sin licencia formal, Open Density Limit Database con licencia de datos CC BY y código MIT, y TCV CC BY 4.0).
- Atribución obligatoria a las fuentes de datos según lo indicado en la model card (FAIR-MAST, HDB5, PR08, Open Density Limit Database y TCV), con las citas correspondientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- El tamaño del repositorio figura como 0.0 GB, lo que puede deberse a un redondeo; conviene verificar los ficheros con `manifest.json` antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_c-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (software): Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664 y Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
