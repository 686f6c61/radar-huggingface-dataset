# LlamaPal/Qwen3.5-0.8B-mmproj-F16-GGUF

## Resumen

`LlamaPal/Qwen3.5-0.8B-mmproj-F16-GGUF` no es un modelo completo, sino el componente de proyección multimodal (mmproj) en GGUF y precisión F16 que habilita la capacidad de visión del modelo Qwen3.5-0.8B dentro del ecosistema llama.cpp. El archivo es una copia sin modificar del `mmproj-F16.gguf` original publicado por Unsloth en su repositorio `unsloth/Qwen3.5-0.8B-GGUF`, y el autor (LlamaPal) lo redistribuye únicamente como espejo para que su aplicación Android lo descargue junto al modelo base.

El proyecto LlamaPal es una aplicación gratuita de IA offline para Android que ejecuta modelos de código abierto de forma local, sin conexión a internet ni cuentas de usuario. Este repositorio existe para que la app pueda obtener el proyector visual necesario para el pipeline `image-text-to-text` cuando el usuario activa la función de visión.

Es relevante para desarrolladores que despliegan modelos multimodales pequeños en dispositivos móviles: el proyector pesa 205 MB y se usa como fichero `--mmproj` en llama.cpp junto al modelo Qwen3.5-0.8B. El modelo base se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | proyector multimodal (mmproj) para Qwen3.5-0.8B; arquitectura del modelo base: no disponible |
| Parametros totales | 100.592.896 (dato del modelo base en safetensors); el mmproj es un componente separado |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 para el mmproj; cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mmproj-F16.gguf, 205 MB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el fichero `mmproj-F16.gguf` (205 MB, SHA-256 `56e4c6cfe73b0c82e3e82bc518d7591997e61d81f723fc41a586f4fa69ea2453`), que es el proyector que conecta las representaciones visuales con el modelo de lenguaje Qwen3.5-0.8B. No se proporciona información sobre la arquitectura interna del proyector ni sobre el codificador visual asociado.

El archivo es una copia byte a byte del publicado por Unsloth en el commit `6ab461498e20` de `unsloth/Qwen3.5-0.8B-GGUF`. No hay datos sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) ni sobre innovaciones técnicas en la información disponible.

## Capacidades

- Habilita entrada de imagen junto con texto (pipeline `image-text-to-text`) cuando se usa junto al modelo Qwen3.5-0.8B en llama.cpp.
- Integración con llama.cpp mediante el parámetro `--mmproj`.
- Orientado a ejecución on-device en Android a través de la app LlamaPal, con funcionamiento offline.
- Capacidades específicas de razonamiento, código, matemáticas o tool calling del modelo base: no disponibles en esta ficha.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking, audio, etc.): no disponibles.

## Casos de uso

- Descripción de imágenes en local desde Android: la app LlamaPal usa este mmproj junto al modelo base para que el usuario pueda pasar una foto y obtener una descripción textual sin enviar datos a la nube.
- Asistencia visual offline en entornos sin conectividad: al ejecutarse en el dispositivo, permite analizar imágenes en campo (por ejemplo, notas manuscritas o etiquetas) sin depender de red.
- Integración en pipelines llama.cpp de escritorio: pasar el fichero como `--mmproj` permite reproducir el comportamiento multimodal del modelo Qwen3.5-0.8B en servidores o estaciones locales.
- Prototipado de aplicaciones móviles multimodales: sirve como componente listo para usar en desarrollos que necesiten visión con modelos de menos de 1B de parámetros.
- Evaluación de privacidad en flujos con imágenes: al no requerir conexión, es adecuado para pruebas de concepto donde las imágenes no deben salir del dispositivo.
- Verificación de integridad en despliegues: el hash SHA-256 publicado permite comprobar que el fichero descargado coincide con el original de Unsloth antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El fichero mmproj ocupa 205 MB en disco; debe coexistir con los pesos del modelo base Qwen3.5-0.8B (tamaño no indicado en esta ficha).
- VRAM estimada para inferencia: no disponible (depende del modelo base y de su cuantización).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el proyecto está orientado a ejecución en Android on-device.
- Opciones de despliegue: llama.cpp (parámetro `--mmproj`) y la app LlamaPal para Android. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (proyectores multimodales GGUF para modelos de menos de 1B de parámetros).

## Limitaciones y advertencias

- Este repositorio no contiene el modelo de lenguaje, solo el proyector multimodal; sin los pesos de Qwen3.5-0.8B no es funcional.
- Es un espejo sin modificaciones: cualquier corrección o actualización debe buscarse en el repositorio original de Unsloth.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base en `Qwen/Qwen3.5-0.8B`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; su mantenimiento y soporte no están garantizados.
- Al ser un componente auxiliar, el rendimiento real depende del backend llama.cpp y del hardware del dispositivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Qwen3.5-0.8B-mmproj-F16-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Repositorio original del GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Fichero original en el commit referenciado: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF/tree/6ab461498e2023f6e3c1baea90a8f0fe38ab64d0
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
