# Ephab/Arabic-Masked-Diffusion-0.5B

## Resumen

Arabic Masked Diffusion 0.5B es un modelo de lenguaje de difusión enmascarada para árabe desarrollado por Ephab, con 518 millones de parámetros. Se obtiene convirtiendo el modelo autorregresivo RightNow-Arabic-0.5B-Turbo (a su vez derivado de Qwen2.5-0.5B) en un modelo de difusión: se elimina la máscara de atención causal, se añade un token de máscara y se continúa el entrenamiento con un objetivo de difusión enmascarada sobre árabe moderno limpio (web, Wikipedia y noticias). El resultado es un modelo bidireccional que puede rellenar huecos dentro de un texto además de continuarlo.

El modelo es relevante como experimento de conversión de arquitecturas autorregresivas a difusión en un idioma con pocos recursos, y por su reducido tamaño (518 M de parámetros, pesos en float16, repositorio de 1,1 GB), que permite entrenamiento e inferencia en hardware de consumo. Sin embargo, sus propios autores advierten de que la generación es su punto débil: los bucles de repetición aparecen con la decodificación por orden de confianza y ninguna configuración probada iguala la fluidez del modelo padre.

No está ajustado a instrucciones y no debe usarse como modelo conversacional. Está orientado a árabe escrito contemporáneo, ya que el texto clásico y religioso se filtró del corpus de entrenamiento. Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 adaptado a difusión enmascarada (atención bidireccional, sin máscara causal) |
| Parametros totales | 518.059.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con atención por ventanas deslizantes y completas) y la modifica para difusión: se elimina la máscara de atención causal (`is_causal = False`), de modo que cada posición atiende a todas las demás, y se introduce un token de máscara `<|mask|>` con id 178697. El entrenamiento continúa con un objetivo de difusión enmascarada sobre secuencias de 512 tokens, con datos de árabe moderno limpio (web, Wikipedia y noticias) publicados en el dataset Ephab/Arabic-Masked-Diffusion-0.5B-Data.

El entrenamiento se realizó en dos fases: 23 horas en dos GPU Kaggle T4 en fp16 y 72 horas en una RTX 4080 Super en bf16, con un total de aproximadamente 4,3 mil millones de tokens. Los pesos publicados corresponden a la media móvil exponencial (EMA) de los parámetros con decaimiento 0,998 al final del entrenamiento. La innovación principal es la conversión de un modelo autorregresivo en uno bidireccional capaz de rellenar huecos, con la limitación de que la generación secuencial requiere revelar tokens por bloques de 32 tokens de izquierda a derecha.

## Capacidades

- Relleno de huecos (infilling) dentro de un texto: puede completar un tramo enmascarado entre dos fragmentos de contexto.
- Continuación de texto mediante revelado por bloques de 32 tokens, usando los bloques ya completados como contexto.
- Comprensión bidireccional del contexto: ver el texto posterior a un hueco de 32 tokens reduce su BPC en ese tramo un 13 %.
- Modelado de lenguaje en árabe escrito contemporáneo (web, noticias, Wikipedia).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional ni está ajustado a instrucciones; no debe usarse como chat.
- Capacidad multilingüe limitada al árabe.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Relleno de huecos en textos árabes: dado un fragmento con una laguna (por ejemplo, una frase incompleta en un documento), el modelo genera el tramo enmascarado usando el contexto anterior y posterior, aprovechando su atención bidireccional.
- Restauración de texto dañado o incompleto: en corpus digitalizados con caracteres o palabras perdidas, el modelo puede proponer el contenido faltante a partir del contexto circundante.
- Investigación en modelos de difusión para lenguaje: sirve como base reproducible para estudiar la conversión de modelos autorregresivos a difusión en idiomas de bajos recursos, con datos y receta de entrenamiento publicados.
- Experimentos de decodificación y análisis de BPC: permite comparar la verosimilitud de secuencias árabes bajo un modelo bidireccional frente a uno autorregresivo, ya que el BPC del modelo es una cota superior de su verosimilitud.
- Completado de texto en herramientas de edición: integrado en un editor, puede sugerir continuaciones de un párrafo árabe bloque a bloque, aunque con fluidez limitada.
- Prototipado educativo en hardware de consumo: con 518 M de parámetros en float16 (aproximadamente 1 GB de pesos), cabe en GPU de gama media y permite experimentar con difusión enmascarada sin infraestructura grande.
- Evaluación comparativa de modelos árabes: como punto de referencia en pruebas de modelado de lenguaje sobre árabe moderno, con métricas BPC publicadas frente a su modelo padre.

