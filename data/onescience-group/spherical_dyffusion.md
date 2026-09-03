# OneScience-Group/Spherical_DYffusion

## Resumen

Spherical DYffusion es un método propuesto por Salva Ruhling Cachay y colaboradores para la emulación probabilística de un modelo climático global. Combina un operador neuronal de Fourier esférico (SFNO) para modelar la dinámica en la esfera con el enfoque DYffusion, que utiliza un interpolador y un pronosticador entrenados en dos etapas para generar conjuntos de simulaciones probabilísticas. El modelo está diseñado para trabajar con datos del modelo atmosférico FV3GFS, permitiendo pronósticos por conjuntos y análisis de incertidumbre en simulaciones climáticas.

La implementación publicada en HuggingFace es una versión compacta que preserva los contratos de tensores y datos del proyecto original, pensada para pruebas de humo y validación de pipelines, no para reproducir el entrenamiento a escala de paper. El repositorio incluye scripts para generar datos sintéticos, entrenar en una o varias GPUs, realizar inferencia y evaluar resultados. Los pesos de entrenamiento aún no están disponibles, aunque se espera que se suban próximamente.

El modelo es relevante porque aborda el desafío de emular modelos climáticos complejos con métodos de aprendizaje profundo probabilístico, ofreciendo una alternativa más eficiente que las simulaciones numéricas tradicionales. Su licencia Apache-2.0 facilita su uso en investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SFNO (Spherical Fourier Neural Operator) + DYffusion (interpolador y pronosticador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt), no se especifica safetensors |

## Arquitectura y entrenamiento

El método original, descrito en el paper "Probabilistic Emulation of a Global Climate Model with Spherical DYffusion", utiliza un SFNO para capturar las dinámicas esféricas y un esquema DYffusion que combina un interpolador temporal y un pronosticador. El entrenamiento se realiza en dos etapas: primero se entrena el interpolador para generar estados intermedios entre pasos de tiempo, y luego el pronosticador aprende a predecir el siguiente estado condicionado a esos estados interpolados. Esto permite generar conjuntos de trayectorias probabilísticas.

La implementación en este repositorio es compacta y no reproduce el entrenamiento a escala de paper. Utiliza datos sintéticos de 37 canales en una rejilla global para verificar los contratos de datos y el flujo de trabajo. El entrenamiento comienza desde inicialización aleatoria y guarda checkpoints en `data/checkpoint/`. No se especifican detalles sobre el dataset de entrenamiento completo ni el número de tokens o épocas.

## Capacidades

- Simulación probabilística de un modelo climático global mediante emulación con aprendizaje profundo.
- Pronóstico por conjuntos (ensemble forecasting) usando el enfoque DYffusion.
- Manejo de datos de rejilla global con 37 variables, incluyendo presión superficial, temperatura, agua total, componentes del viento, entre otras.
- Entrenamiento distribuido multi-GPU con PyTorch DistributedDataParallel (torchrun).
- Generación de datos sintéticos con formato NetCDF compatible con FV3GFS para pruebas de protocolo.
- Evaluación y visualización de métricas por variable y diagnóstico global (scripts `result.py`).
- Ejecución en entornos OneCode/ModelScope para desarrollo integrado.

## Casos de uso

- Validación de pipelines locales: permite comprobar el flujo de entrenamiento, inferencia y visualización con datos sintéticos antes de escalar a datos reales.
- Verificación de protocolos FV3GFS: el script `fake_data.py` genera un fixture NetCDF con 37 variables que sirve para validar la lectura de datos, dimensiones espaciales y marcos temporales.
- Desarrollo de emuladores climáticos: sirve como base para implementar y probar variantes del método DYffusion en entornos de investigación.
- Entrenamiento distribuido: con `torchrun --nproc_per_node=8` se puede lanzar entrenamiento multi-GPU, útil para escalar a conjuntos de datos mayores.
- Generación de conjuntos de pronóstico probabilístico: aunque la implementación es compacta, demuestra cómo producir predicciones por conjuntos para cuantificar incertidumbre.
- Evaluación de métricas por variable: el script `result.py` calcula diagnósticos por variable y produce dashboards visuales, útil para analizar el rendimiento del modelo en diferentes variables climáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas con otros modelos o con la simulación numérica original.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; la CPU solo es viable para pruebas de conectividad a pequeña escala.
- No se especifican requisitos de VRAM concretos. Dado que es una implementación compacta, es probable que quepa en GPUs de consumo, pero no hay datos confirmados.
- Para entrenamiento multi-GPU se utiliza `torchrun` con 8 procesos, lo que sugiere la necesidad de al menos 8 GPUs si se sigue ese ejemplo, aunque se puede adaptar.
- En entornos DCU se requiere instalar DTK 25.04.2 o superior.
- Opciones de despliegue: no se mencionan herramientas como vLLM u Ollama, ya que no es un modelo de lenguaje. La inferencia se realiza mediante scripts Python (`inference.py`).

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros emuladores climáticos probabilísticos en la información disponible.

## Limitaciones y advertencias

- Esta implementación es compacta y no reproduce el entrenamiento a escala de paper; los resultados pueden no ser representativos del rendimiento real del método.
- Los pesos de entrenamiento no están disponibles actualmente; el directorio `weight/` aún no contiene archivos.
- No se han publicado benchmarks ni métricas de rendimiento en la model card.
- El modelo está diseñado específicamente para datos con formato FV3GFS; puede requerir adaptaciones para otros conjuntos de datos climáticos.
- Aunque la licencia Apache-2.0 permite uso comercial, al ser una implementación de referencia, se recomienda verificar la validez científica antes de usarla en producción.
- No hay información sobre sesgos o alucinaciones, ya que no es un modelo de lenguaje; sin embargo, los modelos de emulación climática pueden propagar errores si se usan fuera de su dominio de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/Spherical_DYffusion
- Paper arXiv: https://arxiv.org/abs/2406.14798
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
