# hamzagamil/mathani-asr

## Resumen

Mathani ASR es un espejo de los ficheros de reconocimiento de voz que utiliza la aplicación web Mathani (مثاني) en su modo de memorización del Corán. El autor, hamzagamil, publica en HuggingFace una copia byte a byte de los binarios distribuidos originalmente en las releases de GitHub del proyecto, con el objetivo de que la aplicación alojada en `get.mthani.app` pueda descargarlos directamente desde el navegador, ya que este no puede leer ficheros de releases de GitHub. No se trata, por tanto, de un modelo entrenado desde cero, sino de un artefacto de despliegue derivado de NVIDIA FastConformer-Hybrid PCD Large en árabe.

El modelo subyacente es una adaptación del checkpoint `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0`, pasado por el proyecto Khatma (`adnanfet/khatma-model`) y por la exportación a ONNX de Tilawa (`yazinsai/tilawa`). El resultado se distribuye como un único fichero ONNX cuantizado a int8 y comprimido con gzip, acompañado de un vocabulario de tokens y del detector de actividad de voz Silero VAD. Según la propia model card, el modelo no fue reentrenado: los cambios respecto al original son de adaptación y empaquetado.

Su relevancia es acotada pero concreta: ofrece un pipeline ASR completo en árabe, ejecutable en navegador mediante sherpa-onnx, orientado a la recitación coránica y a la verificación de memorización. Es un caso de estudio útil de cómo se distribuye un modelo de voz cuantizado para inferencia en cliente, aunque sus cifras de uso en HuggingFace son nulas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con atención por chunks), cabecera híbrida CTC + RNNT en el modelo base; el artefacto distribuido es la variante CTC exportada a ONNX |
| Parametros totales | no disponible (el modelo base NVIDIA FastConformer-Hybrid PCD Large se publica como "large"; no se indica el recuento exacto en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx.gz`) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX comprimido con gzip (`model.int8.onnx.gz`), más `tokens.txt` y `silero_vad.onnx` |
| Tamano del repositorio | 0,1 GB |
| Version incluida | `asr-khatma-v1` |
| Modelo base | nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 |
| Runtime previsto | sherpa-onnx |

## Arquitectura y entrenamiento

El modelo base es un FastConformer de NVIDIA con cabecera híbrida CTC y RNNT, entrenado para reconocimiento de voz en árabe y publicado bajo licencia CC BY 4.0. La adaptación pasa por el proyecto Khatma, orientado a la recitación coránica, y por la exportación a ONNX de Tilawa (licencia MIT). El artefacto final que se distribuye en este repositorio es la variante CTC compilada a ONNX y cuantizada a int8, lo que reduce el tamaño y permite su ejecución en entornos con recursos limitados, incluido el navegador.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si hubo etapas de ajuste fino con RLHF o DPO. La model card es explícita al afirmar que el modelo no fue reentrenado en este repositorio: los cambios documentados en `NOTICE.txt` corresponden a la adaptación y al empaquetado, no a un nuevo ciclo de entrenamiento. Tampoco se detallan innovaciones técnicas adicionales más allá de la propia arquitectura FastConformer y del uso de Silero VAD como etapa previa de detección de actividad de voz.

## Capacidades

- Reconocimiento de voz en árabe sobre audio, con salida de transcripción textual.
- Detección de actividad de voz integrada mediante Silero VAD, que permite segmentar el audio antes de la transcripción.
- Ejecución en navegador a través de sherpa-onnx, sin necesidad de backend de inferencia dedicado.
- Orientación específica a recitación coránica: el pipeline está pensado para el modo de memorización de Mathani.
- Distribución autocontenida: un único fichero ONNX int8 comprimido, vocabulario y VAD.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de pensamiento.
- No se documenta soporte multilingüe más allá del árabe.

## Casos de uso

- Verificación de memorización coránica en aplicación web: el modelo transcribe la recitación del usuario y permite compararla con el texto esperado, ejecutándose en el propio navegador gracias al ONNX int8 y a sherpa-onnx.
- Aplicaciones educativas de recitación: integración del pipeline ASR y VAD para detectar segmentos de voz y transcribirlos en tiempo cuasi real en un entorno cliente.
- Distribución de modelos de voz en navegador: este repositorio sirve como ejemplo de empaquetado (ONNX int8 + gzip + vocabulario + VAD) para proyectos que necesiten evitar un backend de inferencia.
- Transcripción offline de audio en árabe: al no requerir servicio remoto, encaja en escenarios con requisitos de privacidad o conectividad intermitente.
- Prototipado de asistentes de voz en árabe: punto de partida para pipelines de ASR en aplicaciones web o de escritorio con sherpa-onnx.
- Evaluación de modelos ASR cuantizados: útil para comparar el comportamiento de un FastConformer int8 frente al checkpoint original en fp32 en tareas de voz en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB y el modelo se distribuye cuantizado a int8, por lo que la huella de memoria es reducida en comparación con el checkpoint original.
- GPU recomendadas: no se especifican; el destino principal es la ejecución en navegador mediante sherpa-onnx, sin GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto int8, aunque no se aportan cifras oficiales.
- Opciones de despliegue: sherpa-onnx (runtime previsto), con posibilidad de usar el fichero ONNX en otros runtimes compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| hamzagamil/mathani-asr | FastConformer CTC, int8 ONNX | Árabe | ONNX + gzip | CC BY 4.0 | no disponible |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | FastConformer híbrido CTC + RNNT | Árabe | NeMo | CC BY 4.0 | no disponible |
| adnanfet/khatma-model | Derivado de FastConformer para recitación coránica | Árabe | no disponible | no disponible | no disponible |

La comparación se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el reconocimiento de voz comete errores y de que el modelo no verifica tajweed ni harakat.
- No es un modelo reentrenado: se trata de un espejo de binarios de un proyecto de terceros, con los cambios documentados en `NOTICE.txt`.
- Solo cubre árabe; no se documenta soporte para otras lenguas ni para variedades dialectales específicas.
- No se han publicado evaluaciones cuantitativas (WER, CER) en la información disponible, por lo que el rendimiento real en producción es desconocido.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero obliga a conservar la atribución a NVIDIA, Khatma, Tilawa y Silero VAD según lo indicado en `NOTICE.txt`.
- El modelo se distribuye "as is", sin garantías de ningún tipo.
- Al estar pensado para ejecución en navegador, las limitaciones de memoria y cómputo del entorno cliente pueden afectar a la latencia en dispositivos modestos.
- Riesgo de alucinación en la transcripción: como todo sistema ASR, puede producir texto plausible pero incorrecto, especialmente en audio con ruido o recitación rápida.

## Enlaces

- HuggingFace: https://huggingface.co/hamzagamil/mathani-asr
- Modelo base NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Khatma: https://huggingface.co/adnanfet/khatma-model
- Tilawa (exportación ONNX): https://github.com/yazinsai/tilawa
- Silero VAD: https://github.com/snakers4/silero-vad
- Aplicación Mathani: https://get.mthani.app
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
