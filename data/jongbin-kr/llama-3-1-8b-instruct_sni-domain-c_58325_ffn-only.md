# Jongbin-kr/llama-3.1-8b-instruct_SNI-domain-c_58325_ffn-only

## Resumen

El modelo `llama-3.1-8b-instruct_SNI-domain-c_58325_ffn-only` es un ajuste fino (fine-tuning) del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. Se trata de un experimento de especializacion que entrena exclusivamente las capas feed-forward (FFN) del transformer, dejando el resto de parametros congelados. Esta estrategia de ajuste parcial busca adaptar el modelo a un dominio especifico —el identificador "SNI-domain-c" sugiere un conjunto de datos concreto— manteniendo el coste computacional y el riesgo de olvido catastrfico relativamente bajos.

El modelo se ha entrenado con la libreria TRL (Transformers Reinforcement Learning) mediante Supervised Fine-Tuning (SFT), y se publica en formato safetensors compatible con el ecosistema Transformers. Con un tamano de repositorio de 2.2 GB, corresponde a una version cuantizada o con pesos reducidos del Llama-3.1-8B original. Su relevancia radica en explorar metodologias de ajuste eficiente (solo FFN) sobre una arquitectura consolidada, un enfoque de interes para investigadores que buscan alternativas a los metodos LoRA o al ajuste completo.

No se dispone de informacion publica sobre la licencia, los datos de entrenamiento o los benchmarks de este modelo concreto, lo que limita su evaluacion objetiva. Aun asi, su publicacion como experimento de investigacion puede resultar util para estudiar el impacto del entrenamiento selectivo de capas en modelos de la familia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.03 mil millones (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del base) |
| Tipos de cuantizacion | no disponible (repo de 2.2 GB sugiere cuantizacion, pero no se especifica) |
| Idiomas soportados | no disponible (hereda los del base: principalmente ingles, con soporte multilingue limitado) |
| Licencia | no disponible (el modelo base usa licencia de Meta Llama 3.1, pero el autor no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y attention con RoPE (Rotary Position Embeddings). El ajuste fino se ha realizado con Supervised Fine-Tuning (SFT) utilizando la libreria TRL, congelando todas las capas excepto las correspondientes a los bloques feed-forward (FFN). Esta estrategia, denominada "ffn-only", reduce significativamente el numero de parametros entrenables y el coste de entrenamiento, aunque limita la capacidad de adaptacion a las transformaciones lineales internas de cada bloque.

No se ha publicado informacion sobre el conjunto de datos de entrenamiento (el identificador "SNI-domain-c" sugiere un dataset de dominio especifico, posiblemente relacionado con SNI —Super Natural Instructions—), el numero de tokens utilizados, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El entrenamiento se registro con Weights & Biases, pero el enlace no es publico. Se desconoce si se aplicaron tecnicas de regularizacion, early stopping o evaluacion durante el entrenamiento.

## Capacidades

- Generacion de texto instructivo: al estar basado en Llama 3.1 Instruct, mantiene la capacidad de seguir instrucciones y generar respuestas coherentes en formato conversacional.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base para tareas de razonamiento, conocimiento factual y comprension lectora.
- Soporte multilingue basico: el modelo base tiene soporte para ocho idiomas (aleman, frances, hindi, ingles, italiano, portugues, espanol y tailandes), aunque su rendimiento optimo se da en ingles.
- Tool calling: el modelo base soporta function calling, pero no se ha verificado que el ajuste FFN preserve esta capacidad.
- Ventana de contexto larga: 128.000 tokens, util para documentos extensos o conversaciones multi-turno.
- No se ha confirmado soporte para agentes, vision, audio u otras modalidades.

## Casos de uso

- Experimentacion academica: investigacion sobre metodos de ajuste eficiente que comparan el entrenamiento solo-FFN frente a LoRA o ajuste completo, midiendo el impacto en rendimiento y olvido catastrfico.
- Prototipado rapido en dominios especificos: si el dataset "SNI-domain-c" corresponde a un dominio concreto (p. ej., instrucciones naturales), el modelo puede servir para generar respuestas en ese ambito con un coste de despliegue reducido.
- Estudio de la plasticidad de capas FFN: analisis de que conocimientos se almacenan en las capas feed-forward y como afecta su actualizacion al comportamiento global del modelo.
- Linea base para experimentos de interpretabilidad: dado que solo se modifican las FFN, es mas facil aislar y estudiar el efecto de cambios concretos en esas capas.
- Evaluacion de robustez: comparar la coherencia y calidad de las respuestas frente al modelo base en tareas generales para detectar degradaciones por el ajuste parcial.
- Despliegue en entornos con recursos limitados: con un repo de 2.2 GB, el modelo es mas ligero que el original (4.9 GB en bf16), lo que permite inferencia en GPUs de gama media o CPU con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Al ser un ajuste experimental sin documentacion adicional, no es posible comparar su rendimiento con el modelo base ni con otras variantes.

## Requisitos de hardware

- VRAM estimada: el repo de 2.2 GB sugiere cuantizacion (posiblemente 4 bits o 8 bits). Con cuantizacion de 4 bits, la VRAM necesaria para inferencia seria de aproximadamente 4-5 GB; con 8 bits, unos 8-9 GB. Sin cuantizacion en bf16, se necesitarian unos 16 GB.
- GPU recomendada: para una cuantizacion de 4 bits, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) seria suficiente; para 8 bits, una RTX 3090 o RTX 4090 (24 GB) es recomendable.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer modernas con al menos 8 GB de VRAM, dependiendo de la cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con `device_map="auto"`, o TGI (Text Generation Inference).
- Latencia y throughput: no disponible. Al ser un modelo de 8B, se espera una velocidad de generacion de 20-40 tokens/segundo en una RTX 4090 con cuantizacion de 4 bits, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de ajuste | Licencia |
|---|---|---|---|---|
| Llama 3.1 8B Instruct (base) | 8B | 128K | Ajuste completo + RLHF | Llama 3.1 License (Meta) |
| Este modelo (FFN-only) | 8B (solo FFN entrenadas) | 128K | SFT solo FFN | no disponible |
| Llama 3.1 8B Instruct + LoRA (tipico) | 8B (adaptadores ~1-2% ) | 128K | LoRA | Depende del dataset |

