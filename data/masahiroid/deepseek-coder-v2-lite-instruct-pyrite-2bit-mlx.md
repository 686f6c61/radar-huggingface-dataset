# masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX es una cuantizacion ultrabaja de 2 bits del modelo DeepSeek-Coder-V2-Lite-Instruct, desarrollada por Masahiro Nakatsugawa (usuario masahiroid) dentro del proyecto Project Pyrite. El modelo base, creado por DeepSeek, es un transformer MoE de 15.700 millones de parametros totales con 2.360 millones activos, 27 capas y atencion Multi-Head Latent Attention (MLA), especializado en generacion de codigo y razonamiento. Esta version comprime los aproximadamente 31,4 GB en BF16 hasta 4,88 GiB (5.241.265.152 bytes), lo que permite ejecutarlo en cualquier Mac con Apple Silicon y 16 GB de memoria unificada.

La relevancia de esta ficha radica en su tecnica de cuantizacion: en lugar de aplicar 2 bits uniformes, Project Pyrite usa una asignacion de precision guiada por sensibilidad, midiendo la importancia de cada capa mediante activaciones. El resultado mantiene exactamente el mismo presupuesto de bytes que una cuantizacion uniforme de 2 bits, pero mejora la perplejidad de validacion de 11,1105 a 10,9707 y la concordancia top-1 de tokens del 68,82% al 70,00%. Las capas `down_proj` mas sensibles (14 a 26) suben a 3 bits, compensado ensanchando 52 proyecciones `gate/up` de MoE de grupo 64 a grupo 128.

El modelo esta pensado para inferencia local en Apple Silicon mediante MLX, con soporte nativo de Metal y sin kernels personalizados. Se distribuye bajo licencia DeepSeek y soporta ingles, chino, japones y codigo. Es una opcion practica para desarrolladores que quieran un modelo de codigo MoE de 16B en portatiles Mac sin conexion a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA); 27 capas (1 MLP densa + 26 capas MoE con 64 expertos enrutados + 2 compartidos) |
| Parametros totales | 15.876.353.536 (15,7B) |
| Parametros activos | 2.360 millones (2,36B) |
| Longitud de contexto | no disponible (la model card menciona KV cache para contexto de 32k+ tokens, pero no se especifica la ventana maxima oficial) |
| Tipos de cuantizacion | 2-bit mixta (afin nativa MLX); `down_proj` de capas 14-26 en 3-bit; 52 proyecciones `gate/up` de MoE en grupo 128; `lm_head` en 4-bit (g64); matrices de enrutamiento y normalizacion sin cuantizar |
| Idiomas soportados | Ingles, chino, japones y codigo |
| Licencia | deepseek-license (licencia DeepSeek) |
| Formato de pesos | safetensors (MLX), repo de 5,2 GB |
| Tamano en disco | 4,88 GiB (5.241.265.152 bytes) |
| Libreria | mlx-lm |
| Hardware objetivo | Apple Silicon (M1/M2/M3/M4) con 16 GB o mas de memoria unificada |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Coder-V2-Lite-Instruct es un transformer de mezcla de expertos (MoE) con 27 capas: una capa con MLP densa y 26 capas MoE, cada una con 64 expertos enrutados y 2 expertos compartidos. Emplea Multi-Head Latent Attention (MLA), una variante de atencion que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache, lo que resulta especialmente util en contextos largos. El modelo original fue entrenado por DeepSeek sobre datos de codigo y texto multilingue, con etapas de ajuste supervisado e instruccion; no se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de los detalles de RLHF/DPO.

