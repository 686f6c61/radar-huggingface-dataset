# fusion-world-model/transformer_1m_g-residual

## Resumen

`transformer_1m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model` y publicado en Hugging Face. No es un modelo de lenguaje: es un transformer de series temporales entrenado para emular y corregir la dinámica de plasmas en reactores de fusión, dentro de la receta denominada «(g) emulator + correction». El checkpoint principal tiene un presupuesto de 1M de parámetros y se distribuye como archivos PyTorch (`final.pt`, `seed_*.pt`) junto con el emulador congelado que carga en tiempo de inferencia.

El repositorio está orientado a reproducibilidad científica: incluye el checkpoint elegido por la regla de selección de una búsqueda de 35 configuraciones (`final.pt`, índice 18), dos réplicas con semillas alternativas, el emulador congelado (`emulator.pt`), la configuración de entrenamiento (`config.json`), las puntuaciones de selección (`selection.json`) y un manifiesto con SHA-256 de cada archivo. La revisión del paper está etiquetada como `paper-r2` (commit `e1f470b953512dea7bbbd467f79bfc9267ca9079`), y las etiquetas no se mueven entre revisiones.

Su relevancia es acotada y muy específica: sirve como pieza de un pipeline de modelado de plasmas para ITER, MAST Upgrade, SPARC y STEP, no como modelo de propósito general. No hay información publicada sobre benchmarks de NLP ni sobre capacidades lingüísticas, y el repositorio no contiene pesos en formato safetensors ni GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (series temporales, presupuesto 1M de parámetros) |
| Parámetros totales | 1M (presupuesto declarado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de 1M de parámetros aplicado a series temporales de plasmas de tokamak. La receta se describe como «(g) emulator + correction»: el modelo se entrena junto a un emulador congelado (`emulator.pt`) que carga en inferencia, y aprende a corregir la salida del emulador para aproximar la dinámica real del plasma. El checkpoint `final.pt` corresponde a la configuración índice 18 de las 35 entrenadas durante la búsqueda de hiperparámetros, seleccionada por la regla de selección documentada en `selection.json`. Las réplicas `seed_1.pt` y `seed_2.pt` son la misma configuración reentrenada con semillas distintas, lo que permite estimar varianza de entrenamiento.

Los datos de entrenamiento proceden de bases de datos públicas de fusión: FAIR-MAST (UKAEA), HDB5/DB5.2.3, PR08, la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica a este dominio). La innovación técnica destacable es el esquema de corrección sobre emulador congelado y la trazabilidad completa de la búsqueda de configuraciones mediante etiquetas inmutables.

## Capacidades

- Emulación y corrección de la dinámica de plasmas de tokamak a partir de series temporales.
- Modelado de escenarios en ITER, MAST Upgrade, SPARC y STEP según las fuentes de datos citadas.
- Predicción sobre perfiles y confinamiento (HDB5, PR08) y sobre límites de densidad (Alcator C-Mod).
- Aprendizaje de transiciones L-H a partir de la base de TCV.
- Integración con tablas de flujos de transporte (QLKNN10D/11D) como componente del pipeline.
- Reproducibilidad: checkpoints con semillas alternativas y manifiesto con SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en control de plasmas: usar el modelo como sustituto rápido del emulador para explorar configuraciones de descarga en ITER o SPARC antes de simulaciones más costosas, aprovechando el bajo coste de inferencia de un transformer de 1M.
- Estudio de transiciones L-H: entrenar o evaluar variantes sobre la base de TCV para analizar qué regímenes de operación favorecen la transición, con la corrección del emulador como referencia.
- Análisis de límites de densidad: aplicar el modelo a datos de Alcator C-Mod para estimar el límite operativo y comparar con la salida del emulador congelado.
- Reproducción de resultados del paper: cargar la revisión `paper-r2` con `emulator.pt` y `config.json` para regenerar las predicciones publicadas y verificar la selección de la configuración 18.
- Estudio de varianza de entrenamiento: comparar `final.pt` con `seed_1.pt` y `seed_2.pt` para cuantificar la sensibilidad del modelo a la semilla en un presupuesto de 1M de parámetros.
- Benchmarking de recetas de corrección: usar el par emulador + corrector como línea base frente a otras arquitecturas de series temporales en el mismo conjunto de datos de fusión.
- Docencia y divulgación: ejemplo compacto y trazable de world model aplicado a un dominio científico con datos públicos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (error de predicción, R², etc.) ni comparaciones cuantitativas con otros modelos; solo se referencia `selection.json` como registro de las puntuaciones de selección internas de la búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del checkpoint (1M de parámetros, del orden de megabytes en precisión completa); no se dispone de cifra oficial.
- GPU recomendadas: cualquier GPU con soporte PyTorch es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son archivos `.pt` guardados por el código de entrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (world models de plasmas de tokamak con receta emulador + corrección y presupuesto de 1M de parámetros).

## Limitaciones y advertencias

- Dominio muy restringido: solo modela plasmas de tokamak según las bases de datos citadas; no es transferible a otras tareas.
- Sesgos de datos: las conclusiones heredan los sesgos y la cobertura de FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP y SPARC; los regímenes poco representados estarán peor modelados.
- Riesgo de extrapolación: al ser un corrector sobre un emulador congelado, fuera del régimen de entrenamiento la corrección puede degradar la predicción del emulador en lugar de mejorarla.
- Sin métricas publicadas: no hay benchmarks que permitan juzgar la calidad predictiva antes de usarlo en producción científica.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual; obliga a citar FAIR-MAST y el resto de fuentes, y a liberar obras derivadas bajo la misma licencia.
- Atribución obligatoria adicional para SPARCPublic (Commonwealth Fusion Systems) y para PR08, que no tiene licencia formal pero exige citación.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el tamaño del repo es 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o son muy pequeños.
- No apto para producción de software: no hay pipeline definido, ni API, ni documentación de inferencia más allá de los archivos de checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_g-residual
- Revisión del paper (`paper-r2`): https://huggingface.co/fusion-world-model/transformer_1m_g-residual/tree/paper-r2
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- Hudoba et al. 2024, Nucl. Fusion 64, 086055: https://doi.org/10.1088/1741-4326/ad56a2
- Tholerus et al. 2024, Nucl. Fusion 64, 106030: https://doi.org/10.1088/1741-4326/ad6011
- SPARC, Creely et al. 2020, J. Plasma Phys. 86, 865860502: https://doi.org/10.1017/S0022377820001257
- QLKNN10D v1.0: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D v1.0.0: https://doi.org/10.5281/zenodo.8017522
- van de Plassche et al. 2020, Phys. Plasmas 27, 022310: https://doi.org/10.1063/1.5134126
