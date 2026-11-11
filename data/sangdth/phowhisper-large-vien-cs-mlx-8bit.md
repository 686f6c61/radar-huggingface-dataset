# sangdth/phowhisper-large-vien-cs-mlx-8bit

## Resumen

PhoWhisper-large Vietnamese-English code-switching (MLX, 8-bit) es una conversión y cuantización del modelo de reconocimiento automático del habla (ASR) PhoWhisper-large de VinAI, con el adaptador LoRA de rinhoooo para code-switching vietnamita-inglés fusionado en los pesos base. El resultado se ha convertido al formato MLX para su uso con mlx-whisper sobre Apple Silicon y se ha cuantizado a 8 bits, reduciendo el peso de 2,9 GB a 1,5 GB. El modelo resuelve el problema del reconocimiento de habla vietnamita con incrustaciones de términos en inglés, un patrón habitual en contextos técnicos ("fix cái bug login trong dashboard").

La arquitectura subyacente es Whisper-large, un transformer encoder-decoder con aproximadamente 1.550 millones de parámetros, adaptado al vietnamita por VinAI y posteriormente ajustado mediante LoRA (r=32, alpha=64) para manejar mezcla de idiomas. Esta versión MLX está pensada exclusivamente para inferencia en hardware de Apple; no es un modelo entrenado desde cero, sino una distribución derivada que combina el modelo base, el adaptador y la cuantización.

