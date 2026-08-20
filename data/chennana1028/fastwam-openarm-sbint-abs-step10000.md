# chennana1028/fastwam-openarm-sbint-abs-step10000

## Resumen

FastWAM SBInt abs — step 10000 es un checkpoint de pesos de entrenamiento del modelo FastWAM, desarrollado por chennana1028. FastWAM es un modelo de acción para robótica que combina Wan2.2-TI2V-5B (un modelo de video) con ActionDiT, un componente de difusión para acciones. Este checkpoint concreto se entrenó sobre el dataset SBInt openarm (873 episodios) y utiliza un espacio de acciones absolutas de 16 dimensiones, normalizadas con z-score. El modelo está diseñado para controlar un brazo robótico OpenArm, un brazo humanoide de 7 grados de libertad de código abierto.

El checkpoint corresponde al paso 10 000 de un entrenamiento de 50 000 pasos, realizado con 2×8 GPUs, batch global de 128 y optimizador AdamW con tasa de aprendizaje 1e-4 y programación coseno. Se distribuye como un archivo de pesos en formato de trainer (`step_010000.pt`) junto con la configuración y las estadísticas de normalización. Es relevante para investigadores en robótica que trabajan con modelos de acción basados en difusión y necesitan reproducir o continuar entrenamientos sobre el dataset SBInt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM (Wan2.2-TI2V-5B + ActionDiT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato trainer) |
| Idiomas soportados | no disponible (modelo de accion, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `step_010000.pt` (formato de pesos de trainer), `config.yaml`, `dataset_stats.json` |

## Arquitectura y entrenamiento

FastWAM es un modelo híbrido que combina un codificador de video (Wan2.2-TI2V-5B) con un decodificador de acciones basado en difusión (ActionDiT). El modelo recibe observaciones visuales y genera comandos de acción para el brazo robótico. En este checkpoint, las acciones se representan en un espacio absoluto de 16 dimensiones: 7 para el brazo derecho, 1 para el gripper derecho, 7 para el brazo izquierdo y 1 para el gripper izquierdo, en ese orden. Las acciones se normalizan mediante z-score, usando las estadísticas del dataset de entrenamiento.

El entrenamiento se realizó sobre el dataset SBInt openarm, que contiene 873 episodios de demostraciones. Se usó un esquema de entrenamiento con 2×8 GPUs, batch global de 128, optimizador AdamW con tasa de aprendizaje 1e-4 y programación coseno. El checkpoint corresponde al paso 10 000 de un total de 50 000 pasos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un entrenamiento supervisado de imitación.

## Capacidades

- Generacion de acciones de control para un brazo robótico OpenArm de 7 DOF, con dos brazos y dos grippers.
- Procesamiento de observaciones visuales (video) para generar comandos de acción en tiempo real.
- Soporte para acciones absolutas (coordenadas directas) en lugar de acciones relativas o delta.
- Normalizacion de acciones mediante z-score, lo que facilita la estabilidad del entrenamiento.
- Integracion con el ecosistema FastWAM, que soporta LeRobot v3.0 y permite alternar entre actuar con o sin "imaginacion futura" (future imagination).
- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts conversacionales.

## Casos de uso

- Control de un brazo robótico OpenArm en entornos de investigacion: el modelo puede generar comandos de accion a partir de observaciones visuales, permitiendo tareas de manipulacion como agarrar, empujar o ensamblar objetos.
- Reproduccion de experimentos de aprendizaje por imitacion: al ser un checkpoint intermedio (step 10 000), puede usarse para estudiar la dinamica del entrenamiento y comparar con checkpoints posteriores (por ejemplo, step 50 000).
- Desarrollo de politicas de control para robots humanoides: el modelo produce acciones para dos brazos simultaneamente, lo que es util para tareas bimanuales.
- Evaluacion de metodos de normalizacion de acciones: el uso de z-score en espacio absoluto puede compararse con otros esquemas (delta, relativo) en el mismo dataset.
- Investigacion sobre modelos de difusion para control robotico: FastWAM combina un modelo de video con un decodificador de difusion, y este checkpoint permite estudiar el comportamiento del ActionDiT en un punto concreto del entrenamiento.
- Integracion en pipelines de robotica con LeRobot: al ser compatible con LeRobot v3.0, puede cargarse en ese framework para evaluacion o despliegue en simulacion o hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de exito en tareas roboticas. El unico dato cuantitativo es el tamano del repositorio (12.0 GB) y el numero de pasos de entrenamiento (10 000 de 50 000).

## Requisitos de hardware

- Tamano del repositorio: 12.0 GB, lo que sugiere que el checkpoint completo requiere al menos esa cantidad de almacenamiento.
- VRAM estimada para inferencia: no disponible. Dado que el modelo base es Wan2.2-TI2V-5B (5 mil millones de parametros), se estima que la inferencia requiere al menos 10-12 GB de VRAM en FP16, pero no hay confirmacion.
- GPU recomendadas: no disponible. Se asume que requiere GPUs de alta gama (A100, H100, RTX 4090) por el tamano del modelo, pero no se especifica.
- Si cabe en consumer GPU: no confirmado. Un modelo de 5B en FP16 puede caber en una RTX 4090 (24 GB) con cuantizacion, pero no hay datos.
- Opciones de despliegue: no disponible. El formato de pesos es de trainer, no hay archivos GGUF, safetensors ni soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion proporcionada. Existen otros checkpoints de la misma autora (por ejemplo, `chennana1028/gwp05-openarm-sbint-abs-step50000` y `chennana1028/gwp05-openarm-sbint-delta-step50000`), que parecen variantes del mismo modelo con diferentes espacios de accion (absoluto vs delta) y pasos de entrenamiento. Sin embargo, no se dispone de datos de rendimiento para comparar. El repositorio FastWAM original (https://github.com/yuantianyuan01/FastWAM) es la referencia principal, pero no se proporcionan comparativas con otros modelos de control robotico.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final optimizado. El paso 10 000 de 50 000 puede no haber convergido completamente.
- No se especifica la licencia, por lo que el uso comercial o la redistribucion pueden estar restringidos. Se debe contactar con el autor para aclarar los terminos.
- No hay informacion sobre sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de control robotico, un mal comportamiento podria causar danos fisicos si se despliega en hardware real sin supervision.
- El modelo solo genera acciones; no tiene capacidades de lenguaje, vision general ni razonamiento simbolico.
- La normalizacion z-score depende de las estadisticas del dataset de entrenamiento; si se usa con datos fuera de distribucion, las acciones pueden ser invalidas.
- No se proporcionan instrucciones de uso, ni ejemplos de inferencia, ni scripts de evaluacion en la model card.
- El formato de pesos es propietario del trainer; no es compatible directamente con frameworks de inferencia estandar como vLLM o llama.cpp.

## Enlaces

- HuggingFace: https://huggingface.co/chennana1028/fastwam-openarm-sbint-abs-step10000
- Repositorio FastWAM (GitHub): https://github.com/yuantianyuan01/FastWAM
- Repositorio OpenArm (GitHub): https://github.com/enactic/openarm
- Sitio web de OpenArm: https://openarm.dev/
- Checkpoint relacionado (abs step 50000): https://huggingface.co/chennana1028/gwp05-openarm-sbint-abs-step50000
- Checkpoint relacionado (delta step 50000): https://huggingface.co/chennana1028/gwp05-openarm-sbint-delta-step50000
