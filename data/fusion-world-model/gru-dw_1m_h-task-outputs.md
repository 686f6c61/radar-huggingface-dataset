# fusion-world-model/gru-dw_1m_h-task-outputs

## Resumen

`gru-dw_1m_h-task-outputs` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. No se trata de un modelo de lenguaje: es una red recurrente GRU entrenada para modelar la dinamica temporal de descargas de plasma en tokamaks, un problema central en la investigacion de fusion nuclear por confinamiento magnetico. El repositorio contiene los pesos de una configuracion concreta seleccionada de entre 30 entrenadas en una busqueda de hiperparametros.

El modelo emplea una arquitectura GRU de 2 capas con dropout 0,1, un presupuesto de 1 millon de parametros y un calentamiento (*warmup*) de 4000 pasos. La receta de entrenamiento se denomina "(h) reward-only", y el checkpoint seleccionado es el de indice 11 de la busqueda. El repositorio incluye ademas dos semillas alternativas (`seed_1.pt`, `seed_2.pt`) de la misma configuracion, junto con los ficheros de configuracion, seleccion y manifiesto.

Su relevancia radica en que ejemplifica el uso de modelos del mundo ligeros (1M de parametros) para prediccion y modelado de series temporales cientificas en el dominio de la fusion. La licencia CC BY-SA 4.0, heredada de los datos FAIR-MAST, condiciona su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0,1, warmup 4000 pasos) |
| Parametros totales | 1M (presupuesto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante) |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal recurrente de tipo GRU con 2 capas y dropout de 0,1, disenada con un presupuesto de 1 millon de parametros. El entrenamiento incluye una fase de calentamiento de 4000 pasos. La receta empleada se etiqueta como "(h) reward-only", lo que sugiere un esquema de entrenamiento basado unicamente en recompensa (posiblemente sin termino supervisado adicional), aunque la model card no detalla la funcion de perdida ni el algoritmo de optimizacion.

Los datos de entrenamiento provienen de varias bases de datos de fusion: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod y la base de datos de transicion L-H de TCV. No se especifica el numero de tokens ni la composicion exacta del dataset. El checkpoint publicado corresponde a la configuracion de indice 11, seleccionada por la regla de seleccion de la busqueda entre 30 configuraciones entrenadas; `selection.json` contiene las puntuaciones de seleccion.

## Capacidades

- Modelado de series temporales de plasmas de tokamak (prediccion de la evolucion temporal de variables de descarga).
- Modelo del mundo: aprende la dinamica subyacente del sistema para simular o predecir estados futuros.
- Entrenamiento con datos de multiples tokamaks (MAST, bases de datos multi-tokamak H-mode, Alcator C-Mod, TCV).
- Checkpoints alternativos por semilla (`seed_1.pt`, `seed_2.pt`) para evaluar variabilidad del entrenamiento.
- No soporta tool calling, function calling, agentes ni capacidades multilingues (no es un modelo linguistico).
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion de la evolucion temporal de descargas en tokamaks: el modelo puede usarse para anticipar la trayectoria de variables de plasma a partir de estados previos, util para control en tiempo real en experimentos de fusion.
- Modelado de transiciones de confinamiento (L-H): entrenado con la base de datos de TCV, puede emplearse para estudiar condiciones de transicion en plasmas.
- Estudio de limites de densidad: con datos de Alcator C-Mod, sirve para analizar el comportamiento cerca del limite de densidad en escenarios operativos.
- Simulacion rapida de escenarios multi-tokamak: al entrenarse con HDB5 y PR08, permite explorar comportamientos en distintos dispositivos con un coste computacional minimo (1M de parametros).
- *Surrogate modeling* en pipelines de investigacion: puede integrarse como sustituto ligero de simulaciones fisicas costosas para exploracion de parametros.
- Reproducibilidad y comparacion de semillas: los checkpoints `seed_1.pt` y `seed_2.pt` permiten evaluar la robustez del modelo frente a la inicializacion en estudios academicos.
- Analisis de atribucion de datos: dado que la model card documenta las fuentes con sus citas, el modelo puede usarse en trabajos que requieran trazabilidad de datos cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 1M de parametros en precision estandar).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (incluso integradas) y en CPU.
- Opciones de despliegue: PyTorch nativo (los pesos son ficheros `.pt` guardados por el codigo de entrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gru-dw_1m_h-task-outputs | 1M | no disponible | Series temporales de tokamak | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es un modelo de lenguaje ni de proposito general.
- No se documentan sesgos conocidos, pero los datos de entrenamiento provienen de un conjunto limitado de tokamaks, lo que puede limitar la generalizacion a otros dispositivos.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si existe riesgo de predicciones fisicamente inconsistentes fuera del dominio de entrenamiento.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y *share-alike*: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial.
- La model card no detalla la funcion de perdida, el numero de tokens de entrenamiento ni las metricas de evaluacion, lo que dificulta la reproducibilidad completa.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de validacion externa.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_h-task-outputs
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
