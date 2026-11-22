# reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF

## Resumen

Qwen3.5-2B-CyberSec-GGUF es una distribucion en formato GGUF del checkpoint Qwen3.5-2B-CyberSec, un ajuste fino orientado a ciberseguridad del modelo base Qwen3.5-2B. Lo publica el usuario reaperdoesntknow dentro de su coleccion CIx de modelos de seguridad, y su proposito es permitir inferencia local en CPU o GPU de consumo mediante llama.cpp y runtimes compatibles (Ollama, entre otros). El modelo resuelve el problema de desplegar un asistente conversacional especializado en dominios de seguridad sin depender de infraestructura en la nube.

El modelo cuenta con 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y deriva de un ajuste fino sobre el checkpoint unsloth/Qwen3.5-2B, entrenado con el Trendyol Cybersecurity Instruction Tuning Dataset. La release GGUF incluye cuatro artefactos: BF16, Q8_0, Q4_K_M y un proyector multimodal BF16-mmproj, aunque el propio autor advierte que no hay pruebas documentadas de funcionamiento multimodal.

Es relevante ahora porque ofrece una via de bajo coste para experimentar con un modelo de ~2B especializado en ciberseguridad en hardware modesto, con licencia Apache-2.0 y compatibilidad con el ecosistema llama.cpp. No obstante, no se han publicado benchmarks, informes de regresion ni evaluaciones de seguridad, por lo que debe tratarse como material de evaluacion cualitativa y no como componente de produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles de capas y atencion no disponibles) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (archivos GGUF publicados); BF16-mmproj para proyector multimodal |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 8,0 GB |
| Modelo base | reaperdoesntknow/Qwen3.5-2B-CyberSec (upstream: unsloth/Qwen3.5-2B) |
| Dataset de ajuste | Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset |
| Descargas | 7.450 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer de aproximadamente 1,94 mil millones de parametros. El checkpoint ha pasado por un ajuste fino supervisado (instruction tuning) sobre el Trendyol Cybersecurity Instruction Tuning Dataset, un conjunto orientado a instrucciones de ciberseguridad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado.

La release GGUF no aporta innovaciones tecnicas propias: es una conversion de pesos para inferencia local con llama.cpp. El autor menciona que la configuracion del modelo fuente incluye componentes de vision y que se incluye un proyector BF16-mmproj, pero advierte explicitamente que no hay una prueba documentada de funcionamiento multimodal, por lo que la capacidad de vision no debe darse por confirmada sin verificacion previa.

## Capacidades

- Generacion de texto conversacional en formato instruccion, orientada a dominios de ciberseguridad.
- Respuesta a preguntas tecnicas sobre seguridad segun el dataset de ajuste (Trendyol Cybersecurity Instruction Tuning Dataset).
- Ejecucion local en CPU y GPU de consumo mediante llama.cpp y Ollama.
- Compatibilidad con el flag `--jinja` de llama.cpp para plantillas de chat.
- Presunto soporte multimodal por la presencia del proyector BF16-mmproj y los componentes de vision en la configuracion fuente, pero sin verificacion documentada; no debe asumirse operativo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking explicito: no disponible (no documentado).

## Casos de uso

