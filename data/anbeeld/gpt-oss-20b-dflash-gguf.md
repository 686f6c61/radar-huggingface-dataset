# Anbeeld/gpt-oss-20b-DFlash-GGUF

## Resumen

El repositorio Anbeeld/gpt-oss-20b-DFlash-GGUF contiene cuantizaciones GGUF del modelo z-lab/gpt-oss-20b-DFlash, un modelo auxiliar de drafting (borrador) diseñado para acelerar la inferencia del modelo objetivo openai/gpt-oss-20b mediante decodificación especulativa. Este drafter, con solo 0.8 mil millones de parámetros, emplea una novedosa técnica de difusión por bloques (block diffusion) que permite generar múltiples tokens candidatos en paralelo, reduciendo significativamente la latencia frente a la decodificación autorregresiva tradicional.

El modelo DFlash fue desarrollado por el laboratorio z-lab con soporte computacional de Yotta Labs, y se describe en el artículo "DFlash: Block Diffusion for Flash Speculative Decoding" (arXiv:2602.06036). Se entrena sobre 800.000 muestras procedentes de los datasets Nemotron-Post-Training-Dataset-v2 y evol-codealpaca-v1, con respuestas regeneradas por el propio gpt-oss-20b. Esta versión GGUF, publicada por Anbeeld, está pensada para usarse con BeeLlama.cpp, un fork de llama.cpp con funciones avanzadas de cuantización, y también es compatible con SGLang y vLLM a través de sus respectivas implementaciones de DFlash.

La relevancia de este modelo radica en que permite ejecutar gpt-oss-20b en hardware más modesto o con mayor throughput, ya que el drafter es ligero y puede correr en GPU de consumo. Es una pieza clave para quienes buscan optimizar el despliegue de modelos de razonamiento de código abierto en entornos de producción con requisitos estrictos de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion language model (modelo de difusión por bloques para drafting especulativo) |
| Parametros totales | 0.8B (modelo drafter) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo gpt-oss-20b) |
| Tipos de cuantizacion | No disponibles (el repositorio no especifica los archivos GGUF incluidos) |
| Idiomas soportados | No disponibles (el drafter es agnóstico al idioma; hereda las capacidades del modelo objetivo) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo DFlash se basa en un modelo de difusión por bloques (block diffusion) que actúa como drafter en un esquema de decodificación especulativa. En lugar de predecir un token a la vez, genera un bloque completo de tokens candidatos (típicamente 7 tokens de draft con un tamaño de bloque de 8) de forma paralela. Este enfoque aprovecha la capacidad de los modelos de difusión para muestrear secuencias completas condicionadas al contexto, lo que reduce el número de pasos de verificación necesarios contra el modelo objetivo.

El entrenamiento se realizó con 800.000 muestras extraídas de los datasets nvidia/Nemotron-Post-Training-Dataset-v2 y theblackcat102/evol-codealpaca-v1. Para cada muestra, la parte de respuesta fue regenerada utilizando el modelo objetivo openai/gpt-oss-20b, garantizando que el drafter aprenda a imitar el estilo y la distribución de tokens de dicho modelo. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente supervisado sobre las respuestas generadas.

La innovación técnica principal es la combinación de difusión de bloques con decodificación especulativa, lo que permite alcanzar longitudes de aceptación medias de 4.2 a 5.1 tokens según la tarea, y aceleraciones de extremo a extremo de hasta 2.2× en una sola GPU H200 con SGLang.

## Capacidades

- Generación de tokens candidatos en paralelo para decodificación especulativa (drafting).
- Aceleración de inferencia del modelo objetivo gpt-oss-20b, reduciendo la latencia de generación.
- Compatibilidad con los motores de inferencia SGLang y vLLM mediante la opción `--speculative-algorithm DFLASH` o `--speculative-config`.
- Compatibilidad con BeeLlama.cpp para despliegue local con cuantización GGUF.
- Soporte para tamaños de bloque configurables (número de tokens de draft ajustable durante la inferencia).
- No es un modelo de generación de texto autónomo: requiere el modelo objetivo para producir respuestas finales.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; estas capacidades las aporta el modelo objetivo.

## Casos de uso

- Despliegue de gpt-oss-20b en entornos de baja latencia: el drafter DFlash reduce el tiempo de generación hasta 2.2×, lo que permite responder peticiones en tiempo real en aplicaciones de chat o asistentes conversacionales.
- Inferencia en hardware limitado: al ser el drafter un modelo de solo 0.8B, puede ejecutarse en GPU de consumo (por ejemplo, RTX 3090 o RTX 4090) con cuantización GGUF, mientras el modelo objetivo corre en la misma GPU o en otra.
- Procesamiento por lotes de alta concurrencia: los speedups se mantienen entre 1.7× y 2.2× incluso con concurrencia de 32 peticiones, lo que mejora el throughput en servicios de API.
- Integración en pipelines de generación de código: con HumanEval se observa una longitud de aceptación de 4.3 tokens y speedups de 2.0×, útil para herramientas de autocompletado o generación asistida.
- Evaluación de modelos de razonamiento: en tareas como Math500 y GSM8K, el drafter mantiene altas tasas de aceptación, facilitando la ejecución de benchmarks con menor coste computacional.
- Experimentación con decodificación especulativa: investigadores pueden probar distintos tamaños de bloque y configuraciones de concurrencia para optimizar el equilibrio entre latencia y throughput en sus propios entornos.

