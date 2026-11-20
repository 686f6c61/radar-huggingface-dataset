# CladeTeam/CENO-1.3B-A450M-base

## Resumen

CENO-1.3B-A450M-base es el checkpoint base de preentrenamiento de CENO, un modelo fundacional de ADN desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H), sin entradas de alineamiento multiple de secuencias (MSA). Con 1.302 millones de parametros totales y aproximadamente 450 millones activos por token (8 expertos con top-2), el modelo esta disenado para generacion de secuencia genomica y extraccion de embeddings.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de 512 entradas. Esta orientado a tareas de genomica computacional: generacion de secuencias, adaptacion downstream mediante fine-tuning o probing, y sirve como base para la familia CENO, que incluye checkpoints con MSA (CENO-P-*) orientados a prediccion de efectos de variantes (VEP) mediante comparacion de log-verosimilitud entre secuencia wild-type y variante.

Es relevante ahora porque aplica una arquitectura hibrida estado-espacio/atencion/MoE, poco comun en el dominio genomico, a un modelo de tamano contenido (1.3B) con licencia Apache-2.0, lo que facilita su uso comercial y su adaptacion. El checkpoint es cargable de forma autonoma con `trust_remote_code=True` y esta publicado en Hugging Face con casi 2.000 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), transformer causal con capas de estado-espacio |
| Parametros totales | 1.302.429.280 (1.3B) |
| Parametros activos | Aproximadamente 450M por token (8 expertos, top-2) |
| Longitud de contexto | Hasta 131.072 tokens por prefill en la ruta HF (single-GPU, unpadded); prefills mayores via vLLM |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | No aplica / no disponible (modelo de secuencia genomica, tokenizador a nivel de caracter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `model_type` ceno, `CENOForCausalLM`) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Nemotron-H que combina capas Mamba (modelos de espacio de estados), capas de atencion y capas Mixture-of-Experts. El modelo tiene 38 capas ocultas, tamano oculto de 1024, 16 cabezas de atencion y tamano intermedio de 4096. La capa MoE consta de 8 expertos con enrutamiento top-2 por token, lo que resulta en aproximadamente 450M parametros activos sobre los 1.3B totales. El tokenizador es a nivel de caracter, mapeando cada base de ADN a su codigo ASCII de byte, con un vocabulario de 512 entradas; deriva del `CharLevelTokenizer` de Evo2 (Arc Institute).

El checkpoint corresponde a la etapa 2 de preentrenamiento base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3, con entornos separados para HF y vLLM. El codigo del modelo deriva de la implementacion de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Generacion de secuencia genomica de forma causal sobre ADN codificado a nivel de caracter.
- Extraccion de embeddings de secuencias genomicas para tareas downstream.
- Adaptacion mediante fine-tuning y probing para tareas especificas de genomica.
- Base para la familia CENO-P-*, orientada a prediccion de efectos de variantes (VEP) por comparacion de log-verosimilitud entre secuencia wild-type y variante.
- Procesamiento de contexto largo: hasta 131.072 tokens por prefill en la ruta HF y prefills mayores mediante vLLM.
- Eficiencia computacional por el uso de MoE con top-2 (aproximadamente 450M parametros activos).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de secuencias de ADN sinteticas: el modelo puede generar secuencias genomicas base a base, util para diseno exploratorio y aumento de datos en pipelines de genomica, aprovechando su naturaleza causal y su tokenizacion a nivel de caracter.
- Extraccion de embeddings para clasificacion genomica: se pueden obtener representaciones de secuencias para entrenar clasificadores ligeros (probes) sobre elementos regulatorios, regiones codificantes u otras etiquetas, sin reentrenar el modelo completo.
- Fine-tuning para tareas genomicas especificas: al ser un checkpoint base con licencia Apache-2.0, es adecuado como punto de partida para adaptar el modelo a dominios concretos (por ejemplo, familias genicas o especies) con datasets propios.
- Prediccion de efectos de variantes (VEP): sirve de base para la variante CENO-P-* con MSA, donde se puntua la diferencia de log-verosimilitud entre secuencia wild-type y variante para priorizar variantes candidatas.
- Analisis de contexto genomico largo: con hasta 131.072 tokens por prefill en HF (y mas via vLLM), permite modelar regiones extensas de ADN que no caben en modelos de contexto corto, como locus completos o clusters genicos.
- Investigacion en modelos de lenguaje para biologia: su combinacion de Mamba, atencion y MoE lo convierte en un banco de pruebas para estudiar arquitecturas hibridas en el dominio genomico frente a transformers puros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se distribuye en bfloat16 con 1.302M parametros, lo que supone aproximadamente 2,6 GB de pesos; el consumo real de VRAM es mayor por estados de activacion, cache y kernels. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels de Mamba; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: probablemente si, dado el tamano de pesos (~2,6 GB en bf16), pero no se confirma en la informacion disponible; las capas Mamba exigen CUDA, por lo que no funciona en CPU para forward/generacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF, single-GPU, unpadded, maximo 131.072 tokens por prefill) y una entrada vLLM mantenida en el repositorio de codigo para prefills mayores. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1.3B-A450M-base | 1.3B (~450M activos) | 131.072 tokens por prefill (HF) | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible | No disponible (origen del tokenizador) | No disponible | No disponible |
| Nemotron-H (NVIDIA) | No disponible en la informacion | No disponible | Hibrida Mamba/Attention/MoE (arquitectura base) | Apache-2.0 (implementacion HF) | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan una comparacion cuantitativa con alternativas genomicas de tamano similar.

## Limitaciones y advertencias

- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas deben validarse experimentalmente.
- Modelo base de preentrenamiento: no esta alineado ni ajustado para instrucciones, por lo que su uso directo en tareas concretas requiere adaptacion.
- Las capas Mamba requieren kernels CUDA; no es posible ejecutar forward ni generacion en CPU.
- La ruta de inferencia HF es single-GPU, unpadded y limitada a 131.072 tokens por prefill; para contextos mayores hay que usar la entrada vLLM del repositorio.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible; por su naturaleza (secuencia genomica) el concepto de idioma no aplica.
- Licencia Apache-2.0: permite uso comercial, pero el codigo del modelo deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute), ambos Apache-2.0; deben respetarse los ficheros `LICENSE` y `NOTICE` con la atribucion completa.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; conviene auditar el codigo antes de usarlo en produccion.
- No se especifican datos de entrenamiento (tokens, composicion, alineacion), lo que limita la evaluacion de su cobertura y posibles sesgos de dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-1.3B-A450M-base
- Repositorio de codigo CENO (codigo del modelo, pipeline VEP y demo de generacion): https://github.com/CladeTeam/CENO
- Implementacion de referencia Nemotron-H de NVIDIA en Hugging Face (citada como origen del codigo): no disponible (enlace no proporcionado en la informacion)
- Evo2 / Arc Institute `CharLevelTokenizer` (citado como origen del tokenizador): no disponible (enlace no proporcionado en la informacion)
