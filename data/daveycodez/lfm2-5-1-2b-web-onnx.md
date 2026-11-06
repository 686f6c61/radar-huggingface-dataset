# daveycodez/LFM2.5-1.2B-Web-ONNX

## Resumen

LFM2.5-1.2B-Web-ONNX es una compilación no oficial en ONNX de 4 bits del modelo LFM2.5-1.2B-Instruct de Liquid AI, adaptada por el usuario daveycodez para su ejecución en navegador mediante Transformers.js sobre WebGPU, incluido Safari en iPhone. El modelo base es un transformer de 1.200 millones de parámetros desarrollado por Liquid AI, orientado a generación de texto conversacional y con soporte para diez idiomas, entre ellos el castellano.

La modificación principal respecto al ONNX oficial de Liquid AI no afecta a los pesos, sino al grafo de cómputo: se añade una entrada `num_logits_to_keep` que permite calcular logits únicamente para las últimas posiciones necesarias durante la generación. Esto reduce drásticamente el uso de memoria en prompts largos, un problema crítico en entornos web con límites estrictos de memoria por pestaña.

Su relevancia actual reside en que demuestra que un modelo de 1.200 millones de parámetros puede ejecutarse íntegramente en el dispositivo del usuario, sin servidor, dentro de un navegador móvil, lo que habilita aplicaciones de IA generativa con privacidad por diseño y sin costes de inferencia en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5-1.2B-Instruct de Liquid AI; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16 (4 bits, solo se incluye esta variante) |
| Idiomas soportados | en, ja, ko, fr, es, de, it, pt, ar, zh |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de dolares |
| Formato de pesos | ONNX (model_q4f16.onnx + model_q4f16.onnx_data) |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-1.2B-Instruct de Liquid AI, un transformer de 1.200 millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas internas del modelo original más allá de su naturaleza transformer.

La aportación técnica de esta compilación concreta es la optimización del grafo ONNX para inferencia en navegador. Se añade la entrada `num_logits_to_keep` (escalar int64) que permite recortar los estados ocultos tras la normalización final a las últimas posiciones antes de la cabeza LM. Con `num_logits_to_keep = 1` durante la generación, los logits de un prompt de 800 tokens pasan de un tensor de 209.715.200 bytes a uno de 262.144 bytes. El cambio añade tres nodos (`Neg`, `Unsqueeze`, `Slice`) y tres constantes int64; los pesos son byte-idénticos al original (SHA-256 `46cfacc12941150620a3f644a5269e9baebd75d681cfa09cadeef71b8ed64ac2`). La diferencia máxima en logits del último token es de 0,0078 sobre valores de hasta ±17, con el mismo token top en todas las pruebas.

## Capacidades

- Generación de texto conversacional multi-turno en diez idiomas, incluido el castellano.
- Razonamiento general y respuesta a instrucciones (modelo -Instruct).
- Ejecución íntegra en el cliente mediante Transformers.js y WebGPU, sin backend.
- Compatible con el pipeline `text-generation` de Transformers.js.
- Soporte de prompts largos con memoria controlada gracias a la optimización de logits.
- Capacidad de ejecución en Safari de iPhone, además de navegadores de escritorio con WebGPU.
- Soporte de tool calling: la model card menciona prompts con definición de herramientas de 541 tokens, lo que indica uso en escenarios de function calling.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistentes conversacionales en el navegador: el modelo se ejecuta en el dispositivo del usuario vía WebGPU, de modo que las conversaciones no salen del cliente; adecuado para aplicaciones de privacidad estricta o entornos sin conectividad.
- Aplicaciones web sin backend de inferencia: al eliminar la necesidad de servidores GPU, permite desplegar chatbots y asistentes en sitios estáticos con costes de infraestructura nulos.
- Asistentes con tool calling en el cliente: la optimización de logits evita el desbordamiento de memoria con prompts de herramientas largos (541 tokens probados), lo que habilita function calling dentro del navegador.
- Soporte multilingüe en aplicaciones móviles: con diez idiomas, puede ofrecer atención al usuario en castellano, inglés, francés, alemán, portugués u otros sin cambiar de modelo.
- Prototipado rápido de productos de IA generativa: investigadores y desarrolladores pueden validar ideas de producto en horas sin aprovisionar infraestructura.
- Educación y demos interactivas: permite incrustar un modelo de lenguaje funcional en tutoriales, documentación o demos técnicas que se ejecutan en el navegador del visitante.
- Procesamiento de texto en dispositivos de gama alta: en iPhone con Safari y escritorios con WebGPU, útil para resúmenes, reescritura o clasificación local de documentos.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base. Sí aporta mediciones de rendimiento de la compilación:

