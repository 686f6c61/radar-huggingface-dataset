# mradermacher/Fikr-7B-Reasoning-i1-GGUF

## Resumen

Fikr-7B-Reasoning-i1-GGUF es una colección de cuantizaciones GGUF del modelo Fikr-7B-Reasoning, desarrollado por Hatim2221 y cuantizado por mradermacher. El modelo original está diseñado específicamente para tareas de razonamiento y matemáticas, con soporte para árabe e inglés, y emplea técnicas de chain-of-thought. Según los metadatos, el modelo base se construyó sobre la arquitectura Qwen (probablemente Qwen2.5-7B) y fue afinado con Unsloth, aunque no se proporcionan detalles adicionales sobre el entrenamiento.

Esta versión GGUF permite ejecutar el modelo en hardware de consumo gracias a la cuantización, con opciones que van desde 2 GB hasta 6,4 GB de tamaño de archivo. Es relevante para desarrolladores que necesitan un modelo de razonamiento matemático bilingüe (árabe-inglés) en entornos con recursos limitados, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base usa arquitectura Qwen según tags, sin confirmar) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | arabe, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Fikr-7B-Reasoning. Los metadatos indican que se basa en la familia Qwen (etiqueta `qwen`) y que fue afinado con Unsloth, una herramienta de fine-tuning eficiente. El modelo esta orientado a razonamiento, matematicas y chain-of-thought, lo que sugiere un entrenamiento con datos de instrucciones y posiblemente con tecnicas de RLHF o DPO, aunque no se confirma. La cuantizacion i1 (imatrix) aplicada por mradermacher utiliza matrices de importancia para mejorar la calidad de los quants de baja precision, pero no altera la arquitectura subyacente.

## Capacidades

- Razonamiento logico y matematico: el modelo esta especializado en resolver problemas que requieren pasos intermedios de deduccion.
- Generacion de cadenas de pensamiento (chain-of-thought): produce explicaciones paso a paso antes de dar la respuesta final.
- Soporte bilingue arabe-ingles: puede alternar entre ambos idiomas en una misma conversacion.
- Comprension y generacion de texto en contextos educativos y tecnicos.
- No se ha confirmado soporte para tool calling, funciones de agente, vision o audio.

## Casos de uso

- Asistente educativo de matematicas en arabe: el modelo puede resolver problemas aritmeticos, algebraicos o geometricos y explicar el procedimiento en arabe, util para estudiantes y profesores.
- Tutor de razonamiento logico en ingles: genera ejercicios de logica y evalua las respuestas del usuario, proporcionando retroalimentacion detallada.
- Generacion de contenido didactico bilingue: crea problemas de practica y soluciones explicadas en arabe e ingles para plataformas de e-learning.
- Analisis de datos financieros simples: interpreta tablas numericas y produce informes en lenguaje natural con calculos justificados.
- Chatbot de soporte tecnico en arabe: responde consultas de usuarios que requieren pasos de diagnostico o calculos, manteniendo un hilo conversacional.
- Prototipado rapido de aplicaciones de razonamiento: al ser un modelo GGUF, puede integrarse en entornos locales (llama.cpp, Ollama) para pruebas de concepto sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para i1-Q4_K_M (4,8 GB) se recomienda al menos 6-8 GB de VRAM; para i1-Q2_K (3,1 GB) bastan 4-6 GB; para i1-Q6_K (6,4 GB) se necesitan 8-10 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden ejecutar las cuantizaciones mas bajas. Para las mas altas, se recomienda RTX 3090 o 4090.
- Compatibilidad con consumer GPU: si, las cuantizaciones de 2-5 GB caben en GPUs de 8 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se estima una velocidad de 40-60 tokens/s, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de razonamiento de 7B (como Qwen2.5-7B-Instruct, Llama-3.1-8B o Mistral-7B). Los datos de rendimiento y arquitectura de Fikr-7B-Reasoning no estan publicados, por lo que no es posible realizar una comparacion objetiva.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision, especialmente en las variantes de menor tamano (IQ1, IQ2). Para tareas de razonamiento critico se recomienda usar Q4_K_M o superior.
- El modelo esta limitado a arabe e ingles; su rendimiento en otros idiomas no esta garantizado.
- No se ha verificado la robustez frente a sesgos o alucinaciones. Al ser un modelo de razonamiento, puede generar respuestas logicamente coherentes pero factualmente incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede afectar a tareas con entradas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fikr-7B-Reasoning-i1-GGUF
- Modelo base: https://huggingface.co/Hatim2221/Fikr-7B-Reasoning
- Pagina de descargas alternativa: https://hf.tst.eu/model#Fikr-7B-Reasoning-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
