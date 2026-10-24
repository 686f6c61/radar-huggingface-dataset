# b-sigpro/doom-sed

## Resumen

DOOM-SED (Downstream-Oriented Open-Vocabulary Model for Sound Event Detection) es un modelo de detección de eventos sonoros de vocabulario abierto publicado en Hugging Face por el usuario b-sigpro. La autoría del trabajo corresponde a Shun Sakurai, Yudai Kandori, Yoshiaki Bando, Keisuke Imoto y Masaki Onishi, y se cita en el 11.º Workshop DCASE 2026. Su objetivo es detectar eventos acústicos definidos por el usuario mediante un fichero de etiquetas, en lugar de limitarse a un conjunto cerrado de clases.

El modelo se construye sobre LAION-CLAP htsat-fused e incorpora BEATs como componente base; se distribuye con la librería m3l y el pipeline audio-classification. El repositorio ocupa 1,3 GB y la licencia es Apache-2.0, con las licencias de los modelos base: LAION-CLAP Apache-2.0 y BEATs MIT. La aproximación open-vocabulary reduce la necesidad de reentrenar para cada nuevo conjunto de eventos, lo que resulta relevante para evaluar y desplegar sistemas de monitorización acústica con clases cambiantes.

No se especifican el número de parámetros, la longitud de contexto ni la duración máxima de audio, y no hay resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo construido sobre LAION-CLAP htsat-fused e incorpora BEATs como componente base |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (modelo de audio); no se documenta la duración máxima de audio |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés; las etiquetas de eventos se proporcionan en inglés) |
| Licencia | Apache-2.0; componentes base: LAION-CLAP Apache-2.0 y BEATs MIT |
| Formato de pesos | no disponible; el repositorio ocupa 1,3 GB y la carga se realiza mediante `hf://` en el pipeline de m3l |
| Tarea | detección de eventos sonoros de vocabulario abierto (open-vocabulary SED) |
| Pipeline | audio-classification |
| Modelo base | laion/clap-htsat-fused |
| Librería | m3l |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de DOOM-SED ni el volumen o la composición de los datos de entrenamiento. Se indica que el modelo parte de LAION-CLAP htsat-fused, un modelo audio-texto con encoder de audio HTSAT, y que incorpora BEATs como componente base. La tarea principal es la detección de eventos sonoros de vocabulario abierto: el usuario proporciona un fichero `label_names.json` con las etiquetas de los eventos que desea detectar y el pipeline genera un fichero `output.pkl` con las detecciones.

No se especifican tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; en un modelo de clasificación y detección de audio estas técnicas no se describen de forma directa. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o attention linear.

## Capacidades

- Detección de eventos sonoros de vocabulario abierto: acepta etiquetas definidas por el usuario en un fichero `label_names.json`.
- Clasificación de audio mediante el pipeline `audio-classification`.
- Generación de resultados en formato pickle (`output.pkl`) a través del pipeline de m3l.
- Funcionamiento con etiquetas en inglés; no se documenta soporte multilingüe adicional.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, generación de audio, transcripción o diarización.

## Casos de uso

