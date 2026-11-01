# Salmahaitham/SmolLM2-Sports-Analytics

## Resumen

SmolLM2-Sports-Analytics es un ajuste fino por instrucciones del modelo SmolLM2-1.7B-Instruct de HuggingFaceTB, especializado en conocimiento deportivo y analitica estadistica. Lo desarrolla el usuario Salmahaitham y se distribuye como un unico conjunto de pesos fusionados en FP16 tras un entrenamiento con QLoRA. Resuelve el problema de que un modelo generalista de 1.700 millones de parametros ofrece respuestas poco precisas y con calculos erroneos en dominios tecnicos como el calculo de metricas avanzadas de baloncesto, futbol o futbol americano.

La arquitectura subyacente es un transformer decoder de SmolLM2 con 1.711.376.384 parametros, entrenado originalmente por HuggingFace en un corpus de billones de tokens y afinado para seguir instrucciones. Sobre esa base, el autor aplica adaptadores LoRA de rango 32 sobre todas las capas lineales (q, k, v, o, gate, up y down), entrenados en precision 4-bit NF4 y posteriormente fusionados en pesos FP16 independientes mediante `merge_and_unload()`, de modo que el resultado se carga como un modelo denso convencional sin dependencia de PEFT en inferencia.

Su relevancia es acotada pero clara: demuestra que con 2.000 muestras de entrenamiento y 300 pasos es posible reducir la perplejidad de 4,86 a 1,57 y elevar la precision a nivel de token del 67,97 % al 87,15 % en un dominio vertical concreto. Es un caso practico de especializacion de bajo coste sobre un modelo pequeno, util para quien quiera replicar la receta en otros dominios o desplegar un asistente deportivo ligero en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base SmolLM2-1.7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; pesos finales fusionados en FP16; no se declaran cuantizaciones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados FP16) |
| Libreria declarada | peft (entrenamiento); inferencia via transformers |
| Tamano del repositorio | 3,4 GB |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B-Instruct |
| Metodo de ajuste | QLoRA, r=32, alpha=64, dropout=0,05, todas las capas lineales |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B-Instruct, un transformer decoder denso de la familia SmolLM2. El ajuste se realiza con QLoRA: la base se cuantiza a 4 bits en formato NF4 durante el entrenamiento, se insertan adaptadores LoRA de rango 32 y alpha 64 con dropout 0,05 en los siete modulos lineales de cada bloque (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) y se aplica enmascaramiento estricto solo sobre los tokens de respuesta (response-only completion masking), de forma que la perdida no penaliza los tokens del prompt. Al terminar, los adaptadores se fusionan en los pesos base con `merge_and_unload()`, generando un checkpoint FP16 autonomo.

El dataset de entrenamiento, denominado `Smol-Sports-Instruct`, contiene 2.000 muestras de entrenamiento y 250 de validacion, y combina tres fuentes: QA factual de baloncesto, futbol y futbol americano extraido de `PedroCJardim/QASports`; problemas de analitica deportiva y matematica estadistica multietapa (True Shooting %, diferencial de goles esperados, passer rating de la NFL, porcentaje de victorias, victorias pitagoricas); y un subconjunto de Alpaca como regularizacion de alineamiento general para mitigar el olvido catastrofico. El presupuesto de entrenamiento es de 300 pasos con tamano de lote efectivo 8 (2.400 muestras vistas), optimizador AdamW y decaimiento coseno del learning rate con un 5 % de warmup. La evaluacion se hace sobre 250 muestras estrictamente reservadas, sin solapamiento y con enmascaramiento de prompt verificado. No se documenta ninguna innovacion arquitectonica adicional (ni atencion lineal, ni decodificacion especulativa, ni cabezas auxiliares); la contribucion es exclusivamente el ajuste de dominio.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (roles system, user y assistant mediante `apply_chat_template`).
- Respuesta a preguntas factuales sobre baloncesto, futbol y futbol americano.
- Calculo paso a paso de metricas estadisticas deportivas: True Shooting Percentage, diferencial de goles esperados (xG), passer rating de la NFL, porcentaje de victorias y victorias pitagoricas.
- Razonamiento matematico multietapa aplicado a datos estadisticos, mostrando los pasos intermedios.
- Seguimiento de instrucciones con rol de sistema predefinido ("experto analista deportivo y estadistico").
- Regularizacion de alineamiento general heredada del subconjunto Alpaca, que preserva capacidad basica de conversacion fuera del dominio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-turno con herramientas.
- No se declara modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistente de analitica para redacciones deportivas: el modelo calcula metricas avanzadas (TS%, passer rating, victorias pitagoricas) mostrando los pasos, lo que permite a un periodista verificar la formula y publicar el desglose con trazabilidad.
- Chatbot de estadisticas para aficionados: desplegado sobre una base de datos de resultados historicos, responde preguntas factuales de baloncesto, futbol y NFL con el tono de un analista, y su tamano de 1,7 B permite servirlo en una unica GPU de consumo.
- Generacion de explicaciones didacticas: dado un box score, produce una explicacion de por que un jugador tiene un TS% alto o bajo, util en plataformas de formacion de analistas y cursos de estadistica deportiva.
- Prototipado rapido de productos verticales: sirve como punto de partida para equipos que quieran validar la viabilidad de un asistente deportivo antes de invertir en modelos mayores, ya que la receta QLoRA es replicable con 2.000 muestras y 300 pasos.
- Preprocesamiento y enriquecimiento de datos: en un pipeline de ingesta, normaliza y comenta registros estadisticos en lenguaje natural, generando descripciones automaticas de jugadas o temporadas para paneles internos.
- Evaluacion comparativa de tecnicas de ajuste: por su documentacion detallada de hiperparametros y su tabla de metricas antes/despues, funciona como caso de referencia en experimentos sobre olvido catastrofico y enmascaramiento de perdida.
- Base para RAG deportivo: al no disponer de datos en tiempo real, se integra como generador en un sistema de recuperacion aumentada que le inyecte resultados de la temporada en curso y clasificaciones actualizadas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 250 muestras estrictamente reservadas, comparando el modelo base con el ajustado:

