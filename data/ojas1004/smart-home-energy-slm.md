# Ojas1004/smart-home-energy-slm

## Resumen

Smart-Home Appliance Energy SLM es un adaptador LoRA sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por Ojas1004, orientado a responder preguntas de corto horizonte (entre 10 minutos y 24 horas) sobre el consumo eléctrico de electrodomésticos en un hogar. El modelo no es un modelo fundacional entrenado desde cero, sino un ajuste fino supervisado (SFT) con LoRA sobre un modelo instructivo de 0,5 mil millones de parámetros, lo que lo convierte en una pieza ligera y desplegable en hardware modesto dentro de un hub doméstico de energía.

El problema que aborda es acotado pero concreto: interpretar lecturas de un medidor agregado (vatios-hora por intervalos de 10 minutos) y responder con clasificaciones, comparaciones y estimaciones aproximadas, rechazando explícitamente preguntas que los datos del medidor no pueden sostener (ocupación, consumo por electrodoméstico individual, tarifas o fallos). Está entrenado sobre un dataset de instrucciones derivado del conjunto UCI *Appliances Energy Prediction* (Candanedo et al., 2017), correspondiente a una vivienda de bajo consumo en Bélgica entre enero y mayo de 2016.

Su relevancia actual es la de un ejemplo de *small language model* (SLM) especializado y con comportamiento de abstención controlado: un adaptador de apenas decenas de megabytes que se entrena en una GPU de portátil de 8 GB en aproximadamente 1,5 horas y que prioriza la fidelidad al contexto sobre el conocimiento general. No compite en capacidades generales con modelos mayores; su valor está en la delimitación estricta del dominio y en la política de "no se puede determinar" para preguntas fuera de evidencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA (r=16, alpha=32, dropout 0.05, todas las capas lineales) |
| Parámetros totales | 0,5 mil millones (modelo base); el adaptador LoRA añade un conjunto reducido de parámetros entrenables no especificado en la información disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de longitud máxima de entrenamiento; la ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5, pero no se documentan en la ficha) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El ajuste se realizó con `SFTTrainer` de TRL, con rango r=16, alpha=32, dropout 0.05 y adaptadores en todas las capas lineales. Se entrenó durante 2 épocas (1.564 pasos con batch efectivo de 32), tasa de aprendizaje 2e-4 con schedule coseno y 50 pasos de calentamiento, longitud máxima de 512 tokens y precisión bf16. El entrenamiento se completó en aproximadamente 1,5 horas en una única GPU RTX 5060 Laptop de 8 GB.

Los datos provienen del split de entrenamiento del dataset Ojas1004/smart-home-energy-slm, con 25.027 pares prompt/completación construidos a partir del conjunto UCI *Appliances Energy Prediction*. La pérdida se calcula únicamente sobre las completaciones, lo que concentra el aprendizaje en las respuestas y no en los prompts. La innovación técnica destacable no está en la arquitectura, sino en el diseño del dataset: incluye tareas de rechazo y trampa (preguntas no respondibles, confusión de unidades o costes, premisas falsas, uso de las variables de ruido rv1/rv2 y comparaciones con sensores exteriores) para enseñar al modelo a abstenerse cuando la evidencia del medidor no basta.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas breves orientadas a preguntas sobre consumo eléctrico de electrodomésticos.
- Clasificación de niveles de consumo (por ejemplo, a partir de una lectura en Wh por intervalo de 10 minutos).
- Comparación de lecturas entre intervalos temporales y explicación de tendencias a corto plazo.
- Estimación aproximada de consumo futuro (pronósticos puntuales, no intervalos de confianza).
- Abstención explícita: responde "cannot be determined" ante preguntas sobre ocupación, consumo por electrodoméstico individual, tarifas o fallos, que los datos del medidor agregado no permiten responder.
- Detección de premisas falsas y de preguntas trampa incluidas en el dataset de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente de un hub doméstico de energía: el modelo responde en lenguaje natural a preguntas del usuario sobre las lecturas recientes del medidor (por ejemplo, "¿cómo clasificarías este consumo?"), usando únicamente la evidencia incluida en el prompt y absteniéndose cuando la pregunta excede lo que el medidor puede saber.
- Clasificación automática de picos de consumo: integrado en un pipeline que pasa la lectura de 10 minutos al modelo, este etiqueta el nivel de consumo y genera una explicación breve para el panel de la vivienda; su tamaño de 0,5B permite ejecutarlo en local sin GPU dedicada.
- Generación de resúmenes diarios de consumo: el modelo puede redactar explicaciones a partir de series horarias suministradas en el prompt, siempre que las sumas se calculen en código y el modelo solo las describa, dada su limitación aritmética documentada.
- Filtro de preguntas no respondibles en un chatbot de energía: su entrenamiento explícito en tareas de rechazo lo hace adecuado como primera capa que deriva a un humano o a otra fuente las consultas sobre tarifas, fallos o consumo por aparato.
- Prototipado e investigación de SLM especializados: sirve como referencia reproducible de ajuste LoRA con TRL sobre un dataset de dominio, entrenable en una GPU de portátil de 8 GB en hora y media.
- Educación y demos de eficiencia energética: permite construir una demo interactiva que explique el consumo de una vivienda concreta y señale los límites de lo que un medidor agregado puede afirmar.
- Evaluación de comportamiento de abstención: útil como banco de pruebas para medir la tasa de rechazo correcto en preguntas con premisas falsas o datos insuficientes.

