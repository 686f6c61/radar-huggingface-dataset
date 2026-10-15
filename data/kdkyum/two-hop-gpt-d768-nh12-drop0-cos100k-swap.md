# kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-swap

# Ficha tecnica: kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-swap

## Resumen

Este repositorio contiene nueve modelos GPT-NeoX de aproximadamente 85,2 millones de parametros entrenados desde cero por el usuario kdkyum sobre documentos sinteticos de familias (16 nombres propios y 90 familias, conjunto c5_m16_N90) con el objetivo de estudiar el razonamiento de dos saltos (two-hop), es decir, la capacidad de encadenar dos relaciones de parentesco para responder a una consulta indirecta. No es un modelo de proposito general ni un asistente conversacional: es un artefacto de investigacion disenado para medir como un transformer pequeno adquiere razonamiento composicional.

La arquitectura es GPT-NeoX (decoder-only, cargable con `GPTNeoXForCausalLM`), con d_model 768, 12 cabezas de 64 dimensiones y 12 capas, LayerNorm, embeddings rotatorios (RoPE) aplicados sobre cada dimension de cabeza con base 100.000 y MLP con activacion ReLU. El paquete agrupa nueve ejecuciones que cruzan tres valores de weight decay (1, 3 y 5) con tres semillas (41, 42 y 43), todas sin dropout y con un schedule coseno de 100.000 pasos.

