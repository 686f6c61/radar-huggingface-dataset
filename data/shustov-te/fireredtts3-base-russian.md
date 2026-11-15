# shustov-te/FireRedTTS3-Base-Russian

## Resumen

FireRedTTS3-Base-Russian es una adaptación al ruso del modelo de síntesis de voz FireRedTTS3, publicada por el usuario shustov-te. Se trata de un checkpoint completo en FP32 en el que se ha fusionado (merged) un LoRA de adaptación al ruso sobre el núcleo de FireRedTTS3 Base, de modo que no requiere un adaptador separado para su despliegue. El paquete incluye los activos necesarios para clonación zero-shot: tokenizer, RedAE y CAM++.

El modelo resuelve el problema de la síntesis de voz en ruso con clonación de voz a partir de una única referencia de audio. Con 2.120.632.897 parámetros (aproximadamente 2,12 mil millones), se distribuye como safetensors en un repositorio de 12,3 GB y se sirve mediante SGLang Omni con soporte específico para FireRedTTS3.

Es relevante porque amplía la cobertura idiomática de la familia FireRedTTS3 al ruso manteniendo la licencia Apache-2.0 del modelo original, aunque con limitaciones importantes: no se ha validado la paridad end-to-end en GPU con SGLang y la evaluación reportada es muy reducida (12 casos, 4 hablantes). El modelo se publicó el 15 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz FireRedTTS3; componentes RedAE y CAM++ incluidos) |
| Parámetros totales | 2.120.632.897 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (la API inspeccionada limita la entrada de texto a 400 caracteres) |
| Tipos de cuantización | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint FP32 con LoRA fusionado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de FireRedTTS3 más allá de que se trata de un sistema de text-to-speech con clonación zero-shot. El paquete incluye el tokenizer, el autoencoder RedAE y el modelo CAM++ (empleado habitualmente para verificación de hablante), junto con el núcleo del modelo base. La adaptación al ruso se realizó mediante un LoRA cuyo perfil es `backbone`, posteriormente fusionado en el checkpoint completo en FP32. El modelo base de entrenamiento es CKermit/FireRedTTS3-Base, cuyo template de empaquetado se fijó en el commit `53f8b59c3252f15d539a9205fbcab3e334a36b9f`, verificado como idéntico al base local usado por el adaptador.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La validación de la fusión comprobó las salidas de las capas PEFT antes y después del merge, la inmutabilidad de los tensores congelados, cada tensor del núcleo guardado y el tokenizer efectivo. El autor advierte explícitamente de que esto no constituye una prueba de paridad end-to-end en GPU con SGLang, y que la precisión en tiempo de ejecución y los ajustes de generación pueden alterar la salida respecto al pipeline de inferencia de entrenamiento. No se publican el audio de entrenamiento, las grabaciones de referencia, el estado del optimizador ni credenciales.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso con salida de audio mono a 24 kHz.
- Clonación de voz zero-shot a partir de una única grabación de referencia, especificando `audio_path` y el texto real de la referencia.
- Fusión de LoRA en el checkpoint, por lo que no necesita adaptador separado en el servicio.
- Servicio mediante SGLang Omni con el endpoint `/v1/audio/speech` y configuración `firered_tts3_base.yaml`.
- Soporte de streaming y ajustes de generación según el cookbook de la integración (no detallados en la información disponible).
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio de entrada más allá de la referencia de clonación.
- Capacidad multilingüe limitada al ruso en esta adaptación.

## Casos de uso

- **Clonación de voz para doblaje y localización al ruso**: el modelo permite generar locuciones con la identidad vocal de un hablante concreto a partir de una referencia, útil para adaptar contenido audiovisual manteniendo coherencia de voz entre segmentos.
- **Generación de audiolibros y contenido narrado**: con entradas de hasta 400 caracteres por petición, se pueden sintetizar fragmentos sucesivos de un texto largo encadenando llamadas al endpoint `/v1/audio/speech`.
- **Asistentes de voz en ruso**: integración en pipelines de atención al cliente o asistentes conversacionales que requieran respuestas habladas con una voz corporativa consistente, sirviendo el modelo con SGLang Omni.
- **Prototipado de interfaces de voz**: desarrollo de demos y pruebas de concepto de aplicaciones de voz en ruso gracias a la licencia Apache-2.0 y a la disponibilidad de un checkpoint listo para servir sin adaptadores.
- **Accesibilidad**: conversión de texto a voz para lectores de pantalla o sistemas de asistencia dirigidos a usuarios rusoparlantes, con la posibilidad de personalizar la voz mediante referencias.
- **Investigación en clonación de voz y evaluación de TTS**: base para experimentos de similitud de hablante y WER en ruso, dado que el autor publica deltas de métricas y el `export_provenance.json` con hashes y IDs de scorer.
- **Generación de avisos y mensajes automatizados**: síntesis de anuncios, notificaciones o mensajes de sistema en ruso con una voz estable y reproducible.

