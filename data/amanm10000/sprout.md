# amanm10000/sprout

## Resumen

Sprout es un transformer decoder-only de 32.514.560 parametros entrenado desde inicializacion aleatoria por el autor amanm10000 sobre un prefijo del dataset TinyStories. No es un chatbot ni un modelo que siga instrucciones: su unico proposito es la continuacion de historias cortas en ingles sencillo. Se distribuye como un checkpoint de inferencia (`best.pt`) junto a una implementacion propia en PyTorch, no como un modelo cargable con `AutoModel` de Transformers.

Arquitectonicamente es un transformer clasico de 8 capas, ancho 512, 8 cabezas de atencion y 512 tokens de contexto, con RoPE, RMSNorm, SwiGLU, embeddings no atados y atencion flash en bf16. El tokenizador es un BPE byte-level propio de 8.192 tokens. El entrenamiento completo duro aproximadamente siete horas en una unica RTX 4060, procesando 1.658.695.680 tokens mediante muestreo repetido del corpus.

Su relevancia es fundamentalmente educativa y de investigacion: es un ejemplo reproducible y de coste minimo de entrenamiento *from scratch*, util como referencia para estudiar recetas de entrenamiento, tokenizacion y evaluacion en modelos de escala muy reducida. Con cero descargas y cero likes en el momento de redactar esta ficha, es un experimento personal, no un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, embeddings no atados, flash attention en bf16) |
| Parametros totales | 32.514.560 |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en float32 (`best.pt`), sin versiones cuantizadas publicadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible; el autor no declara una licencia propia para el modelo y remite a los terminos upstream del dataset (CDLA-Sharing-1.0) |
| Formato de pesos | PyTorch `.pt` (`best.pt`) con pesos en float32, configuracion de arquitectura, hash del tokenizador y metadatos; no compatible directamente con `AutoModel` de Transformers |

Datos adicionales: 8 capas, ancho 512, 8 cabezas, tokenizador BPE byte-level de 8.192 tokens, tamano de repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only estandar, sin atencion lineal, SSM ni componentes hibridos. Usa normalizacion RMSNorm, activacion SwiGLU, embeddings de entrada y salida no atados (untied), codificacion posicional rotatoria (RoPE) y atencion flash ejecutada en bf16. No es un modelo MoE. El tokenizador es un BPE byte-level entrenado especificamente para este proyecto, con un vocabulario de 8.192 tokens.

El corpus de entrenamiento es un prefijo del dataset TinyStories: 378.032 historias completas que suman 82.162.213 tokens. La ejecucion de siete horas realizo 89.990 actualizaciones y proceso 1.658.695.680 tokens, lo que implica un muestreo repetido del corpus (aproximadamente 20 pasadas equivalentes). El checkpoint publicado corresponde al paso 67.861, seleccionado por su mejor perdida de validacion monitorizada (1,4100); el checkpoint final del entrenamiento tenia una perdida peor (1,4268) y no se publica como version de inferencia. No se aplico RLHF, DPO ni ningun tipo de alineamiento por preferencias.

La evaluacion de validacion se hizo sobre 24.576 tokens en ventanas fijas muestreadas del split oficial de validacion, no sobre el corpus completo, y la misma muestra se utilizo para seleccionar el mejor checkpoint. No se ejecuto ninguna prueba independiente ni benchmark de test.

## Capacidades

- Generacion y continuacion de historias breves en ingles sencillo, con gramatica simple y estructura narrativa basica.
- Completado de texto condicionado por un `prompt` (la modalidad de uso prevista es la continuacion, no la respuesta a instrucciones).
- Aprendizaje de patrones gramaticales simples y de la estructura tipica de un cuento corto.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingues: solo ingles.
- Sin modo "thinking", vision, audio ni ninguna capacidad multimodal.
- Sin alineamiento de seguridad ni instrucciones: no responde a formatos conversacionales.

## Casos de uso

- Material didactico para ensenar entrenamiento *from scratch*: el repositorio incluye codigo, tokenizador y artefactos de entrenamiento, por lo que sirve para reproducir el pipeline completo (tokenizacion, bucle de entrenamiento, evaluacion) en hardware domestico.
- Baseline de investigacion en generacion de lenguaje: dado su tamano (32,5 M de parametros) y su coste de entrenamiento (siete horas en una RTX 4060), es adecuado como punto de comparacion para experimentos de ablacion sobre arquitectura, tokenizador o datos.
- Prototipado rapido en CPU: al ser un modelo diminuto con pesos float32 y una implementacion PyTorch propia, permite probar ideas de generacion de texto en equipos sin GPU.
- Aumento de datos sinteticos de baja complejidad: puede generar borradores de historias infantiles simples en ingles para experimentos de *data augmentation*, siempre con revision humana y sin uso autonomo.
- Experimentos de *fine-tuning* sobre dominios muy acotados: su tamano reducido facilita reentrenar o ajustar el modelo en un unico GPU de gama media para tareas narrativas muy especificas.
- Estudio de tokenizacion: el tokenizador BPE byte-level personalizado de 8.192 tokens permite analizar el efecto del vocabulario en la calidad de generacion en modelos pequenos.
- Educacion sobre limitaciones de los LLM: es un caso practico para ilustrar alucinacion, perdida de coherencia y ausencia de alineamiento en modelos entrenados solo con *next-token prediction*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna prueba de test independiente.

