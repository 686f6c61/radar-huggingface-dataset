# jayyun98/Qwen3.8-27B-INT4-EAGLE4

## Resumen

`jayyun98/Qwen3.8-27B-INT4-EAGLE4` es un checkpoint de **decodificacion especulativa** (draft model) basado en la arquitectura EAGLE4, disenado para acelerar la inferencia del modelo objetivo `RedHatAI/Qwen3.8-27B-INT4`. No es un modelo generativo autonomo: es un "borrador" que propone tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia efectiva por token generado. Lo publica el usuario jayyun98, construido con su herramienta Draftfit, y deriva del draft oficial `EAGLE-Corp/Qwen3.8-27B-EAGLE4`.

El checkpoint pesa 3.089.075.200 parametros (unos 3,09 mil millones) en formato safetensors BF16, con un tamano de repositorio de 6,2 GB. La etiqueta "INT4" del nombre se refiere al **modelo objetivo** al que acompana, no a los pesos del draft, que se mantienen en BF16. Conserva la arquitectura, configuracion y factores candidatos aprendidos del EAGLE4 oficial, con tres capas de caracteristicas objetivo (3, 31 y 59), siete propuestas por paso y una cabeza candidata de rango 128 con 128 candidatos.

Su relevancia es practica: permite desplegar Qwen3.8-27B en INT4 con aceleracion especulativa validada. En la evaluacion del autor sobre 24 prompts de confirmacion retenidos, este checkpoint alcanza un 61,30 % de aceptacion (1.229 de 2.005 tokens propuestos) frente al 59,28 % del EAGLE4 oficial (1.220 de 2.058), sobre las mismas trayectorias nativas del objetivo INT4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE4 (draft de decodificacion especulativa) |
| Parametros totales | 3.089.075.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos del draft en BF16; el objetivo emparejado es INT4 |
| Idiomas soportados | no disponible |
| Licencia | Eagle 4 Source-Available License (`other`, license_name: eagle-4) |
| Formato de pesos | safetensors |
| Modelo objetivo | RedHatAI/Qwen3.8-27B-INT4 |
| Modelo base / draft origen | EAGLE-Corp/Qwen3.8-27B-EAGLE4 |
| Capas de caracteristicas objetivo | 3, 31, 59 |
| Propuestas por paso | 7 |
| Cabeza candidata | rango 128; 128 candidatos |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE4 para decodificacion especulativa. Un draft EAGLE predice multiples tokens futuros a partir de las caracteristicas ocultas del modelo objetivo (en este caso, las capas 3, 31 y 59 de Qwen3.8-27B-INT4) y de una cabeza candidata de rango 128 que re-puntua 128 candidatos por posicion. En cada paso propone hasta 7 tokens, que el modelo objetivo verifica en una sola pasada; los aceptados se conservan y el resto se descartan, con un token "bonus" adicional del objetivo. El checkpoint conserva la configuracion oficial y el layout canonico de tensores de EAGLE4.

El entrenamiento se realizo con la herramienta Draftfit del autor sobre el draft oficial EAGLE-Corp, ajustandolo para que coincida con las trayectorias nativas del objetivo INT4 (en lugar de las de un objetivo en mayor precision). No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; para un draft de este tipo el objetivo de entrenamiento es la prediccion de tokens futuros con aceptacion bajo el objetivo emparejado. La evaluacion reportada usa generacion greedy, 64 tokens generados por prompt, propuestas de siete tokens, re-puntuacion con la cabeza candidata y cache KV en FP8.

## Capacidades

- **Decodificacion especulativa**: propone hasta 7 tokens por paso para el objetivo Qwen3.8-27B-INT4, que los verifica en paralelo.
- **Re-puntuacion con cabeza candidata**: 128 candidatos de rango 128 por posicion para mejorar la tasa de aceptacion.
- **Aceleracion de inferencia**: reduce el numero de pasos secuenciales del objetivo, con impacto directo en latencia por token.
- **Compatibilidad con runtime EAGLE4**: se carga en runtimes que implementen el protocolo EAGLE4 y el layout canonico de tensores.
- **Uso con cache KV en FP8**: el protocolo de evaluacion del autor emplea cache KV en FP8, lo que indica compatibilidad con ese modo.
- **No genera texto de forma autonoma**: no es un modelo de chat, codigo ni razonamiento por si mismo; su funcion es exclusivamente acelerar al objetivo.
- **Tool calling, agentes, vision, audio, thinking mode**: no disponibles (no aplica a un draft de este tipo).

## Casos de uso

- **Servicio de chat de baja latencia sobre Qwen3.8-27B-INT4**: desplegar el objetivo en INT4 junto a este draft para reducir el tiempo por token en atencion al cliente o asistentes interactivos, donde la latencia percibida es critica.
- **Inferencia por lotes con restricciones de coste**: en pipelines de generacion masiva (resumenes, clasificacion, extraccion), la decodificacion especulativa reduce el numero de pasos del objetivo y, con ello, el coste computacional por token generado.
- **Despliegue en GPU con memoria limitada**: al mantener el objetivo en INT4 y el draft en BF16 (3,09 mil millones de parametros), el conjunto cabe en aceleradores de gama alta con menos VRAM que una version FP16 del objetivo.
- **Generacion de codigo asistida en IDE o CI/CD**: acelerar la generacion de parches, tests o documentacion tecnica con el objetivo Qwen3.8-27B-INT4, manteniendo la calidad del modelo grande pero con menor latencia interactiva.
- **Prototipado de runtimes de decodificacion especulativa**: usar este checkpoint como referencia para validar implementaciones de EAGLE4, comparando tasas de aceptacion y throughput frente al draft oficial.
- **Investigacion en aceptacion especulativa**: analizar el efecto de ajustar el draft a las trayectorias nativas del objetivo cuantizado, replicando el protocolo de evaluacion del autor (24 prompts, 64 tokens, greedy, FP8 KV).
- **Servicios RAG con contexto largo**: combinar el objetivo Qwen3.8-27B-INT4 con este draft en flujos de recuperacion aumentada donde se generan respuestas largas y la latencia acumulada importa.

