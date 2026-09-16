# ctogaurav/GLM_OCR

## Resumen

GLM_OCR es un adaptador LoRA sobre el modelo visión-lenguaje zai-org/GLM-OCR (0,9B parámetros) especializado en una única tarea: transcribir hojas de examen manuscritas de matemáticas de nivel universitario a documentos LaTeX completos y compilables con `pdflatex`. Lo desarrolla Gaurav Vyas (@ctogaurav) como proyecto de investigación de grado (B.Sc. Data Science and AI, IIT Guwahati), con tres iteraciones publicadas (v3.1, v4.1 y v5.0). Además de la transcripción, el modelo aprende a ignorar elementos que no forman parte de la respuesta: cabeceras impresas, identificadores de alumno, números de página y trabajo tachado o cancelado.

El problema que aborda es concreto y medible: el OCR convencional degrada mucho el contenido matemático manuscrito, y los sistemas evaluados por el autor no producen LaTeX que compile sin corrección manual. Según la tabla de resultados de la model card, la versión v5.0 reduce el Character Error Rate (CER) un 34,4 % en términos relativos frente al GLM-OCR base sin ajustar (0,5151 → 0,3377) y alcanza un 82,0 % de compilación limpia de PDF sobre el conjunto de test de 250 documentos.

Su relevancia práctica es la combinación de tamaño reducido (modelo base de 0,9B), licencia MIT y publicación de adaptadores en `safetensors` más versiones GGUF para LM Studio y Ollama. El repositorio principal ocupa 0,3 GB. Es un proyecto de nicho, con 0 descargas y 2 likes en el momento de la consulta, y sin validación independiente más allá de la benchmark propia del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo base: zai-org/GLM-OCR, visión-lenguaje de 0,9B. Adaptador PEFT/LoRA con r=32, α=64, dropout=0,05 sobre proyecciones q, k, v, o, gate, up, down |
| Parámetros totales | No disponible con precisión. Modelo base: 0,9B (según la model card). Adaptadores LoRA con rango 32 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Adaptadores publicados en safetensors; versiones GGUF publicadas en repositorio separado (ctogaurav/GLM_OCR-GGUF) para LM Studio y Ollama. No se detallan los niveles concretos |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT); GGUF en el repositorio GLM_OCR-GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (Low-Rank Adaptation) del VLM zai-org/GLM-OCR, no un entrenamiento desde cero. Los adaptadores se aplican sobre las siete proyecciones lineales del modelo base (q, k, v, o, gate, up, down) con rango 32, alpha 64 y dropout 0,05. La tarea es de imagen a texto: la entrada es una página escaneada y la salida es un documento LaTeX. La versión v5.0 se entrenó en dos fases: una primera fase local en una RTX 3060 de 12 GB en FP16, y una segunda fase en una A100 de 80 GB en BF16 nativo, con learning rate 1e-5, decaimiento coseno con warmup lineal y batch efectivo de 8 (batch 1 × acumulación 8). El entrenamiento completo de v5.0 consumió 3.945 pasos y aproximadamente 4,68 horas en A100, con un coste de 3,80 s/paso en esta GPU frente a 57,05 s/paso en local.

El dato más destacable del pipeline es la curación del dataset. De 34.080 escaneos brutos se obtuvieron 13.973 pares imagen-LaTeX validados mediante un proceso en nueve etapas que incluye anonimización de PII (blanqueo de la franja superior de cada página), filtrado de páginas en blanco o solo impresas, corrección de inclinación, anotación con un VLM profesor, revisión automática de calidad y, sobre todo, validación con `pdflatex` de cada objetivo de entrenamiento: el modelo nunca se entrena con un target que no compile. El reparto final es de 12.575 páginas de entrenamiento, 698 de validación y 700 de test. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares verificados.

## Capacidades

