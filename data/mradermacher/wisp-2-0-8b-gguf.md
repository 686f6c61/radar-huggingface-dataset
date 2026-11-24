# mradermacher/Wisp-2-0.8B-GGUF

## Resumen

Wisp-2-0.8B es un modelo de lenguaje especializado en completado de codigo (code completion y fill-in-the-middle) desarrollado originalmente por philipjohnbasile. Esta ficha cubre la version cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 752.393.024 parametros (aproximadamente 0,8B), lo que lo situa en la categoria de modelos ultra-ligeros orientados a inferencia local y de baja latencia.

La relevancia de este modelo radica en su enfoque especifico: no es un modelo conversacional generalista, sino una herramienta disenada para autocompletado de codigo en editores, con soporte nativo de fill-in-the-middle (FIM) y multi-token prediction. Los tags de la model card mencionan capacidades de decodificacion especulativa, una arquitectura basada en gated-deltanet y referencias a qwen3_5, lo que sugiere una arquitectura hibrida orientada a eficiencia. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La version GGUF de mradermacher ofrece un abanico de cuantizaciones estaticas desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluyendo Apple Silicon y GPUs de consumo. El repositorio tiene un tamano total de 7,5 GB al incluir todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-deltanet (hibrida, segun tags); referencias a qwen3_5 |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | code (codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura es limitada. Los tags de la model card indican "gated-deltanet" y "qwen3_5", lo que apunta a una arquitectura hibrida que combina mecanismos de atencion con componentes de tipo state-space o delta networks, probablemente inspirada en la familia Qwen 3.5. El modelo esta disenado especificamente para tareas de completado de codigo, con soporte de fill-in-the-middle (FIM) y multi-token prediction, capacidades que sugieren un entrenamiento orientado a prediccion de secuencias de codigo en lugar de dialogo general.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Los tags mencionan "speculative-decoding" y "apple-silicon", lo que indica que el modelo fue optimizado para decodificacion especulativa y despliegue en hardware Apple. El modelo base es philipjohnbasile/Wisp-2-0.8B, y esta version es una cuantizacion estatica realizada por mradermacher sin quants ponderados/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Completado de codigo (code completion) en linea, disenado para autocompletado en editores.
- Fill-in-the-middle (FIM): relleno de codigo entre un prefijo y un sufijo dados.
- Multi-token prediction: prediccion de varios tokens simultaneamente, lo que acelera la generacion.
- Decodificacion especulativa: soporte para tecnicas de aceleracion de inferencia.
- Optimizacion para Apple Silicon.
- Capacidades conversacionales basicas (tag "conversational").
- Especializado en codigo; no se documentan capacidades multilingues naturales, vision, audio ni tool calling.

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse en plugins de VS Code, Neovim o JetBrains para sugerir lineas o bloques de codigo mientras el desarrollador escribe, gracias a su soporte nativo de FIM y su baja latencia al ser un modelo de 0,8B.
- Completado de funciones a partir de firmas: dado un nombre de funcion y su firma, el modelo rellena el cuerpo mediante FIM, util para scaffolding rapido de codigo boilerplate.
- Relleno de huecos en refactorizaciones: en un bloque de codigo con una seccion marcada para completar, el modelo genera la implementacion coherente con el contexto circundante.
- Asistente local en IDE sin conexion: al ejecutarse en formato GGUF con llama.cpp u Ollama, puede desplegarse en la maquina del desarrollador sin enviar codigo a servicios externos, lo que es relevante para entornos con requisitos de privacidad.
- Generacion de tests unitarios a partir de funciones existentes: usando FIM con el codigo de la funcion como prefijo, el modelo puede completar esqueletos de tests.
- Prototipado rapido en notebooks: completado de celdas de codigo en Jupyter mediante integraciones con kernels que acepten modelos GGUF.
- Despliegue en Apple Silicon: gracias a la optimizacion mencionada en los tags, puede ejecutarse en Macs con chip M-series para autocompletado local de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en Q2_K a Q4_K_M; 0,7 GB en Q5-Q6; 0,9 GB en Q8_0; 1,6 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas pequenas; RTX 3060, RTX 4060 o superiores ofrecen margen holgado.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna e incluso iGPUs con memoria compartida suficiente.
- Apple Silicon: soporte explicitamente mencionado en los tags; ejecutable en Macs M1/M2/M3/M4.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con APIs de endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 0,8B con multi-token prediction, se espera baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wisp-2-0.8B (esta ficha) | 0,8B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en FIM y code completion |
| Qwen2.5-Coder-0.5B | 0,5B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo de codigo generalista de Alibaba |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | safetensors, GGUF | Mayor tamano, requiere mas recursos |
| CodeGemma-2B | 2B | 8K | Gemma license | safetensors, GGUF | Enfocado en FIM y code completion |

Nota: los datos de contexto y rendimiento de los modelos comparables no se han verificado en la informacion proporcionada y pueden variar; se incluyen como referencia de categoria.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en codigo; su rendimiento en lenguaje natural general sera limitado.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion de APIs, funciones o librerias inexistentes, comun en modelos de codigo de este tamano.
- Longitud de contexto no documentada; el rendimiento en ventanas largas es desconocido.
- Las cuantizaciones Q2_K y Q3 pueden degradar significativamente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- No hay quants ponderados/imatrix disponibles, lo que puede afectar la calidad relativa frente a otras cuantizaciones.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y procedencia del modelo base antes de uso comercial.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wisp-2-0.8B-GGUF
- Modelo base: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wisp-2-0.8B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
