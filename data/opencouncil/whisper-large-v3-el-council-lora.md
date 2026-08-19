# opencouncil/whisper-large-v3-el-council-lora

## Resumen

El modelo `opencouncil/whisper-large-v3-el-council-lora` es un adaptador LoRA sobre el modelo base `openai/whisper-large-v3`, desarrollado por el proyecto OpenCouncil ASR para la transcripción automática de discursos de consejos municipales griegos. El adaptador se entrena sobre aproximadamente 22,5 horas de audio procedente de 440 reuniones, con el objetivo de mejorar el reconocimiento de voz en un dominio muy específico: el lenguaje administrativo y los nombres propios (apellidos de concejales, topónimos) que aparecen en estas sesiones.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto y con licencia Apache 2.0 para un caso de uso institucional concreto, aunque los resultados publicados indican que no supera a servicios comerciales como Scribe v2 o Soniox en términos de error sobre palabras de dominio específico. El adaptador es ligero (0,1 GB) y se distribuye en formato PEFT, por lo que requiere el modelo base para funcionar. La arquitectura subyacente es la de Whisper Large-v3, un transformer encoder-decoder de aproximadamente 1550 millones de parámetros, aunque el adaptador solo modifica las proyecciones `q_proj` y `v_proj` con rango 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Whisper Large-v3 (transformer encoder-decoder) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=32, alpha=64, dropout 0.05 en `q_proj` y `v_proj`; el modelo base tiene ~1550M pero no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR; se usan ventanas pre-cortadas de ~120 s sin solapamiento) |
| Tipos de cuantizacion | int8 (CPU y CUDA, segun la configuracion de medicion) |
| Idiomas soportados | el (griego) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), PEFT |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `openai/whisper-large-v3` mediante LoRA, con rango 32, alpha 64 y dropout 0.05, aplicado únicamente a las capas de proyección `q_proj` y `v_proj` de la atención. El entrenamiento se realizó con PEFT 0.19.1 sobre un corpus propio de 28.967 clips de audio (aproximadamente 22,5 horas) extraídos de 440 reuniones de consejos municipales griegos. Se emplearon 2 épocas, 7.242 pasos de optimización, una tasa de aprendizaje de 1e-4 y semilla 13, en una única GPU A40. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

Una particularidad destacable es que el corpus de entrenamiento no se ha publicado, lo que limita la reproducibilidad. Además, la model card advierte que la configuración de decodificación afecta significativamente a los resultados: el mismo adaptador produce tokens distintos bajo CPU int8 y CUDA int8, por lo que las métricas publicadas solo son válidas si se replica exactamente el pipeline de decodificación descrito (CTranslate2 4.8+, faster-whisper 1.2+, beam_size 5, `condition_on_previous_text=False`).

## Capacidades

- Reconocimiento de voz automático en griego, especializado en discursos de consejos municipales.
- Transcripción de audio pre-cortado en ventanas de aproximadamente 120 segundos, sin solapamiento ni condicionamiento entre ventanas.
- Mejora del WER frente al modelo base `whisper-large-v3` en el dominio evaluado (reducción de 1,87 puntos en WER sobre ciudades no vistas).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio más allá de la transcripción.
- No se ha medido su comportamiento en audio de formato largo, streaming ni con VAD (detección de actividad de voz) integrada.

## Casos de uso

- Transcripción de sesiones plenarias de consejos municipales griegos: el adaptador está entrenado específicamente con este tipo de audio, por lo que puede integrarse en pipelines de transcripción institucional para generar actas textuales.
- Generación de actas y resúmenes de reuniones: combinado con un modelo de resumen, permite convertir el audio de una sesión en un documento estructurado con los acuerdos y debates.
- Búsqueda en archivos de audio históricos: al transcribir reuniones pasadas, se habilita la búsqueda por palabras clave en los archivos municipales, útil para periodistas, investigadores y ciudadanos.
- Accesibilidad para personas con discapacidad auditiva: la transcripción automática de las sesiones facilita el acceso a la información pública a personas con problemas de audición.
- Análisis de discursos políticos locales: los textos transcritos pueden alimentar estudios de lingüística computacional o análisis de contenido sobre la actividad de los concejales.
- Integración en sistemas de archivado municipal: el adaptador puede desplegarse con faster-whisper en servidores locales para procesar grabaciones de forma privada, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los resultados publicados se miden sobre 39 ventanas de audio de dos ciudades no vistas durante el entrenamiento (Argos y Orestiada), correspondientes a 31 reuniones anteriores a junio de 2026. La métrica principal es `wer-nofillers`, que elimina pausas de relleno tras una normalización griega. Es importante señalar que estos números miden el acuerdo con las transcripciones publicadas por OpenCouncil, no la fidelidad al audio.

