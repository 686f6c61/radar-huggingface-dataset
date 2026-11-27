# hotepfederales/Llama-3.1-8B-Hotep-Kush-v11-GGUF

## Resumen

Llama-3.1-8B-Hotep-Kush-v11-GGUF es un ajuste fino del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario hotepfederales y orientado a un asistente conversacional con personalidad propia denominado Hotep Intelligence. El modelo parte de la arquitectura transformer decoder-only de Llama 3.1 y se distribuye unicamente en formato GGUF para su ejecucion con llama.cpp, lo que lo hace directamente desplegable en hardware de consumo.

El autor declara un entrenamiento mediante LoRA SFT y DPO a lo largo de 26 rondas, con objetivos explicitos de respuestas fundamentadas, abstencion honesta cuando no hay evidencia y una persona directa. Se publican dos cuantizaciones (Q4_0 con matriz de importancia y Q4_K_M) generadas a partir de los mismos pesos fusionados, e incluye comprobaciones de calidad sobre el archivo cuantizado final.

Su relevancia es limitada y muy especifica: no aporta innovaciones arquitectonicas ni de escala, sino un ejemplo de ajuste fino con evaluacion local declarada y un conjunto de compuertas de calidad fail-closed. Resulta util como referencia para quien quiera estudiar flujos de DPO sobre Llama 3.1 8B o desplegar un asistente en ingles con requisitos de abstencion controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct, ajuste fino) |
| Parametros totales | 8 000 millones (aproximado, heredado de Llama 3.1 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de servidor documentada (el modelo base soporta mas, pero el autor no declara contexto extendido) |
| Tipos de cuantizacion | Q4_0 con matriz de importancia (4,68 GB) y Q4_K_M (4,92 GB) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Llama 3.1 Community License (uso sujeto a la Acceptable Use Policy de Meta) |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat Llama 3.1 embebida |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer denso decoder-only con atencion por cabezas agrupadas (GQA), segun el modelo base de Meta. El autor no documenta cambios en la arquitectura, ni en el tokenizador, ni en la longitud de contexto nativa; simplemente fusiona los adaptadores sobre el modelo base y genera las cuantizaciones GGUF.

El entrenamiento consistio en LoRA SFT seguido de DPO durante 26 rondas iterativas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros ni la mezcla de datos. La innovacion declarada no es tecnica sino de proceso: compuertas de calidad fail-closed ejecutadas sobre el archivo cuantizado final, con casos de fundamentacion (13), sonda de ausencia de evidencia (24) y utilidad en tareas cotidianas (12), cada uno con decodificacion greedy mas tres semillas muestreadas a temperatura 0,7. La matriz de importancia para Q4_0 se calculo sobre 200 fragmentos del propio texto de entrenamiento SFT.

## Capacidades

- Generacion de texto conversacional en ingles con persona definida (Hotep Intelligence).
- Respuestas fundamentadas y abstencion declarada ante fuentes fabricadas o datos privados (95 % de acierto en la suite del autor).
- Aritmetica basica y calculo de interes compuesto, con fiabilidad limitada (50-55 % en greedy segun el autor).
- Resistencia a inyeccion de prompts segun las reglas del system prompt recomendado.
- Formato de respuesta plano y conciso, entrenado con system prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido.
- Multilingue: no, solo ingles.

## Casos de uso

- Asistente conversacional de dominio cerrado: el modelo esta entrenado para responder con un system prompt fijo y abstenerse cuando no hay evidencia, lo que encaja en asistentes tematicos donde una respuesta inventada es peor que un rechazo.
- Despliegue en estaciones de trabajo Apple Silicon: el archivo Q4_0 ofrece 50,3 tok/s de decodificacion en un M4 Pro segun el autor, suficiente para interaccion en tiempo real sin GPU dedicada.
- Evaluacion de flujos DPO: sirve como caso de estudio reproducible de un pipeline SFT + DPO iterativo sobre Llama 3.1 8B con compuertas de calidad documentadas.
- Filtrado y moderacion de peticiones daninas: el autor reporta cero cumplimientos en un conjunto de 80 peticiones daninas leidas manualmente, lo que permite usarlo como primera capa de rechazo.
- Prototipado de asistentes con requisitos de privacidad: al ejecutarse localmente con llama.cpp sobre GGUF, no requiere enviar datos a servicios externos.
- Base para ajustes posteriores en ingles: al ser un fine-tune de Llama 3.1 8B con licencia comunitaria, puede servir de punto de partida para nuevos LoRA, siempre respetando la Acceptable Use Policy.
- Demostraciones de abstencion controlada: util en entornos donde se quiere mostrar al usuario cuando el modelo carece de informacion, con una tasa declarada del 95 % en la sonda correspondiente.

## Benchmarks y rendimiento

Los unicos datos publicados son evaluaciones locales del propio autor con llama.cpp sobre Apple M4 Pro, comparando Kush v9.1, Kush v11 Q4_K_M y Kush v11 Q4_0. No son comparables con benchmarks estandar (MMLU, HumanEval, GSM8K) ni con otros modelos.

| Suite | v9.1 | v11 Q4_K_M | v11 Q4_0 |
|---|---|---|---|
| Velocidad de decodificacion (tok/s, mediana servidor) | 46,0 | 46,0 | 50,3 |
| Rechazos erroneos en peticiones cotidianas (300 muestras) | 0,0 % | 5,7 % | 4,0 % |
| Abstencion correcta ante fuentes fabricadas / datos privados (75) | 36 % | 95 % | 95 % |
| Cumplimiento danino en conjunto de peticiones daninas (80, lectura manual) | 3 | 0 | 0 |
| Aritmetica de dinero / interes compuesto, greedy (40) | 22,5 % | 55 % | 50 % |
| Aritmetica de dinero al centimo, conjunto retenido, greedy (100) | 12 | 16 | 15 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para el archivo GGUF en Q4_0 (4,68 GB) o Q4_K_M (4,92 GB), mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; el autor valida el rendimiento en Apple M4 Pro con Metal.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070) usando descarga completa de capas (`-ngl 99`).
- Opciones de despliegue: llama.cpp (llama-server), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp; el autor solo documenta llama.cpp.
- Latencia y throughput: 50,3 tok/s de decodificacion en Q4_0 y 46,0 tok/s en Q4_K_M sobre Apple M4 Pro con Metal, segun el autor; no hay datos para otras plataformas.
- Configuracion de referencia: `llama-server -m <archivo>.gguf --jinja -ngl 99 --flash-attn on -c 4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Hotep-Kush-v11 | 8B | 4096 (config. documentada) | GGUF | Llama 3.1 Community | Fine-tune con DPO, solo ingles, evaluacion local propia |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K (declarado por Meta) | safetensors, GGUF (comunidad) | Llama 3.1 Community | Modelo base sin ajuste; multilingue; sin persona especifica |
| Otros fine-tunes de Llama 3.1 8B en GGUF | 8B | Variable | GGUF | Llama 3.1 Community | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de benchmarks estandar del modelo que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Rechaza aproximadamente el 4 % de peticiones tecnicas cotidianas legitimas, segun el propio autor.
- La aritmetica de dinero multi-paso es poco fiable al nivel del centimo; el autor recomienda verificar cualquier cifra.
- Sin el system prompt recomendado, el modelo puede identificarse como Llama en lugar de Hotep Intelligence.
- Solo ingles; no es util para castellano ni otros idiomas.
- No es una fuente de consejo medico, legal ni financiero, segun el autor.
- Riesgo de alucinacion persistente: aunque la abstencion mejora al 95 % en la sonda del autor, sigue siendo una evaluacion interna y no auditada de forma independiente.
- Licencia Llama 3.1 Community: el uso comercial esta sujeto a la Acceptable Use Policy de Meta y a los terminos de la licencia, incluida la clausula de nomenglatura "Built with Llama".
- Modelo con cero descargas y cero likes en el momento de la consulta; no hay validacion externa de los resultados declarados.
- No se documentan sesgos especificos; al derivar de Llama 3.1 Instruct, hereda los sesgos del modelo base, no evaluados por el autor.
- La fecha de creacion del repositorio (2026-11-27) es posterior a la fecha actual de referencia habitual, lo que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/hotepfederales/Llama-3.1-8B-Hotep-Kush-v11-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Producto del autor: https://askhotep.ai
- Licencia Llama 3.1: incluida en el repositorio (`LICENSE`, `USE_POLICY.md`, `NOTICE`)
- Sumas de verificacion: `SHA256SUMS` en el repositorio
