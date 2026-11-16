# fusion-world-model/transformer_1m_f-sim

## Resumen

`transformer_1m_f-sim` es un modelo de mundo (*world model*) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. Se trata de un transformer de presupuesto de 1 millón de parámetros entrenado con la receta (f), denominada "simulator emulator" (emulador de simulador), dentro de una búsqueda de 30 configuraciones. Su función es emular el comportamiento temporal de un plasma de fusión a partir de datos experimentales y de simulación, un problema central para el control y la predicción en reactores de fusión por confinamiento magnético.

El modelo se distribuye como checkpoints de PyTorch (`.pt`) acompañados de los ficheros de configuración, selección y manifiesto del entrenamiento. No es un modelo de lenguaje: es un modelo de series temporales especializado en física de plasmas, por lo que no soporta generación de texto, código ni tool calling. Su relevancia radica en que aplica arquitecturas transformer a un dominio científico acotado (tokamaks) con datos abiertos y trazabilidad completa de las fuentes.

La información pública disponible es limitada: no se documentan resultados de benchmarks, idiomas, ni detalles de la arquitectura más allá de "transformer" y el presupuesto de parámetros. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de series temporales para plasmas de tokamak) |
| Parametros totales | 1 millón (presupuesto declarado: 1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Libreria | PyTorch |
| Tamano del repo | 0.0 GB (según Hugging Face) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 1 millón de parámetros orientado a modelar series temporales de plasmas de tokamak. El autor no detalla en la model card el número de capas, dimensiones ocultas, mecanismo de atención ni la formulación exacta de la tarea (predicción, emulación o *rollout*). La receta se identifica como (f) "simulator emulator", lo que sugiere que el modelo aprende a aproximar la salida de un simulador físico a partir de datos, aunque la model card no especifica el simulador ni el esquema de entrenamiento.

El proceso de selección consistió en entrenar 30 configuraciones y elegir la de índice 12 según la regla de selección del autor, cuyos resultados se guardan en `selection.json`. El checkpoint `final.pt` corresponde a esa configuración; `seed_1.pt` y `seed_2.pt` son reentrenamientos con semillas distintas. El checkpoint del artículo es la revisión etiquetada `paper` (commit `87cf90df448240cb7119908374628d74f553fbfd`). Los datos de entrenamiento se apoyan en múltiples fuentes abiertas de física de plasmas: FAIR-MAST (UKAEA), HDB5, PR08, la Open Density Limit Database de Alcator C-Mod, la base de transición L-H de TCV, OpenSTEP, SPARCPublic, las tablas de flujo QLKNN10D y QLKNN11D, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se indican el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO (cabe esperar que no, dado el dominio).

## Capacidades

- Emulación de la evolución temporal de plasmas de tokamak a partir de datos experimentales y de simulación.
- Modelado de series temporales físicas en el dominio de la fusión por confinamiento magnético.
- Reproducibilidad mediante múltiples semillas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento.
- Trazabilidad de datos: la model card documenta y atribuye todas las fuentes de entrenamiento.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: no procesa lenguaje natural.

## Casos de uso

- Emulación rápida de simulaciones de plasma: sustituir o acelerar la evaluación de un simulador físico en bucles de diseño, usando el transformer como aproximación de bajo coste computacional (1M de parámetros).
- Predicción de la evolución temporal de un plasma: alimentar el modelo con series temporales de diagnósticos y obtener la trayectoria futura para anticipar transiciones o inestabilidades.
- Control en tiempo real de tokamaks: un modelo de 1M de parámetros es ligero y puede integrarse en lazos de control con latencias bajas, siempre que se valide su fidelidad frente al simulador.
- Estudios de sensibilidad y análisis de incertidumbre: entrenar y comparar múltiples semillas para cuantificar la variabilidad del modelo ante perturbaciones en los datos de entrada.
- Investigación comparativa en modelado de mundo para fusión: servir como referencia de bajo presupuesto para contrastar arquitecturas o recetas en el mismo dominio.
- Reproducibilidad de resultados científicos: usar el checkpoint etiquetado `paper` para replicar los resultados del artículo asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1M de parámetros, el checkpoint ocupa del orden de unos pocos megabytes en FP32 (4 MB solo en pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada; también es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en hardware embebido.
- Opciones de despliegue: al ser un checkpoint de PyTorch (`.pt`), requiere cargarlo con el código de entrenamiento del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de mundo para plasmas de tokamak con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto, código o razonamiento general.
- La model card no documenta la arquitectura interna, el contexto, la formulación de la tarea ni los resultados, lo que dificulta la evaluación independiente.
- Riesgo de sesgo y de error de emulación: al entrenarse sobre bases de datos experimentales concretas (FAIR-MAST, HDB5, PR08, TCV, SPARC, etc.), su validez fuera de esas máquinas y regímenes operativos no está garantizada.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia (ShareAlike), lo que puede condicionar su integración en productos propietarios.
- La licencia de los pesos hereda la de los datos FAIR-MAST; el autor advierte de que el uso debe respetar las atribuciones de todas las fuentes listadas.
- El repositorio no registra descargas ni likes, y el tamaño reportado es 0.0 GB, lo que puede indicar que los ficheros no están efectivamente alojados o que la métrica no se ha actualizado.
- Para producción, es imprescindible validar el modelo frente al simulador de referencia y frente a datos experimentales del tokamak objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_f-sim
- Commit del checkpoint del artículo: `87cf90df448240cb7119908374628d74f553fbfd` (tag `paper`)
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
