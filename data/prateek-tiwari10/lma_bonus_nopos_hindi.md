# Prateek-Tiwari10/LMA_bonus_nopos_hindi

## Resumen

LMA_bonus_nopos_hindi es un modelo de investigación publicado por el usuario Prateek-Tiwari10 en HuggingFace. Se trata de un Transformer decoder-only de 11 capas, con d_model de 384 y 6 cabezas de atención, que cuenta con 25.663.872 parámetros. Su particularidad es que ha sido entrenado eliminando por completo la tabla de embeddings posicionales absolutos aprendidos (`positional: "none"`), de modo que el modelo carece de una representación explícita del orden de los tokens.

No es un modelo de propósito general ni un lanzamiento de producto: es una ablación controlada. Según la model card, todo lo demás se mantiene idéntico al modelo estándar de hindi con el que se compara (mismo tokenizador de 16K, mismo corpus y partición, mismo horizonte de una epoch y misma receta de optimización con LR máximo de 3e-3, 750 pasos de warmup y 32 x 2 x 512 tokens por paso). La única variable alterada es la tabla posicional, lo que permite aislar su contribución.

El interés actual del modelo es metodológico: sirve para medir cuánto del rendimiento depende de la señal posicional explícita frente a la que proporciona la propia máscara causal. El resultado reportado por el autor es una pérdida de validación de 3,4262 frente a 3,4033 del modelo estándar, es decir, una degradación pequeña pero medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal; sin tabla de embeddings posicionales (`positional: "none"`) |
| Parametros totales | 25.663.872 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; las secuencias de entrenamiento son de 512 tokens (32 x 2 x 512 tokens por paso) y el modelo de referencia del mismo proyecto usa una tabla posicional de 512 x 384, lo que apunta a un contexto efectivo de 512 tokens |
| Tipos de cuantizacion | no disponibles en el repositorio; solo se publican pesos safetensors sin cuantizar (FP32), aunque por tamano es viable una cuantizacion manual a int8/int4 |
| Idiomas soportados | hindi (codigo `hi`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); sin tensor `lm_head` porque la cabeza de salida se reata al embedding de tokens |
| Capas / d_model / cabezas | 11 / 384 / 6 |
| Tokenizador | 16.000 tokens (16K), compartido con el modelo estandar del proyecto |
| Clase de implementacion | no es una clase de `transformers`; la arquitectura vive en `lm/model.py` del repositorio del proyecto y se instancia con `build_model` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de 11 capas con atencion causal, d_model de 384 y 6 cabezas (64 dimensiones por cabeza), entrenado sobre hindi con un tokenizador de 16K. La innovación, en este caso por sustracción, es la eliminación total de la tabla posicional aprendida: el modelo no lee el orden de un embedding, sino que debe inferirlo de la máscara causal. El autor matiza en la model card que esto no convierte al modelo en ciego al orden: con la máscara causal activa, la posición *t* atiende a 0..*t*, de modo que las representaciones de cada posición se construyen a partir de prefijos distintos. Un modelo sin posicionales de una sola capa sí sería invariante a permutaciones de su prefijo, pero a partir de dos capas esa invariancia desaparece. La diferencia es que la señal de orden pasa a ser indirecta y más débil.

El entrenamiento se realizó durante una única epoch, con 16.125 pasos, 32 x 2 x 512 tokens por paso, LR máximo de 3e-3 y 750 pasos de warmup. De esa configuración se deriva un volumen aproximado de 528,4 millones de tokens vistos (16.125 x 32 x 2 x 512). No hay información sobre composición del corpus, uso de RLHF/DPO ni fases de ajuste posteriores: se trata de un entrenamiento de lenguaje autorregresivo desde cero con horizonte corto. La cabeza de salida está atada al embedding de tokens, de ahí que no se almacene un tensor `lm_head` y que la carga requiera código propio en lugar de `AutoModelForCausalLM`.

## Capacidades

- Generación de texto autorregresiva en hindi, con la calidad propia de un modelo de 25,7 M de parámetros entrenado una sola epoch.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en hindi, que es su uso principal como artefacto de investigación.
- Inferencia de orden a partir de la máscara causal, sin representación posicional explícita: capacidad estructural clave del experimento.
- Ejecución en CPU o en GPU de gama muy baja, gracias a su tamano reducido.
- Reentrenamiento y fine-tuning asequibles, ya que el coste computacional de una epoch sobre este modelo es mínimo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Multilingüismo: no; el modelo está entrenado exclusivamente en hindi (`hi`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio de ablación sobre embeddings posicionales: reproducir el experimento eliminando la tabla posicional y comparar la pérdida de validación con el modelo estándar del mismo proyecto (3,4262 frente a 3,4033), manteniendo constantes corpus, semilla y receta de optimización.
- Investigación sobre la máscara causal como señal de orden: usar el modelo para medir hasta qué punto la atención causal por sí sola codifica la posición, aprovechando que es la única variable modificada respecto al control.
- Aprendizaje automático en docencia: por su tamano (25,7 M de parámetros, ~98 MiB en FP32), es un candidato práctico para que estudiantes entrenen, modifiquen y evalúen un Transformer completo sin infraestructura especializada.
- Fine-tuning de dominio sobre hindi: al ser barato de reentrenar, puede servir como banco de pruebas para adaptar un modelo pequeño a un dominio concreto (por ejemplo, noticias o texto administrativo en hindi) antes de escalar el experimento.
- Comparativa de tokenizadores: al compartir el tokenizador de 16K con el modelo estándar, permite aislar el efecto del tokenizador frente al de la arquitectura en experimentos controlados.
- Prototipado de generación de texto en hindi en local: útil para validar una tubería de datos, un formateador de prompts o una métrica de evaluación antes de recurrir a modelos mayores.
- Análisis de sensibilidad al orden en tareas concretas: probar si tareas que dependen fuertemente del orden de los tokens (por ejemplo, concordancia verbal o dependencias a distancia) se degradan más que el promedio cuando se elimina la señal posicional explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de下游). La model card únicamente reporta las pérdidas de validación del par control/ablación:

