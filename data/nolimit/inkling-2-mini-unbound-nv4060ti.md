# nolimit/Inkling-2-Mini-Unbound-nv4060ti

## Resumen

Inkling-2-Mini-Unbound-nv4060ti es una cuantizacion asimetrica empaquetada en un unico fichero del modelo nokeepai/Inkling-2-Mini-Unbound, un transformer MoE multimodal de 26.4B parametros con vision nativa y decodificacion especulativa DSpark. La publica el usuario nolimit y esta disenada especificamente para ejecutarse integramente en VRAM en una NVIDIA RTX 4060 Ti de 16 GB bajo Windows. El artefacto principal es `ink4060-12g-tight.ik4060` (13.735 GiB), un formato propietario que incorpora config, tokenizer, torre de vision en BF16 y el drafter DSpark.

El interes de esta ficha no reside en el modelo base, sino en la ingenieria de cuantizacion: los expertos del nucleo de bucle (capas 6 a 17, activados 3 veces por token) se conservan en NVFP4 nativo sin perdida (SQNR infinito, coseno 1.000000), mientras que los expertos externos se comprimen a NF3_G32_E4M3 (3.25 bpw). El resultado es un KLD de 0.0216 y un Top-1 del 96.90% frente al modelo sin perdida, con 156.576 tokens de contexto completo en VRAM y decodificacion de 53 a 62 tok/s en codigo corto.

