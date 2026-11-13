# CMSManhattan/JiRackGemma-37B-alpha-GGUF

## Resumen

JiRack Gemma 37B es un modelo de lenguaje de 37.000 millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko) a partir de un modelo Gemma de Google DeepMind, al que se le ha modificado la arquitectura y los pesos para adaptarlo a la arquitectura propietaria JiRack. Esta publicación corresponde a la fase **alpha**: contiene la arquitectura y los pesos a tamaño completo, pero **antes de cualquier entrenamiento propio del autor**. El modelo reproduce las salidas del Gemma original y no responde mejor que él; la capacidad adicional está presente para ser entrenada en fases posteriores.

El interés técnico reside en la arquitectura JiRack, en la que cada capa lineal es una BitLinear con un conmutador ternario (lambda). En esta alpha, lambda = 0, por lo que los pesos permanecen a precisión completa; el objetivo a largo plazo es el entrenamiento ternario (lambda de 0 a 1) para obtener modelos que se ejecuten desde archivos mucho más pequeños. La distribución se realiza exclusivamente en formato GGUF para llama.cpp, con tres cuantizaciones publicadas (Q8_0, Q4_K_M y Q2_K).

La relevancia actual es limitada como modelo utilizable en producción: se trata de un artefacto de evaluación para socios, con licencia propietaria y sin datos de benchmarks de capacidad. Su valor está en la verificación de integridad del checkpoint (1.188 tensores auditados, logits idénticos al modelo fuente) y en servir de base para las siguientes fases del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma, modificado con arquitectura JiRack (capas lineales BitLinear con conmutador ternario lambda) |
| Parámetros totales | 37,0B en el checkpoint; 36.395.045.436 en el modelo de lenguaje |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones configuradas; las comprobaciones se hicieron con ventanas de 512 tokens |
| Tipos de cuantización | Q8_0, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (propietaria); el Gemma de origen es Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de 60 capas organizadas en grupos de 6: cinco capas de ventana deslizante (ventana de 1.024 tokens) y una capa global por grupo. El tamaño oculto es de 5.376 y el FFN de 27.392. La atención emplea 32 cabezas de consulta; las capas deslizantes tienen 16 cabezas clave-valor con dimensión de cabeza 256, mientras que las capas globales usan 4 cabezas clave-valor con dimensión 512. El vocabulario es de 262.144 tokens.

La modificación propia respecto a Gemma es la arquitectura JiRack: cada capa lineal es una BitLinear con un conmutador ternario (lambda). En esta alpha lambda = 0, de modo que los pesos son de precisión completa y el modelo es funcionalmente equivalente al Gemma de origen en cuanto a salidas. No se ha realizado entrenamiento propio: la model card indica explícitamente que el modelo reproduce los resultados del Gemma fuente y que el entrenamiento (texto general, código y matemáticas; fine-tuning para tool calling y agentes; entrenamiento ternario con lambda de 0 a 1) es la siguiente fase del proyecto, pendiente de financiación de GPU. El encoder de imagen del checkpoint no forma parte de esta publicación.

## Capacidades

- Generación de texto conversacional, heredada del modelo Gemma de origen.
- Capacidad multilingüe: no documentada en la información disponible; depende del Gemma fuente.
- Tool calling y function calling: no disponible en esta alpha; está en la hoja de ruta como fine-tuning futuro.
- Razonamiento multi-paso y uso como agente: no disponible en esta alpha.
- Capacidades de visión: el encoder de imagen no se incluye en esta publicación.
- Modo thinking: no disponible.
- Ejecución en llama.cpp estándar, tanto en modo CLI conversacional (`-cnv`) como en servidor (`llama-server`).

## Casos de uso

