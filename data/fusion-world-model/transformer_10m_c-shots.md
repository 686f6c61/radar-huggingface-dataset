# fusion-world-model/transformer_10m_c-shots

## Resumen

`transformer_10m_c-shots` es un modelo de mundo (*world model*) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es un transformer de series temporales entrenado para predecir la evolución dinámica de plasmas en reactores de fusión por confinamiento magnético. El checkpoint publicado corresponde a la receta denominada "(c) shots only", es decir, entrenada exclusivamente con datos de disparos (*shots*) experimentales, con un presupuesto de parámetros de 10 millones.

El modelo forma parte de un estudio comparativo más amplio: el autor entrenó 25 configuraciones distintas y publica aquí la que su regla de selección interna clasificó en primer lugar (índice 14), junto con repeticiones del mismo entrenamiento bajo semillas alternativas para evaluar la varianza. El repositorio incluye además el checkpoint exacto utilizado en la publicación (revisión etiquetada `paper`), lo que facilita la reproducibilidad de los resultados del artículo.

Su relevancia es acotada pero específica: los modelos de mundo aplicados a tokamaks permiten simular y predecir el comportamiento del plasma sin ejecutar costosas campañas experimentales o simulaciones MHD completas, lo que resulta útil para control en tiempo real, planificación de escenarios y estudio de transiciones de régimen (por ejemplo, L-H). El modelo está entrenado sobre bases de datos públicas de fusión (FAIR-MAST, HDB5, PR08, entre otras) y se distribuye bajo licencia CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (aplicado a series temporales de diagnostico de plasma) |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de aproximadamente 10 millones de parámetros diseñado para modelar series temporales de diagnóstico de plasma en tokamaks. El modelo se enmarca en la categoría de *world models*: aprende la dinámica del sistema físico a partir de trayectorias observadas y se utiliza para predecir estados futuros del plasma. La model card no detalla el número de capas, dimensión del modelo, número de cabezas de atención ni la longitud de secuencia empleada.

El entrenamiento corresponde a la receta "(c) shots only", que utiliza exclusivamente datos de disparos experimentales. Las fuentes de datos acreditadas incluyen FAIR-MAST (UKAEA), la base de datos internacional HDB5 de confinamiento H-mode (DB5.2.3), la release pública 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transición L-H de TCV. El autor entrenó 25 configuraciones y seleccionó la de índice 14 según su regla de selección interna (`selection.json` contiene las puntuaciones). No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones arquitectónicas específicas más allá del uso de transformer sobre series temporales.

## Capacidades

- Predicción de la evolución temporal de estados de plasma en tokamaks a partir de observaciones previas.
- Modelado de dinámica de sistemas físicos (world model) para simulación y forecasting.
- Entrenamiento específico sobre datos de disparos experimentales de múltiples dispositivos (MAST, Alcator C-Mod, TCV, bases multi-tokamak).
- Reproducibilidad mediante checkpoints multi-semilla (`seed_1.pt`, `seed_2.pt`) para evaluar varianza del entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Predicción de la evolución del plasma en tokamaks: el modelo puede forecasting de estados futuros a partir de secuencias de diagnóstico, útil para anticipar disrupciones o cambios de régimen antes de que ocurran.
- Planificación de escenarios experimentales: permite simular trayectorias de plasma bajo distintas condiciones iniciales para priorizar disparos en campañas experimentales costosas.
- Estudio de transiciones L-H: entrenado parcialmente con la base de datos de TCV sobre transiciones L-H, puede emplearse para analizar condiciones de transición en modelos de confinamiento.
- Control en tiempo real (prototipado): al ser un modelo de 10M de parámetros, su coste computacional es bajo y puede integrarse en bucles de control como predictor de dinámica a corto plazo.
- Investigación en modelado de mundo para sistemas físicos: sirve como referencia reproducible (checkpoint `paper`) para comparar arquitecturas de world models en fusión.
- Análisis de sensibilidad y varianza de entrenamiento: los checkpoints multi-semilla permiten estudiar la estabilidad del aprendizaje y la incertidumbre del modelo ante distintas inicializaciones.
- Reproducción de resultados académicos: el checkpoint etiquetado `paper` y los ficheros `config.json`, `selection.json` y `manifest.json` permiten replicar exactamente los experimentos del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a decenas o pocos cientos de MB dado el presupuesto de 10M de parámetros (estimación orientativa; no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media-baja son más que suficientes.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el código de entrenamiento, requiere cargarse con el código del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de mundo para plasmas de tokamak comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni emplearse para tareas de texto.
- Dominio muy restringido: solo válido para dinámica de plasmas en tokamaks dentro de la distribución de los datos de entrenamiento (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV).
- Riesgo de extrapolación fuera de distribución: el comportamiento en dispositivos o regímenes no representados en el entrenamiento no está garantizado.
- La receta "(c) shots only" excluye otras fuentes de datos que podrían mejorar la generalización; el rendimiento puede diferir de otras recetas del mismo estudio.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Requisitos de atribución adicionales derivados de las fuentes de datos (FAIR-MAST, HDB5, PR08, etc.), con citas obligatorias especificadas en la model card.
- No se documentan sesgos, métricas de calibración ni límites de contexto; la ausencia de benchmarks publicados impide evaluar su precisión de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_c-shots
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
