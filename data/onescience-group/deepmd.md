# OneScience-Group/DeePMD

## Resumen

DeePMD es un ecosistema de entrenamiento de potenciales de aprendizaje automático (machine learning potentials) para sistemas atómicos, desarrollado por OneScience-Group. Se basa en el proyecto de referencia DeepMD-kit y proporciona puntos de entrada mínimos y ejecutables para entrenar potenciales interatómicos con backends de PyTorch y TensorFlow. Su objetivo es facilitar la simulación de dinámica molecular y el cálculo de energía y fuerzas en materiales y moléculas mediante redes neuronales profundas.

El modelo se presenta como un repositorio de código y ejemplos de configuración, no como un modelo preentrenado con pesos. Incluye demostraciones como el entrenamiento de un potencial para agua, soporte para entrenamiento multi-GPU en entornos SLURM y utilidades para verificar la conectividad del entorno. La relevancia actual radica en la creciente adopción de métodos de aprendizaje automático para acelerar simulaciones atomísticas, reduciendo el coste computacional frente a métodos ab initio tradicionales.

La arquitectura se basa en la representación de Deep Potential (DP), que utiliza una red neuronal profunda para mapear configuraciones atómicas locales a energía y fuerzas. No se especifican el número de parámetros ni la longitud de contexto, ya que no es un modelo de lenguaje. La licencia es LGPL-3.0 y el idioma principal es inglés, aunque el código es independiente del lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda (Deep Potential, tipo DeePMD) |
| Parametros totales | no disponible (no se proporcionan pesos entrenados) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de potencial interatomico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (codigo y documentacion) |
| Licencia | LGPL-3.0 |
| Formato de pesos | no disponible (solo codigo y configuracion de entrenamiento) |

## Arquitectura y entrenamiento

DeePMD implementa la metodología de Deep Potential, donde una red neuronal profunda (típicamente perceptrones multicapa) aprende a predecir la energía total y las fuerzas atómicas a partir de descriptores locales de la configuración atómica (por ejemplo, la matriz de vecinos). El entrenamiento se realiza con datos de sistemas atómicos etiquetados (energías y fuerzas calculadas con métodos de primeros principios). El repositorio incluye ejemplos de configuración para el sistema de agua, con archivos JSON que definen la arquitectura de la red, los hiperparámetros y las rutas a los datos de entrenamiento.

El código está organizado para funcionar con DeepMD-kit, que ofrece backends de PyTorch y TensorFlow. Se proporcionan scripts para instalación y verificación del entorno, así como para lanzar entrenamientos en una o varias GPUs (mediante SLURM). No se detalla el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO, ya que no aplican a este tipo de modelo. La innovación principal es la integración con el ecosistema OneScience, que permite un despliegue simplificado en entornos con GPUs o DCUs (aceleradores chinos).

## Capacidades

- Entrenamiento de potenciales interatómicos para sistemas moleculares y de materiales.
- Predicción de energía total y fuerzas atómicas.
- Simulación de dinámica molecular (MD) utilizando los potenciales entrenados.
- Soporte para entrenamiento multi-GPU y multi-nodo mediante SLURM (scripts `submit_4card.sh` y `submit_8card.sh`).
- Migración de datos personalizados: permite sustituir la ruta `systems` en la configuración por datos propios en formato NumPy de DeepMD.
- Verificación de instalación y conectividad del entorno mediante el script `dp_install.sh`.
- Compatibilidad con backends de PyTorch y TensorFlow.
- Ejecución en GPUs y DCUs (con instalación previa de DTK).

## Casos de uso

- Entrenamiento de potenciales para agua: el ejemplo `demo/water_se_e2_a_pt/input_torch.json` permite reproducir un potencial de agua, útil para investigaciones en química de soluciones y dinámica molecular.
- Simulación de materiales: los potenciales entrenados pueden emplearse para estudiar propiedades mecánicas, térmicas o de transporte en sólidos y líquidos.
- Integración en flujos de trabajo de química computacional: el modelo se puede incorporar en pipelines que requieran evaluación rápida de energía y fuerzas, sustituyendo cálculos DFT costosos.
- Entrenamiento distribuido en clústeres: los scripts SLURM permiten lanzar entrenamientos en múltiples GPUs, acelerando la convergencia en sistemas grandes.
- Desarrollo de nuevos potenciales para aleaciones o compuestos: los usuarios pueden adaptar la configuración y los datos para entrenar potenciales específicos de sus materiales de interés.
- Verificación de entornos de instalación: el script `dp_install.sh` sirve para comprobar que DeepMD-kit se instala correctamente, útil en despliegues de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (como errores de energía o fuerzas) ni comparaciones con otros métodos. Se recomienda consultar la documentación de DeepMD-kit para referencias de rendimiento típicas.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento; una CPU puede usarse para pruebas de instalación o datos pequeños, pero el entrenamiento completo será lento.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o posterior, o la recomendada por OneScience).
- No se especifican requisitos de VRAM ni GPUs concretas (p. ej., A100, RTX 4090). La memoria dependerá del tamaño del sistema atómico y de la arquitectura de red elegida.
- Opciones de despliegue: el entorno se instala vía `pip install onescience[matchem-gpu]` (para GPU) o `onescience[matchem-dcu]` (para DCU). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros potenciales de aprendizaje automático (como SchNet, NequIP, ANI, etc.) en la información proporcionada. DeepMD-kit es una implementación de referencia ampliamente utilizada, pero este repositorio específico no incluye benchmarks ni comparaciones. Se recomienda consultar la literatura de DeepMD-kit para evaluar su rendimiento frente a alternativas.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados; solo proporciona código y configuraciones de ejemplo. El usuario debe entrenar sus propios potenciales con datos adecuados.
- La licencia LGPL-3.0 permite uso comercial, pero requiere que las modificaciones del código se distribuyan bajo la misma licencia y que se proporcione enlace al código fuente.
- El entrenamiento depende de la calidad y cantidad de los datos atómicos proporcionados; un dataset insuficiente puede llevar a potenciales inexactos o sobreajustados.
- La documentación está en inglés; no hay soporte multilingüe.
- No se garantiza compatibilidad con todos los sistemas operativos o aceleradores; la instalación en DCU requiere DTK específico.
- El uso en producción exige validación rigurosa del potencial entrenado (errores de energía y fuerzas, estabilidad en simulaciones largas).

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/DeePMD
- Dataset de entrenamiento (agua): https://huggingface.co/datasets/OneScience-Group/DeePMD
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de habilidades de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Proyecto de referencia DeepMD-kit: (enlace no proporcionado en la información, se recomienda buscar en la web oficial)
