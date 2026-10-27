# nvidia/MotionBricks

## Resumen

MotionBricks es un modelo de generación de movimiento condicionado por pose, desarrollado por NVIDIA y publicado en Hugging Face como `nvidia/MotionBricks`. Genera movimiento en tiempo real para robots humanoides y personajes humanos: recibe las poses recientes del personaje y las poses objetivo que debe alcanzar, y produce la transición entre ambas.

El repositorio, de 1,6 GB, contiene pesos preentrenados en SafeTensors para dos familias: SOMA, para movimiento humano sobre el esqueleto SOMA, y Unitree G1, para el humanoide Unitree G1. Las primitivas inteligentes convierten poses objetivo en bloques reutilizables para navegación e interacción con objetos sin reentrenar el modelo.

Es relevante para robótica y animación porque separa la generación de movimiento de la ejecución física: no es un controlador de robot ni un modelo de lenguaje. La model card advierte de que para llevar el movimiento a hardware hace falta un controlador de seguimiento, comprobaciones de límites y validación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto de tres redes por modelo, según la model card; no se detalla el tipo de red. No es un modelo Transformer `from_pretrained`. |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible; no se indica que sea MoE |
| Longitud de contexto | no disponible; no es un modelo de lenguaje |
| Tipos de cuantización | no disponible; se distribuyen pesos SafeTensors y el software incluye modelos ONNX/TensorRT |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | Pesos SOMA y G1: NVIDIA Open Model Agreement; software: Apache 2.0; muestras de movimiento BONES: NVIDIA Sample Data Evaluation License |
| Formato de pesos | SafeTensors; exportación a ONNX; runtime TensorRT en la demo |
| Variantes | SOMA, para movimiento humano; Unitree G1, para el humanoide Unitree G1 |
| Tamaño del repositorio | 1,6 GB |
| Pipeline de Hugging Face | robotics |

## Arquitectura y entrenamiento

La información disponible indica que cada modelo usa tres redes juntas, pero no detalla el tipo de red, el número de capas, el mecanismo de atención ni el número de parámetros. No son modelos Transformers `from_pretrained` y el repositorio no incluye pipeline de entrenamiento ni datos completos.

Tampoco se especifican tokens de entrenamiento, composición del dataset, RLHF/DPO ni recetas de ajuste. La innovación documentada es el mecanismo de primitivas inteligentes, que convierte poses objetivo en bloques reutilizables para navegación e interacción con objetos, junto con la integración en demos construidas con Newton y Warp y la exportación a ONNX/TensorRT.

## Capacidades

- Generación de movimiento condicionado por pose para el esqueleto humano SOMA.
- Generación de movimiento para el humanoide Unitree G1.
- Conexión entre poses recientes y poses objetivo, produciendo la transición de movimiento.
- Generación de movimiento en tiempo real, según la model card; no se aportan cifras de latencia.
- Uso de primitivas inteligentes para navegación e interacción con objetos sin reentrenar el modelo.
- Creación de primitivas y escenas propias mediante el software acompañante.
- Exportación de modelos a ONNX y ejecución con TensorRT en demos para GPU NVIDIA.
- No incluye generación de texto, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Animación de personajes humanos con SOMA: se pueden definir poses clave y usar el modelo para generar transiciones de movimiento sobre el esqueleto SOMA en flujos de previsualización o animación.
- Locomoción de Unitree G1 en simulación: el modelo genera movimiento a partir de poses objetivo para el humanoide; después debe conectarse a un controlador de seguimiento y validarse con límites del robot.
- Navegación con primitivas inteligentes: las poses objetivo se convierten en bloques reutilizables para waypoints y navegación, lo que permite componer movimientos sin reentrenar la red.
- Interacción con objetos: las primitivas pueden representar poses de alcance o interacción y el modelo genera el movimiento intermedio; es adecuado para probar secuencias en simulación antes de llevarlas a hardware.
- Generación de datos sintéticos de movimiento: las secuencias generadas pueden alimentar pruebas de controladores de seguimiento, herramientas de animación o entornos simulados.
- Evaluación de controladores de seguimiento: el movimiento generado sirve como referencia para medir el comportamiento de un controlador en simulación, separando la generación de la ejecución física.
- Prototipado de demos y escenas: el software permite crear primitivas y escenas, exportar a ONNX y ejecutar demos TensorRT en una GPU NVIDIA.
- Pruebas de integración en robótica: el modelo puede formar parte de un pipeline de simulación con Newton y Warp para validar movimientos antes de añadir seguridad y control en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las fichas de familia para la evaluación, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes de generación de movimiento en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se especifica el número de parámetros ni el consumo de memoria.
- Tamaño del paquete de pesos: 1,6 GB, insuficiente para estimar VRAM sin conocer la arquitectura y la precisión de ejecución.
- GPU recomendadas: no disponible; la demo con TensorRT requiere una GPU NVIDIA, pero no se enumeran modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no hay lista de GPUs verificadas ni requisitos mínimos publicados.
- Opciones de despliegue: exportación a ONNX, runtime TensorRT para la demo y posibilidad de construir otro runtime con el software de NVlabs; no es compatible con `from_pretrained` de Transformers.
- Latencia y throughput: no disponible; la model card afirma generación en tiempo real, pero no aporta medidas de latencia ni de frames por segundo.
- Dependencias de demo: Newton y Warp para las escenas incluidas, y GPU NVIDIA para el runtime TensorRT.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica 2-3 alternativas comparables con parámetros, contexto, rendimiento, licencia y disponibilidad verificables. Tampoco se incluyen métricas de movimiento que permitan una comparación cuantitativa con otros generadores de movimiento para humanoides o personajes humanos.

