# PILUSATRIO/satri-1b

## Resumen

SATRI-1B es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario PILUSATRIO bajo licencia Apache-2.0. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (r=16, α=16) que debe cargarse encima del modelo base Qwen3-1.7B mediante la librería PEFT. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los del modelo completo.

El adaptador se ha generado mediante la fusión DARE-TIES (densidad = 0,5) de cuatro adaptadores especializados entrenados por separado: uno para indonesio, historia y literatura de Nusantara; otro para razonamiento matemático, lógico y científico con cadena de pensamiento; un tercero para programación en Python/SQL y diseño web; y un cuarto para invocación de herramientas e integración con RAG. El resultado es un único adaptador que agrega capacidades de esos cuatro dominios sobre el Qwen3-1.7B original.

Su relevancia es limitada y experimental: el propio autor lo describe como un "merge LoRA experimental", no optimizado para producción, y advierte que la evaluación se ha realizado sobre conjuntos privados muy pequeños (15 preguntas de desarrollo y 16 de test), por lo que las cifras publicadas son indicativas y no comparables con benchmarks estándar. Aun así, resulta útil como ejemplo práctico de la técnica DARE-TIES aplicada a la fusión de especialistas sobre un modelo pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-1.7B tiene 1,7 mil millones de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen3-1.7B, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantización, pero no se detalla) |
| Idiomas soportados | Indonesio (id) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Los pesos añadidos son de tipo LoRA con rango r=16 y alpha=16, entrenados mediante QLoRA y PEFT. El autor indica que el modelo base no se modifica: todo el conocimiento adicional se inyecta a través de los pesos del adaptador.

El entrenamiento consta de cuatro adaptadores especializados entrenados por separado (indonesio/historia/literatura, matemáticas y ciencias con CoT, programación Python/SQL y diseño web, e invocación de herramientas con RAG). Posteriormente se fusionan en un único adaptador mediante DARE-TIES con densidad 0,5, técnica que poda y reescala deltas de parámetros antes de combinar los especialistas para reducir interferencias entre ellos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en indonesio e inglés.
- Conocimiento específico de historia y literatura de Nusantara (Indonesia).
- Razonamiento matemático, lógico y científico con cadena de pensamiento (CoT).
- Generación de código en Python y SQL, y diseño web.
- Invocación de herramientas (tool calling) e integración con pipelines RAG.
- Capacidad multilingüe limitada a los dos idiomas declarados (id, en).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá del razonamiento CoT del especialista correspondiente.

## Casos de uso

- Asistente conversacional en indonesio: el adaptador puede gestionar diálogos multi-turno sobre historia y cultura local gracias al especialista spec_A, útil para aplicaciones educativas o de divulgación regional.
- Tutor de matemáticas y ciencias: el especialista spec_B con CoT permite explicar pasos intermedios en problemas de lógica y cálculo, adecuado para entornos de aprendizaje asistido.
- Generación de código en pipelines de desarrollo: el especialista spec_C permite autocompletar y generar fragmentos de Python y SQL, integrable en herramientas de edición o revisión de código.
- Diseño web asistido: generación de fragmentos HTML/CSS o sugerencias de estructura de interfaz a partir del especialista de diseño web.
- Agentes con invocación de herramientas: el especialista spec_D permite estructurar llamadas a funciones y consultas a bases de conocimiento en flujos RAG, útil para asistentes que necesitan recuperar información externa.
- Prototipado de investigación sobre fusión de adaptadores: sirve como caso de estudio reproducible de DARE-TIES con densidad 0,5 sobre un modelo de 1,7B, para experimentar con mezclas de especialistas.
- Despliegue ligero en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un base pequeño, permite experimentar en una sola GPU consumer sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de conjuntos privados muy pequeños y no son comparables con benchmarks estándar. El propio autor advierte que son indicativos.

| Conjunto | Qwen3-1.7B (base) | SATRI-1B (merge) |
|---|---|---|
| DEV (15 preguntas) | 66,7% (10/15) | 100% (15/15) |
| TEST (16 preguntas) | 62,5% (10/16) | 93,8% (15/16) |

No se han publicado resultados en benchmarks públicos como MMLU, HumanEval, GSM8K o IndoNLU en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB en disco; el grueso del consumo proviene del modelo base Qwen3-1.7B.
- VRAM estimada para el base en precisión completa (fp16/bf16): en torno a 3,5-4 GB solo para pesos, más memoria para activaciones y caché KV.
- VRAM estimada con cuantización de 4 bits (QLoRA/GGUF): aproximadamente 1,5-2,5 GB, lo que permite ejecución en GPUs consumer.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia cómoda; A100/H100 solo si se necesita alto throughput por lote.
- Cabe en GPUs consumer con 8 GB o más en cuantización de 4 bits; con 16 GB en fp16.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM y TGI para servir el base con el adaptador fusionado, llama.cpp/Ollama si se convierte a GGUF tras fusionar los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SATRI-1B (este) | Adaptador sobre 1,7B | No disponible | Apache-2.0 | Safetensors (PEFT) | Merge DARE-TIES de 4 especialistas; evaluación en sets privados pequeños |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en la información | Apache-2.0 | Safetensors | Modelo completo oficial; referencia directa del adaptador |
| Adaptadores LoRA individuales de satri-1b-adapters | Adaptadores sobre 1,7B | No disponible | Apache-2.0 | Safetensors (PEFT) | Los cuatro especialistas sin fusionar, disponibles por separado |

No se dispone de datos de benchmarks públicos que permitan una comparación de rendimiento fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar y cargar Qwen/Qwen3-1.7B para funcionar; usarlo de forma aislada no es posible.
- Modelo experimental: el autor lo califica explícitamente como no optimizado para producción.
- Evaluación no fiable: los conjuntos DEV y TEST tienen 15 y 16 preguntas respectivamente; un solo acierto altera el porcentaje en más de 6 puntos, por lo que las cifras no constituyen una medida sólida de calidad.
- Sin benchmarks públicos: no hay resultados en MMLU, HumanEval, GSM8K ni IndoNLU que permitan validar las capacidades declaradas.
- Limitación de tamaño: el base de 1,7B impone un techo bajo en tareas complejas de razonamiento o código.
- Cobertura lingüística restringida a indonesio e inglés; no se declara soporte de castellano.
- Riesgo de alucinación inherente a modelos pequeños y a la fusión de especialistas, especialmente en dominios poco representados en el entrenamiento.
- Sesgos potenciales derivados de los datasets de entrenamiento de los cuatro especialistas, no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar también las condiciones del base Qwen3-1.7B (también Apache-2.0) antes de desplegar.
- La fusión DARE-TIES con densidad 0,5 puede degradar capacidades del base no cubiertas por los especialistas; no se documenta una evaluación de olvido catastrófico.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/PILUSATRIO/satri-1b
- Colección de adaptadores especialistas: https://huggingface.co/PILUSATRIO/satri-1b-adapters
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
