# OneScience-Group/PrecipExtremes-GAN

## Resumen

PrecipExtremes-GAN es una red generativa adversarial (GAN) con generador residual diseñada para el downscaling de precipitación: transforma campos atmosféricos de baja resolución (predictores en rejilla de 1,5 grados) en campos diarios de precipitación de alta resolución (aproximadamente 12 km). El método lo propone un consorcio liderado por el National Institute of Water and Atmospheric Research (NIWA) de Nueva Zelanda, junto con la University of New South Wales (UNSW) y otras instituciones colaboradoras. El objetivo es evaluar la capacidad de extrapolación de un modelo generativo entrenado con clima histórico cuando se le aplica a cambios en precipitaciones extremas en climas más cálidos.

El repositorio publicado bajo el identificador `OneScience-Group/PrecipExtremes-GAN` no es una distribución oficial del artículo, sino una reproducción de ingeniería independiente de sus especificaciones públicas. Incluye código en PyTorch para datos sintéticos, entrenamiento (mono-GPU y multi-GPU con `torchrun`), inferencia y evaluación, pero no incluye pesos preentrenados: la model card indica explícitamente que el artículo no publica pesos cargables directamente y que el repositorio no incluye ficheros bajo `weight/`.

Es relevante para el ámbito de la IA aplicada a ciencias de la Tierra porque aborda un problema concreto y crítico: estimar cómo cambian los extremos de precipitación (percentil 99,5) en escenarios de emisiones altas (SSP3-7.0) a escala regional, usando cuatro simulaciones históricas y futuras independientes forzadas por modelos climáticos globales (GCM), además de simulaciones CCAM forzadas por ACCESS-CM2 para el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN residual; generador convolucional para downscaling espacial, con etapa previa de U-Net determinista |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de downscaling espacial, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos y documentación); el modelo procesa variables físicas, no texto |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); checkpoint de entrenamiento en `result/checkpoints/precip_extremes_gan.pt`. No se distribuyen pesos preentrenados |
| Framework | PyTorch |
| Variables de entrada | ocho predictores atmosféricos: U, V, T y Q a 500 y 850 hPa, en rejilla de 1,5 grados |
| Variable de salida | precipitación diaria a ~12 km |
| Rejilla de la reproducción de ingeniería | 24×24 → 96×96 (documentada explícitamente; el artículo no reporta las dimensiones finales de los tensores) |
| Dominio geográfico | Nueva Zelanda |
| Salidas de inferencia | predicción determinista, miembro residual de la GAN y media del ensemble (`result/output/predictions.npz`) |
| Métricas de evaluación | MAE diario, error en el percentil 99,5 y error de la señal climática futuro-frente-a-histórico |

## Arquitectura y entrenamiento

El método combina dos etapas. Primero se ajusta una U-Net determinista que aprende la correspondencia entre los ocho campos atmosféricos de entrada y la precipitación de alta resolución. Después se entrena un generador residual que corrige la salida determinista y añade variabilidad realista; la función de pérdida combina tres términos: error cuadrático medio (MSE), pérdida adversaria (discriminador) y una pérdida orientada a intensidad, pensada para no suavizar los extremos. La inferencia puede producir la salida determinista, la salida del generador residual y la media de un ensemble, lo que permite comparar un enfoque determinista con uno generativo y cuantificar la dispersión entre miembros.

En cuanto a los datos, el artículo entrena con simulaciones CCAM forzadas por ACCESS-CM2 y evalúa sobre cuatro simulaciones independientes forzadas por GCM, tanto históricas como de escenario SSP3-7.0. El repositorio de ingeniería, en cambio, genera datos sintéticos mediante `scripts/fake_data.py` sobre una rejilla `24×24 → 96×96` y advierte de que esos datos solo validan la ingeniería y no representan las distribuciones, la escala ni el rendimiento del artículo. La configuración por defecto reduce el número de muestras, el ancho de las capas, el tamaño del ensemble y las épocas. El entrenamiento distribuido se lanza con `torchrun` (por ejemplo, `--nproc_per_node=8`).

## Capacidades

- Downscaling de precipitación diaria: genera campos de alta resolución a partir de ocho predictores atmosféricos en rejilla gruesa.
- Modelado de extremos: la pérdida de intensidad y la evaluación específica buscan reproducir eventos de precipitación extrema, con foco en el percentil 99,5.
- Extrapolación climática: permite comparar el comportamiento del modelo entrenado en clima histórico frente a escenarios futuros (SSP3-7.0).
- Inferencia en ensemble: produce salidas deterministas, de miembro residual y de media de ensemble, útiles para estimar incertidumbre.
- Entrenamiento distribuido multi-GPU mediante `torchrun`.
- Evaluación integrada: cálculo de MAE diario, error de percentil extremo y error de señal climática, con salida de métricas en JSON y figura comparativa PNG.
- Soporte de ejecución en entornos ModelScope/OneCode para validación de datos estructurados, entrenamiento, inferencia y visualización.
- Soporte de aceleradores GPU y DCU (requiere DTK 25.04.2 o posterior en el caso de DCU).
- No dispone de tool calling ni function calling, no soporta agentes ni razonamiento multi-paso y no tiene capacidades de visión, audio ni diálogo multilingüe: no es un modelo de lenguaje.

## Casos de uso

