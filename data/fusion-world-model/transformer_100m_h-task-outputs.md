# fusion-world-model/transformer_100m_h-task-outputs

## Resumen

`transformer_100m_h-task-outputs` es un checkpoint de un modelo de mundo (world model) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es un transformer de aproximadamente 100 millones de parámetros entrenado sobre series temporales de diagnóstico de plasmas de fusión, con el objetivo de modelar la dinámica del plasma y predecir su evolución. Se publica como parte del material asociado a un articulo cientifico, con una revision etiquetada `paper` que corresponde al checkpoint exacto evaluado en dicho articulo.

El repositorio contiene la receta identificada como "(h) reward-only (the task outputs)", es decir, una configuracion de entrenamiento orientada a modelar las salidas de tarea (task outputs) mediante una senal de recompensa. El checkpoint principal `final.pt` corresponde a la configuracion de indice 24 de las 30 exploradas por la busqueda de hiperparametros, seleccionada segun la regla de seleccion del propio autor (registrada en `selection.json`). Se incluyen ademas dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza entre ejecuciones.

El modelo es relevante para la comunidad de fusión por control y para investigadores de series temporales cientificas: demuestra el uso de transformers como emuladores/surrogatos de la fisica del plasma, entrenados sobre bases de datos experimentales abiertas (FAIR-MAST, HDB5, PR08, entre otras). Su licencia CC BY-SA 4.0 y el caracter abierto de los datos de origen lo hacen reutilizable, con la obligacion de atribucion y de compartir bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parametros totales | Presupuesto de 100M (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch sin cuantizar) |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un transformer (no se especifica si encoder-only, decoder-only o hibrido) con un presupuesto de 100 millones de parametros, aplicado a series temporales de diagnostico de plasmas de tokamak. El entrenamiento sigue la receta "(h) reward-only (the task outputs)", que segun la nomenclatura del autor prioriza el ajuste a las salidas de tarea mediante una senal de recompensa. No se detalla en la model card el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF/DPO; unicamente se listan las fuentes de datos.

Los datos de entrenamiento proceden de bases de datos experimentales de fusión: FAIR-MAST (UKAEA), la base de datos internacional de confinamiento en modo H HDB5 (DB5.2.3), la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transiciones L-H de TCV (dataset limitado). La seleccion del checkpoint final se realizo sobre 30 configuraciones mediante una regla de seleccion documentada en `selection.json`. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Modelado de series temporales de diagnostico de plasmas de tokamak (world model de la dinamica del plasma).
- Prediccion de la evolucion de variables de plasma a partir de observaciones previas (surrogate/emulador de la fisica del plasma).
- Modelado de salidas de tarea bajo una receta de recompensa (reward-only), orientado a objetivos de control o prediccion.
- Evaluacion de robustez mediante replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues; no aplican a este modelo.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades multimodales.

## Casos de uso

- Emulacion rapida de la evolucion del plasma en tokamaks: el modelo puede sustituir a simulaciones fisicas costosas en bucles de diseno o analisis, dado que ha sido entrenado sobre bases de datos experimentales reales (FAIR-MAST, HDB5, PR08).
- Prediccion de senales de diagnostico para control en tiempo real: al modelar series temporales, puede emplearse como componente predictivo en arquitecturas de control de descarga, aunque la latencia no esta documentada.
- Estudio de transiciones de confinamiento (L-H): entrenado con la base de datos de transiciones L-H de TCV, puede usarse para analizar condiciones de transicion y umbrales de potencia.
- Analisis de limites de densidad: la inclusion de la Open Density Limit Database de Alcator C-Mod permite estudiar regimenes cercanos al limite de densidad.
- Investigacion sobre world models en dominios cientificos: sirve como referencia reproducible (checkpoint `paper`, semillas multiples) para comparar recetas de entrenamiento en series temporales fisicas.
- Generacion de datos sinteticos de diagnostico para aumento de datos o pruebas de algoritmos de control, con la cautela de validar la fidelidad fisica.
- Reproducibilidad de resultados: el repositorio incluye `manifest.json` con hashes SHA-256, `config.json` y `selection.json`, lo que facilita replicar el entrenamiento y auditar la seleccion del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa, un transformer de 100M parametros en precision FP32 ocupa aproximadamente 0,4 GB de pesos; en FP16/BF16, unos 0,2 GB. La VRAM total dependera de la longitud de contexto y del tamano de lote, no documentados.
- GPU recomendadas: no disponible. Por tamano, el modelo cabria en GPUs de consumo (p. ej. RTX 3060/4090) y en aceleradores de datacenter (A100, H100), pero no se confirma compatibilidad ni requisitos especificos.
- Cabe en GPU de consumo: probablemente si, dado el presupuesto de 100M parametros, aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje). El despliegue requeriria cargar los pesos con el codigo de entrenamiento original o con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de world models de plasmas de tokamak ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal; las expectativas de generacion de texto, codigo o conversacion no aplican.
- Dominio muy restringido: solo modela plasmas de tokamak a partir de las bases de datos citadas (MAST, HDB5, PR08, Alcator C-Mod, TCV); su validez fuera de esos regimenes y maquinas no esta garantizada.
- Riesgo de extrapolacion incorrecta: al ser un surrogate entrenado con datos experimentales, puede producir predicciones fisicamente inconsistentes fuera de la distribucion de entrenamiento.
- Sesgos de los datos de origen: las bases de datos experimentales reflejan las condiciones y sesgos de los tokamaks que las generaron; el modelo hereda esas limitaciones.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia; ademas, los datos de origen imponen sus propias condiciones de citacion (FAIR-MAST, HDB5, PR08, etc.).
- PR08 no tiene licencia formal: se proporciona "as is" y solo exige citacion; conviene revisar las condiciones antes de un uso comercial.
- No se documentan sesgos especificos, tasas de alucinacion, limites de contexto ni caveats de produccion adicionales; ante la ausencia de datos, se recomienda validacion empirica antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_h-task-outputs
- Checkpoint del articulo (revision `paper`, commit `7e94f12448543d8cccf477914502d4310dd5d346`): https://huggingface.co/fusion-world-model/transformer_100m_h-task-outputs/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV L-H transition, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
