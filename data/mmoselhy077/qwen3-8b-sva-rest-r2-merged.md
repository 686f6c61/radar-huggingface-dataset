# mmoselhy077/qwen3-8b-sva-rest-r2-merged

## Resumen

qwen3-8b-sva-rest-r2-merged es un ajuste fino del modelo Qwen/Qwen3-8B desarrollado por el usuario mmoselhy077, especializado en la generacion de aserciones SystemVerilog (SVA) a partir de descripciones en lenguaje natural. El modelo transforma una especificacion funcional escrita en ingles en una propiedad SVA sintacticamente valida, razonando previamente dentro de un bloque `<think>` antes de emitir la asercion final. Es el miembro mas capaz de una pequena familia de modelos SVA publicada por el mismo autor.

El modelo resuelve un problema concreto del flujo de verificacion de hardware: la redaccion manual de aserciones SVA para verificación formal o basada en simulacion es lenta y propensa a errores. Con 8.190.735.360 parametros y pesos completos fusionados (no un adaptador LoRA), hereda la arquitectura transformer decoder-only de Qwen3-8B y su ventana de contexto, y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en el metodo de entrenamiento: no se limita a SFT, sino que aplica dos rondas de ReST (Rejection Sampling Fine-Tuning) filtrando candidatos mediante equivalencia formal con `qverify` de Questa. El autor declara un 84,8 % de pass@5 por equivalencia formal en FVEval-Verified, aunque advierte explicitamente de que ese numero es un techo oracle y de que el modelo no debe usarse en modo single-shot sin verificacion formal posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B); no se detalla mas en la informacion disponible |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor indica uso en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de unos 8,19 mil millones de parametros con soporte nativo de modo de razonamiento (`enable_thinking`). El ajuste fino se realizo con LoRA de rango 64 y alpha 128 durante 2 epocas sobre la union de los conjuntos de datos, y posteriormente los adaptadores se fusionaron en los pesos base, dando lugar a un checkpoint completo. La model card deja como pendiente la documentacion de la tasa de aprendizaje, el tamano de batch, la longitud maxima de secuencia, el hardware y el tiempo de entrenamiento.

El pipeline de datos tiene tres etapas. Primero, un SFT sobre 839 ejemplos curados de NL a SVA (`sva-abl839-corpus`). Segundo, una ronda de ReST en la que el modelo SFT genera K=20 respuestas por prompt sintetico de DUT y se conservan unicamente las que `qverify` demuestra formalmente equivalentes a la referencia (317 ejemplos, `sva-rest-r1-synthetic`). Tercero, una segunda ronda de ReST con prompts de estilo humano escritos contra RTL real de OpenTitan, CVA6, NVDLA, Ibex, PicoRV32 y SERV, filtrados con el mismo criterio formal (117 ejemplos, sobremuestreados x3, `sva-rest-r2-humanlike`). La innovacion principal es ese filtrado por equivalencia formal bidireccional (miter) en lugar de por coincidencia textual, lo que penaliza las aserciones vacuamente ciertas.

## Capacidades

- Generacion de aserciones SystemVerilog (SVA) a partir de descripciones en lenguaje natural, con razonamiento previo en bloque `<think>`.
- Generacion de texto conversacional en ingles mediante plantilla de chat de Qwen3.
- Razonamiento explicito configurable (`enable_thinking=True` en la plantilla de chat).
- Soporte de muestreo multiple para generar varios candidatos por prompt (el flujo recomendado es pass@5 con verificacion).
- Capacidades heredadas de Qwen3-8B (codigo, matematicas, multilingue) presentes en los pesos base, aunque no evaluadas ni validadas por el autor para este ajuste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Dominio funcional limitado a propiedades individuales en ingles; no se documentan bind files, checker files ni propiedades de liveness.

## Casos de uso

