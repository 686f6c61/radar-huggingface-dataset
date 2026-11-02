# illicitish/gentsampler-models

## Resumen

`illicitish/gentsampler-models` no es un modelo de lenguaje, sino un repositorio espejo que aloja un único artefacto ONNX: `basic_pitch.onnx`, que corresponde al modelo Basic Pitch v0.4.0 de Spotify (fichero original `nmp.onnx`), publicado sin modificaciones. GentSampler lo descarga en el primer uso de su funcionalidad de transcripción de audio a MIDI. El propósito del repositorio es, por tanto, servir de punto de descarga estable para una herramienta de terceros, no distribuir pesos de un LLM.

Basic Pitch es un modelo de transcripción automática de música (AMT, *automatic music transcription*) que convierte señal de audio en eventos MIDI (nota, inicio, fin y *pitch bend*). Se distribuye bajo licencia Apache 2.0 y el artefacto pesa 230.444 bytes (unos 225 KB), lo que lo convierte en un modelo extremadamente ligero pensado para ejecutarse en CPU o en dispositivos con recursos limitados.

La relevancia de esta ficha es acotada: el repositorio no contiene información sobre arquitectura, datos de entrenamiento, benchmarks ni idiomas más allá de lo que declara la model card. Cualquier evaluación técnica debe remitirse al proyecto original de Spotify, ya que este espejo no añade documentación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de transcripción de audio a MIDI; arquitectura no documentada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, presumiblemente en precisión original) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`basic_pitch.onnx`, 230.444 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe únicamente que el artefacto es Spotify Basic Pitch v0.4.0, cuyo fichero original se denomina `nmp.onnx`, y que se publica sin modificaciones respecto al repositorio de origen (`spotify/basic-pitch`, etiqueta `v0.4.0`). No se detallan en la información proporcionada el número de tokens de audio utilizados, la composición del dataset de entrenamiento ni si hubo etapas de ajuste fino o RLHF.

El dato técnico verificable es el hash SHA-256 (`2c3c1d144bfa61ad236e92e169c13535c880469a12a047d4e73451f2c059a0ec`) y el tamaño exacto del binario, lo que permite comprobar la integridad del artefacto descargado. Para conocer la arquitectura (red convolucional sobre espectrogramas, según la documentación pública del proyecto original) y el proceso de entrenamiento, es necesario consultar el repositorio de Spotify, no este espejo.

## Capacidades

- Transcripción de audio a MIDI: convierte señal de audio en eventos de nota con inicio, duración y *pitch bend*.
- Ejecución ligera: el artefacto de 225 KB puede ejecutarse mediante runtime ONNX en CPU.
- Integración en aplicaciones de escritorio: pensado para ser descargado bajo demanda por GentSampler en el primer uso.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo *thinking*, visión ni audio de entrada en el sentido de un modelo multimodal; su única entrada es audio musical.

## Casos de uso

- Transcripción de interpretaciones musicales a MIDI: el modelo recibe una grabación monofónica o polifónica y devuelve eventos de nota utilizables en un DAW o editor de partituras. Es adecuado por su tamaño reducido y su naturaleza específica para AMT.
- Digitalización de borradores musicales: un músico graba una idea con un instrumento y la convierte en MIDI editable sin depender de servicios en la nube, ya que el modelo corre localmente vía ONNX.
- Herramientas de práctica musical: integración en aplicaciones que muestran las notas detectadas en tiempo real o casi real para comparar la ejecución del usuario con una partitura de referencia.
- Análisis musicológico básico: extracción de alturas y duraciones de grabaciones para estudios de interpretación, aprovechando que el modelo está empaquetado como ONNX y es fácil de insertar en pipelines de Python.
- Preprocesado para modelos generativos de música: convertir audio a MIDI como paso previo a la generación o edición simbólica en herramientas de composición asistida.
- Distribución offline en aplicaciones de escritorio: GentSampler lo descarga una sola vez y lo reutiliza, lo que evita llamadas a APIs externas y facilita el funcionamiento sin conexión.
- Verificación de integridad en pipelines de CI: el hash SHA-256 publicado permite comprobar que el binario descargado coincide con el original de Spotify antes de ejecutarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un binario ONNX de 225 KB, es plausible su ejecución en CPU sin GPU dedicada, aunque la model card no lo confirma.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) o cualquier motor compatible con el formato; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| illicitish/gentsampler-models (Basic Pitch v0.4.0) | no disponible (binario ONNX de 225 KB) | no aplica | Audio a MIDI | Apache 2.0 | HuggingFace (espejo) |
| Basic Pitch original (spotify/basic-pitch v0.4.0) | no disponible | no aplica | Audio a MIDI | Apache 2.0 | GitHub de Spotify |
| Alternativas de AMT | no disponible | no aplica | Audio a MIDI | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de LLM (contexto, parámetros, benchmarks de texto).
- La model card no documenta sesgos, tasas de alucinación ni limitaciones de idioma; al ser un modelo de audio, el concepto de alucinación no aplica directamente, pero puede producir notas espurias o falsos negativos en grabaciones ruidosas.
- El espejo no garantiza mantenimiento ni actualizaciones más allá de la versión v0.4.0 de Basic Pitch.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y licencia; el titular original es Spotify AB (2022).
- Cualquier uso en producción debería verificar el hash SHA-256 publicado antes de ejecutar el binario.
- No hay información sobre el rendimiento en distintos tipos de música, instrumentos o condiciones acústicas.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/illicitish/gentsampler-models
- Proyecto original de Spotify: https://github.com/spotify/basic-pitch/tree/v0.4.0
