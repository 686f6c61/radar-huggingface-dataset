# musatur/Alpona-1.0-27B

## Resumen

Alpona 1.0 · 27B es un modelo de lenguaje especializado en la generación de RTL (Register Transfer Level) a partir de especificaciones escritas en inglés. Lo desarrolla el equipo del proyecto EOI 122, con financiación de una beca BIRDI dentro del programa SICIP, bajo el proyecto "LLM-Guided RTL Design and Verification". El modelo produce módulos Verilog/SystemVerilog sintetizables y añade una capa de verificación automática sobre la generación: no se limita a escribir código, sino que deriva un modelo de comportamiento de la especificación, redacta su propio testbench y repara el diseño usando la salida real de compilador y simulador.

Técnicamente se construye sobre Qwen/Qwen3.8-27B y se distribuye como `Qwen3_5ForConditionalGeneration` con 27.781.427.952 parámetros en BF16 (55,6 GB repartidos en 18 shards de safetensors). La longitud de contexto es de 262.144 tokens, lo que permite introducir especificaciones extensas, tablas de verdad y trazas de simulación dentro de una misma ventana. La licencia es Apache-2.0.

Su relevancia actual reside en el enfoque de "generate, check and repair": el pipeline de cinco etapas (draft, derive, pre-compile, testbench, repair) integra Icarus Verilog como herramienta externa y convierte el feedback del compilador y del simulador en señal de corrección. Es un modelo de nicho, orientado a ingeniería de hardware y a investigación sobre generación y verificación de RTL, no a conversación general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (`Qwen3_5ForConditionalGeneration`), base Qwen/Qwen3.8-27B |
| Parámetros totales | 27.781.427.952 (27,78B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (entrada de especificación en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards, BF16), más tokenizer, chat template y processor |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen/Qwen3.8-27B, con 27,78B parámetros en BF16. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. La etiqueta `image-text-to-text` y la presencia de ficheros de processor sugieren que la arquitectura base admite entradas multimodales, aunque el uso evaluado y documentado por el autor es exclusivamente la generación de RTL a partir de texto.

La innovación principal no está en el transformer sino en la capa de inferencia: `pipeline_alpona.py` y `alpona_stages.py` implementan cinco etapas. La etapa 1 hace una generación ordinaria que se conserva como control. La etapa 2 obliga al modelo a escribir un modelo de comportamiento explícito (tabla de verdad o ecuaciones, tabla de estados, temporización ciclo a ciclo y casos límite) antes de que exista ningún test. La etapa 3 elabora el borrador con Icarus Verilog y corrige errores de compilación hasta `rounds` intentos (por defecto 3). La etapa 4 genera un testbench auto-verificable a partir del modelo de comportamiento, no de la prosa, hasta `tb_tries` intentos (por defecto 2). La etapa 5 compila y simula contra ese testbench y repara con la salida real de compilador y simulador; si el testbench nunca pasa, devuelve el último módulo que compiló, no una edición no probada. El pipeline nunca ve una implementación de referencia ni un testbench de benchmark.

## Capacidades

- Generación de módulos Verilog/SystemVerilog sintetizables a partir de especificaciones en inglés.
- Derivación de modelos de comportamiento: tablas de verdad, ecuaciones, tablas de estados, temporización ciclo a ciclo y casos límite.
- Escritura de testbenches auto-verificables a partir del modelo de comportamiento derivado.
- Reparación iterativa de diseños usando errores reales de compilación (elaboración) y de simulación de Icarus Verilog.
- Salida estructurada con trazabilidad: `rtl`, `draft_rtl`, `behavioural_model`, `testbench`, `outcome` y `stage_log`.
- Estados de resultado explícitos: `tb_satisfied`, `rounds_exhausted`, `repair_produced_nothing`, `no_usable_testbench`, `no_toolchain`.
- Integración con Hugging Face `transformers` mediante `pipeline("alpona-rtl", ...)` con `trust_remote_code=True`.
- Servicio HTTP mediante `serve_vllm.py` sobre vLLM, con endpoint `/rtl`.
- Capacidades de tool calling, agentes multi-paso, visión, audio o modo thinking: no disponibles en la documentación del modelo.

## Casos de uso

- Generación de módulos RTL para prototipado rápido: un ingeniero escribe la especificación de un contador, registro o máquina de estados y el pipeline devuelve un módulo compilado y simulado contra un testbench derivado de la propia especificación, lo que reduce el tiempo hasta el primer diseño funcional.
- Asistencia a diseñadores RTL en tareas repetitivas: generación de bloques auxiliares (decodificadores, arbitraje, temporizadores, registros de desplazamiento) que después se revisan y se integran manualmente en el diseño principal.
- Docencia de diseño digital: el par `behavioural_model` y `testbench` generados sirven como material didáctico para explicar la relación entre especificación, tabla de verdad, temporización y verificación, con la salvedad de que deben revisarse por un docente.
- Investigación en generación y verificación de RTL: el pipeline expone `draft_rtl`, `stage_log` y `outcome`, lo que permite medir por separado la calidad del borrador, la eficacia de la reparación y la tasa de satisfacción del testbench en experimentos reproducibles.
- Integración en flujos EDA automatizados: el servidor vLLM con endpoint `/rtl` permite conectar la generación a scripts de linting, síntesis o simulación posteriores dentro de un pipeline de CI interno, siempre con revisión humana antes de la fabricación.
- Generación de testbenches de partida: incluso cuando el módulo final se descarta, el testbench auto-verificable derivado del modelo de comportamiento puede reutilizarse como punto de partida para la verificación de un diseño escrito a mano.
- Exploración de alternativas de diseño: ejecutar el pipeline con distintos valores de `rounds` y `tb_tries` sobre la misma especificación para comparar variantes de implementación y su coste de reparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 56 GB para los pesos, más espacio para la caché KV; el autor indica una GPU de 80 GB o dos GPU de 40 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU de 40 GB con `device_map="auto"`.
- No cabe en GPU de consumo de 24 GB en BF16; no se documentan cuantizaciones alternativas (GGUF, AWQ, GPTQ) en la información disponible.
- Despliegue: `transformers` (versión >= 5.14.1) con `pipeline("alpona-rtl", ...)`, `accelerate` y `torch`; servicio HTTP con vLLM mediante `serve_vllm.py` y tensor parallelism (`--tp 2`).
- Dependencia externa obligatoria: Icarus Verilog en el `PATH` (o ruta explícita vía `iverilog="/path/to/iverilog"`) para las etapas 3 a 5; sin él, el resultado es `outcome = "no_toolchain"` y el módulo se devuelve sin comprobar. Icarus Verilog es GPL-2.0 y no se incluye en el repositorio.
- Latencia y throughput: no disponibles. Cabe esperar un coste multiplicado por el número de etapas e intentos (`rounds=3`, `tb_tries=2` por defecto), ya que cada etapa implica generaciones adicionales y ejecuciones de compilador y simulador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpona 1.0 · 27B | 27,78B | 262.144 | RTL con pipeline de verificación y reparación sobre Icarus Verilog | Apache-2.0 | Hugging Face (`musatur/Alpona-1.0-27B`) |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| Alternativas especializadas en RTL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las etapas de comprobación y reparación dependen de que Icarus Verilog esté instalado; sin la herramienta, el módulo se devuelve sin verificar y el resultado lo indica con `no_toolchain`.
- El mismo modelo escribe el módulo y el testbench, por lo que ambos pueden compartir una misma mala interpretación de la especificación; el testbench propio no constituye verificación de sign-off.
- Todo módulo generado debe revisarse y verificarse por un ingeniero (simulación contra un testbench independiente, linting, síntesis) antes de usarse en hardware real.
- Uso fuera de alcance declarado: hardware de seguridad crítica (médico, automotriz, aeroespacial) sin revisión humana, y tareas generales de chat, imagen o vídeo.
- El modelo fue evaluado únicamente en generación de RTL; no hay evidencia documentada de su comportamiento en otras tareas.
- Idiomas: solo se documenta inglés como entrada; no se garantiza el comportamiento con especificaciones en castellano u otros idiomas.
- El servidor `serve_vllm.py` escucha en todas las interfaces de red y no tiene autenticación; debe ejecutarse solo en redes de confianza.
- Riesgo de alucinación en la interpretación de la especificación y en la derivación del modelo de comportamiento: una tabla de verdad incorrecta propaga el error al diseño y al testbench.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de Icarus Verilog (GPL-2.0) debe evaluarse por separado si se redistribuye.
- El repositorio tiene un volumen de descargas muy bajo (19 descargas, 1 like en el momento de la consulta), lo que limita la evidencia comunitaria sobre su robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musatur/Alpona-1.0-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código: no disponible como enlace independiente; el código (`pipeline_alpona.py`, `alpona_stages.py`, `serve_vllm.py`, `requirements.txt`) se distribuye dentro del repositorio de Hugging Face.
- Paper: no disponible.
- Blog o demo: no disponible.
