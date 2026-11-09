# CurMack/compliant-code-assets-pretrained

## Resumen

`CurMack/compliant-code-assets-pretrained` es un repositorio de Hugging Face que no contiene un modelo de lenguaje en el sentido habitual, sino un archivo empaquetado (snapshot) de código fuente, activos de robot y pesos preentrenados del proyecto "Compliant". El paquete se publicó el 9 de noviembre de 2026 y ocupa 1,3 GB en el repositorio (un archivo `.tar.zst` de 1.250.644.607 bytes, unos 1,16 GiB, con 9.516 ficheros verificados por SHA256).

El contenido agrupa el código actual del proyecto (incluidas modificaciones de Compliance IK no confirmadas en el repositorio original), los activos del robot humanoide Unitree G1 (modelos, mallas, materiales y fixtures de prueba), los pesos base SONIC v1.1, las políticas PyTorch/ONNX de GentleHumanoid G1 y ocho modelos preentrenados de SoftMimic para tareas de movimiento. La etiqueta de pipeline es `robotics` y los idiomas declarados son chino (zh) e inglés (en).

Su relevancia es acotada: no es un modelo desplegable para inferencia de texto ni de visión general, sino un artefacto de reproducibilidad para investigación en control de humanoides. No se especifica licencia unificada; cada componente conserva la licencia de su proyecto de origen (SONIC/GR00T-WholeBodyControl de NVIDIA, GentleHumanoid de Axellwppr, SoftMimic de Improbable-AI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (archivo de código, activos y pesos de varios componentes; no se describe una arquitectura única) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se incluyen pesos PyTorch y ONNX base, sin detalle de cuantización) |
| Idiomas soportados | zh, en (según metadatos del repositorio) |
| Licencia | no disponible (sin licencia unificada; cada componente conserva la de su origen) |
| Formato de pesos | PyTorch y ONNX (políticas base de GentleHumanoid G1); pesos SONIC v1.1 y SoftMimic sin formato detallado; paquete `.tar.zst` con manifiesto SHA256 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor del repositorio, sino de un archivo de componentes de terceros. El paquete incluye los pesos base SONIC v1.1 (procedentes de `nvidia/GEAR-SONIC`, versión de descarga `6733128a3d8a523b1418b06bca3cdf61c8b0987f`), las políticas PyTorch/ONNX de GentleHumanoid G1 y ocho modelos preentrenados de SoftMimic para acciones o métodos de locomoción y manipulación. No se documenta en la model card el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o cualquier etapa de ajuste; tampoco se describe la arquitectura interna de cada política (transformer, MLP, política de control, etc.).

El contenido incluye código fuente del proyecto, dependencias, configuraciones, scripts de espacio de trabajo, activos del Unitree G1 (modelos, mallas, materiales, fixtures numéricos fijos), versiones de paquetes, números de versión de origen y un manifiesto SHA256 por fichero. El autor indica explícitamente que **no** se incluyen checkpoints del entrenamiento actual, logs de experimentos, trayectorias de evaluación, datasets de movimiento, vídeos, historial Git, entorno de instalación ni caché. Algunas entradas de ejecución requieren preparar datos, pesos de entrenamiento y ajustar rutas absolutas de la máquina original.

## Capacidades

- Archivo reproducible de código y activos para el robot humanoide Unitree G1.
- Inclusión de los pesos base SONIC v1.1 para control de cuerpo completo (whole-body control).
- Políticas base de GentleHumanoid G1 en PyTorch y ONNX, aptas para despliegue en tiempo de ejecución ONNX.
- Ocho modelos preentrenados de SoftMimic para acciones o métodos de movimiento.
- Modificaciones de Compliance IK (cinemática inversa) presentes en el código fuente, incluidas las no confirmadas.
- Fixtures numéricos fijos para pruebas de cumplimiento y validación.
- Verificación de integridad mediante SHA256 por fichero y validación de decodificación del flujo comprimido.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo general.