## Benchmarks y rendimiento

La siguiente tabla presenta los resultados reportados en la model card del modelo z-lab/gpt-oss-20b-DFlash, medidos con SGLang en una sola GPU H200, con tamaño de bloque 8 (7 tokens de draft) y esfuerzo de razonamiento medio para el modelo objetivo.

| Tarea | Longitud de aceptación | Speedup conc=1 | Speedup conc=4 | Speedup conc=8 | Speedup conc=16 | Speedup conc=32 |
|---|---|---|---|---|---|---|
| Math500 | 5.1 | 2.2× | 2.1× | 2.2× | 1.9× | 1.8× |
| GSM8K | 4.7 | 2.0× | 2.0× | 2.0× | 1.8× | 1.7× |
| HumanEval | 4.3 | 2.0× | 2.1× | 2.2× | 2.1× | 1.9× |
| MT-Bench | 4.2 | 1.9× | 2.0× | 2.0× | 1.9× | 1.7× |

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval como métrica de precisión) para el drafter, ya que no es un modelo generativo autónomo. Los datos anteriores se refieren exclusivamente a la eficiencia de la decodificación especulativa.

## Requisitos de hardware

- El drafter DFlash tiene 0.8B parámetros; en formato bfloat16 ocupa aproximadamente 1.6 GB de VRAM, y en cuantización GGUF (p. ej. Q4_K_M) podría reducirse a menos de 0.6 GB.
- Las pruebas de referencia se realizaron en una GPU H200 (141 GB HBM3e), pero el drafter es lo suficientemente ligero para ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o incluso en CPU con llama.cpp.
- El modelo objetivo gpt-oss-20b requiere su propia VRAM: aproximadamente 40 GB en bfloat16, o alrededor de 12-14 GB en cuantización Q4_K_M. Por tanto, el despliegue completo (objetivo + drafter) es viable en una RTX 4090 (24 GB) con cuantización adecuada.
- Opciones de despliegue:
  - SGLang: requiere instalar la versión con soporte DFlash (`git+https://github.com/sgl-project/sglang.git@refs/pull/20547/head`).
  - vLLM: soporte nativo mediante `--speculative-config '{"method": "dflash", "model": "z-lab/gpt-oss-20b-DFlash", "num_speculative_tokens": 7}'`.
  - BeeLlama.cpp: fork de llama.cpp con funciones de cuantización avanzadas, adecuado para despliegue local y en CPU/GPU de consumo.
- La latencia y el throughput dependen de la concurrencia y del hardware. En las pruebas con H200 y concurrencia 1, el speedup de extremo a extremo oscila entre 1.9× y 2.2× según la tarea.

## Comparativa con modelos similares

No se dispone de datos públicos comparativos de DFlash frente a otros métodos de decodificación especulativa (como EAGLE, Medusa o Lookahead Decoding) en las mismas condiciones de hardware y modelo objetivo. La información disponible solo reporta resultados de DFlash sobre gpt-oss-20b. Se recomienda consultar el paper original para posibles comparaciones cualitativas.

Alternativas de drafter para gpt-oss-20b:

| Metodo | Parametros | Velocidad reportada | Compatibilidad | Licencia |
|---|---|---|---|---|
| DFlash (este modelo) | 0.8B | 1.7×-2.2× (H200, SGLang) | SGLang, vLLM, BeeLlama.cpp | MIT |
| EAGLE-2/3 (genérico) | Variable | No disponible para gpt-oss | Requiere adaptación específica | MIT (depende de implementación) |
| Medusa (genérico) | Variable | No disponible para gpt-oss | Requiere entrenamiento por modelo | Apache 2.0 |

## Limitaciones y advertencias

- El modelo DFlash no es un modelo de lenguaje autónomo: no puede generar respuestas por sí mismo y debe combinarse obligatoriamente con el modelo objetivo gpt-oss-20b.
- La eficiencia de la decodificación especulativa depende del grado de alineación entre el drafter y el modelo objetivo. Si se usa con otro modelo distinto de gpt-oss-20b, la tasa de aceptación podría degradarse notablemente.
- El repositorio GGUF no especifica los tipos de cuantización incluidos ni su tamaño exacto; se recomienda verificar el contenido antes de su uso.
- El soporte de DFlash en SGLang y vLLM es reciente y puede presentar inestabilidades en entornos de producción. Las variables de entorno experimentales (SGLANG_ENABLE_SPEC_V2, etc.) deben usarse con cautela.
- No se han documentado sesgos específicos de este drafter, pero al entrenarse sobre respuestas generadas por gpt-oss-20b, hereda indirectamente los sesgos y limitaciones de dicho modelo.
- La licencia MIT permite uso comercial sin restricciones, siempre que se incluya el aviso de copyright correspondiente.
- El número de descargas y likes del repositorio es cero, lo que indica que es una publicación reciente con poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Anbeeld/gpt-oss-20b-DFlash-GGUF
- Modelo base (drafter): https://huggingface.co/z-lab/gpt-oss-20b-DFlash
- Modelo objetivo: https://huggingface.co/openai/gpt-oss-20b
- Paper DFlash: https://arxiv.org/abs/2602.06036
- GitHub del proyecto DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash/
- BeeLlama.cpp (fork de llama.cpp): https://github.com/Anbeeld/beellama.cpp
- Documentación de gpt-oss-20b en OpenAI: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Anuncio de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
