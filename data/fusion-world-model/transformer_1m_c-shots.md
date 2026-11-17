# fusion-world-model/transformer_1m_c-shots

## Resumen

`transformer_1m_c-shots` es un checkpoint de un modelo de mundo (*world model*) para plasmas de tokamak, desarrollado por el autor `fusion-world-model`. Se trata de un transformer con un presupuesto de 1 millón de parámetros, entrenado con la receta denominada "(c) shots only", es decir, únicamente con datos de disparos (*shots*) experimentales. El modelo aborda el problema de modelar la dinámica temporal de plasmas en reactores de fusión, un dominio con datos escasos y costosos de obtener.

El repositorio contiene el checkpoint elegido (`final.pt`), dos réplicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`), la configuración de entrenamiento (`config.json`), el registro del proceso de selección (`selection.json`) y un manifiesto de integridad (`manifest.json`). La configuración elegida es la de índice 18 de las 30 evaluadas en la búsqueda de hiperparámetros, seleccionada según la regla de selección del propio autor.

Es relevante por su carácter especializado: aplica arquitecturas transformer a series temporales de diagnóstico de tokamak, un nicho donde los modelos de propósito general no ofrecen garantías físicas. Su tamaño reducido (1M de parámetros) lo hace ligero, pero también limita su expresividad. La información pública disponible es escasa y no incluye resultados de benchmarks ni detalles de arquitectura más allá de la etiqueta "transformer".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (sin más detalle disponible) |
| Parámetros totales | 1M (presupuesto declarado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer con un presupuesto de 1 millón de parámetros, según declara el autor. No se especifican en la información disponible el número de capas, dimensión de los embeddings, número de cabezas de atención ni el mecanismo de atención empleado. Tampoco se detalla la tokenización o representación de las series temporales de entrada.

El entrenamiento emplea la receta "(c) shots only", que utiliza únicamente datos de disparos experimentales. Las fuentes de datos citadas incluyen FAIR-MAST (UKAEA), la base de datos HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database (Alcator C-Mod) y la base de datos de transición L-H de TCV. No se indica el número de tokens ni el volumen total de datos de entrenamiento, ni si hubo ajuste por refuerzo o preferencias. La selección del checkpoint se realizó mediante una búsqueda sobre 30 configuraciones, con una regla de selección cuyas puntuaciones se recogen en `selection.json`.

## Capacidades

- Modelado de series temporales de plasmas de tokamak: el modelo está diseñado para predecir o representar la evolución temporal de variables de diagnóstico en un tokamak.
- World model: por su etiqueta, se orienta a modelar la dinámica del entorno (el plasma) para simulación o planificación.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no es un modelo lingüístico).
- No se documenta ningún modo especial (thinking, vision, audio).

## Casos de uso

- Predicción de la evolución temporal de perfiles de plasma: el modelo puede usarse para estimar la trayectoria de variables de diagnóstico a partir de un estado inicial, apoyando la planificación de disparos en tokamaks.
- Simulación rápida de escenarios de operación: al ser un modelo de 1M de parámetros, permite evaluar configuraciones de disparo con un coste computacional bajo frente a simulaciones físicas completas.
- Detección temprana de disrupciones (exploratoria): un world model de la dinámica del plasma puede integrarse en pipelines que anticipen transiciones indeseadas, aunque no hay evidencia publicada de esta capacidad.
- Control y optimización de escenarios: serviría como componente de un lazo de control basado en modelo, prediciendo el efecto de acciones sobre el plasma.
- Estudio de transiciones de confinamiento (L-H): entrenado con datos de TCV, puede emplearse para analizar la dinámica de transición en ese dispositivo.
- Investigación reproducible en modelos de mundo para fusión: al publicar checkpoints, semillas y configuración, permite replicar y comparar recetas de entrenamiento en el dominio.
- Análisis de sensibilidad a semillas: las réplicas `seed_1.pt` y `seed_2.pt` permiten estudiar la varianza del entrenamiento en un dominio con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer; la VRAM necesaria es inferior a 1 GB en precisión completa para los pesos, más el espacio para las activaciones y los datos de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada podría ejecutarlo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM disponible.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`), requiere cargarlo con PyTorch y el código de entrenamiento del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de world models para plasmas de tokamak ni sus especificaciones.

## Limitaciones y advertencias

- Tamaño muy reducido (1M de parámetros): la capacidad de representación es limitada y puede no capturar dinámicas complejas del plasma.
- Entrenado solo con datos de disparos ("shots only"): no incorpora otras fuentes de información que podrían mejorar la generalización.
- Dominio muy restringido: no es un modelo de propósito general; no sirve para tareas de texto, código o visión.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Riesgo de alucinación o predicciones físicamente inconsistentes: al ser un modelo aprendido, puede generar trayectorias que violen restricciones físicas del plasma.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas; hay que revisar las obligaciones de atribución de las fuentes de datos (FAIR-MAST, HDB5, PR08, etc.).
- Datos de entrenamiento con licencias heterogéneas: PR08 no tiene licencia formal y la Open Density Limit Database no especifica la versión de su licencia CC BY; conviene verificar el cumplimiento antes de un uso en producción.
- Sin información sobre sesgos, contexto de entrada ni idioma (no aplica).
- Repositorio con 0 descargas y 0 likes: ecosistema de validación mínimo; el código de inferencia no se incluye en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_c-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