Es relevante porque demuestra que un MoE de 26.4B con vision y contexto de seis cifras puede caber en una GPU de consumo de gama media-alta mediante cuantizacion por rol y decodificacion especulativa, aunque a costa de un ecosistema cerrado: el formato `.ik4060` no es compatible con llama.cpp, vLLM ni Ollama, y requiere el motor propietario `lzsnolimit/ink4060ti`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision nativa) con decodificacion especulativa DSpark Block-8 |
| Parametros totales | 26.4B (modelo base) |
| Parametros activos | no disponible (activacion 3x/token en capas 6-17; 1x/token en capas 0-5 y 18-23) |
| Longitud de contexto | 156.576 tokens (pool completo en VRAM, `k4v4`); 113.584 tokens con `k8v4` |
| Tipos de cuantizacion | NVFP4 nativo (Loop-Core), NF3_G32_E4M3 3.25 bpw (Outer MoE), Q6_G32 (atencion densa y unembed), Q8_G32 (drafter), BF16/FP32 (embed, vision, normas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ik4060` propietario (fichero unico autocontenido, 14.747.503.504 bytes / 13.735 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con vision nativa. La estructura de activacion es asimetrica: las capas 6 a 17 forman el llamado Loop-Core, con tres expertos activados por token, mientras que las capas 0 a 5 y 18 a 23 constituyen el Outer MoE, con una activacion por token. La cuantizacion respeta esa jerarquia: el Loop-Core, mas sensible, se mantiene en NVFP4 nativo sin perdida (6.407 GiB), y el Outer MoE se comprime a NF3_G32_E4M3 de 3.25 bits por peso (4.627 GiB). La atencion densa y el unembed usan Q6_G32 (0.836 GiB), y el drafter DSpark Block-8 se guarda en Q8_G32 (0.315 GiB).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; la model card solo indica que el modelo base es "uncensored / abliterated". La innovacion tecnica destacable es la decodificacion especulativa DSpark con drafter Block-8 integrado en el mismo fichero, que eleva la velocidad de decodificacion a 53-62 tok/s en codigo corto. El sistema de cache de tres niveles (VRAM, 25% de RAM y 200 GiB de SSD) permite reutilizacion de prefijo superior al 99%, con reinicio en frio de 4.9 s para 64K y 9.2 s para 150K. La torre de vision se mantiene en BF16 en RAM de host y se carga de forma perezosa (0 MiB permanentes en VRAM, codificacion en caliente de unos 200 ms).

## Capacidades

- Generacion de texto, razonamiento y codigo, con enfasis declarado en tareas de programacion.
- Procesamiento multimodal image-text-to-text mediante torre de vision nativa en BF16.
- Decodificacion especulativa con drafter DSpark Block-8 integrado.
- Contexto largo efectivo: hasta 156.576 tokens en VRAM con cuantizacion KV `k4v4`, con prueba de recuperacion exacta ("needle recall EXACT PASS") a 150K.
- Integracion directa con herramientas de desarrollo: Claude Code, Cursor, Cline y Roo Code, segun el motor `ink4060ti`.
- Cache de prefijo multinivel con reutilizacion superior al 99%.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la informacion disponible.

## Casos de uso

- Asistencia de codigo en local con contexto de repositorio completo: con 156K tokens en VRAM, el modelo puede cargar ficheros y dependencias extensas en una sola ventana y responder con 53-62 tok/s, lo que lo hace viable como copiloto en Cursor o Cline sin enviar codigo a la nube.
- Agente de refactorizacion multi-fichero: el cache de prefijo con reutilizacion superior al 99% permite iterar sobre el mismo arbol de codigo sin recalcular el prefill, reduciendo el coste por turno en sesiones largas de edicion.
- Analisis de capturas y diagramas tecnicos: la torre de vision permite describir o transcribir imagenes de interfaces, diagramas de arquitectura o errores de consola, con carga perezosa que no consume VRAM permanente.
- Procesamiento de documentacion extensa: con 113K-156K tokens de contexto, admite manuales tecnicos, contratos o especificaciones completas en una sola pasada, util para extraccion y resumen sin fragmentacion.
- Entorno de desarrollo aislado y privado: al ejecutarse integramente en una RTX 4060 Ti local bajo Windows con un solo fichero, encaja en escenarios con requisitos de confidencialidad estrictos (codigo propietario, datos medicos o legales).
- Prototipado de asistentes multimodales: la combinacion de vision, contexto largo y decodificacion rapida permite construir demos de agentes que razonan sobre capturas y texto en hardware de consumo, sin depender de APIs externas.
- Investigacion sobre cuantizacion: el artefacto sirve como referencia reproducible de cuantizacion asimetrica por rol (NVFP4 sin perdida en capas criticas, NF3 en las externas) para estudiar el impacto de cada formato en la calidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| KLD vs modelo sin perdida (`k4v4`, 156K) | 0.0216 |
| Top-1 (`k4v4`) | 96.90% |
| Top-5 (`k4v4`) | 100.00% |
| KLD vs modelo sin perdida (`k8v4`, 113K) | 0.0138 |
| Top-1 (`k8v4`) | 97.38% |
| Top-5 (`k8v4`) | 100.00% |
| Referencia Strata SQ-10 (misma clase 16 GB) | KLD 0.0720 / Top-1 92.35% |
| SQNR Loop-Core (NVFP4) | infinito (coseno 1.000000) |
| SQNR Outer MoE (NF3) | ~15.8 dB (coseno ~0.987) |
| SQNR atencion densa y unembed (Q6) | ~33.0 dB (coseno 0.9997) |
| SQNR drafter DSpark (Q8) | 45.8 dB (coseno 0.99999) |

Rendimiento medido en RTX 4060 Ti 16 GB bajo Windows WDDM:

| Metrica | Valor |
|---|---|
| Prefill (chunk=1024, 2K) | 1.956 tok/s |
| Prefill (16K) | 1.810 tok/s |
| Prefill (64K) | 1.497 tok/s |
| Prefill (100K) | 1.316 tok/s |
| Prefill (150K) | 1.136 tok/s |
| Decode (codigo corto, DSpark ON) | 53-62 tok/s |
| Decode (16K-64K en caliente) | 46-55 tok/s |
| Decode (150K) | 28.6 tok/s |
| Huella en VRAM | 12.553 MiB (0 spill de expertos) |
| Reinicio en frio 64K / 150K | 4.9 s / 9.2 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 12.553 MiB para pesos y drafter con contexto completo de 156.576 tokens (`k4v4`); el pool baja a 113.584 tokens con `k8v4`.
- GPU verificada: NVIDIA RTX 4060 Ti 16 GB (`sm_89`), probada de extremo a extremo en hardware fisico.
- GPU con soporte teorico: RTX 5060 Ti 16 GB (`sm_120a`, NVFP4 nativo Blackwell), solo compilada y no probada en tarjeta fisica; se puede forzar la caida a BF16 Tensor Core con `INK4060_DISABLE_SM120_FP4=1`.
- No cabe en GPUs de 8 GB ni en tarjetas con menos de 13 GiB de VRAM util.
- Almacenamiento: al menos 30 GB libres en SSD para el motor y la cache de tres niveles (hasta 200 GiB de SSD para cache).
- RAM: se reserva aproximadamente el 25% para el nivel intermedio de cache; embed, vision y normas se cargan en RAM de host.
- Despliegue: exclusivamente mediante el motor `lzsnolimit/ink4060ti` (paquete `ink4060-v1.0.0-win-x64.zip`, ~5.6 MiB, `start.bat`). No compatible con llama.cpp, vLLM ni Ollama.
- Sistema operativo: Windows (paquete win-x64); no se documenta soporte Linux en la informacion disponible.
- Throughput y latencia: los indicados en la seccion de benchmarks (prefill 1.136-1.956 tok/s; decode 28.6-62 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-nv4060ti | 26.4B (MoE) | 156.576 tok en VRAM | `.ik4060`, motor propietario | Apache 2.0 | KLD 0.0216, Top-1 96.90%; vision nativa; solo Windows |
| nokeepai/Inkling-2-Mini-Unbound | 26.4B (MoE) | no disponible | safetensors (modelo base) | Apache 2.0 | Referencia sin cuantizar; requiere hardware muy superior |
| Strata SQ-10 (clase 16 GB) | no disponible | no disponible | no disponible | no disponible | KLD 0.0720, Top-1 92.35% segun la model card |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria en parametros, contexto y rendimiento mas alla de las referencias citadas por el autor.

## Limitaciones y advertencias

- Formato y motor cerrados: `.ik4060` solo funciona con `lzsnolimit/ink4060ti`; no hay soporte para llama.cpp, vLLM, Ollama ni TGI, lo que limita portabilidad e integracion en pipelines existentes.
- Dependencia de Windows: el paquete publicado es win-x64; no se documenta soporte para Linux ni macOS.
- Soporte experimental en Blackwell: la RTX 5060 Ti (`sm_120a`) no se ha probado en hardware fisico; el rendimiento y la estabilidad no estan verificados.
- Modelo base "uncensored / abliterated": se ha eliminado total o parcialmente el rechazo a ciertas peticiones, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtros de seguridad.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones de factualidad ni de calibracion.
- Perdida de calidad por cuantizacion: el Outer MoE presenta SQNR de ~15.8 dB y coseno ~0.987, con degradacion medible frente al modelo sin perdida (KLD 0.0216, Top-1 96.90%).
- Idiomas soportados no documentados: no hay garantias de calidad fuera de los idiomas del modelo base.
- Contexto efectivo dependiente de la configuracion KV: `k4v4` ofrece 156K con mayor KLD; `k8v4` reduce el contexto a 113K a cambio de mejor fidelidad.
- Licencia Apache 2.0 en el artefacto, pero el uso comercial del modelo base abliterated requiere evaluacion de riesgos legales y de reputacion por parte del integrador.
- Sin descargas ni likes en el momento de la ficha (0/0): ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nolimit/Inkling-2-Mini-Unbound-nv4060ti
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Motor de inferencia (GitHub): https://github.com/lzsnolimit/ink4060ti
- Releases del motor: https://github.com/lzsnolimit/ink4060ti/releases
