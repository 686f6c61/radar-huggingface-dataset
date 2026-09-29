# Geneziz/laya-1.7b

## Resumen

laya-1.7b es un modelo de lenguaje compacto distribuido por Geneziz como parte de su aplicacion de escritorio. Se trata de un ajuste fino mediante LoRA sobre una base de la familia Qwen3, con licencia propia (geneziz-proprietary) y publicado unicamente en formato GGUF cuantizado Q4_K_M. El modelo no se ofrece como modelo generalista de proposito abierto: su unica finalidad declarada es actuar como organizador local dentro de la aplicacion Geneziz, leyendo, clasificando y organizando la biblioteca web personal del usuario sin salir del dispositivo.

Con 1.720.574.976 parametros totales, el artefacto publicado ocupa 1.107.408.576 bytes (aproximadamente 1,1 GB) y se ejecuta mediante llama.cpp o cualquier runtime compatible. La aplicacion Geneziz lo descarga automaticamente y lo fija por hash SHA-256, de modo que el binario distribuido sea verificable. La model card no especifica la longitud de contexto, los idiomas soportados ni los datos concretos de entrenamiento mas alla de que el dataset es privado y recopilado por Geneziz.

La relevancia de esta ficha es acotada: se trata de un modelo de uso cerrado, sin benchmarks publicados y sin licencia que permita reutilizacion externa sin permiso escrito. Resulta util como referencia de como se empaquetan modelos de "on-device" para aplicaciones de escritorio, pero no como modelo base para proyectos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen3; detalles no disponibles) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado); otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | geneziz-proprietary (license_name); uso fuera de Geneziz requiere permiso escrito |
| Formato de pesos | GGUF (llama.cpp); safetensors no publicados |
| Tamano del artefacto | 1.107.408.576 bytes (~1,1 GB) |
| SHA-256 | 77deb49b431fcfb56def469c49b4aac14807007d54bbf3571af5218f601baba5 |
| Biblioteca | llama.cpp |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA (parameter-efficient fine-tuning) sobre una base perteneciente a la familia Qwen3, cuyos componentes upstream mantienen licencia Apache-2.0 segun la propia model card. No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset (mas alla de que es privado y recopilado por Geneziz), ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado.

La innovacion declarada no es arquitectonica sino de producto: el modelo se empaqueta como artefacto GGUF cuantizado, se ancla por hash SHA-256 y se ejecuta integramente en la maquina del usuario dentro de la aplicacion Geneziz. No se documentan mecanicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en HuggingFace).
- Lectura, clasificacion y organizacion de contenido de una biblioteca web personal, segun el caso de uso declarado por el autor.
- Ejecucion local mediante llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints segun la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Organizacion de biblioteca personal dentro de Geneziz: el modelo lee y clasifica elementos guardados por el usuario (articulos, enlaces, notas) para convertirlos en una base de conocimiento local buscable. Es su caso de uso declarado y el unico contemplado por la licencia.
- Clasificacion de contenido en local: dado que el artefacto pesa ~1,1 GB y corre sobre llama.cpp, permite clasificar texto sin enviar datos a servidores externos, util para usuarios con requisitos de privacidad.
- Etiquetado y agrupacion tematica: el modelo puede asignar categorias a elementos de una coleccion para facilitar su recuperacion posterior.
- Asistente conversacional embebido en aplicacion de escritorio: al ser un modelo pequeno, puede integrarse como componente de una app nativa sin requerir hardware dedicado.
- Despliegue en equipos sin GPU: al cuantizarse en Q4_K_M y pesar ~1,1 GB, puede ejecutarse en CPU en portatiles convencionales.
- Verificacion de integridad en pipelines de distribucion: el hash SHA-256 publicado permite automatizar la validacion del artefacto en el proceso de descarga de la aplicacion.
- Nota: cualquier uso fuera de la aplicacion Geneziz queda expresamente fuera de alcance y requiere permiso escrito del titular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q4_K_M ocupa ~1,1 GB, por lo que cabe holgadamente en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) es mas que suficiente; no requiere A100 ni H100.
- Ejecucion en CPU: viable; un modelo de 1,7 B en Q4_K_M puede correr en portatiles de gama media incluso sin GPU.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, llama-cpp-python, servidores compatibles con endpoints). vLLM y TGI se mencionan habitualmente para GGUF pero no se confirman en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Geneziz laya-1.7b | 1,72 B | no disponible | geneziz-proprietary | GGUF Q4_K_M | Publico en HF, uso restringido |
| Qwen3-1.7B (base upstream) | ~1,7 B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Publico |
| Llama-3.2-1B | ~1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Publico |
| Gemma-2-2B | ~2,6 B | 8 K | Gemma Terms of Use | safetensors, GGUF | Publico |

Nota: los datos de contexto y tamano de los modelos comparables se ofrecen a titulo orientativo; no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus fichas oficiales antes de citarlos.

## Limitaciones y advertencias

- Licencia restrictiva: geneziz-proprietary. El uso fuera de la aplicacion Geneziz requiere permiso escrito expreso del titular; no es un modelo reutilizable para proyectos de terceros ni para uso comercial autonomo.
- Ambito de uso muy acotado: la propia model card declara que todo lo que quede fuera de "servir al organizador local de la app de escritorio Geneziz" esta fuera de alcance.
- Ausencia de datos de entrenamiento: no se publican tokens, composicion del dataset ni proceso de alineamiento, lo que impide evaluar sesgos o cobertura.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares.
- Idiomas y contexto no especificados: se desconoce el soporte multilingue y la ventana de contexto efectiva.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; sin evaluaciones publicadas no puede cuantificarse.
- Unico artefacto disponible: solo se publica Q4_K_M en GGUF; no hay pesos completos ni otras cuantizaciones para auditar o reentrenar.
- Ambiguedad de nombre: los resultados de busqueda web sobre "Laya" corresponden a un proyecto distinto (el motor de decision "System 1" de Convai Innovations), sin relacion aparente con este modelo de Geneziz. No deben confundirse ambos proyectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Geneziz/laya-1.7b
- Aplicacion Geneziz: https://geneziz.app
- Blog sobre "Laya" (proyecto distinto, Convai Innovations): https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Sitio de "Laya" decision engine (proyecto distinto): https://laya.convaiinnovations.com/
- Portal alternativo del mismo proyecto distinto: https://laya-ai.com/
- Repositorio GitHub de "Laya" (proyecto distinto): https://github.com/receptron/laya
- Analisis de "Laya" en brainfunctioncollapse.com (proyecto distinto): https://brainfunctioncollapse.com/laya
