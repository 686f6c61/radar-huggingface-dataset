# fusion-world-model/lstm_100m_d-sim-to-shots

## Resumen

`lstm_100m_d-sim-to-shots` es un world model de plasmas de tokamak desarrollado por el colectivo fusion-world-model. Se trata de una red LSTM con un presupuesto de 100 millones de parametros, entrenada para predecir la evolucion temporal de plasmas de fusion. El modelo resuelve el problema de modelar la dinamica de descargas en tokamaks combinando pre-entrenamiento sobre datos de simulador con ajuste posterior sobre descargas reales (receta "d" sim-to-shots). Es relevante porque aplica el paradigma de world models a un dominio cientifico con escasez de datos experimentales, donde los simuladores pueden suplir parcialmente la falta de medidas reales.

El repositorio contiene el checkpoint elegido (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento y los registros de seleccion. El checkpoint de referencia del articulo esta etiquetado como `paper` (commit `6fbedb104cbec4f98fcca09ccbdbd86e3def7ac6`). El modelo se distribuye en formato PyTorch nativo (`.pt`), no en safetensors ni GGUF, y no es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en el sentido habitual de los LLM.

La relevancia actual radica en su enfoque metodologico: pre-entrenar sobre simulaciones fisicas y transferir a datos experimentales de multiples dispositivos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, SPARC, STEP, entre otros), lo que lo convierte en un ejemplo de world model cientifico reproducible con licencia abierta CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Libreria | PyTorch |
| Tamano del repositorio | 1.2 GB |
| Pipeline (Hugging Face) | no disponible |

## Arquitectura y entrenamiento

El modelo es una LSTM con un presupuesto de 100 millones de parametros, orientada a la prediccion de series temporales de plasmas de tokamak. La receta de entrenamiento es la denominada "d": pre-entrenamiento sobre un simulador fisico seguido de ajuste sobre descargas reales (sim-to-shots). Esta estrategia de transferencia permite aprovechar la cobertura amplia del simulador y corregir el sesgo de simulacion con datos experimentales limitados.

Los datos de entrenamiento combinan multiples fuentes fisicas: FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. El checkpoint `final.pt` corresponde a la configuracion de indice 22 de las 30 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del autor (puntuaciones en `selection.json`). No se documentan en la informacion disponible detalles sobre el numero total de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak como world model fisico.
- Modelado de series temporales multivariantes asociadas a descargas de plasma.
- Transferencia sim-to-real: aprovecha pre-entrenamiento en simulador para mejorar sobre datos experimentales.
- Generalizacion entre dispositivos: el entrenamiento incluye datos de multiples tokamaks (MAST Upgrade, Alcator C-Mod, TCV, SPARC, STEP, ITER como descripcion de maquina).
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Capacidades especiales: no dispone de vision, audio ni modo thinking; su salida es una prediccion de series temporales fisicas.

## Casos de uso

- Control predictivo de descargas en tokamak: el modelo puede anticipar la evolucion del plasma a partir del estado actual, lo que permite a un sistema de control actuar antes de que se alcancen limites operativos (disrupciones, perdida de confinamiento).
- Planificacion de escenarios en reactores como SPARC o STEP: dado que el entrenamiento incluye descripciones de estas maquinas y sus escenarios de referencia, el modelo puede usarse para explorar configuraciones de descarga antes de ejecutarlas en el dispositivo.
- Analisis de transiciones L-H: con datos de la base de TCV, el modelo puede estudiar la dinamica de la transicion entre regimenes de confinamiento y apoyar el diseno de estrategias de acceso a H-mode.
- Prediccion de perfiles y flujos turbulentos: al incorporar las tablas QLKNN de QuaLiKiz, el modelo puede integrarse en cadenas de analisis que estiman flujos de transporte a partir de perfiles de plasma.
- Estudio de limites de densidad: con la Open Density Limit Database de Alcator C-Mod, el modelo puede explorar el comportamiento cerca del limite de densidad y contribuir a la definicion de margenes operativos.
- Investigacion comparativa multi-maquina: el modelo puede emplearse como banco de pruebas para analizar como varian las dinamicas de plasma entre dispositivos con distintos parametros de diseno, apoyando estudios de extrapolacion a reactores.
- Reproducibilidad y validacion metodologica: al publicar `final.pt`, dos semillas adicionales y los registros de seleccion, el modelo sirve para replicar y auditar el paradigma sim-to-shots en fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 100M de parametros en precision FP32 el peso ronda los 0,4 GB, y en FP16 aproximadamente 0,2 GB, aunque el repositorio ocupa 1,2 GB por incluir varios checkpoints y metadatos.
- GPU recomendadas: no disponible; por tamano, cualquier GPU moderna con al menos 2-4 GB de VRAM deberia poder cargar el modelo.
- Cabe en GPU de consumo: previsiblemente si (GTX 1660, RTX 3060, RTX 4090, etc.), aunque no se documenta una configuracion minima oficial.
- Opciones de despliegue: no disponible; al ser un modelo PyTorch de series temporales, se cargaria directamente con `torch.load`, sin soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lstm_100m_d-sim-to-shots | 100M | no disponible | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas de world models de tokamak | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (world models de plasmas de tokamak con receta sim-to-shots) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo es especifico del dominio de plasmas de tokamak; no es un modelo de lenguaje ni un modelo generativo de proposito general.
- Al entrenarse sobre datos de simulador y de multiples dispositivos, puede heredar sesgos de simulacion y de las bases de datos de origen (FAIR-MAST, HDB5, PR08, etc.).
- Riesgo de extrapolacion incorrecta a dispositivos o regimenes no representados en el entrenamiento (por ejemplo, reactores futuros con fisica distinta a la de las bases actuales).
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede limitar su uso en productos propietarios.
- El repositorio no documenta la tokenizacion, el preprocesado ni las unidades de las entradas y salidas, lo que dificulta su reutilizacion directa sin el codigo de entrenamiento.
- No se publican resultados de benchmarks ni metricas de error en la model card, por lo que no es posible evaluar su precision de forma independiente a partir de la informacion disponible.
- Los checkpoints son archivos PyTorch serializados (`.pt`); deben cargarse con precaucion por el riesgo de deserializacion insegura.
- El checkpoint de referencia del articulo es el etiquetado `paper`; usar `final.pt` u otras semillas puede dar resultados distintos a los reportados en la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_d-sim-to-shots
- Checkpoint del articulo (tag `paper`, commit `6fbedb104cbec4f98fcca09ccbdbd86e3def7ac6`): https://huggingface.co/fusion-world-model/lstm_100m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5, International Global H-Mode Confinement Database (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08, ITPA multi-tokamak profile database: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP, STEP scenario SPP-001: doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
