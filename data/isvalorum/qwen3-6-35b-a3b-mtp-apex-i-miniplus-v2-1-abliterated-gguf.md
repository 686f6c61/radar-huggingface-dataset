# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de la edición "abliterated" (sin rechazos) del modelo Qwen3.6-35B-A3B, publicada por el usuario IsValorum. Se trata de un derivado del modelo base Qwen/Qwen3.6-35B-A3B, un MoE híbrido de 34.660.610.688 parámetros totales (unos 34,66B) con aproximadamente 3B de parámetros activos por token, arquitectura que combina capas de atención completa con capas recurrentes basadas en DeltaNet SSM y un bloque integrado de predicción multi-token (MTP).

El problema que aborda es doble: por un lado, comprimir un MoE de 35B en un envelope de 14,66 GB (13,65 GiB) manteniendo una calidad declarada de nivel Q5_K_M, de modo que quepa en una única GPU de consumo de 16 GB; por otro, eliminar matemáticamente la dirección de rechazo del modelo mediante ablación direccional (TPE, optimización multivariante de Pareto) aplicada sobre las proyecciones residuales `attn.o_proj` y `mlp.down_proj`. La relevancia actual está en que permite ejecutar localmente un modelo de razonamiento de contexto largo (hasta 256K tokens) sin guardarraíles de rechazo, algo interesante tanto para investigación sobre alineación como para flujos de trabajo de seguridad ofensiva autorizada.

Según las métricas declaradas por el autor, la cuantización introduce un incremento de perplejidad en WikiText-2 de +0,1395 puntos (+2,62%) respecto al BF16 sin comprimir, frente al +0,0493 (+0,93%) de la edición alineada del mismo autor. El repositorio incluye acompañantes en Q8_0 para el bloque MTP y un proyector de visión `mmproj`. No se han publicado resultados de benchmarks de razonamiento, código o matemáticas, y la búsqueda web no ha devuelto fuentes independientes sobre el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida transformer: capas de atención completa intercaladas con capas recurrentes DeltaNet SSM, 40 capas y 256 micro-expertos por capa, más bloque MTP integrado |
| Parametros totales | 34.660.610.688 (≈34,66B) |
| Parametros activos | ≈3B por token (según la nomenclatura A3B del modelo base) |
| Longitud de contexto | 256K tokens según la model card ("Full 256K Context"); se mencionan escenarios de offload parcial para contexto de 128K o superior |
| Tipos de cuantizacion | GGUF mixta tensor a tensor: `IQ3_XXS` en expertos centrales (capas 10-29), `Q3_K` en expertos de borde (0-9 y 30-39), `Q5_K` en el experto compartido (40 capas), `Q4_K` en `q/k/v` + `Q6_K` en la proyección de salida de atención, `Q8_0` en las puertas de atención (30 capas), `Q6_K` en la cabeza de salida, `F32` sin comprimir en los 80 enrutadores (`gate_inp` y `gate_shexp`). Acompañantes en `Q8_0` para MTP y visión |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`llama.cpp`); el modelo base se distribuye en safetensors, este repositorio no |
| Tamaño del repositorio | 17,3 GB en total; el archivo principal de la cuantización ocupa 14,66 GB (13,65 GiB) |
| Fecha de publicación | 2026-09-23 (creación y última actualización en la ficha de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un MoE disperso de 35B con unos 3B de parámetros activos, organizado en 40 capas y 256 micro-expertos, más un experto compartido (`shexp`) presente en todas las capas. La model card menciona explícitamente matrices de estado recurrente de DeltaNet SSM y un subconjunto de capas con atención completa (capas 3, 7, 11, ...), lo que apunta a una arquitectura híbrida que alterna mecanismos de atención lineal/recurrente con atención completa periódica. Se incluye además un bloque MTP (multi-token prediction) que el autor acompaña de un archivo separado en Q8_0, presumiblemente para decodificación especulativa, aunque la model card no detalla su uso.

No se documentan en la información proporcionada los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación). Lo que sí se documenta es el post-procesado aplicado por el autor de la cuantización: una ablación direccional de rechazo mediante optimización multivariante de Pareto con TPE, en la que el vector de rechazo se ortogonaliza contra activaciones inofensivas y se resta estrictamente de las proyecciones residuales (`attn.o_proj` y `mlp.down_proj`), preservando las matrices de estado recurrente de DeltaNet. La asignación de precisión por tensor se realizó manualmente, manteniendo en F32 los 80 enrutadores para evitar deriva de routing durante el forward pass.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso: la model card afirma que los caminos de chain-of-thought, la síntesis de código y las derivaciones matemáticas conservan su fidelidad tras la ablación, aunque sin aportar benchmarks que lo respalden.
- Razonamiento con presupuesto de contexto largo: ventana declarada de 256K tokens, con soporte de carga parcial en memoria de sistema para contextos de 128K o superiores.
- Generación y comprensión de código: se cita explícitamente la preservación de la síntesis de código y de la indentación y llaves correctas, en contraste con cuantizaciones comunitarias más agresivas que el autor describe como propensas a errores de sintaxis.
- Capacidades de visión: el repositorio incluye un proyector de visión (`mmproj`) como acompañante, lo que sugiere entrada multimodal, si bien la model card no detalla el alcance ni los benchmarks de visión.
- Multilingüismo: 13 idiomas declarados (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe).
- Ausencia deliberada de rechazos: la dirección de rechazo ha sido ablacionada en tareas de seguridad de sistemas, pruebas de penetración, ingeniería inversa y red teaming.
- Tool calling / function calling: no disponible. La model card no documenta soporte explícito de llamadas a herramientas; solo aparecen los tags `conversational` y `endpoints_compatible`.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponibles como característica documentada; el tag `reasoning` y la presencia del bloque MTP son los únicos indicios indirectos.

