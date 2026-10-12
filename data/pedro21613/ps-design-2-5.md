# Pedro21613/PS-design-2.5

## Resumen
PS-design-2.5 es un adaptador LoRA publicado en HuggingFace por el usuario Pedro21613, entrenado sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su propósito es especializar un transformer decoder-only de tamano reducido (~0,5B parametros) en la generacion de codigo HTML y CSS con Tailwind para diseno web profesional, incluyendo efectos como gradientes animados, transiciones, animaciones de scroll y estilos glassmorphism o dark-neon. No es un modelo completo, sino un adaptador PEFT (r16, alpha 32) que debe cargarse junto al modelo base mediante la libreria `peft`.

El modelo se presenta como un fine-tune de "velocidad + calidad" orientado a un unico dominio: producir paginas web modernas en formato HTML listo para usar. Se distribuye en formato safetensors y esta etiquetado exclusivamente para portugues (idioma en el que responde, aunque la salida sea principalmente codigo HTML). Es la version 2.5 de una serie, entrenada de forma continua a partir de un adaptador anterior (PS-design-1.2-beta).

Su relevancia es limitada y muy especifica: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks estandar publicados. Resulta de interes unicamente para quien busque generar plantillas de landing pages rapidamente en un modelo muy ligero, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | ~0,5B en el modelo base; parametros del adaptador no disponibles (LoRA r16, alpha 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento
El adaptador emplea LoRA con rango 16 y alpha 32 sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only. El entrenamiento fue continuado a partir del adaptador previo `Pedro21613/PS-design-1.2-beta`. El dataset de la version 2.5 consta de 3600 ejemplos (`dataset_ps25.jsonl`, 3550 de entrenamiento y 50 de evaluacion), distribuidos en 30 nichos de negocio (SaaS, portafolio, e-commerce, restaurante, clinica, academia, agencia, curso, hotel, fintech, IA, entre otros), 6 design systems (aurora, neon-dark, glass-light, premium-min, vibrant, midnight-gold) y 5 tipos de hero (center, split, asymmetric, mock, fullscreen).

Cada ejemplo de HTML generado incluye Tailwind via CDN, clases como `bg-gradient-to-r`, `transition-all duration-300`, desplazamientos y escalados en hover (`hover:-translate-y-0.5 hover:scale`), keyframes `float/fadeUp/gradShift/marquee`, revelado con IntersectionObserver y botones tipo pill con brillo y sombra. La configuracion de entrenamiento fue de 1 epoca, batch efectivo 16 (1x16), learning rate 2e-4 con scheduler cosine, warmup 50, longitud maxima de 1200 tokens, precision fp16, atencion SDPA y una GPU T4. Se guardaron checkpoints cada 150 steps (`checkpoint-150` y `checkpoint-222/final`). Las metricas finales declaradas por el autor son `train_loss ~0,177` y `eval_loss ~0,0074`.

## Capacidades
- Generacion de codigo HTML completo y responsivo como salida principal.
- Aplicacion de estilos con Tailwind CSS via CDN.
- Inyeccion de efectos visuales concretos: gradientes animados, transiciones suaves, botones pill con hover, animaciones fade-up, float, marquee y reveal on scroll (IntersectionObserver).
- Reproduccion de multiples design systems (aurora, neon-dark, glass-light, premium-min, vibrant, midnight-gold) y layouts de hero variados.
- Cobertura de 30 nichos de negocio para adaptar el tono y la estructura de la pagina.
- Respuesta en portugues para el texto y el codigo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Generacion rapida de landing pages para pequenos negocios: dado un prompt como "crea una landing para una cafeteria artesanal", el modelo devuelve un HTML con Tailwind listo para pegar en un proyecto, gracias a su entrenamiento sobre 30 nichos.
- Prototipado de maquetas de front-end: un desarrollador puede obtener una primera version visual de una pagina y refinar despues, reduciendo el tiempo de arranque en proyectos de diseno.
- Creacion de portafolios personales: el adaptador cubre el nicho de portafolio y ofrece layouts con hero asimetrico o split y animaciones de revelado.
- Produccion de plantillas para e-commerce o SaaS: el modelo genera estructuras de hero, secciones y botones con estilos premium sin partir de cero.
- Banco de ejemplos de estilo para design systems: util para generar variantes visuales (glass-light, midnight-gold, etc.) y comparar estetica antes de fijar una guia de diseno.
- Experimentacion educativa con LoRA: sirve como caso de estudio de un adaptador de nicho sobre un modelo pequeno (0,5B) que cabe en una GPU T4 o incluso en CPU para inferencia puntual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| train_loss | ~0,177 |
| eval_loss | ~0,0074 |
| Epocas | 1 |
| Ejemplos de entrenamiento | 3550 (train) / 50 (eval) |
| Longitud maxima de secuencia | 1200 tokens |

## Requisitos de hardware
- Al tratarse de un adaptador sobre un modelo de ~0,5B, la inferencia es muy ligera: en fp16 el modelo base ocupa aproximadamente 1 GB de VRAM, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); el autor entreno el adaptador en una T4.
- Tambien puede ejecutarse en CPU para generacion puntual, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` sobre el modelo base. No se documenta compatibilidad especifica con vLLM, llama.cpp, Ollama o TGI (el adaptador no se distribuye en GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS-design-2.5 | ~0,5B (base) + LoRA r16 | no disponible | HTML/Tailwind para diseno web | no disponible | HuggingFace (PEFF/safetensors) |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5B | no disponible | Proposito general, instrucciones | Apache 2.0 (segun el modelo base) | HuggingFace |
| PS-design-1.2-beta | ~0,5B (base) + LoRA | no disponible | HTML/Tailwind (version previa) | no disponible | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas; la comparacion se limita a parametros, especializacion y licencia.

## Limitaciones y advertencias
- Modelo muy pequeno (~0,5B): la calidad y la coherencia del codigo HTML pueden degradarse en peticiones complejas o fuera del dominio de diseno.
- Riesgo de alucinacion: puede generar clases, estructuras o recursos inexistentes, especialmente si se le pide codigo fuera de HTML/Tailwind.
- Especializacion estrecha: no es un modelo de proposito general; su utilidad se limita a la generacion de paginas web.
- Idioma: etiquetado solo para portugues; su comportamiento en castellano u otros idiomas no esta documentado y podria degradarse.
- Licencia no declarada: al no especificarse licencia en la model card, no hay garantia de uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- Repositorio practicamente sin adopcion (0 descargas, 0 likes) y sin validacion externa; las metricas aportadas son las del propio autor y no estan contrastadas.
- La fecha de creacion/actualizacion registrada (2026-10-12) y el tamano de repo de 0,0 GB limitan la trazabilidad del artefacto.

## Enlaces
- Pagina del modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-design-2.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador previo de la serie: `Pedro21613/PS-design-1.2-beta` (referenciado en la model card, sin URL directa proporcionada)
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion disponible.
