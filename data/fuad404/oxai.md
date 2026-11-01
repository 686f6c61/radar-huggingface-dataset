# fuad404/OxAi

## Resumen

OxAi Core (v1.0) es un modelo de lenguaje publicado en HuggingFace por el usuario fuad404 (identificado en la model card como Fuad) bajo licencia MIT. Segun los metadatos del repositorio, se trata de un modelo de gran escala con 684.489.845.504 parametros almacenados en formato safetensors (aproximadamente 684,5 mil millones), lo que lo situa en la categoria de modelos frontier por tamano. El repositorio ocupa 688,6 GB y declara pesos en fp8.

La model card lo presenta como un nucleo de IA especializado en desarrollo full-stack, pruebas de penetracion y analisis de seguridad, con enfasis en arquitectura de codigo e investigacion en ciberseguridad. Los idiomas declarados son ingles (en) y kurdo (ku). El modelo incluye la etiqueta `custom_code`, lo que implica que requiere codigo personalizado para su carga y ejecucion, y no se ha publicado informacion sobre su pipeline de inferencia.

Es relevante por su enfoque declarado en ciberseguridad y por su tamano, pero la informacion publica disponible es extremadamente limitada: no hay datos de arquitectura, entrenamiento, benchmarks ni detalles de uso mas alla de la model card. El modelo registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 684.489.845.504 (~684,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (declarado en tags); no se detallan otras variantes |
| Idiomas soportados | ingles (en), kurdo (ku) |
| Licencia | MIT |
| Formato de pesos | safetensors (con requisito de `custom_code`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, hibrido u otra), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card unicamente indica que se trata de un nucleo de IA "construido a medida" ("custom-built") orientado a desarrollo full-stack, pentesting y analisis de seguridad, sin aportar detalles tecnicos sobre su diseno.

El unico dato estructural verificable es el recuento de parametros en safetensors (~684,5 mil millones) y la presencia de pesos en fp8. La etiqueta `custom_code` sugiere que la carga del modelo requiere implementaciones propias no incluidas en librerias estandar como transformers, pero no se detalla cual es esa implementacion.

## Capacidades

- Generacion de texto y codigo, segun la model card orientada a "code architecture".
- Soporte declarado para desarrollo full-stack.
- Soporte declarado para pruebas de penetracion (pentesting) y analisis de seguridad.
- Capacidades multilingues limitadas a ingles y kurdo segun los metadatos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Revision de codigo con enfoque en seguridad: el modelo podria emplearse para analizar repositorios y detectar patrones vulnerables (inyeccion SQL, XSS, desbordamientos), dado su enfoque declarado en analisis de seguridad y arquitectura de codigo.
- Asistencia en desarrollo full-stack: generacion y explicacion de codigo backend y frontend en el contexto de un proyecto de aplicacion web, aprovechando su orientacion declarada a "full-stack development".
- Formacion en ciberseguridad: uso como asistente para explicar tecnicas de pentesting y conceptos de seguridad ofensiva en entornos controlados, segun su especializacion declarada.
- Documentacion tecnica bilingue: redaccion de documentacion en ingles y kurdo, los dos idiomas declarados por el modelo.
- Analisis de configuraciones y despliegues: revision de ficheros de infraestructura y configuracion para identificar malas practicas de seguridad.
- Soporte a equipos de investigacion en seguridad: generacion de hipotesis y guiones de prueba en laboratorios de seguridad, siempre con supervision humana.

Nota: estos casos se derivan de la especializacion declarada en la model card; no hay evidencia publicada de rendimiento que los respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~684,5 mil millones de parametros en fp8, se requieren del orden de 685 GB solo para los pesos, mas memoria para el estado de inferencia y el KV cache. No es viable en GPU de consumo.
- GPU recomendadas: se necesitan nodos multi-GPU de clase datacenter (A100 80 GB, H100 80 GB u H200); el numero exacto de GPUs no esta documentado.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: no disponibles; el modelo requiere `custom_code` y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria con datos verificables de rendimiento, contexto o arquitectura para establecer una comparacion rigurosa con OxAi.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay datos de arquitectura, contexto, entrenamiento ni evaluacion, lo que impide validar su calidad.
- Riesgo elevado de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia de fiabilidad.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos.
- Cobertura idiomatica limitada a ingles y kurdo; el castellano no esta declarado como idioma soportado.
- Requisito de `custom_code`: la carga exige codigo personalizado del autor, lo que implica riesgos de seguridad y de mantenimiento en produccion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion por la comunidad.
- Uso en ciberseguridad ofensiva: debe limitarse a entornos autorizados y con supervision, dado el enfoque declarado en pentesting.

## Enlaces

- HuggingFace: https://huggingface.co/fuad404/OxAi
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
