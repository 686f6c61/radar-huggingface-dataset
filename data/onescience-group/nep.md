# OneScience-Group/NEP

## Resumen

NEP (Neural Evolution Potential) es un ejemplo de entrenamiento de potencial de red neuronal para simulación de materiales, desarrollado por OneScience-Group sobre el framework MatPL. El modelo aprende a predecir energías, fuerzas y viriales de sistemas atómicos a partir de datos estructurales, lo que permite realizar simulaciones de dinámica molecular con precisión de cálculo cuántico a una fracción del coste computacional.

Este modelo se presenta como una plantilla de entrenamiento para sistemas de cobre (Cu) y carburo de litio-silicio (LiSiC), aunque el enfoque es generalizable a otros materiales si se proporcionan los datos adecuados. No incluye pesos preentrenados; el repositorio contiene el código y la configuración necesarios para entrenar el potencial desde cero. Su relevancia radica en facilitar la adopción de potenciales de machine learning en la comunidad de ciencia de materiales, ofreciendo un flujo de trabajo reproducible y compatible con entornos de computación de altas prestaciones (SLURM) y aceleradores como DCU o GPU.

La arquitectura subyacente corresponde a un potencial de red neuronal con evolución neuronal, un método que combina descriptores atómicos con redes neuronales entrenadas mediante algoritmos evolutivos. La licencia es GPL-3.0 y el idioma principal de la documentación es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial de red neuronal con evolución neuronal (NEP) sobre framework MatPL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de potencial interatómico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos entrenados) |

## Arquitectura y entrenamiento

NEP se basa en el framework MatPL, una librería de PyTorch para el entrenamiento y la simulación de potenciales de machine learning. La arquitectura típica de un potencial NEP emplea descriptores de simetría local (basados en funciones de base radial y angular) que capturan el entorno atómico, seguidos de una red neuronal que mapea estos descriptores a energías, fuerzas y viriales. El entrenamiento se realiza mediante optimización evolutiva, que ajusta los pesos de la red para minimizar la diferencia entre las predicciones y los datos de referencia (típicamente obtenidos de cálculos DFT).

Los datos de entrenamiento no se incluyen en el repositorio; se deben descargar del dataset `OneScience-Group/MatPL` desde Hugging Face. El README menciona que el modelo se ha probado con sistemas de Cu y LiSiC, pero no se especifica el número de estructuras ni la composición exacta del dataset. El entrenamiento se lanza mediante archivos de configuración JSON (`Cu_nep_train.json`, `LiSiC_nep_train.json`) y puede ejecutarse en una sola GPU o mediante SLURM para clústeres.

No se detallan innovaciones técnicas específicas más allá de la integración con MatPL y la compatibilidad con aceleradores DCU (a través de DTK) y GPU.

## Capacidades

- Predicción de energía total, fuerzas atómicas y viriales para sistemas de materiales.
- Entrenamiento de potenciales interatómicos personalizados a partir de datos estructurales (formato `pwmat/movement`).
- Simulación de dinámica molecular para sistemas de Cu y LiSiC, con posibilidad de extender a otros materiales.
- Ejecución en entornos de clúster mediante SLURM (scripts `submit.sh`).
- Integración con el entorno OneCode de OneScience para programación AI4S.
- Soporte de aceleración por GPU y DCU (requiere DTK 25.04.2 o superior).

## Casos de uso

- Entrenamiento de potenciales para cobre (Cu): el repositorio incluye una configuración lista para entrenar un potencial de Cu, útil para estudiar propiedades mecánicas, defectos o difusión en este metal.
- Entrenamiento de potenciales para LiSiC: permite modelar el comportamiento de este material compuesto, relevante en aplicaciones de baterías o electrónica de potencia.
- Simulación de dinámica molecular de materiales: una vez entrenado, el potencial puede usarse para realizar simulaciones de larga duración que serían inviables con métodos ab initio.
- Migración de datos propios: el usuario puede convertir sus datos de estructura atómica (por ejemplo, salidas de PWmat) al formato soportado por MatPL y entrenar un potencial para su sistema específico.
- Integración en pipelines de computación de altas prestaciones: los scripts SLURM facilitan el entrenamiento en clústeres, permitiendo escalar a sistemas grandes o múltiples réplicas.
- Investigación en ciencia de materiales: el modelo sirve como base para explorar nuevos materiales o fenómenos, combinando precisión cuántica con eficiencia computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas de precisión (como errores de energía o fuerzas) ni comparaciones con otros potenciales de machine learning.

## Requisitos de hardware

- Se recomienda una GPU o DCU para el entrenamiento completo; una CPU solo es adecuada para pruebas de importación y configuraciones pequeñas.
- Usuarios de DCU deben instalar DTK 25.04.2 o superior, o la versión recomendada por OneScience para su clúster.
- No se especifican requisitos de VRAM ni modelos concretos de GPU. Dado que se trata de un potencial atómico, el consumo de memoria dependerá del número de átomos en la celda de simulación y del tamaño de la red neuronal.
- Opciones de despliegue: el entrenamiento se ejecuta con el comando `MatPL train <config.json>`, ya sea en una sola GPU o mediante SLURM. No se mencionan herramientas de inferencia como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros potenciales de machine learning (como DeepMD, MACE o NequIP) en la información del repositorio.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados; el usuario debe ejecutar el proceso de entrenamiento completo, lo que requiere acceso a datos de referencia y recursos computacionales suficientes.
- Los datos de entrenamiento no están incluidos y deben descargarse por separado desde el dataset `OneScience-Group/MatPL`.
- La licencia GPL-3.0 implica que cualquier trabajo derivado debe distribuirse bajo la misma licencia, lo que puede restringir su uso en proyectos propietarios.
- El modelo está orientado a sistemas de materiales específicos (Cu, LiSiC); su aplicación a otros materiales requiere reentrenamiento con datos adecuados.
- No se documentan sesgos ni riesgos de alucinación, pero en el contexto de potenciales interatómicos, la extrapolación fuera del dominio de entrenamiento puede producir predicciones físicamente inconsistentes.
- La documentación está en inglés; no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/NEP
- Dataset MatPL: https://huggingface.co/datasets/OneScience-Group/MatPL
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de skills (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio principal (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de skills (Gitee): https://gitee.com/onescience-ai/oneskills