## Benchmarks y rendimiento

Los únicos datos publicados son de validación interna y una comprobación puntual, no benchmarks estándar (MMLU, HumanEval, GSM8K no disponibles).

| Métrica | Paso 200 | Paso 600 | Paso 1000 | Paso 1400 | Paso 1564 (final) |
|---|---|---|---|---|
| Pérdida de validación | 0,074 | 0,051 | 0,044 | 0,040 | 0,040 |
| Precisión de token | 97,5% | 98,0% | 98,3% | 98,5% | 98,5% |

Split de validación: 4.342 ejemplos. Comprobación puntual con un ejemplo de test por tarea (14 tareas): 10 coincidencias exactas; todas las tareas de rechazo y trampa (no respondible, unidades/coste, premisa falsa, variables de ruido rv1/rv2, sensor exterior en comparación de habitaciones) se respondieron correctamente. La evaluación completa por tarea sobre el conjunto de test está pendiente según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo base de 0,5B ocupa aproximadamente 1 GB de pesos más el adaptador LoRA; con overhead de activaciones y caché KV, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 5060 Laptop); también A100/H100 para despliegues por lotes, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, y el entrenamiento del adaptador se realizó en una RTX 5060 Laptop de 8 GB.
- Opciones de despliegue: `transformers` + `peft` con `AutoPeftModelForCausalLM` (método documentado por el autor); al ser un adaptador PEFT, puede servirse con vLLM o TGI fusionando el adaptador con el modelo base, y con llama.cpp/Ollama tras convertir a GGUF, aunque estas rutas no se documentan en la ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart-Home Appliance Energy SLM (este) | 0,5B (base) + LoRA | 512 tokens de entrenamiento | Energía doméstica, abstención controlada | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | Ventana nativa de Qwen2.5 (no detallada aquí) | Propósito general, instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | Ventana nativa de Qwen2.5 (no detallada aquí) | Propósito general, mayor capacidad | Apache 2.0 | Hugging Face |
| Modelos de predicción de consumo (p. ej. los de Candanedo et al., 2017) | No aplica (modelos estadísticos/ML) | No aplica | Predicción numérica de consumo | CC BY 4.0 en los datos | Literatura académica |

La comparación relevante es frente a su modelo base: este adaptador sacrifica generalidad por fidelidad al dominio y abstención, con un coste de entrenamiento mínimo. Frente a modelos de predicción clásicos, ofrece interfaz conversacional pero menor fiabilidad aritmética, por lo que no sustituye a un modelo numérico de pronóstico.

## Limitaciones y advertencias

- Aritmética y datos de calendario poco fiables: en la comprobación puntual el modelo sumó mal tres valores horarios y dio un día de la semana incorrecto; en producción, las sumas y fechas deben calcularse en código y el modelo limitarse a explicarlas.
- Los pronósticos son estimaciones puntuales aproximadas (por ejemplo, 600 Wh frente a 640 Wh esperados), sin intervalos de confianza.
- Entrenado con datos de una única vivienda de bajo consumo en Bélgica (enero-mayo de 2016); umbrales como "pico" son específicos de esa vivienda y no generalizan sin reajuste.
- Idioma limitado al inglés; no se documenta soporte de castellano.
- Riesgo de alucinación en preguntas que exijan conocimiento externo al prompt, aunque el entrenamiento en rechazo mitiga parcialmente este comportamiento.
- Sesgos conocidos: no documentados en la información disponible; el dataset de origen procede de un único hogar, lo que introduce sesgo de dominio y de condiciones climáticas.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de origen (UCI Appliances Energy Prediction) está bajo CC BY 4.0, lo que exige atribución.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa ni evaluación completa del conjunto de test.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su uso en pipelines agénticos sin verificación previa.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Ojas1004/smart-home-energy-slm
- Dataset de entrenamiento: https://huggingface.co/datasets/Ojas1004/smart-home-energy-slm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Artículo de referencia (Candanedo et al., 2017): *Data driven prediction models of energy use of appliances in a low-energy house*, Energy and Buildings, 140, 81-97
- Dataset UCI Appliances Energy Prediction: https://archive.ics.uci.edu/dataset/374/appliances+energy+prediction
- Artículo relacionado encontrado en la búsqueda: https://ijsrem.com/uploads/production/AI-Based-Smart-Home-Energy-Management-System.pdf
