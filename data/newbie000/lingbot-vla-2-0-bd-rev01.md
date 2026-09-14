# newbie000/lingbot-vla-2.0-bd-rev01

## Resumen

lingbot-vla-2.0-bd-rev01 es un checkpoint publicado en HuggingFace por el usuario newbie000, derivado de MechaTrainer/lingbot-vla-2.0-cesBRyPcp3Ar (commit 50d668ffac21fd43a1a954f3595db81fcb6efd2d), descrito en la model card como campeón de la competición SN80 competition-2 con UID 43. La revisión consiste en revertir 288 de los 1708 tensores del modelo padre hacia un checkpoint anterior, tungduong261204/lingbot-vla-2.0-zGXyckqvz5m7 (commit eb5687782509fde1496567a6727e55401177b59d, campeón previo con UID 9): 216 tensores de FFN de acción de tipo MoE, 36 de router gate y 36 de router bias. Los 1420 tensores restantes se mantienen idénticos al UID 43.

El modelo declara 6.375.907.511 parámetros (~6,38 mil millones) y un repositorio de 25,5 GB en formato safetensors. La presencia de tensores etiquetados como «action MoE/FFN», «router gate» y «router bias» evidencia una arquitectura con mezcla de expertos en la cabeza de acción, nomenclatura compatible con un modelo de tipo Vision-Language-Action (VLA), si bien la model card no documenta la arquitectura global, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento.

