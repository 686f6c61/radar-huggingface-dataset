# AMAImedia/Naive-N0.5-Flash-Mixed-Quant-GGUF

## Resumen

Naive-N0.5-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por NaiveAI y distribuido en formato GGUF por AMAImedia. Cuenta con 309.000 millones de parametros totales y 15.500 millones de parametros activos por token, y esta disenado especificamente para tareas de programacion e investigacion en IA. Su rasgo mas distintivo es una ventana de contexto nativa de 1 millon de tokens implementada sin capas de atencion completa, combinando Sliding-Window Attention (SWA) con DeepSeek Sparse Attention (DSA).

El modelo parte del checkpoint base MiMo-V2.5-Base de XiaomiMiMo y ha sido adaptado por NaiveAI. La version que nos ocupa, publicada por AMAImedia, es una cuantizacion mixta en GGUF generada con imatrix, pensada para despliegue local en hardware de consumo y estaciones de trabajo. El repositorio ocupa 87,7 GB y se distribuye bajo licencia MIT.

La relevancia actual del modelo radica en la combinacion de un contexto extremadamente largo (1M tokens) con un coste de decodificacion que no crece con la longitud del contexto en la mayoria de sus capas, lo que lo hace viable para tareas de analisis de repositorios completos, agentes de larga duracion y procesamiento de documentos masivos. La cuantizacion mixta facilita su uso fuera de clusters de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida SWA-DSA |
| Parametros totales | 309B |
| Parametros activos | 15,5B |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | GGUF mixed-quant con imatrix (niveles exactos no disponibles) |
| Idiomas soportados | 119 idiomas, incluyendo en, ru, kk, zh, ja, vi, es, de, fr, pt, ar, hi, ko y otros |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 87,7 GB) |
| Capas del transformer | 48 |
| Composicion de atencion | 39 capas SWA + 9 capas DSA |
| Ventana SWA | 128 tokens |
| Seleccion DSA | Top 2.048 tokens para atencion del backbone |
| Grupos KV DSA | 4 (GQA4) |
| Cabezas de query del indexer | 16 |

## Arquitectura y entrenamiento

Naive-N0.5-Flash es un transformer MoE de 48 capas con 309B parametros totales y 15,5B activos. Su innovacion principal reside en el esquema de atencion: 39 de las 48 capas emplean Sliding-Window Attention con una ventana de solo 128 tokens, cuyo coste de decodificacion por token no crece con la longitud del contexto. Las 9 capas restantes utilizan DeepSeek Sparse Attention con seleccion de los 2.048 tokens mas relevantes mediante un indexer de 16 cabezas de query y 4 grupos KV (GQA4). La red no contiene ninguna capa de atencion completa, lo que permite sostener contextos de 1M tokens con un coste computacional y de memoria acotado.

El modelo deriva del checkpoint MiMo-V2.5-Base de XiaomiMiMo, elegido por sus capacidades fundacionales en conocimiento del mundo e investigacion profunda. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de alineacion (RLHF/DPO). El sistema de inferencia propio, NaiveRT, incorpora fusion de mega-kernels, Programmatic Dependent Launch (PDL) y decodificacion especulativa, alcanzando 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast. La version GGUF de AMAImedia aplica cuantizacion mixta guiada por una matriz de importancia (imatrix), asignando precisiones distintas segun la sensibilidad de cada tensor.

## Capacidades

