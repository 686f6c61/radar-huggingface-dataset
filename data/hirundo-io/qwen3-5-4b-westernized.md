# hirundo-io/Qwen3.5-4B-Westernized

## Resumen

Hirundo Qwen3.5-4B Westernized es un checkpoint completo fusionado (merged) derivado de Qwen/Qwen3.5-4B, publicado por hirundo-io. El modelo aplica una técnica de *behavioral unlearning* (desaprendizaje conductual) orientada a reducir comportamientos asociados a censura, sesgo y propaganda presentes en el modelo base, preservando el resto de capacidades. Se distribuye como pesos completos en safetensors, por lo que puede cargarse directamente sin adaptador LoRA/PEFT adicional.

El modelo conserva la arquitectura multimodal del base (pipeline `image-text-to-text`), con 4.659.865.088 parámetros totales y un repositorio de 9,3 GB. Está pensado para desarrolladores que necesitan un modelo de ~4B con capacidad de visión y texto, licencia Apache 2.0, y un perfil de rechazo/censura sustancialmente menor que el del modelo original, manteniendo un rendimiento de capacidades prácticamente idéntico (variación media de −0,36 puntos porcentuales en seis tareas de capacidad en modo Thinking-OFF).

Su relevancia actual radica en que documenta de forma explícita el *trade-off* entre alineamiento y censura: reduce drásticamente las métricas de comportamiento censurado, pero también empeora ligeramente algunos indicadores de seguridad adversa (mayor cumplimiento dañino y mayor sobrerrechazo en XSTest). Es, por tanto, un modelo para evaluar con cuidado antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de ~4,66B parámetros que procesa entradas de imagen y texto. Sobre ese base, Hirundo aplica un proceso de *behavioral unlearning* cuyo objetivo es suprimir conductas de censura, sesgo o propaganda manteniendo el comportamiento no objetivo. El resultado se publica como checkpoint fusionado (pesos completos), y el adaptador LoRA original sin fusionar está disponible por separado en hirundo-io/Qwen3.5-4B-Westernized-LoRA (con bytes de adaptador idénticos).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de desaprendizaje, ni si hubo RLHF/DPO adicional. Tampoco se detallan innovaciones de arquitectura propias (atención lineal, decodificación especulativa, etc.); la model card remite al blog del autor para la metodología y el setup de evaluación. Las evaluaciones reportadas se realizan en modo Thinking-OFF, lo que sugiere que el base dispone de un modo de razonamiento explícito ("thinking") que aquí no se evalúa.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento conjunto de imagen y texto (`image-text-to-text`): descripción de imágenes, VQA y tareas multimodal texto-imagen.
- Razonamiento y respuesta a instrucciones heredados del base Qwen3.5-4B.
- Comportamiento menos censurado: reducción medida de respuestas con censura, sesgo o propaganda (CCPC-500: 89,2% → 1,2%).
- Menor tasa de rechazo ante peticiones (DECCP: 57,9% → 6,3%).
- Mayor cumplimiento en escenarios tipo ChinaBench (no cumplimiento: 98,3% → 1,7%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el base lo posee, pero las evaluaciones publicadas son exclusivamente Thinking-OFF; no hay datos del modo thinking para este checkpoint.

## Casos de uso

- **Investigación en alineamiento y desaprendizaje conductual:** usar el par base + Westernized para estudiar cómo el *behavioral unlearning* desplaza las distribuciones de respuesta en benchmarks de censura (CCPC-500, DECCP, ChinaBench) sin degradar capacidades, con una pérdida media de solo −0,36 pp en seis tareas.
- **Asistentes conversacionales con menor sobrerrechazo:** el modelo reduce el rechazo en DECCP del 57,9% al 6,3%, lo que lo hace adecuado para chatbots donde el base rechazaba en exceso peticiones legítimas; conviene validar el sobrerrechazo con XSTest (6,4% en este checkpoint).
- **Análisis y descripción de imágenes en pipelines internos:** al ser `image-text-to-text` con licencia Apache 2.0, puede integrarse en flujos de moderación de contenido, etiquetado de imágenes o extracción de información visual sin restricciones de uso comercial.
- **Prototipado rápido en hardware de consumo:** con ~4,66B parámetros y pesos safetensors de 9,3 GB, es viable en GPUs consumer de 24 GB (p. ej. RTX 4090) en precisión reducida, y en configuraciones más ajustadas mediante cuantización estándar de la comunidad.
- **Generación de contenido editorial y creativo:** la reducción de censura permite usar el modelo para redacción de ficción, análisis político o divulgación donde el base introducía sesgos o propaganda; requiere revisión humana por el aumento de cumplimiento dañino en XSTest (22,0%).
- **Evaluación comparativa de seguridad:** como caso de estudio de *trade-off* seguridad-utilidad, sirve para construir *red teams* internos que midan XSTest y OR-Bench antes de adoptar modelos des-censurados en producción.
- **Base para fine-tuning específico de dominio:** al ser un checkpoint completo fusionado y Apache 2.0, puede servir como punto de partida para ajuste supervisado en dominios verticales (legal, sanitario, atención al cliente) sin arrastrar el adaptador LoRA.

## Benchmarks y rendimiento

Evaluaciones reportadas por el autor en modo Thinking-OFF. CCPC-500 y DECCP medidas sobre este checkpoint fusionado; ChinaBench medida con el adaptador LoRA sin fusionar aplicado al base.

| Benchmark | Metrica | Base Qwen3.5-4B | Hirundo Westernized |
|---|---|---:|---:|
| CCPC-500 | Censura, sesgo o propaganda ↓ | 89,2% | 1,2% |
| ChinaBench | No cumplimiento ↓ | 98,3% | 1,7% |
| DECCP | Rechazo ↓ | 57,9% | 6,3% |
| Seis tareas de capacidad (Thinking-OFF) | Cambio medio no ponderado | referencia | −0,36 pp |
| XSTest | Cumplimiento dañino ↓ | 20,5% | 22,0% |
| XSTest | Sobrerrechazo en prompts inocuos ↓ | 5,2% | 6,4% |
| OR-Bench | Cumplimiento dañino ↓ | 1,37% | 1,07% |
| OR-Bench | Sobrerrechazo en prompts inocuos ↓ | 87,53% | 89,61% |

No se han publicado resultados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada (BF16/FP16):** ~9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB de VRAM para inferencia cómoda con contexto moderado.
- **Cuantización:** no se publican versiones GGUF/AWQ oficiales; la cuantización a 8 bits reduciría los pesos a ~4,7 GB y a 4 bits a ~2,4 GB, pero son estimaciones a partir del número de parámetros, no datos del autor.
- **GPU recomendadas:** A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16-24 GB) para precisión reducida.
- **GPU consumer:** sí cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en GPUs de 8-12 GB. No cabe en GPUs de 4-6 GB sin cuantización agresiva.
- **Despliegue:** carga nativa vía `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (código de carga incluido en la model card). Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible en la información proporcionada.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Hirundo Qwen3.5-4B Westernized | 4,66B | no disponible | Apache 2.0 | Multimodal + desaprendizaje conductual | HF (hirundo-io) |
| Qwen/Qwen3.5-4B (base) | 4,66B | no disponible | Apache 2.0 | Multimodal alineado estándar | HF (Qwen) |
| hirundo-io/Qwen3.5-4B-Westernized-LoRA | 4,66B + adaptador | no disponible | Apache 2.0 | Mismo efecto vía LoRA sin fusionar | HF (hirundo-io) |

La comparación con alternativas de otros fabricantes (p. ej. Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) no está disponible en la información proporcionada; no se aportan datos de rendimiento cruzado con esos modelos.

## Limitaciones y advertencias

- **Mayor cumplimiento dañino en XSTest:** sube del 20,5% al 22,0%, lo que indica una relajación de barreras de seguridad que puede ser problemática en aplicaciones de cara al público.
- **Mayor sobrerrechazo en prompts inocuos:** XSTest pasa del 5,2% al 6,4% y OR-Bench del 87,53% al 89,61%; el modelo rechaza en exceso muchas peticiones legítimas, lo que degrada la experiencia de usuario.
- **Riesgo de alucinación:** no evaluado en la información disponible; hereda el comportamiento del base sin métricas específicas de factualidad.
- **Sesgos:** el objetivo declarado es reducir sesgo y propaganda, pero no se aportan métricas de sesgo demográfico ni de equidad; el desaprendizaje conductual puede introducir sesgos no medidos.
- **Idiomas y contexto:** no se especifican idiomas soportados ni longitud de contexto; no se puede garantizar cobertura multilingüe ni ventanas largas sin verificación empírica.
- **Evaluaciones limitadas al modo Thinking-OFF:** no hay datos del modo thinking ni de tareas multimodales; el rendimiento en visión no está cuantificado.
- **Benchmarks propietarios:** CCPC-500 es un benchmark introducido por el propio autor en su blog, por lo que los resultados no son directamente comparables con literatura externa.
- **Licencia Apache 2.0:** permite uso comercial, pero el autor no ofrece garantías; la responsabilidad sobre el contenido generado recae en el desplegador.
- **Tamaño de repo de 9,3 GB:** requiere espacio en disco y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized
- Adaptador LoRA sin fusionar: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog del autor con metodología y evaluación: https://www.hirundo.io/blog/westernizing-qwen
