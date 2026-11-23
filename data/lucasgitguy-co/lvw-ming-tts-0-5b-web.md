# Lucasgitguy-co/LvW-Ming-TTS-0.5B-web

## Resumen

LvW-Ming-TTS-0.5B-web es un paquete de inferencia (bundle) del modelo de sintesis de voz LvW-Ming-TTS-0.5B, compilado por Lucasgitguy-co para ejecutarse en el navegador mediante WebAssembly. No se trata de un checkpoint en PyTorch ni en safetensors: es un artefacto especifico del runtime ming-wasm, generado con la CLI `ming compile` de la libreria fusor-ai (version 0.1.2, commit `7252aa5`) y empaquetado en el formato de bundle 1. El modelo base tiene 0,5 mil millones de parametros y esta orientado a text-to-speech (TTS), presumiblemente con un decodificador VAE y una cabeza de flujo (flow head) para la sintesis de audio.

El bundle usa el perfil `mix`, que cuantiza las capas del LLM y el decodificador VAE a 4 bits, y la cabeza de flujo, el agregador y los embeddings a 7 bits. El repositorio ocupa 0,9 GB e incluye un `manifest.json` con todos los tensores y particiones junto con sus hashes BLAKE3 para verificar integridad. La ejecucion es completamente local en CPU via WebAssembly, sin enviar datos a ningun servidor.

