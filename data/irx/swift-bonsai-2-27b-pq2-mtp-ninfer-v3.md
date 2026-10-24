# iRx/Swift-Bonsai-2-27B-PQ2-MTP-NInfer-v3

## Resumen

Swift-Bonsai-2-27B-PQ2-MTP-NInfer-v3 es un artefacto de inferencia empaquetado para el motor NInfer, publicado por el usuario iRx (exp20) como repack de la comunidad. No se trata de un modelo entrenado desde cero, sino de una cadena de conversiones y cuantizaciones sobre Qwen3.8-27B de Alibaba Cloud: Prism ML lo convirtió a formato ternario (Ternary Bonsai 2 27B), UkisAI aplicó su corrección de eficiencia de razonamiento (Swift), ProCreations adaptó una cabeza MTP (multi-token prediction) y finalmente se empaquetó en el contenedor NInfer v3 con cuantización PQ2 de 2 bits y grupo de 128.

El repositorio contiene únicamente los pesos y metadatos; el motor de inferencia no se distribuye en Hugging Face. Para ejecutarlo, el autor remite a un bundle de Kaggle con un motor L4 precompilado y validado. El tamaño del repo es de 8,1 GB, coherente con 27 000 millones de parámetros a 2 bits más los artefactos de la cabeza MTP y las licencias.

