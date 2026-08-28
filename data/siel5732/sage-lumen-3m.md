# siel5732/sage-lumen-3m

## Resumen

SAGE-Lumen-3M es un modelo de lenguaje ultracompacto de aproximadamente 2,75 millones de parámetros activos, desarrollado por siel5732 (Zachary Sielaff) y publicado en Hugging Face con licencia MIT. A diferencia de los chatbots de propósito general, este modelo está diseñado específicamente como un simulador de razonamiento físico simbólico y transiciones de estado, orientado a la ejecución offline en nodos edge o homelab, como APUs AMD Ryzen. Su arquitectura es un transformer decoder de 4 capas con atención multi-query (MQA), embeddings rotatorios (RoPE), MLP SwiGLU y normalización RMSNorm, entrenado con el optimizador Muon.

El modelo se especializa en tres dominios concretos: paseos cuánticos discretos en el tiempo (DTQW), trayectorias de ODEs biofísicas (acoplamiento insulina-glucosa y neovascularización de islotes) y predicción de trayectorias de G-code no planares con corrección de warp por efectos térmicos. Su vocabulario está limitado a 2048 tokens BPE, lo que restringe su uso a tareas muy específicas. El repositorio no contiene pesos (0.0 GB) y no se han publicado benchmarks, por lo que su rendimiento real no ha sido verificado de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (4 capas, MQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 2.754.816 (tied embeddings) |
| Parametros activos | 2.754.816 (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo vacío, probablemente PyTorch/safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estándar pero adaptada a un tamaño mínimo: 4 capas, 4 cabezas de consulta y 1 cabeza clave-valor (Multi-Query Attention), lo que reduce significativamente el número de parámetros y el coste de inferencia. Las posiciones se codifican con RoPE, y la normalización se realiza con RMSNorm. El MLP de cada capa usa activación SwiGLU con dimensión intermedia de 512. Los embeddings de entrada y salida están atados (tied embeddings), lo que explica la cifra de 2,75 millones de parámetros.

El entrenamiento emplea el optimizador Muon, que aplica precondicionamiento matricial en proyecciones 2D y AdamW en variables 1D, una técnica pensada para mejorar la convergencia en modelos pequeños. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que el modelo está optimizado para ejecución en CPU/APU de bajo consumo, lo que sugiere un entrenamiento orientado a eficiencia extrema.

## Capacidades

- Simulación de paseos cuánticos discretos en el tiempo (DTQW) en 1-D con operaciones de moneda de Hadamard.
- Modelado de trayectorias de ODEs biofísicas, incluyendo acoplamientos homeostáticos insulina-glucosa y neovascularización de islotes celulares.
- Predicción de trayectorias de G-code no planares, con corrección dinámica del eje Z frente a efectos térmicos mecánicos.
- Razonamiento simbólico sobre transiciones de estado en sistemas físicos discretos.
- Generación de texto limitada al vocabulario de 2048 tokens, adecuada para salidas técnicas muy específicas.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso general.

## Casos de uso

- Simulación educativa de paseos cuánticos: el modelo puede generar secuencias de estados de posición para un paseo cuántico con moneda de Hadamard, útil en entornos docentes o de prototipado rápido sin necesidad de librerías de simulación cuántica.
- Modelado de sistemas biológicos simplificados: permite estimar trayectorias de acoplamiento insulina-glucosa o de neovascularización en modelos reducidos, como apoyo a investigación preliminar en biología matemática.
- Generación de trayectorias de G-code para impresión 3D: puede predecir correcciones de warp en el eje Z basadas en condiciones térmicas, ayudando a ajustar parámetros de impresión en tiempo real en máquinas de bajo coste.
- Ejecución en dispositivos edge: al ser un modelo de menos de 3 millones de parámetros, puede desplegarse en microcontroladores o APUs de bajo consumo para control de procesos en tiempo real sin conexión a la nube.
- Prototipado de modelos de lenguaje especializados: sirve como referencia para investigar técnicas de entrenamiento con optimizadores como Muon en dominios físicos concretos.
- Automatización de tareas de razonamiento simbólico en entornos sin GPU: su pequeño tamaño permite integrarlo en pipelines de análisis de datos científicos en máquinas sin aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, y el repositorio no contiene pesos ni scripts de evaluación. El único indicador mencionado es "causal-entropy-loss", pero sin valores concretos.

## Requisitos de hardware

- VRAM estimada: con 2,75 millones de parámetros, en float32 ocupa aproximadamente 11 MB; en cuantización de 8 bits o 4 bits, menos de 3 MB. Cabe en cualquier GPU moderna, incluso en iGPUs.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU, incluyendo APUs AMD Ryzen con iGPU, o en microcontroladores con suficiente RAM.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 1 GB de VRAM es suficiente, aunque no es necesario.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque su tamaño permite también inferencia directa en Python sin frameworks adicionales.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una latencia de milisegundos en CPU moderna y throughput alto incluso en hardware limitado.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo nicho (simulación física simbólica con menos de 3M parámetros). Los modelos de propósito general de tamaño similar (por ejemplo, TinyStories o GPT-2 pequeño) no cubren los dominios especializados de SAGE-Lumen-3M, y no hay datos de rendimiento para establecer una comparación objetiva. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para los tres dominios declarados; fuera de ellos, su rendimiento será muy pobre o nulo.
- Vocabulario extremadamente reducido (2048 tokens), lo que limita la expresividad y la cobertura de términos técnicos fuera de los dominios entrenados.
- Solo soporta inglés; no hay capacidades multilingües.
- No se han publicado datos de entrenamiento, por lo que se desconoce la calidad y el sesgo de los datos utilizados.
- Riesgo de alucinación en salidas fuera de los dominios especializados, dado su tamaño y falta de alineación explícita.
- El repositorio no contiene pesos ni código de inferencia, solo la model card; no es posible probar el modelo actualmente.
- Licencia MIT permite uso comercial, pero al no haber pesos disponibles, la aplicabilidad práctica es nula hasta que se publiquen.
- No hay garantías de precisión en simulaciones físicas; los resultados deben validarse con métodos numéricos convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siel5732/sage-lumen-3m
- Perfil del autor en Hugging Face: https://huggingface.co/siel5732
- Perfil del autor en GitHub: https://github.com/siel5732
