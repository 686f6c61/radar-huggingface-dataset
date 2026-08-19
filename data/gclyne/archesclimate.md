# gclyne/ArchesClimate

## Resumen

ArchesClimate es un emulador climático basado en deep learning desarrollado por Graham Clyne y colaboradores (INRIA, Université Paris-Saclay y otras instituciones), presentado en el artículo "ArchesClimate: Probabilistic Decadal Ensemble Generation With Flow Matching" (arXiv:2509.15942). El modelo utiliza una arquitectura Swin-Transformer autoregresiva combinada con técnicas de flow matching para reproducir estados climáticos mensuales del océano y la atmósfera, condicionados a forzamientos externos como gases de efecto invernadero, aerosoles, ozono e irradiación solar. Está entrenado para emular los modelos de clima IPSL-CM6A-LR y CanESM5, permitiendo generar trayectorias de escenarios SSP no vistos de forma económica, sin necesidad de ejecutar el modelo de sistema terrestre completo.

La relevancia actual de ArchesClimate radica en su capacidad para generar conjuntos (ensembles) de proyecciones climáticas decenales a un coste computacional muy inferior al de los modelos físicos tradicionales, lo que facilita la cuantificación de incertidumbres en proyecciones climáticas. El repositorio de HuggingFace contiene los pesos del modelo y la configuración Hydra de entrenamiento, pero no incluye los datos de acompañamiento (condiciones iniciales, forzamientos, campos estáticos y estadísticas de normalización), que se distribuyen por separado en el dataset asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-Transformer autoregresivo con flow matching |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de emulacion climatica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (repositorio contiene pesos en formato .ckpt) |
| Idiomas soportados | no aplica (datos numericos de variables climaticas) |
| Licencia | MIT |
| Formato de pesos | .ckpt (PyTorch Lightning) |

## Arquitectura y entrenamiento

ArchesClimate se basa en un transformador con atención de ventana desplazada (Swin-Transformer) que procesa campos climáticos mensuales de forma autoregresiva. El modelo integra un esquema de flow matching para generar distribuciones probabilísticas de los estados climáticos, lo que permite producir ensembles de trayectorias decenales. El entrenamiento se realizó sobre simulaciones de los modelos IPSL-CM6A-LR y CanESM5, condicionando la generación a forzamientos externos (gases de efecto invernadero, aerosoles, ozono y radiación solar). El checkpoint publicado (`pf2_emafix_step40000`) corresponde a un modelo determinista entrenado con una función de pérdida de energía con pushforward de longitud 2 y pesos de promedio exponencial móvil (EMA), tras 40.000 pasos de optimización. Los detalles completos de la arquitectura y el entrenamiento se describen en el artículo técnico.

## Capacidades

- Generación de trayectorias climáticas mensuales autoregresivas de hasta 10 años de duración.
- Emulación simultánea de dinámica oceánica y atmosférica.
- Generación de ensembles probabilísticos mediante flow matching para cuantificar incertidumbre.
- Condicionamiento por forzamientos externos (GHGs, aerosoles, ozono, irradiación solar).
- Capacidad de generar escenarios SSP no vistos durante el entrenamiento.
- Reproducción de las estadísticas y propiedades físicas de los modelos emulados (evaluado en el artículo).

## Casos de uso