- Generacion de texto y razonamiento general, con enfasis declarado en programacion e investigacion en IA.
- Contexto nativo de 1M tokens, adecuado para repositorios de codigo completos, libros y expedientes extensos.
- Capacidades multilingues amplias: 119 idiomas declarados, con cobertura destacada de ingles, ruso, kazajo, chino, japones, vietnamita, espanol, aleman, frances y portugues, entre otros.
- Decodificacion especulativa integrada en el stack NaiveRT para acelerar la inferencia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un monorepositorio de tamano medio y responder preguntas sobre dependencias cruzadas, arquitectura o deuda tecnica sin necesidad de chunking ni recuperacion externa.
- Asistencia a la investigacion en IA: el modelo esta orientado a tareas de I+D, por lo que resulta adecuado para resumir y contrastar articulos cientificos extensos, generar revisiones de literatura o explorar hipotesis sobre varios papers en una sola sesion.
- Procesamiento de documentacion legal y tecnica: contratos, normativas o manuales de cientos de paginas caben en la ventana de contexto, permitiendo consultas que requieren referencias cruzadas entre secciones distantes.
- Generacion y refactorizacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para revision automatica de pull requests, sugerencia de parches y deteccion de patrones problematicos, aprovechando su entrenamiento orientado a codigo.
- Traduccion y localizacion multilingue: con 119 idiomas declarados, es utilizable en pipelines de doblaje y subtitulado, contexto declarado de su publicacion dentro de la plataforma NOESIS de AMAImedia.
- Despliegue local en estaciones de trabajo: la cuantizacion mixta GGUF permite ejecutar el modelo en maquinas con 64-128 GB de RAM o VRAM combinada, sin depender de APIs externas, lo que facilita prototipado y entornos con requisitos de privacidad.
- Agentes de larga duracion: aunque el soporte de tool calling no esta documentado en la informacion disponible, el contexto de 1M tokens y el bajo coste de decodificacion por token lo hacen candidato para bucles de agente que acumulan historial extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio GGUF ocupa 87,7 GB, por lo que la inferencia requiere al menos esa cantidad de memoria combinada (VRAM mas RAM del sistema) para cargar los pesos completos.
- El autor declara que su hardware local (RTX 3060 Laptop de 6 GB, 64 GB DDR5, i7-12700H) es adecuado para trabajo con imatrix y modelos de clase 0,6-35B en RAM, pero que los modelos de 9B en adelante y las busquedas requieren alquiler de H200/Blackwell. Esto implica que la inferencia comoda de este modelo de 309B no cabe en hardware de consumo convencional.
- GPU recomendadas: H200 o Blackwell para ejecucion completa; en el extremo opuesto, configuraciones con 128 GB de memoria unificada (por ejemplo, estaciones DGX Spark, mencionadas en las etiquetas del repositorio) podrian alojar la cuantizacion.
- Cabe en GPU de consumo: no de forma completa; solo mediante offloading parcial a RAM, con penalizacion severa de latencia.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el checkpoint original.
- Latencia y throughput: el fabricante declara 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast con NaiveRT, pero estas cifras corresponden al checkpoint original en hardware de datacenter, no a esta cuantizacion GGUF en hardware local.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Naive-N0.5-Flash (esta ficha) | 309B / 15,5B | 1M | MIT | GGUF, BF16/FP8 (upstream) |
| DeepSeek-V3 | 671B / 37B | 128K | MIT (pesos) | safetensors, GGUF comunitario |
| Qwen3-235B-A22B | 235B / 22B | 128K (extensible) | Apache 2.0 | safetensors, GGUF |
| MiMo-V2.5-Base (modelo base) | no disponible | no disponible | no disponible | safetensors |

La comparativa con DeepSeek-V3 y Qwen3-235B-A22B se ofrece como referencia de categoria (MoE de gran escala con licencia permisiva); no se dispone de datos de rendimiento comparativo del modelo en la informacion proporcionada. Frente a ellos, Naive-N0.5-Flash destaca por su contexto nativo de 1M tokens y su menor numero de parametros activos (15,5B), lo que reduce el coste por token en inferencia.

## Limitaciones y advertencias

- No se dispone de resultados de benchmarks publicados, por lo que el rendimiento real frente a alternativas establecidas no puede verificarse con la informacion disponible.
- El modelo es una cuantizacion mixta: la perdida de precision respecto al checkpoint BF16/FP8 original puede afectar a tareas sensibles, especialmente en razonamiento numerico y generacion de codigo largo.
- La ventana SWA de solo 128 tokens implica que la mayor parte de la informacion de contexto depende de las 9 capas DSA; la calidad de recuperacion en contextos muy largos no esta documentada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual en la informacion proporcionada.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- El soporte de tool calling, agentes y modos de razonamiento explicito no esta documentado, lo que limita su uso en pipelines agenticos sin validacion previa.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el modelo deriva de MiMo-V2.5-Base, cuyos terminos de licencia no se detallan en la informacion disponible; conviene verificar la cadena de licencias antes de un despliegue comercial.
- El modelo card incluye llamadas a donaciones y enlaces promocionales; no constituyen parte tecnica de la ficha.
- El hardware local del autor no permite ejecutar el modelo completo, lo que sugiere que la mayoria de usuarios necesitara infraestructura de datacenter o memoria unificada de gran capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Naive-N0.5-Flash-Mixed-Quant-GGUF
- Modelo original: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Checkpoint FP8 con borrador especulativo: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8-Draft
- GGUF de referencia: https://huggingface.co/Baekpica/Naive-N0.5-Flash-Mixed-Quant-GGUF/tree/main
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Base
- Web de AMAImedia: https://AMAImedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
