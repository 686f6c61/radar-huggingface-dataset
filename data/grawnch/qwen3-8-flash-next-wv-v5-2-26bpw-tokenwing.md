# Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing es una cuantizacion GGUF del modelo Qwen/Qwen3.8-Flash-Next, un modelo MoE de 180.000 millones de parametros totales con 48 capas hibridas (GDN + QSA dispersa) y 512 expertos enrutados con top-10. La publica el usuario Grawnch bajo licencia Apache 2.0 y utiliza el formato propietario TokenWing (plugin `wv-plugin-v1.1`), con manifiestos embebidos de `vram_experts`, `usage_seed` y `layer_order` para permitir streaming de expertos MoE desde NVMe o RAM en GPUs de consumo de 12 GB a 24 GB.

El checkpoint se distribuye en dos shards: el tronco de 48 capas con los expertos MoE cuantizados a 2,26 bits por peso (35,39 GiB) y la tabla PLE de la capa 1 (26,82 GiB), sumando 66,8 GB en el repositorio. El objetivo es hacer viable la inferencia de un modelo de 180B en hardware consumer mediante streaming selectivo de expertos, sacrificando precision de pesos a cambio de reducir los requisitos de VRAM.

Es relevante porque demuestra una via practica para ejecutar MoE masivos fuera de clusters, aunque con caveats importantes: requiere un runtime especifico (fork de llama.cpp con plugin de cuantizacion), un plugin binario propietario y una tasa de bits muy baja (2,26 bpw) que degrada la calidad respecto al modelo base. El propio autor marca este checkpoint como superseded por una version Sub2.5bpw con plugin v1.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas GDN + QSA dispersa, 512 expertos enrutados top-10 |
| Parametros totales | 179.551.050.368 (~180B) |
| Parametros activos | no disponible (top-10 de 512 expertos, sin cifra oficial) |
| Longitud de contexto | no disponible (ejemplos de runtime usan `-c 4096`) |
| Tipos de cuantizacion | GGUF 2,26 bpw (TokenWing, plugin `wv-plugin-v1.1`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards: `tokenwing-00001-of-00002.gguf` y `tokenwing-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE hibrida con 48 capas que combinan capas GDN (probablemente variantes de atencion lineal o estado) y capas con atencion QSA dispersa, junto con 512 expertos enrutados y activacion top-10. La cuantizacion TokenWing reduce los pesos de los expertos a 2,26 bits por peso e incrusta manifiestos (`vram_experts`, `usage_seed`, `layer_order`) que el runtime usa para decidir que expertos residen en VRAM y cuales se transmiten desde RAM o NVMe en tiempo de inferencia.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion, ni si hubo RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable no esta en el entrenamiento sino en el empaquetado: el streaming de expertos MoE con repack VNNI en RAM al cargar, fusion y dispatch en CPU, y precarga en idle, que permiten ejecutar un modelo de 180B en una GPU de 12 GB con 16 GB de RAM. El runtime requerido es `runmyai/tokenwing` (rama `feat/quant-plugin`, PR #8) con el plugin `libqfn_wv_plugin.so` (Linux) o `qfn_wv_plugin.dll` (Windows).

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-Flash-Next (no verificados en este checkpoint cuantizado).
- Capacidad MoE con enrutamiento top-10 sobre 512 expertos, lo que en teoria aporta conocimiento especializado por dominio.
- Streaming de expertos desde NVMe/RAM con modos configurables (`--moe-stream model`, `--moe-stream-ram`, `--moe-stream-vram-experts`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion en hardware consumer: ejecutar un MoE de 180B en una GPU de 12 GB VRAM y 16 GB de RAM usando el modo whole-layer GPU con repack VNNI, para probar tecnicas de streaming de expertos sin acceso a clusters.
- Investigacion en cuantizacion extrema: analizar el impacto de 2,26 bpw en la calidad del modelo frente al base, usando el checkpoint como referencia reproducible (el autor lo mantiene por reproducibilidad de benchmarks).
- Despliegue en estaciones de trabajo con NVMe rapido: el modo hibrido `H=96` hot-expert VRAM reduce el ancho de banda de lectura de NVMe, adecuado para entornos donde el almacenamiento es el cuello de botella.
- Pruebas de pipelines de inferencia con llama.cpp: validar el fork `runmyai/tokenwing` y el plugin `wv-plugin-v1.1` en integraciones CI antes de migrar a la version recomendada Sub2.5bpw.
- Prototipado de asistentes conversacionales en local: usar el modelo para generar respuestas de chat en un portatil con GPU consumer, aceptando la degradacion de calidad por la cuantizacion a 2,26 bpw.
- Benchmarking de infraestructura: medir throughput y latencia con `--moe-stream-timing 1` para comparar configuraciones de VRAM, RAM y NVMe en el mismo modelo.
- Docencia y demostraciones: mostrar el funcionamiento interno de un MoE con 512 expertos y enrutamiento top-10 en un equipo de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB en el modo whole-layer GPU con repack VNNI en RAM; el modo hibrido `H=96` reserva VRAM adicional para 96 expertos calientes.
- RAM: 16 GB minimo en el ejemplo del autor (`--moe-stream-ram 6GiB`); se recomienda mas para evitar swapping.
- Almacenamiento: NVMe recomendado por el streaming de expertos desde disco; el repo ocupa 66,8 GB.
- GPU recomendadas: no especificadas por el autor; el ejemplo apunta a portatiles con 12 GB VRAM (equivalente a RTX 4070/4080 portatil o RTX 3060 de 12 GB). Para 24 GB (RTX 4090, RTX 3090) se puede aumentar `--moe-stream-vram-experts`.
- Cabe en GPU consumer: si, en GPUs de 12 GB a 24 GB con el runtime adecuado.
- Opciones de despliegue: `llama-completion` del fork `runmyai/tokenwing` con `--quant-plugin`; no es compatible con llama.cpp upstream, Ollama, vLLM ni TGI sin el plugin.
- Latencia y throughput: no disponibles; el autor incluye `--moe-stream-timing 1` para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing | ~180B (MoE, 512 expertos top-10) | no disponible | GGUF 2,26 bpw | Apache 2.0 | llama.cpp fork + plugin TokenWing |
| Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing | ~180B (MoE) | no disponible | GGUF ~2,5 bpw | Apache 2.0 | llama.cpp fork + plugin v1.3 (ABI v2) |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B (MoE) | no disponible | safetensors (BF16/FP16) | Apache 2.0 | vLLM, TGI, transformers |

La version Sub2.5bpw con plugin v1.3 es la recomendada por el propio autor; este checkpoint se conserva solo por reproducibilidad historica. El modelo base ofrece la maxima calidad pero requiere hardware de clase servidor.

## Limitaciones y advertencias

- Cuantizacion a 2,26 bpw: degradacion de calidad significativa respecto al modelo base; no apta para produccion con requisitos de precision.
- Checkpoint marcado como superseded por el autor; recomienda migrar a Sub2.5bpw con plugin v1.3.
- Dependencia de un runtime no estandar (`runmyai/tokenwing`, rama `feat/quant-plugin`) y de un plugin binario propietario; no funciona con llama.cpp upstream, Ollama, vLLM ni TGI.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente mayor por la baja precision de pesos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible; los ejemplos usan 4096 tokens.
- Rendimiento en produccion: el streaming desde NVMe introduce latencia variable segun el almacenamiento y el patron de enrutamiento de expertos.
- Aunque la licencia es Apache 2.0, el uso comercial requiere verificar la licencia del runtime y del plugin, que no se detalla en la model card.

## Enlaces

- [Hugging Face: Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing](https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Checkpoint recomendado: Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing](https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing)
- [Runtime: runmyai/tokenwing (rama feat/quant-plugin, PR #8)](https://github.com/runmyai/tokenwing)
- [Plugin: grawnchtoader/tokenwing-assets (release wv-plugin-v1.1)](https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.1)