- Redaccion asistida de aserciones para verificacion formal: el modelo propone candidatos SVA a partir de la especificacion textual y el ingeniero los valida con una herramienta formal como `qverify` o JasperGold antes de incorporarlos al entorno de verificacion.
- Generacion de candidatos en bucle con verificacion automatica: dado que el pass@5 (84,8 %) supera ampliamente al pass@1 (aprox. 45-63 %), el modelo encaja en un pipeline que muestrea N aserciones y descarta las que no pasan el miter bidireccional.
- Aumento de cobertura en bloques RTL existentes: a partir de la descripcion funcional de un modulo (por ejemplo, un periferico de OpenTitan o un core RISC-V como Ibex), generar propiedades de temporizacion del tipo "req debe concederse en 3 ciclos" para complementar las aserciones escritas a mano.
- Formacion y revision de ingenieros de verificacion: el bloque de razonamiento `<think>` permite inspeccionar como el modelo interpreta la especificacion, util para detectar ambiguedades en el documento de requisitos antes de escribir la propiedad definitiva.
- Prototipado rapido en entornos EDA con recursos limitados: con ~17 GB de VRAM en bf16 cabe en una GPU de 24 GB o superior, lo que permite desplegarlo en estaciones de trabajo de verificacion sin infraestructura dedicada.
- Generacion de propiedades para especificaciones redactadas por maquina: el modelo rinde especialmente bien en el split machine (90,5 % pass@5), por lo que es adecuado cuando las descripciones provienen de herramientas de sintesis de especificaciones o de documentacion estructurada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre FVEval-Verified, 356 problemas (73 humanos, 283 generados por maquina). Un ejemplo se considera correcto solo si es formalmente equivalente a la asercion de referencia, comprobado con un miter bidireccional en `qverify` de Questa.

| Metrica | Global | Split humano | Split maquina |
|---|---:|---:|---:|
| Equivalencia pass@5 | 84,8 % | 63,0 % | 90,5 % |
| Equivalencia pass@1 (aprox.) | no disponible | ~45 % | ~63 % |

Comparacion dentro de la familia SVA del mismo autor:

| Modelo | Equiv@5 | Humano | Maquina | Notas |
|---|---:|---:|---:|---|
| rest-r2 (este) | 84,8 % | 63,0 % | 90,5 % | Recomendado |
| abl839 LoRA | 81,2 % | 63,0 % | 85,9 % | Baseline SFT, adaptador de 698 MB |

Advertencias del propio autor sobre estas cifras: pass@5 es un techo oracle que asume la capacidad de elegir la muestra correcta; el selector sin referencia del autor no supera al azar, por lo que en la practica se necesita una comprobacion formal. El split humano es pequeno (n=73, aproximadamente ±11 puntos porcentuales), por lo que las diferencias entre miembros de la familia son cercanas al ruido. No deben usarse las tasas de "proven" para comparar modelos: el arnes conto pruebas vacuas, y la tasa real de prueba no vacua es de aproximadamente 8-11 % para todos los modelos de la familia.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB en bfloat16 segun el autor; el repo completo ocupa 16,4 GB en safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16. Cabe en GPU de consumo de 24 GB; en tarjetas de 16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"` es el metodo documentado; el tag `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con TGI y con Inference Endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp ni Ollama.
- Parametros de generacion sugeridos por el autor: `max_new_tokens=8192`, `do_sample=True`, `temperature=0.2`. Las trazas de razonamiento pueden ser largas, por lo que conviene dejar un limite alto de tokens nuevos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NL a SVA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-sva-rest-r2-merged | 8,19 B | no disponible | 84,8 % equiv@5 en FVEval-Verified | Apache-2.0 | Hugging Face |
| qwen3-8b-sva-thinking-abl839-lora | 8,19 B (base) + LoRA | no disponible | 81,2 % equiv@5 en FVEval-Verified | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | no evaluado en la informacion disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos de generacion de SVA ajenos a esta familia en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en tareas NL a SVA de propiedad unica y en ingles; especificaciones multi-propiedad, liveness bajo restricciones de fairness y ficheros bind o checker no estan probados.
- Las mejoras se concentran casi por completo en especificaciones escritas por maquina; las escritas por humanos siguen siendo el caso dificil (63,0 % pass@5).
- Las salidas pueden ser sintacticamente validas pero semanticamente incorrectas o vacuamente ciertas; el autor exige verificacion formal siempre.
- El modo single-shot no es un uso previsto: el pass@1 ronda el 45 % en especificaciones humanas y el 63 % en las de maquina.
- El selector sin referencia del autor no supera al azar, por lo que el pass@5 no es alcanzable sin una herramienta formal en el bucle.
- Las cifras de benchmark son declaradas por el autor y no estan verificadas de forma independiente (`verified: false` en el model-index).
- Idioma limitado al ingles; no se documentan capacidades multilingues validadas para este ajuste.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-8B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmoselhy077/qwen3-8b-sva-rest-r2-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Miembro anterior de la familia (LoRA SFT): https://huggingface.co/mmoselhy077/qwen3-8b-sva-thinking-abl839-lora
- Dataset SFT: https://huggingface.co/datasets/mmoselhy077/sva-abl839-corpus
- Dataset ReST ronda 1: https://huggingface.co/datasets/mmoselhy077/sva-rest-r1-synthetic
- Dataset ReST ronda 2: https://huggingface.co/datasets/mmoselhy077/sva-rest-r2-humanlike
