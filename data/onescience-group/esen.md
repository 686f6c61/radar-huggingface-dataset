# OneScience-Group/eSEN

## Resumen

eSEN (equivariant Smooth Energy Network) es un potencial interatómico basado en redes neuronales equivariantes de grafos, propuesto originalmente por FAIR Chemistry y adaptado por OneScience-Group para su uso práctico en ciencia de materiales. El modelo predice la energía total, las fuerzas atómicas y el tensor de tensión de estructuras periódicas, lo que permite realizar cálculos de punto único, relajación de estructuras y dinámica molecular con precisión de nivel DFT pero a una fracción del coste computacional.

OneScience-Group publica este repositorio con el código de inferencia y fine-tuning, un calculador ASE listo para usar y scripts de ejemplo para óxidos con funcional PBE. El repositorio no incluye los pesos preentrenados, que deben solicitarse directamente a FAIR Chemistry; se ofrecen tres checkpoints (MPTrj, OMat24 y OAM) con dominios de aplicación diferenciados. La relevancia actual de eSEN radica en su capacidad para acelerar simulaciones de materiales mediante aprendizaje automático, con una arquitectura equivariante que garantiza la conservación de fuerzas y la correcta simetría rotacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal equivariante de grafos (eSEN - equivariant Smooth Energy Network) |
| Parametros totales | 30 millones (segun nomenclatura de los checkpoints `esen_30m_*.pt`, no confirmado oficialmente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de potencial interatomico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en precision completa, probablemente FP32) |
| Idiomas soportados | no aplica (modelo cientifico; la documentacion esta en ingles) |
| Licencia | MIT (codigo); los pesos preentrenados tienen su propia licencia de FAIR Chemistry |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

eSEN es una red neuronal equivariante de grafos que toma como entrada grafos de estructuras cristalinas periódicas. Aprende una superficie de energía potencial suave mediante representaciones equivariantes bajo rotaciones, y obtiene fuerzas conservativas a partir del gradiente de la energía. Esta propiedad garantiza que las fuerzas derivadas sean físicamente consistentes con la energía predicha, un requisito esencial para simulaciones de dinámica molecular y relajación estructural.

Los checkpoints preentrenados cubren tres dominios: MPTrj (entrenado en el dataset Materials Project Trajectories, adecuado para inferencia PBE/PBE+U en cristales inorgánicos), OMat24 (para un rango más amplio de estructuras inorgánicas fuera de equilibrio) y OAM (punto de partida para preentrenamiento general). El repositorio no incluye el flujo completo de preentrenamiento desde inicialización aleatoria; su punto de entrada de entrenamiento está diseñado exclusivamente para fine-tuning de checkpoints existentes. El ejemplo de fine-tuning en óxidos utiliza supervisión con energía y fuerzas, sin entrenar sobre tensión.

## Capacidades

- Predicción de energía total, fuerzas atómicas y tensor de tensión para estructuras periódicas.
- Cálculo de punto único (single-point) sobre estructuras dadas en formatos CIF, POSCAR, XYZ u otros soportados por ASE.
- Relajación de estructuras: optimización de posiciones atómicas y, opcionalmente, de la celda unitaria mediante el algoritmo BFGS de ASE.
- Dinámica molecular en ensemble NVT con termostato de Langevin, con control de temperatura y paso de tiempo.
- Fine-tuning sobre datos propios de materiales, con soporte para entrenamiento distribuido en un solo nodo (multi-dispositivo) y multi-nodo con Slurm DDP.
- Integración con el ecosistema ASE mediante un calculador específico, lo que facilita su uso en flujos de trabajo estándar de ciencia de materiales.

## Casos de uso