- Evaluacion cualitativa local del checkpoint: comparar las salidas de BF16, Q8_0 y Q4_K_M sobre el mismo conjunto de prompts de seguridad para estimar la perdida de calidad por cuantizacion, usando llama.cpp en una maquina de sobremesa.
- Laboratorio de formacion en ciberseguridad: generar explicaciones de conceptos (por ejemplo, vectores de ataque, hardening de sistemas) para que un instructor las revise y adapte, aprovechando que el modelo corre en hardware de bajo coste.
- Asistente de documentacion interna de seguridad: redactar borradores de politicas, checklists o resumenes de procedimientos que un analista revisa antes de publicar, con el modelo ejecutandose en local para no exponer datos.
- Prototipado de triaje de alertas: clasificar y resumir descripciones textuales de incidentes en un pipeline de pruebas, siempre con revision humana y sin conceder al modelo autoridad de decision.
- Analisis de configuraciones y scripts en entorno aislado: pedir al modelo que explique o comente fragmentos de configuracion y que senale posibles riesgos, ejecutando cualquier comando sugerido solo en una sandbox revisada manualmente.
- Base para experimentos de ajuste fino adicional: partir de este checkpoint cuantizado o de su fuente para tareas mas especificas (por ejemplo, un subdominio concreto de seguridad), dado su tamano reducido y su licencia Apache-2.0.
- Demo educativa de despliegue local: mostrar en un taller como servir un modelo especializado con Ollama (`ollama run hf.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF:Q4_K_M`) en un portatil sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la release no incluye informes de benchmark, regresion ni evaluacion de seguridad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun el archivo publicado:
  - BF16: 3,90 GB de pesos; requiere aproximadamente 4,5-5 GB de memoria considerando overhead de contexto y runtime.
  - Q8_0: 2,08 GB de pesos; requiere aproximadamente 2,5-3 GB.
  - Q4_K_M: 1,31 GB de pesos; requiere aproximadamente 1,8-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050); 6-8 GB para Q8_0 (RTX 3060, RTX 4060); 8 GB o mas para BF16 (RTX 3070, RTX 4060 Ti).
- Cabe en GPU de consumo: si, en todas las cuantizaciones publicadas; Q4_K_M es el punto de partida recomendado por el autor.
- Despliegue en CPU: viable gracias al tamano reducido; Q4_K_M puede ejecutarse en portatiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte especifico para vLLM o TGI en esta release.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec-GGUF (este) | ~1,94 B | No disponible | Ciberseguridad (instruction tuning) | Apache-2.0 | GGUF |
| unsloth/Qwen3.5-2B (upstream base) | ~1,94 B (segun modelo fuente) | No disponible | Generalista | No disponible en la informacion | No disponible en la informacion |
| reaperdoesntknow/Qwen3.5-2B-CyberSec (checkpoint fuente) | ~1,94 B | No disponible | Ciberseguridad | Apache-2.0 | Safetensors (presumible, no confirmado) |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria, por lo que la comparativa se limita a parametros, licencia y formato. No se han identificado en la informacion proporcionada otros modelos especializados en ciberseguridad de tamano comparable con datos verificables.

## Limitaciones y advertencias

- No hay benchmarks, informes de regresion ni evaluaciones de seguridad publicados para esta release; el rendimiento real es desconocido.
- La cuantizacion puede alterar la calidad y el comportamiento respecto al checkpoint fuente; las diferencias entre BF16, Q8_0 y Q4_K_M no estan medidas.
- Riesgo de alucinacion en un dominio de alto impacto: las instrucciones de seguridad generadas pueden ser incorrectas, inseguras o de doble uso.
- No ejecutar comandos generados por el modelo sin revision humana y aislamiento (sandbox, contenedor, entorno sin red).
- No usar el modelo como control de seguridad autoritativo ni como tomador de decisiones en produccion.
- La capacidad multimodal no esta verificada: el proyector BF16-mmproj esta presente, pero el autor no documenta prueba de funcionamiento; hay que validar proyector, formato de prompt, version de runtime y ruta de imagen antes de afirmar soporte.
- Idiomas soportados no declarados; el comportamiento fuera del ingles (idioma presumible del dataset) no esta garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Sesgos conocidos: no documentados; el ajuste sobre un dataset unico de ciberseguridad puede estrechar el dominio y degradar el rendimiento generalista.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el uso de contenido de seguridad generado recae en el integrador.
- El modelo tiene solo 1 like y 7.450 descargas; es un artefacto de la comunidad sin validacion externa amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Checkpoint fuente: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Modelo base upstream: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx de modelos de ciberseguridad: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