## Casos de uso

- Red teaming y evaluación de seguridad interna: el modelo puede generar hipótesis de ataque, análisis de superficie de exposición y borradores de exploits contra infraestructura propia, sin que la capa de rechazo interrumpa el flujo. Es adecuado precisamente porque la ablación elimina la dirección de rechazo en tareas de pentesting, lo que lo hace inutilizable como asistente de cara al público sin moderación externa.
- Investigación sobre alineación y mecanismos de rechazo: permite comparar la distribución de respuestas del modelo base alineado frente a la variante ablacionada sobre el mismo prompt, con una penalización de perplejidad conocida (+0,1395 PPL en WikiText-2) que acota el coste de la intervención.
- Análisis de documentación extensa en local: con 256K tokens de contexto y 14,66 GB de pesos, se pueden procesar expedientes, contratos o informes técnicos de cientos de páginas en una estación de trabajo con una GPU de 16 GB, sin enviar datos a servicios externos.
- Asistente de código en puesto de trabajo individual: el modelo cabe en una RTX 4060 Ti de 16 GB o similar y, según el autor, mantiene la coherencia de nivel Q5_K_M en generación de código; es adecuado para autocompletado, refactorización y explicación de código sobre repositorios privados.
- Despliegue en servidores sin GPU: con inferencia en memoria de sistema (DDR4/DDR5), el autor declara 20-45 tok/s según CPU y ancho de banda de memoria, lo que permite servir el modelo en un host de CPU para tareas por lotes o de baja concurrencia.
- Traducción y localización multilingüe: con 13 idiomas declarados se puede usar como traductor entre pares de idiomas europeos y asiáticos, aunque no hay métricas BLEU o COMET publicadas que respalden la calidad.
- Generación de datos sintéticos y aumentación de datasets: útil para producir corpus de dominios sensibles o poco representados donde un modelo alineado se negaría a continuar, siempre con revisión humana posterior.
- Tutoría técnica y explicación de conceptos de seguridad ofensiva: al no rechazar temáticas de ingeniería inversa, resulta apropiado para material formativo interno dirigido a equipos de seguridad, con la advertencia de que el contenido generado debe validarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo aportado por el autor es la perplejidad en WikiText-2:

| Modelo | Perplejidad WikiText-2 | Delta frente a BF16 |
|---|---|---|
| Base BF16 sin comprimir (referencia aproximada citada por el autor) | ≈5,32 | — |
| APEX-I-MiniPlus V2.1 (edición alineada, Q6_K) | ≈5,3693 (ΔPPL +0,0493) | +0,93% |
| Este repositorio (abliterated, mezcla IQ3_XXS/Q3_K/Q5_K/Q8_0) | 5,4595 ± 0,12874 | +0,1395 (+2,62%) |

El autor atribuye +0,08 puntos de perplejidad a la eliminación de la dirección de rechazo y el resto a la compresión. No hay mediciones independientes que verifiquen estas cifras.

## Requisitos de hardware

