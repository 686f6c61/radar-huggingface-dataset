# HirCoir/OrcaCyber-Nano-1.0

## Resumen

OrcaCyber Nano 1.0 es un modelo de lenguaje orientado a programación y aprendizaje, publicado por el usuario HirCoir como una distribución lista para ejecutar del modelo base `orcarouter/OrcaCyber-Nano-1.0`. La ficha que nos ocupa corresponde al paquete GGUF, que incluye el modelo cuantizado en IQ3_S, un proyector de visión en F16 y un build de llama.cpp con CUDA 12.8, además de scripts de arranque y un chat web con Gradio.

El modelo está afinado para revisión de código defensiva: localizar errores, mejorar la calidad del código y explicar buenas prácticas de programación, con un enfoque explícito en seguridad ofensiva controlada y aprendizaje. La información disponible lo etiqueta con el tag `qwen3`, lo que sugiere una base de la familia Qwen 3, y declara 27.320.697.856 parámetros totales según los pesos en safetensors del repositorio.

La relevancia de este paquete es práctica: elimina la fricción de despliegue al incluir binarios, runtime CUDA, túneles públicos y una API compatible con OpenAI. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada sobre datos de entrenamiento, por lo que su evaluación debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3, segun tag `qwen3`); detalles no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el script la asigna automaticamente segun recursos) |
| Tipos de cuantizacion | IQ3_S (GGUF); KV cache en q8_0; proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3`, que apunta a un transformer de la familia Qwen 3. El recuento de parametros (27.3 mil millones) es coherente con un modelo denso de esa familia, aunque no se confirma si emplea mezcla de expertos ni cuantos parametros estarian activos en tal caso. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El paquete incorpora innovaciones a nivel de inferencia mas que de entrenamiento: decodificacion especulativa con MTP (multi-token prediction) activada con `--spec-draft-n-max 2`, KV cache cuantizada en q8_0 y un proyector de vision multimodal (mmproj) que habilita entrada de imagenes. El servidor expone una API compatible con OpenAI en `/v1` y el script de arranque ajusta el contexto segun los recursos de la maquina.

## Capacidades

- Generacion de texto conversacional y asistencia general, con muestreo recomendado de `temp 1.0`, `top-p 0.95` y `top-k 20`.
- Generacion, completado y revision de codigo en multiples lenguajes (no se especifica la lista).
- Revision de codigo defensiva: deteccion de errores, mejoras de calidad y seguridad.
- Explicacion de proyectos y librerias, orientada al aprendizaje.
- Entrada de imagen mediante el proyector de vision (mmproj), enviando contenido como `image_url` en la API.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integracion con clientes existentes.
- Chat web con Gradio e historial persistente incluido en el paquete.
- Túneles publicos automaticos `*.gradio.live` mediante `frpc`.
- Modo de razonamiento (reasoning) desactivado por defecto en la configuracion del servidor.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Revision de codigo en pull requests: el modelo puede analizar diffs y senalar errores, malas practicas y riesgos de seguridad, aprovechando su afinado especifico en revision defensiva. Se integraria como paso previo a la revision humana.
- Asistencia a desarrolladores junior: explicar como funciona un proyecto o una libreria a partir del codigo y la documentacion, con el chat web incluido en el paquete como interfaz de bajo coste.
- Entornos de aprendizaje y formacion: desplegar el servidor local con llama.cpp y usarlo en talleres para ensenar como funciona un modelo de lenguaje, tal como propone el autor.
- Prototipado rapido con API compatible OpenAI: sustituir el endpoint de un proveedor externo por el servidor local en `/v1` sin reescribir el codigo cliente, util para pruebas de integracion.
- Analisis de capturas de pantalla y diagramas: gracias al proyector de vision, se pueden enviar imagenes de interfaces, diagramas de arquitectura o mensajes de error para obtener explicaciones.
- Demos publicas temporales: los túneles `*.gradio.live` permiten exponer el chat o la API durante una sesion de evaluacion sin infraestructura de red adicional.
- Auditoria de seguridad de codigo propio: el enfoque defensivo del afinado lo hace adecuado para revisar vulnerabilidades comunes en proyectos personales o educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado IQ3_S ocupa 13,0 GB y el proyector de vision 928 MB, por lo que se necesita aproximadamente 14 GB solo para los pesos, mas el espacio de KV cache (q8_0) y buffers de contexto.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; el autor indica `-ngl 99` para descargar todas las capas en GPU. Para contexto amplio se recomienda 24 GB o mas (RTX 3090, RTX 4090, A100, H100).
- GPU de consumo: cabe en tarjetas de 16 GB con contexto moderado; en 12 GB requeriria reducir contexto o usar una cuantizacion menor no incluida en el paquete.
- Opciones de despliegue: llama.cpp (build b12600 con CUDA 12.8 incluido en el paquete), servidor compatible con OpenAI, chat Gradio.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP (`--spec-draft-n-max 2`) esta activada por defecto y deberia mejorar el throughput respecto a decodificacion estandar, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de OrcaCyber Nano 1.0 que permitan una comparacion cuantitativa fiable. A continuacion se comparan solo caracteristicas objetivas con alternativas de tamano similar orientadas a codigo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OrcaCyber Nano 1.0 (este) | 27,3 B | no disponible | Apache 2.0 | GGUF + mmproj | Vision, paquete llama.cpp incluido, sin benchmarks |
| Qwen2.5-Coder-32B | 32,5 B | 128 K | Apache 2.0 | safetensors, GGUF | Referencia en generacion de codigo, benchmarks publicados |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos) | 128 K | DeepSeek License | safetensors, GGUF | MoE, buenos resultados en codigo |
| Codestral-22B | 22 B | 32 K | MNPL (no comercial) | safetensors, GGUF | Restricciones de licencia para uso comercial |

La comparacion de rendimiento real no esta disponible para OrcaCyber Nano 1.0.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluaciones independientes; el rendimiento real es desconocido.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.
- La model card no detalla datos de entrenamiento, composicion del dataset ni proceso de alineacion, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de evaluaciones de fiabilidad.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no especificada; el script la asigna dinamicamente, lo que puede producir comportamientos variables entre despliegues.
- La cuantizacion IQ3_S es agresiva para 27 B de parametros y puede degradar la calidad respecto al modelo base en safetensors.
- El paquete incluye binarios precompilados de llama.cpp y `frpc` de Gradio; conviene verificar su procedencia antes de ejecutarlos en entornos de produccion.
- Los túneles publicos `*.gradio.live` exponen el servidor en Internet sin autenticacion aparente: riesgo de acceso no autorizado si se dejan activos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento podrian imponer condiciones adicionales no reflejadas en esta ficha.

## Enlaces

- Repositorio Hugging Face (este paquete): https://huggingface.co/HirCoir/OrcaCyber-Nano-1.0
- Modelo base: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
