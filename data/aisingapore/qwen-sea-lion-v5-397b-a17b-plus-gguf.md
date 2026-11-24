# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF es la distribucion en formato GGUF del modelo Qwen-SEA-LION-v5-397B-A17B-Plus, desarrollado por el AI Products Pillar de AI Singapore con financiacion del National Research Foundation Singapore. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos orientada especificamente a las lenguas del sudeste asiatico. Este repositorio concreto contiene exclusivamente los pesos cuantizados para su uso con llama.cpp, no el modelo original.

El modelo es un transformer causal multimodal con encoder de vision, derivado de la arquitectura Qwen 3.5 en su variante 397B-A17B, lo que indica un diseno de mezcla de expertos (MoE) con aproximadamente 397 mil millones de parametros totales y 17 mil millones activos por token. El dato real de safetensors del repositorio base asciende a 568.998.952.192 parametros, cifra que incluye los componentes adicionales del modelo (encoder de vision, cabezas auxiliares y tablas n-gram). La longitud de contexto declarada es de 262.144 tokens.

Su relevancia actual radica en dos factores: por un lado, cubre nueve idiomas (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita) con licencia MIT, algo poco habitual en modelos de este tamano; por otro, ofrece cuantizaciones Q4_K_M, Q6_K y Q8_0 que permiten desplegar un modelo de casi 400B en hardware mas modesto que el requerido por los pesos BF16. El repositorio incluye ademas un parche necesario para llama.cpp, ya que la compilacion estandar carga los ficheros pero genera texto corrupto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; mezcla de expertos (MoE) segun la nomenclatura A17B; atencion lineal con puerta de salida SiLU |
| Parametros totales | 568.998.952.192 (safetensors del modelo base); 397B-A17B segun nomenclatura comercial |
| Parametros activos | 17B (indicado en el nombre del modelo) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M, Q6_K y Q8_0; encoder de vision en F16 |
| Idiomas soportados | Birmano (my), chino (zh), ingles (en), indonesio (id), filipino (fil), malayo (ms), tamil (ta), tailandes (th), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros divididos en el caso de Q8_0); modelo base en BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo mezcla de expertos con atencion lineal y una puerta de salida implementada con activacion SiLU. Esta particularidad es critica: la implementacion upstream de llama.cpp para Qwen4Exp emplea una puerta sigmoide, por lo que los ficheros GGUF de este repositorio requieren un parche (`llama.cpp-silu-gate.patch`) que ensena al runtime a leer la clave `qwen4exp.ssm.output_gate_silu`. Sin el parche, llama.cpp carga los pesos pero produce texto corrupto. El modelo conserva ademas las tablas n-gram y la cabeza de prediccion multi-token (MTP) del modelo original.

