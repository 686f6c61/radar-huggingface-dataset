# fusion-world-model/lstm_10m_f-sim

## Resumen

`lstm_10m_f-sim` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. Se trata de una red LSTM con un presupuesto de parametros de 10 millones, entrenada bajo la receta denominada "(f) simulator emulator", es decir, como emulador de un simulador de fisica de plasmas. El modelo forma parte de un estudio comparativo mas amplio: el checkpoint publicado como `final.pt` corresponde a la configuracion de indice 20 de las 40 exploradas en una busqueda de hiperparametros, seleccionada por la regla de seleccion interna del estudio.

El modelo aborda un problema especifico de la investigacion en fusion nuclear: la necesidad de emular de forma rapida y precisa la evolucion temporal de variables de plasma en tokamaks, alli donde los simuladores fisicos resultan computacionalmente costosos. Al tratarse de una LSTM aplicada a series temporales, el modelo opera sobre secuencias de estados de plasma, no sobre texto ni imagenes, por lo que sus capacidades son fundamentalmente predictivas y de pronostico numerico.

Es relevante ahora porque se publica junto a los datos de entrenamiento derivados de bases de datos abiertas de fusion (FAIR-MAST, HDB5, PR08, QLKNN, entre otras) y bajo una licencia CC BY-SA 4.0 compatible con dichos datos. El repositorio incluye checkpoints con distintas semillas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento y un manifiesto con hashes SHA-256, lo que facilita la reproducibilidad. No obstante, la informacion publica disponible es muy limitada: no se documentan metricas de rendimiento, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 10 millones (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM, una red neuronal recurrente adecuada para modelar dependencias temporales en secuencias. El presupuesto de parametros es de 10 millones, lo que la situa en la gama baja de complejidad y la hace apta para inferencia en CPU o GPUs de consumo. El modelo se entrena como emulador de un simulador de plasmas de tokamak (receta "(f) simulator emulator"), lo que implica que aprende a aproximar la salida de un simulador fisico a partir de datos de entrenamiento derivados de bases de datos experimentales y tablas de flujos.

Los datos de entrenamiento proceden de fuentes abiertas de la comunidad de fusion: FAIR-MAST (UKAEA), la base de datos HDB5, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP, SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica el numero de tokens ni la composicion exacta del dataset, ni si se empleo RLHF o DPO (tecnicas no aplicables a este tipo de modelo). La innovacion tecnica destacable es la publicacion de checkpoints con multiples semillas y un manifiesto con hashes para garantizar reproducibilidad, asi como una revision etiquetada `paper` que fija el checkpoint exacto del articulo.

## Capacidades

- Prediccion y emulacion de series temporales de variables de plasma en tokamaks.
- Modelado de la evolucion temporal de estados de plasma a partir de datos experimentales y de simulador.
- Emulacion de simuladores fisicos de transporte y confinamiento (receta "simulator emulator").
- Capacidad de pronostico multi-paso sobre secuencias de estados de plasma (inferida de la arquitectura LSTM; no documentada explicitamente).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de vision, audio ni modo "thinking".

## Casos de uso

- Emulacion rapida de simuladores de plasma: sustituir llamadas costosas a simuladores fisicos por inferencia LSTM en bucles de optimizacion de escenarios de tokamak, reduciendo el coste computacional por evaluacion.
- Control predictivo de descargas: usar las predicciones del modelo como entrada a controladores en tiempo casi real para anticipar la evolucion de variables de plasma durante una descarga.
- Exploracion de espacio de parametros: integrar el emulador en barridos de parametros de diseno de escenarios (corriente, densidad, potencia auxiliar) para descartar configuraciones inviables antes de simularlas con codigos fisicos completos.
- Estudio de transiciones de confinamiento: emplear el modelo para analizar la transicion L-H y la evolucion de perfiles en bases de datos como TCV o HDB5.
- Validacion cruzada entre maquinas: entrenar o evaluar sobre datos de MAST Upgrade, SPARC o STEP y comparar predicciones con las de ITER para estudiar extrapolabilidad.
- Investigacion reproducible: servir como checkpoint de referencia para replicar los resultados del articulo asociado, gracias a la revision `paper` y al manifiesto con hashes SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (10 M de parametros, aproximadamente 40 MB en FP32); margen adicional para estados ocultos y batch.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de la misma categoria (world models de plasmas de tokamak) con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es un modelo de lenguaje y no debe evaluarse con metricas de NLP.
- Riesgo de extrapolacion fuera de distribucion: al ser un emulador entrenado sobre bases de datos concretas, sus predicciones pueden degradarse en regimenes no representados en los datos.
- No se documentan metricas de error, lo que impide evaluar su fidelidad frente al simulador de referencia sin reproducir el entrenamiento.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas; es necesario revisar la compatibilidad con el uso comercial previsto y con las licencias de los datos de origen (algunas fuentes tienen condiciones especificas de citacion, como PR08 o SPARCPublic).
- La model card advierte de que los datos de entrenamiento se apoyan en multiples fuentes con requisitos de atribucion distintos; el cumplimiento integro requiere citar todas ellas.
- No hay informacion sobre sesgos, idiomas ni limitaciones de contexto; al no procesar texto, los sesgos linguisticos no aplican, pero si posibles sesgos derivados de la cobertura desigual de las bases de datos de fusion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_f-sim
- Checkpoint del articulo (revision `paper`): commit `7dd0cbb70d2db3f703d1e556fe7a884ed30dfb9c`
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de maquinas: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al. (2020) y Phys. Plasmas 30 (2023) 090601; STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
