# bambocher/Qwen3.5-9B-heretic-oQ2-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2-mtp es una cuantizacion mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina pesos en precision variable (de 2 a 16 bits) para reducir el peso total a 4,29 GiB manteniendo una media efectiva de 3,817 bits por peso. La herramienta empleada es oQ, el modulo de cuantizacion de oMLX v0.7.3, orientado a la ejecucion eficiente de modelos en Apple Silicon mediante el framework MLX.

El modelo incluye tres componentes diferenciados: el modelo de lenguaje (8,954B parametros logicos), un modulo de vision (0,456B) y una cabeza MTP (multi-token prediction) de 0,243B, sumando 9,653B parametros logicos totales. La presencia de vision y MTP sugiere que el Qwen3.5-9B original es un modelo multimodal con decodificacion especulativa nativa, aunque la model card no aporta detalles sobre arquitectura, contexto o datos de entrenamiento.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~9,6B parametros multimodales en equipos con memoria unificada limitada (del orden de 5-6 GB) usando MLX. Sin embargo, la informacion publicada es muy escasa (sin licencia declarada, sin idiomas, sin benchmarks) y el modelo no registra descargas ni interacciones, por lo que debe tratarse como un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B; incluye modulo de vision y cabeza MTP) |
| Parametros totales | 9,653B logicos (8,954B LM + 0,456B vision + 0,243B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64 y 128), affine 4-bit (grupo 64), affine 5-bit (grupo 64), BF16; media efectiva 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX (libreria `mlx`, cuantizacion oQ de oMLX); tamano total 4,606 GB / 4,290 GiB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada. Por la composicion del checkpoint se deduce que el modelo original combina un transformer de lenguaje con un codificador o proyector de vision (0,456B parametros) y una cabeza de prediccion multi-token (MTP, 0,243B), lo que habilita entrada de imagenes y decodificacion especulativa. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El proceso de cuantizacion si esta documentado: oQ (oMLX v0.7.3) asigna precision de forma no uniforme segun la sensibilidad de cada tensor. El 62% de los pesos logicos (5,986B) se almacenan a 2 bits con grupo 64, mientras que las capas mas sensibles retienen 4-5 bits (1,630B en total) y un 5,08% (0,491B) permanece en BF16. El resultado es un checkpoint de 4,29 GiB con media de 3,817 bits/peso, un compromiso agresivo entre tamano y fidelidad numerica.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B (no verificadas en esta cuantizacion).
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,456B parametros, lo que indica soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP de 0,243B permite prediccion multi-token para acelerar la generacion.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible.
- Ejecucion en Apple Silicon mediante MLX: capacidad operativa confirmada por el formato del checkpoint.

## Casos de uso

- Prototipado local en Mac: el checkpoint de 4,29 GiB permite cargar un modelo de ~9,6B parametros multimodales en un Mac con 16 GB de memoria unificada, adecuado para experimentar con MLX sin infraestructura GPU dedicada.
- Pruebas de cuantizacion extrema: util para investigar el impacto de la cuantizacion mixta a 2-3 bits en tareas de razonamiento, comparando la salida de este checkpoint con el modelo base en BF16.
- Inferencia con vision en el borde: el modulo de vision integrado permite clasificar o describir imagenes en local, sin enviar datos a servicios en la nube.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificacion autoregresiva estandar en MLX.
- Generacion de texto asistida en entornos con memoria limitada: redaccion, resumen y extraccion de informacion en equipos consumer donde no cabe una version de 8 bits.
- Banco de pruebas de alineacion: el sufijo "heretic" sugiere un ajuste orientado a reducir rechazos; puede usarse para estudiar el comportamiento de modelos desalineados, siempre con las cautelas eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~4,3 GiB para los pesos en el formato publicado, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB segun longitud de contexto.
- GPU recomendadas: Apple Silicon con memoria unificada (M1/M2/M3/M4, preferiblemente 16 GB o mas); el formato MLX no es directamente compatible con CUDA.
- GPU consumer: cabe en Mac con 16 GB de memoria unificada; no aplicable a RTX 4090 u otras GPU NVIDIA sin conversion previa a otro formato.
- Opciones de despliegue: MLX y oMLX (formato nativo); para llama.cpp, Ollama o vLLM seria necesaria una conversion a GGUF u otro formato, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2-mtp | 9,653B logicos | no disponible | MLX, 3,817 bits/peso | no disponible | Cuantizacion mixta agresiva, incluye vision y MTP |
| Qwen3.5-9B (base) | ~9B | no disponible | safetensors/BF16 | no disponible | Modelo original sin cuantizar; mayor fidelidad, mayor huella de memoria |
| Cuantizaciones GGUF 4-bit de modelos ~9B | ~9B | depende del modelo | GGUF Q4 | depende del modelo | Compatibles con llama.cpp/Ollama; no soportan MLX de forma nativa |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion a 2 bits en el 62% de los pesos puede degradar de forma notable el razonamiento, la coherencia en contextos largos y la fidelidad en tareas de codigo o matematicas.
- El sufijo "heretic" indica un ajuste orientado a eliminar rechazos de seguridad; el modelo puede producir contenido inapropiado o danino sin filtros, lo que exige supervision en cualquier despliegue.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe verificarse la licencia del modelo base Qwen3.5-9B antes de cualquier uso en produccion.
- Sin datos de benchmarks, idiomas ni contexto: no es posible evaluar su calidad frente al modelo original.
- Sin descargas ni validacion de la comunidad: riesgo de errores en la publicacion o de pesos corruptos no verificado.
- Formato MLX exclusivo: no es portable a ecosistemas CUDA sin conversion manual.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado por la cuantizacion extrema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
