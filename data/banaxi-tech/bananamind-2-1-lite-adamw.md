# Banaxi-Tech/BananaMind-2.1-Lite-AdamW

## Resumen

BananaMind 2.1 Lite es un modelo de lenguaje causal de 24.949.999 parámetros (clase sub-25M) desarrollado por Banaxi-Tech, un proyecto independiente centrado en herramientas de IA y experimentos de bajo nivel. El modelo combina un núcleo Transformer de 19.950.029 parámetros con un módulo trigram causal de dos hashes de 4.999.970 parámetros, lo que da una arquitectura híbrida con ejecución parcialmente repetida (partially-looped) de capas. Está diseñado para tareas de generación de texto en inglés con una ventana de contexto de 4.096 tokens.

El modelo se entrenó con un currículum de 75.000 millones de tokens procedentes de fuentes como FineWeb-Edu, DCLM, Cosmopedia, FineMath, FinePhrase y NPset, usando el optimizador AdamW. Su licencia Apache-2.0 permite uso comercial sin restricciones. Aunque es un modelo pequeño, su arquitectura innovadora (reutilización de capas físicas y módulo n-gram) lo hace relevante para experimentación en eficiencia y para despliegue en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con módulo trigram de dos hashes (partially-looped) |
| Parametros totales | 24.949.999 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints publicados) |

## Arquitectura y entrenamiento

La arquitectura de BananaMind 2.1 Lite es un Transformer causal con una peculiaridad: dos de sus 13 capas físicas (L5 y L9) se evalúan dos veces en cada pasada, dando un total de 15 pasadas efectivas. Esto se logra compartiendo los pesos de esas capas entre dos visitas consecutivas, con escalas de inyección aprendidas separadas para cada visita. Además, incorpora un módulo trigram causal que utiliza dos tablas hash independientes de 51.699 entradas con 48 características por hash, cuyas 96 características concatenadas se proyectan a la corriente residual de 384 dimensiones. Este módulo se calcula una vez y se reinyecta antes de cada visita a L5 y L9.

El entrenamiento siguió un currículum de 75.000 millones de tokens con una distribución ponderada: 50% FineWeb-Edu, 22% DCLM Baseline, 10% Cosmopedia v2, 9% FineMath 4+, 6% FinePhrase y 3% NPset-2 Python-Edu. Se usó AdamW con betas (0.9, 0.95), tasa de aprendizaje pico de 0.003 para el núcleo Transformer y 0.001 para el módulo n-gram, con un programa de warmup-estable-decay y decaimiento coseno final del 15%. Los checkpoints se publican cada 5% del entrenamiento con safetensors, tokenizador y estado completo para reanudar.

## Capacidades

- Generación de texto causal en inglés, con capacidad de completar secuencias y generar texto coherente dentro de su contexto de 4.096 tokens.
- Procesamiento de lenguaje natural básico: modelado de lenguaje, predicción de siguiente token y generación de texto condicionada.
- Arquitectura eficiente para inferencia en dispositivos con recursos limitados gracias a su tamaño reducido (25M parámetros).
- Tokenizador propio de 8.192 tokens (heredado de BananaMind 2 Nano), optimizado para el vocabulario del modelo.
- Soporte de ejecución en sistemas sin sistema operativo completo (según el proyecto BananaMindOS, que permite inferencia en CPUs x86 de 32 bits).
- No se documentan capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Generación de texto en dispositivos embebidos: al tener solo 25M parámetros, puede ejecutarse en microcontroladores o sistemas con poca memoria, por ejemplo para autocompletado de texto en teclados virtuales o asistentes locales.
- Experimentación educativa: su arquitectura partially-looped y el módulo trigram son ideales para estudiar técnicas de reutilización de capas y modelado n-gram en cursos de aprendizaje automático.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden usarlo como base para probar pipelines de generación de texto antes de escalar a modelos más grandes.
- Inferencia en hardware antiguo: el proyecto BananaMindOS demuestra que puede ejecutarse en CPUs Intel 486 emuladas, lo que lo hace útil para preservación digital o entornos sin GPU.
- Generación de contenido corto: puede generar frases, títulos o descripciones breves en inglés, aunque con limitaciones de coherencia a largo plazo.
- Investigación en eficiencia de modelos: su diseño con capas compartidas y módulo n-gram sirve como banco de pruebas para comparar arquitecturas compactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- Al ser un modelo de 24,9M parámetros, la VRAM necesaria para inferencia es muy reducida: en FP16 ocuparía aproximadamente 50 MB, en FP32 unos 100 MB, y en cuantización int8 unos 25 MB.
- Cabe en cualquier GPU consumer moderna (incluso integradas) y también en CPU, con latencia baja para generación de texto corto.
- El entrenamiento se realizó con 4 o 8 GPUs H200 (según el script de lanzamiento), pero para inferencia no se requieren GPUs de alta gama.
- Opciones de despliegue: al ser un modelo pequeño, puede ejecutarse con llama.cpp, Ollama, o directamente con el código personalizado de Banaxi-Tech. También existe BananaMindOS para entornos sin sistema operativo.
- No se proporcionan datos de throughput o latencia específicos en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo muy pequeño (25M parámetros), por lo que su capacidad de razonamiento y coherencia es limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Contexto limitado a 4.096 tokens, lo que restringe tareas que requieren dependencias de largo alcance.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar.
- Riesgo de alucinación y errores factuales, especialmente en generación de texto libre, como se advierte en la versión anterior (BananaMind V1).
- Al ser un proyecto independiente, el soporte y mantenimiento pueden ser limitados.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de robustez para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Lite-AdamW
- Modelo principal (sin AdamW): https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Lite
- Variante Flash-Lite: https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Flash-Lite
- Repositorio de Banaxi-Tech en GitHub: https://github.com/Banaxi-Tech
- Proyecto BananaMindOS: https://github.com/BananaMind/BananaMindOS
- Versión anterior en Ollama: https://ollama.com/banaxitech/bananamind-v1