Su relevancia es acotada y experimental: ilustra la viabilidad de ejecutar un modelo de 27B en GPUs de gama media-alta mediante cuantización ternaria agresiva y decodificación especulativa con cabeza MTP, pero es un release de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin garantías de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), pesos ternarios / 2 bits; no se documenta si es denso o MoE |
| Parametros totales | 27B (27 000 millones, según la denominación del modelo base) |
| Parametros activos | no disponible (no se describe como MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0_G128 (2 bits, grupo de 128). El ecosistema Swift Bonsai 2 ofrece además PTQ1_0_G128 (ternario, 1 bit) en artefactos hermanos |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache-2.0 (con ficheros `licenses/LICENSE` y `licenses/NOTICE` en el repo) |
| Formato de pesos | Contenedor propietario NInfer v3 (artefacto nativo del motor NInfer); los GGUF equivalentes de UkisAI son 1-bit (5,947 GB) y 2-bit (7,206 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer correspondiente a Qwen3.8-27B de Alibaba Cloud, transformado por Prism ML en una build ternaria denominada Ternary Bonsai 2 27B. Sobre esa base, UkisAI aplicó una corrección orientada a la eficiencia de razonamiento (el componente «Swift») y ProCreations añadió una cabeza MTP, técnica de predicción multi-token que habilita decodificación especulativa: la cabeza propone varios tokens por paso y el modelo principal los verifica, reduciendo el número de pasos autorregresivos.

El proceso de este repositorio concreto es de empaquetado, no de entrenamiento. Según la documentación del artefacto hermano de fyb1214, los códigos ternarios se trasladan byte a byte desde el GGUF de origen al contenedor NInfer, sin dequantizar y sin recuantizar. Es decir, la fidelidad numérica respecto al GGUF original está garantizada por construcción, y la cuantización PQ2_0_G128 con grupo de 128 es la que ya venía aplicada en origen.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO en el modelo base. UkisAI califica su release como «experimental research release», sin detallar la metodología de la corrección Swift más allá de describirla como trabajo de eficiencia de razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados del modelo base Qwen3.8-27B, con la corrección de eficiencia de razonamiento de UkisAI orientada a reducir cadenas de pensamiento innecesariamente largas.
- Decodificación especulativa mediante cabeza MTP, que acelera la generación al proponer y verificar varios tokens por paso.
- Ejecución en contenedor NInfer v3, con un motor L4 precompilado disponible en el bundle de Kaggle del autor.
- Cuantización ternaria de 2 bits con grupo de 128, que reduce el peso a aproximadamente 8 GB en disco.
- Capacidades multilingües: no disponibles en la documentación del modelo (el base es presumiblemente multilingüe por su origen Qwen, pero la model card no lo declara y no se debe asumir).
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema: sirve como banco de pruebas para medir la degradación de calidad de un modelo de 27B comprimido a 2 bits ternarios con grupo de 128, comparando las salidas contra el GGUF de origen, que es idéntico bit a bit.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir la ganancia real de throughput frente a decodificación autorregresiva estándar en el mismo hardware, un experimento habitual en investigación de inferencia.
- Despliegue local en GPU de consumo: con ~8 GB de pesos, el modelo cabe en tarjetas de 12-24 GB y permite experimentar con un 27B en una estación de trabajo sin clúster.
- Inferencia en el borde o en entornos con memoria limitada: el tamaño reducido facilita probar el modelo en dispositivos con restricciones severas de VRAM o incluso en RAM unificada, siempre que se disponga del runtime NInfer.
- Reproducción de pipelines de conversión GGUF a contenedor NInfer: el repo documenta implícitamente un flujo de trabajo reutilizable para portar otros modelos ternarios al motor NInfer.
- Integración en hosts nativos: el proyecto bonsai-swift en GitHub demuestra un host en Swift sobre el runtime Core AI de Apple, sin Python en tiempo de ejecución, lo que abre la puerta a prototipos en macOS sobre silicio de Apple.
- Docencia y demostraciones: al ser un artefacto pequeño y con licencia Apache-2.0, es adecuado para explicar en clase cómo se encadenan cuantización ternaria, cabezas MTP y motores de inferencia especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones en los resultados de búsqueda. UkisAI describe su release como experimental y no aporta cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB de pesos en disco para PQ2_0_G128; se debe añadir el espacio de activaciones, KV cache y buffers del motor NInfer, no cuantificado en la documentación. Con contexto largo, la VRAM efectiva puede superar holgadamente los 8 GB.
- GPU recomendadas: el autor publica un motor precompilado y validado para NVIDIA L4 (24 GB), lo que constituye la referencia soportada. Por tamaño de pesos, una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100/H100 son candidatas razonables, pero no hay validación documentada para ellas.
- Cabe en GPU de consumo: sí en términos de pesos (8 GB encajan en tarjetas de 12 GB o más como RTX 3060 12 GB, RTX 4070, RTX 4080), condicionado a que exista un build de NInfer para esa arquitectura, extremo no confirmado.
- Opciones de despliegue: motor NInfer v3 (runtime propio, no incluido en el repo); bundle de Kaggle con motor L4 precompilado; los GGUF equivalentes de UkisAI permiten, en teoría, usar llama.cpp u Ollama, aunque la ficha de este repositorio no lo garantiza.
- Latencia y throughput: no disponibles. La cabeza MTP está diseñada para mejorar el throughput, pero no se publican tokens por segundo ni factores de aceleración medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iRx/Swift-Bonsai-2-27B-PQ2-MTP-NInfer-v3 (este) | 27B | no disponible | PQ2_0_G128 (2 bits) + MTP | Apache-2.0 | Repo de 8,1 GB; motor solo vía Kaggle; 0 descargas |
| fyb1214/Swift-Bonsai-2-27B-NInfer | 27B | no disponible | PQ2_0_G128 y PTQ1_0_G128 | Apache-2.0 | Empaquetado NInfer del mismo linaje, sin cabeza MTP documentada |
| UkisAI Swift Bonsai 2 (GGUF) | 27B | no disponible | 1 bit (5,947 GB) y 2 bits (7,206 GB) | Apache-2.0 | GGUF directamente utilizable en runtimes estándar |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | ternario | Apache-2.0 (según linaje) | Modelo de origen del que derivan los anteriores |

La comparativa relevante es interna al linaje: este artefacto se distingue por incluir la cabeza MTP y por usar el contenedor NInfer v3, mientras que los GGUF de UkisAI son más portables pero no incorporan la aceleración especulativa en el mismo paquete.

## Limitaciones y advertencias

- Modelo de investigación: UkisAI califica explícitamente el release como experimental; no hay garantías de estabilidad, calidad ni soporte.
- Sin benchmarks: no existe ninguna evaluación pública de calidad, lo que impide estimar la degradación introducida por la cuantización ternaria de 2 bits frente al modelo original.
- Dependencia del runtime: el motor NInfer no se distribuye en el repositorio. Sin el bundle de Kaggle o un build propio, el artefacto es inutilizable.
- Riesgo de alucinación: no cuantificado en la documentación. La compresión extrema a 2 bits es un factor de riesgo adicional conocido en modelos ternarios, pero no se aportan mediciones.
- Idiomas: no declarados. No se debe asumir cobertura multilingüe sin verificación empírica, pese al origen Qwen del modelo base.
- Longitud de contexto: no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Trazabilidad de licencias: el repo incluye `licenses/LICENSE` y `licenses/NOTICE`, pero al ser un repack comunitario de cuarta generación conviene auditar la cadena completa (Alibaba Cloud, Prism ML, UkisAI, ProCreations, NInfer contributors) antes de un uso comercial.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción ni de mantenimiento continuado.
- Fecha: el repositorio está fechado en octubre de 2026, por lo que cualquier evaluación debe considerar que el ecosistema de modelos de referencia puede haber cambiado sustancialmente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/iRx/Swift-Bonsai-2-27B-PQ2-MTP-NInfer-v3
- Bundle de Kaggle con motor L4 precompilado: https://www.kaggle.com/datasets/irohith/swift-bonsai-2-27b-pq2-mtp-ninfer-v3
- Repack hermano en NInfer (fyb1214): https://huggingface.co/fyb1214/Swift-Bonsai-2-27B-NInfer
- Página oficial de Swift Bonsai 2 (UkisAI): https://ukisai.com/swift-bonsai-2
- Colección Swift Bonsai 2 en Hugging Face: https://huggingface.co/collections/ukisai/swift-bonsai-2
- Descargas de Swift (UkisAI): https://ukisai.com/swift/downloads
- Host nativo en Swift para Bonsai 2 27B (GitHub): https://github.com/RahulRachuri/bonsai-swift
