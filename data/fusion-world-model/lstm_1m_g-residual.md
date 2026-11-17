# fusion-world-model/lstm_1m_g-residual

## Resumen
`lstm_1m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el autor `fusion-world-model`. Se trata de una red LSTM con un presupuesto de 1 millón de parámetros, entrenada con la receta denominada "(g) emulator + correction", que combina un emulador congelado con un mecanismo de corrección aprendido. El modelo predice la evolución temporal de variables del plasma en reactores de fusión, un problema de series temporales con dinámica no lineal y regímenes de confinamiento cambiantes.

El modelo es relevante en el contexto de la investigación en fusión por confinamiento magnético, donde los world models permiten acelerar la exploración de escenarios operativos y el diseño de controladores sin necesidad de ejecutar costosas simulaciones de transporte en cada paso. Su tamaño reducido (1M de parámetros) lo hace especialmente atractivo para despliegue en entornos con recursos limitados y para experimentación rápida.

La información disponible es escasa: se trata de un repositorio de checkpoints de investigación sin pipeline definido, sin benchmarks publicados en la model card y sin datos de rendimiento. El checkpoint de referencia del artículo es la revisión etiquetada como `paper` (commit `ce5e017b7207bad9e301a239e0d1e545ad7fef89`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) con emulador congelado y corrección residual; receta "(g) emulator + correction" |
| Parámetros totales | 1M (presupuesto declarado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento
La arquitectura es una LSTM con un presupuesto de 1 millón de parámetros. El modelo se entrena con la receta "(g) emulator + correction": un emulador congelado (`emulator.pt`) que se carga durante la inferencia y un componente de corrección aprendido sobre él. Los checkpoints se guardan como ficheros PyTorch generados por el código de entrenamiento.

El autor indica que `final.pt` corresponde a la configuración de índice 15 de las 30 configuraciones exploradas en su búsqueda, seleccionada según la regla de selección recogida en `selection.json`. Los ficheros `seed_1.pt` y `seed_2.pt` son la misma configuración entrenada con otras semillas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este dominio). Los datos de entrenamiento se apoyan en múltiples bases de datos públicas de física de plasmas (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV L-H, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de máquinas ITER, MAST Upgrade, SPARC y STEP), todas ellas acreditadas en la model card.

## Capacidades
- Predicción de series temporales de plasmas de tokamak: evolución de variables del plasma bajo la receta emulador + corrección.
- Modelado de dinámica no lineal mediante LSTM con corrección residual sobre un emulador congelado.
- Reproducibilidad mediante múltiples semillas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento.
- Integración con el emulador `emulator.pt`, que el modelo carga en tiempo de inferencia.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el modelo no es un LLM.

## Casos de uso
- Exploración de escenarios operativos en tokamak: el modelo predice la evolución temporal del plasma para evaluar configuraciones candidatas antes de ejecutar simulaciones de transporte completas, reduciendo el coste computacional.
- Diseño y validación de controladores: al ser un world model rápido y ligero (1M de parámetros), puede integrarse en bucles de control o en entornos de aprendizaje por refuerzo para políticas de control de plasma.
- Estudio de transiciones de régimen (por ejemplo, L-H): el modelo se entrena con bases de datos de transiciones (TCV L-H) y puede emplearse para analizar la sensibilidad de la dinámica a parámetros de operación.
- Prototipado rápido en investigación: su tamaño reducido permite entrenar y evaluar variantes en una sola GPU de consumo, facilitando experimentos de ablación sobre la receta emulador + corrección.
- Generación de trayectorias sintéticas para aumento de datos: las predicciones del modelo pueden servir como datos aumentados para entrenar otros modelos o para preentrenar controladores.
- Comparación de recetas y semillas: los checkpoints multi-semilla permiten estudiar la robustez de la receta y la incertidumbre del modelo en la predicción de la evolución del plasma.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; con 1M de parámetros, el checkpoint en precisión completa ocupa del orden de unos pocos MB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100); no se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (los checkpoints son ficheros `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models de plasmas de tokamak con presupuesto de 1M de parámetros) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Información muy limitada: no se publican métricas de error, benchmarks ni detalles del dataset de entrenamiento más allá de las fuentes acreditadas.
- Modelo de investigación: repositorio con 0 descargas y 0 likes; no hay evidencia de validación por terceros.
- Dominio restringido: solo aplicable a series temporales de plasmas de tokamak; no es un modelo de propósito general.
- Dependencia del emulador: el modelo requiere cargar `emulator.pt` en inferencia; su comportamiento está ligado a la versión concreta del emulador congelado.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas; hay que revisar además las condiciones de atribución de las fuentes de datos (algunas con requisitos específicos de cita, como SPARCPublic).
- Riesgo de extrapolación: al entrenarse con bases de datos de máquinas y escenarios concretos, las predicciones fuera de la distribución de entrenamiento pueden ser poco fiables.
- Sin datos sobre sesgos, alucinación o limitaciones de contexto en el sentido habitual de los LLM; no aplica.

## Enlaces
- Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_g-residual
- Checkpoint del artículo (revisión `paper`): commit `ce5e017b7207bad9e301a239e0d1e545ad7fef89`
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de máquinas: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
