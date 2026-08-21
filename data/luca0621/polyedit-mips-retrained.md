# luca0621/polyedit-mips-retrained

## Resumen

PolyEdit MIPS-retrained es un modelo de predicción de propiedades de polímeros basado en grafos, desarrollado por luca0621 (Taeseung You) como un reentrenamiento controlado de la arquitectura MIPS. Su objetivo es estimar ocho propiedades DFT definidas en el benchmark PolyEdit: `Egc`, `Egb`, `Eea`, `Ei`, `EPS`, `Nc`, `Xc` y `Eat`. No se trata de un checkpoint oficial de los autores de MIPS, sino de un entrenamiento desde cero sobre los datos de entrenamiento de PolyEdit, dado que el repositorio público de MIPS no incluye los pesos necesarios.

El modelo emplea grafos de polímeros star-link, características de rutas completas, una modalidad de descriptores moleculares de 200 dimensiones, una modalidad de pares atómicos 3D de 512 dimensiones y el `KfuseGraphTransformer` con fusión por cross-attention. El conjunto de datos se divide en 1.300 muestras de entrenamiento, 75 de validación y 953 de prueba, con cero solapamiento de componentes conectados para evitar fugas de información. El repositorio ocupa 0,1 GB y está implementado en PyTorch.

La relevancia de este modelo radica en ofrecer una alternativa de evaluación rápida de propiedades de polímeros sin recurrir a cálculos DFT costosos, aunque con una advertencia importante: las tolerancias objetivo son mucho más estrechas que los errores del evaluador, y solo el 10,996 % de los valores de referencia caen dentro de dicha tolerancia. Por tanto, los resultados deben interpretarse como tasas de acierto del evaluador, no como éxito químico real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KfuseGraphTransformer con cross-attention (grafos star-link) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de grafos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors probablemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MIPS, que utiliza grafos de polímeros con enlaces tipo star-link y características de rutas completas. La fusión de modalidades se realiza mediante un `KfuseGraphTransformer` con cross-attention, combinando descriptores moleculares de 200 dimensiones y pares atómicos 3D de 512 dimensiones. Esta arquitectura está diseñada específicamente para capturar relaciones estructurales complejas en cadenas poliméricas.

El entrenamiento se realizó desde cero sobre los componentes de entrenamiento de PolyEdit, con un split de 1.300 muestras de entrenamiento, 75 de validación y 953 de prueba, garantizando cero solapamiento de componentes conectados para evitar fugas. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que el repositorio público de MIPS no incluye los checkpoints de MAE ni los downstream necesarios, por lo que este reentrenamiento es una reconstrucción independiente.

## Capacidades

- Predicción de ocho propiedades DFT de polímeros: `Egc` (band gap), `Egb`, `Eea` (afinidad electrónica), `Ei` (energía de ionización), `EPS` (constante dieléctrica), `Nc` (índice de refracción), `Xc` (electronegatividad) y `Eat` (energía de adsorción).
- Manejo de grafos moleculares complejos con representación star-link y características de rutas completas.
- Fusión multimodal mediante cross-attention entre descriptores moleculares y pares atómicos 3D.
- Evaluación de propiedades con control de fugas mediante separación estricta de componentes conectados.
- No es un modelo generativo; no soporta generación de texto, código, tool calling ni agentes.

## Casos de uso

- Screening virtual de polímeros: el modelo puede estimar rápidamente propiedades electrónicas y ópticas de miles de candidatos poliméricos, permitiendo filtrar materiales prometedores antes de realizar cálculos DFT costosos.
- Diseño de materiales para electrónica orgánica: al predecir `Egc` y `Eea`, se pueden seleccionar polímeros con band gaps adecuados para aplicaciones en semiconductores orgánicos o celdas solares.
- Optimización de propiedades dieléctricas: la predicción de `EPS` y `Nc` ayuda a identificar polímeros con constantes dieléctricas específicas para su uso en condensadores o aislantes.
- Evaluación de estabilidad química: las predicciones de `Ei` y `Eat` pueden orientar la selección de polímeros resistentes a la degradación en entornos agresivos.
- Benchmarking de arquitecturas de grafos: sirve como referencia para comparar nuevas arquitecturas de predicción de propiedades poliméricas, dado su control de fugas y su división de datos clara.
- Integración en pipelines de descubrimiento de materiales: puede combinarse con generadores de estructuras poliméricas para filtrar candidatos generados, aunque con la advertencia de que las tasas de acierto son limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que las tolerancias objetivo son más estrechas que los errores del evaluador y que solo el 10,996 % de los valores de referencia caen dentro de la tolerancia, pero no proporciona métricas detalladas como MAE o R² para cada propiedad.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware.
- Dado el tamaño del repositorio (0,1 GB) y la naturaleza del modelo (grafos, no secuencial), es probable que pueda ejecutarse en una GPU de consumo medio (por ejemplo, RTX 3060 o superior) o incluso en CPU para inferencia, pero no hay datos confirmados.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo PyTorch, podría servirse con TorchServe o un framework similar, pero no está documentado.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. La arquitectura MIPS es específica para polímeros, y no se dispone de datos sobre alternativas como otros graph transformers o modelos de predicción de propiedades poliméricas.

## Limitaciones y advertencias

- El modelo es un reentrenamiento independiente, no un checkpoint oficial de los autores de MIPS, por lo que su comportamiento puede diferir del modelo original.
- Las tolerancias objetivo son mucho más estrechas que los errores del evaluador; solo el 10,996 % de los valores de referencia caen dentro de la tolerancia, lo que indica una precisión limitada para aplicaciones de alta exigencia.
- No se dispone de licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un conjunto de datos limitado (1.300 muestras), puede presentar problemas de generalización a polímeros fuera de la distribución.
- Riesgo de alucinación no aplicable (no es generativo), pero sí riesgo de errores en las predicciones numéricas.
- No se proporcionan detalles sobre la composición del dataset ni sobre posibles desequilibrios entre clases o propiedades.

## Enlaces

- Repositorio del modelo: https://huggingface.co/luca0621/polyedit-mips-retrained
- Perfil del autor: https://huggingface.co/luca0621
- Código de MIPS: https://github.com/wjxts/MIPS
- Implementación de PolyEdit y métricas completas: https://github.com/promotion-kim/POLYEDIT/tree/tsyou/balanced-polymer-baseline-eval
