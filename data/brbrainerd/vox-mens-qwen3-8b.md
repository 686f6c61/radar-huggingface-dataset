# brbrainerd/vox-mens-qwen3-8b

## Resumen

vox-mens-qwen3-8b es un adaptador QLoRA sobre Qwen/Qwen3-8B desarrollado por brbrainerd dentro del proyecto Vox, un ecosistema orientado a la generación de código en el lenguaje Vox (vox-lang). El modelo no es un modelo base independiente: se distribuye como adaptador (rank bajo) que debe aplicarse sobre la revisión concreta de Qwen3-8B indicada en la model card (`b968826d9c46dd6066d109eabc6255188de91218`). Su propósito es corregir los errores de sintaxis y de tipos que el modelo base comete al generar programas Vox, un lenguaje con construcciones propias como `mutation`, `action` y tipos `Result`.

El adaptador forma parte de una familia escalonada de tamaños ("rungs") del proyecto Vox MENS, donde cada tamaño se etiqueta con un estado de entrenamiento y una "gate" (puerta de calidad) que en este caso figura como *passed*. El modelo está pensado para máquinas con memoria abundante, como portátiles de gama alta o estaciones de trabajo, y para tareas de edición que tocan varios ficheros y requieren cadenas de razonamiento sobre tipos.

La relevancia actual es acotada pero específica: demuestra un flujo de ajuste fino (QLoRA con Candle) para especializar un LLM generalista en un lenguaje de dominio concreto, con métricas declaradas de regresión en razonamiento (modo thinking) y de generación de código. La licencia Apache 2.0 facilita su reutilización, aunque el modelo solo declara inglés como idioma y su ámbito real es la generación de código Vox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); adaptador QLoRA sobre el modelo base |
| Parametros totales | 8B en el modelo base (el adaptador añade pesos de bajo rango; número exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se entrena con QLoRA; no se listan formatos de cuantización publicados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente; el repositorio usa la librería `vox` y tiene un tamaño de 0.4 GB, compatible con pesos de adaptador |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador QLoRA aplicado sobre Qwen3-8B, un transformer decoder-only de 8 mil millones de parámetros. El entrenamiento se realizó con Candle (framework de tensores en Rust) y está etiquetado con el tag `spoke-vox-lang`, lo que lo vincula al "spoke" de generación de código del lenguaje Vox dentro de la arquitectura hub-and-spoke del proyecto MENS. La revisión base está fijada explícitamente, lo que garantiza reproducibilidad del adaptador.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card sí aporta un dato operativo concreto: el pico de memoria medido durante el entrenamiento del rung de 8B es de 36 356 MiB (`peak_source: run_summary`), y no se ha medido ninguna cifra de memoria para servicio (inferencia). El adaptador corrige 8 de 52 ítems del banco de evaluación y no rompe ninguno, según la model card. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en el lenguaje Vox (vox-lang): funciones, mutaciones (`mutation`), acciones (`action`) y tipos `Result`, con corrección de errores de sintaxis y de tipos respecto al modelo base.
- Razonamiento en modo thinking: la model card reporta comprobaciones de regresión en gsm8k, math500 y un conjunto propio (`vox_think`).
- Generación de texto general (pipeline `text-generation`).
- Capacidad multilingüe limitada: solo se declara inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el proyecto menciona ediciones multi-fichero y cadenas de razonamiento sobre tipos como caso de uso previsto.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Generación de código Vox en editores y asistentes: el adaptador corrige errores de tipos y de parseo del modelo base en tareas de Humaneval traducidas a Vox, por lo que encaja en autocompletado o generación de funciones a partir de una descripción en lenguaje natural.
- Edición multi-fichero: el rung de 8B está descrito como adecuado para cambios que afectan a varios archivos y requieren razonamiento sobre tipos, lo que permite usarlo en tareas de refactorización asistida dentro de un repositorio Vox.
- Generación de mutaciones y acciones de dominio: los ejemplos de la model card muestran que produce firmas `mutation` y `action` válidas, útil para generar capas de acceso a datos o endpoints a partir de especificaciones.
- Corrección automática de código generado por el modelo base: puede emplearse como segunda pasada que repara salidas de Qwen3-8B que no parsean o tienen errores de tipos.
- Evaluación y regresión de pipelines de código: sus métricas declaradas (pass@1, accuracy en gsm8k/math500/vox_think) permiten integrarlo en suites de evaluación de generación de código para lenguajes de dominio.
- Investigación en ajuste fino eficiente: al ser un adaptador QLoRA entrenado con Candle, sirve como referencia reproducible para especializar modelos de 8B en lenguajes pequeños con recursos de una estación de trabajo (pico de entrenamiento de ~36 GB).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 ítems) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2500 |
| Regresión de razonamiento (thinking) | gsm8k_think (128 ítems) | accuracy | 0,8906 |
| Regresión de razonamiento (thinking) | math500_think (128 ítems) | accuracy | 0,4766 |
| Regresión de razonamiento (thinking) | vox_think (128 ítems) | accuracy | 0,9375 |

La model card indica además que, de los 52 ítems del banco de evaluación, el adaptador corrige 8 y rompe 0 respecto al modelo base. No se han publicado resultados de MMLU, HumanEval estándar ni GSM8K completo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se ha medido cifra de servicio). Como referencia, el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16, aunque este dato no procede de la información proporcionada.
- Memoria de entrenamiento medida: 36 356 MiB de pico para el rung de 8B.
- GPU recomendadas: no disponibles en la información. El proyecto describe el rung de 8B como orientado a portátiles de gama alta y estaciones de trabajo con memoria abundante.
- ¿Cabe en GPU de consumo? No confirmado; el pico de entrenamiento (~36 GB) supera la VRAM de una RTX 4090 (24 GB), pero no se aportan cifras de inferencia.
- Opciones de despliegue: la librería indicada es `vox`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-8b | 8B (base) + adaptador QLoRA | No disponible | Código en Vox (vox-lang) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-8B | 8B | No disponible en esta ficha | LLM generalista y código | Apache 2.0 | Hugging Face |
| Alternativas especializadas en lenguajes de dominio | No disponible | No disponible | Ajuste fino sobre código | No disponible | No disponible |

La comparación directa con otros adaptadores para lenguajes de dominio no está disponible en la información proporcionada. El principal punto de referencia es el propio Qwen3-8B base, sobre el que el adaptador mejora la corrección sintáctica en Vox (8 ítems corregidos, 0 rotos) manteniendo el rendimiento en tareas de razonamiento en modo thinking según las métricas declaradas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base Qwen3-8B en la revisión exacta `b968826d9c46dd6066d109eabc6255188de91218`; usar otra revisión puede invalidar el adaptador.
- Ámbito muy restringido: está especializado en el lenguaje Vox y declarado solo para inglés; su utilidad fuera de ese dominio no está documentada.
- Métricas no verificadas: todos los resultados del model-index figuran con `verified: false` y proceden del autor.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, puede arrastrar los sesgos de Qwen3-8B.
- Riesgo de alucinación: no evaluado de forma específica; en generación de código puede producir APIs o construcciones de Vox inexistentes.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y solo se declara inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia y los términos del modelo base Qwen3-8B.
- En producción: no hay cifras de memoria de servicio ni de latencia/throughput, por lo que el dimensionamiento debe hacerse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Referencia de modelos MENS (estados y hub-and-spoke): https://voxlang.org/reference/mens-models/
- Referencia del lenguaje Vox: https://voxlang.org/
