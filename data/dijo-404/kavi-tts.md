# Dijo-404/kavi-tts

## Resumen

Kavi-tts es un paquete de voz para clonación de voz orientado a navegador, publicado por el usuario Dijo-404 sobre el modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base (revisión `5d83992436eae1d760afd27aff78a71d676296fc`). No se trata de un modelo entrenado desde cero ni de un fine-tune completo: el bundle reutiliza sin modificar los pesos del release Q7 de Fusor (qwen3-tts-12hz-0.6b-base-web) y añade un perfil de referencia de voz (`reference.json`) con la grabación y transcripción necesarias para la síntesis condicionada por referencia.

El modelo resuelve un problema concreto: ejecutar síntesis de voz con clonación por referencia directamente en la CPU del navegador mediante WebAssembly, sin depender de GPU ni de PyTorch en el cliente. Para ello se apoya en el runtime `qwen3-tts-wasm` y en la aplicación Kural TTS, que descarga los pesos base públicos y recupera la referencia fijada por revisión, verificando su SHA-256 antes de la reproducción.

La relevancia es acotada pero específica: demuestra un patrón de despliegue de TTS con clonación de voz totalmente en cliente, con el modelo de 0,6B parámetros cuantizado a Q7 y un tamaño de repositorio de 1,1 GB. El repositorio no presenta descargas ni interacciones y no publica datos de benchmarks, licencia explícita ni lista de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-TTS, TTS condicionado por referencia) |
| Parámetros totales | 0,6B (modelo base Qwen3-TTS-12Hz-0.6B-Base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q7 (bundle de navegador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el paquete incluye un archivo LICENSE que cubre los pesos del modelo base y no otorga permiso para redistribuir la referencia de voz personal |
| Formato de pesos | bundle WebAssembly/ONNX para el runtime `qwen3-tts-wasm`; no cargable directamente en PyTorch |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base (revisión `5d83992436eae1d760afd27aff78a71d676296fc`) |
| Librería | fusor-ai |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base más allá de su identificador: Qwen3-TTS-12Hz-0.6B-Base, un modelo de texto a voz de 0,6B parámetros con representación a 12 Hz. Los pesos incluidos en este repositorio son una copia del release Q7 de Fusor para navegador, sin cambios en los pesos, empaquetados para el runtime WebAssembly `qwen3-tts-wasm`. La síntesis se condiciona mediante un perfil de referencia (`reference.json`) que contiene la grabación y su transcripción.

Respecto al entrenamiento, la model card describe el pipeline Kural 4000, que emplea Qwen3-TTS 1.7B Base como profesor, Whisper y Nemotron para el filtrado de contenido, y la misma revisión de Qwen3-TTS 0.6B Base para un fine-tuning selectivo y exportación a ONNX. No obstante, el repositorio aloja únicamente la versión Q7 condicionada por referencia; el pipeline de entrenamiento en inglés es independiente y se ofrece como herramienta para futuros checkpoints de Kavi. No se especifican número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) condicionada por una referencia de voz para clonación.
- Clonación de voz a partir de una grabación y transcripción incluidas en `reference.json`.
- Ejecución en la CPU del navegador mediante WebAssembly, sin GPU en el cliente.
- Integración con la aplicación Kural TTS, que gestiona la descarga de pesos base y la recuperación de la referencia fijada por revisión con verificación SHA-256.
- Generación de texto de chat delegada externamente a OpenRouter (no forma parte del modelo de voz).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Clonación de voz en aplicaciones web: el bundle se ejecuta en la CPU del navegador vía WebAssembly, de modo que la síntesis ocurre en el cliente y no requiere infraestructura de GPU para servir la voz.
- Asistentes conversacionales con voz personalizada: combinando la generación de texto en OpenRouter con la síntesis local del bundle, se puede construir un chat por voz con una identidad sonora fija definida en `reference.json`.
- Prototipado de interfaces de accesibilidad: lectura en voz alta de contenido web con una voz concreta, ejecutándose íntegramente en el navegador del usuario.
- Demostraciones de TTS sin backend de inferencia: al no necesitar PyTorch ni un servidor de modelos, el paquete sirve para desplegar demos estáticas de voz con clonación.
- Evaluación del runtime `qwen3-tts-wasm`: el bundle permite probar el rendimiento del modelo Q7 de 0,6B en hardware de cliente variado para medir latencia y calidad por dispositivo.
- Integración en Kural TTS como perfil de voz: la aplicación descarga la referencia fijada por revisión y verifica su SHA-256 antes de la reproducción, lo que permite distribuir una voz concreta de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en la CPU del navegador mediante WebAssembly; no requiere GPU en el cliente.
- El modelo base es de 0,6B parámetros en cuantización Q7; el repositorio ocupa 1,1 GB.
- VRAM estimada para inferencia en GPU: no disponible (el bundle no está pensado para ese escenario).
- GPU recomendadas: no aplica para el flujo documentado.
- Despliegue: runtime `qwen3-tts-wasm` junto con la aplicación Kural TTS; el bundle no se puede cargar directamente en PyTorch.
- Latencia y throughput: no disponibles; la model card indica que los resultados varían según el texto y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kavi-tts (este) | 0,6B | no disponible | bundle WASM/ONNX Q7 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | pesos del modelo base | según el modelo base | Hugging Face |
| fusorlabs/qwen3-tts-12hz-0.6b-base-web | 0,6B | no disponible | bundle web Q7 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El bundle no se puede cargar directamente en PyTorch; requiere el runtime `qwen3-tts-wasm` y la aplicación Kural TTS.
- La licencia no está indicada en los metadatos; el archivo LICENSE incluido cubre los pesos del modelo base y no concede permiso para redistribuir la referencia de voz personal.
- El `reference.json` público contiene la grabación y transcripción de la voz de referencia, lo que plantea consideraciones de privacidad sobre su descarga y uso.
- La model card advierte de que las voces Q7 de navegador requieren revisión auditiva de similitud y ritmo, y que los resultados varían según el texto y el hardware.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción.
- La generación de texto del chat depende de OpenRouter, un servicio externo al modelo de voz.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dijo-404/kavi-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Release Q7 de Fusor para navegador: https://huggingface.co/fusorlabs/qwen3-tts-12hz-0.6b-base-web/tree/5b70db4fa8c56549063892c301a2d8131e7b5d07
- Kural TTS: https://github.com/Madan94/kural-tts
- Pipeline Kural 4000: https://github.com/TheCoalitionOfPlanets/kural-4000