Es relevante ahora por dos motivos: demuestra la viabilidad de TTS on-device en el navegador con un modelo de 0,5B, y documenta de forma transparente un fallo de release gate. El propio autor indica que este fine-tune no supera al modelo base en el conjunto de test reservado (error medio 7,11 % frente a 6,99 % del base, 3 fallos de parada frente a 2 sobre 420, y empeoramiento en espanol), por lo que recomienda usar el modelo base para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TTS con LLM, decodificador VAE y flow head; detalles no publicados) |
| Parametros totales | 0,5B (segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | perfil `mix`: 4 bits (capas LLM y decodificador VAE), 7 bits (flow head, agregador y embeddings) |
| Idiomas soportados | no disponibles (la model card menciona conjuntos de test en ingles y chino, y evaluacion en espanol; no se declara lista oficial) |
| Licencia | MIT |
| Formato de pesos | bundle fusor-ai formato 1 (no safetensors, no GGUF, no PyTorch); solo carga en runtime ming-wasm |
| Tamano del repositorio | 0,9 GB |
| Runtime | ming-wasm (fusor-ai 0.1.2) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Por los componentes citados en el bundle (capas de LLM, decodificador VAE, flow head y agregador) se deduce una arquitectura de TTS neuronal con un backbone tipo transformer y un decodificador generativo de audio, pero no se dispone de detalles sobre tipo de atencion, numero de capas, dimension oculta ni estrategia de entrenamiento.

Respecto al entrenamiento, la informacion disponible se limita a los resultados del release gate definido antes del fine-tune. El modelo fue evaluado contra el base en un conjunto de test reservado con tres reglas: error medio inferior al base, numero de fallos de parada no superior, y ninguna lengua empeorada en mas de 10 % (+0,5 puntos). Las tres reglas fallaron. Ademas, una comprobacion de formato comparo el bundle nativo `ming say` con el modelo PyTorch sobre 30 frases reservadas en ingles y chino, obteniendo un error medio de 8,23 % frente a 6,91 % del PyTorch, lo que tambien fallo (regla: como maximo 10 % +0,5 puntos por encima). No se documentan volumen de tokens, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica destacable es el pipeline de compilacion a WebAssembly con cuantizacion mixta por componente y verificacion de integridad por hash BLAKE3, que permite ejecutar TTS en CPU del navegador sin dependencias de servidor.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, ejecutada localmente en el navegador via WebAssembly.
- Ejecucion on-device: el procesamiento ocurre en la CPU del usuario y nada de lo que se escribe sale de la pagina.
- Perfil de cuantizacion mixta que reduce el peso del bundle a 0,9 GB manteniendo precision en los componentes sensibles (flow head, embeddings).
- Verificacion de integridad de tensores mediante hashes BLAKE3 en `manifest.json`.
- Capacidades multilingues: no declaradas oficialmente; la evaluacion cubre ingles, chino y espanol, pero no se especifica cobertura completa.
- Clonacion de voz y voces integradas: la model card hereda advertencias del modelo base sobre clonacion de voz para investigacion y uso creativo legitimo.
- Tool calling, agentes, vision, audio de entrada, thinking mode: no disponibles en un modelo TTS.

## Casos de uso

- Demos interactivas de TTS en web: el bundle se carga directamente en la pagina publica de ming-wasm y sintetiza voz en el navegador, lo que permite montar demos sin backend ni coste de GPU.
- Aplicaciones de accesibilidad: lectores de texto a voz para personas con discapacidad visual que funcionan offline y sin enviar el contenido leido a ningun servidor, gracias a la ejecucion local en WebAssembly.
- Privacidad en entornos sensibles: sintesis de documentos confidenciales en el propio dispositivo, ya que nada de lo escrito abandona la pagina.
- Prototipado rapido de interfaces de voz: desarrolladores pueden integrar el bundle en aplicaciones web para validar flujos de voz antes de comprometerse con infraestructura de inferencia.
- Educacion y aprendizaje de idiomas: generacion de audio de pronunciacion bajo demanda en el navegador, con latencia dependiente de la CPU local.
- Investigacion sobre TTS on-device: el bundle sirve como referencia reproducible para estudiar el impacto de la cuantizacion mixta (4/7 bits) en calidad de sintesis, dado que la model card publica metricas de error comparativas.
- Inspeccion de resultados de fine-tune: util para auditar por que un fine-tune no supera al base, ya que el autor publica el bundle y las metricas del gate fallido.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas del release gate y de la comprobacion de formato, no benchmarks estandar de TTS (MOS, WER, etc.).

| Metrica | Base | Este modelo | Resultado |
|---|---|---|---|
| Error medio (test reservado) | 6,99 % | 7,11 % | FAIL |
| Fallos de parada | 2/420 | 3/420 | FAIL |
| Empeoramiento por lengua | — | es empeora | FAIL |
| Error medio nativo `ming say` (30 frases en/zh) | 6,91 % (PyTorch) | 8,23 % | FAIL (regla: 10 % + 0,5 pt) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el bundle esta disenado para ejecucion en CPU via WebAssembly. El repositorio ocupa 0,9 GB, por lo que se necesita al menos ese espacio de almacenamiento y memoria para cargar el bundle.
- GPU recomendadas: no disponibles; el runtime objetivo es CPU del navegador.
- Cabe en GPU consumer: no aplica en este formato; el modelo base en PyTorch podria requerir aproximadamente 1 GB en fp16 para 0,5B parametros, pero no se confirma.
- Opciones de despliegue: runtime ming-wasm (pagina publica `ming-wasm.fusor.build`), CLI `ming compile` para generar bundles propios, libreria fusor-ai. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Compatibilidad de formato: este bundle usa formato 1, leido por ming-wasm con fusor-ai 0.1.2. Versiones posteriores (fusor-ai 0.1.3+) solo leen formato 2, por lo que para self-hosting con runtime nuevo hay que recompilar con `ming compile <checkpoint> <out> --profile mix`.
- Latencia y throughput estimados: no disponibles; dependen de la CPU del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B-web (este) | 0,5B (segun nombre) | no disponible | bundle wasm (fusor-ai) | MIT | Gate de release fallido; ejecucion en navegador |
| LvW-Ming-TTS-0.5B (base) | 0,5B (segun nombre) | no disponible | no disponible (checkpoint original) | MIT | Recomendado por el autor frente a este fine-tune |
| Alternativas TTS open source de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No hay informacion suficiente para comparar con alternativas de la misma categoria (por ejemplo, otros modelos TTS open source de ~0,5B) en parametros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Release gate fallido: el fine-tune no supera al modelo base en el test reservado (error medio, fallos de parada y empeoramiento en espanol). El autor recomienda el base para uso real.
- Comprobacion de formato fallida: error medio 8,23 % frente a 6,91 % del PyTorch en 30 frases en ingles/chino.
- Formato propietario de runtime: solo carga en ming-wasm; no es un checkpoint PyTorch ni safetensors y no funciona en vLLM, llama.cpp, Ollama o TGI.
- Incompatibilidad de version: bundle formato 1; runtimes ming-wasm con fusor-ai 0.1.3+ solo leen formato 2, lo que exige recompilacion para self-hosting.
- Idiomas: no se declara lista oficial; la evaluacion cubre ingles, chino y espanol, y el espanol empeora respecto al base.
- Sesgos: no documentados en la model card.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir audio incorrecto o ininteligible; los fallos de parada (3/420) indican casos de sintesis que no terminan correctamente.
- Uso responsable: prohibido suplantar a personas reales sin consentimiento, enganar o incumplir la ley; etiquetar el audio sintetico como sintetico cuando pueda confundirse con una grabacion real.
- Uso comercial: permitido bajo licencia MIT, pero con las advertencias de uso responsable heredadas del modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-web
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- Demo en navegador: https://ming-wasm.fusor.build/?model=https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-web/resolve/main/
- Runtime ming-wasm: https://github.com/fusor-rs/ming-wasm
- Libreria fusor-ai: https://github.com/fusor-rs/fusor-ai
