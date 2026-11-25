# goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit

## Resumen

Huihui-Qwen3.8-27B-abliterated-mlx-4Bit es una cuantizacion en 4 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una variante "abliterated" (sin los mecanismos de rechazo alineados) de un modelo de la familia Qwen3. El repositorio lo publica el usuario goodmai y deriva de una conversion previa realizada por AutisticAF mediante mlx-lm 0.31.2. Su proposito es permitir la inferencia del modelo en hardware Apple Silicon (macOS) sin necesidad de Python, a traves de la herramienta Basalt.

El modelo cuenta con 26.895.993.856 parametros totales (aproximadamente 27 mil millones) en formato safetensors, con un tamano de repositorio de 15,2 GB, coherente con una cuantizacion de 4 bits. La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto), aunque la model card no aporta detalles sobre el componente visual ni sobre la longitud de contexto.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantizacion MLX orientada a despliegue local en Mac; por otro, advierte de que se trata de un modelo "abliterated" y "uncensored", con las implicaciones eticas y de seguridad que ello conlleva. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; transformer presumiblemente, sin confirmar) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base dispone de otras variantes no detalladas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 15,2 GB de repositorio |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La etiqueta de Hugging Face `qwen3_5` sugiere que deriva de la familia Qwen3, y la pipeline `image-text-to-text` indica que incorpora un componente de procesamiento de imagen ademas del modelo de lenguaje. El dato de 26.895.993.856 parametros totales corresponde a los pesos safetensors del repositorio.

El proceso conocido es el de cuantizacion: el modelo original huihui-ai/Huihui-Qwen3.8-27B-abliterated fue convertido a formato MLX en 4 bits por AutisticAF usando mlx-lm 0.31.2, y goodmai publica una version derivada. El termino "abliterated" hace referencia a una tecnica de modificacion de pesos que elimina o atenua la direccion de rechazo aprendida durante el alineamiento, dando lugar a un modelo "uncensored". No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional y de respuesta a instrucciones, segun la etiqueta `conversational`.
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`), aunque no se detallan las capacidades visuales concretas.
- Comportamiento "uncensored": el proceso de abliteration elimina los rechazos alineados, por lo que el modelo tiende a responder a peticiones que un modelo alineado rechazaria.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Ejecucion en Apple Silicon mediante MLX y la herramienta Basalt (macOS 27+, Swift 6.4, sin Python).
- No se documentan capacidades de tool calling, agentes, modo thinking ni audio en la informacion disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX 4-bit y la integracion con Basalt permiten ejecutar un modelo de ~27B en equipos Apple sin depender de CUDA ni de Python, usando `basalt serve --model ... --rest`.
- Experimentacion en investigacion sobre alineamiento y seguridad: al ser un modelo abliterated, resulta util para estudiar el efecto de la eliminacion de la direccion de rechazo en el comportamiento del modelo, siempre en entornos controlados.
- Prototipado de asistentes conversacionales multimodales: la pipeline image-text-to-text permite probar flujos que combinan imagen y texto en local.
- Evaluacion de tecnicas de cuantizacion: sirve como caso practico para medir la degradacion de calidad de un modelo de ~27B al pasar a 4 bits en MLX frente al modelo original en precision completa.
- Desarrollo de herramientas de escritorio para macOS: la CLI y app Basalt facilitan integrar el modelo en aplicaciones nativas Swift sin stack Python.
- Pruebas de generacion de contenido sin filtros en entornos de investigacion cerrados, asumiendo la responsabilidad legal y etica del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 15,2 GB en 4 bits; se requiere memoria unificada suficiente para cargar los pesos mas el overhead de inferencia (orientativamente por encima de 16 GB, valor no confirmado por el autor).
- Hardware objetivo: Apple Silicon (macOS 27+), segun la model card; la herramienta Basalt esta pensada para chips Apple.
- GPU CUDA: no se documenta soporte; el formato es MLX, no GGUF ni safetensors estandar para CUDA.
- Despliegue: `mlx-lm` (Python) o Basalt v0.11.0 (Swift, sin Python) mediante `basalt serve --model ... --rest`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit | 26,9B | no disponible | 4-bit MLX | apache-2.0 | safetensors (MLX) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | ~27B | no disponible | precision original | apache-2.0 | safetensors |
| AutisticAF/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit (upstream) | ~27B | no disponible | 4-bit MLX | apache-2.0 | safetensors (MLX) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha eliminado el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado; no es adecuado para despliegues publicos sin filtros adicionales.
- Riesgo elevado de alucinacion y de respuestas no verificadas, comun en modelos sin alineamiento estricto.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo en precision completa; no se aportan mediciones.
- No se documentan sesgos especificos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad para produccion.
- La licencia apache-2.0 permite uso comercial, pero el uso de un modelo sin censura puede contravenir politicas de plataformas y normativas locales; la responsabilidad recae en el desplegador.
- Dependencia de hardware Apple Silicon y de la herramienta Basalt; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- Fecha de creacion y actualizacion (noviembre de 2026) y ausencia de likes/descargas elevadas sugieren un modelo poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Conversion upstream MLX: https://huggingface.co/AutisticAF/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit
- Basalt (repositorio): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Basalt (web): https://bas-alt.vercel.app
- Demo de ejecucion: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FHuihui-Qwen3.8-27B-abliterated-mlx-4Bit&role=chat
