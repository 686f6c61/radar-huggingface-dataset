# andreasburger/hip

## Resumen

HIP (Hessian Interatomic Potentials Without Derivatives) es un modelo de potencial interatómico basado en aprendizaje automático, desarrollado por un equipo de investigadores de varias instituciones (Andreas Burger, Luca Thiede, Nikolaj Rønne, Varinia Bernales, Nandita Vijaykumar, Tejs Vegge, Arghya Bhowmik y Alan Aspuru-Guzik). Su objetivo es predecir la matriz hessiana (segundas derivadas de la energía respecto a las posiciones atómicas) sin calcular derivadas explícitas, lo que acelera y estabiliza las simulaciones de dinámica molecular y el cálculo de propiedades vibracionales en materiales.

El modelo se publica en el repositorio de HuggingFace `andreasburger/hip`, junto con un artículo en arXiv (2509.21624) y un repositorio de código en GitHub. Se ofrecen tres checkpoints: `hip_v2` (entrenado de extremo a extremo, usado en el paper), `hesspred_v1` (afinado a partir de HORM EquiformerV2 para predecir Hessianos) y `hip_mace` (no publicado, integrado con el paquete hip-mace). La arquitectura exacta, el número de parámetros y la licencia no se especifican en la ficha pública.

La relevancia actual de HIP reside en que los potenciales interatómicos basados en redes neuronales son una alternativa eficiente a los cálculos de primeros principios (DFT) para simulaciones a gran escala. La predicción directa de Hessianos sin derivadas reduce el coste computacional y evita errores numéricos asociados a la diferenciación automática o a las diferencias finitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona EquiformerV2 en `hesspred_v1` y MACE en `hip_mace`, pero no se confirma para todos los checkpoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de potencial interatomico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 4.7 GB) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna de HIP. El título del paper indica que se trata de un potencial interatómico que predice Hessianos sin calcular derivadas, lo que sugiere una red neuronal entrenada para mapear configuraciones atómicas directamente a matrices hessianas. El checkpoint `hesspred_v1` se describe como un ajuste fino (finetune) de HORM EquiformerV2, un modelo basado en redes equivariantes, mientras que `hip_mace` está asociado al paquete hip-mace, probablemente basado en la arquitectura MACE (Message-passing Atomic Cluster Expansion). El checkpoint `hip_v2` se entrenó de extremo a extremo para el artículo.

No se especifican los datos de entrenamiento (número de estructuras, composición del dataset, si se usó RLHF o DPO, aunque esto último no es habitual en este tipo de modelos). Tampoco se mencionan innovaciones técnicas concretas más allá de la predicción de Hessianos sin derivadas.

## Capacidades

- Predicción de matrices hessianas para configuraciones atómicas, lo que permite calcular propiedades vibracionales y constantes de fuerza.
- Integración con simulaciones de dinámica molecular y optimización de geometrías.
- Posible cálculo de energías y fuerzas (implícito en un potencial interatómico, aunque no se declara explícitamente).
- Soporte para distintos checkpoints según la tarea: `hip_v2` para uso general, `hesspred_v1` para predicción específica de Hessianos, `hip_mace` para integración con el ecosistema MACE.
- No se indican capacidades de tool calling, agentes, visión o procesamiento de lenguaje.

## Casos de uso

- Simulación de dinámica molecular de materiales: el modelo puede proporcionar Hessianos en cada paso de simulación, acelerando el cálculo de fuerzas y energías en comparación con métodos de diferenciación numérica.
- Cálculo de espectros vibracionales (infrarrojo, Raman) a partir de las matrices hessianas predichas.
- Optimización de estructuras cristalinas y moleculares, donde el Hessiano es necesario para algoritmos de segundo orden (método de Newton).
- Estudio de transiciones de fase y mecanismos de reacción, que requieren puntos de silla y curvaturas de la superficie de energía potencial.
- Generación de conjuntos de entrenamiento para otros modelos de potenciales interatómicos, utilizando los Hessianos predichos como datos etiquetados.
- Integración en flujos de trabajo de química computacional y ciencia de materiales, donde se necesitan propiedades mecánicas (módulos elásticos, constantes de fuerza) de forma rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye tablas comparativas ni métricas de precisión o velocidad.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El tamaño del repositorio es de 4.7 GB, lo que sugiere que los checkpoints son relativamente grandes, pero sin conocer el número de parámetros no se puede estimar la VRAM necesaria. No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc., no aplican a este tipo de modelo). Se recomienda consultar el repositorio de GitHub para detalles de instalación y uso.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros potenciales interatómicos (como MACE, NequIP, Allegro, etc.). No se proporcionan datos de parámetros, rendimiento ni licencias de modelos alternativos en la documentación pública.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones desconocidas.
- No se documentan sesgos ni limitaciones de precisión. Como modelo de investigación, su validación en sistemas fuera del dominio de entrenamiento es incierta.
- El modelo no es un modelo de lenguaje; no procesa texto ni tiene capacidades conversacionales.
- Los checkpoints disponibles pueden tener diferentes grados de madurez: `hip_mace` se indica como no publicado, lo que sugiere que no ha sido sometido a revisión completa.
- No se ofrecen garantías de soporte para producción; se recomienda evaluar el modelo en el dominio de aplicación específico.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/andreasburger/hip
- Repositorio de código: https://github.com/BurgerAndreas/hip
- Paper en arXiv: https://arxiv.org/abs/2509.21624
