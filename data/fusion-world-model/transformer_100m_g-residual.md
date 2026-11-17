# fusion-world-model/transformer_100m_g-residual

## Resumen

`transformer_100m_g-residual` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de un transformer de aproximadamente 100 millones de parámetros entrenado para emular y corregir la dinámica de plasmas en reactores de fusión, un problema de series temporales científicas de alta dimensionalidad. El modelo forma parte de una receta denominada "g" (emulador + corrección), en la que un emulador congelado proporciona una predicción base que el transformer refina.

El checkpoint publicado corresponde a la configuración seleccionada (índice 2) entre las 30 configuraciones exploradas durante la búsqueda de hiperparámetros del autor, según el criterio de selección registrado en `selection.json`. El repositorio incluye además dos réplicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`), el emulador congelado (`emulator.pt`) y los ficheros de configuración y manifiesto.

Es relevante porque aplica arquitecturas transformer a la modelización predictiva de plasmas de fusión, un dominio donde los modelos de mundo empiezan a usarse para sustituir o acelerar simulaciones físicas costosas. El modelo no es de propósito general: está especializado en datos de tokamak y su uso fuera de ese dominio carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de mundo para series temporales de plasma de tokamak) |
| Parametros totales | ~100M (presupuesto declarado por el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer entrenado como modelo de mundo sobre datos de plasma de tokamak. La receta "g" combina un emulador congelado (`emulator.pt`) que genera una predicción base y un transformer que aprende una corrección residual sobre esa predicción. El checkpoint `final.pt` corresponde a la configuración mejor clasificada por la regla de selección del autor entre 30 configuraciones exploradas; `seed_1.pt` y `seed_2.pt` son la misma configuración reentrenada con semillas distintas, lo que permite evaluar la varianza del entrenamiento.

Los datos de entrenamiento se apoyan en múltiples bases de datos públicas de física de plasmas: FAIR-MAST (UKAEA), HDB5 (base internacional de confinamiento H-mode), PR08 (base de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Predicción y emulación de la evolución temporal de plasmas de tokamak a partir de datos de entrada del dominio.
- Corrección residual sobre las predicciones de un emulador físico congelado (receta "g").
- Modelización de series temporales científicas de alta dimensionalidad en el contexto de fusión.
- Reproducibilidad mediante múltiples semillas de entrenamiento publicadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de propósito general.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de la evolución de un plasma en un tokamak: el modelo puede generar trayectorias temporales de magnitudes del plasma dadas unas condiciones iniciales, sustituyendo simulaciones numéricas costosas por inferencia rápida.
- Aceleración de estudios de escenarios: al emular la dinámica del plasma, permite explorar barridos de parámetros de operación (corriente, densidad, geometría) sin ejecutar el código físico completo en cada punto.
- Corrección de emuladores existentes: la receta "g" permite refinar las predicciones de un emulador congelado (`emulator.pt`), mejorando la fidelidad en regímenes donde el emulador base presenta desviaciones.
- Análisis de transiciones de régimen (L-H): con datos de TCV integrados en el entrenamiento, el modelo puede emplearse para estudiar condiciones de transición entre regímenes de confinamiento.
- Estudio de límites de densidad: apoyado en la Open Density Limit Database de Alcator C-Mod, puede usarse para modelizar el comportamiento cerca del límite de densidad.
- Comparación entre máquinas: al entrenarse con datos de ITER, MAST Upgrade, SPARC y STEP, puede emplearse para análisis comparativos de escenarios entre distintos tokamaks.
- Investigación metodológica en modelos de mundo científicos: sirve como referencia reproducible (checkpoints con múltiples semillas y manifiesto SHA-256) para estudiar la estabilidad del entrenamiento de transformers en dominios físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para los pesos de un modelo de 100M de parámetros; el consumo real depende del tamaño de las secuencias de entrada y del emulador congelado que se carga junto al transformer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para cargar los pesos; para lotes grandes o secuencias largas se recomienda una RTX 3090/4090 o una A100/H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (RTX 3060 en adelante).
- Opciones de despliegue: al ser checkpoints PyTorch crudos guardados por el código de entrenamiento, no hay integración documentada con vLLM, llama.cpp, Ollama o TGI; el despliegue requiere cargar los pesos con PyTorch y el código de inferencia del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| transformer_100m_g-residual | ~100M | no disponible | Modelo de mundo de plasma de tokamak | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables de modelización de plasma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (modelos de mundo para plasmas de tokamak) en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de lenguaje ni de propósito general; solo es válido para datos de plasma de tokamak dentro de la distribución de entrenamiento.
- Riesgo de extrapolación fuera de dominio: al entrenarse con bases de datos específicas (FAIR-MAST, HDB5, PR08, TCV, SPARC, STEP, entre otras), su comportamiento fuera de esos regímenes y máquinas no está garantizado.
- Dependencia del emulador congelado: la receta "g" requiere cargar `emulator.pt`; un cambio o sustitución del emulador invalida el modelo.
- Sesgos: no documentados por el autor; en datos experimentales de fusión pueden existir sesgos de cobertura por máquina o régimen de operación.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribución y compartir-al-igual de las obras derivadas, lo que puede condicionar su integración en productos propietarios.
- Reproducibilidad: los checkpoints son ficheros PyTorch guardados por el código de entrenamiento; no hay formato estándar (safetensors/GGUF) ni herramientas de despliegue documentadas.
- Sin métricas publicadas: no se han divulgado resultados de benchmarks, por lo que la evaluación de calidad debe hacerse por cuenta del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_g-residual
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
