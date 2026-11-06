# Fengnan001/FNova-1.7B-Chat-v1

## Resumen

FNova-1.7B-Chat-v1 es un modelo conversacional y de razonamiento compacto desarrollado por Fengnan001 a partir de Qwen3-1.7B-Base. El pipeline de entrenamiento incluye una continuación del preentrenamiento (CPT) sobre aproximadamente 20.000 millones de tokens, seguida de fine-tuning supervisado (SFT), optimización por política relativa de grupo (GRPO) y destilación on-policy (OPD) usando Qwen3-32B como modelo profesor.

El modelo se posiciona como un modelo ligero de chat con modo de razonamiento (thinking mode), orientado principalmente a chino e inglés, con un énfasis notable en tareas jurídicas: los benchmarks publicados incluyen LawBench, LexEval, LexGenius y LexRel, además de los habituales MMLU, CMMLU, GSM8K o MATH-500.

Con 1,72 mil millones de parámetros en BF16 y una ventana de contexto de 32.768 tokens, es un modelo pensado para despliegues con recursos limitados, compatible con Transformers y vLLM, y publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje Qwen3 (transformer decoder) |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densa) |
| Longitud de contexto | 32.768 tokens (entrada y salida incluidas) |
| Tipos de cuantizacion | BF16 (precision nativa); no hay cuantizaciones publicadas |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,5 GB en el repositorio) |

## Arquitectura y entrenamiento

FNova-1.7B-Chat-v1 hereda la arquitectura de modelo causal de lenguaje de Qwen3, un transformer decoder denso de aproximadamente 1,7B de parametros. El repositorio indica el uso de `rope_theta = 1.000.000` en la configuracion recomendada para vLLM, coherente con la ventana de contexto de 32.768 tokens.

El entrenamiento sigue cuatro etapas documentadas en la model card:

1. **Continued pre-training (CPT)**: aproximadamente 20B tokens de texto mixto de dominios especificos y texto general.
2. **Supervised fine-tuning (SFT)**: datasets publicos de seguimiento de instrucciones y razonamiento.
3. **GRPO**: post-entrenamiento sobre datasets publicos de razonamiento con recompensas especificas por tarea.
4. **On-policy distillation (OPD)**: entrenamiento con datos sinteticos generados usando Qwen3-32B como modelo profesor.

El detalle exacto de la composicion del dataset CPT no esta disponible, aunque el perfil de benchmarks (LawBench, LexEval, LexGenius, LexRel) sugiere un peso significativo de texto juridico en chino e ingles. La model card no menciona explícitamente RLHF clasico ni DPO; el alineamiento se realiza via GRPO y OPD.

## Capacidades

- **Generacion de texto conversacional**: modelo de chat con plantilla de conversacion (`chat_template.jinja`) y soporte multi-turno.
- **Modo de razonamiento (thinking mode)**: habilitado por defecto; se controla con `enable_thinking` en la plantilla de chat, similar a Qwen3. En vLLM se recomienda el parser de razonamiento `qwen3`.
- **Razonamiento matematico**: GSM8K 81,35 y MATH-500 60,80 indican capacidad solida en problemas de matematicas escolares y competitivas basicas.
- **Dominio juridico**: puntuaciones publicadas en LawBench, LexEval, LexGenius y LexRel, orientadas a derecho (aparentemente chino e ingles).
- **Conocimiento general multilingue (zh/en)**: MMLU 55,87, CMMLU 55,52 y C-Eval 53,01.
- **Seguimiento de instrucciones**: IFEval 55,27.
- **Tool calling / function calling**: no disponible; la model card no menciona soporte de function calling.
- **Agentes / multi-step reasoning**: no hay soporte documentado de agentes; el thinking mode permite cadenas de razonamiento internas.
- **Vision, audio u otras modalidades**: no disponibles; es un modelo de texto exclusivamente.

## Casos de uso

- **Asistentes juridicos de borrador**: gracias a su entrenamiento con datos juridicos (LawBench, LexEval, LexGenius), puede redactar y resumir documentos legales en chino e ingles como primera version, siempre con revision humana.
- **Chatbots ligeros autoalojados**: con 1,7B de parametros y 3,5 GB en BF16, cabe en GPUs de consumo o incluso en CPU, siendo adecuado para asistentes conversacionales de bajo coste.
- **Resolucion de problemas de matematicas**: con GSM8K en 81,35, es util para tutorias o verificacion de ejercicios de matematicas de nivel escolar y primeros cursos universitarios.
- **Razonamiento con presupuesto limitado**: el thinking mode permite obtener cadenas de razonamiento explicitas en tareas de logica y QA sin necesidad de modelos grandes.
- **Clasificacion y extraccion de texto en chino e ingles**: su tamano lo hace idoneo para pipelines de alto throughput con vLLM en tareas de etiquetado, resumen y reescritura.
- **Prototipado y educacion**: al ser Apache 2.0 y ejecutarse en hardware modesto, es adecuado para experimentar con pipelines de post-entrenamiento (SFT, GRPO, destilacion) o integrarlo en aplicaciones docentes.
- **Generacion determinista para pruebas**: la configuracion permite `do_sample=False`, util en tests de regresion y evaluaciones reproducibles.

