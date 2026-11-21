# andynoodles/Edge0-145B-NVFP4-vLLM

## Resumen

Edge0-145B-NVFP4-vLLM es una conversión de formato del modelo Edge0-145B-NVFP4, publicada por el desarrollador independiente Andy Chen (andynoodles) bajo el identificador `andynoodles/Edge0-145B-NVFP4-vLLM`. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo conjunto de pesos de Edge0-145B reorganizado para que el motor de inferencia vLLM pueda cargarlo mediante el plugin `edge0_vllm`, desarrollado por el mismo autor. El modelo original lo produce Edge0 y está construido sobre Qwen3.8-Flash-Next de Qwen.

La arquitectura es un MoE latente (`Edge0ForCausalLM`) con 48 capas y 512 expertos enrutados por capa, lo que suma 24.576 expertos en total. El checkpoint safetensors declara 57.764.125.312 parámetros reales, aunque el nombre comercial del modelo hace referencia a "145B". Los expertos enrutados se mantienen en NVFP4 tal como se distribuyeron, los pesos densos permanecen en Q8_0 y algunos tensores concretos (embeddings, LM head y proyecciones q/k/v de las 12 capas QSA) se expanden a BF16.

Su relevancia radica en que demuestra una técnica de despliegue poco habitual: servir un MoE de gran tamaño en una única GPU de consumo (RTX 5090 de 32 GB) combinando VRAM para pesos densos y expertos "calientes", RAM del host fijada (pinned) para los expertos "fríos" y lectura directa desde NVMe para la tabla PLE de 51,2 GB. Es una pieza estrictamente dependiente del plugin: ni vLLM estándar ni transformers pueden cargarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Edge0ForCausalLM, MoE latente (latent MoE) con 48 capas y 512 expertos enrutados por capa |
| Parametros totales | 57.764.125.312 (dato real de safetensors); el nombre comercial indica 145B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, kernel Marlin W4A16), Q8_0 (pesos densos), BF16 (embeddings, LM head, q/k/v de 12 capas QSA), Q2_0 re-cuantizado a NVFP4 en el MTP draft layer |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (license_name), declarada como `other` en el Hub |
| Formato de pesos | safetensors (checkpoint estilo Hugging Face); el repo incluye tambien GGUF auxiliares (`ple-fp8.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos de tipo latente. Cada una de las 48 capas contiene 512 expertos enrutados, lo que da 24.576 expertos en el conjunto del modelo. El pool completo de expertos ocupa 44,3 GiB. La arquitectura incorpora 12 capas QSA (con proyecciones q/k/v que el plugin necesita en BF16) y una capa MTP (multi-token prediction) que actúa como borrador especulativo; sus expertos, originalmente en Q2_0, se re-cuantizan a NVFP4 con un error relativo medio del 2,65 %, lo que afecta únicamente a la tasa de aceptación de tokens borrador, nunca a la salida verificada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo original está construido sobre Qwen3.8-Flash-Next, pero la model card de esta conversión no detalla el proceso de entrenamiento. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el despliegue: repackaging sin pérdida de los expertos NVFP4 desde el formato ggml `block_nvfp4` al layout ModelOpt NVFP4 para el kernel Marlin W4A16 de vLLM, copia byte a byte de los bloques Q8_0, reordenación de filas y bloques donde los módulos de vLLM lo exigen (GDN value heads, latent up-projection) y decodificación especulativa opcional mediante el drafter DFlash2.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones heredados del modelo base Edge0-145B-NVFP4.
- Decodificación especulativa mediante la capa MTP integrada y, opcionalmente, el drafter DFlash2 de `incoai/Qwen3.8-Flash-Next-DFlash2`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el Hub no declara idiomas.
- Visión: no incluida. El encoder visual (`mmproj-BF16.gguf`) queda fuera de esta conversión y el plugin sirve únicamente texto.
- Audio: no disponible.

## Casos de uso

- Despliegue de un MoE de gran tamaño en hardware de consumo: el plugin reparte los pesos entre 32 GB de VRAM, 28-32 GiB de RAM fijada y NVMe, lo que permite servir Edge0-145B en una sola RTX 5090 sin clúster multi-GPU.
- Evaluación e investigación de arquitecturas MoE latentes: al conservar los expertos NVFP4 bit a bit, sirve para estudiar el comportamiento del enrutamiento y de los kernels Marlin W4A16 sobre pesos reales de producción.
- Generación de texto conversacional en local: con el preset `single` y el drafter DFlash2 se obtiene decodificación especulativa en un único flujo, adecuada para asistentes personales o prototipos con requisitos de privacidad.
- Procesamiento por lotes de gran volumen: el preset por defecto está pensado para muchas peticiones concurrentes, con un conjunto "caliente" de 12,8 GiB (unos 7.100 de 24.576 expertos) adaptado en tiempo de ejecución a partir de un perfil de enrutamiento.
- Experimentación con cuantización híbrida: la combinación NVFP4 + Q8_0 + BF16 en un mismo checkpoint permite medir el impacto de cada formato en latencia y calidad dentro de un mismo modelo.
- Reproducción de pipelines de conversión: `CHANGES.md` documenta cada transformación, lo que lo convierte en referencia para quien necesite portar checkpoints GGUF a vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento declarados son operativos: el servidor arranca en 3-4 minutos, el conjunto "caliente" de expertos ocupa 12,8 GiB en el preset de throughput y 16,2 GiB en el de un solo flujo, y el pool de expertos completo son 44,3 GiB. No se indican tokens por segundo ni latencia por token.

## Requisitos de hardware

- VRAM: 32 GB como mínimo práctico. El plugin reserva para pesos densos (Q8_0, unos 9-10 GiB con la LM head en BF16), caché KV, estado recurrente y expertos "calientes" (12,8 GiB en preset de throughput, 16,2 GiB en preset single).
- RAM del host: 60 GiB DDR5 en la configuración probada; se recomienda 64 GB o más, ya que solo los expertos "fríos" ocupan 28-32 GiB de memoria fijada. Es necesario `memlock` ilimitado. El embedding de tokens en BF16 (1,2 GiB) también reside en RAM.
- Almacenamiento: unos 111,62 GB para el repositorio, en SSD NVMe local rápido. La tabla PLE (`ple-fp8.gguf`, 51.200.246.112 bytes) nunca se carga en memoria y se lee en cada paso a través de la caché de páginas; un disco de red o mecánico penaliza cada paso de decodificación.
- GPU probada: NVIDIA RTX 5090 32 GB (sm_120), PCIe Gen5 x16. No hay datos de otros modelos de GPU (A100, H100, RTX 4090) en la información disponible.
- CPU: AMD Ryzen 9 9950X con AVX-512 en la máquina de referencia, usado por la ruta de expertos "fríos" en CPU.
- Software: imagen NGC `nvcr.io/nvidia/vllm:26.11-py3` (vLLM 0.33) más el plugin `edge0_vllm`. No funciona con vLLM estándar ni con transformers.
- Opciones de despliegue: exclusivamente el plugin `edge0-vllm` (https://github.com/andynoodles/edge0-vllm), servido en el puerto 8125 mediante `serve.sh`. No hay soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Edge0-145B-NVFP4-vLLM (esta ficha) | 57.764.125.312 reales | no disponible | NVFP4 + Q8_0 + BF16 | edge0-community-model-1.0 | Solo plugin edge0-vllm sobre vLLM |
| Edge0/Edge0-145B-NVFP4 (upstream) | no disponible en la informacion | no disponible | NVFP4 | edge0-community-model-1.0 | Strata, edge0-infer, Edge0 Chat |
| Qwen3.8-Flash-Next (modelo base de Qwen) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dependencia total del plugin: vLLM estándar rechaza el checkpoint porque la arquitectura `Edge0ForCausalLM` y el método de cuantización `edge0` solo existen en `edge0_vllm`. transformers tampoco puede ejecutarlo.
- No es un modelo nuevo: la calidad es exactamente la de Edge0-145B-NVFP4. Cualquier limitación del original se hereda sin cambios.
- Conversión comunitaria no avalada: no está revisada ni respaldada por Edge0, Qwen, vLLM ni Strata.
- Sin visión: el encoder visual queda excluido y el plugin sirve solo texto.
- Idiomas no declarados: el Hub no especifica cobertura lingüística, lo que impide garantizar calidad multilingüe.
- Licencia restrictiva: `edge0-community-model-1.0` con `license_name: other`; es imprescindible revisar `LICENSE` antes de cualquier uso comercial.
- Requisito de NVMe local: colocar la tabla PLE en almacenamiento de red o mecánico degrada cada paso de decodificación.
- Configuración de memoria frágil: requiere `memlock` ilimitado y, en contenedores, montar también el directorio de la tabla PLE.
- Un solo equipo validado: las pruebas se limitaron a RTX 5090 + Ryzen 9 9950X + 60 GiB DDR5; no hay garantías en otras configuraciones.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andynoodles/Edge0-145B-NVFP4-vLLM
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Revisión concreta del modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4/tree/cf4c3d958db1edd15bd9bcfe3507327dd7b1008c
- Plugin vLLM: https://github.com/andynoodles/edge0-vllm
- Drafter opcional DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Registro de cambios de la conversión: `CHANGES.md` en el repositorio del modelo
- Licencia: `LICENSE` en el repositorio del modelo