## Benchmarks y rendimiento

La información proporcionada incluye una evaluación comparativa del pipeline independiente antes de la fusión, con 12 casos y 4 hablantes. Los valores son diferencias absolutas de métrica frente a la línea base suministrada, no porcentajes de calidad perceptiva, y no se midieron en SGLang ni sobre el checkpoint fusionado.

| Métrica | Delta medio | Peor media por hablante |
|---|---|---|
| Similitud de hablante | -0,00008626 | -0,00382211 |
| WER | 0,00000000 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de síntesis de voz. El autor advierte de que un benchmark tan pequeño no establece paridad general en clonación de voz ni en prosodia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Como referencia orientativa, un checkpoint FP32 de 2,12 mil millones de parámetros ocupa aproximadamente 8,5 GB solo en pesos, a los que se suman los activos de RedAE, CAM++ y las cachés de inferencia; el repositorio completo ocupa 12,3 GB.
- **GPU recomendadas**: no disponibles en la información proporcionada. El ejemplo de servicio usa `CUDA_VISIBLE_DEVICES=0` con una única GPU, sin especificar modelo.
- **Compatibilidad con GPU de consumo**: no confirmada. Por tamaño de pesos, es plausible en GPUs con 16 GB o más de VRAM, pero no hay dato oficial que lo respalde.
- **Opciones de despliegue**: SGLang Omni con soporte de FireRedTTS3 (PR #3005, revisión `718b51d52a2cffe2218f9c6a1ae076756eb8a505`). Instalaciones más antiguas de SGLang/Omni no soportan este modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Clonación zero-shot | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| FireRedTTS3-Base-Russian (este) | 2,12 mil millones | ruso | Apache-2.0 | Sí (RedAE + CAM++) | safetensors FP32 | Hugging Face, SGLang Omni |
| CKermit/FireRedTTS3-Base | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| FireRedTeam/FireRedTTS3 | no disponible | no disponible | Apache-2.0 (según el paquete) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- **Validación incompleta**: la comprobación de la fusión no es una prueba de paridad end-to-end en GPU con SGLang; la precisión en tiempo de ejecución y los ajustes de generación pueden cambiar la salida respecto al pipeline de entrenamiento.
- **Evaluación muy reducida**: 12 casos y 4 hablantes, con deltas absolutos y no porcentajes de calidad; no establece paridad general en clonación de voz ni prosodia.
- **Idioma único**: la adaptación está orientada exclusivamente al ruso; no se garantiza un comportamiento correcto en otros idiomas.
- **Límite de entrada**: la API inspeccionada limita el texto de entrada a 400 caracteres, lo que obliga a fragmentar textos largos.
- **Dependencia de SGLang Omni**: requiere una revisión concreta del PR #3005; versiones anteriores no funcionan con este modelo.
- **Riesgo de uso indebido de la clonación de voz**: la clonación zero-shot permite imitar voces a partir de una referencia, con implicaciones éticas y legales (suplantación, consentimiento del hablante) que deben gestionarse en producción.
- **Riesgo de alucinación y artefactos**: no se documentan métricas de naturalidad o prosodia más allá de similitud de hablante y WER; es esperable la presencia de artefactos en entradas fuera de distribución, aunque no se cuantifica.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Licencia**: Apache-2.0 permite uso comercial, pero el paquete contiene pesos modificados y conserva la atribución upstream en `UPSTREAM_MODEL_CARD.md`; debe revisarse dicha atribución antes de redistribuir.
- **Metadatos**: el modelo no registra descargas ni likes en el momento de la ficha, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shustov-te/FireRedTTS3-Base-Russian
- Modelo base de empaquetado: https://huggingface.co/CKermit/FireRedTTS3-Base
- Modelo original: https://huggingface.co/FireRedTeam/FireRedTTS3
- Integración SGLang Omni (PR #3005): https://github.com/sgl-project/sglang-omni/pull/3005
