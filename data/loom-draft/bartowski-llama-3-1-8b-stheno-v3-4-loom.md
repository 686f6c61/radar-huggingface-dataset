# loom-draft/bartowski-Llama-3.1-8B-Stheno-v3.4-loom

## Resumen

`loom-draft/bartowski-Llama-3.1-8B-Stheno-v3.4-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Llama-3.1-8B-Stheno-v3.4-GGUF`, en concreto del fichero `Llama-3.1-8B-Stheno-v3.4-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning adicional: es un artefacto de empaquetado orientado a ejecutar el modelo base sobre GPUs AMD mediante el runtime Loom. El autor del paquete es `loom-draft` y el generador empleado es `loom-next`, sin intervención de un LLM en el proceso de generación.

El modelo subyacente es Stheno v3.4, un fine-tuning de Llama 3.1 8B distribuido por bartowski en cuantización Q4_K_M. Por tanto, hereda la arquitectura transformer densa de Llama 3.1 8B, con 8.000 millones de parámetros y una ventana de contexto nativa de 128.000 tokens. La relevancia de este paquete no está en las capacidades del modelo, sino en el soporte de hardware: está dirigido específicamente a las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con mediciones de rendimiento publicadas frente a llama.cpp ROCm.

La licencia declarada es MIT y el paquete expone una API compatible con OpenAI (`/v1/chat/completions`). La model card no documenta tool calling, modo de razonamiento ni effort de razonamiento (marcados como "not applicable"). El paquete registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026 y actualizado el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (Llama 3.1 8B, heredada del modelo base) |
| Parametros totales | 8.000 millones (modelo base Llama 3.1 8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (nativa de Llama 3.1 8B); mediciones publicadas hasta 32k |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado en formato Loom) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Llama-3.1-8B-Stheno-v3.4-Q4_K_M.gguf`) empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: sirve el checkpoint GGUF Q4_K_M de `Llama-3.1-8B-Stheno-v3.4`, un fine-tuning de Llama 3.1 8B. La arquitectura subyacente es, por tanto, un transformer denso decoder-only de 8.000 millones de parámetros con atención causal y contexto nativo de 128.000 tokens. La model card del paquete no documenta los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO en el fine-tuning de Stheno v3.4; esa información correspondería a la model card del modelo base y no se incluye en la información disponible.

