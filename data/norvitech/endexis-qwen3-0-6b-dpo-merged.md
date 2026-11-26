# NorviTech/endexis-qwen3-0.6b-dpo-merged

## Resumen

Endexis (`endexis-qwen3-0.6b-dpo-merged`, versión 2.5.0) es un modelo de lenguaje especializado en informática clínica, desarrollado por NorviTech sobre la base de `Qwen/Qwen3-0.6B`. Su función concreta es interpretar datos clínicos y compilar artefactos propios de entornos sanitarios: consultas e informes de Discern Analytics 2.0 (DA2) en formato `.daquery` y `.dareport`, programas en Cerner Command Language (CCL) con extensión `.prg`, y diseños de informe de Eclipse BIRT 4.4.2 (`.rptdesign`). No es un modelo de propósito general, sino un intérprete de dominio muy acotado.

La versión 2.5.0 incorpora una tarea nueva de reescritura de peticiones de cambio sobre ficheros DA2 ya subidos (`rewrite_upload_edit`), además de mejorar la generación de texto a DA2. El modelo se ha afinado con una única etapa de SFT (LoRA de rango 16, fusionada a BF16); la etapa de preferencias RPO-DPO se descartó porque empeoraba la pérdida de validación. El nombre del repositorio conserva `dpo` por compatibilidad histórica, aunque esa etapa no está incluida en los pesos publicados.

