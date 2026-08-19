# bench-labs/cagliostro-v1

## Resumen

cagliostro-v1 es un modelo de lenguaje pequeño (SLM) de 157 millones de parámetros, desarrollado por bench-labs, entrenado desde cero sobre 36 000 millones de tokens de texto web en inglés. Se trata de un modelo base, sin ajuste por instrucciones, por lo que no mantiene conversaciones ni sigue órdenes de forma nativa; su propósito es servir como punto de partida para fine-tuning o como referencia en experimentos de escalado y eficiencia.

El modelo sigue una arquitectura decoder-only equivalente a Qwen3, con 30 capas, tamaño oculto de 640 y atención con cabezas QK-norm. Su contexto de entrenamiento es de 1024 tokens, aunque el archivo de configuración declara 4096 por la extensión RoPE; los autores recomiendan tratar 1024 como el contexto soportado. Se publica bajo licencia MIT, con pesos en formato safetensors, y está pensado para cargarse directamente con `AutoModelForCausalLM` de Transformers.

La relevancia actual del modelo reside en su carácter didáctico y reproducible: documenta de forma exhaustiva el proceso de entrenamiento, la selección de checkpoints y las limitaciones observadas, lo que lo convierte en un caso de estudio útil para quienes investigan la relación entre tamaño, datos y rendimiento en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, equivalente a Qwen3 (Transformer con RMSNorm, QK-norm, RoPE, SwiGLU) |
| Parametros totales | 157 411 200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrenamiento; 4096 declarados en config (RoPE) |
| Tipos de cuantizacion | no disponible (solo se distribuye en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 30 capas, tamaño oculto de 640, 10 cabezas de atencion y 5 cabezas clave/valor (head dimension 64). Usa normalizacion RMSNorm con QK-norm, activacion SwiGLU en la FFN (hidden de 1728) y codificacion posicional RoPE con theta 100 000. El vocabulario es de 32 768 tokens y los embeddings estan atados (tied) con la capa de salida. La arquitectura mapea exactamente sobre Qwen3, por lo que no requiere codigo personalizado para cargarla.

El entrenamiento se realizo sobre 36 000 millones de tokens en una sola pasada, sin repeticion, con una mezcla fija de datos: 57,6 % de FineWeb-Edu, 38,4 % de DCLM-baseline y 4,0 % de Cosmopedia-v2. La mezcla se eligio mediante ablaciones: una variante pesada en FineWeb-Edu alcanzo un indice de inteligencia de 12,83 frente a 12,37 de la variante pesada en DCLM, por lo que se opto por la primera. Se aplico decontaminacion contra HellaSwag, ARC, PIQA y ArithMark-3 usando un filtro de solapamiento de 13-gramas. El optimizador fue AdamW (betas 0,9 y 0,95, weight decay 0,1), con pico de learning rate de 1,5e-3 y decaimiento coseno hasta el 10 %, warmup de 2000 pasos y batch de 393 216 tokens por paso. Se entreno en bfloat16 sobre 8 GPU RTX 5090.

El checkpoint liberado corresponde al paso 91 500 (36 000 millones de tokens), donde el modelo alcanzo su pico de rendimiento; los 4000 millones de tokens adicionales del tramo final del coseno produjeron una degradacion. Se probaron tecnicas de cooldown y promediado de pesos sobre el punto final de 40 000 millones, pero ninguna supero al checkpoint pico.

## Capacidades

- Generacion de texto autoregresiva en ingles, con capacidad de completar secuencias y continuar texto de forma coherente dentro de su contexto limitado.
- Razonamiento basico de sentido comun y conocimiento del mundo, con puntuaciones moderadas en benchmarks como PIQA (66,70 % acc_norm) y ARC-Easy (46,72 % acc_norm).
- Completado de codigo basico, aunque con rendimiento limitado (48 % de acierto en code_completion de BananaMind).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso estructurado.
- No tiene capacidades de vision, audio ni multimodalidad.
- No esta ajustado para seguir instrucciones ni mantener conversaciones; es un modelo base.
- Unicamente en ingles; no hay evidencia de capacidades multilingues.

## Casos de uso

- Fine-tuning para tareas especificas de clasificacion o generacion: al ser un modelo base pequeno, puede adaptarse con recursos modestos a dominios concretos como analisis de sentimiento, resumen de textos cortos o extraccion de entidades, siempre que el contexto de 1024 tokens sea suficiente.
- Experimentacion educativa e investigacion: su documentacion detallada de entrenamiento y seleccion de checkpoints lo convierte en un banco de pruebas ideal para estudiar curvas de escalado, efectos de la mezcla de datos y tecnicas de decontaminacion en modelos pequenos.
- Prototipado rapido de generacion de texto: puede integrarse en demos o pruebas de concepto donde se necesite un generador ligero y rapido, sin requisitos de calidad conversacional.
- Generacion de datos sinteticos para entrenar modelos mas grandes: su capacidad de completar texto puede usarse para producir candidatos que luego se filtran o etiquetan, aunque su calidad limitada exige curaduria.
- Benchmarking de infraestructura: su tamano reducido permite medir latencia, throughput y consumo de memoria en diferentes stacks de inferencia (Transformers, vLLM, llama.cpp) sin necesidad de GPU de gran capacidad.
- Estudio de limitaciones en razonamiento cuantitativo: dado su bajo rendimiento en aritmetica (28 % en quantitative de BananaMind), puede servir como caso de control en investigacion sobre metodos para mejorar capacidades numericas en modelos pequenos.

## Benchmarks y rendimiento

Resultados del Open SLM Leaderboard Intelligence Index, medido con el harness propio de los autores (reimplementacion de la formula oficial; calibrado contra GPT-2, lee aproximadamente 1,4 puntos por encima de la tabla publicada):

| Benchmark | n | acc | acc_norm |
|---|---|---|---|
| HellaSwag | 10 042 | 31,09 % | 34,41 % |
| ARC-Easy | 2 376 | 53,37 % | 46,72 % |
| ARC-Challenge | 1 172 | 23,81 % | 27,82 % |
| Combined ARC | | 38,59 % | 37,27 % |
| PIQA | 1 838 | 65,72 % | 66,70 % |
| ArithMark-3.0 | 1 000 | 33,60 % | 33,70 % |
| **Intelligence Index** | | **17,85** | **19,13** |

Resultados de BananaMind Base Bench 1.1, evaluados con el script oficial del benchmark (puntuacion por log-probabilidad media condicional sobre 350 items fijos):

| Categoria | Elo | Correctos | Precision | Ponderado |
|---|---|---|---|---|
| language_completion | 1570 | 50/50 | 100,00 % | 100,00 % |
| code_completion | 1120 | 24/50 | 48,00 % | 53,50 % |
| world_knowledge | 1107 | 37/50 | 74,00 % | 70,22 % |
| commonsense | 1092 | 36/50 | 72,00 % | 68,45 % |
| logical_reasoning | 1002 | 21/50 | 42,00 % | 36,99 % |
| context_tracking | 894 | 18/50 | 36,00 % | 35,99 % |
| quantitative | 872 | 14/50 | 28,00 % | 27,13 % |
| **Overall** | **1046** | **200/350** | **57,14 %** | **53,91 %** |

No se dispone de comparaciones directas con otros modelos en los mismos benchmarks dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con precision bf16, el modelo ocupa aproximadamente 315 MB de pesos (157 M parametros × 2 bytes). Con cuantizacion de 4 bits (si se genera), cabria en menos de 100 MB, pero no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutarlo sin problemas. Las RTX 5090 usadas en el entrenamiento no son necesarias para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, incluida la mayoria de iGPU integradas si se usa cuantizacion agresiva.
- Opciones de despliegue: compatible con Transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante importacion) y cualquier framework que soporte arquitectura Qwen3.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano, se espera una generacion de decenas de tokens por segundo en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cagliostro-v1 | 157 M | 1024 (entrenamiento) | MIT | Entrenado desde cero, base model |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Modelo base, entrenado con datos variados |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | Modelo base, mejora sobre SmolLM |
| GPT-2 (124M) | 124 M | 1024 | MIT | Modelo clasico, base model |

