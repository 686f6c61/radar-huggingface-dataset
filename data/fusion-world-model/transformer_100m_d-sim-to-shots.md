# fusion-world-model/transformer_100m_d-sim-to-shots

## Resumen

`transformer_100m_d-sim-to-shots` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de un transformer de aproximadamente 100 millones de parametros entrenado para modelar la dinamica de descargas de plasma en dispositivos de fusion por confinamiento magnetico, un problema de series temporales cientificas de alta dimensionalidad. El modelo resuelve la prediccion y simulacion de la evolucion temporal de perfiles de plasma, lo que resulta relevante para el diseno y control de reactores de fusion como ITER, SPARC, MAST Upgrade y STEP.

La receta de entrenamiento combina un preentrenamiento sobre datos de simulador (recipe d, "simulator pre-training") seguido de un ajuste sobre descargas reales ("then shots"). El checkpoint publicado como `final.pt` corresponde a la configuracion de indice 22 de las 30 exploradas en una busqueda de hiperparametros, seleccionada segun la regla de seleccion documentada en `selection.json`. Se publican ademas dos semillas alternativas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento.

El modelo no es un modelo de lenguaje: es un transformer de series temporales aplicado a fisica de plasmas. Su interes radica en su caracter abierto (pesos, configuracion y manifiesto con hashes SHA-256), su licencia CC BY-SA 4.0 y su trazabilidad completa de las fuentes de datos cientificos empleadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (series temporales) |
| Parametros totales | ~100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer orientado a series temporales, con un presupuesto de parametros de aproximadamente 100 millones. El modelo se entrena en dos fases segun la receta (d): primero un preentrenamiento sobre datos generados por simulador y despues un ajuste fino sobre descargas experimentales reales ("shots"). No se especifican en la informacion disponible el numero de capas, dimensiones del modelo, mecanismo de atencion ni la longitud de contexto utilizada.

Los datos de entrenamiento provienen de un conjunto de bases de datos cientificas de fusion, entre ellas FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujo QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se detalla el volumen de tokens ni la composicion exacta del dataset.

La publicacion incluye `config.json` con la configuracion de entrenamiento del checkpoint `final.pt`, `selection.json` con las puntuaciones de seleccion de las 30 configuraciones exploradas y `manifest.json` con rutas, tamanos y hashes SHA-256 de todos los ficheros del repositorio. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Modelado y prediccion de la evolucion temporal de plasmas de tokamak (series temporales fisicas).
- Simulacion de perfiles de plasma y escenarios de descarga en distintos dispositivos (ITER, MAST Upgrade, SPARC, STEP, entre otros).
- Preentrenamiento sobre simulador con ajuste posterior a datos experimentales reales, lo que permite transferencia simulador-a-experimento.
- Modelo de mundo: puede emplearse como componente de prediccion dentro de bucles de control o planificacion.
- Reproducibilidad: publicacion de multiples semillas (`seed_1.pt`, `seed_2.pt`) para evaluar robustez.
- No dispone de capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Prediccion de la evolucion temporal de descargas: el modelo puede tomar el estado de un plasma en un instante y predecir su evolucion posterior, util para anticipar transiciones de regimen (por ejemplo L-H) y disenar estrategias de control.
- Control predictivo en tokamaks: integrado en un bucle de control, el world model puede proporcionar predicciones a corto plazo sobre las que un controlador decida actuaciones sobre los actuadores del dispositivo.
- Transferencia simulador-a-experimento: gracias al preentrenamiento sobre simulador y al ajuste con datos reales, permite evaluar escenarios en dispositivos donde no se dispone de datos historicos abundantes (por ejemplo SPARC o STEP).
- Estudio de limites de densidad y confinamiento: entrenado con la Open Density Limit Database y HDB5, sirve para analizar condiciones cercanas a los limites operativos.
- Planificacion de escenarios en reactores futuros: uso de las descripciones de maquina de ITER y STEP para explorar configuraciones de descarga antes de la operacion real.
- Analisis de sensibilidad y estudios de incertidumbre: las multiples semillas publicadas permiten estimar la varianza del modelo y cuantificar la incertidumbre de las predicciones en estudios cientificos.
- Investigacion reproducible en fusion: el manifiesto con hashes SHA-256 y la configuracion publicada permiten replicar experimentos y comparar recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~100M de parametros en precision FP32 ocupa aproximadamente 0,4 GB en pesos; en FP16/BF16, alrededor de 0,2 GB. El repositorio completo ocupa 1,1 GB por incluir varios checkpoints (`final.pt`, `seed_1.pt`, `seed_2.pt`).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para inferencia; para entrenamiento o ajuste fino se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el codigo de entrenamiento, requiere cargarse con PyTorch y el codigo del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de series temporales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de world models de plasmas de tokamak ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en fisica de plasmas de tokamak; no es un modelo de lenguaje y no debe emplearse para tareas de NLP.
- No se documentan sesgos especificos, pero al entrenarse con bases de datos experimentales limitadas a ciertos dispositivos y regimenes, las predicciones pueden no generalizar fuera de la distribucion de entrenamiento.
- Riesgo de error en extrapolacion: las predicciones en escenarios no representados en los datos (por ejemplo, dispositivos futuros como STEP) deben tratarse con cautela.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia (copyleft). Ademas, los datos de origen imponen obligaciones de atribucion adicionales (FAIR-MAST, HDB5, PR08, SPARC, entre otros) que deben respetarse.
- Algunas fuentes de datos tienen licencias o condiciones particulares (PR08 sin licencia formal pero con requisito de citacion; SPARCPublic con texto de reconocimiento obligatorio), lo que condiciona la redistribucion.
- No se documentan la longitud de contexto, el esquema de cuantizacion ni los idiomas, por lo que la integracion en produccion requiere inspeccionar `config.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_d-sim-to-shots
- Checkpoint del paper (tag `paper`, commit `d27acdf81b2fef5dbdb808c9b6b17427f6afcb52`): https://huggingface.co/fusion-world-model/transformer_100m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP (escenario SPP-001): doi:10.14468/07jt-s540
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D: doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522
