# MiamnusAI/Miamnus-M1-Nano-v1.2

## Resumen
Miamnus-M1-Nano-v1.2 es un modelo de lenguaje causal compacto desarrollado por Miamnus AI, con 24,7 millones de parametros (24.737.736 pesos) y una arquitectura hibrida recurrente 3:1 que combina atencion lineal GDN2 con capas de atencion MLA a lo largo de 24 bloques transformer. El modelo esta disenado para inferencia eficiente en entornos con recursos limitados y se distribuye como un paquete autocontenido escrito en PyTorch puro, sin dependencias de compilacion de kernels Triton o CUDA.

La relevancia de este modelo radica en su enfoque de eficiencia: con solo 256 dimensiones ocultas, 4 cabezas de consulta y 2 cabezas clave/valor, busca ofrecer generacion de texto en CPU, Apple Silicon (MPS) y NVIDIA CUDA sin friccion de despliegue. Su ventana de contexto es de 1.024 tokens y utiliza un vocabulario de 4.096 tokens con tokenizacion Byte-Level BPE, lo que lo situa en el segmento de modelos ultraligeros para tareas acotadas y prototipado rapido.

El modelo se publica bajo licencia Apache 2.0, esta entrenado exclusivamente en ingles y se apoya en el dataset CuratedCorpus-5B del mismo autor. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que facilita su descarga y despliegue en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida 3:1 (GDN2 linear attention + MLA attention), 24 bloques |
| Parametros totales | 24.737.736 (24,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo custom (trust_remote_code) |

## Arquitectura y entrenamiento
La arquitectura es un transformer causal hibrido con un patron recurrente 3:1: 18 capas de atencion lineal GDN2 y 6 capas de atencion MLA, sumando 24 bloques. La dimension oculta (d_model) es de 256, con 4 cabezas de consulta, 2 cabezas clave/valor y dimension de cabeza de 64. La capa feed-forward utiliza SwiGLU con dimension intermedia de 704. El modelo emplea un vocabulario de 4.096 tokens mediante Byte-Level BPE.

El entrenamiento se realizo sobre el dataset MiamnusAI/CuratedCorpus-5B, aunque no se especifica en la informacion disponible el numero exacto de tokens vistos, la composicion detallada del corpus ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la combinacion de atencion lineal GDN2 con MLA en un paquete de PyTorch puro que evita dependencias de kernels externos, permitiendo ejecucion directa en MPS, CPU y CUDA.

## Capacidades
- Generacion de texto causal en ingles.
- Razonamiento basico y continuacion de texto con contexto de hasta 1.024 tokens.
- Inferencia en CPU, Apple Silicon (MPS) y NVIDIA CUDA sin compilacion de kernels.
- Integracion con Hugging Face Transformers mediante trust_remote_code.
- Ejecucion standalone mediante el script generate.py incluido.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso
- Prototipado rapido de pipelines de generacion de texto: el modelo puede cargarse en Transformers con trust_remote_code y generar texto en segundos, adecuado para validar ideas antes de escalar a modelos mayores.
- Inferencia en dispositivos de borde: con 24,7M parametros y 0,1 GB de repositorio, puede desplegarse en portatiles, Raspberry Pi o entornos CPU sin GPU dedicada.
- Educacion y experimentacion con arquitecturas hibridas: sirve como referencia practica para estudiar la combinacion de atencion lineal GDN2 y MLA en un modelo pequeno y reproducible.
- Generacion de texto acotada en ingles: adecuado para completar prompts cortos, generar descripciones o textos de relleno en aplicaciones donde la latencia y el coste importan mas que la calidad linguistica.
- Pruebas de integracion en CI/CD: su paquete autocontenido en PyTorch puro permite incluirlo en tests automatizados de pipelines de inferencia sin dependencias de CUDA.
- Demos interactivas de bajo consumo: puede ejecutarse en notebooks o entornos web ligeros para mostrar generacion de texto en tiempo real con contexto de 1.024 tokens.
- Investigacion sobre tokenizacion compacta: su vocabulario de 4.096 tokens Byte-Level BPE permite experimentar con eficiencia de tokenizacion en corpus pequenos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamano de 24,7M parametros (aproximadamente 0,1 GB de pesos en safetensors); en fp16 o cuantizaciones de 8 bits el consumo seria aun menor, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada para este modelo; tambien funciona en GPU integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU y Apple Silicon (MPS).
- Opciones de despliegue: Hugging Face Transformers con trust_remote_code, script generate.py standalone; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Miamnus-M1-Nano-v1.2 | 24,7M | 1.024 | Apache 2.0 | Hugging Face |
| Modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse en un corpus curado no publico en detalle, pueden persistir sesgos del corpus original.
- Riesgo de alucinacion: alto en un modelo de 24,7M parametros con contexto de 1.024 tokens; no es adecuado para tareas que requieran precision factual.
- Limitaciones de contexto: ventana de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye con codigo custom que requiere trust_remote_code, lo que implica ejecutar codigo del autor.
- Caveats para produccion: sin benchmarks publicados, sin cuantizaciones documentadas y con 0 descargas y 0 likes en Hugging Face; no recomendado para produccion sin evaluacion previa.
- Al ser un modelo de investigacion con arquitectura experimental (GDN2 + MLA), la compatibilidad con herramientas del ecosistema (vLLM, TGI, llama.cpp) no esta verificada.

## Enlaces
- Hugging Face: https://huggingface.co/MiamnusAI/Miamnus-M1-Nano-v1.2
- Dataset de preentrenamiento: https://huggingface.co/datasets/MiamnusAI/CuratedCorpus-5B
- Citacion (BibTeX en model card): Miamnus AI Research Team, "Miamnus M1 Nano: Efficient 3:1 Hybrid Linear Attention Language Models", Miamnus Technical Report Series, 2026.
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
