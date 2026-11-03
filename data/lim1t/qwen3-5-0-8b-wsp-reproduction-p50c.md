# lim1t/Qwen3.5-0.8B-wsp-reproduction-p50c

## Resumen

Qwen3.5-0.8B-wsp-reproduction-p50c es una reproduccion de pesos del modelo Qwen/Qwen3.5-0.8B publicada por el usuario lim1t. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: los pesos se reconstruyeron aplicando el parche publicado "p50c" sobre la revision `2fc06364715b967f1860aea9cf38778875588b17` del modelo base, sin entrenamiento adicional ni descubrimiento de nuevas ediciones. El resultado es un checkpoint multimodal de tipo image-text-to-text con 873.438.784 parametros y licencia Apache-2.0.

La relevancia de esta publicacion es metodologica: sirve como artefacto de verificacion reproducible de la tecnica de "weight-space programming", en la que se editan tensores concretos del modelo en lugar de reentrenarlo. El autor declara que los 130.188 valores BF16 modificados pasaron las comprobaciones SHA256 contra el manifiesto upstream, tanto en su version base como en la editada, y que la generacion de texto corta funciona en una RTX 2080 SUPER con Transformers en BF16.

Conviene subrayar que el propio autor no reclama ninguna mejora de rendimiento medida: la evaluacion independiente de benchmarks esta pendiente y el comportamiento de la rama de vision no se ha evaluado. La ficha, por tanto, describe un artefacto de reproduccion verificable, no un modelo listo para produccion con metricas contrastadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-0.8B; pesos de vision sin editar |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de evaluacion planificado usa 32.768 tokens nuevos maximos por respuesta, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (la verificacion se hizo en BF16; el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal del Qwen3.5-0.8B original, incluida la torre de vision, cuyos pesos permanecen intactos. La unica modificacion respecto al base son tensores nombrados del modelo de texto: el autor cuantifica la diferencia en 130.188 valores BF16. No hubo entrenamiento, RLHF, DPO ni descubrimiento de nuevas ediciones; el proceso consiste en aplicar un parche publicado y reconstruir el checkpoint, verificando cada tensor editado con SHA256 contra el manifiesto upstream.

La innovacion tecnica relevante es el propio paradigma de weight-space programming: en lugar de ajustar el modelo con gradientes, se localizan y editan directamente pesos del espacio de parametros. El sufijo "p50c" hace referencia al presupuesto de forward passes del editor, no a una epoca de entrenamiento, segun aclara el autor. El parche y los registros publicados estan bajo CC BY 4.0 y los scripts de reconstruccion bajo MIT, mientras que los pesos resultantes conservan la licencia Apache-2.0 del modelo original.

## Capacidades

- Generacion de texto conversacional: el autor confirma que la generacion de texto corta funciona en Transformers BF16 sobre una RTX 2080 SUPER.
- Procesamiento multimodal image-text-to-text: se conserva la arquitectura multimodal y los pesos de vision originales, aunque el comportamiento de vision no ha sido evaluado.
- Razonamiento con modo thinking: el protocolo de evaluacion planificado activa el modo thinking, lo que indica que la capacidad esta presente en la arquitectura heredada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Otras capacidades (audio, vision especializada): no disponible.

## Casos de uso

- Reproduccion y auditoria de experimentos de weight-space programming: el checkpoint permite a un investigador verificar de forma independiente que los 130.188 valores BF16 editados coinciden con el parche p50c, usando los scripts MIT y el manifiesto SHA256 upstream. Es adecuado porque el artefacto incluye trazabilidad completa de revision y hashes.
- Validacion de pipelines de reconstruccion de pesos: sirve para comprobar que una herramienta propia de aplicacion de parches produce el mismo resultado que la publicada, comparando tensores y hashes antes de escalar a modelos mayores.
- Pruebas de humo de inferencia multimodal en hardware de gama consumer: con 873 millones de parametros y 1,8 GB de repo, se puede cargar en BF16 en una RTX 2080 SUPER para validar que la generacion de texto funciona tras la edicion, tal como hizo el autor.
- Docencia y divulgacion sobre edicion de pesos: permite mostrar de forma tangible la diferencia entre fine-tuning y edicion directa de tensores, con un caso reproducible y verificable.
- Baseline para comparativas de metodos de edicion: un equipo que desarrolle su propia tecnica de edicion de pesos puede usar este checkpoint como referencia de reconstruccion fiel antes de medir efectos.
- Evaluacion controlada de MATH-500: el autor planifica una evaluacion local con Transformers BF16, thinking activado, temperature 0.6, top_p 0.95, top_k 20, penalizacion de presencia 1.5 y cuatro respuestas por problema; el checkpoint sirve como sujeto de ese protocolo, aunque el resultado aun no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion independiente de precision aun no esta disponible y que la publicacion no constituye una afirmacion de mejora de rendimiento medida. La evaluacion local de MATH-500 esta planificada pero no completada, y el propio autor advierte que el motor (Transformers en lugar de vLLM) y la implementacion de RNG difieren del articulo original.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873.438.784 parametros, en BF16 se requieren aproximadamente 1,75 GB solo para pesos, mas overhead de activaciones y KV cache; en FP32, unos 3,5 GB.
- GPU verificada por el autor: RTX 2080 SUPER (8 GB), con Transformers en BF16 y generacion de texto corta funcionando.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para BF16 en texto; para la rama de vision y contextos largos conviene mas memoria, aunque no se publican mediciones.
- Cabe en GPU consumer: si, segun la verificacion del autor en RTX 2080 SUPER.
- Opciones de despliegue: Transformers es la via documentada y verificada. vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible; el autor senala que su protocolo de evaluacion usa Transformers y no el motor vLLM de los autores del articulo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-reproduction-p50c | 873.438.784 | no disponible | Apache-2.0 | Reproduccion por edicion de pesos (p50c) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | Modelo base multimodal original | HuggingFace (referenciado como upstream) |
| Otros modelos de ~0,8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base del que deriva. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo entrenado: es una reconstruccion por aplicacion de un parche; no incorpora aprendizaje nuevo ni descubrimiento de ediciones.
- Sin evidencia de mejora: el autor declara explicitamente que la publicacion no constituye una afirmacion de mejora de rendimiento medida; no hay benchmarks independientes.
- Rama de vision sin evaluar: los pesos de vision se conservan intactos, pero su comportamiento no ha sido probado.
- Evaluacion planificada con divergencias metodologicas: el protocolo de MATH-500 usara Transformers en lugar de vLLM y un RNG distinto al del articulo, por lo que los resultados no seran directamente comparables con los publicados por los autores originales.
- Idiomas no declarados: se desconoce el soporte multilingue real del checkpoint.
- Contexto no documentado: no se especifica la longitud de contexto efectiva en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este checkpoint.
- Licencia y atribucion: los pesos son Apache-2.0, pero los parches y registros publicados son CC BY 4.0 y los scripts de reconstruccion MIT; es obligatorio preservar la licencia upstream y la atribucion a Qwen, a Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab.
- Madurez del artefacto: 0 descargas y 0 likes en HuggingFace en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Advertencia de produccion: no debe desplegarse en entornos productivos sin una evaluacion propia de calidad, sesgos y seguridad, dado que no existe medicion publicada de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lim1t/Qwen3.5-0.8B-wsp-reproduction-p50c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo de parche y reconstruccion: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math/runs/p50c/edit
- Blog de weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
