# mradermacher/LFM3-Omni-2B-i1-GGUF

## Resumen

LFM3-Omni-2B es el primer modelo "omni" de Liquid AI: un unico modelo end-to-end capaz de comprender texto, imagenes, video y audio, y de responder en texto, voz o texto y voz intercalados. Sustituye en un solo artefacto a la combinacion tipica de modelo ASR, modelo vision-lenguaje, LLM y modelo TTS, lo que lo hace especialmente atractivo para despliegue en dispositivo (edge). Segun la documentacion del fabricante, es un modelo no razonador ("non-reasoning model") orientado a conversacion y percepcion multimodal en tiempo real.

La ficha que nos ocupa, `mradermacher/LFM3-Omni-2B-i1-GGUF`, no es el modelo original sino una cuantizacion GGUF publicada por mradermacher a partir de `LiquidAI/LFM3-Omni-2B`. Emplea cuantizaciones ponderadas con imatrix (metodo "i1" del autor) y ofrece un abanico amplio de niveles, desde IQ1_S hasta Q6_K. El repositorio se creo el 8 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

La relevancia de esta publicacion es practica: permite ejecutar un modelo omni de aproximadamente 2B parametros en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en precision completa. No obstante, la informacion disponible sobre el modelo base y sobre estas cuantizaciones es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo omni de Liquid AI; transformer multimodal segun la documentacion del fabricante, sin detalle de capas) |
| Parametros totales | aproximadamente 2B en el modelo base (el campo safetensors del repo GGUF indica 899.013, cifra no representativa de los pesos reales) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (ponderadas con imatrix) |
| Idiomas soportados | 23 idiomas segun los tags del repo GGUF hermano del mismo autor; lista concreta no disponible |
| Licencia | no disponible en esta ficha; el repo hermano del mismo autor referencia la licencia lfm1.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0.0 GB (dato del campo de Hugging Face; no refleja el tamano real de los ficheros) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en los datos proporcionados. La documentacion de Liquid AI lo describe como un modelo omni end-to-end que procesa texto, imagen, video y audio y genera texto y voz, pensado para ejecucion en dispositivo y sin modo de razonamiento explicito. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni el esquema de fusion multimodal.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Respecto a esta publicacion concreta, la model card solo indica que se trata de cuantizaciones ponderadas con imatrix generadas a partir de `LiquidAI/LFM3-Omni-2B`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. No se documenta si se conserva el proyector multimodal (`mmproj`) en el repositorio, aunque la plantilla de la model card incluye un campo `skip_mmproj` que aparece vacio.

## Capacidades

- Comprension multimodal de entrada: texto, imagenes, video y audio en un unico modelo.
- Generacion de salida en texto, en voz (speech-to-speech) o en texto y voz intercalados.
- Funcion como sustituto unificado de pipeline ASR + VLM + LLM + TTS en escenarios de dispositivo.
- Soporte de 23 idiomas segun los tags del repositorio GGUF equivalente del mismo autor (lista no disponible).
- Orientado a conversacion en tiempo real y aplicaciones de borde por su tamano reducido.
- Modelo no razonador: no se documenta modo "thinking" ni cadena de pensamiento extendida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo puede recibir audio del microfono y responder con voz sintetizada en una sola pasada, eliminando la latencia de encadenar ASR, LLM y TTS en moviles, portatiles o hardware embebido.
- Descripcion de imagenes para accesibilidad: integrado en aplicaciones de lectura de pantalla, puede tomar una imagen y generar una descripcion hablada, combinando percepcion visual y sintesis de voz en el mismo modelo.
- Analisis de video en local: para resumenes hablados o etiquetado de clips cortos en herramientas de edicion o archivo personal, sin enviar el material a la nube.
- Transcripcion y respuesta conversacional: en entornos con requisitos de privacidad (sanidad, legal, industria), un unico modelo GGUF ejecutado localmente puede transcribir y contestar sin exponer datos.
- Interfaces conversacionales para automocion o robotica de bajo consumo: la ejecucion via llama.cpp permite desplegar en CPU o GPU integrada, con respuestas de voz para interaccion manos libres.
- Prototipado rapido de aplicaciones multimodales: las cuantizaciones IQ2/IQ3 permiten probar el modelo en portatiles con poca VRAM antes de decidir un despliegue mayor.
- Traduccion hablada en 23 idiomas: util en aplicaciones de viaje o atencion multilingue, siempre que se valide la calidad real por idioma, dado que no se publica evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de aproximadamente 2B parametros, las cuantizaciones Q4_K_M rondarian los 1,5-2 GB de pesos; IQ2/IQ3 quedarian por debajo de 1,5 GB; Q6_K se acercaria a 2,5 GB. Son estimaciones por tamano de parametros, no cifras publicadas para este modelo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) deberia poder alojar las cuantizaciones intermedias; para Q6_K se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 4-8 GB, aunque el componente de audio y vision puede anadir requisitos no documentados.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 2B y no razonador, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B (esta ficha, GGUF) | ~2B | no disponible | texto, imagen, video, audio; salida texto y voz | no disponible (lfm1.0 en repo hermano) | GGUF |
| Qwen2.5-Omni-3B / 7B | 3B / 7B | no disponible en esta ficha | texto, imagen, audio, video; salida texto y voz | no disponible en esta ficha | safetensors, GGUF de terceros |
| MiniCPM-o 2.6 | ~8B | no disponible en esta ficha | texto, imagen, audio, video; salida texto y voz | no disponible en esta ficha | safetensors, GGUF de terceros |

La comparativa se limita a la categoria de modelos omni de pequeno tamano; los datos de contexto, licencia y rendimiento de los alternativas no se han verificado en la informacion proporcionada y deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- No hay informacion publicada sobre sesgos del modelo base ni sobre evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos generativos; sin benchmarks no es posible cuantificarlo.
- Modelo no razonador: no es adecuado para tareas que requieran cadena de pensamiento larga o razonamiento matematico complejo.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; en modelos multimodales el impacto sobre audio y vision suele ser mayor que en texto.
- No se confirma que el repositorio incluya el proyector multimodal necesario para las entradas de imagen, video y audio; conviene verificar los ficheros antes de desplegar.
- La licencia no esta indicada en esta ficha; el repo hermano del mismo autor referencia lfm1.0, que puede imponer restricciones al uso comercial. Verificar antes de produccion.
- El campo de parametros del repo (899.013) no es fiable y no debe usarse para dimensionar hardware.
- El repositorio no registra descargas ni likes, por lo que no hay validacion comunitaria de la calidad de las cuantizaciones.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/mradermacher/LFM3-Omni-2B-i1-GGUF
- Repositorio GGUF equivalente del mismo autor: https://huggingface.co/mradermacher/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentacion oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