Esta version concreta no reentrena el modelo: aplica una cuantizacion post-entrenamiento guiada por sensibilidad. La tecnica, denominada Project Pyrite, mide la sensibilidad de cada capa mediante estadisticas de activacion y asigna precision de forma no uniforme dentro de un presupuesto de bytes fijo. En concreto, las capas `down_proj` 14 a 26 se elevan a 3 bits y se compensa reduciendo la granularidad de 52 proyecciones `gate/up` de MoE de grupo 64 a grupo 128. Las matrices de enrutamiento (`gate.weight`) y las capas de normalizacion se mantienen en precision sin cuantizar para preservar el enrutamiento estable de expertos, y el `lm_head` se cuantiza a 4 bits para mantener fidelidad en la decodificacion del vocabulario. La implementacion usa `mlx.nn.QuantizedLinear` nativo, sin kernels personalizados, garantizando compatibilidad total con la aceleracion Metal de Apple Silicon.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Rust, y otros), incluyendo implementaciones completas y funciones de alto rendimiento.
- Razonamiento sobre codigo y explicacion de logica de programacion.
- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Capacidades multilingues en ingles, chino y japones, ademas de codigo.
- Soporte de conversacion multi-turno mediante formato de mensajes.
- Inferencia local en Apple Silicon con MLX, sin dependencia de servicios en la nube.
- Uso de contexto largo en KV cache (la model card menciona 32k+ tokens) gracias al bajo consumo de memoria de la cuantizacion.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o vision; estas capacidades del modelo base no se confirman para esta cuantizacion.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo se carga con `mlx_lm` en un Mac de 16 GB y permite autocompletar y generar funciones completas (por ejemplo, una implementacion de buffer circular lock-free en Rust) sin enviar codigo a servicios externos.
- Generacion de codigo en portatiles sin GPU dedicada: al ocupar solo 4,88 GiB, deja mas de 10 GiB de memoria unificada libre para el KV cache, lo que permite sesiones de generacion con contexto de 32k+ tokens en un M1/M2/M3/M4.
- Prototipado rapido de scripts y utilidades: la CLI `mlx_lm.generate` permite lanzar peticiones puntuales de generacion de codigo desde terminal, util para pruebas y experimentos.
- Educacion y aprendizaje de programacion: el modelo puede explicar y generar codigo en ingles, chino y japones, lo que lo hace util en entornos formativos multilingues.
- Automatizacion de tareas de refactorizacion y generacion de boilerplate en pipelines locales, integrado via la API de Python de `mlx-lm` en scripts propios.
- Evaluacion e investigacion en cuantizacion: sirve como referencia practica del metodo Project Pyrite para estudiar el impacto de la cuantizacion 2-bit mixta en modelos MoE, con DOI y preprint citables.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local sobre Apple Silicon, es adecuado para procesar codigo propietario sin salida de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre conjuntos held-out multi-dominio (codigo, ingles y japones) con tokenizacion identica:

| Modelo / configuracion | Tamano (bytes) | RAM (GiB) | PPL validacion multi-dominio | PPL codigo | Concordancia top-1 |
|---|---|---|---|---|---|
| BF16 teacher (referencia) | ~31.400.000.000 | ~31,4 | 7,0371 | 1,5854 | 100,0% |
| Baseline uniforme 2-bit (g64) | 5.241.265.152 | 4,8813 | 11,1105 | 1,8262 | 68,82% |
| Pyrite 2-bit (`pyrite_down13`) | 5.241.265.152 | 4,8813 | 10,9707 | 1,9046 | 70,00% |

La mejora se logra con un delta de bytes de exactamente 0 respecto al baseline uniforme de 2 bits. No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K para esta cuantizacion.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4,88 GiB para los pesos; la model card indica que quedan mas de 10 GiB libres en un Mac de 16 GB para KV cache de 32k+ tokens.
- Hardware recomendado: cualquier Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada.
- Cabe en GPU de consumo: si, en Macs con Apple Silicon de 16 GB o mas; no esta pensado para GPU NVIDIA/AMD, ya que usa MLX y Metal.
- Opciones de despliegue: `mlx-lm` (CLI y API de Python); existe una version GGUF del mismo autor para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX | 15,7B totales / 2,36B activos | no disponible (KV cache 32k+ mencionado) | 2-bit mixta MLX, 4,88 GiB | deepseek-license | Hugging Face, MLX |
| DeepSeek-Coder-V2-Lite-Instruct (BF16 original) | 15,7B totales / 2,36B activos | no disponible | BF16, ~31,4 GB | deepseek-license | Hugging Face |
| Baseline uniforme 2-bit (g64) del mismo modelo | 15,7B totales / 2,36B activos | no disponible | 2-bit uniforme, 5.241.265.152 bytes | deepseek-license | Referencia en la model card |
| Version GGUF Pyrite 2-bit del mismo autor | 15,7B totales / 2,36B activos | no disponible | 2-bit GGUF | deepseek-license | Hugging Face (llama.cpp/Ollama/LM Studio) |

La comparativa con otros modelos de codigo de tamano similar (por ejemplo, CodeLlama o Qwen-Coder) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la calidad respecto al modelo BF16: la perplejidad de validacion sube de 7,0371 a 10,9707 y la concordancia top-1 baja al 70,00%, por lo que puede producir codigo menos fiable que el original.
- La perplejidad en codigo empeora ligeramente respecto al baseline uniforme de 2 bits (1,9046 frente a 1,8262), aunque la perplejidad multi-dominio y la concordancia top-1 mejoran.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion ultrabaja; se recomienda validar el codigo generado antes de usarlo en produccion.
- Solo se ha validado en Apple Silicon con MLX; no es directamente usable en GPU NVIDIA/AMD ni en entornos CUDA sin convertir a otro formato.
- La licencia deepseek-license impone condiciones para uso comercial; es necesario revisar sus terminos antes de desplegar el modelo en productos.
- Los idiomas documentados son ingles, chino, japones y codigo; el rendimiento en castellano no esta verificado.
- No se documentan capacidades de tool calling, agentes o vision para esta cuantizacion; no deben asumirse.
- El modelo tiene pocas descargas (852) y cero likes en el momento de la ficha, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Version GGUF: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF
- Preprint (PDF): https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- DOI del informe tecnico: https://doi.org/10.5281/zenodo.23786705
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
