# Oulasong/ThunderTalk-ASR-0.6B

## Resumen

ThunderTalk ASR 0.6B es un modelo de reconocimiento automático del habla (ASR) especializado en dictado en chino, inglés y habla mixta chino-inglés (code-switching). Lo desarrolla Oulasong como modelo por defecto de ThunderTalk, una aplicación gratuita de entrada por voz para macOS, y está afinado a partir de Qwen/Qwen3-ASR-0.6B. Su propósito es ofrecer dictado de baja latencia en Macs con Apple Silicon y 16 GB de memoria o más, ejecutándose en la GPU del equipo mediante MLX.

El modelo mantiene la arquitectura del Qwen3-ASR-0.6B original (encoder de audio más decoder de texto) pero incorpora una cuantización mixta: el decoder de texto está en 8 bits y el encoder de audio permanece en float16, lo que da un repositorio de 1,2 GB. Según la model card, esta cuantización reduce el tiempo por token de salida de 36 ms a 12 ms (unas 3 veces más rápido) manteniendo o mejorando la precisión en la mayoría de subconjuntos de su conjunto de prueba.

Es relevante ahora porque demuestra que un modelo ASR pequeño (397,8 millones de parámetros reales en safetensors) puede superar a su base en errores de token en dictado real, especialmente en habla mixta chino-inglés, un escenario habitual en entornos bilingües. Su licencia, sin embargo, es restrictiva para uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder de texto), ejecutada con MLX |
| Parametros totales | 397.819.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decoder de texto en 8 bits; encoder de audio en float16 |
| Idiomas soportados | Chino (zh), inglés (en) y habla mixta chino-inglés |
| Licencia | thundertalk-model-license (uso personal, educativo, investigación y no comercial; condiciones específicas para empresas) |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-0.6B, un sistema ASR compuesto por un encoder de audio y un decoder de texto. ThunderTalk ASR 0.6B es un fine-tuning de ese modelo base seguido de una cuantización selectiva: el decoder de texto se cuantiza a 8 bits y el encoder de audio se mantiene en float16. El resultado se distribuye en formato safetensors para su carga con MLX en la GPU de Macs Apple Silicon.

Los datos de fine-tuning incluyen los conjuntos ASCEND (CC BY-SA 4.0) y FLEURS (CC BY 4.0), según la model card. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la cuantización mixta orientada a latencia: al decodificar token a token, los pesos en 8 bits reducen a la mitad la lectura de memoria por token, lo que explica la mejora de 36 ms a 12 ms por token de salida.

## Capacidades

- Reconocimiento automático del habla en chino, inglés y habla mixta chino-inglés (code-switching).
- Dictado en tiempo real: la model card indica que la vista previa en vivo se mantuvo al día hasta el final de las 8 grabaciones largas del conjunto de prueba.
- Transcripción de audio corto (clips breves) y largo (grabaciones de 1,1 a 4,4 minutos en el conjunto de prueba).
- Normalización de mayúsculas, puntuación, numerales y muletillas en la evaluación (la métrica se define sobre caracteres CJK y palabras latinas).
- Ejecución en GPU de Apple Silicon mediante MLX, integrada en la aplicación ThunderTalk 1.14.3 y posteriores.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Dictado por voz en macOS: la aplicación ThunderTalk carga el modelo en la GPU del Mac y transcribe la voz del usuario en chino, inglés o mezcla de ambos; es su modelo por defecto en equipos con 16 GB o más.
- Entrada de texto bilingüe en editores y chats: adecuado para usuarios que alternan chino e inglés en la misma frase, escenario en el que el modelo reduce el error de token del 16,1 % al 14,7 % frente a su base en clips cortos mixtos.
- Transcripción de notas de voz y reuniones cortas: con grabaciones de 1,1 a 4,4 minutos en el conjunto de prueba, el modelo mantiene la vista previa en vivo, lo que lo hace útil para dictado de notas extensas.
- Subtitulado o transcripción de material en inglés: en clips cortos de inglés baja el error del 20,2 % al 17,2 % respecto al modelo base, por lo que sirve para transcribir audio en inglés con calidad aceptable.
- Herramientas de accesibilidad: dictado local sin enviar audio a la nube, ejecutado en el propio Mac, útil para usuarios con movilidad reducida o en entornos con requisitos de privacidad.
- Investigación en ASR y code-switching: al estar disponible en safetensors y MLX con licencia para investigación, permite reproducir y comparar el efecto de la cuantización mixta en modelos ASR pequeños.
- Prototipos de aplicaciones de voz para equipos pequeños: empresas de menos de 250 empleados y menos de 10 millones de dólares de ingresos anuales pueden integrarlo dentro de la app ThunderTalk según la licencia.