## Benchmarks y rendimiento

Bits por carácter (BPC), menor es mejor. Para este modelo el valor es una cota superior de su verosimilitud; para el padre es la verosimilitud exacta de izquierda a derecha.

| Conjunto de prueba | Este modelo | Modelo padre |
|---|---|---|
| 1.000 documentos web no vistos | 1,372 | 1,415 |
| 64 documentos (web, noticias, Wikipedia) | 1,325 | 1,294 |

En cuatro benchmarks árabes zero-shot, el modelo promedia un 42,5 % frente al 44,3 % del padre. Es mejor que su padre en noticias y texto web y aproximadamente un 25 % peor en Wikipedia, el dominio de entrenamiento del padre. Ver el texto posterior a un hueco de 32 tokens reduce su BPC en ese tramo un 13 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en float16; en float32 (recomendado en el ejemplo de uso) alrededor de 2 GB, más memoria para activaciones y atención.
- GPU recomendadas: RTX 4080 Super (usada en el entrenamiento), T4 (usadas en la primera fase), cualquier GPU con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y alta con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `attn_implementation="sdpa"`; no se usa a través de `generate()`, sino con un bucle de revelado de tokens personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El rellenado requiere una pasada completa del modelo por cada paso de revelado, lo que encarece la generación frente a la decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arabic Masked Diffusion 0.5B | 518 M | 512 tokens | Difusión enmascarada, árabe | Apache 2.0 | Hugging Face |
| RightNow-Arabic-0.5B-Turbo (padre) | 0,5 B (aproximado) | no disponible | Autorregresivo, árabe | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B (base original) | 0,5 B (aproximado) | no disponible | Autorregresivo, multilingüe | Apache 2.0 | Hugging Face |

El modelo padre obtiene mejor BPC en Wikipedia (1,294 frente a 1,325) y mejor media en benchmarks zero-shot (44,3 % frente a 42,5 %), mientras que este modelo supera al padre en texto web no visto (1,372 frente a 1,415). No se dispone de datos de benchmarks de Qwen2.5-0.5B en la información proporcionada.

## Limitaciones y advertencias

- La generación es el punto débil: revelar tokens por orden de confianza produce bucles de repetición y ninguna configuración de decodificación probada iguala la fluidez del modelo padre.
- No está ajustado a instrucciones y no debe usarse como modelo conversacional.
- El texto clásico y religioso se filtró del corpus, por lo que el modelo está orientado solo a árabe escrito contemporáneo.
- Riesgo de alucinación y de contenido incoherente en generaciones largas, dado el bucle de repetición documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitación de contexto: el entrenamiento usó secuencias de 512 tokens; no se documenta soporte para ventanas mayores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos son derivados de RightNow-Arabic-0.5B-Turbo y Qwen2.5-0.5B, ambos Apache 2.0.
- Caveat para producción: el uso requiere modificar la atención a bidireccional y un bucle de decodificación propio; no funciona con `generate()` estándar.
- El BPC reportado para este modelo es una cota superior, no una verosimilitud exacta, lo que dificulta comparaciones directas con modelos autorregresivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ephab/Arabic-Masked-Diffusion-0.5B
- Dataset de entrenamiento y prueba: https://huggingface.co/datasets/Ephab/Arabic-Masked-Diffusion-0.5B-Data
- Modelo padre: https://huggingface.co/RightNowAI/RightNow-Arabic-0.5B-Turbo
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Paper: *Converting an Autoregressive Arabic Language Model into a Masked Diffusion Model* (Mohammed Feras Sawab, Qasim Al Mahfoodh, Rashed Alkhathlan y Hassan Bader Alhumaidi); enlace no disponible en la información proporcionada.
