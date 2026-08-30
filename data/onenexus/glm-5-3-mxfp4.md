# OneNexus/GLM-5.3-MXFP4

## Resumen

GLM-5.3-MXFP4 es una cuantizacion en formato MXFP4 (OCP E2M1) del modelo GLM-5.3 de Z.ai, realizada por OneNexus. El modelo original es un MoE (Mixture of Experts) con atencion dispersa (DSA, DeepSeek Sparse Attention) de 753.000 millones de parametros totales y 40.000 millones activos por token, con una ventana de contexto de un millon de tokens. Esta version cuantizada reduce el peso del checkpoint a 407,92 GiB, un 42,04% menos que el FP8 oficial y un 70,93% menos que el BF16 de origen, manteniendo la arquitectura completa `GlmMoeDsaForCausalLM`.

La relevancia de este modelo radica en que permite desplegar GLM-5.3, uno de los modelos abiertos mas capaces para codigo y tareas agente de largo horizonte, en hardware AMD Instinct MI350 con el runtime SGLang ROCm, sin necesidad de modificar el codigo de inferencia. La cuantizacion se ha realizado con AMD Quark y ha sido validada como reemplazo directo de los pesos en la receta de servido estandar, lo que la convierte en una opcion practica para equipos que buscan reducir requisitos de memoria sin sacrificar la arquitectura original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (MoE con DSA, atencion dispersa) |
| Parametros totales | 389.526.497.280 (checkpoint cuantizado); el modelo base BF16 tiene 753.000.000.000 |
| Parametros activos | 40.000.000.000 (por token) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | MXFP4 (E2M1) con escalas E8M0, bloque 1x32; capas de atencion, router, MLP denso y lm_head en BF16 |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | glm-5.3 (licencia propia de Z.ai, no MIT) |
| Formato de pesos | safetensors, formato Quark MXFP4 (pares peso/escala) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con atencion dispersa (DSA), disenado para tareas de codigo y razonamiento de largo horizonte. Usa el mismo modelo base que GLM-5.2, con todas las mejoras provenientes de post-entrenamiento. La cuantizacion MXFP4 de OneNexus aplica AMD Quark sobre los pesos de los expertos enrutados, con escalas estaticas de bloque 1x32 y cuantizacion dinamica de activaciones en los expertos. Las proyecciones de atencion y DSA, los router gates, las proyecciones del MLP denso/compartido, el `lm_head` y la capa MTP (capa 78) permanecen en BF16.