- Downscaling diario de precipitación para estudios regionales: se introducen los ocho predictores (U, V, T, Q a 500 y 850 hPa) y el modelo devuelve un campo diario a ~12 km, adecuado para alimentar análisis hidrológicos sobre Nueva Zelanda.
- Análisis de precipitación extrema en escenarios de calentamiento: la evaluación específica del percentil 99,5 permite cuantificar cómo se desplazan los extremos entre simulaciones históricas y SSP3-7.0, un insumo directo para informes de adaptación climática.
- Validación de infraestructura y obra civil: los campos de precipitación extrema a escala local sirven para dimensionar drenaje, embalses y planes de gestión de inundaciones, comparando el comportamiento histórico con el proyectado.
- Generación de ensembles para propagación de incertidumbre: la salida de miembro residual y media de ensemble permite alimentar modelos hidrológicos con múltiples realizaciones en lugar de una única serie determinista.
- Reproducción de experimentos y docencia: el repositorio incluye datos sintéticos, entrenamiento, inferencia y evaluación, de modo que sirve como banco de pruebas para comparar U-Net determinista frente a GAN residual sin depender de datos climáticos restringidos.
- Validación de pipelines de entrenamiento distribuido: el flujo con `torchrun` y ocho procesos por nodo resulta útil para verificar infraestructura de computación científica antes de lanzar entrenamientos a mayor escala.
- Integración en plataformas AI4S: la ejecución en entornos ModelScope u OneCode permite desplegar el flujo completo (datos, entrenamiento, métricas y visualización) en plataformas de computación científica gestionadas con aceleradores GPU o DCU.
- Evaluación metodológica de downscaling generativo: al no requerir pesos oficiales, el código permite estudiar el efecto de las pérdidas MSE, adversaria e de intensidad sobre la reproducción de extremos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MAE, error en el percentil 99,5 ni error de señal climática obtenidas con datos reales; el repositorio genera datos sintéticos que, según sus propios términos, no representan las distribuciones ni el rendimiento del artículo. El artículo asociado puede contener tablas de resultados, pero no forman parte de la información proporcionada.

## Requisitos de hardware

- Se recomienda GPU o DCU; la CPU solo se contempla para validación de conectividad con la configuración de muestra pequeña.
- No se publican cifras de VRAM. La configuración de ingeniería documentada (`24×24 → 96×96`, con reducción de muestras, ancho, tamaño de ensemble y épocas) es pequeña, por lo que es plausible que quepa en GPU de consumo, pero se trata de una inferencia a partir de la configuración, no de un dato confirmado por el autor.
- Usuarios de DCU deben instalar DTK con antelación; se recomienda DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster en uso.
- Entorno GPU: `onescience[earth-gpu]` sobre Python 3.11, con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`.
- Entorno DCU: `onescience[earth-dcu]` sobre Python 3.11.
- Entrenamiento distribuido: `torchrun --nproc_per_node=8 --nnodes=1` como configuración de referencia.
- Opciones de despliegue: ejecución directa con PyTorch (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`) o a través de ModelScope/OneCode. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La única referencia interna es la comparación que el propio repositorio permite establecer entre la U-Net determinista y el generador residual con ensemble, cuyas métricas se calculan con `scripts/result.py`. Cualquier comparación con otros métodos de downscaling (corrección de sesgo por cuantiles, redes convolucionales de superresolución o GANs climáticas previas) requeriría datos que no se incluyen en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrecipExtremes-GAN (esta ficha) | no disponible | no aplica | no disponible | apache-2.0 | Código en Hugging Face; sin pesos preentrenados |
| U-Net determinista (línea base incluida en el repositorio) | no disponible | no aplica | no disponible | apache-2.0 | Incluido en el mismo repositorio |
| Otras GANs de downscaling climático | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no distribuye pesos entrenados. Cualquier uso en producción exige entrenar desde cero o disponer de pesos obtenidos por otra vía.
- Los datos incluidos son sintéticos (`scripts/fake_data.py`) y, según la propia model card, no representan las distribuciones, la escala ni el rendimiento del artículo. Las métricas obtenidas con ellos no son extrapolables a resultados científicos.
- La rejilla de ingeniería `24×24 → 96×96` es una decisión de implementación del repositorio, no la configuración del artículo; las dimensiones reales de los tensores del trabajo original no se reportan.
- Dominio geográfico limitado a Nueva Zelanda y a la resolución de ~12 km. No hay evidencia de transferibilidad a otras regiones o resoluciones.
- Idiomas soportados: solo `en` en los metadatos. No hay soporte multilingüe ni de texto en general.
- Riesgo de campos físicamente implausibles: como modelo generativo, puede producir patrones de precipitación inconsistentes con la física atmosférica, especialmente fuera del rango de entrenamiento.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar la calidad de las salidas sin reproducir el experimento completo.
- La licencia `apache-2.0` se aplica a este repositorio de reproducción. El uso de los pesos oficiales, los datos y el código de los proyectos de origen queda sujeto a las licencias y términos de dichos proyectos, que deben verificarse por separado.
- Posible confusión de procedencia: el repositorio se presenta explícitamente como una reproducción independiente, no como la implementación oficial de NIWA, UNSW ni las instituciones colaboradoras.
- Los metadatos indican una fecha de creación y actualización de 2026-09-11, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de utilizarlo.
- No dispone de tool calling, agentes, visión ni audio; no debe evaluarse con los criterios propios de un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/PrecipExtremes-GAN
- Artículo: "On the Extrapolation of Generative Adversarial Networks for downscaling precipitation extremes in warmer climates": https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2024GL112492
- OneCode (entorno de programación AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
