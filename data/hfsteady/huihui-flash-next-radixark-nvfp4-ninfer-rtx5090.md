# hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-NInfer-RTX5090

## Resumen

Huihui-Flash-Next-RadixArk-NVFP4-NInfer-RTX5090 es una conversión experimental del checkpoint NVFP4 de edp1096 (familia Huihui/RadixArk, derivada de Qwen 3.8 Flash-Next) al formato propietario NInfer, empaquetada junto con un runtime CUDA 13.3/GCC 15 específico para RTX 5090. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución de pesos ya cuantizados a NVFP4 (formato de coma flotante de 4 bits de NVIDIA) con escalas de activación heredadas, más un conjunto de modificaciones "Huihui" recuperadas vía GGUF. El autor del artefacto es el usuario hfsteady, y el modelo base es `edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4`.

La relevancia es acotada y muy técnica: demuestra un pipeline de conversión a NInfer para ejecutar un modelo de gran tamaño en una única GPU consumer de gama alta (RTX 5090), con offload a RAM del host. El repositorio ocupa 127,1 GB, lo que sugiere un modelo denso o MoE de gran escala cuantizado a 4 bits, aunque el número exacto de parámetros no se declara en la model card. La receta se denomina `qwen3_8_flash_next_nvfp4` e incluye componentes de texto y MTP (multi-token prediction), omitiendo la visión.

