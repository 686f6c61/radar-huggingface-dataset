# andkz/TilType-AI-1.8.1

## Resumen

TilType AI 1.8.1 es un modelo de lenguaje autoregresivo de tipo decoder-only desarrollado por el usuario andkz, publicado en Hugging Face bajo licencia MIT. Su proposito es la continuacion de texto y el autocompletado en ruso, kazajo e ingles, operando sobre el texto situado a la izquierda del cursor para predecir el siguiente subtoken. A diferencia de los modelos generativos de gran escala, esta disenado como un motor de sugerencias de palabra o frase corta, no como un asistente conversacional.

El modelo es deliberadamente compacto: 15 232 003 parametros, 6 capas de decoder, dimension oculta de 384 y una ventana de contexto de solo 128 tokens, compartida entre el prefijo y la continuacion. Emplea un tokenizador byte-level BPE con vocabulario de 16 384 entradas, comun a los tres idiomas, y pesos en FP16 de 30 464 006 bytes (aproximadamente 30 MB) en disco.

Su relevancia practica reside en el enfoque de despliegue: la inferencia esta pensada para ejecutarse en CPU mediante WebAssembly con SIMD y precision FP32, lo que permite integrar el modelo directamente en el navegador o en entornos sin GPU. El repositorio incluye un runtime (`runtime/decoder.wasm`) y un script de demostracion (`demo.cjs`), lo que sugiere un caso de uso orientado a editores de texto y campos de entrada con autocompletado local y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 15 232 003 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens (prefijo y continuacion comparten posiciones) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; inferencia en FP32) |
| Idiomas soportados | Ruso (ru), kazajo (kk), ingles (en) |
| Licencia | MIT |
| Formato de pesos | Binario propietario `writer.fp16` (FP16), tokenizador en `tokenizer.json`, runtime en WebAssembly |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 6 capas, dimension oculta de 384, 12 cabezas de atencion de dimension 32 y una capa FFN con dimension intermedia de 1152 y activacion GELU. El tokenizador es byte-level BPE con un vocabulario de 16 384 tokens compartido entre los tres idiomas, lo que permite representar texto ruso, kazajo e ingles con un unico conjunto de pesos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni otras tecnicas de alineacion. La model card solo documenta la arquitectura, el tamano y el formato de inferencia. La innovacion tecnica destacable no esta en el diseno del modelo sino en el runtime: la inferencia se ejecuta en CPU mediante WebAssembly con SIMD en FP32, lo que habilita el despliegue en navegador sin dependencias de GPU.

## Capacidades

- Generacion de texto por continuacion autoregresiva: predice el siguiente subtoken a partir del texto a la izquierda del cursor.
- Autocompletado de palabra o frase corta: encadena varias predicciones para formar una continuacion completa, incluyendo puntuacion.
- Multilingue en ruso, kazajo e ingles con pesos y tokenizador compartidos.
- Generacion de multiples candidatos ordenados por probabilidad (la model card muestra tres alternativas por ejemplo).
- Ejecucion en CPU via WebAssembly SIMD, apta para entornos sin GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Autocompletado en editores de texto en el navegador: el modelo puede integrarse como motor de sugerencias en un editor web cargando `runtime/decoder.wasm` y los pesos FP16, ofreciendo continuaciones de palabra o frase sin enviar el texto a un servidor.
- Campos de entrada de formularios y buscadores: dado el texto ya escrito por el usuario, el modelo propone completaciones cortas con baja latencia gracias a su tamano reducido y a la ejecucion en CPU.
- Soporte a la escritura en ruso y kazajo: util para aplicaciones dirigidas a usuarios de Asia Central, donde el kazajo suele carecer de herramientas de autocompletado de calidad; el tokenizador compartido permite alternar idiomas dentro de la misma sesion.
- Asistentes de redaccion ligeros en entornos con recursos limitados: al ocupar unos 30 MB en disco y ejecutarse en FP32 sobre CPU, puede desplegarse en dispositivos de gama baja o en aplicaciones de escritorio sin GPU.
- Correccion y sugerencia de puntuacion: al predecir continuaciones que incluyen signos de puntuacion, puede emplearse para sugerir el cierre de frases en herramientas de escritura.
- Prototipado de interfaces de autocompletado: el script `demo.cjs` y el runtime incluidos facilitan la evaluacion rapida de la calidad de las sugerencias antes de integrar el modelo en un producto.
- Filtrado o priorizacion de candidatos en teclados predictivos: la salida de multiples candidatos ordenados permite alimentar interfaces de teclado en movil o escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; el modelo esta disenado para CPU. Los pesos ocupan 30 464 006 bytes (aproximadamente 30 MB) en FP16.
- GPU recomendadas: no disponible; no se documenta ejecucion en GPU.
- Compatibilidad con GPU de consumo: no documentada. El runtime oficial es WebAssembly SIMD en CPU.
- Opciones de despliegue: runtime propio en WebAssembly (`runtime/decoder.wasm`) con Node.js para la demo (`node demo.cjs`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| TilType AI 1.8.1 | 15,2 M | 128 tokens | ru, kk, en | MIT | CPU / WebAssembly |
| Modelos de autocompletado tipo GPT-2 small | ~124 M | 1024 tokens | principalmente en | MIT | CPU/GPU (varias herramientas) |
| Modelos de autocompletado especificos para ruso | no disponible | no disponible | ru | variable | variable |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion con GPT-2 small es orientativa por categoria (modelo pequeno de continuacion de texto), no por rendimiento medido.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (128 tokens): no apta para tareas que requieran contexto largo, documentos extensos ni conversaciones multi-turno.
- Modelo de 15,2 M de parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en generaciones largas; no es un modelo de instrucciones.
- Riesgo de alucinacion y de continuaciones gramaticalmente plausibles pero incorrectas, especialmente en frases largas.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento ni procesos de mitigacion de sesgos.
- Cobertura idiomatica limitada a ruso, kazajo e ingles; el rendimiento en otros idiomas no esta garantizado.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia ni soporte por parte del autor.
- Repositorio sin descargas ni likes en el momento de la consulta y con pesos en un formato binario propietario (`writer.fp16`) que requiere el runtime propio; no hay integracion documentada con ecosistemas estandar como transformers, GGUF o safetensors.
- Para produccion, conviene validar la calidad de las sugerencias en el dominio concreto y considerar el coste de mantener un runtime WebAssembly propio.

## Enlaces

- Hugging Face: https://huggingface.co/andkz/TilType-AI-1.8.1
- Pesos: https://huggingface.co/andkz/TilType-AI-1.8.1/blob/main/models/writer.fp16
- Tokenizador: https://huggingface.co/andkz/TilType-AI-1.8.1/blob/main/models/tokenizer.json
- Runtime WebAssembly: https://huggingface.co/andkz/TilType-AI-1.8.1/blob/main/runtime/decoder.wasm