Su relevancia es acotada y estrictamente cientifica: funciona como banco de pruebas reproducible para estudiar mecanismos de razonamiento multi-salto y el efecto del weight decay sobre la generalizacion. La mejor ejecucion (weight decay 5, semilla 42) alcanza una precision two-hop de 0,9747 sobre datos reservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, `GPTNeoXForCausalLM`), LayerNorm, RoPE base 100.000, MLP ReLU |
| Parametros totales | 85,2 millones (aproximado, segun model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.149 tokens (longitud de fila de documento completo usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (corpus sintetico de nombres propios y relaciones familiares; no se declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints por paso compatibles con `from_pretrained`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-NeoX con 12 capas, d_model 768 y 12 cabezas de atencion de 64 dimensiones. Emplea LayerNorm, sesgos en las capas lineales, embeddings rotatorios aplicados sobre cada dimension de cabeza con base 100.000 e inicializacion neox con desviacion estandar 0,02. El MLP usa activacion ReLU. El vocabulario trata cada punto (".") como token `<bos>` y reserva un token `<pad>` independiente. El objetivo de entrenamiento es de modelado de lenguaje causal con perdida calculada sobre todos los tokens.

Los datos provienen del conjunto sintetico `c5_m16_N90/hetero_graphs_swap_6to1split1`, con 16 nombres propios y 90 familias, organizado en filas de documento completo de 2.149 tokens, cada una iniciada con `<bos>`. El entrenamiento usa AdamW (beta2 0,95, eps 1e-8) con learning rate 3e-4, warmup de 500 pasos y decaimiento coseno hasta cero a los 100.000 pasos, recorte de gradiente con norma 1 y weight decay aplicado unicamente a matrices de pesos y embeddings. No se usa dropout en atencion, MLP ni capas ocultas. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones: es un entrenamiento puramente autoregresivo sobre corpus sintetico. Cada carpeta de ejecucion contiene checkpoints cada 10.000 pasos, el `config.json` de argumentos de entrenamiento, `vocab.json` y `log.jsonl` con los registros de entrenamiento y evaluacion.

## Capacidades

- Generacion de texto autoregresiva restringida al dominio sintetico de documentos familiares.
- Razonamiento de dos saltos (two-hop) sobre relaciones de parentesco en el corpus de evaluacion: dados dos hechos conectados, inferir la relacion derivada.
- Modelado de lenguaje causal sobre secuencias de hasta 2.149 tokens.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso general fuera del esquema two-hop entrenado.
- No se declaran capacidades multilingues.
- No incluye modo de pensamiento (thinking mode), vision ni audio.
- Capacidad especial: sirve como sujeto de estudio para interpretabilidad y analisis de representaciones internas en tareas de razonamiento composicional.

## Casos de uso

- Estudio de razonamiento composicional: medir la precision two-hop en funcion del weight decay y de la semilla para caracterizar cuando un transformer pequeno generaliza frente a cuando memoriza el grafo de relaciones.
- Interpretabilidad de mecanismos internos: analizar activaciones y cabezas de atencion en un modelo de 12 capas entrenado sobre un grafo de parentesco conocido, con control total sobre los datos de entrenamiento.
- Ablacion de hiperparametros: comparar de forma aislada el efecto del weight decay (1, 3, 5) y del schedule coseno de 100.000 pasos sobre la generalizacion, gracias a que las nueve ejecuciones comparten el resto de la configuracion.
- Reproducibilidad de experimentos: replicar los resultados publicados usando los checkpoints intermedios cada 10.000 pasos, `vocab.json` y `log.jsonl` incluidos en cada carpeta de ejecucion.
- Banco de pruebas para tecnicas de eficiencia: al ser un modelo de 85,2 millones de parametros, permite validar rapidamente pipelines de poda, cuantizacion o decodificacion especulativa sin coste computacional elevado.
- Base para transferencia a dominios controlados: punto de partida para fine-tuning en otros grafos sinteticos de relaciones (genealogias, ontologias simples) manteniendo el mismo esquema de tokens `<bos>`/`<pad>`.
- Docencia e investigacion academica: ejemplo reproducible y de bajo coste de entrenamiento desde cero para cursos de arquitecturas transformer y evaluacion de razonamiento.
- Estudio de curvas de aprendizaje: los registros `log.jsonl` y la evaluacion cada 250 pasos permiten analizar la dinamica de adquisicion de la tarea a lo largo de los 100.000 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la precision two-hop sobre datos reservados, evaluada cada 250 pasos:

| weight_decay | semilla | pasos entrenados | Precision two-hop maxima (paso) | Primer paso >= 0,99 | Precision two-hop final |
|---|---|---|---|---|---|
| 1 | 41 | 100.000 | 0,8380 (81.750) | no alcanzado | 0,8352 |
| 1 | 42 | 100.000 | 0,9312 (90.500) | no alcanzado | 0,9228 |
| 1 | 43 | 100.000 | 0,7352 (80.750) | no alcanzado | 0,7238 |
| 3 | 41 | 100.000 | 0,8960 (92.250) | no alcanzado | 0,8827 |
| 3 | 42 | 100.000 | 0,9383 (92.500) | no alcanzado | 0,9349 |
| 3 | 43 | 100.000 | 0,9157 (92.500) | no alcanzado | 0,9142 |
| 5 | 41 | 100.000 | 0,9123 (95.000) | no alcanzado | 0,9120 |
| 5 | 42 | 100.000 | 0,9747 (91.000) | no alcanzado | 0,9698 |
| 5 | 43 | 100.000 | 0,9278 (63.500) | no alcanzado | 0,8883 |

Ninguna de las nueve ejecuciones alcanza el umbral de 0,99 en dos saltos. El mejor resultado corresponde a weight decay 5, semilla 42, con 0,9747 de precision maxima y 0,9698 al final del entrenamiento.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del numero de parametros (85,2 millones) y no proceden de la model card, que no documenta requisitos de despliegue:

- Peso de los pesos en precision completa (FP32): aproximadamente 341 MB.
- Peso de los pesos en media precision (FP16/BF16): aproximadamente 170 MB.
- Peso de los pesos en INT8: aproximadamente 85 MB.
- Peso de los pesos en INT4: aproximadamente 43 MB.
- A estas cifras hay que sumar activaciones y cache KV para una secuencia de hasta 2.149 tokens, de magnitud reducida dado el tamano del modelo.
- Cabe holgadamente en cualquier GPU de consumo (desde una GTX 1050 o similar en adelante) e incluso puede ejecutarse en CPU.
- GPU profesionales (A100, H100) no son necesarias; resultan sobredimensionadas para inferencia de este modelo.
- Opciones de despliegue documentadas: carga directa con `transformers` mediante `GPTNeoXForCausalLM.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La unica comparativa posible es con los otros repositorios del mismo autor, que comparten arquitectura y tarea:

| Modelo | Parametros | Contexto | Precision two-hop | Licencia |
|---|---|---|---|---|
| kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-swap | 85,2 M | 2.149 tokens | 0,9747 maxima (wd 5, semilla 42); 0,99 no alcanzado | MIT |
| kdkyum/two-hop-gpt-hits | 85,2 M (barrido d768, lr 1e-4) | no disponible (aparece el valor 1024 en el fragmento, dato incompleto) | 0,99 alcanzado en 7 ejecuciones | no disponible |
| kdkyum/two-hop-gpt-wsd-nh4 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables de terceros sobre esta misma tarea.

## Limitaciones y advertencias

- Modelo de investigacion, no de proposito general: no es un asistente conversacional y no sigue instrucciones.
- Dominio restringido: entrenado exclusivamente sobre documentos sinteticos de familias (16 nombres, 90 familias); no generaliza a texto real ni a tareas fuera de ese grafo.
- Ninguna de las nueve ejecuciones alcanza 0,99 de precision two-hop, por lo que persiste un margen de error notable dentro de la propia tarea objetivo.
- Alta varianza entre semillas: con weight decay 1 la precision maxima oscila entre 0,7352 y 0,9312 segun la semilla, lo que desaconseja extraer conclusiones de una unica ejecucion.
- Sesgos conocidos: no disponibles (el corpus es sintetico, por lo que los sesgos sociales propios de corpus reales no aplican, pero tampoco se han analizado).
- Riesgo de alucinacion: al ser un modelo generativo autoregresivo, puede producir secuencias plausibles pero incorrectas sobre relaciones no vistas en entrenamiento.
- Limitaciones de contexto: ventana de 2.149 tokens ligada al formato de fila de documento completo del corpus.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo no esta preparado para uso multilingue.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias y el modelo carece de utilidad comercial directa por su dominio tan especifico.
- Caveat de produccion: el repositorio pesa 30,7 GB debido a los checkpoints intermedios de las nueve ejecuciones; conviene descargar unicamente el checkpoint necesario.
- Nota de la model card: algunas ejecuciones que no habian alcanzado los 100.000 pasos seguian entrenando, aunque la tabla publicada muestra las nueve a 100.000 pasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d768-nh12-drop0-cos100k-swap
- Repositorio relacionado (ejecuciones que alcanzaron 0,99): https://huggingface.co/kdkyum/two-hop-gpt-hits
- Repositorio relacionado (variante wsd-nh4): https://huggingface.co/kdkyum/two-hop-gpt-wsd-nh4
- Proyecto de Weights & Biases citado en la model card: `gpt-two-hop-d768-trainpy` (URL no disponible)
- Script de entrenamiento citado: `train.py` en `/two-hop-gpt/` (Dropbox, URL no disponible)
- Paper o publicacion asociada: no disponible
