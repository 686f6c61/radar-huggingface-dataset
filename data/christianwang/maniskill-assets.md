# ChristianWang/maniskill-assets

## Resumen

`ChristianWang/maniskill-assets` no es un modelo de lenguaje, sino un repositorio de artefactos (pesos de políticas y modelos auxiliares) asociado a un estudio de adaptación fuera de distribución (OOD) sobre ManiSkill, denominado Q-VGM en la model card. Contiene políticas de imitación entrenadas con flow matching sobre representaciones DINO (vflow), modelos de dinámica latente sobre estado privilegiado y los datos de demostración preparados para su reproducción online, todo ello para dos tareas de manipulación: `PushCube-v1` y `PlaceSphere-v1`.

El repositorio ocupa 0,2 GB y se publica sin pipeline declarado, sin licencia explícita y sin idiomas indicados. Su relevancia es acotada: sirve como material reproducible para investigar generalización OOD en robótica de manipulación con el simulador ManiSkill, no como modelo desplegable para inferencia de propósito general.

Al no tratarse de un modelo de lenguaje, varias de las filas de especificaciones estándar (contexto, cuantización, idiomas) no aplican y se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de imitación con flow matching sobre features DINO (vflow); modelos de dinámica latente sobre estado privilegiado |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (pesos en `policy.pt`, sin variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`policy.pt`) para políticas; directorios de modelos de dinámica latente; datos en formato nativo ManiSkill (`native_obs`, `proprio`, `action`, `reward`) |

## Arquitectura y entrenamiento

Las políticas `policies/{pushcube,placesphere}_wrist_sft50/policy.pt` son políticas de imitación supervisada (SFT) basadas en flow matching sobre representaciones visuales DINO, entrenadas con 50 demostraciones generadas por planificación de movimiento. El entorno emplea el robot `panda_wristcam` con cámara base y cámara de muñeca, y control `pd_ee_delta_pose`.

El repositorio incluye además modelos de dinámica latente sobre el estado privilegiado del objeto (`models/{pushcube,placesphere}_priv50/`), descritos como diagnóstico, junto con los estados privilegiados preparados de las 50 demos ID usados para su replay online. También se incluyen 60 episodios de demostración ID (`data/{pushcube,placesphere}_wrist60_native/`) sin frames de cámara, empleados como filas de preentrenamiento del crítico de estado (`critic_id_dirs`). No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO, extremos que no aplican a este tipo de artefacto.

## Capacidades

- Ejecución de políticas de manipulación robótica para `PushCube-v1` y `PlaceSphere-v1` en ManiSkill con robot `panda_wristcam`.
- Control por delta de pose del efector final (`pd_ee_delta_pose`) a partir de observaciones visuales (cámara base y de muñeca).
- Modelado de dinámica latente sobre estado privilegiado del objeto (uso diagnóstico).
- Replay de estados privilegiados de las 50 demos ID.
- Preentrenamiento de un crítico de estado a partir de 60 episodios ID en formato nativo.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de generalización OOD: cargar `policy.pt` en ManiSkill y evaluar la política `pushcube_wrist_sft50` sobre variaciones de la tarea para estudiar la degradación fuera de distribución.
- Estudio de imitación con pocos datos: usar las 50 demos de planificación de movimiento como referencia para comparar métodos de SFT con flow matching frente a alternativas.
- Investigación en dinámica latente: emplear `models/{pushcube,placesphere}_priv50/` como línea base diagnóstica para analizar la calidad de la representación del estado privilegiado.
- Preentrenamiento de críticos de estado: utilizar `data/*_wrist60_native/` como filas de preentrenamiento del crítico y validar la influencia del preentrenamiento en el rendimiento posterior.
- Verificación de integridad de artefactos: comprobar cada fichero con `MD5SUMS` antes de lanzar runs, útil en pipelines de evaluación reproducibles.
- Docencia y formación en robótica de manipulación: servir de ejemplo mínimo (0,2 GB) de estructura de artefactos (políticas, modelos, datos) para un curso práctico con ManiSkill.
- Comparación de configuraciones de cámara: evaluar el efecto de usar cámara base y de muñeca frente a configuraciones alternativas sobre las mismas demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,2 GB) sugiere que los pesos caben holgadamente en cualquier GPU consumer, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible. ManiSkill requiere GPU para simulación paralelizada; el repositorio no indica modelos concretos.
- Compatibilidad con GPU consumer: probable por el tamaño de los artefactos, pero no confirmada en la información disponible.
- Despliegue: pensado para ejecutarse dentro del ecosistema ManiSkill (SAPIEN); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de imitación para ManiSkill con artefactos publicados).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenado únicamente con 50 demos ID por tarea; el rendimiento OOD no está cuantificado en la información disponible.
- Los modelos de dinámica latente se describen como diagnósticos, no como componentes listos para producción.
- Los datos `wrist60_native` carecen de frames de cámara, por lo que no sirven para entrenar políticas visuales directamente.
- Riesgo de sobreajuste a las condiciones del simulador (cámaras, control `pd_ee_delta_pose`, robot `panda_wristcam`); la transferencia a hardware real no está documentada.
- Sin pipeline ni idiomas declarados en Hugging Face; metadatos mínimos que dificultan su descubrimiento y reutilización.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual; el riesgo relevante es el fallo silencioso de la política en escenarios OOD.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChristianWang/maniskill-assets
- ManiSkill (sitio oficial): https://www.maniskill.ai/
- Documentación de ManiSkill: https://maniskill.readthedocs.io/
