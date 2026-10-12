# houseti/whisper-ggml

## Resumen

houseti/whisper-ggml no es un modelo nuevo, sino un espejo (mirror) del fichero `ggml-small-q5_1.bin` procedente del repositorio oficial de whisper.cpp (commit `5359861c739e955e79d9a303bcbc70fb988958b1`). Se trata, por tanto, del modelo Whisper small de OpenAI convertido al formato GGML y cuantizado a 5 bits para su ejecución local mediante whisper.cpp. El autor lo publica para usarlo en la transcripción en dispositivo de la aplicación SuperWASP.

El modelo resuelve el problema de la transcripción y traducción de voz a texto sin depender de APIs en la nube: al estar en formato GGML y cuantizado, se puede ejecutar en CPU o en GPU de gama baja con un consumo de memoria reducido (el fichero pesa 190.085.487 bytes, unos 181 MiB). Es relevante porque representa el formato estándar de facto para inferencia de Whisper en el ecosistema de C/C++ (whisper.cpp), muy usado en asistentes domésticos, aplicaciones de escritorio y sistemas empotrados.

La relevancia técnica es doble: por un lado, es un artefacto reproducible (se documenta el SHA-256 del binario) y, por otro, la cuantización q5_1 ofrece un equilibrio entre tamaño y precisión adecuado para despliegues sin GPU dedicada. No se trata de un modelo con parámetros activos ni arquitecturas experimentales, sino de una conversión fiel del modelo small original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper small, convertido a GGML |
| Parametros totales | Aproximadamente 244 M (corresponde al tamano small de Whisper) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 segundos por inferencia; el decodificador trabaja con hasta 448 tokens de posicion (no disponible mas detalle en la model card) |
| Tipos de cuantizacion | q5_1 (5 bits) en formato GGML |
| Idiomas soportados | Multilingue (etiqueta `multilingual` en la model card) |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin`) |

## Arquitectura y entrenamiento

El artefacto es una conversion del Whisper small de OpenAI al formato GGML realizada con whisper.cpp. Whisper usa una arquitectura transformer de tipo encoder-decoder: el encoder procesa la representacion mel-espectral de audio en ventanas de 30 segundos y el decoder genera texto autorregresivamente. El proceso de conversion traduce los pesos originales de PyTorch a tensores GGML y aplica la cuantizacion q5_1, que reduce el tamano del fichero hasta los 190 MB aproximadamente conservando un nivel de precision adecuado para transcripcion.

No se aporta en la model card informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo etapas de RLHF o DPO especificas del artefacto. Toda la informacion de entrenamiento corresponde al modelo Whisper small original de OpenAI, que no se detalla en este repositorio. La innovacion tecnica aqui no esta en el modelo en si, sino en el formato de despliegue: la conversion a GGML permite inferencia eficiente en CPU y en hardware modesto, algo que el modelo original en PyTorch no facilita. La model card incluye el hash SHA-256 (`ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb`) para verificar la integridad del binario.

## Capacidades

- Transcripcion de voz a texto en multiples idiomas (etiqueta `multilingual`).
- Traduccion de voz a texto entre idiomas, heredada del modelo Whisper original.
- Procesamiento de audio en ventanas de 30 segundos por pasada de inferencia.
- Deteccion de actividad de voz y segmentacion basica por marcas de tiempo (caracteristica estandar de Whisper).
- Inferencia en dispositivo (on-device) sin conexion a red, gracias al formato GGML.
- No se documentan en la model card capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, dado que es un modelo de transcripcion y no un LLM conversacional.
- No se documentan capacidades de vision ni de audio mas alla de la transcripcion de voz.
- Modo thinking: no disponible.

## Casos de uso

- Transcripcion en dispositivo en la aplicacion SuperWASP: es el uso declarado por el autor; el modelo se ejecuta localmente para convertir voz en texto sin enviar audio a servidores externos.
- Subtitulado automatico de video: genera transcripciones con marcas de tiempo que se pueden exportar a formatos de subtitulos (SRT, VTT) usando la CLI de whisper.cpp.
- Asistentes de voz para domotica: integrable con Home Assistant mediante el componente Wyoming para reconocimiento de voz local, evitando dependencias de la nube.
- Actas y notas de reunion: transcripcion de grabaciones de audio o videollamadas en equipos sin GPU dedicada, aprovechando que el artefacto pesa menos de 200 MB.
- Dictado por voz en aplicaciones de escritorio: integracion mediante la libreria whisper.cpp en herramientas de productividad para escribir texto a partir de voz.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos con recursos limitados.
- Procesamiento por lotes en servidores de gama baja: al ser una cuantizacion pequena, permite ejecutar varias instancias concurrentes en CPU para transcribir archivOS de audio en cola.
- Busqueda en archivos de audio: indexar transcripciones de podcasts, entrevistas o grabaciones para habilitar busqueda por texto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de houseti/whisper-ggml unicamente documenta el tamano del fichero (190.085.487 bytes) y su hash SHA-256, sin cifras de WER, MMLU, HumanEval ni otras metricas. Se desconoce cualquier dato de throughput o latencia medido por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en GPU, dado que el fichero de pesos ocupa unos 181 MiB en q5_1; con buffers de activacion el uso suele quedar por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una NVIDIA RTX 3060, RTX 4090 o superior ofrece un margen amplio. Tambien funciona en GPUs integradas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: whisper.cpp (formato nativo), bindings de whisper.cpp desde Python, Node u otros lenguajes, servidores compatibles con GGML como la API de Whisper que expone modelos `.bin`, e integraciones tipo Home Assistant Wyoming. No es compatible con vLLM ni TGI, que no soportan el formato GGML.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| houseti/whisper-ggml (Whisper small q5_1) | Aproximadamente 244 M | Ventana de audio de 30 s | GGML (`.bin`) | MIT | HuggingFace (mirror) |
| ggerganov/whisper.cpp (modelos oficiales) | tiny (~39 M), base (~74 M), small (~244 M), medium (~769 M), large (~1550 M) | Ventana de audio de 30 s | GGML (`.bin`) | MIT | HuggingFace y GitHub |
| openai/whisper-small | Aproximadamente 244 M | Ventana de audio de 30 s | PyTorch (safetensors) | MIT | HuggingFace |
| openai/whisper-large-v3 | Aproximadamente 1550 M | Ventana de audio de 30 s | PyTorch (safetensors) | MIT | HuggingFace |

Los datos de parametros corresponden al modelo Whisper original; no se aportan cifras de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- Es un espejo: no introduce mejoras ni cambios respecto al `ggml-small-q5_1.bin` original de whisper.cpp, por lo que hereda todas las limitaciones de Whisper small.
- La cuantizacion q5_1 puede reducir ligeramente la precision de transcripcion frente a los pesos en precision completa.
- Whisper small es menos preciso que medium o large, especialmente en audio con ruido, acentos marcados o dominios tecnicos.
- La ventana de procesamiento es de 30 segundos; audios mas largos se segmentan, lo que puede introducir errores en las fronteras.
- El modelo puede alucinar texto en fragmentos de silencio o ruido, un comportamiento documentado en la familia Whisper.
- Sesgos: al no documentarse en la model card, no hay informacion especifica sobre sesgos de genero, raza o idioma; se desconoce su comportamiento por idioma.
- Idiomas: la etiqueta es `multilingual`, pero no se detalla la lista de idiomas soportados ni su calidad relativa.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright; es una licencia permisiva sin restricciones de uso comercial.
- La model card no documenta datos de entrenamiento ni evaluacion, por lo que no es posible auditar el modelo a partir de este repositorio.
- Las fechas de creacion y actualizacion del repositorio aparecen en 2026, lo que puede indicar un artefacto reciente y con escasa comunidad (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/houseti/whisper-ggml
- Repositorio oficial de modelos whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- whisper.cpp en GitHub: https://github.com/ggml-org/whisper.cpp
- Modelo original Whisper de OpenAI: https://github.com/openai/whisper
- Script de descarga de modelos GGML de whisper.cpp: https://github.com/ggml-org/whisper.cpp/blob/master/models/download-ggml-model.cmd
- Otro mirror de modelos GGML de Whisper: https://huggingface.co/danielus/ggml-whisper-models
- Otro mirror de modelos GGML de Whisper: https://huggingface.co/chatgpt-openai/ggml-model-whisper
- Documentacion de la API de Whisper con soporte GGML: https://whisper.vedgupta.in/docs/models/
- Guia de Whisper local con Home Assistant: https://www.promptquorum.com/smart-home/local-whisper-home-assistant
