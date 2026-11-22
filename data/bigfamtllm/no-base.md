# BigFamTLLM/no-base

## Resumen

`no-base` es un modelo de lenguaje base de 2.115 millones de parametros entrenado **desde cero** en noruego por el equipo BigFamTLLM, en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otono de 2026). Forma parte de un experimento controlado de 50 modelos cuyo objetivo es responder una pregunta concreta: si el preentrenamiento en otros idiomas seguido de adaptacion al noruego supera al entrenamiento desde cero con los mismos recursos, y tras cuantos tokens noruegos los modelos adaptados alcanzan al de referencia.

Arquitectonicamente es un decoder denso de estilo Qwen3, con 36 capas, hidden size de 2.176, 34 cabezas de atencion (17 KV heads, GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados. Se entreno con Megatron-LM durante 49.600 iteraciones sobre 26.004 millones de tokens noruegos (85 % Bokmal, 15 % Nynorsk) procedentes de HPLT 4.0, con un tokenizador BPE propio de 32.000 tokens. La longitud de contexto es de 4.096 tokens.

Es relevante porque actua como referencia experimental del estudio: cualquier investigador interesado en adaptacion cross-lingual, en el coste real de entrenar modelos desde cero para idiomas de recursos medios o en la eficiencia de la continua preentrenacion puede usar esta familia como caso controlado, con todos los checkpoints intermedios publicados. No es un modelo para produccion: es un base model sin instruction tuning ni ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden 2.176, 34 cabezas / 17 KV, SwiGLU 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ por terceros) |
| Idiomas soportados | Noruego: `no`, `nb` (Bokmal), `nn` (Nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 4,2 GB, bf16) |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Qwen3 en su variante densa: 36 capas de atencion con 34 cabezas de consulta y 17 de clave/valor (GQA con ratio 2:1), dimension de cabeza 64, FFN SwiGLU de 6.528 unidades intermedias, normalizacion RMSNorm con QK-norm y embeddings atados a la proyeccion de salida. El tokenizador es un BPE noruego de 32.000 tokens construido por el equipo (`mix_BM7_2_NN8_1`), que cubre tanto Bokmal como Nynorsk.

El entrenamiento se realizo con Megatron-LM (core 0.17.1) sobre 8 GPU NVIDIA GH200 del supercomputador Olivia (Sigma2), en bf16, con secuencia de 4.096 y batch global de 128 (524.288 tokens por iteracion). Se usaron AdamW (β 0.9/0.95, ε 1e-8), weight decay 0.1 y clipping de gradiente 1.0. El schedule fue warmup-stable: 2.000 iteraciones de warmup hasta 5e-4 y despues tasa constante. En total, 49.600 iteraciones y 26.004 millones de tokens noruegos, con un coste de 286,30 GPU-horas. Los datos provienen de HPLT 4.0 (85 % Bokmal, 15 % Nynorsk, con los shards de Nynorsk repetidos aproximadamente 3,5 veces). No se aplico RLHF, DPO ni instruction tuning: es un modelo exclusivamente preentrenado.

## Capacidades

- Generacion de texto en noruego Bokmal y Nynorsk a partir de un prompt (modelo base, sin formato de instrucciones).
- Modelado de lenguaje y continuacion de texto: util para perplexity, scoring y evaluacion intrinseca.
- Capacidad de representacion linguistica del noruego, gracias al tokenizador BPE nativo de 32.000 tokens.
- Punto de partida para fine-tuning supervisado (SFT), LoRA o instruccion posterior.
- No soporta tool calling ni function calling de forma nativa (no ha sido entrenado para ello).
- No soporta agentes ni razonamiento multi-paso de forma fiable (sin entrenamiento especifico).
- No dispone de vision, audio ni modo de pensamiento (thinking).
- Multilinguismo limitado a noruego; no se ha entrenado con otros idiomas.

## Casos de uso

