# iCELAKE01/VibeVoice-Large

## Resumen
VibeVoice-Large es un modelo de síntesis de voz (text-to-speech) orientado a la generación de audio conversacional expresivo de larga duración, como podcasts o diálogos con múltiples hablantes. Desarrollado originalmente por Microsoft, esta ficha corresponde a una redistribución de los pesos publicada por el usuario iCELAKE01 en Hugging Face, amparándose en la licencia MIT del modelo original. El modelo resuelve problemas clásicos de los sistemas TTS tradicionales: escalabilidad en secuencias largas, consistencia de la identidad del hablante y naturalidad en el cambio de turno entre interlocutores.

La arquitectura combina un LLM (Qwen2.5) que interpreta el contexto textual y el flujo del diálogo con dos tokenizadores de habla continua (acústico y semántico) que operan a una frecuencia de trama ultrabaja de 7,5 Hz, más una cabeza de difusión que genera el detalle acústico de alta fidelidad. Con 9.343.355.361 parámetros totales y una longitud de contexto de 32.768 tokens, es capaz de sintetizar hasta aproximadamente 45 minutos de audio con hasta 4 hablantes distintos, superando el límite habitual de 1-2 hablantes de modelos anteriores.

Su relevancia actual radica en que acerca la generación de audio conversacional realista a un entorno open source con licencia permisiva, algo poco frecuente en esta categoría, donde predominan modelos propietarios o con restricciones de uso. El modelo está entrenado exclusivamente en inglés y chino.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5) + tokenizadores acústico y semántico (σ-VAE, ~340M parámetros cada uno) + cabeza de difusión (4 capas, ~600M parámetros) |
| Parametros totales | 9.343.355.361 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenado con curriculum hasta 32K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
VibeVoice es un framework híbrido: un LLM (Qwen2.5 en esta release) procesa el texto y el contexto del diálogo, mientras que dos tokenizadores de habla continua comprimen el audio a 7,5 Hz. El tokenizador acústico se basa en una variante de σ-VAE propuesta en LatentLM, con estructura encoder-decoder simétrica de espejo y 7 etapas de bloques transformer modificados, logrando un downsampling de 3200x desde una entrada de 24 kHz. El tokenizador semántico replica la arquitectura del acústico (sin componentes VAE) y se entrena con una tarea proxy de ASR. La cabeza de difusión, un módulo ligero de 4 capas (~600M parámetros), se condiciona sobre los estados ocultos del LLM y predice las características acústicas VAE mediante un proceso DDPM, usando Classifier-Free Guidance y DPM-Solver en inferencia.

El entrenamiento se divide en dos etapas: preentrenamiento separado de los tokenizadores acústico y semántico, seguido del entrenamiento de VibeVoice propiamente dicho, en el que los tokenizadores se congelan y solo se ajustan el LLM y la cabeza de difusión. Se emplea una estrategia de curriculum learning para la longitud de secuencia de entrada (4K → 16K → 32K tokens). No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades
- Generación de voz expresiva a partir de texto, con síntesis de audio conversacional multi-hablante (hasta 4 hablantes distintos).
- Generación de audio de larga duración: hasta aproximadamente 45 minutos por generación con contexto de 32K tokens.
- Cambio de turno natural entre interlocutores, orientado a formatos tipo podcast o diálogo.
- Comprensión del contexto textual y del flujo del diálogo gracias al LLM subyacente (Qwen2.5).
- Soporte multilingüe limitado a inglés y chino.
- No soporta tool calling ni function calling (no disponible en la información).
- No soporta agentes ni razonamiento multi-step (no disponible en la información).
- No genera visión, audio no vocal (ambiente, Foley, música) ni efectos de sonido: el modelo es exclusivamente de habla.

