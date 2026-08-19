# andreaborio/Qwen3.6-35B-A3B-Hebrus-GGUF

## Resumen

El repositorio `andreaborio/Qwen3.6-35B-A3B-Hebrus-GGUF` contiene artefactos de inferencia específicos para el motor Hebrus, un runtime de Apple Metal con streaming de expertos a SSD. Se trata de una cuantización del modelo base Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y 3000 millones activos por token. El autor, andreaborio, publica dos perfiles: uno estable recomendado (MLX Affine4 G64) y otro beta (Q2_K_XL), ambos con pesos enrutados en un formato propietario denominado `ds4.expert_major.v2`.

La relevancia actual radica en que permite ejecutar un modelo MoE de gran tamaño en un Mac con Apple Silicon y solo 16 GiB de memoria unificada, gracias a la descarga de expertos desde SSD bajo demanda. Sin embargo, estos archivos no son portables a otros backends como llama.cpp, MLX, Ollama o la inferencia alojada de Hugging Face. El modelo base declara licencia Apache 2.0 y la cuantización hereda esa licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con Gated DeltaNet (segun el modelo base Qwen3.6-35B-A3B) |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) |
| Longitud de contexto | 131 072 tokens (perfil Affine4 estable); 32 768 tokens (perfil Q2_K_XL beta) |
| Tipos de cuantizacion | MLX Affine4 G64 (estable) y Q2_K_XL (beta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con extensiones Hebrus (no portable a otros runtimes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35B de parámetros totales y 3B activos por token, que incorpora Gated DeltaNet (mencionado en la documentación de Hebrus) como mecanismo de atención eficiente. El repositorio no incluye información sobre el entrenamiento original del modelo base, ya que se trata de una cuantización posterior. La innovación técnica principal reside en el motor Hebrus: utiliza un formato de pesos con "ExpertMajor v2" que permite mantener los expertos enrutados en un almacén con checksum (`ds4.expert_major.v2`) y cargarlos desde SSD de forma acotada durante la inferencia. El runtime gestiona una política de residente/SSD y un planificador de prefill, lo que permite ejecutar el modelo en memoria unificada reducida.

El perfil estable (MLX Affine4 G64) está cualificado para 16 GiB con contexto completo de 131 072 tokens mediante descarga a SSD. El perfil beta (Q2_K_XL) requiere 64 GiB y solo está cualificado hasta 32 768 tokens, sin garantía de ventana completa. Ambos perfiles comparten el mismo grafo de Qwen, tokenizador, sesión, atención, Gated DeltaNet, KV, enrutamiento y política de residente/SSD; solo difiere el códec de pesos físicos.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto en lenguaje natural y seguir instrucciones, al ser una cuantizacion del modelo Qwen3.6-35B-A3B.
- Soporte de chat: el servidor Hebrus implementa el endpoint `/v1/chat/completions` para esta familia de modelos.
- Inferencia local en Apple Silicon: disenado exclusivamente para Metal, con CPU solo como referencia o depuracion.
- Streaming de expertos a SSD: permite ejecutar el modelo en memoria unificada reducida (16 GiB) con contexto largo, cargando expertos bajo demanda.
- No portable: los artefactos no funcionan con llama.cpp, MLX, Ollama ni inferencia alojada de Hugging Face.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia local en Mac con 16 GiB de memoria unificada: el caso principal es ejecutar un MoE de 35B con contexto de 131 072 tokens en un MacBook o Mac Studio de gama de entrada, gracias al streaming de expertos a SSD. Es adecuado para desarrolladores que necesitan un modelo grande sin GPU dedicada.
- Prototipado y pruebas de aplicaciones de chat: mediante el servidor compatible con OpenAI (`/v1/chat/completions`), se puede integrar en aplicaciones de chat locales o en entornos de desarrollo sin depender de servicios en la nube.
- Investigacion sobre cuantizacion y formatos de pesos: el formato ExpertMajor v2 y las diferencias entre perfiles Affine4 y Q2_K_XL pueden servir como referencia para estudiar el equilibrio entre tamano, velocidad y calidad en MoE.
- Despliegue en entornos con restricciones de hardware: organizaciones que solo disponen de hardware Apple y necesitan un modelo de gran tamano con ventana de contexto amplia pueden usarlo como sustituto de soluciones basadas en GPU NVIDIA.
- Evaluacion de modelos MoE en Metal: permite comparar el rendimiento de Qwen3.6-35B-A3B cuantizado con otros modelos que Hebrus soporta (DeepSeek, GLM, segun la documentacion), aunque no se proporcionan datos de rendimiento en esta ficha.
- Desarrollo de aplicaciones de asistencia personal: dado el soporte de chat multi-turno y contexto largo, se puede usar para asistentes que requieran recordar conversaciones extensas, siempre que se acepte la latencia del streaming a SSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion menciona que el rendimiento depende del artefacto exacto, la revision del runtime, el contexto, el prompt, el modo, la presion de memoria, el estado del almacenamiento y la termica, pero no ofrece cifras concretas.

## Requisitos de hardware

- Perfil estable (MLX Affine4 G64): Apple Silicon con al menos 16 GiB de memoria unificada, Xcode Command Line Tools y suficiente espacio en SSD para el archivo de 20 808 566 880 bytes (~20,8 GB). El modo AUTO resuelve a "guarded SSD" en la gama de 16 GiB.
- Perfil beta (Q2_K_XL): Apple Silicon con al menos 64 GiB de memoria unificada, espacio SSD para el archivo de 12 290 632 032 bytes (~12,3 GB). No se recomienda para 16 GiB.
- Backend: exclusivamente Apple Metal. La CPU es solo referencia/depuracion; no hay fuentes CUDA ni ROCm, y la inferencia distribuida esta retirada.
- Despliegue: el runtime Hebrus se compila desde fuente (v0.3.0) con `make`, y se descarga el modelo mediante un script que verifica SHA-256. No se mencionan opciones como vLLM, llama.cpp u Ollama porque el formato no es compatible.
- Latencia y throughput: no se proporcionan estimaciones cuantitativas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones de Qwen3.6-35B-A3B ni con modelos MoE similares (como DeepSeek-V3 o GLM-4) dentro del ecosistema Hebrus. La documentacion indica que Hebrus soporta otras familias, pero no se ofrecen cifras de rendimiento ni comparaciones directas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Exclusividad de hardware: solo funciona en Apple Silicon Metal; no hay soporte CUDA, ROCm ni CPU de produccion.
- No portable: los archivos GGUF con extensiones Hebrus no son compatibles con llama.cpp, MLX, Ollama ni la inferencia alojada de Hugging Face. El widget de Hub esta desactivado deliberadamente (`inference: false`).
- Perfil beta restringido: Q2_K_XL solo esta cualificado hasta 32 768 tokens y no garantiza la ventana completa de 131 072; su tamano menor no reduce el requisito de 64 GiB.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos, pero al ser un modelo de lenguaje generativo existe riesgo de alucinacion, especialmente en tareas factuales.
- Limitaciones de contexto: el perfil estable esta cualificado para 131 072 tokens en 16 GiB, pero con descarga a SSD; en condiciones de memoria o almacenamiento suboptimos el rendimiento puede degradarse.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el runtime Hebrus es un proyecto de codigo abierto (repositorio GitHub) y se debe verificar su licencia propia si se usa en produccion.
- Dependencia de revisiones: la compatibilidad depende de la revision exacta del runtime y de los artefactos; se exige un inventario completo de tensores/tokenizador/ExpertMajor y el sistema falla de forma segura ante perfiles cruzados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andreaborio/Qwen3.6-35B-A3B-Hebrus-GGUF
- Repositorio GitHub del motor Hebrus: https://github.com/andreaborio/hebrus
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Contrato de lanzamiento de Qwen (documentacion tecnica): https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/contracts/qwen-release.json
- Contrato de soporte de runtime: https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/contracts/RUNTIME_SUPPORT.md
