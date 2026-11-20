# leok7v/Ternary-Bonsai-2-2B-gguf

## Resumen

Ternary Bonsai 2 2B es un modelo multimodal (texto e imagen) de aproximadamente 2.000 millones de parametros desarrollado por Prism ML, construido a partir de Qwen3.5-2B de Alibaba Cloud y cuantizado en formato ternario. Esta ficha concreta, publicada por el usuario leok7v, es un re-host que fusiona en un unico archivo los pesos del modelo de lenguaje (Q2_0, ternario) y el proyector de vision (Q8_0) que el repositorio original distribuye por separado, con el objetivo de ofrecer una instantanea estable frente a posibles cambios o retiradas del repositorio upstream.

La arquitectura es un hibrido Qwen3.5 (`general.architecture = qwen35`) con 24 bloques de dimension oculta 2048, atencion con 8 cabezas de consulta y 2 de clave-valor, y una relacion de tres bloques de atencion lineal Gated DeltaNet por cada bloque de atencion completa. El componente de vision es una torre Qwen3-VL de 24 bloques cuantizada a Q8_0. La cuantizacion ternaria emplea el bloque `Q2_0` de Prism ML, con pesos en {-1, 0, +1} y un factor de escala FP16, lo que resulta en 2,25 bits por peso sobre los tensores de texto.

