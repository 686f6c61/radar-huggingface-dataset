# MIThridate/Qwen3-Omni-35B-A3B-SAMI-AsymQ

## Resumen

Qwen3-Omni-35B-A3B-SAMI-AsymQ es una cuantizacion GGUF del backbone "Thinker" de Qwen3-Omni-30B-A3B-Instruct, publicada por el usuario MIThridate (autor independiente) bajo licencia Apache 2.0. No es un modelo entrenado desde cero: es un checkpoint derivado mediante cuantizacion asimetrica multicapa ("SAMI-AsymQ") y una cirugia selectiva de pesos sobre el modelo multimodal de Alibaba Cloud. Su proposito es permitir la ejecucion de un MoE multimodal de ~30.500 millones de parametros en hardware de gama baja, concretamente una GPU de 6 GB de VRAM (NVIDIA GTX 1060) mas 32 GB de RAM DDR4.

El modelo base, Qwen3-Omni-30B-A3B-Instruct, es un modelo fundacional omni-modal nativo de la familia Qwen3 que comprende texto, imagen, audio y video y genera texto y voz en tiempo real. Esta version concreta conserva el nucleo de razonamiento de texto y el proyector de vision SigLIP (fichero `mmproj` en BF16), pero se distribuye como GGUF para `llama.cpp`, con soporte de descarga de expertos a CPU (`-cmoe`). El resultado es una asignacion de memoria desacoplada: unos 2,4 GB en VRAM y unos 11,8 GB en RAM del sistema para el fichero principal.

