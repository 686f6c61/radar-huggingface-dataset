# OneScience-Group/Samudra

## Resumen

Samudra es un emulador oceánico global basado en redes neuronales profundas, desarrollado originalmente por el equipo M2LInES y reproducido de forma independiente por OneScience-Group. El modelo predice el estado del océano global sobre una cuadrícula de aproximadamente un grado de resolución con un paso temporal de cinco días, emulando la evolución del modelo de circulación oceánica OM4 del NOAA/GFDL. Su objetivo es acelerar las simulaciones climáticas reduciendo el coste computacional frente a los modelos físicos tradicionales.

La relevancia de Samudra radica en su enfoque de emulación basada en IA para ciencias de la Tierra, un campo emergente que busca sustituir o complementar simulaciones numéricas costosas con modelos neuronales capaces de capturar la dinámica oceánica. La arquitectura empleada es ConvNeXt, una variante de red convolucional moderna, aplicada a 77 canales de estado pronóstico y 4 canales de forzamiento. El modelo está entrenado con datos del proyecto M2LInES/Samudra-OM4 y se distribuye bajo licencia Apache 2.0.

Actualmente el repositorio proporciona el código para entrenamiento, inferencia y evaluación, así como un conjunto de datos sintéticos para validación del pipeline. Los pesos preentrenados están pendientes de publicación, por lo que la reproducción científica requiere entrenar el modelo desde cero con los datos OM4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red convolucional moderna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de simulación oceánica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

La arquitectura se basa en ConvNeXt, una evolución de las redes convolucionales que incorpora diseños modernos como normalización por capas, activaciones GELU y kernels grandes. El modelo procesa 77 canales de estado pronóstico (variables oceánicas como temperatura, salinidad, corrientes, etc.) y 4 canales de forzamiento (condiciones de contorno atmosféricas u oceánicas). La entrada es una cuadrícula global de aproximadamente 1 grado, y la salida es la predicción del estado oceánico cinco días después, en un esquema autorregresivo.

El entrenamiento se realiza con datos generados por el modelo OM4 del NOAA/GFDL, proporcionados por el proyecto M2LInES en el dataset `M2LInES/Samudra-OM4`. No se especifican el número de tokens (no aplica), el volumen de datos exacto ni si se emplearon técnicas de refuerzo o ajuste fino. El repositorio incluye scripts para entrenamiento en una o varias GPUs mediante PyTorch DistributedDataParallel con `torchrun`. También se proporciona un script para generar datos sintéticos NPZ con fines de validación del pipeline, aunque no son adecuados para evaluación científica.

## Capacidades

- Predicción global del estado oceánico (temperatura, salinidad, corrientes, etc.) en una cuadrícula de ~1 grado con paso de 5 días.
- Emulación del modelo de circulación oceánica OM4 mediante aprendizaje profundo.
- Simulación autorregresiva: el modelo puede realizar rollouts temporales iterativos para generar trayectorias oceánicas.
- Entrenamiento distribuido multi-GPU con PyTorch DDP.
- Generación de mapas de pronóstico y perfiles de temperatura para visualización y evaluación.
- Soporte para ejecución en GPUs NVIDIA y DCUs (aceleradores chinos) mediante el paquete `onescience[earth-gpu]` o `onescience[earth-dcu]`.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento simbólico, tool calling ni agentes.

## Casos de uso

- Investigación climática: emular la evolución oceánica global para estudios de variabilidad climática, corrientes y intercambio de calor, reduciendo el coste computacional frente a OM4.
- Generación de datos sintéticos oceánicos: producir estados oceánicos plausibles para alimentar otros modelos climáticos o sistemas de asimilación de datos.
- Validación de arquitecturas de emulación neuronal: el código y el dataset permiten comparar diferentes diseños de redes para emulación oceánica.
- Docencia y formación en IA para ciencias de la Tierra: el modelo y los scripts sirven como ejemplo práctico de aplicación de deep learning a problemas geofísicos.
- Desarrollo de sistemas de pronóstico oceánico rápido: con los pesos entrenados, el modelo podría integrarse en pipelines de predicción a corto plazo (5 días) con latencia mínima.
- Evaluación de robustez de modelos neuronales frente a condiciones de forzamiento variables: el protocolo de 4 canales de forzamiento permite estudiar la respuesta del océano a distintos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas cuantitativas de error (RMSE, correlación, etc.) comparadas con OM4 u otros emuladores. El paper original (doi:10.1029/2024GL114318) podría contener evaluaciones, pero no se incluyen en la model card.

## Requisitos de hardware

- Se recomienda una GPU NVIDIA o una DCU (acelerador chino) para entrenamiento e inferencia completos.
- La CPU es suficiente para importar el modelo y realizar pruebas de conectividad a pequeña escala, pero el entrenamiento y la inferencia serán muy lentos.
- No se especifica la VRAM mínima; al ser una red convolucional sobre una cuadrícula global de ~1 grado (360x180 celdas), se estima que un modelo de tamaño moderado puede caber en GPUs de 12-24 GB, pero este dato no está confirmado.
- Para DCU se requiere DTK 25.04.2 o superior.
- El despliegue se realiza mediante los scripts proporcionados (`train.py`, `inference.py`, `result.py`) y el paquete `onescience`; no se mencionan integraciones con vLLM, Ollama o TGI (no aplica al ser un modelo no lingüístico).

## Comparativa con modelos similares

No se dispone de información sobre otros emuladores oceánicos basados en IA comparables en la documentación proporcionada. Modelos como FourCastNet o GraphCast se centran en la atmósfera, no en el océano, y no se han encontrado referencias a alternativas directas en la información disponible.

## Limitaciones y advertencias

- Los pesos preentrenados no están aún disponibles; el repositorio indica que se subirán próximamente. Hasta entonces, el modelo debe entrenarse desde cero con datos OM4.
- El dataset sintético incluido (`scripts/fake_data.py`) no es válido para evaluación científica; solo sirve para verificar el pipeline.
- El modelo es una reproducción independiente del trabajo de M2LInES; no está avalado por los autores originales y puede presentar diferencias con el modelo descrito en el paper.
- No se especifican sesgos, pero al ser un emulador entrenado con datos de un modelo físico concreto (OM4), heredará sus limitaciones y posibles sesgos regionales.
- La licencia Apache 2.0 permite uso comercial, pero la falta de pesos oficiales dificulta su aplicación práctica inmediata.
- El modelo no está diseñado para tareas de lenguaje natural; cualquier intento de usarlo como LLM carece de sentido.
- La documentación no detalla la incertidumbre de las predicciones ni los rangos de validez de los forzamientos; se recomienda validar exhaustivamente antes de usar en producción científica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/Samudra
- Dataset de entrenamiento: https://huggingface.co/datasets/M2LInES/Samudra-OM4
- Paper original: https://doi.org/10.1029/2024GL114318
- Repositorio OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de skills OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio de skills OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