Su relevancia reside en la eficiencia extrema en dispositivos: el archivo completo ocupa 914.735.104 bytes y, segun las mediciones del autor del re-host, se ejecuta en un iPhone 12 mini con 4 GB de RAM a 151 tokens por segundo en prefill y 12 en decodificacion, con un pico de 228 MB. Es un caso practico de inferencia multimodal en el borde (on-device) con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 (`qwen35`): atencion completa + Gated DeltaNet lineal (3:1); torre de vision Qwen3-VL de 24 bloques |
| Parametros totales | ~2B en el modelo de lenguaje, mas la torre de vision (recuento exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la medicion de perplejidad se hizo a contexto 512) |
| Tipos de cuantizacion | Ternaria `Q2_0` (2,25 bits por peso) en el texto; `Q8_0` en el proyector de vision; upstream ofrece ademas PQ2_0 y PTQ1_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ggxf` (GGUF extendido con tensores y metadatos adicionales); 618 tensores, 67 claves KV, alineacion de 16 KB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y combina bloques de atencion completa con bloques de atencion lineal Gated DeltaNet en proporcion de tres a uno, sobre 24 bloques de dimension oculta 2048 y 8 cabezas de consulta frente a 2 de clave-valor. Los pesos del modelo de lenguaje son ternarios en el bloque `Q2_0` de Prism ML: 64 pesos empaquetados en 18 bytes con la estructura `{ FP16 scale d; 2-bit codes qs[16] }` y la regla de reconstruccion `w = (code - 1) * d`. Los pesos incorporan la rotacion de Hadamard plegada del autor original (claves `prism.hadamard.*`, bloque 512, version 2, cabeza atada), lo que obliga al runtime a transformar las activaciones antes de cada capa lineal rotada y despues del token gather.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El re-host no ha recuantizado ni convertido ningun tensor: los bytes de cada tensor son los del upstream, verificados contra su archivo `SHA256SUMS`. La unica intervencion es la fusion de los dos archivos originales (modelo de texto y proyector) en uno solo, la adicion de la tarjeta de muestreo como JSON en `general.generation_config_json` y la escritura de los dos identificadores de parada (`<|im_end|>` 248046 y `<|endoftext|>` 248044) en `tokenizer.ggml.eos_token_ids`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`) mediante la torre Qwen3-VL en Q8_0.
- Modo de razonamiento ("thinking") configurable, con tarjetas de muestreo diferenciadas para thinking activado y desactivado.
- Ejecucion en dispositivos de recursos limitados gracias a la cuantizacion ternaria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal en movil: el modelo cabe en un telefono de 4 GB de RAM con un pico de 228 MB y 12 tokens por segundo en decodificacion, lo que permite describir imagenes o responder preguntas sobre fotos capturadas por el usuario sin conexion.
- Clasificacion y etiquetado de imagenes en el borde: la torre de vision Q8_0 permite procesar capturas en el propio dispositivo, evitando enviar datos a servidores y reduciendo costes de infraestructura.
- Chat de soporte en ingles sobre dispositivos modestos: el formato ternario reduce el peso del modelo a menos de 1 GB, lo que hace viable desplegar un asistente conversacional en hardware de gama baja.
- Prototipado rapido de aplicaciones multimodales: al ser un unico archivo con pesos y proyector, el despliegue elimina el riesgo de perder el proyector y quedarse con un modelo silenciosamente solo de texto.
- Investigacion sobre cuantizacion extrema: sirve como referencia para estudiar el impacto de pesos ternarios en calidad y latencia, con perplejidad medida sobre un texto de Simple Wikipedia a contexto 512.
- Educacion y demostraciones offline: el tamano reducido y la licencia Apache 2.0 facilitan su inclusion en entornos docentes o demos sin conectividad.
- Inferencia en navegador o entornos embebidos: la alineacion de tensores a 16 KB (tamano de pagina del iPhone) esta pensada para mapeo de memoria eficiente en dispositivos moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del re-host unicamente reporta una medicion de perplejidad: sobre un texto de Simple Wikipedia de 80 KB a contexto 512 en 24 fragmentos, ChatOKF obtiene la misma perplejidad que `llama-perplexity` de upstream sobre el conjunto de dos archivos, con una diferencia inferior al 0,2 por ciento. Tambien se cita una medicion en iPhone 12 mini (4 GB): 151 tokens por segundo en prefill, 12 en decodificacion y un pico de 228 MB, en una sola ejecucion el 2026-11-21.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo completo ocupa aproximadamente 0,91 GB; el pico medido en movil es de 228 MB, por lo que en GPU el consumo de memoria sera del orden de 1 GB o ligeramente superior segun el contexto.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM deberia ser suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no hay datos de rendimiento especificos por GPU.
- Opciones de despliegue: el formato `.ggxf` esta disenado para ChatOKF; llama.cpp principal NO puede cargar este archivo (falla con `wrong number of tensors`), por lo que para llama.cpp debe usarse el repositorio upstream de dos archivos con `--mmproj`. Otros runtimes (vLLM, TGI, Ollama) no estan confirmados.
- Latencia y throughput: 151 tokens/s en prefill y 12 tokens/s en decodificacion en iPhone 12 mini; sin datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 2B (este re-host) | ~2B + vision | No disponible | Ternaria Q2_0 + Q8_0 vision | Apache 2.0 | Hugging Face, un solo archivo `.ggxf` |
| Ternary Bonsai 2 2B (upstream) | ~2B + vision | No disponible | Q2_0, PQ2_0, PTQ1_0 + Q8_0 vision | Apache 2.0 | Hugging Face, dos archivos GGUF |
| Qwen3.5-2B (base) | ~2B | No disponible | Multiples (no detalladas) | No disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha documentado soporte multilingue.
- El archivo `.ggxf` no carga en llama.cpp principal ni, previsiblemente, en otros lectores GGUF estandar; esta atado a runtimes que lean el proyector del mismo archivo (ChatOKF).
- Ignorar las claves `prism.hadamard.*` en el runtime produce resultados incorrectos (el autor indica que un lector que las ignore obtiene "basura").
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano.
- Sesgos conocidos: no documentados.
- La perplejidad solo se ha medido en un texto de Simple Wikipedia a contexto 512, una evaluacion muy limitada.
- El re-host no es la fuente autoritativa; para la tarjeta completa, benchmarks, otros empaquetados y el whitepaper debe consultarse el repositorio original.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base (Qwen3.5-2B) segun lo que establezca upstream.

## Enlaces

- Repositorio de este re-host: https://huggingface.co/leok7v/Ternary-Bonsai-2-2B-gguf
- Modelo base declarado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Repositorio de ChatOKF (runtime y herramienta GGUFGraft): no disponible como enlace directo en la informacion proporcionada
- Whitepaper y benchmarks de Prism ML: no disponible como enlace directo en la informacion proporcionada