La innovación técnica del paquete es el runtime de despliegue, no el modelo. Loom compila el GGUF a programas `.loom` y lo sirve mediante `loom-serve`, con opciones específicas: `completion_spin_ns=4294967295` activa espera activa de las completaciones de GPU (consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` reserva el pool de memoria por adelantado en lugar de crecimiento elástico, y `--parameter_mode=preload` cambia únicamente la forma de cargar los pesos en el host. El paquete se generó con `loom-next` (solo el generador, sin LLM en el bucle). No hay decodificación especulativa: la model card indica que no existe cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, y las mediciones se realizaron con drafting desactivado en ambos motores.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Hereda las capacidades del fine-tuning Stheno v3.4 sobre Llama 3.1 8B; la model card del paquete no las detalla.
- Soporte de contexto largo: el modelo base admite 128.000 tokens; las mediciones publicadas cubren decodificación tras contextos de ~2k y ~32k tokens.
- Tool calling: marcado como "not applicable" en la tabla de características del paquete.
- Razonamiento / thinking mode: marcado como "not applicable".
- Effort de razonamiento: marcado como "not applicable".
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; el modelo base es solo texto.

## Casos de uso

- Despliegue local en GPUs AMD Strix Halo: el paquete está pensado para servir el modelo en un Ryzen AI Max+ 395 (gfx1151) con `loom-fetch` y `loom-serve`, obteniendo 45,8 tok/s de decodificación en prompt corto según las mediciones del autor. Adecuado para prototipos y asistentes locales en hardware integrado AMD.
- Servicio de chat con API OpenAI en Radeon AI PRO R9700: la misma receta de despliegue funciona en gfx1201 con 32 GB de VRAM, lo que permite integrar el modelo en aplicaciones existentes que ya hablan el protocolo `/v1/chat/completions` sin cambiar el cliente.
- Procesamiento de documentos largos: con 1.703 tok/s de prefill en documentos de 1k tokens y 1.031 tok/s en 32k (Strix Halo), el paquete es adecuado para resumir o extraer información de documentos extensos en local, aprovechando el contexto de 128k del modelo base.
- Atención al cliente automatizada multi-turno: el modelo puede gestionar conversaciones con historial largo gracias a la ventana de contexto heredada de Llama 3.1 8B; el paquete ofrece una ruta de despliegue reproducible en hardware AMD sin depender de CUDA.
- Servicio multi-usuario ligero: con 4 streams en paralelo el autor mide 172 tok/s agregados en Strix Halo, lo que permite atender varias sesiones concurrentes en un solo equipo para cargas moderadas.
- Evaluación comparativa de runtimes en AMD: útil para equipos que quieran medir Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones, ya que el paquete incluye la metodología y los resultados de referencia.
- Entornos de investigación con requisito de licencia permisiva: al declararse MIT, el paquete puede integrarse en pipelines internos o productos comerciales sin las restricciones de la licencia Llama 3.1 original, aunque conviene verificar la cadena de licencias del modelo base.

## Benchmarks y rendimiento

El autor publica comparativas de rendimiento frente a llama.cpp ROCm `llamacpp-rocm/b1374` con el mismo GGUF, el mismo runner y las mismas peticiones. Valores en tokens por segundo (mediana de 3 sesiones):

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 43,7 | 45,8 | +5 % |
| Decode tok/s, contexto 2k | 41,1 | 42,1 | +2 % |
| Decode tok/s, contexto 32k | 24,2 | 24,5 | +1 % |
| Prefill tok/s, documento 1k | 1.237,4 | 1.703,0 | +38 % |
| Prefill tok/s, documento 2k | 1.229,7 | 1.706,6 | +39 % |
| Prefill tok/s, documento 8k | 1.088,6 | 1.572,6 | +44 % |
| Prefill tok/s, documento 16k | 922,0 | 1.309,4 | +42 % |
| Prefill tok/s, documento 32k | 700,8 | 1.031,3 | +47 % |
| 4 streams, decode agregado | 136,0 | 172,0 | +26 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

Mediciones realizadas el 24 de noviembre de 2026 en un runner AMD DevLab Dispatch Strix Halo (X2-LA03-S01-D03), Linux, hrx-loom 0.2.0, con `-ngl 99 -cram 0 -c 65536 -np 1` en llama.cpp. Para Radeon AI PRO R9700 el autor indica que los resultados de este paquete aún no se han vuelto a medir. La roofline no se calculó. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 8.000 millones de parámetros ocupa aproximadamente 4,9 GB de pesos; el pool de memoria se reserva por adelantado con `--pool_backing=fixed`, por lo que el consumo total depende del contexto configurado (la comparativa usa `-c 65536` en llama.cpp).
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Son los dos dispositivos para los que el paquete incluye comandos de despliegue.
- GPU consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon de consumo; el paquete está dirigido a los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo con API OpenAI en `http://127.0.0.1:8080/v1/chat/completions`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Rendimiento medido en Strix Halo: 45,8 tok/s de decode en prompt corto, 24,5 tok/s tras 32k de contexto, 1.703 tok/s de prefill en 1k y 172 tok/s agregados con 4 streams.
- Latencia y throughput en Radeon AI PRO R9700: no medidos para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Stheno-v3.4 (Loom, este paquete) | 8.000 M | 128k (medido hasta 32k) | Q4_K_M | MIT | Hugging Face, runtime Loom para AMD gfx1151/gfx1201 |
| bartowski/Llama-3.1-8B-Stheno-v3.4-GGUF (modelo base del paquete) | 8.000 M | 128k | múltiples GGUF | MIT (según el paquete) | Hugging Face; ejecutable con llama.cpp y otros runtimes GGUF |
| Llama 3.1 8B (Meta) | 8.000 M | 128k | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, amplio ecosistema de runtimes |

La comparativa de rendimiento del autor se limita a llama.cpp ROCm sobre el mismo GGUF en Strix Halo, con los márgenes recogidos en la sección de benchmarks. No se dispone de comparaciones de calidad frente a otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitación de calidad, sesgo o alucinación del fine-tuning Stheno v3.4 y de Llama 3.1 8B se hereda sin cambios.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad; no disponible.
- Sin soporte declarado de tool calling, modo de razonamiento ni effort de razonamiento; no es adecuado para pipelines de agentes que dependan de function calling.
- Idiomas soportados no documentados en el paquete; la cobertura multilingüe debe verificarse contra la model card del modelo base.
- Licencia MIT declarada en el paquete, pero el modelo base es un fine-tuning de Llama 3.1 8B, cuya licencia original (Llama 3.1 Community License) impone condiciones adicionales; conviene revisar la cadena completa antes de uso comercial.
- Soporte de hardware restringido a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay comandos ni mediciones para otras GPU.
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han vuelto a medir para este paquete; los únicos datos numéricos son de Strix Halo.
- El paquete registra 0 descargas y 0 likes, y el runtime `hrx-loom` está en versión 0.2.0; la madurez del ecosistema Loom es baja y el commit de hrx-system figura como desconocido en la metodología.
- Las mediciones usan espera activa (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en GPU; en producción con CPU limitada puede degradar el rendimiento global del sistema.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Llama-3.1-8B-Stheno-v3.4-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Llama-3.1-8B-Stheno-v3.4-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime ROCm hrx-system: https://github.com/ROCm/hrx-system
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch run 45510998710): https://github.com/loom-fun/loom-next/actions/runs/45510998710