- Transcripción OCR de escritura manuscrita matemática a LaTeX compilable con `pdflatex`.
- Generación de documentos LaTeX completos, no solo fragmentos de fórmulas.
- Reconocimiento de notación matemática de nivel universitario (evaluado con una métrica específica Math-F1, 0,8358 en v5.0).
- Supresión activa de contenido no relevante: cabeceras impresas, identificadores de estudiante, numeración de página y trabajo tachado o cancelado.
- Robusteza a variaciones de captura de escaneo, gracias a las etapas de desenfoque y recorte del pipeline previo.
- Entrada multimodal imagen-a-texto (pipeline `image-to-text`).
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni modo de pensamiento explícito.
- Capacidad multilingüe: limitada a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Corrección y digitalización de exámenes universitarios de matemáticas: el modelo convierte hojas de respuesta manuscritas en LaTeX, de modo que el corrector puede comparar la solución del alumno con la plantilla en un formato estructurado y buscable. El 82,0 % de compilación limpia en v5.0 reduce el trabajo manual de arreglo de sintaxis a una minoría de páginas.
- Construcción de bancos de problemas y soluciones: a partir de archivos históricos escaneados se puede generar un corpus LaTeX reutilizable en apuntes, libros o plataformas de ejercicios, manteniendo la notación original.
- Digitalización accesible de apuntes manuscritos de matemáticas: conversión de cuadernos de estudiante a LaTeX para su lectura con lectores de pantalla o su edición posterior.
- Preprocesado en pipelines de evaluación automática: el LaTeX resultante puede alimentar un motor de cálculo simbólico o un corrector automático que puntúe paso a paso, evitando el cuello de botella del OCR genérico sobre fórmulas.
- Archivado institucional de exámenes con protección de datos: el modelo está entrenado para ignorar identificadores de alumno, lo que encaja en flujos donde hay que preservar el contenido académico y descartar la identidad, aunque la anonimización previa del pipeline sigue siendo necesaria.
- Investigación en OCR de manuscrito matemático: el repositorio publica scripts de curación, entrenamiento, benchmark y QA, además de las páginas de muestra verificadas en PII, lo que sirve como base reproducible para comparar arquitecturas o estrategias de aumentación.
- Despliegue local en puesto de trabajo: al ser un modelo de 0,9B con adaptadores de 0,3 GB y versiones GGUF, se puede ejecutar en una estación con GPU de gama media o incluso integrarse en Ollama/LM Studio para uso individual sin enviar documentos a la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test retenido (`test.jsonl`). Métricas: Character Error Rate (CER), CER normalizado (NCER), tasa de compilación limpia de PDF, Math-F1, BLEU-4 y latencia.

| Sistema / modelo | CER medio ↓ | CER norm. ↓ | Compilación % ↑ | Math-F1 ↑ | BLEU-4 ↑ | Latencia (s) ↓ | Hardware |
|---|---|---|---|---|---|---|---|
| GLM-OCR base (congelado) | 0,5151 | 0,4910 | 0,0 | 0,7031 | 0,4583 | 8,38 | RTX 3060 |
| Baidu OCR (stock) | 0,7176 | 0,7343 | 42,7 | 0,6264 | 0,3113 | 40,79 | API |
| Baidu OCR (fine-tuned v2) | 0,4258 | 0,4706 | 64,9 | 0,7983 | 0,5958 | 29,00 | RTX 3060 |
| GLM-OCR v3.1 (adaptador) | 0,3971 | 0,3753 | 88,9 | 0,8171 | 0,6180 | 14,12 | RTX 3060 |
| GLM-OCR v4.1 (adaptador) | 0,3816 | 0,4106 | 82,4 | 0,8272 | 0,6513 | 13,44 | RTX 3060 |
| GLM-OCR v5.0 (adaptador, SOTA) | 0,3377 | 0,3683 | 82,0 | 0,8358 | 0,6594 | ~3,80 | A100 (80 GB) |

Notas sobre la tabla, tal como la presenta el autor: v5.0 reduce el CER un 34,4 % en términos relativos frente al modelo base y un 11,5 % frente a v4.1; obtiene el NCER más bajo (0,3683); 205 de 250 documentos compilaron sin arreglo manual de sintaxis; y 0,8358 de Math-F1 es el máximo registrado. La model card no aclara si la columna de latencia corresponde a una página completa o a un paso de proceso, por lo que esa cifra debe interpretarse con cautela. No hay benchmarks independientes ni comparaciones con otros modelos de la misma categoría fuera de las incluidas aquí.

## Requisitos de hardware

- El autor reporta entrenamiento e inferencia en una RTX 3060 de 12 GB, y una segunda fase de entrenamiento de v5.0 en una A100 de 80 GB. No se publica un desglose explícito de VRAM para inferencia.
- Al tratarse de un VLM de 0,9B con adaptadores LoRA de 0,3 GB, es razonable esperar que quepa en GPU de consumo, pero el dato concreto de VRAM no está disponible en la información proporcionada.
- GPU de referencia en los experimentos: RTX 3060 (12 GB) para v3.1 y v4.1 y para la primera fase de v5.0; A100 (80 GB) para la segunda fase de v5.0.
- Despliegue: adaptadores en safetensors para cargar con PEFT sobre zai-org/GLM-OCR; versiones GGUF publicadas para LM Studio y Ollama; notebooks de Google Colab para probar los tres adaptadores sin instalación local; la aplicación Flask del repositorio permite UI de entrenamiento y benchmark en navegador.
- Latencia reportada: 8,38 s con el modelo base en RTX 3060, 14,12 s con v3.1 y 13,44 s con v4.1 en RTX 3060, y ~3,80 s con v5.0 en A100. No se publica throughput agregado (páginas por segundo) ni datos de vLLM, TGI o llama.cpp.
- Coste de entrenamiento declarado: ~5 h (v3.1), ~12,7 h (v4.1) y ~4,68 h en A100 (v5.0), con un ahorro estimado de ~58 h respecto a hacerlo todo en local.

