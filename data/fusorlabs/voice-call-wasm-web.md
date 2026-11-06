# fusorlabs/voice-call-wasm-web

## Resumen
voice-call-wasm-web es un paquete de pesos compilados para WebAssembly publicado por fusorlabs, no un modelo unico. Contiene tres modelos que trabajan en cadena para completar una llamada de voz en el navegador, ejecutandose en la CPU del dispositivo: reconocimiento de voz (derivado de moondream/parakeet-redux, a su vez basado en NVIDIA parakeet-tdt-0.6b-v3), generacion de texto (LiquidAI/LFM3-1.7B) y sintesis de voz (gradium/phonon-31m-en con voces de gradium/phonon-voices).

El interes tecnico esta en el formato: los pesos no son checkpoints de PyTorch ni safetensors, sino bundles del runtime fusor-ai con manifiestos JSON que listan cada tensor y cada parte nombrada por su hash BLAKE3, verificado en tiempo de carga. Las matrices grandes del modelo de lenguaje se comprimen a 7 bits (perfil q7) y el encoder de voz se publica con pesos ternarios de 1,58 bits (perfil ternary).

El repositorio ocupa 2,2 GB y esta pensado para el runtime voice-call-wasm, por lo que solo carga en ejecuciones construidas con la misma version de fusor-ai. Es un artefacto de despliegue orientado a inferencia local en el navegador, no una libreria de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres modelos: encoder de reconocimiento de voz (parakeet-tdt-0.6b-v3), transformer de lenguaje (LFM3-1.7B) y modelo de sintesis de voz (phonon-31m-en) |
| Parametros totales | No disponible como cifra agregada; el componente de lenguaje es de 1,7B y el de sintesis de 31M |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Perfil `ternary` (1,58 bits) para el encoder de voz; perfil `q7` (7 bits en todas las matrices grandes) para lenguaje y sintesis |
| Idiomas soportados | No disponible; el componente de sintesis se identifica como `phonon-31m-en`, lo que sugiere ingles |
| Licencia | Mixta (`other`): CC-BY-4.0 para el componente de voz, LFM Open License v1.0 para LFM3-1.7B, Apache-2.0 para phonon |
| Formato de pesos | Bundles propietarios de fusor-ai (manifiesto `manifest.json` + partes nombradas por hash BLAKE3); no son safetensors ni GGUF |

## Arquitectura y entrenamiento
El paquete ensambla tres etapas independientes en lugar de un modelo speech-to-speech unico. La primera carpeta, `parakeet/`, corresponde a un sistema de reconocimiento de voz derivado de parakeet-tdt-0.6b-v3 de NVIDIA a traves de moondream/parakeet-redux, con el encoder cuantizado a pesos ternarios de 1,58 bits y un tamano de 199 MB. La segunda, `lfm3-1.7b/`, es LiquidAI/LFM3-1.7B en perfil q7, con 1964 MB, y se encarga de generar la respuesta. La tercera, `phonon/`, es gradium/phonon-31m-en en perfil q7 (46 MB) junto con las voces de gradium/phonon-voices, que convierte el texto en audio.

No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en ninguno de los tres componentes. La innovacion destacable es el formato de empaquetado: cada carpeta incluye un `manifest.json` que enumera todos los tensores y partes, y cada parte se nombra con su hash BLAKE3, que el runtime verifica durante la carga. El proceso es reproducible con `just model` en el repositorio voice-call-wasm, que descarga los checkpoints originales y compila los mismos bundles.

## Capacidades
- Reconocimiento de voz en el dispositivo a partir del audio de la llamada, mediante el componente parakeet.
- Generacion de texto de respuesta conversacional con LFM3-1.7B.
- Sintesis de voz con voces predefinidas de gradium/phonon-voices.
- Ejecucion integra en CPU dentro del navegador mediante WebAssembly, sin envio de audio a servidores externos.
- Verificacion de integridad de los pesos en tiempo de carga mediante hashes BLAKE3.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio nativo mas alla del pipeline de voz ni modo de razonamiento explicito.

