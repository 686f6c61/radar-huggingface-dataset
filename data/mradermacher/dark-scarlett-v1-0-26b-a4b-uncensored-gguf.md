# mradermacher/Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF

## Resumen

Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF es una cuantizacion estatica del modelo Dark-Scarlett-v1.0-26B-A4B-Uncensored, publicado por el usuario rakshazi en Hugging Face y convertido a formato GGUF por mradermacher, un perfil conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El nombre indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 000 millones de parametros totales y unos 4000 millones de parametros activos por token (sufijo "A4B"), ademas de una orientacion explicita a contenido sin censura ("uncensored").

La relevancia de esta publicacion es practica: ofrece los pesos del modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0, ademas de f16 e IQ4_XS), lo que permite ejecutarlo en hardware de consumo y en entornos con VRAM limitada sin necesidad de convertir los pesos originales. Al tratarse de una derivacion de un modelo de terceros, la model card es minima y no aporta informacion sobre arquitectura exacta, datos de entrenamiento, licencia ni idiomas soportados.

La informacion disponible es muy escasa: la model card original solo declara que se trata de cuantizaciones estaticas del modelo base de rakshazi y lista los formatos generados. Cualquier dato tecnico adicional debe contrastarse con el repositorio del modelo original, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), segun el sufijo "A4B" del nombre; detalles no disponibles |
| Parametros totales | 26B (aproximado, segun el nombre) |
| Parametros activos | 4B (aproximado, segun el sufijo "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre "26B-A4B" sugiere un transformer con mezcla de expertos (MoE) de aproximadamente 26 000 millones de parametros totales y alrededor de 4000 millones activos por token, un patron habitual en modelos MoE eficientes en inferencia. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas en la informacion proporcionada.

Respecto a esta publicacion concreta, se trata de una conversion a GGUF realizada con la herramienta de cuantizacion de mradermacher (se observa `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf` en los metadatos de la model card). Se ofrecen cuantizaciones estaticas en todos los niveles habituales, sin quantizaciones dinamicas ni variantes con `mmproj` (modulo de vision), lo que sugiere que el modelo base es solo de texto.

## Capacidades

- Generacion de texto: el modelo base esta disenado para tareas de generacion y conversacion, aunque no se detallan capacidades especificas.
- Orientacion "uncensored": el nombre indica que el modelo base ha sido ajustado para reducir rechazos y filtros de contenido, lo que puede afectar a la moderacion en produccion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la ausencia de `mmproj` en las cuantizaciones apunta a que no hay soporte de vision.

## Casos de uso

- Experimentacion con modelos MoE en local: las cuantizaciones Q4_K_M e IQ4_XS permiten probar un MoE de 26B totales y 4B activos en GPUs de consumo, evaluando el equilibrio entre calidad y velocidad antes de invertir en hardware mayor.
- Generacion creativa sin restricciones: el caracter "uncensored" del modelo base lo hace adecuado para escritura de ficcion, narrativa adulta o guiones donde los filtros de seguridad de modelos alineados resultan limitantes, siempre con revision humana del contenido.
- Investigacion sobre alineacion y seguridad: util como contrapunto en estudios comparativos entre modelos censurados y no censurados, midiendo tasas de rechazo, sesgos y calidad en tareas sensibles.
- Prototipado de asistentes conversacionales offline: al estar en GGUF, puede desplegarse con llama.cpp u Ollama en entornos sin conexion o con requisitos de privacidad estrictos.
- Evaluacion de cuantizaciones: la disponibilidad de doce variantes permite estudiar la degradacion de calidad de un MoE segun el nivel de cuantizacion, desde f16 hasta Q2_K.
- Fine-tuning y destilacion experimental: los pesos f16 pueden servir como base para ajustes posteriores o para generar datos sinteticos en dominios donde se requiere baja censura, con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (26B totales, 4B activos):
  - f16: aproximadamente 52 GB.
  - Q8_0: aproximadamente 28 GB.
  - Q6_K: aproximadamente 21-22 GB.
  - Q5_K_M: aproximadamente 18-19 GB.
  - Q4_K_M: aproximadamente 15-16 GB.
  - IQ4_XS: aproximadamente 14-15 GB.
  - Q3_K_M: aproximadamente 12-13 GB.
  - Q2_K: aproximadamente 9-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) para Q6_K y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4_K_M e IQ4_XS; GPUs de 12 GB para Q3_K_M con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y tarjetas de 12-16 GB con cuantizaciones bajas, a costa de perder calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelos sin conversion adicional.
- Latencia y throughput: no disponibles. Al ser MoE con 4B activos, se espera un throughput notablemente superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF | 26B (aprox.) | 4B (aprox.) | no disponible | no disponible | GGUF |
| Modelo base rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored | 26B (aprox.) | 4B (aprox.) | no disponible | no disponible | safetensors (presumiblemente) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- La model card es minima: no hay informacion sobre licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- El caracter "uncensored" implica un mayor riesgo de generar contenido ofensivo, ilegal o danino; requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion no cuantificado por falta de benchmarks publicados.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma significativa; para produccion se recomienda Q4_K_M o superior.
- Al ser una derivacion de un modelo de terceros, la responsabilidad legal sobre los pesos originales y su licencia recae en el autor del modelo base, no en el cuantizador.
- No hay garantia de soporte ni mantenimiento del repositorio (0 descargas y 0 likes en el momento de la consulta).
- La fecha de creacion indicada (2026) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored
- Perfil del cuantizador: https://huggingface.co/mradermacher
