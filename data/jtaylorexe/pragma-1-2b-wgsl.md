# jtaylorexe/Pragma-1-2B-WGSL

## Resumen

Pragma-1-2B-WGSL (identificador interno `EXP-102` RC1) es un paquete de pesos cuantizados en formato WGSL `q4_block32_min_max`, pensado para ejecutar el modelo Pragma-1-2B directamente en el navegador mediante WebGPU. No se distribuye como un modelo en safetensors o GGUF convencional, sino como un bundle de slabs binarios (`slab0`, `slab1`, `slab2` y `aux_params.bin`) acompanado de un `manifest.json` con el identificador del modelo y una raiz de Merkle para verificacion de integridad.

El modelo subyacente es un fine-tune de `Qwen/Qwen3.5-2B`, de licencia Apache-2.0, con arquitectura hibrida de 24 capas: 18 capas de atencion lineal Gated DeltaNet y 6 capas de atencion completa. El tamano de representacion es de 2048 dimensiones, con `intermediate_size` de 6144 y un vocabulario de 81920 tokens con embeddings atados.

Su relevancia radica en el nicho: empaquetar un modelo de ~2B en unos 920 MiB de pesos q4 para inferencia local en el navegador sin dependencia de servidores. El autor es jtaylorexe, el repositorio tiene 1,0 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de un artefacto experimental de publicacion reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas Gated DeltaNet (linear attention) + 6 capas full attention |
| Parametros totales | no disponible (modelo base Qwen3.5-2B, ~2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4_block32_min_max (bloques de 32 con minimo/maximo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Bundle WGSL propietario: slab0, slab1, slab2 y aux_params.bin (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3.5-2B: 24 capas de transformer con `hidden_size = 2048`, `intermediate_size = 6144` y `vocab_size = 81920` con `tie_word_embeddings = true`. La innovacion estructural es la combinacion de 18 capas de atencion lineal Gated DeltaNet con 6 capas de atencion completa, un esquema hibrido que reduce el coste computacional y de memoria del contexto largo frente a un transformer de atencion densa en todas las capas.

No se dispone de informacion sobre el proceso de entrenamiento del fine-tune Pragma-1-2B (numero de tokens, composicion del dataset, uso de RLHF o DPO). El repositorio unicamente documenta el empaquetado: cuantizacion q4 en bloques de 32 con escala min/max, reparto de pesos en tres slabs y un fichero de parametros auxiliares, con un total de 965.000.576 bytes (920,30 MiB) y raiz de Merkle `29ec0e686fb02b8c876fbc29e5613e3b50c4d49e8cd02420eea14a92773e4cec` para verificar la integridad del bundle.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-2B; no se documentan capacidades adicionales especificas del fine-tune.
- Inferencia en navegador mediante WebGPU con kernels WGSL, sin backend de servidor.
- Verificacion de integridad del bundle mediante raiz de Merkle declarada en el manifiesto.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Demostraciones de IA en navegador: el bundle esta disenado para cargarse via WebGPU y ejecutar el modelo en la propia pestana, lo que permite demos interactivas sin coste de servidor ni envio de datos a terceros.
- Procesamiento de texto sensible en local: al ejecutarse en el cliente, los datos del usuario no salen del dispositivo, adecuado para prototipos de resumen o reescritura sobre documentos privados.
- Aplicaciones web offline-first: con los 920 MiB de pesos cacheados, la inferencia puede funcionar sin conexion una vez descargado el bundle, util en entornos con conectividad intermitente.
- Educacion y experimentacion con WebGPU: sirve como referencia tecnica para estudiar la implementacion de atencion lineal Gated DeltaNet y cuantizacion q4 en WGSL.
- Prototipado rapido de asistentes embebidos: un modelo de ~2B en q4 permite iterar sobre interfaces conversacionales sin aprovisionar GPU en la nube.
- Verificacion de cadena de suministro de modelos: la raiz de Merkle del manifiesto permite validar que los pesos servidos no han sido alterados antes de ejecutarlos en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria: el bundle de pesos ocupa 920,30 MiB; el pico de memoria durante la inferencia depende de la implementacion WebGPU y de la longitud de contexto, dato no disponible.
- GPU: requiere un navegador con soporte WebGPU (Chrome/Edge en versiones recientes, Safari en macOS). No se especifican modelos de GPU validados.
- GPU de consumo: por tamano, es plausible en GPUs integradas y dedicadas de gama media con WebGPU, pero no hay lista de compatibilidad publicada.
- Despliegue: exclusivamente via runtime WebGPU/WGSL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos no es estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Pragma-1-2B-WGSL | ~2B (base Qwen3.5-2B) | no disponible | Bundle WGSL q4 | Apache-2.0 | Si, via WebGPU |
| Qwen/Qwen3.5-2B | ~2B | no disponible | safetensors | Apache-2.0 | No de forma nativa |
| Alternativas GGUF de ~2B | ~2B | variable | GGUF | variable | Solo con runtimes WASM especificos |

La comparativa se limita al modelo base y a formatos de cuantizacion estandar; no se dispone de datos de rendimiento para contrastar con otras alternativas.

## Limitaciones y advertencias

- Formato no estandar: los slabs WGSL no son compatibles con herramientas convencionales (transformers, vLLM, llama.cpp); el uso queda ligado a un runtime WebGPU especifico que no se documenta en el repositorio.
- Sin datos de evaluacion: no hay benchmarks, por lo que se desconoce la degradacion introducida por la cuantizacion q4 respecto al modelo base.
- Soporte de navegador limitado a WebGPU, lo que excluye navegadores y versiones sin esta API.
- Modelo experimental (RC1) con cero descargas y sin validacion de la comunidad; riesgo de errores en el empaquetado o en el manifiesto.
- Sesgos y riesgo de alucinacion heredados del modelo base, no documentados en esta ficha.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre el fine-tune y el formato de distribucion hace recomendable una verificacion propia antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jtaylorexe/Pragma-1-2B-WGSL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
