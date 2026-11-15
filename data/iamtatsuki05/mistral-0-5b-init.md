# iamtatsuki05/Mistral-0.5B-init

## Resumen

Mistral-0.5B-init es un checkpoint de Mistral con inicializacion aleatoria publicado por el usuario iamtatsuki05 (proyecto MIREI). No es un modelo entrenado ni utilizable para inferencia real: se trata del punto de partida de un ablation sobre la configuracion del decoder en la serie de 0,5B en ingles. Reutiliza la configuracion y el tokenizador de `instruction-pretrain/InstructLM-500M`, por lo que su valor es experimental y de reproducibilidad, no de uso final.

El modelo cuenta con 567.854.592 parametros reales (518M segun la model card, 469M sin embeddings), una dimension de embedding de 1536 y una longitud maxima de secuencia de 2048 tokens. Emplea arquitectura Mistral clasica con RoPE y un tokenizador de vocabulario 32.000.

Su relevancia es acotada: sirve como referencia base para comparar configuraciones de decoder (Mistral frente a Qwen2.5 en la misma serie) antes del entrenamiento. Cualquier uso en produccion debe descartarse, ya que los pesos son aleatorios y la generacion sera incoherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder-only) |
| Parametros totales | 567.854.592 (518M segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint bfloat16 para entrenamiento/ablation) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.536 |
| Tokenizador | Mistral, vocabulario 32.000 |
| Codificacion posicional | RoPE |
| Parametros sin embeddings | 469M |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la arquitectura Mistral, equipado con RoPE como codificacion posicional y flash attention 2 en la configuracion de referencia. La dimension de embedding es 1536 y el contexto maximo es de 2048 tokens. No incorpora innovaciones tecnicas adicionales respecto a la familia Mistral.

El checkpoint es de inicializacion aleatoria: no ha recibido preentrenamiento, ajuste supervisado ni RLHF/DPO. Segun la model card, forma parte de un ablation sobre la configuracion del decoder en la serie de 0,5B en ingles, y reutiliza el tokenizador de `instruction-pretrain/InstructLM-500M`. Por tanto, no hay datos de entrenamiento, numero de tokens ni composicion del dataset que reportar.

## Capacidades

- No dispone de capacidades funcionales: los pesos son aleatorios y la generacion de texto sera incoherente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Soporte multilingue limitado al ingles por diseno del tokenizador y del ablation.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Utilidad real: servir como inicializacion controlada y reproducible para experimentos de entrenamiento sobre configuracion de decoder.

## Casos de uso

- Reproducibilidad de ablations: punto de partida fijo para comparar Mistral frente a Qwen2.5 en la serie de 0,5B con identicas condiciones de inicializacion.
- Investigacion academica sobre arquitecturas: permite aislar el efecto de la configuracion del decoder sin interferencia de pesos preentrenados.
- Validacion de pipelines de entrenamiento: comprobar que el bucle de entrenamiento, el guardado de checkpoints y la carga con `transformers` funcionan antes de lanzar entrenamientos costosos.
- Pruebas de integracion de infraestructura: verificar el despliegue con `flash-attn`, `accelerate` y `device_map` en entornos de investigacion.
- Benchmarking de inicializacion: medir estadisticas de activaciones y gradientes en un modelo de 0,5B sin sesgos de preentrenamiento.
- Docencia y experimentacion educativa: estudiar el comportamiento de un transformer desde cero con un coste computacional bajo.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, analisis de documentos ni ninguna tarea generativa real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un checkpoint de inicializacion aleatoria, no tiene sentido evaluar MMLU, HumanEval ni GSM8K: los resultados serian equivalentes a una linea base sin aprendizaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB en bfloat16 para los pesos (tamano del repo), mas activaciones segun batch y longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia con bfloat16 o fp16; por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 4 GB o mas.
- Opciones de despliegue: `transformers` con `accelerate` y `flash-attn` segun la model card; compatible con text-generation-inference y endpoints. No se documenta soporte explicito para llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 0,5B el coste por token es bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| Mistral-0.5B-init (este) | 518M (469M sin emb.) | 2.048 | Inicializacion aleatoria | MIT |
| Qwen2.5-0.5B-init | 494M (357M sin emb.) | no disponible | Inicializacion aleatoria | no disponible |
| InstructLM-500M | no disponible | no disponible | Modelo entrenado (fuente del tokenizador) | no disponible |

La comparativa se limita a los modelos de la misma serie de ablations de MIREI. No se dispone de datos de rendimiento para comparar, ya que ninguno de los checkpoints de inicializacion ha sido evaluado.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente y no debe usarse en produccion ni en demos publicas.
- Riesgo de alucinacion total: cualquier salida es esencialmente ruido estadistico.
- Sesgos conocidos: no evaluables, al no haber entrenamiento; los sesgos heredados dependeran del futuro entrenamiento.
- Limitacion de idioma: disenado unicamente para ingles.
- Limitacion de contexto: 2048 tokens, inferior a los estandares actuales de modelos comparables.
- Licencia MIT: permite uso comercial, pero el estado del checkpoint lo hace irrelevante para produccion.
- Requiere `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0` y `flash-attn>=2.7.3` segun la model card.
- Fecha de creacion declarada en 2026-07-13; verificar la vigencia del proyecto MIREI antes de basarse en el.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Mistral-0.5B-init
- Coleccion MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo hermano Qwen2.5-0.5B-init: https://huggingface.co/iamtatsuki05/Qwen2.5-0.5B-init
- Modelo fuente del tokenizador: https://huggingface.co/instruction-pretrain/InstructLM-500M
- Licencia MIT: https://opensource.org/license/mit/
- Cita (NLP2026): articulo de Okada y Sugimoto sobre analisis de arquitecturas encoder/decoder en embeddings de frases.