## Limitaciones y advertencias

- No es un controlador de robot: genera movimiento, no las órdenes de control necesarias para ejecutarlo en hardware.
- Para usar el movimiento en un robot real hacen falta un controlador de seguimiento, comprobaciones de límites físicos y validación de seguridad.
- No es un modelo Transformer `from_pretrained`; el repositorio no incluye pipeline de entrenamiento, datos completos ni estado del optimizador para reanudar el entrenamiento original.
- Los archivos de SOMA y Unitree G1 no son intercambiables; cada familia debe usarse con su carpeta, configuración y archivos de soporte.
- El paquete de G1 no incluye el banco de movimiento de demo original `out/G1-clip.ckpt`; los ejemplos de movimiento son independientes de los pesos.
- El repositorio no incluye las muestras de movimiento ni el dataset de entrenamiento.
- Las muestras BONES y sus derivados usan la NVIDIA Sample Data Evaluation License, limitada a evaluación y pruebas internas de tecnologías NVIDIA; no deben confundirse con la licencia de los pesos.
- Los pesos SOMA y G1 usan la NVIDIA Open Model Agreement, que permite uso comercial y redistribución de modelos modificados sujeto a sus términos; el software usa Apache 2.0.
- No se documentan sesgos del dataset de movimiento; pueden existir sesgos de estilo, morfología o repertorio de movimiento no cuantificados.
- No se describe el riesgo de movimientos físicamente inválidos o inseguros; cualquier despliegue debe incluir validación cinemática y de colisiones.
- No hay datos de latencia, throughput ni tasa de éxito en tareas de navegación o interacción.
- No ofrece capacidades de lenguaje, código, matemáticas, visión, audio, tool calling ni agentes.

## Enlaces

- [Hugging Face: nvidia/MotionBricks](https://huggingface.co/nvidia/MotionBricks)
- [Página del proyecto MotionBricks](https://nvlabs.github.io/motionbricks/)
- [Paper en arXiv](https://arxiv.org/abs/2604.24833)
- [Repositorio de software en GitHub](https://github.com/NVlabs/motionbricks)
- [Ficha de SOMA](https://huggingface.co/nvidia/MotionBricks/blob/main/soma/README.md)
- [Ficha de Unitree G1](https://huggingface.co/nvidia/MotionBricks/blob/main/g1/README.md)
- [Manifiesto de SOMA](https://huggingface.co/nvidia/MotionBricks/blob/main/soma/manifest.json)
- [Checksums de SOMA](https://huggingface.co/nvidia/MotionBricks/blob/main/soma/SHA256SUMS)
- [Manifiesto de Unitree G1](https://huggingface.co/nvidia/MotionBricks/blob/main/g1/manifest.json)
- [Checksums de Unitree G1](https://huggingface.co/nvidia/MotionBricks/blob/main/g1/SHA256SUMS)
- [Licencia del software Apache 2.0](https://github.com/NVlabs/motionbricks/blob/main/LICENSE)
- [Licencia de muestras de movimiento](https://github.com/NVlabs/motionbricks/blob/main/assets/motions/LICENSE.txt)
- [Aviso sobre muestras de movimiento](https://github.com/NVlabs/motionbricks/blob/main/assets/motions/README.md)
- [NVIDIA Open Model Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/)