- Proyecciones climáticas decenales de bajo coste: permite generar trayectorias de 10 años para múltiples escenarios SSP sin ejecutar modelos físicos completos, reduciendo drásticamente el tiempo de cómputo y el consumo energético.
- Generación de ensembles de proyecciones: al ser un modelo probabilístico, se pueden generar múltiples realizaciones para cuantificar la incertidumbre asociada a distintas condiciones iniciales y forzamientos, algo esencial en estudios de atribución y riesgo climático.
- Estudios de escenarios de emisiones: el condicionamiento por forzamientos permite explorar rápidamente trayectorias bajo distintos supuestos de emisiones de gases de efecto invernadero y aerosoles, útil para informar políticas de mitigación y adaptación.
- Sustitución de modelos climáticos en pipelines de investigación: puede integrarse como un emulador rápido en flujos de trabajo que requieren múltiples ejecuciones, como análisis de sensibilidad o calibración de parámetros.
- Evaluación de impactos regionales: combinado con datos de alta resolución, puede proporcionar estados climáticos mensuales que sirvan como entrada para modelos de impacto (agricultura, hidrología, energía).
- Educación y divulgación científica: al ser un modelo ligero y de código abierto, permite a estudiantes e investigadores explorar dinámicas climáticas sin necesidad de infraestructura de supercomputación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (como MMLU, HumanEval u otros) en la información disponible, dado que se trata de un modelo de emulación climática y no de lenguaje. El artículo técnico (arXiv:2509.15942) incluye evaluaciones de las estadísticas y propiedades físicas de las trayectorias generadas, pero no se dispone de los valores concretos en el material proporcionado.

## Requisitos de hardware

- El tamaño del repositorio es de 18,7 GB, lo que sugiere que los pesos en precisión fp32 ocupan aproximadamente esa cantidad de memoria. Para inferencia en fp16 se estiman unos 9,4 GB de VRAM, aunque no se confirma el formato de almacenamiento.
- Se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) para cargar el modelo en fp32 sin problemas. Con cuantización o fp16 podría bastar con 16 GB, pero no se dispone de información oficial al respecto.
- El modelo no está diseñado para ejecutarse en CPU de forma eficiente; se requiere GPU para un rendimiento razonable.
- Las opciones de despliegue no están documentadas en el repositorio; al ser un modelo PyTorch Lightning, se puede servir mediante frameworks como TorchServe o integrarlo en scripts personalizados. No se menciona soporte para vLLM, llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros emuladores climáticos basados en deep learning (por ejemplo, ClimaX, FourCastNet o Pangu-Weather) en términos de parámetros, contexto y rendimiento. La información proporcionada no incluye datos de estos modelos alternativos.

## Limitaciones y advertencias

- El repositorio de HuggingFace no incluye los datos de acompañamiento necesarios para la inferencia (condiciones iniciales, forzamientos, campos estáticos y estadísticas de normalización). Estos se distribuyen por separado en el dataset `gclyne/ArchesClimateDataset`, y es imprescindible consultar `INFERENCE.md` del repositorio de código para ejecutar un rollout correctamente.
- El modelo está entrenado para emular dos modelos climáticos específicos (IPSL-CM6A-LR y CanESM5); su capacidad de generalización a otros modelos o configuraciones no está garantizada.
- Los resultados generados son aproximaciones estadísticas y pueden presentar sesgos o desviaciones respecto a las simulaciones físicas, especialmente en variables extremas o en regiones poco representadas en el entrenamiento.
- El tag `region:us` sugiere que el modelo puede estar calibrado para la región de Estados Unidos, aunque no se detalla el alcance geográfico exacto en la información proporcionada.
- No se especifica si el modelo soporta cuantización; el uso de pesos en fp32 puede requerir una VRAM considerable.
- Aunque la licencia MIT permite uso comercial, es recomendable revisar las condiciones de los datos de entrenamiento originales (simulaciones de IPSL y CanESM5) para verificar posibles restricciones adicionales.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/gclyne/ArchesClimate
- Dataset complementario: https://huggingface.co/datasets/gclyne/ArchesClimateDataset
- Código fuente: https://github.com/gclyne/ArchesClimate
- Artículo técnico (arXiv): https://arxiv.org/abs/2509.15942
- Versión PDF del artículo: https://arxiv.org/pdf/2509.15942v1
- Publicación en HAL: https://inria.hal.science/hal-05461931v1/document
- Resumen en AI Models: https://www.aimodels.fyi/papers/arxiv/archesclimate-probabilistic-decadal-ensemble-generation-flow-matching