## Benchmarks y rendimiento

Resultados publicados en la model card (escala 0-100):

| Benchmark | Puntuacion |
|---|---:|
| LawBench | 47,07 |
| LexEval | 50,57 |
| LexGenius | 54,93 |
| LexRel | 61,55 |
| MSLR | 63,61 |
| CMMLU | 55,52 |
| C-Eval | 53,01 |
| MMLU | 55,87 |
| GSM8K | 81,35 |
| MATH-500 | 60,80 |
| IFEval | 55,27 |
| GPQA-Diamond | 16,16 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Como referencia contextual, GPQA-Diamond en 16,16 y MMLU en 55,87 son cifras modestas, coherentes con un modelo de 1,7B; el punto fuerte relativo son las matematicas (GSM8K 81,35) y el dominio juridico.

## Requisitos de hardware

- **VRAM para inferencia en BF16**: aproximadamente 3,5 GB solo de pesos; con contexto de 32K tokens y overhead de KV cache, se recomiendan entre 6 y 8 GB de VRAM para uso comodo.
- **Con cuantizacion**: no hay pesos cuantizados publicados en el repositorio; una cuantizacion a 4 bits (por ejemplo, via GGUF o AWQ) reduciria el footprint a torno a 1-1,5 GB, aunque no esta verificada por el autor.
- **GPUs recomendadas**: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4090) ejecuta el modelo en BF16 sin problemas. No se requieren A100 ni H100.
- **CPU**: dado su tamano, la inferencia en CPU es viable con llama.cpp (no hay GGUF oficial publicado).
- **Despliegue**:
  - Transformers (verificado con versiones 4.57.1 y 5.20.2, PyTorch 2.14.1 y Accelerate 1.15.0).
  - vLLM, con comando documentado en la model card (`--reasoning-parser qwen3`, `--max-model-len 32768`, y el override de `rope_theta`).
  - Ollama / llama.cpp: no hay soporte oficial documentado.
- **Latencia y throughput**: no disponibles; al ser un modelo de 1,7B, se esperan latencias bajas y throughput alto en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| FNova-1.7B-Chat-v1 | 1,72B | 32.768 | Apache 2.0 | Enfoque juridico (zh/en), thinking mode, entrenado con GRPO y OPD |
| Qwen3-1.7B (oficial) | ~1,7B | 32.768 (128K con YaRN) | Apache 2.0 | Modelo base del que deriva; benchmarks generales mas amplios |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Qwen (uso comercial permitido <100M MAU) | Generacion anterior, sin thinking mode nativo |

FNova-1.7B-Chat-v1 se diferencia de su modelo base oficial por el CPT de 20B tokens con aparente foco juridico y por el pipeline completo de post-entrenamiento (SFT, GRPO, OPD con Qwen3-32B como profesor). Frente a alternativas de tamano similar, ofrece thinking mode heredado de Qwen3 y licencia Apache 2.0 sin restricciones de usuarios mensuales.

## Limitaciones y advertencias

- **Idiomas**: el modelo esta orientado a chino e ingles; su rendimiento en castellano no esta evaluado y probablemente sea limitado.
- **Capacidad general modesta**: con GPQA-Diamond en 16,16, el razonamiento cientifico avanzado es debil, como cabe esperar en un modelo de 1,7B.
- **Riesgo de alucinacion**: no se documentan mitigaciones especificas; en el dominio juridico, donde el modelo esta especializado, las alucinaciones (citaciones, articulos, jurisprudencia inventados) son un riesgo critico que exige supervision humana obligatoria.
- **Sin soporte documentado de tool calling ni agentes**: no es adecuado, tal cual, para pipelines agenticos que requieran function calling.
- **Detalles de generacion**: los valores de presence penalty (0,4) y frequency penalty (0,0) del `generation_config.json` no se aplican automaticamente con el `generate()` nativo de Transformers; en vLLM hay que pasar los cinco parametros de muestreo explicitamente para reproducir la configuracion recomendada.
- **Versiones de software**: el checkpoint se guardo con Transformers 5.16.1; la inferencia local se ha verificado con versiones concretas (4.57.1, 5.20.2, PyTorch 2.14.1), por lo que conviene comprobar la compatibilidad del entorno antes de desplegar.
- **Madurez del proyecto**: con 605 descargas y sin likes en el momento de la ficha, es un proyecto de autor individual sin historial de auditoria ni evaluacion independiente.
- **Licencia**: Apache 2.0 permite uso comercial; se conservan avisos de copyright y atribucion del modelo base Qwen3 en el fichero LICENSE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fengnan001/FNova-1.7B-Chat-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
