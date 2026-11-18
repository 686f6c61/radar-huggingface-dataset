# chenyumo/moziAI-35B-A3B-MOE-MTP

## Resumen

MoziAI-35B-V3.8 es un ajuste fino (finetune) del modelo base Ornith-1.5-35B-A3B, una arquitectura MoE de 35.505.251.456 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token. Lo desarrolla el equipo de Chen Yumo (chenyumo en Hugging Face), y su propuesta principal es ofrecer un modelo multimodal de despliegue local con enfoque en el dominio financiero, capacidades de tool calling y una cuantización propietaria denominada MoziSmartBit que reduce el peso del modelo a unos 15,9 GB.

El modelo se distribuye principalmente en formato GGUF para llama.cpp, con licencia Apache 2.0, y está etiquetado como "uncensored", es decir, sin moderación de contenido en la generación. Incorpora un marco de razonamiento propietario de "siete dimensiones" y un mecanismo de iteración tipo agente (LOOP) que el autor describe como diferenciadores frente al modelo base. También declara soporte de decodificación especulativa mediante MTP (multi-token prediction).

Es relevante ahora porque ocupa un nicho concreto: modelos MoE de tamaño medio que caben en GPU de consumo con 20 GB o más de VRAM, con licencia permisiva y orientados a uso comercial sin coste. No obstante, la información técnica publicada es escasa y mayoritariamente cualitativa, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de Qwen3.5-35B-A3B / Qwen3.6-35B-A3B, según el autor) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el nombre del modelo indica A3B, es decir, ~3 B activos; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización propietaria MoziSmartBit (peso principal ~15,9 GB); imatrix; comparativa con Q4_K_M mencionada en la model card |
| Idiomas soportados | en, zh (la model card declara 201 idiomas y dialectos, con optimización especial para chino) |
| Licencia | Apache 2.0 (componentes upstream Qwen/Gemma Apache-2.0; incrementos Ornith bajo MIT) |
| Formato de pesos | GGUF (librería llama-cpp); repo de 47,8 GB con múltiples archivos |

## Arquitectura y entrenamiento

El modelo parte de Ornith-1.5-35B-A3B, que según el autor sigue la arquitectura de Qwen3.5-35B-A3B / Qwen3.6-35B-A3B: un transformer con mezcla de expertos (MoE) de 35,5 mil millones de parámetros totales. El ajuste fino añade datos financieros propios del equipo, capacidades de dominio financiero, un "marco de pensamiento dinámico de siete dimensiones" (comprensión de la tarea, evaluación de complejidad, dependencias, evaluación de riesgos, necesidades de recursos, criterios de aceptación y estrategia de ejecución) y un mecanismo de iteración tipo agente denominado LOOP, con dos rondas de ejecución y verificación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card menciona una "optimización uncensored" sin detallar el procedimiento. La innovación técnica más destacada es MoziSmartBit, una cuantización por capas diferenciada para estructuras MoE que, según el autor, mantiene aproximadamente el 99 % de la precisión de FP16 con una compresión de 4,5x. También se anuncia soporte de decodificación especulativa mediante MTP.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado mediante el marco propietario de siete dimensiones, con niveles 0, 1 y 2 según la complejidad de la tarea.
- Modo de iteración agente (LOOP) para tareas complejas, con autoverificación antes de la respuesta final.
- Tool calling / function calling, con optimización declarada para el dominio financiero.
- Capacidades multimodales (etiqueta "vision" en el repo; la model card se describe como multimodal).
- Programación general: desarrollo full-stack, depuración y diseño de arquitectura en Python, JavaScript, TypeScript, Go y Rust.
- Capacidades multilingües: la model card declara 201 idiomas y dialectos, con optimización especial para chino; los idiomas oficialmente etiquetados son en y zh.
- Modo sin censura: sin moderación de contenido en la generación.
- Decodificación especulativa acelerada mediante MTP.
- Escritura de texto de calidad, según la model card.

## Casos de uso

