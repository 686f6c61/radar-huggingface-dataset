# manateelazycat/Nemotron-3.5-Bolt-E4B-AIPod-HF

## Resumen

Nemotron-3.5-Bolt-E4B-AIPod-HF es un repositorio de integración publicado por el usuario manateelazycat que empaqueta los pesos de NVIDIA Nemotron 3.5 Bolt E4B en dos formatos: un objetivo cuantizado Q4_K_M sin modificar y pesos BF16 DFlash, ambos fijados y verificados a nivel de byte. El modelo base es un transformer de NVIDIA orientado a generación de texto conversacional, con aproximadamente 7.500 millones de parámetros totales según los safetensors del repositorio. No se trata de un modelo nuevo entrenado por el autor, sino de una redistribución con empaquetado específico para el entorno "AI Pod" del publicador.

El repositorio tiene un tamaño de 6,9 GB, lo que es coherente con una mezcla de pesos cuantizados Q4_K_M (para inferencia eficiente) y pesos BF16 parciales (DFlash). La model card es explícitamente cauta: indica que la aceptación final del runtime y del LPK está en curso y que no se hacen afirmaciones de rendimiento validadas en esta etapa. Esto implica que el artefacto debe tratarse como una integración experimental, no como un lanzamiento estable.

La relevancia actual es limitada pero concreta: sirve a quienes necesitan desplegar Nemotron 3.5 Bolt E4B en formato GGUF dentro de un pipeline "AI Pod" con verificación de procedencia (upstream-lock.json). Para el resto de desarrolladores, la referencia canónica debería ser el repositorio original de NVIDIA, ya que este repositorio no aporta documentación técnica propia sobre arquitectura, entrenamiento o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base NVIDIA Nemotron 3.5 Bolt E4B; detalles no disponibles en este repositorio) |
| Parametros totales | 7.518.069.290 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) y BF16 (DFlash) |
| Idiomas soportados | en, zh |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (Q4_K_M) y BF16 (DFlash) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Por el nombre "Nemotron 3.5 Bolt E4B" y el tamaño de 7.518 millones de parámetros, se trata de un transformer de la familia Nemotron de NVIDIA, pero este repositorio no incluye detalles sobre número de capas, dimensión oculta, mecanismo de atención, ni si emplea técnicas como atención lineal o decodificación especulativa. Tampoco se documenta el proceso de entrenamiento: número de tokens, composición del dataset, fases de RLHF/DPO o ajuste instructivo.

Lo único verificable en este repositorio es el empaquetado: un objetivo Q4_K_M "sin modificar" y pesos BF16 DFlash, ambos fijados y verificados byte a byte, con un archivo upstream-lock.json que referencia los repositorios de origen. La model card remite explícitamente a las model cards upstream para obtener información sobre origen, licencia, limitaciones y formato de prompting. Cualquier afirmación sobre innovaciones técnicas del modelo base requeriría consultar la documentación de NVIDIA, que no está incluida en la información proporcionada.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Compatibilidad con endpoints, indicada por la etiqueta endpoints_compatible.
- Uso de técnica imatrix en la cuantización, según la etiqueta del repositorio, lo que sugiere una cuantización calibrada con matriz de importancia.
- No se documentan en este repositorio capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking. Cualquier capacidad de este tipo debe verificarse en la model card upstream de NVIDIA.

## Casos de uso

- Despliegue en entornos "AI Pod": el repositorio está diseñado específicamente para integrar Nemotron 3.5 Bolt E4B en este entorno, con pesos Q4_K_M listos para cargar y verificación de procedencia mediante upstream-lock.json.
- Inferencia en hardware con VRAM limitada: la variante Q4_K_M de aproximadamente 7.500 millones de parámetros permite ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, algo inviable con pesos BF16 completos.
- Verificación de cadena de suministro de modelos: el pinning y la verificación byte a byte de los pesos permiten auditar que el artefacto desplegado coincide con el original de NVIDIA, útil en entornos con requisitos de compliance.
- Prototipado de asistentes conversacionales en inglés y chino: el modelo puede usarse para generar respuestas multi-turno en estos dos idiomas, aunque sin garantías de rendimiento validadas por el autor del repositorio.
- Evaluación comparativa de cuantizaciones: al incluir tanto Q4_K_M como BF16 DFlash, el repositorio permite medir la degradación de calidad entre ambas variantes en tareas concretas.
- Integración en pipelines con llama.cpp u Ollama: el formato GGUF facilita la carga en runtimes de inferencia locales para pruebas de concepto y desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no validated performance claims are made at this stage" y que la aceptación del runtime y del LPK está en curso.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 5-6 GB para los pesos, más overhead de contexto KV; en la práctica, unos 8 GB de VRAM permiten ejecución cómoda con contexto moderado.
- VRAM estimada para BF16: aproximadamente 15 GB solo para pesos, más caché KV; requiere GPUs de 24 GB o más para contexto amplio.
- GPUs de consumo: la variante Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con contexto reducido.
- GPUs profesionales: A100, H100 y L40S pueden ejecutar ambas variantes, con margen amplio para lotes y contextos largos.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI requerirían pesos en safetensors/BF16, no incluidos como tales en este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones y el autor declara que el rendimiento no está validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-AIPod-HF (este repo) | 7.518 M | no disponible | openmdw-1.1 | GGUF Q4_K_M y BF16 DFlash en HuggingFace |
| Nemotron 3.5 Bolt E4B (upstream NVIDIA) | 7.518 M (presumiblemente) | no disponible | no disponible en esta informacion | Repositorio original de NVIDIA |
| Alternativas de ~7-8B (p. ej. familias Llama, Mistral, Qwen) | ~7.000-8.000 M | variable | variable | no disponible para comparacion directa con datos verificados |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia. Cualquier comparación de calidad requeriría benchmarks que no están publicados en este repositorio.

## Limitaciones y advertencias

- Repositorio sin validación de rendimiento: el autor declara explícitamente que la aceptación del runtime y del LPK está en curso y que no se hacen afirmaciones de rendimiento validadas.
- Documentación técnica ausente: no se detallan arquitectura, contexto, datos de entrenamiento ni benchmarks; hay que remitirse a las model cards upstream de NVIDIA.
- Idiomas limitados: solo inglés y chino; no hay soporte declarado para castellano ni otras lenguas.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones publicadas en este repositorio que lo cuantifiquen.
- Licencia openmdw-1.1: es responsabilidad del usuario revisar los términos completos antes de uso comercial; este repositorio no aclara restricciones adicionales más allá de la licencia declarada.
- Integración específica: el empaquetado está pensado para "AI Pod"; fuera de ese entorno, la ventaja frente al repositorio original de NVIDIA es limitada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Ausencia de datos sobre sesgos: no se documentan sesgos conocidos en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/manateelazycat/Nemotron-3.5-Bolt-E4B-AIPod-HF
- Modelo upstream de NVIDIA: no disponible en la información proporcionada (la model card remite a las model cards upstream y a upstream-lock.json, pero no se incluyen URL concretas)
- Paper, blog o demo: no disponible en la información proporcionada
