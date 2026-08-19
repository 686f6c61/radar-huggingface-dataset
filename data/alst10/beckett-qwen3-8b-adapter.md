# alst10/beckett-Qwen3-8B-adapter

## Resumen

El modelo `alst10/beckett-Qwen3-8B-adapter` es un adaptador PEFT (QLoRA) desarrollado por alst10 sobre el modelo base Qwen/Qwen3-8B, especializado en capturar el estilo literario, la estructura y el ritmo del dramaturgo Samuel Beckett. Se trata de un fine-tuning de dos fases: primero una continuación del preentrenamiento (CPT) sobre las obras dramáticas completas de Beckett para absorber su vocabulario y sintaxis minimalista, y después un ajuste supervisado (SFT) con un conjunto de obras teatrales formateadas como pares instrucción-respuesta, enseñando al modelo las reglas estructurales de un guion (nombres de personajes, acotaciones, diálogos) manteniendo la voz estilística aprendida.

El adaptador pesa 0,2 GB y se distribuye en formato safetensors, con licencia Apache 2.0. Al estar basado en Qwen3-8B, hereda la arquitectura transformer de 8.000 millones de parámetros y una ventana de contexto de 32.000 tokens, aunque el fine-tuning orienta el modelo casi exclusivamente hacia la generación de texto dramático en inglés. Su relevancia radica en ofrecer una herramienta especializada para creadores, investigadores teatrales y desarrolladores de aplicaciones de escritura creativa que necesiten un generador de diálogos y escenas con un estilo muy concreto, sin necesidad de entrenar un modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) con adaptador QLoRA |
| Parametros totales | 8.000 millones (modelo base) + adaptador (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) durante el entrenamiento; el adaptador puede cargarse en 4-bit, 8-bit o 16-bit segun el uso |
| Idiomas soportados | Ingles (principal, por el fine-tuning en obras de Beckett); el modelo base Qwen3-8B soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-8B, un modelo transformer denso con 8.000 millones de parametros, arquitectura de solo decodificador y atencion por ventana deslizante con soporte de contexto largo. El fine-tuning se realizo con la libreria Unsloth y PEFT, utilizando cuantizacion de 4 bits (bitsandbytes) sobre una NVIDIA RTX A6000. El proceso de entrenamiento consto de dos fases: una continuacion del preentrenamiento (CPT) sobre las obras dramaticas completas de Samuel Beckett, y un ajuste supervisado (SFT) con un dataset de obras teatrales formateadas como pares instruccion-respuesta. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni la metodologia de evaluacion. El adaptador no introduce cambios arquitectonicos sobre el modelo base, solo ajusta los pesos mediante low-rank adaptation.

## Capacidades

- Generacion de texto dramatico en el estilo de Samuel Beckett: escenas, dialogos, monologos y acotaciones con su caracteristico minimalismo y tono existencialista.
- Comprension y reproduccion de la estructura formal de un guion teatral (nombres de personajes, indicaciones de escena, formato de dialogo).
- Escritura creativa con instrucciones en lenguaje natural, por ejemplo: "Escribe una escena corta al estilo de Beckett donde dos personajes esperan un tren".
- Hereda las capacidades generales del modelo base Qwen3-8B: generacion de texto, razonamiento, codigo y matematicas, aunque el fine-tuning puede haber reducido su rendimiento en tareas no relacionadas con la literatura.
- Soporte de tool calling y function calling del modelo base, aunque no se ha verificado su funcionamiento tras el fine-tuning.
- Capacidad multilingue limitada: el modelo base soporta varios idiomas, pero el adaptador esta entrenado principalmente en ingles.

## Casos de uso

- Escritura de obras de teatro originales: un dramaturgo puede usar el modelo para generar borradores de escenas o dialogos completos que luego refine manualmente, aprovechando la fidelidad estilistica al universo beckettiano.
- Generacion de contenido para producciones teatrales: companias o directores pueden solicitar variaciones de escenas clasicas o nuevas piezas cortas para montajes experimentales.
- Herramienta de apoyo para estudiantes de literatura: el modelo puede generar ejemplos de estilo beckettiano para analisis comparativo o practicas de escritura creativa en cursos de teatro.
- Creacion de chatbots o personajes virtuales con personalidad literaria: integrando el adaptador en un sistema de dialogo, se puede construir un personaje que hable con la voz de un personaje de Beckett.
- Adaptacion de obras existentes: el modelo puede reescribir escenas de otros autores imitando el estilo de Beckett, util para proyectos de remezcla o homenaje.
- Prototipado rapido para desarrolladores de aplicaciones de escritura asistida: el adaptador, al ser ligero (0,2 GB), puede integrarse en aplicaciones locales o en la nube sin necesidad de un modelo completo de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de escritura creativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-8B requiere aproximadamente 16 GB en precision FP16, unos 8 GB en cuantizacion de 8 bits y alrededor de 4-5 GB en cuantizacion de 4 bits. El adaptador anade un coste minimo adicional.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A6000 o superiores para ejecucion en 4-bit; GPUs con 24 GB o mas para precision completa.
- Compatibilidad con GPUs de consumo: si, cabe en una RTX 3060 de 12 GB con cuantizacion de 4 bits, aunque con limitaciones de velocidad.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, ademas de la libreria PEFT y Unsloth para integracion en Python.
- Latencia y throughput: no se han publicado mediciones especificas para este adaptador; dependera de la GPU y de la cuantizacion utilizada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este adaptador, por lo que la comparativa se basa en caracteristicas generales de los modelos base.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| alst10/beckett-Qwen3-8B-adapter | 8B + adaptador | 32K | Apache 2.0 | Escritura teatral estilo Beckett |
| Qwen/Qwen3-8B (base) | 8B | 32K | Apache 2.0 | Generico, multilingue |
| meta-llama/Llama-3.1-8B | 8B | 128K | Llama 3.1 | Generico, multilingue |
| mistralai/Mistral-7B-v0.3 | 7B | 32K | Apache 2.0 | Generico, multilingue |

El adaptador se diferencia de los modelos base por su especializacion en un estilo literario concreto, lo que lo hace mas adecuado para tareas de escritura creativa teatral, aunque pierde versatilidad en otras areas.

## Limitaciones y advertencias

- El modelo esta fuertemente sesgado hacia el estilo de Samuel Beckett; puede producir textos excesivamente imitativos o estereotipados, y no es adecuado para generar otros estilos literarios sin un reentrenamiento adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar citas, nombres o referencias inexistentes, especialmente en contextos historicos o biograficos.
- Limitacion de idioma: el adaptador esta entrenado principalmente en ingles; el rendimiento en otros idiomas puede ser deficiente o producir mezclas extrañas.
- El fine-tuning puede haber degradado las capacidades generales del modelo base (razonamiento, codigo, matematicas), por lo que no se recomienda su uso para tareas no literarias.
- No se han publicado evaluaciones de seguridad, sesgos o robustez; el modelo podria generar contenido ofensivo o inapropiado si se le solicita.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte oficial.
- El repositorio no incluye informacion sobre el dataset de entrenamiento, lo que dificulta auditar su procedencia y posibles problemas de derechos de autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/alst10/beckett-Qwen3-8B-adapter
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de Qwen3 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
