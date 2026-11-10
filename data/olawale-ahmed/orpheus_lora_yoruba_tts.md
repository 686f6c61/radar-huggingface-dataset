# olawale-ahmed/orpheus_lora_yoruba_tts

## Resumen
Orpheus LoRA Yoruba TTS es un ajuste fino mediante LoRA del modelo Orpheus 3B, concretamente de la variante `unsloth/orpheus-3b-0.1-ft`, publicado por el usuario olawale-ahmed en Hugging Face. Orpheus es una familia de modelos orientados a síntesis de voz (text-to-speech) construida sobre una arquitectura de tipo Llama, y este ajuste concreto se presenta como una adaptación para yoruba, si bien la model card no documenta el corpus ni los detalles del entrenamiento.

El modelo resuelve el problema de adaptar un TTS preentrenado en inglés a un idioma de bajos recursos como el yoruba, empleando la técnica de bajo rango (LoRA) para reducir el coste de entrenamiento. Es relevante para desarrolladores e investigadores que trabajan en síntesis de voz multilingüe y en la adaptación eficiente de modelos de audio en lenguas africanas, aunque la información pública disponible es muy escasa.

La ficha se basa únicamente en los metadatos del repositorio y en la model card publicada. No se dispone de información sobre arquitectura interna detallada, datos de entrenamiento, benchmarks ni evaluación subjetiva de la calidad de la voz generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base Orpheus 3B); adaptación LoRA |
| Parametros totales | 3B (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | la model card declara `en`; el nombre del modelo indica adaptación a yoruba, no documentada formalmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.4 GB |
| Modelo base | unsloth/orpheus-3b-0.1-ft |
| Libreria | transformers |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento
El modelo deriva de `unsloth/orpheus-3b-0.1-ft`, una variante de Orpheus 3B publicada por Unsloth. Orpheus es un modelo de lenguaje de tipo Llama (transformer decoder-only) adaptado para generar audio de voz a partir de texto, empleando tokens de audio en lugar de texto en la salida. Sobre esta base, olawale-ahmed ha aplicado un ajuste fino con LoRA (Low-Rank Adaptation) usando la librería Unsloth y el stack TRL, según los tags del repositorio.

La model card no detalla el número de tokens de entrenamiento, la composición del corpus de yoruba, la estrategia de alineación (RLHF/DPO) ni hiperparámetros del LoRA. El tamaño del repositorio (0.4 GB) es coherente con un adaptador LoRA más los ficheros de configuración, no con un checkpoint completo de 3B en precisión completa. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades
- Generación de voz a partir de texto (text-to-speech) heredada del modelo base Orpheus.
- Adaptación orientada a yoruba, aunque no se documenta la cobertura fonética ni la calidad resultante.
- Capacidades de generación de texto subyacentes del modelo Llama 3B (no evaluadas en este ajuste).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta adaptación.
- Capacidades multilingües: la model card solo declara `en`; el yoruba no está declarado oficialmente en los metadatos.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso
- Síntesis de voz en yoruba para aplicaciones de accesibilidad: lectura de textos y documentos para usuarios con discapacidad visual en yoruba, aprovechando la adaptación del modelo a esta lengua.
- Locución automatizada de contenidos educativos: generación de audio para cursos, cuentos y materiales didácticos en yoruba, reduciendo el coste frente a grabaciones humanas.
- Asistentes de voz para atención al ciudadano: integración en sistemas de información pública (salud, trámites) que requieran respuestas habladas en yoruba.
- Investigación en TTS de bajos recursos: base para experimentos de adaptación LoRA a otras lenguas africanas, comparando metodologías de ajuste eficiente.
- Prototipado de interfaces conversacionales: generación de audio de respuesta en pipelines de voz a voz, combinando ASR, LLM y este TTS.
- Generación de audiolibros y pódcast en yoruba: producción de contenido narrado a escala con revisión humana posterior.
- Evaluación comparativa de calidad de voz: banco de pruebas para medir inteligibilidad y naturalidad frente a otros TTS multilingües.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3B en fp16 se estiman en torno a 6-8 GB, y en cuantización de 4 bits en torno a 2-3 GB, aunque estas cifras son estimaciones generales y no han sido verificadas para este ajuste.
- GPU recomendadas: no documentadas por el autor; por tamaño del modelo base, una RTX 3090/4090 o una A10/A100 serían suficientes para inferencia en fp16.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización, aunque no está confirmado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente); llama.cpp/Ollama no documentados para este ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olawale-ahmed/orpheus_lora_yoruba_tts | 3B (base) | no disponible | apache-2.0 | Hugging Face | Adaptación LoRA a yoruba, sin benchmarks |
| unsloth/orpheus-3b-0.1-ft | 3B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del ajuste |
| Canopy Labs Orpheus 3B (original) | 3B | no disponible | apache-2.0 (según publicación original) | Hugging Face | TTS en inglés, referencia de la familia |

La comparación con alternativas específicas de TTS en yoruba no está disponible en la información proporcionada.

## Limitaciones y advertencias
- La model card es mínima y no documenta el corpus de entrenamiento, lo que impide evaluar sesgos, cobertura dialectal o calidad de la pronunciación.
- El campo `language` declara únicamente `en`, pese a que el nombre del modelo indica adaptación a yoruba; existe una inconsistencia entre metadatos y propósito declarado.
- Riesgo de alucinación y de errores de pronunciación no evaluados; no hay muestras de audio ni métricas publicadas.
- No se han publicado evaluaciones subjetivas (MOS) ni comparativas con otros TTS.
- Aunque la licencia es apache-2.0, conviene verificar la licencia del modelo base y de los datos de entrenamiento antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.
- No se documentan limitaciones de contexto ni de longitud de audio generado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/olawale-ahmed/orpheus_lora_yoruba_tts
- Modelo base: https://huggingface.co/unsloth/orpheus-3b-0.1-ft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
