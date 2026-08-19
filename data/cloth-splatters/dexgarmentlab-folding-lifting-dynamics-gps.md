# Cloth-splatters/dexgarmentlab-folding-lifting-dynamics-gps

## Resumen

El modelo `dexgarmentlab-folding-lifting-dynamics-gps` es un `GPSDynamicsModel`, un modelo de dinámica basado en grafos (GNN + Transformer) desarrollado por el usuario Cloth-splatters para predecir la evolución de mallas de tela durante tareas de manipulación robótica. Concretamente, dado el estado de las tres mallas anteriores y una acción de pinza tridimensional, el modelo predice los siguientes cinco fotogramas de malla mediante un proceso de difusión DDPM. Está entrenado con demostraciones de plegado y levantamiento-colocación de prendas del entorno DexGarmentLab, y es capaz de trabajar con mallas de número variable de vértices (hasta 2048) utilizando el estado de reposo y la topología propia de cada pieza, sin necesidad de una plantilla global.

Este modelo es relevante porque aborda un problema central en la robótica de manipulación de objetos deformables: la predicción precisa y eficiente de la dinámica de telas, que resulta esencial para la planificación de movimientos, el control predictivo y el aprendizaje por refuerzo en entornos simulados. Al estar basado en difusión, ofrece una alternativa a los métodos deterministas, permitiendo modelar la incertidumbre inherente a los materiales deformables. El repositorio tiene un tamaño de 0.1 GB y está integrado con la librería `diffusers`, lo que facilita su uso dentro del ecosistema de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN + Transformer con difusión DDPM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (trabaja con mallas de hasta 2048 vértices y secuencias de 3 fotogramas de entrada, 5 de salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina una red neuronal de grafos (GNN) con un transformer para procesar mallas de tela con topología variable. La entrada consiste en los tres fotogramas de malla anteriores y una acción de pinza 3D (máximo una pinza). La salida son los cinco fotogramas siguientes, generados mediante un proceso de difusión DDPM (Denoising Diffusion Probabilistic Models). La atención cruzada se fusiona en paralelo con la auto-atención (modo `cross_attn_mode: parallel`), una configuración que el checkpoint conserva del entrenamiento original. El modelo utiliza el estado de reposo y la topología de cada malla individual, evitando la necesidad de una plantilla global.

Los datos de entrenamiento provienen del dataset `dexgarmentlab_folding_lifting_meshes.h5`, que contiene demostraciones simuladas de plegado y levantamiento-colocación de prendas variadas. El mejor valor de pérdida de validación alcanzado es 0.00012608407087100204, correspondiente al checkpoint `checkpoint-best` incluido en el directorio `model/`. La ejecución de entrenamiento se identifica como `dexgarment_dyn_gps_2026-08-03_12-45-01_7138502`, con la configuración completa disponible en `config.yml`. No se especifica el número total de tokens ni la composición exacta del dataset.

## Capacidades

- Predicción de secuencias de mallas de tela: dado el historial de tres fotogramas y una acción de pinza, genera cinco fotogramas futuros.
- Manejo de mallas con número variable de vértices (hasta 2048), adaptándose a la topología de cada pieza sin plantilla global.
- Modelado de incertidumbre mediante difusión DDPM, lo que permite generar múltiples predicciones plausibles.
- Soporte para una pinza robótica con acción tridimensional.
- Integración con la librería `diffusers`, facilitando la carga y el uso mediante `from_pretrained`.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Planificación de movimientos en manipulación de ropa: el modelo puede predecir cómo se deformará una prenda al ser agarrada por un robot, permitiendo planificar trayectorias de pinza que eviten arrugas o pliegues no deseados.
- Control predictivo de robots bimanuales: aunque el modelo actual soporta una sola pinza, puede integrarse en bucles de control donde se predicen varios pasos futuros de la malla para ajustar las acciones en tiempo real.
- Simulación de escenarios de plegado automático: en entornos de entrenamiento como DexGarmentLab, el modelo puede sustituir a simuladores físicos costosos, acelerando el entrenamiento de políticas de aprendizaje por refuerzo.
- Generación de datos sintéticos para entrenamiento de estimación de estado: al predecir mallas futuras, puede utilizarse para aumentar conjuntos de datos de percepción, generando variaciones realistas de deformación.
- Evaluación de estrategias de agarre: el modelo permite probar diferentes posiciones y fuerzas de pinza de forma rápida, ayudando a seleccionar agarres que minimicen el deslizamiento o el daño a la tela.
- Desarrollo de asistentes robóticos domésticos: en tareas como doblar o colgar ropa, el modelo puede servir como componente de predicción en un sistema de control jerárquico que coordine percepción y actuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación del checkpoint óptimo, que alcanza 0.00012608407087100204, pero no se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de datos específicos sobre VRAM o GPU recomendadas en la información proporcionada.
- El tamaño del repositorio (0.1 GB) sugiere un modelo de dimensiones reducidas, probablemente ejecutable en GPUs de consumo (p. ej., NVIDIA RTX 3060 o superiores) con suficiente memoria, pero no se puede confirmar sin conocer el número de parámetros.
- Dado que el modelo está integrado con `diffusers`, es compatible con el pipeline estándar de carga de esa librería. Para despliegue en producción, se podría considerar el uso de frameworks como vLLM o TGI, aunque no hay indicaciones específicas.
- La latencia y el throughput dependen del hardware y de la resolución de la malla (hasta 2048 vértices); no se proporcionan estimaciones.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables específicamente orientados a la predicción de dinámica de mallas de tela mediante difusión en la información disponible. Otros modelos de simulación de deformables (p. ej., basados en redes neuronales gráficas como GNS o MGN) existen en la literatura, pero no se dispone de datos de comparación directa.

## Limitaciones y advertencias

- El modelo solo soporta una pinza, lo que limita su uso en tareas bimanuales, aunque el entorno DexGarmentLab está diseñado para manipulación bimanual.
- El número máximo de vértices por malla está limitado a 2048, lo que puede ser insuficiente para prendas de alta resolución.
- La licencia no está especificada, por lo que no se garantiza el uso comercial; se recomienda contactar con el autor antes de utilizarlo en aplicaciones de producción.
- Al estar entrenado con datos simulados, existe riesgo de desajuste sim-to-real: las predicciones pueden no reflejar con precisión el comportamiento físico de telas reales.
- El modo de atención cruzada está fijado en `parallel`; si se carga el modelo con otra configuración, la inferencia podría ejecutarse con parámetros no entrenados, dando resultados incorrectos.
- No se han publicado evaluaciones sobre sesgos o alucinaciones (predicciones físicamente irreales), por lo que se recomienda validar las salidas en aplicaciones críticas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Cloth-splatters/dexgarmentlab-folding-lifting-dynamics-gps)
- [Dataset asociado en HuggingFace](https://huggingface.co/datasets/Cloth-splatters/dexgarmentlab-folding-lifting-meshes)
- [Paper de DexGarmentLab (arXiv)](https://arxiv.org/html/2505.11032v3)
- [Página del proyecto DexGarmentLab](https://wayrise.github.io/DexGarmentLab/)