Es relevante ahora por dos motivos. Primero, demuestra que un MoE disperso con 6.144 expertos puede ejecutarse a velocidades utilizables (15,5-16 tok/s) en una GPU de 2016, algo que las herramientas de compatibilidad automatica de HuggingFace marcan como inviable al asumir que el fichero completo debe residir en VRAM. Segundo, el autor lo declara explicitamente como una prueba de concepto experimental y empirica, sin baseline estandar publicado para cuantizacion asimetrica multicapa combinada con ablacion direccional de columnas, por lo que debe tratarse como material de investigacion y no como checkpoint certificado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) dispersa; backbone de razonamiento (Thinker) mas proyector de vision SigLIP (pooler unico, d=2048) |
| Parametros totales | 30.532.646.912 (~30,5 mil millones), segun safetensors del modelo base |
| Parametros activos | ~3 mil millones (inferido de la nomenclatura A3B del modelo base); cifra exacta no disponible |
| Longitud de contexto | No disponible; el ejemplo oficial de lanzamiento usa `-c 4096` |
| Tipos de cuantizacion | SAMI-AsymQ asimetrica mixta (Q8_0 / Q5_K / Q3_K / Q4_K); fichero principal etiquetado Q4_K_M; proyector de vision en BF16 |
| Idiomas soportados | en, ro (declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 16,1 GB |
| Tamano del fichero principal | 14,8 GB (`Qwen3-Omni-35B-A3B-SAMI-AsymQ-Q4_K_M.gguf`) |
| Tamano del proyector de vision | 861 MB (`mmproj-SAMI-Omni-Vision-BF16.gguf`) |
| VRAM activa en configuracion de referencia | ~2,4 GB de 6 GB |
| RAM de sistema en configuracion de referencia | ~11,8 GB (principal) + ~0,86 GB (proyector) |
| Libreria / runtime | llama.cpp (build b11300 o superior, con `-cmoe` y `--reasoning-budget`) |
| Modelo base | Qwen/Qwen3-Omni-30B-A3B-Instruct |
| Cuantizado por | MIThridate |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-Omni: un modelo omni-modal nativo con un nucleo de razonamiento tipo MoE disperso, complementado por torres de percepcion (vision SigLIP, y audio/video en el modelo completo) y un modulo de sintesis de voz. El checkpoint aqui distribuido corresponde al backbone Thinker y al proyector de vision; los 6.144 expertos dispersos se evaluan dinamicamente en RAM DDR4 mientras las proyecciones de atencion y las cabezas de enrutamiento se descargan a VRAM. No se ha realizado ningun entrenamiento adicional: el autor no documenta fine-tuning ni RLHF/DPO propio.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la compresion y la estrategia de ejecucion. Por un lado, una cuantizacion asimetrica multicapa que asigna precisiones distintas segun la sensibilidad de cada bloque (Q8_0, Q5_K, Q3_K y Q4_K en el mismo fichero). Por otro, una "cirugia de pesos" descrita como ablacion direccional de columnas, aplicada selectivamente. El autor afirma que las evaluaciones internas indican una retencion del nucleo de razonamiento con un delta inferior al 0,6 % en MMLU, GSM8K y ARC respecto al modelo base, pero no publica cifras absolutas ni la metodologia de evaluacion. El despliegue se apoya en el soporte de `--cpu-moe` de llama.cpp y en el parametro `--reasoning-budget` para desactivar las trazas de pensamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre el backbone Thinker, con modo de pensamiento configurable (`--reasoning off` o `--reasoning-budget`).
- Comprension de imagenes (image-text-to-text) mediante el proyector SigLIP en BF16, incluyendo descripcion de escenas y preguntas sobre el contenido visual.
- Conversacion multi-turno a traves de una API compatible con OpenAI (`/v1/chat/completions`) servida por `llama-server`.
- Capacidades multilingues limitadas a los idiomas declarados: ingles (en) y rumano (ro).
- Ejecucion con presupuesto de VRAM reducido mediante descarga de expertos a CPU, sin necesidad de GPUs de datacenter.
- Streaming de respuestas en servidor local (Server-Sent Events), adecuado para interfaces conversacionales.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes: no documentado en la informacion proporcionada.
- Modo audio y sintesis de voz: no disponible en los ficheros publicados; el repositorio solo incluye el backbone de texto y el proyector de vision.

## Casos de uso

- Inferencia local en hardware legacy: el escenario de referencia (GTX 1060 de 6 GB + 32 GB de DDR4) permite servir un MoE de ~30,5B parametros a 15,5-16 tok/s con solo 2,4 GB de VRAM ocupada. Es util para desarrolladores que quieren experimentar con modelos grandes sin cambiar de GPU.
- Procesamiento de documentos con privacidad estricta: al ejecutarse integramente en local, permite analizar imagenes de documentos, capturas o formularios sin enviar datos a APIs externas, algo critico en sectores regulados.
- Descripcion de imagenes y accesibilidad: el proyector SigLIP permite generar descripciones textuales de imagenes para lectores de pantalla o para etiquetado automatico de bancos de imagenes.
- Atencion al cliente en ingles y rumano: la API compatible con OpenAI facilita integrarlo en backends existentes para conversaciones multi-turno, con la salvedad de que la ventana de contexto efectiva del ejemplo es de 4096 tokens.
- Investigacion sobre cuantizacion asimetrica: el propio autor lo plantea para que la comunidad haga pruebas de estres sobre ejecucion MoE con VRAM baja y reporte anomalias de enrutamiento o degradacion sintactica en la pestana de Discussions.
- Evaluacion comparativa de cuantizaciones (LLM-as-judge offline): puede actuar como modelo juez o generador en pipelines de evaluacion que requieren cientos de ejecuciones sin coste por token.
- Prototipado rapido de asistentes multimodales: gracias a la compatibilidad con endpoints, se puede sustituir por un modelo mayor en produccion manteniendo el mismo codigo de cliente.
- Docencia y demostraciones: permite ilustrar en un aula o taller el funcionamiento de un MoE disperso, la diferencia entre parametros totales y activos y el impacto de la cuantizacion, con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras absolutas en la informacion disponible. El autor menciona unicamente una afirmacion cualitativa de retencion del nucleo de razonamiento con un delta inferior al 0,6 % en MMLU, GSM8K y ARC frente al modelo base, sin detallar los valores obtenidos ni el protocolo de evaluacion. No se reproduce aqui esa afirmacion como dato numerico porque no va acompanada de cifras verificables.

| Metrica | Valor |
|---|---|
| MMLU | No disponible (solo se cita un delta <0,6 % sin cifras absolutas) |
| GSM8K | No disponible (solo se cita un delta <0,6 % sin cifras absolutas) |
| ARC | No disponible (solo se cita un delta <0,6 % sin cifras absolutas) |
| Throughput medido | 15,5 - 16,0 tok/s en GTX 1060 6 GB + 32 GB DDR4, con `-cmoe` |
| TTFT medido | ~2,08 s con `--reasoning off --reasoning-budget 0` |

## Requisitos de hardware

- VRAM estimada para inferencia en la configuracion documentada: ~2,4 GB para el backbone de texto (capas densas, atencion y cabezas de enrutamiento). El proyector de vision se mantiene en RAM del sistema (0,86 GB) con `--no-mmproj-offload`.
- RAM de sistema necesaria: ~11,8 GB para el fichero principal mas ~0,86 GB para el proyector, sobre un sistema con 32 GB de DDR4 en el caso medido.
- GPU probada por el autor: NVIDIA GTX 1060 de 6 GB. Si cabe en GPU de consumo: si, en esta configuracion con descarga de expertos a CPU.
- GPUs recomendadas: no disponibles en la informacion proporcionada. Con GPUs de mayor VRAM (por ejemplo RTX 4090, A100, H100) seria posible mantener mas expertos en dispositivo, pero el autor no documenta configuraciones alternativas ni sus rendimientos.
- Requisito de software: llama.cpp build b11300 o superior, con soporte de `-cmoe` (`--cpu-moe`) y `--reasoning-budget`.
- Opciones de despliegue: `llama-server` con API compatible con OpenAI. No se documenta soporte para vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: 15,5-16,0 tok/s de generacion y ~2,08 s de TTFT en la configuracion de referencia, con razonamiento desactivado y contexto de 4096 tokens. Estos valores dependen fuertemente del ancho de banda de la RAM DDR4 del host, dado que los 6.144 expertos se evaluan en CPU.

Tabla de ficheros publicados:

| Fichero | Modalidad | Perfil de cuantizacion | Tamano | VRAM activa | RAM del host | Velocidad medida |
|---|---|---|---|---|---|---|
| `Qwen3-Omni-35B-A3B-SAMI-AsymQ-Q4_K_M.gguf` | Texto / razonamiento MoE | SAMI-AsymQ (Q8_0 / Q5_K / Q3_K / Q4_K) | 14,8 GB | ~2,4 GB | ~11,8 GB | 15,5 - 16,0 tok/s |
| `mmproj-SAMI-Omni-Vision-BF16.gguf` | Vision multimodal | BF16 (pooler unico, d=2048) | 861 MB | 0,0 GB | ~0,86 GB | No disponible |

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-Omni-35B-A3B-SAMI-AsymQ | ~30,5 mil millones | ~3 mil millones (segun nomenclatura) | No disponible | GGUF para llama.cpp | Apache 2.0 | HuggingFace, autor independiente |
| Qwen3-Omni-30B-A3B-Instruct (modelo base) | ~30,5 mil millones | ~3 mil millones (segun nomenclatura) | No disponible | Safetensors (BF16) | Apache 2.0 | HuggingFace, Qwen / Alibaba Cloud |
| Qwen3.5-Omni | Cientos de miles de millones | No disponible | 256k | No disponible | No disponible | Anunciado por el equipo Qwen; sucesor de la familia |
| Otras cuantizaciones GGUF de MoE de ~30B para VRAM baja | No disponible | No disponible | No disponible | GGUF | Variable | No disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada. La diferencia principal frente al modelo base es el formato: el original en BF16 no cabe en 6 GB de VRAM, mientras que esta cuantizacion si lo hace a costa de precision y de requerir llama.cpp con soporte de `-cmoe`. Frente a Qwen3.5-Omni, la brecha es de escala y generacion, no comparable directamente.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo define explicitamente como prueba de concepto para investigacion y benchmarking de hardware, no como un checkpoint certificado para produccion empresarial.
- Cirugia de pesos sin baseline publico: la ablacion direccional de columnas puede producir regresiones, derivas de comportamiento o anomalias de enrutamiento en casos limite que no aparecen en las evaluaciones internas.
- Riesgo de degradacion sintactica: el propio autor solicita que se documenten en Discussions los fallos de sintaxis o de enrutamiento encontrados.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; al ser una cuantizacion agresiva (Q3_K y Q4_K en parte de los pesos), el riesgo puede aumentar respecto al modelo base.
- Cobertura de idiomas limitada: solo se declaran ingles y rumano. El rendimiento en castellano no esta documentado, aunque el modelo base sea multilingue.
- Contexto reducido en la configuracion recomendada: el ejemplo oficial usa `-c 4096`, muy por debajo de lo que suelen ofrecer los modelos actuales, lo que limita tareas de documento largo o conversaciones extensas.
- Modalidades incompletas: los ficheros publicados cubren texto y vision, pero no audio ni sintesis de voz, capacidades presentes en el modelo omni-modal original.
- Rendimiento dependiente del host: al evaluar los 6.144 expertos en CPU, el throughput depende criticamente del ancho de banda y la latencia de la DDR4 del sistema, no solo de la GPU.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado cuantizado conviene verificar tambien los terminos del modelo base y las condiciones de la cuantizacion (no se documentan restricciones adicionales).
- Sin datos de benchmarks absolutos: no es posible estimar con rigor la perdida de calidad respecto al BF16 en tareas concretas antes de desplegarlo.
- Soporte limitado de runtimes: unicamente se documenta llama.cpp; no hay evidencia de funcionamiento en vLLM, TGI u Ollama.
- Popularidad baja: 437 descargas y 0 likes en el momento de la consulta, con historial de actualizacion de apenas dos dias, lo que implica poca validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MIThridate/Qwen3-Omni-35B-A3B-SAMI-AsymQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Qwen3-Omni Technical Report (arXiv): https://arxiv.org/abs/2509.17765v1
- Qwen3-Omni Technical Report (ResearchGate): https://www.researchgate.net/publication/395725723_Qwen3-Omni_Technical_Report
- Qwen3-Omni, presentacion en el blog de Alibaba Cloud: https://www.alibabacloud.com/blog/qwen3-omni-natively-omni-modal-foundation-models_602581
- Qwen3-Omni en AI Wiki: https://aiwiki.ai/wiki/qwen3_omni
- Qwen3.5-Omni Technical Report (arXiv, sucesor de la familia): https://arxiv.org/html/2604.15804