El unico dato numerico de evaluacion disponible es la perdida de validacion monitorizada:

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de validacion (mejor checkpoint, paso 67.861) | 1,4100 | Sobre 24.576 tokens en ventanas fijas del split oficial de validacion |
| Perdida de validacion (checkpoint final) | 1,4268 | No publicado como version de inferencia |

Estos valores no son comparables con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que el modelo no fue evaluado con esas suites.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 MB en float32 (32,5 M de parametros x 4 bytes) y unos 65 MB en bf16, mas el *overhead* de activaciones sobre 512 tokens de contexto.
- Cabe holgadamente en cualquier GPU de consumo; el propio autor lo entreno en una RTX 4060.
- La ejecucion por defecto es en CPU (`sample.py` sin `--device`), por lo que funciona en equipos sin GPU.
- Para usar bf16 se requiere una GPU CUDA compatible con ese formato (`--device cuda`).
- Opciones de despliegue: unicamente la implementacion PyTorch propia incluida en el repositorio (`sample.py`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en safetensors ni GGUF no es directamente desplegable en esas herramientas sin una conversion previa.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el tiempo de entrenamiento (siete horas para 89.990 actualizaciones en una RTX 4060).

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento de este modelo frente a alternativas, ya que Sprout no tiene benchmarks publicados (solo la perdida de validacion citada). La siguiente tabla recoge caracteristicas estructurales conocidas de modelos de la misma categoria; los valores de los modelos alternativos provienen de su documentacion publica y no forman parte de la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sprout (amanm10000) | 32,5 M | 512 | Prefijo de TinyStories | No declarada; upstream CDLA-Sharing-1.0 | Checkpoint `.pt` + codigo propio en GitHub |
| TinyStories-33M (roneneldan/Microsoft) | ~33 M (no verificado en esta busqueda) | no disponible | TinyStories | no disponible | Pesos en HuggingFace |
| GPT-2 small | 124 M | 1024 | WebText | MIT (segun su publicacion original) | Ampliamente disponible |
| TinyLlama-1.1B | ~1,1 B | 2048 | no disponible | Apache-2.0 | Pesos en safetensors y GGUF |

El comparable mas directo por tamano y dominio es la familia TinyStories-33M, entrenada sobre el mismo dataset. La comparacion de calidad no puede establecerse sin benchmarks comunes, que Sprout no aporta.

## Limitaciones y advertencias

- No es un chatbot ni un modelo de instrucciones: no sigue ordenes ni mantiene conversaciones.
- Perdida de coherencia narrativa: segun el propio autor, inventa objetos (props), cambia pronombres y roles de los hablantes y pierde la continuidad del argumento.
- Riesgo de alucinacion: puede generar texto sesgado, inseguro o incorrecto; no esta alineado en seguridad.
- No debe usarse como aplicacion infantil sin supervision ni como asistente factual.
- Limitacion de contexto: 512 tokens, insuficiente para documentos largos.
- Solo ingles; no soporta otros idiomas.
- Licencia poco clara: no hay una concesion de licencia propia para el modelo en esta version; hay que revisar los terminos upstream del dataset (CDLA-Sharing-1.0) y contactar con el autor para dudas de licencia. Esto restringe el uso comercial sin aclaracion previa.
- Los datos de entrenamiento no se redistribuyen en el repositorio.
- Evaluacion limitada: la validacion se hizo sobre una muestra de 24.576 tokens y la misma muestra sirvio para seleccionar el mejor checkpoint, por lo que la perdida reportada puede estar optimistamente sesgada y no constituye una medida de generalizacion independiente.
- Compatibilidad: el checkpoint no se carga con `AutoModel` de Transformers ni con APIs de inferencia alojadas; requiere ejecutar el codigo Python incluido, que conviene revisar antes de lanzarlo.
- El checkpoint publicado no permite reanudar el entrenamiento de forma exacta, ya que se elimino el estado del optimizador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amanm10000/sprout
- Repositorio de codigo y artefactos de entrenamiento: https://github.com/amanmprojects/sprout
- Notas de resultados y limitaciones (FINDINGS.md): https://github.com/amanmprojects/sprout/blob/main/FINDINGS.md
- Dataset de origen (TinyStories): https://huggingface.co/datasets/roneneldan/TinyStories
- Pagina oficial de TinyStories (Microsoft Research): no disponible en la informacion proporcionada