- Referencia experimental en investigacion cross-lingual: sirve como linea base para comparar con `da-base`, `ml-base` y sus variantes CPT en estudios sobre adaptacion de idiomas de recursos medios.
- Fine-tuning supervisado para tareas noruegas: punto de partida para clasificacion de texto, resumen o generacion controlada en Bokmal y Nynorsk con datasets etiquetados.
- Evaluacion de modelos noruegos: calculo de perplexity y benchmarks intrinsecos sobre corpus noruegos para comparar tokenizadores y estrategias de preentrenamiento.
- Generacion de texto asistida en noruego: continuacion de parrafos, redaccion de borradores o completado en aplicaciones editoriales, siempre con supervision humana dado que es un modelo base.
- Destilacion y experimentacion academica: al ser pequeno (2,1B) y estar disponible en safetensors, permite reproducir experimentos de scaling y de curricula de datos en entornos academicos.
- Investigacion sobre tokenizadores: permite estudiar el impacto de un vocabulario BPE nativo frente a vocabularios multilingues en la calidad del modelado del noruego.
- Base para adaptadores LoRA en dominios especificos (legal, sanitario, administracion publica noruega) con coste de computo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos (2,115B × 2 bytes), mas KV cache y activaciones; en la practica, entre 6 y 8 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits: alrededor de 1,2 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para entrenamiento o fine-tuning completo, A100/H100 o GH200; para LoRA, una RTX 4090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (libreria nativa), vLLM y TGI (el modelo declara compatibilidad con text-generation-inference y endpoints), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BigFamTLLM/no-base` | 2,12B | 4.096 | Noruego (nb, nn) | no disponible | Hugging Face |
| `BigFamTLLM/da-base` | mismo tamano (misma arquitectura) | 4.096 | Danes | no disponible | Hugging Face |
| `BigFamTLLM/ml-base` | mismo tamano (misma arquitectura) | 4.096 | Multilingue sin noruego | no disponible | Hugging Face |
| `BigFamTLLM/no-base-anneal` | 2,12B | 4.096 | Noruego | no disponible | Hugging Face |

La comparacion relevante es interna a la familia BigFamTLLM: `da-base` y `ml-base` comparten arquitectura, tokenizador de origen y presupuesto de tokens (26.000 millones), de modo que las diferencias de rendimiento en noruego miden el efecto de la adaptacion cross-lingual. No se dispone de datos de benchmarks publicados para comparar con modelos noruegos externos (por ejemplo, NorMistral, NB-BERT o variantes de Gemma adaptadas al noruego) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no esta alineado y puede generar contenido inapropiado o incoherente si se usa como asistente sin fine-tuning.
- Riesgo alto de alucinacion y de continuaciones factualmente incorrectas; no debe usarse en produccion sin verificacion.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida al noruego; no se ha entrenado con castellano ni con otros idiomas.
- Licencia no declarada: antes de cualquier uso comercial es imprescindible contactar con el autor para aclarar los terminos.
- Sesgos potenciales derivados del corpus HPLT 4.0 (datos web), con posible infrarepresentacion de variedades del noruego y de registros formales.
- El desbalance de datos (85 % Bokmal frente a 15 % Nynorsk, con repeticion de shards de Nynorsk) puede afectar al rendimiento relativo en Nynorsk.
- Modelo de caracter experimental y academico, con 0 descargas y 0 likes en el momento de la consulta; no hay garantia de mantenimiento ni soporte.
- No dispone de model card con resultados de evaluacion; cualquier afirmacion de calidad debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/no-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danes de referencia: https://huggingface.co/BigFamTLLM/da-base
- Modelo multilingue de referencia: https://huggingface.co/BigFamTLLM/ml-base
- Repositorio de la familia BigFamTLLM: https://huggingface.co/BigFamTLLM
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- HPLT 4.0 (dataset): https://hplt-project.org/
- Sigma2 / Olivia (infraestructura de computo): https://www.sigma2.no/
