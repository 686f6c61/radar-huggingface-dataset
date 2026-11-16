# ertghiu256/qwen3.5-4b-hermes-tool-calling

## Resumen

`ertghiu256/qwen3.5-4b-hermes-tool-calling` es un modelo publicado en Hugging Face por el usuario `ertghiu256` bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un modelo derivado (probablemente un ajuste fino o un merge) de una supuesta familia Qwen 3.5 con aproximadamente 4.000 millones de parámetros, orientado específicamente a *tool calling* y con la denominación "Hermes" en el nombre, lo que sugiere una vinculación con el formato de function calling popularizado por Nous Research.

La información pública disponible es extremadamente escasa: la model card únicamente declara la licencia Apache 2.0, sin descripción, sin especificaciones técnicas, sin datos de entrenamiento ni resultados de benchmarks. El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, lo que indica que se trata de una publicación reciente y sin validación por parte de la comunidad.

Por tanto, esta ficha se limita a documentar lo verificable (identificador, autor, licencia, fecha y etiquetas) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación empírica propia, dado que no existen garantías documentadas sobre el comportamiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado) |
| Parámetros totales | no disponible (el identificador sugiere ~4B, no confirmado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. El nombre del repositorio sugiere una base Qwen 3.5 de ~4B parámetros y un ajuste orientado a *tool calling* con formato Hermes, pero no hay documentación que confirme la arquitectura exacta (transformer denso, MoE u otra), el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o SFT.

Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, modos de razonamiento explícito, etc.). El autor no ha incluido información sobre el proceso de ajuste, hiperparámetros ni datos de evaluación.

## Capacidades

- Generación de texto: presumible por tratarse de un modelo de lenguaje, aunque no documentado.
- *Tool calling* / *function calling*: el identificador del modelo indica que es su propósito declarado, pero no hay ejemplos, esquemas ni documentación del formato soportado.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de código, matemáticas o visión: no disponible.
- Modo *thinking* o razonamiento explícito: no disponible.

## Casos de uso

Dado que no hay documentación funcional, los siguientes casos son hipótesis razonables derivadas del nombre del modelo y deben validarse empíricamente antes de cualquier despliegue:

- Integración en agentes con *function calling*: el modelo estaría pensado para invocar herramientas externas (APIs, bases de datos, calculadoras) mediante un esquema estructurado, pero el formato exacto debe inferirse probando el modelo.
- Automatización de flujos con LLM en local: con ~4B parámetros (según el nombre), podría ejecutarse en hardware de consumo, lo que permitiría pipelines de automatización sin dependencia de APIs externas.
- Prototipado rápido de asistentes conversacionales: útil para experimentar con arquitecturas de agente antes de migrar a modelos mayores.
- Extracción estructurada de información: si el ajuste Hermes funciona como se espera, podría generar JSON conforme a esquemas para tareas de parsing.
- Evaluación comparativa de técnicas de *tool calling*: útil en investigación para contrastar formatos de function calling entre modelos pequeños.
- Filtrado y clasificación de texto en entornos con requisitos de privacidad: al ser Apache 2.0 y presumiblemente ejecutable en local, permitiría procesar datos sensibles sin salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo denso de ~4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM; en cuantización de 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones genéricas y no han sido verificadas para este modelo concreto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí para GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090) si se confirma el tamaño de ~4B, pero no está verificado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque las especificaciones del modelo no están publicadas. A modo de contexto, se incluyen alternativas de la misma categoría (modelos pequeños orientados a *tool calling*), con datos públicos:

| Modelo | Parámetros | Contexto | Licencia | Tool calling documentado |
|---|---|---|---|---|
| ertghiu256/qwen3.5-4b-hermes-tool-calling | no disponible (~4B según nombre) | no disponible | Apache 2.0 | No documentado |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | Sí (formato Hermes/Qwen) |
| Hermes-3-Llama-3.2-3B | 3B | 131.072 tokens | Llama 3.2 Community | Sí (formato Hermes) |
| Llama-3.2-3B-Instruct | 3B | 131.072 tokens | Llama 3.2 Community | Parcial (prompt-based) |

La comparación de rendimiento no está disponible para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ejemplos de uso ni esquemas de herramientas, lo que impide conocer el formato exacto de *tool calling* esperado.
- Sin validación comunitaria: 0 descargas y 0 *likes* implican que el modelo no ha sido probado ni auditado por terceros.
- Riesgo de alucinación: desconocido, pero probablemente alto en tareas de function calling si el ajuste no se ha validado (generación de argumentos inventados o llamadas a funciones inexistentes).
- Sesgos: no evaluados ni documentados.
- Idiomas: no se especifica qué idiomas soporta; el rendimiento en castellano es desconocido.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de ningún tipo; conviene revisar si el modelo base (presumiblemente Qwen) impone condiciones adicionales que el autor no haya reflejado.
- Caveat de producción: no debería desplegarse en entornos críticos sin una batería de pruebas propia que cubra precisión de llamadas a herramientas, robustez ante entradas malformadas y comportamiento multilingüe.
- Fecha de creación futura (2026-11-16): conviene verificar la autenticidad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/ertghiu256/qwen3.5-4b-hermes-tool-calling
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