## Casos de uso

- Reproducción de experimentos de control de humanoides: el paquete permite reconstruir el entorno de código y los pesos base de SONIC v1.1 y GentleHumanoid G1 para replicar resultados de control de cuerpo completo en el Unitree G1.
- Investigación en cinemática inversa compliant: las modificaciones de Compliance IK incluidas permiten estudiar y extender el comportamiento de cumplimiento (compliance) en el control articular del G1.
- Evaluación de políticas en simulación: los activos del G1 (mallas, materiales, fixtures) y las políticas ONNX permiten montar escenarios de simulación física con parámetros fijos y verificables.
- Benchmarking de métodos de imitación de movimiento: los ocho modelos de SoftMimic sirven como línea base para comparar métodos de aprendizaje por imitación en acciones concretas.
- Auditoría de integridad de artefactos: el manifiesto SHA256 y el `archive-index.jsonl` permiten validar la cadena de custodia de cada fichero en pipelines de CI o entornos regulados.
- Docencia y formación en robótica: el paquete ofrece un conjunto cerrado y verificado de código, activos y pesos para prácticas de control de humanoides sin depender de descargas dispersas.
- Base para despliegue en tiempo de ejecución ONNX: las políticas ONNX de GentleHumanoid G1 pueden integrarse en un runtime de inferencia robótica para pruebas de latencia y control en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del componente concreto (políticas de control, no modelos de lenguaje).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX para las políticas de GentleHumanoid G1; el resto requiere el entorno del proyecto original (SONIC/GR00T-WholeBodyControl, SoftMimic) y ajuste de rutas absolutas.
- Latencia y throughput: no disponibles.
- Almacenamiento: 1,3 GB en el repositorio; el archivo comprimido ocupa 1,16 GiB y contiene 9.516 ficheros.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CurMack/compliant-code-assets-pretrained | Archivo de código, activos y pesos de robótica | no disponible | no disponible | no disponible (por componente) | Hugging Face, 0 descargas |
| nvidia/GEAR-SONIC | Pesos base de control de cuerpo completo | no disponible | no disponible | la del proyecto NVIDIA | Hugging Face (origen de SONIC v1.1) |
| Axellwppr/gentle-humanoid | Políticas de humanoide (PyTorch/ONNX) | no disponible | no disponible | la del proyecto original | GitHub |
| Improbable-AI/softmimic | Modelos de imitación de movimiento | no disponible | no disponible | la del proyecto original | GitHub |

No se dispone de datos de rendimiento comparables entre estos proyectos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal general; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- El paquete no incluye checkpoints del entrenamiento actual, logs, trayectorias de evaluación ni datasets de movimiento, por lo que no es autocontenido para reentrenar.
- Algunas entradas de ejecución requieren preparar datos y pesos adicionales y ajustar rutas absolutas de la máquina original.
- No existe una licencia unificada; cada componente conserva la licencia y los avisos de terceros de su proyecto de origen. El uso comercial debe verificarse componente a componente.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- Los idiomas declarados (zh, en) se refieren a la documentación y metadatos, no a capacidades lingüísticas del modelo.
- Riesgo de sesgos y alucinación: no aplica en el sentido habitual; el riesgo principal es la reproducibilidad y la integridad de los artefactos, mitigada parcialmente por el manifiesto SHA256.
- Las modificaciones de Compliance IK no confirmadas pueden diferir del código upstream y no están validadas externamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CurMack/compliant-code-assets-pretrained
- SONIC fuente: https://github.com/NVlabs/GR00T-WholeBodyControl
- SONIC pesos: https://huggingface.co/nvidia/GEAR-SONIC
- GentleHumanoid: https://github.com/Axellwppr/gentle-humanoid
- GentleHumanoid entrenamiento: https://github.com/Axellwppr/gentle-humanoid-training
- SoftMimic: https://github.com/Improbable-AI/softmimic
