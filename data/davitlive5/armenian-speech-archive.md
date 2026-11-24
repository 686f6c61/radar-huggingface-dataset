# davitlive5/armenian-speech-archive

## Resumen

`davitlive5/armenian-speech-archive` es un repositorio de archivo del proyecto de voz en armenio del autor davitlive5. No contiene un modelo único, sino un conjunto de artefactos antiguos y de respaldo (modelos acústicos de reconocimiento de voz, modelos de lenguaje de rescoring y una voz de síntesis) que se conservan para referencia y para posibles rollbacks frente a las versiones actuales del proyecto.

El repositorio incluye un modelo acústico STT en formato NeMo (`lapillus-v3-call.nemo`, sustituido por Lapillus-v4), un modelo de lenguaje KenLM de 8-gramas, un modelo de lenguaje neuronal de 86M parámetros y una voz Piper VITS femenina en ONNX pensada para CPU. Los modelos actuales del proyecto son Lapillus-v4 (STT) y sonabo-v2 (TTS).

Su relevancia es acotada: se trata de material de archivo con descargas y likes nulos en el momento de la consulta, orientado a quien necesite reproducir resultados antiguos o mantener una ruta de rollback. La licencia es "other" y la model card advierte explícitamente de que cada elemento tiene su propia nota de licencia y de que la voz Piper no es apta para uso comercial tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: modelo acustico NeMo (STT), KenLM de 8-gramas, LM neuronal de 86M parametros y Piper VITS (TTS) |
| Parametros totales | 86M en el LM neuronal (`hy_nlm86m_run1.pt`); no disponible para el resto de componentes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Armenio (`hy`) |
| Licencia | other (cada elemento con su propia nota de licencia) |
| Formato de pesos | `.nemo` (NeMo), `.pt` (PyTorch), `.onnx` + `.json` (ONNX) |

## Arquitectura y entrenamiento

El repositorio agrupa componentes de distinta naturaleza. Por un lado, `stt/lapillus-v3-call.nemo` es un modelo acústico de reconocimiento de voz en formato NeMo que, segun la model card, se sirvio antes de Lapillus-v4 y obtuvo un WER de 3,76 en ArmBench CV y 4,94 en FLEURS. Se acompaña de un modelo de lenguaje KenLM de 8-gramas (`hy_tok8r3_lm.nemo`) y de un modelo de lenguaje neuronal de 86M parametros (`hy_nlm86m_run1.pt`), ambos usados con la version v3; el LM neuronal requiere cargarse con `nlm.py` procedente de Lapillus-v4.

Por otro lado, `tts-piper/nune.onnx` (con su `.json` asociado) es una voz femenina Piper VITS para CPU, con WER 7,5, UTMOS 3,4 y un RTF de 0,04 en CPU. La model card indica que se inicializo (warm-start) a partir de una voz Piper de solo investigacion, por lo que no es apta para uso comercial tal cual. No se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de voz (STT) en armenio mediante el modelo acustico NeMo v3.
- Rescoring de hipotesis STT con KenLM de 8-gramas y con un LM neuronal de 86M parametros.
- Sintesis de voz (TTS) en armenio con la voz Piper VITS `nune`, optimizada para CPU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el repositorio esta orientado exclusivamente al armenio (`hy`).
- Capacidades especiales (vision, audio de entrada, modo thinking): no disponibles salvo el propio audio de entrada del STT.

## Casos de uso

- Reproduccion de resultados historicos: cargar `lapillus-v3-call.nemo` junto con `hy_tok8r3_lm.nemo` y `hy_nlm86m_run1.pt` para replicar exactamente las metricas publicadas de la version v3 (WER 3,76 en ArmBench CV y 4,94 en FLEURS).
- Rollback en produccion: si una actualizacion a Lapillus-v4 degrada el WER en un dominio concreto, restaurar el modelo acustico v3 y su LM como ruta de respaldo.
- Evaluacion comparativa de decoders: usar el mismo LM de 8-gramas y el LM neuronal de 86M con distintos modelos acusticos para aislar el efecto del rescoring en el WER.
- Sintesis de voz en CPU sin GPU: desplegar `nune.onnx` con Piper en entornos con recursos limitados, aprovechando su RTF de 0,04 en CPU para generacion casi en tiempo real.
- Investigacion en TTS de bajo coste: emplear la voz Piper como linea base (UTMOS 3,4, WER 7,5) frente a sonabo-v2 en estudios comparativos de calidad.
- Pruebas de integracion en pipelines NeMo: validar scripts de carga de modelos `.nemo` y utilidades como `nlm.py` antes de migrar a las versiones actuales.

## Benchmarks y rendimiento

| Componente | Metrica | Valor |
|---|---|---|
| `stt/lapillus-v3-call.nemo` | WER ArmBench CV | 3,76 |
| `stt/lapillus-v3-call.nemo` | WER FLEURS | 4,94 |
| `tts-piper/nune.onnx` | WER | 7,5 |
| `tts-piper/nune.onnx` | UTMOS | 3,4 |
| `tts-piper/nune.onnx` | RTF en CPU | 0,04 |

No se han publicado en la informacion disponible resultados de benchmarks para el KenLM de 8-gramas ni para el LM neuronal de 86M parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 4,4 GB en total.
- GPU recomendadas: no disponibles; la voz Piper esta disenada para CPU y el STT NeMo puede ejecutarse en GPU o CPU segun la configuracion de NeMo.
- Cabe en GPU de consumo: previsiblemente si para los componentes individuales, dado el tamano del LM neuronal (86M parametros) y de la voz ONNX; no confirmado para el modelo acustico completo.
- Opciones de despliegue: NeMo (modelos `.nemo`), PyTorch (`.pt`), ONNX Runtime y Piper (`.onnx`).
- Latencia y throughput: RTF de 0,04 en CPU para la voz Piper; no disponible para el resto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `armenian-speech-archive` (este repo) | 86M (LM neuronal); resto no disponible | No disponible | WER 3,76 / 4,94 (STT v3); UTMOS 3,4 (TTS) | other | Hugging Face, 0 descargas |
| Lapillus-v4 (STT) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| sonabo-v2 (TTS) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks de Lapillus-v4 ni de sonabo-v2 en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Repositorio de archivo: los componentes estan sustituidos por versiones mas recientes (Lapillus-v4, sonabo-v2) y no reciben mantenimiento.
- Licencia "other": cada elemento tiene su propia nota de licencia; es obligatorio revisarla antes de cualquier uso publico.
- La voz Piper `nune` se inicializo desde una voz de solo investigacion y no es apta para uso comercial tal cual.
- Cobertura limitada al armenio (`hy`); no hay soporte multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la validacion externa del material.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/davitlive5/armenian-speech-archive
- Modelo actual STT (Lapillus-v4): https://huggingface.co/davitlive5/Lapillus-v4
- Modelo actual TTS (sonabo-v2): https://huggingface.co/davitlive5/sonabo-v2