Se trata de un artefacto de investigación con verificación parcial: el smoke test se limita a una generación exacta de respuesta corta en una RTX 5090 con driver CUDA 13.2, y el propio autor advierte que no se han validado calidad amplia, contexto largo, MTP ni tool-use estilo Hermes. No hay benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.8 Flash-Next; componentes texto + MTP, visión omitida) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la CLI de ejemplo usa `--max-context 4096`) |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA) con escalas de activación heredadas; componentes mixtos en precisión mixta; KV cache en FP8 (`--kv-dtype fp8`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como `other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | NInfer propietario (`huihui-flash-next.ninfer*`, 4 partes) + runtime `ninfer-runtime-cu133-gcc15-001.tar.gz` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card indica que se trata de una conversión NInfer del checkpoint NVFP4 de edp1096, con receta `qwen3_8_flash_next_nvfp4`, que incluye componentes de texto y MTP y omite la visión. Los códigos y escalas de los expertos principales se importan del checkpoint fuente, mientras que otros componentes usan precisión mixta. Las escalas de activación son heredadas, no recalculadas: explícitamente "no es una calibración nueva del Huihui BF16 original ni del Huihui v2 oficial".

No hay datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de atención. El único elemento técnico reseñable es la inclusión del componente MTP (multi-token prediction), aunque su funcionamiento no se ha cualificado en las pruebas realizadas. El runner/converter es `giveen/ninfer-ext` en el commit `b6886f67700bc9e3e4937f826edc18d8d7b84f43`, y la revisión fuente es `016905fbd6ac5c584799007a524827e2486a0711`.

## Capacidades

- Generación de texto autoregresiva mediante CLI y servidor NInfer (validada solo con un prompt de respuesta exacta).
- Modo "no-thinking" (`--no-thinking`) y decodificación greedy (`--greedy`) soportados por la CLI.
- Componente MTP (multi-token prediction) presente en la receta, aunque no cualificado en las pruebas.
- Tool calling / function calling: no establecido; el autor indica que la calificación de tool-use estilo Hermes no está realizada.
- Capacidades de agente y razonamiento multi-paso: no establecidas.
- Capacidades multilingües: no disponibles.
- Visión: omitida explícitamente en la conversión.
- Contexto largo: no establecido; el ejemplo usa 4096 tokens.

## Casos de uso

- Evaluación de pipelines de cuantización NVFP4: el artefacto sirve para reproducir y auditar la conversión de un checkpoint NVFP4 a formato NInfer, comparando pesos y escalas frente al modelo base.
- Pruebas de despliegue en GPU consumer única: permite validar si un modelo de gran escala cuantizado a 4 bits puede ejecutarse en una RTX 5090 con offload a RAM del host, midiendo latencia y consumo.
- Investigación sobre decodificación con MTP: el componente multi-token prediction incluido permite experimentar con decodificación especulativa, aunque requiere cualificación previa por parte del usuario.
- Benchmarking de runtime propietario: útil para comparar NInfer frente a vLLM, llama.cpp o TGI en términos de throughput y huella de memoria en el mismo hardware.
- Reproducibilidad de artefactos comunitarios: el manifiesto `converted-model-manifest.json` y `SHA256SUMS` permiten verificar integridad de pesos y runtime en entornos de investigación.
- Servicio local de inferencia para pruebas internas: el autor recomienda servir solo en localhost con autenticación vía SSH, adecuado para entornos de laboratorio aislados, no para producción pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es un smoke test: sondas nativas y una generación CLI mínima de respuesta exacta pasaron en una RTX 5090 con driver que anuncia CUDA 13.2. El autor advierte que esto no demuestra compatibilidad con todos los hosts CUDA 13.2, ni restauración en pods nuevos, ni calidad amplia, ni contexto largo, ni MTP, ni tool-use.

## Requisitos de hardware

- VRAM: no disponible de forma explícita; el repositorio ocupa 127,1 GB en total (4 partes de pesos + runtime), por lo que se requiere offload sustancial a RAM del host. El autor indica "RTX5090 y sustancial RAM/offload de host (no solo GPU)".
- GPU objetivo: NVIDIA RTX 5090 (arquitectura Blackwell, soporte NVFP4). No se declara compatibilidad con A100, H100 ni otras GPU.
- GPU consumer: sí, RTX 5090, siempre con offload a RAM del host.
- Sistema operativo: x86_64 Ubuntu 24.04, glibc >= 2.39.
- Toolchain: runtime compilado con CUDA 13.3 y GCC 15; driver NVIDIA del host y glibc base excluidos del archivo.
- Despliegue: runtime NInfer propietario incluido en el tarball (`runtime/run`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- CLI de ejemplo: `--max-context 4096 --max-new 32 --kv-dtype fp8 --prefill-chunk 256 --expert-cache auto --ngram-residency mapped --no-thinking --greedy`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Flash-Next-RadixArk-NVFP4-NInfer-RTX5090 | no disponible | no disponible | NVFP4 + mixta | qwen-community-1.0 | HuggingFace, runtime propietario |
| edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4 (base) | no disponible | no disponible | NVFP4 | qwen-community-1.0 | HuggingFace |
| Qwen 3.8 Flash-Next (familia original) | no disponible | no disponible | BF16 y otras | qwen-community-1.0 | HuggingFace |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo califica como conversión NInfer experimental, no una recalibración oficial.
- Verificación incompleta: la lectura completa de los pesos descargados no se ha realizado; solo se verificaron tamaños y SHA256 LFS vía metadatos anónimos de HuggingFace.
- Calidad no validada: no se han establecido calidad amplia, contexto largo, MTP ni tool-use estilo Hermes.
- Compatibilidad de hardware restringida: objetivo x86_64 Ubuntu 24.04, glibc >= 2.39, RTX 5090 y offload a RAM; no se garantiza funcionamiento en otros hosts CUDA 13.2.
- Formato propietario: los pesos NInfer requieren el runtime incluido; no son compatibles con vLLM, llama.cpp, Ollama ni TGI.
- Visión omitida: el componente visual no está incluido en la conversión.
- Sesgos y alucinación: no documentados en la información disponible; el modelo base es una variante "abliterated", lo que implica ausencia de mecanismos de rechazo y mayor riesgo de contenido no filtrado.
- Licencia: qwen-community-1.0, con restricciones de uso comercial que deben consultarse en el enlace de licencia; el campo `license` figura como `other`.
- Seguridad de despliegue: el autor recomienda servir solo en localhost con autenticación SSH, nunca en un endpoint público.
- Idiomas: no declarados; no se puede garantizar cobertura multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-NInfer-RTX5090
- Modelo base: https://huggingface.co/edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4
- Licencia (referencia del autor base): https://huggingface.co/edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4/blob/016905fbd6ac5c584799007a524827e2486a0711/LICENSE
- Runner/converter: `giveen/ninfer-ext` en commit `b6886f67700bc9e3e4937f826edc18d8d7b84f43` (no se proporciona URL directa)
