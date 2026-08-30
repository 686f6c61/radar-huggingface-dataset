# laion/moss-va-sft3-rate-lora

## Resumen

`laion/moss-va-sft3-rate-lora` es un adaptador LoRA de rango 16, con 34,4 millones de parámetros, diseñado para añadir control explícito de la velocidad de habla a un modelo de texto-a-voz (TTS) de 4,55 mil millones de parámetros, `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. El objetivo era que el modelo obedeciera instrucciones como "di esta línea a 26 caracteres por segundo" mediante una etiqueta de ritmo en el prompt. Sin embargo, la evaluación conductual en 400 ensayos pareados demuestra que el adaptador **no produce ningún cambio medible** en la velocidad de habla respecto al modelo base.

Publicado por LAION, este adaptador se presenta explícitamente como un **resultado negativo**: la medición rigurosa de su ineficacia es el valor principal del artefacto, junto con su papel como inicialización para otros dos adaptadores de calidad que sí funcionan. Aunque es inofensivo (no degrada la calidad de audio ni la precisión de palabras), no debe describirse como un control de ritmo. La licencia es Apache 2.0 y el idioma soportado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer local de TTS de 4,55B |
| Parametros totales | 34,4 millones (0,825 % de los 4,164B entrenables del modelo base) |
| Parametros activos | no aplica (adaptador de bajo rango, no MoE) |
| Longitud de contexto | no aplica (modelo de audio, no texto generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un modelo base congelado de 4,55B parámetros, `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, un TTS expresivo de tipo "voice-acting" que genera audio de 48 kHz. El adaptador LoRA tiene rango 16, alfa 32, dropout 0,05 y se aplica a módulos que incluyen `audio_lm_heads.0` (el aviso de la model card advierte explícitamente que no debe fusionarse en los pesos base).

Los datos de entrenamiento consisten en 121.940 grabaciones reales de voz, con tres modos de etiqueta de ritmo en el prompt: solo duración (40.835 filas), solo velocidad (40.609) y ambas (40.496). El ritmo del corpus tiene una mediana de 20,7 caracteres por segundo (p10 16,2, p90 27,4). El entrenamiento duró 1 época (3.788 actualizaciones) con lr 1e-4, coseno hasta 0,1×, 50 % de warmup, weight decay 0,1 y batch global 32, en 4 GPUs durante 1 hora 47 minutos. La pérdida de validación apenas varió (3,8225 → 3,8200), lo que el autor señala como no informativo para la calidad, ya que la etiqueta de ritmo mueve una fracción mínima de la distribución de tokens de audio.

La causa del fracaso es estructural: la velocidad se calculaba como `caracteres / duración`, y tanto caracteres como duración ya estaban en el prompt, por lo que la etiqueta de velocidad no aportaba información nueva. Además, el prompt incluye un presupuesto de `Tokens:` que fija la duración total, y el modelo base ya lo obedece perfectamente.

## Capacidades

- **No controla la velocidad de habla**: la pendiente de regresión entre velocidad solicitada y velocidad lograda es cero en todas las condiciones (valores entre −0,034 y 0,104, con errores estándar de ~0,07), tanto con el adaptador como sin él.
- **Inofensivo**: no degrada la calidad de audio (DNSMOS −0,054, no significativo), ni la precisión de palabras (WER sin cambios relevantes), ni la precisión de duración.
- **Sirve como inicialización**: es la base de los adaptadores de calidad `moss-va-sft3-quality-lora-adapters`, que sí aportan mejoras.
- **No aporta capacidades adicionales** al modelo base: no añade tool calling, agentes, razonamiento ni otras funciones propias de modelos de lenguaje.

## Casos de uso

- **Documentación de resultados negativos**: el adaptador es un ejemplo publicado de cómo una hipótesis de entrenamiento falla de forma medible, útil para la comunidad de investigación en TTS que necesite evitar errores metodológicos similares (etiquetas redundantes con el prompt).
- **Punto de partida para otros adaptadores**: los adaptadores de calidad de la misma serie se construyen sobre esta inicialización, por lo que puede usarse como checkpoint intermedio en pipelines de entrenamiento de LoRA para TTS.
- **Estudio de control de ritmo en TTS**: sirve como referencia para investigar qué mecanismos sí controlan la velocidad (el presupuesto de tokens, no las etiquetas explícitas).
- **Evaluación de metodología de benchmarks**: su publicación demuestra un protocolo de evaluación conductual (ensayos pareados con semilla compartida, regresión de pendiente) que puede replicarse en otros modelos.
- **Prueba de integración en sistemas de voice-acting**: al ser inofensivo, puede montarse sobre el modelo base sin riesgo de degradar la salida, útil para verificar que el pipeline de carga de adaptadores funciona correctamente.
- **No recomendado para producción**: no debe usarse como control de velocidad en aplicaciones reales de TTS, ya que no produce el efecto deseado.

## Benchmarks y rendimiento

La model card incluye resultados de evaluaciones conductuales detalladas. Se presentan las dos tablas clave:

**Diseño A — el presupuesto de tokens se mueve con la petición**