| Metrica | SmolLM2-1.7B-Instruct (base) | Modelo ajustado | Delta absoluto | Delta relativo |
|---|---:|---:|---:|---:|
| Perdida media | 1,5818 | 0,4500 | -1,1317 | -71,55 % |
| Perplejidad | 4,8635 | 1,5684 | -3,2952 | -67,75 % |
| Precision a nivel de token | 67,97 % | 87,15 % | +19,18 pp | +28,21 % |

La precision a nivel de token se mide como prediccion del siguiente token bajo teacher forcing, restringida a los tokens validos de la respuesta del asistente. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que no es posible comparar el rendimiento con otros modelos en esas pruebas.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4); A100 y H100 quedan sobredimensionadas para este tamano y solo se justifican para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas; en 4 GB requeriria cuantizacion a 4 bits no publicada por el autor.
- Opciones de despliegue: transformers con `device_map="auto"` (metodo documentado en la model card); vLLM y TGI son viables al tratarse de un transformer decoder estandar en safetensors, aunque no se han validado oficialmente; llama.cpp y Ollama requeririan convertir los pesos a GGUF, paso no documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-Sports-Analytics | 1,71 B | No disponible | Analitica deportiva (en) | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct (base) | 1,71 B | No disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica del modelo) | Proposito general, multilingue | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (segun documentacion publica del modelo) | Proposito general, multilingue | Llama 3.2 Community License | HuggingFace |

Frente al modelo base, la comparativa directa es la de la tabla de benchmarks: el ajuste reduce la perplejidad un 67,75 % en el dominio deportivo a costa de un posible deterioro en tareas generales, mitigado parcialmente por la regularizacion con Alpaca. Frente a alternativas generalistas del mismo orden de magnitud, este modelo pierde cobertura multilingue y ventana de contexto amplia, pero gana precision en el subdominio estadistico deportivo. No se dispone de comparaciones directas publicadas con esos modelos en tareas de analitica deportiva.

## Limitaciones y advertencias

- Los datos factuales deportivos estan congelados en el momento de los datasets de entrenamiento; no conoce resultados, fichajes ni clasificaciones en tiempo real y requiere RAG para informacion actual.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion en preguntas factuales fuera de la distribucion del dataset, especialmente sobre deportes distintos de baloncesto, futbol y futbol americano.
- Las formulas estadisticas asumen definiciones oficiales de liga (por ejemplo, distancias de triple FIBA frente a NBA, o los topes de coeficientes del passer rating de la NFL); puede aplicar la definicion equivocada si no se especifica la competicion.
- El ajuste se hizo con solo 2.000 muestras y 300 pasos, lo que limita la robustez ante prompts muy alejados del formato de entrenamiento.
- No se declara soporte de tool calling, agentes ni modos de razonamiento extendido, lo que restringe su uso en arquitecturas agenticas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y de los datasets empleados (`PedroCJardim/QASports`, `tatsu-lab/alpaca`) antes de un despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No hay versiones cuantizadas publicadas, lo que obliga a cuantizar por cuenta propia para entornos con menos de 4 GB de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salmahaitham/SmolLM2-Sports-Analytics
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset de QA deportivo: https://huggingface.co/datasets/PedroCJardim/QASports
- Dataset de alineamiento general: https://huggingface.co/datasets/tatsu-lab/alpaca
