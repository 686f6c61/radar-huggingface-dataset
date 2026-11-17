# fusion-world-model/transformer_100m_e-joint

## Resumen

`transformer_100m_e-joint` es un modelo del mundo (world model) para plasmas de tokamak, publicado por el autor `fusion-world-model` en Hugging Face. No es un modelo de lenguaje: es un transformer de aproximadamente 100 millones de parámetros entrenado para modelar la dinámica temporal de plasmas en reactores de fusión por confinamiento magnético. Forma parte de una familia de recetas de entrenamiento, y esta en concreto corresponde a la receta «(e) joint training», es decir, entrenamiento conjunto sobre varias fuentes de datos de tokamaks.

El repositorio contiene los checkpoints de una configuración seleccionada de entre 30 configuraciones exploradas en una búsqueda de hiperparámetros. El checkpoint principal es `final.pt`, correspondiente a la configuración con mejor puntuación según la regla de selección del autor, y se incluyen dos réplicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento. La revisión etiquetada como `paper` contiene el checkpoint exacto utilizado en la publicación asociada.

El modelo es relevante para la comunidad de fusión porque aplica arquitecturas transformer a la predicción de series temporales de plasmas, un área donde los modelos empíricos y las bases de datos multi-tokamak (FAIR-MAST, HDB5, PR08, entre otras) están permitiendo entrenar modelos con capacidad de generalización entre dispositivos. Los pesos se distribuyen bajo licencia CC BY-SA 4.0, la misma que los datos FAIR-MAST sobre los que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo del mundo para series temporales de plasmas de tokamak) |
| Parametros totales | Aproximadamente 100M (presupuesto declarado en el nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints en PyTorch sin cuantizar) |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer entrenado como modelo del mundo de plasmas de tokamak, con un presupuesto de parámetros de 100M. El modelo opera sobre series temporales de diagnósticos de plasma y está diseñado para capturar la dinámica temporal del plasma en reactores de confinamiento magnético. La receta de entrenamiento es «(e) joint training», que combina datos de múltiples fuentes y dispositivos en un único entrenamiento conjunto.

Los datos de entrenamiento provienen de varias bases de datos públicas de la comunidad de fusión: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de datos de transición L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

La innovación técnica destacable es el uso de un enfoque de modelo del mundo entrenado conjuntamente sobre múltiples tokamaks, lo que busca generalización entre dispositivos. El proceso de selección de la configuración final se documenta en `selection.json`, y el manifiesto `manifest.json` incluye rutas, tamaños y hashes SHA-256 de todos los ficheros.

## Capacidades

- Modelado y predicción de la dinámica temporal de plasmas de tokamak.
- Entrenamiento conjunto multi-dispositivo (joint training) sobre datos de MAST, Alcator C-Mod, TCV, SPARC, STEP, entre otros.
- Capacidad de generalización entre tokamaks gracias a la combinación de bases de datos multi-máquina.
- Soporte de evaluación de varianza mediante checkpoints con semillas distintas (`seed_1.pt`, `seed_2.pt`).
- No dispone de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de la evolución temporal de perfiles de plasma: el modelo puede usarse para predecir la evolución de magnitudes del plasma en un tokamak a partir de un estado inicial y una secuencia de actuaciones, aprovechando su entrenamiento sobre series temporales de múltiples dispositivos.
- Control predictivo de escenarios de descarga: integrado en un bucle de control, el modelo del mundo permite simular el efecto de cambios en los actuadores antes de aplicarlos en la máquina real, reduciendo el riesgo de disrupciones.
- Transferencia entre tokamaks: gracias al entrenamiento conjunto sobre FAIR-MAST, Alcator C-Mod, TCV, SPARC y STEP, el modelo puede emplearse para explorar cómo se comportaría un escenario en un dispositivo distinto del de entrenamiento.
- Estudio de transiciones L-H: el modelo incorpora datos de la base de datos de transición L-H de TCV, por lo que puede usarse para analizar y predecir las condiciones de transición entre regímenes de confinamiento.
- Análisis de límites de densidad: con datos de la Open Density Limit Database de Alcator C-Mod, el modelo puede emplearse para estudiar el límite de densidad y su dependencia de parámetros operativos.
- Evaluación de escenarios para reactores futuros: con descripciones de máquina de ITER y STEP, el modelo permite simular escenarios operativos preliminares en reactores en diseño o construcción.
- Reproducibilidad de investigación: los checkpoints con semillas distintas y el manifiesto con hashes permiten reproducir y auditar los resultados experimentales del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un transformer de ~100M de parámetros en precisión completa (fp32) se estiman aproximadamente 0,4 GB de pesos, aunque el consumo real depende de la longitud de secuencia y del lote.
- GPU recomendadas: no disponible. Un modelo de ~100M de parámetros es desplegable en GPUs de consumo, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Sí, por tamaño (100M de parámetros), aunque no se confirma en la información disponible.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el código de entrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos del mundo de plasmas de tokamak comparables, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en plasmas de tokamak; no es un modelo de lenguaje ni un modelo de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre bases de datos de dispositivos concretos puede heredar sesgos de cobertura hacia esos tokamaks y regímenes operativos.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero el modelo puede producir predicciones no físicas fuera del dominio de entrenamiento.
- No se especifica la longitud de contexto ni el régimen temporal cubierto, lo que limita saber para qué horizontes de predicción es válido.
- La licencia CC BY-SA 4.0 impone obligaciones de atribución y compartir-igual: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial y la integración en productos propietarios.
- Los datos de entrenamiento incluyen fuentes con licencias y condiciones de atribución específicas (FAIR-MAST, HDB5, PR08, SPARC, entre otras); el uso del modelo debe respetar esas atribuciones.
- No hay información sobre el rendimiento en producción, latencia ni robustez ante datos fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_e-joint
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137; Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
