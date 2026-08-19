# AMAImedia/Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4

## Resumen

El modelo AMAImedia/Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4 es una cuantización AWQ INT4 del modelo de síntesis de voz (TTS) FINAL-Bench/Darwin-TTS-1.7B-Cross, desarrollado por AMAImedia como parte de la plataforma profesional de doblaje multilingüe NOESIS. El modelo base es un *merge* (no un fine-tuning) que combina un 3% de los pesos de las capas feed-forward (FFN) del LLM Qwen3-1.7B con el backbone *talker* de Qwen3-TTS-12Hz-1.7B-Base, lo que aporta expresividad emocional sin desestabilizar la señal de parada del TTS.

Esta versión cuantizada reduce el uso de VRAM de aproximadamente 3,4 GB (BF16 original) a unos 1,2 GB, lo que permite ejecutar el modelo en GPUs de consumo como la RTX 3060 de 6 GB. La cuantización AWQ INT4 se aplica únicamente a los pesos del *talker* (28 capas), mientras que los módulos auxiliares (code_predictor, speech_tokenizer y encoder/decoder) permanecen en BF16. El modelo soporta clonación de voz cross-lingual mediante embeddings de speaker basados en x-vector y cubre 10 idiomas: inglés, chino, japonés, coreano, alemán, francés, ruso, árabe, hindi y español.

La relevancia de este modelo radica en su capacidad para ejecutar TTS multilingüe con clonación de voz en hardware de bajo coste, manteniendo la licencia Apache 2.0. Está pensado para integrarse en pipelines de doblaje automatizado, asistentes de voz y sistemas de accesibilidad, así como para servir de *teacher* en procesos de destilación de conocimiento (KD) dentro del framework NOESIS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3TTSForConditionalGeneration (talker de 28 capas + code_predictor + speech_tokenizer RVQ 12 Hz + encoder/decoder de audio) |
| Parametros totales | 1.928.677.440 (según safetensors); ~2,1B según la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 (group_size=128, GEMM, zero_point=True) para talker; BF16 para el resto de módulos |
| Idiomas soportados | 10: en, zh, ja, ko, de, fr, ru, ar, hi, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mezcla de tensores AWQ INT4 y BF16) |

## Arquitectura y entrenamiento

El modelo base Darwin-TTS-1.7B-Cross es un *merge* por aritmética de pesos (lerp puro, sin entrenamiento) que combina un 3% de los pesos de las proyecciones gate/up/down de las 28 capas del *talker* de Qwen3-TTS-12Hz-1.7B-Base con los pesos correspondientes de Qwen3-1.7B (LLM). Esta proporción conservadora (α=3%) se eligió porque con α≥10% el patrón de generación del LLM interfiere con la señal de parada del TTS.

La arquitectura se divide en cuatro módulos:

- **talker**: backbone de 28 capas tipo Qwen3 LLM, cuantizado a AWQ INT4.
- **code_predictor**: cabeza de 5 capas con hidden_size=1024, mantenida en BF16.
- **speech_tokenizer**: codec RVQ a 12 Hz, en BF16.
- **encoder/decoder**: pipeline de forma de onda de audio, en BF16.

El speaker encoder usa embeddings x-vector (`x_vector_only_mode=True`) con una tasa de muestreo de 24 000 Hz, lo que permite la clonación de voz cross-lingual: la voz de un hablante en un idioma puede transferirse a otro idioma sin necesidad de datos de entrenamiento adicionales.

La cuantización AWQ fue realizada por AMAImedia con AutoAWQ 0.2.9, calibrando sobre 128 prompts TTS de habla natural (max_seq_len=512) y con semilla RNG fija (1729) para reproducibilidad. Al no existir soporte nativo de AutoAWQ para la arquitectura Qwen3TTSForConditionalGeneration, la cuantización requirió ingeniería interna dentro del framework DHCF-FNO de NOESIS.

## Capacidades

- Síntesis de voz (TTS) multilingüe en 10 idiomas: inglés, chino, japonés, coreano, alemán, francés, ruso, árabe, hindi y español.
- Clonación de voz cross-lingual mediante embeddings x-vector: la voz de un hablante puede transferirse a otro idioma sin entrenamiento adicional.
- Generación de tokens de texto (logits) para extracción de conocimiento (knowledge distillation), útil como *teacher* en pipelines de destilación.
- Compatible con el pipeline completo de TTS de NOESIS que incluye el vocoder NanoCodec para generar la forma de onda final.
- Capacidad de ejecutarse en paralelo con otros especialistas en pipelines de intercambio secuencial de modelos gracias a su bajo consumo de VRAM (~1,2 GB).
- Soporte de generación condicionada por voz de referencia (voice cloning) mediante el modo `x_vector_only_mode`.
- Adecuado para tareas de generación de voz expresiva gracias a la mezcla de pesos FFN del LLM Qwen3-1.7B.