## Casos de uso
- Demostraciones de llamada de voz en el navegador: el paquete alimenta la demo publica fusorlabs/voice-call-wasm, donde el usuario habla y recibe una respuesta sintetizada sin salir de la pagina.
- Asistentes de voz con privacidad por diseno: al ejecutarse en la CPU del dispositivo, el audio no abandona el navegador, lo que encaja en entornos con requisitos de residencia de datos.
- Atencion al cliente embebida en una web: se puede integrar un agente conversacional de voz en un portal sin infraestructura de inferencia propia, apoyandose en el modelo de lenguaje de 1,7B para respuestas breves.
- Kioscos y terminales publicos: el despliegue en WebAssembly simplifica la distribucion y la actualizacion de los pesos, que se validan por hash en cada carga.
- Pruebas de concepto de pipelines de voz completos: sirve para evaluar la latencia y la calidad de la cadena ASR, LLM y TTS en hardware de cliente antes de invertir en infraestructura.
- Educacion y accesibilidad: interfaces habladas en aplicaciones web para usuarios con dificultades de lectura, con la ventaja de no requerir instalacion de software nativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Inferencia en CPU: el diseno apunta explicitamente a la CPU del dispositivo mediante WebAssembly, sin requisito de GPU.
- VRAM estimada: no aplica en el escenario previsto; el consumo es de memoria del navegador.
- Huella de pesos: 199 MB para el encoder de voz ternario, 1964 MB para LFM3-1.7B en q7 y 46 MB para el sintetizador, sobre un repositorio de 2,2 GB.
- GPU recomendadas: no disponibles; no se documenta aceleracion por GPU.
- Despliegue: exclusivamente mediante los runtimes de voice-call-wasm construidos con la misma version de fusor-ai; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| voice-call-wasm-web (este paquete) | 1,7B (LLM) + 31M (TTS) + encoder ASR | No disponible | Bundles fusor-ai | Mixta | Si, via WebAssembly |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible | Safetensors | LFM Open License v1.0 | No de forma nativa |
| gradium/phonon-31m-en | 31M | No aplica | No disponible | Apache-2.0 | No de forma nativa |
| moondream/parakeet-redux | No disponible | No aplica | No disponible | CC-BY-4.0 (origen NVIDIA) | No de forma nativa |

La comparativa directa con alternativas de la misma categoria no esta disponible: no se conocen otros paquetes de voz completos compilados a WebAssembly con caracteristicas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias
- Los pesos solo cargan en runtimes voice-call-wasm construidos con la misma version de fusor-ai; no son portables a otras herramientas.
- El componente de sintesis se identifica como `phonon-31m-en`, lo que apunta a soporte unicamente de ingles; el resto de idiomas no esta documentado.
- La licencia es mixta y cada componente impone condiciones distintas (CC-BY-4.0, LFM Open License v1.0 y Apache-2.0); el uso comercial requiere revisar la LFM Open License v1.0 y la pagina de licencia del repositorio.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de calidad en produccion.
- El rendimiento en CPU del navegador puede variar de forma significativa segun el dispositivo; no se publican cifras de latencia.
- El repositorio no registra descargas ni likes, por lo que no existe evidencia publica de uso en produccion.
- La fecha de creacion indicada (2026-11-03) debe tratarse con cautela a efectos de madurez del proyecto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/fusorlabs/voice-call-wasm-web
- Demo en Spaces: https://huggingface.co/spaces/fusorlabs/voice-call-wasm
- Repositorio del runtime: https://github.com/fusor-rs/voice-call-wasm
- Repositorio de fusor-ai: https://github.com/fusor-rs/fusor-ai
- Modelo base de lenguaje: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base de reconocimiento de voz: https://huggingface.co/moondream/parakeet-redux
- Modelo base de sintesis de voz: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Licencia LFM Open License v1.0: https://huggingface.co/fusorlabs/voice-call-wasm-web/blob/main/lfm3-1.7b/LICENSE
- Licencia Creative Commons CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