- Monitorización de ruido urbano: se procesan grabaciones de sensores acústicos por fragmentos y se definen etiquetas como `siren`, `construction`, `traffic` o `alarm` en `label_names.json`. El enfoque open-vocabulary permite añadir nuevas categorías sin reentrenar el modelo, y la salida `.pkl` se puede agregar en un panel de indicadores.
- Mantenimiento predictivo industrial: se analizan audio de maquinaria con etiquetas como `metal impact`, `leak` o `bearing squeal` para detectar anomalías acústicas. La posibilidad de definir etiquetas específicas por equipo facilita adaptar el sistema a distintas líneas de producción.
- Automatización del hogar: se detectan eventos como `doorbell`, `glass breaking` o `running water` para activar automatizaciones o avisos. El modelo es adecuado porque el vocabulario se declara en el fichero de etiquetas y no requiere un clasificador cerrado para cada instalación.
- Bioacústica y monitorización ambiental: se procesan grabaciones de campo por fragmentos con etiquetas como `bird call` o `insect stridulation`. La detección open-vocabulary permite adaptar el conjunto de eventos a distintos ecosistemas sin reentrenar.
- Etiquetado y indexación de archivos audiovisuales: se generan metadatos de eventos sonoros para búsqueda y catalogación. La salida estructurada en `.pkl` se puede integrar en un postproceso que construya índices por evento.
- Vigilancia y seguridad acústica: se detectan eventos como `gunshot`, `scream` o `alarm` para priorizar revisiones humanas. Es adecuado como filtro preliminar, pero requiere validación y cumplimiento normativo antes de usarse en producción.
- Investigación y reproducción en DCASE: se utiliza el comando de inferencia de m3l para reproducir experimentos y comparar configuraciones de etiquetas. La disponibilidad del pipeline facilita pruebas controladas con audios y listas de eventos.
- Robótica móvil: se detectan eventos externos como `siren` o `glass breaking` para que un robot cambie de comportamiento o solicite asistencia. La integración requiere validar la latencia y el formato de salida en el sistema robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,3 GB, pero no se indica el número de parámetros ni el pico de memoria; no es posible calcularla sin esos datos.
- GPU recomendadas: no disponible. No se especifican modelos de GPU ni requisitos mínimos.
- ¿Cabe en una GPU de consumo?: no se puede determinar con la información disponible.
- Despliegue: pipeline de m3l mediante el comando `python -m m3l.audiotext.ov_sed.pipelines.detect one hf://b-sigpro/doom-sed label_names.json input.wav output.pkl task.weights_only=false task.strict=false`. Requiere Python y el paquete m3l.
- Otras opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de audio, estas herramientas de serving de LLM no son aplicables directamente.
- Latencia y throughput: no disponible.
- Almacenamiento: 1,3 GB para el repositorio del modelo.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de detección de eventos sonoros open-vocabulary en la información proporcionada. La siguiente tabla incluye los componentes base como referencia, no como alternativas equivalentes.

| Modelo | Tipo | Parámetros | Contexto o duración | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| DOOM-SED | SED open-vocabulary | no disponible | no disponible | Apache-2.0 | Hugging Face | no disponible |
| LAION-CLAP htsat-fused | modelo audio-texto | no disponible | no disponible | Apache-2.0 | Hugging Face | no disponible |
| BEATs | preentrenamiento de audio | no disponible | no disponible | MIT | GitHub | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo se etiqueta para inglés (`en`); las etiquetas de eventos deben proporcionarse en inglés. No se documenta soporte multilingüe.
- Vocabulario abierto: la detección de etiquetas arbitrarias no está garantizada. Pueden aparecer falsos positivos y falsos negativos, especialmente con clases poco representadas o ambiguas.
- Sin benchmarks publicados: no hay métricas de precisión, recall o F1 en la información disponible, por lo que no se puede comparar su rendimiento con otros sistemas.
- Sin datos de entrenamiento: no se documentan la composición del dataset ni posibles sesgos; los sesgos acústicos y de anotación son desconocidos.
- Validación comunitaria limitada: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario.
- Duración de audio: no se documenta la duración máxima de entrada; se recomienda procesar por fragmentos y validar el comportamiento en grabaciones largas.
- Formato de pesos: no se documenta el formato exacto; la inferencia depende del pipeline de m3l y de la carga mediante `hf://`.
- Licencia: Apache-2.0 permite uso comercial con obligaciones de atribución y avisos; deben revisarse también las licencias de los componentes base, LAION-CLAP Apache-2.0 y BEATs MIT.
- Uso en producción: no debe emplearse para decisiones críticas de seguridad sin validación humana, control de falsos positivos y cumplimiento de la normativa aplicable.

## Enlaces

- Hugging Face: https://huggingface.co/b-sigpro/doom-sed
- LAION-CLAP: https://huggingface.co/laion/clap-htsat-fused
- BEATs: https://github.com/microsoft/unilm/blob/master/beats
- Referencia bibliográfica: Sakurai et al., «DOOM-SED: Downstream-Oriented Open-Vocabulary Model for Sound Event Detection», DCASE 2026, páginas 245-249 (sin URL en la información proporcionada).
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados disponibles tratan sobre la letra «B» y no guardan relación con el modelo.
