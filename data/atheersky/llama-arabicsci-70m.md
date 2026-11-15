# AtheerSky/Llama-ArabicSci-70M

## Resumen

Llama-ArabicSci-70M es un modelo de lenguaje de pequeno tamano (SLM) de aproximadamente 70 millones de parametros, desarrollado por AtheerSky y entrenado desde cero sobre la arquitectura Llama. Su proposito es generar cuentos infantiles en arabe estandar moderno (MSA) enriquecidos con hechos cientificos simplificados sobre espacio, fisica, meteorologia, ciencias de la Tierra y biologia animal. El modelo se distribuye con licencia MIT y esta pensado para fines educativos y de divulgacion cientifica infantil en lengua arabe.

A diferencia de los modelos multilingues de gran escala, este modelo se ha especializado en un dominio muy concreto: la narracion cientifica infantil en arabe. Utiliza una tokenizacion BPE a nivel de byte con un vocabulario reducido de 8.192 tokens, ajustado al corpus de entrenamiento, y una ventana de contexto de solo 256 tokens (con 512 posiciones maximas en los embeddings). Su tamano reducido lo hace ejecutable en hardware muy modesto, incluso en CPU.

El modelo es relevante por cubrir un nicho poco atendido por los grandes modelos multilingues: la generacion de contenido cientifico infantil de calidad en arabe. No obstante, sus dimensiones (70M de parametros, contexto de 256 tokens) limitan severamente su uso en tareas generales de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only con GQA, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | ~70M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max position embeddings: 512) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | arabe (MSA) e ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (formato estandar de transformers; no se documentan GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo Llama, con atencion de consultas agrupadas (GQA) con 8 cabezas de atencion y 4 cabezas KV, activaciones SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). La dimension oculta es de 512 y la dimension intermedia de 1.408, con un vocabulario personalizado de 8.192 tokens basado en BPE a nivel de byte.

El entrenamiento se realizo sobre el dataset AtheerSky/ArabicSci_Story, compuesto por 30.000 cuentos cientificos infantiles en arabe. Se empleo el optimizador AdamW con tasa de aprendizaje 3e-4, weight decay de 0.1, un scheduler de tasa de aprendizaje coseno y entrenamiento en precision mixta. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto narrativo en arabe estandar moderno orientado a cuentos infantiles.
- Incorporacion de hechos cientificos simplificados sobre espacio, fisica, meteorologia, ciencias de la Tierra y biologia animal.
- Generacion condicionada por prompt con muestreo (temperature, top-k, repetition penalty) segun el ejemplo de la model card.
- Soporte de tokenizacion BPE a nivel de byte con vocabulario personalizado de 8.192 tokens.
- Capacidad bilingue declarada (arabe e ingles), aunque el entrenamiento se centra en MSA.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Generacion de cuentos infantiles cientificos en arabe: el modelo produce narraciones coherentes de tematica cientifica a partir de un prompt inicial, adecuado para editoriales educativas y plataformas de contenido infantil en lengua arabe.
- Material didactico para aulas: docentes pueden generar relatos breves que introduzcan conceptos de fisica, astronomia o biologia adaptados a edades tempranas, aprovechando el entrenamiento especifico del modelo en este dominio.
- Prototipado rapido en entornos con recursos limitados: al tener ~70M de parametros, puede ejecutarse en CPU o GPU de gama baja, lo que facilita experimentos de generacion de texto en arabe sin infraestructura dedicada.
- Aplicaciones educativas offline: su tamano reducido permite integrarlo en dispositivos con poca memoria para generar contenido de divulgacion cientifica infantil sin conexion.
- Investigacion en modelos de lenguaje de bajo recurso: sirve como caso de estudio de entrenamiento desde cero de un SLM especializado en un dominio e idioma concretos, con vocabulario adaptado.
- Generacion de borradores de contenido para plataformas de lectura infantil: el modelo puede producir versiones iniciales de relatos que luego se revisan y editan por parte de autores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~70M de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 280 MB; en fp16/bf16, unos 140 MB. La VRAM necesaria para inferencia es, por tanto, inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs integradas pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU.
- Opciones de despliegue: transformers (libreria documentada por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni variantes GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ArabicSci-70M | ~70M | 256 tokens | ar, en | MIT | Hugging Face |
| Modelos Llama de Meta (familia) | desde 1B en adelante | 2K-128K segun version | multilingue | Llama license | Hugging Face |
| Modelos arabes especializados de gran escala | no disponible | no disponible | ar | variable | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables directos de 70M especializados en cuentos cientificos infantiles en arabe en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (256 tokens), lo que limita la generacion de textos largos y el mantenimiento de coherencia en conversaciones multi-turno.
- Entrenado exclusivamente sobre cuentos cientificos infantiles en arabe, por lo que su rendimiento fuera de ese dominio sera muy limitado.
- Riesgo elevado de alucinacion en hechos cientificos, especialmente dado el tamano reducido del modelo y la falta de datos de evaluacion.
- Sesgos potenciales derivados del corpus de entrenamiento (30.000 cuentos) no documentados por el autor.
- Capacidad bilingue declarada (ar, en) pero no respaldada por detalles de composicion del dataset; el foco real es el arabe.
- Licencia MIT, que permite uso comercial, pero el autor no documenta garantias de calidad ni condiciones adicionales.
- Sin datos de benchmarks publicados, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- No se documentan variantes cuantizadas ni soporte para herramientas de despliegue eficiente como vLLM o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtheerSky/Llama-ArabicSci-70M
- Dataset de entrenamiento: https://huggingface.co/datasets/AtheerSky/ArabicSci_Story
