# Codemaster67/Unichem_chebi_10M_tokens

## Resumen

Unichem_chebi_10M_tokens es un adaptador QLoRA de PEFT publicado por el usuario Codemaster67 sobre el modelo base allenai/OLMo-1B-hf, un transformer causal de aproximadamente 1.000 millones de parametros. El adaptador se ha entrenado para modelado de lenguaje en el dominio de la quimica, concretamente sobre cadenas SMILES, utilizando el dataset Codemaster67/Unichem_chebi_10M. No es por tanto un modelo autonomo: requiere cargar el checkpoint base en 4 bits y superponerle las matrices LoRA para poder ejecutarse.

La relevancia de esta publicacion es limitada y muy especializada. Se trata de un ajuste de bajo rango (r=64, alpha=128, target all-linear) sobre una base cuantizada en NF4 con doble cuantizacion, orientado a generacion y completado de SMILES y a servir como punto de partida para tareas posteriores de prediccion de propiedades moleculares. El repositorio ocupa 1,0 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un experimento de investigacion mas que un artefacto listo para produccion.

Conviene senalar una inconsistencia documental: el titulo de la model card dice "OLMo-7B QLoRA Adapter", pero el campo base_model y el codigo de uso apuntan a allenai/OLMo-1B-hf. El propio autor no publica resultados de benchmarks ni una evaluacion de calidad de los SMILES generados, solo las perdidas de entrenamiento y validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) del modelo base OLMo; adaptador LoRA sobre proyecciones all-linear |
| Parametros totales | No disponible con precision. Modelo base allenai/OLMo-1B-hf (aproximadamente 1.000 millones) mas las matrices LoRA y las capas embed_tokens/lm_head guardadas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la documentacion del adaptador; el entrenamiento se realizo con max_seq_length de 512 tokens |
| Tipos de cuantizacion | Base cargada en NF4 de 4 bits con doble cuantizacion (bitsandbytes); adaptadores y capas guardadas en bfloat16. No se publican cuantizaciones GGUF ni GPTQ |
| Idiomas soportados | Ingles (en), segun los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el checkpoint base en formato HuggingFace |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA: el modelo base OLMo-1B se carga en precision 4 bits NF4 con doble cuantizacion y dtype de computo bfloat16, y sobre el se entrenan matrices LoRA de rango 64 y alpha 128 (escalado efectivo 2.0), con dropout 0.01 y sin RSLoRA. Los modulos objetivo son todas las capas lineales (all-linear). Ademas, se guardan copias completas y entrenables de embed_tokens y lm_head mediante modules_to_save, algo coherente con el modelo hermano del mismo autor (Codemaster67/Olmo_10M_tok_unichem_fineweb), donde el tokenizador se extendio con unos 300 tokens quimicos de SPE (SMILES Pair Encoding) mas los tokens especiales <|start_of_smiles|> y <|end_of_smiles|>.

El entrenamiento usa tasas de aprendizaje desacopladas: 2e-05 para los adaptadores LoRA y 2e-06 (diez veces menor) para embed_tokens y lm_head, con el objetivo declarado de evitar olvido catastrofico del vocabulario base. Se realizo una unica epoca con optimizador AdamW de 8 bits, batch efectivo de 32 (batch por dispositivo 32, sin acumulacion de gradiente), scheduler coseno con warmup del 10 por ciento, weight decay 0.01, gradient checkpointing activado y una division de validacion del 5 por ciento. Se empaquetaron 18.848 secuencias de entrenamiento y 990 de validacion. Las perdidas resultantes fueron 1,0884 en entrenamiento y 0,9855 en validacion. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, ni innovaciones de decodificacion (por ejemplo, decodificacion especulativa).

## Capacidades

- Generacion de texto en el dominio quimico especializada en cadenas SMILES, con tokens delimitadores <|start_of_smiles|> y <|end_of_smiles|>.
- Completado de SMILES: dada una cadena parcial, el modelo puede continuarla.
- Modelado de lenguaje causal sobre corpus quimicos (continuacion de secuencia y calculo de verosimilitud).
- Base para ajuste posterior (fine-tuning) en tareas de prediccion de propiedades moleculares, segun la seccion de uso previsto.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no hay evaluacion de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de bibliotecas de SMILES: el modelo puede producir cadenas SMILES sintacticamente plausibles del espacio quimico cubierto por ChEBI, util para proponer candidatos antes de un filtrado con quimioinformatica clasica (RDKit).
- Completado de SMILES parciales en herramientas de dibujo molecular: dado un fragmento introducido por el usuario, el modelo sugiere terminaciones coherentes con la distribucion aprendida del corpus.
- Preentrenamiento de dominio intermedio (domain-adaptive pretraining): el adaptador sirve como inicializacion para posteriores fine-tunings supervisados de prediccion de propiedades (solubilidad, toxicidad, actividad) con un coste de computo muy bajo.
- Etiquetado y normalizacion de entidades quimicas: uso del modelo para puntuar o filtrar cadenas SMILES malformadas generadas por otros sistemas, aprovechando su modelado de lenguaje sobre la sintaxis SMILES.
- Investigacion sobre QLoRA en dominios cientificos: el repositorio documenta de forma detallada la configuracion de cuantizacion, tasas desacopladas y resultados de perdida, lo que lo hace util como referencia reproducible de un pipeline PEFT sobre OLMo.
- Aumento de datos para quimioinformatica: generacion de variantes de SMILES de moleculas conocidas para ampliar conjuntos de entrenamiento de modelos discriminativos pequenos.
- Experimentacion docente o de prototipado: al caber en GPU de consumo, permite probar flujos de generacion molecular en un portatil con GPU discreta sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta las perdidas del entrenamiento:

