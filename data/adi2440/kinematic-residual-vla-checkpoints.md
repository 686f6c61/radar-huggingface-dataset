# adi2440/kinematic-residual-vla-checkpoints

## Resumen

Kinematic Residual VLA Checkpoints es una colección de checkpoints de investigación para modelos de visión-lenguaje-acción (VLA) orientados a robótica. El repositorio lo publica el usuario adi2440 (Aditya Parameshwaran) y no constituye un modelo único, sino un conjunto de pesos derivados de tres arquitecturas base: DynamicVLA/DOM (`hzxie/dynamic-vla-DOM`), π0.5 (`lerobot/pi05_base`) y SmolVLA (`lerobot/smolvla_base`). La propuesta técnica central es la "residual cinemática" (KR, kinematic residual) combinada con flow matching, aplicada sobre las arquitecturas VLA existentes para condicionar la generación de acciones.

El repositorio incluye tanto variantes con KR como líneas base emparejadas (baselines) para permitir comparaciones controladas, además de checkpoints de VLASH, DOMV y KRV100. Su relevancia es acotada: se trata de material de evaluación y continuación de fine-tuning, no de un modelo listo para producción. La model card es explícita sobre el estado incompleto de muchas ejecuciones (épocas parciales, splits de datos distintos, contadores de actualizaciones autoritativos) y advierte que el índice lista la publicación completa prevista, no necesariamente los ficheros presentes.

La información disponible no incluye número de parámetros, longitud de contexto ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es mixta, heredada de los modelos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con flow matching y residual cinemática; derivada de DynamicVLA/DOM, π0.5 y SmolVLA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other (mixed-upstream-licenses); ver NOTICES.md |
| Formato de pesos | no disponible (librería pytorch; se descargan checkpoints por directorio) |

## Arquitectura y entrenamiento

Los checkpoints se construyen sobre arquitecturas VLA que combinan un codificador visión-lenguaje con un cabezal de generación de acciones. La innovación declarada es la residual cinemática (KR), que se aplica sobre el modelo base y se acompaña de variantes con condicionamiento por velocidad (DOMV). El paradigma de generación de acciones es flow matching, según las etiquetas del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El entrenamiento se organiza en varios ámbitos de datos: `full` (KRV100, época 3 y época 4 más parte de la 5, con 203.151 episodios de entrenamiento retenidos), `large-audited-197198` (DOMV, con 197.198 episodios retenidos, el 97,066% de los episodios publicados), `full-historical`, `20k-fresh` (fine-tuning sobre un split común de 20.000 episodios partiendo de pesos preentrenados), `20k-continuation` y `mixed-full-then-20k`. La model card advierte que estos splits no son equivalentes entre sí y que las variantes "gate" son configuraciones de evaluación, no pesos entrenados distintos. Varias ejecuciones están incompletas: π0.5 + KR tiene seis épocas completas más parte de la séptima, y el baseline VLASH retenido más reciente tampoco está terminado.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (pipeline `robotics`).
- Control visuomotor condicionado por lenguaje, heredado de las arquitecturas VLA base.
- Variantes con condicionamiento por velocidad (DOMV) para modelar dinámica del movimiento.
- Residual cinemática (KR) como mecanismo de corrección sobre el modelo base.
- Flow matching para la generación de trayectorias de acción.
- Evaluación comparativa mediante líneas base emparejadas (SmolVLA, π0.5, VLASH).
- Continuación de fine-tuning a partir de los checkpoints publicados.
- Idioma: inglés únicamente.
- No se documentan tool calling, capacidades de agente multi-paso ni modos de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación en VLA: usar los checkpoints KR y sus baselines emparejados para medir el efecto aislado de la residual cinemática sobre el mismo split de datos.
- Reproducción de experimentos: descargar un checkpoint concreto mediante `checkpoint_tools.py` y `model-index.json` para replicar una comparación concreta sin bajar el repositorio completo.
- Fine-tuning sobre datos propios: partir de `20k-fresh` (DOM o KRV100) para adaptar el modelo a un nuevo entorno robótico con un presupuesto de datos reducido.
- Estudio de condicionamiento por velocidad: emplear las variantes DOMV para analizar cómo la información cinemática afecta a la calidad de las trayectorias generadas.
- Análisis de procedencia y auditoría de datos: los ámbitos `full`, `large-audited-197198` y `20k-*` permiten estudiar el impacto del tamaño y la composición del split en el rendimiento final.
- Evaluación de robustez en manipulación: comparar SmolVLA baseline frente a SmolVLA KR en la misma continuación de 20.000 episodios para aislar el efecto del residual.
- Docencia y prototipado en robótica: usar SmolVLA como base ligera para experimentos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni tamaño de los checkpoints).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La descarga se realiza con `huggingface_hub` y el script `tools/checkpoint_tools.py`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Rol en este repositorio | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DynamicVLA/DOM (`hzxie/dynamic-vla-DOM`) | Modelo base de las variantes DOM y DOMV | no disponible | no disponible | no disponible | Hugging Face |
| π0.5 (`lerobot/pi05_base`) | Modelo base de las variantes pi05_baseline y pi05_kr | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| SmolVLA (`lerobot/smolvla_base`) | Modelo base de las variantes smolvla_baseline y smolvla_kr | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de investigación: no es un modelo empaquetado para producción ni incluye instrucciones de despliegue en servidores de inferencia.
- Estado incompleto: varias ejecuciones no han terminado (épocas parciales en KRV100 full, VLASH, π0.5 + KR); la model card indica que los contadores de actualizaciones son la referencia autoritativa.
- Splits de datos no equivalentes: `full` (203.151 episodios) y `large-audited-197198` (197.198 episodios) no son el mismo conjunto, lo que impide comparaciones directas entre todas las variantes.
- Disponibilidad de ficheros incierta: el índice lista la publicación completa prevista; un checkpoint solo está disponible cuando aparecen todos sus ficheros en `files.json` y `upload-status.json`.
- Licencia mixta: los términos aplicables dependen de los modelos upstream (DynamicVLA/DOM, π0.5, SmolVLA); es obligatorio revisar `licenses/NOTICES.md` antes de cualquier uso comercial.
- Idioma: solo inglés.
- Sin datos publicados de parámetros, contexto, cuantización ni benchmarks, lo que dificulta estimar costes de despliegue.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de acción robótica, los errores se traducen en comandos motores incorrectos, con riesgo físico asociado.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin validación externa conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adi2440/kinematic-residual-vla-checkpoints
- Aviso de licencias: https://huggingface.co/adi2440/kinematic-residual-vla-checkpoints/blob/main/licenses/NOTICES.md
- Perfil del autor: https://huggingface.co/adi2440
- Modelo base DynamicVLA/DOM: https://huggingface.co/hzxie/dynamic-vla-DOM
- Modelo base π0.5: https://huggingface.co/lerobot/pi05_base
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