Una innovacion destacada es el refinamiento SmoothQuant plegado aplicado a siete expertos enrutados de la capa 6 (IDs 16, 96, 103, 159, 195, 208 y 253), que preserva el almacenamiento MXFP4 sin requerir operaciones personalizadas en runtime. Solo 28 tensores de cuatro shards cambian respecto a la conversion Quark inicial, manteniendo intactos los 115.874 tensores restantes. El checkpoint conserva el tipo de modelo `glm_moe_dsa` y la convencion de nombres de [amd/GLM-5.2-MXFP4](https://huggingface.co/amd/GLM-5.2-MXFP4), lo que garantiza compatibilidad con el cargador estandar de SGLang.

## Capacidades

- Generacion de texto y razonamiento complejo, con soporte de modo de razonamiento explicito (parser `glm45`).
- Codigo de alta calidad: el modelo base esta posicionado como el mejor modelo de codigo de pesos abiertos, con una mejora del 50% sobre GLM-5.2 en tareas de codigo segun Z.ai.
- Tool calling y function calling: compatible con el parser `glm47` de SGLang.
- Capacidades agente de largo horizonte: disenado para tareas que requieren multiples pasos y contexto extenso (1M tokens).
- Multilingue: ingles y chino.
- Soporte de vision y multimodalidad via transporte de caracteristicas `mm-feature-transport cpu` en la receta de despliegue, aunque el modelo base es principalmente textual.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en IDE o pipelines de CI/CD para generar, revisar y refactorizar codigo, aprovechando su ventana de 1M tokens para analizar repositorios completos.
- Agentes autonomos de largo horizonte: gracias a su contexto de 1M tokens y capacidades de razonamiento, puede gestionar tareas complejas como planificacion de proyectos, investigacion web multi-paso o automatizacion de procesos de negocio.
- Atencion al cliente multilingue: con soporte de ingles y chino, puede mantener conversaciones multi-turno extensas, recordando informacion de sesiones anteriores gracias al contexto largo.
- Analisis de documentos extensos: procesamiento de manuales, contratos o codigo fuente de gran tamano en una sola pasada, sin necesidad de dividir el texto.
- Generacion de documentacion tecnica: a partir de codigo o especificaciones, el modelo puede redactar documentacion coherente y detallada.
- Despliegue en infraestructura AMD: adecuado para organizaciones que ya usan GPUs AMD Instinct MI350 y quieren servir un modelo de primer nivel sin depender de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion con `sgl-eval` comparando el checkpoint MXFP4 con el oracle BF16, pero no se incluyen cifras concretas en el texto extraido.

## Requisitos de hardware

- Validado en 4x AMD Instinct MI350 (gfx950) con 192 GB de VRAM cada una (estimado), usando TP4/EP4.
- Tamaño del checkpoint: 407,92 GiB, por lo que requiere al menos 408 GB de VRAM para cargar los pesos, mas espacio para KV cache y activaciones.
- No se ha validado en GPUs NVIDIA; la receta oficial usa el runtime SGLang ROCm con imagen `lmsysorg/sglang-rocm:v0.5.16-rocm720-mi35x-20260728`.
- Opciones de despliegue: SGLang (validado), con soporte de EAGLE MTP (decodificacion especulativa), TileLang DSA, AITER MXFP4 MoE, KV cache FP8 E4M3 y HiCache.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-MXFP4 (OneNexus) | 389,5B (cuantizado) / 753B (base) | 40B | 1M | MXFP4 | glm-5.3 |
| GLM-5.3 BF16 (Z.ai) | 753B | 40B | 1M | BF16 | MIT (segun OpenLM) |
| GLM-5.3 FP8 (Z.ai) | 753B | 40B | 1M | FP8 | MIT (segun OpenLM) |
| GLM-5.2-MXFP4 (AMD) | no disponible | no disponible | no disponible | MXFP4 | glm-5.2 |

La comparativa se limita a variantes del mismo modelo base porque no hay datos publicos de rendimiento de esta cuantizacion frente a otros modelos MoE como DeepSeek V3.2 o Qwen3-MoE.

## Limitaciones y advertencias

- La licencia `glm-5.3` no es MIT ni Apache 2.0; es una licencia propia de Z.ai que puede imponer restricciones de uso comercial. Verificar los terminos antes de desplegar en produccion.
- Solo se ha validado en hardware AMD Instinct MI350; no hay garantia de funcionamiento en GPUs NVIDIA u otras arquitecturas.
- La cuantizacion MXFP4 puede introducir perdidas de precision en tareas de alta sensibilidad numerica, aunque la evaluacion interna menciona comparacion con el oracle BF16 sin resultados publicados.
- Sesgos y alucinaciones no documentados; el modelo base es de Z.ai y no se han publicado evaluaciones de sesgo para esta cuantizacion.
- El despliegue requiere un stack especifico (SGLang ROCm con variables de entorno concretas) y no es trivial en otros runtimes como vLLM o llama.cpp.
- El contexto de 1M tokens exige una gestion cuidadosa de memoria; la receta usa HiCache y KV cache FP8 para mitigarlo, pero el consumo de VRAM es elevado.

## Enlaces

- [HuggingFace: OneNexus/GLM-5.3-MXFP4](https://huggingface.co/OneNexus/GLM-5.3-MXFP4)
- [HuggingFace: zai-org/GLM-5.3 (modelo base)](https://huggingface.co/zai-org/GLM-5.3)
- [OpenLM.ai: pagina de GLM-5.3](https://openlm.ai/glm-5.5/)
- [FriendliAI: endpoint de GLM-5.3-MXFP4](https://friendli.ai/models/OneNexus/GLM-5.3-MXFP4)
- [GitHub: repositorio de despliegue GLM-5.3](https://github.com/GLM-5-3-app/GLM-5.3)
- [Modal: biblioteca de modelos GLM-5.3](https://modal.com/library/zai/glm-5-3)
- [HuggingFace: amd/GLM-5.2-MXFP4 (referencia de formato)](https://huggingface.co/amd/GLM-5.2-MXFP4)
