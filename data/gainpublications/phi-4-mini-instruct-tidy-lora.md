# GainPublications/Phi-4-mini-instruct-Tidy-LoRA

## Resumen

Phi-4-mini-instruct-Tidy-LoRA es un adaptador LoRA publicado por GainPublications sobre el modelo base microsoft/Phi-4-mini-instruct. No es un modelo de propósito general, sino un ajuste fino diseñado para una única tarea: el etiquetado línea a línea de hojas de letras de canciones pegadas por el usuario (línea cantada, encabezado de sección, nota, línea de acordes, etc.), de forma que un programa pueda reconstruir la hoja a partir de las líneas originales del usuario. El adaptador no genera letras nuevas.

El adaptador se distribuye en formato GGUF F16 (46.155.584 bytes) y está pensado para cargarse junto al GGUF Q4_K_M del modelo base publicado por el mismo autor, mediante `llama-server` de llama.cpp con el flag `--lora`. El entrenamiento se realizó con QLoRA sobre el modelo base cuantizado en 4 bits (NF4), con rango 16, alpha 32 y dropout 0,05 sobre las proyecciones `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`, durante una época (283 pasos).

La relevancia de esta ficha es acotada: se trata de un artefacto muy específico, con cero descargas y cero likes en el momento de la consulta, orientado a integrarse en la estación de trabajo musical Takehouse. No debe confundirse con un modelo conversacional ni evaluarse con benchmarks generales: su utilidad se mide en la tasa de acierto de etiquetado sobre hojas de letras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (Phi-4-mini-instruct) |
| Parametros totales | 23.068.672 (adaptador; el modelo base no se incluye en este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | F16 para el adaptador GGUF; el base referenciado se usa en Q4_K_M |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (F16); adaptador LoRA convertible desde PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Phi-4-mini-instruct, un transformer decoder-only del que no se detallan en la informacion proporcionada ni el número de capas ni la dimensión oculta ni el contexto máximo. El ajuste se realizó con QLoRA sobre el base cuantizado en 4 bits NF4 con doble cuantización y cómputo en BF16. Los hiperparámetros son: rango 16, alpha 32, dropout 0,05, módulos objetivo `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`, una época (283 pasos), learning rate 2e-4 con decaimiento coseno, optimizador `paged_adamw_8bit`, gradient checkpointing y recorte de gradiente a 1,0. Se conservó el checkpoint del paso 280.

Los datos de entrenamiento son 4.527 ejemplos construidos específicamente: letras de canciones generadas y desordenadas en hojas caóticas, hojas en formatos reales habituales y ejemplos de escritura para no degradar la capacidad de redacción del base. Cada ejemplo está etiquetado línea a línea. La conversión a GGUF F16 se hizo con `convert_lora_to_gguf.py` de llama.cpp en el commit `23f83e056d88ddae0d56b01ccc65fa42ab6625f7`. No se menciona RLHF ni DPO; el ajuste es supervisado sobre la tarea de etiquetado.

## Capacidades

- Etiquetado línea a línea de hojas de letras: distingue línea cantada, encabezado de sección, nota y línea de acordes.
- Reconstrucción de la estructura de una hoja a partir de las líneas originales del usuario, sin reescribir el contenido.
- Conservación de la capacidad de escritura del modelo base gracias a la inclusión de ejemplos de escritura en el dataset.
- Integración con llama.cpp mediante `llama-server` y el flag `--lora`.
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma declarada en la informacion proporcionada.
- Multilingüe: no; el modelo declara únicamente inglés (`en`).
- No genera letras nuevas: es una restricción de diseño explícita.

## Casos de uso

- Estación de trabajo musical Takehouse: el adaptador es el fichero que descarga la aplicación con su escritor de letras local y se carga solo para la tarea de etiquetado, de modo que el programa puede reconstruir la hoja del usuario sin enviar datos a un servicio externo.
- Preprocesado de hojas de letras para editores: separar líneas cantadas, acordes y encabezados permite renderizar la hoja con formato tipográfico diferenciado y habilitar funciones de transposición o sincronización.
- Importación de letras en formatos heterogéneos: al haberse entrenado con hojas en formatos reales habituales, sirve para normalizar texto pegado desde foros, correos o documentos ofimáticos.
- Anotación asistida de corpus musical: etiquetar automáticamente hojas para construir datasets estructurados de letras y acordes con metadatos por línea.
- Herramientas de accesibilidad: la clasificación por tipo de línea facilita la lectura estructurada de hojas de letras por lectores de pantalla o interfaces de voz.
- Filtrado y control de calidad en pipelines de contenido: detectar líneas de acordes o encabezados para validar o transformar hojas antes de publicarlas.
- Uso embebido en local: al ejecutarse con llama.cpp sobre el Q4_K_M del base, encaja en aplicaciones de escritorio que requieren inferencia sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La única evaluación reportada es específica de la tarea:

| Metrica | Con adaptador | Sin adaptador |
|---|---|---|
| Hojas que pasan la comprobacion de formato (sobre 65 retenidas) | 54 | 2 |
| Lineas etiquetadas correctamente | 99,2 % | no disponible |

## Requisitos de hardware

- El adaptador en sí ocupa 46.155.584 bytes (aproximadamente 44 MiB) en F16, por lo que su huella de VRAM es despreciable frente al modelo base.
- El requisito real lo marca el base: el GGUF referenciado `Phi-4-mini-instruct-Q4_K_M.gguf` pesa 2.493.840.704 bytes (aproximadamente 2,3 GiB), lo que permite ejecución en CPU y en GPUs de consumo con suficiente memoria libre para el contexto.
- GPU recomendadas: no especificadas en la informacion proporcionada; por el tamaño del base Q4_K_M, es viable en GPUs de consumo con al menos unos pocos GiB libres, aunque no se aportan cifras oficiales.
- Despliegue: llama.cpp, concretamente `llama-server -m Phi-4-mini-instruct-Q4_K_M.gguf --lora Phi-4-mini-instruct-Tidy-LoRA-v1-F16.gguf`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.
- Advertencia de compatibilidad: el autor indica que el adaptador funciona solo con su GGUF Q4_K_M concreto, identificado por SHA-256 `5d2bfa39f12d0c2b4aed118e84e5721cd547630b4fd7f1783ad30c5ffb124062`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GainPublications/Phi-4-mini-instruct-Tidy-LoRA | Adaptador LoRA para etiquetado de hojas de letras | 23.068.672 (adaptador) | no disponible | MIT | Hugging Face, 0 descargas |
| microsoft/Phi-4-mini-instruct | Modelo base instructivo de propósito general | no disponible en la informacion proporcionada | no disponible | MIT | Hugging Face (modelo base referenciado) |
| GainPublications/Phi-4-mini-instruct-GGUF | Cuantización GGUF del base, requerida por el adaptador | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face (repo del mismo autor) |

No se dispone de datos de rendimiento comparables entre estos artefactos ni de otras alternativas de la misma categoría (adaptadores para etiquetado de letras) en la informacion proporcionada.

## Limitaciones y advertencias

- Tarea única: no es un modelo conversacional ni de generación de letras; usarlo fuera del etiquetado de hojas producirá resultados no representativos.
- Dependencia estricta del GGUF base concreto indicado por el autor; otros GGUF, otras cuantizaciones u otras revisiones del base pueden no ser compatibles.
- Tendencia documentada a omitir líneas en hojas de 100 líneas o más, lo que degrada la reconstrucción en documentos largos.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación y de etiquetado erróneo en formatos de hoja no vistos durante el entrenamiento (4.527 ejemplos).
- Sesgos: no documentados en la informacion proporcionada; al derivar de un base entrenado con datos web, puede heredar sesgos de este.
- Licencia MIT, que permite uso comercial, pero el adaptador es un derivado de Phi-4-mini-instruct (MIT, © Microsoft Corporation) y el aviso correspondiente debe conservarse en el fichero `LICENSE`.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- No se especifican requisitos de contexto ni límites de longitud de entrada más allá de la advertencia sobre hojas largas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/GainPublications/Phi-4-mini-instruct-Tidy-LoRA
- GGUF del modelo base requerido: https://huggingface.co/GainPublications/Phi-4-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de llama.cpp (conversión y servidor): https://github.com/ggml-org/llama.cpp
