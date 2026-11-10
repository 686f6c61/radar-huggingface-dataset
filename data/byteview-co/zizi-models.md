# byteview-co/zizi-models

## Resumen

zizi-models es un repositorio de modelos de reconocimiento automatico del habla (ASR) redistribuidos por byteview-co para su uso en Zizi, una aplicacion movil de grabacion y transcripcion de voz que funciona en el dispositivo (Android e iOS). No se trata de un modelo entrenado por el autor, sino de un catalogo de pesos ya convertidos y cuantizados en formato ggml para el motor de inferencia whisper.cpp, que la aplicacion descarga directamente desde este repositorio de Hugging Face.

El repositorio contiene cuatro ficheros: dos variantes de Whisper de OpenAI (small multilingual y large-v3-turbo multilingual) y dos variantes de PhoWhisper de VinAI Research (small y medium), especializadas en vietnamita. Todas las variantes estan cuantizadas (q5_0 o q5_1) para reducir el peso y permitir la ejecucion en dispositivos moviles sin conexion a servicios en la nube.

Su relevancia es practica: sirve como punto de distribucion de pesos listos para produccion en un contexto de inferencia local, con checksums SHA-256 publicados y una politica de licencias heredadas de los modelos originales. No aporta innovaciones de arquitectura ni datos de entrenamiento propios; su valor esta en la conversion, cuantizacion y empaquetado para whisper.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper / PhoWhisper) |
| Parametros totales | no disponible (depende de la variante: small, medium, large-v3-turbo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | q5_0 y q5_1 (ggml) |
| Idiomas soportados | vietnamita (PhoWhisper small/medium); multilingue (Whisper small/large-v3-turbo) |
| Licencia | other (MIT para Whisper; BSD-3-Clause para PhoWhisper) |
| Formato de pesos | ggml (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

Los modelos subyacentes son transformadores encoder-decoder de la familia Whisper. Whisper small y Whisper large-v3-turbo son los modelos originales de OpenAI, distribuidos con licencia MIT; las conversiones ggml son copias sin modificar de los ficheros publicados en ggerganov/whisper.cpp. PhoWhisper small y medium son modelos de VinAI Research bajo licencia BSD-3-Clause, convertidos a ggml y cuantizados con el script `tools/convert_phowhisper.sh` del codigo fuente de la aplicacion Zizi.

No se describe en la informacion disponible ningun entrenamiento adicional, ajuste fino ni proceso de RLHF/DPO por parte del autor del repositorio. La unica transformacion aplicada es la conversion de formato y la cuantizacion a 5 bits (q5_1 para small, q5_0 para medium). Una particularidad tecnica relevante es que PhoWhisper genera texto en minusculas sin puntuacion y no dispone de tokens de marca temporal; Zizi lo decodifica por segmento de actividad de voz con la opcion `no_timestamps`.

## Capacidades

- Transcripcion de voz a texto en vietnamita con PhoWhisper small y medium.
- Transcripcion multilingue con Whisper small y Whisper large-v3-turbo.
- Ejecucion local en dispositivos moviles mediante whisper.cpp (inferencia on-device, sin servidor).
- Cuantizacion a 5 bits para reducir el consumo de memoria y almacenamiento.
- Integracion con la app Zizi mediante descarga directa de pesos desde el repositorio.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Grabacion y transcripcion offline en Android e iOS: la app Zizi descarga los ficheros ggml y ejecuta whisper.cpp localmente, de modo que las grabaciones no salen del dispositivo.
- Transcripcion de reuniones y notas de voz en vietnamita: PhoWhisper small (q5_1) ofrece un equilibrio entre calidad y tamano para dispositivos con recursos limitados, mientras que PhoWhisper medium (q5_0) se reserva para equipos con mas memoria.
- Dictado multilingue en movilidad: Whisper small multilingual permite transcribir audio en varios idiomas sin conexion, util en viajes o entornos sin red.
- Transcripcion de alta calidad en dispositivos de gama alta: Whisper large-v3-turbo q5_0 ofrece la mayor calidad del catalogo para equipos con suficiente memoria y CPU/GPU.
- Procesamiento por segmentos de actividad de voz: la decodificacion con `no_timestamps` de PhoWhisper encaja en pipelines que segmentan el audio antes de transcribir, reduciendo coste computacional.
- Distribucion verificable de pesos: los checksums SHA-256 publicados permiten a la app y a terceros validar la integridad de cada fichero descargado.
- Prototipado de ASR local en escritorio: los ficheros ggml pueden cargarse en whisper.cpp fuera de la app para pruebas y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita; el tamano del repositorio es de 1.5 GB para los cuatro ficheros cuantizados, y cada variante ocupa una fraccion de ese total segun su tamano (small, medium, large-v3-turbo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ggml y whisper.cpp estan pensados para ejecucion en CPU y en dispositivos moviles.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); la app Zizi como cliente de referencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper small (en este repo) | no disponible | 30 s por segmento | multilingue | MIT | ggml q5_1 |
| Whisper large-v3-turbo (en este repo) | no disponible | 30 s por segmento | multilingue | MIT | ggml q5_0 |
| PhoWhisper small (en este repo) | no disponible | 30 s por segmento | vietnamita | BSD-3-Clause | ggml q5_1 |
| PhoWhisper medium (en este repo) | no disponible | 30 s por segmento | vietnamita | BSD-3-Clause | ggml q5_0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena modelos propios; cualquier limitacion de Whisper o PhoWhisper se hereda sin cambios.
- PhoWhisper genera texto en minusculas, sin puntuacion y sin tokens de marca temporal; requiere decodificacion por segmentos con `no_timestamps`.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio ruidoso o con acentos no representados en el entrenamiento original.
- La licencia del repositorio figura como "other"; el uso comercial queda sujeto a las licencias de los modelos originales (MIT para Whisper, BSD-3-Clause para PhoWhisper), que deben revisarse antes de redistribuir.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.
- El rendimiento en dispositivos moviles depende del hardware y de la variante elegida; no se publican latencias ni consumo de memoria por dispositivo.
- Los checksums SHA-256 deben verificarse tras la descarga para garantizar la integridad de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/byteview-co/zizi-models
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Pesos ggml de whisper.cpp en Hugging Face: https://huggingface.co/ggerganov/whisper.cpp
- Whisper (OpenAI): https://github.com/openai/whisper
- PhoWhisper (VinAI Research): https://github.com/VinAIResearch/PhoWhisper
- Paper de PhoWhisper (ICLR 2024 Tiny Papers): no disponible como enlace directo en la informacion proporcionada
