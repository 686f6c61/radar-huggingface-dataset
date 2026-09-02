# Snapkitty/assembly-bite

## Resumen

Assembly Bite no es un modelo de lenguaje, sino un lenguaje pseudo-ensamblador de bajo nivel para representar computaciones de modelos de machine learning a nivel de byte-code. Lo desarrolla Ahmad Ali Parr, bajo el trust Bel Esprit D'Accord Irrevocable Trust, y se publica en el repositorio Snapkitty/assembly-bite. El proyecto incluye cuatro tipos de instrucciones (`.DATA`, `.CODE`, subrutinas y operaciones primitivas), junto con kernels SASS/PTX para GPU Hopper sm_89 (RTX 4090) y un macromodelo de transformer con una arquitectura de multiplicidad (M=4) que duplica copias de cada bloque neuronal.

La relevancia de este proyecto radica en su enfoque radicalmente distinto: en lugar de ofrecer pesos entrenados, propone una representación a nivel de instrucciones de las operaciones de un modelo, con kernels de dequantización GGUF Q4_K y flash attention optimizados para hardware concreto. Sin embargo, no se trata de un modelo usable directamente para generación de texto, razonamiento o código, y no dispone de pesos, parámetros ni benchmarks publicados.

La ficha siguiente refleja esta naturaleza: la mayoría de especificaciones técnicas convencionales de un modelo LLM no aplican o no están disponibles. Se recomienda tratar este repositorio como una pieza de investigación o prototipo, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pseudo-ensamblador para ML (no es un modelo neuronal); incluye un macromodelo transformer de ejemplo con multiplicidad M=4 (L=24, A=12, D=768, H=3072) |
| Parametros totales | no disponible (no se publican pesos entrenados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K (soporte de dequantizacion mediante kernels PTX/SASS) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSL-1.1 y AGPL-3.0 (doblemente licenciado, según badges de la model card) |
| Formato de pesos | no disponible (el repositorio contiene código ensamblador, PTX/SASS y scripts Python, no pesos) |

## Arquitectura y entrenamiento

El repositorio define un lenguaje propio de bajo nivel con dos secciones principales: `.DATA` para declaraciones de layout de memoria (`.word`, `.repl`, `.float`) y `.CODE` para el flujo de instrucciones (`LOAD`, `STORE`, `CALL`, `MATMUL`, `ADD`, `SUB`, `CMP`, `JEQ`, etc.). Las subrutinas cubren operaciones primitivas como `MATMUL`, `SOFTMAX`, `RELU`, `LAYER_NORM` y `ADD_BIAS`. No se basa en sintaxis inventada, sino en algoritmos estándar de CS.

El ejemplo central es un macromodelo transformer descrito en `transformer_macromodel.asm` con una arquitectura de multiplicidad: cada bloque de neuronas tiene M copias (por defecto M=4) que calculan Q/K/V de forma independiente, y los resultados se suman antes de pasar a la siguiente capa. El bucle externo es L×A×M (capa × cabeza × multiplicidad), con layout de pesos `W_Q[L][A][M][D][D]` = 24×12×4×768×768. Esto difiere de la atención multi-cabeza estándar: es multiplicidad dentro de cada cabeza, no entre cabezas. No se menciona ningún proceso de entrenamiento (datos, tokens, RLHF, DPO) porque el proyecto no incluye pesos entrenados.

## Capacidades

- Representación a nivel de instrucciones de operaciones de ML: permite expresar atención, FFN, residual y layer norm como secuencias de instrucciones de bajo nivel.
- Soporte de kernels CUDA optimizados para sm_89 (RTX 4090): incluye flash attention paginada con TMA async copy y WMMA tensor core tiles, y dequantización GGUF Q4_K en PTX y SASS.
- Integración con Python: scripts para envolver un encoder DeBERTa-v3 y para cargar GGUF y construir un pipeline DAG con networkx.
- Incluye un binding para Mamba SSM y una integración QEMU ARM64 con HolyC, lo que sugiere intención de soportar múltiples arquitecturas.
- No ofrece capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en kernels de bajo nivel: el repositorio sirve como referencia para implementar operaciones de transformers en PTX/SASS para GPUs Hopper, especialmente la dequantización GGUF Q4_K y flash attention paginada.
- Estudio de arquitecturas de multiplicidad: el macromodelo de ejemplo permite analizar cómo la multiplicidad dentro de cada cabeza afecta al cómputo, aunque no hay resultados empíricos.
- Prototipado de representaciones intermedias: el pseudo-ensamblador podría usarse como formato de intercambio entre frameworks de ML y kernels personalizados.
- Optimización de inferencia en RTX 4090: los kernels PTX/SASS incluidos pueden integrarse en pipelines de inferencia para acelerar la dequantización de modelos cuantizados.
- Educación en computación de bajo nivel para ML: el código y los ejemplos ilustran cómo se traducen operaciones de alto nivel a instrucciones de máquina.
- Desarrollo de tooling para GGUF: el script `gguf_dag_pipeline.py` y los kernels de dequantización pueden servir de base para herramientas de análisis o conversión de modelos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento, ya que el proyecto no incluye un modelo entrenado ni evalúa su macromodelo de ejemplo.

## Requisitos de hardware

- Los kernels PTX/SASS están compilados para sm_89, es decir, RTX 4090 (arquitectura Hopper en el sentido de NVIDIA, aunque la 4090 es Ada Lovelace; el badge indica sm_89 Hopper, lo cual es inconsistente con el hardware real, pero es lo que declara el autor).
- Se requiere CUDA 12.x y `ptxas` para compilar los kernels a cubin.
- No se indica VRAM mínima ni máxima; los kernels de dequantización procesan bloques de 32 valores con 256 hilos por bloque, lo que sugiere que pueden ejecutarse en GPUs consumer con al menos 8 GB de VRAM.
- No se mencionan opciones de despliegue como vLLM, Ollama o TGI; el proyecto se limita a kernels y scripts Python de bajo nivel.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Assembly Bite no es un modelo de lenguaje comparable con LLMs como Llama, Mistral o Qwen. No existe una categoría de modelos similares en el sentido convencional; el proyecto es único en su enfoque de pseudo-ensamblador para ML.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto, razonar ni ejecutar tareas de NLP. Intentar usarlo como LLM sería un error conceptual.
- No hay pesos publicados: el repositorio contiene código y kernels, no parámetros entrenados. No se puede descargar un modelo para inferencia.
- Licencia doble (BSL-1.1 y AGPL-3.0) con patente pendiente: esto puede complicar el uso comercial, especialmente la cláusula de patente y la incompatibilidad potencial entre las dos licencias.
- El proyecto parece estar en fase experimental: no hay documentación de rendimiento, benchmarks ni validación externa.
- La afirmación de kernels para sm_89 Hopper es técnicamente dudosa (sm_89 corresponde a Ada Lovelace, no Hopper), lo que sugiere posible desinformación o error en los metadatos.
- El autor menciona una "trust" y un EIN, pero no hay evidencia de respaldo institucional verificable.
- La fecha de creación (2026-09-01) es futura respecto a la fecha actual; esto indica que el repositorio puede ser ficticio, especulativo o contener fechas incorrectas.
- Riesgo de alucinación: no aplica, pero el contenido del repositorio no ha sido revisado por pares ni validado.
- No se garantiza compatibilidad con otros frameworks ni soporte técnico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/assembly-bite
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/assembly-bite
- Organización Snapkitty en HuggingFace: https://huggingface.co/Snapkitty
- Búsqueda de modelos Snapkitty: https://huggingface.co/models?other=snapkitty
