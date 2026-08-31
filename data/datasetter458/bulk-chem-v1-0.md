# datasetter458/bulk-chem-v1.0

## Resumen

Bulk Chem v1.0 es un modelo de predicción de propiedades ADMET (Absorción, Distribución, Metabolismo, Excreción y Toxicidad) diseñado para el descubrimiento de fármacos. Desarrollado por el usuario datasetter458, el modelo consume una cadena SMILES de una molécula y devuelve predicciones para 15 endpoints farmacológicos distintos, combinando tareas de clasificación binaria y regresión. Su objetivo principal es servir como herramienta de triaje pre-laboratorio de bajo coste para priorizar candidatos a fármacos.

La arquitectura del modelo, denominada Data-Driven Router, se compone de un router que distribuye cada muestra hacia bloques independientes especializados por endpoint. A diferencia de los MLP de tronco compartido, cada bloque se entrena de forma aislada, lo que elimina la interferencia de gradientes entre tareas (problema de transferencia negativa) y permite actualizar o reentrenar bloques individuales sin afectar al resto. El modelo está disponible bajo licencia MIT y se distribuye con pesos en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU + MLP por endpoint con router de distribución (Data-Driven Router) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (entrada de secuencias SMILES de longitud variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | SMILES (notación química), interfaz en inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors) |

## Arquitectura y entrenamiento

La arquitectura Data-Driven Router se compone de un módulo router que dirige cada muestra hacia el bloque especializado correspondiente a su endpoint ADMET. Cada bloque es un MLP independiente que recibe la representación de la molécula y produce la predicción para su tarea específica. Los bloques no comparten gradientes durante la retropropagación, lo que resuelve el problema de transferencia negativa típico de los MLP de tronco compartido y evita que conjuntos de datos de tamaños muy dispares corrompan el entrenamiento de bloques con menos datos.

La representación de entrada se construye mediante codificación one-hot a nivel de carácter sobre un vocabulario unión de SMILES construido a partir de todos los conjuntos de entrenamiento. Las secuencias de longitud variable se procesan con una capa GRU y se agregan mediante el último estado oculto, que se pasa al MLP del bloque correspondiente. El entrenamiento permite guardar y cargar pesos por bloque de forma independiente, así como ampliar el vocabulario de entrada sin reentrenar desde cero mediante la función `load_weights_with_extended_vocab()`.

## Capacidades

- Predicción de 15 endpoints ADMET: HIA, PAMPA, lipofilicidad, solubilidad, BBB, PPBR, BBBP, CYP2C9, CYP2D6, CYP3A4, aclaramiento hepatocitario, aclaramiento microsomal, AMES, DILI y LD50.
- Clasificación binaria para endpoints cualitativos: HIA, PAMPA, BBB, BBBP, CYP2C9, CYP2D6, CYP3A4, AMES y DILI.
- Regresión para endpoints cuantitativos: lipofilicidad, solubilidad, PPBR, aclaramiento hepatocitario, aclaramiento microsomal y LD50.
- Entrada mediante cadenas SMILES, codificadas a nivel de carácter con GRU para capturar dependencias secuenciales.
- Entrenamiento por bloques independientes que permite fine-tuning quirúrgico de endpoints individuales sin afectar al resto.
- Soporte para ampliación de vocabulario SMILES sin reentrenamiento completo.

## Casos de uso

- Triaje pre-laboratorio de librerías de compuestos: el modelo permite filtrar miles de moléculas por sus propiedades ADMET antes de incurrir en costes de síntesis y ensayos experimentales, priorizando las más prometedoras.
- Evaluación temprana de toxicidad: los endpoints AMES, DILI y LD50 ofrecen una primera señal de alerta sobre posibles problemas de seguridad en fases iniciales del descubrimiento de fármacos.
- Optimización de permeabilidad y absorción: los endpoints HIA, PAMPA y BBB ayudan a seleccionar candidatos con mayor probabilidad de absorción oral y penetración en el sistema nervioso central.
- Perfilado de metabolismo hepático: las predicciones de inhibición de CYP2C9, CYP2D6 y CYP3A4 permiten descartar compuestos con alto riesgo de interacciones farmacológicas.
- Estimación de aclaramiento y semivida: los endpoints de aclaramiento hepatocitario y microsomal orientan la selección de candidatos con perfiles farmacocinéticos favorables, aunque con mayor incertidumbre por la escasez de datos.
- Soporte a decisiones de diseño de química medicinal: los resultados por endpoint permiten a los químicos medicinales priorizar modificaciones estructurales dirigidas a mejorar propiedades ADMET específicas sin necesidad de experimentación inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas por endpoint (matriz de confusión, MSE, R², MAE) pero no se incluyen valores concretos en el README. Se recomienda consultar el repositorio del modelo para obtener las métricas detalladas de cada bloque.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (GRU + MLPs pequeños) y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: muy baja, por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendada: no necesaria; cualquier GPU con al menos 2 GB de VRAM sería más que suficiente si se desea acelerar la inferencia.
- Compatible con hardware de consumo: sí, funciona en cualquier portátil o equipo de sobremesa estándar.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI, o integrarse en pipelines de Python existentes.
- Latencia estimada: del orden de milisegundos por molécula en CPU, lo que permite procesar miles de compuestos por minuto.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con otros modelos de predicción ADMET como ADMET-AI, Chemprop o TDC. El modelo presenta una arquitectura diferenciada (router por bloques) frente a los enfoques de tronco compartido habituales, pero no se han publicado benchmarks comparativos que permitan evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Los endpoints de excreción (aclaramiento hepatocitario y microsomal) se entrenaron con conjuntos de datos muy reducidos, reconocidos como los más pobres en datos de todo el campo ADMET. Sus predicciones deben interpretarse con márgenes de incertidumbre amplios.
- El rendimiento varía significativamente entre endpoints según el tamaño y la calidad del conjunto de datos subyacente de cada bloque.
- El modelo está diseñado como soporte para triaje pre-laboratorio, no como autoridad para decisiones clínicas, regulatorias o de go/no-go final. Toda predicción debe validarse experimentalmente.
- La representación basada en SMILES a nivel de carácter puede no capturar completamente la información estereoquímica o conformacional relevante para ciertas propiedades.
- No se ha documentado el número total de parámetros ni el volumen de datos de entrenamiento, lo que limita la evaluación de su capacidad y generalización.
- No se han publicado estudios de sesgos o evaluación de robustez frente a distribuciones de moléculas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datasetter458/bulk-chem-v1.0
- Perfil del autor: https://huggingface.co/datasetter458
- Repositorio central del autor: https://huggingface.co/datasetter458/central