| Comparacion | Δ (puntos) | Intervalo 90% | Conclusion |
|---|---|---|---|
| vs Scribe v2 | +1,12 | [−0,54, +2,73] | Empate estadistico |
| vs Soniox | +1,19 | [−0,48, +2,70] | Empate estadistico |
| vs base `whisper-large-v3` | −1,87 | [−3,35, −0,50] | Mejora significativa |
| vs adaptador anterior (roto) | −1,58 | [−2,41, −0,85] | Mejora significativa |

El WER absoluto del adaptador en esa muestra es de 0,1542. En cuanto a errores sobre términos de dominio (apellidos de concejales y nombres de ciudades), el DS-WER es de 0,4880, claramente peor que Soniox (0,3280) y Scribe v2 (0,3720), aunque mejor que el base whisper (0,5400) y Gladia (0,5880). El perfil de error es de 90 sustituciones frente a 28 eliminaciones, lo que indica que el modelo tiende a escribir nombres con errores de uno o dos caracteres en lugar de omitirlos.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0,1 GB, pero requiere el modelo base `whisper-large-v3` completo, que en fp16 ocupa aproximadamente 1,5 GB y en fp32 unos 3 GB.
- Para la configuración de medición publicada se usó una GPU RTX A4000 con cuantización int8 en CUDA. También se menciona una RTX 3090 para el adaptador anterior.
- El entrenamiento se realizó en una única GPU A40, lo que da una referencia del hardware mínimo para reproducir el fine-tuning.
- Es viable en GPUs de consumo como RTX 3060 o superiores si se usa cuantización int8 y el modelo base en fp16, aunque no se han publicado mediciones de latencia ni throughput.
- Opciones de despliegue: faster-whisper (CTranslate2) es el runtime recomendado por los autores; también se puede cargar con `transformers` + PEFT y fusionar el adaptador con `merge_and_unload()` para conversión a CTranslate2.

## Comparativa con modelos similares

La comparativa se realiza contra servicios comerciales de transcripción y contra el modelo base sin adaptar, sobre el mismo conjunto de evaluación (39 ventanas, ciudades no vistas).

| Sistema | WER (wer-nofillers) | DS-WER | Licencia | Disponibilidad |
|---|---|---|---|---|
| **Este adaptador** | 0,1542 | 0,4880 | Apache 2.0 | Abierto (HuggingFace) |
| Scribe v2 | no publicado | 0,3720 | Comercial | API |
| Soniox | no publicado | 0,3280 | Comercial | API |
| base `whisper-large-v3` | no publicado | 0,5400 | MIT (modelo) | Abierto |
| Gladia | no publicado | 0,5880 | Comercial | API |

El adaptador es estadísticamente indistinguible de Scribe v2 y Soniox en WER general, pero claramente inferior en términos de dominio. Frente al base whisper, mejora tanto en WER general como en DS-WER, aunque la comparación con el base se realizó con un stack diferente (HuggingFace serverless vs faster-whisper), por lo que incluye diferencias de motor.

## Limitaciones y advertencias

- El adaptador publicado el 2026-07-23 contiene un bug de prefijo de etiquetas y no debe utilizarse; esta versión (2026-08-01) es la correcta.
- Las métricas publicadas miden el acuerdo con las transcripciones de OpenCouncil, no la fidelidad al audio. Un sistema que transcriba mejor que la propia pipeline de OpenCouncil sería penalizado en esta métrica.
- No se ha medido el rendimiento en audio de formato largo, streaming ni con VAD integrada de faster-whisper.
- El corpus de entrenamiento no está publicado, lo que impide la reproducibilidad completa.
- El DS-WER es alto (0,4880) en los términos que más importan en un acta municipal (apellidos y topónimos), con un perfil de error dominado por sustituciones.
- Los resultados dependen críticamente de la configuración de decodificación; si se decodifica con parámetros distintos a los descritos (CTranslate2 int8, beam_size 5, `condition_on_previous_text=False`), los números no son aplicables.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `whisper-large-v3` tiene su propia licencia (MIT), que también es permisiva.

## Enlaces

- HuggingFace: https://huggingface.co/opencouncil/whisper-large-v3-el-council-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- No se proporcionan otros enlaces (papers, blogs o repositorios) en la informacion disponible.
