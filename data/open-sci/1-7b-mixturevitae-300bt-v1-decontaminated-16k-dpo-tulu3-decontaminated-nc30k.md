# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-nc30k

## Resumen
El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) de la familia MixtureVitae, desarrollado por la organizacion open-sci. Se trata de un transformer decoder-only de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) construido sobre el checkpoint `ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated`, que a su vez deriva de un preentrenamiento sobre 300 mil millones de tokens con un contexto de 16 000 tokens y una etapa posterior de DPO sobre datos Tulu3 decontaminados.

La relevancia de este checkpoint radica en su caracter experimental dentro del ecosistema open-sci: se ha entrenado con el framework LLaMA-Factory en modo full fine-tuning sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30 000 ejemplos conversacionales en formato ShareGPT. El resultado es un modelo pequeno, de licencia restrictiva ("other"), pensado para tareas de generacion y extraccion de caracteristicas en entornos de investigacion con recursos limitados.

No obstante, la model card es practicamente inexistente: no documenta idiomas, no aporta resultados de benchmarks (el `model-index` declara una entrada con `results: []`) y no describe usos previstos. Cualquier evaluacion en produccion debe partir de una validacion empirica propia, ya que la informacion publicada es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de MixtureVitae; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16 000 tokens (heredada del checkpoint base, segun su nombre) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, compatibles con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | other (restrictiva; consultar terminos del autor) |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning completo (no LoRA) del checkpoint base, ejecutado con LLaMA-Factory y registrado como `generated_from_trainer`. El entrenamiento empleo 32 dispositivos GPU con un batch total de 128 (batch por dispositivo 1, acumulacion de gradientes 4), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, learning rate 4e-05, scheduler coseno con warmup del 10 % y 5 epocas sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. El seed fue 42 y el eval batch size de 8 por dispositivo (256 total).

El checkpoint base incorpora en su nombre indicios de un pipeline de tres etapas: preentrenamiento sobre 300 mil millones de tokens (300BT), contexto de 16 000 tokens, y una etapa de DPO sobre datos Tulu3 decontaminados. No se especifica en la informacion disponible la composicion exacta del dataset de preentrenamiento, el numero de tokens efectivos vistos durante el SFT, ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. La arquitectura interna (numero de capas, dimension oculta, cabezas de atencion) tampoco se detalla en la model card.

## Capacidades
- Generacion de texto autoregresiva en formato conversacional, entrenada sobre pares instruccion-respuesta de ShareGPT.
- Razonamiento multi-turno basico, limitado por el tamano del modelo (1,7 B) y por la ausencia de evaluacion publicada.
- Extraccion de caracteristicas (`feature-extraction` como pipeline declarado), util para representaciones de texto en pipelines de investigacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; previsiblemente limitado por el tamano.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- **Generacion de respuestas conversacionales en prototipos**: el modelo puede emplearse como base para asistentes de chat en fase de prueba, aprovechando su contexto de 16 000 tokens para mantener historiales de conversacion moderadamente largos en una unica GPU.
- **Extraccion de embeddings para clasificacion y clustering**: dado su pipeline `feature-extraction`, puede usarse para obtener representaciones de frases o documentos en tareas de analisis de texto, con la ventaja de su reducido tamano (3,4 GB en safetensors).
- **Experimentacion academica con SFT y DPO**: sirve como punto de partida reproducible para estudiar el efecto de distintas etapas de alineacion (preentrenamiento, DPO, SFT) en modelos pequenos, ya que toda la cadena de checkpoints es publica.
- **Generacion de datos sinteticos a pequena escala**: puede producir pares pregunta-respuesta para aumentar datasets de entrenamiento en dominios acotados, siempre con revision humana dado el riesgo de alucinacion.
- **Despliegue en entornos con recursos limitados**: con 1,7 B de parametros cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB en FP16) y permite servir endpoints de baja concurrencia sin infraestructura dedicada.
- **Evaluacion comparativa de tecnicas de decontaminacion**: al formar parte de una familia con sufijos explicitos sobre decontaminacion y DPO, es util para medir como afectan esas etapas al rendimiento en tareas de razonamiento y generacion.
- **Fine-tuning posterior en dominios verticales**: su tamano facilita reentrenamientos completos o con LoRA en una sola maquina, sirviendo como base para adaptaciones a dominios como atencion al cliente o documentacion tecnica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una unica entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__1-7b-Mixtur-9fd25118__sdpa-open-sci-a917a3e6`) con la lista de resultados vacia, por lo que no existen cifras oficiales de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware
- **VRAM estimada para inferencia**: aproximadamente 3,5 GB en FP16 (2 bytes por parametro), en torno a 2 GB en cuantizacion de 8 bits y cerca de 1 GB en 4 bits, sin contar el espacio para el contexto KV cache.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; A100 o H100 no son necesarias y supondrian un sobredimensionamiento. Una RTX 3060, RTX 4060 Ti o RTX 4090 son suficientes.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en GPUs de consumo de gama media y alta.
- **Opciones de despliegue**: transformers (libreria declarada), con soporte previsible para vLLM, llama.cpp, Ollama y TGI tras conversion a los formatos correspondientes (GGUF para llama.cpp/Ollama). El uso de `custom_code` puede requerir `trust_remote_code=True`.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-...-nc30k | 1,7 B | 16 000 | other | SFT sobre Nemotron-Cascade; sin benchmarks publicados |
| ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated | 1,7 B | 16 000 | no disponible | Checkpoint base del anterior; incluye etapa DPO |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 | Apache 2.0 | Modelo pequeno de referencia con benchmarks publicados y amplio soporte de tooling |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 | Apache 2.0 | Alternativa de Hugging Face con evaluacion publica y licencia permisiva |

La comparativa es orientativa: no existen resultados de benchmarks del modelo open-sci que permitan contrastar su rendimiento real frente a Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct. La principal desventaja frente a estos es la licencia "other" y la ausencia de documentacion.

## Limitaciones y advertencias
- **Sesgos conocidos**: no documentados; al derivar de un preentrenamiento de 300 mil millones de tokens sin descripcion de la mezcla, es probable que herede sesgos de la web y de los datos de Tulu3.
- **Riesgo de alucinacion**: alto en un modelo de 1,7 B sin evaluacion publicada; no debe usarse en produccion sin validacion humana o filtros posteriores.
- **Limitaciones de contexto e idioma**: contexto de 16 000 tokens, inferior al de alternativas modernas de su categoria; no se declara que idiomas soporta, por lo que el rendimiento en castellano es incierto.
- **Restricciones de licencia**: la licencia "other" no es permisiva por defecto; es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- **Caveats para produccion**: model card generada automaticamente y sin completar; el `model-index` no aporta resultados; el uso de `custom_code` implica ejecutar codigo remoto y puede romper la compatibilidad con servidores de inferencia estandar; el checkpoint no declara cuantizaciones oficiales ni versiones GGUF.
- **Trazabilidad**: el nombre del repositorio incluye rutas internas de cluster (`/gpfs/scratch/ehpc524/...`) en la descripcion del dataset, lo que sugiere un entrenamiento de investigacion sin pulido de publicacion.

## Enlaces
- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf: no disponible como enlace publico en la informacion proporcionada
- Paper o blog del modelo: no disponible
