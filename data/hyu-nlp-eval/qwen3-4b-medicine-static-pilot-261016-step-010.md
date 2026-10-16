# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-010

## Resumen

qwen3-4b-medicine-static-pilot-261016-step-010 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario HYU-NLP-EVAL en Hugging Face. Se trata de un checkpoint intermedio —concretamente el paso 10— de una ejecución denominada 261016_medicine_static_pilot con semilla 11, orientada aparentemente al dominio médico. El repositorio contiene un export en BF16 para Transformers y, además, el checkpoint nativo de veRL/FSDP en el directorio original_checkpoint/.

Técnicamente es un transformer denso decoder-only de 4.022.468.096 parámetros (4,02 mil millones), sin mezcla de expertos, con licencia Apache 2.0 y pipeline de text-generation. La model card es mínima: no documenta composición del dataset, número de tokens de entrenamiento, hiperparámetros de RL/SFT ni ningún tipo de evaluación, y la ficha de Hugging Face no declara idiomas soportados.

Su relevancia práctica es limitada en el momento de redactar esta ficha: cero descargas y cero likes, ausencia total de benchmarks y una nomenclatura ("static pilot", "step-010") que apunta a un artefacto de experimento interno más que a un modelo listo para producción. Resulta útil, eso sí, como material de reproducción de experimentos de ajuste fino con veRL/FSDP y como sujeto de estudio en investigación sobre seguridad en dominios sensibles como la medicina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); fine-tune del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (4,02 mil millones), según los pesos safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens en su documentación |
| Tipos de cuantizacion | Export BF16 en safetensors; no se publican cuantizaciones propias en este repositorio |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) para Transformers, más checkpoint nativo veRL/FSDP en original_checkpoint/ |
| Autor | HYU-NLP-EVAL |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Fecha de creacion | 2026-10-16 |
| Tamano del repositorio | 25,7 GB (incluye el export BF16 y el checkpoint nativo FSDP) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer denso decoder-only de la familia Qwen3, con 4,02 mil millones de parámetros y sin componentes de mezcla de expertos ni capas de estado recurrente. El checkpoint se distribuye en dos formatos: un export estándar en BF16 compatible con Transformers y el checkpoint nativo generado por el stack veRL/FSDP, lo que indica que el ajuste se realizó con entrenamiento distribuido por sharding de parámetros. El nombre de la ejecución ("medicine_static_pilot") y la presencia de un número de paso sugieren un ajuste supervisado o por refuerzo sobre datos de dominio médico, pero la model card no especifica la técnica exacta ni el algoritmo empleado.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset médico, la proporción de datos generales frente a especializados, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias. La model card únicamente indica el identificador de la ejecución, el paso del checkpoint (10), la semilla (11) y la nota de que el checkpoint local se elimina tras verificar tamaños y hashes SHA256 de los ficheros remotos. No se debe asumir ninguna característica adicional del entrenamiento.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag conversational está presente, por lo que se espera comportamiento de chat, presumiblemente heredado del modelo base.
- Razonamiento y conocimiento general: no verificado en este checkpoint; dependería de lo conservadas que estén las capacidades del modelo base tras el ajuste.
- Código y matemáticas: no hay evidencia publicada de rendimiento en este checkpoint.
- Capacidades médicas: el nombre de la ejecución apunta a un ajuste en dominio médico, pero no se documenta ningún conjunto de evaluación clínica.
- Tool calling / function calling: el modelo base Qwen3-4B-Instruct-2507 lo soporta según su documentación; no hay confirmación para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base es una variante instruct sin modo de razonamiento explícito según su documentación.
- Compatibilidad de despliegue: los tags indican compatibilidad con text-generation-inference y endpoints_compatible.

## Casos de uso

- Reproducción de experimentos de ajuste fino con veRL/FSDP: el directorio original_checkpoint/ permite reanudar el entrenamiento en el paso 10 con la semilla 11, útil para replicar resultados o continuar el run.
- Estudio de la evolución de checkpoints intermedios: comparar este paso 10 con pasos posteriores del mismo run para analizar cómo varía el comportamiento del modelo en tareas médicas a lo largo del entrenamiento.
- Validación de infraestructura de serving: al ser un modelo denso de 4B, cabe en una única GPU de gama consumer, lo que permite probar pipelines de vLLM, TGI u Ollama antes de escalar a modelos mayores.
- Generación de datos sintéticos en dominio médico para prototipado: producir borradores de texto clínico que después pasen por filtrado y revisión humana, nunca para uso directo.
- Investigación sobre alucinación y seguridad en dominios sensibles: usar el modelo como sujeto de prueba para medir la tasa de afirmaciones médicas incorrectas o peligrosas en función de la cuantización y el prompt.
- Base para ajuste adicional (SFT/DPO) en subdominios concretos: partir de un modelo ya expuesto a terminología médica y especializarlo en una tarea acotada, como clasificación de informes o extracción de entidades.
- Pruebas de evaluación automatizada de modelos médicos: integrarlo en arneses de evaluación propios para calibrar métricas antes de aplicarlas a modelos mayores.
- Docencia y demostración técnica: ilustrar un pipeline completo de fine-tune distribuido con export a BF16 y checkpoint nativo en un modelo de tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de dominio médico), y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo. Tampoco existen comparaciones publicadas frente al modelo base Qwen3-4B-Instruct-2507 que permitan cuantificar el efecto del ajuste.