Su relevancia es práctica: permite ejecutar un ASR especializado en vietnamita con code-switching en portátiles y equipos de sobremesa con chip Apple Silicon, sin GPU dedicada. La licencia CC BY 4.0 del adaptador se hereda en esta fusión, y el modelo base PhoWhisper-large mantiene BSD 3-Clause de VinAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large (transformer encoder-decoder) con adaptador LoRA fusionado |
| Parametros totales | no disponible (Whisper-large ronda 1.550 M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada en la informacion) |
| Tipos de cuantizacion | 8 bits (group size 64); existe variante float16 en el mismo autor |
| Idiomas soportados | vietnamita (vi), ingles (en) con code-switching vi-en |
| Licencia | cc-by-4.0 (adaptador y fusion); PhoWhisper-large base bajo BSD 3-Clause |
| Formato de pesos | MLX (`weights.safetensors` con bloque `quantization` en `config.json`) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos: se partió de `vinai/PhoWhisper-large` (commit `b9136a4`) y se le incorporó el adaptador LoRA `rinhoooo/phowhisper-large-vien-cs-asr` (commit `a98f55e`, r=32, alpha=64), aplicando la fórmula W + (64/32)·B·A sobre cada peso objetivo. Posteriormente se convirtió a MLX con `convert.py` de ml-explore/mlx-examples (commit `796f5b5`) y se cuantizó con `mlx.nn.quantize` (group size 64, 8 bits, mlx 0.32.4).

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento del adaptador, la composición del dataset de code-switching ni si hubo etapas de RLHF o DPO. El autor remite a las model cards de VinAI y del adaptador para esos datos. La innovación técnica destacable es la propia cadena de conversión y cuantización a MLX, que permite ejecutar el modelo en Apple Silicon con una reducción de peso de 2,9 GB a 1,5 GB manteniendo, según el autor, transcripciones idénticas a float16 en una prueba de 12 frases.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita con incrustaciones de términos en inglés.
- Manejo de code-switching vi-en en dominios técnicos (por ejemplo, "fix cái bug login trong dashboard").
- Transcripción de audio a texto con la API de mlx-whisper, indicando el idioma (`language="vi"`).
- Inferencia en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Cuantización 8 bits con fidelidad reportada equivalente a float16 en la prueba del autor.
- No se documentan en la información disponible capacidades de traducción, diarización, tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Transcripción de reuniones técnicas en vietnamita con terminología en inglés: el modelo está ajustado para frases donde se mezclan ambos idiomas, habitual en equipos de desarrollo. Se usaría con `mlx_whisper.transcribe` sobre el audio de la reunión.
- Subtitulado de contenido audiovisual para desarrolladores vietnamitas: vídeos de formación, tutoriales y charlas donde aparecen términos como "pull request" o "deploy" junto a vietnamita.
- Dictado de notas en entornos de desarrollo: transcripción de voz a texto en local sobre un Mac, sin enviar audio a servicios en la nube, gracias a la ejecución MLX en Apple Silicon.
- Procesamiento por lotes de grabaciones de soporte técnico: transcripción de llamadas de atención al cliente en vietnamita con términos técnicos en inglés para su posterior análisis.
- Investigación en ASR y code-switching: el modelo sirve como referencia cuantizada para comparar fidelidad float16 frente a 8 bits en hardware Apple, dado que el autor reporta paridad en 12 frases.
- Prototipado rápido en portátiles: al ocupar 1,5 GB, permite iterar en un MacBook sin GPU dedicada, adecuado para demos y pruebas de concepto de pipelines de voz.
- Archivado y búsqueda de audio: transcripción local de archivos de audio para indexación y búsqueda textual en repositorios personales o corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una prueba puntual de 12 frases con habla vietnamita sintética en la que la salida 8 bits coincidió con la de float16, sin métricas WER/CER ni comparación numérica con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo está pensado para memoria unificada de Apple Silicon. Peso en disco de 1,5 GB en 8 bits frente a 2,9 GB en float16.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente para cargar 1,5 GB de pesos más el overhead de inferencia.
- Cabe en equipos consumer: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, dado el tamano del repo (1,6 GB).
- Opciones de despliegue: mlx-whisper (librería indicada por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sangdth/phowhisper-large-vien-cs-mlx-8bit | no disponible (Whisper-large) | no disponible | vi, en (code-switching) | cc-by-4.0 (base BSD 3-Clause) | MLX 8 bits |
| sangdth/phowhisper-large-vien-cs-mlx-16bit | no disponible (Whisper-large) | no disponible | vi, en (code-switching) | cc-by-4.0 | MLX float16 |
| sangdth/phowhisper-large-mlx-16bit | no disponible (Whisper-large) | no disponible | vi | no disponible | MLX float16 |
| vinai/PhoWhisper-large | no disponible (Whisper-large) | no disponible | vi | BSD 3-Clause | safetensors (PyTorch) |

No se dispone de datos de rendimiento comparado (WER, CER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo derivado y cuantizado: no es un entrenamiento original, sino una fusión y conversión; los méritos del entrenamiento corresponden a VinAI y a los autores del adaptador.
- Dependencia de hardware: el formato MLX solo es compatible con Apple Silicon; no se puede desplegar en GPUs NVIDIA o AMD sin reconversión.
- Idiomas limitados: solo vietnamita e inglés con code-switching; no se documenta soporte para otros idiomas.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos de audio ruidosos o silenciosos; no se han publicado tasas de error.
- Sesgos: no se documentan en la información disponible; dependerán de los datos de entrenamiento de PhoWhisper y del adaptador.
- Licencia: CC BY 4.0 exige atribución a los autores del adaptador y a VinAI; el modelo base PhoWhisper-large es BSD 3-Clause, cuyos términos deben respetarse también.
- Validación limitada: la paridad 8 bits frente a float16 se basa en 12 frases sintéticas, no en un conjunto de evaluación amplio; conviene validar en el dominio propio antes de producción.
- Sin benchmarks públicos: no hay métricas WER/CER publicadas para esta versión, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sangdth/phowhisper-large-vien-cs-mlx-8bit
- Versión float16 con adaptador: https://huggingface.co/sangdth/phowhisper-large-vien-cs-mlx-16bit
- Versión float16 sin adaptador: https://huggingface.co/sangdth/phowhisper-large-mlx-16bit
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
- Adaptador LoRA: https://huggingface.co/rinhoooo/phowhisper-large-vien-cs-asr
- mlx-whisper (PyPI): https://pypi.org/project/mlx-whisper/
- Repositorio mlx-examples (script de conversión): https://github.com/ml-explore/mlx-examples/tree/main/whisper