## Casos de uso
- Generación de podcasts sintéticos: el modelo puede producir episodios conversacionales de hasta ~45 minutos con hasta 4 voces diferenciadas, usando el contexto de 32K tokens para mantener la coherencia del diálogo a lo largo de toda la emisión.
- Audiolibros y narración multi-personaje: permite asignar voces distintas a personajes de una novela y mantener la consistencia del hablante durante capítulos largos, algo que los TTS de un solo hablante no cubren.
- Prototipado de contenido editorial y educativo: creación rápida de material audio para cursos, resúmenes o boletines internos, con turnos de conversación entre presentador e invitado simulados.
- Investigación en síntesis de voz: el modelo sirve como base para estudiar tokenizadores de habla a baja frecuencia de trama, difusión condicionada por LLM y consistencia de hablante en secuencias largas, tal como describe el informe técnico.
- Localización de contenido en inglés y chino: doblaje o generación de versiones audio de guiones en estos dos idiomas, con la advertencia de que otros idiomas no están soportados.
- Evaluación de pipelines TTS y detección de deepfakes: al ser un modelo open source de alta fidelidad, puede utilizarse como generador de referencia para entrenar o validar sistemas de detección de audio sintético.
- Demostraciones y maquetas de producto: generación de audio de muestra para aplicaciones de accesibilidad, asistentes o interfaces conversacionales antes de invertir en soluciones comerciales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 9.343.355.361 parámetros en safetensors y un repo de 18,7 GB, la inferencia en precisión completa requiere del orden de 18-20 GB solo para pesos, más memoria para el contexto de 32K tokens y la cabeza de difusión.
- GPU recomendadas: no disponible en la información; por tamaño, se intuye necesidad de GPUs de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM.
- ¿Cabe en consumer GPU?: no disponible; probablemente ajustado en GPUs de 24 GB con cuantización, pero no confirmado.
- Opciones de despliegue: la librería indicada es `vibevoice`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Duración de generación | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VibeVoice-Large (esta ficha) | 9.343.355.361 | 32K | ~45 min | hasta 4 | MIT | Hugging Face (redistribución) |
| VibeVoice-1.5B | no disponible | 64K | ~90 min | no disponible | MIT | Hugging Face (microsoft/VibeVoice-1.5B) |
| VibeVoice-0.5B-Streaming | no disponible | no disponible | no disponible | no disponible | MIT | anunciado, no publicado |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias
- El modelo está entrenado solo con datos en inglés y chino; las salidas en otros idiomas no están soportadas y pueden resultar ininteligibles o ofensivas.
- No genera sonido no vocal: nada de ambiente, Foley ni música; es exclusivamente habla.
- Riesgo alto de deepfakes y desinformación: la voz sintética de alta calidad puede usarse para suplantación, fraude o difusión de contenido falso.
- Uso previsto limitado a investigación según la model card original de Microsoft, aunque la licencia MIT permite redistribución.
- Usos prohibidos por la model card: suplantación de voz sin consentimiento registrado, desinformación o suplantación de personas reales, conversión de voz en tiempo real o de baja latencia (deepfakes en llamadas), generación de transcripciones de texto y generación de audio no vocal.
- Hereda sesgos, errores y omisiones del modelo base (Qwen2.5).
- Puede producir salidas inesperadas, sesgadas o inexactas; se recomienda verificar la exactitud del contenido generado.
- Esta ficha corresponde a una copia redistribuida por un tercero (iCELAKE01); conviene verificar la integridad de los pesos frente al repositorio original de Microsoft en ModelScope.
- No se especifican tipos de cuantización ni opciones de despliegue, lo que limita la planificación de producción.

## Enlaces
- Hugging Face (esta ficha): https://huggingface.co/iCELAKE01/VibeVoice-Large
- Repositorio original en ModelScope: https://www.modelscope.cn/models/microsoft/VibeVoice-Large
- Informe técnico (arXiv 2508.19205): https://arxiv.org/abs/2508.19205
- Paper LatentLM (arXiv 2412.08635): https://arxiv.org/pdf/2412.08635
- Página del proyecto: https://microsoft.github.io/VibeVoice
- Código en GitHub: https://github.com/microsoft/VibeVoice
- Modelo VibeVoice-1.5B: https://huggingface.co/microsoft/VibeVoice-1.5B
