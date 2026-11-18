# Sion971/ACE-Step-v1.5-2B-Base-Turbo-0.3-Merge

## Resumen

ACE-Step-v1.5-2B-Base-Turbo-0.3-Merge es un modelo de generación de música a partir de texto (text2music) obtenido mediante la fusión de pesos de dos modelos DiT de 2B parámetros de la familia ACE-Step 1.5: `acestep-v15-base` (70 %) y `acestep-v15-turbo` (30 %). Lo publica el usuario Sion971 en Hugging Face, con licencia MIT, y es la contrapartida de 2B de una fusión equivalente hecha por Astral01 sobre los modelos XL. El objetivo declarado es combinar el timbre más rico y lleno del modelo Base con la adherencia a la letra del modelo Turbo.

El modelo no introduce arquitectura nueva: es una media ponderada tensor a tensor de dos checkpoints con idéntica estructura (677 tensores con los mismos nombres y formas). La operación se calcula en float32 y se guarda en bfloat16, en un único `model.safetensors` de 4,8 GB. El config, el código y el `silence_latent.pt` provienen del modelo Base, y el config queda marcado con `"is_turbo": false`, por lo que el pipeline lo trata como un modelo Base (con classifier-free guidance y más pasos de muestreo).

Es relevante ahora porque ofrece un punto intermedio práctico entre la calidad del Base y la velocidad del Turbo en el segmento de 2B, que cabe en GPUs de consumo con 8 GB de VRAM mediante streaming por bloques. No obstante, la evidencia publicada se limita a una única prueba subjetiva de escucha y a una medición de tiempos en una sola GPU; no hay benchmarks formales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de ACE-Step 1.5, 677 tensores |
| Parámetros totales | 2.393.872.518 (2,39B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la prueba de escucha usa letra en francés) |
| Licencia | MIT |
| Formato de pesos | safetensors (un único `model.safetensors`, 4,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de ACE-Step 1.5, un Diffusion Transformer (DiT) para generación de audio musical condicionada por texto. Este repositorio concreto no entrena nada: es una fusión lineal de pesos. Cada tensor se calcula como `0,7 × Base + 0,3 × Turbo` en float32 y se serializa en bfloat16. Al conservar el config del Base con `"is_turbo": false`, el modelo se muestrea con classifier-free guidance y un número de pasos propio de un modelo Base, no con el esquema reducido del Turbo.

Los ajustes recomendados por el autor son 24 pasos (50 también funciona), guidance entre 3 y 5, shift 1 y ADG activado. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO para este merge, más allá de los que correspondan a los modelos originales ACE-Step 1.5, que no se detallan en la información disponible.

## Capacidades

- Generación de música a partir de descripciones textuales (text2music), con pipeline `text-to-audio`.
- Generación con letra: el merge busca recuperar la adherencia a la letra que el modelo Base pierde, según la prueba de escucha del autor.
- Extracción de características (`feature-extraction`), según las etiquetas del repositorio.
- Muestreo con classifier-free guidance configurable (guidance 3-5) y control de pasos (24-50).
- Soporte de ADG (según los ajustes recomendados) y de shift.
- Integración con ACE-Step Studio como opción de menú ("Merge Base+Turbo 30%") con botón de descarga.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Producción musical asistida por prompt: generar pistas instrumentales de varios minutos (la medición se hizo con 225 s de música) a partir de descripciones de estilo, usando 24 pasos y guidance 5 como configuración de compromiso entre calidad y tiempo.
- Generación de canciones con letra: el caso central del merge es producir temas donde la letra se pronuncie de forma reconocible, algo que el Base de 2B no lograba en la prueba del autor y que el Turbo sí conseguía con menor cuerpo sonoro.
- Previsualización rápida en estaciones de trabajo locales: con 30,6 s de tiempo de DiT para 225 s de audio en una RTX 5060 de 8 GB, sirve para iterar sobre borradores antes de un render final con el modelo Base a 50 pasos.
- Integración en ACE-Step Studio: seleccionar la carpeta `checkpoints/acestep-v15-merge-base-turbo30` como modelo DiT permite usarlo dentro del flujo de trabajo de la aplicación sin cambios de código.
- Generación de bandas sonoras para prototipos de vídeo o juegos: la licencia MIT facilita incorporar el audio generado a proyectos comerciales sin restricciones adicionales.
- Experimentación con mezclas de checkpoints: al ser una fusión documentada tensor a tensor, sirve como referencia para reproducir y variar la proporción 70/30 sobre los modelos de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor aporta únicamente mediciones de tiempo de inferencia en una RTX 5060 de 8 GB en modo block-streaming, con 225 s de música y la misma semilla:

| Modelo | Ajustes | Tiempo de DiT |
|---|---|---|
| 2B Turbo | 8 pasos, shift 3 | 5,4 s |
| 2B Base | 50 pasos, guidance 7 | 63,4 s |
| Este merge | 24 pasos, guidance 5 | 30,6 s |

A esos tiempos hay que sumar unos 7 s de decodificación de audio en cada caso. La prueba de escucha es de un solo oyente y una sola canción con letra en francés; el autor la describe explícitamente como una prueba única y no como un benchmark.

## Requisitos de hardware

- VRAM: el autor ejecuta el modelo en una RTX 5060 de 8 GB usando modo block-streaming; el peso en bfloat16 es de 4,8 GB, por lo que sin streaming se necesita margen adicional para activaciones y decodificación de audio.
- GPU recomendadas: no se documentan recomendaciones oficiales; la única referencia medida es una RTX 5060 de 8 GB. GPUs de gama alta (A100, H100, RTX 4090) no aparecen evaluadas en la información disponible.
- Cabe en GPU de consumo: sí, al menos en una RTX 5060 de 8 GB con block-streaming.
- Despliegue: biblioteca `transformers` (código custom, `custom_code`), descarga con `huggingface-cli download`, e integración con ACE-Step Studio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30,6 s de DiT más unos 7 s de decodificación para 225 s de audio en la RTX 5060 citada, con 24 pasos y guidance 5.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos típicos | Tiempo DiT (225 s, RTX 5060 8 GB) | Adherencia a letra (prueba del autor) | Licencia |
|---|---|---|---|---|---|
| Este merge (Base+Turbo 30 %) | 2,39B | 24 (guidance 5) | 30,6 s | sí, con un defecto puntual | MIT |
| ACE-Step 1.5 2B Base | 2B (no confirmado en la información) | 50 (guidance 7) | 63,4 s | no | MIT |
| ACE-Step 1.5 2B Turbo | 2B (no confirmado en la información) | 8 (shift 3) | 5,4 s | sí | MIT |
| Ace-Step_v1.5_XL_Base_Turbo_0.3_Merge (Astral01) | no disponible (variante XL) | no disponible | no disponible | comparable en calidad según el autor | MIT |

## Limitaciones y advertencias

- La validación es muy limitada: una sola prueba de escucha, un solo oyente y una sola canción en francés. El autor advierte que los resultados pueden variar con otros estilos e idiomas.
- En esa prueba se detectó una frase duplicada en el penúltimo estribillo; se sugiere probar otra semilla o un guidance más bajo.
- No hay benchmarks objetivos (FAD, CLAP, inteligibilidad de letra) ni comparaciones sistemáticas publicadas.
- Al heredar el config del Base con `"is_turbo": false`, usar los ajustes de Turbo (8 pasos) produciría resultados degradados; hay que respetar los 24-50 pasos y el guidance 3-5.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- El modo block-streaming en GPUs de 8 GB implica latencias mayores que las medidas si no se dispone de esa ruta de ejecución.
- No se documentan sesgos, cobertura de idiomas ni comportamiento con letras en castellano.
- Licencia MIT, sin restricciones comerciales conocidas, pero conviene verificar las condiciones de los modelos originales ACE-Step 1.5 de los que deriva.
- La fecha de creación del repositorio (2026-11-18) es posterior a la de la mayoría de referencias públicas; verificar la vigencia de los enlaces y del código antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Sion971/ACE-Step-v1.5-2B-Base-Turbo-0.3-Merge
- Modelo base 1: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo base 2: https://huggingface.co/ACE-Step/Ace-Step1.5
- Fusión XL de referencia: https://huggingface.co/Astral01/Ace-Step_v1.5_XL_Base_Turbo_0.3_Merge
- ACE-Step Studio: https://github.com/Sion971/ace-step-studio
- Repositorio ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