- VRAM para inferencia: el archivo principal ocupa 14,66 GB (13,65 GiB), por lo que requiere al menos 16 GB de VRAM para una carga completa de los pesos, sin contar caché KV.
- GPU recomendadas: una GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 5060 Ti 16 GB, A4000) permite cargar los pesos; para contexto largo conviene una GPU de 24 GB o superior (RTX 4090, RTX 5090, A5000, L40S) y, para servicio concurrente, A100 o H100.
- Viabilidad en GPU de consumo: sí. El propio autor destaca que el build cabe "enteramente en una única GPU de consumo de 16 GB". Para ventanas de 128K o más, se debe recurrir a offload parcial a memoria de sistema.
- Memoria de sistema: los 17,3 GB del repositorio incluyen acompañantes (MTP en Q8_0 y proyector de visión), por lo que conviene reservar al menos 32 GB de RAM para carga completa en CPU y 64 GB o más si se quiere mantener contexto largo con offload parcial.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio y cualquier runtime compatible con GGUF y endpoints compatibles con la API de OpenAI. El soporte de vLLM con GGUF no está confirmado en la información disponible.
- Rendimiento: no disponible para inferencia en GPU. En inferencia sobre memoria de sistema, el autor declara entre 20 y 45 tok/s en función del procesador, el ancho de banda de memoria y la configuración DDR4/DDR5.
- Efecto del hardware en el rendimiento: el autor afirma que la configuración elegida evita paradas de dequantización en CPU ("cero stalls de AVX2"), pero no se aportan mediciones reproducibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (APEX-I-MiniPlus V2.1 Abliterated) | 34,66B totales, ≈3B activos | 256K | GGUF mixto, 14,66 GB | apache-2.0 | Ablación de rechazo, ΔPPL +0,1395 (+2,62%) |
| APEX-I-MiniPlus V2.1 GGUF (edición alineada, mismo autor) | 34,66B totales, ≈3B activos | 256K | GGUF, 15,23 GB | apache-2.0 | Mantiene guardarraíles, ΔPPL +0,0493 (+0,93%), incluye `mmproj` |
| Generic APEX-I-Mini (cuantización comunitaria descrita por el autor) | 34,66B totales, ≈3B activos | no disponible | GGUF con expertos en `IQ2_S` y cabeza en `Q3_K_M`, ≈12,5 GB | no disponible | El autor reporta picos de perplejidad, errores de sintaxis y llaves de código rotas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 34,66B totales, ≈3B activos | no disponible | safetensors BF16 (≈69 GB estimados a 2 bytes por parámetro) | apache-2.0 | Referencia sin cuantizar ni ablacionar; PPL WikiText-2 ≈5,32 según el autor |

No se dispone de comparaciones con otras familias de MoE de tamaño similar (por ejemplo, alternativas de ~30B con ~3B activos) dentro de la información proporcionada, ni de datos de benchmarks que permitan una comparación objetiva de capacidades.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: la dirección de rechazo ha sido ablacionada de forma explícita, por lo que el modelo responderá a peticiones sobre seguridad de sistemas, ingeniería inversa o red teaming sin filtros. Desplegarlo de cara al público o en productos finales exige capas de moderación externas y revisión legal.
- Riesgo de uso indebido: la combinación de contexto de 256K tokens, ejecución local y cero rechazos facilita la generación de contenido dañino con trazabilidad limitada. Cualquier uso debe enmarcarse en un contexto autorizado (pentesting con contrato, investigación académica, entornos aislados).
- Degradación medible por la ablación: el autor cifra en +0,08 puntos de perplejidad el coste de eliminar la dirección de rechazo y en +0,1395 puntos el total del build, lo que sitúa la calidad en el nivel Q5_K_M y no en el Q6_K de la edición alineada.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de veracidad. Al ser un modelo de razonamiento con contexto muy largo, la probabilidad de que genere referencias o APIs inexistentes en tareas de código y documentación es un riesgo real que debe mitigarse con verificación.
- Cobertura de benchmarks inexistente: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, por lo que no es posible estimar su rendimiento relativo frente a alternativas de su categoría.
- Idiomas: se declaran 13 idiomas, pero no se especifica el nivel de competencia por idioma ni el porcentaje de tokens de cada uno en el entrenamiento del modelo base. Los idiomas con menos representación (tailandés, vietnamita, árabe) probablemente rindan peor.
- Restricciones de licencia: la licencia declarada es apache-2.0, heredada del modelo base, lo que en principio permite uso comercial. Sin embargo, la intervención de abliteración puede chocar con las políticas de uso aceptable del modelo original y con la normativa aplicable en jurisdicciones que regulan la generación de contenido dañino; conviene revisar los términos del modelo base antes de un despliegue comercial.
- Formato único: solo se distribuye en GGUF. No hay safetensors ni pesos sin cuantizar en este repositorio, lo que impide reentrenamiento o ajuste fino a partir de estos pesos.
- Trazabilidad limitada del autor: el repositorio no tiene descargas ni valoraciones, y no hay publicaciones, papers ni evaluaciones de terceros que verifiquen las afirmaciones de la model card sobre routing, stalls de CPU o fidelidad de razonamiento.
- Gestión de contexto largo: aunque se declaran 256K tokens, para 128K o más el autor recomienda offload parcial a memoria de sistema, lo que reduce el throughput y puede degradar la latencia en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Edición alineada del mismo autor (sin ablacionar): https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
