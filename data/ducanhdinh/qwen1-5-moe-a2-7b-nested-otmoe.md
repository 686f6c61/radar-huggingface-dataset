# ducanhdinh/Qwen1.5-MoE-A2.7B-Nested-OTMoE

## Resumen
Ducanhdinh/Qwen1.5-MoE-A2.7B-Nested-OTMoE es un adaptador LoRA (PEFT) publicado en Hugging Face sobre el modelo base Qwen/Qwen1.5-MoE-A2.7B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de aproximadamente 0,3 GB que debe cargarse junto al checkpoint original de Qwen. El nombre sugiere una experimentacion con enrutamiento de expertos anidado (nested) y tecnicas de optimal transport aplicadas a la mezcla de expertos, aunque la model card no documenta el metodo.

La relevancia del artefacto es limitada: cuenta con cero descargas y cero likes en el momento de la consulta, la model card es la plantilla por defecto sin rellenar y no se aportan datos sobre datos de entrenamiento, hiperparametros, evaluacion ni licencia. Cualquier uso en produccion exige auditoria previa del adaptador y del modelo base.

La ficha describe, por tanto, el modelo base subyacente (Qwen1.5-MoE-A2.7B, arquitectura MoE con 14.300 millones de parametros totales y 2.700 millones activos, contexto de 32.768 tokens) y advierte de que las capacidades reales del adaptador no estan verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (Qwen1.5-MoE-A2.7B) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 14.300 millones |
| Parametros activos | No disponible para el adaptador; el modelo base activa 2.700 millones por token |
| Longitud de contexto | No disponible en el adaptador; el modelo base soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen1.5 cubre principalmente ingles y chino |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA gestionado con la libreria PEFT 0.20.0, segun los metadatos del repositorio. Se aplica sobre Qwen1.5-MoE-A2.7B, un transformer de tipo mixture-of-experts con 60 expertos por capa y enrutamiento top-4, del que se activan aproximadamente 2.700 millones de parametros por token sobre un total de 14.300 millones. El nombre del repositorio sugiere variantes "Nested" y "OTMoE" (optimal transport MoE), pero no hay documentacion que describa la modificacion concreta ni si afecta al enrutador o solo a las matrices de proyeccion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el uso de RLHF/DPO, los hiperparametros del LoRA (rango, alpha, modulos objetivo) ni la duracion del entrenamiento. La model card mantiene todos los campos en "[More Information Needed]". Tampoco se indica si el adaptador fue entrenado con tecnicas de decodificacion especulativa, atencion lineal u otras innovaciones.

## Capacidades
- Generacion de texto autoregresiva heredada del modelo base Qwen1.5-MoE-A2.7B.
- Razonamiento y codigo: el modelo base declara capacidades competitivas en tareas de codigo y matematicas, aunque no se han verificado en este adaptador.
- Soporte multilingue limitado al modelo base (principalmente ingles y chino; el castellano no esta garantizado).
- Tool calling y function calling: el modelo base Qwen1.5 incorpora plantillas de chat compatibles con herramientas, pero no hay evidencia de que el adaptador las preserve.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Modo thinking, vision o audio: no disponibles.
- El adaptador en si no anade capacidades documentadas; su efecto real es desconocido.

## Casos de uso
- Experimentacion academica con enrutamiento MoE: el adaptador puede servir para reproducir o comparar variantes de enrutamiento (nested, optimal transport) frente al enrutador original de Qwen1.5-MoE, siempre que se audite el codigo de carga.
- Investigacion sobre eficiencia de adaptadores: al ocupar solo 0,3 GB, permite probar tecnicas PEFT sobre un MoE de 14.300 millones de parametros en entornos con VRAM limitada para el adaptador (aunque el modelo base sigue requiriendo su propio espacio).
- Fine-tuning de bajo coste en dominios verticales: un equipo puede partir de este adaptador como punto de partida para ajustes posteriores, verificando antes que no degrada el rendimiento del modelo base.
- Evaluacion comparativa de adaptadores comunitarios: util como caso de estudio en pipelines de evaluacion automatica (MMLU, HumanEval) para medir el impacto de adaptadores no documentados.
- Docencia y formacion: sirve para ilustrar como se publica un adaptador LoRA en Hugging Face y que metadatos minimos deberia incluir una model card.
- Generacion de texto asistida en ingles o chino: solo si las pruebas internas confirman que el adaptador mantiene la calidad del modelo base; no recomendado para castellano sin validacion previa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El adaptador LoRA ocupa aproximadamente 0,3 GB en disco y puede cargarse en cualquier GPU con al menos 1 GB de VRAM libre adicional.
- El modelo base Qwen1.5-MoE-A2.7B requiere, en bf16, alrededor de 28-30 GB de VRAM para los pesos completos; con cuantizacion de 4 bits (GPTQ/AWQ/GGUF) puede reducirse a unos 8-10 GB.
- GPU recomendadas para el modelo base en bf16: A100 40/80 GB, H100, L40S o dos RTX 4090 de 24 GB en paralelo.
- En consumer GPU: una RTX 4090 de 24 GB puede ejecutar el modelo base cuantizado a 4 bits; una RTX 3090 o 4080 tambien es viable con cuantizacion agresiva.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM, TGI o llama.cpp para el modelo base (el soporte de adaptadores LoRA varia segun la version de cada motor).
- Latencia y throughput: no disponibles para el adaptador; el modelo base, al activar solo 2.700 millones de parametros por token, ofrece un throughput superior al de un denso de 14.000 millones, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducanhdinh/Qwen1.5-MoE-A2.7B-Nested-OTMoE (adaptador) | No disponible / no disponible (base: 14,3B / 2,7B) | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen1.5-MoE-A2.7B (modelo base) | 14,3B / 2,7B | 32.768 | Apache 2.0 (segun el repositorio oficial de Qwen) | Hugging Face, ampliamente descargado |
| Mixtral-8x7B (referencia MoE) | 46,7B / 12,9B | 32.768 | Apache 2.0 | Hugging Face |
| DeepSeek-MoE-16B | 16,4B / 2,8B | 4.096 | DeepSeek License | Hugging Face |

La comparativa se limita a caracteristicas del modelo base, ya que el adaptador no publica metricas propias.

## Limitaciones y advertencias
- Model card vacia: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto; el adaptador no es auditable.
- Licencia no disponible: no puede asumirse uso comercial; hay que contactar con el autor o verificar la licencia del modelo base (Apache 2.0 en Qwen1.5-MoE-A2.7B).
- Cero descargas y cero likes: no hay evidencia de que el adaptador funcione correctamente ni de que no degrade el modelo base.
- Riesgo de alucinacion heredado del modelo base, no mitigado ni documentado en el adaptador.
- Idiomas no declarados: el castellano no esta garantizado; el modelo base esta optimizado para ingles y chino.
- Posibles sesgos del modelo base (datos web multilingues) sin analisis especifico en el adaptador.
- El nombre "Nested-OTMoE" sugiere modificaciones en el enrutador que podrian romper la compatibilidad con implementaciones estandar de transformers; es necesario revisar el codigo de carga.
- No apto para produccion sin una evaluacion interna completa (calidad, seguridad, sesgos y latencia).

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-Nested-OTMoE
- Modelo base Qwen1.5-MoE-A2.7B: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Repositorio Qwen en GitHub: https://github.com/QwenLM/Qwen1.5
- Paper de referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