El encoder de vision se distribuye como un fichero separado (`mmproj-...gguf`, 0,9 GB en F16) compatible con cualquiera de las tres cuantizaciones del modelo de lenguaje. El tokenizador, la plantilla de chat y los valores por defecto de muestreo no se han modificado respecto al modelo base. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en nueve idiomas del sudeste asiatico mas chino e ingles.
- Modo de razonamiento explicito (thinking) activado por defecto, desactivable mediante `enable_thinking: false` en `chat_template_kwargs`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con encoder de vision separado.
- Prediccion multi-token (MTP), util para decodificacion especulativa y aceleracion de inferencia.
- Conversacion multi-turno con contexto de hasta 262.144 tokens.
- Compatibilidad con la API de chat de OpenAI a traves de `llama-server` (`/v1/chat/completions`).
- Interfaz web integrada en llama.cpp para chat con adjuncion de imagenes.
- Soporte de plantilla Jinja (`--jinja`) para el formateo de conversaciones.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita o filipino con una ventana de 262.144 tokens, lo que permite mantener el historial completo de un cliente y su documentacion adjunta en una sola sesion.
- Procesamiento de documentos comerciales con imagenes: gracias al encoder de vision, puede extraer datos de facturas, albaranes o formularios escaneados y responder preguntas sobre ellos, combinando la entrada visual con contexto textual largo.
- Analisis de imagenes medicas o agricolas en idiomas locales: el soporte de tamil, birmano o filipino permite desplegar asistentes de descripcion de imagenes en regiones donde los modelos generalistas rinden peor.
- Generacion de contenido en lenguas minoritarias: redaccion de articulos, resumenes o traducciones en birmano, tamil o filipino, idiomas con menor representacion en corpus de entrenamiento masivos.
- Asistencia logistica y aduanera regional: el ejemplo de la model card (exportacion de durian congelado de Medan a Singapur) ilustra el uso para consultas sobre documentacion de exportacion, tiempos de transito y riesgos de cadena de frio en rutas del sudeste asiatico.
- Despliegue en infrastructura propia con llama.cpp: al ofrecer cuantizaciones Q4_K_M (338 GB), Q6_K (467 GB) y Q8_0 (605 GB), permite servir el modelo en clusters con GPUs de 80 GB repartidas, sin depender de APIs externas.
- Investigacion linguistica comparada: la licencia MIT y la disponibilidad de pesos abiertos facilitan estudios de rendimiento por idioma y evaluaciones de sesgo en lenguas del sudeste asiatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 338 GB para Q4_K_M, 467 GB para Q6_K y 605 GB para Q8_0, mas 0,9 GB del encoder de vision si se usa entrada de imagen. Estas cifras exigen repartir el modelo entre varias GPUs o recurrir a memoria unificada.
- GPU recomendadas: no es viable en una unica GPU consumer. Se requieren configuraciones multi-GPU con A100 80 GB, H100 80 GB o H200; por ejemplo, cinco A100 de 80 GB para Q4_K_M con margen para el contexto, u ocho para Q8_0.
- No cabe en GPUs consumer (RTX 4090, 3090, etc.) de forma completa; solo seria posible con offloading parcial a RAM del sistema, con latencia muy elevada.
- Opciones de despliegue: llama.cpp con el parche `llama.cpp-silu-gate.patch` aplicado sobre el commit `401563f10ec60754e688cd3165c1343cf4be9642` (master a 2026-11-18), compilado con `-DGGML_CUDA=ON`. El servidor se lanza con `llama-server` y el flag `--mmproj` para vision. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF | 568,9B totales / 17B activos | 262.144 | 9 | MIT | GGUF |
| Qwen-SEA-LION-v5-397B-A17B-Plus (BF16) | 568,9B totales / 17B activos | 262.144 | 9 | MIT | Safetensors |
| Qwen-SEA-LION-v5-397B-A17B-Plus-FP8 | 568,9B totales / 17B activos | 262.144 | 9 | MIT | FP8 |
| Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4 | 568,9B totales / 17B activos | 262.144 | 9 | MIT | NVFP4 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad segun la propia model card; los desarrolladores deben aplicar su propio ajuste de seguridad antes de usarlo en produccion.
- Requiere una compilacion parcheada de llama.cpp: la version estandar carga los pesos pero genera texto corrupto por la diferencia entre la puerta SiLU y la sigmoide de Qwen4Exp.
- El repositorio ocupa 1.411 GB, lo que exige almacenamiento considerable y una descarga larga.
- El contexto de 262.144 tokens, aunque amplio, implica un coste de memoria KV elevado en produccion; no se documentan tecnicas de compresion de cache en la informacion disponible.
- La cobertura linguistica se limita a los nueve idiomas declarados; el rendimiento en otras lenguas no esta documentado.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la model card.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero los autores declinan cualquier responsabilidad por danos derivados del uso.
- El modelo base tiene versiones BF16, FP8 y NVFP4; la eleccion de GGUF limita el despliegue a llama.cpp y ecosistemas compatibles, sin soporte documentado para vLLM o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF
- Modelo base: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Version FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-FP8
- Version NVFP4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio oficial SEA-LION: https://sea-lion.ai
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia MIT: https://mit-license.org/
