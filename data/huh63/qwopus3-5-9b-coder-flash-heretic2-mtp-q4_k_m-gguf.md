# hUh63/Qwopus3.5-9B-Coder-Flash-Heretic2-MTP-Q4_K_M-GGUF

## Resumen

Qwopus3.5-9B-Coder-Flash-Heretic2-MTP-Q4_K_M-GGUF es una cuantizacion GGUF de 4 bits de una variante "decensored" del modelo Jackrong/Qwopus3-5-9B-Coder-Flash, un fine-tune Apache-2.0 sobre Qwen3.5-9B orientado a generacion de codigo, razonamiento y uso de herramientas. El trabajo lo firma el usuario hUh63 y combina dos operaciones en una sola pasada sobre el checkpoint BF16: la ablacion de la direccion de rechazo (mediante el modificador ARA de Heretic 2.1.0.dev0) y la cuantizacion Q4_K_M con matriz de importancia.

La caracteristica tecnica mas destacable es que el cabezal MTP (multi-token prediction) del modelo original se conserva dentro del mismo fichero GGUF como capa `blk.32.*`, lo que permite decodificacion autoespeculativa sin necesidad de un segundo modelo borrador. El resultado es un unico fichero de 5,43 GiB para el tronco de texto, mas un proyector de vision F16 de 0,86 GiB que habilita la entrada de imagenes.

El modelo es multimodal (pipeline `image-text-to-text`), soporta seis idiomas declarados (en, zh, ko, ja, ru, es) y esta pensado para entornos donde se necesita generacion de codigo y razonamiento con menos restricciones de rechazo, ejecutable en hardware de consumo mediante llama.cpp. La licencia Apache-2.0 se hereda del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal (`linear_attn`), mas capa MTP/NextN embebida; base Qwen3.5-9B |
| Parametros totales | 456.010.480 segun safetensors del repo (nota: la denominacion comercial es 9B; el dato de safetensors no cuadra con el tamano del fichero, ver limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M como mezcla base, con override Q6_K para todos los tensores `blk.32.*` (capa MTP); proyector de vision en F16 |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), mas `mmproj-F16.gguf` para vision |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B con atencion hibrida: alterna capas con `self_attn` (atencion completa) y capas con `linear_attn` (atencion lineal), lo que reduce el coste de contexto largo. Incluye un cabezal MTP (multi-token prediction) que actua como borrador interno para decodificacion especulativa. El modelo es multimodal: incorpora 333 tensores `model.visual.*` para procesamiento de imagenes y 15 tensores `mtp.*`.

Sobre el checkpoint BF16 se aplico una ablacion de rechazo con el modificador ARA de Heretic 2.1.0.dev0: una LoRA de rango 32 sobre matrices de proyeccion seleccionadas, optimizada con L-BFGS dentro de un estudio Optuna TPE de 12 trials. La region de aceptacion se fijo de antemano en `Rechazos <= 29/100 AND KL <= 0.12`. El trial enviado es el septimo completado: capas 15-21, 15 vecinos, rango 32, con pesos `preserve_good_behavior 0.0800`, `steer_bad_behavior 0.0081`, `overcorrect_relative 0.8001`. Resultado medido: 29/100 rechazos y KL de 0,11203 sobre `mlabonne/harmless_alpaca`.

La ablacion toco 12 matrices en las capas 15-20 (`self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`). Todo lo demas es byte-identico al checkpoint fuente: los 333 tensores visuales, el embedding de tokens, las 105 normas fuera de las capas editadas y los 15 tensores MTP (SHA256 registrado en `heretic_ara_report.json`). La cuantizacion se hizo con llama.cpp en CPU: GGUF BF16 con cabezal MTP incluido (`_QwenMtpMixin` eleva `block_count` a 33 y mapea `mtp.*` a `blk.32.nextn.*`, `blk.32.attn_*`, `blk.32.ffn_*`), proyector F16 con `--mmproj`, matriz de importancia desde `calibration.txt` (prosa en seis idiomas, matematicas y codigo Python/C++/TypeScript) recogida con `--nextn`, y finalmente Q4_K_M con el override `^blk\.32\..*=Q6_K` (coste aproximado de 45 MiB).

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredados del fine-tune Coder-Flash.
- Generacion y comprension de codigo en Python, C++, TypeScript y otros lenguajes presentes en el corpus de calibracion.
- Razonamiento matematico.
- Vision multimodal: entrada de imagenes mediante el proyector `mmproj-F16.gguf` (pipeline `image-text-to-text`).
- Tool calling y function calling, segun los tags del repositorio.
- Soporte de agentes y razonamiento multi-paso.
- Decodificacion especulativa autointegrada mediante el cabezal MTP embebido, sin modelo borrador separado.
- Multilingue en en, zh, ko, ja, ru y es.
- Comportamiento de rechazo reducido por ablacion (29/100 en `mlabonne/harmful_behaviors`), manteniendo el conocimiento y la capacidad de codigo del modelo fuente.

## Casos de uso

