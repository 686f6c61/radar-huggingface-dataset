# aminechr54/glideprompter-voice-en

## Resumen

GlidePrompter voice pack (English) es un paquete de reconocimiento de voz en streaming publicado por el desarrollador independiente aminechr54 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: empaqueta el modelo NVIDIA `stt_en_fastconformer_hybrid_large_streaming_multi` (FastConformer híbrido CTC/RNNT en variante streaming) convertido a ONNX y cuantizado a int8, junto con el runtime sherpa-onnx 2.0.2 para Windows x64, ONNX Runtime y el detector de actividad de voz Silero VAD.

El paquete está diseñado para un único caso de uso muy concreto: el modo "Follow" de la aplicación GlidePrompter, un teleprompter que desplaza el texto en función de la voz del orador. El reconocimiento se ejecuta íntegramente en local, sin conexión a red, y el modelo está configurado con una ventana de look-ahead de 80 ms (`att_context_size [70,1]`) para minimizar la latencia de transcripción.

Es relevante para desarrolladores que necesiten integrar ASR en streaming de baja latencia en aplicaciones de escritorio Windows sin depender de servicios en la nube. El repositorio ocupa 0,2 GB y solo soporta inglés. La licencia del paquete es "other" y remite a las licencias de los componentes individuales (CC-BY-4.0 para el modelo NVIDIA, Apache-2.0 para sherpa-onnx, MIT para ONNX Runtime y Silero VAD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (CTC + RNNT), variante streaming; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de audio en streaming con look-ahead de 80 ms (`att_context_size [70,1]`) |
| Tipos de cuantizacion | int8 (archivo `model/model.int8.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (paquete); modelo base NVIDIA CC-BY-4.0; sherpa-onnx Apache-2.0; ONNX Runtime MIT; Silero VAD MIT |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo subyacente es `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi`, un FastConformer híbrido que combina una cabeza CTC y una cabeza RNNT sobre un encoder Conformer optimizado para audio. La variante "streaming multi" admite distintos tamaños de contexto de atención; en este paquete se ha fijado `att_context_size [70,1]`, lo que corresponde a 80 ms de look-ahead, y se usa la rama CTC para la decodificación en streaming.

El autor del paquete no ha entrenado ni ajustado el modelo: la model card declara explícitamente que los cambios respecto al original de NVIDIA son únicamente conversión de formato (export a ONNX mediante el recetario de sherpa-onnx, `export-multi.py`) y cuantización a int8. No se aportan datos sobre el corpus de entrenamiento original, número de tokens de audio, ni si hubo ajuste con RLHF o DPO; esos detalles corresponden a la model card de NVIDIA, no incluida en la información disponible.

La innovación técnica del paquete es de ingeniería de despliegue: integración de sherpa-onnx como addon de Node para Windows x64, fijación del repositorio a un commit exacto y verificación de SHA-256 de cada archivo antes de su uso, lo que aporta reproducibilidad e integridad en la distribución del artefacto.

## Capacidades

- Reconocimiento de voz en streaming en inglés con baja latencia (80 ms de look-ahead).
- Decodificación CTC sobre ONNX Runtime, adecuada para transcripción incremental.
- Detección de actividad de voz (Silero VAD) para segmentar el audio antes de la transcripción.
- Ejecución completamente local y offline, sin llamadas a servicios externos.
- Integración como addon Node.js en Windows x64 mediante sherpa-onnx 2.0.2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo ASR.
- No dispone de capacidades multimodales más allá del audio de entrada.
- Sin soporte multilingüe: únicamente inglés.

## Casos de uso

- Teleprompter con seguimiento de voz: es el caso para el que se publicó el paquete; la app GlidePrompter usa la transcripción en streaming para desplazar el guion al ritmo del orador, y los 80 ms de look-ahead evitan retardo perceptible.
- Subtitulado en directo de presentaciones o clases en inglés: la decodificación CTC incremental permite mostrar texto casi en tiempo real en una aplicación de escritorio Windows.
- Dictado local en herramientas de escritorio: integración vía sherpa-onnx en una app Electron o Node para transcribir notas sin enviar audio a la nube.
- Asistentes de voz para entornos sin conectividad: al ejecutarse offline, es apto para quioscos, aulas o equipos aislados donde no se permite tráfico de red.
- Control por voz de aplicaciones de escritorio: la transcripción en streaming alimenta un parser de comandos local, con la ventaja de que el audio no sale del equipo.
- Prototipado de pipelines ASR en Node.js: sirve como referencia de exportación ONNX int8 de un FastConformer streaming y de integración con Silero VAD para experimentar antes de pasar a producción.
- Verificación de integridad en distribución de modelos: el patrón de pin a commit y comprobación SHA-256 es reutilizable en pipelines que distribuyen artefactos ONNX a clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,2 GB y el modelo int8 es de tamaño reducido, por lo que la inferencia cabe holgadamente en GPU de consumo y también en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ASR int8 de pequeño tamaño, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) es suficiente. No se detallan requisitos de A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna; también es viable en CPU.
- Opciones de despliegue: sherpa-onnx 2.0.2 (addon Node para Windows x64) sobre ONNX Runtime; el formato ONNX int8 permite otros runtimes compatibles, aunque no se documentan en la información disponible.
- Latencia y throughput: no se publican cifras; el diseño fija un look-ahead de 80 ms, lo que acota la latencia algorítmica del streaming, pero no se aportan medidas de tiempo real ni de RTF.
- Plataforma: el runtime incluido es específico para Windows x64; no se incluyen binarios para Linux ni macOS.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlidePrompter voice pack (EN) | FastConformer híbrido streaming, ONNX int8 | en | look-ahead 80 ms | other (componentes CC-BY-4.0, Apache-2.0, MIT) | Hugging Face, Windows x64 |
| nvidia/stt_en_fastconformer_hybrid_large_streaming_multi | FastConformer híbrido streaming (original) | en | configurable (`att_context_size`) | CC-BY-4.0 | Hugging Face (NVIDIA) |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder | multilingüe | no streaming nativo | MIT (según variante) | Hugging Face, múltiples runtimes |
| Vosk / Kaldi | ASR clásico (HMM-DNN) | varios | streaming | Apache-2.0 (según modelo) | Repos públicos |

La comparación con Whisper y Vosk es orientativa: la información proporcionada solo detalla el paquete de GlidePrompter y su modelo base NVIDIA, por lo que los datos de las alternativas no provienen de la fuente y deben verificarse antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Solo reconoce inglés; no hay soporte multilingüe.
- Es un artefacto de despliegue, no un modelo original: cualquier mejora o corrección debe hacerse sobre el modelo base de NVIDIA y reexportarse.
- El runtime incluido es exclusivamente Windows x64; no hay binarios para otras plataformas.
- La licencia del paquete es "other" y obliga a respetar las licencias de cada componente: CC-BY-4.0 del modelo NVIDIA exige atribución, Apache-2.0 de sherpa-onnx y MIT de ONNX Runtime y Silero VAD. Verificar compatibilidad antes de uso comercial.
- Riesgo de errores de transcripción inherente al ASR, especialmente con acentos no nativos, ruido de fondo o vocabulario técnico; no se documentan tasas de error (WER).
- El look-ahead fijo de 80 ms limita la precisión frente a configuraciones con más contexto; es un compromiso deliberado por latencia.
- No se han publicado benchmarks ni evaluaciones independientes en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- La fecha de creación indicada (2026-11-21) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de depender de él.

## Enlaces

- Hugging Face: https://huggingface.co/aminechr54/glideprompter-voice-en
- Repositorio GlidePrompter: https://github.com/AmineChr54/glideprompter
- Script de exportación: https://github.com/AmineChr54/glideprompter/blob/main/tools/follow/export-multi.py
- Modelo base NVIDIA: https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- Silero VAD: https://github.com/snakers4/silero-vad
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