## Benchmarks y rendimiento

Tasa de error de token (caracteres CJK y palabras latinas; mayúsculas, puntuación, numerales y muletillas normalizados) sobre el conjunto de prueba estándar de ThunderTalk: 44 grabaciones con transcripciones de referencia humana, decodificadas por la ruta de dictado de la app en un M3 Max. Menor es mejor.

| Conjunto | Qwen3-ASR-0.6B | ThunderTalk ASR 0.6B |
|---|---|---|
| Todos | 8,7 % | 8,0 % |
| Chino corto | 6,9 % | 6,3 % |
| Inglés corto | 20,2 % | 17,2 % |
| Mixto chino-inglés corto | 16,1 % | 14,7 % |
| Chino largo (1,7–4,4 min) | 5,6 % | 4,4 % |
| Mixto largo (1,1–3,1 min) | 11,4 % | 10,8 % |
| Inglés largo (1,6–2,9 min) | 8,0 % | 8,5 % |
| Conjunto de desarrollo (108 clips cortos) | 11,0 % | 10,1 % |
| Tiempo por token de salida | 36 ms | 12 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech, etc.) en la información disponible. La model card advierte que los clips cortos de prueba provienen de particiones de test de corpus públicos similares a los datos de entrenamiento, por lo que la mejora esperada en habla distinta será menor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 1,2 GB; se necesita margen adicional para el runtime MLX y el audio en proceso. La app requiere Macs Apple Silicon con 16 GB o más.
- GPU recomendadas: Apple Silicon (la model card cita un M3 Max para las mediciones). No se documentan requisitos ni rendimiento en GPU NVIDIA (A100, H100, RTX 4090).
- Cabe en GPU de consumo: sí, en Macs Apple Silicon con 16 GB o más de memoria unificada; no se indica compatibilidad con GPU de consumo NVIDIA.
- Opciones de despliegue: MLX y la aplicación ThunderTalk 1.14.3 o posterior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12 ms por token de salida en M3 Max, frente a 36 ms del modelo base en float16; la vista previa en vivo se mantuvo al día en las 8 grabaciones largas del conjunto de prueba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Rendimiento ASR |
|---|---|---|---|---|---|---|
| ThunderTalk ASR 0.6B | 397,8 M | no disponible | zh, en, mixto | thundertalk-model-license (restrictiva) | safetensors (MLX) | 8,0 % error de token (conjunto propio) |
| Qwen3-ASR-0.6B | no disponible en la información | no disponible | no disponible en la información | Apache 2.0 | no disponible en la información | 8,7 % error de token (conjunto propio) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base Qwen3-ASR-0.6B, sobre el que ThunderTalk mejora en todos los subconjuntos salvo en inglés largo (8,5 % frente a 8,0 %). No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: no evaluado específicamente; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- Limitaciones de idioma: solo chino, inglés y mezcla chino-inglés; no se documenta soporte para otras lenguas.
- Limitaciones de contexto: la longitud de contexto no está disponible; el conjunto de prueba cubre grabaciones de hasta 4,4 minutos, sin datos sobre audios más largos.
- Licencia restrictiva: el uso comercial está limitado a empresas con menos de 250 empleados y menos de 10 millones de dólares de ingresos anuales dentro de la app ThunderTalk; el uso comercial más amplio, el servicio alojado, la API o la redistribución comercial requieren licencia escrita (song@entropinia.com).
- Atribución obligatoria: hay que acreditar a ThunderTalk al compartir el modelo o productos derivados.
- Dependencia de plataforma: está empaquetado para MLX y Apple Silicon; no se documenta su uso en otros entornos de inferencia.
- Caveat de evaluación: los clips cortos de prueba se parecen a los datos de entrenamiento, por lo que la ganancia frente al modelo base puede ser menor en habla real distinta.
- Rendimiento inferior al base en inglés largo (8,5 % frente a 8,0 % de error de token).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oulasong/ThunderTalk-ASR-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de la aplicación ThunderTalk: https://github.com/realAllenSong/ThunderTalk
- Dataset ASCEND: https://huggingface.co/datasets/CAiRE/ASCEND
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Licencia del modelo: LICENSE (incluida en el repositorio de Hugging Face)
- Licencia del modelo base Qwen: LICENSE-Qwen (incluida en el repositorio de Hugging Face)
