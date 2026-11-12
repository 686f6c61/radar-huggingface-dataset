# ChatPanel/silero-vad

## Resumen

ChatPanel/silero-vad es un espejo (mirror) del modelo de deteccion de actividad de voz (VAD) Silero, publicado en formato ONNX por la organizacion onnx-community. El repositorio lo mantiene ChatPanel con el unico objetivo de servir como origen unico de descarga para su pasarela (gateway), de modo que todos los modelos que ejecuta se obtengan desde un mismo lugar. No se ha reentrenado, convertido ni editado ningun archivo: los pesos son identicos byte a byte a los del repositorio upstream en el commit `e71cae966052b992a7eca6b17738916ce0eca4ec`.

Silero VAD es un detector de voz ligero que clasifica fragmentos de audio como voz o no voz. Su relevancia practica esta en ser un componente de preprocesado en pipelines de reconocimiento de voz, transcripcion y asistentes conversacionales: permite recortar silencios, segmentar hablantes por turnos y evitar enviar audio vacio a modelos mayores, reduciendo coste y latencia.

Este repositorio concreto no aporta ninguna mejora tecnica sobre el original; es una copia de conveniencia. Para documentacion detallada, parametros y evaluacion conviene remitirse al repositorio upstream, ya que la model card propia solo describe la procedencia y las sumas de verificacion del unico archivo incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VAD ligero; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de audio, no sobre texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `onnx/model.onnx`) |
| Idiomas soportados | no disponible (deteccion de voz, independiente del idioma en teoria) |
| Licencia | MIT (la del upstream, sin cambios) |
| Formato de pesos | ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

No disponible en la informacion proporcionada. La model card de este repositorio no describe la arquitectura interna, los datos de entrenamiento ni el proceso de optimizacion del modelo original; solo indica que es una copia sin modificaciones de onnx-community/silero-vad en el commit `e71cae966052b992a7eca6b17738916ce0eca4ec` y que conserva la licencia MIT del upstream.

El unico dato tecnico verificable es el archivo distribuido: `onnx/model.onnx`, con SHA-256 `a4a068cd6cf1ea8355b84327595838ca748ec29a25bc91fc82e6c299ccdc5808`. Cualquier detalle sobre capas, ventanas de analisis, tasa de muestreo esperada o umbrales de decision debe consultarse en la documentacion del repositorio original.

## Capacidades

- Deteccion de actividad de voz: clasifica audio en fragmentos de voz y no voz.
- Preprocesado de audio para pipelines de ASR y transcripcion.
- Segmentacion de turnos de habla en conversaciones.
- Filtrado de silencio para reducir coste de inferencia en modelos posteriores.
- Ejecucion via ONNX Runtime, lo que permite despliegue en CPU y entornos sin GPU.
- No se documentan en este repositorio capacidades de generacion de texto, codigo, vision, tool calling ni agentes.

## Casos de uso

- Preprocesado de ASR en produccion: usar el detector para recortar silencios antes de enviar audio a un modelo de reconocimiento de voz, reduciendo duracion procesada y coste por minuto.
- Transcripcion de reuniones: segmentar el audio en intervalos con voz para generar subtitulos con marcas temporales mas limpias y evitar alucinaciones sobre silencio.
- Asistentes conversacionales por voz: detectar cuando el usuario empieza y termina de hablar para gestionar el turno y activar el reconocimiento solo cuando hay habla.
- Moderacion de contenido de audio: descartar rapidamente grabaciones sin voz antes de aplicar modelos de clasificacion mas costosos.
- Telefonia y atencion al cliente: eliminar musica de espera y silencios en grabaciones de llamadas antes de su analisis o almacenamiento.
- Despliegue en el borde (edge): al ser un modelo ONNX ligero, puede ejecutarse en CPU o dispositivos con recursos limitados para activacion por voz sin enviar audio a la nube.
- Integracion en la pasarela ChatPanel: al estar alojado en el mismo espacio, simplifica la descarga y el aprovisionamiento de modelos por parte del gateway.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo VAD ligero en ONNX, es esperable que funcione en CPU, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible. No requiere GPU para su funcionamiento tipico.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el caracter ligero de los modelos VAD, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del archivo `onnx/model.onnx`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| ChatPanel/silero-vad | VAD (espejo) | ONNX | MIT | no aplica | Copia sin cambios de onnx-community/silero-vad |
| onnx-community/silero-vad | VAD (upstream) | ONNX | MIT | no aplica | Origen del que procede esta copia |
| Otros detectores VAD (p. ej. WebRTC VAD) | VAD | Libreria nativa | variable | no aplica | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre alternativas en la informacion disponible.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia de conveniencia. Cualquier actualizacion o correccion debe buscarse en el upstream onnx-community/silero-vad.
- No se documentan en este repositorio los sesgos, tasas de error ni condiciones de uso del modelo original.
- Riesgo de falsos positivos y negativos en entornos con ruido, musica o habla solapada: no cuantificado en la informacion disponible.
- La deteccion de voz puede degradarse con audio de baja calidad o con idiomas y acentos no representados en el entrenamiento original; no se aportan datos al respecto.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar el aviso de copyright y verificar la licencia del upstream.
- Al ser una copia fijada a un commit concreto, no recibira mejoras del upstream salvo que el mantenedor actualice el espejo.
- Verificar la integridad del archivo `onnx/model.onnx` mediante el SHA-256 indicado antes de desplegarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/silero-vad
- Upstream: https://huggingface.co/onnx-community/silero-vad
- Commit del upstream: `e71cae966052b992a7eca6b17738916ce0eca4ec`
- Model card upstream incluida en el repo: `UPSTREAM_README.md`
