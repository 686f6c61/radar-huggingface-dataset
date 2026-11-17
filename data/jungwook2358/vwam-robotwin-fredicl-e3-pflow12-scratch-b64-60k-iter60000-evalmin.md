# jungwook2358/vwam-robotwin-fredicl-e3-pflow12-scratch-b64-60k-iter60000-evalmin

## Resumen

`vwam-robotwin-fredicl-e3-pflow12-scratch-b64-60k-iter60000-evalmin` es un checkpoint de investigación en robótica publicado por el usuario jungwook2358 en Hugging Face. No es un modelo de lenguaje: es un modelo de política visuomotora (visuomotor policy) entrenado dentro del marco VWAM (Video World-Action Model) sobre el benchmark RoboTwin 2.0 con la plataforma de manipulación aloha-agilex. Su propósito es generar secuencias de acciones de robot (chunks de 48 acciones) a partir de observaciones visuales, en un contexto de manipulación bimanual.

El checkpoint corresponde al experimento EXP-0027 y sigue la receta "FRED-ICL E3", que combina un backbone Cosmos3-Nano con un ActionDiT basado en Mixture-of-Transformers (MoT) entrenado desde cero, sobre un lienzo temporal de 320 pasos, con tamaño de batch global 64 y 60 000 iteraciones. Se trata de un entrenamiento con datos de 43 tareas de RoboTwin (dejando fuera las siete tareas del split `zerowam_unseen7`) co-entrenado con vídeos humanos de HumanGen, e incorpora una rama auxiliar de movimiento pointflow (solo en entrenamiento) con 12 puntos de mano humana y 3 puntos por brazo robótico.

Su relevancia es acotada y muy específica: es un artefacto de reproducibilidad para la línea de investigación de world-action models aplicados a manipulación robótica. El repositorio contiene únicamente la copia "eval-minimal" del paso 60 000 (pesos EMA bajo el prefijo `net.*`, `config.yaml` y `EVAL_MINIMAL.json`), sin pesos de entrenamiento en crudo, optimizador ni estado del trainer, y no incluye model card descriptiva de capacidades, benchmarks ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (backbone) + ActionDiT MoT desde cero, rama pointflow auxiliar en entrenamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (lienzo temporal t320; chunk de 48 acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | checkpoint eval-minimal con pesos EMA bajo prefijo `net.*` + `config.yaml` + `EVAL_MINIMAL.json`; safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo sigue la receta FRED-ICL E3: un backbone Cosmos3-Nano acoplado a un ActionDiT construido con Mixture-of-Transformers (MoT) y entrenado desde cero. El entrenamiento opera sobre un lienzo temporal de 320 pasos y produce chunks de 48 acciones. El tamaño de batch global es 64 y el run alcanza 60 000 iteraciones. Sobre esta base, la variante `pflow12` añade una rama de movimiento pointflow que solo se usa durante el entrenamiento: 12 puntos de mano humana y 3 puntos por brazo robótico (slot de muñeca y puntas de las pinzas en los slots pulgar/índice).

Los datos de entrenamiento combinan las 43 tareas de RoboTwin 2.0 (aloha-agilex) del split Zero-WAM, excluyendo las siete tareas de `zerowam_unseen7`, con 854 vídeos humanos de HumanGen correspondientes a esas 43 tareas. No se documentan en la información disponible el número de tokens, la composición detallada del dataset, ni si hubo RLHF/DPO (poco probable en un modelo de política robótica).

## Capacidades

- Generación de acciones de manipulación robótica bimanual en chunks de 48 pasos a partir de observaciones visuales.
- Control sobre la plataforma aloha-agilex en el entorno RoboTwin 2.0.
- Co-entrenamiento con vídeos humanos para transferencia de habilidades desde demostraciones HumanGen.
- Rama pointflow de movimiento (solo entrenamiento) con puntos de mano y de pinza.
- Evaluación reproducible mediante `vwam/eval/eval_robotwin_task.sh` sobre el árbol de código RLDX-2-VWAM (rama `jungwook/fredicl-pflow`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni thinking mode.

## Casos de uso

- Reproducción de experimentos en RoboTwin 2.0: cargar el checkpoint con `eval_robotwin_task.sh` para verificar los resultados del paso 60 000 en las 43 tareas de entrenamiento y en el split `zerowam_unseen7`.
- Investigación en world-action models: usar el checkpoint como referencia base para comparar variantes de la receta FRED-ICL E3 con y sin rama pointflow.
- Estudio de transferencia humano-robot: analizar cómo el co-entrenamiento con 854 vídeos HumanGen afecta a la generalización en tareas de manipulación bimanual.
- Ablaciones de arquitectura MoT: servir de punto de partida para sustituir o modificar el ActionDiT y medir el impacto en éxito de tarea.
- Validación de pipelines de evaluación: integrar el checkpoint en un harness de evaluación automatizada de políticas visuomotoras sobre aloha-agilex.
- Docencia y divulgación: ejemplo tangible de entrenamiento desde cero de un modelo de acción con backbone Cosmos3-Nano y chunking de 48 acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32,0 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM dependerá del backbone Cosmos3-Nano y del ActionDiT, no documentados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica evaluación mediante `vwam/eval/eval_robotwin_task.sh` sobre el árbol de código RLDX-2-VWAM (rama `jungwook/fredicl-pflow`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas visuomotoras sobre RoboTwin 2.0) con parámetros, contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- Licencia `other`: no se especifican términos de uso comercial; es necesario contactar con el autor o revisar el repositorio antes de cualquier uso en producción.
- Es un checkpoint de investigación, no un modelo listo para producción: solo contiene la copia eval-minimal (pesos EMA, `config.yaml`, `EVAL_MINIMAL.json`), sin optimizador ni estado del trainer.
- Entrenado exclusivamente en 43 tareas de RoboTwin 2.0 con aloha-agilex; no se espera generalización fuera de ese dominio ni de esa plataforma.
- Las siete tareas de `zerowam_unseen7` quedaron fuera del entrenamiento, por lo que su comportamiento en ellas es el de una evaluación de generalización, no de ajuste.
- No hay información sobre sesgos, alucinación (concepto poco aplicable a un modelo de acción), limitaciones idiomáticas ni latencia.
- El repositorio no incluye model card con métricas de éxito, curvas de entrenamiento ni detalles del dataset más allá de lo citado.
- Requiere el árbol de código exacto (rama `jungwook/fredicl-pflow`) para la evaluación; otras versiones pueden producir resultados no comparables.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/vwam-robotwin-fredicl-e3-pflow12-scratch-b64-60k-iter60000-evalmin
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