- Cálculo de punto único para validación de estructuras: dado un cristal o molécula adsorbida, eSEN predice energía y fuerzas en segundos, permitiendo filtrar candidatos antes de un cálculo DFT completo. Es adecuado por su bajo coste y precisión cercana a DFT.
- Relajación de estructuras cristalinas: el script `relax.py` optimiza posiciones atómicas y celda con BFGS, útil para refinar estructuras experimentales o generar estructuras relajadas para bases de datos. La equivariancia rotacional asegura que la relajación no dependa de la orientación inicial.
- Dinámica molecular de óxidos y otros sólidos inorgánicos: el script `md.py` ejecuta trayectorias NVT con Langevin, permitiendo estudiar difusión iónica, transiciones de fase o respuesta térmica sin recurrir a DFT en cada paso.
- Fine-tuning para materiales específicos: investigadores con datos propios (energías y fuerzas de DFT) pueden adaptar el checkpoint MPTrj a su dominio, por ejemplo aleaciones o superficies, usando el flujo de fine-tuning proporcionado. El ejemplo de óxidos PBE sirve como plantilla.
- Screening de materiales para baterías o catálisis: eSEN puede evaluar rápidamente la estabilidad energética de múltiples configuraciones de dopaje o adsorción, reduciendo el espacio de búsqueda antes de cálculos de mayor precisión.
- Integración en pipelines de simulación multi-escala: al ser un calculador ASE, eSEN se puede combinar con herramientas como pymatgen o ASE para automatizar flujos de trabajo de alto rendimiento, por ejemplo generación de diagramas de fase o curvas de energía potencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros potenciales interatómicos ni métricas de error (MAE en energía o fuerzas) para los checkpoints preentrenados. Se recomienda consultar la documentación oficial de FAIR Chemistry para datos de rendimiento.

## Requisitos de hardware

- Se recomienda una GPU o DCU para inferencia y fine-tuning; la CPU solo es apta para comprobaciones de importación y configuración, no para cargas de producción.
- No se especifican requisitos de VRAM en la documentación proporcionada. Dado el tamaño del modelo (30M parámetros), es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o superiores, pero este dato no está confirmado.
- Para entornos GPU, se requiere el paquete `onescience[matchem-gpu]`; para entornos DCU (procesadores chinos), se requiere `onescience[matchem-dcu]` con un runtime DTK compatible con la versión de PyTorch.
- Opciones de despliegue: el repositorio proporciona scripts de línea de comandos (`single_point.py`, `relax.py`, `md.py`) y soporte para entrenamiento distribuido con Slurm DDP. No se menciona integración con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información comparativa con otros potenciales interatómicos como MACE, NequIP, Allegro o BOTNet en la documentación proporcionada. Se recomienda consultar la literatura de FAIR Chemistry para comparaciones con métodos de referencia.

## Limitaciones y advertencias

- Los pesos preentrenados no se distribuyen en este repositorio; es necesario solicitarlos a FAIR Chemistry y aceptar sus términos de licencia, que pueden diferir de la licencia MIT del código.
- El repositorio no incluye un flujo de preentrenamiento desde cero; solo fine-tuning de checkpoints existentes.
- El modelo está entrenado en dominios específicos (MPTrj, OMat24, OAM); su precisión puede degradarse fuera de esos dominios, por ejemplo en sistemas con elementos o condiciones no representados en los datos de entrenamiento.
- No se proporcionan métricas de error ni estudios de robustez, por lo que el usuario debe validar el modelo en sus propios sistemas antes de usarlo en producción.
- La documentación no menciona sesgos específicos, pero como todo modelo entrenado con datos de DFT, puede heredar errores sistemáticos del funcional de intercambio-correlación utilizado (PBE, etc.).
- El uso en entornos DCU requiere una configuración específica (DTK) que puede no estar disponible en todos los sistemas.
- No se garantiza soporte para tensión en el fine-tuning de ejemplo (solo energía y fuerzas), lo que limita su uso para simulaciones con celda variable en ese flujo concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/eSEN
- Dataset de óxidos para fine-tuning: https://huggingface.co/datasets/OneScience-Group/oxides
- Repositorio oficial de FAIR Chemistry: https://github.com/FAIR-Chem/fairchem
- Página de modelos de FAIR Chemistry (para solicitar pesos): https://huggingface.co/fairchem
- Entorno online OneCode (programación AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
