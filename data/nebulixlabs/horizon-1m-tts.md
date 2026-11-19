# Nebulixlabs/Horizon-1M-TTS

## Resumen
Horizon-1M-TTS es un modelo experimental de síntesis de voz (text-to-speech) desarrollado por Nebulixlabs, un laboratorio que publica modelos pequeños bajo licencia Apache 2.0. Su propuesta principal es la compresión extrema: con aproximadamente 1 millón de parámetros reales (2.000.398 según los pesos en safetensors), genera audio inteligible en inglés con dos voces diferenciadas (`en_sophia` y `en_sam`), algo poco habitual en ese rango de tamaño. Está entrenado sobre unas 10 horas de habla en inglés y produce audio a 24 kHz.

El modelo se distribuye a través de Hugging Face con la librería `transformers` y código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del autor. No es un modelo de producción: la propia model card lo etiqueta como experimental, con salida descrita como "ligeramente robótica" por la limitación de parámetros y datos. Su interés es fundamentalmente educativo y de investigación en eficiencia paramétrica y TTS en el borde (edge AI).

Es relevante ahora como referencia de hasta dónde se puede reducir un sistema TTS manteniendo inteligibilidad y condicionamiento multi-hablante, y como banco de pruebas de arquitecturas minúsculas desplegables en CPU o dispositivos con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de TTS con código propio, `modeling_horizon.py`; no se detalla la topología interna) |
| Parámetros totales | 2.000.398 (según safetensors); la model card indica "~1M" |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de TTS; no se especifica longitud máxima de texto de entrada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con `transformers`, `custom_code`) |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Voces | 2 (`en_sophia`, `en_sam`) |
| Datos de entrenamiento | ~10 horas de habla en inglés |
| Framework | PyTorch / Hugging Face `transformers` |

## Arquitectura y entrenamiento
No se detalla la arquitectura interna en la información disponible. El repositorio incluye un módulo `modeling_horizon.py` con clases como `HorizonTTSModel` y referencias a `HorizonForConditionalGeneration`, lo que sugiere una implementación personalizada integrada en `transformers` más que una arquitectura estándar publicada. La model card no especifica si se trata de un transformer puro, un modelo acústico con vocoder separado, ni la composición exacta del dataset más allá de las ~10 horas de habla en inglés.

No hay información sobre el proceso de entrenamiento (número de tokens, uso de RLHF/DPO, técnicas de alineación), ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El condicionamiento multi-hablante se realiza mediante un identificador de voz (`speaker`) pasado en la inferencia o mediante un método interno `_switch_profile`, según el código de ejemplo de la model card.

## Capacidades
- Síntesis de voz en inglés a partir de texto, con salida de audio a 24 kHz.
- Condicionamiento multi-hablante con dos voces predefinidas: `en_sophia` (perfil femenino) y `en_sam` (perfil masculino).
- Ejecución en CPU y GPU gracias a su huella mínima de parámetros.
- Integración con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Educación en arquitecturas TTS: sirve para estudiar cómo se comporta un modelo de ~1M de parámetros en síntesis de voz y analizar el equilibrio entre tamaño, inteligibilidad y naturalidad en un entorno controlado.
- Prototipado en edge AI: al caber en CPU y requerir muy poca memoria, permite validar pipelines de voz en dispositivos con restricciones severas antes de migrar a un modelo mayor.
- Investigación en eficiencia paramétrica: útil como línea base para comparar técnicas de compresión, destilación o cuantización en TTS.
- Pruebas de condicionamiento multi-hablante: permite experimentar con conmutación entre dos voces (`en_sophia` y `en_sam`) para estudiar cómo se codifica la identidad del hablante en modelos minúsculos.
- Generación de audio de relleno en demos y tests: para pruebas de integración de pipelines de audio donde la calidad no es crítica pero se necesita una salida de voz rápida y ligera.
- Docencia y talleres de Hugging Face: ejemplo práctico de carga de modelos con `trust_remote_code`, parcheo de código y ejecución de inferencia con `transformers`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: mínima; con ~2M parámetros en fp32 el peso ronda los 8 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada pueden ejecutarlo.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (método documentado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que "funciona cómodamente en CPU y GPU", pero no aporta cifras.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros modelos TTS de tamaño similar ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Modelo experimental: la propia model card lo etiqueta como tal y advierte de que la voz puede sonar "ligeramente robótica".
- Calidad limitada: con ~1M de parámetros y 10 horas de datos, la naturalidad y prosodia están muy por debajo de modelos TTS convencionales.
- Solo inglés: no soporta otros idiomas.
- Solo dos voces: no hay clonación de voz ni control fino de estilo.
- Requiere `trust_remote_code=True`: ejecuta código del autor, con el riesgo de seguridad que ello implica. La model card documenta además un `NameError` conocido en `modeling_horizon.py` que requiere un parche manual antes de cargar el modelo.
- Sin datos de benchmarks ni evaluación objetiva publicada (MOS, WER, etc.).
- Sin información sobre sesgos: al entrenarse con un dataset pequeño y no documentado, pueden aparecer sesgos de pronunciación y acento no caracterizados.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos o pronunciaciones incorrectas, especialmente en textos largos o complejos.
- Licencia Apache 2.0: permite uso comercial, pero la falta de garantías y la naturaleza experimental desaconsejan su uso en producción.
- Uso fuera de alcance: la model card excluye explícitamente asistentes de voz en producción.

## Enlaces
- Hugging Face: https://huggingface.co/Nebulixlabs/Horizon-1M-TTS
- GitHub del autor: https://github.com/NebulixLabs
- Perfil de Hugging Face del autor: https://huggingface.co/Nebulixlabs
- Instagram del autor: https://instagram.com/nebulix_labs