| Prueba | Original q4f16 | Esta build |
|---|---|---|
| Logits para prompt de 800 tokens | [1, 800, 65536], 209.715.200 bytes | [1, 1, 65536], 262.144 bytes |
| Diferencia maxima absoluta en logits del ultimo token (5 prompts de 18-963 tokens) | - | <= 0,0078 (logits hasta +-17), mismo token top |
| Diferencia maxima con todas las posiciones (`num_logits_to_keep = 0`) | - | 0 |
| Caches KV y conv tras el prompt | - | identicas |
| 8 pasos de decodificacion greedy tras cada prompt | - | tokens y logits identicos |
| Prompt de herramienta de 541 tokens + 24 tokens nuevos, Transformers.js 4.3.2 en WebGPU (Node, Apple Silicon) | 250-259 ms | 222-228 ms |
| Prompt de 963 tokens, onnxruntime en CPU | 1.669 ms | 1.497 ms |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,6 GB; el modelo en q4f16 requiere aproximadamente esa cantidad de memoria para pesos, más las cachés KV y conv durante la inferencia.
- Ejecutable en navegadores con WebGPU: Chrome/Edge en escritorio, Safari en iPhone (donde una pestaña dispone de unos 2 GB incluyendo memoria GPU).
- No requiere GPU de servidor; la inferencia ocurre en el dispositivo del usuario.
- Despliegue mediante Transformers.js 4.3.2 o superior con `dtype: "q4f16"` y `device: "webgpu"`.
- También ejecutable con onnxruntime directamente (CPU o GPU), pasando `num_logits_to_keep` como escalar int64 (`1` para generación, `0` para todas las posiciones).
- Latencia medida: 222-228 ms para un prompt de 541 tokens más 24 tokens nuevos en WebGPU sobre Apple Silicon; 1.497 ms para un prompt de 963 tokens en CPU con onnxruntime.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato es ONNX y la librería objetivo es Transformers.js.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Web-ONNX (esta build) | 1,2B | no disponible | ONNX q4f16 | LFM Open License v1.0 (comercial < 10 M USD) | Si, WebGPU y Safari iPhone |
| LiquidAI/LFM2.5-1.2B-Instruct-ONNX (original) | 1,2B | no disponible | ONNX q4f16 | LFM Open License v1.0 | Si, pero con mayor consumo de memoria en prompts largos |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | safetensors | LFM Open License v1.0 | No directamente; requiere conversión |
| onnx-community/LFM3-1.7B-ONNX | 1,7B | no disponible | ONNX | no disponible | Si; ya incorpora `num_logits_to_keep` |

No se dispone de datos de benchmarks comparativos de calidad entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Compilación no oficial: no está revisada ni respaldada por Liquid AI; para producción conviene evaluar también el ONNX oficial.
- Solo se incluye la variante q4f16; no hay versiones fp16, int8 ni otras cuantizaciones en este repositorio.
- La licencia LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral se requiere licencia adicional.
- Riesgo de alucinación inherente a un modelo de 1.200 millones de parámetros; no se han publicado evaluaciones de fidelidad factual.
- La longitud de contexto no se especifica en la información disponible, lo que impide garantizar el comportamiento en conversaciones muy largas.
- El rendimiento depende de la implementación de WebGPU del navegador; en dispositivos sin soporte o con GPU integradas lentas la latencia puede degradarse.
- En Safari de iPhone el límite de memoria por pestaña (~2 GB) sigue siendo una restricción real, aunque la optimización de logits la mitiga para prompts largos.
- No se documentan sesgos específicos ni evaluaciones de seguridad del modelo base en la información proporcionada.
- La diferencia numérica en logits del último token (hasta 0,0078) es despreciable en la práctica, pero conviene tenerla en cuenta en aplicaciones que dependan de probabilidades exactas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daveycodez/LFM2.5-1.2B-Web-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- ONNX oficial: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Commit de referencia del ONNX oficial: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX/tree/10f72e70abf67ac0fd7ebf15bc5854726891d864
- Modelo con la misma optimización de logits: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Liquid AI: https://www.liquid.ai/
- Transformers.js: https://github.com/huggingface/transformers.js