Con 596 millones de parámetros, el modelo es deliberadamente pequeño: está pensado para ejecutarse en CPU o en GPU de gama baja con latencias de centenas de milisegundos, dentro de un pipeline determinista controlado por reglas. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su integración en herramientas clínicas internas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-0.6B`, un transformer decoder-only de 0,6 mil millones de parámetros, y se afina mediante LoRA de rango 16 fusionada a BF16. El entrenamiento consiste en una sola etapa de SFT sobre un corpus de 7.877 filas, de las cuales 2.600 corresponden a la nueva tarea de edición de subidas; se ejecutaron 922 pasos de optimizador. La pérdida de validación SFT final es de 0,1162 (perplejidad 1,123). Se intentó una etapa adicional de preferencias RPO-DPO sobre 1.298 pares, pero elevó la pérdida a 0,118, incumpliendo la condición de no empeorar, por lo que se descartó y se publica el modelo de la etapa 1.

La configuración, el tokenizador y la plantilla de chat son idénticos a los de la versión 2.3.0, lo que preserva la compatibilidad con el `Modelfile` y los enlaces de descarga existentes. La innovación principal no está en la arquitectura, sino en el diseño del sistema: el modelo solo reescribe mensajes que las reglas deterministas no han podido interpretar, y toda reescritura se valida contra esas reglas antes de mostrarse. La librería de compilación y verificación es `spencernorton/endexis` (v2.5.2), que actúa como capa de seguridad y control del output.

## Capacidades

- Generación de texto a DA2: produce consultas `.daquery` e informes `.dareport` a partir de descripciones en lenguaje natural.
- Compilación de CCL: genera programas `.prg` en Cerner Command Language.
- Generación de informes BIRT: produce ficheros `.rptdesign` compatibles con Eclipse BIRT 4.4.2.
- Reescritura de peticiones de cambio (`rewrite_upload_edit`): dado un resumen de un fichero DA2 subido, hasta tres mensajes previos y el último mensaje, devuelve el cambio en texto plano que ese mensaje implica, o `null` si no se solicita cambio.
- Refinamiento multi-turno: soporta iteraciones de corrección sobre la salida generada (35 de 36 casos correctos en el conjunto de desarrollo).
- Interpretación de datos clínicos con independencia del tenant (tenant-agnostic).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de consultas DA2 en entornos Cerner: un analista describe en lenguaje natural qué datos clínicos necesita y el modelo produce el `.daquery` correspondiente, que luego se valida con la librería determinista antes de ejecutarse.
- Migración de informes clínicos: a partir de la descripción de un informe existente, el modelo genera el `.rptdesign` de BIRT 4.4.2, reduciendo el trabajo manual de reconstrucción en una migración de plataforma.
- Autoría de programas CCL: el modelo redacta `.prg` para tareas de extracción y transformación de datos en Cerner, con verificación posterior por reglas.
- Asistente de edición sobre informes ya subidos: el usuario sube un `.dareport` y pide cambios en lenguaje coloquial ("quita la columna de habitación"); el modelo reescribe la petición en un cambio accionable que el sistema aplica si las reglas lo aceptan.
- Despliegue en CPU dentro de herramientas internas: con GGUF Q4_K_M (396,7 MB) y latencias p50 de 522 ms en CPU de 8 hilos, puede integrarse en un servicio ligero sin GPU.
- Prototipado y pruebas de regresión en pipelines de CI: al ser determinista con temperatura 0 y tener un holdout sellado, sirve para validar cambios en el compilador de DA2 y en las reglas de seguridad.
- Formación interna: permite a nuevos analistas clínicos practicar la sintaxis de DA2, CCL y BIRT con ejemplos generados y validados automáticamente.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Resultado |
|---|---|---|
| Reescritura de ediciones, acierto | holdout sellado, 460 mensajes con cambio, Q8_0 | 77,8 % correctas, 3,3 % incorrectas, bag F1 0,88, precisión 0,99 |
| Reescritura de ediciones, acierto | mismo conjunto, Q4_K_M | 76,1 % correctas, 3,5 % incorrectas, bag F1 0,86 |
| Reescritura de ediciones, sin cambio | 186 mensajes sin cambio | 0 % de reescrituras (sin la comprobación de reglas: 10,2 %) |
| Texto a DA2, Strict Pass@1 | `oof_eval_v2_3`, N = 132, BF16 | 0,9924 (v2.3.0: 0,9697) |
| Refinamiento multi-turno | mismo conjunto | 35/36 (v2.3.0: 32/36) |
| Latencia p50 CPU | Q8_0, CPU compartida de 8 hilos | 730 ms |
| Latencia p50 CPU | Q4_K_M, CPU compartida de 8 hilos | 522 ms |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. El holdout sellado post-freeze de v2.3.0 (`eval_postfreeze_v3`, N = 640) no se ha reevaluado con esta versión.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB en BF16 (pesos de 1,19 GB); unos 0,8 GB en Q8_0 y 0,4 GB en Q4_K_M.
- GPU: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- CPU: viable en exclusiva; las latencias medidas (522-730 ms p50) corresponden a una CPU compartida de 8 hilos.
- Despliegue: llama.cpp y Ollama mediante los GGUF publicados (el `Modelfile` existente sigue funcionando); transformers para los pesos safetensors; vLLM y TGI no están documentados para este modelo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Endexis v2.5.0 | 596 M | no disponible | DA2, CCL, BIRT, edición de DA2 | Apache 2.0 | HF (safetensors, GGUF) |
| Qwen/Qwen3-0.6B | 596 M | no disponible | propósito general | Apache 2.0 | HF |
| v2.3.0 de Endexis | 596 M | no disponible | DA2, CCL, BIRT (sin edición) | Apache 2.0 | HF (tag `v2.3.0`) |

No se dispone de datos sobre otros modelos especializados en DA2, CCL o BIRT en la información proporcionada.

## Limitaciones y advertencias

- El holdout de edición comparte con el entrenamiento las palabras llanas de cada columna: evalúa frases, ficheros e historiales nuevos, pero no vocabulario nuevo para una columna.
- Los pares de preferencia eran negativos débiles: el modelo SFT ya prefería todas las respuestas elegidas en los pares de validación, lo que motivó descartar la etapa DPO.
- El mensaje llega al modelo tal cual se escribe, incluidos nombres de pacientes; las reglas rechazan cualquier filtro que seleccione a un paciente, pero el modelo en sí no aplica esa salvaguarda.
- El resultado del 0 % de reescrituras en mensajes sin cambio es optimista: la comprobación de reglas que lo garantiza se escribió después de observar los fallos.
- Solo se documenta inglés como idioma; no hay datos sobre otros idiomas.
- Riesgo de alucinación en la generación de DA2, CCL y BIRT fuera de los patrones vistos en entrenamiento; el diseño del sistema exige validación por reglas, no se debe usar la salida sin comprobar.
- La licencia Apache 2.0 permite uso comercial, pero el aviso legal indica que el proyecto no está afiliado, respaldado ni patrocinado por Oracle, Cerner ni la Eclipse Foundation; conviene revisar `LEGAL.md` antes de integrarlo en productos.
- El nombre del repositorio incluye `dpo` aunque la etapa de preferencias no está en los pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/endexis-qwen3-0.6b-dpo-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Librería de compilación y verificación: https://github.com/spencernorton/endexis
- Etiquetas de versiones anteriores: `v2.3.0`, `v2.0.0`, `v1.0.0` en el mismo repositorio de Hugging Face
- Fichero de sumas de verificación: `SHA256SUMS.txt` en el repositorio de Hugging Face