La comparativa directa no es posible sin datos de rendimiento. La principal diferencia frente a LoRA es que este modelo actualiza pesos completos de las FFN en lugar de inyectar adaptadores de bajo rango, lo que puede ofrecer mayor capacidad de adaptacion en ese subespacio, pero con mayor riesgo de sobreajuste. Frente al modelo base, el ajuste FFN-only deberia producir cambios mas sutiles en el comportamiento, pero no hay evidencia empirica en la informacion disponible.

## Limitaciones y advertencias

- Licencia no especificada: el autor no indica la licencia del modelo. Al derivar de Llama 3.1, podria estar sujeto a la licencia de Meta, que impone restricciones de uso comercial para aplicaciones con mas de 700 millones de usuarios mensuales. Se recomienda contactar al autor antes de uso comercial.
- Datos de entrenamiento desconocidos: no se sabe que dataset compone "SNI-domain-c", por lo que el modelo podria tener sesgos o comportamientos impredecibles en dominios fuera de ese conjunto.
- Riesgo de sobreajuste: al entrenar solo las FFN, el modelo podria memorizar el dataset de entrenamiento y degradar su capacidad de generalizacion en tareas generales.
- Sin benchmarks publicados: no hay evidencia de que el ajuste mejore el rendimiento en ninguna tarea concreta. Es un experimento sin validacion publica.
- Alucinaciones y sesgos: heredados del modelo base, que ya presenta sesgos conocidos y riesgo de generar informacion falsa con alta confianza.
- Compatibilidad de tool calling no verificada: aunque el base soporta function calling, el ajuste FFN podria haber alterado esa capacidad sin que se haya comprobado.
- Soporte limitado: al ser un repositorio con 0 descargas y 0 likes, no hay comunidad ni soporte activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-domain-c_58325_ffn-only
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante LoRA del mismo autor: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora
- Modelo MoE relacionado (informacion externa): https://llm-explorer.com/model/Jongbin-kr%2Fllama-3.1-8b-instruct-4x2-moe,3bqsG1wwLvc8EGxu1aQnUa
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/99subg7a
