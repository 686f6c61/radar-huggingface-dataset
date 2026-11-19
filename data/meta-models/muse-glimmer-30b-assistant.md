# meta-models/Muse-Glimmer-30B-assistant

## Resumen

Muse Glimmer-30B-assistant es el modelo "drafter" ligero que acompaña a Muse Glimmer 30B, un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parametros con un encoder de percepcion dedicado, desarrollado por Meta Superintelligence Lab y publicado en agosto de 2026 bajo licencia Apache 2.0. El modelo principal esta destilado de Muse Spark y disenado especificamente para tareas agenticas autonomas que puedan ejecutarse en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion ante fallos en un unico modelo que funciona localmente sin infraestructura en la nube.

La ficha de Hugging Face corresponde al componente drafter basado en DFlash, un modelo de difusion de bloques que predice bloques completos de 16 tokens en una sola pasada hacia delante; el modelo principal verifica estas propuestas en paralelo, aceptando los tokens correctos y corrigiendo los erroneos. Esta tecnica permite una generacion significativamente mas rapida que la decodificacion token a token estandar manteniendo una calidad de salida identica.

El interes actual del modelo radica en su orientacion a despliegues locales: con cuantizacion a 4 bits, el modelo de lenguaje ocupa menos de 20 GB, dejando margen para la cache KV, el encoder de percepcion y el drafter dentro de un envelope de 24 GB o 32 GB de VRAM, con una degradacion medida de entre 0,2 % y 1,0 % en 15 benchmarks comunes. El contexto maximo declarado es de 131.072 tokens o superior, con un corte de conocimiento del 4 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14); drafter basado en DFlash (difusion de bloques) |
| Parametros totales | ~29,6B en el modelo principal (incluyendo encoder de vision); 2.555.985.152 en el repositorio del drafter (safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (objetivo 32 GB VRAM), K-Quant-17GB (objetivo 24 GB VRAM); drafter tambien en versiones cuantizadas |
| Idiomas soportados | Mas de 100 idiomas en entrenamiento (segun model card); listado oficial no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo principal es un transformer causal denso de 52 capas con dimension oculta de 6656, atencion con patron repetido [Local, Local, Local, Global], ventana deslizante de 2048 tokens, atencion con compuertas (gated attention), 32 cabezas de consulta y 2 de clave/valor (GQA con ratio 16:1), dimension de cabeza 128, FFN de tipo SwiGLU con dimension intermedia 19.968 y codificacion posicional RoPE (theta = 500.000) aplicada solo en las capas locales. El vocabulario es de 202.048 tokens (200.000 BPE mas 2.048 especiales). El encoder de percepcion es un ViT-G/14 de aproximadamente 1,8B parametros, 50 capas, anchura 1536 y patch size 14, con un maximo de 4.096 tokens visuales por imagen.

El drafter DFlash tiene 5 capas, tamano de bloque 16, atencion de ventana deslizante de 2048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor (GQA), longitud de secuencia de 131.072 y capas de caracteristicas ocultas uniformes sobre las capas {1, 13, 25, 37, 49} de las 52 del modelo objetivo. Los datos de entrenamiento son contenido multimodal procedente de datos publicos, datos de terceros e informacion de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta; el numero exacto de tokens no esta disponible. No se detalla en la informacion proporcionada si se empleo RLHF, DPO u otras tecnicas de alineacion posteriores.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos extendidos.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Comprension multimodal de entrada: acepta texto e imagenes intercaladas (capturas de pantalla, graficos, documentos) mediante el encoder de percepcion; la salida es solo texto.
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw, Hermes Agent y otros patrones similares.
- Esfuerzo de razonamiento controlable: permite seleccionar distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidades multilingues: entrenado con datos de mas de 100 idiomas.
- Decodificacion especulativa mediante el drafter DFlash, con prediccion de bloques de 16 tokens por pasada.
- Completado de tareas agenticas de extremo a extremo evaluado en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench.

## Casos de uso

- Agentes autonomos de resolucion de tareas: el modelo puede operar dentro de scaffolds como OpenClaw o Hermes Agent para completar flujos multi-turno de principio a fin, gracias a su contexto de 131.072 tokens y a la recuperacion ante fallos.
- Automatizacion de soporte tecnico con acceso a herramientas: invoca APIs y funciones con esquemas precisos, diagnostica respuestas inesperadas y reintenta, lo que reduce la necesidad de intervencion humana.
- Ingenieria de software asistida: el modelo esta evaluado en SWE-Bench y puede escribir y depurar codigo dentro de pipelines, integrarse en CI/CD y resolver incidencias con razonamiento multi-paso.
- Analisis de documentos y capturas de pantalla: al aceptar imagenes intercaladas con texto, puede interpretar graficos, tablas y documentos escaneados junto al contexto conversacional, util en auditoria y extraccion de datos.
- Asistentes locales con privacidad: al ejecutarse en un envelope de 24-32 GB de VRAM sin acceso a red, es adecuado para entornos con requisitos de confidencialidad o air-gapped.
- Investigacion y recuperacion de informacion: su rendimiento en DeepSearch QA lo hace util para agentes de busqueda profunda que combinan consultas, lectura de fuentes y sintesis.
- Despliegue en estaciones de trabajo con GPU de consumo: con K-Quant-17GB cabe en tarjetas de 24 GB, lo que permite prototipar agentes en RTX 4090 o similares antes de escalar.

## Benchmarks y rendimiento

La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no publica cifras numericas concretas en la informacion disponible. Si se documenta la degradacion por cuantizacion medida como media de precision sobre 15 benchmarks comunes:

| Configuracion | Precision | Degradacion | Hardware objetivo |
|---|---|---|---|
| Full precision | Completa | - | 64 GB VRAM |
| K-Quant-Dynamic | ~4 bits | 0,2 % | 32 GB VRAM |
| K-Quant-17GB | ~4 bits | 1,0 % | 24 GB VRAM |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 20 GB para el modelo de lenguaje cuantizado a ~4 bits; 24 GB con K-Quant-17GB (incluyendo cache KV, encoder de percepcion y drafter); 32 GB con K-Quant-Dynamic; 64 GB en precision completa.
- GPU recomendadas: RTX 5090 (medicion de velocidad citada en la model card), configuraciones de 24 GB y 32 GB; para precision completa se requieren 64 GB de VRAM (por ejemplo A100 80 GB o H100).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 4090 o RTX 5090 con la cuantizacion K-Quant-17GB, y en tarjetas de 32 GB con K-Quant-Dynamic.
- Tambien se reportan mediciones en Apple Silicon: MacBook M4-Max y M5-Max.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; no se confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: la model card indica una generacion significativamente mas rapida gracias a la decodificacion especulativa DFlash con bloques de 16 tokens, pero no se proporcionan cifras concretas de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B | 131.072+ | Apache 2.0 | Agentes locales multimodales con decodificacion especulativa |
| Alternativas de ~30B densos | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparables de otros modelos de la misma categoria (parametros, contexto, rendimiento y licencia) para establecer una comparativa rigurosa. La model card no incluye tablas comparativas frente a modelos de terceros.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de lenguaje generativo; no se documentan tasas especificas de alucinacion en la informacion disponible.
- Sesgos: los datos de entrenamiento provienen de fuentes publicas, terceros y productos de Meta, por lo que puede heredar sesgos presentes en esas fuentes; no se detalla un analisis de sesgos en la model card.
- Idiomas: se declara entrenamiento en mas de 100 idiomas, pero no se especifica el nivel de calidad por idioma ni la lista oficial.
- Contexto: el contexto maximo es de 131.072+ tokens, con ventana deslizante local de 2048 en la mayoria de capas; el rendimiento en contextos muy largos puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo incorpora un encoder de percepcion y datos de terceros; conviene revisar las condiciones de las fuentes de datos antes de un despliegue comercial.
- Produccion: la cuantizacion K-Quant-17GB introduce un 1,0 % de degradacion media en 15 benchmarks; para tareas sensibles a la precision puede ser preferible K-Quant-Dynamic o precision completa.
- El repositorio de Hugging Face corresponde al drafter, no al modelo principal; su uso aislado no reproduce las capacidades descritas para Muse Glimmer 30B.
- La model card esta incompleta en el momento de la consulta (texto truncado), por lo que parte de las mediciones de velocidad y benchmarks no estan disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Paper del encoder de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Meta AI: https://www.meta.ai/
