# gdiamos/amx-moe256-20b

## Resumen

amx-moe256-20b es un modelo de lenguaje publicado en Hugging Face por el usuario gdiamos, aparentemente derivado de un proceso de preentrenamiento y ajuste fino con una herramienta interna denominada ScalarXLM (versión `job_000029@step-305175`). El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 256 expertos y una etiqueta comercial de "20b", pero los datos reales de safetensors indican un total de 479.858.464 parámetros, es decir, aproximadamente 0,48 mil millones de parámetros, muy lejos de los 20 mil millones que sugiere el nombre. Esta discrepancia es la primera advertencia importante sobre el modelo.

La model card es extremadamente escasa: solo indica que se trata de un ajuste fino completo ("full fine-tune") a partir de un checkpoint interno (`/app/xlm/data/pretrain/m2r-init-e256-rb64-sig`) y proporciona valores de pérdida en held-out para seis dominios (code_syn, facts, math, textbooks, web, wiki). No se documentan la arquitectura exacta, el tokenizador, los idiomas soportados, la licencia ni el proceso de entrenamiento. El repositorio ocupa 1,9 GB, un tamaño coherente con pesos en precisión alta (probablemente fp32) para menos de 500 millones de parámetros.

Por tanto, se trata de un modelo de investigación de nicho, sin descargas ni interacciones en el momento de la consulta, y con documentación insuficiente para evaluar su calidad de forma rigurosa. Su relevancia actual es limitada salvo para quienes sigan el ecosistema ScalarXLM o experimentos internos de MoE con muchos expertos y pocos parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun el nombre "moe256"; detalles exactos no disponibles |
| Parametros totales | 479.858.464 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | no disponible (la etiqueta "scalarxlm" sugiere orientacion multilingue, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura de mezcla de expertos con 256 expertos, pero no se especifica el número de parámetros activos por token, la dimensión del modelo, el número de capas ni el mecanismo de enrutamiento. El checkpoint de partida se identifica como `m2r-init-e256-rb64-sig`, un identificador interno que sugiere "init" (inicialización) con 256 expertos y algún tipo de configuración "rb64" y "sig", sin más detalle público.

El ajuste fino se realizó con ScalarXLM en el paso 305175, en modalidad de ajuste completo (todos los pesos actualizados, no LoRA ni adaptadores). La model card reporta pérdidas de validación por dominio: code_syn 3,2288; facts 3,1113; math 3,1353; textbooks 2,7780; web 4,5132; wiki 3,9083. No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o instrucción supervisada, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, según la naturaleza del checkpoint y las pérdidas reportadas en dominios de texto.
- Cobertura aparente de dominios diversos: código sintético (code_syn), conocimiento factual (facts), matemáticas (math), libros de texto (textbooks), web y wiki, a juzgar por las métricas de held-out.
- Posible orientación multilingüe por la etiqueta "scalarxlm" y el prefijo "xlm", aunque no se confirma ningún idioma concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Investigación sobre arquitecturas MoE de muchos expertos: el modelo permite estudiar el comportamiento de una MoE con 256 expertos y menos de 500 millones de parámetros totales, útil para analizar enrutamiento y especialización de expertos en entornos académicos.
- Experimentos de ajuste fino comparativo: al ser un checkpoint pequeño (1,9 GB en el repo), se puede replicar el ajuste completo en una sola GPU consumer y comparar pérdidas por dominio con otras inicializaciones.
- Evaluación de tokenizadores multilingües: si se confirma la orientación "xlm", sirve para probar tokenizadores y preentrenamientos multilingües en tareas de baja resource.
- Generación de texto en dominios controlados: las pérdidas más bajas en textbooks (2,7780) sugieren un uso potencial en continuación de texto expositivo, siempre con validación adicional.
- Docencia y demostraciones de MoE: su tamaño reducido permite desplegarlo en portátiles con GPU para explicar conceptos de mezcla de expertos en cursos de IA.
- Baseline en pipelines de investigación: puede actuar como referencia de bajo coste en experimentos de destilación o de comparación de arquitecturas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pérdidas de validación (held-out loss) en el paso 305175:

| Dominio | Held-out loss |
|---|---|
| code_syn | 3,2288 |
| facts | 3,1113 |
| math | 3,1353 |
| textbooks | 2,7780 |
| web | 4,5132 |
| wiki | 3,9083 |

No se dispone de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 479.858.464 parámetros, en fp32 requiere aproximadamente 1,9 GB solo para pesos; en fp16 unos 1,0 GB; en int8 unos 0,5 GB; en int4 unos 0,25 GB. A ello hay que sumar caché KV y overhead del runtime, por lo que en la práctica se puede inferir con 2-4 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es sobradamente suficiente; también GPU de datacenter (A100, H100) aunque no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más de VRAM.
- Opciones de despliegue: al estar en safetensors, se puede cargar con Transformers si la arquitectura es compatible; para llama.cpp/Ollama sería necesario convertir a GGUF, lo que no está documentado. vLLM y TGI requerirían que la arquitectura MoE esté soportada, algo no confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia ScalarXLM ni MoE de 256 expertos con menos de 500 millones de parámetros totales y documentación pública suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("20b") y el número real de parámetros (479.858.464): el nombre puede inducir a error sobre el tamaño y el coste de despliegue.
- Documentación mínima: sin model card detallada, sin tokenizador documentado, sin arquitectura publicada y sin ejemplos de uso.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Idiomas no confirmados: la etiqueta "scalarxlm" sugiere multilingüismo, pero no hay lista de idiomas ni evaluaciones por idioma.
- Riesgo de alucinación: no evaluado; las pérdidas reportadas no permiten descartar generación de contenido falso, especialmente en el dominio web (4,5132, la pérdida más alta).
- Sin datos de sesgos, seguridad o alineación: no se ha documentado ningún proceso de RLHF, DPO o filtrado de datos.
- Sin soporte confirmado de tool calling ni agentes: no apto para pipelines de automatización que dependan de function calling sin validación previa.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-02) en los metadatos: posible anomalía en la publicación que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/gdiamos/amx-moe256-20b
