# fusion-world-model/gru_1m_f-sim

## Resumen

`gru_1m_f-sim` es un modelo del mundo (world model) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. Se trata de una red recurrente de tipo GRU con un presupuesto de 1 millón de parámetros, entrenada como emulador del simulador dentro de la receta denominada "(f) simulator emulator". Su objetivo es predecir la evolución temporal de variables de plasma en dispositivos de fusión por confinamiento magnético, sustituyendo al simulador físico en tareas de control y evaluación.

El modelo no es un modelo de lenguaje: es un modelo de series temporales orientado a un dominio científico muy específico (física de plasmas de tokamak). Forma parte de un estudio comparativo de arquitecturas y recetas de entrenamiento para modelos del mundo aplicados a la fusión, y en el repositorio se incluyen tanto el checkpoint elegido (`final.pt`) como réplicas con distintas semillas (`seed_1.pt`, `seed_2.pt`) y los controladores entrenados con PPO sobre el modelo congelado (directorio `e4/`).

La relevancia del modelo es acotada pero clara para su nicho: demuestra que un emulador de tan solo 1M de parámetros puede servir como sustituto rápido de un simulador de plasma en bucles de control, con la ventaja de que sus pesos y datos derivados están liberados bajo CC BY-SA 4.0. La información pública disponible en la model card es escasa en cuanto a métricas y arquitectura detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente, 2 capas segun la receta del piloto de diseño; dropout 0.1; warmup de 4.000 pasos) |
| Parametros totales | 1M (presupuesto de parámetros declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; dominio físico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU con un presupuesto de 1M de parámetros. Según la model card, la receta del piloto de diseño ganador emplea 2 capas, dropout 0.1 y un warmup de 4.000 pasos; esa configuración se reporta en el repositorio `gru-dw_1m_f-sim`, mientras que este repositorio (`gru_1m_f-sim`) contiene la revisión del diseño original del GRU. El checkpoint `final.pt` corresponde a la configuración de índice 24 de las 25 configuraciones evaluadas en la búsqueda, la que la regla de selección de dicha búsqueda clasifica en primer lugar (los scores están en `selection.json`).

El entrenamiento se realizó como emulador del simulador (receta "f"), es decir, el modelo aprende a reproducir las salidas de un simulador físico de plasmas de tokamak a partir de datos de entrenamiento. Los datos proceden de múltiples fuentes de física de fusión citadas en la model card: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de datos de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de datos de transición L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se documenta en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO; sí se menciona que los controladores del directorio `e4/` se entrenaron con una receta PPO congelada sobre el modelo del mundo.

## Capacidades

- Predicción de series temporales de variables de plasma de tokamak (emulación del simulador físico).
- Modelado del mundo para evaluación de controladores: el directorio `e4/` contiene controladores entrenados con PPO sobre el modelo congelado, lo que indica que el modelo puede usarse como entorno de entrenamiento de políticas de control.
- Reproducibilidad mediante múltiples semillas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües: no aplica.
- Capacidad especial: servir como sustituto rápido (surrogate) de un simulador de plasma en bucles de control y optimización.

## Casos de uso

- Emulación rápida de simulaciones de plasma: sustituir al simulador físico en barridos de parámetros donde la latencia del simulador completo es prohibitiva, usando el GRU de 1M de parámetros como aproximación.
- Entrenamiento de controladores de plasma: el directorio `e4/` demuestra el uso del modelo congelado como entorno para PPO; útil para investigar políticas de control de la transición L-H, el límite de densidad o el confinamiento H-mode.
- Evaluación comparativa de arquitecturas: el repositorio forma parte de un estudio que compara recetas (frente a `old_recipe/final.pt` y `gru-dw_1m_f-sim`), útil para investigadores que replican el benchmark.
- Estudio de estabilidad del entrenamiento: las réplicas con semillas permiten analizar la varianza de los resultados y la robustez de la selección de hiperparámetros.
- Docencia e investigación en fusión: modelo ligero que cabe en cualquier GPU consumer y permite experimentar con emuladores de tokamak sin infraestructura pesada.
- Integración en pipelines de control en tiempo real: por su tamaño (1M de parámetros) puede desplegarse en CPU o GPU modesta dentro de un lazo de control, siempre que la fidelidad del emulador sea suficiente para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en coma flotante de 32 bits (1M de parámetros ocupa ~4 MB de pesos; el resto es overhead de runtime).
- GPU recomendadas: cualquier GPU moderna es sobrada; no se requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso CPU son suficientes.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de series temporales).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `gru_1m_f-sim` (este) | 1M | no disponible | CC BY-SA 4.0 | Hugging Face |
| `gru-dw_1m_f-sim` | 1M | no disponible | no disponible | Hugging Face (mismo autor) |
| `old_recipe/final.pt` (misma receta anterior) | 1M | no disponible | CC BY-SA 4.0 | Incluido en este repositorio |

No se dispone de información sobre modelos comparables de otros autores para emulación de plasmas de tokamak con este tamaño y licencia.

## Limitaciones y advertencias

- Modelo de dominio muy específico: no es un modelo de lenguaje ni un modelo general; su uso fuera de la física de plasmas de tokamak no está justificado.
- La model card no documenta métricas de error, benchmarks ni evaluación de fidelidad frente al simulador; no es posible cuantificar su precisión a partir de la información disponible.
- El checkpoint `final.pt` es la configuración seleccionada por una regla de búsqueda sobre 25 configuraciones, no necesariamente la de mejor rendimiento absoluto; la selección puede estar sesgada por el criterio de la búsqueda.
- El repositorio incluye un checkpoint de una receta anterior (`old_recipe/final.pt`) que no debe confundirse con el modelo reportado en el paper.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual; hay que citar las fuentes de datos (FAIR-MAST, HDB5, PR08, etc.) según se indica en la model card.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de predicciones no físicas fuera del dominio de entrenamiento.
- No se documentan sesgos, limitaciones de contexto ni restricciones adicionales más allá de las de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_f-sim
- Repositorio del piloto de diseño: https://huggingface.co/fusion-world-model/gru-dw_1m_f-sim
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664; doi:10.1088/1361-6587/adc8ce
- OpenSTEP: doi:10.14468/07jt-s540
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066; QLKNN11D: doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
