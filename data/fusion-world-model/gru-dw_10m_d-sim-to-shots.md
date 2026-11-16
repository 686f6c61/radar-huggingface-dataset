# fusion-world-model/gru-dw_10m_d-sim-to-shots

## Resumen

`gru-dw_10m_d-sim-to-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el usuario `fusion-world-model`. No es un modelo de lenguaje: es una red recurrente GRU entrenada para predecir la evolución temporal de variables de plasma en reactores de fusión. Su receta de entrenamiento combina preentrenamiento sobre un simulador físico y ajuste posterior con datos experimentales de descargas reales (el nombre `sim-to-shots` refleja ese flujo).

El modelo tiene un presupuesto de 10 millones de parámetros y una arquitectura de 2 capas con dropout de 0,1 y un calentamiento (warmup) de 4000 pasos, configuración que resultó ganadora en la búsqueda de hiperparámetros del proyecto piloto de diseño. El checkpoint publicado es la configuración de índice 19 de las 30 entrenadas, seleccionada según la regla de selección definida en `selection.json`.

Su relevancia es de nicho: se enmarca en el esfuerzo por construir modelos predictivos y de control para reactores de fusión (ITER, MAST Upgrade, SPARC, STEP), y el repositorio documenta de forma explícita la trazabilidad de las fuentes de datos (FAIR-MAST, HDB5, PR08, SPARCPublic, QLKNN, entre otras). No dispone de pipeline declarado ni de idiomas soportados, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente), 2 capas, dropout 0,1, warmup de 4000 pasos |
| Parametros totales | 10M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es una red GRU de dos capas con dropout de 0,1 y un calentamiento de 4000 pasos, con un presupuesto de 10 millones de parámetros. La receta de entrenamiento (denominada "d" en la model card) consiste en un preentrenamiento sobre un simulador de física de plasmas seguido de un ajuste con datos de descargas reales de tokamak (`sim-to-shots`). La configuración publicada como `final.pt` es la de índice 19 de las 30 entrenadas durante la búsqueda de hiperparámetros, seleccionada según la regla de selección cuyos criterios se recogen en `selection.json`.

El repositorio incluye además dos reentrenamientos de la misma configuración con semillas distintas (`seed_1.pt`, `seed_2.pt`), lo que permite evaluar la variabilidad entre semillas. Los datos de entrenamiento proceden de un conjunto heterogéneo de bases de datos de fusión: FAIR-MAST (UKAEA), HDB5, PR08, la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP, SPARCPublic y las tablas de flujos QLKNN10D y QLKNN11D, además de descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la información disponible el número de tokens ni la composición exacta del dataset.

## Capacidades

- Predicción de series temporales de variables de plasma en tokamaks.
- Modelado del mundo (world model) para simulación y anticipación de la evolución del plasma.
- Transferencia simulador a experimento (`sim-to-shots`) gracias al preentrenamiento en simulador y ajuste con descargas reales.
- Entrenamiento reproducible: se incluyen reentrenamientos con semillas alternativas para evaluar robustez.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingües, visión, audio ni modo de pensamiento.
- No es un modelo generativo de texto.

## Casos de uso

- Predicción de la evolución temporal del plasma en tokamak: el modelo recibe una secuencia de estados del plasma y predice el siguiente estado, útil para anticipar transiciones y diseñar estrategias de control en tiempo real.
- Control predictivo de descargas: integrado en un bucle de control, el world model puede anticipar la evolución del plasma y permitir ajustes de actuadores antes de que se produzcan disrupciones.
- Validación de escenarios en simulador: al haber sido preentrenado en simulador y ajustado con datos reales, permite contrastar escenarios simulados (ITER, SPARC, STEP) frente a comportamiento observado en máquinas existentes.
- Estudio de transferencia entre máquinas: la inclusión de datos de múltiples tokamaks (MAST Upgrade, Alcator C-Mod, TCV, SPARC) permite evaluar la generalización del modelo entre dispositivos.
- Investigación en modelado de datos de fusión: sirve como línea base reproducible (con semillas múltiples y manifiesto de ficheros) para comparar arquitecturas y recetas de entrenamiento en la comunidad de fusión.
- Análisis de transiciones L-H y límites de densidad: el modelo puede emplearse para estudiar regímenes de confinamiento y límites operativos a partir de las bases de datos incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 10M de parámetros, el checkpoint en precisión completa ocupa aproximadamente 40 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch (incluidas RTX 3060, RTX 4090, A100, H100) es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también es viable en CPU para inferencia de series temporales.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el código de entrenamiento, requiere cargarlo con PyTorch y la definición de arquitectura correspondiente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (world models de plasma en tokamak) ni sus especificaciones.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje ni un modelo multimodal; no debe evaluarse con benchmarks de NLP.
- Sesgos potenciales derivados de las bases de datos de entrenamiento: la cobertura de máquinas y regímenes operativos es limitada y puede no representar configuraciones fuera de las incluidas (ITER, MAST Upgrade, SPARC, STEP, Alcator C-Mod, TCV).
- Riesgo de extrapolación incorrecta fuera del dominio de entrenamiento (regímenes de plasma no vistos, máquinas no incluidas).
- No se documentan métricas de error ni validación cuantitativa en la información disponible.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Requisitos de atribución específicos para varias fuentes de datos (FAIR-MAST, HDB5, PR08, SPARCPublic, QLKNN, entre otras), que deben respetarse en publicaciones y análisis derivados.
- El checkpoint de referencia del paper es la revisión etiquetada `paper` (commit `144267869fd58def19f6f4401a1385c2339fc8ca`); usar `final.pt` de main puede no coincidir con los resultados publicados.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_10m_d-sim-to-shots
- Checkpoint del paper (tag `paper`, commit `144267869fd58def19f6f4401a1385c2339fc8ca`): https://huggingface.co/fusion-world-model/gru-dw_10m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de máquina ITER: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- Descripciones de máquina MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- Descripciones de máquina SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601
- Descripciones de máquina STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406; OpenSTEP, doi:10.14468/07jt-s540
