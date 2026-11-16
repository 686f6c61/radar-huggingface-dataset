# fusion-world-model/gru_10m_e-joint

## Resumen

`gru_10m_e-joint` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de un checkpoint de una red recurrente GRU con un presupuesto de aproximadamente 10 millones de parametros, entrenado bajo la receta denominada "(e) joint training" para predecir la evolucion temporal de la dinamica de plasmas en reactores de fusion. No es un modelo de lenguaje: es un modelo de series temporales orientado a un dominio cientifico muy especifico, la fisica de plasmas de fusion por confinamiento magnetico.

El modelo se publica junto a un articulo cientifico y forma parte de una busqueda de configuraciones de entrenamiento. El checkpoint principal, `final.pt`, corresponde a la configuracion de indice 6 de las 20 que entreno la busqueda, seleccionada por la regla de seleccion del propio estudio. El repositorio incluye tambien replicas con distintas semillas (`seed_1.pt`, `seed_2.pt`) y los controladores entrenados en el modelo del mundo para la "Evaluacion 4" (PPO con receta congelada), lo que permite reproducir experimentos de control sobre el modelo aprendido.

La relevancia es acotada pero clara: los modelos del mundo para tokamaks permiten entrenar controladores en simulacion antes de aplicarlos en maquinas reales, reduciendo coste y riesgo. Este checkpoint es un artefacto de investigacion reproducible, no un modelo de proposito general, y su licencia CC BY-SA 4.0 (heredada de los datos FAIR-MAST) condiciona su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas) |
| Parametros totales | ~10 M (presupuesto de parametros de la receta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) de dos capas, con dropout de 0.1, segun la descripcion del checkpoint de referencia del articulo (el "design pilot" ganador). El modelo opera sobre secuencias temporales de variables de plasma y se entrena bajo la receta "(e) joint training", que segun la model card combina multiples fuentes de datos. La busqueda de configuraciones entreno 20 variantes; `final.pt` es la que la regla de seleccion del estudio clasifico en primer lugar, y `selection.json` contiene las puntuaciones de esa seleccion.

El entrenamiento se apoya en un conjunto amplio de bases de datos publicas de fusion: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. La model card tambien documenta una receta anterior (`old_recipe`) con un suelo inferior sobre la dispersion predicha, sin tope en la verosimilitud y sin warmup de learning rate, que no es el modelo reportado en el articulo. No se detalla el numero de tokens ni la composicion exacta del dataset en la informacion disponible.

## Capacidades

- Prediccion de series temporales de variables de plasma de tokamak (evolucion de la dinamica del plasma).
- Modelado del mundo para entrenamiento de controladores: el repositorio incluye controladores PPO entrenados sobre el modelo congelado (`e4/`).
- Evaluacion de politicas de control en simulacion antes de su aplicacion en maquinas reales.
- Replicabilidad experimental mediante checkpoints con distintas semillas de entrenamiento.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling ni capacidades multilingues.
- No dispone de modo de razonamiento explicito ni de capacidades de agente.

## Casos de uso

- Entrenamiento de controladores de plasma en simulacion: los controladores PPO de `e4/` se entrenan contra el modelo del mundo congelado, lo que permite explorar politicas de control sin riesgo sobre la maquina real.
- Investigacion en modelos del mundo para fusion: el checkpoint sirve como referencia reproducible para comparar arquitecturas recurrentes (GRU) frente a alternativas en la prediccion de la dinamica del plasma.
- Estudio de recetas de entrenamiento: la publicacion de `final.pt`, `seed_1.pt`, `seed_2.pt` y `old_recipe/final.pt` permite analizar la sensibilidad a la semilla y el efecto de cambios en la receta sobre las predicciones.
- Validacion de bases de datos de fusion: el modelo se entrena sobre FAIR-MAST, HDB5, PR08 y otras fuentes, y puede usarse para estudiar la coherencia entre ellas en un espacio latente comun.
- Prototipado de estrategias de control en reactores futuros (ITER, SPARC, STEP): el modelo incorpora descripciones de estas maquinas, lo que permite ensayar politicas en escenarios cercanos a los de diseno.
- Docencia y divulgacion en fisica de plasmas computacional: al ser un modelo pequeno (~10 M de parametros) y con pesos publicos, es viable ejecutarlo y modificarlo en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (error de prediccion, R², etc.) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, del orden de decenas o pocos cientos de MB para un modelo de ~10 M de parametros en precision completa; no disponible una cifra exacta.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: al ser un checkpoint PyTorch puro (`.pt`) sin integracion en frameworks de inferencia estandar, el despliegue requiere cargar el estado con el codigo de entrenamiento del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos del mundo para tokamaks con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak): no es utilizable fuera de ese ambito.
- No es un modelo de lenguaje ni un modelo multimodal; no genera texto, codigo ni respuestas conversacionales.
- Riesgo de extrapolacion: al entrenarse sobre bases de datos publicas de un conjunto limitado de maquinas, sus predicciones pueden no generalizar a configuraciones de plasma o reactores no representados.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; hay que respetar ademas las atribuciones especificas de cada fuente de datos (FAIR-MAST, HDB5, PR08, SPARC, OpenSTEP, etc.).
- El checkpoint `old_recipe/final.pt` no es el modelo reportado en el articulo; usarlo como referencia principal seria un error metodologico.
- La model card no documenta sesgos, tasas de error ni limites de contexto; cualquier uso en produccion requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_e-joint
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP: doi:10.14468/07jt-s540
- SPARC: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
- QuaLiKiz: van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
