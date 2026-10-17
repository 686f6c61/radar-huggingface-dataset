# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-016

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-016` es un ajuste fino del modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario u organización HYU-NLP-EVAL en HuggingFace. Se trata de un checkpoint intermedio: la model card indica que corresponde a la ejecución `261016_medicine_static_pilot`, en el paso 16 de entrenamiento y con semilla 11, lo que lo sitúa como un artefacto de investigación dentro de un proceso de ajuste orientado al dominio médico, no como un modelo final validado.

El repositorio contiene un export en BF16 para Transformers en la raíz y, en el directorio `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con sus metadatos. El modelo tiene 4.022.468.096 parámetros reales (según los ficheros safetensors), lo que lo sitúa en la gama de ~4 B de parámetros, con licencia Apache-2.0. El tamaño del repositorio es de 25,7 GB, coherente con la duplicación de pesos (export BF16 más checkpoint nativo).

Su relevancia actual es limitada y muy específica: se trata de un piloto de evaluación con cero descargas y cero valoraciones en el momento de la consulta, sin métricas publicadas y sin documentación sobre datos de entrenamiento, idiomas o ventana de contexto. Resulta útil como referencia para quienes investiguen el pipeline de ajuste con veRL/FSDP sobre Qwen3-4B en el ámbito clínico, pero no está pensado como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3); detalles específicos no disponibles |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica export BF16; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers) y checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna del modelo. Al derivar de Qwen/Qwen3-4B-Instruct-2507, se trata de la familia Qwen3 en configuración densa (no MoE), con 4.022.468.096 parámetros confirmados en los safetensors. El repositorio incluye un export en BF16 para su carga con la librería `transformers` y, de forma adicional, los ficheros nativos de entrenamiento en formato veRL/FSDP, lo que sugiere que el ajuste se realizó con el framework veRL (entrenamiento por refuerzo para modelos de lenguaje) usando FSDP para el reparto de parámetros. Es una inferencia a partir de la estructura del repositorio, no un dato confirmado en la model card.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Los únicos metadatos confirmados son el identificador de la ejecución (`261016_medicine_static_pilot`), el paso del checkpoint (16) y la semilla (11). La model card indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que apunta a un pipeline de publicación automatizado orientado a la reproducibilidad.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso como modelo de chat, presumiblemente orientado al dominio médico por el nombre de la ejecución.
- Capacidades heredadas del modelo base: no están documentadas en esta model card. El modelo base Qwen3-4B-Instruct-2507 es un modelo de instrucciones con soporte declarado de razonamiento, código y matemáticas, pero este checkpoint concreto no aporta evidencia de conservarlas tras el ajuste.
- Tool calling y function calling: no disponible en la documentación de este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación de este checkpoint.
- Capacidades multilingües: no disponible; la model card no declara idiomas y la ficha de HuggingFace marca el campo de idiomas como no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El pipeline es exclusivamente de generación de texto.
- Compatibilidad técnica: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que el artefacto puede desplegarse en TGI y en endpoints compatibles.

## Casos de uso

- Evaluación comparativa de ajustes en dominio médico: dado que el nombre de la ejecución incluye `EVAL` y el checkpoint está en el paso 16, el uso principal es medir el efecto de distintas configuraciones de entrenamiento (pasos, semillas, datasets) sobre el comportamiento del modelo base en tareas clínicas.
- Extracción de entidades clínicas: uso en investigación para identificar fármacos, diagnósticos, dosis y procedimientos en notas clínicas en texto libre, siempre con validación humana y sin uso clínico directo.
- Resumen de historiales clínicos: generación de resúmenes de notas de evolución o informes de alta para revisión por personal sanitario, aprovechando el ajuste al registro médico.
- Respuesta a preguntas de pacientes (con supervisión): generación de borradores de respuesta sobre educación sanitaria que un profesional revisa antes de publicar. No apto para respuesta automática sin revisión.
- Apoyo a codificación diagnóstica: sugerencia de códigos CIE-10 o SNOMED a partir de descripciones textuales, como paso previo a la validación por codificadores humanos.
- Generación de datos sintéticos para pruebas: creación de diálogos y notas médicas plausibles para poblar entornos de test o pipelines de validación, evitando el uso de datos reales de pacientes.
- Investigación en pipelines veRL/FSDP: el repositorio conserva el checkpoint nativo y los metadatos, lo que lo hace útil para reproducir o auditar el proceso de entrenamiento por refuerzo sobre Qwen3-4B.
- Prototipado de asistentes de triaje: experimentación en entornos controlados para clasificar la urgencia de consultas, con métricas de seguridad estrictas y sin despliegue clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye metadatos de la ejecución (identificador, paso 16, semilla 11) y una descripción del contenido del repositorio, sin métricas de evaluación de ningún tipo.