| Metrica | Modelo estandar | Modelo ablated (este) |
|---|---:|---:|
| Parametros | 25.860.480 | 25.663.872 |
| Tabla posicional | 512 x 384 aprendida | ninguna |
| Capas / d_model / cabezas | 11 / 384 / 6 | 11 / 384 / 6 |
| Pasos | 16.125 (1 epoch) | 16.125 (1 epoch) |
| Perdida de validacion final | 3,4033 | 3,4262 |
| Mejor perdida de validacion | 3,4033 | 3,4262 |
| Perplejidad derivada (calculada como e^loss) | ~30,06 | ~30,76 |

La diferencia de 0,0229 en pérdida de validación (aproximadamente 0,67 % de degradación relativa, calculado a partir de los valores reportados) es el resultado central del experimento. No se han publicado métricas de tareas downstream, ni de generación cualitativa, ni comparaciones con otros modelos de hindi.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~98 MiB en FP32, ~49 MiB en FP16/BF16, ~25 MiB en int8 y ~12 MiB en int4. Hay que anadir activaciones y posible caché KV, que en secuencias de 512 tokens son despreciables a esta escala.
- GPU recomendadas: cualquier GPU moderna sirve; no se necesita A100, H100 ni siquiera una RTX 4090. Una GTX 1650, una T4 o una RTX 3060 van sobradamente. El modelo cabe también en iGPU y en memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos diez años, y también en CPU. Ejecución perfectamente viable en portátiles sin GPU dedicada.
- Opciones de despliegue: no se puede usar `transformers` directamente, porque la arquitectura es una implementación propia (`lm/model.py` del repositorio del proyecto, con constructor `build_model`). La carga documentada es mediante `huggingface_hub.snapshot_download` y `safetensors.torch.load_file`, con `config.json` leído aparte. No hay integración publicada con vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones; a este tamano el cuello de botella será el código de inferencia en Python, no el cómputo.

## Comparativa con modelos similares

La única comparación documentada es contra el modelo control del mismo proyecto, que comparte tokenizador, corpus, partición, semilla y receta de optimización:

| Modelo | Parametros | Posicionales | Contexto | Perdida de validacion | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|---|
| LMA_bonus_nopos_hindi (este) | 25.663.872 | ninguno | 512 tokens (inferido de la configuracion de entrenamiento) | 3,4262 | MIT | HuggingFace, 0 descargas |
| Modelo estandar de referencia del mismo proyecto | 25.860.480 | tabla aprendida 512 x 384 | 512 tokens | 3,4033 | no disponible | no disponible como artefacto publico |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de hindi comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigación: 0 descargas y 0 likes, sin pipeline declarado y sin evaluación downstream. No debe tratarse como un modelo listo para producción.
- Entrenamiento de una sola epoch sobre un corpus no descrito: la pérdida de validación de 3,4262 (perplejidad aproximada de 30,8) indica un modelado del lenguaje todavía tosco, con alta probabilidad de texto incoherente o repetitivo.
- Sin ajuste por instrucciones ni por preferencias humanas: no hay RLHF, DPO ni fases SFT documentadas, así que no cabe esperar seguimiento de instrucciones ni comportamiento alineado.
- Riesgo de alucinación: elevado y difícil de cuantificar, ya que no se han publicado evaluaciones de factualidad. En un modelo de 25,7 M de parámetros entrenado una epoch, la generación libre tenderá a producir texto plausible pero no fiable.
- Sesgos conocidos: no disponibles. No hay documentación sobre la composición del corpus, por lo que no se puede evaluar el sesgo de género, religioso, político o de casta que pueda haber absorbido el texto en hindi.
- Cobertura de idioma: exclusivamente hindi. No hay evidencia de transferencia a otras lenguas indias ni al inglés.
- Limitación estructural: al carecer de codificación posicional explícita, la señal de orden es indirecta. El propio autor advierte que esto puede penalizar tareas sensibles al orden; la pérdida agregada solo sube 0,0229, pero no hay análisis por tipo de tarea.
- Sin variantes cuantizadas publicadas: no hay GGUF, AWQ ni GPTQ, y el formato safetensors sin `lm_head` complica la conversión a otros runtimes.
- Compatibilidad: no es una clase de `transformers`; requiere el código del proyecto. Cualquier intento de cargarlo con `AutoModelForCausalLM` fallará.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la licencia permisiva no implica que el modelo sea adecuado para producción ni exime de responsabilidad sobre el contenido generado.
- Fecha de creación declarada en el repositorio: 2026-09-16; conviene verificar que el repositorio sigue accesible, dado el escaso interés registrado.

## Enlaces

- HuggingFace: https://huggingface.co/Prateek-Tiwari10/LMA_bonus_nopos_hindi
- Repositorio del proyecto (mencionado en la model card como origen de `lm/model.py`): no disponible, la model card no incluye la URL
- Paper o informe tecnico: no disponible
- Demo o Space: no disponible
- Otros enlaces relevantes: no se han encontrado. Los resultados de la busqueda web proporcionados (repositorios de jailbreaks, hilos sobre verificacion de telefono de ChatGPT, GPT-SoVITS y listados de asistentes conversacionales en vietnamita) no guardan relacion con este modelo y se descartan.