## Benchmarks y rendimiento

Los unicos datos publicados son los de aceptacion del draft sobre 24 prompts de confirmacion retenidos, separados de la seleccion del checkpoint:

| Draft | Aceptados / propuestos | Tasa de aceptacion |
|---|---:|---:|
| EAGLE4 oficial | 1.220 / 2.058 | 59,28 % |
| Este checkpoint | 1.229 / 2.005 | 61,30 % |

Protocolo: mismas trayectorias nativas del objetivo INT4, generacion greedy, 64 tokens generados por prompt, propuestas de 7 tokens, re-puntuacion con cabeza candidata y cache KV en FP8. La aceptacion cuenta tokens del draft aceptados sobre propuestos, excluyendo tokens bonus del objetivo. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no genera de forma autonoma.

## Requisitos de hardware

- **VRAM del draft**: 3,09 mil millones de parametros en BF16, aproximadamente 6,2 GB solo para pesos; con overhead de runtime, cache KV y buffers del objetivo, el conjunto requiere bastante mas.
- **VRAM del objetivo**: Qwen3.8-27B en INT4 ocupa aproximadamente 14-16 GB solo en pesos (estimacion segun 27B a 4 bits); sumado al draft, el total ronda los 22-25 GB mas cache KV.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta ultima al limite, dependiendo de la longitud de contexto y del tamano de lote).
- **Consumer GPU**: posible en RTX 4090 24 GB con contexto corto y lotes pequenos; en GPUs de 16 GB o menos no cabe el conjunto completo.
- **Opciones de despliegue**: runtimes compatibles con EAGLE4 y el layout canonico de tensores; no se indica soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles de forma absoluta; la mejora esperada es proporcional a la tasa de aceptacion (61,30 % en la evaluacion del autor), que reduce el numero de pasos del objetivo por token generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceptacion reportada | Licencia |
|---|---|---:|---|---:|---|
| Este checkpoint (jayyun98) | Draft EAGLE4 para Qwen3.8-27B-INT4 | 3,09 B | no disponible | 61,30 % | Eagle 4 Source-Available |
| EAGLE-Corp/Qwen3.8-27B-EAGLE4 | Draft EAGLE4 oficial | no disponible | no disponible | 59,28 % | Eagle 4 Source-Available |
| RedHatAI/Qwen3.8-27B-INT4 | Objetivo (modelo generativo) | ~27 B | no disponible | no aplica | no disponible |

La comparativa se limita a los tres componentes del mismo ecosistema; no se dispone de datos de otros drafts EAGLE4 para Qwen3.8-27B ni de alternativas de decodificacion especulativa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo autonomo**: no debe usarse para generar texto, razonar o responder directamente; solo funciona emparejado con RedHatAI/Qwen3.8-27B-INT4 en un runtime compatible con EAGLE4.
- **Acoplamiento estricto al objetivo**: el draft esta ajustado a las trayectorias del objetivo INT4; emparejarlo con otro modelo o con otra cuantizacion puede degradar la tasa de aceptacion.
- **Evaluacion limitada**: los resultados provienen de 24 prompts de confirmacion con 64 tokens generados por prompt y generacion greedy; no cubren contextos largos, muestreo ni dominios diversos.
- **Licencia restrictiva**: la Eagle 4 Source-Available License no es una licencia open source permisiva; el uso comercial, la redistribucion y el hosting estan sujetos a sus terminos. Revisar LICENSE, NOTICE, TRADEMARKS.md y MODIFICATIONS.md antes de cualquier despliegue.
- **Proyecto no oficial**: no es un proyecto oficial de Eagle AI Corp; el autor lo declara derivado de su tecnologia, con posibles implicaciones de soporte y mantenimiento.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa del checkpoint.
- **Sesgos y alucinacion**: heredados del modelo objetivo Qwen3.8-27B-INT4; el draft no los corrige ni los amplifica de forma significativa, pero tampoco los mitiga.
- **Idiomas y contexto**: no disponibles en la informacion proporcionada; dependen del objetivo emparejado.
- **Sin benchmarks de calidad**: no hay datos de MMLU, HumanEval o GSM8K para este checkpoint, y no tendria sentido medirlos sin el objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/jayyun98/Qwen3.8-27B-INT4-EAGLE4
- Modelo base (draft origen): https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Modelo objetivo: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Herramienta Draftfit: https://github.com/JayYun98/Draftfit
- Licencia EAGLE-4: https://github.com/eagle-hq/EAGLE-4/blob/main/LICENSE
- Evaluacion: `evaluation.json` en el repositorio
- Comparacion pareada: `evidence/paired-comparison.json` en el repositorio