## Requisitos de hardware

Las siguientes estimaciones se derivan aritméticamente del recuento de parámetros confirmado (4.022.468.096) y no de mediciones publicadas por el autor.

- VRAM para pesos en BF16/FP16: aproximadamente 8,0 GB solo para pesos (4,02 B × 2 bytes). Con caché KV y overhead del runtime, se recomienda reservar entre 10 y 12 GB.
- VRAM en cuantización INT8: aproximadamente 4,0-4,3 GB para pesos; contando overhead, en torno a 6-7 GB. No se publican pesos cuantizados, habría que generarlos.
- VRAM en cuantización INT4: aproximadamente 2,2-2,4 GB para pesos; contando overhead, en torno a 4 GB. Requiere convertir el modelo, ya que no hay GGUF disponible.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o A10G son suficientes con amplio margen; el modelo es pequeño para estos aceleradores, que quedarían infrautilizados si se dedican en exclusiva.
- GPU de consumo: cabe en BF16 en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB). En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) resulta ajustado en BF16 y cómodo en INT8/INT4.
- Tarjetas de 8 GB: solo viable con cuantización INT4 generada por el usuario.
- Opciones de despliegue: `transformers` (formato publicado), TGI (etiqueta `text-generation-inference`), vLLM y SGLang para inferencia de alto rendimiento. llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y el repositorio de 25,7 GB incluye copias duplicadas del checkpoint, lo que no afecta al rendimiento de inferencia pero sí al tiempo de descarga.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base del que deriva este checkpoint. El resto de campos se marcan como no disponibles por no estar verificados en las fuentes consultadas.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-016 | 4,02 B | no disponible | Apache-2.0 | Piloto, paso 16, sin métricas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible en esta ficha | Apache-2.0 | Modelo publicado por Qwen |
| Alternativas de ~3-4 B (por ejemplo, la familia Qwen3-4B o Qwen3-1.7B) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos alternativos en la información de la búsqueda, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del paso 16 de una ejecución piloto. No hay evidencia de que el entrenamiento haya convergido ni de que el modelo finalice correctamente instrucciones; es esperable un comportamiento inestable.
- Ausencia total de evaluación: no se publican métricas, comparativas ni resultados de validación. Cualquier afirmación sobre su calidad sería especulativa.
- Sin documentación de datos: se desconoce la composición del dataset de ajuste, su procedencia, si contiene datos de pacientes y si se aplicaron filtros de privacidad. Esto es un riesgo relevante en el ámbito médico.
- Riesgo de alucinación: en dominio clínico el riesgo es crítico. Un modelo de este tamaño, ajustado parcialmente y sin evaluación, puede generar información médica incorrecta con apariencia plausible.
- Sesgos: no disponibles. No se han publicado análisis de sesgo de ningún tipo.
- Idiomas: no se declara ningún idioma soportado. Se desconoce si el ajuste médico se hizo en inglés, coreano (el autor parece vinculado a HYU, posiblemente Hanyang University) u otro idioma.
- Ventana de contexto: no documentada para este checkpoint. No se debe asumir que conserva la ventana del modelo base sin verificarlo empíricamente.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero la licencia no cubre el cumplimiento normativo sanitario (por ejemplo, requisitos de producto sanitario en la UE). El uso clínico real exigiría validación regulatoria independiente.
- Repositorio pesado: 25,7 GB debido a la duplicación entre el export BF16 y el checkpoint nativo, lo que encarece el almacenamiento y la descarga sin aportar valor en inferencia.
- Falta de validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin issues ni discusiones públicas.
- Fecha de publicación registrada como 2026-10-16, posterior a la fecha habitual de consulta; conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-016
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la búsqueda web realizada. Los resultados devueltos correspondían a entidades no relacionadas (Hyundai, canales de YouTube y catálogos comerciales), por lo que no se incluyen.