| Modo de etiqueta | Modelo | Pendiente (slope) | ±SE | Tempo @14 | Tempo @26 | WER |
|---|---|---|---|---|---|---|
| solo duración | base | 0,659 | 0,072 | 17,6 | 25,8 | 0,074 |
| solo duración | + adaptador | 0,589 | 0,083 | 18,1 | 25,4 | 0,071 |
| solo velocidad | base | 0,664 | 0,066 | 17,6 | 26,4 | 0,049 |
| solo velocidad | + adaptador | 0,656 | 0,075 | 18,0 | 26,4 | 0,049 |
| ambas | base | 0,774 | 0,072 | 16,3 | 25,8 | 0,067 |
| ambas | + adaptador | 0,778 | 0,066 | 18,1 | 27,7 | 0,067 |

**Diseño B — presupuesto fijo, solo varía la etiqueta (test decisivo)**

| Modo de etiqueta | Modelo | Pendiente | ±SE | Tempo @14 | Tempo @26 |
|---|---|---|---|---|---|
| solo velocidad | base | 0,008 | 0,069 | 18,5 | 18,3 |
| solo velocidad | + adaptador | −0,034 | 0,069 | 18,4 | 18,1 |
| ambas | base | 0,104 | 0,066 | 17,9 | 18,4 |
| ambas | + adaptador | −0,006 | 0,055 | 17,3 | 17,7 |

**Calidad de audio (16 prompts, pareado vs base)**

| DNSMOS | SIG | BAK | WER | Genuineness |
|---|---|---|---|---|
| −0,054 (t −1,55) | −0,047 | −0,036 | +0,028 | −0,047 |

No hay cambios significativos en ningún aspecto. El autor concluye que el control de duración total es completo (error medio 0,000 s en 13 de 14 condiciones, pendiente 0,979) pero se logra mediante el presupuesto de tokens, no mediante la etiqueta de velocidad.

## Requisitos de hardware

- No se han publicado requisitos específicos para este adaptador en la información disponible.
- Al ser un adaptador LoRA de 0,1 GB, la memoria adicional sobre el modelo base es mínima.
- El modelo base `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3` tiene 4,55B parámetros, por lo que la VRAM necesaria dependerá de su cuantización; para inferencia en FP16 se estima al menos 9-10 GB solo para los pesos, más overhead de activaciones y audio. Sin datos oficiales, esta cifra es orientativa.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). El adaptador usa la librería PEFT y safetensors, por lo que es compatible con el ecosistema Hugging Face Transformers.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que se trata de un adaptador LoRA de resultado negativo. La comparación relevante es contra el modelo base sin adaptador y contra otros adaptadores de la misma serie:

| Modelo | Parámetros | Función | Resultado |
|---|---|---|---|
| `moss-va-sft3-rate-lora` (este) | 34,4M (LoRA) | Control de velocidad | Sin efecto medible |
| `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3` (base) | 4,55B | TTS expresivo | Control de duración total, sin control de velocidad explícito |
| `moss-va-sft3-quality-lora-adapters` (serie) | no disponible | Mejora de calidad | Sí aporta mejoras (según la página del proyecto) |
| `moss-va-sft3-voice-loras` (serie) | no disponible | Clonación de voz | Sí aporta mejoras (según la página del proyecto) |

No se dispone de benchmarks de estos otros adaptadores en la información proporcionada.

## Limitaciones y advertencias

- **No funciona para su propósito**: el adaptador no controla la velocidad de habla, como demuestran las pendientes nulas en el diseño B. No debe usarse como control de ritmo en ninguna aplicación.
- **No debe fusionarse en los pesos base**: la model card advierte explícitamente que nunca se debe mergear este adaptador en los pesos del modelo base, porque sus módulos objetivo incluyen `audio_lm_heads.0`.
- **Riesgo de malinterpretación**: el descenso de la pérdida de validación (3,8225 → 3,8200) no indica mejora de calidad; es un artefacto de la evaluación sobre todos los tokens de audio.
- **Idioma limitado**: solo soporta inglés.
- **Licencia Apache 2.0**: permite uso comercial, pero dado que el adaptador es inerte, su uso comercial carece de valor práctico salvo como inicialización.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un modelo de audio, el riesgo de alucinación se traduce en errores de pronunciación o contenido, no medidos en esta publicación.

## Enlaces

- [Modelo en Hugging Face: laion/moss-va-sft3-rate-lora](https://huggingface.co/laion/moss-va-sft3-rate-lora)
- [Modelo base: laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- [Adaptadores de calidad: laion/moss-va-sft3-quality-lora-adapters](https://huggingface.co/laion/moss-va-sft3-quality-lora-adapters)
- [Adaptadores de voz: laion/moss-va-sft3-voice-loras](https://huggingface.co/laion/moss-va-sft3-voice-loras)
- [Servidor de demo de voice-acting (GitHub)](https://github.com/LAION-AI/Humaneness-Voice-Demo-Server)
- [Manual y estudios de MOSS Voice-Acting](https://projects.laion.ai/moss-voiceacting-manual/site/index.html)
