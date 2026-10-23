# praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-mix

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-mix` es un adaptador LoRA (librería PEFT, pesos en safetensors) construido sobre el modelo base `Qwen/Qwen2.5-1.5B`. Por los metadatos disponibles (etiquetas `benchmark-slm`, `dataset-fiven`, `strategy-mix`, `or2`), se trata de un artefacto experimental generado dentro de una batería de evaluación de modelos de lenguaje pequeños (SLM), no de un modelo orientado a producción. El autor es la organización `praiselab-picuslab` y el repositorio está restringido (gated): requiere aceptar condiciones en HuggingFace para acceder a los ficheros.

El modelo hereda del base una arquitectura transformer decoder-only densa de 1.500 millones de parámetros y una ventana de contexto nativa de 32.768 tokens, pero el adaptador en sí no documenta ni el rango de LoRA, ni los módulos objetivo, ni el volumen o composición de los datos de entrenamiento. La única indicación de idioma es la etiqueta `it` (italiano), lo que sugiere un ajuste orientado a ese idioma, probablemente sobre el conjunto de datos denominado `fiven` según las etiquetas del repositorio.

Su relevancia ahora es limitada y de carácter metodológico: sirve como pieza reproducible en comparativas de SLM en italiano y como ejemplo de adaptación ligera sobre Qwen2.5-1.5B. Con 0 descargas, 0 likes, un tamaño de repositorio de 0,0 GB y sin licencia declarada, no debe considerarse una base fiable para despliegues reales sin una validación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5: 28 capas, dimensión oculta 1536, atención GQA con 12 cabezas de consulta y 2 de clave/valor, RoPE, SwiGLU y RMSNorm (arquitectura heredada del modelo base) |
| Parámetros totales | 1,5B en el modelo base; el número de parámetros del adaptador no está documentado en la información disponible y el repositorio ocupa 0,0 GB |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | 32.768 tokens nativos del modelo base (ampliable a 131.072 con YaRN); no se documenta si el ajuste preserva esa ventana |
| Tipos de cuantización | No disponible en el repositorio (se distribuyen pesos LoRA en safetensors). Tras fusionar con el base admite FP16/BF16 y cuantizaciones de terceros (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Italiano (etiqueta `it`); el modelo base Qwen2.5 declara cobertura de más de 29 idiomas |
| Licencia | No disponible (el modelo base Qwen2.5-1.5B se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, es decir, matrices de bajo rango que se aplican sobre las capas del transformer del modelo base Qwen2.5-1.5B. La información pública no especifica el rango (`r`), el valor de `alpha`, el dropout ni los módulos objetivo (atención, MLP o ambos), que son los hiperparámetros determinantes del comportamiento de un adaptador de este tipo. Tampoco se detalla si el adaptador se entrenó con congelación total del base o con algún otro esquema.

Respecto a los datos, las etiquetas indican `dataset-fiven` y `strategy-mix`, lo que apunta a un conjunto de datos propio denominado «fiven» y a una estrategia de mezcla de datos o de tareas, pero no se publica el número de tokens, la composición del corpus, la proporción de datos sintéticos ni si hubo etapas de alineación (SFT, RLHF o DPO). No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación); todo apunta a un ajuste supervisado convencional con PEFT sobre un único modelo base.

## Capacidades

- Generación de texto conversacional en italiano, heredada del ajuste sobre Qwen2.5-1.5B y orientada por la etiqueta `conversational`.
- Respuesta a instrucciones de complejidad baja o media, propia de un modelo de 1,5B parámetros.
- Razonamiento básico y aritmética sencilla, con la fiabilidad limitada que impone el tamaño.
- Generación de código de fragmentos cortos, capacidad heredada del modelo base, no verificada en este adaptador.
- Capacidades multilingües residuales del base Qwen2.5, aunque el ajuste declarado es solo italiano.
- No se documenta soporte de tool calling ni de function calling específico para este adaptador.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni uso de agentes multi-paso.
- No se documenta ninguna capacidad adicional más allá de la generación de texto.

## Casos de uso

- Evaluación comparativa de SLM en italiano: usar el adaptador como uno de los participantes de la batería `benchmark-slm`, midiendo con el mismo harness y los mismos prompts que el resto de modelos para obtener una comparación homogénea.
- Reproducibilidad de experimentos académicos: al ser un artefacto de benchmark, permite replicar resultados de ajuste LoRA sobre Qwen2.5-1.5B y comparar estrategias de mezcla de datos (`strategy-mix`).
- Prototipado de asistentes conversacionales en italiano sobre hardware modesto: un modelo de 1,5B se puede servir en una GPU de consumo, lo que facilita pruebas de concepto antes de invertir en modelos mayores.
- Etiquetado y clasificación de textos italianos: tareas de extracción de categorías o normalización de campos donde el coste por token importa más que la precisión máxima.
- Generación de borradores y resúmenes de documentos cortos en italiano, con revisión humana obligatoria dado el riesgo de alucinación del modelo.
- Punto de partida para un ajuste adicional: al ser un adaptador LoRA, se puede continuar el entrenamiento sobre datos propios del dominio sin tocar los pesos del base.
- Despliegue en entornos con recursos limitados o en el borde: tras fusionar y convertir a GGUF, el modelo puede ejecutarse en CPU con llama.cpp para tareas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones en italiano, y con 0 descargas no existen informes de terceros que permitan contrastar su calidad.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (pesos LoRA de bajo rango). El coste real lo determina el modelo base.
- VRAM estimada para el modelo fusionado: en BF16/FP16, en torno a 3,1 GB solo de pesos, más caché KV y activaciones; presupuestar 4-6 GB para contextos moderados. En cuantización de 8 bits, aproximadamente 2 GB; en 4 bits, entre 1 y 1,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inference en FP16 con contexto largo. A100 y H100 son innecesarias para este tamaño y solo se justifican por agregación de peticiones.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más en FP16 y en tarjetas de 4 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador sin fusionar; fusión previa (`merge_and_unload`) y servicio con vLLM o TGI; conversión a GGUF para llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no se han publicado medidas. Como referencia de orden de magnitud, un denso de 1,5B en FP16 sobre una GPU de consumo moderna suele moverse en el rango de decenas a varios cientos de tokens por segundo con lote pequeño; son estimaciones orientativas, no mediciones de este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (benchmark-slm-fiven-qwen2.5-1.5b-mix) | 1,5B (base) + LoRA no documentado | 32.768 (heredado) | No disponible | Acceso restringido, sin benchmarks publicados, ajuste declarado solo en italiano |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Modelo base oficial con alineación documentada y amplia adopción; alternativa directa si se necesita una licencia clara |
| Llama 3.2 1B Instruct | 1,2B | 131.072 | Licencia comunitaria de Llama 3.2 | Ventana de contexto mucho mayor y ecosistema amplio; requiere aceptar la licencia de Meta |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Entrenado con un volumen de tokens explícitamente documentado; contexto más corto |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Términos de uso de Gemma | Algo más grande, contexto más corto y licencia con restricciones de uso |

No hay datos de rendimiento de este adaptador que permitan una comparación cuantitativa; la tabla contrasta únicamente especificaciones y condiciones de licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, aunque el modelo base sea Apache 2.0. Es un bloqueo legal para producción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que impide su uso en pipelines automatizados sin gestión de credenciales.
- Tamaño del repositorio de 0,0 GB: los pesos del adaptador podrían no estar efectivamente subidos o ser meramente testimoniales. Verificar los ficheros antes de cualquier integración.
- Documentación de entrenamiento ausente: sin rango de LoRA, datos, tokens ni hiperparámetros no es posible evaluar sobreajuste, contaminación de benchmarks ni comportamiento esperado.
- Idioma limitado al italiano según la etiqueta; el rendimiento en castellano no está verificado y probablemente sea inferior al del modelo base sin ajustar.
- Riesgo de alucinación elevado por el tamaño (1,5B) y por la ausencia de etapas de alineación documentadas; no apto para respuestas factuales sin verificación.
- Sin validación externa: 0 descargas y 0 likes implican ausencia de informes independientes de calidad o seguridad.
- Sesgos desconocidos: al no documentarse la procedencia del dataset «fiven», no se puede evaluar la composición ni los sesgos incorporados.
- Posible degradación de la ventana de contexto: el ajuste LoRA puede alterar el comportamiento en contextos largos aunque el base soporte 32.768 tokens.
- Fecha de creación en los metadatos: 23 de octubre de 2026, según la información proporcionada; conviene confirmar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-mix
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
