# haex-space/pocket-tts-sherpa-onnx

## Resumen

Pocket TTS para sherpa-onnx en seis idiomas es una distribución de los pesos de Pocket TTS de Kyutai convertidos a formato ONNX y empaquetados para que el motor Pocket TTS de sherpa-onnx 2.0 los cargue sin modificaciones. El repositorio lo mantiene el usuario haex-space y deriva del export ONNX de KevinAHM (`KevinAHM/pocket-tts-onnx`), que a su vez parte de los pesos originales de Kyutai. Se trata de un modelo de síntesis de voz (text-to-speech) con clonación de voz por referencia, no de un modelo de lenguaje generativo.

El interés práctico reside en la disponibilidad de un TTS local, multilingüe y ligero, ejecutable mediante sherpa-onnx en entornos sin GPU dedicada y sin dependencias de servicios en la nube. Cubre alemán, inglés, francés, español, italiano y portugués, con un único conjunto de artefactos por idioma y cuantización int8 en la mayoría de componentes. El repositorio ocupa 1,2 GB en total y se distribuye bajo licencia CC BY 4.0.

La contribución técnica concreta de este repositorio es un parche en `encoder.onnx` para los cinco idiomas no ingleses: los bundles multilingües esperan un embedding de inicio aprendido (`bos_before_voice.npy`) que sherpa-onnx 2.0.1 no inserta, lo que provoca que el modelo no detecte el final de frase y genere ruido. El autor lo añade como operación `Concat` dentro del grafo ONNX, de modo que la salida del encoder ya lo incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai (flow matching sobre representaciones Mimi; componentes LM flow, LM main, encoder Mimi, decoder Mimi y text conditioner) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en `lm_flow`, `lm_main` y `decoder`; `encoder.onnx` y `text_conditioner.onnx` sin cuantizar en el nombre del fichero |
| Idiomas soportados | aleman (de), ingles (en), frances (fr), espanol (es), italiano (it), portugues (pt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (un directorio por idioma con `lm_flow.int8.onnx`, `lm_main.int8.onnx`, `encoder.onnx`, `decoder.int8.onnx`, `text_conditioner.onnx`, `vocab.json`, `token_scores.json`) |

## Arquitectura y entrenamiento

Pocket TTS es un sistema de síntesis de voz de Kyutai construido sobre el códec neuronal Mimi, con un modelo de lenguaje que opera sobre las representaciones latentes de audio y un decoder que las reconstruye. La inferencia se organiza en cinco grafos ONNX: `lm_flow` y `lm_main` (el modelo generativo), `encoder` (codificador Mimi de la voz de referencia), `decoder` (decodificador Mimi) y `text_conditioner` (codificación del texto de entrada). No hay voces preentrenadas integradas: la clonación se realiza pasando una grabación corta de referencia como `GenerationConfig.reference_audio` en sherpa-onnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card del repositorio no los detalla. La innovación destacable de esta distribución es la corrección del encoder para los bundles multilingües: se añade el embedding `bos_before_voice` mediante un `Concat` delante de la salida de `mimi_encoder_int8.onnx`, con un script reproducible (`tools/add_bos_before_voice.py`) que produce ficheros idénticos byte a byte y que se ha propuesto upstream en k2-fsa/sherpa-onnx#4148. El bundle francés solo existe en variante de 24 capas (`french_24l`), a diferencia del resto.

## Capacidades

- Síntesis de voz a partir de texto en seis idiomas: alemán, inglés, francés, español, italiano y portugués.
- Clonación de voz zero-shot mediante audio de referencia corto, sin necesidad de fine-tuning.
- Ejecución local e íntegra en CPU a través de sherpa-onnx, sin llamadas a servicios externos.
- Integración directa con el motor `OfflineTtsPocketModelConfig` de sherpa-onnx 2.0.
- Carga por idioma independiente: cada carpeta contiene un conjunto completo de artefactos.
- Verificación de integridad mediante hashes SHA-256 publicados por fichero.
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de un LLM; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz de documentos y artículos: el modelo convierte texto plano en audio en el idioma correspondiente, con la posibilidad de fijar una voz de referencia concreta para mantener consistencia entre fragmentos.
- Asistentes de voz locales: al ejecutarse sobre sherpa-onnx en CPU, encaja en aplicaciones de escritorio o embebidas que necesitan salida hablada sin conexión, como el propio HaexVault, que lo emplea para salida de voz local.
- Accesibilidad para personas con discapacidad visual: narración de interfaces y contenidos en español, alemán, francés, italiano o portugués con una voz personalizada clonada a partir de una muestra del usuario o de un locutor autorizado.
- Generación de audiolibros y pódcast: la clonación por referencia permite mantener un timbre de voz estable a lo largo de capítulos largos, procesando el texto por lotes con el mismo `reference_audio`.
- Doblaje y localización de vídeo: al cubrir seis idiomas con el mismo pipeline, se puede generar pista de voz para cada mercado partiendo del guion traducido y de una muestra del actor original.
- Sistemas de atención al cliente telefónica: síntesis de respuestas en tiempo real en el servidor, con voces corporativas clonadas y sin coste por carácter asociado a APIs comerciales.
- Prototipado de interfaces conversacionales: sustitución de TTS en la nube por este modelo durante el desarrollo, gracias a que el formato ONNX y sherpa-onnx simplifican el despliegue en contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo ONNX int8 ejecutable en CPU, no requiere GPU dedicada.
- GPU recomendadas: no disponible; el diseño de sherpa-onnx está orientado a CPU y a dispositivos de borde.
- Cabe en GPU consumer: sí, en la práctica cualquier GPU con soporte ONNX Runtime puede ejecutarlo, aunque no es el escenario objetivo.
- Opciones de despliegue: sherpa-onnx 2.0 o superior (versión 2.0.1 requiere el parche de encoder incluido en este repositorio para los idiomas no ingleses), con el motor `OfflineTtsPocketModelConfig`; también es posible cargar los grafos ONNX directamente con ONNX Runtime.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: 1,2 GB para el repositorio completo con los seis idiomas; cada carpeta de idioma puede desplegarse de forma independiente.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Clonación de voz | Notas |
|---|---|---|---|---|---|---|
| haex-space/pocket-tts-sherpa-onnx | TTS flow matching sobre Mimi | de, en, fr, es, it, pt | CC BY 4.0 | ONNX (sherpa-onnx) | Sí, por audio de referencia | Parche de encoder para sherpa-onnx 2.0.1; francés solo en 24 capas |
| kyutai/pocket-tts | TTS flow matching sobre Mimi | no disponible en la información | CC BY 4.0 | pesos originales | Sí | Modelo base de Kyutai |
| KevinAHM/pocket-tts-onnx | TTS flow matching sobre Mimi | de, en, fr, es, it, pt | CC BY 4.0 | ONNX | Sí | Export ONNX sin el parche de BOS; base directa de este repositorio |
| Piper (rhasspy) | TTS neuronal ligero | múltiples | MIT | ONNX | No | Alternativa habitual en sherpa-onnx, sin clonación de voz |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es incorrecta.
- Requiere un audio de referencia para cada síntesis; sin él no hay voz disponible, ya que Pocket TTS no incluye voces preentrenadas.
- Los bundles multilingües fallan en sherpa-onnx 2.0.1 sin el parche de `encoder.onnx` incluido aquí: el modelo no detecta el final de frase y emite ruido.
- El bundle francés solo existe en variante de 24 capas, por lo que su calidad o comportamiento puede diferir del resto de idiomas.
- No se han publicado métricas objetivas (MOS, WER, latencia) en la información disponible, lo que impide evaluar la calidad de síntesis de forma cuantitativa.
- Riesgo de artefactos y alucinaciones acústicas en textos con puntuación atípica, números, siglas o mezcla de idiomas; conviene validar con muestras representativas antes de producción.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a Kyutai (pesos), KevinAHM (export ONNX) y este repositorio; hay que conservar el aviso de licencia y los créditos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento más allá de los hashes publicados.
- Los sesgos de voz dependen del audio de referencia empleado; la clonación de voces sin consentimiento del locutor puede tener implicaciones legales y éticas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haex-space/pocket-tts-sherpa-onnx
- Modelo base del export ONNX: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Pesos originales de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de Pocket TTS de Kyutai: https://github.com/kyutai-labs/pocket-tts
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de conversión de tokenizer: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/pocket-tts
- Pull request upstream del parche de encoder: https://github.com/k2-fsa/sherpa-onnx/pull/4148
- HaexVault, aplicación que lo utiliza: https://github.com/haex-space/haex-vault
