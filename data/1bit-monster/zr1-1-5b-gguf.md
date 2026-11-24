# 1bit-MONSTER/ZR1-1.5B-GGUF

## Resumen

ZR1-1.5B-GGUF es el paquete de cuantizaciones publicado por 1bit-MONSTER a partir de Zyphra/ZR1-1.5B, un modelo pequeno de razonamiento de 1.777.088.000 parametros entrenado con aprendizaje por refuerzo sobre problemas verificados de codigo y matematicas. El modelo original lo desarrolla Zyphra y su linaje se remonta a deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, por lo que hereda la arquitectura Qwen2ForCausalLM y el tokenizador con especiales de estilo DeepSeek en lugar de ChatML.

El repositorio no contiene pesos nuevos ni un modelo reentrenado: ofrece dos builds GGUF (Q8_0 como brazo de referencia y Q4_K_M como brazo ligero) generados con `convert_hf_to_gguf.py` y `llama-quantize` desde una revision fijada del modelo upstream, ademas de un contenedor para NPU en formato Q4NX con los ocho kernels ELF especificos de esta geometria. Es relevante ahora porque permite ejecutar un modelo de razonamiento de 1.5B en CPU, Vulkan, ROCm o NPU sin depender de GPU dedicada, con un peso de repositorio de 4,7 GB y licencia MIT.