No se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia. cagliostro-v1 destaca por su licencia permisiva (MIT) y por documentar exhaustivamente su proceso de entrenamiento, pero su contexto efectivo es menor que el de SmolLM2-135M.

## Limitaciones y advertencias

- Razonamiento cuantitativo muy pobre: 28 % de acierto en la categoria quantitative de BananaMind, cerca del azar. Los autores intentaron mejorar con datos aritmeticos sinteticos sin exito.
- Seguimiento de contexto limitado: 36 % en context_tracking, probablemente causado por el contexto de entrenamiento de 1024 tokens, inferior a modelos comparables.
- Contexto efectivo corto: aunque la configuracion declara 4096, solo se evaluo hasta 1024 tokens. No se garantiza un comportamiento correcto por encima de ese limite.
- Modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene conversaciones y puede producir texto incoherente o irrelevante si se usa directamente para tareas conversacionales.
- Unicamente en ingles: no hay soporte multilingue.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos o producir contenido falso, especialmente en tareas de conocimiento del mundo.
- Sesgos: al entrenarse sobre texto web, puede heredar sesgos presentes en los datos; no se han publicado evaluaciones de sesgo.
- Tamaño por encima del umbral informal: con 157 M parametros supera el limite no oficial de 150 M del Open SLM Leaderboard, lo que podria afectar a su comparabilidad en esa tabla.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero al ser un modelo base, cualquier uso en produccion requerira un fine-tuning previo para tareas especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bench-labs/cagliostro-v1
- Organizacion en Hugging Face: https://huggingface.co/cagliostrolab
- GitHub de Cagliostro Labs: https://github.com/CagliostroLab
- Perfil en BenchGecko: https://benchgecko.ai/provider/cagliostrolab
- Leaderboard LLM (BenchLM): https://benchlm.ai/