- Asistente de codigo en local: el fichero Q4_K_M de 5,43 GiB cabe en GPUs de consumo de 8-12 GB y permite autocompletado y generacion de funciones en Python, C++ o TypeScript sin conexion a servicios externos.
- Revisión de codigo en pipelines de CI/CD: el soporte de tool calling y la ventana de contexto permiten integrarlo como paso de analisis estatico asistido, invocando herramientas externas (linters, compiladores) mediante function calling.
- Agentes autonomos de multiples pasos: la decodificacion especulativa MTP reduce la latencia por token, lo que abarata las cadenas largas de razonamiento y llamadas a herramientas.
- Analisis de capturas de pantalla y diagramas: con el proyector de vision se pueden enviar imagenes de interfaces, diagramas de arquitectura o errores de consola y pedir explicacion o codigo de correccion.
- Documentacion tecnica multilingue: los seis idiomas declarados permiten generar y traducir documentacion entre ingles, chino, coreano, japones, ruso y espanol manteniendo terminologia tecnica.
- Entornos de investigacion sobre alineacion y seguridad: la ablacion documentada con metricas de rechazo y KL, junto con los JSON de medicion, permite reproducir estudios sobre la frontera entre utilidad y rechazo.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: llama.cpp en CPU con Q4_K_M permite ejecutar el modelo en portatiles, a costa de mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las metricas internas de la ablacion:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (`mlabonne/harmful_behaviors`, primeros 100 prompts) | 29 / 100 |
| KL divergencia primer token (`mlabonne/harmless_alpaca`, primeros 100 prompts) | 0,11203 |
| Region de aceptacion | Rechazos <= 29/100 y KL <= 0,12 |
| Trial seleccionado | 7.o completado, capas 15-21, rango 32 |
| Matrices modificadas | 12 (capas 15-20) |

## Requisitos de hardware

- VRAM estimada para inferencia de texto: aproximadamente 5,5-6,5 GB con Q4_K_M (fichero de 5,43 GiB mas overhead de contexto KV).
- Vision: anadir aproximadamente 0,86 GiB del proyector F16, elevando el total a unos 6,5-7,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para texto; 12 GB o mas si se usa vision con contexto amplio.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y servidores compatibles con llama.cpp; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa MTP deberia reducir la latencia por token respecto a un Q4_K_M sin cabezal, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-Flash-Heretic2-MTP-Q4_K_M (este) | 9B (nominal) | no disponible | Apache-2.0 | GGUF + mmproj F16 | Vision, MTP embebido, rechazo reducido |
| Jackrong/Qwopus3-5-9B-Coder-Flash (base) | 9B (nominal) | no disponible | Apache-2.0 | safetensors | Sin ablacion, sin cuantizar |
| Qwen3.5-9B (origen) | 9B (nominal) | no disponible | no disponible en la informacion | safetensors | Modelo base del fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo tiene un coste medible: KL de 0,11203 sobre prompts inofensivos indica una desviacion real en la distribucion de salida, no nominal. Puede degradar respuestas en dominios sensibles.
- El proceso de decensurado elimina parte de la direccion de rechazo; el modelo puede producir contenido que el modelo fuente rechazaria. Requiere filtros externos en produccion.
- La cifra de parametros totales de safetensors (456.010.480) no concuerda con la denominacion 9B ni con el tamano del fichero GGUF; conviene verificar el checkpoint fuente antes de asumir el conteo real.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K); no es posible comparar su calidad de codigo con alternativas de forma objetiva.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse la del Qwen3.5-9B original sin verificacion.
- El modelo es una cuantizacion Q4_K_M: la perdida de precision respecto a BF16 no esta cuantificada con perplejidad en la informacion proporcionada, aunque existen los ficheros `ppl_kl.json` en el repo que podrian consultarse.
- La capa MTP se conserva en Q6_K, pero su comportamiento especulativo con llama.cpp depende de la version del runtime; verificar compatibilidad de `--nextn` antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo fuente y sus terminos deben respetarse; el aviso de licencia apunta al fichero LICENSE del repo base.
- Idioma: aunque se declaran seis idiomas, no hay evaluacion publicada de calidad por idioma; el espanol esta presente en el corpus de calibracion pero no se garantiza paridad con el ingles.
- Riesgo de alucinacion inherente a modelos de 9B, agravado por la reduccion de rechazo en dominios donde el modelo podria responder con confianza injustificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwopus3.5-9B-Coder-Flash-Heretic2-MTP-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Licencia del modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash/blob/main/LICENSE
- Ficheros de medicion en el repo: `heretic_study.json`, `gate.json`, `spec_gate.json`, `ppl_kl.json`, `sizes.json`, `QUANTIZATION.md`, `HERETIC_2_1_0_DEV0_GATE29INT_METHOD.md`, `heretic_ara_report.json`
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
- Heretic (herramienta de ablacion): no disponible en la informacion proporcionada
- Dataset de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluacion de comportamiento inofensivo: https://huggingface.co/datasets/mlabonne/harmless_alpaca