- Evaluación de arquitectura por socios: el modelo sirve para que partners del proyecto verifiquen la corrección del ensamblado de la arquitectura JiRack y la integridad de los pesos antes de las fases de entrenamiento.
- Verificación de pipelines de cuantización: los tres GGUF publicados permiten reproducir las mediciones de KL y perplejidad frente al modelo fuente en Q8_0, útil para validar herramientas de cuantización propias.
- Pruebas de despliegue con llama.cpp: el archivo Q4_K_M (22,14 GB) permite validar integraciones de servidor (`llama-server`) con contexto de hasta 32.768 tokens en una sola GPU de 24-48 GB.
- Investigación sobre modelos ternarios: como paso previo al entrenamiento con lambda de 0 a 1, sirve de referencia de precisión completa para comparar la degradación que introducirá la ternarización.
- Desarrollo de harness de evaluación de tool calling: aunque esta alpha no está entrenada para ello, el autor dispone de un test propio de tool calling (117 casos) usado en sus modelos ternarios de 16B, 8B y 2B, y esta base de 37B es el punto de partida para esa línea.
- Experimentación académica con arquitecturas híbridas de atención local/global: la configuración de 5 capas deslizantes por cada capa global con ventana de 1.024 es un objeto de estudio reproducible en hardware de consumo con Q2_K (13,98 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas mediciones publicadas son de integridad y de cuantización:

| Archivo | KL medio vs fuente | Mismo token top-1 | Perplejidad (fuente: 7531,84) |
|---|---|---|---|
| Q8_0 | -0,000001 | 100,00 % | 7531,84 |
| Q4_K_M | 0,565177 | 77,91 % | 8292,38 |
| Q2_K | 3,112594 | 51,24 % | 2365,98 |

Mediciones adicionales de integridad: los 1.188 tensores del checkpoint fueron auditados con 0 errores; los logits del modelo completo de 60 capas son idénticos bit a bit a los del modelo fuente en 4 prompts, y en las primeras 6 capas en 5 prompts (incluido un texto de 1.723 tokens) con KL máximo 0 y top-1 del 100 %. Las pruebas de cuantización se hicieron en CPU con llama.cpp (commit c6a0ff11a), sobre 3 × 512 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere aproximadamente 38,69 GB; Q4_K_M, unos 22,14 GB; Q2_K, unos 13,98 GB (tamaños de archivo; la VRAM necesaria es algo superior por el contexto y los buffers de cálculo).
- GPU recomendadas: Q4_K_M está pensado para una sola GPU de 24-48 GB (por ejemplo, A100 40 GB, L40S, RTX 4090 24 GB con contexto moderado); Q8_0 requiere 48 GB o más (A100 80 GB, H100); Q2_K puede caber en GPUs de consumo de 16 GB con contexto reducido.
- Cabe en GPU de consumo: sí, con Q2_K en 16 GB y con Q4_K_M en 24 GB ajustando el contexto; el autor indica que Q4_K_M "cabe en una GPU de 24-48 GB".
- Opciones de despliegue: llama.cpp (stock), tanto `llama-cli` como `llama-server`; no se documentan otros runtimes (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. Las mediciones publicadas se hicieron en CPU y no incluyen cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| JiRack Gemma 37B alpha | 37,0B | 262.144 | jirack-proprietary | GGUF | Alpha sin entrenar |
| Gemma de origen (Google DeepMind) | no disponible en la información | no disponible | Apache 2.0 | no disponible | Entrenado y publicado |
| Modelos ternarios JiRack del mismo autor (16B, 8B, 2B) | 16B / 8B / 2B | no disponible | no disponible | GGUF | Publicados; 115/117, 113/117 y 110/117 en el test de tool calling del autor |

No se dispone de datos de benchmarks de capacidad para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: reproduce las salidas del Gemma fuente y no aporta ninguna mejora de capacidad. No debe evaluarse como un modelo de 37B entrenado.
- Licencia propietaria (jirack-proprietary) con todos los derechos reservados: el uso comercial requiere contacto con el autor; el Gemma de origen es Apache 2.0, pero la modificación y los pesos publicados quedan bajo la licencia propietaria.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo fuente.
- Sin soporte de tool calling ni de agentes en esta versión.
- El encoder de imagen no se incluye: no hay capacidades de visión.
- Riesgo de alucinación: no evaluado en la información disponible; al no haber entrenamiento propio ni benchmarks, no hay datos sobre sesgos o tasas de alucinación.
- La perplejidad del archivo Q2_K (2365,98) es inferior a la del modelo fuente (7531,84), lo que indica una degradación severa de la distribución; Q2_K solo es adecuado para una primera inspección, no para uso real.
- Las mediciones de cuantización se hicieron con ventanas de 512 tokens; el comportamiento con contextos largos (hasta 262.144 posiciones configuradas) no está verificado.
- Proyecto en fase alpha con 0 descargas y 0 likes en Hugging Face; soporte y mantenimiento no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackGemma-37B-alpha-GGUF
- Contacto del autor: grabko@cmsmanhattan.com
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