- Análisis financiero asistido: el ajuste incorpora datos y capacidades de dominio financiero, por lo que puede emplearse para resumir informes, comparar métricas y responder preguntas sobre instrumentos financieros, con la advertencia de que la tolerancia del dominio al error es muy baja y requiere verificación humana.
- Programación cuantitativa: generación y depuración de código de estrategias en Python, aprovechando el soporte de tool calling para integrarse con APIs de datos de mercado.
- Asistente de desarrollo local: al caber en una GPU de consumo con más de 20 GB de VRAM, permite autocompletado, refactorización y explicación de código sin enviar el código a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Automatización de agentes con tool calling: el mecanismo LOOP y el soporte de function calling permiten construir flujos multi-paso (consulta de datos, cálculo, validación) en pipelines internos.
- Procesamiento de documentos con componente visual: la etiqueta "vision" sugiere uso en extracción de información de capturas, tablas o documentos escaneados, aunque no se detallan las capacidades visuales exactas.
- Despliegue local con privacidad estricta: al ejecutarse con llama.cpp sobre hardware propio, es apto para entornos sanitarios, legales o financieros donde los datos no pueden salir del perímetro.
- Investigación sobre modelos sin moderación: útil para estudiar comportamiento de modelos sin filtros en entornos académicos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "14. Benchmarks", pero su contenido no se ha proporcionado; solo se afirma de forma cualitativa que el modelo supera a modelos generales del mismo tamaño en el dominio financiero y que MoziSmartBit mantiene ~99 % de la precisión de FP16.

## Requisitos de hardware

- VRAM estimada: unos 15,9 GB para el archivo MoziSmartBit principal; aproximadamente 22 GB si se usa una cuantización Q4_K_M estándar.
- GPU recomendadas: el autor indica GPU de consumo con 20 GB de VRAM o más; encajan una RTX 4090 (24 GB) y, con menos margen, una RTX 3090 (24 GB). Para mayor comodidad, A100 o H100 permiten contexto más largo y mayor paralelismo, aunque no se publican cifras de throughput.
- ¿Cabe en GPU de consumo? Sí, según el autor, en tarjetas con 20 GB o más de VRAM con la cuantización MoziSmartBit.
- Opciones de despliegue: llama.cpp (librería declarada), servidores compatibles con endpoints (etiqueta "endpoints_compatible"); no se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor menciona aceleración por decodificación especulativa (MTP) sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoziAI-35B-A3B-MOE-MTP | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Finetune financiero de Ornith-1.5-35B-A3B, cuantización MoziSmartBit, sin benchmarks publicados |
| Ornith-1.5-35B-A3B (base) | 35,5 B (MoE) | no disponible | MIT + Apache 2.0 | no disponible | Modelo base sin el ajuste financiero ni el marco de razonamiento propietario |
| Qwen3.5-35B-A3B / Qwen3.6-35B-A3B | ~35 B (MoE) | no disponible | Apache 2.0 | no disponible | Arquitectura de referencia citada por el autor; sin datos comparativos de rendimiento en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados en la información disponible: las afirmaciones de rendimiento de la model card no son verificables.
- El modo "uncensored" implica ausencia de moderación; no es adecuado para aplicaciones de cara al público sin capas de filtrado adicionales.
- Riesgo de alucinación relevante en el dominio financiero, donde el propio autor reconoce una tolerancia muy baja al error.
- Idiomas oficialmente soportados: inglés y chino; el resto de los 201 idiomas declarados no está verificado y probablemente tenga calidad desigual.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con documentos largos.
- La cuantización MoziSmartBit es propietaria y su reproducibilidad y compatibilidad con herramientas estándar no están documentadas.
- La licencia Apache 2.0 es permisiva para uso comercial, pero deben respetarse las atribuciones de los componentes upstream (Qwen/Gemma Apache-2.0, Ornith MIT) indicadas en el archivo NOTICE.
- No se confirma compatibilidad con vLLM, TGI u Ollama, lo que limita las opciones de despliegue en producción a gran escala.
- El repositorio ocupa 47,8 GB con múltiples archivos; conviene descargar solo la variante necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/LICENSE
- README en español: V3.8/README.es.md (dentro del repositorio)
- README en inglés: V3.8/README.en.md (dentro del repositorio)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