La propuesta encaja en el nicho de modelos de razonamiento compactos para entornos con recursos limitados: el Q4_K_M sirve para inferencia local en portatiles y mini-PC, mientras que el contenedor NPU apunta a aceleradores integrados. La model card advierte de que la ruta NPU reduce el uso de CPU del host por peticion, pero no acelera la decodificacion frente a la ruta host-GEMM en el driver actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, clase `Qwen2ForCausalLM`) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 4096`) |
| Tipos de cuantizacion | GGUF Q8_0, GGUF Q4_K_M, contenedor NPU Q4NX (tiles Q4_K con tensores de mayor precision conservados a 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0, Q4_K_M), Q4NX (`model.q4nx` + `plan.json`), safetensors en el modelo upstream |
| Modelo base | Zyphra/ZR1-1.5B (revision `6108a26d0cd7`), a su vez derivado de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tokenizador | especiales de estilo DeepSeek (`<｜begin▁of▁sentence｜>`), no ChatML |
| Tamano del repositorio | 4,7 GB |
| Descargas | 403 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con clase de modelado `Qwen2ForCausalLM` y 1.777.088.000 parametros densos. El entrenamiento del modelo upstream, segun la model card, se basa en aprendizaje por refuerzo sobre problemas verificados de codigo y matematicas, lo que explica las etiquetas `reasoning`, `math` y `code` del repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el detalle del pipeline de RLHF/DPO o de las recompensas utilizadas.

El repositorio en si es un artefacto de conversion y empaquetado, no un entrenamiento. La procedencia documentada indica que los GGUF se generaron con `convert_hf_to_gguf.py` en `--outtype bf16` y posterior `llama-quantize` para cada brazo, y que el contenedor NPU se empaqueto con `tools/gguf_to_q4nx.py --dtype8` a partir del brazo Q4_K_M, seguido de `tools/npu_plan.py` para generar `plan.json`. Empaquetar desde el brazo de 4 bits preserva los codigos Q4_K exactos en lugar de recuantizar cada proyeccion. Los kernels NPU se compilaron con mlir-aie `d53582d3e0f` y Peano `llvm_aie 22.0.0.2026091701+773413fb`, en formato ELF completo sin xclbin: cuatro para prefill y cuatro para decodificacion con M=16.

Una innovacion practica destacable es la separacion entre el brazo de referencia (Q8_0) y el brazo ligero (Q4_K_M), con hashes de origen en `SHA256SUMS-SOURCE` para verificar la trazabilidad de cada archivo frente al safetensors upstream. El contenedor Q4NX incluye copias propias de `config.json` y del tokenizador porque el motor las lee desde el directorio del contenedor.

## Capacidades

- Generacion de texto conversacional y de razonamiento paso a paso, con enfasis en problemas de matematicas y codigo por el entrenamiento con RL del modelo upstream.
- Razonamiento multi-paso orientado a tareas de tipo cadena de pensamiento, segun las etiquetas `reasoning` del repositorio.
- Generacion y asistencia de codigo, incluyendo la etiqueta `code` declarada por el autor.
- Resolucion de problemas matematicos verificables, etiqueta `math` declarada por el autor.
- Inferencia en CPU, Vulkan y ROCm a traves de cualquier cargador GGUF (llama.cpp, llama-server, Lemonade).
- Ejecucion en NPU mediante el motor 1bit y el contenedor Q4NX con kernels especificos de la geometria del modelo.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de razonamiento en local para desarrolladores: el Q4_K_M puede cargarse con `llama-server -m ZR1-1.5B-Q4_K_M.gguf -c 4096` en un portatil y usarse como borrador de cadenas de razonamiento antes de pasar la solucion a un modelo mayor, aprovechando el entrenamiento con RL sobre problemas verificados.
- Resolucion de ejercicios de matematicas en entornos educativos sin conexion: al ser un GGUF de 1.5B con licencia MIT, puede desplegarse en aulas o laboratorios con CPU y sin GPU, sirviendo como tutor de paso a paso para problemas de nivel secundaria y primeros cursos universitarios.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse en scripts de revision o generacion de parches mediante el servidor llama.cpp, con la advertencia de que el tokenizador usa especiales de DeepSeek y no ChatML, por lo que hay que enviar prompts crudos o los especiales propios del modelo.
- Prototipado de agentes de codigo en hardware modesto: el bajo requisito de VRAM del Q4_K_M permite levantar varios workers en paralelo en una sola maquina para tareas de generacion y verificacion de fragmentos de codigo.
- Evaluacion de modelos de razonamiento en investigacion: el par Q8_0/Q4_K_M permite medir la degradacion de calidad entre cuantizaciones sobre el mismo modelo base, con hashes de origen para reproducibilidad.
- Despliegue en dispositivos con NPU integrada: el contenedor `npu-container-q8/` con `1bit forward-serve -m npu-container-q8/model.q4nx -p 18110` permite servir el modelo en aceleradores integrados reduciendo el uso de CPU del host por peticion, util en mini-PC y equipos de borde.
- Servicio de chat ligero en entornos air-gapped: con licencia MIT y pesos autodescriptivos (config y tokenizador incluidos), puede empaquetarse en una imagen de contenedor para asistencia interna sin salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco ofrece comparaciones numericas con modelos similares. El unico dato de rendimiento cualitativo es que, en el driver NPU actual, la ruta host-GEMM decodifica mas rapido que la ruta NPU, que a cambio reduce el uso de CPU del host por peticion.

## Requisitos de hardware

- VRAM estimada para inferencia: el Q4_K_M ocupa aproximadamente 1 GB de pesos (1.5B a 4 bits) mas overhead de contexto; el Q8_0 ronda los 2 GB de pesos. Cifras exactas por archivo no disponibles en la informacion proporcionada.
- GPU recomendadas: no se especifican en la informacion disponible; al ser un modelo de 1.5B, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojarlo en Q4_K_M, y con 6-8 GB en Q8_0.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en iGPU con memoria unificada mediante Vulkan.
- Despliegue: llama.cpp y llama-server (`llama-server -m ZR1-1.5B-Q4_K_M.gguf -c 4096`), Lemonade u otro servidor basado en llama.cpp, el motor 1bit en modo GGUF (`1bit serve -m ...`) y el motor 1bit en modo NPU (`1bit forward-serve -m npu-container-q8/model.q4nx -p 18110` o `1bit serve -m npu-container-q8 --device npu`).
- Requisito de motor para la ruta NPU: se necesita un motor cuyo plan declare la familia de decodificacion M=16 (los cuatro archivos `*_m16.elf`); los kernels se localizan en `npu-container-q8/npu/` sin variable de entorno en motores a partir de la build #1133, o indicando el directorio con `--kernels` / `ONEBIT_NPU_KERNELS`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZR1-1.5B-GGUF (este) | 1.777.088.000 | no disponible | MIT | GGUF Q8_0/Q4_K_M, Q4NX | Cuantizaciones de Zyphra/ZR1-1.5B con contenedor NPU |
| Zyphra/ZR1-1.5B | 1.777.088.000 (upstream) | no disponible | MIT | safetensors | Modelo original con RL sobre codigo y matematicas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors | Base declarada del modelo upstream |
| Qwen2-1.5B (familia base) | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors, GGUF | Arquitectura de referencia Qwen2ForCausalLM |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formatos.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de 1.5B entrenado con RL sobre problemas verificados; la model card no documenta tasas de error ni evaluaciones de fidelidad, por lo que no debe usarse como fuente de verdad sin verificacion externa.
- Tokenizador no estandar: usa especiales de estilo DeepSeek (`<｜begin▁of▁sentence｜>`) y no ChatML; enviar plantillas ChatML produce resultados incorrectos. Hay que usar prompts crudos o los especiales propios del modelo.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue, por lo que el comportamiento fuera del ingles (idioma de los datasets tipicos de codigo y matematicas) es incierto.
- Longitud de contexto no documentada: el ejemplo de la model card usa `-c 4096`, pero no se confirma la ventana maxima nativa del modelo upstream.
- Licencia MIT: permite uso comercial y redistribucion, pero se debe mantener la cadena de atribucion (`LICENSE-MIT`, `ATTRIBUTION.md`) hacia Zyphra/ZR1-1.5B y deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B.
- Ruta NPU inmadura: segun la propia model card, en el driver actual la ruta NPU no acelera la decodificacion frente a host-GEMM; su beneficio es reducir el uso de CPU del host. Ademas, requiere un motor con la familia de decodificacion M=16 declarada en el plan, lo que limita la portabilidad.
- Dependencia de un motor propietario de facto para la ruta NPU: el contenedor Q4NX solo se ejecuta con el motor 1bit, no con llama.cpp ni con otros runners GGUF.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de un modelo destilado de DeepSeek-R1, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Trazabilidad: los archivos se generaron desde la revision `6108a26d0cd7`; conviene verificar `SHA256SUMS-SOURCE` antes de desplegar en produccion.
- Popularidad baja: 403 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/ZR1-1.5B-GGUF
- Modelo upstream: https://huggingface.co/Zyphra/ZR1-1.5B
- Modelo base declarado del upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del autor del empaquetado: https://github.com/1bit-MONSTER
- Herramienta de conversion a GGUF (llama.cpp): https://github.com/ggerganov/llama.cpp (referencia generica de `convert_hf_to_gguf.py` y `llama-quantize`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