## Comparativa con modelos similares

La información disponible solo permite comparar contra los sistemas incluidos en el benchmark del propio autor. No hay datos de otros adaptadores OCR de matemáticas manuscrita ni de modelos comparables de terceros.

| Sistema | Tipo | CER medio ↓ | Compilación % ↑ | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-OCR v5.0 (este modelo) | LoRA sobre VLM 0,9B | 0,3377 | 82,0 | en | MIT | Peso abierto en HF (adaptadores + GGUF) |
| GLM-OCR base Z.ai | VLM 0,9B sin ajustar | 0,5151 | 0,0 | no disponible | no disponible en esta ficha | Peso abierto en HF |
| Baidu OCR (stock) | OCR comercial vía API | 0,7176 | 42,7 | no disponible | propietaria, vía API | Servicio en la nube |
| Baidu OCR (fine-tuned v2) | Ajuste propio del autor sobre Baidu OCR | 0,4258 | 64,9 | no disponible | propietaria, vía API | Entrenado por el autor, no distribuido |

Comparativa con alternativas de la misma categoría (p. ej. otros VLM pequeños para OCR de manuscrito): no disponible, no se han encontrado datos en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: está ajustado para hojas de respuesta manuscritas de matemáticas universitarias en inglés. Fuera de ese caso (documentos impresos, otras lenguas, otras asignaturas) no hay evidencia de buen rendimiento y el comportamiento puede degradarse.
- Tasa de fallo de compilación del 18 % en v5.0: 45 de 250 documentos de test no compilaron limpiamente, por lo que un flujo de producción necesita validación con `pdflatex` y probablemente una etapa de corrección humana o automática.
- Riesgo de alucinación de contenido: al ser un modelo generativo de LaTeX, puede producir símbolos o estructuras plausibles que no estén en la imagen original. La métrica Math-F1 de 0,8358 implica que aproximadamente un 16 % de los símbolos matemáticos no se recupera correctamente.
- Idiomas: únicamente inglés según las etiquetas del repositorio. No hay soporte declarado de castellano ni de otras lenguas.
- Datos de entrenamiento no publicados: el corpus completo de 34.080 escaneos es confidencial y no se distribuye por privacidad de los estudiantes. Solo se publican 13.973 pares validados de forma agregada y páginas de muestra verificadas en PII, lo que limita la reproducibilidad exacta y el análisis de sesgos.
- Sesgos: no se documenta ningún análisis de sesgo (escritura, género, origen, tipo de letra o calidad de escaneo). Al provenir de un único contexto institucional, es probable que el modelo esté sesgado hacia estilos de caligrafía y plantillas de examen de ese entorno, aunque no hay datos que lo cuantifiquen.
- Sin validación independiente: los resultados son de la benchmark propia del autor, con 0 descargas y 2 likes en el momento de la consulta. No hay revisión por pares ni evaluación por terceros.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia del modelo base zai-org/GLM-OCR, ya que el adaptador hereda las condiciones del modelo sobre el que se aplica. La model card no detalla restricciones adicionales.
- Anonimización incompleta: el autor advierte que la protección de PII se hizo blanqueando un porcentaje fijo de la parte superior de cada página, un método heurístico que puede no cubrir todos los identificadores en contextos distintos al original.
- Metadatos poco fiables: las fechas de creación y actualización del repositorio (2026) y la ausencia de datos sobre longitud de contexto o configuración de inferencia dificultan una evaluación precisa para producción.

## Enlaces

- Modelo en HuggingFace (adaptadores v3.1, v4.1, v5.0): https://huggingface.co/ctogaurav/GLM_OCR
- Versiones cuantizadas GGUF para LM Studio y Ollama: https://huggingface.co/ctogaurav/GLM_OCR-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Perfil del autor en HuggingFace: https://huggingface.co/ctogaurav
- Perfil del autor en GitHub: https://github.com/realgauravvyas
- Notebooks de demostración en Google Colab: referenciados en la model card bajo la sección «Colab demos»; la URL directa no está disponible en la información proporcionada
- Otros enlaces (paper, blog técnico, repositorio de código con licencia): no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenidos no relacionados con el ámbito técnico.