## Casos de uso

- Doblaje automatizado de contenido audiovisual: el modelo permite generar voces en múltiples idiomas manteniendo la identidad vocal del hablante original, lo que lo hace adecuado para plataformas de doblaje profesional como NOESIS.
- Asistentes de voz multilingües: con solo 1,2 GB de VRAM, puede integrarse en sistemas embebidos o en GPUs de consumo para proporcionar síntesis de voz en tiempo real en 10 idiomas.
- Clonación de voz para audiolibros y podcasts: un locutor puede grabar una muestra corta y el modelo genera el resto del contenido en otro idioma con su misma voz.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en múltiples idiomas con voces personalizadas, ejecutable en hardware de bajo coste.
- Destilación de conocimiento (KD) en pipelines de TTS: el modelo actúa como *teacher* generando logits de texto que se usan para entrenar estudiantes más pequeños, como el especialista M3-TTS de NOESIS.
- Prototipado rápido de aplicaciones de voz: gracias a su licencia Apache 2.0 y su tamaño reducido, es adecuado para pruebas de concepto y desarrollo ágil sin necesidad de infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB con cuantización AWQ INT4 (según la model card), frente a ~3,4 GB del modelo BF16 original.
- GPU recomendadas: RTX 3060 de 6 GB (objetivo de diseño), cualquier GPU con al menos 2 GB de VRAM y soporte CUDA; también compatible con GPUs de gama superior (RTX 4090, A100, H100) para mayor throughput.
- Cabe en GPUs de consumo: sí, especialmente en las de 6 GB o más.
- Opciones de despliegue: AutoAWQ (librería de cuantización), transformers con `trust_remote_code=True`, y el pipeline completo de TTS de NOESIS con vocoder NanoCodec.
- Latencia y throughput: no disponibles. La model card no proporciona cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | VRAM | Idiomas | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4 (este) | ~1,93B | AWQ INT4 (talker) + BF16 | ~1,2 GB | 10 | Apache 2.0 |
| FINAL-Bench/Darwin-TTS-1.7B-Cross (base) | ~2,1B | BF16 | ~3,4 GB | 10 | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | BF16 | ~3,4 GB (estimado) | Multilingüe (no especificado) | Apache 2.0 |

La comparativa se limita a características estructurales, ya que no se dispone de datos de rendimiento (MOS, RTF, etc.) para ninguno de los modelos. La principal ventaja de la versión cuantizada es la reducción de VRAM en más de un 60%, manteniendo la misma arquitectura y licencia.

## Limitaciones y advertencias

- La cuantización AWQ INT4 se aplica solo al *talker*; los módulos auxiliares permanecen en BF16, por lo que el ahorro de memoria no es uniforme en todo el modelo.
- La model card advierte que se debe verificar la calidad de salida con el script `validate_awq_quality.py` antes de usarlo como *teacher* en destilación de conocimiento, ya que la cuantización puede introducir degradación.
- El modelo no genera directamente la forma de onda de audio; requiere el pipeline completo de TTS de NOESIS con el vocoder NanoCodec para producir audio final.
- La arquitectura `Qwen3TTSForConditionalGeneration` no está presente en la rama principal de transformers, por lo que es necesario usar `trust_remote_code=True` y puede haber problemas de compatibilidad con versiones futuras.
- No se proporcionan datos de sesgos, alucinaciones ni evaluación de calidad subjetiva (MOS) en la información disponible.
- El modelo es un *merge* sin entrenamiento supervisado específico para TTS; la mezcla de pesos del LLM puede afectar a la estabilidad de la señal de parada en algunos casos, aunque el ratio del 3% se eligió para minimizar ese riesgo.
- Para uso comercial, la licencia Apache 2.0 permite uso libre, pero se recomienda revisar los términos de la plataforma NOESIS y los créditos del framework DHCF-FNO.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-TTS-1.7B-Cross
- Sitio web de AMAImedia: https://www.amaimedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
