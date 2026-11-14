# lucasmondora/Landing-page-gemma-4-26B-A4B-it

## Resumen

Landing-page-gemma-4-26B-A4B-it es un ajuste fino (fine-tuning) del modelo Gemma 4 26B A4B de Google, publicado por el usuario lucasmondora en Hugging Face. El modelo está especializado en la generación de copywriting para landing pages de comercio directo al consumidor (DTC), y se distribuye en formato GGUF con cuantización Q8, lo que lo hace apto para inferencia local con llama.cpp y entornos compatibles con endpoints.

El autor lo entrena a partir de 1500 landing pages de buena calidad, descompuestas en elementos individuales (titulares, subcabeceras, viñetas, explicaciones de mecanismo, beneficios y secciones completas), generando entre 20 y 30 muestras de entrenamiento por página. El resultado, según el autor, muestra una mejora notable frente al Gemma 4 26B A4B original en comprensión de principios de copywriting y marketing, con menos patrones de escritura típicos de IA.

El modelo es un trabajo en curso: el autor indica que planea ampliar el entrenamiento con 1500-3000 landing pages adicionales y, posteriormente, pasar a preentrenamiento con principios de copywriting y ajustes sobre guiones publicitarios, secuencias de upsell, advertorials y listicles. La información pública disponible es escasa: no hay model card estructurada con benchmarks, licencia explícita ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4 26B A4B; presumiblemente transformer con mezcla de expertos, no confirmado en la información) |
| Parámetros totales | 25.233.142.046 (25,2 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con cuantización Q8 (mencionada por el autor); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 185,5 GB; incluye safetensors según los metadatos de parámetros) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 26B A4B, un modelo de Google con 25,2 mil millones de parámetros totales. El sufijo "A4B" sugiere una configuración de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos por token, aunque la información proporcionada no confirma explícitamente esta arquitectura ni los detalles de atención o contexto.

El entrenamiento consiste en un ajuste fino supervisado sobre 1500 landing pages DTC seleccionadas por calidad de copywriting y por superar comprobaciones automáticas contra patrones de escritura típicos de IA. Cada página se descompone en elementos individuales (titulares, subcabeceras, viñetas, mecanismos, beneficios, secciones), generando 20-30 muestras por página. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona que el modelo usa menos "AI-isms" que el Gemma original y que modelos frontera como Opus 5.5 y Sol 6.1, y recomienda combinarlo con un modelo frontera para tareas de copywriting.

## Capacidades

- Generación de texto conversacional orientada a copywriting de marketing y landing pages.
- Redacción de titulares, subcabeceras, viñetas de beneficios, explicaciones de mecanismo y secciones completas de página.
- Comprensión de principios de copywriting y marketing, según el autor, superior al Gemma original.
- Reducción de patrones de escritura típicos de IA ("AI-isms") en el texto generado.
- Formato GGUF compatible con endpoints y despliegue local.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información.

## Casos de uso

- Generación de landing pages DTC: el modelo produce titulares, subcabeceras y secciones completas a partir de un brief de producto, aprovechando el entrenamiento sobre 1500 páginas descompuestas por elementos; adecuado para equipos de marketing que necesitan borradores rápidos de copy.
- Redacción de viñetas de beneficios y mecanismos: el ajuste específico sobre explicaciones de mecanismo y beneficios permite generar listas de ventajas con un tono más humano y menos genérico que el modelo base.
- Asistencia a copywriters con modelo frontera: el autor recomienda usarlo junto a un modelo frontera (Opus o Sol) para tareas de revisión, refinamiento o generación de variantes, reservando este modelo para la producción de copy de conversión.
- Iteración de variantes de titulares: dado su enfoque en elementos individuales, puede emplearse para generar múltiples opciones de titular y subcabecera para pruebas A/B en campañas DTC.
- Generación de secciones de página de venta: el modelo puede redactar secciones completas (prueba social, objeciones, garantías) a partir de la estructura de una landing page existente.
- Despliegue local en flujos de marketing: al distribuirse en GGUF Q8, puede ejecutarse en infraestructura propia para generar copy sin depender de APIs externas, útil para equipos con requisitos de privacidad sobre el material de campaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,2 mil millones de parámetros en Q8, se requieren aproximadamente 25-28 GB de VRAM o memoria unificada, sin contar el overhead de contexto.
- GPU recomendadas: no disponible en la información; por tamaño, una A100 40 GB, H100 o RTX 6000 Ada serían adecuadas para Q8. Una RTX 4090 (24 GB) queda al límite y probablemente requiera cuantizaciones menores.
- Cabe en GPU consumer: no de forma holgada en Q8; sería necesario recurrir a cuantizaciones más agresivas (Q4, Q5) o a memoria unificada en Apple Silicon con 32 GB o más.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; los tags indican "endpoints_compatible". vLLM, TGI y Ollama no están confirmados en la información.
- Latencia y throughput estimados: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Landing-page-gemma-4-26B-A4B-it | 25,2 B | no disponible | Copywriting DTC | no disponible | GGUF |
| Gemma 4 26B A4B (base) | 25,2 B (aprox.) | no disponible | Propósito general | no disponible | safetensors, GGUF |
| Opus 5.5 | no disponible | no disponible | Propósito general / frontera | propietaria | API |
| Sol 6.1 | no disponible | no disponible | Propósito general / frontera | propietaria | API |

La comparación se limita al modelo base del que deriva y a los modelos frontera que el autor cita como referencia de calidad de escritura. No se dispone de datos de benchmarks ni de especificaciones completas de los alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo en desarrollo: el autor lo describe explícitamente como "work in progress" y "lejos de estar optimizado"; no debe considerarse una versión estable para producción crítica.
- Sesgos conocidos: no disponible en la información; al entrenarse sobre landing pages DTC, puede heredar sesgos comerciales y de estilo del corpus.
- Riesgo de alucinación: no evaluado en la información; como todo modelo generativo, puede inventar afirmaciones sobre productos o beneficios.
- Limitaciones de contexto e idioma: no disponible; no se declaran idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia no está declarada, lo que impide confirmar si el uso comercial está permitido. Debe verificarse antes de cualquier despliegue comercial.
- Caveat de producción: el autor recomienda combinarlo con un modelo frontera, lo que sugiere que su rendimiento en tareas fuera del copywriting es limitado.
- Distribución: el repo es de 185,5 GB y las descargas son cero en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lucasmondora/Landing-page-gemma-4-26B-A4B-it
- Modelo base Gemma 4 26B A4B: no disponible en la información
- Paper, blog o repositorio del autor: no disponible en la información
- Demos: no disponible en la información
