# fusion-world-model/gru-dw_10m_f-sim

## Resumen

`gru-dw_10m_f-sim` es un modelo neuronal recurrente (GRU) entrenado como emulador de simulador para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model` en el contexto de la investigación en fusión nuclear por confinamiento magnético. No es un modelo de lenguaje: es un modelo de series temporales que aprende la dinámica de un simulador de plasmas y actúa como sustituto rápido (surrogate) del mismo, dentro de lo que el autor denomina un "world model" del plasma.

El modelo se publica como checkpoint de PyTorch con un presupuesto de 10 millones de parámetros, arquitectura GRU de 2 capas con dropout de 0,1 y un calentamiento (warmup) de 4000 pasos. Corresponde a la receta (f) "simulator emulator" y a la configuración indexada como 22 de las 40 exploradas en una búsqueda de hiperparámetros; `final.pt` es la que la regla de selección del autor clasifica en primer lugar, y se acompañan dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) para reproducibilidad.

Su relevancia es acotada pero específica: en el dominio de la fusión, los simuladores de transporte de plasma son computacionalmente caros, y un emulador de 10M de parámetros permite evaluar escenarios (ITER, SPARC, STEP, MAST-U) con una fracción del coste. El repositorio es pequeño (0,1 GB), está bajo licencia CC BY-SA 4.0 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0.1, warmup de 4000 pasos) |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente con celdas GRU de dos capas y dropout de 0,1, entrenada con un esquema de calentamiento de 4000 pasos. El modelo pertenece a la receta (f) "simulator emulator": aprende a reproducir las salidas de un simulador de plasmas de tokamak a partir de datos de entrenamiento derivados de bases de datos experimentales y de simulación. El checkpoint publicado corresponde a la configuración 22 de una búsqueda de 40 configuraciones; la regla de selección del autor la sitúa en primera posición, y los ficheros `seed_1.pt` y `seed_2.pt` repiten el entrenamiento con semillas distintas para evaluar la varianza.

Los datos de entrenamiento se apoyan en un conjunto heterogéneo de fuentes del dominio: FAIR-MAST (UKAEA), HDB5/DB5.2.3, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de series temporales).

## Capacidades

- Emulación de la dinámica de plasmas de tokamak a partir de entradas de series temporales, sustituyendo al simulador de referencia en la receta (f) "simulator emulator".
- Predicción de la evolución temporal de variables de plasma bajo escenarios de máquina (ITER, MAST-U, SPARC, STEP).
- Reproducibilidad mediante semillas: `seed_1.pt` y `seed_2.pt` permiten medir la dispersión del entrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de visión, audio o thinking mode.
- Integración directa en PyTorch: los checkpoints se cargan con el código de entrenamiento del autor.

## Casos de uso

- **Sustitución rápida del simulador en barridos de parámetros**: el emulador de 10M de parámetros permite explorar miles de configuraciones de plasma con un coste de inferencia muy inferior al del simulador de transporte, adecuado para estudios de sensibilidad y optimización de escenarios.
- **Generación de datos sintéticos para entrenar otros modelos**: al reproducir la dinámica del simulador, el modelo puede producir trayectorias etiquetadas que alimenten pipelines de aprendizaje posteriores sin ejecutar el simulador completo en cada muestra.
- **Prototipado de control y estimación de estado**: la salida temporal del GRU puede usarse como modelo interno en lazos de control predictivo o filtros de estado, donde se requiere una evaluación rápida de la evolución del plasma.
- **Validación cruzada de bases de datos experimentales**: comparar las predicciones del emulador con medidas de FAIR-MAST, HDB5 o TCV ayuda a detectar discrepancias entre el simulador y el experimento en regímenes concretos.
- **Estudios de reproducibilidad y sensibilidad a semillas**: los checkpoints `seed_1.pt` y `seed_2.pt` permiten cuantificar la varianza del entrenamiento y establecer intervalos de confianza en las predicciones.
- **Exploración de escenarios para reactores compactos**: evaluar de forma rápida configuraciones tipo SPARC o STEP antes de lanzar simulaciones de alta fidelidad, filtrando candidatos prometedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 10M de parámetros; menos de 0,5 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer y en entornos embebidos o de borde.
- Opciones de despliegue: PyTorch nativo (carga directa de los `.pt`), exportación a TorchScript u ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de series temporales).
- Latencia y throughput estimados: no disponibles; dependen de la longitud de la secuencia y del lote, pero el tamaño reducido sugiere latencias de milisegundos en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros emuladores de plasma comparables ni sus métricas, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de dominio muy específico: no es un modelo de lenguaje y no debe emplearse para tareas de texto, código o razonamiento general.
- La calidad de las predicciones está acotada por la fidelidad del simulador de referencia y por la cobertura de las bases de datos de entrenamiento (FAIR-MAST, HDB5, TCV, SPARC, STEP, entre otras); fuera de ese dominio la extrapolación no está garantizada.
- Riesgo de deriva y acumulación de error en predicciones autoregresivas de horizonte largo, habitual en modelos recurrentes.
- La licencia CC BY-SA 4.0 impone atribución y compartir igual: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar su uso en productos propietarios.
- El repositorio no registra descargas ni likes, y la documentación pública es mínima (sin métricas de validación ni detalles del dataset); conviene tratar el checkpoint como material de investigación y no como componente listo para producción.
- No se documentan sesgos en el sentido de los LLM, pero sí posibles sesgos de cobertura experimental derivados de las máquinas y regímenes representados en los datos.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_10m_f-sim
- Checkpoint del paper (tag `paper`, commit `4149bb82b4788786c5a822582bbfbe1bca7fe574`): https://huggingface.co/fusion-world-model/gru-dw_10m_f-sim/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 / DB5.2.3: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de máquina: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al. 2020 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
