# liodon-ai/Octen-WebGR-0.6B-imatrix-GGUF

## Resumen

Octen-WebGR-0.6B-imatrix-GGUF es una colección de cuantizaciones en formato GGUF del modelo Octen-WebGR-0.6B, publicada por Liodon AI. El modelo base, Octen/Octen-WebGR-0.6B, es a su vez una derivada de Qwen3-0.6B-Base, el modelo pequeño de la familia Qwen3 de Alibaba, con unos 730 millones de parámetros. La particularidad de este repositorio es que todas las cuantizaciones emplean la técnica iMatrix (importance matrix), que calibra la cuantización usando 2 millones de tokens de WikiText-103 para asignar más precisión a los pesos más relevantes, mejorando la coherencia en niveles bajos de bits (2-4 bits) sin aumentar el tamaño de archivo.

La relevancia de esta ficha está en el segmento sub-4-bit y en la ejecución local: con archivos desde 0,36 GB (IQ2_M) hasta 0,79 GB (Q8_0), el modelo está pensado para correr en hardware muy modesto —portátiles, Raspberry Pi de gama alta, móviles o cualquier GPU con 1 GB de VRAM— mediante llama.cpp, Ollama, LM Studio o Jan. Es un candidato para casos de uso conversacionales ligeros, prototipado y despliegues en el borde (edge) donde no se dispone de recursos de cómputo significativos. La cuantización recomendada por el autor es Q4_K_M, de 0,51 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), no disponible detalle completo |
| Parámetros totales | 730.267.648 (≈0,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base Octen/Octen-WebGR-0.6B; revisar antes de uso comercial) |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base es Octen-WebGR-0.6B, derivado de Qwen/Qwen3-0.6B-Base, que emplea una arquitectura transformer decoder-only. No hay información en la model card sobre los datos de entrenamiento del ajuste de Octen, ni sobre técnicas como RLHF o DPO, por lo que esos detalles no están disponibles.

Sobre la cuantización: Liodon AI ha aplicado iMatrix (importance matrix), una técnica que ejecuta 128 fragmentos de calibración a través del modelo en precisión completa para identificar qué pesos son más críticos, y asigna más bits de precisión a esos pesos. La calibración se ha realizado con 2 millones de tokens de WikiText-103. Según el autor, en niveles Q2/Q3/Q4 esto produce una coherencia y capacidad de seguimiento de instrucciones notablemente mejores que la cuantización estándar, con el mismo tamaño de archivo. Existe también un repositorio hermano con cuantizaciones sin iMatrix (`liodon-ai/Octen-WebGR-0.6B-GGUF`) para comparar.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Modelo derivado de Qwen3-0.6B-Base, por lo que hereda capacidades básicas de razonamiento y generación de código propias de esa familia, aunque el ajuste concreto de Octen no está documentado.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Funcionamiento con niveles de cuantización extremos (sub-4-bit) gracias a iMatrix.
- No hay información sobre soporte de tool calling, agentes, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Chatbots ligeros en local: con ~0,5-1 GB de VRAM, puede alimentar un asistente conversacional básico en un portátil sin GPU dedicada, ideal para demos y prototipos.
- Aplicaciones edge e IoT: los archivos de 0,36-0,5 GB permiten desplegar generación de texto en dispositivos con recursos muy limitados, como SBCs o equipos industriales sin conexión a la nube.
- Prototipado rápido de pipelines LLM: al correr en Ollama con un solo comando (`ollama run hf.co/liodon-ai/Octen-WebGR-0.6B-imatrix-GGUF:Q4_K_M`), es útil para probar prompts y cadenas de orquestación sin coste de API.
- Ajuste fino posterior (fine-tuning) de bajo coste: su pequeño tamaño permite experimentar con LoRA/QLoRA en GPUs de consumo antes de escalar a modelos mayores.
- Completado de texto en editores: como modelo de 0,6 B, puede servir para sugerencias de texto o autocompletado simple con latencia mínima en CPU.
- Comparación de técnicas de cuantización: al existir versiones con y sin iMatrix, es útil como banco de pruebas para evaluar el impacto de iMatrix en calidad percibida frente a tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (según tabla del autor): ~0-1 GB para todas las cuantizaciones; IQ2_M ocupa 0,36 GB, IQ3_M 0,45 GB, IQ4_XS 0,48 GB, Q4_K_M 0,51 GB, Q5_K_M 0,56 GB, Q6_K 0,61 GB y Q8_0 0,79 GB.
- GPU recomendadas: cualquier GPU moderna es más que suficiente; el modelo puede ejecutarse íntegramente en CPU por su tamaño mínimo. No se requieren A100 ni H100.
- Consumer GPUs: cabe con holgura en cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); incluso corre en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Octen-WebGR-0.6B-imatrix-GGUF:Q4_K_M`), Ollama, LM Studio y Jan.
- Latencia y throughput: no disponible; dada la talla de 0,6-0,8 GB, se espera inferencia muy rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización mínima | Contexto | Licencia |
|---|---|---|---|---|---|
| Octen-WebGR-0.6B-imatrix-GGUF (este) | 0,73 B | GGUF (iMatrix) | IQ2_M (0,36 GB) | no disponible | other |
| Qwen3-0.6B (base, oficial) | 0,6 B | safetensors / GGUF de terceros | variable | no disponible en esta ficha | Apache-2.0 (base Qwen3) |
| Liodon Octen-WebGR-0.6B-GGUF (sin iMatrix) | 0,73 B | GGUF estándar | variable | no disponible | other |

Comparativa orientativa: frente al Qwen3-0.6B oficial, esta versión añade el ajuste de Octen y cuantizaciones iMatrix de mayor calidad a igual tamaño de archivo. Frente a la variante sin iMatrix del mismo autor, ofrece mejor coherencia en niveles bajos de bits según el autor, al mismo coste de almacenamiento. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3-0.6B-Base, hereda potencialmente los sesgos de los datos de preentrenamiento de esa familia.
- Riesgo de alucinación: elevado en modelos de menos de 1 B de parámetros, especialmente en niveles de cuantización de 2-3 bits; no apto para tareas que exijan precisión factual sin supervisión.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la model card; verificar en el modelo base antes de producción.
- Licencia: etiquetada como "other"; no está garantizado el uso comercial sin revisar los términos heredados de Octen/Octen-WebGR-0.6B.
- La cuantización, incluso con iMatrix, degrada la calidad respecto a los pesos en precisión completa; en IQ2_M la pérdida puede ser significativa.
- La model card del modelo base no describe el método ni los datos del ajuste de Octen, lo que dificulta evaluar su idoneidad para tareas específicas.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/liodon-ai/Octen-WebGR-0.6B-imatrix-GGUF
- Modelo base: https://huggingface.co/Octen/Octen-WebGR-0.6B
- Modelo base original: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/Octen-WebGR-0.6B-GGUF
- Dataset de calibración (WikiText-103): https://huggingface.co/datasets/wikitext
- Perfil del autor (Liodon AI): https://huggingface.co/liodon-ai