## Requisitos de hardware

- Peso de los parámetros en BF16: aproximadamente 8,05 GB (4,02 mil millones de parámetros × 2 bytes), a lo que hay que sumar caché KV y overhead del runtime.
- VRAM estimada para inferencia en BF16: del orden de 10-12 GB con contexto moderado, según el tamaño del lote y la longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB.
- VRAM estimada en cuantización de 4 bits (Q4_K_M y similares): aproximadamente 2,5-3,5 GB.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, así como equipos Apple Silicon con 16 GB o más de memoria unificada. En configuraciones de 8 bits o 4 bits cabe en GPUs de 6-8 GB.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S; están sobredimensionadas para un modelo de 4B salvo que se busque un throughput muy alto con lotes grandes.
- Opciones de despliegue: Transformers, vLLM, Text Generation Inference (TGI), SGLang y llama.cpp/Ollama previa conversión a GGUF, ya que este repositorio solo distribuye safetensors en BF16.
- Almacenamiento: reservar al menos 26 GB de disco para clonar el repositorio completo, dado que incluye tanto el export BF16 como el checkpoint nativo FSDP.
- Latencia y throughput: no disponibles. No se han publicado mediciones sobre este checkpoint y no deben extrapolarse cifras sin medirlas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-010 | 4,02 mil millones (denso) | No especificado (base: 262.144 tokens según documentación del modelo base) | Apache 2.0 | Checkpoint de paso 10, sin evaluación publicada, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 mil millones (denso) | 262.144 tokens según su documentación | Apache 2.0 | Modelo oficial, ampliamente desplegado y documentado |
| google/medgemma-4b-it | Aproximadamente 4 mil millones (denso) | 128.000 tokens según su documentación | Términos de Health AI Developer Foundations (uso restringido) | Modelo específico de dominio médico con evaluación publicada |
| microsoft/Phi-4-mini-instruct | 3,8 mil millones (denso) | 128.000 tokens según su documentación | MIT | Modelo oficial con benchmarks publicados |

No hay datos de rendimiento comparativos para este checkpoint. Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y no se han verificado contra este repositorio. La comparación relevante es frente al modelo base: sin métricas publicadas, no puede afirmarse que el ajuste médico haya mejorado ni degradado las capacidades originales.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni métricas de seguridad publicadas para este checkpoint.
- Checkpoint intermedio: se trata del paso 10 de una ejecución piloto, no del modelo final; su comportamiento puede ser inestable o estar a medio ajustar.
- Model card mínima: no se documenta el dataset, los hiperparámetros, el régimen de entrenamiento ni los idiomas soportados.
- Riesgo elevado de alucinación en contenido médico: un modelo de 4B ajustado en un dominio de alto riesgo puede producir afirmaciones clínicas incorrectas con apariencia de verosimilitud.
- No es un producto sanitario: no cuenta con marcado CE, aprobación de la FDA ni validación clínica de ningún tipo; su uso en decisiones sobre pacientes está fuera de toda consideración.
- Sesgos desconocidos: al no documentarse la composición de los datos de ajuste, no pueden evaluarse sesgos demográficos, lingüísticos ni culturales.
- Idiomas no declarados: se desconoce si el castellano está bien representado; el ajuste podría haber degradado el multilingüismo del modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre los resultados ni de las obligaciones de atribución correspondientes.
- Trazabilidad limitada: al ser un artefacto de un usuario sin historial público verificable, la procedencia de los datos de entrenamiento no es auditable.
- Riesgo de dependencia del prompt: al no haber evaluación sistemática, el comportamiento puede variar de forma imprevisible entre formatos de plantilla.
- No recomendado para producción en su estado actual: cualquier despliegue real exigiría evaluación propia, filtros de seguridad y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-010
- Perfil del autor en Hugging Face: https://huggingface.co/HYU-NLP-EVAL
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de veRL (framework citado en la model card para el checkpoint nativo): https://github.com/volcengine/verl
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo, paper, blog o demo asociado. Las búsquedas devolvieron únicamente resultados no relacionados (Hyundai, canales de YouTube y catálogos comerciales).