| Metrica | Valor |
|---|---|
| Training loss | 1,0884 |
| Validation loss | 0,9855 |
| Secuencias de entrenamiento empaquetadas | 18.848 |
| Secuencias de validacion empaquetadas | 990 |
| Epocas | 1 |

No hay resultados de MMLU, HumanEval, GSM8K, ni de metricas especificas de quimioinformatica como validez de SMILES, unicidad, novedad o similitud con el conjunto de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 a 2 GB con el modelo base en 4 bits NF4 mas el adaptador en bfloat16. Es una estimacion derivada del tamano del repositorio (1,0 GB) y de la configuracion declarada, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Se puede ejecutar con holgura en RTX 3060, RTX 4060, RTX 4090, y en GPU de datacenter como A100 o H100, aunque en estas ultimas el modelo estara enormemente infrautilizado.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM es suficiente.
- Opciones de despliegue: transformers + peft + bitsandbytes (la ruta documentada por el autor, con load_in_4bit). vLLM soporta adaptadores LoRA, aunque la combinacion con cuantizacion 4-bit del base requiere verificacion. llama.cpp y Ollama no son aplicables directamente porque no se publican pesos GGUF ni un checkpoint fusionado.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codemaster67/Unichem_chebi_10M_tokens | ~1B (base OLMo-1B) + LoRA r=64 | No disponible (entrenado a 512) | Adaptador QLoRA sobre OLMo-1B | Apache 2.0 | HuggingFace, 0 descargas |
| allenai/OLMo-1B-hf | ~1B | No disponible en la informacion consultada | Modelo base transformer causal | Apache 2.0 | HuggingFace |
| Codemaster67/Olmo_10M_tok_unichem_fineweb | ~1B (base OLMo) | No disponible | Adaptador con tokenizador extendido con ~300 tokens SPE | No disponible | HuggingFace |

No se dispone de datos comparativos de parametros, contexto ni rendimiento para alternativas del ambito quimico como MolT5 o ChemBERTa en la informacion proporcionada; por tanto, no se incluye comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: exige cargar allenai/OLMo-1B-hf en 4 bits (NF4, doble cuantizacion) para funcionar tal y como esta documentado.
- El titulo de la model card menciona "OLMo-7B", en contradiccion con el campo base_model y el codigo de ejemplo, que apuntan a OLMo-1B. Verificar siempre los archivos reales antes de integrarlo.
- Entrenado sobre SMILES: la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.
- Riesgo de alucinacion elevado en el sentido quimico: puede generar SMILES sintacticamente validos pero sin correspondencia con moleculas reales o estables. No hay evaluacion de validez quimica publicada.
- Un unico epoch de entrenamiento sobre 18.848 secuencias empaquetadas de como maximo 512 tokens, lo que limita la profundidad del ajuste y el alcance del vocabulario quimico cubierto.
- Sesgos: no documentados por el autor; el corpus de origen (ChEBI) y el sesgo del modelo base OLMo no se analizan en la model card.
- Idioma: solo se declara ingles; no hay evaluacion en castellano ni en otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero la ausencia de evaluacion de calidad y de benchmarks hace desaconsejable un uso en produccion sin validacion previa propia.
- Soporte nulo por parte del autor: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que documenten problemas conocidos.
- No se publican cuantizaciones GGUF ni versiones fusionadas, lo que complica el despliegue en entornos ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Unichem_chebi_10M_tokens
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_chebi_10M
- Modelo relacionado del mismo autor (tokenizador extendido con SPE): https://huggingface.co/Codemaster67/Olmo_10M_tok_unichem_fineweb
- Repositorio relacionado de la comunidad ChEB-AI (chebifier-web): https://github.com/ChEB-AI/chebifier-web/
- Organizacion ChEB-AI en GitHub: https://github.com/ChEB-AI
- Pagina de Gemma en Google DeepMind (encontrada en la busqueda, sin relacion directa con este modelo): https://deepmind.google/models/gemma/