Su relevancia es acotada y de naturaleza experimental: el propio autor reporta que la revisión no mejora al checkpoint del que deriva. En una auditoría preinscrita de 200 layouts (tareas object_swap y spatial_swap) obtuvo 182/200 (91,0%) frente a 181/200 (90,5%) del UID 43, una diferencia neta de +1 con McNemar p=1,000 y un intervalo de confianza del 95% para la interacción de [-0,0050, +0,0900], que incluye el cero. El autor concluye explícitamente que no se detecta mejora; los tensores revertidos se describen como «byte-identical; no-ops».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible a nivel global. Evidencia parcial en la model card: capas de acción con mezcla de expertos (FFN de acción, router gate, router bias) |
| Parámetros totales | 6.375.907.511 (~6,38 mil millones), dato leído de safetensors |
| Parámetros activos | No disponible (el checkpoint usa MoE en las capas de acción, pero no se publica el número de parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors; no hay versiones GGUF, AWQ, GPTQ ni similares. El tamaño del repo (25,5 GB) es coherente con pesos en fp32 para 6,38e9 parámetros |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 25,5 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa del modelo ni su procedimiento de entrenamiento. Los únicos datos arquitectónicos disponibles proceden del inventario de tensores: 1708 tensores en total, de los cuales 288 pertenecen a capas de acción con estructura de mezcla de expertos (216 de FFN de acción, 36 de router gate y 36 de router bias). Esto confirma la existencia de un mecanismo de enrutamiento con sesgo sobre una cabeza de acción, patrón habitual en políticas robóticas con MoE, pero no permite inferir el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de atención.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. Lo que sí documenta el autor es una operación de cirugía de checkpoints: revertir 288 tensores hacia un checkpoint anterior (UID 9) manteniendo los 1420 restantes del UID 43, sin reentrenamiento. El autor indica que esos 288 tensores revertidos son byte-idénticos a los del UID 9 y los califica de «no-ops», lo que explica el resultado nulo de la auditoría. La innovación declarada, por tanto, no es algorítmica sino de composición de pesos entre checkpoints de competición.

## Capacidades

- Generación de acciones sobre entornos con variaciones de disposición espacial: el modelo ha sido evaluado en tareas de tipo object_swap y spatial_swap sobre 200 layouts, lo que indica capacidad de operar ante cambios de posición o identidad de objetos.
- Procesamiento multimodal de tipo Vision-Language-Action (VLA) según la nomenclatura del repositorio y de los modelos de los que deriva; no confirmado explícitamente en la model card.
- Enrutamiento mediante mezcla de expertos en la cabeza de acción, con router gate y router bias entrenados.
- No hay información publicada sobre soporte de tool calling, function calling, uso agéntico o razonamiento multi-paso.
- No hay información publicada sobre capacidades multilingües ni sobre modo de razonamiento explícito (thinking mode), visión general, audio u otras modalidades.
- No hay información publicada sobre generación de texto, código o matemáticas; el perfil de tensores sugiere un modelo orientado a acción y no a generación de lenguaje general.

## Casos de uso

- Políticas de manipulación robótica con objetos intercambiados: el modelo está evaluado específicamente en layouts object_swap, por lo que resulta adecuado para tareas en las que la identidad de los objetos cambia de posición respecto a una configuración de referencia.
- Políticas de manipulación con reorganización espacial: la auditoría incluye layouts spatial_swap, lo que lo hace apto para escenarios donde la geometría de la escena varía sin cambiar los objetos.
- Auditoría y comparación de checkpoints en pipelines de evaluación: el modelo se ha usado con una metodología preinscrita de 200 layouts y contraste estadístico McNemar con intervalos de confianza, reproducible como plantilla de evaluación de variantes.
- Investigación sobre mezcla de expertos en cabezas de acción: al publicar tensores separados de FFN de acción, router gate y router bias, permite estudiar el efecto de revertir componentes concretos del enrutador.
- Experimentos de composición de checkpoints: sirve como caso de estudio de fusión y reversión selectiva de tensores entre modelos de la misma familia, con resultado nulo documentado.
- Pruebas de robustez a variaciones de layout en robótica: útil como baseline en bancos de prueba que midan generalización ante permutaciones de objetos y de posiciones.
- Docencia o reproducción de metodología de evaluación: la model card incluye el diseño experimental y los criterios estadísticos, lo que permite reutilizarlo como ejemplo de auditoría preinscrita en competiciones de modelos.

## Benchmarks y rendimiento

| Benchmark | lingbot-vla-2.0-bd-rev01 | MechaTrainer/lingbot-vla-2.0-cesBRyPcp3Ar (UID 43) | Diferencia |
|---|---|---|---|
| Auditoría oficial 200 layouts (object_swap + spatial_swap), aciertos | 182/200 (91,0%) | 181/200 (90,5%) | +1 |
| Contraste estadístico | McNemar p = 1,000 | — | No significativo |
| IC 95% de la interacción | [-0,0050, +0,0900] (incluye el cero) | — | No se detecta mejora |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según parámetros (6,38e9): aproximadamente 25,5 GB en fp32, 12,8 GB en bf16/fp16, 6,4 GB en int8 y 3,2 GB en int4. Son estimaciones sobre el número de parámetros; no hay ficheros cuantizados publicados.
- Al no distribuirse pesos en bf16 ni cuantizados, el repositorio tal cual requiere del orden de 25,5 GB de VRAM o de memoria unificada, lo que excluye GPUs de consumo de 24 GB o menos para una carga directa en fp32.
- GPU recomendadas para carga directa del checkpoint: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB. No cabe en RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin convertir los pesos a bf16 o a una cuantización inferior.
- Tras conversión a bf16, cabría en RTX 4090 y RTX 3090 (24 GB); tras conversión a int8, en RTX 4080/4090 y en GPUs de 12-16 GB con margen ajustado; tras conversión a int4, en RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama. La estructura MoE personalizada de la cabeza de acción y la ausencia de ficheros GGUF hacen probable que se requiera un runtime propio del proyecto, pero esto no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Auditoría 200 layouts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| newbie000/lingbot-vla-2.0-bd-rev01 | 6.375.907.511 | No disponible | 182/200 (91,0%) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| MechaTrainer/lingbot-vla-2.0-cesBRyPcp3Ar (UID 43) | No disponible | No disponible | 181/200 (90,5%) | No disponible | HuggingFace (checkpoint de origen) |
| tungduong261204/lingbot-vla-2.0-zGXyckqvz5m7 (UID 9) | No disponible | No disponible | No disponible | No disponible | HuggingFace (checkpoint previo del que se importan 288 tensores) |

No se dispone de información sobre otros modelos comparables de la misma categoría (VLA o políticas robóticas de tamaño similar) en el material proporcionado.

## Limitaciones y advertencias

- No se detecta mejora respecto al checkpoint de origen: +1 acierto sobre 200 layouts, McNemar p = 1,000 e intervalo de confianza de la interacción que incluye el cero.
- Los 288 tensores revertidos se describen como byte-idénticos a los del modelo previo y como «no-ops», por lo que el cambio efectivo es nulo; el propio autor lo reconoce.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria independiente.
- La model card no documenta sesgos conocidos, riesgo de alucinación, comportamiento fuera de distribución ni limitaciones de idioma.
- La evaluación se limita a 200 layouts de dos tipos concretos (object_swap y spatial_swap); no hay datos sobre otras tareas, dominios o condiciones de entorno.
- No hay información sobre el uso previsto, restricciones de seguridad en robótica ni condiciones de parada del modelo fuera del banco de pruebas.
- La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero los checkpoints de origen (MechaTrainer y tungduong261204) no publican su licencia en la información disponible; conviene verificarla antes de un uso comercial.
- La fecha de creación del repositorio (2026-09-14T12:55:36Z) es posterior a la fecha habitual de análisis; se reporta tal cual sin interpretación adicional.
- No hay ficheros cuantizados ni documentación de despliegue, lo que obliga a conversiones manuales para entornos con VRAM limitada.
- El nombre del modelo y las tareas evaluadas sugieren un uso orientado a acción (VLA), pero la model card no confirma la modalidad de entrada ni el espacio de acciones.

## Enlaces

- HuggingFace: https://huggingface.co/newbie000/lingbot-vla-2.0-bd-rev01
- Modelo de origen (UID 43): https://huggingface.co/MechaTrainer/lingbot-vla-2.0-cesBRyPcp3Ar
- Modelo previo del que se importan 288 tensores (UID 9): https://huggingface.co/tungduong261204/lingbot-vla-2.0-zGXyckqvz5m7
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Las consultas devolvieron resultados no relacionados (preguntas en Zhihu sobre símbolos y transporte marítimo, soporte de garantía de Google Pixel, foro de Booking.com y ayuda de Hotel Center de Google). No hay papers, blogs, repositorios ni demos adicionales documentados.
