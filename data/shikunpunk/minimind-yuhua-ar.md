# shikunpunk/MiniMind-YuHua-AR

## Resumen

MiniMind-YuHua-AR es un modelo de generación de texto de 104 millones de parámetros, desarrollado por el usuario shikunpunk, especializado en reproducir el estilo literario del escritor chino Yu Hua. Se basa en la arquitectura MiniMind, un transformer autoregresivo con atención softmax, y ha sido entrenado mediante una combinación de pretrain sobre 18 793 segmentos de texto del autor y un ajuste fino supervisado (SFT) con 522 ejemplos de razonamiento encadenado (CoT) durante 10 épocas. El modelo arranca desde los pesos de un modelo previo del mismo autor, MiniMind-GuCheng-AR, dedicado al estilo del poeta Gu Cheng.

Su relevancia radica en ser un caso práctico de cómo adaptar modelos de lenguaje pequeños a un estilo literario concreto mediante técnicas accesibles de fine-tuning. Sin embargo, su reducida capacidad limita la coherencia en textos largos, como advierte el propio autor en la model card. El modelo se distribuye como un conjunto de archivos de PyTorch (config.json, tokenizer, pesos .pth) y requiere un script específico para la generación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con atención softmax (basado en MiniMind) |
| Parametros totales | 104 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en precisión completa .pth) |
| Idiomas soportados | Chino (presumiblemente, no especificado explícitamente) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pth), config.json, tokenizer |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer estándar con atención softmax y generación autoregresiva, siguiendo el diseño de la familia MiniMind. El entrenamiento se realizó en dos fases: primero un pretrain sobre 18 793 segmentos de prosa de Yu Hua, con inicialización cálida (warm-start) desde los pesos del modelo MiniMind-GuCheng-AR; después un ajuste fino supervisado con 522 muestras de razonamiento encadenado (CoT) durante 10 épocas, donde cada muestra estructura la generación en tres pasos: concepción (构思), tono (基调) y texto final (正文). Esta metodología de CoT aplicada a la generación literaria es la principal innovación del trabajo, aunque no se documentan detalles sobre el dataset de pretrain, el tokenizador o la configuración exacta del entrenamiento.

## Capacidades

- Generación de texto en prosa con estilo imitativo de Yu Hua, incluyendo narrativa descriptiva y tono melancólico característico del autor.
- Generación estructurada mediante CoT: el modelo primero planifica la concepción y el tono antes de redactar el texto final, lo que permite un cierto control sobre la dirección creativa.
- Generación por lotes mediante el script `gen_yuhua_batch.py`, que automatiza el proceso de CoT.
- Soporte limitado para textos cortos o fragmentos; la coherencia se degrada en textos largos según la advertencia del autor.
- No dispone de capacidades de tool calling, razonamiento avanzado, visión ni soporte multilingüe más allá del chino.

## Casos de uso

- Generación de cuentos cortos y microrrelatos con estilo literario: el modelo puede producir borradores de ficción breve que imitan la voz de Yu Hua, útiles para escritores que buscan inspiración o variaciones estilísticas.
- Experimentación pedagógica en talleres de escritura: se puede usar como herramienta para analizar cómo un modelo pequeño captura patrones estilísticos y qué elementos del lenguaje resultan más difíciles de replicar.
- Investigación en fine-tuning de modelos pequeños: sirve como caso de estudio para evaluar el impacto del warm-start y del entrenamiento CoT en la calidad de generación literaria con recursos computacionales mínimos.
- Prototipado de aplicaciones de generación de contenido creativo en chino: aunque limitado a textos breves, puede integrarse en demos o pruebas de concepto para generación de narrativa.
- Comparación de estilos entre autores: al existir un modelo hermano para Gu Cheng, se pueden contrastar las salidas de ambos para estudiar diferencias estilísticas entre escritores.
- Generación de diálogos o fragmentos narrativos para juegos de rol o ficción interactiva: su bajo coste de inferencia permite ejecutarlo en entornos sin GPU, aunque la coherencia a largo plazo no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 104 M de parámetros, la inferencia en fp32 requiere aproximadamente 416 MB de memoria (solo pesos), por lo que cabe holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050) o simplemente una CPU con 4 GB de RAM.
- Despliegue: no se proporcionan archivos GGUF ni integraciones con vLLM u Ollama; el modelo se ejecuta mediante los scripts de Python incluidos en el repositorio (carga de `model_minimind.py` y `gen_yuhua_batch.py`).
- Latencia y throughput: no disponibles, pero dado el tamaño, la generación de textos cortos debería ser casi instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo. El único modelo directamente comparable es el hermano MiniMind-GuCheng-AR, también de 104 M y mismo autor, pero entrenado con el estilo de Gu Cheng. Otros modelos de generación de texto en chino de tamaño similar (p. ej., GPT-2 chino de 100 M) existen, pero no se dispone de información suficiente para una comparación rigurosa en este contexto.

## Limitaciones y advertencias

- Coherencia limitada en textos largos: el autor advierte que con 104 M de parámetros la continuidad narrativa se resiente, apareciendo ocasionalmente "collage absurdo" en el texto final.
- Sesgos no evaluados: no hay información sobre sesgos de género, culturales o políticos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: al ser un modelo pequeño y entrenado con un corpus limitado, puede generar contenido factualmente incorrecto o inventado, aunque en un contexto literario esto puede ser aceptable.
- Licencia no especificada: no se indica licencia de uso, lo que impide determinar si es apto para uso comercial o requiere atribución. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Idioma: solo se ha entrenado con texto en chino, por lo que no es útil para otros idiomas.
- Formato de pesos propietario: al no ofrecer conversiones a GGUF o safetensors, la integración con herramientas estándar del ecosistema (llama.cpp, Ollama, TGI) no es directa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shikunpunk/MiniMind-YuHua-AR)
- [Modelo hermano MiniMind-GuCheng-AR](https://huggingface.co/shikunpunk/MiniMind-GuCheng-AR)
- [Proyecto MiniMind (entrenamiento de LLMs desde cero)](https://jingyaogong.github.io/minimind/)
