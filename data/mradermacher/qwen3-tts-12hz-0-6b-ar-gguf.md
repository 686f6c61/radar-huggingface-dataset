# mradermacher/Qwen3-TTS-12Hz-0.6B-ar-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-ar-GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz (TTS) MahmoudIbrahim/Qwen3-TTS-12Hz-0.6B-ar, un modelo de la familia Qwen3-TTS especializado en clonación de voz y generación de audio a partir de texto. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema GGUF, y permite ejecutar el modelo en entornos con llama.cpp y herramientas compatibles, algo que el modelo original en transformers no facilita en hardware modesto.

El modelo cuenta con 602.341.376 parámetros (aproximadamente 0,6 mil millones) y está etiquetado con el sufijo "ar", que en la nomenclatura del modelo base indica una variante de una sola lengua (1-lang). La model card declara soporte para diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano), aunque el identificador sugiere una especialización hacia el árabe. Esta discrepancia entre el tag de idiomas y el nombre del modelo es un punto a verificar antes de usarlo en producción.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo TTS con clonación de voz en local, con cuantizaciones que van desde 0,3 GB (Q2_K) hasta 1,3 GB (f16), lo que lo hace viable en GPUs de consumo e incluso en CPU. La licencia Apache 2.0 facilita su uso comercial, aunque conviene revisar las implicaciones éticas de la clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia Qwen3-TTS, basado en transformer según la librería transformers) |
| Parametros totales | 602.341.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (según tags; el nombre del modelo indica variante "ar") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Por la librería declarada (transformers) y la familia Qwen3-TTS, se trata de un modelo de síntesis de voz basado en transformer, con capacidad de clonación de voz (tag voice-clone) y generación de audio a partir de texto. El sufijo "12Hz" en el nombre hace referencia a la frecuencia de muestreo o tasa de frames del tokenizador de audio, un dato que no se detalla en la model card.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card del repositorio cuantizado es una plantilla estándar de mradermacher que remite al modelo base para los detalles técnicos. La cuantización se ha realizado con cuantizaciones estáticas (static quants) y no se han publicado cuantizaciones ponderadas/imatrix para este modelo en el momento de la consulta.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz (voice-clone), según el tag declarado en el repositorio.
- Generación de audio multilingüe: la model card declara diez idiomas (zh, en, ja, ko, de, fr, ru, pt, es, it).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecución mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión en la información disponible.

## Casos de uso

- Lectura de artículos y documentos en local: el modelo puede convertir texto a voz en un pipeline offline con llama.cpp, adecuado para aplicaciones de accesibilidad que requieren privacidad y no dependen de APIs externas.
- Generación de audiolibros y pódcast: con cuantizaciones Q4_K_M (0,5 GB) el modelo cabe en cualquier GPU de consumo, lo que permite procesar lotes de texto largos en una estación de trabajo sin coste por token.
- Clonación de voz para doblaje y localización: el tag voice-clone sugiere la capacidad de replicar una voz de referencia, útil para doblar contenido a los diez idiomas declarados; requiere validar la calidad por idioma.
- Asistentes de voz embebidos: al ocupar menos de 1 GB en Q8_0 (0,7 GB), es viable integrarlo en dispositivos con recursos limitados o en contenedores de bajo coste.
- Prototipado rápido de interfaces de voz: la disponibilidad de múltiples cuantizaciones permite iterar desde Q2_K (0,3 GB) en CPU hasta f16 (1,3 GB) en GPU para evaluar la calidad antes de fijar la versión de producción.
- Generación de avisos y mensajes automatizados: para sistemas de atención telefónica o notificaciones, el modelo puede sintetizar mensajes cortos con baja latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,3 GB (Q2_K) y 1,3 GB (f16) solo para los pesos; hay que sumar el overhead del runtime (llama.cpp) y los buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones pequeñas; RTX 3060, RTX 4060 o superiores para las cuantizaciones mayores con margen.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: llama.cpp (formato nativo), herramientas compatibles con GGUF y, para el modelo base, transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-ar-GGUF (este) | 602 M | no disponible | 10 declarados | Apache 2.0 | GGUF |
| Qwen3-TTS-12Hz-0.6B-ar (base) | 602 M | no disponible | 10 declarados | Apache 2.0 | safetensors |
| Otros modelos TTS de ~0,5-1 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card del repositorio cuantizado es una plantilla genérica; no documenta sesgos, calidad por idioma ni limitaciones específicas del modelo.
- Discrepancia entre el nombre del modelo ("ar") y los idiomas declarados (zh, en, ja, ko, de, fr, ru, pt, es, it): conviene verificar el comportamiento real en árabe y en el resto de idiomas antes de confiar en la cobertura multilingüe.
- Riesgo de alucinación o artefactos en el audio generado, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S); se recomienda Q4_K_M o superior para producción.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); la licencia Apache 2.0 no exime del cumplimiento de la normativa aplicable sobre voz y datos personales.
- No se han publicado cuantizaciones ponderadas/imatrix para este modelo, lo que puede limitar la calidad en cuantizaciones pequeñas frente a otras variantes.
- El modelo tiene 0,6 B parámetros; la calidad de síntesis será inferior a la de modelos TTS de mayor tamaño, aunque su huella reducida es su principal ventaja.
- No hay información sobre el contexto máximo ni sobre el rendimiento en textos largos.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Qwen3-TTS-12Hz-0.6B-ar-GGUF
- Modelo base: https://huggingface.co/MahmoudIbrahim/Qwen3-TTS-12Hz-0.6B-ar
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3-TTS-12Hz-0.6B-ar-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
