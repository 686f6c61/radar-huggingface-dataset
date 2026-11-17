# locai-models/kugelaudio-0-open-english-female-bf16

## Resumen

`locai-models/kugelaudio-0-open-english-female-bf16` es un paquete derivado del modelo de síntesis de voz `kugelaudio/kugelaudio-0-open`, publicado por LocAI para su uso en su propio runtime de despliegue. No se trata de un modelo entrenado desde cero, sino de una conversión de formato: expone la voz femenina en inglés del modelo base como pesos crudos en `bf16`, junto con el generador AudioSeal de 16 bits en formato ONNX (con su salida residual expuesta) y un fichero de configuración de runtime (`runtime.json`) propio de LocAI.

El repositorio es deliberadamente mínimo (0,1 GB) y solo contiene los ficheros derivados; el resto de ficheros del publicador original se obtienen desde el repositorio upstream en una revisión fijada (`55a171ae0208a57fa8853209989e8c0d95572e89`). Esto lo convierte en un artefacto de empaquetado reproducible más que en un modelo autónomo: está pensado para completar el perfil de despliegue `kugelaudio-0-open-bf16-apple-metal-english-female-local-v1`, orientado a inferencia local en Apple Metal.

Su relevancia es acotada pero concreta: sirve como pieza de infraestructura para quien quiera reproducir el pipeline de TTS (texto a voz) de KugelAudio 0 con marca de agua de audio verificable (AudioSeal) en un entorno local. El autor advierte explícitamente de que es una conversión de formato sin garantía de calidad y que no se ejecutó ninguna evaluación para producirla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de síntesis de voz; el repositorio solo contiene artefactos derivados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (voz en `english_female.bf16`); ONNX de 16 bits para AudioSeal |
| Idiomas soportados | inglés (voz femenina; el paquete no declara otros idiomas) |
| Licencia | MIT (la del modelo base), con licencia adicional para `audioseal-residual.onnx` en `LICENSE-audioseal` |
| Formato de pesos | bf16 crudo, ONNX y JSON de configuración de runtime |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base `kugelaudio/kugelaudio-0-open`; solo se indica que es un modelo de audio (TTS) del que se extrae una voz concreta (`voices/english_female.pt`) y se convierte a `bf16` crudo. No hay información sobre número de parámetros, composición del dataset de entrenamiento, número de tokens, ni sobre si se aplicaron técnicas de RLHF/DPO o decodificación especulativa.

El componente técnico destacable es el pipeline de preparación: el script `tools/qualification/prepare_kugelaudio.py` (Python 3.12, solo biblioteca estándar) se ejecuta de forma offline bajo `run-offline-darwin.sh` y genera tres ficheros con hashes SHA-256 verificables: `english_female.bf16` (19.202 bytes), `audioseal-residual.onnx` (58.953.868 bytes) y `runtime.json` (760 bytes). La integración de AudioSeal (generador de 16 bits de `synath/audioseal-onnx`) con salida residual expuesta sugiere un uso de marca de agua de audio para trazabilidad de las muestras generadas, aunque el repositorio no detalla cómo se compone con el decoder de voz.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con voz femenina, a partir del modelo base KugelAudio 0.
- Marca de agua de audio mediante AudioSeal (generador de 16 bits en ONNX), con salida residual accesible para su verificación.
- Empaquetado reproducible: hashes SHA-256 de todos los ficheros e inputs, con revisiones fijadas del repositorio upstream.
- Integración con el runtime de LocAI mediante `runtime.json`, orientado al perfil `kugelaudio-0-open-bf16-apple-metal-english-female-local-v1`.
- No consta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el paquete es exclusivamente de generación de voz.

## Casos de uso

- Generación de voz en local para aplicaciones de lectura en voz alta: el paquete en `bf16` con perfil Apple Metal permite ejecutar TTS en un Mac sin depender de servicios en la nube, usando la voz femenina en inglés incluida.
- Audiolibros y narración automatizada: la voz femenina en inglés y el formato `bf16` facilitan la generación por lotes de narraciones con calidad controlada y marca de agua incorporada.
- Verificación de procedencia de audio sintético: `audioseal-residual.onnx` con salida residual expuesta permite integrar la detección de la marca de agua AudioSeal en pipelines de moderación o auditoría.
- Reproducibilidad de despliegues: los hashes SHA-256 y las revisiones fijadas permiten reconstruir exactamente el mismo artefacto en CI/CD, útil para equipos que necesitan builds deterministas.
- Prototipado de asistentes de voz en inglés: combinado con un ASR y un LLM, el paquete sirve como capa de salida de voz en un asistente local sin salida a internet.
- Investigación en marcas de agua de audio: la exposición del residual de AudioSeal facilita experimentos sobre robustez y detección de audio sintético en entornos controlados.
- Evaluación de runtimes de inferencia en Apple Silicon: el perfil `apple-metal` permite medir latencia y throughput de TTS en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que se trata de una conversión de formato sin garantía de calidad y que no se ejecutó ninguna evaluación para producirla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no declara el tamaño del modelo base).
- GPU recomendadas: no disponible; el perfil de despliegue declarado apunta a Apple Metal (`apple-metal`), es decir, GPU integradas de Apple Silicon.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del paquete (0,1 GB) y el perfil local declarado, aunque el modelo base completo puede requerir más recursos no documentados.
- Opciones de despliegue: runtime propio de LocAI (perfil `kugelaudio-0-open-bf16-apple-metal-english-female-local-v1`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona comparaciones con otros modelos de TTS ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Conversión de formato sin garantía de calidad: el autor declara que no se ejecutó ninguna evaluación para producir el paquete.
- Solo voz femenina en inglés: no se declaran otros idiomas ni voces en este repositorio.
- Dependencia del repositorio upstream: los ficheros no incluidos se descargan de `kugelaudio/kugelaudio-0-open` en la revisión fijada; si upstream cambia o desaparece, la reproducibilidad puede verse afectada.
- Sin información sobre sesgos del modelo base ni sobre riesgo de alucinación en la síntesis (pronunciación incorrecta, artefactos).
- Licencia MIT para el modelo base, pero `audioseal-residual.onnx` tiene su propia licencia en `LICENSE-audioseal`, que debe revisarse antes de uso comercial.
- El uso de marcas de agua AudioSeal puede tener implicaciones de privacidad o de política de contenido que conviene verificar en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/locai-models/kugelaudio-0-open-english-female-bf16
- Modelo base: https://huggingface.co/kugelaudio/kugelaudio-0-open
- AudioSeal ONNX: https://huggingface.co/synath/audioseal-onnx
- Licencia del modelo base: https://raw.githubusercontent.com/Kugelaudio/kugelaudio-open/51ceb928f7f481764499345fe4a18dd616c8c66d/LICENSE
